var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./overlayWidgets.css";
import { FastDomNode, createFastDomNode } from "../../../../base/browser/fastDomNode.js";
import { IOverlayWidget, IOverlayWidgetPosition, IOverlayWidgetPositionCoordinates, OverlayWidgetPositionPreference } from "../../editorBrowser.js";
import { PartFingerprint, PartFingerprints, ViewPart } from "../../view/viewPart.js";
import { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import * as viewEvents from "../../../common/viewEvents.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import * as dom from "../../../../base/browser/dom.js";
class ViewOverlayWidgets extends ViewPart {
  static {
    __name(this, "ViewOverlayWidgets");
  }
  _viewDomNode;
  _widgets;
  _viewDomNodeRect;
  _domNode;
  overflowingOverlayWidgetsDomNode;
  _verticalScrollbarWidth;
  _minimapWidth;
  _horizontalScrollbarHeight;
  _editorHeight;
  _editorWidth;
  constructor(context, viewDomNode) {
    super(context);
    this._viewDomNode = viewDomNode;
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._widgets = {};
    this._verticalScrollbarWidth = layoutInfo.verticalScrollbarWidth;
    this._minimapWidth = layoutInfo.minimap.minimapWidth;
    this._horizontalScrollbarHeight = layoutInfo.horizontalScrollbarHeight;
    this._editorHeight = layoutInfo.height;
    this._editorWidth = layoutInfo.width;
    this._viewDomNodeRect = { top: 0, left: 0, width: 0, height: 0 };
    this._domNode = createFastDomNode(document.createElement("div"));
    PartFingerprints.write(this._domNode, PartFingerprint.OverlayWidgets);
    this._domNode.setClassName("overlayWidgets");
    this.overflowingOverlayWidgetsDomNode = createFastDomNode(document.createElement("div"));
    PartFingerprints.write(this.overflowingOverlayWidgetsDomNode, PartFingerprint.OverflowingOverlayWidgets);
    this.overflowingOverlayWidgetsDomNode.setClassName("overflowingOverlayWidgets");
  }
  dispose() {
    super.dispose();
    this._widgets = {};
  }
  getDomNode() {
    return this._domNode;
  }
  // ---- begin view event handlers
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._verticalScrollbarWidth = layoutInfo.verticalScrollbarWidth;
    this._minimapWidth = layoutInfo.minimap.minimapWidth;
    this._horizontalScrollbarHeight = layoutInfo.horizontalScrollbarHeight;
    this._editorHeight = layoutInfo.height;
    this._editorWidth = layoutInfo.width;
    return true;
  }
  // ---- end view event handlers
  addWidget(widget) {
    const domNode = createFastDomNode(widget.getDomNode());
    this._widgets[widget.getId()] = {
      widget,
      preference: null,
      domNode
    };
    domNode.setPosition("absolute");
    domNode.setAttribute("widgetId", widget.getId());
    if (widget.allowEditorOverflow) {
      this.overflowingOverlayWidgetsDomNode.appendChild(domNode);
    } else {
      this._domNode.appendChild(domNode);
    }
    this.setShouldRender();
    this._updateMaxMinWidth();
  }
  setWidgetPosition(widget, position) {
    const widgetData = this._widgets[widget.getId()];
    const preference = position ? position.preference : null;
    const stack = position?.stackOridinal;
    if (widgetData.preference === preference && widgetData.stack === stack) {
      this._updateMaxMinWidth();
      return false;
    }
    widgetData.preference = preference;
    widgetData.stack = stack;
    this.setShouldRender();
    this._updateMaxMinWidth();
    return true;
  }
  removeWidget(widget) {
    const widgetId = widget.getId();
    if (this._widgets.hasOwnProperty(widgetId)) {
      const widgetData = this._widgets[widgetId];
      const domNode = widgetData.domNode.domNode;
      delete this._widgets[widgetId];
      domNode.remove();
      this.setShouldRender();
      this._updateMaxMinWidth();
    }
  }
  _updateMaxMinWidth() {
    let maxMinWidth = 0;
    const keys = Object.keys(this._widgets);
    for (let i = 0, len = keys.length; i < len; i++) {
      const widgetId = keys[i];
      const widget = this._widgets[widgetId];
      const widgetMinWidthInPx = widget.widget.getMinContentWidthInPx?.();
      if (typeof widgetMinWidthInPx !== "undefined") {
        maxMinWidth = Math.max(maxMinWidth, widgetMinWidthInPx);
      }
    }
    this._context.viewLayout.setOverlayWidgetsMinWidth(maxMinWidth);
  }
  _renderWidget(widgetData, stackCoordinates) {
    const domNode = widgetData.domNode;
    if (widgetData.preference === null) {
      domNode.setTop("");
      return;
    }
    const maxRight = 2 * this._verticalScrollbarWidth + this._minimapWidth;
    if (widgetData.preference === OverlayWidgetPositionPreference.TOP_RIGHT_CORNER || widgetData.preference === OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER) {
      if (widgetData.preference === OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER) {
        const widgetHeight = domNode.domNode.clientHeight;
        domNode.setTop(this._editorHeight - widgetHeight - 2 * this._horizontalScrollbarHeight);
      } else {
        domNode.setTop(0);
      }
      if (widgetData.stack !== void 0) {
        domNode.setTop(stackCoordinates[widgetData.preference]);
        stackCoordinates[widgetData.preference] += domNode.domNode.clientWidth;
      } else {
        domNode.setRight(maxRight);
      }
    } else if (widgetData.preference === OverlayWidgetPositionPreference.TOP_CENTER) {
      domNode.domNode.style.right = "50%";
      if (widgetData.stack !== void 0) {
        domNode.setTop(stackCoordinates[OverlayWidgetPositionPreference.TOP_CENTER]);
        stackCoordinates[OverlayWidgetPositionPreference.TOP_CENTER] += domNode.domNode.clientHeight;
      } else {
        domNode.setTop(0);
      }
    } else {
      const { top, left } = widgetData.preference;
      const fixedOverflowWidgets = this._context.configuration.options.get(EditorOption.fixedOverflowWidgets);
      if (fixedOverflowWidgets && widgetData.widget.allowEditorOverflow) {
        const editorBoundingBox = this._viewDomNodeRect;
        domNode.setTop(top + editorBoundingBox.top);
        domNode.setLeft(left + editorBoundingBox.left);
        domNode.setPosition("fixed");
      } else {
        domNode.setTop(top);
        domNode.setLeft(left);
        domNode.setPosition("absolute");
      }
    }
  }
  prepareRender(ctx) {
    this._viewDomNodeRect = dom.getDomNodePagePosition(this._viewDomNode.domNode);
  }
  render(ctx) {
    this._domNode.setWidth(this._editorWidth);
    const keys = Object.keys(this._widgets);
    const stackCoordinates = Array.from({ length: OverlayWidgetPositionPreference.TOP_CENTER + 1 }, () => 0);
    keys.sort((a, b) => (this._widgets[a].stack || 0) - (this._widgets[b].stack || 0));
    for (let i = 0, len = keys.length; i < len; i++) {
      const widgetId = keys[i];
      this._renderWidget(this._widgets[widgetId], stackCoordinates);
    }
  }
}
export {
  ViewOverlayWidgets
};
//# sourceMappingURL=overlayWidgets.js.map
