var D=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var y=(v,d,e,i)=>{for(var o=i>1?void 0:i?I(d,e):d,t=v.length-1,r;t>=0;t--)(r=v[t])&&(o=(i?r(d,e,o):r(o))||o);return i&&o&&D(d,e,o),o},p=(v,d)=>(e,i)=>d(e,i,v);import{Promises as C,ResourceQueue as T}from"../../../../base/common/async.js";import{toErrorMessage as F}from"../../../../base/common/errorMessage.js";import{onUnexpectedError as R}from"../../../../base/common/errors.js";import{Emitter as n,Event as M}from"../../../../base/common/event.js";import{Disposable as E,DisposableStore as S,dispose as h}from"../../../../base/common/lifecycle.js";import{ResourceMap as c}from"../../../../base/common/map.js";import{extname as P,joinPath as _}from"../../../../base/common/resources.js";import{URI as x}from"../../../../base/common/uri.js";import{PLAINTEXT_EXTENSION as w,PLAINTEXT_LANGUAGE_ID as f}from"../../../../editor/common/languages/modesRegistry.js";import{createTextBufferFactoryFromSnapshot as k}from"../../../../editor/common/model/textModel.js";import{localize as U}from"../../../../nls.js";import{FileChangeType as m,FileOperation as l,IFileService as L}from"../../../../platform/files/common/files.js";import{IInstantiationService as O}from"../../../../platform/instantiation/common/instantiation.js";import{INotificationService as W}from"../../../../platform/notification/common/notification.js";import{IUriIdentityService as b}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IWorkingCopyFileService as q}from"../../workingCopy/common/workingCopyFileService.js";import{TextFileEditorModel as j}from"./textFileEditorModel.js";import{TextFileSaveParticipant as A}from"./textFileSaveParticipant.js";let g=class extends E{constructor(e,i,o,t,r){super();this.instantiationService=e;this.fileService=i;this.notificationService=o;this.workingCopyFileService=t;this.uriIdentityService=r;this.registerListeners()}_onDidCreate=this._register(new n({leakWarningThreshold:500}));onDidCreate=this._onDidCreate.event;_onDidResolve=this._register(new n);onDidResolve=this._onDidResolve.event;_onDidRemove=this._register(new n);onDidRemove=this._onDidRemove.event;_onDidChangeDirty=this._register(new n);onDidChangeDirty=this._onDidChangeDirty.event;_onDidChangeReadonly=this._register(new n);onDidChangeReadonly=this._onDidChangeReadonly.event;_onDidChangeOrphaned=this._register(new n);onDidChangeOrphaned=this._onDidChangeOrphaned.event;_onDidSaveError=this._register(new n);onDidSaveError=this._onDidSaveError.event;_onDidSave=this._register(new n);onDidSave=this._onDidSave.event;_onDidRevert=this._register(new n);onDidRevert=this._onDidRevert.event;_onDidChangeEncoding=this._register(new n);onDidChangeEncoding=this._onDidChangeEncoding.event;mapResourceToModel=new c;mapResourceToModelListeners=new c;mapResourceToDisposeListener=new c;mapResourceToPendingModelResolvers=new c;modelResolveQueue=this._register(new T);saveErrorHandler=(()=>{const e=this.notificationService;return{onSaveError(i,o){e.error(U({key:"genericSaveError",comment:["{0} is the resource that failed to save and {1} the error message"]},"Failed to save '{0}': {1}",o.name,F(i,!1)))}}})();get models(){return[...this.mapResourceToModel.values()]}registerListeners(){this._register(this.fileService.onDidFilesChange(e=>this.onDidFilesChange(e))),this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e=>this.onDidChangeFileSystemProviderCapabilities(e))),this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e=>this.onDidChangeFileSystemProviderRegistrations(e))),this._register(this.workingCopyFileService.onWillRunWorkingCopyFileOperation(e=>this.onWillRunWorkingCopyFileOperation(e))),this._register(this.workingCopyFileService.onDidFailWorkingCopyFileOperation(e=>this.onDidFailWorkingCopyFileOperation(e))),this._register(this.workingCopyFileService.onDidRunWorkingCopyFileOperation(e=>this.onDidRunWorkingCopyFileOperation(e)))}onDidFilesChange(e){for(const i of this.models)i.isDirty()||e.contains(i.resource,m.UPDATED,m.ADDED)&&this.queueModelReload(i)}onDidChangeFileSystemProviderCapabilities(e){this.queueModelReloads(e.scheme)}onDidChangeFileSystemProviderRegistrations(e){e.added&&this.queueModelReloads(e.scheme)}queueModelReloads(e){for(const i of this.models)i.isDirty()||e===i.resource.scheme&&this.queueModelReload(i)}queueModelReload(e){this.modelResolveQueue.queueSize(e.resource)<=1&&this.modelResolveQueue.queueFor(e.resource,async()=>{try{await this.reload(e)}catch(o){R(o)}})}mapCorrelationIdToModelsToRestore=new Map;onWillRunWorkingCopyFileOperation(e){if(e.operation===l.MOVE||e.operation===l.COPY){const i=[];for(const{source:o,target:t}of e.files)if(o){if(this.uriIdentityService.extUri.isEqual(o,t))continue;const r=[];for(const s of this.models)this.uriIdentityService.extUri.isEqualOrParent(s.resource,o)&&r.push(s);for(const s of r){const a=s.resource;let u;this.uriIdentityService.extUri.isEqual(a,o)?u=t:u=_(t,a.path.substr(o.path.length+1)),i.push({source:a,target:u,languageId:s.getLanguageId(),encoding:s.getEncoding(),snapshot:s.isDirty()?s.createSnapshot():void 0})}}this.mapCorrelationIdToModelsToRestore.set(e.correlationId,i)}}onDidFailWorkingCopyFileOperation(e){if(e.operation===l.MOVE||e.operation===l.COPY){const i=this.mapCorrelationIdToModelsToRestore.get(e.correlationId);i&&(this.mapCorrelationIdToModelsToRestore.delete(e.correlationId),i.forEach(o=>{o.snapshot&&this.get(o.source)?.setDirty(!0)}))}}onDidRunWorkingCopyFileOperation(e){switch(e.operation){case l.CREATE:e.waitUntil((async()=>{for(const{target:i}of e.files){const o=this.get(i);o&&!o.isDisposed()&&await o.revert()}})());break;case l.MOVE:case l.COPY:e.waitUntil((async()=>{const i=this.mapCorrelationIdToModelsToRestore.get(e.correlationId);i&&(this.mapCorrelationIdToModelsToRestore.delete(e.correlationId),await C.settled(i.map(async o=>{const t=this.uriIdentityService.asCanonicalUri(o.target),r=await this.resolve(t,{reload:{async:!1},contents:o.snapshot?k(o.snapshot):void 0,encoding:o.encoding});o.languageId&&o.languageId!==f&&r.getLanguageId()===f&&P(t)!==w&&r.updateTextEditorModel(void 0,o.languageId)})))})());break}}get(e){return this.mapResourceToModel.get(e)}has(e){return this.mapResourceToModel.has(e)}async reload(e){await this.joinPendingResolves(e.resource),!(e.isDirty()||e.isDisposed()||!this.has(e.resource))&&await this.doResolve(e,{reload:{async:!1}})}async resolve(e,i){const o=this.joinPendingResolves(e);return o&&await o,this.doResolve(e,i)}async doResolve(e,i){let o,t;x.isUri(e)?(t=e,o=this.get(t)):(t=e.resource,o=e);let r,s=!1;if(o)i?.contents?r=o.resolve(i):i?.reload?i.reload.async?(r=Promise.resolve(),(async()=>{try{await o.resolve(i)}catch(a){R(a)}})()):r=o.resolve(i):r=Promise.resolve();else{s=!0;const a=o=this.instantiationService.createInstance(j,t,i?i.encoding:void 0,i?i.languageId:void 0);r=o.resolve(i),this.registerModel(a)}this.mapResourceToPendingModelResolvers.set(t,r),this.add(t,o),s&&(this._onDidCreate.fire(o),o.isDirty()&&this._onDidChangeDirty.fire(o));try{await r}catch(a){throw s&&o.dispose(),a}finally{this.mapResourceToPendingModelResolvers.delete(t)}return i?.languageId&&o.setLanguageId(i.languageId),s&&o.isDirty()&&this._onDidChangeDirty.fire(o),o}joinPendingResolves(e){if(this.mapResourceToPendingModelResolvers.get(e))return this.doJoinPendingResolves(e)}async doJoinPendingResolves(e){let i;for(;this.mapResourceToPendingModelResolvers.has(e);){const o=this.mapResourceToPendingModelResolvers.get(e);if(o===i)return;i=o;try{await o}catch{}}}registerModel(e){const i=new S;i.add(e.onDidResolve(o=>this._onDidResolve.fire({model:e,reason:o}))),i.add(e.onDidChangeDirty(()=>this._onDidChangeDirty.fire(e))),i.add(e.onDidChangeReadonly(()=>this._onDidChangeReadonly.fire(e))),i.add(e.onDidChangeOrphaned(()=>this._onDidChangeOrphaned.fire(e))),i.add(e.onDidSaveError(()=>this._onDidSaveError.fire(e))),i.add(e.onDidSave(o=>this._onDidSave.fire({model:e,...o}))),i.add(e.onDidRevert(()=>this._onDidRevert.fire(e))),i.add(e.onDidChangeEncoding(()=>this._onDidChangeEncoding.fire(e))),this.mapResourceToModelListeners.set(e.resource,i)}add(e,i){if(this.mapResourceToModel.get(e)===i)return;this.mapResourceToDisposeListener.get(e)?.dispose(),this.mapResourceToModel.set(e,i),this.mapResourceToDisposeListener.set(e,i.onWillDispose(()=>this.remove(e)))}remove(e){const i=this.mapResourceToModel.delete(e),o=this.mapResourceToDisposeListener.get(e);o&&(h(o),this.mapResourceToDisposeListener.delete(e));const t=this.mapResourceToModelListeners.get(e);t&&(h(t),this.mapResourceToModelListeners.delete(e)),i&&this._onDidRemove.fire(e)}saveParticipants=this._register(this.instantiationService.createInstance(A));addSaveParticipant(e){return this.saveParticipants.addSaveParticipant(e)}runSaveParticipants(e,i,o,t){return this.saveParticipants.participate(e,i,o,t)}canDispose(e){return e.isDisposed()||!this.mapResourceToPendingModelResolvers.has(e.resource)&&!e.isDirty()?!0:this.doCanDispose(e)}async doCanDispose(e){const i=this.joinPendingResolves(e.resource);return i?(await i,this.canDispose(e)):e.isDirty()?(await M.toPromise(e.onDidChangeDirty),this.canDispose(e)):!0}dispose(){super.dispose(),this.mapResourceToModel.clear(),this.mapResourceToPendingModelResolvers.clear(),h(this.mapResourceToDisposeListener.values()),this.mapResourceToDisposeListener.clear(),h(this.mapResourceToModelListeners.values()),this.mapResourceToModelListeners.clear()}};g=y([p(0,O),p(1,L),p(2,W),p(3,q),p(4,b)],g);export{g as TextFileEditorModelManager};
