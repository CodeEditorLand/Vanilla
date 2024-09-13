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
import { release } from "os";
import electron, {} from "electron";
import { isESM } from "../../../base/common/amd.js";
import {
  DeferredPromise,
  RunOnceScheduler,
  timeout
} from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { FileAccess, Schemas } from "../../../base/common/network.js";
import { getMarks, mark } from "../../../base/common/performance.js";
import {
  isBigSurOrNewer,
  isMacintosh,
  isWindows
} from "../../../base/common/platform.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IBackupMainService } from "../../backup/electron-main/backup.js";
import {
  IConfigurationService
} from "../../configuration/common/configuration.js";
import { IDialogMainService } from "../../dialogs/electron-main/dialogMainService.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { isLaunchedFromCli } from "../../environment/node/argvHelper.js";
import { resolveMarketplaceHeaders } from "../../externalServices/common/marketplace.js";
import { IFileService } from "../../files/common/files.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { ILoggerMainService } from "../../log/electron-main/loggerService.js";
import { IPolicyService } from "../../policy/common/policy.js";
import { IProductService } from "../../product/common/productService.js";
import { IProtocolMainService } from "../../protocol/electron-main/protocol.js";
import { IStateService } from "../../state/node/state.js";
import {
  IApplicationStorageMainService,
  IStorageMainService
} from "../../storage/electron-main/storageMainService.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IThemeMainService } from "../../theme/electron-main/themeMainService.js";
import { IUserDataProfilesMainService } from "../../userDataProfile/electron-main/userDataProfile.js";
import {
  DEFAULT_CUSTOM_TITLEBAR_HEIGHT,
  TitlebarStyle,
  getMenuBarVisibility,
  hasNativeTitlebar,
  useNativeFullScreen,
  useWindowControlsOverlay
} from "../../window/common/window.js";
import {
  LoadReason,
  WindowError,
  WindowMode,
  defaultWindowState
} from "../../window/electron-main/window.js";
import {
  isSingleFolderWorkspaceIdentifier,
  isWorkspaceIdentifier,
  toWorkspaceIdentifier
} from "../../workspace/common/workspace.js";
import { IWorkspacesManagementMainService } from "../../workspaces/electron-main/workspacesManagementMainService.js";
import {
  IWindowsMainService,
  OpenContext,
  WindowStateValidator,
  defaultBrowserWindowOptions
} from "./windows.js";
var ReadyState = /* @__PURE__ */ ((ReadyState2) => {
  ReadyState2[ReadyState2["NONE"] = 0] = "NONE";
  ReadyState2[ReadyState2["NAVIGATING"] = 1] = "NAVIGATING";
  ReadyState2[ReadyState2["READY"] = 2] = "READY";
  return ReadyState2;
})(ReadyState || {});
class BaseWindow extends Disposable {
  constructor(configurationService, stateService, environmentMainService, logService) {
    super();
    this.configurationService = configurationService;
    this.stateService = stateService;
    this.environmentMainService = environmentMainService;
    this.logService = logService;
  }
  static {
    __name(this, "BaseWindow");
  }
  //#region Events
  _onDidClose = this._register(new Emitter());
  onDidClose = this._onDidClose.event;
  _onDidMaximize = this._register(new Emitter());
  onDidMaximize = this._onDidMaximize.event;
  _onDidUnmaximize = this._register(new Emitter());
  onDidUnmaximize = this._onDidUnmaximize.event;
  _onDidTriggerSystemContextMenu = this._register(
    new Emitter()
  );
  onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
  _onDidEnterFullScreen = this._register(
    new Emitter()
  );
  onDidEnterFullScreen = this._onDidEnterFullScreen.event;
  _onDidLeaveFullScreen = this._register(
    new Emitter()
  );
  onDidLeaveFullScreen = this._onDidLeaveFullScreen.event;
  _lastFocusTime = Date.now();
  // window is shown on creation so take current time
  get lastFocusTime() {
    return this._lastFocusTime;
  }
  _win = null;
  get win() {
    return this._win;
  }
  setWin(win, options) {
    this._win = win;
    this._register(
      Event.fromNodeEventEmitter(
        win,
        "maximize"
      )(() => this._onDidMaximize.fire())
    );
    this._register(
      Event.fromNodeEventEmitter(
        win,
        "unmaximize"
      )(() => this._onDidUnmaximize.fire())
    );
    this._register(
      Event.fromNodeEventEmitter(
        win,
        "closed"
      )(() => {
        this._onDidClose.fire();
        this.dispose();
      })
    );
    this._register(
      Event.fromNodeEventEmitter(
        win,
        "focus"
      )(() => {
        this._lastFocusTime = Date.now();
      })
    );
    this._register(
      Event.fromNodeEventEmitter(
        this._win,
        "enter-full-screen"
      )(() => this._onDidEnterFullScreen.fire())
    );
    this._register(
      Event.fromNodeEventEmitter(
        this._win,
        "leave-full-screen"
      )(() => this._onDidLeaveFullScreen.fire())
    );
    const useCustomTitleStyle = !hasNativeTitlebar(
      this.configurationService,
      options?.titleBarStyle === "hidden" ? TitlebarStyle.CUSTOM : void 0
    );
    if (isMacintosh && useCustomTitleStyle) {
      win.setSheetOffset(isBigSurOrNewer(release()) ? 28 : 22);
    }
    if (useCustomTitleStyle && (useWindowControlsOverlay(this.configurationService) || isMacintosh)) {
      const cachedWindowControlHeight = this.stateService.getItem(
        BaseWindow.windowControlHeightStateStorageKey
      );
      if (cachedWindowControlHeight) {
        this.updateWindowControls({
          height: cachedWindowControlHeight
        });
      } else {
        this.updateWindowControls({
          height: DEFAULT_CUSTOM_TITLEBAR_HEIGHT
        });
      }
    }
    if (isWindows && useCustomTitleStyle) {
      const WM_INITMENU = 278;
      win.hookWindowMessage(WM_INITMENU, () => {
        const [x, y] = win.getPosition();
        const cursorPos = electron.screen.getCursorScreenPoint();
        const cx = cursorPos.x - x;
        const cy = cursorPos.y - y;
        const shouldTriggerDefaultSystemContextMenu = /* @__PURE__ */ __name(() => {
          if (cx > 30 && cy >= 0 && cy <= Math.max(win.getBounds().height * 0.15, 35)) {
            return false;
          }
          return true;
        }, "shouldTriggerDefaultSystemContextMenu");
        if (!shouldTriggerDefaultSystemContextMenu()) {
          win.setEnabled(false);
          win.setEnabled(true);
          this._onDidTriggerSystemContextMenu.fire({ x: cx, y: cy });
        }
        return 0;
      });
    }
    if (this.environmentMainService.args["open-devtools"] === true) {
      win.webContents.openDevTools();
    }
    if (isMacintosh) {
      this._register(
        this.onDidEnterFullScreen(() => {
          this.joinNativeFullScreenTransition?.complete(true);
        })
      );
      this._register(
        this.onDidLeaveFullScreen(() => {
          this.joinNativeFullScreenTransition?.complete(true);
        })
      );
    }
  }
  applyState(state, hasMultipleDisplays = electron.screen.getAllDisplays().length > 0) {
    const windowSettings = this.configurationService.getValue("window");
    const useNativeTabs = isMacintosh && windowSettings?.nativeTabs === true;
    if ((isMacintosh || isWindows) && hasMultipleDisplays && (!useNativeTabs || electron.BrowserWindow.getAllWindows().length === 1)) {
      if ([state.width, state.height, state.x, state.y].every(
        (value) => typeof value === "number"
      )) {
        this._win?.setBounds({
          width: state.width,
          height: state.height,
          x: state.x,
          y: state.y
        });
      }
    }
    if (state.mode === WindowMode.Maximized || state.mode === WindowMode.Fullscreen) {
      this._win?.maximize();
      if (state.mode === WindowMode.Fullscreen) {
        this.setFullScreen(true, true);
      }
      this._win?.show();
    }
  }
  representedFilename;
  setRepresentedFilename(filename) {
    if (isMacintosh) {
      this.win?.setRepresentedFilename(filename);
    } else {
      this.representedFilename = filename;
    }
  }
  getRepresentedFilename() {
    if (isMacintosh) {
      return this.win?.getRepresentedFilename();
    }
    return this.representedFilename;
  }
  documentEdited;
  setDocumentEdited(edited) {
    if (isMacintosh) {
      this.win?.setDocumentEdited(edited);
    }
    this.documentEdited = edited;
  }
  isDocumentEdited() {
    if (isMacintosh) {
      return Boolean(this.win?.isDocumentEdited());
    }
    return !!this.documentEdited;
  }
  focus(options) {
    if (isMacintosh && options?.force) {
      electron.app.focus({ steal: true });
    }
    const win = this.win;
    if (!win) {
      return;
    }
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  }
  handleTitleDoubleClick() {
    const win = this.win;
    if (!win) {
      return;
    }
    if (isMacintosh) {
      const action = electron.systemPreferences.getUserDefault(
        "AppleActionOnDoubleClick",
        "string"
      );
      switch (action) {
        case "Minimize":
          win.minimize();
          break;
        case "None":
          break;
        case "Maximize":
        default:
          if (win.isMaximized()) {
            win.unmaximize();
          } else {
            win.maximize();
          }
      }
    } else if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
  //#region Window Control Overlays
  static windowControlHeightStateStorageKey = "windowControlHeight";
  hasWindowControlOverlay = useWindowControlsOverlay(
    this.configurationService
  );
  updateWindowControls(options) {
    const win = this.win;
    if (!win) {
      return;
    }
    if (options.height) {
      this.stateService.setItem(
        CodeWindow.windowControlHeightStateStorageKey,
        options.height
      );
    }
    if (this.hasWindowControlOverlay) {
      win.setTitleBarOverlay({
        color: options.backgroundColor?.trim() === "" ? void 0 : options.backgroundColor,
        symbolColor: options.foregroundColor?.trim() === "" ? void 0 : options.foregroundColor,
        height: options.height ? options.height - 1 : void 0
        // account for window border
      });
    } else if (isMacintosh && options.height !== void 0) {
      const verticalOffset = (options.height - 15) / 2;
      if (verticalOffset) {
        win.setWindowButtonPosition({
          x: verticalOffset,
          y: verticalOffset
        });
      } else {
        win.setWindowButtonPosition(null);
      }
    }
  }
  //#endregion
  //#region Fullscreen
  transientIsNativeFullScreen = void 0;
  joinNativeFullScreenTransition = void 0;
  toggleFullScreen() {
    this.setFullScreen(!this.isFullScreen, false);
  }
  setFullScreen(fullscreen, fromRestore) {
    if (useNativeFullScreen(this.configurationService)) {
      this.setNativeFullScreen(fullscreen, fromRestore);
    } else {
      this.setSimpleFullScreen(fullscreen);
    }
  }
  get isFullScreen() {
    if (isMacintosh && typeof this.transientIsNativeFullScreen === "boolean") {
      return this.transientIsNativeFullScreen;
    }
    const win = this.win;
    const isFullScreen = win?.isFullScreen();
    const isSimpleFullScreen = win?.isSimpleFullScreen();
    return Boolean(isFullScreen || isSimpleFullScreen);
  }
  setNativeFullScreen(fullscreen, fromRestore) {
    const win = this.win;
    if (win?.isSimpleFullScreen()) {
      win?.setSimpleFullScreen(false);
    }
    this.doSetNativeFullScreen(fullscreen, fromRestore);
  }
  doSetNativeFullScreen(fullscreen, fromRestore) {
    if (isMacintosh) {
      this.transientIsNativeFullScreen = fullscreen;
      const joinNativeFullScreenTransition = this.joinNativeFullScreenTransition = new DeferredPromise();
      (async () => {
        const transitioned = await Promise.race([
          joinNativeFullScreenTransition.p,
          timeout(1e4).then(() => false)
        ]);
        if (this.joinNativeFullScreenTransition !== joinNativeFullScreenTransition) {
          return;
        }
        this.transientIsNativeFullScreen = void 0;
        this.joinNativeFullScreenTransition = void 0;
        if (!transitioned && fullscreen && fromRestore && this.win && !this.win.isFullScreen()) {
          this.logService.warn(
            "window: native macOS fullscreen transition did not happen within 10s from restoring"
          );
          this._onDidLeaveFullScreen.fire();
        }
      })();
    }
    const win = this.win;
    win?.setFullScreen(fullscreen);
  }
  setSimpleFullScreen(fullscreen) {
    const win = this.win;
    if (win?.isFullScreen()) {
      this.doSetNativeFullScreen(false, false);
    }
    win?.setSimpleFullScreen(fullscreen);
    win?.webContents.focus();
  }
  dispose() {
    super.dispose();
    this._win = null;
  }
}
let CodeWindow = class extends BaseWindow {
  constructor(config, logService, loggerMainService, environmentMainService, policyService, userDataProfilesService, fileService, applicationStorageMainService, storageMainService, configurationService, themeMainService, workspacesManagementMainService, backupMainService, telemetryService, dialogMainService, lifecycleMainService, productService, protocolMainService, windowsMainService, stateService, instantiationService) {
    super(configurationService, stateService, environmentMainService, logService);
    this.loggerMainService = loggerMainService;
    this.policyService = policyService;
    this.userDataProfilesService = userDataProfilesService;
    this.fileService = fileService;
    this.applicationStorageMainService = applicationStorageMainService;
    this.storageMainService = storageMainService;
    this.themeMainService = themeMainService;
    this.workspacesManagementMainService = workspacesManagementMainService;
    this.backupMainService = backupMainService;
    this.telemetryService = telemetryService;
    this.dialogMainService = dialogMainService;
    this.lifecycleMainService = lifecycleMainService;
    this.productService = productService;
    this.protocolMainService = protocolMainService;
    this.windowsMainService = windowsMainService;
    {
      const [state, hasMultipleDisplays] = this.restoreWindowState(config.state);
      this.windowState = state;
      this.logService.trace("window#ctor: using window state", state);
      const options = instantiationService.invokeFunction(defaultBrowserWindowOptions, this.windowState, void 0, {
        preload: FileAccess.asFileUri("vs/base/parts/sandbox/electron-sandbox/preload.js").fsPath,
        additionalArguments: [`--vscode-window-config=${this.configObjectUrl.resource.toString()}`],
        v8CacheOptions: this.environmentMainService.useCodeCache ? "bypassHeatCheck" : "none"
      });
      mark("code/willCreateCodeBrowserWindow");
      this._win = new electron.BrowserWindow(options);
      mark("code/didCreateCodeBrowserWindow");
      this._id = this._win.id;
      this.setWin(this._win, options);
      this.applyState(this.windowState, hasMultipleDisplays);
      this._lastFocusTime = Date.now();
    }
    this.onConfigurationUpdated();
    this.createTouchBar();
    this.registerListeners();
  }
  static {
    __name(this, "CodeWindow");
  }
  //#region Events
  _onWillLoad = this._register(new Emitter());
  onWillLoad = this._onWillLoad.event;
  _onDidSignalReady = this._register(new Emitter());
  onDidSignalReady = this._onDidSignalReady.event;
  _onDidDestroy = this._register(new Emitter());
  onDidDestroy = this._onDidDestroy.event;
  //#endregion
  //#region Properties
  _id;
  get id() {
    return this._id;
  }
  _win;
  get backupPath() {
    return this._config?.backupPath;
  }
  get openedWorkspace() {
    return this._config?.workspace;
  }
  get profile() {
    if (!this.config) {
      return void 0;
    }
    const profile = this.userDataProfilesService.profiles.find(
      (profile2) => profile2.id === this.config?.profiles.profile.id
    );
    if (this.isExtensionDevelopmentHost && profile) {
      return profile;
    }
    return this.userDataProfilesService.getProfileForWorkspace(
      this.config.workspace ?? toWorkspaceIdentifier(
        this.backupPath,
        this.isExtensionDevelopmentHost
      )
    ) ?? this.userDataProfilesService.defaultProfile;
  }
  get remoteAuthority() {
    return this._config?.remoteAuthority;
  }
  _config;
  get config() {
    return this._config;
  }
  get isExtensionDevelopmentHost() {
    return !!this._config?.extensionDevelopmentPath;
  }
  get isExtensionTestHost() {
    return !!this._config?.extensionTestsPath;
  }
  get isExtensionDevelopmentTestFromCli() {
    return this.isExtensionDevelopmentHost && this.isExtensionTestHost && !this._config?.debugId;
  }
  //#endregion
  windowState;
  currentMenuBarVisibility;
  whenReadyCallbacks = [];
  touchBarGroups = [];
  currentHttpProxy = void 0;
  currentNoProxy = void 0;
  customZoomLevel = void 0;
  configObjectUrl = this._register(
    this.protocolMainService.createIPCObjectUrl()
  );
  pendingLoadConfig;
  wasLoaded = false;
  readyState = 0 /* NONE */;
  setReady() {
    this.logService.trace(
      `window#load: window reported ready (id: ${this._id})`
    );
    this.readyState = 2 /* READY */;
    while (this.whenReadyCallbacks.length) {
      this.whenReadyCallbacks.pop()(this);
    }
    this._onDidSignalReady.fire();
  }
  ready() {
    return new Promise((resolve) => {
      if (this.isReady) {
        return resolve(this);
      }
      this.whenReadyCallbacks.push(resolve);
    });
  }
  get isReady() {
    return this.readyState === 2 /* READY */;
  }
  get whenClosedOrLoaded() {
    return new Promise((resolve) => {
      function handle() {
        closeListener.dispose();
        loadListener.dispose();
        resolve();
      }
      __name(handle, "handle");
      const closeListener = this.onDidClose(() => handle());
      const loadListener = this.onWillLoad(() => handle());
    });
  }
  registerListeners() {
    this._register(
      Event.fromNodeEventEmitter(
        this._win,
        "unresponsive"
      )(() => this.onWindowError(WindowError.UNRESPONSIVE))
    );
    this._register(
      Event.fromNodeEventEmitter(
        this._win.webContents,
        "render-process-gone",
        (event, details) => details
      )(
        (details) => this.onWindowError(WindowError.PROCESS_GONE, { ...details })
      )
    );
    this._register(
      Event.fromNodeEventEmitter(
        this._win.webContents,
        "did-fail-load",
        (event, exitCode, reason) => ({ exitCode, reason })
      )(
        ({ exitCode, reason }) => this.onWindowError(WindowError.LOAD, { reason, exitCode })
      )
    );
    this._register(
      Event.fromNodeEventEmitter(
        this._win.webContents,
        "will-prevent-unload"
      )((event) => event.preventDefault())
    );
    this._register(
      Event.fromNodeEventEmitter(
        this._win.webContents,
        "did-finish-load"
      )(() => {
        if (this.pendingLoadConfig) {
          this._config = this.pendingLoadConfig;
          this.pendingLoadConfig = void 0;
        }
      })
    );
    this._register(
      this.onDidMaximize(() => {
        if (this._config) {
          this._config.maximized = true;
        }
      })
    );
    this._register(
      this.onDidUnmaximize(() => {
        if (this._config) {
          this._config.maximized = false;
        }
      })
    );
    this._register(
      this.onDidEnterFullScreen(() => {
        this.sendWhenReady(
          "vscode:enterFullScreen",
          CancellationToken.None
        );
      })
    );
    this._register(
      this.onDidLeaveFullScreen(() => {
        this.sendWhenReady(
          "vscode:leaveFullScreen",
          CancellationToken.None
        );
      })
    );
    this._register(
      this.configurationService.onDidChangeConfiguration(
        (e) => this.onConfigurationUpdated(e)
      )
    );
    this._register(
      this.workspacesManagementMainService.onDidDeleteUntitledWorkspace(
        (e) => this.onDidDeleteUntitledWorkspace(e)
      )
    );
    const urls = [
      "https://marketplace.visualstudio.com/*",
      "https://*.vsassets.io/*"
    ];
    this._win.webContents.session.webRequest.onBeforeSendHeaders(
      { urls },
      async (details, cb) => {
        const headers = await this.getMarketplaceHeaders();
        cb({
          cancel: false,
          requestHeaders: Object.assign(
            details.requestHeaders,
            headers
          )
        });
      }
    );
  }
  marketplaceHeadersPromise;
  getMarketplaceHeaders() {
    if (!this.marketplaceHeadersPromise) {
      this.marketplaceHeadersPromise = resolveMarketplaceHeaders(
        this.productService.version,
        this.productService,
        this.environmentMainService,
        this.configurationService,
        this.fileService,
        this.applicationStorageMainService,
        this.telemetryService
      );
    }
    return this.marketplaceHeadersPromise;
  }
  async onWindowError(type, details) {
    switch (type) {
      case WindowError.PROCESS_GONE:
        this.logService.error(
          `CodeWindow: renderer process gone (reason: ${details?.reason || "<unknown>"}, code: ${details?.exitCode || "<unknown>"})`
        );
        break;
      case WindowError.UNRESPONSIVE:
        this.logService.error("CodeWindow: detected unresponsive");
        break;
      case WindowError.LOAD:
        this.logService.error(
          `CodeWindow: failed to load (reason: ${details?.reason || "<unknown>"}, code: ${details?.exitCode || "<unknown>"})`
        );
        break;
    }
    this.telemetryService.publicLog2("windowerror", {
      type,
      reason: details?.reason,
      code: details?.exitCode
    });
    switch (type) {
      case WindowError.UNRESPONSIVE:
      case WindowError.PROCESS_GONE:
        if (this.isExtensionDevelopmentTestFromCli) {
          this.lifecycleMainService.kill(1);
          return;
        }
        if (this.environmentMainService.args["enable-smoke-test-driver"]) {
          await this.destroyWindow(false, false);
          this.lifecycleMainService.quit();
          return;
        }
        if (type === WindowError.UNRESPONSIVE) {
          if (this.isExtensionDevelopmentHost || this.isExtensionTestHost || this._win && this._win.webContents && this._win.webContents.isDevToolsOpened()) {
            return;
          }
          const { response, checkboxChecked } = await this.dialogMainService.showMessageBox(
            {
              type: "warning",
              buttons: [
                localize(
                  {
                    key: "reopen",
                    comment: ["&& denotes a mnemonic"]
                  },
                  "&&Reopen"
                ),
                localize(
                  {
                    key: "close",
                    comment: ["&& denotes a mnemonic"]
                  },
                  "&&Close"
                ),
                localize(
                  {
                    key: "wait",
                    comment: ["&& denotes a mnemonic"]
                  },
                  "&&Keep Waiting"
                )
              ],
              message: localize(
                "appStalled",
                "The window is not responding"
              ),
              detail: localize(
                "appStalledDetail",
                "You can reopen or close the window or keep waiting."
              ),
              checkboxLabel: this._config?.workspace ? localize(
                "doNotRestoreEditors",
                "Don't restore editors"
              ) : void 0
            },
            this._win
          );
          if (response !== 2) {
            const reopen = response === 0;
            await this.destroyWindow(reopen, checkboxChecked);
          }
        } else if (type === WindowError.PROCESS_GONE) {
          let message;
          if (details) {
            message = localize(
              "appGoneDetails",
              "The window terminated unexpectedly (reason: '{0}', code: '{1}')",
              details.reason,
              details.exitCode ?? "<unknown>"
            );
          } else {
            message = localize(
              "appGone",
              "The window terminated unexpectedly"
            );
          }
          const { response, checkboxChecked } = await this.dialogMainService.showMessageBox(
            {
              type: "warning",
              buttons: [
                this._config?.workspace ? localize(
                  {
                    key: "reopen",
                    comment: [
                      "&& denotes a mnemonic"
                    ]
                  },
                  "&&Reopen"
                ) : localize(
                  {
                    key: "newWindow",
                    comment: [
                      "&& denotes a mnemonic"
                    ]
                  },
                  "&&New Window"
                ),
                localize(
                  {
                    key: "close",
                    comment: ["&& denotes a mnemonic"]
                  },
                  "&&Close"
                )
              ],
              message,
              detail: this._config?.workspace ? localize(
                "appGoneDetailWorkspace",
                "We are sorry for the inconvenience. You can reopen the window to continue where you left off."
              ) : localize(
                "appGoneDetailEmptyWindow",
                "We are sorry for the inconvenience. You can open a new empty window to start again."
              ),
              checkboxLabel: this._config?.workspace ? localize(
                "doNotRestoreEditors",
                "Don't restore editors"
              ) : void 0
            },
            this._win
          );
          const reopen = response === 0;
          await this.destroyWindow(reopen, checkboxChecked);
        }
        break;
    }
  }
  async destroyWindow(reopen, skipRestoreEditors) {
    const workspace = this._config?.workspace;
    if (skipRestoreEditors && workspace) {
      try {
        const workspaceStorage = this.storageMainService.workspaceStorage(workspace);
        await workspaceStorage.init();
        workspaceStorage.delete("memento/workbench.parts.editor");
        await workspaceStorage.close();
      } catch (error) {
        this.logService.error(error);
      }
    }
    this._onDidDestroy.fire();
    try {
      if (reopen && this._config) {
        let uriToOpen;
        let forceEmpty;
        if (isSingleFolderWorkspaceIdentifier(workspace)) {
          uriToOpen = { folderUri: workspace.uri };
        } else if (isWorkspaceIdentifier(workspace)) {
          uriToOpen = { workspaceUri: workspace.configPath };
        } else {
          forceEmpty = true;
        }
        const window = (await this.windowsMainService.open({
          context: OpenContext.API,
          userEnv: this._config.userEnv,
          cli: {
            ...this.environmentMainService.args,
            _: []
            // we pass in the workspace to open explicitly via `urisToOpen`
          },
          urisToOpen: uriToOpen ? [uriToOpen] : void 0,
          forceEmpty,
          forceNewWindow: true,
          remoteAuthority: this.remoteAuthority
        })).at(0);
        window?.focus();
      }
    } finally {
      this._win?.destroy();
    }
  }
  onDidDeleteUntitledWorkspace(workspace) {
    if (this._config?.workspace?.id === workspace.id) {
      this._config.workspace = void 0;
    }
  }
  onConfigurationUpdated(e) {
    if (!e || e.affectsConfiguration("window.menuBarVisibility")) {
      const newMenuBarVisibility = this.getMenuBarVisibility();
      if (newMenuBarVisibility !== this.currentMenuBarVisibility) {
        this.currentMenuBarVisibility = newMenuBarVisibility;
        this.setMenuBarVisibility(newMenuBarVisibility);
      }
    }
    if (!e || e.affectsConfiguration("http.proxy") || e.affectsConfiguration("http.noProxy")) {
      let newHttpProxy = (this.configurationService.getValue("http.proxy") || "").trim() || (process.env["https_proxy"] || process.env["HTTPS_PROXY"] || process.env["http_proxy"] || process.env["HTTP_PROXY"] || "").trim() || // Not standardized.
      void 0;
      if (newHttpProxy?.indexOf("@") !== -1) {
        const uri = URI.parse(newHttpProxy);
        const i = uri.authority.indexOf("@");
        if (i !== -1) {
          newHttpProxy = uri.with({ authority: uri.authority.substring(i + 1) }).toString();
        }
      }
      if (newHttpProxy?.endsWith("/")) {
        newHttpProxy = newHttpProxy.substr(0, newHttpProxy.length - 1);
      }
      const newNoProxy = (this.configurationService.getValue(
        "http.noProxy"
      ) || []).map((item) => item.trim()).join(",") || (process.env["no_proxy"] || process.env["NO_PROXY"] || "").trim() || void 0;
      if ((newHttpProxy || "").indexOf("@") === -1 && (newHttpProxy !== this.currentHttpProxy || newNoProxy !== this.currentNoProxy)) {
        this.currentHttpProxy = newHttpProxy;
        this.currentNoProxy = newNoProxy;
        const proxyRules = newHttpProxy || "";
        const proxyBypassRules = newNoProxy ? `${newNoProxy},<local>` : "<local>";
        this.logService.trace(
          `Setting proxy to '${proxyRules}', bypassing '${proxyBypassRules}'`
        );
        this._win.webContents.session.setProxy({
          proxyRules,
          proxyBypassRules,
          pacScript: ""
        });
        electron.app.setProxy({
          proxyRules,
          proxyBypassRules,
          pacScript: ""
        });
      }
    }
  }
  addTabbedWindow(window) {
    if (isMacintosh && window.win) {
      this._win.addTabbedWindow(window.win);
    }
  }
  load(configuration, options = /* @__PURE__ */ Object.create(null)) {
    this.logService.trace(
      `window#load: attempt to load window (id: ${this._id})`
    );
    if (this.isDocumentEdited()) {
      if (!options.isReload || !this.backupMainService.isHotExitEnabled()) {
        this.setDocumentEdited(false);
      }
    }
    if (!options.isReload) {
      if (this.getRepresentedFilename()) {
        this.setRepresentedFilename("");
      }
      this._win.setTitle(this.productService.nameLong);
    }
    this.updateConfiguration(configuration, options);
    if (this.readyState === 0 /* NONE */) {
      this._config = configuration;
    } else {
      this.pendingLoadConfig = configuration;
    }
    this.readyState = 1 /* NAVIGATING */;
    this._win.loadURL(
      FileAccess.asBrowserUri(
        `vs/code/electron-sandbox/workbench/workbench${this.environmentMainService.isBuilt ? "" : "-dev"}.${isESM ? "esm." : ""}html`
      ).toString(true)
    );
    const wasLoaded = this.wasLoaded;
    this.wasLoaded = true;
    if (!this.environmentMainService.isBuilt && !this.environmentMainService.extensionTestsLocationURI) {
      this._register(
        new RunOnceScheduler(() => {
          if (this._win && !this._win.isVisible() && !this._win.isMinimized()) {
            this._win.show();
            this.focus({ force: true });
            this._win.webContents.openDevTools();
          }
        }, 1e4)
      ).schedule();
    }
    this._onWillLoad.fire({
      workspace: configuration.workspace,
      reason: options.isReload ? LoadReason.RELOAD : wasLoaded ? LoadReason.LOAD : LoadReason.INITIAL
    });
  }
  updateConfiguration(configuration, options) {
    const currentUserEnv = (this._config ?? this.pendingLoadConfig)?.userEnv;
    if (currentUserEnv) {
      const shouldPreserveLaunchCliEnvironment = isLaunchedFromCli(currentUserEnv) && !isLaunchedFromCli(configuration.userEnv);
      const shouldPreserveDebugEnvironmnet = this.isExtensionDevelopmentHost;
      if (shouldPreserveLaunchCliEnvironment || shouldPreserveDebugEnvironmnet) {
        configuration.userEnv = {
          ...currentUserEnv,
          ...configuration.userEnv
        };
      }
    }
    if (process.env["CHROME_CRASHPAD_PIPE_NAME"]) {
      Object.assign(configuration.userEnv, {
        CHROME_CRASHPAD_PIPE_NAME: process.env["CHROME_CRASHPAD_PIPE_NAME"]
      });
    }
    if (options.disableExtensions !== void 0) {
      configuration["disable-extensions"] = options.disableExtensions;
    }
    configuration.fullscreen = this.isFullScreen;
    configuration.maximized = this._win.isMaximized();
    configuration.partsSplash = this.themeMainService.getWindowSplash();
    configuration.zoomLevel = this.getZoomLevel();
    configuration.isCustomZoomLevel = typeof this.customZoomLevel === "number";
    if (configuration.isCustomZoomLevel && configuration.partsSplash) {
      configuration.partsSplash.zoomLevel = configuration.zoomLevel;
    }
    mark("code/willOpenNewWindow");
    configuration.perfMarks = getMarks();
    this.configObjectUrl.update(configuration);
  }
  async reload(cli) {
    const configuration = Object.assign({}, this._config);
    configuration.workspace = await this.validateWorkspaceBeforeReload(configuration);
    delete configuration.filesToOpenOrCreate;
    delete configuration.filesToDiff;
    delete configuration.filesToMerge;
    delete configuration.filesToWait;
    if (this.isExtensionDevelopmentHost && cli) {
      configuration.verbose = cli.verbose;
      configuration.debugId = cli.debugId;
      configuration.extensionEnvironment = cli.extensionEnvironment;
      configuration["inspect-extensions"] = cli["inspect-extensions"];
      configuration["inspect-brk-extensions"] = cli["inspect-brk-extensions"];
      configuration["extensions-dir"] = cli["extensions-dir"];
    }
    configuration.accessibilitySupport = electron.app.isAccessibilitySupportEnabled();
    configuration.isInitialStartup = false;
    configuration.policiesData = this.policyService.serialize();
    configuration.continueOn = this.environmentMainService.continueOn;
    configuration.profiles = {
      all: this.userDataProfilesService.profiles,
      profile: this.profile || this.userDataProfilesService.defaultProfile,
      home: this.userDataProfilesService.profilesHome
    };
    configuration.logLevel = this.loggerMainService.getLogLevel();
    configuration.loggers = {
      window: this.loggerMainService.getRegisteredLoggers(this.id),
      global: this.loggerMainService.getRegisteredLoggers()
    };
    this.load(configuration, {
      isReload: true,
      disableExtensions: cli?.["disable-extensions"]
    });
  }
  async validateWorkspaceBeforeReload(configuration) {
    if (isWorkspaceIdentifier(configuration.workspace)) {
      const configPath = configuration.workspace.configPath;
      if (configPath.scheme === Schemas.file) {
        const workspaceExists = await this.fileService.exists(configPath);
        if (!workspaceExists) {
          return void 0;
        }
      }
    } else if (isSingleFolderWorkspaceIdentifier(configuration.workspace)) {
      const uri = configuration.workspace.uri;
      if (uri.scheme === Schemas.file) {
        const folderExists = await this.fileService.exists(uri);
        if (!folderExists) {
          return void 0;
        }
      }
    }
    return configuration.workspace;
  }
  serializeWindowState() {
    if (!this._win) {
      return defaultWindowState();
    }
    if (this.isFullScreen) {
      let display;
      try {
        display = electron.screen.getDisplayMatching(this.getBounds());
      } catch (error) {
      }
      const defaultState = defaultWindowState();
      return {
        mode: WindowMode.Fullscreen,
        display: display ? display.id : void 0,
        // Still carry over window dimensions from previous sessions
        // if we can compute it in fullscreen state.
        // does not seem possible in all cases on Linux for example
        // (https://github.com/microsoft/vscode/issues/58218) so we
        // fallback to the defaults in that case.
        width: this.windowState.width || defaultState.width,
        height: this.windowState.height || defaultState.height,
        x: this.windowState.x || 0,
        y: this.windowState.y || 0,
        zoomLevel: this.customZoomLevel
      };
    }
    const state = /* @__PURE__ */ Object.create(null);
    let mode;
    if (!isMacintosh && this._win.isMaximized()) {
      mode = WindowMode.Maximized;
    } else {
      mode = WindowMode.Normal;
    }
    if (mode === WindowMode.Maximized) {
      state.mode = WindowMode.Maximized;
    } else {
      state.mode = WindowMode.Normal;
    }
    if (mode === WindowMode.Normal || mode === WindowMode.Maximized) {
      let bounds;
      if (mode === WindowMode.Normal) {
        bounds = this.getBounds();
      } else {
        bounds = this._win.getNormalBounds();
      }
      state.x = bounds.x;
      state.y = bounds.y;
      state.width = bounds.width;
      state.height = bounds.height;
    }
    state.zoomLevel = this.customZoomLevel;
    return state;
  }
  restoreWindowState(state) {
    mark("code/willRestoreCodeWindowState");
    let hasMultipleDisplays = false;
    if (state) {
      this.customZoomLevel = state.zoomLevel;
      try {
        const displays = electron.screen.getAllDisplays();
        hasMultipleDisplays = displays.length > 1;
        state = WindowStateValidator.validateWindowState(
          this.logService,
          state,
          displays
        );
      } catch (err) {
        this.logService.warn(
          `Unexpected error validating window state: ${err}
${err.stack}`
        );
      }
    }
    mark("code/didRestoreCodeWindowState");
    return [state || defaultWindowState(), hasMultipleDisplays];
  }
  getBounds() {
    const [x, y] = this._win.getPosition();
    const [width, height] = this._win.getSize();
    return { x, y, width, height };
  }
  setFullScreen(fullscreen, fromRestore) {
    super.setFullScreen(fullscreen, fromRestore);
    this.sendWhenReady(
      fullscreen ? "vscode:enterFullScreen" : "vscode:leaveFullScreen",
      CancellationToken.None
    );
    if (this.currentMenuBarVisibility) {
      this.setMenuBarVisibility(this.currentMenuBarVisibility, false);
    }
  }
  getMenuBarVisibility() {
    let menuBarVisibility = getMenuBarVisibility(this.configurationService);
    if (["visible", "toggle", "hidden"].indexOf(menuBarVisibility) < 0) {
      menuBarVisibility = "classic";
    }
    return menuBarVisibility;
  }
  setMenuBarVisibility(visibility, notify = true) {
    if (isMacintosh) {
      return;
    }
    if (visibility === "toggle") {
      if (notify) {
        this.send(
          "vscode:showInfoMessage",
          localize(
            "hiddenMenuBar",
            "You can still access the menu bar by pressing the Alt-key."
          )
        );
      }
    }
    if (visibility === "hidden") {
      setTimeout(() => {
        this.doSetMenuBarVisibility(visibility);
      });
    } else {
      this.doSetMenuBarVisibility(visibility);
    }
  }
  doSetMenuBarVisibility(visibility) {
    const isFullscreen = this.isFullScreen;
    switch (visibility) {
      case "classic":
        this._win.setMenuBarVisibility(!isFullscreen);
        this._win.autoHideMenuBar = isFullscreen;
        break;
      case "visible":
        this._win.setMenuBarVisibility(true);
        this._win.autoHideMenuBar = false;
        break;
      case "toggle":
        this._win.setMenuBarVisibility(false);
        this._win.autoHideMenuBar = true;
        break;
      case "hidden":
        this._win.setMenuBarVisibility(false);
        this._win.autoHideMenuBar = false;
        break;
    }
  }
  notifyZoomLevel(zoomLevel) {
    this.customZoomLevel = zoomLevel;
  }
  getZoomLevel() {
    if (typeof this.customZoomLevel === "number") {
      return this.customZoomLevel;
    }
    const windowSettings = this.configurationService.getValue("window");
    return windowSettings?.zoomLevel;
  }
  close() {
    this._win?.close();
  }
  sendWhenReady(channel, token, ...args) {
    if (this.isReady) {
      this.send(channel, ...args);
    } else {
      this.ready().then(() => {
        if (!token.isCancellationRequested) {
          this.send(channel, ...args);
        }
      });
    }
  }
  send(channel, ...args) {
    if (this._win) {
      if (this._win.isDestroyed() || this._win.webContents.isDestroyed()) {
        this.logService.warn(
          `Sending IPC message to channel '${channel}' for window that is destroyed`
        );
        return;
      }
      try {
        this._win.webContents.send(channel, ...args);
      } catch (error) {
        this.logService.warn(
          `Error sending IPC message to channel '${channel}' of window ${this._id}: ${toErrorMessage(error)}`
        );
      }
    }
  }
  updateTouchBar(groups) {
    if (!isMacintosh) {
      return;
    }
    this.touchBarGroups.forEach((touchBarGroup, index) => {
      const commands = groups[index];
      touchBarGroup.segments = this.createTouchBarGroupSegments(commands);
    });
  }
  createTouchBar() {
    if (!isMacintosh) {
      return;
    }
    for (let i = 0; i < 10; i++) {
      const groupTouchBar = this.createTouchBarGroup();
      this.touchBarGroups.push(groupTouchBar);
    }
    this._win.setTouchBar(
      new electron.TouchBar({ items: this.touchBarGroups })
    );
  }
  createTouchBarGroup(items = []) {
    const segments = this.createTouchBarGroupSegments(items);
    const control = new electron.TouchBar.TouchBarSegmentedControl({
      segments,
      mode: "buttons",
      segmentStyle: "automatic",
      change: /* @__PURE__ */ __name((selectedIndex) => {
        this.sendWhenReady("vscode:runAction", CancellationToken.None, {
          id: control.segments[selectedIndex].id,
          from: "touchbar"
        });
      }, "change")
    });
    return control;
  }
  createTouchBarGroupSegments(items = []) {
    const segments = items.map((item) => {
      let icon;
      if (item.icon && !ThemeIcon.isThemeIcon(item.icon) && item.icon?.dark?.scheme === Schemas.file) {
        icon = electron.nativeImage.createFromPath(
          URI.revive(item.icon.dark).fsPath
        );
        if (icon.isEmpty()) {
          icon = void 0;
        }
      }
      let title;
      if (typeof item.title === "string") {
        title = item.title;
      } else {
        title = item.title.value;
      }
      return {
        id: item.id,
        label: icon ? void 0 : title,
        icon
      };
    });
    return segments;
  }
  matches(webContents) {
    return this._win?.webContents.id === webContents.id;
  }
  dispose() {
    super.dispose();
    this.loggerMainService.deregisterLoggers(this.id);
  }
};
CodeWindow = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, ILoggerMainService),
  __decorateParam(3, IEnvironmentMainService),
  __decorateParam(4, IPolicyService),
  __decorateParam(5, IUserDataProfilesMainService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IApplicationStorageMainService),
  __decorateParam(8, IStorageMainService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IThemeMainService),
  __decorateParam(11, IWorkspacesManagementMainService),
  __decorateParam(12, IBackupMainService),
  __decorateParam(13, ITelemetryService),
  __decorateParam(14, IDialogMainService),
  __decorateParam(15, ILifecycleMainService),
  __decorateParam(16, IProductService),
  __decorateParam(17, IProtocolMainService),
  __decorateParam(18, IWindowsMainService),
  __decorateParam(19, IStateService),
  __decorateParam(20, IInstantiationService)
], CodeWindow);
export {
  BaseWindow,
  CodeWindow
};
//# sourceMappingURL=windowImpl.js.map
