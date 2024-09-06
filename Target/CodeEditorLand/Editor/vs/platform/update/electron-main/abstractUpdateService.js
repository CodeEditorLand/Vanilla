var h=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var p=(a,e,t,i)=>{for(var r=i>1?void 0:i?f(e,t):e,d=a.length-1,c;d>=0;d--)(c=a[d])&&(r=(i?c(e,t,r):c(r))||r);return i&&r&&h(e,t,r),r},o=(a,e)=>(t,i)=>e(t,i,a);import{timeout as v}from"../../../../vs/base/common/async.js";import{CancellationToken as m}from"../../../../vs/base/common/cancellation.js";import{Emitter as S}from"../../../../vs/base/common/event.js";import{IConfigurationService as y}from"../../../../vs/platform/configuration/common/configuration.js";import{IEnvironmentMainService as g}from"../../../../vs/platform/environment/electron-main/environmentMainService.js";import{ILifecycleMainService as U,LifecycleMainPhase as b}from"../../../../vs/platform/lifecycle/electron-main/lifecycleMainService.js";import{ILogService as I}from"../../../../vs/platform/log/common/log.js";import{IProductService as w}from"../../../../vs/platform/product/common/productService.js";import{IRequestService as P}from"../../../../vs/platform/request/common/request.js";import{DisablementReason as n,State as s,StateType as l,UpdateType as C}from"../../../../vs/platform/update/common/update.js";function B(a,e,t){return`${t.updateUrl}/api/update/${a}/${e}/${t.commit}`}let u=class{constructor(e,t,i,r,d,c){this.lifecycleMainService=e;this.configurationService=t;this.environmentMainService=i;this.requestService=r;this.logService=d;this.productService=c;e.when(b.AfterWindowOpen).finally(()=>this.initialize())}url;_state=s.Uninitialized;_onStateChange=new S;onStateChange=this._onStateChange.event;get state(){return this._state}setState(e){this.logService.info("update#setState",e.type),this._state=e,this._onStateChange.fire(e)}async initialize(){if(!this.environmentMainService.isBuilt){this.setState(s.Disabled(n.NotBuilt));return}if(this.environmentMainService.disableUpdates){this.setState(s.Disabled(n.DisabledByEnvironment)),this.logService.info("update#ctor - updates are disabled by the environment");return}if(!this.productService.updateUrl||!this.productService.commit){this.setState(s.Disabled(n.MissingConfiguration)),this.logService.info("update#ctor - updates are disabled as there is no update URL");return}const e=this.configurationService.getValue("update.mode"),t=this.getProductQuality(e);if(!t){this.setState(s.Disabled(n.ManuallyDisabled)),this.logService.info("update#ctor - updates are disabled by user preference");return}if(this.url=this.buildUpdateFeedUrl(t),!this.url){this.setState(s.Disabled(n.InvalidConfiguration)),this.logService.info("update#ctor - updates are disabled as the update URL is badly formed");return}if(this.configurationService.getValue("_update.prss")){const i=new URL(this.url);i.searchParams.set("prss","true"),this.url=i.toString()}if(this.setState(s.Idle(this.getUpdateType())),e==="manual"){this.logService.info("update#ctor - manual checks only; automatic updates are disabled by user preference");return}e==="start"?(this.logService.info("update#ctor - startup checks only; automatic updates are disabled by user preference"),setTimeout(()=>this.checkForUpdates(!1),30*1e3)):this.scheduleCheckForUpdates(30*1e3).then(void 0,i=>this.logService.error(i))}getProductQuality(e){return e==="none"?void 0:this.productService.quality}scheduleCheckForUpdates(e=60*60*1e3){return v(e).then(()=>this.checkForUpdates(!1)).then(()=>this.scheduleCheckForUpdates(60*60*1e3))}async checkForUpdates(e){this.logService.trace("update#checkForUpdates, state = ",this.state.type),this.state.type===l.Idle&&this.doCheckForUpdates(e)}async downloadUpdate(){this.logService.trace("update#downloadUpdate, state = ",this.state.type),this.state.type===l.AvailableForDownload&&await this.doDownloadUpdate(this.state)}async doDownloadUpdate(e){}async applyUpdate(){this.logService.trace("update#applyUpdate, state = ",this.state.type),this.state.type===l.Downloaded&&await this.doApplyUpdate()}async doApplyUpdate(){}quitAndInstall(){return this.logService.trace("update#quitAndInstall, state = ",this.state.type),this.state.type!==l.Ready||(this.logService.trace("update#quitAndInstall(): before lifecycle quit()"),this.lifecycleMainService.quit(!0).then(e=>{this.logService.trace(`update#quitAndInstall(): after lifecycle quit() with veto: ${e}`),!e&&(this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()"),this.doQuitAndInstall())})),Promise.resolve(void 0)}async isLatestVersion(){if(!this.url)return;if(this.configurationService.getValue("update.mode")==="none")return!1;try{return(await this.requestService.request({url:this.url},m.None)).res.statusCode===204}catch(t){this.logService.error("update#isLatestVersion(): failed to check for updates"),this.logService.error(t);return}}async _applySpecificUpdate(e){}getUpdateType(){return C.Archive}doQuitAndInstall(){}};u=p([o(0,U),o(1,y),o(2,g),o(3,P),o(4,I),o(5,w)],u);export{u as AbstractUpdateService,B as createUpdateURL};