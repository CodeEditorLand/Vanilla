var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../common/lifecycle.js";
import * as platform from "../../../common/platform.js";
import { Range } from "../../../common/range.js";
import { BrowserFeatures } from "../../canIUse.js";
import * as DOM from "../../dom.js";
import "./contextview.css";
var ContextViewDOMPosition = /* @__PURE__ */ ((ContextViewDOMPosition2) => {
  ContextViewDOMPosition2[ContextViewDOMPosition2["ABSOLUTE"] = 1] = "ABSOLUTE";
  ContextViewDOMPosition2[ContextViewDOMPosition2["FIXED"] = 2] = "FIXED";
  ContextViewDOMPosition2[ContextViewDOMPosition2["FIXED_SHADOW"] = 3] = "FIXED_SHADOW";
  return ContextViewDOMPosition2;
})(ContextViewDOMPosition || {});
function isAnchor(obj) {
  const anchor = obj;
  return !!anchor && typeof anchor.x === "number" && typeof anchor.y === "number";
}
__name(isAnchor, "isAnchor");
var AnchorAlignment = /* @__PURE__ */ ((AnchorAlignment2) => {
  AnchorAlignment2[AnchorAlignment2["LEFT"] = 0] = "LEFT";
  AnchorAlignment2[AnchorAlignment2["RIGHT"] = 1] = "RIGHT";
  return AnchorAlignment2;
})(AnchorAlignment || {});
var AnchorPosition = /* @__PURE__ */ ((AnchorPosition2) => {
  AnchorPosition2[AnchorPosition2["BELOW"] = 0] = "BELOW";
  AnchorPosition2[AnchorPosition2["ABOVE"] = 1] = "ABOVE";
  return AnchorPosition2;
})(AnchorPosition || {});
var AnchorAxisAlignment = /* @__PURE__ */ ((AnchorAxisAlignment2) => {
  AnchorAxisAlignment2[AnchorAxisAlignment2["VERTICAL"] = 0] = "VERTICAL";
  AnchorAxisAlignment2[AnchorAxisAlignment2["HORIZONTAL"] = 1] = "HORIZONTAL";
  return AnchorAxisAlignment2;
})(AnchorAxisAlignment || {});
var LayoutAnchorPosition = /* @__PURE__ */ ((LayoutAnchorPosition2) => {
  LayoutAnchorPosition2[LayoutAnchorPosition2["Before"] = 0] = "Before";
  LayoutAnchorPosition2[LayoutAnchorPosition2["After"] = 1] = "After";
  return LayoutAnchorPosition2;
})(LayoutAnchorPosition || {});
var LayoutAnchorMode = /* @__PURE__ */ ((LayoutAnchorMode2) => {
  LayoutAnchorMode2[LayoutAnchorMode2["AVOID"] = 0] = "AVOID";
  LayoutAnchorMode2[LayoutAnchorMode2["ALIGN"] = 1] = "ALIGN";
  return LayoutAnchorMode2;
})(LayoutAnchorMode || {});
function layout(viewportSize, viewSize, anchor) {
  const layoutAfterAnchorBoundary = anchor.mode === 1 /* ALIGN */ ? anchor.offset : anchor.offset + anchor.size;
  const layoutBeforeAnchorBoundary = anchor.mode === 1 /* ALIGN */ ? anchor.offset + anchor.size : anchor.offset;
  if (anchor.position === 0 /* Before */) {
    if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
      return layoutAfterAnchorBoundary;
    }
    if (viewSize <= layoutBeforeAnchorBoundary) {
      return layoutBeforeAnchorBoundary - viewSize;
    }
    return Math.max(viewportSize - viewSize, 0);
  } else {
    if (viewSize <= layoutBeforeAnchorBoundary) {
      return layoutBeforeAnchorBoundary - viewSize;
    }
    if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
      return layoutAfterAnchorBoundary;
    }
    return 0;
  }
}
__name(layout, "layout");
class ContextView extends Disposable {
  static {
    __name(this, "ContextView");
  }
  static BUBBLE_UP_EVENTS = [
    "click",
    "keydown",
    "focus",
    "blur"
  ];
  static BUBBLE_DOWN_EVENTS = ["click"];
  container = null;
  view;
  useFixedPosition = false;
  useShadowDOM = false;
  delegate = null;
  toDisposeOnClean = Disposable.None;
  toDisposeOnSetContainer = Disposable.None;
  shadowRoot = null;
  shadowRootHostElement = null;
  constructor(container, domPosition) {
    super();
    this.view = DOM.$(".context-view");
    DOM.hide(this.view);
    this.setContainer(container, domPosition);
    this._register(
      toDisposable(
        () => this.setContainer(null, 1 /* ABSOLUTE */)
      )
    );
  }
  setContainer(container, domPosition) {
    this.useFixedPosition = domPosition !== 1 /* ABSOLUTE */;
    const usedShadowDOM = this.useShadowDOM;
    this.useShadowDOM = domPosition === 3 /* FIXED_SHADOW */;
    if (container === this.container && usedShadowDOM === this.useShadowDOM) {
      return;
    }
    if (this.container) {
      this.toDisposeOnSetContainer.dispose();
      this.view.remove();
      if (this.shadowRoot) {
        this.shadowRoot = null;
        this.shadowRootHostElement?.remove();
        this.shadowRootHostElement = null;
      }
      this.container = null;
    }
    if (container) {
      this.container = container;
      if (this.useShadowDOM) {
        this.shadowRootHostElement = DOM.$(".shadow-root-host");
        this.container.appendChild(this.shadowRootHostElement);
        this.shadowRoot = this.shadowRootHostElement.attachShadow({
          mode: "open"
        });
        const style = document.createElement("style");
        style.textContent = SHADOW_ROOT_CSS;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this.view);
        this.shadowRoot.appendChild(DOM.$("slot"));
      } else {
        this.container.appendChild(this.view);
      }
      const toDisposeOnSetContainer = new DisposableStore();
      ContextView.BUBBLE_UP_EVENTS.forEach((event) => {
        toDisposeOnSetContainer.add(
          DOM.addStandardDisposableListener(
            this.container,
            event,
            (e) => {
              this.onDOMEvent(e, false);
            }
          )
        );
      });
      ContextView.BUBBLE_DOWN_EVENTS.forEach((event) => {
        toDisposeOnSetContainer.add(
          DOM.addStandardDisposableListener(
            this.container,
            event,
            (e) => {
              this.onDOMEvent(e, true);
            },
            true
          )
        );
      });
      this.toDisposeOnSetContainer = toDisposeOnSetContainer;
    }
  }
  show(delegate) {
    if (this.isVisible()) {
      this.hide();
    }
    DOM.clearNode(this.view);
    this.view.className = "context-view monaco-component";
    this.view.style.top = "0px";
    this.view.style.left = "0px";
    this.view.style.zIndex = `${2575 + (delegate.layer ?? 0)}`;
    this.view.style.position = this.useFixedPosition ? "fixed" : "absolute";
    DOM.show(this.view);
    this.toDisposeOnClean = delegate.render(this.view) || Disposable.None;
    this.delegate = delegate;
    this.doLayout();
    this.delegate.focus?.();
  }
  getViewElement() {
    return this.view;
  }
  layout() {
    if (!this.isVisible()) {
      return;
    }
    if (this.delegate.canRelayout === false && !(platform.isIOS && BrowserFeatures.pointerEvents)) {
      this.hide();
      return;
    }
    this.delegate?.layout?.();
    this.doLayout();
  }
  doLayout() {
    if (!this.isVisible()) {
      return;
    }
    const anchor = this.delegate.getAnchor();
    let around;
    if (DOM.isHTMLElement(anchor)) {
      const elementPosition = DOM.getDomNodePagePosition(anchor);
      const zoom = DOM.getDomNodeZoomLevel(anchor);
      around = {
        top: elementPosition.top * zoom,
        left: elementPosition.left * zoom,
        width: elementPosition.width * zoom,
        height: elementPosition.height * zoom
      };
    } else if (isAnchor(anchor)) {
      around = {
        top: anchor.y,
        left: anchor.x,
        width: anchor.width || 1,
        height: anchor.height || 2
      };
    } else {
      around = {
        top: anchor.posy,
        left: anchor.posx,
        // We are about to position the context view where the mouse
        // cursor is. To prevent the view being exactly under the mouse
        // when showing and thus potentially triggering an action within,
        // we treat the mouse location like a small sized block element.
        width: 2,
        height: 2
      };
    }
    const viewSizeWidth = DOM.getTotalWidth(this.view);
    const viewSizeHeight = DOM.getTotalHeight(this.view);
    const anchorPosition = this.delegate.anchorPosition || 0 /* BELOW */;
    const anchorAlignment = this.delegate.anchorAlignment || 0 /* LEFT */;
    const anchorAxisAlignment = this.delegate.anchorAxisAlignment || 0 /* VERTICAL */;
    let top;
    let left;
    const activeWindow = DOM.getActiveWindow();
    if (anchorAxisAlignment === 0 /* VERTICAL */) {
      const verticalAnchor = {
        offset: around.top - activeWindow.pageYOffset,
        size: around.height,
        position: anchorPosition === 0 /* BELOW */ ? 0 /* Before */ : 1 /* After */
      };
      const horizontalAnchor = {
        offset: around.left,
        size: around.width,
        position: anchorAlignment === 0 /* LEFT */ ? 0 /* Before */ : 1 /* After */,
        mode: 1 /* ALIGN */
      };
      top = layout(
        activeWindow.innerHeight,
        viewSizeHeight,
        verticalAnchor
      ) + activeWindow.pageYOffset;
      if (Range.intersects(
        { start: top, end: top + viewSizeHeight },
        {
          start: verticalAnchor.offset,
          end: verticalAnchor.offset + verticalAnchor.size
        }
      )) {
        horizontalAnchor.mode = 0 /* AVOID */;
      }
      left = layout(
        activeWindow.innerWidth,
        viewSizeWidth,
        horizontalAnchor
      );
    } else {
      const horizontalAnchor = {
        offset: around.left,
        size: around.width,
        position: anchorAlignment === 0 /* LEFT */ ? 0 /* Before */ : 1 /* After */
      };
      const verticalAnchor = {
        offset: around.top,
        size: around.height,
        position: anchorPosition === 0 /* BELOW */ ? 0 /* Before */ : 1 /* After */,
        mode: 1 /* ALIGN */
      };
      left = layout(
        activeWindow.innerWidth,
        viewSizeWidth,
        horizontalAnchor
      );
      if (Range.intersects(
        { start: left, end: left + viewSizeWidth },
        {
          start: horizontalAnchor.offset,
          end: horizontalAnchor.offset + horizontalAnchor.size
        }
      )) {
        verticalAnchor.mode = 0 /* AVOID */;
      }
      top = layout(
        activeWindow.innerHeight,
        viewSizeHeight,
        verticalAnchor
      ) + activeWindow.pageYOffset;
    }
    this.view.classList.remove("top", "bottom", "left", "right");
    this.view.classList.add(
      anchorPosition === 0 /* BELOW */ ? "bottom" : "top"
    );
    this.view.classList.add(
      anchorAlignment === 0 /* LEFT */ ? "left" : "right"
    );
    this.view.classList.toggle("fixed", this.useFixedPosition);
    const containerPosition = DOM.getDomNodePagePosition(this.container);
    this.view.style.top = `${top - (this.useFixedPosition ? DOM.getDomNodePagePosition(this.view).top : containerPosition.top)}px`;
    this.view.style.left = `${left - (this.useFixedPosition ? DOM.getDomNodePagePosition(this.view).left : containerPosition.left)}px`;
    this.view.style.width = "initial";
  }
  hide(data) {
    const delegate = this.delegate;
    this.delegate = null;
    if (delegate?.onHide) {
      delegate.onHide(data);
    }
    this.toDisposeOnClean.dispose();
    DOM.hide(this.view);
  }
  isVisible() {
    return !!this.delegate;
  }
  onDOMEvent(e, onCapture) {
    if (this.delegate) {
      if (this.delegate.onDOMEvent) {
        this.delegate.onDOMEvent(
          e,
          DOM.getWindow(e).document.activeElement
        );
      } else if (onCapture && !DOM.isAncestor(e.target, this.container)) {
        this.hide();
      }
    }
  }
  dispose() {
    this.hide();
    super.dispose();
  }
}
const SHADOW_ROOT_CSS = (
  /* css */
  `
	:host {
		all: initial; /* 1st rule so subsequent properties are reset. */
	}

	.codicon[class*='codicon-'] {
		font: normal normal normal 16px/1 codicon;
		display: inline-block;
		text-decoration: none;
		text-rendering: auto;
		text-align: center;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}

	:host {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "HelveticaNeue-Light", system-ui, "Ubuntu", "Droid Sans", sans-serif;
	}

	:host-context(.mac) { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
	:host-context(.mac:lang(zh-Hans)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif; }
	:host-context(.mac:lang(zh-Hant)) { font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif; }
	:host-context(.mac:lang(ja)) { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic Pro", sans-serif; }
	:host-context(.mac:lang(ko)) { font-family: -apple-system, BlinkMacSystemFont, "Nanum Gothic", "Apple SD Gothic Neo", "AppleGothic", sans-serif; }

	:host-context(.windows) { font-family: "Segoe WPC", "Segoe UI", sans-serif; }
	:host-context(.windows:lang(zh-Hans)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif; }
	:host-context(.windows:lang(zh-Hant)) { font-family: "Segoe WPC", "Segoe UI", "Microsoft Jhenghei", sans-serif; }
	:host-context(.windows:lang(ja)) { font-family: "Segoe WPC", "Segoe UI", "Yu Gothic UI", "Meiryo UI", sans-serif; }
	:host-context(.windows:lang(ko)) { font-family: "Segoe WPC", "Segoe UI", "Malgun Gothic", "Dotom", sans-serif; }

	:host-context(.linux) { font-family: system-ui, "Ubuntu", "Droid Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hans)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans SC", "Source Han Sans CN", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(zh-Hant)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans TC", "Source Han Sans TW", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ja)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans J", "Source Han Sans JP", "Source Han Sans", sans-serif; }
	:host-context(.linux:lang(ko)) { font-family: system-ui, "Ubuntu", "Droid Sans", "Source Han Sans K", "Source Han Sans JR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim", sans-serif; }
`
);
export {
  AnchorAlignment,
  AnchorAxisAlignment,
  AnchorPosition,
  ContextView,
  ContextViewDOMPosition,
  LayoutAnchorMode,
  LayoutAnchorPosition,
  isAnchor,
  layout
};
//# sourceMappingURL=contextview.js.map
