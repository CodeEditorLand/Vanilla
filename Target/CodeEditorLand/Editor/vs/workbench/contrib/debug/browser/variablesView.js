var se=Object.defineProperty;var ae=Object.getOwnPropertyDescriptor;var D=(s,i,e,t)=>{for(var r=t>1?void 0:t?ae(i,e):i,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(t?o(i,e,r):o(r))||r);return t&&r&&se(i,e,r),r},a=(s,i)=>(e,t)=>i(e,t,s);import*as T from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/ui/actionbar/actionbar.js";import{HighlightedLabel as ce}from"../../../../../vs/base/browser/ui/highlightedlabel/highlightedLabel.js";import"../../../../../vs/base/browser/ui/list/list.js";import"../../../../../vs/base/browser/ui/list/listWidget.js";import"../../../../../vs/base/browser/ui/tree/asyncDataTree.js";import"../../../../../vs/base/browser/ui/tree/tree.js";import{Action as L}from"../../../../../vs/base/common/actions.js";import{coalesce as le}from"../../../../../vs/base/common/arrays.js";import{RunOnceScheduler as de}from"../../../../../vs/base/common/async.js";import{CancellationTokenSource as pe}from"../../../../../vs/base/common/cancellation.js";import{Codicon as F}from"../../../../../vs/base/common/codicons.js";import{createMatches as ue}from"../../../../../vs/base/common/filters.js";import{toDisposable as me}from"../../../../../vs/base/common/lifecycle.js";import{ThemeIcon as j}from"../../../../../vs/base/common/themables.js";import{localize as g}from"../../../../../vs/nls.js";import{createAndFillInContextMenuActions as O}from"../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{IMenuService as P,MenuId as C,registerAction2 as Ie}from"../../../../../vs/platform/actions/common/actions.js";import{IClipboardService as X}from"../../../../../vs/platform/clipboard/common/clipboardService.js";import{CommandsRegistry as f,ICommandService as ve}from"../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as Y}from"../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as Se,IContextKeyService as B}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as G,IContextViewService as q}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as N}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as ge}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as be}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{WorkbenchAsyncDataTree as fe}from"../../../../../vs/platform/list/browser/listService.js";import{INotificationService as he}from"../../../../../vs/platform/notification/common/notification.js";import{IOpenerService as xe}from"../../../../../vs/platform/opener/common/opener.js";import{ProgressLocation as Ee}from"../../../../../vs/platform/progress/common/progress.js";import{ITelemetryService as $}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as ye}from"../../../../../vs/platform/theme/common/themeService.js";import{ViewAction as Ve,ViewPane as De}from"../../../../../vs/workbench/browser/parts/views/viewPane.js";import"../../../../../vs/workbench/browser/parts/views/viewsViewlet.js";import{IViewDescriptorService as Te}from"../../../../../vs/workbench/common/views.js";import{AbstractExpressionDataSource as Ce,AbstractExpressionsRenderer as J,renderExpressionValue as we,renderVariable as Ae,renderViewTree as Me}from"../../../../../vs/workbench/contrib/debug/browser/baseDebugView.js";import{ADD_TO_WATCH_ID as ke,ADD_TO_WATCH_LABEL as _e,COPY_EVALUATE_PATH_ID as ze,COPY_EVALUATE_PATH_LABEL as Le,COPY_VALUE_ID as Fe,COPY_VALUE_LABEL as Oe}from"../../../../../vs/workbench/contrib/debug/browser/debugCommands.js";import{LinkDetector as Pe}from"../../../../../vs/workbench/contrib/debug/browser/linkDetector.js";import{CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED as Q,CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED as Be,CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED as Ne,CONTEXT_VARIABLES_FOCUSED as Re,DataBreakpointSetType as R,DebugVisualizationType as He,IDebugService as S,VARIABLES_VIEW_ID as Z}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import{getContextForVariable as Ke}from"../../../../../vs/workbench/contrib/debug/common/debugContext.js";import{ErrorScope as We,Expression as ee,getUriForDebugMemory as Ue,Scope as te,StackFrame as je,Variable as x,VisualizedExpression as H}from"../../../../../vs/workbench/contrib/debug/common/debugModel.js";import{IDebugVisualizerService as Xe}from"../../../../../vs/workbench/contrib/debug/common/debugVisualizers.js";import{IExtensionsWorkbenchService as Ye}from"../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{IEditorService as Ge,SIDE_GROUP as qe}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IExtensionService as $e}from"../../../../../vs/workbench/services/extensions/common/extensions.js";const K=T.$;let w=!0,A,l,M=class extends De{constructor(e,t,r,n,o,c,d,p,u,m,I,v,E){super(e,n,t,o,p,d,c,u,m,I,v);this.debugService=r;this.menuService=E;this.updateTreeScheduler=new de(async()=>{const y=this.debugService.getViewModel().focusedStackFrame;this.needsRefresh=!1;const U=this.tree.getInput();if(U&&this.savedViewState.set(U.getId(),this.tree.getViewState()),!y){await this.tree.setInput(null);return}const ne=this.savedViewState.get(y.getId());await this.tree.setInput(y,ne);const V=(await y.getScopes()).find(oe=>!oe.expensive);V&&this.tree.hasNode(V)&&(this.autoExpandedScopes.add(V.getId()),await this.tree.expand(V))},400)}updateTreeScheduler;needsRefresh=!1;tree;savedViewState=new Map;autoExpandedScopes=new Set;renderBody(e){super.renderBody(e),this.element.classList.add("debug-pane"),e.classList.add("debug-variables");const t=Me(e),r=this.instantiationService.createInstance(Pe);this.tree=this.instantiationService.createInstance(fe,"VariablesView",t,new et,[this.instantiationService.createInstance(h,r),this.instantiationService.createInstance(b,r),new _,new z],this.instantiationService.createInstance(Ze),{accessibilityProvider:new tt,identityProvider:{getId:o=>o.getId()},keyboardNavigationLabelProvider:{getKeyboardNavigationLabel:o=>o.name},overrideStyles:this.getLocationBasedColors().listOverrideStyles}),this._register(b.rendererOnVisualizationRange(this.debugService.getViewModel(),this.tree)),this.tree.setInput(this.debugService.getViewModel().focusedStackFrame??null),Re.bindTo(this.tree.contextKeyService),this._register(this.debugService.getViewModel().onDidFocusStackFrame(o=>{if(!this.isBodyVisible()){this.needsRefresh=!0;return}const c=o.explicit?0:void 0;this.updateTreeScheduler.schedule(c)})),this._register(this.debugService.getViewModel().onWillUpdateViews(()=>{const o=this.debugService.getViewModel().focusedStackFrame;o&&w&&o.forgetScopes(),w=!0,this.tree.updateChildren()})),this._register(this.tree),this._register(this.tree.onMouseDblClick(o=>this.onMouseDblClick(o))),this._register(this.tree.onContextMenu(async o=>await this.onContextMenu(o))),this._register(this.onDidChangeBodyVisibility(o=>{o&&this.needsRefresh&&this.updateTreeScheduler.schedule()}));let n;this._register(this.debugService.getViewModel().onDidSelectExpression(o=>{const c=o?.expression;c&&this.tree.hasNode(c)?(n=this.tree.options.horizontalScrolling,n&&this.tree.updateOptions({horizontalScrolling:!1}),this.tree.rerender(c)):!o&&n!==void 0&&(this.tree.updateOptions({horizontalScrolling:n}),n=void 0)})),this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async o=>{o instanceof x&&this.tree.hasNode(o)&&(await this.tree.updateChildren(o,!1,!0),await this.tree.expand(o))})),this._register(this.debugService.onDidEndSession(()=>{this.savedViewState.clear(),this.autoExpandedScopes.clear()}))}layoutBody(e,t){super.layoutBody(t,e),this.tree.layout(e,t)}focus(){super.focus(),this.tree.domFocus()}collapseAll(){this.tree.collapseAll()}onMouseDblClick(e){this.canSetExpressionValue(e.element)&&this.debugService.getViewModel().setSelectedExpression(e.element,!1)}canSetExpressionValue(e){return this.debugService.getViewModel().focusedSession?e instanceof H?!!e.treeItem.canEdit:e instanceof x&&!e.presentationHint?.attributes?.includes("readOnly")&&!e.presentationHint?.lazy:!1}async onContextMenu(e){const t=e.element;if(!(!(t instanceof x)||!t.value))return Je(this.contextKeyService,this.menuService,this.contextMenuService,C.DebugVariablesContext,e)}};M=D([a(1,G),a(2,S),a(3,be),a(4,Y),a(5,ge),a(6,Te),a(7,B),a(8,xe),a(9,ye),a(10,$),a(11,N),a(12,P)],M);async function Je(s,i,e,t,r){const n=r.element;if(!(n instanceof x)||!n.value)return;const o=await Qe(s,n),c=W(n),d=i.getMenuActions(t,o,{arg:c,shouldForwardArgs:!1}),p=[];O(d,{primary:[],secondary:p},"inline"),e.showContextMenu({getAnchor:()=>r.anchor,getActions:()=>p})}const W=s=>({sessionId:s.getSession()?.getId(),container:s.parent instanceof ee?{expression:s.parent.name}:s.parent.toDebugProtocolObject(),variable:s.toDebugProtocolObject()});async function Qe(s,i){const e=i.getSession();if(!e||!e.capabilities.supportsDataBreakpoints)return k(s,i);const t=[];l=await e.dataBreakpointInfo(i.name,i.parent.reference);const r=l?.dataId,n=l?.accessTypes;if(!n)t.push([Q.key,!!r]);else for(const o of n)switch(o){case"read":t.push([Ne.key,!!r]);break;case"write":t.push([Q.key,!!r]);break;case"readWrite":t.push([Be.key,!!r]);break}return k(s,i,t)}function k(s,i,e=[]){return A=i,Ke(s,i,e)}function ie(s){return s instanceof je}class Ze extends Ce{hasChildren(i){return i?ie(i)?!0:i.hasChildren:!1}doGetChildren(i){return ie(i)?i.getScopes():i.getChildren()}}class et{getHeight(i){return 22}getTemplateId(i){return i instanceof We?z.ID:i instanceof te?_.ID:i instanceof H?b.ID:h.ID}}class _{static ID="scope";get templateId(){return _.ID}renderTemplate(i){const e=T.append(i,K(".scope")),t=new ce(e);return{name:e,label:t}}renderElement(i,e,t){t.label.set(i.element.name,ue(i.filterData))}disposeTemplate(i){i.label.dispose()}}class z{static ID="scopeError";get templateId(){return z.ID}renderTemplate(i){const e=T.append(i,K(".scope"));return{error:T.append(e,K(".error"))}}renderElement(i,e,t){t.error.innerText=i.element.name}disposeTemplate(){}}let b=class extends J{constructor(e,t,r,n,o,c){super(t,r,n);this.linkDetector=e;this.menuService=o;this.contextKeyService=c}static ID="viz";static rendererOnVisualizationRange(e,t){return e.onDidChangeVisualization(({original:r})=>{if(!t.hasNode(r))return;const n=t.getParentElement(r);t.updateChildren(n,!1,!1)})}get templateId(){return b.ID}renderElement(e,t,r){r.elementDisposable.clear(),super.renderExpressionElement(e.element,e,r)}renderExpression(e,t,r){const n=e;let o=n.name;n.value&&typeof n.name=="string"&&(o+=":"),t.label.set(o,r,n.name),we(t.elementDisposable,n,t.value,{showChanged:!1,maxValueLength:1024,colorize:!0,linkDetector:this.linkDetector},this.hoverService)}getInputBoxOptions(e){const t=e;return{initialValue:e.value,ariaLabel:g("variableValueAriaLabel","Type new variable value"),validationOptions:{validation:()=>t.errorMessage?{content:t.errorMessage}:null},onFinish:(r,n)=>{t.errorMessage=void 0,n&&t.edit(r).then(()=>{w=!1,this.debugService.getViewModel().updateViews()})}}}renderActionBar(e,t,r){const n=t,o=n.original?k(this.contextKeyService,n.original):this.contextKeyService,c=n.original?W(n.original):void 0,d=this.menuService.getMenuActions(C.DebugVariablesContext,o,{arg:c,shouldForwardArgs:!1}),p=[];if(O(d,{primary:p,secondary:[]},"inline"),n.original){const u=new L("debugViz",g("removeVisualizer","Remove Visualizer"),j.asClassName(F.eye),!0,()=>this.debugService.getViewModel().setVisualizedExpression(n.original,void 0));u.checked=!0,p.push(u),e.domNode.style.display="initial"}e.clear(),e.context=c,e.push(p,{icon:!0,label:!1})}};b=D([a(1,S),a(2,q),a(3,N),a(4,P),a(5,B)],b);let h=class extends J{constructor(e,t,r,n,o,c,d,p,u,m){super(d,p,u);this.linkDetector=e;this.menuService=t;this.contextKeyService=r;this.visualization=n;this.contextMenuService=o;this.commandService=c;this.configurationService=m}static ID="variable";get templateId(){return h.ID}renderExpression(e,t,r){const n=this.configurationService.getValue("debug").showVariableTypes;Ae(t.elementDisposable,this.commandService,this.hoverService,e,t,!0,r,this.linkDetector,n)}renderElement(e,t,r){r.elementDisposable.clear(),r.elementDisposable.add(this.configurationService.onDidChangeConfiguration(n=>{n.affectsConfiguration("debug.showVariableTypes")&&super.renderExpressionElement(e.element,e,r)})),super.renderExpressionElement(e.element,e,r)}getInputBoxOptions(e){const t=e;return{initialValue:e.value,ariaLabel:g("variableValueAriaLabel","Type new variable value"),validationOptions:{validation:()=>t.errorMessage?{content:t.errorMessage}:null},onFinish:(r,n)=>{t.errorMessage=void 0;const o=this.debugService.getViewModel().focusedStackFrame;n&&t.value!==r&&o&&t.setVariable(r,o).then(()=>{w=!1,this.debugService.getViewModel().updateViews()})}}}renderActionBar(e,t,r){const n=t,o=k(this.contextKeyService,n),c=[],d=W(n),p=this.menuService.getMenuActions(C.DebugVariablesContext,o,{arg:d,shouldForwardArgs:!1});O(p,{primary:c,secondary:[]},"inline"),e.clear(),e.context=d,e.push(c,{icon:!0,label:!1});const u=new pe;r.elementDisposable.add(me(()=>u.dispose(!0))),this.visualization.getApplicableFor(t,u.token).then(m=>{r.elementDisposable.add(m);const I=t instanceof H&&t.original||t,v=m.object.map(E=>new L("debugViz",E.name,E.iconClass||"debug-viz-icon",void 0,this.useVisualizer(E,I,u.token)));v.length===0||(v.length===1?e.push(v[0],{icon:!0,label:!1}):e.push(new L("debugViz",g("useVisualizer","Visualize Variable..."),j.asClassName(F.eye),void 0,()=>this.pickVisualizer(v,I,r)),{icon:!0,label:!1}))})}pickVisualizer(e,t,r){this.contextMenuService.showContextMenu({getAnchor:()=>r.actionBar.getContainer(),getActions:()=>e})}useVisualizer(e,t,r){return async()=>{const n=await e.resolve(r);if(!r.isCancellationRequested)if(n.type===He.Command)e.execute();else{const o=await this.visualization.getVisualizedNodeFor(n.id,t);o&&this.debugService.getViewModel().setVisualizedExpression(t,o)}}}};h=D([a(1,P),a(2,B),a(3,Xe),a(4,G),a(5,ve),a(6,S),a(7,q),a(8,N),a(9,Y)],h);class tt{getWidgetAriaLabel(){return g("variablesAriaTreeLabel","Debug Variables")}getAriaLabel(i){return i instanceof te?g("variableScopeAriaLabel","Scope {0}",i.name):i instanceof x?g({key:"variableAriaLabel",comment:["Placeholders are variable name and variable value respectivly. They should not be translated."]},"{0}, value {1}",i.name,i.value):null}}const it="debug.setVariable";f.registerCommand({id:it,handler:s=>{s.get(S).getViewModel().setSelectedExpression(A,!1)}}),f.registerCommand({metadata:{description:Oe},id:Fe,handler:async(s,i,e)=>{const t=s.get(S),r=s.get(X);let n="",o;i instanceof x||i instanceof ee?(n="watch",o=e||[]):(n="variables",o=A?[A]:[]);const c=t.getViewModel().focusedStackFrame,d=t.getViewModel().focusedSession;if(!c||!d||o.length===0)return;const p=d.capabilities.supportsClipboardContext?"clipboard":n,u=o.map(m=>m instanceof x?m.evaluateName||m.value:m.name);try{const m=await Promise.all(u.map(v=>d.evaluate(v,c.frameId,p))),I=le(m).map(v=>v.body.result);I.length&&r.writeText(I.join(`
`))}catch{const I=o.map(v=>v.value);r.writeText(I.join(`
`))}}});const rt="workbench.debug.viewlet.action.viewMemory",re="ms-vscode.hexeditor",nt="hexEditor.hexedit";f.registerCommand({id:rt,handler:async(s,i,e)=>{const t=s.get(S);let r,n;if("sessionId"in i){if(!i.sessionId||!i.variable.memoryReference)return;r=i.sessionId,n=i.variable.memoryReference}else{if(!i.memoryReference)return;const I=t.getViewModel().focusedSession;if(!I)return;r=I.getId(),n=i.memoryReference}const o=s.get(Ye),c=s.get(Ge),d=s.get(he),p=s.get($e),u=s.get($);(await p.getExtension(re)||await ot(o,d))&&(u.publicLog("debug/didViewMemory",{debugType:t.getModel().getSession(r)?.configuration.type}),await c.openEditor({resource:Ue(r,n),options:{revealIfOpened:!0,override:nt}},qe))}});async function ot(s,i){try{return await s.install(re,{justification:g("viewMemory.prompt","Inspecting binary data requires this extension."),enable:!0},Ee.Notification),!0}catch(e){return i.error(e),!1}}const st="debug.breakWhenValueChanges";f.registerCommand({id:st,handler:async s=>{const i=s.get(S);l&&await i.addDataBreakpoint({description:l.description,src:{type:R.Variable,dataId:l.dataId},canPersist:!!l.canPersist,accessTypes:l.accessTypes,accessType:"write"})}});const at="debug.breakWhenValueIsAccessed";f.registerCommand({id:at,handler:async s=>{const i=s.get(S);l&&await i.addDataBreakpoint({description:l.description,src:{type:R.Variable,dataId:l.dataId},canPersist:!!l.canPersist,accessTypes:l.accessTypes,accessType:"readWrite"})}});const ct="debug.breakWhenValueIsRead";f.registerCommand({id:ct,handler:async s=>{const i=s.get(S);l&&await i.addDataBreakpoint({description:l.description,src:{type:R.Variable,dataId:l.dataId},canPersist:!!l.canPersist,accessTypes:l.accessTypes,accessType:"read"})}}),f.registerCommand({metadata:{description:Le},id:ze,handler:async(s,i)=>{await s.get(X).writeText(i.variable.evaluateName)}}),f.registerCommand({metadata:{description:_e},id:ke,handler:async(s,i)=>{s.get(S).addWatchExpression(i.variable.evaluateName)}}),Ie(class extends Ve{constructor(){super({id:"variables.collapse",viewId:Z,title:g("collapse","Collapse All"),f1:!1,icon:F.collapseAll,menu:{id:C.ViewTitle,group:"navigation",when:Se.equals("view",Z)}})}runInView(s,i){i.collapseAll()}});export{st as BREAK_WHEN_VALUE_CHANGES_ID,at as BREAK_WHEN_VALUE_IS_ACCESSED_ID,ct as BREAK_WHEN_VALUE_IS_READ_ID,it as SET_VARIABLE_ID,rt as VIEW_MEMORY_ID,h as VariablesRenderer,M as VariablesView,b as VisualizedVariableRenderer,Je as openContextMenuForVariableTreeElement};
