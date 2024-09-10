import"../../../../base/common/buffer.js";import"../../../../base/common/cancellation.js";import{isUNC as u}from"../../../../base/common/extpath.js";import{Schemas as m}from"../../../../base/common/network.js";import{normalize as f,sep as p}from"../../../../base/common/path.js";import{URI as R}from"../../../../base/common/uri.js";import{FileOperationError as y,FileOperationResult as h}from"../../../../platform/files/common/files.js";import"../../../../platform/log/common/log.js";import{getWebviewContentMimeType as I}from"../../../../platform/webview/common/mimeTypes.js";var s;(a=>{let e;(r=>(r[r.Success=0]="Success",r[r.Failed=1]="Failed",r[r.AccessDenied=2]="AccessDenied",r[r.NotModified=3]="NotModified"))(e=a.Type||={});class t{constructor(o,l,b,r){this.stream=o;this.etag=l;this.mtime=b;this.mimeType=r}type=0}a.StreamSuccess=t,a.Failed={type:1},a.AccessDenied={type:2};class d{constructor(o,l){this.mimeType=o;this.mtime=l}type=3}a.NotModified=d})(s||={});async function $(e,t,i,n,d){n.debug(`loadLocalResource - begin. requestUri=${e}`);const a=S(e,t.roots);if(n.debug(`loadLocalResource - found resource to load. requestUri=${e}, resourceToLoad=${a}`),!a)return s.AccessDenied;const c=I(e);try{const o=await i.readFileStream(a,{etag:t.ifNoneMatch},d);return new s.StreamSuccess(o.value,o.etag,o.mtime,c)}catch(o){return o instanceof y&&o.fileOperationResult===h.FILE_NOT_MODIFIED_SINCE?new s.NotModified(c,o.options?.mtime):(n.debug(`loadLocalResource - Error using fileReader. requestUri=${e}`),console.log(o),s.Failed)}}function S(e,t){for(const i of t)if(g(i,e))return F(e)}function g(e,t){if(e.scheme!==t.scheme)return!1;let i=f(t.fsPath),n=f(e.fsPath+(e.fsPath.endsWith(p)?"":p));return u(e.fsPath)&&u(t.fsPath)&&(n=n.toLowerCase(),i=i.toLowerCase()),i.startsWith(n)}function F(e){return e.scheme===m.vscodeRemote?R.from({scheme:m.vscodeRemote,authority:e.authority,path:"/vscode-resource",query:JSON.stringify({requestResourcePath:e.path})}):e}export{s as WebviewResourceResponse,$ as loadLocalResource};
