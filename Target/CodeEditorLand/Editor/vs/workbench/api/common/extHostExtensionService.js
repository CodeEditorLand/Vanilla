var ee=Object.defineProperty;var te=Object.getOwnPropertyDescriptor;var W=(d,r,e,t)=>{for(var i=t>1?void 0:t?te(r,e):r,n=d.length-1,o;n>=0;n--)(o=d[n])&&(i=(t?o(r,e,i):o(i))||i);return t&&i&&ee(r,e,i),i},u=(d,r)=>(e,t)=>r(e,t,d);import{asPromise as ie,Barrier as H,IntervalTimer as ne,timeout as k}from"../../../../vs/base/common/async.js";import{VSBuffer as oe}from"../../../../vs/base/common/buffer.js";import*as $ from"../../../../vs/base/common/errors.js";import{Emitter as se,Event as O}from"../../../../vs/base/common/event.js";import{Disposable as re,DisposableStore as ae,dispose as ce,toDisposable as N}from"../../../../vs/base/common/lifecycle.js";import{Schemas as le}from"../../../../vs/base/common/network.js";import*as M from"../../../../vs/base/common/path.js";import*as f from"vs/base/common/performance";import{isCI as R,setTimeout0 as de}from"../../../../vs/base/common/platform.js";import{extUriBiasedIgnorePathCase as ve,joinPath as he,originalFSPath as j}from"../../../../vs/base/common/resources.js";import{StopWatch as ue}from"../../../../vs/base/common/stopwatch.js";import{TernarySearchTree as xe}from"../../../../vs/base/common/ternarySearchTree.js";import{URI as P}from"../../../../vs/base/common/uri.js";import*as z from"../../../../vs/nls.js";import{ExtensionIdentifier as V,ExtensionIdentifierMap as me,ExtensionIdentifierSet as K}from"../../../../vs/platform/extensions/common/extensions.js";import{createDecorator as J,IInstantiationService as Ee}from"../../../../vs/platform/instantiation/common/instantiation.js";import{ServiceCollection as ge}from"../../../../vs/platform/instantiation/common/serviceCollection.js";import{ILogService as fe}from"../../../../vs/platform/log/common/log.js";import{getRemoteAuthorityPrefix as G,ManagedRemoteConnection as pe,RemoteAuthorityResolverErrorCode as D,WebSocketRemoteConnection as _e}from"../../../../vs/platform/remote/common/remoteAuthorityResolver.js";import{MainContext as U}from"../../../../vs/workbench/api/common/extHost.protocol.js";import{IExtHostConfiguration as ye}from"../../../../vs/workbench/api/common/extHostConfiguration.js";import{ActivatedExtension as Ie,EmptyExtension as Re,ExtensionActivationTimes as Se,ExtensionActivationTimesBuilder as q,ExtensionsActivator as Pe,HostExtension as Te}from"../../../../vs/workbench/api/common/extHostExtensionActivator.js";import{IExtHostInitDataService as Ae}from"../../../../vs/workbench/api/common/extHostInitDataService.js";import{IExtHostLanguageModels as be}from"../../../../vs/workbench/api/common/extHostLanguageModels.js";import{IExtHostLocalizationService as we}from"../../../../vs/workbench/api/common/extHostLocalizationService.js";import{IExtHostManagedSockets as He}from"../../../../vs/workbench/api/common/extHostManagedSockets.js";import{ExtensionGlobalMemento as De,ExtensionMemento as Ce}from"../../../../vs/workbench/api/common/extHostMemento.js";import{IExtHostRpcService as ke}from"../../../../vs/workbench/api/common/extHostRpcService.js";import{ExtensionSecrets as $e}from"../../../../vs/workbench/api/common/extHostSecrets.js";import{ExtHostSecretState as Me,IExtHostSecretState as Ue}from"../../../../vs/workbench/api/common/extHostSecretState.js";import{ExtHostStorage as Fe,IExtHostStorage as Le}from"../../../../vs/workbench/api/common/extHostStorage.js";import{IExtensionStoragePaths as Be}from"../../../../vs/workbench/api/common/extHostStoragePaths.js";import{IExtHostTerminalService as We}from"../../../../vs/workbench/api/common/extHostTerminalService.js";import{IExtHostTunnelService as Oe}from"../../../../vs/workbench/api/common/extHostTunnelService.js";import{ExtensionKind as Q,ExtensionMode as F,ManagedResolvedAuthority as L,RemoteAuthorityResolverError as b}from"../../../../vs/workbench/api/common/extHostTypes.js";import{IExtHostWorkspace as Ne}from"../../../../vs/workbench/api/common/extHostWorkspace.js";import{ExtensionDescriptionRegistry as C}from"../../../../vs/workbench/services/extensions/common/extensionDescriptionRegistry.js";import"../../../../vs/workbench/services/extensions/common/extensionHostProtocol.js";import"../../../../vs/workbench/services/extensions/common/extensionHostProxy.js";import{ActivationKind as je,checkProposedApiEnabled as ze,isProposedApiEnabled as Ve}from"../../../../vs/workbench/services/extensions/common/extensions.js";import"../../../../vs/workbench/services/extensions/common/proxyIdentifier.js";import{checkActivateWorkspaceContainsExtension as Ke}from"../../../../vs/workbench/services/extensions/common/workspaceContains.js";const Je=J("IHostUtils");let A=class extends re{constructor(e,t,i,n,o,s,v,h,l,x,g,m,a){super();this._extHostManagedSockets=m;this._extHostLanguageModels=a;this._hostUtils=t,this._extHostContext=i,this._initData=v,this._extHostWorkspace=n,this._extHostConfiguration=o,this._logService=s,this._extHostTunnelService=l,this._extHostTerminalService=x,this._extHostLocalizationService=g,this._mainThreadWorkspaceProxy=this._extHostContext.getProxy(U.MainThreadWorkspace),this._mainThreadTelemetryProxy=this._extHostContext.getProxy(U.MainThreadTelemetry),this._mainThreadExtensionsProxy=this._extHostContext.getProxy(U.MainThreadExtensionService),this._almostReadyToRunExtensions=new H,this._readyToStartExtensionHost=new H,this._readyToRunExtensions=new H,this._eagerExtensionsActivated=new H,this._activationEventsReader=new Qe(this._initData.extensions.activationEvents),this._globalRegistry=new C(this._activationEventsReader,this._initData.extensions.allExtensions);const p=new K(this._initData.extensions.myExtensions);this._myRegistry=new C(this._activationEventsReader,Z(this._globalRegistry,p)),R&&(this._logService.info(`Creating extension host with the following global extensions: ${T(this._globalRegistry)}`),this._logService.info(`Creating extension host with the following local extensions: ${T(this._myRegistry)}`)),this._storage=new Fe(this._extHostContext,this._logService),this._secretState=new Me(this._extHostContext),this._storagePath=h,this._instaService=this._store.add(e.createChild(new ge([Le,this._storage],[Ue,this._secretState]))),this._activator=this._register(new Pe(this._myRegistry,this._globalRegistry,{onExtensionActivationError:(_,S,y)=>{this._mainThreadExtensionsProxy.$onExtensionActivationError(_,$.transformErrorForSerialization(S),y)},actualActivateExtension:async(_,S)=>{if(C.isHostExtension(_,this._myRegistry,this._globalRegistry))return await this._mainThreadExtensionsProxy.$activateExtension(_,S),new Te;const y=this._myRegistry.getExtensionDescription(_);return this._activateExtension(y,S)}},this._logService)),this._extensionPathIndex=null,this._resolvers=Object.create(null),this._started=!1,this._remoteConnectionData=this._initData.remote.connectionData}_serviceBrand;_onDidChangeRemoteConnectionData=this._register(new se);onDidChangeRemoteConnectionData=this._onDidChangeRemoteConnectionData.event;_hostUtils;_initData;_extHostContext;_instaService;_extHostWorkspace;_extHostConfiguration;_logService;_extHostTunnelService;_extHostTerminalService;_extHostLocalizationService;_mainThreadWorkspaceProxy;_mainThreadTelemetryProxy;_mainThreadExtensionsProxy;_almostReadyToRunExtensions;_readyToStartExtensionHost;_readyToRunExtensions;_eagerExtensionsActivated;_activationEventsReader;_myRegistry;_globalRegistry;_storage;_secretState;_storagePath;_activator;_extensionPathIndex;_realPathCache=new Map;_resolvers;_started;_isTerminating=!1;_remoteConnectionData;getRemoteConnectionData(){return this._remoteConnectionData}async initialize(){try{await this._beforeAlmostReadyToRunExtensions(),this._almostReadyToRunExtensions.open(),await this._extHostWorkspace.waitForInitializeCall(),f.mark("code/extHost/ready"),this._readyToStartExtensionHost.open(),this._initData.autoStart&&this._startExtensionHost()}catch(e){$.onUnexpectedError(e)}}async _deactivateAll(){this._storagePath.onWillDeactivateAll();let e=[];try{e=this._myRegistry.getAllExtensionDescriptions().map(o=>o.identifier).filter(o=>this.isActivated(o)).map(o=>this._deactivate(o))}catch{}await Promise.all(e)}terminate(e,t=0){if(this._isTerminating)return;this._isTerminating=!0,this._logService.info(`Extension host terminating: ${e}`),this._logService.flush(),this._extHostTerminalService.dispose(),this._activator.dispose(),$.setUnexpectedErrorHandler(n=>{this._logService.error(n)}),this._extHostContext.dispose();const i=this._deactivateAll();Promise.race([k(5e3),i]).finally(()=>{this._hostUtils.pid?this._logService.info(`Extension host with pid ${this._hostUtils.pid} exiting with code ${t}`):this._logService.info(`Extension host exiting with code ${t}`),this._logService.flush(),this._logService.dispose(),this._hostUtils.exit(t)})}isActivated(e){return this._readyToRunExtensions.isOpen()?this._activator.isActivated(e):!1}async getExtension(e){const t=await this._mainThreadExtensionsProxy.$getExtension(e);return t&&{...t,identifier:new V(t.identifier.value),extensionLocation:P.revive(t.extensionLocation)}}_activateByEvent(e,t){return this._activator.activateByEvent(e,t)}_activateById(e,t){return this._activator.activateById(e,t)}activateByIdWithErrors(e,t){return this._activateById(e,t).then(()=>{const i=this._activator.getActivatedExtension(e);if(i.activationFailed)return Promise.reject(i.activationFailedError)})}getExtensionRegistry(){return this._readyToRunExtensions.wait().then(e=>this._myRegistry)}getExtensionExports(e){if(this._readyToRunExtensions.isOpen())return this._activator.getActivatedExtension(e).exports;try{return this._activator.getActivatedExtension(e).exports}catch{return null}}async _realPathExtensionUri(e){if(e.scheme===le.file&&this._hostUtils.fsRealpath){const t=e.fsPath;this._realPathCache.has(t)||this._realPathCache.set(t,this._hostUtils.fsRealpath(t));const i=await this._realPathCache.get(t);return P.file(i)}return e}async getExtensionPathIndex(){return this._extensionPathIndex||(this._extensionPathIndex=this._createExtensionPathIndex(this._myRegistry.getAllExtensionDescriptions()).then(e=>new qe(e))),this._extensionPathIndex}async _createExtensionPathIndex(e){const t=xe.forUris(i=>ve.ignorePathCasing(i));return await Promise.all(e.map(async i=>{if(this._getEntryPoint(i)){const n=await this._realPathExtensionUri(i.extensionLocation);t.set(n,i)}})),t}_deactivate(e){let t=Promise.resolve(void 0);if(!this._readyToRunExtensions.isOpen()||!this._activator.isActivated(e))return t;const i=this._activator.getActivatedExtension(e);if(!i)return t;try{typeof i.module.deactivate=="function"&&(t=Promise.resolve(i.module.deactivate()).then(void 0,n=>(this._logService.error(n),Promise.resolve(void 0))))}catch(n){this._logService.error(`An error occurred when deactivating the extension '${e.value}':`),this._logService.error(n)}try{i.disposable.dispose()}catch(n){this._logService.error(`An error occurred when disposing the subscriptions for extension '${e.value}':`),this._logService.error(n)}return t}async _activateExtension(e,t){return this._initData.remote.isRemote?this._mainThreadExtensionsProxy.$onWillActivateExtension(e.identifier):await this._mainThreadExtensionsProxy.$onWillActivateExtension(e.identifier),this._doActivateExtension(e,t).then(i=>{const n=i.activationTimes;return this._mainThreadExtensionsProxy.$onDidActivateExtension(e.identifier,n.codeLoadingTime,n.activateCallTime,n.activateResolvedTime,t),this._logExtensionActivationTimes(e,t,"success",n),i},i=>{throw this._logExtensionActivationTimes(e,t,"failure"),i})}_logExtensionActivationTimes(e,t,i,n){const o=Y(e,t);this._mainThreadTelemetryProxy.$publicLog2("extensionActivationTimes",{...o,...n||{},outcome:i})}_doActivateExtension(e,t){const i=Y(e,t);this._mainThreadTelemetryProxy.$publicLog2("activatePlugin",i);const n=this._getEntryPoint(e);if(!n)return Promise.resolve(new Re(Se.NONE));this._logService.info(`ExtensionService#_doActivateExtension ${e.identifier.value}, startup: ${t.startup}, activationEvent: '${t.activationEvent}'${e.identifier.value!==t.extensionId.value?`, root cause: ${t.extensionId.value}`:""}`),this._logService.flush();const o=new ae,s=new q(t.startup);return Promise.all([this._loadCommonJSModule(e,he(e.extensionLocation,n),s),this._loadExtensionContext(e,o)]).then(v=>(f.mark(`code/extHost/willActivateExtension/${e.identifier.value}`),A._callActivate(this._logService,e.identifier,v[0],v[1],o,s))).then(v=>(f.mark(`code/extHost/didActivateExtension/${e.identifier.value}`),v))}_loadExtensionContext(e,t){const i=this._extHostLanguageModels.createLanguageModelAccessInformation(e),n=t.add(new De(e,this._storage)),o=t.add(new Ce(e.identifier.value,!1,this._storage)),s=t.add(new $e(e,this._secretState)),v=e.isUnderDevelopment?this._initData.environment.extensionTestsLocationURI?F.Test:F.Development:F.Production,h=this._initData.remote.isRemote?Q.Workspace:Q.UI;return this._logService.trace(`ExtensionService#loadExtensionContext ${e.identifier.value}`),Promise.all([n.whenReady,o.whenReady,this._storagePath.whenReady]).then(()=>{const l=this;let x,g;const m=Ve(e,"ipc")?this._initData.messagePorts?.get(V.toKey(e.identifier)):void 0;return Object.freeze({globalState:n,workspaceState:o,secrets:s,subscriptions:[],get languageModelAccessInformation(){return i},get extensionUri(){return e.extensionLocation},get extensionPath(){return e.extensionLocation.fsPath},asAbsolutePath(a){return M.join(e.extensionLocation.fsPath,a)},get storagePath(){return l._storagePath.workspaceValue(e)?.fsPath},get globalStoragePath(){return l._storagePath.globalValue(e).fsPath},get logPath(){return M.join(l._initData.logsLocation.fsPath,e.identifier.value)},get logUri(){return P.joinPath(l._initData.logsLocation,e.identifier.value)},get storageUri(){return l._storagePath.workspaceValue(e)},get globalStorageUri(){return l._storagePath.globalValue(e)},get extensionMode(){return v},get extension(){return x===void 0&&(x=new Ge(l,e.identifier,e,h,!1)),x},get extensionRuntime(){return ze(e,"extensionRuntime"),l.extensionRuntime},get environmentVariableCollection(){return l._extHostTerminalService.getEnvironmentVariableCollection(e)},get messagePassingProtocol(){if(!g){if(!m)return;const a=O.buffer(O.fromDOMEventEmitter(m,"message",p=>p.data));m.start(),g={onDidReceiveMessage:a,postMessage:m.postMessage.bind(m)}}return g}})})}static _callActivate(e,t,i,n,o,s){return i=i||{activate:void 0,deactivate:void 0},this._callActivateOptional(e,t,i,n,s).then(v=>new Ie(!1,null,s.build(),i,v,N(()=>{o.dispose(),ce(n.subscriptions)})))}static _callActivateOptional(e,t,i,n,o){if(typeof i.activate=="function")try{o.activateCallStart(),e.trace(`ExtensionService#_callActivateOptional ${t.value}`);const s=typeof global=="object"?global:self,v=i.activate.apply(s,[n]);return o.activateCallStop(),o.activateResolveStart(),Promise.resolve(v).then(h=>(o.activateResolveStop(),h))}catch(s){return Promise.reject(s)}else return Promise.resolve(i)}_activateOneStartupFinished(e,t){this._activateById(e.identifier,{startup:!1,extensionId:e.identifier,activationEvent:t}).then(void 0,i=>{this._logService.error(i)})}_activateAllStartupFinishedDeferred(e,t=0){const n=Date.now();de(()=>{for(let o=t;o<e.length;o+=1){const s=e[o];for(const v of s.activationEvents??[])if(v==="onStartupFinished")if(Date.now()-n>50){this._activateAllStartupFinishedDeferred(e,o);break}else this._activateOneStartupFinished(s,v)}})}_activateAllStartupFinished(){this._mainThreadExtensionsProxy.$setPerformanceMarks(f.getMarks()),this._extHostConfiguration.getConfigProvider().then(e=>{const t=e.getConfiguration("extensions.experimental").get("deferredStartupFinishedActivation"),i=this._myRegistry.getAllExtensionDescriptions();if(t)this._activateAllStartupFinishedDeferred(i);else for(const n of i)if(n.activationEvents)for(const o of n.activationEvents)o==="onStartupFinished"&&this._activateOneStartupFinished(n,o)})}_handleEagerExtensions(){const e=this._activateByEvent("*",!0).then(void 0,s=>{this._logService.error(s)});this._register(this._extHostWorkspace.onDidChangeWorkspace(s=>this._handleWorkspaceContainsEagerExtensions(s.added)));const t=this._extHostWorkspace.workspace?this._extHostWorkspace.workspace.folders:[],i=this._handleWorkspaceContainsEagerExtensions(t),n=this._handleRemoteResolverEagerExtensions(),o=Promise.all([n,e,i]).then(()=>{});return Promise.race([o,k(1e4)]).then(()=>{this._activateAllStartupFinished()}),o}_handleWorkspaceContainsEagerExtensions(e){return e.length===0?Promise.resolve(void 0):Promise.all(this._myRegistry.getAllExtensionDescriptions().map(t=>this._handleWorkspaceContainsEagerExtension(e,t))).then(()=>{})}async _handleWorkspaceContainsEagerExtension(e,t){if(this.isActivated(t.identifier))return;const i=!this._initData.remote.isRemote&&!!this._initData.remote.authority,n={logService:this._logService,folders:e.map(s=>s.uri),forceUsingSearch:i||!this._hostUtils.fsExists,exists:s=>this._hostUtils.fsExists(s.fsPath),checkExists:(s,v,h)=>this._mainThreadWorkspaceProxy.$checkExists(s,v,h)},o=await Ke(n,t);if(o)return this._activateById(t.identifier,{startup:!0,extensionId:t.identifier,activationEvent:o.activationEvent}).then(void 0,s=>this._logService.error(s))}async _handleRemoteResolverEagerExtensions(){if(this._initData.remote.authority)return this._activateByEvent(`onResolveRemoteAuthority:${this._initData.remote.authority}`,!1)}async $extensionTestsExecute(){await this._eagerExtensionsActivated.wait();try{return await this._doHandleExtensionTests()}catch(e){throw console.error(e),e}}async _doHandleExtensionTests(){const{extensionDevelopmentLocationURI:e,extensionTestsLocationURI:t}=this._initData.environment;if(!e||!t)throw new Error(z.localize("extensionTestError1","Cannot load test runner."));const i=await this._loadCommonJSModule(null,t,new q(!1));if(!i||typeof i.run!="function")throw new Error(z.localize("extensionTestError","Path {0} does not point to a valid extension test runner.",t.toString()));return new Promise((n,o)=>{const s=(l,x)=>{l?(R&&this._logService.error("Test runner called back with error",l),o(l)):(R&&(x?this._logService.info(`Test runner called back with ${x} failures.`):this._logService.info("Test runner called back with successful outcome.")),n(typeof x=="number"&&x>0?1:0))},v=j(t),h=i.run(v,s);h&&h.then&&h.then(()=>{R&&this._logService.info("Test runner finished successfully."),n(0)}).catch(l=>{R&&this._logService.error("Test runner finished with error",l),o(l instanceof Error&&l.stack?l.stack:String(l))})})}_startExtensionHost(){if(this._started)throw new Error("Extension host is already started!");return this._started=!0,this._readyToStartExtensionHost.wait().then(()=>this._readyToRunExtensions.open()).then(()=>Promise.race([this._activator.waitForActivatingExtensions(),k(1e3)])).then(()=>this._handleEagerExtensions()).then(()=>{this._eagerExtensionsActivated.open(),this._logService.info("Eager extensions activated")})}registerRemoteAuthorityResolver(e,t){return this._resolvers[e]=t,N(()=>{delete this._resolvers[e]})}async getRemoteExecServer(e){const{resolver:t}=await this._activateAndGetResolver(e);return t?.resolveExecServer?.(e,{resolveAttempt:0})}async _activateAndGetResolver(e){const t=e.indexOf("+");if(t===-1)throw new b("Not an authority that can be resolved!",D.InvalidAuthority);const i=e.substr(0,t);return await this._almostReadyToRunExtensions.wait(),await this._activateByEvent(`onResolveRemoteAuthority:${i}`,!1),{authorityPrefix:i,resolver:this._resolvers[i]}}async $resolveAuthority(e,t){const i=ue.create(!1),n=()=>`[resolveAuthority(${G(e)},${t})][${i.elapsed()}ms] `,o=c=>this._logService.info(`${n()}${c}`),s=c=>this._logService.warn(`${n()}${c}`),v=(c,E=void 0)=>this._logService.error(`${n()}${c}`,E),h=c=>{if(c instanceof b)return{type:"error",error:{code:c._code,message:c._message,detail:c._detail}};throw c},l=async c=>{o(`activating resolver for ${c}...`);const{resolver:E,authorityPrefix:I}=await this._activateAndGetResolver(c);if(!E)throw v(`no resolver for ${I}`),new b(`No remote extension installed to resolve ${I}.`,D.NoResolverFound);return{resolver:E,authorityPrefix:I,remoteAuthority:c}},x=e.split(/@|%40/g).reverse();o(`activating remote resolvers ${x.join(" -> ")}`);let g;try{g=await Promise.all(x.map(l)).catch(async c=>{if(!(c instanceof b)||c._code!==D.InvalidAuthority)throw c;return s(`resolving nested authorities failed: ${c.message}`),[await l(e)]})}catch(c){return h(c)}const m=new ne;m.cancelAndSet(()=>o("waiting..."),1e3);let a,p;for(const[c,{authorityPrefix:E,resolver:I,remoteAuthority:w}]of g.entries())try{if(c===g.length-1)o("invoking final resolve()..."),f.mark(`code/extHost/willResolveAuthority/${E}`),a=await I.resolve(w,{resolveAttempt:t,execServer:p}),f.mark(`code/extHost/didResolveAuthorityOK/${E}`),o("setting tunnel factory..."),this._register(await this._extHostTunnelService.setTunnelFactory(I,L.isManagedResolvedAuthority(a)?a:void 0));else{if(o(`invoking resolveExecServer() for ${w}`),f.mark(`code/extHost/willResolveExecServer/${E}`),p=await I.resolveExecServer?.(w,{resolveAttempt:t,execServer:p}),!p)throw new b(`Exec server was not available for ${w}`,D.NoResolverFound);f.mark(`code/extHost/didResolveExecServerOK/${E}`)}}catch(B){return f.mark(`code/extHost/didResolveAuthorityError/${E}`),v("returned an error",B),m.dispose(),h(B)}m.dispose();const _={environmentTunnels:a.environmentTunnels,features:a.tunnelFeatures?{elevation:a.tunnelFeatures.elevation,privacyOptions:a.tunnelFeatures.privacyOptions,protocol:a.tunnelFeatures.protocol===void 0?!0:a.tunnelFeatures.protocol}:void 0},S={extensionHostEnv:a.extensionHostEnv,isTrusted:a.isTrusted,authenticationSession:a.authenticationSessionForInitializingExtensions?{id:a.authenticationSessionForInitializingExtensions.id,providerId:a.authenticationSessionForInitializingExtensions.providerId}:void 0};o(`returned ${L.isManagedResolvedAuthority(a)?"managed authority":`${a.host}:${a.port}`}`);let y;if(L.isManagedResolvedAuthority(a)){const c=t;this._extHostManagedSockets.setFactory(c,a.makeConnection),y={authority:e,connectTo:new pe(c),connectionToken:a.connectionToken}}else y={authority:e,connectTo:new _e(a.host,a.port),connectionToken:a.connectionToken};return{type:"ok",value:{authority:y,options:S,tunnelInformation:_}}}async $getCanonicalURI(e,t){this._logService.info(`$getCanonicalURI invoked for authority (${G(e)})`);const{resolver:i}=await this._activateAndGetResolver(e);if(!i)return null;const n=P.revive(t);if(typeof i.getCanonicalURI>"u")return n;const o=await ie(()=>i.getCanonicalURI(n));return o||n}async $startExtensionHost(e){e.toAdd.forEach(s=>s.extensionLocation=P.revive(s.extensionLocation));const{globalRegistry:t,myExtensions:i}=X(this._activationEventsReader,this._globalRegistry,this._myRegistry,e),n=await this._createExtensionPathIndex(i);return(await this.getExtensionPathIndex()).setSearchTree(n),this._globalRegistry.set(t.getAllExtensionDescriptions()),this._myRegistry.set(i),R&&(this._logService.info(`$startExtensionHost: global extensions: ${T(this._globalRegistry)}`),this._logService.info(`$startExtensionHost: local extensions: ${T(this._myRegistry)}`)),this._startExtensionHost()}$activateByEvent(e,t){return t===je.Immediate?this._almostReadyToRunExtensions.wait().then(i=>this._activateByEvent(e,!1)):this._readyToRunExtensions.wait().then(i=>this._activateByEvent(e,!1))}async $activate(e,t){return await this._readyToRunExtensions.wait(),this._myRegistry.getExtensionDescription(e)?(await this._activateById(e,t),!0):!1}async $deltaExtensions(e){e.toAdd.forEach(s=>s.extensionLocation=P.revive(s.extensionLocation));const{globalRegistry:t,myExtensions:i}=X(this._activationEventsReader,this._globalRegistry,this._myRegistry,e),n=await this._createExtensionPathIndex(i);return(await this.getExtensionPathIndex()).setSearchTree(n),this._globalRegistry.set(t.getAllExtensionDescriptions()),this._myRegistry.set(i),R&&(this._logService.info(`$deltaExtensions: global extensions: ${T(this._globalRegistry)}`),this._logService.info(`$deltaExtensions: local extensions: ${T(this._myRegistry)}`)),Promise.resolve(void 0)}async $test_latency(e){return e}async $test_up(e){return e.byteLength}async $test_down(e){const t=oe.alloc(e),i=Math.random()%256;for(let n=0;n<e;n++)t.writeUInt8(i,n);return t}async $updateRemoteConnectionData(e){this._remoteConnectionData=e,this._onDidChangeRemoteConnectionData.fire()}};A=W([u(0,Ee),u(1,Je),u(2,ke),u(3,Ne),u(4,ye),u(5,fe),u(6,Ae),u(7,Be),u(8,Oe),u(9,We),u(10,we),u(11,He),u(12,be)],A);function X(d,r,e,t){d.addActivationEvents(t.addActivationEvents);const i=new C(d,r.getAllExtensionDescriptions());i.deltaExtensions(t.toAdd,t.toRemove);const n=new K(e.getAllExtensionDescriptions().map(s=>s.identifier));for(const s of t.myToRemove)n.delete(s);for(const s of t.myToAdd)n.add(s);const o=Z(i,n);return{globalRegistry:i,myExtensions:o}}function Y(d,r){return{id:d.identifier.value,name:d.name,extensionVersion:d.version,publisherDisplayName:d.publisher,activationEvents:d.activationEvents?d.activationEvents.join(","):null,isBuiltin:d.isBuiltin,reason:r.activationEvent,reasonId:r.extensionId.value}}function T(d){return d.getAllExtensionDescriptions().map(r=>r.identifier.value).join(",")}const ai=J("IExtHostExtensionService");class Ge{#e;#i;#t;id;extensionUri;extensionPath;packageJSON;extensionKind;isFromDifferentExtensionHost;constructor(r,e,t,i,n){this.#e=r,this.#i=e,this.#t=t.identifier,this.id=t.identifier.value,this.extensionUri=t.extensionLocation,this.extensionPath=M.normalize(j(t.extensionLocation)),this.packageJSON=t,this.extensionKind=i,this.isFromDifferentExtensionHost=n}get isActive(){return this.#e.isActivated(this.#t)}get exports(){if(!(this.packageJSON.api==="none"||this.isFromDifferentExtensionHost))return this.#e.getExtensionExports(this.#t)}async activate(){if(this.isFromDifferentExtensionHost)throw new Error("Cannot activate foreign extension");return await this.#e.activateByIdWithErrors(this.#t,{startup:!1,extensionId:this.#i,activationEvent:"api"}),this.exports}}function Z(d,r){return d.getAllExtensionDescriptions().filter(e=>r.has(e.identifier))}class qe{constructor(r){this._searchTree=r}setSearchTree(r){this._searchTree=r}findSubstr(r){return this._searchTree.findSubstr(r)}forEach(r){return this._searchTree.forEach(r)}}class Qe{_map=new me;constructor(r){this.addActivationEvents(r)}readActivationEvents(r){return this._map.get(r.identifier)??[]}addActivationEvents(r){for(const e of Object.keys(r))this._map.set(e,r[e])}}export{A as AbstractExtHostExtensionService,Ge as Extension,qe as ExtensionPaths,ai as IExtHostExtensionService,Je as IHostUtils};
