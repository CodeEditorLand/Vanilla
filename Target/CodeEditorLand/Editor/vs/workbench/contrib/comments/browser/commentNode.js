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
import { DomEmitter } from "../../../../base/browser/event.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import {
  ActionViewItem
} from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import {
  ActionBar,
  ActionsOrientation
} from "../../../../base/browser/ui/actionbar/actionbar.js";
import { AnchorAlignment } from "../../../../base/browser/ui/contextview/contextview.js";
import { DropdownMenuActionViewItem } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from "../../../../base/browser/ui/mouseCursor/mouseCursor.js";
import { SmoothScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { ToolBar } from "../../../../base/browser/ui/toolbar/toolbar.js";
import {
  Action,
  ActionRunner,
  Separator
} from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  dispose
} from "../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import { FileAccess, Schemas } from "../../../../base/common/network.js";
import {
  Scrollable,
  ScrollbarVisibility
} from "../../../../base/common/scrollable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import * as languages from "../../../../editor/common/languages.js";
import {
  ITextModelService
} from "../../../../editor/common/services/resolverService.js";
import * as nls from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import {
  MenuEntryActionViewItem,
  SubmenuEntryActionViewItem
} from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  MenuId,
  MenuItemAction,
  SubmenuItemAction
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { CommentContextKeys } from "../common/commentContextKeys.js";
import {
  COMMENTS_SECTION
} from "../common/commentsConfiguration.js";
import { CommentFormActions } from "./commentFormActions.js";
import { ICommentService } from "./commentService.js";
import {
  ReactionAction,
  ReactionActionViewItem,
  ToggleReactionsAction
} from "./reactionsAction.js";
import {
  MIN_EDITOR_HEIGHT,
  SimpleCommentEditor,
  calculateEditorHeight
} from "./simpleCommentEditor.js";
import { TimestampWidget } from "./timestamp.js";
class CommentsActionRunner extends ActionRunner {
  static {
    __name(this, "CommentsActionRunner");
  }
  async runAction(action, context) {
    await action.run(...context);
  }
}
let CommentNode = class extends Disposable {
  constructor(parentEditor, commentThread, comment, pendingEdit, owner, resource, parentThread, markdownRenderer, instantiationService, commentService, notificationService, contextMenuService, contextKeyService, configurationService, hoverService, accessibilityService, keybindingService, textModelService) {
    super();
    this.parentEditor = parentEditor;
    this.commentThread = commentThread;
    this.comment = comment;
    this.pendingEdit = pendingEdit;
    this.owner = owner;
    this.resource = resource;
    this.parentThread = parentThread;
    this.markdownRenderer = markdownRenderer;
    this.instantiationService = instantiationService;
    this.commentService = commentService;
    this.notificationService = notificationService;
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.accessibilityService = accessibilityService;
    this.keybindingService = keybindingService;
    this.textModelService = textModelService;
    this._domNode = dom.$("div.review-comment");
    this._contextKeyService = this._register(
      contextKeyService.createScoped(this._domNode)
    );
    this._commentContextValue = CommentContextKeys.commentContext.bindTo(
      this._contextKeyService
    );
    if (this.comment.contextValue) {
      this._commentContextValue.set(this.comment.contextValue);
    }
    this._commentMenus = this.commentService.getCommentMenus(this.owner);
    this._domNode.tabIndex = -1;
    this._avatar = dom.append(this._domNode, dom.$("div.avatar-container"));
    this.updateCommentUserIcon(this.comment.userIconPath);
    this._commentDetailsContainer = dom.append(
      this._domNode,
      dom.$(".review-comment-contents")
    );
    this.createHeader(this._commentDetailsContainer);
    this._body = document.createElement(`div`);
    this._body.classList.add(
      "comment-body",
      MOUSE_CURSOR_TEXT_CSS_CLASS_NAME
    );
    if (configurationService.getValue(
      COMMENTS_SECTION
    )?.maxHeight !== false) {
      this._body.classList.add("comment-body-max-height");
    }
    this.createScroll(this._commentDetailsContainer, this._body);
    this.updateCommentBody(this.comment.body);
    if (this.comment.commentReactions && this.comment.commentReactions.length && this.comment.commentReactions.filter((reaction) => !!reaction.count).length) {
      this.createReactionsContainer(this._commentDetailsContainer);
    }
    this._domNode.setAttribute(
      "aria-label",
      `${comment.userName}, ${this.commentBodyValue}`
    );
    this._domNode.setAttribute("role", "treeitem");
    this._clearTimeout = null;
    this._register(
      dom.addDisposableListener(
        this._domNode,
        dom.EventType.CLICK,
        () => this.isEditing || this._onDidClick.fire(this)
      )
    );
    this._register(
      dom.addDisposableListener(
        this._domNode,
        dom.EventType.CONTEXT_MENU,
        (e) => {
          return this.onContextMenu(e);
        }
      )
    );
    if (pendingEdit) {
      this.switchToEditMode();
    }
    this._register(
      this.accessibilityService.onDidChangeScreenReaderOptimized(() => {
        this.toggleToolbarHidden(true);
      })
    );
    this.activeCommentListeners();
  }
  static {
    __name(this, "CommentNode");
  }
  _domNode;
  _body;
  _avatar;
  _md;
  _plainText;
  _clearTimeout;
  _editAction = null;
  _commentEditContainer = null;
  _commentDetailsContainer;
  _actionsToolbarContainer;
  _reactionsActionBar;
  _reactionActionsContainer;
  _commentEditor = null;
  _commentEditorDisposables = [];
  _commentEditorModel = null;
  _editorHeight = MIN_EDITOR_HEIGHT;
  _isPendingLabel;
  _timestamp;
  _timestampWidget;
  _contextKeyService;
  _commentContextValue;
  _commentMenus;
  _scrollable;
  _scrollableElement;
  actionRunner;
  toolbar;
  _commentFormActions = null;
  _commentEditorActions = null;
  _onDidClick = new Emitter();
  get domNode() {
    return this._domNode;
  }
  isEditing = false;
  activeCommentListeners() {
    this._register(
      dom.addDisposableListener(
        this._domNode,
        dom.EventType.FOCUS_IN,
        () => {
          this.commentService.setActiveCommentAndThread(this.owner, {
            thread: this.commentThread,
            comment: this.comment
          });
        },
        true
      )
    );
  }
  createScroll(container, body) {
    this._scrollable = new Scrollable({
      forceIntegerValues: true,
      smoothScrollDuration: 125,
      scheduleAtNextAnimationFrame: /* @__PURE__ */ __name((cb) => dom.scheduleAtNextAnimationFrame(dom.getWindow(container), cb), "scheduleAtNextAnimationFrame")
    });
    this._scrollableElement = this._register(
      new SmoothScrollableElement(
        body,
        {
          horizontal: ScrollbarVisibility.Visible,
          vertical: ScrollbarVisibility.Visible
        },
        this._scrollable
      )
    );
    this._register(
      this._scrollableElement.onScroll((e) => {
        if (e.scrollLeftChanged) {
          body.scrollLeft = e.scrollLeft;
        }
        if (e.scrollTopChanged) {
          body.scrollTop = e.scrollTop;
        }
      })
    );
    const onDidScrollViewContainer = this._register(
      new DomEmitter(body, "scroll")
    ).event;
    this._register(
      onDidScrollViewContainer((_) => {
        const position = this._scrollableElement.getScrollPosition();
        const scrollLeft = Math.abs(body.scrollLeft - position.scrollLeft) <= 1 ? void 0 : body.scrollLeft;
        const scrollTop = Math.abs(body.scrollTop - position.scrollTop) <= 1 ? void 0 : body.scrollTop;
        if (scrollLeft !== void 0 || scrollTop !== void 0) {
          this._scrollableElement.setScrollPosition({
            scrollLeft,
            scrollTop
          });
        }
      })
    );
    container.appendChild(this._scrollableElement.getDomNode());
  }
  updateCommentBody(body) {
    this._body.innerText = "";
    this._md = void 0;
    this._plainText = void 0;
    if (typeof body === "string") {
      this._plainText = dom.append(
        this._body,
        dom.$(".comment-body-plainstring")
      );
      this._plainText.innerText = body;
    } else {
      this._md = this.markdownRenderer.render(body).element;
      this._body.appendChild(this._md);
    }
  }
  updateCommentUserIcon(userIconPath) {
    this._avatar.textContent = "";
    if (userIconPath) {
      const img = dom.append(this._avatar, dom.$("img.avatar"));
      img.src = FileAccess.uriToBrowserUri(
        URI.revive(userIconPath)
      ).toString(true);
      img.onerror = (_) => img.remove();
    }
  }
  get onDidClick() {
    return this._onDidClick.event;
  }
  createTimestamp(container) {
    this._timestamp = dom.append(
      container,
      dom.$("span.timestamp-container")
    );
    this.updateTimestamp(this.comment.timestamp);
  }
  updateTimestamp(raw) {
    if (!this._timestamp) {
      return;
    }
    const timestamp = raw !== void 0 ? new Date(raw) : void 0;
    if (timestamp) {
      if (this._timestampWidget) {
        this._timestampWidget.setTimestamp(timestamp);
      } else {
        this._timestampWidget = new TimestampWidget(
          this.configurationService,
          this.hoverService,
          this._timestamp,
          timestamp
        );
        this._register(this._timestampWidget);
      }
    } else {
      this._timestampWidget?.dispose();
    }
  }
  createHeader(commentDetailsContainer) {
    const header = dom.append(
      commentDetailsContainer,
      dom.$(`div.comment-title.${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`)
    );
    const infoContainer = dom.append(header, dom.$("comment-header-info"));
    const author = dom.append(infoContainer, dom.$("strong.author"));
    author.innerText = this.comment.userName;
    this.createTimestamp(infoContainer);
    this._isPendingLabel = dom.append(
      infoContainer,
      dom.$("span.isPending")
    );
    if (this.comment.label) {
      this._isPendingLabel.innerText = this.comment.label;
    } else {
      this._isPendingLabel.innerText = "";
    }
    this._actionsToolbarContainer = dom.append(
      header,
      dom.$(".comment-actions")
    );
    this.toggleToolbarHidden(true);
    this.createActionsToolbar();
  }
  toggleToolbarHidden(hidden) {
    if (hidden && !this.accessibilityService.isScreenReaderOptimized()) {
      this._actionsToolbarContainer.classList.add("hidden");
    } else {
      this._actionsToolbarContainer.classList.remove("hidden");
    }
  }
  getToolbarActions(menu) {
    const contributedActions = menu.getActions({ shouldForwardArgs: true });
    const primary = [];
    const secondary = [];
    const result = { primary, secondary };
    fillInActions(
      contributedActions,
      result,
      false,
      (g) => /^inline/.test(g)
    );
    return result;
  }
  get commentNodeContext() {
    return [
      {
        thread: this.commentThread,
        commentUniqueId: this.comment.uniqueIdInThread,
        $mid: MarshalledId.CommentNode
      },
      {
        commentControlHandle: this.commentThread.controllerHandle,
        commentThreadHandle: this.commentThread.commentThreadHandle,
        $mid: MarshalledId.CommentThread
      }
    ];
  }
  createToolbar() {
    this.toolbar = new ToolBar(
      this._actionsToolbarContainer,
      this.contextMenuService,
      {
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
          if (action.id === ToggleReactionsAction.ID) {
            return new DropdownMenuActionViewItem(
              action,
              action.menuActions,
              this.contextMenuService,
              {
                ...options,
                actionViewItemProvider: /* @__PURE__ */ __name((action2, options2) => this.actionViewItemProvider(
                  action2,
                  options2
                ), "actionViewItemProvider"),
                actionRunner: this.actionRunner,
                classNames: [
                  "toolbar-toggle-pickReactions",
                  ...ThemeIcon.asClassNameArray(
                    Codicon.reactions
                  )
                ],
                anchorAlignmentProvider: /* @__PURE__ */ __name(() => AnchorAlignment.RIGHT, "anchorAlignmentProvider")
              }
            );
          }
          return this.actionViewItemProvider(
            action,
            options
          );
        }, "actionViewItemProvider"),
        orientation: ActionsOrientation.HORIZONTAL
      }
    );
    this.toolbar.context = this.commentNodeContext;
    this.toolbar.actionRunner = new CommentsActionRunner();
    this.registerActionBarListeners(this._actionsToolbarContainer);
    this._register(this.toolbar);
  }
  createActionsToolbar() {
    const actions = [];
    const hasReactionHandler = this.commentService.hasReactionHandler(
      this.owner
    );
    if (hasReactionHandler) {
      const toggleReactionAction = this.createReactionPicker(
        this.comment.commentReactions || []
      );
      actions.push(toggleReactionAction);
    }
    const menu = this._commentMenus.getCommentTitleActions(
      this.comment,
      this._contextKeyService
    );
    this._register(menu);
    this._register(
      menu.onDidChange((e) => {
        const { primary: primary2, secondary: secondary2 } = this.getToolbarActions(menu);
        if (!this.toolbar && (primary2.length || secondary2.length)) {
          this.createToolbar();
        }
        this.toolbar.setActions(primary2, secondary2);
      })
    );
    const { primary, secondary } = this.getToolbarActions(menu);
    actions.push(...primary);
    if (actions.length || secondary.length) {
      this.createToolbar();
      this.toolbar.setActions(actions, secondary);
    }
  }
  actionViewItemProvider(action, options) {
    if (action.id === ToggleReactionsAction.ID) {
      options = { label: false, icon: true };
    } else {
      options = { label: false, icon: true };
    }
    if (action.id === ReactionAction.ID) {
      const item = new ReactionActionViewItem(action);
      return item;
    } else if (action instanceof MenuItemAction) {
      return this.instantiationService.createInstance(
        MenuEntryActionViewItem,
        action,
        { hoverDelegate: options.hoverDelegate }
      );
    } else if (action instanceof SubmenuItemAction) {
      return this.instantiationService.createInstance(
        SubmenuEntryActionViewItem,
        action,
        options
      );
    } else {
      const item = new ActionViewItem({}, action, options);
      return item;
    }
  }
  async submitComment() {
    if (this._commentEditor && this._commentFormActions) {
      await this._commentFormActions.triggerDefaultAction();
      this.pendingEdit = void 0;
    }
  }
  createReactionPicker(reactionGroup) {
    const toggleReactionAction = this._register(
      new ToggleReactionsAction(
        () => {
          toggleReactionActionViewItem?.show();
        },
        nls.localize("commentToggleReaction", "Toggle Reaction")
      )
    );
    let reactionMenuActions = [];
    if (reactionGroup && reactionGroup.length) {
      reactionMenuActions = reactionGroup.map((reaction) => {
        return new Action(
          `reaction.command.${reaction.label}`,
          `${reaction.label}`,
          "",
          true,
          async () => {
            try {
              await this.commentService.toggleReaction(
                this.owner,
                this.resource,
                this.commentThread,
                this.comment,
                reaction
              );
            } catch (e) {
              const error = e.message ? nls.localize(
                "commentToggleReactionError",
                "Toggling the comment reaction failed: {0}.",
                e.message
              ) : nls.localize(
                "commentToggleReactionDefaultError",
                "Toggling the comment reaction failed"
              );
              this.notificationService.error(error);
            }
          }
        );
      });
    }
    toggleReactionAction.menuActions = reactionMenuActions;
    const toggleReactionActionViewItem = new DropdownMenuActionViewItem(
      toggleReactionAction,
      toggleReactionAction.menuActions,
      this.contextMenuService,
      {
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
          if (action.id === ToggleReactionsAction.ID) {
            return toggleReactionActionViewItem;
          }
          return this.actionViewItemProvider(
            action,
            options
          );
        }, "actionViewItemProvider"),
        actionRunner: this.actionRunner,
        classNames: "toolbar-toggle-pickReactions",
        anchorAlignmentProvider: /* @__PURE__ */ __name(() => AnchorAlignment.RIGHT, "anchorAlignmentProvider")
      }
    );
    return toggleReactionAction;
  }
  createReactionsContainer(commentDetailsContainer) {
    this._reactionActionsContainer = dom.append(
      commentDetailsContainer,
      dom.$("div.comment-reactions")
    );
    this._reactionsActionBar = new ActionBar(
      this._reactionActionsContainer,
      {
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
          if (action.id === ToggleReactionsAction.ID) {
            return new DropdownMenuActionViewItem(
              action,
              action.menuActions,
              this.contextMenuService,
              {
                actionViewItemProvider: /* @__PURE__ */ __name((action2, options2) => this.actionViewItemProvider(
                  action2,
                  options2
                ), "actionViewItemProvider"),
                actionRunner: this.actionRunner,
                classNames: [
                  "toolbar-toggle-pickReactions",
                  ...ThemeIcon.asClassNameArray(
                    Codicon.reactions
                  )
                ],
                anchorAlignmentProvider: /* @__PURE__ */ __name(() => AnchorAlignment.RIGHT, "anchorAlignmentProvider")
              }
            );
          }
          return this.actionViewItemProvider(
            action,
            options
          );
        }, "actionViewItemProvider")
      }
    );
    this._register(this._reactionsActionBar);
    const hasReactionHandler = this.commentService.hasReactionHandler(
      this.owner
    );
    this.comment.commentReactions.filter((reaction) => !!reaction.count).map((reaction) => {
      const action = new ReactionAction(
        `reaction.${reaction.label}`,
        `${reaction.label}`,
        reaction.hasReacted && (reaction.canEdit || hasReactionHandler) ? "active" : "",
        reaction.canEdit || hasReactionHandler,
        async () => {
          try {
            await this.commentService.toggleReaction(
              this.owner,
              this.resource,
              this.commentThread,
              this.comment,
              reaction
            );
          } catch (e) {
            let error;
            if (reaction.hasReacted) {
              error = e.message ? nls.localize(
                "commentDeleteReactionError",
                "Deleting the comment reaction failed: {0}.",
                e.message
              ) : nls.localize(
                "commentDeleteReactionDefaultError",
                "Deleting the comment reaction failed"
              );
            } else {
              error = e.message ? nls.localize(
                "commentAddReactionError",
                "Deleting the comment reaction failed: {0}.",
                e.message
              ) : nls.localize(
                "commentAddReactionDefaultError",
                "Deleting the comment reaction failed"
              );
            }
            this.notificationService.error(error);
          }
        },
        reaction.reactors,
        reaction.iconPath,
        reaction.count
      );
      this._reactionsActionBar?.push(action, {
        label: true,
        icon: true
      });
    });
    if (hasReactionHandler) {
      const toggleReactionAction = this.createReactionPicker(
        this.comment.commentReactions || []
      );
      this._reactionsActionBar.push(toggleReactionAction, {
        label: false,
        icon: true
      });
    }
  }
  get commentBodyValue() {
    return typeof this.comment.body === "string" ? this.comment.body : this.comment.body.value;
  }
  async createCommentEditor(editContainer) {
    const container = dom.append(editContainer, dom.$(".edit-textarea"));
    this._commentEditor = this.instantiationService.createInstance(
      SimpleCommentEditor,
      container,
      SimpleCommentEditor.getEditorOptions(this.configurationService),
      this._contextKeyService,
      this.parentThread
    );
    const resource = URI.from({
      scheme: Schemas.commentsInput,
      path: `/commentinput-${this.comment.uniqueIdInThread}-${Date.now()}.md`
    });
    const modelRef = await this.textModelService.createModelReference(resource);
    this._commentEditorModel = modelRef;
    this._commentEditor.setModel(
      this._commentEditorModel.object.textEditorModel
    );
    this._commentEditor.setValue(this.pendingEdit ?? this.commentBodyValue);
    this.pendingEdit = void 0;
    this._commentEditor.layout({
      width: container.clientWidth - 14,
      height: this._editorHeight
    });
    this._commentEditor.focus();
    dom.scheduleAtNextAnimationFrame(dom.getWindow(editContainer), () => {
      this._commentEditor.layout({
        width: container.clientWidth - 14,
        height: this._editorHeight
      });
      this._commentEditor.focus();
    });
    const lastLine = this._commentEditorModel.object.textEditorModel.getLineCount();
    const lastColumn = this._commentEditorModel.object.textEditorModel.getLineLength(
      lastLine
    ) + 1;
    this._commentEditor.setSelection(
      new Selection(lastLine, lastColumn, lastLine, lastColumn)
    );
    const commentThread = this.commentThread;
    commentThread.input = {
      uri: this._commentEditor.getModel().uri,
      value: this.commentBodyValue
    };
    this.commentService.setActiveEditingCommentThread(commentThread);
    this.commentService.setActiveCommentAndThread(this.owner, {
      thread: commentThread,
      comment: this.comment
    });
    this._commentEditorDisposables.push(
      this._commentEditor.onDidFocusEditorWidget(() => {
        commentThread.input = {
          uri: this._commentEditor.getModel().uri,
          value: this.commentBodyValue
        };
        this.commentService.setActiveEditingCommentThread(
          commentThread
        );
        this.commentService.setActiveCommentAndThread(this.owner, {
          thread: commentThread,
          comment: this.comment
        });
      })
    );
    this._commentEditorDisposables.push(
      this._commentEditor.onDidChangeModelContent((e) => {
        if (commentThread.input && this._commentEditor && this._commentEditor.getModel().uri === commentThread.input.uri) {
          const newVal = this._commentEditor.getValue();
          if (newVal !== commentThread.input.value) {
            const input = commentThread.input;
            input.value = newVal;
            commentThread.input = input;
            this.commentService.setActiveEditingCommentThread(
              commentThread
            );
            this.commentService.setActiveCommentAndThread(
              this.owner,
              { thread: commentThread, comment: this.comment }
            );
          }
        }
      })
    );
    this.calculateEditorHeight();
    this._register(
      this._commentEditorModel.object.textEditorModel.onDidChangeContent(
        () => {
          if (this._commentEditor && this.calculateEditorHeight()) {
            this._commentEditor.layout({
              height: this._editorHeight,
              width: this._commentEditor.getLayoutInfo().width
            });
            this._commentEditor.render(true);
          }
        }
      )
    );
    this._register(this._commentEditor);
    this._register(this._commentEditorModel);
  }
  calculateEditorHeight() {
    if (this._commentEditor) {
      const newEditorHeight = calculateEditorHeight(
        this.parentEditor,
        this._commentEditor,
        this._editorHeight
      );
      if (newEditorHeight !== this._editorHeight) {
        this._editorHeight = newEditorHeight;
        return true;
      }
    }
    return false;
  }
  getPendingEdit() {
    const model = this._commentEditor?.getModel();
    if (model && model.getValueLength() > 0) {
      return model.getValue();
    }
    return void 0;
  }
  removeCommentEditor() {
    this.isEditing = false;
    if (this._editAction) {
      this._editAction.enabled = true;
    }
    this._body.classList.remove("hidden");
    this._commentEditorModel?.dispose();
    dispose(this._commentEditorDisposables);
    this._commentEditorDisposables = [];
    this._commentEditor?.dispose();
    this._commentEditor = null;
    this._commentEditContainer.remove();
  }
  layout(widthInPixel) {
    const editorWidth = widthInPixel !== void 0 ? widthInPixel - 72 : this._commentEditor?.getLayoutInfo().width ?? 0;
    this._commentEditor?.layout({
      width: editorWidth,
      height: this._editorHeight
    });
    const scrollWidth = this._body.scrollWidth;
    const width = dom.getContentWidth(this._body);
    const scrollHeight = this._body.scrollHeight;
    const height = dom.getContentHeight(this._body) + 4;
    this._scrollableElement.setScrollDimensions({
      width,
      scrollWidth,
      height,
      scrollHeight
    });
  }
  async switchToEditMode() {
    if (this.isEditing) {
      return;
    }
    this.isEditing = true;
    this._body.classList.add("hidden");
    this._commentEditContainer = dom.append(
      this._commentDetailsContainer,
      dom.$(".edit-container")
    );
    await this.createCommentEditor(this._commentEditContainer);
    const formActions = dom.append(
      this._commentEditContainer,
      dom.$(".form-actions")
    );
    const otherActions = dom.append(formActions, dom.$(".other-actions"));
    this.createCommentWidgetFormActions(otherActions);
    const editorActions = dom.append(formActions, dom.$(".editor-actions"));
    this.createCommentWidgetEditorActions(editorActions);
  }
  createCommentWidgetFormActions(container) {
    const menus = this.commentService.getCommentMenus(this.owner);
    const menu = menus.getCommentActions(
      this.comment,
      this._contextKeyService
    );
    this._register(menu);
    this._register(
      menu.onDidChange(() => {
        this._commentFormActions?.setActions(menu);
      })
    );
    this._commentFormActions = new CommentFormActions(
      this.keybindingService,
      this._contextKeyService,
      container,
      (action) => {
        const text = this._commentEditor.getValue();
        action.run({
          thread: this.commentThread,
          commentUniqueId: this.comment.uniqueIdInThread,
          text,
          $mid: MarshalledId.CommentThreadNode
        });
        this.removeCommentEditor();
      }
    );
    this._register(this._commentFormActions);
    this._commentFormActions.setActions(menu);
  }
  createCommentWidgetEditorActions(container) {
    const menus = this.commentService.getCommentMenus(this.owner);
    const menu = menus.getCommentEditorActions(this._contextKeyService);
    this._register(menu);
    this._register(
      menu.onDidChange(() => {
        this._commentEditorActions?.setActions(menu);
      })
    );
    this._commentEditorActions = new CommentFormActions(
      this.keybindingService,
      this._contextKeyService,
      container,
      (action) => {
        const text = this._commentEditor.getValue();
        action.run({
          thread: this.commentThread,
          commentUniqueId: this.comment.uniqueIdInThread,
          text,
          $mid: MarshalledId.CommentThreadNode
        });
        this._commentEditor?.focus();
      }
    );
    this._register(this._commentEditorActions);
    this._commentEditorActions.setActions(menu, true);
  }
  setFocus(focused, visible = false) {
    if (focused) {
      this._domNode.focus();
      this.toggleToolbarHidden(false);
      this._actionsToolbarContainer.classList.add("tabfocused");
      this._domNode.tabIndex = 0;
      if (this.comment.mode === languages.CommentMode.Editing) {
        this._commentEditor?.focus();
      }
    } else {
      if (this._actionsToolbarContainer.classList.contains(
        "tabfocused"
      ) && !this._actionsToolbarContainer.classList.contains("mouseover")) {
        this.toggleToolbarHidden(true);
        this._domNode.tabIndex = -1;
      }
      this._actionsToolbarContainer.classList.remove("tabfocused");
    }
  }
  registerActionBarListeners(actionsContainer) {
    this._register(
      dom.addDisposableListener(this._domNode, "mouseenter", () => {
        this.toggleToolbarHidden(false);
        actionsContainer.classList.add("mouseover");
      })
    );
    this._register(
      dom.addDisposableListener(this._domNode, "mouseleave", () => {
        if (actionsContainer.classList.contains("mouseover") && !actionsContainer.classList.contains("tabfocused")) {
          this.toggleToolbarHidden(true);
        }
        actionsContainer.classList.remove("mouseover");
      })
    );
  }
  async update(newComment) {
    if (newComment.body !== this.comment.body) {
      this.updateCommentBody(newComment.body);
    }
    if (this.comment.userIconPath && newComment.userIconPath && URI.from(this.comment.userIconPath).toString() !== URI.from(newComment.userIconPath).toString()) {
      this.updateCommentUserIcon(newComment.userIconPath);
    }
    const isChangingMode = newComment.mode !== void 0 && newComment.mode !== this.comment.mode;
    this.comment = newComment;
    if (isChangingMode) {
      if (newComment.mode === languages.CommentMode.Editing) {
        await this.switchToEditMode();
      } else {
        this.removeCommentEditor();
      }
    }
    if (newComment.label) {
      this._isPendingLabel.innerText = newComment.label;
    } else {
      this._isPendingLabel.innerText = "";
    }
    this._reactionActionsContainer?.remove();
    this._reactionsActionBar?.clear();
    if (this.comment.commentReactions && this.comment.commentReactions.some((reaction) => !!reaction.count)) {
      this.createReactionsContainer(this._commentDetailsContainer);
    }
    if (this.comment.contextValue) {
      this._commentContextValue.set(this.comment.contextValue);
    } else {
      this._commentContextValue.reset();
    }
    if (this.comment.timestamp) {
      this.updateTimestamp(this.comment.timestamp);
    }
  }
  onContextMenu(e) {
    const event = new StandardMouseEvent(dom.getWindow(this._domNode), e);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      menuId: MenuId.CommentThreadCommentContext,
      menuActionOptions: { shouldForwardArgs: true },
      contextKeyService: this._contextKeyService,
      actionRunner: new CommentsActionRunner(),
      getActionsContext: /* @__PURE__ */ __name(() => {
        return this.commentNodeContext;
      }, "getActionsContext")
    });
  }
  focus() {
    this.domNode.focus();
    if (!this._clearTimeout) {
      this.domNode.classList.add("focus");
      this._clearTimeout = setTimeout(() => {
        this.domNode.classList.remove("focus");
      }, 3e3);
    }
  }
  dispose() {
    super.dispose();
    dispose(this._commentEditorDisposables);
  }
};
CommentNode = __decorateClass([
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ICommentService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IContextMenuService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, IAccessibilityService),
  __decorateParam(16, IKeybindingService),
  __decorateParam(17, ITextModelService)
], CommentNode);
function fillInActions(groups, target, useAlternativeActions, isPrimaryGroup = (group) => group === "navigation") {
  for (const tuple of groups) {
    let [group, actions] = tuple;
    if (useAlternativeActions) {
      actions = actions.map(
        (a) => a instanceof MenuItemAction && !!a.alt ? a.alt : a
      );
    }
    if (isPrimaryGroup(group)) {
      const to = Array.isArray(target) ? target : target.primary;
      to.unshift(...actions);
    } else {
      const to = Array.isArray(target) ? target : target.secondary;
      if (to.length > 0) {
        to.push(new Separator());
      }
      to.push(...actions);
    }
  }
}
__name(fillInActions, "fillInActions");
export {
  CommentNode
};
//# sourceMappingURL=commentNode.js.map
