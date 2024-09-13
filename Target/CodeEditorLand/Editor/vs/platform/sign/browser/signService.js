var v=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var c=(i,o,t,e)=>{for(var r=e>1?void 0:e?u(o,t):o,s=i.length-1,a;s>=0;s--)(a=i[s])&&(r=(e?a(o,t,r):a(r))||r);return e&&r&&v(o,t,r),r},m=(i,o)=>(t,e)=>o(t,e,i);import{importAMDNodeModule as f,resolveAmdNodeModulePath as w}from"../../../amdX.js";import{WindowIntervalTimer as g}from"../../../base/browser/dom.js";import{mainWindow as y}from"../../../base/browser/window.js";import{isESM as I}from"../../../base/common/amd.js";import{memoize as b}from"../../../base/common/decorators.js";import{FileAccess as _}from"../../../base/common/network.js";import{IProductService as h}from"../../product/common/productService.js";import{AbstractSignService as P}from"../common/abstractSignService.js";const p=32,d=16,l=p+d;let n=class extends P{constructor(t){super();this.productService=t}getValidator(){return this.vsda().then(t=>{const e=new t.validator;return{createNewMessage:r=>e.createNewMessage(r),validate:r=>e.validate(r),dispose:()=>e.free()}})}signValue(t){return this.vsda().then(e=>e.sign(t))}async vsda(){const t=new g;let[e]=await Promise.all([this.getWasmBytes(),new Promise((s,a)=>{f("vsda","rust/web/vsda.js").then(()=>s(),a),t.cancelAndSet(()=>{typeof vsda_web<"u"&&s()},50,y)}).finally(()=>t.dispose())]);const r=new TextEncoder().encode(this.productService.serverLicense?.join(`
`)||"");for(let s=0;s+l<r.length;s+=l){const a=await crypto.subtle.importKey("raw",r.slice(s+d,s+d+p),{name:"AES-CBC"},!1,["decrypt"]);e=await crypto.subtle.decrypt({name:"AES-CBC",iv:r.slice(s,s+d)},a,e)}return await vsda_web.default(e),vsda_web}async getWasmBytes(){const t=I?w("vsda","rust/web/vsda_bg.wasm"):_.asBrowserUri("vsda/../vsda_bg.wasm").toString(!0),e=await fetch(t);if(!e.ok)throw new Error("error loading vsda");return e.arrayBuffer()}};c([b],n.prototype,"vsda",1),n=c([m(0,h)],n);export{n as SignService};
