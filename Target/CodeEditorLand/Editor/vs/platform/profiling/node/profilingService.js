import{generateUuid as o}from"../../../base/common/uuid.js";class p{_serviceBrand;_sessions=new Map;async startProfiling(s){const r=await(await import("v8-inspect-profiler")).startProfiling({host:s.host,port:s.port,checkForPaused:!0}),e=o();return this._sessions.set(e,r),e}async stopProfiling(s){const i=this._sessions.get(s);if(!i)throw new Error(`UNKNOWN session '${s}'`);const r=await i.stop();return this._sessions.delete(s),r.profile}}export{p as InspectProfilingService};
