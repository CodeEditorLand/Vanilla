import"../../../../../editor/browser/editorExtensions.js";import{localize2 as n}from"../../../../../nls.js";import{Action2 as a,MenuId as l,registerAction2 as p}from"../../../../../platform/actions/common/actions.js";import{IClipboardService as d}from"../../../../../platform/clipboard/common/clipboardService.js";import{CHAT_CATEGORY as m,stringifyItem as f}from"./chatActions.js";import{IChatWidgetService as y}from"../chat.js";import{CONTEXT_RESPONSE_FILTERED as g}from"../../common/chatContextKeys.js";import{isRequestVM as C,isResponseVM as u}from"../../common/chatViewModel.js";function q(){p(class extends a{constructor(){super({id:"workbench.action.chat.copyAll",title:n("interactive.copyAll.label","Copy All"),f1:!1,category:m,menu:{id:l.ChatContext,when:g.toNegated(),group:"copy"}})}run(o,...r){const e=o.get(d),i=o.get(y).lastFocusedWidget;if(i){const c=i.viewModel?.getItems().filter(t=>C(t)||u(t)&&!t.errorDetails?.responseIsFiltered).map(t=>f(t)).join(`

`);c&&e.writeText(c)}}}),p(class extends a{constructor(){super({id:"workbench.action.chat.copyItem",title:n("interactive.copyItem.label","Copy"),f1:!1,category:m,menu:{id:l.ChatContext,when:g.toNegated(),group:"copy"}})}run(o,...r){const e=r[0];if(!C(e)&&!u(e))return;const s=o.get(d),i=f(e,!1);s.writeText(i)}})}export{q as registerChatCopyActions};
