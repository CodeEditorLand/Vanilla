export declare const enum TerminalContextKeyStrings {
    IsOpen = "terminalIsOpen",
    Count = "terminalCount",
    GroupCount = "terminalGroupCount",
    TabsNarrow = "isTerminalTabsNarrow",
    HasFixedWidth = "terminalHasFixedWidth",
    ProcessSupported = "terminalProcessSupported",
    Focus = "terminalFocus",
    FocusInAny = "terminalFocusInAny",
    AccessibleBufferFocus = "terminalAccessibleBufferFocus",
    AccessibleBufferOnLastLine = "terminalAccessibleBufferOnLastLine",
    EditorFocus = "terminalEditorFocus",
    TabsFocus = "terminalTabsFocus",
    WebExtensionContributedProfile = "terminalWebExtensionContributedProfile",
    TerminalHasBeenCreated = "terminalHasBeenCreated",
    TerminalEditorActive = "terminalEditorActive",
    TabsMouse = "terminalTabsMouse",
    AltBufferActive = "terminalAltBufferActive",
    SuggestWidgetVisible = "terminalSuggestWidgetVisible",
    A11yTreeFocus = "terminalA11yTreeFocus",
    ViewShowing = "terminalViewShowing",
    TextSelected = "terminalTextSelected",
    TextSelectedInFocused = "terminalTextSelectedInFocused",
    FindVisible = "terminalFindVisible",
    FindInputFocused = "terminalFindInputFocused",
    FindFocused = "terminalFindFocused",
    TabsSingularSelection = "terminalTabsSingularSelection",
    SplitTerminal = "terminalSplitTerminal",
    ShellType = "terminalShellType",
    InTerminalRunCommandPicker = "inTerminalRunCommandPicker",
    TerminalShellIntegrationEnabled = "terminalShellIntegrationEnabled"
}
export declare namespace TerminalContextKeys {
    /** Whether there is at least one opened terminal. */
    const isOpen: any;
    /** Whether the terminal is focused. */
    const focus: any;
    /** Whether any terminal is focused, including detached terminals used in other UI. */
    const focusInAny: any;
    /** Whether a terminal in the editor area is focused. */
    const editorFocus: any;
    /** The current number of terminals. */
    const count: any;
    /** The current number of terminal groups. */
    const groupCount: any;
    /** Whether the terminal tabs view is narrow. */
    const tabsNarrow: any;
    /** Whether the terminal tabs view is narrow. */
    const terminalHasFixedWidth: any;
    /** Whether the terminal tabs widget is focused. */
    const tabsFocus: any;
    /** Whether a web extension has contributed a profile */
    const webExtensionContributedProfile: any;
    /** Whether at least one terminal has been created */
    const terminalHasBeenCreated: any;
    /** Whether at least one terminal has been created */
    const terminalEditorActive: any;
    /** Whether the mouse is within the terminal tabs list. */
    const tabsMouse: any;
    /** The shell type of the active terminal, this is set if the type can be detected. */
    const shellType: any;
    /** Whether the terminal's alt buffer is active. */
    const altBufferActive: any;
    /** Whether the terminal's suggest widget is visible. */
    const suggestWidgetVisible: any;
    /** Whether the terminal is NOT focused. */
    const notFocus: any;
    /** Whether the terminal view is showing. */
    const viewShowing: any;
    /** Whether text is selected in the active terminal. */
    const textSelected: any;
    /** Whether text is selected in a focused terminal. `textSelected` counts text selected in an active in a terminal view or an editor, where `textSelectedInFocused` simply counts text in an element with DOM focus. */
    const textSelectedInFocused: any;
    /** Whether text is NOT selected in the active terminal. */
    const notTextSelected: any;
    /** Whether the active terminal's find widget is visible. */
    const findVisible: any;
    /** Whether the active terminal's find widget is NOT visible. */
    const notFindVisible: any;
    /** Whether the active terminal's find widget text input is focused. */
    const findInputFocus: any;
    /** Whether an element within the active terminal's find widget is focused. */
    const findFocus: any;
    /** Whether NO elements within the active terminal's find widget is focused. */
    const notFindFocus: any;
    /** Whether terminal processes can be launched in the current workspace. */
    const processSupported: any;
    /** Whether one terminal is selected in the terminal tabs list. */
    const tabsSingularSelection: any;
    /** Whether the focused tab's terminal is a split terminal. */
    const splitTerminal: any;
    /** Whether the terminal run command picker is currently open. */
    const inTerminalRunCommandPicker: any;
    /** Whether shell integration is enabled in the active terminal. This only considers full VS Code shell integration. */
    const terminalShellIntegrationEnabled: any;
    const shouldShowViewInlineActions: any;
}
