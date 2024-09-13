var L=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var E=(S,e,t,i)=>{for(var s=i>1?void 0:i?N(e,t):e,r=S.length-1,n;r>=0;r--)(n=S[r])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&L(e,t,s),s},a=(S,e)=>(t,i)=>e(t,i,S);import{Emitter as m,Event as O}from"../../../../base/common/event.js";import{DisposableStore as C,MutableDisposable as $,toDisposable as T}from"../../../../base/common/lifecycle.js";import{Schemas as D}from"../../../../base/common/network.js";import{isEqual as U}from"../../../../base/common/resources.js";import{generateUuid as K}from"../../../../base/common/uuid.js";import{Range as W}from"../../../../editor/common/core/range.js";import{ILanguageService as F}from"../../../../editor/common/languages/language.js";import{createTextBufferFactoryFromSnapshot as q}from"../../../../editor/common/model/textModel.js";import{IEditorWorkerService as H}from"../../../../editor/common/services/editorWorker.js";import{IModelService as B}from"../../../../editor/common/services/model.js";import{ITextModelService as P}from"../../../../editor/common/services/resolverService.js";import{IContextKeyService as j}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as V}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as G}from"../../../../platform/log/common/log.js";import{ITelemetryService as X}from"../../../../platform/telemetry/common/telemetry.js";import{DEFAULT_EDITOR_ASSOCIATION as z}from"../../../common/editor.js";import{IEditorService as J}from"../../../services/editor/common/editorService.js";import{ITextFileService as Q}from"../../../services/textfile/common/textfiles.js";import{UntitledTextEditorInput as Y}from"../../../services/untitled/common/untitledTextEditorInput.js";import{ChatAgentLocation as x,IChatAgentService as A}from"../../chat/common/chatAgents.js";import{IChatService as Z}from"../../chat/common/chatService.js";import{CTX_INLINE_CHAT_HAS_AGENT as ee}from"../common/inlineChat.js";import{HunkData as te,Session as ie,SessionWholeRange as se,StashedSession as oe}from"./inlineChatSession.js";class k extends Error{static code="InlineChatError";constructor(e){super(e),this.name=k.code}}let I=class{constructor(e,t,i,s,r,n,o,l,f,M,p){this._telemetryService=e;this._modelService=t;this._textModelService=i;this._editorWorkerService=s;this._logService=r;this._instaService=n;this._editorService=o;this._textFileService=l;this._languageService=f;this._chatService=M;this._chatAgentService=p}_store=new C;_onWillStartSession=this._store.add(new m);onWillStartSession=this._onWillStartSession.event;_onDidMoveSession=this._store.add(new m);onDidMoveSession=this._onDidMoveSession.event;_onDidEndSession=this._store.add(new m);onDidEndSession=this._onDidEndSession.event;_onDidStashSession=this._store.add(new m);onDidStashSession=this._onDidStashSession.event;_sessions=new Map;_keyComputers=new Map;dispose(){this._store.dispose(),this._sessions.forEach(e=>e.store.dispose()),this._sessions.clear()}async createSession(e,t,i){const s=this._chatAgentService.getDefaultAgent(x.Editor);if(!s){this._logService.trace("[IE] NO agent found");return}this._onWillStartSession.fire(e);const r=e.getModel(),n=e.getSelection(),o=new C;this._logService.trace(`[IE] creating NEW session for ${e.getId()}, ${s.extensionId}`);const l=t.session?.chatModel??this._chatService.startSession(x.Editor,i);if(!l){this._logService.trace("[IE] NO chatModel found");return}o.add(T(()=>{[...this._sessions.values()].some(h=>h.session!==d&&h.session.chatModel===l)||(this._chatService.clearSession(l.sessionId),l.dispose())}));const f=o.add(new $);o.add(l.onDidChange(c=>{if(c.kind!=="addRequest"||!c.request.response)return;const{response:h}=c.request;d.markModelVersion(c.request),f.value=h.onDidChange(()=>{if(h.isComplete){f.clear();for(const v of h.response.value){if(v.kind!=="textEditGroup"||v.uri.scheme!==D.untitled||U(v.uri,d.textModelN.uri))continue;const R=this._languageService.createByFilepathOrFirstLine(v.uri,void 0);this._textFileService.untitled.create({associatedResource:v.uri,languageId:R.languageId}).resolve(),this._textModelService.createModelReference(v.uri).then(b=>{o.add(b)})}}})})),o.add(this._chatAgentService.onDidChangeAgents(c=>{c===void 0&&!this._chatAgentService.getAgent(s.id)&&(this._logService.trace(`[IE] provider GONE for ${e.getId()}, ${s.extensionId}`),this._releaseSession(d,!0))}));const M=K(),p=r.uri;o.add(await this._textModelService.createModelReference(r.uri));const _=r,w=o.add(this._modelService.createModel(q(r.createSnapshot()),{languageId:r.getLanguageId(),onDidChange:O.None},p.with({scheme:D.vscode,authority:"inline-chat",path:"",query:new URLSearchParams({id:M,textModel0:""}).toString()}),!0));p.scheme===D.untitled&&o.add(this._editorService.onDidCloseEditor(()=>{this._editorService.isOpened({resource:p,typeId:Y.ID,editorId:z.id})||this._releaseSession(d,!0)}));let g=t.wholeRange;if(g||(g=new W(n.selectionStartLineNumber,n.selectionStartColumn,n.positionLineNumber,n.positionColumn)),i.isCancellationRequested){o.dispose();return}const d=new ie(t.editMode,t.headless??!1,p,w,_,s,o.add(new se(_,g)),o.add(new te(this._editorWorkerService,w,_)),l,t.session?.versionsByRequest),y=this._key(e,d.targetUri);if(this._sessions.has(y))throw o.dispose(),new Error(`Session already stored for ${y}`);return this._sessions.set(y,{session:d,editor:e,store:o}),d}moveSession(e,t){const i=this._key(t,e.targetUri),s=this._sessions.get(i);if(s){if(s.session!==e)throw new Error("Cannot move session because the target editor already/still has one");return}let r=!1;for(const[n,o]of this._sessions)if(o.session===e){r=!0,this._sessions.delete(n),this._sessions.set(i,{...o,editor:t}),this._logService.trace(`[IE] did MOVE session for ${o.editor.getId()} to NEW EDITOR ${t.getId()}, ${e.agent.extensionId}`),this._onDidMoveSession.fire({session:e,editor:t});break}if(!r)throw new Error("Cannot move session because it is not stored")}releaseSession(e){this._releaseSession(e,!1)}_releaseSession(e,t){let i;for(const n of this._sessions)if(n[1].session===e){i=n;break}if(!i)return;this._telemetryService.publicLog2("interactiveEditor/session",e.asTelemetryData());const[s,r]=i;this._sessions.delete(s),this._logService.trace(`[IE] did RELEASED session for ${r.editor.getId()}, ${e.agent.extensionId}`),this._onDidEndSession.fire({editor:r.editor,session:e,endedByExternalCause:t}),r.store.dispose()}stashSession(e,t,i){const s=this._instaService.createInstance(oe,t,e,i);return this._onDidStashSession.fire({editor:t,session:e}),this._logService.trace(`[IE] did STASH session for ${t.getId()}, ${e.agent.extensionId}`),s}getCodeEditor(e){for(const[,t]of this._sessions)if(t.session===e)return t.editor;throw new Error("session not found")}getSession(e,t){const i=this._key(e,t);return this._sessions.get(i)?.session}_key(e,t){const i=this._keyComputers.get(t.scheme);return i?i.getComparisonKey(e,t):`${e.getId()}@${t.toString()}`}registerSessionKeyComputer(e,t){return this._keyComputers.set(e,t),T(()=>this._keyComputers.delete(e))}};I=E([a(0,X),a(1,B),a(2,P),a(3,H),a(4,G),a(5,V),a(6,J),a(7,Q),a(8,F),a(9,Z),a(10,A)],I);let u=class{static Id="inlineChat.enabler";_ctxHasProvider;_store=new C;constructor(e,t){this._ctxHasProvider=ee.bindTo(e),this._store.add(t.onDidChangeAgents(()=>{const i=!!t.getDefaultAgent(x.Editor);this._ctxHasProvider.set(i)}))}dispose(){this._ctxHasProvider.reset(),this._store.dispose()}};u=E([a(0,j),a(1,A)],u);export{u as InlineChatEnabler,k as InlineChatError,I as InlineChatSessionServiceImpl};
