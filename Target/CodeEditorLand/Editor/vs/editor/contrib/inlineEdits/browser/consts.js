import{localize as i}from"../../../../../vs/nls.js";import{RawContextKey as e}from"../../../../../vs/platform/contextkey/common/contextkey.js";const o="editor.action.inlineEdits.accept",s="editor.action.inlineEdits.showPrevious",l="editor.action.inlineEdits.showNext",d=new e("inlineEditsVisible",!1,i("inlineEditsVisible","Whether an inline edit is visible")),r=new e("inlineEditsIsPinned",!1,i("isPinned","Whether an inline edit is visible"));export{o as inlineEditAcceptId,d as inlineEditVisible,r as isPinnedContextKey,l as showNextInlineEditActionId,s as showPreviousInlineEditActionId};