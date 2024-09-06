import{KeyCode as n,KeyMod as r}from"../../../../base/common/keyCodes.js";import{CommandsRegistry as u}from"../../../../platform/commands/common/commands.js";import{KeybindingWeight as d}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{registerEditorCommand as a}from"../../../browser/editorExtensions.js";import"../../../common/core/position.js";import{Range as W}from"../../../common/core/range.js";import"../../../common/core/wordCharacterClassifier.js";import{WordNavigationType as s,WordPartOperations as l}from"../../../common/cursor/cursorWordOperations.js";import{EditorContextKeys as o}from"../../../common/editorContextKeys.js";import"../../../common/model.js";import{DeleteWordCommand as g,MoveWordCommand as f}from"../../wordOperations/browser/wordOperations.js";class w extends g{constructor(){super({whitespaceHeuristics:!0,wordNavigationType:s.WordStart,id:"deleteWordPartLeft",precondition:o.writable,kbOpts:{kbExpr:o.textInputFocus,primary:0,mac:{primary:r.WinCtrl|r.Alt|n.Backspace},weight:d.EditorContrib}})}_delete(t,p){const e=l.deleteWordPartLeft(t);return e||new W(1,1,1,1)}}class y extends g{constructor(){super({whitespaceHeuristics:!0,wordNavigationType:s.WordEnd,id:"deleteWordPartRight",precondition:o.writable,kbOpts:{kbExpr:o.textInputFocus,primary:0,mac:{primary:r.WinCtrl|r.Alt|n.Delete},weight:d.EditorContrib}})}_delete(t,p){const e=l.deleteWordPartRight(t);if(e)return e;const c=t.model.getLineCount(),m=t.model.getLineMaxColumn(c);return new W(c,m,c,m)}}class C extends f{_move(t,p,e,c,m){return l.moveWordPartLeft(t,p,e,m)}}class P extends C{constructor(){super({inSelectionMode:!1,wordNavigationType:s.WordStart,id:"cursorWordPartLeft",precondition:void 0,kbOpts:{kbExpr:o.textInputFocus,primary:0,mac:{primary:r.WinCtrl|r.Alt|n.LeftArrow},weight:d.EditorContrib}})}}u.registerCommandAlias("cursorWordPartStartLeft","cursorWordPartLeft");class h extends C{constructor(){super({inSelectionMode:!0,wordNavigationType:s.WordStart,id:"cursorWordPartLeftSelect",precondition:void 0,kbOpts:{kbExpr:o.textInputFocus,primary:0,mac:{primary:r.WinCtrl|r.Alt|r.Shift|n.LeftArrow},weight:d.EditorContrib}})}}u.registerCommandAlias("cursorWordPartStartLeftSelect","cursorWordPartLeftSelect");class x extends f{_move(t,p,e,c,m){return l.moveWordPartRight(t,p,e)}}class b extends x{constructor(){super({inSelectionMode:!1,wordNavigationType:s.WordEnd,id:"cursorWordPartRight",precondition:void 0,kbOpts:{kbExpr:o.textInputFocus,primary:0,mac:{primary:r.WinCtrl|r.Alt|n.RightArrow},weight:d.EditorContrib}})}}class v extends x{constructor(){super({inSelectionMode:!0,wordNavigationType:s.WordEnd,id:"cursorWordPartRightSelect",precondition:void 0,kbOpts:{kbExpr:o.textInputFocus,primary:0,mac:{primary:r.WinCtrl|r.Alt|r.Shift|n.RightArrow},weight:d.EditorContrib}})}}a(new w),a(new y),a(new P),a(new h),a(new b),a(new v);export{P as CursorWordPartLeft,h as CursorWordPartLeftSelect,b as CursorWordPartRight,v as CursorWordPartRightSelect,w as DeleteWordPartLeft,y as DeleteWordPartRight,C as WordPartLeftCommand,x as WordPartRightCommand};
