import{KeyCode as l,KeyMod as a}from"../../../../base/common/keyCodes.js";import"../../../browser/editorBrowser.js";import{EditorAction as F,EditorCommand as L,registerEditorAction as B,registerEditorCommand as i}from"../../../browser/editorExtensions.js";import{ReplaceCommand as R}from"../../../common/commands/replaceCommand.js";import{EditorOption as u,EditorOptions as v}from"../../../common/config/editorOptions.js";import{CursorState as V}from"../../../common/cursorCommon.js";import{CursorChangeReason as K}from"../../../common/cursorEvents.js";import{WordNavigationType as n,WordOperations as h}from"../../../common/cursor/cursorWordOperations.js";import{getMapForWordSeparators as C}from"../../../common/core/wordCharacterClassifier.js";import{Position as A}from"../../../common/core/position.js";import{Range as _}from"../../../common/core/range.js";import{Selection as I}from"../../../common/core/selection.js";import{ScrollType as U}from"../../../common/editorCommon.js";import{EditorContextKeys as c}from"../../../common/editorContextKeys.js";import"../../../common/model.js";import{ILanguageConfigurationService as Q}from"../../../common/languages/languageConfigurationRegistry.js";import*as z from"../../../../nls.js";import{CONTEXT_ACCESSIBILITY_MODE_ENABLED as y}from"../../../../platform/accessibility/common/accessibility.js";import{ContextKeyExpr as m}from"../../../../platform/contextkey/common/contextkey.js";import{IsWindowsContext as b}from"../../../../platform/contextkey/common/contextkeys.js";import{KeybindingWeight as S}from"../../../../platform/keybinding/common/keybindingsRegistry.js";class O extends L{_inSelectionMode;_wordNavigationType;constructor(o){super(o),this._inSelectionMode=o.inSelectionMode,this._wordNavigationType=o.wordNavigationType}runEditorCommand(o,e,r){if(!e.hasModel())return;const s=C(e.getOption(u.wordSeparators),e.getOption(u.wordSegmenterLocales)),d=e.getModel(),f=e.getSelections(),x=f.length>1,g=f.map(p=>{const T=new A(p.positionLineNumber,p.positionColumn),N=this._move(s,d,T,this._wordNavigationType,x);return this._moveTo(p,N,this._inSelectionMode)});if(d.pushStackElement(),e._getViewModel().setCursorStates("moveWordCommand",K.Explicit,g.map(p=>V.fromModelSelection(p))),g.length===1){const p=new A(g[0].positionLineNumber,g[0].positionColumn);e.revealPosition(p,U.Smooth)}}_moveTo(o,e,r){return r?new I(o.selectionStartLineNumber,o.selectionStartColumn,e.lineNumber,e.column):new I(e.lineNumber,e.column,e.lineNumber,e.column)}}class W extends O{_move(o,e,r,s,d){return h.moveWordLeft(o,e,r,s,d)}}class w extends O{_move(o,e,r,s,d){return h.moveWordRight(o,e,r,s)}}class X extends W{constructor(){super({inSelectionMode:!1,wordNavigationType:n.WordStart,id:"cursorWordStartLeft",precondition:void 0})}}class Y extends W{constructor(){super({inSelectionMode:!1,wordNavigationType:n.WordEnd,id:"cursorWordEndLeft",precondition:void 0})}}class j extends W{constructor(){super({inSelectionMode:!1,wordNavigationType:n.WordStartFast,id:"cursorWordLeft",precondition:void 0,kbOpts:{kbExpr:m.and(c.textInputFocus,m.and(y,b)?.negate()),primary:a.CtrlCmd|l.LeftArrow,mac:{primary:a.Alt|l.LeftArrow},weight:S.EditorContrib}})}}class q extends W{constructor(){super({inSelectionMode:!0,wordNavigationType:n.WordStart,id:"cursorWordStartLeftSelect",precondition:void 0})}}class G extends W{constructor(){super({inSelectionMode:!0,wordNavigationType:n.WordEnd,id:"cursorWordEndLeftSelect",precondition:void 0})}}class J extends W{constructor(){super({inSelectionMode:!0,wordNavigationType:n.WordStartFast,id:"cursorWordLeftSelect",precondition:void 0,kbOpts:{kbExpr:m.and(c.textInputFocus,m.and(y,b)?.negate()),primary:a.CtrlCmd|a.Shift|l.LeftArrow,mac:{primary:a.Alt|a.Shift|l.LeftArrow},weight:S.EditorContrib}})}}class Z extends W{constructor(){super({inSelectionMode:!1,wordNavigationType:n.WordAccessibility,id:"cursorWordAccessibilityLeft",precondition:void 0})}_move(o,e,r,s,d){return super._move(C(v.wordSeparators.defaultValue,o.intlSegmenterLocales),e,r,s,d)}}class $ extends W{constructor(){super({inSelectionMode:!0,wordNavigationType:n.WordAccessibility,id:"cursorWordAccessibilityLeftSelect",precondition:void 0})}_move(o,e,r,s,d){return super._move(C(v.wordSeparators.defaultValue,o.intlSegmenterLocales),e,r,s,d)}}class ee extends w{constructor(){super({inSelectionMode:!1,wordNavigationType:n.WordStart,id:"cursorWordStartRight",precondition:void 0})}}class oe extends w{constructor(){super({inSelectionMode:!1,wordNavigationType:n.WordEnd,id:"cursorWordEndRight",precondition:void 0,kbOpts:{kbExpr:m.and(c.textInputFocus,m.and(y,b)?.negate()),primary:a.CtrlCmd|l.RightArrow,mac:{primary:a.Alt|l.RightArrow},weight:S.EditorContrib}})}}class te extends w{constructor(){super({inSelectionMode:!1,wordNavigationType:n.WordEnd,id:"cursorWordRight",precondition:void 0})}}class re extends w{constructor(){super({inSelectionMode:!0,wordNavigationType:n.WordStart,id:"cursorWordStartRightSelect",precondition:void 0})}}class ie extends w{constructor(){super({inSelectionMode:!0,wordNavigationType:n.WordEnd,id:"cursorWordEndRightSelect",precondition:void 0,kbOpts:{kbExpr:m.and(c.textInputFocus,m.and(y,b)?.negate()),primary:a.CtrlCmd|a.Shift|l.RightArrow,mac:{primary:a.Alt|a.Shift|l.RightArrow},weight:S.EditorContrib}})}}class ne extends w{constructor(){super({inSelectionMode:!0,wordNavigationType:n.WordEnd,id:"cursorWordRightSelect",precondition:void 0})}}class se extends w{constructor(){super({inSelectionMode:!1,wordNavigationType:n.WordAccessibility,id:"cursorWordAccessibilityRight",precondition:void 0})}_move(o,e,r,s,d){return super._move(C(v.wordSeparators.defaultValue,o.intlSegmenterLocales),e,r,s,d)}}class de extends w{constructor(){super({inSelectionMode:!0,wordNavigationType:n.WordAccessibility,id:"cursorWordAccessibilityRightSelect",precondition:void 0})}_move(o,e,r,s,d){return super._move(C(v.wordSeparators.defaultValue,o.intlSegmenterLocales),e,r,s,d)}}class D extends L{_whitespaceHeuristics;_wordNavigationType;constructor(o){super(o),this._whitespaceHeuristics=o.whitespaceHeuristics,this._wordNavigationType=o.wordNavigationType}runEditorCommand(o,e,r){const s=o.get(Q);if(!e.hasModel())return;const d=C(e.getOption(u.wordSeparators),e.getOption(u.wordSegmenterLocales)),f=e.getModel(),x=e.getSelections(),g=e.getOption(u.autoClosingBrackets),p=e.getOption(u.autoClosingQuotes),T=s.getLanguageConfiguration(f.getLanguageId()).getAutoClosingPairs(),N=e._getViewModel(),P=x.map(k=>{const H=this._delete({wordSeparators:d,model:f,selection:k,whitespaceHeuristics:this._whitespaceHeuristics,autoClosingDelete:e.getOption(u.autoClosingDelete),autoClosingBrackets:g,autoClosingQuotes:p,autoClosingPairs:T,autoClosedCharacters:N.getCursorAutoClosedCharacters()},this._wordNavigationType);return new R(H,"")});e.pushUndoStop(),e.executeCommands(this.id,P),e.pushUndoStop()}}class E extends D{_delete(o,e){const r=h.deleteWordLeft(o,e);return r||new _(1,1,1,1)}}class M extends D{_delete(o,e){const r=h.deleteWordRight(o,e);if(r)return r;const s=o.model.getLineCount(),d=o.model.getLineMaxColumn(s);return new _(s,d,s,d)}}class ae extends E{constructor(){super({whitespaceHeuristics:!1,wordNavigationType:n.WordStart,id:"deleteWordStartLeft",precondition:c.writable})}}class ce extends E{constructor(){super({whitespaceHeuristics:!1,wordNavigationType:n.WordEnd,id:"deleteWordEndLeft",precondition:c.writable})}}class le extends E{constructor(){super({whitespaceHeuristics:!0,wordNavigationType:n.WordStart,id:"deleteWordLeft",precondition:c.writable,kbOpts:{kbExpr:c.textInputFocus,primary:a.CtrlCmd|l.Backspace,mac:{primary:a.Alt|l.Backspace},weight:S.EditorContrib}})}}class pe extends M{constructor(){super({whitespaceHeuristics:!1,wordNavigationType:n.WordStart,id:"deleteWordStartRight",precondition:c.writable})}}class ue extends M{constructor(){super({whitespaceHeuristics:!1,wordNavigationType:n.WordEnd,id:"deleteWordEndRight",precondition:c.writable})}}class ge extends M{constructor(){super({whitespaceHeuristics:!0,wordNavigationType:n.WordEnd,id:"deleteWordRight",precondition:c.writable,kbOpts:{kbExpr:c.textInputFocus,primary:a.CtrlCmd|l.Delete,mac:{primary:a.Alt|l.Delete},weight:S.EditorContrib}})}}class me extends F{constructor(){super({id:"deleteInsideWord",precondition:c.writable,label:z.localize("deleteInsideWord","Delete Word"),alias:"Delete Word"})}run(o,e,r){if(!e.hasModel())return;const s=C(e.getOption(u.wordSeparators),e.getOption(u.wordSegmenterLocales)),d=e.getModel(),x=e.getSelections().map(g=>{const p=h.deleteInsideWord(s,d,g);return new R(p,"")});e.pushUndoStop(),e.executeCommands(this.id,x),e.pushUndoStop()}}i(new X),i(new Y),i(new j),i(new q),i(new G),i(new J),i(new ee),i(new oe),i(new te),i(new re),i(new ie),i(new ne),i(new Z),i(new $),i(new se),i(new de),i(new ae),i(new ce),i(new le),i(new pe),i(new ue),i(new ge),B(me);export{Z as CursorWordAccessibilityLeft,$ as CursorWordAccessibilityLeftSelect,se as CursorWordAccessibilityRight,de as CursorWordAccessibilityRightSelect,Y as CursorWordEndLeft,G as CursorWordEndLeftSelect,oe as CursorWordEndRight,ie as CursorWordEndRightSelect,j as CursorWordLeft,J as CursorWordLeftSelect,te as CursorWordRight,ne as CursorWordRightSelect,X as CursorWordStartLeft,q as CursorWordStartLeftSelect,ee as CursorWordStartRight,re as CursorWordStartRightSelect,me as DeleteInsideWord,D as DeleteWordCommand,ce as DeleteWordEndLeft,ue as DeleteWordEndRight,le as DeleteWordLeft,E as DeleteWordLeftCommand,ge as DeleteWordRight,M as DeleteWordRightCommand,ae as DeleteWordStartLeft,pe as DeleteWordStartRight,O as MoveWordCommand,W as WordLeftCommand,w as WordRightCommand};
