var $=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var W=(_,t,e,i)=>{for(var o=i>1?void 0:i?F(t,e):t,n=_.length-1,r;n>=0;n--)(r=_[n])&&(o=(i?r(t,e,o):r(o))||o);return i&&o&&$(t,e,o),o},d=(_,t)=>(e,i)=>t(e,i,_);import"./media/interactive.css";import*as a from"../../../../base/browser/dom.js";import"../../../../base/common/cancellation.js";import{Emitter as D}from"../../../../base/common/event.js";import{DisposableStore as G,MutableDisposable as U}from"../../../../base/common/lifecycle.js";import{ICodeEditorService as z}from"../../../../editor/browser/services/codeEditorService.js";import{CodeEditorWidget as Y}from"../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";import"../../../../editor/common/editorCommon.js";import{IContextKeyService as x}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as j}from"../../../../platform/instantiation/common/instantiation.js";import{IStorageService as J}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as q}from"../../../../platform/telemetry/common/telemetry.js";import{IThemeService as Z}from"../../../../platform/theme/common/themeService.js";import{EditorPane as Q}from"../../../browser/parts/editor/editorPane.js";import{EditorPaneSelectionChangeReason as m}from"../../../common/editor.js";import{getSimpleEditorOptions as X}from"../../codeEditor/browser/simpleEditorOptions.js";import"../../notebook/browser/notebookBrowser.js";import{NotebookEditorExtensionsRegistry as tt}from"../../notebook/browser/notebookEditorExtensions.js";import{INotebookEditorService as et}from"../../notebook/browser/services/notebookEditorService.js";import"../../notebook/browser/notebookEditorWidget.js";import{GroupsOrder as it,IEditorGroupsService as ot}from"../../../services/editor/common/editorGroupsService.js";import{ExecutionStateCellStatusBarContrib as nt,TimerCellStatusBarContrib as rt}from"../../notebook/browser/contrib/cellStatusBar/executionStatusBarItemController.js";import{INotebookKernelService as st}from"../../notebook/common/notebookKernelService.js";import{ILanguageService as dt}from"../../../../editor/common/languages/language.js";import{IMenuService as at,MenuId as p}from"../../../../platform/actions/common/actions.js";import{IKeybindingService as lt}from"../../../../platform/keybinding/common/keybinding.js";import{InteractiveWindowSetting as T,INTERACTIVE_INPUT_CURSOR_BOUNDARY as ct}from"../../interactive/browser/interactiveCommon.js";import{IConfigurationService as ht}from"../../../../platform/configuration/common/configuration.js";import{NotebookOptions as ut}from"../../notebook/browser/notebookOptions.js";import{ToolBar as pt}from"../../../../base/browser/ui/toolbar/toolbar.js";import{IContextMenuService as gt}from"../../../../platform/contextview/browser/contextView.js";import{createActionViewItem as _t,createAndFillInActionBarActions as vt}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import"../../../../base/common/actions.js";import{EditorExtensionsRegistry as M}from"../../../../editor/browser/editorExtensions.js";import{ParameterHintsController as mt}from"../../../../editor/contrib/parameterHints/browser/parameterHints.js";import{MenuPreventer as Et}from"../../codeEditor/browser/menuPreventer.js";import{SelectionClipboardContributionID as O}from"../../codeEditor/browser/selectionClipboard.js";import{ContextMenuController as L}from"../../../../editor/contrib/contextmenu/browser/contextmenu.js";import{SuggestController as N}from"../../../../editor/contrib/suggest/browser/suggestController.js";import{SnippetController2 as St}from"../../../../editor/contrib/snippet/browser/snippetController2.js";import{TabCompletionController as bt}from"../../snippets/browser/tabCompletion.js";import{MarkerController as V}from"../../../../editor/contrib/gotoError/browser/gotoError.js";import"../../../common/editor/editorInput.js";import{ITextResourceConfigurationService as Ct}from"../../../../editor/common/services/textResourceConfiguration.js";import{TextEditorSelectionSource as k}from"../../../../platform/editor/common/editor.js";import{INotebookExecutionStateService as ft,NotebookExecutionType as It}from"../../notebook/common/notebookExecutionStateService.js";import{NOTEBOOK_KERNEL as Dt}from"../../notebook/common/notebookContextKeys.js";import"../../../../editor/common/cursorEvents.js";import{IExtensionService as kt}from"../../../services/extensions/common/extensions.js";import{isEqual as yt}from"../../../../base/common/resources.js";import{NotebookFindContrib as wt}from"../../notebook/browser/contrib/find/notebookFindWidget.js";import{REPL_EDITOR_ID as Wt}from"../../notebook/common/notebookCommon.js";import"./interactiveEditor.css";import"../../../../editor/common/config/editorOptions.js";import{deepClone as xt}from"../../../../base/common/objects.js";import{GlyphHoverController as P}from"../../../../editor/contrib/hover/browser/glyphHoverController.js";import{ContentHoverController as H}from"../../../../editor/contrib/hover/browser/contentHoverController.js";import{ReplEditorInput as R}from"./replEditorInput.js";import{ReplInputHintContentWidget as Tt}from"../../interactive/browser/replInputHintContentWidget.js";import{ServiceCollection as Mt}from"../../../../platform/instantiation/common/serviceCollection.js";const Ot="InteractiveEditorViewState",E=8,y=10,S=8;let C=class extends Q{_rootElement;_styleElement;_notebookEditorContainer;_notebookWidget={value:void 0};_inputCellContainer;_inputFocusIndicator;_inputRunButtonContainer;_inputEditorContainer;_codeEditorWidget;_notebookWidgetService;_instantiationService;_languageService;_contextKeyService;_configurationService;_notebookKernelService;_keybindingService;_menuService;_contextMenuService;_editorGroupService;_extensionService;_widgetDisposableStore=this._register(new G);_lastLayoutDimensions;_editorOptions;_notebookOptions;_editorMemento;_groupListener=this._register(new U);_runbuttonToolbar;_hintElement;_onDidFocusWidget=this._register(new D);get onDidFocus(){return this._onDidFocusWidget.event}_onDidChangeSelection=this._register(new D);onDidChangeSelection=this._onDidChangeSelection.event;_onDidChangeScroll=this._register(new D);onDidChangeScroll=this._onDidChangeScroll.event;constructor(t,e,i,o,n,r,c,h,s,l,b,f,g,I,v,K,A,B){super(Wt,t,e,i,o),this._notebookWidgetService=r,this._configurationService=f,this._notebookKernelService=s,this._languageService=l,this._keybindingService=b,this._menuService=g,this._contextMenuService=I,this._editorGroupService=v,this._extensionService=B,this._rootElement=a.$(".interactive-editor"),this._contextKeyService=this._register(c.createScoped(this._rootElement)),this._contextKeyService.createKey("isCompositeNotebook",!0),this._instantiationService=this._register(n.createChild(new Mt([x,this._contextKeyService]))),this._editorOptions=this._computeEditorOptions(),this._register(this._configurationService.onDidChangeConfiguration(u=>{(u.affectsConfiguration("editor")||u.affectsConfiguration("notebook"))&&(this._editorOptions=this._computeEditorOptions())})),this._notebookOptions=n.createInstance(ut,this.window,!0,{cellToolbarInteraction:"hover",globalToolbar:!0,stickyScrollEnabled:!1,dragAndDropEnabled:!1}),this._editorMemento=this.getEditorMemento(v,K,Ot),this._register(this._keybindingService.onDidUpdateKeybindings(this._updateInputHint,this)),this._register(A.onDidChangeExecution(u=>{if(u.type===It.cell&&yt(u.notebook,this._notebookWidget.value?.viewModel?.notebookDocument.uri)){const w=this._notebookWidget.value?.getCellByHandle(u.cellHandle);w&&u.changed?.state&&this._scrollIfNecessary(w)}}))}get inputCellContainerHeight(){return 21+E*2+S*2}get inputCellEditorHeight(){return 19+S*2}createEditor(t){a.append(t,this._rootElement),this._rootElement.style.position="relative",this._notebookEditorContainer=a.append(this._rootElement,a.$(".notebook-editor-container")),this._inputCellContainer=a.append(this._rootElement,a.$(".input-cell-container")),this._inputCellContainer.style.position="absolute",this._inputCellContainer.style.height=`${this.inputCellContainerHeight}px`,this._inputFocusIndicator=a.append(this._inputCellContainer,a.$(".input-focus-indicator")),this._inputRunButtonContainer=a.append(this._inputCellContainer,a.$(".run-button-container")),this._setupRunButtonToolbar(this._inputRunButtonContainer),this._inputEditorContainer=a.append(this._inputCellContainer,a.$(".input-editor-container")),this._createLayoutStyles()}_setupRunButtonToolbar(t){const e=this._register(this._menuService.createMenu(p.ReplInputExecute,this._contextKeyService));this._runbuttonToolbar=this._register(new pt(t,this._contextMenuService,{getKeyBinding:r=>this._keybindingService.lookupKeybinding(r.id),actionViewItemProvider:(r,c)=>_t(this._instantiationService,r,c),renderDropdownAsChildElement:!0}));const i=[],o=[];vt(e,{shouldForwardArgs:!0},{primary:i,secondary:o}),this._runbuttonToolbar.setActions([...i,...o])}_createLayoutStyles(){this._styleElement=a.createStyleSheet(this._rootElement);const t=[],{codeCellLeftMargin:e,cellRunGutter:i}=this._notebookOptions.getLayoutConfiguration(),{focusIndicator:o}=this._notebookOptions.getDisplayOptions(),n=this._notebookOptions.getCellEditorContainerLeftMargin();t.push(`
			.interactive-editor .input-cell-container {
				padding: ${E}px ${y}px ${E}px ${n}px;
			}
		`),o==="gutter"?t.push(`
				.interactive-editor .input-cell-container:focus-within .input-focus-indicator::before {
					border-color: var(--vscode-notebook-focusedCellBorder) !important;
				}
				.interactive-editor .input-focus-indicator::before {
					border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: block;
					top: ${E}px;
				}
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
			`):t.push(`
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: none;
				}
			`),t.push(`
			.interactive-editor .input-cell-container .run-button-container {
				width: ${i}px;
				left: ${e}px;
				margin-top: ${S-2}px;
			}
		`),this._styleElement.textContent=t.join(`
`)}_computeEditorOptions(){let t;this._codeEditorWidget&&(t=this._codeEditorWidget.getModel()?.getLanguageId());const e=xt(this._configurationService.getValue("editor",{overrideIdentifier:t})),i=X(this._configurationService);return Object.freeze({...e,...i,glyphMargin:!0,padding:{top:S,bottom:S},hover:{enabled:!0}})}saveState(){this._saveEditorViewState(this.input),super.saveState()}getViewState(){const t=this.input;if(t instanceof R)return this._saveEditorViewState(t),this._loadNotebookEditorViewState(t)}_saveEditorViewState(t){if(this._notebookWidget.value&&t instanceof R){if(this._notebookWidget.value.isDisposed)return;const e=this._notebookWidget.value.getEditorViewState(),i=this._codeEditorWidget.saveViewState();this._editorMemento.saveEditorState(this.group,t.resource,{notebook:e,input:i})}}_loadNotebookEditorViewState(t){const e=this._editorMemento.loadEditorState(this.group,t.resource);if(e)return e;for(const i of this._editorGroupService.getGroups(it.MOST_RECENTLY_ACTIVE))if(i.activeEditorPane!==this&&i.activeEditorPane===this&&i.activeEditor?.matches(t)){const o=this._notebookWidget.value?.getEditorViewState(),n=this._codeEditorWidget.saveViewState();return{notebook:o,input:n}}}async setInput(t,e,i,o){if(this._notebookWidget.value?.onWillHide(),this._codeEditorWidget?.dispose(),this._widgetDisposableStore.clear(),this._notebookWidget=this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget,this.group.id,t,{isEmbedded:!0,isReadOnly:!0,forRepl:!0,contributions:tt.getSomeEditorContributions([nt.id,rt.id,wt.id]),menuIds:{notebookToolbar:p.InteractiveToolbar,cellTitleToolbar:p.InteractiveCellTitle,cellDeleteToolbar:p.InteractiveCellDelete,cellInsertToolbar:p.NotebookCellBetween,cellTopInsertToolbar:p.NotebookCellListTop,cellExecuteToolbar:p.InteractiveCellExecute,cellExecutePrimary:void 0},cellEditorContributions:M.getSomeEditorContributions([O,L.ID,H.ID,P.ID,V.ID]),options:this._notebookOptions,codeWindow:this.window},void 0,this.window),this._codeEditorWidget=this._instantiationService.createInstance(Y,this._inputEditorContainer,this._editorOptions,{isSimpleWidget:!1,contributions:M.getSomeEditorContributions([Et.ID,O,L.ID,N.ID,mt.ID,St.ID,bt.ID,H.ID,P.ID,V.ID])}),this._lastLayoutDimensions){this._notebookEditorContainer.style.height=`${this._lastLayoutDimensions.dimension.height-this.inputCellContainerHeight}px`,this._notebookWidget.value.layout(new a.Dimension(this._lastLayoutDimensions.dimension.width,this._lastLayoutDimensions.dimension.height-this.inputCellContainerHeight),this._notebookEditorContainer);const s=this._notebookOptions.getCellEditorContainerLeftMargin(),l=Math.min(this._lastLayoutDimensions.dimension.height/2,this.inputCellEditorHeight);this._codeEditorWidget.layout(this._validateDimension(this._lastLayoutDimensions.dimension.width-s-y,l)),this._inputFocusIndicator.style.height=`${this.inputCellEditorHeight}px`,this._inputCellContainer.style.top=`${this._lastLayoutDimensions.dimension.height-this.inputCellContainerHeight}px`,this._inputCellContainer.style.width=`${this._lastLayoutDimensions.dimension.width}px`}await super.setInput(t,e,i,o);const n=await t.resolve();if(this._runbuttonToolbar&&(this._runbuttonToolbar.context=t.resource),n===null)throw new Error("The REPL model could not be resolved");this._notebookWidget.value?.setParentContextKeyService(this._contextKeyService);const r=e?.viewState??this._loadNotebookEditorViewState(t);await this._extensionService.whenInstalledExtensionsRegistered(),await this._notebookWidget.value.setModel(n.notebook,r?.notebook),n.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault()),this._notebookWidget.value.setOptions({isReadOnly:!0}),this._widgetDisposableStore.add(this._notebookWidget.value.onDidResizeOutput(s=>{this._scrollIfNecessary(s)})),this._widgetDisposableStore.add(this._notebookWidget.value.onDidFocusWidget(()=>this._onDidFocusWidget.fire())),this._widgetDisposableStore.add(this._notebookOptions.onDidChangeOptions(s=>{(s.compactView||s.focusIndicator)&&(this._styleElement?.remove(),this._createLayoutStyles()),this._lastLayoutDimensions&&this.isVisible()&&this.layout(this._lastLayoutDimensions.dimension,this._lastLayoutDimensions.position),s.interactiveWindowCollapseCodeCells&&n.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault())}));const c=await t.resolveInput(n.notebook);this._codeEditorWidget.setModel(c),r?.input&&this._codeEditorWidget.restoreViewState(r.input),this._editorOptions=this._computeEditorOptions(),this._codeEditorWidget.updateOptions(this._editorOptions),this._widgetDisposableStore.add(this._codeEditorWidget.onDidFocusEditorWidget(()=>this._onDidFocusWidget.fire())),this._widgetDisposableStore.add(this._codeEditorWidget.onDidContentSizeChange(s=>{s.contentHeightChanged&&this._lastLayoutDimensions&&this._layoutWidgets(this._lastLayoutDimensions.dimension,this._lastLayoutDimensions.position)})),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(s=>this._onDidChangeSelection.fire({reason:this._toEditorPaneSelectionChangeReason(s)}))),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(()=>this._onDidChangeSelection.fire({reason:m.EDIT}))),this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeNotebookAffinity(this._syncWithKernel,this)),this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeSelectedNotebooks(this._syncWithKernel,this)),this._widgetDisposableStore.add(this.themeService.onDidColorThemeChange(()=>{this.isVisible()&&this._updateInputHint()})),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(()=>{this.isVisible()&&this._updateInputHint()}));const h=ct.bindTo(this._contextKeyService);t.resource&&t.historyService.has(t.resource)?h.set("top"):h.set("none"),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(({position:s})=>{const l=this._codeEditorWidget._getViewModel(),b=l.getLineCount(),f=l.getLineLength(b)+1,g=l.coordinatesConverter.convertModelPositionToViewPosition(s),I=g.lineNumber===1&&g.column===1,v=g.lineNumber===b&&g.column===f;I?v?h.set("both"):h.set("top"):v?h.set("bottom"):h.set("none")})),this._widgetDisposableStore.add(c.onDidChangeContent(()=>{const s=c.getValue();if(this.input?.resource&&s!==""){const l=this.input.historyService;l.matchesCurrent(this.input.resource,s)||l.replaceLast(this.input.resource,s)}})),this._widgetDisposableStore.add(this._notebookWidget.value.onDidScroll(()=>this._onDidChangeScroll.fire())),this._updateInputHint(),this._syncWithKernel()}setOptions(t){this._notebookWidget.value?.setOptions(t),super.setOptions(t)}_toEditorPaneSelectionChangeReason(t){switch(t.source){case k.PROGRAMMATIC:return m.PROGRAMMATIC;case k.NAVIGATION:return m.NAVIGATION;case k.JUMP:return m.JUMP;default:return m.USER}}_cellAtBottom(t){const e=this._notebookWidget.value?.visibleRanges||[];return this._notebookWidget.value?.getCellIndex(t)===Math.max(...e.map(o=>o.end-1))}_scrollIfNecessary(t){this._notebookWidget.value.getCellIndex(t)===this._notebookWidget.value.getLength()-1&&(this._configurationService.getValue(T.interactiveWindowAlwaysScrollOnNewCell)||this._cellAtBottom(t))&&this._notebookWidget.value.scrollToBottom()}_syncWithKernel(){const t=this._notebookWidget.value?.textModel,e=this._codeEditorWidget.getModel();if(t&&e){const i=this._notebookKernelService.getMatchingKernel(t),o=i.selected??(i.suggestions.length===1?i.suggestions[0]:void 0)??(i.all.length===1?i.all[0]:void 0);if(o){const n=o.supportedLanguages[0];if(n&&n!=="plaintext"){const r=this._languageService.createById(n).languageId;e.setLanguage(r)}Dt.bindTo(this._contextKeyService).set(o.id)}}}layout(t,e){this._rootElement.classList.toggle("mid-width",t.width<1e3&&t.width>=600),this._rootElement.classList.toggle("narrow-width",t.width<600);const i=t.height!==this._lastLayoutDimensions?.dimension.height;this._lastLayoutDimensions={dimension:t,position:e},this._notebookWidget.value&&(i&&this._codeEditorWidget&&N.get(this._codeEditorWidget)?.cancelSuggestWidget(),this._notebookEditorContainer.style.height=`${this._lastLayoutDimensions.dimension.height-this.inputCellContainerHeight}px`,this._layoutWidgets(t,e))}_layoutWidgets(t,e){const i=this._codeEditorWidget.hasModel()?this._codeEditorWidget.getContentHeight():this.inputCellEditorHeight,o=Math.min(t.height/2,i),n=this._notebookOptions.getCellEditorContainerLeftMargin(),r=o+E*2;this._notebookEditorContainer.style.height=`${t.height-r}px`,this._notebookWidget.value.layout(t.with(t.width,t.height-r),this._notebookEditorContainer,e),this._codeEditorWidget.layout(this._validateDimension(t.width-n-y,o)),this._inputFocusIndicator.style.height=`${i}px`,this._inputCellContainer.style.top=`${t.height-r}px`,this._inputCellContainer.style.width=`${t.width}px`}_validateDimension(t,e){return new a.Dimension(Math.max(0,t),Math.max(0,e))}_updateInputHint(){if(!this._codeEditorWidget)return;const t=!this._codeEditorWidget.hasModel()||this._configurationService.getValue(T.showExecutionHint)===!1||this._codeEditorWidget.getModel().getValueLength()!==0;!this._hintElement&&!t?this._hintElement=this._instantiationService.createInstance(Tt,this._codeEditorWidget):this._hintElement&&t&&(this._hintElement.dispose(),this._hintElement=void 0)}getScrollPosition(){return{scrollTop:this._notebookWidget.value?.scrollTop??0,scrollLeft:0}}setScrollPosition(t){this._notebookWidget.value?.setScrollTop(t.scrollTop)}focus(){super.focus(),this._notebookWidget.value?.onShow(),this._codeEditorWidget.focus()}focusHistory(){this._notebookWidget.value.focus()}setEditorVisible(t){super.setEditorVisible(t),this._groupListener.value=this.group.onWillCloseEditor(e=>this._saveEditorViewState(e.editor)),t||(this._saveEditorViewState(this.input),this.input&&this._notebookWidget.value&&this._notebookWidget.value.onWillHide()),this._updateInputHint()}clearInput(){this._notebookWidget.value&&(this._saveEditorViewState(this.input),this._notebookWidget.value.onWillHide()),this._codeEditorWidget?.dispose(),this._notebookWidget={value:void 0},this._widgetDisposableStore.clear(),super.clearInput()}getControl(){return{notebookEditor:this._notebookWidget.value,codeEditor:this._codeEditorWidget}}};C=W([d(1,q),d(2,Z),d(3,J),d(4,j),d(5,et),d(6,x),d(7,z),d(8,st),d(9,dt),d(10,lt),d(11,ht),d(12,at),d(13,gt),d(14,ot),d(15,Ct),d(16,ft),d(17,kt)],C);export{C as ReplEditor};
