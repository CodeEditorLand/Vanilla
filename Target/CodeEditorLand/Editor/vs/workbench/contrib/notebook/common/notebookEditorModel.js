var w=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var y=(l,t,e,i)=>{for(var o=i>1?void 0:i?I(t,e):t,r=l.length-1,n;r>=0;r--)(n=l[r])&&(o=(i?n(t,e,o):n(o))||o);return i&&o&&w(t,e,o),o},p=(l,t)=>(e,i)=>t(e,i,l);import{bufferToStream as M,streamToBuffer as D}from"../../../../base/common/buffer.js";import{CancellationError as v}from"../../../../base/common/errors.js";import{Emitter as h}from"../../../../base/common/event.js";import{Disposable as F,DisposableStore as W}from"../../../../base/common/lifecycle.js";import{Schemas as C}from"../../../../base/common/network.js";import{filter as m}from"../../../../base/common/objects.js";import{assertType as u}from"../../../../base/common/types.js";import{IConfigurationService as R}from"../../../../platform/configuration/common/configuration.js";import{ITelemetryService as N}from"../../../../platform/telemetry/common/telemetry.js";import{EditorModel as E}from"../../../common/editor/editorModel.js";import{NotebookCellsChangeType as T,NotebookSetting as S}from"./notebookCommon.js";import{INotebookLoggingService as P}from"./notebookLoggingService.js";import{INotebookService as U,SimpleNotebookProviderInfo as L}from"./notebookService.js";import{IFilesConfigurationService as O}from"../../../services/filesConfiguration/common/filesConfigurationService.js";import{SnapshotContext as z}from"../../../services/workingCopy/common/fileWorkingCopy.js";import{StoredFileWorkingCopyState as _}from"../../../services/workingCopy/common/storedFileWorkingCopy.js";import{WorkingCopyCapabilities as x}from"../../../services/workingCopy/common/workingCopy.js";let s=class extends E{constructor(e,i,o,r,n,g){super();this.resource=e;this._hasAssociatedFilePath=i;this.viewType=o;this._workingCopyManager=r;this._filesConfigurationService=g;this.scratchPad=n}_onDidChangeDirty=this._register(new h);_onDidSave=this._register(new h);_onDidChangeOrphaned=this._register(new h);_onDidChangeReadonly=this._register(new h);_onDidRevertUntitled=this._register(new h);onDidChangeDirty=this._onDidChangeDirty.event;onDidSave=this._onDidSave.event;onDidChangeOrphaned=this._onDidChangeOrphaned.event;onDidChangeReadonly=this._onDidChangeReadonly.event;onDidRevertUntitled=this._onDidRevertUntitled.event;_workingCopy;_workingCopyListeners=this._register(new W);scratchPad;dispose(){this._workingCopy?.dispose(),super.dispose()}get notebook(){return this._workingCopy?.model?.notebookModel}isResolved(){return!!this._workingCopy?.model?.notebookModel}async canDispose(){return this._workingCopy&&s._isStoredFileWorkingCopy(this._workingCopy)?this._workingCopyManager.stored.canDispose(this._workingCopy):!0}isDirty(){return this._workingCopy?.isDirty()??!1}isModified(){return this._workingCopy?.isModified()??!1}isOrphaned(){return s._isStoredFileWorkingCopy(this._workingCopy)&&this._workingCopy.hasState(_.ORPHAN)}hasAssociatedFilePath(){return!s._isStoredFileWorkingCopy(this._workingCopy)&&!!this._workingCopy?.hasAssociatedFilePath}isReadonly(){return s._isStoredFileWorkingCopy(this._workingCopy)?this._workingCopy?.isReadonly():this._filesConfigurationService.isReadonly(this.resource)}get hasErrorState(){return this._workingCopy&&"hasState"in this._workingCopy?this._workingCopy.hasState(_.ERROR):!1}revert(e){return u(this.isResolved()),this._workingCopy.revert(e)}save(e){return u(this.isResolved()),this._workingCopy.save(e)}async load(e){return!this._workingCopy||!this._workingCopy.model?(this.resource.scheme===C.untitled?(this._hasAssociatedFilePath?this._workingCopy=await this._workingCopyManager.resolve({associatedResource:this.resource}):this._workingCopy=await this._workingCopyManager.resolve({untitledResource:this.resource,isScratchpad:this.scratchPad}),this._workingCopy.onDidRevert(()=>this._onDidRevertUntitled.fire())):(this._workingCopy=await this._workingCopyManager.resolve(this.resource,{limits:e?.limits,reload:e?.forceReadFromFile?{async:!1,force:!0}:void 0}),this._workingCopyListeners.add(this._workingCopy.onDidSave(i=>this._onDidSave.fire(i))),this._workingCopyListeners.add(this._workingCopy.onDidChangeOrphaned(()=>this._onDidChangeOrphaned.fire())),this._workingCopyListeners.add(this._workingCopy.onDidChangeReadonly(()=>this._onDidChangeReadonly.fire()))),this._workingCopyListeners.add(this._workingCopy.onDidChangeDirty(()=>this._onDidChangeDirty.fire(),void 0)),this._workingCopyListeners.add(this._workingCopy.onWillDispose(()=>{this._workingCopyListeners.clear(),this._workingCopy?.model?.dispose()}))):await this._workingCopyManager.resolve(this.resource,{reload:{async:!e?.forceReadFromFile,force:e?.forceReadFromFile},limits:e?.limits}),u(this.isResolved()),this}async saveAs(e){const i=await this._workingCopyManager.saveAs(this.resource,e);if(i)return{resource:i.resource}}static _isStoredFileWorkingCopy(e){return!(e&&e.capabilities&x.Untitled)}};s=y([p(5,O)],s);class A extends F{constructor(e,i,o,r,n){super();this._notebookModel=e;this._notebookService=i;this._configurationService=o;this._telemetryService=r;this._notebookLogService=n;this.onWillDispose=e.onWillDispose.bind(e),this._register(e.onDidChangeContent(a=>{for(const d of a.rawEvents)if(d.kind!==T.Initialize&&!d.transient){this._onDidChangeContent.fire({isRedoing:!1,isUndoing:!1,isInitial:!1});break}}));const g=this._configurationService.getValue(S.remoteSaving);(g||e.uri.scheme===C.vscodeRemote)&&(this.configuration={backupDelay:1e4}),g&&this.setSaveDelegate().catch(console.error)}_onDidChangeContent=this._register(new h);onDidChangeContent=this._onDidChangeContent.event;onWillDispose;configuration=void 0;save;async setSaveDelegate(){await this.getNotebookSerializer(),this.save=async(e,i)=>{try{let o=this._notebookService.tryGetDataProviderSync(this.notebookModel.viewType)?.serializer;if(o||(this._notebookLogService.info("WorkingCopyModel","No serializer found for notebook model, checking if provider still needs to be resolved"),o=await this.getNotebookSerializer()),i.isCancellationRequested)throw new v;return await o.save(this._notebookModel.uri,this._notebookModel.versionId,e,i)}catch(o){throw i.isCancellationRequested||this._telemetryService.publicLogError2("notebook/SaveError",{isRemote:this._notebookModel.uri.scheme===C.vscodeRemote,error:o}),o}}}dispose(){this._notebookModel.dispose(),super.dispose()}get notebookModel(){return this._notebookModel}async snapshot(e,i){const o=await this.getNotebookSerializer(),r={metadata:m(this._notebookModel.metadata,a=>!o.options.transientDocumentMetadata[a]),cells:[]};let n=0;for(const a of this._notebookModel.cells){const d={cellKind:a.cellKind,language:a.language,mime:a.mime,source:a.getValue(),outputs:[],internalMetadata:a.internalMetadata},f=this._configurationService.getValue(S.outputBackupSizeLimit)*1024;if(e===z.Backup&&f>0&&(a.outputs.forEach(k=>{k.outputs.forEach(b=>{n+=b.data.byteLength})}),n>f))throw new Error("Notebook too large to backup");d.outputs=o.options.transientOutputs?[]:a.outputs,d.metadata=m(a.metadata,k=>!o.options.transientCellMetadata[k]),r.cells.push(d)}const g=await o.notebookToData(r);if(i.isCancellationRequested)throw new v;return M(g)}async update(e,i){const o=await this.getNotebookSerializer(),r=await D(e),n=await o.dataToNotebook(r);if(i.isCancellationRequested)throw new v;this._notebookLogService.info("WorkingCopyModel","Notebook content updated from file system - "+this._notebookModel.uri.toString()),this._notebookModel.reset(n.cells,n.metadata,o.options)}async getNotebookSerializer(){const e=await this._notebookService.withNotebookDataProvider(this.notebookModel.viewType);if(!(e instanceof L))throw new Error("CANNOT open file notebook with this provider");return e.serializer}get versionId(){return this._notebookModel.alternativeVersionId}pushStackElement(){this._notebookModel.pushStackElement()}}let c=class{constructor(t,e,i,o,r){this._viewType=t;this._notebookService=e;this._configurationService=i;this._telemetryService=o;this._notebookLogService=r}async createModel(t,e,i){const o=this._notebookService.getNotebookTextModel(t)??await this._notebookService.createNotebookTextModel(this._viewType,t,e);return new A(o,this._notebookService,this._configurationService,this._telemetryService,this._notebookLogService)}};c=y([p(1,U),p(2,R),p(3,N),p(4,P)],c);export{A as NotebookFileWorkingCopyModel,c as NotebookFileWorkingCopyModelFactory,s as SimpleNotebookEditorModel};
