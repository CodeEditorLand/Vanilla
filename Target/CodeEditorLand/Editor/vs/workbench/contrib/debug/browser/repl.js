var pe=Object.defineProperty;var de=Object.getOwnPropertyDescriptor;var O=(s,r,e,t)=>{for(var i=t>1?void 0:t?de(r,e):r,n=s.length-1,o;n>=0;n--)(o=s[n])&&(i=(t?o(r,e,i):o(i))||i);return t&&i&&pe(r,e,i),i},c=(s,r)=>(e,t)=>r(e,t,s);import*as d from"../../../../base/browser/dom.js";import*as ue from"../../../../base/browser/ui/aria/aria.js";import{MOUSE_CURSOR_TEXT_CSS_CLASS_NAME as he}from"../../../../base/browser/ui/mouseCursor/mouseCursor.js";import{RunOnceScheduler as ge}from"../../../../base/common/async.js";import{memoize as me}from"../../../../base/common/decorators.js";import{Emitter as fe}from"../../../../base/common/event.js";import{HistoryNavigator as ve}from"../../../../base/common/history.js";import{KeyCode as H,KeyMod as _}from"../../../../base/common/keyCodes.js";import{Disposable as q}from"../../../../base/common/lifecycle.js";import{removeAnsiEscapeCodes as Se}from"../../../../base/common/strings.js";import{ThemeIcon as Ie}from"../../../../base/common/themables.js";import{URI as Ce}from"../../../../base/common/uri.js";import"./media/repl.css";import{isCodeEditor as ye}from"../../../../editor/browser/editorBrowser.js";import{EditorAction as J,registerEditorAction as X}from"../../../../editor/browser/editorExtensions.js";import{ICodeEditorService as be}from"../../../../editor/browser/services/codeEditorService.js";import{CodeEditorWidget as Ee}from"../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";import{EDITOR_FONT_DEFAULTS as Re,EditorOption as we}from"../../../../editor/common/config/editorOptions.js";import{Range as De}from"../../../../editor/common/core/range.js";import{EditorContextKeys as Z}from"../../../../editor/common/editorContextKeys.js";import{CompletionItemInsertTextRule as xe,CompletionItemKind as Te,CompletionItemKinds as Ae}from"../../../../editor/common/languages.js";import{ILanguageFeaturesService as Fe}from"../../../../editor/common/services/languageFeatures.js";import{IModelService as Ve}from"../../../../editor/common/services/model.js";import{ITextResourcePropertiesService as Le}from"../../../../editor/common/services/textResourceConfiguration.js";import{SuggestController as Me}from"../../../../editor/contrib/suggest/browser/suggestController.js";import{localize as u,localize2 as Q}from"../../../../nls.js";import{createAndFillInContextMenuActions as Oe}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as He,IMenuService as _e,MenuId as m,registerAction2 as I}from"../../../../platform/actions/common/actions.js";import{IClipboardService as P}from"../../../../platform/clipboard/common/clipboardService.js";import{IConfigurationService as j}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as y,IContextKeyService as ee}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as Pe}from"../../../../platform/contextview/browser/contextView.js";import{registerAndCreateHistoryNavigationContext as We}from"../../../../platform/history/browser/contextScopedHistoryWidget.js";import{IInstantiationService as Ne}from"../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as ke}from"../../../../platform/instantiation/common/serviceCollection.js";import{IKeybindingService as Ke}from"../../../../platform/keybinding/common/keybinding.js";import{KeybindingWeight as W}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{WorkbenchAsyncDataTree as ze}from"../../../../platform/list/browser/listService.js";import{ILogService as Be}from"../../../../platform/log/common/log.js";import{IOpenerService as $e}from"../../../../platform/opener/common/opener.js";import{IStorageService as Ue,StorageScope as f,StorageTarget as K}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as Ge}from"../../../../platform/telemetry/common/telemetry.js";import{editorForeground as Ye,resolveColorValue as qe}from"../../../../platform/theme/common/colorRegistry.js";import{IThemeService as te}from"../../../../platform/theme/common/themeService.js";import{FilterViewPane as Je,ViewAction as b}from"../../../browser/parts/views/viewPane.js";import{IViewDescriptorService as ie}from"../../../common/views.js";import{IViewsService as re}from"../../../services/views/common/viewsService.js";import{getSimpleCodeEditorWidgetOptions as Xe,getSimpleEditorOptions as Ze}from"../../codeEditor/browser/simpleEditorOptions.js";import{FocusSessionActionViewItem as Qe}from"./debugActionViewItems.js";import{debugConsoleClearAll as je,debugConsoleEvaluationPrompt as et}from"./debugIcons.js";import{LinkDetector as tt}from"./linkDetector.js";import{ReplFilter as it}from"./replFilter.js";import{ReplAccessibilityProvider as rt,ReplDataSource as ot,ReplDelegate as nt,ReplEvaluationInputsRenderer as st,ReplEvaluationResultsRenderer as lt,ReplGroupRenderer as at,ReplOutputElementRenderer as ct,ReplRawObjectsRenderer as pt,ReplVariablesRenderer as dt}from"./replViewer.js";import{CONTEXT_DEBUG_STATE as ut,CONTEXT_IN_DEBUG_REPL as w,CONTEXT_MULTI_SESSION_REPL as oe,DEBUG_SCHEME as ne,IDebugService as z,REPL_VIEW_ID as g,State as E,getStateLabel as ht}from"../common/debug.js";import{Variable as gt}from"../common/debugModel.js";import{ReplEvaluationResult as mt,ReplGroup as ft}from"../common/replModel.js";import{IEditorService as vt}from"../../../services/editor/common/editorService.js";import{registerNavigableContainer as St}from"../../../browser/actions/widgetNavigationCommands.js";import{AccessibilitySignal as It,IAccessibilitySignalService as Ct}from"../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";import{IHoverService as yt}from"../../../../platform/hover/browser/hover.js";import{AccessibilityVerbositySettingId as bt}from"../../accessibility/browser/accessibilityConfiguration.js";import{AccessibilityCommandId as Et}from"../../accessibility/common/accessibilityCommands.js";import{Codicon as Rt}from"../../../../base/common/codicons.js";const N=d.$,B="debug.repl.history",$="debug.repl.filterHistory",U="debug.repl.filterValue",se="replinputdecoration";function D(s){s.scrollTop=s.scrollHeight-s.renderHeight}const x=new Set,le={getId:s=>s.getId()};let v=class extends Je{constructor(e,t,i,n,o,a,p,F,V,T,k,A,L,M,l,R,h,C,G,Ft){const Y=n.get(U,f.WORKSPACE,"");super({...e,filterOptions:{placeholder:u({key:"workbench.debug.filter.placeholder",comment:["Text in the brackets after e.g. is not localizable"]},"Filter (e.g. text, !exclude, \\escape)"),text:Y,history:JSON.parse(n.get($,f.WORKSPACE,"[]"))}},M,T,k,p,V,i,l,o,R,h);this.debugService=t;this.storageService=n;this.modelService=a;this.configurationService=k;this.textResourcePropertiesService=A;this.editorService=L;this.keybindingService=M;this.languageFeaturesService=G;this.logService=Ft;this.menu=C.createMenu(m.DebugConsoleContext,p),this._register(this.menu),this.history=new ve(JSON.parse(this.storageService.get(B,f.WORKSPACE,"[]")),100),this.filter=new it,this.filter.filterQuery=Y,this.multiSessionRepl=oe.bindTo(p),this.replOptions=this._register(this.instantiationService.createInstance(S,this.id,()=>this.getLocationBasedColors().background)),this._register(this.replOptions.onDidChange(()=>this.onDidStyleChange())),F.registerDecorationType("repl-decoration",se,{}),this.multiSessionRepl.set(this.isMultiSessionView),this.registerListeners()}static REFRESH_DELAY=50;static URI=Ce.parse(`${ne}:replinput`);history;tree;replOptions;previousTreeScrollHeight=0;replDelegate;container;treeContainer;replInput;replInputContainer;bodyContentDimension;replInputLineCount=1;model;setHistoryNavigationEnablement;scopedInstantiationService;replElementsChangeListener;styleElement;styleChangedWhenInvisible=!1;completionItemProvider;modelChangeListener=q.None;filter;multiSessionRepl;menu;replDataSource;findIsOpen=!1;registerListeners(){this.debugService.getViewModel().focusedSession&&this.onDidFocusSession(this.debugService.getViewModel().focusedSession),this._register(this.debugService.getViewModel().onDidFocusSession(async e=>this.onDidFocusSession(e))),this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async e=>{e instanceof gt&&this.tree?.hasNode(e)&&(await this.tree.updateChildren(e,!1,!0),await this.tree.expand(e))})),this._register(this.debugService.onWillNewSession(async e=>{const t=this.tree?.getInput();(!t||t.state===E.Inactive)&&await this.selectSession(e),this.multiSessionRepl.set(this.isMultiSessionView)})),this._register(this.debugService.onDidEndSession(async()=>{await Promise.resolve(),this.multiSessionRepl.set(this.isMultiSessionView)})),this._register(this.themeService.onDidColorThemeChange(()=>{this.refreshReplElements(!1),this.isVisible()&&this.updateInputDecoration()})),this._register(this.onDidChangeBodyVisibility(e=>{e&&(this.model||(this.model=this.modelService.getModel(v.URI)||this.modelService.createModel("",null,v.URI,!0)),this.setMode(),this.replInput.setModel(this.model),this.updateInputDecoration(),this.refreshReplElements(!0),this.styleChangedWhenInvisible&&(this.styleChangedWhenInvisible=!1,this.onDidStyleChange()))})),this._register(this.configurationService.onDidChangeConfiguration(e=>{if(e.affectsConfiguration("debug.console.wordWrap")&&this.tree&&(this.tree.dispose(),this.treeContainer.innerText="",d.clearNode(this.treeContainer),this.createReplTree()),e.affectsConfiguration("debug.console.acceptSuggestionOnEnter")){const t=this.configurationService.getValue("debug");this.replInput.updateOptions({acceptSuggestionOnEnter:t.console.acceptSuggestionOnEnter==="on"?"on":"off"})}})),this._register(this.editorService.onDidActiveEditorChange(()=>{this.setMode()})),this._register(this.filterWidget.onDidChangeFilterText(()=>{this.filter.filterQuery=this.filterWidget.getFilterText(),this.tree&&(this.tree.refilter(),D(this.tree))}))}async onDidFocusSession(e){e&&(x.delete(e),this.completionItemProvider?.dispose(),e.capabilities.supportsCompletionsRequest&&(this.completionItemProvider=this.languageFeaturesService.completionProvider.register({scheme:ne,pattern:"**/replinput",hasAccessToAllModels:!0},{_debugDisplayName:"debugConsole",triggerCharacters:e.capabilities.completionTriggerCharacters||["."],provideCompletionItems:async(t,i,n,o)=>{this.setHistoryNavigationEnablement(!1);const a=this.replInput.getModel();if(a){const p=a.getWordAtPosition(i),F=p?p.word.length:0,V=a.getValue(),T=this.debugService.getViewModel().focusedStackFrame,k=T?T.frameId:void 0,A=await e.completions(k,T?.thread.threadId||0,V,i,F,o),L=[],M=l=>De.fromPositions(i.delta(0,-l),i);if(A&&A.body&&A.body.targets&&A.body.targets.forEach(l=>{if(l&&l.label){let R,h=l.text||l.label;if(typeof l.selectionStart=="number"){R=xe.InsertAsSnippet;const C=typeof l.selectionLength=="number"?l.selectionLength:0,G=C>0?"${1:"+h.substring(l.selectionStart,l.selectionStart+C)+"}$0":"$0";h=h.substring(0,l.selectionStart)+G+h.substring(l.selectionStart+C)}L.push({label:l.label,insertText:h,detail:l.detail,kind:Ae.fromString(l.type||"property"),filterText:l.start&&l.length?V.substring(l.start,l.start+l.length).concat(l.label):void 0,range:M(l.length||F),sortText:l.sortText,insertTextRules:R})}}),this.configurationService.getValue("debug").console.historySuggestions){const l=this.history.getHistory(),R=String(l.length).length;l.forEach((h,C)=>L.push({label:h,insertText:h,kind:Te.Text,range:M(h.length),sortText:"ZZZ"+String(l.length-C).padStart(R,"0")}))}return{suggestions:L}}return Promise.resolve({suggestions:[]})}}))),await this.selectSession()}getFilterStats(){return{total:this.tree?.getNode().children.length??0,filtered:this.tree?.getNode().children.filter(e=>e.visible).length??0}}get isReadonly(){const e=this.tree?.getInput();return!(e&&e.state!==E.Inactive)}showPreviousValue(){this.isReadonly||this.navigateHistory(!0)}showNextValue(){this.isReadonly||this.navigateHistory(!1)}focusFilter(){this.filterWidget.focus()}openFind(){this.tree?.openFind()}setMode(){if(!this.isVisible())return;const e=this.editorService.activeTextEditorControl;ye(e)&&(this.modelChangeListener.dispose(),this.modelChangeListener=e.onDidChangeModelLanguage(()=>this.setMode()),this.model&&e.hasModel()&&this.model.setLanguage(e.getModel().getLanguageId()))}onDidStyleChange(){if(!this.isVisible()){this.styleChangedWhenInvisible=!0;return}if(this.styleElement){this.replInput.updateOptions({fontSize:this.replOptions.replConfiguration.fontSize,lineHeight:this.replOptions.replConfiguration.lineHeight,fontFamily:this.replOptions.replConfiguration.fontFamily==="default"?Re.fontFamily:this.replOptions.replConfiguration.fontFamily});const e=this.replInput.getOption(we.lineHeight);this.styleElement.textContent=`
				.repl .repl-input-wrapper .repl-input-chevron {
					line-height: ${e}px
				}

				.repl .repl-input-wrapper .monaco-editor .lines-content {
					background-color: ${this.replOptions.replConfiguration.backgroundColor};
				}
			`;const t=this.replOptions.replConfiguration.fontFamily==="default"?"var(--monaco-monospace-font)":this.replOptions.replConfiguration.fontFamily;this.container.style.setProperty("--vscode-repl-font-family",t),this.container.style.setProperty("--vscode-repl-font-size",`${this.replOptions.replConfiguration.fontSize}px`),this.container.style.setProperty("--vscode-repl-font-size-for-twistie",`${this.replOptions.replConfiguration.fontSizeForTwistie}px`),this.container.style.setProperty("--vscode-repl-line-height",this.replOptions.replConfiguration.cssLineHeight),this.tree?.rerender(),this.bodyContentDimension&&this.layoutBodyContent(this.bodyContentDimension.height,this.bodyContentDimension.width)}}navigateHistory(e){const t=(e?this.history.previous()??this.history.first():this.history.next())??"";this.replInput.setValue(t),ue.status(t),this.replInput.setPosition({lineNumber:1,column:t.length+1}),this.setHistoryNavigationEnablement(!0)}async selectSession(e){const t=this.tree?.getInput();if(!e){const i=this.debugService.getViewModel().focusedSession;i?e=i:(!t||x.has(t))&&(e=this.debugService.getModel().getSessions(!0).find(n=>!x.has(n)))}if(e&&(this.replElementsChangeListener?.dispose(),this.replElementsChangeListener=e.onDidChangeReplElements(()=>{this.refreshReplElements(e.getReplElements().length===0)}),this.tree&&t!==e)){try{await this.tree.setInput(e)}catch(i){this.logService.error(i)}D(this.tree)}this.replInput?.updateOptions({readOnly:this.isReadonly}),this.updateInputDecoration()}async clearRepl(){const e=this.tree?.getInput();e&&(e.removeReplExpressions(),e.state===E.Inactive&&(x.add(e),await this.selectSession(),this.multiSessionRepl.set(this.isMultiSessionView))),this.replInput.focus()}acceptReplInput(){const e=this.tree?.getInput();if(e&&!this.isReadonly){e.addReplExpression(this.debugService.getViewModel().focusedStackFrame,this.replInput.getValue()),D(this.tree),this.history.add(this.replInput.getValue()),this.replInput.setValue("");const t=this.replInputLineCount>1;this.replInputLineCount=1,t&&this.bodyContentDimension&&this.layoutBodyContent(this.bodyContentDimension.height,this.bodyContentDimension.width)}}sendReplInput(e){const t=this.tree?.getInput();t&&!this.isReadonly&&(t.addReplExpression(this.debugService.getViewModel().focusedStackFrame,e),D(this.tree),this.history.add(e))}getVisibleContent(){let e="";if(this.model&&this.tree){const t=this.textResourcePropertiesService.getEOL(this.model.uri),i=n=>{n.children.forEach(o=>{o.visible&&(e+=o.element.toString().trimRight()+t,!o.collapsed&&o.children.length&&i(o))})};i(this.tree.getNode())}return Se(e)}layoutBodyContent(e,t){this.bodyContentDimension=new d.Dimension(t,e);const i=Math.min(this.replInput.getContentHeight(),e);if(this.tree){const n=this.tree.scrollTop+this.tree.renderHeight>=this.tree.scrollHeight,o=e-i;this.tree.getHTMLElement().style.height=`${o}px`,this.tree.layout(o,t),n&&D(this.tree)}this.replInputContainer.style.height=`${i}px`,this.replInput.layout({width:t-30,height:i})}collapseAll(){this.tree?.collapseAll()}getDebugSession(){return this.tree?.getInput()}getReplInput(){return this.replInput}getReplDataSource(){return this.replDataSource}getFocusedElement(){return this.tree?.getFocus()?.[0]}focusTree(){this.tree?.domFocus()}focus(){super.focus(),setTimeout(()=>this.replInput.focus(),0)}getActionViewItem(e){if(e.id===ce){const t=(this.tree?this.tree.getInput():void 0)??this.debugService.getViewModel().focusedSession;return this.instantiationService.createInstance(At,e,t)}return super.getActionViewItem(e)}get isMultiSessionView(){return this.debugService.getModel().getSessions(!0).filter(e=>e.hasSeparateRepl()&&!x.has(e)).length>1}get refreshScheduler(){const e=new Set;return new ge(async()=>{if(!this.tree||!this.tree.getInput())return;await this.tree.updateChildren(void 0,!0,!1,{diffIdentityProvider:le});const t=this.tree.getInput();if(t){const o=async a=>{for(const p of a)p instanceof ft&&(p.autoExpand&&!e.has(p.getId())&&(e.add(p.getId()),await this.tree.expand(p)),this.tree.isCollapsed(p)||await o(p.getChildren()))};await o(t.getReplElements())}const{total:i,filtered:n}=this.getFilterStats();this.filterWidget.updateBadge(i===n||i===0?void 0:u("showing filtered repl lines","Showing {0} of {1}",n,i))},v.REFRESH_DELAY)}render(){super.render(),this._register(St({name:"repl",focusNotifiers:[this,this.filterWidget],focusNextWidget:()=>{const e=this.tree?.getHTMLElement();this.filterWidget.hasFocus()?this.tree?.domFocus():e&&d.isActiveElement(e)&&this.focus()},focusPreviousWidget:()=>{const e=this.tree?.getHTMLElement();this.replInput.hasTextFocus()?this.tree?.domFocus():e&&d.isActiveElement(e)&&this.focusFilter()}}))}renderBody(e){super.renderBody(e),this.container=d.append(e,N(".repl")),this.treeContainer=d.append(this.container,N(`.repl-tree.${he}`)),this.createReplInput(this.container),this.createReplTree()}createReplTree(){this.replDelegate=new nt(this.configurationService,this.replOptions);const e=this.configurationService.getValue("debug").console.wordWrap;this.treeContainer.classList.toggle("word-wrap",e);const t=this.instantiationService.createInstance(tt);this.replDataSource=new ot;const i=this.tree=this.instantiationService.createInstance(ze,"DebugRepl",this.treeContainer,this.replDelegate,[this.instantiationService.createInstance(dt,t),this.instantiationService.createInstance(ct,t),new st,this.instantiationService.createInstance(at,t),new lt(t,this.hoverService),new pt(t,this.hoverService)],this.replDataSource,{filter:this.filter,accessibilityProvider:new rt,identityProvider:le,mouseSupport:!1,findWidgetEnabled:!0,keyboardNavigationLabelProvider:{getKeyboardNavigationLabel:o=>o.toString(!0)},horizontalScrolling:!e,setRowLineHeight:!1,supportDynamicHeights:e,overrideStyles:this.getLocationBasedColors().listOverrideStyles});this._register(i.onDidChangeContentHeight(()=>{i.scrollHeight!==this.previousTreeScrollHeight&&i.scrollTop+i.renderHeight>=this.previousTreeScrollHeight-2&&setTimeout(()=>{D(i)},0),this.previousTreeScrollHeight=i.scrollHeight})),this._register(i.onContextMenu(o=>this.onContextMenu(o))),this._register(i.onDidChangeFindOpenState(o=>this.findIsOpen=o));let n;this._register(i.onMouseClick(()=>{if(this.findIsOpen)return;const o=d.getWindow(this.treeContainer).getSelection();(!o||o.type!=="Range"||n===o.toString())&&this.replInput.focus(),n=o?o.toString():""})),this.selectSession(),this.styleElement=d.createStyleSheet(this.container),this.onDidStyleChange()}createReplInput(e){this.replInputContainer=d.append(e,N(".repl-input-wrapper")),d.append(this.replInputContainer,N(".repl-input-chevron"+Ie.asCSSSelector(et)));const{historyNavigationBackwardsEnablement:t,historyNavigationForwardsEnablement:i}=this._register(We(this.scopedContextKeyService,this));this.setHistoryNavigationEnablement=a=>{t.set(a),i.set(a)},w.bindTo(this.scopedContextKeyService).set(!0),this.scopedInstantiationService=this._register(this.instantiationService.createChild(new ke([ee,this.scopedContextKeyService])));const n=Ze(this.configurationService);n.readOnly=!0,n.suggest={showStatusBar:!0};const o=this.configurationService.getValue("debug");n.acceptSuggestionOnEnter=o.console.acceptSuggestionOnEnter==="on"?"on":"off",n.ariaLabel=this.getAriaLabel(),this.replInput=this.scopedInstantiationService.createInstance(Ee,this.replInputContainer,n,Xe()),this._register(this.replInput.onDidChangeModelContent(()=>{const a=this.replInput.getModel();this.setHistoryNavigationEnablement(!!a&&a.getValue()==="");const p=a?Math.min(10,a.getLineCount()):1;p!==this.replInputLineCount&&(this.replInputLineCount=p,this.bodyContentDimension&&this.layoutBodyContent(this.bodyContentDimension.height,this.bodyContentDimension.width))})),this._register(this.replInput.onDidFocusEditorText(()=>this.updateInputDecoration())),this._register(this.replInput.onDidBlurEditorText(()=>this.updateInputDecoration())),this._register(d.addStandardDisposableListener(this.replInputContainer,d.EventType.FOCUS,()=>this.replInputContainer.classList.add("synthetic-focus"))),this._register(d.addStandardDisposableListener(this.replInputContainer,d.EventType.BLUR,()=>this.replInputContainer.classList.remove("synthetic-focus")))}getAriaLabel(){let e=u("debugConsole","Debug Console");if(!this.configurationService.getValue(bt.Debug))return e;const t=this.keybindingService.lookupKeybinding(Et.OpenAccessibilityHelp)?.getAriaLabel();return t?e=u("commentLabelWithKeybinding","{0}, use ({1}) for accessibility help",e,t):e=u("commentLabelWithKeybindingNoKeybinding","{0}, run the command Open Accessibility Help which is currently not triggerable via keybinding.",e),e}onContextMenu(e){const t=[];Oe(this.menu,{arg:e.element,shouldForwardArgs:!1},t),this.contextMenuService.showContextMenu({getAnchor:()=>e.anchor,getActions:()=>t,getActionsContext:()=>e.element})}refreshReplElements(e){if(this.tree&&this.isVisible()){if(this.refreshScheduler.isScheduled())return;this.refreshScheduler.schedule(e?0:void 0)}}updateInputDecoration(){if(!this.replInput)return;const e=[];if(this.isReadonly&&this.replInput.hasTextFocus()&&!this.replInput.getValue()){const t=qe(Ye,this.themeService.getColorTheme())?.transparent(.4);e.push({range:{startLineNumber:0,endLineNumber:0,startColumn:0,endColumn:1},renderOptions:{after:{contentText:u("startDebugFirst","Please start a debug session to evaluate expressions"),color:t?t.toString():void 0}}})}this.replInput.setDecorationsByType("repl-decoration",se,e)}saveState(){const e=this.history.getHistory();e.length?this.storageService.store(B,JSON.stringify(e),f.WORKSPACE,K.MACHINE):this.storageService.remove(B,f.WORKSPACE);const t=this.filterWidget.getHistory();t.length?this.storageService.store($,JSON.stringify(t),f.WORKSPACE,K.MACHINE):this.storageService.remove($,f.WORKSPACE);const i=this.filterWidget.getFilterText();i?this.storageService.store(U,i,f.WORKSPACE,K.MACHINE):this.storageService.remove(U,f.WORKSPACE),super.saveState()}dispose(){this.replInput?.dispose(),this.replElementsChangeListener?.dispose(),this.refreshScheduler.dispose(),this.modelChangeListener.dispose(),super.dispose()}};O([me],v.prototype,"refreshScheduler",1),v=O([c(1,z),c(2,Ne),c(3,Ue),c(4,te),c(5,Ve),c(6,ee),c(7,be),c(8,ie),c(9,Pe),c(10,j),c(11,Le),c(12,vt),c(13,Ke),c(14,$e),c(15,Ge),c(16,yt),c(17,_e),c(18,Fe),c(19,Be)],v);let S=class extends q{constructor(e,t,i,n,o){super();this.backgroundColorDelegate=t;this.configurationService=i;this.themeService=n;this.viewDescriptorService=o;this._register(this.themeService.onDidColorThemeChange(a=>this.update())),this._register(this.viewDescriptorService.onDidChangeLocation(a=>{a.views.some(p=>p.id===e)&&this.update()})),this._register(this.configurationService.onDidChangeConfiguration(a=>{(a.affectsConfiguration("debug.console.lineHeight")||a.affectsConfiguration("debug.console.fontSize")||a.affectsConfiguration("debug.console.fontFamily"))&&this.update()})),this.update()}static lineHeightEm=1.4;_onDidChange=this._register(new fe);onDidChange=this._onDidChange.event;_replConfig;get replConfiguration(){return this._replConfig}update(){const e=this.configurationService.getValue("debug").console;this._replConfig={fontSize:e.fontSize,fontFamily:e.fontFamily,lineHeight:e.lineHeight?e.lineHeight:S.lineHeightEm*e.fontSize,cssLineHeight:e.lineHeight?`${e.lineHeight}px`:`${S.lineHeightEm}em`,backgroundColor:this.themeService.getColorTheme().getColor(this.backgroundColorDelegate()),fontSizeForTwistie:e.fontSize*S.lineHeightEm/2-8},this._onDidChange.fire()}};S=O([c(2,j),c(3,te),c(4,ie)],S);class wt extends J{constructor(){super({id:"repl.action.acceptInput",label:u({key:"actions.repl.acceptInput",comment:["Apply input from the debug console input box"]},"Debug Console: Accept Input"),alias:"Debug Console: Accept Input",precondition:w,kbOpts:{kbExpr:Z.textInputFocus,primary:H.Enter,weight:W.EditorContrib}})}run(r,e){Me.get(e)?.cancelSuggestWidget(),ae(r.get(re))?.acceptReplInput()}}class Dt extends b{constructor(){super({viewId:g,id:"repl.action.filter",title:u("repl.action.filter","Debug Console: Focus Filter"),precondition:w,keybinding:[{when:Z.textInputFocus,primary:_.CtrlCmd|H.KeyF,weight:W.EditorContrib}]})}runInView(r,e){e.focusFilter()}}class xt extends b{constructor(){super({viewId:g,id:"repl.action.find",title:u("repl.action.find","Debug Console: Focus Find"),precondition:w,keybinding:[{when:y.or(w,y.equals("focusedView","workbench.panel.repl.view")),primary:_.CtrlCmd|_.Alt|H.KeyF,weight:W.EditorContrib}],icon:Rt.search,menu:[{id:m.ViewTitle,group:"navigation",when:y.equals("view",g),order:15},{id:m.DebugConsoleContext,group:"z_commands",order:25}]})}runInView(r,e){e.openFind()}}class Tt extends J{constructor(){super({id:"repl.action.copyAll",label:u("actions.repl.copyAll","Debug: Console Copy All"),alias:"Debug Console Copy All",precondition:w})}run(r,e){const t=r.get(P),i=ae(r.get(re));if(i)return t.writeText(i.getVisibleContent())}}X(wt),X(Tt),I(Dt),I(xt);class At extends Qe{getSessions(){return this.debugService.getModel().getSessions(!0).filter(r=>r.hasSeparateRepl()&&!x.has(r))}mapFocusedSessionToSelected(r){for(;r.parentSession&&!r.hasSeparateRepl();)r=r.parentSession;return r}}function ae(s){return s.getActiveViewWithId(g)??void 0}const ce="workbench.action.debug.selectRepl";I(class extends b{constructor(){super({id:ce,viewId:g,title:u("selectRepl","Select Debug Console"),f1:!1,menu:{id:m.ViewTitle,group:"navigation",when:y.and(y.equals("view",g),oe),order:20}})}async runInView(s,r,e){const t=s.get(z);if(e&&e.state!==E.Inactive&&e!==t.getViewModel().focusedSession){if(e.state!==E.Stopped){const i=t.getModel().getSessions().find(n=>n.parentSession===e&&n.state===E.Stopped);i&&(e=i)}await t.focusStackFrame(void 0,void 0,e,{explicit:!0})}await r.selectSession(e)}}),I(class extends b{constructor(){super({id:"workbench.debug.panel.action.clearReplAction",viewId:g,title:Q("clearRepl","Clear Console"),metadata:{description:Q("clearRepl.descriotion","Clears all program output from your debug REPL")},f1:!0,icon:je,menu:[{id:m.ViewTitle,group:"navigation",when:y.equals("view",g),order:30},{id:m.DebugConsoleContext,group:"z_commands",order:20}],keybinding:[{primary:0,mac:{primary:_.CtrlCmd|H.KeyK},weight:W.WorkbenchContrib+1,when:y.equals("focusedView","workbench.panel.repl.view")}]})}runInView(s,r){const e=s.get(Ct);r.clearRepl(),e.playSignal(It.clear)}}),I(class extends b{constructor(){super({id:"debug.collapseRepl",title:u("collapse","Collapse All"),viewId:g,menu:{id:m.DebugConsoleContext,group:"z_commands",order:10}})}runInView(s,r){r.collapseAll(),r.focus()}}),I(class extends b{constructor(){super({id:"debug.replPaste",title:u("paste","Paste"),viewId:g,precondition:ut.notEqualsTo(ht(E.Inactive)),menu:{id:m.DebugConsoleContext,group:"2_cutcopypaste",order:30}})}async runInView(s,r){const t=await s.get(P).readText();if(t){const i=r.getReplInput();i.setValue(i.getValue().concat(t)),r.focus();const n=i.getModel(),o=n?n.getLineCount():0,a=n?.getLineMaxColumn(o);typeof o=="number"&&typeof a=="number"&&i.setPosition({lineNumber:o,column:a})}}}),I(class extends b{constructor(){super({id:"workbench.debug.action.copyAll",title:u("copyAll","Copy All"),viewId:g,menu:{id:m.DebugConsoleContext,group:"2_cutcopypaste",order:20}})}async runInView(s,r){await s.get(P).writeText(r.getVisibleContent())}}),I(class extends He{constructor(){super({id:"debug.replCopy",title:u("copy","Copy"),menu:{id:m.DebugConsoleContext,group:"2_cutcopypaste",order:10}})}async run(s,r){const e=s.get(P),t=s.get(z),n=d.getActiveWindow().getSelection()?.toString();if(n&&n.length>0)return e.writeText(n);if(r)return e.writeText(await this.tryEvaluateAndCopy(t,r)||r.toString())}async tryEvaluateAndCopy(s,r){if(!(r instanceof mt))return;const e=s.getViewModel().focusedStackFrame,t=s.getViewModel().focusedSession;if(!(!e||!t||!t.capabilities.supportsClipboardContext))try{return(await t.evaluate(r.originalExpression,e.frameId,"clipboard"))?.body.result}catch{return}}});export{v as Repl,ae as getReplView};
