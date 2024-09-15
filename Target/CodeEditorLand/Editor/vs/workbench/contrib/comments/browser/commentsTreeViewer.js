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
import { renderMarkdown } from "../../../../base/browser/markdownRenderer.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import {
  ActionBar
} from "../../../../base/browser/ui/actionbar/actionbar.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import {
  TreeVisibility
} from "../../../../base/browser/ui/tree/tree.js";
import { Codicon } from "../../../../base/common/codicons.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import { basename } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { openLinkFromMarkdown } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import {
  CommentThreadApplicability,
  CommentThreadState
} from "../../../../editor/common/languages.js";
import * as nls from "../../../../nls.js";
import {
  createActionViewItem,
  createAndFillInContextMenuActions
} from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  IMenuService,
  MenuId
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import {
  IListService,
  WorkbenchObjectTree
} from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import {
  IThemeService
} from "../../../../platform/theme/common/themeService.js";
import {
  CommentNode,
  ResourceWithCommentThreads
} from "../common/commentModel.js";
import {
  commentViewThreadStateColorVar,
  getCommentThreadStateIconColor
} from "./commentColors.js";
import { FilterOptions } from "./commentsFilterOptions.js";
import { CommentsModel } from "./commentsModel.js";
import { TimestampWidget } from "./timestamp.js";
const COMMENTS_VIEW_ID = "workbench.panel.comments";
const COMMENTS_VIEW_STORAGE_ID = "Comments";
const COMMENTS_VIEW_TITLE = nls.localize2(
  "comments.view.title",
  "Comments"
);
class CommentsModelVirtualDelegate {
  static {
    __name(this, "CommentsModelVirtualDelegate");
  }
  static RESOURCE_ID = "resource-with-comments";
  static COMMENT_ID = "comment-node";
  getHeight(element) {
    if (element instanceof CommentNode && element.hasReply()) {
      return 44;
    }
    return 22;
  }
  getTemplateId(element) {
    if (element instanceof ResourceWithCommentThreads) {
      return CommentsModelVirtualDelegate.RESOURCE_ID;
    }
    if (element instanceof CommentNode) {
      return CommentsModelVirtualDelegate.COMMENT_ID;
    }
    return "";
  }
}
class ResourceWithCommentsRenderer {
  constructor(labels) {
    this.labels = labels;
  }
  static {
    __name(this, "ResourceWithCommentsRenderer");
  }
  templateId = "resource-with-comments";
  renderTemplate(container) {
    const labelContainer = dom.append(
      container,
      dom.$(".resource-container")
    );
    const resourceLabel = this.labels.create(labelContainer);
    const separator = dom.append(labelContainer, dom.$(".separator"));
    const owner = labelContainer.appendChild(dom.$(".owner"));
    return { resourceLabel, owner, separator };
  }
  renderElement(node, index, templateData, height) {
    templateData.resourceLabel.setFile(node.element.resource);
    templateData.separator.innerText = "\xB7";
    if (node.element.ownerLabel) {
      templateData.owner.innerText = node.element.ownerLabel;
      templateData.separator.style.display = "inline";
    } else {
      templateData.owner.innerText = "";
      templateData.separator.style.display = "none";
    }
  }
  disposeTemplate(templateData) {
    templateData.resourceLabel.dispose();
  }
}
let CommentsMenus = class {
  constructor(menuService) {
    this.menuService = menuService;
  }
  static {
    __name(this, "CommentsMenus");
  }
  contextKeyService;
  getResourceActions(element) {
    const actions = this.getActions(
      MenuId.CommentsViewThreadActions,
      element
    );
    return { actions: actions.primary };
  }
  getResourceContextActions(element) {
    return this.getActions(MenuId.CommentsViewThreadActions, element).secondary;
  }
  setContextKeyService(service) {
    this.contextKeyService = service;
  }
  getActions(menuId, element) {
    if (!this.contextKeyService) {
      return { primary: [], secondary: [] };
    }
    const overlay = [
      ["commentController", element.owner],
      ["resourceScheme", element.resource.scheme],
      ["commentThread", element.contextValue],
      ["canReply", element.thread.canReply]
    ];
    const contextKeyService = this.contextKeyService.createOverlay(overlay);
    const menu = this.menuService.getMenuActions(
      menuId,
      contextKeyService,
      { shouldForwardArgs: true }
    );
    const primary = [];
    const secondary = [];
    const result = { primary, secondary, menu };
    createAndFillInContextMenuActions(menu, result, "inline");
    return result;
  }
  dispose() {
    this.contextKeyService = void 0;
  }
};
CommentsMenus = __decorateClass([
  __decorateParam(0, IMenuService)
], CommentsMenus);
let CommentNodeRenderer = class {
  constructor(actionViewItemProvider, menus, openerService, configurationService, hoverService, themeService) {
    this.actionViewItemProvider = actionViewItemProvider;
    this.menus = menus;
    this.openerService = openerService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.themeService = themeService;
  }
  static {
    __name(this, "CommentNodeRenderer");
  }
  templateId = "comment-node";
  renderTemplate(container) {
    const threadContainer = dom.append(
      container,
      dom.$(".comment-thread-container")
    );
    const metadataContainer = dom.append(
      threadContainer,
      dom.$(".comment-metadata-container")
    );
    const metadata = dom.append(
      metadataContainer,
      dom.$(".comment-metadata")
    );
    const threadMetadata = {
      icon: dom.append(metadata, dom.$(".icon")),
      userNames: dom.append(metadata, dom.$(".user")),
      timestamp: new TimestampWidget(
        this.configurationService,
        this.hoverService,
        dom.append(metadata, dom.$(".timestamp-container"))
      ),
      relevance: dom.append(metadata, dom.$(".relevance")),
      separator: dom.append(metadata, dom.$(".separator")),
      commentPreview: dom.append(metadata, dom.$(".text")),
      range: dom.append(metadata, dom.$(".range"))
    };
    threadMetadata.separator.innerText = "\xB7";
    const actionsContainer = dom.append(
      metadataContainer,
      dom.$(".actions")
    );
    const actionBar = new ActionBar(actionsContainer, {
      actionViewItemProvider: this.actionViewItemProvider
    });
    const snippetContainer = dom.append(
      threadContainer,
      dom.$(".comment-snippet-container")
    );
    const repliesMetadata = {
      container: snippetContainer,
      icon: dom.append(snippetContainer, dom.$(".icon")),
      count: dom.append(snippetContainer, dom.$(".count")),
      lastReplyDetail: dom.append(
        snippetContainer,
        dom.$(".reply-detail")
      ),
      separator: dom.append(snippetContainer, dom.$(".separator")),
      timestamp: new TimestampWidget(
        this.configurationService,
        this.hoverService,
        dom.append(snippetContainer, dom.$(".timestamp-container"))
      )
    };
    repliesMetadata.separator.innerText = "\xB7";
    repliesMetadata.icon.classList.add(
      ...ThemeIcon.asClassNameArray(Codicon.indent)
    );
    const disposables = [
      threadMetadata.timestamp,
      repliesMetadata.timestamp
    ];
    return { threadMetadata, repliesMetadata, actionBar, disposables };
  }
  getCountString(commentCount) {
    if (commentCount > 2) {
      return nls.localize(
        "commentsCountReplies",
        "{0} replies",
        commentCount - 1
      );
    } else if (commentCount === 2) {
      return nls.localize("commentsCountReply", "1 reply");
    } else {
      return nls.localize("commentCount", "1 comment");
    }
  }
  getRenderedComment(commentBody, disposables) {
    const renderedComment = renderMarkdown(commentBody, {
      inline: true,
      actionHandler: {
        callback: /* @__PURE__ */ __name((link) => openLinkFromMarkdown(
          this.openerService,
          link,
          commentBody.isTrusted
        ), "callback"),
        disposables
      }
    });
    const images = renderedComment.element.getElementsByTagName("img");
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const textDescription = dom.$("");
      textDescription.textContent = image.alt ? nls.localize("imageWithLabel", "Image: {0}", image.alt) : nls.localize("image", "Image");
      image.parentNode.replaceChild(textDescription, image);
    }
    while (renderedComment.element.children.length > 1 && renderedComment.element.firstElementChild?.tagName === "HR") {
      renderedComment.element.removeChild(
        renderedComment.element.firstElementChild
      );
    }
    return renderedComment;
  }
  getIcon(threadState) {
    if (threadState === CommentThreadState.Unresolved) {
      return Codicon.commentUnresolved;
    } else {
      return Codicon.comment;
    }
  }
  renderElement(node, index, templateData, height) {
    templateData.actionBar.clear();
    const commentCount = node.element.replies.length + 1;
    if (node.element.threadRelevance === CommentThreadApplicability.Outdated) {
      templateData.threadMetadata.relevance.style.display = "";
      templateData.threadMetadata.relevance.innerText = nls.localize(
        "outdated",
        "Outdated"
      );
      templateData.threadMetadata.separator.style.display = "none";
    } else {
      templateData.threadMetadata.relevance.innerText = "";
      templateData.threadMetadata.relevance.style.display = "none";
      templateData.threadMetadata.separator.style.display = "";
    }
    templateData.threadMetadata.icon.classList.remove(
      ...Array.from(
        templateData.threadMetadata.icon.classList.values()
      ).filter((value) => value.startsWith("codicon"))
    );
    templateData.threadMetadata.icon.classList.add(
      ...ThemeIcon.asClassNameArray(
        this.getIcon(node.element.threadState)
      )
    );
    if (node.element.threadState !== void 0) {
      const color = this.getCommentThreadWidgetStateColor(
        node.element.threadState,
        this.themeService.getColorTheme()
      );
      templateData.threadMetadata.icon.style.setProperty(
        commentViewThreadStateColorVar,
        `${color}`
      );
      templateData.threadMetadata.icon.style.color = `var(${commentViewThreadStateColorVar})`;
    }
    templateData.threadMetadata.userNames.textContent = node.element.comment.userName;
    templateData.threadMetadata.timestamp.setTimestamp(
      node.element.comment.timestamp ? new Date(node.element.comment.timestamp) : void 0
    );
    const originalComment = node.element;
    templateData.threadMetadata.commentPreview.innerText = "";
    templateData.threadMetadata.commentPreview.style.height = "22px";
    if (typeof originalComment.comment.body === "string") {
      templateData.threadMetadata.commentPreview.innerText = originalComment.comment.body;
    } else {
      const disposables = new DisposableStore();
      templateData.disposables.push(disposables);
      const renderedComment = this.getRenderedComment(
        originalComment.comment.body,
        disposables
      );
      templateData.disposables.push(renderedComment);
      templateData.threadMetadata.commentPreview.appendChild(
        renderedComment.element.firstElementChild ?? renderedComment.element
      );
      templateData.disposables.push(
        this.hoverService.setupManagedHover(
          getDefaultHoverDelegate("mouse"),
          templateData.threadMetadata.commentPreview,
          renderedComment.element.textContent ?? ""
        )
      );
    }
    if (node.element.range) {
      if (node.element.range.startLineNumber === node.element.range.endLineNumber) {
        templateData.threadMetadata.range.textContent = nls.localize(
          "commentLine",
          "[Ln {0}]",
          node.element.range.startLineNumber
        );
      } else {
        templateData.threadMetadata.range.textContent = nls.localize(
          "commentRange",
          "[Ln {0}-{1}]",
          node.element.range.startLineNumber,
          node.element.range.endLineNumber
        );
      }
    }
    const menuActions = this.menus.getResourceActions(node.element);
    templateData.actionBar.push(menuActions.actions, {
      icon: true,
      label: false
    });
    templateData.actionBar.context = {
      commentControlHandle: node.element.controllerHandle,
      commentThreadHandle: node.element.threadHandle,
      $mid: MarshalledId.CommentThread
    };
    if (!node.element.hasReply()) {
      templateData.repliesMetadata.container.style.display = "none";
      return;
    }
    templateData.repliesMetadata.container.style.display = "";
    templateData.repliesMetadata.count.textContent = this.getCountString(commentCount);
    const lastComment = node.element.replies[node.element.replies.length - 1].comment;
    templateData.repliesMetadata.lastReplyDetail.textContent = nls.localize(
      "lastReplyFrom",
      "Last reply from {0}",
      lastComment.userName
    );
    templateData.repliesMetadata.timestamp.setTimestamp(
      lastComment.timestamp ? new Date(lastComment.timestamp) : void 0
    );
  }
  getCommentThreadWidgetStateColor(state, theme) {
    return state !== void 0 ? getCommentThreadStateIconColor(state, theme) : void 0;
  }
  disposeTemplate(templateData) {
    templateData.disposables.forEach(
      (disposeable) => disposeable.dispose()
    );
    templateData.actionBar.dispose();
  }
};
CommentNodeRenderer = __decorateClass([
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IThemeService)
], CommentNodeRenderer);
var FilterDataType = /* @__PURE__ */ ((FilterDataType2) => {
  FilterDataType2[FilterDataType2["Resource"] = 0] = "Resource";
  FilterDataType2[FilterDataType2["Comment"] = 1] = "Comment";
  return FilterDataType2;
})(FilterDataType || {});
class Filter {
  constructor(options) {
    this.options = options;
  }
  static {
    __name(this, "Filter");
  }
  filter(element, parentVisibility) {
    if (this.options.filter === "" && this.options.showResolved && this.options.showUnresolved) {
      return TreeVisibility.Visible;
    }
    if (element instanceof ResourceWithCommentThreads) {
      return this.filterResourceMarkers(element);
    } else {
      return this.filterCommentNode(element, parentVisibility);
    }
  }
  filterResourceMarkers(resourceMarkers) {
    if (this.options.textFilter.text && !this.options.textFilter.negate) {
      const uriMatches = FilterOptions._filter(
        this.options.textFilter.text,
        basename(resourceMarkers.resource)
      );
      if (uriMatches) {
        return {
          visibility: true,
          data: {
            type: 0 /* Resource */,
            uriMatches: uriMatches || []
          }
        };
      }
    }
    return TreeVisibility.Recurse;
  }
  filterCommentNode(comment, parentVisibility) {
    const matchesResolvedState = comment.threadState === void 0 || this.options.showResolved && CommentThreadState.Resolved === comment.threadState || this.options.showUnresolved && CommentThreadState.Unresolved === comment.threadState;
    if (!matchesResolvedState) {
      return false;
    }
    if (!this.options.textFilter.text) {
      return true;
    }
    const textMatches = (
      // Check body of comment for value
      FilterOptions._messageFilter(
        this.options.textFilter.text,
        typeof comment.comment.body === "string" ? comment.comment.body : comment.comment.body.value
      ) || // Check first user for value
      FilterOptions._messageFilter(
        this.options.textFilter.text,
        comment.comment.userName
      ) || // Check all replies for value
      comment.replies.map((reply) => {
        return FilterOptions._messageFilter(
          this.options.textFilter.text,
          reply.comment.userName
        ) || // Check body of reply for value
        FilterOptions._messageFilter(
          this.options.textFilter.text,
          typeof reply.comment.body === "string" ? reply.comment.body : reply.comment.body.value
        );
      }).filter((value) => !!value).flat()
    );
    if (textMatches.length && !this.options.textFilter.negate) {
      return {
        visibility: true,
        data: { type: 1 /* Comment */, textMatches }
      };
    }
    if (textMatches.length && this.options.textFilter.negate && parentVisibility === TreeVisibility.Recurse) {
      return false;
    }
    if (textMatches.length === 0 && this.options.textFilter.negate && parentVisibility === TreeVisibility.Recurse) {
      return true;
    }
    return parentVisibility;
  }
}
let CommentsList = class extends WorkbenchObjectTree {
  constructor(labels, container, options, contextKeyService, listService, instantiationService, configurationService, contextMenuService, keybindingService) {
    const delegate = new CommentsModelVirtualDelegate();
    const actionViewItemProvider = createActionViewItem.bind(
      void 0,
      instantiationService
    );
    const menus = instantiationService.createInstance(CommentsMenus);
    menus.setContextKeyService(contextKeyService);
    const renderers = [
      instantiationService.createInstance(
        ResourceWithCommentsRenderer,
        labels
      ),
      instantiationService.createInstance(
        CommentNodeRenderer,
        actionViewItemProvider,
        menus
      )
    ];
    super(
      "CommentsTree",
      container,
      delegate,
      renderers,
      {
        accessibilityProvider: options.accessibilityProvider,
        identityProvider: {
          getId: /* @__PURE__ */ __name((element) => {
            if (element instanceof CommentsModel) {
              return "root";
            }
            if (element instanceof ResourceWithCommentThreads) {
              return `${element.uniqueOwner}-${element.id}`;
            }
            if (element instanceof CommentNode) {
              return `${element.uniqueOwner}-${element.resource.toString()}-${element.threadId}-${element.comment.uniqueIdInThread}` + (element.isRoot ? "-root" : "");
            }
            return "";
          }, "getId")
        },
        expandOnlyOnTwistieClick: true,
        collapseByDefault: false,
        overrideStyles: options.overrideStyles,
        filter: options.filter,
        sorter: options.sorter,
        findWidgetEnabled: false,
        multipleSelectionSupport: false
      },
      instantiationService,
      contextKeyService,
      listService,
      configurationService
    );
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.menus = menus;
    this.disposables.add(
      this.onContextMenu((e) => this.commentsOnContextMenu(e))
    );
  }
  static {
    __name(this, "CommentsList");
  }
  menus;
  commentsOnContextMenu(treeEvent) {
    const node = treeEvent.element;
    if (!(node instanceof CommentNode)) {
      return;
    }
    const event = treeEvent.browserEvent;
    event.preventDefault();
    event.stopPropagation();
    this.setFocus([node]);
    const actions = this.menus.getResourceContextActions(node);
    if (!actions.length) {
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => treeEvent.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
      getActionViewItem: /* @__PURE__ */ __name((action) => {
        const keybinding = this.keybindingService.lookupKeybinding(
          action.id
        );
        if (keybinding) {
          return new ActionViewItem(action, action, {
            label: true,
            keybinding: keybinding.getLabel()
          });
        }
        return void 0;
      }, "getActionViewItem"),
      onHide: /* @__PURE__ */ __name((wasCancelled) => {
        if (wasCancelled) {
          this.domFocus();
        }
      }, "onHide"),
      getActionsContext: /* @__PURE__ */ __name(() => ({
        commentControlHandle: node.controllerHandle,
        commentThreadHandle: node.threadHandle,
        $mid: MarshalledId.CommentThread,
        thread: node.thread
      }), "getActionsContext")
    });
  }
  filterComments() {
    this.refilter();
  }
  getVisibleItemCount() {
    let filtered = 0;
    const root = this.getNode();
    for (const resourceNode of root.children) {
      for (const commentNode of resourceNode.children) {
        if (commentNode.visible && resourceNode.visible) {
          filtered++;
        }
      }
    }
    return filtered;
  }
};
CommentsList = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IListService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IKeybindingService)
], CommentsList);
export {
  COMMENTS_VIEW_ID,
  COMMENTS_VIEW_STORAGE_ID,
  COMMENTS_VIEW_TITLE,
  CommentNodeRenderer,
  CommentsList,
  CommentsMenus,
  Filter,
  ResourceWithCommentsRenderer
};
//# sourceMappingURL=commentsTreeViewer.js.map
