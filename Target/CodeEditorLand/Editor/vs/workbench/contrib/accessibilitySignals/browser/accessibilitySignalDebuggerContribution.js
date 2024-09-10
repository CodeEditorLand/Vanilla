var c=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var b=(d,t,e,o)=>{for(var s=o>1?void 0:o?D(t,e):t,a=d.length-1,n;a>=0;a--)(n=d[a])&&(s=(o?n(t,e,s):n(s))||s);return o&&s&&c(t,e,s),s},p=(d,t)=>(e,o)=>t(e,o,d);import{Disposable as h,toDisposable as m}from"../../../../base/common/lifecycle.js";import{autorunWithStore as I,observableFromEvent as u}from"../../../../base/common/observable.js";import{IAccessibilitySignalService as f,AccessibilitySignal as S}from"../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";import{IDebugService as g}from"../../debug/common/debug.js";let l=class extends h{constructor(e,o){super();this.accessibilitySignalService=o;const s=u(this,o.onSoundEnabledChanged(S.onDebugBreak),()=>o.isSoundEnabled(S.onDebugBreak));this._register(I((a,n)=>{if(!s.read(a))return;const r=new Map;n.add(m(()=>{r.forEach(i=>i.dispose()),r.clear()})),n.add(e.onDidNewSession(i=>r.set(i,this.handleSession(i)))),n.add(e.onDidEndSession(({session:i})=>{r.get(i)?.dispose(),r.delete(i)})),e.getModel().getSessions().forEach(i=>r.set(i,this.handleSession(i)))}))}handleSession(e){return e.onDidChangeState(o=>{const s=e.getStoppedDetails(),a="breakpoint";s&&s.reason===a&&this.accessibilitySignalService.playSignal(S.onDebugBreak)})}};l=b([p(0,g),p(1,f)],l);export{l as AccessibilitySignalLineDebuggerContribution};
