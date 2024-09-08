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
  $,
  Dimension,
  EventHelper,
  addDisposableGenericMouseDownListener,
  getActiveElement,
  getWindow,
  isAncestorOfActiveElement,
  isHTMLElement
} from "../../../../base/browser/dom.js";
import { CenteredViewLayout } from "../../../../base/browser/ui/centered/centeredViewLayout.js";
import {
  Direction,
  LayoutPriority,
  Orientation,
  SerializableGrid,
  Sizing,
  createSerializedGrid,
  isGridBranchNode,
  orthogonal
} from "../../../../base/browser/ui/grid/grid.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { coalesce, distinct } from "../../../../base/common/arrays.js";
import { DeferredPromise, Promises } from "../../../../base/common/async.js";
import { Color } from "../../../../base/common/color.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import {
  Emitter,
  Event,
  PauseableEmitter,
  Relay
} from "../../../../base/common/event.js";
import {
  DisposableStore,
  dispose,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import {
  assertIsDefined,
  assertType
} from "../../../../base/common/types.js";
import {
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import {
  contrastBorder,
  editorBackground
} from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  EditorPartMaximizedEditorGroupContext,
  EditorPartMultipleEditorGroupsContext,
  IsAuxiliaryEditorPartContext
} from "../../../common/contextkeys.js";
import {
  GroupModelChangeKind
} from "../../../common/editor.js";
import {
  isSerializedEditorGroupModel
} from "../../../common/editor/editorGroupModel.js";
import {
  EDITOR_GROUP_BORDER,
  EDITOR_PANE_BACKGROUND
} from "../../../common/theme.js";
import { findGroup } from "../../../services/editor/common/editorGroupFinder.js";
import {
  GroupDirection,
  GroupLocation,
  GroupOrientation,
  GroupsArrangement,
  GroupsOrder,
  MergeGroupMode
} from "../../../services/editor/common/editorGroupsService.js";
import { SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import {
  IWorkbenchLayoutService,
  Parts,
  Position
} from "../../../services/layout/browser/layoutService.js";
import { CompositeDragAndDropObserver } from "../../dnd.js";
import { Part } from "../../part.js";
import {
  getEditorPartOptions,
  impactsEditorPartOptions
} from "./editor.js";
import { EditorDropTarget } from "./editorDropTarget.js";
import { EditorGroupView } from "./editorGroupView.js";
class GridWidgetView {
  element = $(".grid-view-container");
  get minimumWidth() {
    return this.gridWidget ? this.gridWidget.minimumWidth : 0;
  }
  get maximumWidth() {
    return this.gridWidget ? this.gridWidget.maximumWidth : Number.POSITIVE_INFINITY;
  }
  get minimumHeight() {
    return this.gridWidget ? this.gridWidget.minimumHeight : 0;
  }
  get maximumHeight() {
    return this.gridWidget ? this.gridWidget.maximumHeight : Number.POSITIVE_INFINITY;
  }
  _onDidChange = new Relay();
  onDidChange = this._onDidChange.event;
  _gridWidget;
  get gridWidget() {
    return this._gridWidget;
  }
  set gridWidget(grid) {
    this.element.innerText = "";
    if (grid) {
      this.element.appendChild(grid.element);
      this._onDidChange.input = grid.onDidChange;
    } else {
      this._onDidChange.input = Event.None;
    }
    this._gridWidget = grid;
  }
  layout(width, height, top, left) {
    this.gridWidget?.layout(width, height, top, left);
  }
  dispose() {
    this._onDidChange.dispose();
  }
}
let EditorPart = class extends Part {
  constructor(editorPartsView, id, groupsLabel, windowId, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
    super(id, { hasTitle: false }, themeService, storageService, layoutService);
    this.editorPartsView = editorPartsView;
    this.groupsLabel = groupsLabel;
    this.windowId = windowId;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.hostService = hostService;
    this.contextKeyService = contextKeyService;
    this.registerListeners();
  }
  static EDITOR_PART_UI_STATE_STORAGE_KEY = "editorpart.state";
  static EDITOR_PART_CENTERED_VIEW_STORAGE_KEY = "editorpart.centeredview";
  //#region Events
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidLayout = this._register(new Emitter());
  onDidLayout = this._onDidLayout.event;
  _onDidChangeActiveGroup = this._register(
    new Emitter()
  );
  onDidChangeActiveGroup = this._onDidChangeActiveGroup.event;
  _onDidChangeGroupIndex = this._register(
    new Emitter()
  );
  onDidChangeGroupIndex = this._onDidChangeGroupIndex.event;
  _onDidChangeGroupLabel = this._register(
    new Emitter()
  );
  onDidChangeGroupLabel = this._onDidChangeGroupLabel.event;
  _onDidChangeGroupLocked = this._register(
    new Emitter()
  );
  onDidChangeGroupLocked = this._onDidChangeGroupLocked.event;
  _onDidChangeGroupMaximized = this._register(
    new Emitter()
  );
  onDidChangeGroupMaximized = this._onDidChangeGroupMaximized.event;
  _onDidActivateGroup = this._register(
    new Emitter()
  );
  onDidActivateGroup = this._onDidActivateGroup.event;
  _onDidAddGroup = this._register(
    new PauseableEmitter()
  );
  onDidAddGroup = this._onDidAddGroup.event;
  _onDidRemoveGroup = this._register(
    new PauseableEmitter()
  );
  onDidRemoveGroup = this._onDidRemoveGroup.event;
  _onDidMoveGroup = this._register(
    new Emitter()
  );
  onDidMoveGroup = this._onDidMoveGroup.event;
  onDidSetGridWidget = this._register(
    new Emitter()
  );
  _onDidChangeSizeConstraints = this._register(
    new Relay()
  );
  onDidChangeSizeConstraints = Event.any(
    this.onDidSetGridWidget.event,
    this._onDidChangeSizeConstraints.event
  );
  _onDidScroll = this._register(new Relay());
  onDidScroll = Event.any(
    this.onDidSetGridWidget.event,
    this._onDidScroll.event
  );
  _onDidChangeEditorPartOptions = this._register(
    new Emitter()
  );
  onDidChangeEditorPartOptions = this._onDidChangeEditorPartOptions.event;
  _onWillDispose = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  //#endregion
  workspaceMemento = this.getMemento(
    StorageScope.WORKSPACE,
    StorageTarget.USER
  );
  profileMemento = this.getMemento(
    StorageScope.PROFILE,
    StorageTarget.MACHINE
  );
  groupViews = /* @__PURE__ */ new Map();
  mostRecentActiveGroups = [];
  container;
  scopedInstantiationService;
  centeredLayoutWidget;
  gridWidget;
  gridWidgetDisposables = this._register(
    new DisposableStore()
  );
  gridWidgetView = this._register(
    new GridWidgetView()
  );
  registerListeners() {
    this._register(
      this.configurationService.onDidChangeConfiguration(
        (e) => this.onConfigurationUpdated(e)
      )
    );
    this._register(
      this.themeService.onDidFileIconThemeChange(
        () => this.handleChangedPartOptions()
      )
    );
    this._register(
      this.onDidChangeMementoValue(
        StorageScope.WORKSPACE,
        this._store
      )((e) => this.onDidChangeMementoState(e))
    );
  }
  onConfigurationUpdated(event) {
    if (impactsEditorPartOptions(event)) {
      this.handleChangedPartOptions();
    }
  }
  handleChangedPartOptions() {
    const oldPartOptions = this._partOptions;
    const newPartOptions = getEditorPartOptions(
      this.configurationService,
      this.themeService
    );
    for (const enforcedPartOptions of this.enforcedPartOptions) {
      Object.assign(newPartOptions, enforcedPartOptions);
    }
    this._partOptions = newPartOptions;
    this._onDidChangeEditorPartOptions.fire({
      oldPartOptions,
      newPartOptions
    });
  }
  enforcedPartOptions = [];
  _partOptions = getEditorPartOptions(
    this.configurationService,
    this.themeService
  );
  get partOptions() {
    return this._partOptions;
  }
  enforcePartOptions(options) {
    this.enforcedPartOptions.push(options);
    this.handleChangedPartOptions();
    return toDisposable(() => {
      this.enforcedPartOptions.splice(
        this.enforcedPartOptions.indexOf(options),
        1
      );
      this.handleChangedPartOptions();
    });
  }
  top = 0;
  left = 0;
  _contentDimension;
  get contentDimension() {
    return this._contentDimension;
  }
  _activeGroup;
  get activeGroup() {
    return this._activeGroup;
  }
  sideGroup = {
    openEditor: (editor, options) => {
      const [group] = this.scopedInstantiationService.invokeFunction(
        (accessor) => findGroup(accessor, { editor, options }, SIDE_GROUP)
      );
      return group.openEditor(editor, options);
    }
  };
  get groups() {
    return Array.from(this.groupViews.values());
  }
  get count() {
    return this.groupViews.size;
  }
  get orientation() {
    return this.gridWidget && this.gridWidget.orientation === Orientation.VERTICAL ? GroupOrientation.VERTICAL : GroupOrientation.HORIZONTAL;
  }
  _isReady = false;
  get isReady() {
    return this._isReady;
  }
  whenReadyPromise = new DeferredPromise();
  whenReady = this.whenReadyPromise.p;
  whenRestoredPromise = new DeferredPromise();
  whenRestored = this.whenRestoredPromise.p;
  get hasRestorableState() {
    return !!this.workspaceMemento[EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY];
  }
  _willRestoreState = false;
  get willRestoreState() {
    return this._willRestoreState;
  }
  getGroups(order = GroupsOrder.CREATION_TIME) {
    switch (order) {
      case GroupsOrder.CREATION_TIME:
        return this.groups;
      case GroupsOrder.MOST_RECENTLY_ACTIVE: {
        const mostRecentActive = coalesce(
          this.mostRecentActiveGroups.map(
            (groupId) => this.getGroup(groupId)
          )
        );
        return distinct([...mostRecentActive, ...this.groups]);
      }
      case GroupsOrder.GRID_APPEARANCE: {
        const views = [];
        if (this.gridWidget) {
          this.fillGridNodes(views, this.gridWidget.getViews());
        }
        return views;
      }
    }
  }
  fillGridNodes(target, node) {
    if (isGridBranchNode(node)) {
      node.children.forEach((child) => this.fillGridNodes(target, child));
    } else {
      target.push(node.view);
    }
  }
  hasGroup(identifier) {
    return this.groupViews.has(identifier);
  }
  getGroup(identifier) {
    return this.groupViews.get(identifier);
  }
  findGroup(scope, source = this.activeGroup, wrap) {
    if (typeof scope.direction === "number") {
      return this.doFindGroupByDirection(scope.direction, source, wrap);
    }
    if (typeof scope.location === "number") {
      return this.doFindGroupByLocation(scope.location, source, wrap);
    }
    throw new Error("invalid arguments");
  }
  doFindGroupByDirection(direction, source, wrap) {
    const sourceGroupView = this.assertGroupView(source);
    const neighbours = this.gridWidget.getNeighborViews(
      sourceGroupView,
      this.toGridViewDirection(direction),
      wrap
    );
    neighbours.sort(
      (n1, n2) => this.mostRecentActiveGroups.indexOf(n1.id) - this.mostRecentActiveGroups.indexOf(n2.id)
    );
    return neighbours[0];
  }
  doFindGroupByLocation(location, source, wrap) {
    const sourceGroupView = this.assertGroupView(source);
    const groups = this.getGroups(GroupsOrder.GRID_APPEARANCE);
    const index = groups.indexOf(sourceGroupView);
    switch (location) {
      case GroupLocation.FIRST:
        return groups[0];
      case GroupLocation.LAST:
        return groups[groups.length - 1];
      case GroupLocation.NEXT: {
        let nextGroup = groups[index + 1];
        if (!nextGroup && wrap) {
          nextGroup = this.doFindGroupByLocation(
            GroupLocation.FIRST,
            source
          );
        }
        return nextGroup;
      }
      case GroupLocation.PREVIOUS: {
        let previousGroup = groups[index - 1];
        if (!previousGroup && wrap) {
          previousGroup = this.doFindGroupByLocation(
            GroupLocation.LAST,
            source
          );
        }
        return previousGroup;
      }
    }
  }
  activateGroup(group, preserveWindowOrder) {
    const groupView = this.assertGroupView(group);
    this.doSetGroupActive(groupView);
    if (!preserveWindowOrder) {
      this.hostService.moveTop(getWindow(this.element));
    }
    return groupView;
  }
  restoreGroup(group) {
    const groupView = this.assertGroupView(group);
    this.doRestoreGroup(groupView);
    return groupView;
  }
  getSize(group) {
    const groupView = this.assertGroupView(group);
    return this.gridWidget.getViewSize(groupView);
  }
  setSize(group, size) {
    const groupView = this.assertGroupView(group);
    this.gridWidget.resizeView(groupView, size);
  }
  arrangeGroups(arrangement, target = this.activeGroup) {
    if (this.count < 2) {
      return;
    }
    if (!this.gridWidget) {
      return;
    }
    const groupView = this.assertGroupView(target);
    switch (arrangement) {
      case GroupsArrangement.EVEN:
        this.gridWidget.distributeViewSizes();
        break;
      case GroupsArrangement.MAXIMIZE:
        if (this.groups.length < 2) {
          return;
        }
        this.gridWidget.maximizeView(groupView);
        groupView.focus();
        break;
      case GroupsArrangement.EXPAND:
        this.gridWidget.expandView(groupView);
        break;
    }
  }
  toggleMaximizeGroup(target = this.activeGroup) {
    if (this.hasMaximizedGroup()) {
      this.unmaximizeGroup();
    } else {
      this.arrangeGroups(GroupsArrangement.MAXIMIZE, target);
    }
  }
  toggleExpandGroup(target = this.activeGroup) {
    if (this.isGroupExpanded(this.activeGroup)) {
      this.arrangeGroups(GroupsArrangement.EVEN);
    } else {
      this.arrangeGroups(GroupsArrangement.EXPAND, target);
    }
  }
  unmaximizeGroup() {
    this.gridWidget.exitMaximizedView();
    this._activeGroup.focus();
  }
  hasMaximizedGroup() {
    return this.gridWidget.hasMaximizedView();
  }
  isGroupMaximized(targetGroup) {
    return this.gridWidget.isViewMaximized(targetGroup);
  }
  isGroupExpanded(targetGroup) {
    return this.gridWidget.isViewExpanded(targetGroup);
  }
  setGroupOrientation(orientation) {
    if (!this.gridWidget) {
      return;
    }
    const newOrientation = orientation === GroupOrientation.HORIZONTAL ? Orientation.HORIZONTAL : Orientation.VERTICAL;
    if (this.gridWidget.orientation !== newOrientation) {
      this.gridWidget.orientation = newOrientation;
    }
  }
  applyLayout(layout) {
    const restoreFocus = this.shouldRestoreFocus(this.container);
    let layoutGroupsCount = 0;
    function countGroups(groups) {
      for (const group of groups) {
        if (Array.isArray(group.groups)) {
          countGroups(group.groups);
        } else {
          layoutGroupsCount++;
        }
      }
    }
    countGroups(layout.groups);
    let currentGroupViews = this.getGroups(GroupsOrder.GRID_APPEARANCE);
    if (layoutGroupsCount < currentGroupViews.length) {
      const lastGroupInLayout = currentGroupViews[layoutGroupsCount - 1];
      currentGroupViews.forEach((group, index) => {
        if (index >= layoutGroupsCount) {
          this.mergeGroup(group, lastGroupInLayout);
        }
      });
      currentGroupViews = this.getGroups(GroupsOrder.GRID_APPEARANCE);
    }
    const activeGroup = this.activeGroup;
    const gridDescriptor = createSerializedGrid({
      orientation: this.toGridViewOrientation(
        layout.orientation,
        this.isTwoDimensionalGrid() ? this.gridWidget.orientation : (
          // preserve original orientation for 2-dimensional grids
          orthogonal(this.gridWidget.orientation)
        )
        // otherwise flip (fix https://github.com/microsoft/vscode/issues/52975)
      ),
      groups: layout.groups
    });
    this.doApplyGridState(
      gridDescriptor,
      activeGroup.id,
      currentGroupViews
    );
    if (restoreFocus) {
      this._activeGroup.focus();
    }
  }
  getLayout() {
    const serializedGrid = this.gridWidget.serialize();
    const orientation = serializedGrid.orientation === Orientation.HORIZONTAL ? GroupOrientation.HORIZONTAL : GroupOrientation.VERTICAL;
    const root = this.serializedNodeToGroupLayoutArgument(
      serializedGrid.root
    );
    return {
      orientation,
      groups: root.groups
    };
  }
  serializedNodeToGroupLayoutArgument(serializedNode) {
    if (serializedNode.type === "branch") {
      return {
        size: serializedNode.size,
        groups: serializedNode.data.map(
          (node) => this.serializedNodeToGroupLayoutArgument(node)
        )
      };
    }
    return { size: serializedNode.size };
  }
  shouldRestoreFocus(target) {
    if (!target) {
      return false;
    }
    const activeElement = getActiveElement();
    if (activeElement === target.ownerDocument.body) {
      return true;
    }
    return isAncestorOfActiveElement(target);
  }
  isTwoDimensionalGrid() {
    const views = this.gridWidget.getViews();
    if (isGridBranchNode(views)) {
      return views.children.some((child) => isGridBranchNode(child));
    }
    return false;
  }
  addGroup(location, direction, groupToCopy) {
    const locationView = this.assertGroupView(location);
    let newGroupView;
    if (locationView.groupsView === this) {
      const restoreFocus = this.shouldRestoreFocus(locationView.element);
      const shouldExpand = this.groupViews.size > 1 && this.isGroupExpanded(locationView);
      newGroupView = this.doCreateGroupView(groupToCopy);
      this.gridWidget.addView(
        newGroupView,
        this.getSplitSizingStyle(),
        locationView,
        this.toGridViewDirection(direction)
      );
      this.updateContainer();
      this._onDidAddGroup.fire(newGroupView);
      this.notifyGroupIndexChange();
      if (shouldExpand) {
        this.arrangeGroups(GroupsArrangement.EXPAND, newGroupView);
      }
      if (restoreFocus) {
        locationView.focus();
      }
    } else {
      newGroupView = locationView.groupsView.addGroup(
        locationView,
        direction,
        groupToCopy
      );
    }
    return newGroupView;
  }
  getSplitSizingStyle() {
    switch (this._partOptions.splitSizing) {
      case "distribute":
        return Sizing.Distribute;
      case "split":
        return Sizing.Split;
      default:
        return Sizing.Auto;
    }
  }
  doCreateGroupView(from, options) {
    let groupView;
    if (from instanceof EditorGroupView) {
      groupView = EditorGroupView.createCopy(
        from,
        this.editorPartsView,
        this,
        this.groupsLabel,
        this.count,
        this.scopedInstantiationService,
        options
      );
    } else if (isSerializedEditorGroupModel(from)) {
      groupView = EditorGroupView.createFromSerialized(
        from,
        this.editorPartsView,
        this,
        this.groupsLabel,
        this.count,
        this.scopedInstantiationService,
        options
      );
    } else {
      groupView = EditorGroupView.createNew(
        this.editorPartsView,
        this,
        this.groupsLabel,
        this.count,
        this.scopedInstantiationService,
        options
      );
    }
    this.groupViews.set(groupView.id, groupView);
    const groupDisposables = new DisposableStore();
    groupDisposables.add(
      groupView.onDidFocus(() => {
        this.doSetGroupActive(groupView);
        this._onDidFocus.fire();
      })
    );
    groupDisposables.add(
      groupView.onDidModelChange((e) => {
        switch (e.kind) {
          case GroupModelChangeKind.GROUP_LOCKED:
            this._onDidChangeGroupLocked.fire(groupView);
            break;
          case GroupModelChangeKind.GROUP_INDEX:
            this._onDidChangeGroupIndex.fire(groupView);
            break;
          case GroupModelChangeKind.GROUP_LABEL:
            this._onDidChangeGroupLabel.fire(groupView);
            break;
        }
      })
    );
    groupDisposables.add(
      groupView.onDidActiveEditorChange(() => {
        this.updateContainer();
      })
    );
    Event.once(groupView.onWillDispose)(() => {
      dispose(groupDisposables);
      this.groupViews.delete(groupView.id);
      this.doUpdateMostRecentActive(groupView);
    });
    return groupView;
  }
  doSetGroupActive(group) {
    if (this._activeGroup !== group) {
      const previousActiveGroup = this._activeGroup;
      this._activeGroup = group;
      this.doUpdateMostRecentActive(group, true);
      if (previousActiveGroup && !previousActiveGroup.disposed) {
        previousActiveGroup.setActive(false);
      }
      group.setActive(true);
      this.doRestoreGroup(group);
      this._onDidChangeActiveGroup.fire(group);
    }
    this._onDidActivateGroup.fire(group);
  }
  doRestoreGroup(group) {
    if (!this.gridWidget) {
      return;
    }
    if (this.hasMaximizedGroup() && !this.isGroupMaximized(group)) {
      this.unmaximizeGroup();
    }
    try {
      const viewSize = this.gridWidget.getViewSize(group);
      if (viewSize.width === group.minimumWidth || viewSize.height === group.minimumHeight) {
        this.arrangeGroups(GroupsArrangement.EXPAND, group);
      }
    } catch (error) {
    }
  }
  doUpdateMostRecentActive(group, makeMostRecentlyActive) {
    const index = this.mostRecentActiveGroups.indexOf(group.id);
    if (index !== -1) {
      this.mostRecentActiveGroups.splice(index, 1);
    }
    if (makeMostRecentlyActive) {
      this.mostRecentActiveGroups.unshift(group.id);
    }
  }
  toGridViewDirection(direction) {
    switch (direction) {
      case GroupDirection.UP:
        return Direction.Up;
      case GroupDirection.DOWN:
        return Direction.Down;
      case GroupDirection.LEFT:
        return Direction.Left;
      case GroupDirection.RIGHT:
        return Direction.Right;
    }
  }
  toGridViewOrientation(orientation, fallback) {
    if (typeof orientation === "number") {
      return orientation === GroupOrientation.HORIZONTAL ? Orientation.HORIZONTAL : Orientation.VERTICAL;
    }
    return fallback;
  }
  removeGroup(group, preserveFocus) {
    const groupView = this.assertGroupView(group);
    if (this.count === 1) {
      return;
    }
    if (groupView.isEmpty) {
      this.doRemoveEmptyGroup(groupView, preserveFocus);
    } else {
      this.doRemoveGroupWithEditors(groupView);
    }
  }
  doRemoveGroupWithEditors(groupView) {
    const mostRecentlyActiveGroups = this.getGroups(
      GroupsOrder.MOST_RECENTLY_ACTIVE
    );
    let lastActiveGroup;
    if (this._activeGroup === groupView) {
      lastActiveGroup = mostRecentlyActiveGroups[1];
    } else {
      lastActiveGroup = mostRecentlyActiveGroups[0];
    }
    this.mergeGroup(groupView, lastActiveGroup);
  }
  doRemoveEmptyGroup(groupView, preserveFocus) {
    const restoreFocus = !preserveFocus && this.shouldRestoreFocus(this.container);
    if (this._activeGroup === groupView) {
      const mostRecentlyActiveGroups = this.getGroups(
        GroupsOrder.MOST_RECENTLY_ACTIVE
      );
      const nextActiveGroup = mostRecentlyActiveGroups[1];
      this.doSetGroupActive(nextActiveGroup);
    }
    this.gridWidget.removeView(groupView, this.getSplitSizingStyle());
    groupView.dispose();
    if (restoreFocus) {
      this._activeGroup.focus();
    }
    this.notifyGroupIndexChange();
    this.updateContainer();
    this._onDidRemoveGroup.fire(groupView);
  }
  moveGroup(group, location, direction) {
    const sourceView = this.assertGroupView(group);
    const targetView = this.assertGroupView(location);
    if (sourceView.id === targetView.id) {
      throw new Error("Cannot move group into its own");
    }
    const restoreFocus = this.shouldRestoreFocus(sourceView.element);
    let movedView;
    if (sourceView.groupsView === targetView.groupsView) {
      this.gridWidget.moveView(
        sourceView,
        this.getSplitSizingStyle(),
        targetView,
        this.toGridViewDirection(direction)
      );
      movedView = sourceView;
    } else {
      movedView = targetView.groupsView.addGroup(
        targetView,
        direction,
        sourceView
      );
      sourceView.closeAllEditors();
      this.removeGroup(sourceView, restoreFocus);
    }
    if (restoreFocus) {
      movedView.focus();
    }
    this._onDidMoveGroup.fire(movedView);
    this.notifyGroupIndexChange();
    return movedView;
  }
  copyGroup(group, location, direction) {
    const groupView = this.assertGroupView(group);
    const locationView = this.assertGroupView(location);
    const restoreFocus = this.shouldRestoreFocus(groupView.element);
    const copiedGroupView = this.addGroup(
      locationView,
      direction,
      groupView
    );
    if (restoreFocus) {
      copiedGroupView.focus();
    }
    return copiedGroupView;
  }
  mergeGroup(group, target, options) {
    const sourceView = this.assertGroupView(group);
    const targetView = this.assertGroupView(target);
    const editors = [];
    let index = options && typeof options.index === "number" ? options.index : targetView.count;
    for (const editor of sourceView.editors) {
      const inactive = !sourceView.isActive(editor) || this._activeGroup !== sourceView;
      const sticky = sourceView.isSticky(editor);
      const options2 = {
        index: sticky ? void 0 : index,
        inactive,
        preserveFocus: inactive
      };
      editors.push({ editor, options: options2 });
      index++;
    }
    let result = true;
    if (options?.mode === MergeGroupMode.COPY_EDITORS) {
      sourceView.copyEditors(editors, targetView);
    } else {
      result = sourceView.moveEditors(editors, targetView);
    }
    if (sourceView.isEmpty && !sourceView.disposed) {
      this.removeGroup(sourceView, true);
    }
    return result;
  }
  mergeAllGroups(target) {
    const targetView = this.assertGroupView(target);
    let result = true;
    for (const group of this.getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE)) {
      if (group === targetView) {
        continue;
      }
      const merged = this.mergeGroup(group, targetView);
      if (!merged) {
        result = false;
      }
    }
    return result;
  }
  assertGroupView(group) {
    let groupView;
    if (typeof group === "number") {
      groupView = this.editorPartsView.getGroup(group);
    } else {
      groupView = group;
    }
    if (!groupView) {
      throw new Error("Invalid editor group provided!");
    }
    return groupView;
  }
  createEditorDropTarget(container, delegate) {
    assertType(isHTMLElement(container));
    return this.scopedInstantiationService.createInstance(
      EditorDropTarget,
      container,
      delegate
    );
  }
  //#region Part
  // TODO @sbatten @joao find something better to prevent editor taking over #79897
  get minimumWidth() {
    return Math.min(
      this.centeredLayoutWidget.minimumWidth,
      this.layoutService.getMaximumEditorDimensions(
        this.layoutService.getContainer(getWindow(this.container))
      ).width
    );
  }
  get maximumWidth() {
    return this.centeredLayoutWidget.maximumWidth;
  }
  get minimumHeight() {
    return Math.min(
      this.centeredLayoutWidget.minimumHeight,
      this.layoutService.getMaximumEditorDimensions(
        this.layoutService.getContainer(getWindow(this.container))
      ).height
    );
  }
  get maximumHeight() {
    return this.centeredLayoutWidget.maximumHeight;
  }
  get snap() {
    return this.layoutService.getPanelAlignment() === "center";
  }
  get onDidChange() {
    return Event.any(
      this.centeredLayoutWidget.onDidChange,
      this.onDidSetGridWidget.event
    );
  }
  priority = LayoutPriority.High;
  get gridSeparatorBorder() {
    return this.theme.getColor(EDITOR_GROUP_BORDER) || this.theme.getColor(contrastBorder) || Color.transparent;
  }
  updateStyles() {
    const container = assertIsDefined(this.container);
    container.style.backgroundColor = this.getColor(editorBackground) || "";
    const separatorBorderStyle = {
      separatorBorder: this.gridSeparatorBorder,
      background: this.theme.getColor(EDITOR_PANE_BACKGROUND) || Color.transparent
    };
    this.gridWidget.style(separatorBorderStyle);
    this.centeredLayoutWidget.styles(separatorBorderStyle);
  }
  createContentArea(parent, options) {
    this.element = parent;
    this.container = document.createElement("div");
    this.container.classList.add("content");
    if (this.windowId !== mainWindow.vscodeWindowId) {
      this.container.classList.add("auxiliary");
    }
    parent.appendChild(this.container);
    const scopedContextKeyService = this._register(
      this.contextKeyService.createScoped(this.container)
    );
    this.scopedInstantiationService = this._register(
      this.instantiationService.createChild(
        new ServiceCollection([
          IContextKeyService,
          scopedContextKeyService
        ])
      )
    );
    this._willRestoreState = !options || options.restorePreviousState;
    this.doCreateGridControl();
    this.centeredLayoutWidget = this._register(
      new CenteredViewLayout(
        this.container,
        this.gridWidgetView,
        this.profileMemento[EditorPart.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY],
        this._partOptions.centeredLayoutFixedWidth
      )
    );
    this._register(
      this.onDidChangeEditorPartOptions(
        (e) => this.centeredLayoutWidget.setFixedWidth(
          e.newPartOptions.centeredLayoutFixedWidth ?? false
        )
      )
    );
    this.setupDragAndDropSupport(parent, this.container);
    this.handleContextKeys(scopedContextKeyService);
    this.whenReadyPromise.complete();
    this._isReady = true;
    Promises.settled(
      this.groups.map((group) => group.whenRestored)
    ).finally(() => {
      this.whenRestoredPromise.complete();
    });
    return this.container;
  }
  handleContextKeys(contextKeyService) {
    const isAuxiliaryEditorPartContext = IsAuxiliaryEditorPartContext.bindTo(contextKeyService);
    isAuxiliaryEditorPartContext.set(
      this.windowId !== mainWindow.vscodeWindowId
    );
    const multipleEditorGroupsContext = EditorPartMultipleEditorGroupsContext.bindTo(contextKeyService);
    const maximizedEditorGroupContext = EditorPartMaximizedEditorGroupContext.bindTo(contextKeyService);
    const updateContextKeys = () => {
      const groupCount = this.count;
      if (groupCount > 1) {
        multipleEditorGroupsContext.set(true);
      } else {
        multipleEditorGroupsContext.reset();
      }
      if (this.hasMaximizedGroup()) {
        maximizedEditorGroupContext.set(true);
      } else {
        maximizedEditorGroupContext.reset();
      }
    };
    updateContextKeys();
    this._register(this.onDidAddGroup(() => updateContextKeys()));
    this._register(this.onDidRemoveGroup(() => updateContextKeys()));
    this._register(
      this.onDidChangeGroupMaximized(() => updateContextKeys())
    );
  }
  setupDragAndDropSupport(parent, container) {
    this._register(
      this.createEditorDropTarget(container, /* @__PURE__ */ Object.create(null))
    );
    const overlay = document.createElement("div");
    overlay.classList.add("drop-block-overlay");
    parent.appendChild(overlay);
    this._register(
      addDisposableGenericMouseDownListener(
        overlay,
        () => overlay.classList.remove("visible")
      )
    );
    this._register(
      CompositeDragAndDropObserver.INSTANCE.registerTarget(this.element, {
        onDragStart: (e) => overlay.classList.add("visible"),
        onDragEnd: (e) => overlay.classList.remove("visible")
      })
    );
    let horizontalOpenerTimeout;
    let verticalOpenerTimeout;
    let lastOpenHorizontalPosition;
    let lastOpenVerticalPosition;
    const openPartAtPosition = (position) => {
      if (!this.layoutService.isVisible(Parts.PANEL_PART) && position === this.layoutService.getPanelPosition()) {
        this.layoutService.setPartHidden(false, Parts.PANEL_PART);
      } else if (!this.layoutService.isVisible(Parts.AUXILIARYBAR_PART) && position === (this.layoutService.getSideBarPosition() === Position.RIGHT ? Position.LEFT : Position.RIGHT)) {
        this.layoutService.setPartHidden(
          false,
          Parts.AUXILIARYBAR_PART
        );
      }
    };
    const clearAllTimeouts = () => {
      if (horizontalOpenerTimeout) {
        clearTimeout(horizontalOpenerTimeout);
        horizontalOpenerTimeout = void 0;
      }
      if (verticalOpenerTimeout) {
        clearTimeout(verticalOpenerTimeout);
        verticalOpenerTimeout = void 0;
      }
    };
    this._register(
      CompositeDragAndDropObserver.INSTANCE.registerTarget(overlay, {
        onDragOver: (e) => {
          EventHelper.stop(e.eventData, true);
          if (e.eventData.dataTransfer) {
            e.eventData.dataTransfer.dropEffect = "none";
          }
          const boundingRect = overlay.getBoundingClientRect();
          let openHorizontalPosition;
          let openVerticalPosition;
          const proximity = 100;
          if (e.eventData.clientX < boundingRect.left + proximity) {
            openHorizontalPosition = Position.LEFT;
          }
          if (e.eventData.clientX > boundingRect.right - proximity) {
            openHorizontalPosition = Position.RIGHT;
          }
          if (e.eventData.clientY > boundingRect.bottom - proximity) {
            openVerticalPosition = Position.BOTTOM;
          }
          if (e.eventData.clientY < boundingRect.top + proximity) {
            openVerticalPosition = Position.TOP;
          }
          if (horizontalOpenerTimeout && openHorizontalPosition !== lastOpenHorizontalPosition) {
            clearTimeout(horizontalOpenerTimeout);
            horizontalOpenerTimeout = void 0;
          }
          if (verticalOpenerTimeout && openVerticalPosition !== lastOpenVerticalPosition) {
            clearTimeout(verticalOpenerTimeout);
            verticalOpenerTimeout = void 0;
          }
          if (!horizontalOpenerTimeout && openHorizontalPosition !== void 0) {
            lastOpenHorizontalPosition = openHorizontalPosition;
            horizontalOpenerTimeout = setTimeout(
              () => openPartAtPosition(openHorizontalPosition),
              200
            );
          }
          if (!verticalOpenerTimeout && openVerticalPosition !== void 0) {
            lastOpenVerticalPosition = openVerticalPosition;
            verticalOpenerTimeout = setTimeout(
              () => openPartAtPosition(openVerticalPosition),
              200
            );
          }
        },
        onDragLeave: () => clearAllTimeouts(),
        onDragEnd: () => clearAllTimeouts(),
        onDrop: () => clearAllTimeouts()
      })
    );
  }
  centerLayout(active) {
    this.centeredLayoutWidget.activate(active);
    this._activeGroup.focus();
  }
  isLayoutCentered() {
    if (this.centeredLayoutWidget) {
      return this.centeredLayoutWidget.isActive();
    }
    return false;
  }
  doCreateGridControl() {
    let restoreError = false;
    if (this._willRestoreState) {
      restoreError = !this.doCreateGridControlWithPreviousState();
    }
    if (!this.gridWidget || restoreError) {
      const initialGroup = this.doCreateGroupView();
      this.doSetGridWidget(new SerializableGrid(initialGroup));
      this.doSetGroupActive(initialGroup);
    }
    this.updateContainer();
    this.notifyGroupIndexChange();
  }
  doCreateGridControlWithPreviousState() {
    const state = this.loadState();
    if (state?.serializedGrid) {
      try {
        this.mostRecentActiveGroups = state.mostRecentActiveGroups;
        this.doCreateGridControlWithState(
          state.serializedGrid,
          state.activeGroup
        );
      } catch (error) {
        onUnexpectedError(
          new Error(
            `Error restoring editor grid widget: ${error} (with state: ${JSON.stringify(state)})`
          )
        );
        this.disposeGroups();
        return false;
      }
    }
    return true;
  }
  doCreateGridControlWithState(serializedGrid, activeGroupId, editorGroupViewsToReuse, options) {
    let reuseGroupViews;
    if (editorGroupViewsToReuse) {
      reuseGroupViews = editorGroupViewsToReuse.slice(0);
    } else {
      reuseGroupViews = [];
    }
    const groupViews = [];
    const gridWidget = SerializableGrid.deserialize(
      serializedGrid,
      {
        fromJSON: (serializedEditorGroup) => {
          let groupView;
          if (reuseGroupViews.length > 0) {
            groupView = reuseGroupViews.shift();
          } else {
            groupView = this.doCreateGroupView(
              serializedEditorGroup,
              options
            );
          }
          groupViews.push(groupView);
          if (groupView.id === activeGroupId) {
            this.doSetGroupActive(groupView);
          }
          return groupView;
        }
      },
      { styles: { separatorBorder: this.gridSeparatorBorder } }
    );
    if (!this._activeGroup) {
      this.doSetGroupActive(groupViews[0]);
    }
    if (this.mostRecentActiveGroups.some(
      (groupId) => !this.getGroup(groupId)
    )) {
      this.mostRecentActiveGroups = groupViews.map((group) => group.id);
    }
    this.doSetGridWidget(gridWidget);
  }
  doSetGridWidget(gridWidget) {
    let boundarySashes = {};
    if (this.gridWidget) {
      boundarySashes = this.gridWidget.boundarySashes;
      this.gridWidget.dispose();
    }
    this.gridWidget = gridWidget;
    this.gridWidget.boundarySashes = boundarySashes;
    this.gridWidgetView.gridWidget = gridWidget;
    this._onDidChangeSizeConstraints.input = gridWidget.onDidChange;
    this._onDidScroll.input = gridWidget.onDidScroll;
    this.gridWidgetDisposables.clear();
    this.gridWidgetDisposables.add(
      gridWidget.onDidChangeViewMaximized(
        (maximized) => this._onDidChangeGroupMaximized.fire(maximized)
      )
    );
    this._onDidChangeGroupMaximized.fire(this.hasMaximizedGroup());
    this.onDidSetGridWidget.fire(void 0);
  }
  updateContainer() {
    const container = assertIsDefined(this.container);
    container.classList.toggle("empty", this.isEmpty);
  }
  notifyGroupIndexChange() {
    this.getGroups(GroupsOrder.GRID_APPEARANCE).forEach(
      (group, index) => group.notifyIndexChanged(index)
    );
  }
  notifyGroupsLabelChange(newLabel) {
    for (const group of this.groups) {
      group.notifyLabelChanged(newLabel);
    }
  }
  get isEmpty() {
    return this.count === 1 && this._activeGroup.isEmpty;
  }
  setBoundarySashes(sashes) {
    this.gridWidget.boundarySashes = sashes;
    this.centeredLayoutWidget.boundarySashes = sashes;
  }
  layout(width, height, top, left) {
    this.top = top;
    this.left = left;
    const contentAreaSize = super.layoutContents(width, height).contentSize;
    this.doLayout(Dimension.lift(contentAreaSize), top, left);
  }
  doLayout(dimension, top = this.top, left = this.left) {
    this._contentDimension = dimension;
    this.centeredLayoutWidget.layout(
      this._contentDimension.width,
      this._contentDimension.height,
      top,
      left
    );
    this._onDidLayout.fire(dimension);
  }
  saveState() {
    if (this.gridWidget) {
      if (this.isEmpty) {
        delete this.workspaceMemento[EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY];
      } else {
        this.workspaceMemento[EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY] = this.createState();
      }
    }
    if (this.centeredLayoutWidget) {
      const centeredLayoutState = this.centeredLayoutWidget.state;
      if (this.centeredLayoutWidget.isDefault(centeredLayoutState)) {
        delete this.profileMemento[EditorPart.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY];
      } else {
        this.profileMemento[EditorPart.EDITOR_PART_CENTERED_VIEW_STORAGE_KEY] = centeredLayoutState;
      }
    }
    super.saveState();
  }
  loadState() {
    return this.workspaceMemento[EditorPart.EDITOR_PART_UI_STATE_STORAGE_KEY];
  }
  createState() {
    return {
      serializedGrid: this.gridWidget.serialize(),
      activeGroup: this._activeGroup.id,
      mostRecentActiveGroups: this.mostRecentActiveGroups
    };
  }
  applyState(state, options) {
    if (state === "empty") {
      return this.doApplyEmptyState();
    } else {
      return this.doApplyState(state, options);
    }
  }
  async doApplyState(state, options) {
    const groups = await this.doPrepareApplyState();
    this._onDidAddGroup.pause();
    this._onDidRemoveGroup.pause();
    this.disposeGroups();
    this.mostRecentActiveGroups = state.mostRecentActiveGroups;
    try {
      this.doApplyGridState(
        state.serializedGrid,
        state.activeGroup,
        void 0,
        options
      );
    } finally {
      this._onDidRemoveGroup.resume();
      this._onDidAddGroup.resume();
    }
    await this.activeGroup.openEditors(
      groups.flatMap((group) => group.editors).filter(
        (editor) => this.editorPartsView.groups.every(
          (groupView) => !groupView.contains(editor)
        )
      ).map((editor) => ({
        editor,
        options: {
          pinned: true,
          preserveFocus: true,
          inactive: true
        }
      }))
    );
  }
  async doApplyEmptyState() {
    await this.doPrepareApplyState();
    this.mergeAllGroups(this.activeGroup);
  }
  async doPrepareApplyState() {
    const groups = this.getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE);
    for (const group of groups) {
      await group.closeAllEditors({ excludeConfirming: true });
    }
    return groups;
  }
  doApplyGridState(gridState, activeGroupId, editorGroupViewsToReuse, options) {
    this.doCreateGridControlWithState(
      gridState,
      activeGroupId,
      editorGroupViewsToReuse,
      options
    );
    this.doLayout(this._contentDimension);
    this.updateContainer();
    for (const groupView of this.getGroups(GroupsOrder.GRID_APPEARANCE)) {
      if (!editorGroupViewsToReuse?.includes(groupView)) {
        this._onDidAddGroup.fire(groupView);
      }
    }
    this.notifyGroupIndexChange();
  }
  onDidChangeMementoState(e) {
    if (e.external && e.scope === StorageScope.WORKSPACE) {
      this.reloadMemento(e.scope);
      const state = this.loadState();
      if (state) {
        this.applyState(state);
      }
    }
  }
  toJSON() {
    return {
      type: Parts.EDITOR_PART
    };
  }
  disposeGroups() {
    for (const group of this.groups) {
      group.dispose();
      this._onDidRemoveGroup.fire(group);
    }
    this.groupViews.clear();
    this.mostRecentActiveGroups = [];
  }
  dispose() {
    this._onWillDispose.fire();
    this.disposeGroups();
    this.gridWidget?.dispose();
    super.dispose();
  }
  //#endregion
};
EditorPart = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IWorkbenchLayoutService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IContextKeyService)
], EditorPart);
let MainEditorPart = class extends EditorPart {
  constructor(editorPartsView, instantiationService, themeService, configurationService, storageService, layoutService, hostService, contextKeyService) {
    super(
      editorPartsView,
      Parts.EDITOR_PART,
      "",
      mainWindow.vscodeWindowId,
      instantiationService,
      themeService,
      configurationService,
      storageService,
      layoutService,
      hostService,
      contextKeyService
    );
  }
};
MainEditorPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IWorkbenchLayoutService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IContextKeyService)
], MainEditorPart);
export {
  EditorPart,
  MainEditorPart
};
