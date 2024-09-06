var Q=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var S=(i,n,e,t)=>{for(var o=t>1?void 0:t?X(n,e):n,r=i.length-1,s;r>=0;r--)(s=i[r])&&(o=(t?s(n,e,o):s(o))||o);return t&&o&&Q(n,e,o),o},a=(i,n)=>(e,t)=>n(e,t,i);import"./media/activitybarpart.css";import"./media/activityaction.css";import{$ as Z,addDisposableListener as V,append as ee,clearNode as te,EventType as _,isAncestor as oe}from"../../../../base/browser/dom.js";import{StandardKeyboardEvent as k}from"../../../../base/browser/keyboardEvent.js";import"../../../../base/browser/touch.js";import{ActionsOrientation as R}from"../../../../base/browser/ui/actionbar/actionbar.js";import{HoverPosition as N}from"../../../../base/browser/ui/hover/hoverWidget.js";import{Separator as w,SubmenuAction as ie,toAction as O}from"../../../../base/common/actions.js";import{KeyCode as v}from"../../../../base/common/keyCodes.js";import{DisposableStore as ne,MutableDisposable as re}from"../../../../base/common/lifecycle.js";import{assertIsDefined as x}from"../../../../base/common/types.js";import{localize as u,localize2 as h}from"../../../../nls.js";import{Categories as C}from"../../../../platform/action/common/actionCommonCategories.js";import{createAndFillInContextMenuActions as ae}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as b,IMenuService as ce,MenuId as c,MenuRegistry as E,registerAction2 as A}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as g}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as d,IContextKeyService as se}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as Y}from"../../../../platform/instantiation/common/instantiation.js";import{IStorageService as H}from"../../../../platform/storage/common/storage.js";import{activeContrastBorder as ue,contrastBorder as me,focusBorder as le}from"../../../../platform/theme/common/colorRegistry.js";import{IThemeService as de,registerThemingParticipant as pe}from"../../../../platform/theme/common/themeService.js";import{getMenuBarVisibility as P}from"../../../../platform/window/common/window.js";import{ACTIVITY_BAR_ACTIVE_BACKGROUND as K,ACTIVITY_BAR_ACTIVE_BORDER as F,ACTIVITY_BAR_ACTIVE_FOCUS_BORDER as ve,ACTIVITY_BAR_BACKGROUND as he,ACTIVITY_BAR_BADGE_BACKGROUND as Ce,ACTIVITY_BAR_BADGE_FOREGROUND as Ae,ACTIVITY_BAR_BORDER as Be,ACTIVITY_BAR_DRAG_AND_DROP_BORDER as fe,ACTIVITY_BAR_FOREGROUND as be,ACTIVITY_BAR_INACTIVE_FOREGROUND as ge}from"../../../common/theme.js";import{IViewDescriptorService as Ie,ViewContainerLocation as I,ViewContainerLocationToString as q}from"../../../common/views.js";import{IWorkbenchEnvironmentService as ye}from"../../../services/environment/common/environmentService.js";import{IExtensionService as Te}from"../../../services/extensions/common/extensions.js";import{ActivityBarPosition as m,IWorkbenchLayoutService as M,LayoutSettings as l,Parts as y,Position as we}from"../../../services/layout/browser/layoutService.js";import{IPaneCompositePartService as Se}from"../../../services/panecomposite/browser/panecomposite.js";import{IViewsService as Ve}from"../../../services/views/common/viewsService.js";import{ToggleSidebarPositionAction as L}from"../../actions/layoutActions.js";import{Part as _e}from"../../part.js";import{GlobalCompositeBar as ke}from"../globalCompositeBar.js";import{PaneCompositeBar as Re}from"../paneCompositeBar.js";import"../paneCompositePart.js";import{CustomMenubarControl as Oe}from"../titlebar/menubarControl.js";let p=class extends _e{constructor(e,t,o,r,s){super(y.ACTIVITYBAR_PART,{hasTitle:!1},r,s,o);this.paneCompositePart=e;this.instantiationService=t}static ACTION_HEIGHT=48;static pinnedViewContainersKey="workbench.activity.pinnedViewlets2";static placeholderViewContainersKey="workbench.activity.placeholderViewlets";static viewContainersWorkspaceStateKey="workbench.activity.viewletsWorkspaceState";minimumWidth=48;maximumWidth=48;minimumHeight=0;maximumHeight=Number.POSITIVE_INFINITY;compositeBar=this._register(new re);content;createCompositeBar(){return this.instantiationService.createInstance(T,{partContainerClass:"activitybar",pinnedViewContainersKey:p.pinnedViewContainersKey,placeholderViewContainersKey:p.placeholderViewContainersKey,viewContainersWorkspaceStateKey:p.viewContainersWorkspaceStateKey,orientation:R.VERTICAL,icon:!0,iconSize:24,activityHoverOptions:{position:()=>this.layoutService.getSideBarPosition()===we.LEFT?N.RIGHT:N.LEFT},preventLoopNavigation:!0,recomputeSizes:!1,fillExtraContextMenuActions:(e,t)=>{},compositeSize:52,colors:e=>({activeForegroundColor:e.getColor(be),inactiveForegroundColor:e.getColor(ge),activeBorderColor:e.getColor(F),activeBackground:e.getColor(K),badgeBackground:e.getColor(Ce),badgeForeground:e.getColor(Ae),dragAndDropBorder:e.getColor(fe),activeBackgroundColor:void 0,inactiveBackgroundColor:void 0,activeBorderBottomColor:void 0}),overflowActionSize:p.ACTION_HEIGHT},y.ACTIVITYBAR_PART,this.paneCompositePart,!0)}createContentArea(e){return this.element=e,this.content=ee(this.element,Z(".content")),this.layoutService.isVisible(y.ACTIVITYBAR_PART)&&this.show(),this.content}getPinnedPaneCompositeIds(){return this.compositeBar.value?.getPinnedPaneCompositeIds()??[]}getVisiblePaneCompositeIds(){return this.compositeBar.value?.getVisiblePaneCompositeIds()??[]}focus(){this.compositeBar.value?.focus()}updateStyles(){super.updateStyles();const e=x(this.getContainer()),t=this.getColor(he)||"";e.style.backgroundColor=t;const o=this.getColor(Be)||this.getColor(me)||"";e.classList.toggle("bordered",!!o),e.style.borderColor=o||""}show(e){this.content&&(this.compositeBar.value||(this.compositeBar.value=this.createCompositeBar(),this.compositeBar.value.create(this.content),this.dimension&&this.layout(this.dimension.width,this.dimension.height)),e&&this.focus())}hide(){this.compositeBar.value&&(this.compositeBar.clear(),this.content&&te(this.content))}layout(e,t){if(super.layout(e,t,0,0),!this.compositeBar.value)return;const o=super.layoutContents(e,t).contentSize;this.compositeBar.value.layout(e,o.height)}toJSON(){return{type:y.ACTIVITYBAR_PART}}};p=S([a(1,Y),a(2,M),a(3,de),a(4,H)],p);let T=class extends Re{constructor(e,t,o,r,s,B,W,$,U,z,j,Ee,Pe,J){super({...e,fillExtraContextMenuActions:(f,D)=>{e.fillExtraContextMenuActions(f,D),this.fillContextMenuActions(f,D)}},t,o,s,B,W,$,U,z,j,J);this.configurationService=Ee;this.menuService=Pe;r&&(this.globalCompositeBar=this._register(s.createInstance(ke,()=>this.getContextMenuActions(),f=>this.options.colors(f),this.options.activityHoverOptions))),this._register(this.configurationService.onDidChangeConfiguration(f=>{f.affectsConfiguration("window.menuBarVisibility")&&(P(this.configurationService)==="compact"?this.installMenubar():this.uninstallMenubar())}))}element;menuBar;menuBarContainer;compositeBarContainer;globalCompositeBar;keyboardNavigationDisposables=this._register(new ne);fillContextMenuActions(e,t){const o=P(this.configurationService);(o==="compact"||o==="hidden"||o==="toggle")&&e.unshift(O({id:"toggleMenuVisibility",label:u("menu","Menu"),checked:o==="compact",run:()=>this.configurationService.updateValue("window.menuBarVisibility",o==="compact"?"toggle":"compact")}),new w),o==="compact"&&this.menuBarContainer&&t?.target&&oe(t.target,this.menuBarContainer)&&e.unshift(O({id:"hideCompactMenu",label:u("hideMenu","Hide Menu"),run:()=>this.configurationService.updateValue("window.menuBarVisibility","toggle")}),new w),this.globalCompositeBar&&(e.push(new w),e.push(...this.globalCompositeBar.getContextMenuActions())),e.push(new w),e.push(...this.getActivityBarContextMenuActions())}uninstallMenubar(){this.menuBar&&(this.menuBar.dispose(),this.menuBar=void 0),this.menuBarContainer&&(this.menuBarContainer.remove(),this.menuBarContainer=void 0)}installMenubar(){if(this.menuBar)return;this.menuBarContainer=document.createElement("div"),this.menuBarContainer.classList.add("menubar"),x(this.element).prepend(this.menuBarContainer),this.menuBar=this._register(this.instantiationService.createInstance(Oe)),this.menuBar.create(this.menuBarContainer)}registerKeyboardNavigationListeners(){this.keyboardNavigationDisposables.clear(),this.menuBarContainer&&this.keyboardNavigationDisposables.add(V(this.menuBarContainer,_.KEY_DOWN,e=>{const t=new k(e);(t.equals(v.DownArrow)||t.equals(v.RightArrow))&&this.focus()})),this.compositeBarContainer&&this.keyboardNavigationDisposables.add(V(this.compositeBarContainer,_.KEY_DOWN,e=>{const t=new k(e);t.equals(v.DownArrow)||t.equals(v.RightArrow)?this.globalCompositeBar?.focus():(t.equals(v.UpArrow)||t.equals(v.LeftArrow))&&this.menuBar?.toggleFocus()})),this.globalCompositeBar&&this.keyboardNavigationDisposables.add(V(this.globalCompositeBar.element,_.KEY_DOWN,e=>{const t=new k(e);(t.equals(v.UpArrow)||t.equals(v.LeftArrow))&&this.focus(this.getVisiblePaneCompositeIds().length-1)}))}create(e){return this.element=e,P(this.configurationService)==="compact"&&this.installMenubar(),this.compositeBarContainer=super.create(this.element),this.globalCompositeBar&&this.globalCompositeBar.create(this.element),this.registerKeyboardNavigationListeners(),this.compositeBarContainer}layout(e,t){this.menuBarContainer&&(this.options.orientation===R.VERTICAL?t-=this.menuBarContainer.clientHeight:e-=this.menuBarContainer.clientWidth),this.globalCompositeBar&&(this.options.orientation===R.VERTICAL?t-=this.globalCompositeBar.size()*p.ACTION_HEIGHT:e-=this.globalCompositeBar.element.clientWidth),super.layout(e,t)}getActivityBarContextMenuActions(){const e=this.menuService.getMenuActions(c.ActivityBarPositionMenu,this.contextKeyService,{shouldForwardArgs:!0,renderShortTitle:!0}),t=[];return ae(e,{primary:[],secondary:t}),[new ie("workbench.action.panel.position",u("activity bar position","Activity Bar Position"),t),O({id:L.ID,label:L.getLabel(this.layoutService),run:()=>this.instantiationService.invokeFunction(o=>new L().run(o))})]}};T=S([a(4,Y),a(5,H),a(6,Te),a(7,Ie),a(8,Ve),a(9,se),a(10,ye),a(11,g),a(12,ce),a(13,M)],T),A(class extends b{constructor(){super({id:"workbench.action.activityBarLocation.default",title:{...h("positionActivityBarDefault","Move Activity Bar to Side"),mnemonicTitle:u({key:"miDefaultActivityBar",comment:["&& denotes a mnemonic"]},"&&Default")},shortTitle:u("default","Default"),category:C.View,toggled:d.equals(`config.${l.ACTIVITY_BAR_LOCATION}`,m.DEFAULT),menu:[{id:c.ActivityBarPositionMenu,order:1},{id:c.CommandPalette,when:d.notEquals(`config.${l.ACTIVITY_BAR_LOCATION}`,m.DEFAULT)}]})}run(i){i.get(g).updateValue(l.ACTIVITY_BAR_LOCATION,m.DEFAULT)}}),A(class extends b{constructor(){super({id:"workbench.action.activityBarLocation.top",title:{...h("positionActivityBarTop","Move Activity Bar to Top"),mnemonicTitle:u({key:"miTopActivityBar",comment:["&& denotes a mnemonic"]},"&&Top")},shortTitle:u("top","Top"),category:C.View,toggled:d.equals(`config.${l.ACTIVITY_BAR_LOCATION}`,m.TOP),menu:[{id:c.ActivityBarPositionMenu,order:2},{id:c.CommandPalette,when:d.notEquals(`config.${l.ACTIVITY_BAR_LOCATION}`,m.TOP)}]})}run(i){i.get(g).updateValue(l.ACTIVITY_BAR_LOCATION,m.TOP)}}),A(class extends b{constructor(){super({id:"workbench.action.activityBarLocation.bottom",title:{...h("positionActivityBarBottom","Move Activity Bar to Bottom"),mnemonicTitle:u({key:"miBottomActivityBar",comment:["&& denotes a mnemonic"]},"&&Bottom")},shortTitle:u("bottom","Bottom"),category:C.View,toggled:d.equals(`config.${l.ACTIVITY_BAR_LOCATION}`,m.BOTTOM),menu:[{id:c.ActivityBarPositionMenu,order:3},{id:c.CommandPalette,when:d.notEquals(`config.${l.ACTIVITY_BAR_LOCATION}`,m.BOTTOM)}]})}run(i){i.get(g).updateValue(l.ACTIVITY_BAR_LOCATION,m.BOTTOM)}}),A(class extends b{constructor(){super({id:"workbench.action.activityBarLocation.hide",title:{...h("hideActivityBar","Hide Activity Bar"),mnemonicTitle:u({key:"miHideActivityBar",comment:["&& denotes a mnemonic"]},"&&Hidden")},shortTitle:u("hide","Hidden"),category:C.View,toggled:d.equals(`config.${l.ACTIVITY_BAR_LOCATION}`,m.HIDDEN),menu:[{id:c.ActivityBarPositionMenu,order:4},{id:c.CommandPalette,when:d.notEquals(`config.${l.ACTIVITY_BAR_LOCATION}`,m.HIDDEN)}]})}run(i){i.get(g).updateValue(l.ACTIVITY_BAR_LOCATION,m.HIDDEN)}}),E.appendMenuItem(c.MenubarAppearanceMenu,{submenu:c.ActivityBarPositionMenu,title:u("positionActivituBar","Activity Bar Position"),group:"3_workbench_layout_move",order:2}),E.appendMenuItem(c.ViewContainerTitleContext,{submenu:c.ActivityBarPositionMenu,title:u("positionActivituBar","Activity Bar Position"),when:d.equals("viewContainerLocation",q(I.Sidebar)),group:"3_workbench_layout_move",order:1}),E.appendMenuItem(c.ViewTitleContext,{submenu:c.ActivityBarPositionMenu,title:u("positionActivituBar","Activity Bar Position"),when:d.equals("viewLocation",q(I.Sidebar)),group:"3_workbench_layout_move",order:1});class G extends b{constructor(e,t){super(e);this.offset=t}async run(e){const t=e.get(Se),o=t.getVisiblePaneCompositeIds(I.Sidebar),r=t.getActivePaneComposite(I.Sidebar);if(!r)return;let s;for(let B=0;B<o.length;B++)if(o[B]===r.getId()){s=o[(B+o.length+this.offset)%o.length];break}await t.openPaneComposite(s,I.Sidebar,!0)}}A(class extends G{constructor(){super({id:"workbench.action.previousSideBarView",title:h("previousSideBarView","Previous Primary Side Bar View"),category:C.View,f1:!0},-1)}}),A(class extends G{constructor(){super({id:"workbench.action.nextSideBarView",title:h("nextSideBarView","Next Primary Side Bar View"),category:C.View,f1:!0},1)}}),A(class extends b{constructor(){super({id:"workbench.action.focusActivityBar",title:h("focusActivityBar","Focus Activity Bar"),category:C.View,f1:!0})}async run(n){n.get(M).focusPart(y.ACTIVITYBAR_PART)}}),pe((i,n)=>{const e=i.getColor(F);e&&n.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator:before {
				border-left-color: ${e};
			}
		`);const t=i.getColor(ve);t&&n.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus::before {
				visibility: hidden;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus .active-item-indicator:before {
				visibility: visible;
				border-left-color: ${t};
			}
		`);const o=i.getColor(K);o&&n.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator {
				z-index: 0;
				background-color: ${o};
			}
		`);const r=i.getColor(ue);if(r)n.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item .action-label::before{
				padding: 6px;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover .action-label::before {
				outline: 1px solid ${r};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover .action-label::before {
				outline: 1px dashed ${r};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
				border-left-color: ${r};
			}
		`);else{const s=i.getColor(le);s&&n.addRule(`
				.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator::before {
						border-left-color: ${s};
					}
				`)}});export{T as ActivityBarCompositeBar,p as ActivitybarPart};
