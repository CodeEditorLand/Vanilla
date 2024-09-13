var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { disposableWindowInterval } from "../../../../base/browser/dom.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import {
  combinedDisposable
} from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IsWebContext } from "../../../../platform/contextkey/common/contextkeys.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  createDecorator
} from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  IURLService
} from "../../../../platform/url/common/url.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IHostService } from "../../host/browser/host.js";
import { ActivationKind, IExtensionService } from "../common/extensions.js";
const FIVE_MINUTES = 5 * 60 * 1e3;
const THIRTY_SECONDS = 30 * 1e3;
const URL_TO_HANDLE = "extensionUrlHandler.urlToHandle";
const USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY = "extensions.confirmedUriHandlerExtensionIds";
const USER_TRUSTED_EXTENSIONS_STORAGE_KEY = "extensionUrlHandler.confirmedExtensions";
function isExtensionId(value) {
  return /^[a-z0-9][a-z0-9-]*\.[a-z0-9][a-z0-9-]*$/i.test(value);
}
__name(isExtensionId, "isExtensionId");
class UserTrustedExtensionIdStorage {
  constructor(storageService) {
    this.storageService = storageService;
  }
  static {
    __name(this, "UserTrustedExtensionIdStorage");
  }
  get extensions() {
    const userTrustedExtensionIdsJson = this.storageService.get(
      USER_TRUSTED_EXTENSIONS_STORAGE_KEY,
      StorageScope.PROFILE,
      "[]"
    );
    try {
      return JSON.parse(userTrustedExtensionIdsJson);
    } catch {
      return [];
    }
  }
  has(id) {
    return this.extensions.indexOf(id) > -1;
  }
  add(id) {
    this.set([...this.extensions, id]);
  }
  set(ids) {
    this.storageService.store(
      USER_TRUSTED_EXTENSIONS_STORAGE_KEY,
      JSON.stringify(ids),
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
  }
}
const IExtensionUrlHandler = createDecorator(
  "extensionUrlHandler"
);
let ExtensionUrlHandler = class {
  constructor(urlService, extensionService, dialogService, commandService, hostService, storageService, configurationService, telemetryService, notificationService, productService, workbenchEnvironmentService) {
    this.extensionService = extensionService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.hostService = hostService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
    this.productService = productService;
    this.workbenchEnvironmentService = workbenchEnvironmentService;
    this.userTrustedExtensionsStorage = new UserTrustedExtensionIdStorage(storageService);
    const interval = disposableWindowInterval(mainWindow, () => this.garbageCollect(), THIRTY_SECONDS);
    const urlToHandleValue = this.storageService.get(URL_TO_HANDLE, StorageScope.WORKSPACE);
    if (urlToHandleValue) {
      this.storageService.remove(URL_TO_HANDLE, StorageScope.WORKSPACE);
      this.handleURL(URI.revive(JSON.parse(urlToHandleValue)), { trusted: true });
    }
    this.disposable = combinedDisposable(
      urlService.registerHandler(this),
      interval
    );
    const cache = ExtensionUrlBootstrapHandler.cache;
    setTimeout(() => cache.forEach(([uri, option]) => this.handleURL(uri, option)));
  }
  static {
    __name(this, "ExtensionUrlHandler");
  }
  _serviceBrand;
  extensionHandlers = /* @__PURE__ */ new Map();
  uriBuffer = /* @__PURE__ */ new Map();
  userTrustedExtensionsStorage;
  disposable;
  async handleURL(uri, options) {
    if (!isExtensionId(uri.authority)) {
      return false;
    }
    const extensionId = uri.authority;
    this.telemetryService.publicLog2("uri_invoked/start", { extensionId });
    const initialHandler = this.extensionHandlers.get(
      ExtensionIdentifier.toKey(extensionId)
    );
    let extensionDisplayName;
    if (initialHandler) {
      extensionDisplayName = initialHandler.extensionDisplayName;
    } else {
      const extension = await this.extensionService.getExtension(extensionId);
      if (extension) {
        extensionDisplayName = extension.displayName ?? "";
      } else {
        await this.handleUnhandledURL(uri, extensionId, options);
        return true;
      }
    }
    const trusted = options?.trusted || this.productService.trustedExtensionProtocolHandlers?.includes(
      extensionId
    ) || this.didUserTrustExtension(ExtensionIdentifier.toKey(extensionId));
    if (!trusted) {
      let uriString = uri.toString(false);
      if (uriString.length > 40) {
        uriString = `${uriString.substring(0, 30)}...${uriString.substring(uriString.length - 5)}`;
      }
      const result = await this.dialogService.confirm({
        message: localize(
          "confirmUrl",
          "Allow '{0}' extension to open this URI?",
          extensionDisplayName
        ),
        checkbox: {
          label: localize(
            "rememberConfirmUrl",
            "Do not ask me again for this extension"
          )
        },
        detail: uriString,
        primaryButton: localize(
          { key: "open", comment: ["&& denotes a mnemonic"] },
          "&&Open"
        )
      });
      if (!result.confirmed) {
        this.telemetryService.publicLog2("uri_invoked/cancel", { extensionId });
        return true;
      }
      if (result.checkboxChecked) {
        this.userTrustedExtensionsStorage.add(
          ExtensionIdentifier.toKey(extensionId)
        );
      }
    }
    const handler = this.extensionHandlers.get(
      ExtensionIdentifier.toKey(extensionId)
    );
    if (handler) {
      if (!initialHandler) {
        return await this.handleURLByExtension(
          extensionId,
          handler,
          uri,
          options
        );
      }
      return false;
    }
    const timestamp = (/* @__PURE__ */ new Date()).getTime();
    let uris = this.uriBuffer.get(ExtensionIdentifier.toKey(extensionId));
    if (!uris) {
      uris = [];
      this.uriBuffer.set(ExtensionIdentifier.toKey(extensionId), uris);
    }
    uris.push({ timestamp, uri });
    await this.extensionService.activateByEvent(
      `onUri:${ExtensionIdentifier.toKey(extensionId)}`,
      ActivationKind.Immediate
    );
    return true;
  }
  registerExtensionHandler(extensionId, handler) {
    this.extensionHandlers.set(
      ExtensionIdentifier.toKey(extensionId),
      handler
    );
    const uris = this.uriBuffer.get(ExtensionIdentifier.toKey(extensionId)) || [];
    for (const { uri } of uris) {
      this.handleURLByExtension(extensionId, handler, uri);
    }
    this.uriBuffer.delete(ExtensionIdentifier.toKey(extensionId));
  }
  unregisterExtensionHandler(extensionId) {
    this.extensionHandlers.delete(ExtensionIdentifier.toKey(extensionId));
  }
  async handleURLByExtension(extensionId, handler, uri, options) {
    this.telemetryService.publicLog2("uri_invoked/end", {
      extensionId: ExtensionIdentifier.toKey(extensionId)
    });
    return await handler.handleURL(uri, options);
  }
  async handleUnhandledURL(uri, extensionId, options) {
    this.telemetryService.publicLog2("uri_invoked/install_extension/start", { extensionId });
    try {
      await this.commandService.executeCommand(
        "workbench.extensions.installExtension",
        extensionId,
        {
          justification: {
            reason: `${localize("installDetail", "This extension wants to open a URI:")}
${uri.toString()}`,
            action: localize("openUri", "Open URI")
          },
          enable: true
        }
      );
      this.telemetryService.publicLog2("uri_invoked/install_extension/accept", { extensionId });
    } catch (error) {
      if (isCancellationError(error)) {
        this.telemetryService.publicLog2("uri_invoked/install_extension/cancel", { extensionId });
      } else {
        this.telemetryService.publicLog2("uri_invoked/install_extension/error", { extensionId });
        this.notificationService.error(error);
      }
      return;
    }
    const extension = await this.extensionService.getExtension(extensionId);
    if (extension) {
      await this.handleURL(uri, { ...options, trusted: true });
    } else {
      this.telemetryService.publicLog2("uri_invoked/install_extension/reload", {
        extensionId,
        isRemote: !!this.workbenchEnvironmentService.remoteAuthority
      });
      const result = await this.dialogService.confirm({
        message: localize(
          "reloadAndHandle",
          "Extension '{0}' is not loaded. Would you like to reload the window to load the extension and open the URL?",
          extensionId
        ),
        primaryButton: localize(
          {
            key: "reloadAndOpen",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Reload Window and Open"
        )
      });
      if (!result.confirmed) {
        return;
      }
      this.storageService.store(
        URL_TO_HANDLE,
        JSON.stringify(uri.toJSON()),
        StorageScope.WORKSPACE,
        StorageTarget.MACHINE
      );
      await this.hostService.reload();
    }
  }
  // forget about all uris buffered more than 5 minutes ago
  garbageCollect() {
    const now = (/* @__PURE__ */ new Date()).getTime();
    const uriBuffer = /* @__PURE__ */ new Map();
    this.uriBuffer.forEach((uris, extensionId) => {
      uris = uris.filter(
        ({ timestamp }) => now - timestamp < FIVE_MINUTES
      );
      if (uris.length > 0) {
        uriBuffer.set(extensionId, uris);
      }
    });
    this.uriBuffer = uriBuffer;
  }
  didUserTrustExtension(id) {
    if (this.userTrustedExtensionsStorage.has(id)) {
      return true;
    }
    return this.getConfirmedTrustedExtensionIdsFromConfiguration().indexOf(
      id
    ) > -1;
  }
  getConfirmedTrustedExtensionIdsFromConfiguration() {
    const trustedExtensionIds = this.configurationService.getValue(
      USER_TRUSTED_EXTENSIONS_CONFIGURATION_KEY
    );
    if (!Array.isArray(trustedExtensionIds)) {
      return [];
    }
    return trustedExtensionIds;
  }
  dispose() {
    this.disposable.dispose();
    this.extensionHandlers.clear();
    this.uriBuffer.clear();
  }
};
ExtensionUrlHandler = __decorateClass([
  __decorateParam(0, IURLService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IWorkbenchEnvironmentService)
], ExtensionUrlHandler);
registerSingleton(
  IExtensionUrlHandler,
  ExtensionUrlHandler,
  InstantiationType.Eager
);
let ExtensionUrlBootstrapHandler = class {
  static {
    __name(this, "ExtensionUrlBootstrapHandler");
  }
  static ID = "workbench.contrib.extensionUrlBootstrapHandler";
  static _cache = [];
  static disposable;
  static get cache() {
    ExtensionUrlBootstrapHandler.disposable.dispose();
    const result = ExtensionUrlBootstrapHandler._cache;
    ExtensionUrlBootstrapHandler._cache = [];
    return result;
  }
  constructor(urlService) {
    ExtensionUrlBootstrapHandler.disposable = urlService.registerHandler(this);
  }
  async handleURL(uri, options) {
    if (!isExtensionId(uri.authority)) {
      return false;
    }
    ExtensionUrlBootstrapHandler._cache.push([uri, options]);
    return true;
  }
};
ExtensionUrlBootstrapHandler = __decorateClass([
  __decorateParam(0, IURLService)
], ExtensionUrlBootstrapHandler);
registerWorkbenchContribution2(
  ExtensionUrlBootstrapHandler.ID,
  ExtensionUrlBootstrapHandler,
  WorkbenchPhase.BlockRestore
);
class ManageAuthorizedExtensionURIsAction extends Action2 {
  static {
    __name(this, "ManageAuthorizedExtensionURIsAction");
  }
  constructor() {
    super({
      id: "workbench.extensions.action.manageAuthorizedExtensionURIs",
      title: localize2("manage", "Manage Authorized Extension URIs..."),
      category: localize2("extensions", "Extensions"),
      menu: {
        id: MenuId.CommandPalette,
        when: IsWebContext.toNegated()
      }
    });
  }
  async run(accessor) {
    const storageService = accessor.get(IStorageService);
    const quickInputService = accessor.get(IQuickInputService);
    const storage = new UserTrustedExtensionIdStorage(storageService);
    const items = storage.extensions.map(
      (label) => ({ label, picked: true })
    );
    if (items.length === 0) {
      await quickInputService.pick([
        {
          label: localize(
            "no",
            "There are currently no authorized extension URIs."
          )
        }
      ]);
      return;
    }
    const result = await quickInputService.pick(items, {
      canPickMany: true
    });
    if (!result) {
      return;
    }
    storage.set(result.map((item) => item.label));
  }
}
registerAction2(ManageAuthorizedExtensionURIsAction);
export {
  IExtensionUrlHandler
};
//# sourceMappingURL=extensionUrlHandler.js.map
