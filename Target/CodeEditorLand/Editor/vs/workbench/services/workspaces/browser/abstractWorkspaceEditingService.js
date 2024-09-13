var w=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var h=(v,c,e,r)=>{for(var i=r>1?void 0:r?P(c,e):c,t=v.length-1,a;t>=0;t--)(a=v[t])&&(i=(r?a(c,e,i):a(i))||i);return r&&i&&w(c,e,i),i},s=(v,c)=>(e,r)=>c(e,r,v);import{distinct as F}from"../../../../base/common/arrays.js";import{mnemonicButtonLabel as E}from"../../../../base/common/labels.js";import{Disposable as C}from"../../../../base/common/lifecycle.js";import{Schemas as u}from"../../../../base/common/network.js";import{basename as W,isEqual as D,isEqualAuthority as R,joinPath as U,removeTrailingPathSeparator as g}from"../../../../base/common/resources.js";import{localize as m}from"../../../../nls.js";import{ICommandService as b}from"../../../../platform/commands/common/commands.js";import{Extensions as x,ConfigurationScope as T}from"../../../../platform/configuration/common/configurationRegistry.js";import{IDialogService as A,IFileDialogService as O}from"../../../../platform/dialogs/common/dialogs.js";import{IFileService as N}from"../../../../platform/files/common/files.js";import{INotificationService as L,Severity as M}from"../../../../platform/notification/common/notification.js";import{Registry as j}from"../../../../platform/registry/common/platform.js";import{IUriIdentityService as J}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as K}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{IWorkspaceContextService as V,WORKSPACE_EXTENSION as k,WORKSPACE_FILTER as _,WorkbenchState as p,hasWorkspaceFileExtension as $,isSavedWorkspace as q,isUntitledWorkspace as I,isWorkspaceIdentifier as z,toWorkspaceIdentifier as B}from"../../../../platform/workspace/common/workspace.js";import{IWorkspaceTrustManagementService as H}from"../../../../platform/workspace/common/workspaceTrust.js";import{IWorkspacesService as X,rewriteWorkspaceFileForNewLocation as y}from"../../../../platform/workspaces/common/workspaces.js";import{SaveReason as Y}from"../../../common/editor.js";import{IWorkbenchConfigurationService as G}from"../../configuration/common/configuration.js";import{IJSONEditingService as Q,JSONEditingErrorCode as Z}from"../../configuration/common/jsonEditing.js";import{IWorkbenchEnvironmentService as ee}from"../../environment/common/environmentService.js";import{IHostService as re}from"../../host/browser/host.js";import{ITextFileService as ie}from"../../textfile/common/textfiles.js";import{IUserDataProfileService as te}from"../../userDataProfile/common/userDataProfile.js";let S=class extends C{constructor(e,r,i,t,a,o,n,l,f,d,oe,ae,se,ne,ce,pe){super();this.jsonEditingService=e;this.contextService=r;this.configurationService=i;this.notificationService=t;this.commandService=a;this.fileService=o;this.textFileService=n;this.workspacesService=l;this.environmentService=f;this.fileDialogService=d;this.dialogService=oe;this.hostService=ae;this.uriIdentityService=se;this.workspaceTrustManagementService=ne;this.userDataProfilesService=ce;this.userDataProfileService=pe}async pickNewWorkspacePath(){const e=[u.file];this.environmentService.remoteAuthority&&e.unshift(u.vscodeRemote);let r=await this.fileDialogService.showSaveDialog({saveLabel:E(m("save","Save")),title:m("saveWorkspace","Save Workspace"),filters:_,defaultUri:U(await this.fileDialogService.defaultWorkspacePath(),this.getNewWorkspaceName()),availableFileSystems:e});if(r)return $(r)||(r=r.with({path:`${r.path}.${k}`})),r}getNewWorkspaceName(){const e=this.getCurrentWorkspaceIdentifier()?.configPath;if(e&&q(e,this.environmentService))return W(e);const r=this.contextService.getWorkspace().folders.at(0);return r?`${W(r.uri)}.${k}`:`workspace.${k}`}async updateFolders(e,r,i,t){const a=this.contextService.getWorkspace().folders;let o=[];typeof r=="number"&&(o=a.slice(e,e+r).map(d=>d.uri));let n=[];Array.isArray(i)&&(n=i.map(d=>({uri:g(d.uri),name:d.name})));const l=o.length>0,f=n.length>0;if(!(!f&&!l))return f&&!l?this.doAddFolders(n,e,t):l&&!f?this.removeFolders(o):this.includesSingleFolderWorkspace(o)?this.createAndEnterWorkspace(n):this.contextService.getWorkbenchState()!==p.WORKSPACE?this.doAddFolders(n,e,t):this.doUpdateFolders(n,o,e,t)}async doUpdateFolders(e,r,i,t=!1){try{await this.contextService.updateFolders(e,r,i)}catch(a){if(t)throw a;this.handleWorkspaceConfigurationEditingError(a)}}addFolders(e,r=!1){const i=e.map(t=>({uri:g(t.uri),name:t.name}));return this.doAddFolders(i,void 0,r)}async doAddFolders(e,r,i=!1){const t=this.contextService.getWorkbenchState(),a=this.environmentService.remoteAuthority;if(a&&(e=e.filter(o=>o.uri.scheme!==u.file&&(o.uri.scheme!==u.vscodeRemote||R(o.uri.authority,a)))),t!==p.WORKSPACE){let o=this.contextService.getWorkspace().folders.map(n=>({uri:n.uri}));return o.splice(typeof r=="number"?r:o.length,0,...e),o=F(o,n=>this.uriIdentityService.extUri.getComparisonKey(n.uri)),t===p.EMPTY&&o.length===0||t===p.FOLDER&&o.length===1?void 0:this.createAndEnterWorkspace(o)}try{await this.contextService.addFolders(e,r)}catch(o){if(i)throw o;this.handleWorkspaceConfigurationEditingError(o)}}async removeFolders(e,r=!1){if(this.includesSingleFolderWorkspace(e))return this.createAndEnterWorkspace([]);try{await this.contextService.removeFolders(e)}catch(i){if(r)throw i;this.handleWorkspaceConfigurationEditingError(i)}}includesSingleFolderWorkspace(e){if(this.contextService.getWorkbenchState()===p.FOLDER){const r=this.contextService.getWorkspace().folders[0];return e.some(i=>this.uriIdentityService.extUri.isEqual(i,r.uri))}return!1}async createAndEnterWorkspace(e,r){if(r&&!await this.isValidTargetWorkspacePath(r))return;const i=this.environmentService.remoteAuthority,t=await this.workspacesService.createUntitledWorkspace(e,i);if(r)try{await this.saveWorkspaceAs(t,r)}finally{await this.workspacesService.deleteUntitledWorkspace(t)}else r=t.configPath,this.userDataProfileService.currentProfile.isDefault||await this.userDataProfilesService.setProfileForWorkspace(t,this.userDataProfileService.currentProfile);return this.enterWorkspace(r)}async saveAndEnterWorkspace(e){const r=this.getCurrentWorkspaceIdentifier();if(r){if(D(r.configPath,e))return this.saveWorkspace(r);if(await this.isValidTargetWorkspacePath(e))return await this.saveWorkspaceAs(r,e),this.enterWorkspace(e)}}async isValidTargetWorkspacePath(e){return!0}async saveWorkspaceAs(e,r){const i=e.configPath;if(!I(r,this.environmentService)&&!this.userDataProfileService.currentProfile.isDefault){const l=await this.workspacesService.getWorkspaceIdentifier(r);await this.userDataProfilesService.setProfileForWorkspace(l,this.userDataProfileService.currentProfile)}if(this.uriIdentityService.extUri.isEqual(i,r))return;const a=I(i,this.environmentService),o=await this.fileService.readFile(i),n=y(o.value.toString(),i,a,r,this.uriIdentityService.extUri);await this.textFileService.create([{resource:r,value:n,options:{overwrite:!0}}]),await this.trustWorkspaceConfiguration(r)}async saveWorkspace(e){const r=e.configPath,i=this.textFileService.files.get(r);if(i){await i.save({force:!0,reason:Y.EXPLICIT});return}if(await this.fileService.exists(r))return;const o=y(JSON.stringify({folders:[]},null,"	"),r,!1,r,this.uriIdentityService.extUri);await this.textFileService.create([{resource:r,value:o}])}handleWorkspaceConfigurationEditingError(e){switch(e.code){case Z.ERROR_INVALID_FILE:this.onInvalidWorkspaceConfigurationFileError();break;default:this.notificationService.error(e.message)}}onInvalidWorkspaceConfigurationFileError(){const e=m("errorInvalidTaskConfiguration","Unable to write into workspace configuration file. Please open the file to correct errors/warnings in it and try again.");this.askToOpenWorkspaceConfigurationFile(e)}askToOpenWorkspaceConfigurationFile(e){this.notificationService.prompt(M.Error,e,[{label:m("openWorkspaceConfigurationFile","Open Workspace Configuration"),run:()=>this.commandService.executeCommand("workbench.action.openWorkspaceConfigFile")}])}async doEnterWorkspace(e){if(this.environmentService.extensionTestsLocationURI)throw new Error("Entering a new workspace is not possible in tests.");const r=await this.workspacesService.getWorkspaceIdentifier(e);return this.contextService.getWorkbenchState()===p.FOLDER&&await this.migrateWorkspaceSettings(r),await this.configurationService.initialize(r),this.workspacesService.enterWorkspace(e)}migrateWorkspaceSettings(e){return this.doCopyWorkspaceSettings(e,r=>r.scope===T.WINDOW)}copyWorkspaceSettings(e){return this.doCopyWorkspaceSettings(e)}doCopyWorkspaceSettings(e,r){const i=j.as(x.Configuration).getConfigurationProperties(),t={};for(const a of this.configurationService.keys().workspace)if(i[a]){if(r&&!r(i[a]))continue;t[a]=this.configurationService.inspect(a).workspaceValue}return this.jsonEditingService.write(e.configPath,[{path:["settings"],value:t}],!0)}async trustWorkspaceConfiguration(e){this.contextService.getWorkbenchState()!==p.EMPTY&&this.workspaceTrustManagementService.isWorkspaceTrusted()&&await this.workspaceTrustManagementService.setUrisTrust([e],!0)}getCurrentWorkspaceIdentifier(){const e=B(this.contextService.getWorkspace());if(z(e))return e}};S=h([s(0,Q),s(1,V),s(2,G),s(3,L),s(4,b),s(5,N),s(6,ie),s(7,X),s(8,ee),s(9,O),s(10,A),s(11,re),s(12,J),s(13,H),s(14,K),s(15,te)],S);export{S as AbstractWorkspaceEditingService};
