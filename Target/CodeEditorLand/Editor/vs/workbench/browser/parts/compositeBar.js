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
import { localize } from "../../../nls.js";
import { IAction, toAction } from "../../../base/common/actions.js";
import { IActivity } from "../../services/activity/common/activity.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { ActionBar, ActionsOrientation } from "../../../base/browser/ui/actionbar/actionbar.js";
import { CompositeActionViewItem, CompositeOverflowActivityAction, CompositeOverflowActivityActionViewItem, CompositeBarAction, ICompositeBar, ICompositeBarColors, IActivityHoverOptions } from "./compositeBarActions.js";
import { Dimension, $, addDisposableListener, EventType, EventHelper, isAncestor, getWindow } from "../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { Widget } from "../../../base/browser/ui/widget.js";
import { isUndefinedOrNull } from "../../../base/common/types.js";
import { IColorTheme } from "../../../platform/theme/common/themeService.js";
import { Emitter } from "../../../base/common/event.js";
import { ViewContainerLocation, IViewDescriptorService } from "../../common/views.js";
import { IPaneComposite } from "../../common/panecomposite.js";
import { IComposite } from "../../common/composite.js";
import { CompositeDragAndDropData, CompositeDragAndDropObserver, IDraggedCompositeData, ICompositeDragAndDrop, Before2D, toggleDropEffect, ICompositeDragAndDropObserverCallbacks } from "../dnd.js";
import { Gesture, EventType as TouchEventType, GestureEvent } from "../../../base/browser/touch.js";
class CompositeDragAndDrop {
  constructor(viewDescriptorService, targetContainerLocation, orientation, openComposite, moveComposite, getItems) {
    this.viewDescriptorService = viewDescriptorService;
    this.targetContainerLocation = targetContainerLocation;
    this.orientation = orientation;
    this.openComposite = openComposite;
    this.moveComposite = moveComposite;
    this.getItems = getItems;
  }
  static {
    __name(this, "CompositeDragAndDrop");
  }
  drop(data, targetCompositeId, originalEvent, before) {
    const dragData = data.getData();
    if (dragData.type === "composite") {
      const currentContainer = this.viewDescriptorService.getViewContainerById(dragData.id);
      const currentLocation = this.viewDescriptorService.getViewContainerLocation(currentContainer);
      if (currentLocation === this.targetContainerLocation) {
        if (targetCompositeId) {
          this.moveComposite(dragData.id, targetCompositeId, before);
        }
      } else {
        this.viewDescriptorService.moveViewContainerToLocation(currentContainer, this.targetContainerLocation, this.getTargetIndex(targetCompositeId, before), "dnd");
      }
    }
    if (dragData.type === "view") {
      const viewToMove = this.viewDescriptorService.getViewDescriptorById(dragData.id);
      if (viewToMove && viewToMove.canMoveView) {
        this.viewDescriptorService.moveViewToLocation(viewToMove, this.targetContainerLocation, "dnd");
        const newContainer = this.viewDescriptorService.getViewContainerByViewId(viewToMove.id);
        if (targetCompositeId) {
          this.moveComposite(newContainer.id, targetCompositeId, before);
        }
        this.openComposite(newContainer.id, true).then((composite) => {
          composite?.openView(viewToMove.id, true);
        });
      }
    }
  }
  onDragEnter(data, targetCompositeId, originalEvent) {
    return this.canDrop(data, targetCompositeId);
  }
  onDragOver(data, targetCompositeId, originalEvent) {
    return this.canDrop(data, targetCompositeId);
  }
  getTargetIndex(targetId, before2d) {
    if (!targetId) {
      return void 0;
    }
    const items = this.getItems();
    const before = this.orientation === ActionsOrientation.HORIZONTAL ? before2d?.horizontallyBefore : before2d?.verticallyBefore;
    return items.filter((item) => item.visible).findIndex((item) => item.id === targetId) + (before ? 0 : 1);
  }
  canDrop(data, targetCompositeId) {
    const dragData = data.getData();
    if (dragData.type === "composite") {
      const currentContainer = this.viewDescriptorService.getViewContainerById(dragData.id);
      const currentLocation = this.viewDescriptorService.getViewContainerLocation(currentContainer);
      if (currentLocation === this.targetContainerLocation) {
        return dragData.id !== targetCompositeId;
      }
      return true;
    } else {
      const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(dragData.id);
      if (!viewDescriptor || !viewDescriptor.canMoveView) {
        return false;
      }
      return true;
    }
  }
}
class CompositeBarDndCallbacks {
  constructor(compositeBarContainer, actionBarContainer, compositeBarModel, dndHandler, orientation) {
    this.compositeBarContainer = compositeBarContainer;
    this.actionBarContainer = actionBarContainer;
    this.compositeBarModel = compositeBarModel;
    this.dndHandler = dndHandler;
    this.orientation = orientation;
  }
  static {
    __name(this, "CompositeBarDndCallbacks");
  }
  insertDropBefore = void 0;
  onDragOver(e) {
    const visibleItems = this.compositeBarModel.visibleItems;
    if (!visibleItems.length || e.eventData.target && isAncestor(e.eventData.target, this.actionBarContainer)) {
      this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, false, false, true);
      return;
    }
    const insertAtFront = this.insertAtFront(this.actionBarContainer, e.eventData);
    const target = insertAtFront ? visibleItems[0] : visibleItems[visibleItems.length - 1];
    const validDropTarget = this.dndHandler.onDragOver(e.dragAndDropData, target.id, e.eventData);
    toggleDropEffect(e.eventData.dataTransfer, "move", validDropTarget);
    this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, validDropTarget, insertAtFront, true);
  }
  onDragLeave(e) {
    this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, false, false, false);
  }
  onDragEnd(e) {
    this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, false, false, false);
  }
  onDrop(e) {
    const visibleItems = this.compositeBarModel.visibleItems;
    let targetId = void 0;
    if (visibleItems.length) {
      targetId = this.insertAtFront(this.actionBarContainer, e.eventData) ? visibleItems[0].id : visibleItems[visibleItems.length - 1].id;
    }
    this.dndHandler.drop(e.dragAndDropData, targetId, e.eventData, this.insertDropBefore);
    this.insertDropBefore = this.updateFromDragging(this.compositeBarContainer, false, false, false);
  }
  insertAtFront(element, event) {
    const rect = element.getBoundingClientRect();
    const posX = event.clientX;
    const posY = event.clientY;
    switch (this.orientation) {
      case ActionsOrientation.HORIZONTAL:
        return posX < rect.left;
      case ActionsOrientation.VERTICAL:
        return posY < rect.top;
    }
  }
  updateFromDragging(element, showFeedback, front, isDragging) {
    element.classList.toggle("dragged-over", isDragging);
    element.classList.toggle("dragged-over-head", showFeedback && front);
    element.classList.toggle("dragged-over-tail", showFeedback && !front);
    if (!showFeedback) {
      return void 0;
    }
    return { verticallyBefore: front, horizontallyBefore: front };
  }
}
let CompositeBar = class extends Widget {
  constructor(items, options, instantiationService, contextMenuService, viewDescriptorService) {
    super();
    this.options = options;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
    this.viewDescriptorService = viewDescriptorService;
    this.model = new CompositeBarModel(items, options);
    this.visibleComposites = [];
    this.compositeSizeInBar = /* @__PURE__ */ new Map();
    this.computeSizes(this.model.visibleItems);
  }
  static {
    __name(this, "CompositeBar");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  dimension;
  compositeSwitcherBar;
  compositeOverflowAction;
  compositeOverflowActionViewItem;
  model;
  visibleComposites;
  compositeSizeInBar;
  getCompositeBarItems() {
    return [...this.model.items];
  }
  setCompositeBarItems(items) {
    this.model.setItems(items);
    this.updateCompositeSwitcher();
  }
  getPinnedComposites() {
    return this.model.pinnedItems;
  }
  getVisibleComposites() {
    return this.model.visibleItems;
  }
  create(parent) {
    const actionBarDiv = parent.appendChild($(".composite-bar"));
    this.compositeSwitcherBar = this._register(new ActionBar(actionBarDiv, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof CompositeOverflowActivityAction) {
          return this.compositeOverflowActionViewItem;
        }
        const item = this.model.findItem(action.id);
        return item && this.instantiationService.createInstance(
          CompositeActionViewItem,
          { ...options, draggable: true, colors: this.options.colors, icon: this.options.icon, hoverOptions: this.options.activityHoverOptions, compact: this.options.compact },
          action,
          item.pinnedAction,
          item.toggleBadgeAction,
          (compositeId) => this.options.getContextMenuActionsForComposite(compositeId),
          () => this.getContextMenuActions(),
          this.options.dndHandler,
          this
        );
      }, "actionViewItemProvider"),
      orientation: this.options.orientation,
      ariaLabel: localize("activityBarAriaLabel", "Active View Switcher"),
      ariaRole: "tablist",
      preventLoopNavigation: this.options.preventLoopNavigation,
      triggerKeys: { keyDown: true }
    }));
    this._register(addDisposableListener(parent, EventType.CONTEXT_MENU, (e) => this.showContextMenu(getWindow(parent), e)));
    this._register(Gesture.addTarget(parent));
    this._register(addDisposableListener(parent, TouchEventType.Contextmenu, (e) => this.showContextMenu(getWindow(parent), e)));
    const dndCallback = new CompositeBarDndCallbacks(parent, actionBarDiv, this.model, this.options.dndHandler, this.options.orientation);
    this._register(CompositeDragAndDropObserver.INSTANCE.registerTarget(parent, dndCallback));
    return actionBarDiv;
  }
  focus(index) {
    this.compositeSwitcherBar?.focus(index);
  }
  recomputeSizes() {
    this.computeSizes(this.model.visibleItems);
    this.updateCompositeSwitcher();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (dimension.height === 0 || dimension.width === 0) {
      return;
    }
    if (this.compositeSizeInBar.size === 0) {
      this.computeSizes(this.model.visibleItems);
    }
    this.updateCompositeSwitcher();
  }
  addComposite({ id, name, order, requestedIndex }) {
    if (this.model.add(id, name, order, requestedIndex)) {
      this.computeSizes([this.model.findItem(id)]);
      this.updateCompositeSwitcher();
    }
  }
  removeComposite(id) {
    if (this.isPinned(id)) {
      this.unpin(id);
    }
    if (this.model.remove(id)) {
      this.updateCompositeSwitcher();
    }
  }
  hideComposite(id) {
    if (this.model.hide(id)) {
      this.resetActiveComposite(id);
      this.updateCompositeSwitcher();
    }
  }
  activateComposite(id) {
    const previousActiveItem = this.model.activeItem;
    if (this.model.activate(id)) {
      if (this.visibleComposites.indexOf(id) === -1 || !!this.model.activeItem && !this.model.activeItem.pinned || previousActiveItem && !previousActiveItem.pinned) {
        this.updateCompositeSwitcher();
      }
    }
  }
  deactivateComposite(id) {
    const previousActiveItem = this.model.activeItem;
    if (this.model.deactivate()) {
      if (previousActiveItem && !previousActiveItem.pinned) {
        this.updateCompositeSwitcher();
      }
    }
  }
  async pin(compositeId, open) {
    if (this.model.setPinned(compositeId, true)) {
      this.updateCompositeSwitcher();
      if (open) {
        await this.options.openComposite(compositeId);
        this.activateComposite(compositeId);
      }
    }
  }
  unpin(compositeId) {
    if (this.model.setPinned(compositeId, false)) {
      this.updateCompositeSwitcher();
      this.resetActiveComposite(compositeId);
    }
  }
  areBadgesEnabled(compositeId) {
    return this.viewDescriptorService.getViewContainerBadgeEnablementState(compositeId);
  }
  toggleBadgeEnablement(compositeId) {
    this.viewDescriptorService.setViewContainerBadgeEnablementState(compositeId, !this.areBadgesEnabled(compositeId));
    this.updateCompositeSwitcher();
    const item = this.model.findItem(compositeId);
    if (item) {
      item.activityAction.activity = item.activityAction.activity;
    }
  }
  resetActiveComposite(compositeId) {
    const defaultCompositeId = this.options.getDefaultCompositeId();
    if (!this.model.activeItem || this.model.activeItem.id !== compositeId) {
      return;
    }
    this.deactivateComposite(compositeId);
    if (defaultCompositeId && defaultCompositeId !== compositeId && this.isPinned(defaultCompositeId)) {
      this.options.openComposite(defaultCompositeId, true);
    } else {
      this.options.openComposite(this.visibleComposites.filter((cid) => cid !== compositeId)[0]);
    }
  }
  isPinned(compositeId) {
    const item = this.model.findItem(compositeId);
    return item?.pinned;
  }
  move(compositeId, toCompositeId, before) {
    if (before !== void 0) {
      const fromIndex = this.model.items.findIndex((c) => c.id === compositeId);
      let toIndex = this.model.items.findIndex((c) => c.id === toCompositeId);
      if (fromIndex >= 0 && toIndex >= 0) {
        if (!before && fromIndex > toIndex) {
          toIndex++;
        }
        if (before && fromIndex < toIndex) {
          toIndex--;
        }
        if (toIndex < this.model.items.length && toIndex >= 0 && toIndex !== fromIndex) {
          if (this.model.move(this.model.items[fromIndex].id, this.model.items[toIndex].id)) {
            setTimeout(() => this.updateCompositeSwitcher(), 0);
          }
        }
      }
    } else {
      if (this.model.move(compositeId, toCompositeId)) {
        setTimeout(() => this.updateCompositeSwitcher(), 0);
      }
    }
  }
  getAction(compositeId) {
    const item = this.model.findItem(compositeId);
    return item?.activityAction;
  }
  computeSizes(items) {
    const size = this.options.compositeSize;
    if (size) {
      items.forEach((composite) => this.compositeSizeInBar.set(composite.id, size));
    } else {
      const compositeSwitcherBar = this.compositeSwitcherBar;
      if (compositeSwitcherBar && this.dimension && this.dimension.height !== 0 && this.dimension.width !== 0) {
        const currentItemsLength = compositeSwitcherBar.viewItems.length;
        compositeSwitcherBar.push(items.map((composite) => composite.activityAction));
        items.map((composite, index) => this.compositeSizeInBar.set(
          composite.id,
          this.options.orientation === ActionsOrientation.VERTICAL ? compositeSwitcherBar.getHeight(currentItemsLength + index) : compositeSwitcherBar.getWidth(currentItemsLength + index)
        ));
        items.forEach(() => compositeSwitcherBar.pull(compositeSwitcherBar.viewItems.length - 1));
      }
    }
  }
  updateCompositeSwitcher() {
    const compositeSwitcherBar = this.compositeSwitcherBar;
    if (!compositeSwitcherBar || !this.dimension) {
      return;
    }
    let compositesToShow = this.model.visibleItems.filter(
      (item) => item.pinned || this.model.activeItem && this.model.activeItem.id === item.id
      /* Show the active composite even if it is not pinned */
    ).map((item) => item.id);
    let maxVisible = compositesToShow.length;
    const totalComposites = compositesToShow.length;
    let size = 0;
    const limit = this.options.orientation === ActionsOrientation.VERTICAL ? this.dimension.height : this.dimension.width;
    for (let i = 0; i < compositesToShow.length; i++) {
      const compositeSize = this.compositeSizeInBar.get(compositesToShow[i]);
      if (size + compositeSize > limit) {
        maxVisible = i;
        break;
      }
      size += compositeSize;
    }
    if (totalComposites > maxVisible) {
      compositesToShow = compositesToShow.slice(0, maxVisible);
    }
    if (this.model.activeItem && compositesToShow.every((compositeId) => !!this.model.activeItem && compositeId !== this.model.activeItem.id)) {
      size += this.compositeSizeInBar.get(this.model.activeItem.id);
      compositesToShow.push(this.model.activeItem.id);
    }
    while (size > limit && compositesToShow.length) {
      const removedComposite = compositesToShow.length > 1 ? compositesToShow.splice(compositesToShow.length - 2, 1)[0] : compositesToShow.pop();
      size -= this.compositeSizeInBar.get(removedComposite);
    }
    if (totalComposites > compositesToShow.length) {
      size += this.options.overflowActionSize;
    }
    while (size > limit && compositesToShow.length) {
      const removedComposite = compositesToShow.length > 1 && compositesToShow[compositesToShow.length - 1] === this.model.activeItem?.id ? compositesToShow.splice(compositesToShow.length - 2, 1)[0] : compositesToShow.pop();
      size -= this.compositeSizeInBar.get(removedComposite);
    }
    if (totalComposites === compositesToShow.length && this.compositeOverflowAction) {
      compositeSwitcherBar.pull(compositeSwitcherBar.length() - 1);
      this.compositeOverflowAction.dispose();
      this.compositeOverflowAction = void 0;
      this.compositeOverflowActionViewItem?.dispose();
      this.compositeOverflowActionViewItem = void 0;
    }
    const compositesToRemove = [];
    this.visibleComposites.forEach((compositeId, index) => {
      if (!compositesToShow.includes(compositeId)) {
        compositesToRemove.push(index);
      }
    });
    compositesToRemove.reverse().forEach((index) => {
      compositeSwitcherBar.pull(index);
      this.visibleComposites.splice(index, 1);
    });
    compositesToShow.forEach((compositeId, newIndex) => {
      const currentIndex = this.visibleComposites.indexOf(compositeId);
      if (newIndex !== currentIndex) {
        if (currentIndex !== -1) {
          compositeSwitcherBar.pull(currentIndex);
          this.visibleComposites.splice(currentIndex, 1);
        }
        compositeSwitcherBar.push(this.model.findItem(compositeId).activityAction, { label: true, icon: this.options.icon, index: newIndex });
        this.visibleComposites.splice(newIndex, 0, compositeId);
      }
    });
    if (totalComposites > compositesToShow.length && !this.compositeOverflowAction) {
      this.compositeOverflowAction = this._register(this.instantiationService.createInstance(CompositeOverflowActivityAction, () => {
        this.compositeOverflowActionViewItem?.showMenu();
      }));
      this.compositeOverflowActionViewItem = this._register(this.instantiationService.createInstance(
        CompositeOverflowActivityActionViewItem,
        this.compositeOverflowAction,
        () => this.getOverflowingComposites(),
        () => this.model.activeItem ? this.model.activeItem.id : void 0,
        (compositeId) => {
          const item = this.model.findItem(compositeId);
          return item?.activity[0]?.badge;
        },
        this.options.getOnCompositeClickAction,
        this.options.colors,
        this.options.activityHoverOptions
      ));
      compositeSwitcherBar.push(this.compositeOverflowAction, { label: false, icon: true });
    }
    this._onDidChange.fire();
  }
  getOverflowingComposites() {
    let overflowingIds = this.model.visibleItems.filter((item) => item.pinned).map((item) => item.id);
    if (this.model.activeItem && !this.model.activeItem.pinned) {
      overflowingIds.push(this.model.activeItem.id);
    }
    overflowingIds = overflowingIds.filter((compositeId) => !this.visibleComposites.includes(compositeId));
    return this.model.visibleItems.filter((c) => overflowingIds.includes(c.id)).map((item) => {
      return { id: item.id, name: this.getAction(item.id)?.label || item.name };
    });
  }
  showContextMenu(targetWindow, e) {
    EventHelper.stop(e, true);
    const event = new StandardMouseEvent(targetWindow, e);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => this.getContextMenuActions(e), "getActions")
    });
  }
  getContextMenuActions(e) {
    const actions = this.model.visibleItems.map(({ id, name, activityAction }) => toAction({
      id,
      label: this.getAction(id).label || name || id,
      checked: this.isPinned(id),
      enabled: activityAction.enabled,
      run: /* @__PURE__ */ __name(() => {
        if (this.isPinned(id)) {
          this.unpin(id);
        } else {
          this.pin(id, true);
        }
      }, "run")
    }));
    this.options.fillExtraContextMenuActions(actions, e);
    return actions;
  }
};
CompositeBar = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IViewDescriptorService)
], CompositeBar);
class CompositeBarModel {
  static {
    __name(this, "CompositeBarModel");
  }
  _items = [];
  get items() {
    return this._items;
  }
  options;
  activeItem;
  constructor(items, options) {
    this.options = options;
    this.setItems(items);
  }
  setItems(items) {
    this._items = [];
    this._items = items.map((i) => this.createCompositeBarItem(i.id, i.name, i.order, i.pinned, i.visible));
  }
  get visibleItems() {
    return this.items.filter((item) => item.visible);
  }
  get pinnedItems() {
    return this.items.filter((item) => item.visible && item.pinned);
  }
  createCompositeBarItem(id, name, order, pinned, visible) {
    const options = this.options;
    return {
      id,
      name,
      pinned,
      order,
      visible,
      activity: [],
      get activityAction() {
        return options.getActivityAction(id);
      },
      get pinnedAction() {
        return options.getCompositePinnedAction(id);
      },
      get toggleBadgeAction() {
        return options.getCompositeBadgeAction(id);
      }
    };
  }
  add(id, name, order, requestedIndex) {
    const item = this.findItem(id);
    if (item) {
      let changed = false;
      item.name = name;
      if (!isUndefinedOrNull(order)) {
        changed = item.order !== order;
        item.order = order;
      }
      if (!item.visible) {
        item.visible = true;
        changed = true;
      }
      return changed;
    } else {
      const item2 = this.createCompositeBarItem(id, name, order, true, true);
      if (!isUndefinedOrNull(requestedIndex)) {
        let index = 0;
        let rIndex = requestedIndex;
        while (rIndex > 0 && index < this.items.length) {
          if (this.items[index++].visible) {
            rIndex--;
          }
        }
        this.items.splice(index, 0, item2);
      } else if (isUndefinedOrNull(order)) {
        this.items.push(item2);
      } else {
        let index = 0;
        while (index < this.items.length && typeof this.items[index].order === "number" && this.items[index].order < order) {
          index++;
        }
        this.items.splice(index, 0, item2);
      }
      return true;
    }
  }
  remove(id) {
    for (let index = 0; index < this.items.length; index++) {
      if (this.items[index].id === id) {
        this.items.splice(index, 1);
        return true;
      }
    }
    return false;
  }
  hide(id) {
    for (const item of this.items) {
      if (item.id === id) {
        if (item.visible) {
          item.visible = false;
          return true;
        }
        return false;
      }
    }
    return false;
  }
  move(compositeId, toCompositeId) {
    const fromIndex = this.findIndex(compositeId);
    const toIndex = this.findIndex(toCompositeId);
    if (fromIndex === -1 || toIndex === -1) {
      return false;
    }
    const sourceItem = this.items.splice(fromIndex, 1)[0];
    this.items.splice(toIndex, 0, sourceItem);
    sourceItem.pinned = true;
    return true;
  }
  setPinned(id, pinned) {
    for (const item of this.items) {
      if (item.id === id) {
        if (item.pinned !== pinned) {
          item.pinned = pinned;
          return true;
        }
        return false;
      }
    }
    return false;
  }
  activate(id) {
    if (!this.activeItem || this.activeItem.id !== id) {
      if (this.activeItem) {
        this.deactivate();
      }
      for (const item of this.items) {
        if (item.id === id) {
          this.activeItem = item;
          this.activeItem.activityAction.activate();
          return true;
        }
      }
    }
    return false;
  }
  deactivate() {
    if (this.activeItem) {
      this.activeItem.activityAction.deactivate();
      this.activeItem = void 0;
      return true;
    }
    return false;
  }
  findItem(id) {
    return this.items.filter((item) => item.id === id)[0];
  }
  findIndex(id) {
    for (let index = 0; index < this.items.length; index++) {
      if (this.items[index].id === id) {
        return index;
      }
    }
    return -1;
  }
}
export {
  CompositeBar,
  CompositeDragAndDrop
};
//# sourceMappingURL=compositeBar.js.map
