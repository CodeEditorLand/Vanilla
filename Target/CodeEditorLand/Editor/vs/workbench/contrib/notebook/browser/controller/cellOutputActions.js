import"../../../../../editor/browser/editorExtensions.js";import{localize as n}from"../../../../../nls.js";import{Action2 as p,MenuId as f,registerAction2 as c}from"../../../../../platform/actions/common/actions.js";import{IClipboardService as b}from"../../../../../platform/clipboard/common/clipboardService.js";import{IOpenerService as E}from"../../../../../platform/opener/common/opener.js";import{NOTEBOOK_ACTIONS_CATEGORY as s}from"./coreActions.js";import{NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS as k,NOTEBOOK_CELL_HAS_OUTPUTS as O}from"../../common/notebookContextKeys.js";import*as m from"../notebookIcons.js";import{ILogService as V}from"../../../../../platform/log/common/log.js";import{copyCellOutput as C}from"../contrib/clipboard/cellOutputClipboard.js";import{IEditorService as I}from"../../../../services/editor/common/editorService.js";import{getNotebookEditorFromEditorPane as M}from"../notebookBrowser.js";import{CellKind as w,CellUri as g}from"../../common/notebookCommon.js";import"../viewModel/codeCellViewModel.js";import{ContextKeyExpr as v}from"../../../../../platform/contextkey/common/contextkey.js";const A="notebook.cellOutput.copy";c(class extends p{constructor(){super({id:"notebook.cellOuput.showEmptyOutputs",title:n("notebookActions.showAllOutput","Show empty outputs"),menu:{id:f.NotebookOutputToolbar,when:v.and(O,k)},f1:!1,category:s})}run(i,e){const t=e.cell;if(t&&t.cellKind===w.Code)for(let o=1;o<t.outputsViewModels.length;o++)t.outputsViewModels[o].visible.get()||(t.outputsViewModels[o].setVisible(!0,!0),t.updateOutputHeight(o,1,"command"))}}),c(class extends p{constructor(){super({id:A,title:n("notebookActions.copyOutput","Copy Cell Output"),menu:{id:f.NotebookOutputToolbar,when:O},category:s,icon:m.copyIcon})}getNoteboookEditor(i,e){return e&&"notebookEditor"in e?e.notebookEditor:M(i.activeEditorPane)}async run(i,e){const t=this.getNoteboookEditor(i.get(I),e);if(!t)return;let o;if(e&&"outputId"in e&&typeof e.outputId=="string"?o=a(e.outputId,t):e&&"outputViewModel"in e&&(o=e.outputViewModel),!o){const l=t.getActiveCell();if(!l)return;l.focusedOutputId!==void 0?o=l.outputsViewModels.find(d=>d.model.outputId===l.focusedOutputId):o=l.outputsViewModels.find(d=>d.pickedMimeType?.isTrusted)}if(!o)return;const u=o.pickedMimeType?.mimeType;if(u?.startsWith("image/")){const l={skipReveal:!0,outputId:o.model.outputId,altOutputId:o.model.alternativeOutputId};await t.focusNotebookCell(o.cellViewModel,"output",l),t.copyOutputImage(o)}else{const l=i.get(b),d=i.get(V);C(u,o,l,d)}}});function a(r,i){const e=i.getViewModel();if(e){const t=e.viewCells.filter(o=>o.cellKind===w.Code);for(const o of t){const u=o.outputsViewModels.find(l=>l.model.outputId===r||l.model.alternativeOutputId===r);if(u)return u}}}const N="notebook.cellOutput.openInTextEditor";c(class extends p{constructor(){super({id:N,title:n("notebookActions.openOutputInEditor","Open Cell Output in Text Editor"),f1:!1,category:s,icon:m.copyIcon})}getNoteboookEditor(i,e){return e&&"notebookEditor"in e?e.notebookEditor:M(i.activeEditorPane)}async run(i,e){const t=this.getNoteboookEditor(i.get(I),e);if(!t)return;let o;e&&"outputId"in e&&typeof e.outputId=="string"?o=a(e.outputId,t):e&&"outputViewModel"in e&&(o=e.outputViewModel);const u=i.get(E);o?.model.outputId&&t.textModel?.uri&&u.open(g.generateCellOutputUri(t.textModel.uri,o.model.outputId))}});export{A as COPY_OUTPUT_COMMAND_ID,N as OPEN_OUTPUT_COMMAND_ID};
