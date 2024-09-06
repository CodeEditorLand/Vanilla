var C=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var l=(g,a,e,t)=>{for(var i=t>1?void 0:t?m(a,e):a,n=g.length-1,s;n>=0;n--)(s=g[n])&&(i=(t?s(a,e,i):s(i))||i);return t&&i&&C(a,e,i),i},r=(g,a)=>(e,t)=>a(e,t,g);import{bufferToReadable as y,bufferToStream as I,VSBuffer as h}from"../../../../../vs/base/common/buffer.js";import"../../../../../vs/base/common/cancellation.js";import{Emitter as d}from"../../../../../vs/base/common/event.js";import{getCharContainingOffset as E}from"../../../../../vs/base/common/strings.js";import{assertIsDefined as S}from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import{ensureValidWordDefinition as D}from"../../../../../vs/editor/common/core/wordHelper.js";import{ILanguageService as L}from"../../../../../vs/editor/common/languages/language.js";import"../../../../../vs/editor/common/model.js";import{createTextBufferFactory as _,createTextBufferFactoryFromStream as F}from"../../../../../vs/editor/common/model/textModel.js";import{IModelService as b}from"../../../../../vs/editor/common/services/model.js";import"../../../../../vs/editor/common/services/resolverService.js";import{ITextResourceConfigurationService as M}from"../../../../../vs/editor/common/services/textResourceConfiguration.js";import"../../../../../vs/editor/common/textModelEvents.js";import{IAccessibilityService as T}from"../../../../../vs/platform/accessibility/common/accessibility.js";import{ILabelService as N}from"../../../../../vs/platform/label/common/label.js";import"../../../../../vs/workbench/common/editor.js";import{BaseTextEditorModel as A}from"../../../../../vs/workbench/common/editor/textEditorModel.js";import{IEditorService as x}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{ILanguageDetectionService as R}from"../../../../../vs/workbench/services/languageDetection/common/languageDetectionWorkerService.js";import{UTF8 as u}from"../../../../../vs/workbench/services/textfile/common/encoding.js";import{ITextFileService as k}from"../../../../../vs/workbench/services/textfile/common/textfiles.js";import{NO_TYPE_ID as V,WorkingCopyCapabilities as W}from"../../../../../vs/workbench/services/workingCopy/common/workingCopy.js";import{IWorkingCopyBackupService as w}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyBackup.js";import{IWorkingCopyService as B}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyService.js";let o=class extends A{constructor(e,t,i,n,s,c,f,P,G,O,H,X,U,v,p){super(f,c,v,p);this.resource=e;this.hasAssociatedFilePath=t;this.initialValue=i;this.preferredLanguageId=n;this.preferredEncoding=s;this.workingCopyBackupService=P;this.textResourceConfigurationService=G;this.workingCopyService=O;this.textFileService=H;this.labelService=X;this.editorService=U;this._register(this.workingCopyService.registerWorkingCopy(this)),n&&this.setLanguageId(n),this.onConfigurationChange(void 0,!1),this.registerListeners()}static FIRST_LINE_NAME_MAX_LENGTH=40;static FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH=this.FIRST_LINE_NAME_MAX_LENGTH*10;static ACTIVE_EDITOR_LANGUAGE_ID="${activeEditorLanguage}";_onDidChangeContent=this._register(new d);onDidChangeContent=this._onDidChangeContent.event;_onDidChangeName=this._register(new d);onDidChangeName=this._onDidChangeName.event;_onDidChangeDirty=this._register(new d);onDidChangeDirty=this._onDidChangeDirty.event;_onDidChangeEncoding=this._register(new d);onDidChangeEncoding=this._onDidChangeEncoding.event;_onDidSave=this._register(new d);onDidSave=this._onDidSave.event;_onDidRevert=this._register(new d);onDidRevert=this._onDidRevert.event;typeId=V;capabilities=W.Untitled;configuredLabelFormat="content";cachedModelFirstLineWords=void 0;get name(){return this.configuredLabelFormat==="content"&&!this.hasAssociatedFilePath&&this.cachedModelFirstLineWords?this.cachedModelFirstLineWords:this.labelService.getUriBasenameLabel(this.resource)}registerListeners(){this._register(this.textResourceConfigurationService.onDidChangeConfiguration(e=>this.onConfigurationChange(e,!0)))}onConfigurationChange(e,t){if(!e||e.affectsConfiguration(this.resource,"files.encoding")){const i=this.textResourceConfigurationService.getValue(this.resource,"files.encoding");this.configuredEncoding!==i&&typeof i=="string"&&(this.configuredEncoding=i,t&&!this.preferredEncoding&&this._onDidChangeEncoding.fire())}if(!e||e.affectsConfiguration(this.resource,"workbench.editor.untitled.labelFormat")){const i=this.textResourceConfigurationService.getValue(this.resource,"workbench.editor.untitled.labelFormat");this.configuredLabelFormat!==i&&(i==="content"||i==="name")&&(this.configuredLabelFormat=i,t&&this._onDidChangeName.fire())}}setLanguageId(e,t){const i=e===o.ACTIVE_EDITOR_LANGUAGE_ID?this.editorService.activeTextEditorLanguageId:e;this.preferredLanguageId=i,i&&super.setLanguageId(i,t)}getLanguageId(){return this.textEditorModel?this.textEditorModel.getLanguageId():this.preferredLanguageId}configuredEncoding;getEncoding(){return this.preferredEncoding||this.configuredEncoding}async setEncoding(e){const t=this.getEncoding();this.preferredEncoding=e,t!==this.preferredEncoding&&this._onDidChangeEncoding.fire()}dirty=this.hasAssociatedFilePath||!!this.initialValue;isDirty(){return this.dirty}isModified(){return this.isDirty()}setDirty(e){this.dirty!==e&&(this.dirty=e,this._onDidChangeDirty.fire())}async save(e){const t=await this.textFileService.save(this.resource,e);return t&&this._onDidSave.fire({reason:e?.reason,source:e?.source}),!!t}async revert(){this.ignoreDirtyOnModelContentChange=!0;try{this.updateTextEditorModel(_(""))}finally{this.ignoreDirtyOnModelContentChange=!1}this.setDirty(!1),this._onDidRevert.fire()}async backup(e){let t;return this.isResolved()?t=await this.textFileService.getEncodedReadable(this.resource,this.createSnapshot()??void 0,{encoding:u}):typeof this.initialValue=="string"&&(t=y(h.fromString(this.initialValue))),{content:t}}ignoreDirtyOnModelContentChange=!1;async resolve(){let e=!1,t=!1;if(this.textEditorModel)this.updateTextEditorModel(void 0,this.preferredLanguageId);else{let n;const s=await this.workingCopyBackupService.resolve(this);s?(n=s.value,t=!0):n=I(h.fromString(this.initialValue||""));const c=await F(await this.textFileService.getDecodedStream(this.resource,n,{encoding:u}));this.createTextEditorModel(c,this.resource,this.preferredLanguageId),e=!0}const i=S(this.textEditorModel);return this.installModelListeners(i),e&&((t||this.initialValue)&&this.updateNameFromFirstLine(i),this.setDirty(this.hasAssociatedFilePath||!!t||!!this.initialValue),(t||this.initialValue)&&this._onDidChangeContent.fire()),super.resolve()}installModelListeners(e){this._register(e.onDidChangeContent(t=>this.onModelContentChanged(e,t))),this._register(e.onDidChangeLanguage(()=>this.onConfigurationChange(void 0,!0))),super.installModelListeners(e)}onModelContentChanged(e,t){this.ignoreDirtyOnModelContentChange||(!this.hasAssociatedFilePath&&e.getLineCount()===1&&e.getLineLength(1)===0?this.setDirty(!1):this.setDirty(!0)),t.changes.some(i=>(i.range.startLineNumber===1||i.range.endLineNumber===1)&&i.range.startColumn<=o.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH)&&this.updateNameFromFirstLine(e),this._onDidChangeContent.fire(),this.autoDetectLanguage()}updateNameFromFirstLine(e){if(this.hasAssociatedFilePath)return;let t,i=e.getValueInRange({startLineNumber:1,endLineNumber:1,startColumn:1,endColumn:o.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH+1}).trim().replace(/\s+/g," ").replace(/\u202E/g,"");i=i.substr(0,E(i,o.FIRST_LINE_NAME_MAX_LENGTH)[0]),i&&D().exec(i)&&(t=i),t!==this.cachedModelFirstLineWords&&(this.cachedModelFirstLineWords=t,this._onDidChangeName.fire())}isReadonly(){return!1}};o=l([r(5,L),r(6,b),r(7,w),r(8,M),r(9,B),r(10,k),r(11,N),r(12,x),r(13,R),r(14,T)],o);export{o as UntitledTextEditorModel};