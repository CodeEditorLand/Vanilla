import{Range as o}from"../../../common/core/range.js";import{Selection as e}from"../../../common/core/selection.js";class m{selection;targetPosition;targetSelection;copy;constructor(i,t,n){this.selection=i,this.targetPosition=t,this.copy=n,this.targetSelection=null}getEditOperations(i,t){const n=i.getValueInRange(this.selection);if(this.copy||t.addEditOperation(this.selection,null),t.addEditOperation(new o(this.targetPosition.lineNumber,this.targetPosition.column,this.targetPosition.lineNumber,this.targetPosition.column),n),this.selection.containsPosition(this.targetPosition)&&!(this.copy&&(this.selection.getEndPosition().equals(this.targetPosition)||this.selection.getStartPosition().equals(this.targetPosition)))){this.targetSelection=this.selection;return}if(this.copy){this.targetSelection=new e(this.targetPosition.lineNumber,this.targetPosition.column,this.selection.endLineNumber-this.selection.startLineNumber+this.targetPosition.lineNumber,this.selection.startLineNumber===this.selection.endLineNumber?this.targetPosition.column+this.selection.endColumn-this.selection.startColumn:this.selection.endColumn);return}if(this.targetPosition.lineNumber>this.selection.endLineNumber){this.targetSelection=new e(this.targetPosition.lineNumber-this.selection.endLineNumber+this.selection.startLineNumber,this.targetPosition.column,this.targetPosition.lineNumber,this.selection.startLineNumber===this.selection.endLineNumber?this.targetPosition.column+this.selection.endColumn-this.selection.startColumn:this.selection.endColumn);return}if(this.targetPosition.lineNumber<this.selection.endLineNumber){this.targetSelection=new e(this.targetPosition.lineNumber,this.targetPosition.column,this.targetPosition.lineNumber+this.selection.endLineNumber-this.selection.startLineNumber,this.selection.startLineNumber===this.selection.endLineNumber?this.targetPosition.column+this.selection.endColumn-this.selection.startColumn:this.selection.endColumn);return}this.selection.endColumn<=this.targetPosition.column?this.targetSelection=new e(this.targetPosition.lineNumber-this.selection.endLineNumber+this.selection.startLineNumber,this.selection.startLineNumber===this.selection.endLineNumber?this.targetPosition.column-this.selection.endColumn+this.selection.startColumn:this.targetPosition.column-this.selection.endColumn+this.selection.startColumn,this.targetPosition.lineNumber,this.selection.startLineNumber===this.selection.endLineNumber?this.targetPosition.column:this.selection.endColumn):this.targetSelection=new e(this.targetPosition.lineNumber-this.selection.endLineNumber+this.selection.startLineNumber,this.targetPosition.column,this.targetPosition.lineNumber,this.targetPosition.column+this.selection.endColumn-this.selection.startColumn)}computeCursorState(i,t){return this.targetSelection}}export{m as DragAndDropCommand};
