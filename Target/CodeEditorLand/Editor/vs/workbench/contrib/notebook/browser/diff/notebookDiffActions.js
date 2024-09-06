import{Codicon as y}from"../../../../../../vs/base/common/codicons.js";import{KeyCode as w,KeyMod as x}from"../../../../../../vs/base/common/keyCodes.js";import{IBulkEditService as M,ResourceTextEdit as q}from"../../../../../../vs/editor/browser/services/bulkEditService.js";import{ITextResourceConfigurationService as V}from"../../../../../../vs/editor/common/services/textResourceConfiguration.js";import{localize as p,localize2 as v}from"../../../../../../vs/nls.js";import"../../../../../../vs/platform/action/common/action.js";import{Action2 as c,MenuId as u,registerAction2 as l}from"../../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as K}from"../../../../../../vs/platform/configuration/common/configuration.js";import{Extensions as B}from"../../../../../../vs/platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as t}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{TextEditorSelectionRevealType as U}from"../../../../../../vs/platform/editor/common/editor.js";import"../../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as A}from"../../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{Registry as L}from"../../../../../../vs/platform/registry/common/platform.js";import{ActiveEditorContext as s}from"../../../../../../vs/workbench/common/contextkeys.js";import{DEFAULT_EDITOR_ASSOCIATION as W}from"../../../../../../vs/workbench/common/editor.js";import{SideBySideDiffElementViewModel as D}from"../../../../../../vs/workbench/contrib/notebook/browser/diff/diffElementViewModel.js";import{NotebookTextDiffEditor as E}from"../../../../../../vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor.js";import{NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY as H,NOTEBOOK_DIFF_CELL_INPUT as b,NOTEBOOK_DIFF_CELL_PROPERTY as k,NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED as G,NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS as h,NOTEBOOK_DIFF_ITEM_DIFF_STATE as C,NOTEBOOK_DIFF_ITEM_KIND as O,NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN as N}from"../../../../../../vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser.js";import{NotebookMultiTextDiffEditor as a}from"../../../../../../vs/workbench/contrib/notebook/browser/diff/notebookMultiDiffEditor.js";import{nextChangeIcon as Y,openAsTextIcon as z,previousChangeIcon as j,renderOutputIcon as X,revertIcon as T,toggleWhitespace as J}from"../../../../../../vs/workbench/contrib/notebook/browser/notebookIcons.js";import{CellEditType as S,NOTEBOOK_DIFF_EDITOR_ID as _}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import"../../../../../../vs/workbench/contrib/notebook/common/notebookDiffEditorInput.js";import{IEditorService as m}from"../../../../../../vs/workbench/services/editor/common/editorService.js";l(class extends c{constructor(){super({id:"notebook.diff.switchToText",icon:z,title:v("notebook.diff.switchToText","Open Text Diff Editor"),precondition:t.or(s.isEqualTo(E.ID),s.isEqualTo(a.ID)),menu:[{id:u.EditorTitle,group:"navigation",when:t.or(s.isEqualTo(E.ID),s.isEqualTo(a.ID))}]})}async run(n){const e=n.get(m),o=e.activeEditorPane;if(o&&(o instanceof E||o instanceof a)){const i=o.input;await e.openEditor({original:{resource:i.original.resource},modified:{resource:i.resource},label:i.getName(),options:{preserveFocus:!1,override:W.id}})}}}),l(class extends c{constructor(){super({id:"notebook.diffEditor.showUnchangedCells",title:v("showUnchangedCells","Show Unchanged Cells"),icon:y.unfold,precondition:t.and(s.isEqualTo(a.ID),t.has(h.key)),menu:{when:t.and(s.isEqualTo(a.ID),t.has(h.key),t.equals(N.key,!0)),id:u.EditorTitle,order:22,group:"navigation"}})}run(n,...e){const o=n.get(m).activeEditorPane;o&&o instanceof a&&o.showUnchanged()}}),l(class extends c{constructor(){super({id:"notebook.diffEditor.hideUnchangedCells",title:v("hideUnchangedCells","Hide Unchanged Cells"),icon:y.fold,precondition:t.and(s.isEqualTo(a.ID),t.has(h.key)),menu:{when:t.and(s.isEqualTo(a.ID),t.has(h.key),t.equals(N.key,!1)),id:u.EditorTitle,order:22,group:"navigation"}})}run(n,...e){const o=n.get(m).activeEditorPane;o&&o instanceof a&&o.hideUnchanged()}}),l(class extends c{constructor(){super({id:"notebook.diffEditor.2.goToCell",title:v("goToCell","Go To Cell"),icon:y.goToFile,menu:{when:t.and(s.isEqualTo(a.ID),t.equals(O.key,"Cell"),t.notEquals(C.key,"delete")),id:u.MultiDiffEditorFileToolbar,order:0,group:"navigation"}})}async run(e,...o){const i=o[0],r=e.get(m);r.activeEditorPane instanceof a&&await r.openEditor({resource:i,options:{selectionRevealType:U.CenterIfOutsideViewport}})}});const F=p("notebook.diff.cell.revertInput","Revert Input");l(class extends c{constructor(){super({id:"notebook.diffEditor.2.cell.revertInput",title:F,icon:T,menu:{when:t.and(s.isEqualTo(a.ID),t.equals(O.key,"Cell"),t.equals(C.key,"modified")),id:u.MultiDiffEditorFileToolbar,order:2,group:"navigation"}})}async run(n,...e){const o=e[0],r=n.get(m).activeEditorPane;if(!(r instanceof a))return;const d=r.getDiffElementViewModel(o);if(d&&d instanceof D){const f=d.modified,g=d.original;if(!g||!f)return;await n.get(M).apply([new q(f.uri,{range:f.textModel.getFullModelRange(),text:g.textModel.getValue()})],{quotableLabel:"Revert Notebook Cell Content Change"})}}});const Q=p("notebook.diff.cell.revertOutputs","Revert Outputs");l(class extends c{constructor(){super({id:"notebook.diffEditor.2.cell.revertOutputs",title:Q,icon:T,f1:!1,menu:{when:t.and(s.isEqualTo(a.ID),t.equals(O.key,"Output"),t.equals(C.key,"modified")),id:u.MultiDiffEditorFileToolbar,order:2,group:"navigation"}})}async run(n,...e){const o=e[0],r=n.get(m).activeEditorPane;if(!(r instanceof a))return;const d=r.getDiffElementViewModel(o);if(d&&d instanceof D){const f=d.original,g=d.modifiedDocument.cells.findIndex(I=>I.handle===d.modified.handle);if(g===-1)return;d.mainDocumentTextModel.applyEdits([{editType:S.Output,index:g,outputs:f.outputs}],!0,void 0,()=>{},void 0,!0)}}});const R=p("notebook.diff.cell.revertMetadata","Revert Metadata");l(class extends c{constructor(){super({id:"notebook.diffEditor.2.cell.revertMetadata",title:R,icon:T,f1:!1,menu:{when:t.and(s.isEqualTo(a.ID),t.equals(O.key,"Metadata"),t.equals(C.key,"modified")),id:u.MultiDiffEditorFileToolbar,order:2,group:"navigation"}})}async run(n,...e){const o=e[0],r=n.get(m).activeEditorPane;if(!(r instanceof a))return;const d=r.getDiffElementViewModel(o);if(d&&d instanceof D){const f=d.original,g=d.modifiedDocument.cells.findIndex(I=>I.handle===d.modified.handle);if(g===-1)return;d.mainDocumentTextModel.applyEdits([{editType:S.Metadata,index:g,metadata:f.metadata}],!0,void 0,()=>{},void 0,!0)}}}),l(class extends c{constructor(){super({id:"notebook.diff.cell.revertMetadata",title:R,icon:T,f1:!1,menu:{id:u.NotebookDiffCellMetadataTitle,when:k},precondition:k})}run(n,e){if(!e)return;const o=e.cell.original,i=e.cell.modified;!o||!i||(i.textModel.metadata=o.metadata)}}),l(class extends c{constructor(){super({id:"notebook.diff.cell.switchOutputRenderingStyleToText",title:p("notebook.diff.cell.switchOutputRenderingStyleToText","Switch Output Rendering"),icon:X,f1:!1,menu:{id:u.NotebookDiffCellOutputsTitle,when:G}})}run(n,e){e&&(e.cell.renderOutput=!e.cell.renderOutput)}}),l(class extends c{constructor(){super({id:"notebook.diff.cell.revertOutputs",title:p("notebook.diff.cell.revertOutputs","Revert Outputs"),icon:T,f1:!1,menu:{id:u.NotebookDiffCellOutputsTitle,when:k},precondition:k})}run(n,e){if(!e||!(e.cell instanceof D))return;const o=e.cell.original,i=e.cell.modified,r=e.cell.mainDocumentTextModel.cells.indexOf(i.textModel);r!==-1&&e.cell.mainDocumentTextModel.applyEdits([{editType:S.Output,index:r,outputs:o.outputs}],!0,void 0,()=>{},void 0,!0)}}),l(class extends c{constructor(){super({id:"notebook.toggle.diff.cell.ignoreTrimWhitespace",title:p("ignoreTrimWhitespace.label","Show Leading/Trailing Whitespace Differences"),icon:J,f1:!1,menu:{id:u.NotebookDiffCellInputTitle,when:b,order:1},precondition:b,toggled:t.equals(H,!1)})}run(n,e){const o=e?.cell;if(!o?.modified)return;const i=o.modified.uri,r=n.get(V),d="diffEditor.ignoreTrimWhitespace",f=r.getValue(i,d);r.updateValue(i,d,!f)}}),l(class extends c{constructor(){super({id:"notebook.diff.cell.revertInput",title:F,icon:T,f1:!1,menu:{id:u.NotebookDiffCellInputTitle,when:b,order:2},precondition:b})}run(n,e){if(!e)return;const o=e.cell.original,i=e.cell.modified;return!o||!i?void 0:n.get(M).apply([new q(i.uri,{range:i.textModel.getFullModelRange(),text:o.textModel.getValue()})],{quotableLabel:"Revert Notebook Cell Content Change"})}});class P extends c{constructor(o,i,r,d,f,g,I){super({id:o,title:i,precondition:r,menu:[{id:u.EditorTitle,group:"notebook",when:r,order:f}],toggled:d});this.toggleOutputs=g;this.toggleMetadata=I}async run(o){const i=o.get(K);if(this.toggleOutputs!==void 0){const r=i.getValue("notebook.diff.ignoreOutputs");i.updateValue("notebook.diff.ignoreOutputs",!r)}if(this.toggleMetadata!==void 0){const r=i.getValue("notebook.diff.ignoreMetadata");i.updateValue("notebook.diff.ignoreMetadata",!r)}}}l(class extends P{constructor(){super("notebook.diff.showOutputs",v("notebook.diff.showOutputs","Show Outputs Differences"),t.or(s.isEqualTo(E.ID),s.isEqualTo(a.ID)),t.notEquals("config.notebook.diff.ignoreOutputs",!0),2,!0,void 0)}}),l(class extends P{constructor(){super("notebook.diff.showMetadata",v("notebook.diff.showMetadata","Show Metadata Differences"),t.or(s.isEqualTo(E.ID),s.isEqualTo(a.ID)),t.notEquals("config.notebook.diff.ignoreMetadata",!0),1,void 0,!0)}}),l(class extends c{constructor(){super({id:"notebook.diff.action.previous",title:p("notebook.diff.action.previous.title","Show Previous Change"),icon:j,f1:!1,keybinding:{primary:x.Shift|x.Alt|w.F3,weight:A.WorkbenchContrib,when:s.isEqualTo(E.ID)},menu:{id:u.EditorTitle,group:"navigation",when:s.isEqualTo(E.ID)}})}run(n){const e=n.get(m);if(e.activeEditorPane?.getId()!==_)return;e.activeEditorPane.getControl()?.previousChange()}}),l(class extends c{constructor(){super({id:"notebook.diff.action.next",title:p("notebook.diff.action.next.title","Show Next Change"),icon:Y,f1:!1,keybinding:{primary:x.Alt|w.F3,weight:A.WorkbenchContrib,when:s.isEqualTo(E.ID)},menu:{id:u.EditorTitle,group:"navigation",when:s.isEqualTo(E.ID)}})}run(n){const e=n.get(m);if(e.activeEditorPane?.getId()!==_)return;e.activeEditorPane.getControl()?.nextChange()}}),L.as(B.Configuration).registerConfiguration({id:"notebook",order:100,type:"object",properties:{"notebook.diff.ignoreMetadata":{type:"boolean",default:!1,markdownDescription:p("notebook.diff.ignoreMetadata","Hide Metadata Differences")},"notebook.diff.ignoreOutputs":{type:"boolean",default:!1,markdownDescription:p("notebook.diff.ignoreOutputs","Hide Outputs Differences")}}});