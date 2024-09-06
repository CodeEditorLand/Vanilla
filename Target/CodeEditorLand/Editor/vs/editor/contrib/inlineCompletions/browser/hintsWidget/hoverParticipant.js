var y=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var I=(s,r,n,e)=>{for(var o=e>1?void 0:e?w(r,n):r,t=s.length-1,i;t>=0;t--)(i=s[t])&&(o=(e?i(r,n,o):i(o))||o);return e&&o&&y(r,n,o),o},l=(s,r)=>(n,e)=>r(n,e,s);import*as g from"../../../../../../vs/base/browser/dom.js";import{MarkdownString as b}from"../../../../../../vs/base/common/htmlContent.js";import{DisposableStore as C}from"../../../../../../vs/base/common/lifecycle.js";import{autorun as T,constObservable as E}from"../../../../../../vs/base/common/observable.js";import{MouseTargetType as h}from"../../../../../../vs/editor/browser/editorBrowser.js";import{MarkdownRenderer as _}from"../../../../../../vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";import{EditorOption as H}from"../../../../../../vs/editor/common/config/editorOptions.js";import{Range as A}from"../../../../../../vs/editor/common/core/range.js";import{ILanguageService as R}from"../../../../../../vs/editor/common/languages/language.js";import"../../../../../../vs/editor/common/model.js";import{HoverAnchorType as x,HoverForeignElementAnchor as u,RenderedHoverParts as P}from"../../../../../../vs/editor/contrib/hover/browser/hoverTypes.js";import{InlineCompletionsController as S}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js";import{InlineSuggestionHintsContentWidget as O}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.js";import*as f from"../../../../../../vs/nls.js";import{IAccessibilityService as M}from"../../../../../../vs/platform/accessibility/common/accessibility.js";import{IInstantiationService as N}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{IOpenerService as D}from"../../../../../../vs/platform/opener/common/opener.js";import{ITelemetryService as F}from"../../../../../../vs/platform/telemetry/common/telemetry.js";class k{constructor(r,n,e){this.owner=r;this.range=n;this.controller=e}isValidForHoverAnchor(r){return r.type===x.Range&&this.range.startColumn<=r.range.startColumn&&this.range.endColumn>=r.range.endColumn}}let p=class{constructor(r,n,e,o,t,i){this._editor=r;this._languageService=n;this._openerService=e;this.accessibilityService=o;this._instantiationService=t;this._telemetryService=i}hoverOrdinal=4;suggestHoverAnchor(r){const n=S.get(this._editor);if(!n)return null;const e=r.target;if(e.type===h.CONTENT_VIEW_ZONE){const o=e.detail;if(n.shouldShowHoverAtViewZone(o.viewZoneId))return new u(1e3,this,A.fromPositions(this._editor.getModel().validatePosition(o.positionBefore||o.position)),r.event.posx,r.event.posy,!1)}return e.type===h.CONTENT_EMPTY&&n.shouldShowHoverAt(e.range)?new u(1e3,this,e.range,r.event.posx,r.event.posy,!1):e.type===h.CONTENT_TEXT&&e.detail.mightBeForeignElement&&n.shouldShowHoverAt(e.range)?new u(1e3,this,e.range,r.event.posx,r.event.posy,!1):null}computeSync(r,n){if(this._editor.getOption(H.inlineSuggest).showToolbar!=="onHover")return[];const e=S.get(this._editor);return e&&e.shouldShowHoverAt(r.range)?[new k(this,r.range,e)]:[]}renderHoverParts(r,n){const e=new C,o=n[0];this._telemetryService.publicLog2("inlineCompletionHover.shown"),this.accessibilityService.isScreenReaderOptimized()&&!this._editor.getOption(H.screenReaderAnnounceInlineSuggestion)&&e.add(this.renderScreenReaderText(r,o));const t=o.controller.model.get(),i=this._instantiationService.createInstance(O,this._editor,!1,E(null),t.selectedInlineCompletionIndex,t.inlineCompletionsCount,t.activeCommands),a=i.getDomNode();r.fragment.appendChild(a),t.triggerExplicitly(),e.add(i);const v={hoverPart:o,hoverElement:a,dispose(){e.dispose()}};return new P([v])}getAccessibleContent(r){return f.localize("hoverAccessibilityStatusBar","There are inline completions here")}renderScreenReaderText(r,n){const e=new C,o=g.$,t=o("div.hover-row.markdown-hover"),i=g.append(t,o("div.hover-contents",{"aria-live":"assertive"})),a=e.add(new _({editor:this._editor},this._languageService,this._openerService)),v=c=>{e.add(a.onDidRenderAsync(()=>{i.className="hover-contents code-hover-contents",r.onContentsChanged()}));const d=f.localize("inlineSuggestionFollows","Suggestion:"),m=e.add(a.render(new b().appendText(d).appendCodeblock("text",c)));i.replaceChildren(m.element)};return e.add(T(c=>{const d=n.controller.model.read(c)?.primaryGhostText.read(c);if(d){const m=this._editor.getModel().getLineContent(d.lineNumber);v(d.renderForScreenReader(m))}else g.reset(i)})),r.fragment.appendChild(t),e}};p=I([l(1,R),l(2,D),l(3,M),l(4,N),l(5,F)],p);export{k as InlineCompletionsHover,p as InlineCompletionsHoverParticipant};
