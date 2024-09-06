var V=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var I=(m,a,e,o)=>{for(var n=o>1?void 0:o?E(a,e):a,l=m.length-1,p;l>=0;l--)(p=m[l])&&(n=(o?p(a,e,n):p(n))||n);return o&&n&&V(a,e,n),n},s=(m,a)=>(e,o)=>a(e,o,m);import"vs/css!./outlinePane";import*as v from"../../../../../vs/base/browser/dom.js";import{ProgressBar as x}from"../../../../../vs/base/browser/ui/progressbar/progressbar.js";import{AbstractTreeViewState as B,TreeFindMode as h}from"../../../../../vs/base/browser/ui/tree/abstractTree.js";import"../../../../../vs/base/browser/ui/tree/tree.js";import{timeout as M,TimeoutTimer as F}from"../../../../../vs/base/common/async.js";import{CancellationTokenSource as P}from"../../../../../vs/base/common/cancellation.js";import{Event as L}from"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/filters.js";import{DisposableStore as y,MutableDisposable as A,toDisposable as D}from"../../../../../vs/base/common/lifecycle.js";import{LRUCache as k}from"../../../../../vs/base/common/map.js";import{basename as O}from"../../../../../vs/base/common/resources.js";import"../../../../../vs/base/common/uri.js";import{localize as w}from"../../../../../vs/nls.js";import{IConfigurationService as H}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as N}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as z}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as K}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as R}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as $}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{WorkbenchDataTree as U}from"../../../../../vs/platform/list/browser/listService.js";import{IOpenerService as W}from"../../../../../vs/platform/opener/common/opener.js";import{IStorageService as q}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as j}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{defaultProgressBarStyles as G}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{IThemeService as J}from"../../../../../vs/platform/theme/common/themeService.js";import{ViewPane as Q}from"../../../../../vs/workbench/browser/parts/views/viewPane.js";import"../../../../../vs/workbench/browser/parts/views/viewsViewlet.js";import{EditorResourceAccessor as X}from"../../../../../vs/workbench/common/editor.js";import{IViewDescriptorService as Y}from"../../../../../vs/workbench/common/views.js";import{ctxAllCollapsed as Z,ctxFilterOnType as ee,ctxFollowsCursor as te,ctxSortMode as ie,OutlineSortOrder as T}from"../../../../../vs/workbench/contrib/outline/browser/outline.js";import{IEditorService as oe}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IOutlineService as re,OutlineTarget as se}from"../../../../../vs/workbench/services/outline/browser/outline.js";import{OutlineViewState as ne}from"./outlineViewState.js";class ae{constructor(a,e){this._comparator=a;this.order=e}compare(a,e){return this.order===T.ByKind?this._comparator.compareByType(a,e):this.order===T.ByName?this._comparator.compareByName(a,e):this._comparator.compareByPosition(a,e)}}let C=class extends Q{constructor(e,o,n,l,p,r,S,i,d,g,_,c,f,t){super(e,i,g,S,d,l,n,_,c,f,t);this._outlineService=o;this._instantiationService=n;this._storageService=p;this._editorService=r;this._outlineViewState.restore(this._storageService),this._disposables.add(this._outlineViewState),d.bufferChangeEvents(()=>{this._ctxFollowsCursor=te.bindTo(d),this._ctxFilterOnType=ee.bindTo(d),this._ctxSortMode=ie.bindTo(d),this._ctxAllCollapsed=Z.bindTo(d)});const u=()=>{this._ctxFollowsCursor.set(this._outlineViewState.followCursor),this._ctxFilterOnType.set(this._outlineViewState.filterOnType),this._ctxSortMode.set(this._outlineViewState.sortBy)};u(),this._disposables.add(this._outlineViewState.onDidChange(u))}static Id="outline";_disposables=new y;_editorControlDisposables=new y;_editorPaneDisposables=new y;_outlineViewState=new ne;_editorListener=new A;_domNode;_message;_progressBar;_treeContainer;_tree;_treeDimensions;_treeStates=new k(10);_ctxFollowsCursor;_ctxFilterOnType;_ctxSortMode;_ctxAllCollapsed;dispose(){this._disposables.dispose(),this._editorPaneDisposables.dispose(),this._editorControlDisposables.dispose(),this._editorListener.dispose(),super.dispose()}focus(){super.focus(),this._tree?.domFocus()}renderBody(e){super.renderBody(e),this._domNode=e,e.classList.add("outline-pane");const o=v.$(".outline-progress");this._message=v.$(".outline-message"),this._progressBar=new x(o,G),this._treeContainer=v.$(".outline-tree"),v.append(e,o,this._message,this._treeContainer),this._disposables.add(this.onDidChangeBodyVisibility(n=>{if(!n)this._editorListener.clear(),this._editorPaneDisposables.clear(),this._editorControlDisposables.clear();else if(!this._editorListener.value){const l=L.any(this._editorService.onDidActiveEditorChange,this._outlineService.onDidChange);this._editorListener.value=l(()=>this._handleEditorChanged(this._editorService.activeEditorPane)),this._handleEditorChanged(this._editorService.activeEditorPane)}}))}layoutBody(e,o){super.layoutBody(e,o),this._tree?.layout(e,o),this._treeDimensions=new v.Dimension(o,e)}collapseAll(){this._tree?.collapseAll()}expandAll(){this._tree?.expandAll()}get outlineViewState(){return this._outlineViewState}_showMessage(e){this._domNode.classList.add("message"),this._progressBar.stop().hide(),this._message.innerText=e}_captureViewState(e){if(this._tree){const o=this._tree.getInput();if(e||(e=o?.uri),o&&e)return this._treeStates.set(`${o.outlineKind}/${e}`,this._tree.getViewState()),!0}return!1}_handleEditorChanged(e){this._editorPaneDisposables.clear(),e&&this._editorPaneDisposables.add(e.onDidChangeControl(()=>{this._handleEditorControlChanged(e)})),this._handleEditorControlChanged(e)}async _handleEditorControlChanged(e){const o=X.getOriginalUri(e?.input),n=this._captureViewState();if(this._editorControlDisposables.clear(),!e||!this._outlineService.canCreateOutline(e)||!o)return this._showMessage(w("no-editor","The active editor cannot provide outline information."));let l;n||(l=new F(()=>{this._showMessage(w("loading","Loading document symbols for '{0}'...",O(o)))},100)),this._progressBar.infinite().show(500);const p=new P;this._editorControlDisposables.add(D(()=>p.dispose(!0)));const r=await this._outlineService.createOutline(e,se.OutlinePane,p.token);if(l?.dispose(),!r)return;if(p.token.isCancellationRequested){r?.dispose();return}this._editorControlDisposables.add(r),this._progressBar.stop().hide();const S=new ae(r.config.comparator,this._outlineViewState.sortBy),i=this._instantiationService.createInstance(U,"OutlinePane",this._treeContainer,r.config.delegate,r.config.renderers,r.config.treeDataSource,{...r.config.options,sorter:S,expandOnDoubleClick:!1,expandOnlyOnTwistieClick:!0,multipleSelectionSupport:!1,hideTwistiesOfChildlessElements:!0,defaultFindMode:this._outlineViewState.filterOnType?h.Filter:h.Highlight,overrideStyles:this.getLocationBasedColors().listOverrideStyles}),d=()=>{if(r.isEmpty)this._showMessage(w("no-symbols","No symbols found in document '{0}'",O(o))),this._captureViewState(o),i.setInput(void 0);else if(i.getInput())this._domNode.classList.remove("message"),i.updateChildren();else{this._domNode.classList.remove("message");const t=this._treeStates.get(`${r.outlineKind}/${r.uri}`);i.setInput(r,t&&B.lift(t))}};d(),this._editorControlDisposables.add(r.onDidChange(d)),i.findMode=this._outlineViewState.filterOnType?h.Filter:h.Highlight,this._editorControlDisposables.add(this.viewDescriptorService.onDidChangeLocation(({views:t})=>{t.some(u=>u.id===this.id)&&i.updateOptions({overrideStyles:this.getLocationBasedColors().listOverrideStyles})})),this._editorControlDisposables.add(i.onDidChangeFindMode(t=>this._outlineViewState.filterOnType=t===h.Filter));let g=0;this._editorControlDisposables.add(i.onDidOpen(async t=>{const u=++g,b=t.browserEvent?.type==="dblclick";!b&&(await M(150),u!==g)||await r.reveal(t.element,t.editorOptions,t.sideBySide,b)}));const _=()=>{if(!this._outlineViewState.followCursor||!r.activeElement)return;let t=r.activeElement;for(;t;){if(i.getRelativeTop(t)===null&&i.reveal(t,.5),i.getRelativeTop(t)!==null){i.setFocus([t]),i.setSelection([t]);break}t=i.getParentElement(t)}};_(),this._editorControlDisposables.add(r.onDidChange(_)),this._editorControlDisposables.add(this._outlineViewState.onDidChange(t=>{this._outlineViewState.persist(this._storageService),t.filterOnType&&(i.findMode=this._outlineViewState.filterOnType?h.Filter:h.Highlight),t.followCursor&&_(),t.sortBy&&(S.order=this._outlineViewState.sortBy,i.resort())}));let c;this._editorControlDisposables.add(i.onDidChangeFindPattern(t=>{i.findMode!==h.Highlight&&(!c&&t?(c=i.getViewState(),i.expandAll()):!t&&c&&(i.setInput(i.getInput(),c),c=void 0))}));const f=()=>{this._ctxAllCollapsed.set(i.getNode(null).children.every(t=>!t.collapsible||t.collapsed))};this._editorControlDisposables.add(i.onDidChangeCollapseState(f)),this._editorControlDisposables.add(i.onDidChangeModel(f)),f(),i.layout(this._treeDimensions?.height,this._treeDimensions?.width),this._tree=i,this._editorControlDisposables.add(D(()=>{i.dispose(),this._tree=void 0}))}};C=I([s(1,re),s(2,R),s(3,Y),s(4,q),s(5,oe),s(6,H),s(7,$),s(8,N),s(9,z),s(10,W),s(11,J),s(12,j),s(13,K)],C);export{C as OutlinePane};
