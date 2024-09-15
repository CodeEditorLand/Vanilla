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
import {
  Disposable,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  Extensions as ConfigurationExtensions,
  ConfigurationScope
} from "../../../../platform/configuration/common/configurationRegistry.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { applicationConfigurationNodeBase } from "../../../common/configuration.js";
import {
  IActivityService,
  NumberBadge
} from "../../../services/activity/common/activity.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { CHAT_VIEW_ID } from "./chat.js";
const showChatGettingStartedConfigKey = "workbench.panel.chat.view.experimental.showGettingStarted";
let ChatGettingStartedContribution = class extends Disposable {
  constructor(contextService, productService, storageService, activityService, extensionService, commandService, configurationService, extensionManagementService) {
    super();
    this.contextService = contextService;
    this.productService = productService;
    this.storageService = storageService;
    this.activityService = activityService;
    this.extensionService = extensionService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.extensionManagementService = extensionManagementService;
    if (!this.productService.gitHubEntitlement) {
      return;
    }
    if (this.storageService.get(showChatGettingStartedConfigKey, StorageScope.APPLICATION) !== void 0) {
      return;
    }
    this.extensionManagementService.getInstalled().then(async (exts) => {
      const installed = exts.find((value) => ExtensionIdentifier.equals(value.identifier.id, this.productService.gitHubEntitlement.extensionId));
      if (!installed) {
        this.registerListeners();
        return;
      }
      this.storageService.store(showChatGettingStartedConfigKey, "installed", StorageScope.APPLICATION, StorageTarget.MACHINE);
    });
  }
  static {
    __name(this, "ChatGettingStartedContribution");
  }
  static ID = "workbench.contrib.chatGettingStarted";
  showChatGettingStartedDisposable = this._register(
    new MutableDisposable()
  );
  registerListeners() {
    this._register(
      this.extensionService.onDidChangeExtensions(async (result) => {
        if (this.storageService.get(
          showChatGettingStartedConfigKey,
          StorageScope.APPLICATION
        ) !== void 0) {
          return;
        }
        for (const ext of result.added) {
          if (ExtensionIdentifier.equals(
            this.productService.gitHubEntitlement.extensionId,
            ext.identifier
          )) {
            this.displayBadge();
            return;
          }
        }
      })
    );
    this.extensionService.onDidChangeExtensionsStatus(async (event) => {
      if (this.storageService.get(
        showChatGettingStartedConfigKey,
        StorageScope.APPLICATION
      ) !== void 0) {
        return;
      }
      for (const ext of event) {
        if (ExtensionIdentifier.equals(
          this.productService.gitHubEntitlement.extensionId,
          ext.value
        )) {
          const extensionStatus = this.extensionService.getExtensionsStatus();
          if (extensionStatus[ext.value].activationTimes) {
            this.displayChatPanel();
            return;
          }
        }
      }
    });
    this._register(
      this.contextService.onDidChangeContext((event) => {
        if (this.storageService.get(
          showChatGettingStartedConfigKey,
          StorageScope.APPLICATION
        ) === void 0) {
          return;
        }
        if (event.affectsSome(/* @__PURE__ */ new Set([`view.${CHAT_VIEW_ID}.visible`]))) {
          if (this.contextService.contextMatchesRules(
            ContextKeyExpr.deserialize(
              `${CHAT_VIEW_ID}.visible`
            )
          )) {
            this.showChatGettingStartedDisposable.clear();
          }
        }
      })
    );
  }
  async displayBadge() {
    const showGettingStartedExp = this.configurationService.inspect(
      showChatGettingStartedConfigKey
    ).value ?? "";
    if (!showGettingStartedExp || showGettingStartedExp !== "showBadge") {
      return;
    }
    const badge = new NumberBadge(
      1,
      () => localize("chat.openPanel", "Open Chat Panel")
    );
    this.showChatGettingStartedDisposable.value = this.activityService.showViewActivity(CHAT_VIEW_ID, { badge });
    this.storageService.store(
      showChatGettingStartedConfigKey,
      showGettingStartedExp,
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
  }
  async displayChatPanel() {
    const showGettingStartedExp = this.configurationService.inspect(
      showChatGettingStartedConfigKey
    ).value ?? "";
    if (!showGettingStartedExp || showGettingStartedExp !== "showChatPanel") {
      return;
    }
    this.commandService.executeCommand(`${CHAT_VIEW_ID}.focus`);
    this.storageService.store(
      showChatGettingStartedConfigKey,
      showGettingStartedExp,
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
  }
};
ChatGettingStartedContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IProductService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IActivityService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExtensionManagementService)
], ChatGettingStartedContribution);
const configurationRegistry = Registry.as(
  ConfigurationExtensions.Configuration
);
configurationRegistry.registerConfiguration({
  ...applicationConfigurationNodeBase,
  properties: {
    "workbench.panel.chat.view.experimental.showGettingStarted": {
      scope: ConfigurationScope.MACHINE,
      type: "string",
      default: "",
      tags: ["experimental"],
      description: localize(
        "workbench.panel.chat.view.showGettingStarted",
        "When enabled, shows a getting started experiments in the chat panel."
      )
    }
  }
});
export {
  ChatGettingStartedContribution
};
//# sourceMappingURL=chatGettingStarted.js.map
