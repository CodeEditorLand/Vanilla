var v=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var m=(n,e,o,r)=>{for(var t=r>1?void 0:r?h(e,o):e,i=n.length-1,c;i>=0;i--)(c=n[i])&&(t=(r?c(e,o,t):c(t))||t);return r&&t&&v(e,o,t),t},a=(n,e)=>(o,r)=>e(o,r,n);import{Disposable as y}from"../../../../base/common/lifecycle.js";import{Schemas as I}from"../../../../base/common/network.js";import{ProxyChannel as k}from"../../../../base/parts/ipc/common/ipc.js";import{localize as l,localize2 as b}from"../../../../nls.js";import{Action2 as S,MenuId as w,registerAction2 as p}from"../../../../platform/actions/common/actions.js";import{IEnvironmentService as g}from"../../../../platform/environment/common/environment.js";import{IFileService as A}from"../../../../platform/files/common/files.js";import{ISharedProcessService as D}from"../../../../platform/ipc/electron-sandbox/services.js";import{INativeHostService as d}from"../../../../platform/native/common/native.js";import{INotificationService as f,Severity as T}from"../../../../platform/notification/common/notification.js";import{IUserDataSyncUtilService as P,SyncStatus as C}from"../../../../platform/userDataSync/common/userDataSync.js";import{WorkbenchPhase as O,registerWorkbenchContribution2 as F}from"../../../common/contributions.js";import{CONTEXT_SYNC_STATE as N,DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR as W,IUserDataSyncWorkbenchService as _,SYNC_TITLE as x}from"../../../services/userDataSync/common/userDataSync.js";let s=class extends y{static ID="workbench.contrib.userDataSyncServices";constructor(e,o){super(),o.registerChannel("userDataSyncUtil",k.fromService(e,this._store))}};s=m([a(0,P),a(1,D)],s),F(s.ID,s,O.BlockStartup),p(class extends S{constructor(){super({id:"workbench.userData.actions.openSyncBackupsFolder",title:b("Open Backup folder","Open Local Backups Folder"),category:x,menu:{id:w.CommandPalette,when:N.notEqualsTo(C.Uninitialized)}})}async run(e){const o=e.get(g).userDataSyncHome,r=e.get(d),t=e.get(A),i=e.get(f);if(await t.exists(o)){const c=await t.resolve(o),u=c.children&&c.children[0]?c.children[0].resource:o;return r.showItemInFolder(u.with({scheme:I.file}).fsPath)}else i.info(l("no backups","Local backups folder does not exist"))}}),p(class extends S{constructor(){super(W)}async run(e){const o=e.get(_),r=e.get(f),t=e.get(d),i=await o.downloadSyncActivity();i&&r.prompt(T.Info,l("download sync activity complete","Successfully downloaded Settings Sync activity."),[{label:l("open","Open Folder"),run:()=>t.showItemInFolder(i.fsPath)}])}});
