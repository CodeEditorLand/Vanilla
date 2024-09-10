var I=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var y=(c,s,e,i)=>{for(var r=i>1?void 0:i?k(s,e):s,o=c.length-1,n;o>=0;o--)(n=c[o])&&(r=(i?n(s,e,r):n(r))||r);return i&&r&&I(s,e,r),r},t=(c,s)=>(e,i)=>s(e,i,c);import{Disposable as w}from"../../../base/common/lifecycle.js";import{createDecorator as S}from"../../instantiation/common/instantiation.js";import{ILogService as p}from"../../log/common/log.js";import{IWindowsMainService as m}from"../../windows/electron-main/windows.js";import{WindowUtilityProcess as f}from"./utilityProcess.js";import{ITelemetryService as v}from"../../telemetry/common/telemetry.js";import{hash as g}from"../../../base/common/hash.js";import{Event as u,Emitter as P}from"../../../base/common/event.js";import{DeferredPromise as W}from"../../../base/common/async.js";import{ILifecycleMainService as h}from"../../lifecycle/electron-main/lifecycleMainService.js";const V=S("utilityProcessWorker");let a=class extends w{constructor(e,i,r,o){super();this.logService=e;this.windowsMainService=i;this.telemetryService=r;this.lifecycleMainService=o}workers=new Map;async createWorker(e){const i=`window: ${e.reply.windowId}, moduleId: ${e.process.moduleId}`;this.logService.trace(`[UtilityProcessWorker]: createWorker(${i})`);const r=this.hash(e);this.workers.has(r)&&(this.logService.warn(`[UtilityProcessWorker]: createWorker() found an existing worker that will be terminated (${i})`),this.disposeWorker(e));const o=new d(this.logService,this.windowsMainService,this.telemetryService,this.lifecycleMainService,e);if(!o.spawn())return{reason:{code:1,signal:"EINVALID"}};this.workers.set(r,o);const n=new W;return u.once(o.onDidTerminate)(l=>{l.code===0?this.logService.trace(`[UtilityProcessWorker]: terminated normally with code ${l.code}, signal: ${l.signal}`):this.logService.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${l.code}, signal: ${l.signal}`),this.workers.delete(r),n.complete({reason:l})}),n.p}hash(e){return g({moduleId:e.process.moduleId,windowId:e.reply.windowId})}async disposeWorker(e){const i=this.hash(e),r=this.workers.get(i);r&&(this.logService.trace(`[UtilityProcessWorker]: disposeWorker(window: ${e.reply.windowId}, moduleId: ${e.process.moduleId})`),r.kill(),r.dispose(),this.workers.delete(i))}};a=y([t(0,p),t(1,m),t(2,v),t(3,h)],a);let d=class extends w{constructor(e,i,r,o,n){super();this.logService=e;this.windowsMainService=i;this.telemetryService=r;this.lifecycleMainService=o;this.configuration=n;this.registerListeners()}_onDidTerminate=this._register(new P);onDidTerminate=this._onDidTerminate.event;utilityProcess=this._register(new f(this.logService,this.windowsMainService,this.telemetryService,this.lifecycleMainService));registerListeners(){this._register(this.utilityProcess.onExit(e=>this._onDidTerminate.fire({code:e.code,signal:e.signal}))),this._register(this.utilityProcess.onCrash(e=>this._onDidTerminate.fire({code:e.code,signal:"ECRASH"})))}spawn(){const i=this.windowsMainService.getWindowById(this.configuration.reply.windowId)?.win?.webContents.getOSProcessId();return this.utilityProcess.start({type:this.configuration.process.type,entryPoint:this.configuration.process.moduleId,parentLifecycleBound:i,windowLifecycleBound:!0,correlationId:`${this.configuration.reply.windowId}`,responseWindowId:this.configuration.reply.windowId,responseChannel:this.configuration.reply.channel,responseNonce:this.configuration.reply.nonce})}kill(){this.utilityProcess.kill()}};d=y([t(0,p),t(1,m),t(2,v),t(3,h)],d);export{V as IUtilityProcessWorkerMainService,a as UtilityProcessWorkerMainService};
