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
import { hash } from "../../../../base/common/hash.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import * as marked from "../../../../base/common/marked/marked.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { annotateVulnerabilitiesInText } from "./annotations.js";
import {
  IChatAgentNameService,
  getFullyQualifiedId
} from "./chatAgents.js";
import {
  ChatModelInitState
} from "./chatModel.js";
import { countWords } from "./chatWordCounter.js";
function isRequestVM(item) {
  return !!item && typeof item === "object" && "message" in item;
}
function isResponseVM(item) {
  return !!item && typeof item.setVote !== "undefined";
}
function isWelcomeVM(item) {
  return !!item && typeof item === "object" && "content" in item;
}
let ChatViewModel = class extends Disposable {
  constructor(_model, codeBlockModelCollection, instantiationService) {
    super();
    this._model = _model;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.instantiationService = instantiationService;
    _model.getRequests().forEach((request, i) => {
      const requestModel = this.instantiationService.createInstance(ChatRequestViewModel, request);
      this._items.push(requestModel);
      this.updateCodeBlockTextModels(requestModel);
      if (request.response) {
        this.onAddResponse(request.response);
      }
    });
    this._register(_model.onDidDispose(() => this._onDidDisposeModel.fire()));
    this._register(_model.onDidChange((e) => {
      if (e.kind === "addRequest") {
        const requestModel = this.instantiationService.createInstance(ChatRequestViewModel, e.request);
        this._items.push(requestModel);
        this.updateCodeBlockTextModels(requestModel);
        if (e.request.response) {
          this.onAddResponse(e.request.response);
        }
      } else if (e.kind === "addResponse") {
        this.onAddResponse(e.response);
      } else if (e.kind === "removeRequest") {
        const requestIdx = this._items.findIndex((item) => isRequestVM(item) && item.id === e.requestId);
        if (requestIdx >= 0) {
          this._items.splice(requestIdx, 1);
        }
        const responseIdx = e.responseId && this._items.findIndex((item) => isResponseVM(item) && item.id === e.responseId);
        if (typeof responseIdx === "number" && responseIdx >= 0) {
          const items = this._items.splice(responseIdx, 1);
          const item = items[0];
          if (item instanceof ChatResponseViewModel) {
            item.dispose();
          }
        }
      }
      const modelEventToVmEvent = e.kind === "addRequest" ? { kind: "addRequest" } : e.kind === "initialize" ? { kind: "initialize" } : null;
      this._onDidChange.fire(modelEventToVmEvent);
    }));
  }
  _onDidDisposeModel = this._register(new Emitter());
  onDidDisposeModel = this._onDidDisposeModel.event;
  _onDidChange = this._register(
    new Emitter()
  );
  onDidChange = this._onDidChange.event;
  _items = [];
  _inputPlaceholder = void 0;
  get inputPlaceholder() {
    return this._inputPlaceholder;
  }
  get model() {
    return this._model;
  }
  setInputPlaceholder(text) {
    this._inputPlaceholder = text;
    this._onDidChange.fire({ kind: "changePlaceholder" });
  }
  resetInputPlaceholder() {
    this._inputPlaceholder = void 0;
    this._onDidChange.fire({ kind: "changePlaceholder" });
  }
  get sessionId() {
    return this._model.sessionId;
  }
  get requestInProgress() {
    return this._model.requestInProgress;
  }
  get initState() {
    return this._model.initState;
  }
  onAddResponse(responseModel) {
    const response = this.instantiationService.createInstance(
      ChatResponseViewModel,
      responseModel
    );
    this._register(
      response.onDidChange(() => {
        if (response.isComplete) {
          this.updateCodeBlockTextModels(response);
        }
        return this._onDidChange.fire(null);
      })
    );
    this._items.push(response);
    this.updateCodeBlockTextModels(response);
  }
  getItems() {
    return [
      ...this._model.welcomeMessage ? [this._model.welcomeMessage] : [],
      ...this._items
    ];
  }
  dispose() {
    super.dispose();
    this._items.filter(
      (item) => item instanceof ChatResponseViewModel
    ).forEach((item) => item.dispose());
  }
  updateCodeBlockTextModels(model) {
    let content;
    if (isRequestVM(model)) {
      content = model.messageText;
    } else {
      content = annotateVulnerabilitiesInText(model.response.value).map((x) => x.content.value).join("");
    }
    let codeBlockIndex = 0;
    marked.walkTokens(marked.lexer(content), (token) => {
      if (token.type === "code") {
        const lang = token.lang || "";
        const text = token.text;
        this.codeBlockModelCollection.update(
          this._model.sessionId,
          model,
          codeBlockIndex++,
          { text, languageId: lang }
        );
      }
    });
  }
};
ChatViewModel = __decorateClass([
  __decorateParam(2, IInstantiationService)
], ChatViewModel);
class ChatRequestViewModel {
  constructor(_model) {
    this._model = _model;
  }
  get id() {
    return this._model.id;
  }
  get dataId() {
    return this.id + `_${ChatModelInitState[this._model.session.initState]}_${hash(this.variables)}`;
  }
  get sessionId() {
    return this._model.session.sessionId;
  }
  get username() {
    return this._model.username;
  }
  get avatarIcon() {
    return this._model.avatarIconUri;
  }
  get message() {
    return this._model.message;
  }
  get messageText() {
    return this.message.text;
  }
  get attempt() {
    return this._model.attempt;
  }
  get variables() {
    return this._model.variableData.variables;
  }
  get contentReferences() {
    return this._model.response?.contentReferences;
  }
  get confirmation() {
    return this._model.confirmation;
  }
  currentRenderedHeight;
}
let ChatResponseViewModel = class extends Disposable {
  constructor(_model, logService, chatAgentNameService) {
    super();
    this._model = _model;
    this.logService = logService;
    this.chatAgentNameService = chatAgentNameService;
    if (!_model.isComplete) {
      this._contentUpdateTimings = {
        firstWordTime: 0,
        lastUpdateTime: Date.now(),
        impliedWordLoadRate: 0,
        lastWordCount: 0
      };
    }
    this._register(_model.onDidChange(() => {
      if (this._contentUpdateTimings) {
        const now = Date.now();
        const wordCount = countWords(_model.response.toString());
        const timeDiff = Math.max(now - this._contentUpdateTimings.firstWordTime, 250);
        const impliedWordLoadRate = this._contentUpdateTimings.lastWordCount / (timeDiff / 1e3);
        this.trace("onDidChange", `Update- got ${this._contentUpdateTimings.lastWordCount} words over last ${timeDiff}ms = ${impliedWordLoadRate} words/s. ${wordCount} words are now available.`);
        this._contentUpdateTimings = {
          firstWordTime: this._contentUpdateTimings.firstWordTime === 0 && this.response.value.some((v) => v.kind === "markdownContent") ? now : this._contentUpdateTimings.firstWordTime,
          lastUpdateTime: now,
          impliedWordLoadRate,
          lastWordCount: wordCount
        };
      } else {
        this.logService.warn("ChatResponseViewModel#onDidChange: got model update but contentUpdateTimings is not initialized");
      }
      this._modelChangeCount++;
      this._onDidChange.fire();
    }));
  }
  _modelChangeCount = 0;
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  get model() {
    return this._model;
  }
  get id() {
    return this._model.id;
  }
  get dataId() {
    return this._model.id + `_${this._modelChangeCount}_${ChatModelInitState[this._model.session.initState]}`;
  }
  get sessionId() {
    return this._model.session.sessionId;
  }
  get username() {
    if (this.agent) {
      const isAllowed = this.chatAgentNameService.getAgentNameRestriction(
        this.agent
      );
      if (isAllowed) {
        return this.agent.fullName || this.agent.name;
      } else {
        return getFullyQualifiedId(this.agent);
      }
    }
    return this._model.username;
  }
  get avatarIcon() {
    return this._model.avatarIcon;
  }
  get agent() {
    return this._model.agent;
  }
  get slashCommand() {
    return this._model.slashCommand;
  }
  get agentOrSlashCommandDetected() {
    return this._model.agentOrSlashCommandDetected;
  }
  get response() {
    return this._model.response;
  }
  get usedContext() {
    return this._model.usedContext;
  }
  get contentReferences() {
    return this._model.contentReferences;
  }
  get codeCitations() {
    return this._model.codeCitations;
  }
  get progressMessages() {
    return this._model.progressMessages;
  }
  get isComplete() {
    return this._model.isComplete;
  }
  get isCanceled() {
    return this._model.isCanceled;
  }
  get replyFollowups() {
    return this._model.followups?.filter(
      (f) => f.kind === "reply"
    );
  }
  get result() {
    return this._model.result;
  }
  get errorDetails() {
    return this.result?.errorDetails;
  }
  get vote() {
    return this._model.vote;
  }
  get voteDownReason() {
    return this._model.voteDownReason;
  }
  get requestId() {
    return this._model.requestId;
  }
  get isStale() {
    return this._model.isStale;
  }
  renderData = void 0;
  currentRenderedHeight;
  _usedReferencesExpanded;
  get usedReferencesExpanded() {
    if (typeof this._usedReferencesExpanded === "boolean") {
      return this._usedReferencesExpanded;
    }
    return this.response.value.length === 0;
  }
  set usedReferencesExpanded(v) {
    this._usedReferencesExpanded = v;
  }
  _vulnerabilitiesListExpanded = false;
  get vulnerabilitiesListExpanded() {
    return this._vulnerabilitiesListExpanded;
  }
  set vulnerabilitiesListExpanded(v) {
    this._vulnerabilitiesListExpanded = v;
  }
  _contentUpdateTimings = void 0;
  get contentUpdateTimings() {
    return this._contentUpdateTimings;
  }
  trace(tag, message) {
    this.logService.trace(`ChatResponseViewModel#${tag}: ${message}`);
  }
  setVote(vote) {
    this._modelChangeCount++;
    this._model.setVote(vote);
  }
  setVoteDownReason(reason) {
    this._modelChangeCount++;
    this._model.setVoteDownReason(reason);
  }
  setEditApplied(edit, editCount) {
    this._modelChangeCount++;
    this._model.setEditApplied(edit, editCount);
  }
};
ChatResponseViewModel = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IChatAgentNameService)
], ChatResponseViewModel);
export {
  ChatRequestViewModel,
  ChatResponseViewModel,
  ChatViewModel,
  isRequestVM,
  isResponseVM,
  isWelcomeVM
};
