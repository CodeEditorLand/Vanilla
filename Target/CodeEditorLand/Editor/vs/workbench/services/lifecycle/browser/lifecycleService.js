var g=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var p=(a,e,o,i)=>{for(var n=i>1?void 0:i?v(e,o):e,t=a.length-1,r;t>=0;t--)(r=a[t])&&(n=(i?r(e,o,n):r(n))||n);return i&&n&&g(e,o,n),n},l=(a,e)=>(o,i)=>e(o,i,a);import{addDisposableListener as f,EventType as u}from"../../../../base/browser/dom.js";import{mainWindow as s}from"../../../../base/browser/window.js";import{CancellationToken as S}from"../../../../base/common/cancellation.js";import"../../../../base/common/lifecycle.js";import{localize as m}from"../../../../nls.js";import{InstantiationType as U,registerSingleton as w}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as b}from"../../../../platform/log/common/log.js";import{IStorageService as y,WillSaveStateReason as h}from"../../../../platform/storage/common/storage.js";import{ILifecycleService as E,ShutdownReason as c,StartupKind as L}from"../common/lifecycle.js";import{AbstractLifecycleService as B}from"../common/lifecycleService.js";let d=class extends B{beforeUnloadListener=void 0;unloadListener=void 0;ignoreBeforeUnload=!1;didUnload=!1;constructor(e,o){super(e,o),this.registerListeners()}registerListeners(){this.beforeUnloadListener=f(s,u.BEFORE_UNLOAD,e=>this.onBeforeUnload(e)),this.unloadListener=f(s,u.PAGE_HIDE,()=>this.onUnload())}onBeforeUnload(e){this.ignoreBeforeUnload?(this.logService.info("[lifecycle] onBeforeUnload triggered but ignored once"),this.ignoreBeforeUnload=!1):(this.logService.info("[lifecycle] onBeforeUnload triggered and handled with veto support"),this.doShutdown(()=>this.vetoBeforeUnload(e)))}vetoBeforeUnload(e){e.preventDefault(),e.returnValue=m("lifecycleVeto","Changes that you made may not be saved. Please check press 'Cancel' and try again.")}withExpectedShutdown(e,o){if(typeof e=="number")return this.shutdownReason=e,this.storageService.flush(h.SHUTDOWN);this.ignoreBeforeUnload=!0;try{o?.()}finally{this.ignoreBeforeUnload=!1}}async shutdown(){this.logService.info("[lifecycle] shutdown triggered"),this.beforeUnloadListener?.dispose(),this.unloadListener?.dispose(),await this.storageService.flush(h.SHUTDOWN),this.doShutdown()}doShutdown(e){const o=this.logService;this.storageService.flush(h.SHUTDOWN);let i=!1;function n(t,r){typeof e=="function"&&(t instanceof Promise&&(o.error(`[lifecycle] Long running operations before shutdown are unsupported in the web (id: ${r})`),i=!0),t===!0&&(o.info(`[lifecycle]: Unload was prevented (id: ${r})`),i=!0))}return this._onBeforeShutdown.fire({reason:c.QUIT,veto(t,r){n(t,r)},finalVeto(t,r){n(t(),r)}}),i&&typeof e=="function"?e():this.onUnload()}onUnload(){if(this.didUnload)return;this.didUnload=!0,this._register(f(s,u.PAGE_SHOW,o=>this.onLoadAfterUnload(o)));const e=this.logService;this._onWillShutdown.fire({reason:c.QUIT,joiners:()=>[],token:S.None,join(o,i){e.error(`[lifecycle] Long running operations during shutdown are unsupported in the web (id: ${i.id})`)},force:()=>{}}),this._onDidShutdown.fire()}onLoadAfterUnload(e){e.persisted&&this.withExpectedShutdown({disableShutdownHandling:!0},()=>s.location.reload())}doResolveStartupKind(){let e=super.doResolveStartupKind();return typeof e!="number"&&performance.getEntriesByType("navigation").at(0)?.type==="reload"&&(e=L.ReloadedWindow),e}};d=p([l(0,b),l(1,y)],d),w(E,d,U.Eager);export{d as BrowserLifecycleService};
