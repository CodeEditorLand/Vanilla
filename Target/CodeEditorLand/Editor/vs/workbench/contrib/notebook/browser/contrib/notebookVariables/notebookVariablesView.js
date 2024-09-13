var k=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var u=(c,r,t,e)=>{for(var i=e>1?void 0:e?g(r,t):r,n=c.length-1,a;n>=0;n--)(a=c[n])&&(i=(e?a(r,t,i):a(i))||i);return e&&i&&k(r,t,i),i},o=(c,r)=>(t,e)=>r(t,e,c);import{RunOnceScheduler as E}from"../../../../../../base/common/async.js";import*as y from"../../../../../../nls.js";import{createAndFillInContextMenuActions as N}from"../../../../../../platform/actions/browser/menuEntryActionViewItem.js";import{IMenuService as f,MenuId as x}from"../../../../../../platform/actions/common/actions.js";import{ICommandService as C}from"../../../../../../platform/commands/common/commands.js";import{IConfigurationService as A}from"../../../../../../platform/configuration/common/configuration.js";import{IContextKeyService as T}from"../../../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as V}from"../../../../../../platform/contextview/browser/contextView.js";import{IHoverService as M}from"../../../../../../platform/hover/browser/hover.js";import{IInstantiationService as _}from"../../../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as D}from"../../../../../../platform/keybinding/common/keybinding.js";import{WorkbenchAsyncDataTree as O}from"../../../../../../platform/list/browser/listService.js";import{IOpenerService as L}from"../../../../../../platform/opener/common/opener.js";import{IQuickInputService as w}from"../../../../../../platform/quickinput/common/quickInput.js";import{ITelemetryService as R}from"../../../../../../platform/telemetry/common/telemetry.js";import{IThemeService as B}from"../../../../../../platform/theme/common/themeService.js";import{ViewPane as K}from"../../../../../browser/parts/views/viewPane.js";import{IViewDescriptorService as P}from"../../../../../common/views.js";import{IEditorService as X}from"../../../../../services/editor/common/editorService.js";import{CONTEXT_VARIABLE_EXTENSIONID as j,CONTEXT_VARIABLE_INTERFACES as U,CONTEXT_VARIABLE_LANGUAGE as F,CONTEXT_VARIABLE_NAME as z,CONTEXT_VARIABLE_TYPE as H,CONTEXT_VARIABLE_VALUE as W}from"../../../../debug/common/debug.js";import{INotebookExecutionStateService as G}from"../../../common/notebookExecutionStateService.js";import{INotebookKernelService as Q}from"../../../common/notebookKernelService.js";import{getNotebookEditorFromEditorPane as q}from"../../notebookBrowser.js";import{NotebookVariableDataSource as Y}from"./notebookVariablesDataSource.js";import{NotebookVariableAccessibilityProvider as J,NotebookVariableRenderer as Z,NotebookVariablesDelegate as $}from"./notebookVariablesTree.js";let s=class extends K{constructor(t,e,i,n,a,d,v,m,l,p,h,ee,te,b,I,S,oe){super(t,a,d,m,v,p,l,h,b,I,S);this.editorService=e;this.notebookKernelService=i;this.notebookExecutionStateService=n;this.quickInputService=ee;this.commandService=te;this.menuService=oe;this._register(this.editorService.onDidActiveEditorChange(this.handleActiveEditorChange.bind(this))),this._register(this.notebookKernelService.onDidNotebookVariablesUpdate(this.handleVariablesChanged.bind(this))),this._register(this.notebookExecutionStateService.onDidChangeExecution(this.handleExecutionStateChange.bind(this))),this.setActiveNotebook(),this.dataSource=new Y(this.notebookKernelService),this.updateScheduler=new E(()=>this.tree?.updateChildren(),100)}static ID="notebookVariablesView";static TITLE=y.localize2("notebook.notebookVariables","Notebook Variables");tree;activeNotebook;dataSource;updateScheduler;renderBody(t){super.renderBody(t),this.element.classList.add("debug-pane"),this.tree=this.instantiationService.createInstance(O,"notebookVariablesTree",t,new $,[this.instantiationService.createInstance(Z)],this.dataSource,{accessibilityProvider:new J,identityProvider:{getId:e=>e.id}}),this.tree.layout(),this.activeNotebook&&this.tree.setInput({kind:"root",notebook:this.activeNotebook}),this._register(this.tree.onContextMenu(e=>this.onContextMenu(e)))}onContextMenu(t){if(!t.element)return;const e=t.element,i={source:e.notebook.uri.toString(),name:e.name,value:e.value,type:e.type,expression:e.expression,language:e.language,extensionId:e.extensionId},n=[],a=this.contextKeyService.createOverlay([[z.key,e.name],[W.key,e.value],[H.key,e.type],[U.key,e.interfaces],[F.key,e.language],[j.key,e.extensionId]]),d=this.menuService.getMenuActions(x.NotebookVariablesContext,a,{arg:i,shouldForwardArgs:!0});N(d,n),this.contextMenuService.showContextMenu({getAnchor:()=>t.anchor,getActions:()=>n})}layoutBody(t,e){super.layoutBody(t,e),this.tree?.layout(t,e)}setActiveNotebook(){const t=this.activeNotebook,e=this.editorService.activeEditorPane;if(e?.getId()==="workbench.editor.notebook"||e?.getId()==="workbench.editor.interactive"){const i=q(e)?.getViewModel()?.notebookDocument;this.activeNotebook=i}return t!==this.activeNotebook}handleActiveEditorChange(){this.setActiveNotebook()&&this.activeNotebook&&(this.tree?.setInput({kind:"root",notebook:this.activeNotebook}),this.updateScheduler.schedule())}handleExecutionStateChange(t){this.activeNotebook&&t.affectsNotebook(this.activeNotebook.uri)&&(this.dataSource.cancel(),t.changed===void 0?this.updateScheduler.schedule():this.updateScheduler.cancel())}handleVariablesChanged(t){this.activeNotebook&&t.toString()===this.activeNotebook.uri.toString()&&(this.tree?.setInput({kind:"root",notebook:this.activeNotebook}),this.updateScheduler.schedule())}};s=u([o(1,X),o(2,Q),o(3,G),o(4,D),o(5,V),o(6,T),o(7,A),o(8,_),o(9,P),o(10,L),o(11,w),o(12,C),o(13,B),o(14,R),o(15,M),o(16,f)],s);export{s as NotebookVariablesView};
