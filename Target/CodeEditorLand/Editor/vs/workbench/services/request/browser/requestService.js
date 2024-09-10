var m=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var u=(i,o,e,t)=>{for(var r=t>1?void 0:t?f(o,e):o,n=i.length-1,a;n>=0;n--)(a=i[n])&&(r=(t?a(o,e,r):a(r))||r);return t&&r&&m(o,e,r),r},s=(i,o)=>(e,t)=>o(e,t,i);import{IConfigurationService as d}from"../../../../platform/configuration/common/configuration.js";import{RequestChannelClient as l}from"../../../../platform/request/common/requestIpc.js";import{IRemoteAgentService as g}from"../../remote/common/remoteAgentService.js";import{CommandsRegistry as h}from"../../../../platform/commands/common/commands.js";import{AbstractRequestService as p}from"../../../../platform/request/common/request.js";import{request as C}from"../../../../base/parts/request/browser/request.js";import{ILogService as A}from"../../../../platform/log/common/log.js";let c=class extends p{constructor(e,t,r){super(r);this.remoteAgentService=e;this.configurationService=t}async request(e,t){try{e.proxyAuthorization||(e.proxyAuthorization=this.configurationService.getValue("http.proxyAuthorization"));const r=await this.logAndRequest(e,()=>C(e,t)),n=this.remoteAgentService.getConnection();return n&&r.res.statusCode===405?this._makeRemoteRequest(n,e,t):r}catch(r){const n=this.remoteAgentService.getConnection();if(n)return this._makeRemoteRequest(n,e,t);throw r}}async resolveProxy(e){}async lookupAuthorization(e){}async lookupKerberosAuthorization(e){}async loadCertificates(){return[]}_makeRemoteRequest(e,t,r){return e.withChannel("request",n=>new l(n).request(t,r))}};c=u([s(0,g),s(1,d),s(2,A)],c),h.registerCommand("_workbench.fetchJSON",async function(i,o,e){const t=await fetch(o,{method:e,headers:{Accept:"application/json"}});if(t.ok)return t.json();throw new Error(t.statusText)});export{c as BrowserRequestService};
