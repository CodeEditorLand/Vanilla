var y=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var h=(v,c,e,r)=>{for(var i=r>1?void 0:r?P(c,e):c,t=v.length-1,a;t>=0;t--)(a=v[t])&&(i=(r?a(c,e,i):a(i))||i);return r&&i&&y(c,e,i),i},s=(v,c)=>(e,r)=>c(e,r,v);import{distinct as F,firstOrDefault as E}from"../../../../../vs/base/common/arrays.js";import{mnemonicButtonLabel as C}from"../../../../../vs/base/common/labels.js";import{Disposable as D}from"../../../../../vs/base/common/lifecycle.js";import{Schemas as u}from"../../../../../vs/base/common/network.js";import{basename as W,isEqual as b,isEqualAuthority as R,joinPath as U,removeTrailingPathSeparator as g}from"../../../../../vs/base/common/resources.js";import"../../../../../vs/base/common/uri.js";import{localize as m}from"../../../../../vs/nls.js";import{ICommandService as x}from"../../../../../vs/platform/commands/common/commands.js";import{Extensions as O,ConfigurationScope as T}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{IDialogService as A,IFileDialogService as N}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{IFileService as L}from"../../../../../vs/platform/files/common/files.js";import{INotificationService as M,Severity as J}from"../../../../../vs/platform/notification/common/notification.js";import{Registry as K}from"../../../../../vs/platform/registry/common/platform.js";import{IUriIdentityService as V}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as _}from"../../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{hasWorkspaceFileExtension as $,isSavedWorkspace as q,isUntitledWorkspace as I,isWorkspaceIdentifier as j,IWorkspaceContextService as z,toWorkspaceIdentifier as B,WorkbenchState as p,WORKSPACE_EXTENSION as k,WORKSPACE_FILTER as H}from"../../../../../vs/platform/workspace/common/workspace.js";import{IWorkspaceTrustManagementService as X}from"../../../../../vs/platform/workspace/common/workspaceTrust.js";import{IWorkspacesService as Y,rewriteWorkspaceFileForNewLocation as w}from"../../../../../vs/platform/workspaces/common/workspaces.js";import{SaveReason as G}from"../../../../../vs/workbench/common/editor.js";import"../../../../../vs/workbench/services/configuration/browser/configurationService.js";import{IWorkbenchConfigurationService as Q}from"../../../../../vs/workbench/services/configuration/common/configuration.js";import{IJSONEditingService as Z,JSONEditingErrorCode as ee}from"../../../../../vs/workbench/services/configuration/common/jsonEditing.js";import{IWorkbenchEnvironmentService as re}from"../../../../../vs/workbench/services/environment/common/environmentService.js";import{IHostService as ie}from"../../../../../vs/workbench/services/host/browser/host.js";import{ITextFileService as te}from"../../../../../vs/workbench/services/textfile/common/textfiles.js";import{IUserDataProfileService as oe}from"../../../../../vs/workbench/services/userDataProfile/common/userDataProfile.js";import"../../../../../vs/workbench/services/workspaces/common/workspaceEditing.js";let S=class extends D{constructor(e,r,i,t,a,o,n,l,f,d,ae,se,ne,ce,pe,le){super();this.jsonEditingService=e;this.contextService=r;this.configurationService=i;this.notificationService=t;this.commandService=a;this.fileService=o;this.textFileService=n;this.workspacesService=l;this.environmentService=f;this.fileDialogService=d;this.dialogService=ae;this.hostService=se;this.uriIdentityService=ne;this.workspaceTrustManagementService=ce;this.userDataProfilesService=pe;this.userDataProfileService=le}async pickNewWorkspacePath(){const e=[u.file];this.environmentService.remoteAuthority&&e.unshift(u.vscodeRemote);let r=await this.fileDialogService.showSaveDialog({saveLabel:C(m("save","Save")),title:m("saveWorkspace","Save Workspace"),filters:H,defaultUri:U(await this.fileDialogService.defaultWorkspacePath(),this.getNewWorkspaceName()),availableFileSystems:e});if(r)return $(r)||(r=r.with({path:`${r.path}.${k}`})),r}getNewWorkspaceName(){const e=this.getCurrentWorkspaceIdentifier()?.configPath;if(e&&q(e,this.environmentService))return W(e);const r=E(this.contextService.getWorkspace().folders);return r?`${W(r.uri)}.${k}`:`workspace.${k}`}async updateFolders(e,r,i,t){const a=this.contextService.getWorkspace().folders;let o=[];typeof r=="number"&&(o=a.slice(e,e+r).map(d=>d.uri));let n=[];Array.isArray(i)&&(n=i.map(d=>({uri:g(d.uri),name:d.name})));const l=o.length>0,f=n.length>0;if(!(!f&&!l))return f&&!l?this.doAddFolders(n,e,t):l&&!f?this.removeFolders(o):this.includesSingleFolderWorkspace(o)?this.createAndEnterWorkspace(n):this.contextService.getWorkbenchState()!==p.WORKSPACE?this.doAddFolders(n,e,t):this.doUpdateFolders(n,o,e,t)}async doUpdateFolders(e,r,i,t=!1){try{await this.contextService.updateFolders(e,r,i)}catch(a){if(t)throw a;this.handleWorkspaceConfigurationEditingError(a)}}addFolders(e,r=!1){const i=e.map(t=>({uri:g(t.uri),name:t.name}));return this.doAddFolders(i,void 0,r)}async doAddFolders(e,r,i=!1){const t=this.contextService.getWorkbenchState(),a=this.environmentService.remoteAuthority;if(a&&(e=e.filter(o=>o.uri.scheme!==u.file&&(o.uri.scheme!==u.vscodeRemote||R(o.uri.authority,a)))),t!==p.WORKSPACE){let o=this.contextService.getWorkspace().folders.map(n=>({uri:n.uri}));return o.splice(typeof r=="number"?r:o.length,0,...e),o=F(o,n=>this.uriIdentityService.extUri.getComparisonKey(n.uri)),t===p.EMPTY&&o.length===0||t===p.FOLDER&&o.length===1?void 0:this.createAndEnterWorkspace(o)}try{await this.contextService.addFolders(e,r)}catch(o){if(i)throw o;this.handleWorkspaceConfigurationEditingError(o)}}async removeFolders(e,r=!1){if(this.includesSingleFolderWorkspace(e))return this.createAndEnterWorkspace([]);try{await this.contextService.removeFolders(e)}catch(i){if(r)throw i;this.handleWorkspaceConfigurationEditingError(i)}}includesSingleFolderWorkspace(e){if(this.contextService.getWorkbenchState()===p.FOLDER){const r=this.contextService.getWorkspace().folders[0];return e.some(i=>this.uriIdentityService.extUri.isEqual(i,r.uri))}return!1}async createAndEnterWorkspace(e,r){if(r&&!await this.isValidTargetWorkspacePath(r))return;const i=this.environmentService.remoteAuthority,t=await this.workspacesService.createUntitledWorkspace(e,i);if(r)try{await this.saveWorkspaceAs(t,r)}finally{await this.workspacesService.deleteUntitledWorkspace(t)}else r=t.configPath,this.userDataProfileService.currentProfile.isDefault||await this.userDataProfilesService.setProfileForWorkspace(t,this.userDataProfileService.currentProfile);return this.enterWorkspace(r)}async saveAndEnterWorkspace(e){const r=this.getCurrentWorkspaceIdentifier();if(r){if(b(r.configPath,e))return this.saveWorkspace(r);if(await this.isValidTargetWorkspacePath(e))return await this.saveWorkspaceAs(r,e),this.enterWorkspace(e)}}async isValidTargetWorkspacePath(e){return!0}async saveWorkspaceAs(e,r){const i=e.configPath;if(!I(r,this.environmentService)&&!this.userDataProfileService.currentProfile.isDefault){const l=await this.workspacesService.getWorkspaceIdentifier(r);await this.userDataProfilesService.setProfileForWorkspace(l,this.userDataProfileService.currentProfile)}if(this.uriIdentityService.extUri.isEqual(i,r))return;const a=I(i,this.environmentService),o=await this.fileService.readFile(i),n=w(o.value.toString(),i,a,r,this.uriIdentityService.extUri);await this.textFileService.create([{resource:r,value:n,options:{overwrite:!0}}]),await this.trustWorkspaceConfiguration(r)}async saveWorkspace(e){const r=e.configPath,i=this.textFileService.files.get(r);if(i){await i.save({force:!0,reason:G.EXPLICIT});return}if(await this.fileService.exists(r))return;const o=w(JSON.stringify({folders:[]},null,"	"),r,!1,r,this.uriIdentityService.extUri);await this.textFileService.create([{resource:r,value:o}])}handleWorkspaceConfigurationEditingError(e){switch(e.code){case ee.ERROR_INVALID_FILE:this.onInvalidWorkspaceConfigurationFileError();break;default:this.notificationService.error(e.message)}}onInvalidWorkspaceConfigurationFileError(){const e=m("errorInvalidTaskConfiguration","Unable to write into workspace configuration file. Please open the file to correct errors/warnings in it and try again.");this.askToOpenWorkspaceConfigurationFile(e)}askToOpenWorkspaceConfigurationFile(e){this.notificationService.prompt(J.Error,e,[{label:m("openWorkspaceConfigurationFile","Open Workspace Configuration"),run:()=>this.commandService.executeCommand("workbench.action.openWorkspaceConfigFile")}])}async doEnterWorkspace(e){if(this.environmentService.extensionTestsLocationURI)throw new Error("Entering a new workspace is not possible in tests.");const r=await this.workspacesService.getWorkspaceIdentifier(e);return this.contextService.getWorkbenchState()===p.FOLDER&&await this.migrateWorkspaceSettings(r),await this.configurationService.initialize(r),this.workspacesService.enterWorkspace(e)}migrateWorkspaceSettings(e){return this.doCopyWorkspaceSettings(e,r=>r.scope===T.WINDOW)}copyWorkspaceSettings(e){return this.doCopyWorkspaceSettings(e)}doCopyWorkspaceSettings(e,r){const i=K.as(O.Configuration).getConfigurationProperties(),t={};for(const a of this.configurationService.keys().workspace)if(i[a]){if(r&&!r(i[a]))continue;t[a]=this.configurationService.inspect(a).workspaceValue}return this.jsonEditingService.write(e.configPath,[{path:["settings"],value:t}],!0)}async trustWorkspaceConfiguration(e){this.contextService.getWorkbenchState()!==p.EMPTY&&this.workspaceTrustManagementService.isWorkspaceTrusted()&&await this.workspaceTrustManagementService.setUrisTrust([e],!0)}getCurrentWorkspaceIdentifier(){const e=B(this.contextService.getWorkspace());if(j(e))return e}};S=h([s(0,Z),s(1,z),s(2,Q),s(3,M),s(4,x),s(5,L),s(6,te),s(7,Y),s(8,re),s(9,N),s(10,A),s(11,ie),s(12,V),s(13,X),s(14,_),s(15,oe)],S);export{S as AbstractWorkspaceEditingService};
