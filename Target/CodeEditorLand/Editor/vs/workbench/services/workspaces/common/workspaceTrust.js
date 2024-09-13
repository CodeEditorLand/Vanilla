var P=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var f=(u,i,e,t)=>{for(var r=t>1?void 0:t?O(i,e):i,s=u.length-1,o;s>=0;s--)(o=u[s])&&(r=(t?o(i,e,r):o(r))||r);return t&&r&&P(i,e,r),r},n=(u,i)=>(e,t)=>i(e,t,u);import{promiseWithResolvers as _}from"../../../../base/common/async.js";import{Emitter as l,Event as F}from"../../../../base/common/event.js";import{Disposable as T,DisposableStore as b,toDisposable as E}from"../../../../base/common/lifecycle.js";import{LinkedList as q}from"../../../../base/common/linkedList.js";import{Schemas as d}from"../../../../base/common/network.js";import{isWeb as C}from"../../../../base/common/platform.js";import{isEqualAuthority as A}from"../../../../base/common/resources.js";import{URI as D}from"../../../../base/common/uri.js";import{IConfigurationService as I}from"../../../../platform/configuration/common/configuration.js";import{IFileService as x}from"../../../../platform/files/common/files.js";import{InstantiationType as M,registerSingleton as K}from"../../../../platform/instantiation/common/extensions.js";import{IRemoteAuthorityResolverService as N}from"../../../../platform/remote/common/remoteAuthorityResolver.js";import{getRemoteAuthority as z}from"../../../../platform/remote/common/remoteHosts.js";import{IStorageService as L,StorageScope as v,StorageTarget as y}from"../../../../platform/storage/common/storage.js";import{IUriIdentityService as V}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{isVirtualResource as j}from"../../../../platform/workspace/common/virtualWorkspace.js";import{IWorkspaceContextService as B,WorkbenchState as G,isSavedWorkspace as R,isSingleFolderWorkspaceIdentifier as g,isTemporaryWorkspace as J,toWorkspaceIdentifier as S}from"../../../../platform/workspace/common/workspace.js";import{IWorkspaceTrustEnablementService as Y,IWorkspaceTrustManagementService as H,IWorkspaceTrustRequestService as X,WorkspaceTrustUriResponse as p}from"../../../../platform/workspace/common/workspaceTrust.js";import{Memento as Q}from"../../../common/memento.js";import{IWorkbenchEnvironmentService as w}from"../../environment/common/environmentService.js";const Z="security.workspace.trust.enabled",ge="security.workspace.trust.startupPrompt",we="security.workspace.trust.banner",U="security.workspace.trust.untrustedFiles",$="security.workspace.trust.emptyWindow",Ue="extensions.supportUntrustedWorkspaces",ee="content.trust.model.key";class te{constructor(i,e,t){this.originalWorkspace=i;this.canonicalFolderUris=e;this.canonicalConfiguration=t}get folders(){return this.originalWorkspace.folders.map((i,e)=>({index:i.index,name:i.name,toResource:i.toResource,uri:this.canonicalFolderUris[e]}))}get transient(){return this.originalWorkspace.transient}get configuration(){return this.canonicalConfiguration??this.originalWorkspace.configuration}get id(){return this.originalWorkspace.id}}let m=class extends T{constructor(e,t){super();this.configurationService=e;this.environmentService=t}_serviceBrand;isWorkspaceTrustEnabled(){return this.environmentService.disableWorkspaceTrust?!1:!!this.configurationService.getValue(Z)}};m=f([n(0,I),n(1,w)],m);let k=class extends T{constructor(e,t,r,s,o,a,c,W){super();this.configurationService=e;this.remoteAuthorityResolverService=t;this.storageService=r;this.uriIdentityService=s;this.environmentService=o;this.workspaceService=a;this.workspaceTrustEnablementService=c;this.fileService=W;this._canonicalUrisResolved=!1,this._canonicalWorkspace=this.workspaceService.getWorkspace(),{promise:this._workspaceResolvedPromise,resolve:this._workspaceResolvedPromiseResolve}=_(),{promise:this._workspaceTrustInitializedPromise,resolve:this._workspaceTrustInitializedPromiseResolve}=_(),this._storedTrustState=new se(C&&this.isEmptyWorkspace()?void 0:this.storageService),this._trustTransitionManager=this._register(new re),this._trustStateInfo=this.loadTrustInfo(),this._isTrusted=this.calculateWorkspaceTrust(),this.initializeWorkspaceTrust(),this.registerListeners()}_serviceBrand;storageKey=ee;_workspaceResolvedPromise;_workspaceResolvedPromiseResolve;_workspaceTrustInitializedPromise;_workspaceTrustInitializedPromiseResolve;_onDidChangeTrust=this._register(new l);onDidChangeTrust=this._onDidChangeTrust.event;_onDidChangeTrustedFolders=this._register(new l);onDidChangeTrustedFolders=this._onDidChangeTrustedFolders.event;_canonicalStartupFiles=[];_canonicalWorkspace;_canonicalUrisResolved;_isTrusted;_trustStateInfo;_remoteAuthority;_storedTrustState;_trustTransitionManager;initializeWorkspaceTrust(){this.resolveCanonicalUris().then(async()=>{this._canonicalUrisResolved=!0,await this.updateWorkspaceTrust()}).finally(()=>{this._workspaceResolvedPromiseResolve(),this.environmentService.remoteAuthority||this._workspaceTrustInitializedPromiseResolve()}),this.environmentService.remoteAuthority&&this.remoteAuthorityResolverService.resolveAuthority(this.environmentService.remoteAuthority).then(async e=>{this._remoteAuthority=e,await this.fileService.activateProvider(d.vscodeRemote),await this.updateWorkspaceTrust()}).finally(()=>{this._workspaceTrustInitializedPromiseResolve()}),this.isEmptyWorkspace()&&this._workspaceTrustInitializedPromise.then(()=>{this._storedTrustState.isEmptyWorkspaceTrusted===void 0&&(this._storedTrustState.isEmptyWorkspaceTrusted=this.isWorkspaceTrusted())})}registerListeners(){this._register(this.workspaceService.onDidChangeWorkspaceFolders(async()=>await this.updateWorkspaceTrust())),this._register(this.storageService.onDidChangeValue(v.APPLICATION,this.storageKey,this._register(new b))(async()=>{JSON.stringify(this._trustStateInfo)!==JSON.stringify(this.loadTrustInfo())&&(this._trustStateInfo=this.loadTrustInfo(),this._onDidChangeTrustedFolders.fire(),await this.updateWorkspaceTrust())}))}async getCanonicalUri(e){let t=e;if(this.environmentService.remoteAuthority&&e.scheme===d.vscodeRemote)t=await this.remoteAuthorityResolverService.getCanonicalURI(e);else if(e.scheme==="vscode-vfs"){const r=e.authority.indexOf("+");r!==-1&&(t=e.with({authority:e.authority.substr(0,r)}))}return t.with({query:null,fragment:null})}async resolveCanonicalUris(){const e=[];if(this.environmentService.filesToOpenOrCreate&&e.push(...this.environmentService.filesToOpenOrCreate),this.environmentService.filesToDiff&&e.push(...this.environmentService.filesToDiff),this.environmentService.filesToMerge&&e.push(...this.environmentService.filesToMerge),e.length){const o=e.filter(c=>!!c.fileUri).map(c=>c.fileUri),a=await Promise.all(o.map(c=>this.getCanonicalUri(c)));this._canonicalStartupFiles.push(...a.filter(c=>this._canonicalStartupFiles.every(W=>!this.uriIdentityService.extUri.isEqual(c,W))))}const t=this.workspaceService.getWorkspace().folders.map(o=>o.uri),r=await Promise.all(t.map(o=>this.getCanonicalUri(o)));let s=this.workspaceService.getWorkspace().configuration;s&&R(s,this.environmentService)&&(s=await this.getCanonicalUri(s)),this._canonicalWorkspace=new te(this.workspaceService.getWorkspace(),r,s)}loadTrustInfo(){const e=this.storageService.get(this.storageKey,v.APPLICATION);let t;try{e&&(t=JSON.parse(e))}catch{}return t||(t={uriTrustInfo:[]}),t.uriTrustInfo||(t.uriTrustInfo=[]),t.uriTrustInfo=t.uriTrustInfo.map(r=>({uri:D.revive(r.uri),trusted:r.trusted})),t.uriTrustInfo=t.uriTrustInfo.filter(r=>r.trusted),t}async saveTrustInfo(){this.storageService.store(this.storageKey,JSON.stringify(this._trustStateInfo),v.APPLICATION,y.MACHINE),this._onDidChangeTrustedFolders.fire(),await this.updateWorkspaceTrust()}getWorkspaceUris(){const e=this._canonicalWorkspace.folders.map(r=>r.uri),t=this._canonicalWorkspace.configuration;return t&&R(t,this.environmentService)&&e.push(t),e}calculateWorkspaceTrust(){return this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()?this._canonicalUrisResolved?this.environmentService.remoteAuthority&&this._remoteAuthority?.options?.isTrusted?this._remoteAuthority.options.isTrusted:this.isEmptyWorkspace()?this._storedTrustState.isEmptyWorkspaceTrusted!==void 0?this._storedTrustState.isEmptyWorkspaceTrusted:this._canonicalStartupFiles.length?this.getUrisTrust(this._canonicalStartupFiles):!!this.configurationService.getValue($):this.getUrisTrust(this.getWorkspaceUris()):!1:!0}async updateWorkspaceTrust(e){this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()&&(e===void 0&&(await this.resolveCanonicalUris(),e=this.calculateWorkspaceTrust()),this.isWorkspaceTrusted()!==e&&(this.isTrusted=e,await this._trustTransitionManager.participate(e),this._onDidChangeTrust.fire(e)))}getUrisTrust(e){let t=!0;for(const r of e){const{trusted:s}=this.doGetUriTrustInfo(r);if(!s)return t=s,t}return t}doGetUriTrustInfo(e){if(!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled())return{trusted:!0,uri:e};if(this.isTrustedVirtualResource(e))return{trusted:!0,uri:e};if(this.isTrustedByRemote(e))return{trusted:!0,uri:e};let t=!1,r=-1,s=e;for(const o of this._trustStateInfo.uriTrustInfo)if(this.uriIdentityService.extUri.isEqualOrParent(e,o.uri)){const a=o.uri.fsPath;a.length>r&&(r=a.length,t=o.trusted,s=o.uri)}return{trusted:t,uri:s}}async doSetUrisTrust(e,t){let r=!1;for(const s of e)if(t){if(this.isTrustedVirtualResource(s)||this.isTrustedByRemote(s))continue;this._trustStateInfo.uriTrustInfo.find(a=>this.uriIdentityService.extUri.isEqual(a.uri,s))||(this._trustStateInfo.uriTrustInfo.push({uri:s,trusted:!0}),r=!0)}else{const o=this._trustStateInfo.uriTrustInfo.length;this._trustStateInfo.uriTrustInfo=this._trustStateInfo.uriTrustInfo.filter(a=>!this.uriIdentityService.extUri.isEqual(a.uri,s)),o!==this._trustStateInfo.uriTrustInfo.length&&(r=!0)}r&&await this.saveTrustInfo()}isEmptyWorkspace(){if(this.workspaceService.getWorkbenchState()===G.EMPTY)return!0;const e=this.workspaceService.getWorkspace();return e?J(this.workspaceService.getWorkspace())&&e.folders.length===0:!1}isTrustedVirtualResource(e){return j(e)&&e.scheme!=="vscode-vfs"}isTrustedByRemote(e){return!this.environmentService.remoteAuthority||!this._remoteAuthority?!1:A(z(e),this._remoteAuthority.authority.authority)&&!!this._remoteAuthority.options?.isTrusted}set isTrusted(e){this._isTrusted=e,e||(this._storedTrustState.acceptsOutOfWorkspaceFiles=!1),this.isEmptyWorkspace()&&(this._storedTrustState.isEmptyWorkspaceTrusted=e)}get workspaceResolved(){return this._workspaceResolvedPromise}get workspaceTrustInitialized(){return this._workspaceTrustInitializedPromise}get acceptsOutOfWorkspaceFiles(){return this._storedTrustState.acceptsOutOfWorkspaceFiles}set acceptsOutOfWorkspaceFiles(e){this._storedTrustState.acceptsOutOfWorkspaceFiles=e}isWorkspaceTrusted(){return this._isTrusted}isWorkspaceTrustForced(){return!!(this.environmentService.remoteAuthority&&this._remoteAuthority&&this._remoteAuthority.options?.isTrusted!==void 0||this.getWorkspaceUris().filter(t=>!this.isTrustedVirtualResource(t)).length===0)}canSetParentFolderTrust(){const e=S(this._canonicalWorkspace);if(!g(e)||e.uri.scheme!==d.file&&e.uri.scheme!==d.vscodeRemote)return!1;const t=this.uriIdentityService.extUri.dirname(e.uri);return!this.uriIdentityService.extUri.isEqual(e.uri,t)}async setParentFolderTrust(e){if(this.canSetParentFolderTrust()){const t=S(this._canonicalWorkspace).uri,r=this.uriIdentityService.extUri.dirname(t);await this.setUrisTrust([r],e)}}canSetWorkspaceTrust(){if(this.environmentService.remoteAuthority&&(!this._remoteAuthority||this._remoteAuthority.options?.isTrusted!==void 0))return!1;if(this.isEmptyWorkspace())return!0;if(this.getWorkspaceUris().filter(s=>!this.isTrustedVirtualResource(s)).length===0)return!1;if(!this.isWorkspaceTrusted())return!0;const t=S(this._canonicalWorkspace);if(!g(t)||t.uri.scheme!==d.file&&t.uri.scheme!=="vscode-vfs")return!1;const r=this.doGetUriTrustInfo(t.uri);if(!r.trusted||!this.uriIdentityService.extUri.isEqual(t.uri,r.uri))return!1;if(this.canSetParentFolderTrust()){const s=this.uriIdentityService.extUri.dirname(t.uri);if(this.doGetUriTrustInfo(s).trusted)return!1}return!0}async setWorkspaceTrust(e){if(this.isEmptyWorkspace()){await this.updateWorkspaceTrust(e);return}const t=this.getWorkspaceUris();await this.setUrisTrust(t,e)}async getUriTrustInfo(e){return this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()?this.isTrustedByRemote(e)?{trusted:!0,uri:e}:this.doGetUriTrustInfo(await this.getCanonicalUri(e)):{trusted:!0,uri:e}}async setUrisTrust(e,t){this.doSetUrisTrust(await Promise.all(e.map(r=>this.getCanonicalUri(r))),t)}getTrustedUris(){return this._trustStateInfo.uriTrustInfo.map(e=>e.uri)}async setTrustedUris(e){this._trustStateInfo.uriTrustInfo=[];for(const t of e){const r=await this.getCanonicalUri(t),s=this.uriIdentityService.extUri.removeTrailingPathSeparator(r);let o=!1;for(const a of this._trustStateInfo.uriTrustInfo)if(this.uriIdentityService.extUri.isEqual(a.uri,s)){o=!0;break}o||this._trustStateInfo.uriTrustInfo.push({trusted:!0,uri:s})}await this.saveTrustInfo()}addWorkspaceTrustTransitionParticipant(e){return this._trustTransitionManager.addWorkspaceTrustTransitionParticipant(e)}};k=f([n(0,I),n(1,N),n(2,L),n(3,V),n(4,w),n(5,B),n(6,Y),n(7,x)],k);let h=class extends T{constructor(e,t){super();this.configurationService=e;this.workspaceTrustManagementService=t}_serviceBrand;_openFilesTrustRequestPromise;_openFilesTrustRequestResolver;_workspaceTrustRequestPromise;_workspaceTrustRequestResolver;_onDidInitiateOpenFilesTrustRequest=this._register(new l);onDidInitiateOpenFilesTrustRequest=this._onDidInitiateOpenFilesTrustRequest.event;_onDidInitiateWorkspaceTrustRequest=this._register(new l);onDidInitiateWorkspaceTrustRequest=this._onDidInitiateWorkspaceTrustRequest.event;_onDidInitiateWorkspaceTrustRequestOnStartup=this._register(new l);onDidInitiateWorkspaceTrustRequestOnStartup=this._onDidInitiateWorkspaceTrustRequestOnStartup.event;get untrustedFilesSetting(){return this.configurationService.getValue(U)}set untrustedFilesSetting(e){this.configurationService.updateValue(U,e)}async completeOpenFilesTrustRequest(e,t){this._openFilesTrustRequestResolver&&(e===p.Open&&(this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles=!0),t&&(e===p.Open&&(this.untrustedFilesSetting="open"),e===p.OpenInNewWindow&&(this.untrustedFilesSetting="newWindow")),this._openFilesTrustRequestResolver(e),this._openFilesTrustRequestResolver=void 0,this._openFilesTrustRequestPromise=void 0)}async requestOpenFilesTrust(e){if(!this.workspaceTrustManagementService.isWorkspaceTrusted())return p.Open;if((await Promise.all(e.map(r=>this.workspaceTrustManagementService.getUriTrustInfo(r)))).map(r=>r.trusted).every(r=>r))return p.Open;if(this.untrustedFilesSetting!=="prompt"){if(this.untrustedFilesSetting==="newWindow")return p.OpenInNewWindow;if(this.untrustedFilesSetting==="open")return p.Open}return this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles?p.Open:this._openFilesTrustRequestPromise?this._openFilesTrustRequestPromise:(this._openFilesTrustRequestPromise=new Promise(r=>{this._openFilesTrustRequestResolver=r}),this._onDidInitiateOpenFilesTrustRequest.fire(),this._openFilesTrustRequestPromise)}resolveWorkspaceTrustRequest(e){this._workspaceTrustRequestResolver&&(this._workspaceTrustRequestResolver(e??this.workspaceTrustManagementService.isWorkspaceTrusted()),this._workspaceTrustRequestResolver=void 0,this._workspaceTrustRequestPromise=void 0)}cancelWorkspaceTrustRequest(){this._workspaceTrustRequestResolver&&(this._workspaceTrustRequestResolver(void 0),this._workspaceTrustRequestResolver=void 0,this._workspaceTrustRequestPromise=void 0)}async completeWorkspaceTrustRequest(e){if(e===void 0||e===this.workspaceTrustManagementService.isWorkspaceTrusted()){this.resolveWorkspaceTrustRequest(e);return}F.once(this.workspaceTrustManagementService.onDidChangeTrust)(t=>this.resolveWorkspaceTrustRequest(t)),await this.workspaceTrustManagementService.setWorkspaceTrust(e)}async requestWorkspaceTrust(e){return this.workspaceTrustManagementService.isWorkspaceTrusted()?this.workspaceTrustManagementService.isWorkspaceTrusted():this._workspaceTrustRequestPromise?this._workspaceTrustRequestPromise:(this._workspaceTrustRequestPromise=new Promise(t=>{this._workspaceTrustRequestResolver=t}),this._onDidInitiateWorkspaceTrustRequest.fire(e),this._workspaceTrustRequestPromise)}requestWorkspaceTrustOnStartup(){this._workspaceTrustRequestPromise||(this._workspaceTrustRequestPromise=new Promise(e=>{this._workspaceTrustRequestResolver=e})),this._onDidInitiateWorkspaceTrustRequestOnStartup.fire()}};h=f([n(0,I),n(1,H)],h);class re extends T{participants=new q;addWorkspaceTrustTransitionParticipant(i){const e=this.participants.push(i);return E(()=>e())}async participate(i){for(const e of this.participants)await e.participate(i)}dispose(){this.participants.clear(),super.dispose()}}class se{_memento;_mementoObject;_acceptsOutOfWorkspaceFilesKey="acceptsOutOfWorkspaceFiles";_isEmptyWorkspaceTrustedKey="isEmptyWorkspaceTrusted";constructor(i){i?(this._memento=new Q("workspaceTrust",i),this._mementoObject=this._memento.getMemento(v.WORKSPACE,y.MACHINE)):this._mementoObject={}}get acceptsOutOfWorkspaceFiles(){return this._mementoObject[this._acceptsOutOfWorkspaceFilesKey]??!1}set acceptsOutOfWorkspaceFiles(i){this._mementoObject[this._acceptsOutOfWorkspaceFilesKey]=i,this._memento?.saveMemento()}get isEmptyWorkspaceTrusted(){return this._mementoObject[this._isEmptyWorkspaceTrustedKey]}set isEmptyWorkspaceTrusted(i){this._mementoObject[this._isEmptyWorkspaceTrustedKey]=i,this._memento?.saveMemento()}}K(X,h,M.Delayed);export{te as CanonicalWorkspace,we as WORKSPACE_TRUST_BANNER,$ as WORKSPACE_TRUST_EMPTY_WINDOW,Z as WORKSPACE_TRUST_ENABLED,Ue as WORKSPACE_TRUST_EXTENSION_SUPPORT,ge as WORKSPACE_TRUST_STARTUP_PROMPT,ee as WORKSPACE_TRUST_STORAGE_KEY,U as WORKSPACE_TRUST_UNTRUSTED_FILES,m as WorkspaceTrustEnablementService,k as WorkspaceTrustManagementService,h as WorkspaceTrustRequestService};
