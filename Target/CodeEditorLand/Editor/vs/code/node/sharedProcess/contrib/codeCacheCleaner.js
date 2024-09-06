var f=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var l=(i,o,e,r)=>{for(var t=r>1?void 0:r?h(o,e):o,c=i.length-1,a;c>=0;c--)(a=i[c])&&(t=(r?a(o,e,t):a(t))||t);return r&&t&&f(o,e,t),t},m=(i,o)=>(e,r)=>o(e,r,i);import*as v from"fs";import{RunOnceScheduler as g}from"../../../../../vs/base/common/async.js";import{onUnexpectedError as S}from"../../../../../vs/base/common/errors.js";import{Disposable as y}from"../../../../../vs/base/common/lifecycle.js";import{basename as w,dirname as x,join as D}from"../../../../../vs/base/common/path.js";import{Promises as u}from"../../../../../vs/base/node/pfs.js";import{ILogService as P}from"../../../../../vs/platform/log/common/log.js";import{IProductService as I}from"../../../../../vs/platform/product/common/productService.js";let s=class extends y{constructor(e,r,t){super();this.productService=r;this.logService=t;e&&this._register(new g(()=>{this.cleanUpCodeCaches(e)},3e4)).schedule()}_DataMaxAge=this.productService.quality!=="stable"?1e3*60*60*24*7:1e3*60*60*24*30*3;async cleanUpCodeCaches(e){this.logService.trace("[code cache cleanup]: Starting to clean up old code cache folders.");try{const r=Date.now(),t=x(e),c=w(e),a=await u.readdir(t);await Promise.all(a.map(async n=>{if(n===c)return;const d=D(t,n),p=await v.promises.stat(d);if(p.isDirectory()&&r-p.mtime.getTime()>this._DataMaxAge)return this.logService.trace(`[code cache cleanup]: Removing code cache folder ${n}.`),u.rm(d)}))}catch(r){S(r)}}};s=l([m(1,I),m(2,P)],s);export{s as CodeCacheCleaner};
