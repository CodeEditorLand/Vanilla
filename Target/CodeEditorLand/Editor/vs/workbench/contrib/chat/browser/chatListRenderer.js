var ie=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var E=(P,u,e,r)=>{for(var t=r>1?void 0:r?se(u,e):u,n=P.length-1,o;n>=0;n--)(o=P[n])&&(t=(r?o(u,e,t):o(t))||t);return r&&t&&ie(u,e,t),t},I=(P,u)=>(e,r)=>u(e,r,P);import*as d from"../../../../base/browser/dom.js";import{renderFormattedText as ae}from"../../../../base/browser/formattedTextRenderer.js";import{StandardKeyboardEvent as de}from"../../../../base/browser/keyboardEvent.js";import{DropdownMenuActionViewItem as ce}from"../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";import{getDefaultHoverDelegate as he}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{coalesce as le,distinct as Ce}from"../../../../base/common/arrays.js";import{Codicon as A}from"../../../../base/common/codicons.js";import{Emitter as k}from"../../../../base/common/event.js";import{MarkdownString as H}from"../../../../base/common/htmlContent.js";import{KeyCode as _}from"../../../../base/common/keyCodes.js";import{Disposable as ue,DisposableStore as K,dispose as q,toDisposable as V}from"../../../../base/common/lifecycle.js";import{ResourceMap as pe}from"../../../../base/common/map.js";import{FileAccess as Ie}from"../../../../base/common/network.js";import{clamp as fe}from"../../../../base/common/numbers.js";import{autorun as me}from"../../../../base/common/observable.js";import{ThemeIcon as j}from"../../../../base/common/themables.js";import{URI as ge}from"../../../../base/common/uri.js";import{localize as f}from"../../../../nls.js";import{createActionViewItem as ve}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{MenuWorkbenchToolBar as Re}from"../../../../platform/actions/browser/toolbar.js";import{MenuId as ye,MenuItemAction as Te}from"../../../../platform/actions/common/actions.js";import{ICommandService as z}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as we}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as O}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as Pe}from"../../../../platform/contextview/browser/contextView.js";import{IHoverService as Se}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as be}from"../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as X}from"../../../../platform/instantiation/common/serviceCollection.js";import{ILogService as x}from"../../../../platform/log/common/log.js";import{ColorScheme as Ee}from"../../../../platform/theme/common/theme.js";import{IThemeService as ke}from"../../../../platform/theme/common/themeService.js";import{IWorkbenchIssueService as Le}from"../../issue/common/issue.js";import{annotateSpecialMarkdownContent as G}from"../common/annotations.js";import{CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING as De,CONTEXT_REQUEST as Me,CONTEXT_RESPONSE as Ae,CONTEXT_RESPONSE_DETECTED_AGENT_COMMAND as He,CONTEXT_RESPONSE_ERROR as _e,CONTEXT_RESPONSE_FILTERED as Ve,CONTEXT_RESPONSE_VOTE as J}from"../common/chatContextKeys.js";import{chatSubcommandLeader as Oe}from"../common/chatParserTypes.js";import{ChatAgentVoteDirection as Q,ChatAgentVoteDownReason as C}from"../common/chatService.js";import{isRequestVM as y,isResponseVM as h,isWelcomeVM as xe}from"../common/chatViewModel.js";import{getNWords as Fe}from"../common/chatWordCounter.js";import{MarkUnhelpfulActionId as L}from"./actions/chatTitleActions.js";import{GeneratingPhrase as Ne}from"./chat.js";import{ChatAgentHover as We,getChatAgentHoverOptions as Be}from"./chatAgentHover.js";import{ChatAttachmentsContentPart as $e}from"./chatContentParts/chatAttachmentsContentPart.js";import{ChatCodeCitationContentPart as Ue}from"./chatContentParts/chatCodeCitationContentPart.js";import{ChatCommandButtonContentPart as Ke}from"./chatContentParts/chatCommandContentPart.js";import{ChatConfirmationContentPart as qe}from"./chatContentParts/chatConfirmationContentPart.js";import{ChatMarkdownContentPart as Y,EditorPool as je}from"./chatContentParts/chatMarkdownContentPart.js";import{ChatProgressContentPart as ze}from"./chatContentParts/chatProgressContentPart.js";import{ChatCollapsibleListContentPart as Xe,CollapsibleListPool as Ge}from"./chatContentParts/chatReferencesContentPart.js";import{ChatTaskContentPart as Je}from"./chatContentParts/chatTaskContentPart.js";import{ChatTextEditContentPart as Qe,DiffEditorPool as Ye}from"./chatContentParts/chatTextEditContentPart.js";import{ChatTreeContentPart as Z,TreePool as Ze}from"./chatContentParts/chatTreeContentPart.js";import{ChatWarningContentPart as ee}from"./chatContentParts/chatWarningContentPart.js";import{ChatFollowups as et}from"./chatFollowups.js";import{ChatMarkdownDecorationsRenderer as tt}from"./chatMarkdownDecorationsRenderer.js";import{ChatMarkdownRenderer as rt}from"./chatMarkdownRenderer.js";import{ChatCodeBlockContentProvider as nt}from"./codeBlockPart.js";const m=d.$,te=!1;let w=class extends ue{constructor(e,r,t,n,o,a,s,c,i,p,l,v,F){super();this.location=r;this.rendererOptions=t;this.delegate=n;this.codeBlockModelCollection=o;this.instantiationService=s;this.logService=i;this.contextKeyService=p;this.themeService=l;this.commandService=v;this.hoverService=F;this.renderer=this._register(this.instantiationService.createInstance(rt,void 0)),this.markdownDecorationsRenderer=this.instantiationService.createInstance(tt),this._editorPool=this._register(this.instantiationService.createInstance(je,e,n,a)),this._diffEditorPool=this._register(this.instantiationService.createInstance(Ye,e,n,a)),this._treePool=this._register(this.instantiationService.createInstance(Ze,this._onDidChangeVisibility.event)),this._contentReferencesListPool=this._register(this.instantiationService.createInstance(Ge,this._onDidChangeVisibility.event)),this._register(this.instantiationService.createInstance(nt))}static ID="item";codeBlocksByResponseId=new Map;codeBlocksByEditorUri=new pe;fileTreesByResponseId=new Map;focusedFileTreesByResponseId=new Map;renderer;markdownDecorationsRenderer;_onDidClickFollowup=this._register(new k);onDidClickFollowup=this._onDidClickFollowup.event;_onDidClickRerunWithAgentOrCommandDetection=new k;onDidClickRerunWithAgentOrCommandDetection=this._onDidClickRerunWithAgentOrCommandDetection.event;_onDidChangeItemHeight=this._register(new k);onDidChangeItemHeight=this._onDidChangeItemHeight.event;_editorPool;_diffEditorPool;_treePool;_contentReferencesListPool;_currentLayoutWidth=0;_isVisible=!0;_onDidChangeVisibility=this._register(new k);get templateId(){return w.ID}editorsInUse(){return this._editorPool.inUse()}traceLayout(e,r){te?this.logService.info(`ChatListItemRenderer#${e}: ${r}`):this.logService.trace(`ChatListItemRenderer#${e}: ${r}`)}getProgressiveRenderRate(e){if(e.isComplete)return 80;if(e.contentUpdateTimings&&e.contentUpdateTimings.impliedWordLoadRate){const n=e.contentUpdateTimings.impliedWordLoadRate;return fe(n,5,80)}return 8}getCodeBlockInfosForResponse(e){return this.codeBlocksByResponseId.get(e.id)??[]}getCodeBlockInfoForEditor(e){return this.codeBlocksByEditorUri.get(e)}getFileTreeInfosForResponse(e){return this.fileTreesByResponseId.get(e.id)??[]}getLastFocusedFileTreeForResponse(e){const r=this.fileTreesByResponseId.get(e.id),t=this.focusedFileTreesByResponseId.get(e.id);if(r?.length&&t!==void 0&&t<r.length)return r[t]}setVisible(e){this._isVisible=e,this._onDidChangeVisibility.fire(e)}layout(e){this._currentLayoutWidth=e-(this.rendererOptions.noPadding?0:40);for(const r of this._editorPool.inUse())r.layout(this._currentLayoutWidth);for(const r of this._diffEditorPool.inUse())r.layout(this._currentLayoutWidth)}renderTemplate(e){const r=new K,t=d.append(e,m(".interactive-item-container"));this.rendererOptions.renderStyle==="compact"&&t.classList.add("interactive-item-compact"),this.rendererOptions.noPadding&&t.classList.add("no-padding");let n=t,o=t,a,s;if(this.rendererOptions.renderStyle==="minimal"){t.classList.add("interactive-item-compact"),t.classList.add("minimal");const g=d.append(t,m(".column.left")),R=d.append(t,m(".column.right"));n=g,a=R,o=R,s=d.append(t,m(".header"))}const c=d.append(n,m(".header")),i=d.append(c,m(".user"));i.tabIndex=0,i.role="toolbar";const p=d.append(i,m(".avatar-container")),l=d.append(i,m("h3.username")),v=d.append(a??i,m("span.detail-container")),F=d.append(v,m("span.detail"));d.append(v,m("span.chat-animated-ellipsis"));const ne=d.append(o,m(".value")),oe=new K,N=r.add(this.contextKeyService.createScoped(t)),b=r.add(this.instantiationService.createChild(new X([O,N])));let W;this.rendererOptions.noHeader?c.classList.add("hidden"):W=r.add(b.createInstance(Re,s??c,ye.ChatMessageTitle,{menuOptions:{shouldForwardArgs:!0},toolbarOptions:{shouldInlineSubmenu:g=>g.actions.length<=1},actionViewItemProvider:(g,R)=>g instanceof Te&&g.item.id===L?b.createInstance(S,g,R):ve(b,g,R)}));const M=r.add(this.instantiationService.createInstance(We)),B=()=>{if(h(T.currentElement)&&T.currentElement.agent&&!T.currentElement.agent.isDefault)return M.setAgent(T.currentElement.agent.id),M.domNode},$=Be(()=>h(T.currentElement)?T.currentElement.agent:void 0,this.commandService);r.add(this.hoverService.setupManagedHover(he("element"),i,B,$)),r.add(d.addDisposableListener(i,d.EventType.KEY_DOWN,g=>{const R=new de(g);if(R.equals(_.Space)||R.equals(_.Enter)){const U=B();U&&this.hoverService.showHover({content:U,target:i,trapFocus:!0,actions:$.actions},!0)}else R.equals(_.Escape)&&this.hoverService.hideHover()}));const T={avatarContainer:p,username:l,detail:F,value:ne,rowContainer:t,elementDisposables:oe,templateDisposables:r,contextKeyService:N,instantiationService:b,agentHover:M,titleToolbar:W};return T}renderElement(e,r,t){this.renderChatTreeItem(e.element,r,t)}renderChatTreeItem(e,r,t){t.currentElement=e;const n=y(e)?"request":h(e)?"response":"welcome";this.traceLayout("renderElement",`${n}, index=${r}`),Ae.bindTo(t.contextKeyService).set(h(e)),Me.bindTo(t.contextKeyService).set(y(e)),He.bindTo(t.contextKeyService).set(h(e)&&e.agentOrSlashCommandDetected),h(e)?(De.bindTo(t.contextKeyService).set(!!e.agent?.metadata.supportIssueReporting),J.bindTo(t.contextKeyService).set(e.vote===Q.Up?"up":e.vote===Q.Down?"down":"")):J.bindTo(t.contextKeyService).set(""),t.titleToolbar&&(t.titleToolbar.context=e),_e.bindTo(t.contextKeyService).set(h(e)&&!!e.errorDetails);const o=!!(h(e)&&e.errorDetails?.responseIsFiltered);if(Ve.bindTo(t.contextKeyService).set(o),t.rowContainer.classList.toggle("interactive-request",y(e)),t.rowContainer.classList.toggle("interactive-response",h(e)),t.rowContainer.classList.toggle("interactive-welcome",xe(e)),t.rowContainer.classList.toggle("show-detail-progress",h(e)&&!e.isComplete&&!e.progressMessages.length),t.username.textContent=e.username,this.rendererOptions.noHeader||this.renderAvatar(e,t),d.clearNode(t.detail),h(e)&&this.renderDetail(e,t),y(e)&&e.confirmation&&this.renderConfirmationAction(e,t),h(e)&&r===this.delegate.getListLength()-1&&(!e.isComplete||e.renderData)&&e.response.value.length){this.traceLayout("renderElement",`start progressive render ${n}, index=${r}`);const a=t.elementDisposables.add(new d.WindowIntervalTimer),s=c=>{try{this.doNextProgressiveRender(e,r,t,!!c)&&a.cancel()}catch(i){a.cancel(),this.logService.error(i)}};a.cancelAndSet(s,50,d.getWindow(t.rowContainer)),s(!0)}else h(e)?this.basicRenderElement(e,r,t):y(e)?this.basicRenderElement(e,r,t):this.renderWelcomeMessage(e,t)}renderDetail(e,r){r.elementDisposables.add(me(t=>{this._renderDetail(e,r)}))}_renderDetail(e,r){if(d.clearNode(r.detail),e.agentOrSlashCommandDetected){const t=e.slashCommand?f("usedAgentSlashCommand","used {0} [[(rerun without)]]",`${Oe}${e.slashCommand.name}`):f("usedAgent","[[(rerun without)]]");d.reset(r.detail,ae(t,{className:"agentOrSlashCommandDetected",inline:!0,actionHandler:{disposables:r.elementDisposables,callback:n=>{this._onDidClickRerunWithAgentOrCommandDetection.fire(e)}}}))}else e.isComplete||(r.detail.textContent=Ne)}renderConfirmationAction(e,r){d.clearNode(r.detail),e.confirmation&&(r.detail.textContent=f("chatConfirmationAction",'selected "{0}"',e.confirmation))}renderAvatar(e,r){const t=h(e)?this.getAgentIcon(e.agent?.metadata):e.avatarIcon??A.account;if(t instanceof ge){const n=d.$("img.icon");n.src=Ie.uriToBrowserUri(t).toString(!0),r.avatarContainer.replaceChildren(d.$(".avatar",void 0,n))}else{const n=d.$(j.asCSSSelector(t));r.avatarContainer.replaceChildren(d.$(".avatar.codicon-avatar",void 0,n))}}getAgentIcon(e){return e?.themeIcon?e.themeIcon:e?.iconDark&&this.themeService.getColorTheme().type===Ee.DARK?e.iconDark:e?.icon?e.icon:A.copilot}basicRenderElement(e,r,t){let n=[];if(y(e)&&!e.confirmation){const i="message"in e.message?e.message.message:this.markdownDecorationsRenderer.convertParsedRequestToMarkdown(e.message);n=[{content:new H(i),kind:"markdownContent"}]}else h(e)&&(e.contentReferences.length&&n.push({kind:"references",references:e.contentReferences}),n.push(...G(e.response.value)),e.codeCitations.length&&n.push({kind:"codeCitations",citations:e.codeCitations}));d.clearNode(t.value),h(e)&&this.renderDetail(e,t);const o=!!(h(e)&&e.errorDetails?.responseIsFiltered),a=[];if(o||n.forEach((i,p)=>{const l={element:e,index:p,content:n,preceedingContentParts:a},v=this.renderChatContentPart(i,t,l);v&&(t.value.appendChild(v.domNode),a.push(v))}),t.renderedParts&&q(t.renderedParts),t.renderedParts=a,!o&&y(e)&&e.variables.length){const i=this.renderAttachments(e.variables,e.contentReferences,t);i&&(t.value.appendChild(i.domNode),t.elementDisposables.add(i))}if(h(e)&&e.errorDetails?.message){const i=this.instantiationService.createInstance(ee,e.errorDetails.responseIsFiltered?"info":"error",new H(e.errorDetails.message),this.renderer);t.elementDisposables.add(i),t.value.appendChild(i.domNode)}const s=t.rowContainer.offsetHeight,c=!e.currentRenderedHeight||e.currentRenderedHeight!==s;if(e.currentRenderedHeight=s,c){const i=t.elementDisposables.add(d.scheduleAtNextAnimationFrame(d.getWindow(t.value),()=>{e.currentRenderedHeight=t.rowContainer.offsetHeight,i.dispose(),this._onDidChangeItemHeight.fire({element:e,height:e.currentRenderedHeight})}))}}updateItemHeight(e){if(!e.currentElement)return;const r=e.rowContainer.offsetHeight;e.currentElement.currentRenderedHeight=r,this._onDidChangeItemHeight.fire({element:e.currentElement,height:r})}renderWelcomeMessage(e,r){d.clearNode(r.value),e.content.forEach((o,a)=>{if(Array.isArray(o)){const s=r.elementDisposables.add(this.instantiationService.createChild(new X([O,r.contextKeyService])));r.elementDisposables.add(s.createInstance(et,r.value,o,this.location,void 0,c=>this._onDidClickFollowup.fire(c)))}else{const s={element:e,index:a,content:[],preceedingContentParts:[]},c=this.renderMarkdown(o,r,s);r.value.appendChild(c.domNode),r.elementDisposables.add(c)}});const t=r.rowContainer.offsetHeight,n=!e.currentRenderedHeight||e.currentRenderedHeight!==t;if(e.currentRenderedHeight=t,n){const o=r.elementDisposables.add(d.scheduleAtNextAnimationFrame(d.getWindow(r.value),()=>{e.currentRenderedHeight=r.rowContainer.offsetHeight,o.dispose(),this._onDidChangeItemHeight.fire({element:e,height:e.currentRenderedHeight})}))}}doNextProgressiveRender(e,r,t,n){if(!this._isVisible)return!0;if(e.isCanceled)return this.traceLayout("doNextProgressiveRender",`canceled, index=${r}`),e.renderData=void 0,this.basicRenderElement(e,r,t),!0;let o=!1;this.traceLayout("doNextProgressiveRender",`START progressive render, index=${r}, renderData=${JSON.stringify(e.renderData)}`);const a=this.getNextProgressiveRenderContent(e),s=this.diff(t.renderedParts??[],a,e);if(o=s.every(i=>i===null),o)return e.isComplete?(this.traceLayout("doNextProgressiveRender",`END progressive render, index=${r} and clearing renderData, response is complete`),e.renderData=void 0,this.basicRenderElement(e,r,t),!0):(this.traceLayout("doNextProgressiveRender","caught up with the stream- no new content to render"),!1);this.traceLayout("doNextProgressiveRender",`doing progressive render, ${s.length} parts to render`),this.renderChatContentDiff(s,a,e,t);const c=t.rowContainer.offsetHeight;return e.currentRenderedHeight=c,n||this._onDidChangeItemHeight.fire({element:e,height:t.rowContainer.offsetHeight}),!1}renderChatContentDiff(e,r,t,n){const o=n.renderedParts??[];n.renderedParts=o,e.forEach((a,s)=>{if(!a)return;const c=n.renderedParts?.[s];c&&c.dispose();const i=o.slice(0,s),p={element:t,content:r,preceedingContentParts:i,index:s},l=this.renderChatContentPart(a,n,p);if(l){if(c)try{c.domNode.replaceWith(l.domNode)}catch(v){this.logService.error("ChatListItemRenderer#renderChatContentDiff: error replacing part",v)}else n.value.appendChild(l.domNode);o[s]=l}else c&&c.domNode.remove()})}getNextProgressiveRenderContent(e){const r=this.getDataForProgressiveRender(e),t=G(e.response.value);this.traceLayout("getNextProgressiveRenderContent",`Want to render ${r.numWordsToRender} at ${r.rate} words/s, counting...`);let n=r.numWordsToRender;const o=[];e.contentReferences.length&&o.push({kind:"references",references:e.contentReferences});for(let i=0;i<t.length;i++){const p=t[i];if(n<=0)break;if(p.kind==="markdownContent"){const l=Fe(p.content.value,n);l.isFullString?o.push(p):o.push({kind:"markdownContent",content:new H(l.value,p.content)}),this.traceLayout("getNextProgressiveRenderContent",`  Chunk ${i}: Want to render ${n} words and found ${l.returnedWordCount} words. Total words in chunk: ${l.totalWordCount}`),n-=l.returnedWordCount}else o.push(p)}const a=e.contentUpdateTimings?.lastWordCount??0,s=r.numWordsToRender-n,c=a-s;return this.traceLayout("getNextProgressiveRenderContent",`Want to render ${r.numWordsToRender} words. Rendering ${s} words. Buffer: ${c} words`),s>0&&s!==e.renderData?.renderedWordCount&&(e.renderData={lastRenderTime:Date.now(),renderedWordCount:s,renderedParts:o}),o}getDataForProgressiveRender(e){const r=e.renderData??{lastRenderTime:0,renderedWordCount:0},t=this.getProgressiveRenderRate(e);return{numWordsToRender:r.lastRenderTime===0?1:r.renderedWordCount+Math.floor((Date.now()-r.lastRenderTime)/1e3*t),rate:t}}diff(e,r,t){const n=[];for(let o=0;o<r.length;o++){const a=r[o],s=e[o];!s||!s.hasSameContent(a,r.slice(o+1),t)?n.push(a):n.push(null)}return n}renderChatContentPart(e,r,t){if(e.kind==="treeData")return this.renderTreeData(e,r,t);if(e.kind==="progressMessage")return this.instantiationService.createInstance(ze,e,this.renderer,t);if(e.kind==="progressTask")return this.renderProgressTask(e,r,t);if(e.kind==="command")return this.instantiationService.createInstance(Ke,e,t);if(e.kind==="textEditGroup")return this.renderTextEdit(t,e,r);if(e.kind==="confirmation")return this.renderConfirmation(t,e,r);if(e.kind==="warning")return this.instantiationService.createInstance(ee,"warning",e.content,this.renderer);if(e.kind==="markdownContent")return this.renderMarkdown(e.content,r,t);if(e.kind==="references")return this.renderContentReferencesListData(e,void 0,t,r);if(e.kind==="codeCitations")return this.renderCodeCitationsListData(e,t,r)}renderTreeData(e,r,t){const n=e.treeData,o=t.preceedingContentParts.filter(s=>s instanceof Z).length,a=this.instantiationService.createInstance(Z,n,t.element,this._treePool,o);if(a.addDisposable(a.onDidChangeHeight(()=>{this.updateItemHeight(r)})),h(t.element)){const s={treeDataId:n.uri.toString(),treeIndex:o,focus(){a.domFocus()}};a.addDisposable(a.onDidFocus(()=>{this.focusedFileTreesByResponseId.set(t.element.id,s.treeIndex)}));const c=this.fileTreesByResponseId.get(t.element.id)??[];c.push(s),this.fileTreesByResponseId.set(t.element.id,Ce(c,i=>i.treeDataId)),a.addDisposable(V(()=>this.fileTreesByResponseId.set(t.element.id,c.filter(i=>i.treeDataId!==n.uri.toString()))))}return a}renderContentReferencesListData(e,r,t,n){const o=this.instantiationService.createInstance(Xe,e.references,r,t.element,this._contentReferencesListPool);return o.addDisposable(o.onDidChangeHeight(()=>{this.updateItemHeight(n)})),o}renderCodeCitationsListData(e,r,t){return this.instantiationService.createInstance(Ue,e,r)}renderProgressTask(e,r,t){if(!h(t.element))return;const n=this.instantiationService.createInstance(Je,e,this._contentReferencesListPool,this.renderer,t);return n.addDisposable(n.onDidChangeHeight(()=>{this.updateItemHeight(r)})),n}renderConfirmation(e,r,t){const n=this.instantiationService.createInstance(qe,r,e);return n.addDisposable(n.onDidChangeHeight(()=>this.updateItemHeight(t))),n}renderAttachments(e,r,t){return this.instantiationService.createInstance($e,e,r,void 0)}renderTextEdit(e,r,t){const n=this.instantiationService.createInstance(Qe,r,e,this.rendererOptions,this._diffEditorPool,this._currentLayoutWidth);return n.addDisposable(n.onDidChangeHeight(()=>{n.layout(this._currentLayoutWidth),this.updateItemHeight(t)})),n}renderMarkdown(e,r,t){const n=t.element,o=h(n)&&(!n.isComplete||n.isCanceled||n.errorDetails?.responseIsFiltered||n.errorDetails?.responseIsIncomplete||!!n.renderData),a=t.preceedingContentParts.reduce((i,p)=>i+(p instanceof Y?p.codeblocks.length:0),0),s=this.instantiationService.createInstance(Y,e,t,this._editorPool,o,a,this.renderer,this._currentLayoutWidth,this.codeBlockModelCollection,this.rendererOptions);s.addDisposable(s.onDidChangeHeight(()=>{s.layout(this._currentLayoutWidth),this.updateItemHeight(r)}));const c=this.codeBlocksByResponseId.get(n.id)??[];return this.codeBlocksByResponseId.set(n.id,c),s.addDisposable(V(()=>{const i=this.codeBlocksByResponseId.get(n.id);i&&s.codeblocks.forEach((p,l)=>delete i[a+l])})),s.codeblocks.forEach((i,p)=>{if(c[a+p]=i,i.uri){const l=i.uri;this.codeBlocksByEditorUri.set(l,i),s.addDisposable(V(()=>this.codeBlocksByEditorUri.delete(l)))}}),s}disposeElement(e,r,t){if(this.traceLayout("disposeElement",`Disposing element, index=${r}`),t.renderedParts)try{q(le(t.renderedParts)),t.renderedParts=void 0,d.clearNode(t.value)}catch(n){throw n}t.currentElement=void 0,t.elementDisposables.clear()}disposeTemplate(e){e.templateDisposables.dispose()}};w=E([I(6,be),I(7,we),I(8,x),I(9,O),I(10,ke),I(11,z),I(12,Se)],w);let D=class{constructor(u,e){this.defaultElementHeight=u;this.logService=e}_traceLayout(u,e){te?this.logService.info(`ChatListDelegate#${u}: ${e}`):this.logService.trace(`ChatListDelegate#${u}: ${e}`)}getHeight(u){const e=y(u)?"request":"response",r=("currentRenderedHeight"in u?u.currentRenderedHeight:void 0)??this.defaultElementHeight;return this._traceLayout("getHeight",`${e}, height=${r}`),r}getTemplateId(u){return w.ID}hasDynamicHeight(u){return!0}};D=E([I(1,x)],D);const re={[C.IncorrectCode]:f("incorrectCode","Suggested incorrect code"),[C.DidNotFollowInstructions]:f("didNotFollowInstructions","Didn't follow instructions"),[C.MissingContext]:f("missingContext","Missing context"),[C.OffensiveOrUnsafe]:f("offensiveOrUnsafe","Offensive or unsafe"),[C.PoorlyWrittenOrFormatted]:f("poorlyWrittenOrFormatted","Poorly written or formatted"),[C.RefusedAValidRequest]:f("refusedAValidRequest","Refused a valid request"),[C.IncompleteCode]:f("incompleteCode","Incomplete code"),[C.WillReportIssue]:f("reportIssue","Report an issue"),[C.Other]:f("other","Other")};let S=class extends ce{constructor(e,r,t,n,o,a){super(e,{getActions:()=>this.getActions()},a,{...r,classNames:j.asClassNameArray(A.thumbsdown)});this.commandService=t;this.issueService=n;this.logService=o}getActions(){return[this.getVoteDownDetailAction(C.IncorrectCode),this.getVoteDownDetailAction(C.DidNotFollowInstructions),this.getVoteDownDetailAction(C.IncompleteCode),this.getVoteDownDetailAction(C.MissingContext),this.getVoteDownDetailAction(C.PoorlyWrittenOrFormatted),this.getVoteDownDetailAction(C.RefusedAValidRequest),this.getVoteDownDetailAction(C.OffensiveOrUnsafe),this.getVoteDownDetailAction(C.Other),{id:"reportIssue",label:re[C.WillReportIssue],tooltip:"",enabled:!0,class:void 0,run:async e=>{if(!h(e)){this.logService.error("ChatVoteDownButton#run: invalid context");return}await this.commandService.executeCommand(L,e,C.WillReportIssue),await this.issueService.openReporter({extensionId:e.agent?.extensionId.value})}}]}render(e){super.render(e),this.element?.classList.toggle("checked",this.action.checked)}getVoteDownDetailAction(e){const r=re[e];return{id:L,label:r,tooltip:"",enabled:!0,checked:this._context.voteDownReason===e,class:void 0,run:async t=>{if(!h(t)){this.logService.error("ChatVoteDownButton#getVoteDownDetailAction: invalid context");return}await this.commandService.executeCommand(L,t,e)}}}};S=E([I(2,z),I(3,Le),I(4,x),I(5,Pe)],S);export{D as ChatListDelegate,w as ChatListItemRenderer,S as ChatVoteDownButton};
