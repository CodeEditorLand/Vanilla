import{UndoRedoElementType as t}from"../../../../../platform/undoRedo/common/undoRedo.js";class b{constructor(e,o,i,n,d,r,a){this.resource=e;this.fromIndex=o;this.length=i;this.toIndex=n;this.editingDelegate=d;this.beforedSelections=r;this.endSelections=a}type=t.Resource;get label(){return this.length===1?"Move Cell":"Move Cells"}code="undoredo.textBufferEdit";undo(){if(!this.editingDelegate.moveCell)throw new Error("Notebook Move Cell not implemented for Undo/Redo");this.editingDelegate.moveCell(this.toIndex,this.length,this.fromIndex,this.endSelections,this.beforedSelections)}redo(){if(!this.editingDelegate.moveCell)throw new Error("Notebook Move Cell not implemented for Undo/Redo");this.editingDelegate.moveCell(this.fromIndex,this.length,this.toIndex,this.beforedSelections,this.endSelections)}}class v{constructor(e,o,i,n,d){this.resource=e;this.diffs=o;this.editingDelegate=i;this.beforeHandles=n;this.endHandles=d}type=t.Resource;get label(){return this.diffs.length===1&&this.diffs[0][1].length===0?this.diffs[0][2].length>1?"Insert Cells":"Insert Cell":this.diffs.length===1&&this.diffs[0][2].length===0?this.diffs[0][1].length>1?"Delete Cells":"Delete Cell":"Insert Cell"}code="undoredo.textBufferEdit";undo(){if(!this.editingDelegate.replaceCell)throw new Error("Notebook Replace Cell not implemented for Undo/Redo");this.diffs.forEach(e=>{this.editingDelegate.replaceCell(e[0],e[2].length,e[1],this.beforeHandles)})}redo(){if(!this.editingDelegate.replaceCell)throw new Error("Notebook Replace Cell not implemented for Undo/Redo");this.diffs.reverse().forEach(e=>{this.editingDelegate.replaceCell(e[0],e[1].length,e[2],this.endHandles)})}}class I{constructor(e,o,i,n,d){this.resource=e;this.index=o;this.oldMetadata=i;this.newMetadata=n;this.editingDelegate=d}type=t.Resource;label="Update Cell Metadata";code="undoredo.textBufferEdit";undo(){this.editingDelegate.updateCellMetadata&&this.editingDelegate.updateCellMetadata(this.index,this.oldMetadata)}redo(){this.editingDelegate.updateCellMetadata&&this.editingDelegate.updateCellMetadata(this.index,this.newMetadata)}}export{I as CellMetadataEdit,b as MoveCellEdit,v as SpliceCellsEdit};
