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
import * as dom from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { Emitter } from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import {
  MarkdownRenderer
} from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import * as languages from "../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import * as nls from "../../../../nls.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { CommentNode } from "./commentNode.js";
import { ICommentService } from "./commentService.js";
let CommentThreadBody = class extends Disposable {
  constructor(_parentEditor, owner, parentResourceUri, container, _options, _commentThread, _pendingEdits, _scopedInstatiationService, _parentCommentThreadWidget, commentService, openerService, languageService) {
    super();
    this._parentEditor = _parentEditor;
    this.owner = owner;
    this.parentResourceUri = parentResourceUri;
    this.container = container;
    this._options = _options;
    this._commentThread = _commentThread;
    this._pendingEdits = _pendingEdits;
    this._scopedInstatiationService = _scopedInstatiationService;
    this._parentCommentThreadWidget = _parentCommentThreadWidget;
    this.commentService = commentService;
    this.openerService = openerService;
    this.languageService = languageService;
    this._register(
      dom.addDisposableListener(
        container,
        dom.EventType.FOCUS_IN,
        (e) => {
          this.commentService.setActiveEditingCommentThread(
            this._commentThread
          );
        }
      )
    );
    this._markdownRenderer = this._register(
      new MarkdownRenderer(
        this._options,
        this.languageService,
        this.openerService
      )
    );
  }
  static {
    __name(this, "CommentThreadBody");
  }
  _commentsElement;
  _commentElements = [];
  _resizeObserver;
  _focusedComment = void 0;
  _onDidResize = new Emitter();
  onDidResize = this._onDidResize.event;
  _commentDisposable = new DisposableMap();
  _markdownRenderer;
  get length() {
    return this._commentThread.comments ? this._commentThread.comments.length : 0;
  }
  get activeComment() {
    return this._commentElements.filter((node) => node.isEditing)[0];
  }
  focus() {
    this._commentsElement.focus();
  }
  ensureFocusIntoNewEditingComment() {
    if (this._commentElements.length === 1 && this._commentElements[0].isEditing) {
      this._commentElements[0].setFocus(true);
    }
  }
  async display() {
    this._commentsElement = dom.append(
      this.container,
      dom.$("div.comments-container")
    );
    this._commentsElement.setAttribute("role", "presentation");
    this._commentsElement.tabIndex = 0;
    this._updateAriaLabel();
    this._register(
      dom.addDisposableListener(
        this._commentsElement,
        dom.EventType.KEY_DOWN,
        (e) => {
          const event = new StandardKeyboardEvent(e);
          if ((event.equals(KeyCode.UpArrow) || event.equals(KeyCode.DownArrow)) && (!this._focusedComment || !this._commentElements[this._focusedComment].isEditing)) {
            const moveFocusWithinBounds = /* @__PURE__ */ __name((change) => {
              if (this._focusedComment === void 0 && change >= 0) {
                return 0;
              }
              if (this._focusedComment === void 0 && change < 0) {
                return this._commentElements.length - 1;
              }
              const newIndex = this._focusedComment + change;
              return Math.min(
                Math.max(0, newIndex),
                this._commentElements.length - 1
              );
            }, "moveFocusWithinBounds");
            this._setFocusedComment(
              event.equals(KeyCode.UpArrow) ? moveFocusWithinBounds(-1) : moveFocusWithinBounds(1)
            );
          }
        }
      )
    );
    this._commentDisposable.clearAndDisposeAll();
    this._commentElements = [];
    if (this._commentThread.comments) {
      for (const comment of this._commentThread.comments) {
        const newCommentNode = this.createNewCommentNode(comment);
        this._commentElements.push(newCommentNode);
        this._commentsElement.appendChild(newCommentNode.domNode);
        if (comment.mode === languages.CommentMode.Editing) {
          await newCommentNode.switchToEditMode();
        }
      }
    }
    this._resizeObserver = new MutationObserver(this._refresh.bind(this));
    this._resizeObserver.observe(this.container, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }
  _refresh() {
    const dimensions = dom.getClientArea(this.container);
    this._onDidResize.fire(dimensions);
  }
  getDimensions() {
    return dom.getClientArea(this.container);
  }
  layout(widthInPixel) {
    this._commentElements.forEach((element) => {
      element.layout(widthInPixel);
    });
  }
  getPendingEdits() {
    const pendingEdits = {};
    this._commentElements.forEach((element) => {
      if (element.isEditing) {
        const pendingEdit = element.getPendingEdit();
        if (pendingEdit) {
          pendingEdits[element.comment.uniqueIdInThread] = pendingEdit;
        }
      }
    });
    return pendingEdits;
  }
  getCommentCoords(commentUniqueId) {
    const matchedNode = this._commentElements.filter(
      (commentNode) => commentNode.comment.uniqueIdInThread === commentUniqueId
    );
    if (matchedNode && matchedNode.length) {
      const commentThreadCoords = dom.getDomNodePagePosition(
        this._commentElements[0].domNode
      );
      const commentCoords = dom.getDomNodePagePosition(
        matchedNode[0].domNode
      );
      return {
        thread: commentThreadCoords,
        comment: commentCoords
      };
    }
    return;
  }
  async updateCommentThread(commentThread, preserveFocus) {
    const oldCommentsLen = this._commentElements.length;
    const newCommentsLen = commentThread.comments ? commentThread.comments.length : 0;
    const commentElementsToDel = [];
    const commentElementsToDelIndex = [];
    for (let i = 0; i < oldCommentsLen; i++) {
      const comment = this._commentElements[i].comment;
      const newComment = commentThread.comments ? commentThread.comments.filter(
        (c) => c.uniqueIdInThread === comment.uniqueIdInThread
      ) : [];
      if (newComment.length) {
        this._commentElements[i].update(newComment[0]);
      } else {
        commentElementsToDelIndex.push(i);
        commentElementsToDel.push(this._commentElements[i]);
      }
    }
    for (let i = commentElementsToDel.length - 1; i >= 0; i--) {
      const commentToDelete = commentElementsToDel[i];
      this._commentDisposable.deleteAndDispose(commentToDelete);
      this._commentElements.splice(commentElementsToDelIndex[i], 1);
      commentToDelete.domNode.remove();
    }
    let lastCommentElement = null;
    const newCommentNodeList = [];
    const newCommentsInEditMode = [];
    for (let i = newCommentsLen - 1; i >= 0; i--) {
      const currentComment = commentThread.comments[i];
      const oldCommentNode = this._commentElements.filter(
        (commentNode) => commentNode.comment.uniqueIdInThread === currentComment.uniqueIdInThread
      );
      if (oldCommentNode.length) {
        lastCommentElement = oldCommentNode[0].domNode;
        newCommentNodeList.unshift(oldCommentNode[0]);
      } else {
        const newElement = this.createNewCommentNode(currentComment);
        newCommentNodeList.unshift(newElement);
        if (lastCommentElement) {
          this._commentsElement.insertBefore(
            newElement.domNode,
            lastCommentElement
          );
          lastCommentElement = newElement.domNode;
        } else {
          this._commentsElement.appendChild(newElement.domNode);
          lastCommentElement = newElement.domNode;
        }
        if (currentComment.mode === languages.CommentMode.Editing) {
          await newElement.switchToEditMode();
          newCommentsInEditMode.push(newElement);
        }
      }
    }
    this._commentThread = commentThread;
    this._commentElements = newCommentNodeList;
    if (newCommentsInEditMode.length) {
      const lastIndex = this._commentElements.indexOf(
        newCommentsInEditMode[newCommentsInEditMode.length - 1]
      );
      this._focusedComment = lastIndex;
    }
    this._updateAriaLabel();
    if (!preserveFocus) {
      this._setFocusedComment(this._focusedComment);
    }
  }
  _updateAriaLabel() {
    if (this._commentThread.isDocumentCommentThread()) {
      if (this._commentThread.range) {
        this._commentsElement.ariaLabel = nls.localize(
          "commentThreadAria.withRange",
          "Comment thread with {0} comments on lines {1} through {2}. {3}.",
          this._commentThread.comments?.length,
          this._commentThread.range.startLineNumber,
          this._commentThread.range.endLineNumber,
          this._commentThread.label
        );
      } else {
        this._commentsElement.ariaLabel = nls.localize(
          "commentThreadAria.document",
          "Comment thread with {0} comments on the entire document. {1}.",
          this._commentThread.comments?.length,
          this._commentThread.label
        );
      }
    } else {
      this._commentsElement.ariaLabel = nls.localize(
        "commentThreadAria",
        "Comment thread with {0} comments. {1}.",
        this._commentThread.comments?.length,
        this._commentThread.label
      );
    }
  }
  _setFocusedComment(value) {
    if (this._focusedComment !== void 0) {
      this._commentElements[this._focusedComment]?.setFocus(false);
    }
    if (this._commentElements.length === 0 || value === void 0) {
      this._focusedComment = void 0;
    } else {
      this._focusedComment = Math.min(
        value,
        this._commentElements.length - 1
      );
      this._commentElements[this._focusedComment].setFocus(true);
    }
  }
  createNewCommentNode(comment) {
    const newCommentNode = this._scopedInstatiationService.createInstance(
      CommentNode,
      this._parentEditor,
      this._commentThread,
      comment,
      this._pendingEdits ? this._pendingEdits[comment.uniqueIdInThread] : void 0,
      this.owner,
      this.parentResourceUri,
      this._parentCommentThreadWidget,
      this._markdownRenderer
    );
    const disposables = new DisposableStore();
    disposables.add(
      newCommentNode.onDidClick(
        (clickedNode) => this._setFocusedComment(
          this._commentElements.findIndex(
            (commentNode) => commentNode.comment.uniqueIdInThread === clickedNode.comment.uniqueIdInThread
          )
        )
      )
    );
    disposables.add(newCommentNode);
    this._commentDisposable.set(newCommentNode, disposables);
    return newCommentNode;
  }
  dispose() {
    super.dispose();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    this._commentDisposable.dispose();
  }
};
CommentThreadBody = __decorateClass([
  __decorateParam(9, ICommentService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, ILanguageService)
], CommentThreadBody);
export {
  CommentThreadBody
};
//# sourceMappingURL=commentThreadBody.js.map
