var m=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var h=(t,e,n,r)=>{for(var i=r>1?void 0:r?d(e,n):e,o=t.length-1,l;o>=0;o--)(l=t[o])&&(i=(r?l(e,n,i):l(i))||i);return r&&i&&m(e,n,i),i},c=(t,e)=>(n,r)=>e(n,r,t);import{ProxyChannel as S}from"../../../base/parts/ipc/common/ipc.js";import{SyncDescriptor as C}from"../../instantiation/common/descriptors.js";import{registerSingleton as p}from"../../instantiation/common/extensions.js";import{IInstantiationService as I,createDecorator as x}from"../../instantiation/common/instantiation.js";import{IMainProcessService as f}from"../common/mainProcessService.js";class v{constructor(e,n,r,i){const o=r.getChannel(e);return y(n)?i.createInstance(new C(n.channelClientCtor,[o])):S.toService(o,n?.proxyOptions)}}function y(t){return!!t?.channelClientCtor}let s=class extends v{constructor(e,n,r,i){super(e,n,r,i)}};s=h([c(2,f),c(3,I)],s);function w(t,e,n){p(t,new C(s,[e,n],!0))}const T=x("sharedProcessService");let a=class extends v{constructor(e,n,r,i){super(e,n,r,i)}};a=h([c(2,T),c(3,I)],a);function j(t,e,n){p(t,new C(a,[e,n],!0))}export{T as ISharedProcessService,w as registerMainProcessRemoteService,j as registerSharedProcessRemoteService};
