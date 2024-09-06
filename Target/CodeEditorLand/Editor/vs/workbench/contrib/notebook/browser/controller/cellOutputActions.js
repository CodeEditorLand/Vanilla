import"../../../../../../vs/editor/browser/editorExtensions.js";import{localize as n}from"../../../../../../vs/nls.js";import{Action2 as p,MenuId as f,registerAction2 as c}from"../../../../../../vs/platform/actions/common/actions.js";import{IClipboardService as b}from"../../../../../../vs/platform/clipboard/common/clipboardService.js";import{ContextKeyExpr as E}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{ILogService as k}from"../../../../../../vs/platform/log/common/log.js";import{IOpenerService as V}from"../../../../../../vs/platform/opener/common/opener.js";import{copyCellOutput as C}from"../../../../../../vs/workbench/contrib/notebook/browser/contrib/clipboard/cellOutputClipboard.js";import{NOTEBOOK_ACTIONS_CATEGORY as s}from"../../../../../../vs/workbench/contrib/notebook/browser/controller/coreActions.js";import{getNotebookEditorFromEditorPane as O}from"../../../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import*as m from"../../../../../../vs/workbench/contrib/notebook/browser/notebookIcons.js";import"../../../../../../vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel.js";import{CellKind as I,CellUri as g}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS as v,NOTEBOOK_CELL_HAS_OUTPUTS as M}from"../../../../../../vs/workbench/contrib/notebook/common/notebookContextKeys.js";import{IEditorService as w}from"../../../../../../vs/workbench/services/editor/common/editorService.js";const A="notebook.cellOutput.copy";c(class extends p{constructor(){super({id:"notebook.cellOuput.showEmptyOutputs",title:n("notebookActions.showAllOutput","Show empty outputs"),menu:{id:f.NotebookOutputToolbar,when:E.and(M,v)},f1:!1,category:s})}run(i,e){const t=e.cell;if(t&&t.cellKind===I.Code)for(let o=1;o<t.outputsViewModels.length;o++)t.outputsViewModels[o].visible.get()||(t.outputsViewModels[o].setVisible(!0,!0),t.updateOutputHeight(o,1,"command"))}}),c(class extends p{constructor(){super({id:A,title:n("notebookActions.copyOutput","Copy Cell Output"),menu:{id:f.NotebookOutputToolbar,when:M},category:s,icon:m.copyIcon})}getNoteboookEditor(i,e){return e&&"notebookEditor"in e?e.notebookEditor:O(i.activeEditorPane)}async run(i,e){const t=this.getNoteboookEditor(i.get(w),e);if(!t)return;let o;if(e&&"outputId"in e&&typeof e.outputId=="string"?o=a(e.outputId,t):e&&"outputViewModel"in e&&(o=e.outputViewModel),!o){const l=t.getActiveCell();if(!l)return;l.focusedOutputId!==void 0?o=l.outputsViewModels.find(d=>d.model.outputId===l.focusedOutputId):o=l.outputsViewModels.find(d=>d.pickedMimeType?.isTrusted)}if(!o)return;const u=o.pickedMimeType?.mimeType;if(u?.startsWith("image/")){const l={skipReveal:!0,outputId:o.model.outputId,altOutputId:o.model.alternativeOutputId};await t.focusNotebookCell(o.cellViewModel,"output",l),t.copyOutputImage(o)}else{const l=i.get(b),d=i.get(k);C(u,o,l,d)}}});function a(r,i){const e=i.getViewModel();if(e){const t=e.viewCells.filter(o=>o.cellKind===I.Code);for(const o of t){const u=o.outputsViewModels.find(l=>l.model.outputId===r||l.model.alternativeOutputId===r);if(u)return u}}}const N="notebook.cellOutput.openInTextEditor";c(class extends p{constructor(){super({id:N,title:n("notebookActions.openOutputInEditor","Open Cell Output in Text Editor"),f1:!1,category:s,icon:m.copyIcon})}getNoteboookEditor(i,e){return e&&"notebookEditor"in e?e.notebookEditor:O(i.activeEditorPane)}async run(i,e){const t=this.getNoteboookEditor(i.get(w),e);if(!t)return;let o;e&&"outputId"in e&&typeof e.outputId=="string"?o=a(e.outputId,t):e&&"outputViewModel"in e&&(o=e.outputViewModel);const u=i.get(V);o?.model.outputId&&t.textModel?.uri&&u.open(g.generateCellOutputUri(t.textModel.uri,o.model.outputId))}});export{A as COPY_OUTPUT_COMMAND_ID,N as OPEN_OUTPUT_COMMAND_ID};
