var s=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var p=(t,o,m,e)=>{for(var r=e>1?void 0:e?d(o,m):o,a=t.length-1,n;a>=0;a--)(n=t[a])&&(r=(e?n(o,m,r):n(r))||r);return e&&r&&s(o,m,r),r};import{onUnexpectedError as E,transformErrorFromSerialization as f}from"../../../base/common/errors.js";import{extHostNamedCustomer as l}from"../../services/extensions/common/extHostCustomers.js";import{MainContext as x}from"../common/extHost.protocol.js";let i=class{dispose(){}$onUnexpectedError(o){o&&o.$isError&&(o=f(o)),E(o)}};i=p([l(x.MainThreadErrors)],i);export{i as MainThreadErrors};
