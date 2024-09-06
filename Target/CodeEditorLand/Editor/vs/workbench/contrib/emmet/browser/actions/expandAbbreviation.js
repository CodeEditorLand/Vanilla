import{KeyCode as o}from"../../../../../../vs/base/common/keyCodes.js";import{registerEditorAction as r}from"../../../../../../vs/editor/browser/editorExtensions.js";import{EditorContextKeys as t}from"../../../../../../vs/editor/common/editorContextKeys.js";import*as e from"../../../../../../vs/nls.js";import{MenuId as n}from"../../../../../../vs/platform/actions/common/actions.js";import{ContextKeyExpr as i}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{KeybindingWeight as m}from"../../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{EmmetEditorAction as a}from"../../../../../../vs/workbench/contrib/emmet/browser/emmetActions.js";class b extends a{constructor(){super({id:"editor.emmet.action.expandAbbreviation",label:e.localize("expandAbbreviationAction","Emmet: Expand Abbreviation"),alias:"Emmet: Expand Abbreviation",precondition:t.writable,actionName:"expand_abbreviation",kbOpts:{primary:o.Tab,kbExpr:i.and(t.editorTextFocus,t.tabDoesNotMoveFocus,i.has("config.emmet.triggerExpansionOnTab")),weight:m.EditorContrib},menuOpts:{menuId:n.MenubarEditMenu,group:"5_insert",title:e.localize({key:"miEmmetExpandAbbreviation",comment:["&& denotes a mnemonic"]},"Emmet: E&&xpand Abbreviation"),order:3}})}}r(b);