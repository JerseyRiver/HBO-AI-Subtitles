/* HBO AI Subtitles — select native renditions without splicing media playlists.
 * GPL-3.0-only. Original video/audio timelines, codecs and byte ranges stay intact. */
(function () {
  try {
    var video=String(($argument || {}).QualityCompatibility)==='true';
    var audio=String(($argument || {}).AudioQuality)==='true';
    var body=$response.body;
    if((!video && !audio) || typeof body!=='string' || !/^#EXTM3U/.test(body) || !/#EXT-X-STREAM-INF:/.test(body) || Number($response.statusCode || $response.status || 200)!==200) {$done({});return;}
    var plan=JSON.parse($persistentStore.read('HBO.iPad.PeriodPlan.v1') || 'null');
    if(!plan || plan.expires<Date.now() || plan.master!==$request.url) {$done({});return;}
    function attrs(line) {
      var result={},match,pattern=/([A-Z0-9-]+)=("[^"]*"|[^,]*)/g;
      while((match=pattern.exec(line.slice(line.indexOf(':')+1))))result[match[1]]=match[2].replace(/^"|"$/g,'');
      return result;
    }
    function family(a) {
      var codec=(a.CODECS || '').split(',')[0];
      return /^dvh1\.05\./.test(codec)?'dv5':/^(?:hvc1|hev1)/.test(codec)?(a['VIDEO-RANGE']==='PQ'?'hevc-hdr':'hevc-sdr'):/^avc1/.test(codec)?'avc':'other';
    }
    var lines=body.split(/\r?\n/),variants=[],media=[];
    lines.forEach(function(line,index){
      if(line.indexOf('#EXT-X-MEDIA:')===0)media.push(attrs(line));
      if(line.indexOf('#EXT-X-STREAM-INF:')!==0)return;
      var a=attrs(line),size=/^(\d+)x(\d+)$/.exec(a.RESOLUTION || '');
      if(!size || !lines[index+1] || lines[index+1].charAt(0)==='#')throw new Error('Unsupported variant');
      variants.push({index:index,a:a,pixels:+size[1]*+size[2],family:family(a)});
    });
    if(!variants.length)throw new Error('No variants');
    var selected=variants.slice(),preferences=['dv5','hevc-hdr','hevc-sdr','avc','other'];
    if(video){
      var best=variants.slice().sort(function(a,b){return b.pixels-a.pixels || preferences.indexOf(a.family)-preferences.indexOf(b.family);})[0];
      if(best.family==='other')throw new Error('Unsupported codec');
      selected=selected.filter(function(v){return v.pixels===best.pixels && v.family===best.family;});
    }
    function audioRank(v){
      var group=v.a.AUDIO || '',codec=v.a.CODECS || '';
      var joc=media.some(function(m){return m.TYPE==='AUDIO' && m['GROUP-ID']===group && /JOC/i.test(m.CHANNELS || '');});
      return joc || /atmos/i.test(group) || /(?:^|,)ec\+3(?:,|$)/.test(codec)?4:/(?:^|,)ec-3(?:,|$)/.test(codec)?3:/(?:^|,)ac-3(?:,|$)/.test(codec)?2:/(?:^|,)mp4a(?:\.|,|$)/.test(codec)?1:0;
    }
    if(audio){
      var rank=Math.max.apply(null,selected.map(audioRank));
      selected=selected.filter(function(v){return audioRank(v)===rank;});
    }
    var keep={};selected.forEach(function(v){keep[v.index]=true;});
    var result=[];
    for(var i=0;i<lines.length;i++){
      if(lines[i].indexOf('#EXT-X-STREAM-INF:')===0){if(keep[i])result.push(lines[i],lines[i+1]);i++;}
      else result.push(lines[i]);
    }
    // No extra fetch, segment replacement, codec relabeling or audio-group rewriting.
    $done({body:result.join(body.indexOf('\r\n')>=0?'\r\n':'\n'),headers:Object.assign({},$response.headers,{'X-HBO-Quality-Mode':'native-selection','X-HBO-Quality-Video':video?'highest':'original','X-HBO-Quality-Audio':audio?'highest':'original'})});
  }catch(error){$done({});}
})();
