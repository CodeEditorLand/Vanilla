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
  getZoomFactor,
  isWCOEnabled
} from "../../../../base/browser/browser.js";
import {
  $,
  addDisposableListener,
  append,
  EventType,
  getWindow,
  getWindowId,
  hide,
  show
} from "../../../../base/browser/dom.js";
import {
  mainWindow
} from "../../../../base/browser/window.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Event } from "../../../../base/common/event.js";
import {
  isBigSurOrNewer,
  isLinux,
  isMacintosh,
  isNative,
  isWindows
} from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import {
  IMenuService,
  MenuId
} from "../../../../platform/actions/common/actions.js";
import {
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  DEFAULT_CUSTOM_TITLEBAR_HEIGHT,
  hasNativeTitlebar,
  useWindowControlsOverlay
} from "../../../../platform/window/common/window.js";
import {
  BrowserTitlebarPart,
  BrowserTitleService
} from "../../../browser/parts/titlebar/titlebarPart.js";
import {
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { INativeWorkbenchEnvironmentService } from "../../../services/environment/electron-sandbox/environmentService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import {
  IWorkbenchLayoutService,
  Parts
} from "../../../services/layout/browser/layoutService.js";
import { NativeMenubarControl } from "./menubarControl.js";
let NativeTitlebarPart = class extends BrowserTitlebarPart {
  constructor(id, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService) {
    super(
      id,
      targetWindow,
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
    this.nativeHostService = nativeHostService;
    this.bigSurOrNewer = isBigSurOrNewer(environmentService.os.release);
  }
  //#region IView
  get minimumHeight() {
    if (!isMacintosh) {
      return super.minimumHeight;
    }
    return (this.isCommandCenterVisible ? DEFAULT_CUSTOM_TITLEBAR_HEIGHT : this.macTitlebarSize) / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
  }
  get maximumHeight() {
    return this.minimumHeight;
  }
  bigSurOrNewer;
  get macTitlebarSize() {
    if (this.bigSurOrNewer) {
      return 28;
    }
    return 22;
  }
  //#endregion
  maxRestoreControl;
  resizer;
  cachedWindowControlStyles;
  cachedWindowControlHeight;
  onMenubarVisibilityChanged(visible) {
    if ((isWindows || isLinux) && this.currentMenubarVisibility === "toggle" && visible) {
      if (this.dragRegion) {
        hide(this.dragRegion);
        setTimeout(() => show(this.dragRegion), 50);
      }
    }
    super.onMenubarVisibilityChanged(visible);
  }
  onConfigurationChanged(event) {
    super.onConfigurationChanged(event);
    if (event.affectsConfiguration("window.doubleClickIconToClose")) {
      if (this.appIcon) {
        this.onUpdateAppIconDragBehavior();
      }
    }
  }
  onUpdateAppIconDragBehavior() {
    const setting = this.configurationService.getValue(
      "window.doubleClickIconToClose"
    );
    if (setting && this.appIcon) {
      this.appIcon.style["-webkit-app-region"] = "no-drag";
    } else if (this.appIcon) {
      this.appIcon.style["-webkit-app-region"] = "drag";
    }
  }
  installMenubar() {
    super.installMenubar();
    if (this.menubar) {
      return;
    }
    if (this.customMenubar) {
      this._register(
        this.customMenubar.onFocusStateChange(
          (e) => this.onMenubarFocusChanged(e)
        )
      );
    }
  }
  onMenubarFocusChanged(focused) {
    if ((isWindows || isLinux) && this.currentMenubarVisibility !== "compact" && this.dragRegion) {
      if (focused) {
        hide(this.dragRegion);
      } else {
        show(this.dragRegion);
      }
    }
  }
  createContentArea(parent) {
    const result = super.createContentArea(parent);
    const targetWindow = getWindow(parent);
    const targetWindowId = getWindowId(targetWindow);
    if (isMacintosh || hasNativeTitlebar(this.configurationService)) {
      this._register(
        this.instantiationService.createInstance(NativeMenubarControl)
      );
    }
    if (this.appIcon) {
      this.onUpdateAppIconDragBehavior();
      this._register(
        addDisposableListener(this.appIcon, EventType.DBLCLICK, () => {
          this.nativeHostService.closeWindow({ targetWindowId });
        })
      );
    }
    if (isLinux && !hasNativeTitlebar(this.configurationService) && !isWCOEnabled() && this.windowControlsContainer) {
      const minimizeIcon = append(
        this.windowControlsContainer,
        $(
          "div.window-icon.window-minimize" + ThemeIcon.asCSSSelector(Codicon.chromeMinimize)
        )
      );
      this._register(
        addDisposableListener(minimizeIcon, EventType.CLICK, () => {
          this.nativeHostService.minimizeWindow({ targetWindowId });
        })
      );
      this.maxRestoreControl = append(
        this.windowControlsContainer,
        $("div.window-icon.window-max-restore")
      );
      this._register(
        addDisposableListener(
          this.maxRestoreControl,
          EventType.CLICK,
          async () => {
            const maximized = await this.nativeHostService.isMaximized({
              targetWindowId
            });
            if (maximized) {
              return this.nativeHostService.unmaximizeWindow({
                targetWindowId
              });
            }
            return this.nativeHostService.maximizeWindow({
              targetWindowId
            });
          }
        )
      );
      const closeIcon = append(
        this.windowControlsContainer,
        $(
          "div.window-icon.window-close" + ThemeIcon.asCSSSelector(Codicon.chromeClose)
        )
      );
      this._register(
        addDisposableListener(closeIcon, EventType.CLICK, () => {
          this.nativeHostService.closeWindow({ targetWindowId });
        })
      );
      this.resizer = append(this.rootContainer, $("div.resizer"));
      this._register(
        Event.runAndSubscribe(
          this.layoutService.onDidChangeWindowMaximized,
          ({ windowId, maximized }) => {
            if (windowId === targetWindowId) {
              this.onDidChangeWindowMaximized(maximized);
            }
          },
          {
            windowId: targetWindowId,
            maximized: this.layoutService.isWindowMaximized(targetWindow)
          }
        )
      );
    }
    if (isWindows && !hasNativeTitlebar(this.configurationService)) {
      this._register(
        this.nativeHostService.onDidTriggerWindowSystemContextMenu(
          ({ windowId, x, y }) => {
            if (targetWindowId !== windowId) {
              return;
            }
            const zoomFactor = getZoomFactor(
              getWindow(this.element)
            );
            this.onContextMenu(
              new MouseEvent("mouseup", {
                clientX: x / zoomFactor,
                clientY: y / zoomFactor
              }),
              MenuId.TitleBarContext
            );
          }
        )
      );
    }
    return result;
  }
  onDidChangeWindowMaximized(maximized) {
    if (this.maxRestoreControl) {
      if (maximized) {
        this.maxRestoreControl.classList.remove(
          ...ThemeIcon.asClassNameArray(Codicon.chromeMaximize)
        );
        this.maxRestoreControl.classList.add(
          ...ThemeIcon.asClassNameArray(Codicon.chromeRestore)
        );
      } else {
        this.maxRestoreControl.classList.remove(
          ...ThemeIcon.asClassNameArray(Codicon.chromeRestore)
        );
        this.maxRestoreControl.classList.add(
          ...ThemeIcon.asClassNameArray(Codicon.chromeMaximize)
        );
      }
    }
    if (this.resizer) {
      if (maximized) {
        hide(this.resizer);
      } else {
        show(this.resizer);
      }
    }
  }
  updateStyles() {
    super.updateStyles();
    if (useWindowControlsOverlay(this.configurationService)) {
      if (!this.cachedWindowControlStyles || this.cachedWindowControlStyles.bgColor !== this.element.style.backgroundColor || this.cachedWindowControlStyles.fgColor !== this.element.style.color) {
        this.nativeHostService.updateWindowControls({
          targetWindowId: getWindowId(getWindow(this.element)),
          backgroundColor: this.element.style.backgroundColor,
          foregroundColor: this.element.style.color
        });
      }
    }
  }
  layout(width, height) {
    super.layout(width, height);
    if (useWindowControlsOverlay(this.configurationService) || isMacintosh && isNative && !hasNativeTitlebar(this.configurationService)) {
      const newHeight = height > 0 || this.bigSurOrNewer ? Math.round(
        height * getZoomFactor(getWindow(this.element))
      ) : this.macTitlebarSize;
      if (newHeight !== this.cachedWindowControlHeight) {
        this.cachedWindowControlHeight = newHeight;
        this.nativeHostService.updateWindowControls({
          targetWindowId: getWindowId(getWindow(this.element)),
          height: newHeight
        });
      }
    }
  }
};
NativeTitlebarPart = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, INativeWorkbenchEnvironmentService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHostService),
  __decorateParam(12, INativeHostService),
  __decorateParam(13, IEditorGroupsService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, IMenuService),
  __decorateParam(16, IKeybindingService)
], NativeTitlebarPart);
let MainNativeTitlebarPart = class extends NativeTitlebarPart {
  constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService) {
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
      nativeHostService,
      editorGroupService,
      editorService,
      menuService,
      keybindingService
    );
  }
};
MainNativeTitlebarPart = __decorateClass([
  __decorateParam(0, IContextMenuService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, INativeWorkbenchEnvironmentService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IHostService),
  __decorateParam(9, INativeHostService),
  __decorateParam(10, IEditorGroupsService),
  __decorateParam(11, IEditorService),
  __decorateParam(12, IMenuService),
  __decorateParam(13, IKeybindingService)
], MainNativeTitlebarPart);
let AuxiliaryNativeTitlebarPart = class extends NativeTitlebarPart {
  constructor(container, editorGroupsContainer, mainTitlebar, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, nativeHostService, editorGroupService, editorService, menuService, keybindingService) {
    const id = AuxiliaryNativeTitlebarPart.COUNTER++;
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
      nativeHostService,
      editorGroupService,
      editorService,
      menuService,
      keybindingService
    );
    this.container = container;
    this.mainTitlebar = mainTitlebar;
  }
  static COUNTER = 1;
  get height() {
    return this.minimumHeight;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
  }
};
AuxiliaryNativeTitlebarPart = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, INativeWorkbenchEnvironmentService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHostService),
  __decorateParam(12, INativeHostService),
  __decorateParam(13, IEditorGroupsService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, IMenuService),
  __decorateParam(16, IKeybindingService)
], AuxiliaryNativeTitlebarPart);
class NativeTitleService extends BrowserTitleService {
  createMainTitlebarPart() {
    return this.instantiationService.createInstance(MainNativeTitlebarPart);
  }
  doCreateAuxiliaryTitlebarPart(container, editorGroupsContainer) {
    return this.instantiationService.createInstance(
      AuxiliaryNativeTitlebarPart,
      container,
      editorGroupsContainer,
      this.mainPart
    );
  }
}
export {
  AuxiliaryNativeTitlebarPart,
  MainNativeTitlebarPart,
  NativeTitleService,
  NativeTitlebarPart
};
