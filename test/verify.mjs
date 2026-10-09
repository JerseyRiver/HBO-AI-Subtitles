import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const script=fs.readFileSync(new URL('../scripts/HBO.Subtitles.js',import.meta.url),'utf8');
const bundle=fs.readFileSync(new URL('../scripts/HBO.Translate.response.bundle.js',import.meta.url),'utf8');
const KEY='HBOAI.Context.v1', storage=new Map();
const id='53395a57-ee38-4220-b07a-882eb64faf73', origin='https://test.e.hbo', master=origin+'/gcs/'+id+'/hls.m3u8';
const playlist=origin+'/gcs/'+id+'/hlsMedia.m3u8?track=en&signature=keep';
const vtt=origin+'/gcs/'+id+'/t/en/t0/1.vtt';
const native='#EXTM3U\n#EXT-X-TARGETDURATION:900\n#EXTINF:12.012,\n/public/static/empty.vtt\n#EXT-X-DISCONTINUITY\n#EXTINF:63.063,\n/public/static/empty.vtt\n#EXT-X-DISCONTINUITY\n#EXTINF:900,\nt/en/t0/1.vtt\n#EXTINF:1200,\nt/en/t0/2.vtt\n#EXT-X-ENDLIST\n';
const args={GatewayURL:'https://gateway.example/v1/token',Title:'Example',MediaType:'movie',Mode:'Auto'};
async function run({url,body,argument=args,code=script,request=false,requestBody="",status=200,get,post,store=storage}){
 let resolve;const done=new Promise(r=>resolve=r);const context=vm.createContext({setTimeout,clearTimeout,crypto:globalThis.crypto,console:{log(){},warn(){},error(){}},$loon:{},$script:{startTime:Date.now()},$request:{url,headers:{},body:requestBody},...(!request?{$response:{status,headers:{'Content-Type':'text/vtt'},body}}:{}),$argument:argument,$persistentStore:{read:k=>store.get(k)||null,write:(v,k)=>(store.set(k,v),true)},$httpClient:{get:get || ((r,cb)=>cb(null,{status:200},native)),post:post || (()=>assert.fail('Unexpected Gemini request'))},$done:resolve});
 vm.runInContext(code,context);let timer;try{return await Promise.race([done,new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('timeout')),3000))]);}finally{clearTimeout(timer);}
}
function playback(){return JSON.stringify({manifest:{format:'hls',url:master},videos:[{type:'promo',start:0,duration:12.012,manifestationId:'00000000-0000-0000-0000-000000000001'},{type:'promo',start:12.012,duration:63.063,manifestationId:'00000000-0000-0000-0000-000000000002'},{type:'main',start:75.075,duration:2100,manifestationId:id}]});}
const playbackURL='https://default.any-any.prd.api.discomax.com/playback-orchestrator/any/playback-orchestrator/v1/playbackInfo';
await run({url:playbackURL,body:playback()});
const main='#EXTM3U\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="en-US",NAME="English",URI="'+playlist+'"\n#EXT-X-STREAM-INF:BANDWIDTH=1000,SUBTITLES="subs"\nvideo.m3u8\n';
let result=await run({url:master,body:main});assert.ok(result.body.includes(playlist),'Preserve signed native subtitle URL');assert.ok(result.body.includes('外部中文字幕'));
await run({url:playlist,body:native});let state=JSON.parse(storage.get(KEY));assert.ok(state.segments[vtt]);assert.ok(state.segments[vtt].external.includes('from=0.000&to=900.000'));assert.ok(!state.segments[origin+'/public/static/empty.vtt']);
let virtual=origin+'/__hbo_ai__/'+id+'/playlist.m3u8';result=await run({url:virtual,request:true});assert.equal(result.response.status,200);assert.equal((result.response.body.match(/#EXT-X-DISCONTINUITY/g)||[]).length,2);assert.ok(result.response.body.includes('from=900.000&to=2100.000'));
const original='WEBVTT\nX-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:0\n\n00:00:08.300 --> 00:00:11.300\nHello\n';
let calls=0;
result=await run({url:vtt,body:original,code:bundle,argument:{Vendor:'Gemini',GeminiAPIKey:'mock-key',GeminiModel:'mock-model','Languages[1]':'ZH',Position:'Reverse',ShowOnly:'false'},post:(r,cb)=>{calls++;assert.ok(!r.url.includes('mock-key'));assert.equal(r.headers['x-goog-api-key'],'mock-key');const entries=JSON.parse(JSON.parse(r.body).contents[0].parts[0].text);cb(null,{status:200},JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({translations:entries.map(x=>({id:x.id,text:'你好'}))})}]}}]}));}});
assert.equal(calls,1);assert.ok(result.body.includes('你好'));assert.ok(result.body.includes('00:00:08.300 --> 00:00:11.300'));assert.ok(result.body.includes('MPEGTS:0'));assert.ok(storage.has('HBOAI'));assert.ok(!storage.has('DualSubs'));
let fallback=0;result=await run({url:vtt,body:'Forbidden',status:403,code:bundle,get:(r,cb)=>{fallback++;assert.ok(r.url.startsWith('https://gateway.example/v1/token/hbo/'));cb(null,{status:200},original.replace('Hello','外部'));}});assert.equal(fallback,1);assert.equal(result.status,200);assert.ok(result.body.includes('外部'));
result=await run({url:origin+'/public/static/empty.vtt',body:original,code:bundle});assert.ok(!result || result.body===original);
// Official Chinese in Auto clears previously armed English translation.
await run({url:master,body:main.replace('#EXT-X-STREAM-INF:', '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="zh-Hans",NAME="Chinese",URI="zh.m3u8"\n#EXT-X-STREAM-INF:')});state=JSON.parse(storage.get(KEY));assert.ok(!state.playlists[playlist]);assert.ok(!state.segments[vtt]);
result=await run({url:master,body:main.replace('#EXT-X-MEDIA:', '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="bg",NAME="Bulgarian",URI="bg.m3u8"\n#EXT-X-MEDIA:'),argument:{...args,Mode:'External'}});
assert.ok(result.body.includes('NAME="English",URI="'+virtual+'"'));
assert.ok(result.body.includes('NAME="Bulgarian",URI="bg.m3u8"'));
// No native tracks: build a virtual group with one period per playback video.
result=await run({url:master,body:'#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1000\nvideo.m3u8\n'});assert.ok(result.body.startsWith('#EXTM3U\n'));assert.ok(result.body.includes('SUBTITLES="hbo-ai"'));
// Series without season/episode must not offer the external track.
await run({url:master,body:main,argument:{...args,MediaType:'tv'}});assert.equal(JSON.parse(storage.get(KEY)).plans[id].external,'');
// Bind series metadata to each edit, never the last browsed title.
const cms={data:{type:'route',id:'route'},included:[{type:'show',id:'show',attributes:{originalName:'Example Series',premiereDate:'2025-01-01'}},{type:'video',id:'video2',attributes:{videoType:'episode',seasonNumber:1,episodeNumber:2},relationships:{show:{data:{type:'show',id:'show'}},edit:{data:{type:'edit',id:'edit2'}}}},{type:'video',id:'video3',attributes:{videoType:'episode',seasonNumber:1,episodeNumber:3},relationships:{show:{data:{type:'show',id:'show'}},edit:{data:{type:'edit',id:'edit3'}}}}]};
await run({url:'https://default.any-emea.prd.api.discomax.com/cms/routes/show/test',body:JSON.stringify(cms)});
await run({url:playbackURL,body:playback(),requestBody:JSON.stringify({editId:'edit2'}),argument:{GatewayURL:args.GatewayURL}});
assert.ok(JSON.parse(storage.get(KEY)).plans[id].external.includes('episode=2'));
assert.ok(JSON.parse(storage.get(KEY)).plans[id].external.includes('title=Example%20Series'));
await run({url:playbackURL,body:playback(),requestBody:JSON.stringify({editId:'edit3'}),argument:{GatewayURL:args.GatewayURL,Title:'Wrong old movie'}});
assert.ok(JSON.parse(storage.get(KEY)).plans[id].external.includes('episode=3'));
// Real HAR replay uses native responses in memory; never emits signed URLs.
let replay=0, mapped=0;
for(const file of (process.env.HBO_SKIP_HAR ? [] : fs.readdirSync(new URL('../..',import.meta.url)).filter(x=>x.endsWith('.har')))){
 const har=JSON.parse(fs.readFileSync(new URL('../../'+file,import.meta.url),'utf8'));const priority=e=>e.request.url.includes('/cms/')?-1:e.request.url.includes('/playbackInfo')?0:/\/hls\.m3u8/.test(e.request.url)?1:2;const entries=har.log.entries.sort((a,b)=>priority(a)-priority(b));
 const bodies=new Map(entries.map(e=>[e.request.url,decode(e.response.content)]));const replayStore=new Map();
 for(const e of entries){const body=decode(e.response.content);if(!body)continue;const url=e.request.url;if(!url.includes('/cms/') && !url.includes('/playbackInfo') && !/hls(?:Media)?\.m3u8/.test(url))continue;
  await run({url,body,requestBody:decode(e.request.postData),store:replayStore,argument:{...args,Mode:'Translate'},get:(r,cb)=>cb(null,{status:bodies.has(r.url)?200:404},bodies.get(r.url)||'')});replay++;
 }
 mapped+=Object.keys(JSON.parse(replayStore.get(KEY) || '{}').segments || {}).length;
}
if(replay)assert.ok(mapped>0, 'HAR replay must identify native main subtitle segments');
else console.log('Optional private HAR replay skipped: captures are not distributed.');
function decode(c={}){return c.encoding==='base64'?Buffer.from(c.text || '', 'base64').toString():c.text || '';}
// Plugin rules compile and match the observed native playback endpoints.
const plugin=fs.readFileSync(new URL('../HBO.AI.Subtitles.plugin',import.meta.url),'utf8');
for(const line of plugin.split('\n').filter(x=>/^http-(?:request|response) /.test(x))){const parts=line.split(' ');new RegExp(parts[1]);}
assert.ok(new RegExp(plugin.split('\n').find(x=>x.startsWith('http-request ')).split(' ')[1]).test(virtual));
for(const name of ['HBO.AI.Subtitles.plugin','HBO.AI.Subtitles.local.plugin']){
 const text=fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
 assert.ok(!text.includes('Metadata\\nhttp'), 'Script rules must use real newlines');
 assert.equal(text.split('\n').filter(l=>/^http-(request|response) /.test(l)).length,5);
 for(const match of text.matchAll(/script-path=([^,\s]+)/g)){
  const path=match[1].startsWith('https:')?match[1].split('/main/')[1]:'scripts/'+match[1];
  assert.ok(fs.existsSync(new URL('../'+path,import.meta.url)), 'Missing plugin script');
 }
}
console.log(`HBO native translation, signed URLs, external fallback, period timing, cache separation and ${replay} HAR responses passed.`);
