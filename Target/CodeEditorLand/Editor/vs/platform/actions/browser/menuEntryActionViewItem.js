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
import { $, addDisposableListener, append, asCSSUrl, EventType, ModifierKeyEmitter, prepend } from "../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { ActionViewItem, BaseActionViewItem, SelectActionViewItem } from "../../../base/browser/ui/actionbar/actionViewItems.js";
import { DropdownMenuActionViewItem, IDropdownMenuActionViewItemOptions } from "../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { ActionRunner, IAction, IRunEvent, Separator, SubmenuAction } from "../../../base/common/actions.js";
import { Event } from "../../../base/common/event.js";
import { UILabelProvider } from "../../../base/common/keybindingLabels.js";
import { KeyCode } from "../../../base/common/keyCodes.js";
import { combinedDisposable, MutableDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { isLinux, isWindows, OS } from "../../../base/common/platform.js";
import "./menuEntryActionViewItem.css";
import { localize } from "../../../nls.js";
import { IMenu, IMenuActionOptions, IMenuService, MenuItemAction, SubmenuItemAction } from "../common/actions.js";
import { ICommandAction, isICommandActionToggleInfo } from "../../action/common/action.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IContextMenuService, IContextViewService } from "../../contextview/browser/contextView.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { INotificationService } from "../../notification/common/notification.js";
import { IStorageService, StorageScope, StorageTarget } from "../../storage/common/storage.js";
import { IThemeService } from "../../theme/common/themeService.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { isDark } from "../../theme/common/theme.js";
import { IHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { assertType } from "../../../base/common/types.js";
import { asCssVariable, selectBorder } from "../../theme/common/colorRegistry.js";
import { defaultSelectBoxStyles } from "../../theme/browser/defaultStyles.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.js";
import { ResolvedKeybinding } from "../../../base/common/keybindings.js";
function createAndFillInContextMenuActions(menu, optionsOrTarget, targetOrPrimaryGroup, primaryGroupOrUndefined) {
  let target;
  let primaryGroup;
  let groups;
  if (Array.isArray(menu)) {
    groups = menu;
    target = optionsOrTarget;
    primaryGroup = targetOrPrimaryGroup;
  } else {
    const options = optionsOrTarget;
    groups = menu.getActions(options);
    target = targetOrPrimaryGroup;
    primaryGroup = primaryGroupOrUndefined;
  }
  const modifierKeyEmitter = ModifierKeyEmitter.getInstance();
  const useAlternativeActions = modifierKeyEmitter.keyStatus.altKey || (isWindows || isLinux) && modifierKeyEmitter.keyStatus.shiftKey;
  fillInActions(groups, target, useAlternativeActions, primaryGroup ? (actionGroup) => actionGroup === primaryGroup : (actionGroup) => actionGroup === "navigation");
}
__name(createAndFillInContextMenuActions, "createAndFillInContextMenuActions");
function createAndFillInActionBarActions(menu, optionsOrTarget, targetOrPrimaryGroup, primaryGroupOrShouldInlineSubmenu, shouldInlineSubmenuOrUseSeparatorsInPrimaryActions, useSeparatorsInPrimaryActionsOrUndefined) {
  let target;
  let primaryGroup;
  let shouldInlineSubmenu;
  let useSeparatorsInPrimaryActions;
  let groups;
  if (Array.isArray(menu)) {
    groups = menu;
    target = optionsOrTarget;
    primaryGroup = targetOrPrimaryGroup;
    shouldInlineSubmenu = primaryGroupOrShouldInlineSubmenu;
    useSeparatorsInPrimaryActions = shouldInlineSubmenuOrUseSeparatorsInPrimaryActions;
  } else {
    const options = optionsOrTarget;
    groups = menu.getActions(options);
    target = targetOrPrimaryGroup;
    primaryGroup = primaryGroupOrShouldInlineSubmenu;
    shouldInlineSubmenu = shouldInlineSubmenuOrUseSeparatorsInPrimaryActions;
    useSeparatorsInPrimaryActions = useSeparatorsInPrimaryActionsOrUndefined;
  }
  const isPrimaryAction = typeof primaryGroup === "string" ? (actionGroup) => actionGroup === primaryGroup : primaryGroup;
  fillInActions(groups, target, false, isPrimaryAction, shouldInlineSubmenu, useSeparatorsInPrimaryActions);
}
__name(createAndFillInActionBarActions, "createAndFillInActionBarActions");
function fillInActions(groups, target, useAlternativeActions, isPrimaryAction = (actionGroup) => actionGroup === "navigation", shouldInlineSubmenu = () => false, useSeparatorsInPrimaryActions = false) {
  let primaryBucket;
  let secondaryBucket;
  if (Array.isArray(target)) {
    primaryBucket = target;
    secondaryBucket = target;
  } else {
    primaryBucket = target.primary;
    secondaryBucket = target.secondary;
  }
  const submenuInfo = /* @__PURE__ */ new Set();
  for (const [group, actions] of groups) {
    let target2;
    if (isPrimaryAction(group)) {
      target2 = primaryBucket;
      if (target2.length > 0 && useSeparatorsInPrimaryActions) {
        target2.push(new Separator());
      }
    } else {
      target2 = secondaryBucket;
      if (target2.length > 0) {
        target2.push(new Separator());
      }
    }
    for (let action of actions) {
      if (useAlternativeActions) {
        action = action instanceof MenuItemAction && action.alt ? action.alt : action;
      }
      const newLen = target2.push(action);
      if (action instanceof SubmenuAction) {
        submenuInfo.add({ group, action, index: newLen - 1 });
      }
    }
  }
  for (const { group, action, index } of submenuInfo) {
    const target2 = isPrimaryAction(group) ? primaryBucket : secondaryBucket;
    const submenuActions = action.actions;
    if (shouldInlineSubmenu(action, group, target2.length)) {
      target2.splice(index, 1, ...submenuActions);
    }
  }
}
__name(fillInActions, "fillInActions");
let MenuEntryActionViewItem = class extends ActionViewItem {
  constructor(action, _options, _keybindingService, _notificationService, _contextKeyService, _themeService, _contextMenuService, _accessibilityService) {
    super(void 0, action, { icon: !!(action.class || action.item.icon), label: !action.class && !action.item.icon, draggable: _options?.draggable, keybinding: _options?.keybinding, hoverDelegate: _options?.hoverDelegate });
    this._options = _options;
    this._keybindingService = _keybindingService;
    this._notificationService = _notificationService;
    this._contextKeyService = _contextKeyService;
    this._themeService = _themeService;
    this._contextMenuService = _contextMenuService;
    this._accessibilityService = _accessibilityService;
    this._altKey = ModifierKeyEmitter.getInstance();
  }
  static {
    __name(this, "MenuEntryActionViewItem");
  }
  _wantsAltCommand = false;
  _itemClassDispose = this._register(new MutableDisposable());
  _altKey;
  get _menuItemAction() {
    return this._action;
  }
  get _commandAction() {
    return this._wantsAltCommand && this._menuItemAction.alt || this._menuItemAction;
  }
  async onClick(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await this.actionRunner.run(this._commandAction, this._context);
    } catch (err) {
      this._notificationService.error(err);
    }
  }
  render(container) {
    super.render(container);
    container.classList.add("menu-entry");
    if (this.options.icon) {
      this._updateItemClass(this._menuItemAction.item);
    }
    if (this._menuItemAction.alt) {
      let isMouseOver = false;
      const updateAltState = /* @__PURE__ */ __name(() => {
        const wantsAltCommand = !!this._menuItemAction.alt?.enabled && (!this._accessibilityService.isMotionReduced() || isMouseOver) && (this._altKey.keyStatus.altKey || this._altKey.keyStatus.shiftKey && isMouseOver);
        if (wantsAltCommand !== this._wantsAltCommand) {
          this._wantsAltCommand = wantsAltCommand;
          this.updateLabel();
          this.updateTooltip();
          this.updateClass();
        }
      }, "updateAltState");
      this._register(this._altKey.event(updateAltState));
      this._register(addDisposableListener(container, "mouseleave", (_) => {
        isMouseOver = false;
        updateAltState();
      }));
      this._register(addDisposableListener(container, "mouseenter", (_) => {
        isMouseOver = true;
        updateAltState();
      }));
      updateAltState();
    }
  }
  updateLabel() {
    if (this.options.label && this.label) {
      this.label.textContent = this._commandAction.label;
    }
  }
  getTooltip() {
    const keybinding = this._keybindingService.lookupKeybinding(this._commandAction.id, this._contextKeyService);
    const keybindingLabel = keybinding && keybinding.getLabel();
    const tooltip = this._commandAction.tooltip || this._commandAction.label;
    let title = keybindingLabel ? localize("titleAndKb", "{0} ({1})", tooltip, keybindingLabel) : tooltip;
    if (!this._wantsAltCommand && this._menuItemAction.alt?.enabled) {
      const altTooltip = this._menuItemAction.alt.tooltip || this._menuItemAction.alt.label;
      const altKeybinding = this._keybindingService.lookupKeybinding(this._menuItemAction.alt.id, this._contextKeyService);
      const altKeybindingLabel = altKeybinding && altKeybinding.getLabel();
      const altTitleSection = altKeybindingLabel ? localize("titleAndKb", "{0} ({1})", altTooltip, altKeybindingLabel) : altTooltip;
      title = localize("titleAndKbAndAlt", "{0}\n[{1}] {2}", title, UILabelProvider.modifierLabels[OS].altKey, altTitleSection);
    }
    return title;
  }
  updateClass() {
    if (this.options.icon) {
      if (this._commandAction !== this._menuItemAction) {
        if (this._menuItemAction.alt) {
          this._updateItemClass(this._menuItemAction.alt.item);
        }
      } else {
        this._updateItemClass(this._menuItemAction.item);
      }
    }
  }
  _updateItemClass(item) {
    this._itemClassDispose.value = void 0;
    const { element, label } = this;
    if (!element || !label) {
      return;
    }
    const icon = this._commandAction.checked && isICommandActionToggleInfo(item.toggled) && item.toggled.icon ? item.toggled.icon : item.icon;
    if (!icon) {
      return;
    }
    if (ThemeIcon.isThemeIcon(icon)) {
      const iconClasses = ThemeIcon.asClassNameArray(icon);
      label.classList.add(...iconClasses);
      this._itemClassDispose.value = toDisposable(() => {
        label.classList.remove(...iconClasses);
      });
    } else {
      label.style.backgroundImage = isDark(this._themeService.getColorTheme().type) ? asCSSUrl(icon.dark) : asCSSUrl(icon.light);
      label.classList.add("icon");
      this._itemClassDispose.value = combinedDisposable(
        toDisposable(() => {
          label.style.backgroundImage = "";
          label.classList.remove("icon");
        }),
        this._themeService.onDidColorThemeChange(() => {
          this.updateClass();
        })
      );
    }
  }
};
MenuEntryActionViewItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IAccessibilityService)
], MenuEntryActionViewItem);
class TextOnlyMenuEntryActionViewItem extends MenuEntryActionViewItem {
  static {
    __name(this, "TextOnlyMenuEntryActionViewItem");
  }
  render(container) {
    this.options.label = true;
    this.options.icon = false;
    super.render(container);
    container.classList.add("text-only");
    container.classList.toggle("use-comma", this._options?.useComma ?? false);
  }
  updateLabel() {
    const kb = this._keybindingService.lookupKeybinding(this._action.id, this._contextKeyService);
    if (!kb) {
      return super.updateLabel();
    }
    if (this.label) {
      const kb2 = TextOnlyMenuEntryActionViewItem._symbolPrintEnter(kb);
      if (this._options?.conversational) {
        this.label.textContent = localize({ key: "content2", comment: ['A label with keybindg like "ESC to dismiss"'] }, "{1} to {0}", this._action.label, kb2);
      } else {
        this.label.textContent = localize({ key: "content", comment: ["A label", "A keybinding"] }, "{0} ({1})", this._action.label, kb2);
      }
    }
  }
  static _symbolPrintEnter(kb) {
    return kb.getLabel()?.replace(/\benter\b/gi, "\u23CE").replace(/\bEscape\b/gi, "Esc");
  }
}
let SubmenuEntryActionViewItem = class extends DropdownMenuActionViewItem {
  constructor(action, options, _keybindingService, _contextMenuService, _themeService) {
    const dropdownOptions = {
      ...options,
      menuAsChild: options?.menuAsChild ?? false,
      classNames: options?.classNames ?? (ThemeIcon.isThemeIcon(action.item.icon) ? ThemeIcon.asClassName(action.item.icon) : void 0),
      keybindingProvider: options?.keybindingProvider ?? ((action2) => _keybindingService.lookupKeybinding(action2.id))
    };
    super(action, { getActions: /* @__PURE__ */ __name(() => action.actions, "getActions") }, _contextMenuService, dropdownOptions);
    this._keybindingService = _keybindingService;
    this._contextMenuService = _contextMenuService;
    this._themeService = _themeService;
  }
  static {
    __name(this, "SubmenuEntryActionViewItem");
  }
  render(container) {
    super.render(container);
    assertType(this.element);
    container.classList.add("menu-entry");
    const action = this._action;
    const { icon } = action.item;
    if (icon && !ThemeIcon.isThemeIcon(icon)) {
      this.element.classList.add("icon");
      const setBackgroundImage = /* @__PURE__ */ __name(() => {
        if (this.element) {
          this.element.style.backgroundImage = isDark(this._themeService.getColorTheme().type) ? asCSSUrl(icon.dark) : asCSSUrl(icon.light);
        }
      }, "setBackgroundImage");
      setBackgroundImage();
      this._register(this._themeService.onDidColorThemeChange(() => {
        setBackgroundImage();
      }));
    }
  }
};
SubmenuEntryActionViewItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IThemeService)
], SubmenuEntryActionViewItem);
let DropdownWithDefaultActionViewItem = class extends BaseActionViewItem {
  constructor(submenuAction, options, _keybindingService, _notificationService, _contextMenuService, _menuService, _instaService, _storageService) {
    super(null, submenuAction);
    this._keybindingService = _keybindingService;
    this._notificationService = _notificationService;
    this._contextMenuService = _contextMenuService;
    this._menuService = _menuService;
    this._instaService = _instaService;
    this._storageService = _storageService;
    this._options = options;
    this._storageKey = `${submenuAction.item.submenu.id}_lastActionId`;
    let defaultAction;
    const defaultActionId = options?.persistLastActionId ? _storageService.get(this._storageKey, StorageScope.WORKSPACE) : void 0;
    if (defaultActionId) {
      defaultAction = submenuAction.actions.find((a) => defaultActionId === a.id);
    }
    if (!defaultAction) {
      defaultAction = submenuAction.actions[0];
    }
    this._defaultAction = this._instaService.createInstance(MenuEntryActionViewItem, defaultAction, { keybinding: this._getDefaultActionKeybindingLabel(defaultAction) });
    const dropdownOptions = {
      keybindingProvider: /* @__PURE__ */ __name((action) => this._keybindingService.lookupKeybinding(action.id), "keybindingProvider"),
      ...options,
      menuAsChild: options?.menuAsChild ?? true,
      classNames: options?.classNames ?? ["codicon", "codicon-chevron-down"],
      actionRunner: options?.actionRunner ?? new ActionRunner()
    };
    this._dropdown = new DropdownMenuActionViewItem(submenuAction, submenuAction.actions, this._contextMenuService, dropdownOptions);
    this._register(this._dropdown.actionRunner.onDidRun((e) => {
      if (e.action instanceof MenuItemAction) {
        this.update(e.action);
      }
    }));
  }
  static {
    __name(this, "DropdownWithDefaultActionViewItem");
  }
  _options;
  _defaultAction;
  _dropdown;
  _container = null;
  _storageKey;
  get onDidChangeDropdownVisibility() {
    return this._dropdown.onDidChangeVisibility;
  }
  update(lastAction) {
    if (this._options?.persistLastActionId) {
      this._storageService.store(this._storageKey, lastAction.id, StorageScope.WORKSPACE, StorageTarget.MACHINE);
    }
    this._defaultAction.dispose();
    this._defaultAction = this._instaService.createInstance(MenuEntryActionViewItem, lastAction, { keybinding: this._getDefaultActionKeybindingLabel(lastAction) });
    this._defaultAction.actionRunner = new class extends ActionRunner {
      async runAction(action, context) {
        await action.run(void 0);
      }
    }();
    if (this._container) {
      this._defaultAction.render(prepend(this._container, $(".action-container")));
    }
  }
  _getDefaultActionKeybindingLabel(defaultAction) {
    let defaultActionKeybinding;
    if (this._options?.renderKeybindingWithDefaultActionLabel) {
      const kb = this._keybindingService.lookupKeybinding(defaultAction.id);
      if (kb) {
        defaultActionKeybinding = `(${kb.getLabel()})`;
      }
    }
    return defaultActionKeybinding;
  }
  setActionContext(newContext) {
    super.setActionContext(newContext);
    this._defaultAction.setActionContext(newContext);
    this._dropdown.setActionContext(newContext);
  }
  render(container) {
    this._container = container;
    super.render(this._container);
    this._container.classList.add("monaco-dropdown-with-default");
    const primaryContainer = $(".action-container");
    this._defaultAction.render(append(this._container, primaryContainer));
    this._register(addDisposableListener(primaryContainer, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(KeyCode.RightArrow)) {
        this._defaultAction.element.tabIndex = -1;
        this._dropdown.focus();
        event.stopPropagation();
      }
    }));
    const dropdownContainer = $(".dropdown-action-container");
    this._dropdown.render(append(this._container, dropdownContainer));
    this._register(addDisposableListener(dropdownContainer, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(KeyCode.LeftArrow)) {
        this._defaultAction.element.tabIndex = 0;
        this._dropdown.setFocusable(false);
        this._defaultAction.element?.focus();
        event.stopPropagation();
      }
    }));
  }
  focus(fromRight) {
    if (fromRight) {
      this._dropdown.focus();
    } else {
      this._defaultAction.element.tabIndex = 0;
      this._defaultAction.element.focus();
    }
  }
  blur() {
    this._defaultAction.element.tabIndex = -1;
    this._dropdown.blur();
    this._container.blur();
  }
  setFocusable(focusable) {
    if (focusable) {
      this._defaultAction.element.tabIndex = 0;
    } else {
      this._defaultAction.element.tabIndex = -1;
      this._dropdown.setFocusable(false);
    }
  }
  dispose() {
    this._defaultAction.dispose();
    this._dropdown.dispose();
    super.dispose();
  }
};
DropdownWithDefaultActionViewItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IStorageService)
], DropdownWithDefaultActionViewItem);
let SubmenuEntrySelectActionViewItem = class extends SelectActionViewItem {
  static {
    __name(this, "SubmenuEntrySelectActionViewItem");
  }
  constructor(action, contextViewService) {
    super(null, action, action.actions.map((a) => ({
      text: a.id === Separator.ID ? "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" : a.label,
      isDisabled: !a.enabled
    })), 0, contextViewService, defaultSelectBoxStyles, { ariaLabel: action.tooltip, optionsAsChildren: true });
    this.select(Math.max(0, action.actions.findIndex((a) => a.checked)));
  }
  render(container) {
    super.render(container);
    container.style.borderColor = asCssVariable(selectBorder);
  }
  runAction(option, index) {
    const action = this.action.actions[index];
    if (action) {
      this.actionRunner.run(action);
    }
  }
};
SubmenuEntrySelectActionViewItem = __decorateClass([
  __decorateParam(1, IContextViewService)
], SubmenuEntrySelectActionViewItem);
function createActionViewItem(instaService, action, options) {
  if (action instanceof MenuItemAction) {
    return instaService.createInstance(MenuEntryActionViewItem, action, options);
  } else if (action instanceof SubmenuItemAction) {
    if (action.item.isSelection) {
      return instaService.createInstance(SubmenuEntrySelectActionViewItem, action);
    } else {
      if (action.item.rememberDefaultAction) {
        return instaService.createInstance(DropdownWithDefaultActionViewItem, action, { ...options, persistLastActionId: true });
      } else {
        return instaService.createInstance(SubmenuEntryActionViewItem, action, options);
      }
    }
  } else {
    return void 0;
  }
}
__name(createActionViewItem, "createActionViewItem");
export {
  DropdownWithDefaultActionViewItem,
  MenuEntryActionViewItem,
  SubmenuEntryActionViewItem,
  TextOnlyMenuEntryActionViewItem,
  createActionViewItem,
  createAndFillInActionBarActions,
  createAndFillInContextMenuActions
};
//# sourceMappingURL=menuEntryActionViewItem.js.map
