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
import { Codicon } from "../../../base/common/codicons.js";
import { Emitter } from "../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../base/common/marshallingIds.js";
import { Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import { Range } from "../../../editor/common/core/range.js";
import * as languages from "../../../editor/common/languages.js";
import { localize } from "../../../nls.js";
import { SyncDescriptor } from "../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import { registerIcon } from "../../../platform/theme/common/iconRegistry.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { ViewPaneContainer } from "../../browser/parts/views/viewPaneContainer.js";
import {
  IViewDescriptorService,
  ViewContainerLocation,
  Extensions as ViewExtensions
} from "../../common/views.js";
import {
  ICommentService
} from "../../contrib/comments/browser/commentService.js";
import { revealCommentThread } from "../../contrib/comments/browser/commentsController.js";
import {
  COMMENTS_VIEW_ID,
  COMMENTS_VIEW_STORAGE_ID,
  COMMENTS_VIEW_TITLE
} from "../../contrib/comments/browser/commentsTreeViewer.js";
import { CommentsPanel } from "../../contrib/comments/browser/commentsView.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import { IViewsService } from "../../services/views/common/viewsService.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
class MainThreadCommentThread {
  constructor(commentThreadHandle, controllerHandle, extensionId, threadId, resource, _range, comments, _canReply, _isTemplate, editorId) {
    this.commentThreadHandle = commentThreadHandle;
    this.controllerHandle = controllerHandle;
    this.extensionId = extensionId;
    this.threadId = threadId;
    this.resource = resource;
    this._range = _range;
    this._canReply = _canReply;
    this._isTemplate = _isTemplate;
    this.editorId = editorId;
    this._isDisposed = false;
    if (_isTemplate) {
      this.comments = [];
    } else if (comments) {
      this._comments = comments;
    }
  }
  static {
    __name(this, "MainThreadCommentThread");
  }
  _input;
  get input() {
    return this._input;
  }
  set input(value) {
    this._input = value;
    this._onDidChangeInput.fire(value);
  }
  _onDidChangeInput = new Emitter();
  get onDidChangeInput() {
    return this._onDidChangeInput.event;
  }
  _label;
  get label() {
    return this._label;
  }
  set label(label) {
    this._label = label;
    this._onDidChangeLabel.fire(this._label);
  }
  _contextValue;
  get contextValue() {
    return this._contextValue;
  }
  set contextValue(context) {
    this._contextValue = context;
  }
  _onDidChangeLabel = new Emitter();
  onDidChangeLabel = this._onDidChangeLabel.event;
  _comments;
  get comments() {
    return this._comments;
  }
  set comments(newComments) {
    this._comments = newComments;
    this._onDidChangeComments.fire(this._comments);
  }
  _onDidChangeComments = new Emitter();
  get onDidChangeComments() {
    return this._onDidChangeComments.event;
  }
  set range(range) {
    this._range = range;
  }
  get range() {
    return this._range;
  }
  _onDidChangeCanReply = new Emitter();
  get onDidChangeCanReply() {
    return this._onDidChangeCanReply.event;
  }
  set canReply(state) {
    this._canReply = state;
    this._onDidChangeCanReply.fire(this._canReply);
  }
  get canReply() {
    return this._canReply;
  }
  _collapsibleState;
  get collapsibleState() {
    return this._collapsibleState;
  }
  set collapsibleState(newState) {
    if (newState !== this._collapsibleState) {
      this._collapsibleState = newState;
      this._onDidChangeCollapsibleState.fire(this._collapsibleState);
    }
  }
  _initialCollapsibleState;
  get initialCollapsibleState() {
    return this._initialCollapsibleState;
  }
  set initialCollapsibleState(initialCollapsibleState) {
    this._initialCollapsibleState = initialCollapsibleState;
    if (this.collapsibleState === void 0) {
      this.collapsibleState = this.initialCollapsibleState;
    }
    this._onDidChangeInitialCollapsibleState.fire(initialCollapsibleState);
  }
  _onDidChangeCollapsibleState = new Emitter();
  onDidChangeCollapsibleState = this._onDidChangeCollapsibleState.event;
  _onDidChangeInitialCollapsibleState = new Emitter();
  onDidChangeInitialCollapsibleState = this._onDidChangeInitialCollapsibleState.event;
  _isDisposed;
  get isDisposed() {
    return this._isDisposed;
  }
  isDocumentCommentThread() {
    return this._range === void 0 || Range.isIRange(this._range);
  }
  _state;
  get state() {
    return this._state;
  }
  set state(newState) {
    this._state = newState;
    this._onDidChangeState.fire(this._state);
  }
  _applicability;
  get applicability() {
    return this._applicability;
  }
  set applicability(value) {
    this._applicability = value;
    this._onDidChangeApplicability.fire(value);
  }
  _onDidChangeApplicability = new Emitter();
  onDidChangeApplicability = this._onDidChangeApplicability.event;
  get isTemplate() {
    return this._isTemplate;
  }
  _onDidChangeState = new Emitter();
  onDidChangeState = this._onDidChangeState.event;
  batchUpdate(changes) {
    const modified = /* @__PURE__ */ __name((value) => Object.prototype.hasOwnProperty.call(changes, value), "modified");
    if (modified("range")) {
      this._range = changes.range;
    }
    if (modified("label")) {
      this._label = changes.label;
    }
    if (modified("contextValue")) {
      this._contextValue = changes.contextValue === null ? void 0 : changes.contextValue;
    }
    if (modified("comments")) {
      this.comments = changes.comments;
    }
    if (modified("collapseState")) {
      this.initialCollapsibleState = changes.collapseState;
    }
    if (modified("canReply")) {
      this.canReply = changes.canReply;
    }
    if (modified("state")) {
      this.state = changes.state;
    }
    if (modified("applicability")) {
      this.applicability = changes.applicability;
    }
    if (modified("isTemplate")) {
      this._isTemplate = changes.isTemplate;
    }
  }
  hasComments() {
    return !!this.comments && this.comments.length > 0;
  }
  dispose() {
    this._isDisposed = true;
    this._onDidChangeCollapsibleState.dispose();
    this._onDidChangeComments.dispose();
    this._onDidChangeInput.dispose();
    this._onDidChangeLabel.dispose();
    this._onDidChangeState.dispose();
  }
  toJSON() {
    return {
      $mid: MarshalledId.CommentThread,
      commentControlHandle: this.controllerHandle,
      commentThreadHandle: this.commentThreadHandle
    };
  }
}
class MainThreadCommentController {
  constructor(_proxy, _commentService, _handle, _uniqueId, _id, _label, _features) {
    this._proxy = _proxy;
    this._commentService = _commentService;
    this._handle = _handle;
    this._uniqueId = _uniqueId;
    this._id = _id;
    this._label = _label;
    this._features = _features;
  }
  static {
    __name(this, "MainThreadCommentController");
  }
  get handle() {
    return this._handle;
  }
  get id() {
    return this._id;
  }
  get contextValue() {
    return this._id;
  }
  get proxy() {
    return this._proxy;
  }
  get label() {
    return this._label;
  }
  _reactions;
  get reactions() {
    return this._reactions;
  }
  set reactions(reactions) {
    this._reactions = reactions;
  }
  get options() {
    return this._features.options;
  }
  _threads = /* @__PURE__ */ new Map();
  activeEditingCommentThread;
  get features() {
    return this._features;
  }
  get owner() {
    return this._id;
  }
  async setActiveCommentAndThread(commentInfo) {
    return this._proxy.$setActiveComment(
      this._handle,
      commentInfo ? {
        commentThreadHandle: commentInfo.thread.commentThreadHandle,
        uniqueIdInThread: commentInfo.comment?.uniqueIdInThread
      } : void 0
    );
  }
  updateFeatures(features) {
    this._features = features;
  }
  createCommentThread(extensionId, commentThreadHandle, threadId, resource, range, comments, isTemplate, editorId) {
    const thread = new MainThreadCommentThread(
      commentThreadHandle,
      this.handle,
      extensionId,
      threadId,
      URI.revive(resource).toString(),
      range,
      comments,
      true,
      isTemplate,
      editorId
    );
    this._threads.set(commentThreadHandle, thread);
    if (thread.isDocumentCommentThread()) {
      this._commentService.updateComments(this._uniqueId, {
        added: [thread],
        removed: [],
        changed: [],
        pending: []
      });
    } else {
      this._commentService.updateNotebookComments(this._uniqueId, {
        added: [thread],
        removed: [],
        changed: [],
        pending: []
      });
    }
    return thread;
  }
  updateCommentThread(commentThreadHandle, threadId, resource, changes) {
    const thread = this.getKnownThread(commentThreadHandle);
    thread.batchUpdate(changes);
    if (thread.isDocumentCommentThread()) {
      this._commentService.updateComments(this._uniqueId, {
        added: [],
        removed: [],
        changed: [thread],
        pending: []
      });
    } else {
      this._commentService.updateNotebookComments(this._uniqueId, {
        added: [],
        removed: [],
        changed: [thread],
        pending: []
      });
    }
  }
  deleteCommentThread(commentThreadHandle) {
    const thread = this.getKnownThread(commentThreadHandle);
    this._threads.delete(commentThreadHandle);
    thread.dispose();
    if (thread.isDocumentCommentThread()) {
      this._commentService.updateComments(this._uniqueId, {
        added: [],
        removed: [thread],
        changed: [],
        pending: []
      });
    } else {
      this._commentService.updateNotebookComments(this._uniqueId, {
        added: [],
        removed: [thread],
        changed: [],
        pending: []
      });
    }
  }
  deleteCommentThreadMain(commentThreadId) {
    this._threads.forEach((thread) => {
      if (thread.threadId === commentThreadId) {
        this._proxy.$deleteCommentThread(
          this._handle,
          thread.commentThreadHandle
        );
      }
    });
  }
  updateInput(input) {
    const thread = this.activeEditingCommentThread;
    if (thread && thread.input) {
      const commentInput = thread.input;
      commentInput.value = input;
      thread.input = commentInput;
    }
  }
  updateCommentingRanges(resourceHints) {
    this._commentService.updateCommentingRanges(
      this._uniqueId,
      resourceHints
    );
  }
  getKnownThread(commentThreadHandle) {
    const thread = this._threads.get(commentThreadHandle);
    if (!thread) {
      throw new Error("unknown thread");
    }
    return thread;
  }
  async getDocumentComments(resource, token) {
    if (resource.scheme === Schemas.vscodeNotebookCell) {
      return {
        uniqueOwner: this._uniqueId,
        label: this.label,
        threads: [],
        commentingRanges: {
          resource,
          ranges: [],
          fileComments: false
        }
      };
    }
    const ret = [];
    for (const thread of [...this._threads.keys()]) {
      const commentThread = this._threads.get(thread);
      if (commentThread.resource === resource.toString()) {
        if (commentThread.isDocumentCommentThread()) {
          ret.push(commentThread);
        }
      }
    }
    const commentingRanges = await this._proxy.$provideCommentingRanges(
      this.handle,
      resource,
      token
    );
    return {
      uniqueOwner: this._uniqueId,
      label: this.label,
      threads: ret,
      commentingRanges: {
        resource,
        ranges: commentingRanges?.ranges || [],
        fileComments: !!commentingRanges?.fileComments
      }
    };
  }
  async getNotebookComments(resource, token) {
    if (resource.scheme !== Schemas.vscodeNotebookCell) {
      return {
        uniqueOwner: this._uniqueId,
        label: this.label,
        threads: []
      };
    }
    const ret = [];
    for (const thread of [...this._threads.keys()]) {
      const commentThread = this._threads.get(thread);
      if (commentThread.resource === resource.toString()) {
        if (!commentThread.isDocumentCommentThread()) {
          ret.push(
            commentThread
          );
        }
      }
    }
    return {
      uniqueOwner: this._uniqueId,
      label: this.label,
      threads: ret
    };
  }
  async toggleReaction(uri, thread, comment, reaction, token) {
    return this._proxy.$toggleReaction(
      this._handle,
      thread.commentThreadHandle,
      uri,
      comment,
      reaction
    );
  }
  getAllComments() {
    const ret = [];
    for (const thread of [...this._threads.keys()]) {
      ret.push(this._threads.get(thread));
    }
    return ret;
  }
  createCommentThreadTemplate(resource, range, editorId) {
    return this._proxy.$createCommentThreadTemplate(
      this.handle,
      resource,
      range,
      editorId
    );
  }
  async updateCommentThreadTemplate(threadHandle, range) {
    await this._proxy.$updateCommentThreadTemplate(
      this.handle,
      threadHandle,
      range
    );
  }
  toJSON() {
    return {
      $mid: MarshalledId.CommentController,
      handle: this.handle
    };
  }
}
const commentsViewIcon = registerIcon(
  "comments-view-icon",
  Codicon.commentDiscussion,
  localize("commentsViewIcon", "View icon of the comments view.")
);
let MainThreadComments = class extends Disposable {
  constructor(extHostContext, _commentService, _viewsService, _viewDescriptorService, _uriIdentityService, _editorService) {
    super();
    this._commentService = _commentService;
    this._viewsService = _viewsService;
    this._viewDescriptorService = _viewDescriptorService;
    this._uriIdentityService = _uriIdentityService;
    this._editorService = _editorService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostComments);
    this._commentService.unregisterCommentController();
    this._register(this._commentService.onDidChangeActiveEditingCommentThread(async (thread) => {
      const handle = thread.controllerHandle;
      const controller = this._commentControllers.get(handle);
      if (!controller) {
        return;
      }
      this._activeEditingCommentThreadDisposables.clear();
      this._activeEditingCommentThread = thread;
      controller.activeEditingCommentThread = this._activeEditingCommentThread;
    }));
  }
  _proxy;
  _handlers = /* @__PURE__ */ new Map();
  _commentControllers = /* @__PURE__ */ new Map();
  _activeEditingCommentThread;
  _activeEditingCommentThreadDisposables = this._register(
    new DisposableStore()
  );
  _openViewListener = null;
  $registerCommentController(handle, id, label, extensionId) {
    const providerId = `${id}-${extensionId}`;
    this._handlers.set(handle, providerId);
    const provider = new MainThreadCommentController(
      this._proxy,
      this._commentService,
      handle,
      providerId,
      id,
      label,
      {}
    );
    this._commentService.registerCommentController(providerId, provider);
    this._commentControllers.set(handle, provider);
    const commentsPanelAlreadyConstructed = !!this._viewDescriptorService.getViewDescriptorById(
      COMMENTS_VIEW_ID
    );
    if (!commentsPanelAlreadyConstructed) {
      this.registerView(commentsPanelAlreadyConstructed);
    }
    this.registerViewListeners(commentsPanelAlreadyConstructed);
    this._commentService.setWorkspaceComments(String(handle), []);
  }
  $unregisterCommentController(handle) {
    const providerId = this._handlers.get(handle);
    this._handlers.delete(handle);
    this._commentControllers.delete(handle);
    if (typeof providerId !== "string") {
      return;
    } else {
      this._commentService.unregisterCommentController(providerId);
    }
  }
  $updateCommentControllerFeatures(handle, features) {
    const provider = this._commentControllers.get(handle);
    if (!provider) {
      return void 0;
    }
    provider.updateFeatures(features);
  }
  $createCommentThread(handle, commentThreadHandle, threadId, resource, range, comments, extensionId, isTemplate, editorId) {
    const provider = this._commentControllers.get(handle);
    if (!provider) {
      return void 0;
    }
    return provider.createCommentThread(
      extensionId.value,
      commentThreadHandle,
      threadId,
      resource,
      range,
      comments,
      isTemplate,
      editorId
    );
  }
  $updateCommentThread(handle, commentThreadHandle, threadId, resource, changes) {
    const provider = this._commentControllers.get(handle);
    if (!provider) {
      return void 0;
    }
    return provider.updateCommentThread(
      commentThreadHandle,
      threadId,
      resource,
      changes
    );
  }
  $deleteCommentThread(handle, commentThreadHandle) {
    const provider = this._commentControllers.get(handle);
    if (!provider) {
      return;
    }
    return provider.deleteCommentThread(commentThreadHandle);
  }
  $updateCommentingRanges(handle, resourceHints) {
    const provider = this._commentControllers.get(handle);
    if (!provider) {
      return;
    }
    provider.updateCommentingRanges(resourceHints);
  }
  async $revealCommentThread(handle, commentThreadHandle, commentUniqueIdInThread, options) {
    const provider = this._commentControllers.get(handle);
    if (!provider) {
      return Promise.resolve();
    }
    const thread = provider.getAllComments().find(
      (thread2) => thread2.commentThreadHandle === commentThreadHandle
    );
    if (!thread || !thread.isDocumentCommentThread()) {
      return Promise.resolve();
    }
    const comment = thread.comments?.find(
      (comment2) => comment2.uniqueIdInThread === commentUniqueIdInThread
    );
    revealCommentThread(
      this._commentService,
      this._editorService,
      this._uriIdentityService,
      thread,
      comment,
      options.focusReply,
      void 0,
      options.preserveFocus
    );
  }
  async $hideCommentThread(handle, commentThreadHandle) {
    const provider = this._commentControllers.get(handle);
    if (!provider) {
      return Promise.resolve();
    }
    const thread = provider.getAllComments().find(
      (thread2) => thread2.commentThreadHandle === commentThreadHandle
    );
    if (!thread || !thread.isDocumentCommentThread()) {
      return Promise.resolve();
    }
    thread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
  }
  registerView(commentsViewAlreadyRegistered) {
    if (!commentsViewAlreadyRegistered) {
      const VIEW_CONTAINER = Registry.as(
        ViewExtensions.ViewContainersRegistry
      ).registerViewContainer(
        {
          id: COMMENTS_VIEW_ID,
          title: COMMENTS_VIEW_TITLE,
          ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [
            COMMENTS_VIEW_ID,
            { mergeViewWithContainerWhenSingleView: true }
          ]),
          storageId: COMMENTS_VIEW_STORAGE_ID,
          hideIfEmpty: true,
          icon: commentsViewIcon,
          order: 10
        },
        ViewContainerLocation.Panel
      );
      Registry.as(
        ViewExtensions.ViewsRegistry
      ).registerViews(
        [
          {
            id: COMMENTS_VIEW_ID,
            name: COMMENTS_VIEW_TITLE,
            canToggleVisibility: false,
            ctorDescriptor: new SyncDescriptor(CommentsPanel),
            canMoveView: true,
            containerIcon: commentsViewIcon,
            focusCommand: {
              id: "workbench.action.focusCommentsPanel"
            }
          }
        ],
        VIEW_CONTAINER
      );
    }
  }
  setComments() {
    [...this._commentControllers.keys()].forEach((handle) => {
      const threads = this._commentControllers.get(handle).getAllComments();
      if (threads.length) {
        const providerId = this.getHandler(handle);
        this._commentService.setWorkspaceComments(providerId, threads);
      }
    });
  }
  registerViewOpenedListener() {
    if (!this._openViewListener) {
      this._openViewListener = this._viewsService.onDidChangeViewVisibility((e) => {
        if (e.id === COMMENTS_VIEW_ID && e.visible) {
          this.setComments();
          if (this._openViewListener) {
            this._openViewListener.dispose();
            this._openViewListener = null;
          }
        }
      });
    }
  }
  /**
   * If the comments view has never been opened, the constructor for it has not yet run so it has
   * no listeners for comment threads being set or updated. Listen for the view opening for the
   * first time and send it comments then.
   */
  registerViewListeners(commentsPanelAlreadyConstructed) {
    if (!commentsPanelAlreadyConstructed) {
      this.registerViewOpenedListener();
    }
    this._register(
      this._viewDescriptorService.onDidChangeContainer((e) => {
        if (e.views.find((view) => view.id === COMMENTS_VIEW_ID)) {
          this.setComments();
          this.registerViewOpenedListener();
        }
      })
    );
    this._register(
      this._viewDescriptorService.onDidChangeContainerLocation((e) => {
        const commentsContainer = this._viewDescriptorService.getViewContainerByViewId(
          COMMENTS_VIEW_ID
        );
        if (e.viewContainer.id === commentsContainer?.id) {
          this.setComments();
          this.registerViewOpenedListener();
        }
      })
    );
  }
  getHandler(handle) {
    if (!this._handlers.has(handle)) {
      throw new Error("Unknown handler");
    }
    return this._handlers.get(handle);
  }
};
__name(MainThreadComments, "MainThreadComments");
MainThreadComments = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadComments),
  __decorateParam(1, ICommentService),
  __decorateParam(2, IViewsService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IEditorService)
], MainThreadComments);
export {
  MainThreadCommentController,
  MainThreadCommentThread,
  MainThreadComments
};
//# sourceMappingURL=mainThreadComments.js.map
