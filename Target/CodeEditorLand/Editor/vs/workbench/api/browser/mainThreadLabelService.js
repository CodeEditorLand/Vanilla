var p=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var l=(s,o,e,r)=>{for(var t=r>1?void 0:r?c(o,e):o,i=s.length-1,m;i>=0;i--)(m=s[i])&&(t=(r?m(o,e,t):m(t))||t);return r&&t&&p(o,e,t),t},b=(s,o)=>(e,r)=>o(e,r,s);import{Disposable as n,DisposableMap as u}from"../../../../vs/base/common/lifecycle.js";import{ILabelService as d}from"../../../../vs/platform/label/common/label.js";import{MainContext as L}from"../../../../vs/workbench/api/common/extHost.protocol.js";import{extHostNamedCustomer as v}from"../../../../vs/workbench/services/extensions/common/extHostCustomers.js";let a=class extends n{constructor(e,r){super();this._labelService=r}_resourceLabelFormatters=this._register(new u);$registerResourceLabelFormatter(e,r){r.priority=!0;const t=this._labelService.registerCachedFormatter(r);this._resourceLabelFormatters.set(e,t)}$unregisterResourceLabelFormatter(e){this._resourceLabelFormatters.deleteAndDispose(e)}};a=l([v(L.MainThreadLabelService),b(1,d)],a);export{a as MainThreadLabelService};
