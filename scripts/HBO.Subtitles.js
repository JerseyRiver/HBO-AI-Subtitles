/* HBO AI Subtitles — JerseyRiver. GPL-3.0-only. Native HLS period handling. */
(function () {
  var KEY='HBOAI.Context.v1', finished=false;
  var args=typeof $argument==='object' && $argument ? $argument : {};
  function done(v){if(!finished){finished=true;$done(v || {});}}
  function read(){try{return JSON.parse($persistentStore.read(KEY)) || {plans:{},playlists:{},segments:{}};}catch(e){return {plans:{},playlists:{},segments:{}};}}
  function save(s){
    Object.keys(s.plans).forEach(function(k){if(s.plans[k].expires<Date.now())delete s.plans[k];});
    ['playlists','segments'].forEach(function(k){Object.keys(s[k]).forEach(function(u){if(!s.plans[s[k][u].id])delete s[k][u];});var keys=Object.keys(s[k]);keys.slice(0,Math.max(0,keys.length-500)).forEach(function(u){delete s[k][u];});});
    return $persistentStore.write(JSON.stringify(s),KEY);
  }
  function attrs(line){var out={},r=/([A-Z0-9-]+)=("[^"]*"|[^,]*)/g,m;while((m=r.exec(line.slice(line.indexOf(':')+1))))out[m[1]]=m[2].replace(/^"|"$/g,'');return out;}
  function set(line,key,value){var r=new RegExp('(^|[:,])'+key+'=(?:"[^"]*"|[^,]*)');return r.test(line)?line.replace(r,function(_,p){return p+key+'="'+value+'"';}):line+','+key+'="'+value+'"';}
  function absolute(uri,base){
    if(/^https:\/\//.test(uri))return uri;
    if(/^\/\//.test(uri))return 'https:'+uri;
    var origin=/^https:\/\/[^/]+/.exec(base)[0],p=uri.charAt(0)==='/'?uri:base.split('?')[0].slice(origin.length).replace(/[^/]*$/,'')+uri;
    var q=p.indexOf('?'),path=q<0?p:p.slice(0,q),stack=[];path.split('/').forEach(function(x){if(x==='..')stack.pop();else if(x && x!=='.')stack.push(x);});return origin+'/'+stack.join('/')+(q<0?'':p.slice(q));
  }
  function allowed(u){return /^https:\/\/[^/?#@]+\//.test(u) && /(?:^|\.)(?:e\.hbo|media\.max\.com|media\.h264\.io)$/.test(u.split('/')[2]);}
  function get(u){return new Promise(function(resolve,reject){$httpClient.get({url:u,timeout:12},function(e,r,b){if(e || Number(r && (r.status || r.statusCode))!==200)reject(new Error('subtitle fetch failed'));else resolve(String(b || ''));});});}
  function gateway(plan){
    var root=String(args.GatewayURL || '').replace(/\/+$/,'');
    if(!plan.periods || plan.safePeriods===false || !/^https:\/\/[^/?#@]+\/v1\/[^/?#]+$/.test(root) || !String(args.Title || '').trim() || !plan.duration)return '';
    if(args.MediaType==='tv' && !(+args.Season>0 && +args.Episode>0))return '';
    var data={title:String(args.Title).trim(),year:args.Year || '',type:args.MediaType || 'movie',season:args.Season || '',episode:args.Episode || '',duration:plan.duration,offset:args.OffsetSeconds || '0'};
    return root+'/hbo/'+plan.id+'/subtitle.vtt?'+Object.keys(data).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(data[k]);}).join('&');
  }
  function virtual(plan){return plan.origin+'/__hbo_ai__/'+plan.id+'/playlist.m3u8';}
  function fallbackPeriods(plan){
    var lines=['#EXTM3U','#EXT-X-VERSION:6','#EXT-X-PLAYLIST-TYPE:VOD','#EXT-X-TARGETDURATION:'+Math.ceil(Math.max.apply(null,plan.periods.map(function(p){return p.duration;}))),'#EXT-X-MEDIA-SEQUENCE:0'];
    plan.periods.forEach(function(p,i){if(i)lines.push('#EXT-X-DISCONTINUITY');lines.push('#EXTINF:'+p.duration+',',p.type==='main'?plan.external+'&from=0&to='+(plan.duration+1):plan.origin+'/public/static/empty.vtt');});
    lines.push('#EXT-X-ENDLIST','');return lines.join('\n');
  }
  function externalTemplate(body,url,plan){
    if(!/#EXT-X-ENDLIST/.test(body) || /#EXT-X-MAP:|#EXT-X-KEY:/.test(body))throw new Error('not a clear VOD subtitle playlist');
    var lines=body.split(/\r?\n/),cursor=0,duration=0,mainSeen=false,wasMain=false;
    for(var i=0;i<lines.length;i++){
      var l=lines[i];if(l.indexOf('#EXTINF:')===0)duration=parseFloat(l.slice(8));
      if(l && l.charAt(0)!=='#'){
        var u=absolute(l,url),main=u.indexOf('/gcs/'+plan.id+'/t/')>=0;
        if(main){if(mainSeen && !wasMain)throw new Error('interrupted main period');if(!wasMain)cursor=0;lines[i]=plan.external+'&from='+cursor.toFixed(3)+'&to='+(cursor+duration).toFixed(3);cursor+=duration;mainSeen=true;}
        else lines[i]=u;
        wasMain=main;
      }
    }
    if(!mainSeen)throw new Error('main subtitles not identifiable');
    return lines.join('\n');
  }
  async function run(){
    var s=read(),u=$request.url,virtualMatch=/\/__hbo_ai__\/([a-f0-9-]{36})\/playlist\.m3u8(?:\?|$)/i.exec(u);
    if(typeof $response==='undefined'){
      if(!virtualMatch)return done();
      var vp=s.plans[virtualMatch[1]];
      if(!vp || vp.expires<Date.now() || !vp.external)return done({response:{status:404,headers:{'Content-Type':'text/plain'},body:'HBO subtitle context expired'}});
      return done({response:{status:200,headers:{'Content-Type':'application/vnd.apple.mpegurl','Cache-Control':'no-store'},body:vp.externalPlaylist || fallbackPeriods(vp)}});
    }
    var body=String($response.body || '');
    if(/\/playbackInfo(?:\?|$)/.test(u)){
      var data=JSON.parse(body),mains=(data.videos || []).filter(function(v){return v.type==='main';}),manifest=data.manifest || {};
      if(mains.length!==1 || manifest.format!=='hls' || !allowed(manifest.url))return done();
      var main=mains[0];if(!/^[a-f0-9-]{36}$/i.test(main.manifestationId) || !(main.duration>=30) || !(main.start>=0))return done();
      // An insertion inside the main period requires a different mapping; refuse it.
      var periods=(data.videos || []).map(function(v){return {type:v.type,start:v.start,duration:v.duration};});
      var safe=periods.every(function(p,i){return p.duration>0 && p.start>=0 && (!i || Math.abs(p.start-periods[i-1].start-periods[i-1].duration)<0.1);});
      var plan={id:main.manifestationId.toLowerCase(),master:manifest.url,origin:/^https:\/\/[^/]+/.exec(manifest.url)[0],duration:main.duration,start:main.start,periods:periods,safePeriods:safe,expires:Date.now()+6*3600000};
      plan.external=safe?gateway(plan):'';s.plans[plan.id]=plan;save(s);return done();
    }
    if(body.indexOf('#EXTM3U')!==0)return done();
    var idMatch=/\/gcs\/([a-f0-9-]{36})\//i.exec(u),id=idMatch && idMatch[1].toLowerCase(),plan=s.plans[id];
    if(/#EXT-X-STREAM-INF:/.test(body)){
      if(!id)return done();
      if(!plan){plan={id:id,origin:/^https:\/\/[^/]+/.exec(u)[0],duration:0,expires:Date.now()+6*3600000};s.plans[id]=plan;}
      plan.external=gateway(plan);
      ['playlists','segments'].forEach(function(k){Object.keys(s[k]).forEach(function(key){if(s[k][key].id===id)delete s[k][key];});});
      var lines=body.split(/\r?\n/),tracks=[];
      lines.forEach(function(l,i){if(l.indexOf('#EXT-X-MEDIA:')===0){var a=attrs(l);if(a.TYPE==='SUBTITLES' && a.URI && a.FORCED!=='YES')tracks.push({a:a,index:i,url:absolute(a.URI,u)});}});
      var english=tracks.filter(function(t){return /^en(?:-|$)/i.test(t.a.LANGUAGE || '');}),hasChinese=tracks.some(function(t){return /^zh(?:-|$)/i.test(t.a.LANGUAGE || '');});
      var mode=args.Mode || 'Auto',translate=mode==='Translate' || mode==='Auto' && !hasChinese;
      if(translate)english.forEach(function(t){s.playlists[t.url]={id:id};});
      plan.externalPlaylist='';
      if(plan.external && tracks.length){
        try{
          var template=english[0] || tracks[0], templateBody=await get(template.url);
          try{plan.externalPlaylist=externalTemplate(templateBody,template.url,plan);}catch(e){plan.external='';console.log('[HBO AI] Unsupported subtitle timeline; external track skipped');}
        }catch(e){console.log('[HBO AI] Native template unavailable; using playback periods');}
      }
      if(mode==='External' || !english.length && !hasChinese){
        if(plan.external && tracks.length){var target=english[0] || tracks[0];lines[target.index]=set(lines[target.index],'URI',virtual(plan));}
        else if(plan.external){
          lines.unshift('#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="hbo-ai",NAME="外部中文字幕",LANGUAGE="zh-Hans",DEFAULT=NO,AUTOSELECT=NO,URI="'+virtual(plan)+'"');
          // EXT M3U must remain the first line.
          lines.splice(lines.indexOf('#EXTM3U'),1);lines.unshift('#EXTM3U');
          lines=lines.map(function(l){return l.indexOf('#EXT-X-STREAM-INF:')===0?set(l,'SUBTITLES','hbo-ai'):l;});
        }
      }else if(plan.external){
        var groups={};tracks.forEach(function(t){groups[t.a['GROUP-ID']]=true;});Object.keys(groups).forEach(function(g){lines.push('#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="'+g+'",NAME="外部中文字幕",LANGUAGE="zh-Hans",DEFAULT=NO,AUTOSELECT=NO,URI="'+virtual(plan)+'"');});
      }
      save(s);return done({body:lines.join('\n')});
    }
    var context=s.playlists[u];if(!context || !/#EXT-X-ENDLIST/.test(body))return done();
    plan=s.plans[context.id];if(!plan || plan.expires<Date.now())return done();
    var cursor=0,d=0,wasMain=false;
    body.split(/\r?\n/).forEach(function(l){
      if(l.indexOf('#EXTINF:')===0)d=parseFloat(l.slice(8));
      if(l && l.charAt(0)!=='#'){
        var segment=absolute(l,u),main=segment.indexOf('/gcs/'+plan.id+'/t/')>=0;
        if(main){if(!wasMain)cursor=0;s.segments[segment]={id:plan.id,external:plan.external?plan.external+'&from='+cursor.toFixed(3)+'&to='+(cursor+d).toFixed(3):'',expires:plan.expires};cursor+=d;}
        wasMain=main;
      }
    });save(s);done();
  }
  run().catch(function(){console.log('[HBO AI] Rewrite skipped; check playback context and parameters');done();});
})();
