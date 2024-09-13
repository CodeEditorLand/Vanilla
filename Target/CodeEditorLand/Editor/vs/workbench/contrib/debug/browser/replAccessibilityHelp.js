var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { getReplView, Repl } from "./repl.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { localize } from "../../../../nls.js";
class ReplAccessibilityHelp {
  static {
    __name(this, "ReplAccessibilityHelp");
  }
  priority = 120;
  name = "replHelp";
  when = ContextKeyExpr.equals("focusedView", "workbench.panel.repl.view");
  type = AccessibleViewType.Help;
  getProvider(accessor) {
    const viewsService = accessor.get(IViewsService);
    const replView = getReplView(viewsService);
    if (!replView) {
      return void 0;
    }
    return new ReplAccessibilityHelpProvider(replView);
  }
}
class ReplAccessibilityHelpProvider extends Disposable {
  constructor(_replView) {
    super();
    this._replView = _replView;
    this._treeHadFocus = !!_replView.getFocusedElement();
  }
  static {
    __name(this, "ReplAccessibilityHelpProvider");
  }
  id = AccessibleViewProviderId.ReplHelp;
  verbositySettingKey = AccessibilityVerbositySettingId.Debug;
  options = { type: AccessibleViewType.Help };
  _treeHadFocus = false;
  onClose() {
    if (this._treeHadFocus) {
      return this._replView.focusTree();
    }
    this._replView.getReplInput().focus();
  }
  provideContent() {
    return [
      localize("repl.help", "The debug console is a Read-Eval-Print-Loop that allows you to evaluate expressions and run commands and can be focused with{0}.", "<keybinding:workbench.panel.repl.view.focus>"),
      localize("repl.output", "The debug console output can be navigated to from the input field with the Focus Previous Widget command{0}.", "<keybinding:widgetNavigation.focusPrevious>"),
      localize("repl.input", "The debug console input can be navigated to from the output with the Focus Next Widget command{0}.", "<keybinding:widgetNavigation.focusNext>"),
      localize("repl.history", "The debug console output history can be navigated with the up and down arrow keys."),
      localize("repl.accessibleView", "The Open Accessible View command{0} will allow character by character navigation of the console output.", "<keybinding:editor.action.accessibleView>"),
      localize("repl.showRunAndDebug", "The Show Run and Debug view command{0} will open the Run and Debug view and provides more information about debugging.", "<keybinding:workbench.view.debug>"),
      localize("repl.clear", "The Debug: Clear Console command{0} will clear the console output.", "<keybinding:workbench.debug.panel.action.clearReplAction>"),
      localize("repl.lazyVariables", "The setting `debug.expandLazyVariables` controls whether variables are evaluated automatically. This is enabled by default when using a screen reader.")
    ].join("\n");
  }
}
export {
  ReplAccessibilityHelp
};
//# sourceMappingURL=replAccessibilityHelp.js.map
