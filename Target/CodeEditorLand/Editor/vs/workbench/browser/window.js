var Q=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var g=(d,p,e,t)=>{for(var o=t>1?void 0:t?V(p,e):p,i=d.length-1,r;i>=0;i--)(r=d[i])&&(o=(t?r(p,e,o):r(o))||o);return t&&o&&Q(p,e,o),o},a=(d,p)=>(e,t)=>p(e,t,d);import{isSafari as Y,setFullscreen as z}from"../../base/browser/browser.js";import{requestHidDevice as G,requestSerialPort as K,requestUsbDevice as X}from"../../base/browser/deviceAccess.js";import{EventHelper as k,EventType as m,addDisposableListener as f,getActiveWindow as Z,getWindow as $,getWindowById as J,getWindows as L,getWindowsCount as x,windowOpenNoOpener as P,windowOpenPopup as A,windowOpenWithSuccess as ee}from"../../base/browser/dom.js";import{DomEmitter as C}from"../../base/browser/event.js";import{isAuxiliaryWindow as te,mainWindow as u}from"../../base/browser/window.js";import{timeout as oe}from"../../base/common/async.js";import{Event as y}from"../../base/common/event.js";import{createSingleCallFunction as ie}from"../../base/common/functional.js";import{Disposable as re,dispose as M,toDisposable as ne}from"../../base/common/lifecycle.js";import{Schemas as E,matchesScheme as I}from"../../base/common/network.js";import{isIOS as U,isMacintosh as F}from"../../base/common/platform.js";import D from"../../base/common/severity.js";import{URI as W}from"../../base/common/uri.js";import{localize as n}from"../../nls.js";import{CommandsRegistry as T}from"../../platform/commands/common/commands.js";import{IConfigurationService as se}from"../../platform/configuration/common/configuration.js";import{IDialogService as H}from"../../platform/dialogs/common/dialogs.js";import{IInstantiationService as ae}from"../../platform/instantiation/common/instantiation.js";import{ILabelService as ce}from"../../platform/label/common/label.js";import{IOpenerService as le}from"../../platform/opener/common/opener.js";import{IProductService as ue}from"../../platform/product/common/productService.js";import{registerWindowDriver as pe}from"../services/driver/browser/driver.js";import{IBrowserWorkbenchEnvironmentService as me}from"../services/environment/browser/environmentService.js";import{IWorkbenchEnvironmentService as de}from"../services/environment/common/environmentService.js";import{IHostService as _}from"../services/host/browser/host.js";import{IWorkbenchLayoutService as ve}from"../services/layout/browser/layoutService.js";import{ILifecycleService as Se,ShutdownReason as N}from"../services/lifecycle/common/lifecycle.js";let c=class extends re{constructor(e,t={getWindowsCount:x,getWindows:L},o,i){super();this.hostService=o;this.environmentService=i;this.enableWindowFocusOnElementFocus(e),this.enableMultiWindowAwareTimeout(e,t),this.registerFullScreenListeners(e.vscodeWindowId)}static TIMEOUT_HANDLES=Number.MIN_SAFE_INTEGER;static TIMEOUT_DISPOSABLES=new Map;enableWindowFocusOnElementFocus(e){const t=e.HTMLElement.prototype.focus,o=this;e.HTMLElement.prototype.focus=function(i){o.onElementFocus($(this)),t.apply(this,[i])}}onElementFocus(e){const t=Z();t!==e&&t.document.hasFocus()&&(e.focus(),!this.environmentService.extensionTestsLocationURI&&!e.document.hasFocus()&&this.hostService.focus(e))}enableMultiWindowAwareTimeout(e,t={getWindowsCount:x,getWindows:L}){const o=e.setTimeout;Object.defineProperty(e,"vscodeOriginalSetTimeout",{get:()=>o});const i=e.clearTimeout;Object.defineProperty(e,"vscodeOriginalClearTimeout",{get:()=>i}),e.setTimeout=function(r,s=0,...l){if(t.getWindowsCount()===1||typeof r=="string"||s===0)return o.apply(this,[r,s,...l]);const v=new Set,S=c.TIMEOUT_HANDLES++;c.TIMEOUT_DISPOSABLES.set(S,v);const q=ie(r,()=>{M(v),c.TIMEOUT_DISPOSABLES.delete(S)});for(const{window:h,disposables:B}of t.getWindows()){if(te(h)&&h.document.visibilityState==="hidden")continue;let O=!1;const R=h.vscodeOriginalSetTimeout.apply(this,[(...j)=>{O||q(...j)},s,...l]),b=ne(()=>{O=!0,h.vscodeOriginalClearTimeout(R),v.delete(b)});B.add(b),v.add(b)}return S},e.clearTimeout=function(r){const s=typeof r=="number"?c.TIMEOUT_DISPOSABLES.get(r):void 0;s?(M(s),c.TIMEOUT_DISPOSABLES.delete(r)):i.apply(this,[r])}}registerFullScreenListeners(e){this._register(this.hostService.onDidChangeFullScreen(({windowId:t,fullscreen:o})=>{if(t===e){const i=J(e);i&&z(o,i.window)}}))}static async confirmOnShutdown(e,t){const o=e.get(H),i=e.get(se),r=t===N.QUIT?F?n("quitMessageMac","Are you sure you want to quit?"):n("quitMessage","Are you sure you want to exit?"):n("closeWindowMessage","Are you sure you want to close the window?"),s=t===N.QUIT?F?n({key:"quitButtonLabel",comment:["&& denotes a mnemonic"]},"&&Quit"):n({key:"exitButtonLabel",comment:["&& denotes a mnemonic"]},"&&Exit"):n({key:"closeWindowButtonLabel",comment:["&& denotes a mnemonic"]},"&&Close Window"),l=await o.confirm({message:r,primaryButton:s,checkbox:{label:n("doNotAskAgain","Do not ask me again")}});return l.confirmed&&l.checkboxChecked&&await i.updateValue("window.confirmBeforeClose","never"),l.confirmed}};c=g([a(2,_),a(3,de)],c);let w=class extends c{constructor(e,t,o,i,r,s,l,v,S){super(u,void 0,S,s);this.openerService=e;this.lifecycleService=t;this.dialogService=o;this.labelService=i;this.productService=r;this.browserEnvironmentService=s;this.layoutService=l;this.instantiationService=v;this.registerListeners(),this.create()}registerListeners(){this._register(this.lifecycleService.onWillShutdown(()=>this.onWillShutdown()));const e=U&&u.visualViewport?u.visualViewport:u;this._register(f(e,m.RESIZE,()=>{this.layoutService.layout(),U&&u.scrollTo(0,0)})),this._register(f(this.layoutService.mainContainer,m.WHEEL,t=>t.preventDefault(),{passive:!1})),this._register(f(this.layoutService.mainContainer,m.CONTEXT_MENU,t=>k.stop(t,!0))),this._register(f(this.layoutService.mainContainer,m.DROP,t=>k.stop(t,!0)))}onWillShutdown(){y.toPromise(y.any(y.once(new C(u.document.body,m.KEY_DOWN,!0).event),y.once(new C(u.document.body,m.MOUSE_DOWN,!0).event))).then(async()=>{await oe(3e3),await this.dialogService.prompt({type:D.Error,message:n("shutdownError","An unexpected error occurred that requires a reload of this page."),detail:n("shutdownErrorDetail","The workbench was unexpectedly disposed while running."),buttons:[{label:n({key:"reload",comment:["&& denotes a mnemonic"]},"&&Reload"),run:()=>u.location.reload()}]})})}create(){this.setupOpenHandlers(),this.registerLabelFormatters(),this.registerCommands(),this.setupDriver()}setupDriver(){this.environmentService.enableSmokeTestDriver&&pe(this.instantiationService)}setupOpenHandlers(){this.openerService.setDefaultExternalOpener({openExternal:async e=>{let t=!1;if(this.browserEnvironmentService.options?.openerAllowedExternalUrlPrefixes){for(const o of this.browserEnvironmentService.options.openerAllowedExternalUrlPrefixes)if(e.startsWith(o)){t=!0;break}}if(I(e,E.http)||I(e,E.https))Y?ee(e,!t)||await this.dialogService.prompt({type:D.Warning,message:n("unableToOpenExternal","The browser interrupted the opening of a new tab or window. Press 'Open' to open it anyway."),detail:e,buttons:[{label:n({key:"open",comment:["&& denotes a mnemonic"]},"&&Open"),run:()=>t?A(e):P(e)},{label:n({key:"learnMore",comment:["&& denotes a mnemonic"]},"&&Learn More"),run:()=>this.openerService.open(W.parse("https://aka.ms/allow-vscode-popup"))}],cancelButton:!0}):t?A(e):P(e);else{const o=()=>{this.lifecycleService.withExpectedShutdown({disableShutdownHandling:!0},()=>u.location.href=e)};o();const i=async()=>{const{downloadUrl:r}=this.productService;let s;const l=[{label:n({key:"openExternalDialogButtonRetry.v2",comment:["&& denotes a mnemonic"]},"&&Try Again"),run:()=>o()}];r!==void 0?(s=n("openExternalDialogDetail.v2",`We launched {0} on your computer.

If {1} did not launch, try again or install it below.`,this.productService.nameLong,this.productService.nameLong),l.push({label:n({key:"openExternalDialogButtonInstall.v3",comment:["&& denotes a mnemonic"]},"&&Install"),run:async()=>{await this.openerService.open(W.parse(r)),i()}})):s=n("openExternalDialogDetailNoInstall",`We launched {0} on your computer.

If {1} did not launch, try again below.`,this.productService.nameLong,this.productService.nameLong),await this.hostService.withExpectedShutdown(()=>this.dialogService.prompt({type:D.Info,message:n("openExternalDialogTitle","All done. You can close this tab now."),detail:s,buttons:l,cancelButton:!0}))};I(e,this.productService.urlProtocol)&&await i()}return!0}})}registerLabelFormatters(){this._register(this.labelService.registerFormatter({scheme:E.vscodeUserData,priority:!0,formatting:{label:"(Settings) ${path}",separator:"/"}}))}registerCommands(){T.registerCommand("workbench.experimental.requestUsbDevice",async(e,t)=>X(t)),T.registerCommand("workbench.experimental.requestSerialPort",async(e,t)=>K(t)),T.registerCommand("workbench.experimental.requestHidDevice",async(e,t)=>G(t))}};w=g([a(0,le),a(1,Se),a(2,H),a(3,ce),a(4,ue),a(5,me),a(6,ve),a(7,ae),a(8,_)],w);export{c as BaseWindow,w as BrowserWindow};
