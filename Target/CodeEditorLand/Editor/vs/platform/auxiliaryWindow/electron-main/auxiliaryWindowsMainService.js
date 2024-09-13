var v=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var p=(d,r,n,e)=>{for(var i=e>1?void 0:e?g(r,n):r,o=d.length-1,t;o>=0;o--)(t=d[o])&&(i=(e?t(r,n,i):t(i))||i);return e&&i&&v(r,n,i),i},c=(d,r)=>(n,e)=>r(n,e,d);import{BrowserWindow as f,app as x}from"electron";import{Emitter as l,Event as m}from"../../../base/common/event.js";import{Disposable as h,DisposableStore as y,toDisposable as b}from"../../../base/common/lifecycle.js";import{FileAccess as S}from"../../../base/common/network.js";import{validatedIpcMain as D}from"../../../base/parts/ipc/electron-main/ipcMain.js";import{IInstantiationService as I}from"../../instantiation/common/instantiation.js";import{ILogService as C}from"../../log/common/log.js";import{WindowMode as W,defaultAuxWindowState as A}from"../../window/electron-main/window.js";import{WindowStateValidator as _,defaultBrowserWindowOptions as F,getLastFocused as B}from"../../windows/electron-main/windows.js";import{AuxiliaryWindow as M}from"./auxiliaryWindow.js";let u=class extends h{constructor(n,e){super();this.instantiationService=n;this.logService=e;this.registerListeners()}_onDidMaximizeWindow=this._register(new l);onDidMaximizeWindow=this._onDidMaximizeWindow.event;_onDidUnmaximizeWindow=this._register(new l);onDidUnmaximizeWindow=this._onDidUnmaximizeWindow.event;_onDidChangeFullScreen=this._register(new l);onDidChangeFullScreen=this._onDidChangeFullScreen.event;_onDidTriggerSystemContextMenu=this._register(new l);onDidTriggerSystemContextMenu=this._onDidTriggerSystemContextMenu.event;windows=new Map;registerListeners(){x.on("browser-window-created",(n,e)=>{const i=this.getWindowByWebContents(e.webContents);if(i)this.logService.trace('[aux window] app.on("browser-window-created"): Trying to claim auxiliary window'),i.tryClaimWindow();else{const o=new y;o.add(m.fromNodeEventEmitter(e.webContents,"did-create-window",(t,a)=>({browserWindow:t,details:a}))(({browserWindow:t,details:a})=>{const s=this.getWindowByWebContents(t.webContents);s&&(this.logService.trace('[aux window] window.on("did-create-window"): Trying to claim auxiliary window'),s.tryClaimWindow(a.options))})),o.add(m.fromNodeEventEmitter(e,"closed")(()=>o.dispose()))}}),D.handle("vscode:registerAuxiliaryWindow",async(n,e)=>{const i=this.getWindowByWebContents(n.sender);return i&&(this.logService.trace("[aux window] vscode:registerAuxiliaryWindow: Registering auxiliary window to main window"),i.parentId=e),n.sender.id})}createWindow(n){const{state:e,overrides:i}=this.computeWindowStateAndOverrides(n);return this.instantiationService.invokeFunction(F,e,i,{preload:S.asFileUri("vs/base/parts/sandbox/electron-sandbox/preload-aux.js").fsPath})}computeWindowStateAndOverrides(n){const e={},i={},o=n.features.split(",");for(const a of o){const[s,w]=a.split("=");switch(s){case"width":e.width=Number.parseInt(w,10);break;case"height":e.height=Number.parseInt(w,10);break;case"left":e.x=Number.parseInt(w,10);break;case"top":e.y=Number.parseInt(w,10);break;case"window-maximized":e.mode=W.Maximized;break;case"window-fullscreen":e.mode=W.Fullscreen;break;case"window-disable-fullscreen":i.disableFullscreen=!0;break;case"window-native-titlebar":i.forceNativeTitlebar=!0;break}}const t=_.validateWindowState(this.logService,e)??A();return this.logService.trace("[aux window] using window state",t),{state:t,overrides:i}}registerWindow(n){const e=new y,i=this.instantiationService.createInstance(M,n);this.windows.set(i.id,i),e.add(b(()=>this.windows.delete(i.id))),e.add(i.onDidMaximize(()=>this._onDidMaximizeWindow.fire(i))),e.add(i.onDidUnmaximize(()=>this._onDidUnmaximizeWindow.fire(i))),e.add(i.onDidEnterFullScreen(()=>this._onDidChangeFullScreen.fire({window:i,fullscreen:!0}))),e.add(i.onDidLeaveFullScreen(()=>this._onDidChangeFullScreen.fire({window:i,fullscreen:!1}))),e.add(i.onDidTriggerSystemContextMenu(({x:o,y:t})=>this._onDidTriggerSystemContextMenu.fire({window:i,x:o,y:t}))),m.once(i.onDidClose)(()=>e.dispose())}getWindowByWebContents(n){const e=this.windows.get(n.id);return e?.matches(n)?e:void 0}getFocusedWindow(){const n=f.getFocusedWindow();if(n)return this.getWindowByWebContents(n.webContents)}getLastActiveWindow(){return B(Array.from(this.windows.values()))}getWindows(){return Array.from(this.windows.values())}};u=p([c(0,I),c(1,C)],u);export{u as AuxiliaryWindowsMainService};
