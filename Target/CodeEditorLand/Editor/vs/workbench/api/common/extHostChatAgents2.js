import{coalesce as k}from"../../../base/common/arrays.js";import{raceCancellation as q}from"../../../base/common/async.js";import"../../../base/common/cancellation.js";import{toErrorMessage as M}from"../../../base/common/errorMessage.js";import{Emitter as R}from"../../../base/common/event.js";import{Iterable as S}from"../../../base/common/iterator.js";import{Disposable as E,DisposableMap as w,DisposableStore as b,toDisposable as H}from"../../../base/common/lifecycle.js";import{revive as y}from"../../../base/common/marshalling.js";import{StopWatch as F}from"../../../base/common/stopwatch.js";import{ThemeIcon as $}from"../../../base/common/themables.js";import{assertType as V}from"../../../base/common/types.js";import{URI as W}from"../../../base/common/uri.js";import"../../../editor/common/languages.js";import{ExtensionIdentifier as U}from"../../../platform/extensions/common/extensions.js";import"../../../platform/log/common/log.js";import{ChatAgentLocation as v}from"../../contrib/chat/common/chatAgents.js";import{ChatAgentVoteDirection as I}from"../../contrib/chat/common/chatService.js";import{checkProposedApiEnabled as d,isProposedApiEnabled as _}from"../../services/extensions/common/extensions.js";import"../../services/extensions/common/proxyIdentifier.js";import{MainContext as L}from"./extHost.protocol.js";import"./extHostCommands.js";import"./extHostDocuments.js";import"./extHostLanguageModels.js";import*as a from"./extHostTypeConverters.js";import*as c from"./extHostTypes.js";class N{constructor(l,r,s,t,e){this._extension=l;this._request=r;this._proxy=s;this._commandsConverter=t;this._sessionDisposables=e}_stopWatch=F.create(!1);_isClosed=!1;_firstProgress;_apiObject;close(){this._isClosed=!0}get timings(){return{firstProgress:this._firstProgress,totalElapsed:this._stopWatch.elapsed()}}get apiObject(){if(!this._apiObject){let s=function(e){if(r._isClosed){const n=new Error("Response stream has been closed");throw Error.captureStackTrace(n,e),n}};var l=s;const r=this;this._stopWatch.reset();const t=(e,n)=>{if(typeof this._firstProgress>"u"&&(e.kind==="markdownContent"||e.kind==="markdownVuln")&&(this._firstProgress=this._stopWatch.elapsed()),n){const o=this._proxy.$handleProgressChunk(this._request.requestId,e),i={report:h=>{o?.then(p=>{p&&(c.MarkdownString.isMarkdownString(h.value)?this._proxy.$handleProgressChunk(this._request.requestId,a.ChatResponseWarningPart.from(h),p):this._proxy.$handleProgressChunk(this._request.requestId,a.ChatResponseReferencePart.from(h),p))})}};Promise.all([o,n?.(i)]).then(([h,p])=>{h!==void 0&&this._proxy.$handleProgressChunk(this._request.requestId,a.ChatTaskResult.from(p),h)})}else this._proxy.$handleProgressChunk(this._request.requestId,e)};this._apiObject={markdown(e){s(this.markdown);const n=new c.ChatResponseMarkdownPart(e),o=a.ChatResponseMarkdownPart.from(n);return t(o),this},markdownWithVulnerabilities(e,n){s(this.markdown),n&&d(r._extension,"chatParticipantAdditions");const o=new c.ChatResponseMarkdownWithVulnerabilitiesPart(e,n),i=a.ChatResponseMarkdownWithVulnerabilitiesPart.from(o);return t(i),this},codeblockUri(e){s(this.codeblockUri),d(r._extension,"chatParticipantAdditions");const n=new c.ChatResponseCodeblockUriPart(e),o=a.ChatResponseCodeblockUriPart.from(n);return t(o),this},filetree(e,n){s(this.filetree);const o=new c.ChatResponseFileTreePart(e,n),i=a.ChatResponseFilesPart.from(o);return t(i),this},anchor(e,n){s(this.anchor);const o=new c.ChatResponseAnchorPart(e,n),i=a.ChatResponseAnchorPart.from(o);return t(i),this},button(e){s(this.anchor);const n=new c.ChatResponseCommandButtonPart(e),o=a.ChatResponseCommandButtonPart.from(n,r._commandsConverter,r._sessionDisposables);return t(o),this},progress(e,n){s(this.progress);const o=new c.ChatResponseProgressPart2(e,n),i=n?a.ChatTask.from(o):a.ChatResponseProgressPart.from(o);return t(i,n),this},warning(e){s(this.progress),d(r._extension,"chatParticipantAdditions");const n=new c.ChatResponseWarningPart(e),o=a.ChatResponseWarningPart.from(n);return t(o),this},reference(e,n){return this.reference2(e,n)},reference2(e,n,o){if(s(this.reference),typeof e=="object"&&"variableName"in e&&d(r._extension,"chatParticipantAdditions"),typeof e=="object"&&"variableName"in e&&!e.value){const i=r._request.variables.variables.find(h=>h.name===e.variableName);if(i){let h;if(i.references?.length)h=i.references.map(p=>({kind:"reference",reference:{variableName:e.variableName,value:p.reference}}));else{const p=new c.ChatResponseReferencePart(e,n,o);h=[a.ChatResponseReferencePart.from(p)]}return h.forEach(p=>t(p)),this}}else{const i=new c.ChatResponseReferencePart(e,n,o),h=a.ChatResponseReferencePart.from(i);t(h)}return this},codeCitation(e,n,o){s(this.codeCitation),d(r._extension,"chatParticipantAdditions");const i=new c.ChatResponseCodeCitationPart(e,n,o),h=a.ChatResponseCodeCitationPart.from(i);t(h)},textEdit(e,n){s(this.textEdit),d(r._extension,"chatParticipantAdditions");const o=new c.ChatResponseTextEditPart(e,n),i=a.ChatResponseTextEditPart.from(o);return t(i),this},detectedParticipant(e,n){s(this.detectedParticipant),d(r._extension,"chatParticipantAdditions");const o=new c.ChatResponseDetectedParticipantPart(e,n),i=a.ChatResponseDetectedParticipantPart.from(o);return t(i),this},confirmation(e,n,o,i){s(this.confirmation),d(r._extension,"chatParticipantAdditions");const h=new c.ChatResponseConfirmationPart(e,n,o,i),p=a.ChatResponseConfirmationPart.from(h);return t(p),this},push(e){if(s(this.push),(e instanceof c.ChatResponseTextEditPart||e instanceof c.ChatResponseMarkdownWithVulnerabilitiesPart||e instanceof c.ChatResponseDetectedParticipantPart||e instanceof c.ChatResponseWarningPart||e instanceof c.ChatResponseConfirmationPart||e instanceof c.ChatResponseCodeCitationPart||e instanceof c.ChatResponseMovePart||e instanceof c.ChatResponseProgressPart2)&&d(r._extension,"chatParticipantAdditions"),e instanceof c.ChatResponseReferencePart)this.reference2(e.value,e.iconPath,e.options);else if(e instanceof c.ChatResponseProgressPart2){const n=e.task?a.ChatTask.from(e):a.ChatResponseProgressPart.from(e);t(n,e.task)}else{const n=a.ChatResponsePart.from(e,r._commandsConverter,r._sessionDisposables);t(n)}return this}}}return this._apiObject}}class m extends E{constructor(r,s,t,e,n){super();this._logService=s;this._commands=t;this._documents=e;this._languageModels=n;this._proxy=r.getProxy(L.MainThreadChatAgents2)}static _idPool=0;_agents=new Map;_proxy;static _participantDetectionProviderIdPool=0;_participantDetectionProviders=new Map;_sessionDisposables=this._register(new w);_completionDisposables=this._register(new w);transferActiveChat(r){this._proxy.$transferActiveChatSession(r)}createChatAgent(r,s,t){const e=m._idPool++,n=new A(r,s,this._proxy,e,t);return this._agents.set(e,n),this._proxy.$registerAgent(e,r.identifier,s,{},void 0),n.apiAgent}createDynamicChatAgent(r,s,t,e){const n=m._idPool++,o=new A(r,s,this._proxy,n,e);return this._agents.set(n,o),this._proxy.$registerAgent(n,r.identifier,s,{isSticky:!0},t),o.apiAgent}registerChatParticipantDetectionProvider(r){const s=m._participantDetectionProviderIdPool++;return this._participantDetectionProviders.set(s,r),this._proxy.$registerChatParticipantDetectionProvider(s),H(()=>{this._participantDetectionProviders.delete(s),this._proxy.$unregisterChatParticipantDetectionProvider(s)})}async $detectChatParticipant(r,s,t,e,n){const{request:o,location:i,history:h}=await this._createRequest(s,t),p=this._participantDetectionProviders.get(r);if(p)return p.provideParticipantDetection(a.ChatAgentRequest.to(o,i),{history:h},{participants:e.participants,location:a.ChatLocation.to(e.location)},n)}async _createRequest(r,s){const t=y(r),e=await this.prepareHistoryTurns(t.agentId,s);let n;if(t.locationData?.type===v.Editor){const o=this._documents.getDocument(t.locationData.document);n=new c.ChatRequestEditorData(o,a.Selection.to(t.locationData.selection),a.Range.to(t.locationData.wholeRange))}else if(t.locationData?.type===v.Notebook){const o=this._documents.getDocument(t.locationData.sessionInputUri);n=new c.ChatRequestNotebookData(o)}else t.locationData?.type,v.Terminal;return{request:t,location:n,history:e}}async $invokeAgent(r,s,t,e){const n=this._agents.get(r);if(!n)throw new Error(`[CHAT](${r}) CANNOT invoke agent because the agent is not registered`);let o;try{const{request:i,location:h,history:p}=await this._createRequest(s,t);let u=this._sessionDisposables.get(i.sessionId);u||(u=new b,this._sessionDisposables.set(i.sessionId,u)),o=new N(n.extension,i,this._proxy,this._commands.converter,u);const f=a.ChatAgentRequest.to(i,h);i.userSelectedModelId&&_(n.extension,"chatParticipantAdditions")&&(f.userSelectedModel=await this._languageModels.getLanguageModelByIdentifier(n.extension,i.userSelectedModelId));const C=n.invoke(f,{history:p},o.apiObject,e);return await q(Promise.resolve(C).then(g=>{if(g?.metadata)try{JSON.stringify(g.metadata)}catch(T){const x=`result.metadata MUST be JSON.stringify-able. Got error: ${T.message}`;return this._logService.error(`[${n.extension.identifier.value}] [@${n.id}] ${x}`,n.extension),{errorDetails:{message:x},timings:o?.timings,nextQuestion:g.nextQuestion}}let P;return g?.errorDetails&&(P={...g.errorDetails,responseIsIncomplete:!0}),P?.responseIsRedacted&&d(n.extension,"chatParticipantPrivate"),{errorDetails:P,timings:o?.timings,metadata:g?.metadata,nextQuestion:g?.nextQuestion}}),e)}catch(i){return this._logService.error(i,n.extension),i instanceof c.LanguageModelError&&i.cause&&(i=i.cause),{errorDetails:{message:M(i),responseIsIncomplete:!0}}}finally{o?.close()}}async prepareHistoryTurns(r,s){const t=[];for(const e of s.history){const n=a.ChatAgentResult.to(e.result),o=r===e.request.agentId?n:{...n,metadata:void 0},i=e.request.variables.variables.filter(f=>!f.isTool).map(a.ChatPromptReference.to),h=e.request.variables.variables.filter(f=>f.isTool).map(a.ChatLanguageModelToolReference.to),p=new c.ChatRequestTurn(e.request.message,e.request.command,i,e.request.agentId);p.toolReferences=h,t.push(p);const u=k(e.response.map(f=>a.ChatResponsePart.toContent(f,this._commands.converter)));t.push(new c.ChatResponseTurn(u,o,e.request.agentId,e.request.command))}return t}$releaseSession(r){this._sessionDisposables.deleteAndDispose(r)}async $provideFollowups(r,s,t,e,n){const o=this._agents.get(s);if(!o)return Promise.resolve([]);const i=y(r),h=await this.prepareHistoryTurns(o.id,e),p=a.ChatAgentResult.to(t);return(await o.provideFollowups(p,{history:h},n)).filter(u=>{const f=!u.participant||S.some(this._agents.values(),C=>C.id===u.participant&&U.equals(C.extension.identifier,o.extension.identifier));return f||this._logService.warn(`[@${o.id}] ChatFollowup refers to an unknown participant: ${u.participant}`),f}).map(u=>a.ChatFollowup.from(u,i))}$acceptFeedback(r,s,t){const e=this._agents.get(r);if(!e)return;const n=a.ChatAgentResult.to(s);let o;switch(t.direction){case I.Down:o=c.ChatResultFeedbackKind.Unhelpful;break;case I.Up:o=c.ChatResultFeedbackKind.Helpful;break}const i={result:n,kind:o,unhelpfulReason:_(e.extension,"chatParticipantAdditions")?t.reason:void 0};e.acceptFeedback(Object.freeze(i))}$acceptAction(r,s,t){const e=this._agents.get(r);if(!e||t.action.kind==="vote")return;const n=a.ChatAgentUserActionEvent.to(s,t,this._commands.converter);n&&e.acceptAction(Object.freeze(n))}async $invokeCompletionProvider(r,s,t){const e=this._agents.get(r);if(!e)return[];let n=this._completionDisposables.get(r);return n?n.clear():(n=new b,this._completionDisposables.set(r,n)),(await e.invokeCompletionProvider(s,t)).map(i=>a.ChatAgentCompletionItem.from(i,this._commands.converter,n))}async $provideWelcomeMessage(r,s){const t=this._agents.get(r);if(t)return await t.provideWelcomeMessage(s)}async $provideChatTitle(r,s,t){const e=this._agents.get(r);if(!e)return;const n=await this.prepareHistoryTurns(e.id,{history:s});return await e.provideTitle({history:n},t)}async $provideSampleQuestions(r,s,t){const e=this._agents.get(r);if(e)return(await e.provideSampleQuestions(a.ChatLocation.to(s),t)).map(n=>a.ChatFollowup.from(n,void 0))}}class A{constructor(l,r,s,t,e){this.extension=l;this.id=r;this._proxy=s;this._handle=t;this._requestHandler=e}_followupProvider;_iconPath;_helpTextPrefix;_helpTextVariablesPrefix;_helpTextPostfix;_isSecondary;_onDidReceiveFeedback=new R;_onDidPerformAction=new R;_supportIssueReporting;_agentVariableProvider;_welcomeMessageProvider;_titleProvider;_requester;_supportsSlowReferences;acceptFeedback(l){this._onDidReceiveFeedback.fire(l)}acceptAction(l){this._onDidPerformAction.fire(l)}async invokeCompletionProvider(l,r){return this._agentVariableProvider?await this._agentVariableProvider.provider.provideCompletionItems(l,r)??[]:[]}async provideFollowups(l,r,s){if(!this._followupProvider)return[];const t=await this._followupProvider.provideFollowups(l,r,s);return t?t.filter(e=>!(e&&"commandId"in e)).filter(e=>!(e&&"message"in e)):[]}async provideWelcomeMessage(l){if(!this._welcomeMessageProvider?.provideWelcomeMessage)return;const r=await this._welcomeMessageProvider.provideWelcomeMessage(l),s=r?.icon;if(!(!r||!$.isThemeIcon(s)))return{...r,icon:s,message:a.MarkdownString.from(r.message)}}async provideTitle(l,r){if(this._titleProvider)return await this._titleProvider.provideChatTitle(l,r)??void 0}async provideSampleQuestions(l,r){if(!this._welcomeMessageProvider||!this._welcomeMessageProvider.provideSampleQuestions)return[];const s=await this._welcomeMessageProvider.provideSampleQuestions(l,r);return s||[]}get apiAgent(){let l=!1,r=!1;const s=()=>{l||r||(r=!0,queueMicrotask(()=>{this._proxy.$updateAgent(this._handle,{icon:this._iconPath?this._iconPath instanceof W?this._iconPath:"light"in this._iconPath?this._iconPath.light:void 0:void 0,iconDark:this._iconPath&&"dark"in this._iconPath?this._iconPath.dark:void 0,themeIcon:this._iconPath instanceof c.ThemeIcon?this._iconPath:void 0,hasFollowups:this._followupProvider!==void 0,isSecondary:this._isSecondary,helpTextPrefix:!this._helpTextPrefix||typeof this._helpTextPrefix=="string"?this._helpTextPrefix:a.MarkdownString.from(this._helpTextPrefix),helpTextVariablesPrefix:!this._helpTextVariablesPrefix||typeof this._helpTextVariablesPrefix=="string"?this._helpTextVariablesPrefix:a.MarkdownString.from(this._helpTextVariablesPrefix),helpTextPostfix:!this._helpTextPostfix||typeof this._helpTextPostfix=="string"?this._helpTextPostfix:a.MarkdownString.from(this._helpTextPostfix),supportIssueReporting:this._supportIssueReporting,requester:this._requester,supportsSlowVariables:this._supportsSlowReferences}),r=!1}))},t=this;return{get id(){return t.id},get iconPath(){return t._iconPath},set iconPath(e){t._iconPath=e,s()},get requestHandler(){return t._requestHandler},set requestHandler(e){V(typeof e=="function","Invalid request handler"),t._requestHandler=e},get followupProvider(){return t._followupProvider},set followupProvider(e){t._followupProvider=e,s()},get helpTextPrefix(){return d(t.extension,"defaultChatParticipant"),t._helpTextPrefix},set helpTextPrefix(e){d(t.extension,"defaultChatParticipant"),t._helpTextPrefix=e,s()},get helpTextVariablesPrefix(){return d(t.extension,"defaultChatParticipant"),t._helpTextVariablesPrefix},set helpTextVariablesPrefix(e){d(t.extension,"defaultChatParticipant"),t._helpTextVariablesPrefix=e,s()},get helpTextPostfix(){return d(t.extension,"defaultChatParticipant"),t._helpTextPostfix},set helpTextPostfix(e){d(t.extension,"defaultChatParticipant"),t._helpTextPostfix=e,s()},get isSecondary(){return d(t.extension,"defaultChatParticipant"),t._isSecondary},set isSecondary(e){d(t.extension,"defaultChatParticipant"),t._isSecondary=e,s()},get supportIssueReporting(){return d(t.extension,"chatParticipantPrivate"),t._supportIssueReporting},set supportIssueReporting(e){d(t.extension,"chatParticipantPrivate"),t._supportIssueReporting=e,s()},get onDidReceiveFeedback(){return t._onDidReceiveFeedback.event},set participantVariableProvider(e){if(d(t.extension,"chatParticipantAdditions"),t._agentVariableProvider=e,e){if(!e.triggerCharacters.length)throw new Error("triggerCharacters are required");t._proxy.$registerAgentCompletionsProvider(t._handle,t.id,e.triggerCharacters)}else t._proxy.$unregisterAgentCompletionsProvider(t._handle,t.id)},get participantVariableProvider(){return d(t.extension,"chatParticipantAdditions"),t._agentVariableProvider},set welcomeMessageProvider(e){d(t.extension,"defaultChatParticipant"),t._welcomeMessageProvider=e,s()},get welcomeMessageProvider(){return d(t.extension,"defaultChatParticipant"),t._welcomeMessageProvider},set titleProvider(e){d(t.extension,"defaultChatParticipant"),t._titleProvider=e,s()},get titleProvider(){return d(t.extension,"defaultChatParticipant"),t._titleProvider},onDidPerformAction:_(this.extension,"chatParticipantAdditions")?this._onDidPerformAction.event:void 0,set requester(e){t._requester=e,s()},get requester(){return t._requester},set supportsSlowReferences(e){d(t.extension,"chatParticipantPrivate"),t._supportsSlowReferences=e,s()},get supportsSlowReferences(){return d(t.extension,"chatParticipantPrivate"),t._supportsSlowReferences},dispose(){l=!0,t._followupProvider=void 0,t._onDidReceiveFeedback.dispose(),t._proxy.$unregisterAgent(t._handle)}}}invoke(l,r,s,t){return this._requestHandler(l,r,s,t)}}export{m as ExtHostChatAgents2};
