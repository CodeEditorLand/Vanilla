var l=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var p=(t,o,e,i)=>{for(var r=i>1?void 0:i?f(o,e):o,s=t.length-1,m;s>=0;s--)(m=t[s])&&(r=(i?m(o,e,r):m(r))||r);return i&&r&&l(o,e,r),r},c=(t,o)=>(e,i)=>o(e,i,t);import{URI as h}from"../../../../base/common/uri.js";import{localize as k}from"../../../../nls.js";import{IFileService as g}from"../../../../platform/files/common/files.js";import{InstantiationType as u,registerSingleton as I}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as v}from"../../../../platform/log/common/log.js";import{registerWorkbenchContribution2 as S,WorkbenchPhase as b}from"../../../common/contributions.js";import{INativeWorkbenchEnvironmentService as y}from"../../environment/electron-sandbox/environmentService.js";import{ILifecycleService as d}from"../../lifecycle/common/lifecycle.js";import{IWorkingCopyBackupService as L}from"../common/workingCopyBackup.js";import{WorkingCopyBackupService as w}from"../common/workingCopyBackupService.js";import{NativeWorkingCopyBackupTracker as a}from"./workingCopyBackupTracker.js";let n=class extends w{constructor(e,i,r,s){super(e.backupPath?h.file(e.backupPath).with({scheme:e.userRoamingDataHome.scheme}):void 0,i,r);this.lifecycleService=s;this.registerListeners()}registerListeners(){this._register(this.lifecycleService.onWillShutdown(e=>e.join(this.joinBackups(),{id:"join.workingCopyBackups",label:k("join.workingCopyBackups","Backup working copies")})))}};n=p([c(0,y),c(1,g),c(2,v),c(3,d)],n),I(L,n,u.Eager),S(a.ID,a,b.BlockStartup);export{n as NativeWorkingCopyBackupService};
