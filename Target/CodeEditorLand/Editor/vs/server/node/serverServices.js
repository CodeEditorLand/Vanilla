import{hostname as se,release as me}from"os";import{Emitter as ce}from"../../base/common/event.js";import{toDisposable as ae}from"../../base/common/lifecycle.js";import{Schemas as $}from"../../base/common/network.js";import*as y from"../../base/common/path.js";import"../../base/common/uriIpc.js";import{getdevDeviceId as le,getMachineId as ve,getSqmMachineId as ge}from"../../base/node/id.js";import{Promises as M}from"../../base/node/pfs.js";import{IPCServer as fe,StaticRouter as Se}from"../../base/parts/ipc/common/ipc.js";import{ProtocolConstants as H}from"../../base/parts/ipc/common/ipc.net.js";import{localize as U}from"../../nls.js";import{IConfigurationService as pe}from"../../platform/configuration/common/configuration.js";import{ConfigurationService as de}from"../../platform/configuration/common/configurationService.js";import{CSSDevelopmentService as ue,ICSSDevelopmentService as Ce}from"../../platform/cssDev/node/cssDevService.js";import{ExtensionHostDebugBroadcastChannel as _}from"../../platform/debug/common/extensionHostDebugIpc.js";import{IDownloadService as he}from"../../platform/download/common/download.js";import{DownloadServiceChannelClient as Ie}from"../../platform/download/common/downloadIpc.js";import{IEnvironmentService as Ee,INativeEnvironmentService as we}from"../../platform/environment/common/environment.js";import{ExtensionGalleryServiceWithNoStorageService as xe}from"../../platform/extensionManagement/common/extensionGalleryService.js";import{IExtensionGalleryService as G}from"../../platform/extensionManagement/common/extensionManagement.js";import{ExtensionManagementCLI as ye}from"../../platform/extensionManagement/common/extensionManagementCLI.js";import{ExtensionManagementChannel as Le}from"../../platform/extensionManagement/common/extensionManagementIpc.js";import{IExtensionsProfileScannerService as Te}from"../../platform/extensionManagement/common/extensionsProfileScannerService.js";import{IExtensionsScannerService as F}from"../../platform/extensionManagement/common/extensionsScannerService.js";import{ExtensionManagementService as Pe,INativeServerExtensionManagementService as O}from"../../platform/extensionManagement/node/extensionManagementService.js";import{ExtensionSignatureVerificationService as Re,IExtensionSignatureVerificationService as Ae}from"../../platform/extensionManagement/node/extensionSignatureVerificationService.js";import{ExtensionsProfileScannerService as De}from"../../platform/extensionManagement/node/extensionsProfileScannerService.js";import{IFileService as be}from"../../platform/files/common/files.js";import{FileService as ke}from"../../platform/files/common/fileService.js";import{DiskFileSystemProvider as Ne}from"../../platform/files/node/diskFileSystemProvider.js";import{SyncDescriptor as g}from"../../platform/instantiation/common/descriptors.js";import"../../platform/instantiation/common/instantiation.js";import{InstantiationService as $e}from"../../platform/instantiation/common/instantiationService.js";import{ServiceCollection as Me}from"../../platform/instantiation/common/serviceCollection.js";import{ILanguagePackService as q}from"../../platform/languagePacks/common/languagePacks.js";import{NativeLanguagePackService as He}from"../../platform/languagePacks/node/languagePacks.js";import{AbstractLogger as Ue,DEFAULT_LOG_LEVEL as _e,getLogLevel as j,ILoggerService as Ge,ILogService as Fe,log as Oe,LogLevel as C,LogLevelToString as qe}from"../../platform/log/common/log.js";import{LoggerChannel as je}from"../../platform/log/common/logIpc.js";import{LogService as Ve}from"../../platform/log/common/logService.js";import{LoggerService as Be}from"../../platform/log/node/loggerService.js";import{NullPolicyService as ze}from"../../platform/policy/common/policy.js";import Ke from"../../platform/product/common/product.js";import{IProductService as We}from"../../platform/product/common/productService.js";import"../../platform/remote/common/remoteAgentEnvironment.js";import{RemoteExtensionsScannerChannelName as Ye}from"../../platform/remote/common/remoteExtensionsScanner.js";import{IRequestService as V}from"../../platform/request/common/request.js";import{RequestChannel as Je}from"../../platform/request/common/requestIpc.js";import{RequestService as Qe}from"../../platform/request/node/requestService.js";import{resolveCommonProperties as Xe}from"../../platform/telemetry/common/commonProperties.js";import{ServerTelemetryChannel as Ze}from"../../platform/telemetry/common/remoteTelemetryChannel.js";import{IServerTelemetryService as L,ServerNullTelemetryService as er,ServerTelemetryService as rr}from"../../platform/telemetry/common/serverTelemetryService.js";import{ITelemetryService as B,TelemetryLevel as h}from"../../platform/telemetry/common/telemetry.js";import"../../platform/telemetry/common/telemetryService.js";import{getPiiPathsFromEnvironment as tr,isInternalTelemetry as nr,isLoggingOnly as or,NullAppender as ir,supportsTelemetry as sr}from"../../platform/telemetry/common/telemetryUtils.js";import{OneDataSystemAppender as mr}from"../../platform/telemetry/node/1dsAppender.js";import cr from"../../platform/telemetry/node/errorTelemetry.js";import{IPtyService as ar,TerminalSettingId as lr}from"../../platform/terminal/common/terminal.js";import{NodePtyHostStarter as vr}from"../../platform/terminal/node/nodePtyHostStarter.js";import{PtyHostService as gr}from"../../platform/terminal/node/ptyHostService.js";import{IUriIdentityService as fr}from"../../platform/uriIdentity/common/uriIdentity.js";import{UriIdentityService as Sr}from"../../platform/uriIdentity/common/uriIdentityService.js";import{IUserDataProfilesService as pr}from"../../platform/userDataProfile/common/userDataProfile.js";import{RemoteUserDataProfilesServiceChannel as dr}from"../../platform/userDataProfile/common/userDataProfileIpc.js";import{ServerUserDataProfilesService as ur}from"../../platform/userDataProfile/node/userDataProfile.js";import{createURITransformer as Cr}from"../../workbench/api/node/uriTransformer.js";import{REMOTE_TERMINAL_CHANNEL_NAME as hr}from"../../workbench/contrib/terminal/common/remote/remoteTerminalChannel.js";import{REMOTE_FILE_SYSTEM_CHANNEL_NAME as Ir}from"../../workbench/services/remote/common/remoteFileSystemProviderClient.js";import{ExtensionHostStatusService as Er,IExtensionHostStatusService as wr}from"./extensionHostStatusService.js";import{ExtensionsScannerService as xr}from"./extensionsScannerService.js";import{RemoteAgentEnvironmentChannel as yr}from"./remoteAgentEnvironmentImpl.js";import{RemoteExtensionsScannerChannel as Lr,RemoteExtensionsScannerService as Tr}from"./remoteExtensionsScanner.js";import{RemoteAgentFileSystemProviderChannel as Pr}from"./remoteFileSystemProviderServer.js";import{RemoteTerminalChannel as Rr}from"./remoteTerminalChannel.js";import"./serverConnectionToken.js";import{ServerEnvironmentService as Ar}from"./serverEnvironmentService.js";const Dr="monacoworkbench";async function gn(s,e,o,f){const r=new Me,m=new br,c={_serviceBrand:void 0,...Ke};r.set(We,c);const t=new Ar(e,c);r.set(Ee,t),r.set(we,t);const E=new Be(j(t),t.logsHome);r.set(Ge,E),m.registerChannel("logger",new je(E,i=>I(i.remoteAuthority)));const z=E.createLogger("remoteagent",{name:U("remoteExtensionLog","Server")}),n=new Ve(z,[new kr(j(t))]);r.set(Fe,n),setTimeout(()=>Nr(t.logsHome.with({scheme:$.file}).fsPath).then(null,i=>n.error(i)),1e4),n.onDidChangeLogLevel(i=>Oe(n,i,`Log level changed to ${qe(n.getLevel())}`)),n.trace(`Remote configuration data at ${o}`),n.trace("process arguments:",t.args),Array.isArray(c.serverGreeting)&&n.info(`

${c.serverGreeting.join(`
`)}

`),m.registerChannel(_.ChannelName,new _);const K=new Se(i=>i.clientId==="renderer"),d=f.add(new ke(n));r.set(be,d),d.registerProvider($.file,f.add(new Ne(n)));const R=new Sr(d);r.set(fr,R);const S=new de(t.machineSettingsResource,d,new ze,n);r.set(pe,S);const u=new ur(R,t,d,n);r.set(pr,u),m.registerChannel("userDataProfiles",new dr(u,i=>I(i.remoteAuthority))),r.set(Ce,new g(ue,void 0,!0));const[,,W,Y,J]=await Promise.all([S.initialize(),u.init(),ve(n.error.bind(n)),ge(n.error.bind(n)),le(n.error.bind(n))]),A=new Er;r.set(wr,A);const Q=E.createLogger("network-server",{name:U("network-server","Network (Server)"),hidden:!0}),D=new Qe(Q,S,t,n);r.set(V,D);let w=ir;const b=nr(c,S);if(sr(c,t)){!or(c,t)&&c.aiConfig?.ariaKey&&(w=new mr(D,b,Dr,null,c.aiConfig.ariaKey),f.add(ae(()=>w?.flush())));const i={appenders:[w],commonProperties:Xe(me(),se(),process.arch,c.commit,c.version+"-remote",W,Y,J,b,"remoteAgent"),piiPaths:tr(t)},l=t.args["telemetry-level"];let v=h.USAGE;l==="all"?v=h.USAGE:l==="error"?v=h.ERROR:l==="crash"?v=h.CRASH:l!==void 0&&(v=h.NONE),r.set(L,new g(rr,[i,v]))}else r.set(L,er);r.set(G,new g(xe));const X=m.getChannel("download",K);r.set(he,new Ie(X,()=>I("renderer"))),r.set(Te,new g(De)),r.set(F,new g(xr)),r.set(Ae,new g(Re)),r.set(O,new g(Pe));const p=new $e(r);r.set(q,p.createInstance(He));const Z=p.createInstance(vr,{graceTime:H.ReconnectionGraceTime,shortGraceTime:H.ReconnectionShortGraceTime,scrollback:S.getValue(lr.PersistentSessionScrollback)??100}),k=p.createInstance(gr,Z);return r.set(ar,k),p.invokeFunction(i=>{const l=i.get(O),v=i.get(F),ee=i.get(G),re=i.get(q),te=new yr(s,t,u,A);m.registerChannel("remoteextensionsenvironment",te);const ne=new Ze(i.get(L),w);m.registerChannel("telemetry",ne),m.registerChannel(hr,new Rr(t,n,k,c,l,S));const N=new Tr(p.createInstance(ye,n),t,u,v,n,ee,re);m.registerChannel(Ye,new Lr(N,x=>I(x.remoteAuthority)));const oe=f.add(new Pr(n,t));m.registerChannel(Ir,oe),m.registerChannel("request",new Je(i.get(V)));const ie=new Le(l,x=>I(x.remoteAuthority));return m.registerChannel("extensions",ie),N.whenExtensionsReady().then(()=>l.cleanUp()),f.add(new cr(i.get(B))),{telemetryService:i.get(B)}}),{socketServer:m,instantiationService:p}}const T=Object.create(null);function I(s){return T[s]||(T[s]=Cr(s)),T[s]}class br extends fe{_onDidConnectEmitter;constructor(){const e=new ce;super(e.event),this._onDidConnectEmitter=e}acceptConnection(e,o){this._onDidConnectEmitter.fire({protocol:e,onDidClientDisconnect:o})}}class kr extends Ue{useColors;constructor(e=_e){super(),this.setLevel(e),this.useColors=!!process.stdout.isTTY}trace(e,...o){this.checkLogLevel(C.Trace)&&(this.useColors?console.log(`\x1B[90m[${a()}]\x1B[0m`,e,...o):console.log(`[${a()}]`,e,...o))}debug(e,...o){this.checkLogLevel(C.Debug)&&(this.useColors?console.log(`\x1B[90m[${a()}]\x1B[0m`,e,...o):console.log(`[${a()}]`,e,...o))}info(e,...o){this.checkLogLevel(C.Info)&&(this.useColors?console.log(`\x1B[90m[${a()}]\x1B[0m`,e,...o):console.log(`[${a()}]`,e,...o))}warn(e,...o){this.checkLogLevel(C.Warning)&&(this.useColors?console.warn(`\x1B[93m[${a()}]\x1B[0m`,e,...o):console.warn(`[${a()}]`,e,...o))}error(e,...o){this.checkLogLevel(C.Error)&&(this.useColors?console.error(`\x1B[91m[${a()}]\x1B[0m`,e,...o):console.error(`[${a()}]`,e,...o))}flush(){}}function a(){const s=new Date;return`${P(s.getHours())}:${P(s.getMinutes())}:${P(s.getSeconds())}`}function P(s){return s<10?`0${s}`:String(s)}async function Nr(s){const e=y.basename(s),o=y.dirname(s),m=(await M.readdir(o)).filter(t=>/^\d{8}T\d{6}$/.test(t)).sort().filter(t=>t!==e),c=m.slice(0,Math.max(0,m.length-9));await Promise.all(c.map(t=>M.rm(y.join(o,t))))}export{br as SocketServer,gn as setupServerServices};
