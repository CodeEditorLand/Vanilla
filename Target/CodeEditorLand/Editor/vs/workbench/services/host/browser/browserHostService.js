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
  EventType,
  ModifierKeyEmitter,
  addDisposableListener,
  addDisposableThrottledListener,
  detectFullscreen,
  disposableWindowInterval,
  getActiveDocument,
  getWindowId,
  onDidRegisterWindow,
  trackFocus
} from "../../../../base/browser/dom.js";
import { DomEmitter } from "../../../../base/browser/event.js";
import {
  isAuxiliaryWindow,
  mainWindow
} from "../../../../base/browser/window.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { memoize } from "../../../../base/common/decorators.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { parseLineAndColumnAware } from "../../../../base/common/extpath.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { isIOS, isMacintosh } from "../../../../base/common/platform.js";
import Severity from "../../../../base/common/severity.js";
import { isUndefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  ILabelService,
  Verbosity
} from "../../../../platform/label/common/label.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import {
  isFileToOpen,
  isFolderToOpen,
  isWorkspaceToOpen
} from "../../../../platform/window/common/window.js";
import {
  IWorkspaceContextService,
  isTemporaryWorkspace
} from "../../../../platform/workspace/common/workspace.js";
import { whenEditorClosed } from "../../../browser/editor.js";
import {
  isResourceEditorInput,
  pathsToEditors
} from "../../../common/editor.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import {
  ILifecycleService,
  ShutdownReason
} from "../../lifecycle/common/lifecycle.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { getWorkspaceIdentifier } from "../../workspaces/browser/workspaces.js";
import { IWorkspaceEditingService } from "../../workspaces/common/workspaceEditing.js";
import { IHostService } from "./host.js";
var HostShutdownReason = /* @__PURE__ */ ((HostShutdownReason2) => {
  HostShutdownReason2[HostShutdownReason2["Unknown"] = 1] = "Unknown";
  HostShutdownReason2[HostShutdownReason2["Keyboard"] = 2] = "Keyboard";
  HostShutdownReason2[HostShutdownReason2["Api"] = 3] = "Api";
  return HostShutdownReason2;
})(HostShutdownReason || {});
let BrowserHostService = class extends Disposable {
  constructor(layoutService, configurationService, fileService, labelService, environmentService, instantiationService, lifecycleService, logService, dialogService, contextService, userDataProfileService, userDataProfilesService) {
    super();
    this.layoutService = layoutService;
    this.configurationService = configurationService;
    this.fileService = fileService;
    this.labelService = labelService;
    this.environmentService = environmentService;
    this.instantiationService = instantiationService;
    this.lifecycleService = lifecycleService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.contextService = contextService;
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    if (environmentService.options?.workspaceProvider) {
      this.workspaceProvider = environmentService.options.workspaceProvider;
    } else {
      this.workspaceProvider = new class {
        workspace = void 0;
        trusted = void 0;
        async open() {
          return true;
        }
      }();
    }
    this.registerListeners();
  }
  workspaceProvider;
  shutdownReason = 1 /* Unknown */;
  registerListeners() {
    this._register(
      this.lifecycleService.onBeforeShutdown(
        (e) => this.onBeforeShutdown(e)
      )
    );
    this._register(
      ModifierKeyEmitter.getInstance().event(
        () => this.updateShutdownReasonFromEvent()
      )
    );
  }
  onBeforeShutdown(e) {
    switch (this.shutdownReason) {
      // Unknown / Keyboard shows veto depending on setting
      case 1 /* Unknown */:
      case 2 /* Keyboard */: {
        const confirmBeforeClose = this.configurationService.getValue(
          "window.confirmBeforeClose"
        );
        if (confirmBeforeClose === "always" || confirmBeforeClose === "keyboardOnly" && this.shutdownReason === 2 /* Keyboard */) {
          e.veto(true, "veto.confirmBeforeClose");
        }
        break;
      }
      // Api never shows veto
      case 3 /* Api */:
        break;
    }
    this.shutdownReason = 1 /* Unknown */;
  }
  updateShutdownReasonFromEvent() {
    if (this.shutdownReason === 3 /* Api */) {
      return;
    }
    if (ModifierKeyEmitter.getInstance().isModifierPressed) {
      this.shutdownReason = 2 /* Keyboard */;
    } else {
      this.shutdownReason = 1 /* Unknown */;
    }
  }
  get onDidChangeFocus() {
    const emitter = this._register(new Emitter());
    this._register(
      Event.runAndSubscribe(
        onDidRegisterWindow,
        ({ window, disposables }) => {
          const focusTracker = disposables.add(trackFocus(window));
          const visibilityTracker = disposables.add(
            new DomEmitter(window.document, "visibilitychange")
          );
          Event.any(
            Event.map(
              focusTracker.onDidFocus,
              () => this.hasFocus,
              disposables
            ),
            Event.map(
              focusTracker.onDidBlur,
              () => this.hasFocus,
              disposables
            ),
            Event.map(
              visibilityTracker.event,
              () => this.hasFocus,
              disposables
            ),
            Event.map(
              this.onDidChangeActiveWindow,
              () => this.hasFocus,
              disposables
            )
          )((focus) => emitter.fire(focus));
        },
        { window: mainWindow, disposables: this._store }
      )
    );
    return Event.latch(emitter.event, void 0, this._store);
  }
  get hasFocus() {
    return getActiveDocument().hasFocus();
  }
  async hadLastFocus() {
    return true;
  }
  async focus(targetWindow) {
    targetWindow.focus();
  }
  get onDidChangeActiveWindow() {
    const emitter = this._register(new Emitter());
    this._register(
      Event.runAndSubscribe(
        onDidRegisterWindow,
        ({ window, disposables }) => {
          const windowId = getWindowId(window);
          const focusTracker = disposables.add(trackFocus(window));
          disposables.add(
            focusTracker.onDidFocus(() => emitter.fire(windowId))
          );
          if (isAuxiliaryWindow(window)) {
            disposables.add(
              disposableWindowInterval(
                window,
                () => {
                  const hasFocus = window.document.hasFocus();
                  if (hasFocus) {
                    emitter.fire(windowId);
                  }
                  return hasFocus;
                },
                100,
                20
              )
            );
          }
        },
        { window: mainWindow, disposables: this._store }
      )
    );
    return Event.latch(emitter.event, void 0, this._store);
  }
  get onDidChangeFullScreen() {
    const emitter = this._register(
      new Emitter()
    );
    this._register(
      Event.runAndSubscribe(
        onDidRegisterWindow,
        ({ window, disposables }) => {
          const windowId = getWindowId(window);
          const viewport = isIOS && window.visualViewport ? window.visualViewport : window;
          for (const event of [
            EventType.FULLSCREEN_CHANGE,
            EventType.WK_FULLSCREEN_CHANGE
          ]) {
            disposables.add(
              addDisposableListener(
                window.document,
                event,
                () => emitter.fire({
                  windowId,
                  fullscreen: !!detectFullscreen(window)
                })
              )
            );
          }
          disposables.add(
            addDisposableThrottledListener(
              viewport,
              EventType.RESIZE,
              () => emitter.fire({
                windowId,
                fullscreen: !!detectFullscreen(window)
              }),
              void 0,
              isMacintosh ? 2e3 : 800
            )
          );
        },
        { window: mainWindow, disposables: this._store }
      )
    );
    return emitter.event;
  }
  openWindow(arg1, arg2) {
    if (Array.isArray(arg1)) {
      return this.doOpenWindow(arg1, arg2);
    }
    return this.doOpenEmptyWindow(arg1);
  }
  async doOpenWindow(toOpen, options) {
    const payload = this.preservePayload(
      false,
      options
    );
    const fileOpenables = [];
    const foldersToAdd = [];
    for (const openable of toOpen) {
      openable.label = openable.label || this.getRecentLabel(openable);
      if (isFolderToOpen(openable)) {
        if (options?.addMode) {
          foldersToAdd.push({ uri: openable.folderUri });
        } else {
          this.doOpen(
            { folderUri: openable.folderUri },
            {
              reuse: this.shouldReuse(
                options,
                false
              ),
              payload
            }
          );
        }
      } else if (isWorkspaceToOpen(openable)) {
        this.doOpen(
          { workspaceUri: openable.workspaceUri },
          {
            reuse: this.shouldReuse(
              options,
              false
              /* no file */
            ),
            payload
          }
        );
      } else if (isFileToOpen(openable)) {
        fileOpenables.push(openable);
      }
    }
    if (foldersToAdd.length > 0) {
      this.withServices((accessor) => {
        const workspaceEditingService = accessor.get(IWorkspaceEditingService);
        workspaceEditingService.addFolders(foldersToAdd);
      });
    }
    if (fileOpenables.length > 0) {
      this.withServices(async (accessor) => {
        const editorService = accessor.get(IEditorService);
        if (options?.mergeMode && fileOpenables.length === 4) {
          const editors = coalesce(
            await pathsToEditors(
              fileOpenables,
              this.fileService,
              this.logService
            )
          );
          if (editors.length !== 4 || !isResourceEditorInput(editors[0]) || !isResourceEditorInput(editors[1]) || !isResourceEditorInput(editors[2]) || !isResourceEditorInput(editors[3])) {
            return;
          }
          if (this.shouldReuse(
            options,
            true
            /* file */
          )) {
            editorService.openEditor({
              input1: { resource: editors[0].resource },
              input2: { resource: editors[1].resource },
              base: { resource: editors[2].resource },
              result: { resource: editors[3].resource },
              options: { pinned: true }
            });
          } else {
            const environment = /* @__PURE__ */ new Map();
            environment.set(
              "mergeFile1",
              editors[0].resource.toString()
            );
            environment.set(
              "mergeFile2",
              editors[1].resource.toString()
            );
            environment.set(
              "mergeFileBase",
              editors[2].resource.toString()
            );
            environment.set(
              "mergeFileResult",
              editors[3].resource.toString()
            );
            this.doOpen(void 0, {
              payload: Array.from(environment.entries())
            });
          }
        } else if (options?.diffMode && fileOpenables.length === 2) {
          const editors = coalesce(
            await pathsToEditors(
              fileOpenables,
              this.fileService,
              this.logService
            )
          );
          if (editors.length !== 2 || !isResourceEditorInput(editors[0]) || !isResourceEditorInput(editors[1])) {
            return;
          }
          if (this.shouldReuse(
            options,
            true
            /* file */
          )) {
            editorService.openEditor({
              original: { resource: editors[0].resource },
              modified: { resource: editors[1].resource },
              options: { pinned: true }
            });
          } else {
            const environment = /* @__PURE__ */ new Map();
            environment.set(
              "diffFileSecondary",
              editors[0].resource.toString()
            );
            environment.set(
              "diffFilePrimary",
              editors[1].resource.toString()
            );
            this.doOpen(void 0, {
              payload: Array.from(environment.entries())
            });
          }
        } else {
          for (const openable of fileOpenables) {
            if (this.shouldReuse(
              options,
              true
              /* file */
            )) {
              let openables = [];
              if (options?.gotoLineMode) {
                const pathColumnAware = parseLineAndColumnAware(
                  openable.fileUri.path
                );
                openables = [
                  {
                    fileUri: openable.fileUri.with({
                      path: pathColumnAware.path
                    }),
                    options: {
                      selection: isUndefined(
                        pathColumnAware.line
                      ) ? void 0 : {
                        startLineNumber: pathColumnAware.line,
                        startColumn: pathColumnAware.column || 1
                      }
                    }
                  }
                ];
              } else {
                openables = [openable];
              }
              editorService.openEditors(
                coalesce(
                  await pathsToEditors(
                    openables,
                    this.fileService,
                    this.logService
                  )
                ),
                void 0,
                { validateTrust: true }
              );
            } else {
              const environment = /* @__PURE__ */ new Map();
              environment.set(
                "openFile",
                openable.fileUri.toString()
              );
              if (options?.gotoLineMode) {
                environment.set("gotoLineMode", "true");
              }
              this.doOpen(void 0, {
                payload: Array.from(environment.entries())
              });
            }
          }
        }
        const waitMarkerFileURI = options?.waitMarkerFileURI;
        if (waitMarkerFileURI) {
          (async () => {
            await this.instantiationService.invokeFunction(
              (accessor2) => whenEditorClosed(
                accessor2,
                fileOpenables.map(
                  (fileOpenable) => fileOpenable.fileUri
                )
              )
            );
            await this.fileService.del(waitMarkerFileURI);
          })();
        }
      });
    }
  }
  withServices(fn) {
    this.instantiationService.invokeFunction((accessor) => fn(accessor));
  }
  preservePayload(isEmptyWindow, options) {
    const newPayload = new Array();
    if (!isEmptyWindow && this.environmentService.extensionDevelopmentLocationURI) {
      newPayload.push([
        "extensionDevelopmentPath",
        this.environmentService.extensionDevelopmentLocationURI.toString()
      ]);
      if (this.environmentService.debugExtensionHost.debugId) {
        newPayload.push([
          "debugId",
          this.environmentService.debugExtensionHost.debugId
        ]);
      }
      if (this.environmentService.debugExtensionHost.port) {
        newPayload.push([
          "inspect-brk-extensions",
          String(this.environmentService.debugExtensionHost.port)
        ]);
      }
    }
    const newWindowProfile = (options?.forceProfile ? this.userDataProfilesService.profiles.find(
      (profile) => profile.name === options?.forceProfile
    ) : void 0) ?? this.userDataProfileService.currentProfile;
    if (!newWindowProfile.isDefault) {
      newPayload.push(["profile", newWindowProfile.name]);
    }
    return newPayload.length ? newPayload : void 0;
  }
  getRecentLabel(openable) {
    if (isFolderToOpen(openable)) {
      return this.labelService.getWorkspaceLabel(openable.folderUri, {
        verbose: Verbosity.LONG
      });
    }
    if (isWorkspaceToOpen(openable)) {
      return this.labelService.getWorkspaceLabel(
        getWorkspaceIdentifier(openable.workspaceUri),
        { verbose: Verbosity.LONG }
      );
    }
    return this.labelService.getUriLabel(openable.fileUri);
  }
  shouldReuse(options = /* @__PURE__ */ Object.create(null), isFile) {
    if (options.waitMarkerFileURI) {
      return true;
    }
    const windowConfig = this.configurationService.getValue("window");
    const openInNewWindowConfig = isFile ? windowConfig?.openFilesInNewWindow || "off" : windowConfig?.openFoldersInNewWindow || "default";
    let openInNewWindow = (options.preferNewWindow || !!options.forceNewWindow) && !options.forceReuseWindow;
    if (!options.forceNewWindow && !options.forceReuseWindow && (openInNewWindowConfig === "on" || openInNewWindowConfig === "off")) {
      openInNewWindow = openInNewWindowConfig === "on";
    }
    return !openInNewWindow;
  }
  async doOpenEmptyWindow(options) {
    return this.doOpen(void 0, {
      reuse: options?.forceReuseWindow,
      payload: this.preservePayload(true, options)
    });
  }
  async doOpen(workspace, options) {
    if (workspace && isFolderToOpen(workspace) && workspace.folderUri.scheme === Schemas.file && isTemporaryWorkspace(this.contextService.getWorkspace())) {
      this.withServices(async (accessor) => {
        const workspaceEditingService = accessor.get(IWorkspaceEditingService);
        await workspaceEditingService.updateFolders(
          0,
          this.contextService.getWorkspace().folders.length,
          [{ uri: workspace.folderUri }]
        );
      });
      return;
    }
    if (options?.reuse) {
      await this.handleExpectedShutdown(ShutdownReason.LOAD);
    }
    const opened = await this.workspaceProvider.open(workspace, options);
    if (!opened) {
      const { confirmed } = await this.dialogService.confirm({
        type: Severity.Warning,
        message: localize(
          "unableToOpenExternal",
          "The browser interrupted the opening of a new tab or window. Press 'Open' to open it anyway."
        ),
        primaryButton: localize(
          { key: "open", comment: ["&& denotes a mnemonic"] },
          "&&Open"
        )
      });
      if (confirmed) {
        await this.workspaceProvider.open(workspace, options);
      }
    }
  }
  async toggleFullScreen(targetWindow) {
    const target = this.layoutService.getContainer(targetWindow);
    if (targetWindow.document.fullscreen !== void 0) {
      if (targetWindow.document.fullscreen) {
        try {
          return await targetWindow.document.exitFullscreen();
        } catch (error) {
          this.logService.warn(
            "toggleFullScreen(): exitFullscreen failed"
          );
        }
      } else {
        try {
          return await target.requestFullscreen();
        } catch (error) {
          this.logService.warn(
            "toggleFullScreen(): requestFullscreen failed"
          );
        }
      }
    }
    if (targetWindow.document.webkitIsFullScreen !== void 0) {
      try {
        if (targetWindow.document.webkitIsFullScreen) {
          targetWindow.document.webkitExitFullscreen();
        } else {
          target.webkitRequestFullscreen();
        }
      } catch {
        this.logService.warn(
          "toggleFullScreen(): requestFullscreen/exitFullscreen failed"
        );
      }
    }
  }
  async moveTop(targetWindow) {
  }
  async getCursorScreenPoint() {
    return void 0;
  }
  //#endregion
  //#region Lifecycle
  async restart() {
    this.reload();
  }
  async reload() {
    await this.handleExpectedShutdown(ShutdownReason.RELOAD);
    mainWindow.location.reload();
  }
  async close() {
    await this.handleExpectedShutdown(ShutdownReason.CLOSE);
    mainWindow.close();
  }
  async withExpectedShutdown(expectedShutdownTask) {
    const previousShutdownReason = this.shutdownReason;
    try {
      this.shutdownReason = 3 /* Api */;
      return await expectedShutdownTask();
    } finally {
      this.shutdownReason = previousShutdownReason;
    }
  }
  async handleExpectedShutdown(reason) {
    this.shutdownReason = 3 /* Api */;
    return this.lifecycleService.withExpectedShutdown(reason);
  }
  //#endregion
  //#region File
  getPathForFile() {
    return void 0;
  }
  //#endregion
};
__decorateClass([
  memoize
], BrowserHostService.prototype, "onDidChangeFocus", 1);
__decorateClass([
  memoize
], BrowserHostService.prototype, "onDidChangeActiveWindow", 1);
__decorateClass([
  memoize
], BrowserHostService.prototype, "onDidChangeFullScreen", 1);
BrowserHostService = __decorateClass([
  __decorateParam(0, ILayoutService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IFileService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IBrowserWorkbenchEnvironmentService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILifecycleService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IWorkspaceContextService),
  __decorateParam(10, IUserDataProfileService),
  __decorateParam(11, IUserDataProfilesService)
], BrowserHostService);
registerSingleton(IHostService, BrowserHostService, InstantiationType.Delayed);
export {
  BrowserHostService
};
