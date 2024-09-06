var de=Object.defineProperty;var ce=Object.getOwnPropertyDescriptor;var k=(u,e,t,o)=>{for(var r=o>1?void 0:o?ce(e,t):e,n=u.length-1,l;n>=0;n--)(l=u[n])&&(r=(o?l(e,t,r):l(r))||r);return o&&r&&de(e,t,r),r},d=(u,e)=>(t,o)=>e(t,o,u);import{Event as y}from"../../../../base/common/event.js";import{toFormattedString as ue}from"../../../../base/common/jsonFormatter.js";import"../../../../base/common/jsonSchema.js";import{Disposable as M,DisposableStore as H,dispose as pe}from"../../../../base/common/lifecycle.js";import{parse as q}from"../../../../base/common/marshalling.js";import{Schemas as E}from"../../../../base/common/network.js";import{extname as G,isEqual as $}from"../../../../base/common/resources.js";import{assertType as X}from"../../../../base/common/types.js";import{URI as B}from"../../../../base/common/uri.js";import{ILanguageService as Y}from"../../../../editor/common/languages/language.js";import{DefaultEndOfLine as me}from"../../../../editor/common/model.js";import{IModelService as Q}from"../../../../editor/common/services/model.js";import{ITextModelService as Z}from"../../../../editor/common/services/resolverService.js";import*as i from"../../../../nls.js";import{IConfigurationService as ee}from"../../../../platform/configuration/common/configuration.js";import{Extensions as be}from"../../../../platform/configuration/common/configurationRegistry.js";import"../../../../platform/editor/common/editor.js";import{SyncDescriptor as U}from"../../../../platform/instantiation/common/descriptors.js";import{InstantiationType as b,registerSingleton as f}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as fe}from"../../../../platform/instantiation/common/instantiation.js";import{Extensions as he}from"../../../../platform/jsonschemas/common/jsonContributionRegistry.js";import{ILabelService as ge}from"../../../../platform/label/common/label.js";import{Registry as v}from"../../../../platform/registry/common/platform.js";import{IUndoRedoService as ke}from"../../../../platform/undoRedo/common/undoRedo.js";import{EditorPaneDescriptor as K}from"../../../browser/editor.js";import{registerWorkbenchContribution2 as w,Extensions as ye,WorkbenchPhase as C}from"../../../common/contributions.js";import{EditorExtensions as z}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import{IEditorGroupsService as ve}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as Ie}from"../../../services/editor/common/editorService.js";import{IExtensionService as Se}from"../../../services/extensions/common/extensions.js";import{LifecyclePhase as we}from"../../../services/lifecycle/common/lifecycle.js";import"../../../services/workingCopy/common/workingCopy.js";import{IWorkingCopyEditorService as Ce}from"../../../services/workingCopy/common/workingCopyEditorService.js";import{INotebookCellStatusBarService as Ee}from"../common/notebookCellStatusBarService.js";import{CellKind as De,CellUri as I,NotebookCellsChangeType as oe,NotebookSetting as a,NotebookWorkingCopyTypeIdentifier as xe}from"../common/notebookCommon.js";import{NotebookDiffEditorInput as F}from"../common/notebookDiffEditorInput.js";import{NotebookEditorInput as h}from"../common/notebookEditorInput.js";import{INotebookEditorModelResolverService as W}from"../common/notebookEditorModelResolverService.js";import{NotebookModelResolverServiceImpl as Te}from"../common/notebookEditorModelResolverServiceImpl.js";import{INotebookKernelHistoryService as Ne,INotebookKernelService as Re}from"../common/notebookKernelService.js";import{INotebookRendererMessagingService as Oe}from"../common/notebookRendererMessagingService.js";import{INotebookService as V}from"../common/notebookService.js";import{INotebookEditorWorkerService as Le}from"../common/services/notebookWorkerService.js";import{getFormattedOutputJSON as te,getStreamOutputData as ze}from"./diff/diffElementViewModel.js";import{NotebookTextDiffEditor as ie}from"./diff/notebookDiffEditor.js";import{NotebookEditor as re}from"./notebookEditor.js";import{NotebookCellStatusBarService as _e}from"./services/notebookCellStatusBarServiceImpl.js";import{INotebookEditorService as Me}from"./services/notebookEditorService.js";import{NotebookEditorWidgetService as Fe}from"./services/notebookEditorServiceImpl.js";import{NotebookKernelService as We}from"./services/notebookKernelServiceImpl.js";import{NotebookRendererMessagingService as Pe}from"./services/notebookRendererMessagingServiceImpl.js";import{NotebookService as Be}from"./services/notebookServiceImpl.js";import{NotebookEditorWorkerServiceImpl as Ue}from"./services/notebookWorkerServiceImpl.js";import{INotebookCellOutlineDataSourceFactory as Ke,NotebookCellOutlineDataSourceFactory as Ve}from"./viewModel/notebookOutlineDataSourceFactory.js";import"./controller/coreActions.js";import"./controller/insertCellActions.js";import"./controller/executeActions.js";import"./controller/sectionActions.js";import"./controller/layoutActions.js";import"./controller/editActions.js";import"./controller/cellOutputActions.js";import"./controller/apiActions.js";import"./controller/foldingController.js";import"./controller/chat/notebook.chat.contribution.js";import"./contrib/editorHint/emptyCellEditorHint.js";import"./contrib/clipboard/notebookClipboard.js";import"./contrib/find/notebookFind.js";import"./contrib/format/formatting.js";import"./contrib/saveParticipants/saveParticipants.js";import"./contrib/gettingStarted/notebookGettingStarted.js";import"./contrib/layout/layoutActions.js";import"./contrib/marker/markerProvider.js";import"./contrib/navigation/arrow.js";import"./contrib/outline/notebookOutline.js";import"./contrib/profile/notebookProfile.js";import"./contrib/cellStatusBar/statusBarProviders.js";import"./contrib/cellStatusBar/contributedStatusBarItemController.js";import"./contrib/cellStatusBar/executionStatusBarItemController.js";import"./contrib/editorStatusBar/editorStatusBar.js";import"./contrib/undoRedo/notebookUndoRedo.js";import"./contrib/cellCommands/cellCommands.js";import"./contrib/viewportWarmup/viewportWarmup.js";import"./contrib/troubleshoot/layout.js";import"./contrib/debug/notebookBreakpoints.js";import"./contrib/debug/notebookCellPausing.js";import"./contrib/debug/notebookDebugDecorations.js";import"./contrib/execute/executionEditorProgress.js";import"./contrib/kernelDetection/notebookKernelDetection.js";import"./contrib/cellDiagnostics/cellDiagnostics.js";import"./contrib/multicursor/notebookMulticursor.js";import"./diff/notebookDiffActions.js";import{ICodeEditorService as je}from"../../../../editor/browser/services/codeEditorService.js";import{editorOptionsRegistry as Ae}from"../../../../editor/common/config/editorOptions.js";import"../../../../editor/common/languageFeatureRegistry.js";import{PLAINTEXT_LANGUAGE_ID as Je}from"../../../../editor/common/languages/modesRegistry.js";import{ILanguageFeaturesService as He}from"../../../../editor/common/services/languageFeatures.js";import{AccessibleViewRegistry as ne}from"../../../../platform/accessibility/browser/accessibleViewRegistry.js";import D from"../../../../platform/product/common/product.js";import{COMMENTEDITOR_DECORATION_KEY as qe}from"../../comments/browser/commentReply.js";import{DefaultFormatter as j}from"../../format/browser/formatActionsMultiple.js";import{getFormattedMetadataJSON as A}from"../common/model/notebookCellTextModel.js";import{INotebookExecutionService as Ge}from"../common/notebookExecutionService.js";import{INotebookExecutionStateService as $e}from"../common/notebookExecutionStateService.js";import{INotebookKeymapService as Xe}from"../common/notebookKeymapService.js";import{INotebookLoggingService as Ye}from"../common/notebookLoggingService.js";import{NotebookVariables as Qe}from"./contrib/notebookVariables/notebookVariables.js";import{NotebookMultiTextDiffEditor as ae}from"./diff/notebookMultiDiffEditor.js";import{NotebookMultiDiffEditorInput as se}from"./diff/notebookMultiDiffEditorInput.js";import{NotebookAccessibilityHelp as Ze}from"./notebookAccessibilityHelp.js";import{NotebookAccessibleView as eo}from"./notebookAccessibleView.js";import{NotebookExecutionService as oo}from"./services/notebookExecutionServiceImpl.js";import{NotebookExecutionStateService as to}from"./services/notebookExecutionStateServiceImpl.js";import{NotebookKernelHistoryService as io}from"./services/notebookKernelHistoryServiceImpl.js";import{NotebookKeymapService as ro}from"./services/notebookKeymapServiceImpl.js";import{NotebookLoggingService as no}from"./services/notebookLoggingServiceImpl.js";v.as(z.EditorPane).registerEditorPane(K.create(re,re.ID,"Notebook Editor"),[new U(h)]),v.as(z.EditorPane).registerEditorPane(K.create(ie,ie.ID,"Notebook Diff Editor"),[new U(F)]),v.as(z.EditorPane).registerEditorPane(K.create(ae,ae.ID,"Notebook Diff Editor"),[new U(se)]);let _=class{constructor(e){this._configurationService=e}canSerialize(){return!0}serialize(e){return X(e instanceof F),JSON.stringify({resource:e.resource,originalResource:e.original.resource,name:e.getName(),originalName:e.original.getName(),textDiffName:e.getName(),viewType:e.viewType})}deserialize(e,t){const o=q(t);if(!o)return;const{resource:r,originalResource:n,name:l,viewType:s}=o;if(!(!o||!B.isUri(r)||!B.isUri(n)||typeof l!="string"||typeof s!="string"))return this._configurationService.getValue("notebook.experimental.enableNewDiffEditor")?se.create(e,r,l,void 0,n,s):F.create(e,r,l,void 0,n,s)}static canResolveBackup(e,t){return!1}};_=k([d(0,ee)],_);class ao{canSerialize(e){return e.typeId===h.ID}serialize(e){X(e instanceof h);const t={resource:e.resource,preferredResource:e.preferredResource,viewType:e.viewType,options:e.options};return JSON.stringify(t)}deserialize(e,t){const o=q(t);if(!o)return;const{resource:r,preferredResource:n,viewType:l,options:s}=o;return!o||!B.isUri(r)||typeof l!="string"?void 0:h.getOrCreate(e,r,n,l,s)}}v.as(z.EditorFactory).registerEditorSerializer(h.ID,ao),v.as(z.EditorFactory).registerEditorSerializer(F.ID,_);let S=class extends M{constructor(t,o,r){super();this.codeEditorService=r;this.updateCellUndoRedoComparisonKey(o,t),this._register(o.onDidChangeConfiguration(n=>{n.affectsConfiguration(a.undoRedoPerCell)&&this.updateCellUndoRedoComparisonKey(o,t)})),this.codeEditorService.registerDecorationType("comment-controller",qe,{})}static ID="workbench.contrib.notebook";_uriComparisonKeyComputer;updateCellUndoRedoComparisonKey(t,o){const r=t.getValue(a.undoRedoPerCell);r?(this._uriComparisonKeyComputer?.dispose(),this._uriComparisonKeyComputer=void 0):this._uriComparisonKeyComputer||(this._uriComparisonKeyComputer=o.registerUriComparisonKeyComputer(I.scheme,{getComparisonKey:n=>r?n.toString():S._getCellUndoRedoComparisonKey(n)}))}static _getCellUndoRedoComparisonKey(t){const o=I.parse(t);return o?o.notebook.toString():t.toString()}dispose(){super.dispose(),this._uriComparisonKeyComputer?.dispose()}};S=k([d(0,ke),d(1,ee),d(2,je)],S);let x=class{constructor(e,t,o,r){this._modelService=t;this._languageService=o;this._notebookModelResolverService=r;this._registration=e.registerTextModelContentProvider(I.scheme,this)}static ID="workbench.contrib.cellContentProvider";_registration;dispose(){this._registration.dispose()}async provideTextContent(e){const t=this._modelService.getModel(e);if(t)return t;const o=I.parse(e);if(!o)return null;const r=await this._notebookModelResolverService.resolve(o.notebook);let n=null;if(!r.object.isResolved())return null;for(const s of r.object.notebook.cells)if(s.uri.toString()===e.toString()){const m={create:g=>{const P=g===me.CRLF?`\r
`:`
`;return s.textBuffer.setEOL(P),{textBuffer:s.textBuffer,disposable:M.None}},getFirstLineText:g=>s.textBuffer.getLineContent(1).substring(0,g)},c=this._languageService.getLanguageIdByLanguageName(s.language),p=c?this._languageService.createById(c):s.cellKind===De.Markup?this._languageService.createById("markdown"):this._languageService.createByFilepathOrFirstLine(e,s.textBuffer.getLineContent(1));n=this._modelService.createModel(m,p,e);break}if(!n)return r.dispose(),null;const l=y.any(n.onWillDispose,r.object.notebook.onWillDispose)(()=>{l.dispose(),r.dispose()});return n}};x=k([d(0,Z),d(1,Q),d(2,Y),d(3,W)],x);let T=class{constructor(e,t,o,r,n){this._modelService=t;this._languageService=o;this._labelService=r;this._notebookModelResolverService=n;this._disposables.push(e.registerTextModelContentProvider(E.vscodeNotebookCellMetadata,{provideTextContent:this.provideMetadataTextContent.bind(this)})),this._disposables.push(e.registerTextModelContentProvider(E.vscodeNotebookCellOutput,{provideTextContent:this.provideOutputTextContent.bind(this)})),this._disposables.push(this._labelService.registerFormatter({scheme:E.vscodeNotebookCellMetadata,formatting:{label:"${path} (metadata)",separator:"/"}})),this._disposables.push(this._labelService.registerFormatter({scheme:E.vscodeNotebookCellOutput,formatting:{label:"${path} (output)",separator:"/"}}))}static ID="workbench.contrib.cellInfoContentProvider";_disposables=[];dispose(){pe(this._disposables)}async provideMetadataTextContent(e){const t=this._modelService.getModel(e);if(t)return t;const o=I.parseCellPropertyUri(e,E.vscodeNotebookCellMetadata);if(!o)return null;const r=await this._notebookModelResolverService.resolve(o.notebook);let n=null;const l=this._languageService.createById("json"),s=new H;for(const c of r.object.notebook.cells)if(c.handle===o.handle){const p=r.object.notebook.cells.indexOf(c),g=A(r.object.notebook.transientOptions.transientCellMetadata,c.metadata,c.language);n=this._modelService.createModel(g,l,e),this._disposables.push(s.add(r.object.notebook.onDidChangeContent(P=>{if(n&&P.rawEvents.some(L=>(L.kind===oe.ChangeCellMetadata||L.kind===oe.ChangeCellLanguage)&&L.index===p)){const L=A(r.object.notebook.transientOptions.transientCellMetadata,c.metadata,c.language);n.getValue()!==L&&n.setValue(A(r.object.notebook.transientOptions.transientCellMetadata,c.metadata,c.language))}})));break}if(!n)return r.dispose(),null;const m=n.onWillDispose(()=>{s.dispose(),m.dispose(),r.dispose()});return n}parseStreamOutput(e){if(!e)return;const t=ze(e.outputs);if(t)return{content:t,mode:this._languageService.createById(Je)}}_getResult(e,t){let o;const r=this._languageService.createById("json"),n=t.outputs.find(c=>c.outputId===e.outputId||c.alternativeOutputId===e.outputId),l=this.parseStreamOutput(n);if(l)return o=l,o;const s=t.outputs.map(c=>({metadata:c.metadata,outputItems:c.outputs.map(p=>({mimeType:p.mime,data:p.data.toString()}))}));return o={content:ue(s,{}),mode:r},o}async provideOutputsTextContent(e){const t=this._modelService.getModel(e);if(t)return t;const o=I.parseCellPropertyUri(e,E.vscodeNotebookCellOutput);if(!o)return null;const r=await this._notebookModelResolverService.resolve(o.notebook),n=r.object.notebook.cells.find(p=>p.handle===o.handle);if(!n)return r.dispose(),null;const l=this._languageService.createById("json"),s=this._modelService.createModel(te(n.outputs||[]),l,e,!0),m=y.any(n.onDidChangeOutputs??y.None,n.onDidChangeOutputItems??y.None)(()=>{s.setValue(te(n.outputs||[]))}),c=s.onWillDispose(()=>{c.dispose(),m.dispose(),r.dispose()});return s}async provideOutputTextContent(e){const t=this._modelService.getModel(e);if(t)return t;const o=I.parseCellOutputUri(e);if(!o)return this.provideOutputsTextContent(e);const r=await this._notebookModelResolverService.resolve(o.notebook),n=r.object.notebook.cells.find(p=>!!p.outputs.find(g=>g.outputId===o.outputId||g.alternativeOutputId===o.outputId));if(!n)return r.dispose(),null;const l=this._getResult(o,n);if(!l)return r.dispose(),null;const s=this._modelService.createModel(l.content,l.mode,e),m=y.any(n.onDidChangeOutputs??y.None,n.onDidChangeOutputItems??y.None)(()=>{const p=this._getResult(o,n);p&&(s.setValue(p.content),s.setLanguage(p.mode.languageId))}),c=s.onWillDispose(()=>{c.dispose(),m.dispose(),r.dispose()});return s}};T=k([d(0,Z),d(1,Q),d(2,Y),d(3,ge),d(4,W)],T);class le extends M{static ID="workbench.contrib.registerCellSchemas";constructor(){super(),this.registerMetadataSchemas()}registerMetadataSchemas(){const e=v.as(he.JSONContribution),t={properties:{language:{type:"string",description:"The language for the cell"}},additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0};e.registerSchema("vscode://schemas/notebook/cellmetadata",t)}}let N=class{constructor(e,t,o){this._editorService=e;this._notebookEditorModelService=t;this._disposables.add(y.debounce(this._notebookEditorModelService.onDidChangeDirty,(r,n)=>r?[...r,n]:[n],100)(this._openMissingDirtyNotebookEditors,this)),this._disposables.add(t.onWillFailWithConflict(r=>{for(const n of o.groups){const l=n.editors.filter(m=>m instanceof h&&m.viewType!==r.viewType&&$(m.resource,r.resource)),s=n.closeEditors(l);r.waitUntil(s)}}))}static ID="workbench.contrib.notebookEditorManager";_disposables=new H;dispose(){this._disposables.dispose()}_openMissingDirtyNotebookEditors(e){const t=[];for(const o of e)o.isDirty()&&!this._editorService.isOpened({resource:o.resource,typeId:h.ID,editorId:o.viewType})&&G(o.resource)!==".interactive"&&t.push({resource:o.resource,options:{inactive:!0,preserveFocus:!0,pinned:!0,override:o.viewType}});t.length>0&&this._editorService.openEditors(t)}};N=k([d(0,Ie),d(1,W),d(2,ve)],N);let R=class extends M{constructor(t,o,r,n){super();this._instantiationService=t;this._workingCopyEditorService=o;this._extensionService=r;this._notebookService=n;this._installHandler()}static ID="workbench.contrib.simpleNotebookWorkingCopyEditorHandler";async handles(t){const o=this.handlesSync(t);return o?this._notebookService.canResolve(o):!1}handlesSync(t){const o=this._getViewType(t);if(!(!o||o==="interactive"||G(t.resource)===".replNotebook"))return o}isOpen(t,o){return this.handlesSync(t)?o instanceof h&&o.viewType===this._getViewType(t)&&$(t.resource,o.resource):!1}createEditor(t){return h.getOrCreate(this._instantiationService,t.resource,void 0,this._getViewType(t))}async _installHandler(){await this._extensionService.whenInstalledExtensionsRegistered(),this._register(this._workingCopyEditorService.registerHandler(this))}_getViewType(t){return xe.parse(t.typeId)}};R=k([d(0,fe),d(1,Ce),d(2,Se),d(3,V)],R);let O=class{constructor(e,t){this._notebookService=e;t.setNotebookTypeResolver(this._getNotebookInfo.bind(this))}static ID="workbench.contrib.notebookLanguageSelectorScoreRefine";_getNotebookInfo(e){const t=I.parse(e);if(!t)return;const o=this._notebookService.getNotebookTextModel(t.notebook);if(o)return{uri:o.uri,type:o.viewType}}};O=k([d(0,V),d(1,He)],O);const so=v.as(ye.Workbench);w(S.ID,S,C.BlockStartup),w(x.ID,x,C.BlockStartup),w(T.ID,T,C.BlockStartup),w(le.ID,le,C.BlockStartup),w(N.ID,N,C.BlockRestore),w(O.ID,O,C.BlockRestore),w(R.ID,R,C.BlockRestore),so.registerWorkbenchContribution(Qe,we.Eventually),ne.register(new eo),ne.register(new Ze),f(V,Be,b.Delayed),f(Le,Ue,b.Delayed),f(W,Te,b.Delayed),f(Ee,_e,b.Delayed),f(Me,Fe,b.Delayed),f(Re,We,b.Delayed),f(Ne,io,b.Delayed),f(Ge,oo,b.Delayed),f($e,to,b.Delayed),f(Oe,Pe,b.Delayed),f(Xe,ro,b.Delayed),f(Ye,no,b.Delayed),f(Ke,Ve,b.Delayed);const J={};function lo(u){return typeof u.type<"u"||typeof u.anyOf<"u"}for(const u of Ae){const e=u.schema;if(e)if(lo(e))J[`editor.${u.name}`]=e;else for(const t in e)Object.hasOwnProperty.call(e,t)&&(J[t]=e[t])}const co={description:i.localize("notebook.editorOptions.experimentalCustomization","Settings for code editors used in notebooks. This can be used to customize most editor.* settings."),default:{},allOf:[{properties:J}],tags:["notebookLayout"]},uo=v.as(be.Configuration);uo.registerConfiguration({id:"notebook",order:100,title:i.localize("notebookConfigurationTitle","Notebook"),type:"object",properties:{[a.displayOrder]:{description:i.localize("notebook.displayOrder.description","Priority list for output mime types"),type:"array",items:{type:"string"},default:[]},[a.cellToolbarLocation]:{description:i.localize("notebook.cellToolbarLocation.description","Where the cell toolbar should be shown, or whether it should be hidden."),type:"object",additionalProperties:{markdownDescription:i.localize("notebook.cellToolbarLocation.viewType","Configure the cell toolbar position for for specific file types"),type:"string",enum:["left","right","hidden"]},default:{default:"right"},tags:["notebookLayout"]},[a.showCellStatusBar]:{description:i.localize("notebook.showCellStatusbar.description","Whether the cell status bar should be shown."),type:"string",enum:["hidden","visible","visibleAfterExecute"],enumDescriptions:[i.localize("notebook.showCellStatusbar.hidden.description","The cell Status bar is always hidden."),i.localize("notebook.showCellStatusbar.visible.description","The cell Status bar is always visible."),i.localize("notebook.showCellStatusbar.visibleAfterExecute.description","The cell Status bar is hidden until the cell has executed. Then it becomes visible to show the execution status.")],default:"visible",tags:["notebookLayout"]},[a.textDiffEditorPreview]:{description:i.localize("notebook.diff.enablePreview.description","Whether to use the enhanced text diff editor for notebook."),type:"boolean",default:!0,tags:["notebookLayout"]},[a.diffOverviewRuler]:{description:i.localize("notebook.diff.enableOverviewRuler.description","Whether to render the overview ruler in the diff editor for notebook."),type:"boolean",default:!1,tags:["notebookLayout"]},[a.cellToolbarVisibility]:{markdownDescription:i.localize("notebook.cellToolbarVisibility.description","Whether the cell toolbar should appear on hover or click."),type:"string",enum:["hover","click"],default:"click",tags:["notebookLayout"]},[a.undoRedoPerCell]:{description:i.localize("notebook.undoRedoPerCell.description","Whether to use separate undo/redo stack for each cell."),type:"boolean",default:!0,tags:["notebookLayout"]},[a.compactView]:{description:i.localize("notebook.compactView.description","Control whether the notebook editor should be rendered in a compact form. For example, when turned on, it will decrease the left margin width."),type:"boolean",default:!0,tags:["notebookLayout"]},[a.focusIndicator]:{description:i.localize("notebook.focusIndicator.description","Controls where the focus indicator is rendered, either along the cell borders or on the left gutter."),type:"string",enum:["border","gutter"],default:"gutter",tags:["notebookLayout"]},[a.insertToolbarLocation]:{description:i.localize("notebook.insertToolbarPosition.description","Control where the insert cell actions should appear."),type:"string",enum:["betweenCells","notebookToolbar","both","hidden"],enumDescriptions:[i.localize("insertToolbarLocation.betweenCells","A toolbar that appears on hover between cells."),i.localize("insertToolbarLocation.notebookToolbar","The toolbar at the top of the notebook editor."),i.localize("insertToolbarLocation.both","Both toolbars."),i.localize("insertToolbarLocation.hidden","The insert actions don't appear anywhere.")],default:"both",tags:["notebookLayout"]},[a.globalToolbar]:{description:i.localize("notebook.globalToolbar.description","Control whether to render a global toolbar inside the notebook editor."),type:"boolean",default:!0,tags:["notebookLayout"]},[a.stickyScrollEnabled]:{description:i.localize("notebook.stickyScrollEnabled.description","Experimental. Control whether to render notebook Sticky Scroll headers in the notebook editor."),type:"boolean",default:!1,tags:["notebookLayout"]},[a.stickyScrollMode]:{description:i.localize("notebook.stickyScrollMode.description","Control whether nested sticky lines appear to stack flat or indented."),type:"string",enum:["flat","indented"],enumDescriptions:[i.localize("notebook.stickyScrollMode.flat","Nested sticky lines appear flat."),i.localize("notebook.stickyScrollMode.indented","Nested sticky lines appear indented.")],default:"indented",tags:["notebookLayout"]},[a.consolidatedOutputButton]:{description:i.localize("notebook.consolidatedOutputButton.description","Control whether outputs action should be rendered in the output toolbar."),type:"boolean",default:!0,tags:["notebookLayout"]},[a.showFoldingControls]:{description:i.localize("notebook.showFoldingControls.description","Controls when the Markdown header folding arrow is shown."),type:"string",enum:["always","never","mouseover"],enumDescriptions:[i.localize("showFoldingControls.always","The folding controls are always visible."),i.localize("showFoldingControls.never","Never show the folding controls and reduce the gutter size."),i.localize("showFoldingControls.mouseover","The folding controls are visible only on mouseover.")],default:"mouseover",tags:["notebookLayout"]},[a.dragAndDropEnabled]:{description:i.localize("notebook.dragAndDrop.description","Control whether the notebook editor should allow moving cells through drag and drop."),type:"boolean",default:!0,tags:["notebookLayout"]},[a.consolidatedRunButton]:{description:i.localize("notebook.consolidatedRunButton.description","Control whether extra actions are shown in a dropdown next to the run button."),type:"boolean",default:!1,tags:["notebookLayout"]},[a.globalToolbarShowLabel]:{description:i.localize("notebook.globalToolbarShowLabel","Control whether the actions on the notebook toolbar should render label or not."),type:"string",enum:["always","never","dynamic"],default:"always",tags:["notebookLayout"]},[a.textOutputLineLimit]:{markdownDescription:i.localize("notebook.textOutputLineLimit","Controls how many lines of text are displayed in a text output. If {0} is enabled, this setting is used to determine the scroll height of the output.","`#notebook.output.scrolling#`"),type:"number",default:30,tags:["notebookLayout","notebookOutputLayout"],minimum:1},[a.LinkifyOutputFilePaths]:{description:i.localize("notebook.disableOutputFilePathLinks","Control whether to disable filepath links in the output of notebook cells."),type:"boolean",default:!0,tags:["notebookOutputLayout"]},[a.minimalErrorRendering]:{description:i.localize("notebook.minimalErrorRendering","Control whether to render error output in a minimal style."),type:"boolean",default:!1,tags:["notebookOutputLayout"]},[a.markupFontSize]:{markdownDescription:i.localize("notebook.markup.fontSize","Controls the font size in pixels of rendered markup in notebooks. When set to {0}, 120% of {1} is used.","`0`","`#editor.fontSize#`"),type:"number",default:0,tags:["notebookLayout"]},[a.markdownLineHeight]:{markdownDescription:i.localize("notebook.markdown.lineHeight","Controls the line height in pixels of markdown cells in notebooks. When set to {0}, {1} will be used","`0`","`normal`"),type:"number",default:0,tags:["notebookLayout"]},[a.cellEditorOptionsCustomizations]:co,[a.interactiveWindowCollapseCodeCells]:{markdownDescription:i.localize("notebook.interactiveWindow.collapseCodeCells","Controls whether code cells in the interactive window are collapsed by default."),type:"string",enum:["always","never","fromEditor"],default:"fromEditor"},[a.outputLineHeight]:{markdownDescription:i.localize("notebook.outputLineHeight",`Line height of the output text within notebook cells.
 - When set to 0, editor line height is used.
 - Values between 0 and 8 will be used as a multiplier with the font size.
 - Values greater than or equal to 8 will be used as effective values.`),type:"number",default:0,tags:["notebookLayout","notebookOutputLayout"]},[a.outputFontSize]:{markdownDescription:i.localize("notebook.outputFontSize","Font size for the output text within notebook cells. When set to 0, {0} is used.","`#editor.fontSize#`"),type:"number",default:0,tags:["notebookLayout","notebookOutputLayout"]},[a.outputFontFamily]:{markdownDescription:i.localize("notebook.outputFontFamily","The font family of the output text within notebook cells. When set to empty, the {0} is used.","`#editor.fontFamily#`"),type:"string",tags:["notebookLayout","notebookOutputLayout"]},[a.outputScrolling]:{markdownDescription:i.localize("notebook.outputScrolling","Initially render notebook outputs in a scrollable region when longer than the limit."),type:"boolean",tags:["notebookLayout","notebookOutputLayout"],default:typeof D.quality=="string"&&D.quality!=="stable"},[a.outputWordWrap]:{markdownDescription:i.localize("notebook.outputWordWrap","Controls whether the lines in output should wrap."),type:"boolean",tags:["notebookLayout","notebookOutputLayout"],default:!1},[a.defaultFormatter]:{description:i.localize("notebookFormatter.default","Defines a default notebook formatter which takes precedence over all other formatter settings. Must be the identifier of an extension contributing a formatter."),type:["string","null"],default:null,enum:j.extensionIds,enumItemLabels:j.extensionItemLabels,markdownEnumDescriptions:j.extensionDescriptions},[a.formatOnSave]:{markdownDescription:i.localize("notebook.formatOnSave","Format a notebook on save. A formatter must be available, the file must not be saved after delay, and the editor must not be shutting down."),type:"boolean",tags:["notebookLayout"],default:!1},[a.insertFinalNewline]:{markdownDescription:i.localize("notebook.insertFinalNewline","When enabled, insert a final new line into the end of code cells when saving a notebook."),type:"boolean",tags:["notebookLayout"],default:!1},[a.formatOnCellExecution]:{markdownDescription:i.localize("notebook.formatOnCellExecution","Format a notebook cell upon execution. A formatter must be available."),type:"boolean",default:!1},[a.confirmDeleteRunningCell]:{markdownDescription:i.localize("notebook.confirmDeleteRunningCell","Control whether a confirmation prompt is required to delete a running cell."),type:"boolean",default:!0},[a.findFilters]:{markdownDescription:i.localize("notebook.findFilters","Customize the Find Widget behavior for searching within notebook cells. When both markup source and markup preview are enabled, the Find Widget will search either the source code or preview based on the current state of the cell."),type:"object",properties:{markupSource:{type:"boolean",default:!0},markupPreview:{type:"boolean",default:!0},codeSource:{type:"boolean",default:!0},codeOutput:{type:"boolean",default:!0}},default:{markupSource:!0,markupPreview:!0,codeSource:!0,codeOutput:!0},tags:["notebookLayout"]},[a.remoteSaving]:{markdownDescription:i.localize("notebook.remoteSaving","Enables the incremental saving of notebooks between processes and across Remote connections. When enabled, only the changes to the notebook are sent to the extension host, improving performance for large notebooks and slow network connections."),type:"boolean",default:typeof D.quality=="string"&&D.quality!=="stable",tags:["experimental"]},[a.scrollToRevealCell]:{markdownDescription:i.localize("notebook.scrolling.revealNextCellOnExecute.description","How far to scroll when revealing the next cell upon running {0}.","notebook.cell.executeAndSelectBelow"),type:"string",enum:["fullCell","firstLine","none"],markdownEnumDescriptions:[i.localize("notebook.scrolling.revealNextCellOnExecute.fullCell.description","Scroll to fully reveal the next cell."),i.localize("notebook.scrolling.revealNextCellOnExecute.firstLine.description","Scroll to reveal the first line of the next cell."),i.localize("notebook.scrolling.revealNextCellOnExecute.none.description","Do not scroll.")],default:"fullCell"},[a.cellGenerate]:{markdownDescription:i.localize("notebook.cellGenerate","Enable experimental generate action to create code cell with inline chat enabled."),type:"boolean",default:typeof D.quality=="string"&&D.quality!=="stable",tags:["experimental"]},[a.notebookVariablesView]:{markdownDescription:i.localize("notebook.VariablesView.description","Enable the experimental notebook variables view within the debug panel."),type:"boolean",default:!1},[a.cellFailureDiagnostics]:{markdownDescription:i.localize("notebook.cellFailureDiagnostics","Show available diagnostics for cell failures."),type:"boolean",default:!0},[a.outputBackupSizeLimit]:{markdownDescription:i.localize("notebook.backup.sizeLimit","The limit of notebook output size in kilobytes (KB) where notebook files will no longer be backed up for hot reload. Use 0 for unlimited."),type:"number",default:1e4}}});export{S as NotebookContribution};
