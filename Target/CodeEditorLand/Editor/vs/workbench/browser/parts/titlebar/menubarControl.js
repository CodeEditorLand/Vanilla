var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./media/menubarControl.css";
import {
  isFullscreen,
  onDidChangeFullscreen
} from "../../../../base/browser/browser.js";
import { BrowserFeatures } from "../../../../base/browser/canIUse.js";
import {
  Dimension,
  EventType,
  addDisposableListener
} from "../../../../base/browser/dom.js";
import {
  HorizontalDirection,
  VerticalDirection
} from "../../../../base/browser/ui/menu/menu.js";
import {
  MenuBar
} from "../../../../base/browser/ui/menu/menubar.js";
import { mainWindow } from "../../../../base/browser/window.js";
import {
  Action,
  ActionRunner,
  Separator,
  SubmenuAction,
  toAction
} from "../../../../base/common/actions.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  mnemonicMenuLabel,
  unmnemonicLabel
} from "../../../../base/common/labels.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import {
  isIOS,
  isMacintosh,
  isNative,
  isWeb
} from "../../../../base/common/platform.js";
import { localize, localize2 } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { isICommandActionToggleInfo } from "../../../../platform/action/common/action.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  Action2,
  IMenuService,
  MenuId,
  MenuItemAction,
  MenuRegistry,
  SubmenuItemAction,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import {
  IsMacNativeContext,
  IsWebContext
} from "../../../../platform/contextkey/common/contextkeys.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  ILabelService,
  Verbosity
} from "../../../../platform/label/common/label.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { defaultMenuStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import {
  IUpdateService,
  StateType
} from "../../../../platform/update/common/update.js";
import {
  TitleBarSetting,
  getMenuBarVisibility,
  hasNativeTitlebar
} from "../../../../platform/window/common/window.js";
import {
  IWorkspacesService,
  isRecentFolder,
  isRecentWorkspace
} from "../../../../platform/workspaces/common/workspaces.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { ActivityBarPosition } from "../../../services/layout/browser/layoutService.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { OpenRecentAction } from "../../actions/windowActions.js";
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarFileMenu,
  title: {
    value: "File",
    original: "File",
    mnemonicTitle: localize(
      { key: "mFile", comment: ["&& denotes a mnemonic"] },
      "&&File"
    )
  },
  order: 1
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarEditMenu,
  title: {
    value: "Edit",
    original: "Edit",
    mnemonicTitle: localize(
      { key: "mEdit", comment: ["&& denotes a mnemonic"] },
      "&&Edit"
    )
  },
  order: 2
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarSelectionMenu,
  title: {
    value: "Selection",
    original: "Selection",
    mnemonicTitle: localize(
      { key: "mSelection", comment: ["&& denotes a mnemonic"] },
      "&&Selection"
    )
  },
  order: 3
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarViewMenu,
  title: {
    value: "View",
    original: "View",
    mnemonicTitle: localize(
      { key: "mView", comment: ["&& denotes a mnemonic"] },
      "&&View"
    )
  },
  order: 4
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarGoMenu,
  title: {
    value: "Go",
    original: "Go",
    mnemonicTitle: localize(
      { key: "mGoto", comment: ["&& denotes a mnemonic"] },
      "&&Go"
    )
  },
  order: 5
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarTerminalMenu,
  title: {
    value: "Terminal",
    original: "Terminal",
    mnemonicTitle: localize(
      { key: "mTerminal", comment: ["&& denotes a mnemonic"] },
      "&&Terminal"
    )
  },
  order: 7
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarHelpMenu,
  title: {
    value: "Help",
    original: "Help",
    mnemonicTitle: localize(
      { key: "mHelp", comment: ["&& denotes a mnemonic"] },
      "&&Help"
    )
  },
  order: 8
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarPreferencesMenu,
  title: {
    value: "Preferences",
    original: "Preferences",
    mnemonicTitle: localize(
      { key: "mPreferences", comment: ["&& denotes a mnemonic"] },
      "Preferences"
    )
  },
  when: IsMacNativeContext,
  order: 9
});
class MenubarControl extends Disposable {
  constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService) {
    super();
    this.menuService = menuService;
    this.workspacesService = workspacesService;
    this.contextKeyService = contextKeyService;
    this.keybindingService = keybindingService;
    this.configurationService = configurationService;
    this.labelService = labelService;
    this.updateService = updateService;
    this.storageService = storageService;
    this.notificationService = notificationService;
    this.preferencesService = preferencesService;
    this.environmentService = environmentService;
    this.accessibilityService = accessibilityService;
    this.hostService = hostService;
    this.commandService = commandService;
    this.mainMenu = this._register(
      this.menuService.createMenu(
        MenuId.MenubarMainMenu,
        this.contextKeyService
      )
    );
    this.mainMenuDisposables = this._register(new DisposableStore());
    this.setupMainMenu();
    this.menuUpdater = this._register(
      new RunOnceScheduler(() => this.doUpdateMenubar(false), 200)
    );
    this.notifyUserOfCustomMenubarAccessibility();
  }
  keys = [
    "window.menuBarVisibility",
    "window.enableMenuBarMnemonics",
    "window.customMenuBarAltFocus",
    "workbench.sideBar.location",
    "window.nativeTabs"
  ];
  mainMenu;
  menus = {};
  topLevelTitles = {};
  mainMenuDisposables;
  recentlyOpened = { files: [], workspaces: [] };
  menuUpdater;
  static MAX_MENU_RECENT_ENTRIES = 10;
  registerListeners() {
    this._register(
      this.hostService.onDidChangeFocus(
        (e) => this.onDidChangeWindowFocus(e)
      )
    );
    this._register(
      this.configurationService.onDidChangeConfiguration(
        (e) => this.onConfigurationUpdated(e)
      )
    );
    this._register(
      this.updateService.onStateChange(() => this.onUpdateStateChange())
    );
    this._register(
      this.workspacesService.onDidChangeRecentlyOpened(() => {
        this.onDidChangeRecentlyOpened();
      })
    );
    this._register(
      this.keybindingService.onDidUpdateKeybindings(
        () => this.updateMenubar()
      )
    );
    this._register(
      this.labelService.onDidChangeFormatters(() => {
        this.onDidChangeRecentlyOpened();
      })
    );
    this._register(
      this.mainMenu.onDidChange(() => {
        this.setupMainMenu();
        this.doUpdateMenubar(true);
      })
    );
  }
  setupMainMenu() {
    this.mainMenuDisposables.clear();
    this.menus = {};
    this.topLevelTitles = {};
    const [, mainMenuActions] = this.mainMenu.getActions()[0];
    for (const mainMenuAction of mainMenuActions) {
      if (mainMenuAction instanceof SubmenuItemAction && typeof mainMenuAction.item.title !== "string") {
        this.menus[mainMenuAction.item.title.original] = this.mainMenuDisposables.add(
          this.menuService.createMenu(
            mainMenuAction.item.submenu,
            this.contextKeyService,
            { emitEventsForSubmenuChanges: true }
          )
        );
        this.topLevelTitles[mainMenuAction.item.title.original] = mainMenuAction.item.title.mnemonicTitle ?? mainMenuAction.item.title.value;
      }
    }
  }
  updateMenubar() {
    this.menuUpdater.schedule();
  }
  calculateActionLabel(action) {
    const label = action.label;
    switch (action.id) {
      default:
        break;
    }
    return label;
  }
  onUpdateStateChange() {
    this.updateMenubar();
  }
  onUpdateKeybindings() {
    this.updateMenubar();
  }
  getOpenRecentActions() {
    if (!this.recentlyOpened) {
      return [];
    }
    const { workspaces, files } = this.recentlyOpened;
    const result = [];
    if (workspaces.length > 0) {
      for (let i = 0; i < MenubarControl.MAX_MENU_RECENT_ENTRIES && i < workspaces.length; i++) {
        result.push(this.createOpenRecentMenuAction(workspaces[i]));
      }
      result.push(new Separator());
    }
    if (files.length > 0) {
      for (let i = 0; i < MenubarControl.MAX_MENU_RECENT_ENTRIES && i < files.length; i++) {
        result.push(this.createOpenRecentMenuAction(files[i]));
      }
      result.push(new Separator());
    }
    return result;
  }
  onDidChangeWindowFocus(hasFocus) {
    if (hasFocus) {
      this.onDidChangeRecentlyOpened();
    }
  }
  onConfigurationUpdated(event) {
    if (this.keys.some((key) => event.affectsConfiguration(key))) {
      this.updateMenubar();
    }
    if (event.affectsConfiguration("editor.accessibilitySupport")) {
      this.notifyUserOfCustomMenubarAccessibility();
    }
    if (event.affectsConfiguration("window.menuBarVisibility")) {
      this.onDidChangeRecentlyOpened();
    }
  }
  get menubarHidden() {
    return isMacintosh && isNative ? false : getMenuBarVisibility(this.configurationService) === "hidden";
  }
  onDidChangeRecentlyOpened() {
    if (!this.menubarHidden) {
      this.workspacesService.getRecentlyOpened().then((recentlyOpened) => {
        this.recentlyOpened = recentlyOpened;
        this.updateMenubar();
      });
    }
  }
  createOpenRecentMenuAction(recent) {
    let label;
    let uri;
    let commandId;
    let openable;
    const remoteAuthority = recent.remoteAuthority;
    if (isRecentFolder(recent)) {
      uri = recent.folderUri;
      label = recent.label || this.labelService.getWorkspaceLabel(uri, {
        verbose: Verbosity.LONG
      });
      commandId = "openRecentFolder";
      openable = { folderUri: uri };
    } else if (isRecentWorkspace(recent)) {
      uri = recent.workspace.configPath;
      label = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, {
        verbose: Verbosity.LONG
      });
      commandId = "openRecentWorkspace";
      openable = { workspaceUri: uri };
    } else {
      uri = recent.fileUri;
      label = recent.label || this.labelService.getUriLabel(uri);
      commandId = "openRecentFile";
      openable = { fileUri: uri };
    }
    const ret = toAction({
      id: commandId,
      label: unmnemonicLabel(label),
      run: (browserEvent) => {
        const openInNewWindow = browserEvent && (!isMacintosh && (browserEvent.ctrlKey || browserEvent.shiftKey) || isMacintosh && (browserEvent.metaKey || browserEvent.altKey));
        return this.hostService.openWindow([openable], {
          forceNewWindow: !!openInNewWindow,
          remoteAuthority: remoteAuthority || null
          // local window if remoteAuthority is not set or can not be deducted from the openable
        });
      }
    });
    return Object.assign(ret, { uri, remoteAuthority });
  }
  notifyUserOfCustomMenubarAccessibility() {
    if (isWeb || isMacintosh) {
      return;
    }
    const hasBeenNotified = this.storageService.getBoolean(
      "menubar/accessibleMenubarNotified",
      StorageScope.APPLICATION,
      false
    );
    const usingCustomMenubar = !hasNativeTitlebar(
      this.configurationService
    );
    if (hasBeenNotified || usingCustomMenubar || !this.accessibilityService.isScreenReaderOptimized()) {
      return;
    }
    const message = localize(
      "menubar.customTitlebarAccessibilityNotification",
      "Accessibility support is enabled for you. For the most accessible experience, we recommend the custom title bar style."
    );
    this.notificationService.prompt(Severity.Info, message, [
      {
        label: localize("goToSetting", "Open Settings"),
        run: () => {
          return this.preferencesService.openUserSettings({
            query: TitleBarSetting.TITLE_BAR_STYLE
          });
        }
      }
    ]);
    this.storageService.store(
      "menubar/accessibleMenubarNotified",
      true,
      StorageScope.APPLICATION,
      StorageTarget.USER
    );
  }
}
let focusMenuBarEmitter;
function enableFocusMenuBarAction() {
  if (!focusMenuBarEmitter) {
    focusMenuBarEmitter = new Emitter();
    registerAction2(
      class extends Action2 {
        constructor() {
          super({
            id: `workbench.actions.menubar.focus`,
            title: localize2("focusMenu", "Focus Application Menu"),
            keybinding: {
              primary: KeyMod.Alt | KeyCode.F10,
              weight: KeybindingWeight.WorkbenchContrib,
              when: IsWebContext
            },
            f1: true
          });
        }
        async run() {
          focusMenuBarEmitter?.fire();
        }
      }
    );
  }
  return focusMenuBarEmitter;
}
let CustomMenubarControl = class extends MenubarControl {
  constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, telemetryService, hostService, commandService) {
    super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
    this.telemetryService = telemetryService;
    this._onVisibilityChange = this._register(new Emitter());
    this._onFocusStateChange = this._register(new Emitter());
    this.actionRunner = this._register(new ActionRunner());
    this.actionRunner.onDidRun((e) => {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: e.action.id, from: "menu" });
    });
    this.workspacesService.getRecentlyOpened().then((recentlyOpened) => {
      this.recentlyOpened = recentlyOpened;
    });
    this.registerListeners();
  }
  menubar;
  container;
  alwaysOnMnemonics = false;
  focusInsideMenubar = false;
  pendingFirstTimeUpdate = false;
  visible = true;
  actionRunner;
  webNavigationMenu = this._register(
    this.menuService.createMenu(
      MenuId.MenubarHomeMenu,
      this.contextKeyService
    )
  );
  _onVisibilityChange;
  _onFocusStateChange;
  doUpdateMenubar(firstTime) {
    if (!this.focusInsideMenubar) {
      this.setupCustomMenubar(firstTime);
    }
    if (firstTime) {
      this.pendingFirstTimeUpdate = true;
    }
  }
  getUpdateAction() {
    const state = this.updateService.state;
    switch (state.type) {
      case StateType.Idle:
        return new Action(
          "update.check",
          localize(
            {
              key: "checkForUpdates",
              comment: ["&& denotes a mnemonic"]
            },
            "Check for &&Updates..."
          ),
          void 0,
          true,
          () => this.updateService.checkForUpdates(true)
        );
      case StateType.CheckingForUpdates:
        return new Action(
          "update.checking",
          localize("checkingForUpdates", "Checking for Updates..."),
          void 0,
          false
        );
      case StateType.AvailableForDownload:
        return new Action(
          "update.downloadNow",
          localize(
            {
              key: "download now",
              comment: ["&& denotes a mnemonic"]
            },
            "D&&ownload Update"
          ),
          void 0,
          true,
          () => this.updateService.downloadUpdate()
        );
      case StateType.Downloading:
        return new Action(
          "update.downloading",
          localize("DownloadingUpdate", "Downloading Update..."),
          void 0,
          false
        );
      case StateType.Downloaded:
        return isMacintosh ? null : new Action(
          "update.install",
          localize(
            {
              key: "installUpdate...",
              comment: ["&& denotes a mnemonic"]
            },
            "Install &&Update..."
          ),
          void 0,
          true,
          () => this.updateService.applyUpdate()
        );
      case StateType.Updating:
        return new Action(
          "update.updating",
          localize("installingUpdate", "Installing Update..."),
          void 0,
          false
        );
      case StateType.Ready:
        return new Action(
          "update.restart",
          localize(
            {
              key: "restartToUpdate",
              comment: ["&& denotes a mnemonic"]
            },
            "Restart to &&Update"
          ),
          void 0,
          true,
          () => this.updateService.quitAndInstall()
        );
      default:
        return null;
    }
  }
  get currentMenubarVisibility() {
    return getMenuBarVisibility(this.configurationService);
  }
  get currentDisableMenuBarAltFocus() {
    const settingValue = this.configurationService.getValue(
      "window.customMenuBarAltFocus"
    );
    let disableMenuBarAltBehavior = false;
    if (typeof settingValue === "boolean") {
      disableMenuBarAltBehavior = !settingValue;
    }
    return disableMenuBarAltBehavior;
  }
  insertActionsBefore(nextAction, target) {
    switch (nextAction.id) {
      case OpenRecentAction.ID:
        target.push(...this.getOpenRecentActions());
        break;
      case "workbench.action.showAboutDialog":
        if (!isMacintosh && !isWeb) {
          const updateAction = this.getUpdateAction();
          if (updateAction) {
            updateAction.label = mnemonicMenuLabel(
              updateAction.label
            );
            target.push(updateAction);
            target.push(new Separator());
          }
        }
        break;
      default:
        break;
    }
  }
  get currentEnableMenuBarMnemonics() {
    let enableMenuBarMnemonics = this.configurationService.getValue(
      "window.enableMenuBarMnemonics"
    );
    if (typeof enableMenuBarMnemonics !== "boolean") {
      enableMenuBarMnemonics = true;
    }
    return enableMenuBarMnemonics && (!isWeb || isFullscreen(mainWindow));
  }
  get currentCompactMenuMode() {
    if (this.currentMenubarVisibility !== "compact") {
      return void 0;
    }
    const currentSidebarLocation = this.configurationService.getValue(
      "workbench.sideBar.location"
    );
    const horizontalDirection = currentSidebarLocation === "right" ? HorizontalDirection.Left : HorizontalDirection.Right;
    const activityBarLocation = this.configurationService.getValue(
      "workbench.activityBar.location"
    );
    const verticalDirection = activityBarLocation === ActivityBarPosition.BOTTOM ? VerticalDirection.Above : VerticalDirection.Below;
    return { horizontal: horizontalDirection, vertical: verticalDirection };
  }
  onDidVisibilityChange(visible) {
    this.visible = visible;
    this.onDidChangeRecentlyOpened();
    this._onVisibilityChange.fire(visible);
  }
  toActionsArray(menu) {
    const result = [];
    createAndFillInContextMenuActions(
      menu,
      { shouldForwardArgs: true },
      result
    );
    return result;
  }
  reinstallDisposables = this._register(
    new DisposableStore()
  );
  setupCustomMenubar(firstTime) {
    if (!this.container) {
      return;
    }
    if (firstTime) {
      if (this.menubar) {
        this.reinstallDisposables.clear();
      }
      this.menubar = this.reinstallDisposables.add(
        new MenuBar(
          this.container,
          this.getMenuBarOptions(),
          defaultMenuStyles
        )
      );
      this.accessibilityService.alwaysUnderlineAccessKeys().then((val) => {
        this.alwaysOnMnemonics = val;
        this.menubar?.update(this.getMenuBarOptions());
      });
      this.reinstallDisposables.add(
        this.menubar.onFocusStateChange((focused) => {
          this._onFocusStateChange.fire(focused);
          if (!focused) {
            if (this.pendingFirstTimeUpdate) {
              this.setupCustomMenubar(true);
              this.pendingFirstTimeUpdate = false;
            } else {
              this.updateMenubar();
            }
            this.focusInsideMenubar = false;
          }
        })
      );
      this.reinstallDisposables.add(
        this.menubar.onVisibilityChange(
          (e) => this.onDidVisibilityChange(e)
        )
      );
      this.reinstallDisposables.add(
        addDisposableListener(
          this.container,
          EventType.FOCUS_IN,
          () => {
            this.focusInsideMenubar = true;
          }
        )
      );
      this.reinstallDisposables.add(
        addDisposableListener(
          this.container,
          EventType.FOCUS_OUT,
          () => {
            this.focusInsideMenubar = false;
          }
        )
      );
      if (this.menubar.isVisible) {
        this.onDidVisibilityChange(true);
      }
    } else {
      this.menubar?.update(this.getMenuBarOptions());
    }
    const updateActions = (menuActions, target, topLevelTitle) => {
      target.splice(0);
      for (const menuItem of menuActions) {
        this.insertActionsBefore(menuItem, target);
        if (menuItem instanceof Separator) {
          target.push(menuItem);
        } else if (menuItem instanceof SubmenuItemAction || menuItem instanceof MenuItemAction) {
          let title = typeof menuItem.item.title === "string" ? menuItem.item.title : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
          if (menuItem instanceof SubmenuItemAction) {
            const submenuActions = [];
            updateActions(
              menuItem.actions,
              submenuActions,
              topLevelTitle
            );
            if (submenuActions.length > 0) {
              target.push(
                new SubmenuAction(
                  menuItem.id,
                  mnemonicMenuLabel(title),
                  submenuActions
                )
              );
            }
          } else {
            if (isICommandActionToggleInfo(menuItem.item.toggled)) {
              title = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
            }
            const newAction = new Action(
              menuItem.id,
              mnemonicMenuLabel(title),
              menuItem.class,
              menuItem.enabled,
              () => this.commandService.executeCommand(menuItem.id)
            );
            newAction.tooltip = menuItem.tooltip;
            newAction.checked = menuItem.checked;
            target.push(newAction);
          }
        }
      }
      if (topLevelTitle === "File" && this.currentCompactMenuMode === void 0) {
        const webActions = this.getWebNavigationActions();
        if (webActions.length) {
          target.push(...webActions);
        }
      }
    };
    for (const title of Object.keys(this.topLevelTitles)) {
      const menu = this.menus[title];
      if (firstTime && menu) {
        this.reinstallDisposables.add(
          menu.onDidChange(() => {
            if (!this.focusInsideMenubar) {
              const actions2 = [];
              updateActions(
                this.toActionsArray(menu),
                actions2,
                title
              );
              this.menubar?.updateMenu({
                actions: actions2,
                label: mnemonicMenuLabel(
                  this.topLevelTitles[title]
                )
              });
            }
          })
        );
        if (menu === this.menus.File) {
          this.reinstallDisposables.add(
            this.webNavigationMenu.onDidChange(() => {
              if (!this.focusInsideMenubar) {
                const actions2 = [];
                updateActions(
                  this.toActionsArray(menu),
                  actions2,
                  title
                );
                this.menubar?.updateMenu({
                  actions: actions2,
                  label: mnemonicMenuLabel(
                    this.topLevelTitles[title]
                  )
                });
              }
            })
          );
        }
      }
      const actions = [];
      if (menu) {
        updateActions(this.toActionsArray(menu), actions, title);
      }
      if (this.menubar) {
        if (firstTime) {
          this.menubar.push({
            actions,
            label: mnemonicMenuLabel(this.topLevelTitles[title])
          });
        } else {
          this.menubar.updateMenu({
            actions,
            label: mnemonicMenuLabel(this.topLevelTitles[title])
          });
        }
      }
    }
  }
  getWebNavigationActions() {
    if (!isWeb) {
      return [];
    }
    const webNavigationActions = [];
    for (const groups of this.webNavigationMenu.getActions()) {
      const [, actions] = groups;
      for (const action of actions) {
        if (action instanceof MenuItemAction) {
          const title = typeof action.item.title === "string" ? action.item.title : action.item.title.mnemonicTitle ?? action.item.title.value;
          webNavigationActions.push(
            new Action(
              action.id,
              mnemonicMenuLabel(title),
              action.class,
              action.enabled,
              async (event) => {
                this.commandService.executeCommand(
                  action.id,
                  event
                );
              }
            )
          );
        }
      }
      webNavigationActions.push(new Separator());
    }
    if (webNavigationActions.length) {
      webNavigationActions.pop();
    }
    return webNavigationActions;
  }
  getMenuBarOptions() {
    return {
      enableMnemonics: this.currentEnableMenuBarMnemonics,
      disableAltFocus: this.currentDisableMenuBarAltFocus,
      visibility: this.currentMenubarVisibility,
      actionRunner: this.actionRunner,
      getKeybinding: (action) => this.keybindingService.lookupKeybinding(action.id),
      alwaysOnMnemonics: this.alwaysOnMnemonics,
      compactMode: this.currentCompactMenuMode,
      getCompactMenuActions: () => {
        if (!isWeb) {
          return [];
        }
        return this.getWebNavigationActions();
      }
    };
  }
  onDidChangeWindowFocus(hasFocus) {
    if (!this.visible) {
      return;
    }
    super.onDidChangeWindowFocus(hasFocus);
    if (this.container) {
      if (hasFocus) {
        this.container.classList.remove("inactive");
      } else {
        this.container.classList.add("inactive");
        this.menubar?.blur();
      }
    }
  }
  onUpdateStateChange() {
    if (!this.visible) {
      return;
    }
    super.onUpdateStateChange();
  }
  onDidChangeRecentlyOpened() {
    if (!this.visible) {
      return;
    }
    super.onDidChangeRecentlyOpened();
  }
  onUpdateKeybindings() {
    if (!this.visible) {
      return;
    }
    super.onUpdateKeybindings();
  }
  registerListeners() {
    super.registerListeners();
    this._register(
      addDisposableListener(mainWindow, EventType.RESIZE, () => {
        if (this.menubar && !(isIOS && BrowserFeatures.pointerEvents)) {
          this.menubar.blur();
        }
      })
    );
    if (isWeb) {
      this._register(
        onDidChangeFullscreen((windowId) => {
          if (windowId === mainWindow.vscodeWindowId) {
            this.updateMenubar();
          }
        })
      );
      this._register(
        this.webNavigationMenu.onDidChange(() => this.updateMenubar())
      );
      this._register(
        enableFocusMenuBarAction().event(
          () => this.menubar?.toggleFocus()
        )
      );
    }
  }
  get onVisibilityChange() {
    return this._onVisibilityChange.event;
  }
  get onFocusStateChange() {
    return this._onFocusStateChange.event;
  }
  getMenubarItemsDimensions() {
    if (this.menubar) {
      return new Dimension(
        this.menubar.getWidth(),
        this.menubar.getHeight()
      );
    }
    return new Dimension(0, 0);
  }
  create(parent) {
    this.container = parent;
    if (this.container) {
      this.doUpdateMenubar(true);
    }
    return this.container;
  }
  layout(dimension) {
    this.menubar?.update(this.getMenuBarOptions());
  }
  toggleFocus() {
    this.menubar?.toggleFocus();
  }
};
CustomMenubarControl = __decorateClass([
  __decorateParam(0, IMenuService),
  __decorateParam(1, IWorkspacesService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IUpdateService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, IPreferencesService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IAccessibilityService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, IHostService),
  __decorateParam(14, ICommandService)
], CustomMenubarControl);
export {
  CustomMenubarControl,
  MenubarControl
};
