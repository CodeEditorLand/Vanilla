import{KeyCode as c,KeyMod as n}from"../../../../base/common/keyCodes.js";import{MenuId as a}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as r}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as d}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import"../../../browser/editorBrowser.js";import{EditorAction as l}from"../../../browser/editorExtensions.js";import{EditorContextKeys as o}from"../../../common/editorContextKeys.js";import{inlineEditAcceptId as E,inlineEditJumpBackId as u,inlineEditJumpToId as m,inlineEditRejectId as b}from"./commandIds.js";import{InlineEditController as i}from"./inlineEditController.js";class J extends l{constructor(){super({id:E,label:"Accept Inline Edit",alias:"Accept Inline Edit",precondition:r.and(o.writable,i.inlineEditVisibleContext),kbOpts:[{weight:d.EditorContrib+1,primary:c.Tab,kbExpr:r.and(o.writable,i.inlineEditVisibleContext,i.cursorAtInlineEditContext)}],menuOpts:[{menuId:a.InlineEditToolbar,title:"Accept",group:"primary",order:1}]})}async run(e,t){await i.get(t)?.accept()}}class O extends l{constructor(){const e=r.and(o.writable,r.not(i.inlineEditVisibleKey));super({id:"editor.action.inlineEdit.trigger",label:"Trigger Inline Edit",alias:"Trigger Inline Edit",precondition:e,kbOpts:{weight:d.EditorContrib+1,primary:n.CtrlCmd|n.Alt|c.Equal,kbExpr:e}})}async run(e,t){i.get(t)?.trigger()}}class h extends l{constructor(){const e=r.and(o.writable,i.inlineEditVisibleContext,r.not(i.cursorAtInlineEditKey));super({id:m,label:"Jump to Inline Edit",alias:"Jump to Inline Edit",precondition:e,kbOpts:{weight:d.EditorContrib+1,primary:n.CtrlCmd|n.Alt|c.Equal,kbExpr:e},menuOpts:[{menuId:a.InlineEditToolbar,title:"Jump To Edit",group:"primary",order:3,when:e}]})}async run(e,t){i.get(t)?.jumpToCurrent()}}class j extends l{constructor(){const e=r.and(o.writable,i.cursorAtInlineEditContext);super({id:u,label:"Jump Back from Inline Edit",alias:"Jump Back from Inline Edit",precondition:e,kbOpts:{weight:d.EditorContrib+10,primary:n.CtrlCmd|n.Alt|c.Equal,kbExpr:e},menuOpts:[{menuId:a.InlineEditToolbar,title:"Jump Back",group:"primary",order:3,when:e}]})}async run(e,t){i.get(t)?.jumpBack()}}class K extends l{constructor(){const e=r.and(o.writable,i.inlineEditVisibleContext);super({id:b,label:"Reject Inline Edit",alias:"Reject Inline Edit",precondition:e,kbOpts:{weight:d.EditorContrib,primary:c.Escape,kbExpr:e},menuOpts:[{menuId:a.InlineEditToolbar,title:"Reject",group:"secondary",order:2}]})}async run(e,t){await i.get(t)?.clear()}}export{J as AcceptInlineEdit,j as JumpBackInlineEdit,h as JumpToInlineEdit,K as RejectInlineEdit,O as TriggerInlineEdit};
