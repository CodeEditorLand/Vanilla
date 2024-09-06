import{VSBuffer as g}from"../../../../../vs/base/common/buffer.js";import{Emitter as p}from"../../../../../vs/base/common/event.js";import{Disposable as T,DisposableStore as I}from"../../../../../vs/base/common/lifecycle.js";import{IPCClient as D}from"../../../../../vs/base/parts/ipc/common/ipc.js";var A=(s=>(s.Created="created",s.Read="read",s.Write="write",s.Open="open",s.Error="error",s.Close="close",s.BrowserWebSocketBlobReceived="browserWebSocketBlobReceived",s.NodeEndReceived="nodeEndReceived",s.NodeEndSent="nodeEndSent",s.NodeDrainBegin="nodeDrainBegin",s.NodeDrainEnd="nodeDrainEnd",s.zlibInflateError="zlibInflateError",s.zlibInflateData="zlibInflateData",s.zlibInflateInitialWrite="zlibInflateInitialWrite",s.zlibInflateInitialFlushFired="zlibInflateInitialFlushFired",s.zlibInflateWrite="zlibInflateWrite",s.zlibInflateFlushFired="zlibInflateFlushFired",s.zlibDeflateError="zlibDeflateError",s.zlibDeflateData="zlibDeflateData",s.zlibDeflateWrite="zlibDeflateWrite",s.zlibDeflateFlushFired="zlibDeflateFlushFired",s.WebSocketNodeSocketWrite="webSocketNodeSocketWrite",s.WebSocketNodeSocketPeekedHeader="webSocketNodeSocketPeekedHeader",s.WebSocketNodeSocketReadHeader="webSocketNodeSocketReadHeader",s.WebSocketNodeSocketReadData="webSocketNodeSocketReadData",s.WebSocketNodeSocketUnmaskedData="webSocketNodeSocketUnmaskedData",s.WebSocketNodeSocketDrainBegin="webSocketNodeSocketDrainBegin",s.WebSocketNodeSocketDrainEnd="webSocketNodeSocketDrainEnd",s.ProtocolHeaderRead="protocolHeaderRead",s.ProtocolMessageRead="protocolMessageRead",s.ProtocolHeaderWrite="protocolHeaderWrite",s.ProtocolMessageWrite="protocolMessageWrite",s.ProtocolWrite="protocolWrite",s))(A||{}),y;(o=>{o.enableDiagnostics=!1,o.records=[];const t=new WeakMap;let i=0;function n(d,f){if(!t.has(d)){const r=String(++i);t.set(d,r)}return t.get(d)}function h(d,f,r,_){}o.traceSocketEvent=h})(y||={});var P=(t=>(t[t.NodeSocketCloseEvent=0]="NodeSocketCloseEvent",t[t.WebSocketCloseEvent=1]="WebSocketCloseEvent",t))(P||{});let m=null;function u(){return m||(m=g.alloc(0)),m}class L{_chunks;_totalLength;get byteLength(){return this._totalLength}constructor(){this._chunks=[],this._totalLength=0}acceptChunk(e){this._chunks.push(e),this._totalLength+=e.byteLength}read(e){return this._read(e,!0)}peek(e){return this._read(e,!1)}_read(e,t){if(e===0)return u();if(e>this._totalLength)throw new Error("Cannot read so many bytes!");if(this._chunks[0].byteLength===e){const o=this._chunks[0];return t&&(this._chunks.shift(),this._totalLength-=e),o}if(this._chunks[0].byteLength>e){const o=this._chunks[0].slice(0,e);return t&&(this._chunks[0]=this._chunks[0].slice(e),this._totalLength-=e),o}const i=g.alloc(e);let n=0,h=0;for(;e>0;){const o=this._chunks[h];if(o.byteLength>e){const d=o.slice(0,e);i.set(d,n),n+=e,t&&(this._chunks[h]=o.slice(e),this._totalLength-=e),e-=e}else i.set(o,n),n+=o.byteLength,t?(this._chunks.shift(),this._totalLength-=o.byteLength):h++,e-=o.byteLength}return i}}var W=(r=>(r[r.None=0]="None",r[r.Regular=1]="Regular",r[r.Control=2]="Control",r[r.Ack=3]="Ack",r[r.Disconnect=5]="Disconnect",r[r.ReplayRequest=6]="ReplayRequest",r[r.Pause=7]="Pause",r[r.Resume=8]="Resume",r[r.KeepAlive=9]="KeepAlive",r))(W||{});function M(a){switch(a){case 0:return"None";case 1:return"Regular";case 2:return"Control";case 3:return"Ack";case 5:return"Disconnect";case 6:return"ReplayRequest";case 7:return"PauseWriting";case 8:return"ResumeWriting";case 9:return"KeepAlive"}}var B=(o=>(o[o.HeaderLength=13]="HeaderLength",o[o.AcknowledgeTime=2e3]="AcknowledgeTime",o[o.TimeoutTime=2e4]="TimeoutTime",o[o.ReconnectionGraceTime=108e5]="ReconnectionGraceTime",o[o.ReconnectionShortGraceTime=3e5]="ReconnectionShortGraceTime",o[o.KeepAliveSendTime=5e3]="KeepAliveSendTime",o))(B||{});class c{constructor(e,t,i,n){this.type=e;this.id=t;this.ack=i;this.data=n;this.writtenTime=0}writtenTime;get size(){return this.data.byteLength}}class v extends T{_socket;_isDisposed;_incomingData;lastReadTime;_onMessage=this._register(new p);onMessage=this._onMessage.event;_state={readHead:!0,readLen:13,messageType:0,id:0,ack:0};constructor(e){super(),this._socket=e,this._isDisposed=!1,this._incomingData=new L,this._register(this._socket.onData(t=>this.acceptChunk(t))),this.lastReadTime=Date.now()}acceptChunk(e){if(!(!e||e.byteLength===0))for(this.lastReadTime=Date.now(),this._incomingData.acceptChunk(e);this._incomingData.byteLength>=this._state.readLen;){const t=this._incomingData.read(this._state.readLen);if(this._state.readHead)this._state.readHead=!1,this._state.readLen=t.readUInt32BE(9),this._state.messageType=t.readUInt8(0),this._state.id=t.readUInt32BE(1),this._state.ack=t.readUInt32BE(5),this._socket.traceSocketEvent("protocolHeaderRead",{messageType:M(this._state.messageType),id:this._state.id,ack:this._state.ack,messageSize:this._state.readLen});else{const i=this._state.messageType,n=this._state.id,h=this._state.ack;if(this._state.readHead=!0,this._state.readLen=13,this._state.messageType=0,this._state.id=0,this._state.ack=0,this._socket.traceSocketEvent("protocolMessageRead",t),this._onMessage.fire(new c(i,n,h,t)),this._isDisposed)break}}}readEntireBuffer(){return this._incomingData.read(this._incomingData.byteLength)}dispose(){this._isDisposed=!0,super.dispose()}}class b{_isDisposed;_isPaused;_socket;_data;_totalLength;lastWriteTime;constructor(e){this._isDisposed=!1,this._isPaused=!1,this._socket=e,this._data=[],this._totalLength=0,this.lastWriteTime=0}dispose(){try{this.flush()}catch{}this._isDisposed=!0}drain(){return this.flush(),this._socket.drain()}flush(){this._writeNow()}pause(){this._isPaused=!0}resume(){this._isPaused=!1,this._scheduleWriting()}write(e){if(this._isDisposed)return;e.writtenTime=Date.now(),this.lastWriteTime=Date.now();const t=g.alloc(13);t.writeUInt8(e.type,0),t.writeUInt32BE(e.id,1),t.writeUInt32BE(e.ack,5),t.writeUInt32BE(e.data.byteLength,9),this._socket.traceSocketEvent("protocolHeaderWrite",{messageType:M(e.type),id:e.id,ack:e.ack,messageSize:e.data.byteLength}),this._socket.traceSocketEvent("protocolMessageWrite",e.data),this._writeSoon(t,e.data)}_bufferAdd(e,t){const i=this._totalLength===0;return this._data.push(e,t),this._totalLength+=e.byteLength+t.byteLength,i}_bufferTake(){const e=g.concat(this._data,this._totalLength);return this._data.length=0,this._totalLength=0,e}_writeSoon(e,t){this._bufferAdd(e,t)&&this._scheduleWriting()}_writeNowTimeout=null;_scheduleWriting(){this._writeNowTimeout||(this._writeNowTimeout=setTimeout(()=>{this._writeNowTimeout=null,this._writeNow()}))}_writeNow(){if(this._totalLength===0||this._isPaused)return;const e=this._bufferTake();this._socket.traceSocketEvent("protocolWrite",{byteLength:e.byteLength}),this._socket.write(e)}}class C extends T{_socket;_socketWriter;_socketReader;_onMessage=new p;onMessage=this._onMessage.event;_onDidDispose=new p;onDidDispose=this._onDidDispose.event;constructor(e){super(),this._socket=e,this._socketWriter=this._register(new b(this._socket)),this._socketReader=this._register(new v(this._socket)),this._register(this._socketReader.onMessage(t=>{t.type===1&&this._onMessage.fire(t.data)})),this._register(this._socket.onClose(()=>this._onDidDispose.fire()))}drain(){return this._socketWriter.drain()}getSocket(){return this._socket}sendDisconnect(){}send(e){this._socketWriter.write(new c(1,0,0,e))}}class R extends D{constructor(t,i,n=null){super(t,i,n);this.protocol=t}static fromSocket(t,i){return new R(new C(t),i)}get onDidDispose(){return this.protocol.onDidDispose}dispose(){super.dispose();const t=this.protocol.getSocket();this.protocol.sendDisconnect(),this.protocol.dispose(),t.end()}}class k{_emitter;event;_hasListeners=!1;_isDeliveringMessages=!1;_bufferedMessages=[];constructor(){this._emitter=new p({onWillAddFirstListener:()=>{this._hasListeners=!0,queueMicrotask(()=>this._deliverMessages())},onDidRemoveLastListener:()=>{this._hasListeners=!1}}),this.event=this._emitter.event}_deliverMessages(){if(!this._isDeliveringMessages){for(this._isDeliveringMessages=!0;this._hasListeners&&this._bufferedMessages.length>0;)this._emitter.fire(this._bufferedMessages.shift());this._isDeliveringMessages=!1}}fire(e){this._hasListeners?this._bufferedMessages.length>0?this._bufferedMessages.push(e):this._emitter.fire(e):this._bufferedMessages.push(e)}flushBuffer(){this._bufferedMessages=[]}}class E{data;next;constructor(e){this.data=e,this.next=null}}class N{_first;_last;constructor(){this._first=null,this._last=null}length(){let e=0,t=this._first;for(;t;)t=t.next,e++;return e}peek(){return this._first?this._first.data:null}toArray(){const e=[];let t=0,i=this._first;for(;i;)e[t++]=i.data,i=i.next;return e}pop(){if(this._first){if(this._first===this._last){this._first=null,this._last=null;return}this._first=this._first.next}}push(e){const t=new E(e);if(!this._first){this._first=t,this._last=t;return}this._last.next=t,this._last=t}}class l{static _HISTORY_LENGTH=10;static _INSTANCE=null;static getInstance(){return l._INSTANCE||(l._INSTANCE=new l),l._INSTANCE}lastRuns;constructor(){this.lastRuns=[];const e=Date.now();for(let t=0;t<l._HISTORY_LENGTH;t++)this.lastRuns[t]=e-1e3*t;setInterval(()=>{for(let t=l._HISTORY_LENGTH;t>=1;t--)this.lastRuns[t]=this.lastRuns[t-1];this.lastRuns[0]=Date.now()},1e3)}load(){const e=Date.now(),t=(1+l._HISTORY_LENGTH)*1e3;let i=0;for(let n=0;n<l._HISTORY_LENGTH;n++)e-this.lastRuns[n]<=t&&i++;return 1-i/l._HISTORY_LENGTH}hasHighLoad(){return this.load()>=.5}}class O{_isReconnecting;_didSendDisconnect;_outgoingUnackMsg;_outgoingMsgId;_outgoingAckId;_outgoingAckTimeout;_incomingMsgId;_incomingAckId;_incomingMsgLastTime;_incomingAckTimeout;_keepAliveInterval;_lastReplayRequestTime;_lastSocketTimeoutTime;_socket;_socketWriter;_socketReader;_socketDisposables;_loadEstimator;_shouldSendKeepAlive;_onControlMessage=new k;onControlMessage=this._onControlMessage.event;_onMessage=new k;onMessage=this._onMessage.event;_onDidDispose=new k;onDidDispose=this._onDidDispose.event;_onSocketClose=new k;onSocketClose=this._onSocketClose.event;_onSocketTimeout=new k;onSocketTimeout=this._onSocketTimeout.event;get unacknowledgedCount(){return this._outgoingMsgId-this._outgoingAckId}constructor(e){this._loadEstimator=e.loadEstimator??l.getInstance(),this._shouldSendKeepAlive=e.sendKeepAlive??!0,this._isReconnecting=!1,this._outgoingUnackMsg=new N,this._outgoingMsgId=0,this._outgoingAckId=0,this._outgoingAckTimeout=null,this._incomingMsgId=0,this._incomingAckId=0,this._incomingMsgLastTime=0,this._incomingAckTimeout=null,this._lastReplayRequestTime=0,this._lastSocketTimeoutTime=Date.now(),this._socketDisposables=new I,this._socket=e.socket,this._socketWriter=this._socketDisposables.add(new b(this._socket)),this._socketReader=this._socketDisposables.add(new v(this._socket)),this._socketDisposables.add(this._socketReader.onMessage(t=>this._receiveMessage(t))),this._socketDisposables.add(this._socket.onClose(t=>this._onSocketClose.fire(t))),e.initialChunk&&this._socketReader.acceptChunk(e.initialChunk),this._shouldSendKeepAlive?this._keepAliveInterval=setInterval(()=>{this._sendKeepAlive()},5e3):this._keepAliveInterval=null}dispose(){this._outgoingAckTimeout&&(clearTimeout(this._outgoingAckTimeout),this._outgoingAckTimeout=null),this._incomingAckTimeout&&(clearTimeout(this._incomingAckTimeout),this._incomingAckTimeout=null),this._keepAliveInterval&&(clearInterval(this._keepAliveInterval),this._keepAliveInterval=null),this._socketDisposables.dispose()}drain(){return this._socketWriter.drain()}sendDisconnect(){if(!this._didSendDisconnect){this._didSendDisconnect=!0;const e=new c(5,0,0,u());this._socketWriter.write(e),this._socketWriter.flush()}}sendPause(){const e=new c(7,0,0,u());this._socketWriter.write(e)}sendResume(){const e=new c(8,0,0,u());this._socketWriter.write(e)}pauseSocketWriting(){this._socketWriter.pause()}getSocket(){return this._socket}getMillisSinceLastIncomingData(){return Date.now()-this._socketReader.lastReadTime}beginAcceptReconnection(e,t){this._isReconnecting=!0,this._socketDisposables.dispose(),this._socketDisposables=new I,this._onControlMessage.flushBuffer(),this._onSocketClose.flushBuffer(),this._onSocketTimeout.flushBuffer(),this._socket.dispose(),this._lastReplayRequestTime=0,this._lastSocketTimeoutTime=Date.now(),this._socket=e,this._socketWriter=this._socketDisposables.add(new b(this._socket)),this._socketReader=this._socketDisposables.add(new v(this._socket)),this._socketDisposables.add(this._socketReader.onMessage(i=>this._receiveMessage(i))),this._socketDisposables.add(this._socket.onClose(i=>this._onSocketClose.fire(i))),this._socketReader.acceptChunk(t)}endAcceptReconnection(){this._isReconnecting=!1,this._incomingAckId=this._incomingMsgId;const e=new c(3,0,this._incomingAckId,u());this._socketWriter.write(e);const t=this._outgoingUnackMsg.toArray();for(let i=0,n=t.length;i<n;i++)this._socketWriter.write(t[i]);this._recvAckCheck()}acceptDisconnect(){this._onDidDispose.fire()}_receiveMessage(e){if(e.ack>this._outgoingAckId){this._outgoingAckId=e.ack;do{const t=this._outgoingUnackMsg.peek();if(t&&t.id<=e.ack)this._outgoingUnackMsg.pop();else break}while(!0)}switch(e.type){case 0:break;case 1:{if(e.id>this._incomingMsgId)if(e.id!==this._incomingMsgId+1){const t=Date.now();t-this._lastReplayRequestTime>1e4&&(this._lastReplayRequestTime=t,this._socketWriter.write(new c(6,0,0,u())))}else this._incomingMsgId=e.id,this._incomingMsgLastTime=Date.now(),this._sendAckCheck(),this._onMessage.fire(e.data);break}case 2:{this._onControlMessage.fire(e.data);break}case 3:break;case 5:{this._onDidDispose.fire();break}case 6:{const t=this._outgoingUnackMsg.toArray();for(let i=0,n=t.length;i<n;i++)this._socketWriter.write(t[i]);this._recvAckCheck();break}case 7:{this._socketWriter.pause();break}case 8:{this._socketWriter.resume();break}case 9:break}}readEntireBuffer(){return this._socketReader.readEntireBuffer()}flush(){this._socketWriter.flush()}send(e){const t=++this._outgoingMsgId;this._incomingAckId=this._incomingMsgId;const i=new c(1,t,this._incomingAckId,e);this._outgoingUnackMsg.push(i),this._isReconnecting||(this._socketWriter.write(i),this._recvAckCheck())}sendControl(e){const t=new c(2,0,0,e);this._socketWriter.write(t)}_sendAckCheck(){if(this._incomingMsgId<=this._incomingAckId||this._incomingAckTimeout)return;const e=Date.now()-this._incomingMsgLastTime;if(e>=2e3){this._sendAck();return}this._incomingAckTimeout=setTimeout(()=>{this._incomingAckTimeout=null,this._sendAckCheck()},2e3-e+5)}_recvAckCheck(){if(this._outgoingMsgId<=this._outgoingAckId||this._outgoingAckTimeout||this._isReconnecting)return;const e=this._outgoingUnackMsg.peek(),t=Date.now()-e.writtenTime,i=Date.now()-this._socketReader.lastReadTime,n=Date.now()-this._lastSocketTimeoutTime;if(t>=2e4&&i>=2e4&&n>=2e4&&!this._loadEstimator.hasHighLoad()){this._lastSocketTimeoutTime=Date.now(),this._onSocketTimeout.fire({unacknowledgedMsgCount:this._outgoingUnackMsg.length(),timeSinceOldestUnacknowledgedMsg:t,timeSinceLastReceivedSomeData:i});return}const h=Math.max(2e4-t,2e4-i,2e4-n,500);this._outgoingAckTimeout=setTimeout(()=>{this._outgoingAckTimeout=null,this._recvAckCheck()},h)}_sendAck(){if(this._incomingMsgId<=this._incomingAckId)return;this._incomingAckId=this._incomingMsgId;const e=new c(3,0,this._incomingAckId,u());this._socketWriter.write(e)}_sendKeepAlive(){this._incomingAckId=this._incomingMsgId;const e=new c(9,0,this._incomingAckId,u());this._socketWriter.write(e)}}export{k as BufferedEmitter,L as ChunkStream,R as Client,O as PersistentProtocol,C as Protocol,B as ProtocolConstants,P as SocketCloseEventType,y as SocketDiagnostics,A as SocketDiagnosticsEventType};
