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
import { coalesce, move } from "../../../../base/common/arrays.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { CounterSet } from "../../../../base/common/map.js";
import { isEqual } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import {
  isUndefined,
  isUndefinedOrNull
} from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  ILoggerService
} from "../../../../platform/log/common/log.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import {
  defaultViewIcon,
  Extensions as ViewExtensions,
  VIEWS_LOG_ID,
  VIEWS_LOG_NAME
} from "../../../common/views.js";
import { IOutputService } from "../../output/common/output.js";
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "_workbench.output.showViewsLog",
        title: localize2("showViewsLog", "Show Views Log"),
        category: Categories.Developer,
        f1: true
      });
    }
    async run(servicesAccessor) {
      const loggerService = servicesAccessor.get(ILoggerService);
      const outputService = servicesAccessor.get(IOutputService);
      loggerService.setVisibility(VIEWS_LOG_ID, true);
      outputService.showChannel(VIEWS_LOG_ID);
    }
  }
);
function getViewsStateStorageId(viewContainerStorageId) {
  return `${viewContainerStorageId}.hidden`;
}
let ViewDescriptorsState = class extends Disposable {
  constructor(viewContainerStorageId, viewContainerName, storageService, loggerService) {
    super();
    this.viewContainerName = viewContainerName;
    this.storageService = storageService;
    this.logger = new Lazy(
      () => loggerService.createLogger(VIEWS_LOG_ID, {
        name: VIEWS_LOG_NAME,
        hidden: true
      })
    );
    this.globalViewsStateStorageId = getViewsStateStorageId(
      viewContainerStorageId
    );
    this.workspaceViewsStateStorageId = viewContainerStorageId;
    this._register(
      this.storageService.onDidChangeValue(
        StorageScope.PROFILE,
        this.globalViewsStateStorageId,
        this._register(new DisposableStore())
      )(() => this.onDidStorageChange())
    );
    this.state = this.initialize();
  }
  workspaceViewsStateStorageId;
  globalViewsStateStorageId;
  state;
  _onDidChangeStoredState = this._register(
    new Emitter()
  );
  onDidChangeStoredState = this._onDidChangeStoredState.event;
  logger;
  set(id, state) {
    this.state.set(id, state);
  }
  get(id) {
    return this.state.get(id);
  }
  updateState(viewDescriptors) {
    this.updateWorkspaceState(viewDescriptors);
    this.updateGlobalState(viewDescriptors);
  }
  updateWorkspaceState(viewDescriptors) {
    const storedViewsStates = this.getStoredWorkspaceState();
    for (const viewDescriptor of viewDescriptors) {
      const viewState = this.get(viewDescriptor.id);
      if (viewState) {
        storedViewsStates[viewDescriptor.id] = {
          collapsed: !!viewState.collapsed,
          isHidden: !viewState.visibleWorkspace,
          size: viewState.size,
          order: viewDescriptor.workspace && viewState ? viewState.order : void 0
        };
      }
    }
    if (Object.keys(storedViewsStates).length > 0) {
      this.storageService.store(
        this.workspaceViewsStateStorageId,
        JSON.stringify(storedViewsStates),
        StorageScope.WORKSPACE,
        StorageTarget.MACHINE
      );
    } else {
      this.storageService.remove(
        this.workspaceViewsStateStorageId,
        StorageScope.WORKSPACE
      );
    }
  }
  updateGlobalState(viewDescriptors) {
    const storedGlobalState = this.getStoredGlobalState();
    for (const viewDescriptor of viewDescriptors) {
      const state = this.get(viewDescriptor.id);
      storedGlobalState.set(viewDescriptor.id, {
        id: viewDescriptor.id,
        isHidden: state && viewDescriptor.canToggleVisibility ? !state.visibleGlobal : false,
        order: !viewDescriptor.workspace && state ? state.order : void 0
      });
    }
    this.setStoredGlobalState(storedGlobalState);
  }
  onDidStorageChange() {
    if (this.globalViewsStatesValue !== this.getStoredGlobalViewsStatesValue()) {
      this._globalViewsStatesValue = void 0;
      const storedViewsVisibilityStates = this.getStoredGlobalState();
      const storedWorkspaceViewsStates = this.getStoredWorkspaceState();
      const changedStates = [];
      for (const [id, storedState] of storedViewsVisibilityStates) {
        const state = this.get(id);
        if (state) {
          if (state.visibleGlobal !== !storedState.isHidden) {
            if (!storedState.isHidden) {
              this.logger.value.info(
                `View visibility state changed: ${id} is now visible`,
                this.viewContainerName
              );
            }
            changedStates.push({
              id,
              visible: !storedState.isHidden
            });
          }
        } else {
          const workspaceViewState = storedWorkspaceViewsStates[id];
          this.set(id, {
            active: false,
            visibleGlobal: !storedState.isHidden,
            visibleWorkspace: isUndefined(
              workspaceViewState?.isHidden
            ) ? void 0 : !workspaceViewState?.isHidden,
            collapsed: workspaceViewState?.collapsed,
            order: workspaceViewState?.order,
            size: workspaceViewState?.size
          });
        }
      }
      if (changedStates.length) {
        this._onDidChangeStoredState.fire(changedStates);
        for (const changedState of changedStates) {
          const state = this.get(changedState.id);
          if (state) {
            state.visibleGlobal = changedState.visible;
          }
        }
      }
    }
  }
  initialize() {
    const viewStates = /* @__PURE__ */ new Map();
    const workspaceViewsStates = this.getStoredWorkspaceState();
    for (const id of Object.keys(workspaceViewsStates)) {
      const workspaceViewState = workspaceViewsStates[id];
      viewStates.set(id, {
        active: false,
        visibleGlobal: void 0,
        visibleWorkspace: isUndefined(workspaceViewState.isHidden) ? void 0 : !workspaceViewState.isHidden,
        collapsed: workspaceViewState.collapsed,
        order: workspaceViewState.order,
        size: workspaceViewState.size
      });
    }
    const value = this.storageService.get(
      this.globalViewsStateStorageId,
      StorageScope.WORKSPACE,
      "[]"
    );
    const { state: workspaceVisibilityStates } = this.parseStoredGlobalState(value);
    if (workspaceVisibilityStates.size > 0) {
      for (const { id, isHidden } of workspaceVisibilityStates.values()) {
        const viewState = viewStates.get(id);
        if (viewState) {
          if (isUndefined(viewState.visibleWorkspace)) {
            viewState.visibleWorkspace = !isHidden;
          }
        } else {
          viewStates.set(id, {
            active: false,
            collapsed: void 0,
            visibleGlobal: void 0,
            visibleWorkspace: !isHidden
          });
        }
      }
      this.storageService.remove(
        this.globalViewsStateStorageId,
        StorageScope.WORKSPACE
      );
    }
    const { state, hasDuplicates } = this.parseStoredGlobalState(
      this.globalViewsStatesValue
    );
    if (hasDuplicates) {
      this.setStoredGlobalState(state);
    }
    for (const { id, isHidden, order } of state.values()) {
      const viewState = viewStates.get(id);
      if (viewState) {
        viewState.visibleGlobal = !isHidden;
        if (!isUndefined(order)) {
          viewState.order = order;
        }
      } else {
        viewStates.set(id, {
          active: false,
          visibleGlobal: !isHidden,
          order,
          collapsed: void 0,
          visibleWorkspace: void 0
        });
      }
    }
    return viewStates;
  }
  getStoredWorkspaceState() {
    return JSON.parse(
      this.storageService.get(
        this.workspaceViewsStateStorageId,
        StorageScope.WORKSPACE,
        "{}"
      )
    );
  }
  getStoredGlobalState() {
    return this.parseStoredGlobalState(this.globalViewsStatesValue).state;
  }
  setStoredGlobalState(storedGlobalState) {
    this.globalViewsStatesValue = JSON.stringify([
      ...storedGlobalState.values()
    ]);
  }
  parseStoredGlobalState(value) {
    const storedValue = JSON.parse(value);
    let hasDuplicates = false;
    const state = storedValue.reduce((result, storedState) => {
      if (typeof storedState === "string") {
        hasDuplicates = hasDuplicates || result.has(storedState);
        result.set(storedState, { id: storedState, isHidden: true });
      } else {
        hasDuplicates = hasDuplicates || result.has(storedState.id);
        result.set(storedState.id, storedState);
      }
      return result;
    }, /* @__PURE__ */ new Map());
    return { state, hasDuplicates };
  }
  _globalViewsStatesValue;
  get globalViewsStatesValue() {
    if (!this._globalViewsStatesValue) {
      this._globalViewsStatesValue = this.getStoredGlobalViewsStatesValue();
    }
    return this._globalViewsStatesValue;
  }
  set globalViewsStatesValue(globalViewsStatesValue) {
    if (this.globalViewsStatesValue !== globalViewsStatesValue) {
      this._globalViewsStatesValue = globalViewsStatesValue;
      this.setStoredGlobalViewsStatesValue(globalViewsStatesValue);
    }
  }
  getStoredGlobalViewsStatesValue() {
    return this.storageService.get(
      this.globalViewsStateStorageId,
      StorageScope.PROFILE,
      "[]"
    );
  }
  setStoredGlobalViewsStatesValue(value) {
    this.storageService.store(
      this.globalViewsStateStorageId,
      value,
      StorageScope.PROFILE,
      StorageTarget.USER
    );
  }
};
ViewDescriptorsState = __decorateClass([
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILoggerService)
], ViewDescriptorsState);
let ViewContainerModel = class extends Disposable {
  constructor(viewContainer, instantiationService, contextKeyService, loggerService) {
    super();
    this.viewContainer = viewContainer;
    this.contextKeyService = contextKeyService;
    this.logger = new Lazy(
      () => loggerService.createLogger(VIEWS_LOG_ID, {
        name: VIEWS_LOG_NAME,
        hidden: true
      })
    );
    this._register(
      Event.filter(
        contextKeyService.onDidChangeContext,
        (e) => e.affectsSome(this.contextKeys)
      )(() => this.onDidChangeContext())
    );
    this.viewDescriptorsState = this._register(
      instantiationService.createInstance(
        ViewDescriptorsState,
        viewContainer.storageId || `${viewContainer.id}.state`,
        typeof viewContainer.title === "string" ? viewContainer.title : viewContainer.title.original
      )
    );
    this._register(
      this.viewDescriptorsState.onDidChangeStoredState(
        (items) => this.updateVisibility(items)
      )
    );
    this.updateContainerInfo();
  }
  contextKeys = new CounterSet();
  viewDescriptorItems = [];
  viewDescriptorsState;
  // Container Info
  _title;
  get title() {
    return this._title;
  }
  _icon;
  get icon() {
    return this._icon;
  }
  _keybindingId;
  get keybindingId() {
    return this._keybindingId;
  }
  _onDidChangeContainerInfo = this._register(
    new Emitter()
  );
  onDidChangeContainerInfo = this._onDidChangeContainerInfo.event;
  // All View Descriptors
  get allViewDescriptors() {
    return this.viewDescriptorItems.map((item) => item.viewDescriptor);
  }
  _onDidChangeAllViewDescriptors = this._register(
    new Emitter()
  );
  onDidChangeAllViewDescriptors = this._onDidChangeAllViewDescriptors.event;
  // Active View Descriptors
  get activeViewDescriptors() {
    return this.viewDescriptorItems.filter((item) => item.state.active).map((item) => item.viewDescriptor);
  }
  _onDidChangeActiveViewDescriptors = this._register(
    new Emitter()
  );
  onDidChangeActiveViewDescriptors = this._onDidChangeActiveViewDescriptors.event;
  // Visible View Descriptors
  get visibleViewDescriptors() {
    return this.viewDescriptorItems.filter((item) => this.isViewDescriptorVisible(item)).map((item) => item.viewDescriptor);
  }
  _onDidAddVisibleViewDescriptors = this._register(
    new Emitter()
  );
  onDidAddVisibleViewDescriptors = this._onDidAddVisibleViewDescriptors.event;
  _onDidRemoveVisibleViewDescriptors = this._register(
    new Emitter()
  );
  onDidRemoveVisibleViewDescriptors = this._onDidRemoveVisibleViewDescriptors.event;
  _onDidMoveVisibleViewDescriptors = this._register(
    new Emitter()
  );
  onDidMoveVisibleViewDescriptors = this._onDidMoveVisibleViewDescriptors.event;
  logger;
  updateContainerInfo() {
    const useDefaultContainerInfo = this.viewContainer.alwaysUseContainerInfo || this.visibleViewDescriptors.length === 0 || this.visibleViewDescriptors.some(
      (v) => Registry.as(
        ViewExtensions.ViewsRegistry
      ).getViewContainer(v.id) === this.viewContainer
    );
    const title = useDefaultContainerInfo ? typeof this.viewContainer.title === "string" ? this.viewContainer.title : this.viewContainer.title.value : this.visibleViewDescriptors[0]?.containerTitle || this.visibleViewDescriptors[0]?.name?.value || "";
    let titleChanged = false;
    if (this._title !== title) {
      this._title = title;
      titleChanged = true;
    }
    const icon = useDefaultContainerInfo ? this.viewContainer.icon : this.visibleViewDescriptors[0]?.containerIcon || defaultViewIcon;
    let iconChanged = false;
    if (!this.isEqualIcon(icon)) {
      this._icon = icon;
      iconChanged = true;
    }
    const keybindingId = this.viewContainer.openCommandActionDescriptor?.id ?? this.activeViewDescriptors.find(
      (v) => v.openCommandActionDescriptor
    )?.openCommandActionDescriptor?.id;
    let keybindingIdChanged = false;
    if (this._keybindingId !== keybindingId) {
      this._keybindingId = keybindingId;
      keybindingIdChanged = true;
    }
    if (titleChanged || iconChanged || keybindingIdChanged) {
      this._onDidChangeContainerInfo.fire({
        title: titleChanged,
        icon: iconChanged,
        keybindingId: keybindingIdChanged
      });
    }
  }
  isEqualIcon(icon) {
    if (URI.isUri(icon)) {
      return URI.isUri(this._icon) && isEqual(icon, this._icon);
    } else if (ThemeIcon.isThemeIcon(icon)) {
      return ThemeIcon.isThemeIcon(this._icon) && ThemeIcon.isEqual(icon, this._icon);
    }
    return icon === this._icon;
  }
  isVisible(id) {
    const viewDescriptorItem = this.viewDescriptorItems.find(
      (v) => v.viewDescriptor.id === id
    );
    if (!viewDescriptorItem) {
      throw new Error(`Unknown view ${id}`);
    }
    return this.isViewDescriptorVisible(viewDescriptorItem);
  }
  setVisible(id, visible) {
    this.updateVisibility([{ id, visible }]);
  }
  updateVisibility(viewDescriptors) {
    const viewDescriptorItemsToHide = coalesce(
      viewDescriptors.filter(({ visible }) => !visible).map(({ id }) => this.findAndIgnoreIfNotFound(id))
    );
    const removed = [];
    for (const {
      viewDescriptorItem,
      visibleIndex
    } of viewDescriptorItemsToHide) {
      if (this.updateViewDescriptorItemVisibility(
        viewDescriptorItem,
        false
      )) {
        removed.push({
          viewDescriptor: viewDescriptorItem.viewDescriptor,
          index: visibleIndex
        });
      }
    }
    if (removed.length) {
      this.broadCastRemovedVisibleViewDescriptors(removed);
    }
    const added = [];
    for (const { id, visible } of viewDescriptors) {
      if (!visible) {
        continue;
      }
      const foundViewDescriptor = this.findAndIgnoreIfNotFound(id);
      if (!foundViewDescriptor) {
        continue;
      }
      const { viewDescriptorItem, visibleIndex } = foundViewDescriptor;
      if (this.updateViewDescriptorItemVisibility(
        viewDescriptorItem,
        true
      )) {
        added.push({
          index: visibleIndex,
          viewDescriptor: viewDescriptorItem.viewDescriptor,
          size: viewDescriptorItem.state.size,
          collapsed: !!viewDescriptorItem.state.collapsed
        });
      }
    }
    if (added.length) {
      this.broadCastAddedVisibleViewDescriptors(added);
    }
  }
  updateViewDescriptorItemVisibility(viewDescriptorItem, visible) {
    if (!viewDescriptorItem.viewDescriptor.canToggleVisibility) {
      return false;
    }
    if (this.isViewDescriptorVisibleWhenActive(viewDescriptorItem) === visible) {
      return false;
    }
    if (viewDescriptorItem.viewDescriptor.workspace) {
      viewDescriptorItem.state.visibleWorkspace = visible;
    } else {
      viewDescriptorItem.state.visibleGlobal = visible;
      if (visible) {
        this.logger.value.info(
          `Showing view ${viewDescriptorItem.viewDescriptor.id} in the container ${this.viewContainer.id}`
        );
      }
    }
    return this.isViewDescriptorVisible(viewDescriptorItem) === visible;
  }
  isCollapsed(id) {
    return !!this.find(id).viewDescriptorItem.state.collapsed;
  }
  setCollapsed(id, collapsed) {
    const { viewDescriptorItem } = this.find(id);
    if (viewDescriptorItem.state.collapsed !== collapsed) {
      viewDescriptorItem.state.collapsed = collapsed;
    }
    this.viewDescriptorsState.updateState(this.allViewDescriptors);
  }
  getSize(id) {
    return this.find(id).viewDescriptorItem.state.size;
  }
  setSizes(newSizes) {
    for (const { id, size } of newSizes) {
      const { viewDescriptorItem } = this.find(id);
      if (viewDescriptorItem.state.size !== size) {
        viewDescriptorItem.state.size = size;
      }
    }
    this.viewDescriptorsState.updateState(this.allViewDescriptors);
  }
  move(from, to) {
    const fromIndex = this.viewDescriptorItems.findIndex(
      (v) => v.viewDescriptor.id === from
    );
    const toIndex = this.viewDescriptorItems.findIndex(
      (v) => v.viewDescriptor.id === to
    );
    const fromViewDescriptor = this.viewDescriptorItems[fromIndex];
    const toViewDescriptor = this.viewDescriptorItems[toIndex];
    move(this.viewDescriptorItems, fromIndex, toIndex);
    for (let index = 0; index < this.viewDescriptorItems.length; index++) {
      this.viewDescriptorItems[index].state.order = index;
    }
    this.broadCastMovedViewDescriptors(
      {
        index: fromIndex,
        viewDescriptor: fromViewDescriptor.viewDescriptor
      },
      { index: toIndex, viewDescriptor: toViewDescriptor.viewDescriptor }
    );
  }
  add(addedViewDescriptorStates) {
    const addedItems = [];
    for (const addedViewDescriptorState of addedViewDescriptorStates) {
      const viewDescriptor = addedViewDescriptorState.viewDescriptor;
      if (viewDescriptor.when) {
        for (const key of viewDescriptor.when.keys()) {
          this.contextKeys.add(key);
        }
      }
      let state = this.viewDescriptorsState.get(viewDescriptor.id);
      if (state) {
        if (viewDescriptor.workspace) {
          state.visibleWorkspace = isUndefinedOrNull(
            addedViewDescriptorState.visible
          ) ? isUndefinedOrNull(state.visibleWorkspace) ? !viewDescriptor.hideByDefault : state.visibleWorkspace : addedViewDescriptorState.visible;
        } else {
          const isVisible = state.visibleGlobal;
          state.visibleGlobal = isUndefinedOrNull(
            addedViewDescriptorState.visible
          ) ? isUndefinedOrNull(state.visibleGlobal) ? !viewDescriptor.hideByDefault : state.visibleGlobal : addedViewDescriptorState.visible;
          if (state.visibleGlobal && !isVisible) {
            this.logger.value.info(
              `Added view ${viewDescriptor.id} in the container ${this.viewContainer.id} and showing it.`,
              `${isVisible}`,
              `${viewDescriptor.hideByDefault}`,
              `${addedViewDescriptorState.visible}`
            );
          }
        }
        state.collapsed = isUndefinedOrNull(
          addedViewDescriptorState.collapsed
        ) ? isUndefinedOrNull(state.collapsed) ? !!viewDescriptor.collapsed : state.collapsed : addedViewDescriptorState.collapsed;
      } else {
        state = {
          active: false,
          visibleGlobal: isUndefinedOrNull(
            addedViewDescriptorState.visible
          ) ? !viewDescriptor.hideByDefault : addedViewDescriptorState.visible,
          visibleWorkspace: isUndefinedOrNull(
            addedViewDescriptorState.visible
          ) ? !viewDescriptor.hideByDefault : addedViewDescriptorState.visible,
          collapsed: isUndefinedOrNull(
            addedViewDescriptorState.collapsed
          ) ? !!viewDescriptor.collapsed : addedViewDescriptorState.collapsed
        };
      }
      this.viewDescriptorsState.set(viewDescriptor.id, state);
      state.active = this.contextKeyService.contextMatchesRules(
        viewDescriptor.when
      );
      addedItems.push({ viewDescriptor, state });
    }
    this.viewDescriptorItems.push(...addedItems);
    this.viewDescriptorItems.sort(this.compareViewDescriptors.bind(this));
    this._onDidChangeAllViewDescriptors.fire({
      added: addedItems.map(({ viewDescriptor }) => viewDescriptor),
      removed: []
    });
    const addedActiveItems = [];
    for (const viewDescriptorItem of addedItems) {
      if (viewDescriptorItem.state.active) {
        addedActiveItems.push({
          viewDescriptorItem,
          visible: this.isViewDescriptorVisible(viewDescriptorItem)
        });
      }
    }
    if (addedActiveItems.length) {
      this._onDidChangeActiveViewDescriptors.fire({
        added: addedActiveItems.map(
          ({ viewDescriptorItem }) => viewDescriptorItem.viewDescriptor
        ),
        removed: []
      });
    }
    const addedVisibleDescriptors = [];
    for (const { viewDescriptorItem, visible } of addedActiveItems) {
      if (visible && this.isViewDescriptorVisible(viewDescriptorItem)) {
        const { visibleIndex } = this.find(
          viewDescriptorItem.viewDescriptor.id
        );
        addedVisibleDescriptors.push({
          index: visibleIndex,
          viewDescriptor: viewDescriptorItem.viewDescriptor,
          size: viewDescriptorItem.state.size,
          collapsed: !!viewDescriptorItem.state.collapsed
        });
      }
    }
    this.broadCastAddedVisibleViewDescriptors(addedVisibleDescriptors);
  }
  remove(viewDescriptors) {
    const removed = [];
    const removedItems = [];
    const removedActiveDescriptors = [];
    const removedVisibleDescriptors = [];
    for (const viewDescriptor of viewDescriptors) {
      if (viewDescriptor.when) {
        for (const key of viewDescriptor.when.keys()) {
          this.contextKeys.delete(key);
        }
      }
      const index = this.viewDescriptorItems.findIndex(
        (i) => i.viewDescriptor.id === viewDescriptor.id
      );
      if (index !== -1) {
        removed.push(viewDescriptor);
        const viewDescriptorItem = this.viewDescriptorItems[index];
        if (viewDescriptorItem.state.active) {
          removedActiveDescriptors.push(
            viewDescriptorItem.viewDescriptor
          );
        }
        if (this.isViewDescriptorVisible(viewDescriptorItem)) {
          const { visibleIndex } = this.find(
            viewDescriptorItem.viewDescriptor.id
          );
          removedVisibleDescriptors.push({
            index: visibleIndex,
            viewDescriptor: viewDescriptorItem.viewDescriptor
          });
        }
        removedItems.push(viewDescriptorItem);
      }
    }
    removedItems.forEach(
      (item) => this.viewDescriptorItems.splice(
        this.viewDescriptorItems.indexOf(item),
        1
      )
    );
    this.broadCastRemovedVisibleViewDescriptors(removedVisibleDescriptors);
    if (removedActiveDescriptors.length) {
      this._onDidChangeActiveViewDescriptors.fire({
        added: [],
        removed: removedActiveDescriptors
      });
    }
    if (removed.length) {
      this._onDidChangeAllViewDescriptors.fire({ added: [], removed });
    }
  }
  onDidChangeContext() {
    const addedActiveItems = [];
    const removedActiveItems = [];
    for (const item of this.viewDescriptorItems) {
      const wasActive = item.state.active;
      const isActive = this.contextKeyService.contextMatchesRules(
        item.viewDescriptor.when
      );
      if (wasActive !== isActive) {
        if (isActive) {
          addedActiveItems.push({
            item,
            visibleWhenActive: this.isViewDescriptorVisibleWhenActive(item)
          });
        } else {
          removedActiveItems.push(item);
        }
      }
    }
    const removedVisibleDescriptors = [];
    for (const item of removedActiveItems) {
      if (this.isViewDescriptorVisible(item)) {
        const { visibleIndex } = this.find(item.viewDescriptor.id);
        removedVisibleDescriptors.push({
          index: visibleIndex,
          viewDescriptor: item.viewDescriptor
        });
      }
    }
    removedActiveItems.forEach((item) => item.state.active = false);
    addedActiveItems.forEach(({ item }) => item.state.active = true);
    this.broadCastRemovedVisibleViewDescriptors(removedVisibleDescriptors);
    if (addedActiveItems.length || removedActiveItems.length) {
      this._onDidChangeActiveViewDescriptors.fire({
        added: addedActiveItems.map(({ item }) => item.viewDescriptor),
        removed: removedActiveItems.map((item) => item.viewDescriptor)
      });
    }
    const addedVisibleDescriptors = [];
    for (const { item, visibleWhenActive } of addedActiveItems) {
      if (visibleWhenActive && this.isViewDescriptorVisible(item)) {
        const { visibleIndex } = this.find(item.viewDescriptor.id);
        addedVisibleDescriptors.push({
          index: visibleIndex,
          viewDescriptor: item.viewDescriptor,
          size: item.state.size,
          collapsed: !!item.state.collapsed
        });
      }
    }
    this.broadCastAddedVisibleViewDescriptors(addedVisibleDescriptors);
  }
  broadCastAddedVisibleViewDescriptors(added) {
    if (added.length) {
      this._onDidAddVisibleViewDescriptors.fire(
        added.sort((a, b) => a.index - b.index)
      );
      this.updateState(
        `Added views:${added.map((v) => v.viewDescriptor.id).join(",")} in ${this.viewContainer.id}`
      );
    }
  }
  broadCastRemovedVisibleViewDescriptors(removed) {
    if (removed.length) {
      this._onDidRemoveVisibleViewDescriptors.fire(
        removed.sort((a, b) => b.index - a.index)
      );
      this.updateState(
        `Removed views:${removed.map((v) => v.viewDescriptor.id).join(",")} from ${this.viewContainer.id}`
      );
    }
  }
  broadCastMovedViewDescriptors(from, to) {
    this._onDidMoveVisibleViewDescriptors.fire({ from, to });
    this.updateState(
      `Moved view ${from.viewDescriptor.id} to ${to.viewDescriptor.id} in ${this.viewContainer.id}`
    );
  }
  updateState(reason) {
    this.logger.value.info(reason);
    this.viewDescriptorsState.updateState(this.allViewDescriptors);
    this.updateContainerInfo();
  }
  isViewDescriptorVisible(viewDescriptorItem) {
    if (!viewDescriptorItem.state.active) {
      return false;
    }
    return this.isViewDescriptorVisibleWhenActive(viewDescriptorItem);
  }
  isViewDescriptorVisibleWhenActive(viewDescriptorItem) {
    if (viewDescriptorItem.viewDescriptor.workspace) {
      return !!viewDescriptorItem.state.visibleWorkspace;
    }
    return !!viewDescriptorItem.state.visibleGlobal;
  }
  find(id) {
    const result = this.findAndIgnoreIfNotFound(id);
    if (result) {
      return result;
    }
    throw new Error(`view descriptor ${id} not found`);
  }
  findAndIgnoreIfNotFound(id) {
    for (let i = 0, visibleIndex = 0; i < this.viewDescriptorItems.length; i++) {
      const viewDescriptorItem = this.viewDescriptorItems[i];
      if (viewDescriptorItem.viewDescriptor.id === id) {
        return {
          index: i,
          visibleIndex,
          viewDescriptorItem
        };
      }
      if (this.isViewDescriptorVisible(viewDescriptorItem)) {
        visibleIndex++;
      }
    }
    return void 0;
  }
  compareViewDescriptors(a, b) {
    if (a.viewDescriptor.id === b.viewDescriptor.id) {
      return 0;
    }
    return this.getViewOrder(a) - this.getViewOrder(b) || this.getGroupOrderResult(a.viewDescriptor, b.viewDescriptor);
  }
  getViewOrder(viewDescriptorItem) {
    const viewOrder = typeof viewDescriptorItem.state.order === "number" ? viewDescriptorItem.state.order : viewDescriptorItem.viewDescriptor.order;
    return typeof viewOrder === "number" ? viewOrder : Number.MAX_VALUE;
  }
  getGroupOrderResult(a, b) {
    if (!a.group || !b.group) {
      return 0;
    }
    if (a.group === b.group) {
      return 0;
    }
    return a.group < b.group ? -1 : 1;
  }
};
ViewContainerModel = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ILoggerService)
], ViewContainerModel);
export {
  ViewContainerModel,
  getViewsStateStorageId
};
