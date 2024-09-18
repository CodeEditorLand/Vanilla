import{isFunction as n}from"../../../base/common/types.js";var f;(a=>{async function o(r){try{if(!navigator.gpu)throw new Error("This browser does not support WebGPU");const e=await navigator.gpu.requestAdapter();if(!e)throw new Error("This browser supports WebGPU but it appears to be disabled");return s(await e.requestDevice())}catch(e){throw r&&r(e.message),e}}a.requestDevice=o;function i(r,e,t){const c=r.createBuffer(e);return t&&r.queue.writeBuffer(c,0,n(t)?t():t),s(c)}a.createBuffer=i;function u(r,e){return s(r.createTexture(e))}a.createTexture=u})(f||={});function s(o){return{object:o,dispose:()=>o.destroy()}}export{f as GPULifecycle};
