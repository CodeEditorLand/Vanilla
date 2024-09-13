var y=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var p=(m,e,r,i)=>{for(var t=i>1?void 0:i?c(e,r):e,s=m.length-1,n;s>=0;s--)(n=m[s])&&(t=(i?n(e,r,t):n(t))||t);return i&&t&&y(e,r,t),t},o=(m,e)=>(r,i)=>e(r,i,m);import{Disposable as g}from"../../../../base/common/lifecycle.js";import{process as I}from"../../../../base/parts/sandbox/electron-sandbox/globals.js";import{IConfigurationService as h}from"../../../../platform/configuration/common/configuration.js";import{InstantiationType as f,registerSingleton as T}from"../../../../platform/instantiation/common/extensions.js";import{ISharedProcessService as u}from"../../../../platform/ipc/electron-sandbox/services.js";import{IProductService as v}from"../../../../platform/product/common/productService.js";import{IStorageService as E}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as P}from"../../../../platform/telemetry/common/telemetry.js";import{TelemetryAppenderClient as b}from"../../../../platform/telemetry/common/telemetryIpc.js";import{TelemetryService as D}from"../../../../platform/telemetry/common/telemetryService.js";import{NullTelemetryService as C,getPiiPathsFromEnvironment as S,isInternalTelemetry as L,supportsTelemetry as x}from"../../../../platform/telemetry/common/telemetryUtils.js";import{INativeWorkbenchEnvironmentService as k}from"../../environment/electron-sandbox/environmentService.js";import{resolveWorkbenchCommonProperties as q}from"../common/workbenchCommonProperties.js";let l=class extends g{impl;sendErrorTelemetry;get sessionId(){return this.impl.sessionId}get machineId(){return this.impl.machineId}get sqmId(){return this.impl.sqmId}get devDeviceId(){return this.impl.devDeviceId}get firstSessionDate(){return this.impl.firstSessionDate}get msftInternal(){return this.impl.msftInternal}constructor(e,r,i,t,s){if(super(),x(r,e)){const n=L(r,s),a=i.getChannel("telemetryAppender"),d={appenders:[new b(a)],commonProperties:q(t,e.os.release,e.os.hostname,r.commit,r.version,e.machineId,e.sqmId,e.devDeviceId,n,I,e.remoteAuthority),piiPaths:S(e),sendErrorTelemetry:!0};this.impl=this._register(new D(d,s,r))}else this.impl=C;this.sendErrorTelemetry=this.impl.sendErrorTelemetry}setExperimentProperty(e,r){return this.impl.setExperimentProperty(e,r)}get telemetryLevel(){return this.impl.telemetryLevel}publicLog(e,r){this.impl.publicLog(e,r)}publicLog2(e,r){this.publicLog(e,r)}publicLogError(e,r){this.impl.publicLogError(e,r)}publicLogError2(e,r){this.publicLogError(e,r)}};l=p([o(0,k),o(1,v),o(2,u),o(3,E),o(4,h)],l),T(P,l,f.Delayed);export{l as TelemetryService};
