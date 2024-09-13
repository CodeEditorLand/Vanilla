var T=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var I=(l,e,r,o)=>{for(var i=o>1?void 0:o?c(e,r):e,s=l.length-1,t;s>=0;s--)(t=l[s])&&(i=(o?t(e,r,i):t(i))||i);return o&&i&&T(e,r,i),i},m=(l,e)=>(r,o)=>e(r,o,l);import{Disposable as u}from"../../../../base/common/lifecycle.js";import{IConfigurationService as E}from"../../../../platform/configuration/common/configuration.js";import{InstantiationType as v,registerSingleton as L}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as b,ILoggerService as C}from"../../../../platform/log/common/log.js";import{IProductService as P}from"../../../../platform/product/common/productService.js";import{IStorageService as D}from"../../../../platform/storage/common/storage.js";import{OneDataSystemWebAppender as S}from"../../../../platform/telemetry/browser/1dsAppender.js";import{ITelemetryService as k,TELEMETRY_SETTING_ID as x,TelemetryLevel as w}from"../../../../platform/telemetry/common/telemetry.js";import{TelemetryLogAppender as R}from"../../../../platform/telemetry/common/telemetryLogAppender.js";import{TelemetryService as O}from"../../../../platform/telemetry/common/telemetryService.js";import{NullTelemetryService as d,getTelemetryLevel as B,isInternalTelemetry as M,isLoggingOnly as W,supportsTelemetry as _}from"../../../../platform/telemetry/common/telemetryUtils.js";import{IBrowserWorkbenchEnvironmentService as G}from"../../environment/browser/environmentService.js";import{IRemoteAgentService as N}from"../../remote/common/remoteAgentService.js";import{resolveWorkbenchCommonProperties as z}from"./workbenchCommonProperties.js";let p=class extends u{impl=d;sendErrorTelemetry=!0;get sessionId(){return this.impl.sessionId}get machineId(){return this.impl.machineId}get sqmId(){return this.impl.sqmId}get devDeviceId(){return this.impl.devDeviceId}get firstSessionDate(){return this.impl.firstSessionDate}get msftInternal(){return this.impl.msftInternal}constructor(e,r,o,i,s,t,n){super(),this.impl=this.initializeService(e,r,o,i,s,t,n),this._register(i.onDidChangeConfiguration(g=>{g.affectsConfiguration(x)&&(this.impl=this.initializeService(e,r,o,i,s,t,n))}))}initializeService(e,r,o,i,s,t,n){if(_(t,e)&&t.aiConfig?.ariaKey&&B(i)!==w.NONE&&this.impl===d){const a=[],y=M(t,i);if(!W(t,e))if(n.getConnection()!==null){const h={log:n.logTelemetry.bind(n),flush:n.flushTelemetry.bind(n)};a.push(h)}else a.push(new S(y,"monacoworkbench",null,t.aiConfig?.ariaKey));a.push(new R(r,o,e,t));const f={appenders:a,commonProperties:z(s,t.commit,t.version,y,e.remoteAuthority,t.embedderIdentifier,t.removeTelemetryMachineId,e.options&&e.options.resolveCommonTelemetryProperties),sendErrorTelemetry:this.sendErrorTelemetry};return this._register(new O(f,i,t))}return this.impl}setExperimentProperty(e,r){return this.impl.setExperimentProperty(e,r)}get telemetryLevel(){return this.impl.telemetryLevel}publicLog(e,r){this.impl.publicLog(e,r)}publicLog2(e,r){this.publicLog(e,r)}publicLogError(e,r){this.impl.publicLog(e,r)}publicLogError2(e,r){this.publicLogError(e,r)}};p=I([m(0,G),m(1,b),m(2,C),m(3,E),m(4,D),m(5,P),m(6,N)],p),L(k,p,v.Delayed);export{p as TelemetryService};
