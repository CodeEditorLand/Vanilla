import{Codicon as E}from"../../../../../base/common/codicons.js";import{KeyCode as r,KeyMod as a}from"../../../../../base/common/keyCodes.js";import"../../../../../editor/browser/editorExtensions.js";import{localize2 as g}from"../../../../../nls.js";import{Action2 as u,MenuId as d,registerAction2 as p}from"../../../../../platform/actions/common/actions.js";import{ContextKeyExpr as l}from"../../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as C}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{IChatAgentService as I}from"../../common/chatAgents.js";import{CONTEXT_CHAT_INPUT_HAS_AGENT as b,CONTEXT_CHAT_INPUT_HAS_TEXT as x,CONTEXT_CHAT_REQUEST_IN_PROGRESS as s,CONTEXT_IN_CHAT_INPUT as A}from"../../common/chatContextKeys.js";import{chatAgentLeader as T,extractAgentAndCommand as v}from"../../common/chatParserTypes.js";import{IChatService as _}from"../../common/chatService.js";import{IChatWidgetService as h}from"../chat.js";import{CHAT_CATEGORY as S}from"./chatActions.js";class f extends u{static ID="workbench.action.chat.submit";constructor(){super({id:f.ID,title:g("interactive.submit.label","Send"),f1:!1,category:S,icon:E.send,precondition:l.and(x,s.negate()),keybinding:{when:A,primary:r.Enter,weight:C.EditorContrib},menu:[{id:d.ChatExecuteSecondary,group:"group_1"},{id:d.ChatExecute,when:s.negate(),group:"navigation"}]})}run(t,...i){const n=i[0],o=t.get(h);(n?.widget??o.lastFocusedWidget)?.acceptInput(n?.inputValue)}}class y extends u{static ID="workbench.action.chat.submitSecondaryAgent";constructor(){super({id:y.ID,title:g({key:"actions.chat.submitSecondaryAgent",comment:["Send input from the chat input box to the secondary agent"]},"Submit to Secondary Agent"),precondition:l.and(x,b.negate(),s.negate()),keybinding:{when:A,primary:a.CtrlCmd|r.Enter,weight:C.EditorContrib},menu:{id:d.ChatExecuteSecondary,group:"group_1"}})}run(t,...i){const n=i[0],e=t.get(I).getSecondaryAgent();if(!e)return;const m=t.get(h),c=n?.widget??m.lastFocusedWidget;c&&(v(c.parsedInput).agentPart?c.acceptInput():(c.lastSelectedAgent=e,c.acceptInputWithPrefix(`${T}${e.name}`)))}}class N extends u{constructor(){super({id:"workbench.action.chat.sendToNewChat",title:g("chat.newChat.label","Send to New Chat"),precondition:l.and(s.negate(),x),category:S,f1:!1,menu:{id:d.ChatExecuteSecondary,group:"group_2"},keybinding:{weight:C.WorkbenchContrib,primary:a.CtrlCmd|a.Shift|r.Enter,when:A}})}async run(t,...i){const n=i[0],o=t.get(h),e=n?.widget??o.lastFocusedWidget;e&&(e.clear(),e.acceptInput(n?.inputValue))}}class w extends u{static ID="workbench.action.chat.cancel";constructor(){super({id:w.ID,title:g("interactive.cancel.label","Cancel"),f1:!1,category:S,icon:E.debugStop,menu:{id:d.ChatExecute,when:s,group:"navigation"},keybinding:{weight:C.WorkbenchContrib,primary:a.CtrlCmd|r.Escape,win:{primary:a.Alt|r.Backspace}}})}run(t,...i){const n=i[0],o=t.get(h),e=n?.widget??o.lastFocusedWidget;if(!e)return;const m=t.get(_);e.viewModel&&m.cancelCurrentRequestForSession(e.viewModel.sessionId)}}function z(){p(f),p(w),p(N),p(y)}export{w as CancelAction,y as ChatSubmitSecondaryAgentAction,f as SubmitAction,z as registerChatExecuteActions};
