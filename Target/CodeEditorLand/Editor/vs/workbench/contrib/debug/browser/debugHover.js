var w=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var g=(s,e,o,t)=>{for(var i=t>1?void 0:t?V(e,o):e,r=s.length-1,n;r>=0;r--)(n=s[r])&&(i=(t?n(e,o,i):n(i))||i);return t&&i&&w(e,o,i),i},a=(s,e)=>(o,t)=>e(o,t,s);import*as d from"../../../../base/browser/dom.js";import{DomScrollableElement as A}from"../../../../base/browser/ui/scrollbar/scrollableElement.js";import{coalesce as C}from"../../../../base/common/arrays.js";import{CancellationTokenSource as L}from"../../../../base/common/cancellation.js";import{KeyCode as N}from"../../../../base/common/keyCodes.js";import*as I from"../../../../base/common/lifecycle.js";import{clamp as P}from"../../../../base/common/numbers.js";import{isMacintosh as H}from"../../../../base/common/platform.js";import{ScrollbarVisibility as M}from"../../../../base/common/scrollable.js";import{ContentWidgetPositionPreference as m}from"../../../../editor/browser/editorBrowser.js";import{EditorOption as R}from"../../../../editor/common/config/editorOptions.js";import{Range as _}from"../../../../editor/common/core/range.js";import{ModelDecorationOptions as O}from"../../../../editor/common/model/textModel.js";import{ILanguageFeaturesService as k}from"../../../../editor/common/services/languageFeatures.js";import*as v from"../../../../nls.js";import{IMenuService as F,MenuId as W}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as B}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as z}from"../../../../platform/contextview/browser/contextView.js";import{IInstantiationService as j}from"../../../../platform/instantiation/common/instantiation.js";import{WorkbenchAsyncDataTree as K}from"../../../../platform/list/browser/listService.js";import{ILogService as G}from"../../../../platform/log/common/log.js";import{asCssVariable as f,editorHoverBackground as x,editorHoverBorder as U,editorHoverForeground as q}from"../../../../platform/theme/common/colorRegistry.js";import{IDebugService as y}from"../common/debug.js";import{Expression as S,Variable as E,VisualizedExpression as $}from"../common/debugModel.js";import{getEvaluatableExpressionAtPosition as Y}from"../common/debugUtils.js";import{AbstractExpressionDataSource as J}from"./baseDebugView.js";import{DebugExpressionRenderer as Q}from"./debugExpressionRenderer.js";import{VariablesRenderer as T,VisualizedVariableRenderer as b,openContextMenuForVariableTreeElement as X}from"./variablesView.js";const c=d.$;var Z=(t=>(t[t.NOT_CHANGED=0]="NOT_CHANGED",t[t.NOT_AVAILABLE=1]="NOT_AVAILABLE",t[t.CANCELLED=2]="CANCELLED",t))(Z||{});async function D(s,e){if(!s)return null;const t=(await s.getChildren()).filter(i=>e[0]===i.name);return t.length!==1?null:e.length===1?t[0]:D(t[0],e.slice(1))}async function ee(s,e){const t=(await s.getScopes()).filter(r=>!r.expensive),i=C(await Promise.all(t.map(r=>D(r,e))));return i.length>0&&i.every(r=>r.value===i[0].value)?i[0]:void 0}let h=class{constructor(e,o,t,i,r,n){this.editor=e;this.debugService=o;this.instantiationService=t;this.menuService=i;this.contextKeyService=r;this.contextMenuService=n;this.toDispose=[],this.showAtPosition=null,this.positionPreference=[m.ABOVE,m.BELOW],this.debugHoverComputer=this.instantiationService.createInstance(u,this.editor),this.expressionRenderer=this.instantiationService.createInstance(Q)}static ID="debug.hoverWidget";allowEditorOverflow=!0;_isVisible;safeTriangle;showCancellationSource;domNode;tree;showAtPosition;positionPreference;highlightDecorations=this.editor.createDecorationsCollection();complexValueContainer;complexValueTitle;valueContainer;treeContainer;toDispose;scrollbar;debugHoverComputer;expressionRenderer;expressionToRender;isUpdatingTree=!1;get isShowingComplexValue(){return this.complexValueContainer?.hidden===!1}create(){this.domNode=c(".debug-hover-widget"),this.complexValueContainer=d.append(this.domNode,c(".complex-value")),this.complexValueTitle=d.append(this.complexValueContainer,c(".title")),this.treeContainer=d.append(this.complexValueContainer,c(".debug-hover-tree")),this.treeContainer.setAttribute("role","tree");const e=d.append(this.complexValueContainer,c(".tip"));e.textContent=v.localize({key:"quickTip",comment:['"switch to editor language hover" means to show the programming language hover widget instead of the debug hover']},"Hold {0} key to switch to editor language hover",H?"Option":"Alt");const o=this.instantiationService.createInstance(ie);this.tree=this.instantiationService.createInstance(K,"DebugHover",this.treeContainer,new oe,[this.instantiationService.createInstance(T,this.expressionRenderer),this.instantiationService.createInstance(b,this.expressionRenderer)],o,{accessibilityProvider:new te,mouseSupport:!1,horizontalScrolling:!0,useShadows:!1,keyboardNavigationLabelProvider:{getKeyboardNavigationLabel:t=>t.name},overrideStyles:{listBackground:x}}),this.toDispose.push(b.rendererOnVisualizationRange(this.debugService.getViewModel(),this.tree)),this.valueContainer=c(".value"),this.valueContainer.tabIndex=0,this.valueContainer.setAttribute("role","tooltip"),this.scrollbar=new A(this.valueContainer,{horizontal:M.Hidden}),this.domNode.appendChild(this.scrollbar.getDomNode()),this.toDispose.push(this.scrollbar),this.editor.applyFontInfo(this.domNode),this.domNode.style.backgroundColor=f(x),this.domNode.style.border=`1px solid ${f(U)}`,this.domNode.style.color=f(q),this.toDispose.push(this.tree.onContextMenu(async t=>await this.onContextMenu(t))),this.toDispose.push(this.tree.onDidChangeContentHeight(()=>{this.isUpdatingTree||this.layoutTreeAndContainer()})),this.toDispose.push(this.tree.onDidChangeContentWidth(()=>{this.isUpdatingTree||this.layoutTreeAndContainer()})),this.registerListeners(),this.editor.addContentWidget(this)}async onContextMenu(e){const o=e.element;if(!(!(o instanceof E)||!o.value))return X(this.contextKeyService,this.menuService,this.contextMenuService,W.DebugHoverContext,e)}registerListeners(){this.toDispose.push(d.addStandardDisposableListener(this.domNode,"keydown",e=>{e.equals(N.Escape)&&this.hide()})),this.toDispose.push(this.editor.onDidChangeConfiguration(e=>{e.hasChanged(R.fontInfo)&&this.editor.applyFontInfo(this.domNode)})),this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(async e=>{e instanceof E&&this.tree.hasNode(e)&&(await this.tree.updateChildren(e,!1,!0),await this.tree.expand(e))}))}isHovered(){return!!this.domNode?.matches(":hover")}isVisible(){return!!this._isVisible}willBeVisible(){return!!this.showCancellationSource}getId(){return h.ID}getDomNode(){return this.domNode}isInSafeTriangle(e,o){return this._isVisible&&!!this.safeTriangle?.contains(e,o)}async showAt(e,o,t){this.showCancellationSource?.dispose(!0);const i=this.showCancellationSource=new L,r=this.debugService.getViewModel().focusedSession;if(!r||!this.editor.hasModel())return this.hide(),1;const n=await this.debugHoverComputer.compute(e,i.token);if(i.token.isCancellationRequested)return this.hide(),2;if(!n.range)return this.hide(),1;if(this.isVisible()&&!n.rangeChanged)return 0;const l=await this.debugHoverComputer.evaluate(r);return i.token.isCancellationRequested?(this.hide(),2):!l||l instanceof S&&!l.available?(this.hide(),1):(this.highlightDecorations.set([{range:n.range,options:h._HOVER_HIGHLIGHT_DECORATION_OPTIONS}]),this.doShow(r,n.range.getStartPosition(),l,o,t))}static _HOVER_HIGHLIGHT_DECORATION_OPTIONS=O.register({description:"bdebug-hover-highlight",className:"hoverHighlight"});async doShow(e,o,t,i,r){this.domNode||this.create(),this.showAtPosition=o;const n=new I.DisposableStore;if(this._isVisible={store:n},!t.hasChildren){this.complexValueContainer.hidden=!0,this.valueContainer.hidden=!1,n.add(this.expressionRenderer.renderValue(this.valueContainer,t,{showChanged:!1,colorize:!0,hover:!1,session:e})),this.valueContainer.title="",this.editor.layoutContentWidget(this),this.scrollbar.scanDomNode(),i&&(this.editor.render(),this.valueContainer.focus());return}this.valueContainer.hidden=!0,this.expressionToRender=t,this.complexValueTitle.textContent=t.value,this.complexValueTitle.title=t.value,this.editor.layoutContentWidget(this),this.tree.scrollTop=0,this.tree.scrollLeft=0,this.complexValueContainer.hidden=!1,this.safeTriangle=r&&new d.SafeTriangle(r.posx,r.posy,this.domNode),i&&(this.editor.render(),this.tree.domFocus())}layoutTreeAndContainer(){this.layoutTree(),this.editor.layoutContentWidget(this)}layoutTree(){let o=Number.POSITIVE_INFINITY;if(this.showAtPosition){const n=this.editor.getDomNode()?.offsetTop||0,l=this.treeContainer.offsetTop+n,p=this.editor.getTopForLineNumber(this.showAtPosition.lineNumber,!0)-this.editor.getScrollTop();l<p&&(o=p+n-22)}const t=Math.min(Math.max(266,this.editor.getLayoutInfo().height*.55),this.tree.contentHeight+10,o),i=this.tree.contentWidth,r=P(i,400,550);this.tree.layout(t,r),this.treeContainer.style.height=`${t}px`,this.scrollbar.scanDomNode()}beforeRender(){if(this.expressionToRender){const e=this.expressionToRender;this.expressionToRender=void 0,this.isUpdatingTree=!0,this.tree.setInput(e).finally(()=>{this.isUpdatingTree=!1})}return null}afterRender(e){e&&(this.positionPreference=[e])}hide(){this.showCancellationSource&&(this.showCancellationSource.dispose(!0),this.showCancellationSource=void 0),this._isVisible&&(d.isAncestorOfActiveElement(this.domNode)&&this.editor.focus(),this._isVisible.store.dispose(),this._isVisible=void 0,this.highlightDecorations.clear(),this.editor.layoutContentWidget(this),this.positionPreference=[m.ABOVE,m.BELOW])}getPosition(){return this._isVisible?{position:this.showAtPosition,preference:this.positionPreference}:null}dispose(){this.toDispose=I.dispose(this.toDispose)}};h=g([a(1,y),a(2,j),a(3,F),a(4,B),a(5,z)],h);class te{getWidgetAriaLabel(){return v.localize("treeAriaLabel","Debug Hover")}getAriaLabel(e){return v.localize({key:"variableAriaLabel",comment:["Do not translate placeholders. Placeholders are name and value of a variable."]},"{0}, value {1}, variables, debug",e.name,e.value)}}class ie extends J{hasChildren(e){return e.hasChildren}doGetChildren(e){return e.getChildren()}}class oe{getHeight(e){return 18}getTemplateId(e){return e instanceof $?b.ID:T.ID}}let u=class{constructor(e,o,t,i){this.editor=e;this.debugService=o;this.languageFeaturesService=t;this.logService=i}_current;async compute(e,o){if(!this.debugService.getViewModel().focusedSession||!this.editor.hasModel())return{rangeChanged:!1};const i=this.editor.getModel(),r=await Y(this.languageFeaturesService,i,e,o);if(!r)return{rangeChanged:!1};const{range:n,matchingExpression:l}=r,p=!this._current?.range.equalsRange(n);return this._current={expression:l,range:_.lift(n)},{rangeChanged:p,range:this._current.range}}async evaluate(e){if(!this._current){this.logService.error("No expression to evaluate");return}const o=this.editor.getModel(),t=o&&e.getSourceForUri(o?.uri);if(e.capabilities.supportsEvaluateForHovers){const i=new S(this._current.expression);return await i.evaluate(e,this.debugService.getViewModel().focusedStackFrame,"hover",void 0,t?{line:this._current.range.startLineNumber,column:this._current.range.startColumn,source:t.raw}:void 0),i}else{const i=this.debugService.getViewModel().focusedStackFrame;if(i)return await ee(i,C(this._current.expression.split(".").map(r=>r.trim())))}}};u=g([a(1,y),a(2,k),a(3,G)],u);export{h as DebugHoverWidget,Z as ShowDebugHoverResult,ee as findExpressionInStackFrame};
