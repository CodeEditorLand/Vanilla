var l=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var c=(i,e,t,o)=>{for(var r=o>1?void 0:o?S(e,t):e,n=i.length-1,a;n>=0;n--)(a=i[n])&&(r=(o?a(e,t,r):a(r))||r);return o&&r&&l(e,t,r),r},s=(i,e)=>(t,o)=>e(t,o,i);import{DisposableStore as m}from"../../../../base/common/lifecycle.js";import{localize as u}from"../../../../nls.js";import{IConfigurationService as f}from"../../../../platform/configuration/common/configuration.js";import{ILayoutService as C}from"../../../../platform/layout/browser/layoutService.js";import{asCssVariable as D,asCssVariableName as v,registerColor as g,transparent as B}from"../../../../platform/theme/common/colorRegistry.js";import{IWorkspaceContextService as I}from"../../../../platform/workspace/common/workspace.js";import{COMMAND_CENTER_BACKGROUND as y,STATUS_BAR_BORDER as R,STATUS_BAR_FOREGROUND as b}from"../../../common/theme.js";import{IStatusbarService as _}from"../../../services/statusbar/browser/statusbar.js";import{IDebugService as G,State as p}from"../common/debug.js";const h=g("statusBar.debuggingBackground",{dark:"#CC6633",light:"#CC6633",hcDark:"#BA592C",hcLight:"#B5200D"},u("statusBarDebuggingBackground","Status bar background color when a program is being debugged. The status bar is shown in the bottom of the window")),k=g("statusBar.debuggingForeground",{dark:b,light:b,hcDark:b,hcLight:"#FFFFFF"},u("statusBarDebuggingForeground","Status bar foreground color when a program is being debugged. The status bar is shown in the bottom of the window")),A=g("statusBar.debuggingBorder",R,u("statusBarDebuggingBorder","Status bar border color separating to the sidebar and editor when a program is being debugged. The status bar is shown in the bottom of the window")),T=g("commandCenter.debuggingBackground",B(h,.258),u("commandCenter-activeBackground","Command center background color when a program is being debugged"),!0);let d=class{constructor(e,t,o,r,n){this.debugService=e;this.contextService=t;this.statusbarService=o;this.layoutService=r;this.configurationService=n;this.debugService.onDidChangeState(this.update,this,this.disposables),this.contextService.onDidChangeWorkbenchState(this.update,this,this.disposables),this.configurationService.onDidChangeConfiguration(a=>{(a.affectsConfiguration("debug.enableStatusBarColor")||a.affectsConfiguration("debug.toolBarLocation"))&&this.update()},void 0,this.disposables),this.update()}disposables=new m;disposable;set enabled(e){e!==!!this.disposable&&(e?this.disposable=this.statusbarService.overrideStyle({priority:10,foreground:k,background:h,border:A}):(this.disposable.dispose(),this.disposable=void 0))}update(){const e=this.configurationService.getValue("debug"),t=w(this.debugService.state,this.debugService.getModel().getSessions());e.enableStatusBarColor?this.enabled=t:this.enabled=!1;const o=e.toolBarLocation==="commandCenter";this.layoutService.mainContainer.style.setProperty(v(y),o&&t?D(T):"")}dispose(){this.disposable?.dispose(),this.disposables.dispose()}};d=c([s(0,G),s(1,I),s(2,_),s(3,C),s(4,f)],d);function w(i,e){return!(i===p.Inactive||i===p.Initializing||e.every(t=>t.suppressDebugStatusbar||t.configuration?.noDebug))}export{T as COMMAND_CENTER_DEBUGGING_BACKGROUND,h as STATUS_BAR_DEBUGGING_BACKGROUND,A as STATUS_BAR_DEBUGGING_BORDER,k as STATUS_BAR_DEBUGGING_FOREGROUND,d as StatusBarColorProvider,w as isStatusbarInDebugMode};
