import{timeout as L}from"../../../../../../base/common/async.js";import{KeyCode as t,KeyMod as r}from"../../../../../../base/common/keyCodes.js";import{EditorExtensionsRegistry as T}from"../../../../../../editor/browser/editorExtensions.js";import{EditorContextKeys as u}from"../../../../../../editor/common/editorContextKeys.js";import{localize as a}from"../../../../../../nls.js";import{CONTEXT_ACCESSIBILITY_MODE_ENABLED as h}from"../../../../../../platform/accessibility/common/accessibility.js";import{Action2 as M,registerAction2 as d}from"../../../../../../platform/actions/common/actions.js";import{Extensions as R}from"../../../../../../platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as e}from"../../../../../../platform/contextkey/common/contextkey.js";import{InputFocusedContextKey as C}from"../../../../../../platform/contextkey/common/contextkeys.js";import{KeybindingWeight as l}from"../../../../../../platform/keybinding/common/keybindingsRegistry.js";import{Registry as B}from"../../../../../../platform/registry/common/platform.js";import{InlineChatController as k}from"../../../../inlineChat/browser/inlineChatController.js";import{CTX_NOTEBOOK_CHAT_OUTER_FOCUS_POSITION as y}from"../../controller/chat/notebookChatContext.js";import{NotebookAction as S,NotebookCellAction as m,NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT as f,findTargetCellEditor as P}from"../../controller/coreActions.js";import{CellEditState as I}from"../../notebookBrowser.js";import{CellKind as v,NOTEBOOK_EDITOR_CURSOR_BOUNDARY as A}from"../../../common/notebookCommon.js";import{NOTEBOOK_CELL_HAS_OUTPUTS as q,NOTEBOOK_CELL_MARKDOWN_EDIT_MODE as x,NOTEBOOK_CELL_TYPE as D,NOTEBOOK_CURSOR_NAVIGATION_MODE as U,NOTEBOOK_EDITOR_FOCUSED as c,NOTEBOOK_OUTPUT_INPUT_FOCUSED as W,NOTEBOOK_OUTPUT_FOCUSED as _,NOTEBOOK_CELL_EDITOR_FOCUSED as K}from"../../../common/notebookContextKeys.js";const G="notebook.focusTop",H="notebook.focusBottom",z="notebook.focusPreviousEditor",V="notebook.focusNextEditor",X="notebook.cell.focusInOutput",Y="notebook.cell.focusOutOutput",j="notebook.centerActiveCell",J="notebook.cell.cursorPageUp",Q="notebook.cell.cursorPageUpSelect",Z="notebook.cell.cursorPageDown",$="notebook.cell.cursorPageDownSelect";d(class extends M{constructor(){super({id:"notebook.cell.nullAction",title:a("notebook.cell.webviewHandledEvents","Keypresses that should be handled by the focused element in the cell output."),keybinding:[{when:W,primary:t.DownArrow,weight:l.WorkbenchContrib+1},{when:W,primary:t.UpArrow,weight:l.WorkbenchContrib+1}],f1:!1})}run(){}}),d(class extends m{constructor(){super({id:V,title:a("cursorMoveDown","Focus Next Cell Editor"),keybinding:[{when:e.and(c,h.negate(),e.equals("config.notebook.navigation.allowNavigateToSurroundingCells",!0),e.and(e.has(C),u.editorTextFocus,A.notEqualsTo("top"),A.notEqualsTo("none")),u.isEmbeddedDiffEditor.negate()),primary:t.DownArrow,weight:f},{when:e.and(c,h.negate(),e.equals("config.notebook.navigation.allowNavigateToSurroundingCells",!0),e.and(D.isEqualTo("markup"),x.isEqualTo(!1),U),u.isEmbeddedDiffEditor.negate()),primary:t.DownArrow,weight:l.WorkbenchContrib},{when:e.and(c,_),primary:r.CtrlCmd|t.DownArrow,mac:{primary:r.WinCtrl|r.CtrlCmd|t.DownArrow},weight:l.WorkbenchContrib},{when:e.and(K,h),primary:r.CtrlCmd|t.PageDown,mac:{primary:r.WinCtrl|t.PageUp},weight:l.WorkbenchContrib+1}]})}async runWithContext(n,o){const i=o.notebookEditor,O=o.cell,g=i.getCellIndex(O);if(typeof g!="number"||g>=i.getLength()-1)return;const E=O.textBuffer.getLineCount(),w=o.cell??o.selectedCells?.[0],b=w?P(o,w):void 0;if(b&&b.hasTextFocus()&&k.get(b)?.getWidgetPosition()?.lineNumber===E)k.get(b)?.focus();else{const p=i.cellAt(g+1),F=p.cellKind===v.Markup&&p.getEditState()===I.Preview?"container":"editor";await i.focusNotebookCell(p,F,{focusEditorLine:1})}}}),d(class extends m{constructor(){super({id:z,title:a("cursorMoveUp","Focus Previous Cell Editor"),keybinding:[{when:e.and(c,h.negate(),e.equals("config.notebook.navigation.allowNavigateToSurroundingCells",!0),e.and(e.has(C),u.editorTextFocus,A.notEqualsTo("bottom"),A.notEqualsTo("none")),u.isEmbeddedDiffEditor.negate()),primary:t.UpArrow,weight:f},{when:e.and(c,h.negate(),e.equals("config.notebook.navigation.allowNavigateToSurroundingCells",!0),e.and(D.isEqualTo("markup"),x.isEqualTo(!1),U),u.isEmbeddedDiffEditor.negate()),primary:t.UpArrow,weight:l.WorkbenchContrib},{when:e.and(K,h),primary:r.CtrlCmd|t.PageUp,mac:{primary:r.WinCtrl|t.PageUp},weight:l.WorkbenchContrib+1}]})}async runWithContext(n,o){const i=o.notebookEditor,O=o.cell,g=i.getCellIndex(O);if(typeof g!="number"||g<1||i.getLength()===0)return;const E=i.cellAt(g-1),w=E.cellKind===v.Markup&&E.getEditState()===I.Preview?"container":"editor",b=E.textBuffer.getLineCount();await i.focusNotebookCell(E,w,{focusEditorLine:b});const p=P(o,E);p&&k.get(p)?.getWidgetPosition()?.lineNumber===b&&k.get(p)?.focus()}}),d(class extends S{constructor(){super({id:G,title:a("focusFirstCell","Focus First Cell"),keybinding:[{when:e.and(c,e.not(C)),primary:r.CtrlCmd|t.Home,weight:l.WorkbenchContrib},{when:e.and(c,e.not(C),y.isEqualTo("")),mac:{primary:r.CtrlCmd|t.UpArrow},weight:l.WorkbenchContrib}]})}async runWithContext(s,n){const o=n.notebookEditor;if(o.getLength()===0)return;const i=o.cellAt(0);await o.focusNotebookCell(i,"container")}}),d(class extends S{constructor(){super({id:H,title:a("focusLastCell","Focus Last Cell"),keybinding:[{when:e.and(c,e.not(C)),primary:r.CtrlCmd|t.End,mac:void 0,weight:l.WorkbenchContrib},{when:e.and(c,e.not(C),y.isEqualTo("")),mac:{primary:r.CtrlCmd|t.DownArrow},weight:l.WorkbenchContrib}]})}async runWithContext(s,n){const o=n.notebookEditor;if(!o.hasModel()||o.getLength()===0)return;const i=o.getLength()-1,O=o.getPreviousVisibleCellIndex(i);if(O){const g=o.cellAt(O);await o.focusNotebookCell(g,"container")}}}),d(class extends m{constructor(){super({id:X,title:a("focusOutput","Focus In Active Cell Output"),keybinding:{when:e.and(c,q),primary:r.CtrlCmd|t.DownArrow,mac:{primary:r.WinCtrl|r.CtrlCmd|t.DownArrow},weight:l.WorkbenchContrib}})}async runWithContext(s,n){const o=n.notebookEditor,i=n.cell;return L(0).then(()=>o.focusNotebookCell(i,"output"))}}),d(class extends m{constructor(){super({id:Y,title:a("focusOutputOut","Focus Out Active Cell Output"),keybinding:{when:e.and(c,_),primary:r.CtrlCmd|t.UpArrow,mac:{primary:r.WinCtrl|r.CtrlCmd|t.UpArrow},weight:l.WorkbenchContrib}})}async runWithContext(s,n){const o=n.notebookEditor,i=n.cell;await o.focusNotebookCell(i,"editor")}}),d(class extends m{constructor(){super({id:j,title:a("notebookActions.centerActiveCell","Center Active Cell"),keybinding:{when:c,primary:r.CtrlCmd|t.KeyL,mac:{primary:r.WinCtrl|t.KeyL},weight:l.WorkbenchContrib}})}async runWithContext(n,o){return o.notebookEditor.revealInCenter(o.cell)}}),d(class extends m{constructor(){super({id:J,title:a("cursorPageUp","Cell Cursor Page Up"),keybinding:[{when:e.and(c,e.has(C),u.editorTextFocus),primary:t.PageUp,weight:f}]})}async runWithContext(s,n){T.getEditorCommand("cursorPageUp").runCommand(s,{pageSize:N(n)})}}),d(class extends m{constructor(){super({id:Q,title:a("cursorPageUpSelect","Cell Cursor Page Up Select"),keybinding:[{when:e.and(c,e.has(C),u.editorTextFocus,_.negate()),primary:r.Shift|t.PageUp,weight:f}]})}async runWithContext(s,n){T.getEditorCommand("cursorPageUpSelect").runCommand(s,{pageSize:N(n)})}}),d(class extends m{constructor(){super({id:Z,title:a("cursorPageDown","Cell Cursor Page Down"),keybinding:[{when:e.and(c,e.has(C),u.editorTextFocus),primary:t.PageDown,weight:f}]})}async runWithContext(s,n){T.getEditorCommand("cursorPageDown").runCommand(s,{pageSize:N(n)})}}),d(class extends m{constructor(){super({id:$,title:a("cursorPageDownSelect","Cell Cursor Page Down Select"),keybinding:[{when:e.and(c,e.has(C),u.editorTextFocus,_.negate()),primary:r.Shift|t.PageDown,weight:f}]})}async runWithContext(s,n){T.getEditorCommand("cursorPageDownSelect").runCommand(s,{pageSize:N(n)})}});function N(s){const o=s.notebookEditor.getViewModel().layoutInfo,i=o?.fontInfo.lineHeight||17;return Math.max(1,Math.floor((o?.height||0)/i)-2)}B.as(R.Configuration).registerConfiguration({id:"notebook",order:100,type:"object",properties:{"notebook.navigation.allowNavigateToSurroundingCells":{type:"boolean",default:!0,markdownDescription:a("notebook.navigation.allowNavigateToSurroundingCells","When enabled cursor can navigate to the next/previous cell when the current cursor in the cell editor is at the first/last line.")}}});export{j as CENTER_ACTIVE_CELL};
