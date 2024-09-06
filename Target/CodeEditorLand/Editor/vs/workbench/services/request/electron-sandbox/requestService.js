var l=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var c=(i,o,e,r)=>{for(var t=r>1?void 0:r?m(o,e):o,a=i.length-1,u;a>=0;a--)(u=i[a])&&(t=(r?u(o,e,t):u(t))||t);return r&&t&&l(o,e,t),t},s=(i,o)=>(e,r)=>o(e,r,i);import"../../../../base/common/cancellation.js";import{request as d}from"../../../../base/parts/request/browser/request.js";import"../../../../base/parts/request/common/request.js";import{localize as f}from"../../../../nls.js";import{IConfigurationService as p}from"../../../../platform/configuration/common/configuration.js";import{InstantiationType as v,registerSingleton as g}from"../../../../platform/instantiation/common/extensions.js";import{ILoggerService as h}from"../../../../platform/log/common/log.js";import{INativeHostService as y}from"../../../../platform/native/common/native.js";import{AbstractRequestService as I,IRequestService as S}from"../../../../platform/request/common/request.js";let n=class extends I{constructor(e,r,t){super(t.createLogger("network-window",{name:f("network-window","Network (Window)"),hidden:!0}));this.nativeHostService=e;this.configurationService=r}async request(e,r){return e.proxyAuthorization||(e.proxyAuthorization=this.configurationService.getValue("http.proxyAuthorization")),this.logAndRequest(e,()=>d(e,r))}async resolveProxy(e){return this.nativeHostService.resolveProxy(e)}async lookupAuthorization(e){return this.nativeHostService.lookupAuthorization(e)}async lookupKerberosAuthorization(e){return this.nativeHostService.lookupKerberosAuthorization(e)}async loadCertificates(){return this.nativeHostService.loadCertificates()}};n=c([s(0,y),s(1,p),s(2,h)],n),g(S,n,v.Delayed);export{n as NativeRequestService};
