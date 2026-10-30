import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code = fs.readFileSync(new URL('../upstream/hbo-quality/hbo-period-quality.response.js', import.meta.url), 'utf8');
const key = 'HBO.iPad.PeriodPlan.v1', id = '53395a57-ee38-4220-b07a-882eb64faf73';
const root = `https://test.e.hbo/gcs/${id}/`, master = root + 'hls.m3u8';
const audio = ['#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",LANGUAGE="en",CHANNELS="2",URI="aac.m3u8"', '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="eac3",NAME="English",LANGUAGE="en",CHANNELS="6",URI="dolby.m3u8"'];
const playlist = '#EXTM3U\n' + audio.join('\n') + '\n' + [
  ['1280x720', 'aac', 'mp4a.40.2', 'low-aac.m3u8'],
  ['3840x2160', 'aac', 'mp4a.40.2', 'high-aac.m3u8'],
  ['3840x2160', 'eac3', 'ec-3', 'high-dolby.m3u8'],
].map(([size, group, codec, uri], i) => `#EXT-X-STREAM-INF:BANDWIDTH=${(i + 1) * 1000000},RESOLUTION=${size},CODECS="hvc1.2.4.L153.90,${codec}",AUDIO="${group}"\n${uri}`).join('\n') + '\n';
const fresh = () => new Map([[key, JSON.stringify({ master, id, start: 0, duration: 8, expires: Date.now() + 60000, media: {}, cache: [] })]]);
async function run(video, sound, body = playlist, url = master, store = fresh(), get = () => assert.fail('Unexpected fetch')) {
  let done; const result = new Promise(resolve => done = resolve);
  const timers = [];
  vm.runInNewContext(code, { $argument: { QualityCompatibility: video, AudioQuality: sound }, $request: { url }, $response: { status: 200, body }, $persistentStore: { read: k => store.get(k), write: (v, k) => (store.set(k, v), true) }, $httpClient: { get }, console: { log() {} }, setTimeout: (...args) => { const timer = setTimeout(...args); timers.push(timer); return timer; }, $done: done });
  try { return await result; } finally { timers.forEach(clearTimeout); }
}
for (const video of [false, true]) for (const sound of [false, true]) {
  const store = fresh(), output = await run(video, sound, playlist, master, store);
  if (!video && !sound) { assert.equal(output.body, undefined); continue; }
  const plan = JSON.parse(store.get(key));
  assert.equal(Object.values(plan.media).some(m => m.kind === 'video'), video);
  assert.equal(Object.values(plan.media).some(m => m.kind === 'audio'), sound);
  if (!sound) {
    assert.deepEqual(output.body.split('\n').filter(l => l.startsWith('#EXT-X-MEDIA:TYPE=AUDIO')), audio, 'Video-only must preserve every original audio rendition and channel count');
    const aac = output.body.split('\n').filter(l => l.startsWith('#EXT-X-STREAM-INF:') && l.includes('AUDIO="aac"'));
    assert.equal(aac.length, 2, 'Retain AAC even when main starts at zero');
    assert.ok(aac.every(l => l.includes('RESOLUTION=3840x2160') && !l.includes('ec-3')));
  }
  if (!video) {
    assert.ok(output.body.includes('RESOLUTION=1280x720'));
    assert.ok(output.body.includes('low-aac.m3u8'));
    assert.ok(output.body.includes('BANDWIDTH=1000000,'));
  }
}
const media = kind => `#EXTM3U\n#EXT-X-TARGETDURATION:4\n#EXT-X-MAP:URI="${root}${kind}-init.mp4"\n#EXTINF:4,\n${root}${kind}-1.mp4\n#EXTINF:4,\n${root}${kind}-2.mp4\n#EXT-X-ENDLIST\n`;
const store = fresh(); await run(false, true, playlist, master, store);
const audioURL = root + 'aac.m3u8';
const disabled = await run(true, false, media('aac'), audioURL, store);
assert.equal(disabled.body, undefined, 'Disabling audio must ignore stale audio mappings without downloading or changing the stream');
const enabled = await run(true, true, media('aac'), audioURL, store, (request, callback) => callback(null, { status: 200 }, media('dolby')));
assert.ok(enabled.body.includes('dolby-1.mp4'));
assert.ok(!enabled.body.includes('aac-1.mp4'));
const audioOnly = await run(false, true, playlist, master);
assert.ok(audioOnly.body.includes('low-aac.m3u8'));
for (const file of ['HBO.AI.Subtitles.plugin', 'HBO.AI.Subtitles.local.plugin']) {
  const text = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  assert.match(text, /AudioQuality = switch,false,tag=最高音质/);
  for (const line of text.split('\n').filter(l => l.startsWith('http-') && l.includes('{QualityCompatibility}'))) assert.ok(line.includes('{AudioQuality}'));
}
const requestCode = fs.readFileSync(new URL('../scripts/HBO.Playback.request.js', import.meta.url), 'utf8');
assert.ok(requestCode.includes('AudioQuality'), 'Audio-only must also enable the playback capability request');
console.log('Independent video/audio switches passed: all four states, original AAC/groups/codecs, audio-only video preservation, stale audio mappings and real audio replacement.');
