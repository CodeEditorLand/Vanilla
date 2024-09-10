var R=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var y=(f,c,e,i)=>{for(var t=i>1?void 0:i?M(c,e):c,r=f.length-1,o;r>=0;r--)(o=f[r])&&(t=(i?o(c,e,t):o(t))||t);return i&&t&&R(c,e,t),t},n=(f,c)=>(e,i)=>c(e,i,f);import{localize as S}from"../../../../nls.js";import{Emitter as d}from"../../../../base/common/event.js";import{mark as E}from"../../../../base/common/performance.js";import{assertIsDefined as x}from"../../../../base/common/types.js";import{EncodingMode as T,ITextFileService as O,TextFileEditorModelState as l,TextFileResolveReason as _}from"./textfiles.js";import{SaveReason as g,SaveSourceRegistry as w}from"../../../common/editor.js";import{BaseTextEditorModel as b}from"../../../common/editor/textEditorModel.js";import{IWorkingCopyBackupService as L}from"../../workingCopy/common/workingCopyBackup.js";import{IFileService as k,FileOperationResult as u,FileChangeType as I,ETAG_DISABLED as p,NotModifiedSinceFileOperationError as P}from"../../../../platform/files/common/files.js";import{ILanguageService as A}from"../../../../editor/common/languages/language.js";import{IModelService as N}from"../../../../editor/common/services/model.js";import{timeout as F,TaskSequentializer as U}from"../../../../base/common/async.js";import{ILogService as B}from"../../../../platform/log/common/log.js";import{basename as V}from"../../../../base/common/path.js";import{IWorkingCopyService as z}from"../../workingCopy/common/workingCopyService.js";import{WorkingCopyCapabilities as W,NO_TYPE_ID as $}from"../../workingCopy/common/workingCopy.js";import{IFilesConfigurationService as q}from"../../filesConfiguration/common/filesConfigurationService.js";import{ILabelService as H}from"../../../../platform/label/common/label.js";import{CancellationToken as G,CancellationTokenSource as X}from"../../../../base/common/cancellation.js";import{UTF16be as j,UTF16le as Y,UTF8 as m,UTF8_with_bom as J}from"./encoding.js";import{createTextBufferFactoryFromStream as K}from"../../../../editor/common/model/textModel.js";import{ILanguageDetectionService as Q}from"../../languageDetection/common/languageDetectionWorkerService.js";import{IPathService as Z}from"../../path/common/pathService.js";import{extUri as ee}from"../../../../base/common/resources.js";import{IAccessibilityService as ie}from"../../../../platform/accessibility/common/accessibility.js";import{PLAINTEXT_LANGUAGE_ID as te}from"../../../../editor/common/languages/modesRegistry.js";import{IExtensionService as re}from"../../extensions/common/extensions.js";import{IProgressService as oe,ProgressLocation as se}from"../../../../platform/progress/common/progress.js";let h=class extends b{constructor(e,i,t,r,o,a,s,v,ne,ae,de,le,C,D,he,ce,ve){super(o,r,C,D);this.resource=e;this.preferredEncoding=i;this.preferredLanguageId=t;this.fileService=a;this.textFileService=s;this.workingCopyBackupService=v;this.logService=ne;this.workingCopyService=ae;this.filesConfigurationService=de;this.labelService=le;this.pathService=he;this.extensionService=ce;this.progressService=ve;this._register(this.workingCopyService.registerWorkingCopy(this)),this.registerListeners()}static TEXTFILE_SAVE_ENCODING_SOURCE=w.registerSource("textFileEncoding.source",S("textFileCreate.source","File Encoding Changed"));_onDidChangeContent=this._register(new d);onDidChangeContent=this._onDidChangeContent.event;_onDidResolve=this._register(new d);onDidResolve=this._onDidResolve.event;_onDidChangeDirty=this._register(new d);onDidChangeDirty=this._onDidChangeDirty.event;_onDidSaveError=this._register(new d);onDidSaveError=this._onDidSaveError.event;_onDidSave=this._register(new d);onDidSave=this._onDidSave.event;_onDidRevert=this._register(new d);onDidRevert=this._onDidRevert.event;_onDidChangeEncoding=this._register(new d);onDidChangeEncoding=this._onDidChangeEncoding.event;_onDidChangeOrphaned=this._register(new d);onDidChangeOrphaned=this._onDidChangeOrphaned.event;_onDidChangeReadonly=this._register(new d);onDidChangeReadonly=this._onDidChangeReadonly.event;typeId=$;capabilities=W.None;name=V(this.labelService.getUriLabel(this.resource));resourceHasExtension=!!ee.extname(this.resource);contentEncoding;versionId=0;bufferSavedVersionId;ignoreDirtyOnModelContentChange=!1;ignoreSaveFromSaveParticipants=!1;static UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD=500;lastModelContentChangeFromUndoRedo=void 0;lastResolvedFileStat;saveSequentializer=new U;dirty=!1;inConflictMode=!1;inOrphanMode=!1;inErrorMode=!1;registerListeners(){this._register(this.fileService.onDidFilesChange(e=>this.onDidFilesChange(e))),this._register(this.filesConfigurationService.onDidChangeFilesAssociation(()=>this.onDidChangeFilesAssociation())),this._register(this.filesConfigurationService.onDidChangeReadonly(()=>this._onDidChangeReadonly.fire()))}async onDidFilesChange(e){let i=!1,t;if(this.inOrphanMode?e.contains(this.resource,I.ADDED)&&(t=!1,i=!0):e.contains(this.resource,I.DELETED)&&(t=!0,i=!0),i&&this.inOrphanMode!==t){let r=!1;t&&(await F(100,G.None),this.isDisposed()?r=!0:r=!await this.fileService.exists(this.resource)),this.inOrphanMode!==r&&!this.isDisposed()&&this.setOrphaned(r)}}setOrphaned(e){this.inOrphanMode!==e&&(this.inOrphanMode=e,this._onDidChangeOrphaned.fire())}onDidChangeFilesAssociation(){if(!this.isResolved())return;const e=this.getFirstLineText(this.textEditorModel),i=this.getOrCreateLanguage(this.resource,this.languageService,this.preferredLanguageId,e);this.textEditorModel.setLanguage(i)}setLanguageId(e,i){super.setLanguageId(e,i),this.preferredLanguageId=e}async backup(e){let i;this.lastResolvedFileStat&&(i={mtime:this.lastResolvedFileStat.mtime,ctime:this.lastResolvedFileStat.ctime,size:this.lastResolvedFileStat.size,etag:this.lastResolvedFileStat.etag,orphaned:this.inOrphanMode});const t=await this.textFileService.getEncodedReadable(this.resource,this.createSnapshot()??void 0,{encoding:m});return{meta:i,content:t}}async revert(e){if(!this.isResolved())return;const i=this.dirty,t=this.doSetDirty(!1);if(!e?.soft)try{await this.forceResolveFromFile()}catch(o){if(o.fileOperationResult!==u.FILE_NOT_FOUND)throw t(),o}this._onDidRevert.fire(),i&&this._onDidChangeDirty.fire()}async resolve(e){if(this.trace("resolve() - enter"),E("code/willResolveTextFileEditorModel"),this.isDisposed()){this.trace("resolve() - exit - without resolving because model is disposed");return}if(!e?.contents&&(this.dirty||this.saveSequentializer.isRunning())){this.trace("resolve() - exit - without resolving because model is dirty or being saved");return}await this.doResolve(e),E("code/didResolveTextFileEditorModel")}async doResolve(e){if(e?.contents)return this.resolveFromBuffer(e.contents,e);if(!(!this.isResolved()&&await this.resolveFromBackup(e)))return this.resolveFromFile(e)}async resolveFromBuffer(e,i){this.trace("resolveFromBuffer()");let t,r,o,a;try{const v=await this.fileService.stat(this.resource);t=v.mtime,r=v.ctime,o=v.size,a=v.etag,this.setOrphaned(!1)}catch(v){t=Date.now(),r=Date.now(),o=0,a=p,this.setOrphaned(v.fileOperationResult===u.FILE_NOT_FOUND)}const s=await this.textFileService.encoding.getPreferredWriteEncoding(this.resource,this.preferredEncoding);this.resolveFromContent({resource:this.resource,name:this.name,mtime:t,ctime:r,size:o,etag:a,value:e,encoding:s.encoding,readonly:!1,locked:!1},!0,i)}async resolveFromBackup(e){const i=await this.workingCopyBackupService.resolve(this);let t=m;return i&&(t=(await this.textFileService.encoding.getPreferredWriteEncoding(this.resource,this.preferredEncoding)).encoding),!this.isResolved()?i?(await this.doResolveFromBackup(i,t,e),!0):!1:(this.trace("resolveFromBackup() - exit - without resolving because previously new model got created meanwhile"),!0)}async doResolveFromBackup(e,i,t){this.trace("doResolveFromBackup()"),this.resolveFromContent({resource:this.resource,name:this.name,mtime:e.meta?e.meta.mtime:Date.now(),ctime:e.meta?e.meta.ctime:Date.now(),size:e.meta?e.meta.size:0,etag:e.meta?e.meta.etag:p,value:await K(await this.textFileService.getDecodedStream(this.resource,e.value,{encoding:m})),encoding:i,readonly:!1,locked:!1},!0,t),e.meta?.orphaned&&this.setOrphaned(!0)}async resolveFromFile(e){this.trace("resolveFromFile()");const i=e?.forceReadFromFile,t=this.isResolved()||e?.allowBinary;let r;i?r=p:this.lastResolvedFileStat&&(r=this.lastResolvedFileStat.etag);const o=this.versionId;try{const a=await this.textFileService.readStream(this.resource,{acceptTextOnly:!t,etag:r,encoding:this.preferredEncoding,limits:e?.limits});if(this.setOrphaned(!1),o!==this.versionId){this.trace("resolveFromFile() - exit - without resolving because model content changed");return}return this.resolveFromContent(a,!1,e)}catch(a){const s=a.fileOperationResult;if(this.setOrphaned(s===u.FILE_NOT_FOUND),this.isResolved()&&s===u.FILE_NOT_MODIFIED_SINCE){a instanceof P&&this.updateLastResolvedFileStat(a.stat);return}if(this.isResolved()&&s===u.FILE_NOT_FOUND&&!i)return;throw a}}resolveFromContent(e,i,t){if(this.trace("resolveFromContent() - enter"),this.isDisposed()){this.trace("resolveFromContent() - exit - because model is disposed");return}this.updateLastResolvedFileStat({resource:this.resource,name:e.name,mtime:e.mtime,ctime:e.ctime,size:e.size,etag:e.etag,readonly:e.readonly,locked:e.locked,isFile:!0,isDirectory:!1,isSymbolicLink:!1,children:void 0});const r=this.contentEncoding;this.contentEncoding=e.encoding,this.preferredEncoding?this.updatePreferredEncoding(this.contentEncoding):r!==this.contentEncoding&&this._onDidChangeEncoding.fire(),this.textEditorModel?this.doUpdateTextModel(e.value):this.doCreateTextModel(e.resource,e.value),this.setDirty(!!i),this._onDidResolve.fire(t?.reason??_.OTHER)}doCreateTextModel(e,i){this.trace("doCreateTextModel()");const t=this.createTextEditorModel(i,e,this.preferredLanguageId);this.installModelListeners(t),this.autoDetectLanguage()}doUpdateTextModel(e){this.trace("doUpdateTextModel()"),this.ignoreDirtyOnModelContentChange=!0;try{this.updateTextEditorModel(e,this.preferredLanguageId)}finally{this.ignoreDirtyOnModelContentChange=!1}}installModelListeners(e){this._register(e.onDidChangeContent(i=>this.onModelContentChanged(e,i.isUndoing||i.isRedoing))),this._register(e.onDidChangeLanguage(()=>this.onMaybeShouldChangeEncoding())),super.installModelListeners(e)}onModelContentChanged(e,i){if(this.trace("onModelContentChanged() - enter"),this.versionId++,this.trace(`onModelContentChanged() - new versionId ${this.versionId}`),i&&(this.lastModelContentChangeFromUndoRedo=Date.now()),!this.ignoreDirtyOnModelContentChange&&!this.isReadonly())if(e.getAlternativeVersionId()===this.bufferSavedVersionId){this.trace("onModelContentChanged() - model content changed back to last saved version");const t=this.dirty;this.setDirty(!1),t&&this._onDidRevert.fire()}else this.trace("onModelContentChanged() - model content changed and marked as dirty"),this.setDirty(!0);this._onDidChangeContent.fire(),this.autoDetectLanguage()}async autoDetectLanguage(){await this.extensionService?.whenInstalledExtensionsRegistered();const e=this.getLanguageId();if(this.resource.scheme===this.pathService.defaultUriScheme&&(!e||e===te)&&!this.resourceHasExtension)return super.autoDetectLanguage()}async forceResolveFromFile(){this.isDisposed()||await this.textFileService.files.resolve(this.resource,{reload:{async:!1},forceReadFromFile:!0})}isDirty(){return this.dirty}isModified(){return this.isDirty()}setDirty(e){if(!this.isResolved())return;const i=this.dirty;this.doSetDirty(e),e!==i&&this._onDidChangeDirty.fire()}doSetDirty(e){const i=this.dirty,t=this.inConflictMode,r=this.inErrorMode,o=this.bufferSavedVersionId;return e?this.dirty=!0:(this.dirty=!1,this.inConflictMode=!1,this.inErrorMode=!1,this.updateSavedVersionId()),()=>{this.dirty=i,this.inConflictMode=t,this.inErrorMode=r,this.bufferSavedVersionId=o}}async save(e=Object.create(null)){return this.isResolved()?this.isReadonly()?(this.trace("save() - ignoring request for readonly resource"),!1):(this.hasState(l.CONFLICT)||this.hasState(l.ERROR))&&(e.reason===g.AUTO||e.reason===g.FOCUS_CHANGE||e.reason===g.WINDOW_CHANGE)?(this.trace("save() - ignoring auto save request for model that is in conflict or error"),!1):(this.trace("save() - enter"),await this.doSave(e),this.trace("save() - exit"),this.hasState(l.SAVED)):!1}async doSave(e){typeof e.reason!="number"&&(e.reason=g.EXPLICIT);const i=this.versionId;if(this.trace(`doSave(${i}) - enter with versionId ${i}`),this.ignoreSaveFromSaveParticipants){this.trace(`doSave(${i}) - exit - refusing to save() recursively from save participant`);return}if(this.saveSequentializer.isRunning(i))return this.trace(`doSave(${i}) - exit - found a running save for versionId ${i}`),this.saveSequentializer.running;if(!e.force&&!this.dirty){this.trace(`doSave(${i}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.dirty}, this.versionId: ${this.versionId})`);return}if(this.saveSequentializer.isRunning())return this.trace(`doSave(${i}) - exit - because busy saving`),this.saveSequentializer.cancelRunning(),this.saveSequentializer.queue(()=>this.doSave(e));this.isResolved()&&this.textEditorModel.pushStackElement();const t=new X;return this.progressService.withProgress({title:S("saveParticipants","Saving '{0}'",this.name),location:se.Window,cancellable:!0,delay:this.isDirty()?3e3:5e3},r=>this.doSaveSequential(i,e,r,t),()=>{t.cancel()}).finally(()=>{t.dispose()})}doSaveSequential(e,i,t,r){return this.saveSequentializer.run(e,(async()=>{if(this.isResolved()&&!i.skipSaveParticipants)try{if(i.reason===g.AUTO&&typeof this.lastModelContentChangeFromUndoRedo=="number"){const s=Date.now()-this.lastModelContentChangeFromUndoRedo;s<h.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD&&await F(h.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD-s)}if(!r.token.isCancellationRequested){this.ignoreSaveFromSaveParticipants=!0;try{await this.textFileService.files.runSaveParticipants(this,{reason:i.reason??g.EXPLICIT,savedFrom:i.from},t,r.token)}finally{this.ignoreSaveFromSaveParticipants=!1}}}catch(s){this.logService.error(`[text file model] runSaveParticipants(${e}) - resulted in an error: ${s.toString()}`,this.resource.toString())}if(r.token.isCancellationRequested||(r.dispose(),this.isDisposed())||!this.isResolved())return;e=this.versionId,this.inErrorMode=!1,t.report({message:S("saveTextFile","Writing into file...")}),this.trace(`doSave(${e}) - before write()`);const o=x(this.lastResolvedFileStat),a=this;return this.saveSequentializer.run(e,(async()=>{try{const s=await this.textFileService.write(o.resource,a.createSnapshot(),{mtime:o.mtime,encoding:this.getEncoding(),etag:i.ignoreModifiedSince||!this.filesConfigurationService.preventSaveConflicts(o.resource,a.getLanguageId())?p:o.etag,unlock:i.writeUnlock,writeElevated:i.writeElevated});this.handleSaveSuccess(s,e,i)}catch(s){this.handleSaveError(s,e,i)}})())})(),()=>r.cancel())}handleSaveSuccess(e,i,t){this.updateLastResolvedFileStat(e),i===this.versionId?(this.trace(`handleSaveSuccess(${i}) - setting dirty to false because versionId did not change`),this.setDirty(!1)):this.trace(`handleSaveSuccess(${i}) - not setting dirty to false because versionId did change meanwhile`),this.setOrphaned(!1),this._onDidSave.fire({reason:t.reason,stat:e,source:t.source})}handleSaveError(e,i,t){if((t.ignoreErrorHandler?this.logService.trace:this.logService.error).apply(this.logService,[`[text file model] handleSaveError(${i}) - exit - resulted in a save error: ${e.toString()}`,this.resource.toString()]),t.ignoreErrorHandler)throw e;this.setDirty(!0),this.inErrorMode=!0,e.fileOperationResult===u.FILE_MODIFIED_SINCE&&(this.inConflictMode=!0),this.textFileService.files.saveErrorHandler.onSaveError(e,this,t),this._onDidSaveError.fire()}updateSavedVersionId(){this.isResolved()&&(this.bufferSavedVersionId=this.textEditorModel.getAlternativeVersionId())}updateLastResolvedFileStat(e){const i=this.isReadonly();this.lastResolvedFileStat?this.lastResolvedFileStat.mtime<=e.mtime?this.lastResolvedFileStat=e:this.lastResolvedFileStat={...this.lastResolvedFileStat,readonly:e.readonly,locked:e.locked}:this.lastResolvedFileStat=e,this.isReadonly()!==i&&this._onDidChangeReadonly.fire()}hasState(e){switch(e){case l.CONFLICT:return this.inConflictMode;case l.DIRTY:return this.dirty;case l.ERROR:return this.inErrorMode;case l.ORPHAN:return this.inOrphanMode;case l.PENDING_SAVE:return this.saveSequentializer.isRunning();case l.SAVED:return!this.dirty}}async joinState(e){return this.saveSequentializer.running}getLanguageId(){return this.textEditorModel?this.textEditorModel.getLanguageId():this.preferredLanguageId}async onMaybeShouldChangeEncoding(){if(this.hasEncodingSetExplicitly){this.trace("onMaybeShouldChangeEncoding() - ignoring because encoding was set explicitly");return}if(this.contentEncoding===J||this.contentEncoding===j||this.contentEncoding===Y){this.trace("onMaybeShouldChangeEncoding() - ignoring because content encoding has a BOM");return}const{encoding:e}=await this.textFileService.encoding.getPreferredReadEncoding(this.resource);if(typeof e!="string"||!this.isNewEncoding(e)){this.trace(`onMaybeShouldChangeEncoding() - ignoring because preferred encoding ${e} is not new`);return}if(this.isDirty()){this.trace("onMaybeShouldChangeEncoding() - ignoring because model is dirty");return}return this.logService.info(`Adjusting encoding based on configured language override to '${e}' for ${this.resource.toString(!0)}.`),this.forceResolveFromFile()}hasEncodingSetExplicitly=!1;setEncoding(e,i){return this.hasEncodingSetExplicitly=!0,this.setEncodingInternal(e,i)}async setEncodingInternal(e,i){if(i===T.Encode)this.updatePreferredEncoding(e),this.isDirty()||(this.versionId++,this.setDirty(!0)),this.inConflictMode||await this.save({source:h.TEXTFILE_SAVE_ENCODING_SOURCE});else{if(!this.isNewEncoding(e))return;this.isDirty()&&!this.inConflictMode&&await this.save(),this.updatePreferredEncoding(e),await this.forceResolveFromFile()}}updatePreferredEncoding(e){this.isNewEncoding(e)&&(this.preferredEncoding=e,this._onDidChangeEncoding.fire())}isNewEncoding(e){return!(this.preferredEncoding===e||!this.preferredEncoding&&this.contentEncoding===e)}getEncoding(){return this.preferredEncoding||this.contentEncoding}trace(e){this.logService.trace(`[text file model] ${e}`,this.resource.toString())}isResolved(){return!!this.textEditorModel}isReadonly(){return this.filesConfigurationService.isReadonly(this.resource,this.lastResolvedFileStat)}dispose(){this.trace("dispose()"),this.inConflictMode=!1,this.inOrphanMode=!1,this.inErrorMode=!1,super.dispose()}};h=y([n(3,A),n(4,N),n(5,k),n(6,O),n(7,L),n(8,B),n(9,z),n(10,q),n(11,H),n(12,Q),n(13,ie),n(14,Z),n(15,re),n(16,oe)],h);export{h as TextFileEditorModel};
