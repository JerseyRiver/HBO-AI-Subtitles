import fs from 'node:fs';
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
// One local file, with lexical scopes matching the individual script runtimes.
const wrap=(name,file)=>'function '+name+'(){\n'+read(file)+'\n}\n';
fs.writeFileSync(new URL('HBO.Local.js',import.meta.url),
 '/* HBO 0.4.1. GPL-3.0-only; see LICENSES.txt and NOTICE. */\n'+
 wrap('translate','HBO.Translate.response.bundle.js')+
 wrap('playlist','HBO.Subtitles.js')+
 wrap('playbackRequest','HBO.Playback.request.js')+
 wrap('response','HBO.Compatible.response.js')+
 "if(typeof $response!=='undefined')response();else if(/\\/__hbo_ai__\\/[^/]+\\/ai\\/\\d+\\/seg-\\d+\\.vtt(?:\\?|$)/.test($request.url))translate();else if(/\\/__hbo_ai__\\//.test($request.url))playlist();else playbackRequest();\n");
