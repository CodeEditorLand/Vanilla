var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FastDomNode, createFastDomNode } from "../../../base/browser/fastDomNode.js";
import { applyFontInfo } from "../config/domFontInfo.js";
import { DynamicViewOverlay } from "./dynamicViewOverlay.js";
import { IVisibleLine, VisibleLinesCollection } from "./viewLayer.js";
import { ViewPart } from "./viewPart.js";
import { StringBuilder } from "../../common/core/stringBuilder.js";
import { RenderingContext, RestrictedRenderingContext } from "./renderingContext.js";
import { ViewContext } from "../../common/viewModel/viewContext.js";
import * as viewEvents from "../../common/viewEvents.js";
import { ViewportData } from "../../common/viewLayout/viewLinesViewportData.js";
import { EditorOption } from "../../common/config/editorOptions.js";
class ViewOverlays extends ViewPart {
  static {
    __name(this, "ViewOverlays");
  }
  _visibleLines;
  domNode;
  _dynamicOverlays = [];
  _isFocused = false;
  constructor(context) {
    super(context);
    this._visibleLines = new VisibleLinesCollection({
      createLine: /* @__PURE__ */ __name(() => new ViewOverlayLine(this._dynamicOverlays), "createLine")
    });
    this.domNode = this._visibleLines.domNode;
    const options = this._context.configuration.options;
    const fontInfo = options.get(EditorOption.fontInfo);
    applyFontInfo(this.domNode, fontInfo);
    this.domNode.setClassName("view-overlays");
  }
  shouldRender() {
    if (super.shouldRender()) {
      return true;
    }
    for (let i = 0, len = this._dynamicOverlays.length; i < len; i++) {
      const dynamicOverlay = this._dynamicOverlays[i];
      if (dynamicOverlay.shouldRender()) {
        return true;
      }
    }
    return false;
  }
  dispose() {
    super.dispose();
    for (let i = 0, len = this._dynamicOverlays.length; i < len; i++) {
      const dynamicOverlay = this._dynamicOverlays[i];
      dynamicOverlay.dispose();
    }
    this._dynamicOverlays = [];
  }
  getDomNode() {
    return this.domNode;
  }
  addDynamicOverlay(overlay) {
    this._dynamicOverlays.push(overlay);
  }
  // ----- event handlers
  onConfigurationChanged(e) {
    this._visibleLines.onConfigurationChanged(e);
    const options = this._context.configuration.options;
    const fontInfo = options.get(EditorOption.fontInfo);
    applyFontInfo(this.domNode, fontInfo);
    return true;
  }
  onFlushed(e) {
    return this._visibleLines.onFlushed(e);
  }
  onFocusChanged(e) {
    this._isFocused = e.isFocused;
    return true;
  }
  onLinesChanged(e) {
    return this._visibleLines.onLinesChanged(e);
  }
  onLinesDeleted(e) {
    return this._visibleLines.onLinesDeleted(e);
  }
  onLinesInserted(e) {
    return this._visibleLines.onLinesInserted(e);
  }
  onScrollChanged(e) {
    return this._visibleLines.onScrollChanged(e) || true;
  }
  onTokensChanged(e) {
    return this._visibleLines.onTokensChanged(e);
  }
  onZonesChanged(e) {
    return this._visibleLines.onZonesChanged(e);
  }
  // ----- end event handlers
  prepareRender(ctx) {
    const toRender = this._dynamicOverlays.filter((overlay) => overlay.shouldRender());
    for (let i = 0, len = toRender.length; i < len; i++) {
      const dynamicOverlay = toRender[i];
      dynamicOverlay.prepareRender(ctx);
      dynamicOverlay.onDidRender();
    }
  }
  render(ctx) {
    this._viewOverlaysRender(ctx);
    this.domNode.toggleClassName("focused", this._isFocused);
  }
  _viewOverlaysRender(ctx) {
    this._visibleLines.renderLines(ctx.viewportData);
  }
}
class ViewOverlayLine {
  static {
    __name(this, "ViewOverlayLine");
  }
  _dynamicOverlays;
  _domNode;
  _renderedContent;
  constructor(dynamicOverlays) {
    this._dynamicOverlays = dynamicOverlays;
    this._domNode = null;
    this._renderedContent = null;
  }
  getDomNode() {
    if (!this._domNode) {
      return null;
    }
    return this._domNode.domNode;
  }
  setDomNode(domNode) {
    this._domNode = createFastDomNode(domNode);
  }
  onContentChanged() {
  }
  onTokensChanged() {
  }
  renderLine(lineNumber, deltaTop, lineHeight, viewportData, sb) {
    let result = "";
    for (let i = 0, len = this._dynamicOverlays.length; i < len; i++) {
      const dynamicOverlay = this._dynamicOverlays[i];
      result += dynamicOverlay.render(viewportData.startLineNumber, lineNumber);
    }
    if (this._renderedContent === result) {
      return false;
    }
    this._renderedContent = result;
    sb.appendString('<div style="top:');
    sb.appendString(String(deltaTop));
    sb.appendString("px;height:");
    sb.appendString(String(lineHeight));
    sb.appendString('px;">');
    sb.appendString(result);
    sb.appendString("</div>");
    return true;
  }
  layoutLine(lineNumber, deltaTop, lineHeight) {
    if (this._domNode) {
      this._domNode.setTop(deltaTop);
      this._domNode.setHeight(lineHeight);
    }
  }
}
class ContentViewOverlays extends ViewOverlays {
  static {
    __name(this, "ContentViewOverlays");
  }
  _contentWidth;
  constructor(context) {
    super(context);
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._contentWidth = layoutInfo.contentWidth;
    this.domNode.setHeight(0);
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._contentWidth = layoutInfo.contentWidth;
    return super.onConfigurationChanged(e) || true;
  }
  onScrollChanged(e) {
    return super.onScrollChanged(e) || e.scrollWidthChanged;
  }
  // --- end event handlers
  _viewOverlaysRender(ctx) {
    super._viewOverlaysRender(ctx);
    this.domNode.setWidth(Math.max(ctx.scrollWidth, this._contentWidth));
  }
}
class MarginViewOverlays extends ViewOverlays {
  static {
    __name(this, "MarginViewOverlays");
  }
  _contentLeft;
  constructor(context) {
    super(context);
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._contentLeft = layoutInfo.contentLeft;
    this.domNode.setClassName("margin-view-overlays");
    this.domNode.setWidth(1);
    applyFontInfo(this.domNode, options.get(EditorOption.fontInfo));
  }
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    applyFontInfo(this.domNode, options.get(EditorOption.fontInfo));
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._contentLeft = layoutInfo.contentLeft;
    return super.onConfigurationChanged(e) || true;
  }
  onScrollChanged(e) {
    return super.onScrollChanged(e) || e.scrollHeightChanged;
  }
  _viewOverlaysRender(ctx) {
    super._viewOverlaysRender(ctx);
    const height = Math.min(ctx.scrollHeight, 1e6);
    this.domNode.setHeight(height);
    this.domNode.setWidth(this._contentLeft);
  }
}
export {
  ContentViewOverlays,
  MarginViewOverlays,
  ViewOverlayLine,
  ViewOverlays
};
//# sourceMappingURL=viewOverlays.js.map
