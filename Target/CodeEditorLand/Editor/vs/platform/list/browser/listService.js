var xe=Object.defineProperty;var De=Object.getOwnPropertyDescriptor;var O=(a,e,t,i)=>{for(var n=i>1?void 0:i?De(e,t):e,s=a.length-1,l;s>=0;s--)(l=a[s])&&(n=(i?l(e,t,n):l(n))||n);return i&&n&&xe(e,t,n),n},h=(a,e)=>(t,i)=>e(t,i,a);import{createStyleSheet as ke,isActiveElement as Me,isKeyboardEvent as Ke}from"../../../base/browser/dom.js";import{PagedList as Fe}from"../../../base/browser/ui/list/listPaging.js";import{DefaultStyleController as Le,isSelectionRangeChangeEvent as we,isSelectionSingleChangeEvent as Ee,List as Ae,TypeNavigationMode as A}from"../../../base/browser/ui/list/listWidget.js";import{Table as We}from"../../../base/browser/ui/table/tableWidget.js";import{TreeFindMode as z,TreeFindMatchType as ye}from"../../../base/browser/ui/tree/abstractTree.js";import{AsyncDataTree as Ne,CompressibleAsyncDataTree as Ve}from"../../../base/browser/ui/tree/asyncDataTree.js";import{DataTree as Re}from"../../../base/browser/ui/tree/dataTree.js";import{CompressibleObjectTree as ze,ObjectTree as Be}from"../../../base/browser/ui/tree/objectTree.js";import{Emitter as Pe,Event as _e}from"../../../base/common/event.js";import{combinedDisposable as He,Disposable as Se,DisposableStore as le,dispose as Ue,toDisposable as je}from"../../../base/common/lifecycle.js";import{localize as S}from"../../../nls.js";import{IConfigurationService as I}from"../../configuration/common/configuration.js";import{Extensions as Ge}from"../../configuration/common/configurationRegistry.js";import{ContextKeyExpr as B,IContextKeyService as x,RawContextKey as v}from"../../contextkey/common/contextkey.js";import{InputFocusedContextKey as qe}from"../../contextkey/common/contextkeys.js";import{IContextViewService as Xe}from"../../contextview/browser/contextView.js";import{createDecorator as Ye,IInstantiationService as F}from"../../instantiation/common/instantiation.js";import{IKeybindingService as Je}from"../../keybinding/common/keybinding.js";import{ResultKind as fe}from"../../keybinding/common/keybindingResolver.js";import{Registry as Qe}from"../../registry/common/platform.js";import{defaultFindWidgetStyles as Ze,defaultListStyles as W,getListStyles as P}from"../../theme/browser/defaultStyles.js";const L=Ye("listService");class Di{disposables=new le;lists=[];_lastFocusedWidget=void 0;_hasCreatedStyleController=!1;get lastFocusedList(){return this._lastFocusedWidget}constructor(){}setLastFocusedList(e){e!==this._lastFocusedWidget&&(this._lastFocusedWidget?.getHTMLElement().classList.remove("last-focused"),this._lastFocusedWidget=e,this._lastFocusedWidget?.getHTMLElement().classList.add("last-focused"))}register(e,t){if(this._hasCreatedStyleController||(this._hasCreatedStyleController=!0,new Le(ke(),"").style(W)),this.lists.some(n=>n.widget===e))throw new Error("Cannot register the same widget multiple times");const i={widget:e,extraContextKeys:t};return this.lists.push(i),Me(e.getHTMLElement())&&this.setLastFocusedList(e),He(e.onDidFocus(()=>this.setLastFocusedList(e)),je(()=>this.lists.splice(this.lists.indexOf(i),1)),e.onDidDispose(()=>{this.lists=this.lists.filter(n=>n!==i),this._lastFocusedWidget===e&&this.setLastFocusedList(void 0)}))}dispose(){this.disposables.dispose()}}const N=new v("listScrollAtBoundary","none"),ki=B.or(N.isEqualTo("top"),N.isEqualTo("both")),Mi=B.or(N.isEqualTo("bottom"),N.isEqualTo("both")),be=new v("listFocus",!0),ve=new v("treestickyScrollFocused",!1),_=new v("listSupportsMultiselect",!0),Ki=B.and(be,B.not(qe),ve.negate()),ae=new v("listHasSelectionOrFocus",!1),ce=new v("listDoubleSelection",!1),de=new v("listMultiSelection",!1),H=new v("listSelectionNavigation",!1),$e=new v("listSupportsFind",!0),et=new v("treeElementCanCollapse",!1),tt=new v("treeElementHasParent",!1),it=new v("treeElementCanExpand",!1),nt=new v("treeElementHasChild",!1),ot=new v("treeFindOpen",!1),Te="listTypeNavigationMode",Ie="listAutomaticKeyboardNavigation";function U(a,e){const t=a.createScoped(e.getHTMLElement());return be.bindTo(t),t}function j(a,e){const t=N.bindTo(a),i=()=>{const n=e.scrollTop===0,s=e.scrollHeight-e.renderHeight-e.scrollTop<1;n&&s?t.set("both"):n?t.set("top"):s?t.set("bottom"):t.set("none")};return i(),e.onDidScroll(i)}const E="workbench.list.multiSelectModifier",G="workbench.list.openMode",T="workbench.list.horizontalScrolling",ue="workbench.list.defaultFindMode",pe="workbench.list.typeNavigationMode",q="workbench.list.keyboardNavigation",m="workbench.list.scrollByPage",he="workbench.list.defaultFindMatchType",V="workbench.tree.indent",X="workbench.tree.renderIndentGuides",C="workbench.list.smoothScrolling",D="workbench.list.mouseWheelScrollSensitivity",k="workbench.list.fastScrollSensitivity",Y="workbench.tree.expandMode",J="workbench.tree.enableStickyScroll",Q="workbench.tree.stickyScrollMaxItemCount";function M(a){return a.getValue(E)==="alt"}class st extends Se{constructor(t){super();this.configurationService=t;this.useAltAsMultipleSelectionModifier=M(t),this.registerListeners()}useAltAsMultipleSelectionModifier;registerListeners(){this._register(this.configurationService.onDidChangeConfiguration(t=>{t.affectsConfiguration(E)&&(this.useAltAsMultipleSelectionModifier=M(this.configurationService))}))}isSelectionSingleChangeEvent(t){return this.useAltAsMultipleSelectionModifier?t.browserEvent.altKey:Ee(t)}isSelectionRangeChangeEvent(t){return we(t)}}function Z(a,e){const t=a.get(I),i=a.get(Je),n=new le;return[{...e,keyboardNavigationDelegate:{mightProducePrintableCharacter(l){return i.mightProducePrintableCharacter(l)}},smoothScrolling:!!t.getValue(C),mouseWheelScrollSensitivity:t.getValue(D),fastScrollSensitivity:t.getValue(k),multipleSelectionController:e.multipleSelectionController??n.add(new st(t)),keyboardNavigationEventFilter:at(i),scrollByPage:!!t.getValue(m)},n]}let $=class extends Ae{contextKeyService;listSupportsMultiSelect;listHasSelectionOrFocus;listDoubleSelection;listMultiSelection;horizontalScrolling;_useAltAsMultipleSelectionModifier;navigator;get onDidOpen(){return this.navigator.onDidOpen}constructor(e,t,i,n,s,l,d,u,y){const b=typeof s.horizontalScrolling<"u"?s.horizontalScrolling:!!u.getValue(T),[r,o]=y.invokeFunction(Z,s);super(e,t,i,n,{keyboardSupport:!1,...r,horizontalScrolling:b}),this.disposables.add(o),this.contextKeyService=U(l,this),this.disposables.add(j(this.contextKeyService,this)),this.listSupportsMultiSelect=_.bindTo(this.contextKeyService),this.listSupportsMultiSelect.set(s.multipleSelectionSupport!==!1),H.bindTo(this.contextKeyService).set(!!s.selectionNavigation),this.listHasSelectionOrFocus=ae.bindTo(this.contextKeyService),this.listDoubleSelection=ce.bindTo(this.contextKeyService),this.listMultiSelection=de.bindTo(this.contextKeyService),this.horizontalScrolling=s.horizontalScrolling,this._useAltAsMultipleSelectionModifier=M(u),this.disposables.add(this.contextKeyService),this.disposables.add(d.register(this)),this.updateStyles(s.overrideStyles),this.disposables.add(this.onDidChangeSelection(()=>{const f=this.getSelection(),c=this.getFocus();this.contextKeyService.bufferChangeEvents(()=>{this.listHasSelectionOrFocus.set(f.length>0||c.length>0),this.listMultiSelection.set(f.length>1),this.listDoubleSelection.set(f.length===2)})})),this.disposables.add(this.onDidChangeFocus(()=>{const f=this.getSelection(),c=this.getFocus();this.listHasSelectionOrFocus.set(f.length>0||c.length>0)})),this.disposables.add(u.onDidChangeConfiguration(f=>{f.affectsConfiguration(E)&&(this._useAltAsMultipleSelectionModifier=M(u));let c={};if(f.affectsConfiguration(T)&&this.horizontalScrolling===void 0){const p=!!u.getValue(T);c={...c,horizontalScrolling:p}}if(f.affectsConfiguration(m)){const p=!!u.getValue(m);c={...c,scrollByPage:p}}if(f.affectsConfiguration(C)){const p=!!u.getValue(C);c={...c,smoothScrolling:p}}if(f.affectsConfiguration(D)){const p=u.getValue(D);c={...c,mouseWheelScrollSensitivity:p}}if(f.affectsConfiguration(k)){const p=u.getValue(k);c={...c,fastScrollSensitivity:p}}Object.keys(c).length>0&&this.updateOptions(c)})),this.navigator=new me(this,{configurationService:u,...s}),this.disposables.add(this.navigator)}updateOptions(e){super.updateOptions(e),e.overrideStyles!==void 0&&this.updateStyles(e.overrideStyles),e.multipleSelectionSupport!==void 0&&this.listSupportsMultiSelect.set(!!e.multipleSelectionSupport)}updateStyles(e){this.style(e?P(e):W)}get useAltAsMultipleSelectionModifier(){return this._useAltAsMultipleSelectionModifier}};$=O([h(5,x),h(6,L),h(7,I),h(8,F)],$);let ee=class extends Fe{contextKeyService;disposables;listSupportsMultiSelect;_useAltAsMultipleSelectionModifier;horizontalScrolling;navigator;get onDidOpen(){return this.navigator.onDidOpen}constructor(e,t,i,n,s,l,d,u,y){const b=typeof s.horizontalScrolling<"u"?s.horizontalScrolling:!!u.getValue(T),[r,o]=y.invokeFunction(Z,s);super(e,t,i,n,{keyboardSupport:!1,...r,horizontalScrolling:b}),this.disposables=new le,this.disposables.add(o),this.contextKeyService=U(l,this),this.disposables.add(j(this.contextKeyService,this.widget)),this.horizontalScrolling=s.horizontalScrolling,this.listSupportsMultiSelect=_.bindTo(this.contextKeyService),this.listSupportsMultiSelect.set(s.multipleSelectionSupport!==!1),H.bindTo(this.contextKeyService).set(!!s.selectionNavigation),this._useAltAsMultipleSelectionModifier=M(u),this.disposables.add(this.contextKeyService),this.disposables.add(d.register(this)),this.updateStyles(s.overrideStyles),this.disposables.add(u.onDidChangeConfiguration(f=>{f.affectsConfiguration(E)&&(this._useAltAsMultipleSelectionModifier=M(u));let c={};if(f.affectsConfiguration(T)&&this.horizontalScrolling===void 0){const p=!!u.getValue(T);c={...c,horizontalScrolling:p}}if(f.affectsConfiguration(m)){const p=!!u.getValue(m);c={...c,scrollByPage:p}}if(f.affectsConfiguration(C)){const p=!!u.getValue(C);c={...c,smoothScrolling:p}}if(f.affectsConfiguration(D)){const p=u.getValue(D);c={...c,mouseWheelScrollSensitivity:p}}if(f.affectsConfiguration(k)){const p=u.getValue(k);c={...c,fastScrollSensitivity:p}}Object.keys(c).length>0&&this.updateOptions(c)})),this.navigator=new me(this,{configurationService:u,...s}),this.disposables.add(this.navigator)}updateOptions(e){super.updateOptions(e),e.overrideStyles!==void 0&&this.updateStyles(e.overrideStyles),e.multipleSelectionSupport!==void 0&&this.listSupportsMultiSelect.set(!!e.multipleSelectionSupport)}updateStyles(e){this.style(e?P(e):W)}get useAltAsMultipleSelectionModifier(){return this._useAltAsMultipleSelectionModifier}dispose(){this.disposables.dispose(),super.dispose()}};ee=O([h(5,x),h(6,L),h(7,I),h(8,F)],ee);let te=class extends We{contextKeyService;listSupportsMultiSelect;listHasSelectionOrFocus;listDoubleSelection;listMultiSelection;horizontalScrolling;_useAltAsMultipleSelectionModifier;navigator;get onDidOpen(){return this.navigator.onDidOpen}constructor(e,t,i,n,s,l,d,u,y,b){const r=typeof l.horizontalScrolling<"u"?l.horizontalScrolling:!!y.getValue(T),[o,g]=b.invokeFunction(Z,l);super(e,t,i,n,s,{keyboardSupport:!1,...o,horizontalScrolling:r}),this.disposables.add(g),this.contextKeyService=U(d,this),this.disposables.add(j(this.contextKeyService,this)),this.listSupportsMultiSelect=_.bindTo(this.contextKeyService),this.listSupportsMultiSelect.set(l.multipleSelectionSupport!==!1),H.bindTo(this.contextKeyService).set(!!l.selectionNavigation),this.listHasSelectionOrFocus=ae.bindTo(this.contextKeyService),this.listDoubleSelection=ce.bindTo(this.contextKeyService),this.listMultiSelection=de.bindTo(this.contextKeyService),this.horizontalScrolling=l.horizontalScrolling,this._useAltAsMultipleSelectionModifier=M(y),this.disposables.add(this.contextKeyService),this.disposables.add(u.register(this)),this.updateStyles(l.overrideStyles),this.disposables.add(this.onDidChangeSelection(()=>{const c=this.getSelection(),p=this.getFocus();this.contextKeyService.bufferChangeEvents(()=>{this.listHasSelectionOrFocus.set(c.length>0||p.length>0),this.listMultiSelection.set(c.length>1),this.listDoubleSelection.set(c.length===2)})})),this.disposables.add(this.onDidChangeFocus(()=>{const c=this.getSelection(),p=this.getFocus();this.listHasSelectionOrFocus.set(c.length>0||p.length>0)})),this.disposables.add(y.onDidChangeConfiguration(c=>{c.affectsConfiguration(E)&&(this._useAltAsMultipleSelectionModifier=M(y));let p={};if(c.affectsConfiguration(T)&&this.horizontalScrolling===void 0){const K=!!y.getValue(T);p={...p,horizontalScrolling:K}}if(c.affectsConfiguration(m)){const K=!!y.getValue(m);p={...p,scrollByPage:K}}if(c.affectsConfiguration(C)){const K=!!y.getValue(C);p={...p,smoothScrolling:K}}if(c.affectsConfiguration(D)){const K=y.getValue(D);p={...p,mouseWheelScrollSensitivity:K}}if(c.affectsConfiguration(k)){const K=y.getValue(k);p={...p,fastScrollSensitivity:K}}Object.keys(p).length>0&&this.updateOptions(p)})),this.navigator=new rt(this,{configurationService:y,...l}),this.disposables.add(this.navigator)}updateOptions(e){super.updateOptions(e),e.overrideStyles!==void 0&&this.updateStyles(e.overrideStyles),e.multipleSelectionSupport!==void 0&&this.listSupportsMultiSelect.set(!!e.multipleSelectionSupport)}updateStyles(e){this.style(e?P(e):W)}get useAltAsMultipleSelectionModifier(){return this._useAltAsMultipleSelectionModifier}dispose(){this.disposables.dispose(),super.dispose()}};te=O([h(6,x),h(7,L),h(8,I),h(9,F)],te);function Fi(a="keydown",e,t){const i=new KeyboardEvent(a);return i.preserveFocus=e,i.pinned=t,i.__forceEvent=!0,i}class ge extends Se{constructor(t,i){super();this.widget=t;this._register(_e.filter(this.widget.onDidChangeSelection,n=>Ke(n.browserEvent))(n=>this.onSelectionFromKeyboard(n))),this._register(this.widget.onPointer(n=>this.onPointer(n.element,n.browserEvent))),this._register(this.widget.onMouseDblClick(n=>this.onMouseDblClick(n.element,n.browserEvent))),typeof i?.openOnSingleClick!="boolean"&&i?.configurationService?(this.openOnSingleClick=i?.configurationService.getValue(G)!=="doubleClick",this._register(i?.configurationService.onDidChangeConfiguration(n=>{n.affectsConfiguration(G)&&(this.openOnSingleClick=i?.configurationService.getValue(G)!=="doubleClick")}))):this.openOnSingleClick=i?.openOnSingleClick??!0}openOnSingleClick;_onDidOpen=this._register(new Pe);onDidOpen=this._onDidOpen.event;onSelectionFromKeyboard(t){if(t.elements.length!==1)return;const i=t.browserEvent,n=typeof i.preserveFocus=="boolean"?i.preserveFocus:!0,s=typeof i.pinned=="boolean"?i.pinned:!n,l=!1;this._open(this.getSelectedElement(),n,s,l,t.browserEvent)}onPointer(t,i){if(!this.openOnSingleClick||i.detail===2)return;const s=i.button===1,l=!0,d=s,u=i.ctrlKey||i.metaKey||i.altKey;this._open(t,l,d,u,i)}onMouseDblClick(t,i){if(!i)return;const n=i.target;if(n.classList.contains("monaco-tl-twistie")||n.classList.contains("monaco-icon-label")&&n.classList.contains("folder-icon")&&i.offsetX<16)return;const l=!1,d=!0,u=i.ctrlKey||i.metaKey||i.altKey;this._open(t,l,d,u,i)}_open(t,i,n,s,l){t&&this._onDidOpen.fire({editorOptions:{preserveFocus:i,pinned:n,revealIfVisible:!0},sideBySide:s,element:t,browserEvent:l})}}class me extends ge{widget;constructor(e,t){super(e,t),this.widget=e}getSelectedElement(){return this.widget.getSelectedElements()[0]}}class rt extends ge{constructor(e,t){super(e,t)}getSelectedElement(){return this.widget.getSelectedElements()[0]}}class lt extends ge{constructor(e,t){super(e,t)}getSelectedElement(){return this.widget.getSelection()[0]??void 0}}function at(a){let e=!1;return t=>{if(t.toKeyCodeChord().isModifierKey())return!1;if(e)return e=!1,!1;const i=a.softDispatch(t,t.target);return i.kind===fe.MoreChordsNeeded?(e=!0,!1):(e=!1,i.kind===fe.NoMatchingKb)}}let ie=class extends Be{internals;get contextKeyService(){return this.internals.contextKeyService}get useAltAsMultipleSelectionModifier(){return this.internals.useAltAsMultipleSelectionModifier}get onDidOpen(){return this.internals.onDidOpen}constructor(e,t,i,n,s,l,d,u,y){const{options:b,getTypeNavigationMode:r,disposable:o}=l.invokeFunction(R,s);super(e,t,i,n,b),this.disposables.add(o),this.internals=new w(this,s,r,s.overrideStyles,d,u,y),this.disposables.add(this.internals)}updateOptions(e){super.updateOptions(e),this.internals.updateOptions(e)}};ie=O([h(5,F),h(6,x),h(7,L),h(8,I)],ie);let ne=class extends ze{internals;get contextKeyService(){return this.internals.contextKeyService}get useAltAsMultipleSelectionModifier(){return this.internals.useAltAsMultipleSelectionModifier}get onDidOpen(){return this.internals.onDidOpen}constructor(e,t,i,n,s,l,d,u,y){const{options:b,getTypeNavigationMode:r,disposable:o}=l.invokeFunction(R,s);super(e,t,i,n,b),this.disposables.add(o),this.internals=new w(this,s,r,s.overrideStyles,d,u,y),this.disposables.add(this.internals)}updateOptions(e={}){super.updateOptions(e),e.overrideStyles&&this.internals.updateStyleOverrides(e.overrideStyles),this.internals.updateOptions(e)}};ne=O([h(5,F),h(6,x),h(7,L),h(8,I)],ne);let oe=class extends Re{internals;get contextKeyService(){return this.internals.contextKeyService}get useAltAsMultipleSelectionModifier(){return this.internals.useAltAsMultipleSelectionModifier}get onDidOpen(){return this.internals.onDidOpen}constructor(e,t,i,n,s,l,d,u,y,b){const{options:r,getTypeNavigationMode:o,disposable:g}=d.invokeFunction(R,l);super(e,t,i,n,s,r),this.disposables.add(g),this.internals=new w(this,l,o,l.overrideStyles,u,y,b),this.disposables.add(this.internals)}updateOptions(e={}){super.updateOptions(e),e.overrideStyles!==void 0&&this.internals.updateStyleOverrides(e.overrideStyles),this.internals.updateOptions(e)}};oe=O([h(6,F),h(7,x),h(8,L),h(9,I)],oe);let se=class extends Ne{internals;get contextKeyService(){return this.internals.contextKeyService}get useAltAsMultipleSelectionModifier(){return this.internals.useAltAsMultipleSelectionModifier}get onDidOpen(){return this.internals.onDidOpen}constructor(e,t,i,n,s,l,d,u,y,b){const{options:r,getTypeNavigationMode:o,disposable:g}=d.invokeFunction(R,l);super(e,t,i,n,s,r),this.disposables.add(g),this.internals=new w(this,l,o,l.overrideStyles,u,y,b),this.disposables.add(this.internals)}updateOptions(e={}){super.updateOptions(e),e.overrideStyles&&this.internals.updateStyleOverrides(e.overrideStyles),this.internals.updateOptions(e)}};se=O([h(6,F),h(7,x),h(8,L),h(9,I)],se);let re=class extends Ve{internals;get contextKeyService(){return this.internals.contextKeyService}get useAltAsMultipleSelectionModifier(){return this.internals.useAltAsMultipleSelectionModifier}get onDidOpen(){return this.internals.onDidOpen}constructor(e,t,i,n,s,l,d,u,y,b,r){const{options:o,getTypeNavigationMode:g,disposable:f}=u.invokeFunction(R,d);super(e,t,i,n,s,l,o),this.disposables.add(f),this.internals=new w(this,d,g,d.overrideStyles,y,b,r),this.disposables.add(this.internals)}updateOptions(e){super.updateOptions(e),this.internals.updateOptions(e)}};re=O([h(7,F),h(8,x),h(9,L),h(10,I)],re);function Ce(a){const e=a.getValue(ue);if(e==="highlight")return z.Highlight;if(e==="filter")return z.Filter;const t=a.getValue(q);if(t==="simple"||t==="highlight")return z.Highlight;if(t==="filter")return z.Filter}function Oe(a){const e=a.getValue(he);if(e==="fuzzy")return ye.Fuzzy;if(e==="contiguous")return ye.Contiguous}function R(a,e){const t=a.get(I),i=a.get(Xe),n=a.get(x),s=a.get(F),l=()=>{const o=n.getContextKeyValue(Te);if(o==="automatic")return A.Automatic;if(o==="trigger")return A.Trigger;if(n.getContextKeyValue(Ie)===!1)return A.Trigger;const f=t.getValue(pe);if(f==="automatic")return A.Automatic;if(f==="trigger")return A.Trigger},d=e.horizontalScrolling!==void 0?e.horizontalScrolling:!!t.getValue(T),[u,y]=s.invokeFunction(Z,e),b=e.paddingBottom,r=e.renderIndentGuides!==void 0?e.renderIndentGuides:t.getValue(X);return{getTypeNavigationMode:l,disposable:y,options:{keyboardSupport:!1,...u,indent:typeof t.getValue(V)=="number"?t.getValue(V):void 0,renderIndentGuides:r,smoothScrolling:!!t.getValue(C),defaultFindMode:Ce(t),defaultFindMatchType:Oe(t),horizontalScrolling:d,scrollByPage:!!t.getValue(m),paddingBottom:b,hideTwistiesOfChildlessElements:e.hideTwistiesOfChildlessElements,expandOnlyOnTwistieClick:e.expandOnlyOnTwistieClick??t.getValue(Y)==="doubleClick",contextViewProvider:i,findWidgetStyles:Ze,enableStickyScroll:!!t.getValue(J),stickyScrollMaxItemCount:Number(t.getValue(Q))}}}let w=class{constructor(e,t,i,n,s,l,d){this.tree=e;this.contextKeyService=U(s,e),this.disposables.push(j(this.contextKeyService,e)),this.listSupportsMultiSelect=_.bindTo(this.contextKeyService),this.listSupportsMultiSelect.set(t.multipleSelectionSupport!==!1),H.bindTo(this.contextKeyService).set(!!t.selectionNavigation),this.listSupportFindWidget=$e.bindTo(this.contextKeyService),this.listSupportFindWidget.set(t.findWidgetEnabled??!0),this.hasSelectionOrFocus=ae.bindTo(this.contextKeyService),this.hasDoubleSelection=ce.bindTo(this.contextKeyService),this.hasMultiSelection=de.bindTo(this.contextKeyService),this.treeElementCanCollapse=et.bindTo(this.contextKeyService),this.treeElementHasParent=tt.bindTo(this.contextKeyService),this.treeElementCanExpand=it.bindTo(this.contextKeyService),this.treeElementHasChild=nt.bindTo(this.contextKeyService),this.treeFindOpen=ot.bindTo(this.contextKeyService),this.treeStickyScrollFocused=ve.bindTo(this.contextKeyService),this._useAltAsMultipleSelectionModifier=M(d),this.updateStyleOverrides(n);const y=()=>{const r=e.getFocus()[0];if(!r)return;const o=e.getNode(r);this.treeElementCanCollapse.set(o.collapsible&&!o.collapsed),this.treeElementHasParent.set(!!e.getParentElement(r)),this.treeElementCanExpand.set(o.collapsible&&o.collapsed),this.treeElementHasChild.set(!!e.getFirstElementChild(r))},b=new Set;b.add(Te),b.add(Ie),this.disposables.push(this.contextKeyService,l.register(e),e.onDidChangeSelection(()=>{const r=e.getSelection(),o=e.getFocus();this.contextKeyService.bufferChangeEvents(()=>{this.hasSelectionOrFocus.set(r.length>0||o.length>0),this.hasMultiSelection.set(r.length>1),this.hasDoubleSelection.set(r.length===2)})}),e.onDidChangeFocus(()=>{const r=e.getSelection(),o=e.getFocus();this.hasSelectionOrFocus.set(r.length>0||o.length>0),y()}),e.onDidChangeCollapseState(y),e.onDidChangeModel(y),e.onDidChangeFindOpenState(r=>this.treeFindOpen.set(r)),e.onDidChangeStickyScrollFocused(r=>this.treeStickyScrollFocused.set(r)),d.onDidChangeConfiguration(r=>{let o={};if(r.affectsConfiguration(E)&&(this._useAltAsMultipleSelectionModifier=M(d)),r.affectsConfiguration(V)){const g=d.getValue(V);o={...o,indent:g}}if(r.affectsConfiguration(X)&&t.renderIndentGuides===void 0){const g=d.getValue(X);o={...o,renderIndentGuides:g}}if(r.affectsConfiguration(C)){const g=!!d.getValue(C);o={...o,smoothScrolling:g}}if(r.affectsConfiguration(ue)||r.affectsConfiguration(q)){const g=Ce(d);o={...o,defaultFindMode:g}}if(r.affectsConfiguration(pe)||r.affectsConfiguration(q)){const g=i();o={...o,typeNavigationMode:g}}if(r.affectsConfiguration(he)){const g=Oe(d);o={...o,defaultFindMatchType:g}}if(r.affectsConfiguration(T)&&t.horizontalScrolling===void 0){const g=!!d.getValue(T);o={...o,horizontalScrolling:g}}if(r.affectsConfiguration(m)){const g=!!d.getValue(m);o={...o,scrollByPage:g}}if(r.affectsConfiguration(Y)&&t.expandOnlyOnTwistieClick===void 0&&(o={...o,expandOnlyOnTwistieClick:d.getValue(Y)==="doubleClick"}),r.affectsConfiguration(J)){const g=d.getValue(J);o={...o,enableStickyScroll:g}}if(r.affectsConfiguration(Q)){const g=Math.max(1,d.getValue(Q));o={...o,stickyScrollMaxItemCount:g}}if(r.affectsConfiguration(D)){const g=d.getValue(D);o={...o,mouseWheelScrollSensitivity:g}}if(r.affectsConfiguration(k)){const g=d.getValue(k);o={...o,fastScrollSensitivity:g}}Object.keys(o).length>0&&e.updateOptions(o)}),this.contextKeyService.onDidChangeContext(r=>{r.affectsSome(b)&&e.updateOptions({typeNavigationMode:i()})})),this.navigator=new lt(e,{configurationService:d,...t}),this.disposables.push(this.navigator)}contextKeyService;listSupportsMultiSelect;listSupportFindWidget;hasSelectionOrFocus;hasDoubleSelection;hasMultiSelection;treeElementCanCollapse;treeElementHasParent;treeElementCanExpand;treeElementHasChild;treeFindOpen;treeStickyScrollFocused;_useAltAsMultipleSelectionModifier;disposables=[];navigator;get onDidOpen(){return this.navigator.onDidOpen}get useAltAsMultipleSelectionModifier(){return this._useAltAsMultipleSelectionModifier}updateOptions(e){e.multipleSelectionSupport!==void 0&&this.listSupportsMultiSelect.set(!!e.multipleSelectionSupport)}updateStyleOverrides(e){this.tree.style(e?P(e):W)}dispose(){this.disposables=Ue(this.disposables)}};w=O([h(4,x),h(5,L),h(6,I)],w);const ct=Qe.as(Ge.Configuration);ct.registerConfiguration({id:"workbench",order:7,title:S("workbenchConfigurationTitle","Workbench"),type:"object",properties:{[E]:{type:"string",enum:["ctrlCmd","alt"],markdownEnumDescriptions:[S("multiSelectModifier.ctrlCmd","Maps to `Control` on Windows and Linux and to `Command` on macOS."),S("multiSelectModifier.alt","Maps to `Alt` on Windows and Linux and to `Option` on macOS.")],default:"ctrlCmd",description:S({key:"multiSelectModifier",comment:["- `ctrlCmd` refers to a value the setting can take and should not be localized.","- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized."]},"The modifier to be used to add an item in trees and lists to a multi-selection with the mouse (for example in the explorer, open editors and scm view). The 'Open to Side' mouse gestures - if supported - will adapt such that they do not conflict with the multiselect modifier.")},[G]:{type:"string",enum:["singleClick","doubleClick"],default:"singleClick",description:S({key:"openModeModifier",comment:["`singleClick` and `doubleClick` refers to a value the setting can take and should not be localized."]},"Controls how to open items in trees and lists using the mouse (if supported). Note that some trees and lists might choose to ignore this setting if it is not applicable.")},[T]:{type:"boolean",default:!1,description:S("horizontalScrolling setting","Controls whether lists and trees support horizontal scrolling in the workbench. Warning: turning on this setting has a performance implication.")},[m]:{type:"boolean",default:!1,description:S("list.scrollByPage","Controls whether clicks in the scrollbar scroll page by page.")},[V]:{type:"number",default:8,minimum:4,maximum:40,description:S("tree indent setting","Controls tree indentation in pixels.")},[X]:{type:"string",enum:["none","onHover","always"],default:"onHover",description:S("render tree indent guides","Controls whether the tree should render indent guides.")},[C]:{type:"boolean",default:!1,description:S("list smoothScrolling setting","Controls whether lists and trees have smooth scrolling.")},[D]:{type:"number",default:1,markdownDescription:S("Mouse Wheel Scroll Sensitivity","A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events.")},[k]:{type:"number",default:5,markdownDescription:S("Fast Scroll Sensitivity","Scrolling speed multiplier when pressing `Alt`.")},[ue]:{type:"string",enum:["highlight","filter"],enumDescriptions:[S("defaultFindModeSettingKey.highlight","Highlight elements when searching. Further up and down navigation will traverse only the highlighted elements."),S("defaultFindModeSettingKey.filter","Filter elements when searching.")],default:"highlight",description:S("defaultFindModeSettingKey","Controls the default find mode for lists and trees in the workbench.")},[q]:{type:"string",enum:["simple","highlight","filter"],enumDescriptions:[S("keyboardNavigationSettingKey.simple","Simple keyboard navigation focuses elements which match the keyboard input. Matching is done only on prefixes."),S("keyboardNavigationSettingKey.highlight","Highlight keyboard navigation highlights elements which match the keyboard input. Further up and down navigation will traverse only the highlighted elements."),S("keyboardNavigationSettingKey.filter","Filter keyboard navigation will filter out and hide all the elements which do not match the keyboard input.")],default:"highlight",description:S("keyboardNavigationSettingKey","Controls the keyboard navigation style for lists and trees in the workbench. Can be simple, highlight and filter."),deprecated:!0,deprecationMessage:S("keyboardNavigationSettingKeyDeprecated","Please use 'workbench.list.defaultFindMode' and	'workbench.list.typeNavigationMode' instead.")},[he]:{type:"string",enum:["fuzzy","contiguous"],enumDescriptions:[S("defaultFindMatchTypeSettingKey.fuzzy","Use fuzzy matching when searching."),S("defaultFindMatchTypeSettingKey.contiguous","Use contiguous matching when searching.")],default:"fuzzy",description:S("defaultFindMatchTypeSettingKey","Controls the type of matching used when searching lists and trees in the workbench.")},[Y]:{type:"string",enum:["singleClick","doubleClick"],default:"singleClick",description:S("expand mode","Controls how tree folders are expanded when clicking the folder names. Note that some trees and lists might choose to ignore this setting if it is not applicable.")},[J]:{type:"boolean",default:!0,description:S("sticky scroll","Controls whether sticky scrolling is enabled in trees.")},[Q]:{type:"number",minimum:1,default:7,markdownDescription:S("sticky scroll maximum items","Controls the number of sticky elements displayed in the tree when {0} is enabled.","`#workbench.tree.enableStickyScroll#`")},[pe]:{type:"string",enum:["automatic","trigger"],default:"automatic",markdownDescription:S("typeNavigationMode2","Controls how type navigation works in lists and trees in the workbench. When set to `trigger`, type navigation begins once the `list.triggerTypeNavigation` command is run.")}}});export{L as IListService,Di as ListService,be as RawWorkbenchListFocusContextKey,N as RawWorkbenchListScrollAtBoundaryContextKey,se as WorkbenchAsyncDataTree,re as WorkbenchCompressibleAsyncDataTree,ne as WorkbenchCompressibleObjectTree,oe as WorkbenchDataTree,$ as WorkbenchList,ce as WorkbenchListDoubleSelection,Ki as WorkbenchListFocusContextKey,ae as WorkbenchListHasSelectionOrFocus,de as WorkbenchListMultiSelection,Mi as WorkbenchListScrollAtBottomContextKey,ki as WorkbenchListScrollAtTopContextKey,H as WorkbenchListSelectionNavigation,$e as WorkbenchListSupportsFind,_ as WorkbenchListSupportsMultiSelectContextKey,ie as WorkbenchObjectTree,ee as WorkbenchPagedList,te as WorkbenchTable,et as WorkbenchTreeElementCanCollapse,it as WorkbenchTreeElementCanExpand,nt as WorkbenchTreeElementHasChild,tt as WorkbenchTreeElementHasParent,ot as WorkbenchTreeFindOpen,ve as WorkbenchTreeStickyScrollFocused,Fi as getSelectionKeyboardEvent};
