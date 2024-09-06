var d=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var m=(s,e,t,i)=>{for(var r=i>1?void 0:i?p(e,t):e,o=s.length-1,a;o>=0;o--)(a=s[o])&&(r=(i?a(e,t,r):a(r))||r);return i&&r&&d(e,t,r),r},c=(s,e)=>(t,i)=>e(t,i,s);import{CancellationToken as f}from"../../../../vs/base/common/cancellation.js";import{Schemas as l}from"../../../../vs/base/common/network.js";import"../../../../vs/base/common/uri.js";import"../../../../vs/platform/download/common/download.js";import{IFileService as v}from"../../../../vs/platform/files/common/files.js";import{asTextOrError as S,IRequestService as u}from"../../../../vs/platform/request/common/request.js";let n=class{constructor(e,t){this.requestService=e;this.fileService=t}async download(e,t,i=f.None){if(e.scheme===l.file||e.scheme===l.vscodeRemote){await this.fileService.copy(e,t);return}const r={type:"GET",url:e.toString(!0)},o=await this.requestService.request(r,i);if(o.res.statusCode===200)await this.fileService.writeFile(t,o.stream);else{const a=await S(o);throw new Error(`Expected 200, got back ${o.res.statusCode} instead.

${a}`)}}};n=m([c(0,u),c(1,v)],n);export{n as DownloadService};
