import"../../../../../../vs/base/common/buffer.js";import{LcsDiff as p}from"../../../../../../vs/base/common/diff/diff.js";import{doHash as b,hash as o,numberHash as C}from"../../../../../../vs/base/common/hash.js";import"../../../../../../vs/base/common/lifecycle.js";import{URI as M}from"../../../../../../vs/base/common/uri.js";import"../../../../../../vs/base/common/worker/simpleWorker.js";import{Range as h}from"../../../../../../vs/editor/common/core/range.js";import*as d from"../../../../../../vs/editor/common/model.js";import{PieceTreeTextBufferBuilder as _}from"../../../../../../vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder.js";import{SearchParams as k}from"../../../../../../vs/editor/common/model/textModelSearch.js";import{CellKind as x,NotebookCellsChangeType as s}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";function I(r){let t=C(104579,0);for(let e=0;e<r.buffer.length;e++)t=b(r.buffer[e],t);return t}class f{constructor(t,e,n,l,a,i,u){this.handle=t;this._source=e;this.language=n;this.cellKind=l;this.outputs=a;this.metadata=i;this.internalMetadata=u}_textBuffer;get textBuffer(){if(this._textBuffer)return this._textBuffer;const t=new _;t.acceptChunk(Array.isArray(this._source)?this._source.join(`
`):this._source);const e=t.finish(!0);return this._textBuffer=e.create(d.DefaultEndOfLine.LF).textBuffer,this._textBuffer}_primaryKey=null;primaryKey(){return this._primaryKey===void 0&&(this._primaryKey=o(this.getValue())),this._primaryKey}_hash=null;getFullModelRange(){const t=this.textBuffer.getLineCount();return new h(1,1,t,this.textBuffer.getLineLength(t)+1)}getValue(){const t=this.getFullModelRange();return this.textBuffer.getValueInRange(t,d.EndOfLinePreference.LF)}getComparisonValue(){return this._primaryKey!==null?this._primaryKey:(this._hash=o([o(this.language),o(this.getValue()),this.metadata,this.internalMetadata,this.outputs.map(t=>({outputs:t.outputs.map(e=>({mime:e.mime,data:I(e.data)})),metadata:t.metadata}))]),this._hash)}getHashValue(){return this._hash!==null?this._hash:(this._hash=o([o(this.getValue()),this.language,this.metadata,this.internalMetadata]),this._hash)}}class D{constructor(t,e,n){this.uri=t;this.cells=e;this.metadata=n}acceptModelChanged(t){t.rawEvents.forEach(e=>{if(e.kind===s.ModelChange)this._spliceNotebookCells(e.changes);else if(e.kind===s.Move){const n=this.cells.splice(e.index,1);this.cells.splice(e.newIdx,0,...n)}else if(e.kind===s.Output){const n=this.cells[e.index];n.outputs=e.outputs}else if(e.kind===s.ChangeCellLanguage){this._assertIndex(e.index);const n=this.cells[e.index];n.language=e.language}else if(e.kind===s.ChangeCellMetadata){this._assertIndex(e.index);const n=this.cells[e.index];n.metadata=e.metadata}else if(e.kind===s.ChangeCellInternalMetadata){this._assertIndex(e.index);const n=this.cells[e.index];n.internalMetadata=e.internalMetadata}})}_assertIndex(t){if(t<0||t>=this.cells.length)throw new Error(`Illegal index ${t}. Cells length: ${this.cells.length}`)}_spliceNotebookCells(t){t.reverse().forEach(e=>{const l=e[2].map(a=>new f(a.handle,a.source,a.language,a.cellKind,a.outputs,a.metadata));this.cells.splice(e[0],e[1],...l)})}}class m{constructor(t){this.textModel=t}getElements(){const t=new Int32Array(this.textModel.cells.length);for(let e=0;e<this.textModel.cells.length;e++)t[e]=this.textModel.cells[e].getComparisonValue();return t}getCellHash(t){const e=Array.isArray(t.source)?t.source.join(`
`):t.source;return o([o(e),t.metadata])}}class y{_requestHandlerBrand;_models;constructor(){this._models=Object.create(null)}dispose(){}$acceptNewModel(t,e){this._models[t]=new D(M.parse(t),e.cells.map(n=>new f(n.handle,n.source,n.language,n.cellKind,n.outputs,n.metadata)),e.metadata)}$acceptModelChanged(t,e){this._models[t]?.acceptModelChanged(e)}$acceptRemovedModel(t){this._models[t]&&delete this._models[t]}$computeDiff(t,e){const n=this._getModel(t),l=this._getModel(e);return{cellsDiff:new p(new m(n),new m(l)).ComputeDiff(!1)}}$canPromptRecommendation(t){const n=this._getModel(t).cells;for(let l=0;l<n.length;l++){const a=n[l];if(a.cellKind===x.Markup||a.language!=="python")continue;const i=a.textBuffer.getLineCount(),u=Math.min(i,20),g=new h(1,1,u,a.textBuffer.getLineLength(u)+1),c=new k("import\\s*pandas|from\\s*pandas",!0,!1,null).parseSearchRequest();if(!c)continue;if(a.textBuffer.findMatchesLineByLine(g,c,!0,1).length>0)return!0}return!1}_getModel(t){return this._models[t]}}function Z(r){return new y}export{y as NotebookEditorSimpleWorker,Z as create};