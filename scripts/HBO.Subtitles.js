/* HBO AI Subtitles — JerseyRiver. GPL-3.0-only. Native HLS period handling. */
(function () {
  var KEY='HBOAI.Context.v1', META='HBOAI.Metadata.v1', finished=false;
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
  function metadataCache(){try{return JSON.parse($persistentStore.read(META) || '{}');}catch(e){return {};}}
  function collectMetadata(document){
    var nodes=(document.included || []).concat(Array.isArray(document.data)?document.data:[document.data]),index={},cache=metadataCache();
    nodes.forEach(function(n){if(n && n.type && n.id)index[n.type+':'+n.id]=n;});
    function related(n,k){var d=n.relationships && n.relationships[k] && n.relationships[k].data;return d && !Array.isArray(d)?index[d.type+':'+d.id]:null;}
    nodes.forEach(function(n){
      if(!n || n.type!=='video')return;
      var a=n.attributes || {},edit=related(n,'edit'),show=related(n,'show'),season=related(n,'season');
      var relation=n.relationships && n.relationships.edit && n.relationships.edit.data,editId=relation && relation.id;
      var isEpisode=/episode/i.test(a.videoType || '') || +a.episodeNumber>0;
      var title=isEpisode?show && (show.attributes.originalName || show.attributes.name):(a.originalName || a.name);
      if(!editId || typeof title!=='string' || !title.trim())return;
      var sn=+a.seasonNumber || +(season && season.attributes.seasonNumber),ep=+a.episodeNumber;
      if(isEpisode && !(sn>0 && ep>0))return;
      var date=isEpisode?show.attributes.premiereDate:a.airDate,year=String(date || '').match(/(?:18|19|20|21)\d{2}/);
      cache[editId]={title:title,year:year?year[0]:'',type:isEpisode?'tv':'movie',season:isEpisode?sn:'',episode:isEpisode?ep:'',videoId:n.id,updated:Date.now()};
    });
    var keys=Object.keys(cache).sort(function(a,b){return cache[b].updated-cache[a].updated;});keys.slice(120).forEach(function(k){delete cache[k];});
    $persistentStore.write(JSON.stringify(cache),META);
  }
  function mediaFor(plan){
    var automatic=plan.editId && metadataCache()[plan.editId];
    if(automatic)return automatic;
    if(!String(args.Title || '').trim())return null;
    return {title:String(args.Title).trim(),year:args.Year || '',type:args.MediaType || 'movie',season:args.Season || '',episode:args.Episode || ''};
  }
  function gateway(plan){
    var root=String(args.GatewayURL || '').replace(/\/+$/,''),media=mediaFor(plan);
    if(!plan.periods || plan.safePeriods===false || !/^https:\/\/[^/?#@]+\/v1\/[^/?#]+$/.test(root) || !media || !plan.duration)return '';
    if(media.type==='tv' && !(+media.season>0 && +media.episode>0))return '';
    var data={title:media.title,year:media.year,type:media.type,season:media.season,episode:media.episode,duration:plan.duration,offset:args.OffsetSeconds || '0'};
    return root+'/hbo/'+plan.id+'/subtitle.vtt?'+Object.keys(data).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(data[k]);}).join('&');
  }
  function virtual(plan,kind,slot){return plan.origin+'/__hbo_ai__/'+plan.id+'/'+kind+'/'+(slot || 0)+'/playlist.m3u8';}
  function aiPlaylist(body,base,plan,slot){
    if(!/#EXT-X-ENDLIST/.test(body) || /#EXT-X-MAP:|#EXT-X-KEY:/.test(body))throw new Error('unsupported English subtitle playlist');
    var lines=body.split(/\r?\n/),index=0;
    for(var i=0;i<lines.length;i++)if(lines[i] && lines[i].charAt(0)!=='#'){
      var native=absolute(lines[i],base);
      if(!allowed(native))throw new Error('subtitle host');
      if(native.indexOf('/gcs/'+plan.id+'/t/')>=0){
        var target=plan.origin+'/__hbo_ai__/'+plan.id+'/ai/'+slot+'/seg-'+index+'.vtt';
        var current=read();current.segments[target]={id:plan.id,source:native,expires:plan.expires};save(current);lines[i]=target;index++;
      }else lines[i]=native;
    }
    if(!index)throw new Error('English main subtitles unavailable');
    return lines.join('\n');
  }
  function addTrack(lines,group,label,language,uri){lines.push('#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="'+group+'",NAME="'+label+'",LANGUAGE="'+language+'",DEFAULT=NO,AUTOSELECT=NO,URI="'+uri+'"');}
  function advertise(main,plan){
    var original=(main.textTracks || []).filter(function(t){return !/-x-(ai|external)$/.test(t.language || '');});
    var english=original.find(function(t){return /^en(?:-|$)/i.test(t.language || '');});
    main.textTracks=original.slice();
    if(english && args.Mode!=='External')main.textTracks.push({type:'subtitles',language:'zh-Hans-x-ai',displayName:'AI 翻译',format:'webvtt'});
    if(plan.external && args.Mode!=='AI')main.textTracks.push({type:'subtitles',language:'zh-Hans-x-external',displayName:'外部字幕',format:'webvtt'});
  }

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
    var s=read(),u=$request.url,virtualMatch=/\/__hbo_ai__\/([a-f0-9-]{36})\/(ai|external)\/(\d+)\/playlist\.m3u8(?:\?|$)/i.exec(u);
    if(typeof $response==='undefined'){
      if(!virtualMatch)return done();
      var vp=s.plans[virtualMatch[1]],kind=virtualMatch[2],slot=+virtualMatch[3];
      if(!vp || vp.expires<Date.now())return done({response:{status:404,headers:{'Content-Type':'text/plain'},body:'HBO subtitle context expired'}});
      if(kind==='ai'){
        var source=vp.aiSources && vp.aiSources[slot];
        if(!source || !allowed(source))throw new Error('AI source not registered');
        var native=await get(source);var translated=aiPlaylist(native,source,vp,slot);
        return done({response:{status:200,headers:{'Content-Type':'application/vnd.apple.mpegurl','Cache-Control':'no-store'},body:translated}});
      }
      vp.external=gateway(vp);if(!vp.external)return done({response:{status:404,headers:{'Content-Type':'text/plain'},body:'HBO external metadata unavailable'}});
      var externalBody;
      if(vp.templateSource){try{externalBody=externalTemplate(await get(vp.templateSource),vp.templateSource,vp);}catch(e){if(!/subtitle fetch failed/.test(e.message))throw e;}}
      return done({response:{status:200,headers:{'Content-Type':'application/vnd.apple.mpegurl','Cache-Control':'no-store'},body:externalBody || fallbackPeriods(vp)}});
    }
    var body=String($response.body || '');
    if(/\/cms\//.test(u)){collectMetadata(JSON.parse(body));return done();}
    if(/\/playbackInfo(?:\?|$)/.test(u)){
      var data=JSON.parse(body),mains=(data.videos || []).filter(function(v){return v.type==='main';}),manifest=data.manifest || {};
      if(mains.length!==1 || manifest.format!=='hls' || !allowed(manifest.url))return done();
      var main=mains[0];if(!/^[a-f0-9-]{36}$/i.test(main.manifestationId) || !(main.duration>=30) || !(main.start>=0))return done();
      // An insertion inside the main period requires a different mapping; refuse it.
      var periods=(data.videos || []).map(function(v){return {type:v.type,start:v.start,duration:v.duration};});
      var safe=periods.every(function(p,i){return p.duration>0 && p.start>=0 && (!i || Math.abs(p.start-periods[i-1].start-periods[i-1].duration)<0.1);});
      var playbackRequest={};try{playbackRequest=JSON.parse($request.body || '{}');}catch(e){}
      var plan={editId:playbackRequest.editId || main.editId || '',id:main.manifestationId.toLowerCase(),master:manifest.url,origin:/^https:\/\/[^/]+/.exec(manifest.url)[0],duration:main.duration,start:main.start,periods:periods,safePeriods:safe,expires:Date.now()+6*3600000};
      plan.external=safe?gateway(plan):'';var previous=s.plans[plan.id];if(previous){plan.aiSources=previous.aiSources;plan.templateSource=previous.templateSource;}s.plans[plan.id]=plan;save(s);advertise(main,plan);return done({body:JSON.stringify(data),headers:Object.assign({},$response.headers,{'X-HBO-AI-Stage':'playback-options'})});
    }
    if(body.indexOf('#EXTM3U')!==0)return done();
    var idMatch=/\/gcs\/([a-f0-9-]{36})\//i.exec(u),id=idMatch && idMatch[1].toLowerCase(),plan=s.plans[id];
    if(/#EXT-X-STREAM-INF:/.test(body)){
      if(!id)return done();
      if(!plan){plan={id:id,origin:/^https:\/\/[^/]+/.exec(u)[0],duration:0,expires:Date.now()+6*3600000};s.plans[id]=plan;}
      plan.external=gateway(plan);
      var lines=body.split(/\r?\n/).filter(function(l){return !(l.indexOf('#EXT-X-MEDIA:')===0 && l.indexOf('/__hbo_ai__/')>=0);}),tracks=[];
      lines.forEach(function(l,i){if(l.indexOf('#EXT-X-MEDIA:')===0){var a=attrs(l);if(a.TYPE==='SUBTITLES' && a.URI && a.FORCED!=='YES')tracks.push({a:a,index:i,url:absolute(a.URI,u)});}});
      var english=tracks.filter(function(t){return /^en(?:-|$)/i.test(t.a.LANGUAGE || '');}),groups={},aiCount=0,externalCount=0;
      tracks.forEach(function(t){groups[t.a['GROUP-ID']]=true;});
      // Sources belong to the manifestation, never to the last visited episode.
      plan.aiSources=plan.aiSources || [];
      Object.keys(groups).forEach(function(g){
        var candidates=english.filter(function(t){return t.a['GROUP-ID']===g;});
        candidates.sort(function(a,b){return Number(/CC/i.test(a.a.NAME || ''))-Number(/CC/i.test(b.a.NAME || ''));});
        if(candidates.length && args.Mode!=='External'){
          var source=candidates[0].url,slot=plan.aiSources.indexOf(source);if(slot<0){slot=plan.aiSources.length;plan.aiSources.push(source);}
          addTrack(lines,g,'AI 翻译','zh-Hans-x-ai',virtual(plan,'ai',slot));aiCount++;
        }
        if(plan.external && args.Mode!=='AI'){addTrack(lines,g,'外部字幕','zh-Hans-x-external',virtual(plan,'external',0));externalCount++;}
      });
      plan.templateSource=(english[0] || tracks[0] || {}).url || '';
      if(!tracks.length && plan.external && args.Mode!=='AI'){
        addTrack(lines,'hbo-ai','外部字幕','zh-Hans-x-external',virtual(plan,'external',0));externalCount++;
        lines=lines.map(function(l){return l.indexOf('#EXT-X-STREAM-INF:')===0?set(l,'SUBTITLES','hbo-ai'):l;});
      }
      save(s);return done({body:lines.join('\n'),headers:Object.assign({},$response.headers,{'X-HBO-AI-Tracks':'ai='+aiCount+'; external='+externalCount})});
    }
    done();
  }
  run().catch(function(){console.log('[HBO AI] Subtitle processing failed');if(typeof $response==='undefined')done({response:{status:502,headers:{'Content-Type':'text/plain','X-HBO-AI-Error':'playlist-unavailable'},body:'Subtitle playlist unavailable; retry or choose external subtitles'}});else done();});
})();
