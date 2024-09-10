var l=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var p=(s,o,e,t)=>{for(var i=t>1?void 0:t?v(o,e):o,d=s.length-1,a;d>=0;d--)(a=s[d])&&(i=(t?a(o,e,i):a(i))||i);return t&&i&&l(o,e,i),i},r=(s,o)=>(e,t)=>o(e,t,s);import{Event as f}from"../../../../base/common/event.js";import{EditorResourceAccessor as h,SideBySideEditor as I}from"../../../common/editor.js";import{EditorPane as w}from"./editorPane.js";import{IStorageService as m}from"../../../../platform/storage/common/storage.js";import{IInstantiationService as V}from"../../../../platform/instantiation/common/instantiation.js";import{ITelemetryService as b}from"../../../../platform/telemetry/common/telemetry.js";import{IThemeService as g}from"../../../../platform/theme/common/themeService.js";import{ITextResourceConfigurationService as R}from"../../../../editor/common/services/textResourceConfiguration.js";import{IEditorGroupsService as D}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as T}from"../../../services/editor/common/editorService.js";import{MutableDisposable as x}from"../../../../base/common/lifecycle.js";let n=class extends w{constructor(e,t,i,d,a,u,c,S,C,E){super(e,t,d,S,u);this.instantiationService=a;this.textResourceConfigurationService=c;this.editorService=C;this.editorGroupService=E;this.viewState=this.getEditorMemento(E,c,i,100)}viewState;groupListener=this._register(new x);editorViewStateDisposables;setEditorVisible(e){this.groupListener.value=this.group.onWillCloseEditor(t=>this.onWillCloseEditor(t)),super.setEditorVisible(e)}onWillCloseEditor(e){const t=e.editor;t===this.input&&this.updateEditorViewState(t)}clearInput(){this.updateEditorViewState(this.input),super.clearInput()}saveState(){this.updateEditorViewState(this.input),super.saveState()}updateEditorViewState(e){if(!e||!this.tracksEditorViewState(e))return;const t=this.toEditorViewStateResource(e);t&&(this.tracksDisposedEditorViewState()||(this.editorViewStateDisposables||(this.editorViewStateDisposables=new Map),this.editorViewStateDisposables.has(e)||this.editorViewStateDisposables.set(e,f.once(e.onWillDispose)(()=>{this.clearEditorViewState(t,this.group),this.editorViewStateDisposables?.delete(e)}))),e.isDisposed()&&!this.tracksDisposedEditorViewState()||!this.shouldRestoreEditorViewState(e)&&!this.group.contains(e)?this.clearEditorViewState(t,this.group):e.isDisposed()||this.saveEditorViewState(t))}shouldRestoreEditorViewState(e,t){return t?.newInGroup?this.textResourceConfigurationService.getValue(h.getOriginalUri(e,{supportSideBySide:I.PRIMARY}),"workbench.editor.restoreViewState")!==!1:!0}getViewState(){const e=this.input;if(!e||!this.tracksEditorViewState(e))return;const t=this.toEditorViewStateResource(e);if(t)return this.computeEditorViewState(t)}saveEditorViewState(e){const t=this.computeEditorViewState(e);t&&this.viewState.saveEditorState(this.group,e,t)}loadEditorViewState(e,t){if(!e||!this.tracksEditorViewState(e)||!this.shouldRestoreEditorViewState(e,t))return;const i=this.toEditorViewStateResource(e);if(i)return this.viewState.loadEditorState(this.group,i)}moveEditorViewState(e,t,i){return this.viewState.moveEditorState(e,t,i)}clearEditorViewState(e,t){this.viewState.clearEditorState(e,t)}dispose(){if(super.dispose(),this.editorViewStateDisposables){for(const[,e]of this.editorViewStateDisposables)e.dispose();this.editorViewStateDisposables=void 0}}tracksDisposedEditorViewState(){return!1}};n=p([r(3,b),r(4,V),r(5,m),r(6,R),r(7,g),r(8,T),r(9,D)],n);export{n as AbstractEditorWithViewState};
