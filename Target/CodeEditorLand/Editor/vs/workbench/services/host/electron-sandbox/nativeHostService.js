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
import {
  disposableWindowInterval,
  getActiveDocument,
  getWindowId,
  getWindowsCount,
  hasWindow,
  onDidRegisterWindow
} from "../../../../base/browser/dom.js";
import { isAuxiliaryWindow } from "../../../../base/browser/window.js";
import { memoize } from "../../../../base/common/decorators.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { webUtils } from "../../../../base/parts/sandbox/electron-sandbox/globals.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import {
  ILabelService,
  Verbosity
} from "../../../../platform/label/common/label.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { NativeHostService } from "../../../../platform/native/common/nativeHostService.js";
import {
  isFolderToOpen,
  isWorkspaceToOpen
} from "../../../../platform/window/common/window.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IHostService } from "../browser/host.js";
let WorkbenchNativeHostService = class extends NativeHostService {
  constructor(environmentService, mainProcessService) {
    super(environmentService.window.id, mainProcessService);
  }
};
WorkbenchNativeHostService = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IMainProcessService)
], WorkbenchNativeHostService);
let WorkbenchHostService = class extends Disposable {
  constructor(nativeHostService, labelService, environmentService) {
    super();
    this.nativeHostService = nativeHostService;
    this.labelService = labelService;
    this.environmentService = environmentService;
  }
  //#region Focus
  onDidChangeFocus = Event.latch(
    Event.any(
      Event.map(
        Event.filter(
          this.nativeHostService.onDidFocusMainOrAuxiliaryWindow,
          (id) => hasWindow(id),
          this._store
        ),
        () => this.hasFocus,
        this._store
      ),
      Event.map(
        Event.filter(
          this.nativeHostService.onDidBlurMainOrAuxiliaryWindow,
          (id) => hasWindow(id),
          this._store
        ),
        () => this.hasFocus,
        this._store
      ),
      Event.map(
        this.onDidChangeActiveWindow,
        () => this.hasFocus,
        this._store
      )
    ),
    void 0,
    this._store
  );
  get hasFocus() {
    return getActiveDocument().hasFocus();
  }
  async hadLastFocus() {
    const activeWindowId = await this.nativeHostService.getActiveWindowId();
    if (typeof activeWindowId === "undefined") {
      return false;
    }
    return activeWindowId === this.nativeHostService.windowId;
  }
  get onDidChangeActiveWindow() {
    const emitter = this._register(new Emitter());
    this._register(
      Event.filter(
        this.nativeHostService.onDidFocusMainOrAuxiliaryWindow,
        (id) => hasWindow(id),
        this._store
      )((id) => emitter.fire(id))
    );
    this._register(
      onDidRegisterWindow(({ window, disposables }) => {
        disposables.add(
          disposableWindowInterval(
            window,
            () => {
              const hasFocus = window.document.hasFocus();
              if (hasFocus) {
                emitter.fire(window.vscodeWindowId);
              }
              return hasFocus;
            },
            100,
            20
          )
        );
      })
    );
    return Event.latch(emitter.event, void 0, this._store);
  }
  onDidChangeFullScreen = Event.filter(
    this.nativeHostService.onDidChangeWindowFullScreen,
    (e) => hasWindow(e.windowId),
    this._store
  );
  openWindow(arg1, arg2) {
    if (Array.isArray(arg1)) {
      return this.doOpenWindow(arg1, arg2);
    }
    return this.doOpenEmptyWindow(arg1);
  }
  doOpenWindow(toOpen, options) {
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (!!remoteAuthority) {
      toOpen.forEach(
        (openable) => openable.label = openable.label || this.getRecentLabel(openable)
      );
      if (options?.remoteAuthority === void 0) {
        options = options ? { ...options, remoteAuthority } : { remoteAuthority };
      }
    }
    return this.nativeHostService.openWindow(toOpen, options);
  }
  getRecentLabel(openable) {
    if (isFolderToOpen(openable)) {
      return this.labelService.getWorkspaceLabel(openable.folderUri, {
        verbose: Verbosity.LONG
      });
    }
    if (isWorkspaceToOpen(openable)) {
      return this.labelService.getWorkspaceLabel(
        { id: "", configPath: openable.workspaceUri },
        { verbose: Verbosity.LONG }
      );
    }
    return this.labelService.getUriLabel(openable.fileUri);
  }
  doOpenEmptyWindow(options) {
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (!!remoteAuthority && options?.remoteAuthority === void 0) {
      options = options ? { ...options, remoteAuthority } : { remoteAuthority };
    }
    return this.nativeHostService.openWindow(options);
  }
  toggleFullScreen(targetWindow) {
    return this.nativeHostService.toggleFullScreen({
      targetWindowId: isAuxiliaryWindow(targetWindow) ? targetWindow.vscodeWindowId : void 0
    });
  }
  async moveTop(targetWindow) {
    if (getWindowsCount() <= 1) {
      return;
    }
    return this.nativeHostService.moveWindowTop(
      isAuxiliaryWindow(targetWindow) ? { targetWindowId: targetWindow.vscodeWindowId } : void 0
    );
  }
  getCursorScreenPoint() {
    return this.nativeHostService.getCursorScreenPoint();
  }
  //#endregion
  //#region Lifecycle
  focus(targetWindow, options) {
    return this.nativeHostService.focusWindow({
      force: options?.force,
      targetWindowId: getWindowId(targetWindow)
    });
  }
  restart() {
    return this.nativeHostService.relaunch();
  }
  reload(options) {
    return this.nativeHostService.reload(options);
  }
  close() {
    return this.nativeHostService.closeWindow();
  }
  async withExpectedShutdown(expectedShutdownTask) {
    return await expectedShutdownTask();
  }
  //#endregion
  //#region File
  getPathForFile(file) {
    return webUtils.getPathForFile(file);
  }
  //#endregion
};
__decorateClass([
  memoize
], WorkbenchHostService.prototype, "onDidChangeActiveWindow", 1);
WorkbenchHostService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], WorkbenchHostService);
registerSingleton(
  IHostService,
  WorkbenchHostService,
  InstantiationType.Delayed
);
registerSingleton(
  INativeHostService,
  WorkbenchNativeHostService,
  InstantiationType.Delayed
);
