import{ICodeEditorService as a}from"../../../../../editor/browser/services/codeEditorService.js";import{AccessibleDiffViewerNext as p}from"../../../../../editor/browser/widget/diffEditor/commands.js";import{localize as t}from"../../../../../nls.js";import{AccessibleContentProvider as m,AccessibleViewProviderId as r,AccessibleViewType as c}from"../../../../../platform/accessibility/browser/accessibleView.js";import{ContextKeyExpr as h}from"../../../../../platform/contextkey/common/contextkey.js";import{AccessibilityVerbositySettingId as d}from"../../../accessibility/browser/accessibilityConfiguration.js";import{INLINE_CHAT_ID as b}from"../../../inlineChat/common/inlineChat.js";import{ChatAgentLocation as f}from"../../common/chatAgents.js";import{CONTEXT_CHAT_LOCATION as w,CONTEXT_IN_CHAT_SESSION as C,CONTEXT_REQUEST as g,CONTEXT_RESPONSE as y}from"../../common/chatContextKeys.js";import{IChatWidgetService as v}from"../chat.js";class F{priority=107;name="panelChat";type=c.Help;when=h.and(w.isEqualTo(f.Panel),h.or(C,y,g));getProvider(e){const i=e.get(a).getActiveCodeEditor()||e.get(a).getFocusedCodeEditor();return x(e,i??void 0,"panelChat")}}function k(o){const e=[];return o==="panelChat"?(e.push(t("chat.overview","The chat view is comprised of an input box and a request/response list. The input box is used to make requests and the list is used to display responses.")),e.push(t("chat.requestHistory","In the input box, use up and down arrows to navigate your request history. Edit input and use enter or the submit button to run a new request.")),e.push(t("chat.inspectResponse","In the input box, inspect the last response in the accessible view{0}.","<keybinding:editor.action.accessibleView>")),e.push(t("chat.followUp","In the input box, navigate to the suggested follow up question (Shift+Tab) and press Enter to run it.")),e.push(t("chat.announcement","Chat responses will be announced as they come in. A response will indicate the number of code blocks, if any, and then the rest of the response.")),e.push(t("workbench.action.chat.focus","To focus the chat request/response list, which can be navigated with up and down arrows, invoke the Focus Chat command{0}.","<keybinding:chat.action.focus>")),e.push(t("workbench.action.chat.focusInput","To focus the input box for chat requests, invoke the Focus Chat Input command{0}.","<keybinding:workbench.action.chat.focusInput>")),e.push(t("workbench.action.chat.nextCodeBlock","To focus the next code block within a response, invoke the Chat: Next Code Block command{0}.","<keybinding:workbench.action.chat.nextCodeBlock>")),e.push(t("workbench.action.chat.nextFileTree","To focus the next file tree within a response, invoke the Chat: Next File Tree command{0}.","<keybinding:workbench.action.chat.nextFileTree>")),e.push(t("workbench.action.chat.newChat","To create a new chat session, invoke the New Chat command{0}.","<keybinding:workbench.action.chat.new>"))):(e.push(t("inlineChat.overview","Inline chat occurs within a code editor and takes into account the current selection. It is useful for making changes to the current editor. For example, fixing diagnostics, documenting or refactoring code. Keep in mind that AI generated code may be incorrect.")),e.push(t("inlineChat.access","It can be activated via code actions or directly using the command: Inline Chat: Start Inline Chat{0}.","<keybinding:inlineChat.start>")),e.push(t("inlineChat.requestHistory","In the input box, use Show Previous{0} and Show Next{1} to navigate your request history. Edit input and use enter or the submit button to run a new request.","<keybinding:history.showPrevious>","<keybinding:history.showNext>")),e.push(t("inlineChat.inspectResponse","In the input box, inspect the response in the accessible view{0}.","<keybinding:editor.action.accessibleView>")),e.push(t("inlineChat.contextActions","Context menu actions may run a request prefixed with a /. Type / to discover such ready-made commands.")),e.push(t("inlineChat.fix","If a fix action is invoked, a response will indicate the problem with the current code. A diff editor will be rendered and can be reached by tabbing.")),e.push(t("inlineChat.diff","Once in the diff editor, enter review mode with{0}. Use up and down arrows to navigate lines with the proposed changes.",p.id)),e.push(t("inlineChat.toolbar","Use tab to reach conditional parts like commands, status, message responses and more."))),e.push(t("chat.signals","Accessibility Signals can be changed via settings with a prefix of signals.chat. By default, if a request takes more than 4 seconds, you will hear a sound indicating that progress is still occurring.")),e.join(`
`)}function x(o,e,i){const u=o.get(v),n=i==="panelChat"?u.lastFocusedWidget?.inputEditor:e;if(!n||!(n.getDomNode()??void 0))return;const s=n.getPosition();n.getSupportedActions();const l=k(i);return new m(i==="panelChat"?r.Chat:r.InlineChat,{type:c.Help},()=>l,()=>{i==="panelChat"&&s?(n.setPosition(s),n.focus()):i==="inlineChat"&&e?.getContribution(b)?.focus()},i==="panelChat"?d.Chat:d.InlineChat)}export{F as ChatAccessibilityHelp,k as getAccessibilityHelpText,x as getChatAccessibilityHelpProvider};
