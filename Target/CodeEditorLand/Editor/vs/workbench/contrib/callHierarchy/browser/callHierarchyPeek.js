var V=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var w=(h,a,e,t)=>{for(var i=t>1?void 0:t?E(a,e):a,o=h.length-1,l;o>=0;o--)(l=h[o])&&(i=(t?l(a,e,i):l(i))||i);return t&&i&&V(a,e,i),i},d=(h,a)=>(e,t)=>a(e,t,h);import"vs/css!./media/callHierarchy";import{Dimension as y,isKeyboardEvent as L}from"../../../../../vs/base/browser/dom.js";import{Orientation as H,Sizing as I,SplitView as k}from"../../../../../vs/base/browser/ui/splitview/splitview.js";import"../../../../../vs/base/browser/ui/tree/asyncDataTree.js";import{TreeMouseEventTarget as F}from"../../../../../vs/base/browser/ui/tree/tree.js";import"../../../../../vs/base/common/actions.js";import{Color as S}from"../../../../../vs/base/common/color.js";import{Event as C}from"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/filters.js";import{DisposableStore as A,toDisposable as R}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EmbeddedCodeEditorWidget as x}from"../../../../../vs/editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";import"../../../../../vs/editor/common/config/editorOptions.js";import"../../../../../vs/editor/common/core/position.js";import{Range as b}from"../../../../../vs/editor/common/core/range.js";import{ScrollType as T}from"../../../../../vs/editor/common/editorCommon.js";import{OverviewRulerLane as z,TrackedRangeStickiness as O}from"../../../../../vs/editor/common/model.js";import{ITextModelService as N}from"../../../../../vs/editor/common/services/resolverService.js";import*as c from"../../../../../vs/editor/contrib/peekView/browser/peekView.js";import{localize as _}from"../../../../../vs/nls.js";import{createAndFillInActionBarActions as P}from"../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{IMenuService as B,MenuId as W}from"../../../../../vs/platform/actions/common/actions.js";import{IContextKeyService as K}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as U}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{WorkbenchAsyncDataTree as Z}from"../../../../../vs/platform/list/browser/listService.js";import{IStorageService as J,StorageScope as M,StorageTarget as X}from"../../../../../vs/platform/storage/common/storage.js";import{IThemeService as j,themeColorFromId as G}from"../../../../../vs/platform/theme/common/themeService.js";import*as m from"../../../../../vs/workbench/contrib/callHierarchy/browser/callHierarchyTree.js";import{CallHierarchyDirection as g}from"../../../../../vs/workbench/contrib/callHierarchy/common/callHierarchy.js";import{IEditorService as q}from"../../../../../vs/workbench/services/editor/common/editorService.js";var Q=(t=>(t.Loading="loading",t.Message="message",t.Data="data",t))(Q||{});class D{constructor(a,e){this.ratio=a;this.height=e}static store(a,e){e.store("callHierarchyPeekLayout",JSON.stringify(a),M.PROFILE,X.MACHINE)}static retrieve(a){const e=a.get("callHierarchyPeekLayout",M.PROFILE,"{}"),t={ratio:.7,height:17};try{return{...t,...JSON.parse(e)}}catch{return t}}}class Y extends Z{}let u=class extends c.PeekViewWidget{constructor(e,t,i,o,l,n,p,r,s,f,v){super(e,{showFrame:!0,showArrow:!0,isResizeable:!0,isAccessible:!0},v);this._where=t;this._direction=i;this._peekViewService=l;this._editorService=n;this._textModelService=p;this._storageService=r;this._menuService=s;this._contextKeyService=f;this._instantiationService=v;this.create(),this._peekViewService.addExclusiveWidget(e,this),this._applyTheme(o.getColorTheme()),this._disposables.add(o.onDidColorThemeChange(this._applyTheme,this)),this._disposables.add(this._previewDisposable)}static TitleMenu=new W("callhierarchy/title");_parent;_message;_splitView;_tree;_treeViewStates=new Map;_editor;_dim;_layoutInfo;_previewDisposable=new A;dispose(){D.store(this._layoutInfo,this._storageService),this._splitView.dispose(),this._tree.dispose(),this._editor.dispose(),super.dispose()}get direction(){return this._direction}_applyTheme(e){const t=e.getColor(c.peekViewBorder)||S.transparent;this.style({arrowColor:t,frameColor:t,headerBackgroundColor:e.getColor(c.peekViewTitleBackground)||S.transparent,primaryHeadingColor:e.getColor(c.peekViewTitleForeground),secondaryHeadingColor:e.getColor(c.peekViewTitleInfoForeground)})}_fillHead(e){super._fillHead(e,!0);const t=this._menuService.createMenu(u.TitleMenu,this._contextKeyService),i=()=>{const o=[];P(t,void 0,o),this._actionbarWidget.clear(),this._actionbarWidget.push(o,{label:!1,icon:!0})};this._disposables.add(t),this._disposables.add(t.onDidChange(i)),i()}_fillBody(e){this._layoutInfo=D.retrieve(this._storageService),this._dim=new y(0,0),this._parent=e,e.classList.add("call-hierarchy");const t=document.createElement("div");t.classList.add("message"),e.appendChild(t),this._message=t,this._message.tabIndex=0;const i=document.createElement("div");i.classList.add("results"),e.appendChild(i),this._splitView=new k(i,{orientation:H.HORIZONTAL});const o=document.createElement("div");o.classList.add("editor"),i.appendChild(o);const l={scrollBeyondLastLine:!1,scrollbar:{verticalScrollbarSize:14,horizontal:"auto",useShadows:!0,verticalHasArrows:!1,horizontalHasArrows:!1,alwaysConsumeMouseWheel:!1},overviewRulerLanes:2,fixedOverflowWidgets:!0,minimap:{enabled:!1}};this._editor=this._instantiationService.createInstance(x,o,l,{},this.editor);const n=document.createElement("div");n.classList.add("tree"),i.appendChild(n);const p={sorter:new m.Sorter,accessibilityProvider:new m.AccessibilityProvider(()=>this._direction),identityProvider:new m.IdentityProvider(()=>this._direction),expandOnlyOnTwistieClick:!0,overrideStyles:{listBackground:c.peekViewResultsBackground}};this._tree=this._instantiationService.createInstance(Y,"CallHierarchyPeek",n,new m.VirtualDelegate,[this._instantiationService.createInstance(m.CallRenderer)],this._instantiationService.createInstance(m.DataSource,()=>this._direction),p),this._splitView.addView({onDidChange:C.None,element:o,minimumSize:200,maximumSize:Number.MAX_VALUE,layout:r=>{this._dim.height&&this._editor.layout({height:this._dim.height,width:r})}},I.Distribute),this._splitView.addView({onDidChange:C.None,element:n,minimumSize:100,maximumSize:Number.MAX_VALUE,layout:r=>{this._dim.height&&this._tree.layout(this._dim.height,r)}},I.Distribute),this._disposables.add(this._splitView.onDidSashChange(()=>{this._dim.width&&(this._layoutInfo.ratio=this._splitView.getViewSize(0)/this._dim.width)})),this._disposables.add(this._tree.onDidChangeFocus(this._updatePreview,this)),this._disposables.add(this._editor.onMouseDown(r=>{const{event:s,target:f}=r;if(s.detail!==2)return;const[v]=this._tree.getFocus();v&&(this.dispose(),this._editorService.openEditor({resource:v.item.uri,options:{selection:f.range}}))})),this._disposables.add(this._tree.onMouseDblClick(r=>{r.target!==F.Twistie&&r.element&&(this.dispose(),this._editorService.openEditor({resource:r.element.item.uri,options:{selection:r.element.item.selectionRange,pinned:!0}}))})),this._disposables.add(this._tree.onDidChangeSelection(r=>{const[s]=r.elements;s&&L(r.browserEvent)&&(this.dispose(),this._editorService.openEditor({resource:s.item.uri,options:{selection:s.item.selectionRange,pinned:!0}}))}))}async _updatePreview(){const[e]=this._tree.getFocus();if(!e)return;this._previewDisposable.clear();const t={description:"call-hierarchy-decoration",stickiness:O.NeverGrowsWhenTypingAtEdges,className:"call-decoration",overviewRuler:{color:G(c.peekViewEditorMatchHighlight),position:z.Center}};let i;this._direction===g.CallsFrom?i=e.parent?e.parent.item.uri:e.model.root.uri:i=e.item.uri;const o=await this._textModelService.createModelReference(i);this._editor.setModel(o.object.textEditorModel);const l=[];let n,p=e.locations;p||(p=[{uri:e.item.uri,range:e.item.selectionRange}]);for(const s of p)s.uri.toString()===i.toString()&&(l.push({range:s.range,options:t}),n=n?b.plusRange(s.range,n):s.range);if(n){this._editor.revealRangeInCenter(n,T.Immediate);const s=this._editor.createDecorationsCollection(l);this._previewDisposable.add(R(()=>s.clear()))}this._previewDisposable.add(o);const r=this._direction===g.CallsFrom?_("callFrom","Calls from '{0}'",e.model.root.name):_("callsTo","Callers of '{0}'",e.model.root.name);this.setTitle(r)}showLoading(){this._parent.dataset.state="loading",this.setTitle(_("title.loading","Loading...")),this._show()}showMessage(e){this._parent.dataset.state="message",this.setTitle(""),this.setMetaTitle(""),this._message.innerText=e,this._show(),this._message.focus()}async showModel(e){this._show();const t=this._treeViewStates.get(this._direction);await this._tree.setInput(e,t);const i=this._tree.getNode(e).children[0];await this._tree.expand(i.element),i.children.length===0?this.showMessage(this._direction===g.CallsFrom?_("empt.callsFrom","No calls from '{0}'",e.root.name):_("empt.callsTo","No callers of '{0}'",e.root.name)):(this._parent.dataset.state="data",(!t||this._tree.getFocus().length===0)&&this._tree.setFocus([i.children[0].element]),this._tree.domFocus(),this._updatePreview())}getModel(){return this._tree.getInput()}getFocused(){return this._tree.getFocus()[0]}async updateDirection(e){const t=this._tree.getInput();t&&e!==this._direction&&(this._treeViewStates.set(this._direction,this._tree.getViewState()),this._direction=e,await this.showModel(t))}_show(){this._isShowing||(this.editor.revealLineInCenterIfOutsideViewport(this._where.lineNumber,T.Smooth),super.show(b.fromPositions(this._where),this._layoutInfo.height))}_onWidth(e){this._dim&&this._doLayoutBody(this._dim.height,e)}_doLayoutBody(e,t){(this._dim.height!==e||this._dim.width!==t)&&(super._doLayoutBody(e,t),this._dim=new y(t,e),this._layoutInfo.height=this._viewZone?this._viewZone.heightInLines:this._layoutInfo.height,this._splitView.layout(t),this._splitView.resizeView(0,t*this._layoutInfo.ratio))}};u=w([d(3,j),d(4,c.IPeekViewService),d(5,q),d(6,N),d(7,J),d(8,B),d(9,K),d(10,U)],u);export{u as CallHierarchyTreePeekWidget};