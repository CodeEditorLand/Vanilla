var v=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var m=(s,i,e,t)=>{for(var r=t>1?void 0:t?c(i,e):i,o=s.length-1,a;o>=0;o--)(a=s[o])&&(r=(t?a(i,e,r):a(r))||r);return t&&r&&v(i,e,r),r},u=(s,i)=>(e,t)=>i(e,t,s);import{Mimes as f}from"../../../base/common/mime.js";import{IFileService as g}from"../../../platform/files/common/files.js";import{EditorModel as p}from"./editorModel.js";let n=class extends p{constructor(e,t,r){super();this.resource=e;this.name=t;this.fileService=r}mime=f.binary;size;etag;getName(){return this.name}getSize(){return this.size}getMime(){return this.mime}getETag(){return this.etag}async resolve(){if(this.fileService.hasProvider(this.resource)){const e=await this.fileService.stat(this.resource);this.etag=e.etag,typeof e.size=="number"&&(this.size=e.size)}return super.resolve()}};n=m([u(2,g)],n);export{n as BinaryEditorModel};
