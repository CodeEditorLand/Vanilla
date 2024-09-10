var G=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var E=(g,n,e,i)=>{for(var t=i>1?void 0:i?U(n,e):n,o=g.length-1,d;o>=0;o--)(d=g[o])&&(t=(i?d(n,e,t):d(t))||t);return i&&t&&G(n,e,t),t},c=(g,n)=>(e,i)=>n(e,i,g);import"./media/keybindingsEditor.css";import{localize as s}from"../../../../nls.js";import{Delayer as N}from"../../../../base/common/async.js";import*as r from"../../../../base/browser/dom.js";import{isIOS as q,OS as z}from"../../../../base/common/platform.js";import{Disposable as X,DisposableStore as k,toDisposable as J}from"../../../../base/common/lifecycle.js";import{ToggleActionViewItem as Z}from"../../../../base/browser/ui/toggle/toggle.js";import{HighlightedLabel as f}from"../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";import{KeybindingLabel as Q}from"../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";import{Action as w,Separator as A}from"../../../../base/common/actions.js";import{ActionBar as ee}from"../../../../base/browser/ui/actionbar/actionbar.js";import{EditorPane as ie}from"../../../browser/parts/editor/editorPane.js";import"../../../common/editor.js";import{ITelemetryService as ne}from"../../../../platform/telemetry/common/telemetry.js";import{IClipboardService as te}from"../../../../platform/clipboard/common/clipboardService.js";import{KEYBINDING_ENTRY_TEMPLATE_ID as L}from"../../../services/preferences/browser/keybindingsEditorModel.js";import{IInstantiationService as M}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as P}from"../../../../platform/keybinding/common/keybinding.js";import{DefineKeybindingWidget as oe,KeybindingsSearchWidget as re}from"./keybindingWidgets.js";import{CONTEXT_KEYBINDING_FOCUS as se,CONTEXT_KEYBINDINGS_EDITOR as de,CONTEXT_KEYBINDINGS_SEARCH_FOCUS as ae,KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS as ce,KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE as le,KEYBINDINGS_EDITOR_COMMAND_DEFINE as D,KEYBINDINGS_EDITOR_COMMAND_REMOVE as ge,KEYBINDINGS_EDITOR_COMMAND_RESET as be,KEYBINDINGS_EDITOR_COMMAND_COPY as he,KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND as ye,KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS as me,KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN as ue,KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR as pe,KEYBINDINGS_EDITOR_COMMAND_ADD as Ie,KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE as ve,CONTEXT_WHEN_FOCUS as Ee}from"../common/preferences.js";import{IContextMenuService as fe}from"../../../../platform/contextview/browser/contextView.js";import{IKeybindingEditingService as Ke}from"../../../services/keybinding/common/keybindingEditing.js";import"../../../../base/browser/ui/list/list.js";import{IThemeService as Ce,registerThemingParticipant as Le}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as T}from"../../../../base/common/themables.js";import{IContextKeyService as R,RawContextKey as Te}from"../../../../platform/contextkey/common/contextkey.js";import{KeyCode as F}from"../../../../base/common/keyCodes.js";import{badgeBackground as Se,contrastBorder as ke,badgeForeground as Ae,listActiveSelectionForeground as xe,listInactiveSelectionForeground as we,listHoverForeground as Me,listFocusForeground as De,editorBackground as _e,foreground as He,listActiveSelectionBackground as Oe,listInactiveSelectionBackground as We,listFocusBackground as Be,listHoverBackground as Ne,registerColor as Y,tableOddRowsBackgroundColor as V,asCssVariable as _}from"../../../../platform/theme/common/colorRegistry.js";import{IEditorService as Pe}from"../../../services/editor/common/editorService.js";import{EditorExtensionsRegistry as Re}from"../../../../editor/browser/editorExtensions.js";import{WorkbenchTable as Fe}from"../../../../platform/list/browser/listService.js";import{INotificationService as Ye}from"../../../../platform/notification/common/notification.js";import"../../../../base/common/cancellation.js";import{IStorageService as Ve,StorageScope as H,StorageTarget as O}from"../../../../platform/storage/common/storage.js";import{Emitter as K,Event as $e}from"../../../../base/common/event.js";import{MenuRegistry as je,MenuId as Ge,isIMenuItem as Ue}from"../../../../platform/actions/common/actions.js";import"../../../../base/browser/ui/list/listWidget.js";import{WORKBENCH_BACKGROUND as qe}from"../../../common/theme.js";import"../../../services/preferences/common/preferences.js";import{keybindingsRecordKeysIcon as ze,keybindingsSortIcon as Xe,keybindingsAddIcon as Je,preferencesClearInputIcon as Ze,keybindingsEditIcon as Qe}from"./preferencesIcons.js";import"../../../../base/browser/ui/table/table.js";import"../../../services/preferences/browser/keybindingsEditorInput.js";import"../../../../platform/editor/common/editor.js";import{ToolBar as ei}from"../../../../base/browser/ui/toolbar/toolbar.js";import{defaultKeybindingLabelStyles as ii,defaultToggleStyles as ni,getInputBoxStyle as ti}from"../../../../platform/theme/browser/defaultStyles.js";import{IExtensionsWorkbenchService as oi}from"../../extensions/common/extensions.js";import{StandardKeyboardEvent as ri}from"../../../../base/browser/keyboardEvent.js";import{isString as $}from"../../../../base/common/types.js";import{SuggestEnabledInput as si}from"../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js";import{CompletionItemKind as di}from"../../../../editor/common/languages.js";import{settingsTextInputBorder as ai}from"../common/settingsEditorColorRegistry.js";import{IConfigurationService as ci}from"../../../../platform/configuration/common/configuration.js";import{AccessibilityVerbositySettingId as li}from"../../accessibility/browser/accessibilityConfiguration.js";import{registerNavigableContainer as gi}from"../../../browser/actions/widgetNavigationCommands.js";import"../../../../base/browser/ui/actionbar/actionViewItems.js";import{getDefaultHoverDelegate as W}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import"../../../services/editor/common/editorGroupsService.js";import{IHoverService as B}from"../../../../platform/hover/browser/hover.js";import{IAccessibilityService as bi}from"../../../../platform/accessibility/common/accessibility.js";const l=r.$;let C=class extends ie{constructor(e,i,t,o,d,a,h,m,b,y,ui,j,pi,Ii){super(C.ID,e,i,t,j);this.keybindingsService=o;this.contextMenuService=d;this.keybindingEditingService=a;this.contextKeyService=h;this.notificationService=m;this.clipboardService=b;this.instantiationService=y;this.editorService=ui;this.configurationService=pi;this.accessibilityService=Ii;this.delayedFiltering=new N(300),this._register(o.onDidUpdateKeybindings(()=>this.render(!!this.keybindingFocusContextKey.get()))),this.keybindingsEditorContextKey=de.bindTo(this.contextKeyService),this.searchFocusContextKey=ae.bindTo(this.contextKeyService),this.keybindingFocusContextKey=se.bindTo(this.contextKeyService),this.searchHistoryDelayer=new N(500),this.recordKeysAction=new w(ce,s("recordKeysLabel","Record Keys"),T.asClassName(ze)),this.recordKeysAction.checked=!1,this.sortByPrecedenceAction=new w(le,s("sortByPrecedeneLabel","Sort by Precedence (Highest first)"),T.asClassName(Xe)),this.sortByPrecedenceAction.checked=!1,this.overflowWidgetsDomNode=l(".keybindings-overflow-widgets-container.monaco-editor")}static ID="workbench.editor.keybindings";_onDefineWhenExpression=this._register(new K);onDefineWhenExpression=this._onDefineWhenExpression.event;_onRejectWhenExpression=this._register(new K);onRejectWhenExpression=this._onRejectWhenExpression.event;_onAcceptWhenExpression=this._register(new K);onAcceptWhenExpression=this._onAcceptWhenExpression.event;_onLayout=this._register(new K);onLayout=this._onLayout.event;keybindingsEditorModel=null;headerContainer;actionsContainer;searchWidget;searchHistoryDelayer;overlayContainer;defineKeybindingWidget;unAssignedKeybindingItemToRevealAndFocus=null;tableEntries=[];keybindingsTableContainer;keybindingsTable;dimension=null;delayedFiltering;latestEmptyFilters=[];keybindingsEditorContextKey;keybindingFocusContextKey;searchFocusContextKey;sortByPrecedenceAction;recordKeysAction;ariaLabelElement;overflowWidgetsDomNode;create(e){super.create(e),this._register(gi({name:"keybindingsEditor",focusNotifiers:[this],focusNextWidget:()=>{this.searchWidget.hasFocus()&&this.focusKeybindings()},focusPreviousWidget:()=>{this.searchWidget.hasFocus()||this.focusSearch()}}))}createEditor(e){const i=r.append(e,l("div",{class:"keybindings-editor"}));this.createAriaLabelElement(i),this.createOverlayContainer(i),this.createHeader(i),this.createBody(i)}setInput(e,i,t,o){return this.keybindingsEditorContextKey.set(!0),super.setInput(e,i,t,o).then(()=>this.render(!!(i&&i.preserveFocus)))}clearInput(){super.clearInput(),this.keybindingsEditorContextKey.reset(),this.keybindingFocusContextKey.reset()}layout(e){this.dimension=e,this.layoutSearchWidget(e),this.overlayContainer.style.width=e.width+"px",this.overlayContainer.style.height=e.height+"px",this.defineKeybindingWidget.layout(this.dimension),this.layoutKeybindingsTable(),this._onLayout.fire()}focus(){super.focus();const e=this.activeKeybindingEntry;e?this.selectEntry(e):q||this.searchWidget.focus()}get activeKeybindingEntry(){const e=this.keybindingsTable.getFocusedElements()[0];return e&&e.templateId===L?e:null}async defineKeybinding(e,i){this.selectEntry(e),this.showOverlayContainer();try{const t=await this.defineKeybindingWidget.define();t&&await this.updateKeybinding(e,t,e.keybindingItem.when,i)}catch(t){this.onKeybindingEditingError(t)}finally{this.hideOverlayContainer(),this.selectEntry(e)}}defineWhenExpression(e){e.keybindingItem.keybinding&&(this.selectEntry(e),this._onDefineWhenExpression.fire(e))}rejectWhenExpression(e){this._onRejectWhenExpression.fire(e)}acceptWhenExpression(e){this._onAcceptWhenExpression.fire(e)}async updateKeybinding(e,i,t,o){((e.keybindingItem.keybinding?e.keybindingItem.keybinding.getUserSettingsLabel():"")!==i||e.keybindingItem.when!==t)&&(o?await this.keybindingEditingService.addKeybinding(e.keybindingItem.keybindingItem,i,t||void 0):await this.keybindingEditingService.editKeybinding(e.keybindingItem.keybindingItem,i,t||void 0),e.keybindingItem.keybinding||(this.unAssignedKeybindingItemToRevealAndFocus=e))}async removeKeybinding(e){if(this.selectEntry(e),e.keybindingItem.keybinding)try{await this.keybindingEditingService.removeKeybinding(e.keybindingItem.keybindingItem),this.focus()}catch(i){this.onKeybindingEditingError(i),this.selectEntry(e)}}async resetKeybinding(e){this.selectEntry(e);try{await this.keybindingEditingService.resetKeybinding(e.keybindingItem.keybindingItem),e.keybindingItem.keybinding||(this.unAssignedKeybindingItemToRevealAndFocus=e),this.selectEntry(e)}catch(i){this.onKeybindingEditingError(i),this.selectEntry(e)}}async copyKeybinding(e){this.selectEntry(e);const i={key:e.keybindingItem.keybinding&&e.keybindingItem.keybinding.getUserSettingsLabel()||"",command:e.keybindingItem.command};e.keybindingItem.when&&(i.when=e.keybindingItem.when),await this.clipboardService.writeText(JSON.stringify(i,null,"  "))}async copyKeybindingCommand(e){this.selectEntry(e),await this.clipboardService.writeText(e.keybindingItem.command)}async copyKeybindingCommandTitle(e){this.selectEntry(e),await this.clipboardService.writeText(e.keybindingItem.commandLabel)}focusSearch(){this.searchWidget.focus()}search(e){this.focusSearch(),this.searchWidget.setValue(e),this.selectEntry(0)}clearSearchResults(){this.searchWidget.clear()}showSimilarKeybindings(e){const i=`"${e.keybindingItem.keybinding.getAriaLabel()}"`;i!==this.searchWidget.getValue()&&this.searchWidget.setValue(i)}createAriaLabelElement(e){this.ariaLabelElement=r.append(e,r.$("")),this.ariaLabelElement.setAttribute("id","keybindings-editor-aria-label-element"),this.ariaLabelElement.setAttribute("aria-live","assertive")}createOverlayContainer(e){this.overlayContainer=r.append(e,l(".overlay-container")),this.overlayContainer.style.position="absolute",this.overlayContainer.style.zIndex="40",this.defineKeybindingWidget=this._register(this.instantiationService.createInstance(oe,this.overlayContainer)),this._register(this.defineKeybindingWidget.onDidChange(i=>this.defineKeybindingWidget.printExisting(this.keybindingsEditorModel.fetch(`"${i}"`).length))),this._register(this.defineKeybindingWidget.onShowExistingKeybidings(i=>this.searchWidget.setValue(`"${i}"`))),this.hideOverlayContainer()}showOverlayContainer(){this.overlayContainer.style.display="block"}hideOverlayContainer(){this.overlayContainer.style.display="none"}createHeader(e){this.headerContainer=r.append(e,l(".keybindings-header"));const i=s("SearchKeybindings.FullTextSearchPlaceholder","Type to search in keybindings"),t=s("SearchKeybindings.KeybindingsSearchPlaceholder","Recording Keys. Press Escape to exit"),o=new w(me,s("clearInput","Clear Keybindings Search Input"),T.asClassName(Ze),!1,async()=>this.clearSearchResults()),d=r.append(this.headerContainer,l(".search-container"));this.searchWidget=this._register(this.instantiationService.createInstance(re,d,{ariaLabel:i,placeholder:i,focusKey:this.searchFocusContextKey,ariaLabelledBy:"keybindings-editor-aria-label-element",recordEnter:!0,quoteRecordedKeys:!0,history:this.getMemento(H.PROFILE,O.USER).searchHistory||[],inputBoxStyles:ti({inputBorder:ai})})),this._register(this.searchWidget.onDidChange(b=>{o.enabled=!!b,this.delayedFiltering.trigger(()=>this.filterKeybindings()),this.updateSearchOptions()})),this._register(this.searchWidget.onEscape(()=>this.recordKeysAction.checked=!1)),this.actionsContainer=r.append(d,r.$(".keybindings-search-actions-container"));const a=this.createRecordingBadge(this.actionsContainer);this._register(this.sortByPrecedenceAction.onDidChange(b=>{b.checked!==void 0&&this.renderKeybindingsEntries(!1),this.updateSearchOptions()})),this._register(this.recordKeysAction.onDidChange(b=>{b.checked!==void 0&&(a.classList.toggle("disabled",!b.checked),b.checked?(this.searchWidget.inputBox.setPlaceHolder(t),this.searchWidget.inputBox.setAriaLabel(t),this.searchWidget.startRecordingKeys(),this.searchWidget.focus()):(this.searchWidget.inputBox.setPlaceHolder(i),this.searchWidget.inputBox.setAriaLabel(i),this.searchWidget.stopRecordingKeys(),this.searchWidget.focus()),this.updateSearchOptions())}));const h=[this.recordKeysAction,this.sortByPrecedenceAction,o],m=this._register(new ei(this.actionsContainer,this.contextMenuService,{actionViewItemProvider:(b,y)=>{if(b.id===this.sortByPrecedenceAction.id||b.id===this.recordKeysAction.id)return new Z(null,b,{...y,keybinding:this.keybindingsService.lookupKeybinding(b.id)?.getLabel(),toggleStyles:ni})},getKeyBinding:b=>this.keybindingsService.lookupKeybinding(b.id)}));m.setActions(h),this._register(this.keybindingsService.onDidUpdateKeybindings(()=>m.setActions(h)))}updateSearchOptions(){const e=this.input;e&&(e.searchOptions={searchValue:this.searchWidget.getValue(),recordKeybindings:!!this.recordKeysAction.checked,sortByPrecedence:!!this.sortByPrecedenceAction.checked})}createRecordingBadge(e){const i=r.append(e,r.$(".recording-badge.monaco-count-badge.long.disabled"));return i.textContent=s("recording","Recording Keys"),i.style.backgroundColor=_(Se),i.style.color=_(Ae),i.style.border=`1px solid ${_(ke)}`,i}layoutSearchWidget(e){this.searchWidget.layout(e),this.headerContainer.classList.toggle("small",e.width<400),this.searchWidget.inputBox.inputElement.style.paddingRight=`${r.getTotalWidth(this.actionsContainer)+12}px`}createBody(e){const i=r.append(e,l(".keybindings-body"));this.createTable(i)}createTable(e){this.keybindingsTableContainer=r.append(e,l(".keybindings-table-container")),this.keybindingsTable=this._register(this.instantiationService.createInstance(Fe,"KeybindingsEditor",this.keybindingsTableContainer,new hi,[{label:"",tooltip:"",weight:0,minimumWidth:40,maximumWidth:40,templateId:u.TEMPLATE_ID,project(i){return i}},{label:s("command","Command"),tooltip:"",weight:.3,templateId:p.TEMPLATE_ID,project(i){return i}},{label:s("keybinding","Keybinding"),tooltip:"",weight:.2,templateId:x.TEMPLATE_ID,project(i){return i}},{label:s("when","When"),tooltip:"",weight:.35,templateId:v.TEMPLATE_ID,project(i){return i}},{label:s("source","Source"),tooltip:"",weight:.15,templateId:I.TEMPLATE_ID,project(i){return i}}],[this.instantiationService.createInstance(u,this),this.instantiationService.createInstance(p),this.instantiationService.createInstance(x),this.instantiationService.createInstance(v,this),this.instantiationService.createInstance(I)],{identityProvider:{getId:i=>i.id},horizontalScrolling:!1,accessibilityProvider:new mi(this.configurationService),keyboardNavigationLabelProvider:{getKeyboardNavigationLabel:i=>i.keybindingItem.commandLabel||i.keybindingItem.command},overrideStyles:{listBackground:_e},multipleSelectionSupport:!1,setRowLineHeight:!1,openOnSingleClick:!1,transformOptimization:!1})),this._register(this.keybindingsTable.onContextMenu(i=>this.onContextMenu(i))),this._register(this.keybindingsTable.onDidChangeFocus(i=>this.onFocusChange())),this._register(this.keybindingsTable.onDidFocus(()=>{this.keybindingsTable.getHTMLElement().classList.add("focused"),this.onFocusChange()})),this._register(this.keybindingsTable.onDidBlur(()=>{this.keybindingsTable.getHTMLElement().classList.remove("focused"),this.keybindingFocusContextKey.reset()})),this._register(this.keybindingsTable.onDidOpen(i=>{if(i.browserEvent?.defaultPrevented)return;const t=this.activeKeybindingEntry;t&&this.defineKeybinding(t,!1)})),r.append(this.keybindingsTableContainer,this.overflowWidgetsDomNode)}async render(e){if(this.input){const i=this.input;this.keybindingsEditorModel=await i.resolve(),await this.keybindingsEditorModel.resolve(this.getActionsLabels()),this.renderKeybindingsEntries(!1,e),i.searchOptions?(this.recordKeysAction.checked=i.searchOptions.recordKeybindings,this.sortByPrecedenceAction.checked=i.searchOptions.sortByPrecedence,this.searchWidget.setValue(i.searchOptions.searchValue)):this.updateSearchOptions()}}getActionsLabels(){const e=new Map;for(const i of Re.getEditorActions())e.set(i.id,i.label);for(const i of je.getMenuItems(Ge.CommandPalette))if(Ue(i)){const t=typeof i.command.title=="string"?i.command.title:i.command.title.value,o=i.command.category?typeof i.command.category=="string"?i.command.category:i.command.category.value:void 0;e.set(i.command.id,o?`${o}: ${t}`:t)}return e}filterKeybindings(){this.renderKeybindingsEntries(this.searchWidget.hasFocus()),this.searchHistoryDelayer.trigger(()=>{this.searchWidget.inputBox.addToHistory(),this.getMemento(H.PROFILE,O.USER).searchHistory=this.searchWidget.inputBox.getHistory(),this.saveState()})}clearKeyboardShortcutSearchHistory(){this.searchWidget.inputBox.clearHistory(),this.getMemento(H.PROFILE,O.USER).searchHistory=this.searchWidget.inputBox.getHistory(),this.saveState()}renderKeybindingsEntries(e,i){if(this.keybindingsEditorModel){const t=this.searchWidget.getValue(),o=this.keybindingsEditorModel.fetch(t,this.sortByPrecedenceAction.checked);this.accessibilityService.alert(s("foundResults","{0} results",o.length)),this.ariaLabelElement.setAttribute("aria-label",this.getAriaLabel(o)),o.length===0&&this.latestEmptyFilters.push(t);const d=this.keybindingsTable.getSelection()[0];if(this.tableEntries=o,this.keybindingsTable.splice(0,this.keybindingsTable.length,this.tableEntries),this.layoutKeybindingsTable(),e)this.keybindingsTable.setSelection([]),this.keybindingsTable.setFocus([]);else if(this.unAssignedKeybindingItemToRevealAndFocus){const a=this.getNewIndexOfUnassignedKeybinding(this.unAssignedKeybindingItemToRevealAndFocus);a!==-1&&(this.keybindingsTable.reveal(a,.2),this.selectEntry(a)),this.unAssignedKeybindingItemToRevealAndFocus=null}else d!==-1&&d<this.tableEntries.length?this.selectEntry(d,i):this.editorService.activeEditorPane===this&&!i&&this.focus()}}getAriaLabel(e){return this.sortByPrecedenceAction.checked?s("show sorted keybindings","Showing {0} Keybindings in precedence order",e.length):s("show keybindings","Showing {0} Keybindings in alphabetical order",e.length)}layoutKeybindingsTable(){if(!this.dimension)return;const e=this.dimension.height-(r.getDomNodePagePosition(this.headerContainer).height+12);this.keybindingsTableContainer.style.height=`${e}px`,this.keybindingsTable.layout(e)}getIndexOf(e){const i=this.tableEntries.indexOf(e);if(i===-1){for(let t=0;t<this.tableEntries.length;t++)if(this.tableEntries[t].id===e.id)return t}return i}getNewIndexOfUnassignedKeybinding(e){for(let i=0;i<this.tableEntries.length;i++){const t=this.tableEntries[i];if(t.templateId===L&&t.keybindingItem.command===e.keybindingItem.command)return i}return-1}selectEntry(e,i=!0){const t=typeof e=="number"?e:this.getIndexOf(e);t!==-1&&t<this.keybindingsTable.length&&(i&&(this.keybindingsTable.domFocus(),this.keybindingsTable.setFocus([t])),this.keybindingsTable.setSelection([t]))}focusKeybindings(){this.keybindingsTable.domFocus();const e=this.keybindingsTable.getFocus();this.keybindingsTable.setFocus([e.length?e[0]:0])}selectKeybinding(e){this.selectEntry(e)}recordSearchKeys(){this.recordKeysAction.checked=!0}toggleSortByPrecedence(){this.sortByPrecedenceAction.checked=!this.sortByPrecedenceAction.checked}onContextMenu(e){if(e.element&&e.element.templateId===L){const i=e.element;this.selectEntry(i),this.contextMenuService.showContextMenu({getAnchor:()=>e.anchor,getActions:()=>[this.createCopyAction(i),this.createCopyCommandAction(i),this.createCopyCommandTitleAction(i),new A,...i.keybindingItem.keybinding?[this.createDefineKeybindingAction(i),this.createAddKeybindingAction(i)]:[this.createDefineKeybindingAction(i)],new A,this.createRemoveAction(i),this.createResetAction(i),new A,this.createDefineWhenExpressionAction(i),new A,this.createShowConflictsAction(i)]})}}onFocusChange(){this.keybindingFocusContextKey.reset();const e=this.keybindingsTable.getFocusedElements()[0];e&&e.templateId===L&&this.keybindingFocusContextKey.set(!0)}createDefineKeybindingAction(e){return{label:e.keybindingItem.keybinding?s("changeLabel","Change Keybinding..."):s("addLabel","Add Keybinding..."),enabled:!0,id:D,run:()=>this.defineKeybinding(e,!1)}}createAddKeybindingAction(e){return{label:s("addLabel","Add Keybinding..."),enabled:!0,id:Ie,run:()=>this.defineKeybinding(e,!0)}}createDefineWhenExpressionAction(e){return{label:s("editWhen","Change When Expression"),enabled:!!e.keybindingItem.keybinding,id:ue,run:()=>this.defineWhenExpression(e)}}createRemoveAction(e){return{label:s("removeLabel","Remove Keybinding"),enabled:!!e.keybindingItem.keybinding,id:ge,run:()=>this.removeKeybinding(e)}}createResetAction(e){return{label:s("resetLabel","Reset Keybinding"),enabled:!e.keybindingItem.keybindingItem.isDefault,id:be,run:()=>this.resetKeybinding(e)}}createShowConflictsAction(e){return{label:s("showSameKeybindings","Show Same Keybindings"),enabled:!!e.keybindingItem.keybinding,id:pe,run:()=>this.showSimilarKeybindings(e)}}createCopyAction(e){return{label:s("copyLabel","Copy"),enabled:!0,id:he,run:()=>this.copyKeybinding(e)}}createCopyCommandAction(e){return{label:s("copyCommandLabel","Copy Command ID"),enabled:!0,id:ye,run:()=>this.copyKeybindingCommand(e)}}createCopyCommandTitleAction(e){return{label:s("copyCommandTitleLabel","Copy Command Title"),enabled:!!e.keybindingItem.commandLabel,id:ve,run:()=>this.copyKeybindingCommandTitle(e)}}onKeybindingEditingError(e){this.notificationService.error(typeof e=="string"?e:s("error","Error '{0}' while editing the keybinding. Please open 'keybindings.json' file and check for errors.",`${e}`))}};C=E([c(1,ne),c(2,Ce),c(3,P),c(4,fe),c(5,Ke),c(6,R),c(7,Ye),c(8,te),c(9,M),c(10,Pe),c(11,Ve),c(12,ci),c(13,bi)],C);class hi{headerRowHeight=30;getHeight(n){if(n.templateId===L){const e=n.keybindingItem.commandLabel&&n.commandIdMatches,i=!!n.commandDefaultLabelMatches,t=!!n.extensionIdMatches;if(e&&i)return 60;if(t||e||i)return 40}return 24}}let u=class{constructor(n,e){this.keybindingsEditor=n;this.keybindingsService=e}static TEMPLATE_ID="actions";templateId=u.TEMPLATE_ID;renderTemplate(n){const e=r.append(n,l(".actions"));return{actionBar:new ee(e)}}renderElement(n,e,i,t){i.actionBar.clear();const o=[];n.keybindingItem.keybinding?o.push(this.createEditAction(n)):o.push(this.createAddAction(n)),i.actionBar.push(o,{icon:!0})}createEditAction(n){const e=this.keybindingsService.lookupKeybinding(D);return{class:T.asClassName(Qe),enabled:!0,id:"editKeybinding",tooltip:e?s("editKeybindingLabelWithKey","Change Keybinding {0}",`(${e.getLabel()})`):s("editKeybindingLabel","Change Keybinding"),run:()=>this.keybindingsEditor.defineKeybinding(n,!1)}}createAddAction(n){const e=this.keybindingsService.lookupKeybinding(D);return{class:T.asClassName(Je),enabled:!0,id:"addKeybinding",tooltip:e?s("addKeybindingLabelWithKey","Add Keybinding {0}",`(${e.getLabel()})`):s("addKeybindingLabel","Add Keybinding"),run:()=>this.keybindingsEditor.defineKeybinding(n,!1)}}disposeTemplate(n){n.actionBar.dispose()}};u=E([c(1,P)],u);let p=class{constructor(n){this._hoverService=n}static TEMPLATE_ID="commands";templateId=p.TEMPLATE_ID;renderTemplate(n){const e=r.append(n,l(".command")),i=this._hoverService.setupManagedHover(W("mouse"),e,""),t=r.append(e,l(".command-label")),o=new f(t),d=r.append(e,l(".command-default-label")),a=new f(d),h=r.append(e,l(".command-id.code")),m=new f(h);return{commandColumn:e,commandColumnHover:i,commandLabelContainer:t,commandLabel:o,commandDefaultLabelContainer:d,commandDefaultLabel:a,commandIdLabelContainer:h,commandIdLabel:m}}renderElement(n,e,i,t){const o=n.keybindingItem,d=!!(o.commandLabel&&n.commandIdMatches),a=!!n.commandDefaultLabelMatches;i.commandColumn.classList.toggle("vertical-align-column",d||a);const h=o.commandLabel?s("title","{0} ({1})",o.commandLabel,o.command):o.command;i.commandColumn.setAttribute("aria-label",h),i.commandColumnHover.update(h),o.commandLabel?(i.commandLabelContainer.classList.remove("hide"),i.commandLabel.set(o.commandLabel,n.commandLabelMatches)):(i.commandLabelContainer.classList.add("hide"),i.commandLabel.set(void 0)),n.commandDefaultLabelMatches?(i.commandDefaultLabelContainer.classList.remove("hide"),i.commandDefaultLabel.set(o.commandDefaultLabel,n.commandDefaultLabelMatches)):(i.commandDefaultLabelContainer.classList.add("hide"),i.commandDefaultLabel.set(void 0)),n.commandIdMatches||!o.commandLabel?(i.commandIdLabelContainer.classList.remove("hide"),i.commandIdLabel.set(o.command,n.commandIdMatches)):(i.commandIdLabelContainer.classList.add("hide"),i.commandIdLabel.set(void 0))}disposeTemplate(n){n.commandColumnHover.dispose(),n.commandDefaultLabel.dispose(),n.commandIdLabel.dispose(),n.commandLabel.dispose()}};p=E([c(0,B)],p);class x{static TEMPLATE_ID="keybindings";templateId=x.TEMPLATE_ID;constructor(){}renderTemplate(n){const e=r.append(n,l(".keybinding"));return{keybindingLabel:new Q(r.append(e,l("div.keybinding-label")),z,ii)}}renderElement(n,e,i,t){n.keybindingItem.keybinding?i.keybindingLabel.set(n.keybindingItem.keybinding,n.keybindingMatches):i.keybindingLabel.set(void 0,void 0)}disposeTemplate(n){n.keybindingLabel.dispose()}}function yi(g,n){const e=new k;return e.add(r.addDisposableListener(g,r.EventType.CLICK,r.finalHandler(n))),e.add(r.addDisposableListener(g,r.EventType.KEY_UP,i=>{const t=new ri(i);(t.equals(F.Space)||t.equals(F.Enter))&&(i.preventDefault(),i.stopPropagation(),n())})),e}let I=class{constructor(n,e){this.extensionsWorkbenchService=n;this.hoverService=e}static TEMPLATE_ID="source";templateId=I.TEMPLATE_ID;renderTemplate(n){const e=r.append(n,l(".source")),i=this.hoverService.setupManagedHover(W("mouse"),e,""),t=new f(r.append(e,l(".source-label"))),o=r.append(e,l(".extension-container")),d=r.append(o,l("a.extension-label",{tabindex:0})),a=new f(r.append(o,l(".extension-id-container.code")));return{sourceColumn:e,sourceColumnHover:i,sourceLabel:t,extensionLabel:d,extensionContainer:o,extensionId:a,disposables:new k}}renderElement(n,e,i,t){if(i.disposables.clear(),$(n.keybindingItem.source))i.extensionContainer.classList.add("hide"),i.sourceLabel.element.classList.remove("hide"),i.sourceColumnHover.update(""),i.sourceLabel.set(n.keybindingItem.source||"-",n.sourceMatches);else{i.extensionContainer.classList.remove("hide"),i.sourceLabel.element.classList.add("hide");const o=n.keybindingItem.source,d=o.displayName??o.identifier.value;i.sourceColumnHover.update(s("extension label","Extension ({0})",d)),i.extensionLabel.textContent=d,i.disposables.add(yi(i.extensionLabel,()=>{this.extensionsWorkbenchService.open(o.identifier.value)})),n.extensionIdMatches?(i.extensionId.element.classList.remove("hide"),i.extensionId.set(o.identifier.value,n.extensionIdMatches)):(i.extensionId.element.classList.add("hide"),i.extensionId.set(void 0))}}disposeTemplate(n){n.sourceColumnHover.dispose(),n.disposables.dispose(),n.sourceLabel.dispose(),n.extensionId.dispose()}};I=E([c(0,oi),c(1,B)],I);let S=class extends X{input;_onDidAccept=this._register(new K);onDidAccept=this._onDidAccept.event;_onDidReject=this._register(new K);onDidReject=this._onDidReject.event;constructor(n,e,i,t){super();const o=Ee.bindTo(t);this.input=this._register(i.createInstance(si,"keyboardshortcutseditor#wheninput",n,{provideResults:()=>{const d=[];for(const a of Te.all())d.push({label:a.key,documentation:a.description,detail:a.type,kind:di.Constant});return d},triggerCharacters:["!"," "],wordDefinition:/[a-zA-Z.]+/,alwaysShowSuggestions:!0},"","keyboardshortcutseditor#wheninput",{focusContextKey:o,overflowWidgetsDomNode:e.overflowWidgetsDomNode})),this._register(r.addDisposableListener(this.input.element,r.EventType.DBLCLICK,d=>r.EventHelper.stop(d))),this._register(J(()=>o.reset())),this._register(e.onAcceptWhenExpression(()=>this._onDidAccept.fire(this.input.getValue()))),this._register($e.any(e.onRejectWhenExpression,this.input.onDidBlur)(()=>this._onDidReject.fire()))}layout(n){this.input.layout(n)}show(n){this.input.setValue(n),this.input.focus(!0)}};S=E([c(2,M),c(3,R)],S);let v=class{constructor(n,e,i){this.keybindingsEditor=n;this.hoverService=e;this.instantiationService=i}static TEMPLATE_ID="when";templateId=v.TEMPLATE_ID;renderTemplate(n){const e=r.append(n,l(".when")),i=r.append(e,l("div.when-label")),t=new f(i),o=r.append(e,l("div.when-input-container"));return{element:e,whenLabelContainer:i,whenLabel:t,whenInputContainer:o,disposables:new k}}renderElement(n,e,i,t){i.disposables.clear();const o=i.disposables.add(new k);i.disposables.add(this.keybindingsEditor.onDefineWhenExpression(d=>{if(n===d){i.element.classList.add("input-mode");const a=o.add(this.instantiationService.createInstance(S,i.whenInputContainer,this.keybindingsEditor));a.layout(new r.Dimension(i.element.parentElement.clientWidth,18)),a.show(n.keybindingItem.when||"");const h=()=>{o.clear(),i.element.classList.remove("input-mode"),i.element.parentElement.style.paddingLeft="10px",r.clearNode(i.whenInputContainer)};o.add(a.onDidAccept(m=>{h(),this.keybindingsEditor.updateKeybinding(n,n.keybindingItem.keybinding&&n.keybindingItem.keybinding.getUserSettingsLabel()||"",m),this.keybindingsEditor.selectKeybinding(n)})),o.add(a.onDidReject(()=>{h(),this.keybindingsEditor.selectKeybinding(n)})),i.element.parentElement.style.paddingLeft="0px"}})),i.whenLabelContainer.classList.toggle("code",!!n.keybindingItem.when),i.whenLabelContainer.classList.toggle("empty",!n.keybindingItem.when),n.keybindingItem.when?(i.whenLabel.set(n.keybindingItem.when,n.whenMatches,n.keybindingItem.when),i.disposables.add(this.hoverService.setupManagedHover(W("mouse"),i.element,n.keybindingItem.when))):i.whenLabel.set("-")}disposeTemplate(n){n.disposables.dispose(),n.whenLabel.dispose()}};v=E([c(1,B),c(2,M)],v);class mi{constructor(n){this.configurationService=n}getWidgetAriaLabel(){return s("keybindingsLabel","Keybindings")}getAriaLabel({keybindingItem:n}){const e=[n.commandLabel?n.commandLabel:n.command,n.keybinding?.getAriaLabel()||s("noKeybinding","No keybinding assigned"),n.when?n.when:s("noWhen","No when context"),$(n.source)?n.source:n.source.description??n.source.identifier.value];if(this.configurationService.getValue(li.KeybindingsEditor)){const i=s("keyboard shortcuts aria label","use space or enter to change the keybinding.");e.push(i)}return e.join(", ")}}Y("keybindingTable.headerBackground",V,"Background color for the keyboard shortcuts table header."),Y("keybindingTable.rowsBackground",V,"Background color for the keyboard shortcuts table alternating rows."),Le((g,n)=>{const e=g.getColor(He);if(e){const y=e.transparent(.8).makeOpaque(qe(g));n.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-table-tr .monaco-table-td .code { color: ${y}; }`)}const i=g.getColor(xe),t=g.getColor(Oe);if(i&&t){const y=i.transparent(.8).makeOpaque(t);n.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${y}; }`)}const o=g.getColor(we),d=g.getColor(We);if(o&&d){const y=o.transparent(.8).makeOpaque(d);n.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${y}; }`)}const a=g.getColor(De),h=g.getColor(Be);if(a&&h){const y=a.transparent(.8).makeOpaque(h);n.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.focused .monaco-table-tr .monaco-table-td .code { color: ${y}; }`)}const m=g.getColor(Me),b=g.getColor(Ne);if(m&&b){const y=m.transparent(.8).makeOpaque(b);n.addRule(`.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row:hover:not(.focused):not(.selected) .monaco-table-tr .monaco-table-td .code { color: ${y}; }`)}});export{C as KeybindingsEditor};
