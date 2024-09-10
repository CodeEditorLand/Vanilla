var P=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var I=(c,t,e,i)=>{for(var r=i>1?void 0:i?L(t,e):t,o=c.length-1,s;o>=0;o--)(s=c[o])&&(r=(i?s(t,e,r):s(r))||r);return i&&r&&P(t,e,r),r},l=(c,t)=>(e,i)=>t(e,i,c);import"./media/searchEditor.css";import{Emitter as C}from"../../../../base/common/event.js";import{basename as W}from"../../../../base/common/path.js";import{extname as _,isEqual as y,joinPath as N}from"../../../../base/common/resources.js";import{URI as A}from"../../../../base/common/uri.js";import{TrackedRangeStickiness as z}from"../../../../editor/common/model.js";import{IModelService as q}from"../../../../editor/common/services/model.js";import{localize as g}from"../../../../nls.js";import{IFileDialogService as G}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as b}from"../../../../platform/instantiation/common/instantiation.js";import{IStorageService as M,StorageScope as k,StorageTarget as D}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as V}from"../../../../platform/telemetry/common/telemetry.js";import{EditorResourceAccessor as B,EditorInputCapabilities as m}from"../../../common/editor.js";import{Memento as U}from"../../../common/memento.js";import{SearchEditorFindMatchClass as E,SearchEditorInputTypeId as H,SearchEditorScheme as w,SearchEditorWorkingCopyTypeId as K}from"./constants.js";import{SearchEditorModel as Q,searchEditorModelFactory as p}from"./searchEditorModel.js";import{defaultSearchConfig as $,parseSavedSearchEditor as j,serializeSearchConfiguration as X}from"./searchEditorSerialization.js";import{IPathService as J}from"../../../services/path/common/pathService.js";import{ITextFileService as Y}from"../../../services/textfile/common/textfiles.js";import{IWorkingCopyService as Z}from"../../../services/workingCopy/common/workingCopyService.js";import{WorkingCopyCapabilities as F}from"../../../services/workingCopy/common/workingCopy.js";import{IConfigurationService as ee}from"../../../../platform/configuration/common/configuration.js";import{bufferToReadable as ie,VSBuffer as re}from"../../../../base/common/buffer.js";import{EditorInput as te}from"../../../common/editor/editorInput.js";import{Codicon as oe}from"../../../../base/common/codicons.js";import{registerIcon as ne}from"../../../../platform/theme/common/iconRegistry.js";const v=".code-search",se=ne("search-editor-label-icon",oe.search,g("searchEditorLabelIcon","Icon of the search editor label."));let a=class extends te{constructor(e,i,r,o,s,u,f,S,T,d){super();this.modelUri=e;this.backingUri=i;this.modelService=r;this.textFileService=o;this.fileDialogService=s;this.instantiationService=u;this.workingCopyService=f;this.telemetryService=S;this.pathService=T;if(this.model=u.createInstance(Q,e),this.modelUri.scheme!==w)throw Error("SearchEditorInput must be invoked with a SearchEditorScheme uri");this.memento=new U(a.ID,d),this._register(d.onWillSaveState(()=>this.memento.saveMemento()));const n=this,x=new class{typeId=K;resource=n.modelUri;get name(){return n.getName()}capabilities=n.hasCapability(m.Untitled)?F.Untitled:F.None;onDidChangeDirty=n.onDidChangeDirty;onDidChangeContent=n.onDidChangeContent;onDidSave=n.onDidSave;isDirty(){return n.isDirty()}isModified(){return n.isDirty()}backup(h){return n.backup(h)}save(h){return n.save(0,h).then(O=>!!O)}revert(h){return n.revert(0,h)}};this._register(this.workingCopyService.registerWorkingCopy(x))}static ID=H;get typeId(){return a.ID}get editorId(){return this.typeId}getIcon(){return se}get capabilities(){let e=m.Singleton;return this.backingUri||(e|=m.Untitled),e}memento;dirty=!1;lastLabel;_onDidChangeContent=this._register(new C);onDidChangeContent=this._onDidChangeContent.event;_onDidSave=this._register(new C);onDidSave=this._onDidSave.event;oldDecorationsIDs=[];get resource(){return this.backingUri||this.modelUri}ongoingSearchOperation;model;_cachedResultsModel;_cachedConfigurationModel;async save(e,i){if(!(await this.resolveModels()).resultsModel.isDisposed())return this.backingUri?(await this.textFileService.write(this.backingUri,await this.serializeForDisk(),i),this.setDirty(!1),this._onDidSave.fire({reason:i?.reason,source:i?.source}),this):this.saveAs(e,i)}tryReadConfigSync(){return this._cachedConfigurationModel?.config}async serializeForDisk(){const{configurationModel:e,resultsModel:i}=await this.resolveModels();return X(e.config)+`
`+i.getValue()}configChangeListenerDisposable;registerConfigChangeListeners(e){this.configChangeListenerDisposable?.dispose(),this.isDisposed()||(this.configChangeListenerDisposable=e.onConfigDidUpdate(()=>{this.lastLabel!==this.getName()&&(this._onDidChangeLabel.fire(),this.lastLabel=this.getName()),this.memento.getMemento(k.WORKSPACE,D.MACHINE).searchConfig=e.config}),this._register(this.configChangeListenerDisposable))}async resolveModels(){return this.model.resolve().then(e=>(this._cachedResultsModel=e.resultsModel,this._cachedConfigurationModel=e.configurationModel,this.lastLabel!==this.getName()&&(this._onDidChangeLabel.fire(),this.lastLabel=this.getName()),this.registerConfigChangeListeners(e.configurationModel),e))}async saveAs(e,i){const r=await this.fileDialogService.pickFileToSave(await this.suggestFileName(),i?.availableFileSystems);if(r){this.telemetryService.publicLog2("searchEditor/saveSearchResults");const o=await this.serializeForDisk();if(await this.textFileService.create([{resource:r,value:o,options:{overwrite:!0}}])){if(this.setDirty(!1),!y(r,this.modelUri)){const s=this.instantiationService.invokeFunction(R,{fileUri:r,from:"existingFile"});return s.setMatchRanges(this.getMatchRanges()),s}return this}}}getName(e=12){const i=o=>o.length<e?o:`${o.slice(0,e-3)}...`;if(this.backingUri){const o=B.getOriginalUri(this);return g("searchTitle.withQuery","Search: {0}",W((o??this.backingUri).path,v))}const r=this._cachedConfigurationModel?.config?.query?.trim();return r?g("searchTitle.withQuery","Search: {0}",i(r)):g("searchTitle","Search")}setDirty(e){const i=this.dirty;this.dirty=e,i!==e&&this._onDidChangeDirty.fire()}isDirty(){return this.dirty}async rename(e,i){if(_(i)===v)return{editor:this.instantiationService.invokeFunction(R,{from:"existingFile",fileUri:i})}}dispose(){this.modelService.destroyModel(this.modelUri),super.dispose()}matches(e){return super.matches(e)?!0:e instanceof a?!!(e.modelUri.fragment&&e.modelUri.fragment===this.modelUri.fragment)||!!(e.backingUri&&y(e.backingUri,this.backingUri)):!1}getMatchRanges(){return(this._cachedResultsModel?.getAllDecorations()??[]).filter(e=>e.options.className===E).filter(({range:e})=>!(e.startColumn===1&&e.endColumn===1)).map(({range:e})=>e)}async setMatchRanges(e){this.oldDecorationsIDs=(await this.resolveModels()).resultsModel.deltaDecorations(this.oldDecorationsIDs,e.map(i=>({range:i,options:{description:"search-editor-find-match",className:E,stickiness:z.NeverGrowsWhenTypingAtEdges}})))}async revert(e,i){if(i?.soft){this.setDirty(!1);return}if(this.backingUri){const{config:r,text:o}=await this.instantiationService.invokeFunction(j,this.backingUri),{resultsModel:s,configurationModel:u}=await this.resolveModels();s.setValue(o),u.updateConfig(r)}else(await this.resolveModels()).resultsModel.setValue("");super.revert(e,i),this.setDirty(!1)}async backup(e){const i=await this.serializeForDisk();return e.isCancellationRequested?{}:{content:ie(re.fromString(i))}}async suggestFileName(){const i=((await this.resolveModels()).configurationModel.config.query.replace(/[^\w \-_]+/g,"_")||"Search")+v;return N(await this.fileDialogService.defaultFilePath(this.pathService.defaultUriScheme),i)}toUntyped(){if(!this.hasCapability(m.Untitled))return{resource:this.resource,options:{override:a.ID}}}};a=I([l(2,q),l(3,Y),l(4,G),l(5,b),l(6,Z),l(7,V),l(8,J),l(9,M)],a);const R=(c,t)=>{const e=c.get(M),i=c.get(ee),r=c.get(b),o=t.from==="model"?t.modelUri:A.from({scheme:w,fragment:`${Math.random()}`});if(!p.models.has(o))if(t.from==="existingFile")r.invokeFunction(s=>p.initializeModelFromExistingFile(s,o,t.fileUri));else{const s=i.getValue("search").searchEditor,u=s.reusePriorSearchConfiguration,f=s.defaultNumberOfContextLines,S=u?new U(a.ID,e).getMemento(k.WORKSPACE,D.MACHINE).searchConfig:{},d={...$(),...S,...t.config};f!=null&&(d.contextLines=t?.config?.contextLines??f),t.from==="rawData"?(t.resultsContents&&(d.contextLines=0),r.invokeFunction(n=>p.initializeModelFromRawData(n,o,d,t.resultsContents))):r.invokeFunction(n=>p.initializeModelFromExistingModel(n,o,d))}return r.createInstance(a,o,t.from==="existingFile"?t.fileUri:t.from==="model"?t.backupOf:void 0)};export{v as SEARCH_EDITOR_EXT,a as SearchEditorInput,R as getOrMakeSearchEditorInput};
