import"vs/css!./linesDecorations";import"../../../../../vs/editor/browser/view/renderingContext.js";import{DecorationToRender as v,DedupOverlay as g}from"../../../../../vs/editor/browser/viewParts/glyphMargin/glyphMargin.js";import{EditorOption as h}from"../../../../../vs/editor/common/config/editorOptions.js";import"../../../../../vs/editor/common/viewEvents.js";import"../../../../../vs/editor/common/viewModel/viewContext.js";class R extends g{_context;_decorationsLeft;_decorationsWidth;_renderResult;constructor(e){super(),this._context=e;const t=this._context.configuration.options.get(h.layoutInfo);this._decorationsLeft=t.decorationsLeft,this._decorationsWidth=t.decorationsWidth,this._renderResult=null,this._context.addEventHandler(this)}dispose(){this._context.removeEventHandler(this),this._renderResult=null,super.dispose()}onConfigurationChanged(e){const t=this._context.configuration.options.get(h.layoutInfo);return this._decorationsLeft=t.decorationsLeft,this._decorationsWidth=t.decorationsWidth,!0}onDecorationsChanged(e){return!0}onFlushed(e){return!0}onLinesChanged(e){return!0}onLinesDeleted(e){return!0}onLinesInserted(e){return!0}onScrollChanged(e){return e.scrollTopChanged}onZonesChanged(e){return!0}_getDecorations(e){const o=e.getDecorationsInViewport(),t=[];let d=0;for(let r=0,l=o.length;r<l;r++){const n=o[r],s=n.options.linesDecorationsClassName,i=n.options.zIndex;s&&(t[d++]=new v(n.range.startLineNumber,n.range.endLineNumber,s,n.options.linesDecorationsTooltip??null,i));const a=n.options.firstLineDecorationClassName;a&&(t[d++]=new v(n.range.startLineNumber,n.range.startLineNumber,a,n.options.linesDecorationsTooltip??null,i))}return t}prepareRender(e){const o=e.visibleRange.startLineNumber,t=e.visibleRange.endLineNumber,d=this._render(o,t,this._getDecorations(e)),r=this._decorationsLeft.toString(),l=this._decorationsWidth.toString(),n='" style="left:'+r+"px;width:"+l+'px;"></div>',s=[];for(let i=o;i<=t;i++){const a=i-o,b=d[a].getDecorations();let p="";for(const c of b){let u='<div class="cldr '+c.className;c.tooltip!==null&&(u+='" title="'+c.tooltip),u+=n,p+=u}s[a]=p}this._renderResult=s}render(e,o){return this._renderResult?this._renderResult[o-e]:""}}export{R as LinesDecorationsOverlay};
