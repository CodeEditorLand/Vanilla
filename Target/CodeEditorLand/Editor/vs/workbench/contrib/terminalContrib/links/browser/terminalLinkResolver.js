var g=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var f=(c,e,t,i)=>{for(var r=i>1?void 0:i?_(e,t):e,o=c.length-1,s;o>=0;o--)(s=c[o])&&(r=(i?s(e,t,r):s(r))||r);return i&&r&&g(e,t,r),r},d=(c,e)=>(t,i)=>e(t,i,c);import{mainWindow as y}from"../../../../../base/browser/window.js";import{Schemas as m}from"../../../../../base/common/network.js";import{posix as T,win32 as I}from"../../../../../base/common/path.js";import{isWindows as p,OperatingSystem as v,OS as P}from"../../../../../base/common/platform.js";import{URI as l}from"../../../../../base/common/uri.js";import{IFileService as w}from"../../../../../platform/files/common/files.js";import"../../../../../platform/terminal/common/terminal.js";import"../../../terminal/common/terminal.js";import"./links.js";import{removeLinkQueryString as L,removeLinkSuffix as S,winDrivePrefix as R}from"./terminalLinkParsing.js";let a=class{constructor(e){this._fileService=e}_resolvedLinkCaches=new Map;async resolveLink(e,t,i){i&&i.scheme===m.file&&e.remoteAuthority&&(i=i.with({scheme:m.vscodeRemote,authority:e.remoteAuthority}));let r=this._resolvedLinkCaches.get(e.remoteAuthority??"");r||(r=new U,this._resolvedLinkCaches.set(e.remoteAuthority??"",r));const o=r.get(i||t);if(o!==void 0)return o;if(i)try{const n=await this._fileService.stat(i),h={uri:i,link:t,isDirectory:n.isDirectory};return r.set(i,h),h}catch{return r.set(i,null),null}let s=S(t);if(s=L(s),s.length===0)return r.set(t,null),null;if(p&&t.match(/^\/mnt\/[a-z]/i)&&e.backend)s=await e.backend.getWslPath(s,"unix-to-win");else if(!(p&&t.match(/^(?:\/\/|\\\\)wsl(?:\$|\.localhost)(\/|\\)/))){const n=this._preprocessPath(s,e.initialCwd,e.os,e.userHome);if(!n)return r.set(t,null),null;s=n}try{let n;e.remoteAuthority?n=l.from({scheme:m.vscodeRemote,authority:e.remoteAuthority,path:s}):n=l.file(s);try{const h=await this._fileService.stat(n),u={uri:n,link:t,isDirectory:h.isDirectory};return r.set(t,u),u}catch{return r.set(t,null),null}}catch{return r.set(t,null),null}}_preprocessPath(e,t,i,r){const o=this._getOsPath(i);if(e.charAt(0)==="~"){if(!r)return null;e=o.join(r,e.substring(1))}else if(e.charAt(0)!=="/"&&e.charAt(0)!=="~")if(i===v.Windows)if(!e.match("^"+R)&&!e.startsWith("\\\\?\\")){if(!t)return null;e=o.join(t,e)}else e=e.replace(/^\\\\\?\\/,"");else{if(!t)return null;e=o.join(t,e)}return e=o.normalize(e),e}_getOsPath(e){return(e??P)===v.Windows?I:T}};a=f([d(0,w)],a);var A=(e=>(e[e.TTL=1e4]="TTL",e))(A||{});class U{_cache=new Map;_cacheTilTimeout=0;set(e,t){this._cacheTilTimeout&&y.clearTimeout(this._cacheTilTimeout),this._cacheTilTimeout=y.setTimeout(()=>this._cache.clear(),1e4),this._cache.set(this._getKey(e),t)}get(e){return this._cache.get(this._getKey(e))}_getKey(e){return l.isUri(e)?e.toString():e}}export{a as TerminalLinkResolver};
