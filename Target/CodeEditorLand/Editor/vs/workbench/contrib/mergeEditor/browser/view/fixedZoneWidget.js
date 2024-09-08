import { h } from "../../../../../base/browser/dom.js";
import { Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
class FixedZoneWidget extends Disposable {
  constructor(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp) {
    super();
    this.editor = editor;
    this.viewZoneId = viewZoneAccessor.addZone({
      domNode: document.createElement("div"),
      afterLineNumber,
      heightInPx: height,
      ordinal: 5e4 + 1,
      onComputedHeight: (height2) => {
        this.widgetDomNode.style.height = `${height2}px`;
      },
      onDomNodeTop: (top) => {
        this.widgetDomNode.style.top = `${top}px`;
      }
    });
    viewZoneIdsToCleanUp.push(this.viewZoneId);
    this._register(
      Event.runAndSubscribe(this.editor.onDidLayoutChange, () => {
        this.widgetDomNode.style.left = this.editor.getLayoutInfo().contentLeft + "px";
      })
    );
    this.editor.addOverlayWidget(this.overlayWidget);
    this._register({
      dispose: () => {
        this.editor.removeOverlayWidget(this.overlayWidget);
      }
    });
  }
  static counter = 0;
  overlayWidgetId = `fixedZoneWidget-${FixedZoneWidget.counter++}`;
  viewZoneId;
  widgetDomNode = h("div.fixed-zone-widget").root;
  overlayWidget = {
    getId: () => this.overlayWidgetId,
    getDomNode: () => this.widgetDomNode,
    getPosition: () => null
  };
}
export {
  FixedZoneWidget
};
