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
import { SelectActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Action } from "../../../../base/common/actions.js";
import { peekViewTitleBackground } from "../../../../editor/contrib/peekView/browser/peekView.js";
import * as nls from "../../../../nls.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { defaultSelectBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
let SwitchQuickDiffViewItem = class extends SelectActionViewItem {
  static {
    __name(this, "SwitchQuickDiffViewItem");
  }
  optionsItems;
  constructor(action, providers, selected, contextViewService, themeService) {
    const items = providers.map((provider) => ({
      provider,
      text: provider
    }));
    let startingSelection = providers.indexOf(selected);
    if (startingSelection === -1) {
      startingSelection = 0;
    }
    const styles = { ...defaultSelectBoxStyles };
    const theme = themeService.getColorTheme();
    const editorBackgroundColor = theme.getColor(editorBackground);
    const peekTitleColor = theme.getColor(peekViewTitleBackground);
    const opaqueTitleColor = peekTitleColor?.makeOpaque(editorBackgroundColor) ?? editorBackgroundColor;
    styles.selectBackground = opaqueTitleColor.lighten(0.6).toString();
    super(
      null,
      action,
      items,
      startingSelection,
      contextViewService,
      styles,
      { ariaLabel: nls.localize("remotes", "Switch quick diff base") }
    );
    this.optionsItems = items;
  }
  setSelection(provider) {
    const index = this.optionsItems.findIndex(
      (item) => item.provider === provider
    );
    this.select(index);
  }
  getActionContext(_, index) {
    return this.optionsItems[index];
  }
  render(container) {
    super.render(container);
    this.setFocusable(true);
  }
};
SwitchQuickDiffViewItem = __decorateClass([
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IThemeService)
], SwitchQuickDiffViewItem);
class SwitchQuickDiffBaseAction extends Action {
  constructor(callback) {
    super(
      SwitchQuickDiffBaseAction.ID,
      SwitchQuickDiffBaseAction.LABEL,
      void 0,
      void 0
    );
    this.callback = callback;
  }
  static {
    __name(this, "SwitchQuickDiffBaseAction");
  }
  static ID = "quickDiff.base.switch";
  static LABEL = nls.localize(
    "quickDiff.base.switch",
    "Switch Quick Diff Base"
  );
  async run(event) {
    return this.callback(event);
  }
}
export {
  SwitchQuickDiffBaseAction,
  SwitchQuickDiffViewItem
};
//# sourceMappingURL=dirtyDiffSwitcher.js.map
