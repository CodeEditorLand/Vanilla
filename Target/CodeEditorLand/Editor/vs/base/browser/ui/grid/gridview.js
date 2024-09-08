import {
  equals as arrayEquals,
  tail2 as tail
} from "../../../common/arrays.js";
import { Color } from "../../../common/color.js";
import { Emitter, Event, Relay } from "../../../common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../common/lifecycle.js";
import { rot } from "../../../common/numbers.js";
import { isUndefined } from "../../../common/types.js";
import { $ } from "../../dom.js";
import { Orientation } from "../sash/sash.js";
import {
  LayoutPriority,
  Sizing,
  SplitView
} from "../splitview/splitview.js";
import "./gridview.css";
import { Orientation as Orientation2 } from "../sash/sash.js";
import { LayoutPriority as LayoutPriority2, Sizing as Sizing2 } from "../splitview/splitview.js";
const defaultStyles = {
  separatorBorder: Color.transparent
};
function orthogonal(orientation) {
  return orientation === Orientation.VERTICAL ? Orientation.HORIZONTAL : Orientation.VERTICAL;
}
function isGridBranchNode(node) {
  return !!node.children;
}
class LayoutController {
  constructor(isLayoutEnabled) {
    this.isLayoutEnabled = isLayoutEnabled;
  }
}
function toAbsoluteBoundarySashes(sashes, orientation) {
  if (orientation === Orientation.HORIZONTAL) {
    return {
      left: sashes.start,
      right: sashes.end,
      top: sashes.orthogonalStart,
      bottom: sashes.orthogonalEnd
    };
  } else {
    return {
      top: sashes.start,
      bottom: sashes.end,
      left: sashes.orthogonalStart,
      right: sashes.orthogonalEnd
    };
  }
}
function fromAbsoluteBoundarySashes(sashes, orientation) {
  if (orientation === Orientation.HORIZONTAL) {
    return {
      start: sashes.left,
      end: sashes.right,
      orthogonalStart: sashes.top,
      orthogonalEnd: sashes.bottom
    };
  } else {
    return {
      start: sashes.top,
      end: sashes.bottom,
      orthogonalStart: sashes.left,
      orthogonalEnd: sashes.right
    };
  }
}
function validateIndex(index, numChildren) {
  if (Math.abs(index) > numChildren) {
    throw new Error("Invalid index");
  }
  return rot(index, numChildren + 1);
}
class BranchNode {
  constructor(orientation, layoutController, styles, splitviewProportionalLayout, size = 0, orthogonalSize = 0, edgeSnapping = false, childDescriptors) {
    this.orientation = orientation;
    this.layoutController = layoutController;
    this.splitviewProportionalLayout = splitviewProportionalLayout;
    this._styles = styles;
    this._size = size;
    this._orthogonalSize = orthogonalSize;
    this.element = $(".monaco-grid-branch-node");
    if (childDescriptors) {
      const descriptor = {
        views: childDescriptors.map((childDescriptor) => {
          return {
            view: childDescriptor.node,
            size: childDescriptor.node.size,
            visible: childDescriptor.visible !== false
          };
        }),
        size: this.orthogonalSize
      };
      const options = {
        proportionalLayout: splitviewProportionalLayout,
        orientation,
        styles
      };
      this.children = childDescriptors.map((c) => c.node);
      this.splitview = new SplitView(this.element, {
        ...options,
        descriptor
      });
      this.children.forEach((node, index) => {
        const first = index === 0;
        const last = index === this.children.length;
        node.boundarySashes = {
          start: this.boundarySashes.orthogonalStart,
          end: this.boundarySashes.orthogonalEnd,
          orthogonalStart: first ? this.boundarySashes.start : this.splitview.sashes[index - 1],
          orthogonalEnd: last ? this.boundarySashes.end : this.splitview.sashes[index]
        };
      });
    } else {
      this.splitview = new SplitView(this.element, {
        orientation,
        styles,
        proportionalLayout: splitviewProportionalLayout
      });
      this.splitview.layout(size, {
        orthogonalSize,
        absoluteOffset: 0,
        absoluteOrthogonalOffset: 0,
        absoluteSize: size,
        absoluteOrthogonalSize: orthogonalSize
      });
    }
    const onDidSashReset = Event.map(this.splitview.onDidSashReset, (i) => [
      i
    ]);
    this.splitviewSashResetDisposable = onDidSashReset(
      this._onDidSashReset.fire,
      this._onDidSashReset
    );
    this.updateChildrenEvents();
  }
  element;
  children = [];
  splitview;
  _size;
  get size() {
    return this._size;
  }
  _orthogonalSize;
  get orthogonalSize() {
    return this._orthogonalSize;
  }
  _absoluteOffset = 0;
  get absoluteOffset() {
    return this._absoluteOffset;
  }
  _absoluteOrthogonalOffset = 0;
  get absoluteOrthogonalOffset() {
    return this._absoluteOrthogonalOffset;
  }
  absoluteOrthogonalSize = 0;
  _styles;
  get styles() {
    return this._styles;
  }
  get width() {
    return this.orientation === Orientation.HORIZONTAL ? this.size : this.orthogonalSize;
  }
  get height() {
    return this.orientation === Orientation.HORIZONTAL ? this.orthogonalSize : this.size;
  }
  get top() {
    return this.orientation === Orientation.HORIZONTAL ? this._absoluteOffset : this._absoluteOrthogonalOffset;
  }
  get left() {
    return this.orientation === Orientation.HORIZONTAL ? this._absoluteOrthogonalOffset : this._absoluteOffset;
  }
  get minimumSize() {
    return this.children.length === 0 ? 0 : Math.max(
      ...this.children.map(
        (c, index) => this.splitview.isViewVisible(index) ? c.minimumOrthogonalSize : 0
      )
    );
  }
  get maximumSize() {
    return Math.min(
      ...this.children.map(
        (c, index) => this.splitview.isViewVisible(index) ? c.maximumOrthogonalSize : Number.POSITIVE_INFINITY
      )
    );
  }
  get priority() {
    if (this.children.length === 0) {
      return LayoutPriority.Normal;
    }
    const priorities = this.children.map(
      (c) => typeof c.priority === "undefined" ? LayoutPriority.Normal : c.priority
    );
    if (priorities.some((p) => p === LayoutPriority.High)) {
      return LayoutPriority.High;
    } else if (priorities.some((p) => p === LayoutPriority.Low)) {
      return LayoutPriority.Low;
    }
    return LayoutPriority.Normal;
  }
  get proportionalLayout() {
    if (this.children.length === 0) {
      return true;
    }
    return this.children.every((c) => c.proportionalLayout);
  }
  get minimumOrthogonalSize() {
    return this.splitview.minimumSize;
  }
  get maximumOrthogonalSize() {
    return this.splitview.maximumSize;
  }
  get minimumWidth() {
    return this.orientation === Orientation.HORIZONTAL ? this.minimumOrthogonalSize : this.minimumSize;
  }
  get minimumHeight() {
    return this.orientation === Orientation.HORIZONTAL ? this.minimumSize : this.minimumOrthogonalSize;
  }
  get maximumWidth() {
    return this.orientation === Orientation.HORIZONTAL ? this.maximumOrthogonalSize : this.maximumSize;
  }
  get maximumHeight() {
    return this.orientation === Orientation.HORIZONTAL ? this.maximumSize : this.maximumOrthogonalSize;
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _onDidVisibilityChange = new Emitter();
  onDidVisibilityChange = this._onDidVisibilityChange.event;
  childrenVisibilityChangeDisposable = new DisposableStore();
  _onDidScroll = new Emitter();
  onDidScrollDisposable = Disposable.None;
  onDidScroll = this._onDidScroll.event;
  childrenChangeDisposable = Disposable.None;
  _onDidSashReset = new Emitter();
  onDidSashReset = this._onDidSashReset.event;
  splitviewSashResetDisposable = Disposable.None;
  childrenSashResetDisposable = Disposable.None;
  _boundarySashes = {};
  get boundarySashes() {
    return this._boundarySashes;
  }
  set boundarySashes(boundarySashes) {
    if (this._boundarySashes.start === boundarySashes.start && this._boundarySashes.end === boundarySashes.end && this._boundarySashes.orthogonalStart === boundarySashes.orthogonalStart && this._boundarySashes.orthogonalEnd === boundarySashes.orthogonalEnd) {
      return;
    }
    this._boundarySashes = boundarySashes;
    this.splitview.orthogonalStartSash = boundarySashes.orthogonalStart;
    this.splitview.orthogonalEndSash = boundarySashes.orthogonalEnd;
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      const first = index === 0;
      const last = index === this.children.length - 1;
      child.boundarySashes = {
        start: boundarySashes.orthogonalStart,
        end: boundarySashes.orthogonalEnd,
        orthogonalStart: first ? boundarySashes.start : child.boundarySashes.orthogonalStart,
        orthogonalEnd: last ? boundarySashes.end : child.boundarySashes.orthogonalEnd
      };
    }
  }
  _edgeSnapping = false;
  get edgeSnapping() {
    return this._edgeSnapping;
  }
  set edgeSnapping(edgeSnapping) {
    if (this._edgeSnapping === edgeSnapping) {
      return;
    }
    this._edgeSnapping = edgeSnapping;
    for (const child of this.children) {
      if (child instanceof BranchNode) {
        child.edgeSnapping = edgeSnapping;
      }
    }
    this.updateSplitviewEdgeSnappingEnablement();
  }
  style(styles) {
    this._styles = styles;
    this.splitview.style(styles);
    for (const child of this.children) {
      if (child instanceof BranchNode) {
        child.style(styles);
      }
    }
  }
  layout(size, offset, ctx) {
    if (!this.layoutController.isLayoutEnabled) {
      return;
    }
    if (typeof ctx === "undefined") {
      throw new Error("Invalid state");
    }
    this._size = ctx.orthogonalSize;
    this._orthogonalSize = size;
    this._absoluteOffset = ctx.absoluteOffset + offset;
    this._absoluteOrthogonalOffset = ctx.absoluteOrthogonalOffset;
    this.absoluteOrthogonalSize = ctx.absoluteOrthogonalSize;
    this.splitview.layout(ctx.orthogonalSize, {
      orthogonalSize: size,
      absoluteOffset: this._absoluteOrthogonalOffset,
      absoluteOrthogonalOffset: this._absoluteOffset,
      absoluteSize: ctx.absoluteOrthogonalSize,
      absoluteOrthogonalSize: ctx.absoluteSize
    });
    this.updateSplitviewEdgeSnappingEnablement();
  }
  setVisible(visible) {
    for (const child of this.children) {
      child.setVisible(visible);
    }
  }
  addChild(node, size, index, skipLayout) {
    index = validateIndex(index, this.children.length);
    this.splitview.addView(node, size, index, skipLayout);
    this.children.splice(index, 0, node);
    this.updateBoundarySashes();
    this.onDidChildrenChange();
  }
  removeChild(index, sizing) {
    index = validateIndex(index, this.children.length);
    const result = this.splitview.removeView(index, sizing);
    this.children.splice(index, 1);
    this.updateBoundarySashes();
    this.onDidChildrenChange();
    return result;
  }
  removeAllChildren() {
    const result = this.splitview.removeAllViews();
    this.children.splice(0, this.children.length);
    this.updateBoundarySashes();
    this.onDidChildrenChange();
    return result;
  }
  moveChild(from, to) {
    from = validateIndex(from, this.children.length);
    to = validateIndex(to, this.children.length);
    if (from === to) {
      return;
    }
    if (from < to) {
      to -= 1;
    }
    this.splitview.moveView(from, to);
    this.children.splice(to, 0, this.children.splice(from, 1)[0]);
    this.updateBoundarySashes();
    this.onDidChildrenChange();
  }
  swapChildren(from, to) {
    from = validateIndex(from, this.children.length);
    to = validateIndex(to, this.children.length);
    if (from === to) {
      return;
    }
    this.splitview.swapViews(from, to);
    [this.children[from].boundarySashes, this.children[to].boundarySashes] = [
      this.children[from].boundarySashes,
      this.children[to].boundarySashes
    ];
    [this.children[from], this.children[to]] = [
      this.children[to],
      this.children[from]
    ];
    this.onDidChildrenChange();
  }
  resizeChild(index, size) {
    index = validateIndex(index, this.children.length);
    this.splitview.resizeView(index, size);
  }
  isChildExpanded(index) {
    return this.splitview.isViewExpanded(index);
  }
  distributeViewSizes(recursive = false) {
    this.splitview.distributeViewSizes();
    if (recursive) {
      for (const child of this.children) {
        if (child instanceof BranchNode) {
          child.distributeViewSizes(true);
        }
      }
    }
  }
  getChildSize(index) {
    index = validateIndex(index, this.children.length);
    return this.splitview.getViewSize(index);
  }
  isChildVisible(index) {
    index = validateIndex(index, this.children.length);
    return this.splitview.isViewVisible(index);
  }
  setChildVisible(index, visible) {
    index = validateIndex(index, this.children.length);
    if (this.splitview.isViewVisible(index) === visible) {
      return;
    }
    const wereAllChildrenHidden = this.splitview.contentSize === 0;
    this.splitview.setViewVisible(index, visible);
    const areAllChildrenHidden = this.splitview.contentSize === 0;
    if (visible && wereAllChildrenHidden || !visible && areAllChildrenHidden) {
      this._onDidVisibilityChange.fire(visible);
    }
  }
  getChildCachedVisibleSize(index) {
    index = validateIndex(index, this.children.length);
    return this.splitview.getViewCachedVisibleSize(index);
  }
  updateBoundarySashes() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].boundarySashes = {
        start: this.boundarySashes.orthogonalStart,
        end: this.boundarySashes.orthogonalEnd,
        orthogonalStart: i === 0 ? this.boundarySashes.start : this.splitview.sashes[i - 1],
        orthogonalEnd: i === this.children.length - 1 ? this.boundarySashes.end : this.splitview.sashes[i]
      };
    }
  }
  onDidChildrenChange() {
    this.updateChildrenEvents();
    this._onDidChange.fire(void 0);
  }
  updateChildrenEvents() {
    const onDidChildrenChange = Event.map(
      Event.any(...this.children.map((c) => c.onDidChange)),
      () => void 0
    );
    this.childrenChangeDisposable.dispose();
    this.childrenChangeDisposable = onDidChildrenChange(
      this._onDidChange.fire,
      this._onDidChange
    );
    const onDidChildrenSashReset = Event.any(
      ...this.children.map(
        (c, i) => Event.map(c.onDidSashReset, (location) => [i, ...location])
      )
    );
    this.childrenSashResetDisposable.dispose();
    this.childrenSashResetDisposable = onDidChildrenSashReset(
      this._onDidSashReset.fire,
      this._onDidSashReset
    );
    const onDidScroll = Event.any(
      Event.signal(this.splitview.onDidScroll),
      ...this.children.map((c) => c.onDidScroll)
    );
    this.onDidScrollDisposable.dispose();
    this.onDidScrollDisposable = onDidScroll(
      this._onDidScroll.fire,
      this._onDidScroll
    );
    this.childrenVisibilityChangeDisposable.clear();
    this.children.forEach((child, index) => {
      if (child instanceof BranchNode) {
        this.childrenVisibilityChangeDisposable.add(
          child.onDidVisibilityChange((visible) => {
            this.setChildVisible(index, visible);
          })
        );
      }
    });
  }
  trySet2x2(other) {
    if (this.children.length !== 2 || other.children.length !== 2) {
      return Disposable.None;
    }
    if (this.getChildSize(0) !== other.getChildSize(0)) {
      return Disposable.None;
    }
    const [firstChild, secondChild] = this.children;
    const [otherFirstChild, otherSecondChild] = other.children;
    if (!(firstChild instanceof LeafNode) || !(secondChild instanceof LeafNode)) {
      return Disposable.None;
    }
    if (!(otherFirstChild instanceof LeafNode) || !(otherSecondChild instanceof LeafNode)) {
      return Disposable.None;
    }
    if (this.orientation === Orientation.VERTICAL) {
      secondChild.linkedWidthNode = otherFirstChild.linkedHeightNode = firstChild;
      firstChild.linkedWidthNode = otherSecondChild.linkedHeightNode = secondChild;
      otherSecondChild.linkedWidthNode = firstChild.linkedHeightNode = otherFirstChild;
      otherFirstChild.linkedWidthNode = secondChild.linkedHeightNode = otherSecondChild;
    } else {
      otherFirstChild.linkedWidthNode = secondChild.linkedHeightNode = firstChild;
      otherSecondChild.linkedWidthNode = firstChild.linkedHeightNode = secondChild;
      firstChild.linkedWidthNode = otherSecondChild.linkedHeightNode = otherFirstChild;
      secondChild.linkedWidthNode = otherFirstChild.linkedHeightNode = otherSecondChild;
    }
    const mySash = this.splitview.sashes[0];
    const otherSash = other.splitview.sashes[0];
    mySash.linkedSash = otherSash;
    otherSash.linkedSash = mySash;
    this._onDidChange.fire(void 0);
    other._onDidChange.fire(void 0);
    return toDisposable(() => {
      mySash.linkedSash = otherSash.linkedSash = void 0;
      firstChild.linkedHeightNode = firstChild.linkedWidthNode = void 0;
      secondChild.linkedHeightNode = secondChild.linkedWidthNode = void 0;
      otherFirstChild.linkedHeightNode = otherFirstChild.linkedWidthNode = void 0;
      otherSecondChild.linkedHeightNode = otherSecondChild.linkedWidthNode = void 0;
    });
  }
  updateSplitviewEdgeSnappingEnablement() {
    this.splitview.startSnappingEnabled = this._edgeSnapping || this._absoluteOrthogonalOffset > 0;
    this.splitview.endSnappingEnabled = this._edgeSnapping || this._absoluteOrthogonalOffset + this._size < this.absoluteOrthogonalSize;
  }
  dispose() {
    for (const child of this.children) {
      child.dispose();
    }
    this._onDidChange.dispose();
    this._onDidSashReset.dispose();
    this._onDidVisibilityChange.dispose();
    this.childrenVisibilityChangeDisposable.dispose();
    this.splitviewSashResetDisposable.dispose();
    this.childrenSashResetDisposable.dispose();
    this.childrenChangeDisposable.dispose();
    this.onDidScrollDisposable.dispose();
    this.splitview.dispose();
  }
}
function createLatchedOnDidChangeViewEvent(view) {
  const [onDidChangeViewConstraints, onDidSetViewSize] = Event.split(view.onDidChange, isUndefined);
  return Event.any(
    onDidSetViewSize,
    Event.map(
      Event.latch(
        Event.map(onDidChangeViewConstraints, (_) => [
          view.minimumWidth,
          view.maximumWidth,
          view.minimumHeight,
          view.maximumHeight
        ]),
        arrayEquals
      ),
      (_) => void 0
    )
  );
}
class LeafNode {
  constructor(view, orientation, layoutController, orthogonalSize, size = 0) {
    this.view = view;
    this.orientation = orientation;
    this.layoutController = layoutController;
    this._orthogonalSize = orthogonalSize;
    this._size = size;
    const onDidChange = createLatchedOnDidChangeViewEvent(view);
    this._onDidViewChange = Event.map(
      onDidChange,
      (e) => e && (this.orientation === Orientation.VERTICAL ? e.width : e.height),
      this.disposables
    );
    this.onDidChange = Event.any(
      this._onDidViewChange,
      this._onDidSetLinkedNode.event,
      this._onDidLinkedWidthNodeChange.event,
      this._onDidLinkedHeightNodeChange.event
    );
  }
  _size = 0;
  get size() {
    return this._size;
  }
  _orthogonalSize;
  get orthogonalSize() {
    return this._orthogonalSize;
  }
  absoluteOffset = 0;
  absoluteOrthogonalOffset = 0;
  onDidScroll = Event.None;
  onDidSashReset = Event.None;
  _onDidLinkedWidthNodeChange = new Relay();
  _linkedWidthNode = void 0;
  get linkedWidthNode() {
    return this._linkedWidthNode;
  }
  set linkedWidthNode(node) {
    this._onDidLinkedWidthNodeChange.input = node ? node._onDidViewChange : Event.None;
    this._linkedWidthNode = node;
    this._onDidSetLinkedNode.fire(void 0);
  }
  _onDidLinkedHeightNodeChange = new Relay();
  _linkedHeightNode = void 0;
  get linkedHeightNode() {
    return this._linkedHeightNode;
  }
  set linkedHeightNode(node) {
    this._onDidLinkedHeightNodeChange.input = node ? node._onDidViewChange : Event.None;
    this._linkedHeightNode = node;
    this._onDidSetLinkedNode.fire(void 0);
  }
  _onDidSetLinkedNode = new Emitter();
  _onDidViewChange;
  onDidChange;
  disposables = new DisposableStore();
  get width() {
    return this.orientation === Orientation.HORIZONTAL ? this.orthogonalSize : this.size;
  }
  get height() {
    return this.orientation === Orientation.HORIZONTAL ? this.size : this.orthogonalSize;
  }
  get top() {
    return this.orientation === Orientation.HORIZONTAL ? this.absoluteOffset : this.absoluteOrthogonalOffset;
  }
  get left() {
    return this.orientation === Orientation.HORIZONTAL ? this.absoluteOrthogonalOffset : this.absoluteOffset;
  }
  get element() {
    return this.view.element;
  }
  get minimumWidth() {
    return this.linkedWidthNode ? Math.max(
      this.linkedWidthNode.view.minimumWidth,
      this.view.minimumWidth
    ) : this.view.minimumWidth;
  }
  get maximumWidth() {
    return this.linkedWidthNode ? Math.min(
      this.linkedWidthNode.view.maximumWidth,
      this.view.maximumWidth
    ) : this.view.maximumWidth;
  }
  get minimumHeight() {
    return this.linkedHeightNode ? Math.max(
      this.linkedHeightNode.view.minimumHeight,
      this.view.minimumHeight
    ) : this.view.minimumHeight;
  }
  get maximumHeight() {
    return this.linkedHeightNode ? Math.min(
      this.linkedHeightNode.view.maximumHeight,
      this.view.maximumHeight
    ) : this.view.maximumHeight;
  }
  get minimumSize() {
    return this.orientation === Orientation.HORIZONTAL ? this.minimumHeight : this.minimumWidth;
  }
  get maximumSize() {
    return this.orientation === Orientation.HORIZONTAL ? this.maximumHeight : this.maximumWidth;
  }
  get priority() {
    return this.view.priority;
  }
  get proportionalLayout() {
    return this.view.proportionalLayout ?? true;
  }
  get snap() {
    return this.view.snap;
  }
  get minimumOrthogonalSize() {
    return this.orientation === Orientation.HORIZONTAL ? this.minimumWidth : this.minimumHeight;
  }
  get maximumOrthogonalSize() {
    return this.orientation === Orientation.HORIZONTAL ? this.maximumWidth : this.maximumHeight;
  }
  _boundarySashes = {};
  get boundarySashes() {
    return this._boundarySashes;
  }
  set boundarySashes(boundarySashes) {
    this._boundarySashes = boundarySashes;
    this.view.setBoundarySashes?.(
      toAbsoluteBoundarySashes(boundarySashes, this.orientation)
    );
  }
  layout(size, offset, ctx) {
    if (!this.layoutController.isLayoutEnabled) {
      return;
    }
    if (typeof ctx === "undefined") {
      throw new Error("Invalid state");
    }
    this._size = size;
    this._orthogonalSize = ctx.orthogonalSize;
    this.absoluteOffset = ctx.absoluteOffset + offset;
    this.absoluteOrthogonalOffset = ctx.absoluteOrthogonalOffset;
    this._layout(this.width, this.height, this.top, this.left);
  }
  cachedWidth = 0;
  cachedHeight = 0;
  cachedTop = 0;
  cachedLeft = 0;
  _layout(width, height, top, left) {
    if (this.cachedWidth === width && this.cachedHeight === height && this.cachedTop === top && this.cachedLeft === left) {
      return;
    }
    this.cachedWidth = width;
    this.cachedHeight = height;
    this.cachedTop = top;
    this.cachedLeft = left;
    this.view.layout(width, height, top, left);
  }
  setVisible(visible) {
    this.view.setVisible?.(visible);
  }
  dispose() {
    this.disposables.dispose();
  }
}
function flipNode(node, size, orthogonalSize) {
  if (node instanceof BranchNode) {
    const result = new BranchNode(
      orthogonal(node.orientation),
      node.layoutController,
      node.styles,
      node.splitviewProportionalLayout,
      size,
      orthogonalSize,
      node.edgeSnapping
    );
    let totalSize = 0;
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      const childSize = child instanceof BranchNode ? child.orthogonalSize : child.size;
      let newSize = node.size === 0 ? 0 : Math.round(size * childSize / node.size);
      totalSize += newSize;
      if (i === 0) {
        newSize += size - totalSize;
      }
      result.addChild(
        flipNode(child, orthogonalSize, newSize),
        newSize,
        0,
        true
      );
    }
    node.dispose();
    return result;
  } else {
    const result = new LeafNode(
      node.view,
      orthogonal(node.orientation),
      node.layoutController,
      orthogonalSize
    );
    node.dispose();
    return result;
  }
}
class GridView {
  /**
   * The DOM element for this view.
   */
  element;
  styles;
  proportionalLayout;
  _root;
  onDidSashResetRelay = new Relay();
  _onDidScroll = new Relay();
  _onDidChange = new Relay();
  _boundarySashes = {};
  /**
   * The layout controller makes sure layout only propagates
   * to the views after the very first call to {@link GridView.layout}.
   */
  layoutController;
  disposable2x2 = Disposable.None;
  get root() {
    return this._root;
  }
  set root(root) {
    const oldRoot = this._root;
    if (oldRoot) {
      oldRoot.element.remove();
      oldRoot.dispose();
    }
    this._root = root;
    this.element.appendChild(root.element);
    this.onDidSashResetRelay.input = root.onDidSashReset;
    this._onDidChange.input = Event.map(root.onDidChange, () => void 0);
    this._onDidScroll.input = root.onDidScroll;
  }
  /**
   * Fires whenever the user double clicks a {@link Sash sash}.
   */
  onDidSashReset = this.onDidSashResetRelay.event;
  /**
   * Fires whenever the user scrolls a {@link SplitView} within
   * the grid.
   */
  onDidScroll = this._onDidScroll.event;
  /**
   * Fires whenever a view within the grid changes its size constraints.
   */
  onDidChange = this._onDidChange.event;
  /**
   * The width of the grid.
   */
  get width() {
    return this.root.width;
  }
  /**
   * The height of the grid.
   */
  get height() {
    return this.root.height;
  }
  /**
   * The minimum width of the grid.
   */
  get minimumWidth() {
    return this.root.minimumWidth;
  }
  /**
   * The minimum height of the grid.
   */
  get minimumHeight() {
    return this.root.minimumHeight;
  }
  /**
   * The maximum width of the grid.
   */
  get maximumWidth() {
    return this.root.maximumHeight;
  }
  /**
   * The maximum height of the grid.
   */
  get maximumHeight() {
    return this.root.maximumHeight;
  }
  get orientation() {
    return this._root.orientation;
  }
  get boundarySashes() {
    return this._boundarySashes;
  }
  /**
   * The orientation of the grid. Matches the orientation of the root
   * {@link SplitView} in the grid's tree model.
   */
  set orientation(orientation) {
    if (this._root.orientation === orientation) {
      return;
    }
    const {
      size,
      orthogonalSize,
      absoluteOffset,
      absoluteOrthogonalOffset
    } = this._root;
    this.root = flipNode(this._root, orthogonalSize, size);
    this.root.layout(size, 0, {
      orthogonalSize,
      absoluteOffset: absoluteOrthogonalOffset,
      absoluteOrthogonalOffset: absoluteOffset,
      absoluteSize: size,
      absoluteOrthogonalSize: orthogonalSize
    });
    this.boundarySashes = this.boundarySashes;
  }
  /**
   * A collection of sashes perpendicular to each edge of the grid.
   * Corner sashes will be created for each intersection.
   */
  set boundarySashes(boundarySashes) {
    this._boundarySashes = boundarySashes;
    this.root.boundarySashes = fromAbsoluteBoundarySashes(
      boundarySashes,
      this.orientation
    );
  }
  /**
   * Enable/disable edge snapping across all grid views.
   */
  set edgeSnapping(edgeSnapping) {
    this.root.edgeSnapping = edgeSnapping;
  }
  maximizedNode = void 0;
  _onDidChangeViewMaximized = new Emitter();
  onDidChangeViewMaximized = this._onDidChangeViewMaximized.event;
  /**
   * Create a new {@link GridView} instance.
   *
   * @remarks It's the caller's responsibility to append the
   * {@link GridView.element} to the page's DOM.
   */
  constructor(options = {}) {
    this.element = $(".monaco-grid-view");
    this.styles = options.styles || defaultStyles;
    this.proportionalLayout = typeof options.proportionalLayout !== "undefined" ? !!options.proportionalLayout : true;
    this.layoutController = new LayoutController(false);
    this.root = new BranchNode(
      Orientation.VERTICAL,
      this.layoutController,
      this.styles,
      this.proportionalLayout
    );
  }
  style(styles) {
    this.styles = styles;
    this.root.style(styles);
  }
  /**
   * Layout the {@link GridView}.
   *
   * Optionally provide a `top` and `left` positions, those will propagate
   * as an origin for positions passed to {@link IView.layout}.
   *
   * @param width The width of the {@link GridView}.
   * @param height The height of the {@link GridView}.
   * @param top Optional, the top location of the {@link GridView}.
   * @param left Optional, the left location of the {@link GridView}.
   */
  layout(width, height, top = 0, left = 0) {
    this.layoutController.isLayoutEnabled = true;
    const [size, orthogonalSize, offset, orthogonalOffset] = this.root.orientation === Orientation.HORIZONTAL ? [height, width, top, left] : [width, height, left, top];
    this.root.layout(size, 0, {
      orthogonalSize,
      absoluteOffset: offset,
      absoluteOrthogonalOffset: orthogonalOffset,
      absoluteSize: size,
      absoluteOrthogonalSize: orthogonalSize
    });
  }
  /**
   * Add a {@link IView view} to this {@link GridView}.
   *
   * @param view The view to add.
   * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
   * @param location The {@link GridLocation location} to insert the view on.
   */
  addView(view, size, location) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    this.disposable2x2.dispose();
    this.disposable2x2 = Disposable.None;
    const [rest, index] = tail(location);
    const [pathToParent, parent] = this.getNode(rest);
    if (parent instanceof BranchNode) {
      const node = new LeafNode(
        view,
        orthogonal(parent.orientation),
        this.layoutController,
        parent.orthogonalSize
      );
      try {
        parent.addChild(node, size, index);
      } catch (err) {
        node.dispose();
        throw err;
      }
    } else {
      const [, grandParent] = tail(pathToParent);
      const [, parentIndex] = tail(rest);
      let newSiblingSize = 0;
      const newSiblingCachedVisibleSize = grandParent.getChildCachedVisibleSize(parentIndex);
      if (typeof newSiblingCachedVisibleSize === "number") {
        newSiblingSize = Sizing.Invisible(newSiblingCachedVisibleSize);
      }
      const oldChild = grandParent.removeChild(parentIndex);
      oldChild.dispose();
      const newParent = new BranchNode(
        parent.orientation,
        parent.layoutController,
        this.styles,
        this.proportionalLayout,
        parent.size,
        parent.orthogonalSize,
        grandParent.edgeSnapping
      );
      grandParent.addChild(newParent, parent.size, parentIndex);
      const newSibling = new LeafNode(
        parent.view,
        grandParent.orientation,
        this.layoutController,
        parent.size
      );
      newParent.addChild(newSibling, newSiblingSize, 0);
      if (typeof size !== "number" && size.type === "split") {
        size = Sizing.Split(0);
      }
      const node = new LeafNode(
        view,
        grandParent.orientation,
        this.layoutController,
        parent.size
      );
      newParent.addChild(node, size, index);
    }
    this.trySet2x2();
  }
  /**
   * Remove a {@link IView view} from this {@link GridView}.
   *
   * @param location The {@link GridLocation location} of the {@link IView view}.
   * @param sizing Whether to distribute other {@link IView view}'s sizes.
   */
  removeView(location, sizing) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    this.disposable2x2.dispose();
    this.disposable2x2 = Disposable.None;
    const [rest, index] = tail(location);
    const [pathToParent, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    const node = parent.children[index];
    if (!(node instanceof LeafNode)) {
      throw new Error("Invalid location");
    }
    parent.removeChild(index, sizing);
    node.dispose();
    if (parent.children.length === 0) {
      throw new Error("Invalid grid state");
    }
    if (parent.children.length > 1) {
      this.trySet2x2();
      return node.view;
    }
    if (pathToParent.length === 0) {
      const sibling2 = parent.children[0];
      if (sibling2 instanceof LeafNode) {
        return node.view;
      }
      parent.removeChild(0);
      parent.dispose();
      this.root = sibling2;
      this.boundarySashes = this.boundarySashes;
      this.trySet2x2();
      return node.view;
    }
    const [, grandParent] = tail(pathToParent);
    const [, parentIndex] = tail(rest);
    const isSiblingVisible = parent.isChildVisible(0);
    const sibling = parent.removeChild(0);
    const sizes = grandParent.children.map(
      (_, i) => grandParent.getChildSize(i)
    );
    grandParent.removeChild(parentIndex, sizing);
    parent.dispose();
    if (sibling instanceof BranchNode) {
      sizes.splice(
        parentIndex,
        1,
        ...sibling.children.map((c) => c.size)
      );
      const siblingChildren = sibling.removeAllChildren();
      for (let i = 0; i < siblingChildren.length; i++) {
        grandParent.addChild(
          siblingChildren[i],
          siblingChildren[i].size,
          parentIndex + i
        );
      }
    } else {
      const newSibling = new LeafNode(
        sibling.view,
        orthogonal(sibling.orientation),
        this.layoutController,
        sibling.size
      );
      const sizing2 = isSiblingVisible ? sibling.orthogonalSize : Sizing.Invisible(sibling.orthogonalSize);
      grandParent.addChild(newSibling, sizing2, parentIndex);
    }
    sibling.dispose();
    for (let i = 0; i < sizes.length; i++) {
      grandParent.resizeChild(i, sizes[i]);
    }
    this.trySet2x2();
    return node.view;
  }
  /**
   * Move a {@link IView view} within its parent.
   *
   * @param parentLocation The {@link GridLocation location} of the {@link IView view}'s parent.
   * @param from The index of the {@link IView view} to move.
   * @param to The index where the {@link IView view} should move to.
   */
  moveView(parentLocation, from, to) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const [, parent] = this.getNode(parentLocation);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    parent.moveChild(from, to);
    this.trySet2x2();
  }
  /**
   * Swap two {@link IView views} within the {@link GridView}.
   *
   * @param from The {@link GridLocation location} of one view.
   * @param to The {@link GridLocation location} of another view.
   */
  swapViews(from, to) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const [fromRest, fromIndex] = tail(from);
    const [, fromParent] = this.getNode(fromRest);
    if (!(fromParent instanceof BranchNode)) {
      throw new Error("Invalid from location");
    }
    const fromSize = fromParent.getChildSize(fromIndex);
    const fromNode = fromParent.children[fromIndex];
    if (!(fromNode instanceof LeafNode)) {
      throw new Error("Invalid from location");
    }
    const [toRest, toIndex] = tail(to);
    const [, toParent] = this.getNode(toRest);
    if (!(toParent instanceof BranchNode)) {
      throw new Error("Invalid to location");
    }
    const toSize = toParent.getChildSize(toIndex);
    const toNode = toParent.children[toIndex];
    if (!(toNode instanceof LeafNode)) {
      throw new Error("Invalid to location");
    }
    if (fromParent === toParent) {
      fromParent.swapChildren(fromIndex, toIndex);
    } else {
      fromParent.removeChild(fromIndex);
      toParent.removeChild(toIndex);
      fromParent.addChild(toNode, fromSize, fromIndex);
      toParent.addChild(fromNode, toSize, toIndex);
    }
    this.trySet2x2();
  }
  /**
   * Resize a {@link IView view}.
   *
   * @param location The {@link GridLocation location} of the view.
   * @param size The size the view should be. Optionally provide a single dimension.
   */
  resizeView(location, size) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const [rest, index] = tail(location);
    const [pathToParent, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    if (!size.width && !size.height) {
      return;
    }
    const [parentSize, grandParentSize] = parent.orientation === Orientation.HORIZONTAL ? [size.width, size.height] : [size.height, size.width];
    if (typeof grandParentSize === "number" && pathToParent.length > 0) {
      const [, grandParent] = tail(pathToParent);
      const [, parentIndex] = tail(rest);
      grandParent.resizeChild(parentIndex, grandParentSize);
    }
    if (typeof parentSize === "number") {
      parent.resizeChild(index, parentSize);
    }
    this.trySet2x2();
  }
  /**
   * Get the size of a {@link IView view}.
   *
   * @param location The {@link GridLocation location} of the view. Provide `undefined` to get
   * the size of the grid itself.
   */
  getViewSize(location) {
    if (!location) {
      return { width: this.root.width, height: this.root.height };
    }
    const [, node] = this.getNode(location);
    return { width: node.width, height: node.height };
  }
  /**
   * Get the cached visible size of a {@link IView view}. This was the size
   * of the view at the moment it last became hidden.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  getViewCachedVisibleSize(location) {
    const [rest, index] = tail(location);
    const [, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    return parent.getChildCachedVisibleSize(index);
  }
  /**
   * Maximize the size of a {@link IView view} by collapsing all other views
   * to their minimum sizes.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  expandView(location) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const [ancestors, node] = this.getNode(location);
    if (!(node instanceof LeafNode)) {
      throw new Error("Invalid location");
    }
    for (let i = 0; i < ancestors.length; i++) {
      ancestors[i].resizeChild(location[i], Number.POSITIVE_INFINITY);
    }
  }
  /**
   * Returns whether all other {@link IView views} are at their minimum size.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  isViewExpanded(location) {
    if (this.hasMaximizedView()) {
      return false;
    }
    const [ancestors, node] = this.getNode(location);
    if (!(node instanceof LeafNode)) {
      throw new Error("Invalid location");
    }
    for (let i = 0; i < ancestors.length; i++) {
      if (!ancestors[i].isChildExpanded(location[i])) {
        return false;
      }
    }
    return true;
  }
  maximizeView(location) {
    const [, nodeToMaximize] = this.getNode(location);
    if (!(nodeToMaximize instanceof LeafNode)) {
      throw new Error("Location is not a LeafNode");
    }
    if (this.maximizedNode === nodeToMaximize) {
      return;
    }
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    function hideAllViewsBut(parent, exclude) {
      for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (child instanceof LeafNode) {
          if (child !== exclude) {
            parent.setChildVisible(i, false);
          }
        } else {
          hideAllViewsBut(child, exclude);
        }
      }
    }
    hideAllViewsBut(this.root, nodeToMaximize);
    this.maximizedNode = nodeToMaximize;
    this._onDidChangeViewMaximized.fire(true);
  }
  exitMaximizedView() {
    if (!this.maximizedNode) {
      return;
    }
    this.maximizedNode = void 0;
    function showViewsInReverseOrder(parent) {
      for (let index = parent.children.length - 1; index >= 0; index--) {
        const child = parent.children[index];
        if (child instanceof LeafNode) {
          parent.setChildVisible(index, true);
        } else {
          showViewsInReverseOrder(child);
        }
      }
    }
    showViewsInReverseOrder(this.root);
    this._onDidChangeViewMaximized.fire(false);
  }
  hasMaximizedView() {
    return this.maximizedNode !== void 0;
  }
  /**
   * Returns whether the {@link IView view} is maximized.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  isViewMaximized(location) {
    const [, node] = this.getNode(location);
    if (!(node instanceof LeafNode)) {
      throw new Error("Location is not a LeafNode");
    }
    return node === this.maximizedNode;
  }
  /**
   * Distribute the size among all {@link IView views} within the entire
   * grid or within a single {@link SplitView}.
   *
   * @param location The {@link GridLocation location} of a view containing
   * children views, which will have their sizes distributed within the parent
   * view's size. Provide `undefined` to recursively distribute all views' sizes
   * in the entire grid.
   */
  distributeViewSizes(location) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    if (!location) {
      this.root.distributeViewSizes(true);
      return;
    }
    const [, node] = this.getNode(location);
    if (!(node instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    node.distributeViewSizes();
    this.trySet2x2();
  }
  /**
   * Returns whether a {@link IView view} is visible.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  isViewVisible(location) {
    const [rest, index] = tail(location);
    const [, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid from location");
    }
    return parent.isChildVisible(index);
  }
  /**
   * Set the visibility state of a {@link IView view}.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  setViewVisible(location, visible) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
      return;
    }
    const [rest, index] = tail(location);
    const [, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid from location");
    }
    parent.setChildVisible(index, visible);
  }
  getView(location) {
    const node = location ? this.getNode(location)[1] : this._root;
    return this._getViews(node, this.orientation);
  }
  /**
   * Construct a new {@link GridView} from a JSON object.
   *
   * @param json The JSON object.
   * @param deserializer A deserializer which can revive each view.
   * @returns A new {@link GridView} instance.
   */
  static deserialize(json, deserializer, options = {}) {
    if (typeof json.orientation !== "number") {
      throw new Error(
        "Invalid JSON: 'orientation' property must be a number."
      );
    } else if (typeof json.width !== "number") {
      throw new Error("Invalid JSON: 'width' property must be a number.");
    } else if (typeof json.height !== "number") {
      throw new Error(
        "Invalid JSON: 'height' property must be a number."
      );
    } else if (json.root?.type !== "branch") {
      throw new Error(
        "Invalid JSON: 'root' property must have 'type' value of branch."
      );
    }
    const orientation = json.orientation;
    const height = json.height;
    const result = new GridView(options);
    result._deserialize(
      json.root,
      orientation,
      deserializer,
      height
    );
    return result;
  }
  _deserialize(root, orientation, deserializer, orthogonalSize) {
    this.root = this._deserializeNode(
      root,
      orientation,
      deserializer,
      orthogonalSize
    );
  }
  _deserializeNode(node, orientation, deserializer, orthogonalSize) {
    let result;
    if (node.type === "branch") {
      const serializedChildren = node.data;
      const children = serializedChildren.map((serializedChild) => {
        return {
          node: this._deserializeNode(
            serializedChild,
            orthogonal(orientation),
            deserializer,
            node.size
          ),
          visible: serializedChild.visible
        };
      });
      result = new BranchNode(
        orientation,
        this.layoutController,
        this.styles,
        this.proportionalLayout,
        node.size,
        orthogonalSize,
        void 0,
        children
      );
    } else {
      result = new LeafNode(
        deserializer.fromJSON(node.data),
        orientation,
        this.layoutController,
        orthogonalSize,
        node.size
      );
      if (node.maximized && !this.maximizedNode) {
        this.maximizedNode = result;
        this._onDidChangeViewMaximized.fire(true);
      }
    }
    return result;
  }
  _getViews(node, orientation, cachedVisibleSize) {
    const box = {
      top: node.top,
      left: node.left,
      width: node.width,
      height: node.height
    };
    if (node instanceof LeafNode) {
      return {
        view: node.view,
        box,
        cachedVisibleSize,
        maximized: this.maximizedNode === node
      };
    }
    const children = [];
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const cachedVisibleSize2 = node.getChildCachedVisibleSize(i);
      children.push(
        this._getViews(
          child,
          orthogonal(orientation),
          cachedVisibleSize2
        )
      );
    }
    return { children, box };
  }
  getNode(location, node = this.root, path = []) {
    if (location.length === 0) {
      return [path, node];
    }
    if (!(node instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    const [index, ...rest] = location;
    if (index < 0 || index >= node.children.length) {
      throw new Error("Invalid location");
    }
    const child = node.children[index];
    path.push(node);
    return this.getNode(rest, child, path);
  }
  /**
   * Attempt to lock the {@link Sash sashes} in this {@link GridView} so
   * the grid behaves as a 2x2 matrix, with a corner sash in the middle.
   *
   * In case the grid isn't a 2x2 grid _and_ all sashes are not aligned,
   * this method is a no-op.
   */
  trySet2x2() {
    this.disposable2x2.dispose();
    this.disposable2x2 = Disposable.None;
    if (this.root.children.length !== 2) {
      return;
    }
    const [first, second] = this.root.children;
    if (!(first instanceof BranchNode) || !(second instanceof BranchNode)) {
      return;
    }
    this.disposable2x2 = first.trySet2x2(second);
  }
  /**
   * Populate a map with views to DOM nodes.
   * @remarks To be used internally only.
   */
  getViewMap(map, node) {
    if (!node) {
      node = this.root;
    }
    if (node instanceof BranchNode) {
      node.children.forEach((child) => this.getViewMap(map, child));
    } else {
      map.set(node.view, node.element);
    }
  }
  dispose() {
    this.onDidSashResetRelay.dispose();
    this.root.dispose();
    this.element.remove();
  }
}
export {
  GridView,
  LayoutPriority2 as LayoutPriority,
  Orientation2 as Orientation,
  Sizing2 as Sizing,
  isGridBranchNode,
  orthogonal
};
