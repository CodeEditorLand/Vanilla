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
import { shuffle } from "../../../../base/common/arrays.js";
import {
  timeout
} from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { isString } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import {
  IExtensionGalleryService,
  IExtensionManagementService,
  InstallOperation
} from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IExtensionRecommendationNotificationService } from "../../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IRemoteExtensionsScannerService } from "../../../../platform/remote/common/remoteExtensionsScanner.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  IExtensionIgnoredRecommendationsService
} from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
import {
  ILifecycleService,
  LifecyclePhase
} from "../../../services/lifecycle/common/lifecycle.js";
import { IUserDataInitializationService } from "../../../services/userData/browser/userDataInit.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
import { ConfigBasedRecommendations } from "./configBasedRecommendations.js";
import { ExeBasedRecommendations } from "./exeBasedRecommendations.js";
import { FileBasedRecommendations } from "./fileBasedRecommendations.js";
import { KeymapRecommendations } from "./keymapRecommendations.js";
import { LanguageRecommendations } from "./languageRecommendations.js";
import { RemoteRecommendations } from "./remoteRecommendations.js";
import { WebRecommendations } from "./webRecommendations.js";
import { WorkspaceRecommendations } from "./workspaceRecommendations.js";
let ExtensionRecommendationsService = class extends Disposable {
  constructor(instantiationService, lifecycleService, galleryService, telemetryService, environmentService, extensionManagementService, extensionRecommendationsManagementService, extensionRecommendationNotificationService, extensionsWorkbenchService, remoteExtensionsScannerService, userDataInitializationService) {
    super();
    this.lifecycleService = lifecycleService;
    this.galleryService = galleryService;
    this.telemetryService = telemetryService;
    this.environmentService = environmentService;
    this.extensionManagementService = extensionManagementService;
    this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
    this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.remoteExtensionsScannerService = remoteExtensionsScannerService;
    this.userDataInitializationService = userDataInitializationService;
    this.workspaceRecommendations = this._register(
      instantiationService.createInstance(WorkspaceRecommendations)
    );
    this.fileBasedRecommendations = this._register(
      instantiationService.createInstance(FileBasedRecommendations)
    );
    this.configBasedRecommendations = this._register(
      instantiationService.createInstance(ConfigBasedRecommendations)
    );
    this.exeBasedRecommendations = this._register(
      instantiationService.createInstance(ExeBasedRecommendations)
    );
    this.keymapRecommendations = this._register(
      instantiationService.createInstance(KeymapRecommendations)
    );
    this.webRecommendations = this._register(
      instantiationService.createInstance(WebRecommendations)
    );
    this.languageRecommendations = this._register(
      instantiationService.createInstance(LanguageRecommendations)
    );
    this.remoteRecommendations = this._register(
      instantiationService.createInstance(RemoteRecommendations)
    );
    if (!this.isEnabled()) {
      this.sessionSeed = 0;
      this.activationPromise = Promise.resolve();
      return;
    }
    this.sessionSeed = +/* @__PURE__ */ new Date();
    this.activationPromise = this.activate();
    this._register(
      this.extensionManagementService.onDidInstallExtensions(
        (e) => this.onDidInstallExtensions(e)
      )
    );
  }
  // Recommendations
  fileBasedRecommendations;
  workspaceRecommendations;
  configBasedRecommendations;
  exeBasedRecommendations;
  keymapRecommendations;
  webRecommendations;
  languageRecommendations;
  remoteRecommendations;
  activationPromise;
  sessionSeed;
  _onDidChangeRecommendations = this._register(new Emitter());
  onDidChangeRecommendations = this._onDidChangeRecommendations.event;
  async activate() {
    try {
      await Promise.allSettled([
        this.remoteExtensionsScannerService.whenExtensionsReady(),
        this.userDataInitializationService.whenInitializationFinished(),
        this.lifecycleService.when(LifecyclePhase.Restored)
      ]);
    } catch (error) {
    }
    await Promise.all([
      this.workspaceRecommendations.activate(),
      this.configBasedRecommendations.activate(),
      this.fileBasedRecommendations.activate(),
      this.keymapRecommendations.activate(),
      this.languageRecommendations.activate(),
      this.webRecommendations.activate(),
      this.remoteRecommendations.activate()
    ]);
    this._register(
      Event.any(
        this.workspaceRecommendations.onDidChangeRecommendations,
        this.configBasedRecommendations.onDidChangeRecommendations,
        this.extensionRecommendationsManagementService.onDidChangeIgnoredRecommendations
      )(() => this._onDidChangeRecommendations.fire())
    );
    this._register(
      this.extensionRecommendationsManagementService.onDidChangeGlobalIgnoredRecommendation(
        ({ extensionId, isRecommended }) => {
          if (!isRecommended) {
            const reason = this.getAllRecommendationsWithReason()[extensionId];
            if (reason && reason.reasonId) {
              this.telemetryService.publicLog2(
                "extensionsRecommendations:ignoreRecommendation",
                {
                  extensionId,
                  recommendationReason: reason.reasonId
                }
              );
            }
          }
        }
      )
    );
    this.promptWorkspaceRecommendations();
  }
  isEnabled() {
    return this.galleryService.isEnabled() && !this.environmentService.isExtensionDevelopment;
  }
  async activateProactiveRecommendations() {
    await Promise.all([
      this.exeBasedRecommendations.activate(),
      this.configBasedRecommendations.activate()
    ]);
  }
  getAllRecommendationsWithReason() {
    this.activateProactiveRecommendations();
    const output = /* @__PURE__ */ Object.create(null);
    const allRecommendations = [
      ...this.configBasedRecommendations.recommendations,
      ...this.exeBasedRecommendations.recommendations,
      ...this.fileBasedRecommendations.recommendations,
      ...this.workspaceRecommendations.recommendations,
      ...this.keymapRecommendations.recommendations,
      ...this.languageRecommendations.recommendations,
      ...this.webRecommendations.recommendations
    ];
    for (const { extension, reason } of allRecommendations) {
      if (isString(extension) && this.isExtensionAllowedToBeRecommended(extension)) {
        output[extension.toLowerCase()] = reason;
      }
    }
    return output;
  }
  async getConfigBasedRecommendations() {
    await this.configBasedRecommendations.activate();
    return {
      important: this.toExtensionIds(
        this.configBasedRecommendations.importantRecommendations
      ),
      others: this.toExtensionIds(
        this.configBasedRecommendations.otherRecommendations
      )
    };
  }
  async getOtherRecommendations() {
    await this.activationPromise;
    await this.activateProactiveRecommendations();
    const recommendations = [
      ...this.configBasedRecommendations.otherRecommendations,
      ...this.exeBasedRecommendations.otherRecommendations,
      ...this.webRecommendations.recommendations
    ];
    const extensionIds = this.toExtensionIds(recommendations);
    shuffle(extensionIds, this.sessionSeed);
    return extensionIds;
  }
  async getImportantRecommendations() {
    await this.activateProactiveRecommendations();
    const recommendations = [
      ...this.fileBasedRecommendations.importantRecommendations,
      ...this.configBasedRecommendations.importantRecommendations,
      ...this.exeBasedRecommendations.importantRecommendations
    ];
    const extensionIds = this.toExtensionIds(recommendations);
    shuffle(extensionIds, this.sessionSeed);
    return extensionIds;
  }
  getKeymapRecommendations() {
    return this.toExtensionIds(this.keymapRecommendations.recommendations);
  }
  getLanguageRecommendations() {
    return this.toExtensionIds(
      this.languageRecommendations.recommendations
    );
  }
  getRemoteRecommendations() {
    return this.toExtensionIds(this.remoteRecommendations.recommendations);
  }
  async getWorkspaceRecommendations() {
    if (!this.isEnabled()) {
      return [];
    }
    await this.workspaceRecommendations.activate();
    const result = [];
    for (const { extension } of this.workspaceRecommendations.recommendations) {
      if (isString(extension)) {
        if (!result.includes(extension.toLowerCase()) && this.isExtensionAllowedToBeRecommended(extension)) {
          result.push(extension.toLowerCase());
        }
      } else {
        result.push(extension);
      }
    }
    return result;
  }
  async getExeBasedRecommendations(exe) {
    await this.exeBasedRecommendations.activate();
    const { important, others } = exe ? this.exeBasedRecommendations.getRecommendations(exe) : {
      important: this.exeBasedRecommendations.importantRecommendations,
      others: this.exeBasedRecommendations.otherRecommendations
    };
    return {
      important: this.toExtensionIds(important),
      others: this.toExtensionIds(others)
    };
  }
  getFileBasedRecommendations() {
    return this.toExtensionIds(
      this.fileBasedRecommendations.recommendations
    );
  }
  onDidInstallExtensions(results) {
    for (const e of results) {
      if (e.source && !URI.isUri(e.source) && e.operation === InstallOperation.Install) {
        const extRecommendations = this.getAllRecommendationsWithReason() || {};
        const recommendationReason = extRecommendations[e.source.identifier.id.toLowerCase()];
        if (recommendationReason) {
          this.telemetryService.publicLog(
            "extensionGallery:install:recommendations",
            {
              ...e.source.telemetryData,
              recommendationReason: recommendationReason.reasonId
            }
          );
        }
      }
    }
  }
  toExtensionIds(recommendations) {
    const extensionIds = [];
    for (const { extension } of recommendations) {
      if (isString(extension) && this.isExtensionAllowedToBeRecommended(extension) && !extensionIds.includes(extension.toLowerCase())) {
        extensionIds.push(extension.toLowerCase());
      }
    }
    return extensionIds;
  }
  isExtensionAllowedToBeRecommended(extensionId) {
    return !this.extensionRecommendationsManagementService.ignoredRecommendations.includes(
      extensionId.toLowerCase()
    );
  }
  async promptWorkspaceRecommendations() {
    const installed = await this.extensionsWorkbenchService.queryLocal();
    const allowedRecommendations = [
      ...this.workspaceRecommendations.recommendations,
      ...this.configBasedRecommendations.importantRecommendations.filter(
        (recommendation) => !recommendation.whenNotInstalled || recommendation.whenNotInstalled.every(
          (id) => installed.every(
            (local) => !areSameExtensions(local.identifier, { id })
          )
        )
      )
    ].map(({ extension }) => extension).filter(
      (extension) => !isString(extension) || this.isExtensionAllowedToBeRecommended(extension)
    );
    if (allowedRecommendations.length) {
      await this._registerP(timeout(5e3));
      await this.extensionRecommendationNotificationService.promptWorkspaceRecommendations(
        allowedRecommendations
      );
    }
  }
  _registerP(o) {
    this._register(toDisposable(() => o.cancel()));
    return o;
  }
};
ExtensionRecommendationsService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IExtensionManagementService),
  __decorateParam(6, IExtensionIgnoredRecommendationsService),
  __decorateParam(7, IExtensionRecommendationNotificationService),
  __decorateParam(8, IExtensionsWorkbenchService),
  __decorateParam(9, IRemoteExtensionsScannerService),
  __decorateParam(10, IUserDataInitializationService)
], ExtensionRecommendationsService);
export {
  ExtensionRecommendationsService
};
