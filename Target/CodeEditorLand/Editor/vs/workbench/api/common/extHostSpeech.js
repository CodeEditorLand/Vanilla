import{CancellationTokenSource as a}from"../../../base/common/cancellation.js";import{DisposableStore as c,toDisposable as h}from"../../../base/common/lifecycle.js";import"../../../platform/extensions/common/extensions.js";import{MainContext as l}from"./extHost.protocol.js";class p{static ID_POOL=1;proxy;providers=new Map;sessions=new Map;synthesizers=new Map;constructor(e){this.proxy=e.getProxy(l.MainThreadSpeech)}async $createSpeechToTextSession(e,t,n){const s=this.providers.get(e);if(!s)return;const o=new c,i=new a;this.sessions.set(t,i);const r=await s.provideSpeechToTextSession(i.token,n?{language:n}:void 0);r&&(o.add(r.onDidChange(d=>{i.token.isCancellationRequested||this.proxy.$emitSpeechToTextEvent(t,d)})),o.add(i.token.onCancellationRequested(()=>o.dispose())))}async $cancelSpeechToTextSession(e){this.sessions.get(e)?.dispose(!0),this.sessions.delete(e)}async $createTextToSpeechSession(e,t,n){const s=this.providers.get(e);if(!s)return;const o=new c,i=new a;this.sessions.set(t,i);const r=await s.provideTextToSpeechSession(i.token,n?{language:n}:void 0);r&&(this.synthesizers.set(t,r),o.add(r.onDidChange(d=>{i.token.isCancellationRequested||this.proxy.$emitTextToSpeechEvent(t,d)})),o.add(i.token.onCancellationRequested(()=>o.dispose())))}async $synthesizeSpeech(e,t){this.synthesizers.get(e)?.synthesize(t)}async $cancelTextToSpeechSession(e){this.sessions.get(e)?.dispose(!0),this.sessions.delete(e),this.synthesizers.delete(e)}async $createKeywordRecognitionSession(e,t){const n=this.providers.get(e);if(!n)return;const s=new c,o=new a;this.sessions.set(t,o);const i=await n.provideKeywordRecognitionSession(o.token);i&&(s.add(i.onDidChange(r=>{o.token.isCancellationRequested||this.proxy.$emitKeywordRecognitionEvent(t,r)})),s.add(o.token.onCancellationRequested(()=>s.dispose())))}async $cancelKeywordRecognitionSession(e){this.sessions.get(e)?.dispose(!0),this.sessions.delete(e)}registerProvider(e,t,n){const s=p.ID_POOL++;return this.providers.set(s,n),this.proxy.$registerProvider(s,t,{extension:e,displayName:e.value}),h(()=>{this.proxy.$unregisterProvider(s),this.providers.delete(s)})}}export{p as ExtHostSpeech};
