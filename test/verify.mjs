import { createHash } from 'node:crypto';
import { FilmCache, LIBRARY_KEY, filmIdentity } from '../src/FilmCache.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const script=read('scripts/HBO.Subtitles.js'),compat=read('scripts/HBO.Compatible.response.js'),bundle=read('scripts/HBO.Translate.response.bundle.js');
const KEY='HBOAI.Context.v1',storage=new Map(),id='53395a57-ee38-4220-b07a-882eb64faf73',origin='https://test.e.hbo';
const master=origin+'/gcs/'+id+'/hls.m3u8',playlist=origin+'/gcs/'+id+'/native-en.m3u8?signature=keep',nativeVTT=origin+'/gcs/'+id+'/t/en/1.vtt';
const original='WEBVTT\nX-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:0\n\n00:00:08.300 --> 00:00:11.300\nHello\n';
const native='#EXTM3U\n#EXT-X-TARGETDURATION:900\n#EXTINF:12.012,\n/public/static/empty.vtt\n#EXT-X-DISCONTINUITY\n#EXTINF:900,\nt/en/1.vtt\n#EXTINF:1200,\nt/en/2.vtt\n#EXT-X-ENDLIST\n';
const args={GatewayURL:'https://gateway.example/v1/token',Title:'Example',MediaType:'movie'};
const nativeLine='#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="en-US",NAME="English CC",URI="'+playlist+'"';
const main='#EXTM3U\n'+nativeLine+'\n#EXT-X-STREAM-INF:BANDWIDTH=1000,RESOLUTION=1920x1080,CODECS="avc1.4d401f,mp4a.40.2",SUBTITLES="subs"\nvideo.m3u8\n';
const before=fs.existsSync(new URL('../../local-fix-backup/HBO.Subtitles.before.js',import.meta.url))?fs.readFileSync(new URL('../../local-fix-backup/HBO.Subtitles.before.js',import.meta.url),'utf8'):null;
async function run({url,body,argument=args,code=script,request=false,requestBody='',get,post,store=storage}){
 if(!store.has('HBOAI.Metadata.v1'))store.set('HBOAI.Metadata.v1',JSON.stringify({'test-edit':{title:'Example',year:'2025',type:'movie'}}));
 let resolve;const done=new Promise(r=>resolve=r);const context=vm.createContext({setTimeout,clearTimeout,crypto:globalThis.crypto,console:{log(){},warn(){},error(){}},$loon:{},$script:{startTime:Date.now()},$request:{url,headers:{},body:requestBody},...(!request?{$response:{status:200,headers:{'Content-Type':'text/vtt'},body}}:{}),$argument:argument,$persistentStore:{read:k=>store.get(k)||null,write:(v,k)=>(store.set(k,v),true)},$httpClient:{get:(r,cb)=>{if(code!==before)assert.ok(r.timeout>=1000,'Loon HTTP timeout uses milliseconds');return (get || ((r,cb)=>cb(null,{status:200},r.url===master?main:r.url.includes('.vtt')?original:native)))(r,cb);},post:post || (()=>assert.fail('Unexpected Gemini request'))},$done:resolve});
 vm.runInContext(code,context);let timer;try{return await Promise.race([done,new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('timeout')),4000))]);}finally{clearTimeout(timer);}
}
const playbackURL='https://default.any-any.prd.api.discomax.com/playback-orchestrator/any/playback-orchestrator/v1/playbackInfo';
function playback(asset=id){return JSON.stringify({manifest:{format:'hls',url:origin+'/gcs/'+asset+'/hls.m3u8'},videos:[{type:'promo',start:0,duration:12.012,manifestationId:'00000000-0000-0000-0000-000000000001'},{type:'main',editId:'test-edit',start:12.012,duration:2100,manifestationId:asset,textTracks:[{type:'closedcaptions',language:'en-US',displayName:'English CC',format:'webvtt'}]}]});}
let response=await run({url:playbackURL,body:playback()});let tracks=JSON.parse(response.body).videos[1].textTracks;
assert.deepEqual(tracks.map(t=>t.displayName),['English CC','AI 翻译']);
response=await run({url:master,body:main});assert.ok(response.body.includes(nativeLine));assert.ok(response.body.includes('NAME="AI 翻译"'));assert.ok(!response.body.includes('NAME="外部字幕"'));
const chineseMaster=main.replace(nativeLine,nativeLine+'\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="zh-Hans",NAME="官方中文",URI="zh.m3u8"');
const chineseResult=await run({url:master,body:chineseMaster});assert.ok(!chineseResult.body.includes('NAME="AI 翻译"'));assert.ok(!chineseResult.body.includes('NAME="外部字幕"'));assert.ok(chineseResult.body.includes('NAME="官方中文"'));
const cnPlayback=JSON.parse(playback());cnPlayback.videos[1].textTracks.push({language:'zh-Hant',type:'subtitles',displayName:'Chinese'});
const cn=await run({url:playbackURL,body:JSON.stringify(cnPlayback),store:new Map(),get:()=>assert.fail('Official Chinese should bypass probes')});assert.equal(JSON.parse(cn.body).videos[1].textTracks.length,2);
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
// A repeated seek reuses both native text and translation, with no network request.
response=await run({url:aiSegment,request:true,code:bundle,argument:translateArgs,get:()=>assert.fail('Cached seek must not download native VTT'),post:()=>assert.fail('Cached seek must not call Gemini')});assert.equal(response.response.headers['X-HBO-AI-Native-Cache'],'hit');assert.ok(response.response.body.includes('你好'));
// Native English requests must not translate or fetch gateway subtitles.
response=await run({url:nativeVTT,body:original,code:bundle});assert.equal(response.body,original);assert.equal(apiCalls,1);
response=await run({url:aiSegment,request:true,code:bundle,store:new Map([[KEY,storage.get(KEY)]]),get:(r,cb)=>cb(null,{status:403},'Forbidden')});assert.equal(response.response.status,502);assert.ok(!response.response.body.includes('Forbidden'));
response=await run({url:externalList,request:true});assert.equal(response.response.status,200);assert.ok(response.response.body.includes('gateway.example'));assert.ok(response.response.body.includes('from=900.000&to=2100.000'));
// Refreshing playback for another episode does not steal first episode's map.
const nextId='63395a57-ee38-4220-b07a-882eb64faf73';await run({url:playbackURL,body:playback(nextId)});assert.ok(JSON.parse(storage.get(KEY)).segments[aiSegment]);
const cms={data:{type:'route',id:'route'},included:[{type:'show',id:'show',attributes:{originalName:'Example Series',premiereDate:'2025-01-01'}},...['edit2','edit3'].map((edit,i)=>({type:'video',id:'v'+i,attributes:{videoType:'episode',seasonNumber:1,episodeNumber:i+2},relationships:{show:{data:{type:'show',id:'show'}},edit:{data:{type:'edit',id:edit}}}}))]};
await run({url:'https://default.any-emea.prd.api.discomax.com/cms/routes/show/test',body:JSON.stringify(cms)});
for(const edit of ['edit2','edit3']){await run({url:playbackURL,body:playback(),requestBody:JSON.stringify({editId:edit}),argument:{GatewayURL:args.GatewayURL}});assert.ok(JSON.parse(storage.get(KEY)).plans[id].external.includes('episode='+edit.slice(-1)));}
// Existing highest quality logic runs inside the same response script, preserving AI options.
await run({url:playbackURL,body:playback(),code:compat,argument:{...args,QualityCompatibility:true}});
response=await run({url:master,body:main,code:compat,argument:{...args,QualityCompatibility:true}});assert.ok(response.body.includes(nativeLine));assert.ok(response.body.includes('NAME="AI 翻译"'));assert.ok(!response.body.includes('NAME="外部字幕"'));assert.ok(storage.has('HBO.iPad.PeriodPlan.v1'));
// Failed source offers only external.
for(const kind of ['timeout','empty','forbidden']){
 const st=new Map();await run({url:playbackURL,body:playback(),store:st,get:(r,cb)=>r.url===master?cb(null,{status:200},main):cb(kind==='timeout'?'TIMEOUT':null,{status:kind==='forbidden'?403:200},'')});
 const result=await run({url:master,body:main,store:st,get:(r,cb)=>cb('TIMEOUT',null,'')});assert.ok(result.body.includes('NAME="外部字幕"'));assert.ok(!result.body.includes('NAME="AI 翻译"'));
}
const emptyMaster='#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1000\nvideo.m3u8\n';
const missing=new Map();await run({url:playbackURL,body:playback(),store:missing,get:(r,cb)=>cb(null,{status:200},emptyMaster)});
const fallback=await run({url:master,body:emptyMaster,store:missing});assert.ok(fallback.body.includes('NAME="外部字幕"'));
const spanish=main.replace('en-US','es-419'),esStore=new Map();await run({url:playbackURL,body:playback(),store:esStore,get:(r,cb)=>cb(null,{status:200},r.url===master?spanish:r.url.includes('.vtt')?original:native)});
const esResult=await run({url:master,body:spanish,store:esStore});assert.ok(esResult.body.includes('NAME="AI 翻译"'));assert.equal(JSON.parse(esStore.get(KEY)).plans[id].sourceLanguage,'es-419');
// A 40ms network response exceeded the old 12ms deadline; fixed request survives.
if(before){const st=new Map();await run({url:playbackURL,body:playback(),store:st,code:before});await run({url:master,body:main,store:st,code:before});const network=(r,cb)=>setTimeout(()=>r.timeout<100?cb('TIMEOUT',null,''):cb(null,{status:200},native),40);const failed=await run({url:aiList,request:true,store:st,code:before,get:network});assert.equal(failed.response.status,502);const fixed=await run({url:aiList,request:true,store:st,get:network});assert.equal(fixed.response.status,200);}
// The private one-file installer must execute the same real stages.
const local=read('scripts/HBO.Local.js');const localStore=new Map();
const localPlayback=await run({url:playbackURL,body:playback(),store:localStore,code:local});assert.equal(JSON.parse(localPlayback.body).videos[1].textTracks.at(-1).displayName,'AI 翻译');
await run({url:master,body:main,store:localStore,code:local});
const localList=await run({url:aiList,request:true,store:localStore,code:local});assert.equal(localList.response.status,200);
const localTranslation=await run({url:aiSegment,request:true,store:localStore,code:local,argument:translateArgs,get:(r,cb)=>cb(null,{status:200},original),post});assert.ok(localTranslation.response.body.includes('你好'));
const localQuality=await run({url:playbackURL,request:true,requestBody:'{}',code:local,argument:{QualityCompatibility:false}});assert.deepEqual(Object.keys(localQuality),[]);
// Film-counted FIFO: many segments stay together; a partial new film evicts an entire old one.
const filmStore=new Map(),evictions=[];const films=new FilmCache({read:key=>filmStore.get(key),write:(v,key)=>(filmStore.set(key,v),true)},20,ids=>evictions.push(...ids));
for(let i=0;i<35;i++){films.put('oldest','native','s'+i,original);films.put('oldest','translations','c'+i,['你好']);}
assert.equal(films.read().films.length,1);assert.equal(Object.keys(films.film('oldest').translations).length,35);
for(let i=1;i<20;i++)films.put('film'+i,'native','one',original);
films.put('oldest','translations','late',['仍属于最早影片']);assert.equal(films.read().films[0].id,'oldest','Adding a segment must not refresh FIFO age');
films.put('film20','native','partial',original);assert.equal(films.read().films.length,20);assert.equal(films.film('oldest'),undefined);assert.deepEqual(evictions,['oldest']);assert.ok(films.film('film20'));
assert.equal(filmIdentity({editId:'episode-2'},'cdn-1'),filmIdentity({editId:'episode-2'},'cdn-2'),'Same episode counts once across manifestations');assert.notEqual(filmIdentity({editId:'episode-2'},id),filmIdentity({editId:'episode-3'},id));
assert.equal(JSON.parse(storage.get(LIBRARY_KEY)).films.length,1,'Real native and translation writes share one film group');
// Matching pre-upgrade entries are adopted without network calls or lost translations.
const legacyKey=Object.keys(JSON.parse(storage.get(LIBRARY_KEY)).films[0].translations)[0];
const legacyStore=new Map([[KEY,storage.get(KEY)],['HBOAI',JSON.stringify({Translate:{Caches:{Subtitles:JSON.stringify([[legacyKey,['旧译文']]]),NativeVTT:JSON.stringify([{key:createHash('md5').update(nativeVTT).digest('hex'),body:original,expires:Date.now()+60000}])}}})]]);
const adopted=await run({url:aiSegment,request:true,code:bundle,store:legacyStore,argument:translateArgs,get:()=>assert.fail('Legacy native text should migrate'),post:()=>assert.fail('Legacy translation should migrate')});assert.equal(adopted.response.status,200);assert.ok(adopted.response.body.includes('旧译文'));assert.equal(JSON.parse(legacyStore.get(LIBRARY_KEY)).films.length,1);
// Late metadata cannot turn one episode into two cache slots or reset its FIFO age.
const aliasStore=new Map(),alias=new FilmCache({read:k=>aliasStore.get(k),write:(v,k)=>(aliasStore.set(k,v),true)});
alias.put('manifest:uuid','native','first',original);alias.put('other','native','x',original);alias.put('edit:known','translations','second',['译文']);alias.adoptIdentity('manifest:uuid','edit:known');assert.equal(alias.read().films.length,2);assert.equal(alias.read().films[0].id,'edit:known');assert.ok(alias.native('edit:known','first'));assert.ok(alias.translation('edit:known','second'));
for(const name of ['HBO.AI.Subtitles.plugin','HBO.AI.Subtitles.local.plugin']){const text=read(name);for(const removed of ['Title','Year','MediaType','Season','Episode','Vendor','GeminiBatchSize','Languages[0]','LogLevel'])assert.ok(!text.includes(removed+' = '),'Unused setting must not be advertised');}
// Replay real captures in response completion order. No account headers are used or emitted.
let replay=0,aiTracks=0;
const files=process.env.HBO_SKIP_HAR?[]:fs.readdirSync(new URL('../..',import.meta.url)).filter(x=>x.endsWith('.har'));
if(process.env.HBO_HAR_PATH && !process.env.HBO_SKIP_HAR)files.push(process.env.HBO_HAR_PATH);
for(const file of files){const har=JSON.parse(fs.readFileSync(file.startsWith('/')?file:new URL('../../'+file,import.meta.url),'utf8')),entries=har.log.entries;const bodies=new Map(entries.map(e=>[e.request.url,decode(e.response.content)]));const store=new Map();
 const ordered=entries.sort((a,b)=>Date.parse(a.startedDateTime)+a.time-Date.parse(b.startedDateTime)-b.time);
 for(const e of ordered){const body=decode(e.response.content),url=e.request.url;if(!body || (!url.includes('/cms/') && !url.includes('/playbackInfo') && !/hls\.m3u8/.test(url)))continue;
  const r=await run({url,body,requestBody:decode(e.request.postData),store,code:compat,argument:{QualityCompatibility:true,Mode:'Both'},get:(r,cb)=>cb(null,{status:bodies.get(r.url)?200:404},bodies.get(r.url)||'')});
  if(body.includes('#EXT-X-STREAM-INF:')){assert.ok(!(r.body.includes('NAME="AI 翻译"') && r.body.includes('NAME="外部字幕"')),'Only one injected option');aiTracks++;}
  replay++;
 }
 if(file.startsWith('49_')){const state=JSON.parse(store.get(KEY));const plan=Object.values(state.plans).find(p=>p.aiSources?.length);assert.ok(plan,'New episode registers its own source');const list=plan.origin+'/__hbo_ai__/'+plan.id+'/ai/0/playlist.m3u8';const r=await run({url:list,request:true,store,get:(r,cb)=>cb(null,{status:bodies.get(r.url)?200:404},bodies.get(r.url)||'')});assert.equal(r.response.status,200);assert.equal(Object.values(JSON.parse(store.get(KEY)).segments).filter(s=>s.id===plan.id).length,4,'New episode exposes all four English segments');}
}
function decode(c={}){return c.encoding==='base64'?Buffer.from(c.text||'','base64').toString():c.text||'';}
for(const name of ['HBO.AI.Subtitles.plugin','HBO.AI.Subtitles.local.plugin']){const text=read(name);assert.equal(text.split('\n').filter(l=>/^http-(request|response) /.test(l)).length,6);assert.ok(!text.includes('Metadata\\nhttp'));
 for(const line of text.split('\n').filter(l=>/^http-/.test(l))){new RegExp(line.split(' ')[1]);}
 for(const match of text.matchAll(/script-path=([^,\s]+)/g)){const file=match[1].startsWith('https:')?match[1].split('/main/')[1]:'scripts/'+match[1];assert.ok(fs.existsSync(new URL('../'+file,import.meta.url)));}
 assert.ok(!text.split('\n').some(l=>l.startsWith('http-response') && l.includes('(?:vtt|webvtt)')),'Native English VTT must remain untouched');
}
console.log(`Independent AI/external options, original English, refresh/episode isolation, direct AI requests, quality integration passed; ${replay} HAR responses, ${aiTracks} rewritten masters.`);
