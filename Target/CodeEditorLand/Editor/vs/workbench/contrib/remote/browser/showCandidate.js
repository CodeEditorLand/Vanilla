var a=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var c=(m,o,i,e)=>{for(var r=e>1?void 0:e?f(o,i):o,n=m.length-1,s;n>=0;n--)(s=m[n])&&(r=(e?s(o,i,r):s(r))||r);return e&&r&&a(o,i,r),r},p=(m,o)=>(i,e)=>o(i,e,m);import{Disposable as h}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/workbench/common/contributions.js";import{IBrowserWorkbenchEnvironmentService as P}from"../../../../../vs/workbench/services/environment/browser/environmentService.js";import{IRemoteExplorerService as b}from"../../../../../vs/workbench/services/remote/common/remoteExplorerService.js";import"../../../../../vs/workbench/services/remote/common/tunnelModel.js";let l=class extends h{static ID="workbench.contrib.showPortCandidate";constructor(o,i){super();const e=i.options?.tunnelProvider?.showPortCandidate;e&&this._register(o.setCandidateFilter(async r=>{const n=await Promise.all(r.map(t=>e(t.host,t.port,t.detail??""))),s=[];if(n.length!==r.length)return r;for(let t=0;t<r.length;t++)n[t]&&s.push(r[t]);return s}))}};l=c([p(0,b),p(1,P)],l);export{l as ShowCandidateContribution};
