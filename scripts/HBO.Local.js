/* HBO 0.4.0. GPL-3.0-only; see LICENSES.txt and NOTICE. */
function translate(){
(()=>{var e={140:function(e,a,t){var n;e.exports=n||function(e,a){if("undefined"!=typeof window&&window.crypto&&(n=window.crypto),"undefined"!=typeof self&&self.crypto&&(n=self.crypto),"undefined"!=typeof globalThis&&globalThis.crypto&&(n=globalThis.crypto),!n&&"undefined"!=typeof window&&window.msCrypto&&(n=window.msCrypto),!n&&void 0!==t.g&&t.g.crypto&&(n=t.g.crypto),!n)try{n=t(751)}catch(e){}var n,s=function(){if(n){if("function"==typeof n.getRandomValues)try{return n.getRandomValues(new Uint32Array(1))[0]}catch(e){}if("function"==typeof n.randomBytes)try{return n.randomBytes(4).readInt32LE()}catch(e){}}throw Error("Native crypto module could not be used to get secure random number.")},r=Object.create||function(){function e(){}return function(a){var t;return e.prototype=a,t=new e,e.prototype=null,t}}(),i={},o=i.lib={},l=o.Base={extend:function(e){var a=r(this);return e&&a.mixIn(e),a.hasOwnProperty("init")&&this.init!==a.init||(a.init=function(){a.$super.init.apply(this,arguments)}),a.init.prototype=a,a.$super=this,a},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var a in e)e.hasOwnProperty(a)&&(this[a]=e[a]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}},g=o.WordArray=l.extend({init:function(e,t){e=this.words=e||[],a!=t?this.sigBytes=t:this.sigBytes=4*e.length},toString:function(e){return(e||d).stringify(this)},concat:function(e){var a=this.words,t=e.words,n=this.sigBytes,s=e.sigBytes;if(this.clamp(),n%4)for(var r=0;r<s;r++){var i=t[r>>>2]>>>24-r%4*8&255;a[n+r>>>2]|=i<<24-(n+r)%4*8}else for(var o=0;o<s;o+=4)a[n+o>>>2]=t[o>>>2];return this.sigBytes+=s,this},clamp:function(){var a=this.words,t=this.sigBytes;a[t>>>2]&=0xffffffff<<32-t%4*8,a.length=e.ceil(t/4)},clone:function(){var e=l.clone.call(this);return e.words=this.words.slice(0),e},random:function(e){for(var a=[],t=0;t<e;t+=4)a.push(s());return new g.init(a,e)}}),u=i.enc={},d=u.Hex={stringify:function(e){for(var a=e.words,t=e.sigBytes,n=[],s=0;s<t;s++){var r=a[s>>>2]>>>24-s%4*8&255;n.push((r>>>4).toString(16)),n.push((15&r).toString(16))}return n.join("")},parse:function(e){for(var a=e.length,t=[],n=0;n<a;n+=2)t[n>>>3]|=parseInt(e.substr(n,2),16)<<24-n%8*4;return new g.init(t,a/2)}},m=u.Latin1={stringify:function(e){for(var a=e.words,t=e.sigBytes,n=[],s=0;s<t;s++){var r=a[s>>>2]>>>24-s%4*8&255;n.push(String.fromCharCode(r))}return n.join("")},parse:function(e){for(var a=e.length,t=[],n=0;n<a;n++)t[n>>>2]|=(255&e.charCodeAt(n))<<24-n%4*8;return new g.init(t,a)}},c=u.Utf8={stringify:function(e){try{return decodeURIComponent(escape(m.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return m.parse(unescape(encodeURIComponent(e)))}},h=o.BufferedBlockAlgorithm=l.extend({reset:function(){this._data=new g.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=c.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(a){var t,n=this._data,s=n.words,r=n.sigBytes,i=this.blockSize,o=r/(4*i),l=(o=a?e.ceil(o):e.max((0|o)-this._minBufferSize,0))*i,u=e.min(4*l,r);if(l){for(var d=0;d<l;d+=i)this._doProcessBlock(s,d);t=s.splice(0,l),n.sigBytes-=u}return new g.init(t,u)},clone:function(){var e=l.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});o.Hasher=h.extend({cfg:l.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(a,t){return new e.init(t).finalize(a)}},_createHmacHelper:function(e){return function(a,t){return new p.HMAC.init(e,t).finalize(a)}}});var p=i.algo={};return i}(Math)},491:function(e,a,t){var n;n=t(140),function(e){for(var a=n.lib,t=a.WordArray,s=a.Hasher,r=n.algo,i=[],o=0;o<64;o++)i[o]=0x100000000*e.abs(e.sin(o+1))|0;var l=r.MD5=s.extend({_doReset:function(){this._hash=new t.init([0x67452301,0xefcdab89,0x98badcfe,0x10325476])},_doProcessBlock:function(e,a){for(var t=0;t<16;t++){var n=a+t,s=e[n];e[n]=(s<<8|s>>>24)&0xff00ff|(s<<24|s>>>8)&0xff00ff00}var r=this._hash.words,o=e[a+0],l=e[a+1],c=e[a+2],h=e[a+3],p=e[a+4],f=e[a+5],y=e[a+6],C=e[a+7],x=e[a+8],N=e[a+9],T=e[a+10],S=e[a+11],b=e[a+12],w=e[a+13],A=e[a+14],v=e[a+15],k=r[0],E=r[1],L=r[2],H=r[3];k=g(k,E,L,H,o,7,i[0]),H=g(H,k,E,L,l,12,i[1]),L=g(L,H,k,E,c,17,i[2]),E=g(E,L,H,k,h,22,i[3]),k=g(k,E,L,H,p,7,i[4]),H=g(H,k,E,L,f,12,i[5]),L=g(L,H,k,E,y,17,i[6]),E=g(E,L,H,k,C,22,i[7]),k=g(k,E,L,H,x,7,i[8]),H=g(H,k,E,L,N,12,i[9]),L=g(L,H,k,E,T,17,i[10]),E=g(E,L,H,k,S,22,i[11]),k=g(k,E,L,H,b,7,i[12]),H=g(H,k,E,L,w,12,i[13]),L=g(L,H,k,E,A,17,i[14]),E=g(E,L,H,k,v,22,i[15]),k=u(k,E,L,H,l,5,i[16]),H=u(H,k,E,L,y,9,i[17]),L=u(L,H,k,E,S,14,i[18]),E=u(E,L,H,k,o,20,i[19]),k=u(k,E,L,H,f,5,i[20]),H=u(H,k,E,L,T,9,i[21]),L=u(L,H,k,E,v,14,i[22]),E=u(E,L,H,k,p,20,i[23]),k=u(k,E,L,H,N,5,i[24]),H=u(H,k,E,L,A,9,i[25]),L=u(L,H,k,E,h,14,i[26]),E=u(E,L,H,k,x,20,i[27]),k=u(k,E,L,H,w,5,i[28]),H=u(H,k,E,L,c,9,i[29]),L=u(L,H,k,E,C,14,i[30]),E=u(E,L,H,k,b,20,i[31]),k=d(k,E,L,H,f,4,i[32]),H=d(H,k,E,L,x,11,i[33]),L=d(L,H,k,E,S,16,i[34]),E=d(E,L,H,k,A,23,i[35]),k=d(k,E,L,H,l,4,i[36]),H=d(H,k,E,L,p,11,i[37]),L=d(L,H,k,E,C,16,i[38]),E=d(E,L,H,k,T,23,i[39]),k=d(k,E,L,H,w,4,i[40]),H=d(H,k,E,L,o,11,i[41]),L=d(L,H,k,E,h,16,i[42]),E=d(E,L,H,k,y,23,i[43]),k=d(k,E,L,H,N,4,i[44]),H=d(H,k,E,L,b,11,i[45]),L=d(L,H,k,E,v,16,i[46]),E=d(E,L,H,k,c,23,i[47]),k=m(k,E,L,H,o,6,i[48]),H=m(H,k,E,L,C,10,i[49]),L=m(L,H,k,E,A,15,i[50]),E=m(E,L,H,k,f,21,i[51]),k=m(k,E,L,H,b,6,i[52]),H=m(H,k,E,L,h,10,i[53]),L=m(L,H,k,E,T,15,i[54]),E=m(E,L,H,k,l,21,i[55]),k=m(k,E,L,H,x,6,i[56]),H=m(H,k,E,L,v,10,i[57]),L=m(L,H,k,E,y,15,i[58]),E=m(E,L,H,k,w,21,i[59]),k=m(k,E,L,H,p,6,i[60]),H=m(H,k,E,L,S,10,i[61]),L=m(L,H,k,E,c,15,i[62]),E=m(E,L,H,k,N,21,i[63]),r[0]=r[0]+k|0,r[1]=r[1]+E|0,r[2]=r[2]+L|0,r[3]=r[3]+H|0},_doFinalize:function(){var a=this._data,t=a.words,n=8*this._nDataBytes,s=8*a.sigBytes;t[s>>>5]|=128<<24-s%32;var r=e.floor(n/0x100000000);t[(s+64>>>9<<4)+15]=(r<<8|r>>>24)&0xff00ff|(r<<24|r>>>8)&0xff00ff00,t[(s+64>>>9<<4)+14]=(n<<8|n>>>24)&0xff00ff|(n<<24|n>>>8)&0xff00ff00,a.sigBytes=(t.length+1)*4,this._process();for(var i=this._hash,o=i.words,l=0;l<4;l++){var g=o[l];o[l]=(g<<8|g>>>24)&0xff00ff|(g<<24|g>>>8)&0xff00ff00}return i},clone:function(){var e=s.clone.call(this);return e._hash=this._hash.clone(),e}});function g(e,a,t,n,s,r,i){var o=e+(a&t|~a&n)+s+i;return(o<<r|o>>>32-r)+a}function u(e,a,t,n,s,r,i){var o=e+(a&n|t&~n)+s+i;return(o<<r|o>>>32-r)+a}function d(e,a,t,n,s,r,i){var o=e+(a^t^n)+s+i;return(o<<r|o>>>32-r)+a}function m(e,a,t,n,s,r,i){var o=e+(t^(a|~n))+s+i;return(o<<r|o>>>32-r)+a}n.MD5=s._createHelper(l),n.HmacMD5=s._createHmacHelper(l)}(Math),e.exports=n.MD5},751:function(){}},a={};function t(n){var s=a[n];if(void 0!==s)return s.exports;var r=a[n]={exports:{}};return e[n].call(r.exports,r,r.exports,t),r.exports}t.g=(()=>{if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(e){if("object"==typeof window)return window}})(),(()=>{"use strict";let e,a=(()=>{let e=Object.keys(globalThis);switch(!0){case e.includes("$task"):return"Quantumult X";case e.includes("$loon"):return"Loon";case e.includes("$rocket"):return"Shadowrocket";case"undefined"!=typeof module:return"Node.js";case e.includes("Egern"):return"Egern";case e.includes("$environment"):if($environment["surge-version"])return"Surge";if($environment["stash-version"])return"Stash";return;default:return}})();class n{static #e=new Map([]);static #a=[];static #t=new Map([]);static clear=()=>{};static count=(e="default")=>{switch(n.#e.has(e)){case!0:n.#e.set(e,n.#e.get(e)+1);break;case!1:n.#e.set(e,0)}n.log(`${e}: ${n.#e.get(e)}`)};static countReset=(e="default")=>{switch(n.#e.has(e)){case!0:n.#e.set(e,0),n.log(`${e}: ${n.#e.get(e)}`);break;case!1:n.warn(`Counter "${e}" doesn’t exist`)}};static debug=(...e)=>{n.#n<4||(e=e.map(e=>`🅱️ ${e}`),n.log(...e))};static error(...e){if(!(n.#n<1)){switch(a){case"Surge":case"Loon":case"Stash":case"Egern":case"Shadowrocket":case"Quantumult X":default:e=e.map(e=>`❌ ${e}`);break;case"Node.js":e=e.map(e=>`❌ ${e.stack}`)}n.log(...e)}}static exception=(...e)=>n.error(...e);static group=e=>n.#a.unshift(e);static groupEnd=()=>n.#a.shift();static info(...e){n.#n<3||(e=e.map(e=>`ℹ️ ${e}`),n.log(...e))}static #n=3;static get logLevel(){switch(n.#n){case 0:return"OFF";case 1:return"ERROR";case 2:return"WARN";case 3:default:return"INFO";case 4:return"DEBUG";case 5:return"ALL"}}static set logLevel(e){switch(typeof e){case"string":e=e.toLowerCase();break;case"number":break;default:e="warn"}switch(e){case 0:case"off":n.#n=0;break;case 1:case"error":n.#n=1;break;case 2:case"warn":case"warning":default:n.#n=2;break;case 3:case"info":n.#n=3;break;case 4:case"debug":n.#n=4;break;case 5:case"all":n.#n=5}}static log=(...e)=>{0!==n.#n&&(e=e.map(e=>{switch(typeof e){case"object":e=JSON.stringify(e);break;case"bigint":case"number":case"boolean":case"string":e=e.toString()}return e}),n.#a.forEach(a=>{(e=e.map(e=>`  ${e}`)).unshift(`▼ ${a}:`)}),console.log((e=["",...e]).join("\n")))};static time=(e="default")=>n.#t.set(e,Date.now());static timeEnd=(e="default")=>n.#t.delete(e);static timeLog=(e="default")=>{let a=n.#t.get(e);a?n.log(`${e}: ${Date.now()-a}ms`):n.warn(`Timer "${e}" doesn’t exist`)};static warn(...e){n.#n<2||(e=e.map(e=>`⚠️ ${e}`),n.log(...e))}}class s{static escape(e){let a={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};return e.replace(/[&<>"']/g,e=>a[e])}static get(e={},a="",t){Array.isArray(a)||(a=s.toPath(a));let n=a.reduce((e,a)=>Object(e)[a],e);return void 0===n?t:n}static omit(e={},a=[]){return Array.isArray(a)||(a=[a.toString()]),a.forEach(a=>s.unset(e,a)),e}static pick(e={},a=[]){return Array.isArray(a)||(a=[a.toString()]),Object.fromEntries(Object.entries(e).filter(([e,t])=>a.includes(e)))}static set(e,a,t){return Array.isArray(a)||(a=s.toPath(a)),a.slice(0,-1).reduce((e,t,n)=>Object(e[t])===e[t]?e[t]:e[t]=/^\d+$/.test(a[n+1])?[]:{},e)[a[a.length-1]]=t,e}static toPath(e){return e.replace(/\[(\d+)\]/g,".$1").split(".").filter(Boolean)}static unescape(e){let a={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"};return e.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g,e=>a[e])}static unset(e={},a=""){return Array.isArray(a)||(a=s.toPath(a)),a.reduce((e,t,n)=>n===a.length-1?(delete e[t],!0):Object(e)[t],e)}}let r={100:"Continue",101:"Switching Protocols",102:"Processing",103:"Early Hints",200:"OK",201:"Created",202:"Accepted",203:"Non-Authoritative Information",204:"No Content",205:"Reset Content",206:"Partial Content",207:"Multi-Status",208:"Already Reported",226:"IM Used",300:"Multiple Choices",301:"Moved Permanently",302:"Found",304:"Not Modified",307:"Temporary Redirect",308:"Permanent Redirect",400:"Bad Request",401:"Unauthorized",402:"Payment Required",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",406:"Not Acceptable",407:"Proxy Authentication Required",408:"Request Timeout",409:"Conflict",410:"Gone",411:"Length Required",412:"Precondition Failed",413:"Content Too Large",414:"URI Too Long",415:"Unsupported Media Type",416:"Range Not Satisfiable",417:"Expectation Failed",418:"I'm a teapot",421:"Misdirected Request",422:"Unprocessable Entity",423:"Locked",424:"Failed Dependency",425:"Too Early",426:"Upgrade Required",428:"Precondition Required",429:"Too Many Requests",431:"Request Header Fields Too Large",451:"Unavailable For Legal Reasons",500:"Internal Server Error",501:"Not Implemented",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Timeout",505:"HTTP Version Not Supported",506:"Variant Also Negotiates",507:"Insufficient Storage",508:"Loop Detected",510:"Not Extended",511:"Network Authentication Required"};async function i(e,t={}){switch(typeof e){case"object":e={...t,...e};break;case"string":e={...t,url:e};break;default:throw TypeError(`${Function.name}: 参数类型错误, resource 必须为对象或字符串`)}!e.method&&(e.method="GET",(e.body??e.bodyBytes)&&(e.method="POST")),delete e.headers?.Host,delete e.headers?.[":authority"],delete e.headers?.["Content-Length"],delete e.headers?.["content-length"];let n=e.method.toLocaleLowerCase();switch(!e.timeout&&(e.timeout=5),e.timeout&&(e.timeout=Number.parseInt(e.timeout,10),e.timeout>500&&(e.timeout=Math.round(e.timeout/1e3))),a){case"Loon":case"Surge":case"Stash":case"Egern":case"Shadowrocket":default:if(e.timeout&&"Loon"===a&&(e.timeout=1e3*e.timeout),e.policy)switch(a){case"Loon":e.node=e.policy;break;case"Stash":s.set(e,"headers.X-Stash-Selected-Proxy",encodeURI(e.policy));break;case"Shadowrocket":s.set(e,"headers.X-Surge-Proxy",e.policy)}switch("boolean"==typeof e.redirection&&(e["auto-redirect"]=e.redirection),e.bodyBytes&&!e.body&&(e.body=e.bodyBytes,e.bodyBytes=void 0),(e.headers?.Accept||e.headers?.accept)?.split(";")?.[0]){case"application/protobuf":case"application/x-protobuf":case"application/vnd.google.protobuf":case"application/vnd.apple.flatbuffer":case"application/grpc":case"application/grpc+proto":case"application/octet-stream":e["binary-mode"]=!0}return await new Promise((a,t)=>{$httpClient[n](e,(n,s,i)=>{n?t(n):(s.ok=/^2\d\d$/.test(s.status),s.statusCode=s.status,s.statusText=r[s.status],i&&(s.body=i,!0==e["binary-mode"]&&(s.bodyBytes=i)),a(s))})});case"Quantumult X":return e.policy&&s.set(e,"opts.policy",e.policy),"boolean"==typeof e["auto-redirect"]&&s.set(e,"opts.redirection",e["auto-redirect"]),e.body instanceof ArrayBuffer?(e.bodyBytes=e.body,e.body=void 0):ArrayBuffer.isView(e.body)?(e.bodyBytes=e.body.buffer.slice(e.body.byteOffset,e.body.byteLength+e.body.byteOffset),e.body=void 0):e.body&&(e.bodyBytes=void 0),Promise.race([await $task.fetch(e).then(e=>{switch(e.ok=/^2\d\d$/.test(e.statusCode),e.status=e.statusCode,e.statusText=r[e.status],(e.headers?.["Content-Type"]??e.headers?.["content-type"])?.split(";")?.[0]){case"application/protobuf":case"application/x-protobuf":case"application/vnd.google.protobuf":case"application/vnd.apple.flatbuffer":case"application/grpc":case"application/grpc+proto":case"application/octet-stream":e.body=e.bodyBytes}return e.bodyBytes=void 0,e},e=>Promise.reject(e.error)),new Promise((a,t)=>{setTimeout(()=>{t(Error(`${Function.name}: 请求超时, 请检查网络后重试`))},e.timeout)})]);case"Node.js":{let a=globalThis.fetch?globalThis.fetch:require("node-fetch"),t=(globalThis.fetchCookie?globalThis.fetchCookie:require("fetch-cookie").default)(a);e.timeout=1e3*e.timeout,e.redirect=e.redirection?"follow":"manual";let{url:n,...s}=e;return Promise.race([await t(n,s).then(async e=>{let a,t=await e.arrayBuffer();try{a=e.headers.raw()}catch{a=Array.from(e.headers.entries()).reduce((e,[a,t])=>(e[a]=e[a]?[...e[a],t]:[t],e),{})}return{ok:e.ok??/^2\d\d$/.test(e.status),status:e.status,statusCode:e.status,statusText:e.statusText,body:new TextDecoder("utf-8").decode(t),bodyBytes:t,headers:Object.fromEntries(Object.entries(a).map(([e,a])=>[e,"set-cookie"!==e.toLowerCase()?a.toString():a]))}}).catch(e=>Promise.reject(e.message)),new Promise((a,t)=>{setTimeout(()=>{t(Error(`${Function.name}: 请求超时, 请检查网络后重试`))},e.timeout)})])}}}class o{static data=null;static dataFile="box.dat";static #s=/^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;static getItem(e,t=null){let n=t;if(!0===e.startsWith("@")){let{key:a,path:t}=e.match(o.#s)?.groups;e=a;let r=o.getItem(e,{});"object"!=typeof r&&(r={}),n=s.get(r,t);try{n=JSON.parse(n)}catch(e){}}else{switch(a){case"Surge":case"Loon":case"Stash":case"Egern":case"Shadowrocket":n=$persistentStore.read(e);break;case"Quantumult X":n=$prefs.valueForKey(e);break;case"Node.js":o.data=o.#r(o.dataFile),n=o.data?.[e];break;default:n=o.data?.[e]||null}try{n=JSON.parse(n)}catch(e){}}return n??t}static setItem(e=new String,t=new String){let n=!1;if(t="object"==typeof t?JSON.stringify(t):String(t),!0===e.startsWith("@")){let{key:a,path:r}=e.match(o.#s)?.groups;e=a;let i=o.getItem(e,{});"object"!=typeof i&&(i={}),s.set(i,r,t),n=o.setItem(e,i)}else switch(a){case"Surge":case"Loon":case"Stash":case"Egern":case"Shadowrocket":n=$persistentStore.write(t,e);break;case"Quantumult X":n=$prefs.setValueForKey(t,e);break;case"Node.js":o.data=o.#r(o.dataFile),o.data[e]=t,o.#i(o.dataFile),n=!0;break;default:n=o.data?.[e]||null}return n}static removeItem(e){let t=!1;if(!0===e.startsWith("@")){let{key:a,path:n}=e.match(o.#s)?.groups;e=a;let r=o.getItem(e);"object"!=typeof r&&(r={}),keyValue=s.unset(r,n),t=o.setItem(e,r)}else switch(a){case"Surge":case"Loon":case"Stash":case"Egern":case"Shadowrocket":case"Node.js":default:t=!1;break;case"Quantumult X":t=$prefs.removeValueForKey(e)}return t}static clear(){let e=!1;switch(a){case"Surge":case"Loon":case"Stash":case"Egern":case"Shadowrocket":case"Node.js":default:e=!1;break;case"Quantumult X":e=$prefs.removeAllValues()}return e}static #r=e=>{if("Node.js"!==a)return{};{this.fs=this.fs?this.fs:require("node:fs"),this.path=this.path?this.path:require("node:path");let a=this.path.resolve(e),t=this.path.resolve(process.cwd(),e),n=this.fs.existsSync(a),s=!n&&this.fs.existsSync(t);if(!n&&!s)return{};try{return JSON.parse(this.fs.readFileSync(n?a:t))}catch(e){return{}}}};static #i=(e=this.dataFile)=>{if("Node.js"===a){this.fs=this.fs?this.fs:require("node:fs"),this.path=this.path?this.path:require("node:path");let a=this.path.resolve(e),t=this.path.resolve(process.cwd(),e),n=this.fs.existsSync(a),s=!n&&this.fs.existsSync(t),r=JSON.stringify(this.data);n?this.fs.writeFileSync(a,r):s?this.fs.writeFileSync(t,r):this.fs.writeFileSync(a,r)}}}function l(e){return/^\d+$/.test(e)&&(e=Number.parseInt(e,10)),e}class g{constructor(e){switch(typeof e){case"string":if(0===e.length)break;e.startsWith("?")&&(e=e.slice(1)),e.split("&").map(e=>e.split("=")).forEach(([e,a])=>{this.#o.push(e?decodeURIComponent(e):e),this.#l.push(a?decodeURIComponent(a):a)});break;case"object":if(Array.isArray(e))Object.entries(e).forEach(([e,a])=>{this.#o.push(e?decodeURIComponent(e):e),this.#l.push(a?decodeURIComponent(a):a)});else if(Symbol.iterator in Object(e))for(const[a,t]of e)this.#o.push(a?decodeURIComponent(a):a),this.#l.push(t?decodeURIComponent(t):t)}this.#g(this.#o,this.#l)}#u="";#o=[];#l=[];#g(e,a){0===e.length?this.#u="":this.#u=e.map((e,t)=>{switch(typeof a[t]){case"object":return`${encodeURIComponent(e)}=${encodeURIComponent(JSON.stringify(a[t]))}`;case"boolean":case"number":case"string":return`${encodeURIComponent(e)}=${encodeURIComponent(a[t])}`;default:return encodeURIComponent(e)}}).join("&")}append(e,a){e=decodeURIComponent(e),a&&(a=decodeURIComponent(a)),this.#o.push(e),this.#l.push(a),this.#g(this.#o,this.#l)}delete(e,a){for(e=decodeURIComponent(e),a&&(a=decodeURIComponent(a));this.#o.indexOf(e)>-1;)this.#l.splice(this.#o.indexOf(e),1),this.#o.splice(this.#o.indexOf(e),1);this.#g(this.#o,this.#l)}entries(){return this.#o.map((e,a)=>[e,this.#l[a]])}get(e){return e=decodeURIComponent(e),this.#l[this.#o.indexOf(e)]}getAll(e){return e=decodeURIComponent(e),this.#l.filter((a,t)=>this.#o[t]===e)}has(e,a){return e=decodeURIComponent(e),a&&(a=decodeURIComponent(a)),this.#o.indexOf(e)>-1}keys(){return this.#o}set(e,a){if(e=decodeURIComponent(e),a&&(a=decodeURIComponent(a)),-1===this.#o.indexOf(e))this.append(e,a);else{let t=!0,n=[];this.#o=this.#o.filter((s,r)=>s!==e?(n.push(this.#l[r]),!0):!!t&&(t=!1,n.push(a),!0)),this.#l=n,this.#g(this.#o,this.#l)}}sort(){let e=this.entries().sort();this.#o=[],this.#l=[],e.forEach(e=>{this.#o.push(e[0]),this.#l.push(e[1])}),this.#g(this.#o,this.#l)}toString=()=>this.#u;values=()=>this.#l.values()}class u{constructor(e,a){switch(typeof e){case"string":{const t=/^(blob:|file:)?[a-zA-z]+:\/\/.*/.test(e),n=!!a&&/^(blob:|file:)?[a-zA-z]+:\/\/.*/.test(a);if(t)this.href=e;else if(n)this.href=a+e;else throw TypeError('URL string is not valid. If using a relative url, a second argument needs to be passed representing the base URL. Example: new URL("relative/path", "http://www.example.com");');break}case"object":break;default:throw TypeError("Invalid argument type.")}}#d={hash:"",host:"",hostname:"",href:"",password:"",pathname:"",port:NaN,protocol:"",search:"",searchParams:new g(""),username:""};static #m=/^(?<scheme>([^:\/?#]+):)?(?:\/\/(?<authority>[^\/?#]*))?(?<path>[^?#]*)(?<query>\?([^#]*))?(?<hash>#(.*))?$/;static #c=/^(?<authentication>(?<username>[^:]*)(:(?<password>[^@]*))?@)?(?<hostname>[^:]+)(:(?<port>\d+))?$/;get hash(){return this.#d.hash}set hash(e){0!==e.length&&(e.startsWith("#")&&(e=e.slice(1)),this.#d.hash=`#${encodeURIComponent(e)}`)}get host(){return this.port.length>0?`${this.hostname}:${this.port}`:this.hostname}set host(e){[this.hostname,this.port]=e.split(":",2)}get hostname(){return encodeURIComponent(this.#d.hostname)}set hostname(e){this.#d.hostname=e??""}get href(){let e="";return this.username.length>0&&(e+=this.username,this.password.length>0&&(e+=`:${this.password}`),e+="@"),`${this.protocol}//${e}${this.host}${this.pathname}${this.search}${this.hash}`}set href(e){(e.startsWith("blob:")||e.startsWith("file:"))&&(e=e.slice(5));let a=e.match(u.#m);if(!a)throw TypeError("Invalid URL format.");this.protocol=a.groups.scheme??"";let t=a.groups.authority.match(u.#c);this.username=t.groups.username??"",this.password=t.groups.password??"",this.hostname=t.groups.hostname??"",this.port=t.groups.port??"",this.pathname=a.groups.path??"",this.search=a.groups.query??"",this.hash=a.groups.hash??""}get origin(){return`${this.protocol}//${this.host}`}get password(){return encodeURIComponent(this.#d.password)}set password(e){this.username.length>0&&(this.#d.password=e??"")}get pathname(){return`/${this.#d.pathname}`}set pathname(e){(e=`${e}`).startsWith("/")&&(e=e.slice(1)),this.#d.pathname=e}get port(){if(Number.isNaN(this.#d.port))return"";let e=this.#d.port.toString();return"ftp:"===this.protocol&&"21"===e||"http:"===this.protocol&&"80"===e||"https:"===this.protocol&&"443"===e?"":e}set port(e){if(""===e)this.#d.port=NaN;else{let a=Number.parseInt(e,10);a>=0&&a<65535&&(this.#d.port=a)}}get protocol(){return`${this.#d.protocol}:`}set protocol(e){e.endsWith(":")&&(e=e.slice(0,-1)),this.#d.protocol=e}get search(){return(this.#d.search=this.searchParams.toString(),this.#d.search.length>0)?`?${this.#d.search}`:""}set search(e){(e=`${e}`).startsWith("?")&&(e=e.slice(1)),this.#d.search=e,this.#d.searchParams=new g(this.#d.search)}get searchParams(){return this.#d.searchParams}get username(){return encodeURIComponent(this.#d.username)}set username(e){this.#d.username=e??""}static parse=(e,a)=>new u(e,a);toString=()=>this.href;toJSON=()=>JSON.stringify({hash:this.hash,host:this.host,hostname:this.hostname,href:this.href,origin:this.origin,password:this.password,pathname:this.pathname,port:this.port,protocol:this.protocol,search:this.search,searchParams:this.searchParams,username:this.username})}var d=t(491);class m{static name="WebVTT";static version="2.2.0";static about=()=>console.log(`
🟧 ${this.name} v${this.version}
`);static parse(e=new String,a={milliseconds:!0,timeStamp:!0,line:"single",lineBreak:"\n"}){let t=a.milliseconds?/^((?<index>\d+)(\r\n|\r|\n))?(?<timing>(?<startTime>[0-9:.,]+) --> (?<endTime>[0-9:.,]+)) ?(?<settings>.+)?[^](?<text>[\s\S]*)?$/:/^((?<index>\d+)(\r\n|\r|\n))?(?<timing>(?<startTime>[0-9:]+)[0-9.,]+ --> (?<endTime>[0-9:]+)[0-9.,]+) ?(?<settings>.+)?[^](?<text>[\s\S]*)?$/,n=e.split(/\r\n\r\n|\r\r|\n\n/),s={headers:{},comments:[],style:"",body:[]};return n.forEach(e=>{switch((e=e.trim()).substring(0,5).trim()){case"WEBVT":{let a=e.split(/\r\n|\r|\n/);s.headers.type=a.shift(),s.headers.options=a;break}case"NOTE":s.comments.push(e);break;case"STYLE":{let t=e.split(/\r\n|\r|\n/);t.shift(),s.style=t.join(a.lineBreak);break}default:let n=e.match(t)?.groups;if(n){if(s.headers?.type!=="WEBVTT"&&(n.timing=n?.timing?.replace?.(",","."),n.startTime=n?.startTime?.replace?.(",","."),n.endTime=n?.endTime?.replace?.(",",".")),a.timeStamp){let e=n?.startTime?.replace?.(/(.*)/,"1970-01-01T$1Z");n.timeStamp=a.milliseconds?Date.parse(e):Date.parse(e)/1e3}switch(n.text=n?.text?.trimEnd?.(),a.line){case"single":n.text=n?.text?.replace?.(/\r\n|\r|\n/," ");break;case"multi":n.text=n?.text?.split?.(/\r\n|\r|\n/)}s.body.push(n)}}}),s}static stringify(e={headers:{},comments:[],style:"",body:[]},a={milliseconds:!0,timeStamp:!0,line:"single",lineBreak:"\n"}){return[e.headers=[e.headers?.type||"",e.headers?.options||""].flat(1/0).join(a.lineBreak),e.comments=e?.comments?.join?.(a.lineBreak),e.style=e?.style?.length>0?["STYLE",e.style].join(a.lineBreak):"",e.body=e.body.map(e=>(Array.isArray(e.text)&&(e.text=e.text.join(a.lineBreak)),e=`${e.index?e.index+a.lineBreak:""}${e.timing} ${e?.settings??""}${a.lineBreak}${e.text}`)).join(a.lineBreak+a.lineBreak)].join(a.lineBreak+a.lineBreak).trim()+a.lineBreak+a.lineBreak}}let c={Universal:{Settings:{Types:["Official","Translate"],Languages:["AUTO","ZH"]},Configs:{Languages:{AUTO:["en","en-US","eng","en-GB","en-UK","en-CA","en-US SDH","ja","ja-JP","jpn","ko","ko-KR","kor","pt","pt-PT","pt-BR","por"],AR:["ar","ar-001"],BG:["bg","bg-BG","bul"],CS:["cs","cs-CZ","ces"],DA:["da","da-DK","dan"],DE:["de","de-DE","deu"],EL:["el","el-GR","ell"],EN:["en","en-US","eng","en-GB","en-UK","en-CA","en-US SDH"],"EN-CA":["en-CA","en","eng"],"EN-GB":["en-UK","en","eng"],"EN-US":["en-US","en","eng"],"EN-US SDH":["en-US SDH","en-US","en","eng"],ES:["es","es-419","es-ES","spa","es-419 SDH"],"ES-419":["es-419","es","spa"],"ES-419 SDH":["es-419 SDH","es-419","es","spa"],"ES-ES":["es-ES","es","spa"],ET:["et","et-EE","est"],FI:["fi","fi-FI","fin"],FR:["fr","fr-CA","fr-FR","fra"],"FR-CA":["fr-CA","fr","fra"],"FR-DR":["fr-FR","fr","fra"],HU:["hu","hu-HU","hun"],ID:["id","id-id"],IT:["it","it-IT","ita"],JA:["ja","ja-JP","jpn"],KO:["ko","ko-KR","kor"],LT:["lt","lt-LT","lit"],LV:["lv","lv-LV","lav"],NL:["nl","nl-NL","nld"],NO:["no","nb-NO","nor"],PL:["pl","pl-PL"],PT:["pt","pt-PT","pt-BR","por"],"PT-PT":["pt-PT","pt","por"],"PT-BR":["pt-BR","pt","por"],RO:["ro","ro-RO","ron"],RU:["ru","ru-RU","rus"],SK:["sk","sk-SK","slk"],SL:["sl","sl-SI","slv"],SV:["sv","sv-SE","swe"],IS:["is","is-IS","isl"],ZH:["zh","cmn","zho","zh-CN","zh-Hans","zh-Hans-SG","cmn-Hans","zh-TW","zh-Hant","zh-Hant-TW","cmn-Hant","zh-HK","yue-Hant","yue"],"ZH-CN":["zh-CN","zh-Hans","cmn-Hans","zh-Hans-SG","zho"],"ZH-HANS":["zh-Hans","zh-Hans-SG","cmn-Hans","zh-CN","zho"],"ZH-HK":["zh-HK","yue-Hant","yue","zho"],"ZH-TW":["zh-TW","zh-Hant-TW","zh-Hant","cmn-Hant","zho"],"ZH-HANT":["zh-Hant","zh-Hant-TW","cmn-Hant","zh-TW","zho"],YUE:["yue","yue-Hant","zh-HK","zho"],"YUE-HK":["yue-Hant","yue","zh-HK","zho"]}}},YouTube:{Settings:{Type:"Official",Types:["Translate","External"],Languages:["AUTO","ZH"],AutoCC:!0,ShowOnly:!1},Configs:{Languages:{BG:"bg-BG",CS:"cs",DA:"da-DK",DE:"de",EL:"el",EN:"en","EN-GB":"en-GB","EN-US":"en-US","EN-US SDH":"en-US SDH",ES:"es","ES-419":"es-419","ES-ES":"es-ES",ET:"et-EE",FI:"fi",FR:"fr",HU:"hu-HU",ID:"id",IS:"is-IS",IT:"it",JA:"ja",KO:"ko",LT:"lt-LT",LV:"lv-LV",NL:"nl-NL",NO:"nb-NO",PL:"pl-PL",PT:"pt","PT-PT":"pt-PT","PT-BR":"pt-BR",RO:"ro-RO",RU:"ru-RU",SK:"sk-SK",SL:"sl-SI",SV:"sv-SE",YUE:"yue","YUE-HK":"yue-HK",ZH:"zh","ZH-HANS":"zh-Hans","ZH-HK":"zh-Hant-HK","ZH-HANT":"zh-Hant","ZH-TW":"zh-TW"},translationLanguages:{DESKTOP:[{languageCode:"sq",languageName:{simpleText:"Shqip - 阿尔巴尼亚语"}},{languageCode:"ak",languageName:{simpleText:"\xc1k\xe1n - 阿肯语"}},{languageCode:"ar",languageName:{simpleText:"العربية - 阿拉伯语"}},{languageCode:"am",languageName:{simpleText:"አማርኛ - 阿姆哈拉语"}},{languageCode:"as",languageName:{simpleText:"অসমীয়া - 阿萨姆语"}},{languageCode:"az",languageName:{simpleText:"آذربايجان ديلی - 阿塞拜疆语"}},{languageCode:"ee",languageName:{simpleText:"\xc8ʋegbe - 埃维语"}},{languageCode:"ay",languageName:{simpleText:"Aymar aru - 艾马拉语"}},{languageCode:"ga",languageName:{simpleText:"Gaeilge - 爱尔兰语"}},{languageCode:"et",languageName:{simpleText:"Eesti - 爱沙尼亚语"}},{languageCode:"or",languageName:{simpleText:"ଓଡ଼ିଆ - 奥里亚语"}},{languageCode:"om",languageName:{simpleText:"Afaan Oromoo - 奥罗莫语"}},{languageCode:"eu",languageName:{simpleText:"Euskara - 巴斯克语"}},{languageCode:"be",languageName:{simpleText:"Беларуская - 白俄罗斯语"}},{languageCode:"bg",languageName:{simpleText:"Български - 保加利亚语"}},{languageCode:"nso",languageName:{simpleText:"Sesotho sa Leboa - 北索托语"}},{languageCode:"is",languageName:{simpleText:"\xcdslenska - 冰岛语"}},{languageCode:"pl",languageName:{simpleText:"Polski - 波兰语"}},{languageCode:"bs",languageName:{simpleText:"Bosanski - 波斯尼亚语"}},{languageCode:"fa",languageName:{simpleText:"فارسی - 波斯语"}},{languageCode:"bho",languageName:{simpleText:"भोजपुरी - 博杰普尔语"}},{languageCode:"ts",languageName:{simpleText:"Xitsonga - 聪加语"}},{languageCode:"tt",languageName:{simpleText:"Татарча - 鞑靼语"}},{languageCode:"da",languageName:{simpleText:"Dansk - 丹麦语"}},{languageCode:"de",languageName:{simpleText:"Deutsch - 德语"}},{languageCode:"dv",languageName:{simpleText:"ދިވެހިބަސް - 迪维希语"}},{languageCode:"ru",languageName:{simpleText:"Русский - 俄语"}},{languageCode:"fr",languageName:{simpleText:"fran\xe7ais - 法语"}},{languageCode:"sa",languageName:{simpleText:"संस्कृतम् - 梵语"}},{languageCode:"fil",languageName:{simpleText:"Filipino - 菲律宾语"}},{languageCode:"fi",languageName:{simpleText:"suomi - 芬兰语"}},{languageCode:"km",languageName:{simpleText:"ភាសាខ្មែរ - 高棉语"}},{languageCode:"ka",languageName:{simpleText:"ქართული - 格鲁吉亚语"}},{languageCode:"gu",languageName:{simpleText:"ગુજરાતી - 古吉拉特语"}},{languageCode:"gn",languageName:{simpleText:"Ava\xf1e'ẽ - 瓜拉尼语"}},{languageCode:"kk",languageName:{simpleText:"Қазақ тілі - 哈萨克语"}},{languageCode:"ht",languageName:{simpleText:"Krey\xf2l ayisyen - 海地克里奥尔语"}},{languageCode:"ko",languageName:{simpleText:"한국어 - 韩语"}},{languageCode:"ha",languageName:{simpleText:"هَوُسَ - 豪萨语"}},{languageCode:"nl",languageName:{simpleText:"Nederlands - 荷兰语"}},{languageCode:"gl",languageName:{simpleText:"Galego - 加利西亚语"}},{languageCode:"ca",languageName:{simpleText:"catal\xe0 - 加泰罗尼亚语"}},{languageCode:"cs",languageName:{simpleText:"čeština - 捷克语"}},{languageCode:"kn",languageName:{simpleText:"ಕನ್ನಡ - 卡纳达语"}},{languageCode:"ky",languageName:{simpleText:"кыргыз тили - 吉尔吉斯语"}},{languageCode:"xh",languageName:{simpleText:"isiXhosa - 科萨语"}},{languageCode:"co",languageName:{simpleText:"corsu - 科西嘉语"}},{languageCode:"hr",languageName:{simpleText:"hrvatski - 克罗地亚语"}},{languageCode:"qu",languageName:{simpleText:"Runa Simi - 克丘亚语"}},{languageCode:"ku",languageName:{simpleText:"Kurd\xee - 库尔德语"}},{languageCode:"la",languageName:{simpleText:"lingua latīna - 拉丁语"}},{languageCode:"lv",languageName:{simpleText:"latviešu valoda - 拉脱维亚语"}},{languageCode:"lo",languageName:{simpleText:"ພາສາລາວ - 老挝语"}},{languageCode:"lt",languageName:{simpleText:"lietuvių kalba - 立陶宛语"}},{languageCode:"ln",languageName:{simpleText:"ling\xe1la - 林加拉语"}},{languageCode:"lg",languageName:{simpleText:"Luganda - 卢干达语"}},{languageCode:"lb",languageName:{simpleText:"L\xebtzebuergesch - 卢森堡语"}},{languageCode:"rw",languageName:{simpleText:"Kinyarwanda - 卢旺达语"}},{languageCode:"ro",languageName:{simpleText:"Rom\xe2nă - 罗马尼亚语"}},{languageCode:"mt",languageName:{simpleText:"Malti - 马耳他语"}},{languageCode:"mr",languageName:{simpleText:"मराठी - 马拉地语"}},{languageCode:"mg",languageName:{simpleText:"Malagasy - 马拉加斯语"}},{languageCode:"ml",languageName:{simpleText:"മലയാളം - 马拉雅拉姆语"}},{languageCode:"ms",languageName:{simpleText:"bahasa Melayu - 马来语"}},{languageCode:"mk",languageName:{simpleText:"македонски јазик - 马其顿语"}},{languageCode:"mi",languageName:{simpleText:"te reo Māori - 毛利语"}},{languageCode:"mn",languageName:{simpleText:"Монгол хэл - 蒙古语"}},{languageCode:"bn",languageName:{simpleText:"বাংলা - 孟加拉语"}},{languageCode:"my",languageName:{simpleText:"ဗမာစာ - 缅甸语"}},{languageCode:"hmn",languageName:{simpleText:"Hmoob - 苗语"}},{languageCode:"af",languageName:{simpleText:"Afrikaans - 南非荷兰语"}},{languageCode:"st",languageName:{simpleText:"Sesotho - 南索托语"}},{languageCode:"ne",languageName:{simpleText:"नेपाली - 尼泊尔语"}},{languageCode:"no",languageName:{simpleText:"Norsk - 挪威语"}},{languageCode:"pa",languageName:{simpleText:"ਪੰਜਾਬੀ - 旁遮普语"}},{languageCode:"pt",languageName:{simpleText:"Portugu\xeas - 葡萄牙语"}},{languageCode:"ps",languageName:{simpleText:"پښتو - 普什图语"}},{languageCode:"ny",languageName:{simpleText:"chiCheŵa - 齐切瓦语"}},{languageCode:"ja",languageName:{simpleText:"日本語 - 日语"}},{languageCode:"sv",languageName:{simpleText:"Svenska - 瑞典语"}},{languageCode:"sm",languageName:{simpleText:"Gagana fa'a Samoa - 萨摩亚语"}},{languageCode:"sr",languageName:{simpleText:"Српски језик - 塞尔维亚语"}},{languageCode:"si",languageName:{simpleText:"සිංහල - 僧伽罗语"}},{languageCode:"sn",languageName:{simpleText:"ChiShona - 绍纳语"}},{languageCode:"eo",languageName:{simpleText:"Esperanto - 世界语"}},{languageCode:"sk",languageName:{simpleText:"slovenčina - 斯洛伐克语"}},{languageCode:"sl",languageName:{simpleText:"slovenščina - 斯洛文尼亚语"}},{languageCode:"sw",languageName:{simpleText:"Kiswahili - 斯瓦希里语"}},{languageCode:"gd",languageName:{simpleText:"G\xe0idhlig - 苏格兰盖尔语"}},{languageCode:"ceb",languageName:{simpleText:"Binisaya - 宿务语"}},{languageCode:"so",languageName:{simpleText:"Soomaaliga - 索马里语"}},{languageCode:"tg",languageName:{simpleText:"тоҷикӣ - 塔吉克语"}},{languageCode:"te",languageName:{simpleText:"తెలుగు - 泰卢固语"}},{languageCode:"ta",languageName:{simpleText:"தமிழ் - 泰米尔语"}},{languageCode:"th",languageName:{simpleText:"ไทย - 泰语"}},{languageCode:"ti",languageName:{simpleText:"ትግርኛ - 提格利尼亚语"}},{languageCode:"tr",languageName:{simpleText:"T\xfcrk\xe7e - 土耳其语"}},{languageCode:"tk",languageName:{simpleText:"T\xfcrkmen - 土库曼语"}},{languageCode:"cy",languageName:{simpleText:"Cymraeg - 威尔士语"}},{languageCode:"ug",languageName:{simpleText:"ئۇيغۇرچە - 维吾尔语"}},{languageCode:"und",languageName:{simpleText:"Unknown - 未知语言"}},{languageCode:"ur",languageName:{simpleText:"اردو - 乌尔都语"}},{languageCode:"uk",languageName:{simpleText:"українська - 乌克兰语"}},{languageCode:"uz",languageName:{simpleText:"O'zbek - 乌兹别克语"}},{languageCode:"es",languageName:{simpleText:"Espa\xf1ol - 西班牙语"}},{languageCode:"fy",languageName:{simpleText:"Frysk - 西弗里西亚语"}},{languageCode:"iw",languageName:{simpleText:"עברית - 希伯来语"}},{languageCode:"el",languageName:{simpleText:"Ελληνικά - 希腊语"}},{languageCode:"haw",languageName:{simpleText:"ʻŌlelo Hawaiʻi - 夏威夷语"}},{languageCode:"sd",languageName:{simpleText:"سنڌي - 信德语"}},{languageCode:"hu",languageName:{simpleText:"magyar - 匈牙利语"}},{languageCode:"su",languageName:{simpleText:"Basa Sunda - 巽他语"}},{languageCode:"hy",languageName:{simpleText:"հայերեն - 亚美尼亚语"}},{languageCode:"ig",languageName:{simpleText:"Igbo - 伊博语"}},{languageCode:"it",languageName:{simpleText:"Italiano - 意大利语"}},{languageCode:"yi",languageName:{simpleText:"ייִדיש - 意第绪语"}},{languageCode:"hi",languageName:{simpleText:"हिन्दी - 印地语"}},{languageCode:"id",languageName:{simpleText:"Bahasa Indonesia - 印度尼西亚语"}},{languageCode:"en",languageName:{simpleText:"English - 英语"}},{languageCode:"yo",languageName:{simpleText:"Yor\xf9b\xe1 - 约鲁巴语"}},{languageCode:"vi",languageName:{simpleText:"Tiếng Việt - 越南语"}},{languageCode:"jv",languageName:{simpleText:"Basa Jawa - 爪哇语"}},{languageCode:"zh-Hant",languageName:{simpleText:"中文（繁體）- 中文（繁体）"}},{languageCode:"zh-Hans",languageName:{simpleText:"中文（简体）"}},{languageCode:"zu",languageName:{simpleText:"isiZulu - 祖鲁语"}},{languageCode:"kri",languageName:{simpleText:"Kr\xec\xec - 克里语"}}],MOBILE:[{languageCode:"sq",languageName:{runs:[{text:"Shqip - 阿尔巴尼亚语"}]}},{languageCode:"ak",languageName:{runs:[{text:"\xc1k\xe1n - 阿肯语"}]}},{languageCode:"ar",languageName:{runs:[{text:"العربية - 阿拉伯语"}]}},{languageCode:"am",languageName:{runs:[{text:"አማርኛ - 阿姆哈拉语"}]}},{languageCode:"as",languageName:{runs:[{text:"অসমীয়া - 阿萨姆语"}]}},{languageCode:"az",languageName:{runs:[{text:"Azərbaycanca - 阿塞拜疆语"}]}},{languageCode:"ee",languageName:{runs:[{text:"Eʋegbe - 埃维语"}]}},{languageCode:"ay",languageName:{runs:[{text:"Aymar - 艾马拉语"}]}},{languageCode:"ga",languageName:{runs:[{text:"Gaeilge - 爱尔兰语"}]}},{languageCode:"et",languageName:{runs:[{text:"Eesti - 爱沙尼亚语"}]}},{languageCode:"or",languageName:{runs:[{text:"ଓଡ଼ିଆ - 奥里亚语"}]}},{languageCode:"om",languageName:{runs:[{text:"Oromoo - 奥罗莫语"}]}},{languageCode:"eu",languageName:{runs:[{text:"Euskara - 巴斯克语"}]}},{languageCode:"be",languageName:{runs:[{text:"Беларуская - 白俄罗斯语"}]}},{languageCode:"bg",languageName:{runs:[{text:"Български - 保加利亚语"}]}},{languageCode:"nso",languageName:{runs:[{text:"Sesotho sa Leboa - 北索托语"}]}},{languageCode:"is",languageName:{runs:[{text:"\xcdslenska - 冰岛语"}]}},{languageCode:"pl",languageName:{runs:[{text:"Polski - 波兰语"}]}},{languageCode:"bs",languageName:{runs:[{text:"Bosanski - 波斯尼亚语"}]}},{languageCode:"fa",languageName:{runs:[{text:"فارسی - 波斯语"}]}},{languageCode:"bho",languageName:{runs:[{text:"भोजपुरी - 博杰普尔语"}]}},{languageCode:"ts",languageName:{runs:[{text:"Xitsonga - 聪加语"}]}},{languageCode:"tt",languageName:{runs:[{text:"Татарча - 鞑靼语"}]}},{languageCode:"da",languageName:{runs:[{text:"Dansk - 丹麦语"}]}},{languageCode:"de",languageName:{runs:[{text:"Deutsch - 德语"}]}},{languageCode:"dv",languageName:{runs:[{text:"ދިވެހިބަސް - 迪维希语"}]}},{languageCode:"ru",languageName:{runs:[{text:"Русский - 俄语"}]}},{languageCode:"fr",languageName:{runs:[{text:"Fran\xe7ais - 法语"}]}},{languageCode:"sa",languageName:{runs:[{text:"संस्कृतम् - 梵语"}]}},{languageCode:"fil",languageName:{runs:[{text:"Filipino - 菲律宾语"}]}},{languageCode:"fi",languageName:{runs:[{text:"Suomi - 芬兰语"}]}},{languageCode:"km",languageName:{runs:[{text:"ភាសាខ្មែរ - 高棉语"}]}},{languageCode:"ka",languageName:{runs:[{text:"ქართული - 格鲁吉亚语"}]}},{languageCode:"gu",languageName:{runs:[{text:"ગુજરાતી - 古吉拉特语"}]}},{languageCode:"gn",languageName:{runs:[{text:"Ava\xf1e'ẽ - 瓜拉尼语"}]}},{languageCode:"kk",languageName:{runs:[{text:"Қазақ тілі - 哈萨克语"}]}},{languageCode:"ht",languageName:{runs:[{text:"海地克里奥尔语"}]}},{languageCode:"ko",languageName:{runs:[{text:"한국말 - 韩语"}]}},{languageCode:"ha",languageName:{runs:[{text:"هَوُسَ - 豪萨语"}]}},{languageCode:"nl",languageName:{runs:[{text:"Nederlands - 荷兰语"}]}},{languageCode:"gl",languageName:{runs:[{text:"Galego - 加利西亚语"}]}},{languageCode:"ca",languageName:{runs:[{text:"Catal\xe0 - 加泰罗尼亚语"}]}},{languageCode:"cs",languageName:{runs:[{text:"Čeština - 捷克语"}]}},{languageCode:"kn",languageName:{runs:[{text:"ಕನ್ನಡ - 卡纳达语"}]}},{languageCode:"ky",languageName:{runs:[{text:"Кыргызча - 吉尔吉斯语"}]}},{languageCode:"xh",languageName:{runs:[{text:"isiXhosa - 科萨语"}]}},{languageCode:"co",languageName:{runs:[{text:"Corsu - 科西嘉语"}]}},{languageCode:"hr",languageName:{runs:[{text:"Hrvatski - 克罗地亚语"}]}},{languageCode:"qu",languageName:{runs:[{text:"Runa Simi - 克丘亚语"}]}},{languageCode:"ku",languageName:{runs:[{text:"Kurd\xee - 库尔德语"}]}},{languageCode:"la",languageName:{runs:[{text:"lingua latīna - 拉丁语"}]}},{languageCode:"lv",languageName:{runs:[{text:"Latviešu - 拉脱维亚语"}]}},{languageCode:"lo",languageName:{runs:[{text:"ລາວ - 老挝语"}]}},{languageCode:"lt",languageName:{runs:[{text:"Lietuvių - 立陶宛语"}]}},{languageCode:"ln",languageName:{runs:[{text:"Ling\xe1la - 林加拉语"}]}},{languageCode:"lg",languageName:{runs:[{text:"Luganda - 卢干达语"}]}},{languageCode:"lb",languageName:{runs:[{text:"L\xebtzebuergesch - 卢森堡语"}]}},{languageCode:"rw",languageName:{runs:[{text:"Kinyarwanda - 卢旺达语"}]}},{languageCode:"ro",languageName:{runs:[{text:"Rom\xe2nă - 罗马尼亚语"}]}},{languageCode:"mt",languageName:{runs:[{text:"Malti - 马耳他语"}]}},{languageCode:"mr",languageName:{runs:[{text:"मराठी - 马拉地语"}]}},{languageCode:"mg",languageName:{runs:[{text:"Malagasy - 马拉加斯语"}]}},{languageCode:"ml",languageName:{runs:[{text:"മലയാളം - 马拉雅拉姆语"}]}},{languageCode:"ms",languageName:{runs:[{text:"Bahasa Melayu - 马来语"}]}},{languageCode:"mk",languageName:{runs:[{text:"македонски - 马其顿语"}]}},{languageCode:"mi",languageName:{runs:[{text:"Māori - 毛利语"}]}},{languageCode:"mn",languageName:{runs:[{text:"Монгол - 蒙古语"}]}},{languageCode:"bn",languageName:{runs:[{text:"বাংলা - 孟加拉语"}]}},{languageCode:"my",languageName:{runs:[{text:"ဗမာစာ - 缅甸语"}]}},{languageCode:"hmn",languageName:{runs:[{text:"Hmoob - 苗语"}]}},{languageCode:"af",languageName:{runs:[{text:"Afrikaans - 南非荷兰语"}]}},{languageCode:"st",languageName:{runs:[{text:"Sesotho - 南索托语"}]}},{languageCode:"ne",languageName:{runs:[{text:"नेपाली - 尼泊尔语"}]}},{languageCode:"no",languageName:{runs:[{text:"Norsk - 挪威语"}]}},{languageCode:"pa",languageName:{runs:[{text:"ਪੰਜਾਬੀ - 旁遮普语"}]}},{languageCode:"pt",languageName:{runs:[{text:"Portugu\xeas - 葡萄牙语"}]}},{languageCode:"ps",languageName:{runs:[{text:"پښتو - 普什图语"}]}},{languageCode:"ny",languageName:{runs:[{text:"chiCheŵa - 齐切瓦语"}]}},{languageCode:"ja",languageName:{runs:[{text:"日本語 - 日语"}]}},{languageCode:"sv",languageName:{runs:[{text:"Svenska - 瑞典语"}]}},{languageCode:"sm",languageName:{runs:[{text:"Gagana Samoa - 萨摩亚语"}]}},{languageCode:"sr",languageName:{runs:[{text:"Српски језик - 塞尔维亚语"}]}},{languageCode:"si",languageName:{runs:[{text:"සිංහල - 僧伽罗语"}]}},{languageCode:"sn",languageName:{runs:[{text:"ChiShona - 绍纳语"}]}},{languageCode:"eo",languageName:{runs:[{text:"Esperanto - 世界语"}]}},{languageCode:"sk",languageName:{runs:[{text:"Slovenčina - 斯洛伐克语"}]}},{languageCode:"sl",languageName:{runs:[{text:"Slovenščina - 斯洛文尼亚语"}]}},{languageCode:"sw",languageName:{runs:[{text:"Kiswahili - 斯瓦希里语"}]}},{languageCode:"gd",languageName:{runs:[{text:"G\xe0idhlig - 苏格兰盖尔语"}]}},{languageCode:"ceb",languageName:{runs:[{text:"Cebuano - 宿务语"}]}},{languageCode:"so",languageName:{runs:[{text:"Soomaaliga - 索马里语"}]}},{languageCode:"tg",languageName:{runs:[{text:"тоҷикӣ - 塔吉克语"}]}},{languageCode:"te",languageName:{runs:[{text:"తెలుగు - 泰卢固语"}]}},{languageCode:"ta",languageName:{runs:[{text:"தமிழ் - 泰米尔语"}]}},{languageCode:"th",languageName:{runs:[{text:"ไทย - 泰语"}]}},{languageCode:"ti",languageName:{runs:[{text:"ትግርኛ - 提格利尼亚语"}]}},{languageCode:"tr",languageName:{runs:[{text:"T\xfcrk\xe7e - 土耳其语"}]}},{languageCode:"tk",languageName:{runs:[{text:"T\xfcrkmen - 土库曼语"}]}},{languageCode:"cy",languageName:{runs:[{text:"Cymraeg - 威尔士语"}]}},{languageCode:"ug",languageName:{runs:[{text:"ئۇيغۇرچە - 维吾尔语"}]}},{languageCode:"und",languageName:{runs:[{text:"Unknown - 未知语言"}]}},{languageCode:"ur",languageName:{runs:[{text:"اردو - 乌尔都语"}]}},{languageCode:"uk",languageName:{runs:[{text:"Українська - 乌克兰语"}]}},{languageCode:"uz",languageName:{runs:[{text:"O‘zbek - 乌兹别克语"}]}},{languageCode:"es",languageName:{runs:[{text:"Espa\xf1ol - 西班牙语"}]}},{languageCode:"fy",languageName:{runs:[{text:"Frysk - 西弗里西亚语"}]}},{languageCode:"iw",languageName:{runs:[{text:"עברית - 希伯来语"}]}},{languageCode:"el",languageName:{runs:[{text:"Ελληνικά - 希腊语"}]}},{languageCode:"haw",languageName:{runs:[{text:"ʻŌlelo Hawaiʻi - 夏威夷语"}]}},{languageCode:"sd",languageName:{runs:[{text:"سنڌي - 信德语"}]}},{languageCode:"hu",languageName:{runs:[{text:"Magyar - 匈牙利语"}]}},{languageCode:"su",languageName:{runs:[{text:"Basa Sunda - 巽他语"}]}},{languageCode:"hy",languageName:{runs:[{text:"Հայերեն - 亚美尼亚语"}]}},{languageCode:"ig",languageName:{runs:[{text:"Igbo - 伊博语"}]}},{languageCode:"it",languageName:{runs:[{text:"Italiano - 意大利语"}]}},{languageCode:"yi",languageName:{runs:[{text:"ייִדיש - 意第绪语"}]}},{languageCode:"hi",languageName:{runs:[{text:"हिन्दी - 印地语"}]}},{languageCode:"id",languageName:{runs:[{text:"Bahasa Indonesia - 印度尼西亚语"}]}},{languageCode:"en",languageName:{runs:[{text:"English - 英语"}]}},{languageCode:"yo",languageName:{runs:[{text:"Yor\xf9b\xe1 - 约鲁巴语"}]}},{languageCode:"vi",languageName:{runs:[{text:"Tiếng Việt - 越南语"}]}},{languageCode:"jv",languageName:{runs:[{text:"Basa Jawa - 爪哇语"}]}},{languageCode:"zh-Hant",languageName:{runs:[{text:"中文（繁體） - 中文（繁体）"}]}},{languageCode:"zh-Hans",languageName:{runs:[{text:"中文（简体）"}]}},{languageCode:"zu",languageName:{runs:[{text:"isiZulu - 祖鲁语"}]}},{languageCode:"kri",languageName:{runs:[{text:"Kr\xec\xec - 克里语"}]}}]}}},Netflix:{Settings:{Type:"Translate",Languages:["AUTO","ZH"]},Configs:{Languages:{AR:"ar",CS:"cs",DA:"da",DE:"de",EN:"en","EN-GB":"en-GB","EN-US":"en-US","EN-US SDH":"en-US SDH",ES:"es","ES-419":"es-419","ES-ES":"es-ES",FI:"fi",FR:"fr",HE:"he",HR:"hr",HU:"hu",ID:"id",IT:"it",JA:"ja",KO:"ko",MS:"ms",NB:"nb",NL:"nl",PL:"pl",PT:"pt","PT-PT":"pt-PT","PT-BR":"pt-BR",RO:"ro",RU:"ru",SV:"sv",TH:"th",TR:"tr",UK:"uk",VI:"vi",IS:"is",ZH:"zh","ZH-HANS":"zh-Hans","ZH-HK":"zh-HK","ZH-HANT":"zh-Hant"}}},Spotify:{Settings:{Types:["Translate","External"],Languages:["AUTO","ZH"]}},Composite:{Settings:{CacheSize:20,ShowOnly:!1,Position:"Reverse",Offset:0,Tolerance:1e3}},Translate:{Settings:{Vendor:"Gemini",ShowOnly:!1,Position:"Forward",CacheSize:20,Method:"Part",Times:3,Interval:500,Exponential:!0}},External:{Settings:{SubVendor:"URL",LrcVendor:"NeteaseMusic",CacheSize:50}},API:{Settings:{Gemini:{APIKey:"",Model:"gemini-3.5-flash-lite",BatchSize:400},GoogleCloud:{Version:"v2",Mode:"Key",Auth:""},Microsoft:{Version:"Azure",Mode:"Token",Region:"",Auth:""},DeepL:{Version:"Free",Auth:""},DeepLX:{Endpoint:"",Auth:""},URL:"",NeteaseMusic:{PhoneNumber:"",Password:""}}},Default:{Settings:{Type:"Translate",Types:["Official","Translate"],Languages:["EN","ZH"],CacheSize:50,LogLevel:"WARN"},Configs:{breakLine:{"text/xml":"&#x000A;","application/xml":"&#x000A;","text/vtt":"\n","application/vtt":"\n","text/json":"\n","application/json":"\n"}}}},h="HBOAI.Library.v1";class p{constructor(e={}){this.Name="Translate",this.Version="1.0.7",n.log(`🟧 ${this.Name} v${this.Version}`),this.Source="AUTO",this.Target="ZH",this.API={},Object.assign(this,e)}#h={Google:{AUTO:"auto",AF:"af",AM:"am",AR:"ar",AS:"as",AY:"ay",AZ:"az",BG:"bg",BE:"be",BM:"bm",BN:"bn",BHO:"bho",CS:"cs",DA:"da",DE:"de",EL:"el",EU:"eu",EN:"en","EN-GB":"en","EN-US":"en","EN-US SDH":"en",ES:"es","ES-419":"es","ES-ES":"es",ET:"et",FI:"fi",FR:"fr","FR-CA":"fr",HU:"hu",ID:"id",IS:"is",IT:"it",JA:"ja",KM:"km",KO:"ko",LT:"lt",LV:"lv",NL:"nl",NO:"no",PL:"pl",PT:"pt","PT-PT":"pt","PT-BR":"pt",PA:"pa",RO:"ro",RU:"ru",SK:"sk",SL:"sl",SQ:"sq",ST:"st",SV:"sv",TH:"th",TR:"tr",UK:"uk",UR:"ur",VI:"vi",ZH:"zh","ZH-HANS":"zh-CN","ZH-HK":"zh-TW","ZH-HANT":"zh-TW"},Microsoft:{AUTO:"",AF:"af",AM:"am",AR:"ar",AS:"as",AY:"ay",AZ:"az",BG:"bg",BE:"be",BM:"bm",BN:"bn",BHO:"bho",CS:"cs",DA:"da",DE:"de",EL:"el",EU:"eu",EN:"en","EN-GB":"en","EN-US":"en","EN-US SDH":"en",ES:"es","ES-419":"es","ES-ES":"es",ET:"et",FI:"fi",FR:"fr","FR-CA":"fr-ca",HU:"hu",ID:"id",IS:"is",IT:"it",JA:"ja",KM:"km",KO:"ko",LT:"lt",LV:"lv",NL:"nl",NO:"no",PL:"pl",PT:"pt","PT-PT":"pt-pt","PT-BR":"pt",PA:"pa",RO:"ro",RU:"ru",SK:"sk",SL:"sl",SQ:"sq",ST:"st",SV:"sv",TH:"th",TR:"tr",UK:"uk",UR:"ur",VI:"vi",ZH:"zh-Hans","ZH-HANS":"zh-Hans","ZH-HK":"yue","ZH-HANT":"zh-Hant"},DeepL:{AUTO:"",BG:"BG",CS:"CS",DA:"DA",DE:"de",EL:"el",EN:"EN",ES:"ES",ET:"ET",FI:"FI",FR:"FR",HU:"HU",ID:"ID",IT:"IT",JA:"JA",KO:"ko",LT:"LT",LV:"LV",NL:"NL",PL:"PL",PT:"PT",RO:"RO",RU:"RU",SK:"SK",SL:"SL",SV:"SV",TR:"TR",ZH:"ZH"},Baidu:{AUTO:"auto",AR:"ara",CS:"cs",DA:"dan",DE:"de",EL:"el",EN:"en",ES:"spa",ET:"est",FI:"fin",FR:"fra",HU:"hu",IT:"it",JA:"jp",KO:"kor",NL:"nl",PL:"pl",PT:"pt",RO:"RO",RU:"rom",SL:"slo",SV:"swe",TH:"th",VI:"vie",ZH:"zh","ZH-HANS":"zh","ZH-HK":"cht","ZH-HANT":"cht"}};#p=["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36","Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0","Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134","Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148","Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1","Mozilla/5.0 (Windows NT 10.0; Win64; x64)","Mozilla/5.0 (Windows NT 6.1; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0"];#f={Gemini:400,Google:120,GoogleCloud:120,Microsoft:99,Azure:99,DeepL:49};async Gemini(e=[],a=this.Source,t=this.Target,n=this.API){e=Array.isArray(e)?e:[e];let s=n?.APIKey??n?.Key??n?.Auth;if(!s)throw Error("Gemini API Key 未填写");let r=n?.Model||"gemini-3.5-flash-lite",o={AUTO:"the detected source language",EN:"English","EN-US":"English","EN-GB":"English",ZH:"Simplified Chinese","ZH-HANS":"Simplified Chinese","ZH-HK":"Traditional Chinese (Hong Kong)","ZH-HANT":"Traditional Chinese"},l=o[a]??a,g=o[t]??t,u=r.startsWith("gemini-3")?{thinkingLevel:"minimal"}:{thinkingBudget:0},d=e.map((e,a)=>({id:a,text:e})),m=new Map,c=async(e,a=1)=>{let t=Date.now(),o=n?.DeadlineAt?n.DeadlineAt-Date.now()-500:55e3;if(o<1e3)throw Error("字幕翻译等待超时，请重试");let d=new Set(e.map(e=>e.id)),h=Math.min(49152,Math.max(1024,Math.ceil(2*e.map(e=>e.text).join("").length+24*e.length))),p={url:`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(r)}:generateContent`,timeout:Math.min(55e3,o),headers:{"Content-Type":"application/json","x-goog-api-key":s},body:JSON.stringify({systemInstruction:{parts:[{text:`You are a professional film and TV subtitle translator. Translate from ${l} to ${g}. Use natural, concise spoken language. Neighboring items may be consulted only to understand names, pronouns, and context. Every output text must translate only the source text from the input object with the same numeric id. Never move a word, clause, or meaning from one id to another, even when a sentence spans multiple subtitle cues or target-language word order would sound more natural. Preserve an incomplete source fragment as an incomplete translated fragment instead of completing it with content from a neighboring item. Preserve speaker dashes, line breaks, names, ellipses and tone. For every input object, return exactly one object with the same numeric id and only its translated text. Input ids may be non-consecutive. Never omit, invent, merge, reorder, or renumber ids. Each id is displayed at a different timestamp, so cross-id semantic reordering is an incorrect translation.`}]},contents:[{role:"user",parts:[{text:JSON.stringify(e)}]}],generationConfig:{thinkingConfig:u,temperature:0,maxOutputTokens:h,responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{translations:{type:"ARRAY",items:{type:"OBJECT",properties:{id:{type:"INTEGER"},text:{type:"STRING"}},required:["id","text"]}}},required:["translations"]}}})};try{let e,a=await i(p),t=JSON.parse(a.body||"{}");if(t?.error)throw Error(`Gemini API ${t.error.code??""}: ${t.error.message??"请求失败"}`);let n=t?.candidates?.[0]?.content?.parts?.map(e=>e?.text??"").join("")??"";try{e=JSON.parse(n)}catch{let a=n.match(/\{[\s\S]*\}/);if(!a)throw Error("Gemini 未返回有效 JSON");e=JSON.parse(a[0])}let s=e?.translations;Array.isArray(s)&&s.forEach(e=>{Number.isInteger(e?.id)&&d.has(e.id)&&"string"==typeof e?.text&&!m.has(e.id)&&m.set(e.id,e.text)})}catch(s){let n=String(s?.message??s);if(a>0&&Date.now()-t<15e3&&!/^Gemini API \d+:/i.test(n))return await new Promise(e=>setTimeout(e,300)),c(e,a-1);throw s}},h=d;for(let e=0;e<=2&&0!==h.length;e++)await c(h),0!==(h=d.filter(e=>!m.has(e.id))).length&&e<2&&await new Promise(a=>setTimeout(a,150*(e+1)));if(m.size!==e.length)throw Error(`Gemini 返回 ID 不完整：期望 ${e.length}，实际 ${m.size}，补译后仍缺 ${e.length-m.size}`);return e.map((e,a)=>m.get(a))}async Google(e=[],a=this.Source,t=this.Target){e=Array.isArray(e)?e:[e],a=this.#h.Google[a]??this.#h.Google[a?.split?.(/[-_]/)?.[0]]??a.toLowerCase(),t=this.#h.Google[t]??this.#h.Google[t?.split?.(/[-_]/)?.[0]]??t.toLowerCase();let n=[{url:"https://translate.googleapis.com/translate_a/single?client=gtx&dt=t",headers:{Accept:"*/*","User-Agent":this.#p[Math.floor(Math.random()*this.#p.length)],Referer:"https://translate.google.com"}},{url:"https://clients5.google.com/translate_a/t?client=dict-chrome-ex",headers:{Accept:"*/*","User-Agent":this.#p[Math.floor(Math.random()*this.#p.length)]}},{url:"https://translate.google.com/translate_a/single?client=it&dt=qca&dt=t&dt=rmt&dt=bd&dt=rms&dt=sos&dt=md&dt=gt&dt=ld&dt=ss&dt=ex&otf=2&dj=1&hl=en&ie=UTF-8&oe=UTF-8",headers:{Accept:"*/*","User-Agent":"GoogleTranslate/6.29.59279 (iPhone; iOS 15.4; en; iPhone14,2)"}},{url:"https://translate.googleapis.com/translate_a/single?client=gtx&dj=1&source=bubble&dt=t&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=at",headers:{Accept:"*/*","User-Agent":"GoogleTranslate/6.29.59279 (iPhone; iOS 15.4; en; iPhone14,2)"}}],s=n[Math.floor(Math.random()*(n.length-2))];return s.url=`${s.url}&sl=${a}&tl=${t}&q=${encodeURIComponent(e.join("\r"))}`,await i(s).then(a=>{let t=JSON.parse(a.body);return Array.isArray(t)?Array.isArray(t?.[0])?1===t.length?(t[0].pop(),e=t[0]??`翻译失败, vendor: google`):e=t?.[0]?.map(e=>e?.[0]??`翻译失败, vendor: google`):e=t??`翻译失败, vendor: google`:t?.sentences&&(e=t?.sentences?.map(e=>e?.trans??`翻译失败, vendor: google`)),e?.join("")?.split(/\r/)}).catch(e=>Promise.reject(e))}async GoogleCloud(e=[],a=this.Source,t=this.Target,n=this.API){e=Array.isArray(e)?e:[e],a=this.#h.Google[a]??this.#h.Google[a?.split?.(/[-_]/)?.[0]]??a.toLowerCase(),t=this.#h.Google[t]??this.#h.Google[t?.split?.(/[-_]/)?.[0]]??t.toLowerCase();let s={},r="https://translation.googleapis.com";switch(n?.Version){case"v2":default:s.url=`${r}/language/translate/v2`,s.headers={"User-Agent":"DualSubs","Content-Type":"application/json; charset=utf-8"},s.body=JSON.stringify({q:e,source:a,target:t,format:"html"}),n?.Mode==="Token"?s.headers.Authorization=`Bearer ${n?.Token??n?.Auth}`:s.url+=`?key=${n?.Key??n?.Auth}`;break;case"v3":s.url=`${r}/v3/projects/${n?.ID}`,s.headers={Authorization:`Bearer ${n?.Token??n?.Auth}`,"x-goog-user-project":n?.ID,"User-Agent":"DualSubs","Content-Type":"application/json; charset=utf-8"},s.body=JSON.stringify({sourceLanguageCode:a,targetLanguageCode:t,contents:Array.isArray(e)?e:[e],mimeType:"text/html"})}return await i(s).then(e=>{let a=JSON.parse(e.body);return a?.data?.translations?.map(e=>e?.translatedText??`翻译失败, vendor: GoogleCloud`)}).catch(e=>Promise.reject(e))}async Microsoft(e=[],a=this.Source,t=this.Target,n=this.API){e=Array.isArray(e)?e:[e],a=this.#h.Microsoft[a]??this.#h.Microsoft[a?.split?.(/[-_]/)?.[0]]??a.toLowerCase(),t=this.#h.Microsoft[t]??this.#h.Microsoft[t?.split?.(/[-_]/)?.[0]]??t.toLowerCase();let s={},r="https://api.cognitive.microsofttranslator.com";switch(n?.Version){case"Azure":default:r="https://api.cognitive.microsofttranslator.com";break;case"AzureCN":r="https://api.translator.azure.cn";break;case"AzureUS":r="https://api.cognitive.microsofttranslator.us"}switch(s.url=`${r}/translate?api-version=3.0&textType=html&${a?`from=${a}`:""}&to=${t}`,s.headers={"Content-Type":"application/json; charset=UTF-8",Accept:"application/json, text/javascript, */*; q=0.01","Accept-Language":"zh-hans"},n?.Mode){case"Token":default:s.headers.Authorization=`Bearer ${n?.Token??n?.Auth}`;break;case"Key":s.headers["Ocp-Apim-Subscription-Key"]=n?.Key??n?.Auth,s.headers["Ocp-Apim-Subscription-Region"]=n?.Region}return s.body=JSON.stringify(e=e.map(e=>({text:e}))),await i(s).then(e=>{let a=JSON.parse(e.body);return a?.map(e=>e?.translations?.[0]?.text??`翻译失败, vendor: Microsoft`)}).catch(e=>Promise.reject(e))}async DeepL(e=[],a=this.Source,t=this.Target,n=this.API){e=Array.isArray(e)?e:[e],a=this.#h.DeepL[a]??this.#h.DeepL[a?.split?.(/[-_]/)?.[0]]??a.toLowerCase(),t=this.#h.DeepL[t]??this.#h.DeepL[t?.split?.(/[-_]/)?.[0]]??t.toLowerCase();let s={},r="https://api-free.deepl.com";switch(n?.Version){case"Free":default:r="https://api-free.deepl.com";break;case"Pro":r="https://api.deepl.com"}s.url=`${r}/v2/translate`,s.headers={"User-Agent":"DualSubs","Content-Type":"application/json",Authorization:`DeepL-Auth-Key ${n?.Token??n?.Auth}`};let o={text:e,target_lang:t,tag_handling:"html"};return a&&(o.source_lang=a),s.body=JSON.stringify(o),await i(s).then(e=>{let a=JSON.parse(e.body);return a?.translations?.map(e=>e?.text??`翻译失败, vendor: DeepL`)}).catch(e=>Promise.reject(e))}async BaiduFanyi(e=[],a=this.Source,t=this.Target,s=this.API){e=Array.isArray(e)?e:[e],a=this.#h.Baidu[a]??this.#h.Baidu[a?.split?.(/[-_]/)?.[0]]??a.toLowerCase(),t=this.#h.Baidu[t]??this.#h.Baidu[t?.split?.(/[-_]/)?.[0]]??t.toLowerCase();let r={};r.url="https://fanyi-api.baidu.com/api/trans/vip/language",r.headers={"User-Agent":"DualSubs","Content-Type":"application/x-www-form-urlencoded"};let o=new Date().getTime();return r.body=`q=${encodeURIComponent(e.join("\n"))}&from=${a}&to=${t}&appid=${s.id}&salt=${o}&sign=${d(s.id+e+o+s.key)}`,await i(r).then(e=>{let a=JSON.parse(e.body);return a?.trans_result?.map(e=>e?.dst??`翻译失败, vendor: BaiduFanyi`)}).catch(e=>Promise.reject(n.error(e)))}async YoudaoAI(e=[],a=this.Source,t=this.Target,n=this.API){e=Array.isArray(e)?e:[e],a=this.#h.Youdao[a]??this.#h.Youdao[a?.split?.(/[-_]/)?.[0]],t=this.#h.Youdao[t]??this.#h.Youdao[t?.split?.(/[-_]/)?.[0]];let s={};return s.url="https://openapi.youdao.com/api",s.headers={"User-Agent":"DualSubs","Content-Type":"application/json; charset=utf-8"},s.body={q:e,from:a,to:t,appKey:n?.Key,salt:new Date().getTime(),signType:"v3",sign:"",curtime:Math.floor(new Date/1e3)},await i(s).then(e=>{let a=JSON.parse(e.body);return a?.data??`翻译失败, vendor: DeepL`}).catch(e=>Promise.reject(e))}}let f="@HBOAI.Translate.Caches.NativeVTT",y="@HBOAI.Translate.Caches.Subtitles",C="@HBOAI.Translate.State.InFlight",x="@HBOAI.Translate.State.Cooldown",N=Date.now()+55e3,T=new class{constructor(e,a=20,t=()=>{}){this.store=e,this.limit=a,this.onEvict=t}read(){try{let e=JSON.parse(this.store.read(h)||"{}");return{version:1,films:Array.isArray(e.films)?e.films:[]}}catch{return{version:1,films:[]}}}film(e){return this.read().films.find(a=>a.id===e)}native(e,a){return this.film(e)?.native?.[a]?.body}translation(e,a){return this.film(e)?.translations?.[a]}adoptIdentity(e,a){if(e===a)return;let t=this.read(),n=t.films.find(a=>a.id===e);if(!n)return;let s=t.films.find(e=>e.id===a);if(s){let e=t.films.indexOf(n)<t.films.indexOf(s)?n:s;e.id=a,e.addedAt=Math.min(n.addedAt,s.addedAt),e.native={...n.native,...s.native},e.translations={...n.translations,...s.translations},t.films=t.films.filter(a=>a===e||a!==n&&a!==s)}else n.id=a;this.store.write(JSON.stringify(t),h)}put(e,a,t,n){let s=this.read(),r=s.films.find(a=>a.id===e);r||(r={id:e,addedAt:Date.now(),native:{},translations:{}},s.films.push(r)),r[a]||={},r[a][t]="native"===a?{body:n}:n;let i=s.films.splice(0,Math.max(0,s.films.length-this.limit)),o=this.store.write(JSON.stringify(s),h);return o&&i.length&&this.onEvict(i.map(e=>e.id)),{written:!!o,films:s.films.length,segments:Object.keys(r.translations).length}}}($persistentStore,20,()=>{o.setItem(f,[]),o.setItem(y,[])}),S="cue-isolation-v2",b=new u($request.url),w="undefined"==typeof $response,A=w?{status:200,headers:{"Content-Type":"text/vtt; charset=utf-8","Cache-Control":"private, max-age=60"},body:""}:$response;function v(e){return"string"==typeof e&&/^WEBVTT(?:\s|$)/.test(e)&&/\d{2}:\d{2}(?::\d{2})?\.\d{2,3}\s+-->/.test(e)}async function k(e="Gemini",a="Part",t=[],[n="AUTO",s="ZH"],r={},i=3,o=100,l=!0){let g=120;"Gemini"===e?g=Math.max(100,Math.min(600,Number.parseInt(r?.BatchSize??400,10)||400)):["Microsoft","Azure"].includes(e)?g=99:"DeepL"===e?g=49:"DeepLX"===e&&(g=20);let u="Gemini"===e?0:i;if("Row"===a)return await Promise.all(t.map(a=>E(()=>new p({Source:n,Target:s,API:r})[e](a),u,o,l)));if("Gemini"===e){var d,m;let a,i,c=(d=t,m=g,i=Array.from({length:a=Math.max(1,Math.ceil(d.length/m))},()=>[]),d.forEach((e,t)=>i[t%a].push({index:t,text:e})),i),h=await Promise.all(c.map(a=>E(()=>new p({Source:n,Target:s,API:r})[e](a.map(e=>e.text)),u,o,l))),f=Array(t.length);return h.forEach((e,a)=>{c[a].forEach((a,t)=>{f[a.index]=e[t]})}),f}let c=function(e,a){let t=0,n=[];for(;t<e.length;)n.push(e.slice(t,t+=a));return n}(t,g);return await Promise.all(c.map(a=>E(()=>new p({Source:n,Target:s,API:r})[e](a),u,o,l))).then(e=>e.flat(1/0))}async function E(e,a=3,t=100,n=!0){try{return await e()}catch(s){if(!a)throw s;return await new Promise(e=>setTimeout(e,t)),E(e,a-1,n?2*t:t,n)}}async function L(e,a){let t=`${Date.now()}-${Math.random().toString(36).slice(2)}`,n=Date.now();for(;Date.now()-n<48e3&&Date.now()<N-2e3;){let n=H(e,a);if(n)return{translation:n};let s=o.getItem(x,{});if(Number(s?.expiresAt??0)>Date.now()){let e=Math.max(1,Math.ceil((Number(s.expiresAt)-Date.now())/1e3));throw Error(`Gemini 冷却中，请约 ${e} 秒后重试：${s?.reason??"上次请求失败"}`)}let r=o.getItem(C,{});if(Number(r?.expiresAt??0)<=Date.now()){o.setItem(C,{cacheKey:e,owner:t,expiresAt:Date.now()+58e3}),await new Promise(e=>setTimeout(e,25));let a=o.getItem(C,{});if(a?.owner===t&&a?.cacheKey===e)return{owner:t}}await new Promise(e=>setTimeout(e,400))}throw Error("同一字幕正在翻译，等待缓存超时")}function H(a,t){let n=(function(){let a=o.getItem(y,[]);if("string"==typeof a)try{a=JSON.parse(a)}catch{a=[]}let t=new Map(Array.isArray(a)?a:[]);for(let[a,n]of Object.entries(T.film(e)?.translations||{}))t.set(a,n);return t})().get(a);return Array.isArray(n)&&n.length===t?n:null}function I(a,t){let n=T.put(e,"translations",a,t),s=n.written&&!!T.translation(e,a);return{cache:new Map(Object.entries(T.film(e)?.translations||{})),size:n.segments,films:n.films,verified:s}}(async()=>{var a,t,r,i;let g;if(!w)return;try{g=JSON.parse($persistentStore.read("HBOAI.Context.v1")||"{}")}catch{throw Error("AI subtitle context missing")}let h=g.segments?.[$request.url];if(!h||h.expires<Date.now()||!h.source)throw Error("AI subtitle context expired");if(!/^https:\/\/[^/?#@]+\//.test(h.source)||!/(?:^|\.)(?:e\.hbo|media\.max\.com|media\.h264\.io)$/.test(h.source.split("/")[2]))throw Error("Invalid subtitle source");a=g.plans?.[h.id],t=h.id,e=a?.editId?`edit:${a.editId}`:`manifest:${t}`,T.adoptIdentity(`manifest:${h.id}`,e);let p=d(new u(h.source).pathname).toString(),y=o.getItem(f,[]),E=Array.isArray(y)&&y.find(e=>e.key===d(h.source).toString()&&e.expires>Date.now()),$=T.native(e,p),R=$||E?.body;if(v(R))A.body=R,$||T.put(e,"native",p,R),A.headers["X-HBO-AI-Native-Cache"]="hit";else{if(A.body=await new Promise((e,a)=>{$httpClient.get({url:h.source,timeout:12e3},(t,n,s)=>{if(t||200!==Number(n?.status||n?.statusCode))return a(Error("English subtitle fetch failed; choose external subtitles"));e(String(s||""))})}),!v(A.body))throw Error("English subtitles unavailable; choose external subtitles");T.put(e,"native",p,A.body),A.headers["X-HBO-AI-Native-Cache"]="miss"}A.headers["X-HBO-AI-Cache-Unit"]="film; limit=20",n.logLevel="ERROR";let{Settings:P,Caches:O}=function(e,a,t){n.log("☑️ Set Environment Variables");let{Settings:r,Caches:i,Configs:g}=function(e,a,t){a=[a].flat(1/0);let n={Settings:t?.Default?.Settings||{},Configs:t?.Default?.Configs||{},Caches:{}};switch(a.forEach(e=>{n.Settings={...n.Settings,...t?.[e]?.Settings},n.Configs={...n.Configs,...t?.[e]?.Configs}}),typeof $argument){case"string":$argument=Object.fromEntries($argument.split("&").map(e=>e.split("=",2).map(e=>e.replace(/\"/g,""))));case"object":{let e={};Object.keys($argument).forEach(a=>s.set(e,a,$argument[a])),n.Settings={...n.Settings,...e}}}let r=o.getItem(e);return r&&a.forEach(e=>{switch(typeof r?.[e]?.Settings){case"string":r[e].Settings=JSON.parse(r[e].Settings||"{}");case"object":n.Settings={...n.Settings,...r[e].Settings}}switch(typeof r?.[e]?.Caches){case"string":r[e].Caches=JSON.parse(r[e].Caches||"{}");case"object":n.Caches={...n.Caches,...r[e].Caches}}}),function e(a,t){for(let n in a){let s=a[n];a[n]="object"==typeof s&&null!==s?e(s,t):t(n,s)}return a}(n.Settings,(e,a)=>("true"===a||"false"===a?a=JSON.parse(a):"string"==typeof a&&(a=a.includes(",")?a.split(",").map(e=>l(e)):l(a)),a)),n}(e,a,t);return Array.isArray(r?.Types)||(r.Types=r.Types?[r.Types]:[]),n.info(`typeof Settings: ${typeof r}`),("object"!=typeof i?.Playlists||Array.isArray(i?.Playlists))&&(i.Playlists={}),i.Playlists.Master=new Map(JSON.parse(i?.Playlists?.Master||"[]")),i.Playlists.Subtitle=new Map(JSON.parse(i?.Playlists?.Subtitle||"[]")),"object"!=typeof i?.Subtitles&&(i.Subtitles=new Map(JSON.parse(i?.Subtitles||"[]"))),("object"!=typeof i?.Metadatas||Array.isArray(i?.Metadatas))&&(i.Metadatas={}),"object"!=typeof i?.Metadatas?.Tracks&&(i.Metadatas.Tracks=new Map(JSON.parse(i?.Metadatas?.Tracks||"[]"))),n.log("✅ Set Environment Variables"),{Settings:r,Caches:i,Configs:g}}("HBOAI",[["Universal","Translate","API"]],c),U=(...e)=>{if($argument&&"object"==typeof $argument)for(let a of e){let e=$argument[a],t=s.get($argument,a);if(null!=e&&""!==e)return e;if(null!=t&&""!==t)return t}},B=U("GeminiAPIKey","Gemini.APIKey");P.Vendor="Gemini",P.Gemini={...P.Gemini,APIKey:B||P.GeminiAPIKey||P.Gemini?.APIKey||"",Model:U("GeminiModel","Gemini.Model")||P.GeminiModel||P.Gemini?.Model,BatchSize:400,DeadlineAt:N},A.headers["X-DualSubs-Gemini-Key-Source"]=B?"argument":P.Gemini?.APIKey?"storage":"missing",A.headers["X-DualSubs-Gemini-Model"]=P.Gemini.Model,n.logLevel="WARN";let M=[(h.language||"AUTO").toUpperCase(),(b.searchParams?.get("tlang")??O?.tlang)?.toUpperCase?.()??P.Languages[1]],D=m.parse(A.body),z=D?.body.map(e=>(e?.text??"​")?.replace(/<\/?[^<>]+>/g,"")),G=d(`${P.Vendor}|${P?.Gemini?.Model??""}|${M.join("|")}|${A.body}`).toString(),j=d(`${S}|${G}`).toString();A.headers["X-DualSubs-Gemini-Cache-Revision"]=S;let K=H(j,z.length);if(Array.isArray(K)&&K.length===z.length)T.translation(e,j)||I(j,K),n.info("Gemini 字幕缓存命中"),A.headers["X-DualSubs-Gemini-Coordinator"]="cache",A.headers["X-DualSubs-Gemini"]=`cache-hit; cues=${K.length}`;else{let e=await L(j,z.length);if(e.translation)K=e.translation,A.headers["X-DualSubs-Gemini-Coordinator"]="wait-cache-hit",A.headers["X-DualSubs-Gemini"]=`cache-hit; cues=${K.length}`;else{A.headers["X-DualSubs-Gemini-Coordinator"]="leader";try{if(K=await k(P.Vendor,P.Method,z,M,P?.[P?.Vendor],P?.Times,P?.Interval,P?.Exponential),Array.isArray(K)&&K.length===z.length){let e=I(j,K);O.Subtitles=e.cache,A.headers["X-DualSubs-Gemini-Cache"]=`${e.verified?"write-ok":"write-failed"}; films=${e.films}; segments=${e.size}`,o.setItem(x,{expiresAt:0,reason:""})}A.headers["X-DualSubs-Gemini"]=`translated; cues=${K.length}`}catch(t){let e,a;throw r=t,e=String(r?.message??r),a=/Gemini API 429|quota/i.test(e)?6e4:8e3,o.setItem(x,{expiresAt:Date.now()+a,reason:e.slice(0,120)}),t}finally{let a;i=e.owner,a=o.getItem(C,{}),a?.owner===i&&o.setItem(C,{cacheKey:"",owner:"",expiresAt:0})}}}D.body=D.body.map((e,a)=>(e.text=function(e,a,t=!1,n="Forward",s="\n"){return t?a:"Reverse"===n?`${a}${s}${e}`:`${e}${s}${a}`}(e?.text??"​",K?.[a],P?.ShowOnly,P?.Position),e)),A.body=m.stringify(D)})().catch(e=>{n.error(e),w&&(A.status=502,A.body="WEBVTT\n\n"),A.headers["X-DualSubs-Gemini"]="error",A.headers["X-DualSubs-Gemini-Error"]=encodeURIComponent(String(e?.message??e)).slice(0,180)}).finally(()=>w?$done({response:A}):function(e={}){switch(a){case"Surge":e.policy&&s.set(e,"headers.X-Surge-Policy",e.policy),n.log("\uD83D\uDEA9 执行结束!",`🕛 ${new Date().getTime()/1e3-$script.startTime} 秒`),$done(e);break;case"Loon":e.policy&&(e.node=e.policy),n.log("\uD83D\uDEA9 执行结束!",`🕛 ${(new Date-$script.startTime)/1e3} 秒`),$done(e);break;case"Stash":e.policy&&s.set(e,"headers.X-Stash-Selected-Proxy",encodeURI(e.policy)),n.log("\uD83D\uDEA9 执行结束!",`🕛 ${(new Date-$script.startTime)/1e3} 秒`),$done(e);break;case"Egern":case"Shadowrocket":n.log("\uD83D\uDEA9 执行结束!"),$done(e);break;case"Quantumult X":switch(e.policy&&s.set(e,"opts.policy",e.policy),typeof(e=s.pick(e,["status","url","headers","body","bodyBytes"])).status){case"number":e.status=`HTTP/1.1 ${e.status} ${r[e.status]}`;break;case"string":case"undefined":break;default:throw TypeError(`${Function.name}: 参数类型错误, status 必须为数字或字符串`)}e.body instanceof ArrayBuffer?(e.bodyBytes=e.body,e.body=void 0):ArrayBuffer.isView(e.body)?(e.bodyBytes=e.body.buffer.slice(e.body.byteOffset,e.body.byteLength+e.body.byteOffset),e.body=void 0):e.body&&(e.bodyBytes=void 0),n.log("\uD83D\uDEA9 执行结束!"),$done(e);break;default:n.log("\uD83D\uDEA9 执行结束!"),process.exit(1)}}(A))})()})();
}
function playlist(){
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
  function get(u,timeout){return new Promise(function(resolve,reject){$httpClient.get({url:u,timeout:timeout || 12000},function(e,r,b){if(e || Number(r && (r.status || r.statusCode))!==200)reject(new Error('subtitle fetch failed'));else resolve(String(b || ''));});});}
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
    return automatic || null;
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
        var current=read();current.segments[target]={id:plan.id,source:native,expires:plan.expires,language:(plan.aiLanguages || {})[slot] || plan.sourceLanguage || 'AUTO'};save(current);lines[i]=target;index++;
      }else lines[i]=native;
    }
    if(!index)throw new Error('English main subtitles unavailable');
    return lines.join('\n');
  }
  function addTrack(lines,group,label,language,uri){lines.push('#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="'+group+'",NAME="'+label+'",LANGUAGE="'+language+'",DEFAULT=NO,AUTOSELECT=NO,URI="'+uri+'"');}
  function chinese(language){return /^(?:zh|cmn|yue)(?:-|$)/i.test(language || '');}
  function tracksFrom(body,base){
    return body.split(/\r?\n/).filter(function(l){return l.indexOf('#EXT-X-MEDIA:')===0 && l.indexOf('/__hbo_ai__/')<0;}).map(attrs).filter(function(a){return a.TYPE==='SUBTITLES' && a.URI && a.FORCED!=='YES';}).map(function(a){return {a:a,url:absolute(a.URI,base)};});
  }
  async function choose(plan,tracks){
    plan.selection='none';plan.selectedSource='';
    if(plan.officialChinese || tracks.some(function(t){return chinese(t.a.LANGUAGE);}))return;
    var candidates=tracks.filter(function(t){return allowed(t.url);}).sort(function(a,b){return Number(!/^en(?:-|$)/i.test(a.a.LANGUAGE || ''))-Number(!/^en(?:-|$)/i.test(b.a.LANGUAGE || ''));});
    // Probe at most two full tracks within one shared 10-second budget.
    var deadline=Date.now()+10000;plan.templateSource=candidates[0] ? candidates[0].url : '';
    for(var ci=0;ci<Math.min(2,candidates.length) && Date.now()<deadline-500;ci++){
      var t=candidates[ci];
      plan.verified=plan.verified || {};
      var probe=plan.verified[t.url];
      if(!probe || probe.expires<Date.now()){
        try{
          var playlistBody=await get(t.url,Math.min(5000,deadline-Date.now()));
          if(!/^#EXTM3U/.test(playlistBody) || !/#EXT-X-ENDLIST/.test(playlistBody) || /#EXT-X-MAP:|#EXT-X-KEY:/.test(playlistBody))throw new Error('unsupported subtitle playlist');
          var first=playlistBody.split(/\r?\n/).filter(function(l){return l && l.charAt(0)!=='#';}).map(function(l){return absolute(l,t.url);}).find(function(u){return u.indexOf('/gcs/'+plan.id+'/t/')>=0 && allowed(u);});
          if(!first)throw new Error('main subtitles missing');
          var text=await get(first,Math.max(1,Math.min(5000,deadline-Date.now())));
          if(!/^WEBVTT(?:\s|$)/.test(text) || !/\d{2}:\d{2}(?::\d{2})?\.\d{2,3}\s+-->/.test(text))throw new Error('subtitle cues missing');
          probe={ok:true,body:playlistBody,expires:Date.now()+5*60000};
        }catch(e){probe={ok:false,expires:Date.now()+15000};}
        // Bound storage when CDNs rotate signed URLs.
        plan.verified[t.url]=probe;Object.keys(plan.verified).filter(function(k){return !candidates.slice(0,2).some(function(t){return t.url===k;});}).forEach(function(k){delete plan.verified[k];});
      }
      if(probe.ok){plan.templateSource=t.url;plan.selection='ai';plan.selectedSource=t.url;plan.sourceLanguage=t.a.LANGUAGE || 'AUTO';return;}
    }
    if(plan.external)plan.selection='external';
  }
  function advertise(main,plan){
    var original=(main.textTracks || []).filter(function(t){return !/-x-(ai|external)$/.test(t.language || '');});
    main.textTracks=original.slice();
    if(plan.selection==='ai')main.textTracks.push({type:'subtitles',language:'zh-Hans-x-ai',displayName:'AI 翻译',format:'webvtt'});
    else if(plan.selection==='external')main.textTracks.push({type:'subtitles',language:'zh-Hans-x-external',displayName:'外部字幕',format:'webvtt'});
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
        var verified=vp.verified && vp.verified[source];var native=verified && verified.ok && verified.expires>Date.now()?verified.body:await get(source);var translated=aiPlaylist(native,source,vp,slot);
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
      plan.external=safe?gateway(plan):'';var previous=s.plans[plan.id];if(previous){plan.aiSources=previous.aiSources;plan.aiLanguages=previous.aiLanguages;plan.templateSource=previous.templateSource;plan.verified=previous.verified;}
      plan.officialChinese=(main.textTracks || []).some(function(t){return chinese(t.language) && !/-x-(ai|external)$/.test(t.language || '') && !/forced/i.test(t.type || '');});
      if(plan.officialChinese)plan.selection='none';else{
        try{await choose(plan,tracksFrom(await get(manifest.url,5000),manifest.url));}catch(e){plan.selection=plan.external?'external':'none';}
      }
      // Merge the plan only: concurrent refreshes must not wipe segment registrations.
      var latest=read();latest.plans[plan.id]=plan;save(latest);advertise(main,plan);return done({body:JSON.stringify(data),headers:Object.assign({},$response.headers,{'X-HBO-AI-Stage':'playback-options'})});
    }
    if(body.indexOf('#EXTM3U')!==0)return done();
    var idMatch=/\/gcs\/([a-f0-9-]{36})\//i.exec(u),id=idMatch && idMatch[1].toLowerCase(),plan=s.plans[id];
    if(/#EXT-X-STREAM-INF:/.test(body)){
      if(!id)return done();
      if(!plan){plan={id:id,origin:/^https:\/\/[^/]+/.exec(u)[0],duration:0,expires:Date.now()+6*3600000};s.plans[id]=plan;}
      plan.external=gateway(plan);
      var lines=body.split(/\r?\n/).filter(function(l){return !(l.indexOf('#EXT-X-MEDIA:')===0 && l.indexOf('/__hbo_ai__/')>=0);}),tracks=[];
      lines.forEach(function(l,i){if(l.indexOf('#EXT-X-MEDIA:')===0){var a=attrs(l);if(a.TYPE==='SUBTITLES' && a.URI && a.FORCED!=='YES')tracks.push({a:a,index:i,url:absolute(a.URI,u)});}});
      await choose(plan,tracks);
      var groups={},aiCount=0,externalCount=0;
      tracks.forEach(function(t){groups[t.a['GROUP-ID']]=true;});
      plan.aiSources=plan.aiSources || [];
      if(plan.selection==='ai'){
        var slot=plan.aiSources.indexOf(plan.selectedSource);if(slot<0){slot=plan.aiSources.length;plan.aiSources.push(plan.selectedSource);}
        plan.aiLanguages=plan.aiLanguages || {};plan.aiLanguages[slot]=plan.sourceLanguage;
        Object.keys(groups).forEach(function(g){addTrack(lines,g,'AI 翻译','zh-Hans-x-ai',virtual(plan,'ai',slot));aiCount++;});
      }else if(plan.selection==='external'){
        if(!tracks.length){groups['hbo-ai']=true;lines=lines.map(function(l){return l.indexOf('#EXT-X-STREAM-INF:')===0?set(l,'SUBTITLES','hbo-ai'):l;});}
        Object.keys(groups).forEach(function(g){addTrack(lines,g,'外部字幕','zh-Hans-x-external',virtual(plan,'external',0));externalCount++;});
      }
      var latest=read();latest.plans[id]=plan;s=latest;
      save(s);return done({body:lines.join('\n'),headers:Object.assign({},$response.headers,{'X-HBO-AI-Tracks':'ai='+aiCount+'; external='+externalCount})});
    }
    done();
  }
  run().catch(function(){console.log('[HBO AI] Subtitle processing failed');if(typeof $response==='undefined')done({response:{status:502,headers:{'Content-Type':'text/plain','X-HBO-AI-Error':'playlist-unavailable'},body:'Subtitle playlist unavailable; retry or choose external subtitles'}});else done();});
})();

}
function playbackRequest(){
/* HBO AI Subtitles: independent options with optional existing quality integration.
 * GPL-3.0-only; upstream quality logic: MIT, see upstream/hbo-quality/LICENSE. */
if($argument && String($argument.QualityCompatibility)==="true")(function($request,$response,$argument,$done){
/* Experimental Apple TV playback identity. This is not a captured tvOS profile. */
(function () {
  var prefix = '[HBO iPad Playback] ';
  try {
    if ($request.method !== 'POST' || !/^https:\/\/default\.any-any\.prd\.api\.discomax\.com\/playback-orchestrator\/any\/playback-orchestrator\/v1\/playbackInfo(?:\?|$)/.test($request.url)) {
      $done({});
      return;
    }
    var body = JSON.parse($request.body);
    var info = body.deviceInfo;
    if (!info || info.platform !== 'ios' || info.make !== 'Apple' || !/^ipad/i.test(info.model || '')) {
      $done({});
      return;
    }
    var originalModel = info.model;
    var version = info.os && info.os.version;
    if (!version) throw new Error('Missing OS version');
    info.model = 'AppleTV14,1';
    info.platform = 'tvos';
    info.deviceType = 'tvos/tv';
    info.os.name = 'TVOS';
    if (info.player && info.player.playerView) {
      info.player.playerView.width = 3840;
      info.player.playerView.height = 2160;
    }
    if (info.player && info.player.sdk) info.player.sdk.name = 'Discovery Player tvos native';
    var sink = body.capabilities && body.capabilities.devicePlatform && body.capabilities.devicePlatform.videoSink;
    if (sink && sink.lastKnownStatus) {
      sink.lastKnownStatus.width = 3840;
      sink.lastKnownStatus.height = 2160;
    }
    var headers = Object.assign({}, $request.headers);
    Object.keys(headers).forEach(function (key) {
      var lower = key.toLowerCase();
      if (lower === 'user-agent') {
        headers[key] = String(headers[key]).replace(/^iPad iPadOS\//, 'Apple TV tvOS/');
      } else if (lower === 'x-disco-client') {
        headers[key] = String(headers[key]).replace(/^IOS:/, 'TVOS:');
      } else if (lower === 'x-device-info') {
        headers[key] = String(headers[key]).replace(/Apple\/iPad[^;\s]+/i, 'Apple/AppleTV14,1').replace(/; IOS\//, '; TVOS/');
      } else if (lower === 'content-length') {
        delete headers[key];
      }
    });
    console.log(prefix + originalModel + ' -> AppleTV14,1; platform=tvos; deviceType=tvos/tv; display=3840x2160');
    $done({headers: headers, body: JSON.stringify(body)});
  } catch (error) {
    console.log(prefix + 'Skipped: rewrite failed; original content retained');
    $done({});
  }
})();

})($request,undefined,$argument,$done);else $done({});

}
function response(){
/* HBO AI Subtitles: independent options with optional existing quality integration.
 * GPL-3.0-only; upstream quality logic: MIT, see upstream/hbo-quality/LICENSE. */
(async function(){
let current=Object.assign({},$response);
function apply(fn){return new Promise(resolve=>fn($request,current,$argument,v=>{if(v)current=Object.assign({},current,v);resolve();}));}
await apply((function($request,$response,$argument,$done){
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
  function get(u,timeout){return new Promise(function(resolve,reject){$httpClient.get({url:u,timeout:timeout || 12000},function(e,r,b){if(e || Number(r && (r.status || r.statusCode))!==200)reject(new Error('subtitle fetch failed'));else resolve(String(b || ''));});});}
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
    return automatic || null;
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
        var current=read();current.segments[target]={id:plan.id,source:native,expires:plan.expires,language:(plan.aiLanguages || {})[slot] || plan.sourceLanguage || 'AUTO'};save(current);lines[i]=target;index++;
      }else lines[i]=native;
    }
    if(!index)throw new Error('English main subtitles unavailable');
    return lines.join('\n');
  }
  function addTrack(lines,group,label,language,uri){lines.push('#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="'+group+'",NAME="'+label+'",LANGUAGE="'+language+'",DEFAULT=NO,AUTOSELECT=NO,URI="'+uri+'"');}
  function chinese(language){return /^(?:zh|cmn|yue)(?:-|$)/i.test(language || '');}
  function tracksFrom(body,base){
    return body.split(/\r?\n/).filter(function(l){return l.indexOf('#EXT-X-MEDIA:')===0 && l.indexOf('/__hbo_ai__/')<0;}).map(attrs).filter(function(a){return a.TYPE==='SUBTITLES' && a.URI && a.FORCED!=='YES';}).map(function(a){return {a:a,url:absolute(a.URI,base)};});
  }
  async function choose(plan,tracks){
    plan.selection='none';plan.selectedSource='';
    if(plan.officialChinese || tracks.some(function(t){return chinese(t.a.LANGUAGE);}))return;
    var candidates=tracks.filter(function(t){return allowed(t.url);}).sort(function(a,b){return Number(!/^en(?:-|$)/i.test(a.a.LANGUAGE || ''))-Number(!/^en(?:-|$)/i.test(b.a.LANGUAGE || ''));});
    // Probe at most two full tracks within one shared 10-second budget.
    var deadline=Date.now()+10000;plan.templateSource=candidates[0] ? candidates[0].url : '';
    for(var ci=0;ci<Math.min(2,candidates.length) && Date.now()<deadline-500;ci++){
      var t=candidates[ci];
      plan.verified=plan.verified || {};
      var probe=plan.verified[t.url];
      if(!probe || probe.expires<Date.now()){
        try{
          var playlistBody=await get(t.url,Math.min(5000,deadline-Date.now()));
          if(!/^#EXTM3U/.test(playlistBody) || !/#EXT-X-ENDLIST/.test(playlistBody) || /#EXT-X-MAP:|#EXT-X-KEY:/.test(playlistBody))throw new Error('unsupported subtitle playlist');
          var first=playlistBody.split(/\r?\n/).filter(function(l){return l && l.charAt(0)!=='#';}).map(function(l){return absolute(l,t.url);}).find(function(u){return u.indexOf('/gcs/'+plan.id+'/t/')>=0 && allowed(u);});
          if(!first)throw new Error('main subtitles missing');
          var text=await get(first,Math.max(1,Math.min(5000,deadline-Date.now())));
          if(!/^WEBVTT(?:\s|$)/.test(text) || !/\d{2}:\d{2}(?::\d{2})?\.\d{2,3}\s+-->/.test(text))throw new Error('subtitle cues missing');
          probe={ok:true,body:playlistBody,expires:Date.now()+5*60000};
        }catch(e){probe={ok:false,expires:Date.now()+15000};}
        // Bound storage when CDNs rotate signed URLs.
        plan.verified[t.url]=probe;Object.keys(plan.verified).filter(function(k){return !candidates.slice(0,2).some(function(t){return t.url===k;});}).forEach(function(k){delete plan.verified[k];});
      }
      if(probe.ok){plan.templateSource=t.url;plan.selection='ai';plan.selectedSource=t.url;plan.sourceLanguage=t.a.LANGUAGE || 'AUTO';return;}
    }
    if(plan.external)plan.selection='external';
  }
  function advertise(main,plan){
    var original=(main.textTracks || []).filter(function(t){return !/-x-(ai|external)$/.test(t.language || '');});
    main.textTracks=original.slice();
    if(plan.selection==='ai')main.textTracks.push({type:'subtitles',language:'zh-Hans-x-ai',displayName:'AI 翻译',format:'webvtt'});
    else if(plan.selection==='external')main.textTracks.push({type:'subtitles',language:'zh-Hans-x-external',displayName:'外部字幕',format:'webvtt'});
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
        var verified=vp.verified && vp.verified[source];var native=verified && verified.ok && verified.expires>Date.now()?verified.body:await get(source);var translated=aiPlaylist(native,source,vp,slot);
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
      plan.external=safe?gateway(plan):'';var previous=s.plans[plan.id];if(previous){plan.aiSources=previous.aiSources;plan.aiLanguages=previous.aiLanguages;plan.templateSource=previous.templateSource;plan.verified=previous.verified;}
      plan.officialChinese=(main.textTracks || []).some(function(t){return chinese(t.language) && !/-x-(ai|external)$/.test(t.language || '') && !/forced/i.test(t.type || '');});
      if(plan.officialChinese)plan.selection='none';else{
        try{await choose(plan,tracksFrom(await get(manifest.url,5000),manifest.url));}catch(e){plan.selection=plan.external?'external':'none';}
      }
      // Merge the plan only: concurrent refreshes must not wipe segment registrations.
      var latest=read();latest.plans[plan.id]=plan;save(latest);advertise(main,plan);return done({body:JSON.stringify(data),headers:Object.assign({},$response.headers,{'X-HBO-AI-Stage':'playback-options'})});
    }
    if(body.indexOf('#EXTM3U')!==0)return done();
    var idMatch=/\/gcs\/([a-f0-9-]{36})\//i.exec(u),id=idMatch && idMatch[1].toLowerCase(),plan=s.plans[id];
    if(/#EXT-X-STREAM-INF:/.test(body)){
      if(!id)return done();
      if(!plan){plan={id:id,origin:/^https:\/\/[^/]+/.exec(u)[0],duration:0,expires:Date.now()+6*3600000};s.plans[id]=plan;}
      plan.external=gateway(plan);
      var lines=body.split(/\r?\n/).filter(function(l){return !(l.indexOf('#EXT-X-MEDIA:')===0 && l.indexOf('/__hbo_ai__/')>=0);}),tracks=[];
      lines.forEach(function(l,i){if(l.indexOf('#EXT-X-MEDIA:')===0){var a=attrs(l);if(a.TYPE==='SUBTITLES' && a.URI && a.FORCED!=='YES')tracks.push({a:a,index:i,url:absolute(a.URI,u)});}});
      await choose(plan,tracks);
      var groups={},aiCount=0,externalCount=0;
      tracks.forEach(function(t){groups[t.a['GROUP-ID']]=true;});
      plan.aiSources=plan.aiSources || [];
      if(plan.selection==='ai'){
        var slot=plan.aiSources.indexOf(plan.selectedSource);if(slot<0){slot=plan.aiSources.length;plan.aiSources.push(plan.selectedSource);}
        plan.aiLanguages=plan.aiLanguages || {};plan.aiLanguages[slot]=plan.sourceLanguage;
        Object.keys(groups).forEach(function(g){addTrack(lines,g,'AI 翻译','zh-Hans-x-ai',virtual(plan,'ai',slot));aiCount++;});
      }else if(plan.selection==='external'){
        if(!tracks.length){groups['hbo-ai']=true;lines=lines.map(function(l){return l.indexOf('#EXT-X-STREAM-INF:')===0?set(l,'SUBTITLES','hbo-ai'):l;});}
        Object.keys(groups).forEach(function(g){addTrack(lines,g,'外部字幕','zh-Hans-x-external',virtual(plan,'external',0));externalCount++;});
      }
      var latest=read();latest.plans[id]=plan;s=latest;
      save(s);return done({body:lines.join('\n'),headers:Object.assign({},$response.headers,{'X-HBO-AI-Tracks':'ai='+aiCount+'; external='+externalCount})});
    }
    done();
  }
  run().catch(function(){console.log('[HBO AI] Subtitle processing failed');if(typeof $response==='undefined')done({response:{status:502,headers:{'Content-Type':'text/plain','X-HBO-AI-Error':'playlist-unavailable'},body:'Subtitle playlist unavailable; retry or choose external subtitles'}});else done();});
})();

}));
if($argument && String($argument.QualityCompatibility)==="true"){if(/\/playbackInfo(?:\?|$)/.test($request.url))await apply((function($request,$response,$argument,$done){
/* Record the original main chapter; never select the low-quality fallback. */
(function () {
  var key = 'HBO.iPad.PeriodPlan.v1';
  try {
    if (!/^https:\/\/default\.any-any\.prd\.api\.discomax\.com\/playback-orchestrator\/any\/playback-orchestrator\/v1\/playbackInfo(?:\?|$)/.test($request.url)) { $done({}); return; }
    if (Number($response.statusCode || $response.status || 200) !== 200) { $done({}); return; }
    var data = JSON.parse($response.body);
    var mains = (data.videos || []).filter(function (v) { return v.type === 'main'; });
    var manifest = data.manifest || {};
    if (mains.length !== 1 || manifest.format !== 'hls' || typeof manifest.url !== 'string' ||
        !/^https:\/\/[^/?#@]+\//.test(manifest.url) ||
        !/(?:^|\.)(?:e\.hbo|media\.max\.com|media\.h264\.io)$/.test(manifest.url.split('/')[2])) {
      $persistentStore.write(undefined, key); $done({}); return;
    }
    var main = mains[0];
    if (!/^[a-f0-9-]{36}$/i.test(main.manifestationId || '') ||
        typeof main.start !== 'number' || !isFinite(main.start) || main.start < 0 ||
        typeof main.duration !== 'number' || !isFinite(main.duration) || main.duration <= 0) {
      $persistentStore.write(undefined, key); $done({}); return;
    }
    var plan = {master:manifest.url, id:main.manifestationId, start:main.start, duration:main.duration,
      expires:Date.now()+6*60*60*1000, media:{}, cache:[]};
    if ($persistentStore.write(JSON.stringify(plan),key)) console.log('[HBO iPad Period] Original main chapter recorded; fallback disabled');
    $done({});
  } catch (error) {
    try { $persistentStore.write(undefined,key); } catch (ignored) {}
    console.log('[HBO iPad Period] Skipped: original response retained'); $done({});
  }
})();

}));else if(/\.m3u8(?:\?|$)/.test($request.url))await apply((function($request,$response,$argument,$done){
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

})); }
$done(current);
})().catch(()=>{$done({});});

}
if(typeof $response!=='undefined')response();else if(/\/__hbo_ai__\/[^/]+\/ai\/\d+\/seg-\d+\.vtt(?:\?|$)/.test($request.url))translate();else if(/\/__hbo_ai__\//.test($request.url))playlist();else playbackRequest();
