var y=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var I=(k,n,t,i)=>{for(var r=i>1?void 0:i?S(n,t):n,o=k.length-1,c;o>=0;o--)(c=k[o])&&(r=(i?c(n,t,r):c(r))||r);return i&&r&&y(n,t,r),r},L=(k,n)=>(t,i)=>n(t,i,k);import"../../../../../../vs/base/common/uri.js";import{ITerminalLogService as T}from"../../../../../../vs/platform/terminal/common/terminal.js";import{IUriIdentityService as _}from"../../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as C}from"../../../../../../vs/platform/workspace/common/workspace.js";import"../../../../../../vs/workbench/contrib/terminal/common/terminal.js";import{TerminalBuiltinLinkType as p}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/links.js";import{convertLinkRangeToBuffer as x,getXtermLineContent as v}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers.js";var R=(t=>(t[t.MaxLineLength=2e3]="MaxLineLength",t[t.MaxResolvedLinkLength=1024]="MaxResolvedLinkLength",t))(R||{});const M=[/^ *(?<link>(?<line>\d+):(?<col>\d+)?)/],W=[/^(?<link>@@ .+ \+(?<toFileLine>\d+),(?<toFileCount>\d+) @@)/];let g=class{constructor(n,t,i,r,o,c){this.xterm=n;this._processManager=t;this._linkResolver=i;this._logService=r;this._uriIdentityService=o;this._workspaceContextService=c}static id="multiline";maxLinkLength=500;async detect(n,t,i){const r=[],o=v(this.xterm.buffer.active,t,i,this.xterm.cols);if(o===""||o.length>2e3)return[];this._logService.trace("terminalMultiLineLinkDetector#detect text",o);for(const c of M){const l=o.match(c)?.groups;if(!l)continue;const s=l?.link,d=l?.line,h=l?.col;if(!s||d===void 0||s.length>1024)continue;this._logService.trace("terminalMultiLineLinkDetector#detect candidate",s);let u;for(let e=t-1;e>=0;e--){if(this.xterm.buffer.active.getLine(e).isWrapped)continue;const f=v(this.xterm.buffer.active,e,e,this.xterm.cols);if(!f.match(/^\s*\d/)){u=f;break}}if(!u)continue;const a=await this._linkResolver.resolveLink(this._processManager,u);if(a){let e;a.isDirectory?this._isDirectoryInsideWorkspace(a.uri)?e=p.LocalFolderInWorkspace:e=p.LocalFolderOutsideWorkspace:e=p.LocalFile;const f=x(n,this.xterm.cols,{startColumn:1,startLineNumber:1,endColumn:1+o.length,endLineNumber:1},t),m={text:s,uri:a.uri,selection:{startLineNumber:parseInt(d),startColumn:h?parseInt(h):1},disableTrimColon:!0,bufferRange:f,type:e};this._logService.trace("terminalMultiLineLinkDetector#detect verified link",m),r.push(m);break}}if(r.length===0)for(const c of W){const l=o.match(c)?.groups;if(!l)continue;const s=l?.link,d=l?.toFileLine,h=l?.toFileCount;if(!s||d===void 0||s.length>1024)continue;this._logService.trace("terminalMultiLineLinkDetector#detect candidate",s);let u;for(let e=t-1;e>=0;e--){if(this.xterm.buffer.active.getLine(e).isWrapped)continue;const m=v(this.xterm.buffer.active,e,e,this.xterm.cols).match(/\+\+\+ b\/(?<path>.+)/);if(m){u=m.groups?.path;break}}if(!u)continue;const a=await this._linkResolver.resolveLink(this._processManager,u);if(a){let e;a.isDirectory?this._isDirectoryInsideWorkspace(a.uri)?e=p.LocalFolderInWorkspace:e=p.LocalFolderOutsideWorkspace:e=p.LocalFile;const f=x(n,this.xterm.cols,{startColumn:1,startLineNumber:1,endColumn:1+s.length,endLineNumber:1},t),m={text:s,uri:a.uri,selection:{startLineNumber:parseInt(d),startColumn:1,endLineNumber:parseInt(d)+parseInt(h)},bufferRange:f,type:e};this._logService.trace("terminalMultiLineLinkDetector#detect verified link",m),r.push(m);break}}return r}_isDirectoryInsideWorkspace(n){const t=this._workspaceContextService.getWorkspace().folders;for(let i=0;i<t.length;i++)if(this._uriIdentityService.extUri.isEqualOrParent(n,t[i].uri))return!0;return!1}};g=I([L(3,T),L(4,_),L(5,C)],g);export{g as TerminalMultiLineLinkDetector};
