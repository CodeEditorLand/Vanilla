var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Button } from "../../../../base/browser/ui/button/button.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { CommentCommandId } from "../common/commentCommandIds.js";
class CommentFormActions {
  constructor(keybindingService, contextKeyService, container, actionHandler, maxActions) {
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
    this.container = container;
    this.actionHandler = actionHandler;
    this.maxActions = maxActions;
  }
  static {
    __name(this, "CommentFormActions");
  }
  _buttonElements = [];
  _toDispose = new DisposableStore();
  _actions = [];
  setActions(menu, hasOnlySecondaryActions = false) {
    this._toDispose.clear();
    this._buttonElements.forEach((b) => b.remove());
    this._buttonElements = [];
    const groups = menu.getActions({ shouldForwardArgs: true });
    let isPrimary = !hasOnlySecondaryActions;
    for (const group of groups) {
      const [, actions] = group;
      this._actions = actions;
      for (const action of actions) {
        let keybinding = this.keybindingService.lookupKeybinding(action.id, this.contextKeyService)?.getLabel();
        if (!keybinding && isPrimary) {
          keybinding = this.keybindingService.lookupKeybinding(
            CommentCommandId.Submit,
            this.contextKeyService
          )?.getLabel();
        }
        const title = keybinding ? `${action.label} (${keybinding})` : action.label;
        const button = new Button(this.container, {
          secondary: !isPrimary,
          title,
          ...defaultButtonStyles
        });
        isPrimary = false;
        this._buttonElements.push(button.element);
        this._toDispose.add(button);
        this._toDispose.add(
          button.onDidClick(() => this.actionHandler(action))
        );
        button.enabled = action.enabled;
        button.label = action.label;
        if (this.maxActions !== void 0 && this._buttonElements.length >= this.maxActions) {
          console.warn(
            `An extension has contributed more than the allowable number of actions to a comments menu.`
          );
          return;
        }
      }
    }
  }
  triggerDefaultAction() {
    if (this._actions.length) {
      const lastAction = this._actions[0];
      if (lastAction.enabled) {
        return this.actionHandler(lastAction);
      }
    }
  }
  dispose() {
    this._toDispose.dispose();
  }
}
export {
  CommentFormActions
};
//# sourceMappingURL=commentFormActions.js.map
