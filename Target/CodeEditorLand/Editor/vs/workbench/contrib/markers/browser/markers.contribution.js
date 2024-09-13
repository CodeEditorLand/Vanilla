var q=Object.defineProperty;var $=Object.getOwnPropertyDescriptor;var k=(s,r,i,t)=>{for(var a=t>1?void 0:t?$(r,i):r,d=s.length-1,n;d>=0;d--)(n=s[d])&&(a=(t?n(r,i,a):n(a))||a);return t&&a&&q(r,i,a),a},p=(s,r)=>(i,t)=>r(i,t,s);import"./markersFileDecorations.js";import{ContextKeyExpr as m}from"../../../../platform/contextkey/common/contextkey.js";import{Extensions as U}from"../../../../platform/configuration/common/configurationRegistry.js";import{Categories as H}from"../../../../platform/action/common/actionCommonCategories.js";import{KeybindingsRegistry as v,KeybindingWeight as g}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{KeyCode as u,KeyMod as w}from"../../../../base/common/keyCodes.js";import{localize as o,localize2 as M}from"../../../../nls.js";import{Marker as C,RelatedInformation as Y,ResourceMarkers as j}from"./markersModel.js";import{MarkersView as z}from"./markersView.js";import{MenuId as _,registerAction2 as c,Action2 as W}from"../../../../platform/actions/common/actions.js";import{Registry as h}from"../../../../platform/registry/common/platform.js";import{MarkersViewMode as A,Markers as e,MarkersContextKeys as l}from"../common/markers.js";import E from"./messages.js";import{Extensions as Q}from"../../../common/contributions.js";import"./markers.js";import{LifecyclePhase as P}from"../../../services/lifecycle/common/lifecycle.js";import{IClipboardService as K}from"../../../../platform/clipboard/common/clipboardService.js";import{Disposable as T,MutableDisposable as X}from"../../../../base/common/lifecycle.js";import{IStatusbarService as J,StatusbarAlignment as D}from"../../../services/statusbar/browser/statusbar.js";import{IMarkerService as O}from"../../../../platform/markers/common/markers.js";import{Extensions as x,ViewContainerLocation as Z}from"../../../common/views.js";import{IViewsService as S}from"../../../services/views/common/viewsService.js";import{getVisbileViewContextKey as F,FocusedViewContext as N}from"../../../common/contextkeys.js";import{ViewPaneContainer as ee}from"../../../browser/parts/views/viewPaneContainer.js";import{SyncDescriptor as L}from"../../../../platform/instantiation/common/descriptors.js";import"../../../../platform/instantiation/common/instantiation.js";import{Codicon as y}from"../../../../base/common/codicons.js";import{registerIcon as re}from"../../../../platform/theme/common/iconRegistry.js";import{ViewAction as I}from"../../../browser/parts/views/viewPane.js";import{IActivityService as ie,NumberBadge as se}from"../../../services/activity/common/activity.js";import{viewFilterSubmenu as V}from"../../../browser/parts/views/viewFilter.js";import{IConfigurationService as te}from"../../../../platform/configuration/common/configuration.js";import{problemsConfigurationNodeBase as oe}from"../../../common/configuration.js";v.registerCommandAndKeybindingRule({id:e.MARKER_OPEN_ACTION_ID,weight:g.WorkbenchContrib,when:m.and(l.MarkerFocusContextKey),primary:u.Enter,mac:{primary:u.Enter,secondary:[w.CtrlCmd|u.DownArrow]},handler:(s,r)=>{const i=s.get(S).getActiveViewWithId(e.MARKERS_VIEW_ID);i.openFileAtElement(i.getFocusElement(),!1,!1,!0)}}),v.registerCommandAndKeybindingRule({id:e.MARKER_OPEN_SIDE_ACTION_ID,weight:g.WorkbenchContrib,when:m.and(l.MarkerFocusContextKey),primary:w.CtrlCmd|u.Enter,mac:{primary:w.WinCtrl|u.Enter},handler:(s,r)=>{const i=s.get(S).getActiveViewWithId(e.MARKERS_VIEW_ID);i.openFileAtElement(i.getFocusElement(),!1,!0,!0)}}),v.registerCommandAndKeybindingRule({id:e.MARKER_SHOW_PANEL_ID,weight:g.WorkbenchContrib,when:void 0,primary:void 0,handler:async(s,r)=>{await s.get(S).openView(e.MARKERS_VIEW_ID)}}),v.registerCommandAndKeybindingRule({id:e.MARKER_SHOW_QUICK_FIX,weight:g.WorkbenchContrib,when:l.MarkerFocusContextKey,primary:w.CtrlCmd|u.Period,handler:(s,r)=>{const i=s.get(S).getActiveViewWithId(e.MARKERS_VIEW_ID),t=i.getFocusElement();t instanceof C&&i.showQuickFixes(t)}}),h.as(U.Configuration).registerConfiguration({...oe,properties:{"problems.autoReveal":{description:E.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL,type:"boolean",default:!0},"problems.defaultViewMode":{description:E.PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE,type:"string",default:"tree",enum:["table","tree"]},"problems.showCurrentInStatus":{description:E.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS,type:"boolean",default:!1},"problems.sortOrder":{description:E.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER,type:"string",default:"severity",enum:["severity","position"],enumDescriptions:[E.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY,E.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION]}}});const G=re("markers-view-icon",y.warning,o("markersViewIcon","View icon of the markers view.")),ne=h.as(x.ViewContainersRegistry).registerViewContainer({id:e.MARKERS_CONTAINER_ID,title:E.MARKERS_PANEL_TITLE_PROBLEMS,icon:G,hideIfEmpty:!0,order:0,ctorDescriptor:new L(ee,[e.MARKERS_CONTAINER_ID,{mergeViewWithContainerWhenSingleView:!0}]),storageId:e.MARKERS_VIEW_STORAGE_ID},Z.Panel,{doNotRegisterOpenCommand:!0});h.as(x.ViewsRegistry).registerViews([{id:e.MARKERS_VIEW_ID,containerIcon:G,name:E.MARKERS_PANEL_TITLE_PROBLEMS,canToggleVisibility:!1,canMoveView:!0,ctorDescriptor:new L(z),openCommandActionDescriptor:{id:"workbench.actions.view.problems",mnemonicTitle:o({key:"miMarker",comment:["&& denotes a mnemonic"]},"&&Problems"),keybindings:{primary:w.CtrlCmd|w.Shift|u.KeyM},order:0}}],ne);const B=h.as(Q.Workbench);c(class extends I{constructor(){super({id:`workbench.actions.table.${e.MARKERS_VIEW_ID}.viewAsTree`,title:o("viewAsTree","View as Tree"),menu:{id:_.ViewTitle,when:m.and(m.equals("view",e.MARKERS_VIEW_ID),l.MarkersViewModeContextKey.isEqualTo(A.Table)),group:"navigation",order:3},icon:y.listTree,viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.setViewMode(A.Tree)}}),c(class extends I{constructor(){super({id:`workbench.actions.table.${e.MARKERS_VIEW_ID}.viewAsTable`,title:o("viewAsTable","View as Table"),menu:{id:_.ViewTitle,when:m.and(m.equals("view",e.MARKERS_VIEW_ID),l.MarkersViewModeContextKey.isEqualTo(A.Tree)),group:"navigation",order:3},icon:y.listFlat,viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.setViewMode(A.Table)}}),c(class extends I{constructor(){super({id:`workbench.actions.${e.MARKERS_VIEW_ID}.toggleErrors`,title:o("show errors","Show Errors"),category:o("problems","Problems"),toggled:l.ShowErrorsFilterContextKey,menu:{id:V,group:"1_filter",when:m.equals("view",e.MARKERS_VIEW_ID),order:1},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.filters.showErrors=!r.filters.showErrors}}),c(class extends I{constructor(){super({id:`workbench.actions.${e.MARKERS_VIEW_ID}.toggleWarnings`,title:o("show warnings","Show Warnings"),category:o("problems","Problems"),toggled:l.ShowWarningsFilterContextKey,menu:{id:V,group:"1_filter",when:m.equals("view",e.MARKERS_VIEW_ID),order:2},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.filters.showWarnings=!r.filters.showWarnings}}),c(class extends I{constructor(){super({id:`workbench.actions.${e.MARKERS_VIEW_ID}.toggleInfos`,title:o("show infos","Show Infos"),category:o("problems","Problems"),toggled:l.ShowInfoFilterContextKey,menu:{id:V,group:"1_filter",when:m.equals("view",e.MARKERS_VIEW_ID),order:3},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.filters.showInfos=!r.filters.showInfos}}),c(class extends I{constructor(){super({id:`workbench.actions.${e.MARKERS_VIEW_ID}.toggleActiveFile`,title:o("show active file","Show Active File Only"),category:o("problems","Problems"),toggled:l.ShowActiveFileFilterContextKey,menu:{id:V,group:"2_filter",when:m.equals("view",e.MARKERS_VIEW_ID),order:1},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.filters.activeFile=!r.filters.activeFile}}),c(class extends I{constructor(){super({id:`workbench.actions.${e.MARKERS_VIEW_ID}.toggleExcludedFiles`,title:o("show excluded files","Show Excluded Files"),category:o("problems","Problems"),toggled:l.ShowExcludedFilesFilterContextKey.negate(),menu:{id:V,group:"2_filter",when:m.equals("view",e.MARKERS_VIEW_ID),order:2},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.filters.excludedFiles=!r.filters.excludedFiles}}),c(class extends W{constructor(){super({id:"workbench.action.problems.focus",title:E.MARKERS_PANEL_SHOW_LABEL,category:H.View,f1:!0})}async run(s){s.get(S).openView(e.MARKERS_VIEW_ID,!0)}}),c(class extends I{constructor(){const s=m.and(N.isEqualTo(e.MARKERS_VIEW_ID),l.MarkersTreeVisibilityContextKey,l.RelatedInformationFocusContextKey.toNegated());super({id:e.MARKER_COPY_ACTION_ID,title:M("copyMarker","Copy"),menu:{id:_.ProblemsPanelContext,when:s,group:"navigation"},keybinding:{weight:g.WorkbenchContrib,primary:w.CtrlCmd|u.KeyC,when:s},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){const i=s.get(K),t=r.getFocusedSelectedElements()||r.getAllResourceMarkers(),a=[],d=n=>{a.includes(n)||a.push(n)};for(const n of t)n instanceof j?n.markers.forEach(d):n instanceof C&&d(n);a.length&&await i.writeText(`[${a}]`)}}),c(class extends I{constructor(){super({id:e.MARKER_COPY_MESSAGE_ACTION_ID,title:M("copyMessage","Copy Message"),menu:{id:_.ProblemsPanelContext,when:l.MarkerFocusContextKey,group:"navigation"},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){const i=s.get(K),t=r.getFocusElement();t instanceof C&&await i.writeText(t.marker.message)}}),c(class extends I{constructor(){super({id:e.RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID,title:M("copyMessage","Copy Message"),menu:{id:_.ProblemsPanelContext,when:l.RelatedInformationFocusContextKey,group:"navigation"},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){const i=s.get(K),t=r.getFocusElement();t instanceof Y&&await i.writeText(t.raw.message)}}),c(class extends I{constructor(){super({id:e.FOCUS_PROBLEMS_FROM_FILTER,title:o("focusProblemsList","Focus problems view"),keybinding:{when:l.MarkerViewFilterFocusContextKey,weight:g.WorkbenchContrib,primary:w.CtrlCmd|u.DownArrow},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.focus()}}),c(class extends I{constructor(){super({id:e.MARKERS_VIEW_FOCUS_FILTER,title:o("focusProblemsFilter","Focus problems filter"),keybinding:{when:N.isEqualTo(e.MARKERS_VIEW_ID),weight:g.WorkbenchContrib,primary:w.CtrlCmd|u.KeyF},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.focusFilter()}}),c(class extends I{constructor(){super({id:e.MARKERS_VIEW_SHOW_MULTILINE_MESSAGE,title:M("show multiline","Show message in multiple lines"),category:o("problems","Problems"),menu:{id:_.CommandPalette,when:m.has(F(e.MARKERS_VIEW_ID))},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.setMultiline(!0)}}),c(class extends I{constructor(){super({id:e.MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE,title:M("show singleline","Show message in single line"),category:o("problems","Problems"),menu:{id:_.CommandPalette,when:m.has(F(e.MARKERS_VIEW_ID))},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.setMultiline(!1)}}),c(class extends I{constructor(){super({id:e.MARKERS_VIEW_CLEAR_FILTER_TEXT,title:o("clearFiltersText","Clear filters text"),category:o("problems","Problems"),keybinding:{when:l.MarkerViewFilterFocusContextKey,weight:g.WorkbenchContrib,primary:u.Escape},viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){r.clearFilterText()}}),c(class extends I{constructor(){super({id:`workbench.actions.treeView.${e.MARKERS_VIEW_ID}.collapseAll`,title:o("collapseAll","Collapse All"),menu:{id:_.ViewTitle,when:m.and(m.equals("view",e.MARKERS_VIEW_ID),l.MarkersViewModeContextKey.isEqualTo(A.Tree)),group:"navigation",order:2},icon:y.collapseAll,viewId:e.MARKERS_VIEW_ID})}async runInView(s,r){return r.collapseAll()}}),c(class extends W{constructor(){super({id:e.TOGGLE_MARKERS_VIEW_ACTION_ID,title:E.MARKERS_PANEL_TOGGLE_LABEL})}async run(s){const r=s.get(S);r.isViewVisible(e.MARKERS_VIEW_ID)?r.closeView(e.MARKERS_VIEW_ID):r.openView(e.MARKERS_VIEW_ID,!0)}});let b=class extends T{constructor(i,t,a){super();this.markerService=i;this.statusbarService=t;this.configurationService=a;this.markersStatusItem=this._register(this.statusbarService.addEntry(this.getMarkersItem(),"status.problems",D.LEFT,50));const d=()=>{this.markersStatusItemOff=this.statusbarService.addEntry(this.getMarkersItemTurnedOff(),"status.problemsVisibility",D.LEFT,49)};let n=this.configurationService.getValue("problems.visibility");n||d(),this._register(this.markerService.onMarkerChanged(()=>{this.markersStatusItem.update(this.getMarkersItem())})),this._register(this.configurationService.onDidChangeConfiguration(R=>{R.affectsConfiguration("problems.visibility")&&(this.markersStatusItem.update(this.getMarkersItem()),n=this.configurationService.getValue("problems.visibility"),!n&&!this.markersStatusItemOff?d():n&&this.markersStatusItemOff&&(this.markersStatusItemOff.dispose(),this.markersStatusItemOff=void 0))}))}markersStatusItem;markersStatusItemOff;getMarkersItem(){const i=this.markerService.getStatistics(),t=this.getMarkersTooltip(i);return{name:o("status.problems","Problems"),text:this.getMarkersText(i),ariaLabel:t,tooltip:t,command:"workbench.actions.view.toggleProblems"}}getMarkersItemTurnedOff(){this.statusbarService.updateEntryVisibility("status.problemsVisibility",!0);const i="workbench.action.openSettings",t="@id:problems.visibility",a=o("status.problemsVisibilityOff","Problems are turned off. Click to open settings.");return{name:o("status.problemsVisibility","Problems Visibility"),text:"$(whole-word)",ariaLabel:a,tooltip:a,kind:"warning",command:{title:i,arguments:[t],id:i}}}getMarkersTooltip(i){const t=R=>o("totalErrors","Errors: {0}",R),a=R=>o("totalWarnings","Warnings: {0}",R),d=R=>o("totalInfos","Infos: {0}",R),n=[];return i.errors>0&&n.push(t(i.errors)),i.warnings>0&&n.push(a(i.warnings)),i.infos>0&&n.push(d(i.infos)),n.length===0?o("noProblems","No Problems"):n.join(", ")}getMarkersText(i){const t=[];return t.push("$(error) "+this.packNumber(i.errors)),t.push("$(warning) "+this.packNumber(i.warnings)),i.infos>0&&t.push("$(info) "+this.packNumber(i.infos)),t.join(" ")}packNumber(i){const t=o("manyProblems","10K+");return i>9999?t:i>999?i.toString().charAt(0)+"K":i.toString()}};b=k([p(0,O),p(1,J),p(2,te)],b),B.registerWorkbenchContribution(b,P.Restored);let f=class extends T{constructor(i,t){super();this.activityService=i;this.markerService=t;this._register(this.markerService.onMarkerChanged(()=>this.updateBadge())),this.updateBadge()}activity=this._register(new X);updateBadge(){const{errors:i,warnings:t,infos:a}=this.markerService.getStatistics(),d=i+t+a;if(d>0){const n=o("totalProblems","Total {0} Problems",d);this.activity.value=this.activityService.showViewActivity(e.MARKERS_VIEW_ID,{badge:new se(d,()=>n)})}else this.activity.value=void 0}};f=k([p(0,ie),p(1,O)],f),B.registerWorkbenchContribution(f,P.Restored);
