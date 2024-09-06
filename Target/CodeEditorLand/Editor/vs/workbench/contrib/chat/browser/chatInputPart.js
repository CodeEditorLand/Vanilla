var R=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var x=(g,v,t,e)=>{for(var i=e>1?void 0:e?U(v,t):v,o=g.length-1,n;o>=0;o--)(n=g[o])&&(i=(e?n(v,t,i):n(i))||i);return e&&i&&R(v,t,i),i},h=(g,v)=>(t,e)=>v(t,e,g);import*as d from"../../../../../vs/base/browser/dom.js";import{DEFAULT_FONT_FAMILY as k}from"../../../../../vs/base/browser/fonts.js";import"../../../../../vs/base/browser/history.js";import{StandardKeyboardEvent as q}from"../../../../../vs/base/browser/keyboardEvent.js";import*as z from"../../../../../vs/base/browser/ui/aria/aria.js";import{Button as $}from"../../../../../vs/base/browser/ui/button/button.js";import"../../../../../vs/base/common/actions.js";import{Codicon as w}from"../../../../../vs/base/common/codicons.js";import{Emitter as E}from"../../../../../vs/base/common/event.js";import{HistoryNavigator2 as T}from"../../../../../vs/base/common/history.js";import{KeyCode as A}from"../../../../../vs/base/common/keyCodes.js";import{Disposable as X,DisposableStore as L}from"../../../../../vs/base/common/lifecycle.js";import{basename as j,dirname as J}from"../../../../../vs/base/common/path.js";import{isMacintosh as Q}from"../../../../../vs/base/common/platform.js";import{URI as H}from"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/browser/config/editorConfiguration.js";import{EditorExtensionsRegistry as G}from"../../../../../vs/editor/browser/editorExtensions.js";import{CodeEditorWidget as Y}from"../../../../../vs/editor/browser/widget/codeEditor/codeEditorWidget.js";import"../../../../../vs/editor/common/core/dimension.js";import"../../../../../vs/editor/common/core/position.js";import{Range as Z}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/model.js";import{IModelService as tt}from"../../../../../vs/editor/common/services/model.js";import{ContentHoverController as et}from"../../../../../vs/editor/contrib/hover/browser/contentHoverController2.js";import{MarginHoverController as it}from"../../../../../vs/editor/contrib/hover/browser/marginHoverController.js";import{localize as b}from"../../../../../vs/nls.js";import{IAccessibilityService as M}from"../../../../../vs/platform/accessibility/common/accessibility.js";import{DropdownWithPrimaryActionViewItem as ot}from"../../../../../vs/platform/actions/browser/dropdownWithPrimaryActionViewItem.js";import{createAndFillInActionBarActions as nt}from"../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{HiddenItemStrategy as rt,MenuWorkbenchToolBar as N}from"../../../../../vs/platform/actions/browser/toolbar.js";import{IMenuService as st,MenuId as at,MenuItemAction as P}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as dt}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as D}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as ht}from"../../../../../vs/platform/contextview/browser/contextView.js";import{FileKind as lt}from"../../../../../vs/platform/files/common/files.js";import{registerAndCreateHistoryNavigationContext as ct}from"../../../../../vs/platform/history/browser/contextScopedHistoryWidget.js";import{IInstantiationService as ut}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ServiceCollection as pt}from"../../../../../vs/platform/instantiation/common/serviceCollection.js";import{IKeybindingService as F}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{ILogService as gt}from"../../../../../vs/platform/log/common/log.js";import{INotificationService as mt}from"../../../../../vs/platform/notification/common/notification.js";import{IThemeService as ft}from"../../../../../vs/platform/theme/common/themeService.js";import{ResourceLabels as vt}from"../../../../../vs/workbench/browser/labels.js";import{AccessibilityVerbositySettingId as V}from"../../../../../vs/workbench/contrib/accessibility/browser/accessibilityConfiguration.js";import{AccessibilityCommandId as yt}from"../../../../../vs/workbench/contrib/accessibility/common/accessibilityCommands.js";import{CancelAction as Ct,ChatSubmitSecondaryAgentAction as bt,SubmitAction as Et}from"../../../../../vs/workbench/contrib/chat/browser/actions/chatExecuteActions.js";import"../../../../../vs/workbench/contrib/chat/browser/chat.js";import{ChatFollowups as It}from"../../../../../vs/workbench/contrib/chat/browser/chatFollowups.js";import{ChatAgentLocation as _t,IChatAgentService as St}from"../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import{CONTEXT_CHAT_INPUT_CURSOR_AT_TOP as xt,CONTEXT_CHAT_INPUT_HAS_FOCUS as Ht,CONTEXT_CHAT_INPUT_HAS_TEXT as Dt,CONTEXT_IN_CHAT_INPUT as wt}from"../../../../../vs/workbench/contrib/chat/common/chatContextKeys.js";import"../../../../../vs/workbench/contrib/chat/common/chatModel.js";import"../../../../../vs/workbench/contrib/chat/common/chatService.js";import"../../../../../vs/workbench/contrib/chat/common/chatViewModel.js";import{IChatWidgetHistoryService as Tt}from"../../../../../vs/workbench/contrib/chat/common/chatWidgetHistoryService.js";import{getSimpleCodeEditorWidgetOptions as At,getSimpleEditorOptions as Lt,setupSimpleEditorSelectionStyling as Mt}from"../../../../../vs/workbench/contrib/codeEditor/browser/simpleEditorOptions.js";const m=d.$,W=250;let I=class extends X{constructor(t,e,i,o,n,p,l,f,c,s,u){super();this.location=t;this.options=e;this.getInputState=i;this.historyService=o;this.modelService=n;this.instantiationService=p;this.contextKeyService=l;this.configurationService=f;this.keybindingService=c;this.accessibilityService=s;this.logService=u;this.inputEditorMaxHeight=this.options.renderStyle==="compact"?W/3:W,this.inputEditorHasText=Dt.bindTo(l),this.chatCursorAtTop=xt.bindTo(l),this.inputEditorHasFocus=Ht.bindTo(l),this.history=this.loadHistory(),this._register(this.historyService.onDidClearHistory(()=>this.history=new T([{text:""}],50,O))),this._register(this.configurationService.onDidChangeConfiguration(a=>{a.affectsConfiguration(V.Chat)&&this.inputEditor.updateOptions({ariaLabel:this._getAriaLabel()})}))}static INPUT_SCHEME="chatSessionInput";static _counter=0;_onDidLoadInputState=this._register(new E);onDidLoadInputState=this._onDidLoadInputState.event;_onDidChangeHeight=this._register(new E);onDidChangeHeight=this._onDidChangeHeight.event;_onDidFocus=this._register(new E);onDidFocus=this._onDidFocus.event;_onDidBlur=this._register(new E);onDidBlur=this._onDidBlur.event;_onDidChangeContext=this._register(new E);onDidChangeContext=this._onDidChangeContext.event;_onDidAcceptFollowup=this._register(new E);onDidAcceptFollowup=this._onDidAcceptFollowup.event;get attachedContext(){return this._attachedContext}_indexOfLastAttachedContextDeletedWithKeyboard=-1;_attachedContext=new Set;_onDidChangeVisibility=this._register(new E);_contextResourceLabels=this.instantiationService.createInstance(vt,{onDidChangeVisibility:this._onDidChangeVisibility.event});inputEditorMaxHeight;inputEditorHeight=0;container;inputSideToolbarContainer;followupsContainer;followupsDisposables=this._register(new L);attachedContextContainer;attachedContextDisposables=this._register(new L);_inputPartHeight=0;get inputPartHeight(){return this._inputPartHeight}_inputEditor;_inputEditorElement;toolbar;get inputEditor(){return this._inputEditor}history;historyNavigationBackwardsEnablement;historyNavigationForewardsEnablement;inHistoryNavigation=!1;inputModel;inputEditorHasText;chatCursorAtTop;inputEditorHasFocus;cachedDimensions;cachedToolbarWidth;inputUri=H.parse(`${I.INPUT_SCHEME}:input-${I._counter++}`);loadHistory(){const t=this.historyService.getHistory(this.location);return t.length===0&&t.push({text:""}),new T(t,50,O)}_getAriaLabel(){if(this.configurationService.getValue(V.Chat)){const e=this.keybindingService.lookupKeybinding(yt.OpenAccessibilityHelp)?.getLabel();return e?b("actions.chat.accessibiltyHelp","Chat Input,  Type to ask questions or type / for topics, press enter to send out the request. Use {0} for Chat Accessibility Help.",e):b("chatInput.accessibilityHelpNoKb","Chat Input,  Type code here and press Enter to run. Use the Chat Accessibility Help command for more information.")}return b("chatInput","Chat Input")}updateState(t){if(this.inHistoryNavigation)return;const e={text:this._inputEditor.getValue(),state:t};this.history.isAtEnd()?this.history.replaceLast(e):(this.history.replaceLast(e),this.history.resetCursor())}initForNewChatModel(t,e){this.history=this.loadHistory(),this.history.add({text:t??this.history.current().text,state:e}),t&&this.setValue(t,!1)}logInputHistory(){const t=[...this.history].map(e=>JSON.stringify(e)).join(`
`);this.logService.info(`[${this.location}] Chat input history:`,t)}setVisible(t){this._onDidChangeVisibility.fire(t)}get element(){return this.container}showPreviousValue(){const t=this.getInputState();this.history.isAtEnd()?this.saveCurrentValue(t):this.history.has({text:this._inputEditor.getValue(),state:t})||(this.saveCurrentValue(t),this.history.resetCursor()),this.navigateHistory(!0)}showNextValue(){const t=this.getInputState();this.history.isAtEnd()||(this.history.has({text:this._inputEditor.getValue(),state:t})||(this.saveCurrentValue(t),this.history.resetCursor()),this.navigateHistory(!1))}navigateHistory(t){const e=t?this.history.previous():this.history.next();if(z.status(e.text),this.inHistoryNavigation=!0,this.setValue(e.text,!0),this.inHistoryNavigation=!1,this._onDidLoadInputState.fire(e.state),t)this._inputEditor.setPosition({lineNumber:1,column:1});else{const i=this._inputEditor.getModel();if(!i)return;this._inputEditor.setPosition(B(i))}}setValue(t,e){this.inputEditor.setValue(t),this.inputEditor.setPosition({lineNumber:1,column:t.length+1}),e||this.saveCurrentValue(this.getInputState())}saveCurrentValue(t){const e={text:this._inputEditor.getValue(),state:t};this.history.replaceLast(e)}focus(){this._inputEditor.focus()}hasFocus(){return this._inputEditor.hasWidgetFocus()}async acceptInput(t){if(t){const i={text:this._inputEditor.getValue(),state:this.getInputState()};this.history.replaceLast(i),this.history.add({text:""})}this._attachedContext.clear(),this._onDidLoadInputState.fire({}),this.accessibilityService.isScreenReaderOptimized()&&Q?this._acceptInputForVoiceover():(this._inputEditor.focus(),this._inputEditor.setValue(""))}_acceptInputForVoiceover(){const t=this._inputEditor.getDomNode();t&&(t.remove(),this._inputEditor.setValue(""),this._inputEditorElement.appendChild(t),this._inputEditor.focus())}attachContext(t,...e){const i=[];if(t&&(i.push(...Array.from(this._attachedContext)),this._attachedContext.clear()),e.length>0)for(const o of e)this._attachedContext.add(o);(i.length>0||e.length>0)&&(this.initAttachedContext(this.attachedContextContainer),t||this._onDidChangeContext.fire({removed:i,added:e}))}render(t,e,i){this.container=d.append(t,m(".interactive-input-part")),this.container.classList.toggle("compact",this.options.renderStyle==="compact");let o,n;this.options.renderStyle==="compact"?(n=d.append(this.container,m(".interactive-input-and-side-toolbar")),this.followupsContainer=d.append(this.container,m(".interactive-input-followups")),o=d.append(n,m(".interactive-input-and-execute-toolbar")),this.attachedContextContainer=d.append(this.container,m(".chat-attached-context"))):(this.followupsContainer=d.append(this.container,m(".interactive-input-followups")),this.attachedContextContainer=d.append(this.container,m(".chat-attached-context")),n=d.append(this.container,m(".interactive-input-and-side-toolbar")),o=d.append(n,m(".interactive-input-and-execute-toolbar"))),this.initAttachedContext(this.attachedContextContainer);const p=this._register(this.contextKeyService.createScoped(o));wt.bindTo(p).set(!0);const l=this._register(this.instantiationService.createChild(new pt([D,p]))),{historyNavigationBackwardsEnablement:f,historyNavigationForwardsEnablement:c}=this._register(ct(p,this));this.historyNavigationBackwardsEnablement=f,this.historyNavigationForewardsEnablement=c;const s=Lt(this.configurationService);s.overflowWidgetsDomNode=this.options.editorOverflowWidgetsDomNode,s.readOnly=!1,s.ariaLabel=this._getAriaLabel(),s.fontFamily=k,s.fontSize=13,s.lineHeight=20,s.padding=this.options.renderStyle==="compact"?{top:2,bottom:2}:{top:8,bottom:8},s.cursorWidth=1,s.wrappingStrategy="advanced",s.bracketPairColorization={enabled:!1},s.suggest={showIcons:!1,showSnippets:!1,showWords:!0,showStatusBar:!1,insertMode:"replace"},s.scrollbar={...s.scrollbar??{},vertical:"hidden"},s.stickyScroll={enabled:!1},this._inputEditorElement=d.append(o,m(K));const u=At();if(u.contributions?.push(...G.getSomeEditorContributions([et.ID,it.ID])),this._inputEditor=this._register(l.createInstance(Y,this._inputEditorElement,s,u)),this._register(this._inputEditor.onDidChangeModelContent(()=>{const r=Math.min(this._inputEditor.getContentHeight(),this.inputEditorMaxHeight);r!==this.inputEditorHeight&&(this.inputEditorHeight=r,this._onDidChangeHeight.fire());const C=this._inputEditor.getModel(),_=!!C&&C.getValue().trim().length>0;this.inputEditorHasText.set(_)})),this._register(this._inputEditor.onDidFocusEditorText(()=>{this.inputEditorHasFocus.set(!0),this._onDidFocus.fire(),o.classList.toggle("focused",!0)})),this._register(this._inputEditor.onDidBlurEditorText(()=>{this.inputEditorHasFocus.set(!1),o.classList.toggle("focused",!1),this._onDidBlur.fire()})),this.toolbar=this._register(this.instantiationService.createInstance(N,o,this.options.menus.executeToolbar,{telemetrySource:this.options.menus.telemetrySource,menuOptions:{shouldForwardArgs:!0},hiddenItemStrategy:rt.Ignore,actionViewItemProvider:(r,C)=>{if(this.location===_t.Panel&&(r.id===Et.ID||r.id===Ct.ID)&&r instanceof P){const _=this.instantiationService.createInstance(P,{id:"chat.moreExecuteActions",title:b("notebook.moreExecuteActionsLabel","More..."),icon:w.chevronDown},void 0,void 0,void 0,void 0);return this.instantiationService.createInstance(S,r,_)}}})),this.toolbar.getElement().classList.add("interactive-execute-toolbar"),this.toolbar.context={widget:i},this._register(this.toolbar.onDidChangeMenuItems(()=>{this.cachedDimensions&&typeof this.cachedToolbarWidth=="number"&&this.cachedToolbarWidth!==this.toolbar.getItemsWidth()&&this.layout(this.cachedDimensions.height,this.cachedDimensions.width)})),this.options.menus.inputSideToolbar){const r=this._register(this.instantiationService.createInstance(N,n,this.options.menus.inputSideToolbar,{telemetrySource:this.options.menus.telemetrySource,menuOptions:{shouldForwardArgs:!0}}));this.inputSideToolbarContainer=r.getElement(),r.getElement().classList.add("chat-side-toolbar"),r.context={widget:i}}let a=this.modelService.getModel(this.inputUri);if(a||(a=this.modelService.createModel("",null,this.inputUri,!0),this._register(a)),this.inputModel=a,this.inputModel.updateOptions({bracketColorizationOptions:{enabled:!1,independentColorPoolPerBracketType:!1}}),this._inputEditor.setModel(this.inputModel),e){this.inputModel.setValue(e);const r=this.inputModel.getLineCount();this._inputEditor.setPosition({lineNumber:r,column:this.inputModel.getLineMaxColumn(r)})}const y=()=>{const r=this._inputEditor.getModel();if(!r)return;const C=this._inputEditor.getPosition();if(!C)return;const _=C.column===1&&C.lineNumber===1;this.chatCursorAtTop.set(_),this.historyNavigationBackwardsEnablement.set(_),this.historyNavigationForewardsEnablement.set(C.equals(B(r)))};this._register(this._inputEditor.onDidChangeCursorPosition(r=>y())),y()}initAttachedContext(t){const e=t.offsetHeight;d.clearNode(t),this.attachedContextDisposables.clear(),d.setVisibility(!!this.attachedContext.size,this.attachedContextContainer),this.attachedContext.size||(this._indexOfLastAttachedContextDeletedWithKeyboard=-1),[...this.attachedContext.values()].forEach((i,o)=>{const n=d.append(t,m(".chat-attached-context-attachment.show-file-icons")),p=this._contextResourceLabels.create(n,{supportIcons:!0}),l=H.isUri(i.value)?i.value:i.value&&typeof i.value=="object"&&"uri"in i.value&&H.isUri(i.value.uri)?i.value.uri:void 0,f=i.value&&typeof i.value=="object"&&"range"in i.value&&Z.isIRange(i.value.range)?i.value.range:void 0;if(l&&i.isFile){const u=j(l.path),a=J(l.path),y=`${u} ${a}`,r=f?b("chat.fileAttachmentWithRange","Attached file, {0}, line {1} to line {2}",y,f.startLineNumber,f.endLineNumber):b("chat.fileAttachment","Attached file, {0}",y);p.setFile(l,{fileKind:lt.FILE,hidePath:!0,range:f}),n.ariaLabel=r,n.tabIndex=0}else{const u=i.fullName??i.name,a=i.icon?.id?`$(${i.icon.id}) ${u}`:u;p.setLabel(a,void 0),n.ariaLabel=b("chat.attachment","Attached context, {0}",i.name),n.tabIndex=0}const c=new $(n,{supportIcons:!0});o===Math.min(this._indexOfLastAttachedContextDeletedWithKeyboard,this.attachedContext.size-1)&&c.focus(),this.attachedContextDisposables.add(c),c.icon=w.close;const s=c.onDidClick(u=>{if(this._attachedContext.delete(i),s.dispose(),d.isKeyboardEvent(u)){const a=new q(u);(a.equals(A.Enter)||a.equals(A.Space))&&(this._indexOfLastAttachedContextDeletedWithKeyboard=o)}this._onDidChangeHeight.fire(),this._onDidChangeContext.fire({removed:[i]})});this.attachedContextDisposables.add(s)}),e!==t.offsetHeight&&this._onDidChangeHeight.fire()}async renderFollowups(t,e){this.options.renderFollowups&&(this.followupsDisposables.clear(),d.clearNode(this.followupsContainer),t&&t.length>0&&this.followupsDisposables.add(this.instantiationService.createInstance(It,this.followupsContainer,t,this.location,void 0,i=>this._onDidAcceptFollowup.fire({followup:i,response:e}))),this._onDidChangeHeight.fire())}get contentHeight(){const t=this.getLayoutData();return t.followupsHeight+t.inputPartEditorHeight+t.inputPartVerticalPadding+t.inputEditorBorder+t.implicitContextHeight}layout(t,e){return this.cachedDimensions=new d.Dimension(e,t),this._layout(t,e)}previousInputEditorDimension;_layout(t,e,i=!0){this.initAttachedContext(this.attachedContextContainer);const o=this.getLayoutData(),n=Math.min(o.inputPartEditorHeight,t-o.followupsHeight-o.inputPartVerticalPadding),p=e-o.inputPartHorizontalPadding;this.followupsContainer.style.width=`${p}px`,this._inputPartHeight=o.followupsHeight+n+o.inputPartVerticalPadding+o.inputEditorBorder+o.implicitContextHeight;const l=this._inputEditor.getScrollWidth(),c={width:e-o.inputPartHorizontalPadding-o.editorBorder-o.editorPadding-o.executeToolbarWidth-o.sideToolbarWidth-o.toolbarPadding,height:n};if((!this.previousInputEditorDimension||this.previousInputEditorDimension.width!==c.width||this.previousInputEditorDimension.height!==c.height)&&(this._inputEditor.layout(c),this.previousInputEditorDimension=c),i&&l<10)return this._layout(t,e,!1)}getLayoutData(){return{inputEditorBorder:2,followupsHeight:this.followupsContainer.offsetHeight,inputPartEditorHeight:Math.min(this._inputEditor.getContentHeight(),this.inputEditorMaxHeight),inputPartHorizontalPadding:this.options.renderStyle==="compact"?12:40,inputPartVerticalPadding:this.options.renderStyle==="compact"?12:24,implicitContextHeight:this.attachedContextContainer.offsetHeight,editorBorder:2,editorPadding:12,toolbarPadding:(this.toolbar.getItemsLength()-1)*4,executeToolbarWidth:this.cachedToolbarWidth=this.toolbar.getItemsWidth(),sideToolbarWidth:this.inputSideToolbarContainer?d.getTotalWidth(this.inputSideToolbarContainer)+4:0}}saveState(){this.saveCurrentValue(this.getInputState());const t=[...this.history];this.historyService.saveHistory(this.location,t)}};I=x([h(3,Tt),h(4,tt),h(5,ut),h(6,D),h(7,dt),h(8,F),h(9,M),h(10,gt)],I);const O=g=>JSON.stringify(g);function B(g){return{lineNumber:g.getLineCount(),column:g.getLineLength(g.getLineCount())+1}}let S=class extends ot{constructor(v,t,e,i,o,n,p,l,f,c){super(v,t,[],"",i,{getKeyBinding:a=>p.lookupKeybinding(a.id,n)},p,l,n,f,c);const s=e.createMenu(at.ChatExecuteSecondary,n),u=()=>{const a=[];nt(s,{shouldForwardArgs:!0},a);const y=o.getSecondaryAgent();y&&a.forEach(r=>(r.id===bt.ID&&(r.label=b("chat.submitToSecondaryAgent","Send to @{0}",y.name)),r)),this.update(t,a)};u(),this._register(s.onDidChange(()=>u()))}};S=x([h(2,st),h(3,ht),h(4,St),h(5,D),h(6,F),h(7,mt),h(8,ft),h(9,M)],S);const K=".interactive-input-editor";Mt(K);export{I as ChatInputPart};