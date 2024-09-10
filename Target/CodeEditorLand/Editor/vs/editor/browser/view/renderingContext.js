import"../../common/core/position.js";import"../../common/core/range.js";import"../../common/viewLayout/viewLinesViewportData.js";import"../../common/viewModel.js";class s{_restrictedRenderingContextBrand=void 0;viewportData;scrollWidth;scrollHeight;visibleRange;bigNumbersDelta;scrollTop;scrollLeft;viewportWidth;viewportHeight;_viewLayout;constructor(e,i){this._viewLayout=e,this.viewportData=i,this.scrollWidth=this._viewLayout.getScrollWidth(),this.scrollHeight=this._viewLayout.getScrollHeight(),this.visibleRange=this.viewportData.visibleRange,this.bigNumbersDelta=this.viewportData.bigNumbersDelta;const t=this._viewLayout.getCurrentViewport();this.scrollTop=t.top,this.scrollLeft=t.left,this.viewportWidth=t.width,this.viewportHeight=t.height}getScrolledTopFromAbsoluteTop(e){return e-this.scrollTop}getVerticalOffsetForLineNumber(e,i){return this._viewLayout.getVerticalOffsetForLineNumber(e,i)}getVerticalOffsetAfterLineNumber(e,i){return this._viewLayout.getVerticalOffsetAfterLineNumber(e,i)}getDecorationsInViewport(){return this.viewportData.getDecorationsInViewport()}}class m extends s{_renderingContextBrand=void 0;_viewLines;constructor(e,i,t){super(e,i),this._viewLines=t}linesVisibleRangesForRange(e,i){return this._viewLines.linesVisibleRangesForRange(e,i)}visibleRangeForPosition(e){return this._viewLines.visibleRangeForPosition(e)}}class w{constructor(e,i,t,r){this.outsideRenderedLine=e;this.lineNumber=i;this.ranges=t;this.continuesOnNextLine=r}static firstLine(e){if(!e)return null;let i=null;for(const t of e)(!i||t.lineNumber<i.lineNumber)&&(i=t);return i}static lastLine(e){if(!e)return null;let i=null;for(const t of e)(!i||t.lineNumber>i.lineNumber)&&(i=t);return i}}class l{_horizontalRangeBrand=void 0;left;width;static from(e){const i=new Array(e.length);for(let t=0,r=e.length;t<r;t++){const o=e[t];i[t]=new l(o.left,o.width)}return i}constructor(e,i){this.left=Math.round(e),this.width=Math.round(i)}toString(){return`[${this.left},${this.width}]`}}class L{_floatHorizontalRangeBrand=void 0;left;width;constructor(e,i){this.left=e,this.width=i}toString(){return`[${this.left},${this.width}]`}static compare(e,i){return e.left-i.left}}class R{outsideRenderedLine;left;originalLeft;constructor(e,i){this.outsideRenderedLine=e,this.originalLeft=i,this.left=Math.round(this.originalLeft)}}class v{constructor(e,i){this.outsideRenderedLine=e;this.ranges=i}}export{L as FloatHorizontalRange,R as HorizontalPosition,l as HorizontalRange,w as LineVisibleRanges,m as RenderingContext,s as RestrictedRenderingContext,v as VisibleRanges};
