var ce=Object.defineProperty;var ge=Object.getOwnPropertyDescriptor;var L=(m,h,e,i)=>{for(var t=i>1?void 0:i?ge(h,e):h,r=m.length-1,n;r>=0;r--)(n=m[r])&&(t=(i?n(h,e,t):n(t))||t);return i&&t&&ce(h,e,t),t},I=(m,h)=>(e,i)=>h(e,i,m);import{runWhenWindowIdle as ue}from"../../../../base/browser/dom.js";import{mainWindow as le}from"../../../../base/browser/window.js";import{equals as de,delta as E,distinct as Q}from"../../../../base/common/arrays.js";import{Barrier as $,Delayer as fe,Promises as Y,Queue as pe}from"../../../../base/common/async.js";import{toErrorMessage as he}from"../../../../base/common/errorMessage.js";import{Emitter as P,Event as Ce}from"../../../../base/common/event.js";import{Disposable as M,DisposableStore as me}from"../../../../base/common/lifecycle.js";import{ResourceMap as W}from"../../../../base/common/map.js";import{equals as z}from"../../../../base/common/objects.js";import{mark as R}from"../../../../base/common/performance.js";import{isUndefined as Se}from"../../../../base/common/types.js";import{URI as G}from"../../../../base/common/uri.js";import{localize as X}from"../../../../nls.js";import{ConfigurationTarget as c,ConfigurationTargetToString as ke,IConfigurationService as ve,isConfigurationOverrides as K,isConfigurationUpdateOverrides as Ie}from"../../../../platform/configuration/common/configuration.js";import{ConfigurationChangeEvent as we,ConfigurationModel as k,mergeChanges as Z}from"../../../../platform/configuration/common/configurationModels.js";import{ConfigurationScope as D,Extensions as N,OVERRIDE_PROPERTY_PATTERN as We,allSettings as v,applicationSettings as ye,configurationDefaultsSchemaId as Ee,keyFromOverrideIdentifiers as Pe,machineOverridableSettings as b,machineSettings as ee,resourceLanguageSettingsSchemaId as Re,resourceSettings as F,windowSettings as O}from"../../../../platform/configuration/common/configurationRegistry.js";import{NullPolicyConfiguration as Fe,PolicyConfiguration as Ue}from"../../../../platform/configuration/common/configurations.js";import{Extensions as _e}from"../../../../platform/jsonschemas/common/jsonContributionRegistry.js";import{NullPolicyService as De}from"../../../../platform/policy/common/policy.js";import{Registry as U}from"../../../../platform/registry/common/platform.js";import{Workspace as be,IWorkspaceContextService as Oe,WorkbenchState as C,isSingleFolderWorkspaceIdentifier as ie,isWorkspaceFolder as Ae,isWorkspaceIdentifier as te,toWorkspaceFolder as Te}from"../../../../platform/workspace/common/workspace.js";import{IWorkspaceTrustManagementService as Le}from"../../../../platform/workspace/common/workspaceTrust.js";import{getStoredWorkspaceFolder as Me,isStoredWorkspaceFolder as Ne,toWorkspaceFolders as J}from"../../../../platform/workspaces/common/workspaces.js";import{workbenchConfigurationNodeBase as xe}from"../../../common/configuration.js";import{Extensions as Ve,WorkbenchPhase as je,registerWorkbenchContribution2 as ze}from"../../../common/contributions.js";import{IWorkbenchAssignmentService as Ke}from"../../assignment/common/assignmentService.js";import{IWorkbenchEnvironmentService as Je}from"../../environment/common/environmentService.js";import{IExtensionService as re}from"../../extensions/common/extensions.js";import{ILifecycleService as Be,LifecyclePhase as B}from"../../lifecycle/common/lifecycle.js";import{APPLY_ALL_PROFILES_SETTING as w,FOLDER_CONFIG_FOLDER_NAME as qe,LOCAL_MACHINE_PROFILE_SCOPES as He,LOCAL_MACHINE_SCOPES as Qe,PROFILE_SCOPES as $e,defaultSettingsSchemaId as Ye,folderSettingsSchemaId as Ge,machineSettingsSchemaId as Xe,profileSettingsSchemaId as Ze,userSettingsSchemaId as ei,workspaceSettingsSchemaId as ii}from"../common/configuration.js";import{ConfigurationEditing as ti,EditableConfigurationTarget as p}from"../common/configurationEditing.js";import{Configuration as oe}from"../common/configurationModels.js";import{IJSONEditingService as ri}from"../common/jsonEditing.js";import{ApplicationConfiguration as oi,DefaultConfiguration as ni,FolderConfiguration as ai,RemoteUserConfiguration as si,UserConfiguration as ci,WorkspaceConfiguration as gi}from"./configuration.js";function ne(m,h){return m.isDefault||m.useDefaultFlags?.settings?h?Qe:void 0:h?He:$e}class q extends be{initialized=!1}class qi extends M{constructor({remoteAuthority:e,configurationCache:i},t,r,n,o,s,g,a,d){super();this.userDataProfileService=r;this.userDataProfilesService=n;this.fileService=o;this.remoteAgentService=s;this.uriIdentityService=g;this.logService=a;if(this.configurationRegistry=U.as(N.Configuration),this.initRemoteUserConfigurationBarrier=new $,this.completeWorkspaceBarrier=new $,this.defaultConfiguration=this._register(new ni(i,t,a)),this.policyConfiguration=d instanceof De?new Fe:this._register(new Ue(this.defaultConfiguration,d,a)),this.configurationCache=i,this._configuration=new oe(this.defaultConfiguration.configurationModel,this.policyConfiguration.configurationModel,k.createEmptyModel(a),k.createEmptyModel(a),k.createEmptyModel(a),k.createEmptyModel(a),new W,k.createEmptyModel(a),new W,this.workspace,a),this.applicationConfigurationDisposables=this._register(new me),this.createApplicationConfiguration(),this.localUserConfiguration=this._register(new ci(r.currentProfile.settingsResource,r.currentProfile.tasksResource,{scopes:ne(r.currentProfile,!!e)},o,g,a)),this.cachedFolderConfigs=new W,this._register(this.localUserConfiguration.onDidChangeConfiguration(u=>this.onLocalUserConfigurationChanged(u))),e){const u=this.remoteUserConfiguration=this._register(new si(e,i,o,g,s,a));this._register(u.onDidInitialize(S=>{this._register(u.onDidChangeConfiguration(y=>this.onRemoteUserConfigurationChanged(y))),this.onRemoteUserConfigurationChanged(S),this.initRemoteUserConfigurationBarrier.open()}))}else this.initRemoteUserConfigurationBarrier.open();this.workspaceConfiguration=this._register(new gi(i,o,g,a)),this._register(this.workspaceConfiguration.onDidUpdateConfiguration(u=>{this.onWorkspaceConfigurationChanged(u).then(()=>{this.workspace.initialized=this.workspaceConfiguration.initialized,this.checkAndMarkWorkspaceComplete(u)})})),this._register(this.defaultConfiguration.onDidChangeConfiguration(({properties:u,defaults:S})=>this.onDefaultConfigurationChanged(S,u))),this._register(this.policyConfiguration.onDidChangeConfiguration(u=>this.onPolicyConfigurationChanged(u))),this._register(r.onDidChangeCurrentProfile(u=>this.onUserDataProfileChanged(u))),this.workspaceEditingQueue=new pe}_serviceBrand;workspace;initRemoteUserConfigurationBarrier;completeWorkspaceBarrier;configurationCache;_configuration;initialized=!1;defaultConfiguration;policyConfiguration;applicationConfiguration=null;applicationConfigurationDisposables;localUserConfiguration;remoteUserConfiguration=null;workspaceConfiguration;cachedFolderConfigs;workspaceEditingQueue;_onDidChangeConfiguration=this._register(new P);onDidChangeConfiguration=this._onDidChangeConfiguration.event;_onWillChangeWorkspaceFolders=this._register(new P);onWillChangeWorkspaceFolders=this._onWillChangeWorkspaceFolders.event;_onDidChangeWorkspaceFolders=this._register(new P);onDidChangeWorkspaceFolders=this._onDidChangeWorkspaceFolders.event;_onDidChangeWorkspaceName=this._register(new P);onDidChangeWorkspaceName=this._onDidChangeWorkspaceName.event;_onDidChangeWorkbenchState=this._register(new P);onDidChangeWorkbenchState=this._onDidChangeWorkbenchState.event;isWorkspaceTrusted=!0;_restrictedSettings={default:[]};get restrictedSettings(){return this._restrictedSettings}_onDidChangeRestrictedSettings=this._register(new P);onDidChangeRestrictedSettings=this._onDidChangeRestrictedSettings.event;configurationRegistry;instantiationService;configurationEditing;createApplicationConfiguration(){this.applicationConfigurationDisposables.clear(),this.userDataProfileService.currentProfile.isDefault||this.userDataProfileService.currentProfile.useDefaultFlags?.settings?this.applicationConfiguration=null:(this.applicationConfiguration=this.applicationConfigurationDisposables.add(this._register(new oi(this.userDataProfilesService,this.fileService,this.uriIdentityService,this.logService))),this.applicationConfigurationDisposables.add(this.applicationConfiguration.onDidChangeConfiguration(e=>this.onApplicationConfigurationChanged(e))))}async getCompleteWorkspace(){return await this.completeWorkspaceBarrier.wait(),this.getWorkspace()}getWorkspace(){return this.workspace}getWorkbenchState(){return this.workspace.configuration?C.WORKSPACE:this.workspace.folders.length===1?C.FOLDER:C.EMPTY}getWorkspaceFolder(e){return this.workspace.getFolder(e)}addFolders(e,i){return this.updateFolders(e,[],i)}removeFolders(e){return this.updateFolders([],e)}async updateFolders(e,i,t){return this.workspaceEditingQueue.queue(()=>this.doUpdateFolders(e,i,t))}isInsideWorkspace(e){return!!this.getWorkspaceFolder(e)}isCurrentWorkspace(e){switch(this.getWorkbenchState()){case C.FOLDER:{let i;return G.isUri(e)?i=e:ie(e)&&(i=e.uri),G.isUri(i)&&this.uriIdentityService.extUri.isEqual(i,this.workspace.folders[0].uri)}case C.WORKSPACE:return te(e)&&this.workspace.id===e.id}return!1}async doUpdateFolders(e,i,t){if(this.getWorkbenchState()!==C.WORKSPACE||e.length+i.length===0)return Promise.resolve(void 0);let r=!1,n=this.getWorkspace().folders,o=n.map(s=>s.raw).filter((s,g)=>Ne(s)?!this.contains(i,n[g].uri):!0);if(r=n.length!==o.length,e.length){const s=this.getWorkspace().configuration,g=this.uriIdentityService.extUri.dirname(s);n=J(o,s,this.uriIdentityService.extUri);const a=n.map(u=>u.uri),d=[];for(const u of e){const S=u.uri;if(!this.contains(a,S)){try{if(!(await this.fileService.stat(S)).isDirectory)continue}catch{}d.push(Me(S,!1,u.name,g,this.uriIdentityService.extUri))}}d.length>0&&(r=!0,typeof t=="number"&&t>=0&&t<o.length?(o=o.slice(0),o.splice(t,0,...d)):o=[...o,...d])}return r?this.setFolders(o):Promise.resolve(void 0)}async setFolders(e){if(!this.instantiationService)throw new Error("Cannot update workspace folders because workspace service is not yet ready to accept writes.");return await this.instantiationService.invokeFunction(i=>this.workspaceConfiguration.setFolders(e,i.get(ri))),this.onWorkspaceConfigurationChanged(!1)}contains(e,i){return e.some(t=>this.uriIdentityService.extUri.isEqual(t,i))}getConfigurationData(){return this._configuration.toData()}getValue(e,i){const t=typeof e=="string"?e:void 0,r=K(e)?e:K(i)?i:void 0;return this._configuration.getValue(t,r)}async updateValue(e,i,t,r,n){const o=Ie(t)?t:K(t)?{resource:t.resource,overrideIdentifiers:t.overrideIdentifier?[t.overrideIdentifier]:void 0}:void 0,s=o?r:t,g=s?[s]:[];if(o?.overrideIdentifiers&&(o.overrideIdentifiers=Q(o.overrideIdentifiers),o.overrideIdentifiers=o.overrideIdentifiers.length?o.overrideIdentifiers:void 0),!g.length){if(o?.overrideIdentifiers&&o.overrideIdentifiers.length>1)throw new Error("Configuration Target is required while updating the value for multiple override identifiers");const a=this.inspect(e,{resource:o?.resource,overrideIdentifier:o?.overrideIdentifiers?o.overrideIdentifiers[0]:void 0});g.push(...this.deriveConfigurationTargets(e,i,a)),z(i,a.defaultValue)&&g.length===1&&(g[0]===c.USER||g[0]===c.USER_LOCAL)&&(i=void 0)}await Y.settled(g.map(a=>this.writeConfigurationValue(e,i,a,o,n)))}async reloadConfiguration(e){if(e===void 0){this.reloadDefaultConfiguration();const i=await this.reloadApplicationConfiguration(!0),{local:t,remote:r}=await this.reloadUserConfiguration();await this.reloadWorkspaceConfiguration(),await this.loadConfiguration(i,t,r,!0);return}if(Ae(e)){await this.reloadWorkspaceFolderConfiguration(e);return}switch(e){case c.DEFAULT:this.reloadDefaultConfiguration();return;case c.USER:{const{local:i,remote:t}=await this.reloadUserConfiguration();await this.loadConfiguration(this._configuration.applicationConfiguration,i,t,!0);return}case c.USER_LOCAL:await this.reloadLocalUserConfiguration();return;case c.USER_REMOTE:await this.reloadRemoteUserConfiguration();return;case c.WORKSPACE:case c.WORKSPACE_FOLDER:await this.reloadWorkspaceConfiguration();return}}hasCachedConfigurationDefaultsOverrides(){return this.defaultConfiguration.hasCachedConfigurationDefaultsOverrides()}inspect(e,i){return this._configuration.inspect(e,i)}keys(){return this._configuration.keys()}async whenRemoteConfigurationLoaded(){await this.initRemoteUserConfigurationBarrier.wait()}async initialize(e){R("code/willInitWorkspaceService");const i=this.initialized;this.initialized=!1;const t=await this.createWorkspace(e);await this.updateWorkspaceAndInitializeConfiguration(t,i),this.checkAndMarkWorkspaceComplete(!1),R("code/didInitWorkspaceService")}updateWorkspaceTrust(e){if(this.isWorkspaceTrusted!==e){this.isWorkspaceTrusted=e;const i=this._configuration.toData(),t=[];for(const n of this.workspace.folders){const o=this.cachedFolderConfigs.get(n.uri);let s;o&&(s=o.updateWorkspaceTrust(this.isWorkspaceTrusted),this._configuration.updateFolderConfiguration(n.uri,s)),t.push(s)}this.getWorkbenchState()===C.FOLDER?t[0]&&this._configuration.updateWorkspaceConfiguration(t[0]):this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.updateWorkspaceTrust(this.isWorkspaceTrusted)),this.updateRestrictedSettings();let r=[];this.restrictedSettings.userLocal&&r.push(...this.restrictedSettings.userLocal),this.restrictedSettings.userRemote&&r.push(...this.restrictedSettings.userRemote),this.restrictedSettings.workspace&&r.push(...this.restrictedSettings.workspace),this.restrictedSettings.workspaceFolder?.forEach(n=>r.push(...n)),r=Q(r),r.length&&this.triggerConfigurationChange({keys:r,overrides:[]},{data:i,workspace:this.workspace},c.WORKSPACE)}}acquireInstantiationService(e){this.instantiationService=e}isSettingAppliedForAllProfiles(e){if(this.configurationRegistry.getConfigurationProperties()[e]?.scope===D.APPLICATION)return!0;const i=this.getValue(w)??[];return Array.isArray(i)&&i.includes(e)}async createWorkspace(e){return te(e)?this.createMultiFolderWorkspace(e):ie(e)?this.createSingleFolderWorkspace(e):this.createEmptyWorkspace(e)}async createMultiFolderWorkspace(e){await this.workspaceConfiguration.initialize({id:e.id,configPath:e.configPath},this.isWorkspaceTrusted);const i=e.configPath,t=J(this.workspaceConfiguration.getFolders(),i,this.uriIdentityService.extUri),r=e.id,n=new q(r,t,this.workspaceConfiguration.isTransient(),i,o=>this.uriIdentityService.extUri.ignorePathCasing(o));return n.initialized=this.workspaceConfiguration.initialized,n}createSingleFolderWorkspace(e){const i=new q(e.id,[Te(e.uri)],!1,null,t=>this.uriIdentityService.extUri.ignorePathCasing(t));return i.initialized=!0,i}createEmptyWorkspace(e){const i=new q(e.id,[],!1,null,t=>this.uriIdentityService.extUri.ignorePathCasing(t));return i.initialized=!0,Promise.resolve(i)}checkAndMarkWorkspaceComplete(e){!this.completeWorkspaceBarrier.isOpen()&&this.workspace.initialized&&(this.completeWorkspaceBarrier.open(),this.validateWorkspaceFoldersAndReload(e))}async updateWorkspaceAndInitializeConfiguration(e,i){const t=!!this.workspace;let r,n,o=[];if(t?(r=this.getWorkbenchState(),n=this.workspace.configuration?this.workspace.configuration.fsPath:void 0,o=this.workspace.folders,this.workspace.update(e)):this.workspace=e,await this.initializeConfiguration(i),t){const s=this.getWorkbenchState();r&&s!==r&&this._onDidChangeWorkbenchState.fire(s);const g=this.workspace.configuration?this.workspace.configuration.fsPath:void 0;(n&&g!==n||s!==r)&&this._onDidChangeWorkspaceName.fire();const a=this.compareFolders(o,this.workspace.folders);a&&(a.added.length||a.removed.length||a.changed.length)&&(await this.handleWillChangeWorkspaceFolders(a,!1),this._onDidChangeWorkspaceFolders.fire(a))}this.localUserConfiguration.hasTasksLoaded||this._register(ue(le,()=>this.reloadLocalUserConfiguration(!1,this._configuration.localUserConfiguration)))}compareFolders(e,i){const t={added:[],removed:[],changed:[]};t.added=i.filter(r=>!e.some(n=>r.uri.toString()===n.uri.toString()));for(let r=0;r<e.length;r++){const n=e[r];let o=0;for(o=0;o<i.length&&n.uri.toString()!==i[o].uri.toString();o++);o<i.length?(r!==o||n.name!==i[o].name)&&t.changed.push(n):t.removed.push(n)}return t}async initializeConfiguration(e){await this.defaultConfiguration.initialize();const i=this.policyConfiguration.initialize(),t=this.applicationConfiguration?this.applicationConfiguration.initialize():Promise.resolve(k.createEmptyModel(this.logService)),r=async()=>{R("code/willInitUserConfiguration");const g=await Promise.all([this.localUserConfiguration.initialize(),this.remoteUserConfiguration?this.remoteUserConfiguration.initialize():Promise.resolve(k.createEmptyModel(this.logService))]);if(this.applicationConfiguration){const a=await t;g[0]=this.localUserConfiguration.reparse({exclude:a.getValue(w)})}return R("code/didInitUserConfiguration"),g},[,n,[o,s]]=await Promise.all([i,t,r()]);R("code/willInitWorkspaceConfiguration"),await this.loadConfiguration(n,o,s,e),R("code/didInitWorkspaceConfiguration")}reloadDefaultConfiguration(){this.onDefaultConfigurationChanged(this.defaultConfiguration.reload())}async reloadApplicationConfiguration(e){if(!this.applicationConfiguration)return k.createEmptyModel(this.logService);const i=await this.applicationConfiguration.loadConfiguration();return e||this.onApplicationConfigurationChanged(i),i}async reloadUserConfiguration(){const[e,i]=await Promise.all([this.reloadLocalUserConfiguration(!0),this.reloadRemoteUserConfiguration(!0)]);return{local:e,remote:i}}async reloadLocalUserConfiguration(e,i){const t=await this.localUserConfiguration.reload(i);return e||this.onLocalUserConfigurationChanged(t),t}async reloadRemoteUserConfiguration(e){if(this.remoteUserConfiguration){const i=await this.remoteUserConfiguration.reload();return e||this.onRemoteUserConfigurationChanged(i),i}return k.createEmptyModel(this.logService)}async reloadWorkspaceConfiguration(){const e=this.getWorkbenchState();if(e===C.FOLDER)return this.onWorkspaceFolderConfigurationChanged(this.workspace.folders[0]);if(e===C.WORKSPACE)return this.workspaceConfiguration.reload().then(()=>this.onWorkspaceConfigurationChanged(!1))}reloadWorkspaceFolderConfiguration(e){return this.onWorkspaceFolderConfigurationChanged(e)}async loadConfiguration(e,i,t,r){this.cachedFolderConfigs=new W;const n=this.workspace.folders,o=await this.loadFolderConfigurations(n),s=this.getWorkspaceConfigurationModel(o),g=new W;o.forEach((d,u)=>g.set(n[u].uri,d));const a=this._configuration;if(this._configuration=new oe(this.defaultConfiguration.configurationModel,this.policyConfiguration.configurationModel,e,i,t,s,g,k.createEmptyModel(this.logService),new W,this.workspace,this.logService),this.initialized=!0,r){const d=this._configuration.compare(a);this.triggerConfigurationChange(d,{data:a.toData(),workspace:this.workspace},c.WORKSPACE)}this.updateRestrictedSettings()}getWorkspaceConfigurationModel(e){switch(this.getWorkbenchState()){case C.FOLDER:return e[0];case C.WORKSPACE:return this.workspaceConfiguration.getConfiguration();default:return k.createEmptyModel(this.logService)}}onUserDataProfileChanged(e){e.join((async()=>{const i=[];i.push(this.localUserConfiguration.reset(e.profile.settingsResource,e.profile.tasksResource,{scopes:ne(e.profile,!!this.remoteUserConfiguration)})),(e.previous.isDefault!==e.profile.isDefault||!!e.previous.useDefaultFlags?.settings!=!!e.profile.useDefaultFlags?.settings)&&(this.createApplicationConfiguration(),this.applicationConfiguration&&i.push(this.reloadApplicationConfiguration(!0)));let[t,r]=await Promise.all(i);r=r??this._configuration.applicationConfiguration,this.applicationConfiguration&&(t=this.localUserConfiguration.reparse({exclude:r.getValue(w)})),await this.loadConfiguration(r,t,this._configuration.remoteUserConfiguration,!0)})())}onDefaultConfigurationChanged(e,i){if(this.workspace){const t=this._configuration.toData(),r=this._configuration.compareAndUpdateDefaultConfiguration(e,i);if(this.applicationConfiguration&&this._configuration.updateApplicationConfiguration(this.applicationConfiguration.reparse()),this.remoteUserConfiguration&&(this._configuration.updateLocalUserConfiguration(this.localUserConfiguration.reparse()),this._configuration.updateRemoteUserConfiguration(this.remoteUserConfiguration.reparse())),this.getWorkbenchState()===C.FOLDER){const n=this.cachedFolderConfigs.get(this.workspace.folders[0].uri);n&&(this._configuration.updateWorkspaceConfiguration(n.reparse()),this._configuration.updateFolderConfiguration(this.workspace.folders[0].uri,n.reparse()))}else{this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.reparseWorkspaceSettings());for(const n of this.workspace.folders){const o=this.cachedFolderConfigs.get(n.uri);o&&this._configuration.updateFolderConfiguration(n.uri,o.reparse())}}this.triggerConfigurationChange(r,{data:t,workspace:this.workspace},c.DEFAULT),this.updateRestrictedSettings()}}onPolicyConfigurationChanged(e){const i={data:this._configuration.toData(),workspace:this.workspace},t=this._configuration.compareAndUpdatePolicyConfiguration(e);this.triggerConfigurationChange(t,i,c.DEFAULT)}onApplicationConfigurationChanged(e){const i={data:this._configuration.toData(),workspace:this.workspace},t=this._configuration.applicationConfiguration.getValue(w)??[],r=this._configuration.compareAndUpdateApplicationConfiguration(e),n=this.getValue(w)??[],o=this.configurationRegistry.getConfigurationProperties(),s=[];for(const g of r.keys)if(o[g]?.scope===D.APPLICATION){if(s.push(g),g===w){for(const a of t)n.includes(a)||s.push(a);for(const a of n)t.includes(a)||s.push(a)}}else n.includes(g)&&s.push(g);r.keys=s,r.keys.includes(w)&&this._configuration.updateLocalUserConfiguration(this.localUserConfiguration.reparse({exclude:n})),this.triggerConfigurationChange(r,i,c.USER)}onLocalUserConfigurationChanged(e){const i={data:this._configuration.toData(),workspace:this.workspace},t=this._configuration.compareAndUpdateLocalUserConfiguration(e);this.triggerConfigurationChange(t,i,c.USER)}onRemoteUserConfigurationChanged(e){const i={data:this._configuration.toData(),workspace:this.workspace},t=this._configuration.compareAndUpdateRemoteUserConfiguration(e);this.triggerConfigurationChange(t,i,c.USER)}async onWorkspaceConfigurationChanged(e){if(this.workspace&&this.workspace.configuration){let i=J(this.workspaceConfiguration.getFolders(),this.workspace.configuration,this.uriIdentityService.extUri);if(this.workspace.initialized){const{added:t,removed:r,changed:n}=this.compareFolders(this.workspace.folders,i);t.length||r.length||n.length?i=await this.toValidWorkspaceFolders(i):i=this.workspace.folders}await this.updateWorkspaceConfiguration(i,this.workspaceConfiguration.getConfiguration(),e)}}updateRestrictedSettings(){const e=[],i=this.configurationRegistry.getConfigurationProperties(),t=Object.keys(i).filter(l=>i[l].restricted).sort((l,f)=>l.localeCompare(f)),r=E(t,this._restrictedSettings.default,(l,f)=>l.localeCompare(f));e.push(...r.added,...r.removed);const n=(this.applicationConfiguration?.getRestrictedSettings()||[]).sort((l,f)=>l.localeCompare(f)),o=E(n,this._restrictedSettings.application||[],(l,f)=>l.localeCompare(f));e.push(...o.added,...o.removed);const s=this.localUserConfiguration.getRestrictedSettings().sort((l,f)=>l.localeCompare(f)),g=E(s,this._restrictedSettings.userLocal||[],(l,f)=>l.localeCompare(f));e.push(...g.added,...g.removed);const a=(this.remoteUserConfiguration?.getRestrictedSettings()||[]).sort((l,f)=>l.localeCompare(f)),d=E(a,this._restrictedSettings.userRemote||[],(l,f)=>l.localeCompare(f));e.push(...d.added,...d.removed);const u=new W;for(const l of this.workspace.folders){const x=(this.cachedFolderConfigs.get(l.uri)?.getRestrictedSettings()||[]).sort((V,j)=>V.localeCompare(j));x.length&&u.set(l.uri,x);const se=this._restrictedSettings.workspaceFolder?.get(l.uri)||[],H=E(x,se,(V,j)=>V.localeCompare(j));e.push(...H.added,...H.removed)}const S=this.getWorkbenchState()===C.WORKSPACE?this.workspaceConfiguration.getRestrictedSettings().sort((l,f)=>l.localeCompare(f)):this.workspace.folders[0]?u.get(this.workspace.folders[0].uri)||[]:[],y=E(S,this._restrictedSettings.workspace||[],(l,f)=>l.localeCompare(f));e.push(...y.added,...y.removed),e.length&&(this._restrictedSettings={default:t,application:n.length?n:void 0,userLocal:s.length?s:void 0,userRemote:a.length?a:void 0,workspace:S.length?S:void 0,workspaceFolder:u.size?u:void 0},this._onDidChangeRestrictedSettings.fire(this.restrictedSettings))}async updateWorkspaceConfiguration(e,i,t){const r={data:this._configuration.toData(),workspace:this.workspace},n=this._configuration.compareAndUpdateWorkspaceConfiguration(i),o=this.compareFolders(this.workspace.folders,e);if(o.added.length||o.removed.length||o.changed.length){this.workspace.folders=e;const s=await this.onFoldersChanged();await this.handleWillChangeWorkspaceFolders(o,t),this.triggerConfigurationChange(s,r,c.WORKSPACE_FOLDER),this._onDidChangeWorkspaceFolders.fire(o)}else this.triggerConfigurationChange(n,r,c.WORKSPACE);this.updateRestrictedSettings()}async handleWillChangeWorkspaceFolders(e,i){const t=[];this._onWillChangeWorkspaceFolders.fire({join(r){t.push(r)},changes:e,fromCache:i});try{await Y.settled(t)}catch{}}async onWorkspaceFolderConfigurationChanged(e){const[i]=await this.loadFolderConfigurations([e]),t={data:this._configuration.toData(),workspace:this.workspace},r=this._configuration.compareAndUpdateFolderConfiguration(e.uri,i);if(this.getWorkbenchState()===C.FOLDER){const n=this._configuration.compareAndUpdateWorkspaceConfiguration(i);this.triggerConfigurationChange(Z(r,n),t,c.WORKSPACE)}else this.triggerConfigurationChange(r,t,c.WORKSPACE_FOLDER);this.updateRestrictedSettings()}async onFoldersChanged(){const e=[];for(const t of this.cachedFolderConfigs.keys())this.workspace.folders.filter(r=>r.uri.toString()===t.toString())[0]||(this.cachedFolderConfigs.get(t).dispose(),this.cachedFolderConfigs.delete(t),e.push(this._configuration.compareAndDeleteFolderConfiguration(t)));const i=this.workspace.folders.filter(t=>!this.cachedFolderConfigs.has(t.uri));return i.length&&(await this.loadFolderConfigurations(i)).forEach((r,n)=>{e.push(this._configuration.compareAndUpdateFolderConfiguration(i[n].uri,r))}),Z(...e)}loadFolderConfigurations(e){return Promise.all([...e.map(i=>{let t=this.cachedFolderConfigs.get(i.uri);return t||(t=new ai(!this.initialized,i,qe,this.getWorkbenchState(),this.isWorkspaceTrusted,this.fileService,this.uriIdentityService,this.logService,this.configurationCache),this._register(t.onDidChange(()=>this.onWorkspaceFolderConfigurationChanged(i))),this.cachedFolderConfigs.set(i.uri,this._register(t))),t.loadConfiguration()})])}async validateWorkspaceFoldersAndReload(e){const i=await this.toValidWorkspaceFolders(this.workspace.folders),{removed:t}=this.compareFolders(this.workspace.folders,i);t.length&&await this.updateWorkspaceConfiguration(i,this.workspaceConfiguration.getConfiguration(),e)}async toValidWorkspaceFolders(e){const i=[];for(const t of e){try{if(!(await this.fileService.stat(t.uri)).isDirectory)continue}catch(r){this.logService.warn(`Ignoring the error while validating workspace folder ${t.uri.toString()} - ${he(r)}`)}i.push(t)}return i}async writeConfigurationValue(e,i,t,r,n){if(!this.instantiationService)throw new Error("Cannot write configuration because the configuration service is not yet ready to accept writes.");if(t===c.DEFAULT)throw new Error("Invalid configuration target");if(t===c.MEMORY){const s={data:this._configuration.toData(),workspace:this.workspace};this._configuration.updateValue(e,i,r),this.triggerConfigurationChange({keys:r?.overrideIdentifiers?.length?[Pe(r.overrideIdentifiers),e]:[e],overrides:r?.overrideIdentifiers?.length?r.overrideIdentifiers.map(g=>[g,[e]]):[]},s,t);return}const o=this.toEditableConfigurationTarget(t,e);if(!o)throw new Error("Invalid configuration target");if(o===p.USER_REMOTE&&!this.remoteUserConfiguration)throw new Error("Invalid configuration target");if(r?.overrideIdentifiers?.length&&r.overrideIdentifiers.length>1){const s=this.getConfigurationModelForEditableConfigurationTarget(o,r.resource);if(s){const g=r.overrideIdentifiers.sort(),a=s.overrides.find(d=>de([...d.identifiers].sort(),g));a&&(r.overrideIdentifiers=a.identifiers)}}switch(this.configurationEditing=this.configurationEditing??this.createConfigurationEditingService(this.instantiationService),await(await this.configurationEditing).writeConfiguration(o,{key:e,value:i},{scopes:r,...n}),o){case p.USER_LOCAL:this.applicationConfiguration&&this.isSettingAppliedForAllProfiles(e)?await this.reloadApplicationConfiguration():await this.reloadLocalUserConfiguration();return;case p.USER_REMOTE:return this.reloadRemoteUserConfiguration().then(()=>{});case p.WORKSPACE:return this.reloadWorkspaceConfiguration();case p.WORKSPACE_FOLDER:{const s=r&&r.resource?this.workspace.getFolder(r.resource):null;if(s)return this.reloadWorkspaceFolderConfiguration(s)}}}async createConfigurationEditingService(e){const i=(await this.remoteAgentService.getEnvironment())?.settingsPath??null;return e.createInstance(ti,i)}getConfigurationModelForEditableConfigurationTarget(e,i){switch(e){case p.USER_LOCAL:return this._configuration.localUserConfiguration;case p.USER_REMOTE:return this._configuration.remoteUserConfiguration;case p.WORKSPACE:return this._configuration.workspaceConfiguration;case p.WORKSPACE_FOLDER:return i?this._configuration.folderConfigurations.get(i):void 0}}getConfigurationModel(e,i){switch(e){case c.USER_LOCAL:return this._configuration.localUserConfiguration;case c.USER_REMOTE:return this._configuration.remoteUserConfiguration;case c.WORKSPACE:return this._configuration.workspaceConfiguration;case c.WORKSPACE_FOLDER:return i?this._configuration.folderConfigurations.get(i):void 0;default:return}}deriveConfigurationTargets(e,i,t){if(z(i,t.value))return[];const r=[];return t.workspaceFolderValue!==void 0&&r.push(c.WORKSPACE_FOLDER),t.workspaceValue!==void 0&&r.push(c.WORKSPACE),t.userRemoteValue!==void 0&&r.push(c.USER_REMOTE),t.userLocalValue!==void 0&&r.push(c.USER_LOCAL),t.applicationValue!==void 0&&r.push(c.APPLICATION),i===void 0?r:[r[0]||c.USER]}triggerConfigurationChange(e,i,t){if(e.keys.length){t!==c.DEFAULT&&this.logService.debug(`Configuration keys changed in ${ke(t)} target`,...e.keys);const r=new we(e,i,this._configuration,this.workspace,this.logService);r.source=t,this._onDidChangeConfiguration.fire(r)}}toEditableConfigurationTarget(e,i){if(e===c.APPLICATION)return p.USER_LOCAL;if(e===c.USER){if(this.remoteUserConfiguration){const t=this.configurationRegistry.getConfigurationProperties()[i]?.scope;if(t===D.MACHINE||t===D.MACHINE_OVERRIDABLE)return p.USER_REMOTE;if(this.inspect(i).userRemoteValue!==void 0)return p.USER_REMOTE}return p.USER_LOCAL}return e===c.USER_LOCAL?p.USER_LOCAL:e===c.USER_REMOTE?p.USER_REMOTE:e===c.WORKSPACE?p.WORKSPACE:e===c.WORKSPACE_FOLDER?p.WORKSPACE_FOLDER:null}}let A=class extends M{constructor(e,i,t,r,n){super();this.workspaceContextService=e;this.environmentService=i;this.workspaceTrustManagementService=t;r.whenInstalledExtensionsRegistered().then(()=>{this.registerConfigurationSchemas();const o=U.as(N.Configuration),s=this._register(new fe(50));this._register(Ce.any(o.onDidUpdateConfiguration,o.onDidSchemaChange,t.onDidChangeTrust)(()=>s.trigger(()=>this.registerConfigurationSchemas(),n.phase===B.Eventually?void 0:2500)))})}registerConfigurationSchemas(){const e={properties:v.properties,patternProperties:v.patternProperties,additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0},i=this.environmentService.remoteAuthority?{properties:Object.assign({},ye.properties,O.properties,F.properties),patternProperties:v.patternProperties,additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0}:e,t={properties:Object.assign({},ee.properties,b.properties,O.properties,F.properties),patternProperties:v.patternProperties,additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0},r={properties:Object.assign({},ee.properties,b.properties,O.properties,F.properties),patternProperties:v.patternProperties,additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0},n={properties:Object.assign({},this.checkAndFilterPropertiesRequiringTrust(b.properties),this.checkAndFilterPropertiesRequiringTrust(O.properties),this.checkAndFilterPropertiesRequiringTrust(F.properties)),patternProperties:v.patternProperties,additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0},o={properties:Object.keys(v.properties).reduce((a,d)=>(a[d]=Object.assign({deprecationMessage:void 0},v.properties[d]),a),{}),patternProperties:Object.keys(v.patternProperties).reduce((a,d)=>(a[d]=Object.assign({deprecationMessage:void 0},v.patternProperties[d]),a),{}),additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0},s=C.WORKSPACE===this.workspaceContextService.getWorkbenchState()?{properties:Object.assign({},this.checkAndFilterPropertiesRequiringTrust(b.properties),this.checkAndFilterPropertiesRequiringTrust(F.properties)),patternProperties:v.patternProperties,additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0}:n,g={type:"object",description:X("configurationDefaults.description","Contribute defaults for configurations"),properties:Object.assign({},this.filterDefaultOverridableProperties(b.properties),this.filterDefaultOverridableProperties(O.properties),this.filterDefaultOverridableProperties(F.properties)),patternProperties:{[We]:{type:"object",default:{},$ref:Re}},additionalProperties:!1};this.registerSchemas({defaultSettingsSchema:o,userSettingsSchema:i,profileSettingsSchema:t,machineSettingsSchema:r,workspaceSettingsSchema:n,folderSettingsSchema:s,configDefaultsSchema:g})}registerSchemas(e){const i=U.as(_e.JSONContribution);i.registerSchema(Ye,e.defaultSettingsSchema),i.registerSchema(ei,e.userSettingsSchema),i.registerSchema(Ze,e.profileSettingsSchema),i.registerSchema(Xe,e.machineSettingsSchema),i.registerSchema(ii,e.workspaceSettingsSchema),i.registerSchema(Ge,e.folderSettingsSchema),i.registerSchema(Ee,e.configDefaultsSchema)}checkAndFilterPropertiesRequiringTrust(e){if(this.workspaceTrustManagementService.isWorkspaceTrusted())return e;const i={};return Object.entries(e).forEach(([t,r])=>{r.restricted||(i[t]=r)}),i}filterDefaultOverridableProperties(e){const i={};return Object.entries(e).forEach(([t,r])=>{r.disallowConfigurationDefault||(i[t]=r)}),i}};A=L([I(0,Oe),I(1,Je),I(2,Le),I(3,re),I(4,Be)],A);let T=class extends M{constructor(h,e){super(),h.hasCachedConfigurationDefaultsOverrides()&&e.whenInstalledExtensionsRegistered().then(()=>h.reloadConfiguration(c.DEFAULT))}};T=L([I(0,ve),I(1,re)],T);let _=class extends M{constructor(e){super();this.workbenchAssignmentService=e;this.processExperimentalSettings(Object.keys(this.configurationRegistry.getConfigurationProperties())),this._register(this.configurationRegistry.onDidUpdateConfiguration(({properties:i})=>this.processExperimentalSettings(i)))}static ID="workbench.contrib.updateExperimentalSettingsDefaults";processedExperimentalSettings=new Set;configurationRegistry=U.as(N.Configuration);async processExperimentalSettings(e){const i={},t=this.configurationRegistry.getConfigurationProperties();for(const r of e){const n=t[r];if(n?.tags?.includes("experimental")&&!this.processedExperimentalSettings.has(r)){this.processedExperimentalSettings.add(r);try{const o=await this.workbenchAssignmentService.getTreatment(`config.${r}`);!Se(o)&&!z(o,n.default)&&(i[r]=o)}catch{}}}Object.keys(i).length&&this.configurationRegistry.registerDefaultConfigurations([{overrides:i}])}};_=L([I(0,Ke)],_);const ae=U.as(Ve.Workbench);ae.registerWorkbenchContribution(A,B.Restored),ae.registerWorkbenchContribution(T,B.Eventually),ze(_.ID,_,je.BlockRestore);const ui=U.as(N.Configuration);ui.registerConfiguration({...xe,properties:{[w]:{type:"array",description:X("setting description","Configure settings to be applied for all profiles."),default:[],scope:D.APPLICATION,additionalProperties:!0,uniqueItems:!0}}});export{qi as WorkspaceService};
