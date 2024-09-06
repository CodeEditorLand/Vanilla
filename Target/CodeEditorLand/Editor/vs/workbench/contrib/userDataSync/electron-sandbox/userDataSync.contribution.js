var v=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var m=(c,e,o,r)=>{for(var t=r>1?void 0:r?h(e,o):e,i=c.length-1,n;i>=0;i--)(n=c[i])&&(t=(r?n(e,o,t):n(t))||t);return r&&t&&v(e,o,t),t},a=(c,e)=>(o,r)=>e(o,r,c);import{Disposable as I}from"../../../../../vs/base/common/lifecycle.js";import{Schemas as y}from"../../../../../vs/base/common/network.js";import{ProxyChannel as k}from"../../../../../vs/base/parts/ipc/common/ipc.js";import{localize as l,localize2 as b}from"../../../../../vs/nls.js";import{Action2 as S,MenuId as w,registerAction2 as d}from"../../../../../vs/platform/actions/common/actions.js";import{IEnvironmentService as g}from"../../../../../vs/platform/environment/common/environment.js";import{IFileService as A}from"../../../../../vs/platform/files/common/files.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{ISharedProcessService as D}from"../../../../../vs/platform/ipc/electron-sandbox/services.js";import{INativeHostService as p}from"../../../../../vs/platform/native/common/native.js";import{INotificationService as f,Severity as T}from"../../../../../vs/platform/notification/common/notification.js";import{IUserDataSyncUtilService as P,SyncStatus as C}from"../../../../../vs/platform/userDataSync/common/userDataSync.js";import{registerWorkbenchContribution2 as O,WorkbenchPhase as F}from"../../../../../vs/workbench/common/contributions.js";import{CONTEXT_SYNC_STATE as N,DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR as W,IUserDataSyncWorkbenchService as _,SYNC_TITLE as x}from"../../../../../vs/workbench/services/userDataSync/common/userDataSync.js";let s=class extends I{static ID="workbench.contrib.userDataSyncServices";constructor(e,o){super(),o.registerChannel("userDataSyncUtil",k.fromService(e,this._store))}};s=m([a(0,P),a(1,D)],s),O(s.ID,s,F.BlockStartup),d(class extends S{constructor(){super({id:"workbench.userData.actions.openSyncBackupsFolder",title:b("Open Backup folder","Open Local Backups Folder"),category:x,menu:{id:w.CommandPalette,when:N.notEqualsTo(C.Uninitialized)}})}async run(e){const o=e.get(g).userDataSyncHome,r=e.get(p),t=e.get(A),i=e.get(f);if(await t.exists(o)){const n=await t.resolve(o),u=n.children&&n.children[0]?n.children[0].resource:o;return r.showItemInFolder(u.with({scheme:y.file}).fsPath)}else i.info(l("no backups","Local backups folder does not exist"))}}),d(class extends S{constructor(){super(W)}async run(e){const o=e.get(_),r=e.get(f),t=e.get(p),i=await o.downloadSyncActivity();i&&r.prompt(T.Info,l("download sync activity complete","Successfully downloaded Settings Sync activity."),[{label:l("open","Open Folder"),run:()=>t.showItemInFolder(i.fsPath)}])}});