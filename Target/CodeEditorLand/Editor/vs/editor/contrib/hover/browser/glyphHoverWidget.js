var O=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var v=(a,e,t,i)=>{for(var o=i>1?void 0:i?f(e,t):e,s=a.length-1,r;s>=0;s--)(r=a[s])&&(o=(i?r(e,t,o):r(o))||o);return i&&o&&O(e,t,o),o},p=(a,e)=>(t,i)=>e(t,i,a);import*as l from"../../../../base/browser/dom.js";import{HoverWidget as b}from"../../../../base/browser/ui/hover/hoverWidget.js";import{Disposable as C,DisposableStore as y}from"../../../../base/common/lifecycle.js";import{IOpenerService as M}from"../../../../platform/opener/common/opener.js";import{MouseTargetType as m}from"../../../browser/editorBrowser.js";import{MarkdownRenderer as N}from"../../../browser/widget/markdownRenderer/browser/markdownRenderer.js";import{EditorOption as _}from"../../../common/config/editorOptions.js";import{ILanguageService as D}from"../../../common/languages/language.js";import{GlyphHoverComputer as I}from"./glyphHoverComputer.js";import{HoverOperation as L,HoverStartMode as u}from"./hoverOperation.js";import"./hoverTypes.js";import{isMousePositionWithinElement as E}from"./hoverUtils.js";const g=l.$;let n=class extends C{static ID="editor.contrib.modesGlyphHoverWidget";_editor;_hover;_isVisible;_messages;_markdownRenderer;_hoverOperation;_renderDisposeables=this._register(new y);_hoverComputerOptions;constructor(e,t,i){super(),this._editor=e,this._isVisible=!1,this._messages=[],this._hover=this._register(new b),this._hover.containerDomNode.classList.toggle("hidden",!this._isVisible),this._markdownRenderer=this._register(new N({editor:this._editor},t,i)),this._hoverOperation=this._register(new L(this._editor,new I(this._editor))),this._register(this._hoverOperation.onResult(o=>this._withResult(o))),this._register(this._editor.onDidChangeModelDecorations(()=>this._onModelDecorationsChanged())),this._register(this._editor.onDidChangeConfiguration(o=>{o.hasChanged(_.fontInfo)&&this._updateFont()})),this._register(l.addStandardDisposableListener(this._hover.containerDomNode,"mouseleave",o=>{this._onMouseLeave(o)})),this._editor.addOverlayWidget(this)}dispose(){this._hoverComputerOptions=void 0,this._editor.removeOverlayWidget(this),super.dispose()}getId(){return n.ID}getDomNode(){return this._hover.containerDomNode}getPosition(){return null}_updateFont(){Array.prototype.slice.call(this._hover.contentsDomNode.getElementsByClassName("code")).forEach(t=>this._editor.applyFontInfo(t))}_onModelDecorationsChanged(){this._isVisible&&this._hoverComputerOptions&&(this._hoverOperation.cancel(),this._hoverOperation.start(u.Delayed,this._hoverComputerOptions))}showsOrWillShow(e){const t=e.target;return t.type===m.GUTTER_GLYPH_MARGIN&&t.detail.glyphMarginLane?(this._startShowingAt(t.position.lineNumber,t.detail.glyphMarginLane),!0):t.type===m.GUTTER_LINE_NUMBERS?(this._startShowingAt(t.position.lineNumber,"lineNo"),!0):!1}_startShowingAt(e,t){this._hoverComputerOptions&&this._hoverComputerOptions.lineNumber===e&&this._hoverComputerOptions.laneOrLine===t||(this._hoverOperation.cancel(),this.hide(),this._hoverComputerOptions={lineNumber:e,laneOrLine:t},this._hoverOperation.start(u.Delayed,this._hoverComputerOptions))}hide(){this._hoverComputerOptions=void 0,this._hoverOperation.cancel(),this._isVisible&&(this._isVisible=!1,this._hover.containerDomNode.classList.toggle("hidden",!this._isVisible))}_withResult(e){this._messages=e.value,this._messages.length>0?this._renderMessages(e.options.lineNumber,e.options.laneOrLine,this._messages):this.hide()}_renderMessages(e,t,i){this._renderDisposeables.clear();const o=document.createDocumentFragment();for(const s of i){const r=g("div.hover-row.markdown-hover"),h=l.append(r,g("div.hover-contents")),d=this._renderDisposeables.add(this._markdownRenderer.render(s.value));h.appendChild(d.element),o.appendChild(r)}this._updateContents(o),this._showAt(e,t)}_updateContents(e){this._hover.contentsDomNode.textContent="",this._hover.contentsDomNode.appendChild(e),this._updateFont()}_showAt(e,t){this._isVisible||(this._isVisible=!0,this._hover.containerDomNode.classList.toggle("hidden",!this._isVisible));const i=this._editor.getLayoutInfo(),o=this._editor.getTopForLineNumber(e),s=this._editor.getScrollTop(),r=this._editor.getOption(_.lineHeight),h=this._hover.containerDomNode.clientHeight,d=o-s-(h-r)/2,c=i.glyphMarginLeft+i.glyphMarginWidth+(t==="lineNo"?i.lineNumbersWidth:0);this._hover.containerDomNode.style.left=`${c}px`,this._hover.containerDomNode.style.top=`${Math.max(Math.round(d),0)}px`}_onMouseLeave(e){const t=this._editor.getDomNode();(!t||!E(t,e.x,e.y))&&this.hide()}};n=v([p(1,D),p(2,M)],n);export{n as GlyphHoverWidget};
