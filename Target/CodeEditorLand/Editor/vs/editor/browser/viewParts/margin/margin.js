import"./margin.css";import{createFastDomNode as r}from"../../../../base/browser/fastDomNode.js";import{ViewPart as s}from"../../view/viewPart.js";import{EditorOption as i}from"../../../common/config/editorOptions.js";class n extends s{static CLASS_NAME="glyph-margin";static OUTER_CLASS_NAME="margin";_domNode;_canUseLayerHinting;_contentLeft;_glyphMarginLeft;_glyphMarginWidth;_glyphMarginBackgroundDomNode;constructor(t){super(t);const o=this._context.configuration.options,e=o.get(i.layoutInfo);this._canUseLayerHinting=!o.get(i.disableLayerHinting),this._contentLeft=e.contentLeft,this._glyphMarginLeft=e.glyphMarginLeft,this._glyphMarginWidth=e.glyphMarginWidth,this._domNode=r(document.createElement("div")),this._domNode.setClassName(n.OUTER_CLASS_NAME),this._domNode.setPosition("absolute"),this._domNode.setAttribute("role","presentation"),this._domNode.setAttribute("aria-hidden","true"),this._glyphMarginBackgroundDomNode=r(document.createElement("div")),this._glyphMarginBackgroundDomNode.setClassName(n.CLASS_NAME),this._domNode.appendChild(this._glyphMarginBackgroundDomNode)}dispose(){super.dispose()}getDomNode(){return this._domNode}onConfigurationChanged(t){const o=this._context.configuration.options,e=o.get(i.layoutInfo);return this._canUseLayerHinting=!o.get(i.disableLayerHinting),this._contentLeft=e.contentLeft,this._glyphMarginLeft=e.glyphMarginLeft,this._glyphMarginWidth=e.glyphMarginWidth,!0}onScrollChanged(t){return super.onScrollChanged(t)||t.scrollTopChanged}prepareRender(t){}render(t){this._domNode.setLayerHinting(this._canUseLayerHinting),this._domNode.setContain("strict");const o=t.scrollTop-t.bigNumbersDelta;this._domNode.setTop(-o);const e=Math.min(t.scrollHeight,1e6);this._domNode.setHeight(e),this._domNode.setWidth(this._contentLeft),this._glyphMarginBackgroundDomNode.setLeft(this._glyphMarginLeft),this._glyphMarginBackgroundDomNode.setWidth(this._glyphMarginWidth),this._glyphMarginBackgroundDomNode.setHeight(e)}}export{n as Margin};
