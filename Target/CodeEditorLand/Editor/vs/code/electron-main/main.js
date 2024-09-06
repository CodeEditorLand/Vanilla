import"../../../vs/platform/update/common/update.config.contribution.js";import{promises as E,unlinkSync as b}from"fs";import{app as A,dialog as U}from"electron";import{coalesce as D,distinct as R}from"../../../vs/base/common/arrays.js";import{Promises as x}from"../../../vs/base/common/async.js";import{toErrorMessage as H}from"../../../vs/base/common/errorMessage.js";import{ExpectedError as w,setUnexpectedErrorHandler as W}from"../../../vs/base/common/errors.js";import{Event as y}from"../../../vs/base/common/event.js";import{isValidBasename as T,parseLineAndColumnAware as _,sanitizeFilePath as O}from"../../../vs/base/common/extpath.js";import{getPathLabel as V}from"../../../vs/base/common/labels.js";import{DisposableStore as B}from"../../../vs/base/common/lifecycle.js";import{Schemas as u}from"../../../vs/base/common/network.js";import{basename as j,resolve as q}from"../../../vs/base/common/path.js";import{mark as C}from"vs/base/common/performance";import{isMacintosh as z,isWindows as S,OS as $}from"../../../vs/base/common/platform.js";import{cwd as G}from"../../../vs/base/common/process.js";import{rtrim as M,trim as L}from"../../../vs/base/common/strings.js";import{URI as J}from"../../../vs/base/common/uri.js";import{Promises as K}from"../../../vs/base/node/pfs.js";import{addUNCHostToAllowlist as X,getUNCHost as Y}from"vs/base/node/unc";import{ProxyChannel as N}from"../../../vs/base/parts/ipc/common/ipc.js";import"../../../vs/base/parts/ipc/common/ipc.net.js";import{connect as Q,serve as Z,XDG_RUNTIME_DIR as ee}from"../../../vs/base/parts/ipc/node/ipc.net.js";import{CodeApplication as re}from"../../../vs/code/electron-main/app.js";import{localize as p}from"../../../vs/nls.js";import{IConfigurationService as ie}from"../../../vs/platform/configuration/common/configuration.js";import{ConfigurationService as te}from"../../../vs/platform/configuration/common/configurationService.js";import"../../../vs/platform/diagnostics/electron-main/diagnosticsMainService.js";import{DiagnosticsService as oe}from"../../../vs/platform/diagnostics/node/diagnosticsService.js";import{massageMessageBoxOptions as ne}from"../../../vs/platform/dialogs/common/dialogs.js";import"../../../vs/platform/environment/common/argv.js";import{EnvironmentMainService as se,IEnvironmentMainService as ae}from"../../../vs/platform/environment/electron-main/environmentMainService.js";import{addArg as ce,parseMainProcessArgv as me}from"../../../vs/platform/environment/node/argvHelper.js";import{createWaitMarkerFileSync as le}from"../../../vs/platform/environment/node/wait.js";import{IFileService as k}from"../../../vs/platform/files/common/files.js";import{FileService as de}from"../../../vs/platform/files/common/fileService.js";import{DiskFileSystemProvider as fe}from"../../../vs/platform/files/node/diskFileSystemProvider.js";import{SyncDescriptor as h}from"../../../vs/platform/instantiation/common/descriptors.js";import"../../../vs/platform/instantiation/common/instantiation.js";import{InstantiationService as ge}from"../../../vs/platform/instantiation/common/instantiationService.js";import{ServiceCollection as pe}from"../../../vs/platform/instantiation/common/serviceCollection.js";import"../../../vs/platform/launch/electron-main/launchMainService.js";import{ILifecycleMainService as P,LifecycleMainService as ve}from"../../../vs/platform/lifecycle/electron-main/lifecycleMainService.js";import{BufferLogger as ue}from"../../../vs/platform/log/common/bufferLog.js";import{ConsoleMainLogger as Se,getLogLevel as he,ILoggerService as we,ILogService as I}from"../../../vs/platform/log/common/log.js";import{LogService as Pe}from"../../../vs/platform/log/common/logService.js";import{ILoggerMainService as Ie,LoggerMainService as Ee}from"../../../vs/platform/log/electron-main/loggerService.js";import{FilePolicyService as De}from"../../../vs/platform/policy/common/filePolicyService.js";import{IPolicyService as ye,NullPolicyService as Ce}from"../../../vs/platform/policy/common/policy.js";import{NativePolicyService as Me}from"../../../vs/platform/policy/node/nativePolicyService.js";import Le from"../../../vs/platform/product/common/product.js";import{IProductService as Ne}from"../../../vs/platform/product/common/productService.js";import{IProtocolMainService as ke}from"../../../vs/platform/protocol/electron-main/protocol.js";import{ProtocolMainService as Fe}from"../../../vs/platform/protocol/electron-main/protocolMainService.js";import{IRequestService as be}from"../../../vs/platform/request/common/request.js";import{RequestMainService as Ae}from"../../../vs/platform/request/electron-main/requestMainService.js";import{ISignService as Ue}from"../../../vs/platform/sign/common/sign.js";import{SignService as Re}from"../../../vs/platform/sign/node/signService.js";import{IStateReadService as xe,IStateService as He}from"../../../vs/platform/state/node/state.js";import{SaveStrategy as We,StateService as Te}from"../../../vs/platform/state/node/stateService.js";import{NullTelemetryService as _e}from"../../../vs/platform/telemetry/common/telemetryUtils.js";import{IThemeMainService as Oe,ThemeMainService as Ve}from"../../../vs/platform/theme/electron-main/themeMainService.js";import{ITunnelService as Be}from"../../../vs/platform/tunnel/common/tunnel.js";import{TunnelService as je}from"../../../vs/platform/tunnel/node/tunnelService.js";import{IUriIdentityService as qe}from"../../../vs/platform/uriIdentity/common/uriIdentity.js";import{UriIdentityService as ze}from"../../../vs/platform/uriIdentity/common/uriIdentityService.js";import{FileUserDataProvider as $e}from"../../../vs/platform/userData/common/fileUserDataProvider.js";import{IUserDataProfilesMainService as Ge,UserDataProfilesMainService as Je}from"../../../vs/platform/userDataProfile/electron-main/userDataProfile.js";class Ke{main(){try{this.startup()}catch(e){console.error(e.message),A.exit(1)}}async startup(){W(t=>console.error(t));const[e,r,i,o,s,l,a,n]=this.createServices();try{try{await this.initServices(i,n,o,s,a)}catch(t){throw this.handleStartupDataDirError(i,a,t),t}await e.invokeFunction(async t=>{const m=t.get(I),d=t.get(P),f=t.get(k),c=t.get(we),g=await this.claimInstance(m,i,d,e,a,!0);return K.writeFile(i.mainLockfile,String(process.pid)).catch(v=>{m.warn(`app#startup(): Error writing main lockfile: ${v.stack}`)}),l.logger=c.createLogger("main",{name:p("mainLog","Main")}),y.once(d.onWillShutdown)(v=>{f.dispose(),o.dispose(),v.join("instanceLockfile",E.unlink(i.mainLockfile).catch(()=>{}))}),e.createInstance(re,g,r).startup()})}catch(t){e.invokeFunction(this.quit,t)}}createServices(){const e=new pe,r=new B;process.once("exit",()=>r.dispose());const i={_serviceBrand:void 0,...Le};e.set(Ne,i);const o=new se(this.resolveArgs(),i),s=this.patchEnvironment(o);e.set(ae,o);const l=new Ee(he(o),o.logsHome);e.set(Ie,l);const a=new ue(l.getLogLevel()),n=r.add(new Pe(a,[new Se(l.getLogLevel())]));e.set(I,n);const t=new de(n);e.set(k,t);const m=new fe(n);t.registerProvider(u.file,m);const d=new ze(t);e.set(qe,d);const f=new Te(We.DELAYED,o,n,t);e.set(xe,f),e.set(He,f);const c=new Je(f,d,o,t,n);e.set(Ge,c),t.registerProvider(u.vscodeUserData,new $e(u.file,m,u.vscodeUserData,c,d,n));const g=S&&i.win32RegValueName?r.add(new Me(n,i.win32RegValueName)):o.policyFile?r.add(new De(o.policyFile,t,n)):new Ce;e.set(ye,g);const v=new te(c.defaultProfile.settingsResource,t,g,n);return e.set(ie,v),e.set(P,new h(ve,void 0,!1)),e.set(be,new h(Ae,void 0,!0)),e.set(Oe,new h(Ve)),e.set(Ue,new h(Re,void 0,!1)),e.set(Be,new h(je)),e.set(ke,new Fe(o,c,n)),[new ge(e,!0),s,o,v,f,a,i,c]}patchEnvironment(e){const r={VSCODE_IPC_HOOK:e.mainIPCHandle};return["VSCODE_NLS_CONFIG","VSCODE_PORTABLE"].forEach(i=>{const o=process.env[i];typeof o=="string"&&(r[i]=o)}),Object.assign(process.env,r),r}async initServices(e,r,i,o,s){await x.settled([Promise.all([this.allowWindowsUNCPath(e.extensionsPath),e.codeCachePath,e.logsHome.with({scheme:u.file}).fsPath,r.defaultProfile.globalStorageHome.with({scheme:u.file}).fsPath,e.workspaceStorageHome.with({scheme:u.file}).fsPath,e.localHistoryHome.with({scheme:u.file}).fsPath,e.backupHome].map(l=>l?E.mkdir(l,{recursive:!0}):void 0)),o.init(),i.initialize()]),r.init()}allowWindowsUNCPath(e){if(S){const r=Y(e);r&&X(r)}return e}async claimInstance(e,r,i,o,s,l){let a;try{C("code/willStartMainServer"),a=await Z(r.mainIPCHandle),C("code/didStartMainServer"),y.once(i.onWillShutdown)(()=>a.dispose())}catch(n){if(n.code!=="EADDRINUSE")throw this.handleStartupDataDirError(r,s,n),n;let t;try{t=await Q(r.mainIPCHandle,"main")}catch(c){if(!l||S||c.code!=="ECONNREFUSED")throw c.code==="EPERM"&&this.showStartupWarningDialog(p("secondInstanceAdmin","Another instance of {0} is already running as administrator.",s.nameShort),p("secondInstanceAdminDetail","Please close the other instance and try again."),s),c;try{b(r.mainIPCHandle)}catch(g){throw e.warn("Could not delete obsolete instance handle",g),g}return this.claimInstance(e,r,i,o,s,!1)}if(r.extensionTestsLocationURI&&!r.debugExtensionHost.break){const c=`Running extension tests from the command line is currently only supported if no other instance of ${s.nameShort} is running.`;throw e.error(c),t.dispose(),new Error(c)}let m;!r.args.wait&&!r.args.status&&(m=setTimeout(()=>{this.showStartupWarningDialog(p("secondInstanceNoResponse","Another instance of {0} is running but not responding",s.nameShort),p("secondInstanceNoResponseDetail","Please close all other instances and try again."),s)},1e4));const d=N.toService(t.getChannel("launch"),{disableMarshalling:!0}),f=N.toService(t.getChannel("diagnostics"),{disableMarshalling:!0});if(r.args.status)return o.invokeFunction(async()=>{const c=new oe(_e,s),g=await f.getMainDiagnostics(),v=await f.getRemoteDiagnostics({includeProcesses:!0,includeWorkspaceMetadata:!0}),F=await c.getDiagnostics(g,v);throw console.log(F),new w});throw S&&await this.windowsAllowSetForegroundWindow(d,e),e.trace("Sending env to running instance..."),await d.start(r.args,process.env),t.dispose(),m&&clearTimeout(m),new w("Sent env to running instance. Terminating...")}if(r.args.status)throw console.log(p("statusWarning","Warning: The --status argument can only be used if {0} is already running. Please run it again after {0} has started.",s.nameShort)),new w("Terminating...");return process.env.VSCODE_PID=String(process.pid),a}handleStartupDataDirError(e,r,i){if(i.code==="EACCES"||i.code==="EPERM"){const o=D([e.userDataPath,e.extensionsPath,ee]).map(s=>V(J.file(s),{os:$,tildify:e}));this.showStartupWarningDialog(p("startupDataDirError","Unable to write program user data."),p("startupUserDataAndExtensionsDirErrorDetail",`{0}

Please make sure the following directories are writeable:

{1}`,H(i),o.join(`
`)),r)}}showStartupWarningDialog(e,r,i){U.showMessageBoxSync(ne({type:"warning",buttons:[p({key:"close",comment:["&& denotes a mnemonic"]},"&&Close")],message:e,detail:r},i).options)}async windowsAllowSetForegroundWindow(e,r){if(S){const i=await e.getMainProcessId();r.trace("Sending some foreground love to the running instance:",i);try{(await import("windows-foreground-love")).allowSetForegroundWindow(i)}catch(o){r.error(o)}}}quit(e,r){const i=e.get(I),o=e.get(P);let s=0;r&&(r.isExpected?r.message&&i.trace(r.message):(s=1,r.stack?i.error(r.stack):i.error(`Startup error: ${r.toString()}`))),o.kill(s)}resolveArgs(){const e=this.validatePaths(me(process.argv));if(e.wait&&!e.waitMarkerFilePath){const r=le(e.verbose);r&&(ce(process.argv,"--waitMarkerFilePath",r),e.waitMarkerFilePath=r)}return e}validatePaths(e){if(e["open-url"]&&(e._urls=e._,e._=[]),!e.remote){const r=this.doValidatePaths(e._,e.goto);e._=r}return e}doValidatePaths(e,r){const i=G(),o=e.map(a=>{let n=String(a),t;r&&(t=_(n),n=t.path),n&&(n=this.preparePath(i,n));const m=O(n,i),d=j(m);return d&&!T(d)?null:r&&t?(t.path=m,this.toPath(t)):m}),s=S||z,l=R(o,a=>a&&s?a.toLowerCase():a||"");return D(l)}preparePath(e,r){return S&&(r=M(r,'"')),r=L(L(r," "),"	"),S&&(r=q(e,r),r=M(r,".")),r}toPath(e){const r=[e.path];return typeof e.line=="number"&&r.push(String(e.line)),typeof e.column=="number"&&r.push(String(e.column)),r.join(":")}}const Xe=new Ke;Xe.main();