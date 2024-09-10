import{renderMarkdownAsPlaintext as R}from"../../../../../base/browser/markdownRenderer.js";import{Emitter as _}from"../../../../../base/common/event.js";import{DisposableStore as w}from"../../../../../base/common/lifecycle.js";import{marked as b}from"../../../../../base/common/marked/marked.js";import{TrackedRangeStickiness as m}from"../../../../../editor/common/model.js";import{FoldingRegions as v}from"../../../../../editor/contrib/folding/browser/foldingRanges.js";import{sanitizeRanges as I}from"../../../../../editor/contrib/folding/browser/syntaxRangeProvider.js";import{CellKind as C}from"../../common/notebookCommon.js";import{cellRangesToIndexes as F}from"../../common/notebookRange.js";const x={limit:5e3,update:()=>{}};class H{_viewModel=null;_viewModelStore=new w;_regions;get regions(){return this._regions}_onDidFoldingRegionChanges=new _;onDidFoldingRegionChanged=this._onDidFoldingRegionChanges.event;_foldingRangeDecorationIds=[];constructor(){this._regions=new v(new Uint32Array(0),new Uint32Array(0))}dispose(){this._onDidFoldingRegionChanges.dispose(),this._viewModelStore.dispose()}detachViewModel(){this._viewModelStore.clear(),this._viewModel=null}attachViewModel(n){this._viewModel=n,this._viewModelStore.add(this._viewModel.onDidChangeViewCells(()=>{this.recompute()})),this._viewModelStore.add(this._viewModel.onDidChangeSelection(()=>{if(!this._viewModel)return;const e=F(this._viewModel.getSelections());let l=!1;e.forEach(s=>{let i=this.regions.findRange(s+1);for(;i!==-1;)this._regions.isCollapsed(i)&&s>this._regions.getStartLineNumber(i)-1&&(this._regions.setCollapsed(i,!1),l=!0),i=this._regions.getParentIndex(i)}),l&&this._onDidFoldingRegionChanges.fire()})),this.recompute()}getRegionAtLine(n){if(this._regions){const e=this._regions.findRange(n);if(e>=0)return this._regions.toRegion(e)}return null}getRegionsInside(n,e){const l=[],s=n?n.regionIndex+1:0,i=n?n.endLineNumber:Number.MAX_VALUE;if(e&&e.length===2){const o=[];for(let d=s,r=this._regions.length;d<r;d++){const h=this._regions.toRegion(d);if(this._regions.getStartLineNumber(d)<i){for(;o.length>0&&!h.containedBy(o[o.length-1]);)o.pop();o.push(h),e(h,o.length)&&l.push(h)}else break}}else for(let o=s,d=this._regions.length;o<d;o++){const r=this._regions.toRegion(o);if(this._regions.getStartLineNumber(o)<i)(!e||e(r))&&l.push(r);else break}return l}getAllRegionsAtLine(n,e){const l=[];if(this._regions){let s=this._regions.findRange(n),i=1;for(;s>=0;){const o=this._regions.toRegion(s);(!e||e(o,i))&&l.push(o),i++,s=o.parentIndex}}return l}setCollapsed(n,e){this._regions.setCollapsed(n,e)}recompute(){if(!this._viewModel)return;const n=this._viewModel,e=n.viewCells,l=[];for(let t=0;t<e.length;t++){const g=e[t];if(g.cellKind!==C.Markup||g.language!=="markdown")continue;const a=Math.min(7,...Array.from(M(g.getText()),u=>u.depth));a<7&&l.push({index:t,level:a,endIndex:0})}const s=l.map((t,g)=>{let a;for(let p=g+1;p<l.length;++p)if(l[p].level<=t.level){a=l[p].index-1;break}const u=a!==void 0?a:e.length-1;return{start:t.index+1,end:u+1,rank:1}}).filter(t=>t.start!==t.end),i=I(s,x);let o=0;const d=()=>{for(;o<this._regions.length;){const t=this._regions.isCollapsed(o);if(o++,t)return o-1}return-1};let r=0,h=d();for(;h!==-1&&r<i.length;){const t=n.getTrackedRange(this._foldingRangeDecorationIds[h]);if(t){const g=t.start;for(;r<i.length;){const a=i.getStartLineNumber(r)-1;if(g>=a)i.setCollapsed(r,g===a),r++;else break}}h=d()}for(;r<i.length;)i.setCollapsed(r,!1),r++;const f=[];for(let t=0;t<i.length;t++){const g=i.toRegion(t);f.push({start:g.startLineNumber-1,end:g.endLineNumber-1})}this._foldingRangeDecorationIds.forEach(t=>n.setTrackedRange(t,null,m.GrowsOnlyWhenTypingAfter)),this._foldingRangeDecorationIds=f.map(t=>n.setTrackedRange(null,t,m.GrowsOnlyWhenTypingAfter)).filter(t=>t!==null),this._regions=i,this._onDidFoldingRegionChanges.fire()}getMemento(){const n=[];let e=0;for(;e<this._regions.length;){if(this._regions.isCollapsed(e)){const s=this._regions.toRegion(e);n.push({start:s.startLineNumber-1,end:s.endLineNumber-1})}e++}return n}applyMemento(n){if(!this._viewModel)return!1;let e=0,l=0;for(;l<n.length&&e<this._regions.length;){if(this._viewModel.getTrackedRange(this._foldingRangeDecorationIds[e])){const i=n[l].start;for(;e<this._regions.length;){const o=this._regions.getStartLineNumber(e)-1;if(i>=o)this._regions.setCollapsed(e,i===o),e++;else break}}l++}for(;e<this._regions.length;)this._regions.setCollapsed(e,!1),e++;return!0}}function X(c,n,e){const l=c.regions.findRange(n+1);c.setCollapsed(l,e)}function*M(c){for(const n of b.lexer(c,{gfm:!0}))n.type==="heading"&&(yield{depth:n.depth,text:R({value:n.raw}).trim()})}export{H as FoldingModel,M as getMarkdownHeadersInCell,X as updateFoldingStateAtIndex};
