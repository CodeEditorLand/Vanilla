var V=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var b=(d,s,e,t)=>{for(var o=t>1?void 0:t?_(s,e):s,i=d.length-1,r;i>=0;i--)(r=d[i])&&(o=(t?r(s,e,o):r(o))||o);return t&&o&&V(s,e,o),o},u=(d,s)=>(e,t)=>s(e,t,d);import{Emitter as O}from"../../../../../../base/common/event.js";import{KeyCode as M,KeyMod as W}from"../../../../../../base/common/keyCodes.js";import{Disposable as R,DisposableStore as N}from"../../../../../../base/common/lifecycle.js";import{ResourceMap as D}from"../../../../../../base/common/map.js";import{EditorConfiguration as B}from"../../../../../../editor/browser/config/editorConfiguration.js";import{RedoCommand as K,UndoCommand as U}from"../../../../../../editor/browser/editorExtensions.js";import{CodeEditorWidget as T}from"../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";import{Selection as v,SelectionDirection as P}from"../../../../../../editor/common/core/selection.js";import{USUAL_WORD_SEPARATORS as F}from"../../../../../../editor/common/core/wordHelper.js";import{CommandExecutor as j,CursorsController as H}from"../../../../../../editor/common/cursor/cursor.js";import{DeleteOperations as q}from"../../../../../../editor/common/cursor/cursorDeleteOperations.js";import{CursorConfiguration as z}from"../../../../../../editor/common/cursorCommon.js";import{CursorChangeReason as E}from"../../../../../../editor/common/cursorEvents.js";import{ILanguageConfigurationService as X}from"../../../../../../editor/common/languages/languageConfigurationRegistry.js";import{indentOfLine as Y}from"../../../../../../editor/common/model/textModel.js";import{ITextModelService as Z}from"../../../../../../editor/common/services/resolverService.js";import{ViewModelEventsCollector as S}from"../../../../../../editor/common/viewModelEventDispatcher.js";import{localize as w}from"../../../../../../nls.js";import{IAccessibilityService as G}from"../../../../../../platform/accessibility/common/accessibility.js";import{MenuId as J,registerAction2 as I}from"../../../../../../platform/actions/common/actions.js";import{IConfigurationService as A}from"../../../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as c,IContextKeyService as Q,RawContextKey as L}from"../../../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as k}from"../../../../../../platform/keybinding/common/keybindingsRegistry.js";import{IUndoRedoService as $,UndoRedoElementType as ee}from"../../../../../../platform/undoRedo/common/undoRedo.js";import{WorkbenchPhase as te,registerWorkbenchContribution2 as oe}from"../../../../../common/contributions.js";import{IEditorService as g}from"../../../../../services/editor/common/editorService.js";import{NOTEBOOK_CELL_EDITOR_FOCUSED as ie,NOTEBOOK_IS_ACTIVE_EDITOR as p}from"../../../common/notebookContextKeys.js";import{NotebookAction as y}from"../../controller/coreActions.js";import{getNotebookEditorFromEditorPane as C}from"../../notebookBrowser.js";import{registerNotebookContribution as re}from"../../notebookEditorExtensions.js";import{CellEditorOptions as ne}from"../../view/cellParts/cellEditorOptions.js";const se="notebook.addFindMatchToSelection";var le=(t=>(t[t.Idle=0]="Idle",t[t.Selecting=1]="Selecting",t[t.Editing=2]="Editing",t))(le||{});const h={IsNotebookMultiSelect:new L("isNotebookMultiSelect",!1),NotebookMultiSelectState:new L("notebookMultiSelectState",0)};let a=class extends R{constructor(e,t,o,i,r,n,l){super();this.notebookEditor=e;this.contextKeyService=t;this.textModelService=o;this.languageConfigurationService=i;this.accessibilityService=r;this.configurationService=n;this.undoRedoService=l;this.configurationService.getValue("notebook.multiSelect.enabled")&&(this.anchorCell=this.notebookEditor.activeCellAndCodeEditor,this._register(this.onDidChangeAnchorCell(()=>{this.updateCursorsControllers(),this.updateAnchorListeners()})))}static id="notebook.multiCursorController";state=0;word="";trackedMatches=[];_onDidChangeAnchorCell=this._register(new O);onDidChangeAnchorCell=this._onDidChangeAnchorCell.event;anchorCell;anchorDisposables=this._register(new N);cursorsDisposables=this._register(new N);cursorsControllers=new D;_nbIsMultiSelectSession=h.IsNotebookMultiSelect.bindTo(this.contextKeyService);_nbMultiSelectState=h.NotebookMultiSelectState.bindTo(this.contextKeyService);updateCursorsControllers(){this.cursorsDisposables.clear(),this.trackedMatches.forEach(async e=>{const o=(await this.textModelService.createModelReference(e.cellViewModel.uri)).object.textEditorModel;if(!o)return;const i=this.constructCursorSimpleModel(e.cellViewModel),r=this.constructCoordinatesConverter(),n=e.config,l=this.cursorsDisposables.add(new H(o,i,r,new z(o.getLanguageId(),o.getOptions(),n,this.languageConfigurationService)));l.setSelections(new S,void 0,e.wordSelections,E.Explicit),this.cursorsControllers.set(e.cellViewModel.uri,l)})}constructCoordinatesConverter(){return{convertViewPositionToModelPosition(e){return e},convertViewRangeToModelRange(e){return e},validateViewPosition(e,t){return e},validateViewRange(e,t){return e},convertModelPositionToViewPosition(e,t,o,i){return e},convertModelRangeToViewRange(e,t){return e},modelPositionIsVisible(e){return!0},getModelLineViewLineCount(e){return 1},getViewLineNumberOfModelPosition(e,t){return e}}}constructCursorSimpleModel(e){return{getLineCount(){return e.textBuffer.getLineCount()},getLineContent(t){return e.textBuffer.getLineContent(t)},getLineMinColumn(t){return e.textBuffer.getLineMinColumn(t)},getLineMaxColumn(t){return e.textBuffer.getLineMaxColumn(t)},getLineFirstNonWhitespaceColumn(t){return e.textBuffer.getLineFirstNonWhitespaceColumn(t)},getLineLastNonWhitespaceColumn(t){return e.textBuffer.getLineLastNonWhitespaceColumn(t)},normalizePosition(t,o){return t},getLineIndentColumn(t){return Y(e.textBuffer.getLineContent(t))+1}}}updateAnchorListeners(){if(this.anchorDisposables.clear(),!this.anchorCell)throw new Error("Anchor cell is undefined");this.anchorDisposables.add(this.anchorCell[1].onWillType(e=>{const t=new S;this.trackedMatches.forEach(o=>{const i=this.cursorsControllers.get(o.cellViewModel.uri);i&&o.cellViewModel.handle!==this.anchorCell?.[0].handle&&i.type(t,e,"keyboard")})})),this.anchorDisposables.add(this.anchorCell[1].onDidType(()=>{this.state=2,this._nbMultiSelectState.set(2);const e=this.cursorsControllers.get(this.anchorCell[0].uri);if(!e)return;const t=this.notebookEditor.activeCodeEditor?.getSelections();t&&(e.setSelections(new S,"keyboard",t,E.Explicit),this.trackedMatches.forEach(o=>{const i=this.cursorsControllers.get(o.cellViewModel.uri);i&&(o.initialSelection=i.getSelection(),o.wordSelections=[])}),this.updateLazyDecorations())})),this.anchorDisposables.add(this.anchorCell[1].onDidChangeCursorSelection(e=>{(e.source==="mouse"||e.source==="deleteRight")&&this.resetToIdleState()})),this.anchorDisposables.add(this.anchorCell[1].onDidBlurEditorWidget(()=>{(this.state===1||this.state===2)&&this.resetToIdleState()}))}updateFinalUndoRedo(){if(!this.anchorCell?.[1].getModel())return;const t=new D,o=[];this.trackedMatches.forEach(i=>{if(!i.undoRedoHistory)return;o.push(i.cellViewModel.uri);const n=this.undoRedoService.getElements(i.cellViewModel.uri).past.slice(),l=i.undoRedoHistory.past.slice(),f=n.slice(l.length);f.length!==0&&(t.set(i.cellViewModel.uri,f),this.undoRedoService.removeElements(i.cellViewModel.uri),l.forEach(x=>{this.undoRedoService.pushElement(x)}))}),this.undoRedoService.pushElement({type:ee.Workspace,resources:o,label:"Multi Cursor Edit",code:"multiCursorEdit",confirmBeforeUndo:!1,undo:async()=>{t.forEach(async i=>{i.reverse().forEach(async r=>{await r.undo()})})},redo:async()=>{t.forEach(async i=>{i.forEach(async r=>{await r.redo()})})}})}resetToIdleState(){this.state=0,this._nbMultiSelectState.set(0),this._nbIsMultiSelectSession.set(!1),this.updateFinalUndoRedo(),this.trackedMatches.forEach(e=>{this.clearDecorations(e),e.cellViewModel.setSelections([e.initialSelection])}),this.anchorDisposables.clear(),this.cursorsDisposables.clear(),this.cursorsControllers.clear(),this.trackedMatches=[]}async findAndTrackNextSelection(e){if(this.state===0){const t=e.textModel;if(!t)return;const o=e.getSelections()[0],i=this.getWord(o,t);if(!i)return;this.word=i.word;const r=new v(o.startLineNumber,i.startColumn,o.startLineNumber,i.endColumn);if(e.setSelections([r]),this.anchorCell=this.notebookEditor.activeCellAndCodeEditor,!this.anchorCell||this.anchorCell[0].handle!==e.handle)throw new Error("Active cell is not the same as the cell passed as context");if(!(this.anchorCell[1]instanceof T))throw new Error("Active cell is not an instance of CodeEditorWidget");t.pushStackElement(),this.trackedMatches=[];const n=this.constructCellEditorOptions(this.anchorCell[0]),l={cellViewModel:e,initialSelection:o,wordSelections:[r],config:n,decorationIds:[],undoRedoHistory:this.undoRedoService.getElements(e.uri)};this.trackedMatches.push(l),this.initializeMultiSelectDecorations(l),this._nbIsMultiSelectSession.set(!0),this.state=1,this._nbMultiSelectState.set(1),this._onDidChangeAnchorCell.fire()}else if(this.state===1){const t=this.notebookEditor.textModel;if(!t)return;const o=this.notebookEditor.getCellIndex(e);if(o===void 0)return;const i=t.findNextMatch(this.word,{cellIndex:o,position:e.getSelections()[e.getSelections().length-1].getEndPosition()},!1,!0,F);if(!i)return;const r=this.notebookEditor.getCellByHandle(i.cell.handle);if(!r)return;let n;if(i.cell.handle!==e.handle){await this.notebookEditor.revealRangeInViewAsync(r,i.match.range),this.notebookEditor.focusNotebookCell(r,"editor");const l=r.getSelections()[0],f=v.fromRange(i.match.range,P.LTR);if(r.setSelections([f]),this.anchorCell=this.notebookEditor.activeCellAndCodeEditor,!this.anchorCell||!(this.anchorCell[1]instanceof T))throw new Error("Active cell is not an instance of CodeEditorWidget");(await r.resolveTextModel()).pushStackElement(),n={cellViewModel:r,initialSelection:l,wordSelections:[f],config:this.constructCellEditorOptions(this.anchorCell[0]),decorationIds:[],undoRedoHistory:this.undoRedoService.getElements(r.uri)},this.trackedMatches.push(n),this._onDidChangeAnchorCell.fire()}else n=this.trackedMatches.find(l=>l.cellViewModel.handle===i.cell.handle),n.wordSelections.push(v.fromRange(i.match.range,P.LTR)),r.setSelections(n.wordSelections);this.initializeMultiSelectDecorations(n)}}async deleteLeft(){this.trackedMatches.forEach(e=>{const t=this.cursorsControllers.get(e.cellViewModel.uri);if(!t)return;const[,o]=q.deleteLeft(t.getPrevEditOperationType(),t.context.cursorConfig,t.context.model,t.getSelections(),t.getAutoClosedCharacters()),i=j.executeCommands(t.context.model,t.getSelections(),o);i&&t.setSelections(new S,void 0,i,E.Explicit)})}async undo(){const e=[];for(const t of this.trackedMatches){const o=await t.cellViewModel.resolveTextModel();o&&e.push(o)}await Promise.all(e.map(t=>t.undo()))}async redo(){const e=[];for(const t of this.trackedMatches){const o=await t.cellViewModel.resolveTextModel();o&&e.push(o)}await Promise.all(e.map(t=>t.redo()))}constructCellEditorOptions(e){const o=new ne(this.notebookEditor.getBaseCellEditorOptions(e.language),this.notebookEditor.notebookOptions,this.configurationService).getUpdatedValue(e.internalMetadata,e.uri);return new B(!1,J.EditorContent,o,null,this.accessibilityService)}initializeMultiSelectDecorations(e){const t=[];e.wordSelections.forEach(o=>{t.push({range:o,options:{description:"",className:"nb-multicursor-selection"}})}),e.decorationIds=e.cellViewModel.deltaModelDecorations(e.decorationIds,t)}updateLazyDecorations(){this.trackedMatches.forEach(e=>{if(this.notebookEditor.getCellIndex(e.cellViewModel)===void 0)return;const o=this.cursorsControllers.get(e.cellViewModel.uri);if(!o)return;const r=o.getSelections()?.map(n=>({range:n,options:{description:"",className:"nb-multicursor-selection"}}));e.decorationIds=e.cellViewModel.deltaModelDecorations(e.decorationIds,r??[])})}clearDecorations(e){e.decorationIds=e.cellViewModel.deltaModelDecorations(e.decorationIds,[])}getWord(e,t){const o=e.startLineNumber,i=e.startColumn;return t.isDisposed()?null:t.getWordAtPosition({lineNumber:o,column:i})}dispose(){super.dispose(),this.anchorDisposables.dispose(),this.cursorsDisposables.dispose(),this.trackedMatches.forEach(e=>{this.clearDecorations(e)}),this.trackedMatches=[]}};a=b([u(1,Q),u(2,Z),u(3,X),u(4,G),u(5,A),u(6,$)],a);class ce extends y{constructor(){super({id:se,title:w("addFindMatchToSelection","Add Find Match to Selection"),keybinding:{when:c.and(c.equals("config.notebook.multiSelect.enabled",!0),p,ie),primary:W.CtrlCmd|M.KeyD,weight:k.WorkbenchContrib}})}async runWithContext(s,e){const t=s.get(g),o=C(t.activeEditorPane);if(!o||!e.cell)return;o.getContribution(a.id).findAndTrackNextSelection(e.cell)}}class ae extends y{constructor(){super({id:"noteMultiCursor.exit",title:w("exitMultiSelection","Exit Multi Cursor Mode"),keybinding:{when:c.and(c.equals("config.notebook.multiSelect.enabled",!0),p,h.IsNotebookMultiSelect),primary:M.Escape,weight:k.WorkbenchContrib}})}async runWithContext(s,e){const t=s.get(g),o=C(t.activeEditorPane);if(!o)return;o.getContribution(a.id).resetToIdleState()}}class de extends y{constructor(){super({id:"noteMultiCursor.deleteLeft",title:w("deleteLeftMultiSelection","Delete Left"),keybinding:{when:c.and(c.equals("config.notebook.multiSelect.enabled",!0),p,h.IsNotebookMultiSelect,c.or(h.NotebookMultiSelectState.isEqualTo(1),h.NotebookMultiSelectState.isEqualTo(2))),primary:M.Backspace,weight:k.WorkbenchContrib}})}async runWithContext(s,e){const t=s.get(g),o=C(t.activeEditorPane);if(!o)return;o.getContribution(a.id).deleteLeft()}}let m=class extends R{constructor(e,t){super();this._editorService=e;this.configurationService=t;if(!this.configurationService.getValue("notebook.multiSelect.enabled"))return;const o=10005;this._register(U.addImplementation(o,"notebook-multicursor-undo-redo",()=>{const i=C(this._editorService.activeEditorPane);return!i||!i.hasModel()?!1:i.getContribution(a.id).undo()},c.and(c.equals("config.notebook.multiSelect.enabled",!0),p,h.IsNotebookMultiSelect))),this._register(K.addImplementation(o,"notebook-multicursor-undo-redo",()=>{const i=C(this._editorService.activeEditorPane);return!i||!i.hasModel()?!1:i.getContribution(a.id).redo()},c.and(c.equals("config.notebook.multiSelect.enabled",!0),p,h.IsNotebookMultiSelect)))}static ID="workbench.contrib.notebook.multiCursorUndoRedo"};m=b([u(0,g),u(1,A)],m),re(a.id,a),I(ce),I(ae),I(de),oe(m.ID,m,te.BlockRestore);export{h as NOTEBOOK_MULTI_SELECTION_CONTEXT,a as NotebookMultiCursorController};
