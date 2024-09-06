var p=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var g=(a,e,i,t)=>{for(var r=t>1?void 0:t?I(e,i):e,c=a.length-1,s;c>=0;c--)(s=a[c])&&(r=(t?s(e,i,r):s(r))||r);return t&&r&&p(e,i,r),r},o=(a,e)=>(i,t)=>e(i,t,a);import{Action as f}from"../../../../base/common/actions.js";import{Disposable as h}from"../../../../base/common/lifecycle.js";import{randomPort as P}from"../../../../base/common/ports.js";import*as d from"../../../../nls.js";import{IDialogService as b}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as S}from"../../../../platform/instantiation/common/instantiation.js";import{INativeHostService as _}from"../../../../platform/native/common/native.js";import{IProductService as y}from"../../../../platform/product/common/productService.js";import{IProgressService as w,ProgressLocation as x}from"../../../../platform/progress/common/progress.js";import{IStorageService as L,StorageScope as u,StorageTarget as H}from"../../../../platform/storage/common/storage.js";import"../../../common/contributions.js";import{ExtensionHostKind as A}from"../../../services/extensions/common/extensionHostKind.js";import{IExtensionService as N}from"../../../services/extensions/common/extensions.js";import{IHostService as C}from"../../../services/host/browser/host.js";import{IDebugService as D}from"../../debug/common/debug.js";let n=class extends f{constructor(i,t,r,c,s,m){super(n.ID,n.LABEL,n.CSS_CLASS);this._nativeHostService=i;this._dialogService=t;this._extensionService=r;this.productService=c;this._instantiationService=s;this._hostService=m}static ID="workbench.extensions.action.debugExtensionHost";static LABEL=d.localize("debugExtensionHost","Start Debugging Extension Host In New Window");static CSS_CLASS="debug-extension-host";async run(i){const t=await this._extensionService.getInspectPorts(A.LocalProcess,!1);if(t.length===0){(await this._dialogService.confirm({message:d.localize("restart1","Debug Extensions"),detail:d.localize("restart2","In order to debug extensions a restart is required. Do you want to restart '{0}' now?",this.productService.nameLong),primaryButton:d.localize({key:"restart3",comment:["&& denotes a mnemonic"]},"&&Restart")})).confirmed&&await this._nativeHostService.relaunch({addArgs:[`--inspect-extensions=${P()}`]});return}t.length>1&&console.warn("There are multiple extension hosts available for debugging. Picking the first one..."),this._instantiationService.createInstance(v).storeDebugOnNewWindow(t[0].port),this._hostService.openWindow()}};n=g([o(0,_),o(1,b),o(2,N),o(3,y),o(4,S),o(5,C)],n);let v=class{constructor(e){this._storageService=e}storeDebugOnNewWindow(e){this._storageService.store("debugExtensionHost.debugPort",e,u.APPLICATION,H.MACHINE)}getAndDeleteDebugPortIfSet(){const e=this._storageService.getNumber("debugExtensionHost.debugPort",u.APPLICATION);return e!==void 0&&this._storageService.remove("debugExtensionHost.debugPort",u.APPLICATION),e}};v=g([o(0,L)],v);let l=class extends h{constructor(i,t,r){super();this._debugService=i;this._instantiationService=t;const s=this._instantiationService.createInstance(v).getAndDeleteDebugPortIfSet();s!==void 0&&r.withProgress({location:x.Notification,title:d.localize("debugExtensionHost.progress","Attaching Debugger To Extension Host")},async m=>{await this._debugService.startDebugging(void 0,{type:"node",name:d.localize("debugExtensionHost.launch.name","Attach Extension Host"),request:"attach",port:s,trace:!0,resolveSourceMapLocations:null,eagerSources:!0,timeouts:{sourceMapMinPause:3e4,sourceMapCumulativePause:3e5}})})}};l=g([o(0,D),o(1,S),o(2,w)],l);export{n as DebugExtensionHostAction,l as DebugExtensionsContribution};
