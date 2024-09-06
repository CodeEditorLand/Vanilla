import{Codicon as c}from"../../../../../vs/base/common/codicons.js";import"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/common/core/selection.js";import{EditorContextKeys as g}from"../../../../../vs/editor/common/editorContextKeys.js";import{localize2 as f}from"../../../../../vs/nls.js";import{Action2 as a,MenuId as p}from"../../../../../vs/platform/actions/common/actions.js";import{ContextKeyExpr as o}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{TextEditorSelectionRevealType as w}from"../../../../../vs/platform/editor/common/editor.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{IListService as x}from"../../../../../vs/platform/list/browser/listService.js";import{resolveCommandsContext as A}from"../../../../../vs/workbench/browser/parts/editor/editorCommandsContext.js";import{MultiDiffEditor as l}from"../../../../../vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor.js";import{MultiDiffEditorInput as D}from"../../../../../vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorInput.js";import{IEditorGroupsService as C}from"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as u}from"../../../../../vs/workbench/services/editor/common/editorService.js";class j extends a{constructor(){super({id:"multiDiffEditor.goToFile",title:f("goToFile","Open File"),icon:c.goToFile,precondition:g.inMultiDiffEditor,menu:{when:g.inMultiDiffEditor,id:p.MultiDiffEditorFileToolbar,order:22,group:"navigation"}})}async run(e,...r){const n=r[0],t=e.get(u),i=t.activeEditorPane;let d;if(!(i instanceof l))return;const E=i.tryGetCodeEditor(n);E&&(d=E.editor.getSelections()??void 0);let v=n;const s=i.findDocumentDiffItem(n);s&&s.goToFileUri&&(v=s.goToFileUri),await t.openEditor({resource:v,options:{selection:d?.[0],selectionRevealType:w.CenterIfOutsideViewport}})}}class B extends a{constructor(){super({id:"multiDiffEditor.collapseAll",title:f("collapseAllDiffs","Collapse All Diffs"),icon:c.collapseAll,precondition:o.and(o.equals("activeEditor",l.ID),o.not("multiDiffEditorAllCollapsed")),menu:{when:o.and(o.equals("activeEditor",l.ID),o.not("multiDiffEditorAllCollapsed")),id:p.EditorTitle,group:"navigation",order:100},f1:!0})}async run(e,...r){const t=A(r,e.get(u),e.get(C),e.get(x)).groupedEditors[0];if(!t)return;const i=t.editors[0];i instanceof D&&(await i.getViewModel()).collapseAll()}}class H extends a{constructor(){super({id:"multiDiffEditor.expandAll",title:f("ExpandAllDiffs","Expand All Diffs"),icon:c.expandAll,precondition:o.and(o.equals("activeEditor",l.ID),o.has("multiDiffEditorAllCollapsed")),menu:{when:o.and(o.equals("activeEditor",l.ID),o.has("multiDiffEditorAllCollapsed")),id:p.EditorTitle,group:"navigation",order:100},f1:!0})}async run(e,...r){const t=A(r,e.get(u),e.get(C),e.get(x)).groupedEditors[0];if(!t)return;const i=t.editors[0];i instanceof D&&(await i.getViewModel()).expandAll()}}export{B as CollapseAllAction,H as ExpandAllAction,j as GoToFileAction};
