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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import {
  EditorInputCapabilities
} from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { ChatAgentLocation } from "../common/chatAgents.js";
import { IChatService } from "../common/chatService.js";
const ChatEditorIcon = registerIcon(
  "chat-editor-label-icon",
  Codicon.commentDiscussion,
  nls.localize("chatEditorLabelIcon", "Icon of the chat editor label.")
);
let ChatEditorInput = class extends EditorInput {
  constructor(resource, options, chatService) {
    super();
    this.resource = resource;
    this.options = options;
    this.chatService = chatService;
    const parsed = ChatUri.parse(resource);
    if (typeof parsed?.handle !== "number") {
      throw new Error("Invalid chat URI");
    }
    this.sessionId = options.target && "sessionId" in options.target ? options.target.sessionId : void 0;
    this.inputCount = ChatEditorInput.getNextCount();
    ChatEditorInput.countsInUse.add(this.inputCount);
    this._register(
      toDisposable(
        () => ChatEditorInput.countsInUse.delete(this.inputCount)
      )
    );
  }
  static {
    __name(this, "ChatEditorInput");
  }
  static countsInUse = /* @__PURE__ */ new Set();
  static TypeID = "workbench.input.chatSession";
  static EditorID = "workbench.editor.chatSession";
  inputCount;
  sessionId;
  model;
  static getNewEditorUri() {
    const handle = Math.floor(Math.random() * 1e9);
    return ChatUri.generate(handle);
  }
  static getNextCount() {
    let count = 0;
    while (ChatEditorInput.countsInUse.has(count)) {
      count++;
    }
    return count;
  }
  get editorId() {
    return ChatEditorInput.EditorID;
  }
  get capabilities() {
    return super.capabilities | EditorInputCapabilities.Singleton;
  }
  matches(otherInput) {
    return otherInput instanceof ChatEditorInput && otherInput.resource.toString() === this.resource.toString();
  }
  get typeId() {
    return ChatEditorInput.TypeID;
  }
  getName() {
    return this.model?.title || nls.localize("chatEditorName", "Chat") + (this.inputCount > 0 ? ` ${this.inputCount + 1}` : "");
  }
  getIcon() {
    return ChatEditorIcon;
  }
  async resolve() {
    if (typeof this.sessionId === "string") {
      this.model = this.chatService.getOrRestoreSession(this.sessionId);
    } else if (!this.options.target) {
      this.model = this.chatService.startSession(
        ChatAgentLocation.Panel,
        CancellationToken.None
      );
    } else if ("data" in this.options.target) {
      this.model = this.chatService.loadSessionFromContent(
        this.options.target.data
      );
    }
    if (!this.model) {
      return null;
    }
    this.sessionId = this.model.sessionId;
    this._register(
      this.model.onDidChange(() => this._onDidChangeLabel.fire())
    );
    return this._register(new ChatEditorModel(this.model));
  }
  dispose() {
    super.dispose();
    if (this.sessionId) {
      this.chatService.clearSession(this.sessionId);
    }
  }
};
ChatEditorInput = __decorateClass([
  __decorateParam(2, IChatService)
], ChatEditorInput);
class ChatEditorModel extends Disposable {
  constructor(model) {
    super();
    this.model = model;
  }
  static {
    __name(this, "ChatEditorModel");
  }
  _onWillDispose = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  _isDisposed = false;
  _isResolved = false;
  async resolve() {
    this._isResolved = true;
  }
  isResolved() {
    return this._isResolved;
  }
  isDisposed() {
    return this._isDisposed;
  }
  dispose() {
    super.dispose();
    this._isDisposed = true;
  }
}
var ChatUri;
((ChatUri2) => {
  ChatUri2.scheme = Schemas.vscodeChatSesssion;
  function generate(handle) {
    return URI.from({ scheme: ChatUri2.scheme, path: `chat-${handle}` });
  }
  ChatUri2.generate = generate;
  __name(generate, "generate");
  function parse(resource) {
    if (resource.scheme !== ChatUri2.scheme) {
      return void 0;
    }
    const match = resource.path.match(/chat-(\d+)/);
    const handleStr = match?.[1];
    if (typeof handleStr !== "string") {
      return void 0;
    }
    const handle = Number.parseInt(handleStr);
    if (isNaN(handle)) {
      return void 0;
    }
    return { handle };
  }
  ChatUri2.parse = parse;
  __name(parse, "parse");
})(ChatUri || (ChatUri = {}));
class ChatEditorInputSerializer {
  static {
    __name(this, "ChatEditorInputSerializer");
  }
  canSerialize(input) {
    return input instanceof ChatEditorInput && typeof input.sessionId === "string";
  }
  serialize(input) {
    if (!this.canSerialize(input)) {
      return void 0;
    }
    const obj = {
      options: input.options,
      sessionId: input.sessionId,
      resource: input.resource
    };
    return JSON.stringify(obj);
  }
  deserialize(instantiationService, serializedEditor) {
    try {
      const parsed = JSON.parse(serializedEditor);
      const resource = URI.revive(parsed.resource);
      return instantiationService.createInstance(
        ChatEditorInput,
        resource,
        { ...parsed.options, target: { sessionId: parsed.sessionId } }
      );
    } catch (err) {
      return void 0;
    }
  }
}
export {
  ChatEditorInput,
  ChatEditorInputSerializer,
  ChatEditorModel,
  ChatUri
};
//# sourceMappingURL=chatEditorInput.js.map
