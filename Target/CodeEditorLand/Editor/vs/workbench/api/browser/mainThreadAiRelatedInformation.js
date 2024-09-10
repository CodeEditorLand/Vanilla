var l=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var m=(i,r,e,t)=>{for(var o=t>1?void 0:t?p(r,e):r,n=i.length-1,a;n>=0;n--)(a=i[n])&&(o=(t?a(r,e,o):a(o))||o);return t&&o&&l(r,e,o),o},d=(i,r)=>(e,t)=>r(e,t,i);import{CancellationToken as f}from"../../../base/common/cancellation.js";import{Disposable as I,DisposableMap as R}from"../../../base/common/lifecycle.js";import{ExtHostContext as v,MainContext as x}from"../common/extHost.protocol.js";import{IAiRelatedInformationService as A}from"../../services/aiRelatedInformation/common/aiRelatedInformation.js";import{extHostNamedCustomer as g}from"../../services/extensions/common/extHostCustomers.js";let s=class extends I{constructor(e,t){super();this._aiRelatedInformationService=t;this._proxy=e.getProxy(v.ExtHostAiRelatedInformation)}_proxy;_registrations=this._register(new R);$getAiRelatedInformation(e,t){return this._aiRelatedInformationService.getRelatedInformation(e,t,f.None)}$registerAiRelatedInformationProvider(e,t){const o={provideAiRelatedInformation:(n,a)=>this._proxy.$provideAiRelatedInformation(e,n,a)};this._registrations.set(e,this._aiRelatedInformationService.registerAiRelatedInformationProvider(t,o))}$unregisterAiRelatedInformationProvider(e){this._registrations.deleteAndDispose(e)}};s=m([g(x.MainThreadAiRelatedInformation),d(1,A)],s);export{s as MainThreadAiRelatedInformation};
