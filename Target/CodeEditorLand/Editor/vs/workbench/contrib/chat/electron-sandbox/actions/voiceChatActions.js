var Ue=Object.defineProperty;var We=Object.getOwnPropertyDescriptor;var N=(s,e,t,i)=>{for(var o=i>1?void 0:i?We(e,t):e,n=s.length-1,r;n>=0;n--)(r=s[n])&&(o=(i?r(e,t,o):r(o))||o);return i&&o&&Ue(e,t,o),o},d=(s,e)=>(t,i)=>e(t,i,s);import"vs/css!./media/voiceChatActions";import{renderStringAsPlaintext as Me}from"../../../../../../vs/base/browser/markdownRenderer.js";import{disposableTimeout as ie,raceCancellation as oe,RunOnceScheduler as ne}from"../../../../../../vs/base/common/async.js";import{CancellationTokenSource as X}from"../../../../../../vs/base/common/cancellation.js";import{Codicon as H}from"../../../../../../vs/base/common/codicons.js";import"../../../../../../vs/base/common/color.js";import{Event as z}from"../../../../../../vs/base/common/event.js";import{KeyCode as E,KeyMod as $}from"../../../../../../vs/base/common/keyCodes.js";import{Disposable as re,DisposableStore as se,MutableDisposable as qe,toDisposable as ae}from"../../../../../../vs/base/common/lifecycle.js";import{isNumber as Ge}from"../../../../../../vs/base/common/types.js";import{getCodeEditor as ce}from"../../../../../../vs/editor/browser/editorBrowser.js";import{EditorContextKeys as de}from"../../../../../../vs/editor/common/editorContextKeys.js";import{localize as p,localize2 as C}from"../../../../../../vs/nls.js";import{IAccessibilityService as Be}from"../../../../../../vs/platform/accessibility/common/accessibility.js";import{Action2 as b,MenuId as T}from"../../../../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as Xe,ICommandService as he}from"../../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as j}from"../../../../../../vs/platform/configuration/common/configuration.js";import{Extensions as ze}from"../../../../../../vs/platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as u,IContextKeyService as pe,RawContextKey as _}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as f}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as ue}from"../../../../../../vs/platform/keybinding/common/keybinding.js";import{KeybindingWeight as D}from"../../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{ProgressLocation as $e}from"../../../../../../vs/platform/progress/common/progress.js";import{Registry as je}from"../../../../../../vs/platform/registry/common/platform.js";import{contrastBorder as le,focusBorder as Qe}from"../../../../../../vs/platform/theme/common/colorRegistry.js";import{spinningLoading as Ye,syncing as Je}from"../../../../../../vs/platform/theme/common/iconRegistry.js";import{ColorScheme as ve}from"../../../../../../vs/platform/theme/common/theme.js";import{registerThemingParticipant as Ze}from"../../../../../../vs/platform/theme/common/themeService.js";import{ActiveEditorContext as et}from"../../../../../../vs/workbench/common/contextkeys.js";import"../../../../../../vs/workbench/common/contributions.js";import{ACTIVITY_BAR_BADGE_BACKGROUND as tt}from"../../../../../../vs/workbench/common/theme.js";import{accessibilityConfigurationNodeBase as it,AccessibilityVoiceSettingId as Se,SpeechTimeoutDefault as ot}from"../../../../../../vs/workbench/contrib/accessibility/browser/accessibilityConfiguration.js";import{CHAT_CATEGORY as w}from"../../../../../../vs/workbench/contrib/chat/browser/actions/chatActions.js";import"../../../../../../vs/workbench/contrib/chat/browser/actions/chatExecuteActions.js";import{IChatWidgetService as ge,IQuickChatService as nt,showChatView as Ce}from"../../../../../../vs/workbench/contrib/chat/browser/chat.js";import{ChatAgentLocation as K,IChatAgentService as Ie}from"../../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import{CONTEXT_CHAT_ENABLED as rt,CONTEXT_CHAT_REQUEST_IN_PROGRESS as L,CONTEXT_IN_CHAT_INPUT as st,CONTEXT_RESPONSE as fe,CONTEXT_RESPONSE_FILTERED as me}from"../../../../../../vs/workbench/contrib/chat/common/chatContextKeys.js";import"../../../../../../vs/workbench/contrib/chat/common/chatModel.js";import{KEYWORD_ACTIVIATION_SETTING_ID as V}from"../../../../../../vs/workbench/contrib/chat/common/chatService.js";import{isResponseVM as at}from"../../../../../../vs/workbench/contrib/chat/common/chatViewModel.js";import{VoiceChatInProgress as be,IVoiceChatService as ct}from"../../../../../../vs/workbench/contrib/chat/common/voiceChatService.js";import{IExtensionsWorkbenchService as dt}from"../../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{InlineChatController as ht}from"../../../../../../vs/workbench/contrib/inlineChat/browser/inlineChatController.js";import{CTX_INLINE_CHAT_FOCUSED as pt}from"../../../../../../vs/workbench/contrib/inlineChat/common/inlineChat.js";import{NOTEBOOK_EDITOR_FOCUSED as ye}from"../../../../../../vs/workbench/contrib/notebook/common/notebookContextKeys.js";import{TextToSpeechInProgress as ut,HasSpeechProvider as R,ISpeechService as Q,KeywordRecognitionStatus as lt,SpeechToTextInProgress as vt,SpeechToTextStatus as O,TextToSpeechStatus as Te}from"../../../../../../vs/workbench/contrib/speech/common/speechService.js";import{ITerminalService as Ae}from"../../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{TerminalChatContextKeys as St,TerminalChatController as F}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalContribExports.js";import{IEditorService as we}from"../../../../../../vs/workbench/services/editor/common/editorService.js";import{IHostService as gt}from"../../../../../../vs/workbench/services/host/browser/host.js";import{IWorkbenchLayoutService as Ct,Parts as A}from"../../../../../../vs/workbench/services/layout/browser/layoutService.js";import{IStatusbarService as It,StatusbarAlignment as ft}from"../../../../../../vs/workbench/services/statusbar/browser/statusbar.js";import{IViewsService as xe}from"../../../../../../vs/workbench/services/views/common/viewsService.js";const mt=["view","inline","terminal","quick","editor"],U=T.for("terminalChatInput"),x=u.and(rt,R),Y=u.or(pt,st),bt=u.or(L,St.requestActive),ke=new _("scopedVoiceChatGettingReady",!1,{type:"boolean",description:p("scopedVoiceChatGettingReady","True when getting ready for receiving voice input from the microphone for voice chat. This key is only defined scoped, per chat context.")}),Ee=new _("scopedVoiceChatInProgress",void 0,{type:"string",description:p("scopedVoiceChatInProgress","Defined as a location where voice recording from microphone is in progress for voice chat. This key is only defined scoped, per chat context.")}),P=u.or(...mt.map(s=>Ee.isEqualTo(s)));var yt=(i=>(i[i.Stopped=1]="Stopped",i[i.GettingReady=2]="GettingReady",i[i.Started=3]="Started",i))(yt||{});class I{static async create(e,t){const i=e.get(ge),o=e.get(nt),n=e.get(Ct),r=e.get(we),a=e.get(Ae),h=e.get(xe);switch(t){case"focused":return I.doCreateForFocusedChat(a,i,n)??I.create(e,"view");case"view":{const c=await Ce(h);if(c)return I.doCreateForChatWidget("view",c);break}case"inline":{const c=ce(r.activeTextEditorControl);if(c){const m=ht.get(c);if(m)return m.joinCurrentRun()||m.run(),I.doCreateForChatWidget("inline",m.chatWidget)}break}case"quick":return o.open(),I.create(e,"focused")}}static doCreateForFocusedChat(e,t,i){const o=e.activeInstance;if(o){const r=F.activeChatWidget||F.get(o);if(r?.hasFocus())return I.doCreateForTerminalChat(r)}const n=t.lastFocusedWidget;if(n?.hasInputFocus()){let r;return i.hasFocus(A.EDITOR_PART)?r=n.location===K.Panel?"editor":"inline":[A.SIDEBAR_PART,A.PANEL_PART,A.AUXILIARYBAR_PART,A.TITLEBAR_PART,A.STATUSBAR_PART,A.BANNER_PART,A.ACTIVITYBAR_PART].some(a=>i.hasFocus(a))?r="view":r="quick",I.doCreateForChatWidget(r,n)}}static createChatContextKeyController(e,t){const i=ke.bindTo(e),o=Ee.bindTo(e);return n=>{switch(n){case 2:i.set(!0),o.reset();break;case 3:i.reset(),o.set(t);break;case 1:i.reset(),o.reset();break}}}static doCreateForChatWidget(e,t){return{context:e,scopedContextKeyService:t.scopedContextKeyService,onDidAcceptInput:t.onDidAcceptInput,onDidHideInput:t.onDidHide,focusInput:()=>t.focusInput(),acceptInput:()=>t.acceptInput(),updateInput:i=>t.setInput(i),getInput:()=>t.getInput(),setInputPlaceholder:i=>t.setInputPlaceholder(i),clearInputPlaceholder:()=>t.resetInputPlaceholder(),updateState:I.createChatContextKeyController(t.scopedContextKeyService,e)}}static doCreateForTerminalChat(e){const t="terminal";return{context:t,scopedContextKeyService:e.scopedContextKeyService,onDidAcceptInput:e.onDidAcceptInput,onDidHideInput:e.onDidHide,focusInput:()=>e.focus(),acceptInput:()=>e.acceptInput(),updateInput:i=>e.updateInput(i,!1),getInput:()=>e.getInput(),setInputPlaceholder:i=>e.setPlaceholder(i),clearInputPlaceholder:()=>e.resetPlaceholder(),updateState:I.createChatContextKeyController(e.scopedContextKeyService,t)}}}let l=class{constructor(e,t,i,o){this.voiceChatService=e;this.configurationService=t;this.instantiationService=i;this.accessibilityService=o}static instance=void 0;static getInstance(e){return l.instance||(l.instance=e.createInstance(l)),l.instance}currentVoiceChatSession=void 0;voiceChatSessionIds=0;async start(e,t){this.stop(),v.getInstance(this.instantiationService).stop();let i=!1;const o=++this.voiceChatSessionIds,n=this.currentVoiceChatSession={id:o,controller:e,disposables:new se,setTimeoutDisabled:B=>{i=B},accept:()=>this.accept(o),stop:()=>this.stop(o,e.context)},r=new X;n.disposables.add(ae(()=>r.dispose(!0))),n.disposables.add(e.onDidAcceptInput(()=>this.stop(o,e.context))),n.disposables.add(e.onDidHideInput(()=>this.stop(o,e.context))),e.focusInput(),e.updateState(2);const a=await this.voiceChatService.createVoiceChatSession(r.token,{usesAgents:e.context!=="inline",model:t?.widget?.viewModel?.model});let h=e.getInput(),c=this.configurationService.getValue(Se.SpeechTimeout);(!Ge(c)||c<0)&&(c=ot);const m=n.disposables.add(new ne(()=>this.accept(o),c));return n.disposables.add(a.onDidChange(({status:B,text:k,waitingForInput:Fe})=>{if(!r.token.isCancellationRequested)switch(B){case O.Started:this.onDidSpeechToTextSessionStart(e,n.disposables);break;case O.Recognizing:k&&(n.controller.updateInput(h?[h,k].join(" "):k),c>0&&t?.voice?.disableTimeout!==!0&&!i&&m.cancel());break;case O.Recognized:k&&(h=h?[h,k].join(" "):k,n.controller.updateInput(h),c>0&&t?.voice?.disableTimeout!==!0&&!Fe&&!i&&m.schedule());break;case O.Stopped:this.stop(n.id,e.context);break}})),n}onDidSpeechToTextSessionStart(e,t){e.updateState(3);let i=0;const o=()=>{i=(i+1)%4,e.setInputPlaceholder(`${p("listening","I'm listening")}${".".repeat(i)}`),n.schedule()},n=t.add(new ne(o,500));o()}stop(e=this.voiceChatSessionIds,t){!this.currentVoiceChatSession||this.voiceChatSessionIds!==e||t&&this.currentVoiceChatSession.controller.context!==t||(this.currentVoiceChatSession.controller.clearInputPlaceholder(),this.currentVoiceChatSession.controller.updateState(1),this.currentVoiceChatSession.disposables.dispose(),this.currentVoiceChatSession=void 0)}async accept(e=this.voiceChatSessionIds){if(!this.currentVoiceChatSession||this.voiceChatSessionIds!==e)return;const t=this.currentVoiceChatSession.controller,i=await t.acceptInput();if(!i)return;const o=this.configurationService.getValue(Se.AutoSynthesize);if(o==="on"||o==="auto"&&!this.accessibilityService.isScreenReaderOptimized()){let n;t.context==="inline"?n="focused":n=t,v.getInstance(this.instantiationService).start(this.instantiationService.invokeFunction(r=>q.create(r,n,i)))}}};l=N([d(0,ct),d(1,j),d(2,f),d(3,Be)],l);const De=500;async function Ve(s,e,t,i){const o=e.get(f),r=e.get(ue).enableKeybindingHoldMode(s),a=await I.create(e,t);if(!a)return;const h=await l.getInstance(o).start(a,i);let c=!1;const m=ie(()=>{c=!0,h?.setTimeoutDisabled(!0)},De);await r,m.dispose(),c&&h.accept()}class J extends b{constructor(t,i){super(t);this.target=i}run(t,i){return Ve(this.desc.id,t,this.target,i)}}class ee extends J{static ID="workbench.action.chat.voiceChatInChatView";constructor(){super({id:ee.ID,title:C("workbench.action.chat.voiceChatInView.label","Voice Chat in Chat View"),category:w,precondition:u.and(x,L.negate()),f1:!0},"view")}}class Z extends b{static ID="workbench.action.chat.holdToVoiceChatInChatView";constructor(){super({id:Z.ID,title:C("workbench.action.chat.holdToVoiceChatInChatView.label","Hold to Voice Chat in Chat View"),keybinding:{weight:D.WorkbenchContrib,when:u.and(x,L.negate(),Y?.negate(),de.focus.negate(),ye.negate()),primary:$.CtrlCmd|E.KeyI}})}async run(e,t){const i=e.get(f),o=e.get(ue),n=e.get(xe),r=o.enableKeybindingHoldMode(Z.ID);let a;const h=ie(async()=>{const c=await I.create(e,"view");c&&(a=await l.getInstance(i).start(c,t),a.setTimeoutDisabled(!0))},De);(await Ce(n))?.focusInput(),await r,h.dispose(),a&&a.accept()}}class M extends J{static ID="workbench.action.chat.inlineVoiceChat";constructor(){super({id:M.ID,title:C("workbench.action.chat.inlineVoiceChat","Inline Voice Chat"),category:w,precondition:u.and(x,et,L.negate()),f1:!0},"inline")}}class te extends J{static ID="workbench.action.chat.quickVoiceChat";constructor(){super({id:te.ID,title:C("workbench.action.chat.quickVoiceChat.label","Quick Voice Chat"),category:w,precondition:u.and(x,L.negate()),f1:!0},"quick")}}class Pe extends b{static ID="workbench.action.chat.startVoiceChat";constructor(){super({id:Pe.ID,title:C("workbench.action.chat.startVoiceChat.label","Start Voice Chat"),category:w,f1:!0,keybinding:{weight:D.WorkbenchContrib,when:u.and(Y,de.focus.negate(),ye.negate()),primary:$.CtrlCmd|E.KeyI},icon:H.mic,precondition:u.and(x,ke.negate(),bt?.negate(),vt.negate()),menu:[{id:T.ChatExecute,when:u.and(R,y.negate(),P?.negate()),group:"navigation",order:-1},{id:U,when:u.and(R,y.negate(),P?.negate()),group:"navigation",order:-1}]})}async run(e,t){const i=t?.widget;return i&&i.focusInput(),Ve(this.desc.id,e,"focused",t)}}class Ne extends b{static ID="workbench.action.chat.stopListening";constructor(){super({id:Ne.ID,title:C("workbench.action.chat.stopListening.label","Stop Listening"),category:w,f1:!0,keybinding:{weight:D.WorkbenchContrib+100,primary:E.Escape,when:P},icon:Ye,precondition:be,menu:[{id:T.ChatExecute,when:P,group:"navigation",order:-1},{id:U,when:P,group:"navigation",order:-1}]})}async run(e){l.getInstance(e.get(f)).stop()}}class He extends b{static ID="workbench.action.chat.stopListeningAndSubmit";constructor(){super({id:He.ID,title:C("workbench.action.chat.stopListeningAndSubmit.label","Stop Listening and Submit"),category:w,f1:!0,keybinding:{weight:D.WorkbenchContrib,when:u.and(Y,P),primary:$.CtrlCmd|E.KeyI},precondition:be})}run(e){l.getInstance(e.get(f)).accept()}}const y=new _("scopedChatSynthesisInProgress",!1,{type:"boolean",description:p("scopedChatSynthesisInProgress","Defined as a location where voice recording from microphone is in progress for voice chat. This key is only defined scoped, per chat context.")});class q{static create(e,t,i){return t==="focused"?q.doCreateForFocusedChat(e,i):{onDidHideChat:t.onDidHideInput,contextKeyService:t.scopedContextKeyService,response:i}}static doCreateForFocusedChat(e,t){const i=e.get(ge),o=e.get(pe),r=e.get(Ae).activeInstance;if(r){const h=F.activeChatWidget||F.get(r);if(h?.hasFocus())return{onDidHideChat:h.onDidHide,contextKeyService:h.scopedContextKeyService,response:t}}let a=i.getWidgetBySessionId(t.session.sessionId);return a?.location===K.Editor&&(a=i.lastFocusedWidget),{onDidHideChat:a?.onDidHide??z.None,contextKeyService:a?.scopedContextKeyService??o,response:t}}}let v=class{constructor(e,t){this.speechService=e;this.instantiationService=t}static instance=void 0;static getInstance(e){return v.instance||(v.instance=e.createInstance(v)),v.instance}activeSession=void 0;async start(e){this.stop(),l.getInstance(this.instantiationService).stop();const t=this.activeSession=new X,i=new se;t.token.onCancellationRequested(()=>i.dispose());const o=await this.speechService.createTextToSpeechSession(t.token,"chat");if(t.token.isCancellationRequested)return;i.add(e.onDidHideChat(()=>this.stop()));const n=y.bindTo(e.contextKeyService);i.add(ae(()=>n.reset())),i.add(o.onDidChange(r=>{switch(r.status){case Te.Started:n.set(!0);break;case Te.Stopped:n.reset();break}}));for await(const r of this.nextChatResponseChunk(e.response,t.token)){if(t.token.isCancellationRequested)return;await oe(o.synthesize(r),t.token)}}async*nextChatResponseChunk(e,t){let i=0,o=!1;do{const n=e.response.toString().length,{chunk:r,offset:a}=this.parseNextChatResponseChunk(e,i);if(i=a,o=e.isComplete,r&&(yield r),t.isCancellationRequested)return;!o&&n===e.response.toString().length&&await oe(z.toPromise(e.onDidChange),t)}while(!t.isCancellationRequested&&!o)}parseNextChatResponseChunk(e,t){let i;const o=e.response.toString();if(e.isComplete)i=o.substring(t),t=o.length+1;else{const n=xt(o,t);i=n.chunk,t=n.offset}return{chunk:i&&Me({value:i}),offset:t}}stop(){this.activeSession?.dispose(!0),this.activeSession=void 0}};v=N([d(0,Q),d(1,f)],v);const Tt=[".","!","?",":"],At=`
`,wt=" ";function xt(s,e){let t;for(let i=s.length-1;i>=e;i--){const o=s[i],n=s[i+1];if(Tt.includes(o)&&n===wt||At===o){t=s.substring(e,i+1).trim(),e=i+1;break}}return{chunk:t,offset:e}}class Oi extends b{constructor(){super({id:"workbench.action.chat.readChatResponseAloud",title:C("workbench.action.chat.readChatResponseAloud","Read Aloud"),icon:H.unmute,precondition:x,menu:{id:T.ChatMessageTitle,when:u.and(x,fe,y.negate(),me.negate()),group:"navigation"}})}run(e,...t){const i=e.get(f),o=t[0];if(!at(o))return;const n=q.create(e,"focused",o.model);v.getInstance(i).start(n)}}class Ke extends b{static ID="workbench.action.speech.stopReadAloud";constructor(){super({id:Ke.ID,icon:Je,title:C("workbench.action.speech.stopReadAloud","Stop Reading Aloud"),f1:!0,category:w,precondition:ut,keybinding:{weight:D.WorkbenchContrib+100,primary:E.Escape,when:y},menu:[{id:T.ChatExecute,when:y,group:"navigation",order:-1},{id:U,when:y,group:"navigation",order:-1}]})}async run(e){v.getInstance(e.get(f)).stop()}}class Le extends b{static ID="workbench.action.chat.stopReadChatItemAloud";constructor(){super({id:Le.ID,icon:H.mute,title:C("workbench.action.chat.stopReadChatItemAloud","Stop Reading Aloud"),precondition:y,keybinding:{weight:D.WorkbenchContrib+100,primary:E.Escape},menu:[{id:T.ChatMessageTitle,when:u.and(y,fe,me.negate()),group:"navigation"}]})}async run(e,...t){v.getInstance(e.get(f)).stop()}}function Re(s,e,t){if(!e.hasSpeechProvider||!t.getDefaultAgent(K.Panel))return!1;const i=s.getValue(V);return typeof i=="string"&&i!==S.SETTINGS_VALUE.OFF}let S=class extends re{constructor(t,i,o,n,r,a,h){super();this.speechService=t;this.configurationService=i;this.commandService=o;this.editorService=r;this.hostService=a;this.chatAgentService=h;this._register(n.createInstance(g)),this.registerListeners()}static ID="workbench.contrib.keywordActivation";static SETTINGS_VALUE={OFF:"off",INLINE_CHAT:"inlineChat",QUICK_CHAT:"quickChat",VIEW_CHAT:"chatInView",CHAT_IN_CONTEXT:"chatInContext"};activeSession=void 0;registerListeners(){this._register(z.runAndSubscribe(this.speechService.onDidChangeHasSpeechProvider,()=>{this.updateConfiguration(),this.handleKeywordActivation()}));const t=this._register(this.chatAgentService.onDidChangeAgents(()=>{this.chatAgentService.getDefaultAgent(K.Panel)&&(this.updateConfiguration(),this.handleKeywordActivation(),t.dispose())}));this._register(this.speechService.onDidStartSpeechToTextSession(()=>this.handleKeywordActivation())),this._register(this.speechService.onDidEndSpeechToTextSession(()=>this.handleKeywordActivation())),this._register(this.configurationService.onDidChangeConfiguration(i=>{i.affectsConfiguration(V)&&this.handleKeywordActivation()}))}updateConfiguration(){if(!this.speechService.hasSpeechProvider||!this.chatAgentService.getDefaultAgent(K.Panel))return;je.as(ze.Configuration).registerConfiguration({...it,properties:{[V]:{type:"string",enum:[S.SETTINGS_VALUE.OFF,S.SETTINGS_VALUE.VIEW_CHAT,S.SETTINGS_VALUE.QUICK_CHAT,S.SETTINGS_VALUE.INLINE_CHAT,S.SETTINGS_VALUE.CHAT_IN_CONTEXT],enumDescriptions:[p("voice.keywordActivation.off","Keyword activation is disabled."),p("voice.keywordActivation.chatInView","Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the chat view."),p("voice.keywordActivation.quickChat","Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the quick chat."),p("voice.keywordActivation.inlineChat","Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the active editor if possible."),p("voice.keywordActivation.chatInContext","Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the active editor or view depending on keyboard focus.")],description:p("voice.keywordActivation","Controls whether the keyword phrase 'Hey Code' is recognized to start a voice chat session. Enabling this will start recording from the microphone but the audio is processed locally and never sent to a server."),default:"off",tags:["accessibility"]}}})}handleKeywordActivation(){const t=Re(this.configurationService,this.speechService,this.chatAgentService)&&!this.speechService.hasActiveSpeechToTextSession;t&&this.activeSession||!t&&!this.activeSession||(t?this.enableKeywordActivation():this.disableKeywordActivation())}async enableKeywordActivation(){const t=this.activeSession=new X,i=await this.speechService.recognizeKeyword(t.token);t.token.isCancellationRequested||t!==this.activeSession||(this.activeSession=void 0,i===lt.Recognized&&(this.hostService.hasFocus&&this.commandService.executeCommand(this.getKeywordCommand()),this.handleKeywordActivation()))}getKeywordCommand(){switch(this.configurationService.getValue(V)){case S.SETTINGS_VALUE.INLINE_CHAT:return M.ID;case S.SETTINGS_VALUE.QUICK_CHAT:return te.ID;case S.SETTINGS_VALUE.CHAT_IN_CONTEXT:if(ce(this.editorService.activeTextEditorControl)?.hasWidgetFocus())return M.ID;default:return ee.ID}}disableKeywordActivation(){this.activeSession?.dispose(!0),this.activeSession=void 0}dispose(){this.activeSession?.dispose(),super.dispose()}};S=N([d(0,Q),d(1,j),d(2,he),d(3,f),d(4,we),d(5,gt),d(6,Ie)],S);let g=class extends re{constructor(t,i,o,n,r){super();this.speechService=t;this.statusbarService=i;this.commandService=o;this.configurationService=n;this.chatAgentService=r;this._register(Xe.registerCommand(g.STATUS_COMMAND,()=>this.commandService.executeCommand("workbench.action.openSettings",V))),this.registerListeners(),this.updateStatusEntry()}entry=this._register(new qe);static STATUS_NAME=p("keywordActivation.status.name","Voice Keyword Activation");static STATUS_COMMAND="keywordActivation.status.command";static STATUS_ACTIVE=p("keywordActivation.status.active","Listening to 'Hey Code'...");static STATUS_INACTIVE=p("keywordActivation.status.inactive","Waiting for voice chat to end...");registerListeners(){this._register(this.speechService.onDidStartKeywordRecognition(()=>this.updateStatusEntry())),this._register(this.speechService.onDidEndKeywordRecognition(()=>this.updateStatusEntry())),this._register(this.configurationService.onDidChangeConfiguration(t=>{t.affectsConfiguration(V)&&this.updateStatusEntry()}))}updateStatusEntry(){Re(this.configurationService,this.speechService,this.chatAgentService)?(this.entry.value||this.createStatusEntry(),this.updateStatusLabel()):this.entry.clear()}createStatusEntry(){this.entry.value=this.statusbarService.addEntry(this.getStatusEntryProperties(),"status.voiceKeywordActivation",ft.RIGHT,103)}getStatusEntryProperties(){return{name:g.STATUS_NAME,text:this.speechService.hasActiveKeywordRecognition?"$(mic-filled)":"$(mic)",tooltip:this.speechService.hasActiveKeywordRecognition?g.STATUS_ACTIVE:g.STATUS_INACTIVE,ariaLabel:this.speechService.hasActiveKeywordRecognition?g.STATUS_ACTIVE:g.STATUS_INACTIVE,command:g.STATUS_COMMAND,kind:"prominent",showInAllWindows:!0}}updateStatusLabel(){this.entry.value?.update(this.getStatusEntryProperties())}};g=N([d(0,Q),d(1,It),d(2,he),d(3,j),d(4,Ie)],g);const W=new _("installingSpeechProvider",!1,!0);class G extends b{static SPEECH_EXTENSION_ID="ms-vscode.vscode-speech";async run(e){const t=e.get(pe),i=e.get(dt);try{W.bindTo(t).set(!0),await i.install(G.SPEECH_EXTENSION_ID,{justification:this.getJustification(),enable:!0},$e.Notification)}finally{W.bindTo(t).reset()}}}class _e extends G{static ID="workbench.action.chat.installProviderForVoiceChat";constructor(){super({id:_e.ID,title:C("workbench.action.chat.installProviderForVoiceChat.label","Start Voice Chat"),icon:H.mic,precondition:W.negate(),menu:[{id:T.ChatExecute,when:R.negate(),group:"navigation",order:-1},{id:U,when:R.negate(),group:"navigation",order:-1}]})}getJustification(){return p("installProviderForVoiceChat.justification","Microphone support requires this extension.")}}class Oe extends G{static ID="workbench.action.chat.installProviderForSynthesis";constructor(){super({id:Oe.ID,title:C("workbench.action.chat.installProviderForSynthesis.label","Read Aloud"),icon:H.unmute,precondition:W.negate(),menu:[{id:T.ChatMessageTitle,when:R.negate(),group:"navigation"}]})}getJustification(){return p("installProviderForSynthesis.justification","Speaker support requires this extension.")}}Ze((s,e)=>{let t,i;s.type===ve.LIGHT||s.type===ve.DARK?(t=s.getColor(tt)??s.getColor(Qe),i=t?.transparent(.38)):(t=s.getColor(le),i=s.getColor(le)),e.addRule(`
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled),
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled) {
			color: ${t};
			outline: 1px solid ${t};
			outline-offset: -1px;
			animation: pulseAnimation 1s infinite;
			border-radius: 50%;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::before,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before {
			position: absolute;
			outline: 1px solid ${t};
			outline-offset: 2px;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::after,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::after {
			outline: 2px solid ${t};
			outline-offset: -1px;
			animation: pulseAnimation 1500ms cubic-bezier(0.75, 0, 0.25, 1) infinite;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::before,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before {
			position: absolute;
			outline: 1px solid ${t};
			outline-offset: 2px;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		@keyframes pulseAnimation {
			0% {
				outline-width: 2px;
			}
			62% {
				outline-width: 5px;
				outline-color: ${i};
			}
			100% {
				outline-width: 2px;
			}
		}
	`)});export{Z as HoldToVoiceChatInChatViewAction,M as InlineVoiceChatAction,Oe as InstallSpeechProviderForSynthesizeChatAction,_e as InstallSpeechProviderForVoiceChatAction,S as KeywordActivationContribution,te as QuickVoiceChatAction,Oi as ReadChatResponseAloud,Pe as StartVoiceChatAction,Ne as StopListeningAction,He as StopListeningAndSubmitAction,Ke as StopReadAloud,Le as StopReadChatItemAloud,De as VOICE_KEY_HOLD_THRESHOLD,ee as VoiceChatInChatViewAction,xt as parseNextChatResponseChunk};