import{getActiveWindow as I}from"../../../../vs/base/browser/dom.js";import{Direction as u}from"../../../../vs/base/browser/ui/grid/grid.js";import{isAuxiliaryWindow as D}from"../../../../vs/base/browser/window.js";import{KeyCode as f,KeyMod as w}from"../../../../vs/base/common/keyCodes.js";import{localize2 as A}from"../../../../vs/nls.js";import{Categories as P}from"../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as d,registerAction2 as R}from"../../../../vs/platform/actions/common/actions.js";import"../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as l}from"../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import"../../../../vs/workbench/common/composite.js";import"../../../../vs/workbench/common/panecomposite.js";import{ViewContainerLocation as T}from"../../../../vs/workbench/common/views.js";import{GroupDirection as s,GroupLocation as v,IEditorGroupsService as B}from"../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as S}from"../../../../vs/workbench/services/editor/common/editorService.js";import{IWorkbenchLayoutService as g,Parts as e}from"../../../../vs/workbench/services/layout/browser/layoutService.js";import{IPaneCompositePartService as L}from"../../../../vs/workbench/services/panecomposite/browser/panecomposite.js";class p extends d{constructor(i,t){super(i);this.direction=t}run(i){const t=i.get(g),o=i.get(B),r=i.get(L),n=t.hasFocus(e.EDITOR_PART),a=t.hasFocus(e.PANEL_PART),_=t.hasFocus(e.SIDEBAR_PART),m=t.hasFocus(e.AUXILIARYBAR_PART);let c;if(n){if(this.navigateAcrossEditorGroup(this.toGroupDirection(this.direction),o))return;c=t.getVisibleNeighborPart(e.EDITOR_PART,this.direction)}a&&(c=t.getVisibleNeighborPart(e.PANEL_PART,this.direction)),_&&(c=t.getVisibleNeighborPart(e.SIDEBAR_PART,this.direction)),m&&(c=c=t.getVisibleNeighborPart(e.AUXILIARYBAR_PART,this.direction)),c===e.EDITOR_PART?this.navigateBackToEditorGroup(this.toGroupDirection(this.direction),o)||this.navigateToEditorGroup(this.direction===u.Right?v.FIRST:v.LAST,o):c===e.SIDEBAR_PART?this.navigateToSidebar(t,r):c===e.PANEL_PART?this.navigateToPanel(t,r):c===e.AUXILIARYBAR_PART&&this.navigateToAuxiliaryBar(t,r)}async navigateToPanel(i,t){if(!i.isVisible(e.PANEL_PART))return!1;const o=t.getActivePaneComposite(T.Panel);if(!o)return!1;const r=o.getId(),n=await t.openPaneComposite(r,T.Panel,!0);return n||!1}async navigateToSidebar(i,t){if(!i.isVisible(e.SIDEBAR_PART))return!1;const o=t.getActivePaneComposite(T.Sidebar);if(!o)return!1;const r=o.getId();return!!await t.openPaneComposite(r,T.Sidebar,!0)}async navigateToAuxiliaryBar(i,t){if(!i.isVisible(e.AUXILIARYBAR_PART))return!1;const o=t.getActivePaneComposite(T.AuxiliaryBar);if(!o)return!1;const r=o.getId(),n=await t.openPaneComposite(r,T.AuxiliaryBar,!0);return n||!1}navigateAcrossEditorGroup(i,t){return this.doNavigateToEditorGroup({direction:i},t)}navigateToEditorGroup(i,t){return this.doNavigateToEditorGroup({location:i},t)}navigateBackToEditorGroup(i,t){if(!t.activeGroup)return!1;const o=this.toOppositeDirection(i);return t.findGroup({direction:o},t.activeGroup)?!1:(t.activeGroup.focus(),!0)}toGroupDirection(i){switch(i){case u.Down:return s.DOWN;case u.Left:return s.LEFT;case u.Right:return s.RIGHT;case u.Up:return s.UP}}toOppositeDirection(i){switch(i){case s.UP:return s.DOWN;case s.RIGHT:return s.LEFT;case s.LEFT:return s.RIGHT;case s.DOWN:return s.UP}}doNavigateToEditorGroup(i,t){const o=t.findGroup(i,t.activeGroup);return o?(o.focus(),!0):!1}}R(class extends p{constructor(){super({id:"workbench.action.navigateLeft",title:A("navigateLeft","Navigate to the View on the Left"),category:P.View,f1:!0},u.Left)}}),R(class extends p{constructor(){super({id:"workbench.action.navigateRight",title:A("navigateRight","Navigate to the View on the Right"),category:P.View,f1:!0},u.Right)}}),R(class extends p{constructor(){super({id:"workbench.action.navigateUp",title:A("navigateUp","Navigate to the View Above"),category:P.View,f1:!0},u.Up)}}),R(class extends p{constructor(){super({id:"workbench.action.navigateDown",title:A("navigateDown","Navigate to the View Below"),category:P.View,f1:!0},u.Down)}});class h extends d{constructor(i,t){super(i);this.focusNext=t}run(i){const t=i.get(g),o=i.get(S);this.focusNextOrPreviousPart(t,o,this.focusNext)}findVisibleNeighbour(i,t,o){const r=I(),n=D(r);let a;if(n)switch(t){case e.EDITOR_PART:a=e.STATUSBAR_PART;break;default:a=e.EDITOR_PART}else switch(t){case e.EDITOR_PART:a=o?e.PANEL_PART:e.SIDEBAR_PART;break;case e.PANEL_PART:a=o?e.AUXILIARYBAR_PART:e.EDITOR_PART;break;case e.AUXILIARYBAR_PART:a=o?e.STATUSBAR_PART:e.PANEL_PART;break;case e.STATUSBAR_PART:a=o?e.ACTIVITYBAR_PART:e.AUXILIARYBAR_PART;break;case e.ACTIVITYBAR_PART:a=o?e.SIDEBAR_PART:e.STATUSBAR_PART;break;case e.SIDEBAR_PART:a=o?e.EDITOR_PART:e.ACTIVITYBAR_PART;break;default:a=e.EDITOR_PART}return i.isVisible(a,r)||a===e.EDITOR_PART?a:this.findVisibleNeighbour(i,a,o)}focusNextOrPreviousPart(i,t,o){let r;t.activeEditorPane?.hasFocus()||i.hasFocus(e.EDITOR_PART)?r=e.EDITOR_PART:i.hasFocus(e.ACTIVITYBAR_PART)?r=e.ACTIVITYBAR_PART:i.hasFocus(e.STATUSBAR_PART)?r=e.STATUSBAR_PART:i.hasFocus(e.SIDEBAR_PART)?r=e.SIDEBAR_PART:i.hasFocus(e.AUXILIARYBAR_PART)?r=e.AUXILIARYBAR_PART:i.hasFocus(e.PANEL_PART)&&(r=e.PANEL_PART),i.focusPart(r?this.findVisibleNeighbour(i,r,o):e.EDITOR_PART,I())}}R(class extends h{constructor(){super({id:"workbench.action.focusNextPart",title:A("focusNextPart","Focus Next Part"),category:P.View,f1:!0,keybinding:{primary:f.F6,weight:l.WorkbenchContrib}},!0)}}),R(class extends h{constructor(){super({id:"workbench.action.focusPreviousPart",title:A("focusPreviousPart","Focus Previous Part"),category:P.View,f1:!0,keybinding:{primary:w.Shift|f.F6,weight:l.WorkbenchContrib}},!1)}});
