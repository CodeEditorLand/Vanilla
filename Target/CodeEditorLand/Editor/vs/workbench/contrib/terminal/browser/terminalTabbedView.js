var D=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var x=(p,h,e,i)=>{for(var t=i>1?void 0:i?K(h,e):h,r=p.length-1,n;r>=0;r--)(n=p[r])&&(t=(i?n(h,e,t):n(t))||t);return i&&t&&D(h,e,t),t},o=(p,h)=>(e,i)=>h(e,i,p);import*as s from"../../../../../vs/base/browser/dom.js";import{LayoutPriority as y,Orientation as b,Sizing as V,SplitView as H}from"../../../../../vs/base/browser/ui/splitview/splitview.js";import{Action as S,Separator as O}from"../../../../../vs/base/common/actions.js";import{Disposable as T,dispose as A}from"../../../../../vs/base/common/lifecycle.js";import{localize as C}from"../../../../../vs/nls.js";import{IMenuService as G,MenuId as I}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as F}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as z}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as N}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as R}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as k}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IStorageService as P,StorageScope as E,StorageTarget as B}from"../../../../../vs/platform/storage/common/storage.js";import{TerminalSettingId as _}from"../../../../../vs/platform/terminal/common/terminal.js";import{ITerminalConfigurationService as $,ITerminalGroupService as U,ITerminalService as j,TerminalConnectionState as Y}from"../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{openContextMenu as W}from"../../../../../vs/workbench/contrib/terminal/browser/terminalContextMenu.js";import{TerminalTabList as Z,TerminalTabsListSizes as a}from"../../../../../vs/workbench/contrib/terminal/browser/terminalTabsList.js";import{getInstanceHoverInfo as q}from"../../../../../vs/workbench/contrib/terminal/browser/terminalTooltip.js";import{TerminalContextKeys as L}from"../../../../../vs/workbench/contrib/terminal/common/terminalContextKey.js";import{TerminalStorageKeys as v}from"../../../../../vs/workbench/contrib/terminal/common/terminalStorageKeys.js";const f=s.$;var J=(h=>(h.ViewIsVertical="terminal-side-view",h))(J||{}),Q=(e=>(e[e.StatusIcon=30]="StatusIcon",e[e.SplitAnnotation=30]="SplitAnnotation",e))(Q||{});let g=class extends T{constructor(e,i,t,r,n,c,d,l,X,u,ee){super();this._terminalService=i;this._terminalConfigurationService=t;this._terminalGroupService=r;this._instantiationService=n;this._contextMenuService=c;this._configurationService=d;this._storageService=X;this._hoverService=ee;this._tabContainer=f(".tabs-container");const w=f(".tabs-list-container");this._tabListElement=f(".tabs-list"),w.appendChild(this._tabListElement),this._tabContainer.appendChild(w),this._instanceMenu=this._register(l.createMenu(I.TerminalInstanceContext,u)),this._tabsListMenu=this._register(l.createMenu(I.TerminalTabContext,u)),this._tabsListEmptyMenu=this._register(l.createMenu(I.TerminalTabEmptyAreaContext,u)),this._tabList=this._register(this._instantiationService.createInstance(Z,this._tabListElement));const M=f(".terminal-outer-container");this._terminalContainer=f(".terminal-groups-container"),M.appendChild(this._terminalContainer),this._terminalService.setContainers(e,this._terminalContainer),this._terminalIsTabsNarrowContextKey=L.tabsNarrow.bindTo(u),this._terminalTabsFocusContextKey=L.tabsFocus.bindTo(u),this._terminalTabsMouseContextKey=L.tabsMouse.bindTo(u),this._tabTreeIndex=this._terminalConfigurationService.config.tabs.location==="left"?0:1,this._terminalContainerIndex=this._terminalConfigurationService.config.tabs.location==="left"?1:0,this._register(d.onDidChangeConfiguration(m=>{m.affectsConfiguration(_.TabsEnabled)||m.affectsConfiguration(_.TabsHideCondition)?this._refreshShowTabs():m.affectsConfiguration(_.TabsLocation)&&(this._tabTreeIndex=this._terminalConfigurationService.config.tabs.location==="left"?0:1,this._terminalContainerIndex=this._terminalConfigurationService.config.tabs.location==="left"?1:0,this._shouldShowTabs()&&(this._splitView.swapViews(0,1),this._removeSashListener(),this._addSashListener(),this._splitView.resizeView(this._tabTreeIndex,this._getLastListWidth())))})),this._register(this._terminalGroupService.onDidChangeInstances(()=>this._refreshShowTabs())),this._register(this._terminalGroupService.onDidChangeGroups(()=>this._refreshShowTabs())),this._attachEventListeners(e,this._terminalContainer),this._register(this._terminalGroupService.onDidChangePanelOrientation(m=>{this._panelOrientation=m,this._panelOrientation===b.VERTICAL?this._terminalContainer.classList.add("terminal-side-view"):this._terminalContainer.classList.remove("terminal-side-view")})),this._splitView=new H(e,{orientation:b.HORIZONTAL,proportionalLayout:!1}),this._setupSplitView(M)}_splitView;_terminalContainer;_tabListElement;_tabContainer;_tabList;_sashDisposables;_plusButton;_tabTreeIndex;_terminalContainerIndex;_height;_width;_cancelContextMenu=!1;_instanceMenu;_tabsListMenu;_tabsListEmptyMenu;_terminalIsTabsNarrowContextKey;_terminalTabsFocusContextKey;_terminalTabsMouseContextKey;_panelOrientation;_shouldShowTabs(){const e=this._terminalConfigurationService.config.tabs.enabled,i=this._terminalConfigurationService.config.tabs.hideCondition;return e?i==="never"||i==="singleTerminal"&&this._terminalGroupService.instances.length>1||i==="singleGroup"&&this._terminalGroupService.groups.length>1:!1}_refreshShowTabs(){this._shouldShowTabs()?this._splitView.length===1&&(this._addTabTree(),this._addSashListener(),this._splitView.resizeView(this._tabTreeIndex,this._getLastListWidth()),this.rerenderTabs()):this._splitView.length===2&&!this._terminalTabsMouseContextKey.get()&&(this._splitView.removeView(this._tabTreeIndex),this._plusButton?.remove(),this._removeSashListener())}_getLastListWidth(){const e=this._panelOrientation===b.VERTICAL?v.TabsListWidthVertical:v.TabsListWidthHorizontal,i=this._storageService.get(e,E.PROFILE);return!i||!parseInt(i)?this._panelOrientation===b.VERTICAL?a.NarrowViewWidth:a.DefaultWidth:parseInt(i)}_handleOnDidSashReset(){let e=a.WideViewMinimumWidth;const i=document.createElement("canvas");i.width=1,i.height=1;const t=i.getContext("2d");if(t){const n=s.getWindow(this._tabListElement).getComputedStyle(this._tabListElement);t.font=`${n.fontStyle} ${n.fontSize} ${n.fontFamily}`;const c=this._terminalGroupService.instances.reduce((d,l)=>Math.max(d,t.measureText(l.title+(l.description||"")).width+this._getAdditionalWidth(l)),0);e=Math.ceil(Math.max(c,a.WideViewMinimumWidth))}Math.ceil(this._splitView.getViewSize(this._tabTreeIndex))===e&&(e=a.NarrowViewWidth),this._splitView.resizeView(this._tabTreeIndex,e),this._updateListWidth(e)}_getAdditionalWidth(e){const t=e.statusList.statuses.length>0?30:0;return 40+((this._terminalGroupService.getGroupForInstance(e)?.terminalInstances.length||0)>1?30:0)+t}_handleOnDidSashChange(){const e=this._splitView.getViewSize(this._tabTreeIndex);!this._width||e<=0||this._updateListWidth(e)}_updateListWidth(e){e<a.MidpointViewWidth&&e>=a.NarrowViewWidth?(e=a.NarrowViewWidth,this._splitView.resizeView(this._tabTreeIndex,e)):e>=a.MidpointViewWidth&&e<a.WideViewMinimumWidth&&(e=a.WideViewMinimumWidth,this._splitView.resizeView(this._tabTreeIndex,e)),this.rerenderTabs();const i=this._panelOrientation===b.VERTICAL?v.TabsListWidthVertical:v.TabsListWidthHorizontal;this._storageService.store(i,e,E.PROFILE,B.USER)}_setupSplitView(e){this._register(this._splitView.onDidSashReset(()=>this._handleOnDidSashReset())),this._register(this._splitView.onDidSashChange(()=>this._handleOnDidSashChange())),this._shouldShowTabs()&&this._addTabTree(),this._splitView.addView({element:e,layout:i=>this._terminalGroupService.groups.forEach(t=>t.layout(i,this._height||0)),minimumSize:120,maximumSize:Number.POSITIVE_INFINITY,onDidChange:()=>T.None,priority:y.High},V.Distribute,this._terminalContainerIndex),this._shouldShowTabs()&&this._addSashListener()}_addTabTree(){this._splitView.addView({element:this._tabContainer,layout:e=>this._tabList.layout(this._height||0,e),minimumSize:a.NarrowViewWidth,maximumSize:a.MaximumWidth,onDidChange:()=>T.None,priority:y.Low},V.Distribute,this._tabTreeIndex),this.rerenderTabs()}rerenderTabs(){this._updateHasText(),this._tabList.refresh()}_addSashListener(){let e;this._sashDisposables=[this._splitView.sashes[0].onDidStart(i=>{e=s.disposableWindowInterval(s.getWindow(this._splitView.el),()=>{this.rerenderTabs()},100)}),this._splitView.sashes[0].onDidEnd(i=>{e.dispose()})]}_removeSashListener(){this._sashDisposables&&(A(this._sashDisposables),this._sashDisposables=void 0)}_updateHasText(){const e=this._tabListElement.clientWidth>a.MidpointViewWidth;this._tabContainer.classList.toggle("has-text",e),this._terminalIsTabsNarrowContextKey.set(!e)}layout(e,i){this._height=i,this._width=e,this._splitView.layout(e),this._shouldShowTabs()&&this._splitView.resizeView(this._tabTreeIndex,this._getLastListWidth()),this._updateHasText()}_attachEventListeners(e,i){this._register(s.addDisposableListener(this._tabContainer,"mouseleave",async t=>{this._terminalTabsMouseContextKey.set(!1),this._refreshShowTabs(),t.stopPropagation()})),this._register(s.addDisposableListener(this._tabContainer,"mouseenter",async t=>{this._terminalTabsMouseContextKey.set(!0),t.stopPropagation()})),this._register(s.addDisposableListener(i,"mousedown",async t=>{const r=this._terminalGroupService.activeInstance;if(this._terminalGroupService.instances.length>0&&r){const n=await r.handleMouseEvent(t,this._instanceMenu);typeof n=="object"&&n.cancelContextMenu&&(this._cancelContextMenu=!0)}})),this._register(s.addDisposableListener(i,"contextmenu",t=>{this._terminalConfigurationService.config.rightClickBehavior==="nothing"&&!t.shiftKey&&(this._cancelContextMenu=!0),i.focus(),this._cancelContextMenu||W(s.getWindow(i),t,this._terminalGroupService.activeInstance,this._instanceMenu,this._contextMenuService),t.preventDefault(),t.stopImmediatePropagation(),this._cancelContextMenu=!1})),this._register(s.addDisposableListener(this._tabContainer,"contextmenu",t=>{if(this._terminalConfigurationService.config.rightClickBehavior==="nothing"&&!t.shiftKey&&(this._cancelContextMenu=!0),!this._cancelContextMenu){const n=this._tabList.getFocus().length===0;n||(this._terminalGroupService.lastAccessedMenu="tab-list");const c=this._tabList.getSelectedElements(),d=this._tabList.getFocusedElements()?.[0];d&&(c.splice(c.findIndex(l=>l.instanceId===d.instanceId),1),c.unshift(d)),W(s.getWindow(this._tabContainer),t,c,n?this._tabsListEmptyMenu:this._tabsListMenu,this._contextMenuService,n?this._getTabActions():void 0)}t.preventDefault(),t.stopImmediatePropagation(),this._cancelContextMenu=!1})),this._register(s.addDisposableListener(i.ownerDocument,"keydown",t=>{i.classList.toggle("alt-active",!!t.altKey)})),this._register(s.addDisposableListener(i.ownerDocument,"keyup",t=>{i.classList.toggle("alt-active",!!t.altKey)})),this._register(s.addDisposableListener(e,"keyup",t=>{t.keyCode===27&&t.stopPropagation()})),this._register(s.addDisposableListener(this._tabContainer,s.EventType.FOCUS_IN,()=>{this._terminalTabsFocusContextKey.set(!0)})),this._register(s.addDisposableListener(this._tabContainer,s.EventType.FOCUS_OUT,()=>{this._terminalTabsFocusContextKey.set(!1)}))}_getTabActions(){return[new O,this._configurationService.inspect(_.TabsLocation).userValue==="left"?new S("moveRight",C("moveTabsRight","Move Tabs Right"),void 0,void 0,async()=>{this._configurationService.updateValue(_.TabsLocation,"right")}):new S("moveLeft",C("moveTabsLeft","Move Tabs Left"),void 0,void 0,async()=>{this._configurationService.updateValue(_.TabsLocation,"left")}),new S("hideTabs",C("hideTabs","Hide Tabs"),void 0,void 0,async()=>{this._configurationService.updateValue(_.TabsEnabled,!1)})]}setEditable(e){e||this._tabList.domFocus(),this._tabList.refresh(!1)}focusTabs(){if(!this._shouldShowTabs())return;this._terminalTabsFocusContextKey.set(!0);const e=this._tabList.getSelection();this._tabList.domFocus(),e&&this._tabList.setFocus(e)}focus(){if(this._terminalService.connectionState===Y.Connected){this._focus();return}const e=this._tabListElement.ownerDocument.activeElement;e&&this._register(this._terminalService.onDidChangeConnectionState(()=>{s.isActiveElement(e)&&this._focus()}))}focusHover(){if(this._shouldShowTabs()){this._tabList.focusHover();return}const e=this._terminalGroupService.activeInstance;e&&this._hoverService.showHover({...q(e),target:this._terminalContainer,trapFocus:!0},!0)}_focus(){this._terminalGroupService.activeInstance?.focusWhenReady()}};g=x([o(1,j),o(2,$),o(3,U),o(4,k),o(5,N),o(6,F),o(7,G),o(8,P),o(9,z),o(10,R)],g);export{g as TerminalTabbedView};
