var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BrowserFeatures } from "../../../base/browser/canIUse.js";
import * as dom from "../../../base/browser/dom.js";
import { EventType, Gesture, GestureEvent } from "../../../base/browser/touch.js";
import { mainWindow } from "../../../base/browser/window.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import * as platform from "../../../base/common/platform.js";
import { IPointerHandlerHelper, MouseHandler } from "./mouseHandler.js";
import { NavigationCommandRevealType } from "../coreCommands.js";
import { IMouseTarget, MouseTargetType } from "../editorBrowser.js";
import { EditorMouseEvent, EditorPointerEventFactory } from "../editorDom.js";
import { ViewController } from "../view/viewController.js";
import { ViewContext } from "../../common/viewModel/viewContext.js";
import { TextAreaSyntethicEvents } from "./editContext/textArea/textAreaEditContextInput.js";
class PointerEventHandler extends MouseHandler {
  static {
    __name(this, "PointerEventHandler");
  }
  _lastPointerType;
  constructor(context, viewController, viewHelper) {
    super(context, viewController, viewHelper);
    this._register(Gesture.addTarget(this.viewHelper.linesContentDomNode));
    this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, EventType.Tap, (e) => this.onTap(e)));
    this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, EventType.Change, (e) => this.onChange(e)));
    this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, EventType.Contextmenu, (e) => this._onContextMenu(new EditorMouseEvent(e, false, this.viewHelper.viewDomNode), false)));
    this._lastPointerType = "mouse";
    this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, "pointerdown", (e) => {
      const pointerType = e.pointerType;
      if (pointerType === "mouse") {
        this._lastPointerType = "mouse";
        return;
      } else if (pointerType === "touch") {
        this._lastPointerType = "touch";
      } else {
        this._lastPointerType = "pen";
      }
    }));
    const pointerEvents = new EditorPointerEventFactory(this.viewHelper.viewDomNode);
    this._register(pointerEvents.onPointerMove(this.viewHelper.viewDomNode, (e) => this._onMouseMove(e)));
    this._register(pointerEvents.onPointerUp(this.viewHelper.viewDomNode, (e) => this._onMouseUp(e)));
    this._register(pointerEvents.onPointerLeave(this.viewHelper.viewDomNode, (e) => this._onMouseLeave(e)));
    this._register(pointerEvents.onPointerDown(this.viewHelper.viewDomNode, (e, pointerId) => this._onMouseDown(e, pointerId)));
  }
  onTap(event) {
    if (!event.initialTarget || !this.viewHelper.linesContentDomNode.contains(event.initialTarget)) {
      return;
    }
    event.preventDefault();
    this.viewHelper.focusTextArea();
    this._dispatchGesture(
      event,
      /*inSelectionMode*/
      false
    );
  }
  onChange(event) {
    if (this._lastPointerType === "touch") {
      this._context.viewModel.viewLayout.deltaScrollNow(-event.translationX, -event.translationY);
    }
    if (this._lastPointerType === "pen") {
      this._dispatchGesture(
        event,
        /*inSelectionMode*/
        true
      );
    }
  }
  _dispatchGesture(event, inSelectionMode) {
    const target = this._createMouseTarget(new EditorMouseEvent(event, false, this.viewHelper.viewDomNode), false);
    if (target.position) {
      this.viewController.dispatchMouse({
        position: target.position,
        mouseColumn: target.position.column,
        startedOnLineNumbers: false,
        revealType: NavigationCommandRevealType.Minimal,
        mouseDownCount: event.tapCount,
        inSelectionMode,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        leftButton: false,
        middleButton: false,
        onInjectedText: target.type === MouseTargetType.CONTENT_TEXT && target.detail.injectedText !== null
      });
    }
  }
  _onMouseDown(e, pointerId) {
    if (e.browserEvent.pointerType === "touch") {
      return;
    }
    super._onMouseDown(e, pointerId);
  }
}
class TouchHandler extends MouseHandler {
  static {
    __name(this, "TouchHandler");
  }
  constructor(context, viewController, viewHelper) {
    super(context, viewController, viewHelper);
    this._register(Gesture.addTarget(this.viewHelper.linesContentDomNode));
    this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, EventType.Tap, (e) => this.onTap(e)));
    this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, EventType.Change, (e) => this.onChange(e)));
    this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, EventType.Contextmenu, (e) => this._onContextMenu(new EditorMouseEvent(e, false, this.viewHelper.viewDomNode), false)));
  }
  onTap(event) {
    event.preventDefault();
    this.viewHelper.focusTextArea();
    const target = this._createMouseTarget(new EditorMouseEvent(event, false, this.viewHelper.viewDomNode), false);
    if (target.position) {
      const event2 = document.createEvent("CustomEvent");
      event2.initEvent(TextAreaSyntethicEvents.Tap, false, true);
      this.viewHelper.dispatchTextAreaEvent(event2);
      this.viewController.moveTo(target.position, NavigationCommandRevealType.Minimal);
    }
  }
  onChange(e) {
    this._context.viewModel.viewLayout.deltaScrollNow(-e.translationX, -e.translationY);
  }
}
class PointerHandler extends Disposable {
  static {
    __name(this, "PointerHandler");
  }
  handler;
  constructor(context, viewController, viewHelper) {
    super();
    const isPhone = platform.isIOS || platform.isAndroid && platform.isMobile;
    if (isPhone && BrowserFeatures.pointerEvents) {
      this.handler = this._register(new PointerEventHandler(context, viewController, viewHelper));
    } else if (mainWindow.TouchEvent) {
      this.handler = this._register(new TouchHandler(context, viewController, viewHelper));
    } else {
      this.handler = this._register(new MouseHandler(context, viewController, viewHelper));
    }
  }
  getTargetAtClientPoint(clientX, clientY) {
    return this.handler.getTargetAtClientPoint(clientX, clientY);
  }
}
export {
  PointerEventHandler,
  PointerHandler
};
//# sourceMappingURL=pointerHandler.js.map
