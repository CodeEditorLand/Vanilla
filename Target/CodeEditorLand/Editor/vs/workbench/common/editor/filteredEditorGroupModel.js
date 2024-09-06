import{Emitter as u}from"../../../../vs/base/common/event.js";import{Disposable as l}from"../../../../vs/base/common/lifecycle.js";import{EditorsOrder as o}from"../../../../vs/workbench/common/editor.js";import"../../../../vs/workbench/common/editor/editorGroupModel.js";import"../../../../vs/workbench/common/editor/editorInput.js";class d extends l{constructor(t){super();this.model=t;this._register(this.model.onDidModelChange(i=>{const r=i.editorIndex??i.editor;r!==void 0&&!this.filter(r)||this._onDidModelChange.fire(i)}))}_onDidModelChange=this._register(new u);onDidModelChange=this._onDidModelChange.event;get id(){return this.model.id}get isLocked(){return this.model.isLocked}get stickyCount(){return this.model.stickyCount}get activeEditor(){return this.model.activeEditor&&this.filter(this.model.activeEditor)?this.model.activeEditor:null}get previewEditor(){return this.model.previewEditor&&this.filter(this.model.previewEditor)?this.model.previewEditor:null}get selectedEditors(){return this.model.selectedEditors.filter(t=>this.filter(t))}isPinned(t){return this.model.isPinned(t)}isTransient(t){return this.model.isTransient(t)}isSticky(t){return this.model.isSticky(t)}isActive(t){return this.model.isActive(t)}isSelected(t){return this.model.isSelected(t)}isFirst(t){return this.model.isFirst(t,this.getEditors(o.SEQUENTIAL))}isLast(t){return this.model.isLast(t,this.getEditors(o.SEQUENTIAL))}getEditors(t,i){return this.model.getEditors(t,i).filter(s=>this.filter(s))}findEditor(t,i){const r=this.model.findEditor(t,i);if(r)return this.filter(r[1])?r:void 0}}class x extends d{get count(){return this.model.stickyCount}getEditors(e,t){return t?.excludeSticky?[]:e===o.SEQUENTIAL?this.model.getEditors(o.SEQUENTIAL).slice(0,this.model.stickyCount):super.getEditors(e,t)}isSticky(e){return!0}getEditorByIndex(e){return e<this.count?this.model.getEditorByIndex(e):void 0}indexOf(e,t,i){const r=this.model.indexOf(e,t,i);return r<0||r>=this.model.stickyCount?-1:r}contains(e,t){const i=this.model.indexOf(e,void 0,t);return i>=0&&i<this.model.stickyCount}filter(e){return this.model.isSticky(e)}}class k extends d{get count(){return this.model.count-this.model.stickyCount}get stickyCount(){return 0}isSticky(e){return!1}getEditors(e,t){return e===o.SEQUENTIAL?this.model.getEditors(o.SEQUENTIAL).slice(this.model.stickyCount):super.getEditors(e,t)}getEditorByIndex(e){return e>=0?this.model.getEditorByIndex(e+this.model.stickyCount):void 0}indexOf(e,t,i){const r=this.model.indexOf(e,t,i);return r<this.model.stickyCount||r>=this.model.count?-1:r-this.model.stickyCount}contains(e,t){const i=this.model.indexOf(e,void 0,t);return i>=this.model.stickyCount&&i<this.model.count}filter(e){return!this.model.isSticky(e)}}export{x as StickyEditorGroupModel,k as UnstickyEditorGroupModel};