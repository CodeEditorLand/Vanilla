import{VSBuffer as t}from"../../../common/buffer.js";import{Event as i}from"../../../common/event.js";import{IPCClient as n}from"./ipc.js";class a{constructor(e){this.port=e;e.start()}onMessage=i.fromDOMEventEmitter(this.port,"message",e=>e.data?t.wrap(e.data):t.alloc(0));send(e){this.port.postMessage(e.buffer)}disconnect(){this.port.close()}}class m extends n{protocol;constructor(e,r){const s=new a(e);super(s,r),this.protocol=s}dispose(){this.protocol.disconnect(),super.dispose()}}export{m as Client,a as Protocol};
