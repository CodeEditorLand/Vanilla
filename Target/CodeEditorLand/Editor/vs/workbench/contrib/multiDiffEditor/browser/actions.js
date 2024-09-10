import{Codicon as c}from"../../../../base/common/codicons.js";import{localize2 as f}from"../../../../nls.js";import{Action2 as a,MenuId as p}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as o}from"../../../../platform/contextkey/common/contextkey.js";import{TextEditorSelectionRevealType as I}from"../../../../platform/editor/common/editor.js";import{IListService as g}from"../../../../platform/list/browser/listService.js";import{resolveCommandsContext as x}from"../../../browser/parts/editor/editorCommandsContext.js";import{MultiDiffEditor as r}from"./multiDiffEditor.js";import{MultiDiffEditorInput as A}from"./multiDiffEditorInput.js";import{IEditorGroupsService as D}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as u}from"../../../services/editor/common/editorService.js";import{ActiveEditorContext as C}from"../../../common/contextkeys.js";class j extends a{constructor(){super({id:"multiDiffEditor.goToFile",title:f("goToFile","Open File"),icon:c.goToFile,precondition:C.isEqualTo(r.ID),menu:{when:C.isEqualTo(r.ID),id:p.MultiDiffEditorFileToolbar,order:22,group:"navigation"}})}async run(e,...n){const l=n[0],t=e.get(u),i=t.activeEditorPane;let d;if(!(i instanceof r))return;const E=i.tryGetCodeEditor(l);E&&(d=E.editor.getSelections()??void 0);let v=l;const s=i.findDocumentDiffItem(l);s&&s.goToFileUri&&(v=s.goToFileUri),await t.openEditor({resource:v,options:{selection:d?.[0],selectionRevealType:I.CenterIfOutsideViewport}})}}class B extends a{constructor(){super({id:"multiDiffEditor.collapseAll",title:f("collapseAllDiffs","Collapse All Diffs"),icon:c.collapseAll,precondition:o.and(o.equals("activeEditor",r.ID),o.not("multiDiffEditorAllCollapsed")),menu:{when:o.and(o.equals("activeEditor",r.ID),o.not("multiDiffEditorAllCollapsed")),id:p.EditorTitle,group:"navigation",order:100},f1:!0})}async run(e,...n){const t=x(n,e.get(u),e.get(D),e.get(g)).groupedEditors[0];if(!t)return;const i=t.editors[0];i instanceof A&&(await i.getViewModel()).collapseAll()}}class H extends a{constructor(){super({id:"multiDiffEditor.expandAll",title:f("ExpandAllDiffs","Expand All Diffs"),icon:c.expandAll,precondition:o.and(o.equals("activeEditor",r.ID),o.has("multiDiffEditorAllCollapsed")),menu:{when:o.and(o.equals("activeEditor",r.ID),o.has("multiDiffEditorAllCollapsed")),id:p.EditorTitle,group:"navigation",order:100},f1:!0})}async run(e,...n){const t=x(n,e.get(u),e.get(D),e.get(g)).groupedEditors[0];if(!t)return;const i=t.editors[0];i instanceof A&&(await i.getViewModel()).expandAll()}}export{B as CollapseAllAction,H as ExpandAllAction,j as GoToFileAction};
