import * as platform from "../common/platform.js";
import * as browser from "./browser.js";
import { IframeUtils } from "./iframe.js";
class StandardMouseEvent {
  browserEvent;
  leftButton;
  middleButton;
  rightButton;
  buttons;
  target;
  detail;
  posx;
  posy;
  ctrlKey;
  shiftKey;
  altKey;
  metaKey;
  timestamp;
  constructor(targetWindow, e) {
    this.timestamp = Date.now();
    this.browserEvent = e;
    this.leftButton = e.button === 0;
    this.middleButton = e.button === 1;
    this.rightButton = e.button === 2;
    this.buttons = e.buttons;
    this.target = e.target;
    this.detail = e.detail || 1;
    if (e.type === "dblclick") {
      this.detail = 2;
    }
    this.ctrlKey = e.ctrlKey;
    this.shiftKey = e.shiftKey;
    this.altKey = e.altKey;
    this.metaKey = e.metaKey;
    if (typeof e.pageX === "number") {
      this.posx = e.pageX;
      this.posy = e.pageY;
    } else {
      this.posx = e.clientX + this.target.ownerDocument.body.scrollLeft + this.target.ownerDocument.documentElement.scrollLeft;
      this.posy = e.clientY + this.target.ownerDocument.body.scrollTop + this.target.ownerDocument.documentElement.scrollTop;
    }
    const iframeOffsets = IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(
      targetWindow,
      e.view
    );
    this.posx -= iframeOffsets.left;
    this.posy -= iframeOffsets.top;
  }
  preventDefault() {
    this.browserEvent.preventDefault();
  }
  stopPropagation() {
    this.browserEvent.stopPropagation();
  }
}
class DragMouseEvent extends StandardMouseEvent {
  dataTransfer;
  constructor(targetWindow, e) {
    super(targetWindow, e);
    this.dataTransfer = e.dataTransfer;
  }
}
class StandardWheelEvent {
  browserEvent;
  deltaY;
  deltaX;
  target;
  constructor(e, deltaX = 0, deltaY = 0) {
    this.browserEvent = e || null;
    this.target = e ? e.target || e.targetNode || e.srcElement : null;
    this.deltaY = deltaY;
    this.deltaX = deltaX;
    let shouldFactorDPR = false;
    if (browser.isChrome) {
      const chromeVersionMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
      const chromeMajorVersion = chromeVersionMatch ? Number.parseInt(chromeVersionMatch[1]) : 123;
      shouldFactorDPR = chromeMajorVersion <= 122;
    }
    if (e) {
      const e1 = e;
      const e2 = e;
      const devicePixelRatio = e.view?.devicePixelRatio || 1;
      if (typeof e1.wheelDeltaY !== "undefined") {
        if (shouldFactorDPR) {
          this.deltaY = e1.wheelDeltaY / (120 * devicePixelRatio);
        } else {
          this.deltaY = e1.wheelDeltaY / 120;
        }
      } else if (typeof e2.VERTICAL_AXIS !== "undefined" && e2.axis === e2.VERTICAL_AXIS) {
        this.deltaY = -e2.detail / 3;
      } else if (e.type === "wheel") {
        const ev = e;
        if (ev.deltaMode === ev.DOM_DELTA_LINE) {
          if (browser.isFirefox && !platform.isMacintosh) {
            this.deltaY = -e.deltaY / 3;
          } else {
            this.deltaY = -e.deltaY;
          }
        } else {
          this.deltaY = -e.deltaY / 40;
        }
      }
      if (typeof e1.wheelDeltaX !== "undefined") {
        if (browser.isSafari && platform.isWindows) {
          this.deltaX = -(e1.wheelDeltaX / 120);
        } else if (shouldFactorDPR) {
          this.deltaX = e1.wheelDeltaX / (120 * devicePixelRatio);
        } else {
          this.deltaX = e1.wheelDeltaX / 120;
        }
      } else if (typeof e2.HORIZONTAL_AXIS !== "undefined" && e2.axis === e2.HORIZONTAL_AXIS) {
        this.deltaX = -e.detail / 3;
      } else if (e.type === "wheel") {
        const ev = e;
        if (ev.deltaMode === ev.DOM_DELTA_LINE) {
          if (browser.isFirefox && !platform.isMacintosh) {
            this.deltaX = -e.deltaX / 3;
          } else {
            this.deltaX = -e.deltaX;
          }
        } else {
          this.deltaX = -e.deltaX / 40;
        }
      }
      if (this.deltaY === 0 && this.deltaX === 0 && e.wheelDelta) {
        if (shouldFactorDPR) {
          this.deltaY = e.wheelDelta / (120 * devicePixelRatio);
        } else {
          this.deltaY = e.wheelDelta / 120;
        }
      }
    }
  }
  preventDefault() {
    this.browserEvent?.preventDefault();
  }
  stopPropagation() {
    this.browserEvent?.stopPropagation();
  }
}
export {
  DragMouseEvent,
  StandardMouseEvent,
  StandardWheelEvent
};
