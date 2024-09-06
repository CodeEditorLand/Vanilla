var C=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var d=(p,s,i,r)=>{for(var t=r>1?void 0:r?D(s,i):s,o=p.length-1,n;o>=0;o--)(n=p[o])&&(t=(r?n(s,i,t):n(t))||t);return r&&t&&C(s,i,t),t},e=(p,s)=>(i,r)=>s(i,r,p);import{isMacintosh as P}from"../../../../../vs/base/common/platform.js";import{basename as E}from"../../../../../vs/base/common/resources.js";import{URI as H}from"../../../../../vs/base/common/uri.js";import{localize as a}from"../../../../../vs/nls.js";import{ICommandService as B}from"../../../../../vs/platform/commands/common/commands.js";import{ConfigurationTarget as L}from"../../../../../vs/platform/configuration/common/configuration.js";import{IDialogService as O,IFileDialogService as A}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{IFileService as N}from"../../../../../vs/platform/files/common/files.js";import{InstantiationType as R,registerSingleton as T}from"../../../../../vs/platform/instantiation/common/extensions.js";import{ILabelService as F,Verbosity as M}from"../../../../../vs/platform/label/common/label.js";import{INativeHostService as V}from"../../../../../vs/platform/native/common/native.js";import{INotificationService as z,Severity as J}from"../../../../../vs/platform/notification/common/notification.js";import{IStorageService as q}from"../../../../../vs/platform/storage/common/storage.js";import{IUriIdentityService as G}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as _}from"../../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{hasWorkspaceFileExtension as j,isUntitledWorkspace as K,isWorkspaceIdentifier as Q,IWorkspaceContextService as X}from"../../../../../vs/platform/workspace/common/workspace.js";import{IWorkspaceTrustManagementService as Y}from"../../../../../vs/platform/workspace/common/workspaceTrust.js";import{IWorkspacesService as Z}from"../../../../../vs/platform/workspaces/common/workspaces.js";import"../../../../../vs/workbench/services/configuration/browser/configurationService.js";import{IWorkbenchConfigurationService as $}from"../../../../../vs/workbench/services/configuration/common/configuration.js";import{IJSONEditingService as ee}from"../../../../../vs/workbench/services/configuration/common/jsonEditing.js";import{INativeWorkbenchEnvironmentService as ie}from"../../../../../vs/workbench/services/environment/electron-sandbox/environmentService.js";import{IExtensionService as re}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{IHostService as te}from"../../../../../vs/workbench/services/host/browser/host.js";import{ILifecycleService as oe,ShutdownReason as m}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";import{ITextFileService as ae}from"../../../../../vs/workbench/services/textfile/common/textfiles.js";import{IUserDataProfileService as se}from"../../../../../vs/workbench/services/userDataProfile/common/userDataProfile.js";import{IWorkingCopyBackupService as ne}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyBackup.js";import{WorkingCopyBackupService as ce}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyBackupService.js";import{AbstractWorkspaceEditingService as pe}from"../../../../../vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService.js";import{IWorkspaceEditingService as ve}from"../../../../../vs/workbench/services/workspaces/common/workspaceEditing.js";let l=class extends pe{constructor(i,r,t,o,n,S,f,c,v,k,u,h,w,I,g,le,me,W,y,b,U,x){super(i,r,o,c,v,k,u,h,w,I,g,W,y,b,U,x);this.nativeHostService=t;this.storageService=n;this.extensionService=S;this.workingCopyBackupService=f;this.lifecycleService=le;this.labelService=me;this.registerListeners()}registerListeners(){this._register(this.lifecycleService.onBeforeShutdown(i=>{const r=this.saveUntitledBeforeShutdown(i.reason);i.veto(r,"veto.untitledWorkspace")}))}async saveUntitledBeforeShutdown(i){if(i!==m.LOAD&&i!==m.CLOSE)return!1;const r=this.getCurrentWorkspaceIdentifier();if(!r||!K(r.configPath,this.environmentService))return!1;const t=await this.nativeHostService.getWindowCount();if(i===m.CLOSE&&!P&&t===1)return!1;if(!(this.configurationService.getValue("window.confirmSaveUntitledWorkspace")!==!1))return await this.workspacesService.deleteUntitledWorkspace(r),!1;let n=!1;const{result:S,checkboxChecked:f}=await this.dialogService.prompt({type:J.Warning,message:a("saveWorkspaceMessage","Do you want to save your workspace configuration as a file?"),detail:a("saveWorkspaceDetail","Save your workspace if you plan to open it again."),buttons:[{label:a({key:"save",comment:["&& denotes a mnemonic"]},"&&Save"),run:async()=>{const c=await this.pickNewWorkspacePath();if(!c||!j(c))return!0;try{await this.saveWorkspaceAs(r,c);const v=await this.workspacesService.getWorkspaceIdentifier(c);await this.workspacesService.addRecentlyOpened([{label:this.labelService.getWorkspaceLabel(v,{verbose:M.LONG}),workspace:v,remoteAuthority:this.environmentService.remoteAuthority}]),await this.workspacesService.deleteUntitledWorkspace(r)}catch{}return!1}},{label:a({key:"doNotSave",comment:["&& denotes a mnemonic"]},"Do&&n't Save"),run:async()=>(await this.workspacesService.deleteUntitledWorkspace(r),!1)}],cancelButton:{run:()=>(n=!0,!0)},checkbox:{label:a("doNotAskAgain","Always discard untitled workspaces without asking")}});return!n&&f&&await this.configurationService.updateValue("window.confirmSaveUntitledWorkspace",!1,L.USER),S}async isValidTargetWorkspacePath(i){return(await this.nativeHostService.getWindows({includeAuxiliaryWindows:!1})).some(t=>Q(t.workspace)&&this.uriIdentityService.extUri.isEqual(t.workspace.configPath,i))?(await this.dialogService.info(a("workspaceOpenedMessage","Unable to save workspace '{0}'",E(i)),a("workspaceOpenedDetail","The workspace is already opened in another window. Please close that window first and then try again.")),!1):!0}async enterWorkspace(i){if(!await this.extensionService.stopExtensionHosts(a("restartExtensionHost.reason","Opening a multi-root workspace.")))return;const t=await this.doEnterWorkspace(i);if(t&&(await this.storageService.switch(t.workspace,!0),this.workingCopyBackupService instanceof ce)){const o=t.backupPath?H.file(t.backupPath).with({scheme:this.environmentService.userRoamingDataHome.scheme}):void 0;this.workingCopyBackupService.reinitialize(o)}this.environmentService.remoteAuthority?this.hostService.reload():this.extensionService.startExtensionHosts()}};l=d([e(0,ee),e(1,X),e(2,V),e(3,$),e(4,q),e(5,re),e(6,ne),e(7,z),e(8,B),e(9,N),e(10,ae),e(11,Z),e(12,ie),e(13,A),e(14,O),e(15,oe),e(16,F),e(17,te),e(18,G),e(19,Y),e(20,_),e(21,se)],l),T(ve,l,R.Delayed);export{l as NativeWorkspaceEditingService};
