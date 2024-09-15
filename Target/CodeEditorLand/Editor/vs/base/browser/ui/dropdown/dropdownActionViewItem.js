var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { IContextMenuProvider } from "../../contextmenu.js";
import { $, addDisposableListener, append, EventType, h } from "../../dom.js";
import { StandardKeyboardEvent } from "../../keyboardEvent.js";
import { IActionViewItemProvider } from "../actionbar/actionbar.js";
import { ActionViewItem, BaseActionViewItem, IActionViewItemOptions, IBaseActionViewItemOptions } from "../actionbar/actionViewItems.js";
import { AnchorAlignment } from "../contextview/contextview.js";
import { DropdownMenu, IActionProvider, IDropdownMenuOptions, ILabelRenderer } from "./dropdown.js";
import { Action, IAction, IActionRunner } from "../../../common/actions.js";
import { Codicon } from "../../../common/codicons.js";
import { ThemeIcon } from "../../../common/themables.js";
import { Emitter } from "../../../common/event.js";
import { KeyCode } from "../../../common/keyCodes.js";
import { ResolvedKeybinding } from "../../../common/keybindings.js";
import { IDisposable } from "../../../common/lifecycle.js";
import "./dropdown.css";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
class DropdownMenuActionViewItem extends BaseActionViewItem {
  static {
    __name(this, "DropdownMenuActionViewItem");
  }
  menuActionsOrProvider;
  dropdownMenu;
  contextMenuProvider;
  actionItem = null;
  _onDidChangeVisibility = this._register(new Emitter());
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  options;
  constructor(action, menuActionsOrProvider, contextMenuProvider, options = /* @__PURE__ */ Object.create(null)) {
    super(null, action, options);
    this.menuActionsOrProvider = menuActionsOrProvider;
    this.contextMenuProvider = contextMenuProvider;
    this.options = options;
    if (this.options.actionRunner) {
      this.actionRunner = this.options.actionRunner;
    }
  }
  render(container) {
    this.actionItem = container;
    const labelRenderer = /* @__PURE__ */ __name((el) => {
      this.element = append(el, $("a.action-label"));
      let classNames = [];
      if (typeof this.options.classNames === "string") {
        classNames = this.options.classNames.split(/\s+/g).filter((s) => !!s);
      } else if (this.options.classNames) {
        classNames = this.options.classNames;
      }
      if (!classNames.find((c) => c === "icon")) {
        classNames.push("codicon");
      }
      this.element.classList.add(...classNames);
      this.element.setAttribute("role", "button");
      this.element.setAttribute("aria-haspopup", "true");
      this.element.setAttribute("aria-expanded", "false");
      if (this._action.label) {
        this._register(getBaseLayerHoverDelegate().setupManagedHover(this.options.hoverDelegate ?? getDefaultHoverDelegate("mouse"), this.element, this._action.label));
      }
      this.element.ariaLabel = this._action.label || "";
      return null;
    }, "labelRenderer");
    const isActionsArray = Array.isArray(this.menuActionsOrProvider);
    const options = {
      contextMenuProvider: this.contextMenuProvider,
      labelRenderer,
      menuAsChild: this.options.menuAsChild,
      actions: isActionsArray ? this.menuActionsOrProvider : void 0,
      actionProvider: isActionsArray ? void 0 : this.menuActionsOrProvider,
      skipTelemetry: this.options.skipTelemetry
    };
    this.dropdownMenu = this._register(new DropdownMenu(container, options));
    this._register(this.dropdownMenu.onDidChangeVisibility((visible) => {
      this.element?.setAttribute("aria-expanded", `${visible}`);
      this._onDidChangeVisibility.fire(visible);
    }));
    this.dropdownMenu.menuOptions = {
      actionViewItemProvider: this.options.actionViewItemProvider,
      actionRunner: this.actionRunner,
      getKeyBinding: this.options.keybindingProvider,
      context: this._context
    };
    if (this.options.anchorAlignmentProvider) {
      const that = this;
      this.dropdownMenu.menuOptions = {
        ...this.dropdownMenu.menuOptions,
        get anchorAlignment() {
          return that.options.anchorAlignmentProvider();
        }
      };
    }
    this.updateTooltip();
    this.updateEnabled();
  }
  getTooltip() {
    let title = null;
    if (this.action.tooltip) {
      title = this.action.tooltip;
    } else if (this.action.label) {
      title = this.action.label;
    }
    return title ?? void 0;
  }
  setActionContext(newContext) {
    super.setActionContext(newContext);
    if (this.dropdownMenu) {
      if (this.dropdownMenu.menuOptions) {
        this.dropdownMenu.menuOptions.context = newContext;
      } else {
        this.dropdownMenu.menuOptions = { context: newContext };
      }
    }
  }
  show() {
    this.dropdownMenu?.show();
  }
  updateEnabled() {
    const disabled = !this.action.enabled;
    this.actionItem?.classList.toggle("disabled", disabled);
    this.element?.classList.toggle("disabled", disabled);
  }
}
class ActionWithDropdownActionViewItem extends ActionViewItem {
  constructor(context, action, options, contextMenuProvider) {
    super(context, action, options);
    this.contextMenuProvider = contextMenuProvider;
  }
  static {
    __name(this, "ActionWithDropdownActionViewItem");
  }
  dropdownMenuActionViewItem;
  render(container) {
    super.render(container);
    if (this.element) {
      this.element.classList.add("action-dropdown-item");
      const menuActionsProvider = {
        getActions: /* @__PURE__ */ __name(() => {
          const actionsProvider = this.options.menuActionsOrProvider;
          return Array.isArray(actionsProvider) ? actionsProvider : actionsProvider.getActions();
        }, "getActions")
      };
      const menuActionClassNames = this.options.menuActionClassNames || [];
      const separator = h("div.action-dropdown-item-separator", [h("div", {})]).root;
      separator.classList.toggle("prominent", menuActionClassNames.includes("prominent"));
      append(this.element, separator);
      this.dropdownMenuActionViewItem = this._register(new DropdownMenuActionViewItem(this._register(new Action("dropdownAction", nls.localize("moreActions", "More Actions..."))), menuActionsProvider, this.contextMenuProvider, { classNames: ["dropdown", ...ThemeIcon.asClassNameArray(Codicon.dropDownButton), ...menuActionClassNames], hoverDelegate: this.options.hoverDelegate }));
      this.dropdownMenuActionViewItem.render(this.element);
      this._register(addDisposableListener(this.element, EventType.KEY_DOWN, (e) => {
        if (menuActionsProvider.getActions().length === 0) {
          return;
        }
        const event = new StandardKeyboardEvent(e);
        let handled = false;
        if (this.dropdownMenuActionViewItem?.isFocused() && event.equals(KeyCode.LeftArrow)) {
          handled = true;
          this.dropdownMenuActionViewItem?.blur();
          this.focus();
        } else if (this.isFocused() && event.equals(KeyCode.RightArrow)) {
          handled = true;
          this.blur();
          this.dropdownMenuActionViewItem?.focus();
        }
        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }
      }));
    }
  }
  blur() {
    super.blur();
    this.dropdownMenuActionViewItem?.blur();
  }
  setFocusable(focusable) {
    super.setFocusable(focusable);
    this.dropdownMenuActionViewItem?.setFocusable(focusable);
  }
}
export {
  ActionWithDropdownActionViewItem,
  DropdownMenuActionViewItem
};
//# sourceMappingURL=dropdownActionViewItem.js.map
