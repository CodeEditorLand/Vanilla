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
import { asArray } from "../../../../base/common/arrays.js";
import { timeout } from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { TERMINAL_VIEW_ID } from "../common/terminal.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import { TerminalGroup } from "./terminalGroup.js";
import { getInstanceFromResource } from "./terminalUri.js";
let TerminalGroupService = class extends Disposable {
  constructor(_contextKeyService, _instantiationService, _viewsService, _viewDescriptorService, _quickInputService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._viewsService = _viewsService;
    this._viewDescriptorService = _viewDescriptorService;
    this._quickInputService = _quickInputService;
    this._terminalGroupCountContextKey = TerminalContextKeys.groupCount.bindTo(this._contextKeyService);
    this._register(this.onDidDisposeGroup((group) => this._removeGroup(group)));
    this._register(this.onDidChangeGroups(() => this._terminalGroupCountContextKey.set(this.groups.length)));
    this._register(Event.any(this.onDidChangeActiveGroup, this.onDidChangeInstances)(() => this.updateVisibility()));
    this._register(this._quickInputService.onShow(() => this._isQuickInputOpened = true));
    this._register(this._quickInputService.onHide(() => this._isQuickInputOpened = false));
  }
  static {
    __name(this, "TerminalGroupService");
  }
  groups = [];
  activeGroupIndex = -1;
  get instances() {
    return this.groups.reduce(
      (p, c) => p.concat(c.terminalInstances),
      []
    );
  }
  lastAccessedMenu = "inline-tab";
  _terminalGroupCountContextKey;
  _container;
  _isQuickInputOpened = false;
  _onDidChangeActiveGroup = this._register(
    new Emitter()
  );
  onDidChangeActiveGroup = this._onDidChangeActiveGroup.event;
  _onDidDisposeGroup = this._register(
    new Emitter()
  );
  onDidDisposeGroup = this._onDidDisposeGroup.event;
  _onDidChangeGroups = this._register(new Emitter());
  onDidChangeGroups = this._onDidChangeGroups.event;
  _onDidShow = this._register(new Emitter());
  onDidShow = this._onDidShow.event;
  _onDidDisposeInstance = this._register(
    new Emitter()
  );
  onDidDisposeInstance = this._onDidDisposeInstance.event;
  _onDidFocusInstance = this._register(
    new Emitter()
  );
  onDidFocusInstance = this._onDidFocusInstance.event;
  _onDidChangeActiveInstance = this._register(
    new Emitter()
  );
  onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;
  _onDidChangeInstances = this._register(
    new Emitter()
  );
  onDidChangeInstances = this._onDidChangeInstances.event;
  _onDidChangeInstanceCapability = this._register(
    new Emitter()
  );
  onDidChangeInstanceCapability = this._onDidChangeInstanceCapability.event;
  _onDidChangePanelOrientation = this._register(
    new Emitter()
  );
  onDidChangePanelOrientation = this._onDidChangePanelOrientation.event;
  hidePanel() {
    const panel = this._viewDescriptorService.getViewContainerByViewId(
      TERMINAL_VIEW_ID
    );
    if (panel && this._viewDescriptorService.getViewContainerModel(panel).activeViewDescriptors.length === 1) {
      this._viewsService.closeView(TERMINAL_VIEW_ID);
      TerminalContextKeys.tabsMouse.bindTo(this._contextKeyService).set(false);
    }
  }
  get activeGroup() {
    if (this.activeGroupIndex < 0 || this.activeGroupIndex >= this.groups.length) {
      return void 0;
    }
    return this.groups[this.activeGroupIndex];
  }
  set activeGroup(value) {
    if (value === void 0) {
      return;
    }
    const index = this.groups.findIndex((e) => e === value);
    this.setActiveGroupByIndex(index);
  }
  get activeInstance() {
    return this.activeGroup?.activeInstance;
  }
  setActiveInstance(instance) {
    this.setActiveInstanceByIndex(
      this._getIndexFromId(instance.instanceId)
    );
  }
  _getIndexFromId(terminalId) {
    const terminalIndex = this.instances.findIndex(
      (e) => e.instanceId === terminalId
    );
    if (terminalIndex === -1) {
      throw new Error(
        `Terminal with ID ${terminalId} does not exist (has it already been disposed?)`
      );
    }
    return terminalIndex;
  }
  setContainer(container) {
    this._container = container;
    this.groups.forEach((group) => group.attachToElement(container));
  }
  async focusTabs() {
    if (this.instances.length === 0) {
      return;
    }
    await this.showPanel(true);
    const pane = this._viewsService.getActiveViewWithId(
      TERMINAL_VIEW_ID
    );
    pane?.terminalTabbedView?.focusTabs();
  }
  async focusHover() {
    if (this.instances.length === 0) {
      return;
    }
    const pane = this._viewsService.getActiveViewWithId(
      TERMINAL_VIEW_ID
    );
    pane?.terminalTabbedView?.focusHover();
  }
  async focusInstance(_) {
    return this.showPanel(true);
  }
  async focusActiveInstance() {
    return this.showPanel(true);
  }
  createGroup(slcOrInstance) {
    const group = this._instantiationService.createInstance(
      TerminalGroup,
      this._container,
      slcOrInstance
    );
    this.groups.push(group);
    group.addDisposable(
      Event.forward(
        group.onPanelOrientationChanged,
        this._onDidChangePanelOrientation
      )
    );
    group.addDisposable(
      Event.forward(
        group.onDidDisposeInstance,
        this._onDidDisposeInstance
      )
    );
    group.addDisposable(
      Event.forward(group.onDidFocusInstance, this._onDidFocusInstance)
    );
    group.addDisposable(
      Event.forward(
        group.onDidChangeInstanceCapability,
        this._onDidChangeInstanceCapability
      )
    );
    group.addDisposable(
      Event.forward(group.onInstancesChanged, this._onDidChangeInstances)
    );
    group.addDisposable(
      Event.forward(group.onDisposed, this._onDidDisposeGroup)
    );
    group.addDisposable(
      group.onDidChangeActiveInstance((e) => {
        if (group === this.activeGroup) {
          this._onDidChangeActiveInstance.fire(e);
        }
      })
    );
    if (group.terminalInstances.length > 0) {
      this._onDidChangeInstances.fire();
    }
    if (this.instances.length === 1) {
      this.setActiveInstanceByIndex(0);
    }
    this._onDidChangeGroups.fire();
    return group;
  }
  async showPanel(focus) {
    const pane = this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID) ?? await this._viewsService.openView(TERMINAL_VIEW_ID, focus);
    pane?.setExpanded(true);
    if (focus) {
      await timeout(0);
      const instance = this.activeInstance;
      if (instance) {
        if (pane && !pane.isVisible()) {
          await this._viewsService.openView(TERMINAL_VIEW_ID, focus);
        }
        await instance.focusWhenReady(true);
      }
    }
    this._onDidShow.fire();
  }
  getInstanceFromResource(resource) {
    return getInstanceFromResource(this.instances, resource);
  }
  _removeGroup(group) {
    const activeGroup = this.activeGroup;
    const wasActiveGroup = group === activeGroup;
    const index = this.groups.indexOf(group);
    if (index !== -1) {
      this.groups.splice(index, 1);
      this._onDidChangeGroups.fire();
    }
    if (wasActiveGroup) {
      if (this.groups.length > 0 && !this._isQuickInputOpened) {
        const newIndex = index < this.groups.length ? index : this.groups.length - 1;
        this.setActiveGroupByIndex(newIndex, true);
        this.activeInstance?.focus(true);
      }
    } else {
      if (this.activeGroupIndex > index) {
        this.setActiveGroupByIndex(this.activeGroupIndex - 1);
      }
    }
    if (this.activeGroupIndex >= this.groups.length) {
      this.setActiveGroupByIndex(this.groups.length - 1);
    }
    this._onDidChangeInstances.fire();
    this._onDidChangeGroups.fire();
    if (wasActiveGroup) {
      this._onDidChangeActiveGroup.fire(this.activeGroup);
      this._onDidChangeActiveInstance.fire(this.activeInstance);
    }
  }
  /**
   * @param force Whether to force the group change, this should be used when the previous active
   * group has been removed.
   */
  setActiveGroupByIndex(index, force) {
    if (index === -1 && this.groups.length === 0) {
      if (this.activeGroupIndex !== -1) {
        this.activeGroupIndex = -1;
        this._onDidChangeActiveGroup.fire(this.activeGroup);
        this._onDidChangeActiveInstance.fire(this.activeInstance);
      }
      return;
    }
    if (index < 0 || index >= this.groups.length) {
      return;
    }
    const oldActiveGroup = this.activeGroup;
    this.activeGroupIndex = index;
    if (force || oldActiveGroup !== this.activeGroup) {
      this._onDidChangeActiveGroup.fire(this.activeGroup);
      this._onDidChangeActiveInstance.fire(this.activeInstance);
    }
  }
  _getInstanceLocation(index) {
    let currentGroupIndex = 0;
    while (index >= 0 && currentGroupIndex < this.groups.length) {
      const group = this.groups[currentGroupIndex];
      const count = group.terminalInstances.length;
      if (index < count) {
        return {
          group,
          groupIndex: currentGroupIndex,
          instance: group.terminalInstances[index],
          instanceIndex: index
        };
      }
      index -= count;
      currentGroupIndex++;
    }
    return void 0;
  }
  setActiveInstanceByIndex(index) {
    const activeInstance = this.activeInstance;
    const instanceLocation = this._getInstanceLocation(index);
    const newActiveInstance = instanceLocation?.group.terminalInstances[instanceLocation.instanceIndex];
    if (!instanceLocation || activeInstance === newActiveInstance) {
      return;
    }
    const activeInstanceIndex = instanceLocation.instanceIndex;
    this.activeGroupIndex = instanceLocation.groupIndex;
    this._onDidChangeActiveGroup.fire(this.activeGroup);
    instanceLocation.group.setActiveInstanceByIndex(
      activeInstanceIndex,
      true
    );
  }
  setActiveGroupToNext() {
    if (this.groups.length <= 1) {
      return;
    }
    let newIndex = this.activeGroupIndex + 1;
    if (newIndex >= this.groups.length) {
      newIndex = 0;
    }
    this.setActiveGroupByIndex(newIndex);
  }
  setActiveGroupToPrevious() {
    if (this.groups.length <= 1) {
      return;
    }
    let newIndex = this.activeGroupIndex - 1;
    if (newIndex < 0) {
      newIndex = this.groups.length - 1;
    }
    this.setActiveGroupByIndex(newIndex);
  }
  _getValidTerminalGroups = /* @__PURE__ */ __name((sources) => {
    return new Set(
      sources.map((source) => this.getGroupForInstance(source)).filter((group) => group !== void 0)
    );
  }, "_getValidTerminalGroups");
  moveGroup(source, target) {
    source = asArray(source);
    const sourceGroups = this._getValidTerminalGroups(source);
    const targetGroup = this.getGroupForInstance(target);
    if (!targetGroup || sourceGroups.size === 0) {
      return;
    }
    if (sourceGroups.size === 1 && sourceGroups.has(targetGroup)) {
      const targetIndex = targetGroup.terminalInstances.indexOf(target);
      const sortedSources = source.sort((a, b) => {
        return targetGroup.terminalInstances.indexOf(a) - targetGroup.terminalInstances.indexOf(b);
      });
      const firstTargetIndex = targetGroup.terminalInstances.indexOf(
        sortedSources[0]
      );
      const position2 = firstTargetIndex < targetIndex ? "after" : "before";
      targetGroup.moveInstance(sortedSources, targetIndex, position2);
      this._onDidChangeInstances.fire();
      return;
    }
    const targetGroupIndex = this.groups.indexOf(targetGroup);
    const sortedSourceGroups = Array.from(sourceGroups).sort((a, b) => {
      return this.groups.indexOf(a) - this.groups.indexOf(b);
    });
    const firstSourceGroupIndex = this.groups.indexOf(
      sortedSourceGroups[0]
    );
    const position = firstSourceGroupIndex < targetGroupIndex ? "after" : "before";
    const insertIndex = position === "after" ? targetGroupIndex + 1 : targetGroupIndex;
    this.groups.splice(insertIndex, 0, ...sortedSourceGroups);
    for (const sourceGroup of sortedSourceGroups) {
      const originSourceGroupIndex = position === "after" ? this.groups.indexOf(sourceGroup) : this.groups.lastIndexOf(sourceGroup);
      this.groups.splice(originSourceGroupIndex, 1);
    }
    this._onDidChangeInstances.fire();
  }
  moveGroupToEnd(source) {
    source = asArray(source);
    const sourceGroups = this._getValidTerminalGroups(source);
    if (sourceGroups.size === 0) {
      return;
    }
    const lastInstanceIndex = this.groups.length - 1;
    const sortedSourceGroups = Array.from(sourceGroups).sort((a, b) => {
      return this.groups.indexOf(a) - this.groups.indexOf(b);
    });
    this.groups.splice(lastInstanceIndex + 1, 0, ...sortedSourceGroups);
    for (const sourceGroup of sortedSourceGroups) {
      const sourceGroupIndex = this.groups.indexOf(sourceGroup);
      this.groups.splice(sourceGroupIndex, 1);
    }
    this._onDidChangeInstances.fire();
  }
  moveInstance(source, target, side) {
    const sourceGroup = this.getGroupForInstance(source);
    const targetGroup = this.getGroupForInstance(target);
    if (!sourceGroup || !targetGroup) {
      return;
    }
    if (sourceGroup !== targetGroup) {
      sourceGroup.removeInstance(source);
      targetGroup.addInstance(source);
    }
    const index = targetGroup.terminalInstances.indexOf(target) + (side === "after" ? 1 : 0);
    targetGroup.moveInstance(source, index, side);
  }
  unsplitInstance(instance) {
    const oldGroup = this.getGroupForInstance(instance);
    if (!oldGroup || oldGroup.terminalInstances.length < 2) {
      return;
    }
    oldGroup.removeInstance(instance);
    this.createGroup(instance);
  }
  joinInstances(instances) {
    const group = this.getGroupForInstance(instances[0]);
    if (group) {
      let differentGroups = true;
      for (let i = 1; i < group.terminalInstances.length; i++) {
        if (group.terminalInstances.includes(instances[i])) {
          differentGroups = false;
          break;
        }
      }
      if (!differentGroups && group.terminalInstances.length === instances.length) {
        return;
      }
    }
    let candidateInstance;
    let candidateGroup;
    for (const instance of instances) {
      const group2 = this.getGroupForInstance(instance);
      if (group2?.terminalInstances.length === 1) {
        candidateInstance = instance;
        candidateGroup = group2;
        break;
      }
    }
    if (!candidateGroup) {
      candidateGroup = this.createGroup();
    }
    const wasActiveGroup = this.activeGroup === candidateGroup;
    for (const instance of instances) {
      if (instance === candidateInstance) {
        continue;
      }
      const oldGroup = this.getGroupForInstance(instance);
      if (!oldGroup) {
        continue;
      }
      oldGroup.removeInstance(instance);
      candidateGroup.addInstance(instance);
    }
    this.setActiveInstance(instances[0]);
    this._onDidChangeInstances.fire();
    if (!wasActiveGroup) {
      this._onDidChangeActiveGroup.fire(this.activeGroup);
    }
  }
  instanceIsSplit(instance) {
    const group = this.getGroupForInstance(instance);
    if (!group) {
      return false;
    }
    return group.terminalInstances.length > 1;
  }
  getGroupForInstance(instance) {
    return this.groups.find(
      (group) => group.terminalInstances.includes(instance)
    );
  }
  getGroupLabels() {
    return this.groups.filter((group) => group.terminalInstances.length > 0).map((group, index) => {
      return `${index + 1}: ${group.title ? group.title : ""}`;
    });
  }
  /**
   * Visibility should be updated in the following cases:
   * 1. Toggle `TERMINAL_VIEW_ID` visibility
   * 2. Change active group
   * 3. Change instances in active group
   */
  updateVisibility() {
    const visible = this._viewsService.isViewVisible(TERMINAL_VIEW_ID);
    this.groups.forEach(
      (g, i) => g.setVisible(visible && i === this.activeGroupIndex)
    );
  }
};
TerminalGroupService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IViewsService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IQuickInputService)
], TerminalGroupService);
export {
  TerminalGroupService
};
//# sourceMappingURL=terminalGroupService.js.map
