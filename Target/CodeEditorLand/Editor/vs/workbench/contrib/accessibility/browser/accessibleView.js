var j=Object.defineProperty;var Z=Object.getOwnPropertyDescriptor;var P=(l,a,e,i)=>{for(var t=i>1?void 0:i?Z(a,e):a,n=l.length-1,o;n>=0;n--)(o=l[n])&&(t=(i?o(a,e,t):o(t))||t);return i&&t&&j(a,e,t),t},d=(l,a)=>(e,i)=>a(e,i,l);import{addDisposableListener as Y,EventType as J,getActiveWindow as ee,isActiveElement as ie}from"../../../../base/browser/dom.js";import{StandardKeyboardEvent as M}from"../../../../base/browser/keyboardEvent.js";import{ActionsOrientation as te}from"../../../../base/browser/ui/actionbar/actionbar.js";import{alert as N}from"../../../../base/browser/ui/aria/aria.js";import"../../../../base/common/actions.js";import{Codicon as ne}from"../../../../base/common/codicons.js";import{KeyCode as k}from"../../../../base/common/keyCodes.js";import{Disposable as O,DisposableStore as L}from"../../../../base/common/lifecycle.js";import*as oe from"../../../../base/common/marked/marked.js";import{isMacintosh as se,isWindows as re}from"../../../../base/common/platform.js";import{ThemeIcon as ce}from"../../../../base/common/themables.js";import{URI as T}from"../../../../base/common/uri.js";import"../../../../editor/browser/config/editorConfiguration.js";import{EditorExtensionsRegistry as de}from"../../../../editor/browser/editorExtensions.js";import{CodeEditorWidget as ae}from"../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";import{Position as E}from"../../../../editor/common/core/position.js";import"../../../../editor/common/model.js";import{IModelService as le}from"../../../../editor/common/services/model.js";import{AccessibilityHelpNLS as C}from"../../../../editor/common/standaloneStrings.js";import{CodeActionController as he}from"../../../../editor/contrib/codeAction/browser/codeActionController.js";import{localize as s}from"../../../../nls.js";import{AccessibleContentProvider as g,AccessibleViewProviderId as V,AccessibleViewType as v,ExtensionContentProvider as W}from"../../../../platform/accessibility/browser/accessibleView.js";import{ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX as R,IAccessibilityService as be}from"../../../../platform/accessibility/common/accessibility.js";import{createAndFillInActionBarActions as ue}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{WorkbenchToolBar as ge}from"../../../../platform/actions/browser/toolbar.js";import{IMenuService as ve,MenuId as _e}from"../../../../platform/actions/common/actions.js";import{ICommandService as pe}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as q}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as fe}from"../../../../platform/contextkey/common/contextkey.js";import{IContextViewService as me}from"../../../../platform/contextview/browser/contextView.js";import{IInstantiationService as U}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as Q}from"../../../../platform/keybinding/common/keybinding.js";import{ResultKind as ye}from"../../../../platform/keybinding/common/keybindingResolver.js";import{ILayoutService as we}from"../../../../platform/layout/browser/layoutService.js";import{IOpenerService as Ce}from"../../../../platform/opener/common/opener.js";import{IQuickInputService as $}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as Se,StorageScope as G,StorageTarget as Ie}from"../../../../platform/storage/common/storage.js";import{IChatCodeBlockContextProviderService as Pe}from"../../chat/browser/chat.js";import"../../chat/browser/codeBlockPart.js";import{getSimpleEditorOptions as ke}from"../../codeEditor/browser/simpleEditorOptions.js";import{AccessibilityCommandId as f}from"../common/accessibilityCommands.js";import{accessibilityHelpIsShown as Ve,AccessibilityWorkbenchSettingId as A,accessibleViewContainsCodeBlocks as Ae,accessibleViewCurrentProviderId as Ke,accessibleViewGoToSymbolSupported as xe,accessibleViewHasAssignedKeybindings as He,accessibleViewHasUnassignedKeybindings as Le,accessibleViewInCodeBlock as Te,accessibleViewIsShown as Ee,accessibleViewOnLastLine as We,accessibleViewSupportsNavigation as Be,accessibleViewVerbosityEnabled as De}from"./accessibilityConfiguration.js";import{resolveContentAndKeybindingItems as Me}from"./accessibleViewKeybindingResolver.js";var Ne=(a=>(a[a.MAX_WIDTH=600]="MAX_WIDTH",a))(Ne||{});let S=class extends O{constructor(e,i,t,n,o,r,b,h,c,u,y,B,w,x){super();this._openerService=e;this._instantiationService=i;this._configurationService=t;this._modelService=n;this._contextViewService=o;this._contextKeyService=r;this._accessibilityService=b;this._keybindingService=h;this._layoutService=c;this._menuService=u;this._commandService=y;this._codeBlockContextProviderService=B;this._storageService=w;this._quickInputService=x;this._accessiblityHelpIsShown=Ve.bindTo(this._contextKeyService),this._accessibleViewIsShown=Ee.bindTo(this._contextKeyService),this._accessibleViewSupportsNavigation=Be.bindTo(this._contextKeyService),this._accessibleViewVerbosityEnabled=De.bindTo(this._contextKeyService),this._accessibleViewGoToSymbolSupported=xe.bindTo(this._contextKeyService),this._accessibleViewCurrentProviderId=Ke.bindTo(this._contextKeyService),this._accessibleViewInCodeBlock=Te.bindTo(this._contextKeyService),this._accessibleViewContainsCodeBlocks=Ae.bindTo(this._contextKeyService),this._onLastLine=We.bindTo(this._contextKeyService),this._hasUnassignedKeybindings=Le.bindTo(this._contextKeyService),this._hasAssignedKeybindings=He.bindTo(this._contextKeyService),this._container=document.createElement("div"),this._container.classList.add("accessible-view"),this._configurationService.getValue(A.HideAccessibleView)&&this._container.classList.add("hide");const H={contributions:de.getEditorContributions().filter(p=>p.id!==he.ID)},_=document.createElement("div");_.classList.add("accessible-view-title-bar"),this._title=document.createElement("div"),this._title.classList.add("accessible-view-title"),_.appendChild(this._title);const m=document.createElement("div");m.classList.add("accessible-view-action-bar"),_.appendChild(m),this._container.appendChild(_),this._toolbar=this._register(i.createInstance(ge,m,{orientation:te.HORIZONTAL})),this._toolbar.context={viewId:"accessibleView"};const F=this._toolbar.getElement();F.tabIndex=0;const z={...ke(this._configurationService),lineDecorationsWidth:6,dragAndDrop:!1,cursorWidth:1,wordWrap:"off",wrappingStrategy:"advanced",wrappingIndent:"none",padding:{top:2,bottom:2},quickSuggestions:!1,renderWhitespace:"none",dropIntoEditor:{enabled:!1},readOnly:!0,fontFamily:"var(--monaco-monospace-font)"};this._editorWidget=this._register(this._instantiationService.createInstance(ae,this._container,z,H)),this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(()=>{this._currentProvider&&this._accessiblityHelpIsShown.get()&&this.show(this._currentProvider)})),this._register(this._configurationService.onDidChangeConfiguration(p=>{this._currentProvider instanceof g&&p.affectsConfiguration(this._currentProvider.verbositySettingKey)&&(this._accessiblityHelpIsShown.get()&&this.show(this._currentProvider),this._accessibleViewVerbosityEnabled.set(this._configurationService.getValue(this._currentProvider.verbositySettingKey)),this._updateToolbar(this._currentProvider.actions,this._currentProvider.options.type)),p.affectsConfiguration(A.HideAccessibleView)&&this._container.classList.toggle("hide",this._configurationService.getValue(A.HideAccessibleView))})),this._register(this._editorWidget.onDidDispose(()=>this._resetContextKeys())),this._register(this._editorWidget.onDidChangeCursorPosition(()=>{this._onLastLine.set(this._editorWidget.getPosition()?.lineNumber===this._editorWidget.getModel()?.getLineCount())})),this._register(this._editorWidget.onDidChangeCursorPosition(()=>{const p=this._editorWidget.getPosition()?.lineNumber;if(this._codeBlocks&&p!==void 0){const X=this._codeBlocks.find(D=>D.startLine<=p&&D.endLine>=p)!==void 0;this._accessibleViewInCodeBlock.set(X)}}))}_editorWidget;_accessiblityHelpIsShown;_onLastLine;_accessibleViewIsShown;_accessibleViewSupportsNavigation;_accessibleViewVerbosityEnabled;_accessibleViewGoToSymbolSupported;_accessibleViewCurrentProviderId;_accessibleViewInCodeBlock;_accessibleViewContainsCodeBlocks;_hasUnassignedKeybindings;_hasAssignedKeybindings;_codeBlocks;_inQuickPick=!1;get editorWidget(){return this._editorWidget}_container;_title;_toolbar;_currentProvider;_currentContent;_lastProvider;_viewContainer;_resetContextKeys(){this._accessiblityHelpIsShown.reset(),this._accessibleViewIsShown.reset(),this._accessibleViewSupportsNavigation.reset(),this._accessibleViewVerbosityEnabled.reset(),this._accessibleViewGoToSymbolSupported.reset(),this._accessibleViewCurrentProviderId.reset(),this._hasAssignedKeybindings.reset(),this._hasUnassignedKeybindings.reset()}getPosition(e){if(!(!e||!this._lastProvider||this._lastProvider.id!==e))return this._editorWidget.getPosition()||void 0}setPosition(e,i,t){if(this._editorWidget.setPosition(e),i&&this._editorWidget.revealPosition(e),t){const n=this._editorWidget.getModel()?.getLineLength(e.lineNumber)??0;n&&this._editorWidget.setSelection({startLineNumber:e.lineNumber,startColumn:1,endLineNumber:e.lineNumber,endColumn:n+1})}}getCodeBlockContext(){const e=this._editorWidget.getPosition();if(!this._codeBlocks?.length||!e)return;const i=this._codeBlocks?.findIndex(n=>n.startLine<=e?.lineNumber&&n.endLine>=e?.lineNumber),t=i!==void 0&&i>-1?this._codeBlocks[i]:void 0;if(!(!t||i===void 0))return{code:t.code,languageId:t.languageId,codeBlockIndex:i,element:void 0}}navigateToCodeBlock(e){const i=this._editorWidget.getPosition();if(!this._codeBlocks?.length||!i)return;let t;const n=this._codeBlocks.slice();e==="previous"?t=n.reverse().find(o=>o.endLine<i.lineNumber):t=n.find(o=>o.startLine>i.lineNumber),t&&this.setPosition(new E(t.startLine,1),!0)}showLastProvider(e){!this._lastProvider||this._lastProvider.options.id!==e||this.show(this._lastProvider)}show(e,i,t,n){if(e=e??this._currentProvider,!e)return;e.onOpen?.();const o={getAnchor:()=>({x:ee().innerWidth/2-Math.min(this._layoutService.activeContainerDimension.width*.62,600)/2,y:this._layoutService.activeContainerOffset.quickPickTop}),render:r=>(this._viewContainer=r,this._viewContainer.classList.add("accessible-view-container"),this._render(e,r,t)),onHide:()=>{t||(this._updateLastProvider(),this._currentProvider?.dispose(),this._currentProvider=void 0,this._resetContextKeys())}};this._contextViewService.showContextView(o),n&&queueMicrotask(()=>{this._editorWidget.revealLine(n.lineNumber),this._editorWidget.setSelection({startLineNumber:n.lineNumber,startColumn:n.column,endLineNumber:n.lineNumber,endColumn:n.column})}),i&&this._currentProvider&&this.showSymbol(this._currentProvider,i),e instanceof g&&e.onDidRequestClearLastProvider&&this._register(e.onDidRequestClearLastProvider(r=>{this._lastProvider?.options.id===r&&(this._lastProvider=void 0)})),e.options.id&&(this._lastProvider=e),e.id===V.Chat&&this._register(this._codeBlockContextProviderService.registerProvider({getCodeBlockContext:()=>this.getCodeBlockContext()},"accessibleView")),e instanceof W&&this._storageService.store(`${R}${e.id}`,!0,G.APPLICATION,Ie.USER),e.onDidChangeContent&&this._register(e.onDidChangeContent(()=>{this._viewContainer&&this._render(e,this._viewContainer,t)}))}previous(){const e=this._currentProvider?.providePreviousContent?.();!this._currentProvider||!this._viewContainer||!e||this._render(this._currentProvider,this._viewContainer,void 0,e)}next(){const e=this._currentProvider?.provideNextContent?.();!this._currentProvider||!this._viewContainer||!e||this._render(this._currentProvider,this._viewContainer,void 0,e)}_verbosityEnabled(){return this._currentProvider?this._currentProvider instanceof g?this._configurationService.getValue(this._currentProvider.verbositySettingKey)===!0:this._storageService.getBoolean(`${R}${this._currentProvider.id}`,G.APPLICATION,!1):!1}goToSymbol(){this._currentProvider&&this._instantiationService.createInstance(I,this).show(this._currentProvider)}calculateCodeBlocks(e){if(!e||this._currentProvider?.id!==V.Chat||this._currentProvider.options.language&&this._currentProvider.options.language!=="markdown")return;const i=e.split(`
`);this._codeBlocks=[];let t=!1,n=0,o;i.forEach((r,b)=>{if(!t&&r.startsWith("```"))t=!0,n=b+1,o=r.substring(3).trim();else if(t&&r.endsWith("```")){t=!1;const h=b,c=i.slice(n,h).join(`
`);this._codeBlocks?.push({startLine:n,endLine:h,code:c,languageId:o})}}),this._accessibleViewContainsCodeBlocks.set(this._codeBlocks.length>0)}getSymbols(){const e=this._currentProvider instanceof g?this._currentProvider:void 0;if(!this._currentContent||!e)return;const i=e.getSymbols?.()||[];if(i?.length)return i;if(e.options.language&&e.options.language!=="markdown")return;const t=oe.marked.lexer(this._currentContent);if(t)return this._convertTokensToSymbols(t,i),i.length?i:void 0}openHelpLink(){this._currentProvider?.options.readMoreUrl&&this._openerService.open(T.parse(this._currentProvider.options.readMoreUrl))}configureKeybindings(e){this._inQuickPick=!0;const i=this._updateLastProvider(),t=e?i?.options?.configureKeybindingItems:i?.options?.configuredKeybindingItems;if(!t)return;const n=this._register(new L),o=n.add(this._quickInputService.createQuickPick());o.items=t,o.title=s("keybindings","Configure keybindings"),o.placeholder=s("selectKeybinding","Select a command ID to configure a keybinding for it"),o.show(),n.add(o.onDidAccept(async()=>{const r=o.selectedItems[0];r&&await this._commandService.executeCommand("workbench.action.openGlobalKeybindings",r.id),o.dispose()})),n.add(o.onDidHide(()=>{!o.selectedItems.length&&i&&this.show(i),n.dispose(),this._inQuickPick=!1}))}_convertTokensToSymbols(e,i){let t;for(const n of e){let o;if("type"in n)switch(n.type){case"heading":case"paragraph":case"code":o=n.text;break;case"list":{const r=n.items[0];if(!r)break;t=`- ${r.text}`,o=n.items.map(b=>b.text).join(", ");break}}o&&(i.push({markdownToParse:o,label:s("symbolLabel","({0}) {1}",n.type,o),ariaLabel:s("symbolLabelAria","({0}) {1}",n.type,o),firstListItem:t}),t=void 0)}}showSymbol(e,i){if(!this._currentContent)return;let t=i.lineNumber;const n=i.markdownToParse;if(!(t===void 0&&n===void 0)){if(t===void 0&&n){const o=this._currentContent.split(`
`).findIndex(r=>r.includes(n.split(`
`)[0])||i.firstListItem&&r.includes(i.firstListItem))??-1;o>=0&&(t=o+1)}t!==void 0&&(this.show(e,void 0,void 0,{lineNumber:t,column:1}),this._updateContextKeys(e,!0))}}disableHint(){this._currentProvider instanceof g&&(this._configurationService.updateValue(this._currentProvider?.verbositySettingKey,!1),N(s("disableAccessibilityHelp","{0} accessibility verbosity is now disabled",this._currentProvider.verbositySettingKey)))}_updateContextKeys(e,i){e.options.type===v.Help?(this._accessiblityHelpIsShown.set(i),this._accessibleViewIsShown.reset()):(this._accessibleViewIsShown.set(i),this._accessiblityHelpIsShown.reset()),this._accessibleViewSupportsNavigation.set(e.provideNextContent!==void 0||e.providePreviousContent!==void 0),this._accessibleViewVerbosityEnabled.set(this._verbosityEnabled()),this._accessibleViewGoToSymbolSupported.set(this._goToSymbolsSupported()?this.getSymbols()?.length>0:!1)}_updateContent(e,i){let t=i??e.provideContent();if(e.options.type===v.View){this._currentContent=t,this._hasUnassignedKeybindings.reset(),this._hasAssignedKeybindings.reset();return}const n=this._readMoreHint(e),o=this._disableVerbosityHint(e),r=this._screenReaderModeHint(e),b=this._exitDialogHint(e);let h="",c="";const u=Me(this._keybindingService,r+t+n+o+b);u&&(t=u.content.value,u.configureKeybindingItems?(e.options.configureKeybindingItems=u.configureKeybindingItems,this._hasUnassignedKeybindings.set(!0),h=this._configureUnassignedKbHint()):this._hasAssignedKeybindings.reset(),u.configuredKeybindingItems?(e.options.configuredKeybindingItems=u.configuredKeybindingItems,this._hasAssignedKeybindings.set(!0),c=this._configureAssignedKbHint()):this._hasAssignedKeybindings.reset()),this._currentContent=t+h+c}_render(e,i,t,n){this._currentProvider=e,this._accessibleViewCurrentProviderId.set(e.id);const o=this._verbosityEnabled();this._updateContent(e,n),this.calculateCodeBlocks(this._currentContent),this._updateContextKeys(e,!0);const r=this._editorWidget.hasTextFocus()||this._editorWidget.hasWidgetFocus();this._getTextModel(T.from({path:`accessible-view-${e.id}`,scheme:"accessible-view",fragment:this._currentContent})).then(c=>{if(!c||(this._editorWidget.setModel(c),!this._editorWidget.getDomNode()))return;c.setLanguage(e.options.language??"markdown"),i.appendChild(this._container);let y="";const B=this._accessibleViewSupportsNavigation.get()||this._accessibleViewVerbosityEnabled.get()||this._accessibleViewGoToSymbolSupported.get()||e.actions?.length;o&&!t&&B&&(y=e.options.position?s("ariaAccessibleViewActionsBottom","Explore actions such as disabling this hint (Shift+Tab), use Escape to exit this dialog."):s("ariaAccessibleViewActions","Explore actions such as disabling this hint (Shift+Tab)."));let w=e.options.type===v.Help?s("accessibility-help","Accessibility Help"):s("accessible-view","Accessible View");if(this._title.textContent=w,y&&e.options.type===v.View?w=s("accessible-view-hint","Accessible View, {0}",y):y&&(w=s("accessibility-help-hint","Accessibility Help, {0}",y)),re&&r&&(w=""),this._editorWidget.updateOptions({ariaLabel:w}),this._editorWidget.focus(),this._currentProvider?.options.position){const x=this._editorWidget.getPosition(),H=x?.lineNumber===1&&x.column===1;if(this._currentProvider.options.position==="bottom"||this._currentProvider.options.position==="initial-bottom"&&H){const _=this.editorWidget.getModel()?.getLineCount(),m=_!==void 0&&_>0?new E(_,1):void 0;m&&(this._editorWidget.setPosition(m),this._editorWidget.revealLine(m.lineNumber))}}}),this._updateToolbar(this._currentProvider.actions,e.options.type);const b=c=>{this._inQuickPick||e.onClose(),c?.stopPropagation(),this._contextViewService.hideContextView(),this._updateContextKeys(e,!1),this._lastProvider=void 0,this._currentContent=void 0,this._currentProvider?.dispose(),this._currentProvider=void 0},h=new L;return h.add(this._editorWidget.onKeyDown(c=>{if(c.keyCode===k.Enter)this._commandService.executeCommand("editor.action.openLink");else if(c.keyCode===k.Escape||Oe(c.browserEvent,this._keybindingService,this._configurationService))b(c);else if(c.keyCode===k.KeyH&&e.options.readMoreUrl){const u=e.options.readMoreUrl;N(C.openingDocs),this._openerService.open(T.parse(u)),c.preventDefault(),c.stopPropagation()}e instanceof g&&e.onKeyDown?.(c)})),h.add(Y(this._toolbar.getElement(),J.KEY_DOWN,c=>{new M(c).equals(k.Escape)&&b(c)})),h.add(this._editorWidget.onDidBlurEditorWidget(()=>{ie(this._toolbar.getElement())||b()})),h.add(this._editorWidget.onDidContentSizeChange(()=>this._layout())),h.add(this._layoutService.onDidLayoutActiveContainer(()=>this._layout())),h}_updateToolbar(e,i){this._toolbar.setAriaLabel(i===v.Help?s("accessibleHelpToolbar","Accessibility Help"):s("accessibleViewToolbar","Accessible View"));const t=[],n=this._register(this._menuService.createMenu(_e.AccessibleView,this._contextKeyService));if(ue(n,{},t),e){for(const o of e)o.class=o.class||ce.asClassName(ne.primitiveSquare),o.checked=void 0;this._toolbar.setActions([...e,...t])}else this._toolbar.setActions(t)}_layout(){const e=this._layoutService.activeContainerDimension,i=e.height&&e.height*.4,t=Math.min(i,this._editorWidget.getContentHeight()),n=Math.min(e.width*.62,600);this._editorWidget.layout({width:n,height:t})}async _getTextModel(e){const i=this._modelService.getModel(e);return i&&!i.isDisposed()?i:this._modelService.createModel(e.fragment,null,e,!1)}_goToSymbolsSupported(){return this._currentProvider?this._currentProvider.options.type===v.Help||this._currentProvider.options.language==="markdown"||this._currentProvider.options.language===void 0||this._currentProvider instanceof g&&!!this._currentProvider.getSymbols?.():!1}_updateLastProvider(){const e=this._currentProvider;return e?e instanceof g?new g(e.id,e.options,e.provideContent.bind(e),e.onClose.bind(e),e.verbositySettingKey,e.onOpen?.bind(e),e.actions,e.provideNextContent?.bind(e),e.providePreviousContent?.bind(e),e.onDidChangeContent?.bind(e),e.onKeyDown?.bind(e),e.getSymbols?.bind(e)):new W(e.id,e.options,e.provideContent.bind(e),e.onClose.bind(e),e.onOpen?.bind(e),e.provideNextContent?.bind(e),e.providePreviousContent?.bind(e),e.actions,e.onDidChangeContent?.bind(e)):void 0}showAccessibleViewHelp(){const e=this._updateLastProvider();if(!e)return;let i;e instanceof g?i=new g(e.id,{type:v.Help},()=>e.options.customHelp?e?.options.customHelp():this._accessibleViewHelpDialogContent(this._goToSymbolsSupported()),()=>{this._contextViewService.hideContextView(),queueMicrotask(()=>this.show(e))},e.verbositySettingKey):i=new W(e.id,{type:v.Help},()=>e.options.customHelp?e?.options.customHelp():this._accessibleViewHelpDialogContent(this._goToSymbolsSupported()),()=>{this._contextViewService.hideContextView(),queueMicrotask(()=>this.show(e))}),this._contextViewService.hideContextView(),i&&queueMicrotask(()=>this.show(i,void 0,!0))}_accessibleViewHelpDialogContent(e){const i=this._navigationHint(),t=this._goToSymbolHint(e),n=s("toolbar","Navigate to the toolbar (Shift+Tab)."),o=this._getChatHints();let r=s("intro",`In the accessible view, you can:
`);return i&&(r+=" - "+i+`
`),t&&(r+=" - "+t+`
`),n&&(r+=" - "+n+`
`),o&&(r+=o),r}_getChatHints(){if(this._currentProvider?.id===V.Chat)return[s("insertAtCursor"," - Insert the code block at the cursor{0}.","<keybinding:workbench.action.chat.insertCodeBlock>"),s("insertIntoNewFile"," - Insert the code block into a new file{0}.","<keybinding:workbench.action.chat.insertIntoNewFile>"),s("runInTerminal",` - Run the code block in the terminal{0}.
`,"<keybinding:workbench.action.chat.runInTerminal>")].join(`
`)}_navigationHint(){return s("accessibleViewNextPreviousHint","Show the next item{0} or previous item{1}.",`<keybinding:${f.ShowNext}`,`<keybinding:${f.ShowPrevious}>`)}_disableVerbosityHint(e){return e.options.type===v.Help&&this._verbosityEnabled()?s("acessibleViewDisableHint",`
Disable accessibility verbosity for this feature{0}.`,`<keybinding:${f.DisableVerbosityHint}>`):""}_goToSymbolHint(e){if(e)return s("goToSymbolHint","Go to a symbol{0}.",`<keybinding:${f.GoToSymbol}>`)}_configureUnassignedKbHint(){const e=this._keybindingService.lookupKeybinding(f.AccessibilityHelpConfigureKeybindings)?.getAriaLabel(),i=e?"("+e+")":"by assigning a keybinding to the command Accessibility Help Configure Unassigned Keybindings.";return s("configureKb",`
Configure keybindings for commands that lack them {0}.`,i)}_configureAssignedKbHint(){const e=this._keybindingService.lookupKeybinding(f.AccessibilityHelpConfigureAssignedKeybindings)?.getAriaLabel(),i=e?"("+e+")":"by assigning a keybinding to the command Accessibility Help Configure Assigned Keybindings.";return s("configureKbAssigned",`
Configure keybindings for commands that already have assignments {0}.`,i)}_screenReaderModeHint(e){const i=this._accessibilityService.isScreenReaderOptimized();let t="";const n=se?C.changeConfigToOnMac:C.changeConfigToOnWinLinux;return i&&e.id===V.Editor?(t=C.auto_on,t+=`
`):i||(t=C.auto_off+`
`+n,t+=`
`),t}_exitDialogHint(e){return this._verbosityEnabled()&&!e.options.position?s("exit",`
Exit this dialog (Escape).`):""}_readMoreHint(e){return e.options.readMoreUrl?s("openDoc",`
Open a browser window with more information related to accessibility{0}.`,`<keybinding:${f.AccessibilityHelpOpenHelpLink}>`):""}};S=P([d(0,Ce),d(1,U),d(2,q),d(3,le),d(4,me),d(5,fe),d(6,be),d(7,Q),d(8,we),d(9,ve),d(10,pe),d(11,Pe),d(12,Se),d(13,$)],S);let K=class extends O{constructor(e,i,t){super();this._instantiationService=e;this._configurationService=i;this._keybindingService=t}_accessibleView;show(e,i){this._accessibleView||(this._accessibleView=this._register(this._instantiationService.createInstance(S))),this._accessibleView.show(e,void 0,void 0,i)}configureKeybindings(e){this._accessibleView?.configureKeybindings(e)}openHelpLink(){this._accessibleView?.openHelpLink()}showLastProvider(e){this._accessibleView?.showLastProvider(e)}next(){this._accessibleView?.next()}previous(){this._accessibleView?.previous()}goToSymbol(){this._accessibleView?.goToSymbol()}getOpenAriaHint(e){if(!this._configurationService.getValue(e))return null;const i=this._keybindingService.lookupKeybinding(f.OpenAccessibleView)?.getAriaLabel();let t=null;return i?t=s("acessibleViewHint","Inspect this in the accessible view with {0}",i):t=s("acessibleViewHintNoKbEither","Inspect this in the accessible view via the command Open Accessible View which is currently not triggerable via keybinding."),t}disableHint(){this._accessibleView?.disableHint()}showAccessibleViewHelp(){this._accessibleView?.showAccessibleViewHelp()}getPosition(e){return this._accessibleView?.getPosition(e)??void 0}getLastPosition(){const e=this._accessibleView?.editorWidget.getModel()?.getLineCount();return e!==void 0&&e>0?new E(e,1):void 0}setPosition(e,i,t){this._accessibleView?.setPosition(e,i,t)}getCodeBlockContext(){return this._accessibleView?.getCodeBlockContext()}navigateToCodeBlock(e){this._accessibleView?.navigateToCodeBlock(e)}};K=P([d(0,U),d(1,q),d(2,Q)],K);let I=class{constructor(a,e){this._accessibleView=a;this._quickInputService=e}show(a){const e=new L,i=e.add(this._quickInputService.createQuickPick());i.placeholder=s("accessibleViewSymbolQuickPickPlaceholder","Type to search symbols"),i.title=s("accessibleViewSymbolQuickPickTitle","Go to Symbol Accessible View");const t=[],n=this._accessibleView.getSymbols();if(n){for(const o of n)t.push({label:o.label,ariaLabel:o.ariaLabel});i.canSelectMany=!1,i.items=n,i.show(),e.add(i.onDidAccept(()=>{this._accessibleView.showSymbol(a,i.selectedItems[0]),i.hide()})),e.add(i.onDidHide(()=>{i.selectedItems.length===0&&this._accessibleView.show(a),e.dispose()}))}}};I=P([d(1,$)],I);function Oe(l,a,e){if(!e.getValue(A.AccessibleViewCloseOnKeyPress))return!1;const i=new M(l),n=a.softDispatch(i,i.target).kind===ye.MoreChordsNeeded;return a.inChordMode||n?!1:Re(l)&&!l.ctrlKey&&!l.altKey&&!l.metaKey&&!l.shiftKey}function Re(l){return!!l.code.match(/^(Key[A-Z]|Digit[0-9]|Equal|Comma|Period|Slash|Quote|Backquote|Backslash|Minus|Semicolon|Space|Enter)$/)}export{S as AccessibleView,K as AccessibleViewService};
