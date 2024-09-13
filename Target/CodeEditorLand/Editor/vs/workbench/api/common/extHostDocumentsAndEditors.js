var _=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var D=(d,e,i,s)=>{for(var n=s>1?void 0:s?y(e,i):e,t=d.length-1,o;t>=0;t--)(o=d[t])&&(n=(s?o(e,i,n):o(n))||n);return s&&n&&_(e,i,n),n},m=(d,e)=>(i,s)=>e(i,s,d);import*as u from"../../../base/common/assert.js";import{Emitter as c}from"../../../base/common/event.js";import{Iterable as g}from"../../../base/common/iterator.js";import{Lazy as H}from"../../../base/common/lazy.js";import{dispose as f}from"../../../base/common/lifecycle.js";import{ResourceMap as T}from"../../../base/common/map.js";import{Schemas as p}from"../../../base/common/network.js";import{URI as v}from"../../../base/common/uri.js";import{createDecorator as A}from"../../../platform/instantiation/common/instantiation.js";import{ILogService as I}from"../../../platform/log/common/log.js";import{MainContext as x}from"./extHost.protocol.js";import{ExtHostDocumentData as w}from"./extHostDocumentData.js";import{IExtHostRpcService as R}from"./extHostRpcService.js";import{ExtHostTextEditor as C}from"./extHostTextEditor.js";import*as E from"./extHostTypeConverters.js";class S{constructor(e){this.value=e}_count=0;ref(){this._count++}unref(){return--this._count===0}}let a=class{constructor(e,i){this._extHostRpc=e;this._logService=i}_serviceBrand;_activeEditorId=null;_editors=new Map;_documents=new T;_onDidAddDocuments=new c;_onDidRemoveDocuments=new c;_onDidChangeVisibleTextEditors=new c;_onDidChangeActiveTextEditor=new c;onDidAddDocuments=this._onDidAddDocuments.event;onDidRemoveDocuments=this._onDidRemoveDocuments.event;onDidChangeVisibleTextEditors=this._onDidChangeVisibleTextEditors.event;onDidChangeActiveTextEditor=this._onDidChangeActiveTextEditor.event;$acceptDocumentsAndEditorsDelta(e){this.acceptDocumentsAndEditorsDelta(e)}acceptDocumentsAndEditorsDelta(e){const i=[],s=[],n=[];if(e.removedDocuments)for(const t of e.removedDocuments){const o=v.revive(t),r=this._documents.get(o);r?.unref()&&(this._documents.delete(o),i.push(r.value))}if(e.addedDocuments)for(const t of e.addedDocuments){const o=v.revive(t.uri);let r=this._documents.get(o);if(r&&o.scheme!==p.vscodeNotebookCell&&o.scheme!==p.vscodeInteractiveInput)throw new Error(`document '${o} already exists!'`);r||(r=new S(new w(this._extHostRpc.getProxy(x.MainThreadDocuments),o,t.lines,t.EOL,t.versionId,t.languageId,t.isDirty)),this._documents.set(o,r),s.push(r.value)),r.ref()}if(e.removedEditors)for(const t of e.removedEditors){const o=this._editors.get(t);this._editors.delete(t),o&&n.push(o)}if(e.addedEditors)for(const t of e.addedEditors){const o=v.revive(t.documentUri);u.ok(this._documents.has(o),`document '${o}' does not exist`),u.ok(!this._editors.has(t.id),`editor '${t.id}' already exists!`);const r=this._documents.get(o).value,h=new C(t.id,this._extHostRpc.getProxy(x.MainThreadTextEditors),this._logService,new H(()=>r.document),t.selections.map(E.Selection.to),t.options,t.visibleRanges.map(l=>E.Range.to(l)),typeof t.editorPosition=="number"?E.ViewColumn.to(t.editorPosition):void 0);this._editors.set(t.id,h)}e.newActiveEditor!==void 0&&(u.ok(e.newActiveEditor===null||this._editors.has(e.newActiveEditor),`active editor '${e.newActiveEditor}' does not exist`),this._activeEditorId=e.newActiveEditor),f(i),f(n),e.removedDocuments&&this._onDidRemoveDocuments.fire(i),e.addedDocuments&&this._onDidAddDocuments.fire(s),(e.removedEditors||e.addedEditors)&&this._onDidChangeVisibleTextEditors.fire(this.allEditors().map(t=>t.value)),e.newActiveEditor!==void 0&&this._onDidChangeActiveTextEditor.fire(this.activeEditor())}getDocument(e){return this._documents.get(e)?.value}allDocuments(){return g.map(this._documents.values(),e=>e.value)}getEditor(e){return this._editors.get(e)}activeEditor(e){if(!this._activeEditorId)return;const i=this._editors.get(this._activeEditorId);return e?i:i?.value}allEditors(){return[...this._editors.values()]}};a=D([m(0,R),m(1,I)],a);const F=A("IExtHostDocumentsAndEditors");export{a as ExtHostDocumentsAndEditors,F as IExtHostDocumentsAndEditors};
