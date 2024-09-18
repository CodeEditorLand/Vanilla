import"../../../../../base/common/range.js";import{ListView as l}from"../../../../../base/browser/ui/list/listView.js";import"../../../../../base/browser/ui/list/rangeMap.js";import{ConstantTimePrefixSumComputer as f}from"../../../../../editor/common/model/prefixSumComputer.js";class u{_items=[];_whitespace=[];_prefixSumComputer=new f([]);_size=0;_paddingTop=0;get paddingTop(){return this._paddingTop}set paddingTop(e){this._size=this._size+e-this._paddingTop,this._paddingTop=e}get count(){return this._items.length}get size(){return this._size}constructor(e){this._paddingTop=e??0,this._size=this._paddingTop}getWhitespaces(){return this._whitespace}restoreWhitespace(e){this._whitespace=e,this._size=this._paddingTop+this._items.reduce((i,t)=>i+t.size,0)+this._whitespace.reduce((i,t)=>i+t.size,0)}splice(e,i,t){const n=t??[];this._items.splice(e,i,...n),this._size=this._paddingTop+this._items.reduce((s,o)=>s+o.size,0)+this._whitespace.reduce((s,o)=>s+o.size,0),this._prefixSumComputer.removeValues(e,i);const r=[];for(let s=0;s<n.length;s++){const o=s+e,h=this._whitespace.filter(a=>a.afterPosition===o+1);h.length>0?r.push(n[s].size+h.reduce((a,p)=>a+p.size,0)):r.push(n[s].size)}this._prefixSumComputer.insertValues(e,r);for(let s=e;s<this._items.length;s++){const o=this._whitespace.filter(h=>h.afterPosition===s+1);o.length>0?this._prefixSumComputer.setValue(s,this._items[s].size+o.reduce((h,a)=>h+a.size,0)):this._prefixSumComputer.setValue(s,this._items[s].size)}}insertWhitespace(e,i,t){let n=0;const r=this._whitespace.filter(s=>s.afterPosition===i);if(r.length>0&&(n=Math.max(...r.map(s=>s.priority))+1),this._whitespace.push({id:e,afterPosition:i,size:t,priority:n}),this._size+=t,this._whitespace.sort((s,o)=>s.afterPosition===o.afterPosition?s.priority-o.priority:s.afterPosition-o.afterPosition),i>0){const s=i-1,h=this._items[s].size+t;this._prefixSumComputer.setValue(s,h)}}changeOneWhitespace(e,i,t){const n=this._whitespace.findIndex(r=>r.id===e);if(n!==-1){const r=this._whitespace[n],s=r.afterPosition;r.afterPosition=i;const o=r.size,h=t-o;if(r.size=t,this._size+=h,s>0&&s<=this._items.length){const a=s-1,c=this._items[a].size;this._prefixSumComputer.setValue(a,c)}if(i>0&&i<=this._items.length){const a=i-1,c=this._items[a].size+t;this._prefixSumComputer.setValue(a,c)}}}removeWhitespace(e){const i=this._whitespace.findIndex(t=>t.id===e);if(i!==-1){const t=this._whitespace[i];if(this._whitespace.splice(i,1),this._size-=t.size,t.afterPosition>0){const n=t.afterPosition-1,r=this._items[n].size,s=this._whitespace.filter(h=>h.afterPosition===t.afterPosition),o=r+s.reduce((h,a)=>h+a.size,0);this._prefixSumComputer.setValue(n,o)}}}getWhitespacePosition(e){const i=this._whitespace.find(p=>p.id===e);if(!i)throw new Error("Whitespace not found");const t=i.afterPosition;if(t===0)return this._whitespace.filter(c=>c.afterPosition===t&&c.priority<i.priority).reduce((c,m)=>c+m.size,0)+this.paddingTop;const n=this._whitespace.filter(p=>p.afterPosition===0).reduce((p,c)=>p+c.size,0),r=t-1,s=this._prefixSumComputer.getPrefixSum(r),o=this._items[r].size,a=this._whitespace.filter(p=>p.afterPosition<=t-1&&p.afterPosition>0).reduce((p,c)=>p+c.size,0);return s+o+n+this.paddingTop+a}indexAt(e){if(e<0)return-1;const i=this._whitespace.filter(n=>n.afterPosition===0).reduce((n,r)=>n+r.size,0),t=e-(this._paddingTop+i);return t<=0?0:t>=this._size-this._paddingTop-i?this.count:this._prefixSumComputer.getIndexOf(Math.trunc(t)).index}indexAfter(e){const i=this.indexAt(e);return Math.min(i+1,this._items.length)}positionAt(e){if(e<0||this.count===0||e>=this.count)return-1;const i=this._whitespace.filter(t=>t.afterPosition===0).reduce((t,n)=>t+n.size,0);return this._prefixSumComputer.getPrefixSum(e)+this._paddingTop+i}}class x extends l{_lastWhitespaceId=0;_renderingStack=0;get inRenderingTransaction(){return this._renderingStack>0}get notebookRangeMap(){return this.rangeMap}render(e,i,t,n,r,s){this._renderingStack++,super.render(e,i,t,n,r,s),this._renderingStack--}_rerender(e,i,t){this._renderingStack++,super._rerender(e,i,t),this._renderingStack--}createRangeMap(e){const i=this.rangeMap;if(i){const t=new u(e);return t.restoreWhitespace(i.getWhitespaces()),t}else return new u(e)}insertWhitespace(e,i){const t=this.scrollTop,n=`${++this._lastWhitespaceId}`,r=this.getRenderRange(this.lastRenderTop,this.lastRenderHeight),s=this.elementTop(e),o=t>s;this.notebookRangeMap.insertWhitespace(n,e,i);const h=o?t+i:t;return this.render(r,h,this.lastRenderHeight,void 0,void 0,!1),this._rerender(h,this.renderHeight,!1),this.eventuallyUpdateScrollDimensions(),n}changeOneWhitespace(e,i,t){const n=this.scrollTop,r=this.getRenderRange(this.lastRenderTop,this.lastRenderHeight);this.notebookRangeMap.getWhitespacePosition(e)>n?(this.notebookRangeMap.changeOneWhitespace(e,i,t),this.render(r,n,this.lastRenderHeight,void 0,void 0,!1),this._rerender(n,this.renderHeight,!1),this.eventuallyUpdateScrollDimensions()):(this.notebookRangeMap.changeOneWhitespace(e,i,t),this.eventuallyUpdateScrollDimensions())}removeWhitespace(e){const i=this.scrollTop,t=this.getRenderRange(this.lastRenderTop,this.lastRenderHeight);this.notebookRangeMap.getWhitespacePosition(e)>i?(this.notebookRangeMap.removeWhitespace(e),this.render(t,i,this.lastRenderHeight,void 0,void 0,!1),this._rerender(i,this.renderHeight,!1),this.eventuallyUpdateScrollDimensions()):(this.notebookRangeMap.removeWhitespace(e),this.eventuallyUpdateScrollDimensions())}getWhitespacePosition(e){return this.notebookRangeMap.getWhitespacePosition(e)}}export{x as NotebookCellListView,u as NotebookCellsLayout};
