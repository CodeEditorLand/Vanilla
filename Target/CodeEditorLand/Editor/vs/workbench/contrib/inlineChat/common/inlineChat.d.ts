export declare const enum InlineChatConfigKeys {
    Mode = "inlineChat.mode",
    FinishOnType = "inlineChat.finishOnType",
    AcceptedOrDiscardBeforeSave = "inlineChat.acceptedOrDiscardBeforeSave",
    StartWithOverlayWidget = "inlineChat.startWithOverlayWidget",
    ZoneToolbar = "inlineChat.experimental.enableZoneToolbar",
    HoldToSpeech = "inlineChat.holdToSpeech",
    AccessibleDiffView = "inlineChat.accessibleDiffView"
}
export declare const enum EditMode {
    Live = "live",
    Preview = "preview"
}
export declare const INLINE_CHAT_ID = "interactiveEditor";
export declare const INTERACTIVE_EDITOR_ACCESSIBILITY_HELP_ID = "interactiveEditorAccessiblityHelp";
export declare const enum InlineChatResponseType {
    None = "none",
    Messages = "messages",
    MessagesAndEdits = "messagesAndEdits"
}
export declare const CTX_INLINE_CHAT_HAS_AGENT: any;
export declare const CTX_INLINE_CHAT_VISIBLE: any;
export declare const CTX_INLINE_CHAT_FOCUSED: any;
export declare const CTX_INLINE_CHAT_EDITING: any;
export declare const CTX_INLINE_CHAT_RESPONSE_FOCUSED: any;
export declare const CTX_INLINE_CHAT_EMPTY: any;
export declare const CTX_INLINE_CHAT_INNER_CURSOR_FIRST: any;
export declare const CTX_INLINE_CHAT_INNER_CURSOR_LAST: any;
export declare const CTX_INLINE_CHAT_INNER_CURSOR_START: any;
export declare const CTX_INLINE_CHAT_INNER_CURSOR_END: any;
export declare const CTX_INLINE_CHAT_OUTER_CURSOR_POSITION: any;
export declare const CTX_INLINE_CHAT_HAS_STASHED_SESSION: any;
export declare const CTX_INLINE_CHAT_USER_DID_EDIT: any;
export declare const CTX_INLINE_CHAT_DOCUMENT_CHANGED: any;
export declare const CTX_INLINE_CHAT_CHANGE_HAS_DIFF: any;
export declare const CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF: any;
export declare const CTX_INLINE_CHAT_EDIT_MODE: any;
export declare const CTX_INLINE_CHAT_REQUEST_IN_PROGRESS: any;
export declare const CTX_INLINE_CHAT_RESPONSE_TYPE: any;
export declare const CTX_INLINE_CHAT_SUPPORT_REPORT_ISSUE: any;
export declare const ACTION_ACCEPT_CHANGES = "inlineChat.acceptChanges";
export declare const ACTION_REGENERATE_RESPONSE = "inlineChat.regenerate";
export declare const ACTION_VIEW_IN_CHAT = "inlineChat.viewInChat";
export declare const ACTION_TOGGLE_DIFF = "inlineChat.toggleDiff";
export declare const ACTION_REPORT_ISSUE = "inlineChat.reportIssue";
export declare const MENU_INLINE_CHAT_CONTENT_STATUS: any;
export declare const MENU_INLINE_CHAT_WIDGET_STATUS: any;
export declare const MENU_INLINE_CHAT_ZONE: any;
export declare const inlineChatForeground: any;
export declare const inlineChatBackground: any;
export declare const inlineChatBorder: any;
export declare const inlineChatShadow: any;
export declare const inlineChatInputBorder: any;
export declare const inlineChatInputFocusBorder: any;
export declare const inlineChatInputPlaceholderForeground: any;
export declare const inlineChatInputBackground: any;
export declare const inlineChatDiffInserted: any;
export declare const overviewRulerInlineChatDiffInserted: any;
export declare const minimapInlineChatDiffInserted: any;
export declare const inlineChatDiffRemoved: any;
export declare const overviewRulerInlineChatDiffRemoved: any;
