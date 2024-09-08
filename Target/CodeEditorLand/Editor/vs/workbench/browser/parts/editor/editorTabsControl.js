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
import "./media/editortabscontrol.css";
import { isFirefox } from "../../../../base/browser/browser.js";
import { DataTransfers, applyDragImage } from "../../../../base/browser/dnd.js";
import {
  getActiveWindow,
  getWindow,
  isMouseEvent
} from "../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import {
  ActionsOrientation,
  prepareActions
} from "../../../../base/browser/ui/actionbar/actionbar.js";
import { AnchorAlignment } from "../../../../base/browser/ui/contextview/contextview.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { ActionRunner } from "../../../../base/common/actions.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { LocalSelectionTransfer } from "../../../../platform/dnd/browser/dnd.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import {
  listActiveSelectionBackground,
  listActiveSelectionForeground
} from "../../../../platform/theme/common/colorRegistry.js";
import {
  IThemeService,
  Themable
} from "../../../../platform/theme/common/themeService.js";
import {
  ActiveEditorAvailableEditorIdsContext,
  ActiveEditorCanSplitInGroupContext,
  ActiveEditorFirstInGroupContext,
  ActiveEditorGroupLockedContext,
  ActiveEditorLastInGroupContext,
  ActiveEditorPinnedContext,
  ActiveEditorStickyContext,
  ResourceContextKey,
  SideBySideEditorActiveContext,
  applyAvailableEditorIds
} from "../../../common/contextkeys.js";
import {
  EditorInputCapabilities,
  EditorResourceAccessor,
  EditorsOrder,
  SideBySideEditor,
  Verbosity
} from "../../../common/editor.js";
import { SideBySideEditorInput } from "../../../common/editor/sideBySideEditorInput.js";
import {
  MergeGroupMode
} from "../../../services/editor/common/editorGroupsService.js";
import { IEditorResolverService } from "../../../services/editor/common/editorResolverService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import {
  DraggedEditorGroupIdentifier,
  fillEditorsDragData,
  isWindowDraggedOver
} from "../../dnd.js";
import { EDITOR_CORE_NAVIGATION_COMMANDS } from "./editorCommands.js";
import { EditorPane } from "./editorPane.js";
class EditorCommandsContextActionRunner extends ActionRunner {
  constructor(context) {
    super();
    this.context = context;
  }
  run(action, context) {
    let mergedContext = this.context;
    if (context?.preserveFocus) {
      mergedContext = {
        ...this.context,
        preserveFocus: true
      };
    }
    return super.run(action, mergedContext);
  }
}
let EditorTabsControl = class extends Themable {
  constructor(parent, editorPartsView, groupsView, groupView, tabsModel, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorResolverService, hostService) {
    super(themeService);
    this.parent = parent;
    this.editorPartsView = editorPartsView;
    this.groupsView = groupsView;
    this.groupView = groupView;
    this.tabsModel = tabsModel;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.keybindingService = keybindingService;
    this.notificationService = notificationService;
    this.quickInputService = quickInputService;
    this.editorResolverService = editorResolverService;
    this.hostService = hostService;
    this.contextMenuContextKeyService = this._register(this.contextKeyService.createScoped(parent));
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, this.contextMenuContextKeyService]
    )));
    this.resourceContext = this._register(scopedInstantiationService.createInstance(ResourceContextKey));
    this.editorPinnedContext = ActiveEditorPinnedContext.bindTo(this.contextMenuContextKeyService);
    this.editorIsFirstContext = ActiveEditorFirstInGroupContext.bindTo(this.contextMenuContextKeyService);
    this.editorIsLastContext = ActiveEditorLastInGroupContext.bindTo(this.contextMenuContextKeyService);
    this.editorStickyContext = ActiveEditorStickyContext.bindTo(this.contextMenuContextKeyService);
    this.editorAvailableEditorIds = ActiveEditorAvailableEditorIdsContext.bindTo(this.contextMenuContextKeyService);
    this.editorCanSplitInGroupContext = ActiveEditorCanSplitInGroupContext.bindTo(this.contextMenuContextKeyService);
    this.sideBySideEditorContext = SideBySideEditorActiveContext.bindTo(this.contextMenuContextKeyService);
    this.groupLockedContext = ActiveEditorGroupLockedContext.bindTo(this.contextMenuContextKeyService);
    this.renderDropdownAsChildElement = false;
    this.tabsHoverDelegate = getDefaultHoverDelegate("mouse");
    this.create(parent);
  }
  editorTransfer = LocalSelectionTransfer.getInstance();
  groupTransfer = LocalSelectionTransfer.getInstance();
  treeItemsTransfer = LocalSelectionTransfer.getInstance();
  static EDITOR_TAB_HEIGHT = {
    normal: 35,
    compact: 22
  };
  editorActionsToolbarContainer;
  editorActionsToolbar;
  editorActionsToolbarDisposables = this._register(
    new DisposableStore()
  );
  editorActionsDisposables = this._register(
    new DisposableStore()
  );
  contextMenuContextKeyService;
  resourceContext;
  editorPinnedContext;
  editorIsFirstContext;
  editorIsLastContext;
  editorStickyContext;
  editorAvailableEditorIds;
  editorCanSplitInGroupContext;
  sideBySideEditorContext;
  groupLockedContext;
  renderDropdownAsChildElement;
  tabsHoverDelegate;
  create(parent) {
    this.updateTabHeight();
  }
  get editorActionsEnabled() {
    return this.groupsView.partOptions.editorActionsLocation === "default" && this.groupsView.partOptions.showTabs !== "none";
  }
  createEditorActionsToolBar(parent, classes) {
    this.editorActionsToolbarContainer = document.createElement("div");
    this.editorActionsToolbarContainer.classList.add(...classes);
    parent.appendChild(this.editorActionsToolbarContainer);
    this.handleEditorActionToolBarVisibility(
      this.editorActionsToolbarContainer
    );
  }
  handleEditorActionToolBarVisibility(container) {
    const editorActionsEnabled = this.editorActionsEnabled;
    const editorActionsVisible = !!this.editorActionsToolbar;
    if (editorActionsEnabled && !editorActionsVisible) {
      this.doCreateEditorActionsToolBar(container);
    } else if (!editorActionsEnabled && editorActionsVisible) {
      this.editorActionsToolbar?.getElement().remove();
      this.editorActionsToolbar = void 0;
      this.editorActionsToolbarDisposables.clear();
      this.editorActionsDisposables.clear();
    }
    container.classList.toggle("hidden", !editorActionsEnabled);
  }
  doCreateEditorActionsToolBar(container) {
    const context = { groupId: this.groupView.id };
    this.editorActionsToolbar = this.editorActionsToolbarDisposables.add(
      this.instantiationService.createInstance(
        WorkbenchToolBar,
        container,
        {
          actionViewItemProvider: (action, options) => this.actionViewItemProvider(action, options),
          orientation: ActionsOrientation.HORIZONTAL,
          ariaLabel: localize(
            "ariaLabelEditorActions",
            "Editor actions"
          ),
          getKeyBinding: (action) => this.getKeybinding(action),
          actionRunner: this.editorActionsToolbarDisposables.add(
            new EditorCommandsContextActionRunner(context)
          ),
          anchorAlignmentProvider: () => AnchorAlignment.RIGHT,
          renderDropdownAsChildElement: this.renderDropdownAsChildElement,
          telemetrySource: "editorPart",
          resetMenu: MenuId.EditorTitle,
          overflowBehavior: {
            maxItems: 9,
            exempted: EDITOR_CORE_NAVIGATION_COMMANDS
          },
          highlightToggledItems: true
        }
      )
    );
    this.editorActionsToolbar.context = context;
    this.editorActionsToolbarDisposables.add(
      this.editorActionsToolbar.actionRunner.onDidRun((e) => {
        if (e.error && !isCancellationError(e.error)) {
          this.notificationService.error(e.error);
        }
      })
    );
  }
  actionViewItemProvider(action, options) {
    const activeEditorPane = this.groupView.activeEditorPane;
    if (activeEditorPane instanceof EditorPane) {
      const result = activeEditorPane.getActionViewItem(action, options);
      if (result) {
        return result;
      }
    }
    return createActionViewItem(this.instantiationService, action, {
      ...options,
      menuAsChild: this.renderDropdownAsChildElement
    });
  }
  updateEditorActionsToolbar() {
    if (!this.editorActionsEnabled) {
      return;
    }
    this.editorActionsDisposables.clear();
    const editorActions = this.groupView.createEditorActions(
      this.editorActionsDisposables
    );
    this.editorActionsDisposables.add(
      editorActions.onDidChange(() => this.updateEditorActionsToolbar())
    );
    const editorActionsToolbar = assertIsDefined(this.editorActionsToolbar);
    const { primary, secondary } = this.prepareEditorActions(
      editorActions.actions
    );
    editorActionsToolbar.setActions(
      prepareActions(primary),
      prepareActions(secondary)
    );
  }
  getEditorPaneAwareContextKeyService() {
    return this.groupView.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
  }
  clearEditorActionsToolbar() {
    if (!this.editorActionsEnabled) {
      return;
    }
    const editorActionsToolbar = assertIsDefined(this.editorActionsToolbar);
    editorActionsToolbar.setActions([], []);
  }
  onGroupDragStart(e, element) {
    if (e.target !== element) {
      return false;
    }
    const isNewWindowOperation = this.isNewWindowOperation(e);
    this.groupTransfer.setData(
      [new DraggedEditorGroupIdentifier(this.groupView.id)],
      DraggedEditorGroupIdentifier.prototype
    );
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "copyMove";
    }
    let hasDataTransfer = false;
    if (this.groupsView.partOptions.showTabs === "multiple") {
      hasDataTransfer = this.doFillResourceDataTransfers(
        this.groupView.getEditors(EditorsOrder.SEQUENTIAL),
        e,
        isNewWindowOperation
      );
    } else if (this.groupView.activeEditor) {
      hasDataTransfer = this.doFillResourceDataTransfers(
        [this.groupView.activeEditor],
        e,
        isNewWindowOperation
      );
    }
    if (!hasDataTransfer && isFirefox) {
      e.dataTransfer?.setData(
        DataTransfers.TEXT,
        String(this.groupView.label)
      );
    }
    if (this.groupView.activeEditor) {
      let label = this.groupView.activeEditor.getName();
      if (this.groupsView.partOptions.showTabs === "multiple" && this.groupView.count > 1) {
        label = localize(
          "draggedEditorGroup",
          "{0} (+{1})",
          label,
          this.groupView.count - 1
        );
      }
      applyDragImage(
        e,
        label,
        "monaco-editor-group-drag-image",
        this.getColor(listActiveSelectionBackground),
        this.getColor(listActiveSelectionForeground)
      );
    }
    return isNewWindowOperation;
  }
  async onGroupDragEnd(e, previousDragEvent, element, isNewWindowOperation) {
    this.groupTransfer.clearData(DraggedEditorGroupIdentifier.prototype);
    if (e.target !== element || !isNewWindowOperation || isWindowDraggedOver()) {
      return;
    }
    const auxiliaryEditorPart = await this.maybeCreateAuxiliaryEditorPartAt(
      e,
      element
    );
    if (!auxiliaryEditorPart) {
      return;
    }
    const targetGroup = auxiliaryEditorPart.activeGroup;
    this.groupsView.mergeGroup(this.groupView, targetGroup.id, {
      mode: this.isMoveOperation(previousDragEvent ?? e, targetGroup.id) ? MergeGroupMode.MOVE_EDITORS : MergeGroupMode.COPY_EDITORS
    });
    targetGroup.focus();
  }
  async maybeCreateAuxiliaryEditorPartAt(e, offsetElement) {
    const { point, display } = await this.hostService.getCursorScreenPoint() ?? {
      point: { x: e.screenX, y: e.screenY }
    };
    const window = getActiveWindow();
    if (window.document.visibilityState === "visible" && window.document.hasFocus()) {
      if (point.x >= window.screenX && point.x <= window.screenX + window.outerWidth && point.y >= window.screenY && point.y <= window.screenY + window.outerHeight) {
        return;
      }
    }
    const offsetX = offsetElement.offsetWidth / 2;
    const offsetY = 30 + offsetElement.offsetHeight / 2;
    const bounds = {
      x: point.x - offsetX,
      y: point.y - offsetY
    };
    if (display) {
      if (bounds.x < display.x) {
        bounds.x = display.x;
      }
      if (bounds.y < display.y) {
        bounds.y = display.y;
      }
    }
    return this.editorPartsView.createAuxiliaryEditorPart({ bounds });
  }
  isNewWindowOperation(e) {
    if (this.groupsView.partOptions.dragToOpenWindow) {
      return !e.altKey;
    }
    return e.altKey;
  }
  isMoveOperation(e, sourceGroup, sourceEditor) {
    if (sourceEditor?.hasCapability(EditorInputCapabilities.Singleton)) {
      return true;
    }
    const isCopy = e.ctrlKey && !isMacintosh || e.altKey && isMacintosh;
    return !isCopy || sourceGroup === this.groupView.id;
  }
  doFillResourceDataTransfers(editors, e, disableStandardTransfer) {
    if (editors.length) {
      this.instantiationService.invokeFunction(
        fillEditorsDragData,
        editors.map((editor) => ({
          editor,
          groupId: this.groupView.id
        })),
        e,
        { disableStandardTransfer }
      );
      return true;
    }
    return false;
  }
  onTabContextMenu(editor, e, node) {
    this.resourceContext.set(
      EditorResourceAccessor.getOriginalUri(editor, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })
    );
    this.editorPinnedContext.set(this.tabsModel.isPinned(editor));
    this.editorIsFirstContext.set(this.tabsModel.isFirst(editor));
    this.editorIsLastContext.set(this.tabsModel.isLast(editor));
    this.editorStickyContext.set(this.tabsModel.isSticky(editor));
    this.groupLockedContext.set(this.tabsModel.isLocked);
    this.editorCanSplitInGroupContext.set(
      editor.hasCapability(EditorInputCapabilities.CanSplitInGroup)
    );
    this.sideBySideEditorContext.set(
      editor.typeId === SideBySideEditorInput.ID
    );
    applyAvailableEditorIds(
      this.editorAvailableEditorIds,
      editor,
      this.editorResolverService
    );
    let anchor = node;
    if (isMouseEvent(e)) {
      anchor = new StandardMouseEvent(getWindow(node), e);
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => anchor,
      menuId: MenuId.EditorTitleContext,
      menuActionOptions: {
        shouldForwardArgs: true,
        arg: this.resourceContext.get()
      },
      contextKeyService: this.contextMenuContextKeyService,
      getActionsContext: () => ({
        groupId: this.groupView.id,
        editorIndex: this.groupView.getIndexOfEditor(editor)
      }),
      getKeyBinding: (action) => this.keybindingService.lookupKeybinding(
        action.id,
        this.contextMenuContextKeyService
      ),
      onHide: () => this.groupsView.activeGroup.focus()
      // restore focus to active group
    });
  }
  getKeybinding(action) {
    return this.keybindingService.lookupKeybinding(
      action.id,
      this.getEditorPaneAwareContextKeyService()
    );
  }
  getKeybindingLabel(action) {
    const keybinding = this.getKeybinding(action);
    return keybinding ? keybinding.getLabel() ?? void 0 : void 0;
  }
  get tabHeight() {
    return this.groupsView.partOptions.tabHeight !== "compact" ? EditorTabsControl.EDITOR_TAB_HEIGHT.normal : EditorTabsControl.EDITOR_TAB_HEIGHT.compact;
  }
  getHoverTitle(editor) {
    return editor.getTitle(Verbosity.LONG);
  }
  getHoverDelegate() {
    return this.tabsHoverDelegate;
  }
  updateTabHeight() {
    this.parent.style.setProperty(
      "--editor-group-tab-height",
      `${this.tabHeight}px`
    );
  }
  updateOptions(oldOptions, newOptions) {
    if (oldOptions.tabHeight !== newOptions.tabHeight) {
      this.updateTabHeight();
    }
    if (oldOptions.editorActionsLocation !== newOptions.editorActionsLocation || oldOptions.showTabs !== newOptions.showTabs) {
      if (this.editorActionsToolbarContainer) {
        this.handleEditorActionToolBarVisibility(
          this.editorActionsToolbarContainer
        );
        this.updateEditorActionsToolbar();
      }
    }
  }
};
EditorTabsControl = __decorateClass([
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IQuickInputService),
  __decorateParam(11, IThemeService),
  __decorateParam(12, IEditorResolverService),
  __decorateParam(13, IHostService)
], EditorTabsControl);
export {
  EditorCommandsContextActionRunner,
  EditorTabsControl
};
