import*as T from"../../../../base/browser/browser.js";import{getActiveDocument as M}from"../../../../base/browser/dom.js";import{KeyCode as r,KeyMod as n}from"../../../../base/common/keyCodes.js";import*as p from"../../../../base/common/platform.js";import*as t from"../../../../nls.js";import{MenuId as e,MenuRegistry as y}from"../../../../platform/actions/common/actions.js";import{IClipboardService as D}from"../../../../platform/clipboard/common/clipboardService.js";import{ContextKeyExpr as A}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as g}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{CopyOptions as v,InMemoryClipboardMetadataManager as K}from"../../../browser/controller/editContext/clipboardUtils.js";import{EditorAction as L,MultiCommand as x,registerEditorAction as _}from"../../../browser/editorExtensions.js";import{ICodeEditorService as O}from"../../../browser/services/codeEditorService.js";import{EditorOption as s}from"../../../common/config/editorOptions.js";import{Handler as z}from"../../../common/editorCommon.js";import{EditorContextKeys as m}from"../../../common/editorContextKeys.js";import{CopyPasteController as k}from"../../dropOrPasteInto/browser/copyPasteController.js";const a="9_cutcopypaste",W=p.isNative||document.queryCommandSupported("cut"),P=p.isNative||document.queryCommandSupported("copy"),F=typeof navigator.clipboard>"u"||T.isFirefox?document.queryCommandSupported("paste"):!0;function E(i){return i.register(),i}const H=W?E(new x({id:"editor.action.clipboardCutAction",precondition:void 0,kbOpts:p.isNative?{primary:n.CtrlCmd|r.KeyX,win:{primary:n.CtrlCmd|r.KeyX,secondary:[n.Shift|r.Delete]},weight:g.EditorContrib}:void 0,menuOpts:[{menuId:e.MenubarEditMenu,group:"2_ccp",title:t.localize({key:"miCut",comment:["&& denotes a mnemonic"]},"Cu&&t"),order:1},{menuId:e.EditorContext,group:a,title:t.localize("actions.clipboard.cutLabel","Cut"),when:m.writable,order:1},{menuId:e.CommandPalette,group:"",title:t.localize("actions.clipboard.cutLabel","Cut"),order:1},{menuId:e.SimpleEditorContext,group:a,title:t.localize("actions.clipboard.cutLabel","Cut"),when:m.writable,order:1}]})):void 0,q=P?E(new x({id:"editor.action.clipboardCopyAction",precondition:void 0,kbOpts:p.isNative?{primary:n.CtrlCmd|r.KeyC,win:{primary:n.CtrlCmd|r.KeyC,secondary:[n.CtrlCmd|r.Insert]},weight:g.EditorContrib}:void 0,menuOpts:[{menuId:e.MenubarEditMenu,group:"2_ccp",title:t.localize({key:"miCopy",comment:["&& denotes a mnemonic"]},"&&Copy"),order:2},{menuId:e.EditorContext,group:a,title:t.localize("actions.clipboard.copyLabel","Copy"),order:2},{menuId:e.CommandPalette,group:"",title:t.localize("actions.clipboard.copyLabel","Copy"),order:1},{menuId:e.SimpleEditorContext,group:a,title:t.localize("actions.clipboard.copyLabel","Copy"),order:2}]})):void 0;y.appendMenuItem(e.MenubarEditMenu,{submenu:e.MenubarCopy,title:t.localize2("copy as","Copy As"),group:"2_ccp",order:3}),y.appendMenuItem(e.EditorContext,{submenu:e.EditorContextCopy,title:t.localize2("copy as","Copy As"),group:a,order:3}),y.appendMenuItem(e.EditorContext,{submenu:e.EditorContextShare,title:t.localize2("share","Share"),group:"11_share",order:-1,when:A.and(A.notEquals("resourceScheme","output"),m.editorTextFocus)}),y.appendMenuItem(e.ExplorerContext,{submenu:e.ExplorerContextShare,title:t.localize2("share","Share"),group:"11_share",order:-1});const h=F?E(new x({id:"editor.action.clipboardPasteAction",precondition:void 0,kbOpts:p.isNative?{primary:n.CtrlCmd|r.KeyV,win:{primary:n.CtrlCmd|r.KeyV,secondary:[n.Shift|r.Insert]},linux:{primary:n.CtrlCmd|r.KeyV,secondary:[n.Shift|r.Insert]},weight:g.EditorContrib}:void 0,menuOpts:[{menuId:e.MenubarEditMenu,group:"2_ccp",title:t.localize({key:"miPaste",comment:["&& denotes a mnemonic"]},"&&Paste"),order:4},{menuId:e.EditorContext,group:a,title:t.localize("actions.clipboard.pasteLabel","Paste"),when:m.writable,order:4},{menuId:e.CommandPalette,group:"",title:t.localize("actions.clipboard.pasteLabel","Paste"),order:1},{menuId:e.SimpleEditorContext,group:a,title:t.localize("actions.clipboard.pasteLabel","Paste"),when:m.writable,order:4}]})):void 0;class R extends L{constructor(){super({id:"editor.action.clipboardCopyWithSyntaxHighlightingAction",label:t.localize("actions.clipboard.copyWithSyntaxHighlightingLabel","Copy With Syntax Highlighting"),alias:"Copy With Syntax Highlighting",precondition:void 0,kbOpts:{kbExpr:m.textInputFocus,primary:0,weight:g.EditorContrib}})}run(c,d){!d.hasModel()||!d.getOption(s.emptySelectionClipboard)&&d.getSelection().isEmpty()||(v.forceCopyWithSyntaxHighlighting=!0,d.focus(),d.getContainerDomNode().ownerDocument.execCommand("copy"),v.forceCopyWithSyntaxHighlighting=!1)}}function N(i,c){i&&(i.addImplementation(1e4,"code-editor",(d,u)=>{const o=d.get(O).getFocusedCodeEditor();if(o&&o.hasTextFocus()){const C=o.getOption(s.emptySelectionClipboard),f=o.getSelection();return f&&f.isEmpty()&&!C||(o.getOption(s.experimentalEditContextEnabled)&&c==="cut"?(o.getContainerDomNode().ownerDocument.execCommand("copy"),o.trigger(void 0,z.Cut,void 0)):o.getContainerDomNode().ownerDocument.execCommand(c)),!0}return!1}),i.addImplementation(0,"generic-dom",(d,u)=>(M().execCommand(c),!0)))}N(H,"cut"),N(q,"copy"),h&&(h.addImplementation(1e4,"code-editor",(i,c)=>{const d=i.get(O),u=i.get(D),o=d.getFocusedCodeEditor();if(o&&o.hasTextFocus()){const C=!o.getOption(s.experimentalEditContextEnabled);return C&&o.getContainerDomNode().ownerDocument.execCommand("paste")?k.get(o)?.finishedPaste()??Promise.resolve():p.isWeb||!C?(async()=>{const b=await u.readText();if(b!==""){const l=K.INSTANCE.get(b);let S=!1,I=null,w=null;l&&(S=o.getOption(s.emptySelectionClipboard)&&!!l.isFromEmptySelection,I=typeof l.multicursorText<"u"?l.multicursorText:null,w=l.mode),o.trigger("keyboard",z.Paste,{text:b,pasteOnNewLine:S,multicursorText:I,mode:w})}})():!0}return!1}),h.addImplementation(0,"generic-dom",(i,c)=>(M().execCommand("paste"),!0))),P&&_(R);export{q as CopyAction,H as CutAction,h as PasteAction};
