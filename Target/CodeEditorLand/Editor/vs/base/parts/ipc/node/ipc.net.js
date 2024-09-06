import{createHash as I}from"crypto";import{createConnection as w,createServer as E}from"net";import{tmpdir as D}from"os";import{createDeflateRaw as B,createInflateRaw as P}from"zlib";import{VSBuffer as d}from"../../../../../vs/base/common/buffer.js";import{onUnexpectedError as p}from"../../../../../vs/base/common/errors.js";import{Emitter as h,Event as f}from"../../../../../vs/base/common/event.js";import{Disposable as _}from"../../../../../vs/base/common/lifecycle.js";import{join as S}from"../../../../../vs/base/common/path.js";import{Platform as g,platform as L}from"../../../../../vs/base/common/platform.js";import{generateUuid as C}from"../../../../../vs/base/common/uuid.js";import{IPCServer as U}from"../../../../../vs/base/parts/ipc/common/ipc.js";import{ChunkStream as z,Client as M,Protocol as F,SocketCloseEventType as b,SocketDiagnostics as V,SocketDiagnosticsEventType as a}from"../../../../../vs/base/parts/ipc/common/ipc.net.js";const W=3e4;class k{debugLabel;socket;_errorListener;_closeListener;_endListener;_canWrite=!0;traceSocketEvent(r,e){V.traceSocketEvent(this.socket,this.debugLabel,r,e)}constructor(r,e=""){this.debugLabel=e,this.socket=r,this.traceSocketEvent(a.Created,{type:"NodeSocket"}),this._errorListener=i=>{if(this.traceSocketEvent(a.Error,{code:i?.code,message:i?.message}),i){if(i.code==="EPIPE")return;p(i)}},this.socket.on("error",this._errorListener);let t;this._closeListener=i=>{this.traceSocketEvent(a.Close,{hadError:i}),this._canWrite=!1,t&&clearTimeout(t)},this.socket.on("close",this._closeListener),this._endListener=()=>{this.traceSocketEvent(a.NodeEndReceived),this._canWrite=!1,t=setTimeout(()=>r.destroy(),W)},this.socket.on("end",this._endListener)}dispose(){this.socket.off("error",this._errorListener),this.socket.off("close",this._closeListener),this.socket.off("end",this._endListener),this.socket.destroy()}onData(r){const e=t=>{this.traceSocketEvent(a.Read,t),r(d.wrap(t))};return this.socket.on("data",e),{dispose:()=>this.socket.off("data",e)}}onClose(r){const e=t=>{r({type:b.NodeSocketCloseEvent,hadError:t,error:void 0})};return this.socket.on("close",e),{dispose:()=>this.socket.off("close",e)}}onEnd(r){const e=()=>{r()};return this.socket.on("end",e),{dispose:()=>this.socket.off("end",e)}}write(r){if(!(this.socket.destroyed||!this._canWrite))try{this.traceSocketEvent(a.Write,r),this.socket.write(r.buffer,e=>{if(e){if(e.code==="EPIPE")return;p(e)}})}catch(e){if(e.code==="EPIPE")return;p(e)}}end(){this.traceSocketEvent(a.NodeEndSent),this.socket.end()}drain(){return this.traceSocketEvent(a.NodeDrainBegin),new Promise((r,e)=>{if(this.socket.bufferSize===0){this.traceSocketEvent(a.NodeDrainEnd),r();return}const t=()=>{this.socket.off("close",t),this.socket.off("end",t),this.socket.off("error",t),this.socket.off("timeout",t),this.socket.off("drain",t),this.traceSocketEvent(a.NodeDrainEnd),r()};this.socket.on("close",t),this.socket.on("end",t),this.socket.on("error",t),this.socket.on("timeout",t),this.socket.on("drain",t)})}}var Q=(e=>(e[e.MinHeaderByteSize=2]="MinHeaderByteSize",e[e.MaxWebSocketMessageLength=262144]="MaxWebSocketMessageLength",e))(Q||{}),R=(i=>(i[i.PeekHeader=1]="PeekHeader",i[i.ReadHeader=2]="ReadHeader",i[i.ReadBody=3]="ReadBody",i[i.Fin=4]="Fin",i))(R||{});class fe extends _{socket;_flowManager;_incomingData;_onData=this._register(new h);_onClose=this._register(new h);_isEnded=!1;_state={state:1,readLen:2,fin:0,compressed:!1,firstFrameOfMessage:!0,mask:0,opcode:0};get permessageDeflate(){return this._flowManager.permessageDeflate}get recordedInflateBytes(){return this._flowManager.recordedInflateBytes}traceSocketEvent(r,e){this.socket.traceSocketEvent(r,e)}constructor(r,e,t,i){super(),this.socket=r,this.traceSocketEvent(a.Created,{type:"WebSocketNodeSocket",permessageDeflate:e,inflateBytesLength:t?.byteLength||0,recordInflateBytes:i}),this._flowManager=this._register(new x(this,e,t,i,this._onData,(s,o)=>this._write(s,o))),this._register(this._flowManager.onError(s=>{console.error(s),p(s),this._onClose.fire({type:b.NodeSocketCloseEvent,hadError:!0,error:s})})),this._incomingData=new z,this._register(this.socket.onData(s=>this._acceptChunk(s))),this._register(this.socket.onClose(async s=>{this._flowManager.isProcessingReadQueue()&&await f.toPromise(this._flowManager.onDidFinishProcessingReadQueue),this._onClose.fire(s)}))}dispose(){this._flowManager.isProcessingWriteQueue()?this._register(this._flowManager.onDidFinishProcessingWriteQueue(()=>{this.dispose()})):(this.socket.dispose(),super.dispose())}onData(r){return this._onData.event(r)}onClose(r){return this._onClose.event(r)}onEnd(r){return this.socket.onEnd(r)}write(r){let e=0;for(;e<r.byteLength;)this._flowManager.writeMessage(r.slice(e,Math.min(e+262144,r.byteLength)),{compressed:!0,opcode:2}),e+=262144}_write(r,{compressed:e,opcode:t}){if(this._isEnded)return;this.traceSocketEvent(a.WebSocketNodeSocketWrite,r);let i=2;r.byteLength<126?i+=0:r.byteLength<2**16?i+=2:i+=8;const s=d.alloc(i),o=e?64:0,l=t&15;if(s.writeUInt8(128|o|l,0),r.byteLength<126)s.writeUInt8(r.byteLength,1);else if(r.byteLength<2**16){s.writeUInt8(126,1);let c=1;s.writeUInt8(r.byteLength>>>8&255,++c),s.writeUInt8(r.byteLength>>>0&255,++c)}else{s.writeUInt8(127,1);let c=1;s.writeUInt8(0,++c),s.writeUInt8(0,++c),s.writeUInt8(0,++c),s.writeUInt8(0,++c),s.writeUInt8(r.byteLength>>>24&255,++c),s.writeUInt8(r.byteLength>>>16&255,++c),s.writeUInt8(r.byteLength>>>8&255,++c),s.writeUInt8(r.byteLength>>>0&255,++c)}this.socket.write(d.concat([s,r]))}end(){this._isEnded=!0,this.socket.end()}_acceptChunk(r){if(r.byteLength!==0){for(this._incomingData.acceptChunk(r);this._incomingData.byteLength>=this._state.readLen;)if(this._state.state===1){const e=this._incomingData.peek(this._state.readLen),t=e.readUInt8(0),i=(t&128)>>>7,s=(t&64)>>>6,o=t&15,l=e.readUInt8(1),c=(l&128)>>>7,u=l&127;this._state.state=2,this._state.readLen=2+(c?4:0)+(u===126?2:0)+(u===127?8:0),this._state.fin=i,this._state.firstFrameOfMessage&&(this._state.compressed=!!s),this._state.firstFrameOfMessage=!!i,this._state.mask=0,this._state.opcode=o,this.traceSocketEvent(a.WebSocketNodeSocketPeekedHeader,{headerSize:this._state.readLen,compressed:this._state.compressed,fin:this._state.fin,opcode:this._state.opcode})}else if(this._state.state===2){const e=this._incomingData.read(this._state.readLen),t=e.readUInt8(1),i=(t&128)>>>7;let s=t&127,o=1;s===126?s=e.readUInt8(++o)*2**8+e.readUInt8(++o):s===127&&(s=e.readUInt8(++o)*0+e.readUInt8(++o)*0+e.readUInt8(++o)*0+e.readUInt8(++o)*0+e.readUInt8(++o)*2**24+e.readUInt8(++o)*2**16+e.readUInt8(++o)*2**8+e.readUInt8(++o));let l=0;i&&(l=e.readUInt8(++o)*2**24+e.readUInt8(++o)*2**16+e.readUInt8(++o)*2**8+e.readUInt8(++o)),this._state.state=3,this._state.readLen=s,this._state.mask=l,this.traceSocketEvent(a.WebSocketNodeSocketPeekedHeader,{bodySize:this._state.readLen,compressed:this._state.compressed,fin:this._state.fin,mask:this._state.mask,opcode:this._state.opcode})}else if(this._state.state===3){const e=this._incomingData.read(this._state.readLen);this.traceSocketEvent(a.WebSocketNodeSocketReadData,e),T(e,this._state.mask),this.traceSocketEvent(a.WebSocketNodeSocketUnmaskedData,e),this._state.state=1,this._state.readLen=2,this._state.mask=0,this._state.opcode<=2?this._flowManager.acceptFrame(e,this._state.compressed,!!this._state.fin):this._state.opcode===9&&this._flowManager.writeMessage(e,{compressed:!1,opcode:10})}}}async drain(){this.traceSocketEvent(a.WebSocketNodeSocketDrainBegin),this._flowManager.isProcessingWriteQueue()&&await f.toPromise(this._flowManager.onDidFinishProcessingWriteQueue),await this.socket.drain(),this.traceSocketEvent(a.WebSocketNodeSocketDrainEnd)}}class x extends _{constructor(e,t,i,s,o,l){super();this._tracer=e;this._onData=o;this._writeFn=l;t?(this._zlibInflateStream=this._register(new N(this._tracer,s,i,{windowBits:15})),this._zlibDeflateStream=this._register(new H(this._tracer,{windowBits:15})),this._register(this._zlibInflateStream.onError(c=>this._onError.fire(c))),this._register(this._zlibDeflateStream.onError(c=>this._onError.fire(c)))):(this._zlibInflateStream=null,this._zlibDeflateStream=null)}_onError=this._register(new h);onError=this._onError.event;_zlibInflateStream;_zlibDeflateStream;_writeQueue=[];_readQueue=[];_onDidFinishProcessingReadQueue=this._register(new h);onDidFinishProcessingReadQueue=this._onDidFinishProcessingReadQueue.event;_onDidFinishProcessingWriteQueue=this._register(new h);onDidFinishProcessingWriteQueue=this._onDidFinishProcessingWriteQueue.event;get permessageDeflate(){return!!(this._zlibInflateStream&&this._zlibDeflateStream)}get recordedInflateBytes(){return this._zlibInflateStream?this._zlibInflateStream.recordedInflateBytes:d.alloc(0)}writeMessage(e,t){this._writeQueue.push({data:e,options:t}),this._processWriteQueue()}_isProcessingWriteQueue=!1;async _processWriteQueue(){if(!this._isProcessingWriteQueue){for(this._isProcessingWriteQueue=!0;this._writeQueue.length>0;){const{data:e,options:t}=this._writeQueue.shift();if(this._zlibDeflateStream&&t.compressed){const i=await this._deflateMessage(this._zlibDeflateStream,e);this._writeFn(i,t)}else this._writeFn(e,{...t,compressed:!1})}this._isProcessingWriteQueue=!1,this._onDidFinishProcessingWriteQueue.fire()}}isProcessingWriteQueue(){return this._isProcessingWriteQueue}_deflateMessage(e,t){return new Promise((i,s)=>{e.write(t),e.flush(o=>i(o))})}acceptFrame(e,t,i){this._readQueue.push({data:e,isCompressed:t,isLastFrameOfMessage:i}),this._processReadQueue()}_isProcessingReadQueue=!1;async _processReadQueue(){if(!this._isProcessingReadQueue){for(this._isProcessingReadQueue=!0;this._readQueue.length>0;){const e=this._readQueue.shift();if(this._zlibInflateStream&&e.isCompressed){const t=await this._inflateFrame(this._zlibInflateStream,e.data,e.isLastFrameOfMessage);this._onData.fire(t)}else this._onData.fire(e.data)}this._isProcessingReadQueue=!1,this._onDidFinishProcessingReadQueue.fire()}}isProcessingReadQueue(){return this._isProcessingReadQueue}_inflateFrame(e,t,i){return new Promise((s,o)=>{e.write(t),i&&e.write(d.fromByteArray([0,0,255,255])),e.flush(l=>s(l))})}}class N extends _{constructor(e,t,i,s){super();this._tracer=e;this._recordInflateBytes=t;this._zlibInflate=P(s),this._zlibInflate.on("error",o=>{this._tracer.traceSocketEvent(a.zlibInflateError,{message:o?.message,code:o?.code}),this._onError.fire(o)}),this._zlibInflate.on("data",o=>{this._tracer.traceSocketEvent(a.zlibInflateData,o),this._pendingInflateData.push(d.wrap(o))}),i&&(this._tracer.traceSocketEvent(a.zlibInflateInitialWrite,i.buffer),this._zlibInflate.write(i.buffer),this._zlibInflate.flush(()=>{this._tracer.traceSocketEvent(a.zlibInflateInitialFlushFired),this._pendingInflateData.length=0}))}_onError=this._register(new h);onError=this._onError.event;_zlibInflate;_recordedInflateBytes=[];_pendingInflateData=[];get recordedInflateBytes(){return this._recordInflateBytes?d.concat(this._recordedInflateBytes):d.alloc(0)}write(e){this._recordInflateBytes&&this._recordedInflateBytes.push(e.clone()),this._tracer.traceSocketEvent(a.zlibInflateWrite,e),this._zlibInflate.write(e.buffer)}flush(e){this._zlibInflate.flush(()=>{this._tracer.traceSocketEvent(a.zlibInflateFlushFired);const t=d.concat(this._pendingInflateData);this._pendingInflateData.length=0,e(t)})}}class H extends _{constructor(e,t){super();this._tracer=e;this._zlibDeflate=B({windowBits:15}),this._zlibDeflate.on("error",i=>{this._tracer.traceSocketEvent(a.zlibDeflateError,{message:i?.message,code:i?.code}),this._onError.fire(i)}),this._zlibDeflate.on("data",i=>{this._tracer.traceSocketEvent(a.zlibDeflateData,i),this._pendingDeflateData.push(d.wrap(i))})}_onError=this._register(new h);onError=this._onError.event;_zlibDeflate;_pendingDeflateData=[];write(e){this._tracer.traceSocketEvent(a.zlibDeflateWrite,e.buffer),this._zlibDeflate.write(e.buffer)}flush(e){this._zlibDeflate.flush(2,()=>{this._tracer.traceSocketEvent(a.zlibDeflateFlushFired);let t=d.concat(this._pendingDeflateData);this._pendingDeflateData.length=0,t=t.slice(0,t.byteLength-4),e(t)})}}function T(n,r){if(r===0)return;const e=n.byteLength>>>2;for(let c=0;c<e;c++){const u=n.readUInt32BE(c*4);n.writeUInt32BE(u^r,c*4)}const t=e*4,i=n.byteLength-t,s=r>>>24&255,o=r>>>16&255,l=r>>>8&255;i>=1&&n.writeUInt8(n.readUInt8(t)^s,t),i>=2&&n.writeUInt8(n.readUInt8(t+1)^o,t+1),i>=3&&n.writeUInt8(n.readUInt8(t+2)^l,t+2)}const v=process.env.XDG_RUNTIME_DIR,O={[g.Linux]:107,[g.Mac]:103};function ue(){const n=C();if(process.platform==="win32")return`\\\\.\\pipe\\vscode-ipc-${n}-sock`;const r=process.platform!=="darwin"&&v?v:D(),e=S(r,`vscode-ipc-${n}.sock`);return y(e),e}function pe(n,r,e){const i=I("sha256").update(n).digest("hex").substr(0,8);if(process.platform==="win32")return`\\\\.\\pipe\\${i}-${e}-${r}-sock`;const s=e.substr(0,4),o=r.substr(0,6);let l;return process.platform!=="darwin"&&v&&!process.env.VSCODE_PORTABLE?l=S(v,`vscode-${i}-${s}-${o}.sock`):l=S(n,`${s}-${o}.sock`),y(l),l}function y(n){const r=O[L];typeof r=="number"&&n.length>=r&&console.warn(`WARNING: IPC handle "${n}" is longer than ${r} chars, try a shorter --user-data-dir`)}class m extends U{static toClientConnectionEvent(r){const e=f.fromNodeEventEmitter(r,"connection");return f.map(e,t=>({protocol:new F(new k(t,"ipc-server-connection")),onDidClientDisconnect:f.once(f.fromNodeEventEmitter(t,"close"))}))}server;constructor(r){super(m.toClientConnectionEvent(r)),this.server=r}dispose(){super.dispose(),this.server&&(this.server.close(),this.server=null)}}function _e(n){return new Promise((r,e)=>{const t=E();t.on("error",e),t.listen(n,()=>{t.removeListener("error",e),r(new m(t))})})}function ve(n,r){return new Promise((e,t)=>{const i=w(n,()=>{i.removeListener("error",t),e(M.fromSocket(new k(i,`ipc-client${r}`),r))});i.once("error",t)})}export{k as NodeSocket,m as Server,fe as WebSocketNodeSocket,v as XDG_RUNTIME_DIR,ve as connect,ue as createRandomIPCHandle,pe as createStaticIPCHandle,_e as serve};