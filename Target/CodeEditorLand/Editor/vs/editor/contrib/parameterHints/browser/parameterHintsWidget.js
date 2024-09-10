var H=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var C=(b,u,t,o)=>{for(var e=o>1?void 0:o?k(u,t):u,n=b.length-1,s;n>=0;n--)(s=b[n])&&(e=(o?s(u,t,e):s(e))||e);return o&&e&&H(u,t,e),e},f=(b,u)=>(t,o)=>u(t,o,b);import*as r from"../../../../base/browser/dom.js";import*as L from"../../../../base/browser/ui/aria/aria.js";import{DomScrollableElement as E}from"../../../../base/browser/ui/scrollbar/scrollableElement.js";import{Codicon as S}from"../../../../base/common/codicons.js";import{Event as P}from"../../../../base/common/event.js";import{Disposable as T,DisposableStore as R}from"../../../../base/common/lifecycle.js";import{escapeRegExpCharacters as W}from"../../../../base/common/strings.js";import{assertIsDefined as v}from"../../../../base/common/types.js";import"./parameterHints.css";import{ContentWidgetPositionPreference as x}from"../../../browser/editorBrowser.js";import{EDITOR_FONT_DEFAULTS as O,EditorOption as w}from"../../../common/config/editorOptions.js";import{ILanguageService as F}from"../../../common/languages/language.js";import{MarkdownRenderer as $}from"../../../browser/widget/markdownRenderer/browser/markdownRenderer.js";import{Context as M}from"./provideSignatureHelp.js";import*as y from"../../../../nls.js";import{IContextKeyService as _}from"../../../../platform/contextkey/common/contextkey.js";import{IOpenerService as z}from"../../../../platform/opener/common/opener.js";import{listHighlightForeground as A,registerColor as V}from"../../../../platform/theme/common/colorRegistry.js";import{registerIcon as D}from"../../../../platform/theme/common/iconRegistry.js";import{ThemeIcon as N}from"../../../../base/common/themables.js";import{StopWatch as K}from"../../../../base/common/stopwatch.js";import{ITelemetryService as j}from"../../../../platform/telemetry/common/telemetry.js";const d=r.$,B=D("parameter-hints-next",S.chevronDown,y.localize("parameterHintsNextIcon","Icon for show next parameter hint.")),U=D("parameter-hints-previous",S.chevronUp,y.localize("parameterHintsPreviousIcon","Icon for show previous parameter hint."));let g=class extends T{constructor(t,o,e,n,s,c){super();this.editor=t;this.model=o;this.telemetryService=c;this.markdownRenderer=this._register(new $({editor:t},s,n)),this.keyVisible=M.Visible.bindTo(e),this.keyMultipleSignatures=M.MultipleSignatures.bindTo(e)}static ID="editor.widget.parameterHintsWidget";markdownRenderer;renderDisposeables=this._register(new R);keyVisible;keyMultipleSignatures;domNodes;visible=!1;announcedLabel=null;allowEditorOverflow=!0;createParameterHintDOMNodes(){const t=d(".editor-widget.parameter-hints-widget"),o=r.append(t,d(".phwrapper"));o.tabIndex=-1;const e=r.append(o,d(".controls")),n=r.append(e,d(".button"+N.asCSSSelector(U))),s=r.append(e,d(".overloads")),c=r.append(e,d(".button"+N.asCSSSelector(B)));this._register(r.addDisposableListener(n,"click",m=>{r.EventHelper.stop(m),this.previous()})),this._register(r.addDisposableListener(c,"click",m=>{r.EventHelper.stop(m),this.next()}));const a=d(".body"),p=new E(a,{alwaysConsumeMouseWheel:!0});this._register(p),o.appendChild(p.getDomNode());const i=r.append(a,d(".signature")),l=r.append(a,d(".docs"));t.style.userSelect="text",this.domNodes={element:t,signature:i,overloads:s,docs:l,scrollbar:p},this.editor.addContentWidget(this),this.hide(),this._register(this.editor.onDidChangeCursorSelection(m=>{this.visible&&this.editor.layoutContentWidget(this)}));const I=()=>{if(!this.domNodes)return;const m=this.editor.getOption(w.fontInfo),h=this.domNodes.element;h.style.fontSize=`${m.fontSize}px`,h.style.lineHeight=`${m.lineHeight/m.fontSize}`,h.style.setProperty("--vscode-parameterHintsWidget-editorFontFamily",m.fontFamily),h.style.setProperty("--vscode-parameterHintsWidget-editorFontFamilyDefault",O.fontFamily)};I(),this._register(P.chain(this.editor.onDidChangeConfiguration.bind(this.editor),m=>m.filter(h=>h.hasChanged(w.fontInfo)))(I)),this._register(this.editor.onDidLayoutChange(m=>this.updateMaxHeight())),this.updateMaxHeight()}show(){this.visible||(this.domNodes||this.createParameterHintDOMNodes(),this.keyVisible.set(!0),this.visible=!0,setTimeout(()=>{this.domNodes?.element.classList.add("visible")},100),this.editor.layoutContentWidget(this))}hide(){this.renderDisposeables.clear(),this.visible&&(this.keyVisible.reset(),this.visible=!1,this.announcedLabel=null,this.domNodes?.element.classList.remove("visible"),this.editor.layoutContentWidget(this))}getPosition(){return this.visible?{position:this.editor.getPosition(),preference:[x.ABOVE,x.BELOW]}:null}render(t){if(this.renderDisposeables.clear(),!this.domNodes)return;const o=t.signatures.length>1;this.domNodes.element.classList.toggle("multiple",o),this.keyMultipleSignatures.set(o),this.domNodes.signature.innerText="",this.domNodes.docs.innerText="";const e=t.signatures[t.activeSignature];if(!e)return;const n=r.append(this.domNodes.signature,d(".code")),s=e.parameters.length>0,c=e.activeParameter??t.activeParameter;if(s)this.renderParameters(n,e,c);else{const i=r.append(n,d("span"));i.textContent=e.label}const a=e.parameters[c];if(a?.documentation){const i=d("span.documentation");if(typeof a.documentation=="string")i.textContent=a.documentation;else{const l=this.renderMarkdownDocs(a.documentation);i.appendChild(l.element)}r.append(this.domNodes.docs,d("p",{},i))}if(e.documentation!==void 0)if(typeof e.documentation=="string")r.append(this.domNodes.docs,d("p",{},e.documentation));else{const i=this.renderMarkdownDocs(e.documentation);r.append(this.domNodes.docs,i.element)}const p=this.hasDocs(e,a);if(this.domNodes.signature.classList.toggle("has-docs",p),this.domNodes.docs.classList.toggle("empty",!p),this.domNodes.overloads.textContent=String(t.activeSignature+1).padStart(t.signatures.length.toString().length,"0")+"/"+t.signatures.length,a){let i="";const l=e.parameters[c];Array.isArray(l.label)?i=e.label.substring(l.label[0],l.label[1]):i=l.label,l.documentation&&(i+=typeof l.documentation=="string"?`, ${l.documentation}`:`, ${l.documentation.value}`),e.documentation&&(i+=typeof e.documentation=="string"?`, ${e.documentation}`:`, ${e.documentation.value}`),this.announcedLabel!==i&&(L.alert(y.localize("hint","{0}, hint",i)),this.announcedLabel=i)}this.editor.layoutContentWidget(this),this.domNodes.scrollbar.scanDomNode()}renderMarkdownDocs(t){const o=new K,e=this.renderDisposeables.add(this.markdownRenderer.render(t,{asyncRenderCallback:()=>{this.domNodes?.scrollbar.scanDomNode()}}));e.element.classList.add("markdown-docs");const n=o.elapsed();return n>300&&this.telemetryService.publicLog2("parameterHints.parseMarkdown",{renderDuration:n}),e}hasDocs(t,o){return!!(o&&typeof o.documentation=="string"&&v(o.documentation).length>0||o&&typeof o.documentation=="object"&&v(o.documentation).value.length>0||t.documentation&&typeof t.documentation=="string"&&v(t.documentation).length>0||t.documentation&&typeof t.documentation=="object"&&v(t.documentation.value).length>0)}renderParameters(t,o,e){const[n,s]=this.getParameterLabelOffsets(o,e),c=document.createElement("span");c.textContent=o.label.substring(0,n);const a=document.createElement("span");a.textContent=o.label.substring(n,s),a.className="parameter active";const p=document.createElement("span");p.textContent=o.label.substring(s),r.append(t,c,a,p)}getParameterLabelOffsets(t,o){const e=t.parameters[o];if(e){if(Array.isArray(e.label))return e.label;if(e.label.length){const n=new RegExp(`(\\W|^)${W(e.label)}(?=\\W|$)`,"g");n.test(t.label);const s=n.lastIndex-e.label.length;return s>=0?[s,n.lastIndex]:[0,0]}else return[0,0]}else return[0,0]}next(){this.editor.focus(),this.model.next()}previous(){this.editor.focus(),this.model.previous()}getDomNode(){return this.domNodes||this.createParameterHintDOMNodes(),this.domNodes.element}getId(){return g.ID}updateMaxHeight(){if(!this.domNodes)return;const o=`${Math.max(this.editor.getLayoutInfo().height/4,250)}px`;this.domNodes.element.style.maxHeight=o;const e=this.domNodes.element.getElementsByClassName("phwrapper");e.length&&(e[0].style.maxHeight=o)}};g=C([f(2,_),f(3,z),f(4,F),f(5,j)],g),V("editorHoverWidget.highlightForeground",A,y.localize("editorHoverWidgetHighlightForeground","Foreground color of the active item in the parameter hint."));export{g as ParameterHintsWidget};
