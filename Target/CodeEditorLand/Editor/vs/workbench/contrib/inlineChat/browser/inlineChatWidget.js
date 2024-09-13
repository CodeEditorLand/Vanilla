var te=Object.defineProperty;var ie=Object.getOwnPropertyDescriptor;var y=(g,e,t,i)=>{for(var s=i>1?void 0:i?ie(e,t):e,n=g.length-1,a;n>=0;n--)(a=g[n])&&(s=(i?a(e,t,s):a(s))||s);return i&&s&&te(e,t,s),s},r=(g,e)=>(t,i)=>e(t,i,g);import{getActiveElement as se,getTotalHeight as N,h,reset as w,trackFocus as oe}from"../../../../base/browser/dom.js";import{getDefaultHoverDelegate as ne}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{renderLabelWithIcons as F}from"../../../../base/browser/ui/iconLabel/iconLabels.js";import{isNonEmptyArray as re,tail as ae}from"../../../../base/common/arrays.js";import{Emitter as B,Event as de}from"../../../../base/common/event.js";import{MarkdownString as le}from"../../../../base/common/htmlContent.js";import{DisposableStore as K,MutableDisposable as he,toDisposable as ce}from"../../../../base/common/lifecycle.js";import{constObservable as E,derived as ue,observableValue as P}from"../../../../base/common/observable.js";import"./media/inlineChat.css";import{AccessibleDiffViewer as ge}from"../../../../editor/browser/widget/diffEditor/components/accessibleDiffViewer.js";import{EditorOption as pe}from"../../../../editor/common/config/editorOptions.js";import{LineRange as q}from"../../../../editor/common/core/lineRange.js";import{Selection as me}from"../../../../editor/common/core/selection.js";import{DetailedLineRangeMapping as _e,RangeMapping as fe}from"../../../../editor/common/diff/rangeMapping.js";import{ScrollType as Ie}from"../../../../editor/common/editorCommon.js";import{ITextModelService as j}from"../../../../editor/common/services/resolverService.js";import{localize as L}from"../../../../nls.js";import{IAccessibleViewService as U}from"../../../../platform/accessibility/browser/accessibleView.js";import{IAccessibilityService as X}from"../../../../platform/accessibility/common/accessibility.js";import{MenuWorkbenchButtonBar as ve}from"../../../../platform/actions/browser/buttonbar.js";import{createActionViewItem as be}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{MenuWorkbenchToolBar as Ce}from"../../../../platform/actions/browser/toolbar.js";import{MenuId as x,MenuItemAction as ye}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as G}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as O}from"../../../../platform/contextkey/common/contextkey.js";import{IHoverService as $}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as W}from"../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as Se}from"../../../../platform/instantiation/common/serviceCollection.js";import{IKeybindingService as z}from"../../../../platform/keybinding/common/keybinding.js";import{asCssVariable as Me,asCssVariableName as we,editorBackground as Ee,inputBackground as Le}from"../../../../platform/theme/common/colorRegistry.js";import{AccessibilityVerbositySettingId as R}from"../../accessibility/browser/accessibilityConfiguration.js";import{AccessibilityCommandId as xe}from"../../accessibility/common/accessibilityCommands.js";import{MarkUnhelpfulActionId as Oe}from"../../chat/browser/actions/chatTitleActions.js";import{ChatVoteDownButton as We}from"../../chat/browser/chatListRenderer.js";import{ChatWidget as Re}from"../../chat/browser/chatWidget.js";import{ChatAgentLocation as He}from"../../chat/common/chatAgents.js";import{chatRequestBackground as Ve}from"../../chat/common/chatColors.js";import{CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING as De,CONTEXT_RESPONSE as Ae,CONTEXT_RESPONSE_ERROR as Te,CONTEXT_RESPONSE_FILTERED as ke,CONTEXT_RESPONSE_VOTE as Ne}from"../../chat/common/chatContextKeys.js";import{ChatModel as Fe}from"../../chat/common/chatModel.js";import{ChatAgentVoteDirection as J,IChatService as Q}from"../../chat/common/chatService.js";import{isResponseVM as c,isWelcomeVM as Be}from"../../chat/common/chatViewModel.js";import{CTX_INLINE_CHAT_FOCUSED as Ke,CTX_INLINE_CHAT_RESPONSE_FOCUSED as Pe,inlineChatBackground as Y,inlineChatForeground as qe}from"../common/inlineChat.js";let _=class{constructor(e,t,i,s,n,a,l,f,I,m,v){this._instantiationService=i;this._contextKeyService=s;this._keybindingService=n;this._accessibilityService=a;this._configurationService=l;this._accessibleViewService=f;this._textModelResolverService=I;this._chatService=m;this._hoverService=v;this.scopedContextKeyService=this._store.add(s.createScoped(this._elements.chatWidget));const p=i.createChild(new Se([O,this.scopedContextKeyService]),this._store);this._chatWidget=p.createInstance(Re,e,void 0,{defaultElementHeight:32,renderStyle:"minimal",renderInputOnTop:!1,renderFollowups:!0,supportsFileReferences:l.getValue(`chat.experimental.variables.${e.location}`)===!0,filter:o=>Be(o)?!1:c(o)&&o.isComplete&&!o.errorDetails?!(o.response.value.length>0&&o.response.value.every(d=>d.kind==="textEditGroup"&&t.chatWidgetViewOptions?.rendererOptions?.renderTextEditsAsSummary?.(d.uri))||o.response.value.length===0):!0,...t.chatWidgetViewOptions},{listForeground:qe,listBackground:Y,inputEditorBackground:Le,resultEditorBackground:Ee}),this._chatWidget.render(this._elements.chatWidget),this._elements.chatWidget.style.setProperty(we(Ve),Me(Y)),this._chatWidget.setVisible(!0),this._store.add(this._chatWidget);const b=Ae.bindTo(this.scopedContextKeyService),H=Ne.bindTo(this.scopedContextKeyService),V=De.bindTo(this.scopedContextKeyService),D=Te.bindTo(this.scopedContextKeyService),A=ke.bindTo(this.scopedContextKeyService),M=this._store.add(new K);this._store.add(this._chatWidget.onDidChangeViewModel(()=>{M.clear();const o=this._chatWidget.viewModel;o&&(M.add(ce(()=>{C.context=void 0,b.reset(),H.reset(),D.reset(),A.reset(),V.reset()})),M.add(o.onDidChange(()=>{const d=o.getItems().at(-1);C.context=d,b.set(c(d)),H.set(c(d)?d.vote===J.Down?"down":d.vote===J.Up?"up":"":""),D.set(c(d)&&d.errorDetails!==void 0),A.set(!!(c(d)&&d.errorDetails?.responseIsFiltered)),V.set(c(d)&&(d.agent?.metadata.supportIssueReporting??!1)),this._onDidChangeHeight.fire()})),this._onDidChangeHeight.fire())})),this._store.add(this.chatWidget.onDidChangeContentHeight(()=>{this._onDidChangeHeight.fire()})),this._ctxResponseFocused=Pe.bindTo(this._contextKeyService);const T=this._store.add(oe(this.domNode));this._store.add(T.onDidBlur(()=>this._ctxResponseFocused.set(!1))),this._store.add(T.onDidFocus(()=>this._ctxResponseFocused.set(!0))),this._ctxInputEditorFocused=Ke.bindTo(s),this._store.add(this._chatWidget.inputEditor.onDidFocusEditorWidget(()=>this._ctxInputEditorFocused.set(!0))),this._store.add(this._chatWidget.inputEditor.onDidBlurEditorWidget(()=>this._ctxInputEditorFocused.set(!1)));const Z=t.statusMenuId instanceof x?t.statusMenuId:t.statusMenuId.menu,ee=t.statusMenuId instanceof x?void 0:t.statusMenuId.options,k=p.createInstance(ve,this._elements.toolbar1,Z,{toolbarOptions:{primaryGroup:"0_main"},telemetrySource:t.chatWidgetViewOptions?.menus?.telemetrySource,menuOptions:{renderShortTitle:!0},...ee});this._store.add(k.onDidChange(()=>this._onDidChangeHeight.fire())),this._store.add(k);const C=p.createInstance(Ce,this._elements.toolbar2,t.secondaryMenuId??x.for(""),{telemetrySource:t.chatWidgetViewOptions?.menus?.telemetrySource,menuOptions:{renderShortTitle:!0,shouldForwardArgs:!0},actionViewItemProvider:(o,d)=>o instanceof ye&&o.item.id===Oe?p.createInstance(We,o,d):be(p,o,d)});this._store.add(C.onDidChangeMenuItems(()=>this._onDidChangeHeight.fire())),this._store.add(C),this._store.add(this._configurationService.onDidChangeConfiguration(o=>{o.affectsConfiguration(R.InlineChat)&&this._updateAriaLabel()})),this._elements.root.tabIndex=0,this._elements.statusLabel.tabIndex=0,this._updateAriaLabel(),this._store.add(this._hoverService.setupManagedHover(ne("element"),this._elements.statusLabel,()=>this._elements.statusLabel.dataset.title)),this._store.add(this._chatService.onDidPerformUserAction(o=>{o.sessionId===this._chatWidget.viewModel?.model.sessionId&&o.action.kind==="vote"&&this.updateStatus("Thank you for your feedback!",{resetAfter:1250})})),this._defaultChatModel=this._store.add(this._instantiationService.createInstance(Fe,void 0,He.Editor)),this._defaultChatModel.startInitialize(),this._defaultChatModel.initialize(void 0),this.setChatModel(this._defaultChatModel)}_elements=h("div.inline-chat@root",[h("div.chat-widget@chatWidget"),h("div.accessibleViewer@accessibleViewer"),h("div.status@status",[h("div.label.info.hidden@infoLabel"),h("div.actions.hidden@toolbar1"),h("div.label.status.hidden@statusLabel"),h("div.actions.secondary.hidden@toolbar2")])]);_store=new K;_defaultChatModel;_ctxInputEditorFocused;_ctxResponseFocused;_chatWidget;_onDidChangeHeight=this._store.add(new B);onDidChangeHeight=de.filter(this._onDidChangeHeight.event,e=>!this._isLayouting);_onDidChangeInput=this._store.add(new B);onDidChangeInput=this._onDidChangeInput.event;_isLayouting=!1;scopedContextKeyService;_updateAriaLabel(){if(this._elements.root.ariaLabel=this._accessibleViewService.getOpenAriaHint(R.InlineChat),this._accessibilityService.isScreenReaderOptimized()){let e=je;if(this._configurationService.getValue(R.InlineChat)){const t=this._keybindingService.lookupKeybinding(xe.OpenAccessibilityHelp)?.getLabel();e=t?L("inlineChat.accessibilityHelp","Inline Chat Input, Use {0} for Inline Chat Accessibility Help.",t):L("inlineChat.accessibilityHelpNoKb","Inline Chat Input, Run the Inline Chat Accessibility Help command for more information.")}this._chatWidget.inputEditor.updateOptions({ariaLabel:e})}}dispose(){this._store.dispose()}get domNode(){return this._elements.root}get chatWidget(){return this._chatWidget}saveState(){this._chatWidget.saveState()}layout(e){this._isLayouting=!0;try{this._doLayout(e)}finally{this._isLayouting=!1}}_doLayout(e){const t=this._getExtraHeight(),i=N(this._elements.status);this._elements.root.style.height=`${e.height-t}px`,this._elements.root.style.width=`${e.width}px`,this._chatWidget.layout(e.height-i-t,e.width)}get contentHeight(){const e={chatWidgetContentHeight:this._chatWidget.contentHeight,statusHeight:N(this._elements.status),extraHeight:this._getExtraHeight()};return e.chatWidgetContentHeight+e.statusHeight+e.extraHeight}get minHeight(){let e=100;for(const i of this._chatWidget.viewModel?.getItems()??[])if(c(i)&&i.response.value.some(s=>s.kind==="textEditGroup"&&!s.state?.applied)){e=270;break}let t=this.contentHeight;return t-=this._chatWidget.contentHeight,t+=Math.min(this._chatWidget.input.contentHeight+e,this._chatWidget.contentHeight),t}_getExtraHeight(){return 6}get value(){return this._chatWidget.getInput()}set value(e){this._chatWidget.setInput(e)}selectAll(e=!0){let t=1;if(!e){const i=/^(\/\w+)\s*/.exec(this._chatWidget.inputEditor.getModel().getLineContent(1));i&&(t=i[1].length+1)}this._chatWidget.inputEditor.setSelection(new me(1,t,Number.MAX_SAFE_INTEGER,1))}set placeholder(e){this._chatWidget.setInputPlaceholder(e)}toggleStatus(e){this._elements.toolbar1.classList.toggle("hidden",!e),this._elements.toolbar2.classList.toggle("hidden",!e),this._elements.status.classList.toggle("hidden",!e),this._elements.infoLabel.classList.toggle("hidden",!e),this._onDidChangeHeight.fire()}updateToolbar(e){this._elements.root.classList.toggle("toolbar",e),this._elements.toolbar1.classList.toggle("hidden",!e),this._elements.toolbar2.classList.toggle("hidden",!e),this._elements.status.classList.toggle("actions",e),this._elements.infoLabel.classList.toggle("hidden",e),this._onDidChangeHeight.fire()}async getCodeBlockInfo(e){const{viewModel:t}=this._chatWidget;if(!t)return;const i=t.getItems().filter(n=>c(n));if(!i.length)return;const s=i[i.length-1];return t.codeBlockModelCollection.get(t.sessionId,s,e)?.model}get responseContent(){const e=this._chatWidget.viewModel?.model.getRequests();if(re(e))return ae(e)?.response?.response.toString()}getChatModel(){return this._chatWidget.viewModel?.model??this._defaultChatModel}setChatModel(e){this._chatWidget.setModel(e,{inputValue:void 0})}updateChatMessage(e,t,i){if(!this._chatWidget.viewModel||this._chatWidget.viewModel.model!==this._defaultChatModel)return;const s=this._defaultChatModel;if(!e?.message.value){for(const a of s.getRequests())s.removeRequest(a.id);return}const n=s.addRequest({parts:[],text:""},{variables:[]},0);if(s.acceptResponseProgress(n,{kind:"markdownContent",content:e.message}),!t){s.completeResponse(n);return}return{cancel:()=>s.cancelRequest(n),complete:()=>s.completeResponse(n),appendContent:a=>{s.acceptResponseProgress(n,{kind:"markdownContent",content:new le(a)})}}}updateInfo(e){this._elements.infoLabel.classList.toggle("hidden",!e);const t=F(e);w(this._elements.infoLabel,...t),this._onDidChangeHeight.fire()}updateStatus(e,t={}){const i=typeof t.resetAfter=="number";if(i&&!this._elements.statusLabel.dataset.state){const n=this._elements.statusLabel.innerText,a=this._elements.statusLabel.dataset.title,l=Array.from(this._elements.statusLabel.classList.values());setTimeout(()=>{this.updateStatus(n,{classes:l,keepMessage:!0,title:a})},t.resetAfter)}const s=F(e);w(this._elements.statusLabel,...s),this._elements.statusLabel.className=`label status ${(t.classes??[]).join(" ")}`,this._elements.statusLabel.classList.toggle("hidden",!e),i?this._elements.statusLabel.dataset.state="temp":delete this._elements.statusLabel.dataset.state,t.title?this._elements.statusLabel.dataset.title=t.title:delete this._elements.statusLabel.dataset.title,this._onDidChangeHeight.fire()}reset(){this._chatWidget.setContext(!0),this._chatWidget.saveState(),this.updateChatMessage(void 0),w(this._elements.statusLabel),this._elements.statusLabel.classList.toggle("hidden",!0),this._elements.toolbar1.classList.add("hidden"),this._elements.toolbar2.classList.add("hidden"),this.updateInfo(""),this.chatWidget.setModel(this._defaultChatModel,{}),this._elements.accessibleViewer.classList.toggle("hidden",!0),this._onDidChangeHeight.fire()}focus(){this._chatWidget.focusInput()}hasFocus(){return this.domNode.contains(se())}};_=y([r(2,W),r(3,O),r(4,z),r(5,X),r(6,G),r(7,U),r(8,j),r(9,Q),r(10,$)],_);const je=L("aria-label","Inline Chat Input");let S=class extends _{constructor(t,i,s,n,a,l,f,I,m,v,p,b){super(t,{...s,chatWidgetViewOptions:{...s.chatWidgetViewOptions,editorOverflowWidgetsDomNode:i.getOverflowWidgetsDomNode()}},l,n,a,f,I,m,v,p,b);this._parentEditor=i}_accessibleViewer=this._store.add(new he);get contentHeight(){let t=super.contentHeight;return this._accessibleViewer.value&&(t+=this._accessibleViewer.value.height+8),t}_doLayout(t){let i=t.height;this._accessibleViewer.value&&(this._accessibleViewer.value.width=t.width-12,i-=this._accessibleViewer.value.height+8),super._doLayout(t.with(void 0,i)),this._elements.root.style.height=`${t.height-this._getExtraHeight()}px`}reset(){this._accessibleViewer.clear(),super.reset()}showAccessibleHunk(t,i){this._elements.accessibleViewer.classList.remove("hidden"),this._accessibleViewer.clear(),this._accessibleViewer.value=this._instantiationService.createInstance(u,this._elements.accessibleViewer,t,i,new Ue(this._parentEditor,t,i)),this._onDidChangeHeight.fire()}};S=y([r(3,O),r(4,z),r(5,W),r(6,X),r(7,G),r(8,U),r(9,j),r(10,Q),r(11,$)],S);let u=class extends ge{height;set width(e){this._width2.set(e,void 0)}_width2;constructor(e,t,i,s,n){const a=P("width",0),l=P("diff",u._asMapping(i)),f=ue(v=>[l.read(v)]),I=Math.min(10,8+l.get().changedLineCount),m=s.getModifiedOptions().get(pe.lineHeight)*I;super(e,E(!0),()=>{},E(!1),a,E(m),f,s,n),this.height=m,this._width2=a,this._store.add(t.textModelN.onDidChangeContent(()=>{l.set(u._asMapping(i),void 0)}))}static _asMapping(e){const t=e.getRanges0(),i=e.getRangesN(),s=q.fromRangeInclusive(t[0]),n=q.fromRangeInclusive(i[0]),a=[];for(let l=1;l<t.length;l++)a.push(new fe(t[l],i[l]));return new _e(s,n,a)}};u=y([r(4,W)],u);class Ue{constructor(e,t,i){this._editor=e;this._session=t;this._hunk=i}getOriginalModel(){return this._session.textModel0}getModifiedModel(){return this._session.textModelN}getOriginalOptions(){return this._editor.getOptions()}getModifiedOptions(){return this._editor.getOptions()}originalReveal(e){}modifiedReveal(e){this._editor.revealRangeInCenterIfOutsideViewport(e||this._hunk.getRangesN()[0],Ie.Smooth)}modifiedSetSelection(e){}modifiedFocus(){this._editor.focus()}getModifiedPosition(){return this._hunk.getRangesN()[0].getStartPosition()}}export{S as EditorBasedInlineChatWidget,_ as InlineChatWidget};
