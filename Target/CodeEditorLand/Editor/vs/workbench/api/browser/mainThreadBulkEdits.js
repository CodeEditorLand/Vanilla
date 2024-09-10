var u=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var l=(o,i,r,s)=>{for(var e=s>1?void 0:s?f(i,r):i,t=o.length-1,n;t>=0;t--)(n=o[t])&&(e=(s?n(i,r,e):n(e))||e);return s&&e&&u(i,r,e),e},c=(o,i)=>(r,s)=>i(r,s,o);import{decodeBase64 as m}from"../../../base/common/buffer.js";import{revive as v}from"../../../base/common/marshalling.js";import{IBulkEditService as E,ResourceFileEdit as I,ResourceTextEdit as k}from"../../../editor/browser/services/bulkEditService.js";import{ILogService as S}from"../../../platform/log/common/log.js";import{IUriIdentityService as W}from"../../../platform/uriIdentity/common/uriIdentity.js";import{MainContext as C}from"../common/extHost.protocol.js";import{ResourceNotebookCellEdit as y}from"../../contrib/bulkEdit/browser/bulkCellEdits.js";import{CellEditType as x}from"../../contrib/notebook/common/notebookCommon.js";import{extHostNamedCustomer as D}from"../../services/extensions/common/extHostCustomers.js";let a=class{constructor(i,r,s,e){this._bulkEditService=r;this._logService=s;this._uriIdentService=e}dispose(){}$tryApplyWorkspaceEdit(i,r,s){const e=b(i.value,this._uriIdentService);return this._bulkEditService.apply(e,{undoRedoGroupId:r,respectAutoSaveConfig:s}).then(t=>t.isApplied,t=>(this._logService.warn(`IGNORING workspace edit: ${t}`),!1))}};a=l([D(C.MainThreadBulkEdits),c(1,E),c(2,S),c(3,W)],a);function b(o,i,r){if(!o||!o.edits)return o;const s=v(o);for(const e of s.edits){if(k.is(e)&&(e.resource=i.asCanonicalUri(e.resource)),I.is(e)){if(e.options){const t=e.options?.contents;if(t)if(t.type==="base64")e.options.contents=Promise.resolve(m(t.value));else if(r)e.options.contents=r(t.id);else throw new Error("Could not revive data transfer file")}e.newResource=e.newResource&&i.asCanonicalUri(e.newResource),e.oldResource=e.oldResource&&i.asCanonicalUri(e.oldResource)}if(y.is(e)){e.resource=i.asCanonicalUri(e.resource);const t=e.cellEdit;t.editType===x.Replace&&(e.cellEdit={...t,cells:t.cells.map(n=>({...n,outputs:n.outputs.map(d=>({...d,outputs:d.items.map(p=>({mime:p.mime,data:p.valueBytes}))}))}))})}}return o}export{a as MainThreadBulkEdits,b as reviveWorkspaceEditDto};
