var v=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var I=(d,s,i,t)=>{for(var r=t>1?void 0:t?h(s,i):s,c=d.length-1,o;c>=0;c--)(o=d[c])&&(r=(t?o(s,i,r):o(r))||r);return t&&r&&v(s,i,r),r},p=(d,s)=>(i,t)=>s(i,t,d);import{Event as S}from"../../../../base/common/event.js";import{URI as g}from"../../../../base/common/uri.js";import{IExtensionHostDebugService as W}from"../../../../platform/debug/common/extensionHostDebug.js";import{ExtensionHostDebugBroadcastChannel as x,ExtensionHostDebugChannelClient as P}from"../../../../platform/debug/common/extensionHostDebugIpc.js";import{IFileService as O}from"../../../../platform/files/common/files.js";import{InstantiationType as w,registerSingleton as A}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as U}from"../../../../platform/log/common/log.js";import{IStorageService as N,StorageScope as E,StorageTarget as T}from"../../../../platform/storage/common/storage.js";import{isFolderToOpen as C,isWorkspaceToOpen as y}from"../../../../platform/window/common/window.js";import{IWorkspaceContextService as b,hasWorkspaceFileExtension as u,isSingleFolderWorkspaceIdentifier as k,isWorkspaceIdentifier as R,toWorkspaceIdentifier as _}from"../../../../platform/workspace/common/workspace.js";import{IBrowserWorkbenchEnvironmentService as L}from"../../../services/environment/browser/environmentService.js";import{IHostService as D}from"../../../services/host/browser/host.js";import{IRemoteAgentService as F}from"../../../services/remote/common/remoteAgentService.js";let a=class extends P{static LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY="debug.lastExtensionDevelopmentWorkspace";workspaceProvider;storageService;fileService;constructor(s,i,t,r,c,o,f){const l=s.getConnection();let m;if(l?m=l.getChannel(x.ChannelName):m={call:async()=>{},listen:()=>S.None},super(m),this.storageService=o,this.fileService=f,i.options&&i.options.workspaceProvider?this.workspaceProvider=i.options.workspaceProvider:(this.workspaceProvider={open:async()=>!0,workspace:void 0,trusted:void 0},t.warn("Extension Host Debugging not available due to missing workspace provider.")),this._register(this.onReload(e=>{i.isExtensionDevelopment&&i.debugExtensionHost.debugId===e.sessionId&&r.reload()})),this._register(this.onClose(e=>{i.isExtensionDevelopment&&i.debugExtensionHost.debugId===e.sessionId&&r.close()})),i.isExtensionDevelopment&&!i.extensionTestsLocationURI){const e=_(c.getWorkspace());if(k(e)||R(e)){const n=k(e)?{folderUri:e.uri.toJSON()}:{workspaceUri:e.configPath.toJSON()};o.store(a.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY,JSON.stringify(n),E.PROFILE,T.MACHINE)}else o.remove(a.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY,E.PROFILE)}}async openExtensionDevelopmentHostWindow(s,i){const t=new Map,r=this.findArgument("file-uri",s);r&&!u(r)&&t.set("openFile",r);const c=["extensionDevelopmentPath","extensionTestsPath","extensionEnvironment","debugId","inspect-brk-extensions","inspect-extensions"];for(const e of c){const n=this.findArgument(e,s);n&&t.set(e,n)}let o;const f=this.findArgument("folder-uri",s);if(f)o={folderUri:g.parse(f)};else{const e=this.findArgument("file-uri",s);e&&u(e)&&(o={workspaceUri:g.parse(e)})}const l=this.findArgument("extensionTestsPath",s);if(!o&&!l){const e=this.storageService.get(a.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY,E.PROFILE);if(e)try{const n=JSON.parse(e);n.workspaceUri?o={workspaceUri:g.revive(n.workspaceUri)}:n.folderUri&&(o={folderUri:g.revive(n.folderUri)})}catch{}}if(o){const e=C(o)?o.folderUri:y(o)?o.workspaceUri:void 0;e&&(await this.fileService.exists(e)||(o=void 0))}return{success:await this.workspaceProvider.open(o,{reuse:!1,payload:Array.from(t.entries())})}}findArgument(s,i){for(const t of i){const r=`--${s}=`;if(t.indexOf(r)===0)return t.substring(r.length)}}};a=I([p(0,F),p(1,L),p(2,U),p(3,D),p(4,b),p(5,N),p(6,O)],a),A(W,a,w.Delayed);
