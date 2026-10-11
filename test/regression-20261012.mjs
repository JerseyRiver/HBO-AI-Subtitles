import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import VTT from '../upstream/WebVTT/WebVTT.mjs';
import { LIBRARY_KEY } from '../src/FilmCache.mjs';

const read = p => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const bundle = read('scripts/HBO.Translate.response.bundle.js');
const oldPath = new URL('../../local-fix-20261012/before/HBO.Translate.response.bundle.js', import.meta.url);
const old = fs.existsSync(oldPath) ? fs.readFileSync(oldPath, 'utf8') : null;
const id = '53395a57-ee38-4220-b07a-882eb64faf73';
const segment = `https://test.e.hbo/__hbo_ai__/${id}/ai/0/seg-0.vtt`;
const sourceURL = `https://test.e.hbo/gcs/${id}/t/en/1.vtt`;
const settings = { GeminiAPIKey: 'test-key', GeminiModel: 'test-model', 'Languages[1]': 'ZH', Position: 'Reverse', ShowOnly: 'false' };
const source = 'WEBVTT\nX-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:90000\n\n' + Array.from({ length: 9 }, (_, i) => `00:00:${String(i * 3).padStart(2, '0')}.000 --> 00:00:${String(i * 3 + 2).padStart(2, '0')}.000 position:50%\nThis is cue ${i} with its own\nsecond line.\n`).join('\n');
const originals = VTT.parse(source, { milliseconds: true, timeStamp: true, line: 'preserve', lineBreak: '\n' }).body;
function state() {
  return new Map([
    ['HBOAI.Context.v1', JSON.stringify({ plans: { [id]: { editId: 'test-edit' } }, segments: { [segment]: { id, source: sourceURL, language: 'en-US', expires: Date.now() + 60000 } } })],
    ['HBOAI', JSON.stringify({ Translate: { Settings: { Languages: ['EN', 'EN'], Position: 'Forward', ShowOnly: true }, Caches: { tlang: 'EN' } } })],
  ]);
}
async function execute({ code = bundle, store = state(), post, body = source, argument = settings, request, response }) {
  let done;
  const result = new Promise(r => done = r);
  vm.runInNewContext(code, {
    console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout, crypto: globalThis.crypto,
    $loon: {}, $script: { startTime: Date.now() },
    $request: request || { url: segment, method: 'GET', headers: {} }, ...(response ? { $response: response } : {}), $argument: argument,
    $persistentStore: { read: k => store.get(k) || null, write: (v, k) => (store.set(k, v), true) },
    $httpClient: { get: (r, cb) => cb(null, { status: 200 }, body), post }, $done: done,
  });
  let timer;
  try { return await Promise.race([result, new Promise((_, reject) => timer = setTimeout(() => reject(new Error('Regression timeout')), 5000))]); }
  finally { clearTimeout(timer); }
}
function reply(cb, translations) {
  cb(null, { status: 200 }, JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ translations }) }] } }] }));
}
function parseRequest(r) { const p = JSON.parse(r.body); return { prompt: p.systemInstruction.parts[0].text, entries: JSON.parse(p.contents[0].parts[0].text) }; }

// Reproduce the old bug: cached EN overrides explicit Chinese configuration.
if (old) {
let oldTarget;
const before = await execute({ code: old, post: (r, cb) => { const p = parseRequest(r); oldTarget = p.prompt; reply(cb, p.entries.map(x => ({ id: x.id, text: x.text }))); } });
assert.match(oldTarget, /to English\./);
assert.equal(before.response.status, 200);
}

// Fixed target, sparse global IDs, reordered model response, missing-ID repair.
const calls = [], missing = new Set(), store = state();
const result = await execute({ store, post: (r, cb) => {
  const p = parseRequest(r); calls.push(p.entries.map(x => x.id));
  assert.match(p.prompt, /to Simplified Chinese\./);
  assert.ok(p.entries.every((x, n, a) => !n || x.id - a[n - 1].id >= 3), 'Adjacent cues must not share a request');
  let translated = p.entries.map(x => ({ id: x.id, text: `台词${x.id}` })).reverse();
  if (p.entries.length > 1 && !missing.has(p.entries[0].id)) { missing.add(p.entries[0].id); translated = translated.filter(x => x.id !== p.entries[0].id); }
  reply(cb, translated);
} });
assert.equal(result.response.status, 200);
assert.equal(result.response.headers['X-HBO-AI-Target-Language'], 'ZH');
const parsed = VTT.parse(result.response.body, { milliseconds: true, timeStamp: true, line: 'preserve', lineBreak: '\n' });
assert.equal(parsed.body.length, 9);
for (let i = 0; i < 9; i++) {
  assert.equal(parsed.body[i].timing, originals[i].timing);
  assert.equal(parsed.body[i].settings, originals[i].settings);
  assert.equal(parsed.body[i].text, `台词${i}\n${originals[i].text}`);
}
assert.match(result.response.body, /MPEGTS:90000/);
const cached = await execute({ store, post: () => assert.fail('A repeated seek must use cache') });
assert.equal(cached.response.body, result.response.body);

// Reject English-only output without saving a bogus translated segment.
const bad = state();
const failure = await execute({ store: bad, post: (r, cb) => reply(cb, parseRequest(r).entries.map(x => ({ id: x.id, text: x.text }))) });
assert.equal(failure.response.status, 502);
assert.ok(JSON.parse(bad.get(LIBRARY_KEY)).films.every(f => Object.keys(f.translations || {}).length === 0));

// A poisoned cache under the current revision must be replaced, not displayed.
const poisoned = state(), hash = s => createHash('md5').update(s).digest('hex');
const key = hash('cue-isolation-v3-target-checked|' + hash(`Gemini|test-model|EN-US|ZH|${source}`));
poisoned.set(LIBRARY_KEY, JSON.stringify({ films: [{ id: 'edit:test-edit', addedAt: 1, native: {}, translations: { [key]: originals.map(x => x.text) } }] }));
let repairs = 0;
const repaired = await execute({ store: poisoned, post: (r, cb) => { repairs++; reply(cb, parseRequest(r).entries.map(x => ({ id: x.id, text: `修复${x.id}` }))); } });
assert.equal(repaired.response.status, 200); assert.ok(repairs >= 3); assert.match(repaired.response.body, /修复0/);

// Names that remain unchanged are shown once, while actual translated text is bilingual.
const name = source.replace(/This is cue 0 with its own\nsecond line\./, 'Barry');
const names = await execute({ body: name, post: (r, cb) => reply(cb, parseRequest(r).entries.map(x => ({ id: x.id, text: x.text === 'Barry' ? 'Barry' : `台词${x.id}` }))) });
assert.equal(VTT.parse(names.response.body).body[0].text, 'Barry');

// Restore Apple TV identity when quality is on; retain annotations and untouched auth headers.
const request = { url: 'https://default.any-any.prd.api.discomax.com/playback-orchestrator/any/playback-orchestrator/v1/playbackInfo', method: 'POST', headers: { 'User-Agent': 'iPad iPadOS/26', 'x-disco-client': 'IOS:test', 'x-device-info': 'Apple/iPad14,6; IOS/26', 'Content-Length': '1' }, body: JSON.stringify({ deviceInfo: { make: 'Apple', model: 'iPad14,6', platform: 'ios', deviceType: 'ios/tablet', os: { name: 'iPadOS', version: '26' }, player: { sdk: { name: 'Discovery Player ios native' }, playerView: { width: 1024, height: 768 } } }, capabilities: { devicePlatform: { videoSink: { lastKnownStatus: { width: 1024, height: 768 } } } } }) };
const rewritten = await execute({ code: read('scripts/HBO.Playback.request.js'), request, argument: { QualityCompatibility: true } });
const info = JSON.parse(rewritten.body).deviceInfo;
assert.equal(info.model, 'AppleTV14,1'); assert.equal(info.platform, 'tvos'); assert.equal(info.deviceType, 'tvos/tv'); assert.equal(info.os.name, 'TVOS'); assert.equal(info.player.sdk.name, 'Discovery Player tvos native');
assert.match(rewritten.headers['User-Agent'], /^Apple TV tvOS/); assert.match(rewritten.headers['x-disco-client'], /^TVOS:/); assert.match(rewritten.headers['x-device-info'], /AppleTV14,1/);
const untouched = await execute({ code: read('scripts/HBO.Playback.request.js'), request, argument: { QualityCompatibility: false } });
assert.deepEqual(Object.keys(untouched), []);
const annotations = [{ type: 'recap', start: 3, end: 30, label: 'Skip Recap' }, { type: 'intro', start: 30, end: 60, label: 'Skip Intro' }];
const data = { manifest: { format: 'hls', url: 'https://test.e.hbo/gcs/' + id + '/hls.m3u8' }, videos: [{ type: 'main', manifestationId: id, start: 0, duration: 1800, annotations, textTracks: [{ language: 'zh-Hans' }] }] };
const preservation = await execute({ code: read('scripts/HBO.Compatible.response.js'), request, argument: { QualityCompatibility: true }, response: { status: 200, headers: {}, body: JSON.stringify(data) } });
assert.deepEqual(JSON.parse(preservation.body).videos[0].annotations, annotations);
console.log('2026-10-12 regressions passed: legacy English target reproduced; Chinese target, invalid cache/output, sparse cue IDs, missing/reordered output, timing, optional Apple TV identity and skip annotation preservation verified.');
