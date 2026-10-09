/* Experimental Apple TV playback identity. This is not a captured tvOS profile. */
(function () {
  var prefix = '[HBO iPad Playback] ';
  try {
    if ($request.method !== 'POST' || !/^https:\/\/default\.any-any\.prd\.api\.discomax\.com\/playback-orchestrator\/any\/playback-orchestrator\/v1\/playbackInfo(?:\?|$)/.test($request.url)) {
      $done({});
      return;
    }
    var body = JSON.parse($request.body);
    var info = body.deviceInfo;
    if (!info || info.platform !== 'ios' || info.make !== 'Apple' || !/^ipad/i.test(info.model || '')) {
      $done({});
      return;
    }
    var originalModel = info.model;
    var version = info.os && info.os.version;
    if (!version) throw new Error('Missing OS version');
    info.model = 'AppleTV14,1';
    info.platform = 'tvos';
    info.deviceType = 'tvos/tv';
    info.os.name = 'TVOS';
    if (info.player && info.player.playerView) {
      info.player.playerView.width = 3840;
      info.player.playerView.height = 2160;
    }
    if (info.player && info.player.sdk) info.player.sdk.name = 'Discovery Player tvos native';
    var sink = body.capabilities && body.capabilities.devicePlatform && body.capabilities.devicePlatform.videoSink;
    if (sink && sink.lastKnownStatus) {
      sink.lastKnownStatus.width = 3840;
      sink.lastKnownStatus.height = 2160;
    }
    var headers = Object.assign({}, $request.headers);
    Object.keys(headers).forEach(function (key) {
      var lower = key.toLowerCase();
      if (lower === 'user-agent') {
        headers[key] = String(headers[key]).replace(/^iPad iPadOS\//, 'Apple TV tvOS/');
      } else if (lower === 'x-disco-client') {
        headers[key] = String(headers[key]).replace(/^IOS:/, 'TVOS:');
      } else if (lower === 'x-device-info') {
        headers[key] = String(headers[key]).replace(/Apple\/iPad[^;\s]+/i, 'Apple/AppleTV14,1').replace(/; IOS\//, '; TVOS/');
      } else if (lower === 'content-length') {
        delete headers[key];
      }
    });
    console.log(prefix + originalModel + ' -> AppleTV14,1; platform=tvos; deviceType=tvos/tv; display=3840x2160');
    $done({headers: headers, body: JSON.stringify(body)});
  } catch (error) {
    console.log(prefix + 'Skipped: rewrite failed; original content retained');
    $done({});
  }
})();
