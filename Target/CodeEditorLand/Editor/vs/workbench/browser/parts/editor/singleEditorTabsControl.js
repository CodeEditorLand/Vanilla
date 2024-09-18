import"./media/singleeditortabscontrol.css";import{EditorResourceAccessor as b,Verbosity as n,SideBySideEditor as v,preventEditorClose as E,EditorCloseMethod as m}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import{EditorTabsControl as g}from"./editorTabsControl.js";import{ResourceLabel as f}from"../../labels.js";import{TAB_ACTIVE_FOREGROUND as C,TAB_UNFOCUSED_ACTIVE_FOREGROUND as I}from"../../../common/theme.js";import{EventType as u,Gesture as L}from"../../../../base/browser/touch.js";import{addDisposableListener as s,EventType as d,EventHelper as l,Dimension as T,isAncestor as w,DragAndDropObserver as A,isHTMLElement as D}from"../../../../base/browser/dom.js";import{CLOSE_EDITOR_COMMAND_ID as y,UNLOCK_GROUP_COMMAND_ID as M}from"./editorCommands.js";import{Color as O}from"../../../../base/common/color.js";import{assertIsDefined as p,assertAllDefined as S}from"../../../../base/common/types.js";import{equals as _}from"../../../../base/common/objects.js";import{toDisposable as B}from"../../../../base/common/lifecycle.js";import{defaultBreadcrumbsWidgetStyles as V}from"../../../../platform/theme/browser/defaultStyles.js";import"./editorTitleControl.js";import{BreadcrumbsControlFactory as H}from"./breadcrumbsControl.js";class ot extends g{titleContainer;editorLabel;activeLabel=Object.create(null);breadcrumbsControlFactory;get breadcrumbsControl(){return this.breadcrumbsControlFactory?.control}create(t){super.create(t);const e=this.titleContainer=t;e.draggable=!0,this.registerContainerListeners(e),this._register(L.addTarget(e));const r=document.createElement("div");r.classList.add("label-container"),e.appendChild(r),this.editorLabel=this._register(this.instantiationService.createInstance(f,r,{hoverDelegate:this.getHoverDelegate()})).element,this._register(s(this.editorLabel.element,d.CLICK,i=>this.onTitleLabelClick(i))),this.breadcrumbsControlFactory=this._register(this.instantiationService.createInstance(H,r,this.groupView,{showFileIcons:!1,showSymbolIcons:!0,showDecorationColors:!1,widgetStyles:{...V,breadcrumbsBackground:O.transparent.toString()},showPlaceholder:!1})),this._register(this.breadcrumbsControlFactory.onDidEnablementChange(()=>this.handleBreadcrumbsEnablementChange())),e.classList.toggle("breadcrumbs",!!this.breadcrumbsControl),this._register(B(()=>e.classList.remove("breadcrumbs"))),this.createEditorActionsToolBar(e,["title-actions"])}registerContainerListeners(t){let e,r=!1;this._register(new A(t,{onDragStart:i=>{r=this.onGroupDragStart(i,t)},onDrag:i=>{e=i},onDragEnd:i=>{this.onGroupDragEnd(i,e,t,r)}})),this._register(s(t,d.DBLCLICK,i=>this.onTitleDoubleClick(i))),this._register(s(t,d.AUXCLICK,i=>this.onTitleAuxClick(i))),this._register(s(t,u.Tap,i=>this.onTitleTap(i)));for(const i of[d.CONTEXT_MENU,u.Contextmenu])this._register(s(t,i,o=>{this.tabsModel.activeEditor&&this.onTabContextMenu(this.tabsModel.activeEditor,o,t)}))}onTitleLabelClick(t){l.stop(t,!1),setTimeout(()=>this.quickInputService.quickAccess.show())}onTitleDoubleClick(t){l.stop(t),this.groupView.pinEditor()}onTitleAuxClick(t){t.button===1&&this.tabsModel.activeEditor&&(l.stop(t,!0),E(this.tabsModel,this.tabsModel.activeEditor,m.MOUSE,this.groupsView.partOptions)||this.groupView.closeEditor(this.tabsModel.activeEditor))}onTitleTap(t){const e=t.initialTarget;!D(e)||!this.editorLabel||!w(e,this.editorLabel.element)||setTimeout(()=>this.quickInputService.quickAccess.show(),50)}openEditor(t){return this.doHandleOpenEditor()}openEditors(t){return this.doHandleOpenEditor()}doHandleOpenEditor(){const t=this.ifActiveEditorChanged(()=>this.redraw());return t||this.ifActiveEditorPropertiesChanged(()=>this.redraw()),t}beforeCloseEditor(t){}closeEditor(t){this.ifActiveEditorChanged(()=>this.redraw())}closeEditors(t){this.ifActiveEditorChanged(()=>this.redraw())}moveEditor(t,e,r){this.ifActiveEditorChanged(()=>this.redraw())}pinEditor(t){this.ifEditorIsActive(t,()=>this.redraw())}stickEditor(t){}unstickEditor(t){}setActive(t){this.redraw()}updateEditorSelections(){}updateEditorLabel(t){this.ifEditorIsActive(t,()=>this.redraw())}updateEditorDirty(t){this.ifEditorIsActive(t,()=>{const e=p(this.titleContainer);t.isDirty()&&!t.isSaving()?e.classList.add("dirty"):e.classList.remove("dirty")})}updateOptions(t,e){super.updateOptions(t,e),(t.labelFormat!==e.labelFormat||!_(t.decorations,e.decorations))&&this.redraw()}updateStyles(){this.redraw()}handleBreadcrumbsEnablementChange(){p(this.titleContainer).classList.toggle("breadcrumbs",!!this.breadcrumbsControl),this.redraw()}ifActiveEditorChanged(t){return!this.activeLabel.editor&&this.tabsModel.activeEditor||this.activeLabel.editor&&!this.tabsModel.activeEditor||!this.activeLabel.editor||!this.tabsModel.isActive(this.activeLabel.editor)?(t(),!0):!1}ifActiveEditorPropertiesChanged(t){!this.activeLabel.editor||!this.tabsModel.activeEditor||this.activeLabel.pinned!==this.tabsModel.isPinned(this.tabsModel.activeEditor)&&t()}ifEditorIsActive(t,e){this.tabsModel.isActive(t)&&e()}redraw(){const t=this.tabsModel.activeEditor??void 0,e=this.groupsView.partOptions,r=t?this.tabsModel.isPinned(t):!1,i=this.groupsView.activeGroup===this.groupView;this.activeLabel={editor:t,pinned:r},this.breadcrumbsControl&&(i?(this.breadcrumbsControl.update(),this.breadcrumbsControl.domNode.classList.toggle("preview",!r)):this.breadcrumbsControl.hide());const[o,c]=S(this.titleContainer,this.editorLabel);if(!t)o.classList.remove("dirty"),c.clear(),this.clearEditorActionsToolbar();else{this.updateEditorDirty(t);const{labelFormat:h}=this.groupsView.partOptions;let a;this.breadcrumbsControl&&!this.breadcrumbsControl.isHidden()||h==="default"&&!i?a="":a=t.getDescription(this.getVerbosity(h))||"",c.setResource({resource:b.getOriginalUri(t,{supportSideBySide:v.BOTH}),name:t.getName(),description:a},{title:this.getHoverTitle(t),italic:!r,extraClasses:["single-tab","title-label"].concat(t.getLabelExtraClasses()),fileDecorations:{colors:!!e.decorations?.colors,badges:!!e.decorations?.badges},icon:t.getIcon(),hideIcon:e.showIcons===!1}),i?o.style.color=this.getColor(C)||"":o.style.color=this.getColor(I)||"",this.updateEditorActionsToolbar()}}getVerbosity(t){switch(t){case"short":return n.SHORT;case"long":return n.LONG;default:return n.MEDIUM}}prepareEditorActions(t){return this.groupsView.activeGroup===this.groupView?t:{primary:this.groupsView.partOptions.alwaysShowEditorActions?t.primary:t.primary.filter(r=>r.id===y||r.id===M),secondary:t.secondary}}getHeight(){return this.tabHeight}layout(t){return this.breadcrumbsControl?.layout(void 0),new T(t.container.width,this.getHeight())}}export{ot as SingleEditorTabsControl};
