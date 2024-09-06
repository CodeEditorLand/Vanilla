import*as r from"../../../../nls.js";import"../../../browser/editorBrowser.js";import{EditorAction as d,registerEditorAction as s}from"../../../browser/editorExtensions.js";import"../../../common/editorCommon.js";import{EditorContextKeys as c}from"../../../common/editorContextKeys.js";import{MoveCaretCommand as m}from"./moveCaretCommand.js";class n extends d{left;constructor(o,e){super(e),this.left=o}run(o,e){if(!e.hasModel())return;const i=[],a=e.getSelections();for(const l of a)i.push(new m(l,this.left));e.pushUndoStop(),e.executeCommands(this.id,i),e.pushUndoStop()}}class p extends n{constructor(){super(!0,{id:"editor.action.moveCarretLeftAction",label:r.localize("caret.moveLeft","Move Selected Text Left"),alias:"Move Selected Text Left",precondition:c.writable})}}class f extends n{constructor(){super(!1,{id:"editor.action.moveCarretRightAction",label:r.localize("caret.moveRight","Move Selected Text Right"),alias:"Move Selected Text Right",precondition:c.writable})}}s(p),s(f);
