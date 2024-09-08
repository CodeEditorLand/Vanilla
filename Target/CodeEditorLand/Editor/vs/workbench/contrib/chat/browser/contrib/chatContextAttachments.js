import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ChatWidget } from "../chatWidget.js";
class ChatContextAttachments extends Disposable {
  constructor(widget) {
    super();
    this.widget = widget;
    this._register(
      this.widget.onDidChangeContext((e) => {
        if (e.removed) {
          this._removeContext(e.removed);
        }
      })
    );
    this._register(
      this.widget.onDidSubmitAgent(() => {
        this._clearAttachedContext();
      })
    );
  }
  _attachedContext = /* @__PURE__ */ new Set();
  static ID = "chatContextAttachments";
  get id() {
    return ChatContextAttachments.ID;
  }
  getInputState() {
    return [...this._attachedContext.values()];
  }
  setInputState(s) {
    if (!Array.isArray(s)) {
      s = [];
    }
    this._attachedContext.clear();
    for (const attachment of s) {
      this._attachedContext.add(attachment);
    }
    this.widget.setContext(true, ...s);
  }
  getContext() {
    return new Set([...this._attachedContext.values()].map((v) => v.id));
  }
  setContext(overwrite, ...attachments) {
    if (overwrite) {
      this._attachedContext.clear();
    }
    for (const attachment of attachments) {
      this._attachedContext.add(attachment);
    }
    this.widget.setContext(overwrite, ...attachments);
  }
  _removeContext(attachments) {
    if (attachments.length) {
      attachments.forEach(
        this._attachedContext.delete,
        this._attachedContext
      );
    }
  }
  _clearAttachedContext() {
    this._attachedContext.clear();
  }
}
ChatWidget.CONTRIBS.push(ChatContextAttachments);
export {
  ChatContextAttachments
};
