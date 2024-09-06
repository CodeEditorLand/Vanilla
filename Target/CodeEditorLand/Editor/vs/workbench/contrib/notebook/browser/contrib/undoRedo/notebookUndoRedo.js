var h=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var c=(s,i,l,o)=>{for(var e=o>1?void 0:o?v(i,l):i,r=s.length-1,t;r>=0;r--)(t=s[r])&&(e=(o?t(i,l,e):t(e))||e);return o&&e&&h(i,l,e),e},f=(s,i)=>(l,o)=>i(l,o,s);import{Disposable as E}from"../../../../../../base/common/lifecycle.js";import{RedoCommand as M,UndoCommand as k}from"../../../../../../editor/browser/editorExtensions.js";import{registerWorkbenchContribution2 as w,WorkbenchPhase as I}from"../../../../../common/contributions.js";import{IEditorService as S}from"../../../../../services/editor/common/editorService.js";import{CellKind as p}from"../../../common/notebookCommon.js";import{CellEditState as g,getNotebookEditorFromEditorPane as u}from"../../notebookBrowser.js";import"../../viewModel/notebookViewModelImpl.js";let a=class extends E{constructor(l){super();this._editorService=l;const o=105;this._register(k.addImplementation(o,"notebook-undo-redo",()=>{const e=u(this._editorService.activeEditorPane),r=e?.getViewModel();return e&&e.hasModel()&&r?r.undo().then(t=>{if(t?.length){for(let n=0;n<e.getLength();n++){const d=e.cellAt(n);d.cellKind===p.Markup&&t.find(m=>m.fragment===d.model.uri.fragment)&&d.updateEditState(g.Editing,"undo")}e?.setOptions({cellOptions:{resource:t[0]},preserveFocus:!0})}}):!1})),this._register(M.addImplementation(o,"notebook-undo-redo",()=>{const e=u(this._editorService.activeEditorPane),r=e?.getViewModel();return e&&e.hasModel()&&r?r.redo().then(t=>{if(t?.length){for(let n=0;n<e.getLength();n++){const d=e.cellAt(n);d.cellKind===p.Markup&&t.find(m=>m.fragment===d.model.uri.fragment)&&d.updateEditState(g.Editing,"redo")}e?.setOptions({cellOptions:{resource:t[0]},preserveFocus:!0})}}):!1}))}static ID="workbench.contrib.notebookUndoRedo"};a=c([f(0,S)],a),w(a.ID,a,I.BlockRestore);
