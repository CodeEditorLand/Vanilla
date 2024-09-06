import"./media/panelpart.css";import{Codicon as h}from"../../../../base/common/codicons.js";import{KeyCode as F,KeyMod as J}from"../../../../base/common/keyCodes.js";import"../../../../editor/browser/editorExtensions.js";import{localize as t,localize2 as i}from"../../../../nls.js";import"../../../../platform/action/common/action.js";import{Categories as P}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as f,MenuId as l,MenuRegistry as T,registerAction2 as s}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as m}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as K}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{INotificationService as G}from"../../../../platform/notification/common/notification.js";import{registerIcon as w}from"../../../../platform/theme/common/iconRegistry.js";import{AuxiliaryBarVisibleContext as U,PanelAlignmentContext as M,PanelMaximizedContext as Y,PanelPositionContext as v,PanelVisibleContext as C}from"../../../common/contextkeys.js";import{IViewDescriptorService as W,ViewContainerLocation as c,ViewContainerLocationToString as X}from"../../../common/views.js";import{ActivityBarPosition as j,isHorizontal as $,IWorkbenchLayoutService as A,LayoutSettings as Q,Parts as p,Position as S,positionToString as Z}from"../../../services/layout/browser/layoutService.js";import{IPaneCompositePartService as O}from"../../../services/panecomposite/browser/panecomposite.js";import{IViewsService as ee}from"../../../services/views/common/viewsService.js";const ne=w("panel-maximize",h.chevronUp,t("maximizeIcon","Icon to maximize a panel.")),oe=w("panel-restore",h.chevronDown,t("restoreIcon","Icon to restore a panel.")),D=w("panel-close",h.close,t("closeIcon","Icon to close a panel.")),te=w("panel-layout-icon",h.layoutPanel,t("togglePanelOffIcon","Icon to toggle the panel off when it is on.")),ie=w("panel-layout-icon-off",h.layoutPanelOff,t("togglePanelOnIcon","Icon to toggle the panel on when it is off."));class y extends f{static ID="workbench.action.togglePanel";static LABEL=i("togglePanelVisibility","Toggle Panel Visibility");constructor(){super({id:y.ID,title:y.LABEL,toggled:{condition:C,title:t("toggle panel","Panel"),mnemonicTitle:t({key:"toggle panel mnemonic",comment:["&& denotes a mnemonic"]},"&&Panel")},f1:!0,category:P.View,keybinding:{primary:J.CtrlCmd|F.KeyJ,weight:K.WorkbenchContrib},menu:[{id:l.MenubarAppearanceMenu,group:"2_workbench_layout",order:5},{id:l.LayoutControlMenuSubmenu,group:"0_workbench_layout",order:4}]})}async run(e){const n=e.get(A);n.setPartHidden(n.isVisible(p.PANEL_PART),p.PANEL_PART)}}s(y),s(class extends f{static ID="workbench.action.focusPanel";static LABEL=t("focusPanel","Focus into Panel");constructor(){super({id:"workbench.action.focusPanel",title:i("focusPanel","Focus into Panel"),category:P.View,f1:!0})}async run(o){const e=o.get(A),n=o.get(O);e.isVisible(p.PANEL_PART)||e.setPartHidden(!1,p.PANEL_PART),n.getActivePaneComposite(c.Panel)?.focus()}});const I={LEFT:"workbench.action.positionPanelLeft",RIGHT:"workbench.action.positionPanelRight",BOTTOM:"workbench.action.positionPanelBottom",TOP:"workbench.action.positionPanelTop"},x={LEFT:"workbench.action.alignPanelLeft",RIGHT:"workbench.action.alignPanelRight",CENTER:"workbench.action.alignPanelCenter",JUSTIFY:"workbench.action.alignPanelJustify"};function H(o,e,n,a,r){return{id:o,title:e,shortLabel:n,value:a,when:r}}function b(o,e,n,a){return H(o,e,n,a,v.notEqualsTo(Z(a)))}function L(o,e,n,a){return H(o,e,n,a,M.notEqualsTo(a))}const ae=[b(I.TOP,i("positionPanelTop","Move Panel To Top"),t("positionPanelTopShort","Top"),S.TOP),b(I.LEFT,i("positionPanelLeft","Move Panel Left"),t("positionPanelLeftShort","Left"),S.LEFT),b(I.RIGHT,i("positionPanelRight","Move Panel Right"),t("positionPanelRightShort","Right"),S.RIGHT),b(I.BOTTOM,i("positionPanelBottom","Move Panel To Bottom"),t("positionPanelBottomShort","Bottom"),S.BOTTOM)],re=[L(x.LEFT,i("alignPanelLeft","Set Panel Alignment to Left"),t("alignPanelLeftShort","Left"),"left"),L(x.RIGHT,i("alignPanelRight","Set Panel Alignment to Right"),t("alignPanelRightShort","Right"),"right"),L(x.CENTER,i("alignPanelCenter","Set Panel Alignment to Center"),t("alignPanelCenterShort","Center"),"center"),L(x.JUSTIFY,i("alignPanelJustify","Set Panel Alignment to Justify"),t("alignPanelJustifyShort","Justify"),"justify")];T.appendMenuItem(l.MenubarAppearanceMenu,{submenu:l.PanelPositionMenu,title:t("positionPanel","Panel Position"),group:"3_workbench_layout_move",order:4}),ae.forEach((o,e)=>{const{id:n,title:a,shortLabel:r,value:d,when:g}=o;s(class extends f{constructor(){super({id:n,title:a,category:P.View,f1:!0})}run(u){u.get(A).setPanelPosition(d===void 0?S.BOTTOM:d)}}),T.appendMenuItem(l.PanelPositionMenu,{command:{id:n,title:r,toggled:g.negate()},order:5+e})}),T.appendMenuItem(l.MenubarAppearanceMenu,{submenu:l.PanelAlignmentMenu,title:t("alignPanel","Align Panel"),group:"3_workbench_layout_move",order:5}),re.forEach(o=>{const{id:e,title:n,shortLabel:a,value:r,when:d}=o;s(class extends f{constructor(){super({id:e,title:n,category:P.View,toggled:d.negate(),f1:!0})}run(g){g.get(A).setPanelAlignment(r===void 0?"center":r)}}),T.appendMenuItem(l.PanelAlignmentMenu,{command:{id:e,title:a,toggled:d.negate()},order:5})});class N extends f{constructor(e,n){super({id:e,title:n,category:P.View,f1:!0})}async run(e,n){const a=e.get(O),r=a.getVisiblePaneCompositeIds(c.Panel),d=a.getActivePaneComposite(c.Panel);if(!d)return;let g;for(let u=0;u<r.length;u++)if(r[u]===d.getId()){g=r[(u+r.length+n)%r.length];break}typeof g=="string"&&await a.openPaneComposite(g,c.Panel,!0)}}s(class extends N{constructor(){super("workbench.action.previousPanelView",i("previousPanelView","Previous Panel View"))}run(o){return super.run(o,-1)}}),s(class extends N{constructor(){super("workbench.action.nextPanelView",i("nextPanelView","Next Panel View"))}run(o){return super.run(o,1)}}),s(class extends f{constructor(){super({id:"workbench.action.toggleMaximizedPanel",title:i("toggleMaximizedPanel","Toggle Maximized Panel"),tooltip:t("maximizePanel","Maximize Panel Size"),category:P.View,f1:!0,icon:ne,precondition:m.or(M.isEqualTo("center"),m.and(v.notEqualsTo("bottom"),v.notEqualsTo("top"))),toggled:{condition:Y,icon:oe,tooltip:t("minimizePanel","Restore Panel Size")},menu:[{id:l.PanelTitle,group:"navigation",order:1,when:m.or(M.isEqualTo("center"),m.and(v.notEqualsTo("bottom"),v.notEqualsTo("top")))}]})}run(o){const e=o.get(A),n=o.get(G);if(e.getPanelAlignment()!=="center"&&$(e.getPanelPosition())){n.warn(t("panelMaxNotSupported","Maximizing the panel is only supported when it is center aligned."));return}e.isVisible(p.PANEL_PART)?e.toggleMaximizedPanel():(e.setPartHidden(!1,p.PANEL_PART),e.isPanelMaximized()||e.toggleMaximizedPanel())}}),s(class extends f{constructor(){super({id:"workbench.action.closePanel",title:i("closePanel","Hide Panel"),category:P.View,icon:D,menu:[{id:l.CommandPalette,when:C},{id:l.PanelTitle,group:"navigation",order:2}]})}run(o){o.get(A).setPartHidden(!0,p.PANEL_PART)}}),s(class extends f{constructor(){super({id:"workbench.action.closeAuxiliaryBar",title:i("closeSecondarySideBar","Hide Secondary Side Bar"),category:P.View,icon:D,menu:[{id:l.CommandPalette,when:U},{id:l.AuxiliaryBarTitle,group:"navigation",order:2,when:m.notEquals(`config.${Q.ACTIVITY_BAR_LOCATION}`,j.TOP)}]})}run(o){o.get(A).setPartHidden(!0,p.AUXILIARYBAR_PART)}}),T.appendMenuItems([{id:l.LayoutControlMenu,item:{group:"0_workbench_toggles",command:{id:y.ID,title:t("togglePanel","Toggle Panel"),icon:ie,toggled:{condition:C,icon:te}},when:m.or(m.equals("config.workbench.layoutControl.type","toggles"),m.equals("config.workbench.layoutControl.type","both")),order:1}},{id:l.ViewTitleContext,item:{group:"3_workbench_layout_move",command:{id:y.ID,title:i("hidePanel","Hide Panel")},when:m.and(C,m.equals("viewLocation",X(c.Panel))),order:2}}]);class V extends f{constructor(n,a,r){super(r);this.source=n;this.destination=a}run(n,...a){const r=n.get(W),d=n.get(A),g=n.get(ee),u=r.getViewContainersByLocation(this.source),_=r.getViewContainersByLocation(this.destination);if(u.length){const z=g.getVisibleViewContainer(this.source);u.forEach(q=>r.moveViewContainerToLocation(q,this.destination,void 0,this.desc.id)),d.setPartHidden(!1,this.destination===c.Panel?p.PANEL_PART:p.AUXILIARYBAR_PART),z&&_.length===0&&g.openViewContainer(z.id,!0)}}}class B extends V{static ID="workbench.action.movePanelToSidePanel";constructor(){super(c.Panel,c.AuxiliaryBar,{id:B.ID,title:i("movePanelToSecondarySideBar","Move Panel Views To Secondary Side Bar"),category:P.View,f1:!1})}}class E extends V{static ID="workbench.action.movePanelToSecondarySideBar";constructor(){super(c.Panel,c.AuxiliaryBar,{id:E.ID,title:i("movePanelToSecondarySideBar","Move Panel Views To Secondary Side Bar"),category:P.View,f1:!0})}}s(B),s(E);class R extends V{static ID="workbench.action.moveSidePanelToPanel";constructor(){super(c.AuxiliaryBar,c.Panel,{id:R.ID,title:i("moveSidePanelToPanel","Move Secondary Side Bar Views To Panel"),category:P.View,f1:!1})}}class k extends V{static ID="workbench.action.moveSecondarySideBarToPanel";constructor(){super(c.AuxiliaryBar,c.Panel,{id:k.ID,title:i("moveSidePanelToPanel","Move Secondary Side Bar Views To Panel"),category:P.View,f1:!0})}}s(R),s(k);export{E as MovePanelToSecondarySideBarAction,k as MoveSecondarySideBarToPanelAction,y as TogglePanelAction};
