var p=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var a=(t,e,r,n)=>{for(var o=n>1?void 0:n?I(e,r):e,s=t.length-1,c;s>=0;s--)(c=t[s])&&(o=(n?c(e,r,o):c(o))||o);return n&&o&&p(e,r,o),o},m=(t,e)=>(r,n)=>e(r,n,t);import{ProxyChannel as d}from"../../../../../vs/base/parts/ipc/common/ipc.js";import{InstantiationType as l,registerSingleton as f}from"../../../../../vs/platform/instantiation/common/extensions.js";import{IMainProcessService as S}from"../../../../../vs/platform/ipc/common/mainProcessService.js";import{INativeHostService as v}from"../../../../../vs/platform/native/common/native.js";import{IWorkspacesService as y}from"../../../../../vs/platform/workspaces/common/workspaces.js";let i=class{constructor(e,r){return d.toService(e.getChannel("workspaces"),{context:r.windowId})}};i=a([m(0,S),m(1,v)],i),f(y,i,l.Delayed);export{i as NativeWorkspacesService};