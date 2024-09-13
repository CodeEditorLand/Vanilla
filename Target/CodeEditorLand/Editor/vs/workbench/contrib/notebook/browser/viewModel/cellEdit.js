import{UndoRedoElementType as o}from"../../../../../platform/undoRedo/common/undoRedo.js";import{SelectionStateType as t}from"../../common/notebookCommon.js";import{CellFocusMode as l}from"../notebookBrowser.js";class u{constructor(e,d,n,r,s,a,c,m,p){this.resource=e;this.index=d;this.direction=n;this.cell=r;this.selections=s;this.inverseRange=a;this.insertContent=c;this.removedCell=m;this.editingDelegate=p;this._deletedRawCell=this.removedCell.model}type=o.Resource;label="Join Cell";code="undoredo.textBufferEdit";_deletedRawCell;async undo(){if(!this.editingDelegate.insertCell||!this.editingDelegate.createCellViewModel)throw new Error("Notebook Insert Cell not implemented for Undo/Redo");await this.cell.resolveTextModel(),this.cell.textModel?.applyEdits([{range:this.inverseRange,text:""}]),this.cell.setSelections(this.selections);const e=this.editingDelegate.createCellViewModel(this._deletedRawCell);this.direction==="above"?(this.editingDelegate.insertCell(this.index,this._deletedRawCell,{kind:t.Handle,primary:e.handle,selections:[e.handle]}),e.focusMode=l.Editor):(this.editingDelegate.insertCell(this.index,e.model,{kind:t.Handle,primary:this.cell.handle,selections:[this.cell.handle]}),this.cell.focusMode=l.Editor)}async redo(){if(!this.editingDelegate.deleteCell)throw new Error("Notebook Delete Cell not implemented for Undo/Redo");await this.cell.resolveTextModel(),this.cell.textModel?.applyEdits([{range:this.inverseRange,text:this.insertContent}]),this.editingDelegate.deleteCell(this.index,{kind:t.Handle,primary:this.cell.handle,selections:[this.cell.handle]}),this.cell.focusMode=l.Editor}}export{u as JoinCellEdit};
