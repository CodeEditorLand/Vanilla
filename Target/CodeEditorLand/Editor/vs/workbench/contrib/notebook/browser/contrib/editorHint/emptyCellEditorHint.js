var h=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var v=(s,n,o,r)=>{for(var t=r>1?void 0:r?E(n,o):n,i=s.length-1,c;i>=0;i--)(c=s[i])&&(t=(r?c(n,o,t):c(t))||t);return r&&t&&h(n,o,t),t},e=(s,n)=>(o,r)=>n(o,r,s);import{Schemas as g}from"../../../../../../../vs/base/common/network.js";import"../../../../../../../vs/editor/browser/editorBrowser.js";import{EditorContributionInstantiation as b,registerEditorContribution as _}from"../../../../../../../vs/editor/browser/editorExtensions.js";import{ICommandService as x}from"../../../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as y}from"../../../../../../../vs/platform/configuration/common/configuration.js";import{IContextMenuService as H}from"../../../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as T}from"../../../../../../../vs/platform/hover/browser/hover.js";import{IKeybindingService as k}from"../../../../../../../vs/platform/keybinding/common/keybinding.js";import{IProductService as N}from"../../../../../../../vs/platform/product/common/productService.js";import{ITelemetryService as R}from"../../../../../../../vs/platform/telemetry/common/telemetry.js";import{IChatAgentService as O}from"../../../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import{EmptyTextEditorHintContribution as P}from"../../../../../../../vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint.js";import{IInlineChatSessionService as A}from"../../../../../../../vs/workbench/contrib/inlineChat/browser/inlineChatSessionService.js";import{getNotebookEditorFromEditorPane as a}from"../../../../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import{IEditorGroupsService as D}from"../../../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as M}from"../../../../../../../vs/workbench/services/editor/common/editorService.js";let d=class extends P{constructor(o,r,t,i,c,l,I,f,p,u,S,C){super(o,t,i,c,l,I,f,p,u,S,C);this._editorService=r;const m=a(this._editorService.activeEditorPane);m&&this.toDispose.push(m.onDidChangeActiveCell(()=>this.update()))}static CONTRIB_ID="notebook.editor.contrib.emptyCellEditorHint";_getOptions(){return{clickable:!1}}_shouldRenderHint(){if(!super._shouldRenderHint())return!1;const r=this.editor.getModel();if(!r||!(r?.uri.scheme===g.vscodeNotebookCell))return!1;const i=a(this._editorService.activeEditorPane);return!(!i||i.getActiveCell()?.uri.fragment!==r.uri.fragment)}};d=v([e(1,M),e(2,D),e(3,x),e(4,y),e(5,T),e(6,k),e(7,A),e(8,O),e(9,R),e(10,N),e(11,H)],d),_(d.CONTRIB_ID,d,b.Eager);export{d as EmptyCellEditorHintContribution};