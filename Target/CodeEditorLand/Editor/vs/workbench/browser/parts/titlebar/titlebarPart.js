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
import "./media/titlebarpart.css";
import {
  getWCOTitlebarAreaRect,
  getZoomFactor,
  isWCOEnabled
} from "../../../../base/browser/browser.js";
import {
  $,
  Dimension,
  EventHelper,
  EventType,
  addDisposableListener,
  append,
  getActiveDocument,
  getWindow,
  getWindowId,
  isAncestor,
  isHTMLElement,
  prepend,
  reset
} from "../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import {
  ActionsOrientation,
  prepareActions
} from "../../../../base/browser/ui/actionbar/actionbar.js";
import { AnchorAlignment } from "../../../../base/browser/ui/contextview/contextview.js";
import { createInstantHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import {
  mainWindow
} from "../../../../base/browser/window.js";
import { ActionRunner } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Color } from "../../../../base/common/color.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import {
  isLinux,
  isMacintosh,
  isNative,
  isWeb,
  isWindows,
  platformLocale
} from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  createActionViewItem,
  createAndFillInActionBarActions
} from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import {
  Action2,
  IMenuService,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import {
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import {
  IStorageService,
  StorageScope
} from "../../../../platform/storage/common/storage.js";
import { getIconRegistry } from "../../../../platform/theme/common/iconRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  DEFAULT_CUSTOM_TITLEBAR_HEIGHT,
  getMenuBarVisibility,
  getTitleBarStyle,
  hasCustomTitlebar,
  hasNativeTitlebar
} from "../../../../platform/window/common/window.js";
import {
  ACCOUNTS_ACTIVITY_ID,
  GLOBAL_ACTIVITY_ID
} from "../../../common/activity.js";
import {
  TITLE_BAR_ACTIVE_BACKGROUND,
  TITLE_BAR_ACTIVE_FOREGROUND,
  TITLE_BAR_BORDER,
  TITLE_BAR_INACTIVE_BACKGROUND,
  TITLE_BAR_INACTIVE_FOREGROUND,
  WORKBENCH_BACKGROUND
} from "../../../common/theme.js";
import {
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import {
  ActivityBarPosition,
  EditorActionsLocation,
  EditorTabsMode,
  IWorkbenchLayoutService,
  LayoutSettings,
  Parts
} from "../../../services/layout/browser/layoutService.js";
import { MultiWindowParts, Part } from "../../part.js";
import { EDITOR_CORE_NAVIGATION_COMMANDS } from "../editor/editorCommands.js";
import { EditorPane } from "../editor/editorPane.js";
import { EditorCommandsContextActionRunner } from "../editor/editorTabsControl.js";
import {
  AccountsActivityActionViewItem,
  SimpleAccountActivityActionViewItem,
  SimpleGlobalActivityActionViewItem,
  isAccountsActionVisible
} from "../globalCompositeBar.js";
import { CommandCenterControl } from "./commandCenterControl.js";
import { CustomMenubarControl } from "./menubarControl.js";
import {
  ACCOUNTS_ACTIVITY_TILE_ACTION,
  GLOBAL_ACTIVITY_TITLE_ACTION
} from "./titlebarActions.js";
import { WindowTitle } from "./windowTitle.js";
let BrowserTitleService = class extends MultiWindowParts {
  constructor(instantiationService, storageService, themeService) {
    super("workbench.titleService", themeService, storageService);
    this.instantiationService = instantiationService;
    this._register(this.registerPart(this.mainPart));
    this.registerActions();
    this.registerAPICommands();
  }
  static {
    __name(this, "BrowserTitleService");
  }
  mainPart = this._register(this.createMainTitlebarPart());
  createMainTitlebarPart() {
    return this.instantiationService.createInstance(
      MainBrowserTitlebarPart
    );
  }
  registerActions() {
    const that = this;
    this._register(
      registerAction2(
        class FocusTitleBar extends Action2 {
          static {
            __name(this, "FocusTitleBar");
          }
          constructor() {
            super({
              id: `workbench.action.focusTitleBar`,
              title: localize2(
                "focusTitleBar",
                "Focus Title Bar"
              ),
              category: Categories.View,
              f1: true
            });
          }
          run() {
            that.getPartByDocument(getActiveDocument()).focus();
          }
        }
      )
    );
  }
  registerAPICommands() {
    this._register(
      CommandsRegistry.registerCommand({
        id: "registerWindowTitleVariable",
        handler: /* @__PURE__ */ __name((accessor, name, contextKey) => {
          this.registerVariables([{ name, contextKey }]);
        }, "handler"),
        metadata: {
          description: "Registers a new title variable",
          args: [
            {
              name: "name",
              schema: { type: "string" },
              description: "The name of the variable to register"
            },
            {
              name: "contextKey",
              schema: { type: "string" },
              description: "The context key to use for the value of the variable"
            }
          ]
        }
      })
    );
  }
  //#region Auxiliary Titlebar Parts
  createAuxiliaryTitlebarPart(container, editorGroupsContainer) {
    const titlebarPartContainer = document.createElement("div");
    titlebarPartContainer.classList.add("part", "titlebar");
    titlebarPartContainer.setAttribute("role", "none");
    titlebarPartContainer.style.position = "relative";
    container.insertBefore(titlebarPartContainer, container.firstChild);
    const disposables = new DisposableStore();
    const titlebarPart = this.doCreateAuxiliaryTitlebarPart(
      titlebarPartContainer,
      editorGroupsContainer
    );
    disposables.add(this.registerPart(titlebarPart));
    disposables.add(
      Event.runAndSubscribe(
        titlebarPart.onDidChange,
        () => titlebarPartContainer.style.height = `${titlebarPart.height}px`
      )
    );
    titlebarPart.create(titlebarPartContainer);
    if (this.properties) {
      titlebarPart.updateProperties(this.properties);
    }
    if (this.variables.size) {
      titlebarPart.registerVariables(Array.from(this.variables.values()));
    }
    Event.once(titlebarPart.onWillDispose)(() => disposables.dispose());
    return titlebarPart;
  }
  doCreateAuxiliaryTitlebarPart(container, editorGroupsContainer) {
    return this.instantiationService.createInstance(
      AuxiliaryBrowserTitlebarPart,
      container,
      editorGroupsContainer,
      this.mainPart
    );
  }
  //#endregion
  //#region Service Implementation
  onMenubarVisibilityChange = this.mainPart.onMenubarVisibilityChange;
  properties = void 0;
  updateProperties(properties) {
    this.properties = properties;
    for (const part of this.parts) {
      part.updateProperties(properties);
    }
  }
  variables = /* @__PURE__ */ new Map();
  registerVariables(variables) {
    const newVariables = [];
    for (const variable of variables) {
      if (!this.variables.has(variable.name)) {
        this.variables.set(variable.name, variable);
        newVariables.push(variable);
      }
    }
    for (const part of this.parts) {
      part.registerVariables(newVariables);
    }
  }
  //#endregion
};
BrowserTitleService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IThemeService)
], BrowserTitleService);
let BrowserTitlebarPart = class extends Part {
  constructor(id, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService) {
    super(id, { hasTitle: false }, themeService, storageService, layoutService);
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
    this.hostService = hostService;
    this.editorGroupService = editorGroupService;
    this.menuService = menuService;
    this.keybindingService = keybindingService;
    this.isAuxiliary = editorGroupsContainer !== "main";
    this.editorService = editorService.createScoped(editorGroupsContainer, this._store);
    this.editorGroupsContainer = editorGroupsContainer === "main" ? editorGroupService.mainPart : editorGroupsContainer;
    this.windowTitle = this._register(instantiationService.createInstance(WindowTitle, targetWindow, editorGroupsContainer));
    this.hoverDelegate = this._register(createInstantHoverDelegate());
    this.registerListeners(getWindowId(targetWindow));
  }
  static {
    __name(this, "BrowserTitlebarPart");
  }
  //#region IView
  minimumWidth = 0;
  maximumWidth = Number.POSITIVE_INFINITY;
  get minimumHeight() {
    const wcoEnabled = isWeb && isWCOEnabled();
    let value = this.isCommandCenterVisible || wcoEnabled ? DEFAULT_CUSTOM_TITLEBAR_HEIGHT : 30;
    if (wcoEnabled) {
      value = Math.max(
        value,
        getWCOTitlebarAreaRect(getWindow(this.element))?.height ?? 0
      );
    }
    return value / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
  }
  get maximumHeight() {
    return this.minimumHeight;
  }
  //#endregion
  //#region Events
  _onMenubarVisibilityChange = this._register(new Emitter());
  onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
  _onWillDispose = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  //#endregion
  rootContainer;
  windowControlsContainer;
  dragRegion;
  title;
  leftContent;
  centerContent;
  rightContent;
  customMenubar;
  appIcon;
  appIconBadge;
  menubar;
  lastLayoutDimensions;
  actionToolBar;
  actionToolBarDisposable = this._register(
    new DisposableStore()
  );
  editorActionsChangeDisposable = this._register(
    new DisposableStore()
  );
  actionToolBarElement;
  layoutToolbarMenu;
  editorToolbarMenuDisposables = this._register(
    new DisposableStore()
  );
  layoutToolbarMenuDisposables = this._register(
    new DisposableStore()
  );
  activityToolbarDisposables = this._register(
    new DisposableStore()
  );
  hoverDelegate;
  titleDisposables = this._register(new DisposableStore());
  titleBarStyle = getTitleBarStyle(
    this.configurationService
  );
  isInactive = false;
  isAuxiliary;
  windowTitle;
  editorService;
  editorGroupsContainer;
  registerListeners(targetWindowId) {
    this._register(
      this.hostService.onDidChangeFocus(
        (focused) => focused ? this.onFocus() : this.onBlur()
      )
    );
    this._register(
      this.hostService.onDidChangeActiveWindow(
        (windowId) => windowId === targetWindowId ? this.onFocus() : this.onBlur()
      )
    );
    this._register(
      this.configurationService.onDidChangeConfiguration(
        (e) => this.onConfigurationChanged(e)
      )
    );
    this._register(
      this.editorGroupService.onDidChangeEditorPartOptions(
        (e) => this.onEditorPartConfigurationChange(e)
      )
    );
  }
  onBlur() {
    this.isInactive = true;
    this.updateStyles();
  }
  onFocus() {
    this.isInactive = false;
    this.updateStyles();
  }
  onEditorPartConfigurationChange({
    oldPartOptions,
    newPartOptions
  }) {
    if (oldPartOptions.editorActionsLocation !== newPartOptions.editorActionsLocation || oldPartOptions.showTabs !== newPartOptions.showTabs) {
      if (hasCustomTitlebar(
        this.configurationService,
        this.titleBarStyle
      ) && this.actionToolBar) {
        this.createActionToolBar();
        this.createActionToolBarMenus({ editorActions: true });
        this._onDidChange.fire(void 0);
      }
    }
  }
  onConfigurationChanged(event) {
    if (!this.isAuxiliary && !hasNativeTitlebar(this.configurationService, this.titleBarStyle) && (!isMacintosh || isWeb)) {
      if (event.affectsConfiguration("window.menuBarVisibility")) {
        if (this.currentMenubarVisibility === "compact") {
          this.uninstallMenubar();
        } else {
          this.installMenubar();
        }
      }
    }
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
      const affectsLayoutControl = event.affectsConfiguration(
        LayoutSettings.LAYOUT_ACTIONS
      );
      const affectsActivityControl = event.affectsConfiguration(
        LayoutSettings.ACTIVITY_BAR_LOCATION
      );
      if (affectsLayoutControl || affectsActivityControl) {
        this.createActionToolBarMenus({
          layoutActions: affectsLayoutControl,
          activityActions: affectsActivityControl
        });
        this._onDidChange.fire(void 0);
      }
    }
    if (event.affectsConfiguration(LayoutSettings.COMMAND_CENTER)) {
      this.createTitle();
      this._onDidChange.fire(void 0);
    }
  }
  installMenubar() {
    if (this.menubar) {
      return;
    }
    this.customMenubar = this._register(
      this.instantiationService.createInstance(CustomMenubarControl)
    );
    this.menubar = append(this.leftContent, $("div.menubar"));
    this.menubar.setAttribute("role", "menubar");
    this._register(
      this.customMenubar.onVisibilityChange(
        (e) => this.onMenubarVisibilityChanged(e)
      )
    );
    this.customMenubar.create(this.menubar);
  }
  uninstallMenubar() {
    this.customMenubar?.dispose();
    this.customMenubar = void 0;
    this.menubar?.remove();
    this.menubar = void 0;
    this.onMenubarVisibilityChanged(false);
  }
  onMenubarVisibilityChanged(visible) {
    if (isWeb || isWindows || isLinux) {
      if (this.lastLayoutDimensions) {
        this.layout(
          this.lastLayoutDimensions.width,
          this.lastLayoutDimensions.height
        );
      }
      this._onMenubarVisibilityChange.fire(visible);
    }
  }
  updateProperties(properties) {
    this.windowTitle.updateProperties(properties);
  }
  registerVariables(variables) {
    this.windowTitle.registerVariables(variables);
  }
  createContentArea(parent) {
    this.element = parent;
    this.rootContainer = append(parent, $(".titlebar-container"));
    this.leftContent = append(this.rootContainer, $(".titlebar-left"));
    this.centerContent = append(this.rootContainer, $(".titlebar-center"));
    this.rightContent = append(this.rootContainer, $(".titlebar-right"));
    if (!isMacintosh && !isWeb && !hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
      this.appIcon = prepend(this.leftContent, $("a.window-appicon"));
      if (!this.isAuxiliary && isWeb) {
        const homeIndicator = this.environmentService.options?.homeIndicator;
        if (homeIndicator) {
          const icon = getIconRegistry().getIcon(
            homeIndicator.icon
          ) ? { id: homeIndicator.icon } : Codicon.code;
          this.appIcon.setAttribute("href", homeIndicator.href);
          this.appIcon.classList.add(
            ...ThemeIcon.asClassNameArray(icon)
          );
          this.appIconBadge = document.createElement("div");
          this.appIconBadge.classList.add("home-bar-icon-badge");
          this.appIcon.appendChild(this.appIconBadge);
        }
      }
    }
    this.dragRegion = prepend(
      this.rootContainer,
      $("div.titlebar-drag-region")
    );
    if (!this.isAuxiliary && !hasNativeTitlebar(this.configurationService, this.titleBarStyle) && (!isMacintosh || isWeb) && this.currentMenubarVisibility !== "compact") {
      this.installMenubar();
    }
    this.title = append(this.centerContent, $("div.window-title"));
    this.createTitle();
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      this.actionToolBarElement = append(
        this.rightContent,
        $("div.action-toolbar-container")
      );
      this.createActionToolBar();
      this.createActionToolBarMenus();
    }
    if (!hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
      let primaryWindowControlsLocation = isMacintosh ? "left" : "right";
      if (isMacintosh && isNative) {
        const localeInfo = new Intl.Locale(platformLocale);
        if (localeInfo?.textInfo?.direction === "rtl") {
          primaryWindowControlsLocation = "right";
        }
      }
      if (isMacintosh && isNative && primaryWindowControlsLocation === "left") {
      } else {
        this.windowControlsContainer = append(
          primaryWindowControlsLocation === "left" ? this.leftContent : this.rightContent,
          $("div.window-controls-container")
        );
        if (isWeb) {
          append(
            primaryWindowControlsLocation === "left" ? this.rightContent : this.leftContent,
            $("div.window-controls-container")
          );
        }
        if (isWCOEnabled()) {
          this.windowControlsContainer.classList.add("wco-enabled");
        }
      }
    }
    {
      this._register(
        addDisposableListener(
          this.rootContainer,
          EventType.CONTEXT_MENU,
          (e) => {
            EventHelper.stop(e);
            let targetMenu;
            if (isMacintosh && isHTMLElement(e.target) && isAncestor(e.target, this.title)) {
              targetMenu = MenuId.TitleBarTitleContext;
            } else {
              targetMenu = MenuId.TitleBarContext;
            }
            this.onContextMenu(e, targetMenu);
          }
        )
      );
      if (isMacintosh) {
        this._register(
          addDisposableListener(
            this.title,
            EventType.MOUSE_DOWN,
            (e) => {
              if (e.metaKey) {
                EventHelper.stop(
                  e,
                  true
                );
                this.onContextMenu(
                  e,
                  MenuId.TitleBarTitleContext
                );
              }
            },
            true
          )
        );
      }
    }
    this.updateStyles();
    return this.element;
  }
  createTitle() {
    this.titleDisposables.clear();
    if (this.isCommandCenterVisible) {
      const commandCenter = this.instantiationService.createInstance(
        CommandCenterControl,
        this.windowTitle,
        this.hoverDelegate
      );
      reset(this.title, commandCenter.element);
      this.titleDisposables.add(commandCenter);
    } else {
      this.title.innerText = this.windowTitle.value;
      this.titleDisposables.add(
        this.windowTitle.onDidChange(() => {
          this.title.innerText = this.windowTitle.value;
        })
      );
    }
  }
  actionViewItemProvider(action, options) {
    if (!this.isAuxiliary) {
      if (action.id === GLOBAL_ACTIVITY_ID) {
        return this.instantiationService.createInstance(
          SimpleGlobalActivityActionViewItem,
          { position: /* @__PURE__ */ __name(() => HoverPosition.BELOW, "position") },
          options
        );
      }
      if (action.id === ACCOUNTS_ACTIVITY_ID) {
        return this.instantiationService.createInstance(
          SimpleAccountActivityActionViewItem,
          { position: /* @__PURE__ */ __name(() => HoverPosition.BELOW, "position") },
          options
        );
      }
    }
    const activeEditorPane = this.editorGroupsContainer.activeGroup?.activeEditorPane;
    if (activeEditorPane && activeEditorPane instanceof EditorPane) {
      const result = activeEditorPane.getActionViewItem(action, options);
      if (result) {
        return result;
      }
    }
    return createActionViewItem(this.instantiationService, action, {
      ...options,
      menuAsChild: false
    });
  }
  getKeybinding(action) {
    const editorPaneAwareContextKeyService = this.editorGroupsContainer.activeGroup?.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
    return this.keybindingService.lookupKeybinding(
      action.id,
      editorPaneAwareContextKeyService
    );
  }
  createActionToolBar() {
    this.actionToolBarDisposable.clear();
    this.actionToolBar = this.actionToolBarDisposable.add(
      this.instantiationService.createInstance(
        WorkbenchToolBar,
        this.actionToolBarElement,
        {
          contextMenu: MenuId.TitleBarContext,
          orientation: ActionsOrientation.HORIZONTAL,
          ariaLabel: localize(
            "ariaLabelTitleActions",
            "Title actions"
          ),
          getKeyBinding: /* @__PURE__ */ __name((action) => this.getKeybinding(action), "getKeyBinding"),
          overflowBehavior: {
            maxItems: 9,
            exempted: [
              ACCOUNTS_ACTIVITY_ID,
              GLOBAL_ACTIVITY_ID,
              ...EDITOR_CORE_NAVIGATION_COMMANDS
            ]
          },
          anchorAlignmentProvider: /* @__PURE__ */ __name(() => AnchorAlignment.RIGHT, "anchorAlignmentProvider"),
          telemetrySource: "titlePart",
          highlightToggledItems: this.editorActionsEnabled,
          // Only show toggled state for editor actions (Layout actions are not shown as toggled)
          actionViewItemProvider: /* @__PURE__ */ __name((action, options) => this.actionViewItemProvider(action, options), "actionViewItemProvider"),
          hoverDelegate: this.hoverDelegate
        }
      )
    );
    if (this.editorActionsEnabled) {
      this.actionToolBarDisposable.add(
        this.editorGroupsContainer.onDidChangeActiveGroup(
          () => this.createActionToolBarMenus({ editorActions: true })
        )
      );
    }
  }
  createActionToolBarMenus(update = true) {
    if (update === true) {
      update = {
        editorActions: true,
        layoutActions: true,
        activityActions: true
      };
    }
    const updateToolBarActions = /* @__PURE__ */ __name(() => {
      const actions = { primary: [], secondary: [] };
      if (this.editorActionsEnabled) {
        this.editorActionsChangeDisposable.clear();
        const activeGroup = this.editorGroupsContainer.activeGroup;
        if (activeGroup) {
          const editorActions = activeGroup.createEditorActions(
            this.editorActionsChangeDisposable
          );
          actions.primary.push(...editorActions.actions.primary);
          actions.secondary.push(...editorActions.actions.secondary);
          this.editorActionsChangeDisposable.add(
            editorActions.onDidChange(() => updateToolBarActions())
          );
        }
      }
      if (this.layoutToolbarMenu) {
        createAndFillInActionBarActions(
          this.layoutToolbarMenu,
          {},
          actions,
          () => !this.editorActionsEnabled
          // Layout Actions in overflow menu when editor actions enabled in title bar
        );
      }
      if (this.activityActionsEnabled) {
        if (isAccountsActionVisible(this.storageService)) {
          actions.primary.push(ACCOUNTS_ACTIVITY_TILE_ACTION);
        }
        actions.primary.push(GLOBAL_ACTIVITY_TITLE_ACTION);
      }
      this.actionToolBar.setActions(
        prepareActions(actions.primary),
        prepareActions(actions.secondary)
      );
    }, "updateToolBarActions");
    if (update.editorActions) {
      this.editorToolbarMenuDisposables.clear();
      if (this.editorActionsEnabled && this.editorService.activeEditor !== void 0) {
        const context = {
          groupId: this.editorGroupsContainer.activeGroup.id
        };
        this.actionToolBar.actionRunner = new EditorCommandsContextActionRunner(context);
        this.actionToolBar.context = context;
        this.editorToolbarMenuDisposables.add(
          this.actionToolBar.actionRunner
        );
      } else {
        this.actionToolBar.actionRunner = new ActionRunner();
        this.actionToolBar.context = void 0;
        this.editorToolbarMenuDisposables.add(
          this.actionToolBar.actionRunner
        );
      }
    }
    if (update.layoutActions) {
      this.layoutToolbarMenuDisposables.clear();
      if (this.layoutControlEnabled) {
        this.layoutToolbarMenu = this.menuService.createMenu(
          MenuId.LayoutControlMenu,
          this.contextKeyService
        );
        this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu);
        this.layoutToolbarMenuDisposables.add(
          this.layoutToolbarMenu.onDidChange(
            () => updateToolBarActions()
          )
        );
      } else {
        this.layoutToolbarMenu = void 0;
      }
    }
    if (update.activityActions) {
      this.activityToolbarDisposables.clear();
      if (this.activityActionsEnabled) {
        this.activityToolbarDisposables.add(
          this.storageService.onDidChangeValue(
            StorageScope.PROFILE,
            AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY,
            this._store
          )(() => updateToolBarActions())
        );
      }
    }
    updateToolBarActions();
  }
  updateStyles() {
    super.updateStyles();
    if (this.element) {
      if (this.isInactive) {
        this.element.classList.add("inactive");
      } else {
        this.element.classList.remove("inactive");
      }
      const titleBackground = this.getColor(
        this.isInactive ? TITLE_BAR_INACTIVE_BACKGROUND : TITLE_BAR_ACTIVE_BACKGROUND,
        (color, theme) => {
          return color.isOpaque() ? color : color.makeOpaque(WORKBENCH_BACKGROUND(theme));
        }
      ) || "";
      this.element.style.backgroundColor = titleBackground;
      if (this.appIconBadge) {
        this.appIconBadge.style.backgroundColor = titleBackground;
      }
      if (titleBackground && Color.fromHex(titleBackground).isLighter()) {
        this.element.classList.add("light");
      } else {
        this.element.classList.remove("light");
      }
      const titleForeground = this.getColor(
        this.isInactive ? TITLE_BAR_INACTIVE_FOREGROUND : TITLE_BAR_ACTIVE_FOREGROUND
      );
      this.element.style.color = titleForeground || "";
      const titleBorder = this.getColor(TITLE_BAR_BORDER);
      this.element.style.borderBottom = titleBorder ? `1px solid ${titleBorder}` : "";
    }
  }
  onContextMenu(e, menuId) {
    const event = new StandardMouseEvent(getWindow(this.element), e);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      menuId,
      contextKeyService: this.contextKeyService,
      domForShadowRoot: isMacintosh && isNative ? event.target : void 0
    });
  }
  get currentMenubarVisibility() {
    if (this.isAuxiliary) {
      return "hidden";
    }
    return getMenuBarVisibility(this.configurationService);
  }
  get layoutControlEnabled() {
    return !this.isAuxiliary && this.configurationService.getValue(
      LayoutSettings.LAYOUT_ACTIONS
    ) !== false;
  }
  get isCommandCenterVisible() {
    return this.configurationService.getValue(
      LayoutSettings.COMMAND_CENTER
    ) !== false;
  }
  get editorActionsEnabled() {
    return this.editorGroupService.partOptions.editorActionsLocation === EditorActionsLocation.TITLEBAR || this.editorGroupService.partOptions.editorActionsLocation === EditorActionsLocation.DEFAULT && this.editorGroupService.partOptions.showTabs === EditorTabsMode.NONE;
  }
  get activityActionsEnabled() {
    const activityBarPosition = this.configurationService.getValue(
      LayoutSettings.ACTIVITY_BAR_LOCATION
    );
    return !this.isAuxiliary && (activityBarPosition === ActivityBarPosition.TOP || activityBarPosition === ActivityBarPosition.BOTTOM);
  }
  get hasZoomableElements() {
    const hasMenubar = !(this.currentMenubarVisibility === "hidden" || this.currentMenubarVisibility === "compact" || !isWeb && isMacintosh);
    const hasCommandCenter = this.isCommandCenterVisible;
    const hasToolBarActions = this.layoutControlEnabled || this.editorActionsEnabled || this.activityActionsEnabled;
    return hasMenubar || hasCommandCenter || hasToolBarActions;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.hasZoomableElements;
  }
  layout(width, height) {
    this.updateLayout(new Dimension(width, height));
    super.layoutContents(width, height);
  }
  updateLayout(dimension) {
    this.lastLayoutDimensions = dimension;
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      const zoomFactor = getZoomFactor(getWindow(this.element));
      this.element.style.setProperty(
        "--zoom-factor",
        zoomFactor.toString()
      );
      this.rootContainer.classList.toggle(
        "counter-zoom",
        this.preventZoom
      );
      if (this.customMenubar) {
        const menubarDimension = new Dimension(0, dimension.height);
        this.customMenubar.layout(menubarDimension);
      }
    }
  }
  focus() {
    if (this.customMenubar) {
      this.customMenubar.toggleFocus();
    } else {
      this.element.querySelector(
        '[tabindex]:not([tabindex="-1"])'
      ).focus();
    }
  }
  toJSON() {
    return {
      type: Parts.TITLEBAR_PART
    };
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
};
BrowserTitlebarPart = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IBrowserWorkbenchEnvironmentService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHostService),
  __decorateParam(12, IEditorGroupsService),
  __decorateParam(13, IEditorService),
  __decorateParam(14, IMenuService),
  __decorateParam(15, IKeybindingService)
], BrowserTitlebarPart);
let MainBrowserTitlebarPart = class extends BrowserTitlebarPart {
  static {
    __name(this, "MainBrowserTitlebarPart");
  }
  constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService) {
    super(
      Parts.TITLEBAR_PART,
      mainWindow,
      "main",
      contextMenuService,
      configurationService,
      environmentService,
      instantiationService,
      themeService,
      storageService,
      layoutService,
      contextKeyService,
      hostService,
      editorGroupService,
      editorService,
      menuService,
      keybindingService
    );
  }
};
MainBrowserTitlebarPart = __decorateClass([
  __decorateParam(0, IContextMenuService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IBrowserWorkbenchEnvironmentService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IHostService),
  __decorateParam(9, IEditorGroupsService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, IMenuService),
  __decorateParam(12, IKeybindingService)
], MainBrowserTitlebarPart);
let AuxiliaryBrowserTitlebarPart = class extends BrowserTitlebarPart {
  constructor(container, editorGroupsContainer, mainTitlebar, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService) {
    const id = AuxiliaryBrowserTitlebarPart.COUNTER++;
    super(
      `workbench.parts.auxiliaryTitle.${id}`,
      getWindow(container),
      editorGroupsContainer,
      contextMenuService,
      configurationService,
      environmentService,
      instantiationService,
      themeService,
      storageService,
      layoutService,
      contextKeyService,
      hostService,
      editorGroupService,
      editorService,
      menuService,
      keybindingService
    );
    this.container = container;
    this.mainTitlebar = mainTitlebar;
  }
  static {
    __name(this, "AuxiliaryBrowserTitlebarPart");
  }
  static COUNTER = 1;
  get height() {
    return this.minimumHeight;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
  }
};
AuxiliaryBrowserTitlebarPart = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IBrowserWorkbenchEnvironmentService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHostService),
  __decorateParam(12, IEditorGroupsService),
  __decorateParam(13, IEditorService),
  __decorateParam(14, IMenuService),
  __decorateParam(15, IKeybindingService)
], AuxiliaryBrowserTitlebarPart);
export {
  AuxiliaryBrowserTitlebarPart,
  BrowserTitleService,
  BrowserTitlebarPart,
  MainBrowserTitlebarPart
};
//# sourceMappingURL=titlebarPart.js.map
