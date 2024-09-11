var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../nls.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { Action } from "../../../../base/common/actions.js";
import { Parts, IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { KeybindingsRegistry, KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { StatusbarViewModel } from "./statusbarModel.js";
import { StatusBarFocused } from "../../../common/contextkeys.js";
import { getActiveWindow } from "../../../../base/browser/dom.js";
class ToggleStatusbarEntryVisibilityAction extends Action {
  constructor(id, label, model) {
    super(id, label, void 0, true);
    this.model = model;
    this.checked = !model.isHidden(id);
  }
  static {
    __name(this, "ToggleStatusbarEntryVisibilityAction");
  }
  async run() {
    if (this.model.isHidden(this.id)) {
      this.model.show(this.id);
    } else {
      this.model.hide(this.id);
    }
  }
}
class HideStatusbarEntryAction extends Action {
  constructor(id, name, model) {
    super(id, localize("hide", "Hide '{0}'", name), void 0, true);
    this.model = model;
  }
  static {
    __name(this, "HideStatusbarEntryAction");
  }
  async run() {
    this.model.hide(this.id);
  }
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusPrevious",
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyCode.LeftArrow,
  secondary: [KeyCode.UpArrow],
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focusPreviousEntry();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusNext",
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyCode.RightArrow,
  secondary: [KeyCode.DownArrow],
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focusNextEntry();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusFirst",
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyCode.Home,
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focus(false);
    statusBarService.focusNextEntry();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusLast",
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyCode.End,
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focus(false);
    statusBarService.focusPreviousEntry();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.clearFocus",
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyCode.Escape,
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    const editorService = accessor.get(IEditorService);
    if (statusBarService.isEntryFocused()) {
      statusBarService.focus(false);
    } else if (editorService.activeEditorPane) {
      editorService.activeEditorPane.focus();
    }
  }, "handler")
});
class FocusStatusBarAction extends Action2 {
  static {
    __name(this, "FocusStatusBarAction");
  }
  constructor() {
    super({
      id: "workbench.action.focusStatusBar",
      title: localize2("focusStatusBar", "Focus Status Bar"),
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.focusPart(Parts.STATUSBAR_PART, getActiveWindow());
  }
}
registerAction2(FocusStatusBarAction);
export {
  HideStatusbarEntryAction,
  ToggleStatusbarEntryVisibilityAction
};
//# sourceMappingURL=statusbarActions.js.map
