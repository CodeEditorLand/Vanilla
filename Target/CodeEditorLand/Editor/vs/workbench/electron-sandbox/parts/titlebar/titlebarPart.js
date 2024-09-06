var ie=Object.defineProperty;var te=Object.getOwnPropertyDescriptor;var b=(h,s,i,o)=>{for(var t=o>1?void 0:o?te(s,i):s,r=h.length-1,n;r>=0;r--)(n=h[r])&&(t=(o?n(s,i,t):n(t))||t);return o&&t&&ie(s,i,t),t},e=(h,s)=>(i,o)=>s(i,o,h);import{getZoomFactor as y,isWCOEnabled as re}from"../../../../../vs/base/browser/browser.js";import{$ as W,addDisposableListener as x,append as M,EventType as E,getWindow as m,getWindowId as N,hide as A,show as K}from"../../../../../vs/base/browser/dom.js";import{mainWindow as oe}from"../../../../../vs/base/browser/window.js";import{Codicon as l}from"../../../../../vs/base/common/codicons.js";import{Event as ne}from"../../../../../vs/base/common/event.js";import{isBigSurOrNewer as se,isLinux as J,isMacintosh as H,isNative as ae,isWindows as B}from"../../../../../vs/base/common/platform.js";import{ThemeIcon as u}from"../../../../../vs/base/common/themables.js";import{IMenuService as _,MenuId as ce}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as D}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as O}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as G}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IInstantiationService as U}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as F}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{INativeHostService as V}from"../../../../../vs/platform/native/common/native.js";import{IStorageService as Z}from"../../../../../vs/platform/storage/common/storage.js";import{IThemeService as $}from"../../../../../vs/platform/theme/common/themeService.js";import{DEFAULT_CUSTOM_TITLEBAR_HEIGHT as de,hasNativeTitlebar as T,useWindowControlsOverlay as Q}from"../../../../../vs/platform/window/common/window.js";import{BrowserTitlebarPart as me,BrowserTitleService as he}from"../../../../../vs/workbench/browser/parts/titlebar/titlebarPart.js";import{NativeMenubarControl as ve}from"../../../../../vs/workbench/electron-sandbox/parts/titlebar/menubarControl.js";import{IEditorGroupsService as P}from"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as X}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{INativeWorkbenchEnvironmentService as Y}from"../../../../../vs/workbench/services/environment/electron-sandbox/environmentService.js";import{IHostService as j}from"../../../../../vs/workbench/services/host/browser/host.js";import{IWorkbenchLayoutService as q,Parts as le}from"../../../../../vs/workbench/services/layout/browser/layoutService.js";let p=class extends me{constructor(i,o,t,r,n,a,c,d,g,S,C,I,w,z,L,R,k){super(i,o,t,r,n,a,c,d,g,S,C,I,z,L,R,k);this.nativeHostService=w;this.bigSurOrNewer=se(a.os.release)}get minimumHeight(){return H?(this.isCommandCenterVisible?de:this.macTitlebarSize)/(this.preventZoom?y(m(this.element)):1):super.minimumHeight}get maximumHeight(){return this.minimumHeight}bigSurOrNewer;get macTitlebarSize(){return this.bigSurOrNewer?28:22}maxRestoreControl;resizer;cachedWindowControlStyles;cachedWindowControlHeight;onMenubarVisibilityChanged(i){(B||J)&&this.currentMenubarVisibility==="toggle"&&i&&this.dragRegion&&(A(this.dragRegion),setTimeout(()=>K(this.dragRegion),50)),super.onMenubarVisibilityChanged(i)}onConfigurationChanged(i){super.onConfigurationChanged(i),i.affectsConfiguration("window.doubleClickIconToClose")&&this.appIcon&&this.onUpdateAppIconDragBehavior()}onUpdateAppIconDragBehavior(){this.configurationService.getValue("window.doubleClickIconToClose")&&this.appIcon?this.appIcon.style["-webkit-app-region"]="no-drag":this.appIcon&&(this.appIcon.style["-webkit-app-region"]="drag")}installMenubar(){super.installMenubar(),!this.menubar&&this.customMenubar&&this._register(this.customMenubar.onFocusStateChange(i=>this.onMenubarFocusChanged(i)))}onMenubarFocusChanged(i){(B||J)&&this.currentMenubarVisibility!=="compact"&&this.dragRegion&&(i?A(this.dragRegion):K(this.dragRegion))}createContentArea(i){const o=super.createContentArea(i),t=m(i),r=N(t);if((H||T(this.configurationService))&&this._register(this.instantiationService.createInstance(ve)),this.appIcon&&(this.onUpdateAppIconDragBehavior(),this._register(x(this.appIcon,E.DBLCLICK,()=>{this.nativeHostService.closeWindow({targetWindowId:r})}))),!H&&!T(this.configurationService)&&!re()&&this.primaryWindowControls){const n=M(this.primaryWindowControls,W("div.window-icon.window-minimize"+u.asCSSSelector(l.chromeMinimize)));this._register(x(n,E.CLICK,()=>{this.nativeHostService.minimizeWindow({targetWindowId:r})})),this.maxRestoreControl=M(this.primaryWindowControls,W("div.window-icon.window-max-restore")),this._register(x(this.maxRestoreControl,E.CLICK,async()=>await this.nativeHostService.isMaximized({targetWindowId:r})?this.nativeHostService.unmaximizeWindow({targetWindowId:r}):this.nativeHostService.maximizeWindow({targetWindowId:r})));const a=M(this.primaryWindowControls,W("div.window-icon.window-close"+u.asCSSSelector(l.chromeClose)));this._register(x(a,E.CLICK,()=>{this.nativeHostService.closeWindow({targetWindowId:r})})),this.resizer=M(this.rootContainer,W("div.resizer")),this._register(ne.runAndSubscribe(this.layoutService.onDidChangeWindowMaximized,({windowId:c,maximized:d})=>{c===r&&this.onDidChangeWindowMaximized(d)},{windowId:r,maximized:this.layoutService.isWindowMaximized(t)}))}return B&&!T(this.configurationService)&&this._register(this.nativeHostService.onDidTriggerWindowSystemContextMenu(({windowId:n,x:a,y:c})=>{if(r!==n)return;const d=y(m(this.element));this.onContextMenu(new MouseEvent("mouseup",{clientX:a/d,clientY:c/d}),ce.TitleBarContext)})),o}onDidChangeWindowMaximized(i){this.maxRestoreControl&&(i?(this.maxRestoreControl.classList.remove(...u.asClassNameArray(l.chromeMaximize)),this.maxRestoreControl.classList.add(...u.asClassNameArray(l.chromeRestore))):(this.maxRestoreControl.classList.remove(...u.asClassNameArray(l.chromeRestore)),this.maxRestoreControl.classList.add(...u.asClassNameArray(l.chromeMaximize)))),this.resizer&&(i?A(this.resizer):K(this.resizer))}updateStyles(){super.updateStyles(),Q(this.configurationService)&&(!this.cachedWindowControlStyles||this.cachedWindowControlStyles.bgColor!==this.element.style.backgroundColor||this.cachedWindowControlStyles.fgColor!==this.element.style.color)&&this.nativeHostService.updateWindowControls({targetWindowId:N(m(this.element)),backgroundColor:this.element.style.backgroundColor,foregroundColor:this.element.style.color})}layout(i,o){if(super.layout(i,o),Q(this.configurationService)||H&&ae&&!T(this.configurationService)){const t=o>0||this.bigSurOrNewer?Math.round(o*y(m(this.element))):this.macTitlebarSize;t!==this.cachedWindowControlHeight&&(this.cachedWindowControlHeight=t,this.nativeHostService.updateWindowControls({targetWindowId:N(m(this.element)),height:t}))}}};p=b([e(3,G),e(4,D),e(5,Y),e(6,U),e(7,$),e(8,Z),e(9,q),e(10,O),e(11,j),e(12,V),e(13,P),e(14,X),e(15,_),e(16,F)],p);let f=class extends p{constructor(s,i,o,t,r,n,a,c,d,g,S,C,I,w){super(le.TITLEBAR_PART,oe,"main",s,i,o,t,r,n,a,c,d,g,S,C,I,w)}};f=b([e(0,G),e(1,D),e(2,Y),e(3,U),e(4,$),e(5,Z),e(6,q),e(7,O),e(8,j),e(9,V),e(10,P),e(11,X),e(12,_),e(13,F)],f);let v=class extends p{constructor(i,o,t,r,n,a,c,d,g,S,C,I,w,z,L,R,k){const ee=v.COUNTER++;super(`workbench.parts.auxiliaryTitle.${ee}`,m(i),o,r,n,a,c,d,g,S,C,I,w,z,L,R,k);this.container=i;this.mainTitlebar=t}static COUNTER=1;get height(){return this.minimumHeight}get preventZoom(){return y(m(this.element))<1||!this.mainTitlebar.hasZoomableElements}};v=b([e(3,G),e(4,D),e(5,Y),e(6,U),e(7,$),e(8,Z),e(9,q),e(10,O),e(11,j),e(12,V),e(13,P),e(14,X),e(15,_),e(16,F)],v);class Fe extends he{createMainTitlebarPart(){return this.instantiationService.createInstance(f)}doCreateAuxiliaryTitlebarPart(s,i){return this.instantiationService.createInstance(v,s,i,this.mainPart)}}export{v as AuxiliaryNativeTitlebarPart,f as MainNativeTitlebarPart,Fe as NativeTitleService,p as NativeTitlebarPart};