import{Codicon as I}from"../../../../../vs/base/common/codicons.js";import{KeyChord as P,KeyCode as a,KeyMod as l}from"../../../../../vs/base/common/keyCodes.js";import{isCodeEditor as U,isDiffEditor as M}from"../../../../../vs/editor/browser/editorBrowser.js";import{EditorAction2 as v}from"../../../../../vs/editor/browser/editorExtensions.js";import{ICodeEditorService as q}from"../../../../../vs/editor/browser/services/codeEditorService.js";import{EmbeddedCodeEditorWidget as F}from"../../../../../vs/editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";import{EmbeddedDiffEditorWidget as X}from"../../../../../vs/editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";import{EditorContextKeys as _}from"../../../../../vs/editor/common/editorContextKeys.js";import{localize as p,localize2 as u}from"../../../../../vs/nls.js";import{CONTEXT_ACCESSIBILITY_MODE_ENABLED as w}from"../../../../../vs/platform/accessibility/common/accessibility.js";import"../../../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as O}from"../../../../../vs/platform/commands/common/commands.js";import{ContextKeyExpr as t}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as W}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as d}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{ILogService as G}from"../../../../../vs/platform/log/common/log.js";import{registerIcon as K}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{CONTEXT_CHAT_INPUT_HAS_TEXT as y,CONTEXT_IN_CHAT_INPUT as z}from"../../../../../vs/workbench/contrib/chat/common/chatContextKeys.js";import{IChatService as V}from"../../../../../vs/workbench/contrib/chat/common/chatService.js";import{InlineChatController as f,InlineChatRunOptions as B}from"../../../../../vs/workbench/contrib/inlineChat/browser/inlineChatController.js";import"../../../../../vs/workbench/contrib/inlineChat/browser/inlineChatSession.js";import{ACTION_ACCEPT_CHANGES as R,ACTION_REGENERATE_RESPONSE as Z,ACTION_REPORT_ISSUE as Y,ACTION_TOGGLE_DIFF as Q,ACTION_VIEW_IN_CHAT as j,CTX_INLINE_CHAT_CHANGE_HAS_DIFF as k,CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF as J,CTX_INLINE_CHAT_DOCUMENT_CHANGED as $,CTX_INLINE_CHAT_EDIT_MODE as N,CTX_INLINE_CHAT_FOCUSED as H,CTX_INLINE_CHAT_HAS_AGENT as D,CTX_INLINE_CHAT_HAS_STASHED_SESSION as ee,CTX_INLINE_CHAT_INNER_CURSOR_FIRST as oe,CTX_INLINE_CHAT_INNER_CURSOR_LAST as re,CTX_INLINE_CHAT_OUTER_CURSOR_POSITION as L,CTX_INLINE_CHAT_REQUEST_IN_PROGRESS as A,CTX_INLINE_CHAT_RESPONSE_TYPE as h,CTX_INLINE_CHAT_SUPPORT_REPORT_ISSUE as te,CTX_INLINE_CHAT_USER_DID_EDIT as ne,CTX_INLINE_CHAT_VISIBLE as C,EditMode as S,InlineChatResponseType as T,MENU_INLINE_CHAT_CONTENT_STATUS as ie,MENU_INLINE_CHAT_WIDGET_STATUS as g,MENU_INLINE_CHAT_ZONE as x}from"../../../../../vs/workbench/contrib/inlineChat/common/inlineChat.js";import{IEditorService as se}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IPreferencesService as ae}from"../../../../../vs/workbench/services/preferences/common/preferences.js";O.registerCommandAlias("interactiveEditor.start","inlineChat.start"),O.registerCommandAlias("interactive.acceptChanges",R);const de=u("run","Start in Editor"),ce=K("start-inline-chat",I.sparkle,p("startInlineChat","Icon which spawns the inline chat from the editor toolbar."));let b;function qe(s){b=s}class Fe extends v{constructor(){super({id:"inlineChat.start",title:de,category:i.category,f1:!0,precondition:t.and(D,_.writable),keybinding:{when:_.focus,weight:d.WorkbenchContrib,primary:l.CtrlCmd|a.KeyI,secondary:[P(l.CtrlCmd|a.KeyK,a.KeyI)]},icon:ce})}runEditorCommand(o,e,...n){const r=f.get(e);if(!r)return;b&&o.get(W).invokeFunction(b,r,this);let E;const m=n[0];m&&B.isInlineChatRunOptions(m)&&(E=m),f.get(e)?.run({...E})}}class Xe extends v{constructor(){super({id:"inlineChat.unstash",title:u("unstash","Resume Last Dismissed Inline Chat"),category:i.category,precondition:t.and(ee,_.writable),keybinding:{weight:d.WorkbenchContrib,primary:l.CtrlCmd|a.KeyZ}})}async runEditorCommand(o,e,...n){const r=f.get(e);if(r){const E=r.unstashLastSession();E&&r.run({existingSession:E,isUnstashed:!0})}}}class i extends v{static category=u("cat","Inline Chat");constructor(o){super({...o,category:i.category,precondition:t.and(D,o.precondition)})}runEditorCommand(o,e,...n){const r=o.get(se),E=o.get(G);let m=f.get(e);if(!m){const{activeTextEditorControl:c}=r;U(c)?e=c:M(c)&&(e=c.getModifiedEditor()),m=f.get(e)}if(!m){E.warn("[IE] NO controller found for action",this.desc.id,e.getModel()?.uri);return}if(e instanceof F&&(e=e.getParentEditor()),!m){for(const c of o.get(q).listDiffEditors())(c.getOriginalEditor()===e||c.getModifiedEditor()===e)&&c instanceof X&&this.runEditorCommand(o,c.getParentEditor(),...n);return}this.runInlineChatCommand(o,m,e,...n)}}class We extends i{constructor(){super({id:"inlineChat.arrowOutUp",title:p("arrowUp","Cursor Up"),precondition:t.and(H,oe,_.isEmbeddedDiffEditor.negate(),w.negate()),keybinding:{weight:d.EditorCore,primary:l.CtrlCmd|a.UpArrow}})}runInlineChatCommand(o,e,n,...r){e.arrowOut(!0)}}class Ge extends i{constructor(){super({id:"inlineChat.arrowOutDown",title:p("arrowDown","Cursor Down"),precondition:t.and(H,re,_.isEmbeddedDiffEditor.negate(),w.negate()),keybinding:{weight:d.EditorCore,primary:l.CtrlCmd|a.DownArrow}})}runInlineChatCommand(o,e,n,...r){e.arrowOut(!1)}}class Ke extends v{constructor(){super({id:"inlineChat.focus",title:u("focus","Focus Input"),f1:!0,category:i.category,precondition:t.and(_.editorTextFocus,C,H.negate(),w.negate()),keybinding:[{weight:d.EditorCore+10,when:t.and(L.isEqualTo("above"),_.isEmbeddedDiffEditor.negate()),primary:l.CtrlCmd|a.DownArrow},{weight:d.EditorCore+10,when:t.and(L.isEqualTo("below"),_.isEmbeddedDiffEditor.negate()),primary:l.CtrlCmd|a.UpArrow}]})}runEditorCommand(o,e,...n){f.get(e)?.focus()}}class ze extends i{constructor(){super({id:"inlineChat.discard",title:p("discard","Discard"),icon:I.discard,precondition:C,keybinding:{weight:d.EditorContrib-1,primary:a.Escape,when:ne.negate()}})}async runInlineChatCommand(o,e,n,...r){await e.cancelSession()}}class Ve extends i{constructor(){super({id:R,title:u("apply1","Accept Changes"),shortTitle:p("apply2","Accept"),icon:I.check,f1:!0,precondition:t.and(C,t.or($.toNegated(),N.notEqualsTo(S.Preview))),keybinding:[{weight:d.WorkbenchContrib+10,primary:l.CtrlCmd|a.Enter}],menu:[{id:g,group:"0_main",order:1,when:t.and(y.toNegated(),A.toNegated(),h.isEqualTo(T.MessagesAndEdits))},{id:x,group:"navigation",order:1}]})}async runInlineChatCommand(o,e,n,r){e.acceptHunk(r)}}class Be extends i{constructor(){super({id:"inlineChat.discardHunkChange",title:p("discard","Discard"),icon:I.chromeClose,precondition:C,menu:[{id:g,group:"0_main",order:2,when:t.and(y.toNegated(),A.negate(),h.isEqualTo(T.MessagesAndEdits),N.isEqualTo(S.Live))},{id:x,group:"navigation",order:2}],keybinding:{weight:d.WorkbenchContrib,primary:a.Escape,when:h.isEqualTo(T.MessagesAndEdits)}})}async runInlineChatCommand(o,e,n,r){return e.discardHunk(r)}}class Ze extends i{constructor(){super({id:Z,title:u("chat.rerun.label","Rerun Request"),shortTitle:p("rerun","Rerun"),f1:!1,icon:I.refresh,precondition:C,menu:{id:g,group:"0_main",order:5,when:t.and(y.toNegated(),A.negate(),h.notEqualsTo(T.None))},keybinding:{weight:d.WorkbenchContrib,primary:l.CtrlCmd|a.KeyR}})}async runInlineChatCommand(o,e,n,...r){const E=o.get(V),c=e.chatWidget.viewModel?.model?.getRequests().at(-1);c&&await E.resendRequest(c,{noCommandDetection:!1,attempt:c.attempt+1,location:e.chatWidget.location})}}class Ye extends i{constructor(){super({id:"inlineChat.close",title:p("close","Close"),icon:I.close,precondition:C,keybinding:{weight:d.WorkbenchContrib,primary:a.Escape},menu:[{id:ie,group:"0_main",order:10},{id:g,group:"0_main",order:1,when:t.and(A.negate(),t.or(h.isEqualTo(T.Messages),N.isEqualTo(S.Preview)))}]})}async runInlineChatCommand(o,e,n,...r){e.cancelSession()}}class Qe extends i{constructor(){super({id:"inlineChat.configure",title:u("configure","Configure Inline Chat"),icon:I.settingsGear,precondition:C,f1:!0,menu:{id:g,group:"zzz",order:5}})}async runInlineChatCommand(o,e,n,...r){o.get(ae).openSettings({query:"inlineChat"})}}class je extends i{constructor(){super({id:"inlineChat.moveToNextHunk",title:u("moveToNextHunk","Move to Next Change"),precondition:C,f1:!0,keybinding:{weight:d.WorkbenchContrib,primary:a.F7}})}runInlineChatCommand(o,e,n,...r){e.moveHunk(!0)}}class Je extends i{constructor(){super({id:"inlineChat.moveToPreviousHunk",title:u("moveToPreviousHunk","Move to Previous Change"),f1:!0,precondition:C,keybinding:{weight:d.WorkbenchContrib,primary:l.Shift|a.F7}})}runInlineChatCommand(o,e,n,...r){e.moveHunk(!1)}}class $e extends i{constructor(){super({id:j,title:p("viewInChat","View in Chat"),icon:I.commentDiscussion,precondition:C,menu:[{id:g,group:"more",order:1,when:h.notEqualsTo(T.Messages)},{id:g,group:"0_main",order:1,when:t.and(y.toNegated(),h.isEqualTo(T.Messages),A.negate())}],keybinding:{weight:d.WorkbenchContrib,primary:l.CtrlCmd|a.DownArrow,when:z}})}runInlineChatCommand(o,e,n,...r){return e.viewInChat()}}class eo extends i{constructor(){super({id:Q,precondition:t.and(C,N.isEqualTo(S.Live),k),title:u("showChanges","Toggle Changes"),icon:I.diffSingle,toggled:{condition:J},menu:[{id:g,group:"zzz",when:t.and(N.isEqualTo(S.Live)),order:1},{id:x,group:"navigation",when:k,order:2}]})}runInlineChatCommand(o,e,n,r){e.toggleDiff(r)}}class oo extends i{constructor(){super({id:Y,title:u("reportIssue","Report Issue"),icon:I.report,menu:[{id:g,group:"0_main",order:6,when:t.and(C,te,h.notEqualsTo(T.None),A.negate())}]})}runInlineChatCommand(o,e){e.reportIssue()}}export{i as AbstractInlineChatAction,Ve as AcceptChanges,Ge as ArrowOutDownAction,We as ArrowOutUpAction,Ye as CloseAction,Qe as ConfigureInlineChatAction,ze as DiscardAction,Be as DiscardHunkAction,Ke as FocusInlineChat,de as LOCALIZED_START_INLINE_CHAT_STRING,je as MoveToNextHunk,Je as MoveToPreviousHunk,oo as ReportIssueAction,Ze as RerunAction,ce as START_INLINE_CHAT,Fe as StartSessionAction,eo as ToggleDiffForChange,Xe as UnstashSessionAction,$e as ViewInChatAction,qe as setHoldForSpeech};