import"./style.js";import{isChrome as w,isFirefox as L,isSafari as W}from"../../base/browser/browser.js";import{runWhenWindowIdle as P}from"../../base/browser/dom.js";import{PixelRatio as R}from"../../base/browser/pixelRatio.js";import{setARIAContainer as _}from"../../base/browser/ui/aria/aria.js";import{setBaseLayerHoverDelegate as F}from"../../base/browser/ui/hover/hoverDelegate2.js";import{setHoverDelegateFactory as k}from"../../base/browser/ui/hover/hoverDelegateFactory.js";import{setProgressAcccessibilitySignalScheduler as T}from"../../base/browser/ui/progressbar/progressAccessibilitySignal.js";import{mainWindow as s}from"../../base/browser/window.js";import{isESM as x}from"../../base/common/amd.js";import{coalesce as D}from"../../base/common/arrays.js";import{RunOnceScheduler as N,timeout as V}from"../../base/common/async.js";import{toErrorMessage as H}from"../../base/common/errorMessage.js";import{onUnexpectedError as l,setUnexpectedErrorHandler as B}from"../../base/common/errors.js";import{Emitter as S,Event as I,setGlobalLeakWarningThreshold as U}from"../../base/common/event.js";import{mark as f}from"../../base/common/performance.js";import{isLinux as O,isMacintosh as M,isNative as j,isWeb as y,isWindows as q}from"../../base/common/platform.js";import{FontMeasurements as g}from"../../editor/browser/config/fontMeasurements.js";import{BareFontInfo as $}from"../../editor/common/config/fontInfo.js";import{localize as z}from"../../nls.js";import{AccessibleViewRegistry as J}from"../../platform/accessibility/browser/accessibleViewRegistry.js";import{AccessibilityProgressSignalScheduler as Y}from"../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.js";import{IConfigurationService as b}from"../../platform/configuration/common/configuration.js";import{IDialogService as G}from"../../platform/dialogs/common/dialogs.js";import{IHoverService as K,WorkbenchHoverDelegate as X}from"../../platform/hover/browser/hover.js";import{getSingletonServiceDescriptors as Q}from"../../platform/instantiation/common/extensions.js";import{InstantiationService as Z}from"../../platform/instantiation/common/instantiationService.js";import{INotificationService as ee}from"../../platform/notification/common/notification.js";import{Registry as E}from"../../platform/registry/common/platform.js";import{IStorageService as te,StorageScope as C,StorageTarget as ie,WillSaveStateReason as re}from"../../platform/storage/common/storage.js";import{Extensions as oe}from"../common/contributions.js";import{EditorExtensions as ne}from"../common/editor.js";import{IHostService as se}from"../services/host/browser/host.js";import{IWorkbenchLayoutService as ae,Parts as c,Position as u,positionToString as ce}from"../services/layout/browser/layoutService.js";import{ILifecycleService as A,LifecyclePhase as v}from"../services/lifecycle/common/lifecycle.js";import{WorkbenchContextKeysHandler as de}from"./contextkeys.js";import{Layout as le}from"./layout.js";import{NotificationAccessibleView as fe}from"./parts/notifications/notificationAccessibleView.js";import{NotificationsAlerts as me}from"./parts/notifications/notificationsAlerts.js";import{NotificationsCenter as he}from"./parts/notifications/notificationsCenter.js";import{registerNotificationCommands as pe}from"./parts/notifications/notificationsCommands.js";import{NotificationsStatus as ge}from"./parts/notifications/notificationsStatus.js";import{NotificationsTelemetry as ue}from"./parts/notifications/notificationsTelemetry.js";import{NotificationsToasts as ve}from"./parts/notifications/notificationsToasts.js";class lt extends le{constructor(t,e,r,i){super(t);this.options=e;this.serviceCollection=r;f("code/willStartWorkbench"),this.registerErrorHandler(i)}_onWillShutdown=this._register(new S);onWillShutdown=this._onWillShutdown.event;_onDidShutdown=this._register(new S);onDidShutdown=this._onDidShutdown.event;registerErrorHandler(t){s.addEventListener("unhandledrejection",e=>{l(e.reason),e.preventDefault()}),B(e=>this.handleUnexpectedError(e,t)),!x&&typeof s.require?.config=="function"&&s.require.config({onError:e=>{e.phase==="loading"&&l(new Error(z("loaderErrorNative","Failed to load a required file. Please restart the application to try again. Details: {0}",JSON.stringify(e))))}})}previousUnexpectedError={message:void 0,time:0};handleUnexpectedError(t,e){const r=H(t,!0);if(!r)return;const i=Date.now();r===this.previousUnexpectedError.message&&i-this.previousUnexpectedError.time<=1e3||(this.previousUnexpectedError.time=i,this.previousUnexpectedError.message=r,e.error(r))}startup(){try{this._register(U(175));const t=this.initServices(this.serviceCollection);return t.invokeFunction(e=>{const r=e.get(A),i=e.get(te),o=e.get(b),n=e.get(se),a=e.get(K),d=e.get(G),m=e.get(ee);k((h,p)=>t.createInstance(X,h,p,{})),F(a),this.initLayout(e),E.as(oe.Workbench).start(e),E.as(ne.EditorFactory).start(e),this._register(t.createInstance(de)),this.registerListeners(r,i,o,n,d),this.renderWorkbench(t,m,i,o),this.createWorkbenchLayout(),this.layout(),this.restore(r)}),t}catch(t){throw l(t),t}}initServices(t){t.set(ae,this);const e=Q();for(const[i,o]of e)t.set(i,o);const r=new Z(t,!0);return r.invokeFunction(i=>{const o=i.get(A),n=i.get(b);typeof n.acquireInstantiationService=="function"&&n.acquireInstantiationService(r),o.phase=v.Ready}),r}registerListeners(t,e,r,i,o){this._register(r.onDidChangeConfiguration(n=>this.updateFontAliasing(n,r))),j?this._register(e.onWillSaveState(n=>{n.reason===re.SHUTDOWN&&this.storeFontInfo(e)})):this._register(t.onWillShutdown(()=>this.storeFontInfo(e))),this._register(t.onWillShutdown(n=>this._onWillShutdown.fire(n))),this._register(t.onDidShutdown(()=>{this._onDidShutdown.fire(),this.dispose()})),this._register(i.onDidChangeFocus(n=>{n||e.flush()})),this._register(o.onWillShowDialog(()=>this.mainContainer.classList.add("modal-dialog-visible"))),this._register(o.onDidShowDialog(()=>this.mainContainer.classList.remove("modal-dialog-visible")))}fontAliasing;updateFontAliasing(t,e){if(!M||t&&!t.affectsConfiguration("workbench.fontAliasing"))return;const r=e.getValue("workbench.fontAliasing");if(this.fontAliasing===r)return;this.fontAliasing=r;const i=["antialiased","none","auto"];this.mainContainer.classList.remove(...i.map(o=>`monaco-font-aliasing-${o}`)),i.some(o=>o===r)&&this.mainContainer.classList.add(`monaco-font-aliasing-${r}`)}restoreFontInfo(t,e){const r=t.get("editorFontInfo",C.APPLICATION);if(r)try{const i=JSON.parse(r);Array.isArray(i)&&g.restoreFontInfo(s,i)}catch{}g.readFontInfo(s,$.createFromRawSettings(e.getValue("editor"),R.getInstance(s).value))}storeFontInfo(t){const e=g.serializeFontInfo(s);e&&t.store("editorFontInfo",JSON.stringify(e),C.APPLICATION,ie.MACHINE)}renderWorkbench(t,e,r,i){_(this.mainContainer),T((a,d)=>t.createInstance(Y,a,d));const o=q?"windows":O?"linux":"mac",n=D(["monaco-workbench",o,y?"web":void 0,w?"chromium":L?"firefox":W?"safari":void 0,...this.getLayoutClasses(),...this.options?.extraClasses?this.options.extraClasses:[]]);this.mainContainer.classList.add(...n),s.document.body.classList.add(o),y&&s.document.body.classList.add("web"),this.updateFontAliasing(void 0,i),this.restoreFontInfo(r,i);for(const{id:a,role:d,classes:m,options:h}of[{id:c.TITLEBAR_PART,role:"none",classes:["titlebar"]},{id:c.BANNER_PART,role:"banner",classes:["banner"]},{id:c.ACTIVITYBAR_PART,role:"none",classes:["activitybar",this.getSideBarPosition()===u.LEFT?"left":"right"]},{id:c.SIDEBAR_PART,role:"none",classes:["sidebar",this.getSideBarPosition()===u.LEFT?"left":"right"]},{id:c.EDITOR_PART,role:"main",classes:["editor"],options:{restorePreviousState:this.willRestoreEditors()}},{id:c.PANEL_PART,role:"none",classes:["panel","basepanel",ce(this.getPanelPosition())]},{id:c.AUXILIARYBAR_PART,role:"none",classes:["auxiliarybar","basepanel",this.getSideBarPosition()===u.LEFT?"right":"left"]},{id:c.STATUSBAR_PART,role:"status",classes:["statusbar"]}]){const p=this.createPart(a,d,m);f(`code/willCreatePart/${a}`),this.getPart(a).create(p,h),f(`code/didCreatePart/${a}`)}this.createNotificationsHandlers(t,e),this.parent.appendChild(this.mainContainer)}createPart(t,e,r){const i=document.createElement(e==="status"?"footer":"div");return i.classList.add("part",...r),i.id=t,i.setAttribute("role",e),e==="status"&&i.setAttribute("aria-live","off"),i}createNotificationsHandlers(t,e){const r=this._register(t.createInstance(he,this.mainContainer,e.model)),i=this._register(t.createInstance(ve,this.mainContainer,e.model));this._register(t.createInstance(me,e.model));const o=t.createInstance(ge,e.model);this._register(t.createInstance(ue)),this._register(r.onDidChangeVisibility(()=>{o.update(r.isVisible,i.isVisible),i.update(r.isVisible)})),this._register(i.onDidChangeVisibility(()=>{o.update(r.isVisible,i.isVisible)})),pe(r,i,e.model),J.register(new fe),this.registerNotifications({onDidChangeNotificationsVisibility:I.map(I.any(i.onDidChangeVisibility,r.onDidChangeVisibility),()=>i.isVisible||r.isVisible)})}restore(t){try{this.restoreParts()}catch(e){l(e)}this.whenReady.finally(()=>Promise.race([this.whenRestored,V(2e3)]).finally(()=>{function e(){f("code/didStartWorkbench"),performance.measure("perf: workbench create & restore","code/didLoadWorkbenchMain","code/didStartWorkbench")}this.isRestored()?e():this.whenRestored.finally(()=>e()),t.phase=v.Restored,this._register(new N(()=>{this._register(P(s,()=>t.phase=v.Eventually,2500))},2500)).schedule()}))}}export{lt as Workbench};
