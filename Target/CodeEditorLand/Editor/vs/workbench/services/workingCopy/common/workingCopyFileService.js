var S=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var u=(I,y,e,i)=>{for(var r=i>1?void 0:i?h(y,e):y,n=I.length-1,a;n>=0;n--)(a=I[n])&&(r=(i?a(y,e,r):a(r))||r);return i&&r&&S(y,e,r),r},f=(I,y)=>(e,i)=>y(e,i,I);import{insert as O}from"../../../../../vs/base/common/arrays.js";import{Promises as v}from"../../../../../vs/base/common/async.js";import"../../../../../vs/base/common/buffer.js";import{CancellationToken as d}from"../../../../../vs/base/common/cancellation.js";import{AsyncEmitter as F}from"../../../../../vs/base/common/event.js";import{Disposable as W,toDisposable as P}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/uri.js";import{FileOperation as c,IFileService as m}from"../../../../../vs/platform/files/common/files.js";import{InstantiationType as w,registerSingleton as R}from"../../../../../vs/platform/instantiation/common/extensions.js";import{createDecorator as D,IInstantiationService as T}from"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/platform/progress/common/progress.js";import{IUriIdentityService as U}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import"../../../../../vs/workbench/common/editor.js";import"../../../../../vs/workbench/services/workingCopy/common/storedFileWorkingCopy.js";import{StoredFileWorkingCopySaveParticipant as E}from"../../../../../vs/workbench/services/workingCopy/common/storedFileWorkingCopySaveParticipant.js";import"../../../../../vs/workbench/services/workingCopy/common/workingCopy.js";import{WorkingCopyFileOperationParticipant as M}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyFileOperationParticipant.js";import{IWorkingCopyService as x}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyService.js";const b=D("workingCopyFileService");let C=class extends W{constructor(e,i,r,n){super();this.fileService=e;this.workingCopyService=i;this.instantiationService=r;this.uriIdentityService=n;this._register(this.registerWorkingCopyProvider(a=>this.workingCopyService.workingCopies.filter(t=>this.fileService.hasProvider(a)?this.uriIdentityService.extUri.isEqualOrParent(t.resource,a):this.uriIdentityService.extUri.isEqual(t.resource,a))))}_onWillRunWorkingCopyFileOperation=this._register(new F);onWillRunWorkingCopyFileOperation=this._onWillRunWorkingCopyFileOperation.event;_onDidFailWorkingCopyFileOperation=this._register(new F);onDidFailWorkingCopyFileOperation=this._onDidFailWorkingCopyFileOperation.event;_onDidRunWorkingCopyFileOperation=this._register(new F);onDidRunWorkingCopyFileOperation=this._onDidRunWorkingCopyFileOperation.event;correlationIds=0;create(e,i,r){return this.doCreateFileOrFolder(e,!0,i,r)}createFolder(e,i,r){return this.doCreateFileOrFolder(e,!1,i,r)}async doCreateFileOrFolder(e,i,r,n){if(e.length===0)return[];if(i){const p=(await v.settled(e.map(s=>this.fileService.canCreateFile(s.resource,{overwrite:s.overwrite})))).find(s=>s instanceof Error);if(p instanceof Error)throw p}const a=e.map(o=>({target:o.resource}));await this.runFileOperationParticipants(a,c.CREATE,n,r);const t={correlationId:this.correlationIds++,operation:c.CREATE,files:a};await this._onWillRunWorkingCopyFileOperation.fireAsync(t,d.None);let l;try{i?l=await v.settled(e.map(o=>this.fileService.createFile(o.resource,o.contents,{overwrite:o.overwrite}))):l=await v.settled(e.map(o=>this.fileService.createFolder(o.resource)))}catch(o){throw await this._onDidFailWorkingCopyFileOperation.fireAsync(t,d.None),o}return await this._onDidRunWorkingCopyFileOperation.fireAsync(t,d.None),l}async move(e,i,r){return this.doMoveOrCopy(e,!0,i,r)}async copy(e,i,r){return this.doMoveOrCopy(e,!1,i,r)}async doMoveOrCopy(e,i,r,n){const a=[];for(const{file:{source:o,target:p},overwrite:s}of e){const g=await(i?this.fileService.canMove(o,p,s):this.fileService.canCopy(o,p,s));if(g instanceof Error)throw g}const t=e.map(o=>o.file);await this.runFileOperationParticipants(t,i?c.MOVE:c.COPY,n,r);const l={correlationId:this.correlationIds++,operation:i?c.MOVE:c.COPY,files:t};await this._onWillRunWorkingCopyFileOperation.fireAsync(l,d.None);try{for(const{file:{source:o,target:p},overwrite:s}of e){if(!this.uriIdentityService.extUri.isEqual(o,p)){const g=i?[...this.getDirty(o),...this.getDirty(p)]:this.getDirty(p);await v.settled(g.map(k=>k.revert({soft:!0})))}i?a.push(await this.fileService.move(o,p,s)):a.push(await this.fileService.copy(o,p,s))}}catch(o){throw await this._onDidFailWorkingCopyFileOperation.fireAsync(l,d.None),o}return await this._onDidRunWorkingCopyFileOperation.fireAsync(l,d.None),a}async delete(e,i,r){for(const t of e){const l=await this.fileService.canDelete(t.resource,{recursive:t.recursive,useTrash:t.useTrash});if(l instanceof Error)throw l}const n=e.map(t=>({target:t.resource}));await this.runFileOperationParticipants(n,c.DELETE,r,i);const a={correlationId:this.correlationIds++,operation:c.DELETE,files:n};await this._onWillRunWorkingCopyFileOperation.fireAsync(a,d.None);for(const t of e){const l=this.getDirty(t.resource);await v.settled(l.map(o=>o.revert({soft:!0})))}try{for(const t of e)await this.fileService.del(t.resource,{recursive:t.recursive,useTrash:t.useTrash})}catch(t){throw await this._onDidFailWorkingCopyFileOperation.fireAsync(a,d.None),t}await this._onDidRunWorkingCopyFileOperation.fireAsync(a,d.None)}fileOperationParticipants=this._register(this.instantiationService.createInstance(M));addFileOperationParticipant(e){return this.fileOperationParticipants.addFileOperationParticipant(e)}runFileOperationParticipants(e,i,r,n){return this.fileOperationParticipants.participate(e,i,r,n)}saveParticipants=this._register(this.instantiationService.createInstance(E));get hasSaveParticipants(){return this.saveParticipants.length>0}addSaveParticipant(e){return this.saveParticipants.addSaveParticipant(e)}runSaveParticipants(e,i,r,n){return this.saveParticipants.participate(e,i,r,n)}workingCopyProviders=[];registerWorkingCopyProvider(e){const i=O(this.workingCopyProviders,e);return P(i)}getDirty(e){const i=new Set;for(const r of this.workingCopyProviders)for(const n of r(e))n.isDirty()&&i.add(n);return Array.from(i)}};C=u([f(0,m),f(1,x),f(2,T),f(3,U)],C),R(b,C,w.Delayed);export{b as IWorkingCopyFileService,C as WorkingCopyFileService};
