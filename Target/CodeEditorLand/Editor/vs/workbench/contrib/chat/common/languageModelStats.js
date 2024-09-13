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
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import {
  Extensions,
  IExtensionFeaturesManagementService
} from "../../../services/extensionManagement/common/extensionFeatures.js";
const ILanguageModelStatsService = createDecorator("ILanguageModelStatsService");
let LanguageModelStatsService = class extends Disposable {
  constructor(extensionFeaturesManagementService, _storageService) {
    super();
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this._storageService = _storageService;
    this._register(_storageService.onDidChangeValue(StorageScope.APPLICATION, void 0, this._store)((e) => {
      const model = this.getModel(e.key);
      if (model) {
        this._onDidChangeStats.fire(model);
      }
    }));
  }
  static {
    __name(this, "LanguageModelStatsService");
  }
  static MODEL_STATS_STORAGE_KEY_PREFIX = "languageModelStats.";
  static MODEL_ACCESS_STORAGE_KEY_PREFIX = "languageModelAccess.";
  _onDidChangeStats = this._register(new Emitter());
  onDidChangeLanguageMoelStats = this._onDidChangeStats.event;
  sessionStats = /* @__PURE__ */ new Map();
  hasAccessedModel(extensionId, model) {
    return this.getAccessExtensions(model).includes(
      extensionId.toLowerCase()
    );
  }
  async update(model, extensionId, agent, tokenCount) {
    await this.extensionFeaturesManagementService.getAccess(
      extensionId,
      "languageModels"
    );
    this.addAccess(model, extensionId.value);
    let sessionStats = this.sessionStats.get(model);
    if (!sessionStats) {
      sessionStats = { extensions: [] };
      this.sessionStats.set(model, sessionStats);
    }
    this.add(sessionStats, extensionId.value, agent, tokenCount);
    this.write(model, extensionId.value, agent, tokenCount);
    this._onDidChangeStats.fire(model);
  }
  addAccess(model, extensionId) {
    extensionId = extensionId.toLowerCase();
    const extensions = this.getAccessExtensions(model);
    if (!extensions.includes(extensionId)) {
      extensions.push(extensionId);
      this._storageService.store(
        this.getAccessKey(model),
        JSON.stringify(extensions),
        StorageScope.APPLICATION,
        StorageTarget.USER
      );
    }
  }
  getAccessExtensions(model) {
    const key = this.getAccessKey(model);
    const data = this._storageService.get(key, StorageScope.APPLICATION);
    try {
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
    }
    return [];
  }
  async write(model, extensionId, participant, tokenCount) {
    const modelStats = await this.read(model);
    this.add(modelStats, extensionId, participant, tokenCount);
    this._storageService.store(
      this.getKey(model),
      JSON.stringify(modelStats),
      StorageScope.APPLICATION,
      StorageTarget.USER
    );
  }
  add(modelStats, extensionId, participant, tokenCount) {
    let extensionStats = modelStats.extensions.find(
      (e) => ExtensionIdentifier.equals(e.extensionId, extensionId)
    );
    if (!extensionStats) {
      extensionStats = {
        extensionId,
        requestCount: 0,
        tokenCount: 0,
        participants: []
      };
      modelStats.extensions.push(extensionStats);
    }
    if (participant) {
      let participantStats = extensionStats.participants.find(
        (p) => p.id === participant
      );
      if (!participantStats) {
        participantStats = {
          id: participant,
          requestCount: 0,
          tokenCount: 0
        };
        extensionStats.participants.push(participantStats);
      }
      participantStats.requestCount++;
      participantStats.tokenCount += tokenCount ?? 0;
    } else {
      extensionStats.requestCount++;
      extensionStats.tokenCount += tokenCount ?? 0;
    }
  }
  async read(model) {
    try {
      const value = this._storageService.get(
        this.getKey(model),
        StorageScope.APPLICATION
      );
      if (value) {
        return JSON.parse(value);
      }
    } catch (error) {
    }
    return { extensions: [] };
  }
  getModel(key) {
    if (key.startsWith(
      LanguageModelStatsService.MODEL_STATS_STORAGE_KEY_PREFIX
    )) {
      return key.substring(
        LanguageModelStatsService.MODEL_STATS_STORAGE_KEY_PREFIX.length
      );
    }
    return void 0;
  }
  getKey(model) {
    return `${LanguageModelStatsService.MODEL_STATS_STORAGE_KEY_PREFIX}${model}`;
  }
  getAccessKey(model) {
    return `${LanguageModelStatsService.MODEL_ACCESS_STORAGE_KEY_PREFIX}${model}`;
  }
};
LanguageModelStatsService = __decorateClass([
  __decorateParam(0, IExtensionFeaturesManagementService),
  __decorateParam(1, IStorageService)
], LanguageModelStatsService);
Registry.as(
  Extensions.ExtensionFeaturesRegistry
).registerExtensionFeature({
  id: "languageModels",
  label: localize("Language Models", "Language Models"),
  description: localize(
    "languageModels",
    "Language models usage statistics of this extension."
  ),
  access: {
    canToggle: false
  }
});
export {
  ILanguageModelStatsService,
  LanguageModelStatsService
};
//# sourceMappingURL=languageModelStats.js.map
