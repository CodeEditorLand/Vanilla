var m=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var p=(u,d,e,t)=>{for(var i=t>1?void 0:t?g(d,e):d,r=u.length-1,o;r>=0;r--)(o=u[r])&&(i=(t?o(d,e,i):o(i))||i);return t&&i&&m(d,e,i),i},s=(u,d)=>(e,t)=>d(e,t,u);import{Event as R}from"../../../../base/common/event.js";import"../../../../base/common/lifecycle.js";import*as v from"../../../../base/common/path.js";import{isEqual as h,joinPath as M}from"../../../../base/common/resources.js";import"../../../../base/common/uri.js";import{PLAINTEXT_LANGUAGE_ID as S}from"../../../../editor/common/languages/modesRegistry.js";import{ITextModelService as b}from"../../../../editor/common/services/resolverService.js";import{IConfigurationService as y}from"../../../../platform/configuration/common/configuration.js";import{IFileDialogService as D}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as E}from"../../../../platform/instantiation/common/instantiation.js";import{EditorInputCapabilities as l}from"../../../common/editor.js";import{EditorInput as k}from"../../../common/editor/editorInput.js";import{NotebookSetting as N}from"../../notebook/common/notebookCommon.js";import{NotebookEditorInput as C}from"../../notebook/common/notebookEditorInput.js";import{INotebookService as w}from"../../notebook/common/notebookService.js";import{IInteractiveDocumentService as U}from"./interactiveDocumentService.js";import{IInteractiveHistoryService as x}from"./interactiveHistoryService.js";let n=class extends k{constructor(e,t,i,r,o,c,a,f,L,P,_){const I=C.getOrCreate(o,e,void 0,"interactive",{});super();this._notebookService=L;this._fileDialogService=P;this.isScratchpad=_.getValue(N.InteractiveWindowPromptToSave)!==!0,this._notebookEditorInput=I,this._register(this._notebookEditorInput),this.name=i??n.windowNames[e.path]??v.basename(e.path,v.extname(e.path)),this._initLanguage=r,this._resource=e,this._inputResource=t,this._inputResolver=null,this._editorModelReference=null,this._inputModelRef=null,this._textModelService=c,this._interactiveDocumentService=a,this._historyService=f,this._registerListeners()}static create(e,t,i,r,o){return e.createInstance(n,t,i,r,o)}static windowNames={};static setName(e,t){t&&(this.windowNames[e.path]=t)}static ID="workbench.input.interactive";get editorId(){return"interactive"}get typeId(){return n.ID}name;isScratchpad;get language(){return this._inputModelRef?.object.textEditorModel.getLanguageId()??this._initLanguage}_initLanguage;_notebookEditorInput;get notebookEditorInput(){return this._notebookEditorInput}get editorInputs(){return[this._notebookEditorInput]}_resource;get resource(){return this._resource}_inputResource;get inputResource(){return this._inputResource}_inputResolver;_editorModelReference;_inputModelRef;get primary(){return this._notebookEditorInput}_textModelService;_interactiveDocumentService;_historyService;_registerListeners(){const e=R.once(this.primary.onWillDispose);this._register(e(()=>{this.isDisposed()||this.dispose()})),this._register(this.primary.onDidChangeDirty(()=>this._onDidChangeDirty.fire())),this._register(this.primary.onDidChangeLabel(()=>this._onDidChangeLabel.fire())),this._register(this.primary.onDidChangeCapabilities(()=>this._onDidChangeCapabilities.fire()))}get capabilities(){const e=this.isScratchpad?l.Scratchpad:0;return l.Untitled|l.Readonly|e}async _resolveEditorModel(){return this._editorModelReference||(this._editorModelReference=await this._notebookEditorInput.resolve()),this._editorModelReference}async resolve(){return this._editorModelReference?this._editorModelReference:this._inputResolver?this._inputResolver:(this._inputResolver=this._resolveEditorModel(),this._inputResolver)}async resolveInput(e){if(this._inputModelRef)return this._inputModelRef.object.textEditorModel;const t=e??this._initLanguage??S;return this._interactiveDocumentService.willCreateInteractiveDocument(this.resource,this.inputResource,t),this._inputModelRef=await this._textModelService.createModelReference(this.inputResource),this._inputModelRef.object.textEditorModel}async save(e,t){if(this._editorModelReference)return this.hasCapability(l.Untitled)?this.saveAs(e,t):(await this._editorModelReference.save(t),this)}async saveAs(e,t){if(!this._editorModelReference||!this._notebookService.getContributedNotebookType("interactive"))return;const r=this.getName()+".ipynb",o=M(await this._fileDialogService.defaultFilePath(),r),c=await this._fileDialogService.pickFileToSave(o,t?.availableFileSystems);if(!c)return;const a=await this._editorModelReference.saveAs(c);return a&&"resource"in a&&a.resource&&this._notebookService.getNotebookTextModel(a.resource)?.dispose(),a}matches(e){return super.matches(e)?!0:e instanceof n?h(this.resource,e.resource)&&h(this.inputResource,e.inputResource):!1}getName(){return this.name}isDirty(){return this.isScratchpad?!1:this._editorModelReference?.isDirty()??!1}isModified(){return this._editorModelReference?.isModified()??!1}async revert(e,t){this._editorModelReference&&this._editorModelReference.isDirty()&&await this._editorModelReference.revert(t)}dispose(){this._editorModelReference?.revert({soft:!0}),this._notebookEditorInput?.dispose(),this._editorModelReference?.dispose(),this._editorModelReference=null,this._interactiveDocumentService.willRemoveInteractiveDocument(this.resource,this.inputResource),this._inputModelRef?.dispose(),this._inputModelRef=null,super.dispose()}get historyService(){return this._historyService}};n=p([s(4,E),s(5,b),s(6,U),s(7,x),s(8,w),s(9,D),s(10,y)],n);export{n as InteractiveEditorInput};
