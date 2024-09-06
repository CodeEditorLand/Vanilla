var I=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var m=(d,i,e,t)=>{for(var o=t>1?void 0:t?b(i,e):i,r=d.length-1,s;r>=0;r--)(s=d[r])&&(o=(t?s(i,e,o):s(o))||o);return t&&o&&I(i,e,o),o},p=(d,i)=>(e,t)=>i(e,t,d);import{groupBy as E}from"../../../../base/common/arrays.js";import"../../../../base/common/cancellation.js";import{compare as S}from"../../../../base/common/strings.js";import{isObject as v}from"../../../../base/common/types.js";import{URI as y}from"../../../../base/common/uri.js";import{ResourceEdit as R}from"../../../../editor/browser/services/bulkEditService.js";import"../../../../editor/common/languages.js";import"../../../../platform/progress/common/progress.js";import"../../../../platform/undoRedo/common/undoRedo.js";import{IEditorService as h}from"../../../services/editor/common/editorService.js";import{getNotebookEditorFromEditorPane as g}from"../../notebook/browser/notebookBrowser.js";import{CellUri as f,SelectionStateType as U}from"../../notebook/common/notebookCommon.js";import{INotebookEditorModelResolverService as C}from"../../notebook/common/notebookEditorModelResolverService.js";class a extends R{constructor(e,t,o=void 0,r){super(r);this.resource=e;this.cellEdit=t;this.notebookVersionId=o}static is(e){return e instanceof a?!0:y.isUri(e.resource)&&v(e.cellEdit)}static lift(e){return e instanceof a?e:new a(e.resource,e.cellEdit,e.notebookVersionId,e.metadata)}}let l=class{constructor(i,e,t,o,r,s,u){this._undoRedoGroup=i;this._progress=t;this._token=o;this._edits=r;this._editorService=s;this._notebookModelService=u;this._edits=this._edits.map(n=>{if(n.resource.scheme===f.scheme){const c=f.parse(n.resource)?.notebook;if(!c)throw new Error(`Invalid notebook URI: ${n.resource}`);return new a(c,n.cellEdit,n.notebookVersionId,n.metadata)}else return n})}async apply(){const i=[],e=E(this._edits,(t,o)=>S(t.resource.toString(),o.resource.toString()));for(const t of e){if(this._token.isCancellationRequested)break;const[o]=t,r=await this._notebookModelService.resolve(o.resource);if(typeof o.notebookVersionId=="number"&&r.object.notebook.versionId!==o.notebookVersionId)throw r.dispose(),new Error(`Notebook '${o.resource}' has changed in the meantime`);const s=t.map(k=>k.cellEdit),u=!r.object.isReadonly(),n=g(this._editorService.activeEditorPane),c=n?.textModel?.uri.toString()===r.object.notebook.uri.toString()?{kind:U.Index,focus:n.getFocus(),selections:n.getSelections()}:void 0;r.object.notebook.applyEdits(s,!0,c,()=>{},this._undoRedoGroup,u),r.dispose(),this._progress.report(void 0),i.push(o.resource)}return i}};l=m([p(5,h),p(6,C)],l);export{l as BulkCellEdits,a as ResourceNotebookCellEdit};
