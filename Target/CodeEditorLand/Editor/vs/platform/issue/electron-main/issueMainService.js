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
import { arch, release, type } from "os";
import {
  BrowserWindow,
  screen
} from "electron";
import { isESM } from "../../../base/common/amd.js";
import { raceTimeout } from "../../../base/common/async.js";
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { FileAccess } from "../../../base/common/network.js";
import {
  isMacintosh
} from "../../../base/common/platform.js";
import { validatedIpcMain } from "../../../base/parts/ipc/electron-main/ipcMain.js";
import { getNLSLanguage, getNLSMessages, localize } from "../../../nls.js";
import { ICSSDevelopmentService } from "../../cssDev/node/cssDevService.js";
import { IDialogMainService } from "../../dialogs/electron-main/dialogMainService.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILogService } from "../../log/common/log.js";
import { INativeHostMainService } from "../../native/electron-main/nativeHostMainService.js";
import product from "../../product/common/product.js";
import {
  IProtocolMainService
} from "../../protocol/electron-main/protocol.js";
import { zoomLevelToZoomFactor } from "../../window/common/window.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
let IssueMainService = class {
  constructor(userEnv, environmentMainService, logService, dialogMainService, nativeHostMainService, protocolMainService, windowsMainService, cssDevelopmentService) {
    this.userEnv = userEnv;
    this.environmentMainService = environmentMainService;
    this.logService = logService;
    this.dialogMainService = dialogMainService;
    this.nativeHostMainService = nativeHostMainService;
    this.protocolMainService = protocolMainService;
    this.windowsMainService = windowsMainService;
    this.cssDevelopmentService = cssDevelopmentService;
  }
  static {
    __name(this, "IssueMainService");
  }
  static DEFAULT_BACKGROUND_COLOR = "#1E1E1E";
  issueReporterWindow = null;
  issueReporterParentWindow = null;
  //#region Used by renderer
  async openReporter(data) {
    if (!this.issueReporterWindow) {
      this.issueReporterParentWindow = BrowserWindow.getFocusedWindow();
      if (this.issueReporterParentWindow) {
        const issueReporterDisposables = new DisposableStore();
        const issueReporterWindowConfigUrl = issueReporterDisposables.add(
          this.protocolMainService.createIPCObjectUrl()
        );
        const position = this.getWindowPosition(
          this.issueReporterParentWindow,
          700,
          800
        );
        this.issueReporterWindow = this.createBrowserWindow(
          position,
          issueReporterWindowConfigUrl,
          {
            backgroundColor: data.styles.backgroundColor,
            title: localize("issueReporter", "Issue Reporter"),
            zoomLevel: data.zoomLevel,
            alwaysOnTop: false
          },
          "issue-reporter"
        );
        issueReporterWindowConfigUrl.update({
          appRoot: this.environmentMainService.appRoot,
          windowId: this.issueReporterWindow.id,
          userEnv: this.userEnv,
          data,
          disableExtensions: !!this.environmentMainService.disableExtensions,
          os: {
            type: type(),
            arch: arch(),
            release: release()
          },
          product,
          nls: {
            messages: getNLSMessages(),
            language: getNLSLanguage()
          },
          cssModules: this.cssDevelopmentService.isEnabled ? await this.cssDevelopmentService.getCssModules() : void 0
        });
        this.issueReporterWindow.loadURL(
          FileAccess.asBrowserUri(
            `vs/workbench/contrib/issue/electron-sandbox/issueReporter${this.environmentMainService.isBuilt ? "" : "-dev"}.${isESM ? "esm." : ""}html`
          ).toString(true)
        );
        this.issueReporterWindow.on("close", () => {
          this.issueReporterWindow = null;
          issueReporterDisposables.dispose();
        });
        this.issueReporterParentWindow.on("closed", () => {
          if (this.issueReporterWindow) {
            this.issueReporterWindow.close();
            this.issueReporterWindow = null;
            issueReporterDisposables.dispose();
          }
        });
      }
    } else if (this.issueReporterWindow) {
      this.focusWindow(this.issueReporterWindow);
    }
  }
  //#endregion
  //#region used by issue reporter window
  async $reloadWithExtensionsDisabled() {
    if (this.issueReporterParentWindow) {
      try {
        await this.nativeHostMainService.reload(
          this.issueReporterParentWindow.id,
          { disableExtensions: true }
        );
      } catch (error) {
        this.logService.error(error);
      }
    }
  }
  async $showConfirmCloseDialog() {
    if (this.issueReporterWindow) {
      const { response } = await this.dialogMainService.showMessageBox(
        {
          type: "warning",
          message: localize(
            "confirmCloseIssueReporter",
            "Your input will not be saved. Are you sure you want to close this window?"
          ),
          buttons: [
            localize(
              { key: "yes", comment: ["&& denotes a mnemonic"] },
              "&&Yes"
            ),
            localize("cancel", "Cancel")
          ]
        },
        this.issueReporterWindow
      );
      if (response === 0) {
        if (this.issueReporterWindow) {
          this.issueReporterWindow.destroy();
          this.issueReporterWindow = null;
        }
      }
    }
  }
  async $showClipboardDialog() {
    if (this.issueReporterWindow) {
      const { response } = await this.dialogMainService.showMessageBox(
        {
          type: "warning",
          message: localize(
            "issueReporterWriteToClipboard",
            "There is too much data to send to GitHub directly. The data will be copied to the clipboard, please paste it into the GitHub issue page that is opened."
          ),
          buttons: [
            localize(
              { key: "ok", comment: ["&& denotes a mnemonic"] },
              "&&OK"
            ),
            localize("cancel", "Cancel")
          ]
        },
        this.issueReporterWindow
      );
      return response === 0;
    }
    return false;
  }
  issueReporterWindowCheck() {
    if (!this.issueReporterParentWindow) {
      throw new Error("Issue reporter window not available");
    }
    const window = this.windowsMainService.getWindowById(
      this.issueReporterParentWindow.id
    );
    if (!window) {
      throw new Error("Window not found");
    }
    return window;
  }
  async $sendReporterMenu(extensionId, extensionName) {
    const window = this.issueReporterWindowCheck();
    const replyChannel = `vscode:triggerReporterMenu`;
    const cts = new CancellationTokenSource();
    window.sendWhenReady(replyChannel, cts.token, {
      replyChannel,
      extensionId,
      extensionName
    });
    const result = await raceTimeout(
      new Promise(
        (resolve) => validatedIpcMain.once(
          `vscode:triggerReporterMenuResponse:${extensionId}`,
          (_, data) => resolve(data)
        )
      ),
      5e3,
      () => {
        this.logService.error(
          `Error: Extension ${extensionId} timed out waiting for menu response`
        );
        cts.cancel();
      }
    );
    return result;
  }
  async $closeReporter() {
    this.issueReporterWindow?.close();
  }
  //#endregion
  focusWindow(window) {
    if (window.isMinimized()) {
      window.restore();
    }
    window.focus();
  }
  createBrowserWindow(position, ipcObjectUrl, options, windowKind) {
    const window = new BrowserWindow({
      fullscreen: false,
      skipTaskbar: false,
      resizable: true,
      width: position.width,
      height: position.height,
      minWidth: 300,
      minHeight: 200,
      x: position.x,
      y: position.y,
      title: options.title,
      backgroundColor: options.backgroundColor || IssueMainService.DEFAULT_BACKGROUND_COLOR,
      webPreferences: {
        preload: FileAccess.asFileUri(
          "vs/base/parts/sandbox/electron-sandbox/preload.js"
        ).fsPath,
        additionalArguments: [
          `--vscode-window-config=${ipcObjectUrl.resource.toString()}`
        ],
        v8CacheOptions: this.environmentMainService.useCodeCache ? "bypassHeatCheck" : "none",
        enableWebSQL: false,
        spellcheck: false,
        zoomFactor: zoomLevelToZoomFactor(options.zoomLevel),
        sandbox: true
      },
      alwaysOnTop: options.alwaysOnTop,
      experimentalDarkMode: true
    });
    window.setMenuBarVisibility(false);
    return window;
  }
  getWindowPosition(parentWindow, defaultWidth, defaultHeight) {
    let displayToUse;
    const displays = screen.getAllDisplays();
    if (displays.length === 1) {
      displayToUse = displays[0];
    } else {
      if (isMacintosh) {
        const cursorPoint = screen.getCursorScreenPoint();
        displayToUse = screen.getDisplayNearestPoint(cursorPoint);
      }
      if (!displayToUse && parentWindow) {
        displayToUse = screen.getDisplayMatching(
          parentWindow.getBounds()
        );
      }
      if (!displayToUse) {
        displayToUse = screen.getPrimaryDisplay() || displays[0];
      }
    }
    const displayBounds = displayToUse.bounds;
    const state = {
      width: defaultWidth,
      height: defaultHeight,
      x: displayBounds.x + displayBounds.width / 2 - defaultWidth / 2,
      y: displayBounds.y + displayBounds.height / 2 - defaultHeight / 2
    };
    if (displayBounds.width > 0 && displayBounds.height > 0) {
      if (state.x < displayBounds.x) {
        state.x = displayBounds.x;
      }
      if (state.y < displayBounds.y) {
        state.y = displayBounds.y;
      }
      if (state.x > displayBounds.x + displayBounds.width) {
        state.x = displayBounds.x;
      }
      if (state.y > displayBounds.y + displayBounds.height) {
        state.y = displayBounds.y;
      }
      if (state.width > displayBounds.width) {
        state.width = displayBounds.width;
      }
      if (state.height > displayBounds.height) {
        state.height = displayBounds.height;
      }
    }
    return state;
  }
};
IssueMainService = __decorateClass([
  __decorateParam(1, IEnvironmentMainService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IDialogMainService),
  __decorateParam(4, INativeHostMainService),
  __decorateParam(5, IProtocolMainService),
  __decorateParam(6, IWindowsMainService),
  __decorateParam(7, ICSSDevelopmentService)
], IssueMainService);
export {
  IssueMainService
};
//# sourceMappingURL=issueMainService.js.map
