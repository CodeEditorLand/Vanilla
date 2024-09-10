var M=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var U=(S,u,t,e)=>{for(var i=e>1?void 0:e?R(u,t):u,s=S.length-1,n;s>=0;s--)(n=S[s])&&(i=(e?n(u,t,i):n(i))||i);return e&&i&&M(u,t,i),i},c=(S,u)=>(t,e)=>u(t,e,S);import{createCancelablePromise as N,disposableTimeout as O,ThrottledDelayer as L,timeout as _}from"../../../base/common/async.js";import{toLocalISOString as k}from"../../../base/common/date.js";import{toErrorMessage as F}from"../../../base/common/errorMessage.js";import{isCancellationError as q}from"../../../base/common/errors.js";import{Emitter as p,Event as Q}from"../../../base/common/event.js";import{Disposable as w,MutableDisposable as C,toDisposable as x}from"../../../base/common/lifecycle.js";import{isWeb as H}from"../../../base/common/platform.js";import{isEqual as d}from"../../../base/common/resources.js";import{URI as G}from"../../../base/common/uri.js";import{localize as y}from"../../../nls.js";import{IProductService as K}from"../../product/common/productService.js";import{IStorageService as $,StorageScope as a,StorageTarget as v}from"../../storage/common/storage.js";import{ITelemetryService as V}from"../../telemetry/common/telemetry.js";import{IUserDataSyncLogService as W,IUserDataSyncEnablementService as Y,IUserDataSyncService as B,IUserDataSyncStoreManagementService as z,IUserDataSyncStoreService as j,UserDataAutoSyncError as o,UserDataSyncError as D,UserDataSyncErrorCode as r}from"./userDataSync.js";import{IUserDataSyncAccountService as J}from"./userDataSyncAccount.js";import{IUserDataSyncMachinesService as X}from"./userDataSyncMachines.js";const b="sync.disableMachineEventually",I="sync.sessionId",T="sync.storeUrl",A="sync.productQuality";let f=class extends w{constructor(t,e,i,s,n,h,l,E,P,Z){super();this.userDataSyncStoreManagementService=e;this.userDataSyncStoreService=i;this.userDataSyncEnablementService=s;this.userDataSyncService=n;this.logService=h;this.userDataSyncAccountService=l;this.telemetryService=E;this.userDataSyncMachinesService=P;this.storageService=Z;this.syncTriggerDelayer=this._register(new L(this.getSyncTriggerDelayTime())),this.lastSyncUrl=this.syncUrl,this.syncUrl=e.userDataSyncStore?.url,this.previousProductQuality=this.productQuality,this.productQuality=t.quality,this.syncUrl&&(this.logService.info("Using settings sync service",this.syncUrl.toString()),this._register(e.onDidChangeUserDataSyncStore(()=>{d(this.syncUrl,e.userDataSyncStore?.url)||(this.lastSyncUrl=this.syncUrl,this.syncUrl=e.userDataSyncStore?.url,this.syncUrl&&this.logService.info("Using settings sync service",this.syncUrl.toString()))})),this.userDataSyncEnablementService.isEnabled()?this.logService.info("Auto Sync is enabled."):this.logService.info("Auto Sync is disabled."),this.updateAutoSync(),this.hasToDisableMachineEventually()&&this.disableMachineEventually(),this._register(l.onDidChangeAccount(()=>this.updateAutoSync())),this._register(i.onDidChangeDonotMakeRequestsUntil(()=>this.updateAutoSync())),this._register(n.onDidChangeLocal(m=>this.triggerSync([m],!1,!1))),this._register(Q.filter(this.userDataSyncEnablementService.onDidChangeResourceEnablement,([,m])=>m)(()=>this.triggerSync(["resourceEnablement"],!1,!1))),this._register(this.userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(()=>this.triggerSync(["userDataSyncStoreChanged"],!1,!1))))}_serviceBrand;autoSync=this._register(new C);successiveFailures=0;lastSyncTriggerTime=void 0;syncTriggerDelayer;suspendUntilRestart=!1;_onError=this._register(new p);onError=this._onError.event;lastSyncUrl;get syncUrl(){const t=this.storageService.get(T,a.APPLICATION);return t?G.parse(t):void 0}set syncUrl(t){t?this.storageService.store(T,t.toString(),a.APPLICATION,v.MACHINE):this.storageService.remove(T,a.APPLICATION)}previousProductQuality;get productQuality(){return this.storageService.get(A,a.APPLICATION)}set productQuality(t){t?this.storageService.store(A,t,a.APPLICATION,v.MACHINE):this.storageService.remove(A,a.APPLICATION)}updateAutoSync(){const{enabled:t,message:e}=this.isAutoSyncEnabled();t?this.autoSync.value===void 0&&(this.autoSync.value=new g(this.lastSyncUrl,1e3*60*5,this.userDataSyncStoreManagementService,this.userDataSyncStoreService,this.userDataSyncService,this.userDataSyncMachinesService,this.logService,this.telemetryService,this.storageService),this.autoSync.value.register(this.autoSync.value.onDidStartSync(()=>this.lastSyncTriggerTime=new Date().getTime())),this.autoSync.value.register(this.autoSync.value.onDidFinishSync(i=>this.onDidFinishSync(i))),this.startAutoSync()&&this.autoSync.value.start()):(this.syncTriggerDelayer.cancel(),this.autoSync.value!==void 0?(e&&this.logService.info(e),this.autoSync.clear()):e&&this.userDataSyncEnablementService.isEnabled()&&this.logService.info(e))}startAutoSync(){return!0}isAutoSyncEnabled(){return this.userDataSyncEnablementService.isEnabled()?this.userDataSyncAccountService.account?this.userDataSyncStoreService.donotMakeRequestsUntil?{enabled:!1,message:`Auto Sync: Suspended until ${k(this.userDataSyncStoreService.donotMakeRequestsUntil)} because server is not accepting requests until then.`}:this.suspendUntilRestart?{enabled:!1,message:"Auto Sync: Suspended until restart."}:{enabled:!0}:{enabled:!1,message:"Auto Sync: Suspended until auth token is available."}:{enabled:!1,message:"Auto Sync: Disabled."}}async turnOn(){this.stopDisableMachineEventually(),this.lastSyncUrl=this.syncUrl,this.updateEnablement(!0)}async turnOff(t,e,i){try{this.userDataSyncAccountService.account&&!i&&await this.userDataSyncMachinesService.removeCurrentMachine(),this.updateEnablement(!1),this.storageService.remove(I,a.APPLICATION),t?(this.telemetryService.publicLog2("sync/turnOffEveryWhere"),await this.userDataSyncService.reset()):await this.userDataSyncService.resetLocal()}catch(s){if(this.logService.error(s),e)this.updateEnablement(!1);else throw s}}updateEnablement(t){this.userDataSyncEnablementService.isEnabled()!==t&&(this.userDataSyncEnablementService.setEnablement(t),this.updateAutoSync())}hasProductQualityChanged(){return!!this.previousProductQuality&&!!this.productQuality&&this.previousProductQuality!==this.productQuality}async onDidFinishSync(t){if(!t){this.successiveFailures=0;return}const e=D.toUserDataSyncError(t);e instanceof o&&this.telemetryService.publicLog2("autosync/error",{code:e.code,service:this.userDataSyncStoreManagementService.userDataSyncStore.url.toString()}),e.code===r.SessionExpired?(await this.turnOff(!1,!0),this.logService.info("Auto Sync: Turned off sync because current session is expired")):e.code===r.TurnedOff?(await this.turnOff(!1,!0),this.logService.info("Auto Sync: Turned off sync because sync is turned off in the cloud")):e.code===r.LocalTooManyRequests?(this.suspendUntilRestart=!0,this.logService.info("Auto Sync: Suspended sync because of making too many requests to server"),this.updateAutoSync()):e.code===r.TooManyRequests?(await this.turnOff(!1,!0,!0),this.disableMachineEventually(),this.logService.info("Auto Sync: Turned off sync because of making too many requests to server")):e.code===r.MethodNotFound?(await this.turnOff(!1,!0),this.logService.info("Auto Sync: Turned off sync because current client is making requests to server that are not supported")):e.code===r.UpgradeRequired||e.code===r.Gone?(await this.turnOff(!1,!0,!0),this.disableMachineEventually(),this.logService.info("Auto Sync: Turned off sync because current client is not compatible with server. Requires client upgrade.")):e.code===r.IncompatibleLocalContent?(await this.turnOff(!1,!0),this.logService.info(`Auto Sync: Turned off sync because server has ${e.resource} content with newer version than of client. Requires client upgrade.`)):e.code===r.IncompatibleRemoteContent?(await this.turnOff(!1,!0),this.logService.info(`Auto Sync: Turned off sync because server has ${e.resource} content with older version than of client. Requires server reset.`)):e.code===r.ServiceChanged||e.code===r.DefaultServiceChanged?H&&e.code===r.DefaultServiceChanged&&!this.hasProductQualityChanged()?(await this.turnOff(!1,!0),this.logService.info("Auto Sync: Turned off sync because default sync service is changed.")):(await this.turnOff(!1,!0,!0),await this.turnOn(),this.logService.info("Auto Sync: Sync Service changed. Turned off auto sync, reset local state and turned on auto sync.")):(this.logService.error(e),this.successiveFailures++),this._onError.fire(e)}async disableMachineEventually(){this.storageService.store(b,!0,a.APPLICATION,v.MACHINE),await _(1e3*60*10),this.hasToDisableMachineEventually()&&(this.stopDisableMachineEventually(),!this.userDataSyncEnablementService.isEnabled()&&this.userDataSyncAccountService.account&&await this.userDataSyncMachinesService.removeCurrentMachine())}hasToDisableMachineEventually(){return this.storageService.getBoolean(b,a.APPLICATION,!1)}stopDisableMachineEventually(){this.storageService.remove(b,a.APPLICATION)}sources=[];async triggerSync(t,e,i){if(this.autoSync.value===void 0)return this.syncTriggerDelayer.cancel();if(e&&this.lastSyncTriggerTime&&Math.round((new Date().getTime()-this.lastSyncTriggerTime)/1e3)<10){this.logService.debug("Auto Sync: Skipped. Limited to once per 10 seconds.");return}return this.sources.push(...t),this.syncTriggerDelayer.trigger(async()=>{this.logService.trace("activity sources",...this.sources);const s=this.userDataSyncAccountService.account?.authenticationProviderId||"";this.telemetryService.publicLog2("sync/triggered",{sources:this.sources,providerId:s}),this.sources=[],this.autoSync.value&&await this.autoSync.value.sync("Activity",i)},this.successiveFailures?this.getSyncTriggerDelayTime()*1*Math.min(Math.pow(2,this.successiveFailures),60):this.getSyncTriggerDelayTime())}getSyncTriggerDelayTime(){return 2e3}};f=U([c(0,K),c(1,z),c(2,j),c(3,Y),c(4,B),c(5,W),c(6,J),c(7,V),c(8,X),c(9,$)],f);class g extends w{constructor(t,e,i,s,n,h,l,E,P){super();this.lastSyncUrl=t;this.interval=e;this.userDataSyncStoreManagementService=i;this.userDataSyncStoreService=s;this.userDataSyncService=n;this.userDataSyncMachinesService=h;this.logService=l;this.telemetryService=E;this.storageService=P}static INTERVAL_SYNCING="Interval";intervalHandler=this._register(new C);_onDidStartSync=this._register(new p);onDidStartSync=this._onDidStartSync.event;_onDidFinishSync=this._register(new p);onDidFinishSync=this._onDidFinishSync.event;manifest=null;syncTask;syncPromise;start(){this._register(this.onDidFinishSync(()=>this.waitUntilNextIntervalAndSync())),this._register(x(()=>{this.syncPromise&&(this.syncPromise.cancel(),this.logService.info("Auto sync: Cancelled sync that is in progress"),this.syncPromise=void 0),this.syncTask?.stop(),this.logService.info("Auto Sync: Stopped")})),this.sync(g.INTERVAL_SYNCING,!1)}waitUntilNextIntervalAndSync(){this.intervalHandler.value=O(()=>{this.sync(g.INTERVAL_SYNCING,!1),this.intervalHandler.value=void 0},this.interval)}sync(t,e){const i=N(async s=>{if(this.syncPromise)try{this.logService.debug("Auto Sync: Waiting until sync is finished."),await this.syncPromise}catch(n){if(q(n))return}return this.doSync(t,e,s)});return this.syncPromise=i,this.syncPromise.finally(()=>this.syncPromise=void 0),this.syncPromise}hasSyncServiceChanged(){return this.lastSyncUrl!==void 0&&!d(this.lastSyncUrl,this.userDataSyncStoreManagementService.userDataSyncStore?.url)}async hasDefaultServiceChanged(){const t=await this.userDataSyncStoreManagementService.getPreviousUserDataSyncStore(),e=this.userDataSyncStoreManagementService.userDataSyncStore;return!!e&&!!t&&(!d(e.defaultUrl,t.defaultUrl)||!d(e.insidersUrl,t.insidersUrl)||!d(e.stableUrl,t.stableUrl))}async doSync(t,e,i){this.logService.info(`Auto Sync: Triggered by ${t}`),this._onDidStartSync.fire();let s;try{await this.createAndRunSyncTask(e,i)}catch(n){if(this.logService.error(n),s=n,D.toUserDataSyncError(n).code===r.MethodNotFound)try{this.logService.info("Auto Sync: Client is making invalid requests. Cleaning up data..."),await this.userDataSyncService.cleanUpRemoteData(),this.logService.info("Auto Sync: Retrying sync..."),await this.createAndRunSyncTask(e,i),s=void 0}catch(h){this.logService.error(h),s=h}}this._onDidFinishSync.fire(s)}async createAndRunSyncTask(t,e){if(this.syncTask=await this.userDataSyncService.createSyncTask(this.manifest,t),e.isCancellationRequested)return;if(this.manifest=this.syncTask.manifest,this.manifest===null&&await this.userDataSyncService.hasPreviouslySynced())throw this.hasSyncServiceChanged()?await this.hasDefaultServiceChanged()?new o(y("default service changed","Cannot sync because default service has changed"),r.DefaultServiceChanged):new o(y("service changed","Cannot sync because sync service has changed"),r.ServiceChanged):new o(y("turned off","Cannot sync because syncing is turned off in the cloud"),r.TurnedOff);const i=this.storageService.get(I,a.APPLICATION);if(i&&this.manifest&&i!==this.manifest.session)throw this.hasSyncServiceChanged()?await this.hasDefaultServiceChanged()?new o(y("default service changed","Cannot sync because default service has changed"),r.DefaultServiceChanged):new o(y("service changed","Cannot sync because sync service has changed"),r.ServiceChanged):new o(y("session expired","Cannot sync because current session is expired"),r.SessionExpired);const s=await this.userDataSyncMachinesService.getMachines(this.manifest||void 0);if(e.isCancellationRequested)return;const n=s.find(l=>l.isCurrent);if(n?.disabled)throw new o(y("turned off machine","Cannot sync because syncing is turned off on this machine from another machine."),r.TurnedOff);const h=new Date().getTime();if(await this.syncTask.run(),this.telemetryService.publicLog2("settingsSync:sync",{duration:new Date().getTime()-h}),this.manifest===null)try{this.manifest=await this.userDataSyncStoreService.manifest(null)}catch(l){throw new o(F(l),l instanceof D?l.code:r.Unknown)}this.manifest&&this.manifest.session!==i&&this.storageService.store(I,this.manifest.session,a.APPLICATION,v.MACHINE),!e.isCancellationRequested&&(n||await this.userDataSyncMachinesService.addCurrentMachine(this.manifest||void 0))}register(t){return super._register(t)}}export{f as UserDataAutoSyncService};
