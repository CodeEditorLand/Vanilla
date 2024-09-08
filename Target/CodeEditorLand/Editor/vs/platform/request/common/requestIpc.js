import{bufferToStream as u,streamToBuffer as l}from"../../../base/common/buffer.js";import{CancellationToken as c}from"../../../base/common/cancellation.js";import"../../../base/common/event.js";import"../../../base/parts/ipc/common/ipc.js";import"../../../base/parts/request/common/request.js";import"./request.js";class b{constructor(e){this.service=e}listen(e,t){throw new Error("Invalid listen")}call(e,t,r,n=c.None){switch(t){case"request":return this.service.request(r[0],n).then(async({res:s,stream:i})=>{const a=await l(i);return[{statusCode:s.statusCode,headers:s.headers},a]});case"resolveProxy":return this.service.resolveProxy(r[0]);case"lookupAuthorization":return this.service.lookupAuthorization(r[0]);case"lookupKerberosAuthorization":return this.service.lookupKerberosAuthorization(r[0]);case"loadCertificates":return this.service.loadCertificates()}throw new Error("Invalid call")}}class w{constructor(e){this.channel=e}async request(e,t){const[r,n]=await this.channel.call("request",[e],t);return{res:r,stream:u(n)}}async resolveProxy(e){return this.channel.call("resolveProxy",[e])}async lookupAuthorization(e){return this.channel.call("lookupAuthorization",[e])}async lookupKerberosAuthorization(e){return this.channel.call("lookupKerberosAuthorization",[e])}async loadCertificates(){return this.channel.call("loadCertificates")}}export{b as RequestChannel,w as RequestChannelClient};
