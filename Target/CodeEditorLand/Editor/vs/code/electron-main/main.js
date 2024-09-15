var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "../../platform/update/common/update.config.contribution.js";
import { app, dialog } from "electron";
import { unlinkSync, promises } from "fs";
import { URI } from "../../base/common/uri.js";
import { coalesce, distinct } from "../../base/common/arrays.js";
import { Promises } from "../../base/common/async.js";
import { toErrorMessage } from "../../base/common/errorMessage.js";
import { ExpectedError, setUnexpectedErrorHandler } from "../../base/common/errors.js";
import { IPathWithLineAndColumn, isValidBasename, parseLineAndColumnAware, sanitizeFilePath } from "../../base/common/extpath.js";
import { Event } from "../../base/common/event.js";
import { getPathLabel } from "../../base/common/labels.js";
import { Schemas } from "../../base/common/network.js";
import { basename, resolve } from "../../base/common/path.js";
import { mark } from "../../base/common/performance.js";
import { IProcessEnvironment, isMacintosh, isWindows, OS } from "../../base/common/platform.js";
import { cwd } from "../../base/common/process.js";
import { rtrim, trim } from "../../base/common/strings.js";
import { Promises as FSPromises } from "../../base/node/pfs.js";
import { ProxyChannel } from "../../base/parts/ipc/common/ipc.js";
import { Client as NodeIPCClient } from "../../base/parts/ipc/common/ipc.net.js";
import { connect as nodeIPCConnect, serve as nodeIPCServe, Server as NodeIPCServer, XDG_RUNTIME_DIR } from "../../base/parts/ipc/node/ipc.net.js";
import { CodeApplication } from "./app.js";
import { localize } from "../../nls.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import { ConfigurationService } from "../../platform/configuration/common/configurationService.js";
import { IDiagnosticsMainService } from "../../platform/diagnostics/electron-main/diagnosticsMainService.js";
import { DiagnosticsService } from "../../platform/diagnostics/node/diagnosticsService.js";
import { NativeParsedArgs } from "../../platform/environment/common/argv.js";
import { EnvironmentMainService, IEnvironmentMainService } from "../../platform/environment/electron-main/environmentMainService.js";
import { addArg, parseMainProcessArgv } from "../../platform/environment/node/argvHelper.js";
import { createWaitMarkerFileSync } from "../../platform/environment/node/wait.js";
import { IFileService } from "../../platform/files/common/files.js";
import { FileService } from "../../platform/files/common/fileService.js";
import { DiskFileSystemProvider } from "../../platform/files/node/diskFileSystemProvider.js";
import { SyncDescriptor } from "../../platform/instantiation/common/descriptors.js";
import { IInstantiationService, ServicesAccessor } from "../../platform/instantiation/common/instantiation.js";
import { InstantiationService } from "../../platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "../../platform/instantiation/common/serviceCollection.js";
import { ILaunchMainService } from "../../platform/launch/electron-main/launchMainService.js";
import { ILifecycleMainService, LifecycleMainService } from "../../platform/lifecycle/electron-main/lifecycleMainService.js";
import { BufferLogger } from "../../platform/log/common/bufferLog.js";
import { ConsoleMainLogger, getLogLevel, ILoggerService, ILogService } from "../../platform/log/common/log.js";
import product from "../../platform/product/common/product.js";
import { IProductService } from "../../platform/product/common/productService.js";
import { IProtocolMainService } from "../../platform/protocol/electron-main/protocol.js";
import { ProtocolMainService } from "../../platform/protocol/electron-main/protocolMainService.js";
import { ITunnelService } from "../../platform/tunnel/common/tunnel.js";
import { TunnelService } from "../../platform/tunnel/node/tunnelService.js";
import { IRequestService } from "../../platform/request/common/request.js";
import { RequestService } from "../../platform/request/electron-utility/requestService.js";
import { ISignService } from "../../platform/sign/common/sign.js";
import { SignService } from "../../platform/sign/node/signService.js";
import { IStateReadService, IStateService } from "../../platform/state/node/state.js";
import { NullTelemetryService } from "../../platform/telemetry/common/telemetryUtils.js";
import { IThemeMainService, ThemeMainService } from "../../platform/theme/electron-main/themeMainService.js";
import { IUserDataProfilesMainService, UserDataProfilesMainService } from "../../platform/userDataProfile/electron-main/userDataProfile.js";
import { IPolicyService, NullPolicyService } from "../../platform/policy/common/policy.js";
import { NativePolicyService } from "../../platform/policy/node/nativePolicyService.js";
import { FilePolicyService } from "../../platform/policy/common/filePolicyService.js";
import { DisposableStore } from "../../base/common/lifecycle.js";
import { IUriIdentityService } from "../../platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../platform/uriIdentity/common/uriIdentityService.js";
import { ILoggerMainService, LoggerMainService } from "../../platform/log/electron-main/loggerService.js";
import { LogService } from "../../platform/log/common/logService.js";
import { massageMessageBoxOptions } from "../../platform/dialogs/common/dialogs.js";
import { SaveStrategy, StateService } from "../../platform/state/node/stateService.js";
import { FileUserDataProvider } from "../../platform/userData/common/fileUserDataProvider.js";
import { addUNCHostToAllowlist, getUNCHost } from "../../base/node/unc.js";
class CodeMain {
  static {
    __name(this, "CodeMain");
  }
  main() {
    try {
      this.startup();
    } catch (error) {
      console.error(error.message);
      app.exit(1);
    }
  }
  async startup() {
    setUnexpectedErrorHandler((err) => console.error(err));
    const [instantiationService, instanceEnvironment, environmentMainService, configurationService, stateMainService, bufferLogService, productService, userDataProfilesMainService] = this.createServices();
    try {
      try {
        await this.initServices(environmentMainService, userDataProfilesMainService, configurationService, stateMainService, productService);
      } catch (error) {
        this.handleStartupDataDirError(environmentMainService, productService, error);
        throw error;
      }
      await instantiationService.invokeFunction(async (accessor) => {
        const logService = accessor.get(ILogService);
        const lifecycleMainService = accessor.get(ILifecycleMainService);
        const fileService = accessor.get(IFileService);
        const loggerService = accessor.get(ILoggerService);
        const mainProcessNodeIpcServer = await this.claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, true);
        FSPromises.writeFile(environmentMainService.mainLockfile, String(process.pid)).catch((err) => {
          logService.warn(`app#startup(): Error writing main lockfile: ${err.stack}`);
        });
        bufferLogService.logger = loggerService.createLogger("main", { name: localize("mainLog", "Main") });
        Event.once(lifecycleMainService.onWillShutdown)((evt) => {
          fileService.dispose();
          configurationService.dispose();
          evt.join("instanceLockfile", promises.unlink(environmentMainService.mainLockfile).catch(() => {
          }));
        });
        return instantiationService.createInstance(CodeApplication, mainProcessNodeIpcServer, instanceEnvironment).startup();
      });
    } catch (error) {
      instantiationService.invokeFunction(this.quit, error);
    }
  }
  createServices() {
    const services = new ServiceCollection();
    const disposables = new DisposableStore();
    process.once("exit", () => disposables.dispose());
    const productService = { _serviceBrand: void 0, ...product };
    services.set(IProductService, productService);
    const environmentMainService = new EnvironmentMainService(this.resolveArgs(), productService);
    const instanceEnvironment = this.patchEnvironment(environmentMainService);
    services.set(IEnvironmentMainService, environmentMainService);
    const loggerService = new LoggerMainService(getLogLevel(environmentMainService), environmentMainService.logsHome);
    services.set(ILoggerMainService, loggerService);
    const bufferLogger = new BufferLogger(loggerService.getLogLevel());
    const logService = disposables.add(new LogService(bufferLogger, [new ConsoleMainLogger(loggerService.getLogLevel())]));
    services.set(ILogService, logService);
    const fileService = new FileService(logService);
    services.set(IFileService, fileService);
    const diskFileSystemProvider = new DiskFileSystemProvider(logService);
    fileService.registerProvider(Schemas.file, diskFileSystemProvider);
    const uriIdentityService = new UriIdentityService(fileService);
    services.set(IUriIdentityService, uriIdentityService);
    const stateService = new StateService(SaveStrategy.DELAYED, environmentMainService, logService, fileService);
    services.set(IStateReadService, stateService);
    services.set(IStateService, stateService);
    const userDataProfilesMainService = new UserDataProfilesMainService(stateService, uriIdentityService, environmentMainService, fileService, logService);
    services.set(IUserDataProfilesMainService, userDataProfilesMainService);
    fileService.registerProvider(Schemas.vscodeUserData, new FileUserDataProvider(Schemas.file, diskFileSystemProvider, Schemas.vscodeUserData, userDataProfilesMainService, uriIdentityService, logService));
    const policyService = isWindows && productService.win32RegValueName ? disposables.add(new NativePolicyService(logService, productService.win32RegValueName)) : environmentMainService.policyFile ? disposables.add(new FilePolicyService(environmentMainService.policyFile, fileService, logService)) : new NullPolicyService();
    services.set(IPolicyService, policyService);
    const configurationService = new ConfigurationService(userDataProfilesMainService.defaultProfile.settingsResource, fileService, policyService, logService);
    services.set(IConfigurationService, configurationService);
    services.set(ILifecycleMainService, new SyncDescriptor(LifecycleMainService, void 0, false));
    services.set(IRequestService, new SyncDescriptor(RequestService, void 0, true));
    services.set(IThemeMainService, new SyncDescriptor(ThemeMainService));
    services.set(ISignService, new SyncDescriptor(
      SignService,
      void 0,
      false
      /* proxied to other processes */
    ));
    services.set(ITunnelService, new SyncDescriptor(TunnelService));
    services.set(IProtocolMainService, new ProtocolMainService(environmentMainService, userDataProfilesMainService, logService));
    return [new InstantiationService(services, true), instanceEnvironment, environmentMainService, configurationService, stateService, bufferLogger, productService, userDataProfilesMainService];
  }
  patchEnvironment(environmentMainService) {
    const instanceEnvironment = {
      VSCODE_IPC_HOOK: environmentMainService.mainIPCHandle
    };
    ["VSCODE_NLS_CONFIG", "VSCODE_PORTABLE"].forEach((key) => {
      const value = process.env[key];
      if (typeof value === "string") {
        instanceEnvironment[key] = value;
      }
    });
    Object.assign(process.env, instanceEnvironment);
    return instanceEnvironment;
  }
  async initServices(environmentMainService, userDataProfilesMainService, configurationService, stateService, productService) {
    await Promises.settled([
      // Environment service (paths)
      Promise.all([
        this.allowWindowsUNCPath(environmentMainService.extensionsPath),
        // enable extension paths on UNC drives...
        environmentMainService.codeCachePath,
        // ...other user-data-derived paths should already be enlisted from `main.js`
        environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath,
        userDataProfilesMainService.defaultProfile.globalStorageHome.with({ scheme: Schemas.file }).fsPath,
        environmentMainService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath,
        environmentMainService.localHistoryHome.with({ scheme: Schemas.file }).fsPath,
        environmentMainService.backupHome
      ].map((path) => path ? promises.mkdir(path, { recursive: true }) : void 0)),
      // State service
      stateService.init(),
      // Configuration service
      configurationService.initialize()
    ]);
    userDataProfilesMainService.init();
  }
  allowWindowsUNCPath(path) {
    if (isWindows) {
      const host = getUNCHost(path);
      if (host) {
        addUNCHostToAllowlist(host);
      }
    }
    return path;
  }
  async claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, retry) {
    let mainProcessNodeIpcServer;
    try {
      mark("code/willStartMainServer");
      mainProcessNodeIpcServer = await nodeIPCServe(environmentMainService.mainIPCHandle);
      mark("code/didStartMainServer");
      Event.once(lifecycleMainService.onWillShutdown)(() => mainProcessNodeIpcServer.dispose());
    } catch (error) {
      if (error.code !== "EADDRINUSE") {
        this.handleStartupDataDirError(environmentMainService, productService, error);
        throw error;
      }
      let client;
      try {
        client = await nodeIPCConnect(environmentMainService.mainIPCHandle, "main");
      } catch (error2) {
        if (!retry || isWindows || error2.code !== "ECONNREFUSED") {
          if (error2.code === "EPERM") {
            this.showStartupWarningDialog(
              localize("secondInstanceAdmin", "Another instance of {0} is already running as administrator.", productService.nameShort),
              localize("secondInstanceAdminDetail", "Please close the other instance and try again."),
              productService
            );
          }
          throw error2;
        }
        try {
          unlinkSync(environmentMainService.mainIPCHandle);
        } catch (error3) {
          logService.warn("Could not delete obsolete instance handle", error3);
          throw error3;
        }
        return this.claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, false);
      }
      if (environmentMainService.extensionTestsLocationURI && !environmentMainService.debugExtensionHost.break) {
        const msg = `Running extension tests from the command line is currently only supported if no other instance of ${productService.nameShort} is running.`;
        logService.error(msg);
        client.dispose();
        throw new Error(msg);
      }
      let startupWarningDialogHandle = void 0;
      if (!environmentMainService.args.wait && !environmentMainService.args.status) {
        startupWarningDialogHandle = setTimeout(() => {
          this.showStartupWarningDialog(
            localize("secondInstanceNoResponse", "Another instance of {0} is running but not responding", productService.nameShort),
            localize("secondInstanceNoResponseDetail", "Please close all other instances and try again."),
            productService
          );
        }, 1e4);
      }
      const otherInstanceLaunchMainService = ProxyChannel.toService(client.getChannel("launch"), { disableMarshalling: true });
      const otherInstanceDiagnosticsMainService = ProxyChannel.toService(client.getChannel("diagnostics"), { disableMarshalling: true });
      if (environmentMainService.args.status) {
        return instantiationService.invokeFunction(async () => {
          const diagnosticsService = new DiagnosticsService(NullTelemetryService, productService);
          const mainDiagnostics = await otherInstanceDiagnosticsMainService.getMainDiagnostics();
          const remoteDiagnostics = await otherInstanceDiagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true });
          const diagnostics = await diagnosticsService.getDiagnostics(mainDiagnostics, remoteDiagnostics);
          console.log(diagnostics);
          throw new ExpectedError();
        });
      }
      if (isWindows) {
        await this.windowsAllowSetForegroundWindow(otherInstanceLaunchMainService, logService);
      }
      logService.trace("Sending env to running instance...");
      await otherInstanceLaunchMainService.start(environmentMainService.args, process.env);
      client.dispose();
      if (startupWarningDialogHandle) {
        clearTimeout(startupWarningDialogHandle);
      }
      throw new ExpectedError("Sent env to running instance. Terminating...");
    }
    if (environmentMainService.args.status) {
      console.log(localize("statusWarning", "Warning: The --status argument can only be used if {0} is already running. Please run it again after {0} has started.", productService.nameShort));
      throw new ExpectedError("Terminating...");
    }
    process.env["VSCODE_PID"] = String(process.pid);
    return mainProcessNodeIpcServer;
  }
  handleStartupDataDirError(environmentMainService, productService, error) {
    if (error.code === "EACCES" || error.code === "EPERM") {
      const directories = coalesce([environmentMainService.userDataPath, environmentMainService.extensionsPath, XDG_RUNTIME_DIR]).map((folder) => getPathLabel(URI.file(folder), { os: OS, tildify: environmentMainService }));
      this.showStartupWarningDialog(
        localize("startupDataDirError", "Unable to write program user data."),
        localize("startupUserDataAndExtensionsDirErrorDetail", "{0}\n\nPlease make sure the following directories are writeable:\n\n{1}", toErrorMessage(error), directories.join("\n")),
        productService
      );
    }
  }
  showStartupWarningDialog(message, detail, productService) {
    dialog.showMessageBoxSync(massageMessageBoxOptions({
      type: "warning",
      buttons: [localize({ key: "close", comment: ["&& denotes a mnemonic"] }, "&&Close")],
      message,
      detail
    }, productService).options);
  }
  async windowsAllowSetForegroundWindow(launchMainService, logService) {
    if (isWindows) {
      const processId = await launchMainService.getMainProcessId();
      logService.trace("Sending some foreground love to the running instance:", processId);
      try {
        (await import("windows-foreground-love")).allowSetForegroundWindow(processId);
      } catch (error) {
        logService.error(error);
      }
    }
  }
  quit(accessor, reason) {
    const logService = accessor.get(ILogService);
    const lifecycleMainService = accessor.get(ILifecycleMainService);
    let exitCode = 0;
    if (reason) {
      if (reason.isExpected) {
        if (reason.message) {
          logService.trace(reason.message);
        }
      } else {
        exitCode = 1;
        if (reason.stack) {
          logService.error(reason.stack);
        } else {
          logService.error(`Startup error: ${reason.toString()}`);
        }
      }
    }
    lifecycleMainService.kill(exitCode);
  }
  //#region Command line arguments utilities
  resolveArgs() {
    const args = this.validatePaths(parseMainProcessArgv(process.argv));
    if (args.wait && !args.waitMarkerFilePath) {
      const waitMarkerFilePath = createWaitMarkerFileSync(args.verbose);
      if (waitMarkerFilePath) {
        addArg(process.argv, "--waitMarkerFilePath", waitMarkerFilePath);
        args.waitMarkerFilePath = waitMarkerFilePath;
      }
    }
    return args;
  }
  validatePaths(args) {
    if (args["open-url"]) {
      args._urls = args._;
      args._ = [];
    }
    if (!args["remote"]) {
      const paths = this.doValidatePaths(args._, args.goto);
      args._ = paths;
    }
    return args;
  }
  doValidatePaths(args, gotoLineMode) {
    const currentWorkingDir = cwd();
    const result = args.map((arg) => {
      let pathCandidate = String(arg);
      let parsedPath = void 0;
      if (gotoLineMode) {
        parsedPath = parseLineAndColumnAware(pathCandidate);
        pathCandidate = parsedPath.path;
      }
      if (pathCandidate) {
        pathCandidate = this.preparePath(currentWorkingDir, pathCandidate);
      }
      const sanitizedFilePath = sanitizeFilePath(pathCandidate, currentWorkingDir);
      const filePathBasename = basename(sanitizedFilePath);
      if (filePathBasename && !isValidBasename(filePathBasename)) {
        return null;
      }
      if (gotoLineMode && parsedPath) {
        parsedPath.path = sanitizedFilePath;
        return this.toPath(parsedPath);
      }
      return sanitizedFilePath;
    });
    const caseInsensitive = isWindows || isMacintosh;
    const distinctPaths = distinct(result, (path) => path && caseInsensitive ? path.toLowerCase() : path || "");
    return coalesce(distinctPaths);
  }
  preparePath(cwd2, path) {
    if (isWindows) {
      path = rtrim(path, '"');
    }
    path = trim(trim(path, " "), "	");
    if (isWindows) {
      path = resolve(cwd2, path);
      path = rtrim(path, ".");
    }
    return path;
  }
  toPath(pathWithLineAndCol) {
    const segments = [pathWithLineAndCol.path];
    if (typeof pathWithLineAndCol.line === "number") {
      segments.push(String(pathWithLineAndCol.line));
    }
    if (typeof pathWithLineAndCol.column === "number") {
      segments.push(String(pathWithLineAndCol.column));
    }
    return segments.join(":");
  }
  //#endregion
}
const code = new CodeMain();
code.main();
//# sourceMappingURL=main.js.map
