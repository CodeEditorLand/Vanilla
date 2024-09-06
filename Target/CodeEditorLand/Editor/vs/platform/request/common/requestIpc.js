import{bufferToStream as u,streamToBuffer as l}from"../../../../vs/base/common/buffer.js";import{CancellationToken as c}from"../../../../vs/base/common/cancellation.js";import"../../../../vs/base/common/event.js";import"../../../../vs/base/parts/ipc/common/ipc.js";import"../../../../vs/base/parts/request/common/request.js";import"../../../../vs/platform/request/common/request.js";class b{constructor(e){this.service=e}listen(e,t){throw new Error("Invalid listen")}call(e,t,r,n=c.None){switch(t){case"request":return this.service.request(r[0],n).then(async({res:s,stream:i})=>{const a=await l(i);return[{statusCode:s.statusCode,headers:s.headers},a]});case"resolveProxy":return this.service.resolveProxy(r[0]);case"lookupAuthorization":return this.service.lookupAuthorization(r[0]);case"lookupKerberosAuthorization":return this.service.lookupKerberosAuthorization(r[0]);case"loadCertificates":return this.service.loadCertificates()}throw new Error("Invalid call")}}class w{constructor(e){this.channel=e}async request(e,t){const[r,n]=await this.channel.call("request",[e],t);return{res:r,stream:u(n)}}async resolveProxy(e){return this.channel.call("resolveProxy",[e])}async lookupAuthorization(e){return this.channel.call("lookupAuthorization",[e])}async lookupKerberosAuthorization(e){return this.channel.call("lookupKerberosAuthorization",[e])}async loadCertificates(){return this.channel.call("loadCertificates")}}export{b as RequestChannel,w as RequestChannelClient};
