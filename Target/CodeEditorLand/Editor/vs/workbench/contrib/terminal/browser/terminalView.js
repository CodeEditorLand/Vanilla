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
import * as nls from "../../../../nls.js";
import * as dom from "../../../../base/browser/dom.js";
import { Action, IAction } from "../../../../base/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService, IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService, Themable } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { switchTerminalActionViewItemSeparator, switchTerminalShowTabsTitle } from "./terminalActions.js";
import { INotificationService, IPromptChoice, Severity } from "../../../../platform/notification/common/notification.js";
import { ICreateTerminalOptions, ITerminalConfigurationService, ITerminalGroupService, ITerminalInstance, ITerminalService, TerminalConnectionState, TerminalDataTransfers } from "./terminal.js";
import { ViewPane, IViewPaneOptions } from "../../../browser/parts/views/viewPane.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IMenu, IMenuService, MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { ITerminalProfileResolverService, ITerminalProfileService, TerminalCommandId } from "../common/terminal.js";
import { TerminalSettingId, ITerminalProfile, TerminalLocation } from "../../../../platform/terminal/common/terminal.js";
import { ActionViewItem, IBaseActionViewItemOptions, SelectActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { asCssVariable, selectBorder } from "../../../../platform/theme/common/colorRegistry.js";
import { ISelectOptionItem } from "../../../../base/browser/ui/selectBox/selectBox.js";
import { IActionViewItem } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { TerminalTabbedView } from "./terminalTabbedView.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { getColorForSeverity } from "./terminalStatusList.js";
import { createAndFillInContextMenuActions, MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { DropdownWithPrimaryActionViewItem } from "../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";
import { DisposableStore, dispose, IDisposable, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { getColorClass, getUriClasses } from "./terminalIcon.js";
import { getTerminalActionBarArgs } from "./terminalMenus.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import { getInstanceHoverInfo } from "./terminalTooltip.js";
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
import { defaultSelectBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { Event } from "../../../../base/common/event.js";
import { IHoverDelegate, IHoverDelegateOptions } from "../../../../base/browser/ui/hover/hoverDelegate.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { InstanceContext, TerminalContextActionRunner } from "./terminalContextMenu.js";
import { MicrotaskDelay } from "../../../../base/common/symbols.js";
let TerminalViewPane = class extends ViewPane {
  constructor(options, keybindingService, _contextKeyService, viewDescriptorService, _configurationService, _contextMenuService, _instantiationService, _terminalService, _terminalConfigurationService, _terminalGroupService, themeService, telemetryService, hoverService, _notificationService, _keybindingService, openerService, _menuService, _terminalProfileService, _terminalProfileResolverService, _themeService, _accessibilityService) {
    super(options, keybindingService, _contextMenuService, _configurationService, _contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, telemetryService, hoverService);
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._contextMenuService = _contextMenuService;
    this._instantiationService = _instantiationService;
    this._terminalService = _terminalService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalGroupService = _terminalGroupService;
    this._notificationService = _notificationService;
    this._keybindingService = _keybindingService;
    this._menuService = _menuService;
    this._terminalProfileService = _terminalProfileService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._themeService = _themeService;
    this._accessibilityService = _accessibilityService;
    this._register(this._terminalService.onDidRegisterProcessSupport(() => {
      this._onDidChangeViewWelcomeState.fire();
    }));
    this._register(this._terminalService.onDidChangeInstances(() => {
      if (this._hasWelcomeScreen() && this._terminalGroupService.instances.length <= 1) {
        this._onDidChangeViewWelcomeState.fire();
      }
      if (!this._parentDomElement) {
        return;
      }
      if (!this._terminalTabbedView) {
        this._createTabsView();
      }
      if (this._terminalGroupService.instances.length === 1) {
        this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
      }
    }));
    this._dropdownMenu = this._register(this._menuService.createMenu(MenuId.TerminalNewDropdownContext, this._contextKeyService));
    this._singleTabMenu = this._register(this._menuService.createMenu(MenuId.TerminalTabContext, this._contextKeyService));
    this._register(this._terminalProfileService.onDidChangeAvailableProfiles((profiles) => this._updateTabActionBar(profiles)));
    this._viewShowing = TerminalContextKeys.viewShowing.bindTo(this._contextKeyService);
    this._register(this.onDidChangeBodyVisibility((e) => {
      if (e) {
        this._terminalTabbedView?.rerenderTabs();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (this._parentDomElement && (e.affectsConfiguration(TerminalSettingId.ShellIntegrationDecorationsEnabled) || e.affectsConfiguration(TerminalSettingId.ShellIntegrationEnabled))) {
        this._updateForShellIntegration(this._parentDomElement);
      }
    }));
    this._register(this._terminalService.onDidCreateInstance((i) => {
      i.capabilities.onDidAddCapabilityType((c) => {
        if (c === TerminalCapability.CommandDetection && this._gutterDecorationsEnabled()) {
          this._parentDomElement?.classList.add("shell-integration");
        }
      });
    }));
  }
  static {
    __name(this, "TerminalViewPane");
  }
  _parentDomElement;
  _terminalTabbedView;
  get terminalTabbedView() {
    return this._terminalTabbedView;
  }
  _isInitialized = false;
  _newDropdown = this._register(new MutableDisposable());
  _dropdownMenu;
  _singleTabMenu;
  _viewShowing;
  _disposableStore = this._register(new DisposableStore());
  _updateForShellIntegration(container) {
    container.classList.toggle("shell-integration", this._gutterDecorationsEnabled());
  }
  _gutterDecorationsEnabled() {
    const decorationsEnabled = this._configurationService.getValue(TerminalSettingId.ShellIntegrationDecorationsEnabled);
    return (decorationsEnabled === "both" || decorationsEnabled === "gutter") && this._configurationService.getValue(TerminalSettingId.ShellIntegrationEnabled);
  }
  _initializeTerminal(checkRestoredTerminals) {
    if (this.isBodyVisible() && this._terminalService.isProcessSupportRegistered && this._terminalService.connectionState === TerminalConnectionState.Connected) {
      const wasInitialized = this._isInitialized;
      this._isInitialized = true;
      let hideOnStartup = "never";
      if (!wasInitialized) {
        hideOnStartup = this._configurationService.getValue(TerminalSettingId.HideOnStartup);
        if (hideOnStartup === "always") {
          this._terminalGroupService.hidePanel();
        }
      }
      let shouldCreate = this._terminalGroupService.groups.length === 0;
      if (checkRestoredTerminals) {
        shouldCreate &&= this._terminalService.restoredGroupCount === 0;
      }
      if (!shouldCreate) {
        return;
      }
      if (!wasInitialized) {
        switch (hideOnStartup) {
          case "never":
            this._terminalService.createTerminal({ location: TerminalLocation.Panel });
            break;
          case "whenEmpty":
            if (this._terminalService.restoredGroupCount === 0) {
              this._terminalGroupService.hidePanel();
            }
            break;
        }
        return;
      }
      this._terminalService.createTerminal({ location: TerminalLocation.Panel });
    }
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  renderBody(container) {
    super.renderBody(container);
    if (!this._parentDomElement) {
      this._updateForShellIntegration(container);
    }
    this._parentDomElement = container;
    this._parentDomElement.classList.add("integrated-terminal");
    dom.createStyleSheet(this._parentDomElement);
    this._instantiationService.createInstance(TerminalThemeIconStyle, this._parentDomElement);
    if (!this.shouldShowWelcome()) {
      this._createTabsView();
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TerminalSettingId.FontFamily) || e.affectsConfiguration("editor.fontFamily")) {
        if (!this._terminalConfigurationService.configFontIsMonospace()) {
          const choices = [{
            label: nls.localize("terminal.useMonospace", "Use 'monospace'"),
            run: /* @__PURE__ */ __name(() => this.configurationService.updateValue(TerminalSettingId.FontFamily, "monospace"), "run")
          }];
          this._notificationService.prompt(Severity.Warning, nls.localize("terminal.monospaceOnly", "The terminal only supports monospace fonts. Be sure to restart VS Code if this is a newly installed font."), choices);
        }
      }
    }));
    this._register(this.onDidChangeBodyVisibility(async (visible) => {
      this._viewShowing.set(visible);
      if (visible) {
        if (this._hasWelcomeScreen()) {
          this._onDidChangeViewWelcomeState.fire();
        }
        this._initializeTerminal(false);
        this._terminalGroupService.showPanel(false);
      } else {
        for (const instance of this._terminalGroupService.instances) {
          instance.resetFocusContextKey();
        }
      }
      this._terminalGroupService.updateVisibility();
    }));
    this._register(this._terminalService.onDidChangeConnectionState(() => this._initializeTerminal(true)));
    this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
  }
  _createTabsView() {
    if (!this._parentDomElement) {
      return;
    }
    this._terminalTabbedView = this._register(this.instantiationService.createInstance(TerminalTabbedView, this._parentDomElement));
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this._terminalTabbedView?.layout(width, height);
  }
  getActionViewItem(action, options) {
    switch (action.id) {
      case TerminalCommandId.Split: {
        const that = this;
        const panelOnlySplitAction = new class extends Action {
          constructor() {
            super(action.id, action.label, action.class, action.enabled);
            this.checked = action.checked;
            this.tooltip = action.tooltip;
            this._register(action);
          }
          async run() {
            const instance = that._terminalGroupService.activeInstance;
            if (instance) {
              const newInstance = await that._terminalService.createTerminal({ location: { parentTerminal: instance } });
              return newInstance?.focusWhenReady();
            }
            return;
          }
        }();
        return new ActionViewItem(action, panelOnlySplitAction, { ...options, icon: true, label: false, keybinding: this._getKeybindingLabel(action) });
      }
      case TerminalCommandId.SwitchTerminal: {
        return this._instantiationService.createInstance(SwitchTerminalActionViewItem, action);
      }
      case TerminalCommandId.Focus: {
        if (action instanceof MenuItemAction) {
          const actions = [];
          createAndFillInContextMenuActions(this._singleTabMenu, { shouldForwardArgs: true }, actions);
          return this._instantiationService.createInstance(SingleTerminalTabActionViewItem, action, actions);
        }
      }
      case TerminalCommandId.New: {
        if (action instanceof MenuItemAction) {
          const actions = getTerminalActionBarArgs(TerminalLocation.Panel, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
          this._registerDisposableActions(actions.dropdownAction, actions.dropdownMenuActions);
          this._newDropdown.value = new DropdownWithPrimaryActionViewItem(action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this._contextMenuService, { hoverDelegate: options.hoverDelegate }, this._keybindingService, this._notificationService, this._contextKeyService, this._themeService, this._accessibilityService);
          this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
          return this._newDropdown.value;
        }
      }
    }
    return super.getActionViewItem(action, options);
  }
  /**
   * Actions might be of type Action (disposable) or Separator or SubmenuAction, which don't extend Disposable
   */
  _registerDisposableActions(dropdownAction, dropdownMenuActions) {
    this._disposableStore.clear();
    if (dropdownAction instanceof Action) {
      this._disposableStore.add(dropdownAction);
    }
    dropdownMenuActions.filter((a) => a instanceof Action).forEach((a) => this._disposableStore.add(a));
  }
  _getDefaultProfileName() {
    let defaultProfileName;
    try {
      defaultProfileName = this._terminalProfileService.getDefaultProfileName();
    } catch (e) {
      defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
    }
    return defaultProfileName;
  }
  _getKeybindingLabel(action) {
    return this._keybindingService.lookupKeybinding(action.id)?.getLabel() ?? void 0;
  }
  _updateTabActionBar(profiles) {
    const actions = getTerminalActionBarArgs(TerminalLocation.Panel, profiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
    this._registerDisposableActions(actions.dropdownAction, actions.dropdownMenuActions);
    this._newDropdown.value?.update(actions.dropdownAction, actions.dropdownMenuActions);
  }
  focus() {
    super.focus();
    if (this._terminalService.connectionState === TerminalConnectionState.Connected) {
      this._terminalGroupService.showPanel(true);
      return;
    }
    const previousActiveElement = this.element.ownerDocument.activeElement;
    if (previousActiveElement) {
      this._register(this._terminalService.onDidChangeConnectionState(() => {
        if (previousActiveElement && dom.isActiveElement(previousActiveElement)) {
          this._terminalGroupService.showPanel(true);
        }
      }));
    }
  }
  _hasWelcomeScreen() {
    return !this._terminalService.isProcessSupportRegistered;
  }
  shouldShowWelcome() {
    return this._hasWelcomeScreen() && this._terminalService.instances.length === 0;
  }
};
TerminalViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ITerminalService),
  __decorateParam(8, ITerminalConfigurationService),
  __decorateParam(9, ITerminalGroupService),
  __decorateParam(10, IThemeService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, IHoverService),
  __decorateParam(13, INotificationService),
  __decorateParam(14, IKeybindingService),
  __decorateParam(15, IOpenerService),
  __decorateParam(16, IMenuService),
  __decorateParam(17, ITerminalProfileService),
  __decorateParam(18, ITerminalProfileResolverService),
  __decorateParam(19, IThemeService),
  __decorateParam(20, IAccessibilityService)
], TerminalViewPane);
let SwitchTerminalActionViewItem = class extends SelectActionViewItem {
  constructor(action, _terminalService, _terminalGroupService, contextViewService, terminalProfileService) {
    super(null, action, getTerminalSelectOpenItems(_terminalService, _terminalGroupService), _terminalGroupService.activeGroupIndex, contextViewService, defaultSelectBoxStyles, { ariaLabel: nls.localize("terminals", "Open Terminals."), optionsAsChildren: true });
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._register(_terminalService.onDidChangeInstances(() => this._updateItems(), this));
    this._register(_terminalService.onDidChangeActiveGroup(() => this._updateItems(), this));
    this._register(_terminalService.onDidChangeActiveInstance(() => this._updateItems(), this));
    this._register(_terminalService.onAnyInstanceTitleChange(() => this._updateItems(), this));
    this._register(_terminalGroupService.onDidChangeGroups(() => this._updateItems(), this));
    this._register(_terminalService.onDidChangeConnectionState(() => this._updateItems(), this));
    this._register(terminalProfileService.onDidChangeAvailableProfiles(() => this._updateItems(), this));
    this._register(_terminalService.onAnyInstancePrimaryStatusChange(() => this._updateItems(), this));
  }
  static {
    __name(this, "SwitchTerminalActionViewItem");
  }
  render(container) {
    super.render(container);
    container.classList.add("switch-terminal");
    container.style.borderColor = asCssVariable(selectBorder);
  }
  _updateItems() {
    const options = getTerminalSelectOpenItems(this._terminalService, this._terminalGroupService);
    this.setOptions(options, this._terminalGroupService.activeGroupIndex);
  }
};
SwitchTerminalActionViewItem = __decorateClass([
  __decorateParam(1, ITerminalService),
  __decorateParam(2, ITerminalGroupService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, ITerminalProfileService)
], SwitchTerminalActionViewItem);
function getTerminalSelectOpenItems(terminalService, terminalGroupService) {
  let items;
  if (terminalService.connectionState === TerminalConnectionState.Connected) {
    items = terminalGroupService.getGroupLabels().map((label) => {
      return { text: label };
    });
  } else {
    items = [{ text: nls.localize("terminalConnectingLabel", "Starting...") }];
  }
  items.push({ text: switchTerminalActionViewItemSeparator, isDisabled: true });
  items.push({ text: switchTerminalShowTabsTitle });
  return items;
}
__name(getTerminalSelectOpenItems, "getTerminalSelectOpenItems");
let SingleTerminalTabActionViewItem = class extends MenuEntryActionViewItem {
  constructor(action, _actions, keybindingService, notificationService, contextKeyService, themeService, _terminalService, _terminaConfigurationService, _terminalGroupService, contextMenuService, _commandService, _instantiationService, _accessibilityService) {
    super(action, {
      draggable: true,
      hoverDelegate: _instantiationService.createInstance(SingleTabHoverDelegate)
    }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _accessibilityService);
    this._actions = _actions;
    this._terminalService = _terminalService;
    this._terminaConfigurationService = _terminaConfigurationService;
    this._terminalGroupService = _terminalGroupService;
    this._commandService = _commandService;
    this._instantiationService = _instantiationService;
    this._register(Event.debounce(Event.any(
      this._terminalService.onAnyInstancePrimaryStatusChange,
      this._terminalGroupService.onDidChangeActiveInstance,
      Event.map(this._terminalService.onAnyInstanceIconChange, (e) => e.instance),
      this._terminalService.onAnyInstanceTitleChange,
      this._terminalService.onDidChangeInstanceCapability
    ), (last, e) => {
      if (!last) {
        last = /* @__PURE__ */ new Set();
      }
      if (e) {
        last.add(e);
      }
      return last;
    }, MicrotaskDelay)((merged) => {
      for (const e of merged) {
        this.updateLabel(e);
      }
    }));
    this._register(toDisposable(() => dispose(this._elementDisposables)));
  }
  static {
    __name(this, "SingleTerminalTabActionViewItem");
  }
  _color;
  _altCommand;
  _class;
  _elementDisposables = [];
  async onClick(event) {
    this._terminalGroupService.lastAccessedMenu = "inline-tab";
    if (event.altKey && this._menuItemAction.alt) {
      this._commandService.executeCommand(this._menuItemAction.alt.id, { location: TerminalLocation.Panel });
    } else {
      this._openContextMenu();
    }
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  updateLabel(e) {
    if (e && e !== this._terminalGroupService.activeInstance) {
      return;
    }
    if (this._elementDisposables.length === 0 && this.element && this.label) {
      this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.CONTEXT_MENU, (e2) => {
        if (e2.button === 2) {
          this._openContextMenu();
          e2.preventDefault();
        }
      }));
      this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.AUXCLICK, (e2) => {
        if (e2.button === 1) {
          const instance = this._terminalGroupService.activeInstance;
          if (instance) {
            this._terminalService.safeDisposeTerminal(instance);
          }
          e2.preventDefault();
        }
      }));
      this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.DRAG_START, (e2) => {
        const instance = this._terminalGroupService.activeInstance;
        if (e2.dataTransfer && instance) {
          e2.dataTransfer.setData(TerminalDataTransfers.Terminals, JSON.stringify([instance.resource.toString()]));
        }
      }));
    }
    if (this.label) {
      const label = this.label;
      const instance = this._terminalGroupService.activeInstance;
      if (!instance) {
        dom.reset(label, "");
        return;
      }
      label.classList.add("single-terminal-tab");
      let colorStyle = "";
      const primaryStatus = instance.statusList.primary;
      if (primaryStatus) {
        const colorKey = getColorForSeverity(primaryStatus.severity);
        this._themeService.getColorTheme();
        const foundColor = this._themeService.getColorTheme().getColor(colorKey);
        if (foundColor) {
          colorStyle = foundColor.toString();
        }
      }
      label.style.color = colorStyle;
      dom.reset(label, ...renderLabelWithIcons(this._instantiationService.invokeFunction(getSingleTabLabel, instance, this._terminaConfigurationService.config.tabs.separator, ThemeIcon.isThemeIcon(this._commandAction.item.icon) ? this._commandAction.item.icon : void 0)));
      if (this._altCommand) {
        label.classList.remove(this._altCommand);
        this._altCommand = void 0;
      }
      if (this._color) {
        label.classList.remove(this._color);
        this._color = void 0;
      }
      if (this._class) {
        label.classList.remove(this._class);
        label.classList.remove("terminal-uri-icon");
        this._class = void 0;
      }
      const colorClass = getColorClass(instance);
      if (colorClass) {
        this._color = colorClass;
        label.classList.add(colorClass);
      }
      const uriClasses = getUriClasses(instance, this._themeService.getColorTheme().type);
      if (uriClasses) {
        this._class = uriClasses?.[0];
        label.classList.add(...uriClasses);
      }
      if (this._commandAction.item.icon) {
        this._altCommand = `alt-command`;
        label.classList.add(this._altCommand);
      }
      this.updateTooltip();
    }
  }
  _openContextMenu() {
    this._contextMenuService.showContextMenu({
      actionRunner: new TerminalContextActionRunner(),
      getAnchor: /* @__PURE__ */ __name(() => this.element, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => this._actions, "getActions"),
      // The context is always the active instance in the terminal view
      getActionsContext: /* @__PURE__ */ __name(() => {
        const instance = this._terminalGroupService.activeInstance;
        return instance ? [new InstanceContext(instance)] : [];
      }, "getActionsContext")
    });
  }
};
SingleTerminalTabActionViewItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, ITerminalService),
  __decorateParam(7, ITerminalConfigurationService),
  __decorateParam(8, ITerminalGroupService),
  __decorateParam(9, IContextMenuService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IAccessibilityService)
], SingleTerminalTabActionViewItem);
function getSingleTabLabel(accessor, instance, separator, icon) {
  if (!instance || !instance.title) {
    return "";
  }
  const iconId = ThemeIcon.isThemeIcon(instance.icon) ? instance.icon.id : accessor.get(ITerminalProfileResolverService).getDefaultIcon().id;
  const label = `$(${icon?.id || iconId}) ${getSingleTabTitle(instance, separator)}`;
  const primaryStatus = instance.statusList.primary;
  if (!primaryStatus?.icon) {
    return label;
  }
  return `${label} $(${primaryStatus.icon.id})`;
}
__name(getSingleTabLabel, "getSingleTabLabel");
function getSingleTabTitle(instance, separator) {
  if (!instance) {
    return "";
  }
  return !instance.description ? instance.title : `${instance.title} ${separator} ${instance.description}`;
}
__name(getSingleTabTitle, "getSingleTabTitle");
let TerminalThemeIconStyle = class extends Themable {
  constructor(container, _themeService, _terminalService, _terminalGroupService) {
    super(_themeService);
    this._themeService = _themeService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._registerListeners();
    this._styleElement = dom.createStyleSheet(container);
    this._register(toDisposable(() => this._styleElement.remove()));
    this.updateStyles();
  }
  static {
    __name(this, "TerminalThemeIconStyle");
  }
  _styleElement;
  _registerListeners() {
    this._register(this._terminalService.onAnyInstanceIconChange(() => this.updateStyles()));
    this._register(this._terminalService.onDidChangeInstances(() => this.updateStyles()));
    this._register(this._terminalGroupService.onDidChangeGroups(() => this.updateStyles()));
  }
  updateStyles() {
    super.updateStyles();
    const colorTheme = this._themeService.getColorTheme();
    let css = "";
    for (const instance of this._terminalService.instances) {
      const icon = instance.icon;
      if (!icon) {
        continue;
      }
      let uri = void 0;
      if (icon instanceof URI) {
        uri = icon;
      } else if (icon instanceof Object && "light" in icon && "dark" in icon) {
        uri = colorTheme.type === ColorScheme.LIGHT ? icon.light : icon.dark;
      }
      const iconClasses = getUriClasses(instance, colorTheme.type);
      if (uri instanceof URI && iconClasses && iconClasses.length > 1) {
        css += `.monaco-workbench .${iconClasses[0]} .monaco-highlighted-label .codicon, .monaco-action-bar .terminal-uri-icon.single-terminal-tab.action-label:not(.alt-command) .codicon{background-image: ${dom.asCSSUrl(uri)};}`;
      }
    }
    for (const instance of this._terminalService.instances) {
      const colorClass = getColorClass(instance);
      if (!colorClass || !instance.color) {
        continue;
      }
      const color = colorTheme.getColor(instance.color);
      if (color) {
        css += `.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon){ color: ${color} !important; }`;
      }
    }
    this._styleElement.textContent = css;
  }
};
TerminalThemeIconStyle = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, ITerminalService),
  __decorateParam(3, ITerminalGroupService)
], TerminalThemeIconStyle);
let SingleTabHoverDelegate = class {
  constructor(_configurationService, _hoverService, _terminalGroupService) {
    this._configurationService = _configurationService;
    this._hoverService = _hoverService;
    this._terminalGroupService = _terminalGroupService;
  }
  static {
    __name(this, "SingleTabHoverDelegate");
  }
  _lastHoverHideTime = 0;
  placement = "element";
  get delay() {
    return Date.now() - this._lastHoverHideTime < 200 ? 0 : this._configurationService.getValue("workbench.hover.delay");
  }
  showHover(options, focus) {
    const instance = this._terminalGroupService.activeInstance;
    if (!instance) {
      return;
    }
    const hoverInfo = getInstanceHoverInfo(instance);
    return this._hoverService.showHover({
      ...options,
      content: hoverInfo.content,
      actions: hoverInfo.actions
    }, focus);
  }
  onDidHideHover() {
    this._lastHoverHideTime = Date.now();
  }
};
SingleTabHoverDelegate = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IHoverService),
  __decorateParam(2, ITerminalGroupService)
], SingleTabHoverDelegate);
export {
  TerminalViewPane
};
//# sourceMappingURL=terminalView.js.map
