import { Console, done, Lodash as _, Storage } from "@nsnanocat/util";
import { URL } from "@nsnanocat/url";
import MD5 from "crypto-js/md5.js";
import VTT from "../upstream/WebVTT/WebVTT.mjs";
import database from "../upstream/function/database.mjs";
import setENV from "../upstream/function/setENV.mjs";
import { FilmCache, filmIdentity } from "./FilmCache.mjs";
import detectFormat from "../upstream/function/detectFormat.mjs";
import Translate from "../upstream/class/Translate.mjs";

// Modified by JerseyRiver: public configuration, isolated cache revision; no embedded secrets.
const NATIVE_CACHE_KEY = "@HBOAI.Translate.Caches.NativeVTT";
const SUBTITLE_CACHE_KEY = "@HBOAI.Translate.Caches.Subtitles";
const IN_FLIGHT_KEY = "@HBOAI.Translate.State.InFlight";
const COOLDOWN_KEY = "@HBOAI.Translate.State.Cooldown";
const LOCK_TTL = 58000;
const WAIT_TIMEOUT = 48000;
const WAIT_INTERVAL = 400;
const TRANSLATION_DEADLINE = Date.now() + 55000;
const FILM_CACHE_LIMIT = 20;
let currentFilmId;
const filmCache = new FilmCache($persistentStore, FILM_CACHE_LIMIT, () => {
    // Old flat entries have no reliable ownership; clear them at the first film eviction.
    Storage.setItem(NATIVE_CACHE_KEY, []);
    Storage.setItem(SUBTITLE_CACHE_KEY, []);
});
const CUE_BOUNDARY_CACHE_REVISION = "cue-isolation-v2";
const url = new URL($request.url);
const virtualRequest = typeof $response === 'undefined';
const output = virtualRequest ? { status: 200, headers: { 'Content-Type': 'text/vtt; charset=utf-8', 'Cache-Control': 'private, max-age=60' }, body: '' } : $response;

(async () => {
    if (!virtualRequest) return;
    let context;
    try { context = JSON.parse($persistentStore.read('HBOAI.Context.v1') || '{}'); } catch { throw new Error('AI subtitle context missing'); }
    const segment = context.segments?.[$request.url];
    if (!segment || segment.expires < Date.now() || !segment.source) throw new Error('AI subtitle context expired');
    if (!/^https:\/\/[^/?#@]+\//.test(segment.source) || !/(?:^|\.)(?:e\.hbo|media\.max\.com|media\.h264\.io)$/.test(segment.source.split('/')[2])) throw new Error('Invalid subtitle source');
    currentFilmId = filmIdentity(context.plans?.[segment.id], segment.id);
    filmCache.adoptIdentity(`manifest:${segment.id}`, currentFilmId);
    const nativeKey = MD5(new URL(segment.source).pathname).toString();
    const nativeCache = Storage.getItem(NATIVE_CACHE_KEY, []);
    const cachedNative = Array.isArray(nativeCache) && nativeCache.find(entry => entry.key === MD5(segment.source).toString() && entry.expires > Date.now());
    const groupedNative = filmCache.native(currentFilmId, nativeKey);
    const nativeBody = groupedNative || cachedNative?.body;
    if (validNativeVTT(nativeBody)) {
        output.body = nativeBody;
        if (!groupedNative) filmCache.put(currentFilmId, "native", nativeKey, nativeBody);
        output.headers["X-HBO-AI-Native-Cache"] = "hit";
    } else {
        output.body = await new Promise((resolve, reject) => {
            $httpClient.get({ url: segment.source, timeout: 12000 }, (error, response, body) => {
                if (error || Number(response?.status || response?.statusCode) !== 200) return reject(new Error('English subtitle fetch failed; choose external subtitles'));
                resolve(String(body || ''));
            });
        });
        if (!validNativeVTT(output.body)) throw new Error('English subtitles unavailable; choose external subtitles');
        filmCache.put(currentFilmId, "native", nativeKey, output.body);
        output.headers["X-HBO-AI-Native-Cache"] = "miss";
    }
    output.headers["X-HBO-AI-Cache-Unit"] = "film; limit=20";

	Console.logLevel = "ERROR";
	const { Settings, Caches } = setENV("HBOAI", [["Universal", "Translate", "API"]], database);
	const argumentValue = (...keys) => {
		if (!$argument || typeof $argument !== "object") return undefined;
		for (const key of keys) {
			const direct = $argument[key];
			const nested = _.get($argument, key);
			if (direct !== undefined && direct !== null && direct !== "") return direct;
			if (nested !== undefined && nested !== null && nested !== "") return nested;
		}
		return undefined;
	};
	const liveAPIKey = argumentValue("GeminiAPIKey", "Gemini.APIKey");
	Settings.Vendor = "Gemini";
	Settings.Gemini = {
		...Settings.Gemini,
		APIKey: liveAPIKey || Settings.GeminiAPIKey || Settings.Gemini?.APIKey || "",
		Model: argumentValue("GeminiModel", "Gemini.Model") || Settings.GeminiModel || Settings.Gemini?.Model,
		BatchSize: 400,
        DeadlineAt: TRANSLATION_DEADLINE,
	};
	output.headers["X-DualSubs-Gemini-Key-Source"] = liveAPIKey ? "argument" : Settings.Gemini?.APIKey ? "storage" : "missing";
	output.headers["X-DualSubs-Gemini-Model"] = Settings.Gemini.Model;
	Console.logLevel = "WARN";
	const languages = [
		(segment.language || "AUTO").toUpperCase(),
		(url.searchParams?.get("tlang") ?? Caches?.tlang)?.toUpperCase?.() ?? Settings.Languages[1],
	];
	const body = VTT.parse(output.body);
	const fullText = body?.body.map(item => (item?.text ?? "\u200b")?.replace(/<\/?[^<>]+>/g, ""));
	const originalCacheKey = MD5(`${Settings.Vendor}|${Settings?.Gemini?.Model ?? ""}|${languages.join("|")}|${output.body}`).toString();
	const cacheKey = MD5(`${CUE_BOUNDARY_CACHE_REVISION}|${originalCacheKey}`).toString();
	output.headers["X-DualSubs-Gemini-Cache-Revision"] = CUE_BOUNDARY_CACHE_REVISION;
	let translation = readPersistentTranslation(cacheKey, fullText.length);
	if (!Array.isArray(translation) || translation.length !== fullText.length) {
		const slot = await claimTranslationSlot(cacheKey, fullText.length);
		if (slot.translation) {
			translation = slot.translation;
			output.headers["X-DualSubs-Gemini-Coordinator"] = "wait-cache-hit";
			output.headers["X-DualSubs-Gemini"] = `cache-hit; cues=${translation.length}`;
		} else {
			output.headers["X-DualSubs-Gemini-Coordinator"] = "leader";
			try {
				translation = await translator(Settings.Vendor, Settings.Method, fullText, languages, Settings?.[Settings?.Vendor], Settings?.Times, Settings?.Interval, Settings?.Exponential);
				if (Array.isArray(translation) && translation.length === fullText.length) {
					const saved = savePersistentTranslation(cacheKey, translation);
					Caches.Subtitles = saved.cache;
					output.headers["X-DualSubs-Gemini-Cache"] = `${saved.verified ? "write-ok" : "write-failed"}; films=${saved.films}; segments=${saved.size}`;
					clearCooldown();
				}
				output.headers["X-DualSubs-Gemini"] = `translated; cues=${translation.length}`;
			} catch (error) {
				setCooldown(error);
				throw error;
			} finally {
				releaseTranslationSlot(slot.owner);
			}
		}
	} else {
		// Adopt a matching legacy flat translation without another Gemini call.
		if (!filmCache.translation(currentFilmId, cacheKey)) savePersistentTranslation(cacheKey, translation);
		Console.info("Gemini 字幕缓存命中");
		output.headers["X-DualSubs-Gemini-Coordinator"] = "cache";
		output.headers["X-DualSubs-Gemini"] = `cache-hit; cues=${translation.length}`;
	}
	body.body = body.body.map((item, i) => {
		item.text = combineText(item?.text ?? "\u200b", translation?.[i], Settings?.ShowOnly, Settings?.Position);
		return item;
	});
	output.body = VTT.stringify(body);
})()
	.catch(error => {
		Console.error(error);
        if (virtualRequest) { output.status = 502; output.body = "WEBVTT\n\n"; }
		output.headers["X-DualSubs-Gemini"] = "error";
		output.headers["X-DualSubs-Gemini-Error"] = encodeURIComponent(String(error?.message ?? error)).slice(0, 180);
	})
	.finally(() => virtualRequest ? $done({ response: output }) : done(output));

function validNativeVTT(body) {
    return typeof body === "string" && /^WEBVTT(?:\s|$)/.test(body) && /\d{2}:\d{2}(?::\d{2})?\.\d{2,3}\s+-->/.test(body);
}

async function translator(vendor = "Gemini", method = "Part", text = [], [source = "AUTO", target = "ZH"], api = {}, times = 3, interval = 100, exponential = true) {
	let length = 120;
	if (vendor === "Gemini") length = Math.max(100, Math.min(600, Number.parseInt(api?.BatchSize ?? 400, 10) || 400));
	else if (["Microsoft", "Azure"].includes(vendor)) length = 99;
	else if (vendor === "DeepL") length = 49;
	else if (vendor === "DeepLX") length = 20;
	const retries = vendor === "Gemini" ? 0 : times;
	if (method === "Row") return await Promise.all(text.map(row => retry(() => new Translate({ Source: source, Target: target, API: api })[vendor](row), retries, interval, exponential)));
	if (vendor === "Gemini") {
		// Gemini tends to improve target-language word order by moving clauses
		// between neighboring subtitle cues. IDs remain valid, but the words then
		// appear at the wrong timestamps. Distribute consecutive cues across the
		// same number of API requests and restore their original order afterwards.
		const scatteredParts = scatterForCueIsolation(text, length);
		const translatedParts = await Promise.all(scatteredParts.map(part => retry(() => new Translate({ Source: source, Target: target, API: api })[vendor](part.map(item => item.text)), retries, interval, exponential)));
		const restored = new Array(text.length);
		translatedParts.forEach((translatedPart, partIndex) => {
			scatteredParts[partIndex].forEach((item, itemIndex) => {
				restored[item.index] = translatedPart[itemIndex];
			});
		});
		return restored;
	}
	const parts = chunk(text, length);
	return await Promise.all(parts.map(part => retry(() => new Translate({ Source: source, Target: target, API: api })[vendor](part), retries, interval, exponential))).then(part => part.flat(Number.POSITIVE_INFINITY));
}

function combineText(originText, transText, showOnly = false, position = "Forward", lineBreak = "\n") {
	if (showOnly) return transText;
	return position === "Reverse" ? `${transText}${lineBreak}${originText}` : `${originText}${lineBreak}${transText}`;
}

function chunk(source, length) {
	let index = 0;
	const target = [];
	while (index < source.length) target.push(source.slice(index, (index += length)));
	return target;
}

function scatterForCueIsolation(source, length) {
	const partCount = Math.max(1, Math.ceil(source.length / length));
	const parts = Array.from({ length: partCount }, () => []);
	source.forEach((text, index) => parts[index % partCount].push({ index, text }));
	return parts;
}

async function retry(fn, retriesLeft = 3, interval = 100, exponential = true) {
	try {
		return await fn();
	} catch (error) {
		if (!retriesLeft) throw error;
		await new Promise(resolve => setTimeout(resolve, interval));
		return retry(fn, retriesLeft - 1, exponential ? interval * 2 : interval, exponential);
	}
}

async function claimTranslationSlot(cacheKey, expectedLength) {
	const owner = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const startedAt = Date.now();
	while (Date.now() - startedAt < WAIT_TIMEOUT && Date.now() < TRANSLATION_DEADLINE - 2000) {
		const cached = readPersistentTranslation(cacheKey, expectedLength);
		if (cached) return { translation: cached };
		const cooldown = Storage.getItem(COOLDOWN_KEY, {});
		if (Number(cooldown?.expiresAt ?? 0) > Date.now()) {
			const waitSeconds = Math.max(1, Math.ceil((Number(cooldown.expiresAt) - Date.now()) / 1000));
			throw new Error(`Gemini 冷却中，请约 ${waitSeconds} 秒后重试：${cooldown?.reason ?? "上次请求失败"}`);
		}
		const inFlight = Storage.getItem(IN_FLIGHT_KEY, {});
		if (Number(inFlight?.expiresAt ?? 0) <= Date.now()) {
			Storage.setItem(IN_FLIGHT_KEY, { cacheKey, owner, expiresAt: Date.now() + LOCK_TTL });
			await new Promise(resolve => setTimeout(resolve, 25));
			const confirmed = Storage.getItem(IN_FLIGHT_KEY, {});
			if (confirmed?.owner === owner && confirmed?.cacheKey === cacheKey) return { owner };
		}
		await new Promise(resolve => setTimeout(resolve, WAIT_INTERVAL));
	}
	throw new Error("同一字幕正在翻译，等待缓存超时");
}

function readPersistentTranslation(cacheKey, expectedLength) {
	const cache = readPersistentSubtitleCache();
	const translation = cache.get(cacheKey);
	return Array.isArray(translation) && translation.length === expectedLength ? translation : null;
}

function readPersistentSubtitleCache() {
    let legacy = Storage.getItem(SUBTITLE_CACHE_KEY, []);
    if (typeof legacy === "string") { try { legacy = JSON.parse(legacy); } catch { legacy = []; } }
    const cache = new Map(Array.isArray(legacy) ? legacy : []);
    for (const [key, value] of Object.entries(filmCache.film(currentFilmId)?.translations || {})) cache.set(key, value);
    return cache;
}

function savePersistentTranslation(cacheKey, translation) {
    const saved = filmCache.put(currentFilmId, "translations", cacheKey, translation);
    const verified = saved.written && Boolean(filmCache.translation(currentFilmId, cacheKey));
    return { cache: new Map(Object.entries(filmCache.film(currentFilmId)?.translations || {})), size: saved.segments, films: saved.films, verified };
}

function releaseTranslationSlot(owner) {
	const inFlight = Storage.getItem(IN_FLIGHT_KEY, {});
	if (inFlight?.owner === owner) Storage.setItem(IN_FLIGHT_KEY, { cacheKey: "", owner: "", expiresAt: 0 });
}

function setCooldown(error) {
	const message = String(error?.message ?? error);
	const duration = /Gemini API 429|quota/i.test(message) ? 60000 : 8000;
	Storage.setItem(COOLDOWN_KEY, { expiresAt: Date.now() + duration, reason: message.slice(0, 120) });
}

function clearCooldown() {
	Storage.setItem(COOLDOWN_KEY, { expiresAt: 0, reason: "" });
}
