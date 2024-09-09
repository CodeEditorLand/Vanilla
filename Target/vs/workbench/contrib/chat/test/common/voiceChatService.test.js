import e from"assert";import{CancellationTokenSource as f}from"../../../../../base/common/cancellation.js";import{Emitter as C,Event as c}from"../../../../../base/common/event.js";import"../../../../../base/common/htmlContent.js";import{DisposableStore as x,toDisposable as q}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as k}from"../../../../../base/test/common/utils.js";import"../../../../../editor/common/languages.js";import"../../../../../platform/extensions/common/extensions.js";import{MockContextKeyService as R}from"../../../../../platform/keybinding/test/common/mockKeybindingService.js";import{ChatAgentLocation as S}from"../../common/chatAgents.js";import"../../common/chatModel.js";import"../../common/chatService.js";import{VoiceChatService as z}from"../../common/voiceChatService.js";import{SpeechToTextStatus as s}from"../../../speech/common/speechService.js";import{nullExtensionDescription as y}from"../../../../services/extensions/common/extensions.js";suite("VoiceChat",()=>{class d{constructor(i,r){this.name=i;this.description=r}}class h{constructor(i,r){this.id=i;this.slashCommands=r;this.name=i}extensionId=y.identifier;extensionPublisher="";extensionDisplayName="";extensionPublisherId="";locations=[S.Panel];name;fullName;description;when;publisherDisplayName;isDefault;isDynamic;disambiguation=[];provideFollowups(i,r,l,g){throw new Error("Method not implemented.")}provideSampleQuestions(i,r){throw new Error("Method not implemented.")}invoke(i,r,l,g){throw new Error("Method not implemented.")}provideWelcomeMessage(i,r){throw new Error("Method not implemented.")}metadata={}}const p=[new h("workspace",[new d("fix","fix"),new d("explain","explain")]),new h("vscode",[new d("search","search")])];class A{hasChatParticipantDetectionProviders(){throw new Error("Method not implemented.")}registerChatParticipantDetectionProvider(i,r){throw new Error("Method not implemented.")}detectAgentOrCommand(i,r,l,g){throw new Error("Method not implemented.")}_serviceBrand;onDidChangeAgents=c.None;registerAgentImplementation(i,r){throw new Error}registerDynamicAgent(i,r){throw new Error("Method not implemented.")}invokeAgent(i,r,l,g,I){throw new Error}getFollowups(i,r,l,g,I){throw new Error}getActivatedAgents(){return p}getAgents(){return p}getDefaultAgent(){throw new Error}getContributedDefaultAgent(){throw new Error}getSecondaryAgent(){throw new Error}registerAgent(i,r){throw new Error("Method not implemented.")}getAgent(i){throw new Error("Method not implemented.")}getAgentsByName(i){throw new Error("Method not implemented.")}updateAgent(i,r){throw new Error("Method not implemented.")}getAgentByFullyQualifiedId(i){throw new Error("Method not implemented.")}registerAgentCompletionProvider(i,r){throw new Error("Method not implemented.")}getAgentCompletionItems(i,r,l){throw new Error("Method not implemented.")}agentHasDupeName(i){throw new Error("Method not implemented.")}getChatTitle(i,r,l){throw new Error("Method not implemented.")}}class E{_serviceBrand;onDidChangeHasSpeechProvider=c.None;hasSpeechProvider=!0;hasActiveSpeechToTextSession=!1;hasActiveTextToSpeechSession=!1;hasActiveKeywordRecognition=!1;registerSpeechProvider(i,r){throw new Error("Method not implemented.")}onDidStartSpeechToTextSession=c.None;onDidEndSpeechToTextSession=c.None;async createSpeechToTextSession(i){return{onDidChange:a.event}}onDidStartTextToSpeechSession=c.None;onDidEndTextToSpeechSession=c.None;async createTextToSpeechSession(i){return{onDidChange:c.None,synthesize:async()=>{}}}onDidStartKeywordRecognition=c.None;onDidEndKeywordRecognition=c.None;recognizeKeyword(i){throw new Error("Method not implemented.")}}const u=new x;let a,w,t;async function o(n){const i=new f;u.add(q(()=>i.dispose(!0)));const r=await w.createVoiceChatSession(i.token,n);u.add(r.onDidChange(l=>{t=l}))}setup(()=>{a=u.add(new C),w=u.add(new z(new E,new A,new R))}),teardown(()=>{u.clear()}),test("Agent and slash command detection (useAgents: false)",async()=>{await m({usesAgents:!1,model:{}})}),test("Agent and slash command detection (useAgents: true)",async()=>{await m({usesAgents:!0,model:{}})});async function m(n){await o(n),a.fire({status:s.Started}),e.strictEqual(t?.status,s.Started),a.fire({status:s.Recognizing,text:"Hello"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,"Hello"),e.strictEqual(t?.waitingForInput,void 0),a.fire({status:s.Recognizing,text:"Hello World"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,"Hello World"),e.strictEqual(t?.waitingForInput,void 0),a.fire({status:s.Recognized,text:"Hello World"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,"Hello World"),e.strictEqual(t?.waitingForInput,void 0),await o(n),a.fire({status:s.Recognizing,text:"At"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,"At"),a.fire({status:s.Recognizing,text:"At workspace"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@workspace":"At workspace"),e.strictEqual(t?.waitingForInput,n.usesAgents),a.fire({status:s.Recognizing,text:"at workspace"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@workspace":"at workspace"),e.strictEqual(t?.waitingForInput,n.usesAgents),a.fire({status:s.Recognizing,text:"At workspace help"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@workspace help":"At workspace help"),e.strictEqual(t?.waitingForInput,!1),a.fire({status:s.Recognized,text:"At workspace help"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,n.usesAgents?"@workspace help":"At workspace help"),e.strictEqual(t?.waitingForInput,!1),await o(n),a.fire({status:s.Recognizing,text:"At workspace, help"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@workspace help":"At workspace, help"),e.strictEqual(t?.waitingForInput,!1),a.fire({status:s.Recognized,text:"At workspace, help"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,n.usesAgents?"@workspace help":"At workspace, help"),e.strictEqual(t?.waitingForInput,!1),await o(n),a.fire({status:s.Recognizing,text:"At Workspace. help"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@workspace help":"At Workspace. help"),e.strictEqual(t?.waitingForInput,!1),a.fire({status:s.Recognized,text:"At Workspace. help"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,n.usesAgents?"@workspace help":"At Workspace. help"),e.strictEqual(t?.waitingForInput,!1),await o(n),a.fire({status:s.Recognizing,text:"Slash fix"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@workspace /fix":"/fix"),e.strictEqual(t?.waitingForInput,!0),a.fire({status:s.Recognized,text:"Slash fix"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,n.usesAgents?"@workspace /fix":"/fix"),e.strictEqual(t?.waitingForInput,!0),await o(n),a.fire({status:s.Recognizing,text:"At code slash search help"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@vscode /search help":"At code slash search help"),e.strictEqual(t?.waitingForInput,!1),a.fire({status:s.Recognized,text:"At code slash search help"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,n.usesAgents?"@vscode /search help":"At code slash search help"),e.strictEqual(t?.waitingForInput,!1),await o(n),a.fire({status:s.Recognizing,text:"At code, slash search, help"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@vscode /search help":"At code, slash search, help"),e.strictEqual(t?.waitingForInput,!1),a.fire({status:s.Recognized,text:"At code, slash search, help"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,n.usesAgents?"@vscode /search help":"At code, slash search, help"),e.strictEqual(t?.waitingForInput,!1),await o(n),a.fire({status:s.Recognizing,text:"At code. slash, search help"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@vscode /search help":"At code. slash, search help"),e.strictEqual(t?.waitingForInput,!1),a.fire({status:s.Recognized,text:"At code. slash search, help"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,n.usesAgents?"@vscode /search help":"At code. slash search, help"),e.strictEqual(t?.waitingForInput,!1),await o(n),a.fire({status:s.Recognizing,text:"At workspace, for at workspace"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,n.usesAgents?"@workspace for at workspace":"At workspace, for at workspace"),e.strictEqual(t?.waitingForInput,!1),a.fire({status:s.Recognized,text:"At workspace, for at workspace"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,n.usesAgents?"@workspace for at workspace":"At workspace, for at workspace"),e.strictEqual(t?.waitingForInput,!1),n.usesAgents&&(await o(n),a.fire({status:s.Recognized,text:"At workspace"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,"@workspace"),e.strictEqual(t?.waitingForInput,!0),a.fire({status:s.Recognizing,text:"slash"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,"slash"),e.strictEqual(t?.waitingForInput,!1),a.fire({status:s.Recognizing,text:"slash fix"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,"/fix"),e.strictEqual(t?.waitingForInput,!0),a.fire({status:s.Recognized,text:"slash fix"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,"/fix"),e.strictEqual(t?.waitingForInput,!0),await o(n),a.fire({status:s.Recognized,text:"At workspace"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,"@workspace"),e.strictEqual(t?.waitingForInput,!0),a.fire({status:s.Recognized,text:"slash fix"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,"/fix"),e.strictEqual(t?.waitingForInput,!0))}test("waiting for input",async()=>{await o({usesAgents:!0,model:{}}),a.fire({status:s.Recognizing,text:"At workspace"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,"@workspace"),e.strictEqual(t.waitingForInput,!0),a.fire({status:s.Recognized,text:"At workspace"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,"@workspace"),e.strictEqual(t.waitingForInput,!0),await o({usesAgents:!0,model:{}}),a.fire({status:s.Recognizing,text:"At workspace slash explain"}),e.strictEqual(t?.status,s.Recognizing),e.strictEqual(t?.text,"@workspace /explain"),e.strictEqual(t.waitingForInput,!0),a.fire({status:s.Recognized,text:"At workspace slash explain"}),e.strictEqual(t?.status,s.Recognized),e.strictEqual(t?.text,"@workspace /explain"),e.strictEqual(t.waitingForInput,!0)}),k()});
