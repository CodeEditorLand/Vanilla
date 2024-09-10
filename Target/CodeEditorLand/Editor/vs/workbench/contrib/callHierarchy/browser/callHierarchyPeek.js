var V=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var w=(h,a,e,t)=>{for(var i=t>1?void 0:t?E(a,e):a,o=h.length-1,l;o>=0;o--)(l=h[o])&&(i=(t?l(a,e,i):l(i))||i);return t&&i&&V(a,e,i),i},d=(h,a)=>(e,t)=>a(e,t,h);import"./media/callHierarchy.css";import*as c from"../../../../editor/contrib/peekView/browser/peekView.js";import{IInstantiationService as L}from"../../../../platform/instantiation/common/instantiation.js";import{CallHierarchyDirection as g}from"../common/callHierarchy.js";import{WorkbenchAsyncDataTree as H}from"../../../../platform/list/browser/listService.js";import*as m from"./callHierarchyTree.js";import{localize as _}from"../../../../nls.js";import{ScrollType as y}from"../../../../editor/common/editorCommon.js";import{Range as I}from"../../../../editor/common/core/range.js";import{SplitView as k,Orientation as F,Sizing as S}from"../../../../base/browser/ui/splitview/splitview.js";import{Dimension as C,isKeyboardEvent as A}from"../../../../base/browser/dom.js";import{Event as b}from"../../../../base/common/event.js";import{IEditorService as R}from"../../../services/editor/common/editorService.js";import{EmbeddedCodeEditorWidget as x}from"../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";import{ITextModelService as z}from"../../../../editor/common/services/resolverService.js";import{toDisposable as O,DisposableStore as N}from"../../../../base/common/lifecycle.js";import{TrackedRangeStickiness as P,OverviewRulerLane as B}from"../../../../editor/common/model.js";import{themeColorFromId as W,IThemeService as K}from"../../../../platform/theme/common/themeService.js";import{IStorageService as U,StorageScope as T,StorageTarget as Z}from"../../../../platform/storage/common/storage.js";import{Color as M}from"../../../../base/common/color.js";import{TreeMouseEventTarget as J}from"../../../../base/browser/ui/tree/tree.js";import{MenuId as X,IMenuService as j}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as G}from"../../../../platform/contextkey/common/contextkey.js";import{createAndFillInActionBarActions as q}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";var Q=(t=>(t.Loading="loading",t.Message="message",t.Data="data",t))(Q||{});class D{constructor(a,e){this.ratio=a;this.height=e}static store(a,e){e.store("callHierarchyPeekLayout",JSON.stringify(a),T.PROFILE,Z.MACHINE)}static retrieve(a){const e=a.get("callHierarchyPeekLayout",T.PROFILE,"{}"),t={ratio:.7,height:17};try{return{...t,...JSON.parse(e)}}catch{return t}}}class Y extends H{}let u=class extends c.PeekViewWidget{constructor(e,t,i,o,l,n,p,r,s,f,v){super(e,{showFrame:!0,showArrow:!0,isResizeable:!0,isAccessible:!0},v);this._where=t;this._direction=i;this._peekViewService=l;this._editorService=n;this._textModelService=p;this._storageService=r;this._menuService=s;this._contextKeyService=f;this._instantiationService=v;this.create(),this._peekViewService.addExclusiveWidget(e,this),this._applyTheme(o.getColorTheme()),this._disposables.add(o.onDidColorThemeChange(this._applyTheme,this)),this._disposables.add(this._previewDisposable)}static TitleMenu=new X("callhierarchy/title");_parent;_message;_splitView;_tree;_treeViewStates=new Map;_editor;_dim;_layoutInfo;_previewDisposable=new N;dispose(){D.store(this._layoutInfo,this._storageService),this._splitView.dispose(),this._tree.dispose(),this._editor.dispose(),super.dispose()}get direction(){return this._direction}_applyTheme(e){const t=e.getColor(c.peekViewBorder)||M.transparent;this.style({arrowColor:t,frameColor:t,headerBackgroundColor:e.getColor(c.peekViewTitleBackground)||M.transparent,primaryHeadingColor:e.getColor(c.peekViewTitleForeground),secondaryHeadingColor:e.getColor(c.peekViewTitleInfoForeground)})}_fillHead(e){super._fillHead(e,!0);const t=this._menuService.createMenu(u.TitleMenu,this._contextKeyService),i=()=>{const o=[];q(t,void 0,o),this._actionbarWidget.clear(),this._actionbarWidget.push(o,{label:!1,icon:!0})};this._disposables.add(t),this._disposables.add(t.onDidChange(i)),i()}_fillBody(e){this._layoutInfo=D.retrieve(this._storageService),this._dim=new C(0,0),this._parent=e,e.classList.add("call-hierarchy");const t=document.createElement("div");t.classList.add("message"),e.appendChild(t),this._message=t,this._message.tabIndex=0;const i=document.createElement("div");i.classList.add("results"),e.appendChild(i),this._splitView=new k(i,{orientation:F.HORIZONTAL});const o=document.createElement("div");o.classList.add("editor"),i.appendChild(o);const l={scrollBeyondLastLine:!1,scrollbar:{verticalScrollbarSize:14,horizontal:"auto",useShadows:!0,verticalHasArrows:!1,horizontalHasArrows:!1,alwaysConsumeMouseWheel:!1},overviewRulerLanes:2,fixedOverflowWidgets:!0,minimap:{enabled:!1}};this._editor=this._instantiationService.createInstance(x,o,l,{},this.editor);const n=document.createElement("div");n.classList.add("tree"),i.appendChild(n);const p={sorter:new m.Sorter,accessibilityProvider:new m.AccessibilityProvider(()=>this._direction),identityProvider:new m.IdentityProvider(()=>this._direction),expandOnlyOnTwistieClick:!0,overrideStyles:{listBackground:c.peekViewResultsBackground}};this._tree=this._instantiationService.createInstance(Y,"CallHierarchyPeek",n,new m.VirtualDelegate,[this._instantiationService.createInstance(m.CallRenderer)],this._instantiationService.createInstance(m.DataSource,()=>this._direction),p),this._splitView.addView({onDidChange:b.None,element:o,minimumSize:200,maximumSize:Number.MAX_VALUE,layout:r=>{this._dim.height&&this._editor.layout({height:this._dim.height,width:r})}},S.Distribute),this._splitView.addView({onDidChange:b.None,element:n,minimumSize:100,maximumSize:Number.MAX_VALUE,layout:r=>{this._dim.height&&this._tree.layout(this._dim.height,r)}},S.Distribute),this._disposables.add(this._splitView.onDidSashChange(()=>{this._dim.width&&(this._layoutInfo.ratio=this._splitView.getViewSize(0)/this._dim.width)})),this._disposables.add(this._tree.onDidChangeFocus(this._updatePreview,this)),this._disposables.add(this._editor.onMouseDown(r=>{const{event:s,target:f}=r;if(s.detail!==2)return;const[v]=this._tree.getFocus();v&&(this.dispose(),this._editorService.openEditor({resource:v.item.uri,options:{selection:f.range}}))})),this._disposables.add(this._tree.onMouseDblClick(r=>{r.target!==J.Twistie&&r.element&&(this.dispose(),this._editorService.openEditor({resource:r.element.item.uri,options:{selection:r.element.item.selectionRange,pinned:!0}}))})),this._disposables.add(this._tree.onDidChangeSelection(r=>{const[s]=r.elements;s&&A(r.browserEvent)&&(this.dispose(),this._editorService.openEditor({resource:s.item.uri,options:{selection:s.item.selectionRange,pinned:!0}}))}))}async _updatePreview(){const[e]=this._tree.getFocus();if(!e)return;this._previewDisposable.clear();const t={description:"call-hierarchy-decoration",stickiness:P.NeverGrowsWhenTypingAtEdges,className:"call-decoration",overviewRuler:{color:W(c.peekViewEditorMatchHighlight),position:B.Center}};let i;this._direction===g.CallsFrom?i=e.parent?e.parent.item.uri:e.model.root.uri:i=e.item.uri;const o=await this._textModelService.createModelReference(i);this._editor.setModel(o.object.textEditorModel);const l=[];let n,p=e.locations;p||(p=[{uri:e.item.uri,range:e.item.selectionRange}]);for(const s of p)s.uri.toString()===i.toString()&&(l.push({range:s.range,options:t}),n=n?I.plusRange(s.range,n):s.range);if(n){this._editor.revealRangeInCenter(n,y.Immediate);const s=this._editor.createDecorationsCollection(l);this._previewDisposable.add(O(()=>s.clear()))}this._previewDisposable.add(o);const r=this._direction===g.CallsFrom?_("callFrom","Calls from '{0}'",e.model.root.name):_("callsTo","Callers of '{0}'",e.model.root.name);this.setTitle(r)}showLoading(){this._parent.dataset.state="loading",this.setTitle(_("title.loading","Loading...")),this._show()}showMessage(e){this._parent.dataset.state="message",this.setTitle(""),this.setMetaTitle(""),this._message.innerText=e,this._show(),this._message.focus()}async showModel(e){this._show();const t=this._treeViewStates.get(this._direction);await this._tree.setInput(e,t);const i=this._tree.getNode(e).children[0];await this._tree.expand(i.element),i.children.length===0?this.showMessage(this._direction===g.CallsFrom?_("empt.callsFrom","No calls from '{0}'",e.root.name):_("empt.callsTo","No callers of '{0}'",e.root.name)):(this._parent.dataset.state="data",(!t||this._tree.getFocus().length===0)&&this._tree.setFocus([i.children[0].element]),this._tree.domFocus(),this._updatePreview())}getModel(){return this._tree.getInput()}getFocused(){return this._tree.getFocus()[0]}async updateDirection(e){const t=this._tree.getInput();t&&e!==this._direction&&(this._treeViewStates.set(this._direction,this._tree.getViewState()),this._direction=e,await this.showModel(t))}_show(){this._isShowing||(this.editor.revealLineInCenterIfOutsideViewport(this._where.lineNumber,y.Smooth),super.show(I.fromPositions(this._where),this._layoutInfo.height))}_onWidth(e){this._dim&&this._doLayoutBody(this._dim.height,e)}_doLayoutBody(e,t){(this._dim.height!==e||this._dim.width!==t)&&(super._doLayoutBody(e,t),this._dim=new C(t,e),this._layoutInfo.height=this._viewZone?this._viewZone.heightInLines:this._layoutInfo.height,this._splitView.layout(t),this._splitView.resizeView(0,t*this._layoutInfo.ratio))}};u=w([d(3,K),d(4,c.IPeekViewService),d(5,R),d(6,z),d(7,U),d(8,j),d(9,G),d(10,L)],u);export{u as CallHierarchyTreePeekWidget};
