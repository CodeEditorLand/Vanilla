var I=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var p=(o,e,t,n)=>{for(var i=n>1?void 0:n?R(e,t):e,r=o.length-1,c;r>=0;r--)(c=o[r])&&(i=(n?c(e,t,i):c(i))||i);return n&&i&&I(e,t,i),i},a=(o,e)=>(t,n)=>e(t,n,o);import{Action as v}from"../../../base/common/actions.js";import"../../../base/common/buffer.js";import{CancellationToken as w}from"../../../base/common/cancellation.js";import{transformErrorFromSerialization as f}from"../../../base/common/errors.js";import{FileAccess as k}from"../../../base/common/network.js";import l from"../../../base/common/severity.js";import{URI as S}from"../../../base/common/uri.js";import{localize as s}from"../../../nls.js";import{ICommandService as C}from"../../../platform/commands/common/commands.js";import"../../../platform/extensionManagement/common/extensionManagement.js";import{areSameExtensions as P}from"../../../platform/extensionManagement/common/extensionManagementUtil.js";import"../../../platform/extensions/common/extensions.js";import{INotificationService as A}from"../../../platform/notification/common/notification.js";import{ManagedRemoteConnection as H,RemoteConnectionType as W,WebSocketRemoteConnection as D}from"../../../platform/remote/common/remoteAuthorityResolver.js";import{ExtHostContext as $,MainContext as u}from"../common/extHost.protocol.js";import{IExtensionsWorkbenchService as g}from"../../contrib/extensions/common/extensions.js";import{IWorkbenchEnvironmentService as N}from"../../services/environment/common/environmentService.js";import{EnablementState as m,IWorkbenchExtensionEnablementService as M}from"../../services/extensionManagement/common/extensionManagement.js";import{ExtensionHostKind as y}from"../../services/extensions/common/extensionHostKind.js";import"../../services/extensions/common/extensionHostProtocol.js";import"../../services/extensions/common/extensionHostProxy.js";import{IExtensionService as T}from"../../services/extensions/common/extensions.js";import{extHostNamedCustomer as B}from"../../services/extensions/common/extHostCustomers.js";import"../../services/extensions/common/proxyIdentifier.js";import{IHostService as U}from"../../services/host/browser/host.js";import{ITimerService as K}from"../../services/timer/browser/timerService.js";let d=class{constructor(e,t,n,i,r,c,_,x,E){this._extensionService=t;this._notificationService=n;this._extensionsWorkbenchService=i;this._hostService=r;this._extensionEnablementService=c;this._timerService=_;this._commandService=x;this._environmentService=E;this._extensionHostKind=e.extensionHostKind;const h=e;this._internalExtensionService=h.internalExtensionService,h._setExtensionHostProxy(new z(e.getProxy($.ExtHostExtensionService))),h._setAllMainProxyIdentifiers(Object.keys(u).map(b=>u[b]))}_extensionHostKind;_internalExtensionService;dispose(){}$getExtension(e){return this._extensionService.getExtension(e)}$activateExtension(e,t){return this._internalExtensionService._activateById(e,t)}async $onWillActivateExtension(e){this._internalExtensionService._onWillActivateExtension(e)}$onDidActivateExtension(e,t,n,i,r){this._internalExtensionService._onDidActivateExtension(e,t,n,i,r)}$onExtensionRuntimeError(e,t){const n=f(t);this._internalExtensionService._onExtensionRuntimeError(e,n),console.error(`[${e.value}]${n.message}`),console.error(n.stack)}async $onExtensionActivationError(e,t,n){const i=f(t);if(this._internalExtensionService._onDidActivateExtensionError(e,i),n){const c=await this._extensionService.getExtension(e.value);if(c){const x=(await this._extensionsWorkbenchService.queryLocal()).find(E=>P(E.identifier,{id:n.dependency}));if(x?.local){await this._handleMissingInstalledDependency(c,x.local);return}else{await this._handleMissingNotInstalledDependency(c,n.dependency);return}}}if(!this._environmentService.isBuilt||this._environmentService.isExtensionDevelopment){this._notificationService.error(i);return}console.error(i.message)}async _handleMissingInstalledDependency(e,t){const n=e.displayName||e.name;if(this._extensionEnablementService.isEnabled(t))this._notificationService.notify({severity:l.Error,message:s("reload window","Cannot activate the '{0}' extension because it depends on the '{1}' extension, which is not loaded. Would you like to reload the window to load the extension?",n,t.manifest.displayName||t.manifest.name),actions:{primary:[new v("reload",s("reload","Reload Window"),"",!0,()=>this._hostService.reload())]}});else{const i=this._extensionEnablementService.getEnablementState(t);i===m.DisabledByVirtualWorkspace?this._notificationService.notify({severity:l.Error,message:s("notSupportedInWorkspace","Cannot activate the '{0}' extension because it depends on the '{1}' extension which is not supported in the current workspace",n,t.manifest.displayName||t.manifest.name)}):i===m.DisabledByTrustRequirement?this._notificationService.notify({severity:l.Error,message:s("restrictedMode","Cannot activate the '{0}' extension because it depends on the '{1}' extension which is not supported in Restricted Mode",n,t.manifest.displayName||t.manifest.name),actions:{primary:[new v("manageWorkspaceTrust",s("manageWorkspaceTrust","Manage Workspace Trust"),"",!0,()=>this._commandService.executeCommand("workbench.trust.manage"))]}}):this._extensionEnablementService.canChangeEnablement(t)?this._notificationService.notify({severity:l.Error,message:s("disabledDep","Cannot activate the '{0}' extension because it depends on the '{1}' extension which is disabled. Would you like to enable the extension and reload the window?",n,t.manifest.displayName||t.manifest.name),actions:{primary:[new v("enable",s("enable dep","Enable and Reload"),"",!0,()=>this._extensionEnablementService.setEnablement([t],i===m.DisabledGlobally?m.EnabledGlobally:m.EnabledWorkspace).then(()=>this._hostService.reload(),r=>this._notificationService.error(r)))]}}):this._notificationService.notify({severity:l.Error,message:s("disabledDepNoAction","Cannot activate the '{0}' extension because it depends on the '{1}' extension which is disabled.",n,t.manifest.displayName||t.manifest.name)})}}async _handleMissingNotInstalledDependency(e,t){const n=e.displayName||e.name;let i=null;try{i=(await this._extensionsWorkbenchService.getExtensions([{id:t}],w.None))[0]}catch{}i?this._notificationService.notify({severity:l.Error,message:s("uninstalledDep","Cannot activate the '{0}' extension because it depends on the '{1}' extension from '{2}', which is not installed. Would you like to install the extension and reload the window?",n,i.displayName,i.publisherDisplayName),actions:{primary:[new v("install",s("install missing dep","Install and Reload"),"",!0,()=>this._extensionsWorkbenchService.install(i).then(()=>this._hostService.reload(),r=>this._notificationService.error(r)))]}}):this._notificationService.error(s("unknownDep","Cannot activate the '{0}' extension because it depends on an unknown '{1}' extension.",n,t))}async $setPerformanceMarks(e){this._extensionHostKind===y.LocalProcess?this._timerService.setPerformanceMarks("localExtHost",e):this._extensionHostKind===y.LocalWebWorker?this._timerService.setPerformanceMarks("workerExtHost",e):this._timerService.setPerformanceMarks("remoteExtHost",e)}async $asBrowserUri(e){return k.uriToBrowserUri(S.revive(e))}};d=p([B(u.MainThreadExtensionService),a(1,T),a(2,A),a(3,g),a(4,U),a(5,M),a(6,K),a(7,C),a(8,N)],d);class z{constructor(e){this._actual=e}async resolveAuthority(e,t){return L(await this._actual.$resolveAuthority(e,t))}async getCanonicalURI(e,t){const n=await this._actual.$getCanonicalURI(e,t);return n&&S.revive(n)}startExtensionHost(e){return this._actual.$startExtensionHost(e)}extensionTestsExecute(){return this._actual.$extensionTestsExecute()}activateByEvent(e,t){return this._actual.$activateByEvent(e,t)}activate(e,t){return this._actual.$activate(e,t)}setRemoteEnvironment(e){return this._actual.$setRemoteEnvironment(e)}updateRemoteConnectionData(e){return this._actual.$updateRemoteConnectionData(e)}deltaExtensions(e){return this._actual.$deltaExtensions(e)}test_latency(e){return this._actual.$test_latency(e)}test_up(e){return this._actual.$test_up(e)}test_down(e){return this._actual.$test_down(e)}}function L(o){return o.type==="ok"?{type:"ok",value:{...o.value,authority:V(o.value.authority)}}:o}function V(o){return{...o,connectTo:q(o.connectTo)}}function q(o){return o.type===W.WebSocket?new D(o.host,o.port):new H(o.id)}export{d as MainThreadExtensionService};
