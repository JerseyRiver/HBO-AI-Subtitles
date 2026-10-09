import fs from 'node:fs';
const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const module = file => '(function($request,$response,$argument,$done){\n' + read(file) + '\n})';
const subtitle = module('scripts/HBO.Subtitles.js');
const plan = module('upstream/hbo-quality/hbo-period-plan.response.js');
const quality = module('upstream/hbo-quality/hbo-period-quality.response.js');
const request = module('upstream/hbo-quality/hbo-playback.request.js');
const banner = '/* HBO AI Subtitles: independent options with optional existing quality integration.\n * GPL-3.0-only; upstream quality logic: MIT, see upstream/hbo-quality/LICENSE. */\n';
const response = banner + '(async function(){\n' +
  'let current=Object.assign({},$response);\n' +
  'function apply(fn){return new Promise(resolve=>fn($request,current,$argument,v=>{if(v)current=Object.assign({},current,v);resolve();}));}\n' +
  'await apply(' + subtitle + ');\n' +
  'if($argument && String($argument.QualityCompatibility)==="true"){if(/\\/playbackInfo(?:\\?|$)/.test($request.url))await apply(' + plan + ');else if(/\\.m3u8(?:\\?|$)/.test($request.url))await apply(' + quality + '); }\n' +
  '$done(current);\n})().catch(()=>{$done({});});\n';
fs.writeFileSync(new URL('HBO.Compatible.response.js',import.meta.url),response);
fs.writeFileSync(new URL('HBO.Playback.request.js',import.meta.url),banner+'if($argument && String($argument.QualityCompatibility)==="true")'+request+'($request,undefined,$argument,$done);else $done({});\n');
