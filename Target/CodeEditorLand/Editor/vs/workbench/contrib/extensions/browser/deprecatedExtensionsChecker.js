var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { distinct } from "../../../../base/common/arrays.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
import { SearchExtensionsAction } from "./extensionsActions.js";
let DeprecatedExtensionsChecker = class extends Disposable {
  constructor(extensionsWorkbenchService, extensionManagementService, extensionEnablementService, storageService, notificationService, instantiationService) {
    super();
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.storageService = storageService;
    this.notificationService = notificationService;
    this.instantiationService = instantiationService;
    this.checkForDeprecatedExtensions();
    this._register(
      extensionManagementService.onDidInstallExtensions((e) => {
        const ids = [];
        for (const { local } of e) {
          if (local && extensionsWorkbenchService.local.find(
            (extension) => areSameExtensions(
              extension.identifier,
              local.identifier
            )
          )?.deprecationInfo) {
            ids.push(local.identifier.id.toLowerCase());
          }
        }
        if (ids.length) {
          this.setNotifiedDeprecatedExtensions(ids);
        }
      })
    );
  }
  async checkForDeprecatedExtensions() {
    if (this.storageService.getBoolean(
      "extensionsAssistant/doNotCheckDeprecated",
      StorageScope.PROFILE,
      false
    )) {
      return;
    }
    const local = await this.extensionsWorkbenchService.queryLocal();
    const previouslyNotified = this.getNotifiedDeprecatedExtensions();
    const toNotify = local.filter(
      (e) => !!e.deprecationInfo && e.local && this.extensionEnablementService.isEnabled(e.local)
    ).filter(
      (e) => !previouslyNotified.includes(e.identifier.id.toLowerCase())
    );
    if (toNotify.length) {
      this.notificationService.prompt(
        Severity.Warning,
        localize(
          "deprecated extensions",
          "You have deprecated extensions installed. We recommend to review them and migrate to alternatives."
        ),
        [
          {
            label: localize(
              "showDeprecated",
              "Show Deprecated Extensions"
            ),
            run: async () => {
              this.setNotifiedDeprecatedExtensions(
                toNotify.map(
                  (e) => e.identifier.id.toLowerCase()
                )
              );
              const action = this.instantiationService.createInstance(
                SearchExtensionsAction,
                toNotify.map(
                  (extension) => `@id:${extension.identifier.id}`
                ).join(" ")
              );
              try {
                await action.run();
              } finally {
                action.dispose();
              }
            }
          },
          {
            label: localize("neverShowAgain", "Don't Show Again"),
            isSecondary: true,
            run: () => this.storageService.store(
              "extensionsAssistant/doNotCheckDeprecated",
              true,
              StorageScope.PROFILE,
              StorageTarget.USER
            )
          }
        ]
      );
    }
  }
  getNotifiedDeprecatedExtensions() {
    return JSON.parse(
      this.storageService.get(
        "extensionsAssistant/deprecated",
        StorageScope.PROFILE,
        "[]"
      )
    );
  }
  setNotifiedDeprecatedExtensions(notified) {
    this.storageService.store(
      "extensionsAssistant/deprecated",
      JSON.stringify(
        distinct([
          ...this.getNotifiedDeprecatedExtensions(),
          ...notified
        ])
      ),
      StorageScope.PROFILE,
      StorageTarget.USER
    );
  }
};
DeprecatedExtensionsChecker = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IExtensionManagementService),
  __decorateParam(2, IWorkbenchExtensionEnablementService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IInstantiationService)
], DeprecatedExtensionsChecker);
export {
  DeprecatedExtensionsChecker
};
