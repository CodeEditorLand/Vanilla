import { Disposable } from "../../common/lifecycle.js";
import * as dom from "../dom.js";
import {
  StandardKeyboardEvent
} from "../keyboardEvent.js";
import { StandardMouseEvent } from "../mouseEvent.js";
import { Gesture } from "../touch.js";
class Widget extends Disposable {
  onclick(domNode, listener) {
    this._register(
      dom.addDisposableListener(
        domNode,
        dom.EventType.CLICK,
        (e) => listener(new StandardMouseEvent(dom.getWindow(domNode), e))
      )
    );
  }
  onmousedown(domNode, listener) {
    this._register(
      dom.addDisposableListener(
        domNode,
        dom.EventType.MOUSE_DOWN,
        (e) => listener(new StandardMouseEvent(dom.getWindow(domNode), e))
      )
    );
  }
  onmouseover(domNode, listener) {
    this._register(
      dom.addDisposableListener(
        domNode,
        dom.EventType.MOUSE_OVER,
        (e) => listener(new StandardMouseEvent(dom.getWindow(domNode), e))
      )
    );
  }
  onmouseleave(domNode, listener) {
    this._register(
      dom.addDisposableListener(
        domNode,
        dom.EventType.MOUSE_LEAVE,
        (e) => listener(new StandardMouseEvent(dom.getWindow(domNode), e))
      )
    );
  }
  onkeydown(domNode, listener) {
    this._register(
      dom.addDisposableListener(
        domNode,
        dom.EventType.KEY_DOWN,
        (e) => listener(new StandardKeyboardEvent(e))
      )
    );
  }
  onkeyup(domNode, listener) {
    this._register(
      dom.addDisposableListener(
        domNode,
        dom.EventType.KEY_UP,
        (e) => listener(new StandardKeyboardEvent(e))
      )
    );
  }
  oninput(domNode, listener) {
    this._register(
      dom.addDisposableListener(domNode, dom.EventType.INPUT, listener)
    );
  }
  onblur(domNode, listener) {
    this._register(
      dom.addDisposableListener(domNode, dom.EventType.BLUR, listener)
    );
  }
  onfocus(domNode, listener) {
    this._register(
      dom.addDisposableListener(domNode, dom.EventType.FOCUS, listener)
    );
  }
  onchange(domNode, listener) {
    this._register(
      dom.addDisposableListener(domNode, dom.EventType.CHANGE, listener)
    );
  }
  ignoreGesture(domNode) {
    return Gesture.ignoreTarget(domNode);
  }
}
export {
  Widget
};
