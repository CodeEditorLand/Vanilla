var q=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var x=(g,p,e,t)=>{for(var i=t>1?void 0:t?O(p,e):p,o=g.length-1,u;o>=0;o--)(u=g[o])&&(i=(t?u(p,e,i):u(i))||i);return t&&i&&q(p,e,i),i},d=(g,p)=>(e,t)=>p(e,t,g);import*as s from"../../../../base/browser/dom.js";import{StandardKeyboardEvent as C}from"../../../../base/browser/keyboardEvent.js";import{alert as F}from"../../../../base/browser/ui/aria/aria.js";import{Delayer as R}from"../../../../base/common/async.js";import{KeyCode as v,KeyMod as B}from"../../../../base/common/keyCodes.js";import{DisposableStore as k}from"../../../../base/common/lifecycle.js";import{assertIsDefined as V}from"../../../../base/common/types.js";import"./media/searchEditor.css";import{Position as E}from"../../../../editor/common/core/position.js";import{Range as I}from"../../../../editor/common/core/range.js";import{Selection as b}from"../../../../editor/common/core/selection.js";import{IModelService as _}from"../../../../editor/common/services/model.js";import{ITextResourceConfigurationService as H}from"../../../../editor/common/services/textResourceConfiguration.js";import{ReferencesController as N}from"../../../../editor/contrib/gotoSymbol/browser/peek/referencesController.js";import{localize as m}from"../../../../nls.js";import{ICommandService as A}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as Q}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as K}from"../../../../platform/contextkey/common/contextkey.js";import{IContextViewService as U}from"../../../../platform/contextview/browser/contextView.js";import{IInstantiationService as $}from"../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as G}from"../../../../platform/instantiation/common/serviceCollection.js";import{ILabelService as Y}from"../../../../platform/label/common/label.js";import{IEditorProgressService as z,LongRunningOperation as J}from"../../../../platform/progress/common/progress.js";import{IStorageService as X}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as j}from"../../../../platform/telemetry/common/telemetry.js";import{inputBorder as Z,registerColor as ee}from"../../../../platform/theme/common/colorRegistry.js";import{IThemeService as te}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as ie}from"../../../../base/common/themables.js";import{IWorkspaceContextService as re}from"../../../../platform/workspace/common/workspace.js";import{AbstractTextCodeEditor as se}from"../../../browser/parts/editor/textCodeEditor.js";import{EditorInputCapabilities as oe}from"../../../common/editor.js";import{ExcludePatternInputWidget as ne,IncludePatternInputWidget as ae}from"../../search/browser/patternInputWidget.js";import{SearchWidget as ue}from"../../search/browser/searchWidget.js";import{QueryBuilder as de}from"../../../services/search/common/queryBuilder.js";import{getOutOfWorkspaceEditorResources as ce}from"../../search/common/search.js";import{SearchModel as le}from"../../search/browser/searchModel.js";import{InSearchEditor as he,SearchEditorID as ge,SearchEditorInputTypeId as W}from"./constants.js";import{serializeSearchResultForEditor as pe}from"./searchEditorSerialization.js";import{IEditorGroupsService as fe}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as me}from"../../../services/editor/common/editorService.js";import{SearchSortOrder as Se}from"../../../services/search/common/search.js";import{searchDetailsIcon as Ee}from"../../search/browser/searchIcons.js";import{IFileService as Ie}from"../../../../platform/files/common/files.js";import{IOpenerService as ve}from"../../../../platform/opener/common/opener.js";import{INotificationService as ye}from"../../../../platform/notification/common/notification.js";import{renderSearchMessage as xe}from"../../search/browser/searchMessage.js";import{EditorExtensionsRegistry as Ce}from"../../../../editor/browser/editorExtensions.js";import{UnusualLineTerminatorsDetector as Re}from"../../../../editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.js";import{defaultToggleStyles as be,getInputBoxStyle as We}from"../../../../platform/theme/browser/defaultStyles.js";import{ILogService as Le}from"../../../../platform/log/common/log.js";import{SearchContext as Te}from"../../search/common/constants.js";import{getDefaultHoverDelegate as Pe}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{IHoverService as we}from"../../../../platform/hover/browser/hover.js";const L=/^(\s+)(\d+)(: |  )(\s*)(.*)$/,T=/^(\S.*):$/;let S=class extends se{constructor(e,t,i,o,u,h,c,a,f,r,n,l,y,P,w,D,Oe,M,Fe,Be){super(S.ID,e,t,a,o,P,i,D,w,M);this.modelService=u;this.contextService=h;this.labelService=c;this.contextViewService=f;this.commandService=r;this.openerService=n;this.notificationService=l;this.configurationService=Oe;this.logService=Fe;this.hoverService=Be;this.container=s.$(".search-editor"),this.searchOperation=this._register(new J(y)),this._register(this.messageDisposables=new k),this.searchHistoryDelayer=new R(2e3),this.searchModel=this._register(this.instantiationService.createInstance(le))}static ID=ge;static SEARCH_EDITOR_VIEW_STATE_PREFERENCE_KEY="searchEditorViewState";queryEditorWidget;get searchResultEditor(){return this.editorControl}queryEditorContainer;dimension;inputPatternIncludes;inputPatternExcludes;includesExcludesContainer;toggleQueryDetailsButton;messageBox;runSearchDelayer=new R(0);pauseSearching=!1;showingIncludesExcludes=!1;searchOperation;searchHistoryDelayer;messageDisposables;container;searchModel;ongoingOperations=0;updatingModelForSearch=!1;createEditor(e){s.append(e,this.container),this.queryEditorContainer=s.append(this.container,s.$(".query-container"));const t=s.append(this.container,s.$(".search-results"));super.createEditor(t),this.registerEditorListeners();const i=V(this.scopedContextKeyService);he.bindTo(i).set(!0),this.createQueryEditor(this.queryEditorContainer,this._register(this.instantiationService.createChild(new G([K,i]))),Te.InputBoxFocusedKey.bindTo(i))}createQueryEditor(e,t,i){const o=We({inputBorder:De});this.queryEditorWidget=this._register(t.createInstance(ue,e,{_hideReplaceToggle:!0,showContextToggle:!0,inputBoxStyles:o,toggleStyles:be})),this._register(this.queryEditorWidget.onReplaceToggled(()=>this.reLayout())),this._register(this.queryEditorWidget.onDidHeightChange(()=>this.reLayout())),this._register(this.queryEditorWidget.onSearchSubmit(({delay:r})=>this.triggerSearch({delay:r}))),this.queryEditorWidget.searchInput?this._register(this.queryEditorWidget.searchInput.onDidOptionChange(()=>this.triggerSearch({resetCursor:!1}))):this.logService.warn("SearchEditor: SearchWidget.searchInput is undefined, cannot register onDidOptionChange listener"),this._register(this.queryEditorWidget.onDidToggleContext(()=>this.triggerSearch({resetCursor:!1}))),this.includesExcludesContainer=s.append(e,s.$(".includes-excludes"));const u=m("moreSearch","Toggle Search Details");this.toggleQueryDetailsButton=s.append(this.includesExcludesContainer,s.$(".expand"+ie.asCSSSelector(Ee),{tabindex:0,role:"button","aria-label":u})),this._register(this.hoverService.setupManagedHover(Pe("element"),this.toggleQueryDetailsButton,u)),this._register(s.addDisposableListener(this.toggleQueryDetailsButton,s.EventType.CLICK,r=>{s.EventHelper.stop(r),this.toggleIncludesExcludes()})),this._register(s.addDisposableListener(this.toggleQueryDetailsButton,s.EventType.KEY_UP,r=>{const n=new C(r);(n.equals(v.Enter)||n.equals(v.Space))&&(s.EventHelper.stop(r),this.toggleIncludesExcludes())})),this._register(s.addDisposableListener(this.toggleQueryDetailsButton,s.EventType.KEY_DOWN,r=>{new C(r).equals(B.Shift|v.Tab)&&(this.queryEditorWidget.isReplaceActive()?this.queryEditorWidget.focusReplaceAllAction():this.queryEditorWidget.isReplaceShown()?this.queryEditorWidget.replaceInput?.focusOnPreserve():this.queryEditorWidget.focusRegexAction(),s.EventHelper.stop(r))}));const h=s.append(this.includesExcludesContainer,s.$(".file-types.includes")),c=m("searchScope.includes","files to include");s.append(h,s.$("h4",void 0,c)),this.inputPatternIncludes=this._register(t.createInstance(ae,h,this.contextViewService,{ariaLabel:m("label.includes","Search Include Patterns"),inputBoxStyles:o})),this.inputPatternIncludes.onSubmit(r=>this.triggerSearch({resetCursor:!1,delay:r?this.searchConfig.searchOnTypeDebouncePeriod:0})),this._register(this.inputPatternIncludes.onChangeSearchInEditorsBox(()=>this.triggerSearch()));const a=s.append(this.includesExcludesContainer,s.$(".file-types.excludes")),f=m("searchScope.excludes","files to exclude");s.append(a,s.$("h4",void 0,f)),this.inputPatternExcludes=this._register(t.createInstance(ne,a,this.contextViewService,{ariaLabel:m("label.excludes","Search Exclude Patterns"),inputBoxStyles:o})),this.inputPatternExcludes.onSubmit(r=>this.triggerSearch({resetCursor:!1,delay:r?this.searchConfig.searchOnTypeDebouncePeriod:0})),this._register(this.inputPatternExcludes.onChangeIgnoreBox(()=>this.triggerSearch())),this.messageBox=s.append(e,s.$(".messages.text-search-provider-messages")),[this.queryEditorWidget.searchInputFocusTracker,this.queryEditorWidget.replaceInputFocusTracker,this.inputPatternExcludes.inputFocusTracker,this.inputPatternIncludes.inputFocusTracker].forEach(r=>{r&&(this._register(r.onDidFocus(()=>setTimeout(()=>i.set(!0),0))),this._register(r.onDidBlur(()=>i.set(!1))))})}toggleRunAgainMessage(e){if(s.clearNode(this.messageBox),this.messageDisposables.clear(),e){const t=s.append(this.messageBox,s.$("a.pointer.prominent.message",{},m("runSearch","Run Search")));this.messageDisposables.add(s.addDisposableListener(t,s.EventType.CLICK,async()=>{await this.triggerSearch(),this.searchResultEditor.focus()}))}}_getContributions(){const e=[Re.ID];return Ce.getEditorContributions().filter(t=>e.indexOf(t.id)===-1)}getCodeEditorWidgetOptions(){return{contributions:this._getContributions()}}registerEditorListeners(){this.searchResultEditor.onMouseUp(e=>{if(e.event.detail===1){const t=this.searchConfig.searchEditor.singleClickBehaviour,i=e.target.position;if(i&&t==="peekDefinition"){const o=this.searchResultEditor.getModel()?.getLineContent(i.lineNumber)??"";(o.match(T)||o.match(L))&&(this.searchResultEditor.setSelection(I.fromPositions(i)),this.commandService.executeCommand("editor.action.peekDefinition"))}}else if(e.event.detail===2){const t=this.searchConfig.searchEditor.doubleClickBehaviour,i=e.target.position;if(i&&t!=="selectWord"){const o=this.searchResultEditor.getModel()?.getLineContent(i.lineNumber)??"";o.match(L)?(this.searchResultEditor.setSelection(I.fromPositions(i)),this.commandService.executeCommand(t==="goToLocation"?"editor.action.goToDeclaration":"editor.action.openDeclarationToTheSide")):o.match(T)&&(this.searchResultEditor.setSelection(I.fromPositions(i)),this.commandService.executeCommand("editor.action.peekDefinition"))}}}),this._register(this.searchResultEditor.onDidChangeModelContent(()=>{this.updatingModelForSearch||this.getInput()?.setDirty(!0)}))}getControl(){return this.searchResultEditor}focus(){super.focus();const e=this.loadEditorViewState(this.getInput());e&&e.focused==="editor"?this.searchResultEditor.focus():this.queryEditorWidget.focus()}focusSearchInput(){this.queryEditorWidget.searchInput?.focus()}focusFilesToIncludeInput(){this.showingIncludesExcludes||this.toggleIncludesExcludes(!0),this.inputPatternIncludes.focus()}focusFilesToExcludeInput(){this.showingIncludesExcludes||this.toggleIncludesExcludes(!0),this.inputPatternExcludes.focus()}focusNextInput(){this.queryEditorWidget.searchInputHasFocus()?this.showingIncludesExcludes?this.inputPatternIncludes.focus():this.searchResultEditor.focus():this.inputPatternIncludes.inputHasFocus()?this.inputPatternExcludes.focus():this.inputPatternExcludes.inputHasFocus()?this.searchResultEditor.focus():this.searchResultEditor.hasWidgetFocus()}focusPrevInput(){this.queryEditorWidget.searchInputHasFocus()?this.searchResultEditor.focus():this.inputPatternIncludes.inputHasFocus()?this.queryEditorWidget.searchInput?.focus():this.inputPatternExcludes.inputHasFocus()?this.inputPatternIncludes.focus():this.searchResultEditor.hasWidgetFocus()}setQuery(e){this.queryEditorWidget.searchInput?.setValue(e)}selectQuery(){this.queryEditorWidget.searchInput?.select()}toggleWholeWords(){this.queryEditorWidget.searchInput?.setWholeWords(!this.queryEditorWidget.searchInput.getWholeWords()),this.triggerSearch({resetCursor:!1})}toggleRegex(){this.queryEditorWidget.searchInput?.setRegex(!this.queryEditorWidget.searchInput.getRegex()),this.triggerSearch({resetCursor:!1})}toggleCaseSensitive(){this.queryEditorWidget.searchInput?.setCaseSensitive(!this.queryEditorWidget.searchInput.getCaseSensitive()),this.triggerSearch({resetCursor:!1})}toggleContextLines(){this.queryEditorWidget.toggleContextLines()}modifyContextLines(e){this.queryEditorWidget.modifyContextLines(e)}toggleQueryDetails(e){this.toggleIncludesExcludes(e)}deleteResultBlock(){const e=new Set,t=this.searchResultEditor.getSelections(),i=this.searchResultEditor.getModel();if(!(t&&i))return;const o=i.getLineCount(),u=1,h=r=>{for(let n=r;n>=u;n--){const l=i.getLineContent(n);if(e.add(n),l[0]!==void 0&&l[0]!==" ")break}},c=r=>{e.add(r);for(let n=r+1;n<=o;n++){const l=i.getLineContent(n);if(l[0]!==void 0&&l[0]!==" ")return n;e.add(n)}},a=[];for(const r of t){const n=r.startLineNumber;a.push(c(n)),h(n);for(let l=r.startLineNumber;l<=r.endLineNumber;l++)e.add(l)}a.length===0&&a.push(1);const f=r=>r!==void 0;i.pushEditOperations(this.searchResultEditor.getSelections(),[...e].map(r=>({range:new I(r,1,r+1,1),text:""})),()=>a.filter(f).map(r=>new b(r,1,r,1)))}cleanState(){this.getInput()?.setDirty(!1)}get searchConfig(){return this.configurationService.getValue("search")}iterateThroughMatches(e){const t=this.searchResultEditor.getModel();if(!t)return;const i=t.getLineCount()??1,o=t.getLineLength(i),u=e?new E(i,o):new E(1,1),h=this.searchResultEditor.getSelection()?.getStartPosition()??u,c=this.getInput()?.getMatchRanges();if(!c)return;const a=(e?qe:Me)(c,h);this.searchResultEditor.setSelection(a),this.searchResultEditor.revealLineInCenterIfOutsideViewport(a.startLineNumber),this.searchResultEditor.focus();const f=t.getLineContent(a.startLineNumber),r=t.getValueInRange(a);let n="";for(let l=a.startLineNumber;l>=1;l--)if(t.getValueInRange(new I(l,1,l,2))!==" "){n=t.getLineContent(l);break}F(m("searchResultItem","Matched {0} at {1} in file {2}",r,f,n.slice(0,n.length-1)))}focusNextResult(){this.iterateThroughMatches(!1)}focusPreviousResult(){this.iterateThroughMatches(!0)}focusAllResults(){this.searchResultEditor.setSelections((this.getInput()?.getMatchRanges()??[]).map(e=>new b(e.startLineNumber,e.startColumn,e.endLineNumber,e.endColumn))),this.searchResultEditor.focus()}async triggerSearch(e){const t=this.searchConfig.searchEditor.focusResultsOnSearch;e===void 0?e={focusResults:t}:e.focusResults===void 0&&(e.focusResults=t);const i={resetCursor:!0,delay:0,...e};this.queryEditorWidget.searchInput?.inputBox.isInputValid()&&(this.pauseSearching||await this.runSearchDelayer.trigger(async()=>{this.toggleRunAgainMessage(!1),await this.doRunSearch(),i.resetCursor&&(this.searchResultEditor.setPosition(new E(1,1)),this.searchResultEditor.setScrollPosition({scrollTop:0,scrollLeft:0})),i.focusResults&&this.searchResultEditor.focus()},i.delay))}readConfigFromWidget(){return{isCaseSensitive:this.queryEditorWidget.searchInput?.getCaseSensitive()??!1,contextLines:this.queryEditorWidget.getContextLines(),filesToExclude:this.inputPatternExcludes.getValue(),filesToInclude:this.inputPatternIncludes.getValue(),query:this.queryEditorWidget.searchInput?.getValue()??"",isRegexp:this.queryEditorWidget.searchInput?.getRegex()??!1,matchWholeWord:this.queryEditorWidget.searchInput?.getWholeWords()??!1,useExcludeSettingsAndIgnoreFiles:this.inputPatternExcludes.useExcludesAndIgnoreFiles(),onlyOpenEditors:this.inputPatternIncludes.onlySearchInOpenEditors(),showIncludesExcludes:this.showingIncludesExcludes,notebookSearchConfig:{includeMarkupInput:this.queryEditorWidget.getNotebookFilters().markupInput,includeMarkupPreview:this.queryEditorWidget.getNotebookFilters().markupPreview,includeCodeInput:this.queryEditorWidget.getNotebookFilters().codeInput,includeOutput:this.queryEditorWidget.getNotebookFilters().codeOutput}}}async doRunSearch(){this.searchModel.cancelSearch(!0);const e=this.getInput();if(!e)return;this.searchHistoryDelayer.trigger(()=>{this.queryEditorWidget.searchInput?.onSearchSubmit(),this.inputPatternExcludes.onSearchSubmit(),this.inputPatternIncludes.onSearchSubmit()});const t=this.readConfigFromWidget();if(!t.query)return;const i={pattern:t.query,isRegExp:t.isRegexp,isCaseSensitive:t.isCaseSensitive,isWordMatch:t.matchWholeWord},o={_reason:"searchEditor",extraFileResources:this.instantiationService.invokeFunction(ce),maxResults:this.searchConfig.maxResults??void 0,disregardIgnoreFiles:!t.useExcludeSettingsAndIgnoreFiles||void 0,disregardExcludeSettings:!t.useExcludeSettingsAndIgnoreFiles||void 0,excludePattern:[{pattern:t.filesToExclude}],includePattern:t.filesToInclude,onlyOpenEditors:t.onlyOpenEditors,previewOptions:{matchLines:1,charsPerLine:1e3},surroundingContext:t.contextLines,isSmartCase:this.searchConfig.smartCase,expandPatterns:!0,notebookSearchConfig:{includeMarkupInput:t.notebookSearchConfig.includeMarkupInput,includeMarkupPreview:t.notebookSearchConfig.includeMarkupPreview,includeCodeInput:t.notebookSearchConfig.includeCodeInput,includeOutput:t.notebookSearchConfig.includeOutput}},u=this.contextService.getWorkspace().folders;let h;try{h=this.instantiationService.createInstance(de).text(i,u.map(n=>n.uri),o)}catch{return}this.searchOperation.start(500),this.ongoingOperations++;const{configurationModel:c}=await e.resolveModels();c.updateConfig(t);const a=this.searchModel.search(h);e.ongoingSearchOperation=a.asyncResults.finally(()=>{this.ongoingOperations--,this.ongoingOperations===0&&this.searchOperation.stop()});const f=await e.ongoingSearchOperation;await this.onSearchComplete(f,t,e)}async onSearchComplete(e,t,i){const o=this.getInput();if(!o||o!==i||JSON.stringify(t)!==JSON.stringify(this.readConfigFromWidget()))return;o.ongoingSearchOperation=void 0;const u=this.searchConfig.sortOrder;u===Se.Modified&&await this.retrieveFileStats(this.searchModel.searchResult),N.get(this.searchResultEditor)?.closeWidget(!1);const c=r=>this.labelService.getUriLabel(r,{relative:!0}),a=pe(this.searchModel.searchResult,t.filesToInclude,t.filesToExclude,t.contextLines,c,u,e?.limitHit),{resultsModel:f}=await o.resolveModels();if(this.updatingModelForSearch=!0,this.modelService.updateModel(f,a.text),this.updatingModelForSearch=!1,e&&e.messages)for(const r of e.messages)this.addMessage(r);this.reLayout(),o.setDirty(!o.hasCapability(oe.Untitled)),o.setMatchRanges(a.matchRanges)}addMessage(e){let t;this.messageBox.firstChild?t=this.messageBox.firstChild:t=s.append(this.messageBox,s.$(".message")),s.append(t,xe(e,this.instantiationService,this.notificationService,this.openerService,this.commandService,this.messageDisposables,()=>this.triggerSearch()))}async retrieveFileStats(e){const t=e.matches().filter(i=>!i.fileStat).map(i=>i.resolveFileStat(this.fileService));await Promise.all(t)}layout(e){this.dimension=e,this.reLayout()}getSelected(){const e=this.searchResultEditor.getSelection();return e?this.searchResultEditor.getModel()?.getValueInRange(e)??"":""}reLayout(){this.dimension&&(this.queryEditorWidget.setWidth(this.dimension.width-28),this.searchResultEditor.layout({height:this.dimension.height-s.getTotalHeight(this.queryEditorContainer),width:this.dimension.width}),this.inputPatternExcludes.setWidth(this.dimension.width-28),this.inputPatternIncludes.setWidth(this.dimension.width-28))}getInput(){return this.input}priorConfig;setSearchConfig(e){this.priorConfig=e,e.query!==void 0&&this.queryEditorWidget.setValue(e.query),e.isCaseSensitive!==void 0&&this.queryEditorWidget.searchInput?.setCaseSensitive(e.isCaseSensitive),e.isRegexp!==void 0&&this.queryEditorWidget.searchInput?.setRegex(e.isRegexp),e.matchWholeWord!==void 0&&this.queryEditorWidget.searchInput?.setWholeWords(e.matchWholeWord),e.contextLines!==void 0&&this.queryEditorWidget.setContextLines(e.contextLines),e.filesToExclude!==void 0&&this.inputPatternExcludes.setValue(e.filesToExclude),e.filesToInclude!==void 0&&this.inputPatternIncludes.setValue(e.filesToInclude),e.onlyOpenEditors!==void 0&&this.inputPatternIncludes.setOnlySearchInOpenEditors(e.onlyOpenEditors),e.useExcludeSettingsAndIgnoreFiles!==void 0&&this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(e.useExcludeSettingsAndIgnoreFiles),e.showIncludesExcludes!==void 0&&this.toggleIncludesExcludes(e.showIncludesExcludes)}async setInput(e,t,i,o){if(await super.setInput(e,t,i,o),o.isCancellationRequested)return;const{configurationModel:u,resultsModel:h}=await e.resolveModels();if(!o.isCancellationRequested&&(this.searchResultEditor.setModel(h),this.pauseSearching=!0,this.toggleRunAgainMessage(!e.ongoingSearchOperation&&h.getLineCount()===1&&h.getValueLength()===0&&u.config.query!==""),this.setSearchConfig(u.config),this._register(u.onConfigDidUpdate(c=>{c!==this.priorConfig&&(this.pauseSearching=!0,this.setSearchConfig(c),this.pauseSearching=!1)})),this.restoreViewState(i),t?.preserveFocus||this.focus(),this.pauseSearching=!1,e.ongoingSearchOperation)){const c=this.readConfigFromWidget();e.ongoingSearchOperation.then(a=>{this.onSearchComplete(a,c,e)})}}toggleIncludesExcludes(e){const t="expanded";e??!this.includesExcludesContainer.classList.contains(t)?(this.toggleQueryDetailsButton.setAttribute("aria-expanded","true"),this.includesExcludesContainer.classList.add(t)):(this.toggleQueryDetailsButton.setAttribute("aria-expanded","false"),this.includesExcludesContainer.classList.remove(t)),this.showingIncludesExcludes=this.includesExcludesContainer.classList.contains(t),this.reLayout()}toEditorViewStateResource(e){if(e.typeId===W)return e.modelUri}computeEditorViewState(e){const i=this.getControl().saveViewState();if(i&&e.toString()===this.getInput()?.modelUri.toString())return{...i,focused:this.searchResultEditor.hasWidgetFocus()?"editor":"input"}}tracksEditorViewState(e){return e.typeId===W}restoreViewState(e){const t=this.loadEditorViewState(this.getInput(),e);t&&this.searchResultEditor.restoreViewState(t)}getAriaLabel(){return this.getInput()?.getName()??m("searchEditor","Search")}};S=x([d(1,j),d(2,te),d(3,X),d(4,_),d(5,re),d(6,Y),d(7,$),d(8,U),d(9,A),d(10,ve),d(11,ye),d(12,z),d(13,H),d(14,fe),d(15,me),d(16,Q),d(17,Ie),d(18,Le),d(19,we)],S);const De=ee("searchEditor.textInputBorder",Z,m("textInputBoxBorder","Search editor text input box border."));function Me(g,p){for(const e of g)if(E.isBefore(p,e.getStartPosition()))return e;return g[0]}function qe(g,p){for(let e=g.length-1;e>=0;e--){const t=g[e];if(E.isBefore(t.getStartPosition(),p))return t}return g[g.length-1]}export{S as SearchEditor};
