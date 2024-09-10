var F=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var h=(l,s,t,n)=>{for(var e=n>1?void 0:n?K(s,t):s,o=l.length-1,r;o>=0;o--)(r=l[o])&&(e=(n?r(s,t,e):r(e))||e);return n&&e&&F(s,t,e),e},i=(l,s)=>(t,n)=>s(t,n,l);import{mainWindow as z}from"../../../../base/browser/window.js";import{Schemas as _}from"../../../../base/common/network.js";import{IConfigurationService as U}from"../../../../platform/configuration/common/configuration.js";import{IDialogService as $}from"../../../../platform/dialogs/common/dialogs.js";import"../../../../platform/environment/common/environment.js";import"../../../../platform/extensions/common/extensions.js";import{IFileService as N}from"../../../../platform/files/common/files.js";import{InstantiationType as j,registerSingleton as q}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as b}from"../../../../platform/instantiation/common/instantiation.js";import{getLogs as O}from"../../../../platform/log/browser/log.js";import{ILogService as S}from"../../../../platform/log/common/log.js";import{INotificationService as G}from"../../../../platform/notification/common/notification.js";import{IProductService as J}from"../../../../platform/product/common/productService.js";import{PersistentConnectionEventType as Q}from"../../../../platform/remote/common/remoteAgentConnection.js";import{IRemoteAuthorityResolverService as P,RemoteAuthorityResolverError as V}from"../../../../platform/remote/common/remoteAuthorityResolver.js";import{IRemoteExtensionsScannerService as X}from"../../../../platform/remote/common/remoteExtensionsScanner.js";import{ITelemetryService as Y}from"../../../../platform/telemetry/common/telemetry.js";import{IWorkspaceContextService as Z}from"../../../../platform/workspace/common/workspace.js";import{IWorkspaceTrustManagementService as B}from"../../../../platform/workspace/common/workspaceTrust.js";import{IBrowserWorkbenchEnvironmentService as ee}from"../../environment/browser/environmentService.js";import{IWebExtensionsScannerService as te,IWorkbenchExtensionEnablementService as W,IWorkbenchExtensionManagementService as ne}from"../../extensionManagement/common/extensionManagement.js";import{WebWorkerExtensionHost as oe}from"./webWorkerExtensionHost.js";import{FetchFileSystemProvider as ie}from"./webWorkerFileSystemProvider.js";import{AbstractExtensionService as re,ResolvedExtensions as se,checkEnabledAndProposedAPI as ae}from"../common/abstractExtensionService.js";import"../common/extensionDescriptionRegistry.js";import{ExtensionHostKind as c,ExtensionRunningPreference as p,extensionHostKindToString as ce,extensionRunningPreferenceToString as me}from"../common/extensionHostKind.js";import{IExtensionManifestPropertiesService as le}from"../common/extensionManifestPropertiesService.js";import"../common/extensionRunningLocation.js";import{filterExtensionDescriptions as ve}from"../common/extensionRunningLocationTracker.js";import{ExtensionHostExtensions as I,ExtensionHostStartup as D,IExtensionService as pe,toExtensionDescription as f}from"../common/extensions.js";import{ExtensionsProposedApi as xe}from"../common/extensionsProposedApi.js";import{dedupExtensions as Ee}from"../common/extensionsUtil.js";import{RemoteExtensionHost as he}from"../common/remoteExtensionHost.js";import{ILifecycleService as ue,LifecyclePhase as Se}from"../../lifecycle/common/lifecycle.js";import{IRemoteAgentService as A}from"../../remote/common/remoteAgentService.js";import{IRemoteExplorerService as Ie}from"../../remote/common/remoteExplorerService.js";import{IUserDataInitializationService as fe}from"../../userData/browser/userDataInit.js";import{IUserDataProfileService as de}from"../../userDataProfile/common/userDataProfile.js";let x=class extends re{constructor(t,n,e,o,r,a,v,k,w,H,L,ge,u,d,T,g,R,Re,ye,_e,be,C){const y=t.createInstance(xe),M=new E(y,()=>this._scanWebExtensions(),()=>this._getExtensionRegistrySnapshotWhenReady(),t,d,R,r,u);super(y,M,new m(u),t,n,e,o,r,a,v,k,w,H,L,u,d,T,g,R,C);this._browserEnvironmentService=e;this._webExtensionsScannerService=ge;this._userDataInitializationService=Re;this._userDataProfileService=ye;this._workspaceTrustManagementService=_e;this._remoteExplorerService=be;g.when(Se.Ready).then(async()=>{await this._userDataInitializationService.initializeInstalledExtensions(this._instantiationService),this._initialize()}),this._initFetchFileSystem()}_initFetchFileSystem(){const t=new ie;this._register(this._fileService.registerProvider(_.http,t)),this._register(this._fileService.registerProvider(_.https,t))}async _scanWebExtensions(){const t=[],n=[],e=[];try{await Promise.all([this._webExtensionsScannerService.scanSystemExtensions().then(o=>t.push(...o.map(r=>f(r)))),this._webExtensionsScannerService.scanUserExtensions(this._userDataProfileService.currentProfile.extensionsResource,{skipInvalidExtensions:!0}).then(o=>n.push(...o.map(r=>f(r)))),this._webExtensionsScannerService.scanExtensionsUnderDevelopment().then(o=>e.push(...o.map(r=>f(r,!0))))])}catch(o){this._logService.error(o)}return Ee(t,n,[],e,this._logService)}async _resolveExtensionsDefault(){const[t,n]=await Promise.all([this._scanWebExtensions(),this._remoteExtensionsScannerService.scanExtensions()]);return new se(t,n,!1,!0)}async _resolveExtensions(){if(!this._browserEnvironmentService.expectsResolverExtension)return this._resolveExtensionsDefault();const t=this._environmentService.remoteAuthority;await this._workspaceTrustManagementService.workspaceResolved;let n;try{n=await this._resolveAuthorityInitial(t)}catch(o){return V.isHandled(o)&&console.log("Error handled: Not showing a notification for the error"),this._remoteAuthorityResolverService._setResolvedAuthorityError(t,o),this._resolveExtensionsDefault()}this._remoteAuthorityResolverService._setResolvedAuthority(n.authority,n.options),this._remoteExplorerService.setTunnelInformation(n.tunnelInformation);const e=this._remoteAgentService.getConnection();return e&&(e.onDidStateChange(async o=>{o.type===Q.ConnectionLost&&this._remoteAuthorityResolverService._clearResolvedAuthority(t)}),e.onReconnecting(()=>this._resolveAuthorityAgain())),this._resolveExtensionsDefault()}async _onExtensionHostExit(t){await this._doStopExtensionHosts();const n=z;typeof n.codeAutomationExit=="function"&&n.codeAutomationExit(t,await O(this._fileService,this._environmentService))}async _resolveAuthority(t){return this._resolveAuthorityOnExtensionHosts(c.LocalWebWorker,t)}};x=h([i(0,b),i(1,G),i(2,ee),i(3,Y),i(4,W),i(5,N),i(6,J),i(7,ne),i(8,Z),i(9,U),i(10,le),i(11,te),i(12,S),i(13,A),i(14,X),i(15,ue),i(16,P),i(17,fe),i(18,de),i(19,B),i(20,Ie),i(21,$)],x);let E=class{constructor(s,t,n,e,o,r,a,v){this._extensionsProposedApi=s;this._scanWebExtensions=t;this._getExtensionRegistrySnapshotWhenReady=n;this._instantiationService=e;this._remoteAgentService=o;this._remoteAuthorityResolverService=r;this._extensionEnablementService=a;this._logService=v}createExtensionHost(s,t,n){switch(t.kind){case c.LocalProcess:return null;case c.LocalWebWorker:{const e=n?D.EagerManualStart:D.EagerAutoStart;return this._instantiationService.createInstance(oe,t,e,this._createLocalExtensionHostDataProvider(s,t,n))}case c.Remote:{const e=this._remoteAgentService.getConnection();return e?this._instantiationService.createInstance(he,t,this._createRemoteExtensionHostDataProvider(s,e.remoteAuthority)):null}}}_createLocalExtensionHostDataProvider(s,t,n){return{getInitData:async()=>{if(n){const e=ae(this._logService,this._extensionEnablementService,this._extensionsProposedApi,await this._scanWebExtensions(),!0),o=s.computeRunningLocation(e,[],!1),r=ve(e,o,v=>t.equals(v));return{extensions:new I(0,e,r.map(v=>v.identifier))}}else{const e=await this._getExtensionRegistrySnapshotWhenReady(),o=s.filterByRunningLocation(e.extensions,t);return{extensions:new I(e.versionId,e.extensions,o.map(a=>a.identifier))}}}}}_createRemoteExtensionHostDataProvider(s,t){return{remoteAuthority:t,getInitData:async()=>{const n=await this._getExtensionRegistrySnapshotWhenReady(),e=await this._remoteAgentService.getEnvironment();if(!e)throw new Error("Cannot provide init data for remote extension host!");const o=s.filterByExtensionHostKind(n.extensions,c.Remote),r=new I(n.versionId,n.extensions,o.map(a=>a.identifier));return{connectionData:this._remoteAuthorityResolverService.getConnectionData(t),pid:e.pid,appRoot:e.appRoot,extensionHostLogsPath:e.extensionHostLogsPath,globalStorageHome:e.globalStorageHome,workspaceStorageHome:e.workspaceStorageHome,extensions:r}}}}};E=h([i(3,b),i(4,A),i(5,P),i(6,W),i(7,S)],E);let m=class{constructor(s){this._logService=s}pickExtensionHostKind(s,t,n,e,o){const r=m.pickRunningLocation(t,n,e,o);return this._logService.trace(`pickRunningLocation for ${s.value}, extension kinds: [${t.join(", ")}], isInstalledLocally: ${n}, isInstalledRemotely: ${e}, preference: ${me(o)} => ${ce(r)}`),r}static pickRunningLocation(s,t,n,e){const o=[];let r=!1;for(const a of s){if(a==="ui"&&n){if(e===p.Remote)return c.Remote;r=!0}if(a==="workspace"&&n){if(e===p.None||e===p.Remote)return c.Remote;o.push(c.Remote)}if(a==="web"&&(t||n)){if(e===p.None||e===p.Local)return c.LocalWebWorker;o.push(c.LocalWebWorker)}}return r&&o.push(c.Remote),o.length>0?o[0]:null}};m=h([i(0,S)],m),q(pe,x,j.Eager);export{m as BrowserExtensionHostKindPicker,x as ExtensionService};
