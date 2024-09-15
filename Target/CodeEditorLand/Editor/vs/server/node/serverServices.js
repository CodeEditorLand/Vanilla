var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { hostname, release } from "os";
import { Emitter } from "../../base/common/event.js";
import {
  toDisposable
} from "../../base/common/lifecycle.js";
import { Schemas } from "../../base/common/network.js";
import * as path from "../../base/common/path.js";
import {
  getMachineId,
  getSqmMachineId,
  getdevDeviceId
} from "../../base/node/id.js";
import { Promises } from "../../base/node/pfs.js";
import {
  IPCServer,
  StaticRouter
} from "../../base/parts/ipc/common/ipc.js";
import { ProtocolConstants } from "../../base/parts/ipc/common/ipc.net.js";
import { localize } from "../../nls.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import { ConfigurationService } from "../../platform/configuration/common/configurationService.js";
import {
  CSSDevelopmentService,
  ICSSDevelopmentService
} from "../../platform/cssDev/node/cssDevService.js";
import { ExtensionHostDebugBroadcastChannel } from "../../platform/debug/common/extensionHostDebugIpc.js";
import { IDownloadService } from "../../platform/download/common/download.js";
import { DownloadServiceChannelClient } from "../../platform/download/common/downloadIpc.js";
import {
  IEnvironmentService,
  INativeEnvironmentService
} from "../../platform/environment/common/environment.js";
import { ExtensionGalleryServiceWithNoStorageService } from "../../platform/extensionManagement/common/extensionGalleryService.js";
import { IExtensionGalleryService } from "../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionManagementCLI } from "../../platform/extensionManagement/common/extensionManagementCLI.js";
import { ExtensionManagementChannel } from "../../platform/extensionManagement/common/extensionManagementIpc.js";
import { IExtensionsProfileScannerService } from "../../platform/extensionManagement/common/extensionsProfileScannerService.js";
import { IExtensionsScannerService } from "../../platform/extensionManagement/common/extensionsScannerService.js";
import {
  ExtensionManagementService,
  INativeServerExtensionManagementService
} from "../../platform/extensionManagement/node/extensionManagementService.js";
import {
  ExtensionSignatureVerificationService,
  IExtensionSignatureVerificationService
} from "../../platform/extensionManagement/node/extensionSignatureVerificationService.js";
import { ExtensionsProfileScannerService } from "../../platform/extensionManagement/node/extensionsProfileScannerService.js";
import { FileService } from "../../platform/files/common/fileService.js";
import { IFileService } from "../../platform/files/common/files.js";
import { DiskFileSystemProvider } from "../../platform/files/node/diskFileSystemProvider.js";
import { SyncDescriptor } from "../../platform/instantiation/common/descriptors.js";
import { InstantiationService } from "../../platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "../../platform/instantiation/common/serviceCollection.js";
import { ILanguagePackService } from "../../platform/languagePacks/common/languagePacks.js";
import { NativeLanguagePackService } from "../../platform/languagePacks/node/languagePacks.js";
import {
  AbstractLogger,
  DEFAULT_LOG_LEVEL,
  ILogService,
  ILoggerService,
  LogLevel,
  LogLevelToString,
  getLogLevel,
  log
} from "../../platform/log/common/log.js";
import { LoggerChannel } from "../../platform/log/common/logIpc.js";
import { LogService } from "../../platform/log/common/logService.js";
import { LoggerService } from "../../platform/log/node/loggerService.js";
import { NullPolicyService } from "../../platform/policy/common/policy.js";
import product from "../../platform/product/common/product.js";
import { IProductService } from "../../platform/product/common/productService.js";
import { RemoteExtensionsScannerChannelName } from "../../platform/remote/common/remoteExtensionsScanner.js";
import { IRequestService } from "../../platform/request/common/request.js";
import { RequestChannel } from "../../platform/request/common/requestIpc.js";
import { RequestService } from "../../platform/request/node/requestService.js";
import { resolveCommonProperties } from "../../platform/telemetry/common/commonProperties.js";
import { ServerTelemetryChannel } from "../../platform/telemetry/common/remoteTelemetryChannel.js";
import {
  IServerTelemetryService,
  ServerNullTelemetryService,
  ServerTelemetryService
} from "../../platform/telemetry/common/serverTelemetryService.js";
import {
  ITelemetryService,
  TelemetryLevel
} from "../../platform/telemetry/common/telemetry.js";
import {
  NullAppender,
  getPiiPathsFromEnvironment,
  isInternalTelemetry,
  isLoggingOnly,
  supportsTelemetry
} from "../../platform/telemetry/common/telemetryUtils.js";
import { OneDataSystemAppender } from "../../platform/telemetry/node/1dsAppender.js";
import ErrorTelemetry from "../../platform/telemetry/node/errorTelemetry.js";
import {
  IPtyService,
  TerminalSettingId
} from "../../platform/terminal/common/terminal.js";
import { NodePtyHostStarter } from "../../platform/terminal/node/nodePtyHostStarter.js";
import { PtyHostService } from "../../platform/terminal/node/ptyHostService.js";
import { IUriIdentityService } from "../../platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../platform/uriIdentity/common/uriIdentityService.js";
import { IUserDataProfilesService } from "../../platform/userDataProfile/common/userDataProfile.js";
import { RemoteUserDataProfilesServiceChannel } from "../../platform/userDataProfile/common/userDataProfileIpc.js";
import { ServerUserDataProfilesService } from "../../platform/userDataProfile/node/userDataProfile.js";
import { createURITransformer } from "../../workbench/api/node/uriTransformer.js";
import { REMOTE_TERMINAL_CHANNEL_NAME } from "../../workbench/contrib/terminal/common/remote/remoteTerminalChannel.js";
import { REMOTE_FILE_SYSTEM_CHANNEL_NAME } from "../../workbench/services/remote/common/remoteFileSystemProviderClient.js";
import {
  ExtensionHostStatusService,
  IExtensionHostStatusService
} from "./extensionHostStatusService.js";
import { ExtensionsScannerService } from "./extensionsScannerService.js";
import { RemoteAgentEnvironmentChannel } from "./remoteAgentEnvironmentImpl.js";
import {
  RemoteExtensionsScannerChannel,
  RemoteExtensionsScannerService
} from "./remoteExtensionsScanner.js";
import { RemoteAgentFileSystemProviderChannel } from "./remoteFileSystemProviderServer.js";
import { RemoteTerminalChannel } from "./remoteTerminalChannel.js";
import {
  ServerEnvironmentService
} from "./serverEnvironmentService.js";
const eventPrefix = "monacoworkbench";
async function setupServerServices(connectionToken, args, REMOTE_DATA_FOLDER, disposables) {
  const services = new ServiceCollection();
  const socketServer = new SocketServer();
  const productService = {
    _serviceBrand: void 0,
    ...product
  };
  services.set(IProductService, productService);
  const environmentService = new ServerEnvironmentService(
    args,
    productService
  );
  services.set(IEnvironmentService, environmentService);
  services.set(INativeEnvironmentService, environmentService);
  const loggerService = new LoggerService(
    getLogLevel(environmentService),
    environmentService.logsHome
  );
  services.set(ILoggerService, loggerService);
  socketServer.registerChannel(
    "logger",
    new LoggerChannel(
      loggerService,
      (ctx) => getUriTransformer(ctx.remoteAuthority)
    )
  );
  const logger = loggerService.createLogger("remoteagent", {
    name: localize("remoteExtensionLog", "Server")
  });
  const logService = new LogService(logger, [
    new ServerLogger(getLogLevel(environmentService))
  ]);
  services.set(ILogService, logService);
  setTimeout(
    () => cleanupOlderLogs(
      environmentService.logsHome.with({ scheme: Schemas.file }).fsPath
    ).then(null, (err) => logService.error(err)),
    1e4
  );
  logService.onDidChangeLogLevel(
    (logLevel) => log(
      logService,
      logLevel,
      `Log level changed to ${LogLevelToString(logService.getLevel())}`
    )
  );
  logService.trace(`Remote configuration data at ${REMOTE_DATA_FOLDER}`);
  logService.trace("process arguments:", environmentService.args);
  if (Array.isArray(productService.serverGreeting)) {
    logService.info(`

${productService.serverGreeting.join("\n")}

`);
  }
  socketServer.registerChannel(
    ExtensionHostDebugBroadcastChannel.ChannelName,
    new ExtensionHostDebugBroadcastChannel()
  );
  const router = new StaticRouter(
    (ctx) => ctx.clientId === "renderer"
  );
  const fileService = disposables.add(new FileService(logService));
  services.set(IFileService, fileService);
  fileService.registerProvider(
    Schemas.file,
    disposables.add(new DiskFileSystemProvider(logService))
  );
  const uriIdentityService = new UriIdentityService(fileService);
  services.set(IUriIdentityService, uriIdentityService);
  const configurationService = new ConfigurationService(
    environmentService.machineSettingsResource,
    fileService,
    new NullPolicyService(),
    logService
  );
  services.set(IConfigurationService, configurationService);
  const userDataProfilesService = new ServerUserDataProfilesService(
    uriIdentityService,
    environmentService,
    fileService,
    logService
  );
  services.set(IUserDataProfilesService, userDataProfilesService);
  socketServer.registerChannel(
    "userDataProfiles",
    new RemoteUserDataProfilesServiceChannel(
      userDataProfilesService,
      (ctx) => getUriTransformer(ctx.remoteAuthority)
    )
  );
  services.set(
    ICSSDevelopmentService,
    new SyncDescriptor(CSSDevelopmentService, void 0, true)
  );
  const [, , machineId, sqmId, devDeviceId] = await Promise.all([
    configurationService.initialize(),
    userDataProfilesService.init(),
    getMachineId(logService.error.bind(logService)),
    getSqmMachineId(logService.error.bind(logService)),
    getdevDeviceId(logService.error.bind(logService))
  ]);
  const extensionHostStatusService = new ExtensionHostStatusService();
  services.set(IExtensionHostStatusService, extensionHostStatusService);
  const requestService = new RequestService(
    configurationService,
    environmentService,
    logService
  );
  services.set(IRequestService, requestService);
  let oneDsAppender = NullAppender;
  const isInternal = isInternalTelemetry(
    productService,
    configurationService
  );
  if (supportsTelemetry(productService, environmentService)) {
    if (!isLoggingOnly(productService, environmentService) && productService.aiConfig?.ariaKey) {
      oneDsAppender = new OneDataSystemAppender(
        requestService,
        isInternal,
        eventPrefix,
        null,
        productService.aiConfig.ariaKey
      );
      disposables.add(toDisposable(() => oneDsAppender?.flush()));
    }
    const config = {
      appenders: [oneDsAppender],
      commonProperties: resolveCommonProperties(
        release(),
        hostname(),
        process.arch,
        productService.commit,
        productService.version + "-remote",
        machineId,
        sqmId,
        devDeviceId,
        isInternal,
        "remoteAgent"
      ),
      piiPaths: getPiiPathsFromEnvironment(environmentService)
    };
    const initialTelemetryLevelArg = environmentService.args["telemetry-level"];
    let injectedTelemetryLevel = TelemetryLevel.USAGE;
    if (initialTelemetryLevelArg === "all") {
      injectedTelemetryLevel = TelemetryLevel.USAGE;
    } else if (initialTelemetryLevelArg === "error") {
      injectedTelemetryLevel = TelemetryLevel.ERROR;
    } else if (initialTelemetryLevelArg === "crash") {
      injectedTelemetryLevel = TelemetryLevel.CRASH;
    } else if (initialTelemetryLevelArg !== void 0) {
      injectedTelemetryLevel = TelemetryLevel.NONE;
    }
    services.set(
      IServerTelemetryService,
      new SyncDescriptor(ServerTelemetryService, [
        config,
        injectedTelemetryLevel
      ])
    );
  } else {
    services.set(IServerTelemetryService, ServerNullTelemetryService);
  }
  services.set(
    IExtensionGalleryService,
    new SyncDescriptor(ExtensionGalleryServiceWithNoStorageService)
  );
  const downloadChannel = socketServer.getChannel("download", router);
  services.set(
    IDownloadService,
    new DownloadServiceChannelClient(
      downloadChannel,
      () => getUriTransformer(
        "renderer"
      )
    )
  );
  services.set(
    IExtensionsProfileScannerService,
    new SyncDescriptor(ExtensionsProfileScannerService)
  );
  services.set(
    IExtensionsScannerService,
    new SyncDescriptor(ExtensionsScannerService)
  );
  services.set(
    IExtensionSignatureVerificationService,
    new SyncDescriptor(ExtensionSignatureVerificationService)
  );
  services.set(
    INativeServerExtensionManagementService,
    new SyncDescriptor(ExtensionManagementService)
  );
  const instantiationService = new InstantiationService(services);
  services.set(
    ILanguagePackService,
    instantiationService.createInstance(NativeLanguagePackService)
  );
  const ptyHostStarter = instantiationService.createInstance(
    NodePtyHostStarter,
    {
      graceTime: ProtocolConstants.ReconnectionGraceTime,
      shortGraceTime: ProtocolConstants.ReconnectionShortGraceTime,
      scrollback: configurationService.getValue(
        TerminalSettingId.PersistentSessionScrollback
      ) ?? 100
    }
  );
  const ptyHostService = instantiationService.createInstance(
    PtyHostService,
    ptyHostStarter
  );
  services.set(IPtyService, ptyHostService);
  instantiationService.invokeFunction((accessor) => {
    const extensionManagementService = accessor.get(
      INativeServerExtensionManagementService
    );
    const extensionsScannerService = accessor.get(
      IExtensionsScannerService
    );
    const extensionGalleryService = accessor.get(IExtensionGalleryService);
    const languagePackService = accessor.get(ILanguagePackService);
    const remoteExtensionEnvironmentChannel = new RemoteAgentEnvironmentChannel(
      connectionToken,
      environmentService,
      userDataProfilesService,
      extensionHostStatusService
    );
    socketServer.registerChannel(
      "remoteextensionsenvironment",
      remoteExtensionEnvironmentChannel
    );
    const telemetryChannel = new ServerTelemetryChannel(
      accessor.get(IServerTelemetryService),
      oneDsAppender
    );
    socketServer.registerChannel("telemetry", telemetryChannel);
    socketServer.registerChannel(
      REMOTE_TERMINAL_CHANNEL_NAME,
      new RemoteTerminalChannel(
        environmentService,
        logService,
        ptyHostService,
        productService,
        extensionManagementService,
        configurationService
      )
    );
    const remoteExtensionsScanner = new RemoteExtensionsScannerService(
      instantiationService.createInstance(
        ExtensionManagementCLI,
        logService
      ),
      environmentService,
      userDataProfilesService,
      extensionsScannerService,
      logService,
      extensionGalleryService,
      languagePackService
    );
    socketServer.registerChannel(
      RemoteExtensionsScannerChannelName,
      new RemoteExtensionsScannerChannel(
        remoteExtensionsScanner,
        (ctx) => getUriTransformer(ctx.remoteAuthority)
      )
    );
    const remoteFileSystemChannel = disposables.add(
      new RemoteAgentFileSystemProviderChannel(
        logService,
        environmentService,
        configurationService
      )
    );
    socketServer.registerChannel(
      REMOTE_FILE_SYSTEM_CHANNEL_NAME,
      remoteFileSystemChannel
    );
    socketServer.registerChannel(
      "request",
      new RequestChannel(accessor.get(IRequestService))
    );
    const channel = new ExtensionManagementChannel(
      extensionManagementService,
      (ctx) => getUriTransformer(ctx.remoteAuthority)
    );
    socketServer.registerChannel("extensions", channel);
    remoteExtensionsScanner.whenExtensionsReady().then(() => extensionManagementService.cleanUp());
    disposables.add(new ErrorTelemetry(accessor.get(ITelemetryService)));
    return {
      telemetryService: accessor.get(ITelemetryService)
    };
  });
  return { socketServer, instantiationService };
}
__name(setupServerServices, "setupServerServices");
const _uriTransformerCache = /* @__PURE__ */ Object.create(null);
function getUriTransformer(remoteAuthority) {
  if (!_uriTransformerCache[remoteAuthority]) {
    _uriTransformerCache[remoteAuthority] = createURITransformer(remoteAuthority);
  }
  return _uriTransformerCache[remoteAuthority];
}
__name(getUriTransformer, "getUriTransformer");
class SocketServer extends IPCServer {
  static {
    __name(this, "SocketServer");
  }
  _onDidConnectEmitter;
  constructor() {
    const emitter = new Emitter();
    super(emitter.event);
    this._onDidConnectEmitter = emitter;
  }
  acceptConnection(protocol, onDidClientDisconnect) {
    this._onDidConnectEmitter.fire({ protocol, onDidClientDisconnect });
  }
}
class ServerLogger extends AbstractLogger {
  static {
    __name(this, "ServerLogger");
  }
  useColors;
  constructor(logLevel = DEFAULT_LOG_LEVEL) {
    super();
    this.setLevel(logLevel);
    this.useColors = Boolean(process.stdout.isTTY);
  }
  trace(message, ...args) {
    if (this.checkLogLevel(LogLevel.Trace)) {
      if (this.useColors) {
        console.log(`\x1B[90m[${now()}]\x1B[0m`, message, ...args);
      } else {
        console.log(`[${now()}]`, message, ...args);
      }
    }
  }
  debug(message, ...args) {
    if (this.checkLogLevel(LogLevel.Debug)) {
      if (this.useColors) {
        console.log(`\x1B[90m[${now()}]\x1B[0m`, message, ...args);
      } else {
        console.log(`[${now()}]`, message, ...args);
      }
    }
  }
  info(message, ...args) {
    if (this.checkLogLevel(LogLevel.Info)) {
      if (this.useColors) {
        console.log(`\x1B[90m[${now()}]\x1B[0m`, message, ...args);
      } else {
        console.log(`[${now()}]`, message, ...args);
      }
    }
  }
  warn(message, ...args) {
    if (this.checkLogLevel(LogLevel.Warning)) {
      if (this.useColors) {
        console.warn(`\x1B[93m[${now()}]\x1B[0m`, message, ...args);
      } else {
        console.warn(`[${now()}]`, message, ...args);
      }
    }
  }
  error(message, ...args) {
    if (this.checkLogLevel(LogLevel.Error)) {
      if (this.useColors) {
        console.error(`\x1B[91m[${now()}]\x1B[0m`, message, ...args);
      } else {
        console.error(`[${now()}]`, message, ...args);
      }
    }
  }
  flush() {
  }
}
function now() {
  const date = /* @__PURE__ */ new Date();
  return `${twodigits(date.getHours())}:${twodigits(date.getMinutes())}:${twodigits(date.getSeconds())}`;
}
__name(now, "now");
function twodigits(n) {
  if (n < 10) {
    return `0${n}`;
  }
  return String(n);
}
__name(twodigits, "twodigits");
async function cleanupOlderLogs(logsPath) {
  const currentLog = path.basename(logsPath);
  const logsRoot = path.dirname(logsPath);
  const children = await Promises.readdir(logsRoot);
  const allSessions = children.filter((name) => /^\d{8}T\d{6}$/.test(name));
  const oldSessions = allSessions.sort().filter((d) => d !== currentLog);
  const toDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
  await Promise.all(
    toDelete.map((name) => Promises.rm(path.join(logsRoot, name)))
  );
}
__name(cleanupOlderLogs, "cleanupOlderLogs");
export {
  SocketServer,
  setupServerServices
};
//# sourceMappingURL=serverServices.js.map
