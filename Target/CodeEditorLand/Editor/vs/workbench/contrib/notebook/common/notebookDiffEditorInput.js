var h=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var a=(n,r,e,i)=>{for(var o=i>1?void 0:i?p(r,e):r,t=n.length-1,s;t>=0;t--)(s=n[t])&&(o=(i?s(r,e,o):s(o))||o);return i&&o&&h(r,e,o),o},c=(n,r)=>(e,i)=>r(e,i,n);import"../../../../../vs/base/common/uri.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{isResourceDiffEditorInput as v}from"../../../../../vs/workbench/common/editor.js";import{DiffEditorInput as g}from"../../../../../vs/workbench/common/editor/diffEditorInput.js";import"../../../../../vs/workbench/common/editor/editorInput.js";import{EditorModel as I}from"../../../../../vs/workbench/common/editor/editorModel.js";import"../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{NotebookEditorInput as f}from"../../../../../vs/workbench/contrib/notebook/common/notebookEditorInput.js";import{IEditorService as M}from"../../../../../vs/workbench/services/editor/common/editorService.js";class E extends I{constructor(e,i){super();this.original=e;this.modified=i}}let d=class extends g{constructor(e,i,o,t,s,l){super(e,i,o,t,void 0,l);this.original=o;this.modified=t;this.viewType=s}static create(e,i,o,t,s,l){const u=f.getOrCreate(e,s,void 0,l),m=f.getOrCreate(e,i,void 0,l);return e.createInstance(d,o,t,u,m,l)}static ID="workbench.input.diffNotebookInput";_modifiedTextModel=null;_originalTextModel=null;get resource(){return this.modified.resource}get editorId(){return this.viewType}_cachedModel=void 0;get typeId(){return d.ID}async resolve(){const[e,i]=await Promise.all([this.original.resolve(),this.modified.resolve()]);if(this._cachedModel?.dispose(),!i)throw new Error(`Fail to resolve modified editor model for resource ${this.modified.resource} with notebookType ${this.viewType}`);if(!e)throw new Error(`Fail to resolve original editor model for resource ${this.original.resource} with notebookType ${this.viewType}`);return this._originalTextModel=e,this._modifiedTextModel=i,this._cachedModel=new E(this._originalTextModel,this._modifiedTextModel),this._cachedModel}toUntyped(){const e={resource:this.original.resource},i={resource:this.resource};return{original:e,modified:i,primary:i,secondary:e,options:{override:this.viewType}}}matches(e){return this===e?!0:e instanceof d?this.modified.matches(e.modified)&&this.original.matches(e.original)&&this.viewType===e.viewType:v(e)?this.modified.matches(e.modified)&&this.original.matches(e.original)&&this.editorId!==void 0&&(this.editorId===e.options?.override||e.options?.override===void 0):!1}dispose(){super.dispose(),this._cachedModel?.dispose(),this._cachedModel=void 0,this.original.dispose(),this.modified.dispose(),this._originalTextModel=null,this._modifiedTextModel=null}};d=a([c(5,M)],d);export{d as NotebookDiffEditorInput};
