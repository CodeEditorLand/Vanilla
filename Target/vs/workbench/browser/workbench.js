import"./style.js";import{localize as w}from"../../nls.js";import{runWhenWindowIdle as L}from"../../base/browser/dom.js";import{Event as S,Emitter as I,setGlobalLeakWarningThreshold as W}from"../../base/common/event.js";import{RunOnceScheduler as P,timeout as R}from"../../base/common/async.js";import{isFirefox as _,isSafari as F,isChrome as k}from"../../base/browser/browser.js";import{mark as l}from"../../base/common/performance.js";import{onUnexpectedError as f,setUnexpectedErrorHandler as T}from"../../base/common/errors.js";import{Registry as y}from"../../platform/registry/common/platform.js";import{isWindows as x,isLinux as D,isWeb as b,isNative as N,isMacintosh as V}from"../../base/common/platform.js";import{Extensions as H}from"../common/contributions.js";import{EditorExtensions as B}from"../common/editor.js";import{getSingletonServiceDescriptors as U}from"../../platform/instantiation/common/extensions.js";import{Position as p,Parts as c,IWorkbenchLayoutService as O,positionToString as M}from"../services/layout/browser/layoutService.js";import{IStorageService as q,WillSaveStateReason as $,StorageScope as E,StorageTarget as z}from"../../platform/storage/common/storage.js";import{IConfigurationService as A}from"../../platform/configuration/common/configuration.js";import"../../platform/instantiation/common/instantiation.js";import"../../platform/instantiation/common/serviceCollection.js";import{LifecyclePhase as u,ILifecycleService as C}from"../services/lifecycle/common/lifecycle.js";import{INotificationService as J}from"../../platform/notification/common/notification.js";import"../services/notification/common/notificationService.js";import{NotificationsCenter as Y}from"./parts/notifications/notificationsCenter.js";import{NotificationsAlerts as j}from"./parts/notifications/notificationsAlerts.js";import{NotificationsStatus as G}from"./parts/notifications/notificationsStatus.js";import{NotificationsTelemetry as K}from"./parts/notifications/notificationsTelemetry.js";import{registerNotificationCommands as X}from"./parts/notifications/notificationsCommands.js";import{NotificationsToasts as Q}from"./parts/notifications/notificationsToasts.js";import{setARIAContainer as Z}from"../../base/browser/ui/aria/aria.js";import{FontMeasurements as v}from"../../editor/browser/config/fontMeasurements.js";import{BareFontInfo as ee}from"../../editor/common/config/fontInfo.js";import"../../platform/log/common/log.js";import{toErrorMessage as te}from"../../base/common/errorMessage.js";import{WorkbenchContextKeysHandler as ie}from"./contextkeys.js";import{coalesce as re}from"../../base/common/arrays.js";import{InstantiationService as oe}from"../../platform/instantiation/common/instantiationService.js";import{Layout as ne}from"./layout.js";import{IHostService as se}from"../services/host/browser/host.js";import{IDialogService as ae}from"../../platform/dialogs/common/dialogs.js";import{mainWindow as s}from"../../base/browser/window.js";import{PixelRatio as ce}from"../../base/browser/pixelRatio.js";import{IHoverService as de,WorkbenchHoverDelegate as le}from"../../platform/hover/browser/hover.js";import{setHoverDelegateFactory as fe}from"../../base/browser/ui/hover/hoverDelegateFactory.js";import{setBaseLayerHoverDelegate as he}from"../../base/browser/ui/hover/hoverDelegate2.js";import{AccessibilityProgressSignalScheduler as me}from"../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.js";import{setProgressAcccessibilitySignalScheduler as ge}from"../../base/browser/ui/progressbar/progressAccessibilitySignal.js";import{AccessibleViewRegistry as pe}from"../../platform/accessibility/browser/accessibleViewRegistry.js";import{NotificationAccessibleView as ue}from"./parts/notifications/notificationAccessibleView.js";import{isESM as ve}from"../../base/common/amd.js";class Et extends ne{constructor(t,e,r,i){super(t);this.options=e;this.serviceCollection=r;l("code/willStartWorkbench"),this.registerErrorHandler(i)}_onWillShutdown=this._register(new I);onWillShutdown=this._onWillShutdown.event;_onDidShutdown=this._register(new I);onDidShutdown=this._onDidShutdown.event;registerErrorHandler(t){s.addEventListener("unhandledrejection",e=>{f(e.reason),e.preventDefault()}),T(e=>this.handleUnexpectedError(e,t)),!ve&&typeof s.require?.config=="function"&&s.require.config({onError:e=>{e.phase==="loading"&&f(new Error(w("loaderErrorNative","Failed to load a required file. Please restart the application to try again. Details: {0}",JSON.stringify(e)))),console.error(e)}})}previousUnexpectedError={message:void 0,time:0};handleUnexpectedError(t,e){const r=te(t,!0);if(!r)return;const i=Date.now();r===this.previousUnexpectedError.message&&i-this.previousUnexpectedError.time<=1e3||(this.previousUnexpectedError.time=i,this.previousUnexpectedError.message=r,e.error(r))}startup(){try{this._register(W(175));const t=this.initServices(this.serviceCollection);return t.invokeFunction(e=>{const r=e.get(C),i=e.get(q),o=e.get(A),n=e.get(se),a=e.get(de),d=e.get(ae),h=e.get(J);fe((m,g)=>t.createInstance(le,m,g,{})),he(a),this.initLayout(e),y.as(H.Workbench).start(e),y.as(B.EditorFactory).start(e),this._register(t.createInstance(ie)),this.registerListeners(r,i,o,n,d),this.renderWorkbench(t,h,i,o),this.createWorkbenchLayout(),this.layout(),this.restore(r)}),t}catch(t){throw f(t),t}}initServices(t){t.set(O,this);const e=U();for(const[i,o]of e)t.set(i,o);const r=new oe(t,!0);return r.invokeFunction(i=>{const o=i.get(C),n=i.get(A);typeof n.acquireInstantiationService=="function"&&n.acquireInstantiationService(r),o.phase=u.Ready}),r}registerListeners(t,e,r,i,o){this._register(r.onDidChangeConfiguration(n=>this.updateFontAliasing(n,r))),N?this._register(e.onWillSaveState(n=>{n.reason===$.SHUTDOWN&&this.storeFontInfo(e)})):this._register(t.onWillShutdown(()=>this.storeFontInfo(e))),this._register(t.onWillShutdown(n=>this._onWillShutdown.fire(n))),this._register(t.onDidShutdown(()=>{this._onDidShutdown.fire(),this.dispose()})),this._register(i.onDidChangeFocus(n=>{n||e.flush()})),this._register(o.onWillShowDialog(()=>this.mainContainer.classList.add("modal-dialog-visible"))),this._register(o.onDidShowDialog(()=>this.mainContainer.classList.remove("modal-dialog-visible")))}fontAliasing;updateFontAliasing(t,e){if(!V||t&&!t.affectsConfiguration("workbench.fontAliasing"))return;const r=e.getValue("workbench.fontAliasing");if(this.fontAliasing===r)return;this.fontAliasing=r;const i=["antialiased","none","auto"];this.mainContainer.classList.remove(...i.map(o=>`monaco-font-aliasing-${o}`)),i.some(o=>o===r)&&this.mainContainer.classList.add(`monaco-font-aliasing-${r}`)}restoreFontInfo(t,e){const r=t.get("editorFontInfo",E.APPLICATION);if(r)try{const i=JSON.parse(r);Array.isArray(i)&&v.restoreFontInfo(s,i)}catch{}v.readFontInfo(s,ee.createFromRawSettings(e.getValue("editor"),ce.getInstance(s).value))}storeFontInfo(t){const e=v.serializeFontInfo(s);e&&t.store("editorFontInfo",JSON.stringify(e),E.APPLICATION,z.MACHINE)}renderWorkbench(t,e,r,i){Z(this.mainContainer),ge((a,d)=>t.createInstance(me,a,d));const o=x?"windows":D?"linux":"mac",n=re(["monaco-workbench",o,b?"web":void 0,k?"chromium":_?"firefox":F?"safari":void 0,...this.getLayoutClasses(),...this.options?.extraClasses?this.options.extraClasses:[]]);this.mainContainer.classList.add(...n),s.document.body.classList.add(o),b&&s.document.body.classList.add("web"),this.updateFontAliasing(void 0,i),this.restoreFontInfo(r,i);for(const{id:a,role:d,classes:h,options:m}of[{id:c.TITLEBAR_PART,role:"none",classes:["titlebar"]},{id:c.BANNER_PART,role:"banner",classes:["banner"]},{id:c.ACTIVITYBAR_PART,role:"none",classes:["activitybar",this.getSideBarPosition()===p.LEFT?"left":"right"]},{id:c.SIDEBAR_PART,role:"none",classes:["sidebar",this.getSideBarPosition()===p.LEFT?"left":"right"]},{id:c.EDITOR_PART,role:"main",classes:["editor"],options:{restorePreviousState:this.willRestoreEditors()}},{id:c.PANEL_PART,role:"none",classes:["panel","basepanel",M(this.getPanelPosition())]},{id:c.AUXILIARYBAR_PART,role:"none",classes:["auxiliarybar","basepanel",this.getSideBarPosition()===p.LEFT?"right":"left"]},{id:c.STATUSBAR_PART,role:"status",classes:["statusbar"]}]){const g=this.createPart(a,d,h);l(`code/willCreatePart/${a}`),this.getPart(a).create(g,m),l(`code/didCreatePart/${a}`)}this.createNotificationsHandlers(t,e),this.parent.appendChild(this.mainContainer)}createPart(t,e,r){const i=document.createElement(e==="status"?"footer":"div");return i.classList.add("part",...r),i.id=t,i.setAttribute("role",e),e==="status"&&i.setAttribute("aria-live","off"),i}createNotificationsHandlers(t,e){const r=this._register(t.createInstance(Y,this.mainContainer,e.model)),i=this._register(t.createInstance(Q,this.mainContainer,e.model));this._register(t.createInstance(j,e.model));const o=t.createInstance(G,e.model);this._register(t.createInstance(K)),this._register(r.onDidChangeVisibility(()=>{o.update(r.isVisible,i.isVisible),i.update(r.isVisible)})),this._register(i.onDidChangeVisibility(()=>{o.update(r.isVisible,i.isVisible)})),X(r,i,e.model),pe.register(new ue),this.registerNotifications({onDidChangeNotificationsVisibility:S.map(S.any(i.onDidChangeVisibility,r.onDidChangeVisibility),()=>i.isVisible||r.isVisible)})}restore(t){try{this.restoreParts()}catch(e){f(e)}this.whenReady.finally(()=>Promise.race([this.whenRestored,R(2e3)]).finally(()=>{function e(){l("code/didStartWorkbench"),performance.measure("perf: workbench create & restore","code/didLoadWorkbenchMain","code/didStartWorkbench")}this.isRestored()?e():this.whenRestored.finally(()=>e()),t.phase=u.Restored,this._register(new P(()=>{this._register(L(s,()=>t.phase=u.Eventually,2500))},2500)).schedule()}))}}export{Et as Workbench};
