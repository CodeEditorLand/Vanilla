import{getActiveElement as s}from"../../../../base/browser/dom.js";import{RedoCommand as w,SelectAllCommand as f,UndoCommand as C}from"../../../../editor/browser/editorExtensions.js";import{CopyAction as o,CutAction as i,PasteAction as n}from"../../../../editor/contrib/clipboard/browser/clipboard.js";import*as r from"../../../../nls.js";import{MenuId as m,MenuRegistry as c}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as d}from"../../../../platform/contextkey/common/contextkey.js";import{IEditorService as b}from"../../../services/editor/common/editorService.js";import{WebviewInput as I}from"../../webviewPanel/browser/webviewEditorInput.js";import{IWebviewService as y}from"./webview.js";const x=100;function t(e,p){e?.addImplementation(x,"webview",u=>{const v=u.get(y).activeWebview;if(v?.isFocused)return p(v),!0;if(s()?.classList.contains("action-menu-item")){const l=u.get(b);if(l.activeEditor instanceof I)return p(l.activeEditor.webview),!0}return!1})}t(C,e=>e.undo()),t(w,e=>e.redo()),t(f,e=>e.selectAll()),t(o,e=>e.copy()),t(n,e=>e.paste()),t(i,e=>e.cut());const a="preventDefaultContextMenuItems";i&&c.appendMenuItem(m.WebviewContext,{command:{id:i.id,title:r.localize("cut","Cut")},group:"5_cutcopypaste",order:1,when:d.not(a)}),o&&c.appendMenuItem(m.WebviewContext,{command:{id:o.id,title:r.localize("copy","Copy")},group:"5_cutcopypaste",order:2,when:d.not(a)}),n&&c.appendMenuItem(m.WebviewContext,{command:{id:n.id,title:r.localize("paste","Paste")},group:"5_cutcopypaste",order:3,when:d.not(a)});export{a as PreventDefaultContextMenuItemsContextKeyName};
