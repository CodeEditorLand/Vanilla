var w=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var g=(s,e,o,i)=>{for(var t=i>1?void 0:i?A(e,o):e,r=s.length-1,n;r>=0;r--)(n=s[r])&&(t=(i?n(e,o,t):n(t))||t);return i&&t&&w(e,o,t),t},a=(s,e)=>(o,i)=>e(o,i,s);import*as h from"../../../../base/browser/dom.js";import{DomScrollableElement as V}from"../../../../base/browser/ui/scrollbar/scrollableElement.js";import{coalesce as I}from"../../../../base/common/arrays.js";import{CancellationTokenSource as L}from"../../../../base/common/cancellation.js";import{KeyCode as N}from"../../../../base/common/keyCodes.js";import*as b from"../../../../base/common/lifecycle.js";import{clamp as P}from"../../../../base/common/numbers.js";import{isMacintosh as H}from"../../../../base/common/platform.js";import{ScrollbarVisibility as M}from"../../../../base/common/scrollable.js";import{ContentWidgetPositionPreference as m}from"../../../../editor/browser/editorBrowser.js";import{EditorOption as _}from"../../../../editor/common/config/editorOptions.js";import{Range as O}from"../../../../editor/common/core/range.js";import{ModelDecorationOptions as k}from"../../../../editor/common/model/textModel.js";import{ILanguageFeaturesService as R}from"../../../../editor/common/services/languageFeatures.js";import*as v from"../../../../nls.js";import{IMenuService as F,MenuId as W}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as B}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as z}from"../../../../platform/contextview/browser/contextView.js";import{IHoverService as K}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as G}from"../../../../platform/instantiation/common/instantiation.js";import{WorkbenchAsyncDataTree as U}from"../../../../platform/list/browser/listService.js";import{ILogService as q}from"../../../../platform/log/common/log.js";import{asCssVariable as f,editorHoverBackground as S,editorHoverBorder as $,editorHoverForeground as j}from"../../../../platform/theme/common/colorRegistry.js";import{AbstractExpressionDataSource as J,renderExpressionValue as Q}from"./baseDebugView.js";import{LinkDetector as X}from"./linkDetector.js";import{VariablesRenderer as x,VisualizedVariableRenderer as C,openContextMenuForVariableTreeElement as Y}from"./variablesView.js";import{IDebugService as E}from"../common/debug.js";import{Expression as y,Variable as D,VisualizedExpression as Z}from"../common/debugModel.js";import{getEvaluatableExpressionAtPosition as ee}from"../common/debugUtils.js";const c=h.$;var te=(i=>(i[i.NOT_CHANGED=0]="NOT_CHANGED",i[i.NOT_AVAILABLE=1]="NOT_AVAILABLE",i[i.CANCELLED=2]="CANCELLED",i))(te||{});async function T(s,e){if(!s)return null;const i=(await s.getChildren()).filter(t=>e[0]===t.name);return i.length!==1?null:e.length===1?i[0]:T(i[0],e.slice(1))}async function ie(s,e){const i=(await s.getScopes()).filter(r=>!r.expensive),t=I(await Promise.all(i.map(r=>T(r,e))));return t.length>0&&t.every(r=>r.value===t[0].value)?t[0]:void 0}let d=class{constructor(e,o,i,t,r,n,l){this.editor=e;this.debugService=o;this.instantiationService=i;this.menuService=t;this.contextKeyService=r;this.contextMenuService=n;this.hoverService=l;this.toDispose=[],this.showAtPosition=null,this.positionPreference=[m.ABOVE,m.BELOW],this.debugHoverComputer=this.instantiationService.createInstance(u,this.editor)}static ID="debug.hoverWidget";allowEditorOverflow=!0;_isVisible;safeTriangle;showCancellationSource;domNode;tree;showAtPosition;positionPreference;highlightDecorations=this.editor.createDecorationsCollection();complexValueContainer;complexValueTitle;valueContainer;treeContainer;toDispose;scrollbar;debugHoverComputer;expressionToRender;isUpdatingTree=!1;get isShowingComplexValue(){return this.complexValueContainer?.hidden===!1}create(){this.domNode=c(".debug-hover-widget"),this.complexValueContainer=h.append(this.domNode,c(".complex-value")),this.complexValueTitle=h.append(this.complexValueContainer,c(".title")),this.treeContainer=h.append(this.complexValueContainer,c(".debug-hover-tree")),this.treeContainer.setAttribute("role","tree");const e=h.append(this.complexValueContainer,c(".tip"));e.textContent=v.localize({key:"quickTip",comment:['"switch to editor language hover" means to show the programming language hover widget instead of the debug hover']},"Hold {0} key to switch to editor language hover",H?"Option":"Alt");const o=this.instantiationService.createInstance(re),i=this.instantiationService.createInstance(X);this.tree=this.instantiationService.createInstance(U,"DebugHover",this.treeContainer,new ne,[this.instantiationService.createInstance(x,i),this.instantiationService.createInstance(C,i)],o,{accessibilityProvider:new oe,mouseSupport:!1,horizontalScrolling:!0,useShadows:!1,keyboardNavigationLabelProvider:{getKeyboardNavigationLabel:t=>t.name},overrideStyles:{listBackground:S}}),this.toDispose.push(C.rendererOnVisualizationRange(this.debugService.getViewModel(),this.tree)),this.valueContainer=c(".value"),this.valueContainer.tabIndex=0,this.valueContainer.setAttribute("role","tooltip"),this.scrollbar=new V(this.valueContainer,{horizontal:M.Hidden}),this.domNode.appendChild(this.scrollbar.getDomNode()),this.toDispose.push(this.scrollbar),this.editor.applyFontInfo(this.domNode),this.domNode.style.backgroundColor=f(S),this.domNode.style.border=`1px solid ${f($)}`,this.domNode.style.color=f(j),this.toDispose.push(this.tree.onContextMenu(async t=>await this.onContextMenu(t))),this.toDispose.push(this.tree.onDidChangeContentHeight(()=>{this.isUpdatingTree||this.layoutTreeAndContainer()})),this.toDispose.push(this.tree.onDidChangeContentWidth(()=>{this.isUpdatingTree||this.layoutTreeAndContainer()})),this.registerListeners(),this.editor.addContentWidget(this)}async onContextMenu(e){const o=e.element;if(!(!(o instanceof D)||!o.value))return Y(this.contextKeyService,this.menuService,this.contextMenuService,W.DebugHoverContext,e)}registerListeners(){this.toDispose.push(h.addStandardDisposableListener(this.domNode,"keydown",e=>{e.equals(N.Escape)&&this.hide()})),this.toDispose.push(this.editor.onDidChangeConfiguration(e=>{e.hasChanged(_.fontInfo)&&this.editor.applyFontInfo(this.domNode)})),this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(async e=>{e instanceof D&&this.tree.hasNode(e)&&(await this.tree.updateChildren(e,!1,!0),await this.tree.expand(e))}))}isHovered(){return!!this.domNode?.matches(":hover")}isVisible(){return!!this._isVisible}willBeVisible(){return!!this.showCancellationSource}getId(){return d.ID}getDomNode(){return this.domNode}isInSafeTriangle(e,o){return this._isVisible&&!!this.safeTriangle?.contains(e,o)}async showAt(e,o,i){this.showCancellationSource?.dispose(!0);const t=this.showCancellationSource=new L,r=this.debugService.getViewModel().focusedSession;if(!r||!this.editor.hasModel())return this.hide(),1;const n=await this.debugHoverComputer.compute(e,t.token);if(t.token.isCancellationRequested)return this.hide(),2;if(!n.range)return this.hide(),1;if(this.isVisible()&&!n.rangeChanged)return 0;const l=await this.debugHoverComputer.evaluate(r);return t.token.isCancellationRequested?(this.hide(),2):!l||l instanceof y&&!l.available?(this.hide(),1):(this.highlightDecorations.set([{range:n.range,options:d._HOVER_HIGHLIGHT_DECORATION_OPTIONS}]),this.doShow(n.range.getStartPosition(),l,o,i))}static _HOVER_HIGHLIGHT_DECORATION_OPTIONS=k.register({description:"bdebug-hover-highlight",className:"hoverHighlight"});async doShow(e,o,i,t){this.domNode||this.create(),this.showAtPosition=e;const r=new b.DisposableStore;if(this._isVisible={store:r},!o.hasChildren){this.complexValueContainer.hidden=!0,this.valueContainer.hidden=!1,Q(r,o,this.valueContainer,{showChanged:!1,colorize:!0,hover:!1},this.hoverService),this.valueContainer.title="",this.editor.layoutContentWidget(this),this.scrollbar.scanDomNode(),i&&(this.editor.render(),this.valueContainer.focus());return}this.valueContainer.hidden=!0,this.expressionToRender=o,this.complexValueTitle.textContent=o.value,this.complexValueTitle.title=o.value,this.editor.layoutContentWidget(this),this.tree.scrollTop=0,this.tree.scrollLeft=0,this.complexValueContainer.hidden=!1,this.safeTriangle=t&&new h.SafeTriangle(t.posx,t.posy,this.domNode),i&&(this.editor.render(),this.tree.domFocus())}layoutTreeAndContainer(){this.layoutTree(),this.editor.layoutContentWidget(this)}layoutTree(){let o=1/0;if(this.showAtPosition){const n=this.editor.getDomNode()?.offsetTop||0,l=this.treeContainer.offsetTop+n,p=this.editor.getTopForLineNumber(this.showAtPosition.lineNumber,!0)-this.editor.getScrollTop();l<p&&(o=p+n-22)}const i=Math.min(Math.max(266,this.editor.getLayoutInfo().height*.55),this.tree.contentHeight+10,o),t=this.tree.contentWidth,r=P(t,400,550);this.tree.layout(i,r),this.treeContainer.style.height=`${i}px`,this.scrollbar.scanDomNode()}beforeRender(){if(this.expressionToRender){const e=this.expressionToRender;this.expressionToRender=void 0,this.isUpdatingTree=!0,this.tree.setInput(e).finally(()=>{this.isUpdatingTree=!1})}return null}afterRender(e){e&&(this.positionPreference=[e])}hide(){this.showCancellationSource&&(this.showCancellationSource.dispose(!0),this.showCancellationSource=void 0),this._isVisible&&(h.isAncestorOfActiveElement(this.domNode)&&this.editor.focus(),this._isVisible.store.dispose(),this._isVisible=void 0,this.highlightDecorations.clear(),this.editor.layoutContentWidget(this),this.positionPreference=[m.ABOVE,m.BELOW])}getPosition(){return this._isVisible?{position:this.showAtPosition,preference:this.positionPreference}:null}dispose(){this.toDispose=b.dispose(this.toDispose)}};d=g([a(1,E),a(2,G),a(3,F),a(4,B),a(5,z),a(6,K)],d);class oe{getWidgetAriaLabel(){return v.localize("treeAriaLabel","Debug Hover")}getAriaLabel(e){return v.localize({key:"variableAriaLabel",comment:["Do not translate placeholders. Placeholders are name and value of a variable."]},"{0}, value {1}, variables, debug",e.name,e.value)}}class re extends J{hasChildren(e){return e.hasChildren}doGetChildren(e){return e.getChildren()}}class ne{getHeight(e){return 18}getTemplateId(e){return e instanceof Z?C.ID:x.ID}}let u=class{constructor(e,o,i,t){this.editor=e;this.debugService=o;this.languageFeaturesService=i;this.logService=t}_current;async compute(e,o){if(!this.debugService.getViewModel().focusedSession||!this.editor.hasModel())return{rangeChanged:!1};const t=this.editor.getModel(),r=await ee(this.languageFeaturesService,t,e,o);if(!r)return{rangeChanged:!1};const{range:n,matchingExpression:l}=r,p=!this._current?.range.equalsRange(n);return this._current={expression:l,range:O.lift(n)},{rangeChanged:p,range:this._current.range}}async evaluate(e){if(!this._current){this.logService.error("No expression to evaluate");return}const o=this.editor.getModel(),i=o&&e.getSourceForUri(o?.uri);if(e.capabilities.supportsEvaluateForHovers){const t=new y(this._current.expression);return await t.evaluate(e,this.debugService.getViewModel().focusedStackFrame,"hover",void 0,i?{line:this._current.range.startLineNumber,column:this._current.range.startColumn,source:i.raw}:void 0),t}else{const t=this.debugService.getViewModel().focusedStackFrame;if(t)return await ie(t,I(this._current.expression.split(".").map(r=>r.trim())))}}};u=g([a(1,E),a(2,R),a(3,q)],u);export{d as DebugHoverWidget,te as ShowDebugHoverResult,ie as findExpressionInStackFrame};
