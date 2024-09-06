var _=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var C=(u,c,t,e)=>{for(var n=e>1?void 0:e?N(c,t):c,i=u.length-1,r;i>=0;i--)(r=u[i])&&(n=(e?r(c,t,n):r(n))||n);return e&&n&&_(c,t,n),n},x=(u,c)=>(t,e)=>c(t,e,u);import{createTrustedTypesPolicy as W}from"../../../../../../vs/base/browser/trustedTypes.js";import{Event as A}from"../../../../../../vs/base/common/event.js";import{Disposable as T,toDisposable as H}from"../../../../../../vs/base/common/lifecycle.js";import{autorun as F,derived as L,observableFromEvent as G,observableSignalFromEvent as P,observableValue as z}from"../../../../../../vs/base/common/observable.js";import*as w from"../../../../../../vs/base/common/strings.js";import"vs/css!./ghostTextView";import{applyFontInfo as B}from"../../../../../../vs/editor/browser/config/domFontInfo.js";import"../../../../../../vs/editor/browser/editorBrowser.js";import{EditorFontLigatures as k,EditorOption as s}from"../../../../../../vs/editor/common/config/editorOptions.js";import{Position as V}from"../../../../../../vs/editor/common/core/position.js";import{Range as j}from"../../../../../../vs/editor/common/core/range.js";import{StringBuilder as U}from"../../../../../../vs/editor/common/core/stringBuilder.js";import"../../../../../../vs/editor/common/languages.js";import{ILanguageService as X}from"../../../../../../vs/editor/common/languages/language.js";import{InjectedTextCursorStops as q,PositionAffinity as J}from"../../../../../../vs/editor/common/model.js";import{LineTokens as K}from"../../../../../../vs/editor/common/tokens/lineTokens.js";import{LineDecoration as R}from"../../../../../../vs/editor/common/viewLayout/lineDecorations.js";import{RenderLineInput as Q,renderViewLine as Y}from"../../../../../../vs/editor/common/viewLayout/viewLineRenderer.js";import{InlineDecorationType as M}from"../../../../../../vs/editor/common/viewModel.js";import{GhostTextReplacement as $}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/model/ghostText.js";import{applyObservableDecorations as ee,ColumnRange as te}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/utils.js";const S="ghost-text";let I=class extends T{constructor(t,e,n){super();this.editor=t;this.model=e;this.languageService=n;this._register(H(()=>{this.isDisposed.set(!0,void 0)})),this._register(ee(this.editor,this.decorations))}isDisposed=z(this,!1);currentTextModel=G(this,this.editor.onDidChangeModel,()=>this.editor.getModel());uiState=L(this,t=>{if(this.isDisposed.read(t))return;const e=this.currentTextModel.read(t);if(e!==this.model.targetTextModel.read(t))return;const n=this.model.ghostText.read(t);if(!n)return;const i=n instanceof $?n.columnRange:void 0,r=[],p=[];function m(o,a){if(p.length>0){const l=p[p.length-1];a&&l.decorations.push(new R(l.content.length+1,l.content.length+1+o[0].length,a,M.Regular)),l.content+=o[0],o=o.slice(1)}for(const l of o)p.push({content:l,decorations:a?[new R(1,l.length+1,a,M.Regular)]:[]})}const h=e.getLineContent(n.lineNumber);let d,f=0;for(const o of n.parts){let a=o.lines;d===void 0?(r.push({column:o.column,text:a[0],preview:o.preview}),a=a.slice(1)):m([h.substring(f,o.column-1)],void 0),a.length>0&&(m(a,S),d===void 0&&o.column<=h.length&&(d=o.column)),f=o.column-1}d!==void 0&&m([h.substring(f)],void 0);const g=d!==void 0?new te(d,h.length+1):void 0;return{replacedRange:i,inlineTexts:r,additionalLines:p,hiddenRange:g,lineNumber:n.lineNumber,additionalReservedLineCount:this.model.minReservedLineCount.read(t),targetTextModel:e}});decorations=L(this,t=>{const e=this.uiState.read(t);if(!e)return[];const n=[];e.replacedRange&&n.push({range:e.replacedRange.toRange(e.lineNumber),options:{inlineClassName:"inline-completion-text-to-replace",description:"GhostTextReplacement"}}),e.hiddenRange&&n.push({range:e.hiddenRange.toRange(e.lineNumber),options:{inlineClassName:"ghost-text-hidden",description:"ghost-text-hidden"}});for(const i of e.inlineTexts)n.push({range:j.fromPositions(new V(e.lineNumber,i.column)),options:{description:S,after:{content:i.text,inlineClassName:i.preview?"ghost-text-decoration-preview":"ghost-text-decoration",cursorStops:q.Left},showIfCollapsed:!0}});return n});additionalLinesWidget=this._register(new ne(this.editor,this.languageService.languageIdCodec,L(t=>{const e=this.uiState.read(t);return e?{lineNumber:e.lineNumber,additionalLines:e.additionalLines,minReservedLineCount:e.additionalReservedLineCount,targetTextModel:e.targetTextModel}:void 0})));ownsViewZone(t){return this.additionalLinesWidget.viewZoneId===t}};I=C([x(2,X)],I);class ne extends T{constructor(t,e,n){super();this.editor=t;this.languageIdCodec=e;this.lines=n;this._register(F(i=>{const r=this.lines.read(i);this.editorOptionsChanged.read(i),r?this.updateLines(r.lineNumber,r.additionalLines,r.minReservedLineCount):this.clear()}))}_viewZoneId=void 0;get viewZoneId(){return this._viewZoneId}editorOptionsChanged=P("editorOptionChanged",A.filter(this.editor.onDidChangeConfiguration,t=>t.hasChanged(s.disableMonospaceOptimizations)||t.hasChanged(s.stopRenderingLineAfter)||t.hasChanged(s.renderWhitespace)||t.hasChanged(s.renderControlCharacters)||t.hasChanged(s.fontLigatures)||t.hasChanged(s.fontInfo)||t.hasChanged(s.lineHeight)));dispose(){super.dispose(),this.clear()}clear(){this.editor.changeViewZones(t=>{this._viewZoneId&&(t.removeZone(this._viewZoneId),this._viewZoneId=void 0)})}updateLines(t,e,n){const i=this.editor.getModel();if(!i)return;const{tabSize:r}=i.getOptions();this.editor.changeViewZones(p=>{this._viewZoneId&&(p.removeZone(this._viewZoneId),this._viewZoneId=void 0);const m=Math.max(e.length,n);if(m>0){const h=document.createElement("div");ie(h,r,e,this.editor.getOptions(),this.languageIdCodec),this._viewZoneId=p.addZone({afterLineNumber:t,heightInLines:m,domNode:h,afterColumnAffinity:J.Right})}})}}function ie(u,c,t,e,n){const i=e.get(s.disableMonospaceOptimizations),r=e.get(s.stopRenderingLineAfter),p="none",m=e.get(s.renderControlCharacters),h=e.get(s.fontLigatures),d=e.get(s.fontInfo),f=e.get(s.lineHeight),g=new U(1e4);g.appendString('<div class="suggest-preview-text">');for(let l=0,D=t.length;l<D;l++){const b=t[l],v=b.content;g.appendString('<div class="view-line'),g.appendString('" style="top:'),g.appendString(String(l*f)),g.appendString('px;width:1000000px;">');const O=w.isBasicASCII(v),Z=w.containsRTL(v),E=K.createEmpty(v,n);Y(new Q(d.isMonospace&&!i,d.canUseHalfwidthRightwardsArrow,v,!1,O,Z,0,E,b.decorations,c,0,d.spaceWidth,d.middotWidth,d.wsmiddotWidth,r,p,m,h!==k.OFF,null),g),g.appendString("</div>")}g.appendString("</div>"),B(u,d);const o=g.build(),a=y?y.createHTML(o):o;u.innerHTML=a}const y=W("editorGhostText",{createHTML:u=>u});export{ne as AdditionalLinesWidget,S as GHOST_TEXT_DESCRIPTION,I as GhostTextView,y as ttPolicy};
