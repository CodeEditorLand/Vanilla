var g=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var h=(i,e,s,t)=>{for(var r=t>1?void 0:t?d(e,s):e,n=i.length-1,a;n>=0;n--)(a=i[n])&&(r=(t?a(e,s,r):a(r))||r);return t&&r&&g(e,s,r),r},o=(i,e)=>(s,t)=>e(s,t,i);import{dispose as S}from"../../../../../vs/base/common/lifecycle.js";import*as u from"../../../../../vs/nls.js";import{IConfigurationService as l}from"../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../vs/workbench/common/contributions.js";import{IDebugService as p,State as b}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import{IStatusbarService as f,StatusbarAlignment as m}from"../../../../../vs/workbench/services/statusbar/browser/statusbar.js";let c=class{constructor(e,s,t){this.statusBarService=e;this.debugService=s;const r=()=>{this.entryAccessor=this.statusBarService.addEntry(this.entry,"status.debug",m.LEFT,30)},n=()=>{this.showInStatusBar=t.getValue("debug").showInStatusBar,this.showInStatusBar==="always"&&!this.entryAccessor&&r()};n(),this.toDispose.push(this.debugService.onDidChangeState(a=>{a!==b.Inactive&&this.showInStatusBar==="onFirstSessionStart"&&!this.entryAccessor&&r()})),this.toDispose.push(t.onDidChangeConfiguration(a=>{a.affectsConfiguration("debug.showInStatusBar")&&(n(),this.entryAccessor&&this.showInStatusBar==="never"&&(this.entryAccessor.dispose(),this.entryAccessor=void 0))})),this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration(a=>{this.entryAccessor?.update(this.entry)}))}showInStatusBar;toDispose=[];entryAccessor;get entry(){let e="";const s=this.debugService.getConfigurationManager(),t=s.selectedConfiguration.name||"";return t&&s.selectedConfiguration.launch&&(e=s.getLaunches().length>1?`${t} (${s.selectedConfiguration.launch.name})`:t),{name:u.localize("status.debug","Debug"),text:"$(debug-alt-small) "+e,ariaLabel:u.localize("debugTarget","Debug: {0}",e),tooltip:u.localize("selectAndStartDebug","Select and start debug configuration"),command:"workbench.action.debug.selectandstart"}}dispose(){this.entryAccessor?.dispose(),S(this.toDispose)}};c=h([o(0,f),o(1,p),o(2,l)],c);export{c as DebugStatusContribution};