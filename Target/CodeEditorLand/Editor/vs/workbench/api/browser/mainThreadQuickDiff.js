var d=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var f=(s,i,o,r)=>{for(var e=r>1?void 0:r?m(i,o):i,t=s.length-1,p;t>=0;t--)(p=s[t])&&(e=(r?p(i,o,e):p(e))||e);return r&&e&&d(i,o,e),e},a=(s,i)=>(o,r)=>i(o,r,s);import{CancellationToken as D}from"../../../base/common/cancellation.js";import{DisposableMap as u}from"../../../base/common/lifecycle.js";import{URI as c}from"../../../base/common/uri.js";import{ExtHostContext as l,MainContext as x}from"../common/extHost.protocol.js";import{IQuickDiffService as k}from"../../contrib/scm/common/quickDiff.js";import{extHostNamedCustomer as b}from"../../services/extensions/common/extHostCustomers.js";let n=class{constructor(i,o){this.quickDiffService=o;this.proxy=i.getProxy(l.ExtHostQuickDiff)}proxy;providerDisposables=new u;async $registerQuickDiffProvider(i,o,r,e){const t={label:r,rootUri:c.revive(e),selector:o,isSCM:!1,getOriginalResource:async v=>c.revive(await this.proxy.$provideOriginalResource(i,v,D.None))},p=this.quickDiffService.addQuickDiffProvider(t);this.providerDisposables.set(i,p)}async $unregisterQuickDiffProvider(i){this.providerDisposables.has(i)&&this.providerDisposables.deleteAndDispose(i)}dispose(){this.providerDisposables.dispose()}};n=f([b(x.MainThreadQuickDiff),a(1,k)],n);export{n as MainThreadQuickDiff};
