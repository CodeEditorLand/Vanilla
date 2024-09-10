import{createFastDomNode as l}from"../../../../base/browser/fastDomNode.js";import{onUnexpectedError as p}from"../../../../base/common/errors.js";import{ViewPart as v}from"../../view/viewPart.js";import{Position as b}from"../../../common/core/position.js";import{EditorOption as m}from"../../../common/config/editorOptions.js";const g=()=>{throw new Error("Invalid change accessor")};class F extends v{_zones;_lineHeight;_contentWidth;_contentLeft;domNode;marginDomNode;constructor(e){super(e);const t=this._context.configuration.options,i=t.get(m.layoutInfo);this._lineHeight=t.get(m.lineHeight),this._contentWidth=i.contentWidth,this._contentLeft=i.contentLeft,this.domNode=l(document.createElement("div")),this.domNode.setClassName("view-zones"),this.domNode.setPosition("absolute"),this.domNode.setAttribute("role","presentation"),this.domNode.setAttribute("aria-hidden","true"),this.marginDomNode=l(document.createElement("div")),this.marginDomNode.setClassName("margin-view-zones"),this.marginDomNode.setPosition("absolute"),this.marginDomNode.setAttribute("role","presentation"),this.marginDomNode.setAttribute("aria-hidden","true"),this._zones={}}dispose(){super.dispose(),this._zones={}}_recomputeWhitespacesProps(){const e=this._context.viewLayout.getWhitespaces(),t=new Map;for(const n of e)t.set(n.id,n);let i=!1;return this._context.viewModel.changeWhitespace(n=>{const o=Object.keys(this._zones);for(let r=0,c=o.length;r<c;r++){const d=o[r],s=this._zones[d],a=this._computeWhitespaceProps(s.delegate);s.isInHiddenArea=a.isInHiddenArea;const h=t.get(d);h&&(h.afterLineNumber!==a.afterViewLineNumber||h.height!==a.heightInPx)&&(n.changeOneWhitespace(d,a.afterViewLineNumber,a.heightInPx),this._safeCallOnComputedHeight(s.delegate,a.heightInPx),i=!0)}}),i}onConfigurationChanged(e){const t=this._context.configuration.options,i=t.get(m.layoutInfo);return this._lineHeight=t.get(m.lineHeight),this._contentWidth=i.contentWidth,this._contentLeft=i.contentLeft,e.hasChanged(m.lineHeight)&&this._recomputeWhitespacesProps(),!0}onLineMappingChanged(e){return this._recomputeWhitespacesProps()}onLinesDeleted(e){return!0}onScrollChanged(e){return e.scrollTopChanged||e.scrollWidthChanged}onZonesChanged(e){return!0}onLinesInserted(e){return!0}_getZoneOrdinal(e){return e.ordinal??e.afterColumn??1e4}_computeWhitespaceProps(e){if(e.afterLineNumber===0)return{isInHiddenArea:!1,afterViewLineNumber:0,heightInPx:this._heightInPixels(e),minWidthInPx:this._minWidthInPixels(e)};let t;if(typeof e.afterColumn<"u")t=this._context.viewModel.model.validatePosition({lineNumber:e.afterLineNumber,column:e.afterColumn});else{const r=this._context.viewModel.model.validatePosition({lineNumber:e.afterLineNumber,column:1}).lineNumber;t=new b(r,this._context.viewModel.model.getLineMaxColumn(r))}let i;t.column===this._context.viewModel.model.getLineMaxColumn(t.lineNumber)?i=this._context.viewModel.model.validatePosition({lineNumber:t.lineNumber+1,column:1}):i=this._context.viewModel.model.validatePosition({lineNumber:t.lineNumber,column:t.column+1});const n=this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(t,e.afterColumnAffinity,!0),o=e.showInHiddenAreas||this._context.viewModel.coordinatesConverter.modelPositionIsVisible(i);return{isInHiddenArea:!o,afterViewLineNumber:n.lineNumber,heightInPx:o?this._heightInPixels(e):0,minWidthInPx:this._minWidthInPixels(e)}}changeViewZones(e){let t=!1;return this._context.viewModel.changeWhitespace(i=>{const n={addZone:o=>(t=!0,this._addZone(i,o)),removeZone:o=>{o&&(t=this._removeZone(i,o)||t)},layoutZone:o=>{o&&(t=this._layoutZone(i,o)||t)}};w(e,n),n.addZone=g,n.removeZone=g,n.layoutZone=g}),t}_addZone(e,t){const i=this._computeWhitespaceProps(t),o={whitespaceId:e.insertWhitespace(i.afterViewLineNumber,this._getZoneOrdinal(t),i.heightInPx,i.minWidthInPx),delegate:t,isInHiddenArea:i.isInHiddenArea,isVisible:!1,domNode:l(t.domNode),marginDomNode:t.marginDomNode?l(t.marginDomNode):null};return this._safeCallOnComputedHeight(o.delegate,i.heightInPx),o.domNode.setPosition("absolute"),o.domNode.domNode.style.width="100%",o.domNode.setDisplay("none"),o.domNode.setAttribute("monaco-view-zone",o.whitespaceId),this.domNode.appendChild(o.domNode),o.marginDomNode&&(o.marginDomNode.setPosition("absolute"),o.marginDomNode.domNode.style.width="100%",o.marginDomNode.setDisplay("none"),o.marginDomNode.setAttribute("monaco-view-zone",o.whitespaceId),this.marginDomNode.appendChild(o.marginDomNode)),this._zones[o.whitespaceId]=o,this.setShouldRender(),o.whitespaceId}_removeZone(e,t){if(this._zones.hasOwnProperty(t)){const i=this._zones[t];return delete this._zones[t],e.removeWhitespace(i.whitespaceId),i.domNode.removeAttribute("monaco-visible-view-zone"),i.domNode.removeAttribute("monaco-view-zone"),i.domNode.domNode.remove(),i.marginDomNode&&(i.marginDomNode.removeAttribute("monaco-visible-view-zone"),i.marginDomNode.removeAttribute("monaco-view-zone"),i.marginDomNode.domNode.remove()),this.setShouldRender(),!0}return!1}_layoutZone(e,t){if(this._zones.hasOwnProperty(t)){const i=this._zones[t],n=this._computeWhitespaceProps(i.delegate);return i.isInHiddenArea=n.isInHiddenArea,e.changeOneWhitespace(i.whitespaceId,n.afterViewLineNumber,n.heightInPx),this._safeCallOnComputedHeight(i.delegate,n.heightInPx),this.setShouldRender(),!0}return!1}shouldSuppressMouseDownOnViewZone(e){return this._zones.hasOwnProperty(e)?!!this._zones[e].delegate.suppressMouseDown:!1}_heightInPixels(e){return typeof e.heightInPx=="number"?e.heightInPx:typeof e.heightInLines=="number"?this._lineHeight*e.heightInLines:this._lineHeight}_minWidthInPixels(e){return typeof e.minWidthInPx=="number"?e.minWidthInPx:0}_safeCallOnComputedHeight(e,t){if(typeof e.onComputedHeight=="function")try{e.onComputedHeight(t)}catch(i){p(i)}}_safeCallOnDomNodeTop(e,t){if(typeof e.onDomNodeTop=="function")try{e.onDomNodeTop(t)}catch(i){p(i)}}prepareRender(e){}render(e){const t=e.viewportData.whitespaceViewportData,i={};let n=!1;for(const r of t)this._zones[r.id].isInHiddenArea||(i[r.id]=r,n=!0);const o=Object.keys(this._zones);for(let r=0,c=o.length;r<c;r++){const d=o[r],s=this._zones[d];let a=0,h=0,u="none";i.hasOwnProperty(d)?(a=i[d].verticalOffset-e.bigNumbersDelta,h=i[d].height,u="block",s.isVisible||(s.domNode.setAttribute("monaco-visible-view-zone","true"),s.isVisible=!0),this._safeCallOnDomNodeTop(s.delegate,e.getScrolledTopFromAbsoluteTop(i[d].verticalOffset))):(s.isVisible&&(s.domNode.removeAttribute("monaco-visible-view-zone"),s.isVisible=!1),this._safeCallOnDomNodeTop(s.delegate,e.getScrolledTopFromAbsoluteTop(-1e6))),s.domNode.setTop(a),s.domNode.setHeight(h),s.domNode.setDisplay(u),s.marginDomNode&&(s.marginDomNode.setTop(a),s.marginDomNode.setHeight(h),s.marginDomNode.setDisplay(u))}n&&(this.domNode.setWidth(Math.max(e.scrollWidth,this._contentWidth)),this.marginDomNode.setWidth(this._contentLeft))}}function w(f,e){try{return f(e)}catch(t){p(t)}}export{F as ViewZones};
