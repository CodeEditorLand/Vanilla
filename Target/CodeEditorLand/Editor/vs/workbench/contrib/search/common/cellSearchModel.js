import{Disposable as f}from"../../../../base/common/lifecycle.js";import{Range as o}from"../../../../editor/common/core/range.js";import{DefaultEndOfLine as i}from"../../../../editor/common/model.js";import{PieceTreeTextBufferBuilder as s}from"../../../../editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder.js";import{SearchParams as a}from"../../../../editor/common/model/textModelSearch.js";class T extends f{constructor(e,t,n){super();this._source=e;this._inputTextBuffer=t;this._outputs=n}_outputTextBuffers=void 0;_getFullModelRange(e){const t=e.getLineCount();return new o(1,1,t,this._getLineMaxColumn(e,t))}_getLineMaxColumn(e,t){if(t<1||t>e.getLineCount())throw new Error("Illegal value for lineNumber");return e.getLineLength(t)+1}get inputTextBuffer(){if(!this._inputTextBuffer){const e=new s;e.acceptChunk(this._source);const t=e.finish(!0),{textBuffer:n,disposable:r}=t.create(i.LF);this._inputTextBuffer=n,this._register(r)}return this._inputTextBuffer}get outputTextBuffers(){return this._outputTextBuffers||(this._outputTextBuffers=this._outputs.map(e=>{const t=new s;t.acceptChunk(e);const n=t.finish(!0),{textBuffer:r,disposable:u}=n.create(i.LF);return this._register(u),r})),this._outputTextBuffers}findInInputs(e){const n=new a(e,!1,!1,null).parseSearchRequest();if(!n)return[];const r=this._getFullModelRange(this.inputTextBuffer);return this.inputTextBuffer.findMatchesLineByLine(r,n,!0,5e3)}findInOutputs(e){const n=new a(e,!1,!1,null).parseSearchRequest();return n?this.outputTextBuffers.map(r=>{const u=r.findMatchesLineByLine(this._getFullModelRange(r),n,!0,5e3);if(u.length!==0)return{textBuffer:r,matches:u}}).filter(r=>!!r):[]}}export{T as CellSearchModel};
