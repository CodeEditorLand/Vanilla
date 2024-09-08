import * as dom from "../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Action, ActionRunner } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import {
  Disposable,
  MutableDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import * as strings from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import * as nls from "../../../../nls.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
const collapseIcon = registerIcon(
  "review-comment-collapse",
  Codicon.chevronUp,
  nls.localize("collapseIcon", "Icon to collapse a review comment.")
);
const COLLAPSE_ACTION_CLASS = "expand-review-action " + ThemeIcon.asClassName(collapseIcon);
const DELETE_ACTION_CLASS = "expand-review-action " + ThemeIcon.asClassName(Codicon.trashcan);
function threadHasComments(comments) {
  return !!comments && comments.length > 0;
}
class CommentThreadHeader extends Disposable {
  constructor(container, _delegate, _commentMenus, _commentThread, _contextKeyService, instantiationService, _contextMenuService) {
    super();
    this._delegate = _delegate;
    this._commentMenus = _commentMenus;
    this._commentThread = _commentThread;
    this._contextKeyService = _contextKeyService;
    this.instantiationService = instantiationService;
    this._contextMenuService = _contextMenuService;
    this._headElement = dom.$(".head");
    container.appendChild(this._headElement);
    this._register(toDisposable(() => this._headElement.remove()));
    this._fillHead();
  }
  _headElement;
  _headingLabel;
  _actionbarWidget;
  _collapseAction;
  _fillHead() {
    const titleElement = dom.append(
      this._headElement,
      dom.$(".review-title")
    );
    this._headingLabel = dom.append(titleElement, dom.$("span.filename"));
    this.createThreadLabel();
    const actionsContainer = dom.append(
      this._headElement,
      dom.$(".review-actions")
    );
    this._actionbarWidget = new ActionBar(actionsContainer, {
      actionViewItemProvider: createActionViewItem.bind(
        void 0,
        this.instantiationService
      )
    });
    this._register(this._actionbarWidget);
    const collapseClass = threadHasComments(this._commentThread.comments) ? COLLAPSE_ACTION_CLASS : DELETE_ACTION_CLASS;
    this._collapseAction = new Action(
      "review.expand",
      nls.localize("label.collapse", "Collapse"),
      collapseClass,
      true,
      () => this._delegate.collapse()
    );
    if (!threadHasComments(this._commentThread.comments)) {
      const commentsChanged = this._register(new MutableDisposable());
      commentsChanged.value = this._commentThread.onDidChangeComments(
        () => {
          if (threadHasComments(this._commentThread.comments)) {
            this._collapseAction.class = COLLAPSE_ACTION_CLASS;
            commentsChanged.clear();
          }
        }
      );
    }
    const menu = this._commentMenus.getCommentThreadTitleActions(
      this._contextKeyService
    );
    this._register(menu);
    this.setActionBarActions(menu);
    this._register(menu);
    this._register(
      menu.onDidChange((e) => {
        this.setActionBarActions(menu);
      })
    );
    this._register(
      dom.addDisposableListener(
        this._headElement,
        dom.EventType.CONTEXT_MENU,
        (e) => {
          return this.onContextMenu(e);
        }
      )
    );
    this._actionbarWidget.context = this._commentThread;
  }
  setActionBarActions(menu) {
    const groups = menu.getActions({ shouldForwardArgs: true }).reduce(
      (r, [, actions]) => [...r, ...actions],
      []
    );
    this._actionbarWidget.clear();
    this._actionbarWidget.push([...groups, this._collapseAction], {
      label: false,
      icon: true
    });
  }
  updateCommentThread(commentThread) {
    this._commentThread = commentThread;
    this._actionbarWidget.context = this._commentThread;
    this.createThreadLabel();
  }
  createThreadLabel() {
    let label;
    label = this._commentThread.label;
    if (label === void 0) {
      if (!(this._commentThread.comments && this._commentThread.comments.length)) {
        label = nls.localize("startThread", "Start discussion");
      }
    }
    if (label) {
      this._headingLabel.textContent = strings.escape(label);
      this._headingLabel.setAttribute("aria-label", label);
    }
  }
  updateHeight(headHeight) {
    this._headElement.style.height = `${headHeight}px`;
    this._headElement.style.lineHeight = this._headElement.style.height;
  }
  onContextMenu(e) {
    const actions = this._commentMenus.getCommentThreadTitleContextActions(this._contextKeyService).getActions({ shouldForwardArgs: true }).flatMap((value) => value[1]);
    if (!actions.length) {
      return;
    }
    const event = new StandardMouseEvent(
      dom.getWindow(this._headElement),
      e
    );
    this._contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => actions,
      actionRunner: new ActionRunner(),
      getActionsContext: () => {
        return {
          commentControlHandle: this._commentThread.controllerHandle,
          commentThreadHandle: this._commentThread.commentThreadHandle,
          $mid: MarshalledId.CommentThread
        };
      }
    });
  }
}
export {
  CommentThreadHeader
};
