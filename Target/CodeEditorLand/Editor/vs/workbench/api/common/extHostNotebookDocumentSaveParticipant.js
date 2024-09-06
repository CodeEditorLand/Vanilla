import"../../../../vs/base/common/cancellation.js";import{AsyncEmitter as d}from"../../../../vs/base/common/event.js";import{URI as v}from"../../../../vs/base/common/uri.js";import"../../../../vs/platform/extensions/common/extensions.js";import"../../../../vs/platform/log/common/log.js";import"../../../../vs/workbench/api/common/extHost.protocol.js";import"../../../../vs/workbench/api/common/extHostNotebook.js";import{TextDocumentSaveReason as p,WorkspaceEdit as u}from"../../../../vs/workbench/api/common/extHostTypeConverters.js";import{WorkspaceEdit as E}from"../../../../vs/workbench/api/common/extHostTypes.js";import"../../../../vs/workbench/common/editor.js";import{SerializableObjectWithBuffers as k}from"../../../../vs/workbench/services/extensions/common/proxyIdentifier.js";import"vscode";class O{constructor(n,i,e,r={timeout:1500,errors:3}){this._logService=n;this._notebooksAndEditors=i;this._mainThreadBulkEdits=e;this._thresholds=r}_onWillSaveNotebookDocumentEvent=new d;dispose(){}getOnWillSaveNotebookDocumentEvent(n){return(i,e,r)=>{const o=function(t){i.call(e,t)};return o.extension=n,this._onWillSaveNotebookDocumentEvent.event(o,void 0,r)}}async $participateInSave(n,i,e){const r=v.revive(n),o=this._notebooksAndEditors.getNotebookDocument(r);if(!o)throw new Error("Unable to resolve notebook document");const a=[];if(await this._onWillSaveNotebookDocumentEvent.fireAsync({notebook:o.apiNotebook,reason:p.to(i)},e,async(l,s)=>{const m=Date.now(),c=await await Promise.resolve(l);Date.now()-m>this._thresholds.timeout&&this._logService.warn("onWillSaveNotebookDocument-listener from extension",s.extension.identifier),!e.isCancellationRequested&&c&&(c instanceof E?a.push(c):this._logService.warn("onWillSaveNotebookDocument-listener from extension",s.extension.identifier,"ignored due to invalid data"))}),e.isCancellationRequested)return!1;if(a.length===0)return!0;const t={edits:[]};for(const l of a){const{edits:s}=u.from(l);t.edits=t.edits.concat(s)}return this._mainThreadBulkEdits.$tryApplyWorkspaceEdit(new k(t))}}export{O as ExtHostNotebookDocumentSaveParticipant};