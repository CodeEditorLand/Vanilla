var re=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var U=(n,e,o,t)=>{for(var i=t>1?void 0:t?se(e,o):e,r=n.length-1,s;r>=0;r--)(s=n[r])&&(i=(t?s(e,o,i):s(i))||i);return t&&i&&re(e,o,i),i},G=(n,e)=>(o,t)=>e(o,t,n);import{getActiveElement as M,getWindow as Y,isAncestor as ce,isHTMLElement as le}from"../../../../../../../vs/base/browser/dom.js";import{KeyCode as a,KeyMod as d}from"../../../../../../../vs/base/common/keyCodes.js";import{Disposable as de}from"../../../../../../../vs/base/common/lifecycle.js";import*as W from"../../../../../../../vs/base/common/platform.js";import{RedoCommand as ae,UndoCommand as ue}from"../../../../../../../vs/editor/browser/editorExtensions.js";import{CopyAction as L,CutAction as R,PasteAction as F}from"../../../../../../../vs/editor/contrib/clipboard/browser/clipboard.js";import{localize as x,localize2 as fe}from"../../../../../../../vs/nls.js";import{Categories as pe}from"../../../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as me,MenuId as D,registerAction2 as k}from"../../../../../../../vs/platform/actions/common/actions.js";import{IClipboardService as j}from"../../../../../../../vs/platform/clipboard/common/clipboardService.js";import{ICommandService as be}from"../../../../../../../vs/platform/commands/common/commands.js";import{ContextKeyExpr as f}from"../../../../../../../vs/platform/contextkey/common/contextkey.js";import{InputFocusedContextKey as N}from"../../../../../../../vs/platform/contextkey/common/contextkeys.js";import"../../../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as K}from"../../../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{ILogService as z}from"../../../../../../../vs/platform/log/common/log.js";import{registerWorkbenchContribution2 as Ce,WorkbenchPhase as ge}from"../../../../../../../vs/workbench/common/contributions.js";import{CellOverflowToolbarGroups as P,NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT as ve,NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT as Ie,NotebookAction as ke,NotebookCellAction as O}from"../../../../../../../vs/workbench/contrib/notebook/browser/controller/coreActions.js";import{cellRangeToViewCells as X,expandCellRangesWithHiddenCells as $,getNotebookEditorFromEditorPane as q}from"../../../../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import{cloneNotebookCellTextModel as V}from"../../../../../../../vs/workbench/contrib/notebook/common/model/notebookCellTextModel.js";import{CellEditType as y,SelectionStateType as p}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{NOTEBOOK_CELL_EDITABLE as ye,NOTEBOOK_EDITOR_EDITABLE as J,NOTEBOOK_EDITOR_FOCUSED as C,NOTEBOOK_OUTPUT_FOCUSED as Se}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookContextKeys.js";import{INotebookService as w}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookService.js";import"../../../../../../../vs/workbench/contrib/webview/browser/webview.js";import{IEditorService as Q}from"../../../../../../../vs/workbench/services/editor/common/editorService.js";import{showWindowLogActionId as xe}from"../../../../../../../vs/workbench/services/log/common/logConstants.js";let _=!1;function we(){_=!_}function b(n,e){_&&n.info(`[NotebookClipboard]: ${e}`)}function Z(n){const e=n.get(z),o=n.get(Q),t=q(o.activeEditorPane);if(!t){b(e,"[Revive Webview] No notebook editor found for active editor pane, bypass");return}if(!t.hasEditorFocus()){b(e,"[Revive Webview] Notebook editor is not focused, bypass");return}if(!t.hasWebviewFocus()){b(e,"[Revive Webview] Notebook editor backlayer webview is not focused, bypass");return}const i=t.getViewModel();if(!(i&&i.viewCells.every(r=>!r.outputIsFocused&&!r.outputIsHovered)))return{editor:t,loggerService:e}}function Ee(n){const e=Z(n);if(!e)return;const o=e.editor.getInnerWebview();return b(e.loggerService,"[Revive Webview] Notebook editor backlayer webview is focused"),o}function E(n,e){const o=Ee(n);return o?(e(o),!0):!1}function he(n,e){const o=Z(n);return o?e(o.editor):!1}const h=105;ue.addImplementation(h,"notebook-webview",n=>E(n,e=>e.undo())),ae.addImplementation(h,"notebook-webview",n=>E(n,e=>e.redo())),L?.addImplementation(h,"notebook-webview",n=>E(n,e=>e.copy())),F?.addImplementation(h,"notebook-webview",n=>E(n,e=>e.paste())),R?.addImplementation(h,"notebook-webview",n=>E(n,e=>e.cut()));function ee(n,e,o){if(!n.hasModel())return!1;const t=n.textModel;if(n.isReadOnly)return!1;const i={kind:p.Index,focus:n.getFocus(),selections:n.getSelections()};if(e){const r=n.getCellIndex(e),s=typeof r=="number"?r+1:0;t.applyEdits([{editType:y.Replace,index:s,count:0,cells:o.items.map(c=>V(c))}],!0,i,()=>({kind:p.Index,focus:{start:s,end:s+1},selections:[{start:s,end:s+o.items.length}]}),void 0,!0)}else{if(n.getLength()!==0)return!1;t.applyEdits([{editType:y.Replace,index:0,count:0,cells:o.items.map(r=>V(r))}],!0,i,()=>({kind:p.Index,focus:{start:0,end:1},selections:[{start:1,end:o.items.length+1}]}),void 0,!0)}return!0}function te(n,e,o){if(!e.hasModel())return!1;if(e.hasOutputTextSelection())return Y(e.getDomNode()).document.execCommand("copy"),!0;const t=n.get(j),i=n.get(w),r=e.getSelections();if(o){const u=e.getCellIndex(o);if(!r.find(v=>v.start<=u&&u<v.end))return t.writeText(o.getText()),i.setToCopy([o.model],!0),!0}const s=$(e,e.getSelections()),c=X(e,s);return c.length?(t.writeText(c.map(u=>u.getText()).join(`
`)),i.setToCopy(c.map(u=>u.model),!0),!0):!1}function oe(n,e,o){if(!e.hasModel()||e.isReadOnly)return!1;const t=e.textModel,i=n.get(j),r=n.get(w),s=e.getSelections();if(o){const l=e.getCellIndex(o);if(!s.find(m=>m.start<=l&&l<m.end)){i.writeText(o.getText());const m=e.getFocus(),I=m.end<=l?m:{start:m.start-1,end:m.end-1},ie=s.map(A=>A.end<=l?A:{start:A.start-1,end:A.end-1});return t.applyEdits([{editType:y.Replace,index:l,count:1,cells:[]}],!0,{kind:p.Index,focus:e.getFocus(),selections:s},()=>({kind:p.Index,focus:I,selections:ie}),void 0,!0),r.setToCopy([o.model],!1),!0}}const c=e.getFocus();if(!s.find(l=>l.start<=c.start&&c.end<=l.end)){const l=e.cellAt(c.start);i.writeText(l.getText());const H=c.end===e.getLength()?{start:c.start-1,end:c.end-1}:c,m=s.map(I=>I.end<=c.start?I:{start:I.start-1,end:I.end-1});return t.applyEdits([{editType:y.Replace,index:c.start,count:1,cells:[]}],!0,{kind:p.Index,focus:e.getFocus(),selections:s},()=>({kind:p.Index,focus:H,selections:m}),void 0,!0),r.setToCopy([l.model],!1),!0}const g=$(e,e.getSelections()),v=X(e,g);if(!v.length)return!1;i.writeText(v.map(l=>l.getText()).join(`
`));const ne=g.map(l=>({editType:y.Replace,index:l.start,count:l.end-l.start,cells:[]})),B=g[0].start,T=B<t.cells.length-1?B:Math.max(t.cells.length-2,0);return t.applyEdits(ne,!0,{kind:p.Index,focus:e.getFocus(),selections:g},()=>({kind:p.Index,focus:{start:T,end:T+1},selections:[{start:T,end:T+1}]}),void 0,!0),r.setToCopy(v.map(l=>l.model),!1),!0}let S=class extends de{constructor(o){super();this._editorService=o;const t=105;L&&this._register(L.addImplementation(t,"notebook-clipboard",i=>this.runCopyAction(i))),F&&this._register(F.addImplementation(t,"notebook-clipboard",i=>this.runPasteAction(i))),R&&this._register(R.addImplementation(t,"notebook-clipboard",i=>this.runCutAction(i)))}static ID="workbench.contrib.notebookClipboard";_getContext(){const o=q(this._editorService.activeEditorPane),t=o?.getActiveCell();return{editor:o,activeCell:t}}_focusInsideEmebedMonaco(o){const t=Y(o.getDomNode()).getSelection();if(t?.rangeCount!==1)return!1;const i=t.getRangeAt(0);if(i.startContainer===i.endContainer&&i.endOffset-i.startOffset===0)return!1;let r=i.commonAncestorContainer;const s=o.getDomNode();if(!s.contains(r))return!1;for(;r&&r!==s;){if(r.classList&&r.classList.contains("monaco-editor"))return!0;r=r.parentNode}return!1}runCopyAction(o){const t=o.get(z),i=M();if(le(i)&&["input","textarea"].indexOf(i.tagName.toLowerCase())>=0)return b(t,"[NotebookEditor] focus is on input or textarea element, bypass"),!1;const{editor:r}=this._getContext();return r?ce(i,r.getDomNode())?this._focusInsideEmebedMonaco(r)?(b(t,"[NotebookEditor] focus is on embed monaco editor, bypass"),!1):(b(t,"[NotebookEditor] run copy actions on notebook model"),te(o,r,void 0)):(b(t,"[NotebookEditor] focus is outside of the notebook editor, bypass"),!1):(b(t,"[NotebookEditor] no active notebook editor, bypass"),!1)}runPasteAction(o){const t=M();if(t&&["input","textarea"].indexOf(t.tagName.toLowerCase())>=0)return!1;const r=o.get(w).getToCopy();if(!r)return!1;const{editor:s,activeCell:c}=this._getContext();return s?ee(s,c,r):!1}runCutAction(o){const t=M();if(t&&["input","textarea"].indexOf(t.tagName.toLowerCase())>=0)return!1;const{editor:i}=this._getContext();return i?oe(o,i,void 0):!1}};S=U([G(0,Q)],S),Ce(S.ID,S,ge.BlockRestore);const Te="notebook.cell.copy",Ae="notebook.cell.cut",Ne="notebook.cell.paste",Oe="notebook.cell.pasteAbove";k(class extends O{constructor(){super({id:Te,title:x("notebookActions.copy","Copy Cell"),menu:{id:D.NotebookCellTitle,when:C,group:P.Copy,order:2},keybinding:W.isNative?void 0:{primary:d.CtrlCmd|a.KeyC,win:{primary:d.CtrlCmd|a.KeyC,secondary:[d.CtrlCmd|a.Insert]},when:f.and(C,f.not(N)),weight:K.WorkbenchContrib}})}async runWithContext(n,e){te(n,e.notebookEditor,e.cell)}}),k(class extends O{constructor(){super({id:Ae,title:x("notebookActions.cut","Cut Cell"),menu:{id:D.NotebookCellTitle,when:f.and(C,J,ye),group:P.Copy,order:1},keybinding:W.isNative?void 0:{when:f.and(C,f.not(N)),primary:d.CtrlCmd|a.KeyX,win:{primary:d.CtrlCmd|a.KeyX,secondary:[d.Shift|a.Delete]},weight:K.WorkbenchContrib}})}async runWithContext(n,e){oe(n,e.notebookEditor,e.cell)}}),k(class extends ke{constructor(){super({id:Ne,title:x("notebookActions.paste","Paste Cell"),menu:{id:D.NotebookCellTitle,when:f.and(C,J),group:P.Copy,order:3},keybinding:W.isNative?void 0:{when:f.and(C,f.not(N)),primary:d.CtrlCmd|a.KeyV,win:{primary:d.CtrlCmd|a.KeyV,secondary:[d.Shift|a.Insert]},linux:{primary:d.CtrlCmd|a.KeyV,secondary:[d.Shift|a.Insert]},weight:K.EditorContrib}})}async runWithContext(n,e){const t=n.get(w).getToCopy();!e.notebookEditor.hasModel()||e.notebookEditor.isReadOnly||t&&ee(e.notebookEditor,e.cell,t)}}),k(class extends O{constructor(){super({id:Oe,title:x("notebookActions.pasteAbove","Paste Cell Above"),keybinding:{when:f.and(C,f.not(N)),primary:d.CtrlCmd|d.Shift|a.KeyV,weight:ve}})}async runWithContext(n,e){const t=n.get(w).getToCopy(),i=e.notebookEditor,r=i.textModel;if(i.isReadOnly||!t)return;const s={kind:p.Index,focus:i.getFocus(),selections:i.getSelections()},c=e.notebookEditor.getCellIndex(e.cell),u=c;r.applyEdits([{editType:y.Replace,index:c,count:0,cells:t.items.map(g=>V(g))}],!0,s,()=>({kind:p.Index,focus:{start:u,end:u+1},selections:[{start:u,end:u+t.items.length}]}),void 0,!0)}}),k(class extends me{constructor(){super({id:"workbench.action.toggleNotebookClipboardLog",title:fe("toggleNotebookClipboardLog","Toggle Notebook Clipboard Troubleshooting"),category:pe.Developer,f1:!0})}run(n){we(),_&&n.get(be).executeCommand(xe)}}),k(class extends O{constructor(){super({id:"notebook.cell.output.selectAll",title:x("notebook.cell.output.selectAll","Select All"),keybinding:{primary:d.CtrlCmd|a.KeyA,when:f.and(C,Se),weight:Ie}})}async runWithContext(n,e){he(n,o=>{if(!o.hasEditorFocus())return!1;if(o.hasEditorFocus()&&!o.hasWebviewFocus())return!0;const t=o.getActiveCell();return!t||!t.outputIsFocused||!o.hasWebviewFocus()||(t.inputInOutputIsFocused?o.selectInputContents(t):o.selectOutputContent(t)),!0})}});export{S as NotebookClipboardContribution,te as runCopyCells,oe as runCutCells,ee as runPasteCells};
