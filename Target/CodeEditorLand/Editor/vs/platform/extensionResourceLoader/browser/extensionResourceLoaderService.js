var S=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var l=(n,i,e,r)=>{for(var t=r>1?void 0:r?f(i,e):i,s=n.length-1,c;s>=0;s--)(c=n[s])&&(t=(r?c(i,e,t):c(t))||t);return r&&t&&S(i,e,t),t},o=(n,i)=>(e,r)=>i(e,r,n);import"../../../base/common/uri.js";import{InstantiationType as v,registerSingleton as I}from"../../instantiation/common/extensions.js";import{IFileService as d}from"../../files/common/files.js";import{FileAccess as p,Schemas as m}from"../../../base/common/network.js";import{IProductService as u}from"../../product/common/productService.js";import{IStorageService as g}from"../../storage/common/storage.js";import{IEnvironmentService as h}from"../../environment/common/environment.js";import{ILogService as w}from"../../log/common/log.js";import{IConfigurationService as y}from"../../configuration/common/configuration.js";import{AbstractExtensionResourceLoaderService as R,IExtensionResourceLoaderService as x}from"../common/extensionResourceLoader.js";let a=class extends R{constructor(e,r,t,s,c,E){super(e,r,t,s,c);this._logService=E}async readExtensionResource(e){if(e=p.uriToBrowserUri(e),e.scheme!==m.http&&e.scheme!==m.https&&e.scheme!==m.data)return(await this._fileService.readFile(e)).value.toString();const r={};this.isExtensionGalleryResource(e)&&(r.headers=await this.getExtensionGalleryRequestHeaders(),r.mode="cors");const t=await fetch(e.toString(!0),r);if(t.status!==200)throw this._logService.info(`Request to '${e.toString(!0)}' failed with status code ${t.status}`),new Error(t.statusText);return t.text()}};a=l([o(0,d),o(1,g),o(2,u),o(3,h),o(4,y),o(5,w)],a),I(x,a,v.Delayed);
