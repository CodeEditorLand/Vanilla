var D=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var y=(d,t,e,i)=>{for(var o=i>1?void 0:i?C(t,e):t,r=d.length-1,n;r>=0;r--)(n=d[r])&&(o=(i?n(t,e,o):n(o))||o);return i&&o&&D(t,e,o),o},s=(d,t)=>(e,i)=>t(e,i,d);import{IInstantiationService as k}from"../../../../platform/instantiation/common/instantiation.js";import{URI as m}from"../../../../base/common/uri.js";import{CellUri as R,NotebookSetting as w,NotebookWorkingCopyTypeIdentifier as M}from"./notebookCommon.js";import{NotebookFileWorkingCopyModelFactory as E,SimpleNotebookEditorModel as I}from"./notebookEditorModel.js";import{combinedDisposable as U,DisposableStore as W,dispose as u,ReferenceCollection as F,toDisposable as x}from"../../../../base/common/lifecycle.js";import{INotebookService as S}from"./notebookService.js";import{AsyncEmitter as T,Emitter as _}from"../../../../base/common/event.js";import{IExtensionService as L}from"../../../services/extensions/common/extensions.js";import{IUriIdentityService as O}from"../../../../platform/uriIdentity/common/uriIdentity.js";import"./notebookEditorModelResolverService.js";import{ResourceMap as P}from"../../../../base/common/map.js";import{FileWorkingCopyManager as A}from"../../../services/workingCopy/common/fileWorkingCopyManager.js";import{Schemas as g}from"../../../../base/common/network.js";import{NotebookProviderInfo as $}from"./notebookProvider.js";import{assertIsDefined as V}from"../../../../base/common/types.js";import{CancellationToken as j}from"../../../../base/common/cancellation.js";import{IConfigurationService as q}from"../../../../platform/configuration/common/configuration.js";import"../../../../platform/files/common/files.js";import{ITelemetryService as B}from"../../../../platform/telemetry/common/telemetry.js";import{INotebookLoggingService as K}from"./notebookLoggingService.js";let h=class extends F{constructor(e,i,o,r,n){super();this._instantiationService=e;this._notebookService=i;this._configurationService=o;this._telemetryService=r;this._notebookLoggingService=n}_disposables=new W;_workingCopyManagers=new Map;_modelListener=new Map;_onDidSaveNotebook=new _;onDidSaveNotebook=this._onDidSaveNotebook.event;_onDidChangeDirty=new _;onDidChangeDirty=this._onDidChangeDirty.event;_dirtyStates=new P;modelsToDispose=new Set;dispose(){this._disposables.dispose(),this._onDidSaveNotebook.dispose(),this._onDidChangeDirty.dispose(),u(this._modelListener.values()),u(this._workingCopyManagers.values())}isDirty(e){return this._dirtyStates.get(e)??!1}async createReferencedObject(e,i,o,r,n){this.modelsToDispose.delete(e);const p=m.parse(e),l=M.create(i);let b=this._workingCopyManagers.get(l);if(!b){const v=new E(i,this._notebookService,this._configurationService,this._telemetryService,this._notebookLoggingService);b=this._instantiationService.createInstance(A,l,v,v),this._workingCopyManagers.set(l,b)}const N=n||i==="interactive"&&this._configurationService.getValue(w.InteractiveWindowPromptToSave)!==!0,a=await this._instantiationService.createInstance(I,p,o,i,b,N).load({limits:r});let c;return this._modelListener.set(a,U(a.onDidSave(()=>this._onDidSaveNotebook.fire(a.resource)),a.onDidChangeDirty(()=>{const v=a.isDirty();this._dirtyStates.set(a.resource,v),v&&!c?c=this.acquire(e,i):c&&(c.dispose(),c=void 0),this._onDidChangeDirty.fire(a)}),x(()=>c?.dispose()))),a}destroyReferencedObject(e,i){this.modelsToDispose.add(e),(async()=>{try{const o=await i;if(!this.modelsToDispose.has(e)||(o instanceof I&&await o.canDispose(),!this.modelsToDispose.has(e)))return;this._modelListener.get(o)?.dispose(),this._modelListener.delete(o),o.dispose()}catch(o){this._notebookLoggingService.error("NotebookModelCollection","FAILED to destory notebook - "+o)}finally{this.modelsToDispose.delete(e)}})()}};h=y([s(0,k),s(1,S),s(2,q),s(3,B),s(4,K)],h);let f=class{constructor(t,e,i,o){this._notebookService=e;this._extensionService=i;this._uriIdentService=o;this._data=t.createInstance(h),this.onDidSaveNotebook=this._data.onDidSaveNotebook,this.onDidChangeDirty=this._data.onDidChangeDirty}_serviceBrand;_data;onDidSaveNotebook;onDidChangeDirty;_onWillFailWithConflict=new T;onWillFailWithConflict=this._onWillFailWithConflict.event;dispose(){this._data.dispose()}isDirty(t){return this._data.isDirty(t)}createUntitledUri(t){const e=this._notebookService.getContributedNotebookType(V(t));if(!e)throw new Error("UNKNOWN notebook type: "+t);const i=$.possibleFileEnding(e.selectors)??"";for(let o=1;;o++){const r=m.from({scheme:g.untitled,path:`Untitled-${o}${i}`,query:t});if(!this._notebookService.getNotebookTextModel(r))return r}}async validateResourceViewType(t,e){if(!t&&!e)throw new Error("Must provide at least one of resource or viewType");if(t?.scheme===R.scheme)throw new Error(`CANNOT open a cell-uri as notebook. Tried with ${t.toString()}`);const i=this._uriIdentService.asCanonicalUri(t??this.createUntitledUri(e)),o=this._notebookService.getNotebookTextModel(i);if(!e)if(o)e=o.viewType;else{await this._extensionService.whenInstalledExtensionsRegistered();const r=this._notebookService.getContributedNotebookTypes(i);e=r.find(n=>n.priority==="exclusive")?.id??r.find(n=>n.priority==="default")?.id??r[0]?.id}if(!e)throw new Error(`Missing viewType for '${i}'`);if(o&&o.viewType!==e){await this._onWillFailWithConflict.fireAsync({resource:i,viewType:e},j.None);const r=this._notebookService.getNotebookTextModel(i)?.viewType;if(r&&r!==e)throw new Error(`A notebook with view type '${r}' already exists for '${i}', CANNOT create another notebook with view type ${e}`)}return{resource:i,viewType:e}}async createUntitledNotebookTextModel(t){const e=this._uriIdentService.asCanonicalUri(this.createUntitledUri(t));return await this._notebookService.createNotebookTextModel(t,e)}async resolve(t,e,i){let o,r;m.isUri(t)?o=t:t.untitledResource&&(t.untitledResource.scheme===g.untitled?o=t.untitledResource:(o=t.untitledResource.with({scheme:g.untitled}),r=!0));const n=await this.validateResourceViewType(o,e),p=this._data.acquire(n.resource.toString(),n.viewType,r,i?.limits,i?.scratchpad);try{return{object:await p.object,dispose(){p.dispose()}}}catch(l){throw p.dispose(),l}}};f=y([s(0,k),s(1,S),s(2,L),s(3,O)],f);export{f as NotebookModelResolverServiceImpl};
