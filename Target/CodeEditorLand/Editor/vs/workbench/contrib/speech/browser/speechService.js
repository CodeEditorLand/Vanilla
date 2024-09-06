var I=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var w=(v,p,e,i)=>{for(var s=i>1?void 0:i?R(p,e):p,t=v.length-1,o;t>=0;t--)(o=v[t])&&(s=(i?o(p,e,s):o(s))||s);return i&&s&&I(p,e,s),s},h=(v,p)=>(e,i)=>p(e,i,v);import{firstOrDefault as E}from"../../../../../vs/base/common/arrays.js";import{DeferredPromise as b}from"../../../../../vs/base/common/async.js";import{CancellationTokenSource as K}from"../../../../../vs/base/common/cancellation.js";import{Emitter as S,Event as _}from"../../../../../vs/base/common/event.js";import{Disposable as z,DisposableStore as g,toDisposable as D}from"../../../../../vs/base/common/lifecycle.js";import{localize as f}from"../../../../../vs/nls.js";import{IConfigurationService as L}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as k}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{ILogService as M}from"../../../../../vs/platform/log/common/log.js";import{ITelemetryService as H}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{HasSpeechProvider as A,KeywordRecognitionStatus as m,SPEECH_LANGUAGE_CONFIG as P,speechLanguageConfigToLanguage as C,SpeechToTextInProgress as F,SpeechToTextStatus as l,TextToSpeechInProgress as q,TextToSpeechStatus as x}from"../../../../../vs/workbench/contrib/speech/common/speechService.js";import{IExtensionService as N}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{ExtensionsRegistry as O}from"../../../../../vs/workbench/services/extensions/common/extensionsRegistry.js";import{IHostService as $}from"../../../../../vs/workbench/services/host/browser/host.js";const G=O.registerExtensionPoint({extensionPoint:"speechProviders",jsonSchema:{description:f("vscode.extension.contributes.speechProvider","Contributes a Speech Provider"),type:"array",items:{additionalProperties:!1,type:"object",defaultSnippets:[{body:{name:"",description:""}}],required:["name"],properties:{name:{description:f("speechProviderName","Unique name for this Speech Provider."),type:"string"},description:{description:f("speechProviderDescription","A description of this Speech Provider, shown in the UI."),type:"string"}}}}});let u=class extends z{constructor(e,i,s,t,o,a){super();this.logService=e;this.contextKeyService=i;this.hostService=s;this.telemetryService=t;this.configurationService=o;this.extensionService=a;this.handleAndRegisterSpeechExtensions()}_serviceBrand;_onDidChangeHasSpeechProvider=this._register(new S);onDidChangeHasSpeechProvider=this._onDidChangeHasSpeechProvider.event;get hasSpeechProvider(){return this.providerDescriptors.size>0||this.providers.size>0}providers=new Map;providerDescriptors=new Map;hasSpeechProviderContext=A.bindTo(this.contextKeyService);handleAndRegisterSpeechExtensions(){G.setHandler((e,i)=>{const s=this.hasSpeechProvider;for(const t of i.removed)for(const o of t.value)this.providerDescriptors.delete(o.name);for(const t of i.added)for(const o of t.value)this.providerDescriptors.set(o.name,o);s!==this.hasSpeechProvider&&this.handleHasSpeechProviderChange()})}registerSpeechProvider(e,i){if(this.providers.has(e))throw new Error(`Speech provider with identifier ${e} is already registered.`);const s=this.hasSpeechProvider;return this.providers.set(e,i),s!==this.hasSpeechProvider&&this.handleHasSpeechProviderChange(),D(()=>{const t=this.hasSpeechProvider;this.providers.delete(e),t!==this.hasSpeechProvider&&this.handleHasSpeechProviderChange()})}handleHasSpeechProviderChange(){this.hasSpeechProviderContext.set(this.hasSpeechProvider),this._onDidChangeHasSpeechProvider.fire()}_onDidStartSpeechToTextSession=this._register(new S);onDidStartSpeechToTextSession=this._onDidStartSpeechToTextSession.event;_onDidEndSpeechToTextSession=this._register(new S);onDidEndSpeechToTextSession=this._onDidEndSpeechToTextSession.event;activeSpeechToTextSessions=0;get hasActiveSpeechToTextSession(){return this.activeSpeechToTextSessions>0}speechToTextInProgress=F.bindTo(this.contextKeyService);async createSpeechToTextSession(e,i="speech"){const s=await this.getProvider(),t=C(this.configurationService.getValue(P)),o=s.createSpeechToTextSession(e,typeof t=="string"?{language:t}:void 0),a=Date.now();let c=!1,r=!1,d=0;const n=new g,y=()=>{this.activeSpeechToTextSessions=Math.max(0,this.activeSpeechToTextSessions-1),this.hasActiveSpeechToTextSession||this.speechToTextInProgress.reset(),this._onDidEndSpeechToTextSession.fire(),this.telemetryService.publicLog2("speechToTextSession",{context:i,sessionDuration:Date.now()-a,sessionRecognized:c,sessionError:r,sessionContentLength:d,sessionLanguage:t}),n.dispose()};return n.add(e.onCancellationRequested(()=>y())),e.isCancellationRequested&&y(),n.add(o.onDidChange(T=>{switch(T.status){case l.Started:this.activeSpeechToTextSessions++,this.speechToTextInProgress.set(!0),this._onDidStartSpeechToTextSession.fire();break;case l.Recognizing:c=!0;break;case l.Recognized:typeof T.text=="string"&&(d+=T.text.length);break;case l.Stopped:y();break;case l.Error:this.logService.error(`Speech provider error in speech to text session: ${T.text}`),r=!0;break}})),o}async getProvider(){await this.extensionService.activateByEvent("onSpeech");const e=E(Array.from(this.providers.values()));if(e)this.providers.size>1&&this.logService.warn(`Multiple speech providers registered. Picking first one: ${e.metadata.displayName}`);else throw new Error("No Speech provider is registered.");return e}_onDidStartTextToSpeechSession=this._register(new S);onDidStartTextToSpeechSession=this._onDidStartTextToSpeechSession.event;_onDidEndTextToSpeechSession=this._register(new S);onDidEndTextToSpeechSession=this._onDidEndTextToSpeechSession.event;activeTextToSpeechSessions=0;get hasActiveTextToSpeechSession(){return this.activeTextToSpeechSessions>0}textToSpeechInProgress=q.bindTo(this.contextKeyService);async createTextToSpeechSession(e,i="speech"){const s=await this.getProvider(),t=C(this.configurationService.getValue(P)),o=s.createTextToSpeechSession(e,typeof t=="string"?{language:t}:void 0),a=Date.now();let c=!1;const r=new g,d=n=>{this.activeTextToSpeechSessions=Math.max(0,this.activeTextToSpeechSessions-1),this.hasActiveTextToSpeechSession||this.textToSpeechInProgress.reset(),this._onDidEndTextToSpeechSession.fire(),this.telemetryService.publicLog2("textToSpeechSession",{context:i,sessionDuration:Date.now()-a,sessionError:c,sessionLanguage:t}),n&&r.dispose()};return r.add(e.onCancellationRequested(()=>d(!0))),e.isCancellationRequested&&d(!0),r.add(o.onDidChange(n=>{switch(n.status){case x.Started:this.activeTextToSpeechSessions++,this.textToSpeechInProgress.set(!0),this._onDidStartTextToSpeechSession.fire();break;case x.Stopped:d(!1);break;case x.Error:this.logService.error(`Speech provider error in text to speech session: ${n.text}`),c=!0;break}})),o}_onDidStartKeywordRecognition=this._register(new S);onDidStartKeywordRecognition=this._onDidStartKeywordRecognition.event;_onDidEndKeywordRecognition=this._register(new S);onDidEndKeywordRecognition=this._onDidEndKeywordRecognition.event;activeKeywordRecognitionSessions=0;get hasActiveKeywordRecognition(){return this.activeKeywordRecognitionSessions>0}async recognizeKeyword(e){const i=new b,s=new g;s.add(e.onCancellationRequested(()=>{s.dispose(),i.complete(m.Canceled)}));const t=s.add(new g);let o;const a=()=>{t.clear();const r=new K(e);t.add(D(()=>r.dispose(!0)));const d=o=this.doRecognizeKeyword(r.token).then(n=>{d===o&&i.complete(n)},n=>{d===o&&i.error(n)})};s.add(this.hostService.onDidChangeFocus(r=>{!r&&o?(t.clear(),o=void 0):o||a()})),this.hostService.hasFocus&&a();let c;try{c=await i.p}finally{s.dispose()}return this.telemetryService.publicLog2("keywordRecognition",{keywordRecognized:c===m.Recognized}),c}async doRecognizeKeyword(e){const s=(await this.getProvider()).createKeywordRecognitionSession(e);this.activeKeywordRecognitionSessions++,this._onDidStartKeywordRecognition.fire();const t=new g,o=()=>{this.activeKeywordRecognitionSessions=Math.max(0,this.activeKeywordRecognitionSessions-1),this._onDidEndKeywordRecognition.fire(),t.dispose()};t.add(e.onCancellationRequested(()=>o())),e.isCancellationRequested&&o(),t.add(s.onDidChange(a=>{a.status===m.Stopped&&o()}));try{return(await _.toPromise(s.onDidChange)).status}finally{o()}}};u=w([h(0,M),h(1,k),h(2,$),h(3,H),h(4,L),h(5,N)],u);export{u as SpeechService};