/* Experimental: preserve pre/post-roll segments; replace only the main chapter. */
(function () {
  var storeKey='HBO.iPad.PeriodPlan.v1', finished=false;
  function done(result) { if (!finished) { finished=true; $done(result || {}); } }
  function attrs(line) {
    var out={},regex=/([A-Z0-9-]+)=("[^"]*"|[^,]*)/g,match;
    while ((match=regex.exec(line.slice(line.indexOf(':')+1)))) out[match[1]]=match[2].replace(/^"|"$/g,'');
    return out;
  }
  function allowed(url) {
    return /^https:\/\/[^/?#@]+\//.test(url) && /(?:^|\.)(?:e\.hbo|media\.max\.com|media\.h264\.io)$/.test(url.split('/')[2]);
  }
  function absolute(uri,base) {
    if (/^https:\/\//.test(uri)) return uri;
    if (/^\/\//.test(uri)) return 'https:'+uri;
    var origin=/^https:\/\/[^/]+/.exec(base)[0];
    var path=uri.charAt(0)==='/' ? uri : base.split('?')[0].slice(origin.length).replace(/[^/]*$/,'')+uri;
    var parts=path.split('?'),stack=[];
    parts[0].split('/').forEach(function (p) { if(p==='..') stack.pop(); else if(p && p!=='.') stack.push(p); });
    return origin+'/'+stack.join('/')+(parts.length>1?'?'+parts.slice(1).join('?'):'');
  }
  function readPlan() {
    var value=$persistentStore.read(storeKey); if(!value) return null;
    var plan=JSON.parse(value);
    if(!plan.expires || plan.expires<Date.now()) { $persistentStore.write(undefined,storeKey); return null; }
    return plan;
  }
  function setAttr(line,name,value,quote) {
    var pattern=new RegExp('(^|[:,])'+name+'=(?:"[^"]*"|[^,]*)');
    var encoded=name+'='+(quote?'"'+value+'"':value);
    return pattern.test(line)?line.replace(pattern,function(_,s){return s+encoded;}):line+','+encoded;
  }
  function family(a) {
    var c=(a.CODECS || '').split(',')[0];
    return /^dvh1\.05\./.test(c)?'dv5':/^(?:hvc1|hev1)/.test(c)?(a['VIDEO-RANGE']==='PQ'?'hevc-hdr':'hevc-sdr'):/^avc1/.test(c)?'avc':'other';
  }
  function audioKey(a) { return [a.LANGUAGE || '',a['ASSOC-LANGUAGE'] || '',a.CHARACTERISTICS || ''].join('|'); }
  function audioRank(group,media,codecs) {
    var joc=media.some(function(m){return m['GROUP-ID']===group && /JOC/i.test(m.CHANNELS || '');});
    return joc || /atmos/i.test(group) || /(?:^|,)ec\+3(?:,|$)/.test(codecs)?4:/(?:^|,)ec-3(?:,|$)/.test(codecs)?3:/(?:^|,)ac-3(?:,|$)/.test(codecs)?2:/(?:^|,)mp4a(?:\.|,|$)/.test(codecs)?1:0;
  }
  function master(body,plan) {
    var lines=body.split(/\r?\n/),variants=[],media=[];
    lines.forEach(function(line,i){
      if(line.indexOf('#EXT-X-MEDIA:')===0) { var m=attrs(line);m.index=i;media.push(m); }
      else if(line.indexOf('#EXT-X-STREAM-INF:')===0) {
        var a=attrs(line),size=/^(\d+)x(\d+)$/.exec(a.RESOLUTION || '');
        if(!size || !lines[i+1] || lines[i+1].charAt(0)==='#') throw new Error('variant');
        variants.push({index:i,a:a,pixels:+size[1]*+size[2],family:family(a),uri:absolute(lines[i+1],$request.url)});
      }
    });
    if(!variants.length) throw new Error('empty');
    var prefs=['dv5','hevc-hdr','hevc-sdr','avc','other'];
    variants.sort(function(a,b){return b.pixels-a.pixels || prefs.indexOf(a.family)-prefs.indexOf(b.family) ||
      audioRank(b.a.AUDIO || '',media,b.a.CODECS || '')-audioRank(a.a.AUDIO || '',media,a.a.CODECS || '') ||
      +(b.a['AVERAGE-BANDWIDTH'] || b.a.BANDWIDTH || 0)-+(a.a['AVERAGE-BANDWIDTH'] || a.a.BANDWIDTH || 0) || +b.a.BANDWIDTH-+a.a.BANDWIDTH;});
    var top=variants[0]; if(top.family==='other' || !allowed(top.uri)) throw new Error('unsupported');
    // Retain resolution choices within one video family, avoiding SDR/Dolby Vision mixing.
    var keep={},audioGroups={},groups={},mappings={};
    variants.filter(function(v){return v.family===top.family && (plan.start>0 || v.index===top.index);}).forEach(function(v){
      if(!allowed(v.uri)) throw new Error('host');
      keep[v.index]=v;mappings[v.uri]={url:top.uri,kind:'video'};audioGroups[v.a.AUDIO || '']=true;
      ['AUDIO','SUBTITLES','VIDEO','CLOSED-CAPTIONS'].forEach(function(type){if(v.a[type] && v.a[type]!=='NONE') groups[type+':'+v.a[type]]=true;});
    });
    var targetAudio=media.filter(function(m){return m.TYPE==='AUDIO' && m['GROUP-ID']===top.a.AUDIO;});
    var targetByKey={};targetAudio.forEach(function(m){targetByKey[audioKey(m)]=m;});
    media.forEach(function(m){
      if(m.TYPE!=='AUDIO' || !audioGroups[m['GROUP-ID']] || !m.URI) return;
      var target=targetByKey[audioKey(m)];if(!target || !target.URI) return;
      var u=absolute(m.URI,$request.url),t=absolute(target.URI,$request.url);
      if(!allowed(u) || !allowed(t)) throw new Error('audio host');
      mappings[u]={url:t,kind:'audio'};
    });
    var result=[],mainVideoCodec=top.a.CODECS.split(',')[0],mainAudioCodecs=top.a.CODECS.split(',').slice(1);
    for(var n=0;n<lines.length;n++) {
      var line=lines[n];
      if(line.indexOf('#EXT-X-STREAM-INF:')===0) {
        var v=keep[n];
        if(v) {
          var codecs=[mainVideoCodec].concat(v.a.CODECS.split(',').slice(1),mainAudioCodecs).filter(function(c,i,a){return a.indexOf(c)===i;});
          line=setAttr(line,'CODECS',codecs.join(','),true);
          ['RESOLUTION','FRAME-RATE','VIDEO-RANGE','HDCP-LEVEL'].forEach(function(k){if(top.a[k]) line=setAttr(line,k,top.a[k],false);});
          ['BANDWIDTH','AVERAGE-BANDWIDTH'].forEach(function(k){if(top.a[k]) line=setAttr(line,k,Math.max(+(v.a[k] || 0),+top.a[k]),false);});
          // Advertise sufficient bitrate for the forced main, including lower-resolution pre-roll variants.
          result.push(line,lines[n+1]);
        }
        n++;
      } else if(line.indexOf('#EXT-X-MEDIA:')===0) {
        var m=attrs(line);
        if(groups[m.TYPE+':'+m['GROUP-ID']]) {
          var target=m.TYPE==='AUDIO'?targetByKey[audioKey(m)]:null;
          if(target && target.CHANNELS) line=setAttr(line,'CHANNELS',target.CHANNELS,true);
          result.push(line);
        }
      } else result.push(line);
    }
    plan.media=mappings;
    if(!$persistentStore.write(JSON.stringify(plan),storeKey)) throw new Error('storage');
    console.log('[HBO iPad Period] Pre-roll choices retained within '+top.family+'; main target '+top.a.RESOLUTION+' / '+(top.a.AUDIO || 'embedded'));
    done({body:result.join(body.indexOf('\r\n')>=0?'\r\n':'\n')});
  }
  function parseMedia(body,base,plan) {
    if(body.indexOf('#EXT-X-ENDLIST')<0 || body.indexOf('#EXT-X-STREAM-INF:')>=0) throw new Error('not VOD media');
    var lines=body.split(/\r?\n/),segments=[],begin=0,duration=null,elapsed=0,previous=null;
    for(var i=0;i<lines.length;i++) {
      var line=lines[i];if(/^#EXTINF:/.test(line)) duration=+line.slice(8).split(',')[0];
      if(!line || line.charAt(0)==='#') continue;
      if(duration===null || !isFinite(duration) || duration<0) throw new Error('duration');
      var uri=absolute(line,base),block=lines.slice(begin,i+1);
      var ri=block.findIndex(function(l){return l.indexOf('#EXT-X-BYTERANGE:')===0;});
      if(ri>=0) {
        var range=/^#EXT-X-BYTERANGE:(\d+)(?:@(\d+))?$/.exec(block[ri]);if(!range) throw new Error('range');
        var offset=range[2]!==undefined?+range[2]:previous && previous.uri===uri?previous.end:null;
        if(offset===null) throw new Error('implicit range');
        block[ri]='#EXT-X-BYTERANGE:'+range[1]+'@'+offset;previous={uri:uri,end:offset+(+range[1])};
      } else previous=null;
      block=block.map(function(l){
        if(l && l.charAt(0)!=='#') return uri;
        return l.replace(/URI="([^"]*)"/g,function(_,u){return 'URI="'+(/^[a-z][a-z0-9+.-]*:/i.test(u) && !/^https:\/\//.test(u)?u:absolute(u,base))+'"';});
      });
      segments.push({begin:begin,end:i+1,block:block,uri:uri,start:elapsed,duration:duration});
      elapsed+=duration;begin=i+1;duration=null;
    }
    // Chapter boundaries, not just asset IDs: post-roll may share the main asset path.
    var first=segments.findIndex(function(s){return Math.abs(s.start-plan.start)<=0.25 &&
      (s.start===0 || s.block.indexOf('#EXT-X-DISCONTINUITY')>=0);});
    if(first<0) throw new Error('main boundary');
    var main=[],total=0;
    for(var j=first;j<segments.length;j++) {
      var segment=segments[j];
      if(j>first && segment.block.indexOf('#EXT-X-DISCONTINUITY')>=0) break;
      if(segment.uri.split('?')[0].indexOf('/'+plan.id+'/')<0) throw new Error('main asset');
      main.push(segment);total+=segment.duration;
    }
    if(!main.length || Math.abs(total-plan.duration)>0.25) throw new Error('timeline');
    if(!main[0].block.some(function(l){return l.indexOf('#EXT-X-MAP:')===0;})) throw new Error('missing initialization');
    if(lines.some(function(l){return /^#EXT-X-KEY:/.test(l) && attrs(l).METHOD==='AES-128' && !attrs(l).IV;})) throw new Error('implicit IV');
    return {lines:lines,main:main,first:main[0].begin,last:main[main.length-1].end};
  }
  function splice(body,targetBody,targetUrl,plan,kind) {
    var source=parseMedia(body,$request.url,plan),target=parseMedia(targetBody,targetUrl,plan),replacement=[];
    target.main.forEach(function(s){replacement=replacement.concat(s.block);});
    var result=source.lines.slice(0,source.first).concat(replacement,source.lines.slice(source.last));
    var maxDuration=target.main.reduce(function(d,s){return Math.max(d,Math.ceil(s.duration));},0);
    result=result.map(function(l){return l.indexOf('#EXT-X-TARGETDURATION:')===0?'#EXT-X-TARGETDURATION:'+Math.max(+l.split(':')[1],maxDuration):l;});
    console.log('[HBO iPad Period] Replaced main '+kind+' segments; pre/post-roll preserved');
    done({body:result.join(body.indexOf('\r\n')>=0?'\r\n':'\n')});
  }
  try {
    if(!allowed($request.url) || typeof $response.body!=='string' || !/^#EXTM3U/.test($response.body) || Number($response.statusCode || $response.status || 200)!==200) {done();return;}
    var plan=readPlan();if(!plan) {done();return;}
    var body=$response.body;
    if(body.indexOf('#EXT-X-STREAM-INF:')>=0) {
      if($request.url!==plan.master) {done();return;}
      master(body,plan);return;
    }
    var mapping=plan.media[$request.url];
    if(!mapping || mapping.url===$request.url || body.indexOf('#EXTINF:')<0) {done();return;}
    var cached=(plan.cache || []).filter(function(c){return c.url===mapping.url;})[0];
    if(cached) {splice(body,cached.body,mapping.url,plan,mapping.kind);return;}
    setTimeout(function(){done();},6500);
    $httpClient.get({url:mapping.url,timeout:4500,insecure:false,'auto-redirect':false},function(error,response,data){
      if(finished) return;
      try {
        if(error || !response || +response.status!==200 || typeof data!=='string' || data.length>1048576) throw new Error('fetch');
        parseMedia(data,mapping.url,plan);
        var current=readPlan();if(!current || current.master!==plan.master) throw new Error('playback changed');
        current.cache=(current.cache || []).filter(function(c){return c.url!==mapping.url;}).slice(-5);
        current.cache.push({url:mapping.url,body:data});$persistentStore.write(JSON.stringify(current),storeKey);
        splice(body,data,mapping.url,plan,mapping.kind);
      } catch(error) {console.log('[HBO iPad Period] Skipped main replacement; original playlist retained');done();}
    });
  } catch(error) {console.log('[HBO iPad Period] Skipped: original playlist retained');done();}
})();
