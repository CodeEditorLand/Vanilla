var d=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var c=(n,e,t,r)=>{for(var i=r>1?void 0:r?m(e,t):e,s=n.length-1,a;s>=0;s--)(a=n[s])&&(i=(r?a(e,t,i):a(i))||i);return r&&i&&d(e,t,i),i},p=(n,e)=>(t,r)=>e(t,r,n);import{createDecorator as l}from"../../../platform/instantiation/common/instantiation.js";import{ILogService as g}from"../../../platform/log/common/log.js";import*as x from"./extHost.protocol.js";import{IExtHostRpcService as I}from"./extHostRpcService.js";const D=l("IExtHostApiDeprecationService");let o=class{constructor(e,t){this._extHostLogService=t;this._telemetryShape=e.getProxy(x.MainContext.MainThreadTelemetry)}_reportedUsages=new Set;_telemetryShape;report(e,t,r){const i=this.getUsageKey(e,t);this._reportedUsages.has(i)||(this._reportedUsages.add(i),t.isUnderDevelopment&&this._extHostLogService.warn(`[Deprecation Warning] '${e}' is deprecated. ${r}`),this._telemetryShape.$publicLog2("extHostDeprecatedApiUsage",{extensionId:t.identifier.value,apiId:e}))}getUsageKey(e,t){return`${e}-${t.identifier.value}`}};o=c([p(0,I),p(1,g)],o);const u=Object.freeze(new class{report(n,e,t){}});export{o as ExtHostApiDeprecationService,D as IExtHostApiDeprecationService,u as NullApiDeprecationService};
