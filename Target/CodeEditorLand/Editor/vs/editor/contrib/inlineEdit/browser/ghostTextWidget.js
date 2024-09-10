var M=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var I=(p,d,i,e)=>{for(var t=e>1?void 0:e?y(d,i):d,n=p.length-1,r;n>=0;n--)(r=p[n])&&(t=(e?r(d,i,t):r(t))||t);return e&&t&&M(d,i,t),t},T=(p,d)=>(i,e)=>d(i,e,p);import{Disposable as S,toDisposable as w}from"../../../../base/common/lifecycle.js";import{derived as L,observableFromEvent as E,observableValue as O}from"../../../../base/common/observable.js";import"./inlineEdit.css";import{Position as P}from"../../../common/core/position.js";import{Range as v}from"../../../common/core/range.js";import{ILanguageService as W}from"../../../common/languages/language.js";import{InjectedTextCursorStops as _}from"../../../common/model.js";import{LineDecoration as N}from"../../../common/viewLayout/lineDecorations.js";import{InlineDecorationType as D}from"../../../common/viewModel.js";import{AdditionalLinesWidget as k}from"../../inlineCompletions/browser/view/ghostTextView.js";import{ColumnRange as A,applyObservableDecorations as B}from"../../inlineCompletions/browser/utils.js";import{diffDeleteDecoration as F,diffLineDeleteDecorationBackgroundWithIndicator as V}from"../../../browser/widget/diffEditor/registrations.contribution.js";import{LineTokens as Z}from"../../../common/tokens/lineTokens.js";const x="inline-edit";let h=class extends S{constructor(i,e,t){super();this.editor=i;this.model=e;this.languageService=t;this._register(w(()=>{this.isDisposed.set(!0,void 0)})),this._register(B(this.editor,this.decorations))}isDisposed=O(this,!1);currentTextModel=E(this,this.editor.onDidChangeModel,()=>this.editor.getModel());uiState=L(this,i=>{if(this.isDisposed.read(i))return;const e=this.currentTextModel.read(i);if(e!==this.model.targetTextModel.read(i))return;const t=this.model.ghostText.read(i);if(!t)return;let n=this.model.range?.read(i);n&&n.startLineNumber===n.endLineNumber&&n.startColumn===n.endColumn&&(n=void 0);const r=(n?n.startLineNumber===n.endLineNumber:!0)&&t.parts.length===1&&t.parts[0].lines.length===1,g=t.parts.length===1&&t.parts[0].lines.every(o=>o.length===0),a=[],l=[];function c(o,s){if(l.length>0){const u=l[l.length-1];s&&u.decorations.push(new N(u.content.length+1,u.content.length+1+o[0].length,s,D.Regular)),u.content+=o[0],o=o.slice(1)}for(const u of o)l.push({content:u,decorations:s?[new N(1,u.length+1,s,D.Regular)]:[]})}const m=e.getLineContent(t.lineNumber);let f,b=0;if(!g&&(r||!n)){for(const o of t.parts){let s=o.lines;n&&!r&&(c(s,x),s=[]),f===void 0?(a.push({column:o.column,text:s[0],preview:o.preview}),s=s.slice(1)):c([m.substring(b,o.column-1)],void 0),s.length>0&&(c(s,x),f===void 0&&o.column<=m.length&&(f=o.column)),b=o.column-1}f!==void 0&&c([m.substring(b)],void 0)}const C=f!==void 0?new A(f,m.length+1):void 0,R=r||!n?t.lineNumber:n.endLineNumber-1;return{inlineTexts:a,additionalLines:l,hiddenRange:C,lineNumber:R,additionalReservedLineCount:this.model.minReservedLineCount.read(i),targetTextModel:e,range:n,isSingleLine:r,isPureRemove:g}});decorations=L(this,i=>{const e=this.uiState.read(i);if(!e)return[];const t=[];if(e.hiddenRange&&t.push({range:e.hiddenRange.toRange(e.lineNumber),options:{inlineClassName:"inline-edit-hidden",description:"inline-edit-hidden"}}),e.range){const n=[];if(e.isSingleLine)n.push(e.range);else if(!e.isPureRemove){const r=e.range.endLineNumber-e.range.startLineNumber;for(let g=0;g<r;g++){const a=e.range.startLineNumber+g,l=e.targetTextModel.getLineFirstNonWhitespaceColumn(a),c=e.targetTextModel.getLineLastNonWhitespaceColumn(a),m=new v(a,l,a,c);n.push(m)}}for(const r of n)t.push({range:r,options:F})}if(e.range&&!e.isSingleLine&&e.isPureRemove){const n=new v(e.range.startLineNumber,1,e.range.endLineNumber-1,1);t.push({range:n,options:V})}for(const n of e.inlineTexts)t.push({range:v.fromPositions(new P(e.lineNumber,n.column)),options:{description:x,after:{content:n.text,inlineClassName:n.preview?"inline-edit-decoration-preview":"inline-edit-decoration",cursorStops:_.Left},showIfCollapsed:!0}});return t});additionalLinesWidget=this._register(new k(this.editor,L(i=>{const e=this.uiState.read(i);return e&&!e.isPureRemove&&(e.isSingleLine||!e.range)?{lineNumber:e.lineNumber,additionalLines:e.additionalLines.map(t=>({content:Z.createEmpty(t.content,this.languageService.languageIdCodec),decorations:t.decorations})),minReservedLineCount:e.additionalReservedLineCount,targetTextModel:e.targetTextModel}:void 0})));ownsViewZone(i){return this.additionalLinesWidget.viewZoneId===i}};h=I([T(2,W)],h);export{h as GhostTextWidget,x as INLINE_EDIT_DESCRIPTION};
