import{createWriteStream as y,promises as P}from"fs";import"stream";import{createCancelablePromise as x,Sequencer as v}from"../../../vs/base/common/async.js";import"../../../vs/base/common/cancellation.js";import*as f from"../../../vs/base/common/path.js";import{assertIsDefined as R}from"../../../vs/base/common/types.js";import{Promises as I}from"../../../vs/base/node/pfs.js";import*as g from"../../../vs/nls.js";const T="end of central directory record signature not found",S=new RegExp(T);class h extends Error{type;constructor(t,r){let o=r.message;switch(t){case"CorruptZip":o=`Corrupt ZIP: ${o}`;break}super(o),this.type=t,this.cause=r}}function q(e){const t=e.externalFileAttributes>>16||33188;return[448,56,7].map(r=>t&r).reduce((r,o)=>r+o,t&61440)}function w(e){if(e instanceof h)return e;let t;return S.test(e.message)&&(t="CorruptZip"),new h(t,e)}function B(e,t,r,o,i,n){const s=f.dirname(t),a=f.join(o,s);if(!a.startsWith(o))return Promise.reject(new Error(g.localize("invalid file","Error extracting {0}. Invalid file.",t)));const l=f.join(o,t);let u;return n.onCancellationRequested(()=>{u?.destroy()}),Promise.resolve(P.mkdir(a,{recursive:!0})).then(()=>new Promise((m,c)=>{if(!n.isCancellationRequested)try{u=y(l,{mode:r}),u.once("close",()=>m()),u.once("error",c),e.once("error",c),e.pipe(u)}catch(p){c(p)}}))}function N(e,t,r,o){let i=x(()=>Promise.resolve()),n=0;const s=o.onCancellationRequested(()=>{i.cancel(),e.close()});return new Promise((a,l)=>{const u=new v,m=c=>{c.isCancellationRequested||(n++,e.readEntry())};e.once("error",l),e.once("close",()=>i.then(()=>{o.isCancellationRequested||e.entryCount===n?a():l(new h("Incomplete",new Error(g.localize("incompleteExtract","Incomplete. Found {0} of {1} entries",n,e.entryCount))))},l)),e.readEntry(),e.on("entry",c=>{if(o.isCancellationRequested)return;if(!r.sourcePathRegex.test(c.fileName)){m(o);return}const p=c.fileName.replace(r.sourcePathRegex,"");if(/\/$/.test(p)){const d=f.join(t,p);i=x(E=>P.mkdir(d,{recursive:!0}).then(()=>m(E)).then(void 0,l));return}const Z=F(e,c),b=q(c);i=x(d=>u.queue(()=>Z.then(E=>B(E,p,b,t,r,d).then(()=>m(d)))).then(null,l))})}).finally(()=>s.dispose())}async function C(e,t=!1){const{open:r}=await import("yauzl");return new Promise((o,i)=>{r(e,t?{lazyEntries:!0}:void 0,(n,s)=>{n?i(w(n)):o(R(s))})})}function F(e,t){return new Promise((r,o)=>{e.openReadStream(t,(i,n)=>{i?o(w(i)):r(R(n))})})}async function G(e,t){const{ZipFile:r}=await import("yazl");return new Promise((o,i)=>{const n=new r;t.forEach(a=>{a.contents?n.addBuffer(typeof a.contents=="string"?Buffer.from(a.contents,"utf8"):a.contents,a.path):a.localPath&&n.addFile(a.localPath,a.path)}),n.end();const s=y(e);n.outputStream.pipe(s),n.outputStream.once("error",i),s.once("error",i),s.once("finish",()=>o(e))})}function H(e,t,r={},o){const i=new RegExp(r.sourcePath?`^${r.sourcePath}`:"");let n=C(e,!0);return r.overwrite&&(n=n.then(s=>I.rm(t).then(()=>s))),n.then(s=>N(s,t,{sourcePathRegex:i},o))}function O(e,t){return C(e).then(r=>new Promise((o,i)=>{r.on("entry",n=>{n.fileName===t&&F(r,n).then(s=>o(s),s=>i(s))}),r.once("close",()=>i(new Error(g.localize("notFound","{0} not found inside zip.",t))))}))}function J(e,t){return O(e,t).then(r=>new Promise((o,i)=>{const n=[];r.once("error",i),r.on("data",s=>n.push(s)),r.on("end",()=>o(Buffer.concat(n)))}))}export{T as CorruptZipMessage,h as ExtractError,J as buffer,H as extract,G as zip};