var m=Object.defineProperty;var l=Object.getOwnPropertyDescriptor;var a=(t,e,n,r)=>{for(var o=r>1?void 0:r?l(e,n):e,s=t.length-1,c;s>=0;s--)(c=t[s])&&(o=(r?c(e,n,o):c(o))||o);return r&&o&&m(e,n,o),o},p=(t,e)=>(n,r)=>e(n,r,t);import{ProxyChannel as d}from"../../../base/parts/ipc/common/ipc.js";import{IMainProcessService as u}from"../../ipc/common/mainProcessService.js";let i=class{constructor(e,n){this.windowId=e;return d.toService(n.getChannel("nativeHost"),{context:e,properties:(()=>{const r=new Map;return r.set("windowId",e),r})()})}};i=a([p(1,u)],i);export{i as NativeHostService};
