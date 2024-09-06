var g=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var m=(p,s,e,r)=>{for(var i=r>1?void 0:r?y(s,e):s,t=p.length-1,n;t>=0;t--)(n=p[t])&&(i=(r?n(s,e,i):n(i))||i);return r&&i&&g(s,e,i),i},o=(p,s)=>(e,r)=>s(e,r,p);import{toAction as E}from"../../../../../../vs/base/common/actions.js";import"../../../../../../vs/base/common/cancellation.js";import{mark as f}from"vs/base/common/performance";import{assertIsDefined as C}from"../../../../../../vs/base/common/types.js";import"../../../../../../vs/editor/common/config/editorOptions.js";import{ScrollType as x}from"../../../../../../vs/editor/common/editorCommon.js";import{ITextResourceConfigurationService as w}from"../../../../../../vs/editor/common/services/textResourceConfiguration.js";import{localize as d}from"../../../../../../vs/nls.js";import{IConfigurationService as R}from"../../../../../../vs/platform/configuration/common/configuration.js";import{EditorActivation as D}from"../../../../../../vs/platform/editor/common/editor.js";import{ByteSize as _,FileOperation as A,FileOperationError as b,FileOperationResult as I,IFileService as L,TooLargeFileOperationError as V}from"../../../../../../vs/platform/files/common/files.js";import{IInstantiationService as B}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{IStorageService as P}from"../../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as k}from"../../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as M}from"../../../../../../vs/platform/theme/common/themeService.js";import{IUriIdentityService as N}from"../../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as z}from"../../../../../../vs/platform/workspace/common/workspace.js";import{AbstractTextCodeEditor as W}from"../../../../../../vs/workbench/browser/parts/editor/textCodeEditor.js";import{createEditorOpenError as S,createTooLargeFileError as G,DEFAULT_EDITOR_ASSOCIATION as h,isTextEditorViewState as U}from"../../../../../../vs/workbench/common/editor.js";import{BinaryEditorModel as H}from"../../../../../../vs/workbench/common/editor/binaryEditorModel.js";import"../../../../../../vs/workbench/common/editor/editorInput.js";import{applyTextEditorOptions as Y}from"../../../../../../vs/workbench/common/editor/editorOptions.js";import{ViewContainerLocation as X}from"../../../../../../vs/workbench/common/views.js";import{FileEditorInput as q}from"../../../../../../vs/workbench/contrib/files/browser/editors/fileEditorInput.js";import{IExplorerService as j}from"../../../../../../vs/workbench/contrib/files/browser/files.js";import{BINARY_TEXT_FILE_MODE as J,TEXT_FILE_EDITOR_ID as K,VIEWLET_ID as Q}from"../../../../../../vs/workbench/contrib/files/common/files.js";import{IEditorGroupsService as Z}from"../../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as $}from"../../../../../../vs/workbench/services/editor/common/editorService.js";import{IFilesConfigurationService as ee}from"../../../../../../vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";import{IHostService as re}from"../../../../../../vs/workbench/services/host/browser/host.js";import{IPaneCompositePartService as ie}from"../../../../../../vs/workbench/services/panecomposite/browser/panecomposite.js";import{IPathService as te}from"../../../../../../vs/workbench/services/path/common/pathService.js";import{IPreferencesService as oe}from"../../../../../../vs/workbench/services/preferences/common/preferences.js";import{ITextFileService as ne,TextFileOperationResult as ae}from"../../../../../../vs/workbench/services/textfile/common/textfiles.js";let l=class extends W{constructor(e,r,i,t,n,u,a,c,F,O,T,de,se,le,ce,pe,fe,Ie,ue){super(l.ID,e,r,n,a,c,O,F,T,i);this.paneCompositeService=t;this.contextService=u;this.textFileService=de;this.explorerService=se;this.uriIdentityService=le;this.pathService=ce;this.configurationService=pe;this.preferencesService=fe;this.hostService=Ie;this.filesConfigurationService=ue;this._register(this.fileService.onDidFilesChange(v=>this.onDidFilesChange(v))),this._register(this.fileService.onDidRunOperation(v=>this.onDidRunOperation(v)))}static ID=K;onDidFilesChange(e){for(const r of e.rawDeleted)this.clearEditorViewState(r)}onDidRunOperation(e){e.operation===A.MOVE&&e.target&&this.moveEditorViewState(e.resource,e.target.resource,this.uriIdentityService.extUri)}getTitle(){return this.input?this.input.getName():d("textFileEditor","Text File Editor")}get input(){return this._input}async setInput(e,r,i,t){f("code/willSetInputToTextFileEditor"),await super.setInput(e,r,i,t);try{const n=await e.resolve(r);if(t.isCancellationRequested)return;if(n instanceof H)return this.openAsBinary(e,r);const u=n,a=C(this.editorControl);if(a.setModel(u.textEditorModel),!U(r?.viewState)){const c=this.loadEditorViewState(e,i);c&&(r?.selection&&(c.cursorState=[]),a.restoreViewState(c))}r&&Y(r,a,x.Immediate),a.updateOptions(this.getReadonlyConfiguration(u.isReadonly())),a.handleInitialized&&a.handleInitialized()}catch(n){await this.handleSetInputError(n,e,r)}f("code/didSetInputToTextFileEditor")}async handleSetInputError(e,r,i){if(e.textFileOperationResult===ae.FILE_IS_BINARY)return this.openAsBinary(r,i);if(e.fileOperationResult===I.FILE_IS_DIRECTORY){const t=[];throw t.push(E({id:"workbench.files.action.openFolder",label:d("openFolder","Open Folder"),run:async()=>this.hostService.openWindow([{folderUri:r.resource}],{forceNewWindow:!0})})),this.contextService.isInsideWorkspace(r.preferredResource)&&t.push(E({id:"workbench.files.action.reveal",label:d("reveal","Reveal Folder"),run:async()=>(await this.paneCompositeService.openPaneComposite(Q,X.Sidebar,!0),this.explorerService.select(r.preferredResource,!0))})),S(d("fileIsDirectory","The file is not displayed in the text editor because it is a directory."),t,{forceMessage:!0})}if(e.fileOperationResult===I.FILE_TOO_LARGE){let t;throw e instanceof V?t=d("fileTooLargeForHeapErrorWithSize","The file is not displayed in the text editor because it is very large ({0}).",_.formatSize(e.size)):t=d("fileTooLargeForHeapErrorWithoutSize","The file is not displayed in the text editor because it is very large."),G(this.group,r,i,t,this.preferencesService)}throw e.fileOperationResult===I.FILE_NOT_FOUND&&!this.filesConfigurationService.isReadonly(r.preferredResource)&&await this.pathService.hasValidBasename(r.preferredResource)?S(new b(d("unavailableResourceErrorEditorText","The editor could not be opened because the file was not found."),I.FILE_NOT_FOUND),[E({id:"workbench.files.action.createMissingFile",label:d("createFile","Create File"),run:async()=>(await this.textFileService.create([{resource:r.preferredResource}]),this.editorService.openEditor({resource:r.preferredResource,options:{pinned:!0}}))})],{allowDialog:!0}):e}openAsBinary(e,r){const i=this.configurationService.getValue("workbench.editor.defaultBinaryEditor"),t={...r,activation:D.PRESERVE};i&&i!==""&&i!==h.id?this.doOpenAsBinaryInDifferentEditor(this.group,i,e,t):this.doOpenAsBinaryInSameEditor(this.group,i,e,t)}doOpenAsBinaryInDifferentEditor(e,r,i,t){this.editorService.replaceEditors([{editor:i,replacement:{resource:i.resource,options:{...t,override:r}}}],e)}doOpenAsBinaryInSameEditor(e,r,i,t){r===h.id?(i.setForceOpenAsText(),i.setPreferredLanguageId(J),t={...t,forceReload:!0}):i.setForceOpenAsBinary(),e.openEditor(i,t)}clearInput(){super.clearInput(),this.editorControl?.setModel(null)}createEditorControl(e,r){f("code/willCreateTextFileEditorControl"),super.createEditorControl(e,r),f("code/didCreateTextFileEditorControl")}tracksEditorViewState(e){return e instanceof q}tracksDisposedEditorViewState(){return!0}};l=m([o(1,k),o(2,L),o(3,ie),o(4,B),o(5,z),o(6,P),o(7,w),o(8,$),o(9,M),o(10,Z),o(11,ne),o(12,j),o(13,N),o(14,te),o(15,R),o(16,oe),o(17,re),o(18,ee)],l);export{l as TextFileEditor};
