import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../src/QualitySelection.js',import.meta.url),'utf8');
const url='https://test.e.hbo/gcs/53395a57-ee38-4220-b07a-882eb64faf73/hls.m3u8';
const tracks=['#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",LANGUAGE="en",CHANNELS="2",URI="aac.m3u8"','#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="atmos",LANGUAGE="en",CHANNELS="16/JOC",URI="atmos.m3u8"','#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="zh-Hans",URI="zh.m3u8"'];
const variants=[
 ['1280x720','hvc1.2.4.L120.90,mp4a.40.2','aac','720.m3u8',1000000],
 ['3840x2160','hvc1.2.4.L153.90,mp4a.40.2','aac','4k-aac.m3u8',10000000],
 ['3840x2160','hvc1.2.4.L153.90,ec-3','atmos','4k-atmos.m3u8',11000000],
].map(([size,codec,audio,path,bandwidth])=>`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${size},CODECS="${codec}",AUDIO="${audio}",SUBTITLES="subs"\n${path}`);
const master='#EXTM3U\n'+tracks.join('\n')+'\n'+variants.join('\n')+'\n';
function run(video,audio,body=master,requestURL=url){
 let output;
 vm.runInNewContext(code,{$request:{url:requestURL},$response:{status:200,headers:{},body},$argument:{QualityCompatibility:video,AudioQuality:audio},$persistentStore:{read:()=>JSON.stringify({master:url,expires:Date.now()+60000,media:{[requestURL]:{kind:'video',url:'https://test.e.hbo/old-target.m3u8'}},cache:[]}),write:()=>assert.fail('Native selection must not save segment plans')},$httpClient:{get:()=>assert.fail('Native selection must never fetch another playlist')},$done:r=>output=r});
 return output;
}
for(const video of [false,true])for(const audio of [false,true]){
 const output=run(video,audio);
 if(!video&&!audio){assert.equal(output.body,undefined);continue;}
 const expected=video?(audio?[variants[2]]:[variants[1],variants[2]]):[variants[2]];
 for(const v of variants)assert.equal(output.body.includes(v),expected.includes(v),'Only select complete original rendition entries');
 for(const track of tracks)assert.ok(output.body.includes(track),'Keep original audio, channels and subtitles');
 for(const line of output.body.split('\n').filter(l=>l.startsWith('#EXT-X-STREAM-INF:')))assert.ok(master.split('\n').includes(line),'Do not invent resolution, codec or bandwidth declarations');
 assert.equal(output.headers['X-HBO-Quality-Mode'],'native-selection');
}
const media='#EXTM3U\n#EXT-X-TARGETDURATION:4\n#EXT-X-MAP:URI="original-init.mp4"\n#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://original-key"\n#EXTINF:4,\n#EXT-X-BYTERANGE:400@100\noriginal.mp4\n#EXT-X-ENDLIST\n';
for(const suffix of ['video.m3u8','audio.m3u8','subtitle.m3u8'])for(const video of [false,true])for(const audio of [false,true])assert.equal(run(video,audio,media,url.replace('hls.m3u8',suffix)).body,undefined,'Pass through all media playlists, including stale old mappings');
// Reproduce the old dangerous fallback: advertise 4K on a lower playlist and fail the target fetch.
const old=fs.readFileSync(new URL('../upstream/hbo-quality/hbo-period-quality.response.js',import.meta.url),'utf8');
let oldPlan={master:url,id:'53395a57-ee38-4220-b07a-882eb64faf73',start:12,duration:8,expires:Date.now()+60000,media:{},cache:[]},oldMaster;
const environment={$argument:{QualityCompatibility:true,AudioQuality:false},$persistentStore:{read:()=>JSON.stringify(oldPlan),write:v=>(oldPlan=JSON.parse(v),true)},console:{log(){}},setTimeout:()=>0,$httpClient:{get:(r,cb)=>cb('timeout',null,'')}};
vm.runInNewContext(old,{...environment,$request:{url},$response:{status:200,body:master},$done:r=>oldMaster=r});
const oldLines=oldMaster.body.split('\n'),lowIndex=oldLines.indexOf('720.m3u8');
assert.ok(oldLines[lowIndex-1].includes('RESOLUTION=3840x2160'));
let fallback;
vm.runInNewContext(old,{...environment,$request:{url:url.replace('hls.m3u8','720.m3u8')},$response:{status:200,body:media},$done:r=>fallback=r});
assert.equal(fallback.body,undefined,'Old timeout keeps original low rendition despite its 4K declaration');
assert.ok(!run(true,false).body.includes('720.m3u8'),'New selection removes the mismatched fallback path');
console.log('Native quality selection passed: original rendition entries, independent audio/video, untouched media/key/init/ranges, no extra fetch, and old relabel/fetch-failure regression.');
