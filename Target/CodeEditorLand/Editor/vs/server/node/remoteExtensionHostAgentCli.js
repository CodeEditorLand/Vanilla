var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getErrorMessage } from "../../base/common/errors.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { Schemas } from "../../base/common/network.js";
import { isAbsolute, join } from "../../base/common/path.js";
import { isWindows } from "../../base/common/platform.js";
import { cwd } from "../../base/common/process.js";
import { URI } from "../../base/common/uri.js";
import {
  addUNCHostToAllowlist,
  disableUNCAccessRestrictions
} from "../../base/node/unc.js";
import { localize } from "../../nls.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import { ConfigurationService } from "../../platform/configuration/common/configurationService.js";
import { IDownloadService } from "../../platform/download/common/download.js";
import { DownloadService } from "../../platform/download/common/downloadService.js";
import {
  buildHelpMessage,
  buildVersionMessage
} from "../../platform/environment/node/argv.js";
import { ExtensionGalleryServiceWithNoStorageService } from "../../platform/extensionManagement/common/extensionGalleryService.js";
import {
  IExtensionGalleryService
} from "../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionManagementCLI } from "../../platform/extensionManagement/common/extensionManagementCLI.js";
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
  ConsoleLogger,
  ILogService,
  ILoggerService,
  NullLogger,
  getLogLevel
} from "../../platform/log/common/log.js";
import { LogService } from "../../platform/log/common/logService.js";
import { LoggerService } from "../../platform/log/node/loggerService.js";
import { NullPolicyService } from "../../platform/policy/common/policy.js";
import product from "../../platform/product/common/product.js";
import { IProductService } from "../../platform/product/common/productService.js";
import { IRequestService } from "../../platform/request/common/request.js";
import { RequestService } from "../../platform/request/node/requestService.js";
import { ITelemetryService } from "../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../platform/telemetry/common/telemetryUtils.js";
import { IUriIdentityService } from "../../platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../platform/uriIdentity/common/uriIdentityService.js";
import { IUserDataProfilesService } from "../../platform/userDataProfile/common/userDataProfile.js";
import { ServerUserDataProfilesService } from "../../platform/userDataProfile/node/userDataProfile.js";
import { ExtensionsScannerService } from "./extensionsScannerService.js";
import {
  IServerEnvironmentService,
  ServerEnvironmentService
} from "./serverEnvironmentService.js";
class CliMain extends Disposable {
  constructor(args, remoteDataFolder) {
    super();
    this.args = args;
    this.remoteDataFolder = remoteDataFolder;
    this.registerListeners();
  }
  static {
    __name(this, "CliMain");
  }
  registerListeners() {
    process.once("exit", () => this.dispose());
  }
  async run() {
    const instantiationService = await this.initServices();
    await instantiationService.invokeFunction(async (accessor) => {
      const configurationService = accessor.get(IConfigurationService);
      const logService = accessor.get(ILogService);
      if (isWindows) {
        if (configurationService.getValue(
          "security.restrictUNCAccess"
        ) === false) {
          disableUNCAccessRestrictions();
        } else {
          addUNCHostToAllowlist(
            configurationService.getValue(
              "security.allowedUNCHosts"
            )
          );
        }
      }
      try {
        await this.doRun(
          instantiationService.createInstance(
            ExtensionManagementCLI,
            new ConsoleLogger(logService.getLevel(), false)
          )
        );
      } catch (error) {
        logService.error(error);
        console.error(getErrorMessage(error));
        throw error;
      }
    });
  }
  async initServices() {
    const services = new ServiceCollection();
    const productService = { _serviceBrand: void 0, ...product };
    services.set(IProductService, productService);
    const environmentService = new ServerEnvironmentService(
      this.args,
      productService
    );
    services.set(IServerEnvironmentService, environmentService);
    const loggerService = new LoggerService(
      getLogLevel(environmentService),
      environmentService.logsHome
    );
    services.set(ILoggerService, loggerService);
    const logService = new LogService(
      this._register(
        loggerService.createLogger("remoteCLI", {
          name: localize("remotecli", "Remote CLI")
        })
      )
    );
    services.set(ILogService, logService);
    logService.trace(
      `Remote configuration data at ${this.remoteDataFolder}`
    );
    logService.trace("process arguments:", this.args);
    const fileService = this._register(new FileService(logService));
    services.set(IFileService, fileService);
    fileService.registerProvider(
      Schemas.file,
      this._register(new DiskFileSystemProvider(logService))
    );
    const uriIdentityService = new UriIdentityService(fileService);
    services.set(IUriIdentityService, uriIdentityService);
    const userDataProfilesService = this._register(
      new ServerUserDataProfilesService(
        uriIdentityService,
        environmentService,
        fileService,
        logService
      )
    );
    services.set(IUserDataProfilesService, userDataProfilesService);
    const configurationService = this._register(
      new ConfigurationService(
        userDataProfilesService.defaultProfile.settingsResource,
        fileService,
        new NullPolicyService(),
        logService
      )
    );
    services.set(IConfigurationService, configurationService);
    await Promise.all([
      configurationService.initialize(),
      userDataProfilesService.init()
    ]);
    services.set(
      IRequestService,
      new SyncDescriptor(RequestService, [new NullLogger()])
    );
    services.set(IDownloadService, new SyncDescriptor(DownloadService));
    services.set(ITelemetryService, NullTelemetryService);
    services.set(
      IExtensionGalleryService,
      new SyncDescriptor(ExtensionGalleryServiceWithNoStorageService)
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
    services.set(
      ILanguagePackService,
      new SyncDescriptor(NativeLanguagePackService)
    );
    return new InstantiationService(services);
  }
  async doRun(extensionManagementCLI) {
    if (this.args["list-extensions"]) {
      return extensionManagementCLI.listExtensions(
        !!this.args["show-versions"],
        this.args["category"]
      );
    } else if (this.args["install-extension"] || this.args["install-builtin-extension"]) {
      const installOptions = {
        isMachineScoped: !!this.args["do-not-sync"],
        installPreReleaseVersion: !!this.args["pre-release"]
      };
      return extensionManagementCLI.installExtensions(
        this.asExtensionIdOrVSIX(this.args["install-extension"] || []),
        this.asExtensionIdOrVSIX(
          this.args["install-builtin-extension"] || []
        ),
        installOptions,
        !!this.args["force"]
      );
    } else if (this.args["uninstall-extension"]) {
      return extensionManagementCLI.uninstallExtensions(
        this.asExtensionIdOrVSIX(this.args["uninstall-extension"]),
        !!this.args["force"]
      );
    } else if (this.args["update-extensions"]) {
      return extensionManagementCLI.updateExtensions();
    } else if (this.args["locate-extension"]) {
      return extensionManagementCLI.locateExtension(
        this.args["locate-extension"]
      );
    }
  }
  asExtensionIdOrVSIX(inputs) {
    return inputs.map(
      (input) => /\.vsix$/i.test(input) ? URI.file(isAbsolute(input) ? input : join(cwd(), input)) : input
    );
  }
}
function eventuallyExit(code) {
  setTimeout(() => process.exit(code), 0);
}
__name(eventuallyExit, "eventuallyExit");
async function run(args, REMOTE_DATA_FOLDER, optionDescriptions) {
  if (args.help) {
    const executable = product.serverApplicationName + (isWindows ? ".cmd" : "");
    console.log(
      buildHelpMessage(
        product.nameLong,
        executable,
        product.version,
        optionDescriptions,
        { noInputFiles: true, noPipe: true }
      )
    );
    return;
  }
  if (args.version) {
    console.log(buildVersionMessage(product.version, product.commit));
    return;
  }
  const cliMain = new CliMain(args, REMOTE_DATA_FOLDER);
  try {
    await cliMain.run();
    eventuallyExit(0);
  } catch (err) {
    eventuallyExit(1);
  } finally {
    cliMain.dispose();
  }
}
__name(run, "run");
export {
  run
};
//# sourceMappingURL=remoteExtensionHostAgentCli.js.map
