var l=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var c=(n,i,e,t)=>{for(var r=t>1?void 0:t?v(i,e):i,a=n.length-1,p;a>=0;a--)(p=n[a])&&(r=(t?p(i,e,r):p(r))||r);return t&&r&&l(i,e,r),r},o=(n,i)=>(e,t)=>i(e,t,n);import{matchesScheme as d}from"../../../../base/common/network.js";import{URI as I}from"../../../../base/common/uri.js";import{ProxyChannel as m}from"../../../../base/parts/ipc/common/ipc.js";import{InstantiationType as S,registerSingleton as h}from"../../../../platform/instantiation/common/extensions.js";import{IMainProcessService as U}from"../../../../platform/ipc/common/mainProcessService.js";import{ILogService as f}from"../../../../platform/log/common/log.js";import{INativeHostService as u}from"../../../../platform/native/common/native.js";import{IOpenerService as R}from"../../../../platform/opener/common/opener.js";import{IProductService as w}from"../../../../platform/product/common/productService.js";import{IURLService as g}from"../../../../platform/url/common/url.js";import{URLHandlerChannel as L}from"../../../../platform/url/common/urlIpc.js";import{NativeURLService as O}from"../../../../platform/url/common/urlService.js";let s=class extends O{constructor(e,t,r,a,p){super(a);this.nativeHostService=r;this.logService=p;this.urlService=m.toService(e.getChannel("url")),e.registerChannel("urlHandler",new L(this)),t.registerOpener(this)}urlService;create(e){const t=super.create(e);let r=t.query;return r?r+=`&windowId=${encodeURIComponent(this.nativeHostService.windowId)}`:r=`windowId=${encodeURIComponent(this.nativeHostService.windowId)}`,t.with({query:r})}async open(e,t){return d(e,this.productService.urlProtocol)?(typeof e=="string"&&(e=I.parse(e)),await this.urlService.open(e,t)):!1}async handleURL(e,t){const r=await super.open(e,t);return r?(this.logService.trace("URLService#handleURL(): handled",e.toString(!0)),await this.nativeHostService.focusWindow({force:!0,targetWindowId:this.nativeHostService.windowId})):this.logService.trace("URLService#handleURL(): not handled",e.toString(!0)),r}};s=c([o(0,U),o(1,R),o(2,u),o(3,w),o(4,f)],s),h(g,s,S.Eager);export{s as RelayURLService};
