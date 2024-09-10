var C=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var m=(u,s,e,i)=>{for(var t=i>1?void 0:i?w(s,e):s,o=u.length-1,r;o>=0;o--)(r=u[o])&&(t=(i?r(s,e,t):r(t))||t);return i&&t&&C(s,e,t),t},d=(u,s)=>(e,i)=>s(e,i,u);import{localize as h}from"../../../../nls.js";import{deepClone as D}from"../../../../base/common/objects.js";import{isObject as T,assertIsDefined as I}from"../../../../base/common/types.js";import"../../../../editor/browser/editorBrowser.js";import"../../../../editor/common/config/editorOptions.js";import{AbstractTextEditor as F}from"./textEditor.js";import{TEXT_DIFF_EDITOR_ID as b,EditorExtensions as R,isEditorInput as O,isTextEditorViewState as x,createTooLargeFileError as V}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import{applyTextEditorOptions as g}from"../../../common/editor/editorOptions.js";import{DiffEditorInput as c}from"../../../common/editor/diffEditorInput.js";import{TextDiffEditorModel as M}from"../../../common/editor/textDiffEditorModel.js";import{ITelemetryService as L}from"../../../../platform/telemetry/common/telemetry.js";import{IStorageService as B}from"../../../../platform/storage/common/storage.js";import{ITextResourceConfigurationService as W}from"../../../../editor/common/services/textResourceConfiguration.js";import{IInstantiationService as A}from"../../../../platform/instantiation/common/instantiation.js";import{IThemeService as _}from"../../../../platform/theme/common/themeService.js";import{TextFileOperationResult as U}from"../../../services/textfile/common/textfiles.js";import{ScrollType as v}from"../../../../editor/common/editorCommon.js";import{Registry as P}from"../../../../platform/registry/common/platform.js";import{URI as z}from"../../../../base/common/uri.js";import{IEditorGroupsService as G}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as H}from"../../../services/editor/common/editorService.js";import"../../../../base/common/cancellation.js";import{EditorActivation as k}from"../../../../platform/editor/common/editor.js";import{IContextKeyService as K}from"../../../../platform/contextkey/common/contextkey.js";import{isEqual as N}from"../../../../base/common/resources.js";import{multibyteAwareBtoa as y}from"../../../../base/browser/dom.js";import{ByteSize as j,FileOperationResult as q,IFileService as $,TooLargeFileOperationError as X}from"../../../../platform/files/common/files.js";import"../../../../base/browser/ui/sash/sash.js";import{IPreferencesService as Y}from"../../../services/preferences/common/preferences.js";import{StopWatch as J}from"../../../../base/common/stopwatch.js";import{DiffEditorWidget as S}from"../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";let a=class extends F{constructor(e,i,t,o,r,n,f,l,p,E){super(a.ID,e,i,t,o,r,f,n,l,p);this.preferencesService=E}static ID=b;diffEditorControl=void 0;inputLifecycleStopWatch=void 0;get scopedContextKeyService(){if(!this.diffEditorControl)return;const e=this.diffEditorControl.getOriginalEditor(),i=this.diffEditorControl.getModifiedEditor();return(e.hasTextFocus()?e:i).invokeWithinContext(t=>t.get(K))}getTitle(){return this.input?this.input.getName():h("textDiffEditor","Text Diff Editor")}createEditorControl(e,i){this.diffEditorControl=this._register(this.instantiationService.createInstance(S,e,i,{}))}updateEditorControlOptions(e){this.diffEditorControl?.updateOptions(e)}getMainControl(){return this.diffEditorControl?.getModifiedEditor()}_previousViewModel=null;async setInput(e,i,t,o){this._previousViewModel&&(this._previousViewModel.dispose(),this._previousViewModel=null),this.inputLifecycleStopWatch=void 0,await super.setInput(e,i,t,o);try{const r=await e.resolve();if(o.isCancellationRequested)return;if(!(r instanceof M)){this.openAsBinary(e,i);return}const n=I(this.diffEditorControl),f=r,l=f.textDiffEditorModel?n.createViewModel(f.textDiffEditorModel):null;this._previousViewModel=l,await l?.waitForDiff(),n.setModel(l);let p=!1;x(i?.viewState)||(p=this.restoreTextDiffEditorViewState(e,i,t,n));let E=!1;i&&(E=g(i,n,v.Immediate)),!E&&!p&&n.revealFirstDiff(),n.updateOptions({...this.getReadonlyConfiguration(f.modifiedModel?.isReadonly()),originalEditable:!f.originalModel?.isReadonly()}),n.handleInitialized(),this.inputLifecycleStopWatch=new J(!1)}catch(r){await this.handleSetInputError(r,e,i)}}async handleSetInputError(e,i,t){if(this.isFileBinaryError(e))return this.openAsBinary(i,t);if(e.fileOperationResult===q.FILE_TOO_LARGE){let o;throw e instanceof X?o=h("fileTooLargeForHeapErrorWithSize","At least one file is not displayed in the text compare editor because it is very large ({0}).",j.formatSize(e.size)):o=h("fileTooLargeForHeapErrorWithoutSize","At least one file is not displayed in the text compare editor because it is very large."),V(this.group,i,t,o,this.preferencesService)}throw e}restoreTextDiffEditorViewState(e,i,t,o){const r=this.loadEditorViewState(e,t);return r?(i?.selection&&r.modified&&(r.modified.cursorState=[]),o.restoreViewState(r),i?.revealIfVisible&&o.revealFirstDiff(),!0):!1}openAsBinary(e,i){const t=e.original,o=e.modified,r=this.instantiationService.createInstance(c,e.getName(),e.getDescription(),t,o,!0),n=P.as(R.EditorFactory).getFileEditorFactory();n.isFileEditor(t)&&t.setForceOpenAsBinary(),n.isFileEditor(o)&&o.setForceOpenAsBinary(),this.group.replaceEditors([{editor:e,replacement:r,options:{...i,activation:k.PRESERVE,pinned:this.group.isPinned(e),sticky:this.group.isSticky(e)}}])}setOptions(e){super.setOptions(e),e&&g(e,I(this.diffEditorControl),v.Smooth)}shouldHandleConfigurationChangeEvent(e,i){return super.shouldHandleConfigurationChangeEvent(e,i)?!0:e.affectsConfiguration(i,"diffEditor")||e.affectsConfiguration(i,"accessibility.verbosity.diffEditor")}computeConfiguration(e){const i=super.computeConfiguration(e);if(T(e.diffEditor)){const o=D(e.diffEditor);o.diffCodeLens=o.codeLens,delete o.codeLens,o.diffWordWrap=o.wordWrap,delete o.wordWrap,Object.assign(i,o)}const t=e.accessibility?.verbosity?.diffEditor??!1;return i.accessibilityVerbose=t,i}getConfigurationOverrides(e){return{...super.getConfigurationOverrides(e),...this.getReadonlyConfiguration(this.input?.isReadonly()),originalEditable:this.input instanceof c&&!this.input.original.isReadonly(),lineDecorationsWidth:"2ch"}}updateReadonly(e){e instanceof c?this.diffEditorControl?.updateOptions({...this.getReadonlyConfiguration(e.isReadonly()),originalEditable:!e.original.isReadonly()}):super.updateReadonly(e)}isFileBinaryError(e){return Array.isArray(e)?e.some(t=>this.isFileBinaryError(t)):e.textFileOperationResult===U.FILE_IS_BINARY}clearInput(){this._previousViewModel&&(this._previousViewModel.dispose(),this._previousViewModel=null),super.clearInput();const e=this.inputLifecycleStopWatch?.elapsed();this.inputLifecycleStopWatch=void 0,typeof e=="number"&&this.logInputLifecycleTelemetry(e,this.getControl()?.getModel()?.modified?.getLanguageId()),this.diffEditorControl?.setModel(null)}logInputLifecycleTelemetry(e,i){let t=!1;this.diffEditorControl instanceof S&&(t=this.diffEditorControl.collapseUnchangedRegions),this.telemetryService.publicLog2("diffEditor.editorVisibleTime",{editorVisibleTimeMs:e,languageId:i??"",collapseUnchangedRegions:t})}getControl(){return this.diffEditorControl}focus(){super.focus(),this.diffEditorControl?.focus()}hasFocus(){return this.diffEditorControl?.hasTextFocus()||super.hasFocus()}setEditorVisible(e){super.setEditorVisible(e),e?this.diffEditorControl?.onVisible():this.diffEditorControl?.onHide()}layout(e){this.diffEditorControl?.layout(e)}setBoundarySashes(e){this.diffEditorControl?.setBoundarySashes(e)}tracksEditorViewState(e){return e instanceof c}computeEditorViewState(e){if(!this.diffEditorControl)return;const i=this.diffEditorControl.getModel();if(!i||!i.modified||!i.original)return;const t=this.toEditorViewStateResource(i);if(t&&N(t,e))return this.diffEditorControl.saveViewState()??void 0}toEditorViewStateResource(e){let i,t;if(e instanceof c?(i=e.original.resource,t=e.modified.resource):O(e)||(i=e.original.uri,t=e.modified.uri),!(!i||!t))return z.from({scheme:"diff",path:`${y(i.toString())}${y(t.toString())}`})}};a=m([d(1,L),d(2,A),d(3,B),d(4,W),d(5,H),d(6,_),d(7,G),d(8,$),d(9,Y)],a);export{a as TextDiffEditor};
