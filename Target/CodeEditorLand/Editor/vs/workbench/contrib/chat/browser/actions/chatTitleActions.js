import{Codicon as a}from"../../../../../../vs/base/common/codicons.js";import{KeyCode as I,KeyMod as _}from"../../../../../../vs/base/common/keyCodes.js";import{marked as A}from"vs/base/common/marked/marked";import"../../../../../../vs/editor/browser/editorExtensions.js";import{IBulkEditService as x}from"../../../../../../vs/editor/browser/services/bulkEditService.js";import{localize2 as c}from"../../../../../../vs/nls.js";import{Action2 as d,MenuId as l,registerAction2 as u}from"../../../../../../vs/platform/actions/common/actions.js";import{ContextKeyExpr as m}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{KeybindingWeight as M}from"../../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{ResourceNotebookCellEdit as q}from"../../../../../../vs/workbench/contrib/bulkEdit/browser/bulkCellEdits.js";import{CHAT_CATEGORY as g}from"../../../../../../vs/workbench/contrib/chat/browser/actions/chatActions.js";import{IChatWidgetService as P}from"../../../../../../vs/workbench/contrib/chat/browser/chat.js";import{CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING as U,CONTEXT_IN_CHAT_INPUT as B,CONTEXT_IN_CHAT_SESSION as D,CONTEXT_REQUEST as X,CONTEXT_RESPONSE as f,CONTEXT_RESPONSE_ERROR as T,CONTEXT_RESPONSE_FILTERED as H,CONTEXT_RESPONSE_VOTE as v,CONTEXT_VOTE_UP_ENABLED as K}from"../../../../../../vs/workbench/contrib/chat/common/chatContextKeys.js";import{ChatAgentVoteDirection as h,IChatService as E}from"../../../../../../vs/workbench/contrib/chat/common/chatService.js";import{isRequestVM as S,isResponseVM as p}from"../../../../../../vs/workbench/contrib/chat/common/chatViewModel.js";import"../../../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import{CellEditType as V,CellKind as k,NOTEBOOK_EDITOR_ID as F}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{NOTEBOOK_IS_ACTIVE_EDITOR as W}from"../../../../../../vs/workbench/contrib/notebook/common/notebookContextKeys.js";import{IEditorService as L}from"../../../../../../vs/workbench/services/editor/common/editorService.js";function Te(){u(class extends d{constructor(){super({id:"workbench.action.chat.markHelpful",title:c("interactive.helpful.label","Helpful"),f1:!1,category:g,icon:a.thumbsup,toggled:v.isEqualTo("up"),menu:{id:l.ChatMessageTitle,group:"navigation",order:1,when:m.and(f,K,T.negate())}})}run(o,...n){const e=n[0];if(!p(e))return;o.get(E).notifyUserAction({agentId:e.agent?.id,command:e.slashCommand?.name,sessionId:e.sessionId,requestId:e.requestId,result:e.result,action:{kind:"vote",direction:h.Up}}),e.setVote(h.Up)}}),u(class extends d{constructor(){super({id:"workbench.action.chat.markUnhelpful",title:c("interactive.unhelpful.label","Unhelpful"),f1:!1,category:g,icon:a.thumbsdown,toggled:v.isEqualTo("down"),menu:{id:l.ChatMessageTitle,group:"navigation",order:2,when:m.and(f,T.negate())}})}run(o,...n){const e=n[0];if(!p(e))return;o.get(E).notifyUserAction({agentId:e.agent?.id,command:e.slashCommand?.name,sessionId:e.sessionId,requestId:e.requestId,result:e.result,action:{kind:"vote",direction:h.Down}}),e.setVote(h.Down)}}),u(class extends d{constructor(){super({id:"workbench.action.chat.reportIssueForBug",title:c("interactive.reportIssueForBug.label","Report Issue"),f1:!1,category:g,icon:a.report,menu:{id:l.ChatMessageTitle,group:"navigation",order:3,when:m.and(U,f)}})}run(o,...n){const e=n[0];if(!p(e))return;o.get(E).notifyUserAction({agentId:e.agent?.id,command:e.slashCommand?.name,sessionId:e.sessionId,requestId:e.requestId,result:e.result,action:{kind:"bug"}})}}),u(class extends d{constructor(){super({id:"workbench.action.chat.insertIntoNotebook",title:c("interactive.insertIntoNotebook.label","Insert into Notebook"),f1:!1,category:g,icon:a.insert,menu:{id:l.ChatMessageTitle,group:"navigation",isHiddenByDefault:!0,when:m.and(W,f,H.negate())}})}async run(o,...n){const e=n[0];if(!p(e))return;const t=o.get(L);if(t.activeEditorPane?.getId()===F){const r=t.activeEditorPane.getControl();if(!r.hasModel()||r.isReadOnly)return;const C=e.response.toString(),y=G(C),w=r.getFocus(),b=Math.max(w.end,0);await o.get(x).apply([new q(r.textModel.uri,{editType:V.Replace,index:b,count:0,cells:y.map(s=>{const N=s.type==="markdown"?k.Markup:k.Code,O=s.type==="markdown"?"markdown":s.language,R=s.type==="markdown"?"text/markdown":`text/x-${s.language}`;return{cellKind:N,language:O,mime:R,source:s.content,outputs:[],metadata:{}}})})],{quotableLabel:"Insert into Notebook"})}}}),u(class extends d{constructor(){super({id:"workbench.action.chat.remove",title:c("chat.remove.label","Remove Request and Response"),f1:!1,category:g,icon:a.x,keybinding:{primary:I.Delete,mac:{primary:_.CtrlCmd|I.Backspace},when:m.and(D,B.negate()),weight:M.WorkbenchContrib},menu:{id:l.ChatMessageTitle,group:"navigation",order:2,when:X}})}run(o,...n){let e=n[0];S(e)||(e=o.get(P).lastFocusedWidget?.getFocus());const t=S(e)?e.id:p(e)?e.requestId:void 0;t&&o.get(E).removeRequest(e.sessionId,t)}})}function G(i){const n=new A.Lexer().lex(i),e=[];let t="";return n.forEach(r=>{r.type==="code"?(t.trim()&&(e.push({type:"markdown",content:t}),t=""),e.push({type:"code",language:r.lang||"",content:r.text})):t+=r.raw}),t.trim()&&e.push({type:"markdown",content:t}),e}export{Te as registerChatTitleActions};
