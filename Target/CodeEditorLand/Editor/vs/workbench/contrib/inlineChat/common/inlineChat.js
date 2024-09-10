import{localize as e}from"../../../../nls.js";import{MenuId as h}from"../../../../platform/actions/common/actions.js";import{Extensions as c}from"../../../../platform/configuration/common/configurationRegistry.js";import{RawContextKey as n}from"../../../../platform/contextkey/common/contextkey.js";import{Registry as C}from"../../../../platform/registry/common/platform.js";import{diffInserted as o,diffRemoved as a,editorWidgetBackground as p,editorWidgetBorder as d,editorWidgetForeground as f,focusBorder as u,inputBackground as I,inputPlaceholderForeground as _,registerColor as t,transparent as i,widgetShadow as g}from"../../../../platform/theme/common/colorRegistry.js";var E=(r=>(r.Mode="inlineChat.mode",r.FinishOnType="inlineChat.finishOnType",r.AcceptedOrDiscardBeforeSave="inlineChat.acceptedOrDiscardBeforeSave",r.StartWithOverlayWidget="inlineChat.startWithOverlayWidget",r.ZoneToolbar="inlineChat.experimental.enableZoneToolbar",r.HoldToSpeech="inlineChat.holdToSpeech",r.AccessibleDiffView="inlineChat.accessibleDiffView",r))(E||{}),T=(l=>(l.Live="live",l.Preview="preview",l))(T||{});C.as(c.Configuration).registerConfiguration({id:"editor",properties:{["inlineChat.mode"]:{description:e("mode","Configure if changes crafted with inline chat are applied directly to the document or are previewed first."),default:"live",type:"string",enum:["live","preview"],markdownEnumDescriptions:[e("mode.live","Changes are applied directly to the document, can be highlighted via inline diffs, and accepted/discarded by hunks. Ending a session will keep the changes."),e("mode.preview","Changes are previewed only and need to be accepted via the apply button. Ending a session will discard the changes.")],tags:["experimental"]},["inlineChat.finishOnType"]:{description:e("finishOnType","Whether to finish an inline chat session when typing outside of changed regions."),default:!1,type:"boolean"},["inlineChat.acceptedOrDiscardBeforeSave"]:{description:e("acceptedOrDiscardBeforeSave","Whether pending inline chat sessions prevent saving."),default:!0,type:"boolean"},["inlineChat.holdToSpeech"]:{description:e("holdToSpeech","Whether holding the inline chat keybinding will automatically enable speech recognition."),default:!0,type:"boolean"},["inlineChat.accessibleDiffView"]:{description:e("accessibleDiffView","Whether the inline chat also renders an accessible diff viewer for its changes."),default:"auto",type:"string",enum:["auto","on","off"],markdownEnumDescriptions:[e("accessibleDiffView.auto","The accessible diff viewer is based on screen reader mode being enabled."),e("accessibleDiffView.on","The accessible diff viewer is always enabled."),e("accessibleDiffView.off","The accessible diff viewer is never enabled.")]},["inlineChat.experimental.enableZoneToolbar"]:{description:e("zoneToolbar","Whether to show a toolbar to accept or reject changes in the inline chat changes view."),default:!1,type:"boolean",tags:["experimental"]}}});const x="interactiveEditor",R="interactiveEditorAccessiblityHelp";var v=(s=>(s.None="none",s.Messages="messages",s.MessagesAndEdits="messagesAndEdits",s))(v||{});const O=new n("inlineChatHasProvider",!1,e("inlineChatHasProvider","Whether a provider for interactive editors exists")),H=new n("inlineChatVisible",!1,e("inlineChatVisible","Whether the interactive editor input is visible")),L=new n("inlineChatFocused",!1,e("inlineChatFocused","Whether the interactive editor input is focused")),W=new n("inlineChatEditing",!0,e("inlineChatEditing","Whether the user is currently editing or generating code in the inline chat")),y=new n("inlineChatResponseFocused",!1,e("inlineChatResponseFocused","Whether the interactive widget's response is focused")),k=new n("inlineChatEmpty",!1,e("inlineChatEmpty","Whether the interactive editor input is empty")),F=new n("inlineChatInnerCursorFirst",!1,e("inlineChatInnerCursorFirst","Whether the cursor of the iteractive editor input is on the first line")),B=new n("inlineChatInnerCursorLast",!1,e("inlineChatInnerCursorLast","Whether the cursor of the iteractive editor input is on the last line")),P=new n("inlineChatInnerCursorStart",!1,e("inlineChatInnerCursorStart","Whether the cursor of the iteractive editor input is on the start of the input")),X=new n("inlineChatInnerCursorEnd",!1,e("inlineChatInnerCursorEnd","Whether the cursor of the iteractive editor input is on the end of the input")),U=new n("inlineChatOuterCursorPosition","",e("inlineChatOuterCursorPosition","Whether the cursor of the outer editor is above or below the interactive editor input")),M=new n("inlineChatHasStashedSession",!1,e("inlineChatHasStashedSession","Whether interactive editor has kept a session for quick restore")),G=new n("inlineChatUserDidEdit",void 0,e("inlineChatUserDidEdit","Whether the user did changes ontop of the inline chat")),V=new n("inlineChatDocumentChanged",!1,e("inlineChatDocumentChanged","Whether the document has changed concurrently")),Z=new n("inlineChatChangeHasDiff",!1,e("inlineChatChangeHasDiff","Whether the current change supports showing a diff")),q=new n("inlineChatChangeShowsDiff",!1,e("inlineChatChangeShowsDiff","Whether the current change showing a diff")),Y=new n("config.inlineChat.mode","live"),j=new n("inlineChatRequestInProgress",!1,e("inlineChatRequestInProgress","Whether an inline chat request is currently in progress")),z=new n("inlineChatResponseType","none",e("inlineChatResponseTypes","What type was the responses have been receieved, nothing yet, just messages, or messaged and local edits")),Q="inlineChat.acceptChanges",J="inlineChat.discardHunkChange",K="inlineChat.regenerate",$="inlineChat.viewInChat",ee="inlineChat.toggleDiff",ne="inlineChat.reportIssue",ie=h.for("inlineChatWidget.status"),te=h.for("inlineChatWidget.secondary"),oe=h.for("inlineChatWidget.changesZone"),re=t("inlineChat.foreground",f,e("inlineChat.foreground","Foreground color of the interactive editor widget")),ae=t("inlineChat.background",p,e("inlineChat.background","Background color of the interactive editor widget")),se=t("inlineChat.border",d,e("inlineChat.border","Border color of the interactive editor widget")),he=t("inlineChat.shadow",g,e("inlineChat.shadow","Shadow color of the interactive editor widget")),le=t("inlineChatInput.border",d,e("inlineChatInput.border","Border color of the interactive editor input")),de=t("inlineChatInput.focusBorder",u,e("inlineChatInput.focusBorder","Border color of the interactive editor input when focused")),ce=t("inlineChatInput.placeholderForeground",_,e("inlineChatInput.placeholderForeground","Foreground color of the interactive editor input placeholder")),Ce=t("inlineChatInput.background",I,e("inlineChatInput.background","Background color of the interactive editor input")),pe=t("inlineChatDiff.inserted",i(o,.5),e("inlineChatDiff.inserted","Background color of inserted text in the interactive editor input")),fe=t("editorOverviewRuler.inlineChatInserted",{dark:i(o,.6),light:i(o,.8),hcDark:i(o,.6),hcLight:i(o,.8)},e("editorOverviewRuler.inlineChatInserted","Overview ruler marker color for inline chat inserted content.")),ue=t("editorOverviewRuler.inlineChatInserted",{dark:i(o,.6),light:i(o,.8),hcDark:i(o,.6),hcLight:i(o,.8)},e("editorOverviewRuler.inlineChatInserted","Overview ruler marker color for inline chat inserted content.")),Ie=t("inlineChatDiff.removed",i(a,.5),e("inlineChatDiff.removed","Background color of removed text in the interactive editor input")),_e=t("editorOverviewRuler.inlineChatRemoved",{dark:i(a,.6),light:i(a,.8),hcDark:i(a,.6),hcLight:i(a,.8)},e("editorOverviewRuler.inlineChatRemoved","Overview ruler marker color for inline chat removed content."));export{Q as ACTION_ACCEPT_CHANGES,J as ACTION_DISCARD_CHANGES,K as ACTION_REGENERATE_RESPONSE,ne as ACTION_REPORT_ISSUE,ee as ACTION_TOGGLE_DIFF,$ as ACTION_VIEW_IN_CHAT,Z as CTX_INLINE_CHAT_CHANGE_HAS_DIFF,q as CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF,V as CTX_INLINE_CHAT_DOCUMENT_CHANGED,W as CTX_INLINE_CHAT_EDITING,Y as CTX_INLINE_CHAT_EDIT_MODE,k as CTX_INLINE_CHAT_EMPTY,L as CTX_INLINE_CHAT_FOCUSED,O as CTX_INLINE_CHAT_HAS_AGENT,M as CTX_INLINE_CHAT_HAS_STASHED_SESSION,X as CTX_INLINE_CHAT_INNER_CURSOR_END,F as CTX_INLINE_CHAT_INNER_CURSOR_FIRST,B as CTX_INLINE_CHAT_INNER_CURSOR_LAST,P as CTX_INLINE_CHAT_INNER_CURSOR_START,U as CTX_INLINE_CHAT_OUTER_CURSOR_POSITION,j as CTX_INLINE_CHAT_REQUEST_IN_PROGRESS,y as CTX_INLINE_CHAT_RESPONSE_FOCUSED,z as CTX_INLINE_CHAT_RESPONSE_TYPE,G as CTX_INLINE_CHAT_USER_DID_EDIT,H as CTX_INLINE_CHAT_VISIBLE,T as EditMode,x as INLINE_CHAT_ID,R as INTERACTIVE_EDITOR_ACCESSIBILITY_HELP_ID,E as InlineChatConfigKeys,v as InlineChatResponseType,te as MENU_INLINE_CHAT_WIDGET_SECONDARY,ie as MENU_INLINE_CHAT_WIDGET_STATUS,oe as MENU_INLINE_CHAT_ZONE,ae as inlineChatBackground,se as inlineChatBorder,pe as inlineChatDiffInserted,Ie as inlineChatDiffRemoved,re as inlineChatForeground,Ce as inlineChatInputBackground,le as inlineChatInputBorder,de as inlineChatInputFocusBorder,ce as inlineChatInputPlaceholderForeground,he as inlineChatShadow,ue as minimapInlineChatDiffInserted,fe as overviewRulerInlineChatDiffInserted,_e as overviewRulerInlineChatDiffRemoved};
