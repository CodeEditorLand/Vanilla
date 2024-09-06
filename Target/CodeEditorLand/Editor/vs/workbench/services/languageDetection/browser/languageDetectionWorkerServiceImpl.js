var O=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var L=(c,s,t,e)=>{for(var r=e>1?void 0:e?C(s,t):s,i=c.length-1,a;i>=0;i--)(a=c[i])&&(r=(e?a(s,t,r):a(r))||r);return e&&r&&O(s,t,r),r},o=(c,s)=>(t,e)=>s(t,e,c);import{createWebWorker as _}from"../../../../../vs/base/browser/defaultWorkerFactory.js";import{canASAR as U}from"../../../../../vs/base/common/amd.js";import{Disposable as I}from"../../../../../vs/base/common/lifecycle.js";import{LRUCache as k}from"../../../../../vs/base/common/map.js";import{FileAccess as g,nodeModulesAsarPath as w,nodeModulesPath as b,Schemas as x}from"../../../../../vs/base/common/network.js";import{isWeb as D}from"../../../../../vs/base/common/platform.js";import{URI as B}from"../../../../../vs/base/common/uri.js";import"../../../../../vs/base/common/worker/simpleWorker.js";import{ILanguageService as R}from"../../../../../vs/editor/common/languages/language.js";import{IModelService as M}from"../../../../../vs/editor/common/services/model.js";import{WorkerTextModelSyncClient as E}from"../../../../../vs/editor/common/services/textModelSync/textModelSync.impl.js";import{IConfigurationService as J}from"../../../../../vs/platform/configuration/common/configuration.js";import{IDiagnosticsService as T}from"../../../../../vs/platform/diagnostics/common/diagnostics.js";import{InstantiationType as $,registerSingleton as P}from"../../../../../vs/platform/instantiation/common/extensions.js";import{ILogService as A}from"../../../../../vs/platform/log/common/log.js";import{IStorageService as N,StorageScope as l,StorageTarget as W}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as H}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IWorkspaceContextService as K}from"../../../../../vs/platform/workspace/common/workspace.js";import{IEditorService as F}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IWorkbenchEnvironmentService as G}from"../../../../../vs/workbench/services/environment/common/environmentService.js";import{LanguageDetectionWorkerHost as j}from"../../../../../vs/workbench/services/languageDetection/browser/languageDetectionWorker.protocol.js";import{ILanguageDetectionService as V,LanguageDetectionStatsId as q}from"../../../../../vs/workbench/services/languageDetection/common/languageDetectionWorkerService.js";const p=12,z=`${b}/vscode-regexp-languagedetection`,Q=`${w}/vscode-regexp-languagedetection`,v=`${b}/@vscode/vscode-languagedetection`,y=`${w}/@vscode/vscode-languagedetection`;let n=class extends I{constructor(t,e,r,i,a,d,h,S,m,f){super();this._environmentService=t;this._configurationService=r;this._diagnosticsService=i;this._workspaceContextService=a;this._editorService=h;this._logService=f;const u=U&&this._environmentService.isBuilt&&!D;this._languageDetectionWorkerClient=this._register(new X(d,e,S,u?g.asBrowserUri(`${y}/dist/lib/index.js`).toString(!0):g.asBrowserUri(`${v}/dist/lib/index.js`).toString(!0),u?g.asBrowserUri(`${y}/model/model.json`).toString(!0):g.asBrowserUri(`${v}/model/model.json`).toString(!0),u?g.asBrowserUri(`${y}/model/group1-shard1of1.bin`).toString(!0):g.asBrowserUri(`${v}/model/group1-shard1of1.bin`).toString(!0),u?g.asBrowserUri(`${Q}/dist/index.js`).toString(!0):g.asBrowserUri(`${z}/dist/index.js`).toString(!0))),this.initEditorOpenedListeners(m)}static enablementSettingKey="workbench.editor.languageDetection";static historyBasedEnablementConfig="workbench.editor.historyBasedLanguageDetection";static preferHistoryConfig="workbench.editor.preferHistoryBasedLanguageDetection";static workspaceOpenedLanguagesStorageKey="workbench.editor.languageDetectionOpenedLanguages.workspace";static globalOpenedLanguagesStorageKey="workbench.editor.languageDetectionOpenedLanguages.global";_serviceBrand;_languageDetectionWorkerClient;hasResolvedWorkspaceLanguageIds=!1;workspaceLanguageIds=new Set;sessionOpenedLanguageIds=new Set;historicalGlobalOpenedLanguageIds=new k(p);historicalWorkspaceOpenedLanguageIds=new k(p);dirtyBiases=!0;langBiases={};async resolveWorkspaceLanguageIds(){if(this.hasResolvedWorkspaceLanguageIds)return;this.hasResolvedWorkspaceLanguageIds=!0;const t=await this._diagnosticsService.getWorkspaceFileExtensions(this._workspaceContextService.getWorkspace());let e=0;for(const r of t.extensions){const i=this._languageDetectionWorkerClient.getLanguageId(r);if(i&&e<p&&(this.workspaceLanguageIds.add(i),e++,e>p))break}this.dirtyBiases=!0}isEnabledForLanguage(t){return!!t&&this._configurationService.getValue(n.enablementSettingKey,{overrideIdentifier:t})}getLanguageBiases(){if(!this.dirtyBiases)return this.langBiases;const t={};return this.sessionOpenedLanguageIds.forEach(e=>t[e]=(t[e]??0)+7),this.workspaceLanguageIds.forEach(e=>t[e]=(t[e]??0)+5),[...this.historicalWorkspaceOpenedLanguageIds.keys()].forEach(e=>t[e]=(t[e]??0)+3),[...this.historicalGlobalOpenedLanguageIds.keys()].forEach(e=>t[e]=(t[e]??0)+1),this._logService.trace("Session Languages:",JSON.stringify([...this.sessionOpenedLanguageIds])),this._logService.trace("Workspace Languages:",JSON.stringify([...this.workspaceLanguageIds])),this._logService.trace("Historical Workspace Opened Languages:",JSON.stringify([...this.historicalWorkspaceOpenedLanguageIds.keys()])),this._logService.trace("Historical Globally Opened Languages:",JSON.stringify([...this.historicalGlobalOpenedLanguageIds.keys()])),this._logService.trace("Computed Language Detection Biases:",JSON.stringify(t)),this.dirtyBiases=!1,this.langBiases=t,t}async detectLanguage(t,e){const r=this._configurationService.getValue(n.historyBasedEnablementConfig),i=this._configurationService.getValue(n.preferHistoryConfig);r&&await this.resolveWorkspaceLanguageIds();const a=r?this.getLanguageBiases():void 0;return this._languageDetectionWorkerClient.detectLanguage(t,a,i,e)}initEditorOpenedListeners(t){try{const e=JSON.parse(t.get(n.globalOpenedLanguagesStorageKey,l.PROFILE,"[]"));this.historicalGlobalOpenedLanguageIds.fromJSON(e)}catch(e){console.error(e)}try{const e=JSON.parse(t.get(n.workspaceOpenedLanguagesStorageKey,l.WORKSPACE,"[]"));this.historicalWorkspaceOpenedLanguageIds.fromJSON(e)}catch(e){console.error(e)}this._register(this._editorService.onDidActiveEditorChange(()=>{const e=this._editorService.activeTextEditorLanguageId;e&&this._editorService.activeEditor?.resource?.scheme!==x.untitled&&(this.sessionOpenedLanguageIds.add(e),this.historicalGlobalOpenedLanguageIds.set(e,!0),this.historicalWorkspaceOpenedLanguageIds.set(e,!0),t.store(n.globalOpenedLanguagesStorageKey,JSON.stringify(this.historicalGlobalOpenedLanguageIds.toJSON()),l.PROFILE,W.MACHINE),t.store(n.workspaceOpenedLanguagesStorageKey,JSON.stringify(this.historicalWorkspaceOpenedLanguageIds.toJSON()),l.WORKSPACE,W.MACHINE),this.dirtyBiases=!0)}))}};n=L([o(0,G),o(1,R),o(2,J),o(3,T),o(4,K),o(5,M),o(6,F),o(7,H),o(8,N),o(9,A)],n);class X extends I{constructor(t,e,r,i,a,d,h){super();this._modelService=t;this._languageService=e;this._telemetryService=r;this._indexJsUri=i;this._modelJsonUri=a;this._weightsUri=d;this._regexpModelUri=h}worker;_getOrCreateLanguageDetectionWorker(){if(!this.worker){const t=this._register(_("vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker","LanguageDetectionWorker"));j.setChannel(t,{$getIndexJsUri:async()=>this.getIndexJsUri(),$getLanguageId:async r=>this.getLanguageId(r),$sendTelemetryEvent:async(r,i,a)=>this.sendTelemetryEvent(r,i,a),$getRegexpModelUri:async()=>this.getRegexpModelUri(),$getModelJsonUri:async()=>this.getModelJsonUri(),$getWeightsUri:async()=>this.getWeightsUri()});const e=E.create(t,this._modelService);this.worker={workerClient:t,workerTextModelSyncClient:e}}return this.worker}_guessLanguageIdByUri(t){const e=this._languageService.guessLanguageIdByFilepathOrFirstLine(t);if(e&&e!=="unknown")return e}async getIndexJsUri(){return this._indexJsUri}getLanguageId(t){if(!t)return;if(this._languageService.isRegisteredLanguageId(t))return t;const e=this._guessLanguageIdByUri(B.file(`file.${t}`));if(!(!e||e==="unknown"))return e}async getModelJsonUri(){return this._modelJsonUri}async getWeightsUri(){return this._weightsUri}async getRegexpModelUri(){return this._regexpModelUri}async sendTelemetryEvent(t,e,r){this._telemetryService.publicLog2(q,{languages:t.join(","),confidences:e.join(","),timeSpent:r})}async detectLanguage(t,e,r,i){const a=Date.now(),d=this._guessLanguageIdByUri(t);if(d)return d;const{workerClient:h,workerTextModelSyncClient:S}=this._getOrCreateLanguageDetectionWorker();await S.ensureSyncedResources([t]);const m=await h.proxy.$detectLanguage(t.toString(),e,r,i),f=this.getLanguageId(m);return this._telemetryService.publicLog2("automaticlanguagedetection.perf",{timeSpent:Date.now()-a,detection:f||"unknown"}),f}}P(V,n,$.Eager);export{n as LanguageDetectionService,X as LanguageDetectionWorkerClient};
