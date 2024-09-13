var I=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var l=(d,e,r,t)=>{for(var a=t>1?void 0:t?B(e,r):e,o=d.length-1,i;o>=0;o--)(i=d[o])&&(a=(t?i(e,r,a):i(a))||a);return t&&a&&I(e,r,a),a},n=(d,e)=>(r,t)=>e(r,t,d);import{createHash as w}from"crypto";import{isEqual as y}from"../../../base/common/extpath.js";import{Schemas as k}from"../../../base/common/network.js";import{join as s}from"../../../base/common/path.js";import{isLinux as m}from"../../../base/common/platform.js";import{extUriBiasedIgnorePathCase as g}from"../../../base/common/resources.js";import{Promises as p,RimRafMode as W}from"../../../base/node/pfs.js";import{IConfigurationService as v}from"../../configuration/common/configuration.js";import{IEnvironmentMainService as S}from"../../environment/electron-main/environmentMainService.js";import{HotExitConfiguration as f}from"../../files/common/files.js";import{ILogService as E}from"../../log/common/log.js";import{IStateService as b}from"../../state/node/state.js";import{isWorkspaceIdentifier as F}from"../../workspace/common/workspace.js";import{createEmptyWorkspaceIdentifier as h}from"../../workspaces/node/workspaces.js";import{isFolderBackupInfo as H}from"../common/backup.js";import{deserializeFolderInfos as C,deserializeWorkspaceInfos as P,isEmptyWindowBackupInfo as x}from"../node/backup.js";let c=class{constructor(e,r,t,a){this.environmentMainService=e;this.configurationService=r;this.logService=t;this.stateService=a}static backupWorkspacesMetadataStorageKey="backupWorkspaces";backupHome=this.environmentMainService.backupHome;workspaces=[];folders=[];emptyWindows=[];backupUriComparer=g;backupPathComparer={isEqual:(e,r)=>y(e,r,!m)};async initialize(){const e=this.stateService.getItem(c.backupWorkspacesMetadataStorageKey)??{workspaces:[],folders:[],emptyWindows:[]};this.emptyWindows=await this.validateEmptyWorkspaces(e.emptyWindows),this.workspaces=await this.validateWorkspaces(P(e)),this.folders=await this.validateFolders(C(e)),this.storeWorkspacesMetadata()}getWorkspaceBackups(){return this.isHotExitOnExitAndWindowClose()?[]:this.workspaces.slice(0)}getFolderBackups(){return this.isHotExitOnExitAndWindowClose()?[]:this.folders.slice(0)}isHotExitEnabled(){return this.getHotExitConfig()!==f.OFF}isHotExitOnExitAndWindowClose(){return this.getHotExitConfig()===f.ON_EXIT_AND_WINDOW_CLOSE}getHotExitConfig(){return this.configurationService.getValue()?.files?.hotExit||f.ON_EXIT}getEmptyWindowBackups(){return this.emptyWindows.slice(0)}registerWorkspaceBackup(e,r){this.workspaces.some(a=>e.workspace.id===a.workspace.id)||(this.workspaces.push(e),this.storeWorkspacesMetadata());const t=s(this.backupHome,e.workspace.id);return r?this.moveBackupFolder(t,r).then(()=>t):t}async moveBackupFolder(e,r){if(await p.exists(e)&&await this.convertToEmptyWindowBackup(e),await p.exists(r))try{await p.rename(r,e,!1)}catch(t){this.logService.error(`Backup: Could not move backup folder to new location: ${t.toString()}`)}}registerFolderBackup(e){return this.folders.some(r=>this.backupUriComparer.isEqual(e.folderUri,r.folderUri))||(this.folders.push(e),this.storeWorkspacesMetadata()),s(this.backupHome,this.getFolderHash(e))}registerEmptyWindowBackup(e){return this.emptyWindows.some(r=>!!r.backupFolder&&this.backupPathComparer.isEqual(r.backupFolder,e.backupFolder))||(this.emptyWindows.push(e),this.storeWorkspacesMetadata()),s(this.backupHome,e.backupFolder)}async validateWorkspaces(e){if(!Array.isArray(e))return[];const r=new Set,t=[];for(const a of e){const o=a.workspace;if(!F(o))return[];if(!r.has(o.id)){r.add(o.id);const i=s(this.backupHome,o.id);await this.doHasBackups(i)?o.configPath.scheme!==k.file||await p.exists(o.configPath.fsPath)?t.push(a):await this.convertToEmptyWindowBackup(i):await this.deleteStaleBackup(i)}}return t}async validateFolders(e){if(!Array.isArray(e))return[];const r=[],t=new Set;for(const a of e){const o=a.folderUri,i=this.backupUriComparer.getComparisonKey(o);if(!t.has(i)){t.add(i);const u=s(this.backupHome,this.getFolderHash(a));await this.doHasBackups(u)?o.scheme!==k.file||await p.exists(o.fsPath)?r.push(a):await this.convertToEmptyWindowBackup(u):await this.deleteStaleBackup(u)}}return r}async validateEmptyWorkspaces(e){if(!Array.isArray(e))return[];const r=[],t=new Set;for(const a of e){const o=a.backupFolder;if(typeof o!="string")return[];if(!t.has(o)){t.add(o);const i=s(this.backupHome,o);await this.doHasBackups(i)?r.push(a):await this.deleteStaleBackup(i)}}return r}async deleteStaleBackup(e){try{await p.rm(e,W.MOVE)}catch(r){this.logService.error(`Backup: Could not delete stale backup: ${r.toString()}`)}}prepareNewEmptyWindowBackup(){let e=h();for(;this.emptyWindows.some(r=>!!r.backupFolder&&this.backupPathComparer.isEqual(r.backupFolder,e.id));)e=h();return{backupFolder:e.id}}async convertToEmptyWindowBackup(e){const r=this.prepareNewEmptyWindowBackup(),t=s(this.backupHome,r.backupFolder);try{await p.rename(e,t,!1)}catch(a){return this.logService.error(`Backup: Could not rename backup folder: ${a.toString()}`),!1}return this.emptyWindows.push(r),!0}async getDirtyWorkspaces(){const e=[];for(const r of this.workspaces)await this.hasBackups(r)&&e.push(r);for(const r of this.folders)await this.hasBackups(r)&&e.push(r);return e}hasBackups(e){let r;return x(e)?r=s(this.backupHome,e.backupFolder):H(e)?r=s(this.backupHome,this.getFolderHash(e)):r=s(this.backupHome,e.workspace.id),this.doHasBackups(r)}async doHasBackups(e){try{const r=await p.readdir(e);for(const t of r)try{if((await p.readdir(s(e,t))).length>0)return!0}catch{}}catch{}return!1}storeWorkspacesMetadata(){const e={workspaces:this.workspaces.map(({workspace:r,remoteAuthority:t})=>{const a={id:r.id,configURIPath:r.configPath.toString()};return t&&(a.remoteAuthority=t),a}),folders:this.folders.map(({folderUri:r,remoteAuthority:t})=>{const a={folderUri:r.toString()};return t&&(a.remoteAuthority=t),a}),emptyWindows:this.emptyWindows.map(({backupFolder:r,remoteAuthority:t})=>{const a={backupFolder:r};return t&&(a.remoteAuthority=t),a})};this.stateService.setItem(c.backupWorkspacesMetadataStorageKey,e)}getFolderHash(e){const r=e.folderUri;let t;return r.scheme===k.file?t=m?r.fsPath:r.fsPath.toLowerCase():t=r.toString().toLowerCase(),w("md5").update(t).digest("hex")}};c=l([n(0,S),n(1,v),n(2,E),n(3,b)],c);export{c as BackupMainService};
