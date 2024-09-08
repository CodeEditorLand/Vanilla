import { Disposable } from "../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import {
  AccessibleViewProviderId,
  AccessibleViewType
} from "../../../../platform/accessibility/browser/accessibleView.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { COMMENTS_VIEW_ID, CommentsMenus } from "./commentsTreeViewer.js";
import {
  CONTEXT_KEY_COMMENT_FOCUSED
} from "./commentsView.js";
class CommentsAccessibleView extends Disposable {
  priority = 90;
  name = "comment";
  when = CONTEXT_KEY_COMMENT_FOCUSED;
  type = AccessibleViewType.View;
  getProvider(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    const viewsService = accessor.get(IViewsService);
    const menuService = accessor.get(IMenuService);
    const commentsView = viewsService.getActiveViewWithId(COMMENTS_VIEW_ID);
    const focusedCommentNode = commentsView?.focusedCommentNode;
    if (!commentsView || !focusedCommentNode) {
      return;
    }
    const menus = this._register(new CommentsMenus(menuService));
    menus.setContextKeyService(contextKeyService);
    return new CommentsAccessibleContentProvider(
      commentsView,
      focusedCommentNode,
      menus
    );
  }
  constructor() {
    super();
  }
}
class CommentsAccessibleContentProvider extends Disposable {
  constructor(_commentsView, _focusedCommentNode, _menus) {
    super();
    this._commentsView = _commentsView;
    this._focusedCommentNode = _focusedCommentNode;
    this._menus = _menus;
  }
  id = AccessibleViewProviderId.Comments;
  verbositySettingKey = AccessibilityVerbositySettingId.Comments;
  options = { type: AccessibleViewType.View };
  actions = [
    ...this._menus.getResourceContextActions(this._focusedCommentNode)
  ].filter((i) => i.enabled).map((action) => {
    return {
      ...action,
      run: () => {
        this._commentsView.focus();
        action.run({
          thread: this._focusedCommentNode.thread,
          $mid: MarshalledId.CommentThread,
          commentControlHandle: this._focusedCommentNode.controllerHandle,
          commentThreadHandle: this._focusedCommentNode.threadHandle
        });
      }
    };
  });
  provideContent() {
    const commentNode = this._commentsView.focusedCommentNode;
    const content = this._commentsView.focusedCommentInfo?.toString();
    if (!commentNode || !content) {
      throw new Error(
        "Comment tree is focused but no comment is selected"
      );
    }
    return content;
  }
  onClose() {
    this._commentsView.focus();
  }
  provideNextContent() {
    this._commentsView.focusNextNode();
    return this.provideContent();
  }
  providePreviousContent() {
    this._commentsView.focusPreviousNode();
    return this.provideContent();
  }
}
export {
  CommentsAccessibleView
};
