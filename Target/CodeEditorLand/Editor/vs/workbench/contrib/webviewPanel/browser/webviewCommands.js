import{KeyCode as n,KeyMod as b}from"../../../../base/common/keyCodes.js";import{EditorContextKeys as m}from"../../../../editor/common/editorContextKeys.js";import*as t from"../../../../nls.js";import{Categories as f}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as o,MenuId as y}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as i}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as c}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{IEditorService as D}from"../../../services/editor/common/editorService.js";import{IWebviewService as L,KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED as A,KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED as u,KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE as h}from"../../webview/browser/webview.js";import{WebviewEditor as B}from"./webviewEditor.js";import{WebviewInput as x}from"./webviewEditorInput.js";const d=i.and(i.equals("activeEditor",B.ID),m.focus.toNegated());class a extends o{static ID="editor.action.webvieweditor.showFind";static LABEL=t.localize("editor.action.webvieweditor.showFind","Show find");constructor(){super({id:a.ID,title:a.LABEL,keybinding:{when:i.and(d,A),primary:b.CtrlCmd|n.KeyF,weight:c.EditorContrib}})}run(e){s(e)?.showFind()}}class l extends o{static ID="editor.action.webvieweditor.hideFind";static LABEL=t.localize("editor.action.webvieweditor.hideFind","Stop find");constructor(){super({id:l.ID,title:l.LABEL,keybinding:{when:i.and(d,h),primary:n.Escape,weight:c.EditorContrib}})}run(e){s(e)?.hideFind()}}class p extends o{static ID="editor.action.webvieweditor.findNext";static LABEL=t.localize("editor.action.webvieweditor.findNext","Find next");constructor(){super({id:p.ID,title:p.LABEL,keybinding:{when:i.and(d,u),primary:n.Enter,weight:c.EditorContrib}})}run(e){s(e)?.runFindAction(!1)}}class v extends o{static ID="editor.action.webvieweditor.findPrevious";static LABEL=t.localize("editor.action.webvieweditor.findPrevious","Find previous");constructor(){super({id:v.ID,title:v.LABEL,keybinding:{when:i.and(d,u),primary:b.Shift|n.Enter,weight:c.EditorContrib}})}run(e){s(e)?.runFindAction(!0)}}class w extends o{static ID="workbench.action.webview.reloadWebviewAction";static LABEL=t.localize2("refreshWebviewLabel","Reload Webviews");constructor(){super({id:w.ID,title:w.LABEL,category:f.Developer,menu:[{id:y.CommandPalette}]})}async run(e){const r=e.get(L);for(const I of r.webviews)I.reload()}}function s(E){const r=E.get(D).activeEditor;return r instanceof x?r.webview:void 0}export{l as HideWebViewEditorFindCommand,w as ReloadWebviewAction,a as ShowWebViewEditorFindWidgetAction,p as WebViewEditorFindNextCommand,v as WebViewEditorFindPreviousCommand};
