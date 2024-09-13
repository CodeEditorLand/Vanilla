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
  AsyncIterableObject,
  AsyncIterableSource
} from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import {
  CancellationError,
  transformErrorForSerialization,
  transformErrorFromSerialization
} from "../../../base/common/errors.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import {
  toDisposable
} from "../../../base/common/lifecycle.js";
import { localize } from "../../../nls.js";
import {
  ExtensionIdentifier,
  ExtensionIdentifierMap,
  ExtensionIdentifierSet
} from "../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { Progress } from "../../../platform/progress/common/progress.js";
import { INTERNAL_AUTH_PROVIDER_PREFIX } from "../../services/authentication/common/authentication.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostAuthentication } from "./extHostAuthentication.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import * as typeConvert from "./extHostTypeConverters.js";
import * as extHostTypes from "./extHostTypes.js";
const IExtHostLanguageModels = createDecorator(
  "IExtHostLanguageModels"
);
class LanguageModelResponseStream {
  constructor(option, stream) {
    this.option = option;
    this.stream = stream ?? new AsyncIterableSource();
  }
  static {
    __name(this, "LanguageModelResponseStream");
  }
  stream = new AsyncIterableSource();
}
class LanguageModelResponse {
  static {
    __name(this, "LanguageModelResponse");
  }
  apiObject;
  _responseStreams = /* @__PURE__ */ new Map();
  _defaultStream = new AsyncIterableSource();
  _isDone = false;
  constructor() {
    const that = this;
    this.apiObject = {
      // result: promise,
      get stream() {
        return that._defaultStream.asyncIterable;
      },
      get text() {
        return AsyncIterableObject.map(
          that._defaultStream.asyncIterable,
          (part) => {
            if (part instanceof extHostTypes.LanguageModelTextPart) {
              return part.value;
            } else {
              return void 0;
            }
          }
        ).coalesce();
      }
    };
  }
  *_streams() {
    if (this._responseStreams.size > 0) {
      for (const [, value] of this._responseStreams) {
        yield value.stream;
      }
    } else {
      yield this._defaultStream;
    }
  }
  handleFragment(fragment) {
    if (this._isDone) {
      return;
    }
    let res = this._responseStreams.get(fragment.index);
    if (!res) {
      if (this._responseStreams.size === 0) {
        res = new LanguageModelResponseStream(
          fragment.index,
          this._defaultStream
        );
      } else {
        res = new LanguageModelResponseStream(fragment.index);
      }
      this._responseStreams.set(fragment.index, res);
    }
    let out;
    if (fragment.part.type === "text") {
      out = new extHostTypes.LanguageModelTextPart(fragment.part.value);
    } else {
      out = new extHostTypes.LanguageModelToolCallPart(
        fragment.part.name,
        fragment.part.toolCallId,
        fragment.part.parameters
      );
    }
    res.stream.emitOne(out);
  }
  reject(err) {
    this._isDone = true;
    for (const stream of this._streams()) {
      stream.reject(err);
    }
  }
  resolve() {
    this._isDone = true;
    for (const stream of this._streams()) {
      stream.resolve();
    }
  }
}
let ExtHostLanguageModels = class {
  constructor(extHostRpc, _logService, _extHostAuthentication) {
    this._logService = _logService;
    this._extHostAuthentication = _extHostAuthentication;
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadLanguageModels);
  }
  static {
    __name(this, "ExtHostLanguageModels");
  }
  static _idPool = 1;
  _proxy;
  _onDidChangeModelAccess = new Emitter();
  _onDidChangeProviders = new Emitter();
  onDidChangeProviders = this._onDidChangeProviders.event;
  _languageModels = /* @__PURE__ */ new Map();
  _allLanguageModelData = /* @__PURE__ */ new Map();
  // these are ALL models, not just the one in this EH
  _modelAccessList = new ExtensionIdentifierMap();
  _pendingRequest = /* @__PURE__ */ new Map();
  dispose() {
    this._onDidChangeModelAccess.dispose();
    this._onDidChangeProviders.dispose();
  }
  registerLanguageModel(extension, identifier, provider, metadata) {
    const handle = ExtHostLanguageModels._idPool++;
    this._languageModels.set(handle, {
      extension: extension.identifier,
      provider,
      languageModelId: identifier
    });
    let auth;
    if (metadata.auth) {
      auth = {
        providerLabel: extension.displayName || extension.name,
        accountLabel: typeof metadata.auth === "object" ? metadata.auth.label : void 0
      };
    }
    this._proxy.$registerLanguageModelProvider(
      handle,
      `${ExtensionIdentifier.toKey(extension.identifier)}/${handle}/${identifier}`,
      {
        extension: extension.identifier,
        id: identifier,
        vendor: metadata.vendor ?? ExtensionIdentifier.toKey(extension.identifier),
        name: metadata.name ?? "",
        family: metadata.family ?? "",
        version: metadata.version,
        maxInputTokens: metadata.maxInputTokens,
        maxOutputTokens: metadata.maxOutputTokens,
        auth,
        targetExtensions: metadata.extensions
      }
    );
    const responseReceivedListener = provider.onDidReceiveLanguageModelResponse2?.(
      ({ extensionId, participant, tokenCount }) => {
        this._proxy.$whenLanguageModelChatRequestMade(
          identifier,
          new ExtensionIdentifier(extensionId),
          participant,
          tokenCount
        );
      }
    );
    return toDisposable(() => {
      this._languageModels.delete(handle);
      this._proxy.$unregisterProvider(handle);
      responseReceivedListener?.dispose();
    });
  }
  async $startChatRequest(handle, requestId, from, messages, options, token) {
    const data = this._languageModels.get(handle);
    if (!data) {
      throw new Error("Provider not found");
    }
    const progress = new Progress(
      async (fragment) => {
        if (token.isCancellationRequested) {
          this._logService.warn(
            `[CHAT](${data.extension.value}) CANNOT send progress because the REQUEST IS CANCELLED`
          );
          return;
        }
        let part;
        if (fragment.part instanceof extHostTypes.LanguageModelToolCallPart) {
          part = {
            type: "tool_use",
            name: fragment.part.name,
            parameters: fragment.part.parameters,
            toolCallId: fragment.part.toolCallId
          };
        } else if (fragment.part instanceof extHostTypes.LanguageModelTextPart) {
          part = { type: "text", value: fragment.part.value };
        }
        if (!part) {
          this._logService.warn(
            `[CHAT](${data.extension.value}) UNKNOWN part ${JSON.stringify(fragment)}`
          );
          return;
        }
        this._proxy.$reportResponsePart(requestId, {
          index: fragment.index,
          part
        });
      }
    );
    let p;
    if (data.provider.provideLanguageModelResponse2) {
      p = Promise.resolve(
        data.provider.provideLanguageModelResponse2(
          messages.map(typeConvert.LanguageModelChatMessage.to),
          options,
          ExtensionIdentifier.toKey(from),
          progress,
          token
        )
      );
    } else {
      const progress2 = new Progress(
        async (fragment) => {
          progress.report({
            index: fragment.index,
            part: new extHostTypes.LanguageModelTextPart(
              fragment.part
            )
          });
        }
      );
      p = Promise.resolve(
        data.provider.provideLanguageModelResponse(
          messages.map(typeConvert.LanguageModelChatMessage.to),
          options?.modelOptions ?? {},
          ExtensionIdentifier.toKey(from),
          progress2,
          token
        )
      );
    }
    p.then(
      () => {
        this._proxy.$reportResponseDone(requestId, void 0);
      },
      (err) => {
        this._proxy.$reportResponseDone(
          requestId,
          transformErrorForSerialization(err)
        );
      }
    );
  }
  //#region --- token counting
  $provideTokenLength(handle, value, token) {
    const data = this._languageModels.get(handle);
    if (!data) {
      return Promise.resolve(0);
    }
    return Promise.resolve(data.provider.provideTokenCount(value, token));
  }
  //#region --- making request
  $acceptChatModelMetadata(data) {
    if (data.added) {
      for (const { identifier, metadata } of data.added) {
        this._allLanguageModelData.set(identifier, {
          metadata,
          apiObjects: new ExtensionIdentifierMap()
        });
      }
    }
    if (data.removed) {
      for (const id of data.removed) {
        this._allLanguageModelData.delete(id);
        for (const [key, value] of this._pendingRequest) {
          if (value.languageModelId === id) {
            value.res.reject(new CancellationError());
            this._pendingRequest.delete(key);
          }
        }
      }
    }
    data.added?.forEach((added) => this._fakeAuthPopulate(added.metadata));
    this._onDidChangeProviders.fire(void 0);
  }
  async selectLanguageModels(extension, selector) {
    const models = await this._proxy.$selectChatModels({
      ...selector,
      extension: extension.identifier
    });
    const result = [];
    const that = this;
    for (const identifier of models) {
      const data = this._allLanguageModelData.get(identifier);
      if (!data) {
        continue;
      }
      if (this._isUsingAuth(extension.identifier, data.metadata)) {
        await this._fakeAuthPopulate(data.metadata);
      }
      let apiObject = data.apiObjects.get(extension.identifier);
      if (!apiObject) {
        apiObject = {
          id: identifier,
          vendor: data.metadata.vendor,
          family: data.metadata.family,
          version: data.metadata.version,
          name: data.metadata.name,
          maxInputTokens: data.metadata.maxInputTokens,
          countTokens(text, token) {
            if (!that._allLanguageModelData.has(identifier)) {
              throw extHostTypes.LanguageModelError.NotFound(
                identifier
              );
            }
            return that._computeTokenLength(
              identifier,
              text,
              token ?? CancellationToken.None
            );
          },
          sendRequest(messages, options, token) {
            if (!that._allLanguageModelData.has(identifier)) {
              throw extHostTypes.LanguageModelError.NotFound(
                identifier
              );
            }
            return that._sendChatRequest(
              extension,
              identifier,
              messages,
              options ?? {},
              token ?? CancellationToken.None
            );
          }
        };
        Object.freeze(apiObject);
        data.apiObjects.set(extension.identifier, apiObject);
      }
      result.push(apiObject);
    }
    return result;
  }
  async _sendChatRequest(extension, languageModelId, messages, options, token) {
    const internalMessages = this._convertMessages(
      extension,
      messages
    );
    const from = extension.identifier;
    const metadata = this._allLanguageModelData.get(languageModelId)?.metadata;
    if (!metadata || !this._allLanguageModelData.has(languageModelId)) {
      throw extHostTypes.LanguageModelError.NotFound(
        `Language model '${languageModelId}' is unknown.`
      );
    }
    if (this._isUsingAuth(from, metadata)) {
      const success = await this._getAuthAccess(
        extension,
        {
          identifier: metadata.extension,
          displayName: metadata.auth.providerLabel
        },
        options.justification,
        false
      );
      if (!success || !this._modelAccessList.get(from)?.has(metadata.extension)) {
        throw extHostTypes.LanguageModelError.NoPermissions(
          `Language model '${languageModelId}' cannot be used by '${from.value}'.`
        );
      }
    }
    try {
      const requestId = Math.random() * 1e6 | 0;
      const res = new LanguageModelResponse();
      this._pendingRequest.set(requestId, { languageModelId, res });
      try {
        await this._proxy.$tryStartChatRequest(
          from,
          languageModelId,
          requestId,
          internalMessages,
          options,
          token
        );
      } catch (error) {
        this._pendingRequest.delete(requestId);
        throw error;
      }
      return res.apiObject;
    } catch (error) {
      if (error.name === extHostTypes.LanguageModelError.name) {
        throw error;
      }
      throw new extHostTypes.LanguageModelError(
        `Language model '${languageModelId}' errored: ${toErrorMessage(error)}`,
        "Unknown",
        error
      );
    }
  }
  _convertMessages(extension, messages) {
    const internalMessages = [];
    for (const message of messages) {
      if (message.role === extHostTypes.LanguageModelChatMessageRole.System) {
        checkProposedApiEnabled(extension, "languageModelSystem");
      }
      if (message.content2.some(
        (part) => part instanceof extHostTypes.LanguageModelToolResultPart
      )) {
        checkProposedApiEnabled(extension, "lmTools");
      }
      internalMessages.push(
        typeConvert.LanguageModelChatMessage.from(message)
      );
    }
    return internalMessages;
  }
  async $acceptResponsePart(requestId, chunk) {
    const data = this._pendingRequest.get(requestId);
    if (data) {
      data.res.handleFragment(chunk);
    }
  }
  async $acceptResponseDone(requestId, error) {
    const data = this._pendingRequest.get(requestId);
    if (!data) {
      return;
    }
    this._pendingRequest.delete(requestId);
    if (error) {
      data.res.reject(transformErrorFromSerialization(error));
    } else {
      data.res.resolve();
    }
  }
  // BIG HACK: Using AuthenticationProviders to check access to Language Models
  async _getAuthAccess(from, to, justification, silent) {
    const providerId = INTERNAL_AUTH_PROVIDER_PREFIX + to.identifier.value;
    const session = await this._extHostAuthentication.getSession(
      from,
      providerId,
      [],
      { silent: true }
    );
    if (session) {
      this.$updateModelAccesslist([
        { from: from.identifier, to: to.identifier, enabled: true }
      ]);
      return true;
    }
    if (silent) {
      return false;
    }
    try {
      const detail = justification ? localize(
        "chatAccessWithJustification",
        "Justification: {1}",
        to.displayName,
        justification
      ) : void 0;
      await this._extHostAuthentication.getSession(from, providerId, [], {
        forceNewSession: { detail }
      });
      this.$updateModelAccesslist([
        { from: from.identifier, to: to.identifier, enabled: true }
      ]);
      return true;
    } catch (err) {
      return false;
    }
  }
  _isUsingAuth(from, toMetadata) {
    return !!toMetadata.auth && // And we're asking from a different extension
    !ExtensionIdentifier.equals(toMetadata.extension, from);
  }
  async _fakeAuthPopulate(metadata) {
    if (!metadata.auth) {
      return;
    }
    for (const from of this._languageAccessInformationExtensions) {
      try {
        await this._getAuthAccess(
          from,
          { identifier: metadata.extension, displayName: "" },
          void 0,
          true
        );
      } catch (err) {
        this._logService.error("Fake Auth request failed");
        this._logService.error(err);
      }
    }
  }
  async _computeTokenLength(languageModelId, value, token) {
    const data = this._allLanguageModelData.get(languageModelId);
    if (!data) {
      throw extHostTypes.LanguageModelError.NotFound(
        `Language model '${languageModelId}' is unknown.`
      );
    }
    const local = Iterable.find(
      this._languageModels.values(),
      (candidate) => candidate.languageModelId === languageModelId
    );
    if (local) {
      return local.provider.provideTokenCount(value, token);
    }
    return this._proxy.$countTokens(
      languageModelId,
      typeof value === "string" ? value : typeConvert.LanguageModelChatMessage.from(value),
      token
    );
  }
  $updateModelAccesslist(data) {
    const updated = new Array();
    for (const { from, to, enabled } of data) {
      const set = this._modelAccessList.get(from) ?? new ExtensionIdentifierSet();
      const oldValue = set.has(to);
      if (oldValue !== enabled) {
        if (enabled) {
          set.add(to);
        } else {
          set.delete(to);
        }
        this._modelAccessList.set(from, set);
        const newItem = { from, to };
        updated.push(newItem);
        this._onDidChangeModelAccess.fire(newItem);
      }
    }
  }
  _languageAccessInformationExtensions = /* @__PURE__ */ new Set();
  createLanguageModelAccessInformation(from) {
    this._languageAccessInformationExtensions.add(from);
    const that = this;
    const _onDidChangeAccess = Event.signal(
      Event.filter(
        this._onDidChangeModelAccess.event,
        (e) => ExtensionIdentifier.equals(e.from, from.identifier)
      )
    );
    const _onDidAddRemove = Event.signal(this._onDidChangeProviders.event);
    return {
      get onDidChange() {
        return Event.any(_onDidChangeAccess, _onDidAddRemove);
      },
      canSendRequest(chat) {
        let metadata;
        out: for (const [_, value] of that._allLanguageModelData) {
          for (const candidate of value.apiObjects.values()) {
            if (candidate === chat) {
              metadata = value.metadata;
              break out;
            }
          }
        }
        if (!metadata) {
          return void 0;
        }
        if (!that._isUsingAuth(from.identifier, metadata)) {
          return true;
        }
        const list = that._modelAccessList.get(from.identifier);
        if (!list) {
          return void 0;
        }
        return list.has(metadata.extension);
      }
    };
  }
};
ExtHostLanguageModels = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IExtHostAuthentication)
], ExtHostLanguageModels);
export {
  ExtHostLanguageModels,
  IExtHostLanguageModels
};
//# sourceMappingURL=extHostLanguageModels.js.map
