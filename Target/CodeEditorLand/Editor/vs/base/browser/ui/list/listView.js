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
import { distinct, equals } from "../../../common/arrays.js";
import { Delayer, disposableTimeout } from "../../../common/async.js";
import { memoize } from "../../../common/decorators.js";
import { BugIndicatingError } from "../../../common/errors.js";
import {
  Emitter,
  Event
} from "../../../common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../common/lifecycle.js";
import { clamp } from "../../../common/numbers.js";
import { Range } from "../../../common/range.js";
import {
  Scrollable,
  ScrollbarVisibility
} from "../../../common/scrollable.js";
import { DataTransfers } from "../../dnd.js";
import {
  $,
  addDisposableListener,
  animate,
  getContentHeight,
  getContentWidth,
  getTopLeftOffset,
  getWindow,
  isAncestor,
  isHTMLElement,
  isSVGElement,
  scheduleAtNextAnimationFrame
} from "../../dom.js";
import { DomEmitter } from "../../event.js";
import {
  Gesture,
  EventType as TouchEventType
} from "../../touch.js";
import { SmoothScrollableElement } from "../scrollbar/scrollableElement.js";
import {
  ListDragOverEffectPosition,
  ListDragOverEffectType
} from "./list.js";
import { RangeMap, shift } from "./rangeMap.js";
import { RowCache } from "./rowCache.js";
const StaticDND = {
  CurrentDragAndDropData: void 0
};
var ListViewTargetSector = /* @__PURE__ */ ((ListViewTargetSector2) => {
  ListViewTargetSector2[ListViewTargetSector2["TOP"] = 0] = "TOP";
  ListViewTargetSector2[ListViewTargetSector2["CENTER_TOP"] = 1] = "CENTER_TOP";
  ListViewTargetSector2[ListViewTargetSector2["CENTER_BOTTOM"] = 2] = "CENTER_BOTTOM";
  ListViewTargetSector2[ListViewTargetSector2["BOTTOM"] = 3] = "BOTTOM";
  return ListViewTargetSector2;
})(ListViewTargetSector || {});
const DefaultOptions = {
  useShadows: true,
  verticalScrollMode: ScrollbarVisibility.Auto,
  setRowLineHeight: true,
  setRowHeight: true,
  supportDynamicHeights: false,
  dnd: {
    getDragElements(e) {
      return [e];
    },
    getDragURI() {
      return null;
    },
    onDragStart() {
    },
    onDragOver() {
      return false;
    },
    drop() {
    },
    dispose() {
    }
  },
  horizontalScrolling: false,
  transformOptimization: true,
  alwaysConsumeMouseWheel: true
};
class ElementsDragAndDropData {
  static {
    __name(this, "ElementsDragAndDropData");
  }
  elements;
  _context;
  get context() {
    return this._context;
  }
  set context(value) {
    this._context = value;
  }
  constructor(elements) {
    this.elements = elements;
  }
  update() {
  }
  getData() {
    return this.elements;
  }
}
class ExternalElementsDragAndDropData {
  static {
    __name(this, "ExternalElementsDragAndDropData");
  }
  elements;
  constructor(elements) {
    this.elements = elements;
  }
  update() {
  }
  getData() {
    return this.elements;
  }
}
class NativeDragAndDropData {
  static {
    __name(this, "NativeDragAndDropData");
  }
  types;
  files;
  constructor() {
    this.types = [];
    this.files = [];
  }
  update(dataTransfer) {
    if (dataTransfer.types) {
      this.types.splice(0, this.types.length, ...dataTransfer.types);
    }
    if (dataTransfer.files) {
      this.files.splice(0, this.files.length);
      for (let i = 0; i < dataTransfer.files.length; i++) {
        const file = dataTransfer.files.item(i);
        if (file && (file.size || file.type)) {
          this.files.push(file);
        }
      }
    }
  }
  getData() {
    return {
      types: this.types,
      files: this.files
    };
  }
}
function equalsDragFeedback(f1, f2) {
  if (Array.isArray(f1) && Array.isArray(f2)) {
    return equals(f1, f2);
  }
  return f1 === f2;
}
__name(equalsDragFeedback, "equalsDragFeedback");
class ListViewAccessibilityProvider {
  static {
    __name(this, "ListViewAccessibilityProvider");
  }
  getSetSize;
  getPosInSet;
  getRole;
  isChecked;
  constructor(accessibilityProvider) {
    if (accessibilityProvider?.getSetSize) {
      this.getSetSize = accessibilityProvider.getSetSize.bind(
        accessibilityProvider
      );
    } else {
      this.getSetSize = (e, i, l) => l;
    }
    if (accessibilityProvider?.getPosInSet) {
      this.getPosInSet = accessibilityProvider.getPosInSet.bind(
        accessibilityProvider
      );
    } else {
      this.getPosInSet = (e, i) => i + 1;
    }
    if (accessibilityProvider?.getRole) {
      this.getRole = accessibilityProvider.getRole.bind(
        accessibilityProvider
      );
    } else {
      this.getRole = (_) => "listitem";
    }
    if (accessibilityProvider?.isChecked) {
      this.isChecked = accessibilityProvider.isChecked.bind(
        accessibilityProvider
      );
    } else {
      this.isChecked = (_) => void 0;
    }
  }
}
const _ListView = class _ListView {
  constructor(container, virtualDelegate, renderers, options = DefaultOptions) {
    this.virtualDelegate = virtualDelegate;
    if (options.horizontalScrolling && options.supportDynamicHeights) {
      throw new Error(
        "Horizontal scrolling and dynamic heights not supported simultaneously"
      );
    }
    this.items = [];
    this.itemId = 0;
    this.rangeMap = this.createRangeMap(options.paddingTop ?? 0);
    for (const renderer of renderers) {
      this.renderers.set(renderer.templateId, renderer);
    }
    this.cache = this.disposables.add(new RowCache(this.renderers));
    this.lastRenderTop = 0;
    this.lastRenderHeight = 0;
    this.domNode = document.createElement("div");
    this.domNode.className = "monaco-list";
    this.domNode.classList.add(this.domId);
    this.domNode.tabIndex = 0;
    this.domNode.classList.toggle(
      "mouse-support",
      typeof options.mouseSupport === "boolean" ? options.mouseSupport : true
    );
    this._horizontalScrolling = options.horizontalScrolling ?? DefaultOptions.horizontalScrolling;
    this.domNode.classList.toggle(
      "horizontal-scrolling",
      this._horizontalScrolling
    );
    this.paddingBottom = typeof options.paddingBottom === "undefined" ? 0 : options.paddingBottom;
    this.accessibilityProvider = new ListViewAccessibilityProvider(
      options.accessibilityProvider
    );
    this.rowsContainer = document.createElement("div");
    this.rowsContainer.className = "monaco-list-rows";
    const transformOptimization = options.transformOptimization ?? DefaultOptions.transformOptimization;
    if (transformOptimization) {
      this.rowsContainer.style.transform = "translate3d(0px, 0px, 0px)";
      this.rowsContainer.style.overflow = "hidden";
      this.rowsContainer.style.contain = "strict";
    }
    this.disposables.add(Gesture.addTarget(this.rowsContainer));
    this.scrollable = this.disposables.add(
      new Scrollable({
        forceIntegerValues: true,
        smoothScrollDuration: options.smoothScrolling ?? false ? 125 : 0,
        scheduleAtNextAnimationFrame: /* @__PURE__ */ __name((cb) => scheduleAtNextAnimationFrame(getWindow(this.domNode), cb), "scheduleAtNextAnimationFrame")
      })
    );
    this.scrollableElement = this.disposables.add(
      new SmoothScrollableElement(
        this.rowsContainer,
        {
          alwaysConsumeMouseWheel: options.alwaysConsumeMouseWheel ?? DefaultOptions.alwaysConsumeMouseWheel,
          horizontal: ScrollbarVisibility.Auto,
          vertical: options.verticalScrollMode ?? DefaultOptions.verticalScrollMode,
          useShadows: options.useShadows ?? DefaultOptions.useShadows,
          mouseWheelScrollSensitivity: options.mouseWheelScrollSensitivity,
          fastScrollSensitivity: options.fastScrollSensitivity,
          scrollByPage: options.scrollByPage
        },
        this.scrollable
      )
    );
    this.domNode.appendChild(this.scrollableElement.getDomNode());
    container.appendChild(this.domNode);
    this.scrollableElement.onScroll(this.onScroll, this, this.disposables);
    this.disposables.add(
      addDisposableListener(
        this.rowsContainer,
        TouchEventType.Change,
        (e) => this.onTouchChange(e)
      )
    );
    this.disposables.add(
      addDisposableListener(
        this.scrollableElement.getDomNode(),
        "scroll",
        (e) => e.target.scrollTop = 0
      )
    );
    this.disposables.add(
      addDisposableListener(
        this.domNode,
        "dragover",
        (e) => this.onDragOver(this.toDragEvent(e))
      )
    );
    this.disposables.add(
      addDisposableListener(
        this.domNode,
        "drop",
        (e) => this.onDrop(this.toDragEvent(e))
      )
    );
    this.disposables.add(
      addDisposableListener(
        this.domNode,
        "dragleave",
        (e) => this.onDragLeave(this.toDragEvent(e))
      )
    );
    this.disposables.add(
      addDisposableListener(
        this.domNode,
        "dragend",
        (e) => this.onDragEnd(e)
      )
    );
    this.setRowLineHeight = options.setRowLineHeight ?? DefaultOptions.setRowLineHeight;
    this.setRowHeight = options.setRowHeight ?? DefaultOptions.setRowHeight;
    this.supportDynamicHeights = options.supportDynamicHeights ?? DefaultOptions.supportDynamicHeights;
    this.dnd = options.dnd ?? this.disposables.add(DefaultOptions.dnd);
    this.layout(options.initialSize?.height, options.initialSize?.width);
  }
  static {
    __name(this, "ListView");
  }
  static InstanceCount = 0;
  domId = `list_id_${++_ListView.InstanceCount}`;
  domNode;
  items;
  itemId;
  rangeMap;
  cache;
  renderers = /* @__PURE__ */ new Map();
  lastRenderTop;
  lastRenderHeight;
  renderWidth = 0;
  rowsContainer;
  scrollable;
  scrollableElement;
  _scrollHeight = 0;
  scrollableElementUpdateDisposable = null;
  scrollableElementWidthDelayer = new Delayer(50);
  splicing = false;
  dragOverAnimationDisposable;
  dragOverAnimationStopDisposable = Disposable.None;
  dragOverMouseY = 0;
  setRowLineHeight;
  setRowHeight;
  supportDynamicHeights;
  paddingBottom;
  accessibilityProvider;
  scrollWidth;
  dnd;
  canDrop = false;
  currentDragData;
  currentDragFeedback;
  currentDragFeedbackPosition;
  currentDragFeedbackDisposable = Disposable.None;
  onDragLeaveTimeout = Disposable.None;
  disposables = new DisposableStore();
  _onDidChangeContentHeight = new Emitter();
  _onDidChangeContentWidth = new Emitter();
  onDidChangeContentHeight = Event.latch(
    this._onDidChangeContentHeight.event,
    void 0,
    this.disposables
  );
  onDidChangeContentWidth = Event.latch(
    this._onDidChangeContentWidth.event,
    void 0,
    this.disposables
  );
  get contentHeight() {
    return this.rangeMap.size;
  }
  get contentWidth() {
    return this.scrollWidth ?? 0;
  }
  get onDidScroll() {
    return this.scrollableElement.onScroll;
  }
  get onWillScroll() {
    return this.scrollableElement.onWillScroll;
  }
  get containerDomNode() {
    return this.rowsContainer;
  }
  get scrollableElementDomNode() {
    return this.scrollableElement.getDomNode();
  }
  _horizontalScrolling = false;
  get horizontalScrolling() {
    return this._horizontalScrolling;
  }
  set horizontalScrolling(value) {
    if (value === this._horizontalScrolling) {
      return;
    }
    if (value && this.supportDynamicHeights) {
      throw new Error(
        "Horizontal scrolling and dynamic heights not supported simultaneously"
      );
    }
    this._horizontalScrolling = value;
    this.domNode.classList.toggle(
      "horizontal-scrolling",
      this._horizontalScrolling
    );
    if (this._horizontalScrolling) {
      for (const item of this.items) {
        this.measureItemWidth(item);
      }
      this.updateScrollWidth();
      this.scrollableElement.setScrollDimensions({
        width: getContentWidth(this.domNode)
      });
      this.rowsContainer.style.width = `${Math.max(this.scrollWidth || 0, this.renderWidth)}px`;
    } else {
      this.scrollableElementWidthDelayer.cancel();
      this.scrollableElement.setScrollDimensions({
        width: this.renderWidth,
        scrollWidth: this.renderWidth
      });
      this.rowsContainer.style.width = "";
    }
  }
  updateOptions(options) {
    if (options.paddingBottom !== void 0) {
      this.paddingBottom = options.paddingBottom;
      this.scrollableElement.setScrollDimensions({
        scrollHeight: this.scrollHeight
      });
    }
    if (options.smoothScrolling !== void 0) {
      this.scrollable.setSmoothScrollDuration(
        options.smoothScrolling ? 125 : 0
      );
    }
    if (options.horizontalScrolling !== void 0) {
      this.horizontalScrolling = options.horizontalScrolling;
    }
    let scrollableOptions;
    if (options.scrollByPage !== void 0) {
      scrollableOptions = {
        ...scrollableOptions ?? {},
        scrollByPage: options.scrollByPage
      };
    }
    if (options.mouseWheelScrollSensitivity !== void 0) {
      scrollableOptions = {
        ...scrollableOptions ?? {},
        mouseWheelScrollSensitivity: options.mouseWheelScrollSensitivity
      };
    }
    if (options.fastScrollSensitivity !== void 0) {
      scrollableOptions = {
        ...scrollableOptions ?? {},
        fastScrollSensitivity: options.fastScrollSensitivity
      };
    }
    if (scrollableOptions) {
      this.scrollableElement.updateOptions(scrollableOptions);
    }
    if (options.paddingTop !== void 0 && options.paddingTop !== this.rangeMap.paddingTop) {
      const lastRenderRange = this.getRenderRange(
        this.lastRenderTop,
        this.lastRenderHeight
      );
      const offset = options.paddingTop - this.rangeMap.paddingTop;
      this.rangeMap.paddingTop = options.paddingTop;
      this.render(
        lastRenderRange,
        Math.max(0, this.lastRenderTop + offset),
        this.lastRenderHeight,
        void 0,
        void 0,
        true
      );
      this.setScrollTop(this.lastRenderTop);
      this.eventuallyUpdateScrollDimensions();
      if (this.supportDynamicHeights) {
        this._rerender(this.lastRenderTop, this.lastRenderHeight);
      }
    }
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this.scrollableElement.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this.scrollableElement.delegateVerticalScrollbarPointerDown(
      browserEvent
    );
  }
  updateElementHeight(index, size, anchorIndex) {
    if (index < 0 || index >= this.items.length) {
      return;
    }
    const originalSize = this.items[index].size;
    if (typeof size === "undefined") {
      if (!this.supportDynamicHeights) {
        console.warn(
          "Dynamic heights not supported",
          new Error().stack
        );
        return;
      }
      this.items[index].lastDynamicHeightWidth = void 0;
      size = originalSize + this.probeDynamicHeight(index);
    }
    if (originalSize === size) {
      return;
    }
    const lastRenderRange = this.getRenderRange(
      this.lastRenderTop,
      this.lastRenderHeight
    );
    let heightDiff = 0;
    if (index < lastRenderRange.start) {
      heightDiff = size - originalSize;
    } else if (anchorIndex !== null && anchorIndex > index && anchorIndex < lastRenderRange.end) {
      heightDiff = size - originalSize;
    } else {
      heightDiff = 0;
    }
    this.rangeMap.splice(index, 1, [{ size }]);
    this.items[index].size = size;
    this.render(
      lastRenderRange,
      Math.max(0, this.lastRenderTop + heightDiff),
      this.lastRenderHeight,
      void 0,
      void 0,
      true
    );
    this.setScrollTop(this.lastRenderTop);
    this.eventuallyUpdateScrollDimensions();
    if (this.supportDynamicHeights) {
      this._rerender(this.lastRenderTop, this.lastRenderHeight);
    }
  }
  createRangeMap(paddingTop) {
    return new RangeMap(paddingTop);
  }
  splice(start, deleteCount, elements = []) {
    if (this.splicing) {
      throw new Error("Can't run recursive splices.");
    }
    this.splicing = true;
    try {
      return this._splice(start, deleteCount, elements);
    } finally {
      this.splicing = false;
      this._onDidChangeContentHeight.fire(this.contentHeight);
    }
  }
  _splice(start, deleteCount, elements = []) {
    const previousRenderRange = this.getRenderRange(
      this.lastRenderTop,
      this.lastRenderHeight
    );
    const deleteRange = { start, end: start + deleteCount };
    const removeRange = Range.intersect(previousRenderRange, deleteRange);
    const rowsToDispose = /* @__PURE__ */ new Map();
    for (let i = removeRange.end - 1; i >= removeRange.start; i--) {
      const item = this.items[i];
      item.dragStartDisposable.dispose();
      item.checkedDisposable.dispose();
      if (item.row) {
        let rows = rowsToDispose.get(item.templateId);
        if (!rows) {
          rows = [];
          rowsToDispose.set(item.templateId, rows);
        }
        const renderer = this.renderers.get(item.templateId);
        if (renderer && renderer.disposeElement) {
          renderer.disposeElement(
            item.element,
            i,
            item.row.templateData,
            item.size
          );
        }
        rows.unshift(item.row);
      }
      item.row = null;
      item.stale = true;
    }
    const previousRestRange = {
      start: start + deleteCount,
      end: this.items.length
    };
    const previousRenderedRestRange = Range.intersect(
      previousRestRange,
      previousRenderRange
    );
    const previousUnrenderedRestRanges = Range.relativeComplement(
      previousRestRange,
      previousRenderRange
    );
    const inserted = elements.map((element) => ({
      id: String(this.itemId++),
      element,
      templateId: this.virtualDelegate.getTemplateId(element),
      size: this.virtualDelegate.getHeight(element),
      width: void 0,
      hasDynamicHeight: !!this.virtualDelegate.hasDynamicHeight && this.virtualDelegate.hasDynamicHeight(element),
      lastDynamicHeightWidth: void 0,
      row: null,
      uri: void 0,
      dropTarget: false,
      dragStartDisposable: Disposable.None,
      checkedDisposable: Disposable.None,
      stale: false
    }));
    let deleted;
    if (start === 0 && deleteCount >= this.items.length) {
      this.rangeMap = this.createRangeMap(this.rangeMap.paddingTop);
      this.rangeMap.splice(0, 0, inserted);
      deleted = this.items;
      this.items = inserted;
    } else {
      this.rangeMap.splice(start, deleteCount, inserted);
      deleted = this.items.splice(start, deleteCount, ...inserted);
    }
    const delta = elements.length - deleteCount;
    const renderRange = this.getRenderRange(
      this.lastRenderTop,
      this.lastRenderHeight
    );
    const renderedRestRange = shift(previousRenderedRestRange, delta);
    const updateRange = Range.intersect(renderRange, renderedRestRange);
    for (let i = updateRange.start; i < updateRange.end; i++) {
      this.updateItemInDOM(this.items[i], i);
    }
    const removeRanges = Range.relativeComplement(
      renderedRestRange,
      renderRange
    );
    for (const range of removeRanges) {
      for (let i = range.start; i < range.end; i++) {
        this.removeItemFromDOM(i);
      }
    }
    const unrenderedRestRanges = previousUnrenderedRestRanges.map(
      (r) => shift(r, delta)
    );
    const elementsRange = { start, end: start + elements.length };
    const insertRanges = [elementsRange, ...unrenderedRestRanges].map((r) => Range.intersect(renderRange, r)).reverse();
    for (const range of insertRanges) {
      for (let i = range.end - 1; i >= range.start; i--) {
        const item = this.items[i];
        const rows = rowsToDispose.get(item.templateId);
        const row = rows?.pop();
        this.insertItemInDOM(i, row);
      }
    }
    for (const rows of rowsToDispose.values()) {
      for (const row of rows) {
        this.cache.release(row);
      }
    }
    this.eventuallyUpdateScrollDimensions();
    if (this.supportDynamicHeights) {
      this._rerender(this.scrollTop, this.renderHeight);
    }
    return deleted.map((i) => i.element);
  }
  eventuallyUpdateScrollDimensions() {
    this._scrollHeight = this.contentHeight;
    this.rowsContainer.style.height = `${this._scrollHeight}px`;
    if (!this.scrollableElementUpdateDisposable) {
      this.scrollableElementUpdateDisposable = scheduleAtNextAnimationFrame(getWindow(this.domNode), () => {
        this.scrollableElement.setScrollDimensions({
          scrollHeight: this.scrollHeight
        });
        this.updateScrollWidth();
        this.scrollableElementUpdateDisposable = null;
      });
    }
  }
  eventuallyUpdateScrollWidth() {
    if (!this.horizontalScrolling) {
      this.scrollableElementWidthDelayer.cancel();
      return;
    }
    this.scrollableElementWidthDelayer.trigger(
      () => this.updateScrollWidth()
    );
  }
  updateScrollWidth() {
    if (!this.horizontalScrolling) {
      return;
    }
    let scrollWidth = 0;
    for (const item of this.items) {
      if (typeof item.width !== "undefined") {
        scrollWidth = Math.max(scrollWidth, item.width);
      }
    }
    this.scrollWidth = scrollWidth;
    this.scrollableElement.setScrollDimensions({
      scrollWidth: scrollWidth === 0 ? 0 : scrollWidth + 10
    });
    this._onDidChangeContentWidth.fire(this.scrollWidth);
  }
  updateWidth(index) {
    if (!this.horizontalScrolling || typeof this.scrollWidth === "undefined") {
      return;
    }
    const item = this.items[index];
    this.measureItemWidth(item);
    if (typeof item.width !== "undefined" && item.width > this.scrollWidth) {
      this.scrollWidth = item.width;
      this.scrollableElement.setScrollDimensions({
        scrollWidth: this.scrollWidth + 10
      });
      this._onDidChangeContentWidth.fire(this.scrollWidth);
    }
  }
  rerender() {
    if (!this.supportDynamicHeights) {
      return;
    }
    for (const item of this.items) {
      item.lastDynamicHeightWidth = void 0;
    }
    this._rerender(this.lastRenderTop, this.lastRenderHeight);
  }
  get length() {
    return this.items.length;
  }
  get renderHeight() {
    const scrollDimensions = this.scrollableElement.getScrollDimensions();
    return scrollDimensions.height;
  }
  get firstVisibleIndex() {
    const range = this.getRenderRange(
      this.lastRenderTop,
      this.lastRenderHeight
    );
    return range.start;
  }
  get firstMostlyVisibleIndex() {
    const firstVisibleIndex = this.firstVisibleIndex;
    const firstElTop = this.rangeMap.positionAt(firstVisibleIndex);
    const nextElTop = this.rangeMap.positionAt(firstVisibleIndex + 1);
    if (nextElTop !== -1) {
      const firstElMidpoint = (nextElTop - firstElTop) / 2 + firstElTop;
      if (firstElMidpoint < this.scrollTop) {
        return firstVisibleIndex + 1;
      }
    }
    return firstVisibleIndex;
  }
  get lastVisibleIndex() {
    const range = this.getRenderRange(
      this.lastRenderTop,
      this.lastRenderHeight
    );
    return range.end - 1;
  }
  element(index) {
    return this.items[index].element;
  }
  indexOf(element) {
    return this.items.findIndex((item) => item.element === element);
  }
  domElement(index) {
    const row = this.items[index].row;
    return row && row.domNode;
  }
  elementHeight(index) {
    return this.items[index].size;
  }
  elementTop(index) {
    return this.rangeMap.positionAt(index);
  }
  indexAt(position) {
    return this.rangeMap.indexAt(position);
  }
  indexAfter(position) {
    return this.rangeMap.indexAfter(position);
  }
  layout(height, width) {
    const scrollDimensions = {
      height: typeof height === "number" ? height : getContentHeight(this.domNode)
    };
    if (this.scrollableElementUpdateDisposable) {
      this.scrollableElementUpdateDisposable.dispose();
      this.scrollableElementUpdateDisposable = null;
      scrollDimensions.scrollHeight = this.scrollHeight;
    }
    this.scrollableElement.setScrollDimensions(scrollDimensions);
    if (typeof width !== "undefined") {
      this.renderWidth = width;
      if (this.supportDynamicHeights) {
        this._rerender(this.scrollTop, this.renderHeight);
      }
    }
    if (this.horizontalScrolling) {
      this.scrollableElement.setScrollDimensions({
        width: typeof width === "number" ? width : getContentWidth(this.domNode)
      });
    }
  }
  // Render
  render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM = false) {
    const renderRange = this.getRenderRange(renderTop, renderHeight);
    const rangesToInsert = Range.relativeComplement(
      renderRange,
      previousRenderRange
    ).reverse();
    const rangesToRemove = Range.relativeComplement(
      previousRenderRange,
      renderRange
    );
    if (updateItemsInDOM) {
      const rangesToUpdate = Range.intersect(
        previousRenderRange,
        renderRange
      );
      for (let i = rangesToUpdate.start; i < rangesToUpdate.end; i++) {
        this.updateItemInDOM(this.items[i], i);
      }
    }
    this.cache.transact(() => {
      for (const range of rangesToRemove) {
        for (let i = range.start; i < range.end; i++) {
          this.removeItemFromDOM(i);
        }
      }
      for (const range of rangesToInsert) {
        for (let i = range.end - 1; i >= range.start; i--) {
          this.insertItemInDOM(i);
        }
      }
    });
    if (renderLeft !== void 0) {
      this.rowsContainer.style.left = `-${renderLeft}px`;
    }
    this.rowsContainer.style.top = `-${renderTop}px`;
    if (this.horizontalScrolling && scrollWidth !== void 0) {
      this.rowsContainer.style.width = `${Math.max(scrollWidth, this.renderWidth)}px`;
    }
    this.lastRenderTop = renderTop;
    this.lastRenderHeight = renderHeight;
  }
  // DOM operations
  insertItemInDOM(index, row) {
    const item = this.items[index];
    if (!item.row) {
      if (row) {
        item.row = row;
        item.stale = true;
      } else {
        const result = this.cache.alloc(item.templateId);
        item.row = result.row;
        item.stale ||= result.isReusingConnectedDomNode;
      }
    }
    const role = this.accessibilityProvider.getRole(item.element) || "listitem";
    item.row.domNode.setAttribute("role", role);
    const checked = this.accessibilityProvider.isChecked(item.element);
    if (typeof checked === "boolean") {
      item.row.domNode.setAttribute("aria-checked", String(!!checked));
    } else if (checked) {
      const update = /* @__PURE__ */ __name((checked2) => item.row.domNode.setAttribute(
        "aria-checked",
        String(!!checked2)
      ), "update");
      update(checked.value);
      item.checkedDisposable = checked.onDidChange(
        () => update(checked.value)
      );
    }
    if (item.stale || !item.row.domNode.parentElement) {
      const referenceNode = this.items.at(index + 1)?.row?.domNode ?? null;
      if (item.row.domNode.parentElement !== this.rowsContainer || item.row.domNode.nextElementSibling !== referenceNode) {
        this.rowsContainer.insertBefore(
          item.row.domNode,
          referenceNode
        );
      }
      item.stale = false;
    }
    this.updateItemInDOM(item, index);
    const renderer = this.renderers.get(item.templateId);
    if (!renderer) {
      throw new Error(
        `No renderer found for template id ${item.templateId}`
      );
    }
    renderer?.renderElement(
      item.element,
      index,
      item.row.templateData,
      item.size
    );
    const uri = this.dnd.getDragURI(item.element);
    item.dragStartDisposable.dispose();
    item.row.domNode.draggable = !!uri;
    if (uri) {
      item.dragStartDisposable = addDisposableListener(
        item.row.domNode,
        "dragstart",
        (event) => this.onDragStart(item.element, uri, event)
      );
    }
    if (this.horizontalScrolling) {
      this.measureItemWidth(item);
      this.eventuallyUpdateScrollWidth();
    }
  }
  measureItemWidth(item) {
    if (!item.row || !item.row.domNode) {
      return;
    }
    item.row.domNode.style.width = "fit-content";
    item.width = getContentWidth(item.row.domNode);
    const style = getWindow(item.row.domNode).getComputedStyle(
      item.row.domNode
    );
    if (style.paddingLeft) {
      item.width += Number.parseFloat(style.paddingLeft);
    }
    if (style.paddingRight) {
      item.width += Number.parseFloat(style.paddingRight);
    }
    item.row.domNode.style.width = "";
  }
  updateItemInDOM(item, index) {
    item.row.domNode.style.top = `${this.elementTop(index)}px`;
    if (this.setRowHeight) {
      item.row.domNode.style.height = `${item.size}px`;
    }
    if (this.setRowLineHeight) {
      item.row.domNode.style.lineHeight = `${item.size}px`;
    }
    item.row.domNode.setAttribute("data-index", `${index}`);
    item.row.domNode.setAttribute(
      "data-last-element",
      index === this.length - 1 ? "true" : "false"
    );
    item.row.domNode.setAttribute(
      "data-parity",
      index % 2 === 0 ? "even" : "odd"
    );
    item.row.domNode.setAttribute(
      "aria-setsize",
      String(
        this.accessibilityProvider.getSetSize(
          item.element,
          index,
          this.length
        )
      )
    );
    item.row.domNode.setAttribute(
      "aria-posinset",
      String(this.accessibilityProvider.getPosInSet(item.element, index))
    );
    item.row.domNode.setAttribute("id", this.getElementDomId(index));
    item.row.domNode.classList.toggle("drop-target", item.dropTarget);
  }
  removeItemFromDOM(index) {
    const item = this.items[index];
    item.dragStartDisposable.dispose();
    item.checkedDisposable.dispose();
    if (item.row) {
      const renderer = this.renderers.get(item.templateId);
      if (renderer && renderer.disposeElement) {
        renderer.disposeElement(
          item.element,
          index,
          item.row.templateData,
          item.size
        );
      }
      this.cache.release(item.row);
      item.row = null;
    }
    if (this.horizontalScrolling) {
      this.eventuallyUpdateScrollWidth();
    }
  }
  getScrollTop() {
    const scrollPosition = this.scrollableElement.getScrollPosition();
    return scrollPosition.scrollTop;
  }
  setScrollTop(scrollTop, reuseAnimation) {
    if (this.scrollableElementUpdateDisposable) {
      this.scrollableElementUpdateDisposable.dispose();
      this.scrollableElementUpdateDisposable = null;
      this.scrollableElement.setScrollDimensions({
        scrollHeight: this.scrollHeight
      });
    }
    this.scrollableElement.setScrollPosition({ scrollTop, reuseAnimation });
  }
  getScrollLeft() {
    const scrollPosition = this.scrollableElement.getScrollPosition();
    return scrollPosition.scrollLeft;
  }
  setScrollLeft(scrollLeft) {
    if (this.scrollableElementUpdateDisposable) {
      this.scrollableElementUpdateDisposable.dispose();
      this.scrollableElementUpdateDisposable = null;
      this.scrollableElement.setScrollDimensions({
        scrollWidth: this.scrollWidth
      });
    }
    this.scrollableElement.setScrollPosition({ scrollLeft });
  }
  get scrollTop() {
    return this.getScrollTop();
  }
  set scrollTop(scrollTop) {
    this.setScrollTop(scrollTop);
  }
  get scrollHeight() {
    return this._scrollHeight + (this.horizontalScrolling ? 10 : 0) + this.paddingBottom;
  }
  get onMouseClick() {
    return Event.map(
      this.disposables.add(new DomEmitter(this.domNode, "click")).event,
      (e) => this.toMouseEvent(e),
      this.disposables
    );
  }
  get onMouseDblClick() {
    return Event.map(
      this.disposables.add(new DomEmitter(this.domNode, "dblclick")).event,
      (e) => this.toMouseEvent(e),
      this.disposables
    );
  }
  get onMouseMiddleClick() {
    return Event.filter(
      Event.map(
        this.disposables.add(new DomEmitter(this.domNode, "auxclick")).event,
        (e) => this.toMouseEvent(e),
        this.disposables
      ),
      (e) => e.browserEvent.button === 1,
      this.disposables
    );
  }
  get onMouseUp() {
    return Event.map(
      this.disposables.add(new DomEmitter(this.domNode, "mouseup")).event,
      (e) => this.toMouseEvent(e),
      this.disposables
    );
  }
  get onMouseDown() {
    return Event.map(
      this.disposables.add(new DomEmitter(this.domNode, "mousedown")).event,
      (e) => this.toMouseEvent(e),
      this.disposables
    );
  }
  get onMouseOver() {
    return Event.map(
      this.disposables.add(new DomEmitter(this.domNode, "mouseover")).event,
      (e) => this.toMouseEvent(e),
      this.disposables
    );
  }
  get onMouseMove() {
    return Event.map(
      this.disposables.add(new DomEmitter(this.domNode, "mousemove")).event,
      (e) => this.toMouseEvent(e),
      this.disposables
    );
  }
  get onMouseOut() {
    return Event.map(
      this.disposables.add(new DomEmitter(this.domNode, "mouseout")).event,
      (e) => this.toMouseEvent(e),
      this.disposables
    );
  }
  get onContextMenu() {
    return Event.any(
      Event.map(
        this.disposables.add(
          new DomEmitter(this.domNode, "contextmenu")
        ).event,
        (e) => this.toMouseEvent(e),
        this.disposables
      ),
      Event.map(
        this.disposables.add(
          new DomEmitter(this.domNode, TouchEventType.Contextmenu)
        ).event,
        (e) => this.toGestureEvent(e),
        this.disposables
      )
    );
  }
  get onTouchStart() {
    return Event.map(
      this.disposables.add(new DomEmitter(this.domNode, "touchstart")).event,
      (e) => this.toTouchEvent(e),
      this.disposables
    );
  }
  get onTap() {
    return Event.map(
      this.disposables.add(
        new DomEmitter(this.rowsContainer, TouchEventType.Tap)
      ).event,
      (e) => this.toGestureEvent(e),
      this.disposables
    );
  }
  toMouseEvent(browserEvent) {
    const index = this.getItemIndexFromEventTarget(
      browserEvent.target || null
    );
    const item = typeof index === "undefined" ? void 0 : this.items[index];
    const element = item && item.element;
    return { browserEvent, index, element };
  }
  toTouchEvent(browserEvent) {
    const index = this.getItemIndexFromEventTarget(
      browserEvent.target || null
    );
    const item = typeof index === "undefined" ? void 0 : this.items[index];
    const element = item && item.element;
    return { browserEvent, index, element };
  }
  toGestureEvent(browserEvent) {
    const index = this.getItemIndexFromEventTarget(
      browserEvent.initialTarget || null
    );
    const item = typeof index === "undefined" ? void 0 : this.items[index];
    const element = item && item.element;
    return { browserEvent, index, element };
  }
  toDragEvent(browserEvent) {
    const index = this.getItemIndexFromEventTarget(
      browserEvent.target || null
    );
    const item = typeof index === "undefined" ? void 0 : this.items[index];
    const element = item && item.element;
    const sector = this.getTargetSector(browserEvent, index);
    return { browserEvent, index, element, sector };
  }
  onScroll(e) {
    try {
      const previousRenderRange = this.getRenderRange(
        this.lastRenderTop,
        this.lastRenderHeight
      );
      this.render(
        previousRenderRange,
        e.scrollTop,
        e.height,
        e.scrollLeft,
        e.scrollWidth
      );
      if (this.supportDynamicHeights) {
        this._rerender(e.scrollTop, e.height, e.inSmoothScrolling);
      }
    } catch (err) {
      console.error("Got bad scroll event:", e);
      throw err;
    }
  }
  onTouchChange(event) {
    event.preventDefault();
    event.stopPropagation();
    this.scrollTop -= event.translationY;
  }
  // DND
  onDragStart(element, uri, event) {
    if (!event.dataTransfer) {
      return;
    }
    const elements = this.dnd.getDragElements(element);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setData(DataTransfers.TEXT, uri);
    if (event.dataTransfer.setDragImage) {
      let label;
      if (this.dnd.getDragLabel) {
        label = this.dnd.getDragLabel(elements, event);
      }
      if (typeof label === "undefined") {
        label = String(elements.length);
      }
      const dragImage = $(".monaco-drag-image");
      dragImage.textContent = label;
      const getDragImageContainer = /* @__PURE__ */ __name((e) => {
        while (e && !e.classList.contains("monaco-workbench")) {
          e = e.parentElement;
        }
        return e || this.domNode.ownerDocument;
      }, "getDragImageContainer");
      const container = getDragImageContainer(this.domNode);
      container.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, -10, -10);
      setTimeout(() => dragImage.remove(), 0);
    }
    this.domNode.classList.add("dragging");
    this.currentDragData = new ElementsDragAndDropData(elements);
    StaticDND.CurrentDragAndDropData = new ExternalElementsDragAndDropData(
      elements
    );
    this.dnd.onDragStart?.(this.currentDragData, event);
  }
  onDragOver(event) {
    event.browserEvent.preventDefault();
    this.onDragLeaveTimeout.dispose();
    if (StaticDND.CurrentDragAndDropData && StaticDND.CurrentDragAndDropData.getData() === "vscode-ui") {
      return false;
    }
    this.setupDragAndDropScrollTopAnimation(event.browserEvent);
    if (!event.browserEvent.dataTransfer) {
      return false;
    }
    if (!this.currentDragData) {
      if (StaticDND.CurrentDragAndDropData) {
        this.currentDragData = StaticDND.CurrentDragAndDropData;
      } else {
        if (!event.browserEvent.dataTransfer.types) {
          return false;
        }
        this.currentDragData = new NativeDragAndDropData();
      }
    }
    const result = this.dnd.onDragOver(
      this.currentDragData,
      event.element,
      event.index,
      event.sector,
      event.browserEvent
    );
    this.canDrop = typeof result === "boolean" ? result : result.accept;
    if (!this.canDrop) {
      this.currentDragFeedback = void 0;
      this.currentDragFeedbackDisposable.dispose();
      return false;
    }
    event.browserEvent.dataTransfer.dropEffect = typeof result !== "boolean" && result.effect?.type === ListDragOverEffectType.Copy ? "copy" : "move";
    let feedback;
    if (typeof result !== "boolean" && result.feedback) {
      feedback = result.feedback;
    } else if (typeof event.index === "undefined") {
      feedback = [-1];
    } else {
      feedback = [event.index];
    }
    feedback = distinct(feedback).filter((i) => i >= -1 && i < this.length).sort((a, b) => a - b);
    feedback = feedback[0] === -1 ? [-1] : feedback;
    let dragOverEffectPosition = typeof result !== "boolean" && result.effect && result.effect.position ? result.effect.position : ListDragOverEffectPosition.Over;
    if (equalsDragFeedback(this.currentDragFeedback, feedback) && this.currentDragFeedbackPosition === dragOverEffectPosition) {
      return true;
    }
    this.currentDragFeedback = feedback;
    this.currentDragFeedbackPosition = dragOverEffectPosition;
    this.currentDragFeedbackDisposable.dispose();
    if (feedback[0] === -1) {
      this.domNode.classList.add(dragOverEffectPosition);
      this.rowsContainer.classList.add(dragOverEffectPosition);
      this.currentDragFeedbackDisposable = toDisposable(() => {
        this.domNode.classList.remove(dragOverEffectPosition);
        this.rowsContainer.classList.remove(dragOverEffectPosition);
      });
    } else {
      if (feedback.length > 1 && dragOverEffectPosition !== ListDragOverEffectPosition.Over) {
        throw new Error(
          "Can't use multiple feedbacks with position different than 'over'"
        );
      }
      if (dragOverEffectPosition === ListDragOverEffectPosition.After) {
        if (feedback[0] < this.length - 1) {
          feedback[0] += 1;
          dragOverEffectPosition = ListDragOverEffectPosition.Before;
        }
      }
      for (const index of feedback) {
        const item = this.items[index];
        item.dropTarget = true;
        item.row?.domNode.classList.add(dragOverEffectPosition);
      }
      this.currentDragFeedbackDisposable = toDisposable(() => {
        for (const index of feedback) {
          const item = this.items[index];
          item.dropTarget = false;
          item.row?.domNode.classList.remove(dragOverEffectPosition);
        }
      });
    }
    return true;
  }
  onDragLeave(event) {
    this.onDragLeaveTimeout.dispose();
    this.onDragLeaveTimeout = disposableTimeout(
      () => this.clearDragOverFeedback(),
      100,
      this.disposables
    );
    if (this.currentDragData) {
      this.dnd.onDragLeave?.(
        this.currentDragData,
        event.element,
        event.index,
        event.browserEvent
      );
    }
  }
  onDrop(event) {
    if (!this.canDrop) {
      return;
    }
    const dragData = this.currentDragData;
    this.teardownDragAndDropScrollTopAnimation();
    this.clearDragOverFeedback();
    this.domNode.classList.remove("dragging");
    this.currentDragData = void 0;
    StaticDND.CurrentDragAndDropData = void 0;
    if (!dragData || !event.browserEvent.dataTransfer) {
      return;
    }
    event.browserEvent.preventDefault();
    dragData.update(event.browserEvent.dataTransfer);
    this.dnd.drop(
      dragData,
      event.element,
      event.index,
      event.sector,
      event.browserEvent
    );
  }
  onDragEnd(event) {
    this.canDrop = false;
    this.teardownDragAndDropScrollTopAnimation();
    this.clearDragOverFeedback();
    this.domNode.classList.remove("dragging");
    this.currentDragData = void 0;
    StaticDND.CurrentDragAndDropData = void 0;
    this.dnd.onDragEnd?.(event);
  }
  clearDragOverFeedback() {
    this.currentDragFeedback = void 0;
    this.currentDragFeedbackPosition = void 0;
    this.currentDragFeedbackDisposable.dispose();
    this.currentDragFeedbackDisposable = Disposable.None;
  }
  // DND scroll top animation
  setupDragAndDropScrollTopAnimation(event) {
    if (!this.dragOverAnimationDisposable) {
      const viewTop = getTopLeftOffset(this.domNode).top;
      this.dragOverAnimationDisposable = animate(
        getWindow(this.domNode),
        this.animateDragAndDropScrollTop.bind(this, viewTop)
      );
    }
    this.dragOverAnimationStopDisposable.dispose();
    this.dragOverAnimationStopDisposable = disposableTimeout(
      () => {
        if (this.dragOverAnimationDisposable) {
          this.dragOverAnimationDisposable.dispose();
          this.dragOverAnimationDisposable = void 0;
        }
      },
      1e3,
      this.disposables
    );
    this.dragOverMouseY = event.pageY;
  }
  animateDragAndDropScrollTop(viewTop) {
    if (this.dragOverMouseY === void 0) {
      return;
    }
    const diff = this.dragOverMouseY - viewTop;
    const upperLimit = this.renderHeight - 35;
    if (diff < 35) {
      this.scrollTop += Math.max(-14, Math.floor(0.3 * (diff - 35)));
    } else if (diff > upperLimit) {
      this.scrollTop += Math.min(
        14,
        Math.floor(0.3 * (diff - upperLimit))
      );
    }
  }
  teardownDragAndDropScrollTopAnimation() {
    this.dragOverAnimationStopDisposable.dispose();
    if (this.dragOverAnimationDisposable) {
      this.dragOverAnimationDisposable.dispose();
      this.dragOverAnimationDisposable = void 0;
    }
  }
  // Util
  getTargetSector(browserEvent, targetIndex) {
    if (targetIndex === void 0) {
      return void 0;
    }
    const relativePosition = browserEvent.offsetY / this.items[targetIndex].size;
    const sector = Math.floor(relativePosition / 0.25);
    return clamp(sector, 0, 3);
  }
  getItemIndexFromEventTarget(target) {
    const scrollableElement = this.scrollableElement.getDomNode();
    let element = target;
    while ((isHTMLElement(element) || isSVGElement(element)) && element !== this.rowsContainer && scrollableElement.contains(element)) {
      const rawIndex = element.getAttribute("data-index");
      if (rawIndex) {
        const index = Number(rawIndex);
        if (!isNaN(index)) {
          return index;
        }
      }
      element = element.parentElement;
    }
    return void 0;
  }
  getRenderRange(renderTop, renderHeight) {
    return {
      start: this.rangeMap.indexAt(renderTop),
      end: this.rangeMap.indexAfter(renderTop + renderHeight - 1)
    };
  }
  /**
   * Given a stable rendered state, checks every rendered element whether it needs
   * to be probed for dynamic height. Adjusts scroll height and top if necessary.
   */
  _rerender(renderTop, renderHeight, inSmoothScrolling) {
    const previousRenderRange = this.getRenderRange(
      renderTop,
      renderHeight
    );
    let anchorElementIndex;
    let anchorElementTopDelta;
    if (renderTop === this.elementTop(previousRenderRange.start)) {
      anchorElementIndex = previousRenderRange.start;
      anchorElementTopDelta = 0;
    } else if (previousRenderRange.end - previousRenderRange.start > 1) {
      anchorElementIndex = previousRenderRange.start + 1;
      anchorElementTopDelta = this.elementTop(anchorElementIndex) - renderTop;
    }
    let heightDiff = 0;
    while (true) {
      const renderRange = this.getRenderRange(renderTop, renderHeight);
      let didChange = false;
      for (let i = renderRange.start; i < renderRange.end; i++) {
        const diff = this.probeDynamicHeight(i);
        if (diff !== 0) {
          this.rangeMap.splice(i, 1, [this.items[i]]);
        }
        heightDiff += diff;
        didChange = didChange || diff !== 0;
      }
      if (!didChange) {
        if (heightDiff !== 0) {
          this.eventuallyUpdateScrollDimensions();
        }
        const unrenderRanges = Range.relativeComplement(
          previousRenderRange,
          renderRange
        );
        for (const range of unrenderRanges) {
          for (let i = range.start; i < range.end; i++) {
            if (this.items[i].row) {
              this.removeItemFromDOM(i);
            }
          }
        }
        const renderRanges = Range.relativeComplement(
          renderRange,
          previousRenderRange
        ).reverse();
        for (const range of renderRanges) {
          for (let i = range.end - 1; i >= range.start; i--) {
            this.insertItemInDOM(i);
          }
        }
        for (let i = renderRange.start; i < renderRange.end; i++) {
          if (this.items[i].row) {
            this.updateItemInDOM(this.items[i], i);
          }
        }
        if (typeof anchorElementIndex === "number") {
          const deltaScrollTop = this.scrollable.getFutureScrollPosition().scrollTop - renderTop;
          const newScrollTop = this.elementTop(anchorElementIndex) - anchorElementTopDelta + deltaScrollTop;
          this.setScrollTop(newScrollTop, inSmoothScrolling);
        }
        this._onDidChangeContentHeight.fire(this.contentHeight);
        return;
      }
    }
  }
  probeDynamicHeight(index) {
    const item = this.items[index];
    if (!!this.virtualDelegate.getDynamicHeight) {
      const newSize = this.virtualDelegate.getDynamicHeight(item.element);
      if (newSize !== null) {
        const size2 = item.size;
        item.size = newSize;
        item.lastDynamicHeightWidth = this.renderWidth;
        return newSize - size2;
      }
    }
    if (!item.hasDynamicHeight || item.lastDynamicHeightWidth === this.renderWidth) {
      return 0;
    }
    if (!!this.virtualDelegate.hasDynamicHeight && !this.virtualDelegate.hasDynamicHeight(item.element)) {
      return 0;
    }
    const size = item.size;
    if (item.row) {
      item.row.domNode.style.height = "";
      item.size = item.row.domNode.offsetHeight;
      if (item.size === 0 && !isAncestor(
        item.row.domNode,
        getWindow(item.row.domNode).document.body
      )) {
        console.warn(
          "Measuring item node that is not in DOM! Add ListView to the DOM before measuring row height!",
          new Error().stack
        );
      }
      item.lastDynamicHeightWidth = this.renderWidth;
      return item.size - size;
    }
    const { row } = this.cache.alloc(item.templateId);
    row.domNode.style.height = "";
    this.rowsContainer.appendChild(row.domNode);
    const renderer = this.renderers.get(item.templateId);
    if (!renderer) {
      throw new BugIndicatingError(
        "Missing renderer for templateId: " + item.templateId
      );
    }
    renderer.renderElement(
      item.element,
      index,
      row.templateData,
      void 0
    );
    item.size = row.domNode.offsetHeight;
    renderer.disposeElement?.(
      item.element,
      index,
      row.templateData,
      void 0
    );
    this.virtualDelegate.setDynamicHeight?.(item.element, item.size);
    item.lastDynamicHeightWidth = this.renderWidth;
    row.domNode.remove();
    this.cache.release(row);
    return item.size - size;
  }
  getElementDomId(index) {
    return `${this.domId}_${index}`;
  }
  // Dispose
  dispose() {
    for (const item of this.items) {
      item.dragStartDisposable.dispose();
      item.checkedDisposable.dispose();
      if (item.row) {
        const renderer = this.renderers.get(item.row.templateId);
        if (renderer) {
          renderer.disposeElement?.(
            item.element,
            -1,
            item.row.templateData,
            void 0
          );
          renderer.disposeTemplate(item.row.templateData);
        }
      }
    }
    this.items = [];
    this.domNode?.remove();
    this.dragOverAnimationDisposable?.dispose();
    this.disposables.dispose();
  }
};
__decorateClass([
  memoize
], _ListView.prototype, "onMouseClick", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onMouseDblClick", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onMouseMiddleClick", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onMouseUp", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onMouseDown", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onMouseOver", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onMouseMove", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onMouseOut", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onContextMenu", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onTouchStart", 1);
__decorateClass([
  memoize
], _ListView.prototype, "onTap", 1);
let ListView = _ListView;
export {
  ElementsDragAndDropData,
  ExternalElementsDragAndDropData,
  ListView,
  ListViewTargetSector,
  NativeDragAndDropData
};
//# sourceMappingURL=listView.js.map
