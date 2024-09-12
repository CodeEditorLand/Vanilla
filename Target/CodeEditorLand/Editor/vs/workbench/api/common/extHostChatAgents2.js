import{coalesce as T}from"../../../base/common/arrays.js";import{raceCancellation as k}from"../../../base/common/async.js";import"../../../base/common/cancellation.js";import{toErrorMessage as q}from"../../../base/common/errorMessage.js";import{Emitter as _}from"../../../base/common/event.js";import"../../../base/common/htmlContent.js";import{Iterable as S}from"../../../base/common/iterator.js";import{Disposable as M,DisposableMap as x,DisposableStore as R,toDisposable as E}from"../../../base/common/lifecycle.js";import{revive as w}from"../../../base/common/marshalling.js";import{StopWatch as H}from"../../../base/common/stopwatch.js";import{assertType as F}from"../../../base/common/types.js";import{URI as $}from"../../../base/common/uri.js";import"../../../editor/common/languages.js";import{ExtensionIdentifier as V}from"../../../platform/extensions/common/extensions.js";import"../../../platform/log/common/log.js";import{MainContext as W}from"./extHost.protocol.js";import"./extHostCommands.js";import"./extHostDocuments.js";import*as a from"./extHostTypeConverters.js";import*as c from"./extHostTypes.js";import{ChatAgentLocation as P}from"../../contrib/chat/common/chatAgents.js";import{ChatAgentVoteDirection as b}from"../../contrib/chat/common/chatService.js";import{checkProposedApiEnabled as d,isProposedApiEnabled as y}from"../../services/extensions/common/extensions.js";import"../../services/extensions/common/proxyIdentifier.js";class U{constructor(l,i,n,t,e){this._extension=l;this._request=i;this._proxy=n;this._commandsConverter=t;this._sessionDisposables=e}_stopWatch=H.create(!1);_isClosed=!1;_firstProgress;_apiObject;close(){this._isClosed=!0}get timings(){return{firstProgress:this._firstProgress,totalElapsed:this._stopWatch.elapsed()}}get apiObject(){if(!this._apiObject){let n=function(e){if(i._isClosed){const r=new Error("Response stream has been closed");throw Error.captureStackTrace(r,e),r}};var l=n;const i=this;this._stopWatch.reset();const t=(e,r)=>{if(typeof this._firstProgress>"u"&&(e.kind==="markdownContent"||e.kind==="markdownVuln")&&(this._firstProgress=this._stopWatch.elapsed()),r){const o=this._proxy.$handleProgressChunk(this._request.requestId,e),s={report:h=>{o?.then(p=>{p&&(c.MarkdownString.isMarkdownString(h.value)?this._proxy.$handleProgressChunk(this._request.requestId,a.ChatResponseWarningPart.from(h),p):this._proxy.$handleProgressChunk(this._request.requestId,a.ChatResponseReferencePart.from(h),p))})}};Promise.all([o,r?.(s)]).then(([h,p])=>{h!==void 0&&this._proxy.$handleProgressChunk(this._request.requestId,a.ChatTaskResult.from(p),h)})}else this._proxy.$handleProgressChunk(this._request.requestId,e)};this._apiObject={markdown(e){n(this.markdown);const r=new c.ChatResponseMarkdownPart(e),o=a.ChatResponseMarkdownPart.from(r);return t(o),this},markdownWithVulnerabilities(e,r){n(this.markdown),r&&d(i._extension,"chatParticipantAdditions");const o=new c.ChatResponseMarkdownWithVulnerabilitiesPart(e,r),s=a.ChatResponseMarkdownWithVulnerabilitiesPart.from(o);return t(s),this},codeblockUri(e){n(this.codeblockUri),d(i._extension,"chatParticipantAdditions");const r=new c.ChatResponseCodeblockUriPart(e),o=a.ChatResponseCodeblockUriPart.from(r);return t(o),this},filetree(e,r){n(this.filetree);const o=new c.ChatResponseFileTreePart(e,r),s=a.ChatResponseFilesPart.from(o);return t(s),this},anchor(e,r){n(this.anchor);const o=new c.ChatResponseAnchorPart(e,r),s=a.ChatResponseAnchorPart.from(o);return t(s),this},button(e){n(this.anchor);const r=new c.ChatResponseCommandButtonPart(e),o=a.ChatResponseCommandButtonPart.from(r,i._commandsConverter,i._sessionDisposables);return t(o),this},progress(e,r){n(this.progress);const o=new c.ChatResponseProgressPart2(e,r),s=r?a.ChatTask.from(o):a.ChatResponseProgressPart.from(o);return t(s,r),this},warning(e){n(this.progress),d(i._extension,"chatParticipantAdditions");const r=new c.ChatResponseWarningPart(e),o=a.ChatResponseWarningPart.from(r);return t(o),this},reference(e,r){return this.reference2(e,r)},reference2(e,r,o){if(n(this.reference),typeof e=="object"&&"variableName"in e&&d(i._extension,"chatParticipantAdditions"),typeof e=="object"&&"variableName"in e&&!e.value){const s=i._request.variables.variables.find(h=>h.name===e.variableName);if(s){let h;if(s.references?.length)h=s.references.map(p=>({kind:"reference",reference:{variableName:e.variableName,value:p.reference}}));else{const p=new c.ChatResponseReferencePart(e,r,o);h=[a.ChatResponseReferencePart.from(p)]}return h.forEach(p=>t(p)),this}}else{const s=new c.ChatResponseReferencePart(e,r,o),h=a.ChatResponseReferencePart.from(s);t(h)}return this},codeCitation(e,r,o){n(this.codeCitation),d(i._extension,"chatParticipantAdditions");const s=new c.ChatResponseCodeCitationPart(e,r,o),h=a.ChatResponseCodeCitationPart.from(s);t(h)},textEdit(e,r){n(this.textEdit),d(i._extension,"chatParticipantAdditions");const o=new c.ChatResponseTextEditPart(e,r),s=a.ChatResponseTextEditPart.from(o);return t(s),this},detectedParticipant(e,r){n(this.detectedParticipant),d(i._extension,"chatParticipantAdditions");const o=new c.ChatResponseDetectedParticipantPart(e,r),s=a.ChatResponseDetectedParticipantPart.from(o);return t(s),this},confirmation(e,r,o,s){n(this.confirmation),d(i._extension,"chatParticipantAdditions");const h=new c.ChatResponseConfirmationPart(e,r,o,s),p=a.ChatResponseConfirmationPart.from(h);return t(p),this},push(e){if(n(this.push),(e instanceof c.ChatResponseTextEditPart||e instanceof c.ChatResponseMarkdownWithVulnerabilitiesPart||e instanceof c.ChatResponseDetectedParticipantPart||e instanceof c.ChatResponseWarningPart||e instanceof c.ChatResponseConfirmationPart||e instanceof c.ChatResponseCodeCitationPart||e instanceof c.ChatResponseMovePart)&&d(i._extension,"chatParticipantAdditions"),e instanceof c.ChatResponseReferencePart)this.reference2(e.value,e.iconPath,e.options);else{const r=a.ChatResponsePart.from(e,i._commandsConverter,i._sessionDisposables);t(r)}return this}}}return this._apiObject}}class C extends M{constructor(i,n,t,e){super();this._logService=n;this._commands=t;this._documents=e;this._proxy=i.getProxy(W.MainThreadChatAgents2)}static _idPool=0;_agents=new Map;_proxy;static _participantDetectionProviderIdPool=0;_participantDetectionProviders=new Map;_sessionDisposables=this._register(new x);_completionDisposables=this._register(new x);transferActiveChat(i){this._proxy.$transferActiveChatSession(i)}createChatAgent(i,n,t){const e=C._idPool++,r=new A(i,n,this._proxy,e,t);return this._agents.set(e,r),this._proxy.$registerAgent(e,i.identifier,n,{},void 0),r.apiAgent}createDynamicChatAgent(i,n,t,e){const r=C._idPool++,o=new A(i,n,this._proxy,r,e);return this._agents.set(r,o),this._proxy.$registerAgent(r,i.identifier,n,{isSticky:!0},t),o.apiAgent}registerChatParticipantDetectionProvider(i){const n=C._participantDetectionProviderIdPool++;return this._participantDetectionProviders.set(n,i),this._proxy.$registerChatParticipantDetectionProvider(n),E(()=>{this._participantDetectionProviders.delete(n),this._proxy.$unregisterChatParticipantDetectionProvider(n)})}async $detectChatParticipant(i,n,t,e,r){const{request:o,location:s,history:h}=await this._createRequest(n,t),p=this._participantDetectionProviders.get(i);if(p)return p.provideParticipantDetection(a.ChatAgentRequest.to(o,s),{history:h},{participants:e.participants,location:a.ChatLocation.to(e.location)},r)}async _createRequest(i,n){const t=w(i),e=await this.prepareHistoryTurns(t.agentId,n);let r;if(t.locationData?.type===P.Editor){const o=this._documents.getDocument(t.locationData.document);r=new c.ChatRequestEditorData(o,a.Selection.to(t.locationData.selection),a.Range.to(t.locationData.wholeRange))}else if(t.locationData?.type===P.Notebook){const o=this._documents.getDocument(t.locationData.sessionInputUri);r=new c.ChatRequestNotebookData(o)}else t.locationData?.type,P.Terminal;return{request:t,location:r,history:e}}async $invokeAgent(i,n,t,e){const r=this._agents.get(i);if(!r)throw new Error(`[CHAT](${i}) CANNOT invoke agent because the agent is not registered`);let o;try{const{request:s,location:h,history:p}=await this._createRequest(n,t);let u=this._sessionDisposables.get(s.sessionId);u||(u=new R,this._sessionDisposables.set(s.sessionId,u)),o=new U(r.extension,s,this._proxy,this._commands.converter,u);const f=r.invoke(a.ChatAgentRequest.to(s,h),{history:p},o.apiObject,e);return await k(Promise.resolve(f).then(g=>{if(g?.metadata)try{JSON.stringify(g.metadata)}catch(I){const v=`result.metadata MUST be JSON.stringify-able. Got error: ${I.message}`;return this._logService.error(`[${r.extension.identifier.value}] [@${r.id}] ${v}`,r.extension),{errorDetails:{message:v},timings:o?.timings,nextQuestion:g.nextQuestion}}let m;return g?.errorDetails&&(m={...g.errorDetails,responseIsIncomplete:!0}),m?.responseIsRedacted&&d(r.extension,"chatParticipantPrivate"),{errorDetails:m,timings:o?.timings,metadata:g?.metadata,nextQuestion:g?.nextQuestion}}),e)}catch(s){return this._logService.error(s,r.extension),s instanceof c.LanguageModelError&&s.cause&&(s=s.cause),{errorDetails:{message:q(s),responseIsIncomplete:!0}}}finally{o?.close()}}async prepareHistoryTurns(i,n){const t=[];for(const e of n.history){const r=a.ChatAgentResult.to(e.result),o=i===e.request.agentId?r:{...r,metadata:void 0},s=e.request.variables.variables.filter(f=>!f.isTool).map(a.ChatPromptReference.to),h=e.request.variables.variables.filter(f=>f.isTool).map(a.ChatLanguageModelToolReference.to),p=new c.ChatRequestTurn(e.request.message,e.request.command,s,e.request.agentId);p.toolReferences=h,t.push(p);const u=T(e.response.map(f=>a.ChatResponsePart.toContent(f,this._commands.converter)));t.push(new c.ChatResponseTurn(u,o,e.request.agentId,e.request.command))}return t}$releaseSession(i){this._sessionDisposables.deleteAndDispose(i)}async $provideFollowups(i,n,t,e,r){const o=this._agents.get(n);if(!o)return Promise.resolve([]);const s=w(i),h=await this.prepareHistoryTurns(o.id,e),p=a.ChatAgentResult.to(t);return(await o.provideFollowups(p,{history:h},r)).filter(u=>{const f=!u.participant||S.some(this._agents.values(),g=>g.id===u.participant&&V.equals(g.extension.identifier,o.extension.identifier));return f||this._logService.warn(`[@${o.id}] ChatFollowup refers to an unknown participant: ${u.participant}`),f}).map(u=>a.ChatFollowup.from(u,s))}$acceptFeedback(i,n,t){const e=this._agents.get(i);if(!e)return;const r=a.ChatAgentResult.to(n);let o;switch(t.direction){case b.Down:o=c.ChatResultFeedbackKind.Unhelpful;break;case b.Up:o=c.ChatResultFeedbackKind.Helpful;break}const s={result:r,kind:o,unhelpfulReason:y(e.extension,"chatParticipantAdditions")?t.reason:void 0};e.acceptFeedback(Object.freeze(s))}$acceptAction(i,n,t){const e=this._agents.get(i);if(!e||t.action.kind==="vote")return;const r=a.ChatAgentUserActionEvent.to(n,t,this._commands.converter);r&&e.acceptAction(Object.freeze(r))}async $invokeCompletionProvider(i,n,t){const e=this._agents.get(i);if(!e)return[];let r=this._completionDisposables.get(i);return r?r.clear():(r=new R,this._completionDisposables.set(i,r)),(await e.invokeCompletionProvider(n,t)).map(s=>a.ChatAgentCompletionItem.from(s,this._commands.converter,r))}async $provideWelcomeMessage(i,n,t){const e=this._agents.get(i);if(e)return await e.provideWelcomeMessage(a.ChatLocation.to(n),t)}async $provideChatTitle(i,n,t){const e=this._agents.get(i);if(!e)return;const r=await this.prepareHistoryTurns(e.id,{history:n});return await e.provideTitle({history:r},t)}async $provideSampleQuestions(i,n,t){const e=this._agents.get(i);if(e)return(await e.provideSampleQuestions(a.ChatLocation.to(n),t)).map(r=>a.ChatFollowup.from(r,void 0))}}class A{constructor(l,i,n,t,e){this.extension=l;this.id=i;this._proxy=n;this._handle=t;this._requestHandler=e}_followupProvider;_iconPath;_helpTextPrefix;_helpTextVariablesPrefix;_helpTextPostfix;_isSecondary;_onDidReceiveFeedback=new _;_onDidPerformAction=new _;_supportIssueReporting;_agentVariableProvider;_welcomeMessageProvider;_titleProvider;_requester;_supportsSlowReferences;acceptFeedback(l){this._onDidReceiveFeedback.fire(l)}acceptAction(l){this._onDidPerformAction.fire(l)}async invokeCompletionProvider(l,i){return this._agentVariableProvider?await this._agentVariableProvider.provider.provideCompletionItems(l,i)??[]:[]}async provideFollowups(l,i,n){if(!this._followupProvider)return[];const t=await this._followupProvider.provideFollowups(l,i,n);return t?t.filter(e=>!(e&&"commandId"in e)).filter(e=>!(e&&"message"in e)):[]}async provideWelcomeMessage(l,i){if(!this._welcomeMessageProvider)return[];const n=await this._welcomeMessageProvider.provideWelcomeMessage(l,i);return n?n.map(t=>typeof t=="string"?t:a.MarkdownString.from(t)):[]}async provideTitle(l,i){if(this._titleProvider)return await this._titleProvider.provideChatTitle(l,i)??void 0}async provideSampleQuestions(l,i){if(!this._welcomeMessageProvider||!this._welcomeMessageProvider.provideSampleQuestions)return[];const n=await this._welcomeMessageProvider.provideSampleQuestions(l,i);return n||[]}get apiAgent(){let l=!1,i=!1;const n=()=>{l||i||(i=!0,queueMicrotask(()=>{this._proxy.$updateAgent(this._handle,{icon:this._iconPath?this._iconPath instanceof $?this._iconPath:"light"in this._iconPath?this._iconPath.light:void 0:void 0,iconDark:this._iconPath&&"dark"in this._iconPath?this._iconPath.dark:void 0,themeIcon:this._iconPath instanceof c.ThemeIcon?this._iconPath:void 0,hasFollowups:this._followupProvider!==void 0,isSecondary:this._isSecondary,helpTextPrefix:!this._helpTextPrefix||typeof this._helpTextPrefix=="string"?this._helpTextPrefix:a.MarkdownString.from(this._helpTextPrefix),helpTextVariablesPrefix:!this._helpTextVariablesPrefix||typeof this._helpTextVariablesPrefix=="string"?this._helpTextVariablesPrefix:a.MarkdownString.from(this._helpTextVariablesPrefix),helpTextPostfix:!this._helpTextPostfix||typeof this._helpTextPostfix=="string"?this._helpTextPostfix:a.MarkdownString.from(this._helpTextPostfix),supportIssueReporting:this._supportIssueReporting,requester:this._requester,supportsSlowVariables:this._supportsSlowReferences}),i=!1}))},t=this;return{get id(){return t.id},get iconPath(){return t._iconPath},set iconPath(e){t._iconPath=e,n()},get requestHandler(){return t._requestHandler},set requestHandler(e){F(typeof e=="function","Invalid request handler"),t._requestHandler=e},get followupProvider(){return t._followupProvider},set followupProvider(e){t._followupProvider=e,n()},get helpTextPrefix(){return d(t.extension,"defaultChatParticipant"),t._helpTextPrefix},set helpTextPrefix(e){d(t.extension,"defaultChatParticipant"),t._helpTextPrefix=e,n()},get helpTextVariablesPrefix(){return d(t.extension,"defaultChatParticipant"),t._helpTextVariablesPrefix},set helpTextVariablesPrefix(e){d(t.extension,"defaultChatParticipant"),t._helpTextVariablesPrefix=e,n()},get helpTextPostfix(){return d(t.extension,"defaultChatParticipant"),t._helpTextPostfix},set helpTextPostfix(e){d(t.extension,"defaultChatParticipant"),t._helpTextPostfix=e,n()},get isSecondary(){return d(t.extension,"defaultChatParticipant"),t._isSecondary},set isSecondary(e){d(t.extension,"defaultChatParticipant"),t._isSecondary=e,n()},get supportIssueReporting(){return d(t.extension,"chatParticipantPrivate"),t._supportIssueReporting},set supportIssueReporting(e){d(t.extension,"chatParticipantPrivate"),t._supportIssueReporting=e,n()},get onDidReceiveFeedback(){return t._onDidReceiveFeedback.event},set participantVariableProvider(e){if(d(t.extension,"chatParticipantAdditions"),t._agentVariableProvider=e,e){if(!e.triggerCharacters.length)throw new Error("triggerCharacters are required");t._proxy.$registerAgentCompletionsProvider(t._handle,t.id,e.triggerCharacters)}else t._proxy.$unregisterAgentCompletionsProvider(t._handle,t.id)},get participantVariableProvider(){return d(t.extension,"chatParticipantAdditions"),t._agentVariableProvider},set welcomeMessageProvider(e){d(t.extension,"defaultChatParticipant"),t._welcomeMessageProvider=e,n()},get welcomeMessageProvider(){return d(t.extension,"defaultChatParticipant"),t._welcomeMessageProvider},set titleProvider(e){d(t.extension,"defaultChatParticipant"),t._titleProvider=e,n()},get titleProvider(){return d(t.extension,"defaultChatParticipant"),t._titleProvider},onDidPerformAction:y(this.extension,"chatParticipantAdditions")?this._onDidPerformAction.event:void 0,set requester(e){t._requester=e,n()},get requester(){return t._requester},set supportsSlowReferences(e){d(t.extension,"chatParticipantPrivate"),t._supportsSlowReferences=e,n()},get supportsSlowReferences(){return d(t.extension,"chatParticipantPrivate"),t._supportsSlowReferences},dispose(){l=!0,t._followupProvider=void 0,t._onDidReceiveFeedback.dispose(),t._proxy.$unregisterAgent(t._handle)}}}invoke(l,i,n,t){return this._requestHandler(l,i,n,t)}}export{C as ExtHostChatAgents2};
