import{RunOnceScheduler as p}from"../../../../../vs/base/common/async.js";import"../../../../../vs/base/common/collections.js";import*as A from"../../../../../vs/base/common/errors.js";import{Emitter as g,Event as l}from"../../../../../vs/base/common/event.js";import{hash as T}from"../../../../../vs/base/common/hash.js";import{combinedDisposable as R,Disposable as h,DisposableStore as x,dispose as z,MutableDisposable as C,toDisposable as L}from"../../../../../vs/base/common/lifecycle.js";import{equals as N}from"../../../../../vs/base/common/objects.js";import{joinPath as K}from"../../../../../vs/base/common/resources.js";import{isEmptyObject as B,isObject as Y}from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import{ConfigurationModel as f,ConfigurationModelParser as v,UserSettings as E}from"../../../../../vs/platform/configuration/common/configurationModels.js";import{ConfigurationScope as j,Extensions as J,OVERRIDE_PROPERTY_REGEX as H}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{DefaultConfiguration as V}from"../../../../../vs/platform/configuration/common/configurations.js";import{FileChangeType as S,FileOperation as u,FileOperationResult as M,whenProviderRegistered as F}from"../../../../../vs/platform/files/common/files.js";import"../../../../../vs/platform/log/common/log.js";import{Registry as q}from"../../../../../vs/platform/registry/common/platform.js";import"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import"../../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{WorkbenchState as G}from"../../../../../vs/platform/workspace/common/workspace.js";import"../../../../../vs/platform/workspaces/common/workspaces.js";import{APPLY_ALL_PROFILES_SETTING as X,FOLDER_SCOPES as $,FOLDER_SETTINGS_NAME as m,LAUNCH_CONFIGURATION_KEY as Q,REMOTE_MACHINE_SCOPES as D,TASKS_CONFIGURATION_KEY as W,WORKSPACE_SCOPES as _}from"../../../../../vs/workbench/services/configuration/common/configuration.js";import{StandaloneConfigurationModelParser as U,WorkspaceConfigurationModelParser as y}from"../../../../../vs/workbench/services/configuration/common/configurationModels.js";import"../../../../../vs/workbench/services/configuration/common/jsonEditing.js";import"../../../../../vs/workbench/services/environment/browser/environmentService.js";import"../../../../../vs/workbench/services/remote/common/remoteAgentService.js";class w extends V{constructor(e,i,r){super(r);this.configurationCache=e;i.options?.configurationDefaults&&this.configurationRegistry.registerDefaultConfigurations([{overrides:i.options.configurationDefaults}])}static DEFAULT_OVERRIDES_CACHE_EXISTS_KEY="DefaultOverridesCacheExists";configurationRegistry=q.as(J.Configuration);cachedConfigurationDefaultsOverrides={};cacheKey={type:"defaults",key:"configurationDefaultsOverrides"};updateCache=!1;getConfigurationDefaultOverrides(){return this.cachedConfigurationDefaultsOverrides}async initialize(){return await this.initializeCachedConfigurationDefaultsOverrides(),super.initialize()}reload(){return this.updateCache=!0,this.cachedConfigurationDefaultsOverrides={},this.updateCachedConfigurationDefaultsOverrides(),super.reload()}hasCachedConfigurationDefaultsOverrides(){return!B(this.cachedConfigurationDefaultsOverrides)}initiaizeCachedConfigurationDefaultsOverridesPromise;initializeCachedConfigurationDefaultsOverrides(){return this.initiaizeCachedConfigurationDefaultsOverridesPromise||(this.initiaizeCachedConfigurationDefaultsOverridesPromise=(async()=>{try{if(localStorage.getItem(w.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY)){const e=await this.configurationCache.read(this.cacheKey);e&&(this.cachedConfigurationDefaultsOverrides=JSON.parse(e))}}catch{}this.cachedConfigurationDefaultsOverrides=Y(this.cachedConfigurationDefaultsOverrides)?this.cachedConfigurationDefaultsOverrides:{}})()),this.initiaizeCachedConfigurationDefaultsOverridesPromise}onDidUpdateConfiguration(e,i){super.onDidUpdateConfiguration(e,i),i&&this.updateCachedConfigurationDefaultsOverrides()}async updateCachedConfigurationDefaultsOverrides(){if(!this.updateCache)return;const e={},i=this.configurationRegistry.getConfigurationDefaultsOverrides();for(const[r,t]of i)!H.test(r)&&t.value!==void 0&&(e[r]=t.value);try{Object.keys(e).length?(localStorage.setItem(w.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY,"yes"),await this.configurationCache.write(this.cacheKey,JSON.stringify(e))):(localStorage.removeItem(w.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY),await this.configurationCache.remove(this.cacheKey))}catch{}}}class He extends E{_onDidChangeConfiguration=this._register(new g);onDidChangeConfiguration=this._onDidChangeConfiguration.event;reloadConfigurationScheduler;constructor(o,e,i,r){super(o.defaultProfile.settingsResource,{scopes:[j.APPLICATION]},i.extUri,e,r),this._register(this.onDidChange(()=>this.reloadConfigurationScheduler.schedule())),this.reloadConfigurationScheduler=this._register(new p(()=>this.loadConfiguration().then(t=>this._onDidChangeConfiguration.fire(t)),50))}async initialize(){return this.loadConfiguration()}async loadConfiguration(){const o=await super.loadConfiguration(),e=o.getValue(X),i=Array.isArray(e)?e:[];return this.parseOptions.include||i.length?this.reparse({...this.parseOptions,include:i}):o}}class Ve extends h{constructor(e,i,r,t,s,n){super();this.settingsResource=e;this.tasksResource=i;this.configurationParseOptions=r;this.fileService=t;this.uriIdentityService=s;this.logService=n;this.userConfiguration.value=new E(e,this.configurationParseOptions,s.extUri,this.fileService,n),this.userConfigurationChangeDisposable.value=this.userConfiguration.value.onDidChange(()=>this.reloadConfigurationScheduler.schedule()),this.reloadConfigurationScheduler=this._register(new p(()=>this.userConfiguration.value.loadConfiguration().then(a=>this._onDidChangeConfiguration.fire(a)),50))}_onDidChangeConfiguration=this._register(new g);onDidChangeConfiguration=this._onDidChangeConfiguration.event;userConfiguration=this._register(new C);userConfigurationChangeDisposable=this._register(new C);reloadConfigurationScheduler;get hasTasksLoaded(){return this.userConfiguration.value instanceof I}async reset(e,i,r){return this.settingsResource=e,this.tasksResource=i,this.configurationParseOptions=r,this.doReset()}async doReset(e){const i=this.uriIdentityService.extUri.dirname(this.settingsResource),r=this.tasksResource?[[W,this.tasksResource]]:[],t=new I(i.toString(),this.settingsResource,r,this.configurationParseOptions,this.fileService,this.uriIdentityService,this.logService),s=await t.loadConfiguration(e);return this.userConfiguration.value=t,this.userConfigurationChangeDisposable.value&&(this.userConfigurationChangeDisposable.value=this.userConfiguration.value.onDidChange(()=>this.reloadConfigurationScheduler.schedule())),s}async initialize(){return this.userConfiguration.value.loadConfiguration()}async reload(e){return this.hasTasksLoaded?this.userConfiguration.value.loadConfiguration():this.doReset(e)}reparse(e){return this.configurationParseOptions={...this.configurationParseOptions,...e},this.userConfiguration.value.reparse(this.configurationParseOptions)}getRestrictedSettings(){return this.userConfiguration.value.getRestrictedSettings()}}class I extends h{constructor(e,i,r,t,s,n,a){super();this.settingsResource=i;this.standAloneConfigurationResources=r;this.fileService=s;this.uriIdentityService=n;this.logService=a;this.allResources=[this.settingsResource,...this.standAloneConfigurationResources.map(([,d])=>d)],this._register(R(...this.allResources.map(d=>R(this.fileService.watch(n.extUri.dirname(d)),this.fileService.watch(d))))),this._folderSettingsModelParser=new v(e,a),this._folderSettingsParseOptions=t,this._standAloneConfigurations=[],this._cache=f.createEmptyModel(this.logService),this._register(l.debounce(l.any(l.filter(this.fileService.onDidFilesChange,d=>this.handleFileChangesEvent(d)),l.filter(this.fileService.onDidRunOperation,d=>this.handleFileOperationEvent(d))),()=>{},100)(()=>this._onDidChange.fire()))}allResources;_folderSettingsModelParser;_folderSettingsParseOptions;_standAloneConfigurations;_cache;_onDidChange=this._register(new g);onDidChange=this._onDidChange.event;async resolveContents(e){const i=async s=>Promise.all(s.map(async n=>{try{return(await this.fileService.readFile(n,{atomic:!0})).value.toString()}catch(a){this.logService.trace(`Error while resolving configuration file '${n.toString()}': ${A.getErrorMessage(a)}`),a.fileOperationResult!==M.FILE_NOT_FOUND&&a.fileOperationResult!==M.FILE_NOT_DIRECTORY&&this.logService.error(a)}return"{}"})),[[r],t]=await Promise.all([e?Promise.resolve([void 0]):i([this.settingsResource]),i(this.standAloneConfigurationResources.map(([,s])=>s))]);return[r,t.map((s,n)=>[this.standAloneConfigurationResources[n][0],s])]}async loadConfiguration(e){const[i,r]=await this.resolveContents(!!e);this._standAloneConfigurations=[],this._folderSettingsModelParser.parse("",this._folderSettingsParseOptions),i!==void 0&&this._folderSettingsModelParser.parse(i,this._folderSettingsParseOptions);for(let t=0;t<r.length;t++){const s=r[t][1];if(s!==void 0){const n=new U(this.standAloneConfigurationResources[t][1].toString(),this.standAloneConfigurationResources[t][0],this.logService);n.parse(s),this._standAloneConfigurations.push(n.configurationModel)}}return this.consolidate(e),this._cache}getRestrictedSettings(){return this._folderSettingsModelParser.restrictedConfigurations}reparse(e){const i=this._folderSettingsModelParser.configurationModel.contents;return this._folderSettingsParseOptions=e,this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions),N(i,this._folderSettingsModelParser.configurationModel.contents)||this.consolidate(),this._cache}consolidate(e){this._cache=(e??this._folderSettingsModelParser.configurationModel).merge(...this._standAloneConfigurations)}handleFileChangesEvent(e){return!!(this.allResources.some(i=>e.contains(i))||this.allResources.some(i=>e.contains(this.uriIdentityService.extUri.dirname(i),S.DELETED)))}handleFileOperationEvent(e){return!!((e.isOperation(u.CREATE)||e.isOperation(u.COPY)||e.isOperation(u.DELETE)||e.isOperation(u.WRITE))&&this.allResources.some(i=>this.uriIdentityService.extUri.isEqual(e.resource,i))||e.isOperation(u.DELETE)&&this.allResources.some(i=>this.uriIdentityService.extUri.isEqual(e.resource,this.uriIdentityService.extUri.dirname(i))))}}class qe extends h{_cachedConfiguration;_fileService;_userConfiguration;_userConfigurationInitializationPromise=null;_onDidChangeConfiguration=this._register(new g);onDidChangeConfiguration=this._onDidChangeConfiguration.event;_onDidInitialize=this._register(new g);onDidInitialize=this._onDidInitialize.event;constructor(o,e,i,r,t,s){super(),this._fileService=i,this._userConfiguration=this._cachedConfiguration=new Z(o,e,{scopes:D},s),t.getEnvironment().then(async n=>{if(n){const a=this._register(new O(n.settingsPath,{scopes:D},this._fileService,r,s));this._register(a.onDidChangeConfiguration(P=>this.onDidUserConfigurationChange(P))),this._userConfigurationInitializationPromise=a.initialize();const d=await this._userConfigurationInitializationPromise;this._userConfiguration.dispose(),this._userConfiguration=a,this.onDidUserConfigurationChange(d),this._onDidInitialize.fire(d)}})}async initialize(){if(this._userConfiguration instanceof O)return this._userConfiguration.initialize();let o=await this._userConfiguration.initialize();return this._userConfigurationInitializationPromise&&(o=await this._userConfigurationInitializationPromise,this._userConfigurationInitializationPromise=null),o}reload(){return this._userConfiguration.reload()}reparse(){return this._userConfiguration.reparse({scopes:D})}getRestrictedSettings(){return this._userConfiguration.getRestrictedSettings()}onDidUserConfigurationChange(o){this.updateCache(),this._onDidChangeConfiguration.fire(o)}async updateCache(){if(this._userConfiguration instanceof O){let o;try{o=await this._userConfiguration.resolveContent()}catch(e){if(e.fileOperationResult!==M.FILE_NOT_FOUND)return}await this._cachedConfiguration.updateConfiguration(o)}}}class O extends h{constructor(e,i,r,t,s){super();this.configurationResource=e;this.fileService=r;this.uriIdentityService=t;this.logService=s;this.parser=new v(this.configurationResource.toString(),s),this.parseOptions=i,this._register(r.onDidFilesChange(n=>this.handleFileChangesEvent(n))),this._register(r.onDidRunOperation(n=>this.handleFileOperationEvent(n))),this.reloadConfigurationScheduler=this._register(new p(()=>this.reload().then(n=>this._onDidChangeConfiguration.fire(n)),50)),this._register(L(()=>{this.stopWatchingResource(),this.stopWatchingDirectory()}))}parser;parseOptions;reloadConfigurationScheduler;_onDidChangeConfiguration=this._register(new g);onDidChangeConfiguration=this._onDidChangeConfiguration.event;fileWatcherDisposable=this._register(new C);directoryWatcherDisposable=this._register(new C);watchResource(){this.fileWatcherDisposable.value=this.fileService.watch(this.configurationResource)}stopWatchingResource(){this.fileWatcherDisposable.value=void 0}watchDirectory(){const e=this.uriIdentityService.extUri.dirname(this.configurationResource);this.directoryWatcherDisposable.value=this.fileService.watch(e)}stopWatchingDirectory(){this.directoryWatcherDisposable.value=void 0}async initialize(){const e=await this.fileService.exists(this.configurationResource);return this.onResourceExists(e),this.reload()}async resolveContent(){return(await this.fileService.readFile(this.configurationResource,{atomic:!0})).value.toString()}async reload(){try{const e=await this.resolveContent();return this.parser.parse(e,this.parseOptions),this.parser.configurationModel}catch{return f.createEmptyModel(this.logService)}}reparse(e){return this.parseOptions=e,this.parser.reparse(this.parseOptions),this.parser.configurationModel}getRestrictedSettings(){return this.parser.restrictedConfigurations}handleFileChangesEvent(e){let i=e.contains(this.configurationResource,S.UPDATED);e.contains(this.configurationResource,S.ADDED)?(i=!0,this.onResourceExists(!0)):e.contains(this.configurationResource,S.DELETED)&&(i=!0,this.onResourceExists(!1)),i&&this.reloadConfigurationScheduler.schedule()}handleFileOperationEvent(e){(e.isOperation(u.CREATE)||e.isOperation(u.COPY)||e.isOperation(u.DELETE)||e.isOperation(u.WRITE))&&this.uriIdentityService.extUri.isEqual(e.resource,this.configurationResource)&&this.reloadConfigurationScheduler.schedule()}onResourceExists(e){e?(this.stopWatchingDirectory(),this.watchResource()):(this.stopWatchingResource(),this.watchDirectory())}}class Z extends h{constructor(e,i,r,t){super();this.configurationCache=i;this.key={type:"user",key:e},this.parser=new v("CachedRemoteUserConfiguration",t),this.parseOptions=r,this.configurationModel=f.createEmptyModel(t)}_onDidChange=this._register(new g);onDidChange=this._onDidChange.event;key;parser;parseOptions;configurationModel;getConfigurationModel(){return this.configurationModel}initialize(){return this.reload()}reparse(e){return this.parseOptions=e,this.parser.reparse(this.parseOptions),this.configurationModel=this.parser.configurationModel,this.configurationModel}getRestrictedSettings(){return this.parser.restrictedConfigurations}async reload(){try{const e=await this.configurationCache.read(this.key),i=JSON.parse(e);i.content&&(this.parser.parse(i.content,this.parseOptions),this.configurationModel=this.parser.configurationModel)}catch{}return this.configurationModel}async updateConfiguration(e){return e?this.configurationCache.write(this.key,JSON.stringify({content:e})):this.configurationCache.remove(this.key)}}class Ge extends h{constructor(e,i,r,t){super();this.configurationCache=e;this.fileService=i;this.uriIdentityService=r;this.logService=t;this.fileService=i,this._workspaceConfiguration=this._cachedConfiguration=new ee(e,t)}_cachedConfiguration;_workspaceConfiguration;_workspaceConfigurationDisposables=this._register(new x);_workspaceIdentifier=null;_isWorkspaceTrusted=!1;_onDidUpdateConfiguration=this._register(new g);onDidUpdateConfiguration=this._onDidUpdateConfiguration.event;_initialized=!1;get initialized(){return this._initialized}async initialize(e,i){this._workspaceIdentifier=e,this._isWorkspaceTrusted=i,this._initialized||(this.configurationCache.needsCaching(this._workspaceIdentifier.configPath)?(this._workspaceConfiguration=this._cachedConfiguration,this.waitAndInitialize(this._workspaceIdentifier)):this.doInitialize(new k(this.fileService,this.uriIdentityService,this.logService))),await this.reload()}async reload(){this._workspaceIdentifier&&await this._workspaceConfiguration.load(this._workspaceIdentifier,{scopes:_,skipRestricted:this.isUntrusted()})}getFolders(){return this._workspaceConfiguration.getFolders()}setFolders(e,i){return this._workspaceIdentifier?i.write(this._workspaceIdentifier.configPath,[{path:["folders"],value:e}],!0).then(()=>this.reload()):Promise.resolve()}isTransient(){return this._workspaceConfiguration.isTransient()}getConfiguration(){return this._workspaceConfiguration.getWorkspaceSettings()}updateWorkspaceTrust(e){return this._isWorkspaceTrusted=e,this.reparseWorkspaceSettings()}reparseWorkspaceSettings(){return this._workspaceConfiguration.reparseWorkspaceSettings({scopes:_,skipRestricted:this.isUntrusted()}),this.getConfiguration()}getRestrictedSettings(){return this._workspaceConfiguration.getRestrictedSettings()}async waitAndInitialize(e){if(await F(e.configPath,this.fileService),!(this._workspaceConfiguration instanceof k)){const i=this._register(new k(this.fileService,this.uriIdentityService,this.logService));await i.load(e,{scopes:_,skipRestricted:this.isUntrusted()}),this.doInitialize(i),this.onDidWorkspaceConfigurationChange(!1,!0)}}doInitialize(e){this._workspaceConfigurationDisposables.clear(),this._workspaceConfiguration=this._workspaceConfigurationDisposables.add(e),this._workspaceConfigurationDisposables.add(this._workspaceConfiguration.onDidChange(i=>this.onDidWorkspaceConfigurationChange(!0,!1))),this._initialized=!0}isUntrusted(){return!this._isWorkspaceTrusted}async onDidWorkspaceConfigurationChange(e,i){e&&await this.reload(),this.updateCache(),this._onDidUpdateConfiguration.fire(i)}async updateCache(){if(this._workspaceIdentifier&&this.configurationCache.needsCaching(this._workspaceIdentifier.configPath)&&this._workspaceConfiguration instanceof k){const e=await this._workspaceConfiguration.resolveContent(this._workspaceIdentifier);await this._cachedConfiguration.updateWorkspace(this._workspaceIdentifier,e)}}}class k extends h{constructor(e,i,r){super();this.fileService=e;this.logService=r;this.workspaceConfigurationModelParser=new y("",r),this.workspaceSettings=f.createEmptyModel(r),this._register(l.any(l.filter(this.fileService.onDidFilesChange,t=>!!this._workspaceIdentifier&&t.contains(this._workspaceIdentifier.configPath)),l.filter(this.fileService.onDidRunOperation,t=>!!this._workspaceIdentifier&&(t.isOperation(u.CREATE)||t.isOperation(u.COPY)||t.isOperation(u.DELETE)||t.isOperation(u.WRITE))&&i.extUri.isEqual(t.resource,this._workspaceIdentifier.configPath)))(()=>this.reloadConfigurationScheduler.schedule())),this.reloadConfigurationScheduler=this._register(new p(()=>this._onDidChange.fire(),50)),this.workspaceConfigWatcher=this._register(this.watchWorkspaceConfigurationFile())}workspaceConfigurationModelParser;workspaceSettings;_workspaceIdentifier=null;workspaceConfigWatcher;reloadConfigurationScheduler;_onDidChange=this._register(new g);onDidChange=this._onDidChange.event;get workspaceIdentifier(){return this._workspaceIdentifier}async resolveContent(e){return(await this.fileService.readFile(e.configPath,{atomic:!0})).value.toString()}async load(e,i){(!this._workspaceIdentifier||this._workspaceIdentifier.id!==e.id)&&(this._workspaceIdentifier=e,this.workspaceConfigurationModelParser=new y(this._workspaceIdentifier.id,this.logService),z(this.workspaceConfigWatcher),this.workspaceConfigWatcher=this._register(this.watchWorkspaceConfigurationFile()));let r="";try{r=await this.resolveContent(this._workspaceIdentifier)}catch(t){await this.fileService.exists(this._workspaceIdentifier.configPath)&&this.logService.error(t)}this.workspaceConfigurationModelParser.parse(r,i),this.consolidate()}getConfigurationModel(){return this.workspaceConfigurationModelParser.configurationModel}getFolders(){return this.workspaceConfigurationModelParser.folders}isTransient(){return this.workspaceConfigurationModelParser.transient}getWorkspaceSettings(){return this.workspaceSettings}reparseWorkspaceSettings(e){return this.workspaceConfigurationModelParser.reparseWorkspaceSettings(e),this.consolidate(),this.getWorkspaceSettings()}getRestrictedSettings(){return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings()}consolidate(){this.workspaceSettings=this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel,this.workspaceConfigurationModelParser.tasksModel)}watchWorkspaceConfigurationFile(){return this._workspaceIdentifier?this.fileService.watch(this._workspaceIdentifier.configPath):h.None}}class ee{constructor(o,e){this.configurationCache=o;this.logService=e;this.workspaceConfigurationModelParser=new y("",e),this.workspaceSettings=f.createEmptyModel(e)}onDidChange=l.None;workspaceConfigurationModelParser;workspaceSettings;async load(o,e){try{const i=this.getKey(o),r=await this.configurationCache.read(i),t=JSON.parse(r);t.content&&(this.workspaceConfigurationModelParser=new y(i.key,this.logService),this.workspaceConfigurationModelParser.parse(t.content,e),this.consolidate())}catch{}}get workspaceIdentifier(){return null}getConfigurationModel(){return this.workspaceConfigurationModelParser.configurationModel}getFolders(){return this.workspaceConfigurationModelParser.folders}isTransient(){return this.workspaceConfigurationModelParser.transient}getWorkspaceSettings(){return this.workspaceSettings}reparseWorkspaceSettings(o){return this.workspaceConfigurationModelParser.reparseWorkspaceSettings(o),this.consolidate(),this.getWorkspaceSettings()}getRestrictedSettings(){return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings()}consolidate(){this.workspaceSettings=this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel,this.workspaceConfigurationModelParser.tasksModel)}async updateWorkspace(o,e){try{const i=this.getKey(o);e?await this.configurationCache.write(i,JSON.stringify({content:e})):await this.configurationCache.remove(i)}catch{}}getKey(o){return{type:"workspaces",key:o.id}}}class ie{constructor(o,e,i,r,t){this.configurationCache=r;this.logService=t;this.key={type:"folder",key:T(K(o,e).toString()).toString(16)},this._folderSettingsModelParser=new v("CachedFolderConfiguration",t),this._folderSettingsParseOptions=i,this._standAloneConfigurations=[],this.configurationModel=f.createEmptyModel(t)}onDidChange=l.None;_folderSettingsModelParser;_folderSettingsParseOptions;_standAloneConfigurations;configurationModel;key;async loadConfiguration(){try{const o=await this.configurationCache.read(this.key),{content:e}=JSON.parse(o.toString());if(e)for(const i of Object.keys(e))if(i===m)this._folderSettingsModelParser.parse(e[i],this._folderSettingsParseOptions);else{const r=new U(i,i,this.logService);r.parse(e[i]),this._standAloneConfigurations.push(r.configurationModel)}this.consolidate()}catch{}return this.configurationModel}async updateConfiguration(o,e){const i={};o&&(i[m]=o),e.forEach(([r,t])=>{t&&(i[r]=t)}),Object.keys(i).length?await this.configurationCache.write(this.key,JSON.stringify({content:i})):await this.configurationCache.remove(this.key)}getRestrictedSettings(){return this._folderSettingsModelParser.restrictedConfigurations}reparse(o){return this._folderSettingsParseOptions=o,this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions),this.consolidate(),this.configurationModel}consolidate(){this.configurationModel=this._folderSettingsModelParser.configurationModel.merge(...this._standAloneConfigurations)}getUnsupportedKeys(){return[]}}class Xe extends h{constructor(e,i,r,t,s,n,a,d,P){super();this.workspaceFolder=i;this.workbenchState=t;this.workspaceTrusted=s;this.configurationCache=P;this.scopes=G.WORKSPACE===this.workbenchState?$:_,this.configurationFolder=a.extUri.joinPath(i.uri,r),this.cachedFolderConfiguration=new ie(i.uri,r,{scopes:this.scopes,skipRestricted:this.isUntrusted()},P,d),e&&this.configurationCache.needsCaching(i.uri)?(this.folderConfiguration=this.cachedFolderConfiguration,F(i.uri,n).then(()=>{this.folderConfiguration=this._register(this.createFileServiceBasedConfiguration(n,a,d)),this._register(this.folderConfiguration.onDidChange(b=>this.onDidFolderConfigurationChange())),this.onDidFolderConfigurationChange()})):(this.folderConfiguration=this._register(this.createFileServiceBasedConfiguration(n,a,d)),this._register(this.folderConfiguration.onDidChange(b=>this.onDidFolderConfigurationChange())))}_onDidChange=this._register(new g);onDidChange=this._onDidChange.event;folderConfiguration;scopes;configurationFolder;cachedFolderConfiguration;loadConfiguration(){return this.folderConfiguration.loadConfiguration()}updateWorkspaceTrust(e){return this.workspaceTrusted=e,this.reparse()}reparse(){const e=this.folderConfiguration.reparse({scopes:this.scopes,skipRestricted:this.isUntrusted()});return this.updateCache(),e}getRestrictedSettings(){return this.folderConfiguration.getRestrictedSettings()}isUntrusted(){return!this.workspaceTrusted}onDidFolderConfigurationChange(){this.updateCache(),this._onDidChange.fire()}createFileServiceBasedConfiguration(e,i,r){const t=i.extUri.joinPath(this.configurationFolder,`${m}.json`),s=[W,Q].map(n=>[n,i.extUri.joinPath(this.configurationFolder,`${n}.json`)]);return new I(this.configurationFolder.toString(),t,s,{scopes:this.scopes,skipRestricted:this.isUntrusted()},e,i,r)}async updateCache(){if(this.configurationCache.needsCaching(this.configurationFolder)&&this.folderConfiguration instanceof I){const[e,i]=await this.folderConfiguration.resolveContents();this.cachedFolderConfiguration.updateConfiguration(e,i)}}}export{He as ApplicationConfiguration,w as DefaultConfiguration,Xe as FolderConfiguration,qe as RemoteUserConfiguration,Ve as UserConfiguration,Ge as WorkspaceConfiguration};
