var p=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var m=(s,e,o,r)=>{for(var t=r>1?void 0:r?v(e,o):e,i=s.length-1,n;i>=0;i--)(n=s[i])&&(t=(r?n(e,o,t):n(t))||t);return r&&t&&p(e,o,t),t},c=(s,e)=>(o,r)=>e(o,r,s);import{Disposable as E}from"../../../../vs/base/common/lifecycle.js";import{IRemoteAuthorityResolverService as S}from"../../../../vs/platform/remote/common/remoteAuthorityResolver.js";import{IWorkbenchEnvironmentService as h}from"../../../../vs/workbench/services/environment/common/environmentService.js";import{extHostCustomer as y}from"../../../../vs/workbench/services/extensions/common/extHostCustomers.js";import{ExtHostContext as f}from"../common/extHost.protocol.js";let x=class extends E{constructor(o,r,t){super();this._environmentService=r;this._proxy=o.getProxy(f.ExtHostExtensionService);const i=this._environmentService.remoteAuthority;i&&this._register(t.onDidChangeConnectionData(()=>{const n=t.getConnectionData(i);n&&this._proxy.$updateRemoteConnectionData(n)}))}_proxy};x=m([y,c(1,h),c(2,S)],x);export{x as MainThreadRemoteConnectionData};
