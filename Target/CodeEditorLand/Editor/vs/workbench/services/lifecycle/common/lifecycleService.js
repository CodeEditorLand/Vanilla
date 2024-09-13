var c=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var u=(s,n,e,t)=>{for(var r=t>1?void 0:t?w(n,e):n,a=s.length-1,d;a>=0;a--)(d=s[a])&&(r=(t?d(n,e,r):d(r))||r);return t&&r&&c(n,e,r),r},h=(s,n)=>(e,t)=>n(e,t,s);import{Barrier as _}from"../../../../base/common/async.js";import{Emitter as i}from"../../../../base/common/event.js";import{Disposable as f}from"../../../../base/common/lifecycle.js";import{mark as v}from"../../../../base/common/performance.js";import{ILogService as g}from"../../../../platform/log/common/log.js";import{IStorageService as y,StorageScope as S,StorageTarget as E,WillSaveStateReason as K}from"../../../../platform/storage/common/storage.js";import{LifecyclePhase as W,LifecyclePhaseToString as m,ShutdownReason as l,StartupKind as p}from"./lifecycle.js";let o=class extends f{constructor(e,t){super();this.logService=e;this.storageService=t;this._startupKind=this.resolveStartupKind(),this._register(this.storageService.onWillSaveState(r=>{r.reason===K.SHUTDOWN&&this.storageService.store(o.LAST_SHUTDOWN_REASON_KEY,this.shutdownReason,S.WORKSPACE,E.MACHINE)}))}static LAST_SHUTDOWN_REASON_KEY="lifecyle.lastShutdownReason";_onBeforeShutdown=this._register(new i);onBeforeShutdown=this._onBeforeShutdown.event;_onWillShutdown=this._register(new i);onWillShutdown=this._onWillShutdown.event;_onDidShutdown=this._register(new i);onDidShutdown=this._onDidShutdown.event;_onBeforeShutdownError=this._register(new i);onBeforeShutdownError=this._onBeforeShutdownError.event;_onShutdownVeto=this._register(new i);onShutdownVeto=this._onShutdownVeto.event;_startupKind;get startupKind(){return this._startupKind}_phase=W.Starting;get phase(){return this._phase}phaseWhen=new Map;shutdownReason;resolveStartupKind(){const e=this.doResolveStartupKind()??p.NewWindow;return this.logService.trace(`[lifecycle] starting up (startup kind: ${e})`),e}doResolveStartupKind(){const e=this.storageService.getNumber(o.LAST_SHUTDOWN_REASON_KEY,S.WORKSPACE);this.storageService.remove(o.LAST_SHUTDOWN_REASON_KEY,S.WORKSPACE);let t;switch(e){case l.RELOAD:t=p.ReloadedWindow;break;case l.LOAD:t=p.ReopenedWindow;break}return t}set phase(e){if(e<this.phase)throw new Error("Lifecycle cannot go backwards");if(this._phase===e)return;this.logService.trace(`lifecycle: phase changed (value: ${e})`),this._phase=e,v(`code/LifecyclePhase/${m(e)}`);const t=this.phaseWhen.get(this._phase);t&&(t.open(),this.phaseWhen.delete(this._phase))}async when(e){if(e<=this._phase)return;let t=this.phaseWhen.get(e);t||(t=new _,this.phaseWhen.set(e,t)),await t.wait()}};o=u([h(0,g),h(1,y)],o);export{o as AbstractLifecycleService};
