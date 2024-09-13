import{Range as s}from"../../../common/core/range.js";import{Selection as l,SelectionDirection as m}from"../../../common/core/selection.js";class c{_selection;_isCopyingDown;_noop;_selectionDirection;_selectionId;_startLineNumberDelta;_endLineNumberDelta;constructor(t,n,e){this._selection=t,this._isCopyingDown=n,this._noop=e||!1,this._selectionDirection=m.LTR,this._selectionId=null,this._startLineNumberDelta=0,this._endLineNumberDelta=0}getEditOperations(t,n){let e=this._selection;this._startLineNumberDelta=0,this._endLineNumberDelta=0,e.startLineNumber<e.endLineNumber&&e.endColumn===1&&(this._endLineNumberDelta=1,e=e.setEndPosition(e.endLineNumber-1,t.getLineMaxColumn(e.endLineNumber-1)));const o=[];for(let i=e.startLineNumber;i<=e.endLineNumber;i++)o.push(t.getLineContent(i));const r=o.join(`
`);r===""&&this._isCopyingDown&&(this._startLineNumberDelta++,this._endLineNumberDelta++),this._noop?n.addEditOperation(new s(e.endLineNumber,t.getLineMaxColumn(e.endLineNumber),e.endLineNumber+1,1),e.endLineNumber===t.getLineCount()?"":`
`):this._isCopyingDown?n.addEditOperation(new s(e.startLineNumber,1,e.startLineNumber,1),r+`
`):n.addEditOperation(new s(e.endLineNumber,t.getLineMaxColumn(e.endLineNumber),e.endLineNumber,t.getLineMaxColumn(e.endLineNumber)),`
`+r),this._selectionId=n.trackSelection(e),this._selectionDirection=this._selection.getDirection()}computeCursorState(t,n){let e=n.getTrackedSelection(this._selectionId);if(this._startLineNumberDelta!==0||this._endLineNumberDelta!==0){let o=e.startLineNumber,r=e.startColumn,i=e.endLineNumber,a=e.endColumn;this._startLineNumberDelta!==0&&(o=o+this._startLineNumberDelta,r=1),this._endLineNumberDelta!==0&&(i=i+this._endLineNumberDelta,a=1),e=l.createWithDirection(o,r,i,a,this._selectionDirection)}return e}}export{c as CopyLinesCommand};
