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
import { findLast } from "../../../../base/common/arraysFind.js";
import { timeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import {
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { revive } from "../../../../base/common/marshalling.js";
import {
  observableValue
} from "../../../../base/common/observable.js";
import { equalsIgnoreCase } from "../../../../base/common/strings.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IRequestService,
  asJson
} from "../../../../platform/request/common/request.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import {
  CONTEXT_CHAT_ENABLED,
  CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED
} from "./chatContextKeys.js";
var ChatAgentLocation = /* @__PURE__ */ ((ChatAgentLocation2) => {
  ChatAgentLocation2["Panel"] = "panel";
  ChatAgentLocation2["Terminal"] = "terminal";
  ChatAgentLocation2["Notebook"] = "notebook";
  ChatAgentLocation2["Editor"] = "editor";
  return ChatAgentLocation2;
})(ChatAgentLocation || {});
((ChatAgentLocation2) => {
  function fromRaw(value) {
    switch (value) {
      case "panel":
        return "panel" /* Panel */;
      case "terminal":
        return "terminal" /* Terminal */;
      case "notebook":
        return "notebook" /* Notebook */;
      case "editor":
        return "editor" /* Editor */;
    }
    return "panel" /* Panel */;
  }
  ChatAgentLocation2.fromRaw = fromRaw;
  __name(fromRaw, "fromRaw");
})(ChatAgentLocation || (ChatAgentLocation = {}));
const IChatAgentService = createDecorator("chatAgentService");
let ChatAgentService = class {
  constructor(contextKeyService) {
    this.contextKeyService = contextKeyService;
    this._hasDefaultAgent = CONTEXT_CHAT_ENABLED.bindTo(
      this.contextKeyService
    );
    this._defaultAgentRegistered = CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED.bindTo(
      this.contextKeyService
    );
  }
  static {
    __name(this, "ChatAgentService");
  }
  static AGENT_LEADER = "@";
  _agents = /* @__PURE__ */ new Map();
  _onDidChangeAgents = new Emitter();
  onDidChangeAgents = this._onDidChangeAgents.event;
  _hasDefaultAgent;
  _defaultAgentRegistered;
  registerAgent(id, data) {
    const existingAgent = this.getAgent(id);
    if (existingAgent) {
      throw new Error(`Agent already registered: ${JSON.stringify(id)}`);
    }
    if (data.isDefault) {
      this._defaultAgentRegistered.set(true);
    }
    const that = this;
    const commands = data.slashCommands;
    data = {
      ...data,
      get slashCommands() {
        return commands.filter(
          (c) => !c.when || that.contextKeyService.contextMatchesRules(
            ContextKeyExpr.deserialize(c.when)
          )
        );
      }
    };
    const entry = { data };
    this._agents.set(id, entry);
    this._onDidChangeAgents.fire(void 0);
    return toDisposable(() => {
      this._agents.delete(id);
      if (data.isDefault) {
        this._defaultAgentRegistered.set(false);
      }
      this._onDidChangeAgents.fire(void 0);
    });
  }
  registerAgentImplementation(id, agentImpl) {
    const entry = this._agents.get(id);
    if (!entry) {
      throw new Error(`Unknown agent: ${JSON.stringify(id)}`);
    }
    if (entry.impl) {
      throw new Error(
        `Agent already has implementation: ${JSON.stringify(id)}`
      );
    }
    if (entry.data.isDefault) {
      this._hasDefaultAgent.set(true);
    }
    entry.impl = agentImpl;
    this._onDidChangeAgents.fire(
      new MergedChatAgent(entry.data, agentImpl)
    );
    return toDisposable(() => {
      entry.impl = void 0;
      this._onDidChangeAgents.fire(void 0);
      if (entry.data.isDefault) {
        this._hasDefaultAgent.set(false);
      }
    });
  }
  registerDynamicAgent(data, agentImpl) {
    data.isDynamic = true;
    const agent = { data, impl: agentImpl };
    this._agents.set(data.id, agent);
    this._onDidChangeAgents.fire(new MergedChatAgent(data, agentImpl));
    return toDisposable(() => {
      this._agents.delete(data.id);
      this._onDidChangeAgents.fire(void 0);
    });
  }
  _agentCompletionProviders = /* @__PURE__ */ new Map();
  registerAgentCompletionProvider(id, provider) {
    this._agentCompletionProviders.set(id, provider);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._agentCompletionProviders.delete(id);
      }, "dispose")
    };
  }
  async getAgentCompletionItems(id, query, token) {
    return await this._agentCompletionProviders.get(id)?.(query, token) ?? [];
  }
  updateAgent(id, updateMetadata) {
    const agent = this._agents.get(id);
    if (!agent?.impl) {
      throw new Error(
        `No activated agent with id ${JSON.stringify(id)} registered`
      );
    }
    agent.data.metadata = { ...agent.data.metadata, ...updateMetadata };
    this._onDidChangeAgents.fire(
      new MergedChatAgent(agent.data, agent.impl)
    );
  }
  getDefaultAgent(location) {
    return findLast(
      this.getActivatedAgents(),
      (a) => !!a.isDefault && a.locations.includes(location)
    );
  }
  getContributedDefaultAgent(location) {
    return this.getAgents().find(
      (a) => !!a.isDefault && a.locations.includes(location)
    );
  }
  getSecondaryAgent() {
    return Iterable.find(
      this._agents.values(),
      (a) => !!a.data.metadata.isSecondary
    )?.data;
  }
  getAgent(id) {
    if (!this._agentIsEnabled(id)) {
      return;
    }
    return this._agents.get(id)?.data;
  }
  _agentIsEnabled(id) {
    const entry = this._agents.get(id);
    return !entry?.data.when || this.contextKeyService.contextMatchesRules(
      ContextKeyExpr.deserialize(entry.data.when)
    );
  }
  getAgentByFullyQualifiedId(id) {
    const agent = Iterable.find(
      this._agents.values(),
      (a) => getFullyQualifiedId(a.data) === id
    )?.data;
    if (agent && !this._agentIsEnabled(agent.id)) {
      return;
    }
    return agent;
  }
  /**
   * Returns all agent datas that exist- static registered and dynamic ones.
   */
  getAgents() {
    return Array.from(this._agents.values()).map((entry) => entry.data).filter((a) => this._agentIsEnabled(a.id));
  }
  getActivatedAgents() {
    return Array.from(this._agents.values()).filter((a) => !!a.impl).filter((a) => this._agentIsEnabled(a.data.id)).map((a) => new MergedChatAgent(a.data, a.impl));
  }
  getAgentsByName(name) {
    return this.getAgents().filter((a) => a.name === name);
  }
  agentHasDupeName(id) {
    const agent = this.getAgent(id);
    if (!agent) {
      return false;
    }
    return this.getAgentsByName(agent.name).filter(
      (a) => a.extensionId.value !== agent.extensionId.value
    ).length > 0;
  }
  async invokeAgent(id, request, progress, history, token) {
    const data = this._agents.get(id);
    if (!data?.impl) {
      throw new Error(`No activated agent with id "${id}"`);
    }
    return await data.impl.invoke(request, progress, history, token);
  }
  async getFollowups(id, request, result, history, token) {
    const data = this._agents.get(id);
    if (!data?.impl) {
      throw new Error(`No activated agent with id "${id}"`);
    }
    if (!data.impl?.provideFollowups) {
      return [];
    }
    return data.impl.provideFollowups(request, result, history, token);
  }
  async getChatTitle(id, history, token) {
    const data = this._agents.get(id);
    if (!data?.impl) {
      throw new Error(`No activated agent with id "${id}"`);
    }
    if (!data.impl?.provideChatTitle) {
      return void 0;
    }
    return data.impl.provideChatTitle(history, token);
  }
  _chatParticipantDetectionProviders = /* @__PURE__ */ new Map();
  registerChatParticipantDetectionProvider(handle, provider) {
    this._chatParticipantDetectionProviders.set(handle, provider);
    return toDisposable(() => {
      this._chatParticipantDetectionProviders.delete(handle);
    });
  }
  hasChatParticipantDetectionProviders() {
    return this._chatParticipantDetectionProviders.size > 0;
  }
  async detectAgentOrCommand(request, history, options, token) {
    const provider = Iterable.first(
      this._chatParticipantDetectionProviders.values()
    );
    if (!provider) {
      return;
    }
    const participants = this.getAgents().reduce((acc, a) => {
      acc.push({
        participant: a.id,
        disambiguation: a.disambiguation ?? []
      });
      for (const command2 of a.slashCommands) {
        acc.push({
          participant: a.id,
          command: command2.name,
          disambiguation: command2.disambiguation ?? []
        });
      }
      return acc;
    }, []);
    const result = await provider.provideParticipantDetection(
      request,
      history,
      { ...options, participants },
      token
    );
    if (!result) {
      return;
    }
    const agent = this.getAgent(result.participant);
    if (!agent) {
      return;
    }
    if (!result.command) {
      return { agent };
    }
    const command = agent?.slashCommands.find(
      (c) => c.name === result.command
    );
    if (!command) {
      return;
    }
    return { agent, command };
  }
};
ChatAgentService = __decorateClass([
  __decorateParam(0, IContextKeyService)
], ChatAgentService);
class MergedChatAgent {
  constructor(data, impl) {
    this.data = data;
    this.impl = impl;
  }
  static {
    __name(this, "MergedChatAgent");
  }
  when;
  publisherDisplayName;
  isDynamic;
  get id() {
    return this.data.id;
  }
  get name() {
    return this.data.name ?? "";
  }
  get fullName() {
    return this.data.fullName ?? "";
  }
  get description() {
    return this.data.description ?? "";
  }
  get extensionId() {
    return this.data.extensionId;
  }
  get extensionPublisherId() {
    return this.data.extensionPublisherId;
  }
  get extensionPublisherDisplayName() {
    return this.data.publisherDisplayName;
  }
  get extensionDisplayName() {
    return this.data.extensionDisplayName;
  }
  get isDefault() {
    return this.data.isDefault;
  }
  get metadata() {
    return this.data.metadata;
  }
  get slashCommands() {
    return this.data.slashCommands;
  }
  get locations() {
    return this.data.locations;
  }
  get disambiguation() {
    return this.data.disambiguation;
  }
  async invoke(request, progress, history, token) {
    return this.impl.invoke(request, progress, history, token);
  }
  async provideFollowups(request, result, history, token) {
    if (this.impl.provideFollowups) {
      return this.impl.provideFollowups(request, result, history, token);
    }
    return [];
  }
  provideWelcomeMessage(location, token) {
    if (this.impl.provideWelcomeMessage) {
      return this.impl.provideWelcomeMessage(location, token);
    }
    return void 0;
  }
  provideSampleQuestions(location, token) {
    if (this.impl.provideSampleQuestions) {
      return this.impl.provideSampleQuestions(location, token);
    }
    return void 0;
  }
  toJSON() {
    return this.data;
  }
}
const IChatAgentNameService = createDecorator(
  "chatAgentNameService"
);
let ChatAgentNameService = class {
  constructor(productService, requestService, logService, storageService) {
    this.requestService = requestService;
    this.logService = logService;
    this.storageService = storageService;
    if (!productService.chatParticipantRegistry) {
      return;
    }
    this.url = productService.chatParticipantRegistry;
    const raw = storageService.get(
      ChatAgentNameService.StorageKey,
      StorageScope.APPLICATION
    );
    try {
      this.registry.set(JSON.parse(raw ?? "{}"), void 0);
    } catch (err) {
      storageService.remove(
        ChatAgentNameService.StorageKey,
        StorageScope.APPLICATION
      );
    }
    this.refresh();
  }
  static {
    __name(this, "ChatAgentNameService");
  }
  static StorageKey = "chat.participantNameRegistry";
  url;
  registry = observableValue(
    this,
    /* @__PURE__ */ Object.create(null)
  );
  disposed = false;
  refresh() {
    if (this.disposed) {
      return;
    }
    this.update().catch(
      (err) => this.logService.warn(
        "Failed to fetch chat participant registry",
        err
      )
    ).then(() => timeout(5 * 60 * 1e3)).then(() => this.refresh());
  }
  async update() {
    const context = await this.requestService.request(
      { type: "GET", url: this.url },
      CancellationToken.None
    );
    if (context.res.statusCode !== 200) {
      throw new Error("Could not get extensions report.");
    }
    const result = await asJson(context);
    if (!result || result.version !== 1) {
      throw new Error("Unexpected chat participant registry response.");
    }
    const registry = result.restrictedChatParticipants;
    this.registry.set(registry, void 0);
    this.storageService.store(
      ChatAgentNameService.StorageKey,
      JSON.stringify(registry),
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
  }
  /**
   * Returns true if the agent is allowed to use this name
   */
  getAgentNameRestriction(chatAgentData) {
    const nameAllowed = this.checkAgentNameRestriction(
      chatAgentData.name,
      chatAgentData
    ).get();
    const fullNameAllowed = !chatAgentData.fullName || this.checkAgentNameRestriction(
      chatAgentData.fullName.replace(/\s/g, ""),
      chatAgentData
    ).get();
    return nameAllowed && fullNameAllowed;
  }
  checkAgentNameRestriction(name, chatAgentData) {
    const allowList = this.registry.map(
      (registry) => registry[name.toLowerCase()]
    );
    return allowList.map((allowList2) => {
      if (!allowList2) {
        return true;
      }
      return allowList2.some(
        (id) => equalsIgnoreCase(
          id,
          id.includes(".") ? chatAgentData.extensionId.value : chatAgentData.extensionPublisherId
        )
      );
    });
  }
  dispose() {
    this.disposed = true;
  }
};
ChatAgentNameService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IStorageService)
], ChatAgentNameService);
function getFullyQualifiedId(chatAgentData) {
  return `${chatAgentData.extensionId.value}.${chatAgentData.id}`;
}
__name(getFullyQualifiedId, "getFullyQualifiedId");
function reviveSerializedAgent(raw) {
  const agent = "name" in raw ? raw : {
    ...raw,
    name: raw.id
  };
  if (!("extensionPublisherId" in agent)) {
    agent.extensionPublisherId = agent.extensionPublisher ?? "";
  }
  if (!("extensionDisplayName" in agent)) {
    agent.extensionDisplayName = "";
  }
  if (!("extensionId" in agent)) {
    agent.extensionId = new ExtensionIdentifier("");
  }
  return revive(agent);
}
__name(reviveSerializedAgent, "reviveSerializedAgent");
export {
  ChatAgentLocation,
  ChatAgentNameService,
  ChatAgentService,
  IChatAgentNameService,
  IChatAgentService,
  MergedChatAgent,
  getFullyQualifiedId,
  reviveSerializedAgent
};
//# sourceMappingURL=chatAgents.js.map
