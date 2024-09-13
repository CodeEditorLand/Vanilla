var l=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var S=(s,i,e,t)=>{for(var r=t>1?void 0:t?b(i,e):i,a=s.length-1,m;a>=0;a--)(m=s[a])&&(r=(t?m(i,e,r):m(r))||r);return t&&r&&l(i,e,r),r},n=(s,i)=>(e,t)=>i(e,t,s);import{Extensions as I}from"../../../common/contributions.js";import{Registry as k}from"../../../../platform/registry/common/platform.js";import{LifecyclePhase as d}from"../../../services/lifecycle/common/lifecycle.js";import{UserDataSyncWorkbenchContribution as w}from"./userDataSync.js";import{IUserDataAutoSyncService as C,UserDataSyncErrorCode as h}from"../../../../platform/userDataSync/common/userDataSync.js";import{INotificationService as E,Severity as p}from"../../../../platform/notification/common/notification.js";import{Disposable as W}from"../../../../base/common/lifecycle.js";import{localize as o}from"../../../../nls.js";import{isWeb as v}from"../../../../base/common/platform.js";import{UserDataSyncTrigger as L}from"./userDataSyncTrigger.js";import{Action as u}from"../../../../base/common/actions.js";import{IProductService as q}from"../../../../platform/product/common/productService.js";import{ICommandService as D}from"../../../../platform/commands/common/commands.js";import{IHostService as R}from"../../../services/host/browser/host.js";import{SHOW_SYNC_LOG_COMMAND_ID as f}from"../../../services/userDataSync/common/userDataSync.js";let c=class extends W{constructor(e,t,r,a,m){super();this.notificationService=t;this.productService=r;this.commandService=a;this.hostService=m;this._register(e.onError(g=>this.onAutoSyncError(g)))}onAutoSyncError(e){switch(e.code){case h.LocalTooManyRequests:{const t=v?o({key:"local too many requests - reload",comment:["Settings Sync is the name of the feature"]},"Settings sync is suspended temporarily because the current device is making too many requests. Please reload {0} to resume.",this.productService.nameLong):o({key:"local too many requests - restart",comment:["Settings Sync is the name of the feature"]},"Settings sync is suspended temporarily because the current device is making too many requests. Please restart {0} to resume.",this.productService.nameLong);this.notificationService.notify({severity:p.Error,message:t,actions:{primary:[new u("Show Sync Logs",o("show sync logs","Show Log"),void 0,!0,()=>this.commandService.executeCommand(f)),new u("Restart",v?o("reload","Reload"):o("restart","Restart"),void 0,!0,()=>this.hostService.restart())]}});return}case h.TooManyRequests:{const t=e.operationId?o("operationId","Operation Id: {0}",e.operationId):void 0,r=o({key:"server too many requests",comment:["Settings Sync is the name of the feature"]},"Settings sync is disabled because the current device is making too many requests. Please wait for 10 minutes and turn on sync.");this.notificationService.notify({severity:p.Error,message:t?`${r} ${t}`:r,source:e.operationId?o("settings sync","Settings Sync. Operation Id: {0}",e.operationId):void 0,actions:{primary:[new u("Show Sync Logs",o("show sync logs","Show Log"),void 0,!0,()=>this.commandService.executeCommand(f))]}});return}}}};c=S([n(0,C),n(1,E),n(2,q),n(3,D),n(4,R)],c);const y=k.as(I.Workbench);y.registerWorkbenchContribution(w,d.Restored),y.registerWorkbenchContribution(L,d.Eventually),y.registerWorkbenchContribution(c,d.Eventually);
