import{localize as t,localize2 as s}from"../../../nls.js";import{MenuId as p,MenuRegistry as L,registerAction2 as g,Action2 as h}from"../../../platform/actions/common/actions.js";import{Categories as I}from"../../../platform/action/common/actionCommonCategories.js";import{IConfigurationService as D}from"../../../platform/configuration/common/configuration.js";import{EditorActionsLocation as _,EditorTabsMode as B,IWorkbenchLayoutService as A,LayoutSettings as E,Parts as V,Position as G,ZenModeSettings as q,positionToString as Ze}from"../../services/layout/browser/layoutService.js";import{IInstantiationService as He}from"../../../platform/instantiation/common/instantiation.js";import{KeyMod as Se,KeyCode as K,KeyChord as ve}from"../../../base/common/keyCodes.js";import{isWindows as Ke,isLinux as Qe,isWeb as We,isMacintosh as Te,isNative as Ae}from"../../../base/common/platform.js";import{IsMacNativeContext as ne}from"../../../platform/contextkey/common/contextkeys.js";import{KeybindingsRegistry as $e,KeybindingWeight as re}from"../../../platform/keybinding/common/keybindingsRegistry.js";import{ContextKeyExpr as i,IContextKeyService as Q}from"../../../platform/contextkey/common/contextkey.js";import{IViewDescriptorService as J,ViewContainerLocation as f,ViewContainerLocationToString as N}from"../../common/views.js";import{IViewsService as Ee}from"../../services/views/common/viewsService.js";import{IQuickInputService as ae}from"../../../platform/quickinput/common/quickInput.js";import{IDialogService as Ve}from"../../../platform/dialogs/common/dialogs.js";import{IPaneCompositePartService as Be}from"../../services/panecomposite/browser/panecomposite.js";import{ToggleAuxiliaryBarAction as Ue}from"../parts/auxiliarybar/auxiliaryBarActions.js";import{TogglePanelAction as je}from"../parts/panel/panelActions.js";import{ICommandService as Ge}from"../../../platform/commands/common/commands.js";import{AuxiliaryBarVisibleContext as Je,PanelAlignmentContext as W,PanelVisibleContext as Xe,SideBarVisibleContext as z,FocusedViewContext as $,InEditorZenModeContext as k,IsMainEditorCenteredLayoutContext as Ce,MainEditorAreaVisibleContext as Ye,IsMainWindowFullscreenContext as ke,PanelPositionContext as et,IsAuxiliaryWindowFocusedContext as x,TitleBarStyleContext as tt}from"../../common/contextkeys.js";import{Codicon as y}from"../../../base/common/codicons.js";import{ThemeIcon as se}from"../../../base/common/themables.js";import{DisposableStore as ce}from"../../../base/common/lifecycle.js";import{registerIcon as T}from"../../../platform/theme/common/iconRegistry.js";import{mainWindow as it}from"../../../base/browser/window.js";import{IKeybindingService as ot}from"../../../platform/keybinding/common/keybinding.js";import{TitlebarStyle as nt}from"../../../platform/window/common/window.js";import{IPreferencesService as Pe}from"../../services/preferences/common/preferences.js";const rt=T("menuBar",y.layoutMenubar,t("menuBarIcon","Represents the menu bar")),at=T("activity-bar-left",y.layoutActivitybarLeft,t("activityBarLeft","Represents the activity bar in the left position")),st=T("activity-bar-right",y.layoutActivitybarRight,t("activityBarRight","Represents the activity bar in the right position")),X=T("panel-left",y.layoutSidebarLeft,t("panelLeft","Represents a side bar in the left position")),ct=T("panel-left-off",y.layoutSidebarLeftOff,t("panelLeftOff","Represents a side bar in the left position toggled off")),Y=T("panel-right",y.layoutSidebarRight,t("panelRight","Represents side bar in the right position")),dt=T("panel-right-off",y.layoutSidebarRightOff,t("panelRightOff","Represents side bar in the right position toggled off")),lt=T("panel-bottom",y.layoutPanel,t("panelBottom","Represents the bottom panel")),ut=T("statusBar",y.layoutStatusbar,t("statusBarIcon","Represents the status bar")),gt=T("panel-align-left",y.layoutPanelLeft,t("panelBottomLeft","Represents the bottom panel alignment set to the left")),mt=T("panel-align-right",y.layoutPanelRight,t("panelBottomRight","Represents the bottom panel alignment set to the right")),pt=T("panel-align-center",y.layoutPanelCenter,t("panelBottomCenter","Represents the bottom panel alignment set to the center")),bt=T("panel-align-justify",y.layoutPanelJustify,t("panelBottomJustify","Represents the bottom panel alignment set to justified")),wt=T("fullscreen",y.screenFull,t("fullScreenIcon","Represents full screen")),ht=T("centerLayoutIcon",y.layoutCentered,t("centerLayoutIcon","Represents centered layout mode")),yt=T("zenMode",y.target,t("zenModeIcon","Represents zen mode"));g(class extends h{constructor(){super({id:"workbench.action.closeSidebar",title:s("closeSidebar","Close Primary Side Bar"),category:I.View,f1:!0})}run(r){r.get(A).setPartHidden(!0,V.SIDEBAR_PART)}});const It="workbench.action.toggleActivityBarVisibility";g(class extends h{constructor(){super({id:"workbench.action.toggleCenteredLayout",title:{...s("toggleCenteredLayout","Toggle Centered Layout"),mnemonicTitle:t({key:"miToggleCenteredLayout",comment:["&& denotes a mnemonic"]},"&&Centered Layout")},precondition:x.toNegated(),category:I.View,f1:!0,toggled:Ce,menu:[{id:p.MenubarAppearanceMenu,group:"1_toggle_view",order:3}]})}run(r){const e=r.get(A);e.centerMainEditorLayout(!e.isMainEditorLayoutCentered())}});const Me="workbench.sideBar.location";class Le extends h{constructor(o,n,a){super({id:o,title:n,f1:!1});this.position=a}async run(o){const n=o.get(A),a=o.get(D);if(n.getSideBarPosition()!==this.position)return a.updateValue(Me,Ze(this.position))}}class te extends Le{static ID="workbench.action.moveSideBarRight";constructor(){super(te.ID,s("moveSidebarRight","Move Primary Side Bar Right"),G.RIGHT)}}class ie extends Le{static ID="workbench.action.moveSideBarLeft";constructor(){super(ie.ID,s("moveSidebarLeft","Move Primary Side Bar Left"),G.LEFT)}}g(te),g(ie);class M extends h{static ID="workbench.action.toggleSidebarPosition";static LABEL=t("toggleSidebarPosition","Toggle Primary Side Bar Position");static getLabel(e){return e.getSideBarPosition()===G.LEFT?t("moveSidebarRight","Move Primary Side Bar Right"):t("moveSidebarLeft","Move Primary Side Bar Left")}constructor(){super({id:M.ID,title:s("toggleSidebarPosition","Toggle Primary Side Bar Position"),category:I.View,f1:!0})}run(e){const o=e.get(A),n=e.get(D),c=o.getSideBarPosition()===G.LEFT?"right":"left";return n.updateValue(Me,c)}}g(M);const De=T("configure-layout-icon",y.layout,t("cofigureLayoutIcon","Icon represents workbench layout configuration."));L.appendMenuItem(p.LayoutControlMenu,{submenu:p.LayoutControlMenuSubmenu,title:t("configureLayout","Configure Layout"),icon:De,group:"1_workbench_layout",when:i.equals("config.workbench.layoutControl.type","menu")}),L.appendMenuItems([{id:p.ViewContainerTitleContext,item:{group:"3_workbench_layout_move",command:{id:M.ID,title:t("move side bar right","Move Primary Side Bar Right")},when:i.and(i.notEquals("config.workbench.sideBar.location","right"),i.equals("viewContainerLocation",N(f.Sidebar))),order:1}},{id:p.ViewTitleContext,item:{group:"3_workbench_layout_move",command:{id:M.ID,title:t("move sidebar right","Move Primary Side Bar Right")},when:i.and(i.notEquals("config.workbench.sideBar.location","right"),i.equals("viewLocation",N(f.Sidebar))),order:1}},{id:p.ViewContainerTitleContext,item:{group:"3_workbench_layout_move",command:{id:M.ID,title:t("move sidebar left","Move Primary Side Bar Left")},when:i.and(i.equals("config.workbench.sideBar.location","right"),i.equals("viewContainerLocation",N(f.Sidebar))),order:1}},{id:p.ViewTitleContext,item:{group:"3_workbench_layout_move",command:{id:M.ID,title:t("move sidebar left","Move Primary Side Bar Left")},when:i.and(i.equals("config.workbench.sideBar.location","right"),i.equals("viewLocation",N(f.Sidebar))),order:1}},{id:p.ViewTitleContext,item:{group:"3_workbench_layout_move",command:{id:M.ID,title:t("move second sidebar left","Move Secondary Side Bar Left")},when:i.and(i.notEquals("config.workbench.sideBar.location","right"),i.equals("viewLocation",N(f.AuxiliaryBar))),order:1}},{id:p.ViewTitleContext,item:{group:"3_workbench_layout_move",command:{id:M.ID,title:t("move second sidebar right","Move Secondary Side Bar Right")},when:i.and(i.equals("config.workbench.sideBar.location","right"),i.equals("viewLocation",N(f.AuxiliaryBar))),order:1}}]),L.appendMenuItem(p.MenubarAppearanceMenu,{group:"3_workbench_layout_move",command:{id:M.ID,title:t({key:"miMoveSidebarRight",comment:["&& denotes a mnemonic"]},"&&Move Primary Side Bar Right")},when:i.notEquals("config.workbench.sideBar.location","right"),order:2}),L.appendMenuItem(p.MenubarAppearanceMenu,{group:"3_workbench_layout_move",command:{id:M.ID,title:t({key:"miMoveSidebarLeft",comment:["&& denotes a mnemonic"]},"&&Move Primary Side Bar Left")},when:i.equals("config.workbench.sideBar.location","right"),order:2}),g(class extends h{constructor(){super({id:"workbench.action.toggleEditorVisibility",title:{...s("toggleEditor","Toggle Editor Area Visibility"),mnemonicTitle:t({key:"miShowEditorArea",comment:["&& denotes a mnemonic"]},"Show &&Editor Area")},category:I.View,f1:!0,toggled:Ye,precondition:i.and(x.toNegated(),i.or(W.isEqualTo("center"),et.notEqualsTo("bottom")))})}run(r){r.get(A).toggleMaximizedPanel()}}),L.appendMenuItem(p.MenubarViewMenu,{group:"2_appearance",title:t({key:"miAppearance",comment:["&& denotes a mnemonic"]},"&&Appearance"),submenu:p.MenubarAppearanceMenu,order:1});class O extends h{static ID="workbench.action.toggleSidebarVisibility";constructor(){super({id:O.ID,title:s("toggleSidebar","Toggle Primary Side Bar Visibility"),toggled:{condition:z,title:t("primary sidebar","Primary Side Bar"),mnemonicTitle:t({key:"primary sidebar mnemonic",comment:["&& denotes a mnemonic"]},"&&Primary Side Bar")},category:I.View,f1:!0,keybinding:{weight:re.WorkbenchContrib,primary:Se.CtrlCmd|K.KeyB},menu:[{id:p.LayoutControlMenuSubmenu,group:"0_workbench_layout",order:0},{id:p.MenubarAppearanceMenu,group:"2_workbench_layout",order:1}]})}run(e){const o=e.get(A);o.setPartHidden(o.isVisible(V.SIDEBAR_PART),V.SIDEBAR_PART)}}g(O),L.appendMenuItems([{id:p.ViewContainerTitleContext,item:{group:"3_workbench_layout_move",command:{id:O.ID,title:t("compositePart.hideSideBarLabel","Hide Primary Side Bar")},when:i.and(z,i.equals("viewContainerLocation",N(f.Sidebar))),order:2}},{id:p.ViewTitleContext,item:{group:"3_workbench_layout_move",command:{id:O.ID,title:t("compositePart.hideSideBarLabel","Hide Primary Side Bar")},when:i.and(z,i.equals("viewLocation",N(f.Sidebar))),order:2}},{id:p.LayoutControlMenu,item:{group:"0_workbench_toggles",command:{id:O.ID,title:t("toggleSideBar","Toggle Primary Side Bar"),icon:ct,toggled:{condition:z,icon:X}},when:i.and(i.or(i.equals("config.workbench.layoutControl.type","toggles"),i.equals("config.workbench.layoutControl.type","both")),i.equals("config.workbench.sideBar.location","left")),order:0}},{id:p.LayoutControlMenu,item:{group:"0_workbench_toggles",command:{id:O.ID,title:t("toggleSideBar","Toggle Primary Side Bar"),icon:dt,toggled:{condition:z,icon:Y}},when:i.and(i.or(i.equals("config.workbench.layoutControl.type","toggles"),i.equals("config.workbench.layoutControl.type","both")),i.equals("config.workbench.sideBar.location","right")),order:2}}]);class U extends h{static ID="workbench.action.toggleStatusbarVisibility";static statusbarVisibleKey="workbench.statusBar.visible";constructor(){super({id:U.ID,title:{...s("toggleStatusbar","Toggle Status Bar Visibility"),mnemonicTitle:t({key:"miStatusbar",comment:["&& denotes a mnemonic"]},"S&&tatus Bar")},category:I.View,f1:!0,toggled:i.equals("config.workbench.statusBar.visible",!0),menu:[{id:p.MenubarAppearanceMenu,group:"2_workbench_layout",order:3}]})}run(e){const o=e.get(A),n=e.get(D),c=!o.isVisible(V.STATUSBAR_PART,it);return n.updateValue(U.statusbarVisibleKey,c)}}g(U);class F extends h{constructor(o,n,a,c,m,l){super({id:c,title:a,category:I.View,precondition:m,metadata:l?{description:l}:void 0,f1:!0});this.settingName=o;this.value=n}run(o){return o.get(D).updateValue(this.settingName,this.value)}}class de extends F{static ID="workbench.action.hideEditorTabs";constructor(){const e=i.and(i.equals(`config.${E.EDITOR_TABS_MODE}`,B.NONE).negate(),k.negate()),o=s("hideEditorTabs","Hide Editor Tabs");super(E.EDITOR_TABS_MODE,B.NONE,o,de.ID,e,s("hideEditorTabsDescription","Hide Tab Bar"))}}class le extends F{static ID="workbench.action.zenHideEditorTabs";constructor(){const e=i.and(i.equals(`config.${q.SHOW_TABS}`,B.NONE).negate(),k),o=s("hideEditorTabsZenMode","Hide Editor Tabs in Zen Mode");super(q.SHOW_TABS,B.NONE,o,le.ID,e,s("hideEditorTabsZenModeDescription","Hide Tab Bar in Zen Mode"))}}class ue extends F{static ID="workbench.action.showMultipleEditorTabs";constructor(){const e=i.and(i.equals(`config.${E.EDITOR_TABS_MODE}`,B.MULTIPLE).negate(),k.negate()),o=s("showMultipleEditorTabs","Show Multiple Editor Tabs");super(E.EDITOR_TABS_MODE,B.MULTIPLE,o,ue.ID,e,s("showMultipleEditorTabsDescription","Show Tab Bar with multiple tabs"))}}class ge extends F{static ID="workbench.action.zenShowMultipleEditorTabs";constructor(){const e=i.and(i.equals(`config.${q.SHOW_TABS}`,B.MULTIPLE).negate(),k),o=s("showMultipleEditorTabsZenMode","Show Multiple Editor Tabs in Zen Mode");super(q.SHOW_TABS,B.MULTIPLE,o,ge.ID,e,s("showMultipleEditorTabsZenModeDescription","Show Tab Bar in Zen Mode"))}}class me extends F{static ID="workbench.action.showEditorTab";constructor(){const e=i.and(i.equals(`config.${E.EDITOR_TABS_MODE}`,B.SINGLE).negate(),k.negate()),o=s("showSingleEditorTab","Show Single Editor Tab");super(E.EDITOR_TABS_MODE,B.SINGLE,o,me.ID,e,s("showSingleEditorTabDescription","Show Tab Bar with one Tab"))}}class pe extends F{static ID="workbench.action.zenShowEditorTab";constructor(){const e=i.and(i.equals(`config.${q.SHOW_TABS}`,B.SINGLE).negate(),k),o=s("showSingleEditorTabZenMode","Show Single Editor Tab in Zen Mode");super(q.SHOW_TABS,B.SINGLE,o,pe.ID,e,s("showSingleEditorTabZenModeDescription","Show Tab Bar in Zen Mode with one Tab"))}}g(de),g(le),g(ue),g(ge),g(me),g(pe),L.appendMenuItem(p.MenubarAppearanceMenu,{submenu:p.EditorTabsBarShowTabsSubmenu,title:t("tabBar","Tab Bar"),group:"3_workbench_layout_move",order:10,when:k.negate()}),L.appendMenuItem(p.MenubarAppearanceMenu,{submenu:p.EditorTabsBarShowTabsZenModeSubmenu,title:t("tabBar","Tab Bar"),group:"3_workbench_layout_move",order:10,when:k});class be extends h{static ID="workbench.action.editorActionsTitleBar";constructor(){super({id:be.ID,title:s("moveEditorActionsToTitleBar","Move Editor Actions to Title Bar"),category:I.View,precondition:i.equals(`config.${E.EDITOR_ACTIONS_LOCATION}`,_.TITLEBAR).negate(),metadata:{description:s("moveEditorActionsToTitleBarDescription","Move Editor Actions from the tab bar to the title bar")},f1:!0})}run(e){return e.get(D).updateValue(E.EDITOR_ACTIONS_LOCATION,_.TITLEBAR)}}g(be);class we extends h{static ID="workbench.action.editorActionsDefault";constructor(){super({id:we.ID,title:s("moveEditorActionsToTabBar","Move Editor Actions to Tab Bar"),category:I.View,precondition:i.and(i.equals(`config.${E.EDITOR_ACTIONS_LOCATION}`,_.DEFAULT).negate(),i.equals(`config.${E.EDITOR_TABS_MODE}`,B.NONE).negate()),metadata:{description:s("moveEditorActionsToTabBarDescription","Move Editor Actions from the title bar to the tab bar")},f1:!0})}run(e){return e.get(D).updateValue(E.EDITOR_ACTIONS_LOCATION,_.DEFAULT)}}g(we);class he extends h{static ID="workbench.action.hideEditorActions";constructor(){super({id:he.ID,title:s("hideEditorActons","Hide Editor Actions"),category:I.View,precondition:i.equals(`config.${E.EDITOR_ACTIONS_LOCATION}`,_.HIDDEN).negate(),metadata:{description:s("hideEditorActonsDescription","Hide Editor Actions in the tab and title bar")},f1:!0})}run(e){return e.get(D).updateValue(E.EDITOR_ACTIONS_LOCATION,_.HIDDEN)}}g(he);class ye extends h{static ID="workbench.action.showEditorActions";constructor(){super({id:ye.ID,title:s("showEditorActons","Show Editor Actions"),category:I.View,precondition:i.equals(`config.${E.EDITOR_ACTIONS_LOCATION}`,_.HIDDEN),metadata:{description:s("showEditorActonsDescription","Make Editor Actions visible.")},f1:!0})}run(e){return e.get(D).updateValue(E.EDITOR_ACTIONS_LOCATION,_.DEFAULT)}}g(ye),L.appendMenuItem(p.MenubarAppearanceMenu,{submenu:p.EditorActionsPositionSubmenu,title:t("editorActionsPosition","Editor Actions Position"),group:"3_workbench_layout_move",order:11});class Ie extends h{static ID="workbench.action.configureEditorTabs";constructor(){super({id:Ie.ID,title:s("configureTabs","Configure Tabs"),category:I.View})}run(e){e.get(Pe).openSettings({jsonEditor:!1,query:"workbench.editor tab"})}}g(Ie);class fe extends h{static ID="workbench.action.configureEditor";constructor(){super({id:fe.ID,title:s("configureEditors","Configure Editors"),category:I.View})}run(e){e.get(Pe).openSettings({jsonEditor:!1,query:"workbench.editor"})}}if(g(fe),g(class extends h{constructor(){super({id:"workbench.action.toggleSeparatePinnedEditorTabs",title:s("toggleSeparatePinnedEditorTabs","Separate Pinned Editor Tabs"),category:I.View,precondition:i.equals(`config.${E.EDITOR_TABS_MODE}`,B.MULTIPLE),metadata:{description:s("toggleSeparatePinnedEditorTabsDescription","Toggle whether pinned editor tabs are shown on a separate row above unpinned tabs.")},f1:!0})}run(r){const e=r.get(D),n=!e.getValue("workbench.editor.pinnedTabsOnSeparateRow");return e.updateValue("workbench.editor.pinnedTabsOnSeparateRow",n)}}),g(class extends h{constructor(){super({id:"workbench.action.toggleZenMode",title:{...s("toggleZenMode","Toggle Zen Mode"),mnemonicTitle:t({key:"miToggleZenMode",comment:["&& denotes a mnemonic"]},"Zen Mode")},precondition:x.toNegated(),category:I.View,f1:!0,keybinding:{weight:re.WorkbenchContrib,primary:ve(Se.CtrlCmd|K.KeyK,K.KeyZ)},toggled:k,menu:[{id:p.MenubarAppearanceMenu,group:"1_toggle_view",order:2}]})}run(r){return r.get(A).toggleZenMode()}}),$e.registerCommandAndKeybindingRule({id:"workbench.action.exitZenMode",weight:re.EditorContrib-1e3,handler(r){const e=r.get(A),o=r.get(Q);k.getValue(o)&&e.toggleZenMode()},when:k,primary:ve(K.Escape,K.Escape)}),Ke||Qe||We){g(class extends h{constructor(){super({id:"workbench.action.toggleMenuBar",title:{...s("toggleMenuBar","Toggle Menu Bar"),mnemonicTitle:t({key:"miMenuBar",comment:["&& denotes a mnemonic"]},"Menu &&Bar")},category:I.View,f1:!0,toggled:i.and(ne.toNegated(),i.notEquals("config.window.menuBarVisibility","hidden"),i.notEquals("config.window.menuBarVisibility","toggle"),i.notEquals("config.window.menuBarVisibility","compact")),menu:[{id:p.MenubarAppearanceMenu,group:"2_workbench_layout",order:0}]})}run(e){return e.get(A).toggleMenuBar()}});for(const r of[p.TitleBarContext,p.TitleBarTitleContext])L.appendMenuItem(r,{command:{id:"workbench.action.toggleMenuBar",title:t("miMenuBarNoMnemonic","Menu Bar"),toggled:i.and(ne.toNegated(),i.notEquals("config.window.menuBarVisibility","hidden"),i.notEquals("config.window.menuBarVisibility","toggle"),i.notEquals("config.window.menuBarVisibility","compact"))},when:i.and(x.toNegated(),i.notEquals(tt.key,nt.NATIVE),ke.negate()),group:"2_config",order:0})}g(class extends h{constructor(){super({id:"workbench.action.resetViewLocations",title:s("resetViewLocations","Reset View Locations"),category:I.View,f1:!0})}run(r){return r.get(J).reset()}}),g(class extends h{constructor(){super({id:"workbench.action.moveView",title:s("moveView","Move View"),category:I.View,f1:!0})}async run(r){const e=r.get(J),o=r.get(He),n=r.get(ae),a=r.get(Q),c=r.get(Be),m=$.getValue(a);let l;m&&e.getViewDescriptorById(m)?.canMoveView&&(l=m);try{if(l=await this.getView(n,e,c,l),!l)return;const d=new xe;o.invokeFunction(u=>d.run(u,l))}catch{}}getViewItems(r,e){const o=[];return e.getVisiblePaneCompositeIds(f.Sidebar).forEach(m=>{const l=r.getViewContainerById(m),d=r.getViewContainerModel(l);let u=!1;d.visibleViewDescriptors.forEach(b=>{b.canMoveView&&(u||(o.push({type:"separator",label:t("sidebarContainer","Side Bar / {0}",d.title)}),u=!0),o.push({id:b.id,label:b.name.value}))})}),e.getPinnedPaneCompositeIds(f.Panel).forEach(m=>{const l=r.getViewContainerById(m),d=r.getViewContainerModel(l);let u=!1;d.visibleViewDescriptors.forEach(b=>{b.canMoveView&&(u||(o.push({type:"separator",label:t("panelContainer","Panel / {0}",d.title)}),u=!0),o.push({id:b.id,label:b.name.value}))})}),e.getPinnedPaneCompositeIds(f.AuxiliaryBar).forEach(m=>{const l=r.getViewContainerById(m),d=r.getViewContainerModel(l);let u=!1;d.visibleViewDescriptors.forEach(b=>{b.canMoveView&&(u||(o.push({type:"separator",label:t("secondarySideBarContainer","Secondary Side Bar / {0}",d.title)}),u=!0),o.push({id:b.id,label:b.name.value}))})}),o}async getView(r,e,o,n){const a=new ce,c=a.add(r.createQuickPick({useSeparators:!0}));return c.placeholder=t("moveFocusedView.selectView","Select a View to Move"),c.items=this.getViewItems(e,o),c.selectedItems=c.items.filter(m=>m.id===n),new Promise((m,l)=>{a.add(c.onDidAccept(()=>{const d=c.selectedItems[0];d.id?m(d.id):l(),c.hide()})),a.add(c.onDidHide(()=>{a.dispose(),l()})),c.show()})}});class xe extends h{constructor(){super({id:"workbench.action.moveFocusedView",title:s("moveFocusedView","Move Focused View"),category:I.View,precondition:$.notEqualsTo(""),f1:!0})}run(e,o){const n=e.get(J),a=e.get(Ee),c=e.get(ae),m=e.get(Q),l=e.get(Ve),d=e.get(Be),u=o||$.getValue(m);if(u===void 0||u.trim()===""){l.error(t("moveFocusedView.error.noFocusedView","There is no view currently focused."));return}const b=n.getViewDescriptorById(u);if(!b||!b.canMoveView){l.error(t("moveFocusedView.error.nonMovableView","The currently focused view is not movable."));return}const P=new ce,v=P.add(c.createQuickPick({useSeparators:!0}));v.placeholder=t("moveFocusedView.selectDestination","Select a Destination for the View"),v.title=t({key:"moveFocusedView.title",comment:["{0} indicates the title of the view the user has selected to move."]},"View: Move {0}",b.name.value);const S=[],j=n.getViewContainerByViewId(u),H=n.getViewLocationById(u),oe=n.getViewContainerModel(j).allViewDescriptors.length===1;oe&&H===f.Panel||S.push({id:"_.panel.newcontainer",label:t({key:"moveFocusedView.newContainerInPanel",comment:["Creates a new top-level tab in the panel."]},"New Panel Entry")}),oe&&H===f.Sidebar||S.push({id:"_.sidebar.newcontainer",label:t("moveFocusedView.newContainerInSidebar","New Side Bar Entry")}),oe&&H===f.AuxiliaryBar||S.push({id:"_.auxiliarybar.newcontainer",label:t("moveFocusedView.newContainerInSidePanel","New Secondary Side Bar Entry")}),S.push({type:"separator",label:t("sidebar","Side Bar")});const qe=d.getVisiblePaneCompositeIds(f.Sidebar);S.push(...qe.filter(w=>w===n.getViewContainerByViewId(u).id?!1:!n.getViewContainerById(w).rejectAddedViews).map(w=>({id:w,label:n.getViewContainerModel(n.getViewContainerById(w)).title}))),S.push({type:"separator",label:t("panel","Panel")});const ze=d.getPinnedPaneCompositeIds(f.Panel);S.push(...ze.filter(w=>w===n.getViewContainerByViewId(u).id?!1:!n.getViewContainerById(w).rejectAddedViews).map(w=>({id:w,label:n.getViewContainerModel(n.getViewContainerById(w)).title}))),S.push({type:"separator",label:t("secondarySideBar","Secondary Side Bar")});const Fe=d.getPinnedPaneCompositeIds(f.AuxiliaryBar);S.push(...Fe.filter(w=>w===n.getViewContainerByViewId(u).id?!1:!n.getViewContainerById(w).rejectAddedViews).map(w=>({id:w,label:n.getViewContainerModel(n.getViewContainerById(w)).title}))),v.items=S,P.add(v.onDidAccept(()=>{const w=v.selectedItems[0];w.id==="_.panel.newcontainer"?(n.moveViewToLocation(b,f.Panel,this.desc.id),a.openView(u,!0)):w.id==="_.sidebar.newcontainer"?(n.moveViewToLocation(b,f.Sidebar,this.desc.id),a.openView(u,!0)):w.id==="_.auxiliarybar.newcontainer"?(n.moveViewToLocation(b,f.AuxiliaryBar,this.desc.id),a.openView(u,!0)):w.id&&(n.moveViewsToContainer([b],n.getViewContainerById(w.id),void 0,this.desc.id),a.openView(u,!0)),v.hide()})),P.add(v.onDidHide(()=>P.dispose())),v.show()}}g(xe),g(class extends h{constructor(){super({id:"workbench.action.resetFocusedViewLocation",title:s("resetFocusedViewLocation","Reset Focused View Location"),category:I.View,f1:!0,precondition:$.notEqualsTo("")})}run(r){const e=r.get(J),o=r.get(Q),n=r.get(Ve),a=r.get(Ee),c=$.getValue(o);let m=null;if(c!==void 0&&c.trim()!==""&&(m=e.getViewDescriptorById(c)),!m){n.error(t("resetFocusedView.error.noFocusedView","There is no view currently focused."));return}const l=e.getDefaultContainerById(m.id);!l||l===e.getViewContainerByViewId(m.id)||(e.moveViewsToContainer([m],l,void 0,this.desc.id),a.openView(m.id,!0))}});class C extends h{static RESIZE_INCREMENT=60;resizePart(e,o,n,a){let c;if(a===void 0){const m=n.hasFocus(V.EDITOR_PART),l=n.hasFocus(V.SIDEBAR_PART),d=n.hasFocus(V.PANEL_PART),u=n.hasFocus(V.AUXILIARYBAR_PART);l?c=V.SIDEBAR_PART:d?c=V.PANEL_PART:m?c=V.EDITOR_PART:u&&(c=V.AUXILIARYBAR_PART)}else c=a;c&&n.resizePart(c,e,o)}}class ft extends C{constructor(){super({id:"workbench.action.increaseViewSize",title:s("increaseViewSize","Increase Current View Size"),f1:!0,precondition:x.toNegated()})}run(e){this.resizePart(C.RESIZE_INCREMENT,C.RESIZE_INCREMENT,e.get(A))}}class St extends C{constructor(){super({id:"workbench.action.increaseViewWidth",title:s("increaseEditorWidth","Increase Editor Width"),f1:!0,precondition:x.toNegated()})}run(e){this.resizePart(C.RESIZE_INCREMENT,0,e.get(A),V.EDITOR_PART)}}class vt extends C{constructor(){super({id:"workbench.action.increaseViewHeight",title:s("increaseEditorHeight","Increase Editor Height"),f1:!0,precondition:x.toNegated()})}run(e){this.resizePart(0,C.RESIZE_INCREMENT,e.get(A),V.EDITOR_PART)}}class Tt extends C{constructor(){super({id:"workbench.action.decreaseViewSize",title:s("decreaseViewSize","Decrease Current View Size"),f1:!0,precondition:x.toNegated()})}run(e){this.resizePart(-C.RESIZE_INCREMENT,-C.RESIZE_INCREMENT,e.get(A))}}class At extends C{constructor(){super({id:"workbench.action.decreaseViewWidth",title:s("decreaseEditorWidth","Decrease Editor Width"),f1:!0,precondition:x.toNegated()})}run(e){this.resizePart(-C.RESIZE_INCREMENT,0,e.get(A),V.EDITOR_PART)}}class Et extends C{constructor(){super({id:"workbench.action.decreaseViewHeight",title:s("decreaseEditorHeight","Decrease Editor Height"),f1:!0,precondition:x.toNegated()})}run(e){this.resizePart(0,-C.RESIZE_INCREMENT,e.get(A),V.EDITOR_PART)}}g(ft),g(St),g(vt),g(Tt),g(At),g(Et);function Vt(r){return r.iconA!==void 0}const Z=(r,e,o,n)=>({id:r,active:e,label:o,visualIcon:n,activeIcon:y.eye,inactiveIcon:y.eyeClosed,activeAriaLabel:t("selectToHide","Select to Hide"),inactiveAriaLabel:t("selectToShow","Select to Show"),useButtons:!0}),R=(r,e,o,n)=>({id:r,active:e,label:o,visualIcon:n,activeIcon:y.check,activeAriaLabel:t("active","Active"),useButtons:!1}),Bt=i.and(ne.toNegated(),i.notEquals("config.window.menuBarVisibility","hidden"),i.notEquals("config.window.menuBarVisibility","toggle"),i.notEquals("config.window.menuBarVisibility","compact")),ee=[];(!Te||!Ae)&&ee.push(Z("workbench.action.toggleMenuBar",Bt,t("menuBar","Menu Bar"),rt)),ee.push(Z(It,i.notEquals("config.workbench.activityBar.location","hidden"),t("activityBar","Activity Bar"),{whenA:i.equals("config.workbench.sideBar.location","left"),iconA:at,iconB:st}),Z(O.ID,z,t("sideBar","Primary Side Bar"),{whenA:i.equals("config.workbench.sideBar.location","left"),iconA:X,iconB:Y}),Z(Ue.ID,Je,t("secondarySideBar","Secondary Side Bar"),{whenA:i.equals("config.workbench.sideBar.location","left"),iconA:Y,iconB:X}),Z(je.ID,Xe,t("panel","Panel"),lt),Z(U.ID,i.equals("config.workbench.statusBar.visible",!0),t("statusBar","Status Bar"),ut));const Re=[R(ie.ID,i.equals("config.workbench.sideBar.location","left"),t("leftSideBar","Left"),X),R(te.ID,i.equals("config.workbench.sideBar.location","right"),t("rightSideBar","Right"),Y)],_e=[R("workbench.action.alignPanelLeft",W.isEqualTo("left"),t("leftPanel","Left"),gt),R("workbench.action.alignPanelRight",W.isEqualTo("right"),t("rightPanel","Right"),mt),R("workbench.action.alignPanelCenter",W.isEqualTo("center"),t("centerPanel","Center"),pt),R("workbench.action.alignPanelJustify",W.isEqualTo("justify"),t("justifyPanel","Justify"),bt)],Ne=[R("workbench.action.toggleFullScreen",ke,t("fullscreen","Full Screen"),wt),R("workbench.action.toggleZenMode",k,t("zenMode","Zen Mode"),yt),R("workbench.action.toggleCenteredLayout",Ce,t("centeredLayout","Centered Layout"),ht)],Oe=new Set;for(const{active:r}of[...ee,...Re,..._e,...Ne])for(const e of r.keys())Oe.add(e);g(class extends h{_currentQuickPick;constructor(){super({id:"workbench.action.customizeLayout",title:s("customizeLayout","Customize Layout..."),f1:!0,icon:De,menu:[{id:p.LayoutControlMenuSubmenu,group:"z_end"},{id:p.LayoutControlMenu,when:i.equals("config.workbench.layoutControl.type","both"),group:"z_end"}]})}getItems(e,o){const n=a=>{const c=a.active.evaluate(e.getContext(null));let m=a.useButtons?a.label:a.label+(c&&a.activeIcon?` $(${a.activeIcon.id})`:!c&&a.inactiveIcon?` $(${a.inactiveIcon.id})`:"");const l=a.label+(c&&a.activeAriaLabel?` (${a.activeAriaLabel})`:!c&&a.inactiveAriaLabel?` (${a.inactiveAriaLabel})`:"");if(a.visualIcon){let u=a.visualIcon;Vt(u)&&(u=u.whenA.evaluate(e.getContext(null))?u.iconA:u.iconB),m=`$(${u.id}) ${m}`}const d=c?a.activeIcon:a.inactiveIcon;return{type:"item",id:a.id,label:m,ariaLabel:l,keybinding:o.lookupKeybinding(a.id,e),buttons:a.useButtons?[{alwaysVisible:!1,tooltip:l,iconClass:d?se.asClassName(d):void 0}]:void 0}};return[{type:"separator",label:t("toggleVisibility","Visibility")},...ee.map(n),{type:"separator",label:t("sideBarPosition","Primary Side Bar Position")},...Re.map(n),{type:"separator",label:t("panelAlignment","Panel Alignment")},..._e.map(n),{type:"separator",label:t("layoutModes","Modes")},...Ne.map(n)]}run(e){if(this._currentQuickPick){this._currentQuickPick.hide();return}const o=e.get(D),n=e.get(Q),a=e.get(Ge),c=e.get(ae),m=e.get(ot),l=new ce,d=l.add(c.createQuickPick({useSeparators:!0}));this._currentQuickPick=d,d.items=this.getItems(n,m),d.ignoreFocusOut=!0,d.hideInput=!0,d.title=t("customizeLayoutQuickPickTitle","Customize Layout");const u={alwaysVisible:!0,iconClass:se.asClassName(y.close),tooltip:t("close","Close")},b={alwaysVisible:!0,iconClass:se.asClassName(y.discard),tooltip:t("restore defaults","Restore Defaults")};d.buttons=[b,u];let P;l.add(n.onDidChangeContext(v=>{v.affectsSome(Oe)&&(d.items=this.getItems(n,m),P&&(d.activeItems=d.items.filter(S=>S.id===P?.id)),setTimeout(()=>c.focus(),0))})),l.add(d.onDidAccept(v=>{d.selectedItems.length&&(P=d.selectedItems[0],a.executeCommand(P.id))})),l.add(d.onDidTriggerItemButton(v=>{v.item&&(P=v.item,a.executeCommand(P.id))})),l.add(d.onDidTriggerButton(v=>{if(v===u)d.hide();else if(v===b){const S=j=>{const H=o.inspect(j);o.updateValue(j,H.defaultValue)};S("workbench.activityBar.location"),S("workbench.sideBar.location"),S("workbench.statusBar.visible"),S("workbench.panel.defaultLocation"),(!Te||!Ae)&&S("window.menuBarVisibility"),a.executeCommand("workbench.action.alignPanelCenter")}})),l.add(d.onDidHide(()=>{d.dispose()})),l.add(d.onDispose(()=>{this._currentQuickPick=void 0,l.dispose()})),d.show()}});export{fe as ConfigureEditorAction,Ie as ConfigureEditorTabsAction,we as EditorActionsDefaultAction,be as EditorActionsTitleBarAction,he as HideEditorActionsAction,de as HideEditorTabsAction,ye as ShowEditorActionsAction,ue as ShowMultipleEditorTabsAction,me as ShowSingleEditorTabAction,It as ToggleActivityBarVisibilityActionId,M as ToggleSidebarPositionAction,U as ToggleStatusbarVisibilityAction,le as ZenHideEditorTabsAction,ge as ZenShowMultipleEditorTabsAction,pe as ZenShowSingleEditorTabAction};
