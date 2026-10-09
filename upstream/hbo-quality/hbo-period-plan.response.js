/* Record the original main chapter; never select the low-quality fallback. */
(function () {
  var key = 'HBO.iPad.PeriodPlan.v1';
  try {
    if (!/^https:\/\/default\.any-any\.prd\.api\.discomax\.com\/playback-orchestrator\/any\/playback-orchestrator\/v1\/playbackInfo(?:\?|$)/.test($request.url)) { $done({}); return; }
    if (Number($response.statusCode || $response.status || 200) !== 200) { $done({}); return; }
    var data = JSON.parse($response.body);
    var mains = (data.videos || []).filter(function (v) { return v.type === 'main'; });
    var manifest = data.manifest || {};
    if (mains.length !== 1 || manifest.format !== 'hls' || typeof manifest.url !== 'string' ||
        !/^https:\/\/[^/?#@]+\//.test(manifest.url) ||
        !/(?:^|\.)(?:e\.hbo|media\.max\.com|media\.h264\.io)$/.test(manifest.url.split('/')[2])) {
      $persistentStore.write(undefined, key); $done({}); return;
    }
    var main = mains[0];
    if (!/^[a-f0-9-]{36}$/i.test(main.manifestationId || '') ||
        typeof main.start !== 'number' || !isFinite(main.start) || main.start < 0 ||
        typeof main.duration !== 'number' || !isFinite(main.duration) || main.duration <= 0) {
      $persistentStore.write(undefined, key); $done({}); return;
    }
    var plan = {master:manifest.url, id:main.manifestationId, start:main.start, duration:main.duration,
      expires:Date.now()+6*60*60*1000, media:{}, cache:[]};
    if ($persistentStore.write(JSON.stringify(plan),key)) console.log('[HBO iPad Period] Original main chapter recorded; fallback disabled');
    $done({});
  } catch (error) {
    try { $persistentStore.write(undefined,key); } catch (ignored) {}
    console.log('[HBO iPad Period] Skipped: original response retained'); $done({});
  }
})();
