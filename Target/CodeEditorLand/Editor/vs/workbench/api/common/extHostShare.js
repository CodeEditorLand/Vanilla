import"../../../base/common/cancellation.js";import{URI as i}from"../../../base/common/uri.js";import"../../../base/common/uriIpc.js";import{MainContext as a}from"./extHost.protocol.js";import{DocumentSelector as n,Range as s}from"./extHostTypeConverters.js";class t{constructor(o,e){this.uriTransformer=e;this.proxy=o.getProxy(a.MainThreadShare)}static handlePool=0;proxy;providers=new Map;async $provideShare(o,e,r){return await this.providers.get(o)?.provideShare({selection:s.to(e.selection),resourceUri:i.revive(e.resourceUri)},r)??void 0}registerShareProvider(o,e){const r=t.handlePool++;return this.providers.set(r,e),this.proxy.$registerShareProvider(r,n.from(o,this.uriTransformer),e.id,e.label,e.priority),{dispose:()=>{this.proxy.$unregisterShareProvider(r),this.providers.delete(r)}}}}export{t as ExtHostShare};
