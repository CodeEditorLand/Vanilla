const c=function(o){const a=g=>{globalThis.removeEventListener("message",a);const r=g.data;Object.defineProperties(globalThis,{postMessage:{value(s,n){r.postMessage(s,n)}},onmessage:{get(){return r.onmessage},set(s){r.onmessage=s}}}),r.addEventListener("message",s=>{globalThis.dispatchEvent(new MessageEvent("message",{data:s.data,ports:s.ports?[...s.ports]:void 0}))}),r.start(),globalThis.Worker=class{constructor(){throw new TypeError("Nested workers from within nested worker are NOT supported.")}},importScripts(o)};globalThis.addEventListener("message",a)}.toString();class M extends EventTarget{onmessage=null;onmessageerror=null;onerror=null;terminate;postMessage;constructor(o,a,g){super();const r=`((${c})('${a}'))`,s=new Blob([r],{type:"application/javascript"}),n=URL.createObjectURL(s),e=new MessageChannel,p=n,d={type:"_newWorker",id:p,port:e.port2,url:n,options:g};o(d,[e.port2]),this.postMessage=e.port1.postMessage.bind(e.port1),this.terminate=()=>{o({type:"_terminateWorker",id:p}),URL.revokeObjectURL(n),e.port1.close(),e.port2.close()},Object.defineProperties(this,{onmessage:{get(){return e.port1.onmessage},set(t){e.port1.onmessage=t}},onmessageerror:{get(){return e.port1.onmessageerror},set(t){e.port1.onmessageerror=t}}}),e.port1.addEventListener("messageerror",t=>{const i=new MessageEvent("messageerror",{data:t.data});this.dispatchEvent(i)}),e.port1.addEventListener("message",t=>{const i=new MessageEvent("message",{data:t.data});this.dispatchEvent(i)}),e.port1.start()}}export{M as NestedWorker};
