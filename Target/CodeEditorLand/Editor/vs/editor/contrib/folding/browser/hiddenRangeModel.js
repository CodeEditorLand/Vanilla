import{findFirstIdxMonotonousOrArrLen as u}from"../../../../base/common/arraysFind.js";import{Emitter as p}from"../../../../base/common/event.js";import{Range as f}from"../../../common/core/range.js";import{countEOL as m}from"../../../common/core/eolCounter.js";class j{_foldingModel;_hiddenRanges;_foldingModelListener;_updateEventEmitter=new p;_hasLineChanges=!1;get onDidChange(){return this._updateEventEmitter.event}get hiddenRanges(){return this._hiddenRanges}constructor(e){this._foldingModel=e,this._foldingModelListener=e.onDidChange(n=>this.updateHiddenRanges()),this._hiddenRanges=[],e.regions.length&&this.updateHiddenRanges()}notifyChangeModelContent(e){this._hiddenRanges.length&&!this._hasLineChanges&&(this._hasLineChanges=e.changes.some(n=>n.range.endLineNumber!==n.range.startLineNumber||m(n.text)[0]!==0))}updateHiddenRanges(){let e=!1;const n=[];let s=0,t=0,l=Number.MAX_VALUE,d=-1;const o=this._foldingModel.regions;for(;s<o.length;s++){if(!o.isCollapsed(s))continue;const i=o.getStartLineNumber(s)+1,a=o.getEndLineNumber(s);l<=i&&a<=d||(!e&&t<this._hiddenRanges.length&&this._hiddenRanges[t].startLineNumber===i&&this._hiddenRanges[t].endLineNumber===a?(n.push(this._hiddenRanges[t]),t++):(e=!0,n.push(new f(i,1,a,1))),l=i,d=a)}(this._hasLineChanges||e||t<this._hiddenRanges.length)&&this.applyHiddenRanges(n)}applyHiddenRanges(e){this._hiddenRanges=e,this._hasLineChanges=!1,this._updateEventEmitter.fire(e)}hasRanges(){return this._hiddenRanges.length>0}isHidden(e){return g(this._hiddenRanges,e)!==null}adjustSelections(e){let n=!1;const s=this._foldingModel.textModel;let t=null;const l=d=>((!t||!R(d,t))&&(t=g(this._hiddenRanges,d)),t?t.startLineNumber-1:null);for(let d=0,o=e.length;d<o;d++){let i=e[d];const a=l(i.startLineNumber);a&&(i=i.setStartPosition(a,s.getLineMaxColumn(a)),n=!0);const h=l(i.endLineNumber);h&&(i=i.setEndPosition(h,s.getLineMaxColumn(h)),n=!0),e[d]=i}return n}dispose(){this.hiddenRanges.length>0&&(this._hiddenRanges=[],this._updateEventEmitter.fire(this._hiddenRanges)),this._foldingModelListener&&(this._foldingModelListener.dispose(),this._foldingModelListener=null)}}function R(r,e){return r>=e.startLineNumber&&r<=e.endLineNumber}function g(r,e){const n=u(r,s=>e<s.startLineNumber)-1;return n>=0&&r[n].endLineNumber>=e?r[n]:null}export{j as HiddenRangeModel};
