var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { TimeoutTimer } from "../../../common/async.js";
import { Emitter } from "../../../common/event.js";
import { dispose } from "../../../common/lifecycle.js";
import * as platform from "../../../common/platform.js";
import {
  Scrollable,
  ScrollbarVisibility
} from "../../../common/scrollable.js";
import { getZoomFactor, isChrome } from "../../browser.js";
import * as dom from "../../dom.js";
import { createFastDomNode } from "../../fastDomNode.js";
import {
  StandardWheelEvent
} from "../../mouseEvent.js";
import { Widget } from "../widget.js";
import { HorizontalScrollbar } from "./horizontalScrollbar.js";
import { VerticalScrollbar } from "./verticalScrollbar.js";
import "./media/scrollbars.css";
const HIDE_TIMEOUT = 500;
const SCROLL_WHEEL_SENSITIVITY = 50;
const SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED = true;
class MouseWheelClassifierItem {
  static {
    __name(this, "MouseWheelClassifierItem");
  }
  timestamp;
  deltaX;
  deltaY;
  score;
  constructor(timestamp, deltaX, deltaY) {
    this.timestamp = timestamp;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.score = 0;
  }
}
class MouseWheelClassifier {
  static {
    __name(this, "MouseWheelClassifier");
  }
  static INSTANCE = new MouseWheelClassifier();
  _capacity;
  _memory;
  _front;
  _rear;
  constructor() {
    this._capacity = 5;
    this._memory = [];
    this._front = -1;
    this._rear = -1;
  }
  isPhysicalMouseWheel() {
    if (this._front === -1 && this._rear === -1) {
      return false;
    }
    let remainingInfluence = 1;
    let score = 0;
    let iteration = 1;
    let index = this._rear;
    do {
      const influence = index === this._front ? remainingInfluence : Math.pow(2, -iteration);
      remainingInfluence -= influence;
      score += this._memory[index].score * influence;
      if (index === this._front) {
        break;
      }
      index = (this._capacity + index - 1) % this._capacity;
      iteration++;
    } while (true);
    return score <= 0.5;
  }
  acceptStandardWheelEvent(e) {
    if (isChrome) {
      const targetWindow = dom.getWindow(e.browserEvent);
      const pageZoomFactor = getZoomFactor(targetWindow);
      this.accept(
        Date.now(),
        e.deltaX * pageZoomFactor,
        e.deltaY * pageZoomFactor
      );
    } else {
      this.accept(Date.now(), e.deltaX, e.deltaY);
    }
  }
  accept(timestamp, deltaX, deltaY) {
    let previousItem = null;
    const item = new MouseWheelClassifierItem(timestamp, deltaX, deltaY);
    if (this._front === -1 && this._rear === -1) {
      this._memory[0] = item;
      this._front = 0;
      this._rear = 0;
    } else {
      previousItem = this._memory[this._rear];
      this._rear = (this._rear + 1) % this._capacity;
      if (this._rear === this._front) {
        this._front = (this._front + 1) % this._capacity;
      }
      this._memory[this._rear] = item;
    }
    item.score = this._computeScore(item, previousItem);
  }
  /**
   * A score between 0 and 1 for `item`.
   *  - a score towards 0 indicates that the source appears to be a physical mouse wheel
   *  - a score towards 1 indicates that the source appears to be a touchpad or magic mouse, etc.
   */
  _computeScore(item, previousItem) {
    if (Math.abs(item.deltaX) > 0 && Math.abs(item.deltaY) > 0) {
      return 1;
    }
    let score = 0.5;
    if (!this._isAlmostInt(item.deltaX) || !this._isAlmostInt(item.deltaY)) {
      score += 0.25;
    }
    if (previousItem) {
      const absDeltaX = Math.abs(item.deltaX);
      const absDeltaY = Math.abs(item.deltaY);
      const absPreviousDeltaX = Math.abs(previousItem.deltaX);
      const absPreviousDeltaY = Math.abs(previousItem.deltaY);
      const minDeltaX = Math.max(
        Math.min(absDeltaX, absPreviousDeltaX),
        1
      );
      const minDeltaY = Math.max(
        Math.min(absDeltaY, absPreviousDeltaY),
        1
      );
      const maxDeltaX = Math.max(absDeltaX, absPreviousDeltaX);
      const maxDeltaY = Math.max(absDeltaY, absPreviousDeltaY);
      const isSameModulo = maxDeltaX % minDeltaX === 0 && maxDeltaY % minDeltaY === 0;
      if (isSameModulo) {
        score -= 0.5;
      }
    }
    return Math.min(Math.max(score, 0), 1);
  }
  _isAlmostInt(value) {
    const delta = Math.abs(Math.round(value) - value);
    return delta < 0.01;
  }
}
class AbstractScrollableElement extends Widget {
  static {
    __name(this, "AbstractScrollableElement");
  }
  _options;
  _scrollable;
  _verticalScrollbar;
  _horizontalScrollbar;
  _domNode;
  _leftShadowDomNode;
  _topShadowDomNode;
  _topLeftShadowDomNode;
  _listenOnDomNode;
  _mouseWheelToDispose;
  _isDragging;
  _mouseIsOver;
  _hideTimeout;
  _shouldRender;
  _revealOnScroll;
  _onScroll = this._register(new Emitter());
  onScroll = this._onScroll.event;
  _onWillScroll = this._register(new Emitter());
  onWillScroll = this._onWillScroll.event;
  get options() {
    return this._options;
  }
  constructor(element, options, scrollable) {
    super();
    element.style.overflow = "hidden";
    this._options = resolveOptions(options);
    this._scrollable = scrollable;
    this._register(
      this._scrollable.onScroll((e) => {
        this._onWillScroll.fire(e);
        this._onDidScroll(e);
        this._onScroll.fire(e);
      })
    );
    const scrollbarHost = {
      onMouseWheel: /* @__PURE__ */ __name((mouseWheelEvent) => this._onMouseWheel(mouseWheelEvent), "onMouseWheel"),
      onDragStart: /* @__PURE__ */ __name(() => this._onDragStart(), "onDragStart"),
      onDragEnd: /* @__PURE__ */ __name(() => this._onDragEnd(), "onDragEnd")
    };
    this._verticalScrollbar = this._register(
      new VerticalScrollbar(
        this._scrollable,
        this._options,
        scrollbarHost
      )
    );
    this._horizontalScrollbar = this._register(
      new HorizontalScrollbar(
        this._scrollable,
        this._options,
        scrollbarHost
      )
    );
    this._domNode = document.createElement("div");
    this._domNode.className = "monaco-scrollable-element " + this._options.className;
    this._domNode.setAttribute("role", "presentation");
    this._domNode.style.position = "relative";
    this._domNode.style.overflow = "hidden";
    this._domNode.appendChild(element);
    this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode);
    this._domNode.appendChild(this._verticalScrollbar.domNode.domNode);
    if (this._options.useShadows) {
      this._leftShadowDomNode = createFastDomNode(
        document.createElement("div")
      );
      this._leftShadowDomNode.setClassName("shadow");
      this._domNode.appendChild(this._leftShadowDomNode.domNode);
      this._topShadowDomNode = createFastDomNode(
        document.createElement("div")
      );
      this._topShadowDomNode.setClassName("shadow");
      this._domNode.appendChild(this._topShadowDomNode.domNode);
      this._topLeftShadowDomNode = createFastDomNode(
        document.createElement("div")
      );
      this._topLeftShadowDomNode.setClassName("shadow");
      this._domNode.appendChild(this._topLeftShadowDomNode.domNode);
    } else {
      this._leftShadowDomNode = null;
      this._topShadowDomNode = null;
      this._topLeftShadowDomNode = null;
    }
    this._listenOnDomNode = this._options.listenOnDomNode || this._domNode;
    this._mouseWheelToDispose = [];
    this._setListeningToMouseWheel(this._options.handleMouseWheel);
    this.onmouseover(this._listenOnDomNode, (e) => this._onMouseOver(e));
    this.onmouseleave(this._listenOnDomNode, (e) => this._onMouseLeave(e));
    this._hideTimeout = this._register(new TimeoutTimer());
    this._isDragging = false;
    this._mouseIsOver = false;
    this._shouldRender = true;
    this._revealOnScroll = true;
  }
  dispose() {
    this._mouseWheelToDispose = dispose(this._mouseWheelToDispose);
    super.dispose();
  }
  /**
   * Get the generated 'scrollable' dom node
   */
  getDomNode() {
    return this._domNode;
  }
  getOverviewRulerLayoutInfo() {
    return {
      parent: this._domNode,
      insertBefore: this._verticalScrollbar.domNode.domNode
    };
  }
  /**
   * Delegate a pointer down event to the vertical scrollbar.
   * This is to help with clicking somewhere else and having the scrollbar react.
   */
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this._verticalScrollbar.delegatePointerDown(browserEvent);
  }
  getScrollDimensions() {
    return this._scrollable.getScrollDimensions();
  }
  setScrollDimensions(dimensions) {
    this._scrollable.setScrollDimensions(dimensions, false);
  }
  /**
   * Update the class name of the scrollable element.
   */
  updateClassName(newClassName) {
    this._options.className = newClassName;
    if (platform.isMacintosh) {
      this._options.className += " mac";
    }
    this._domNode.className = "monaco-scrollable-element " + this._options.className;
  }
  /**
   * Update configuration options for the scrollbar.
   */
  updateOptions(newOptions) {
    if (typeof newOptions.handleMouseWheel !== "undefined") {
      this._options.handleMouseWheel = newOptions.handleMouseWheel;
      this._setListeningToMouseWheel(this._options.handleMouseWheel);
    }
    if (typeof newOptions.mouseWheelScrollSensitivity !== "undefined") {
      this._options.mouseWheelScrollSensitivity = newOptions.mouseWheelScrollSensitivity;
    }
    if (typeof newOptions.fastScrollSensitivity !== "undefined") {
      this._options.fastScrollSensitivity = newOptions.fastScrollSensitivity;
    }
    if (typeof newOptions.scrollPredominantAxis !== "undefined") {
      this._options.scrollPredominantAxis = newOptions.scrollPredominantAxis;
    }
    if (typeof newOptions.horizontal !== "undefined") {
      this._options.horizontal = newOptions.horizontal;
    }
    if (typeof newOptions.vertical !== "undefined") {
      this._options.vertical = newOptions.vertical;
    }
    if (typeof newOptions.horizontalScrollbarSize !== "undefined") {
      this._options.horizontalScrollbarSize = newOptions.horizontalScrollbarSize;
    }
    if (typeof newOptions.verticalScrollbarSize !== "undefined") {
      this._options.verticalScrollbarSize = newOptions.verticalScrollbarSize;
    }
    if (typeof newOptions.scrollByPage !== "undefined") {
      this._options.scrollByPage = newOptions.scrollByPage;
    }
    this._horizontalScrollbar.updateOptions(this._options);
    this._verticalScrollbar.updateOptions(this._options);
    if (!this._options.lazyRender) {
      this._render();
    }
  }
  setRevealOnScroll(value) {
    this._revealOnScroll = value;
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this._onMouseWheel(new StandardWheelEvent(browserEvent));
  }
  // -------------------- mouse wheel scrolling --------------------
  _setListeningToMouseWheel(shouldListen) {
    const isListening = this._mouseWheelToDispose.length > 0;
    if (isListening === shouldListen) {
      return;
    }
    this._mouseWheelToDispose = dispose(this._mouseWheelToDispose);
    if (shouldListen) {
      const onMouseWheel = /* @__PURE__ */ __name((browserEvent) => {
        this._onMouseWheel(new StandardWheelEvent(browserEvent));
      }, "onMouseWheel");
      this._mouseWheelToDispose.push(
        dom.addDisposableListener(
          this._listenOnDomNode,
          dom.EventType.MOUSE_WHEEL,
          onMouseWheel,
          { passive: false }
        )
      );
    }
  }
  _onMouseWheel(e) {
    if (e.browserEvent?.defaultPrevented) {
      return;
    }
    const classifier = MouseWheelClassifier.INSTANCE;
    if (SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED) {
      classifier.acceptStandardWheelEvent(e);
    }
    let didScroll = false;
    if (e.deltaY || e.deltaX) {
      let deltaY = e.deltaY * this._options.mouseWheelScrollSensitivity;
      let deltaX = e.deltaX * this._options.mouseWheelScrollSensitivity;
      if (this._options.scrollPredominantAxis) {
        if (this._options.scrollYToX && deltaX + deltaY === 0) {
          deltaX = deltaY = 0;
        } else if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          deltaX = 0;
        } else {
          deltaY = 0;
        }
      }
      if (this._options.flipAxes) {
        [deltaY, deltaX] = [deltaX, deltaY];
      }
      const shiftConvert = !platform.isMacintosh && e.browserEvent && e.browserEvent.shiftKey;
      if ((this._options.scrollYToX || shiftConvert) && !deltaX) {
        deltaX = deltaY;
        deltaY = 0;
      }
      if (e.browserEvent && e.browserEvent.altKey) {
        deltaX = deltaX * this._options.fastScrollSensitivity;
        deltaY = deltaY * this._options.fastScrollSensitivity;
      }
      const futureScrollPosition = this._scrollable.getFutureScrollPosition();
      let desiredScrollPosition = {};
      if (deltaY) {
        const deltaScrollTop = SCROLL_WHEEL_SENSITIVITY * deltaY;
        const desiredScrollTop = futureScrollPosition.scrollTop - (deltaScrollTop < 0 ? Math.floor(deltaScrollTop) : Math.ceil(deltaScrollTop));
        this._verticalScrollbar.writeScrollPosition(
          desiredScrollPosition,
          desiredScrollTop
        );
      }
      if (deltaX) {
        const deltaScrollLeft = SCROLL_WHEEL_SENSITIVITY * deltaX;
        const desiredScrollLeft = futureScrollPosition.scrollLeft - (deltaScrollLeft < 0 ? Math.floor(deltaScrollLeft) : Math.ceil(deltaScrollLeft));
        this._horizontalScrollbar.writeScrollPosition(
          desiredScrollPosition,
          desiredScrollLeft
        );
      }
      desiredScrollPosition = this._scrollable.validateScrollPosition(
        desiredScrollPosition
      );
      if (futureScrollPosition.scrollLeft !== desiredScrollPosition.scrollLeft || futureScrollPosition.scrollTop !== desiredScrollPosition.scrollTop) {
        const canPerformSmoothScroll = SCROLL_WHEEL_SMOOTH_SCROLL_ENABLED && this._options.mouseWheelSmoothScroll && classifier.isPhysicalMouseWheel();
        if (canPerformSmoothScroll) {
          this._scrollable.setScrollPositionSmooth(
            desiredScrollPosition
          );
        } else {
          this._scrollable.setScrollPositionNow(
            desiredScrollPosition
          );
        }
        didScroll = true;
      }
    }
    let consumeMouseWheel = didScroll;
    if (!consumeMouseWheel && this._options.alwaysConsumeMouseWheel) {
      consumeMouseWheel = true;
    }
    if (!consumeMouseWheel && this._options.consumeMouseWheelIfScrollbarIsNeeded && (this._verticalScrollbar.isNeeded() || this._horizontalScrollbar.isNeeded())) {
      consumeMouseWheel = true;
    }
    if (consumeMouseWheel) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  _onDidScroll(e) {
    this._shouldRender = this._horizontalScrollbar.onDidScroll(e) || this._shouldRender;
    this._shouldRender = this._verticalScrollbar.onDidScroll(e) || this._shouldRender;
    if (this._options.useShadows) {
      this._shouldRender = true;
    }
    if (this._revealOnScroll) {
      this._reveal();
    }
    if (!this._options.lazyRender) {
      this._render();
    }
  }
  /**
   * Render / mutate the DOM now.
   * Should be used together with the ctor option `lazyRender`.
   */
  renderNow() {
    if (!this._options.lazyRender) {
      throw new Error(
        "Please use `lazyRender` together with `renderNow`!"
      );
    }
    this._render();
  }
  _render() {
    if (!this._shouldRender) {
      return;
    }
    this._shouldRender = false;
    this._horizontalScrollbar.render();
    this._verticalScrollbar.render();
    if (this._options.useShadows) {
      const scrollState = this._scrollable.getCurrentScrollPosition();
      const enableTop = scrollState.scrollTop > 0;
      const enableLeft = scrollState.scrollLeft > 0;
      const leftClassName = enableLeft ? " left" : "";
      const topClassName = enableTop ? " top" : "";
      const topLeftClassName = enableLeft || enableTop ? " top-left-corner" : "";
      this._leftShadowDomNode.setClassName(`shadow${leftClassName}`);
      this._topShadowDomNode.setClassName(`shadow${topClassName}`);
      this._topLeftShadowDomNode.setClassName(
        `shadow${topLeftClassName}${topClassName}${leftClassName}`
      );
    }
  }
  // -------------------- fade in / fade out --------------------
  _onDragStart() {
    this._isDragging = true;
    this._reveal();
  }
  _onDragEnd() {
    this._isDragging = false;
    this._hide();
  }
  _onMouseLeave(e) {
    this._mouseIsOver = false;
    this._hide();
  }
  _onMouseOver(e) {
    this._mouseIsOver = true;
    this._reveal();
  }
  _reveal() {
    this._verticalScrollbar.beginReveal();
    this._horizontalScrollbar.beginReveal();
    this._scheduleHide();
  }
  _hide() {
    if (!this._mouseIsOver && !this._isDragging) {
      this._verticalScrollbar.beginHide();
      this._horizontalScrollbar.beginHide();
    }
  }
  _scheduleHide() {
    if (!this._mouseIsOver && !this._isDragging) {
      this._hideTimeout.cancelAndSet(() => this._hide(), HIDE_TIMEOUT);
    }
  }
}
class ScrollableElement extends AbstractScrollableElement {
  static {
    __name(this, "ScrollableElement");
  }
  constructor(element, options) {
    options = options || {};
    options.mouseWheelSmoothScroll = false;
    const scrollable = new Scrollable({
      forceIntegerValues: true,
      smoothScrollDuration: 0,
      scheduleAtNextAnimationFrame: /* @__PURE__ */ __name((callback) => dom.scheduleAtNextAnimationFrame(
        dom.getWindow(element),
        callback
      ), "scheduleAtNextAnimationFrame")
    });
    super(element, options, scrollable);
    this._register(scrollable);
  }
  setScrollPosition(update) {
    this._scrollable.setScrollPositionNow(update);
  }
  getScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
}
class SmoothScrollableElement extends AbstractScrollableElement {
  static {
    __name(this, "SmoothScrollableElement");
  }
  constructor(element, options, scrollable) {
    super(element, options, scrollable);
  }
  setScrollPosition(update) {
    if (update.reuseAnimation) {
      this._scrollable.setScrollPositionSmooth(
        update,
        update.reuseAnimation
      );
    } else {
      this._scrollable.setScrollPositionNow(update);
    }
  }
  getScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
}
class DomScrollableElement extends AbstractScrollableElement {
  static {
    __name(this, "DomScrollableElement");
  }
  _element;
  constructor(element, options) {
    options = options || {};
    options.mouseWheelSmoothScroll = false;
    const scrollable = new Scrollable({
      forceIntegerValues: false,
      // See https://github.com/microsoft/vscode/issues/139877
      smoothScrollDuration: 0,
      scheduleAtNextAnimationFrame: /* @__PURE__ */ __name((callback) => dom.scheduleAtNextAnimationFrame(
        dom.getWindow(element),
        callback
      ), "scheduleAtNextAnimationFrame")
    });
    super(element, options, scrollable);
    this._register(scrollable);
    this._element = element;
    this._register(
      this.onScroll((e) => {
        if (e.scrollTopChanged) {
          this._element.scrollTop = e.scrollTop;
        }
        if (e.scrollLeftChanged) {
          this._element.scrollLeft = e.scrollLeft;
        }
      })
    );
    this.scanDomNode();
  }
  setScrollPosition(update) {
    this._scrollable.setScrollPositionNow(update);
  }
  getScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
  scanDomNode() {
    this.setScrollDimensions({
      width: this._element.clientWidth,
      scrollWidth: this._element.scrollWidth,
      height: this._element.clientHeight,
      scrollHeight: this._element.scrollHeight
    });
    this.setScrollPosition({
      scrollLeft: this._element.scrollLeft,
      scrollTop: this._element.scrollTop
    });
  }
}
function resolveOptions(opts) {
  const result = {
    lazyRender: typeof opts.lazyRender !== "undefined" ? opts.lazyRender : false,
    className: typeof opts.className !== "undefined" ? opts.className : "",
    useShadows: typeof opts.useShadows !== "undefined" ? opts.useShadows : true,
    handleMouseWheel: typeof opts.handleMouseWheel !== "undefined" ? opts.handleMouseWheel : true,
    flipAxes: typeof opts.flipAxes !== "undefined" ? opts.flipAxes : false,
    consumeMouseWheelIfScrollbarIsNeeded: typeof opts.consumeMouseWheelIfScrollbarIsNeeded !== "undefined" ? opts.consumeMouseWheelIfScrollbarIsNeeded : false,
    alwaysConsumeMouseWheel: typeof opts.alwaysConsumeMouseWheel !== "undefined" ? opts.alwaysConsumeMouseWheel : false,
    scrollYToX: typeof opts.scrollYToX !== "undefined" ? opts.scrollYToX : false,
    mouseWheelScrollSensitivity: typeof opts.mouseWheelScrollSensitivity !== "undefined" ? opts.mouseWheelScrollSensitivity : 1,
    fastScrollSensitivity: typeof opts.fastScrollSensitivity !== "undefined" ? opts.fastScrollSensitivity : 5,
    scrollPredominantAxis: typeof opts.scrollPredominantAxis !== "undefined" ? opts.scrollPredominantAxis : true,
    mouseWheelSmoothScroll: typeof opts.mouseWheelSmoothScroll !== "undefined" ? opts.mouseWheelSmoothScroll : true,
    arrowSize: typeof opts.arrowSize !== "undefined" ? opts.arrowSize : 11,
    listenOnDomNode: typeof opts.listenOnDomNode !== "undefined" ? opts.listenOnDomNode : null,
    horizontal: typeof opts.horizontal !== "undefined" ? opts.horizontal : ScrollbarVisibility.Auto,
    horizontalScrollbarSize: typeof opts.horizontalScrollbarSize !== "undefined" ? opts.horizontalScrollbarSize : 10,
    horizontalSliderSize: typeof opts.horizontalSliderSize !== "undefined" ? opts.horizontalSliderSize : 0,
    horizontalHasArrows: typeof opts.horizontalHasArrows !== "undefined" ? opts.horizontalHasArrows : false,
    vertical: typeof opts.vertical !== "undefined" ? opts.vertical : ScrollbarVisibility.Auto,
    verticalScrollbarSize: typeof opts.verticalScrollbarSize !== "undefined" ? opts.verticalScrollbarSize : 10,
    verticalHasArrows: typeof opts.verticalHasArrows !== "undefined" ? opts.verticalHasArrows : false,
    verticalSliderSize: typeof opts.verticalSliderSize !== "undefined" ? opts.verticalSliderSize : 0,
    scrollByPage: typeof opts.scrollByPage !== "undefined" ? opts.scrollByPage : false
  };
  result.horizontalSliderSize = typeof opts.horizontalSliderSize !== "undefined" ? opts.horizontalSliderSize : result.horizontalScrollbarSize;
  result.verticalSliderSize = typeof opts.verticalSliderSize !== "undefined" ? opts.verticalSliderSize : result.verticalScrollbarSize;
  if (platform.isMacintosh) {
    result.className += " mac";
  }
  return result;
}
__name(resolveOptions, "resolveOptions");
export {
  AbstractScrollableElement,
  DomScrollableElement,
  MouseWheelClassifier,
  ScrollableElement,
  SmoothScrollableElement
};
//# sourceMappingURL=scrollableElement.js.map
