var d=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var h=(t,e,n,r)=>{for(var i=r>1?void 0:r?m(e,n):e,o=t.length-1,l;o>=0;o--)(l=t[o])&&(i=(r?l(e,n,i):l(i))||i);return r&&i&&d(e,n,i),i},c=(t,e)=>(n,r)=>e(n,r,t);import{ProxyChannel as S}from"../../../base/parts/ipc/common/ipc.js";import{SyncDescriptor as C}from"../../instantiation/common/descriptors.js";import{registerSingleton as I}from"../../instantiation/common/extensions.js";import{createDecorator as x,IInstantiationService as p}from"../../instantiation/common/instantiation.js";import{IMainProcessService as f}from"../common/mainProcessService.js";import"../common/services.js";class v{constructor(e,n,r,i){const o=r.getChannel(e);return T(n)?i.createInstance(new C(n.channelClientCtor,[o])):S.toService(o,n?.proxyOptions)}}function T(t){return!!t?.channelClientCtor}let s=class extends v{constructor(e,n,r,i){super(e,n,r,i)}};s=h([c(2,f),c(3,p)],s);function M(t,e,n){I(t,new C(s,[e,n],!0))}const y=x("sharedProcessService");let a=class extends v{constructor(e,n,r,i){super(e,n,r,i)}};a=h([c(2,y),c(3,p)],a);function N(t,e,n){I(t,new C(a,[e,n],!0))}export{y as ISharedProcessService,M as registerMainProcessRemoteService,N as registerSharedProcessRemoteService};
