import"./media/singleeditortabscontrol.css";import"../../../common/editor/editorInput.js";import{EditorTabsControl as i}from"./editorTabsControl.js";import{Dimension as o}from"../../../../base/browser/dom.js";import"./editorTitleControl.js";import"../../../common/editor.js";class h extends i{activeEditor=null;prepareEditorActions(t){return{primary:[],secondary:[]}}openEditor(t){return this.handleOpenedEditors()}openEditors(t){return this.handleOpenedEditors()}handleOpenedEditors(){const t=this.activeEditorChanged();return this.activeEditor=this.tabsModel.activeEditor,t}activeEditorChanged(){return!!(!this.activeEditor&&this.tabsModel.activeEditor||this.activeEditor&&!this.tabsModel.activeEditor||!this.activeEditor||!this.tabsModel.isActive(this.activeEditor))}beforeCloseEditor(t){}closeEditor(t){this.handleClosedEditors()}closeEditors(t){this.handleClosedEditors()}handleClosedEditors(){this.activeEditor=this.tabsModel.activeEditor}moveEditor(t,e,d){}pinEditor(t){}stickEditor(t){}unstickEditor(t){}setActive(t){}updateEditorSelections(){}updateEditorLabel(t){}updateEditorDirty(t){}getHeight(){return 0}layout(t){return new o(t.container.width,this.getHeight())}}export{h as NoEditorTabsControl};
