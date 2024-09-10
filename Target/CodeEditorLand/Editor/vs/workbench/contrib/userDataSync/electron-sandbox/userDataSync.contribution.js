var v=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var m=(c,e,o,r)=>{for(var t=r>1?void 0:r?h(e,o):e,i=c.length-1,n;i>=0;i--)(n=c[i])&&(t=(r?n(e,o,t):n(t))||t);return r&&t&&v(e,o,t),t},a=(c,e)=>(o,r)=>e(o,r,c);import{WorkbenchPhase as I,registerWorkbenchContribution2 as y}from"../../../common/contributions.js";import{IUserDataSyncUtilService as k,SyncStatus as b}from"../../../../platform/userDataSync/common/userDataSync.js";import{ISharedProcessService as w}from"../../../../platform/ipc/electron-sandbox/services.js";import{registerAction2 as S,Action2 as d,MenuId as g}from"../../../../platform/actions/common/actions.js";import{localize as l,localize2 as A}from"../../../../nls.js";import{IEnvironmentService as D}from"../../../../platform/environment/common/environment.js";import{IFileService as T}from"../../../../platform/files/common/files.js";import{INativeHostService as p}from"../../../../platform/native/common/native.js";import{INotificationService as f,Severity as P}from"../../../../platform/notification/common/notification.js";import{CONTEXT_SYNC_STATE as C,DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR as O,IUserDataSyncWorkbenchService as F,SYNC_TITLE as N}from"../../../services/userDataSync/common/userDataSync.js";import{Schemas as W}from"../../../../base/common/network.js";import{ProxyChannel as _}from"../../../../base/parts/ipc/common/ipc.js";import{Disposable as x}from"../../../../base/common/lifecycle.js";let s=class extends x{static ID="workbench.contrib.userDataSyncServices";constructor(e,o){super(),o.registerChannel("userDataSyncUtil",_.fromService(e,this._store))}};s=m([a(0,k),a(1,w)],s),y(s.ID,s,I.BlockStartup),S(class extends d{constructor(){super({id:"workbench.userData.actions.openSyncBackupsFolder",title:A("Open Backup folder","Open Local Backups Folder"),category:N,menu:{id:g.CommandPalette,when:C.notEqualsTo(b.Uninitialized)}})}async run(e){const o=e.get(D).userDataSyncHome,r=e.get(p),t=e.get(T),i=e.get(f);if(await t.exists(o)){const n=await t.resolve(o),u=n.children&&n.children[0]?n.children[0].resource:o;return r.showItemInFolder(u.with({scheme:W.file}).fsPath)}else i.info(l("no backups","Local backups folder does not exist"))}}),S(class extends d{constructor(){super(O)}async run(e){const o=e.get(F),r=e.get(f),t=e.get(p),i=await o.downloadSyncActivity();i&&r.prompt(P.Info,l("download sync activity complete","Successfully downloaded Settings Sync activity."),[{label:l("open","Open Folder"),run:()=>t.showItemInFolder(i.fsPath)}])}});
