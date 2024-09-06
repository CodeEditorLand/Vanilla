import"../../../../../base/browser/mouseEvent.js";import"../../../../../base/common/cancellation.js";import"../../../../../base/common/event.js";import"../../../../../base/common/lifecycle.js";import"../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";import"../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";import"../../../../../editor/common/config/fontInfo.js";import{localize as o}from"../../../../../nls.js";import"../../../../../platform/actions/browser/toolbar.js";import{RawContextKey as e}from"../../../../../platform/contextkey/common/contextkey.js";import"../../common/model/notebookTextModel.js";import"../notebookBrowser.js";import"../notebookOptions.js";import"../notebookViewEvents.js";import"./diffElementViewModel.js";var n=(t=>(t[t.Original=0]="Original",t[t.Modified=1]="Modified",t))(n||{});const P=16,W=new e("notebook.diffEditor.cell.inputChanged",!1),l="notebook.diffEditor.cell.ignoreWhitespace",K=new e(l,!1),A=new e("notebook.diffEditor.cell.property.changed",!1),G=new e("notebook.diffEditor.cell.property.expanded",!1),U=new e("notebook.diffEditor.allCollapsed",void 0,o("notebook.diffEditor.allCollapsed","Whether all cells in notebook diff editor are collapsed")),Y=new e("notebook.diffEditor.hasUnchangedCells",void 0,o("notebook.diffEditor.hasUnchangedCells","Whether there are unchanged cells in the notebook diff editor")),z=new e("notebook.diffEditor.unchangedCellsAreHidden",void 0,o("notebook.diffEditor.unchangedCellsAreHidden","Whether the unchanged cells in the notebook diff editor are hidden")),X=new e("notebook.diffEditor.item.kind",void 0,o("notebook.diffEditor.item.kind","The kind of item in the notebook diff editor, Cell, Metadata or Output")),j=new e("notebook.diffEditor.item.state",void 0,o("notebook.diffEditor.item.state","The diff state of item in the notebook diff editor, delete, insert, modified or unchanged"));export{P as DIFF_CELL_MARGIN,n as DiffSide,U as NOTEBOOK_DIFF_CELLS_COLLAPSED,K as NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE,l as NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY,W as NOTEBOOK_DIFF_CELL_INPUT,A as NOTEBOOK_DIFF_CELL_PROPERTY,G as NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED,Y as NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS,j as NOTEBOOK_DIFF_ITEM_DIFF_STATE,X as NOTEBOOK_DIFF_ITEM_KIND,z as NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN};
