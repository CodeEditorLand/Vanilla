var g=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var a=(s,e,r,i)=>{for(var t=i>1?void 0:i?v(e,r):e,n=s.length-1,d;n>=0;n--)(d=s[n])&&(t=(i?d(e,r,t):d(t))||t);return i&&t&&g(e,r,t),t},m=(s,e)=>(r,i)=>e(r,i,s);import{Emitter as l}from"../../../base/common/event.js";import{DisposableMap as b,DisposableStore as c}from"../../../base/common/lifecycle.js";import{InstantiationType as E,registerSingleton as u}from"../../../platform/instantiation/common/extensions.js";import{createDecorator as h}from"../../../platform/instantiation/common/instantiation.js";import{extHostNamedCustomer as y}from"../../services/extensions/common/extHostCustomers.js";import{ExtHostContext as P,MainContext as C}from"../common/extHost.protocol.js";const p=h("embeddingsService");class I{_serviceBrand;providers;_onDidChange=new l;onDidChange=this._onDidChange.event;constructor(){this.providers=new Map}get allProviders(){return this.providers.keys()}registerProvider(e,r){return this.providers.set(e,r),this._onDidChange.fire(),{dispose:()=>{this.providers.delete(e),this._onDidChange.fire()}}}computeEmbeddings(e,r,i){const t=this.providers.get(e);return t?t.provideEmbeddings(r,i):Promise.reject(new Error(`No embeddings provider registered with id: ${e}`))}}u(p,I,E.Delayed);let o=class{constructor(e,r){this.embeddingsService=r;this._proxy=e.getProxy(P.ExtHostEmbeddings),this._store.add(r.onDidChange(()=>{this._proxy.$acceptEmbeddingModels(Array.from(r.allProviders))}))}_store=new c;_providers=this._store.add(new b);_proxy;dispose(){this._store.dispose()}$registerEmbeddingProvider(e,r){const i=this.embeddingsService.registerProvider(r,{provideEmbeddings:(t,n)=>this._proxy.$provideEmbeddings(e,t,n)});this._providers.set(e,i)}$unregisterEmbeddingProvider(e){this._providers.deleteAndDispose(e)}$computeEmbeddings(e,r,i){return this.embeddingsService.computeEmbeddings(e,r,i)}};o=a([y(C.MainThreadEmbeddings),m(1,p)],o);export{o as MainThreadEmbeddings};
