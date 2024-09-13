import{Codicon as C}from"../../../../../base/common/codicons.js";import{KeyCode as g,KeyMod as o}from"../../../../../base/common/keyCodes.js";import{ICodeEditorService as k}from"../../../../../editor/browser/services/codeEditorService.js";import{Selection as d}from"../../../../../editor/common/core/selection.js";import{localize as l,localize2 as c}from"../../../../../nls.js";import{Action2 as r,MenuId as m,registerAction2 as n}from"../../../../../platform/actions/common/actions.js";import{KeybindingWeight as f}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{InlineChatController as y}from"../../../inlineChat/browser/inlineChatController.js";import{CONTEXT_CHAT_ENABLED as v}from"../../common/chatContextKeys.js";import{IQuickChatService as a}from"../chat.js";import{CHAT_CATEGORY as s}from"./chatActions.js";const S="workbench.action.quickchat.toggle";function L(){n(A),n(I),n(class extends r{constructor(){super({id:"workbench.action.quickchat.openInChatView",title:c("chat.openInChatView.label","Open in Chat View"),f1:!1,category:s,icon:C.commentDiscussion,menu:{id:m.ChatInputSide,group:"navigation",order:10}})}run(t){t.get(a).openInChatView()}}),n(class extends r{constructor(){super({id:"workbench.action.quickchat.close",title:c("chat.closeQuickChat.label","Close Quick Chat"),f1:!1,category:s,icon:C.close,menu:{id:m.ChatInputSide,group:"navigation",order:20}})}run(t){t.get(a).close()}}),n(class extends r{constructor(){super({id:"workbench.action.quickchat.launchInlineChat",title:c("chat.launchInlineChat.label","Launch Inline Chat"),f1:!1,category:s})}async run(t){const e=t.get(a),h=t.get(k);e.focused&&e.close();const i=h.getActiveCodeEditor();if(!i)return;const p=y.get(i);p&&(await p.run(),p.focus())}})}class A extends r{constructor(){super({id:S,title:c("quickChat","Quick Chat"),precondition:v,icon:C.commentDiscussion,f1:!1,category:s,keybinding:{weight:f.WorkbenchContrib,primary:o.CtrlCmd|o.Shift|g.KeyI,linux:{primary:o.CtrlCmd|o.Shift|o.Alt|g.KeyI}},metadata:{description:l("toggle.desc","Toggle the quick chat"),args:[{name:"args",schema:{anyOf:[{type:"object",required:["query"],properties:{query:{description:l("toggle.query","The query to open the quick chat with"),type:"string"},isPartialQuery:{description:l("toggle.isPartialQuery","Whether the query is partial; it will wait for more user input"),type:"boolean"}}},{type:"string",description:l("toggle.query","The query to open the quick chat with")}]}}]}})}run(t,e){const h=t.get(a);let i;switch(typeof e){case"string":i={query:e};break;case"object":i=e;break}i?.query&&(i.selection=new d(1,i.query.length+1,1,i.query.length+1)),h.toggle(i)}}class I extends r{constructor(){super({id:"workbench.action.openQuickChat",category:s,title:c("interactiveSession.open","Open Quick Chat"),f1:!0})}run(t,e){t.get(a).toggle(e?{query:e,selection:new d(1,e.length+1,1,e.length+1)}:void 0)}}export{S as ASK_QUICK_QUESTION_ACTION_ID,L as registerQuickChatActions};
