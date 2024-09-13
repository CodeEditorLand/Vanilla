import"./lineNumbers.css";import*as _ from"../../../../base/common/platform.js";import{registerThemingParticipant as L}from"../../../../platform/theme/common/themeService.js";import{EditorOption as a,RenderLineNumbersType as l}from"../../../common/config/editorOptions.js";import{editorDimmedLineNumber as C,editorLineNumbers as w}from"../../../common/core/editorColorRegistry.js";import{Position as c}from"../../../common/core/position.js";import{Range as E}from"../../../common/core/range.js";import{DynamicViewOverlay as x}from"../../view/dynamicViewOverlay.js";class g extends x{static CLASS_NAME="line-numbers";_context;_lineHeight;_renderLineNumbers;_renderCustomLineNumbers;_renderFinalNewline;_lineNumbersLeft;_lineNumbersWidth;_lastCursorModelPosition;_renderResult;_activeLineNumber;constructor(e){super(),this._context=e,this._readConfig(),this._lastCursorModelPosition=new c(1,1),this._renderResult=null,this._activeLineNumber=1,this._context.addEventHandler(this)}_readConfig(){const e=this._context.configuration.options;this._lineHeight=e.get(a.lineHeight);const i=e.get(a.lineNumbers);this._renderLineNumbers=i.renderType,this._renderCustomLineNumbers=i.renderFn,this._renderFinalNewline=e.get(a.renderFinalNewline);const n=e.get(a.layoutInfo);this._lineNumbersLeft=n.lineNumbersLeft,this._lineNumbersWidth=n.lineNumbersWidth}dispose(){this._context.removeEventHandler(this),this._renderResult=null,super.dispose()}onConfigurationChanged(e){return this._readConfig(),!0}onCursorStateChanged(e){const i=e.selections[0].getPosition();this._lastCursorModelPosition=this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(i);let n=!1;return this._activeLineNumber!==i.lineNumber&&(this._activeLineNumber=i.lineNumber,n=!0),(this._renderLineNumbers===l.Relative||this._renderLineNumbers===l.Interval)&&(n=!0),n}onFlushed(e){return!0}onLinesChanged(e){return!0}onLinesDeleted(e){return!0}onLinesInserted(e){return!0}onScrollChanged(e){return e.scrollTopChanged}onZonesChanged(e){return!0}onDecorationsChanged(e){return e.affectsLineNumber}_getLineRenderLineNumber(e){const i=this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new c(e,1));if(i.column!==1)return"";const n=i.lineNumber;if(this._renderCustomLineNumbers)return this._renderCustomLineNumbers(n);if(this._renderLineNumbers===l.Relative){const t=Math.abs(this._lastCursorModelPosition.lineNumber-n);return t===0?'<span class="relative-current-line-number">'+n+"</span>":String(t)}if(this._renderLineNumbers===l.Interval){if(this._lastCursorModelPosition.lineNumber===n||n%10===0)return String(n);const t=this._context.viewModel.getLineCount();return n===t?String(n):""}return String(n)}prepareRender(e){if(this._renderLineNumbers===l.Off){this._renderResult=null;return}const i=_.isLinux?this._lineHeight%2===0?" lh-even":" lh-odd":"",n=e.visibleRange.startLineNumber,t=e.visibleRange.endLineNumber,o=this._context.viewModel.getDecorationsInViewport(e.visibleRange).filter(r=>!!r.options.lineNumberClassName);o.sort((r,d)=>E.compareRangesUsingEnds(r.range,d.range));let u=0;const p=this._context.viewModel.getLineCount(),m=[];for(let r=n;r<=t;r++){const d=r-n;let b=this._getLineRenderLineNumber(r),s="";for(;u<o.length&&o[u].range.endLineNumber<r;)u++;for(let v=u;v<o.length;v++){const{range:N,options:f}=o[v];N.startLineNumber<=r&&(s+=" "+f.lineNumberClassName)}if(!b&&!s){m[d]="";continue}r===p&&this._context.viewModel.getLineLength(r)===0&&(this._renderFinalNewline==="off"&&(b=""),this._renderFinalNewline==="dimmed"&&(s+=" dimmed-line-number")),r===this._activeLineNumber&&(s+=" active-line-number"),m[d]=`<div class="${g.CLASS_NAME}${i}${s}" style="left:${this._lineNumbersLeft}px;width:${this._lineNumbersWidth}px;">${b}</div>`}this._renderResult=m}render(e,i){if(!this._renderResult)return"";const n=i-e;return n<0||n>=this._renderResult.length?"":this._renderResult[n]}}L((h,e)=>{const i=h.getColor(w),n=h.getColor(C);n?e.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${n}; }`):i&&e.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${i.transparent(.4)}; }`)});export{g as LineNumbersOverlay};
