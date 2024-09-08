import {
  isFullscreen,
  isWCOEnabled,
  onDidChangeFullscreen
} from "../../base/browser/browser.js";
import {
  EventType,
  addDisposableListener,
  computeScreenAwareSize,
  getActiveDocument,
  getActiveElement,
  getActiveWindow,
  getClientArea,
  getWindow,
  getWindowId,
  getWindows,
  isActiveDocument,
  isAncestorUsingFlowTo,
  position,
  size
} from "../../base/browser/dom.js";
import {
  Direction,
  Orientation,
  SerializableGrid,
  Sizing
} from "../../base/browser/ui/grid/grid.js";
import { mainWindow } from "../../base/browser/window.js";
import { coalesce } from "../../base/common/arrays.js";
import { DeferredPromise, Promises } from "../../base/common/async.js";
import { Emitter } from "../../base/common/event.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore,
  toDisposable
} from "../../base/common/lifecycle.js";
import { mark } from "../../base/common/performance.js";
import {
  isIOS,
  isLinux,
  isMacintosh,
  isWeb,
  isWindows
} from "../../base/common/platform.js";
import { assertIsDefined } from "../../base/common/types.js";
import { URI } from "../../base/common/uri.js";
import { isCodeEditor } from "../../editor/browser/editorBrowser.js";
import {
  IConfigurationService
} from "../../platform/configuration/common/configuration.js";
import { IFileService } from "../../platform/files/common/files.js";
import { ILogService } from "../../platform/log/common/log.js";
import {
  INotificationService,
  NotificationsFilter
} from "../../platform/notification/common/notification.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../platform/theme/common/themeService.js";
import {
  CustomTitleBarVisibility,
  TitleBarSetting,
  getMenuBarVisibility,
  hasCustomTitlebar,
  hasNativeTitlebar,
  useWindowControlsOverlay
} from "../../platform/window/common/window.js";
import {
  IWorkspaceContextService,
  WorkbenchState,
  isTemporaryWorkspace
} from "../../platform/workspace/common/workspace.js";
import {
  EditorInputCapabilities,
  isResourceEditorInput,
  pathsToEditors
} from "../common/editor.js";
import { DiffEditorInput } from "../common/editor/diffEditorInput.js";
import {
  WINDOW_ACTIVE_BORDER,
  WINDOW_INACTIVE_BORDER
} from "../common/theme.js";
import {
  IViewDescriptorService,
  ViewContainerLocation
} from "../common/views.js";
import { IAuxiliaryWindowService } from "../services/auxiliaryWindow/browser/auxiliaryWindowService.js";
import { IBannerService } from "../services/banner/browser/bannerService.js";
import {
  GroupsOrder,
  IEditorGroupsService
} from "../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../services/editor/common/editorService.js";
import { IBrowserWorkbenchEnvironmentService } from "../services/environment/browser/environmentService.js";
import { IExtensionService } from "../services/extensions/common/extensions.js";
import { IHostService } from "../services/host/browser/host.js";
import {
  ActivityBarPosition,
  EditorActionsLocation,
  LayoutSettings,
  PanelOpensMaximizedOptions,
  Parts,
  Position,
  ZenModeSettings,
  isHorizontal,
  panelOpensMaximizedFromString,
  positionFromString,
  positionToString,
  shouldShowCustomTitleBar
} from "../services/layout/browser/layoutService.js";
import {
  ILifecycleService,
  StartupKind
} from "../services/lifecycle/common/lifecycle.js";
import { IPaneCompositePartService } from "../services/panecomposite/browser/panecomposite.js";
import { IStatusbarService } from "../services/statusbar/browser/statusbar.js";
import { ITitleService } from "../services/title/browser/titleService.js";
import { IWorkingCopyBackupService } from "../services/workingCopy/common/workingCopyBackup.js";
import { Part } from "./part.js";
import { AuxiliaryBarPart } from "./parts/auxiliarybar/auxiliaryBarPart.js";
import { PanelPart } from "./parts/panel/panelPart.js";
import { SidebarPart } from "./parts/sidebar/sidebarPart.js";
var LayoutClasses = /* @__PURE__ */ ((LayoutClasses2) => {
  LayoutClasses2["SIDEBAR_HIDDEN"] = "nosidebar";
  LayoutClasses2["MAIN_EDITOR_AREA_HIDDEN"] = "nomaineditorarea";
  LayoutClasses2["PANEL_HIDDEN"] = "nopanel";
  LayoutClasses2["AUXILIARYBAR_HIDDEN"] = "noauxiliarybar";
  LayoutClasses2["STATUSBAR_HIDDEN"] = "nostatusbar";
  LayoutClasses2["FULLSCREEN"] = "fullscreen";
  LayoutClasses2["MAXIMIZED"] = "maximized";
  LayoutClasses2["WINDOW_BORDER"] = "border";
  return LayoutClasses2;
})(LayoutClasses || {});
const TITLE_BAR_SETTINGS = [
  LayoutSettings.ACTIVITY_BAR_LOCATION,
  LayoutSettings.COMMAND_CENTER,
  LayoutSettings.EDITOR_ACTIONS_LOCATION,
  LayoutSettings.LAYOUT_ACTIONS,
  "window.menuBarVisibility",
  TitleBarSetting.TITLE_BAR_STYLE,
  TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY
];
class Layout extends Disposable {
  constructor(parent) {
    super();
    this.parent = parent;
  }
  //#region Events
  _onDidChangeZenMode = this._register(
    new Emitter()
  );
  onDidChangeZenMode = this._onDidChangeZenMode.event;
  _onDidChangeMainEditorCenteredLayout = this._register(
    new Emitter()
  );
  onDidChangeMainEditorCenteredLayout = this._onDidChangeMainEditorCenteredLayout.event;
  _onDidChangePanelAlignment = this._register(
    new Emitter()
  );
  onDidChangePanelAlignment = this._onDidChangePanelAlignment.event;
  _onDidChangeWindowMaximized = this._register(
    new Emitter()
  );
  onDidChangeWindowMaximized = this._onDidChangeWindowMaximized.event;
  _onDidChangePanelPosition = this._register(
    new Emitter()
  );
  onDidChangePanelPosition = this._onDidChangePanelPosition.event;
  _onDidChangePartVisibility = this._register(
    new Emitter()
  );
  onDidChangePartVisibility = this._onDidChangePartVisibility.event;
  _onDidChangeNotificationsVisibility = this._register(
    new Emitter()
  );
  onDidChangeNotificationsVisibility = this._onDidChangeNotificationsVisibility.event;
  _onDidLayoutMainContainer = this._register(
    new Emitter()
  );
  onDidLayoutMainContainer = this._onDidLayoutMainContainer.event;
  _onDidLayoutActiveContainer = this._register(
    new Emitter()
  );
  onDidLayoutActiveContainer = this._onDidLayoutActiveContainer.event;
  _onDidLayoutContainer = this._register(
    new Emitter()
  );
  onDidLayoutContainer = this._onDidLayoutContainer.event;
  _onDidAddContainer = this._register(
    new Emitter()
  );
  onDidAddContainer = this._onDidAddContainer.event;
  _onDidChangeActiveContainer = this._register(
    new Emitter()
  );
  onDidChangeActiveContainer = this._onDidChangeActiveContainer.event;
  //#endregion
  //#region Properties
  mainContainer = document.createElement("div");
  get activeContainer() {
    return this.getContainerFromDocument(getActiveDocument());
  }
  get containers() {
    const containers = [];
    for (const { window } of getWindows()) {
      containers.push(this.getContainerFromDocument(window.document));
    }
    return containers;
  }
  getContainerFromDocument(targetDocument) {
    if (targetDocument === this.mainContainer.ownerDocument) {
      return this.mainContainer;
    } else {
      return targetDocument.body.getElementsByClassName(
        "monaco-workbench"
      )[0];
    }
  }
  containerStylesLoaded = /* @__PURE__ */ new Map();
  whenContainerStylesLoaded(window) {
    return this.containerStylesLoaded.get(window.vscodeWindowId);
  }
  _mainContainerDimension;
  get mainContainerDimension() {
    return this._mainContainerDimension;
  }
  get activeContainerDimension() {
    return this.getContainerDimension(this.activeContainer);
  }
  getContainerDimension(container) {
    if (container === this.mainContainer) {
      return this.mainContainerDimension;
    } else {
      return getClientArea(container);
    }
  }
  get mainContainerOffset() {
    return this.computeContainerOffset(mainWindow);
  }
  get activeContainerOffset() {
    return this.computeContainerOffset(getWindow(this.activeContainer));
  }
  computeContainerOffset(targetWindow) {
    let top = 0;
    let quickPickTop = 0;
    if (this.isVisible(Parts.BANNER_PART)) {
      top = this.getPart(Parts.BANNER_PART).maximumHeight;
      quickPickTop = top;
    }
    const titlebarVisible = this.isVisible(
      Parts.TITLEBAR_PART,
      targetWindow
    );
    if (titlebarVisible) {
      top += this.getPart(Parts.TITLEBAR_PART).maximumHeight;
      quickPickTop = top;
    }
    const isCommandCenterVisible = titlebarVisible && this.configurationService.getValue(
      LayoutSettings.COMMAND_CENTER
    ) !== false;
    if (isCommandCenterVisible) {
      quickPickTop = 6;
    }
    return { top, quickPickTop };
  }
  //#endregion
  parts = /* @__PURE__ */ new Map();
  initialized = false;
  workbenchGrid;
  titleBarPartView;
  bannerPartView;
  activityBarPartView;
  sideBarPartView;
  panelPartView;
  auxiliaryBarPartView;
  editorPartView;
  statusBarPartView;
  environmentService;
  extensionService;
  configurationService;
  storageService;
  hostService;
  editorService;
  mainPartEditorService;
  editorGroupService;
  paneCompositeService;
  titleService;
  viewDescriptorService;
  contextService;
  workingCopyBackupService;
  notificationService;
  themeService;
  statusBarService;
  logService;
  telemetryService;
  auxiliaryWindowService;
  state;
  stateModel;
  disposed = false;
  initLayout(accessor) {
    this.environmentService = accessor.get(
      IBrowserWorkbenchEnvironmentService
    );
    this.configurationService = accessor.get(IConfigurationService);
    this.hostService = accessor.get(IHostService);
    this.contextService = accessor.get(IWorkspaceContextService);
    this.storageService = accessor.get(IStorageService);
    this.workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
    this.themeService = accessor.get(IThemeService);
    this.extensionService = accessor.get(IExtensionService);
    this.logService = accessor.get(ILogService);
    this.telemetryService = accessor.get(ITelemetryService);
    this.auxiliaryWindowService = accessor.get(IAuxiliaryWindowService);
    this.editorService = accessor.get(IEditorService);
    this.mainPartEditorService = this.editorService.createScoped(
      "main",
      this._store
    );
    this.editorGroupService = accessor.get(IEditorGroupsService);
    this.paneCompositeService = accessor.get(IPaneCompositePartService);
    this.viewDescriptorService = accessor.get(IViewDescriptorService);
    this.titleService = accessor.get(ITitleService);
    this.notificationService = accessor.get(INotificationService);
    this.statusBarService = accessor.get(IStatusbarService);
    accessor.get(IBannerService);
    this.registerLayoutListeners();
    this.initLayoutState(
      accessor.get(ILifecycleService),
      accessor.get(IFileService)
    );
  }
  registerLayoutListeners() {
    const showEditorIfHidden = () => {
      if (!this.isVisible(Parts.EDITOR_PART, mainWindow)) {
        this.toggleMaximizedPanel();
      }
    };
    this.editorGroupService.whenRestored.then(() => {
      this._register(
        this.mainPartEditorService.onDidVisibleEditorsChange(
          showEditorIfHidden
        )
      );
      this._register(
        this.editorGroupService.mainPart.onDidActivateGroup(
          showEditorIfHidden
        )
      );
      this._register(
        this.mainPartEditorService.onDidActiveEditorChange(
          () => this.centerMainEditorLayout(
            this.stateModel.getRuntimeValue(
              LayoutStateKeys.MAIN_EDITOR_CENTERED
            )
          )
        )
      );
    });
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if ([
          ...TITLE_BAR_SETTINGS,
          "workbench.sideBar.location" /* SIDEBAR_POSITION */,
          "workbench.statusBar.visible" /* STATUSBAR_VISIBLE */
        ].some((setting) => e.affectsConfiguration(setting))) {
          const editorActionsMovedToTitlebar = e.affectsConfiguration(
            LayoutSettings.EDITOR_ACTIONS_LOCATION
          ) && this.configurationService.getValue(
            LayoutSettings.EDITOR_ACTIONS_LOCATION
          ) === EditorActionsLocation.TITLEBAR;
          let activityBarMovedToTopOrBottom = false;
          if (e.affectsConfiguration(
            LayoutSettings.ACTIVITY_BAR_LOCATION
          )) {
            const activityBarPosition = this.configurationService.getValue(
              LayoutSettings.ACTIVITY_BAR_LOCATION
            );
            activityBarMovedToTopOrBottom = activityBarPosition === ActivityBarPosition.TOP || activityBarPosition === ActivityBarPosition.BOTTOM;
          }
          if (activityBarMovedToTopOrBottom || editorActionsMovedToTitlebar) {
            if (this.configurationService.getValue(
              TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY
            ) === CustomTitleBarVisibility.NEVER) {
              this.configurationService.updateValue(
                TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY,
                CustomTitleBarVisibility.AUTO
              );
            }
          }
          this.doUpdateLayoutConfiguration();
        }
      })
    );
    this._register(
      onDidChangeFullscreen(
        (windowId) => this.onFullscreenChanged(windowId)
      )
    );
    this._register(
      this.editorGroupService.mainPart.onDidAddGroup(
        () => this.centerMainEditorLayout(
          this.stateModel.getRuntimeValue(
            LayoutStateKeys.MAIN_EDITOR_CENTERED
          )
        )
      )
    );
    this._register(
      this.editorGroupService.mainPart.onDidRemoveGroup(
        () => this.centerMainEditorLayout(
          this.stateModel.getRuntimeValue(
            LayoutStateKeys.MAIN_EDITOR_CENTERED
          )
        )
      )
    );
    this._register(
      this.editorGroupService.mainPart.onDidChangeGroupMaximized(
        () => this.centerMainEditorLayout(
          this.stateModel.getRuntimeValue(
            LayoutStateKeys.MAIN_EDITOR_CENTERED
          )
        )
      )
    );
    this._register(
      addDisposableListener(
        this.mainContainer,
        EventType.SCROLL,
        () => this.mainContainer.scrollTop = 0
      )
    );
    const showingCustomMenu = (isWindows || isLinux || isWeb) && !hasNativeTitlebar(this.configurationService);
    if (showingCustomMenu) {
      this._register(
        this.titleService.onMenubarVisibilityChange(
          (visible) => this.onMenubarToggled(visible)
        )
      );
    }
    this._register(
      this.themeService.onDidColorThemeChange(
        () => this.updateWindowsBorder()
      )
    );
    this._register(
      this.hostService.onDidChangeFocus(
        (focused) => this.onWindowFocusChanged(focused)
      )
    );
    this._register(
      this.hostService.onDidChangeActiveWindow(
        () => this.onActiveWindowChanged()
      )
    );
    if (isWeb && typeof navigator.windowControlsOverlay === "object") {
      this._register(
        addDisposableListener(
          navigator.windowControlsOverlay,
          "geometrychange",
          () => this.onDidChangeWCO()
        )
      );
    }
    this._register(
      this.auxiliaryWindowService.onDidOpenAuxiliaryWindow(
        ({ window, disposables }) => {
          const windowId = window.window.vscodeWindowId;
          this.containerStylesLoaded.set(
            windowId,
            window.whenStylesHaveLoaded
          );
          window.whenStylesHaveLoaded.then(
            () => this.containerStylesLoaded.delete(windowId)
          );
          disposables.add(
            toDisposable(
              () => this.containerStylesLoaded.delete(windowId)
            )
          );
          const eventDisposables = disposables.add(
            new DisposableStore()
          );
          this._onDidAddContainer.fire({
            container: window.container,
            disposables: eventDisposables
          });
          disposables.add(
            window.onDidLayout(
              (dimension) => this.handleContainerDidLayout(
                window.container,
                dimension
              )
            )
          );
        }
      )
    );
  }
  onMenubarToggled(visible) {
    if (visible !== this.state.runtime.menuBar.toggled) {
      this.state.runtime.menuBar.toggled = visible;
      const menuBarVisibility = getMenuBarVisibility(
        this.configurationService
      );
      if (isWeb && menuBarVisibility === "toggle") {
        this.workbenchGrid.setViewVisible(
          this.titleBarPartView,
          shouldShowCustomTitleBar(
            this.configurationService,
            mainWindow,
            this.state.runtime.menuBar.toggled,
            this.isZenModeActive()
          )
        );
      } else if (this.state.runtime.mainWindowFullscreen && (menuBarVisibility === "toggle" || menuBarVisibility === "classic")) {
        this.workbenchGrid.setViewVisible(
          this.titleBarPartView,
          shouldShowCustomTitleBar(
            this.configurationService,
            mainWindow,
            this.state.runtime.menuBar.toggled,
            this.isZenModeActive()
          )
        );
      }
      this.handleContainerDidLayout(
        this.mainContainer,
        this._mainContainerDimension
      );
    }
  }
  handleContainerDidLayout(container, dimension) {
    if (container === this.mainContainer) {
      this._onDidLayoutMainContainer.fire(dimension);
    }
    if (isActiveDocument(container)) {
      this._onDidLayoutActiveContainer.fire(dimension);
    }
    this._onDidLayoutContainer.fire({ container, dimension });
  }
  onFullscreenChanged(windowId) {
    if (windowId !== mainWindow.vscodeWindowId) {
      return;
    }
    this.state.runtime.mainWindowFullscreen = isFullscreen(mainWindow);
    if (this.state.runtime.mainWindowFullscreen) {
      this.mainContainer.classList.add("fullscreen" /* FULLSCREEN */);
    } else {
      this.mainContainer.classList.remove("fullscreen" /* FULLSCREEN */);
      const zenModeExitInfo = this.stateModel.getRuntimeValue(
        LayoutStateKeys.ZEN_MODE_EXIT_INFO
      );
      if (zenModeExitInfo.transitionedToFullScreen && this.isZenModeActive()) {
        this.toggleZenMode();
      }
    }
    this.workbenchGrid.edgeSnapping = this.state.runtime.mainWindowFullscreen;
    if (hasCustomTitlebar(this.configurationService)) {
      this.workbenchGrid.setViewVisible(
        this.titleBarPartView,
        shouldShowCustomTitleBar(
          this.configurationService,
          mainWindow,
          this.state.runtime.menuBar.toggled,
          this.isZenModeActive()
        )
      );
      this.updateWindowsBorder(true);
    }
  }
  onActiveWindowChanged() {
    const activeContainerId = this.getActiveContainerId();
    if (this.state.runtime.activeContainerId !== activeContainerId) {
      this.state.runtime.activeContainerId = activeContainerId;
      this.updateWindowsBorder();
      this._onDidChangeActiveContainer.fire();
    }
  }
  onWindowFocusChanged(hasFocus) {
    if (this.state.runtime.hasFocus !== hasFocus) {
      this.state.runtime.hasFocus = hasFocus;
      this.updateWindowsBorder();
    }
  }
  getActiveContainerId() {
    const activeContainer = this.activeContainer;
    return getWindow(activeContainer).vscodeWindowId;
  }
  doUpdateLayoutConfiguration(skipLayout) {
    this.updateCustomTitleBarVisibility();
    this.updateMenubarVisibility(!!skipLayout);
    this.editorGroupService.whenRestored.then(() => {
      this.centerMainEditorLayout(
        this.stateModel.getRuntimeValue(
          LayoutStateKeys.MAIN_EDITOR_CENTERED
        ),
        skipLayout
      );
    });
  }
  setSideBarPosition(position2) {
    const activityBar = this.getPart(Parts.ACTIVITYBAR_PART);
    const sideBar = this.getPart(Parts.SIDEBAR_PART);
    const auxiliaryBar = this.getPart(Parts.AUXILIARYBAR_PART);
    const newPositionValue = position2 === Position.LEFT ? "left" : "right";
    const oldPositionValue = position2 === Position.RIGHT ? "left" : "right";
    const panelAlignment = this.getPanelAlignment();
    const panelPosition = this.getPanelPosition();
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.SIDEBAR_POSITON,
      position2
    );
    const activityBarContainer = assertIsDefined(
      activityBar.getContainer()
    );
    const sideBarContainer = assertIsDefined(sideBar.getContainer());
    const auxiliaryBarContainer = assertIsDefined(
      auxiliaryBar.getContainer()
    );
    activityBarContainer.classList.remove(oldPositionValue);
    sideBarContainer.classList.remove(oldPositionValue);
    activityBarContainer.classList.add(newPositionValue);
    sideBarContainer.classList.add(newPositionValue);
    auxiliaryBarContainer.classList.remove(newPositionValue);
    auxiliaryBarContainer.classList.add(oldPositionValue);
    activityBar.updateStyles();
    sideBar.updateStyles();
    auxiliaryBar.updateStyles();
    this.adjustPartPositions(position2, panelAlignment, panelPosition);
  }
  updateWindowsBorder(skipLayout = false) {
    if (isWeb || isWindows || // not working well with zooming (border often not visible)
    useWindowControlsOverlay(this.configurationService) || // not working with WCO (border cannot draw over the overlay)
    hasNativeTitlebar(this.configurationService)) {
      return;
    }
    const theme = this.themeService.getColorTheme();
    const activeBorder = theme.getColor(WINDOW_ACTIVE_BORDER);
    const inactiveBorder = theme.getColor(WINDOW_INACTIVE_BORDER);
    const didHaveMainWindowBorder = this.hasMainWindowBorder();
    for (const container of this.containers) {
      const isMainContainer = container === this.mainContainer;
      const isActiveContainer = this.activeContainer === container;
      const containerWindowId = getWindowId(getWindow(container));
      let windowBorder = false;
      if (!this.state.runtime.mainWindowFullscreen && !this.state.runtime.maximized.has(containerWindowId) && (activeBorder || inactiveBorder)) {
        windowBorder = true;
        const borderColor = isActiveContainer && this.state.runtime.hasFocus ? activeBorder : inactiveBorder ?? activeBorder;
        container.style.setProperty(
          "--window-border-color",
          borderColor?.toString() ?? "transparent"
        );
      }
      if (isMainContainer) {
        this.state.runtime.mainWindowBorder = windowBorder;
      }
      container.classList.toggle(
        "border" /* WINDOW_BORDER */,
        windowBorder
      );
    }
    if (!skipLayout && didHaveMainWindowBorder !== this.hasMainWindowBorder()) {
      this.layout();
    }
  }
  initLayoutState(lifecycleService, fileService) {
    this.stateModel = new LayoutStateModel(
      this.storageService,
      this.configurationService,
      this.contextService,
      this.parent
    );
    this.stateModel.load();
    if (this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN) && this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN)) {
      this.stateModel.setRuntimeValue(
        LayoutStateKeys.EDITOR_HIDDEN,
        false
      );
    }
    this._register(
      this.stateModel.onDidChangeState((change) => {
        if (change.key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
          this.setActivityBarHidden(change.value);
        }
        if (change.key === LayoutStateKeys.STATUSBAR_HIDDEN) {
          this.setStatusBarHidden(change.value);
        }
        if (change.key === LayoutStateKeys.SIDEBAR_POSITON) {
          this.setSideBarPosition(change.value);
        }
        if (change.key === LayoutStateKeys.PANEL_POSITION) {
          this.setPanelPosition(change.value);
        }
        if (change.key === LayoutStateKeys.PANEL_ALIGNMENT) {
          this.setPanelAlignment(change.value);
        }
        this.doUpdateLayoutConfiguration();
      })
    );
    const initialEditorsState = this.getInitialEditorsState();
    if (initialEditorsState) {
      this.logService.trace("Initial editor state", initialEditorsState);
    }
    const initialLayoutState = {
      layout: {
        editors: initialEditorsState?.layout
      },
      editor: {
        restoreEditors: this.shouldRestoreEditors(
          this.contextService,
          initialEditorsState
        ),
        editorsToOpen: this.resolveEditorsToOpen(
          fileService,
          initialEditorsState
        )
      },
      views: {
        defaults: this.getDefaultLayoutViews(
          this.environmentService,
          this.storageService
        ),
        containerToRestore: {}
      }
    };
    const layoutRuntimeState = {
      activeContainerId: this.getActiveContainerId(),
      mainWindowFullscreen: isFullscreen(mainWindow),
      hasFocus: this.hostService.hasFocus,
      maximized: /* @__PURE__ */ new Set(),
      mainWindowBorder: false,
      menuBar: {
        toggled: false
      },
      zenMode: {
        transitionDisposables: new DisposableMap()
      }
    };
    this.state = {
      initialization: initialLayoutState,
      runtime: layoutRuntimeState
    };
    const isNewWindow = lifecycleService.startupKind === StartupKind.NewWindow;
    const activityBarNotDefault = this.configurationService.getValue(
      LayoutSettings.ACTIVITY_BAR_LOCATION
    ) !== ActivityBarPosition.DEFAULT;
    if (this.isVisible(Parts.SIDEBAR_PART)) {
      let viewContainerToRestore;
      if (!this.environmentService.isBuilt || lifecycleService.startupKind === StartupKind.ReloadedWindow || this.environmentService.isExtensionDevelopment && !this.environmentService.extensionTestsLocationURI) {
        viewContainerToRestore = this.storageService.get(
          SidebarPart.activeViewletSettingsKey,
          StorageScope.WORKSPACE,
          this.viewDescriptorService.getDefaultViewContainer(
            ViewContainerLocation.Sidebar
          )?.id
        );
      } else {
        viewContainerToRestore = this.viewDescriptorService.getDefaultViewContainer(
          ViewContainerLocation.Sidebar
        )?.id;
      }
      if (viewContainerToRestore) {
        this.state.initialization.views.containerToRestore.sideBar = viewContainerToRestore;
      } else {
        this.stateModel.setRuntimeValue(
          LayoutStateKeys.SIDEBAR_HIDDEN,
          true
        );
      }
    } else if (isNewWindow && activityBarNotDefault) {
      const viewContainerToRestore = this.storageService.get(
        SidebarPart.activeViewletSettingsKey,
        StorageScope.WORKSPACE,
        this.viewDescriptorService.getDefaultViewContainer(
          ViewContainerLocation.Sidebar
        )?.id
      );
      if (viewContainerToRestore) {
        this.state.initialization.views.containerToRestore.sideBar = viewContainerToRestore;
        this.stateModel.setRuntimeValue(
          LayoutStateKeys.SIDEBAR_HIDDEN,
          false
        );
      }
    }
    if (this.isVisible(Parts.PANEL_PART)) {
      const viewContainerToRestore = this.storageService.get(
        PanelPart.activePanelSettingsKey,
        StorageScope.WORKSPACE,
        this.viewDescriptorService.getDefaultViewContainer(
          ViewContainerLocation.Panel
        )?.id
      );
      if (viewContainerToRestore) {
        this.state.initialization.views.containerToRestore.panel = viewContainerToRestore;
      } else {
        this.stateModel.setRuntimeValue(
          LayoutStateKeys.PANEL_HIDDEN,
          true
        );
      }
    }
    const auxiliaryBarVisible = this.isVisible(Parts.AUXILIARYBAR_PART);
    if (auxiliaryBarVisible || isNewWindow && activityBarNotDefault) {
      const viewContainerToRestore = this.storageService.get(
        AuxiliaryBarPart.activePanelSettingsKey,
        StorageScope.WORKSPACE,
        this.viewDescriptorService.getDefaultViewContainer(
          ViewContainerLocation.AuxiliaryBar
        )?.id
      );
      if (viewContainerToRestore) {
        this.state.initialization.views.containerToRestore.auxiliaryBar = viewContainerToRestore;
      }
      if (auxiliaryBarVisible !== !!viewContainerToRestore) {
        this.stateModel.setRuntimeValue(
          LayoutStateKeys.AUXILIARYBAR_HIDDEN,
          !auxiliaryBarVisible
        );
      }
    }
    this.updateWindowsBorder(true);
  }
  getDefaultLayoutViews(environmentService, storageService) {
    const defaultLayout = environmentService.options?.defaultLayout;
    if (!defaultLayout) {
      return void 0;
    }
    if (!defaultLayout.force && !storageService.isNew(StorageScope.WORKSPACE)) {
      return void 0;
    }
    const { views } = defaultLayout;
    if (views?.length) {
      return views.map((view) => view.id);
    }
    return void 0;
  }
  shouldRestoreEditors(contextService, initialEditorsState) {
    if (isTemporaryWorkspace(contextService.getWorkspace())) {
      return false;
    }
    const forceRestoreEditors = this.configurationService.getValue(
      "window.restoreWindows"
    ) === "preserve";
    return !!forceRestoreEditors || initialEditorsState === void 0;
  }
  willRestoreEditors() {
    return this.state.initialization.editor.restoreEditors;
  }
  async resolveEditorsToOpen(fileService, initialEditorsState) {
    if (initialEditorsState) {
      const filesToMerge = coalesce(
        await pathsToEditors(
          initialEditorsState.filesToMerge,
          fileService,
          this.logService
        )
      );
      if (filesToMerge.length === 4 && isResourceEditorInput(filesToMerge[0]) && isResourceEditorInput(filesToMerge[1]) && isResourceEditorInput(filesToMerge[2]) && isResourceEditorInput(filesToMerge[3])) {
        return [
          {
            editor: {
              input1: { resource: filesToMerge[0].resource },
              input2: { resource: filesToMerge[1].resource },
              base: { resource: filesToMerge[2].resource },
              result: { resource: filesToMerge[3].resource },
              options: { pinned: true }
            }
          }
        ];
      }
      const filesToDiff = coalesce(
        await pathsToEditors(
          initialEditorsState.filesToDiff,
          fileService,
          this.logService
        )
      );
      if (filesToDiff.length === 2) {
        return [
          {
            editor: {
              original: { resource: filesToDiff[0].resource },
              modified: { resource: filesToDiff[1].resource },
              options: { pinned: true }
            }
          }
        ];
      }
      const filesToOpenOrCreate = [];
      const resolvedFilesToOpenOrCreate = await pathsToEditors(
        initialEditorsState.filesToOpenOrCreate,
        fileService,
        this.logService
      );
      for (let i = 0; i < resolvedFilesToOpenOrCreate.length; i++) {
        const resolvedFileToOpenOrCreate = resolvedFilesToOpenOrCreate[i];
        if (resolvedFileToOpenOrCreate) {
          filesToOpenOrCreate.push({
            editor: resolvedFileToOpenOrCreate,
            viewColumn: initialEditorsState.filesToOpenOrCreate?.[i].viewColumn
            // take over `viewColumn` from initial state
          });
        }
      }
      return filesToOpenOrCreate;
    } else if (this.contextService.getWorkbenchState() === WorkbenchState.EMPTY && this.configurationService.getValue("workbench.startupEditor") === "newUntitledFile") {
      if (this.editorGroupService.hasRestorableState) {
        return [];
      }
      const hasBackups = await this.workingCopyBackupService.hasBackups();
      if (hasBackups) {
        return [];
      }
      return [
        {
          editor: { resource: void 0 }
          // open empty untitled file
        }
      ];
    }
    return [];
  }
  _openedDefaultEditors = false;
  get openedDefaultEditors() {
    return this._openedDefaultEditors;
  }
  getInitialEditorsState() {
    const defaultLayout = this.environmentService.options?.defaultLayout;
    if ((defaultLayout?.editors?.length || defaultLayout?.layout?.editors) && (defaultLayout.force || this.storageService.isNew(StorageScope.WORKSPACE))) {
      this._openedDefaultEditors = true;
      return {
        layout: defaultLayout.layout?.editors,
        filesToOpenOrCreate: defaultLayout?.editors?.map((editor) => {
          return {
            viewColumn: editor.viewColumn,
            fileUri: URI.revive(editor.uri),
            openOnlyIfExists: editor.openOnlyIfExists,
            options: editor.options
          };
        })
      };
    }
    const { filesToOpenOrCreate, filesToDiff, filesToMerge } = this.environmentService;
    if (filesToOpenOrCreate || filesToDiff || filesToMerge) {
      return { filesToOpenOrCreate, filesToDiff, filesToMerge };
    }
    return void 0;
  }
  whenReadyPromise = new DeferredPromise();
  whenReady = this.whenReadyPromise.p;
  whenRestoredPromise = new DeferredPromise();
  whenRestored = this.whenRestoredPromise.p;
  restored = false;
  isRestored() {
    return this.restored;
  }
  restoreParts() {
    const layoutReadyPromises = [];
    const layoutRestoredPromises = [];
    layoutReadyPromises.push(
      (async () => {
        mark("code/willRestoreEditors");
        await this.editorGroupService.whenReady;
        mark("code/restoreEditors/editorGroupsReady");
        if (this.state.initialization.layout?.editors) {
          this.editorGroupService.mainPart.applyLayout(
            this.state.initialization.layout.editors
          );
        }
        const editors = await this.state.initialization.editor.editorsToOpen;
        mark("code/restoreEditors/editorsToOpenResolved");
        let openEditorsPromise;
        if (editors.length) {
          const editorGroupsInVisualOrder = this.editorGroupService.mainPart.getGroups(
            GroupsOrder.GRID_APPEARANCE
          );
          const mapEditorsToGroup = /* @__PURE__ */ new Map();
          for (const editor of editors) {
            const group = editorGroupsInVisualOrder[(editor.viewColumn ?? 1) - 1];
            let editorsByGroup = mapEditorsToGroup.get(group.id);
            if (!editorsByGroup) {
              editorsByGroup = /* @__PURE__ */ new Set();
              mapEditorsToGroup.set(group.id, editorsByGroup);
            }
            editorsByGroup.add(editor.editor);
          }
          openEditorsPromise = Promise.all(
            Array.from(mapEditorsToGroup).map(
              async ([groupId, editors2]) => {
                try {
                  await this.editorService.openEditors(
                    Array.from(editors2),
                    groupId,
                    { validateTrust: true }
                  );
                } catch (error) {
                  this.logService.error(error);
                }
              }
            )
          );
        }
        layoutRestoredPromises.push(
          Promise.all([
            openEditorsPromise?.finally(
              () => mark("code/restoreEditors/editorsOpened")
            ),
            this.editorGroupService.whenRestored.finally(
              () => mark("code/restoreEditors/editorGroupsRestored")
            )
          ]).finally(() => {
            mark("code/didRestoreEditors");
          })
        );
      })()
    );
    const restoreDefaultViewsPromise = (async () => {
      if (this.state.initialization.views.defaults?.length) {
        mark("code/willOpenDefaultViews");
        const locationsRestored = [];
        const tryOpenView = (view) => {
          const location = this.viewDescriptorService.getViewLocationById(view.id);
          if (location !== null) {
            const container = this.viewDescriptorService.getViewContainerByViewId(
              view.id
            );
            if (container) {
              if (view.order >= (locationsRestored?.[location]?.order ?? 0)) {
                locationsRestored[location] = {
                  id: container.id,
                  order: view.order
                };
              }
              const containerModel = this.viewDescriptorService.getViewContainerModel(
                container
              );
              containerModel.setCollapsed(view.id, false);
              containerModel.setVisible(view.id, true);
              return true;
            }
          }
          return false;
        };
        const defaultViews = [
          ...this.state.initialization.views.defaults
        ].reverse().map((v, index) => ({ id: v, order: index }));
        let i = defaultViews.length;
        while (i) {
          i--;
          if (tryOpenView(defaultViews[i])) {
            defaultViews.splice(i, 1);
          }
        }
        if (defaultViews.length) {
          await this.extensionService.whenInstalledExtensionsRegistered();
          let i2 = defaultViews.length;
          while (i2) {
            i2--;
            if (tryOpenView(defaultViews[i2])) {
              defaultViews.splice(i2, 1);
            }
          }
        }
        if (locationsRestored[ViewContainerLocation.Sidebar]) {
          this.state.initialization.views.containerToRestore.sideBar = locationsRestored[ViewContainerLocation.Sidebar].id;
        }
        if (locationsRestored[ViewContainerLocation.Panel]) {
          this.state.initialization.views.containerToRestore.panel = locationsRestored[ViewContainerLocation.Panel].id;
        }
        if (locationsRestored[ViewContainerLocation.AuxiliaryBar]) {
          this.state.initialization.views.containerToRestore.auxiliaryBar = locationsRestored[ViewContainerLocation.AuxiliaryBar].id;
        }
        mark("code/didOpenDefaultViews");
      }
    })();
    layoutReadyPromises.push(restoreDefaultViewsPromise);
    layoutReadyPromises.push(
      (async () => {
        await restoreDefaultViewsPromise;
        if (!this.state.initialization.views.containerToRestore.sideBar) {
          return;
        }
        mark("code/willRestoreViewlet");
        const viewlet = await this.paneCompositeService.openPaneComposite(
          this.state.initialization.views.containerToRestore.sideBar,
          ViewContainerLocation.Sidebar
        );
        if (!viewlet) {
          await this.paneCompositeService.openPaneComposite(
            this.viewDescriptorService.getDefaultViewContainer(
              ViewContainerLocation.Sidebar
            )?.id,
            ViewContainerLocation.Sidebar
          );
        }
        mark("code/didRestoreViewlet");
      })()
    );
    layoutReadyPromises.push(
      (async () => {
        await restoreDefaultViewsPromise;
        if (!this.state.initialization.views.containerToRestore.panel) {
          return;
        }
        mark("code/willRestorePanel");
        const panel = await this.paneCompositeService.openPaneComposite(
          this.state.initialization.views.containerToRestore.panel,
          ViewContainerLocation.Panel
        );
        if (!panel) {
          await this.paneCompositeService.openPaneComposite(
            this.viewDescriptorService.getDefaultViewContainer(
              ViewContainerLocation.Panel
            )?.id,
            ViewContainerLocation.Panel
          );
        }
        mark("code/didRestorePanel");
      })()
    );
    layoutReadyPromises.push(
      (async () => {
        await restoreDefaultViewsPromise;
        if (!this.state.initialization.views.containerToRestore.auxiliaryBar) {
          return;
        }
        mark("code/willRestoreAuxiliaryBar");
        const panel = await this.paneCompositeService.openPaneComposite(
          this.state.initialization.views.containerToRestore.auxiliaryBar,
          ViewContainerLocation.AuxiliaryBar
        );
        if (!panel) {
          await this.paneCompositeService.openPaneComposite(
            this.viewDescriptorService.getDefaultViewContainer(
              ViewContainerLocation.AuxiliaryBar
            )?.id,
            ViewContainerLocation.AuxiliaryBar
          );
        }
        mark("code/didRestoreAuxiliaryBar");
      })()
    );
    const zenModeWasActive = this.isZenModeActive();
    const restoreZenMode = getZenModeConfiguration(
      this.configurationService
    ).restore;
    if (zenModeWasActive) {
      this.setZenModeActive(!restoreZenMode);
      this.toggleZenMode(false, true);
    }
    if (this.stateModel.getRuntimeValue(
      LayoutStateKeys.MAIN_EDITOR_CENTERED
    )) {
      this.centerMainEditorLayout(true, true);
    }
    Promises.settled(layoutReadyPromises).finally(() => {
      this.whenReadyPromise.complete();
      Promises.settled(layoutRestoredPromises).finally(() => {
        this.restored = true;
        this.whenRestoredPromise.complete();
      });
    });
  }
  registerPart(part) {
    const id = part.getId();
    this.parts.set(id, part);
    return toDisposable(() => this.parts.delete(id));
  }
  getPart(key) {
    const part = this.parts.get(key);
    if (!part) {
      throw new Error(`Unknown part ${key}`);
    }
    return part;
  }
  registerNotifications(delegate) {
    this._register(
      delegate.onDidChangeNotificationsVisibility(
        (visible) => this._onDidChangeNotificationsVisibility.fire(visible)
      )
    );
  }
  hasFocus(part) {
    const container = this.getContainer(getActiveWindow(), part);
    if (!container) {
      return false;
    }
    const activeElement = getActiveElement();
    if (!activeElement) {
      return false;
    }
    return isAncestorUsingFlowTo(activeElement, container);
  }
  focusPart(part, targetWindow = mainWindow) {
    const container = this.getContainer(targetWindow, part) ?? this.mainContainer;
    switch (part) {
      case Parts.EDITOR_PART:
        this.editorGroupService.getPart(container).activeGroup.focus();
        break;
      case Parts.PANEL_PART: {
        this.paneCompositeService.getActivePaneComposite(ViewContainerLocation.Panel)?.focus();
        break;
      }
      case Parts.SIDEBAR_PART: {
        this.paneCompositeService.getActivePaneComposite(ViewContainerLocation.Sidebar)?.focus();
        break;
      }
      case Parts.AUXILIARYBAR_PART: {
        this.paneCompositeService.getActivePaneComposite(ViewContainerLocation.AuxiliaryBar)?.focus();
        break;
      }
      case Parts.ACTIVITYBAR_PART:
        this.getPart(Parts.SIDEBAR_PART).focusActivityBar();
        break;
      case Parts.STATUSBAR_PART:
        this.statusBarService.getPart(container).focus();
        break;
      default: {
        container?.focus();
      }
    }
  }
  getContainer(targetWindow, part) {
    if (typeof part === "undefined") {
      return this.getContainerFromDocument(targetWindow.document);
    }
    if (targetWindow === mainWindow) {
      return this.getPart(part).getContainer();
    }
    let partCandidate;
    if (part === Parts.EDITOR_PART) {
      partCandidate = this.editorGroupService.getPart(
        this.getContainerFromDocument(targetWindow.document)
      );
    } else if (part === Parts.STATUSBAR_PART) {
      partCandidate = this.statusBarService.getPart(
        this.getContainerFromDocument(targetWindow.document)
      );
    } else if (part === Parts.TITLEBAR_PART) {
      partCandidate = this.titleService.getPart(
        this.getContainerFromDocument(targetWindow.document)
      );
    }
    if (partCandidate instanceof Part) {
      return partCandidate.getContainer();
    }
    return void 0;
  }
  isVisible(part, targetWindow = mainWindow) {
    if (targetWindow !== mainWindow && part === Parts.EDITOR_PART) {
      return true;
    }
    if (this.initialized) {
      switch (part) {
        case Parts.TITLEBAR_PART:
          return this.workbenchGrid.isViewVisible(
            this.titleBarPartView
          );
        case Parts.SIDEBAR_PART:
          return !this.stateModel.getRuntimeValue(
            LayoutStateKeys.SIDEBAR_HIDDEN
          );
        case Parts.PANEL_PART:
          return !this.stateModel.getRuntimeValue(
            LayoutStateKeys.PANEL_HIDDEN
          );
        case Parts.AUXILIARYBAR_PART:
          return !this.stateModel.getRuntimeValue(
            LayoutStateKeys.AUXILIARYBAR_HIDDEN
          );
        case Parts.STATUSBAR_PART:
          return !this.stateModel.getRuntimeValue(
            LayoutStateKeys.STATUSBAR_HIDDEN
          );
        case Parts.ACTIVITYBAR_PART:
          return !this.stateModel.getRuntimeValue(
            LayoutStateKeys.ACTIVITYBAR_HIDDEN
          );
        case Parts.EDITOR_PART:
          return !this.stateModel.getRuntimeValue(
            LayoutStateKeys.EDITOR_HIDDEN
          );
        case Parts.BANNER_PART:
          return this.workbenchGrid.isViewVisible(
            this.bannerPartView
          );
        default:
          return false;
      }
    }
    switch (part) {
      case Parts.TITLEBAR_PART:
        return shouldShowCustomTitleBar(
          this.configurationService,
          mainWindow,
          this.state.runtime.menuBar.toggled,
          this.isZenModeActive()
        );
      case Parts.SIDEBAR_PART:
        return !this.stateModel.getRuntimeValue(
          LayoutStateKeys.SIDEBAR_HIDDEN
        );
      case Parts.PANEL_PART:
        return !this.stateModel.getRuntimeValue(
          LayoutStateKeys.PANEL_HIDDEN
        );
      case Parts.AUXILIARYBAR_PART:
        return !this.stateModel.getRuntimeValue(
          LayoutStateKeys.AUXILIARYBAR_HIDDEN
        );
      case Parts.STATUSBAR_PART:
        return !this.stateModel.getRuntimeValue(
          LayoutStateKeys.STATUSBAR_HIDDEN
        );
      case Parts.ACTIVITYBAR_PART:
        return !this.stateModel.getRuntimeValue(
          LayoutStateKeys.ACTIVITYBAR_HIDDEN
        );
      case Parts.EDITOR_PART:
        return !this.stateModel.getRuntimeValue(
          LayoutStateKeys.EDITOR_HIDDEN
        );
      default:
        return false;
    }
  }
  shouldShowBannerFirst() {
    return isWeb && !isWCOEnabled();
  }
  focus() {
    this.focusPart(Parts.EDITOR_PART, getWindow(this.activeContainer));
  }
  focusPanelOrEditor() {
    const activePanel = this.paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Panel
    );
    if ((this.hasFocus(Parts.PANEL_PART) || !this.isVisible(Parts.EDITOR_PART)) && activePanel) {
      activePanel.focus();
    } else {
      this.focus();
    }
  }
  getMaximumEditorDimensions(container) {
    const targetWindow = getWindow(container);
    const containerDimension = this.getContainerDimension(container);
    if (container === this.mainContainer) {
      const isPanelHorizontal = isHorizontal(this.getPanelPosition());
      const takenWidth = (this.isVisible(Parts.ACTIVITYBAR_PART) ? this.activityBarPartView.minimumWidth : 0) + (this.isVisible(Parts.SIDEBAR_PART) ? this.sideBarPartView.minimumWidth : 0) + (this.isVisible(Parts.PANEL_PART) && !isPanelHorizontal ? this.panelPartView.minimumWidth : 0) + (this.isVisible(Parts.AUXILIARYBAR_PART) ? this.auxiliaryBarPartView.minimumWidth : 0);
      const takenHeight = (this.isVisible(Parts.TITLEBAR_PART, targetWindow) ? this.titleBarPartView.minimumHeight : 0) + (this.isVisible(Parts.STATUSBAR_PART, targetWindow) ? this.statusBarPartView.minimumHeight : 0) + (this.isVisible(Parts.PANEL_PART) && isPanelHorizontal ? this.panelPartView.minimumHeight : 0);
      const availableWidth = containerDimension.width - takenWidth;
      const availableHeight = containerDimension.height - takenHeight;
      return { width: availableWidth, height: availableHeight };
    } else {
      const takenHeight = (this.isVisible(Parts.TITLEBAR_PART, targetWindow) ? this.titleBarPartView.minimumHeight : 0) + (this.isVisible(Parts.STATUSBAR_PART, targetWindow) ? this.statusBarPartView.minimumHeight : 0);
      return {
        width: containerDimension.width,
        height: containerDimension.height - takenHeight
      };
    }
  }
  isZenModeActive() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
  }
  setZenModeActive(active) {
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.ZEN_MODE_ACTIVE,
      active
    );
  }
  toggleZenMode(skipLayout, restoring = false) {
    this.setZenModeActive(!this.isZenModeActive());
    this.state.runtime.zenMode.transitionDisposables.clearAndDisposeAll();
    const setLineNumbers = (lineNumbers) => {
      for (const editor of this.mainPartEditorService.visibleTextEditorControls) {
        if (!lineNumbers && isCodeEditor(editor) && editor.hasModel()) {
          const model = editor.getModel();
          lineNumbers = this.configurationService.getValue(
            "editor.lineNumbers",
            {
              resource: model.uri,
              overrideIdentifier: model.getLanguageId()
            }
          );
        }
        if (!lineNumbers) {
          lineNumbers = this.configurationService.getValue(
            "editor.lineNumbers"
          );
        }
        editor.updateOptions({ lineNumbers });
      }
    };
    let toggleMainWindowFullScreen = false;
    const config = getZenModeConfiguration(this.configurationService);
    const zenModeExitInfo = this.stateModel.getRuntimeValue(
      LayoutStateKeys.ZEN_MODE_EXIT_INFO
    );
    if (this.isZenModeActive()) {
      toggleMainWindowFullScreen = !this.state.runtime.mainWindowFullscreen && config.fullScreen && !isIOS;
      if (!restoring) {
        zenModeExitInfo.transitionedToFullScreen = toggleMainWindowFullScreen;
        zenModeExitInfo.transitionedToCenteredEditorLayout = !this.isMainEditorLayoutCentered() && config.centerLayout;
        zenModeExitInfo.handleNotificationsDoNotDisturbMode = this.notificationService.getFilter() === NotificationsFilter.OFF;
        zenModeExitInfo.wasVisible.sideBar = this.isVisible(
          Parts.SIDEBAR_PART
        );
        zenModeExitInfo.wasVisible.panel = this.isVisible(
          Parts.PANEL_PART
        );
        zenModeExitInfo.wasVisible.auxiliaryBar = this.isVisible(
          Parts.AUXILIARYBAR_PART
        );
        this.stateModel.setRuntimeValue(
          LayoutStateKeys.ZEN_MODE_EXIT_INFO,
          zenModeExitInfo
        );
      }
      this.setPanelHidden(true, true);
      this.setAuxiliaryBarHidden(true, true);
      this.setSideBarHidden(true, true);
      if (config.hideActivityBar) {
        this.setActivityBarHidden(true, true);
      }
      if (config.hideStatusBar) {
        this.setStatusBarHidden(true, true);
      }
      if (config.hideLineNumbers) {
        setLineNumbers("off");
        this.state.runtime.zenMode.transitionDisposables.set(
          ZenModeSettings.HIDE_LINENUMBERS,
          this.mainPartEditorService.onDidVisibleEditorsChange(
            () => setLineNumbers("off")
          )
        );
      }
      if (config.showTabs !== this.editorGroupService.partOptions.showTabs) {
        this.state.runtime.zenMode.transitionDisposables.set(
          ZenModeSettings.SHOW_TABS,
          this.editorGroupService.mainPart.enforcePartOptions({
            showTabs: config.showTabs
          })
        );
      }
      if (config.silentNotifications && zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
        this.notificationService.setFilter(NotificationsFilter.ERROR);
      }
      if (config.centerLayout) {
        this.centerMainEditorLayout(true, true);
      }
      this.state.runtime.zenMode.transitionDisposables.set(
        "configurationChange",
        this.configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(ZenModeSettings.HIDE_ACTIVITYBAR)) {
            const zenModeHideActivityBar = this.configurationService.getValue(
              ZenModeSettings.HIDE_ACTIVITYBAR
            );
            this.setActivityBarHidden(zenModeHideActivityBar, true);
          }
          if (e.affectsConfiguration(ZenModeSettings.HIDE_STATUSBAR)) {
            const zenModeHideStatusBar = this.configurationService.getValue(
              ZenModeSettings.HIDE_STATUSBAR
            );
            this.setStatusBarHidden(zenModeHideStatusBar, true);
          }
          if (e.affectsConfiguration(ZenModeSettings.CENTER_LAYOUT)) {
            const zenModeCenterLayout = this.configurationService.getValue(
              ZenModeSettings.CENTER_LAYOUT
            );
            this.centerMainEditorLayout(zenModeCenterLayout, true);
          }
          if (e.affectsConfiguration(ZenModeSettings.SHOW_TABS)) {
            const zenModeShowTabs = this.configurationService.getValue(ZenModeSettings.SHOW_TABS) ?? "multiple";
            this.state.runtime.zenMode.transitionDisposables.set(
              ZenModeSettings.SHOW_TABS,
              this.editorGroupService.mainPart.enforcePartOptions(
                { showTabs: zenModeShowTabs }
              )
            );
          }
          if (e.affectsConfiguration(
            ZenModeSettings.SILENT_NOTIFICATIONS
          )) {
            const zenModeSilentNotifications = !!this.configurationService.getValue(
              ZenModeSettings.SILENT_NOTIFICATIONS
            );
            if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
              this.notificationService.setFilter(
                zenModeSilentNotifications ? NotificationsFilter.ERROR : NotificationsFilter.OFF
              );
            }
          }
          if (e.affectsConfiguration(ZenModeSettings.HIDE_LINENUMBERS)) {
            const lineNumbersType = this.configurationService.getValue(
              ZenModeSettings.HIDE_LINENUMBERS
            ) ? "off" : void 0;
            setLineNumbers(lineNumbersType);
            this.state.runtime.zenMode.transitionDisposables.set(
              ZenModeSettings.HIDE_LINENUMBERS,
              this.mainPartEditorService.onDidVisibleEditorsChange(
                () => setLineNumbers(lineNumbersType)
              )
            );
          }
        })
      );
    } else {
      if (zenModeExitInfo.wasVisible.panel) {
        this.setPanelHidden(false, true);
      }
      if (zenModeExitInfo.wasVisible.auxiliaryBar) {
        this.setAuxiliaryBarHidden(false, true);
      }
      if (zenModeExitInfo.wasVisible.sideBar) {
        this.setSideBarHidden(false, true);
      }
      if (!this.stateModel.getRuntimeValue(
        LayoutStateKeys.ACTIVITYBAR_HIDDEN,
        true
      )) {
        this.setActivityBarHidden(false, true);
      }
      if (!this.stateModel.getRuntimeValue(
        LayoutStateKeys.STATUSBAR_HIDDEN,
        true
      )) {
        this.setStatusBarHidden(false, true);
      }
      if (zenModeExitInfo.transitionedToCenteredEditorLayout) {
        this.centerMainEditorLayout(false, true);
      }
      if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
        this.notificationService.setFilter(NotificationsFilter.OFF);
      }
      setLineNumbers();
      this.focus();
      toggleMainWindowFullScreen = zenModeExitInfo.transitionedToFullScreen && this.state.runtime.mainWindowFullscreen;
    }
    if (!skipLayout) {
      this.layout();
    }
    if (toggleMainWindowFullScreen) {
      this.hostService.toggleFullScreen(mainWindow);
    }
    this._onDidChangeZenMode.fire(this.isZenModeActive());
  }
  setStatusBarHidden(hidden, skipLayout) {
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.STATUSBAR_HIDDEN,
      hidden
    );
    if (hidden) {
      this.mainContainer.classList.add("nostatusbar" /* STATUSBAR_HIDDEN */);
    } else {
      this.mainContainer.classList.remove("nostatusbar" /* STATUSBAR_HIDDEN */);
    }
    this.workbenchGrid.setViewVisible(this.statusBarPartView, !hidden);
  }
  createWorkbenchLayout() {
    const titleBar = this.getPart(Parts.TITLEBAR_PART);
    const bannerPart = this.getPart(Parts.BANNER_PART);
    const editorPart = this.getPart(Parts.EDITOR_PART);
    const activityBar = this.getPart(Parts.ACTIVITYBAR_PART);
    const panelPart = this.getPart(Parts.PANEL_PART);
    const auxiliaryBarPart = this.getPart(Parts.AUXILIARYBAR_PART);
    const sideBar = this.getPart(Parts.SIDEBAR_PART);
    const statusBar = this.getPart(Parts.STATUSBAR_PART);
    this.titleBarPartView = titleBar;
    this.bannerPartView = bannerPart;
    this.sideBarPartView = sideBar;
    this.activityBarPartView = activityBar;
    this.editorPartView = editorPart;
    this.panelPartView = panelPart;
    this.auxiliaryBarPartView = auxiliaryBarPart;
    this.statusBarPartView = statusBar;
    const viewMap = {
      [Parts.ACTIVITYBAR_PART]: this.activityBarPartView,
      [Parts.BANNER_PART]: this.bannerPartView,
      [Parts.TITLEBAR_PART]: this.titleBarPartView,
      [Parts.EDITOR_PART]: this.editorPartView,
      [Parts.PANEL_PART]: this.panelPartView,
      [Parts.SIDEBAR_PART]: this.sideBarPartView,
      [Parts.STATUSBAR_PART]: this.statusBarPartView,
      [Parts.AUXILIARYBAR_PART]: this.auxiliaryBarPartView
    };
    const fromJSON = ({ type }) => viewMap[type];
    const workbenchGrid = SerializableGrid.deserialize(
      this.createGridDescriptor(),
      { fromJSON },
      { proportionalLayout: false }
    );
    this.mainContainer.prepend(workbenchGrid.element);
    this.mainContainer.setAttribute("role", "application");
    this.workbenchGrid = workbenchGrid;
    this.workbenchGrid.edgeSnapping = this.state.runtime.mainWindowFullscreen;
    for (const part of [
      titleBar,
      editorPart,
      activityBar,
      panelPart,
      sideBar,
      statusBar,
      auxiliaryBarPart,
      bannerPart
    ]) {
      this._register(
        part.onDidVisibilityChange((visible) => {
          if (part === sideBar) {
            this.setSideBarHidden(!visible, true);
          } else if (part === panelPart) {
            this.setPanelHidden(!visible, true);
          } else if (part === auxiliaryBarPart) {
            this.setAuxiliaryBarHidden(!visible, true);
          } else if (part === editorPart) {
            this.setEditorHidden(!visible, true);
          }
          this._onDidChangePartVisibility.fire();
          this.handleContainerDidLayout(
            this.mainContainer,
            this._mainContainerDimension
          );
        })
      );
    }
    this._register(
      this.storageService.onWillSaveState((e) => {
        const sideBarSize = this.stateModel.getRuntimeValue(
          LayoutStateKeys.SIDEBAR_HIDDEN
        ) ? this.workbenchGrid.getViewCachedVisibleSize(
          this.sideBarPartView
        ) : this.workbenchGrid.getViewSize(this.sideBarPartView).width;
        this.stateModel.setInitializationValue(
          LayoutStateKeys.SIDEBAR_SIZE,
          sideBarSize
        );
        const panelSize = this.stateModel.getRuntimeValue(
          LayoutStateKeys.PANEL_HIDDEN
        ) ? this.workbenchGrid.getViewCachedVisibleSize(
          this.panelPartView
        ) : isHorizontal(
          this.stateModel.getRuntimeValue(
            LayoutStateKeys.PANEL_POSITION
          )
        ) ? this.workbenchGrid.getViewSize(this.panelPartView).height : this.workbenchGrid.getViewSize(this.panelPartView).width;
        this.stateModel.setInitializationValue(
          LayoutStateKeys.PANEL_SIZE,
          panelSize
        );
        const auxiliaryBarSize = this.stateModel.getRuntimeValue(
          LayoutStateKeys.AUXILIARYBAR_HIDDEN
        ) ? this.workbenchGrid.getViewCachedVisibleSize(
          this.auxiliaryBarPartView
        ) : this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width;
        this.stateModel.setInitializationValue(
          LayoutStateKeys.AUXILIARYBAR_SIZE,
          auxiliaryBarSize
        );
        this.stateModel.save(true, true);
      })
    );
  }
  layout() {
    if (!this.disposed) {
      this._mainContainerDimension = getClientArea(
        this.state.runtime.mainWindowFullscreen ? mainWindow.document.body : (
          // in fullscreen mode, make sure to use <body> element because
          this.parent
        )
        // in that case the workbench will span the entire site
      );
      this.logService.trace(
        `Layout#layout, height: ${this._mainContainerDimension.height}, width: ${this._mainContainerDimension.width}`
      );
      position(this.mainContainer, 0, 0, 0, 0, "relative");
      size(
        this.mainContainer,
        this._mainContainerDimension.width,
        this._mainContainerDimension.height
      );
      this.workbenchGrid.layout(
        this._mainContainerDimension.width,
        this._mainContainerDimension.height
      );
      this.initialized = true;
      this.handleContainerDidLayout(
        this.mainContainer,
        this._mainContainerDimension
      );
    }
  }
  isMainEditorLayoutCentered() {
    return this.stateModel.getRuntimeValue(
      LayoutStateKeys.MAIN_EDITOR_CENTERED
    );
  }
  centerMainEditorLayout(active, skipLayout) {
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.MAIN_EDITOR_CENTERED,
      active
    );
    const activeMainEditor = this.mainPartEditorService.activeEditor;
    let isEditorComplex = false;
    if (activeMainEditor instanceof DiffEditorInput) {
      isEditorComplex = this.configurationService.getValue(
        "diffEditor.renderSideBySide"
      );
    } else if (activeMainEditor?.hasCapability(
      EditorInputCapabilities.MultipleEditors
    )) {
      isEditorComplex = true;
    }
    const isCenteredLayoutAutoResizing = this.configurationService.getValue(
      "workbench.editor.centeredLayoutAutoResize"
    );
    if (isCenteredLayoutAutoResizing && (this.editorGroupService.mainPart.groups.length > 1 && !this.editorGroupService.mainPart.hasMaximizedGroup() || isEditorComplex)) {
      active = false;
    }
    if (this.editorGroupService.mainPart.isLayoutCentered() !== active) {
      this.editorGroupService.mainPart.centerLayout(active);
      if (!skipLayout) {
        this.layout();
      }
    }
    this._onDidChangeMainEditorCenteredLayout.fire(
      this.stateModel.getRuntimeValue(
        LayoutStateKeys.MAIN_EDITOR_CENTERED
      )
    );
  }
  resizePart(part, sizeChangeWidth, sizeChangeHeight) {
    const sizeChangePxWidth = Math.sign(sizeChangeWidth) * computeScreenAwareSize(
      getActiveWindow(),
      Math.abs(sizeChangeWidth)
    );
    const sizeChangePxHeight = Math.sign(sizeChangeHeight) * computeScreenAwareSize(
      getActiveWindow(),
      Math.abs(sizeChangeHeight)
    );
    let viewSize;
    switch (part) {
      case Parts.SIDEBAR_PART:
        viewSize = this.workbenchGrid.getViewSize(this.sideBarPartView);
        this.workbenchGrid.resizeView(this.sideBarPartView, {
          width: viewSize.width + sizeChangePxWidth,
          height: viewSize.height
        });
        break;
      case Parts.PANEL_PART:
        viewSize = this.workbenchGrid.getViewSize(this.panelPartView);
        this.workbenchGrid.resizeView(this.panelPartView, {
          width: viewSize.width + (isHorizontal(this.getPanelPosition()) ? 0 : sizeChangePxWidth),
          height: viewSize.height + (isHorizontal(this.getPanelPosition()) ? sizeChangePxHeight : 0)
        });
        break;
      case Parts.AUXILIARYBAR_PART:
        viewSize = this.workbenchGrid.getViewSize(
          this.auxiliaryBarPartView
        );
        this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
          width: viewSize.width + sizeChangePxWidth,
          height: viewSize.height
        });
        break;
      case Parts.EDITOR_PART:
        viewSize = this.workbenchGrid.getViewSize(this.editorPartView);
        if (this.editorGroupService.mainPart.count === 1) {
          this.workbenchGrid.resizeView(this.editorPartView, {
            width: viewSize.width + sizeChangePxWidth,
            height: viewSize.height + sizeChangePxHeight
          });
        } else {
          const activeGroup = this.editorGroupService.mainPart.activeGroup;
          const { width, height } = this.editorGroupService.mainPart.getSize(activeGroup);
          this.editorGroupService.mainPart.setSize(activeGroup, {
            width: width + sizeChangePxWidth,
            height: height + sizeChangePxHeight
          });
          const { width: newWidth, height: newHeight } = this.editorGroupService.mainPart.getSize(activeGroup);
          if (sizeChangePxHeight && height === newHeight || sizeChangePxWidth && width === newWidth) {
            this.workbenchGrid.resizeView(this.editorPartView, {
              width: viewSize.width + (sizeChangePxWidth && width === newWidth ? sizeChangePxWidth : 0),
              height: viewSize.height + (sizeChangePxHeight && height === newHeight ? sizeChangePxHeight : 0)
            });
          }
        }
        break;
      default:
        return;
    }
  }
  setActivityBarHidden(hidden, skipLayout) {
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.ACTIVITYBAR_HIDDEN,
      hidden
    );
    this.workbenchGrid.setViewVisible(this.activityBarPartView, !hidden);
  }
  setBannerHidden(hidden) {
    this.workbenchGrid.setViewVisible(this.bannerPartView, !hidden);
  }
  setEditorHidden(hidden, skipLayout) {
    this.stateModel.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, hidden);
    if (hidden) {
      this.mainContainer.classList.add(
        "nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */
      );
    } else {
      this.mainContainer.classList.remove(
        "nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */
      );
    }
    this.workbenchGrid.setViewVisible(this.editorPartView, !hidden);
    if (hidden && !this.isVisible(Parts.PANEL_PART)) {
      this.setPanelHidden(false, true);
    }
  }
  getLayoutClasses() {
    return coalesce([
      this.isVisible(Parts.SIDEBAR_PART) ? void 0 : "nosidebar" /* SIDEBAR_HIDDEN */,
      this.isVisible(Parts.EDITOR_PART, mainWindow) ? void 0 : "nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */,
      this.isVisible(Parts.PANEL_PART) ? void 0 : "nopanel" /* PANEL_HIDDEN */,
      this.isVisible(Parts.AUXILIARYBAR_PART) ? void 0 : "noauxiliarybar" /* AUXILIARYBAR_HIDDEN */,
      this.isVisible(Parts.STATUSBAR_PART) ? void 0 : "nostatusbar" /* STATUSBAR_HIDDEN */,
      this.state.runtime.mainWindowFullscreen ? "fullscreen" /* FULLSCREEN */ : void 0
    ]);
  }
  setSideBarHidden(hidden, skipLayout) {
    this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, hidden);
    if (hidden) {
      this.mainContainer.classList.add("nosidebar" /* SIDEBAR_HIDDEN */);
    } else {
      this.mainContainer.classList.remove("nosidebar" /* SIDEBAR_HIDDEN */);
    }
    if (hidden && this.paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Sidebar
    )) {
      this.paneCompositeService.hideActivePaneComposite(
        ViewContainerLocation.Sidebar
      );
      this.focusPanelOrEditor();
    } else if (!hidden && !this.paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Sidebar
    )) {
      const viewletToOpen = this.paneCompositeService.getLastActivePaneCompositeId(
        ViewContainerLocation.Sidebar
      );
      if (viewletToOpen) {
        const viewlet = this.paneCompositeService.openPaneComposite(
          viewletToOpen,
          ViewContainerLocation.Sidebar,
          true
        );
        if (!viewlet) {
          this.paneCompositeService.openPaneComposite(
            this.viewDescriptorService.getDefaultViewContainer(
              ViewContainerLocation.Sidebar
            )?.id,
            ViewContainerLocation.Sidebar,
            true
          );
        }
      }
    }
    this.workbenchGrid.setViewVisible(this.sideBarPartView, !hidden);
  }
  hasViews(id) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(id);
    if (!viewContainer) {
      return false;
    }
    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
    if (!viewContainerModel) {
      return false;
    }
    return viewContainerModel.activeViewDescriptors.length >= 1;
  }
  adjustPartPositions(sideBarPosition, panelAlignment, panelPosition) {
    const isPanelVertical = !isHorizontal(panelPosition);
    const sideBarSiblingToEditor = isPanelVertical || !(panelAlignment === "center" || sideBarPosition === Position.LEFT && panelAlignment === "right" || sideBarPosition === Position.RIGHT && panelAlignment === "left");
    const auxiliaryBarSiblingToEditor = isPanelVertical || !(panelAlignment === "center" || sideBarPosition === Position.RIGHT && panelAlignment === "right" || sideBarPosition === Position.LEFT && panelAlignment === "left");
    const preMovePanelWidth = this.isVisible(Parts.PANEL_PART) ? this.workbenchGrid.getViewSize(this.panelPartView).width : Sizing.Invisible(
      this.workbenchGrid.getViewCachedVisibleSize(
        this.panelPartView
      ) ?? this.panelPartView.minimumWidth
    );
    const preMovePanelHeight = this.isVisible(Parts.PANEL_PART) ? this.workbenchGrid.getViewSize(this.panelPartView).height : Sizing.Invisible(
      this.workbenchGrid.getViewCachedVisibleSize(
        this.panelPartView
      ) ?? this.panelPartView.minimumHeight
    );
    const preMoveSideBarSize = this.isVisible(Parts.SIDEBAR_PART) ? this.workbenchGrid.getViewSize(this.sideBarPartView).width : Sizing.Invisible(
      this.workbenchGrid.getViewCachedVisibleSize(
        this.sideBarPartView
      ) ?? this.sideBarPartView.minimumWidth
    );
    const preMoveAuxiliaryBarSize = this.isVisible(Parts.AUXILIARYBAR_PART) ? this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width : Sizing.Invisible(
      this.workbenchGrid.getViewCachedVisibleSize(
        this.auxiliaryBarPartView
      ) ?? this.auxiliaryBarPartView.minimumWidth
    );
    if (sideBarPosition === Position.LEFT) {
      this.workbenchGrid.moveViewTo(this.activityBarPartView, [2, 0]);
      this.workbenchGrid.moveView(
        this.sideBarPartView,
        preMoveSideBarSize,
        sideBarSiblingToEditor ? this.editorPartView : this.activityBarPartView,
        sideBarSiblingToEditor ? Direction.Left : Direction.Right
      );
      if (auxiliaryBarSiblingToEditor) {
        this.workbenchGrid.moveView(
          this.auxiliaryBarPartView,
          preMoveAuxiliaryBarSize,
          this.editorPartView,
          Direction.Right
        );
      } else {
        this.workbenchGrid.moveViewTo(
          this.auxiliaryBarPartView,
          [2, -1]
        );
      }
    } else {
      this.workbenchGrid.moveViewTo(this.activityBarPartView, [2, -1]);
      this.workbenchGrid.moveView(
        this.sideBarPartView,
        preMoveSideBarSize,
        sideBarSiblingToEditor ? this.editorPartView : this.activityBarPartView,
        sideBarSiblingToEditor ? Direction.Right : Direction.Left
      );
      if (auxiliaryBarSiblingToEditor) {
        this.workbenchGrid.moveView(
          this.auxiliaryBarPartView,
          preMoveAuxiliaryBarSize,
          this.editorPartView,
          Direction.Left
        );
      } else {
        this.workbenchGrid.moveViewTo(
          this.auxiliaryBarPartView,
          [2, 0]
        );
      }
    }
    if (isPanelVertical) {
      this.workbenchGrid.moveView(
        this.panelPartView,
        preMovePanelWidth,
        this.editorPartView,
        panelPosition === Position.LEFT ? Direction.Left : Direction.Right
      );
      this.workbenchGrid.resizeView(this.panelPartView, {
        height: preMovePanelHeight,
        width: preMovePanelWidth
      });
    }
    if (this.isVisible(Parts.SIDEBAR_PART)) {
      this.workbenchGrid.resizeView(this.sideBarPartView, {
        height: this.workbenchGrid.getViewSize(this.sideBarPartView).height,
        width: preMoveSideBarSize
      });
    }
    if (this.isVisible(Parts.AUXILIARYBAR_PART)) {
      this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
        height: this.workbenchGrid.getViewSize(
          this.auxiliaryBarPartView
        ).height,
        width: preMoveAuxiliaryBarSize
      });
    }
  }
  setPanelAlignment(alignment, skipLayout) {
    if (!isHorizontal(this.getPanelPosition())) {
      this.setPanelPosition(Position.BOTTOM);
    }
    if (alignment !== "center" && this.isPanelMaximized()) {
      this.toggleMaximizedPanel();
    }
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.PANEL_ALIGNMENT,
      alignment
    );
    this.adjustPartPositions(
      this.getSideBarPosition(),
      alignment,
      this.getPanelPosition()
    );
    this._onDidChangePanelAlignment.fire(alignment);
  }
  setPanelHidden(hidden, skipLayout) {
    if (!this.workbenchGrid) {
      return;
    }
    const wasHidden = !this.isVisible(Parts.PANEL_PART);
    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, hidden);
    const isPanelMaximized = this.isPanelMaximized();
    const panelOpensMaximized = this.panelOpensMaximized();
    if (hidden) {
      this.mainContainer.classList.add("nopanel" /* PANEL_HIDDEN */);
    } else {
      this.mainContainer.classList.remove("nopanel" /* PANEL_HIDDEN */);
    }
    let focusEditor = false;
    if (hidden && this.paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Panel
    )) {
      this.paneCompositeService.hideActivePaneComposite(
        ViewContainerLocation.Panel
      );
      focusEditor = isIOS ? false : true;
    } else if (!hidden && !this.paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Panel
    )) {
      let panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(
        ViewContainerLocation.Panel
      );
      if (!panelToOpen || !this.hasViews(panelToOpen)) {
        panelToOpen = this.viewDescriptorService.getViewContainersByLocation(ViewContainerLocation.Panel).find(
          (viewContainer) => this.hasViews(viewContainer.id)
        )?.id;
      }
      if (panelToOpen) {
        const focus = !skipLayout;
        this.paneCompositeService.openPaneComposite(
          panelToOpen,
          ViewContainerLocation.Panel,
          focus
        );
      }
    }
    if (hidden && isPanelMaximized) {
      this.toggleMaximizedPanel();
    }
    if (wasHidden === hidden) {
      return;
    }
    this.workbenchGrid.setViewVisible(this.panelPartView, !hidden);
    if (hidden) {
      this.stateModel.setRuntimeValue(
        LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED,
        isPanelMaximized
      );
    } else if (!skipLayout && isPanelMaximized !== panelOpensMaximized) {
      this.toggleMaximizedPanel();
    }
    if (focusEditor) {
      this.editorGroupService.mainPart.activeGroup.focus();
    }
  }
  toggleMaximizedPanel() {
    const size2 = this.workbenchGrid.getViewSize(this.panelPartView);
    const panelPosition = this.getPanelPosition();
    const isMaximized = this.isPanelMaximized();
    if (isMaximized) {
      this.setEditorHidden(false);
      this.workbenchGrid.resizeView(this.panelPartView, {
        width: isHorizontal(panelPosition) ? size2.width : this.stateModel.getRuntimeValue(
          LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH
        ),
        height: isHorizontal(panelPosition) ? this.stateModel.getRuntimeValue(
          LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT
        ) : size2.height
      });
    } else {
      if (this.isVisible(Parts.PANEL_PART)) {
        if (isHorizontal(panelPosition)) {
          this.stateModel.setRuntimeValue(
            LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT,
            size2.height
          );
        } else {
          this.stateModel.setRuntimeValue(
            LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH,
            size2.width
          );
        }
      }
      this.setEditorHidden(true);
    }
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED,
      !isMaximized
    );
  }
  panelOpensMaximized() {
    if (this.getPanelAlignment() !== "center" && isHorizontal(this.getPanelPosition())) {
      return false;
    }
    const panelOpensMaximized = panelOpensMaximizedFromString(
      this.configurationService.getValue(
        "workbench.panel.opensMaximized" /* PANEL_OPENS_MAXIMIZED */
      )
    );
    const panelLastIsMaximized = this.stateModel.getRuntimeValue(
      LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED
    );
    return panelOpensMaximized === PanelOpensMaximizedOptions.ALWAYS || panelOpensMaximized === PanelOpensMaximizedOptions.REMEMBER_LAST && panelLastIsMaximized;
  }
  setAuxiliaryBarHidden(hidden, skipLayout) {
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.AUXILIARYBAR_HIDDEN,
      hidden
    );
    if (hidden) {
      this.mainContainer.classList.add("noauxiliarybar" /* AUXILIARYBAR_HIDDEN */);
    } else {
      this.mainContainer.classList.remove(
        "noauxiliarybar" /* AUXILIARYBAR_HIDDEN */
      );
    }
    if (hidden && this.paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.AuxiliaryBar
    )) {
      this.paneCompositeService.hideActivePaneComposite(
        ViewContainerLocation.AuxiliaryBar
      );
      this.focusPanelOrEditor();
    } else if (!hidden && !this.paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.AuxiliaryBar
    )) {
      let panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(
        ViewContainerLocation.AuxiliaryBar
      );
      if (!panelToOpen || !this.hasViews(panelToOpen)) {
        panelToOpen = this.viewDescriptorService.getViewContainersByLocation(
          ViewContainerLocation.AuxiliaryBar
        ).find(
          (viewContainer) => this.hasViews(viewContainer.id)
        )?.id;
      }
      if (panelToOpen) {
        const focus = !skipLayout;
        this.paneCompositeService.openPaneComposite(
          panelToOpen,
          ViewContainerLocation.AuxiliaryBar,
          focus
        );
      }
    }
    this.workbenchGrid.setViewVisible(this.auxiliaryBarPartView, !hidden);
  }
  setPartHidden(hidden, part, targetWindow = mainWindow) {
    switch (part) {
      case Parts.ACTIVITYBAR_PART:
        return this.setActivityBarHidden(hidden);
      case Parts.SIDEBAR_PART:
        return this.setSideBarHidden(hidden);
      case Parts.EDITOR_PART:
        return this.setEditorHidden(hidden);
      case Parts.BANNER_PART:
        return this.setBannerHidden(hidden);
      case Parts.AUXILIARYBAR_PART:
        return this.setAuxiliaryBarHidden(hidden);
      case Parts.PANEL_PART:
        return this.setPanelHidden(hidden);
    }
  }
  hasMainWindowBorder() {
    return this.state.runtime.mainWindowBorder;
  }
  getMainWindowBorderRadius() {
    return this.state.runtime.mainWindowBorder && isMacintosh ? "5px" : void 0;
  }
  isPanelMaximized() {
    return (this.getPanelAlignment() === "center" || !isHorizontal(this.getPanelPosition())) && !this.isVisible(Parts.EDITOR_PART, mainWindow);
  }
  getSideBarPosition() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
  }
  getPanelAlignment() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
  }
  updateMenubarVisibility(skipLayout) {
    const shouldShowTitleBar = shouldShowCustomTitleBar(
      this.configurationService,
      mainWindow,
      this.state.runtime.menuBar.toggled,
      this.isZenModeActive()
    );
    if (!skipLayout && this.workbenchGrid && shouldShowTitleBar !== this.isVisible(Parts.TITLEBAR_PART, mainWindow)) {
      this.workbenchGrid.setViewVisible(
        this.titleBarPartView,
        shouldShowTitleBar
      );
    }
  }
  updateCustomTitleBarVisibility() {
    const shouldShowTitleBar = shouldShowCustomTitleBar(
      this.configurationService,
      mainWindow,
      this.state.runtime.menuBar.toggled,
      this.isZenModeActive()
    );
    const titlebarVisible = this.isVisible(Parts.TITLEBAR_PART);
    if (shouldShowTitleBar !== titlebarVisible) {
      this.workbenchGrid.setViewVisible(
        this.titleBarPartView,
        shouldShowTitleBar
      );
    }
  }
  toggleMenuBar() {
    let currentVisibilityValue = getMenuBarVisibility(
      this.configurationService
    );
    if (typeof currentVisibilityValue !== "string") {
      currentVisibilityValue = "classic";
    }
    let newVisibilityValue;
    if (currentVisibilityValue === "visible" || currentVisibilityValue === "classic") {
      newVisibilityValue = hasNativeTitlebar(this.configurationService) ? "toggle" : "compact";
    } else {
      newVisibilityValue = "classic";
    }
    this.configurationService.updateValue(
      "window.menuBarVisibility",
      newVisibilityValue
    );
  }
  getPanelPosition() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION);
  }
  setPanelPosition(position2) {
    if (!this.isVisible(Parts.PANEL_PART)) {
      this.setPanelHidden(false);
    }
    const panelPart = this.getPart(Parts.PANEL_PART);
    const oldPositionValue = positionToString(this.getPanelPosition());
    const newPositionValue = positionToString(position2);
    const panelContainer = assertIsDefined(panelPart.getContainer());
    panelContainer.classList.remove(oldPositionValue);
    panelContainer.classList.add(newPositionValue);
    panelPart.updateStyles();
    const size2 = this.workbenchGrid.getViewSize(this.panelPartView);
    const sideBarSize = this.workbenchGrid.getViewSize(
      this.sideBarPartView
    );
    const auxiliaryBarSize = this.workbenchGrid.getViewSize(
      this.auxiliaryBarPartView
    );
    let editorHidden = !this.isVisible(Parts.EDITOR_PART, mainWindow);
    if (newPositionValue !== oldPositionValue && !editorHidden) {
      if (isHorizontal(position2)) {
        this.stateModel.setRuntimeValue(
          LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH,
          size2.width
        );
      } else if (isHorizontal(positionFromString(oldPositionValue))) {
        this.stateModel.setRuntimeValue(
          LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT,
          size2.height
        );
      }
    }
    if (isHorizontal(position2) && this.getPanelAlignment() !== "center" && editorHidden) {
      this.toggleMaximizedPanel();
      editorHidden = false;
    }
    this.stateModel.setRuntimeValue(
      LayoutStateKeys.PANEL_POSITION,
      position2
    );
    const sideBarVisible = this.isVisible(Parts.SIDEBAR_PART);
    const auxiliaryBarVisible = this.isVisible(Parts.AUXILIARYBAR_PART);
    if (position2 === Position.BOTTOM) {
      this.workbenchGrid.moveView(
        this.panelPartView,
        editorHidden ? size2.height : this.stateModel.getRuntimeValue(
          LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT
        ),
        this.editorPartView,
        Direction.Down
      );
    } else if (position2 === Position.TOP) {
      this.workbenchGrid.moveView(
        this.panelPartView,
        editorHidden ? size2.height : this.stateModel.getRuntimeValue(
          LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT
        ),
        this.editorPartView,
        Direction.Up
      );
    } else if (position2 === Position.RIGHT) {
      this.workbenchGrid.moveView(
        this.panelPartView,
        editorHidden ? size2.width : this.stateModel.getRuntimeValue(
          LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH
        ),
        this.editorPartView,
        Direction.Right
      );
    } else {
      this.workbenchGrid.moveView(
        this.panelPartView,
        editorHidden ? size2.width : this.stateModel.getRuntimeValue(
          LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH
        ),
        this.editorPartView,
        Direction.Left
      );
    }
    this.workbenchGrid.resizeView(this.sideBarPartView, sideBarSize);
    if (!sideBarVisible) {
      this.setSideBarHidden(true);
    }
    this.workbenchGrid.resizeView(
      this.auxiliaryBarPartView,
      auxiliaryBarSize
    );
    if (!auxiliaryBarVisible) {
      this.setAuxiliaryBarHidden(true);
    }
    if (isHorizontal(position2)) {
      this.adjustPartPositions(
        this.getSideBarPosition(),
        this.getPanelAlignment(),
        position2
      );
    }
    this._onDidChangePanelPosition.fire(newPositionValue);
  }
  isWindowMaximized(targetWindow) {
    return this.state.runtime.maximized.has(getWindowId(targetWindow));
  }
  updateWindowMaximizedState(targetWindow, maximized) {
    this.mainContainer.classList.toggle("maximized" /* MAXIMIZED */, maximized);
    const targetWindowId = getWindowId(targetWindow);
    if (maximized === this.state.runtime.maximized.has(targetWindowId)) {
      return;
    }
    if (maximized) {
      this.state.runtime.maximized.add(targetWindowId);
    } else {
      this.state.runtime.maximized.delete(targetWindowId);
    }
    this.updateWindowsBorder();
    this._onDidChangeWindowMaximized.fire({
      windowId: targetWindowId,
      maximized
    });
  }
  getVisibleNeighborPart(part, direction) {
    if (!this.workbenchGrid) {
      return void 0;
    }
    if (!this.isVisible(part, mainWindow)) {
      return void 0;
    }
    const neighborViews = this.workbenchGrid.getNeighborViews(
      this.getPart(part),
      direction,
      false
    );
    if (!neighborViews) {
      return void 0;
    }
    for (const neighborView of neighborViews) {
      const neighborPart = [
        Parts.ACTIVITYBAR_PART,
        Parts.EDITOR_PART,
        Parts.PANEL_PART,
        Parts.AUXILIARYBAR_PART,
        Parts.SIDEBAR_PART,
        Parts.STATUSBAR_PART,
        Parts.TITLEBAR_PART
      ].find(
        (partId) => this.getPart(partId) === neighborView && this.isVisible(partId, mainWindow)
      );
      if (neighborPart !== void 0) {
        return neighborPart;
      }
    }
    return void 0;
  }
  onDidChangeWCO() {
    const bannerFirst = this.workbenchGrid.getNeighborViews(
      this.titleBarPartView,
      Direction.Up,
      false
    ).length > 0;
    const shouldBannerBeFirst = this.shouldShowBannerFirst();
    if (bannerFirst !== shouldBannerBeFirst) {
      this.workbenchGrid.moveView(
        this.bannerPartView,
        Sizing.Distribute,
        this.titleBarPartView,
        shouldBannerBeFirst ? Direction.Up : Direction.Down
      );
    }
    this.workbenchGrid.setViewVisible(
      this.titleBarPartView,
      shouldShowCustomTitleBar(
        this.configurationService,
        mainWindow,
        this.state.runtime.menuBar.toggled,
        this.isZenModeActive()
      )
    );
  }
  arrangeEditorNodes(nodes, availableHeight, availableWidth) {
    if (!nodes.sideBar && !nodes.auxiliaryBar) {
      nodes.editor.size = availableHeight;
      return nodes.editor;
    }
    const result = [nodes.editor];
    nodes.editor.size = availableWidth;
    if (nodes.sideBar) {
      if (this.stateModel.getRuntimeValue(
        LayoutStateKeys.SIDEBAR_POSITON
      ) === Position.LEFT) {
        result.splice(0, 0, nodes.sideBar);
      } else {
        result.push(nodes.sideBar);
      }
      nodes.editor.size -= this.stateModel.getRuntimeValue(
        LayoutStateKeys.SIDEBAR_HIDDEN
      ) ? 0 : nodes.sideBar.size;
    }
    if (nodes.auxiliaryBar) {
      if (this.stateModel.getRuntimeValue(
        LayoutStateKeys.SIDEBAR_POSITON
      ) === Position.RIGHT) {
        result.splice(0, 0, nodes.auxiliaryBar);
      } else {
        result.push(nodes.auxiliaryBar);
      }
      nodes.editor.size -= this.stateModel.getRuntimeValue(
        LayoutStateKeys.AUXILIARYBAR_HIDDEN
      ) ? 0 : nodes.auxiliaryBar.size;
    }
    return {
      type: "branch",
      data: result,
      size: availableHeight
    };
  }
  arrangeMiddleSectionNodes(nodes, availableWidth, availableHeight) {
    const activityBarSize = this.stateModel.getRuntimeValue(
      LayoutStateKeys.ACTIVITYBAR_HIDDEN
    ) ? 0 : nodes.activityBar.size;
    const sideBarSize = this.stateModel.getRuntimeValue(
      LayoutStateKeys.SIDEBAR_HIDDEN
    ) ? 0 : nodes.sideBar.size;
    const auxiliaryBarSize = this.stateModel.getRuntimeValue(
      LayoutStateKeys.AUXILIARYBAR_HIDDEN
    ) ? 0 : nodes.auxiliaryBar.size;
    const panelSize = this.stateModel.getInitializationValue(
      LayoutStateKeys.PANEL_SIZE
    ) ? 0 : nodes.panel.size;
    const panelPostion = this.stateModel.getRuntimeValue(
      LayoutStateKeys.PANEL_POSITION
    );
    const sideBarPosition = this.stateModel.getRuntimeValue(
      LayoutStateKeys.SIDEBAR_POSITON
    );
    const result = [];
    if (isHorizontal(panelPostion)) {
      const panelAlignment = this.stateModel.getRuntimeValue(
        LayoutStateKeys.PANEL_ALIGNMENT
      );
      const sideBarNextToEditor = !(panelAlignment === "center" || sideBarPosition === Position.LEFT && panelAlignment === "right" || sideBarPosition === Position.RIGHT && panelAlignment === "left");
      const auxiliaryBarNextToEditor = !(panelAlignment === "center" || sideBarPosition === Position.RIGHT && panelAlignment === "right" || sideBarPosition === Position.LEFT && panelAlignment === "left");
      const editorSectionWidth = availableWidth - activityBarSize - (sideBarNextToEditor ? 0 : sideBarSize) - (auxiliaryBarNextToEditor ? 0 : auxiliaryBarSize);
      const editorNodes = this.arrangeEditorNodes(
        {
          editor: nodes.editor,
          sideBar: sideBarNextToEditor ? nodes.sideBar : void 0,
          auxiliaryBar: auxiliaryBarNextToEditor ? nodes.auxiliaryBar : void 0
        },
        availableHeight - panelSize,
        editorSectionWidth
      );
      result.push({
        type: "branch",
        data: panelPostion === Position.BOTTOM ? [editorNodes, nodes.panel] : [nodes.panel, editorNodes],
        size: editorSectionWidth
      });
      if (!sideBarNextToEditor) {
        if (sideBarPosition === Position.LEFT) {
          result.splice(0, 0, nodes.sideBar);
        } else {
          result.push(nodes.sideBar);
        }
      }
      if (!auxiliaryBarNextToEditor) {
        if (sideBarPosition === Position.RIGHT) {
          result.splice(0, 0, nodes.auxiliaryBar);
        } else {
          result.push(nodes.auxiliaryBar);
        }
      }
      if (sideBarPosition === Position.LEFT) {
        result.splice(0, 0, nodes.activityBar);
      } else {
        result.push(nodes.activityBar);
      }
    } else {
      result.push(nodes.editor);
      nodes.editor.size = availableWidth - activityBarSize - sideBarSize - panelSize - auxiliaryBarSize;
      if (panelPostion === Position.RIGHT) {
        result.push(nodes.panel);
      } else {
        result.splice(0, 0, nodes.panel);
      }
      if (sideBarPosition === Position.LEFT) {
        result.push(nodes.auxiliaryBar);
        result.splice(0, 0, nodes.sideBar);
        result.splice(0, 0, nodes.activityBar);
      } else {
        result.splice(0, 0, nodes.auxiliaryBar);
        result.push(nodes.sideBar);
        result.push(nodes.activityBar);
      }
    }
    return result;
  }
  createGridDescriptor() {
    const { width, height } = this.stateModel.getInitializationValue(
      LayoutStateKeys.GRID_SIZE
    );
    const sideBarSize = this.stateModel.getInitializationValue(
      LayoutStateKeys.SIDEBAR_SIZE
    );
    const auxiliaryBarPartSize = this.stateModel.getInitializationValue(
      LayoutStateKeys.AUXILIARYBAR_SIZE
    );
    const panelSize = this.stateModel.getInitializationValue(
      LayoutStateKeys.PANEL_SIZE
    );
    const titleBarHeight = this.titleBarPartView.minimumHeight;
    const bannerHeight = this.bannerPartView.minimumHeight;
    const statusBarHeight = this.statusBarPartView.minimumHeight;
    const activityBarWidth = this.activityBarPartView.minimumWidth;
    const middleSectionHeight = height - titleBarHeight - statusBarHeight;
    const titleAndBanner = [
      {
        type: "leaf",
        data: { type: Parts.TITLEBAR_PART },
        size: titleBarHeight,
        visible: this.isVisible(Parts.TITLEBAR_PART, mainWindow)
      },
      {
        type: "leaf",
        data: { type: Parts.BANNER_PART },
        size: bannerHeight,
        visible: false
      }
    ];
    const activityBarNode = {
      type: "leaf",
      data: { type: Parts.ACTIVITYBAR_PART },
      size: activityBarWidth,
      visible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.ACTIVITYBAR_HIDDEN
      )
    };
    const sideBarNode = {
      type: "leaf",
      data: { type: Parts.SIDEBAR_PART },
      size: sideBarSize,
      visible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.SIDEBAR_HIDDEN
      )
    };
    const auxiliaryBarNode = {
      type: "leaf",
      data: { type: Parts.AUXILIARYBAR_PART },
      size: auxiliaryBarPartSize,
      visible: this.isVisible(Parts.AUXILIARYBAR_PART)
    };
    const editorNode = {
      type: "leaf",
      data: { type: Parts.EDITOR_PART },
      size: 0,
      // Update based on sibling sizes
      visible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.EDITOR_HIDDEN
      )
    };
    const panelNode = {
      type: "leaf",
      data: { type: Parts.PANEL_PART },
      size: panelSize,
      visible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.PANEL_HIDDEN
      )
    };
    const middleSection = this.arrangeMiddleSectionNodes(
      {
        activityBar: activityBarNode,
        auxiliaryBar: auxiliaryBarNode,
        editor: editorNode,
        panel: panelNode,
        sideBar: sideBarNode
      },
      width,
      middleSectionHeight
    );
    const result = {
      root: {
        type: "branch",
        size: width,
        data: [
          ...this.shouldShowBannerFirst() ? titleAndBanner.reverse() : titleAndBanner,
          {
            type: "branch",
            data: middleSection,
            size: middleSectionHeight
          },
          {
            type: "leaf",
            data: { type: Parts.STATUSBAR_PART },
            size: statusBarHeight,
            visible: !this.stateModel.getRuntimeValue(
              LayoutStateKeys.STATUSBAR_HIDDEN
            )
          }
        ]
      },
      orientation: Orientation.VERTICAL,
      width,
      height
    };
    const layoutDescriptor = {
      activityBarVisible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.ACTIVITYBAR_HIDDEN
      ),
      sideBarVisible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.SIDEBAR_HIDDEN
      ),
      auxiliaryBarVisible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.AUXILIARYBAR_HIDDEN
      ),
      panelVisible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.PANEL_HIDDEN
      ),
      statusbarVisible: !this.stateModel.getRuntimeValue(
        LayoutStateKeys.STATUSBAR_HIDDEN
      ),
      sideBarPosition: positionToString(
        this.stateModel.getRuntimeValue(
          LayoutStateKeys.SIDEBAR_POSITON
        )
      ),
      panelPosition: positionToString(
        this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION)
      )
    };
    this.telemetryService.publicLog2("startupLayout", layoutDescriptor);
    return result;
  }
  dispose() {
    super.dispose();
    this.disposed = true;
  }
}
function getZenModeConfiguration(configurationService) {
  return configurationService.getValue(
    "zenMode" /* ZEN_MODE_CONFIG */
  );
}
class WorkbenchLayoutStateKey {
  constructor(name, scope, target, defaultValue) {
    this.name = name;
    this.scope = scope;
    this.target = target;
    this.defaultValue = defaultValue;
  }
}
class RuntimeStateKey extends WorkbenchLayoutStateKey {
  constructor(name, scope, target, defaultValue, zenModeIgnore) {
    super(name, scope, target, defaultValue);
    this.zenModeIgnore = zenModeIgnore;
  }
  runtime = true;
}
class InitializationStateKey extends WorkbenchLayoutStateKey {
  runtime = false;
}
const LayoutStateKeys = {
  // Editor
  MAIN_EDITOR_CENTERED: new RuntimeStateKey(
    "editor.centered",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    false
  ),
  // Zen Mode
  ZEN_MODE_ACTIVE: new RuntimeStateKey(
    "zenMode.active",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    false
  ),
  ZEN_MODE_EXIT_INFO: new RuntimeStateKey(
    "zenMode.exitInfo",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    {
      transitionedToCenteredEditorLayout: false,
      transitionedToFullScreen: false,
      handleNotificationsDoNotDisturbMode: false,
      wasVisible: {
        auxiliaryBar: false,
        panel: false,
        sideBar: false
      }
    }
  ),
  // Part Sizing
  GRID_SIZE: new InitializationStateKey(
    "grid.size",
    StorageScope.PROFILE,
    StorageTarget.MACHINE,
    { width: 800, height: 600 }
  ),
  SIDEBAR_SIZE: new InitializationStateKey(
    "sideBar.size",
    StorageScope.PROFILE,
    StorageTarget.MACHINE,
    200
  ),
  AUXILIARYBAR_SIZE: new InitializationStateKey(
    "auxiliaryBar.size",
    StorageScope.PROFILE,
    StorageTarget.MACHINE,
    200
  ),
  PANEL_SIZE: new InitializationStateKey(
    "panel.size",
    StorageScope.PROFILE,
    StorageTarget.MACHINE,
    300
  ),
  PANEL_LAST_NON_MAXIMIZED_HEIGHT: new RuntimeStateKey(
    "panel.lastNonMaximizedHeight",
    StorageScope.PROFILE,
    StorageTarget.MACHINE,
    300
  ),
  PANEL_LAST_NON_MAXIMIZED_WIDTH: new RuntimeStateKey(
    "panel.lastNonMaximizedWidth",
    StorageScope.PROFILE,
    StorageTarget.MACHINE,
    300
  ),
  PANEL_WAS_LAST_MAXIMIZED: new RuntimeStateKey(
    "panel.wasLastMaximized",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    false
  ),
  // Part Positions
  SIDEBAR_POSITON: new RuntimeStateKey(
    "sideBar.position",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    Position.LEFT
  ),
  PANEL_POSITION: new RuntimeStateKey(
    "panel.position",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    Position.BOTTOM
  ),
  PANEL_ALIGNMENT: new RuntimeStateKey(
    "panel.alignment",
    StorageScope.PROFILE,
    StorageTarget.USER,
    "center"
  ),
  // Part Visibility
  ACTIVITYBAR_HIDDEN: new RuntimeStateKey(
    "activityBar.hidden",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    false,
    true
  ),
  SIDEBAR_HIDDEN: new RuntimeStateKey(
    "sideBar.hidden",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    false
  ),
  EDITOR_HIDDEN: new RuntimeStateKey(
    "editor.hidden",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    false
  ),
  PANEL_HIDDEN: new RuntimeStateKey(
    "panel.hidden",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    true
  ),
  AUXILIARYBAR_HIDDEN: new RuntimeStateKey(
    "auxiliaryBar.hidden",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    true
  ),
  STATUSBAR_HIDDEN: new RuntimeStateKey(
    "statusBar.hidden",
    StorageScope.WORKSPACE,
    StorageTarget.MACHINE,
    false,
    true
  )
};
var WorkbenchLayoutSettings = /* @__PURE__ */ ((WorkbenchLayoutSettings2) => {
  WorkbenchLayoutSettings2["PANEL_POSITION"] = "workbench.panel.defaultLocation";
  WorkbenchLayoutSettings2["PANEL_OPENS_MAXIMIZED"] = "workbench.panel.opensMaximized";
  WorkbenchLayoutSettings2["ZEN_MODE_CONFIG"] = "zenMode";
  WorkbenchLayoutSettings2["EDITOR_CENTERED_LAYOUT_AUTO_RESIZE"] = "workbench.editor.centeredLayoutAutoResize";
  return WorkbenchLayoutSettings2;
})(WorkbenchLayoutSettings || {});
var LegacyWorkbenchLayoutSettings = /* @__PURE__ */ ((LegacyWorkbenchLayoutSettings2) => {
  LegacyWorkbenchLayoutSettings2["STATUSBAR_VISIBLE"] = "workbench.statusBar.visible";
  LegacyWorkbenchLayoutSettings2["SIDEBAR_POSITION"] = "workbench.sideBar.location";
  return LegacyWorkbenchLayoutSettings2;
})(LegacyWorkbenchLayoutSettings || {});
class LayoutStateModel extends Disposable {
  constructor(storageService, configurationService, contextService, container) {
    super();
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.container = container;
    this._register(
      this.configurationService.onDidChangeConfiguration(
        (configurationChange) => this.updateStateFromLegacySettings(configurationChange)
      )
    );
  }
  static STORAGE_PREFIX = "workbench.";
  _onDidChangeState = this._register(
    new Emitter()
  );
  onDidChangeState = this._onDidChangeState.event;
  stateCache = /* @__PURE__ */ new Map();
  updateStateFromLegacySettings(configurationChangeEvent) {
    if (configurationChangeEvent.affectsConfiguration(
      LayoutSettings.ACTIVITY_BAR_LOCATION
    )) {
      this.setRuntimeValueAndFire(
        LayoutStateKeys.ACTIVITYBAR_HIDDEN,
        this.isActivityBarHidden()
      );
    }
    if (configurationChangeEvent.affectsConfiguration(
      "workbench.statusBar.visible" /* STATUSBAR_VISIBLE */
    )) {
      this.setRuntimeValueAndFire(
        LayoutStateKeys.STATUSBAR_HIDDEN,
        !this.configurationService.getValue(
          "workbench.statusBar.visible" /* STATUSBAR_VISIBLE */
        )
      );
    }
    if (configurationChangeEvent.affectsConfiguration(
      "workbench.sideBar.location" /* SIDEBAR_POSITION */
    )) {
      this.setRuntimeValueAndFire(
        LayoutStateKeys.SIDEBAR_POSITON,
        positionFromString(
          this.configurationService.getValue(
            "workbench.sideBar.location" /* SIDEBAR_POSITION */
          ) ?? "left"
        )
      );
    }
  }
  updateLegacySettingsFromState(key, value) {
    const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
    if (key.zenModeIgnore && isZenMode) {
      return;
    }
    if (key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
      this.configurationService.updateValue(
        LayoutSettings.ACTIVITY_BAR_LOCATION,
        value ? ActivityBarPosition.HIDDEN : void 0
      );
    } else if (key === LayoutStateKeys.STATUSBAR_HIDDEN) {
      this.configurationService.updateValue(
        "workbench.statusBar.visible" /* STATUSBAR_VISIBLE */,
        !value
      );
    } else if (key === LayoutStateKeys.SIDEBAR_POSITON) {
      this.configurationService.updateValue(
        "workbench.sideBar.location" /* SIDEBAR_POSITION */,
        positionToString(value)
      );
    }
  }
  load() {
    let key;
    for (key in LayoutStateKeys) {
      const stateKey = LayoutStateKeys[key];
      const value = this.loadKeyFromStorage(stateKey);
      if (value !== void 0) {
        this.stateCache.set(stateKey.name, value);
      }
    }
    this.stateCache.set(
      LayoutStateKeys.ACTIVITYBAR_HIDDEN.name,
      this.isActivityBarHidden()
    );
    this.stateCache.set(
      LayoutStateKeys.STATUSBAR_HIDDEN.name,
      !this.configurationService.getValue(
        "workbench.statusBar.visible" /* STATUSBAR_VISIBLE */
      )
    );
    this.stateCache.set(
      LayoutStateKeys.SIDEBAR_POSITON.name,
      positionFromString(
        this.configurationService.getValue(
          "workbench.sideBar.location" /* SIDEBAR_POSITION */
        ) ?? "left"
      )
    );
    const workbenchDimensions = getClientArea(this.container);
    LayoutStateKeys.PANEL_POSITION.defaultValue = positionFromString(
      this.configurationService.getValue(
        "workbench.panel.defaultLocation" /* PANEL_POSITION */
      ) ?? "bottom"
    );
    LayoutStateKeys.GRID_SIZE.defaultValue = {
      height: workbenchDimensions.height,
      width: workbenchDimensions.width
    };
    LayoutStateKeys.SIDEBAR_SIZE.defaultValue = Math.min(
      300,
      workbenchDimensions.width / 4
    );
    LayoutStateKeys.AUXILIARYBAR_SIZE.defaultValue = Math.min(
      300,
      workbenchDimensions.width / 4
    );
    LayoutStateKeys.PANEL_SIZE.defaultValue = this.stateCache.get(LayoutStateKeys.PANEL_POSITION.name) ?? isHorizontal(LayoutStateKeys.PANEL_POSITION.defaultValue) ? workbenchDimensions.height / 3 : workbenchDimensions.width / 4;
    LayoutStateKeys.SIDEBAR_HIDDEN.defaultValue = this.contextService.getWorkbenchState() === WorkbenchState.EMPTY;
    for (key in LayoutStateKeys) {
      const stateKey = LayoutStateKeys[key];
      if (this.stateCache.get(stateKey.name) === void 0) {
        this.stateCache.set(stateKey.name, stateKey.defaultValue);
      }
    }
    this._register(
      this.storageService.onDidChangeValue(
        StorageScope.PROFILE,
        void 0,
        this._register(new DisposableStore())
      )((storageChangeEvent) => {
        let key2;
        for (key2 in LayoutStateKeys) {
          const stateKey = LayoutStateKeys[key2];
          if (stateKey instanceof RuntimeStateKey && stateKey.scope === StorageScope.PROFILE && stateKey.target === StorageTarget.USER) {
            if (`${LayoutStateModel.STORAGE_PREFIX}${stateKey.name}` === storageChangeEvent.key) {
              const value = this.loadKeyFromStorage(stateKey) ?? stateKey.defaultValue;
              if (this.stateCache.get(stateKey.name) !== value) {
                this.stateCache.set(stateKey.name, value);
                this._onDidChangeState.fire({
                  key: stateKey,
                  value
                });
              }
            }
          }
        }
      })
    );
  }
  save(workspace, global) {
    let key;
    const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
    for (key in LayoutStateKeys) {
      const stateKey = LayoutStateKeys[key];
      if (workspace && stateKey.scope === StorageScope.WORKSPACE || global && stateKey.scope === StorageScope.PROFILE) {
        if (isZenMode && stateKey instanceof RuntimeStateKey && stateKey.zenModeIgnore) {
          continue;
        }
        this.saveKeyToStorage(stateKey);
      }
    }
  }
  getInitializationValue(key) {
    return this.stateCache.get(key.name);
  }
  setInitializationValue(key, value) {
    this.stateCache.set(key.name, value);
  }
  getRuntimeValue(key, fallbackToSetting) {
    if (fallbackToSetting) {
      switch (key) {
        case LayoutStateKeys.ACTIVITYBAR_HIDDEN:
          this.stateCache.set(key.name, this.isActivityBarHidden());
          break;
        case LayoutStateKeys.STATUSBAR_HIDDEN:
          this.stateCache.set(
            key.name,
            !this.configurationService.getValue(
              "workbench.statusBar.visible" /* STATUSBAR_VISIBLE */
            )
          );
          break;
        case LayoutStateKeys.SIDEBAR_POSITON:
          this.stateCache.set(
            key.name,
            this.configurationService.getValue(
              "workbench.sideBar.location" /* SIDEBAR_POSITION */
            ) ?? "left"
          );
          break;
      }
    }
    return this.stateCache.get(key.name);
  }
  setRuntimeValue(key, value) {
    this.stateCache.set(key.name, value);
    const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
    if (key.scope === StorageScope.PROFILE) {
      if (!isZenMode || !key.zenModeIgnore) {
        this.saveKeyToStorage(key);
        this.updateLegacySettingsFromState(key, value);
      }
    }
  }
  isActivityBarHidden() {
    const oldValue = this.configurationService.getValue("workbench.activityBar.visible");
    if (oldValue !== void 0) {
      return !oldValue;
    }
    return this.configurationService.getValue(
      LayoutSettings.ACTIVITY_BAR_LOCATION
    ) !== ActivityBarPosition.DEFAULT;
  }
  setRuntimeValueAndFire(key, value) {
    const previousValue = this.stateCache.get(key.name);
    if (previousValue === value) {
      return;
    }
    this.setRuntimeValue(key, value);
    this._onDidChangeState.fire({ key, value });
  }
  saveKeyToStorage(key) {
    const value = this.stateCache.get(key.name);
    this.storageService.store(
      `${LayoutStateModel.STORAGE_PREFIX}${key.name}`,
      typeof value === "object" ? JSON.stringify(value) : value,
      key.scope,
      key.target
    );
  }
  loadKeyFromStorage(key) {
    let value = this.storageService.get(
      `${LayoutStateModel.STORAGE_PREFIX}${key.name}`,
      key.scope
    );
    if (value !== void 0) {
      switch (typeof key.defaultValue) {
        case "boolean":
          value = value === "true";
          break;
        case "number":
          value = Number.parseInt(value);
          break;
        case "object":
          value = JSON.parse(value);
          break;
      }
    }
    return value;
  }
}
export {
  Layout,
  TITLE_BAR_SETTINGS
};
