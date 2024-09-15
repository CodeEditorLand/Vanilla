var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Action } from "../../../../base/common/actions.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
class ToggleReactionsAction extends Action {
  static {
    __name(this, "ToggleReactionsAction");
  }
  static ID = "toolbar.toggle.pickReactions";
  _menuActions = [];
  toggleDropdownMenu;
  constructor(toggleDropdownMenu, title) {
    super(
      ToggleReactionsAction.ID,
      title || nls.localize("pickReactions", "Pick Reactions..."),
      "toggle-reactions",
      true
    );
    this.toggleDropdownMenu = toggleDropdownMenu;
  }
  run() {
    this.toggleDropdownMenu();
    return Promise.resolve(true);
  }
  get menuActions() {
    return this._menuActions;
  }
  set menuActions(actions) {
    this._menuActions = actions;
  }
}
class ReactionActionViewItem extends ActionViewItem {
  static {
    __name(this, "ReactionActionViewItem");
  }
  constructor(action) {
    super(null, action, {});
  }
  updateLabel() {
    if (!this.label) {
      return;
    }
    const action = this.action;
    if (action.class) {
      this.label.classList.add(action.class);
    }
    if (action.icon) {
      const reactionIcon = dom.append(
        this.label,
        dom.$(".reaction-icon")
      );
      const uri = URI.revive(action.icon);
      reactionIcon.style.backgroundImage = dom.asCSSUrl(uri);
    } else {
      const reactionLabel = dom.append(
        this.label,
        dom.$("span.reaction-label")
      );
      reactionLabel.innerText = action.label;
    }
    if (action.count) {
      const reactionCount = dom.append(
        this.label,
        dom.$("span.reaction-count")
      );
      reactionCount.innerText = `${action.count}`;
    }
  }
  getTooltip() {
    const action = this.action;
    const toggleMessage = action.enabled ? nls.localize("comment.toggleableReaction", "Toggle reaction, ") : "";
    if (action.count === void 0) {
      return nls.localize(
        {
          key: "comment.reactionLabelNone",
          comment: [
            "This is a tooltip for an emoji button so that the current user can toggle their reaction to a comment.",
            `The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second is the name of the reaction.`
          ]
        },
        "{0}{1} reaction",
        toggleMessage,
        action.label
      );
    } else if (action.reactors === void 0 || action.reactors.length === 0) {
      if (action.count === 1) {
        return nls.localize(
          {
            key: "comment.reactionLabelOne",
            comment: [
              'This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is 1.',
              "The emoji is also a button so that the current user can also toggle their own emoji reaction.",
              `The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second is the name of the reaction.`
            ]
          },
          "{0}1 reaction with {1}",
          toggleMessage,
          action.label
        );
      } else if (action.count > 1) {
        return nls.localize(
          {
            key: "comment.reactionLabelMany",
            comment: [
              'This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is greater than 1.',
              "The emoji is also a button so that the current user can also toggle their own emoji reaction.",
              `The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second is number of users who have reacted with that reaction, and the third is the name of the reaction.`
            ]
          },
          "{0}{1} reactions with {2}",
          toggleMessage,
          action.count,
          action.label
        );
      }
    } else if (action.reactors.length <= 10 && action.reactors.length === action.count) {
      return nls.localize(
        {
          key: "comment.reactionLessThanTen",
          comment: [
            'This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is less than or equal to 10.',
            "The emoji is also a button so that the current user can also toggle their own emoji reaction.",
            `The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second iis a list of the reactors, and the third is the name of the reaction.`
          ]
        },
        "{0}{1} reacted with {2}",
        toggleMessage,
        action.reactors.join(", "),
        action.label
      );
    } else if (action.count > 1) {
      const displayedReactors = action.reactors.slice(0, 10);
      return nls.localize(
        {
          key: "comment.reactionMoreThanTen",
          comment: [
            'This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is less than or equal to 10.',
            "The emoji is also a button so that the current user can also toggle their own emoji reaction.",
            `The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second iis a list of the reactors, and the third is the name of the reaction.`
          ]
        },
        "{0}{1} and {2} more reacted with {3}",
        toggleMessage,
        displayedReactors.join(", "),
        action.count - displayedReactors.length,
        action.label
      );
    }
    return void 0;
  }
}
class ReactionAction extends Action {
  constructor(id, label = "", cssClass = "", enabled = true, actionCallback, reactors, icon, count) {
    super(ReactionAction.ID, label, cssClass, enabled, actionCallback);
    this.reactors = reactors;
    this.icon = icon;
    this.count = count;
  }
  static {
    __name(this, "ReactionAction");
  }
  static ID = "toolbar.toggle.reaction";
}
export {
  ReactionAction,
  ReactionActionViewItem,
  ToggleReactionsAction
};
//# sourceMappingURL=reactionsAction.js.map
