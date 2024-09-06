var S=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var l=(h,n,e,i)=>{for(var r=i>1?void 0:i?g(n,e):n,o=h.length-1,a;o>=0;o--)(a=h[o])&&(r=(i?a(n,e,r):a(r))||r);return i&&r&&S(n,e,r),r},s=(h,n)=>(e,i)=>n(e,i,h);import{Disposable as m,DisposableStore as I,dispose as W}from"../../../../../vs/base/common/lifecycle.js";import{ResourceMap as p}from"../../../../../vs/base/common/map.js";import{isAbsolute as E}from"../../../../../vs/base/common/path.js";import{URI as v}from"../../../../../vs/base/common/uri.js";import{localize as d}from"../../../../../vs/nls.js";import{IConfigurationService as w}from"../../../../../vs/platform/configuration/common/configuration.js";import{IFileService as y}from"../../../../../vs/platform/files/common/files.js";import{INotificationService as C,NeverShowAgainScope as k,NotificationPriority as x,Severity as u}from"../../../../../vs/platform/notification/common/notification.js";import{IOpenerService as b}from"../../../../../vs/platform/opener/common/opener.js";import{ITelemetryService as D}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IUriIdentityService as N}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as F}from"../../../../../vs/platform/workspace/common/workspace.js";import{IHostService as O}from"../../../../../vs/workbench/services/host/browser/host.js";let f=class extends m{constructor(e,i,r,o,a,t,c,U){super();this.fileService=e;this.configurationService=i;this.contextService=r;this.notificationService=o;this.openerService=a;this.uriIdentityService=t;this.hostService=c;this.telemetryService=U;this.registerListeners(),this.refresh()}static ID="workbench.contrib.workspaceWatcher";watchedWorkspaces=new p(e=>this.uriIdentityService.extUri.getComparisonKey(e));registerListeners(){this._register(this.contextService.onDidChangeWorkspaceFolders(e=>this.onDidChangeWorkspaceFolders(e))),this._register(this.contextService.onDidChangeWorkbenchState(()=>this.onDidChangeWorkbenchState())),this._register(this.configurationService.onDidChangeConfiguration(e=>this.onDidChangeConfiguration(e))),this._register(this.fileService.onDidWatchError(e=>this.onDidWatchError(e)))}onDidChangeWorkspaceFolders(e){for(const i of e.removed)this.unwatchWorkspace(i);for(const i of e.added)this.watchWorkspace(i)}onDidChangeWorkbenchState(){this.refresh()}onDidChangeConfiguration(e){(e.affectsConfiguration("files.watcherExclude")||e.affectsConfiguration("files.watcherInclude"))&&this.refresh()}onDidWatchError(e){const i=e.toString();let r;i.indexOf("ENOSPC")>=0?(r="ENOSPC",this.notificationService.prompt(u.Warning,d("enospcError","Unable to watch for file changes. Please follow the instructions link to resolve this issue."),[{label:d("learnMore","Instructions"),run:()=>this.openerService.open(v.parse("https://go.microsoft.com/fwlink/?linkid=867693"))}],{sticky:!0,neverShowAgain:{id:"ignoreEnospcError",isSecondary:!0,scope:k.WORKSPACE}})):i.indexOf("EUNKNOWN")>=0?(r="EUNKNOWN",this.notificationService.prompt(u.Warning,d("eshutdownError","File changes watcher stopped unexpectedly. A reload of the window may enable the watcher again unless the workspace cannot be watched for file changes."),[{label:d("reload","Reload"),run:()=>this.hostService.reload()}],{sticky:!0,priority:x.SILENT})):i.indexOf("ETERM")>=0&&(r="ETERM"),r&&this.telemetryService.publicLog2("fileWatcherError",{reason:r})}watchWorkspace(e){const i=[],r=this.configurationService.getValue({resource:e.uri});if(r.files?.watcherExclude)for(const t in r.files.watcherExclude)t&&r.files.watcherExclude[t]===!0&&i.push(t);const o=new p(t=>this.uriIdentityService.extUri.getComparisonKey(t));if(o.set(e.uri,e.uri),r.files?.watcherInclude){for(const t of r.files.watcherInclude)if(t)if(E(t)){const c=v.file(t).with({scheme:e.uri.scheme});this.uriIdentityService.extUri.isEqualOrParent(c,e.uri)&&o.set(c,c)}else{const c=e.toResource(t);o.set(c,c)}}const a=new I;for(const[,t]of o)a.add(this.fileService.watch(t,{recursive:!0,excludes:i}));this.watchedWorkspaces.set(e.uri,a)}unwatchWorkspace(e){this.watchedWorkspaces.has(e.uri)&&(W(this.watchedWorkspaces.get(e.uri)),this.watchedWorkspaces.delete(e.uri))}refresh(){this.unwatchWorkspaces();for(const e of this.contextService.getWorkspace().folders)this.watchWorkspace(e)}unwatchWorkspaces(){for(const[,e]of this.watchedWorkspaces)e.dispose();this.watchedWorkspaces.clear()}dispose(){super.dispose(),this.unwatchWorkspaces()}};f=l([s(0,y),s(1,w),s(2,F),s(3,C),s(4,b),s(5,N),s(6,O),s(7,D)],f);export{f as WorkspaceWatcher};
