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
import { asArray } from "../../../../base/common/arrays.js";
import { DeferredPromise } from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IMarkdownString, MarkdownString, isMarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { revive } from "../../../../base/common/marshalling.js";
import { equals } from "../../../../base/common/objects.js";
import { basename, isEqual } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI, UriComponents, UriDto, isUriComponents } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IOffsetRange, OffsetRange } from "../../../../editor/common/core/offsetRange.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { TextEdit } from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ChatAgentLocation, IChatAgentCommand, IChatAgentData, IChatAgentResult, IChatAgentService, reviveSerializedAgent } from "./chatAgents.js";
import { ChatRequestTextPart, IParsedChatRequest, reviveParsedChatRequest } from "./chatParserTypes.js";
import { ChatAgentVoteDirection, ChatAgentVoteDownReason, IChatAgentMarkdownContentWithVulnerability, IChatCodeCitation, IChatCommandButton, IChatConfirmation, IChatContentInlineReference, IChatContentReference, IChatFollowup, IChatLocationData, IChatMarkdownContent, IChatProgress, IChatProgressMessage, IChatResponseCodeblockUriPart, IChatResponseProgressFileTreeData, IChatTask, IChatTextEdit, IChatTreeData, IChatUsedContext, IChatWarningMessage, isIUsedContext } from "./chatService.js";
import { IChatRequestVariableValue } from "./chatVariables.js";
class ChatRequestModel {
  constructor(_session, message, _variableData, _attempt = 0, _confirmation, _locationData, _attachedContext) {
    this._session = _session;
    this.message = message;
    this._variableData = _variableData;
    this._attempt = _attempt;
    this._confirmation = _confirmation;
    this._locationData = _locationData;
    this._attachedContext = _attachedContext;
    this.id = "request_" + ChatRequestModel.nextId++;
  }
  static {
    __name(this, "ChatRequestModel");
  }
  static nextId = 0;
  response;
  id;
  get session() {
    return this._session;
  }
  get username() {
    return this.session.requesterUsername;
  }
  get avatarIconUri() {
    return this.session.requesterAvatarIconUri;
  }
  get attempt() {
    return this._attempt;
  }
  get variableData() {
    return this._variableData;
  }
  set variableData(v) {
    this._variableData = v;
  }
  get confirmation() {
    return this._confirmation;
  }
  get locationData() {
    return this._locationData;
  }
  get attachedContext() {
    return this._attachedContext;
  }
  adoptTo(session) {
    this._session = session;
  }
}
class Response extends Disposable {
  static {
    __name(this, "Response");
  }
  _onDidChangeValue = this._register(new Emitter());
  get onDidChangeValue() {
    return this._onDidChangeValue.event;
  }
  _responseParts;
  /**
   * A stringified representation of response data which might be presented to a screenreader or used when copying a response.
   */
  _responseRepr = "";
  /**
   * Just the markdown content of the response, used for determining the rendering rate of markdown
   */
  _markdownContent = "";
  _citations = [];
  get value() {
    return this._responseParts;
  }
  constructor(value) {
    super();
    this._responseParts = asArray(value).map((v) => isMarkdownString(v) ? { content: v, kind: "markdownContent" } : "kind" in v ? v : { kind: "treeData", treeData: v });
    this._updateRepr(true);
  }
  toString() {
    return this._responseRepr;
  }
  toMarkdown() {
    return this._markdownContent;
  }
  clear() {
    this._responseParts = [];
    this._updateRepr(true);
  }
  updateContent(progress, quiet) {
    if (progress.kind === "markdownContent") {
      const responsePartLength = this._responseParts.length - 1;
      const lastResponsePart = this._responseParts[responsePartLength];
      if (!lastResponsePart || lastResponsePart.kind !== "markdownContent" || !canMergeMarkdownStrings(lastResponsePart.content, progress.content)) {
        this._responseParts.push(progress);
      } else {
        lastResponsePart.content = appendMarkdownString(lastResponsePart.content, progress.content);
      }
      this._updateRepr(quiet);
    } else if (progress.kind === "textEdit") {
      if (progress.edits.length > 0) {
        let found = false;
        for (let i = 0; !found && i < this._responseParts.length; i++) {
          const candidate = this._responseParts[i];
          if (candidate.kind === "textEditGroup" && isEqual(candidate.uri, progress.uri)) {
            candidate.edits.push(progress.edits);
            found = true;
          }
        }
        if (!found) {
          this._responseParts.push({
            kind: "textEditGroup",
            uri: progress.uri,
            edits: [progress.edits]
          });
        }
        this._updateRepr(quiet);
      }
    } else if (progress.kind === "progressTask") {
      const responsePosition = this._responseParts.push(progress) - 1;
      this._updateRepr(quiet);
      const disp = progress.onDidAddProgress(() => {
        this._updateRepr(false);
      });
      progress.task?.().then((content) => {
        disp.dispose();
        if (typeof content === "string") {
          this._responseParts[responsePosition].content = new MarkdownString(content);
        }
        this._updateRepr(false);
      });
    } else {
      this._responseParts.push(progress);
      this._updateRepr(quiet);
    }
  }
  addCitation(citation) {
    this._citations.push(citation);
    this._updateRepr();
  }
  _updateRepr(quiet) {
    const inlineRefToRepr = /* @__PURE__ */ __name((part) => "uri" in part.inlineReference ? basename(part.inlineReference.uri) : "name" in part.inlineReference ? part.inlineReference.name : basename(part.inlineReference), "inlineRefToRepr");
    this._responseRepr = this._responseParts.map((part) => {
      if (part.kind === "treeData") {
        return "";
      } else if (part.kind === "inlineReference") {
        return inlineRefToRepr(part);
      } else if (part.kind === "command") {
        return part.command.title;
      } else if (part.kind === "textEditGroup") {
        return localize("editsSummary", "Made changes.");
      } else if (part.kind === "progressMessage" || part.kind === "codeblockUri") {
        return "";
      } else if (part.kind === "confirmation") {
        return `${part.title}
${part.message}`;
      } else {
        return part.content.value;
      }
    }).filter((s) => s.length > 0).join("\n\n");
    this._responseRepr += this._citations.length ? "\n\n" + getCodeCitationsMessage(this._citations) : "";
    this._markdownContent = this._responseParts.map((part) => {
      if (part.kind === "inlineReference") {
        return inlineRefToRepr(part);
      } else if (part.kind === "markdownContent" || part.kind === "markdownVuln") {
        return part.content.value;
      } else {
        return "";
      }
    }).filter((s) => s.length > 0).join("\n\n");
    if (!quiet) {
      this._onDidChangeValue.fire();
    }
  }
}
class ChatResponseModel extends Disposable {
  constructor(_response, _session, _agent, _slashCommand, requestId, _isComplete = false, _isCanceled = false, _vote, _voteDownReason, _result, followups) {
    super();
    this._session = _session;
    this._agent = _agent;
    this._slashCommand = _slashCommand;
    this.requestId = requestId;
    this._isComplete = _isComplete;
    this._isCanceled = _isCanceled;
    this._vote = _vote;
    this._voteDownReason = _voteDownReason;
    this._result = _result;
    this._isStale = Array.isArray(_response) && (_response.length !== 0 || isMarkdownString(_response) && _response.value.length !== 0);
    this._followups = followups ? [...followups] : void 0;
    this._response = this._register(new Response(_response));
    this._register(this._response.onDidChangeValue(() => this._onDidChange.fire()));
    this.id = "response_" + ChatResponseModel.nextId++;
  }
  static {
    __name(this, "ChatResponseModel");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  static nextId = 0;
  id;
  get session() {
    return this._session;
  }
  get isComplete() {
    return this._isComplete;
  }
  get isCanceled() {
    return this._isCanceled;
  }
  get vote() {
    return this._vote;
  }
  get voteDownReason() {
    return this._voteDownReason;
  }
  get followups() {
    return this._followups;
  }
  _response;
  get response() {
    return this._response;
  }
  get result() {
    return this._result;
  }
  get username() {
    return this.session.responderUsername;
  }
  get avatarIcon() {
    return this.session.responderAvatarIcon;
  }
  _followups;
  get agent() {
    return this._agent;
  }
  get slashCommand() {
    return this._slashCommand;
  }
  _agentOrSlashCommandDetected;
  get agentOrSlashCommandDetected() {
    return this._agentOrSlashCommandDetected ?? false;
  }
  _usedContext;
  get usedContext() {
    return this._usedContext;
  }
  _contentReferences = [];
  get contentReferences() {
    return this._contentReferences;
  }
  _codeCitations = [];
  get codeCitations() {
    return this._codeCitations;
  }
  _progressMessages = [];
  get progressMessages() {
    return this._progressMessages;
  }
  _isStale = false;
  get isStale() {
    return this._isStale;
  }
  /**
   * Apply a progress update to the actual response content.
   */
  updateContent(responsePart, quiet) {
    this._response.updateContent(responsePart, quiet);
  }
  /**
   * Apply one of the progress updates that are not part of the actual response content.
   */
  applyReference(progress) {
    if (progress.kind === "usedContext") {
      this._usedContext = progress;
    } else if (progress.kind === "reference") {
      this._contentReferences.push(progress);
      this._onDidChange.fire();
    }
  }
  applyCodeCitation(progress) {
    this._codeCitations.push(progress);
    this._response.addCitation(progress);
    this._onDidChange.fire();
  }
  setAgent(agent, slashCommand) {
    this._agent = agent;
    this._slashCommand = slashCommand;
    this._agentOrSlashCommandDetected = true;
    this._onDidChange.fire();
  }
  setResult(result) {
    this._result = result;
    this._onDidChange.fire();
  }
  complete() {
    if (this._result?.errorDetails?.responseIsRedacted) {
      this._response.clear();
    }
    this._isComplete = true;
    this._onDidChange.fire();
  }
  cancel() {
    this._isComplete = true;
    this._isCanceled = true;
    this._onDidChange.fire();
  }
  setFollowups(followups) {
    this._followups = followups;
    this._onDidChange.fire();
  }
  setVote(vote) {
    this._vote = vote;
    this._onDidChange.fire();
  }
  setVoteDownReason(reason) {
    this._voteDownReason = reason;
    this._onDidChange.fire();
  }
  setEditApplied(edit, editCount) {
    if (!this.response.value.includes(edit)) {
      return false;
    }
    if (!edit.state) {
      return false;
    }
    edit.state.applied = editCount;
    this._onDidChange.fire();
    return true;
  }
  adoptTo(session) {
    this._session = session;
    this._onDidChange.fire();
  }
}
function normalizeSerializableChatData(raw) {
  normalizeOldFields(raw);
  if (!("version" in raw)) {
    return {
      version: 3,
      ...raw,
      lastMessageDate: raw.creationDate,
      customTitle: void 0
    };
  }
  if (raw.version === 2) {
    return {
      ...raw,
      version: 3,
      customTitle: raw.computedTitle
    };
  }
  return raw;
}
__name(normalizeSerializableChatData, "normalizeSerializableChatData");
function normalizeOldFields(raw) {
  if (!raw.sessionId) {
    raw.sessionId = generateUuid();
  }
  if (!raw.creationDate) {
    raw.creationDate = getLastYearDate();
  }
  if ("version" in raw && (raw.version === 2 || raw.version === 3)) {
    if (!raw.lastMessageDate) {
      raw.lastMessageDate = getLastYearDate();
    }
  }
}
__name(normalizeOldFields, "normalizeOldFields");
function getLastYearDate() {
  const lastYearDate = /* @__PURE__ */ new Date();
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  return lastYearDate.getTime();
}
__name(getLastYearDate, "getLastYearDate");
function isExportableSessionData(obj) {
  const data = obj;
  return typeof data === "object" && typeof data.requesterUsername === "string";
}
__name(isExportableSessionData, "isExportableSessionData");
function isSerializableSessionData(obj) {
  const data = obj;
  return isExportableSessionData(obj) && typeof data.creationDate === "number" && typeof data.sessionId === "string" && obj.requests.every(
    (request) => !request.usedContext || isIUsedContext(request.usedContext)
  );
}
__name(isSerializableSessionData, "isSerializableSessionData");
var ChatRequestRemovalReason = /* @__PURE__ */ ((ChatRequestRemovalReason2) => {
  ChatRequestRemovalReason2[ChatRequestRemovalReason2["Removal"] = 0] = "Removal";
  ChatRequestRemovalReason2[ChatRequestRemovalReason2["Resend"] = 1] = "Resend";
  ChatRequestRemovalReason2[ChatRequestRemovalReason2["Adoption"] = 2] = "Adoption";
  return ChatRequestRemovalReason2;
})(ChatRequestRemovalReason || {});
var ChatModelInitState = /* @__PURE__ */ ((ChatModelInitState2) => {
  ChatModelInitState2[ChatModelInitState2["Created"] = 0] = "Created";
  ChatModelInitState2[ChatModelInitState2["Initializing"] = 1] = "Initializing";
  ChatModelInitState2[ChatModelInitState2["Initialized"] = 2] = "Initialized";
  return ChatModelInitState2;
})(ChatModelInitState || {});
let ChatModel = class extends Disposable {
  constructor(initialData, _initialLocation, logService, chatAgentService, instantiationService) {
    super();
    this.initialData = initialData;
    this._initialLocation = _initialLocation;
    this.logService = logService;
    this.chatAgentService = chatAgentService;
    this.instantiationService = instantiationService;
    this._isImported = !!initialData && !isSerializableSessionData(initialData) || (initialData?.isImported ?? false);
    this._sessionId = isSerializableSessionData(initialData) && initialData.sessionId || generateUuid();
    this._requests = initialData ? this._deserialize(initialData) : [];
    this._creationDate = isSerializableSessionData(initialData) && initialData.creationDate || Date.now();
    this._lastMessageDate = isSerializableSessionData(initialData) && initialData.lastMessageDate || this._creationDate;
    this._customTitle = isSerializableSessionData(initialData) ? initialData.customTitle : void 0;
    this._initialRequesterAvatarIconUri = initialData?.requesterAvatarIconUri && URI.revive(initialData.requesterAvatarIconUri);
    this._initialResponderAvatarIconUri = isUriComponents(initialData?.responderAvatarIconUri) ? URI.revive(initialData.responderAvatarIconUri) : initialData?.responderAvatarIconUri;
  }
  static {
    __name(this, "ChatModel");
  }
  static getDefaultTitle(requests) {
    const firstRequestMessage = requests.at(0)?.message ?? "";
    const message = typeof firstRequestMessage === "string" ? firstRequestMessage : firstRequestMessage.text;
    return message.split("\n")[0].substring(0, 50);
  }
  _onDidDispose = this._register(new Emitter());
  onDidDispose = this._onDidDispose.event;
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _requests;
  _initState = 0 /* Created */;
  _isInitializedDeferred = new DeferredPromise();
  _welcomeMessage;
  get welcomeMessage() {
    return this._welcomeMessage;
  }
  // TODO to be clear, this is not the same as the id from the session object, which belongs to the provider.
  // It's easier to be able to identify this model before its async initialization is complete
  _sessionId;
  get sessionId() {
    return this._sessionId;
  }
  get requestInProgress() {
    const lastRequest = this.lastRequest;
    return !!lastRequest?.response && !lastRequest.response.isComplete;
  }
  get hasRequests() {
    return this._requests.length > 0;
  }
  get lastRequest() {
    return this._requests.at(-1);
  }
  _creationDate;
  get creationDate() {
    return this._creationDate;
  }
  _lastMessageDate;
  get lastMessageDate() {
    return this._lastMessageDate;
  }
  get _defaultAgent() {
    return this.chatAgentService.getDefaultAgent(ChatAgentLocation.Panel);
  }
  get requesterUsername() {
    return this._defaultAgent?.metadata.requester?.name ?? this.initialData?.requesterUsername ?? "";
  }
  get responderUsername() {
    return this._defaultAgent?.fullName ?? this.initialData?.responderUsername ?? "";
  }
  _initialRequesterAvatarIconUri;
  get requesterAvatarIconUri() {
    return this._defaultAgent?.metadata.requester?.icon ?? this._initialRequesterAvatarIconUri;
  }
  _initialResponderAvatarIconUri;
  get responderAvatarIcon() {
    return this._defaultAgent?.metadata.themeIcon ?? this._initialResponderAvatarIconUri;
  }
  get initState() {
    return this._initState;
  }
  _isImported = false;
  get isImported() {
    return this._isImported;
  }
  _customTitle;
  get customTitle() {
    return this._customTitle;
  }
  get title() {
    return this._customTitle || ChatModel.getDefaultTitle(this._requests);
  }
  get initialLocation() {
    return this._initialLocation;
  }
  _deserialize(obj) {
    const requests = obj.requests;
    if (!Array.isArray(requests)) {
      this.logService.error(`Ignoring malformed session data: ${JSON.stringify(obj)}`);
      return [];
    }
    if (obj.welcomeMessage) {
      const content = obj.welcomeMessage.map((item) => typeof item === "string" ? new MarkdownString(item) : item);
      this._welcomeMessage = this.instantiationService.createInstance(ChatWelcomeMessageModel, content, []);
    }
    try {
      return requests.map((raw) => {
        const parsedRequest = typeof raw.message === "string" ? this.getParsedRequestFromString(raw.message) : reviveParsedChatRequest(raw.message);
        const variableData = this.reviveVariableData(raw.variableData);
        const request = new ChatRequestModel(this, parsedRequest, variableData);
        if (raw.response || raw.result || raw.responseErrorDetails) {
          const agent = raw.agent && "metadata" in raw.agent ? (
            // Check for the new format, ignore entries in the old format
            reviveSerializedAgent(raw.agent)
          ) : void 0;
          const result = "responseErrorDetails" in raw ? (
            // eslint-disable-next-line local/code-no-dangerous-type-assertions
            { errorDetails: raw.responseErrorDetails }
          ) : raw.result;
          request.response = new ChatResponseModel(raw.response ?? [new MarkdownString(raw.response)], this, agent, raw.slashCommand, request.id, true, raw.isCanceled, raw.vote, raw.voteDownReason, result, raw.followups);
          if (raw.usedContext) {
            request.response.applyReference(revive(raw.usedContext));
          }
          raw.contentReferences?.forEach((r) => request.response.applyReference(revive(r)));
          raw.codeCitations?.forEach((c) => request.response.applyCodeCitation(revive(c)));
        }
        return request;
      });
    } catch (error) {
      this.logService.error("Failed to parse chat data", error);
      return [];
    }
  }
  reviveVariableData(raw) {
    const variableData = raw && Array.isArray(raw.variables) ? raw : { variables: [] };
    variableData.variables = variableData.variables.map((v) => {
      if (v && "values" in v && Array.isArray(v.values)) {
        return {
          id: v.id ?? "",
          name: v.name,
          value: v.values[0]?.value,
          range: v.range,
          modelDescription: v.modelDescription,
          references: v.references
        };
      } else {
        return v;
      }
    });
    return variableData;
  }
  getParsedRequestFromString(message) {
    const parts = [new ChatRequestTextPart(new OffsetRange(0, message.length), { startColumn: 1, startLineNumber: 1, endColumn: 1, endLineNumber: 1 }, message)];
    return {
      text: message,
      parts
    };
  }
  startInitialize() {
    if (this.initState !== 0 /* Created */) {
      throw new Error(`ChatModel is in the wrong state for startInitialize: ${ChatModelInitState[this.initState]}`);
    }
    this._initState = 1 /* Initializing */;
  }
  deinitialize() {
    this._initState = 0 /* Created */;
    this._isInitializedDeferred = new DeferredPromise();
  }
  initialize(welcomeMessage) {
    if (this.initState !== 1 /* Initializing */) {
      throw new Error(`ChatModel is in the wrong state for initialize: ${ChatModelInitState[this.initState]}`);
    }
    this._initState = 2 /* Initialized */;
    if (!this._welcomeMessage) {
      this._welcomeMessage = welcomeMessage;
    }
    this._isInitializedDeferred.complete();
    this._onDidChange.fire({ kind: "initialize" });
  }
  setInitializationError(error) {
    if (this.initState !== 1 /* Initializing */) {
      throw new Error(`ChatModel is in the wrong state for setInitializationError: ${ChatModelInitState[this.initState]}`);
    }
    if (!this._isInitializedDeferred.isSettled) {
      this._isInitializedDeferred.error(error);
    }
  }
  waitForInitialization() {
    return this._isInitializedDeferred.p;
  }
  getRequests() {
    return this._requests;
  }
  addRequest(message, variableData, attempt, chatAgent, slashCommand, confirmation, locationData, attachments) {
    const request = new ChatRequestModel(this, message, variableData, attempt, confirmation, locationData, attachments);
    request.response = new ChatResponseModel([], this, chatAgent, slashCommand, request.id);
    this._requests.push(request);
    this._lastMessageDate = Date.now();
    this._onDidChange.fire({ kind: "addRequest", request });
    return request;
  }
  setCustomTitle(title) {
    this._customTitle = title;
  }
  updateRequest(request, variableData) {
    request.variableData = variableData;
    this._onDidChange.fire({ kind: "changedRequest", request });
  }
  adoptRequest(request) {
    const oldOwner = request.session;
    const index = oldOwner._requests.findIndex((candidate) => candidate.id === request.id);
    if (index === -1) {
      return;
    }
    oldOwner._requests.splice(index, 1);
    request.adoptTo(this);
    request.response?.adoptTo(this);
    this._requests.push(request);
    oldOwner._onDidChange.fire({ kind: "removeRequest", requestId: request.id, responseId: request.response?.id, reason: 2 /* Adoption */ });
    this._onDidChange.fire({ kind: "addRequest", request });
  }
  acceptResponseProgress(request, progress, quiet) {
    if (!request.response) {
      request.response = new ChatResponseModel([], this, void 0, void 0, request.id);
    }
    if (request.response.isComplete) {
      throw new Error("acceptResponseProgress: Adding progress to a completed response");
    }
    if (progress.kind === "markdownContent" || progress.kind === "treeData" || progress.kind === "inlineReference" || progress.kind === "codeblockUri" || progress.kind === "markdownVuln" || progress.kind === "progressMessage" || progress.kind === "command" || progress.kind === "textEdit" || progress.kind === "warning" || progress.kind === "progressTask" || progress.kind === "confirmation") {
      request.response.updateContent(progress, quiet);
    } else if (progress.kind === "usedContext" || progress.kind === "reference") {
      request.response.applyReference(progress);
    } else if (progress.kind === "agentDetection") {
      const agent = this.chatAgentService.getAgent(progress.agentId);
      if (agent) {
        request.response.setAgent(agent, progress.command);
        this._onDidChange.fire({ kind: "setAgent", agent, command: progress.command });
      }
    } else if (progress.kind === "codeCitation") {
      request.response.applyCodeCitation(progress);
    } else if (progress.kind === "move") {
      this._onDidChange.fire({ kind: "move", target: progress.uri, range: progress.range });
    } else {
      this.logService.error(`Couldn't handle progress: ${JSON.stringify(progress)}`);
    }
  }
  removeRequest(id, reason = 0 /* Removal */) {
    const index = this._requests.findIndex((request2) => request2.id === id);
    const request = this._requests[index];
    if (index !== -1) {
      this._onDidChange.fire({ kind: "removeRequest", requestId: request.id, responseId: request.response?.id, reason });
      this._requests.splice(index, 1);
      request.response?.dispose();
    }
  }
  cancelRequest(request) {
    if (request.response) {
      request.response.cancel();
    }
  }
  setResponse(request, result) {
    if (!request.response) {
      request.response = new ChatResponseModel([], this, void 0, void 0, request.id);
    }
    request.response.setResult(result);
  }
  completeResponse(request) {
    if (!request.response) {
      throw new Error("Call setResponse before completeResponse");
    }
    request.response.complete();
  }
  setFollowups(request, followups) {
    if (!request.response) {
      return;
    }
    request.response.setFollowups(followups);
  }
  setResponseModel(request, response) {
    request.response = response;
    this._onDidChange.fire({ kind: "addResponse", response });
  }
  toExport() {
    return {
      requesterUsername: this.requesterUsername,
      requesterAvatarIconUri: this.requesterAvatarIconUri,
      responderUsername: this.responderUsername,
      responderAvatarIconUri: this.responderAvatarIcon,
      initialLocation: this.initialLocation,
      welcomeMessage: this._welcomeMessage?.content.map((c) => {
        if (Array.isArray(c)) {
          return c;
        } else {
          return c.value;
        }
      }),
      requests: this._requests.map((r) => {
        const message = {
          ...r.message,
          parts: r.message.parts.map((p) => p && "toJSON" in p ? p.toJSON() : p)
        };
        const agent = r.response?.agent;
        const agentJson = agent && "toJSON" in agent ? agent.toJSON() : agent ? { ...agent } : void 0;
        return {
          message,
          variableData: r.variableData,
          response: r.response ? r.response.response.value.map((item) => {
            if (item.kind === "treeData") {
              return item.treeData;
            } else if (item.kind === "markdownContent") {
              return item.content;
            } else {
              return item;
            }
          }) : void 0,
          result: r.response?.result,
          followups: r.response?.followups,
          isCanceled: r.response?.isCanceled,
          vote: r.response?.vote,
          voteDownReason: r.response?.voteDownReason,
          agent: agentJson,
          slashCommand: r.response?.slashCommand,
          usedContext: r.response?.usedContext,
          contentReferences: r.response?.contentReferences,
          codeCitations: r.response?.codeCitations
        };
      })
    };
  }
  toJSON() {
    return {
      version: 3,
      ...this.toExport(),
      sessionId: this.sessionId,
      creationDate: this._creationDate,
      isImported: this._isImported,
      lastMessageDate: this._lastMessageDate,
      customTitle: this._customTitle
    };
  }
  dispose() {
    this._requests.forEach((r) => r.response?.dispose());
    this._onDidDispose.fire();
    super.dispose();
  }
};
ChatModel = __decorateClass([
  __decorateParam(2, ILogService),
  __decorateParam(3, IChatAgentService),
  __decorateParam(4, IInstantiationService)
], ChatModel);
let ChatWelcomeMessageModel = class {
  constructor(content, sampleQuestions, chatAgentService) {
    this.content = content;
    this.sampleQuestions = sampleQuestions;
    this.chatAgentService = chatAgentService;
    this._id = "welcome_" + ChatWelcomeMessageModel.nextId++;
  }
  static {
    __name(this, "ChatWelcomeMessageModel");
  }
  static nextId = 0;
  _id;
  get id() {
    return this._id;
  }
  get username() {
    return this.chatAgentService.getContributedDefaultAgent(ChatAgentLocation.Panel)?.fullName ?? "";
  }
  get avatarIcon() {
    return this.chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)?.metadata.themeIcon;
  }
};
ChatWelcomeMessageModel = __decorateClass([
  __decorateParam(2, IChatAgentService)
], ChatWelcomeMessageModel);
function updateRanges(variableData, diff) {
  return {
    variables: variableData.variables.map((v) => ({
      ...v,
      range: v.range && {
        start: v.range.start - diff,
        endExclusive: v.range.endExclusive - diff
      }
    }))
  };
}
__name(updateRanges, "updateRanges");
function canMergeMarkdownStrings(md1, md2) {
  if (md1.baseUri && md2.baseUri) {
    const baseUriEquals = md1.baseUri.scheme === md2.baseUri.scheme && md1.baseUri.authority === md2.baseUri.authority && md1.baseUri.path === md2.baseUri.path && md1.baseUri.query === md2.baseUri.query && md1.baseUri.fragment === md2.baseUri.fragment;
    if (!baseUriEquals) {
      return false;
    }
  } else if (md1.baseUri || md2.baseUri) {
    return false;
  }
  return equals(md1.isTrusted, md2.isTrusted) && md1.supportHtml === md2.supportHtml && md1.supportThemeIcons === md2.supportThemeIcons;
}
__name(canMergeMarkdownStrings, "canMergeMarkdownStrings");
function appendMarkdownString(md1, md2) {
  const appendedValue = typeof md2 === "string" ? md2 : md2.value;
  return {
    value: md1.value + appendedValue,
    isTrusted: md1.isTrusted,
    supportThemeIcons: md1.supportThemeIcons,
    supportHtml: md1.supportHtml,
    baseUri: md1.baseUri
  };
}
__name(appendMarkdownString, "appendMarkdownString");
function getCodeCitationsMessage(citations) {
  if (citations.length === 0) {
    return "";
  }
  const licenseTypes = citations.reduce((set, c) => set.add(c.license), /* @__PURE__ */ new Set());
  const label = licenseTypes.size === 1 ? localize("codeCitation", "Similar code found with 1 license type", licenseTypes.size) : localize("codeCitations", "Similar code found with {0} license types", licenseTypes.size);
  return label;
}
__name(getCodeCitationsMessage, "getCodeCitationsMessage");
export {
  ChatModel,
  ChatModelInitState,
  ChatRequestModel,
  ChatRequestRemovalReason,
  ChatResponseModel,
  ChatWelcomeMessageModel,
  Response,
  appendMarkdownString,
  canMergeMarkdownStrings,
  getCodeCitationsMessage,
  isExportableSessionData,
  isSerializableSessionData,
  normalizeSerializableChatData,
  updateRanges
};
//# sourceMappingURL=chatModel.js.map
