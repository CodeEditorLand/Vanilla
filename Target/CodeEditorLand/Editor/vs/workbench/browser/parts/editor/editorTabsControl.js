var S=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var h=(p,s,t,i)=>{for(var e=i>1?void 0:i?w(s,t):s,o=p.length-1,r;o>=0;o--)(r=p[o])&&(e=(i?r(s,t,e):r(e))||e);return i&&e&&S(s,t,e),e},n=(p,s)=>(t,i)=>s(t,i,p);import"vs/css!./media/editortabscontrol";import{isFirefox as D}from"../../../../../vs/base/browser/browser.js";import{applyDragImage as M,DataTransfers as V}from"../../../../../vs/base/browser/dnd.js";import{getActiveWindow as K,getWindow as H,isMouseEvent as O}from"../../../../../vs/base/browser/dom.js";import{StandardMouseEvent as P}from"../../../../../vs/base/browser/mouseEvent.js";import{ActionsOrientation as L,prepareActions as E}from"../../../../../vs/base/browser/ui/actionbar/actionbar.js";import"../../../../../vs/base/browser/ui/actionbar/actionViewItems.js";import{AnchorAlignment as G}from"../../../../../vs/base/browser/ui/contextview/contextview.js";import"../../../../../vs/base/browser/ui/hover/hoverDelegate.js";import{getDefaultHoverDelegate as R}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{ActionRunner as k}from"../../../../../vs/base/common/actions.js";import{isCancellationError as B}from"../../../../../vs/base/common/errors.js";import"../../../../../vs/base/common/keybindings.js";import{DisposableStore as I}from"../../../../../vs/base/common/lifecycle.js";import{isMacintosh as m}from"../../../../../vs/base/common/platform.js";import{assertIsDefined as g}from"../../../../../vs/base/common/types.js";import"../../../../../vs/editor/common/services/treeViewsDnd.js";import{localize as b}from"../../../../../vs/nls.js";import{createActionViewItem as F}from"../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{WorkbenchToolBar as _}from"../../../../../vs/platform/actions/browser/toolbar.js";import{MenuId as f}from"../../../../../vs/platform/actions/common/actions.js";import{IContextKeyService as y}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as N}from"../../../../../vs/platform/contextview/browser/contextView.js";import{LocalSelectionTransfer as l}from"../../../../../vs/platform/dnd/browser/dnd.js";import{IInstantiationService as W}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ServiceCollection as Y}from"../../../../../vs/platform/instantiation/common/serviceCollection.js";import{IKeybindingService as X}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{INotificationService as Q}from"../../../../../vs/platform/notification/common/notification.js";import{IQuickInputService as U}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{listActiveSelectionBackground as q,listActiveSelectionForeground as z}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{IThemeService as Z,Themable as $}from"../../../../../vs/platform/theme/common/themeService.js";import{DraggedEditorGroupIdentifier as u,fillEditorsDragData as j,isWindowDraggedOver as J}from"../../../../../vs/workbench/browser/dnd.js";import"../../../../../vs/workbench/browser/parts/editor/editor.js";import{EDITOR_CORE_NAVIGATION_COMMANDS as tt}from"../../../../../vs/workbench/browser/parts/editor/editorCommands.js";import{EditorPane as et}from"../../../../../vs/workbench/browser/parts/editor/editorPane.js";import"../../../../../vs/workbench/browser/parts/editor/editorTitleControl.js";import{ActiveEditorAvailableEditorIdsContext as it,ActiveEditorCanSplitInGroupContext as ot,ActiveEditorFirstInGroupContext as rt,ActiveEditorGroupLockedContext as nt,ActiveEditorLastInGroupContext as st,ActiveEditorPinnedContext as dt,ActiveEditorStickyContext as at,applyAvailableEditorIds as ct,ResourceContextKey as pt,SideBySideEditorActiveContext as lt}from"../../../../../vs/workbench/common/contextkeys.js";import{EditorInputCapabilities as x,EditorResourceAccessor as ut,EditorsOrder as vt,SideBySideEditor as ht,Verbosity as Et}from"../../../../../vs/workbench/common/editor.js";import"../../../../../vs/workbench/common/editor/editorGroupModel.js";import"../../../../../vs/workbench/common/editor/editorInput.js";import{SideBySideEditorInput as It}from"../../../../../vs/workbench/common/editor/sideBySideEditorInput.js";import{MergeGroupMode as A}from"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorResolverService as mt}from"../../../../../vs/workbench/services/editor/common/editorResolverService.js";import{IHostService as gt}from"../../../../../vs/workbench/services/host/browser/host.js";class bt extends k{constructor(t){super();this.context=t}run(t,i){let e=this.context;return i?.preserveFocus&&(e={...this.context,preserveFocus:!0}),super.run(t,e)}}let d=class extends ${constructor(t,i,e,o,r,a,v,c,ft,yt,xt,C,At,Ct){super(C);this.parent=t;this.editorPartsView=i;this.groupsView=e;this.groupView=o;this.tabsModel=r;this.contextMenuService=a;this.instantiationService=v;this.contextKeyService=c;this.keybindingService=ft;this.notificationService=yt;this.quickInputService=xt;this.editorResolverService=At;this.hostService=Ct;this.contextMenuContextKeyService=this._register(this.contextKeyService.createScoped(t));const T=this._register(this.instantiationService.createChild(new Y([y,this.contextMenuContextKeyService])));this.resourceContext=this._register(T.createInstance(pt)),this.editorPinnedContext=dt.bindTo(this.contextMenuContextKeyService),this.editorIsFirstContext=rt.bindTo(this.contextMenuContextKeyService),this.editorIsLastContext=st.bindTo(this.contextMenuContextKeyService),this.editorStickyContext=at.bindTo(this.contextMenuContextKeyService),this.editorAvailableEditorIds=it.bindTo(this.contextMenuContextKeyService),this.editorCanSplitInGroupContext=ot.bindTo(this.contextMenuContextKeyService),this.sideBySideEditorContext=lt.bindTo(this.contextMenuContextKeyService),this.groupLockedContext=nt.bindTo(this.contextMenuContextKeyService),this.renderDropdownAsChildElement=!1,this.tabsHoverDelegate=R("mouse"),this.create(t)}editorTransfer=l.getInstance();groupTransfer=l.getInstance();treeItemsTransfer=l.getInstance();static EDITOR_TAB_HEIGHT={normal:35,compact:22};editorActionsToolbarContainer;editorActionsToolbar;editorActionsToolbarDisposables=this._register(new I);editorActionsDisposables=this._register(new I);contextMenuContextKeyService;resourceContext;editorPinnedContext;editorIsFirstContext;editorIsLastContext;editorStickyContext;editorAvailableEditorIds;editorCanSplitInGroupContext;sideBySideEditorContext;groupLockedContext;renderDropdownAsChildElement;tabsHoverDelegate;create(t){this.updateTabHeight()}get editorActionsEnabled(){return this.groupsView.partOptions.editorActionsLocation==="default"&&this.groupsView.partOptions.showTabs!=="none"}createEditorActionsToolBar(t,i){this.editorActionsToolbarContainer=document.createElement("div"),this.editorActionsToolbarContainer.classList.add(...i),t.appendChild(this.editorActionsToolbarContainer),this.handleEditorActionToolBarVisibility(this.editorActionsToolbarContainer)}handleEditorActionToolBarVisibility(t){const i=this.editorActionsEnabled,e=!!this.editorActionsToolbar;i&&!e?this.doCreateEditorActionsToolBar(t):!i&&e&&(this.editorActionsToolbar?.getElement().remove(),this.editorActionsToolbar=void 0,this.editorActionsToolbarDisposables.clear(),this.editorActionsDisposables.clear()),t.classList.toggle("hidden",!i)}doCreateEditorActionsToolBar(t){const i={groupId:this.groupView.id};this.editorActionsToolbar=this.editorActionsToolbarDisposables.add(this.instantiationService.createInstance(_,t,{actionViewItemProvider:(e,o)=>this.actionViewItemProvider(e,o),orientation:L.HORIZONTAL,ariaLabel:b("ariaLabelEditorActions","Editor actions"),getKeyBinding:e=>this.getKeybinding(e),actionRunner:this.editorActionsToolbarDisposables.add(new bt(i)),anchorAlignmentProvider:()=>G.RIGHT,renderDropdownAsChildElement:this.renderDropdownAsChildElement,telemetrySource:"editorPart",resetMenu:f.EditorTitle,overflowBehavior:{maxItems:9,exempted:tt},highlightToggledItems:!0})),this.editorActionsToolbar.context=i,this.editorActionsToolbarDisposables.add(this.editorActionsToolbar.actionRunner.onDidRun(e=>{e.error&&!B(e.error)&&this.notificationService.error(e.error)}))}actionViewItemProvider(t,i){const e=this.groupView.activeEditorPane;if(e instanceof et){const o=e.getActionViewItem(t,i);if(o)return o}return F(this.instantiationService,t,{...i,menuAsChild:this.renderDropdownAsChildElement})}updateEditorActionsToolbar(){if(!this.editorActionsEnabled)return;this.editorActionsDisposables.clear();const t=this.groupView.createEditorActions(this.editorActionsDisposables);this.editorActionsDisposables.add(t.onDidChange(()=>this.updateEditorActionsToolbar()));const i=g(this.editorActionsToolbar),{primary:e,secondary:o}=this.prepareEditorActions(t.actions);i.setActions(E(e),E(o))}getEditorPaneAwareContextKeyService(){return this.groupView.activeEditorPane?.scopedContextKeyService??this.contextKeyService}clearEditorActionsToolbar(){if(!this.editorActionsEnabled)return;g(this.editorActionsToolbar).setActions([],[])}onGroupDragStart(t,i){if(t.target!==i)return!1;const e=this.isNewWindowOperation(t);this.groupTransfer.setData([new u(this.groupView.id)],u.prototype),t.dataTransfer&&(t.dataTransfer.effectAllowed="copyMove");let o=!1;if(this.groupsView.partOptions.showTabs==="multiple"?o=this.doFillResourceDataTransfers(this.groupView.getEditors(vt.SEQUENTIAL),t,e):this.groupView.activeEditor&&(o=this.doFillResourceDataTransfers([this.groupView.activeEditor],t,e)),!o&&D&&t.dataTransfer?.setData(V.TEXT,String(this.groupView.label)),this.groupView.activeEditor){let r=this.groupView.activeEditor.getName();this.groupsView.partOptions.showTabs==="multiple"&&this.groupView.count>1&&(r=b("draggedEditorGroup","{0} (+{1})",r,this.groupView.count-1)),M(t,r,"monaco-editor-group-drag-image",this.getColor(q),this.getColor(z))}return e}async onGroupDragEnd(t,i,e,o){if(this.groupTransfer.clearData(u.prototype),t.target!==e||!o||J())return;const r=await this.maybeCreateAuxiliaryEditorPartAt(t,e);if(!r)return;const a=r.activeGroup;this.groupsView.mergeGroup(this.groupView,a.id,{mode:this.isMoveOperation(i??t,a.id)?A.MOVE_EDITORS:A.COPY_EDITORS}),a.focus()}async maybeCreateAuxiliaryEditorPartAt(t,i){const{point:e,display:o}=await this.hostService.getCursorScreenPoint()??{point:{x:t.screenX,y:t.screenY}},r=K();if(r.document.visibilityState==="visible"&&r.document.hasFocus()&&e.x>=r.screenX&&e.x<=r.screenX+r.outerWidth&&e.y>=r.screenY&&e.y<=r.screenY+r.outerHeight)return;const a=i.offsetWidth/2,v=30+i.offsetHeight/2,c={x:e.x-a,y:e.y-v};return o&&(c.x<o.x&&(c.x=o.x),c.y<o.y&&(c.y=o.y)),this.editorPartsView.createAuxiliaryEditorPart({bounds:c})}isNewWindowOperation(t){return this.groupsView.partOptions.dragToOpenWindow?!t.altKey:t.altKey}isMoveOperation(t,i,e){return e?.hasCapability(x.Singleton)?!0:!(t.ctrlKey&&!m||t.altKey&&m)||i===this.groupView.id}doFillResourceDataTransfers(t,i,e){return t.length?(this.instantiationService.invokeFunction(j,t.map(o=>({editor:o,groupId:this.groupView.id})),i,{disableStandardTransfer:e}),!0):!1}onTabContextMenu(t,i,e){this.resourceContext.set(ut.getOriginalUri(t,{supportSideBySide:ht.PRIMARY})),this.editorPinnedContext.set(this.tabsModel.isPinned(t)),this.editorIsFirstContext.set(this.tabsModel.isFirst(t)),this.editorIsLastContext.set(this.tabsModel.isLast(t)),this.editorStickyContext.set(this.tabsModel.isSticky(t)),this.groupLockedContext.set(this.tabsModel.isLocked),this.editorCanSplitInGroupContext.set(t.hasCapability(x.CanSplitInGroup)),this.sideBySideEditorContext.set(t.typeId===It.ID),ct(this.editorAvailableEditorIds,t,this.editorResolverService);let o=e;O(i)&&(o=new P(H(e),i)),this.contextMenuService.showContextMenu({getAnchor:()=>o,menuId:f.EditorTitleContext,menuActionOptions:{shouldForwardArgs:!0,arg:this.resourceContext.get()},contextKeyService:this.contextMenuContextKeyService,getActionsContext:()=>({groupId:this.groupView.id,editorIndex:this.groupView.getIndexOfEditor(t)}),getKeyBinding:r=>this.keybindingService.lookupKeybinding(r.id,this.contextMenuContextKeyService),onHide:()=>this.groupsView.activeGroup.focus()})}getKeybinding(t){return this.keybindingService.lookupKeybinding(t.id,this.getEditorPaneAwareContextKeyService())}getKeybindingLabel(t){const i=this.getKeybinding(t);return i?i.getLabel()??void 0:void 0}get tabHeight(){return this.groupsView.partOptions.tabHeight!=="compact"?d.EDITOR_TAB_HEIGHT.normal:d.EDITOR_TAB_HEIGHT.compact}getHoverTitle(t){return t.getTitle(Et.LONG)}getHoverDelegate(){return this.tabsHoverDelegate}updateTabHeight(){this.parent.style.setProperty("--editor-group-tab-height",`${this.tabHeight}px`)}updateOptions(t,i){t.tabHeight!==i.tabHeight&&this.updateTabHeight(),(t.editorActionsLocation!==i.editorActionsLocation||t.showTabs!==i.showTabs)&&this.editorActionsToolbarContainer&&(this.handleEditorActionToolBarVisibility(this.editorActionsToolbarContainer),this.updateEditorActionsToolbar())}};d=h([n(5,N),n(6,W),n(7,y),n(8,X),n(9,Q),n(10,U),n(11,Z),n(12,mt),n(13,gt)],d);export{bt as EditorCommandsContextActionRunner,d as EditorTabsControl};
