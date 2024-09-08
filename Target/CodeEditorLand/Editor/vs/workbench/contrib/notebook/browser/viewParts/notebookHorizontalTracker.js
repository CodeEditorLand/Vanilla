import {
  EventType,
  addDisposableListener,
  getWindow
} from "../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { isChrome } from "../../../../../base/common/platform.js";
class NotebookHorizontalTracker extends Disposable {
  constructor(_notebookEditor, _listViewScrollablement) {
    super();
    this._notebookEditor = _notebookEditor;
    this._listViewScrollablement = _listViewScrollablement;
    this._register(
      addDisposableListener(
        this._listViewScrollablement,
        EventType.MOUSE_WHEEL,
        (event) => {
          if (event.deltaX === 0) {
            return;
          }
          const hoveringOnEditor = this._notebookEditor.codeEditors.find((editor) => {
            const editorLayout = editor[1].getLayoutInfo();
            if (editorLayout.contentWidth === editorLayout.width) {
              return false;
            }
            const editorDOM = editor[1].getDomNode();
            if (editorDOM && editorDOM.contains(event.target)) {
              return true;
            }
            return false;
          });
          if (!hoveringOnEditor) {
            return;
          }
          const targetWindow = getWindow(event);
          const evt = {
            deltaMode: event.deltaMode,
            deltaX: event.deltaX,
            deltaY: 0,
            deltaZ: 0,
            wheelDelta: event.wheelDelta && isChrome ? event.wheelDelta / targetWindow.devicePixelRatio : event.wheelDelta,
            wheelDeltaX: event.wheelDeltaX && isChrome ? event.wheelDeltaX / targetWindow.devicePixelRatio : event.wheelDeltaX,
            wheelDeltaY: 0,
            detail: event.detail,
            shiftKey: event.shiftKey,
            type: event.type,
            defaultPrevented: false,
            preventDefault: () => {
            },
            stopPropagation: () => {
            }
          };
          hoveringOnEditor[1].delegateScrollFromMouseWheelEvent(evt);
        }
      )
    );
  }
}
export {
  NotebookHorizontalTracker
};
