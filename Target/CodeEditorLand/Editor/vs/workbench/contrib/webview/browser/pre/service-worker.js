const n=self,P=4,$=`vscode-resource-cache-${P}`,C=n.location.pathname.replace(/\/service-worker.js$/,""),v=new URL(location.toString()).searchParams,k=v.get("remoteAuthority"),R=v.get("vscode-resource-base-authority"),M=3e4;class T{constructor(){this.map=new Map,this.requestPool=0}create(){const e=++this.requestPool;let o;const s=new Promise(i=>o=i),a={resolve:o,promise:s};this.map.set(e,a);const u=setTimeout(()=>{clearTimeout(u);const i=this.map.get(e);if(i===a){i.resolve({status:"timeout"}),this.map.delete(e);return}},M);return{requestId:e,promise:s}}resolve(e,o){const s=this.map.get(e);return s?(s.resolve({status:"ok",value:o}),this.map.delete(e),!0):!1}}const N=new T,U=new T,x=()=>new Response("Unauthorized",{status:401}),g=()=>new Response("Not Found",{status:404}),A=()=>new Response("Method Not Allowed",{status:405}),H=()=>new Response("Request Timeout",{status:408});n.addEventListener("message",async t=>{switch(t.data.channel){case"version":{const e=t.source;n.clients.get(e.id).then(o=>{o&&o.postMessage({channel:"version",version:P})});return}case"did-load-resource":{const e=t.data.data;N.resolve(e.id,e);return}case"did-load-localhost":{const e=t.data.data;U.resolve(e.id,e.location);return}default:return}}),n.addEventListener("fetch",t=>{const e=new URL(t.request.url);if(typeof R=="string"&&e.protocol==="https:"&&e.hostname.endsWith("."+R))switch(t.request.method){case"GET":case"HEAD":{const o=e.hostname.slice(0,e.hostname.length-(R.length+1)),s=o.split("+",1)[0],a=o.slice(s.length+1);return t.respondWith(O(t,{scheme:s,authority:a,path:e.pathname,query:e.search.replace(/^\?/,"")}))}default:return t.respondWith(A())}if(e.origin!==n.origin&&e.host===k)switch(t.request.method){case"GET":case"HEAD":return t.respondWith(O(t,{path:e.pathname,scheme:e.protocol.slice(0,e.protocol.length-1),authority:e.host,query:e.search.replace(/^\?/,"")}));default:return t.respondWith(A())}if(e.origin!==n.origin&&e.host.match(/^(localhost|127.0.0.1|0.0.0.0):(\d+)$/))return t.respondWith(D(t,e))}),n.addEventListener("install",t=>{t.waitUntil(n.skipWaiting())}),n.addEventListener("activate",t=>{t.waitUntil(n.clients.claim())});async function O(t,e){const o=await n.clients.get(t.clientId);if(!o)return g();const s=I(o);if(!s)return g();const a=t.request.method==="GET",p=(c,m)=>{if(c.status==="timeout")return H();const r=c.value;if(r.status===304){if(m)return m.clone();throw new Error("No cache found")}if(r.status===401)return x();if(r.status!==200)return g();const y={"Access-Control-Allow-Origin":"*"},f=r.data.byteLength,E=t.request.headers.get("range");if(E){const d=E.match(/^bytes=(\d+)-(\d+)?$/g);if(d){const W=Number(d[1]),L=Number(d[2])||f-1;return new Response(r.data.slice(W,L+1),{status:206,headers:{...y,"Content-range":`bytes 0-${L}/${f}`}})}else return new Response(null,{status:416,headers:{...y,"Content-range":`*/${f}`}})}const l={...y,"Content-Type":r.mime,"Content-Length":f.toString()};r.etag&&(l.ETag=r.etag,l["Cache-Control"]="no-cache"),r.mtime&&(l["Last-Modified"]=new Date(r.mtime).toUTCString());const q=new URL(t.request.url).searchParams.get("vscode-coi");q==="3"?(l["Cross-Origin-Opener-Policy"]="same-origin",l["Cross-Origin-Embedder-Policy"]="require-corp"):q==="2"?l["Cross-Origin-Embedder-Policy"]="require-corp":q==="1"&&(l["Cross-Origin-Opener-Policy"]="same-origin");const b=new Response(r.data,{status:200,headers:l});return a&&r.etag&&caches.open($).then(d=>d.put(t.request,b)),b.clone()},u=await S(s);if(!u.length)return g();let i;a&&(i=await(await caches.open($)).match(t.request));const{requestId:w,promise:h}=N.create();for(const c of u)c.postMessage({channel:"load-resource",id:w,scheme:e.scheme,authority:e.authority,path:e.path,query:e.query,ifNoneMatch:i?.headers.get("ETag")});return h.then(c=>p(c,i))}async function D(t,e){const o=await n.clients.get(t.clientId);if(!o)return fetch(t.request);const s=I(o);if(!s)return fetch(t.request);const a=e.origin,p=async h=>{if(h.status!=="ok"||!h.value)return fetch(t.request);const c=h.value,m=t.request.url.replace(new RegExp(`^${e.origin}(/|$)`),`${c}$1`);return new Response(null,{status:302,headers:{Location:m}})},u=await S(s);if(!u.length)return g();const{requestId:i,promise:w}=U.create();for(const h of u)h.postMessage({channel:"load-localhost",origin:a,id:i});return w.then(p)}function I(t){return new URL(t.url).searchParams.get("id")}async function S(t){return(await n.clients.matchAll({includeUncontrolled:!0})).filter(o=>{const s=new URL(o.url);return(s.pathname===`${C}/`||s.pathname===`${C}/index.html`||s.pathname===`${C}/index-no-csp.html`)&&s.searchParams.get("id")===t})}
