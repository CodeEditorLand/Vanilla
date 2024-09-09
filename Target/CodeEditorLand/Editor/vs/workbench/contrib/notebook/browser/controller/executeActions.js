import{Iterable as G}from"../../../../../base/common/iterator.js";import{KeyCode as w,KeyMod as A}from"../../../../../base/common/keyCodes.js";import{isEqual as ie}from"../../../../../base/common/resources.js";import{ThemeIcon as U}from"../../../../../base/common/themables.js";import"../../../../../base/common/uri.js";import"../../../../../editor/browser/editorBrowser.js";import{ILanguageService as D}from"../../../../../editor/common/languages/language.js";import{localize as c,localize2 as q}from"../../../../../nls.js";import{MenuId as s,MenuRegistry as re,registerAction2 as a}from"../../../../../platform/actions/common/actions.js";import{IConfigurationService as le}from"../../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as t}from"../../../../../platform/contextkey/common/contextkey.js";import"../../../../../platform/instantiation/common/instantiation.js";import{EditorsOrder as ce}from"../../../../common/editor.js";import{IDebugService as se}from"../../../debug/common/debug.js";import{CTX_INLINE_CHAT_FOCUSED as P}from"../../../inlineChat/common/inlineChat.js";import{insertCell as h}from"./cellOperations.js";import{CTX_NOTEBOOK_CELL_CHAT_FOCUSED as de}from"./chat/notebookChatContext.js";import{NotebookChatController as ae}from"./chat/notebookChatController.js";import{CELL_TITLE_CELL_GROUP_ID as W,CellToolbarOrder as X,NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT as R,NotebookAction as v,NotebookCellAction as H,NotebookMultiCellAction as I,cellExecutionArgs as V,executeNotebookCondition as $,getContextFromActiveEditor as j,getContextFromUri as z,parseMultiCellExecutionArgs as T}from"./coreActions.js";import{CellEditState as y,CellFocusMode as ue,EXECUTE_CELL_COMMAND_ID as Ce,ScrollToRevealBehavior as Y}from"../notebookBrowser.js";import*as C from"../notebookIcons.js";import{CellKind as S,CellUri as Ee,NotebookSetting as _}from"../../common/notebookCommon.js";import{NOTEBOOK_CELL_EXECUTING as be,NOTEBOOK_CELL_EXECUTION_STATE as J,NOTEBOOK_CELL_LIST_FOCUSED as M,NOTEBOOK_CELL_TYPE as B,NOTEBOOK_HAS_RUNNING_CELL as N,NOTEBOOK_HAS_SOMETHING_RUNNING as b,NOTEBOOK_INTERRUPTIBLE_KERNEL as k,NOTEBOOK_IS_ACTIVE_EDITOR as g,NOTEBOOK_KERNEL_COUNT as ke,NOTEBOOK_KERNEL_SOURCE_COUNT as ge,NOTEBOOK_LAST_CELL_FAILED as F,NOTEBOOK_MISSING_KERNEL_EXTENSION as pe}from"../../common/notebookContextKeys.js";import{NotebookEditorInput as Ne}from"../../common/notebookEditorInput.js";import{INotebookExecutionStateService as Q}from"../../common/notebookExecutionStateService.js";import{IEditorGroupsService as O}from"../../../../services/editor/common/editorGroupsService.js";import{IEditorService as K}from"../../../../services/editor/common/editorService.js";const me="notebook.execute",fe="notebook.cancelExecution",Ae="notebook.interruptExecution",ve="notebook.cell.cancelExecution",Ie="notebook.cell.executeAndFocusContainer",Z="notebook.cell.executeAndSelectBelow",ee="notebook.cell.executeAndInsertBelow",Te="notebook.cell.executeCellAndBelow",Se="notebook.cell.executeCellsAbove",_e="notebook.renderAllMarkdownCells",Oe="notebook.revealRunningCell",xe="notebook.revealLastFailedCell",p=t.and(B.isEqualTo("code"),t.or(t.greater(ke.key,0),t.greater(ge.key,0),pe)),x=t.and(p,be.toNegated());function oe(d){for(let o=0;o<d.notebookEditor.getLength();o++){const e=d.notebookEditor.cellAt(o);e.cellKind===S.Markup&&e.updateEditState(y.Preview,"renderAllMarkdownCells")}}async function L(d,o){const e=d.activeGroup;if(e&&e.activeEditor&&e.pinEditor(e.activeEditor),o.ui&&o.cell){if(await o.notebookEditor.executeNotebookCells(G.single(o.cell)),o.autoReveal){const n=o.notebookEditor.getCellIndex(o.cell);o.notebookEditor.revealCellRangeInView({start:n,end:n+1})}}else if(o.selectedCells?.length||o.cell){const n=o.selectedCells?.length?o.selectedCells:[o.cell];await o.notebookEditor.executeNotebookCells(n);const r=n[0];if(r&&o.autoReveal){const l=o.notebookEditor.getCellIndex(r);o.notebookEditor.revealCellRangeInView({start:l,end:l+1})}}let i;for(const[,n]of o.notebookEditor.codeEditors)if(ie(n.getModel()?.uri,(o.cell??o.selectedCells?.[0])?.uri)){i=n;break}}a(class extends v{constructor(){super({id:_e,title:c("notebookActions.renderMarkdown","Render All Markdown Cells")})}async runWithContext(o,e){oe(e)}}),a(class extends v{constructor(){super({id:me,title:c("notebookActions.executeNotebook","Run All"),icon:C.executeAllIcon,metadata:{description:c("notebookActions.executeNotebook","Run All"),args:[{name:"uri",description:"The document uri"}]},menu:[{id:s.EditorTitle,order:-1,group:"navigation",when:t.and(g,$,t.or(k.toNegated(),b.toNegated()),t.notEquals("config.notebook.globalToolbar",!0))},{id:s.NotebookToolbar,order:-1,group:"navigation/execute",when:t.and($,t.or(k.toNegated(),b.toNegated()),t.and(b,k.toNegated())?.negate(),t.equals("config.notebook.globalToolbar",!0))}]})}getEditorContextFromArgsOrActive(o,e){return z(o,e)??j(o.get(K))}async runWithContext(o,e){oe(e);const n=o.get(K).getEditors(ce.MOST_RECENTLY_ACTIVE).find(l=>l.editor instanceof Ne&&l.editor.viewType===e.notebookEditor.textModel.viewType&&l.editor.resource.toString()===e.notebookEditor.textModel.uri.toString()),r=o.get(O);return n&&r.getGroup(n.groupId)?.pinEditor(n.editor),e.notebookEditor.executeNotebookCells()}}),a(class extends I{constructor(){super({id:Ce,precondition:x,title:c("notebookActions.execute","Execute Cell"),keybinding:{when:t.or(M,t.and(de,P)),primary:A.WinCtrl|w.Enter,win:{primary:A.CtrlCmd|A.Alt|w.Enter},weight:R},menu:{id:s.NotebookCellExecutePrimary,when:x,group:"inline"},metadata:{description:c("notebookActions.execute","Execute Cell"),args:V},icon:C.executeIcon})}parseArgs(o,...e){return T(o,...e)}async runWithContext(o,e){const i=o.get(O);e.ui&&await e.notebookEditor.focusNotebookCell(e.cell,"container",{skipReveal:!0});const n=ae.get(e.notebookEditor),r=n?.getEditingCell();if(n?.hasFocus()&&r){const l=i.activeGroup;l&&l.activeEditor&&l.pinEditor(l.activeEditor),await e.notebookEditor.executeNotebookCells([r]);return}await L(i,e)}}),a(class extends I{constructor(){super({id:Se,precondition:p,title:c("notebookActions.executeAbove","Execute Above Cells"),menu:[{id:s.NotebookCellExecute,when:t.and(p,t.equals(`config.${_.consolidatedRunButton}`,!0))},{id:s.NotebookCellTitle,order:X.ExecuteAboveCells,group:W,when:t.and(p,t.equals(`config.${_.consolidatedRunButton}`,!1))}],icon:C.executeAboveIcon})}parseArgs(o,...e){return T(o,...e)}async runWithContext(o,e){let i;if(e.ui?(i=e.notebookEditor.getCellIndex(e.cell),await e.notebookEditor.focusNotebookCell(e.cell,"container",{skipReveal:!0})):i=Math.min(...e.selectedCells.map(n=>e.notebookEditor.getCellIndex(n))),typeof i=="number"){const n={start:0,end:i},r=e.notebookEditor.getCellsInRange(n);e.notebookEditor.executeNotebookCells(r)}}}),a(class extends I{constructor(){super({id:Te,precondition:p,title:c("notebookActions.executeBelow","Execute Cell and Below"),menu:[{id:s.NotebookCellExecute,when:t.and(p,t.equals(`config.${_.consolidatedRunButton}`,!0))},{id:s.NotebookCellTitle,order:X.ExecuteCellAndBelow,group:W,when:t.and(p,t.equals(`config.${_.consolidatedRunButton}`,!1))}],icon:C.executeBelowIcon})}parseArgs(o,...e){return T(o,...e)}async runWithContext(o,e){let i;if(e.ui?(i=e.notebookEditor.getCellIndex(e.cell),await e.notebookEditor.focusNotebookCell(e.cell,"container",{skipReveal:!0})):i=Math.min(...e.selectedCells.map(n=>e.notebookEditor.getCellIndex(n))),typeof i=="number"){const n={start:i,end:e.notebookEditor.getLength()},r=e.notebookEditor.getCellsInRange(n);e.notebookEditor.executeNotebookCells(r)}}}),a(class extends I{constructor(){super({id:Ie,precondition:x,title:c("notebookActions.executeAndFocusContainer","Execute Cell and Focus Container"),metadata:{description:c("notebookActions.executeAndFocusContainer","Execute Cell and Focus Container"),args:V},icon:C.executeIcon})}parseArgs(o,...e){return T(o,...e)}async runWithContext(o,e){const i=o.get(O);if(e.ui)await e.notebookEditor.focusNotebookCell(e.cell,"container",{skipReveal:!0});else{const n=e.selectedCells[0];n&&await e.notebookEditor.focusNotebookCell(n,"container",{skipReveal:!0})}await L(i,e)}});const te=t.or(t.equals(J.key,"executing"),t.equals(J.key,"pending"));a(class extends I{constructor(){super({id:ve,precondition:te,title:c("notebookActions.cancel","Stop Cell Execution"),icon:C.stopIcon,menu:{id:s.NotebookCellExecutePrimary,when:te,group:"inline"},metadata:{description:c("notebookActions.cancel","Stop Cell Execution"),args:[{name:"options",description:"The cell range options",schema:{type:"object",required:["ranges"],properties:{ranges:{type:"array",items:[{type:"object",required:["start","end"],properties:{start:{type:"number"},end:{type:"number"}}}]},document:{type:"object",description:"The document uri"}}}}]}})}parseArgs(o,...e){return T(o,...e)}async runWithContext(o,e){return e.ui?(await e.notebookEditor.focusNotebookCell(e.cell,"container",{skipReveal:!0}),e.notebookEditor.cancelNotebookCells(G.single(e.cell))):e.notebookEditor.cancelNotebookCells(e.selectedCells)}}),a(class extends H{constructor(){super({id:Z,precondition:t.or(x,B.isEqualTo("markup")),title:c("notebookActions.executeAndSelectBelow","Execute Notebook Cell and Select Below"),keybinding:{when:t.and(M,P.negate()),primary:A.Shift|w.Enter,weight:R}})}async runWithContext(o,e){const i=o.get(O),n=e.notebookEditor.getCellIndex(e.cell);if(typeof n!="number")return;const r=o.get(D),u=o.get(le).getValue(_.scrollToRevealCell);let E;if(u==="none"?E={skipReveal:!0}:E={revealBehavior:u==="fullCell"?Y.fullCell:Y.firstLine},e.cell.cellKind===S.Markup){const m=e.notebookEditor.cellAt(n+1);if(e.cell.updateEditState(y.Preview,Z),m)await e.notebookEditor.focusNotebookCell(m,"container",E);else{const f=h(r,e.notebookEditor,n,S.Markup,"below");f&&await e.notebookEditor.focusNotebookCell(f,"editor",E)}return}else{const m=e.notebookEditor.cellAt(n+1);if(m)await e.notebookEditor.focusNotebookCell(m,"container",E);else{const f=h(r,e.notebookEditor,n,S.Code,"below");f&&await e.notebookEditor.focusNotebookCell(f,"editor",E)}return L(i,e)}}}),a(class extends H{constructor(){super({id:ee,precondition:t.or(x,B.isEqualTo("markup")),title:c("notebookActions.executeAndInsertBelow","Execute Notebook Cell and Insert Below"),keybinding:{when:M,primary:A.Alt|w.Enter,weight:R}})}async runWithContext(o,e){const i=o.get(O),n=e.notebookEditor.getCellIndex(e.cell),r=o.get(D),l=e.cell.focusMode===ue.Editor?"editor":"container",u=h(r,e.notebookEditor,n,e.cell.cellKind,"below");u&&await e.notebookEditor.focusNotebookCell(u,l),e.cell.cellKind===S.Markup?e.cell.updateEditState(y.Preview,ee):L(i,e)}});class ne extends v{getEditorContextFromArgsOrActive(o,e){return z(o,e)??j(o.get(K))}async runWithContext(o,e){return e.notebookEditor.cancelNotebookCells()}}a(class extends ne{constructor(){super({id:fe,title:q("notebookActions.cancelNotebook","Stop Execution"),icon:C.stopIcon,menu:[{id:s.EditorTitle,order:-1,group:"navigation",when:t.and(g,b,k.toNegated(),t.notEquals("config.notebook.globalToolbar",!0))},{id:s.NotebookToolbar,order:-1,group:"navigation/execute",when:t.and(b,k.toNegated(),t.equals("config.notebook.globalToolbar",!0))}]})}}),a(class extends ne{constructor(){super({id:Ae,title:q("notebookActions.interruptNotebook","Interrupt"),precondition:t.and(b,k),icon:C.stopIcon,menu:[{id:s.EditorTitle,order:-1,group:"navigation",when:t.and(g,b,k,t.notEquals("config.notebook.globalToolbar",!0))},{id:s.NotebookToolbar,order:-1,group:"navigation/execute",when:t.and(b,k,t.equals("config.notebook.globalToolbar",!0))},{id:s.InteractiveToolbar,group:"navigation/execute"}]})}}),re.appendMenuItem(s.NotebookToolbar,{title:c("revealRunningCellShort","Go To"),submenu:s.NotebookCellExecuteGoTo,group:"navigation/execute",order:20,icon:U.modify(C.executingStateIcon,"spin")}),a(class extends v{constructor(){super({id:Oe,title:c("revealRunningCell","Go to Running Cell"),tooltip:c("revealRunningCell","Go to Running Cell"),shortTitle:c("revealRunningCell","Go to Running Cell"),precondition:N,menu:[{id:s.EditorTitle,when:t.and(g,N,t.notEquals("config.notebook.globalToolbar",!0)),group:"navigation",order:0},{id:s.NotebookCellExecuteGoTo,when:t.and(g,N,t.equals("config.notebook.globalToolbar",!0)),group:"navigation/execute",order:20},{id:s.InteractiveToolbar,when:t.and(N,t.equals("activeEditor","workbench.editor.interactive")),group:"navigation",order:10}],icon:U.modify(C.executingStateIcon,"spin")})}async runWithContext(o,e){const i=o.get(Q),n=e.notebookEditor.textModel.uri,r=i.getCellExecutionsForNotebook(n);if(r[0]){const u=this.findCellAtTopFrame(o,n)??r[0].cellHandle,E=e.notebookEditor.getCellByHandle(u);E&&e.notebookEditor.focusNotebookCell(E,"container")}}findCellAtTopFrame(o,e){const i=o.get(se);for(const n of i.getModel().getSessions())for(const r of n.getAllThreads()){const l=r.getTopStackFrame();if(l){const u=Ee.parse(l.source.uri);if(u&&u.notebook.toString()===e.toString())return u.handle}}}}),a(class extends v{constructor(){super({id:xe,title:c("revealLastFailedCell","Go to Most Recently Failed Cell"),tooltip:c("revealLastFailedCell","Go to Most Recently Failed Cell"),shortTitle:c("revealLastFailedCellShort","Go to Most Recently Failed Cell"),precondition:F,menu:[{id:s.EditorTitle,when:t.and(g,F,N.toNegated(),t.notEquals("config.notebook.globalToolbar",!0)),group:"navigation",order:0},{id:s.NotebookCellExecuteGoTo,when:t.and(g,F,N.toNegated(),t.equals("config.notebook.globalToolbar",!0)),group:"navigation/execute",order:20}],icon:C.errorStateIcon})}async runWithContext(o,e){const i=o.get(Q),n=e.notebookEditor.textModel.uri,r=i.getLastFailedCellForNotebook(n);if(r!==void 0){const l=e.notebookEditor.getCellByHandle(r);l&&e.notebookEditor.focusNotebookCell(l,"container")}}});export{p as executeCondition,x as executeThisCellCondition};
