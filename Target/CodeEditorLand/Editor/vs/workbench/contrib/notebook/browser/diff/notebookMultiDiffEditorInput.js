var m=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var d=(c,r,e,t)=>{for(var o=t>1?void 0:t?S(r,e):r,n=c.length-1,i;n>=0;n--)(i=c[n])&&(o=(t?i(r,e,o):i(o))||o);return t&&o&&m(r,e,o),o},f=(c,r)=>(e,t)=>r(e,t,c);import{URI as p}from"../../../../../../vs/base/common/uri.js";import{ITextModelService as v}from"../../../../../../vs/editor/common/services/resolverService.js";import{ITextResourceConfigurationService as D}from"../../../../../../vs/editor/common/services/textResourceConfiguration.js";import{IInstantiationService as M}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{MultiDiffEditorInput as R}from"../../../../../../vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditorInput.js";import{IMultiDiffSourceResolverService as g}from"../../../../../../vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService.js";import"../../../../../../vs/workbench/contrib/notebook/browser/diff/notebookDiffViewModel.js";import{NotebookDiffEditorInput as x}from"../../../../../../vs/workbench/contrib/notebook/common/notebookDiffEditorInput.js";import{NotebookEditorInput as a}from"../../../../../../vs/workbench/contrib/notebook/common/notebookEditorInput.js";import{ITextFileService as b}from"../../../../../../vs/workbench/services/textfile/common/textfiles.js";const k="multi-cell-notebook-diff-editor";class I extends x{static ID="workbench.input.multiDiffNotebookInput";static create(r,e,t,o,n,i){const u=a.getOrCreate(r,n,void 0,i),l=a.getOrCreate(r,e,void 0,i);return r.createInstance(I,t,o,u,l,i)}}let s=class extends R{constructor(e,t,o,n,i,u,l){super(e,void 0,void 0,!0,o,n,i,u,l);this.notebookDiffViewModel=t;this._register(u.registerResolver(this))}static createInput(e,t){const o=p.parse(`${k}:${new Date().getMilliseconds().toString()+Math.random().toString()}`);return t.createInstance(s,o,e)}canHandleUri(e){return e.toString()===this.multiDiffSource.toString()}async resolveDiffSource(e){return{resources:this.notebookDiffViewModel}}};s=d([f(2,v),f(3,D),f(4,M),f(5,g),f(6,b)],s);export{I as NotebookMultiDiffEditorInput,k as NotebookMultiDiffEditorScheme,s as NotebookMultiDiffEditorWidgetInput};
