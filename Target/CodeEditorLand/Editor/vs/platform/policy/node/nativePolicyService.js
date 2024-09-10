var y=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var s=(c,o,i,e)=>{for(var t=e>1?void 0:e?h(o,i):o,n=c.length-1,r;n>=0;n--)(r=c[n])&&(t=(e?r(o,i,t):r(t))||t);return e&&t&&y(o,i,t),t},l=(c,o)=>(i,e)=>o(i,e,c);import{AbstractPolicyService as p}from"../common/policy.js";import{Throttler as d}from"../../../base/common/async.js";import{MutableDisposable as v}from"../../../base/common/lifecycle.js";import{ILogService as m}from"../../log/common/log.js";let a=class extends p{constructor(i,e){super();this.logService=i;this.productName=e}throttler=new d;watcher=this._register(new v);async _updatePolicyDefinitions(i){this.logService.trace(`NativePolicyService#_updatePolicyDefinitions - Found ${Object.keys(i).length} policy definitions`);const{createWatcher:e}=await import("@vscode/policy-watcher");await this.throttler.queue(()=>new Promise((t,n)=>{try{this.watcher.value=e(this.productName,i,r=>{this._onDidPolicyChange(r),t()})}catch(r){this.logService.error("NativePolicyService#_updatePolicyDefinitions - Error creating watcher:",r),n(r)}}))}_onDidPolicyChange(i){this.logService.trace(`NativePolicyService#_onDidPolicyChange - Updated policy values: ${JSON.stringify(i)}`);for(const e in i){const t=i[e];t===void 0?this.policies.delete(e):this.policies.set(e,t)}this._onDidChange.fire(Object.keys(i))}};a=s([l(0,m)],a);export{a as NativePolicyService};
