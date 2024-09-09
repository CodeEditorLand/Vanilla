import"../../platform/update/common/update.config.contribution.js";import{app as b,dialog as A}from"electron";import{unlinkSync as U,promises as D}from"fs";import{URI as R}from"../../base/common/uri.js";import{coalesce as y,distinct as x}from"../../base/common/arrays.js";import{Promises as H}from"../../base/common/async.js";import{toErrorMessage as W}from"../../base/common/errorMessage.js";import{ExpectedError as P,setUnexpectedErrorHandler as T}from"../../base/common/errors.js";import{isValidBasename as _,parseLineAndColumnAware as O,sanitizeFilePath as V}from"../../base/common/extpath.js";import{Event as C}from"../../base/common/event.js";import{getPathLabel as B}from"../../base/common/labels.js";import{Schemas as u}from"../../base/common/network.js";import{basename as j,resolve as q}from"../../base/common/path.js";import{mark as L}from"../../base/common/performance.js";import{isMacintosh as z,isWindows as S,OS as $}from"../../base/common/platform.js";import{cwd as G}from"../../base/common/process.js";import{rtrim as M,trim as k}from"../../base/common/strings.js";import{Promises as J}from"../../base/node/pfs.js";import{ProxyChannel as N}from"../../base/parts/ipc/common/ipc.js";import"../../base/parts/ipc/common/ipc.net.js";import{connect as K,serve as X,XDG_RUNTIME_DIR as Y}from"../../base/parts/ipc/node/ipc.net.js";import{CodeApplication as Q}from"./app.js";import{localize as f}from"../../nls.js";import{IConfigurationService as Z}from"../../platform/configuration/common/configuration.js";import{ConfigurationService as ee}from"../../platform/configuration/common/configurationService.js";import"../../platform/diagnostics/electron-main/diagnosticsMainService.js";import{DiagnosticsService as re}from"../../platform/diagnostics/node/diagnosticsService.js";import"../../platform/environment/common/argv.js";import{EnvironmentMainService as te,IEnvironmentMainService as ie}from"../../platform/environment/electron-main/environmentMainService.js";import{addArg as oe,parseMainProcessArgv as ne}from"../../platform/environment/node/argvHelper.js";import{createWaitMarkerFileSync as se}from"../../platform/environment/node/wait.js";import{IFileService as F}from"../../platform/files/common/files.js";import{FileService as ae}from"../../platform/files/common/fileService.js";import{DiskFileSystemProvider as ce}from"../../platform/files/node/diskFileSystemProvider.js";import{SyncDescriptor as h}from"../../platform/instantiation/common/descriptors.js";import"../../platform/instantiation/common/instantiation.js";import{InstantiationService as me}from"../../platform/instantiation/common/instantiationService.js";import{ServiceCollection as le}from"../../platform/instantiation/common/serviceCollection.js";import"../../platform/launch/electron-main/launchMainService.js";import{ILifecycleMainService as I,LifecycleMainService as de}from"../../platform/lifecycle/electron-main/lifecycleMainService.js";import{BufferLogger as fe}from"../../platform/log/common/bufferLog.js";import{ConsoleMainLogger as ge,getLogLevel as pe,ILoggerService as ve,ILogService as E}from"../../platform/log/common/log.js";import ue from"../../platform/product/common/product.js";import{IProductService as Se}from"../../platform/product/common/productService.js";import{IProtocolMainService as he}from"../../platform/protocol/electron-main/protocol.js";import{ProtocolMainService as we}from"../../platform/protocol/electron-main/protocolMainService.js";import{ITunnelService as Pe}from"../../platform/tunnel/common/tunnel.js";import{TunnelService as Ie}from"../../platform/tunnel/node/tunnelService.js";import{IRequestService as Ee}from"../../platform/request/common/request.js";import{RequestService as De}from"../../platform/request/electron-utility/requestService.js";import{ISignService as ye}from"../../platform/sign/common/sign.js";import{SignService as Ce}from"../../platform/sign/node/signService.js";import{IStateReadService as Le,IStateService as Me}from"../../platform/state/node/state.js";import{NullTelemetryService as ke}from"../../platform/telemetry/common/telemetryUtils.js";import{IThemeMainService as Ne,ThemeMainService as Fe}from"../../platform/theme/electron-main/themeMainService.js";import{IUserDataProfilesMainService as be,UserDataProfilesMainService as Ae}from"../../platform/userDataProfile/electron-main/userDataProfile.js";import{IPolicyService as Ue,NullPolicyService as Re}from"../../platform/policy/common/policy.js";import{NativePolicyService as xe}from"../../platform/policy/node/nativePolicyService.js";import{FilePolicyService as He}from"../../platform/policy/common/filePolicyService.js";import{DisposableStore as We}from"../../base/common/lifecycle.js";import{IUriIdentityService as Te}from"../../platform/uriIdentity/common/uriIdentity.js";import{UriIdentityService as _e}from"../../platform/uriIdentity/common/uriIdentityService.js";import{ILoggerMainService as Oe,LoggerMainService as Ve}from"../../platform/log/electron-main/loggerService.js";import{LogService as Be}from"../../platform/log/common/logService.js";import{massageMessageBoxOptions as je}from"../../platform/dialogs/common/dialogs.js";import{SaveStrategy as qe,StateService as ze}from"../../platform/state/node/stateService.js";import{FileUserDataProvider as $e}from"../../platform/userData/common/fileUserDataProvider.js";import{addUNCHostToAllowlist as Ge,getUNCHost as Je}from"../../base/node/unc.js";class Ke{main(){try{this.startup()}catch(e){console.error(e.message),b.exit(1)}}async startup(){T(i=>console.error(i));const[e,r,t,o,s,m,a,n]=this.createServices();try{try{await this.initServices(t,n,o,s,a)}catch(i){throw this.handleStartupDataDirError(t,a,i),i}await e.invokeFunction(async i=>{const l=i.get(E),d=i.get(I),g=i.get(F),c=i.get(ve),p=await this.claimInstance(l,t,d,e,a,!0);return J.writeFile(t.mainLockfile,String(process.pid)).catch(v=>{l.warn(`app#startup(): Error writing main lockfile: ${v.stack}`)}),m.logger=c.createLogger("main",{name:f("mainLog","Main")}),C.once(d.onWillShutdown)(v=>{g.dispose(),o.dispose(),v.join("instanceLockfile",D.unlink(t.mainLockfile).catch(()=>{}))}),e.createInstance(Q,p,r).startup()})}catch(i){e.invokeFunction(this.quit,i)}}createServices(){const e=new le,r=new We;process.once("exit",()=>r.dispose());const t={_serviceBrand:void 0,...ue};e.set(Se,t);const o=new te(this.resolveArgs(),t),s=this.patchEnvironment(o);e.set(ie,o);const m=new Ve(pe(o),o.logsHome);e.set(Oe,m);const a=new fe(m.getLogLevel()),n=r.add(new Be(a,[new ge(m.getLogLevel())]));e.set(E,n);const i=new ae(n);e.set(F,i);const l=new ce(n);i.registerProvider(u.file,l);const d=new _e(i);e.set(Te,d);const g=new ze(qe.DELAYED,o,n,i);e.set(Le,g),e.set(Me,g);const c=new Ae(g,d,o,i,n);e.set(be,c),i.registerProvider(u.vscodeUserData,new $e(u.file,l,u.vscodeUserData,c,d,n));const p=S&&t.win32RegValueName?r.add(new xe(n,t.win32RegValueName)):o.policyFile?r.add(new He(o.policyFile,i,n)):new Re;e.set(Ue,p);const v=new ee(c.defaultProfile.settingsResource,i,p,n);e.set(Z,v),e.set(I,new h(de,void 0,!1));const w=m.createLogger("network-main",{name:f("network-main","Network (Main)"),hidden:!0});return e.set(Ee,new h(De,[w],!0)),e.set(Ne,new h(Fe)),e.set(ye,new h(Ce,void 0,!1)),e.set(Pe,new h(Ie)),e.set(he,new we(o,c,n)),[new me(e,!0),s,o,v,g,a,t,c]}patchEnvironment(e){const r={VSCODE_IPC_HOOK:e.mainIPCHandle};return["VSCODE_NLS_CONFIG","VSCODE_PORTABLE"].forEach(t=>{const o=process.env[t];typeof o=="string"&&(r[t]=o)}),Object.assign(process.env,r),r}async initServices(e,r,t,o,s){await H.settled([Promise.all([this.allowWindowsUNCPath(e.extensionsPath),e.codeCachePath,e.logsHome.with({scheme:u.file}).fsPath,r.defaultProfile.globalStorageHome.with({scheme:u.file}).fsPath,e.workspaceStorageHome.with({scheme:u.file}).fsPath,e.localHistoryHome.with({scheme:u.file}).fsPath,e.backupHome].map(m=>m?D.mkdir(m,{recursive:!0}):void 0)),o.init(),t.initialize()]),r.init()}allowWindowsUNCPath(e){if(S){const r=Je(e);r&&Ge(r)}return e}async claimInstance(e,r,t,o,s,m){let a;try{L("code/willStartMainServer"),a=await X(r.mainIPCHandle),L("code/didStartMainServer"),C.once(t.onWillShutdown)(()=>a.dispose())}catch(n){if(n.code!=="EADDRINUSE")throw this.handleStartupDataDirError(r,s,n),n;let i;try{i=await K(r.mainIPCHandle,"main")}catch(c){if(!m||S||c.code!=="ECONNREFUSED")throw c.code==="EPERM"&&this.showStartupWarningDialog(f("secondInstanceAdmin","Another instance of {0} is already running as administrator.",s.nameShort),f("secondInstanceAdminDetail","Please close the other instance and try again."),s),c;try{U(r.mainIPCHandle)}catch(p){throw e.warn("Could not delete obsolete instance handle",p),p}return this.claimInstance(e,r,t,o,s,!1)}if(r.extensionTestsLocationURI&&!r.debugExtensionHost.break){const c=`Running extension tests from the command line is currently only supported if no other instance of ${s.nameShort} is running.`;throw e.error(c),i.dispose(),new Error(c)}let l;!r.args.wait&&!r.args.status&&(l=setTimeout(()=>{this.showStartupWarningDialog(f("secondInstanceNoResponse","Another instance of {0} is running but not responding",s.nameShort),f("secondInstanceNoResponseDetail","Please close all other instances and try again."),s)},1e4));const d=N.toService(i.getChannel("launch"),{disableMarshalling:!0}),g=N.toService(i.getChannel("diagnostics"),{disableMarshalling:!0});if(r.args.status)return o.invokeFunction(async()=>{const c=new re(ke,s),p=await g.getMainDiagnostics(),v=await g.getRemoteDiagnostics({includeProcesses:!0,includeWorkspaceMetadata:!0}),w=await c.getDiagnostics(p,v);throw console.log(w),new P});throw S&&await this.windowsAllowSetForegroundWindow(d,e),e.trace("Sending env to running instance..."),await d.start(r.args,process.env),i.dispose(),l&&clearTimeout(l),new P("Sent env to running instance. Terminating...")}if(r.args.status)throw console.log(f("statusWarning","Warning: The --status argument can only be used if {0} is already running. Please run it again after {0} has started.",s.nameShort)),new P("Terminating...");return process.env.VSCODE_PID=String(process.pid),a}handleStartupDataDirError(e,r,t){if(t.code==="EACCES"||t.code==="EPERM"){const o=y([e.userDataPath,e.extensionsPath,Y]).map(s=>B(R.file(s),{os:$,tildify:e}));this.showStartupWarningDialog(f("startupDataDirError","Unable to write program user data."),f("startupUserDataAndExtensionsDirErrorDetail",`{0}

Please make sure the following directories are writeable:

{1}`,W(t),o.join(`
`)),r)}}showStartupWarningDialog(e,r,t){A.showMessageBoxSync(je({type:"warning",buttons:[f({key:"close",comment:["&& denotes a mnemonic"]},"&&Close")],message:e,detail:r},t).options)}async windowsAllowSetForegroundWindow(e,r){if(S){const t=await e.getMainProcessId();r.trace("Sending some foreground love to the running instance:",t);try{(await import("windows-foreground-love")).allowSetForegroundWindow(t)}catch(o){r.error(o)}}}quit(e,r){const t=e.get(E),o=e.get(I);let s=0;r&&(r.isExpected?r.message&&t.trace(r.message):(s=1,r.stack?t.error(r.stack):t.error(`Startup error: ${r.toString()}`))),o.kill(s)}resolveArgs(){const e=this.validatePaths(ne(process.argv));if(e.wait&&!e.waitMarkerFilePath){const r=se(e.verbose);r&&(oe(process.argv,"--waitMarkerFilePath",r),e.waitMarkerFilePath=r)}return e}validatePaths(e){if(e["open-url"]&&(e._urls=e._,e._=[]),!e.remote){const r=this.doValidatePaths(e._,e.goto);e._=r}return e}doValidatePaths(e,r){const t=G(),o=e.map(a=>{let n=String(a),i;r&&(i=O(n),n=i.path),n&&(n=this.preparePath(t,n));const l=V(n,t),d=j(l);return d&&!_(d)?null:r&&i?(i.path=l,this.toPath(i)):l}),s=S||z,m=x(o,a=>a&&s?a.toLowerCase():a||"");return y(m)}preparePath(e,r){return S&&(r=M(r,'"')),r=k(k(r," "),"	"),S&&(r=q(e,r),r=M(r,".")),r}toPath(e){const r=[e.path];return typeof e.line=="number"&&r.push(String(e.line)),typeof e.column=="number"&&r.push(String(e.column)),r.join(":")}}const Xe=new Ke;Xe.main();
