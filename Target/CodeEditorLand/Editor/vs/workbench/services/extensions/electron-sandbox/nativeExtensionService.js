var J=Object.defineProperty;var Q=Object.getOwnPropertyDescriptor;var y=(h,a,e,o)=>{for(var t=o>1?void 0:o?Q(a,e):a,n=h.length-1,r;n>=0;n--)(r=h[n])&&(t=(o?r(a,e,t):r(t))||t);return o&&t&&J(a,e,t),t},s=(h,a)=>(e,o)=>a(e,o,h);import{runWhenWindowIdle as X}from"../../../../base/browser/dom.js";import{mainWindow as Y}from"../../../../base/browser/window.js";import{CancellationToken as Z}from"../../../../base/common/cancellation.js";import{Schemas as ee}from"../../../../base/common/network.js";import*as D from"../../../../base/common/performance.js";import{isCI as v}from"../../../../base/common/platform.js";import*as m from"../../../../nls.js";import{Categories as te}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as oe,registerAction2 as ne}from"../../../../platform/actions/common/actions.js";import{ICommandService as ie}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as b}from"../../../../platform/configuration/common/configuration.js";import{ConfigurationScope as T}from"../../../../platform/configuration/common/configurationRegistry.js";import{IDialogService as se}from"../../../../platform/dialogs/common/dialogs.js";import{IExtensionGalleryService as re}from"../../../../platform/extensionManagement/common/extensionManagement.js";import{IFileService as ae}from"../../../../platform/files/common/files.js";import{InstantiationType as ce,registerSingleton as le}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as M}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as P}from"../../../../platform/log/common/log.js";import{INativeHostService as me}from"../../../../platform/native/common/native.js";import{INotificationService as xe,NotificationPriority as z,Severity as u}from"../../../../platform/notification/common/notification.js";import{IOpenerService as he}from"../../../../platform/opener/common/opener.js";import{IProductService as ve}from"../../../../platform/product/common/productService.js";import{PersistentConnectionEventType as pe}from"../../../../platform/remote/common/remoteAgentConnection.js";import{IRemoteAuthorityResolverService as N,RemoteAuthorityResolverError as F,RemoteConnectionType as Ee,getRemoteAuthorityPrefix as f}from"../../../../platform/remote/common/remoteAuthorityResolver.js";import{IRemoteExtensionsScannerService as de}from"../../../../platform/remote/common/remoteExtensionsScanner.js";import{getRemoteName as ue,parseAuthorityWithPort as fe}from"../../../../platform/remote/common/remoteHosts.js";import{updateProxyConfigurationsScope as Se}from"../../../../platform/request/common/request.js";import{ITelemetryService as ge}from"../../../../platform/telemetry/common/telemetry.js";import{IWorkspaceContextService as Ie}from"../../../../platform/workspace/common/workspace.js";import{IWorkspaceTrustManagementService as ye}from"../../../../platform/workspace/common/workspaceTrust.js";import{IWorkbenchEnvironmentService as k}from"../../environment/common/environmentService.js";import{EnablementState as _e,IWorkbenchExtensionEnablementService as U,IWorkbenchExtensionManagementService as Re}from"../../extensionManagement/common/extensionManagement.js";import{WebWorkerExtensionHost as He}from"../browser/webWorkerExtensionHost.js";import{AbstractExtensionService as be,ExtensionHostCrashTracker as Pe,ResolvedExtensions as ke,checkEnabledAndProposedAPI as Ce,extensionIsEnabled as We}from"../common/abstractExtensionService.js";import{parseExtensionDevOptions as we}from"../common/extensionDevOptions.js";import{ExtensionHostKind as x,ExtensionRunningPreference as p,extensionHostKindToString as Le,extensionRunningPreferenceToString as Ae}from"../common/extensionHostKind.js";import{ExtensionHostExitCode as De}from"../common/extensionHostProtocol.js";import{IExtensionManifestPropertiesService as Te}from"../common/extensionManifestPropertiesService.js";import{filterExtensionDescriptions as Me}from"../common/extensionRunningLocationTracker.js";import{ExtensionHostExtensions as _,ExtensionHostStartup as S,IExtensionService as $,toExtension as ze,webWorkerExtHostConfig as Ne}from"../common/extensions.js";import{ExtensionsProposedApi as Fe}from"../common/extensionsProposedApi.js";import{RemoteExtensionHost as Ue}from"../common/remoteExtensionHost.js";import{CachedExtensionScanner as $e}from"./cachedExtensionScanner.js";import{NativeLocalProcessExtensionHost as Ke}from"./localProcessExtensionHost.js";import{IHostService as K}from"../../host/browser/host.js";import{ILifecycleService as Ge,LifecyclePhase as Oe}from"../../lifecycle/common/lifecycle.js";import{IRemoteAgentService as G}from"../../remote/common/remoteAgentService.js";import{IRemoteExplorerService as Be}from"../../remote/common/remoteExplorerService.js";let g=class extends be{constructor(e,o,t,n,r,i,c,l,d,R,B,H,C,j,W,w,qe,Je,Qe,Xe,Ye,V){const L=e.createInstance(Fe),A=e.createInstance($e),q=new I(L,A,()=>this._getExtensionRegistrySnapshotWhenReady(),e,t,r,R,C,w,H);super(L,q,new E(t,R,H),e,o,t,n,r,i,c,l,d,R,B,H,C,j,W,w,V);this._nativeHostService=qe;this._hostService=Je;this._remoteExplorerService=Qe;this._extensionGalleryService=Xe;this._workspaceTrustManagementService=Ye;this._extensionScanner=A,W.when(Oe.Ready).then(()=>{X(Y,()=>{this._initialize()},50)})}_extensionScanner;_localCrashTracker=new Pe;async _scanAllLocalExtensions(){return this._extensionScanner.scannedExtensions}_onExtensionHostCrashed(e,o,t){const n=[],r=this.getExtensionsStatus();for(const i of Object.keys(r)){const c=r[i];c.activationStarted&&e.containsExtension(c.id)&&n.push(c.id)}if(super._onExtensionHostCrashed(e,o,t),e.kind===x.LocalProcess){if(o===De.VersionMismatch){this._notificationService.prompt(u.Error,m.localize("extensionService.versionMismatchCrash","Extension host cannot start: version mismatch."),[{label:m.localize("relaunch","Relaunch VS Code"),run:()=>{this._instantiationService.invokeFunction(i=>{i.get(K).restart()})}}]);return}if(this._logExtensionHostCrash(e),this._sendExtensionHostCrashTelemetry(o,t,n),this._localCrashTracker.registerCrash(),this._localCrashTracker.shouldAutomaticallyRestart())this._logService.info("Automatically restarting the extension host."),this._notificationService.status(m.localize("extensionService.autoRestart","The extension host terminated unexpectedly. Restarting..."),{hideAfter:5e3}),this.startExtensionHosts();else{const i=[];this._environmentService.isBuilt?i.push({label:m.localize("startBisect","Start Extension Bisect"),run:()=>{this._instantiationService.invokeFunction(c=>{c.get(ie).executeCommand("extension.bisect.start")})}}):i.push({label:m.localize("devTools","Open Developer Tools"),run:()=>this._nativeHostService.openDevTools()}),i.push({label:m.localize("restart","Restart Extension Host"),run:()=>this.startExtensionHosts()}),this._environmentService.isBuilt&&i.push({label:m.localize("learnMore","Learn More"),run:()=>{this._instantiationService.invokeFunction(c=>{c.get(he).open("https://aka.ms/vscode-extension-bisect")})}}),this._notificationService.prompt(u.Error,m.localize("extensionService.crash","Extension host terminated unexpectedly 3 times within the last 5 minutes."),i)}}}_sendExtensionHostCrashTelemetry(e,o,t){this._telemetryService.publicLog2("extensionHostCrash",{code:e,signal:o,extensionIds:t.map(n=>n.value)});for(const n of t)this._telemetryService.publicLog2("extensionHostCrashExtension",{code:e,signal:o,extensionId:n.value})}async _resolveAuthority(e){if(e.indexOf("+")===-1){const{host:t,port:n}=fe(e);return{authority:{authority:e,connectTo:{type:Ee.WebSocket,host:t,port:n},connectionToken:void 0}}}return this._resolveAuthorityOnExtensionHosts(x.LocalProcess,e)}async _getCanonicalURI(e,o){if(e.indexOf("+")===-1)return o;const n=this._getExtensionHostManagers(x.LocalProcess);if(n.length===0)throw new Error("Cannot resolve canonical URI");const r=await Promise.all(n.map(i=>i.getCanonicalURI(e,o)));for(const i of r)if(i)return i;throw new Error(`Cannot get canonical URI because no extension is installed to resolve ${f(e)}`)}async _resolveExtensions(){this._extensionScanner.startScanningExtensions();const e=this._environmentService.remoteAuthority;let o=null,t=[];if(e){this._remoteAuthorityResolverService._setCanonicalURIProvider(async i=>{if(i.scheme!==ee.vscodeRemote||i.authority!==e)return i;D.mark(`code/willGetCanonicalURI/${f(e)}`),v&&this._logService.info(`Invoking getCanonicalURI for authority ${f(e)}...`);try{return this._getCanonicalURI(e,i)}finally{D.mark(`code/didGetCanonicalURI/${f(e)}`),v&&this._logService.info(`getCanonicalURI returned for authority ${f(e)}.`)}}),v&&this._logService.info("Starting to wait on IWorkspaceTrustManagementService.workspaceResolved..."),await this._workspaceTrustManagementService.workspaceResolved,v&&this._logService.info("Finished waiting on IWorkspaceTrustManagementService.workspaceResolved.");let n;try{n=await this._resolveAuthorityInitial(e)}catch(i){return F.isNoResolverFound(i)?i.isHandled=await this._handleNoResolverFound(e):F.isHandled(i)&&console.log("Error handled: Not showing a notification for the error"),this._remoteAuthorityResolverService._setResolvedAuthorityError(e,i),this._startLocalExtensionHost()}this._remoteAuthorityResolverService._setResolvedAuthority(n.authority,n.options),this._remoteExplorerService.setTunnelInformation(n.tunnelInformation);const r=this._remoteAgentService.getConnection();if(r&&(r.onDidStateChange(async i=>{i.type===pe.ConnectionLost&&this._remoteAuthorityResolverService._clearResolvedAuthority(e)}),r.onReconnecting(()=>this._resolveAuthorityAgain())),[o,t]=await Promise.all([this._remoteAgentService.getEnvironment(),this._remoteExtensionsScannerService.scanExtensions()]),!o)return this._notificationService.notify({severity:u.Error,message:m.localize("getEnvironmentFailure","Could not fetch remote environment")}),this._startLocalExtensionHost();Se(o.useHostProxy?T.APPLICATION:T.MACHINE)}else this._remoteAuthorityResolverService._setCanonicalURIProvider(async n=>n);return this._startLocalExtensionHost(t)}async _startLocalExtensionHost(e=[]){return await this._workspaceTrustManagementService.workspaceTrustInitialized,new ke(await this._scanAllLocalExtensions(),e,!0,!1)}async _onExtensionHostExit(e){await this._doStopExtensionHosts(),this._remoteAgentService.getConnection()?.dispose(),we(this._environmentService).isExtensionDevTestFromCli?(v&&this._logService.info(`Asking native host service to exit with code ${e}.`),this._nativeHostService.exit(e)):this._nativeHostService.closeWindow()}async _handleNoResolverFound(e){const o=ue(e),t=this._productService.remoteExtensionTips?.[o];if(!t)return!1;const n=l=>{this._telemetryService.publicLog("remoteExtensionRecommendations:popup",{userReaction:l,extensionId:r})},r=t.extensionId,c=(await this._scanAllLocalExtensions()).filter(l=>l.identifier.value===r)[0];if(c){if(!We(this._logService,this._extensionEnablementService,c,!1)){const l=m.localize("enableResolver",`Extension '{0}' is required to open the remote window.
OK to enable?`,t.friendlyName);this._notificationService.prompt(u.Info,l,[{label:m.localize("enable","Enable and Reload"),run:async()=>{n("enable"),await this._extensionEnablementService.setEnablement([ze(c)],_e.EnabledGlobally),await this._hostService.reload()}}],{sticky:!0,priority:z.URGENT})}}else{const l=m.localize("installResolver",`Extension '{0}' is required to open the remote window.
Do you want to install the extension?`,t.friendlyName);this._notificationService.prompt(u.Info,l,[{label:m.localize("install","Install and Reload"),run:async()=>{n("install");const[d]=await this._extensionGalleryService.getExtensions([{id:r}],Z.None);d?(await this._extensionManagementService.installFromGallery(d),await this._hostService.reload()):this._notificationService.error(m.localize("resolverExtensionNotFound","`{0}` not found on marketplace"))}}],{sticky:!0,priority:z.URGENT,onCancel:()=>n("cancel")})}return!0}};g=y([s(0,M),s(1,xe),s(2,k),s(3,ge),s(4,U),s(5,ae),s(6,ve),s(7,Re),s(8,Ie),s(9,b),s(10,Te),s(11,P),s(12,G),s(13,de),s(14,Ge),s(15,N),s(16,me),s(17,K),s(18,Be),s(19,re),s(20,ye),s(21,se)],g);let I=class{constructor(a,e,o,t,n,r,i,c,l,d){this._extensionsProposedApi=a;this._extensionScanner=e;this._getExtensionRegistrySnapshotWhenReady=o;this._instantiationService=t;this._extensionEnablementService=r;this._remoteAgentService=c;this._remoteAuthorityResolverService=l;this._logService=d;this._webWorkerExtHostEnablement=O(n,i)}_webWorkerExtHostEnablement;createExtensionHost(a,e,o){switch(e.kind){case x.LocalProcess:{const t=o?S.EagerManualStart:S.EagerAutoStart;return this._instantiationService.createInstance(Ke,e,t,this._createLocalProcessExtensionHostDataProvider(a,o,e))}case x.LocalWebWorker:{if(this._webWorkerExtHostEnablement!==0){const t=o?this._webWorkerExtHostEnablement===2?S.Lazy:S.EagerManualStart:S.EagerAutoStart;return this._instantiationService.createInstance(He,e,t,this._createWebWorkerExtensionHostDataProvider(a,e))}return null}case x.Remote:{const t=this._remoteAgentService.getConnection();return t?this._instantiationService.createInstance(Ue,e,this._createRemoteExtensionHostDataProvider(a,t.remoteAuthority)):null}}}_createLocalProcessExtensionHostDataProvider(a,e,o){return{getInitData:async()=>{if(e){const t=await this._extensionScanner.scannedExtensions;v&&this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.scannedExtensions: ${t.map(l=>l.identifier.value).join(",")}`);const n=Ce(this._logService,this._extensionEnablementService,this._extensionsProposedApi,t,!0);v&&this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.localExtensions: ${n.map(l=>l.identifier.value).join(",")}`);const r=a.computeRunningLocation(n,[],!1),i=Me(n,r,l=>o.equals(l)),c=new _(0,n,i.map(l=>l.identifier));return v&&this._logService.info(`NativeExtensionHostFactory._createLocalProcessExtensionHostDataProvider.myExtensions: ${i.map(l=>l.identifier.value).join(",")}`),{extensions:c}}else{const t=await this._getExtensionRegistrySnapshotWhenReady(),n=a.filterByRunningLocation(t.extensions,o);return{extensions:new _(t.versionId,t.extensions,n.map(i=>i.identifier))}}}}}_createWebWorkerExtensionHostDataProvider(a,e){return{getInitData:async()=>{const o=await this._getExtensionRegistrySnapshotWhenReady(),t=a.filterByRunningLocation(o.extensions,e);return{extensions:new _(o.versionId,o.extensions,t.map(r=>r.identifier))}}}}_createRemoteExtensionHostDataProvider(a,e){return{remoteAuthority:e,getInitData:async()=>{const o=await this._getExtensionRegistrySnapshotWhenReady(),t=await this._remoteAgentService.getEnvironment();if(!t)throw new Error("Cannot provide init data for remote extension host!");const n=a.filterByExtensionHostKind(o.extensions,x.Remote),r=new _(o.versionId,o.extensions,n.map(i=>i.identifier));return{connectionData:this._remoteAuthorityResolverService.getConnectionData(e),pid:t.pid,appRoot:t.appRoot,extensionHostLogsPath:t.extensionHostLogsPath,globalStorageHome:t.globalStorageHome,workspaceStorageHome:t.workspaceStorageHome,extensions:r}}}}};I=y([s(3,M),s(4,k),s(5,U),s(6,b),s(7,G),s(8,N),s(9,P)],I);function O(h,a){if(h.isExtensionDevelopment&&h.extensionDevelopmentKind?.some(e=>e==="web"))return 1;{const e=a.getValue(Ne);return e===!0?1:e==="auto"?2:0}}var je=(o=>(o[o.Disabled=0]="Disabled",o[o.Eager=1]="Eager",o[o.Lazy=2]="Lazy",o))(je||{});let E=class{constructor(a,e,o){this._logService=o;this._hasRemoteExtHost=!!a.remoteAuthority;const t=O(a,e);this._hasWebWorkerExtHost=t!==0}_hasRemoteExtHost;_hasWebWorkerExtHost;pickExtensionHostKind(a,e,o,t,n){const r=E.pickExtensionHostKind(e,o,t,n,this._hasRemoteExtHost,this._hasWebWorkerExtHost);return this._logService.trace(`pickRunningLocation for ${a.value}, extension kinds: [${e.join(", ")}], isInstalledLocally: ${o}, isInstalledRemotely: ${t}, preference: ${Ae(n)} => ${Le(r)}`),r}static pickExtensionHostKind(a,e,o,t,n,r){const i=[];for(const c of a){if(c==="ui"&&e){if(t===p.None||t===p.Local)return x.LocalProcess;i.push(x.LocalProcess)}if(c==="workspace"&&o){if(t===p.None||t===p.Remote)return x.Remote;i.push(x.Remote)}if(c==="workspace"&&!n){if(t===p.None||t===p.Local)return x.LocalProcess;i.push(x.LocalProcess)}if(c==="web"&&e&&r){if(t===p.None||t===p.Local)return x.LocalWebWorker;i.push(x.LocalWebWorker)}}return i.length>0?i[0]:null}};E=y([s(0,k),s(1,b),s(2,P)],E);class Ve extends oe{constructor(){super({id:"workbench.action.restartExtensionHost",title:m.localize2("restartExtensionHost","Restart Extension Host"),category:te.Developer,f1:!0})}async run(a){const e=a.get($);await e.stopExtensionHosts(m.localize("restartExtensionHost.reason","Restarting extension host on explicit request."))&&e.startExtensionHosts()}}ne(Ve),le($,g,ce.Eager);export{E as NativeExtensionHostKindPicker,g as NativeExtensionService};
