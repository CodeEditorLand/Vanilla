var l=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var T=(c,e,o,t)=>{for(var p=t>1?void 0:t?m(e,o):e,s=c.length-1,r;s>=0;s--)(r=c[s])&&(p=(t?r(e,o,p):r(p))||p);return t&&p&&l(e,o,p),p},S=(c,e)=>(o,t)=>e(o,t,c);import{raceCancellation as C}from"../../../base/common/async.js";import{Emitter as g,Event as d}from"../../../base/common/event.js";import{DisposableStore as v}from"../../../base/common/lifecycle.js";import{ILogService as E}from"../../../platform/log/common/log.js";import{ISpeechService as u,TextToSpeechStatus as w}from"../../contrib/speech/common/speechService.js";import{extHostNamedCustomer as R}from"../../services/extensions/common/extHostCustomers.js";import{ExtHostContext as I,MainContext as D}from"../common/extHost.protocol.js";let h=class{constructor(e,o,t){this.speechService=o;this.logService=t;this.proxy=e.getProxy(I.ExtHostSpeech)}proxy;providerRegistrations=new Map;speechToTextSessions=new Map;textToSpeechSessions=new Map;keywordRecognitionSessions=new Map;$registerProvider(e,o,t){this.logService.trace("[Speech] extension registered provider",t.extension.value);const p=this.speechService.registerSpeechProvider(o,{metadata:t,createSpeechToTextSession:(s,r)=>{if(s.isCancellationRequested)return{onDidChange:d.None};const n=new v,i=Math.random();this.proxy.$createSpeechToTextSession(e,i,r?.language);const a=n.add(new g);return this.speechToTextSessions.set(i,{onDidChange:a}),n.add(s.onCancellationRequested(()=>{this.proxy.$cancelSpeechToTextSession(i),this.speechToTextSessions.delete(i),n.dispose()})),{onDidChange:a.event}},createTextToSpeechSession:(s,r)=>{if(s.isCancellationRequested)return{onDidChange:d.None,synthesize:async()=>{}};const n=new v,i=Math.random();this.proxy.$createTextToSpeechSession(e,i,r?.language);const a=n.add(new g);return this.textToSpeechSessions.set(i,{onDidChange:a}),n.add(s.onCancellationRequested(()=>{this.proxy.$cancelTextToSpeechSession(i),this.textToSpeechSessions.delete(i),n.dispose()})),{onDidChange:a.event,synthesize:async x=>{await this.proxy.$synthesizeSpeech(i,x),await C(d.toPromise(d.filter(a.event,y=>y.status===w.Stopped)),s)}}},createKeywordRecognitionSession:s=>{if(s.isCancellationRequested)return{onDidChange:d.None};const r=new v,n=Math.random();this.proxy.$createKeywordRecognitionSession(e,n);const i=r.add(new g);return this.keywordRecognitionSessions.set(n,{onDidChange:i}),r.add(s.onCancellationRequested(()=>{this.proxy.$cancelKeywordRecognitionSession(n),this.keywordRecognitionSessions.delete(n),r.dispose()})),{onDidChange:i.event}}});this.providerRegistrations.set(e,{dispose:()=>{p.dispose()}})}$unregisterProvider(e){const o=this.providerRegistrations.get(e);o&&(o.dispose(),this.providerRegistrations.delete(e))}$emitSpeechToTextEvent(e,o){this.speechToTextSessions.get(e)?.onDidChange.fire(o)}$emitTextToSpeechEvent(e,o){this.textToSpeechSessions.get(e)?.onDidChange.fire(o)}$emitKeywordRecognitionEvent(e,o){this.keywordRecognitionSessions.get(e)?.onDidChange.fire(o)}dispose(){this.providerRegistrations.forEach(e=>e.dispose()),this.providerRegistrations.clear(),this.speechToTextSessions.forEach(e=>e.onDidChange.dispose()),this.speechToTextSessions.clear(),this.textToSpeechSessions.forEach(e=>e.onDidChange.dispose()),this.textToSpeechSessions.clear(),this.keywordRecognitionSessions.forEach(e=>e.onDidChange.dispose()),this.keywordRecognitionSessions.clear()}};h=T([R(D.MainThreadSpeech),S(1,u),S(2,E)],h);export{h as MainThreadSpeech};
