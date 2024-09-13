import{KeyCode as s}from"../../../../base/common/keyCodes.js";import{localize as n,localize2 as o}from"../../../../nls.js";import{Categories as u}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as y,MenuId as d}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as k}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as m}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as p}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{EditorAction2 as r}from"../../../browser/editorExtensions.js";import{EditorContextKeys as c}from"../../../common/editorContextKeys.js";import{StickyScrollController as l}from"./stickyScrollController.js";class w extends y{constructor(){super({id:"editor.action.toggleStickyScroll",title:{...o("toggleEditorStickyScroll","Toggle Editor Sticky Scroll"),mnemonicTitle:n({key:"mitoggleStickyScroll",comment:["&& denotes a mnemonic"]},"&&Toggle Editor Sticky Scroll")},metadata:{description:o("toggleEditorStickyScroll.description","Toggle/enable the editor sticky scroll which shows the nested scopes at the top of the viewport")},category:u.View,toggled:{condition:m.equals("config.editor.stickyScroll.enabled",!0),title:n("stickyScroll","Sticky Scroll"),mnemonicTitle:n({key:"miStickyScroll",comment:["&& denotes a mnemonic"]},"&&Sticky Scroll")},menu:[{id:d.CommandPalette},{id:d.MenubarAppearanceMenu,group:"4_editor",order:3},{id:d.StickyScrollContext}]})}async run(t){const e=t.get(k),a=!e.getValue("editor.stickyScroll.enabled");return e.updateValue("editor.stickyScroll.enabled",a)}}const S=p.EditorContrib;class F extends r{constructor(){super({id:"editor.action.focusStickyScroll",title:{...o("focusStickyScroll","Focus on the editor sticky scroll"),mnemonicTitle:n({key:"mifocusStickyScroll",comment:["&& denotes a mnemonic"]},"&&Focus Sticky Scroll")},precondition:m.and(m.has("config.editor.stickyScroll.enabled"),c.stickyScrollVisible),menu:[{id:d.CommandPalette}]})}runEditorCommand(t,e){l.get(e)?.focus()}}class L extends r{constructor(){super({id:"editor.action.selectNextStickyScrollLine",title:o("selectNextStickyScrollLine.title","Select the next editor sticky scroll line"),precondition:c.stickyScrollFocused.isEqualTo(!0),keybinding:{weight:S,primary:s.DownArrow}})}runEditorCommand(t,e){l.get(e)?.focusNext()}}class I extends r{constructor(){super({id:"editor.action.selectPreviousStickyScrollLine",title:o("selectPreviousStickyScrollLine.title","Select the previous sticky scroll line"),precondition:c.stickyScrollFocused.isEqualTo(!0),keybinding:{weight:S,primary:s.UpArrow}})}runEditorCommand(t,e){l.get(e)?.focusPrevious()}}class P extends r{constructor(){super({id:"editor.action.goToFocusedStickyScrollLine",title:o("goToFocusedStickyScrollLine.title","Go to the focused sticky scroll line"),precondition:c.stickyScrollFocused.isEqualTo(!0),keybinding:{weight:S,primary:s.Enter}})}runEditorCommand(t,e){l.get(e)?.goToFocused()}}class _ extends r{constructor(){super({id:"editor.action.selectEditor",title:o("selectEditor.title","Select Editor"),precondition:c.stickyScrollFocused.isEqualTo(!0),keybinding:{weight:S,primary:s.Escape}})}runEditorCommand(t,e){l.get(e)?.selectEditor()}}export{F as FocusStickyScroll,P as GoToStickyScrollLine,_ as SelectEditor,L as SelectNextStickyScrollLine,I as SelectPreviousStickyScrollLine,w as ToggleStickyScroll};
