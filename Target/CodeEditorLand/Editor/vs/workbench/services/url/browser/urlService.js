var m=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var c=(n,e,r,i)=>{for(var t=i>1?void 0:i?v(e,r):e,s=n.length-1,a;s>=0;s--)(a=n[s])&&(t=(i?a(e,r,t):a(t))||t);return i&&t&&m(e,r,t),t},p=(n,e)=>(r,i)=>e(r,i,n);import"../../../../base/common/event.js";import{matchesScheme as d}from"../../../../base/common/network.js";import{URI as l}from"../../../../base/common/uri.js";import{InstantiationType as u,registerSingleton as I}from"../../../../platform/instantiation/common/extensions.js";import{IOpenerService as f}from"../../../../platform/opener/common/opener.js";import{IProductService as O}from"../../../../platform/product/common/productService.js";import{IURLService as h}from"../../../../platform/url/common/url.js";import{AbstractURLService as S}from"../../../../platform/url/common/urlService.js";import{IBrowserWorkbenchEnvironmentService as U}from"../../environment/browser/environmentService.js";class P{constructor(e,r){this.urlService=e;this.productService=r}async open(e,r){return r?.openExternal||!d(e,this.productService.urlProtocol)?!1:(typeof e=="string"&&(e=l.parse(e)),this.urlService.open(e,{trusted:!0}))}}let o=class extends S{provider;constructor(e,r,i){super(),this.provider=e.options?.urlCallbackProvider,this.provider&&this._register(this.provider.onCallback(t=>this.open(t,{trusted:!0}))),this._register(r.registerOpener(new P(this,i)))}create(e){return this.provider?this.provider.create(e):l.parse("unsupported://")}};o=c([p(0,U),p(1,f),p(2,O)],o),I(h,o,u.Delayed);export{o as BrowserURLService};
