var se=Object.defineProperty;var oe=Object.getOwnPropertyDescriptor;var K=(m,v,e,t)=>{for(var i=t>1?void 0:t?oe(v,e):v,n=m.length-1,o;n>=0;n--)(o=m[n])&&(i=(t?o(v,e,i):o(i))||i);return t&&i&&se(v,e,i),i},g=(m,v)=>(e,t)=>v(e,t,m);import{addDisposableListener as R,DragAndDropObserver as re,EventType as Z,getWindow as k,isAncestor as ae}from"../../../../../vs/base/browser/dom.js";import{StandardMouseEvent as G}from"../../../../../vs/base/browser/mouseEvent.js";import{Gesture as de,EventType as he}from"../../../../../vs/base/browser/touch.js";import"../../../../../vs/base/browser/ui/actionbar/actionbar.js";import{Orientation as C}from"../../../../../vs/base/browser/ui/sash/sash.js";import{PaneView as ce}from"../../../../../vs/base/browser/ui/splitview/paneview.js";import"../../../../../vs/base/common/actions.js";import{RunOnceScheduler as pe}from"../../../../../vs/base/common/async.js";import{Emitter as b,Event as $}from"../../../../../vs/base/common/event.js";import{KeyChord as L,KeyCode as S,KeyMod as B}from"../../../../../vs/base/common/keyCodes.js";import{combinedDisposable as Y,DisposableStore as le,toDisposable as ve}from"../../../../../vs/base/common/lifecycle.js";import{assertIsDefined as P}from"../../../../../vs/base/common/types.js";import"vs/css!./media/paneviewlet";import"../../../../../vs/base/browser/ui/actionbar/actionViewItems.js";import*as A from"../../../../../vs/nls.js";import{createActionViewItem as we}from"../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as j,IMenuService as ue,MenuId as z,MenuRegistry as fe,registerAction2 as M}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as ge}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as X}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as me}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IInstantiationService as Ve}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as W}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{IStorageService as De,StorageScope as J,StorageTarget as Ce}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as Ie}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{activeContrastBorder as ye,asCssVariable as T}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{IThemeService as Se,Themable as be}from"../../../../../vs/platform/theme/common/themeService.js";import{IWorkspaceContextService as Pe}from"../../../../../vs/platform/workspace/common/workspace.js";import{CompositeMenuActions as Ae}from"../../../../../vs/workbench/browser/actions.js";import{CompositeDragAndDropObserver as q,toggleDropEffect as Q}from"../../../../../vs/workbench/browser/dnd.js";import"../../../../../vs/workbench/browser/parts/views/viewPane.js";import"../../../../../vs/workbench/browser/parts/views/viewsViewlet.js";import{Component as Ee}from"../../../../../vs/workbench/common/component.js";import{FocusedViewContext as x}from"../../../../../vs/workbench/common/contextkeys.js";import{PANEL_SECTION_BORDER as Me,PANEL_SECTION_DRAG_AND_DROP_BACKGROUND as ee,PANEL_SECTION_HEADER_BACKGROUND as Te,PANEL_SECTION_HEADER_BORDER as xe,PANEL_SECTION_HEADER_FOREGROUND as _e,SIDE_BAR_DRAG_AND_DROP_BACKGROUND as ie,SIDE_BAR_SECTION_HEADER_BACKGROUND as Oe,SIDE_BAR_SECTION_HEADER_BORDER as Re,SIDE_BAR_SECTION_HEADER_FOREGROUND as Le}from"../../../../../vs/workbench/common/theme.js";import{IViewDescriptorService as N,ViewContainerLocation as _,ViewContainerLocationToString as te,ViewVisibilityState as Be}from"../../../../../vs/workbench/common/views.js";import{IExtensionService as ze}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{isHorizontal as We,IWorkbenchLayoutService as Ne,LayoutSettings as He}from"../../../../../vs/workbench/services/layout/browser/layoutService.js";import{IViewsService as ne}from"../../../../../vs/workbench/services/views/common/viewsService.js";const Fe=new z("Views");fe.appendMenuItem(z.ViewContainerTitle,{submenu:Fe,title:A.localize("views","Views"),order:1});var Ue=(i=>(i[i.UP=0]="UP",i[i.DOWN=1]="DOWN",i[i.LEFT=2]="LEFT",i[i.RIGHT=3]="RIGHT",i))(Ue||{});class E extends be{constructor(e,t,i,n,o){super(o);this.paneElement=e;this.orientation=t;this.bounds=i;this.location=n;this.cleanupOverlayScheduler=this._register(new pe(()=>this.dispose(),300)),this.create()}static OVERLAY_ID="monaco-pane-drop-overlay";container;overlay;_currentDropOperation;_disposed;cleanupOverlayScheduler;get currentDropOperation(){return this._currentDropOperation}get disposed(){return!!this._disposed}create(){this.container=document.createElement("div"),this.container.id=E.OVERLAY_ID,this.container.style.top="0px",this.paneElement.appendChild(this.container),this.paneElement.classList.add("dragged-over"),this._register(ve(()=>{this.container.remove(),this.paneElement.classList.remove("dragged-over")})),this.overlay=document.createElement("div"),this.overlay.classList.add("pane-overlay-indicator"),this.container.appendChild(this.overlay),this.registerListeners(),this.updateStyles()}updateStyles(){this.overlay.style.backgroundColor=this.getColor(this.location===_.Panel?ee:ie)||"";const e=this.getColor(ye);this.overlay.style.outlineColor=e||"",this.overlay.style.outlineOffset=e?"-2px":"",this.overlay.style.outlineStyle=e?"dashed":"",this.overlay.style.outlineWidth=e?"2px":"",this.overlay.style.borderColor=e||"",this.overlay.style.borderStyle="solid",this.overlay.style.borderWidth="0px"}registerListeners(){this._register(new re(this.container,{onDragOver:e=>{this.positionOverlay(e.offsetX,e.offsetY),this.cleanupOverlayScheduler.isScheduled()&&this.cleanupOverlayScheduler.cancel()},onDragLeave:e=>this.dispose(),onDragEnd:e=>this.dispose(),onDrop:e=>{this.dispose()}})),this._register(R(this.container,Z.MOUSE_OVER,()=>{this.cleanupOverlayScheduler.isScheduled()||this.cleanupOverlayScheduler.schedule()}))}positionOverlay(e,t){const i=this.paneElement.clientWidth,n=this.paneElement.clientHeight,o=i/2,d=n/2;let l;switch(this.orientation===C.VERTICAL?t<d?l=0:t>=d&&(l=1):this.orientation===C.HORIZONTAL&&(e<o?l=2:e>=o&&(l=3)),l){case 0:this.doPositionOverlay({top:"0",left:"0",width:"100%",height:"50%"});break;case 1:this.doPositionOverlay({bottom:"0",left:"0",width:"100%",height:"50%"});break;case 2:this.doPositionOverlay({top:"0",left:"0",width:"50%",height:"100%"});break;case 3:this.doPositionOverlay({top:"0",right:"0",width:"50%",height:"100%"});break;default:{let s="0",r="0",h="100%",c="100%";if(this.bounds){const V=this.container.getBoundingClientRect();s=`${this.bounds.top-V.top}px`,r=`${this.bounds.left-V.left}px`,c=`${this.bounds.bottom-this.bounds.top}px`,h=`${this.bounds.right-this.bounds.left}px`}this.doPositionOverlay({top:s,left:r,width:h,height:c})}}this.orientation===C.VERTICAL&&n<=25||this.orientation===C.HORIZONTAL&&i<=25?this.doUpdateOverlayBorder(l):this.doUpdateOverlayBorder(void 0),this.overlay.style.opacity="1",setTimeout(()=>this.overlay.classList.add("overlay-move-transition"),0),this._currentDropOperation=l}doUpdateOverlayBorder(e){this.overlay.style.borderTopWidth=e===0?"2px":"0px",this.overlay.style.borderLeftWidth=e===2?"2px":"0px",this.overlay.style.borderBottomWidth=e===1?"2px":"0px",this.overlay.style.borderRightWidth=e===3?"2px":"0px"}doPositionOverlay(e){this.container.style.height="100%",this.overlay.style.top=e.top||"",this.overlay.style.left=e.left||"",this.overlay.style.bottom=e.bottom||"",this.overlay.style.right=e.right||"",this.overlay.style.width=e.width,this.overlay.style.height=e.height}contains(e){return e===this.container||e===this.overlay}dispose(){super.dispose(),this._disposed=!0}}let O=class extends Ae{constructor(v,e,t,i,n){const o=i.createScoped(v);o.createKey("viewContainer",e.id);const d=o.createKey("viewContainerLocation",te(t.getViewContainerLocation(e)));super(z.ViewContainerTitle,z.ViewContainerTitleContext,{shouldForwardArgs:!0,renderShortTitle:!0},o,n),this._register(o),this._register($.filter(t.onDidChangeContainerLocation,l=>l.viewContainer===e)(()=>d.set(te(t.getViewContainerLocation(e)))))}};O=K([g(2,N),g(3,X),g(4,ue)],O);let H=class extends Ee{constructor(e,t,i,n,o,d,l,s,r,h,c,V){super(e,r,h);this.options=t;this.instantiationService=i;this.configurationService=n;this.layoutService=o;this.contextMenuService=d;this.telemetryService=l;this.extensionService=s;this.storageService=h;this.contextService=c;this.viewDescriptorService=V;const p=this.viewDescriptorService.getViewContainerById(e);if(!p)throw new Error("Could not find container");this.viewContainer=p,this.visibleViewsStorageId=`${e}.numberOfVisibleViews`,this.visibleViewsCountFromCache=this.storageService.getNumber(this.visibleViewsStorageId,J.WORKSPACE,void 0),this.viewContainerModel=this.viewDescriptorService.getViewContainerModel(p)}viewContainer;lastFocusedPane;lastMergedCollapsedPane;paneItems=[];paneview;visible=!1;areExtensionsReady=!1;didLayout=!1;dimension;_boundarySashes;visibleViewsCountFromCache;visibleViewsStorageId;viewContainerModel;_onTitleAreaUpdate=this._register(new b);onTitleAreaUpdate=this._onTitleAreaUpdate.event;_onDidChangeVisibility=this._register(new b);onDidChangeVisibility=this._onDidChangeVisibility.event;_onDidAddViews=this._register(new b);onDidAddViews=this._onDidAddViews.event;_onDidRemoveViews=this._register(new b);onDidRemoveViews=this._onDidRemoveViews.event;_onDidChangeViewVisibility=this._register(new b);onDidChangeViewVisibility=this._onDidChangeViewVisibility.event;_onDidFocusView=this._register(new b);onDidFocusView=this._onDidFocusView.event;_onDidBlurView=this._register(new b);onDidBlurView=this._onDidBlurView.event;get onDidSashChange(){return P(this.paneview).onDidSashChange}get panes(){return this.paneItems.map(e=>e.pane)}get views(){return this.panes}get length(){return this.paneItems.length}_menuActions;get menuActions(){return this._menuActions}create(e){const t=this.options;t.orientation=this.orientation,this.paneview=this._register(new ce(e,this.options)),this._boundarySashes&&this.paneview.setBoundarySashes(this._boundarySashes),this._register(this.paneview.onDidDrop(({from:s,to:r})=>this.movePane(s,r))),this._register(this.paneview.onDidScroll(s=>this.onDidScrollPane())),this._register(this.paneview.onDidSashReset(s=>this.onDidSashReset(s))),this._register(R(e,Z.CONTEXT_MENU,s=>this.showContextMenu(new G(k(e),s)))),this._register(de.addTarget(e)),this._register(R(e,he.Contextmenu,s=>this.showContextMenu(new G(k(e),s)))),this._menuActions=this._register(this.instantiationService.createInstance(O,this.paneview.element,this.viewContainer)),this._register(this._menuActions.onDidChange(()=>this.updateTitleArea()));let i;const n=()=>{const s=e.getBoundingClientRect(),r=this.panes[this.panes.length-1].element.getBoundingClientRect(),h=this.orientation===C.VERTICAL?r.bottom:s.top,c=this.orientation===C.HORIZONTAL?r.right:s.left;return{top:h,bottom:s.bottom,left:c,right:s.right}},o=(s,r)=>r.x>=s.left&&r.x<=s.right&&r.y>=s.top&&r.y<=s.bottom;let d;this._register(q.INSTANCE.registerTarget(e,{onDragEnter:s=>{if(d=n(),i&&i.disposed&&(i=void 0),!i&&o(d,s.eventData)){const r=s.dragAndDropData.getData();if(r.type==="view"){const h=this.viewDescriptorService.getViewContainerByViewId(r.id),c=this.viewDescriptorService.getViewDescriptorById(r.id);if(h!==this.viewContainer&&(!c||!c.canMoveView||this.viewContainer.rejectAddedViews))return;i=new E(e,void 0,d,this.viewDescriptorService.getViewContainerLocation(this.viewContainer),this.themeService)}if(r.type==="composite"&&r.id!==this.viewContainer.id){const h=this.viewDescriptorService.getViewContainerById(r.id),c=this.viewDescriptorService.getViewContainerModel(h).allViewDescriptors;!c.some(V=>!V.canMoveView)&&c.length>0&&(i=new E(e,void 0,d,this.viewDescriptorService.getViewContainerLocation(this.viewContainer),this.themeService))}}},onDragOver:s=>{i&&i.disposed&&(i=void 0),i&&!o(d,s.eventData)&&(i.dispose(),i=void 0),o(d,s.eventData)&&Q(s.eventData.dataTransfer,"move",i!==void 0)},onDragLeave:s=>{i?.dispose(),i=void 0},onDrop:s=>{if(i){const r=s.dragAndDropData.getData(),h=[];if(r.type==="composite"&&r.id!==this.viewContainer.id){const V=this.viewDescriptorService.getViewContainerById(r.id),p=this.viewDescriptorService.getViewContainerModel(V).allViewDescriptors;p.some(I=>!I.canMoveView)||h.push(...p)}else if(r.type==="view"){const V=this.viewDescriptorService.getViewContainerByViewId(r.id),p=this.viewDescriptorService.getViewDescriptorById(r.id);V!==this.viewContainer&&p&&p.canMoveView&&this.viewDescriptorService.moveViewsToContainer([p],this.viewContainer,void 0,"dnd")}const c=this.panes.length;if(h.length>0&&this.viewDescriptorService.moveViewsToContainer(h,this.viewContainer,void 0,"dnd"),c>0)for(const V of h){const p=this.panes.find(I=>I.id===V.id);p&&this.movePane(p,this.panes[this.panes.length-1])}}i?.dispose(),i=void 0}})),this._register(this.onDidSashChange(()=>this.saveViewSizes())),this._register(this.viewContainerModel.onDidAddVisibleViewDescriptors(s=>this.onDidAddViewDescriptors(s))),this._register(this.viewContainerModel.onDidRemoveVisibleViewDescriptors(s=>this.onDidRemoveViewDescriptors(s)));const l=this.viewContainerModel.visibleViewDescriptors.map((s,r)=>{const h=this.viewContainerModel.getSize(s.id),c=this.viewContainerModel.isCollapsed(s.id);return{viewDescriptor:s,index:r,size:h,collapsed:c}});l.length&&this.onDidAddViewDescriptors(l),this.extensionService.whenInstalledExtensionsRegistered().then(()=>{this.areExtensionsReady=!0,this.panes.length&&(this.updateTitleArea(),this.updateViewHeaders()),this._register(this.configurationService.onDidChangeConfiguration(s=>{s.affectsConfiguration(He.ACTIVITY_BAR_LOCATION)&&this.updateViewHeaders()}))}),this._register(this.viewContainerModel.onDidChangeActiveViewDescriptors(()=>this._onTitleAreaUpdate.fire()))}getTitle(){const e=this.viewContainerModel.title;if(this.isViewMergedWithContainer()){const t=this.paneItems[0].pane.singleViewPaneContainerTitle;if(t)return t;const i=this.paneItems[0].pane.title;return e===i?i:i?`${e}: ${i}`:e}return e}showContextMenu(e){for(const t of this.paneItems)if(ae(e.target,t.pane.element))return;e.stopPropagation(),e.preventDefault(),this.contextMenuService.showContextMenu({getAnchor:()=>e,getActions:()=>this.menuActions?.getContextMenuActions()??[]})}getActionsContext(){}getActionViewItem(e,t){return this.isViewMergedWithContainer()?this.paneItems[0].pane.getActionViewItem(e,t):we(this.instantiationService,e,t)}focus(){let e;if(this.lastFocusedPane)e=this.lastFocusedPane;else if(this.paneItems.length>0){for(const{pane:t}of this.paneItems)if(t.isExpanded()){e=t;break}}e&&e.focus()}get orientation(){switch(this.viewDescriptorService.getViewContainerLocation(this.viewContainer)){case _.Sidebar:case _.AuxiliaryBar:return C.VERTICAL;case _.Panel:return We(this.layoutService.getPanelPosition())?C.HORIZONTAL:C.VERTICAL}return C.VERTICAL}layout(e){this.paneview&&(this.paneview.orientation!==this.orientation&&this.paneview.flipOrientation(e.height,e.width),this.paneview.layout(e.height,e.width)),this.dimension=e,this.didLayout?this.saveViewSizes():(this.didLayout=!0,this.restoreViewSizes())}setBoundarySashes(e){this._boundarySashes=e,this.paneview?.setBoundarySashes(e)}getOptimalWidth(){return Math.max(...this.panes.map(i=>i.getOptimalWidth()||0))+16}addPanes(e){const t=this.isViewMergedWithContainer();for(const{pane:i,size:n,index:o,disposable:d}of e)this.addPane(i,n,d,o);this.updateViewHeaders(),this.isViewMergedWithContainer()!==t&&this.updateTitleArea(),this._onDidAddViews.fire(e.map(({pane:i})=>i))}setVisible(e){this.visible!==!!e&&(this.visible=e,this._onDidChangeVisibility.fire(e)),this.panes.filter(t=>t.isVisible()!==e).map(t=>t.setVisible(e))}isVisible(){return this.visible}updateTitleArea(){this._onTitleAreaUpdate.fire()}createView(e,t){return this.instantiationService.createInstance(e.ctorDescriptor.ctor,...e.ctorDescriptor.staticArguments||[],t)}getView(e){return this.panes.filter(t=>t.id===e)[0]}saveViewSizes(){this.didLayout&&this.viewContainerModel.setSizes(this.panes.map(e=>({id:e.id,size:this.getPaneSize(e)})))}restoreViewSizes(){if(this.didLayout){let e;for(let t=0;t<this.viewContainerModel.visibleViewDescriptors.length;t++){const i=this.panes[t],n=this.viewContainerModel.visibleViewDescriptors[t],o=this.viewContainerModel.getSize(n.id);typeof o=="number"?this.resizePane(i,o):(e=e||this.computeInitialSizes(),this.resizePane(i,e.get(i.id)||200))}}}computeInitialSizes(){const e=new Map;if(this.dimension){const t=this.viewContainerModel.visibleViewDescriptors.reduce((i,{weight:n})=>i+(n||20),0);for(const i of this.viewContainerModel.visibleViewDescriptors)this.orientation===C.VERTICAL?e.set(i.id,this.dimension.height*(i.weight||20)/t):e.set(i.id,this.dimension.width*(i.weight||20)/t)}return e}saveState(){this.panes.forEach(e=>e.saveState()),this.storageService.store(this.visibleViewsStorageId,this.length,J.WORKSPACE,Ce.MACHINE)}onContextMenu(e,t){e.stopPropagation(),e.preventDefault();const i=t.menuActions.getContextMenuActions();this.contextMenuService.showContextMenu({getAnchor:()=>e,getActions:()=>i})}openView(e,t){let i=this.getView(e);return i||this.toggleViewVisibility(e),i=this.getView(e),i&&(i.setExpanded(!0),t&&i.focus()),i}onDidAddViewDescriptors(e){const t=[];for(const{viewDescriptor:n,collapsed:o,index:d,size:l}of e){const s=this.createView(n,{id:n.id,title:n.name.value,fromExtensionId:n.extensionId,expanded:!o,singleViewPaneContainerTitle:n.singleViewPaneContainerTitle});s.render();const r=R(s.draggableElement,"contextmenu",c=>{c.stopPropagation(),c.preventDefault(),this.onContextMenu(new G(k(s.draggableElement),c),s)}),h=$.latch($.map(s.onDidChange,()=>!s.isExpanded()))(c=>{this.viewContainerModel.setCollapsed(n.id,c)});t.push({pane:s,size:l||s.minimumSize,index:d,disposable:Y(r,h)})}this.addPanes(t),this.restoreViewSizes();const i=[];for(const{pane:n}of t)n.setVisible(this.isVisible()),i.push(n);return i}onDidRemoveViewDescriptors(e){e=e.sort((i,n)=>n.index-i.index);const t=[];for(const{index:i}of e)this.paneItems[i]&&t.push(this.paneItems[i].pane);if(t.length){this.removePanes(t);for(const i of t)i.setVisible(!1)}}toggleViewVisibility(e){if(this.viewContainerModel.activeViewDescriptors.some(t=>t.id===e)){const t=!this.viewContainerModel.isVisible(e);this.viewContainerModel.setVisible(e,t)}}addPane(e,t,i,n=this.paneItems.length-1){const o=e.onDidFocus(()=>{this._onDidFocusView.fire(e),this.lastFocusedPane=e}),d=e.onDidBlur(()=>this._onDidBlurView.fire(e)),l=e.onDidChangeTitleArea(()=>{this.isViewMergedWithContainer()&&this.updateTitleArea()}),s=e.onDidChangeBodyVisibility(()=>this._onDidChangeViewVisibility.fire(e)),r=e.onDidChange(()=>{e===this.lastFocusedPane&&!e.isExpanded()&&(this.lastFocusedPane=void 0)}),h=this.viewDescriptorService.getViewContainerLocation(this.viewContainer)===_.Panel;e.style({headerForeground:T(h?_e:Le),headerBackground:T(h?Te:Oe),headerBorder:T(h?xe:Re),dropBackground:T(h?ee:ie),leftBorder:h?T(Me):void 0});const c=new le;c.add(i),c.add(Y(e,o,d,l,r,s));const V={pane:e,disposable:c};this.paneItems.splice(n,0,V),P(this.paneview).addPane(e,t,n);let p;c.add(q.INSTANCE.registerDraggable(e.draggableElement,()=>({type:"view",id:e.id}),{})),c.add(q.INSTANCE.registerTarget(e.dropTargetElement,{onDragEnter:I=>{if(!p){const u=I.dragAndDropData.getData();if(u.type==="view"&&u.id!==e.id){const y=this.viewDescriptorService.getViewContainerByViewId(u.id),D=this.viewDescriptorService.getViewDescriptorById(u.id);if(y!==this.viewContainer&&(!D||!D.canMoveView||this.viewContainer.rejectAddedViews))return;p=new E(e.dropTargetElement,this.orientation??C.VERTICAL,void 0,this.viewDescriptorService.getViewContainerLocation(this.viewContainer),this.themeService)}if(u.type==="composite"&&u.id!==this.viewContainer.id&&!this.viewContainer.rejectAddedViews){const y=this.viewDescriptorService.getViewContainerById(u.id),D=this.viewDescriptorService.getViewContainerModel(y).allViewDescriptors;!D.some(w=>!w.canMoveView)&&D.length>0&&(p=new E(e.dropTargetElement,this.orientation??C.VERTICAL,void 0,this.viewDescriptorService.getViewContainerLocation(this.viewContainer),this.themeService))}}},onDragOver:I=>{Q(I.eventData.dataTransfer,"move",p!==void 0)},onDragLeave:I=>{p?.dispose(),p=void 0},onDrop:I=>{if(p){const u=I.dragAndDropData.getData(),y=[];let D;if(u.type==="composite"&&u.id!==this.viewContainer.id&&!this.viewContainer.rejectAddedViews){const w=this.viewDescriptorService.getViewContainerById(u.id),a=this.viewDescriptorService.getViewContainerModel(w).allViewDescriptors;a.length>0&&!a.some(f=>!f.canMoveView)&&(y.push(...a),D=a[0])}else if(u.type==="view"){const w=this.viewDescriptorService.getViewContainerByViewId(u.id),a=this.viewDescriptorService.getViewDescriptorById(u.id);w!==this.viewContainer&&a&&a.canMoveView&&!this.viewContainer.rejectAddedViews&&y.push(a),a&&(D=a)}if(y&&this.viewDescriptorService.moveViewsToContainer(y,this.viewContainer,void 0,"dnd"),D){if(p.currentDropOperation===1||p.currentDropOperation===3){const w=this.panes.findIndex(f=>f.id===D.id);let a=this.panes.findIndex(f=>f.id===e.id);w>=0&&a>=0&&(w>a&&a++,a<this.panes.length&&a!==w&&this.movePane(this.panes[w],this.panes[a]))}if(p.currentDropOperation===0||p.currentDropOperation===2){const w=this.panes.findIndex(f=>f.id===D.id);let a=this.panes.findIndex(f=>f.id===e.id);w>=0&&a>=0&&(w<a&&a--,a>=0&&a!==w&&this.movePane(this.panes[w],this.panes[a]))}y.length>1&&y.slice(1).forEach(w=>{let a=this.panes.findIndex(U=>U.id===D.id);const f=this.panes.findIndex(U=>U.id===w.id);f>=0&&a>=0&&(f>a&&a++,a<this.panes.length&&a!==f&&(this.movePane(this.panes[f],this.panes[a]),D=w))})}}p?.dispose(),p=void 0}}))}removePanes(e){const t=this.isViewMergedWithContainer();e.forEach(i=>this.removePane(i)),this.updateViewHeaders(),t!==this.isViewMergedWithContainer()&&this.updateTitleArea(),this._onDidRemoveViews.fire(e)}removePane(e){const t=this.paneItems.findIndex(n=>n.pane===e);if(t===-1)return;this.lastFocusedPane===e&&(this.lastFocusedPane=void 0),P(this.paneview).removePane(e);const[i]=this.paneItems.splice(t,1);i.disposable.dispose()}movePane(e,t){const i=this.paneItems.findIndex(s=>s.pane===e),n=this.paneItems.findIndex(s=>s.pane===t),o=this.viewContainerModel.visibleViewDescriptors[i],d=this.viewContainerModel.visibleViewDescriptors[n];if(i<0||i>=this.paneItems.length||n<0||n>=this.paneItems.length)return;const[l]=this.paneItems.splice(i,1);this.paneItems.splice(n,0,l),P(this.paneview).movePane(e,t),this.viewContainerModel.move(o.id,d.id),this.updateTitleArea()}resizePane(e,t){P(this.paneview).resizePane(e,t)}getPaneSize(e){return P(this.paneview).getPaneSize(e)}updateViewHeaders(){this.isViewMergedWithContainer()?(this.paneItems[0].pane.isExpanded()?this.lastMergedCollapsedPane=void 0:(this.lastMergedCollapsedPane=this.paneItems[0].pane,this.paneItems[0].pane.setExpanded(!0)),this.paneItems[0].pane.headerVisible=!1,this.paneItems[0].pane.collapsible=!0):(this.paneItems.length===1?(this.paneItems[0].pane.headerVisible=!0,this.paneItems[0].pane===this.lastMergedCollapsedPane&&this.paneItems[0].pane.setExpanded(!1),this.paneItems[0].pane.collapsible=!1):this.paneItems.forEach(e=>{e.pane.headerVisible=!0,e.pane.collapsible=!0,e.pane===this.lastMergedCollapsedPane&&e.pane.setExpanded(!1)}),this.lastMergedCollapsedPane=void 0)}isViewMergedWithContainer(){return this.options.mergeViewWithContainerWhenSingleView&&this.paneItems.length===1?this.areExtensionsReady?!0:this.visibleViewsCountFromCache===void 0?this.paneItems[0].pane.isExpanded():this.visibleViewsCountFromCache===1:!1}onDidScrollPane(){for(const e of this.panes)e.onDidScrollRoot()}onDidSashReset(e){let t,i;for(let n=e;n>=0;n--)if(this.paneItems[n].pane?.isVisible()&&this.paneItems[n]?.pane.isExpanded()){t=this.paneItems[n].pane;break}for(let n=e+1;n<this.paneItems.length;n++)if(this.paneItems[n].pane?.isVisible()&&this.paneItems[n]?.pane.isExpanded()){i=this.paneItems[n].pane;break}if(t&&i){const n=this.getPaneSize(t),o=this.getPaneSize(i),d=Math.ceil((n+o)/2),l=Math.floor((n+o)/2);n>o?(this.resizePane(t,d),this.resizePane(i,l)):(this.resizePane(i,l),this.resizePane(t,d))}}dispose(){super.dispose(),this.paneItems.forEach(e=>e.disposable.dispose()),this.paneview&&this.paneview.dispose()}};H=K([g(2,Ve),g(3,ge),g(4,Ne),g(5,me),g(6,Ie),g(7,ze),g(8,Se),g(9,De),g(10,Pe),g(11,N)],H);class ji extends j{desc;constructor(v){super(v),this.desc=v}run(v,...e){const t=v.get(ne).getActiveViewPaneContainerWithId(this.desc.viewPaneContainerId);if(t)return this.runInViewPaneContainer(v,t,...e)}}class F extends j{constructor(e,t){super(e);this.offset=t}async run(e){const t=e.get(N),i=e.get(X),n=x.getValue(i);if(n===void 0)return;const o=t.getViewContainerByViewId(n),d=t.getViewContainerModel(o),l=d.visibleViewDescriptors.find(h=>h.id===n),s=d.visibleViewDescriptors.indexOf(l);if(s+this.offset<0||s+this.offset>=d.visibleViewDescriptors.length)return;const r=d.visibleViewDescriptors[s+this.offset];d.move(l.id,r.id)}}M(class extends F{constructor(){super({id:"views.moveViewUp",title:A.localize("viewMoveUp","Move View Up"),keybinding:{primary:L(B.CtrlCmd+S.KeyK,S.UpArrow),weight:W.WorkbenchContrib+1,when:x.notEqualsTo("")}},-1)}}),M(class extends F{constructor(){super({id:"views.moveViewLeft",title:A.localize("viewMoveLeft","Move View Left"),keybinding:{primary:L(B.CtrlCmd+S.KeyK,S.LeftArrow),weight:W.WorkbenchContrib+1,when:x.notEqualsTo("")}},-1)}}),M(class extends F{constructor(){super({id:"views.moveViewDown",title:A.localize("viewMoveDown","Move View Down"),keybinding:{primary:L(B.CtrlCmd+S.KeyK,S.DownArrow),weight:W.WorkbenchContrib+1,when:x.notEqualsTo("")}},1)}}),M(class extends F{constructor(){super({id:"views.moveViewRight",title:A.localize("viewMoveRight","Move View Right"),keybinding:{primary:L(B.CtrlCmd+S.KeyK,S.RightArrow),weight:W.WorkbenchContrib+1,when:x.notEqualsTo("")}},1)}}),M(class extends j{constructor(){super({id:"vscode.moveViews",title:A.localize("viewsMove","Move Views")})}async run(v,e){if(!Array.isArray(e?.viewIds)||typeof e?.destinationId!="string")return Promise.reject("Invalid arguments");const t=v.get(N),i=t.getViewContainerById(e.destinationId);if(i){for(const n of e.viewIds){const o=t.getViewDescriptorById(n);o?.canMoveView&&t.moveViewsToContainer([o],i,Be.Default,this.desc.id)}await v.get(ne).openViewContainer(i.id,!0)}}});export{H as ViewPaneContainer,ji as ViewPaneContainerAction,Fe as ViewsSubMenu};