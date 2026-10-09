import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const script=read('scripts/HBO.Subtitles.js'),compat=read('scripts/HBO.Compatible.response.js'),bundle=read('scripts/HBO.Translate.response.bundle.js');
const KEY='HBOAI.Context.v1',storage=new Map(),id='53395a57-ee38-4220-b07a-882eb64faf73',origin='https://test.e.hbo';
const master=origin+'/gcs/'+id+'/hls.m3u8',playlist=origin+'/gcs/'+id+'/native-en.m3u8?signature=keep',nativeVTT=origin+'/gcs/'+id+'/t/en/1.vtt';
const original='WEBVTT\nX-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:0\n\n00:00:08.300 --> 00:00:11.300\nHello\n';
const native='#EXTM3U\n#EXT-X-TARGETDURATION:900\n#EXTINF:12.012,\n/public/static/empty.vtt\n#EXT-X-DISCONTINUITY\n#EXTINF:900,\nt/en/1.vtt\n#EXTINF:1200,\nt/en/2.vtt\n#EXT-X-ENDLIST\n';
const args={GatewayURL:'https://gateway.example/v1/token',Title:'Example',MediaType:'movie',Mode:'Both'};
async function run({url,body,argument=args,code=script,request=false,requestBody='',get,post,store=storage}){
 let resolve;const done=new Promise(r=>resolve=r);const context=vm.createContext({setTimeout,clearTimeout,crypto:globalThis.crypto,console:{log(){},warn(){},error(){}},$loon:{},$script:{startTime:Date.now()},$request:{url,headers:{},body:requestBody},...(!request?{$response:{status:200,headers:{'Content-Type':'text/vtt'},body}}:{}),$argument:argument,$persistentStore:{read:k=>store.get(k)||null,write:(v,k)=>(store.set(k,v),true)},$httpClient:{get:get || ((r,cb)=>cb(null,{status:200},native)),post:post || (()=>assert.fail('Unexpected Gemini request'))},$done:resolve});
 vm.runInContext(code,context);let timer;try{return await Promise.race([done,new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('timeout')),4000))]);}finally{clearTimeout(timer);}
}
const playbackURL='https://default.any-any.prd.api.discomax.com/playback-orchestrator/any/playback-orchestrator/v1/playbackInfo';
function playback(asset=id){return JSON.stringify({manifest:{format:'hls',url:origin+'/gcs/'+asset+'/hls.m3u8'},videos:[{type:'promo',start:0,duration:12.012,manifestationId:'00000000-0000-0000-0000-000000000001'},{type:'main',start:12.012,duration:2100,manifestationId:asset,textTracks:[{type:'closedcaptions',language:'en-US',displayName:'English CC',format:'webvtt'}]}]});}
let response=await run({url:playbackURL,body:playback()});let tracks=JSON.parse(response.body).videos[1].textTracks;
assert.deepEqual(tracks.map(t=>t.displayName),['English CC','AI 翻译','外部字幕']);
const nativeLine='#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="en-US",NAME="English CC",URI="'+playlist+'"';
const main='#EXTM3U\n'+nativeLine+'\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="zh-Hans",NAME="官方中文",URI="zh.m3u8"\n#EXT-X-STREAM-INF:BANDWIDTH=1000,RESOLUTION=1920x1080,CODECS="avc1.4d401f,mp4a.40.2",SUBTITLES="subs"\nvideo.m3u8\n';
response=await run({url:master,body:main});assert.ok(response.body.includes(nativeLine),'Do not change English');assert.ok(response.body.includes('NAME="AI 翻译"'));assert.ok(response.body.includes('NAME="外部字幕"'));assert.ok(response.body.includes('NAME="官方中文"'));
const second=await run({url:master,body:response.body});assert.equal((second.body.match(/NAME="AI 翻译"/g) || []).length,1,'Do not duplicate injected tracks');
const aiList=origin+'/__hbo_ai__/'+id+'/ai/0/playlist.m3u8',externalList=origin+'/__hbo_ai__/'+id+'/external/0/playlist.m3u8';
response=await run({url:aiList,request:true});assert.equal(response.response.status,200);assert.ok(response.response.body.includes('/public/static/empty.vtt'));const aiSegment=origin+'/__hbo_ai__/'+id+'/ai/0/seg-0.vtt';assert.equal(JSON.parse(storage.get(KEY)).segments[aiSegment].source,nativeVTT);
// A master refresh must not erase the existing AI segment registration.
await run({url:master,body:main});assert.ok(JSON.parse(storage.get(KEY)).segments[aiSegment]);
let apiCalls=0;
const post=(r,cb)=>{apiCalls++;assert.ok(!r.url.includes('mock-key'));assert.equal(r.headers['x-goog-api-key'],'mock-key');const entries=JSON.parse(JSON.parse(r.body).contents[0].parts[0].text);cb(null,{status:200},JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({translations:entries.map(x=>({id:x.id,text:'你好'}))})}]}}]}));};
const translateArgs={Vendor:'Gemini',GeminiAPIKey:'mock-key',GeminiModel:'mock-model','Languages[1]':'ZH',Position:'Reverse',ShowOnly:'false'};
response=await run({url:aiSegment,request:true,code:bundle,argument:translateArgs,get:(r,cb)=>{assert.equal(r.url,nativeVTT);cb(null,{status:200},original);},post});
assert.equal(apiCalls,1);assert.equal(response.response.status,200);assert.ok(response.response.body.includes('你好'));assert.ok(response.response.body.includes('00:00:08.300 --> 00:00:11.300'));assert.ok(response.response.body.includes('MPEGTS:0'));assert.ok(storage.has('HBOAI'));assert.ok(!storage.has('DualSubs'));
// Native English requests must not translate or fetch gateway subtitles.
response=await run({url:nativeVTT,body:original,code:bundle});assert.equal(response.body,original);assert.equal(apiCalls,1);
response=await run({url:aiSegment,request:true,code:bundle,get:(r,cb)=>cb(null,{status:403},'Forbidden')});assert.equal(response.response.status,502);assert.ok(!response.response.body.includes('Forbidden'));
response=await run({url:externalList,request:true});assert.equal(response.response.status,200);assert.ok(response.response.body.includes('gateway.example'));assert.ok(response.response.body.includes('from=900.000&to=2100.000'));
// Refreshing playback for another episode does not steal first episode's map.
const nextId='63395a57-ee38-4220-b07a-882eb64faf73';await run({url:playbackURL,body:playback(nextId)});assert.ok(JSON.parse(storage.get(KEY)).segments[aiSegment]);
const cms={data:{type:'route',id:'route'},included:[{type:'show',id:'show',attributes:{originalName:'Example Series',premiereDate:'2025-01-01'}},...['edit2','edit3'].map((edit,i)=>({type:'video',id:'v'+i,attributes:{videoType:'episode',seasonNumber:1,episodeNumber:i+2},relationships:{show:{data:{type:'show',id:'show'}},edit:{data:{type:'edit',id:edit}}}}))]};
await run({url:'https://default.any-emea.prd.api.discomax.com/cms/routes/show/test',body:JSON.stringify(cms)});
for(const edit of ['edit2','edit3']){await run({url:playbackURL,body:playback(),requestBody:JSON.stringify({editId:edit}),argument:{GatewayURL:args.GatewayURL}});assert.ok(JSON.parse(storage.get(KEY)).plans[id].external.includes('episode='+edit.slice(-1)));}
// Existing highest quality logic runs inside the same response script, preserving AI options.
await run({url:playbackURL,body:playback(),code:compat,argument:{...args,QualityCompatibility:true}});
response=await run({url:master,body:main,code:compat,argument:{...args,QualityCompatibility:true}});assert.ok(response.body.includes(nativeLine));assert.ok(response.body.includes('NAME="AI 翻译"'));assert.ok(response.body.includes('NAME="外部字幕"'));assert.ok(storage.has('HBO.iPad.PeriodPlan.v1'));
// Replay real captures in response completion order. No account headers are used or emitted.
let replay=0,aiTracks=0;
const files=process.env.HBO_SKIP_HAR?[]:fs.readdirSync(new URL('../..',import.meta.url)).filter(x=>x.endsWith('.har'));
for(const file of files){const har=JSON.parse(fs.readFileSync(new URL('../../'+file,import.meta.url),'utf8')),entries=har.log.entries;const bodies=new Map(entries.map(e=>[e.request.url,decode(e.response.content)]));const store=new Map();
 const ordered=entries.sort((a,b)=>Date.parse(a.startedDateTime)+a.time-Date.parse(b.startedDateTime)-b.time);
 for(const e of ordered){const body=decode(e.response.content),url=e.request.url;if(!body || (!url.includes('/cms/') && !url.includes('/playbackInfo') && !/hls\.m3u8/.test(url)))continue;
  const r=await run({url,body,requestBody:decode(e.request.postData),store,code:compat,argument:{QualityCompatibility:true,Mode:'Both'},get:(r,cb)=>cb(null,{status:bodies.has(r.url)?200:404},bodies.get(r.url)||'')});
  if(body.includes('#EXT-X-STREAM-INF:')){assert.ok(r.body.includes('NAME="AI 翻译"'),'HAR master must contain independent AI option');aiTracks++;}
  replay++;
 }
 if(file.startsWith('49_')){const state=JSON.parse(store.get(KEY));const plan=Object.values(state.plans).find(p=>p.aiSources?.length);assert.ok(plan,'New episode registers its own source');const list=plan.origin+'/__hbo_ai__/'+plan.id+'/ai/0/playlist.m3u8';const r=await run({url:list,request:true,store,get:(r,cb)=>cb(null,{status:bodies.has(r.url)?200:404},bodies.get(r.url)||'')});assert.equal(r.response.status,200);assert.equal(Object.values(JSON.parse(store.get(KEY)).segments).filter(s=>s.id===plan.id).length,4,'New episode exposes all four English segments');}
}
function decode(c={}){return c.encoding==='base64'?Buffer.from(c.text||'','base64').toString():c.text||'';}
for(const name of ['HBO.AI.Subtitles.plugin','HBO.AI.Subtitles.local.plugin']){const text=read(name);assert.equal(text.split('\n').filter(l=>/^http-(request|response) /.test(l)).length,6);assert.ok(!text.includes('Metadata\\nhttp'));
 for(const line of text.split('\n').filter(l=>/^http-/.test(l))){new RegExp(line.split(' ')[1]);}
 for(const match of text.matchAll(/script-path=([^,\s]+)/g)){const file=match[1].startsWith('https:')?match[1].split('/main/')[1]:'scripts/'+match[1];assert.ok(fs.existsSync(new URL('../'+file,import.meta.url)));}
 assert.ok(!text.split('\n').some(l=>l.startsWith('http-response') && l.includes('(?:vtt|webvtt)')),'Native English VTT must remain untouched');
}
console.log(`Independent AI/external options, original English, refresh/episode isolation, direct AI requests, quality integration passed; ${replay} HAR responses, ${aiTracks} rewritten masters.`);
