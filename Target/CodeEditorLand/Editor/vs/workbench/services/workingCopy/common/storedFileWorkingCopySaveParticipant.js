var m=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var c=(s,o,e,r)=>{for(var t=r>1?void 0:r?d(o,e):o,i=s.length-1,a;i>=0;i--)(a=s[i])&&(t=(r?a(o,e,t):a(t))||t);return r&&t&&m(o,e,t),t},l=(s,o)=>(e,r)=>o(e,r,s);import{insert as v}from"../../../../base/common/arrays.js";import{raceCancellation as g}from"../../../../base/common/async.js";import{Disposable as S,toDisposable as I}from"../../../../base/common/lifecycle.js";import{ILogService as P}from"../../../../platform/log/common/log.js";let p=class extends S{constructor(e){super();this.logService=e}saveParticipants=[];get length(){return this.saveParticipants.length}addSaveParticipant(e){const r=v(this.saveParticipants,e);return I(()=>r())}async participate(e,r,t,i){e.model?.pushStackElement();for(const a of this.saveParticipants){if(i.isCancellationRequested||e.isDisposed())break;try{const n=a.participate(e,r,t,i);await g(n,i)}catch(n){this.logService.warn(n)}}e.model?.pushStackElement()}dispose(){this.saveParticipants.splice(0,this.saveParticipants.length),super.dispose()}};p=c([l(0,P)],p);export{p as StoredFileWorkingCopySaveParticipant};
