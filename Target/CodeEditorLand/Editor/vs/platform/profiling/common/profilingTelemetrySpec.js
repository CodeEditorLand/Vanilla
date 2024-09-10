import"../../log/common/log.js";import"./profilingModel.js";import"../../telemetry/common/telemetry.js";import{errorHandler as i}from"../../../base/common/errors.js";function g(r,e,o,n){const{sample:a,perfBaseline:l,source:s}=r;e.publicLog2("unresponsive.sample",{perfBaseline:l,selfTime:a.selfTime,totalTime:a.totalTime,percentage:a.percentage,functionName:a.location,callers:a.caller.map(t=>t.location).join("<"),callersAnnotated:a.caller.map(t=>`${t.percentage}|${t.location}`).join("<"),source:s});const m=new c(r);n?i.onUnexpectedError(m):o.error(m)}class c extends Error{selfTime;constructor(e){super(`PerfSampleError: by ${e.source} in ${e.sample.location}`),this.name="PerfSampleError",this.selfTime=e.sample.selfTime;const o=[e.sample.absLocation,...e.sample.caller.map(n=>n.absLocation)];this.stack=`
	 at ${o.join(`
	 at `)}`}}export{g as reportSample};
