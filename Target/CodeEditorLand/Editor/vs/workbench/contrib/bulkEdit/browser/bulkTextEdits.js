var M=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var y=(a,t,e,o)=>{for(var i=o>1?void 0:o?x(t,e):t,r=a.length-1,s;r>=0;r--)(s=a[r])&&(i=(o?s(t,e,i):s(i))||i);return o&&i&&M(t,e,i),i},c=(a,t)=>(e,o)=>t(e,o,a);import{dispose as k}from"../../../../base/common/lifecycle.js";import{ResourceMap as w}from"../../../../base/common/map.js";import{ResourceTextEdit as T}from"../../../../editor/browser/services/bulkEditService.js";import{EditOperation as b}from"../../../../editor/common/core/editOperation.js";import{Range as u}from"../../../../editor/common/core/range.js";import{MultiModelEditStackElement as A,SingleModelEditStackElement as v}from"../../../../editor/common/model/editStack.js";import{IEditorWorkerService as O}from"../../../../editor/common/services/editorWorker.js";import{IModelService as U}from"../../../../editor/common/services/model.js";import{ITextModelService as C}from"../../../../editor/common/services/resolverService.js";import{SnippetController2 as j}from"../../../../editor/contrib/snippet/browser/snippetController2.js";import{SnippetParser as I}from"../../../../editor/contrib/snippet/browser/snippetParser.js";import{IUndoRedoService as P}from"../../../../platform/undoRedo/common/undoRedo.js";class R{constructor(t){this._modelReference=t;this.model=this._modelReference.object.textEditorModel,this._edits=[]}model;_expectedModelVersionId;_edits;_newEol;dispose(){this._modelReference.dispose()}isNoOp(){return!(this._edits.length>0||this._newEol!==void 0&&this._newEol!==this.model.getEndOfLineSequence())}addEdit(t){this._expectedModelVersionId=t.versionId;const{textEdit:e}=t;if(typeof e.eol=="number"&&(this._newEol=e.eol),!e.range&&!e.text||u.isEmpty(e.range)&&!e.text)return;let o;e.range?o=u.lift(e.range):o=this.model.getFullModelRange(),this._edits.push({...b.replaceMove(o,e.text),insertAsSnippet:e.insertAsSnippet})}validate(){return typeof this._expectedModelVersionId>"u"||this.model.getVersionId()===this._expectedModelVersionId?{canApply:!0}:{canApply:!1,reason:this.model.uri}}getBeforeCursorState(){return null}apply(){this._edits.length>0&&(this._edits=this._edits.map(this._transformSnippetStringToInsertText,this).sort((t,e)=>u.compareRangesUsingStarts(t.range,e.range)),this.model.pushEditOperations(null,this._edits,()=>null)),this._newEol!==void 0&&this.model.pushEOL(this._newEol)}_transformSnippetStringToInsertText(t){if(!t.insertAsSnippet||!t.text)return t;const e=I.asInsertText(t.text);return{...t,insertAsSnippet:!1,text:e}}}class V extends R{_editor;constructor(t,e){super(t),this._editor=e}getBeforeCursorState(){return this._canUseEditor()?this._editor.getSelections():null}apply(){if(!this._canUseEditor()){super.apply();return}if(this._edits.length>0){const t=j.get(this._editor);if(t&&this._edits.some(e=>e.insertAsSnippet)){const e=[];for(const o of this._edits)o.range&&o.text!==null&&e.push({range:u.lift(o.range),template:o.insertAsSnippet?o.text:I.escape(o.text)});t.apply(e,{undoStopBefore:!1,undoStopAfter:!1})}else this._edits=this._edits.map(this._transformSnippetStringToInsertText,this).sort((e,o)=>u.compareRangesUsingStarts(e.range,o.range)),this._editor.executeEdits("",this._edits)}this._newEol!==void 0&&this._editor.hasModel()&&this._editor.getModel().pushEOL(this._newEol)}_canUseEditor(){return this._editor?.getModel()?.uri.toString()===this.model.uri.toString()}}let h=class{constructor(t,e,o,i,r,s,n,m,_,f,d,S){this._label=t;this._code=e;this._editor=o;this._undoRedoGroup=i;this._undoRedoSource=r;this._progress=s;this._token=n;this._editorWorker=_;this._modelService=f;this._textModelResolverService=d;this._undoRedoService=S;for(const p of m){let l=this._edits.get(p.resource);l||(l=[],this._edits.set(p.resource,l)),l.push(p)}}_edits=new w;_validateBeforePrepare(){for(const t of this._edits.values())for(const e of t)if(typeof e.versionId=="number"){const o=this._modelService.getModel(e.resource);if(o&&o.getVersionId()!==e.versionId)throw new Error(`${o.uri.toString()} has changed in the meantime`)}}async _createEditsTasks(){const t=[],e=[];for(const[o,i]of this._edits){const r=this._textModelResolverService.createModelReference(o).then(async s=>{let n,m=!1;if(this._editor?.getModel()?.uri.toString()===s.object.textEditorModel.uri.toString()?(n=new V(s,this._editor),m=!0):n=new R(s),t.push(n),!m){i.forEach(n.addEdit,n);return}const _=async(S,p)=>{const l=i.slice(S,p),g=await this._editorWorker.computeMoreMinimalEdits(s.object.textEditorModel.uri,l.map(E=>E.textEdit),!1);g?g.forEach(E=>n.addEdit(new T(s.object.textEditorModel.uri,E,void 0,void 0))):l.forEach(n.addEdit,n)};let f=0,d=0;for(;d<i.length;d++)(i[d].textEdit.insertAsSnippet||i[d].metadata)&&(await _(f,d),n.addEdit(i[d]),f=d+1);await _(f,d)});e.push(r)}return await Promise.all(e),t}_validateTasks(t){for(const e of t){const o=e.validate();if(!o.canApply)return o}return{canApply:!0}}async apply(){this._validateBeforePrepare();const t=await this._createEditsTasks();try{if(this._token.isCancellationRequested)return[];const e=[],o=this._validateTasks(t);if(!o.canApply)throw new Error(`${o.reason.toString()} has changed in the meantime`);if(t.length===1){const i=t[0];if(!i.isNoOp()){const r=new v(this._label,this._code,i.model,i.getBeforeCursorState());this._undoRedoService.pushElement(r,this._undoRedoGroup,this._undoRedoSource),i.apply(),r.close(),e.push(i.model.uri)}this._progress.report(void 0)}else{const i=new A(this._label,this._code,t.map(r=>new v(this._label,this._code,r.model,r.getBeforeCursorState())));this._undoRedoService.pushElement(i,this._undoRedoGroup,this._undoRedoSource);for(const r of t)r.apply(),this._progress.report(void 0),e.push(r.model.uri);i.close()}return e}finally{k(t)}}};h=y([c(8,O),c(9,U),c(10,C),c(11,P)],h);export{h as BulkTextEdits};
