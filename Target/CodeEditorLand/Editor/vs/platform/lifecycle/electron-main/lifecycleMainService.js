var y=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var v=(l,d,e,i)=>{for(var o=i>1?void 0:i?g(d,e):d,n=l.length-1,t;n>=0;n--)(t=l[n])&&(o=(i?t(d,e,o):t(o))||o);return i&&o&&y(d,e,o),o},c=(l,d)=>(e,i)=>d(e,i,l);import r from"electron";import{Barrier as I,Promises as R,timeout as P}from"../../../base/common/async.js";import{Emitter as h,Event as u}from"../../../base/common/event.js";import{Disposable as S,DisposableStore as m}from"../../../base/common/lifecycle.js";import{isMacintosh as p,isWindows as L}from"../../../base/common/platform.js";import{cwd as q}from"../../../base/common/process.js";import{assertIsDefined as W}from"../../../base/common/types.js";import{validatedIpcMain as w}from"../../../base/parts/ipc/electron-main/ipcMain.js";import{IEnvironmentMainService as _}from"../../environment/electron-main/environmentMainService.js";import{createDecorator as b}from"../../instantiation/common/instantiation.js";import{ILogService as E}from"../../log/common/log.js";import{IStateService as T}from"../../state/node/state.js";import{UnloadReason as f}from"../../window/electron-main/window.js";const G=b("lifecycleMainService");var C=(e=>(e[e.QUIT=1]="QUIT",e[e.KILL=2]="KILL",e))(C||{}),U=(o=>(o[o.Starting=1]="Starting",o[o.Ready=2]="Ready",o[o.AfterWindowOpen=3]="AfterWindowOpen",o[o.Eventually=4]="Eventually",o))(U||{});let s=class extends S{constructor(e,i,o){super();this.logService=e;this.stateService=i;this.environmentMainService=o;this.resolveRestarted(),this.when(2).then(()=>this.registerListeners())}static QUIT_AND_RESTART_KEY="lifecycle.quitAndRestart";_onBeforeShutdown=this._register(new h);onBeforeShutdown=this._onBeforeShutdown.event;_onWillShutdown=this._register(new h);onWillShutdown=this._onWillShutdown.event;_onWillLoadWindow=this._register(new h);onWillLoadWindow=this._onWillLoadWindow.event;_onBeforeCloseWindow=this._register(new h);onBeforeCloseWindow=this._onBeforeCloseWindow.event;_quitRequested=!1;get quitRequested(){return this._quitRequested}_wasRestarted=!1;get wasRestarted(){return this._wasRestarted}_phase=1;get phase(){return this._phase}windowToCloseRequest=new Set;oneTimeListenerTokenGenerator=0;windowCounter=0;pendingQuitPromise=void 0;pendingQuitPromiseResolve=void 0;pendingWillShutdownPromise=void 0;mapWindowIdToPendingUnload=new Map;phaseWhen=new Map;relaunchHandler=void 0;resolveRestarted(){this._wasRestarted=!!this.stateService.getItem(s.QUIT_AND_RESTART_KEY),this._wasRestarted&&this.stateService.removeItem(s.QUIT_AND_RESTART_KEY)}registerListeners(){const e=()=>{this._quitRequested||(this.trace("Lifecycle#app.on(before-quit)"),this._quitRequested=!0,this.trace("Lifecycle#onBeforeShutdown.fire()"),this._onBeforeShutdown.fire(),p&&this.windowCounter===0&&this.fireOnWillShutdown(1))};r.app.addListener("before-quit",e);const i=()=>{this.trace("Lifecycle#app.on(window-all-closed)"),(this._quitRequested||!p)&&r.app.quit()};r.app.addListener("window-all-closed",i),r.app.once("will-quit",o=>{this.trace("Lifecycle#app.on(will-quit) - begin"),o.preventDefault(),this.fireOnWillShutdown(1).finally(()=>{this.trace("Lifecycle#app.on(will-quit) - after fireOnWillShutdown"),this.resolvePendingQuitPromise(!1),r.app.removeListener("before-quit",e),r.app.removeListener("window-all-closed",i),this.trace("Lifecycle#app.on(will-quit) - calling app.quit()"),r.app.quit()})})}fireOnWillShutdown(e){if(this.pendingWillShutdownPromise)return this.pendingWillShutdownPromise;const i=this.logService;this.trace("Lifecycle#onWillShutdown.fire()");const o=[];return this._onWillShutdown.fire({reason:e,join(n,t){i.trace(`Lifecycle#onWillShutdown - begin '${n}'`),o.push(t.finally(()=>{i.trace(`Lifecycle#onWillShutdown - end '${n}'`)}))}}),this.pendingWillShutdownPromise=(async()=>{try{await R.settled(o)}catch(n){this.logService.error(n)}try{await this.stateService.close()}catch(n){this.logService.error(n)}})(),this.pendingWillShutdownPromise}set phase(e){if(e<this.phase)throw new Error("Lifecycle cannot go backwards");if(this._phase===e)return;this.trace(`lifecycle (main): phase changed (value: ${e})`),this._phase=e;const i=this.phaseWhen.get(this._phase);i&&(i.open(),this.phaseWhen.delete(this._phase))}async when(e){if(e<=this._phase)return;let i=this.phaseWhen.get(e);i||(i=new I,this.phaseWhen.set(e,i)),await i.wait()}registerWindow(e){const i=new m;this.windowCounter++,i.add(e.onWillLoad(n=>this._onWillLoadWindow.fire({window:e,workspace:n.workspace,reason:n.reason})));const o=W(e.win);i.add(u.fromNodeEventEmitter(o,"close")(n=>{const t=e.id;if(this.windowToCloseRequest.has(t)){this.windowToCloseRequest.delete(t);return}this.trace(`Lifecycle#window.on('close') - window ID ${e.id}`),n.preventDefault(),this.unload(e,f.CLOSE).then(a=>{if(a){this.windowToCloseRequest.delete(t);return}this.windowToCloseRequest.add(t),this.trace(`Lifecycle#onBeforeCloseWindow.fire() - window ID ${t}`),this._onBeforeCloseWindow.fire(e),e.close()})})),i.add(u.fromNodeEventEmitter(o,"closed")(()=>{this.trace(`Lifecycle#window.on('closed') - window ID ${e.id}`),this.windowCounter--,i.dispose(),this.windowCounter===0&&(!p||this._quitRequested)&&this.fireOnWillShutdown(1)}))}registerAuxWindow(e){const i=W(e.win),o=new m;o.add(u.fromNodeEventEmitter(i,"close")(n=>{this.trace(`Lifecycle#auxWindow.on('close') - window ID ${e.id}`),this._quitRequested&&(this.trace("Lifecycle#auxWindow.on('close') - preventDefault() because quit requested"),n.preventDefault())})),o.add(u.fromNodeEventEmitter(i,"closed")(()=>{this.trace(`Lifecycle#auxWindow.on('closed') - window ID ${e.id}`),o.dispose()}))}async reload(e,i){await this.unload(e,f.RELOAD)||e.reload(i)}unload(e,i){const o=this.mapWindowIdToPendingUnload.get(e.id);if(o)return o;const n=this.doUnload(e,i).finally(()=>{this.mapWindowIdToPendingUnload.delete(e.id)});return this.mapWindowIdToPendingUnload.set(e.id,n),n}async doUnload(e,i){if(!e.isReady)return!1;this.trace(`Lifecycle#unload() - window ID ${e.id}`);const o=this._quitRequested?f.QUIT:i,n=await this.onBeforeUnloadWindowInRenderer(e,o);return n?(this.trace(`Lifecycle#unload() - veto in renderer (window ID ${e.id})`),this.handleWindowUnloadVeto(n)):(await this.onWillUnloadWindowInRenderer(e,o),!1)}handleWindowUnloadVeto(e){return e?(this.resolvePendingQuitPromise(!0),this._quitRequested=!1,!0):!1}resolvePendingQuitPromise(e){this.pendingQuitPromiseResolve&&(this.pendingQuitPromiseResolve(e),this.pendingQuitPromiseResolve=void 0,this.pendingQuitPromise=void 0)}onBeforeUnloadWindowInRenderer(e,i){return new Promise(o=>{const n=this.oneTimeListenerTokenGenerator++,t=`vscode:ok${n}`,a=`vscode:cancel${n}`;w.once(t,()=>{o(!1)}),w.once(a,()=>{o(!0)}),e.send("vscode:onBeforeUnload",{okChannel:t,cancelChannel:a,reason:i})})}onWillUnloadWindowInRenderer(e,i){return new Promise(o=>{const t=`vscode:reply${this.oneTimeListenerTokenGenerator++}`;w.once(t,()=>o()),e.send("vscode:onWillUnload",{replyChannel:t,reason:i})})}quit(e){return this.doQuit(e).then(i=>{if(!i&&e)try{if(L){const o=q();o!==process.cwd()&&process.chdir(o)}}catch(o){this.logService.error(o)}return i})}doQuit(e){return this.trace(`Lifecycle#quit() - begin (willRestart: ${e})`),this.pendingQuitPromise?(this.trace("Lifecycle#quit() - returning pending quit promise"),this.pendingQuitPromise):(e&&this.stateService.setItem(s.QUIT_AND_RESTART_KEY,!0),this.pendingQuitPromise=new Promise(i=>{this.pendingQuitPromiseResolve=i,this.trace("Lifecycle#quit() - calling app.quit()"),r.app.quit()}),this.pendingQuitPromise)}trace(e){this.environmentMainService.args["enable-smoke-test-driver"]?this.logService.info(e):this.logService.trace(e)}setRelaunchHandler(e){this.relaunchHandler=e}async relaunch(e){this.trace("Lifecycle#relaunch()");const i=process.argv.slice(1);if(e?.addArgs&&i.push(...e.addArgs),e?.removeArgs)for(const t of e.removeArgs){const a=i.indexOf(t);a>=0&&i.splice(a,1)}const o=()=>{this.relaunchHandler?.handleRelaunch(e)||(this.trace("Lifecycle#relaunch() - calling app.relaunch()"),r.app.relaunch({args:i}))};r.app.once("quit",o),await this.quit(!0)&&r.app.removeListener("quit",o)}async kill(e){this.trace("Lifecycle#kill()"),await this.fireOnWillShutdown(2),await Promise.race([P(1e3),(async()=>{for(const i of r.BrowserWindow.getAllWindows())if(i&&!i.isDestroyed()){let o;i.webContents&&!i.webContents.isDestroyed()?o=new Promise(n=>i.once("closed",n)):o=Promise.resolve(),i.destroy(),await o}})()]),r.app.exit(e)}};s=v([c(0,E),c(1,T),c(2,_)],s);export{G as ILifecycleMainService,U as LifecycleMainPhase,s as LifecycleMainService,C as ShutdownReason};
