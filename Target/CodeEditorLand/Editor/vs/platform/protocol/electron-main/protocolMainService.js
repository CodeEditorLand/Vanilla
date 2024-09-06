var R=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var h=(a,l,e,r)=>{for(var o=r>1?void 0:r?g(l,e):l,i=a.length-1,t;i>=0;i--)(t=a[i])&&(o=(r?t(l,e,o):t(o))||o);return r&&o&&R(l,e,o),o},n=(a,l)=>(e,r)=>l(e,r,a);import{session as P}from"electron";import{Disposable as m,toDisposable as p}from"../../../../vs/base/common/lifecycle.js";import{COI as u,FileAccess as b,Schemas as s}from"../../../../vs/base/common/network.js";import{basename as I,extname as F,normalize as f}from"../../../../vs/base/common/path.js";import{isLinux as S}from"../../../../vs/base/common/platform.js";import{TernarySearchTree as U}from"../../../../vs/base/common/ternarySearchTree.js";import{URI as d}from"../../../../vs/base/common/uri.js";import{generateUuid as C}from"../../../../vs/base/common/uuid.js";import{validatedIpcMain as v}from"../../../../vs/base/parts/ipc/electron-main/ipcMain.js";import{INativeEnvironmentService as w}from"../../../../vs/platform/environment/common/environment.js";import{ILogService as y}from"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/protocol/electron-main/protocol.js";import{IUserDataProfilesService as T}from"../../../../vs/platform/userDataProfile/common/userDataProfile.js";let c=class extends m{constructor(e,r,o){super();this.environmentService=e;this.logService=o;this.addValidFileRoot(e.appRoot),this.addValidFileRoot(e.extensionsPath),this.addValidFileRoot(r.defaultProfile.globalStorageHome.with({scheme:s.file}).fsPath),this.addValidFileRoot(e.workspaceStorageHome.with({scheme:s.file}).fsPath),this.handleProtocols()}validRoots=U.forPaths(!S);validExtensions=new Set([".svg",".png",".jpg",".jpeg",".gif",".bmp",".webp",".mp4"]);handleProtocols(){const{defaultSession:e}=P;e.protocol.registerFileProtocol(s.vscodeFileResource,(r,o)=>this.handleResourceRequest(r,o)),e.protocol.interceptFileProtocol(s.file,(r,o)=>this.handleFileRequest(r,o)),this._register(p(()=>{e.protocol.unregisterProtocol(s.vscodeFileResource),e.protocol.uninterceptProtocol(s.file)}))}addValidFileRoot(e){const r=f(e);return this.validRoots.get(r)?m.None:(this.validRoots.set(r,!0),p(()=>this.validRoots.delete(r)))}handleFileRequest(e,r){const o=d.parse(e.url);return this.logService.error(`Refused to load resource ${o.fsPath} from ${s.file}: protocol (original URL: ${e.url})`),r({error:-3})}handleResourceRequest(e,r){const o=this.requestToNormalizedFilePath(e);let i;if(this.environmentService.crossOriginIsolated){const t=I(o);t==="workbench.html"||t==="workbench-dev.html"||t==="workbench.esm.html"||t==="workbench-dev.esm.html"?i=u.CoopAndCoep:i=u.getHeadersFromQuery(e.url)}return this.validRoots.findSubstr(o)?r({path:o,headers:i}):this.validExtensions.has(F(o).toLowerCase())?r({path:o}):(this.logService.error(`${s.vscodeFileResource}: Refused to load resource ${o} from ${s.vscodeFileResource}: protocol (original URL: ${e.url})`),r({error:-3}))}requestToNormalizedFilePath(e){const r=d.parse(e.url),o=b.uriToFileUri(r);return f(o.fsPath)}createIPCObjectUrl(){let e;const r=d.from({scheme:"vscode",path:C()}),o=r.toString(),i=async()=>e;return v.handle(o,i),this.logService.trace(`IPC Object URL: Registered new channel ${o}.`),{resource:r,update:t=>e=t,dispose:()=>{this.logService.trace(`IPC Object URL: Removed channel ${o}.`),v.removeHandler(o)}}}};c=h([n(0,w),n(1,T),n(2,y)],c);export{c as ProtocolMainService};