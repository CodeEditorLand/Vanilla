var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./margin.css";
import { FastDomNode, createFastDomNode } from "../../../../base/browser/fastDomNode.js";
import { ViewPart } from "../../view/viewPart.js";
import { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import * as viewEvents from "../../../common/viewEvents.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
class Margin extends ViewPart {
  static {
    __name(this, "Margin");
  }
  static CLASS_NAME = "glyph-margin";
  static OUTER_CLASS_NAME = "margin";
  _domNode;
  _canUseLayerHinting;
  _contentLeft;
  _glyphMarginLeft;
  _glyphMarginWidth;
  _glyphMarginBackgroundDomNode;
  constructor(context) {
    super(context);
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._canUseLayerHinting = !options.get(EditorOption.disableLayerHinting);
    this._contentLeft = layoutInfo.contentLeft;
    this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
    this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setClassName(Margin.OUTER_CLASS_NAME);
    this._domNode.setPosition("absolute");
    this._domNode.setAttribute("role", "presentation");
    this._domNode.setAttribute("aria-hidden", "true");
    this._glyphMarginBackgroundDomNode = createFastDomNode(document.createElement("div"));
    this._glyphMarginBackgroundDomNode.setClassName(Margin.CLASS_NAME);
    this._domNode.appendChild(this._glyphMarginBackgroundDomNode);
  }
  dispose() {
    super.dispose();
  }
  getDomNode() {
    return this._domNode;
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._canUseLayerHinting = !options.get(EditorOption.disableLayerHinting);
    this._contentLeft = layoutInfo.contentLeft;
    this._glyphMarginLeft = layoutInfo.glyphMarginLeft;
    this._glyphMarginWidth = layoutInfo.glyphMarginWidth;
    return true;
  }
  onScrollChanged(e) {
    return super.onScrollChanged(e) || e.scrollTopChanged;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
    this._domNode.setLayerHinting(this._canUseLayerHinting);
    this._domNode.setContain("strict");
    const adjustedScrollTop = ctx.scrollTop - ctx.bigNumbersDelta;
    this._domNode.setTop(-adjustedScrollTop);
    const height = Math.min(ctx.scrollHeight, 1e6);
    this._domNode.setHeight(height);
    this._domNode.setWidth(this._contentLeft);
    this._glyphMarginBackgroundDomNode.setLeft(this._glyphMarginLeft);
    this._glyphMarginBackgroundDomNode.setWidth(this._glyphMarginWidth);
    this._glyphMarginBackgroundDomNode.setHeight(height);
  }
}
export {
  Margin
};
//# sourceMappingURL=margin.js.map
