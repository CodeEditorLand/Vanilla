import{KeyCode as b,KeyMod as h}from"../../../../base/common/keyCodes.js";import{EditorAction as P,registerEditorAction as y}from"../../../browser/editorExtensions.js";import{ReplaceCommand as E}from"../../../common/commands/replaceCommand.js";import{MoveOperations as m}from"../../../common/cursor/cursorMoveOperations.js";import{Range as c}from"../../../common/core/range.js";import{EditorContextKeys as d}from"../../../common/editorContextKeys.js";import*as I from"../../../../nls.js";import{KeybindingWeight as L}from"../../../../platform/keybinding/common/keybindingsRegistry.js";class x extends P{constructor(){super({id:"editor.action.transposeLetters",label:I.localize("transposeLetters.label","Transpose Letters"),alias:"Transpose Letters",precondition:d.writable,kbOpts:{kbExpr:d.textInputFocus,primary:0,mac:{primary:h.WinCtrl|b.KeyT},weight:L.EditorContrib}})}run(K,o){if(!o.hasModel())return;const t=o.getModel(),n=[],u=o.getSelections();for(const e of u){if(!e.isEmpty())continue;const a=e.startLineNumber,i=e.startColumn,l=t.getLineMaxColumn(a);if(a===1&&(i===1||i===2&&l===2))continue;const s=i===l?e.getPosition():m.rightPosition(t,e.getPosition().lineNumber,e.getPosition().column),r=m.leftPosition(t,s),p=m.leftPosition(t,r),f=t.getValueInRange(c.fromPositions(p,r)),g=t.getValueInRange(c.fromPositions(r,s)),C=c.fromPositions(p,s);n.push(new E(C,g+f))}n.length>0&&(o.pushUndoStop(),o.executeCommands(this.id,n),o.pushUndoStop())}}y(x);
