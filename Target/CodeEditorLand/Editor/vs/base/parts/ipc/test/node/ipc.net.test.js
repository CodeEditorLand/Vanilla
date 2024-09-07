import e from"assert";import A from"sinon";import{EventEmitter as P}from"events";import{connect as R,createServer as F}from"net";import{tmpdir as V}from"os";import{Barrier as D,timeout as S}from"../../../../common/async.js";import{VSBuffer as m}from"../../../../common/buffer.js";import{Emitter as B,Event as N}from"../../../../common/event.js";import{Disposable as I,DisposableStore as L,toDisposable as U}from"../../../../common/lifecycle.js";import{PersistentProtocol as p,Protocol as q,ProtocolConstants as x}from"../../common/ipc.net.js";import{createRandomIPCHandle as O,createStaticIPCHandle as W,NodeSocket as w,WebSocketNodeSocket as _}from"../../node/ipc.net.js";import{flakySuite as J}from"../../../../test/common/testUtils.js";import{runWithFakedTimers as y}from"../../../../test/common/timeTravelScheduler.js";import{ensureNoDisposablesAreLeakedInTestSuite as T}from"../../../../test/common/utils.js";class f extends I{_currentComplete;_messages;constructor(s){super(),this._currentComplete=null,this._messages=[],this._register(s.onMessage(a=>{this._messages.push(a),this._trigger()}))}_trigger(){if(!this._currentComplete||this._messages.length===0)return;const s=this._currentComplete,a=this._messages.shift();this._currentComplete=null,s(a)}waitForOne(){return new Promise(s=>{this._currentComplete=s,this._trigger()})}}class H extends P{constructor(a,t){super();this._ether=a;this._name=t}write(a,t){if(!Buffer.isBuffer(a))throw new Error("Invalid data");return this._ether.write(this._name,a),!0}destroy(){}}class E{constructor(s=0){this._wireLatency=s;this._a=new H(this,"a"),this._b=new H(this,"b"),this._ab=[],this._ba=[]}_a;_b;_ab;_ba;get a(){return this._a}get b(){return this._b}write(s,a){setTimeout(()=>{s==="a"?this._ab.push(a):this._ba.push(a),setTimeout(()=>this._deliver(),0)},this._wireLatency)}_deliver(){if(this._ab.length>0){const s=Buffer.concat(this._ab);this._ab.length=0,this._b.emit("data",s),setTimeout(()=>this._deliver(),0);return}if(this._ba.length>0){const s=Buffer.concat(this._ba);this._ba.length=0,this._a.emit("data",s),setTimeout(()=>this._deliver(),0);return}}}suite("IPC, Socket Protocol",()=>{const l=T();let s;setup(()=>{s=new E}),test("read/write",async()=>{const a=new q(new w(s.a)),t=new q(new w(s.b)),r=new f(t);a.send(m.fromString("foobarfarboo"));const u=await r.waitForOne();e.strictEqual(u.toString(),"foobarfarboo");const i=m.alloc(1);i.writeUInt8(123,0),a.send(i);const d=await r.waitForOne();e.strictEqual(d.readUInt8(0),123),r.dispose(),a.dispose(),t.dispose()}),test("read/write, object data",async()=>{const a=new q(new w(s.a)),t=new q(new w(s.b)),r=new f(t),u={pi:Math.PI,foo:"bar",more:!0,data:"Hello World".split("")};a.send(m.fromString(JSON.stringify(u)));const i=await r.waitForOne();e.deepStrictEqual(JSON.parse(i.toString()),u),r.dispose(),a.dispose(),t.dispose()}),test("issue #211462: destroy socket after end timeout",async()=>{const a=new P;Object.assign(a,{destroy:()=>a.emit("close")});const t=l.add(new q(new w(a))),r=A.stub(),u=A.useFakeTimers();l.add(U(()=>u.restore())),l.add(t.onDidDispose(r)),a.emit("end"),e.ok(!r.called),u.tick(29999),e.ok(!r.called),u.tick(1),e.ok(r.called)})}),suite("PersistentProtocol reconnection",()=>{T(),test("acks get piggybacked with messages",async()=>{const l=new E,s=new p({socket:new w(l.a)}),a=new f(s),t=new p({socket:new w(l.b)}),r=new f(t);s.send(m.fromString("a1")),e.strictEqual(s.unacknowledgedCount,1),e.strictEqual(t.unacknowledgedCount,0),s.send(m.fromString("a2")),e.strictEqual(s.unacknowledgedCount,2),e.strictEqual(t.unacknowledgedCount,0),s.send(m.fromString("a3")),e.strictEqual(s.unacknowledgedCount,3),e.strictEqual(t.unacknowledgedCount,0);const u=await r.waitForOne();e.strictEqual(u.toString(),"a1"),e.strictEqual(s.unacknowledgedCount,3),e.strictEqual(t.unacknowledgedCount,0);const i=await r.waitForOne();e.strictEqual(i.toString(),"a2"),e.strictEqual(s.unacknowledgedCount,3),e.strictEqual(t.unacknowledgedCount,0);const d=await r.waitForOne();e.strictEqual(d.toString(),"a3"),e.strictEqual(s.unacknowledgedCount,3),e.strictEqual(t.unacknowledgedCount,0),t.send(m.fromString("b1")),e.strictEqual(s.unacknowledgedCount,3),e.strictEqual(t.unacknowledgedCount,1);const o=await a.waitForOne();e.strictEqual(o.toString(),"b1"),e.strictEqual(s.unacknowledgedCount,0),e.strictEqual(t.unacknowledgedCount,1),s.send(m.fromString("a4")),e.strictEqual(s.unacknowledgedCount,1),e.strictEqual(t.unacknowledgedCount,1);const n=await r.waitForOne();e.strictEqual(n.toString(),"a4"),e.strictEqual(s.unacknowledgedCount,1),e.strictEqual(t.unacknowledgedCount,0),a.dispose(),r.dispose(),s.dispose(),t.dispose()}),test("ack gets sent after a while",async()=>{await y({useFakeTimers:!0,maxTaskCount:100},async()=>{const l={hasHighLoad:()=>!1},s=new E,a=new w(s.a),t=new p({socket:a,loadEstimator:l}),r=new f(t),u=new w(s.b),i=new p({socket:u,loadEstimator:l}),d=new f(i);t.send(m.fromString("a1")),e.strictEqual(t.unacknowledgedCount,1),e.strictEqual(i.unacknowledgedCount,0);const o=await d.waitForOne();e.strictEqual(o.toString(),"a1"),e.strictEqual(t.unacknowledgedCount,1),e.strictEqual(i.unacknowledgedCount,0),await S(2*x.AcknowledgeTime),e.strictEqual(t.unacknowledgedCount,0),e.strictEqual(i.unacknowledgedCount,0),r.dispose(),d.dispose(),t.dispose(),i.dispose()})}),test("messages that are never written to a socket should not cause an ack timeout",async()=>{await y({useFakeTimers:!0,useSetImmediate:!0,maxTaskCount:1e3},async()=>{await S(60*60*1e3);const l={hasHighLoad:()=>!1},s=new E,a=new w(s.a),t=new p({socket:a,loadEstimator:l,sendKeepAlive:!1}),r=new f(t),u=new w(s.b),i=new p({socket:u,loadEstimator:l,sendKeepAlive:!1}),d=new f(i);t.send(m.fromString("a1")),e.strictEqual(t.unacknowledgedCount,1),e.strictEqual(i.unacknowledgedCount,0);const o=await d.waitForOne();e.strictEqual(o.toString(),"a1"),e.strictEqual(t.unacknowledgedCount,1),e.strictEqual(i.unacknowledgedCount,0),i.send(m.fromString("b1")),e.strictEqual(t.unacknowledgedCount,1),e.strictEqual(i.unacknowledgedCount,1);const n=await r.waitForOne();e.strictEqual(n.toString(),"b1"),e.strictEqual(t.unacknowledgedCount,0),e.strictEqual(i.unacknowledgedCount,1),a.dispose();const c=new w(s.a);t.beginAcceptReconnection(c,null);let g=!1;const k=t.onSocketTimeout(()=>{g=!0});t.send(m.fromString("a2")),e.strictEqual(t.unacknowledgedCount,1),e.strictEqual(i.unacknowledgedCount,1),await S(2*x.TimeoutTime),e.strictEqual(t.unacknowledgedCount,1),e.strictEqual(i.unacknowledgedCount,1),e.strictEqual(g,!1),t.endAcceptReconnection(),e.strictEqual(g,!1),await S(2*x.TimeoutTime),e.strictEqual(t.unacknowledgedCount,0),e.strictEqual(i.unacknowledgedCount,0),e.strictEqual(g,!1),k.dispose(),r.dispose(),d.dispose(),t.dispose(),i.dispose()})}),test("acks are always sent after a reconnection",async()=>{await y({useFakeTimers:!0,useSetImmediate:!0,maxTaskCount:1e3},async()=>{const l={hasHighLoad:()=>!1},s=1e3,a=new E(s),t=new w(a.a),r=new p({socket:t,loadEstimator:l}),u=new f(r),i=new w(a.b),d=new p({socket:i,loadEstimator:l}),o=new f(d);r.send(m.fromString("a1")),e.strictEqual(r.unacknowledgedCount,1),e.strictEqual(d.unacknowledgedCount,0);const n=await o.waitForOne();e.strictEqual(n.toString(),"a1"),e.strictEqual(r.unacknowledgedCount,1),e.strictEqual(d.unacknowledgedCount,0),await S(x.AcknowledgeTime+s/2),e.strictEqual(r.unacknowledgedCount,1),e.strictEqual(d.unacknowledgedCount,0),t.dispose(),i.dispose();const c=new E(s),g=new w(c.a),k=new w(c.b);d.beginAcceptReconnection(k,null),d.endAcceptReconnection(),r.beginAcceptReconnection(g,null),r.endAcceptReconnection(),await S(2*x.AcknowledgeTime+s),e.strictEqual(r.unacknowledgedCount,0),e.strictEqual(d.unacknowledgedCount,0),u.dispose(),o.dispose(),r.dispose(),d.dispose()})}),test("onSocketTimeout is emitted at most once every 20s",async()=>{await y({useFakeTimers:!0,useSetImmediate:!0,maxTaskCount:1e3},async()=>{const l={hasHighLoad:()=>!1},s=new E,a=new w(s.a),t=new p({socket:a,loadEstimator:l}),r=new f(t),u=new w(s.b),i=new p({socket:u,loadEstimator:l}),d=new f(i);i.pauseSocketWriting(),t.send(m.fromString("a1")),await N.toPromise(t.onSocketTimeout);let o=!1;const n=t.onSocketTimeout(()=>{o=!0});t.send(m.fromString("a2")),t.send(m.fromString("a3")),await S(x.TimeoutTime/2),e.strictEqual(o,!1),n.dispose(),r.dispose(),d.dispose(),t.dispose(),i.dispose()})}),test("writing can be paused",async()=>{await y({useFakeTimers:!0,maxTaskCount:100},async()=>{const l={hasHighLoad:()=>!1},s=new E,a=new w(s.a),t=new p({socket:a,loadEstimator:l}),r=new f(t),u=new w(s.b),i=new p({socket:u,loadEstimator:l}),d=new f(i);t.send(m.fromString("a1"));const o=await d.waitForOne();e.strictEqual(o.toString(),"a1"),i.sendPause(),i.send(m.fromString("b1"));const n=await r.waitForOne();e.strictEqual(n.toString(),"b1"),t.send(m.fromString("a2")),await S(2*x.AcknowledgeTime),e.strictEqual(t.unacknowledgedCount,1),e.strictEqual(i.unacknowledgedCount,1),i.sendResume();const c=await d.waitForOne();e.strictEqual(c.toString(),"a2"),await S(2*x.AcknowledgeTime),e.strictEqual(t.unacknowledgedCount,0),e.strictEqual(i.unacknowledgedCount,0),r.dispose(),d.dispose(),t.dispose(),i.dispose()})})}),J("IPC, create handle",()=>{test("createRandomIPCHandle",async()=>l(O())),test("createStaticIPCHandle",async()=>l(W(V(),"test","1.64.0")));function l(s){return new Promise((a,t)=>{const r=O(),u=F();u.on("error",()=>new Promise(()=>u.close(()=>t()))),u.listen(r,()=>(u.removeListener("error",t),new Promise(()=>{u.close(()=>a())})))})}}),suite("WebSocketNodeSocket",()=>{const l=T();function s(o){const n=new Uint8Array(o.length);for(let c=0;c<o.length;c++)n[c]=o[c];return n}function a(o){const n=[];for(let c=0;c<o.length;c++)n[c]=o[c];return n}function t(o){let n="";for(let c=0;c<o.length;c++)n+=String.fromCharCode(o[c]);return n}class r extends I{_onData=new B;onData=this._onData.event;_onClose=new B;onClose=this._onClose.event;writtenData=[];traceSocketEvent(n,c){}constructor(){super()}write(n){this.writtenData.push(n)}fireData(n){this._onData.fire(m.wrap(s(n)))}}async function u(o,n){const c=new L,g=new r,k=c.add(new _(g,n,null,!1)),C=new D;let h=o.length,v="";c.add(k.onData(b=>{v+=t(a(b.buffer)),h--,h===0&&C.open()}));for(let b=0;b<o.length;b++)g.fireData(o[b]);return await C.wait(),c.dispose(),v}test("A single-frame unmasked text message",async()=>{const n=await u([[129,5,72,101,108,108,111]],!1);e.deepStrictEqual(n,"Hello")}),test("A single-frame masked text message",async()=>{const n=await u([[129,133,55,250,33,61,127,159,77,81,88]],!1);e.deepStrictEqual(n,"Hello")}),test("A fragmented unmasked text message",async()=>{const n=await u([[1,3,72,101,108],[128,2,108,111]],!1);e.deepStrictEqual(n,"Hello")}),suite("compression",()=>{test("A single-frame compressed text message",async()=>{const n=await u([[193,7,242,72,205,201,201,7,0]],!0);e.deepStrictEqual(n,"Hello")}),test("A fragmented compressed text message",async()=>{const n=await u([[65,3,242,72,205],[128,4,201,201,7,0]],!0);e.deepStrictEqual(n,"Hello")}),test("A single-frame non-compressed text message",async()=>{const n=await u([[129,5,72,101,108,108,111]],!0);e.deepStrictEqual(n,"Hello")}),test("A single-frame compressed text message followed by a single-frame non-compressed text message",async()=>{const n=await u([[193,7,242,72,205,201,201,7,0],[129,5,119,111,114,108,100]],!0);e.deepStrictEqual(n,"Helloworld")})}),test("Large buffers are split and sent in chunks",async()=>{let o=0,n=0;const c=new D,g=await d(v=>{g.close();const b=new _(new w(v),!0,null,!1);l.add(b.onData(M=>{o++,n+=M.byteLength})),l.add(b.onClose(()=>{b.dispose(),c.open()}))}),k=R({host:"127.0.0.1",port:g.address().port}),C=i(1*1024*1024),h=new _(new w(k),!0,null,!1);h.write(C),await h.drain(),h.dispose(),await c.wait(),e.strictEqual(n,C.byteLength),e.strictEqual(o,4)}),test("issue #194284: ping/pong opcodes are supported",async()=>{const o=new L,n=new r,c=o.add(new _(n,!1,null,!1));let g="";return o.add(c.onData(k=>{g+=t(a(k.buffer))})),n.fireData([129,5,72,101,108,108,111]),n.fireData([137,4,100,97,116,97]),n.fireData([129,5,72,101,108,108,111]),e.strictEqual(g,"HelloHello"),e.deepStrictEqual(n.writtenData.map(k=>a(k.buffer)),[[138,4,100,97,116,97]]),o.dispose(),g});function i(o){const n=m.alloc(o);for(let c=0;c<o;c++)n.writeUInt8(Math.floor(256*Math.random()),c);return n}function d(o){return new Promise((n,c)=>{const g=F(o).listen(0);g.on("listening",()=>{n(g)}),g.on("error",k=>{c(k)})})}});