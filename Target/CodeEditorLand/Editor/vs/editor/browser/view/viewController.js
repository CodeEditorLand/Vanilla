import"../../../../vs/base/browser/keyboardEvent.js";import"../../../../vs/base/browser/mouseEvent.js";import*as r from"../../../../vs/base/common/platform.js";import{CoreNavigationCommands as i}from"../../../../vs/editor/browser/coreCommands.js";import"../../../../vs/editor/browser/editorBrowser.js";import"../../../../vs/editor/browser/view/viewUserInputEvents.js";import"../../../../vs/editor/common/config/editorConfiguration.js";import{EditorOption as s}from"../../../../vs/editor/common/config/editorOptions.js";import{Position as l}from"../../../../vs/editor/common/core/position.js";import"../../../../vs/editor/common/core/selection.js";import"../../../../vs/editor/common/viewModel.js";class w{configuration;viewModel;userInputEvents;commandDelegate;constructor(e,o,t,n){this.configuration=e,this.viewModel=o,this.userInputEvents=t,this.commandDelegate=n}paste(e,o,t,n){this.commandDelegate.paste(e,o,t,n)}type(e){this.commandDelegate.type(e)}compositionType(e,o,t,n){this.commandDelegate.compositionType(e,o,t,n)}compositionStart(){this.commandDelegate.startComposition()}compositionEnd(){this.commandDelegate.endComposition()}cut(){this.commandDelegate.cut()}setSelection(e){i.SetSelection.runCoreEditorCommand(this.viewModel,{source:"keyboard",selection:e})}_validateViewColumn(e){const o=this.viewModel.getLineMinColumn(e.lineNumber);return e.column<o?new l(e.lineNumber,o):e}_hasMulticursorModifier(e){switch(this.configuration.options.get(s.multiCursorModifier)){case"altKey":return e.altKey;case"ctrlKey":return e.ctrlKey;case"metaKey":return e.metaKey;default:return!1}}_hasNonMulticursorModifier(e){switch(this.configuration.options.get(s.multiCursorModifier)){case"altKey":return e.ctrlKey||e.metaKey;case"ctrlKey":return e.altKey||e.metaKey;case"metaKey":return e.ctrlKey||e.altKey;default:return!1}}dispatchMouse(e){const o=this.configuration.options,t=r.isLinux&&o.get(s.selectionClipboard),n=o.get(s.columnSelection);e.middleButton&&!t?this._columnSelect(e.position,e.mouseColumn,e.inSelectionMode):e.startedOnLineNumbers?this._hasMulticursorModifier(e)?e.inSelectionMode?this._lastCursorLineSelect(e.position,e.revealType):this._createCursor(e.position,!0):e.inSelectionMode?this._lineSelectDrag(e.position,e.revealType):this._lineSelect(e.position,e.revealType):e.mouseDownCount>=4?this._selectAll():e.mouseDownCount===3?this._hasMulticursorModifier(e)?e.inSelectionMode?this._lastCursorLineSelectDrag(e.position,e.revealType):this._lastCursorLineSelect(e.position,e.revealType):e.inSelectionMode?this._lineSelectDrag(e.position,e.revealType):this._lineSelect(e.position,e.revealType):e.mouseDownCount===2?e.onInjectedText||(this._hasMulticursorModifier(e)?this._lastCursorWordSelect(e.position,e.revealType):e.inSelectionMode?this._wordSelectDrag(e.position,e.revealType):this._wordSelect(e.position,e.revealType)):this._hasMulticursorModifier(e)?this._hasNonMulticursorModifier(e)||(e.shiftKey?this._columnSelect(e.position,e.mouseColumn,!0):e.inSelectionMode?this._lastCursorMoveToSelect(e.position,e.revealType):this._createCursor(e.position,!1)):e.inSelectionMode?e.altKey?this._columnSelect(e.position,e.mouseColumn,!0):n?this._columnSelect(e.position,e.mouseColumn,!0):this._moveToSelect(e.position,e.revealType):this.moveTo(e.position,e.revealType)}_usualArgs(e,o){return e=this._validateViewColumn(e),{source:"mouse",position:this._convertViewToModelPosition(e),viewPosition:e,revealType:o}}moveTo(e,o){i.MoveTo.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_moveToSelect(e,o){i.MoveToSelect.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_columnSelect(e,o,t){e=this._validateViewColumn(e),i.ColumnSelect.runCoreEditorCommand(this.viewModel,{source:"mouse",position:this._convertViewToModelPosition(e),viewPosition:e,mouseColumn:o,doColumnSelect:t})}_createCursor(e,o){e=this._validateViewColumn(e),i.CreateCursor.runCoreEditorCommand(this.viewModel,{source:"mouse",position:this._convertViewToModelPosition(e),viewPosition:e,wholeLine:o})}_lastCursorMoveToSelect(e,o){i.LastCursorMoveToSelect.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_wordSelect(e,o){i.WordSelect.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_wordSelectDrag(e,o){i.WordSelectDrag.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_lastCursorWordSelect(e,o){i.LastCursorWordSelect.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_lineSelect(e,o){i.LineSelect.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_lineSelectDrag(e,o){i.LineSelectDrag.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_lastCursorLineSelect(e,o){i.LastCursorLineSelect.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_lastCursorLineSelectDrag(e,o){i.LastCursorLineSelectDrag.runCoreEditorCommand(this.viewModel,this._usualArgs(e,o))}_selectAll(){i.SelectAll.runCoreEditorCommand(this.viewModel,{source:"mouse"})}_convertViewToModelPosition(e){return this.viewModel.coordinatesConverter.convertViewPositionToModelPosition(e)}emitKeyDown(e){this.userInputEvents.emitKeyDown(e)}emitKeyUp(e){this.userInputEvents.emitKeyUp(e)}emitContextMenu(e){this.userInputEvents.emitContextMenu(e)}emitMouseMove(e){this.userInputEvents.emitMouseMove(e)}emitMouseLeave(e){this.userInputEvents.emitMouseLeave(e)}emitMouseUp(e){this.userInputEvents.emitMouseUp(e)}emitMouseDown(e){this.userInputEvents.emitMouseDown(e)}emitMouseDrag(e){this.userInputEvents.emitMouseDrag(e)}emitMouseDrop(e){this.userInputEvents.emitMouseDrop(e)}emitMouseDropCanceled(){this.userInputEvents.emitMouseDropCanceled()}emitMouseWheel(e){this.userInputEvents.emitMouseWheel(e)}}export{w as ViewController};
