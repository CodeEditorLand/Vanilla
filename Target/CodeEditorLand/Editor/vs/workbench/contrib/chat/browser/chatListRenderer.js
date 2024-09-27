var de=Object.defineProperty;var ce=Object.getOwnPropertyDescriptor;var E=(S,I,e,r)=>{for(var t=r>1?void 0:r?ce(I,e):I,n=S.length-1,o;n>=0;n--)(o=S[n])&&(t=(r?o(I,e,t):o(t))||t);return r&&t&&de(I,e,t),t},f=(S,I)=>(e,r)=>I(e,r,S);import*as d from"../../../../base/browser/dom.js";import{renderFormattedText as he}from"../../../../base/browser/formattedTextRenderer.js";import{StandardKeyboardEvent as le}from"../../../../base/browser/keyboardEvent.js";import"../../../../base/browser/ui/actionbar/actionViewItems.js";import{DropdownMenuActionViewItem as Ce}from"../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";import{getDefaultHoverDelegate as ue}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import"../../../../base/browser/ui/list/list.js";import"../../../../base/browser/ui/tree/tree.js";import"../../../../base/common/actions.js";import{coalesce as Ie,distinct as pe}from"../../../../base/common/arrays.js";import{Codicon as _}from"../../../../base/common/codicons.js";import{Emitter as k}from"../../../../base/common/event.js";import"../../../../base/common/filters.js";import{MarkdownString as H}from"../../../../base/common/htmlContent.js";import{KeyCode as O}from"../../../../base/common/keyCodes.js";import{Disposable as fe,DisposableStore as U,dispose as K,toDisposable as V}from"../../../../base/common/lifecycle.js";import{ResourceMap as me}from"../../../../base/common/map.js";import{FileAccess as ge}from"../../../../base/common/network.js";import{clamp as ve}from"../../../../base/common/numbers.js";import{autorun as Re}from"../../../../base/common/observable.js";import{ThemeIcon as q}from"../../../../base/common/themables.js";import{URI as Te}from"../../../../base/common/uri.js";import"../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";import{localize as v}from"../../../../nls.js";import{createActionViewItem as ye}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{MenuWorkbenchToolBar as z}from"../../../../platform/actions/browser/toolbar.js";import{MenuId as X,MenuItemAction as we}from"../../../../platform/actions/common/actions.js";import{ICommandService as G}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as Se}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as J}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as Pe}from"../../../../platform/contextview/browser/contextView.js";import{IHoverService as be}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as Ee}from"../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as ke}from"../../../../platform/instantiation/common/serviceCollection.js";import{ILogService as x}from"../../../../platform/log/common/log.js";import{ColorScheme as De}from"../../../../platform/theme/common/theme.js";import{IThemeService as Le}from"../../../../platform/theme/common/themeService.js";import{IWorkbenchIssueService as Me}from"../../issue/common/issue.js";import{annotateSpecialMarkdownContent as Q}from"../common/annotations.js";import"../common/chatAgents.js";import{CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING as Ae,CONTEXT_ITEM_ID as _e,CONTEXT_REQUEST as He,CONTEXT_RESPONSE as Oe,CONTEXT_RESPONSE_DETECTED_AGENT_COMMAND as Ve,CONTEXT_RESPONSE_ERROR as xe,CONTEXT_RESPONSE_FILTERED as Be,CONTEXT_RESPONSE_VOTE as Y}from"../common/chatContextKeys.js";import"../common/chatModel.js";import{chatSubcommandLeader as Ne}from"../common/chatParserTypes.js";import{ChatAgentVoteDirection as j,ChatAgentVoteDownReason as u}from"../common/chatService.js";import{isRequestVM as T,isResponseVM as h}from"../common/chatViewModel.js";import{getNWords as Fe}from"../common/chatWordCounter.js";import"../common/codeBlockModelCollection.js";import{MarkUnhelpfulActionId as D}from"./actions/chatTitleActions.js";import{GeneratingPhrase as We}from"./chat.js";import{ChatAgentHover as $e,getChatAgentHoverOptions as Ue}from"./chatAgentHover.js";import{ChatAttachmentsContentPart as Ke}from"./chatContentParts/chatAttachmentsContentPart.js";import{ChatCodeCitationContentPart as qe}from"./chatContentParts/chatCodeCitationContentPart.js";import{ChatCommandButtonContentPart as ze}from"./chatContentParts/chatCommandContentPart.js";import{ChatConfirmationContentPart as Xe}from"./chatContentParts/chatConfirmationContentPart.js";import"./chatContentParts/chatContentParts.js";import{ChatMarkdownContentPart as Z,EditorPool as Ge}from"./chatContentParts/chatMarkdownContentPart.js";import{ChatProgressContentPart as Je}from"./chatContentParts/chatProgressContentPart.js";import{ChatCollapsibleListContentPart as Qe,CollapsibleListPool as Ye}from"./chatContentParts/chatReferencesContentPart.js";import{ChatTaskContentPart as je}from"./chatContentParts/chatTaskContentPart.js";import{ChatTextEditContentPart as Ze,DiffEditorPool as et}from"./chatContentParts/chatTextEditContentPart.js";import{ChatToolInvocationPart as tt}from"./chatContentParts/chatToolInvocationPart.js";import{ChatTreeContentPart as ee,TreePool as rt}from"./chatContentParts/chatTreeContentPart.js";import{ChatWarningContentPart as te}from"./chatContentParts/chatWarningContentPart.js";import{ChatMarkdownDecorationsRenderer as nt}from"./chatMarkdownDecorationsRenderer.js";import{ChatMarkdownRenderer as ot}from"./chatMarkdownRenderer.js";import"./chatOptions.js";import{ChatCodeBlockContentProvider as it}from"./codeBlockPart.js";const m=d.$,re=!1;let w=class extends fe{constructor(e,r,t,n,o,a,i,c,s,l,C,p){super();this.rendererOptions=r;this.delegate=t;this.codeBlockModelCollection=n;this.instantiationService=a;this.logService=c;this.contextKeyService=s;this.themeService=l;this.commandService=C;this.hoverService=p;this.renderer=this._register(this.instantiationService.createInstance(ot,void 0)),this.markdownDecorationsRenderer=this.instantiationService.createInstance(nt),this._editorPool=this._register(this.instantiationService.createInstance(Ge,e,t,o)),this._diffEditorPool=this._register(this.instantiationService.createInstance(et,e,t,o)),this._treePool=this._register(this.instantiationService.createInstance(rt,this._onDidChangeVisibility.event)),this._contentReferencesListPool=this._register(this.instantiationService.createInstance(Ye,this._onDidChangeVisibility.event,void 0)),this._register(this.instantiationService.createInstance(it))}static ID="item";codeBlocksByResponseId=new Map;codeBlocksByEditorUri=new me;fileTreesByResponseId=new Map;focusedFileTreesByResponseId=new Map;renderer;markdownDecorationsRenderer;_onDidClickFollowup=this._register(new k);onDidClickFollowup=this._onDidClickFollowup.event;_onDidClickRerunWithAgentOrCommandDetection=new k;onDidClickRerunWithAgentOrCommandDetection=this._onDidClickRerunWithAgentOrCommandDetection.event;_onDidChangeItemHeight=this._register(new k);onDidChangeItemHeight=this._onDidChangeItemHeight.event;_editorPool;_diffEditorPool;_treePool;_contentReferencesListPool;_currentLayoutWidth=0;_isVisible=!0;_onDidChangeVisibility=this._register(new k);get templateId(){return w.ID}editorsInUse(){return this._editorPool.inUse()}traceLayout(e,r){re?this.logService.info(`ChatListItemRenderer#${e}: ${r}`):this.logService.trace(`ChatListItemRenderer#${e}: ${r}`)}getProgressiveRenderRate(e){if(e.isComplete)return 80;if(e.contentUpdateTimings&&e.contentUpdateTimings.impliedWordLoadRate){const n=e.contentUpdateTimings.impliedWordLoadRate;return ve(n,5,80)}return 8}getCodeBlockInfosForResponse(e){return this.codeBlocksByResponseId.get(e.id)??[]}getCodeBlockInfoForEditor(e){return this.codeBlocksByEditorUri.get(e)}getFileTreeInfosForResponse(e){return this.fileTreesByResponseId.get(e.id)??[]}getLastFocusedFileTreeForResponse(e){const r=this.fileTreesByResponseId.get(e.id),t=this.focusedFileTreesByResponseId.get(e.id);if(r?.length&&t!==void 0&&t<r.length)return r[t]}setVisible(e){this._isVisible=e,this._onDidChangeVisibility.fire(e)}layout(e){this._currentLayoutWidth=e-(this.rendererOptions.noPadding?0:40);for(const r of this._editorPool.inUse())r.layout(this._currentLayoutWidth);for(const r of this._diffEditorPool.inUse())r.layout(this._currentLayoutWidth)}renderTemplate(e){const r=new U,t=d.append(e,m(".interactive-item-container"));this.rendererOptions.renderStyle==="compact"&&t.classList.add("interactive-item-compact"),this.rendererOptions.noPadding&&t.classList.add("no-padding");let n=t,o=t,a,i;if(this.rendererOptions.renderStyle==="minimal"){t.classList.add("interactive-item-compact"),t.classList.add("minimal");const g=d.append(t,m(".column.left")),R=d.append(t,m(".column.right"));n=g,a=R,o=R,i=d.append(t,m(".header"))}const c=d.append(n,m(".header")),s=d.append(c,m(".user"));s.tabIndex=0,s.role="toolbar";const l=d.append(s,m(".avatar-container")),C=d.append(s,m("h3.username")),p=d.append(a??s,m("span.detail-container")),M=d.append(p,m("span.detail"));d.append(p,m("span.chat-animated-ellipsis"));const oe=d.append(o,m(".value")),ie=new U,B=r.add(this.contextKeyService.createScoped(t)),P=r.add(this.instantiationService.createChild(new ke([J,B])));let N;this.rendererOptions.noHeader?c.classList.add("hidden"):N=r.add(P.createInstance(z,i??c,X.ChatMessageTitle,{menuOptions:{shouldForwardArgs:!0},toolbarOptions:{shouldInlineSubmenu:g=>g.actions.length<=1}}));const se=d.append(t,m(".chat-footer-toolbar")),ae=r.add(P.createInstance(z,se,X.ChatMessageFooter,{eventDebounceDelay:0,menuOptions:{shouldForwardArgs:!0},toolbarOptions:{shouldInlineSubmenu:g=>g.actions.length<=1},actionViewItemProvider:(g,R)=>g instanceof we&&g.item.id===D?P.createInstance(b,g,R):ye(P,g,R)})),A=r.add(this.instantiationService.createInstance($e)),F=()=>{if(h(y.currentElement)&&y.currentElement.agent&&!y.currentElement.agent.isDefault)return A.setAgent(y.currentElement.agent.id),A.domNode},W=Ue(()=>h(y.currentElement)?y.currentElement.agent:void 0,this.commandService);r.add(this.hoverService.setupManagedHover(ue("element"),s,F,W)),r.add(d.addDisposableListener(s,d.EventType.KEY_DOWN,g=>{const R=new le(g);if(R.equals(O.Space)||R.equals(O.Enter)){const $=F();$&&this.hoverService.showHover({content:$,target:s,trapFocus:!0,actions:W.actions},!0)}else R.equals(O.Escape)&&this.hoverService.hideHover()}));const y={avatarContainer:l,username:C,detail:M,value:oe,rowContainer:t,elementDisposables:ie,templateDisposables:r,contextKeyService:B,instantiationService:P,agentHover:A,titleToolbar:N,footerToolbar:ae};return y}renderElement(e,r,t){this.renderChatTreeItem(e.element,r,t)}renderChatTreeItem(e,r,t){t.currentElement=e;const n=T(e)?"request":h(e)?"response":"welcome";this.traceLayout("renderElement",`${n}, index=${r}`),Oe.bindTo(t.contextKeyService).set(h(e)),_e.bindTo(t.contextKeyService).set(e.id),He.bindTo(t.contextKeyService).set(T(e)),Ve.bindTo(t.contextKeyService).set(h(e)&&e.agentOrSlashCommandDetected),h(e)?(Ae.bindTo(t.contextKeyService).set(!!e.agent?.metadata.supportIssueReporting),Y.bindTo(t.contextKeyService).set(e.vote===j.Up?"up":e.vote===j.Down?"down":"")):Y.bindTo(t.contextKeyService).set(""),t.titleToolbar&&(t.titleToolbar.context=e),t.footerToolbar.context=e,xe.bindTo(t.contextKeyService).set(h(e)&&!!e.errorDetails);const o=!!(h(e)&&e.errorDetails?.responseIsFiltered);if(Be.bindTo(t.contextKeyService).set(o),t.rowContainer.classList.toggle("interactive-request",T(e)),t.rowContainer.classList.toggle("interactive-response",h(e)),t.rowContainer.classList.toggle("show-detail-progress",h(e)&&!e.isComplete&&!e.progressMessages.length),t.username.textContent=e.username,this.rendererOptions.noHeader||this.renderAvatar(e,t),d.clearNode(t.detail),h(e)&&this.renderDetail(e,t),T(e)&&e.confirmation&&this.renderConfirmationAction(e,t),h(e)&&r===this.delegate.getListLength()-1&&(!e.isComplete||e.renderData)&&e.response.value.length){this.traceLayout("renderElement",`start progressive render, index=${r}`);const a=t.elementDisposables.add(new d.WindowIntervalTimer),i=c=>{try{this.doNextProgressiveRender(e,r,t,!!c)&&a.cancel()}catch(s){a.cancel(),this.logService.error(s)}};a.cancelAndSet(i,50,d.getWindow(t.rowContainer)),i(!0)}else h(e)?this.basicRenderElement(e,r,t):T(e)&&this.basicRenderElement(e,r,t)}renderDetail(e,r){r.elementDisposables.add(Re(t=>{this._renderDetail(e,r)}))}_renderDetail(e,r){if(d.clearNode(r.detail),e.agentOrSlashCommandDetected){const t=e.slashCommand?v("usedAgentSlashCommand","used {0} [[(rerun without)]]",`${Ne}${e.slashCommand.name}`):v("usedAgent","[[(rerun without)]]");d.reset(r.detail,he(t,{className:"agentOrSlashCommandDetected",inline:!0,actionHandler:{disposables:r.elementDisposables,callback:n=>{this._onDidClickRerunWithAgentOrCommandDetection.fire(e)}}}))}else e.isComplete||(r.detail.textContent=We)}renderConfirmationAction(e,r){d.clearNode(r.detail),e.confirmation&&(r.detail.textContent=v("chatConfirmationAction",'selected "{0}"',e.confirmation))}renderAvatar(e,r){const t=h(e)?this.getAgentIcon(e.agent?.metadata):e.avatarIcon??_.account;if(t instanceof Te){const n=d.$("img.icon");n.src=ge.uriToBrowserUri(t).toString(!0),r.avatarContainer.replaceChildren(d.$(".avatar",void 0,n))}else{const n=d.$(q.asCSSSelector(t));r.avatarContainer.replaceChildren(d.$(".avatar.codicon-avatar",void 0,n))}}getAgentIcon(e){return e?.themeIcon?e.themeIcon:e?.iconDark&&this.themeService.getColorTheme().type===De.DARK?e.iconDark:e?.icon?e.icon:_.copilot}basicRenderElement(e,r,t){t.rowContainer.classList.toggle("chat-response-loading",h(e)&&!e.isComplete);let n=[];if(T(e)&&!e.confirmation){const s="message"in e.message?e.message.message:this.markdownDecorationsRenderer.convertParsedRequestToMarkdown(e.message);n=[{content:new H(s),kind:"markdownContent"}]}else h(e)&&(e.contentReferences.length&&n.push({kind:"references",references:e.contentReferences}),n.push(...Q(e.response.value)),e.codeCitations.length&&n.push({kind:"codeCitations",citations:e.codeCitations}));d.clearNode(t.value),h(e)&&this.renderDetail(e,t);const o=!!(h(e)&&e.errorDetails?.responseIsFiltered),a=[];if(o||n.forEach((s,l)=>{const C={element:e,contentIndex:l,content:n,preceedingContentParts:a},p=this.renderChatContentPart(s,t,C);p&&(t.value.appendChild(p.domNode),a.push(p))}),t.renderedParts&&K(t.renderedParts),t.renderedParts=a,!o&&T(e)&&e.variables.length){const s=this.renderAttachments(e.variables,e.contentReferences,t);s&&(t.value.appendChild(s.domNode),t.elementDisposables.add(s))}if(h(e)&&e.errorDetails?.message){const s=this.instantiationService.createInstance(te,e.errorDetails.responseIsFiltered?"info":"error",new H(e.errorDetails.message),this.renderer);t.elementDisposables.add(s),t.value.appendChild(s.domNode)}const i=t.rowContainer.offsetHeight,c=!e.currentRenderedHeight||e.currentRenderedHeight!==i;if(e.currentRenderedHeight=i,c){const s=t.elementDisposables.add(d.scheduleAtNextAnimationFrame(d.getWindow(t.value),()=>{e.currentRenderedHeight=t.rowContainer.offsetHeight,s.dispose(),this._onDidChangeItemHeight.fire({element:e,height:e.currentRenderedHeight})}))}}updateItemHeight(e){if(!e.currentElement)return;const r=e.rowContainer.offsetHeight;e.currentElement.currentRenderedHeight=r,this._onDidChangeItemHeight.fire({element:e.currentElement,height:r})}doNextProgressiveRender(e,r,t,n){if(!this._isVisible)return!0;if(e.isCanceled)return this.traceLayout("doNextProgressiveRender",`canceled, index=${r}`),e.renderData=void 0,this.basicRenderElement(e,r,t),!0;t.rowContainer.classList.toggle("chat-response-loading",!0);let o=!1;this.traceLayout("doNextProgressiveRender",`START progressive render, index=${r}, renderData=${JSON.stringify(e.renderData)}`);const a=this.getNextProgressiveRenderContent(e),i=this.diff(t.renderedParts??[],a,e);if(o=i.every(s=>s===null),o)return e.isComplete?(this.traceLayout("doNextProgressiveRender",`END progressive render, index=${r} and clearing renderData, response is complete`),e.renderData=void 0,this.basicRenderElement(e,r,t),!0):(this.traceLayout("doNextProgressiveRender","caught up with the stream- no new content to render"),!0);this.traceLayout("doNextProgressiveRender",`doing progressive render, ${i.length} parts to render`),this.renderChatContentDiff(i,a,e,t);const c=t.rowContainer.offsetHeight;return e.currentRenderedHeight=c,n||this._onDidChangeItemHeight.fire({element:e,height:t.rowContainer.offsetHeight}),!1}renderChatContentDiff(e,r,t,n){const o=n.renderedParts??[];n.renderedParts=o,e.forEach((a,i)=>{if(!a)return;const c=n.renderedParts?.[i];c&&c.dispose();const s=o.slice(0,i),l={element:t,content:r,preceedingContentParts:s,contentIndex:i},C=this.renderChatContentPart(a,n,l);if(C){if(c)try{c.domNode.replaceWith(C.domNode)}catch(p){this.logService.error("ChatListItemRenderer#renderChatContentDiff: error replacing part",p)}else n.value.appendChild(C.domNode);o[i]=C}else c&&c.domNode.remove()})}getNextProgressiveRenderContent(e){const r=this.getDataForProgressiveRender(e),t=Q(e.response.value);this.traceLayout("getNextProgressiveRenderContent",`Want to render ${r.numWordsToRender} at ${r.rate} words/s, counting...`);let n=r.numWordsToRender;const o=[];e.contentReferences.length&&o.push({kind:"references",references:e.contentReferences});for(let s=0;s<t.length;s++){const l=t[s];if(n<=0)break;if(l.kind==="markdownContent"){const C=Fe(l.content.value,n);C.isFullString?o.push(l):o.push({kind:"markdownContent",content:new H(C.value,l.content)}),this.traceLayout("getNextProgressiveRenderContent",`  Chunk ${s}: Want to render ${n} words and found ${C.returnedWordCount} words. Total words in chunk: ${C.totalWordCount}`),n-=C.returnedWordCount}else o.push(l)}const a=e.contentUpdateTimings?.lastWordCount??0,i=r.numWordsToRender-n,c=a-i;return this.traceLayout("getNextProgressiveRenderContent",`Want to render ${r.numWordsToRender} words. Rendering ${i} words. Buffer: ${c} words`),i>0&&i!==e.renderData?.renderedWordCount&&(e.renderData={lastRenderTime:Date.now(),renderedWordCount:i,renderedParts:o}),o}getDataForProgressiveRender(e){const r=e.renderData??{lastRenderTime:0,renderedWordCount:0},t=this.getProgressiveRenderRate(e);return{numWordsToRender:r.lastRenderTime===0?1:r.renderedWordCount+Math.floor((Date.now()-r.lastRenderTime)/1e3*t),rate:t}}diff(e,r,t){const n=[];for(let o=0;o<r.length;o++){const a=r[o],i=e[o];!i||!i.hasSameContent(a,r.slice(o+1),t)?n.push(a):n.push(null)}return n}renderChatContentPart(e,r,t){if(e.kind==="treeData")return this.renderTreeData(e,r,t);if(e.kind==="progressMessage")return this.instantiationService.createInstance(Je,e,this.renderer,t);if(e.kind==="progressTask")return this.renderProgressTask(e,r,t);if(e.kind==="command")return this.instantiationService.createInstance(ze,e,t);if(e.kind==="textEditGroup")return this.renderTextEdit(t,e,r);if(e.kind==="confirmation")return this.renderConfirmation(t,e,r);if(e.kind==="warning")return this.instantiationService.createInstance(te,"warning",e.content,this.renderer);if(e.kind==="markdownContent")return this.renderMarkdown(e.content,r,t);if(e.kind==="references")return this.renderContentReferencesListData(e,void 0,t,r);if(e.kind==="codeCitations")return this.renderCodeCitationsListData(e,t,r);if(e.kind==="toolInvocation"||e.kind==="toolInvocationSerialized")return this.renderToolInvocation(e,t,r)}renderTreeData(e,r,t){const n=e.treeData,o=t.preceedingContentParts.filter(i=>i instanceof ee).length,a=this.instantiationService.createInstance(ee,n,t.element,this._treePool,o);if(a.addDisposable(a.onDidChangeHeight(()=>{this.updateItemHeight(r)})),h(t.element)){const i={treeDataId:n.uri.toString(),treeIndex:o,focus(){a.domFocus()}};a.addDisposable(a.onDidFocus(()=>{this.focusedFileTreesByResponseId.set(t.element.id,i.treeIndex)}));const c=this.fileTreesByResponseId.get(t.element.id)??[];c.push(i),this.fileTreesByResponseId.set(t.element.id,pe(c,s=>s.treeDataId)),a.addDisposable(V(()=>this.fileTreesByResponseId.set(t.element.id,c.filter(s=>s.treeDataId!==n.uri.toString()))))}return a}renderContentReferencesListData(e,r,t,n){const o=this.instantiationService.createInstance(Qe,e.references,r,t.element,this._contentReferencesListPool);return o.addDisposable(o.onDidChangeHeight(()=>{this.updateItemHeight(n)})),o}renderCodeCitationsListData(e,r,t){return this.instantiationService.createInstance(qe,e,r)}renderToolInvocation(e,r,t){const n=this.instantiationService.createInstance(tt,e,r,this.renderer);return n.addDisposable(n.onDidChangeHeight(()=>{this.updateItemHeight(t)})),n}renderProgressTask(e,r,t){if(!h(t.element))return;const n=this.instantiationService.createInstance(je,e,this._contentReferencesListPool,this.renderer,t);return n.addDisposable(n.onDidChangeHeight(()=>{this.updateItemHeight(r)})),n}renderConfirmation(e,r,t){const n=this.instantiationService.createInstance(Xe,r,e);return n.addDisposable(n.onDidChangeHeight(()=>this.updateItemHeight(t))),n}renderAttachments(e,r,t){return this.instantiationService.createInstance(Ke,e,r,void 0)}renderTextEdit(e,r,t){const n=this.instantiationService.createInstance(Ze,r,e,this.rendererOptions,this._diffEditorPool,this._currentLayoutWidth);return n.addDisposable(n.onDidChangeHeight(()=>{n.layout(this._currentLayoutWidth),this.updateItemHeight(t)})),n}renderMarkdown(e,r,t){const n=t.element,o=h(n)&&(!n.isComplete||n.isCanceled||n.errorDetails?.responseIsFiltered||n.errorDetails?.responseIsIncomplete||!!n.renderData),a=t.preceedingContentParts.reduce((l,C)=>l+(C instanceof Z?C.codeblocks.length:0),0),i=this.instantiationService.createInstance(Z,e,t,this._editorPool,o,a,this.renderer,this._currentLayoutWidth,this.codeBlockModelCollection,this.rendererOptions),c=i.id;i.addDisposable(i.onDidChangeHeight(()=>{i.layout(this._currentLayoutWidth),this.updateItemHeight(r)}));const s=this.codeBlocksByResponseId.get(n.id)??[];return this.codeBlocksByResponseId.set(n.id,s),i.addDisposable(V(()=>{const l=this.codeBlocksByResponseId.get(n.id);l&&i.codeblocks.forEach((C,p)=>{l[a+p]?.ownerMarkdownPartId===c&&delete l[a+p]})})),i.codeblocks.forEach((l,C)=>{if(s[a+C]=l,l.uri){const p=l.uri;this.codeBlocksByEditorUri.set(p,l),i.addDisposable(V(()=>{this.codeBlocksByEditorUri.get(p)?.ownerMarkdownPartId===c&&this.codeBlocksByEditorUri.delete(p)}))}}),i}disposeElement(e,r,t){if(this.traceLayout("disposeElement",`Disposing element, index=${r}`),t.renderedParts)try{K(Ie(t.renderedParts)),t.renderedParts=void 0,d.clearNode(t.value)}catch(n){throw n}t.currentElement=void 0,t.elementDisposables.clear()}disposeTemplate(e){e.templateDisposables.dispose()}};w=E([f(5,Ee),f(6,Se),f(7,x),f(8,J),f(9,Le),f(10,G),f(11,be)],w);let L=class{constructor(I,e){this.defaultElementHeight=I;this.logService=e}_traceLayout(I,e){re?this.logService.info(`ChatListDelegate#${I}: ${e}`):this.logService.trace(`ChatListDelegate#${I}: ${e}`)}getHeight(I){const e=T(I)?"request":"response",r=("currentRenderedHeight"in I?I.currentRenderedHeight:void 0)??this.defaultElementHeight;return this._traceLayout("getHeight",`${e}, height=${r}`),r}getTemplateId(I){return w.ID}hasDynamicHeight(I){return!0}};L=E([f(1,x)],L);const ne={[u.IncorrectCode]:v("incorrectCode","Suggested incorrect code"),[u.DidNotFollowInstructions]:v("didNotFollowInstructions","Didn't follow instructions"),[u.MissingContext]:v("missingContext","Missing context"),[u.OffensiveOrUnsafe]:v("offensiveOrUnsafe","Offensive or unsafe"),[u.PoorlyWrittenOrFormatted]:v("poorlyWrittenOrFormatted","Poorly written or formatted"),[u.RefusedAValidRequest]:v("refusedAValidRequest","Refused a valid request"),[u.IncompleteCode]:v("incompleteCode","Incomplete code"),[u.WillReportIssue]:v("reportIssue","Report an issue"),[u.Other]:v("other","Other")};let b=class extends Ce{constructor(e,r,t,n,o,a){super(e,{getActions:()=>this.getActions()},a,{...r,classNames:q.asClassNameArray(_.thumbsdown)});this.commandService=t;this.issueService=n;this.logService=o}getActions(){return[this.getVoteDownDetailAction(u.IncorrectCode),this.getVoteDownDetailAction(u.DidNotFollowInstructions),this.getVoteDownDetailAction(u.IncompleteCode),this.getVoteDownDetailAction(u.MissingContext),this.getVoteDownDetailAction(u.PoorlyWrittenOrFormatted),this.getVoteDownDetailAction(u.RefusedAValidRequest),this.getVoteDownDetailAction(u.OffensiveOrUnsafe),this.getVoteDownDetailAction(u.Other),{id:"reportIssue",label:ne[u.WillReportIssue],tooltip:"",enabled:!0,class:void 0,run:async e=>{if(!h(e)){this.logService.error("ChatVoteDownButton#run: invalid context");return}await this.commandService.executeCommand(D,e,u.WillReportIssue),await this.issueService.openReporter({extensionId:e.agent?.extensionId.value})}}]}render(e){super.render(e),this.element?.classList.toggle("checked",this.action.checked)}getVoteDownDetailAction(e){const r=ne[e];return{id:D,label:r,tooltip:"",enabled:!0,checked:this._context.voteDownReason===e,class:void 0,run:async t=>{if(!h(t)){this.logService.error("ChatVoteDownButton#getVoteDownDetailAction: invalid context");return}await this.commandService.executeCommand(D,t,e)}}}};b=E([f(2,G),f(3,Me),f(4,x),f(5,Pe)],b);export{L as ChatListDelegate,w as ChatListItemRenderer,b as ChatVoteDownButton};
