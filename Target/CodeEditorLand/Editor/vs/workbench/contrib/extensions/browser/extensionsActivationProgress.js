var p=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var a=(s,i,t,r)=>{for(var e=r>1?void 0:r?f(i,t):i,o=s.length-1,n;o>=0;o--)(n=s[o])&&(e=(r?n(i,t,e):n(e))||e);return r&&e&&p(i,t,e),e},l=(s,i)=>(t,r)=>i(t,r,s);import"../../../common/contributions.js";import{IExtensionService as d}from"../../../services/extensions/common/extensions.js";import{IProgressService as v,ProgressLocation as I}from"../../../../platform/progress/common/progress.js";import{localize as u}from"../../../../nls.js";import"../../../../base/common/lifecycle.js";import{DeferredPromise as b,timeout as S}from"../../../../base/common/async.js";import{ILogService as h}from"../../../../platform/log/common/log.js";import{CancellationToken as y}from"../../../../base/common/cancellation.js";let m=class{_listener;constructor(i,t,r){const e={location:I.Window,title:u("activation","Activating Extensions...")};let o,n=0;this._listener=i.onWillActivateByEvent(c=>{r.trace("onWillActivateByEvent: ",c.event),o||(o=new b,t.withProgress(e,W=>o.p)),n++,Promise.race([c.activation,S(5e3,y.None)]).finally(()=>{--n===0&&(o.complete(void 0),o=void 0)})})}dispose(){this._listener.dispose()}};m=a([l(0,d),l(1,v),l(2,h)],m);export{m as ExtensionActivationProgress};
