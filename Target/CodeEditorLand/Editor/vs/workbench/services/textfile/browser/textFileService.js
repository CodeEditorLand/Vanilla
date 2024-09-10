var N=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var x=(h,l,e,i)=>{for(var t=i>1?void 0:i?X(l,e):l,r=h.length-1,n;r>=0;r--)(n=h[r])&&(t=(i?n(l,e,t):n(t))||t);return i&&t&&N(l,e,t),t},o=(h,l)=>(e,i)=>l(e,i,h);import{localize as d}from"../../../../nls.js";import{toBufferOrReadable as $,TextFileOperationError as q,TextFileOperationResult as D,stringToSnapshot as H,TextFileEditorModelState as P}from"../common/textfiles.js";import{SaveSourceRegistry as b}from"../../../common/editor.js";import{ILifecycleService as K}from"../../lifecycle/common/lifecycle.js";import{IFileService as Y,FileOperationResult as j}from"../../../../platform/files/common/files.js";import{Disposable as F}from"../../../../base/common/lifecycle.js";import{extname as z}from"../../../../base/common/path.js";import{IWorkbenchEnvironmentService as _}from"../../environment/common/environmentService.js";import{IUntitledTextEditorService as J}from"../../untitled/common/untitledTextEditorService.js";import{UntitledTextEditorModel as Q}from"../../untitled/common/untitledTextEditorModel.js";import{TextFileEditorModelManager as Z}from"../common/textFileEditorModelManager.js";import{IInstantiationService as ee}from"../../../../platform/instantiation/common/instantiation.js";import{Schemas as E}from"../../../../base/common/network.js";import{createTextBufferFactoryFromSnapshot as ie,createTextBufferFactoryFromStream as te}from"../../../../editor/common/model/textModel.js";import{IModelService as re}from"../../../../editor/common/services/model.js";import{joinPath as T,dirname as ne,basename as S,toLocalResource as M,extname as oe,isEqual as ae}from"../../../../base/common/resources.js";import{IDialogService as se,IFileDialogService as de}from"../../../../platform/dialogs/common/dialogs.js";import{bufferToStream as ce}from"../../../../base/common/buffer.js";import{ITextResourceConfigurationService as B}from"../../../../editor/common/services/textResourceConfiguration.js";import{PLAINTEXT_LANGUAGE_ID as O}from"../../../../editor/common/languages/modesRegistry.js";import{IFilesConfigurationService as le}from"../../filesConfiguration/common/filesConfigurationService.js";import{BaseTextEditorModel as fe}from"../../../common/editor/textEditorModel.js";import{ICodeEditorService as ge}from"../../../../editor/browser/services/codeEditorService.js";import{IPathService as ve}from"../../path/common/pathService.js";import{IWorkingCopyFileService as ue}from"../../workingCopy/common/workingCopyFileService.js";import{IUriIdentityService as k}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as me,WORKSPACE_EXTENSION as Se}from"../../../../platform/workspace/common/workspace.js";import{UTF8 as c,UTF8_with_bom as I,UTF16be as A,UTF16le as L,encodingExists as he,toEncodeReadable as Ie,toDecodeStream as pe,DecodeStreamErrorKind as Re}from"../common/encoding.js";import{consumeStream as Ee}from"../../../../base/common/stream.js";import{ILanguageService as ye}from"../../../../editor/common/languages/language.js";import{ILogService as xe}from"../../../../platform/log/common/log.js";import{CancellationToken as W,CancellationTokenSource as Fe}from"../../../../base/common/cancellation.js";import{IElevatedFileService as Te}from"../../files/common/elevatedFileService.js";import{IDecorationsService as Oe}from"../../decorations/common/decorations.js";import{Emitter as we}from"../../../../base/common/event.js";import{Codicon as V}from"../../../../base/common/codicons.js";import{listErrorForeground as G}from"../../../../platform/theme/common/colorRegistry.js";let m=class extends F{constructor(e,i,t,r,n,a,s,f,R,g,v,u,w,y,U,C,Ue,Ce){super();this.fileService=e;this.untitledTextEditorService=i;this.lifecycleService=t;this.instantiationService=r;this.modelService=n;this.environmentService=a;this.dialogService=s;this.fileDialogService=f;this.textResourceConfigurationService=R;this.filesConfigurationService=g;this.codeEditorService=v;this.pathService=u;this.workingCopyFileService=w;this.uriIdentityService=y;this.languageService=U;this.logService=C;this.elevatedFileService=Ue;this.decorationsService=Ce;this.provideDecorations()}static TEXTFILE_SAVE_CREATE_SOURCE=b.registerSource("textFileCreate.source",d("textFileCreate.source","File Created"));static TEXTFILE_SAVE_REPLACE_SOURCE=b.registerSource("textFileOverwrite.source",d("textFileOverwrite.source","File Replaced"));files=this._register(this.instantiationService.createInstance(Z));untitled=this.untitledTextEditorService;provideDecorations(){const e=this._register(new class extends F{constructor(t){super();this.files=t;this.registerListeners()}label=d("textFileModelDecorations","Text File Model Decorations");_onDidChange=this._register(new we);onDidChange=this._onDidChange.event;registerListeners(){this._register(this.files.onDidResolve(({model:t})=>{(t.isReadonly()||t.hasState(P.ORPHAN))&&this._onDidChange.fire([t.resource])})),this._register(this.files.onDidRemove(t=>this._onDidChange.fire([t]))),this._register(this.files.onDidChangeReadonly(t=>this._onDidChange.fire([t.resource]))),this._register(this.files.onDidChangeOrphaned(t=>this._onDidChange.fire([t.resource])))}provideDecorations(t){const r=this.files.get(t);if(!r||r.isDisposed())return;const n=r.isReadonly(),a=r.hasState(P.ORPHAN);if(n&&a)return{color:G,letter:V.lockSmall,strikethrough:!0,tooltip:d("readonlyAndDeleted","Deleted, Read-only")};if(n)return{letter:V.lockSmall,tooltip:d("readonly","Read-only")};if(a)return{color:G,strikethrough:!0,tooltip:d("deleted","Deleted")}}}(this.files));this._register(this.decorationsService.registerDecorationsProvider(e))}_encoding;get encoding(){return this._encoding||(this._encoding=this._register(this.instantiationService.createInstance(p))),this._encoding}async read(e,i){const[t,r]=await this.doRead(e,{...i,preferUnbuffered:!0});return{...t,encoding:r.detected.encoding||c,value:await Ee(r.stream,n=>n.join(""))}}async readStream(e,i){const[t,r]=await this.doRead(e,i);return{...t,encoding:r.detected.encoding||c,value:await te(r.stream)}}async doRead(e,i){const t=new Fe;let r;if(i?.preferUnbuffered){const n=await this.fileService.readFile(e,i,t.token);r={...n,value:ce(n.value)}}else r=await this.fileService.readFileStream(e,i,t.token);try{const n=await this.doGetDecodedStream(e,r.value,i);return[r,n]}catch(n){throw t.dispose(!0),n.decodeStreamErrorKind===Re.STREAM_IS_BINARY?new q(d("fileBinaryError","File seems to be binary and cannot be opened as text"),D.FILE_IS_BINARY,i):n}}async create(e,i){const t=await Promise.all(e.map(async r=>{const n=await this.getEncodedReadable(r.resource,r.value);return{resource:r.resource,contents:n,overwrite:r.options?.overwrite}}));return this.workingCopyFileService.create(t,W.None,i)}async write(e,i,t){const r=await this.getEncodedReadable(e,i,t);return t?.writeElevated&&this.elevatedFileService.isSupported(e)?this.elevatedFileService.writeFileElevated(e,r,t):this.fileService.writeFile(e,r,t)}async getEncodedReadable(e,i,t){const{encoding:r,addBOM:n}=await this.encoding.getWriteEncoding(e,t);if(r===c&&!n)return typeof i>"u"?void 0:$(i);i=i||"";const a=typeof i=="string"?H(i):i;return Ie(a,r,{addBOM:n})}async getDecodedStream(e,i,t){return(await this.doGetDecodedStream(e,i,t)).stream}doGetDecodedStream(e,i,t){return pe(i,{acceptTextOnly:t?.acceptTextOnly??!1,guessEncoding:t?.autoGuessEncoding||this.textResourceConfigurationService.getValue(e,"files.autoGuessEncoding"),candidateGuessEncodings:t?.candidateGuessEncodings||this.textResourceConfigurationService.getValue(e,"files.candidateGuessEncodings"),overwriteEncoding:async r=>{const{encoding:n}=await this.encoding.getPreferredReadEncoding(e,t,r??void 0);return n}})}async save(e,i){if(e.scheme===E.untitled){const t=this.untitled.get(e);if(t){let r;if(t.hasAssociatedFilePath?r=await this.suggestSavePath(e):r=await this.fileDialogService.pickFileToSave(await this.suggestSavePath(e),i?.availableFileSystems),r)return this.saveAs(e,r,i)}}else{const t=this.files.get(e);if(t)return await t.save(i)?e:void 0}}async saveAs(e,i,t){if(i||(i=await this.fileDialogService.pickFileToSave(await this.suggestSavePath(t?.suggestedTarget??e),t?.availableFileSystems)),!!i){if(this.filesConfigurationService.isReadonly(i))if(await this.confirmMakeWriteable(i))this.filesConfigurationService.updateReadonly(i,!1);else return;return ae(e,i)?this.save(e,{...t,force:!0}):this.fileService.hasProvider(e)&&this.uriIdentityService.extUri.isEqual(e,i)&&await this.fileService.exists(e)?(await this.workingCopyFileService.move([{file:{source:e,target:i}}],W.None),await this.save(e,t)||await this.save(i,t),i):this.doSaveAs(e,i,t)}}async doSaveAs(e,i,t){let r=!1;const n=this.files.get(e);if(n?.isResolved())r=await this.doSaveAsTextFile(n,e,i,t);else if(this.fileService.hasProvider(e))await this.fileService.copy(e,i,!0),r=!0;else{const a=this.modelService.getModel(e);a&&(r=await this.doSaveAsTextFile(a,e,i,t))}if(r){try{await this.revert(e)}catch(a){this.logService.error(a)}return i}}async doSaveAsTextFile(e,i,t,r){let n;const a=e;typeof a.getEncoding=="function"&&(n=a.getEncoding());let s=!1,f=this.files.get(t);if(f?.isResolved())s=!0;else{s=await this.fileService.exists(t),s||await this.create([{resource:t,value:""}]);try{f=await this.files.resolve(t,{encoding:n})}catch(u){if(s&&(u.textFileOperationResult===D.FILE_IS_BINARY||u.fileOperationResult===j.FILE_TOO_LARGE))return await this.fileService.del(t),this.doSaveAsTextFile(e,i,t,r);throw u}}let R;if(e instanceof Q&&e.hasAssociatedFilePath&&s&&this.uriIdentityService.extUri.isEqual(t,M(e.resource,this.environmentService.remoteAuthority,this.pathService.defaultUriScheme))?R=await this.confirmOverwrite(t):R=!0,!R)return!1;let g;e instanceof fe?e.isResolved()&&(g=e.textEditorModel??void 0):g=e;let v;if(f.isResolved()&&(v=f.textEditorModel),g&&v){f.updatePreferredEncoding(n),this.modelService.updateModel(v,ie(g.createSnapshot()));const u=g.getLanguageId(),w=v.getLanguageId();u!==O&&w===O&&v.setLanguage(u);const y=this.codeEditorService.getTransientModelProperties(g);if(y)for(const[U,C]of y)this.codeEditorService.setTransientModelProperty(v,U,C)}return r?.source||(r={...r,source:s?m.TEXTFILE_SAVE_REPLACE_SOURCE:m.TEXTFILE_SAVE_CREATE_SOURCE}),f.save({...r,from:i})}async confirmOverwrite(e){const{confirmed:i}=await this.dialogService.confirm({type:"warning",message:d("confirmOverwrite","'{0}' already exists. Do you want to replace it?",S(e)),detail:d("overwriteIrreversible","A file or folder with the name '{0}' already exists in the folder '{1}'. Replacing it will overwrite its current contents.",S(e),S(ne(e))),primaryButton:d({key:"replaceButtonLabel",comment:["&& denotes a mnemonic"]},"&&Replace")});return i}async confirmMakeWriteable(e){const{confirmed:i}=await this.dialogService.confirm({type:"warning",message:d("confirmMakeWriteable","'{0}' is marked as read-only. Do you want to save anyway?",S(e)),detail:d("confirmMakeWriteableDetail","Paths can be configured as read-only via settings."),primaryButton:d({key:"makeWriteableButtonLabel",comment:["&& denotes a mnemonic"]},"&&Save Anyway")});return i}async suggestSavePath(e){if(this.fileService.hasProvider(e))return e;const i=this.environmentService.remoteAuthority,t=await this.fileDialogService.defaultFilePath();let r;if(e.scheme===E.untitled){const n=this.untitled.get(e);if(n){if(n.hasAssociatedFilePath)return M(e,i,this.pathService.defaultUriScheme);let a;await this.pathService.hasValidBasename(T(t,n.name),n.name)?a=n.name:a=S(e);const s=n.getLanguageId();s&&s!==O?r=this.suggestFilename(s,a):r=a}}return r||(r=S(e)),T(t,r)}suggestFilename(e,i){if(!this.languageService.getLanguageName(e))return i;const r=z(i),n=this.languageService.getExtensions(e);if(n.includes(r))return i;const a=n.at(0);if(a)return r?`${i.substring(0,i.indexOf(r))}${a}`:`${i}${a}`;const s=this.languageService.getFilenames(e);return s.includes(i)?i:s.at(0)??i}async revert(e,i){if(e.scheme===E.untitled){const t=this.untitled.get(e);if(t)return t.revert(i)}else{const t=this.files.get(e);if(t&&(t.isDirty()||i?.force))return t.revert(i)}}isDirty(e){const i=e.scheme===E.untitled?this.untitled.get(e):this.files.get(e);return i?i.isDirty():!1}};m=x([o(0,Y),o(1,J),o(2,K),o(3,ee),o(4,re),o(5,_),o(6,se),o(7,de),o(8,B),o(9,le),o(10,ge),o(11,ve),o(12,ue),o(13,k),o(14,ye),o(15,xe),o(16,Te),o(17,Oe)],m);let p=class extends F{constructor(e,i,t,r){super();this.textResourceConfigurationService=e;this.environmentService=i;this.contextService=t;this.uriIdentityService=r;this._encodingOverrides=this.getDefaultEncodingOverrides(),this.registerListeners()}_encodingOverrides;get encodingOverrides(){return this._encodingOverrides}set encodingOverrides(e){this._encodingOverrides=e}registerListeners(){this._register(this.contextService.onDidChangeWorkspaceFolders(()=>this.encodingOverrides=this.getDefaultEncodingOverrides()))}getDefaultEncodingOverrides(){const e=[];return e.push({parent:this.environmentService.userRoamingDataHome,encoding:c}),e.push({extension:Se,encoding:c}),e.push({parent:this.environmentService.untitledWorkspacesHome,encoding:c}),this.contextService.getWorkspace().folders.forEach(i=>{e.push({parent:T(i.uri,".vscode"),encoding:c})}),e}async getWriteEncoding(e,i){const{encoding:t,hasBOM:r}=await this.getPreferredWriteEncoding(e,i?i.encoding:void 0);return{encoding:t,addBOM:r}}async getPreferredWriteEncoding(e,i){const t=await this.getEncodingForResource(e,i);return{encoding:t,hasBOM:t===A||t===L||t===I}}async getPreferredReadEncoding(e,i,t){let r;i?.encoding?t===I&&i.encoding===c?r=I:r=i.encoding:typeof t=="string"?r=t:this.textResourceConfigurationService.getValue(e,"files.encoding")===I&&(r=c);const n=await this.getEncodingForResource(e,r);return{encoding:n,hasBOM:n===A||n===L||n===I}}async getEncodingForResource(e,i){let t;const r=this.getEncodingOverride(e);return r?t=r:i?t=i:t=this.textResourceConfigurationService.getValue(e,"files.encoding"),t!==c&&(!t||!await he(t))&&(t=c),t}getEncodingOverride(e){if(this.encodingOverrides?.length){for(const i of this.encodingOverrides)if(i.parent&&this.uriIdentityService.extUri.isEqualOrParent(e,i.parent)||i.extension&&oe(e)===`.${i.extension}`)return i.encoding}}};p=x([o(0,B),o(1,_),o(2,me),o(3,k)],p);export{m as AbstractTextFileService,p as EncodingOracle};
