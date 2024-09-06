var v=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var f=(m,r,t,o)=>{for(var e=o>1?void 0:o?I(r,t):r,i=m.length-1,s;i>=0;i--)(s=m[i])&&(e=(o?s(r,t,e):s(e))||e);return o&&e&&v(r,t,e),e},p=(m,r)=>(t,o)=>r(t,o,m);import{createCancelablePromise as u,raceTimeout as R}from"../../../../base/common/async.js";import"../../../../base/common/cancellation.js";import"../../../../base/common/lifecycle.js";import{StopWatch as h}from"../../../../base/common/stopwatch.js";import{InstantiationType as g,registerSingleton as y}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as T}from"../../../../platform/log/common/log.js";import{IAiRelatedInformationService as P}from"./aiRelatedInformation.js";let a=class{constructor(r){this.logService=r}_serviceBrand;static DEFAULT_TIMEOUT=1e3*10;_providers=new Map;isEnabled(){return this._providers.size>0}registerAiRelatedInformationProvider(r,t){const o=this._providers.get(r)??[];return o.push(t),this._providers.set(r,o),{dispose:()=>{const e=this._providers.get(r)??[],i=e.indexOf(t);i!==-1&&e.splice(i,1),e.length===0&&this._providers.delete(r)}}}async getRelatedInformation(r,t,o){if(this._providers.size===0)throw new Error("No related information providers registered");const e=[];for(const l of t){const d=this._providers.get(l);d&&e.push(...d)}if(e.length===0)throw new Error("No related information providers registered for the given types");const i=h.create(),s=e.map(l=>u(async d=>{try{return(await l.provideAiRelatedInformation(r,d)).filter(c=>t.includes(c.type))}catch{}return[]}));try{const l=await R(Promise.allSettled(s),a.DEFAULT_TIMEOUT,()=>{s.forEach(n=>n.cancel()),this.logService.warn("[AiRelatedInformationService]: Related information provider timed out")});return l?l.filter(n=>n.status==="fulfilled").flatMap(n=>n.value):[]}finally{i.stop(),this.logService.trace(`[AiRelatedInformationService]: getRelatedInformation took ${i.elapsed()}ms`)}}};a=f([p(0,T)],a),y(P,a,g.Delayed);export{a as AiRelatedInformationService};
