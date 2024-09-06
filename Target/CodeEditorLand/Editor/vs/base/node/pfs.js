import*as s from"fs";import{tmpdir as k}from"os";import{promisify as u}from"util";import{ResourceQueue as L,timeout as C}from"../../../vs/base/common/async.js";import{isEqualOrParent as W,isRootOrDriveLetter as p,randomPath as N}from"../../../vs/base/common/extpath.js";import{normalizeNFC as h}from"../../../vs/base/common/normalization.js";import{join as l}from"../../../vs/base/common/path.js";import{isLinux as U,isMacintosh as b,isWindows as P}from"../../../vs/base/common/platform.js";import{extUriBiasedIgnorePathCase as R}from"../../../vs/base/common/resources.js";import{URI as A}from"../../../vs/base/common/uri.js";var M=(i=>(i[i.UNLINK=0]="UNLINK",i[i.MOVE=1]="MOVE",i))(M||{});async function F(r,e=0,i){if(p(r))throw new Error("rimraf - will refuse to recursively delete root");return e===0?g(r):B(r,i)}async function B(r,e=N(k())){try{try{await s.promises.rename(r,e)}catch(i){return i.code==="ENOENT"?void 0:g(r)}g(e).catch(i=>{})}catch(i){if(i.code!=="ENOENT")throw i}}async function g(r){return s.promises.rm(r,{recursive:!0,force:!0,maxRetries:3})}function tr(r){if(p(r))throw new Error("rimraf - will refuse to recursively delete root");s.rmSync(r,{recursive:!0,force:!0,maxRetries:3})}async function d(r,e){return v(await(e?T(r):s.promises.readdir(r)))}async function T(r){try{return await s.promises.readdir(r,{withFileTypes:!0})}catch(t){console.warn("[node.js fs] readdir with filetypes failed with error: ",t)}const e=[],i=await d(r);for(const t of i){let o=!1,n=!1,a=!1;try{const c=await s.promises.lstat(l(r,t));o=c.isFile(),n=c.isDirectory(),a=c.isSymbolicLink()}catch(c){console.warn("[node.js fs] unexpected error from lstat after readdir: ",c)}e.push({name:t,isFile:()=>o,isDirectory:()=>n,isSymbolicLink:()=>a})}return e}function nr(r){return v(s.readdirSync(r))}function v(r){return r.map(e=>typeof e=="string"?b?h(e):e:(e.name=b?h(e.name):e.name,e))}async function j(r){const e=await d(r),i=[];for(const t of e)await m.existsDirectory(l(r,t))&&i.push(t);return i}function sr(r,e=1e3){return new Promise(i=>{let t=!1;const o=setInterval(()=>{t||(t=!0,s.access(r,n=>{t=!1,n&&(clearInterval(o),i(void 0))}))},e)})}var m;(t=>{async function r(o){let n;try{if(n=await s.promises.lstat(o),!n.isSymbolicLink())return{stat:n}}catch{}try{return{stat:await s.promises.stat(o),symbolicLink:n?.isSymbolicLink()?{dangling:!1}:void 0}}catch(a){if(a.code==="ENOENT"&&n)return{stat:n,symbolicLink:{dangling:!0}};if(P&&a.code==="EACCES")try{return{stat:await s.promises.stat(await s.promises.readlink(o)),symbolicLink:{dangling:!1}}}catch(c){if(c.code==="ENOENT"&&n)return{stat:n,symbolicLink:{dangling:!0}};throw c}throw a}}t.stat=r;async function e(o){try{const{stat:n,symbolicLink:a}=await t.stat(o);return n.isFile()&&a?.dangling!==!0}catch{}return!1}t.existsFile=e;async function i(o){try{const{stat:n,symbolicLink:a}=await t.stat(o);return n.isDirectory()&&a?.dangling!==!0}catch{}return!1}t.existsDirectory=i})(m||={});const K=new L;function V(r,e,i){return K.queueFor(A.file(r),()=>{const t=S(i);return new Promise((o,n)=>q(r,e,t,a=>a?n(a):o()))},R)}let w=!0;function I(r){w=r}function q(r,e,i,t){if(!w)return s.writeFile(r,e,{mode:i.mode,flag:i.flag},t);s.open(r,i.flag,i.mode,(o,n)=>{if(o)return t(o);s.writeFile(n,e,a=>{if(a)return s.close(n,()=>t(a));s.fdatasync(n,c=>(c&&(console.warn("[node.js fs] fdatasync is now disabled for this session because it failed: ",c),I(!1)),s.close(n,f=>t(f))))})})}function or(r,e,i){const t=S(i);if(!w)return s.writeFileSync(r,e,{mode:t.mode,flag:t.flag});const o=s.openSync(r,t.flag,t.mode);try{s.writeFileSync(o,e);try{s.fdatasyncSync(o)}catch(n){console.warn("[node.js fs] fdatasyncSync is now disabled for this session because it failed: ",n),I(!1)}}finally{s.closeSync(o)}}function S(r){return r?{mode:typeof r.mode=="number"?r.mode:438,flag:typeof r.flag=="string"?r.flag:"w"}:{mode:438,flag:"w"}}async function Q(r,e,i=6e4){if(r!==e)try{P&&typeof i=="number"?await D(r,e,Date.now(),i):await s.promises.rename(r,e)}catch(t){if(r.toLowerCase()!==e.toLowerCase()&&t.code==="EXDEV"||r.endsWith("."))await E(r,e,{preserveSymlinks:!1}),await F(r,1);else throw t}}async function D(r,e,i,t,o=0){try{return await s.promises.rename(r,e)}catch(n){if(n.code!=="EACCES"&&n.code!=="EPERM"&&n.code!=="EBUSY")throw n;if(Date.now()-i>=t)throw console.error(`[node.js fs] rename failed after ${o} retries with error: ${n}`),n;if(o===0){let a=!1;try{const{stat:c}=await m.stat(e);c.isFile()||(a=!0)}catch{}if(a)throw n}return await C(Math.min(100,o*10)),D(r,e,i,t,o+1)}}async function E(r,e,i){return x(r,e,{root:{source:r,target:e},options:i,handledSourcePaths:new Set})}const O=511;async function x(r,e,i){if(i.handledSourcePaths.has(r))return;i.handledSourcePaths.add(r);const{stat:t,symbolicLink:o}=await m.stat(r);if(o){if(i.options.preserveSymlinks)try{return await $(r,e,i)}catch{}if(o.dangling)return}return t.isDirectory()?Y(r,e,t.mode&O,i):_(r,e,t.mode&O)}async function Y(r,e,i,t){await s.promises.mkdir(e,{recursive:!0,mode:i});const o=await d(r);for(const n of o)await x(l(r,n),l(e,n),t)}async function _(r,e,i){await s.promises.copyFile(r,e),await s.promises.chmod(e,i)}async function $(r,e,i){let t=await s.promises.readlink(r);W(t,i.root.source,!U)&&(t=l(i.root.target,t.substr(i.root.source.length+1))),await s.promises.symlink(t,e)}const ar=new class{get read(){return(r,e,i,t,o)=>new Promise((n,a)=>{s.read(r,e,i,t,o,(c,f,y)=>c?a(c):n({bytesRead:f,buffer:y}))})}get write(){return(r,e,i,t,o)=>new Promise((n,a)=>{s.write(r,e,i,t,o,(c,f,y)=>c?a(c):n({bytesWritten:f,buffer:y}))})}get fdatasync(){return u(s.fdatasync)}get open(){return u(s.open)}get close(){return u(s.close)}get realpath(){return u(s.realpath)}async exists(r){try{return await s.promises.access(r),!0}catch{return!1}}get readdir(){return d}get readDirsInDir(){return j}get writeFile(){return V}get rm(){return F}get rename(){return Q}get copy(){return E}};export{ar as Promises,M as RimRafMode,m as SymlinkSupport,I as configureFlushOnWrite,nr as readdirSync,tr as rimrafSync,sr as whenDeleted,or as writeFileSync};