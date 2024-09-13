var $=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var W=(k,a,e,t)=>{for(var o=t>1?void 0:t?H(a,e):a,s=k.length-1,l;s>=0;s--)(l=k[s])&&(o=(t?l(a,e,o):l(o))||o);return t&&o&&$(a,e,o),o},n=(k,a)=>(e,t)=>a(e,t,k);import*as _ from"../../../../base/browser/dom.js";import"../../../../base/browser/ui/actionbar/actionbar.js";import{toAction as P}from"../../../../base/common/actions.js";import{timeout as Y}from"../../../../base/common/async.js";import"../../../../base/common/cancellation.js";import{Emitter as I}from"../../../../base/common/event.js";import{DisposableStore as F,MutableDisposable as q}from"../../../../base/common/lifecycle.js";import{extname as j,isEqual as J}from"../../../../base/common/resources.js";import"../../../../base/common/uri.js";import{generateUuid as Q}from"../../../../base/common/uuid.js";import{ITextResourceConfigurationService as X}from"../../../../editor/common/services/textResourceConfiguration.js";import{localize as v}from"../../../../nls.js";import{IContextKeyService as Z}from"../../../../platform/contextkey/common/contextkey.js";import"../../../../platform/editor/common/editor.js";import{ByteSize as ee,FileOperationResult as te,IFileService as oe,TooLargeFileOperationError as ie}from"../../../../platform/files/common/files.js";import{IInstantiationService as re}from"../../../../platform/instantiation/common/instantiation.js";import{IStorageService as ne}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as se}from"../../../../platform/telemetry/common/telemetry.js";import{IThemeService as ae}from"../../../../platform/theme/common/themeService.js";import"../../../../editor/common/core/selection.js";import{EditorPane as de}from"../../../browser/parts/editor/editorPane.js";import{DEFAULT_EDITOR_ASSOCIATION as R,EditorPaneSelectionChangeReason as V,EditorPaneSelectionCompareResult as L,EditorResourceAccessor as le,createEditorOpenError as A,createTooLargeFileError as ce,isEditorOpenError as ue}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import{SELECT_KERNEL_ID as me}from"./controller/coreActions.js";import"./notebookBrowser.js";import{INotebookEditorService as pe}from"./services/notebookEditorService.js";import"./notebookEditorWidget.js";import{NotebooKernelActionViewItem as he}from"./viewParts/notebookKernelView.js";import"../common/model/notebookTextModel.js";import{CellKind as ve,NOTEBOOK_EDITOR_ID as ge,NotebookWorkingCopyTypeIdentifier as fe}from"../common/notebookCommon.js";import{NotebookEditorInput as T}from"../common/notebookEditorInput.js";import{NotebookPerfMarks as be}from"../common/notebookPerformance.js";import{GroupsOrder as Se,IEditorGroupsService as we}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as Ee}from"../../../services/editor/common/editorService.js";import{IEditorProgressService as _e}from"../../../../platform/progress/common/progress.js";import{InstallRecommendedExtensionAction as Ie}from"../../extensions/browser/extensionsActions.js";import{INotebookService as ke}from"../common/notebookService.js";import{IExtensionsWorkbenchService as ye}from"../../extensions/common/extensions.js";import{EnablementState as x}from"../../../services/extensionManagement/common/extensionManagement.js";import{IWorkingCopyBackupService as Ce}from"../../../services/workingCopy/common/workingCopyBackup.js";import{streamToBuffer as De}from"../../../../base/common/buffer.js";import{ILogService as Te}from"../../../../platform/log/common/log.js";import{INotebookEditorWorkerService as Pe}from"../common/services/notebookWorkerService.js";import{IPreferencesService as Le}from"../../../services/preferences/common/preferences.js";import"../../../../base/browser/ui/actionbar/actionViewItems.js";import{StopWatch as xe}from"../../../../base/common/stopwatch.js";const Me="NotebookEditorViewState";let b=class extends de{constructor(e,t,o,s,l,i,h,r,d,w,g,c,S,u,m,p,y,C){super(b.ID,e,t,o,l);this._instantiationService=s;this._editorService=i;this._editorGroupService=h;this._notebookWidgetService=r;this._contextKeyService=d;this._fileService=w;this._editorProgressService=c;this._notebookService=S;this._extensionsWorkbenchService=u;this._workingCopyBackupService=m;this.logService=p;this._notebookEditorWorkerService=y;this._preferencesService=C;this._editorMemento=this.getEditorMemento(h,g,Me),this._register(this._fileService.onDidChangeFileSystemProviderCapabilities(f=>this._onDidChangeFileSystemProvider(f.scheme))),this._register(this._fileService.onDidChangeFileSystemProviderRegistrations(f=>this._onDidChangeFileSystemProvider(f.scheme)))}static ID=ge;_editorMemento;_groupListener=this._register(new F);_widgetDisposableStore=this._register(new F);_widget={value:void 0};_rootElement;_pagePosition;_inputListener=this._register(new q);_onDidFocusWidget=this._register(new I);get onDidFocus(){return this._onDidFocusWidget.event}_onDidBlurWidget=this._register(new I);get onDidBlur(){return this._onDidBlurWidget.event}_onDidChangeModel=this._register(new I);onDidChangeModel=this._onDidChangeModel.event;_onDidChangeSelection=this._register(new I);onDidChangeSelection=this._onDidChangeSelection.event;_onDidChangeScroll=this._register(new I);onDidChangeScroll=this._onDidChangeScroll.event;_onDidChangeFileSystemProvider(e){this.input instanceof T&&this.input.resource?.scheme===e&&this._updateReadonly(this.input)}_onDidChangeInputCapabilities(e){this.input===e&&this._updateReadonly(e)}_updateReadonly(e){this._widget.value?.setOptions({isReadOnly:!!e.isReadonly()})}get textModel(){return this._widget.value?.textModel}get minimumWidth(){return 220}get maximumWidth(){return Number.POSITIVE_INFINITY}set minimumWidth(e){}set maximumWidth(e){}get scopedContextKeyService(){return this._widget.value?.scopedContextKeyService}createEditor(e){this._rootElement=_.append(e,_.$(".notebook-editor")),this._rootElement.id=`notebook-editor-element-${Q()}`}getActionViewItem(e,t){if(e.id===me)return this._instantiationService.createInstance(he,e,this,t)}getControl(){return this._widget.value}setVisible(e){super.setVisible(e),e||this._widget.value?.onWillHide()}setEditorVisible(e){super.setEditorVisible(e),this._groupListener.clear(),this._groupListener.add(this.group.onWillCloseEditor(t=>this._saveEditorViewState(t.editor))),this._groupListener.add(this.group.onDidModelChange(()=>{this._editorGroupService.activeGroup!==this.group&&this._widget?.value?.updateEditorFocus()})),e||(this._saveEditorViewState(this.input),this.input&&this._widget.value&&this._widget.value.onWillHide())}focus(){super.focus(),this._widget.value?.focus()}hasFocus(){const e=this._widget.value;return e?!!e&&_.isAncestorOfActiveElement(e.getDomNode()||_.isAncestorOfActiveElement(e.getOverflowContainerDomNode())):!1}async setInput(e,t,o,s,l){try{let i=!1;const h=Y(1e4);h.then(()=>{i=!0,this._handlePerfMark(r,e)});const r=new be;r.mark("startTime"),this._inputListener.value=e.onDidChangeCapabilities(()=>this._onDidChangeInputCapabilities(e)),this._widgetDisposableStore.clear(),this._widget.value?.onWillHide(),this._widget=this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget,this.group.id,e,void 0,this._pagePosition?.dimension,this.window),this._rootElement&&this._widget.value.getDomNode()&&(this._rootElement.setAttribute("aria-flowto",this._widget.value.getDomNode().id||""),_.setParentFlowTo(this._widget.value.getDomNode(),this._rootElement)),this._widgetDisposableStore.add(this._widget.value.onDidChangeModel(()=>this._onDidChangeModel.fire())),this._widgetDisposableStore.add(this._widget.value.onDidChangeActiveCell(()=>this._onDidChangeSelection.fire({reason:V.USER}))),this._pagePosition&&this._widget.value.layout(this._pagePosition.dimension,this._rootElement,this._pagePosition.position),await super.setInput(e,t,o,s);const d=await e.resolve(t,r);if(r.mark("inputLoaded"),s.isCancellationRequested)return;if(!this._widget.value)return l?void 0:this.setInput(e,t,o,s,!0);if(d===null){const c=this._notebookService.getViewTypeProvider(e.viewType);if(!c)throw new Error(v("fail.noEditor","Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.",e.viewType));await this._extensionsWorkbenchService.whenInitialized;const S=this._extensionsWorkbenchService.local.find(u=>u.identifier.id===c);throw A(new Error(v("fail.noEditor.extensionMissing","Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.",e.viewType)),[P({id:"workbench.notebook.action.installOrEnableMissing",label:S?v("notebookOpenEnableMissingViewType","Enable extension for '{0}'",e.viewType):v("notebookOpenInstallMissingViewType","Install extension for '{0}'",e.viewType),run:async()=>{const u=this._notebookService.onAddViewType(p=>{p===e.viewType&&(this._editorService.openEditor({resource:e.resource}),u.dispose())}),m=this._extensionsWorkbenchService.local.find(p=>p.identifier.id===c);try{m?await this._extensionsWorkbenchService.setEnablement(m,m.enablementState===x.DisabledWorkspace?x.EnabledWorkspace:x.EnabledGlobally):await this._instantiationService.createInstance(Ie,c).run()}catch(p){this.logService.error(`Failed to install or enable extension ${c}`,p),u.dispose()}}}),P({id:"workbench.notebook.action.openAsText",label:v("notebookOpenAsText","Open As Text"),run:async()=>{const u=await this._workingCopyBackupService.resolve({resource:e.resource,typeId:fe.create(e.viewType)});if(u){const m=await De(u.value);this._editorService.openEditor({resource:void 0,contents:m.toString()})}else this._editorService.openEditor({resource:e.resource,options:{override:R.id,pinned:!0}})}})],{allowDialog:!0})}this._widgetDisposableStore.add(d.notebook.onDidChangeContent(()=>this._onDidChangeSelection.fire({reason:V.EDIT})));const w=t?.viewState??this._loadNotebookEditorViewState(e);this._widget.value.setParentContextKeyService(this._contextKeyService),this._widget.value.setEditorProgressService(this._editorProgressService),await this._widget.value.setModel(d.notebook,w,r);const g=!!e.isReadonly();if(await this._widget.value.setOptions({...t,isReadOnly:g}),this._widgetDisposableStore.add(this._widget.value.onDidFocusWidget(()=>this._onDidFocusWidget.fire())),this._widgetDisposableStore.add(this._widget.value.onDidBlurWidget(()=>this._onDidBlurWidget.fire())),this._widgetDisposableStore.add(this._editorGroupService.createEditorDropTarget(this._widget.value.getDomNode(),{containsGroup:c=>this.group.id===c.id})),this._widgetDisposableStore.add(this._widget.value.onDidScroll(()=>{this._onDidChangeScroll.fire()})),r.mark("editorLoaded"),h.cancel(),i)return;this._handlePerfMark(r,e,d.notebook),this._handlePromptRecommendations(d.notebook)}catch(i){if(this.logService.warn("NotebookEditorWidget#setInput failed",i),ue(i))throw i;if(i.fileOperationResult===te.FILE_TOO_LARGE){let r;throw i instanceof ie?r=v("notebookTooLargeForHeapErrorWithSize","The notebook is not displayed in the notebook editor because it is very large ({0}).",ee.formatSize(i.size)):r=v("notebookTooLargeForHeapErrorWithoutSize","The notebook is not displayed in the notebook editor because it is very large."),ce(this.group,e,t,r,this._preferencesService)}throw A(i instanceof Error?i:new Error(i?i.message:""),[P({id:"workbench.notebook.action.openInTextEditor",label:v("notebookOpenInTextEditor","Open in Text Editor"),run:async()=>{const r=this._editorService.activeEditorPane;if(!r)return;const d=le.getCanonicalUri(r.input);if(d&&d.toString()===e.resource?.toString())return this._editorService.openEditor({resource:d,options:{override:R.id,pinned:!0}})}})],{allowDialog:!0})}}_handlePerfMark(e,t,o){const s=e.value,l=s.startTime,i=s.extensionActivated,h=s.inputLoaded,r=s.webviewCommLoaded,d=s.customMarkdownLoaded,w=s.editorLoaded;let g=-1,c=-1,S=-1,u=-1,m=-1;l!==void 0&&i!==void 0&&(g=i-l,h!==void 0&&(c=h-i),r!==void 0&&(S=r-i),d!==void 0&&(u=d-l),w!==void 0&&(m=w-l));let p,y,C,f,D,O,N;if(o){const B=new xe;for(const E of o.cells)E.cellKind===ve.Code?(p=(p||0)+1,D=(D||0)+E.getTextLength(),C=(C||0)+E.outputs.length,f=(f||0)+E.outputs.reduce((K,U)=>K+U.outputs.reduce((G,z)=>G+z.data.byteLength,0),0)):(y=(y||0)+1,O=(D||0)+E.getTextLength());N=B.elapsed()}this.logService.trace(`[NotebookEditor] open notebook perf ${o?.uri.toString()??""} - extensionActivation: ${g}, inputLoad: ${c}, webviewComm: ${S}, customMarkdown: ${u}, editorLoad: ${m}`),this.telemetryService.publicLog2("notebook/editorOpenPerf",{scheme:t.resource.scheme,ext:j(t.resource),viewType:t.viewType,extensionActivated:g,inputLoaded:c,webviewCommLoaded:S,customMarkdownLoaded:u,editorLoaded:m,codeCellCount:p,mdCellCount:y,outputCount:C,outputBytes:f,codeLength:D,markdownLength:O,notebookStatsLoaded:N})}_handlePromptRecommendations(e){this._notebookEditorWorkerService.canPromptRecommendation(e.uri).then(t=>{this.telemetryService.publicLog2("notebook/shouldPromptRecommendation",{shouldPrompt:t})})}clearInput(){this._inputListener.clear(),this._widget.value&&(this._saveEditorViewState(this.input),this._widget.value.onWillHide()),super.clearInput()}setOptions(e){this._widget.value?.setOptions(e),super.setOptions(e)}saveState(){this._saveEditorViewState(this.input),super.saveState()}getViewState(){const e=this.input;if(e instanceof T)return this._saveEditorViewState(e),this._loadNotebookEditorViewState(e)}getSelection(){if(this._widget.value){const e=this._widget.value.getActiveCell();if(e){const t=e.uri;return new M(t,e.getSelections())}}}getScrollPosition(){const e=this.getControl();if(!e)throw new Error("Notebook widget has not yet been initialized");return{scrollTop:e.scrollTop,scrollLeft:0}}setScrollPosition(e){const t=this.getControl();if(!t)throw new Error("Control has not yet been initialized");t.setScrollTop(e.scrollTop)}_saveEditorViewState(e){if(this._widget.value&&e instanceof T){if(this._widget.value.isDisposed)return;const t=this._widget.value.getEditorViewState();this._editorMemento.saveEditorState(this.group,e.resource,t)}}_loadNotebookEditorViewState(e){const t=this._editorMemento.loadEditorState(this.group,e.resource);if(t)return t;for(const o of this._editorGroupService.getGroups(Se.MOST_RECENTLY_ACTIVE))if(o.activeEditorPane!==this&&o.activeEditorPane instanceof b&&o.activeEditor?.matches(e))return o.activeEditorPane._widget.value?.getEditorViewState()}layout(e,t){this._rootElement.classList.toggle("mid-width",e.width<1e3&&e.width>=600),this._rootElement.classList.toggle("narrow-width",e.width<600),this._pagePosition={dimension:e,position:t},!(!this._widget.value||!(this.input instanceof T))&&(this.input.resource.toString()!==this.textModel?.uri.toString()&&this._widget.value?.hasModel()||this.isVisible()&&this._widget.value.layout(e,this._rootElement,t))}};b=W([n(1,se),n(2,ae),n(3,re),n(4,ne),n(5,Ee),n(6,we),n(7,pe),n(8,Z),n(9,oe),n(10,X),n(11,_e),n(12,ke),n(13,ye),n(14,Ce),n(15,Te),n(16,Pe),n(17,Le)],b);class M{constructor(a,e){this.cellUri=a;this.selections=e}compare(a){return a instanceof M?J(this.cellUri,a.cellUri)?L.IDENTICAL:L.DIFFERENT:L.DIFFERENT}restore(a){const e={cellOptions:{resource:this.cellUri,options:{selection:this.selections[0]}}};return Object.assign(e,a),e}log(){return this.cellUri.fragment}}export{b as NotebookEditor};
