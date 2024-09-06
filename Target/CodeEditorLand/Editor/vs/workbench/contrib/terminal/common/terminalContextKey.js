import{localize as i}from"../../../../nls.js";import{ContextKeyExpr as o,RawContextKey as n}from"../../../../platform/contextkey/common/contextkey.js";import{TerminalSettingId as r}from"../../../../platform/terminal/common/terminal.js";import{TERMINAL_VIEW_ID as u}from"./terminal.js";var d=(t=>(t.IsOpen="terminalIsOpen",t.Count="terminalCount",t.GroupCount="terminalGroupCount",t.TabsNarrow="isTerminalTabsNarrow",t.HasFixedWidth="terminalHasFixedWidth",t.ProcessSupported="terminalProcessSupported",t.Focus="terminalFocus",t.FocusInAny="terminalFocusInAny",t.AccessibleBufferFocus="terminalAccessibleBufferFocus",t.AccessibleBufferOnLastLine="terminalAccessibleBufferOnLastLine",t.EditorFocus="terminalEditorFocus",t.TabsFocus="terminalTabsFocus",t.WebExtensionContributedProfile="terminalWebExtensionContributedProfile",t.TerminalHasBeenCreated="terminalHasBeenCreated",t.TerminalEditorActive="terminalEditorActive",t.TabsMouse="terminalTabsMouse",t.AltBufferActive="terminalAltBufferActive",t.SuggestWidgetVisible="terminalSuggestWidgetVisible",t.A11yTreeFocus="terminalA11yTreeFocus",t.ViewShowing="terminalViewShowing",t.TextSelected="terminalTextSelected",t.TextSelectedInFocused="terminalTextSelectedInFocused",t.FindVisible="terminalFindVisible",t.FindInputFocused="terminalFindInputFocused",t.FindFocused="terminalFindFocused",t.TabsSingularSelection="terminalTabsSingularSelection",t.SplitTerminal="terminalSplitTerminal",t.ShellType="terminalShellType",t.InTerminalRunCommandPicker="inTerminalRunCommandPicker",t.TerminalShellIntegrationEnabled="terminalShellIntegrationEnabled",t))(d||{}),b;(e=>(e.isOpen=new n("terminalIsOpen",!1,!0),e.focus=new n("terminalFocus",!1,i("terminalFocusContextKey","Whether the terminal is focused.")),e.focusInAny=new n("terminalFocusInAny",!1,i("terminalFocusInAnyContextKey","Whether any terminal is focused, including detached terminals used in other UI.")),e.editorFocus=new n("terminalEditorFocus",!1,i("terminalEditorFocusContextKey","Whether a terminal in the editor area is focused.")),e.count=new n("terminalCount",0,i("terminalCountContextKey","The current number of terminals.")),e.groupCount=new n("terminalGroupCount",0,!0),e.tabsNarrow=new n("isTerminalTabsNarrow",!1,!0),e.terminalHasFixedWidth=new n("terminalHasFixedWidth",!1,!0),e.tabsFocus=new n("terminalTabsFocus",!1,i("terminalTabsFocusContextKey","Whether the terminal tabs widget is focused.")),e.webExtensionContributedProfile=new n("terminalWebExtensionContributedProfile",!1,!0),e.terminalHasBeenCreated=new n("terminalHasBeenCreated",!1,!0),e.terminalEditorActive=new n("terminalEditorActive",!1,!0),e.tabsMouse=new n("terminalTabsMouse",!1,!0),e.shellType=new n("terminalShellType",void 0,{type:"string",description:i("terminalShellTypeContextKey","The shell type of the active terminal, this is set if the type can be detected.")}),e.altBufferActive=new n("terminalAltBufferActive",!1,i("terminalAltBufferActive","Whether the terminal's alt buffer is active.")),e.suggestWidgetVisible=new n("terminalSuggestWidgetVisible",!1,i("terminalSuggestWidgetVisible","Whether the terminal's suggest widget is visible.")),e.notFocus=e.focus.toNegated(),e.viewShowing=new n("terminalViewShowing",!1,i("terminalViewShowing","Whether the terminal view is showing")),e.textSelected=new n("terminalTextSelected",!1,i("terminalTextSelectedContextKey","Whether text is selected in the active terminal.")),e.textSelectedInFocused=new n("terminalTextSelectedInFocused",!1,i("terminalTextSelectedInFocusedContextKey","Whether text is selected in a focused terminal.")),e.notTextSelected=e.textSelected.toNegated(),e.findVisible=new n("terminalFindVisible",!1,!0),e.notFindVisible=e.findVisible.toNegated(),e.findInputFocus=new n("terminalFindInputFocused",!1,!0),e.findFocus=new n("terminalFindFocused",!1,!0),e.notFindFocus=e.findInputFocus.toNegated(),e.processSupported=new n("terminalProcessSupported",!1,i("terminalProcessSupportedContextKey","Whether terminal processes can be launched in the current workspace.")),e.tabsSingularSelection=new n("terminalTabsSingularSelection",!1,i("terminalTabsSingularSelectedContextKey","Whether one terminal is selected in the terminal tabs list.")),e.splitTerminal=new n("terminalSplitTerminal",!1,i("isSplitTerminalContextKey","Whether the focused tab's terminal is a split terminal.")),e.inTerminalRunCommandPicker=new n("inTerminalRunCommandPicker",!1,i("inTerminalRunCommandPickerContextKey","Whether the terminal run command picker is currently open.")),e.terminalShellIntegrationEnabled=new n("terminalShellIntegrationEnabled",!1,i("terminalShellIntegrationEnabled","Whether shell integration is enabled in the active terminal")),e.shouldShowViewInlineActions=o.and(o.equals("view",u),o.notEquals(`config.${r.TabsHideCondition}`,"never"),o.or(o.not(`config.${r.TabsEnabled}`),o.and(o.equals(`config.${r.TabsShowActions}`,"singleTerminal"),o.equals("terminalGroupCount",1)),o.and(o.equals(`config.${r.TabsShowActions}`,"singleTerminalOrNarrow"),o.or(o.equals("terminalGroupCount",1),o.has("isTerminalTabsNarrow"))),o.and(o.equals(`config.${r.TabsShowActions}`,"singleGroup"),o.equals("terminalGroupCount",1)),o.equals(`config.${r.TabsShowActions}`,"always")))))(b||={});export{d as TerminalContextKeyStrings,b as TerminalContextKeys};
