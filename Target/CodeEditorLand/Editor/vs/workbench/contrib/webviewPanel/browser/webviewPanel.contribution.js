var g=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var a=(d,t,o,i)=>{for(var r=i>1?void 0:i?b(t,o):t,e=d.length-1,n;e>=0;e--)(n=d[e])&&(r=(i?n(t,o,r):n(r))||r);return i&&r&&g(t,o,r),r},m=(d,t)=>(o,i)=>t(o,i,d);import{Disposable as y}from"../../../../base/common/lifecycle.js";import{localize as v}from"../../../../nls.js";import{registerAction2 as s}from"../../../../platform/actions/common/actions.js";import{SyncDescriptor as l}from"../../../../platform/instantiation/common/descriptors.js";import{InstantiationType as w,registerSingleton as W}from"../../../../platform/instantiation/common/extensions.js";import{Registry as E}from"../../../../platform/registry/common/platform.js";import{EditorPaneDescriptor as S}from"../../../browser/editor.js";import{WorkbenchPhase as h,registerWorkbenchContribution2 as k}from"../../../common/contributions.js";import{EditorExtensions as u}from"../../../common/editor.js";import{IEditorGroupsService as D}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as G}from"../../../services/editor/common/editorService.js";import{HideWebViewEditorFindCommand as F,ReloadWebviewAction as R,ShowWebViewEditorFindWidgetAction as P,WebViewEditorFindNextCommand as V,WebViewEditorFindPreviousCommand as x}from"./webviewCommands.js";import{WebviewEditor as I}from"./webviewEditor.js";import{WebviewInput as c}from"./webviewEditorInput.js";import{WebviewEditorInputSerializer as f}from"./webviewEditorInputSerializer.js";import{IWebviewWorkbenchService as z,WebviewEditorService as A}from"./webviewWorkbenchService.js";E.as(u.EditorPane).registerEditorPane(S.create(I,I.ID,v("webview.editor.label","webview editor")),[new l(c)]);let p=class extends y{constructor(o,i){super();this.editorGroupService=i;this._register(o.onWillOpenEditor(r=>{const e=i.getGroup(r.groupId);e&&this.onEditorOpening(r.editor,e)}))}static ID="workbench.contrib.webviewPanel";onEditorOpening(o,i){if(!(o instanceof c)||o.typeId!==c.typeId||i.contains(o))return;let r;const e=this.editorGroupService.groups;for(const n of e)if(n.contains(o)){r=n;break}r&&r.closeEditor(o)}};p=a([m(0,G),m(1,D)],p),k(p.ID,p,h.BlockStartup),E.as(u.EditorFactory).registerEditorSerializer(f.ID,f),W(z,A,w.Delayed),s(P),s(F),s(V),s(x),s(R);
