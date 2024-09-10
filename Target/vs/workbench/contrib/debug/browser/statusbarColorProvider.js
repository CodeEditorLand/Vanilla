var l=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var c=(i,e,t,o)=>{for(var r=o>1?void 0:o?S(e,t):e,n=i.length-1,a;n>=0;n--)(a=i[n])&&(r=(o?a(e,t,r):a(r))||r);return o&&r&&l(e,t,r),r},s=(i,e)=>(t,o)=>e(t,o,i);import{localize as g}from"../../../../nls.js";import{asCssVariable as f,asCssVariableName as m,registerColor as u,transparent as C}from"../../../../platform/theme/common/colorRegistry.js";import"../../../common/contributions.js";import{IDebugService as D,State as p}from"../common/debug.js";import{IWorkspaceContextService as v}from"../../../../platform/workspace/common/workspace.js";import{STATUS_BAR_FOREGROUND as b,STATUS_BAR_BORDER as B,COMMAND_CENTER_BACKGROUND as I}from"../../../common/theme.js";import{DisposableStore as R}from"../../../../base/common/lifecycle.js";import{IStatusbarService as _}from"../../../services/statusbar/browser/statusbar.js";import{IConfigurationService as G}from"../../../../platform/configuration/common/configuration.js";import{ILayoutService as k}from"../../../../platform/layout/browser/layoutService.js";const h=u("statusBar.debuggingBackground",{dark:"#CC6633",light:"#CC6633",hcDark:"#BA592C",hcLight:"#B5200D"},g("statusBarDebuggingBackground","Status bar background color when a program is being debugged. The status bar is shown in the bottom of the window")),A=u("statusBar.debuggingForeground",{dark:b,light:b,hcDark:b,hcLight:"#FFFFFF"},g("statusBarDebuggingForeground","Status bar foreground color when a program is being debugged. The status bar is shown in the bottom of the window")),y=u("statusBar.debuggingBorder",B,g("statusBarDebuggingBorder","Status bar border color separating to the sidebar and editor when a program is being debugged. The status bar is shown in the bottom of the window")),T=u("commandCenter.debuggingBackground",C(h,.258),g("commandCenter-activeBackground","Command center background color when a program is being debugged"),!0);let d=class{constructor(e,t,o,r,n){this.debugService=e;this.contextService=t;this.statusbarService=o;this.layoutService=r;this.configurationService=n;this.debugService.onDidChangeState(this.update,this,this.disposables),this.contextService.onDidChangeWorkbenchState(this.update,this,this.disposables),this.configurationService.onDidChangeConfiguration(a=>{(a.affectsConfiguration("debug.enableStatusBarColor")||a.affectsConfiguration("debug.toolBarLocation"))&&this.update()},void 0,this.disposables),this.update()}disposables=new R;disposable;set enabled(e){e!==!!this.disposable&&(e?this.disposable=this.statusbarService.overrideStyle({priority:10,foreground:A,background:h,border:y}):(this.disposable.dispose(),this.disposable=void 0))}update(){const e=this.configurationService.getValue("debug"),t=w(this.debugService.state,this.debugService.getModel().getSessions());e.enableStatusBarColor?this.enabled=t:this.enabled=!1;const o=e.toolBarLocation==="commandCenter";this.layoutService.mainContainer.style.setProperty(m(I),o&&t?f(T):"")}dispose(){this.disposable?.dispose(),this.disposables.dispose()}};d=c([s(0,D),s(1,v),s(2,_),s(3,k),s(4,G)],d);function w(i,e){return!(i===p.Inactive||i===p.Initializing||e.every(t=>t.suppressDebugStatusbar||t.configuration?.noDebug))}export{T as COMMAND_CENTER_DEBUGGING_BACKGROUND,h as STATUS_BAR_DEBUGGING_BACKGROUND,y as STATUS_BAR_DEBUGGING_BORDER,A as STATUS_BAR_DEBUGGING_FOREGROUND,d as StatusBarColorProvider,w as isStatusbarInDebugMode};
