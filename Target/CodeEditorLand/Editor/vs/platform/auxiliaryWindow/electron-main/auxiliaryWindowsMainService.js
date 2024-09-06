var v=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var W=(d,r,n,e)=>{for(var i=e>1?void 0:e?g(r,n):r,o=d.length-1,t;o>=0;o--)(t=d[o])&&(i=(e?t(r,n,i):t(i))||i);return e&&i&&v(r,n,i),i},u=(d,r)=>(n,e)=>r(n,e,d);import{app as f,BrowserWindow as x}from"electron";import{Emitter as l,Event as m}from"../../../../vs/base/common/event.js";import{Disposable as h,DisposableStore as p,toDisposable as b}from"../../../../vs/base/common/lifecycle.js";import{FileAccess as S}from"../../../../vs/base/common/network.js";import{validatedIpcMain as D}from"../../../../vs/base/parts/ipc/electron-main/ipcMain.js";import{AuxiliaryWindow as I}from"../../../../vs/platform/auxiliaryWindow/electron-main/auxiliaryWindow.js";import"../../../../vs/platform/auxiliaryWindow/electron-main/auxiliaryWindows.js";import{IInstantiationService as C}from"../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as A}from"../../../../vs/platform/log/common/log.js";import{defaultAuxWindowState as _,WindowMode as y}from"../../../../vs/platform/window/electron-main/window.js";import{defaultBrowserWindowOptions as F,getLastFocused as B,WindowStateValidator as M}from"../../../../vs/platform/windows/electron-main/windows.js";let c=class extends h{constructor(n,e){super();this.instantiationService=n;this.logService=e;this.registerListeners()}_onDidMaximizeWindow=this._register(new l);onDidMaximizeWindow=this._onDidMaximizeWindow.event;_onDidUnmaximizeWindow=this._register(new l);onDidUnmaximizeWindow=this._onDidUnmaximizeWindow.event;_onDidChangeFullScreen=this._register(new l);onDidChangeFullScreen=this._onDidChangeFullScreen.event;_onDidTriggerSystemContextMenu=this._register(new l);onDidTriggerSystemContextMenu=this._onDidTriggerSystemContextMenu.event;windows=new Map;registerListeners(){f.on("browser-window-created",(n,e)=>{const i=this.getWindowByWebContents(e.webContents);if(i)this.logService.trace('[aux window] app.on("browser-window-created"): Trying to claim auxiliary window'),i.tryClaimWindow();else{const o=new p;o.add(m.fromNodeEventEmitter(e.webContents,"did-create-window",(t,a)=>({browserWindow:t,details:a}))(({browserWindow:t,details:a})=>{const s=this.getWindowByWebContents(t.webContents);s&&(this.logService.trace('[aux window] window.on("did-create-window"): Trying to claim auxiliary window'),s.tryClaimWindow(a.options))})),o.add(m.fromNodeEventEmitter(e,"closed")(()=>o.dispose()))}}),D.handle("vscode:registerAuxiliaryWindow",async(n,e)=>{const i=this.getWindowByWebContents(n.sender);return i&&(this.logService.trace("[aux window] vscode:registerAuxiliaryWindow: Registering auxiliary window to main window"),i.parentId=e),n.sender.id})}createWindow(n){const{state:e,overrides:i}=this.computeWindowStateAndOverrides(n);return this.instantiationService.invokeFunction(F,e,i,{preload:S.asFileUri("vs/base/parts/sandbox/electron-sandbox/preload-aux.js").fsPath})}computeWindowStateAndOverrides(n){const e={},i={},o=n.features.split(",");for(const a of o){const[s,w]=a.split("=");switch(s){case"width":e.width=parseInt(w,10);break;case"height":e.height=parseInt(w,10);break;case"left":e.x=parseInt(w,10);break;case"top":e.y=parseInt(w,10);break;case"window-maximized":e.mode=y.Maximized;break;case"window-fullscreen":e.mode=y.Fullscreen;break;case"window-disable-fullscreen":i.disableFullscreen=!0;break;case"window-native-titlebar":i.forceNativeTitlebar=!0;break}}const t=M.validateWindowState(this.logService,e)??_();return this.logService.trace("[aux window] using window state",t),{state:t,overrides:i}}registerWindow(n){const e=new p,i=this.instantiationService.createInstance(I,n);this.windows.set(i.id,i),e.add(b(()=>this.windows.delete(i.id))),e.add(i.onDidMaximize(()=>this._onDidMaximizeWindow.fire(i))),e.add(i.onDidUnmaximize(()=>this._onDidUnmaximizeWindow.fire(i))),e.add(i.onDidEnterFullScreen(()=>this._onDidChangeFullScreen.fire({window:i,fullscreen:!0}))),e.add(i.onDidLeaveFullScreen(()=>this._onDidChangeFullScreen.fire({window:i,fullscreen:!1}))),e.add(i.onDidTriggerSystemContextMenu(({x:o,y:t})=>this._onDidTriggerSystemContextMenu.fire({window:i,x:o,y:t}))),m.once(i.onDidClose)(()=>e.dispose())}getWindowByWebContents(n){const e=this.windows.get(n.id);return e?.matches(n)?e:void 0}getFocusedWindow(){const n=x.getFocusedWindow();if(n)return this.getWindowByWebContents(n.webContents)}getLastActiveWindow(){return B(Array.from(this.windows.values()))}getWindows(){return Array.from(this.windows.values())}};c=W([u(0,C),u(1,A)],c);export{c as AuxiliaryWindowsMainService};