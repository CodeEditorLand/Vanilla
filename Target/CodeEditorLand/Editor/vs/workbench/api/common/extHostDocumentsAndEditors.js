var _=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var D=(d,t,i,s)=>{for(var n=s>1?void 0:s?g(t,i):t,e=d.length-1,o;e>=0;e--)(o=d[e])&&(n=(s?o(t,i,n):o(n))||n);return s&&n&&_(t,i,n),n},m=(d,t)=>(i,s)=>t(i,s,d);import*as u from"../../../../vs/base/common/assert.js";import{Emitter as c}from"../../../../vs/base/common/event.js";import{Iterable as y}from"../../../../vs/base/common/iterator.js";import{Lazy as H}from"../../../../vs/base/common/lazy.js";import{dispose as f}from"../../../../vs/base/common/lifecycle.js";import{ResourceMap as T}from"../../../../vs/base/common/map.js";import{Schemas as x}from"../../../../vs/base/common/network.js";import{URI as v}from"../../../../vs/base/common/uri.js";import{createDecorator as A}from"../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as I}from"../../../../vs/platform/log/common/log.js";import{MainContext as h}from"../../../../vs/workbench/api/common/extHost.protocol.js";import{ExtHostDocumentData as w}from"../../../../vs/workbench/api/common/extHostDocumentData.js";import{IExtHostRpcService as R}from"../../../../vs/workbench/api/common/extHostRpcService.js";import{ExtHostTextEditor as C}from"../../../../vs/workbench/api/common/extHostTextEditor.js";import*as E from"../../../../vs/workbench/api/common/extHostTypeConverters.js";import"vscode";class S{constructor(t){this.value=t}_count=0;ref(){this._count++}unref(){return--this._count===0}}let a=class{constructor(t,i){this._extHostRpc=t;this._logService=i}_serviceBrand;_activeEditorId=null;_editors=new Map;_documents=new T;_onDidAddDocuments=new c;_onDidRemoveDocuments=new c;_onDidChangeVisibleTextEditors=new c;_onDidChangeActiveTextEditor=new c;onDidAddDocuments=this._onDidAddDocuments.event;onDidRemoveDocuments=this._onDidRemoveDocuments.event;onDidChangeVisibleTextEditors=this._onDidChangeVisibleTextEditors.event;onDidChangeActiveTextEditor=this._onDidChangeActiveTextEditor.event;$acceptDocumentsAndEditorsDelta(t){this.acceptDocumentsAndEditorsDelta(t)}acceptDocumentsAndEditorsDelta(t){const i=[],s=[],n=[];if(t.removedDocuments)for(const e of t.removedDocuments){const o=v.revive(e),r=this._documents.get(o);r?.unref()&&(this._documents.delete(o),i.push(r.value))}if(t.addedDocuments)for(const e of t.addedDocuments){const o=v.revive(e.uri);let r=this._documents.get(o);if(r&&o.scheme!==x.vscodeNotebookCell&&o.scheme!==x.vscodeInteractiveInput)throw new Error(`document '${o} already exists!'`);r||(r=new S(new w(this._extHostRpc.getProxy(h.MainThreadDocuments),o,e.lines,e.EOL,e.versionId,e.languageId,e.isDirty)),this._documents.set(o,r),s.push(r.value)),r.ref()}if(t.removedEditors)for(const e of t.removedEditors){const o=this._editors.get(e);this._editors.delete(e),o&&n.push(o)}if(t.addedEditors)for(const e of t.addedEditors){const o=v.revive(e.documentUri);u.ok(this._documents.has(o),`document '${o}' does not exist`),u.ok(!this._editors.has(e.id),`editor '${e.id}' already exists!`);const r=this._documents.get(o).value,l=new C(e.id,this._extHostRpc.getProxy(h.MainThreadTextEditors),this._logService,new H(()=>r.document),e.selections.map(E.Selection.to),e.options,e.visibleRanges.map(p=>E.Range.to(p)),typeof e.editorPosition=="number"?E.ViewColumn.to(e.editorPosition):void 0);this._editors.set(e.id,l)}t.newActiveEditor!==void 0&&(u.ok(t.newActiveEditor===null||this._editors.has(t.newActiveEditor),`active editor '${t.newActiveEditor}' does not exist`),this._activeEditorId=t.newActiveEditor),f(i),f(n),t.removedDocuments&&this._onDidRemoveDocuments.fire(i),t.addedDocuments&&this._onDidAddDocuments.fire(s),(t.removedEditors||t.addedEditors)&&this._onDidChangeVisibleTextEditors.fire(this.allEditors().map(e=>e.value)),t.newActiveEditor!==void 0&&this._onDidChangeActiveTextEditor.fire(this.activeEditor())}getDocument(t){return this._documents.get(t)?.value}allDocuments(){return y.map(this._documents.values(),t=>t.value)}getEditor(t){return this._editors.get(t)}activeEditor(t){if(!this._activeEditorId)return;const i=this._editors.get(this._activeEditorId);return t?i:i?.value}allEditors(){return[...this._editors.values()]}};a=D([m(0,R),m(1,I)],a);const Q=A("IExtHostDocumentsAndEditors");export{a as ExtHostDocumentsAndEditors,Q as IExtHostDocumentsAndEditors};