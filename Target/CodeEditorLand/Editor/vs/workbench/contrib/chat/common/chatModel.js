var U=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var v=(i,a,e,t)=>{for(var n=t>1?void 0:t?T(a,e):a,s=i.length-1,r;s>=0;s--)(r=i[s])&&(n=(t?r(a,e,n):r(n))||n);return t&&n&&U(a,e,n),n},p=(i,a)=>(e,t)=>a(e,t,i);import{asArray as z}from"../../../../base/common/arrays.js";import{DeferredPromise as x}from"../../../../base/common/async.js";import{Emitter as I}from"../../../../base/common/event.js";import{MarkdownString as R,isMarkdownString as S}from"../../../../base/common/htmlContent.js";import{Disposable as D}from"../../../../base/common/lifecycle.js";import{revive as _}from"../../../../base/common/marshalling.js";import{equals as V}from"../../../../base/common/objects.js";import{basename as q,isEqual as P}from"../../../../base/common/resources.js";import"../../../../base/common/themables.js";import{URI as M,isUriComponents as F}from"../../../../base/common/uri.js";import{generateUuid as k}from"../../../../base/common/uuid.js";import{OffsetRange as L}from"../../../../editor/common/core/offsetRange.js";import"../../../../editor/common/core/range.js";import"../../../../editor/common/languages.js";import{localize as b}from"../../../../nls.js";import{IInstantiationService as O}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as N}from"../../../../platform/log/common/log.js";import{ChatAgentLocation as y,IChatAgentService as w,reviveSerializedAgent as W}from"./chatAgents.js";import{ChatRequestTextPart as G,reviveParsedChatRequest as J}from"./chatParserTypes.js";import{isIUsedContext as $}from"./chatService.js";import"./chatVariables.js";class m{constructor(a,e,t,n=0,s,r,o){this._session=a;this.message=e;this._variableData=t;this._attempt=n;this._confirmation=s;this._locationData=r;this._attachedContext=o;this.id="request_"+m.nextId++}static nextId=0;response;id;get session(){return this._session}get username(){return this.session.requesterUsername}get avatarIconUri(){return this.session.requesterAvatarIconUri}get attempt(){return this._attempt}get variableData(){return this._variableData}set variableData(a){this._variableData=a}get confirmation(){return this._confirmation}get locationData(){return this._locationData}get attachedContext(){return this._attachedContext}adoptTo(a){this._session=a}}class H extends D{_onDidChangeValue=this._register(new I);get onDidChangeValue(){return this._onDidChangeValue.event}_responseParts;_responseRepr="";_markdownContent="";_citations=[];get value(){return this._responseParts}constructor(a){super(),this._responseParts=z(a).map(e=>S(e)?{content:e,kind:"markdownContent"}:"kind"in e?e:{kind:"treeData",treeData:e}),this._updateRepr(!0)}toString(){return this._responseRepr}toMarkdown(){return this._markdownContent}clear(){this._responseParts=[],this._updateRepr(!0)}updateContent(a,e){if(a.kind==="markdownContent"){const t=this._responseParts.length-1,n=this._responseParts[t];!n||n.kind!=="markdownContent"||!j(n.content,a.content)?this._responseParts.push(a):n.content=K(n.content,a.content),this._updateRepr(e)}else if(a.kind==="textEdit"){if(a.edits.length>0){let t=!1;for(let n=0;!t&&n<this._responseParts.length;n++){const s=this._responseParts[n];s.kind==="textEditGroup"&&P(s.uri,a.uri)&&(s.edits.push(a.edits),t=!0)}t||this._responseParts.push({kind:"textEditGroup",uri:a.uri,edits:[a.edits]}),this._updateRepr(e)}}else if(a.kind==="progressTask"){const t=this._responseParts.push(a)-1;this._updateRepr(e);const n=a.onDidAddProgress(()=>{this._updateRepr(!1)});a.task?.().then(s=>{n.dispose(),typeof s=="string"&&(this._responseParts[t].content=new R(s)),this._updateRepr(!1)})}else this._responseParts.push(a),this._updateRepr(e)}addCitation(a){this._citations.push(a),this._updateRepr()}_updateRepr(a){const e=t=>"uri"in t.inlineReference?q(t.inlineReference.uri):"name"in t.inlineReference?t.inlineReference.name:q(t.inlineReference);this._responseRepr=this._responseParts.map(t=>t.kind==="treeData"?"":t.kind==="inlineReference"?e(t):t.kind==="command"?t.command.title:t.kind==="textEditGroup"?b("editsSummary","Made changes."):t.kind==="progressMessage"?"":t.kind==="confirmation"?`${t.title}
${t.message}`:t.content.value).filter(t=>t.length>0).join(`

`),this._responseRepr+=this._citations.length?`

`+X(this._citations):"",this._markdownContent=this._responseParts.map(t=>t.kind==="inlineReference"?e(t):t.kind==="markdownContent"||t.kind==="markdownVuln"?t.content.value:"").filter(t=>t.length>0).join(`

`),a||this._onDidChangeValue.fire()}}class h extends D{constructor(e,t,n,s,r,o=!1,c=!1,g,d,Z,A){super();this._session=t;this._agent=n;this._slashCommand=s;this.requestId=r;this._isComplete=o;this._isCanceled=c;this._vote=g;this._voteDownReason=d;this._result=Z;this._isStale=Array.isArray(e)&&(e.length!==0||S(e)&&e.value.length!==0),this._followups=A?[...A]:void 0,this._response=this._register(new H(e)),this._register(this._response.onDidChangeValue(()=>this._onDidChange.fire())),this.id="response_"+h.nextId++}_onDidChange=this._register(new I);onDidChange=this._onDidChange.event;static nextId=0;id;get session(){return this._session}get isComplete(){return this._isComplete}get isCanceled(){return this._isCanceled}get vote(){return this._vote}get voteDownReason(){return this._voteDownReason}get followups(){return this._followups}_response;get response(){return this._response}get result(){return this._result}get username(){return this.session.responderUsername}get avatarIcon(){return this.session.responderAvatarIcon}_followups;get agent(){return this._agent}get slashCommand(){return this._slashCommand}_agentOrSlashCommandDetected;get agentOrSlashCommandDetected(){return this._agentOrSlashCommandDetected??!1}_usedContext;get usedContext(){return this._usedContext}_contentReferences=[];get contentReferences(){return this._contentReferences}_codeCitations=[];get codeCitations(){return this._codeCitations}_progressMessages=[];get progressMessages(){return this._progressMessages}_isStale=!1;get isStale(){return this._isStale}updateContent(e,t){this._response.updateContent(e,t)}applyReference(e){e.kind==="usedContext"?this._usedContext=e:e.kind==="reference"&&(this._contentReferences.push(e),this._onDidChange.fire())}applyCodeCitation(e){this._codeCitations.push(e),this._response.addCitation(e),this._onDidChange.fire()}setAgent(e,t){this._agent=e,this._slashCommand=t,this._agentOrSlashCommandDetected=!0,this._onDidChange.fire()}setResult(e){this._result=e,this._onDidChange.fire()}complete(){this._result?.errorDetails?.responseIsRedacted&&this._response.clear(),this._isComplete=!0,this._onDidChange.fire()}cancel(){this._isComplete=!0,this._isCanceled=!0,this._onDidChange.fire()}setFollowups(e){this._followups=e,this._onDidChange.fire()}setVote(e){this._vote=e,this._onDidChange.fire()}setVoteDownReason(e){this._voteDownReason=e,this._onDidChange.fire()}setEditApplied(e,t){return!this.response.value.includes(e)||!e.state?!1:(e.state.applied=t,this._onDidChange.fire(),!0)}adoptTo(e){this._session=e,this._onDidChange.fire()}}function et(i){return Y(i),"version"in i?i.version===2?{...i,version:3,customTitle:i.computedTitle}:i:{version:3,...i,lastMessageDate:i.creationDate,customTitle:void 0}}function Y(i){i.sessionId||(i.sessionId=k()),i.creationDate||(i.creationDate=E()),"version"in i&&(i.version===2||i.version===3)&&(i.lastMessageDate||(i.lastMessageDate=E()))}function E(){const i=new Date;return i.setFullYear(i.getFullYear()-1),i.getTime()}function B(i){const a=i;return typeof a=="object"&&typeof a.requesterUsername=="string"}function C(i){const a=i;return B(i)&&typeof a.creationDate=="number"&&typeof a.sessionId=="string"&&i.requests.every(e=>!e.usedContext||$(e.usedContext))}var Q=(t=>(t[t.Removal=0]="Removal",t[t.Resend=1]="Resend",t[t.Adoption=2]="Adoption",t))(Q||{}),f=(t=>(t[t.Created=0]="Created",t[t.Initializing=1]="Initializing",t[t.Initialized=2]="Initialized",t))(f||{});let u=class extends D{constructor(e,t,n,s,r){super();this.initialData=e;this._initialLocation=t;this.logService=n;this.chatAgentService=s;this.instantiationService=r;this._isImported=!!e&&!C(e)||(e?.isImported??!1),this._sessionId=C(e)&&e.sessionId||k(),this._requests=e?this._deserialize(e):[],this._creationDate=C(e)&&e.creationDate||Date.now(),this._lastMessageDate=C(e)&&e.lastMessageDate||this._creationDate,this._customTitle=C(e)?e.customTitle:void 0,this._initialRequesterAvatarIconUri=e?.requesterAvatarIconUri&&M.revive(e.requesterAvatarIconUri),this._initialResponderAvatarIconUri=F(e?.responderAvatarIconUri)?M.revive(e.responderAvatarIconUri):e?.responderAvatarIconUri}static getDefaultTitle(e){const t=e.at(0)?.message??"";return(typeof t=="string"?t:t.text).split(`
`)[0].substring(0,50)}_onDidDispose=this._register(new I);onDidDispose=this._onDidDispose.event;_onDidChange=this._register(new I);onDidChange=this._onDidChange.event;_requests;_initState=0;_isInitializedDeferred=new x;_welcomeMessage;get welcomeMessage(){return this._welcomeMessage}_sessionId;get sessionId(){return this._sessionId}get requestInProgress(){const e=this.lastRequest;return!!e?.response&&!e.response.isComplete}get hasRequests(){return this._requests.length>0}get lastRequest(){return this._requests.at(-1)}_creationDate;get creationDate(){return this._creationDate}_lastMessageDate;get lastMessageDate(){return this._lastMessageDate}get _defaultAgent(){return this.chatAgentService.getDefaultAgent(y.Panel)}get requesterUsername(){return this._defaultAgent?.metadata.requester?.name??this.initialData?.requesterUsername??""}get responderUsername(){return this._defaultAgent?.fullName??this.initialData?.responderUsername??""}_initialRequesterAvatarIconUri;get requesterAvatarIconUri(){return this._defaultAgent?.metadata.requester?.icon??this._initialRequesterAvatarIconUri}_initialResponderAvatarIconUri;get responderAvatarIcon(){return this._defaultAgent?.metadata.themeIcon??this._initialResponderAvatarIconUri}get initState(){return this._initState}_isImported=!1;get isImported(){return this._isImported}_customTitle;get customTitle(){return this._customTitle}get title(){return this._customTitle||u.getDefaultTitle(this._requests)}get initialLocation(){return this._initialLocation}_deserialize(e){const t=e.requests;if(!Array.isArray(t))return this.logService.error(`Ignoring malformed session data: ${JSON.stringify(e)}`),[];if(e.welcomeMessage){const n=e.welcomeMessage.map(s=>typeof s=="string"?new R(s):s);this._welcomeMessage=this.instantiationService.createInstance(l,n,[])}try{return t.map(n=>{const s=typeof n.message=="string"?this.getParsedRequestFromString(n.message):J(n.message),r=this.reviveVariableData(n.variableData),o=new m(this,s,r);if(n.response||n.result||n.responseErrorDetails){const c=n.agent&&"metadata"in n.agent?W(n.agent):void 0,g="responseErrorDetails"in n?{errorDetails:n.responseErrorDetails}:n.result;o.response=new h(n.response??[new R(n.response)],this,c,n.slashCommand,o.id,!0,n.isCanceled,n.vote,n.voteDownReason,g,n.followups),n.usedContext&&o.response.applyReference(_(n.usedContext)),n.contentReferences?.forEach(d=>o.response.applyReference(_(d))),n.codeCitations?.forEach(d=>o.response.applyCodeCitation(_(d)))}return o})}catch(n){return this.logService.error("Failed to parse chat data",n),[]}}reviveVariableData(e){const t=e&&Array.isArray(e.variables)?e:{variables:[]};return t.variables=t.variables.map(n=>n&&"values"in n&&Array.isArray(n.values)?{id:n.id??"",name:n.name,value:n.values[0]?.value,range:n.range,modelDescription:n.modelDescription,references:n.references}:n),t}getParsedRequestFromString(e){const t=[new G(new L(0,e.length),{startColumn:1,startLineNumber:1,endColumn:1,endLineNumber:1},e)];return{text:e,parts:t}}startInitialize(){if(this.initState!==0)throw new Error(`ChatModel is in the wrong state for startInitialize: ${f[this.initState]}`);this._initState=1}deinitialize(){this._initState=0,this._isInitializedDeferred=new x}initialize(e){if(this.initState!==1)throw new Error(`ChatModel is in the wrong state for initialize: ${f[this.initState]}`);this._initState=2,this._welcomeMessage||(this._welcomeMessage=e),this._isInitializedDeferred.complete(),this._onDidChange.fire({kind:"initialize"})}setInitializationError(e){if(this.initState!==1)throw new Error(`ChatModel is in the wrong state for setInitializationError: ${f[this.initState]}`);this._isInitializedDeferred.isSettled||this._isInitializedDeferred.error(e)}waitForInitialization(){return this._isInitializedDeferred.p}getRequests(){return this._requests}addRequest(e,t,n,s,r,o,c,g){const d=new m(this,e,t,n,o,c,g);return d.response=new h([],this,s,r,d.id),this._requests.push(d),this._lastMessageDate=Date.now(),this._onDidChange.fire({kind:"addRequest",request:d}),d}setCustomTitle(e){this._customTitle=e}updateRequest(e,t){e.variableData=t,this._onDidChange.fire({kind:"changedRequest",request:e})}adoptRequest(e){const t=e.session,n=t._requests.findIndex(s=>s.id===e.id);n!==-1&&(t._requests.splice(n,1),e.adoptTo(this),e.response?.adoptTo(this),this._requests.push(e),t._onDidChange.fire({kind:"removeRequest",requestId:e.id,responseId:e.response?.id,reason:2}),this._onDidChange.fire({kind:"addRequest",request:e}))}acceptResponseProgress(e,t,n){if(e.response||(e.response=new h([],this,void 0,void 0,e.id)),e.response.isComplete)throw new Error("acceptResponseProgress: Adding progress to a completed response");if(t.kind==="markdownContent"||t.kind==="treeData"||t.kind==="inlineReference"||t.kind==="markdownVuln"||t.kind==="progressMessage"||t.kind==="command"||t.kind==="textEdit"||t.kind==="warning"||t.kind==="progressTask"||t.kind==="confirmation")e.response.updateContent(t,n);else if(t.kind==="usedContext"||t.kind==="reference")e.response.applyReference(t);else if(t.kind==="agentDetection"){const s=this.chatAgentService.getAgent(t.agentId);s&&(e.response.setAgent(s,t.command),this._onDidChange.fire({kind:"setAgent",agent:s,command:t.command}))}else t.kind==="codeCitation"?e.response.applyCodeCitation(t):t.kind==="move"?this._onDidChange.fire({kind:"move",target:t.uri,range:t.range}):this.logService.error(`Couldn't handle progress: ${JSON.stringify(t)}`)}removeRequest(e,t=0){const n=this._requests.findIndex(r=>r.id===e),s=this._requests[n];n!==-1&&(this._onDidChange.fire({kind:"removeRequest",requestId:s.id,responseId:s.response?.id,reason:t}),this._requests.splice(n,1),s.response?.dispose())}cancelRequest(e){e.response&&e.response.cancel()}setResponse(e,t){e.response||(e.response=new h([],this,void 0,void 0,e.id)),e.response.setResult(t)}completeResponse(e){if(!e.response)throw new Error("Call setResponse before completeResponse");e.response.complete()}setFollowups(e,t){e.response&&e.response.setFollowups(t)}setResponseModel(e,t){e.response=t,this._onDidChange.fire({kind:"addResponse",response:t})}toExport(){return{requesterUsername:this.requesterUsername,requesterAvatarIconUri:this.requesterAvatarIconUri,responderUsername:this.responderUsername,responderAvatarIconUri:this.responderAvatarIcon,initialLocation:this.initialLocation,welcomeMessage:this._welcomeMessage?.content.map(e=>Array.isArray(e)?e:e.value),requests:this._requests.map(e=>{const t={...e.message,parts:e.message.parts.map(r=>r&&"toJSON"in r?r.toJSON():r)},n=e.response?.agent,s=n&&"toJSON"in n?n.toJSON():n?{...n}:void 0;return{message:t,variableData:e.variableData,response:e.response?e.response.response.value.map(r=>r.kind==="treeData"?r.treeData:r.kind==="markdownContent"?r.content:r):void 0,result:e.response?.result,followups:e.response?.followups,isCanceled:e.response?.isCanceled,vote:e.response?.vote,voteDownReason:e.response?.voteDownReason,agent:s,slashCommand:e.response?.slashCommand,usedContext:e.response?.usedContext,contentReferences:e.response?.contentReferences,codeCitations:e.response?.codeCitations}})}}toJSON(){return{version:3,...this.toExport(),sessionId:this.sessionId,creationDate:this._creationDate,isImported:this._isImported,lastMessageDate:this._lastMessageDate,customTitle:this._customTitle}}dispose(){this._requests.forEach(e=>e.response?.dispose()),this._onDidDispose.fire(),super.dispose()}};u=v([p(2,N),p(3,w),p(4,O)],u);let l=class{constructor(a,e,t){this.content=a;this.sampleQuestions=e;this.chatAgentService=t;this._id="welcome_"+l.nextId++}static nextId=0;_id;get id(){return this._id}get username(){return this.chatAgentService.getContributedDefaultAgent(y.Panel)?.fullName??""}get avatarIcon(){return this.chatAgentService.getDefaultAgent(y.Panel)?.metadata.themeIcon}};l=v([p(2,w)],l);function tt(i,a){return{variables:i.variables.map(e=>({...e,range:e.range&&{start:e.range.start-a,endExclusive:e.range.endExclusive-a}}))}}function j(i,a){if(i.baseUri&&a.baseUri){if(!(i.baseUri.scheme===a.baseUri.scheme&&i.baseUri.authority===a.baseUri.authority&&i.baseUri.path===a.baseUri.path&&i.baseUri.query===a.baseUri.query&&i.baseUri.fragment===a.baseUri.fragment))return!1}else if(i.baseUri||a.baseUri)return!1;return V(i.isTrusted,a.isTrusted)&&i.supportHtml===a.supportHtml&&i.supportThemeIcons===a.supportThemeIcons}function K(i,a){const e=typeof a=="string"?a:a.value;return{value:i.value+e,isTrusted:i.isTrusted,supportThemeIcons:i.supportThemeIcons,supportHtml:i.supportHtml,baseUri:i.baseUri}}function X(i){if(i.length===0)return"";const a=i.reduce((t,n)=>t.add(n.license),new Set);return a.size===1?b("codeCitation","Similar code found with 1 license type",a.size):b("codeCitations","Similar code found with {0} license types",a.size)}export{u as ChatModel,f as ChatModelInitState,m as ChatRequestModel,Q as ChatRequestRemovalReason,h as ChatResponseModel,l as ChatWelcomeMessageModel,H as Response,K as appendMarkdownString,j as canMergeMarkdownStrings,X as getCodeCitationsMessage,B as isExportableSessionData,C as isSerializableSessionData,et as normalizeSerializableChatData,tt as updateRanges};
