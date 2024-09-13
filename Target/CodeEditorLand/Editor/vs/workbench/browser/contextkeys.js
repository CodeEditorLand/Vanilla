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
import {
  isFullscreen,
  onDidChangeFullscreen
} from "../../base/browser/browser.js";
import {
  EventType,
  addDisposableListener,
  getActiveWindow,
  isEditableElement,
  onDidRegisterWindow,
  trackFocus
} from "../../base/browser/dom.js";
import { mainWindow } from "../../base/browser/window.js";
import { Event } from "../../base/common/event.js";
import { Disposable } from "../../base/common/lifecycle.js";
import { isNative } from "../../base/common/platform.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
import {
  IContextKeyService,
  setConstant as setConstantContextKey
} from "../../platform/contextkey/common/contextkey.js";
import {
  InputFocusedContext,
  IsDevelopmentContext,
  IsIOSContext,
  IsLinuxContext,
  IsMacContext,
  IsMacNativeContext,
  IsMobileContext,
  IsWebContext,
  IsWindowsContext,
  ProductQualityContext
} from "../../platform/contextkey/common/contextkeys.js";
import { WebFileSystemAccess } from "../../platform/files/browser/webFileSystemAccess.js";
import { IProductService } from "../../platform/product/common/productService.js";
import { getRemoteName } from "../../platform/remote/common/remoteHosts.js";
import { getTitleBarStyle } from "../../platform/window/common/window.js";
import { getVirtualWorkspaceScheme } from "../../platform/workspace/common/virtualWorkspace.js";
import {
  IWorkspaceContextService,
  WorkbenchState,
  isTemporaryWorkspace
} from "../../platform/workspace/common/workspace.js";
import {
  ActiveEditorGroupEmptyContext,
  ActiveEditorGroupIndexContext,
  ActiveEditorGroupLastContext,
  ActiveEditorGroupLockedContext,
  AuxiliaryBarVisibleContext,
  DirtyWorkingCopiesContext,
  EditorTabsVisibleContext,
  EditorsVisibleContext,
  EmbedderIdentifierContext,
  EmptyWorkspaceSupportContext,
  EnterMultiRootWorkspaceSupportContext,
  HasWebFileSystemAccess,
  InEditorZenModeContext,
  IsAuxiliaryWindowFocusedContext,
  IsMainEditorCenteredLayoutContext,
  IsMainWindowFullscreenContext,
  MainEditorAreaVisibleContext,
  MultipleEditorGroupsContext,
  OpenFolderWorkspaceSupportContext,
  PanelAlignmentContext,
  PanelMaximizedContext,
  PanelPositionContext,
  PanelVisibleContext,
  RemoteNameContext,
  SideBarVisibleContext,
  SplitEditorsVertically,
  TemporaryWorkspaceContext,
  TitleBarStyleContext,
  TitleBarVisibleContext,
  VirtualWorkspaceContext,
  WorkbenchStateContext,
  WorkspaceFolderCountContext
} from "../common/contextkeys.js";
import {
  GroupDirection,
  IEditorGroupsService,
  preferredSideBySideGroupDirection
} from "../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../services/environment/common/environmentService.js";
import {
  IWorkbenchLayoutService,
  Parts,
  positionToString
} from "../services/layout/browser/layoutService.js";
import { IPaneCompositePartService } from "../services/panecomposite/browser/panecomposite.js";
import { IWorkingCopyService } from "../services/workingCopy/common/workingCopyService.js";
let WorkbenchContextKeysHandler = class extends Disposable {
  constructor(contextKeyService, contextService, configurationService, environmentService, productService, editorGroupService, editorService, layoutService, paneCompositeService, workingCopyService) {
    super();
    this.contextKeyService = contextKeyService;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.productService = productService;
    this.editorGroupService = editorGroupService;
    this.editorService = editorService;
    this.layoutService = layoutService;
    this.paneCompositeService = paneCompositeService;
    this.workingCopyService = workingCopyService;
    IsMacContext.bindTo(this.contextKeyService);
    IsLinuxContext.bindTo(this.contextKeyService);
    IsWindowsContext.bindTo(this.contextKeyService);
    IsWebContext.bindTo(this.contextKeyService);
    IsMacNativeContext.bindTo(this.contextKeyService);
    IsIOSContext.bindTo(this.contextKeyService);
    IsMobileContext.bindTo(this.contextKeyService);
    RemoteNameContext.bindTo(this.contextKeyService).set(getRemoteName(this.environmentService.remoteAuthority) || "");
    this.virtualWorkspaceContext = VirtualWorkspaceContext.bindTo(this.contextKeyService);
    this.temporaryWorkspaceContext = TemporaryWorkspaceContext.bindTo(this.contextKeyService);
    this.updateWorkspaceContextKeys();
    HasWebFileSystemAccess.bindTo(this.contextKeyService).set(WebFileSystemAccess.supported(mainWindow));
    const isDevelopment = !this.environmentService.isBuilt || this.environmentService.isExtensionDevelopment;
    IsDevelopmentContext.bindTo(this.contextKeyService).set(isDevelopment);
    setConstantContextKey(IsDevelopmentContext.key, isDevelopment);
    ProductQualityContext.bindTo(this.contextKeyService).set(this.productService.quality || "");
    EmbedderIdentifierContext.bindTo(this.contextKeyService).set(productService.embedderIdentifier);
    this.activeEditorGroupEmpty = ActiveEditorGroupEmptyContext.bindTo(this.contextKeyService);
    this.activeEditorGroupIndex = ActiveEditorGroupIndexContext.bindTo(this.contextKeyService);
    this.activeEditorGroupLast = ActiveEditorGroupLastContext.bindTo(this.contextKeyService);
    this.activeEditorGroupLocked = ActiveEditorGroupLockedContext.bindTo(this.contextKeyService);
    this.multipleEditorGroupsContext = MultipleEditorGroupsContext.bindTo(this.contextKeyService);
    this.editorsVisibleContext = EditorsVisibleContext.bindTo(this.contextKeyService);
    this.dirtyWorkingCopiesContext = DirtyWorkingCopiesContext.bindTo(this.contextKeyService);
    this.dirtyWorkingCopiesContext.set(this.workingCopyService.hasDirty);
    this.inputFocusedContext = InputFocusedContext.bindTo(this.contextKeyService);
    this.workbenchStateContext = WorkbenchStateContext.bindTo(this.contextKeyService);
    this.updateWorkbenchStateContextKey();
    this.workspaceFolderCountContext = WorkspaceFolderCountContext.bindTo(this.contextKeyService);
    this.updateWorkspaceFolderCountContextKey();
    this.openFolderWorkspaceSupportContext = OpenFolderWorkspaceSupportContext.bindTo(this.contextKeyService);
    this.openFolderWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === "string");
    this.emptyWorkspaceSupportContext = EmptyWorkspaceSupportContext.bindTo(this.contextKeyService);
    this.emptyWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === "string");
    this.enterMultiRootWorkspaceSupportContext = EnterMultiRootWorkspaceSupportContext.bindTo(this.contextKeyService);
    this.enterMultiRootWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === "string");
    this.splitEditorsVerticallyContext = SplitEditorsVertically.bindTo(this.contextKeyService);
    this.updateSplitEditorsVerticallyContext();
    this.isMainWindowFullscreenContext = IsMainWindowFullscreenContext.bindTo(this.contextKeyService);
    this.isAuxiliaryWindowFocusedContext = IsAuxiliaryWindowFocusedContext.bindTo(this.contextKeyService);
    this.inZenModeContext = InEditorZenModeContext.bindTo(this.contextKeyService);
    this.isMainEditorCenteredLayoutContext = IsMainEditorCenteredLayoutContext.bindTo(this.contextKeyService);
    this.mainEditorAreaVisibleContext = MainEditorAreaVisibleContext.bindTo(this.contextKeyService);
    this.editorTabsVisibleContext = EditorTabsVisibleContext.bindTo(this.contextKeyService);
    this.sideBarVisibleContext = SideBarVisibleContext.bindTo(this.contextKeyService);
    this.titleAreaVisibleContext = TitleBarVisibleContext.bindTo(this.contextKeyService);
    this.titleBarStyleContext = TitleBarStyleContext.bindTo(this.contextKeyService);
    this.updateTitleBarContextKeys();
    this.panelPositionContext = PanelPositionContext.bindTo(this.contextKeyService);
    this.panelPositionContext.set(positionToString(this.layoutService.getPanelPosition()));
    this.panelVisibleContext = PanelVisibleContext.bindTo(this.contextKeyService);
    this.panelVisibleContext.set(this.layoutService.isVisible(Parts.PANEL_PART));
    this.panelMaximizedContext = PanelMaximizedContext.bindTo(this.contextKeyService);
    this.panelMaximizedContext.set(this.layoutService.isPanelMaximized());
    this.panelAlignmentContext = PanelAlignmentContext.bindTo(this.contextKeyService);
    this.panelAlignmentContext.set(this.layoutService.getPanelAlignment());
    this.auxiliaryBarVisibleContext = AuxiliaryBarVisibleContext.bindTo(this.contextKeyService);
    this.auxiliaryBarVisibleContext.set(this.layoutService.isVisible(Parts.AUXILIARYBAR_PART));
    this.registerListeners();
  }
  static {
    __name(this, "WorkbenchContextKeysHandler");
  }
  inputFocusedContext;
  dirtyWorkingCopiesContext;
  activeEditorGroupEmpty;
  activeEditorGroupIndex;
  activeEditorGroupLast;
  activeEditorGroupLocked;
  multipleEditorGroupsContext;
  editorsVisibleContext;
  splitEditorsVerticallyContext;
  workbenchStateContext;
  workspaceFolderCountContext;
  openFolderWorkspaceSupportContext;
  enterMultiRootWorkspaceSupportContext;
  emptyWorkspaceSupportContext;
  virtualWorkspaceContext;
  temporaryWorkspaceContext;
  inZenModeContext;
  isMainWindowFullscreenContext;
  isAuxiliaryWindowFocusedContext;
  isMainEditorCenteredLayoutContext;
  sideBarVisibleContext;
  mainEditorAreaVisibleContext;
  panelPositionContext;
  panelVisibleContext;
  panelAlignmentContext;
  panelMaximizedContext;
  auxiliaryBarVisibleContext;
  editorTabsVisibleContext;
  titleAreaVisibleContext;
  titleBarStyleContext;
  registerListeners() {
    this.editorGroupService.whenReady.then(() => {
      this.updateEditorAreaContextKeys();
      this.updateActiveEditorGroupContextKeys();
      this.updateVisiblePanesContextKeys();
    });
    this._register(
      this.editorService.onDidActiveEditorChange(
        () => this.updateActiveEditorGroupContextKeys()
      )
    );
    this._register(
      this.editorService.onDidVisibleEditorsChange(
        () => this.updateVisiblePanesContextKeys()
      )
    );
    this._register(
      this.editorGroupService.onDidAddGroup(
        () => this.updateEditorGroupsContextKeys()
      )
    );
    this._register(
      this.editorGroupService.onDidRemoveGroup(
        () => this.updateEditorGroupsContextKeys()
      )
    );
    this._register(
      this.editorGroupService.onDidChangeGroupIndex(
        () => this.updateActiveEditorGroupContextKeys()
      )
    );
    this._register(
      this.editorGroupService.onDidChangeGroupLocked(
        () => this.updateActiveEditorGroupContextKeys()
      )
    );
    this._register(
      this.editorGroupService.onDidChangeEditorPartOptions(
        () => this.updateEditorAreaContextKeys()
      )
    );
    this._register(
      Event.runAndSubscribe(
        onDidRegisterWindow,
        ({ window, disposables }) => disposables.add(
          addDisposableListener(
            window,
            EventType.FOCUS_IN,
            () => this.updateInputContextKeys(window.document),
            true
          )
        ),
        { window: mainWindow, disposables: this._store }
      )
    );
    this._register(
      this.contextService.onDidChangeWorkbenchState(
        () => this.updateWorkbenchStateContextKey()
      )
    );
    this._register(
      this.contextService.onDidChangeWorkspaceFolders(() => {
        this.updateWorkspaceFolderCountContextKey();
        this.updateWorkspaceContextKeys();
      })
    );
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(
          "workbench.editor.openSideBySideDirection"
        )) {
          this.updateSplitEditorsVerticallyContext();
        }
      })
    );
    this._register(
      this.layoutService.onDidChangeZenMode(
        (enabled) => this.inZenModeContext.set(enabled)
      )
    );
    this._register(
      this.layoutService.onDidChangeActiveContainer(
        () => this.isAuxiliaryWindowFocusedContext.set(
          this.layoutService.activeContainer !== this.layoutService.mainContainer
        )
      )
    );
    this._register(
      onDidChangeFullscreen((windowId) => {
        if (windowId === mainWindow.vscodeWindowId) {
          this.isMainWindowFullscreenContext.set(
            isFullscreen(mainWindow)
          );
        }
      })
    );
    this._register(
      this.layoutService.onDidChangeMainEditorCenteredLayout(
        (centered) => this.isMainEditorCenteredLayoutContext.set(centered)
      )
    );
    this._register(
      this.layoutService.onDidChangePanelPosition(
        (position) => this.panelPositionContext.set(position)
      )
    );
    this._register(
      this.layoutService.onDidChangePanelAlignment(
        (alignment) => this.panelAlignmentContext.set(alignment)
      )
    );
    this._register(
      this.paneCompositeService.onDidPaneCompositeClose(
        () => this.updateSideBarContextKeys()
      )
    );
    this._register(
      this.paneCompositeService.onDidPaneCompositeOpen(
        () => this.updateSideBarContextKeys()
      )
    );
    this._register(
      this.layoutService.onDidChangePartVisibility(() => {
        this.mainEditorAreaVisibleContext.set(
          this.layoutService.isVisible(Parts.EDITOR_PART, mainWindow)
        );
        this.panelVisibleContext.set(
          this.layoutService.isVisible(Parts.PANEL_PART)
        );
        this.panelMaximizedContext.set(
          this.layoutService.isPanelMaximized()
        );
        this.auxiliaryBarVisibleContext.set(
          this.layoutService.isVisible(Parts.AUXILIARYBAR_PART)
        );
        this.updateTitleBarContextKeys();
      })
    );
    this._register(
      this.workingCopyService.onDidChangeDirty(
        (workingCopy) => this.dirtyWorkingCopiesContext.set(
          workingCopy.isDirty() || this.workingCopyService.hasDirty
        )
      )
    );
  }
  updateVisiblePanesContextKeys() {
    const visibleEditorPanes = this.editorService.visibleEditorPanes;
    if (visibleEditorPanes.length > 0) {
      this.editorsVisibleContext.set(true);
    } else {
      this.editorsVisibleContext.reset();
    }
  }
  // Context keys depending on the state of the editor group itself
  updateActiveEditorGroupContextKeys() {
    if (this.editorService.activeEditor) {
      this.activeEditorGroupEmpty.reset();
    } else {
      this.activeEditorGroupEmpty.set(true);
    }
    const activeGroup = this.editorGroupService.activeGroup;
    this.activeEditorGroupIndex.set(activeGroup.index + 1);
    this.activeEditorGroupLocked.set(activeGroup.isLocked);
    this.updateEditorGroupsContextKeys();
  }
  // Context keys depending on the state of other editor groups
  updateEditorGroupsContextKeys() {
    const groupCount = this.editorGroupService.count;
    if (groupCount > 1) {
      this.multipleEditorGroupsContext.set(true);
    } else {
      this.multipleEditorGroupsContext.reset();
    }
    const activeGroup = this.editorGroupService.activeGroup;
    this.activeEditorGroupLast.set(activeGroup.index === groupCount - 1);
  }
  updateEditorAreaContextKeys() {
    this.editorTabsVisibleContext.set(
      this.editorGroupService.partOptions.showTabs === "multiple"
    );
  }
  updateInputContextKeys(ownerDocument) {
    function activeElementIsInput() {
      return !!ownerDocument.activeElement && isEditableElement(ownerDocument.activeElement);
    }
    __name(activeElementIsInput, "activeElementIsInput");
    const isInputFocused = activeElementIsInput();
    this.inputFocusedContext.set(isInputFocused);
    if (isInputFocused) {
      const tracker = trackFocus(
        ownerDocument.activeElement
      );
      Event.once(tracker.onDidBlur)(() => {
        if (getActiveWindow().document === ownerDocument) {
          this.inputFocusedContext.set(activeElementIsInput());
        }
        tracker.dispose();
      });
    }
  }
  updateWorkbenchStateContextKey() {
    this.workbenchStateContext.set(this.getWorkbenchStateString());
  }
  updateWorkspaceFolderCountContextKey() {
    this.workspaceFolderCountContext.set(
      this.contextService.getWorkspace().folders.length
    );
  }
  updateSplitEditorsVerticallyContext() {
    const direction = preferredSideBySideGroupDirection(
      this.configurationService
    );
    this.splitEditorsVerticallyContext.set(
      direction === GroupDirection.DOWN
    );
  }
  getWorkbenchStateString() {
    switch (this.contextService.getWorkbenchState()) {
      case WorkbenchState.EMPTY:
        return "empty";
      case WorkbenchState.FOLDER:
        return "folder";
      case WorkbenchState.WORKSPACE:
        return "workspace";
    }
  }
  updateSideBarContextKeys() {
    this.sideBarVisibleContext.set(
      this.layoutService.isVisible(Parts.SIDEBAR_PART)
    );
  }
  updateTitleBarContextKeys() {
    this.titleAreaVisibleContext.set(
      this.layoutService.isVisible(Parts.TITLEBAR_PART, mainWindow)
    );
    this.titleBarStyleContext.set(
      getTitleBarStyle(this.configurationService)
    );
  }
  updateWorkspaceContextKeys() {
    this.virtualWorkspaceContext.set(
      getVirtualWorkspaceScheme(this.contextService.getWorkspace()) || ""
    );
    this.temporaryWorkspaceContext.set(
      isTemporaryWorkspace(this.contextService.getWorkspace())
    );
  }
};
WorkbenchContextKeysHandler = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IWorkbenchLayoutService),
  __decorateParam(8, IPaneCompositePartService),
  __decorateParam(9, IWorkingCopyService)
], WorkbenchContextKeysHandler);
export {
  WorkbenchContextKeysHandler
};
//# sourceMappingURL=contextkeys.js.map
