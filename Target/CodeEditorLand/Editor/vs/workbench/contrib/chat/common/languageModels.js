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
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import {
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { localize } from "../../../../nls.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IExtensionService,
  isProposedApiEnabled
} from "../../../services/extensions/common/extensions.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
var ChatMessageRole = /* @__PURE__ */ ((ChatMessageRole2) => {
  ChatMessageRole2[ChatMessageRole2["System"] = 0] = "System";
  ChatMessageRole2[ChatMessageRole2["User"] = 1] = "User";
  ChatMessageRole2[ChatMessageRole2["Assistant"] = 2] = "Assistant";
  return ChatMessageRole2;
})(ChatMessageRole || {});
const ILanguageModelsService = createDecorator(
  "ILanguageModelsService"
);
const languageModelType = {
  type: "object",
  properties: {
    vendor: {
      type: "string",
      description: localize(
        "vscode.extension.contributes.languageModels.vendor",
        "A globally unique vendor of language models."
      )
    }
  }
};
const languageModelExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languageModels",
  jsonSchema: {
    description: localize(
      "vscode.extension.contributes.languageModels",
      "Contribute language models of a specific vendor."
    ),
    oneOf: [
      languageModelType,
      {
        type: "array",
        items: languageModelType
      }
    ]
  },
  activationEventsGenerator: (contribs, result) => {
    for (const contrib of contribs) {
      result.push(`onLanguageModelChat:${contrib.vendor}`);
    }
  }
});
let LanguageModelsService = class {
  constructor(_extensionService, _logService) {
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._store.add(languageModelExtensionPoint.setHandler((extensions) => {
      this._vendors.clear();
      for (const extension of extensions) {
        if (!isProposedApiEnabled(extension.description, "chatProvider")) {
          extension.collector.error(localize("vscode.extension.contributes.languageModels.chatProviderRequired", "This contribution point requires the 'chatProvider' proposal."));
          continue;
        }
        for (const item of Iterable.wrap(extension.value)) {
          if (this._vendors.has(item.vendor)) {
            extension.collector.error(localize("vscode.extension.contributes.languageModels.vendorAlreadyRegistered", "The vendor '{0}' is already registered and cannot be registered twice", item.vendor));
            continue;
          }
          if (isFalsyOrWhitespace(item.vendor)) {
            extension.collector.error(localize("vscode.extension.contributes.languageModels.emptyVendor", "The vendor field cannot be empty."));
            continue;
          }
          if (item.vendor.trim() !== item.vendor) {
            extension.collector.error(localize("vscode.extension.contributes.languageModels.whitespaceVendor", "The vendor field cannot start or end with whitespace."));
            continue;
          }
          this._vendors.add(item.vendor);
        }
      }
      const removed = [];
      for (const [identifier, value] of this._providers) {
        if (!this._vendors.has(value.metadata.vendor)) {
          this._providers.delete(identifier);
          removed.push(identifier);
        }
      }
      if (removed.length > 0) {
        this._onDidChangeProviders.fire({ removed });
      }
    }));
  }
  _serviceBrand;
  _store = new DisposableStore();
  _providers = /* @__PURE__ */ new Map();
  _vendors = /* @__PURE__ */ new Set();
  _onDidChangeProviders = this._store.add(
    new Emitter()
  );
  onDidChangeLanguageModels = this._onDidChangeProviders.event;
  dispose() {
    this._store.dispose();
    this._providers.clear();
  }
  getLanguageModelIds() {
    return Array.from(this._providers.keys());
  }
  lookupLanguageModel(identifier) {
    return this._providers.get(identifier)?.metadata;
  }
  async selectLanguageModels(selector) {
    if (selector.vendor) {
      await this._extensionService.activateByEvent(
        `onLanguageModelChat:${selector.vendor}}`
      );
    } else {
      const all = Array.from(this._vendors).map(
        (vendor) => this._extensionService.activateByEvent(
          `onLanguageModelChat:${vendor}`
        )
      );
      await Promise.all(all);
    }
    const result = [];
    for (const [identifier, model] of this._providers) {
      if ((selector.vendor === void 0 || model.metadata.vendor === selector.vendor) && (selector.family === void 0 || model.metadata.family === selector.family) && (selector.version === void 0 || model.metadata.version === selector.version) && (selector.identifier === void 0 || model.metadata.id === selector.identifier) && (!model.metadata.targetExtensions || model.metadata.targetExtensions.some(
        (candidate) => ExtensionIdentifier.equals(
          candidate,
          selector.extension
        )
      ))) {
        result.push(identifier);
      }
    }
    this._logService.trace(
      "[LM] selected language models",
      selector,
      result
    );
    return result;
  }
  registerLanguageModelChat(identifier, provider) {
    this._logService.trace(
      "[LM] registering language model chat",
      identifier,
      provider.metadata
    );
    if (!this._vendors.has(provider.metadata.vendor)) {
      throw new Error(
        `Chat response provider uses UNKNOWN vendor ${provider.metadata.vendor}.`
      );
    }
    if (this._providers.has(identifier)) {
      throw new Error(
        `Chat response provider with identifier ${identifier} is already registered.`
      );
    }
    this._providers.set(identifier, provider);
    this._onDidChangeProviders.fire({
      added: [{ identifier, metadata: provider.metadata }]
    });
    return toDisposable(() => {
      if (this._providers.delete(identifier)) {
        this._onDidChangeProviders.fire({ removed: [identifier] });
        this._logService.trace(
          "[LM] UNregistered language model chat",
          identifier,
          provider.metadata
        );
      }
    });
  }
  async sendChatRequest(identifier, from, messages, options, token) {
    const provider = this._providers.get(identifier);
    if (!provider) {
      throw new Error(
        `Chat response provider with identifier ${identifier} is not registered.`
      );
    }
    return provider.sendChatRequest(messages, from, options, token);
  }
  computeTokenLength(identifier, message, token) {
    const provider = this._providers.get(identifier);
    if (!provider) {
      throw new Error(
        `Chat response provider with identifier ${identifier} is not registered.`
      );
    }
    return provider.provideTokenCount(message, token);
  }
};
LanguageModelsService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, ILogService)
], LanguageModelsService);
export {
  ChatMessageRole,
  ILanguageModelsService,
  LanguageModelsService,
  languageModelExtensionPoint
};
