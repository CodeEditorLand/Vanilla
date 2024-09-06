import{firstOrDefault as c}from"../../../../../vs/base/common/arrays.js";import{VSBuffer as i}from"../../../../../vs/base/common/buffer.js";import{Emitter as l,Event as r}from"../../../../../vs/base/common/event.js";import{assertType as m}from"../../../../../vs/base/common/types.js";import{IPCServer as g}from"../../../../../vs/base/parts/ipc/common/ipc.js";import{isUtilityProcess as v}from"../../../../../vs/base/parts/sandbox/node/electronTypes.js";class f{constructor(e){this.port=e;e.start()}onMessage=r.fromNodeEventEmitter(this.port,"message",e=>e.data?i.wrap(e.data):i.alloc(0));send(e){this.port.postMessage(e.buffer)}disconnect(){this.port.close()}}class a extends g{static getOnDidClientConnect(e){m(v(process),"Electron Utility Process");const o=new l;return process.parentPort.on("message",t=>{if(e?.handledClientConnection(t))return;const n=c(t.ports);n&&o.fire(n)}),r.map(o.event,t=>({protocol:new f(t),onDidClientDisconnect:r.fromNodeEventEmitter(t,"close")}))}constructor(e){super(a.getOnDidClientConnect(e))}}function w(s,e,o){const t=n=>{n.data===e&&(s.removeListener("message",t),o())};s.on("message",t)}export{a as Server,w as once};
