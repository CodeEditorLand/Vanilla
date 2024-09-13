var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { pushToEnd, pushToStart, range } from "../../../common/arrays.js";
import { Color } from "../../../common/color.js";
import { Emitter, Event } from "../../../common/event.js";
import {
  Disposable,
  combinedDisposable,
  dispose,
  toDisposable
} from "../../../common/lifecycle.js";
import { clamp } from "../../../common/numbers.js";
import {
  Scrollable,
  ScrollbarVisibility
} from "../../../common/scrollable.js";
import * as types from "../../../common/types.js";
import {
  $,
  addDisposableListener,
  append,
  getWindow,
  scheduleAtNextAnimationFrame
} from "../../dom.js";
import { DomEmitter } from "../../event.js";
import {
  Orientation,
  Sash,
  SashState
} from "../sash/sash.js";
import { SmoothScrollableElement } from "../scrollbar/scrollableElement.js";
import "./splitview.css";
import { Orientation as Orientation2 } from "../sash/sash.js";
const defaultStyles = {
  separatorBorder: Color.transparent
};
var LayoutPriority = /* @__PURE__ */ ((LayoutPriority2) => {
  LayoutPriority2[LayoutPriority2["Normal"] = 0] = "Normal";
  LayoutPriority2[LayoutPriority2["Low"] = 1] = "Low";
  LayoutPriority2[LayoutPriority2["High"] = 2] = "High";
  return LayoutPriority2;
})(LayoutPriority || {});
class ViewItem {
  constructor(container, view, size, disposable) {
    this.container = container;
    this.view = view;
    this.disposable = disposable;
    if (typeof size === "number") {
      this._size = size;
      this._cachedVisibleSize = void 0;
      container.classList.add("visible");
    } else {
      this._size = 0;
      this._cachedVisibleSize = size.cachedVisibleSize;
    }
  }
  static {
    __name(this, "ViewItem");
  }
  _size;
  set size(size) {
    this._size = size;
  }
  get size() {
    return this._size;
  }
  _cachedVisibleSize = void 0;
  get cachedVisibleSize() {
    return this._cachedVisibleSize;
  }
  get visible() {
    return typeof this._cachedVisibleSize === "undefined";
  }
  setVisible(visible, size) {
    if (visible === this.visible) {
      return;
    }
    if (visible) {
      this.size = clamp(
        this._cachedVisibleSize,
        this.viewMinimumSize,
        this.viewMaximumSize
      );
      this._cachedVisibleSize = void 0;
    } else {
      this._cachedVisibleSize = typeof size === "number" ? size : this.size;
      this.size = 0;
    }
    this.container.classList.toggle("visible", visible);
    try {
      this.view.setVisible?.(visible);
    } catch (e) {
      console.error("Splitview: Failed to set visible view");
      console.error(e);
    }
  }
  get minimumSize() {
    return this.visible ? this.view.minimumSize : 0;
  }
  get viewMinimumSize() {
    return this.view.minimumSize;
  }
  get maximumSize() {
    return this.visible ? this.view.maximumSize : 0;
  }
  get viewMaximumSize() {
    return this.view.maximumSize;
  }
  get priority() {
    return this.view.priority;
  }
  get proportionalLayout() {
    return this.view.proportionalLayout ?? true;
  }
  get snap() {
    return !!this.view.snap;
  }
  set enabled(enabled) {
    this.container.style.pointerEvents = enabled ? "" : "none";
  }
  layout(offset, layoutContext) {
    this.layoutContainer(offset);
    try {
      this.view.layout(this.size, offset, layoutContext);
    } catch (e) {
      console.error("Splitview: Failed to layout view");
      console.error(e);
    }
  }
  dispose() {
    this.disposable.dispose();
  }
}
class VerticalViewItem extends ViewItem {
  static {
    __name(this, "VerticalViewItem");
  }
  layoutContainer(offset) {
    this.container.style.top = `${offset}px`;
    this.container.style.height = `${this.size}px`;
  }
}
class HorizontalViewItem extends ViewItem {
  static {
    __name(this, "HorizontalViewItem");
  }
  layoutContainer(offset) {
    this.container.style.left = `${offset}px`;
    this.container.style.width = `${this.size}px`;
  }
}
var State = /* @__PURE__ */ ((State2) => {
  State2[State2["Idle"] = 0] = "Idle";
  State2[State2["Busy"] = 1] = "Busy";
  return State2;
})(State || {});
var Sizing;
((Sizing2) => {
  Sizing2.Distribute = { type: "distribute" };
  function Split(index) {
    return { type: "split", index };
  }
  Sizing2.Split = Split;
  __name(Split, "Split");
  function Auto(index) {
    return { type: "auto", index };
  }
  Sizing2.Auto = Auto;
  __name(Auto, "Auto");
  function Invisible(cachedVisibleSize) {
    return { type: "invisible", cachedVisibleSize };
  }
  Sizing2.Invisible = Invisible;
  __name(Invisible, "Invisible");
})(Sizing || (Sizing = {}));
class SplitView extends Disposable {
  static {
    __name(this, "SplitView");
  }
  /**
   * This {@link SplitView}'s orientation.
   */
  orientation;
  /**
   * The DOM element representing this {@link SplitView}.
   */
  el;
  sashContainer;
  viewContainer;
  scrollable;
  scrollableElement;
  size = 0;
  layoutContext;
  _contentSize = 0;
  proportions = void 0;
  viewItems = [];
  sashItems = [];
  // used in tests
  sashDragState;
  state = 0 /* Idle */;
  inverseAltBehavior;
  proportionalLayout;
  getSashOrthogonalSize;
  _onDidSashChange = this._register(new Emitter());
  _onDidSashReset = this._register(new Emitter());
  _orthogonalStartSash;
  _orthogonalEndSash;
  _startSnappingEnabled = true;
  _endSnappingEnabled = true;
  /**
   * The sum of all views' sizes.
   */
  get contentSize() {
    return this._contentSize;
  }
  /**
   * Fires whenever the user resizes a {@link Sash sash}.
   */
  onDidSashChange = this._onDidSashChange.event;
  /**
   * Fires whenever the user double clicks a {@link Sash sash}.
   */
  onDidSashReset = this._onDidSashReset.event;
  /**
   * Fires whenever the split view is scrolled.
   */
  onDidScroll;
  /**
   * The amount of views in this {@link SplitView}.
   */
  get length() {
    return this.viewItems.length;
  }
  /**
   * The minimum size of this {@link SplitView}.
   */
  get minimumSize() {
    return this.viewItems.reduce((r, item) => r + item.minimumSize, 0);
  }
  /**
   * The maximum size of this {@link SplitView}.
   */
  get maximumSize() {
    return this.length === 0 ? Number.POSITIVE_INFINITY : this.viewItems.reduce((r, item) => r + item.maximumSize, 0);
  }
  get orthogonalStartSash() {
    return this._orthogonalStartSash;
  }
  get orthogonalEndSash() {
    return this._orthogonalEndSash;
  }
  get startSnappingEnabled() {
    return this._startSnappingEnabled;
  }
  get endSnappingEnabled() {
    return this._endSnappingEnabled;
  }
  /**
   * A reference to a sash, perpendicular to all sashes in this {@link SplitView},
   * located at the left- or top-most side of the SplitView.
   * Corner sashes will be created automatically at the intersections.
   */
  set orthogonalStartSash(sash) {
    for (const sashItem of this.sashItems) {
      sashItem.sash.orthogonalStartSash = sash;
    }
    this._orthogonalStartSash = sash;
  }
  /**
   * A reference to a sash, perpendicular to all sashes in this {@link SplitView},
   * located at the right- or bottom-most side of the SplitView.
   * Corner sashes will be created automatically at the intersections.
   */
  set orthogonalEndSash(sash) {
    for (const sashItem of this.sashItems) {
      sashItem.sash.orthogonalEndSash = sash;
    }
    this._orthogonalEndSash = sash;
  }
  /**
   * The internal sashes within this {@link SplitView}.
   */
  get sashes() {
    return this.sashItems.map((s) => s.sash);
  }
  /**
   * Enable/disable snapping at the beginning of this {@link SplitView}.
   */
  set startSnappingEnabled(startSnappingEnabled) {
    if (this._startSnappingEnabled === startSnappingEnabled) {
      return;
    }
    this._startSnappingEnabled = startSnappingEnabled;
    this.updateSashEnablement();
  }
  /**
   * Enable/disable snapping at the end of this {@link SplitView}.
   */
  set endSnappingEnabled(endSnappingEnabled) {
    if (this._endSnappingEnabled === endSnappingEnabled) {
      return;
    }
    this._endSnappingEnabled = endSnappingEnabled;
    this.updateSashEnablement();
  }
  /**
   * Create a new {@link SplitView} instance.
   */
  constructor(container, options = {}) {
    super();
    this.orientation = options.orientation ?? Orientation.VERTICAL;
    this.inverseAltBehavior = options.inverseAltBehavior ?? false;
    this.proportionalLayout = options.proportionalLayout ?? true;
    this.getSashOrthogonalSize = options.getSashOrthogonalSize;
    this.el = document.createElement("div");
    this.el.classList.add("monaco-split-view2");
    this.el.classList.add(
      this.orientation === Orientation.VERTICAL ? "vertical" : "horizontal"
    );
    container.appendChild(this.el);
    this.sashContainer = append(this.el, $(".sash-container"));
    this.viewContainer = $(".split-view-container");
    this.scrollable = this._register(
      new Scrollable({
        forceIntegerValues: true,
        smoothScrollDuration: 125,
        scheduleAtNextAnimationFrame: /* @__PURE__ */ __name((callback) => scheduleAtNextAnimationFrame(getWindow(this.el), callback), "scheduleAtNextAnimationFrame")
      })
    );
    this.scrollableElement = this._register(
      new SmoothScrollableElement(
        this.viewContainer,
        {
          vertical: this.orientation === Orientation.VERTICAL ? options.scrollbarVisibility ?? ScrollbarVisibility.Auto : ScrollbarVisibility.Hidden,
          horizontal: this.orientation === Orientation.HORIZONTAL ? options.scrollbarVisibility ?? ScrollbarVisibility.Auto : ScrollbarVisibility.Hidden
        },
        this.scrollable
      )
    );
    const onDidScrollViewContainer = this._register(
      new DomEmitter(this.viewContainer, "scroll")
    ).event;
    this._register(
      onDidScrollViewContainer((_) => {
        const position = this.scrollableElement.getScrollPosition();
        const scrollLeft = Math.abs(
          this.viewContainer.scrollLeft - position.scrollLeft
        ) <= 1 ? void 0 : this.viewContainer.scrollLeft;
        const scrollTop = Math.abs(
          this.viewContainer.scrollTop - position.scrollTop
        ) <= 1 ? void 0 : this.viewContainer.scrollTop;
        if (scrollLeft !== void 0 || scrollTop !== void 0) {
          this.scrollableElement.setScrollPosition({
            scrollLeft,
            scrollTop
          });
        }
      })
    );
    this.onDidScroll = this.scrollableElement.onScroll;
    this._register(
      this.onDidScroll((e) => {
        if (e.scrollTopChanged) {
          this.viewContainer.scrollTop = e.scrollTop;
        }
        if (e.scrollLeftChanged) {
          this.viewContainer.scrollLeft = e.scrollLeft;
        }
      })
    );
    append(this.el, this.scrollableElement.getDomNode());
    this.style(options.styles || defaultStyles);
    if (options.descriptor) {
      this.size = options.descriptor.size;
      options.descriptor.views.forEach((viewDescriptor, index) => {
        const sizing = types.isUndefined(viewDescriptor.visible) || viewDescriptor.visible ? viewDescriptor.size : {
          type: "invisible",
          cachedVisibleSize: viewDescriptor.size
        };
        const view = viewDescriptor.view;
        this.doAddView(view, sizing, index, true);
      });
      this._contentSize = this.viewItems.reduce((r, i) => r + i.size, 0);
      this.saveProportions();
    }
  }
  style(styles) {
    if (styles.separatorBorder.isTransparent()) {
      this.el.classList.remove("separator-border");
      this.el.style.removeProperty("--separator-border");
    } else {
      this.el.classList.add("separator-border");
      this.el.style.setProperty(
        "--separator-border",
        styles.separatorBorder.toString()
      );
    }
  }
  /**
   * Add a {@link IView view} to this {@link SplitView}.
   *
   * @param view The view to add.
   * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
   * @param index The index to insert the view on.
   * @param skipLayout Whether layout should be skipped.
   */
  addView(view, size, index = this.viewItems.length, skipLayout) {
    this.doAddView(view, size, index, skipLayout);
  }
  /**
   * Remove a {@link IView view} from this {@link SplitView}.
   *
   * @param index The index where the {@link IView view} is located.
   * @param sizing Whether to distribute other {@link IView view}'s sizes.
   */
  removeView(index, sizing) {
    if (index < 0 || index >= this.viewItems.length) {
      throw new Error("Index out of bounds");
    }
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    this.state = 1 /* Busy */;
    try {
      if (sizing?.type === "auto") {
        if (this.areViewsDistributed()) {
          sizing = { type: "distribute" };
        } else {
          sizing = { type: "split", index: sizing.index };
        }
      }
      const referenceViewItem = sizing?.type === "split" ? this.viewItems[sizing.index] : void 0;
      const viewItemToRemove = this.viewItems.splice(index, 1)[0];
      if (referenceViewItem) {
        referenceViewItem.size += viewItemToRemove.size;
      }
      if (this.viewItems.length >= 1) {
        const sashIndex = Math.max(index - 1, 0);
        const sashItem = this.sashItems.splice(sashIndex, 1)[0];
        sashItem.disposable.dispose();
      }
      this.relayout();
      if (sizing?.type === "distribute") {
        this.distributeViewSizes();
      }
      const result = viewItemToRemove.view;
      viewItemToRemove.dispose();
      return result;
    } finally {
      this.state = 0 /* Idle */;
    }
  }
  removeAllViews() {
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    this.state = 1 /* Busy */;
    try {
      const viewItems = this.viewItems.splice(0, this.viewItems.length);
      for (const viewItem of viewItems) {
        viewItem.dispose();
      }
      const sashItems = this.sashItems.splice(0, this.sashItems.length);
      for (const sashItem of sashItems) {
        sashItem.disposable.dispose();
      }
      this.relayout();
      return viewItems.map((i) => i.view);
    } finally {
      this.state = 0 /* Idle */;
    }
  }
  /**
   * Move a {@link IView view} to a different index.
   *
   * @param from The source index.
   * @param to The target index.
   */
  moveView(from, to) {
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    const cachedVisibleSize = this.getViewCachedVisibleSize(from);
    const sizing = typeof cachedVisibleSize === "undefined" ? this.getViewSize(from) : Sizing.Invisible(cachedVisibleSize);
    const view = this.removeView(from);
    this.addView(view, sizing, to);
  }
  /**
   * Swap two {@link IView views}.
   *
   * @param from The source index.
   * @param to The target index.
   */
  swapViews(from, to) {
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    if (from > to) {
      return this.swapViews(to, from);
    }
    const fromSize = this.getViewSize(from);
    const toSize = this.getViewSize(to);
    const toView = this.removeView(to);
    const fromView = this.removeView(from);
    this.addView(toView, fromSize, from);
    this.addView(fromView, toSize, to);
  }
  /**
   * Returns whether the {@link IView view} is visible.
   *
   * @param index The {@link IView view} index.
   */
  isViewVisible(index) {
    if (index < 0 || index >= this.viewItems.length) {
      throw new Error("Index out of bounds");
    }
    const viewItem = this.viewItems[index];
    return viewItem.visible;
  }
  /**
   * Set a {@link IView view}'s visibility.
   *
   * @param index The {@link IView view} index.
   * @param visible Whether the {@link IView view} should be visible.
   */
  setViewVisible(index, visible) {
    if (index < 0 || index >= this.viewItems.length) {
      throw new Error("Index out of bounds");
    }
    const viewItem = this.viewItems[index];
    viewItem.setVisible(visible);
    this.distributeEmptySpace(index);
    this.layoutViews();
    this.saveProportions();
  }
  /**
   * Returns the {@link IView view}'s size previously to being hidden.
   *
   * @param index The {@link IView view} index.
   */
  getViewCachedVisibleSize(index) {
    if (index < 0 || index >= this.viewItems.length) {
      throw new Error("Index out of bounds");
    }
    const viewItem = this.viewItems[index];
    return viewItem.cachedVisibleSize;
  }
  /**
   * Layout the {@link SplitView}.
   *
   * @param size The entire size of the {@link SplitView}.
   * @param layoutContext An optional layout context to pass along to {@link IView views}.
   */
  layout(size, layoutContext) {
    const previousSize = Math.max(this.size, this._contentSize);
    this.size = size;
    this.layoutContext = layoutContext;
    if (this.proportions) {
      let total = 0;
      for (let i = 0; i < this.viewItems.length; i++) {
        const item = this.viewItems[i];
        const proportion = this.proportions[i];
        if (typeof proportion === "number") {
          total += proportion;
        } else {
          size -= item.size;
        }
      }
      for (let i = 0; i < this.viewItems.length; i++) {
        const item = this.viewItems[i];
        const proportion = this.proportions[i];
        if (typeof proportion === "number" && total > 0) {
          item.size = clamp(
            Math.round(proportion * size / total),
            item.minimumSize,
            item.maximumSize
          );
        }
      }
    } else {
      const indexes = range(this.viewItems.length);
      const lowPriorityIndexes = indexes.filter(
        (i) => this.viewItems[i].priority === 1 /* Low */
      );
      const highPriorityIndexes = indexes.filter(
        (i) => this.viewItems[i].priority === 2 /* High */
      );
      this.resize(
        this.viewItems.length - 1,
        size - previousSize,
        void 0,
        lowPriorityIndexes,
        highPriorityIndexes
      );
    }
    this.distributeEmptySpace();
    this.layoutViews();
  }
  saveProportions() {
    if (this.proportionalLayout && this._contentSize > 0) {
      this.proportions = this.viewItems.map(
        (v) => v.proportionalLayout && v.visible ? v.size / this._contentSize : void 0
      );
    }
  }
  onSashStart({ sash, start, alt }) {
    for (const item of this.viewItems) {
      item.enabled = false;
    }
    const index = this.sashItems.findIndex((item) => item.sash === sash);
    const disposable = combinedDisposable(
      addDisposableListener(
        this.el.ownerDocument.body,
        "keydown",
        (e) => resetSashDragState(this.sashDragState.current, e.altKey)
      ),
      addDisposableListener(
        this.el.ownerDocument.body,
        "keyup",
        () => resetSashDragState(this.sashDragState.current, false)
      )
    );
    const resetSashDragState = /* @__PURE__ */ __name((start2, alt2) => {
      const sizes = this.viewItems.map((i) => i.size);
      let minDelta = Number.NEGATIVE_INFINITY;
      let maxDelta = Number.POSITIVE_INFINITY;
      if (this.inverseAltBehavior) {
        alt2 = !alt2;
      }
      if (alt2) {
        const isLastSash = index === this.sashItems.length - 1;
        if (isLastSash) {
          const viewItem = this.viewItems[index];
          minDelta = (viewItem.minimumSize - viewItem.size) / 2;
          maxDelta = (viewItem.maximumSize - viewItem.size) / 2;
        } else {
          const viewItem = this.viewItems[index + 1];
          minDelta = (viewItem.size - viewItem.maximumSize) / 2;
          maxDelta = (viewItem.size - viewItem.minimumSize) / 2;
        }
      }
      let snapBefore;
      let snapAfter;
      if (!alt2) {
        const upIndexes = range(index, -1);
        const downIndexes = range(index + 1, this.viewItems.length);
        const minDeltaUp = upIndexes.reduce(
          (r, i) => r + (this.viewItems[i].minimumSize - sizes[i]),
          0
        );
        const maxDeltaUp = upIndexes.reduce(
          (r, i) => r + (this.viewItems[i].viewMaximumSize - sizes[i]),
          0
        );
        const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce(
          (r, i) => r + (sizes[i] - this.viewItems[i].minimumSize),
          0
        );
        const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce(
          (r, i) => r + (sizes[i] - this.viewItems[i].viewMaximumSize),
          0
        );
        const minDelta2 = Math.max(minDeltaUp, minDeltaDown);
        const maxDelta2 = Math.min(maxDeltaDown, maxDeltaUp);
        const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
        const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
        if (typeof snapBeforeIndex === "number") {
          const viewItem = this.viewItems[snapBeforeIndex];
          const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
          snapBefore = {
            index: snapBeforeIndex,
            limitDelta: viewItem.visible ? minDelta2 - halfSize : minDelta2 + halfSize,
            size: viewItem.size
          };
        }
        if (typeof snapAfterIndex === "number") {
          const viewItem = this.viewItems[snapAfterIndex];
          const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
          snapAfter = {
            index: snapAfterIndex,
            limitDelta: viewItem.visible ? maxDelta2 + halfSize : maxDelta2 - halfSize,
            size: viewItem.size
          };
        }
      }
      this.sashDragState = {
        start: start2,
        current: start2,
        index,
        sizes,
        minDelta,
        maxDelta,
        alt: alt2,
        snapBefore,
        snapAfter,
        disposable
      };
    }, "resetSashDragState");
    resetSashDragState(start, alt);
  }
  onSashChange({ current }) {
    const {
      index,
      start,
      sizes,
      alt,
      minDelta,
      maxDelta,
      snapBefore,
      snapAfter
    } = this.sashDragState;
    this.sashDragState.current = current;
    const delta = current - start;
    const newDelta = this.resize(
      index,
      delta,
      sizes,
      void 0,
      void 0,
      minDelta,
      maxDelta,
      snapBefore,
      snapAfter
    );
    if (alt) {
      const isLastSash = index === this.sashItems.length - 1;
      const newSizes = this.viewItems.map((i) => i.size);
      const viewItemIndex = isLastSash ? index : index + 1;
      const viewItem = this.viewItems[viewItemIndex];
      const newMinDelta = viewItem.size - viewItem.maximumSize;
      const newMaxDelta = viewItem.size - viewItem.minimumSize;
      const resizeIndex = isLastSash ? index - 1 : index + 1;
      this.resize(
        resizeIndex,
        -newDelta,
        newSizes,
        void 0,
        void 0,
        newMinDelta,
        newMaxDelta
      );
    }
    this.distributeEmptySpace();
    this.layoutViews();
  }
  onSashEnd(index) {
    this._onDidSashChange.fire(index);
    this.sashDragState.disposable.dispose();
    this.saveProportions();
    for (const item of this.viewItems) {
      item.enabled = true;
    }
  }
  onViewChange(item, size) {
    const index = this.viewItems.indexOf(item);
    if (index < 0 || index >= this.viewItems.length) {
      return;
    }
    size = typeof size === "number" ? size : item.size;
    size = clamp(size, item.minimumSize, item.maximumSize);
    if (this.inverseAltBehavior && index > 0) {
      this.resize(index - 1, Math.floor((item.size - size) / 2));
      this.distributeEmptySpace();
      this.layoutViews();
    } else {
      item.size = size;
      this.relayout([index], void 0);
    }
  }
  /**
   * Resize a {@link IView view} within the {@link SplitView}.
   *
   * @param index The {@link IView view} index.
   * @param size The {@link IView view} size.
   */
  resizeView(index, size) {
    if (index < 0 || index >= this.viewItems.length) {
      return;
    }
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    this.state = 1 /* Busy */;
    try {
      const indexes = range(this.viewItems.length).filter(
        (i) => i !== index
      );
      const lowPriorityIndexes = [
        ...indexes.filter(
          (i) => this.viewItems[i].priority === 1 /* Low */
        ),
        index
      ];
      const highPriorityIndexes = indexes.filter(
        (i) => this.viewItems[i].priority === 2 /* High */
      );
      const item = this.viewItems[index];
      size = Math.round(size);
      size = clamp(
        size,
        item.minimumSize,
        Math.min(item.maximumSize, this.size)
      );
      item.size = size;
      this.relayout(lowPriorityIndexes, highPriorityIndexes);
    } finally {
      this.state = 0 /* Idle */;
    }
  }
  /**
   * Returns whether all other {@link IView views} are at their minimum size.
   */
  isViewExpanded(index) {
    if (index < 0 || index >= this.viewItems.length) {
      return false;
    }
    for (const item of this.viewItems) {
      if (item !== this.viewItems[index] && item.size > item.minimumSize) {
        return false;
      }
    }
    return true;
  }
  /**
   * Distribute the entire {@link SplitView} size among all {@link IView views}.
   */
  distributeViewSizes() {
    const flexibleViewItems = [];
    let flexibleSize = 0;
    for (const item of this.viewItems) {
      if (item.maximumSize - item.minimumSize > 0) {
        flexibleViewItems.push(item);
        flexibleSize += item.size;
      }
    }
    const size = Math.floor(flexibleSize / flexibleViewItems.length);
    for (const item of flexibleViewItems) {
      item.size = clamp(size, item.minimumSize, item.maximumSize);
    }
    const indexes = range(this.viewItems.length);
    const lowPriorityIndexes = indexes.filter(
      (i) => this.viewItems[i].priority === 1 /* Low */
    );
    const highPriorityIndexes = indexes.filter(
      (i) => this.viewItems[i].priority === 2 /* High */
    );
    this.relayout(lowPriorityIndexes, highPriorityIndexes);
  }
  /**
   * Returns the size of a {@link IView view}.
   */
  getViewSize(index) {
    if (index < 0 || index >= this.viewItems.length) {
      return -1;
    }
    return this.viewItems[index].size;
  }
  doAddView(view, size, index = this.viewItems.length, skipLayout) {
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    this.state = 1 /* Busy */;
    try {
      const container = $(".split-view-view");
      if (index === this.viewItems.length) {
        this.viewContainer.appendChild(container);
      } else {
        this.viewContainer.insertBefore(
          container,
          this.viewContainer.children.item(index)
        );
      }
      const onChangeDisposable = view.onDidChange(
        (size2) => this.onViewChange(item, size2)
      );
      const containerDisposable = toDisposable(() => container.remove());
      const disposable = combinedDisposable(
        onChangeDisposable,
        containerDisposable
      );
      let viewSize;
      if (typeof size === "number") {
        viewSize = size;
      } else {
        if (size.type === "auto") {
          if (this.areViewsDistributed()) {
            size = { type: "distribute" };
          } else {
            size = { type: "split", index: size.index };
          }
        }
        if (size.type === "split") {
          viewSize = this.getViewSize(size.index) / 2;
        } else if (size.type === "invisible") {
          viewSize = { cachedVisibleSize: size.cachedVisibleSize };
        } else {
          viewSize = view.minimumSize;
        }
      }
      const item = this.orientation === Orientation.VERTICAL ? new VerticalViewItem(
        container,
        view,
        viewSize,
        disposable
      ) : new HorizontalViewItem(
        container,
        view,
        viewSize,
        disposable
      );
      this.viewItems.splice(index, 0, item);
      if (this.viewItems.length > 1) {
        const opts = {
          orthogonalStartSash: this.orthogonalStartSash,
          orthogonalEndSash: this.orthogonalEndSash
        };
        const sash = this.orientation === Orientation.VERTICAL ? new Sash(
          this.sashContainer,
          {
            getHorizontalSashTop: /* @__PURE__ */ __name((s) => this.getSashPosition(s), "getHorizontalSashTop"),
            getHorizontalSashWidth: this.getSashOrthogonalSize
          },
          {
            ...opts,
            orientation: Orientation.HORIZONTAL
          }
        ) : new Sash(
          this.sashContainer,
          {
            getVerticalSashLeft: /* @__PURE__ */ __name((s) => this.getSashPosition(s), "getVerticalSashLeft"),
            getVerticalSashHeight: this.getSashOrthogonalSize
          },
          { ...opts, orientation: Orientation.VERTICAL }
        );
        const sashEventMapper = this.orientation === Orientation.VERTICAL ? (e) => ({
          sash,
          start: e.startY,
          current: e.currentY,
          alt: e.altKey
        }) : (e) => ({
          sash,
          start: e.startX,
          current: e.currentX,
          alt: e.altKey
        });
        const onStart = Event.map(sash.onDidStart, sashEventMapper);
        const onStartDisposable = onStart(this.onSashStart, this);
        const onChange = Event.map(sash.onDidChange, sashEventMapper);
        const onChangeDisposable2 = onChange(this.onSashChange, this);
        const onEnd = Event.map(
          sash.onDidEnd,
          () => this.sashItems.findIndex((item2) => item2.sash === sash)
        );
        const onEndDisposable = onEnd(this.onSashEnd, this);
        const onDidResetDisposable = sash.onDidReset(() => {
          const index2 = this.sashItems.findIndex(
            (item2) => item2.sash === sash
          );
          const upIndexes = range(index2, -1);
          const downIndexes = range(index2 + 1, this.viewItems.length);
          const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
          const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
          if (typeof snapBeforeIndex === "number" && !this.viewItems[snapBeforeIndex].visible) {
            return;
          }
          if (typeof snapAfterIndex === "number" && !this.viewItems[snapAfterIndex].visible) {
            return;
          }
          this._onDidSashReset.fire(index2);
        });
        const disposable2 = combinedDisposable(
          onStartDisposable,
          onChangeDisposable2,
          onEndDisposable,
          onDidResetDisposable,
          sash
        );
        const sashItem = { sash, disposable: disposable2 };
        this.sashItems.splice(index - 1, 0, sashItem);
      }
      container.appendChild(view.element);
      let highPriorityIndexes;
      if (typeof size !== "number" && size.type === "split") {
        highPriorityIndexes = [size.index];
      }
      if (!skipLayout) {
        this.relayout([index], highPriorityIndexes);
      }
      if (!skipLayout && typeof size !== "number" && size.type === "distribute") {
        this.distributeViewSizes();
      }
    } finally {
      this.state = 0 /* Idle */;
    }
  }
  relayout(lowPriorityIndexes, highPriorityIndexes) {
    const contentSize = this.viewItems.reduce((r, i) => r + i.size, 0);
    this.resize(
      this.viewItems.length - 1,
      this.size - contentSize,
      void 0,
      lowPriorityIndexes,
      highPriorityIndexes
    );
    this.distributeEmptySpace();
    this.layoutViews();
    this.saveProportions();
  }
  resize(index, delta, sizes = this.viewItems.map((i) => i.size), lowPriorityIndexes, highPriorityIndexes, overloadMinDelta = Number.NEGATIVE_INFINITY, overloadMaxDelta = Number.POSITIVE_INFINITY, snapBefore, snapAfter) {
    if (index < 0 || index >= this.viewItems.length) {
      return 0;
    }
    const upIndexes = range(index, -1);
    const downIndexes = range(index + 1, this.viewItems.length);
    if (highPriorityIndexes) {
      for (const index2 of highPriorityIndexes) {
        pushToStart(upIndexes, index2);
        pushToStart(downIndexes, index2);
      }
    }
    if (lowPriorityIndexes) {
      for (const index2 of lowPriorityIndexes) {
        pushToEnd(upIndexes, index2);
        pushToEnd(downIndexes, index2);
      }
    }
    const upItems = upIndexes.map((i) => this.viewItems[i]);
    const upSizes = upIndexes.map((i) => sizes[i]);
    const downItems = downIndexes.map((i) => this.viewItems[i]);
    const downSizes = downIndexes.map((i) => sizes[i]);
    const minDeltaUp = upIndexes.reduce(
      (r, i) => r + (this.viewItems[i].minimumSize - sizes[i]),
      0
    );
    const maxDeltaUp = upIndexes.reduce(
      (r, i) => r + (this.viewItems[i].maximumSize - sizes[i]),
      0
    );
    const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce(
      (r, i) => r + (sizes[i] - this.viewItems[i].minimumSize),
      0
    );
    const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce(
      (r, i) => r + (sizes[i] - this.viewItems[i].maximumSize),
      0
    );
    const minDelta = Math.max(minDeltaUp, minDeltaDown, overloadMinDelta);
    const maxDelta = Math.min(maxDeltaDown, maxDeltaUp, overloadMaxDelta);
    let snapped = false;
    if (snapBefore) {
      const snapView = this.viewItems[snapBefore.index];
      const visible = delta >= snapBefore.limitDelta;
      snapped = visible !== snapView.visible;
      snapView.setVisible(visible, snapBefore.size);
    }
    if (!snapped && snapAfter) {
      const snapView = this.viewItems[snapAfter.index];
      const visible = delta < snapAfter.limitDelta;
      snapped = visible !== snapView.visible;
      snapView.setVisible(visible, snapAfter.size);
    }
    if (snapped) {
      return this.resize(
        index,
        delta,
        sizes,
        lowPriorityIndexes,
        highPriorityIndexes,
        overloadMinDelta,
        overloadMaxDelta
      );
    }
    delta = clamp(delta, minDelta, maxDelta);
    for (let i = 0, deltaUp = delta; i < upItems.length; i++) {
      const item = upItems[i];
      const size = clamp(
        upSizes[i] + deltaUp,
        item.minimumSize,
        item.maximumSize
      );
      const viewDelta = size - upSizes[i];
      deltaUp -= viewDelta;
      item.size = size;
    }
    for (let i = 0, deltaDown = delta; i < downItems.length; i++) {
      const item = downItems[i];
      const size = clamp(
        downSizes[i] - deltaDown,
        item.minimumSize,
        item.maximumSize
      );
      const viewDelta = size - downSizes[i];
      deltaDown += viewDelta;
      item.size = size;
    }
    return delta;
  }
  distributeEmptySpace(lowPriorityIndex) {
    const contentSize = this.viewItems.reduce((r, i) => r + i.size, 0);
    let emptyDelta = this.size - contentSize;
    const indexes = range(this.viewItems.length - 1, -1);
    const lowPriorityIndexes = indexes.filter(
      (i) => this.viewItems[i].priority === 1 /* Low */
    );
    const highPriorityIndexes = indexes.filter(
      (i) => this.viewItems[i].priority === 2 /* High */
    );
    for (const index of highPriorityIndexes) {
      pushToStart(indexes, index);
    }
    for (const index of lowPriorityIndexes) {
      pushToEnd(indexes, index);
    }
    if (typeof lowPriorityIndex === "number") {
      pushToEnd(indexes, lowPriorityIndex);
    }
    for (let i = 0; emptyDelta !== 0 && i < indexes.length; i++) {
      const item = this.viewItems[indexes[i]];
      const size = clamp(
        item.size + emptyDelta,
        item.minimumSize,
        item.maximumSize
      );
      const viewDelta = size - item.size;
      emptyDelta -= viewDelta;
      item.size = size;
    }
  }
  layoutViews() {
    this._contentSize = this.viewItems.reduce((r, i) => r + i.size, 0);
    let offset = 0;
    for (const viewItem of this.viewItems) {
      viewItem.layout(offset, this.layoutContext);
      offset += viewItem.size;
    }
    this.sashItems.forEach((item) => item.sash.layout());
    this.updateSashEnablement();
    this.updateScrollableElement();
  }
  updateScrollableElement() {
    if (this.orientation === Orientation.VERTICAL) {
      this.scrollableElement.setScrollDimensions({
        height: this.size,
        scrollHeight: this._contentSize
      });
    } else {
      this.scrollableElement.setScrollDimensions({
        width: this.size,
        scrollWidth: this._contentSize
      });
    }
  }
  updateSashEnablement() {
    let previous = false;
    const collapsesDown = this.viewItems.map(
      (i) => previous = i.size - i.minimumSize > 0 || previous
    );
    previous = false;
    const expandsDown = this.viewItems.map(
      (i) => previous = i.maximumSize - i.size > 0 || previous
    );
    const reverseViews = [...this.viewItems].reverse();
    previous = false;
    const collapsesUp = reverseViews.map((i) => previous = i.size - i.minimumSize > 0 || previous).reverse();
    previous = false;
    const expandsUp = reverseViews.map((i) => previous = i.maximumSize - i.size > 0 || previous).reverse();
    let position = 0;
    for (let index = 0; index < this.sashItems.length; index++) {
      const { sash } = this.sashItems[index];
      const viewItem = this.viewItems[index];
      position += viewItem.size;
      const min = !(collapsesDown[index] && expandsUp[index + 1]);
      const max = !(expandsDown[index] && collapsesUp[index + 1]);
      if (min && max) {
        const upIndexes = range(index, -1);
        const downIndexes = range(index + 1, this.viewItems.length);
        const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
        const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
        const snappedBefore = typeof snapBeforeIndex === "number" && !this.viewItems[snapBeforeIndex].visible;
        const snappedAfter = typeof snapAfterIndex === "number" && !this.viewItems[snapAfterIndex].visible;
        if (snappedBefore && collapsesUp[index] && (position > 0 || this.startSnappingEnabled)) {
          sash.state = SashState.AtMinimum;
        } else if (snappedAfter && collapsesDown[index] && (position < this._contentSize || this.endSnappingEnabled)) {
          sash.state = SashState.AtMaximum;
        } else {
          sash.state = SashState.Disabled;
        }
      } else if (min && !max) {
        sash.state = SashState.AtMinimum;
      } else if (!min && max) {
        sash.state = SashState.AtMaximum;
      } else {
        sash.state = SashState.Enabled;
      }
    }
  }
  getSashPosition(sash) {
    let position = 0;
    for (let i = 0; i < this.sashItems.length; i++) {
      position += this.viewItems[i].size;
      if (this.sashItems[i].sash === sash) {
        return position;
      }
    }
    return 0;
  }
  findFirstSnapIndex(indexes) {
    for (const index of indexes) {
      const viewItem = this.viewItems[index];
      if (!viewItem.visible) {
        continue;
      }
      if (viewItem.snap) {
        return index;
      }
    }
    for (const index of indexes) {
      const viewItem = this.viewItems[index];
      if (viewItem.visible && viewItem.maximumSize - viewItem.minimumSize > 0) {
        return void 0;
      }
      if (!viewItem.visible && viewItem.snap) {
        return index;
      }
    }
    return void 0;
  }
  areViewsDistributed() {
    let min, max;
    for (const view of this.viewItems) {
      min = min === void 0 ? view.size : Math.min(min, view.size);
      max = max === void 0 ? view.size : Math.max(max, view.size);
      if (max - min > 2) {
        return false;
      }
    }
    return true;
  }
  dispose() {
    this.sashDragState?.disposable.dispose();
    dispose(this.viewItems);
    this.viewItems = [];
    this.sashItems.forEach((i) => i.disposable.dispose());
    this.sashItems = [];
    super.dispose();
  }
}
export {
  LayoutPriority,
  Orientation2 as Orientation,
  Sizing,
  SplitView
};
//# sourceMappingURL=splitview.js.map
