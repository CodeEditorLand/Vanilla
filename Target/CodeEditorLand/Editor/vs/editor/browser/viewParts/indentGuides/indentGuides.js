import"vs/css!./indentGuides";import{ArrayQueue as A}from"../../../../../vs/base/common/arrays.js";import"../../../../../vs/base/common/color.js";import{isDefined as I}from"../../../../../vs/base/common/types.js";import{DynamicViewOverlay as B}from"../../../../../vs/editor/browser/view/dynamicViewOverlay.js";import"../../../../../vs/editor/browser/view/renderingContext.js";import{EditorOption as C}from"../../../../../vs/editor/common/config/editorOptions.js";import{editorActiveIndentGuide1 as x,editorActiveIndentGuide2 as L,editorActiveIndentGuide3 as R,editorActiveIndentGuide4 as E,editorActiveIndentGuide5 as O,editorActiveIndentGuide6 as y,editorBracketHighlightingForeground1 as z,editorBracketHighlightingForeground2 as V,editorBracketHighlightingForeground3 as W,editorBracketHighlightingForeground4 as $,editorBracketHighlightingForeground5 as H,editorBracketHighlightingForeground6 as F,editorBracketPairGuideActiveBackground1 as N,editorBracketPairGuideActiveBackground2 as D,editorBracketPairGuideActiveBackground3 as M,editorBracketPairGuideActiveBackground4 as T,editorBracketPairGuideActiveBackground5 as S,editorBracketPairGuideActiveBackground6 as Q,editorBracketPairGuideBackground1 as Z,editorBracketPairGuideBackground2 as q,editorBracketPairGuideBackground3 as U,editorBracketPairGuideBackground4 as j,editorBracketPairGuideBackground5 as J,editorBracketPairGuideBackground6 as K,editorIndentGuide1 as X,editorIndentGuide2 as Y,editorIndentGuide3 as ee,editorIndentGuide4 as te,editorIndentGuide5 as ie,editorIndentGuide6 as ne}from"../../../../../vs/editor/common/core/editorColorRegistry.js";import{Position as G}from"../../../../../vs/editor/common/core/position.js";import{BracketPairGuidesClassNames as oe}from"../../../../../vs/editor/common/model/guidesTextModelPart.js";import{HorizontalGuidesState as w,IndentGuide as re}from"../../../../../vs/editor/common/textModelGuides.js";import"../../../../../vs/editor/common/viewEvents.js";import"../../../../../vs/editor/common/viewModel/viewContext.js";import{registerThemingParticipant as de}from"../../../../../vs/platform/theme/common/themeService.js";class Pe extends B{_context;_primaryPosition;_spaceWidth;_renderResult;_maxIndentLeft;_bracketPairGuideOptions;constructor(e){super(),this._context=e,this._primaryPosition=null;const n=this._context.configuration.options,t=n.get(C.wrappingInfo),d=n.get(C.fontInfo);this._spaceWidth=d.spaceWidth,this._maxIndentLeft=t.wrappingColumn===-1?-1:t.wrappingColumn*d.typicalHalfwidthCharacterWidth,this._bracketPairGuideOptions=n.get(C.guides),this._renderResult=null,this._context.addEventHandler(this)}dispose(){this._context.removeEventHandler(this),this._renderResult=null,super.dispose()}onConfigurationChanged(e){const n=this._context.configuration.options,t=n.get(C.wrappingInfo),d=n.get(C.fontInfo);return this._spaceWidth=d.spaceWidth,this._maxIndentLeft=t.wrappingColumn===-1?-1:t.wrappingColumn*d.typicalHalfwidthCharacterWidth,this._bracketPairGuideOptions=n.get(C.guides),!0}onCursorStateChanged(e){const t=e.selections[0].getPosition();return this._primaryPosition?.equals(t)?!1:(this._primaryPosition=t,!0)}onDecorationsChanged(e){return!0}onFlushed(e){return!0}onLinesChanged(e){return!0}onLinesDeleted(e){return!0}onLinesInserted(e){return!0}onScrollChanged(e){return e.scrollTopChanged}onZonesChanged(e){return!0}onLanguageConfigurationChanged(e){return!0}prepareRender(e){if(!this._bracketPairGuideOptions.indentation&&this._bracketPairGuideOptions.bracketPairs===!1){this._renderResult=null;return}const n=e.visibleRange.startLineNumber,t=e.visibleRange.endLineNumber,d=e.scrollWidth,g=this._primaryPosition,v=this.getGuidesByLine(n,Math.min(t+1,this._context.viewModel.getLineCount()),g),i=[];for(let o=n;o<=t;o++){const h=o-n,l=v[h];let r="";const u=e.visibleRangeForPosition(new G(o,1))?.left??0;for(const a of l){const c=a.column===-1?u+(a.visibleColumn-1)*this._spaceWidth:e.visibleRangeForPosition(new G(o,a.column)).left;if(c>d||this._maxIndentLeft>0&&c>this._maxIndentLeft)break;const m=a.horizontalLine?a.horizontalLine.top?"horizontal-top":"horizontal-bottom":"vertical",p=a.horizontalLine?(e.visibleRangeForPosition(new G(o,a.horizontalLine.endColumn))?.left??c+this._spaceWidth)-c:this._spaceWidth;r+=`<div class="core-guide ${a.className} ${m}" style="left:${c}px;width:${p}px"></div>`}i[h]=r}this._renderResult=i}getGuidesByLine(e,n,t){const d=this._bracketPairGuideOptions.bracketPairs!==!1?this._context.viewModel.getBracketGuidesInRangeByLine(e,n,t,{highlightActive:this._bracketPairGuideOptions.highlightActiveBracketPair,horizontalGuides:this._bracketPairGuideOptions.bracketPairsHorizontal===!0?w.Enabled:this._bracketPairGuideOptions.bracketPairsHorizontal==="active"?w.EnabledForActive:w.Disabled,includeInactive:this._bracketPairGuideOptions.bracketPairs===!0}):null,g=this._bracketPairGuideOptions.indentation?this._context.viewModel.getLinesIndentGuides(e,n):null;let v=0,i=0,o=0;if(this._bracketPairGuideOptions.highlightActiveIndentation!==!1&&t){const r=this._context.viewModel.getActiveIndentGuide(t.lineNumber,e,n);v=r.startLineNumber,i=r.endLineNumber,o=r.indent}const{indentSize:h}=this._context.viewModel.model.getOptions(),l=[];for(let r=e;r<=n;r++){const u=new Array;l.push(u);const a=d?d[r-e]:[],c=new A(a),m=g?g[r-e]:0;for(let p=1;p<=m;p++){const b=(p-1)*h+1,_=(this._bracketPairGuideOptions.highlightActiveIndentation==="always"||a.length===0)&&v<=r&&r<=i&&p===o;u.push(...c.takeWhile(P=>P.visibleColumn<b)||[]);const k=c.peek();(!k||k.visibleColumn!==b||k.horizontalLine)&&u.push(new re(b,-1,`core-guide-indent lvl-${(p-1)%30}`+(_?" indent-active":""),null,-1,-1))}u.push(...c.takeWhile(p=>!0)||[])}return l}render(e,n){if(!this._renderResult)return"";const t=n-e;return t<0||t>=this._renderResult.length?"":this._renderResult[t]}}function f(s){if(!(s&&s.isTransparent()))return s}de((s,e)=>{const n=[{bracketColor:z,guideColor:Z,guideColorActive:N},{bracketColor:V,guideColor:q,guideColorActive:D},{bracketColor:W,guideColor:U,guideColorActive:M},{bracketColor:$,guideColor:j,guideColorActive:T},{bracketColor:H,guideColor:J,guideColorActive:S},{bracketColor:F,guideColor:K,guideColorActive:Q}],t=new oe,d=[{indentColor:X,indentColorActive:x},{indentColor:Y,indentColorActive:L},{indentColor:ee,indentColorActive:R},{indentColor:te,indentColorActive:E},{indentColor:ie,indentColorActive:O},{indentColor:ne,indentColorActive:y}],g=n.map(i=>{const o=s.getColor(i.bracketColor),h=s.getColor(i.guideColor),l=s.getColor(i.guideColorActive),r=f(f(h)??o?.transparent(.3)),u=f(f(l)??o);if(!(!r||!u))return{guideColor:r,guideColorActive:u}}).filter(I),v=d.map(i=>{const o=s.getColor(i.indentColor),h=s.getColor(i.indentColorActive),l=f(o),r=f(h);if(!(!l||!r))return{indentColor:l,indentColorActive:r}}).filter(I);if(g.length>0){for(let i=0;i<30;i++){const o=g[i%g.length];e.addRule(`.monaco-editor .${t.getInlineClassNameOfLevel(i).replace(/ /g,".")} { --guide-color: ${o.guideColor}; --guide-color-active: ${o.guideColorActive}; }`)}e.addRule(".monaco-editor .vertical { box-shadow: 1px 0 0 0 var(--guide-color) inset; }"),e.addRule(".monaco-editor .horizontal-top { border-top: 1px solid var(--guide-color); }"),e.addRule(".monaco-editor .horizontal-bottom { border-bottom: 1px solid var(--guide-color); }"),e.addRule(`.monaco-editor .vertical.${t.activeClassName} { box-shadow: 1px 0 0 0 var(--guide-color-active) inset; }`),e.addRule(`.monaco-editor .horizontal-top.${t.activeClassName} { border-top: 1px solid var(--guide-color-active); }`),e.addRule(`.monaco-editor .horizontal-bottom.${t.activeClassName} { border-bottom: 1px solid var(--guide-color-active); }`)}if(v.length>0){for(let i=0;i<30;i++){const o=v[i%v.length];e.addRule(`.monaco-editor .lines-content .core-guide-indent.lvl-${i} { --indent-color: ${o.indentColor}; --indent-color-active: ${o.indentColorActive}; }`)}e.addRule(".monaco-editor .lines-content .core-guide-indent { box-shadow: 1px 0 0 0 var(--indent-color) inset; }"),e.addRule(".monaco-editor .lines-content .core-guide-indent.indent-active { box-shadow: 1px 0 0 0 var(--indent-color-active) inset; }")}});export{Pe as IndentGuidesOverlay};
