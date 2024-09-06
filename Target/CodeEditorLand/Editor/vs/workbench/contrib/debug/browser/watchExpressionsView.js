var X=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var S=(c,i,e,t)=>{for(var n=t>1?void 0:t?U(i,e):i,s=c.length-1,o;s>=0;s--)(o=c[s])&&(n=(t?o(i,e,n):o(n))||n);return t&&n&&X(i,e,n),n},a=(c,i)=>(e,t)=>i(e,t,c);import"../../../../../vs/base/browser/dnd.js";import"../../../../../vs/base/browser/ui/actionbar/actionbar.js";import"../../../../../vs/base/browser/ui/highlightedlabel/highlightedLabel.js";import{ListDragOverEffectPosition as x,ListDragOverEffectType as $}from"../../../../../vs/base/browser/ui/list/list.js";import{ElementsDragAndDropData as C,ListViewTargetSector as g}from"../../../../../vs/base/browser/ui/list/listView.js";import"../../../../../vs/base/browser/ui/list/listWidget.js";import"../../../../../vs/base/browser/ui/tree/tree.js";import"../../../../../vs/base/common/actions.js";import{RunOnceScheduler as q}from"../../../../../vs/base/common/async.js";import{Codicon as Y}from"../../../../../vs/base/common/codicons.js";import"../../../../../vs/base/common/filters.js";import{localize as p}from"../../../../../vs/nls.js";import{createAndFillInContextMenuActions as V}from"../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as M,IMenuService as O,MenuId as v,registerAction2 as b}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as _}from"../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as D,IContextKeyService as L}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as G,IContextViewService as j}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as W}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as J}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as Q}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{WorkbenchAsyncDataTree as Z}from"../../../../../vs/platform/list/browser/listService.js";import{IOpenerService as ee}from"../../../../../vs/platform/opener/common/opener.js";import{ITelemetryService as te}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as ie}from"../../../../../vs/platform/theme/common/themeService.js";import{ViewAction as re,ViewPane as ne}from"../../../../../vs/workbench/browser/parts/views/viewPane.js";import"../../../../../vs/workbench/browser/parts/views/viewsViewlet.js";import{IViewDescriptorService as se}from"../../../../../vs/workbench/common/views.js";import{AbstractExpressionDataSource as oe,AbstractExpressionsRenderer as ae,renderExpressionValue as ce,renderViewTree as le}from"../../../../../vs/workbench/contrib/debug/browser/baseDebugView.js";import{watchExpressionsAdd as de,watchExpressionsRemoveAll as ue}from"../../../../../vs/workbench/contrib/debug/browser/debugIcons.js";import{LinkDetector as pe}from"../../../../../vs/workbench/contrib/debug/browser/linkDetector.js";import{VariablesRenderer as R,VisualizedVariableRenderer as w}from"../../../../../vs/workbench/contrib/debug/browser/variablesView.js";import{CONTEXT_CAN_VIEW_MEMORY as he,CONTEXT_VARIABLE_IS_READONLY as ge,CONTEXT_WATCH_EXPRESSIONS_EXIST as y,CONTEXT_WATCH_EXPRESSIONS_FOCUSED as ve,CONTEXT_WATCH_ITEM_TYPE as N,IDebugService as f,WATCH_VIEW_ID as E}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import{Expression as u,Variable as I,VisualizedExpression as k}from"../../../../../vs/workbench/contrib/debug/common/debugModel.js";const fe=1024;let A=!1,T=!1,m=class extends ne{constructor(e,t,n,s,o,r,d,l,B,z,H,F,K){super(e,s,t,d,l,r,o,B,z,H,F);this.debugService=n;this.menu=K.createMenu(v.DebugWatchContext,l),this._register(this.menu),this.watchExpressionsUpdatedScheduler=new q(()=>{this.needsRefresh=!1,this.tree.updateChildren()},50),this.watchExpressionsExist=y.bindTo(l),this.variableReadonly=ge.bindTo(l),this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length>0),this.watchItemType=N.bindTo(l)}watchExpressionsUpdatedScheduler;needsRefresh=!1;tree;watchExpressionsExist;watchItemType;variableReadonly;menu;renderBody(e){super.renderBody(e),this.element.classList.add("debug-pane"),e.classList.add("debug-watch");const t=le(e),n=this.instantiationService.createInstance(pe),s=this.instantiationService.createInstance(h,n);this.tree=this.instantiationService.createInstance(Z,"WatchExpressions",t,new Ee,[s,this.instantiationService.createInstance(R,n),this.instantiationService.createInstance(w,n)],this.instantiationService.createInstance(Ie),{accessibilityProvider:new Se,identityProvider:{getId:r=>r.getId()},keyboardNavigationLabelProvider:{getKeyboardNavigationLabel:r=>{if(r!==this.debugService.getViewModel().getSelectedExpression()?.expression)return r.name}},dnd:new xe(this.debugService),overrideStyles:this.getLocationBasedColors().listOverrideStyles}),this.tree.setInput(this.debugService),ve.bindTo(this.tree.contextKeyService),this._register(w.rendererOnVisualizationRange(this.debugService.getViewModel(),this.tree)),this._register(this.tree.onContextMenu(r=>this.onContextMenu(r))),this._register(this.tree.onMouseDblClick(r=>this.onMouseDblClick(r))),this._register(this.debugService.getModel().onDidChangeWatchExpressions(async r=>{this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length>0),this.isBodyVisible()?(r&&!r.name&&(T=!0),await this.tree.updateChildren(),T=!1,r instanceof u&&this.tree.reveal(r)):this.needsRefresh=!0})),this._register(this.debugService.getViewModel().onDidFocusStackFrame(()=>{if(!this.isBodyVisible()){this.needsRefresh=!0;return}this.watchExpressionsUpdatedScheduler.isScheduled()||this.watchExpressionsUpdatedScheduler.schedule()})),this._register(this.debugService.getViewModel().onWillUpdateViews(()=>{A||this.tree.updateChildren()})),this._register(this.onDidChangeBodyVisibility(r=>{r&&this.needsRefresh&&this.watchExpressionsUpdatedScheduler.schedule()}));let o;this._register(this.debugService.getViewModel().onDidSelectExpression(r=>{const d=r?.expression;d&&this.tree.hasNode(d)?(o=this.tree.options.horizontalScrolling,o&&this.tree.updateOptions({horizontalScrolling:!1}),d.name&&this.tree.rerender(d)):!d&&o!==void 0&&(this.tree.updateOptions({horizontalScrolling:o}),o=void 0)})),this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async r=>{r instanceof I&&this.tree.hasNode(r)&&(await this.tree.updateChildren(r,!1,!0),await this.tree.expand(r))}))}layoutBody(e,t){super.layoutBody(e,t),this.tree.layout(e,t)}focus(){super.focus(),this.tree.domFocus()}collapseAll(){this.tree.collapseAll()}onMouseDblClick(e){if(e.browserEvent.target.className.indexOf("twistie")>=0)return;const t=e.element,n=this.debugService.getViewModel().getSelectedExpression();t instanceof u&&t!==n?.expression||t instanceof k&&t.treeItem.canEdit?this.debugService.getViewModel().setSelectedExpression(t,!1):t||this.debugService.addWatchExpression()}onContextMenu(e){const t=e.element,n=this.tree.getSelection();this.watchItemType.set(t instanceof u?"expression":t instanceof I?"variable":void 0);const s=[],o=t instanceof I?t.presentationHint?.attributes:void 0;this.variableReadonly.set(!!o&&o.indexOf("readOnly")>=0||!!t?.presentationHint?.lazy),V(this.menu,{arg:t,shouldForwardArgs:!0},s),this.contextMenuService.showContextMenu({getAnchor:()=>e.anchor,getActions:()=>s,getActionsContext:()=>t&&n.includes(t)?n:t?[t]:[]})}};m=S([a(1,G),a(2,f),a(3,Q),a(4,J),a(5,se),a(6,_),a(7,L),a(8,ee),a(9,ie),a(10,te),a(11,W),a(12,O)],m);class Ee{getHeight(i){return 22}getTemplateId(i){return i instanceof u?h.ID:i instanceof k?w.ID:R.ID}}function P(c){return typeof c.getConfigurationManager=="function"}class Ie extends oe{hasChildren(i){return P(i)||i.hasChildren}doGetChildren(i){if(P(i)){const e=i,t=e.getModel().getWatchExpressions(),n=e.getViewModel();return Promise.all(t.map(s=>s.name&&!T?s.evaluate(n.focusedSession,n.focusedStackFrame,"watch").then(()=>s):Promise.resolve(s)))}return i.getChildren()}}let h=class extends ae{constructor(e,t,n,s,o,r,d){super(s,o,r);this.linkDetector=e;this.menuService=t;this.contextKeyService=n;this.configurationService=d}static ID="watchexpression";get templateId(){return h.ID}renderElement(e,t,n){n.elementDisposable.clear(),n.elementDisposable.add(this.configurationService.onDidChangeConfiguration(s=>{s.affectsConfiguration("debug.showVariableTypes")&&super.renderExpressionElement(e.element,e,n)})),super.renderExpressionElement(e.element,e,n)}renderExpression(e,t,n){let s;t.type.textContent="";const o=this.configurationService.getValue("debug").showVariableTypes;o&&e.type?(s=typeof e.value=="string"?`${e.name}: `:e.name,t.type.textContent=e.type+" ="):s=typeof e.value=="string"?`${e.name} =`:e.name;let r;e.type?o?r=`${e.name}`:r=e.type===e.value?e.type:`${e.type}`:r=e.value,t.label.set(s,n,r),ce(t.elementDisposable,e,t.value,{showChanged:!0,maxValueLength:fe,linkDetector:this.linkDetector,colorize:!0},this.hoverService)}getInputBoxOptions(e,t){return t?{initialValue:e.value,ariaLabel:p("typeNewValue","Type new value"),onFinish:async(n,s)=>{if(s&&n){const o=this.debugService.getViewModel().focusedStackFrame;o&&(e instanceof I||e instanceof u)&&(await e.setExpression(n,o),this.debugService.getViewModel().updateViews())}}}:{initialValue:e.name?e.name:"",ariaLabel:p("watchExpressionInputAriaLabel","Type watch expression"),placeholder:p("watchExpressionPlaceholder","Expression to watch"),onFinish:(n,s)=>{s&&n?(this.debugService.renameWatchExpression(e.getId(),n),A=!0,this.debugService.getViewModel().updateViews(),A=!1):e.name||this.debugService.removeWatchExpressions(e.getId())}}}renderActionBar(e,t){const n=me(this.contextKeyService,t),s=t,o=this.menuService.getMenuActions(v.DebugWatchContext,n,{arg:s,shouldForwardArgs:!1}),r=[];V(o,{primary:r,secondary:[]},"inline"),e.clear(),e.context=s,e.push(r,{icon:!0,label:!1})}};h=S([a(1,O),a(2,L),a(3,f),a(4,j),a(5,W),a(6,_)],h);function me(c,i){return c.createOverlay([[he.key,i.memoryReference!==void 0],[N.key,"expression"]])}class Se{getWidgetAriaLabel(){return p({comment:["Debug is a noun in this context, not a verb."],key:"watchAriaTreeLabel"},"Debug Watch Expressions")}getAriaLabel(i){return i instanceof u?p("watchExpressionAriaLabel","{0}, value {1}",i.name,i.value):p("watchVariableAriaLabel","{0}, value {1}",i.name,i.value)}}class xe{constructor(i){this.debugService=i}onDragOver(i,e,t,n,s){if(!(i instanceof C))return!1;const o=i.elements;if(!(o.length>0&&o[0]instanceof u))return!1;let r;if(t===void 0)r=x.After,t=-1;else switch(n){case g.TOP:case g.CENTER_TOP:r=x.Before;break;case g.CENTER_BOTTOM:case g.BOTTOM:r=x.After;break}return{accept:!0,effect:{type:$.Move,position:r},feedback:[t]}}getDragURI(i){return!(i instanceof u)||i===this.debugService.getViewModel().getSelectedExpression()?.expression?null:i.getId()}getDragLabel(i){if(i.length===1)return i[0].name}drop(i,e,t,n,s){if(!(i instanceof C))return;const o=i.elements[0];if(!(o instanceof u))throw new Error("Invalid dragged element");const r=this.debugService.getModel().getWatchExpressions(),d=r.indexOf(o);let l;if(e instanceof u){switch(l=r.indexOf(e),n){case g.BOTTOM:case g.CENTER_BOTTOM:l++;break}d<l&&l--}else l=r.length-1;this.debugService.moveWatchExpression(o.getId(),l)}dispose(){}}b(class extends re{constructor(){super({id:"watch.collapse",viewId:E,title:p("collapse","Collapse All"),f1:!1,icon:Y.collapseAll,precondition:y,menu:{id:v.ViewTitle,order:30,group:"navigation",when:D.equals("view",E)}})}runInView(i,e){e.collapseAll()}});const be="workbench.debug.viewlet.action.addWatchExpression",De=p("addWatchExpression","Add Expression");b(class extends M{constructor(){super({id:be,title:De,f1:!1,icon:de,menu:{id:v.ViewTitle,group:"navigation",when:D.equals("view",E)}})}run(i){i.get(f).addWatchExpression()}});const we="workbench.debug.viewlet.action.removeAllWatchExpressions",ye=p("removeAllWatchExpressions","Remove All Expressions");b(class extends M{constructor(){super({id:we,title:ye,f1:!1,icon:ue,precondition:y,menu:{id:v.ViewTitle,order:20,group:"navigation",when:D.equals("view",E)}})}run(i){i.get(f).removeWatchExpressions()}});export{be as ADD_WATCH_ID,De as ADD_WATCH_LABEL,we as REMOVE_WATCH_EXPRESSIONS_COMMAND_ID,ye as REMOVE_WATCH_EXPRESSIONS_LABEL,h as WatchExpressionsRenderer,m as WatchExpressionsView};