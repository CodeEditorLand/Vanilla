import"../../../../../vs/base/browser/dnd.js";import"../../../../../vs/base/browser/ui/list/list.js";import{ElementsDragAndDropData as M}from"../../../../../vs/base/browser/ui/list/listView.js";import"../../../../../vs/base/browser/ui/list/listWidget.js";import{ComposedTreeDelegate as L}from"../../../../../vs/base/browser/ui/tree/abstractTree.js";import"../../../../../vs/base/browser/ui/tree/compressedObjectTreeModel.js";import{getVisibleState as R,isFilterResult as _}from"../../../../../vs/base/browser/ui/tree/indexTreeModel.js";import{CompressibleObjectTree as W,ObjectTree as K}from"../../../../../vs/base/browser/ui/tree/objectTree.js";import{ObjectTreeElementCollapseState as v,TreeError as b,TreeVisibility as y,WeakMapper as V}from"../../../../../vs/base/browser/ui/tree/tree.js";import{createCancelablePromise as B,Promises as q,timeout as G}from"../../../../../vs/base/common/async.js";import{Codicon as C}from"../../../../../vs/base/common/codicons.js";import{isCancellationError as z,onUnexpectedError as $}from"../../../../../vs/base/common/errors.js";import{Emitter as k,Event as h}from"../../../../../vs/base/common/event.js";import{Iterable as N}from"../../../../../vs/base/common/iterator.js";import{DisposableStore as J,dispose as Q}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/scrollable.js";import{ThemeIcon as A}from"../../../../../vs/base/common/themables.js";import{isIterable as j}from"../../../../../vs/base/common/types.js";function P(n){return{...n,children:[],refreshPromise:void 0,stale:!0,slow:!1,forceExpanded:!1}}function F(n,e){return e.parent?e.parent===n?!0:F(n,e.parent):!1}function X(n,e){return n===e||F(n,e)||F(e,n)}class w{constructor(e){this.node=e}get element(){return this.node.element.element}get children(){return this.node.children.map(e=>new w(e))}get depth(){return this.node.depth}get visibleChildrenCount(){return this.node.visibleChildrenCount}get visibleChildIndex(){return this.node.visibleChildIndex}get collapsible(){return this.node.collapsible}get collapsed(){return this.node.collapsed}get visible(){return this.node.visible}get filterData(){return this.node.filterData}}class Y{constructor(e,t,r){this.renderer=e;this.nodeMapper=t;this.onDidChangeTwistieState=r;this.templateId=e.templateId}templateId;renderedNodes=new Map;renderTemplate(e){return{templateData:this.renderer.renderTemplate(e)}}renderElement(e,t,r,a){this.renderer.renderElement(this.nodeMapper.map(e),t,r.templateData,a)}renderTwistie(e,t){return e.slow?(t.classList.add(...A.asClassNameArray(C.treeItemLoading)),!0):(t.classList.remove(...A.asClassNameArray(C.treeItemLoading)),!1)}disposeElement(e,t,r,a){this.renderer.disposeElement?.(this.nodeMapper.map(e),t,r.templateData,a)}disposeTemplate(e){this.renderer.disposeTemplate(e.templateData)}dispose(){this.renderedNodes.clear()}}function U(n){return{browserEvent:n.browserEvent,elements:n.elements.map(e=>e.element)}}function E(n){return{browserEvent:n.browserEvent,element:n.element&&n.element.element,target:n.target}}function Z(n){return{browserEvent:n.browserEvent,element:n.element&&n.element.element,anchor:n.anchor,isStickyScroll:n.isStickyScroll}}class ee extends M{constructor(t){super(t.elements.map(r=>r.element));this.data=t}set context(t){this.data.context=t}get context(){return this.data.context}}function S(n){return n instanceof M?new ee(n):n}class te{constructor(e){this.dnd=e}getDragURI(e){return this.dnd.getDragURI(e.element)}getDragLabel(e,t){if(this.dnd.getDragLabel)return this.dnd.getDragLabel(e.map(r=>r.element),t)}onDragStart(e,t){this.dnd.onDragStart?.(S(e),t)}onDragOver(e,t,r,a,s,i=!0){return this.dnd.onDragOver(S(e),t&&t.element,r,a,s)}drop(e,t,r,a,s){this.dnd.drop(S(e),t&&t.element,r,a,s)}onDragEnd(e){this.dnd.onDragEnd?.(e)}dispose(){this.dnd.dispose()}}function H(n){return n&&{...n,collapseByDefault:!0,identityProvider:n.identityProvider&&{getId(e){return n.identityProvider.getId(e.element)}},dnd:n.dnd&&new te(n.dnd),multipleSelectionController:n.multipleSelectionController&&{isSelectionSingleChangeEvent(e){return n.multipleSelectionController.isSelectionSingleChangeEvent({...e,element:e.element})},isSelectionRangeChangeEvent(e){return n.multipleSelectionController.isSelectionRangeChangeEvent({...e,element:e.element})}},accessibilityProvider:n.accessibilityProvider&&{...n.accessibilityProvider,getPosInSet:void 0,getSetSize:void 0,getRole:n.accessibilityProvider.getRole?e=>n.accessibilityProvider.getRole(e.element):()=>"treeitem",isChecked:n.accessibilityProvider.isChecked?e=>!!n.accessibilityProvider?.isChecked(e.element):void 0,getAriaLabel(e){return n.accessibilityProvider.getAriaLabel(e.element)},getWidgetAriaLabel(){return n.accessibilityProvider.getWidgetAriaLabel()},getWidgetRole:n.accessibilityProvider.getWidgetRole?()=>n.accessibilityProvider.getWidgetRole():()=>"tree",getAriaLevel:n.accessibilityProvider.getAriaLevel&&(e=>n.accessibilityProvider.getAriaLevel(e.element)),getActiveDescendantId:n.accessibilityProvider.getActiveDescendantId&&(e=>n.accessibilityProvider.getActiveDescendantId(e.element))},filter:n.filter&&{filter(e,t){return n.filter.filter(e.element,t)}},keyboardNavigationLabelProvider:n.keyboardNavigationLabelProvider&&{...n.keyboardNavigationLabelProvider,getKeyboardNavigationLabel(e){return n.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e.element)}},sorter:void 0,expandOnlyOnTwistieClick:typeof n.expandOnlyOnTwistieClick>"u"?void 0:typeof n.expandOnlyOnTwistieClick!="function"?n.expandOnlyOnTwistieClick:e=>n.expandOnlyOnTwistieClick(e.element),defaultFindVisibility:e=>e.hasChildren&&e.stale?y.Visible:typeof n.defaultFindVisibility=="number"?n.defaultFindVisibility:typeof n.defaultFindVisibility>"u"?y.Recurse:n.defaultFindVisibility(e.element)}}function O(n,e){e(n),n.children.forEach(t=>O(t,e))}class re{constructor(e,t,r,a,s,i={}){this.user=e;this.dataSource=s;this.identityProvider=i.identityProvider,this.autoExpandSingleChildren=typeof i.autoExpandSingleChildren>"u"?!1:i.autoExpandSingleChildren,this.sorter=i.sorter,this.getDefaultCollapseState=o=>i.collapseByDefault?i.collapseByDefault(o)?v.PreserveOrCollapsed:v.PreserveOrExpanded:void 0,this.tree=this.createTree(e,t,r,a,i),this.onDidChangeFindMode=this.tree.onDidChangeFindMode,this.onDidChangeFindMatchType=this.tree.onDidChangeFindMatchType,this.root=P({element:void 0,parent:null,hasChildren:!0,defaultCollapseState:void 0}),this.identityProvider&&(this.root={...this.root,id:null}),this.nodes.set(null,this.root),this.tree.onDidChangeCollapseState(this._onDidChangeCollapseState,this,this.disposables)}tree;root;nodes=new Map;sorter;getDefaultCollapseState;subTreeRefreshPromises=new Map;refreshPromises=new Map;identityProvider;autoExpandSingleChildren;_onDidRender=new k;_onDidChangeNodeSlowState=new k;nodeMapper=new V(e=>new w(e));disposables=new J;get onDidScroll(){return this.tree.onDidScroll}get onDidChangeFocus(){return h.map(this.tree.onDidChangeFocus,U)}get onDidChangeSelection(){return h.map(this.tree.onDidChangeSelection,U)}get onKeyDown(){return this.tree.onKeyDown}get onMouseClick(){return h.map(this.tree.onMouseClick,E)}get onMouseDblClick(){return h.map(this.tree.onMouseDblClick,E)}get onContextMenu(){return h.map(this.tree.onContextMenu,Z)}get onTap(){return h.map(this.tree.onTap,E)}get onPointer(){return h.map(this.tree.onPointer,E)}get onDidFocus(){return this.tree.onDidFocus}get onDidBlur(){return this.tree.onDidBlur}get onDidChangeModel(){return this.tree.onDidChangeModel}get onDidChangeCollapseState(){return this.tree.onDidChangeCollapseState}get onDidUpdateOptions(){return this.tree.onDidUpdateOptions}get onDidChangeFindOpenState(){return this.tree.onDidChangeFindOpenState}get onDidChangeStickyScrollFocused(){return this.tree.onDidChangeStickyScrollFocused}get findMode(){return this.tree.findMode}set findMode(e){this.tree.findMode=e}onDidChangeFindMode;get findMatchType(){return this.tree.findMatchType}set findMatchType(e){this.tree.findMatchType=e}onDidChangeFindMatchType;get expandOnlyOnTwistieClick(){if(typeof this.tree.expandOnlyOnTwistieClick=="boolean")return this.tree.expandOnlyOnTwistieClick;const e=this.tree.expandOnlyOnTwistieClick;return t=>e(this.nodes.get(t===this.root.element?null:t)||null)}get onDidDispose(){return this.tree.onDidDispose}createTree(e,t,r,a,s){const i=new L(r),o=a.map(p=>new Y(p,this.nodeMapper,this._onDidChangeNodeSlowState.event)),l=H(s)||{};return new K(e,t,i,o,l)}updateOptions(e={}){this.tree.updateOptions(e)}get options(){return this.tree.options}getHTMLElement(){return this.tree.getHTMLElement()}get contentHeight(){return this.tree.contentHeight}get contentWidth(){return this.tree.contentWidth}get onDidChangeContentHeight(){return this.tree.onDidChangeContentHeight}get onDidChangeContentWidth(){return this.tree.onDidChangeContentWidth}get scrollTop(){return this.tree.scrollTop}set scrollTop(e){this.tree.scrollTop=e}get scrollLeft(){return this.tree.scrollLeft}set scrollLeft(e){this.tree.scrollLeft=e}get scrollHeight(){return this.tree.scrollHeight}get renderHeight(){return this.tree.renderHeight}get lastVisibleElement(){return this.tree.lastVisibleElement.element}get ariaLabel(){return this.tree.ariaLabel}set ariaLabel(e){this.tree.ariaLabel=e}domFocus(){this.tree.domFocus()}layout(e,t){this.tree.layout(e,t)}style(e){this.tree.style(e)}getInput(){return this.root.element}async setInput(e,t){this.refreshPromises.forEach(a=>a.cancel()),this.refreshPromises.clear(),this.root.element=e;const r=t&&{viewState:t,focus:[],selection:[]};await this._updateChildren(e,!0,!1,r),r&&(this.tree.setFocus(r.focus),this.tree.setSelection(r.selection)),t&&typeof t.scrollTop=="number"&&(this.scrollTop=t.scrollTop)}async updateChildren(e=this.root.element,t=!0,r=!1,a){await this._updateChildren(e,t,r,void 0,a)}async _updateChildren(e=this.root.element,t=!0,r=!1,a,s){if(typeof this.root.element>"u")throw new b(this.user,"Tree input not set");this.root.refreshPromise&&(await this.root.refreshPromise,await h.toPromise(this._onDidRender.event));const i=this.getDataNode(e);if(await this.refreshAndRenderNode(i,t,a,s),r)try{this.tree.rerender(i)}catch{}}resort(e=this.root.element,t=!0){this.tree.resort(this.getDataNode(e),t)}hasNode(e){return e===this.root.element||this.nodes.has(e)}rerender(e){if(e===void 0||e===this.root.element){this.tree.rerender();return}const t=this.getDataNode(e);this.tree.rerender(t)}updateElementHeight(e,t){const r=this.getDataNode(e);this.tree.updateElementHeight(r,t)}updateWidth(e){const t=this.getDataNode(e);this.tree.updateWidth(t)}getNode(e=this.root.element){const t=this.getDataNode(e),r=this.tree.getNode(t===this.root?null:t);return this.nodeMapper.map(r)}collapse(e,t=!1){const r=this.getDataNode(e);return this.tree.collapse(r===this.root?null:r,t)}async expand(e,t=!1){if(typeof this.root.element>"u")throw new b(this.user,"Tree input not set");this.root.refreshPromise&&(await this.root.refreshPromise,await h.toPromise(this._onDidRender.event));const r=this.getDataNode(e);if(this.tree.hasElement(r)&&!this.tree.isCollapsible(r)||(r.refreshPromise&&(await this.root.refreshPromise,await h.toPromise(this._onDidRender.event)),r!==this.root&&!r.refreshPromise&&!this.tree.isCollapsed(r)))return!1;const a=this.tree.expand(r===this.root?null:r,t);return r.refreshPromise&&(await this.root.refreshPromise,await h.toPromise(this._onDidRender.event)),a}toggleCollapsed(e,t=!1){return this.tree.toggleCollapsed(this.getDataNode(e),t)}expandAll(){this.tree.expandAll()}async expandTo(e){if(!this.dataSource.getParent)throw new Error("Can't expand to element without getParent method");const t=[];for(;!this.hasNode(e);)e=this.dataSource.getParent(e),e!==this.root.element&&t.push(e);for(const r of N.reverse(t))await this.expand(r);this.tree.expandTo(this.getDataNode(e))}collapseAll(){this.tree.collapseAll()}isCollapsible(e){return this.tree.isCollapsible(this.getDataNode(e))}isCollapsed(e){return this.tree.isCollapsed(this.getDataNode(e))}triggerTypeNavigation(){this.tree.triggerTypeNavigation()}openFind(){this.tree.openFind()}closeFind(){this.tree.closeFind()}refilter(){this.tree.refilter()}setAnchor(e){this.tree.setAnchor(typeof e>"u"?void 0:this.getDataNode(e))}getAnchor(){return this.tree.getAnchor()?.element}setSelection(e,t){const r=e.map(a=>this.getDataNode(a));this.tree.setSelection(r,t)}getSelection(){return this.tree.getSelection().map(t=>t.element)}setFocus(e,t){const r=e.map(a=>this.getDataNode(a));this.tree.setFocus(r,t)}focusNext(e=1,t=!1,r){this.tree.focusNext(e,t,r)}focusPrevious(e=1,t=!1,r){this.tree.focusPrevious(e,t,r)}focusNextPage(e){return this.tree.focusNextPage(e)}focusPreviousPage(e){return this.tree.focusPreviousPage(e)}focusLast(e){this.tree.focusLast(e)}focusFirst(e){this.tree.focusFirst(e)}getFocus(){return this.tree.getFocus().map(t=>t.element)}getStickyScrollFocus(){return this.tree.getStickyScrollFocus().map(t=>t.element)}getFocusedPart(){return this.tree.getFocusedPart()}reveal(e,t){this.tree.reveal(this.getDataNode(e),t)}getRelativeTop(e){return this.tree.getRelativeTop(this.getDataNode(e))}getParentElement(e){const t=this.tree.getParentElement(this.getDataNode(e));return t&&t.element}getFirstElementChild(e=this.root.element){const t=this.getDataNode(e),r=this.tree.getFirstElementChild(t===this.root?null:t);return r&&r.element}getDataNode(e){const t=this.nodes.get(e===this.root.element?null:e);if(!t)throw new b(this.user,`Data tree node not found: ${e}`);return t}async refreshAndRenderNode(e,t,r,a){await this.refreshNode(e,t,r),!this.disposables.isDisposed&&this.render(e,r,a)}async refreshNode(e,t,r){let a;if(this.subTreeRefreshPromises.forEach((s,i)=>{!a&&X(i,e)&&(a=s.then(()=>this.refreshNode(e,t,r)))}),a)return a;if(e!==this.root&&this.tree.getNode(e).collapsed){e.hasChildren=!!this.dataSource.hasChildren(e.element),e.stale=!0,this.setChildren(e,[],t,r);return}return this.doRefreshSubTree(e,t,r)}async doRefreshSubTree(e,t,r){let a;e.refreshPromise=new Promise(s=>a=s),this.subTreeRefreshPromises.set(e,e.refreshPromise),e.refreshPromise.finally(()=>{e.refreshPromise=void 0,this.subTreeRefreshPromises.delete(e)});try{const s=await this.doRefreshNode(e,t,r);e.stale=!1,await q.settled(s.map(i=>this.doRefreshSubTree(i,t,r)))}finally{a()}}async doRefreshNode(e,t,r){e.hasChildren=!!this.dataSource.hasChildren(e.element);let a;if(!e.hasChildren)a=Promise.resolve(N.empty());else{const s=this.doGetChildren(e);if(j(s))a=Promise.resolve(s);else{const i=G(800);i.then(()=>{e.slow=!0,this._onDidChangeNodeSlowState.fire(e)},o=>null),a=s.finally(()=>i.cancel())}}try{const s=await a;return this.setChildren(e,s,t,r)}catch(s){if(e!==this.root&&this.tree.hasElement(e)&&this.tree.collapse(e),z(s))return[];throw s}finally{e.slow&&(e.slow=!1,this._onDidChangeNodeSlowState.fire(e))}}doGetChildren(e){let t=this.refreshPromises.get(e);if(t)return t;const r=this.dataSource.getChildren(e.element);return j(r)?this.processChildren(r):(t=B(async()=>this.processChildren(await r)),this.refreshPromises.set(e,t),t.finally(()=>{this.refreshPromises.delete(e)}))}_onDidChangeCollapseState({node:e,deep:t}){e.element!==null&&!e.collapsed&&e.element.stale&&(t?this.collapse(e.element.element):this.refreshAndRenderNode(e.element,!1).catch($))}setChildren(e,t,r,a){const s=[...t];if(e.children.length===0&&s.length===0)return[];const i=new Map,o=new Map;for(const d of e.children)i.set(d.element,d),this.identityProvider&&o.set(d.id,{node:d,collapsed:this.tree.hasElement(d)&&this.tree.isCollapsed(d)});const l=[],p=s.map(d=>{const u=!!this.dataSource.hasChildren(d);if(!this.identityProvider){const T=P({element:d,parent:e,hasChildren:u,defaultCollapseState:this.getDefaultCollapseState(d)});return u&&T.defaultCollapseState===v.PreserveOrExpanded&&l.push(T),T}const I=this.identityProvider.getId(d).toString(),D=o.get(I);if(D){const T=D.node;return i.delete(T.element),this.nodes.delete(T.element),this.nodes.set(d,T),T.element=d,T.hasChildren=u,r?D.collapsed?(T.children.forEach(m=>O(m,f=>this.nodes.delete(f.element))),T.children.splice(0,T.children.length),T.stale=!0):l.push(T):u&&!D.collapsed&&l.push(T),T}const c=P({element:d,parent:e,id:I,hasChildren:u,defaultCollapseState:this.getDefaultCollapseState(d)});return a&&a.viewState.focus&&a.viewState.focus.indexOf(I)>-1&&a.focus.push(c),a&&a.viewState.selection&&a.viewState.selection.indexOf(I)>-1&&a.selection.push(c),(a&&a.viewState.expanded&&a.viewState.expanded.indexOf(I)>-1||u&&c.defaultCollapseState===v.PreserveOrExpanded)&&l.push(c),c});for(const d of i.values())O(d,u=>this.nodes.delete(u.element));for(const d of p)this.nodes.set(d.element,d);return e.children.splice(0,e.children.length,...p),e!==this.root&&this.autoExpandSingleChildren&&p.length===1&&l.length===0&&(p[0].forceExpanded=!0,l.push(p[0])),l}render(e,t,r){const a=e.children.map(i=>this.asTreeElement(i,t)),s=r&&{...r,diffIdentityProvider:r.diffIdentityProvider&&{getId(i){return r.diffIdentityProvider.getId(i.element)}}};this.tree.setChildren(e===this.root?null:e,a,s),e!==this.root&&this.tree.setCollapsible(e,e.hasChildren),this._onDidRender.fire()}asTreeElement(e,t){if(e.stale)return{element:e,collapsible:e.hasChildren,collapsed:!0};let r;return t&&t.viewState.expanded&&e.id&&t.viewState.expanded.indexOf(e.id)>-1?r=!1:e.forceExpanded?(r=!1,e.forceExpanded=!1):r=e.defaultCollapseState,{element:e,children:e.hasChildren?N.map(e.children,a=>this.asTreeElement(a,t)):[],collapsible:e.hasChildren,collapsed:r}}processChildren(e){return this.sorter&&(e=[...e].sort(this.sorter.compare.bind(this.sorter))),e}getViewState(){if(!this.identityProvider)throw new b(this.user,"Can't get tree view state without an identity provider");const e=o=>this.identityProvider.getId(o).toString(),t=this.getFocus().map(e),r=this.getSelection().map(e),a=[],s=this.tree.getNode(),i=[s];for(;i.length>0;){const o=i.pop();o!==s&&o.collapsible&&!o.collapsed&&a.push(e(o.element.element)),i.push(...o.children)}return{focus:t,selection:r,expanded:a,scrollTop:this.scrollTop}}dispose(){this.disposables.dispose(),this.tree.dispose()}}class x{constructor(e){this.node=e}get element(){return{elements:this.node.element.elements.map(e=>e.element),incompressible:this.node.element.incompressible}}get children(){return this.node.children.map(e=>new x(e))}get depth(){return this.node.depth}get visibleChildrenCount(){return this.node.visibleChildrenCount}get visibleChildIndex(){return this.node.visibleChildIndex}get collapsible(){return this.node.collapsible}get collapsed(){return this.node.collapsed}get visible(){return this.node.visible}get filterData(){return this.node.filterData}}class ne{constructor(e,t,r,a){this.renderer=e;this.nodeMapper=t;this.compressibleNodeMapperProvider=r;this.onDidChangeTwistieState=a;this.templateId=e.templateId}templateId;renderedNodes=new Map;disposables=[];renderTemplate(e){return{templateData:this.renderer.renderTemplate(e)}}renderElement(e,t,r,a){this.renderer.renderElement(this.nodeMapper.map(e),t,r.templateData,a)}renderCompressedElements(e,t,r,a){this.renderer.renderCompressedElements(this.compressibleNodeMapperProvider().map(e),t,r.templateData,a)}renderTwistie(e,t){return e.slow?(t.classList.add(...A.asClassNameArray(C.treeItemLoading)),!0):(t.classList.remove(...A.asClassNameArray(C.treeItemLoading)),!1)}disposeElement(e,t,r,a){this.renderer.disposeElement?.(this.nodeMapper.map(e),t,r.templateData,a)}disposeCompressedElements(e,t,r,a){this.renderer.disposeCompressedElements?.(this.compressibleNodeMapperProvider().map(e),t,r.templateData,a)}disposeTemplate(e){this.renderer.disposeTemplate(e.templateData)}dispose(){this.renderedNodes.clear(),this.disposables=Q(this.disposables)}}function ae(n){const e=n&&H(n);return e&&{...e,keyboardNavigationLabelProvider:e.keyboardNavigationLabelProvider&&{...e.keyboardNavigationLabelProvider,getCompressedNodeKeyboardNavigationLabel(t){return n.keyboardNavigationLabelProvider.getCompressedNodeKeyboardNavigationLabel(t.map(r=>r.element))}}}}class at extends re{constructor(t,r,a,s,i,o,l={}){super(t,r,a,i,o,l);this.compressionDelegate=s;this.filter=l.filter}compressibleNodeMapper=new V(t=>new x(t));filter;createTree(t,r,a,s,i){const o=new L(a),l=s.map(d=>new ne(d,this.nodeMapper,()=>this.compressibleNodeMapper,this._onDidChangeNodeSlowState.event)),p=ae(i)||{};return new W(t,r,o,l,p)}asTreeElement(t,r){return{incompressible:this.compressionDelegate.isIncompressible(t.element),...super.asTreeElement(t,r)}}updateOptions(t={}){this.tree.updateOptions(t)}getViewState(){if(!this.identityProvider)throw new b(this.user,"Can't get tree view state without an identity provider");const t=l=>this.identityProvider.getId(l).toString(),r=this.getFocus().map(t),a=this.getSelection().map(t),s=[],i=this.tree.getCompressedTreeNode(),o=[i];for(;o.length>0;){const l=o.pop();if(l!==i&&l.collapsible&&!l.collapsed)for(const p of l.element.elements)s.push(t(p.element));o.push(...l.children)}return{focus:r,selection:a,expanded:s,scrollTop:this.scrollTop}}render(t,r,a){if(!this.identityProvider)return super.render(t,r);const s=c=>this.identityProvider.getId(c).toString(),i=c=>{const T=new Set;for(const m of c){const f=this.tree.getCompressedTreeNode(m===this.root?null:m);if(f.element)for(const g of f.element.elements)T.add(s(g.element))}return T},o=i(this.tree.getSelection()),l=i(this.tree.getFocus());super.render(t,r,a);const p=this.getSelection();let d=!1;const u=this.getFocus();let I=!1;const D=c=>{const T=c.element;if(T)for(let m=0;m<T.elements.length;m++){const f=s(T.elements[m].element),g=T.elements[T.elements.length-1].element;o.has(f)&&p.indexOf(g)===-1&&(p.push(g),d=!0),l.has(f)&&u.indexOf(g)===-1&&(u.push(g),I=!0)}c.children.forEach(D)};D(this.tree.getCompressedTreeNode(t===this.root?null:t)),d&&this.setSelection(p),I&&this.setFocus(u)}processChildren(t){return this.filter&&(t=N.filter(t,r=>{const a=this.filter.filter(r,y.Visible),s=se(a);if(s===y.Recurse)throw new Error("Recursive tree visibility not supported in async data compressed trees");return s===y.Visible})),super.processChildren(t)}}function se(n){return typeof n=="boolean"?n?y.Visible:y.Hidden:_(n)?R(n.visibility):R(n)}export{re as AsyncDataTree,at as CompressibleAsyncDataTree};