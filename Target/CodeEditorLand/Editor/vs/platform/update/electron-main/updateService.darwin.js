var U=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var d=(p,s,e,t)=>{for(var i=t>1?void 0:t?I(s,e):s,a=p.length-1,c;a>=0;a--)(c=p[a])&&(i=(t?c(s,e,i):c(i))||i);return t&&i&&U(s,e,i),i},r=(p,s)=>(e,t)=>s(e,t,p);import*as n from"electron";import{memoize as h}from"../../../base/common/decorators.js";import{Event as u}from"../../../base/common/event.js";import{hash as S}from"../../../base/common/hash.js";import{DisposableStore as b}from"../../../base/common/lifecycle.js";import{IConfigurationService as y}from"../../configuration/common/configuration.js";import{IEnvironmentMainService as w}from"../../environment/electron-main/environmentMainService.js";import{ILifecycleMainService as A}from"../../lifecycle/electron-main/lifecycleMainService.js";import{ILogService as R}from"../../log/common/log.js";import{IProductService as E}from"../../product/common/productService.js";import{IRequestService as C}from"../../request/common/request.js";import{ITelemetryService as N}from"../../telemetry/common/telemetry.js";import{State as l,StateType as v,UpdateType as m}from"../common/update.js";import{AbstractUpdateService as F,createUpdateURL as L}from"./abstractUpdateService.js";let o=class extends F{constructor(e,t,i,a,c,f,g){super(e,t,a,c,f,g);this.telemetryService=i;e.setRelaunchHandler(this)}disposables=new b;get onRawError(){return u.fromNodeEventEmitter(n.autoUpdater,"error",(e,t)=>t)}get onRawUpdateNotAvailable(){return u.fromNodeEventEmitter(n.autoUpdater,"update-not-available")}get onRawUpdateAvailable(){return u.fromNodeEventEmitter(n.autoUpdater,"update-available")}get onRawUpdateDownloaded(){return u.fromNodeEventEmitter(n.autoUpdater,"update-downloaded",(e,t,i,a)=>({version:i,productVersion:i,timestamp:a}))}handleRelaunch(e){return e?.addArgs||e?.removeArgs||this.state.type!==v.Ready?!1:(this.logService.trace("update#handleRelaunch(): running raw#quitAndInstall()"),this.doQuitAndInstall(),!0)}async initialize(){await super.initialize(),this.onRawError(this.onError,this,this.disposables),this.onRawUpdateAvailable(this.onUpdateAvailable,this,this.disposables),this.onRawUpdateDownloaded(this.onUpdateDownloaded,this,this.disposables),this.onRawUpdateNotAvailable(this.onUpdateNotAvailable,this,this.disposables)}onError(e){this.telemetryService.publicLog2("update:error",{messageHash:String(S(String(e)))}),this.logService.error("UpdateService error:",e);const t=this.state.type===v.CheckingForUpdates&&this.state.explicit?e:void 0;this.setState(l.Idle(m.Archive,t))}buildUpdateFeedUrl(e){let t;this.productService.darwinUniversalAssetId?t=this.productService.darwinUniversalAssetId:t=process.arch==="x64"?"darwin":"darwin-arm64";const i=L(t,e,this.productService);try{n.autoUpdater.setFeedURL({url:i})}catch(a){this.logService.error("Failed to set update feed URL",a);return}return i}doCheckForUpdates(e){this.setState(l.CheckingForUpdates(e)),n.autoUpdater.checkForUpdates()}onUpdateAvailable(){this.state.type===v.CheckingForUpdates&&this.setState(l.Downloading)}onUpdateDownloaded(e){this.state.type===v.Downloading&&(this.setState(l.Downloaded(e)),this.telemetryService.publicLog2("update:downloaded",{version:e.version}),this.setState(l.Ready(e)))}onUpdateNotAvailable(){this.state.type===v.CheckingForUpdates&&(this.telemetryService.publicLog2("update:notAvailable",{explicit:this.state.explicit}),this.setState(l.Idle(m.Archive)))}doQuitAndInstall(){this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()"),n.autoUpdater.quitAndInstall()}dispose(){this.disposables.dispose()}};d([h],o.prototype,"onRawError",1),d([h],o.prototype,"onRawUpdateNotAvailable",1),d([h],o.prototype,"onRawUpdateAvailable",1),d([h],o.prototype,"onRawUpdateDownloaded",1),o=d([r(0,A),r(1,y),r(2,N),r(3,w),r(4,C),r(5,R),r(6,E)],o);export{o as DarwinUpdateService};
