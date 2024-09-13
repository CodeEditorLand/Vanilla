import{Emitter as r}from"../../../../base/common/event.js";import{Disposable as t,DisposableMap as s,DisposableStore as a,toDisposable as d}from"../../../../base/common/lifecycle.js";import{ResourceMap as g}from"../../../../base/common/map.js";import{URI as p}from"../../../../base/common/uri.js";import{InstantiationType as y,registerSingleton as C}from"../../../../platform/instantiation/common/extensions.js";import{createDecorator as l}from"../../../../platform/instantiation/common/instantiation.js";const h=l("workingCopyService");class f extends t{_onDidRegister=this._register(new r);onDidRegister=this._onDidRegister.event;_onDidUnregister=this._register(new r);onDidUnregister=this._onDidUnregister.event;_onDidChangeDirty=this._register(new r);onDidChangeDirty=this._onDidChangeDirty.event;_onDidChangeContent=this._register(new r);onDidChangeContent=this._onDidChangeContent.event;_onDidSave=this._register(new r);onDidSave=this._onDidSave.event;get workingCopies(){return Array.from(this._workingCopies.values())}_workingCopies=new Set;mapResourceToWorkingCopies=new g;mapWorkingCopyToListeners=this._register(new s);registerWorkingCopy(e){let i=this.mapResourceToWorkingCopies.get(e.resource);if(i?.has(e.typeId))throw new Error(`Cannot register more than one working copy with the same resource ${e.resource.toString()} and type ${e.typeId}.`);this._workingCopies.add(e),i||(i=new Map,this.mapResourceToWorkingCopies.set(e.resource,i)),i.set(e.typeId,e);const o=new a;return o.add(e.onDidChangeContent(()=>this._onDidChangeContent.fire(e))),o.add(e.onDidChangeDirty(()=>this._onDidChangeDirty.fire(e))),o.add(e.onDidSave(n=>this._onDidSave.fire({workingCopy:e,...n}))),this.mapWorkingCopyToListeners.set(e,o),this._onDidRegister.fire(e),e.isDirty()&&this._onDidChangeDirty.fire(e),d(()=>{this.unregisterWorkingCopy(e),this._onDidUnregister.fire(e)})}unregisterWorkingCopy(e){this._workingCopies.delete(e);const i=this.mapResourceToWorkingCopies.get(e.resource);i?.delete(e.typeId)&&i.size===0&&this.mapResourceToWorkingCopies.delete(e.resource),e.isDirty()&&this._onDidChangeDirty.fire(e),this.mapWorkingCopyToListeners.deleteAndDispose(e)}has(e){return p.isUri(e)?this.mapResourceToWorkingCopies.has(e):this.mapResourceToWorkingCopies.get(e.resource)?.has(e.typeId)??!1}get(e){return this.mapResourceToWorkingCopies.get(e.resource)?.get(e.typeId)}getAll(e){const i=this.mapResourceToWorkingCopies.get(e);if(i)return Array.from(i.values())}get hasDirty(){for(const e of this._workingCopies)if(e.isDirty())return!0;return!1}get dirtyCount(){let e=0;for(const i of this._workingCopies)i.isDirty()&&e++;return e}get dirtyWorkingCopies(){return this.workingCopies.filter(e=>e.isDirty())}get modifiedCount(){let e=0;for(const i of this._workingCopies)i.isModified()&&e++;return e}get modifiedWorkingCopies(){return this.workingCopies.filter(e=>e.isModified())}isDirty(e,i){const o=this.mapResourceToWorkingCopies.get(e);if(o){if(typeof i=="string")return o.get(i)?.isDirty()??!1;for(const[,n]of o)if(n.isDirty())return!0}return!1}}C(h,f,y.Delayed);export{h as IWorkingCopyService,f as WorkingCopyService};
