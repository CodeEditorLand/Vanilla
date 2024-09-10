import*as d from"../../../base/common/errors.js";import*as _ from"../../../base/common/performance.js";import{URI as t}from"../../../base/common/uri.js";import{MainContext as g}from"./extHost.protocol.js";import{RPCProtocol as k}from"../../services/extensions/common/rpcProtocol.js";import{ILogService as E}from"../../../platform/log/common/log.js";import{getSingletonServiceDescriptors as w}from"../../../platform/instantiation/common/extensions.js";import{ServiceCollection as P}from"../../../platform/instantiation/common/serviceCollection.js";import{IExtHostInitDataService as M}from"./extHostInitDataService.js";import{InstantiationService as L}from"../../../platform/instantiation/common/instantiationService.js";import{IExtHostRpcService as h,ExtHostRpcService as F}from"./extHostRpcService.js";import{IURITransformerService as b,URITransformerService as C}from"./extHostUriTransformerService.js";import{IExtHostExtensionService as H,IHostUtils as $}from"./extHostExtensionService.js";import{IExtHostTelemetry as B}from"./extHostTelemetry.js";class T{static async installEarlyHandler(e){Error.stackTraceLimit=100;const r=e.get(E),o=e.get(h).getProxy(g.MainThreadErrors);d.setUnexpectedErrorHandler(m=>{r.error(m);const a=d.transformErrorForSerialization(m);o.$onUnexpectedError(a)})}static async installFullHandler(e){const r=e.get(E),s=e.get(h),o=e.get(H),m=e.get(B),a=s.getProxy(g.MainThreadExtensionService),l=s.getProxy(g.MainThreadErrors),v=await o.getExtensionPathIndex(),p=new WeakMap;function f(n,c){if(p.has(n))return p.get(n).stack;let i="",I,S;for(const R of c)i+=`
	at ${R.toString()}`,S=R.getFileName(),!I&&S&&(I=v.findSubstr(t.file(S)));const u=`${n.name||"Error"}: ${n.message||""}${i}`;return p.set(n,{extensionIdentifier:I?.identifier,stack:u}),u}const U=Symbol("prepareStackTrace wrapped");let x=f;Object.defineProperty(Error,"prepareStackTrace",{configurable:!1,get(){return x},set(n){if(n===f||!n||n[U]){x=n||f;return}x=function(c,i){return f(c,i),n.call(Error,c,i)},Object.assign(x,{[U]:!0})}}),d.setUnexpectedErrorHandler(n=>{r.error(n);const c=d.transformErrorForSerialization(n),i=p.get(n);if(!i?.extensionIdentifier){l.$onUnexpectedError(c);return}a.$onExtensionRuntimeError(i.extensionIdentifier,c);const I=m.onExtensionError(i.extensionIdentifier,n);r.trace("forwarded error to extension?",I,i)})}}class y{_hostUtils;_rpcProtocol;_extensionService;_logService;constructor(e,r,s,o,m){this._hostUtils=s,this._rpcProtocol=new k(e,null,o),r=y._transform(r,this._rpcProtocol);const a=new P(...w());a.set(M,{_serviceBrand:void 0,...r,messagePorts:m}),a.set(h,new F(this._rpcProtocol)),a.set(b,new C(o)),a.set($,s);const l=new L(a,!0);l.invokeFunction(T.installEarlyHandler),this._logService=l.invokeFunction(v=>v.get(E)),_.mark("code/extHost/didCreateServices"),this._hostUtils.pid?this._logService.info(`Extension host with pid ${this._hostUtils.pid} started`):this._logService.info("Extension host started"),this._logService.trace("initData",r),this._extensionService=l.invokeFunction(v=>v.get(H)),this._extensionService.initialize(),l.invokeFunction(T.installFullHandler)}async asBrowserUri(e){const r=this._rpcProtocol.getProxy(g.MainThreadExtensionService);return t.revive(await r.$asBrowserUri(e))}terminate(e){this._extensionService.terminate(e)}static _transform(e,r){e.extensions.allExtensions.forEach(o=>{o.extensionLocation=t.revive(r.transformIncomingURIs(o.extensionLocation))}),e.environment.appRoot=t.revive(r.transformIncomingURIs(e.environment.appRoot));const s=e.environment.extensionDevelopmentLocationURI;return s&&(e.environment.extensionDevelopmentLocationURI=s.map(o=>t.revive(r.transformIncomingURIs(o)))),e.environment.extensionTestsLocationURI=t.revive(r.transformIncomingURIs(e.environment.extensionTestsLocationURI)),e.environment.globalStorageHome=t.revive(r.transformIncomingURIs(e.environment.globalStorageHome)),e.environment.workspaceStorageHome=t.revive(r.transformIncomingURIs(e.environment.workspaceStorageHome)),e.environment.extensionTelemetryLogResource=t.revive(r.transformIncomingURIs(e.environment.extensionTelemetryLogResource)),e.nlsBaseUrl=t.revive(r.transformIncomingURIs(e.nlsBaseUrl)),e.logsLocation=t.revive(r.transformIncomingURIs(e.logsLocation)),e.workspace=r.transformIncomingURIs(e.workspace),e}}export{T as ErrorHandler,y as ExtensionHostMain};
