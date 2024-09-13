var v=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var P=(l,n,e,r)=>{for(var i=r>1?void 0:r?p(n,e):n,o=l.length-1,a;o>=0;o--)(a=l[o])&&(i=(r?a(n,e,i):a(i))||i);return r&&i&&v(n,e,i),i},t=(l,n)=>(e,r)=>n(e,r,l);import{CancellationToken as h}from"../../../../base/common/cancellation.js";import{CancellationError as g}from"../../../../base/common/errors.js";import{Disposable as S}from"../../../../base/common/lifecycle.js";import{equals as D}from"../../../../base/common/objects.js";import{localize as s}from"../../../../nls.js";import{IDialogService as w}from"../../../../platform/dialogs/common/dialogs.js";import{InstantiationType as I,registerSingleton as E}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as C}from"../../../../platform/log/common/log.js";import{IProductService as x}from"../../../../platform/product/common/productService.js";import{IRequestService as y,asJson as k}from"../../../../platform/request/common/request.js";import{ITelemetryService as U}from"../../../../platform/telemetry/common/telemetry.js";import{IUserDataProfilesService as A}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{IWorkspaceContextService as T,toWorkspaceIdentifier as d}from"../../../../platform/workspace/common/workspace.js";import{IWorkbenchEnvironmentService as M}from"../../environment/common/environmentService.js";import{IExtensionService as b}from"../../extensions/common/extensions.js";import{IHostService as W}from"../../host/browser/host.js";import{IUserDataProfileManagementService as R,IUserDataProfileService as L}from"../common/userDataProfile.js";let f=class extends S{constructor(e,r,i,o,a,q,F,H,O,_,B){super();this.userDataProfilesService=e;this.userDataProfileService=r;this.hostService=i;this.dialogService=o;this.workspaceContextService=a;this.extensionService=q;this.environmentService=F;this.telemetryService=H;this.productService=O;this.requestService=_;this.logService=B;this._register(e.onDidChangeProfiles(c=>this.onDidChangeProfiles(c))),this._register(e.onDidResetWorkspaces(()=>this.onDidResetWorkspaces())),this._register(r.onDidChangeCurrentProfile(c=>this.onDidChangeCurrentProfile(c))),this._register(e.onDidChangeProfiles(c=>{const u=c.updated.find(m=>this.userDataProfileService.currentProfile.id===m.id);u&&this.changeCurrentProfile(u,s("reload message when updated","The current profile has been updated. Please reload to switch back to the updated profile"))}))}_serviceBrand;onDidChangeProfiles(e){if(e.removed.some(r=>r.id===this.userDataProfileService.currentProfile.id)){this.changeCurrentProfile(this.userDataProfilesService.defaultProfile,s("reload message when removed","The current profile has been removed. Please reload to switch back to default profile"));return}}onDidResetWorkspaces(){if(!this.userDataProfileService.currentProfile.isDefault){this.changeCurrentProfile(this.userDataProfilesService.defaultProfile,s("reload message when removed","The current profile has been removed. Please reload to switch back to default profile"));return}}async onDidChangeCurrentProfile(e){e.previous.isTransient&&await this.userDataProfilesService.cleanUpTransientProfiles()}async createProfile(e,r){return this.userDataProfilesService.createNamedProfile(e,r)}async createAndEnterProfile(e,r){const i=await this.userDataProfilesService.createNamedProfile(e,r,d(this.workspaceContextService.getWorkspace()));return await this.changeCurrentProfile(i),this.telemetryService.publicLog2("profileManagementActionExecuted",{id:"createAndEnterProfile"}),i}async createAndEnterTransientProfile(){const e=await this.userDataProfilesService.createTransientProfile(d(this.workspaceContextService.getWorkspace()));return await this.changeCurrentProfile(e),this.telemetryService.publicLog2("profileManagementActionExecuted",{id:"createAndEnterTransientProfile"}),e}async updateProfile(e,r){if(!this.userDataProfilesService.profiles.some(o=>o.id===e.id))throw new Error(`Profile ${e.name} does not exist`);if(e.isDefault)throw new Error(s("cannotRenameDefaultProfile","Cannot rename the default profile"));const i=await this.userDataProfilesService.updateProfile(e,r);return this.telemetryService.publicLog2("profileManagementActionExecuted",{id:"updateProfile"}),i}async removeProfile(e){if(!this.userDataProfilesService.profiles.some(r=>r.id===e.id))throw new Error(`Profile ${e.name} does not exist`);if(e.isDefault)throw new Error(s("cannotDeleteDefaultProfile","Cannot delete the default profile"));await this.userDataProfilesService.removeProfile(e),this.telemetryService.publicLog2("profileManagementActionExecuted",{id:"removeProfile"})}async switchProfile(e){const r=d(this.workspaceContextService.getWorkspace());if(!this.userDataProfilesService.profiles.some(i=>i.id===e.id))throw new Error(`Profile ${e.name} does not exist`);this.userDataProfileService.currentProfile.id!==e.id&&(await this.userDataProfilesService.setProfileForWorkspace(r,e),await this.changeCurrentProfile(e),this.telemetryService.publicLog2("profileManagementActionExecuted",{id:"switchProfile"}))}async getBuiltinProfileTemplates(){if(this.productService.profileTemplatesUrl)try{const e=await this.requestService.request({type:"GET",url:this.productService.profileTemplatesUrl},h.None);if(e.res.statusCode===200)return await k(e)||[];this.logService.error("Could not get profile templates.",e.res.statusCode)}catch(e){this.logService.error(e)}return[]}async changeCurrentProfile(e,r){const i=!!this.environmentService.remoteAuthority,o=this.userDataProfileService.currentProfile.id!==e.id||!D(this.userDataProfileService.currentProfile.useDefaultFlags,e.useDefaultFlags);if(o&&!i&&!await this.extensionService.stopExtensionHosts(s("switch profile","Switching to a profile.")))throw this.userDataProfilesService.profiles.some(a=>a.id===this.userDataProfileService.currentProfile.id)&&await this.userDataProfilesService.setProfileForWorkspace(d(this.workspaceContextService.getWorkspace()),this.userDataProfileService.currentProfile),new g;if(await this.userDataProfileService.updateCurrentProfile(e),o)if(i){const{confirmed:a}=await this.dialogService.confirm({message:r??s("reload message","Switching a profile requires reloading VS Code."),primaryButton:s("reload button","&&Reload")});a&&await this.hostService.reload()}else await this.extensionService.startExtensionHosts()}};f=P([t(0,A),t(1,L),t(2,W),t(3,w),t(4,T),t(5,b),t(6,M),t(7,U),t(8,x),t(9,y),t(10,C)],f),E(R,f,I.Eager);export{f as UserDataProfileManagementService};
