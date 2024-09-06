var $=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var M=(v,t,e,i)=>{for(var o=i>1?void 0:i?G(t,e):t,s=v.length-1,n;s>=0;s--)(n=v[s])&&(o=(i?n(t,e,o):n(o))||o);return i&&o&&$(t,e,o),o},d=(v,t)=>(e,i)=>t(e,i,v);import"./media/interactive.css";import*as a from"../../../../base/browser/dom.js";import{ToolBar as F}from"../../../../base/browser/ui/toolbar/toolbar.js";import"../../../../base/common/actions.js";import"../../../../base/common/cancellation.js";import{Emitter as y}from"../../../../base/common/event.js";import{DisposableStore as U,MutableDisposable as Y}from"../../../../base/common/lifecycle.js";import{isEqual as z}from"../../../../base/common/resources.js";import{EditorExtensionsRegistry as O}from"../../../../editor/browser/editorExtensions.js";import{ICodeEditorService as j}from"../../../../editor/browser/services/codeEditorService.js";import{CodeEditorWidget as J}from"../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";import"../../../../editor/common/cursorEvents.js";import"../../../../editor/common/editorCommon.js";import{ILanguageService as q}from"../../../../editor/common/languages/language.js";import{PLAINTEXT_LANGUAGE_ID as X}from"../../../../editor/common/languages/modesRegistry.js";import{ITextResourceConfigurationService as Z}from"../../../../editor/common/services/textResourceConfiguration.js";import{ContextMenuController as L}from"../../../../editor/contrib/contextmenu/browser/contextmenu.js";import{MarkerController as N}from"../../../../editor/contrib/gotoError/browser/gotoError.js";import{ParameterHintsController as Q}from"../../../../editor/contrib/parameterHints/browser/parameterHints.js";import{SnippetController2 as tt}from"../../../../editor/contrib/snippet/browser/snippetController2.js";import{SuggestController as V}from"../../../../editor/contrib/suggest/browser/suggestController.js";import{createActionViewItem as et,createAndFillInActionBarActions as it}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{IMenuService as ot,MenuId as g}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as nt}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as H}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as rt}from"../../../../platform/contextview/browser/contextView.js";import{TextEditorSelectionSource as w}from"../../../../platform/editor/common/editor.js";import{IInstantiationService as st}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as dt}from"../../../../platform/keybinding/common/keybinding.js";import{IStorageService as at}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as lt}from"../../../../platform/telemetry/common/telemetry.js";import{IThemeService as ct}from"../../../../platform/theme/common/themeService.js";import{EditorPane as ht}from"../../../browser/parts/editor/editorPane.js";import{EditorPaneSelectionChangeReason as m}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import{GroupsOrder as ut,IEditorGroupsService as pt}from"../../../services/editor/common/editorGroupsService.js";import{IExtensionService as gt}from"../../../services/extensions/common/extensions.js";import{MenuPreventer as _t}from"../../codeEditor/browser/menuPreventer.js";import{SelectionClipboardContributionID as P}from"../../codeEditor/browser/selectionClipboard.js";import{getSimpleEditorOptions as vt}from"../../codeEditor/browser/simpleEditorOptions.js";import{ExecutionStateCellStatusBarContrib as mt,TimerCellStatusBarContrib as Et}from"../../notebook/browser/contrib/cellStatusBar/executionStatusBarItemController.js";import{NotebookFindContrib as St}from"../../notebook/browser/contrib/find/notebookFindWidget.js";import"../../notebook/browser/notebookBrowser.js";import{NotebookEditorExtensionsRegistry as bt}from"../../notebook/browser/notebookEditorExtensions.js";import"../../notebook/browser/notebookEditorWidget.js";import{NotebookOptions as Ct}from"../../notebook/browser/notebookOptions.js";import{INotebookEditorService as It}from"../../notebook/browser/services/notebookEditorService.js";import{INTERACTIVE_WINDOW_EDITOR_ID as ft}from"../../notebook/common/notebookCommon.js";import{NOTEBOOK_KERNEL as Dt}from"../../notebook/common/notebookContextKeys.js";import{INotebookExecutionStateService as kt,NotebookExecutionType as yt}from"../../notebook/common/notebookExecutionStateService.js";import{INotebookKernelService as wt}from"../../notebook/common/notebookKernelService.js";import{TabCompletionController as Wt}from"../../snippets/browser/tabCompletion.js";import{INTERACTIVE_INPUT_CURSOR_BOUNDARY as xt,InteractiveWindowSetting as W}from"./interactiveCommon.js";import{InteractiveEditorInput as R}from"./interactiveEditorInput.js";import"./interactiveEditor.css";import{deepClone as Tt}from"../../../../base/common/objects.js";import"../../../../editor/common/config/editorOptions.js";import{ContentHoverController as A}from"../../../../editor/contrib/hover/browser/contentHoverController.js";import{GlyphHoverController as K}from"../../../../editor/contrib/hover/browser/glyphHoverController.js";import{ServiceCollection as Mt}from"../../../../platform/instantiation/common/serviceCollection.js";import{ReplInputHintContentWidget as Ot}from"./replInputHintContentWidget.js";const Lt="interactiveInputDecoration",Nt="InteractiveEditorViewState",E=8,x=10,S=8;let f=class extends ht{_rootElement;_styleElement;_notebookEditorContainer;_notebookWidget={value:void 0};_inputCellContainer;_inputFocusIndicator;_inputRunButtonContainer;_inputEditorContainer;_codeEditorWidget;_notebookWidgetService;_instantiationService;_languageService;_contextKeyService;_configurationService;_notebookKernelService;_keybindingService;_menuService;_contextMenuService;_editorGroupService;_notebookExecutionStateService;_extensionService;_widgetDisposableStore=this._register(new U);_lastLayoutDimensions;_editorOptions;_notebookOptions;_editorMemento;_groupListener=this._register(new Y);_runbuttonToolbar;_hintElement;_onDidFocusWidget=this._register(new y);get onDidFocus(){return this._onDidFocusWidget.event}_onDidChangeSelection=this._register(new y);onDidChangeSelection=this._onDidChangeSelection.event;_onDidChangeScroll=this._register(new y);onDidChangeScroll=this._onDidChangeScroll.event;constructor(t,e,i,o,s,n,h,b,_,c,r,l,C,D,u,k,I,B){super(ft,t,e,i,o),this._notebookWidgetService=n,this._configurationService=l,this._notebookKernelService=_,this._languageService=c,this._keybindingService=r,this._menuService=C,this._contextMenuService=D,this._editorGroupService=u,this._notebookExecutionStateService=I,this._extensionService=B,this._rootElement=a.$(".interactive-editor"),this._contextKeyService=this._register(h.createScoped(this._rootElement)),this._contextKeyService.createKey("isCompositeNotebook",!0),this._instantiationService=this._register(s.createChild(new Mt([H,this._contextKeyService]))),this._editorOptions=this._computeEditorOptions(),this._register(this._configurationService.onDidChangeConfiguration(p=>{(p.affectsConfiguration("editor")||p.affectsConfiguration("notebook"))&&(this._editorOptions=this._computeEditorOptions())})),this._notebookOptions=s.createInstance(Ct,this.window,!0,{cellToolbarInteraction:"hover",globalToolbar:!0,stickyScrollEnabled:!1,dragAndDropEnabled:!1}),this._editorMemento=this.getEditorMemento(u,k,Nt),b.registerDecorationType("interactive-decoration",Lt,{}),this._register(this._keybindingService.onDidUpdateKeybindings(this._updateInputHint,this)),this._register(this._notebookExecutionStateService.onDidChangeExecution(p=>{if(p.type===yt.cell&&z(p.notebook,this._notebookWidget.value?.viewModel?.notebookDocument.uri)){const T=this._notebookWidget.value?.getCellByHandle(p.cellHandle);T&&p.changed?.state&&this._scrollIfNecessary(T)}}))}get inputCellContainerHeight(){return 21+E*2+S*2}get inputCellEditorHeight(){return 19+S*2}createEditor(t){a.append(t,this._rootElement),this._rootElement.style.position="relative",this._notebookEditorContainer=a.append(this._rootElement,a.$(".notebook-editor-container")),this._inputCellContainer=a.append(this._rootElement,a.$(".input-cell-container")),this._inputCellContainer.style.position="absolute",this._inputCellContainer.style.height=`${this.inputCellContainerHeight}px`,this._inputFocusIndicator=a.append(this._inputCellContainer,a.$(".input-focus-indicator")),this._inputRunButtonContainer=a.append(this._inputCellContainer,a.$(".run-button-container")),this._setupRunButtonToolbar(this._inputRunButtonContainer),this._inputEditorContainer=a.append(this._inputCellContainer,a.$(".input-editor-container")),this._createLayoutStyles()}_setupRunButtonToolbar(t){const e=this._register(this._menuService.createMenu(g.InteractiveInputExecute,this._contextKeyService));this._runbuttonToolbar=this._register(new F(t,this._contextMenuService,{getKeyBinding:n=>this._keybindingService.lookupKeybinding(n.id),actionViewItemProvider:(n,h)=>et(this._instantiationService,n,h),renderDropdownAsChildElement:!0}));const i=[],o=[];it(e,{shouldForwardArgs:!0},{primary:i,secondary:o}),this._runbuttonToolbar.setActions([...i,...o])}_createLayoutStyles(){this._styleElement=a.createStyleSheet(this._rootElement);const t=[],{codeCellLeftMargin:e,cellRunGutter:i}=this._notebookOptions.getLayoutConfiguration(),{focusIndicator:o}=this._notebookOptions.getDisplayOptions(),s=this._notebookOptions.getCellEditorContainerLeftMargin();t.push(`
			.interactive-editor .input-cell-container {
				padding: ${E}px ${x}px ${E}px ${s}px;
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
`)}_computeEditorOptions(){let t;this._codeEditorWidget&&(t=this._codeEditorWidget.getModel()?.getLanguageId());const e=Tt(this._configurationService.getValue("editor",{overrideIdentifier:t})),i=vt(this._configurationService);return Object.freeze({...e,...i,glyphMargin:!0,padding:{top:S,bottom:S},hover:{enabled:!0}})}saveState(){this._saveEditorViewState(this.input),super.saveState()}getViewState(){const t=this.input;if(t instanceof R)return this._saveEditorViewState(t),this._loadNotebookEditorViewState(t)}_saveEditorViewState(t){if(this._notebookWidget.value&&t instanceof R){if(this._notebookWidget.value.isDisposed)return;const e=this._notebookWidget.value.getEditorViewState(),i=this._codeEditorWidget.saveViewState();this._editorMemento.saveEditorState(this.group,t.notebookEditorInput.resource,{notebook:e,input:i})}}_loadNotebookEditorViewState(t){const e=this._editorMemento.loadEditorState(this.group,t.notebookEditorInput.resource);if(e)return e;for(const i of this._editorGroupService.getGroups(ut.MOST_RECENTLY_ACTIVE))if(i.activeEditorPane!==this&&i.activeEditorPane===this&&i.activeEditor?.matches(t)){const o=this._notebookWidget.value?.getEditorViewState(),s=this._codeEditorWidget.saveViewState();return{notebook:o,input:s}}}async setInput(t,e,i,o){const s=t.notebookEditorInput;if(this._notebookWidget.value?.onWillHide(),this._codeEditorWidget?.dispose(),this._widgetDisposableStore.clear(),this._notebookWidget=this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget,this.group.id,s,{isEmbedded:!0,isReadOnly:!0,contributions:bt.getSomeEditorContributions([mt.id,Et.id,St.id]),menuIds:{notebookToolbar:g.InteractiveToolbar,cellTitleToolbar:g.InteractiveCellTitle,cellDeleteToolbar:g.InteractiveCellDelete,cellInsertToolbar:g.NotebookCellBetween,cellTopInsertToolbar:g.NotebookCellListTop,cellExecuteToolbar:g.InteractiveCellExecute,cellExecutePrimary:void 0},cellEditorContributions:O.getSomeEditorContributions([P,L.ID,A.ID,K.ID,N.ID]),options:this._notebookOptions,codeWindow:this.window},void 0,this.window),this._codeEditorWidget=this._instantiationService.createInstance(J,this._inputEditorContainer,this._editorOptions,{isSimpleWidget:!1,contributions:O.getSomeEditorContributions([_t.ID,P,L.ID,V.ID,Q.ID,tt.ID,Wt.ID,A.ID,K.ID,N.ID])}),this._lastLayoutDimensions){this._notebookEditorContainer.style.height=`${this._lastLayoutDimensions.dimension.height-this.inputCellContainerHeight}px`,this._notebookWidget.value.layout(new a.Dimension(this._lastLayoutDimensions.dimension.width,this._lastLayoutDimensions.dimension.height-this.inputCellContainerHeight),this._notebookEditorContainer);const r=this._notebookOptions.getCellEditorContainerLeftMargin(),l=Math.min(this._lastLayoutDimensions.dimension.height/2,this.inputCellEditorHeight);this._codeEditorWidget.layout(this._validateDimension(this._lastLayoutDimensions.dimension.width-r-x,l)),this._inputFocusIndicator.style.height=`${this.inputCellEditorHeight}px`,this._inputCellContainer.style.top=`${this._lastLayoutDimensions.dimension.height-this.inputCellContainerHeight}px`,this._inputCellContainer.style.width=`${this._lastLayoutDimensions.dimension.width}px`}await super.setInput(t,e,i,o);const n=await t.resolve();if(this._runbuttonToolbar&&(this._runbuttonToolbar.context=t.resource),n===null)throw new Error("The Interactive Window model could not be resolved");this._notebookWidget.value?.setParentContextKeyService(this._contextKeyService);const h=e?.viewState??this._loadNotebookEditorViewState(t);await this._extensionService.whenInstalledExtensionsRegistered(),await this._notebookWidget.value.setModel(n.notebook,h?.notebook),n.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault()),this._notebookWidget.value.setOptions({isReadOnly:!0}),this._widgetDisposableStore.add(this._notebookWidget.value.onDidResizeOutput(r=>{this._scrollIfNecessary(r)})),this._widgetDisposableStore.add(this._notebookWidget.value.onDidFocusWidget(()=>this._onDidFocusWidget.fire())),this._widgetDisposableStore.add(this._notebookOptions.onDidChangeOptions(r=>{(r.compactView||r.focusIndicator)&&(this._styleElement?.remove(),this._createLayoutStyles()),this._lastLayoutDimensions&&this.isVisible()&&this.layout(this._lastLayoutDimensions.dimension,this._lastLayoutDimensions.position),r.interactiveWindowCollapseCodeCells&&n.notebook.setCellCollapseDefault(this._notebookOptions.getCellCollapseDefault())}));const b=this._notebookWidget.value?.activeKernel?.supportedLanguages[0]??t.language??X,_=await t.resolveInput(b);_.setLanguage(b),this._codeEditorWidget.setModel(_),h?.input&&this._codeEditorWidget.restoreViewState(h.input),this._editorOptions=this._computeEditorOptions(),this._codeEditorWidget.updateOptions(this._editorOptions),this._widgetDisposableStore.add(this._codeEditorWidget.onDidFocusEditorWidget(()=>this._onDidFocusWidget.fire())),this._widgetDisposableStore.add(this._codeEditorWidget.onDidContentSizeChange(r=>{r.contentHeightChanged&&this._lastLayoutDimensions&&this._layoutWidgets(this._lastLayoutDimensions.dimension,this._lastLayoutDimensions.position)})),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(r=>this._onDidChangeSelection.fire({reason:this._toEditorPaneSelectionChangeReason(r)}))),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(()=>this._onDidChangeSelection.fire({reason:m.EDIT}))),this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeNotebookAffinity(this._syncWithKernel,this)),this._widgetDisposableStore.add(this._notebookKernelService.onDidChangeSelectedNotebooks(this._syncWithKernel,this)),this._widgetDisposableStore.add(this.themeService.onDidColorThemeChange(()=>{this.isVisible()&&this._updateInputHint()})),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModelContent(()=>{this.isVisible()&&this._updateInputHint()})),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeModel(()=>{this._updateInputHint()})),this._configurationService.onDidChangeConfiguration(r=>{r.affectsConfiguration(W.showExecutionHint)&&this._updateInputHint()});const c=xt.bindTo(this._contextKeyService);t.resource&&t.historyService.has(t.resource)?c.set("top"):c.set("none"),this._widgetDisposableStore.add(this._codeEditorWidget.onDidChangeCursorPosition(({position:r})=>{const l=this._codeEditorWidget._getViewModel(),C=l.getLineCount(),D=l.getLineLength(C)+1,u=l.coordinatesConverter.convertModelPositionToViewPosition(r),k=u.lineNumber===1&&u.column===1,I=u.lineNumber===C&&u.column===D;k?I?c.set("both"):c.set("top"):I?c.set("bottom"):c.set("none")})),this._widgetDisposableStore.add(_.onDidChangeContent(()=>{const r=_.getValue();if(this.input?.resource){const l=this.input.historyService;l.matchesCurrent(this.input.resource,r)||l.replaceLast(this.input.resource,r)}})),this._widgetDisposableStore.add(this._notebookWidget.value.onDidScroll(()=>this._onDidChangeScroll.fire())),this._syncWithKernel(),this._updateInputHint()}setOptions(t){this._notebookWidget.value?.setOptions(t),super.setOptions(t)}_toEditorPaneSelectionChangeReason(t){switch(t.source){case w.PROGRAMMATIC:return m.PROGRAMMATIC;case w.NAVIGATION:return m.NAVIGATION;case w.JUMP:return m.JUMP;default:return m.USER}}_cellAtBottom(t){const e=this._notebookWidget.value?.visibleRanges||[];return this._notebookWidget.value?.getCellIndex(t)===Math.max(...e.map(o=>o.end-1))}_scrollIfNecessary(t){this._notebookWidget.value.getCellIndex(t)===this._notebookWidget.value.getLength()-1&&(this._configurationService.getValue(W.interactiveWindowAlwaysScrollOnNewCell)||this._cellAtBottom(t))&&this._notebookWidget.value.scrollToBottom()}_syncWithKernel(){const t=this._notebookWidget.value?.textModel,e=this._codeEditorWidget.getModel();if(t&&e){const i=this._notebookKernelService.getMatchingKernel(t),o=i.selected??(i.suggestions.length===1?i.suggestions[0]:void 0)??(i.all.length===1?i.all[0]:void 0);if(o){const s=o.supportedLanguages[0];if(s&&s!=="plaintext"){const n=this._languageService.createById(s).languageId;e.setLanguage(n)}Dt.bindTo(this._contextKeyService).set(o.id)}}}layout(t,e){this._rootElement.classList.toggle("mid-width",t.width<1e3&&t.width>=600),this._rootElement.classList.toggle("narrow-width",t.width<600);const i=t.height!==this._lastLayoutDimensions?.dimension.height;this._lastLayoutDimensions={dimension:t,position:e},this._notebookWidget.value&&(i&&this._codeEditorWidget&&V.get(this._codeEditorWidget)?.cancelSuggestWidget(),this._notebookEditorContainer.style.height=`${this._lastLayoutDimensions.dimension.height-this.inputCellContainerHeight}px`,this._layoutWidgets(t,e))}_layoutWidgets(t,e){const i=this._codeEditorWidget.hasModel()?this._codeEditorWidget.getContentHeight():this.inputCellEditorHeight,o=Math.min(t.height/2,i),s=this._notebookOptions.getCellEditorContainerLeftMargin(),n=o+E*2;this._notebookEditorContainer.style.height=`${t.height-n}px`,this._notebookWidget.value.layout(t.with(t.width,t.height-n),this._notebookEditorContainer,e),this._codeEditorWidget.layout(this._validateDimension(t.width-s-x,o)),this._inputFocusIndicator.style.height=`${i}px`,this._inputCellContainer.style.top=`${t.height-n}px`,this._inputCellContainer.style.width=`${t.width}px`}_validateDimension(t,e){return new a.Dimension(Math.max(0,t),Math.max(0,e))}_updateInputHint(){if(!this._codeEditorWidget)return;const t=!this._codeEditorWidget.hasModel()||this._configurationService.getValue(W.showExecutionHint)===!1||this._codeEditorWidget.getModel().getValueLength()!==0;!this._hintElement&&!t?this._hintElement=this._instantiationService.createInstance(Ot,this._codeEditorWidget):this._hintElement&&t&&(this._hintElement.dispose(),this._hintElement=void 0)}getScrollPosition(){return{scrollTop:this._notebookWidget.value?.scrollTop??0,scrollLeft:0}}setScrollPosition(t){this._notebookWidget.value?.setScrollTop(t.scrollTop)}focus(){super.focus(),this._notebookWidget.value?.onShow(),this._codeEditorWidget.focus()}focusHistory(){this._notebookWidget.value.focus()}setEditorVisible(t){super.setEditorVisible(t),this._groupListener.value=this.group.onWillCloseEditor(e=>this._saveEditorViewState(e.editor)),t||(this._saveEditorViewState(this.input),this.input&&this._notebookWidget.value&&this._notebookWidget.value.onWillHide()),this._updateInputHint()}clearInput(){this._notebookWidget.value&&(this._saveEditorViewState(this.input),this._notebookWidget.value.onWillHide()),this._codeEditorWidget?.dispose(),this._notebookWidget={value:void 0},this._widgetDisposableStore.clear(),super.clearInput()}getControl(){return{notebookEditor:this._notebookWidget.value,codeEditor:this._codeEditorWidget}}};f=M([d(1,lt),d(2,ct),d(3,at),d(4,st),d(5,It),d(6,H),d(7,j),d(8,wt),d(9,q),d(10,dt),d(11,nt),d(12,ot),d(13,rt),d(14,pt),d(15,Z),d(16,kt),d(17,gt)],f);export{f as InteractiveEditor};
