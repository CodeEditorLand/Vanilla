var p=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var c=(r,e,t,i)=>{for(var o=i>1?void 0:i?m(e,t):e,s=r.length-1,a;s>=0;s--)(a=r[s])&&(o=(i?a(e,t,o):a(o))||o);return i&&o&&p(e,t,o),o},d=(r,e)=>(t,i)=>e(t,i,r);import"electron";import{timeout as w}from"../../../../vs/base/common/async.js";import{ILogService as l}from"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/profiling/common/profiling.js";let n=class{constructor(e,t,i){this._window=e;this._sessionId=t;this._logService=i}async inspect(e){await this._connect();const t=this._window.webContents.debugger;await t.sendCommand("Profiler.start"),this._logService.warn("[perf] profiling STARTED",this._sessionId),await w(e);const i=await t.sendCommand("Profiler.stop");return this._logService.warn("[perf] profiling DONE",this._sessionId),await this._disconnect(),i.profile}async _connect(){const e=this._window.webContents.debugger;e.attach(),await e.sendCommand("Profiler.enable")}async _disconnect(){const e=this._window.webContents.debugger;await e.sendCommand("Profiler.disable"),e.detach()}};n=c([d(2,l)],n);export{n as WindowProfiler};
