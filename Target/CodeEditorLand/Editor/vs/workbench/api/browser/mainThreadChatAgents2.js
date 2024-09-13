var w=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var A=(l,s,e,i)=>{for(var t=i>1?void 0:i?D(s,e):s,r=l.length-1,o;r>=0;r--)(o=l[r])&&(t=(i?o(s,e,t):o(t))||t);return i&&t&&w(s,e,t),t},h=(l,s)=>(e,i)=>s(e,i,l);import{DeferredPromise as T}from"../../../base/common/async.js";import{Emitter as k}from"../../../base/common/event.js";import{Disposable as M,DisposableMap as C}from"../../../base/common/lifecycle.js";import{revive as I}from"../../../base/common/marshalling.js";import{escapeRegExpCharacters as $}from"../../../base/common/strings.js";import{ThemeIcon as E}from"../../../base/common/themables.js";import{URI as R}from"../../../base/common/uri.js";import{Range as f}from"../../../editor/common/core/range.js";import{getWordAtText as P}from"../../../editor/common/core/wordHelper.js";import{CompletionItemKind as N}from"../../../editor/common/languages.js";import{ILanguageFeaturesService as W}from"../../../editor/common/services/languageFeatures.js";import{ExtensionIdentifier as F}from"../../../platform/extensions/common/extensions.js";import{IInstantiationService as L}from"../../../platform/instantiation/common/instantiation.js";import{ILogService as H}from"../../../platform/log/common/log.js";import{IChatWidgetService as j}from"../../contrib/chat/browser/chat.js";import{ChatInputPart as q}from"../../contrib/chat/browser/chatInputPart.js";import{AddDynamicVariableAction as U}from"../../contrib/chat/browser/contrib/chatDynamicVariables.js";import{ChatAgentLocation as V,IChatAgentService as B}from"../../contrib/chat/common/chatAgents.js";import{ChatRequestAgentPart as Q}from"../../contrib/chat/common/chatParserTypes.js";import{ChatRequestParser as K}from"../../contrib/chat/common/chatRequestParser.js";import{IChatService as z}from"../../contrib/chat/common/chatService.js";import{extHostNamedCustomer as G}from"../../services/extensions/common/extHostCustomers.js";import{IExtensionService as J}from"../../services/extensions/common/extensions.js";import{ExtHostContext as O,MainContext as X}from"../common/extHost.protocol.js";class Y{constructor(s){this.content=s}kind="progressTask";deferred=new T;_onDidAddProgress=new k;get onDidAddProgress(){return this._onDidAddProgress.event}progress=[];task(){return this.deferred.p}isSettled(){return this.deferred.isSettled}complete(s){this.deferred.complete(s)}add(s){this.progress.push(s),this._onDidAddProgress.fire(s)}}let y=class extends M{constructor(e,i,t,r,o,a,g,d){super();this._chatAgentService=i;this._chatService=t;this._languageFeaturesService=r;this._chatWidgetService=o;this._instantiationService=a;this._logService=g;this._extensionService=d;this._proxy=e.getProxy(O.ExtHostChatAgents2),this._register(this._chatService.onDidDisposeSession(n=>{this._proxy.$releaseSession(n.sessionId)})),this._register(this._chatService.onDidPerformUserAction(n=>{if(typeof n.agentId=="string"){for(const[p,m]of this._agents)if(m.id===n.agentId){n.action.kind==="vote"?this._proxy.$acceptFeedback(p,n.result??{},n.action):this._proxy.$acceptAction(p,n.result||{},n);break}}}))}_agents=this._register(new C);_agentCompletionProviders=this._register(new C);_agentIdsToCompletionProviders=this._register(new C);_chatParticipantDetectionProviders=this._register(new C);_pendingProgress=new Map;_proxy;_responsePartHandlePool=0;_activeTasks=new Map;$unregisterAgent(e){this._agents.deleteAndDispose(e)}$transferActiveChatSession(e){const i=this._chatWidgetService.lastFocusedWidget,t=i?.viewModel?.model.sessionId;if(!t){this._logService.error("MainThreadChat#$transferActiveChatSession: No active chat session found");return}const r=i?.inputEditor.getValue()??"";this._chatService.transferChatSession({sessionId:t,inputValue:r},R.revive(e))}$registerAgent(e,i,t,r,o){const a=this._chatAgentService.getAgent(t);if(!a&&!o)throw this._chatAgentService.getAgentsByName(t).length?new Error(`chatParticipant must be declared with an ID in package.json. The "id" property may be missing! "${t}"`):new Error(`chatParticipant must be declared in package.json: ${t}`);const g={invoke:async(n,p,m,u)=>{this._pendingProgress.set(n.requestId,p);try{return await this._proxy.$invokeAgent(e,n,{history:m},u)??{}}finally{this._pendingProgress.delete(n.requestId)}},provideFollowups:async(n,p,m,u)=>this._agents.get(e)?.hasFollowups?this._proxy.$provideFollowups(n,e,p,{history:m},u):[],provideWelcomeMessage:(n,p)=>this._proxy.$provideWelcomeMessage(e,n,p),provideChatTitle:(n,p)=>this._proxy.$provideChatTitle(e,n,p),provideSampleQuestions:(n,p)=>this._proxy.$provideSampleQuestions(e,n,p)};let d;if(!a&&o){const n=this._extensionService.extensions.find(p=>F.equals(p.identifier,i));d=this._chatAgentService.registerDynamicAgent({id:t,name:o.name,description:o.description,extensionId:i,extensionDisplayName:n?.displayName??i.value,extensionPublisherId:n?.publisher??"",publisherDisplayName:o.publisherName,fullName:o.fullName,metadata:I(r),slashCommands:[],disambiguation:[],locations:[V.Panel]},g)}else d=this._chatAgentService.registerAgentImplementation(t,g);this._agents.set(e,{id:t,extensionId:i,dispose:d.dispose,hasFollowups:r.hasFollowups})}$updateAgent(e,i){const t=this._agents.get(e);if(!t){this._logService.error(`MainThreadChatAgents2#$updateAgent: No agent with handle ${e} registered`);return}t.hasFollowups=i.hasFollowups,this._chatAgentService.updateAgent(t.id,I(i))}async $handleProgressChunk(e,i,t){const r=I(i);if(r.kind==="progressTask"){const o=++this._responsePartHandlePool,a=`${e}_${o}`,g=new Y(r.content);return this._activeTasks.set(a,g),this._pendingProgress.get(e)?.(g),o}else if(t!==void 0){const o=`${e}_${t}`,a=this._activeTasks.get(o);switch(r.kind){case"progressTaskResult":return a&&r.content?(a.complete(r.content.value),this._activeTasks.delete(o)):a?.complete(void 0),t;case"warning":case"reference":a?.add(r);return}}this._pendingProgress.get(e)?.(r)}$registerAgentCompletionsProvider(e,i,t){const r=async(o,a)=>(await this._proxy.$invokeCompletionProvider(e,o,a)).map(d=>({...d,icon:d.icon?E.fromId(d.icon):void 0}));this._agentIdsToCompletionProviders.set(i,this._chatAgentService.registerAgentCompletionProvider(i,r)),this._agentCompletionProviders.set(e,this._languageFeaturesService.completionProvider.register({scheme:q.INPUT_SCHEME,hasAccessToAllModels:!0},{_debugDisplayName:"chatAgentCompletions:"+e,triggerCharacters:t,provideCompletionItems:async(o,a,g,d)=>{const n=this._chatWidgetService.getWidgetByInputUri(o.uri);if(!n||!n.viewModel)return;const p=t.map(c=>$(c)).join(""),m=new RegExp(`[${p}]\\S*`,"g"),u=P(a.column,m,o.getLineContent(a.lineNumber),0)?.word??"";if(u&&!t.some(c=>u.startsWith(c)))return;const b=this._instantiationService.createInstance(K).parseChatRequest(n.viewModel.sessionId,o.getValue()).parts.find(c=>c instanceof Q),x=this._agents.get(e)?.id;if(b?.agent.id!==x)return;const v=Z(o,a,m);return v?{suggestions:(await r(u,d)).map(c=>{const _=c.insertText??(typeof c.label=="string"?c.label:c.label.label),S=new f(v.insert.startLineNumber,v.insert.startColumn,v.insert.endLineNumber,v.insert.startColumn+_.length);return{label:c.label,range:v,insertText:_+" ",kind:N.Text,detail:c.detail,documentation:c.documentation,command:{id:U.ID,title:"",arguments:[{id:c.id,widget:n,range:S,variableData:I(c.value),command:c.command}]}}})}:null}}))}$unregisterAgentCompletionsProvider(e,i){this._agentCompletionProviders.deleteAndDispose(e),this._agentIdsToCompletionProviders.deleteAndDispose(i)}$registerChatParticipantDetectionProvider(e){this._chatParticipantDetectionProviders.set(e,this._chatAgentService.registerChatParticipantDetectionProvider(e,{provideParticipantDetection:async(i,t,r,o)=>await this._proxy.$detectChatParticipant(e,i,{history:t},r,o)}))}$unregisterChatParticipantDetectionProvider(e){this._chatParticipantDetectionProviders.deleteAndDispose(e)}};y=A([G(X.MainThreadChatAgents2),h(1,B),h(2,z),h(3,W),h(4,j),h(5,L),h(6,H),h(7,J)],y);function Z(l,s,e){const i=P(s.column,e,l.getLineContent(s.lineNumber),0);if(!i&&l.getWordUntilPosition(s).word)return;let t,r;return i?(t=new f(s.lineNumber,i.startColumn,s.lineNumber,s.column),r=new f(s.lineNumber,i.startColumn,s.lineNumber,i.endColumn)):t=r=f.fromPositions(s),{insert:t,replace:r}}export{y as MainThreadChatAgents2,Y as MainThreadChatTask};
