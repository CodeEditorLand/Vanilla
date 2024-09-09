var E=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var I=(n,s,e,t)=>{for(var r=t>1?void 0:t?R(s,e):s,o=n.length-1,i;o>=0;o--)(i=n[o])&&(r=(t?i(s,e,r):i(r))||r);return t&&r&&E(s,e,r),r},a=(n,s)=>(e,t)=>s(e,t,n);import*as h from"fs";import D from"electron";import{Emitter as v}from"../../../base/common/event.js";import{parse as M}from"../../../base/common/json.js";import{Disposable as w}from"../../../base/common/lifecycle.js";import{Schemas as l}from"../../../base/common/network.js";import{dirname as g,join as P}from"../../../base/common/path.js";import{basename as F,extUriBiasedIgnorePathCase as k,joinPath as W,originalFSPath as b}from"../../../base/common/resources.js";import"../../../base/common/uri.js";import{Promises as c}from"../../../base/node/pfs.js";import{localize as f}from"../../../nls.js";import{IBackupMainService as C}from"../../backup/electron-main/backup.js";import{IDialogMainService as A}from"../../dialogs/electron-main/dialogMainService.js";import{IEnvironmentMainService as _}from"../../environment/electron-main/environmentMainService.js";import{createDecorator as x}from"../../instantiation/common/instantiation.js";import{ILogService as L}from"../../log/common/log.js";import{IUserDataProfilesMainService as B}from"../../userDataProfile/electron-main/userDataProfile.js";import"../../window/electron-main/window.js";import{findWindowOnWorkspaceOrFolder as O}from"../../windows/electron-main/windowsFinder.js";import{isWorkspaceIdentifier as S,hasWorkspaceFileExtension as H,UNTITLED_WORKSPACE_NAME as U,isUntitledWorkspace as y}from"../../workspace/common/workspace.js";import{getStoredWorkspaceFolder as T,isStoredWorkspaceFolder as N,toWorkspaceFolders as $}from"../common/workspaces.js";import{getWorkspaceIdentifier as d}from"../node/workspaces.js";const Pe=x("workspacesManagementMainService");let p=class extends w{constructor(e,t,r,o,i){super();this.environmentMainService=e;this.logService=t;this.userDataProfilesMainService=r;this.backupMainService=o;this.dialogMainService=i}_onDidDeleteUntitledWorkspace=this._register(new v);onDidDeleteUntitledWorkspace=this._onDidDeleteUntitledWorkspace.event;_onDidEnterWorkspace=this._register(new v);onDidEnterWorkspace=this._onDidEnterWorkspace.event;untitledWorkspacesHome=this.environmentMainService.untitledWorkspacesHome;untitledWorkspaces=[];async initialize(){this.untitledWorkspaces=[];try{const e=(await c.readdir(this.untitledWorkspacesHome.with({scheme:l.file}).fsPath)).map(t=>W(this.untitledWorkspacesHome,t,U));for(const t of e){const r=d(t),o=await this.resolveLocalWorkspace(t);o?this.untitledWorkspaces.push({workspace:r,remoteAuthority:o.remoteAuthority}):await this.deleteUntitledWorkspace(r)}}catch(e){e.code!=="ENOENT"&&this.logService.warn(`Unable to read folders in ${this.untitledWorkspacesHome} (${e}).`)}}resolveLocalWorkspace(e){return this.doResolveLocalWorkspace(e,t=>h.promises.readFile(t,"utf8"))}doResolveLocalWorkspace(e,t){if(this.isWorkspacePath(e)&&e.scheme===l.file)try{const r=t(e.fsPath);return r instanceof Promise?r.then(o=>this.doResolveWorkspace(e,o),o=>{}):this.doResolveWorkspace(e,r)}catch{return}}isWorkspacePath(e){return y(e,this.environmentMainService)||H(e)}doResolveWorkspace(e,t){try{const r=this.doParseStoredWorkspace(e,t),o=d(e);return{id:o.id,configPath:o.configPath,folders:$(r.folders,o.configPath,k),remoteAuthority:r.remoteAuthority,transient:r.transient}}catch(r){this.logService.warn(r.toString())}}doParseStoredWorkspace(e,t){const r=M(t);if(r&&Array.isArray(r.folders))r.folders=r.folders.filter(o=>N(o));else throw new Error(`${e.toString(!0)} looks like an invalid workspace file.`);return r}async createUntitledWorkspace(e,t){const{workspace:r,storedWorkspace:o}=this.newUntitledWorkspace(e,t),i=r.configPath.fsPath;return await h.promises.mkdir(g(i),{recursive:!0}),await c.writeFile(i,JSON.stringify(o,null,"	")),this.untitledWorkspaces.push({workspace:r,remoteAuthority:t}),r}newUntitledWorkspace(e=[],t){const r=(Date.now()+Math.round(Math.random()*1e3)).toString(),o=W(this.untitledWorkspacesHome,r),i=W(o,U),m=[];for(const u of e)m.push(T(u.uri,!0,u.name,o,k));return{workspace:d(i),storedWorkspace:{folders:m,remoteAuthority:t}}}async getWorkspaceIdentifier(e){return d(e)}isUntitledWorkspace(e){return y(e.configPath,this.environmentMainService)}async deleteUntitledWorkspace(e){this.isUntitledWorkspace(e)&&(await this.doDeleteUntitledWorkspace(e),this.userDataProfilesMainService.isEnabled()&&this.userDataProfilesMainService.unsetWorkspace(e),this._onDidDeleteUntitledWorkspace.fire(e))}async doDeleteUntitledWorkspace(e){const t=b(e.configPath);try{await c.rm(g(t));const r=P(this.environmentMainService.workspaceStorageHome.with({scheme:l.file}).fsPath,e.id);await c.exists(r)&&await c.writeFile(P(r,"obsolete"),""),this.untitledWorkspaces=this.untitledWorkspaces.filter(o=>o.workspace.id!==e.id)}catch(r){this.logService.warn(`Unable to delete untitled workspace ${t} (${r}).`)}}getUntitledWorkspaces(){return this.untitledWorkspaces}async enterWorkspace(e,t,r){if(!e||!e.win||!e.isReady||!await this.isValidTargetWorkspacePath(e,t,r))return;const i=await this.doEnterWorkspace(e,d(r));if(i)return this._onDidEnterWorkspace.fire({window:e,workspace:i.workspace}),i}async isValidTargetWorkspacePath(e,t,r){return r?S(e.openedWorkspace)&&k.isEqual(e.openedWorkspace.configPath,r)?!1:O(t,r)?(await this.dialogMainService.showMessageBox({type:"info",buttons:[f({key:"ok",comment:["&& denotes a mnemonic"]},"&&OK")],message:f("workspaceOpenedMessage","Unable to save workspace '{0}'",F(r)),detail:f("workspaceOpenedDetail","The workspace is already opened in another window. Please close that window first and then try again.")},D.BrowserWindow.getFocusedWindow()??void 0),!1):!0:!0}async doEnterWorkspace(e,t){if(!e.config)return;e.focus();let r;return e.config.extensionDevelopmentPath||(e.config.backupPath?r=await this.backupMainService.registerWorkspaceBackup({workspace:t,remoteAuthority:e.remoteAuthority},e.config.backupPath):r=this.backupMainService.registerWorkspaceBackup({workspace:t,remoteAuthority:e.remoteAuthority})),S(e.openedWorkspace)&&this.isUntitledWorkspace(e.openedWorkspace)&&await this.deleteUntitledWorkspace(e.openedWorkspace),e.config.workspace=t,e.config.backupPath=r,{workspace:t,backupPath:r}}};p=I([a(0,_),a(1,L),a(2,B),a(3,C),a(4,A)],p);export{Pe as IWorkspacesManagementMainService,p as WorkspacesManagementMainService};
