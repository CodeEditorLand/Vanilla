var l=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var n=(s,e,c,i)=>{for(var r=i>1?void 0:i?h(e,c):e,o=s.length-1,S;o>=0;o--)(S=s[o])&&(r=(i?S(e,c,r):S(r))||r);return i&&r&&l(e,c,r),r},a=(s,e)=>(c,i)=>e(c,i,s);import{Disposable as v}from"../../../../base/common/lifecycle.js";import{AccessibilitySignal as p,IAccessibilitySignalService as d}from"../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";import"../../../common/contributions.js";import{ISpeechService as g}from"../common/speechService.js";let t=class extends v{constructor(c,i){super();this._accessibilitySignalService=c;this._speechService=i;this._register(this._speechService.onDidStartSpeechToTextSession(()=>this._accessibilitySignalService.playSignal(p.voiceRecordingStarted))),this._register(this._speechService.onDidEndSpeechToTextSession(()=>this._accessibilitySignalService.playSignal(p.voiceRecordingStopped)))}static ID="workbench.contrib.speechAccessibilitySignal"};t=n([a(0,d),a(1,g)],t);export{t as SpeechAccessibilitySignalContribution};
