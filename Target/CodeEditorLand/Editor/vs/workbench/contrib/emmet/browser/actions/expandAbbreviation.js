import*as e from"../../../../../nls.js";import{EmmetEditorAction as o}from"../emmetActions.js";import{registerEditorAction as r}from"../../../../../editor/browser/editorExtensions.js";import{EditorContextKeys as t}from"../../../../../editor/common/editorContextKeys.js";import{KeyCode as n}from"../../../../../base/common/keyCodes.js";import{ContextKeyExpr as i}from"../../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as m}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{MenuId as a}from"../../../../../platform/actions/common/actions.js";class b extends o{constructor(){super({id:"editor.emmet.action.expandAbbreviation",label:e.localize("expandAbbreviationAction","Emmet: Expand Abbreviation"),alias:"Emmet: Expand Abbreviation",precondition:t.writable,actionName:"expand_abbreviation",kbOpts:{primary:n.Tab,kbExpr:i.and(t.editorTextFocus,t.tabDoesNotMoveFocus,i.has("config.emmet.triggerExpansionOnTab")),weight:m.EditorContrib},menuOpts:{menuId:a.MenubarEditMenu,group:"5_insert",title:e.localize({key:"miEmmetExpandAbbreviation",comment:["&& denotes a mnemonic"]},"Emmet: E&&xpand Abbreviation"),order:3}})}}r(b);
