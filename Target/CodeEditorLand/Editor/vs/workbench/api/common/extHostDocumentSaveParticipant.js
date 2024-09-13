import{illegalState as h}from"../../../base/common/errors.js";import{LinkedList as E}from"../../../base/common/linkedList.js";import{URI as y}from"../../../base/common/uri.js";import{SerializableObjectWithBuffers as x}from"../../services/extensions/common/proxyIdentifier.js";import{EndOfLine as S,Range as _,TextDocumentSaveReason as T}from"./extHostTypeConverters.js";import{TextEdit as b}from"./extHostTypes.js";class I{constructor(e,i,r,n={timeout:1500,errors:3}){this._logService=e;this._documents=i;this._mainThreadBulkEdits=r;this._thresholds=n}_callbacks=new E;_badListeners=new WeakMap;dispose(){this._callbacks.clear()}getOnWillSaveTextDocumentEvent(e){return(i,r,n)=>{const t={dispose:this._callbacks.push([i,r,e])};return Array.isArray(n)&&n.push(t),t}}async $participateInSave(e,i){const r=y.revive(e);let n=!1;const s=setTimeout(()=>n=!0,this._thresholds.timeout),t=[];try{for(const o of[...this._callbacks]){if(n)break;const d=this._documents.getDocument(r),u=await this._deliverEventAsyncAndBlameBadListeners(o,{document:d,reason:T.to(i)});t.push(u)}}finally{clearTimeout(s)}return t}_deliverEventAsyncAndBlameBadListeners([e,i,r],n){const s=this._badListeners.get(e);return typeof s=="number"&&s>this._thresholds.errors?Promise.resolve(!1):this._deliverEventAsync(r,e,i,n).then(()=>!0,t=>{if(this._logService.error(`onWillSaveTextDocument-listener from extension '${r.identifier.value}' threw ERROR`),this._logService.error(t),!(t instanceof Error)||t.message!=="concurrent_edits"){const o=this._badListeners.get(e);this._badListeners.set(e,o?o+1:1),typeof o=="number"&&o>this._thresholds.errors&&this._logService.info(`onWillSaveTextDocument-listener from extension '${r.identifier.value}' will now be IGNORED because of timeouts and/or errors`)}return!1})}_deliverEventAsync(e,i,r,n){const s=[],t=Date.now(),{document:o,reason:d}=n,{version:u}=o,f=Object.freeze({document:o,reason:d,waitUntil(a){if(Object.isFrozen(s))throw h("waitUntil can not be called async");s.push(Promise.resolve(a))}});try{i.apply(r,[f])}catch(a){return Promise.reject(a)}return Object.freeze(s),new Promise((a,m)=>{const l=setTimeout(()=>m(new Error("timeout")),this._thresholds.timeout);return Promise.all(s).then(c=>{this._logService.debug(`onWillSaveTextDocument-listener from extension '${e.identifier.value}' finished after ${Date.now()-t}ms`),clearTimeout(l),a(c)}).catch(c=>{clearTimeout(l),m(c)})}).then(a=>{const m={edits:[]};for(const l of a)if(Array.isArray(l)&&l.every(c=>c instanceof b))for(const{newText:c,newEol:v,range:p}of l)m.edits.push({resource:o.uri,versionId:void 0,textEdit:{range:p&&_.from(p),text:c,eol:v&&S.from(v)}});if(m.edits.length!==0)return u===o.version?this._mainThreadBulkEdits.$tryApplyWorkspaceEdit(new x(m)):Promise.reject(new Error("concurrent_edits"))})}}export{I as ExtHostDocumentSaveParticipant};
