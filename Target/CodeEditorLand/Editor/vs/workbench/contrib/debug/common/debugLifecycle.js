var c=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var d=(t,o,e,r)=>{for(var i=r>1?void 0:r?m(o,e):o,n=t.length-1,u;n>=0;n--)(u=t[n])&&(i=(r?u(o,e,i):u(i))||i);return r&&i&&c(o,e,i),i},s=(t,o)=>(e,r)=>o(e,r,t);import"../../../../../vs/base/common/lifecycle.js";import*as l from"../../../../../vs/nls.js";import{IConfigurationService as g}from"../../../../../vs/platform/configuration/common/configuration.js";import{IDialogService as p}from"../../../../../vs/platform/dialogs/common/dialogs.js";import"../../../../../vs/workbench/common/contributions.js";import{IDebugService as f}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import{ILifecycleService as b}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";let a=class{constructor(o,e,r,i){this.debugService=e;this.configurationService=r;this.dialogService=i;this.disposable=o.onBeforeShutdown(async n=>n.veto(this.shouldVetoShutdown(n.reason),"veto.debug"))}disposable;shouldVetoShutdown(o){const e=this.debugService.getModel().getSessions().filter(i=>i.parentSession===void 0);return e.length===0||this.configurationService.getValue("debug").confirmOnExit==="never"?!1:this.showWindowCloseConfirmation(e.length)}dispose(){return this.disposable.dispose()}async showWindowCloseConfirmation(o){let e;return o===1?e=l.localize("debug.debugSessionCloseConfirmationSingular","There is an active debug session, are you sure you want to stop it?"):e=l.localize("debug.debugSessionCloseConfirmationPlural","There are active debug sessions, are you sure you want to stop them?"),!(await this.dialogService.confirm({message:e,type:"warning",primaryButton:l.localize({key:"debug.stop",comment:["&& denotes a mnemonic"]},"&&Stop Debugging")})).confirmed}};a=d([s(0,b),s(1,f),s(2,g),s(3,p)],a);export{a as DebugLifecycle};
