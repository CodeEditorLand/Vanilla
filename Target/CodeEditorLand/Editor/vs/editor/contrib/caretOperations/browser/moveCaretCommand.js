import{Range as r}from"../../../common/core/range.js";import{Selection as a}from"../../../common/core/selection.js";class d{_selection;_isMovingLeft;constructor(n,t){this._selection=n,this._isMovingLeft=t}getEditOperations(n,t){if(this._selection.startLineNumber!==this._selection.endLineNumber||this._selection.isEmpty())return;const e=this._selection.startLineNumber,i=this._selection.startColumn,o=this._selection.endColumn;if(!(this._isMovingLeft&&i===1)&&!(!this._isMovingLeft&&o===n.getLineMaxColumn(e)))if(this._isMovingLeft){const s=new r(e,i-1,e,i),l=n.getValueInRange(s);t.addEditOperation(s,null),t.addEditOperation(new r(e,o,e,o),l)}else{const s=new r(e,o,e,o+1),l=n.getValueInRange(s);t.addEditOperation(s,null),t.addEditOperation(new r(e,i,e,i),l)}}computeCursorState(n,t){return this._isMovingLeft?new a(this._selection.startLineNumber,this._selection.startColumn-1,this._selection.endLineNumber,this._selection.endColumn-1):new a(this._selection.startLineNumber,this._selection.startColumn+1,this._selection.endLineNumber,this._selection.endColumn+1)}}export{d as MoveCaretCommand};
