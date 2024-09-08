import assert from "assert";
import { EventEmitter } from "events";
import {
  connect,
  createServer
} from "net";
import { tmpdir } from "os";
import sinon from "sinon";
import { Barrier, timeout } from "../../../../common/async.js";
import { VSBuffer } from "../../../../common/buffer.js";
import { Emitter, Event } from "../../../../common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../common/lifecycle.js";
import { flakySuite } from "../../../../test/common/testUtils.js";
import { runWithFakedTimers } from "../../../../test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../test/common/utils.js";
import {
  PersistentProtocol,
  Protocol,
  ProtocolConstants
} from "../../common/ipc.net.js";
import {
  NodeSocket,
  WebSocketNodeSocket,
  createRandomIPCHandle,
  createStaticIPCHandle
} from "../../node/ipc.net.js";
class MessageStream extends Disposable {
  _currentComplete;
  _messages;
  constructor(x) {
    super();
    this._currentComplete = null;
    this._messages = [];
    this._register(
      x.onMessage((data) => {
        this._messages.push(data);
        this._trigger();
      })
    );
  }
  _trigger() {
    if (!this._currentComplete) {
      return;
    }
    if (this._messages.length === 0) {
      return;
    }
    const complete = this._currentComplete;
    const msg = this._messages.shift();
    this._currentComplete = null;
    complete(msg);
  }
  waitForOne() {
    return new Promise((complete) => {
      this._currentComplete = complete;
      this._trigger();
    });
  }
}
class EtherStream extends EventEmitter {
  constructor(_ether, _name) {
    super();
    this._ether = _ether;
    this._name = _name;
  }
  write(data, cb) {
    if (!Buffer.isBuffer(data)) {
      throw new Error(`Invalid data`);
    }
    this._ether.write(this._name, data);
    return true;
  }
  destroy() {
  }
}
class Ether {
  constructor(_wireLatency = 0) {
    this._wireLatency = _wireLatency;
    this._a = new EtherStream(this, "a");
    this._b = new EtherStream(this, "b");
    this._ab = [];
    this._ba = [];
  }
  _a;
  _b;
  _ab;
  _ba;
  get a() {
    return this._a;
  }
  get b() {
    return this._b;
  }
  write(from, data) {
    setTimeout(() => {
      if (from === "a") {
        this._ab.push(data);
      } else {
        this._ba.push(data);
      }
      setTimeout(() => this._deliver(), 0);
    }, this._wireLatency);
  }
  _deliver() {
    if (this._ab.length > 0) {
      const data = Buffer.concat(this._ab);
      this._ab.length = 0;
      this._b.emit("data", data);
      setTimeout(() => this._deliver(), 0);
      return;
    }
    if (this._ba.length > 0) {
      const data = Buffer.concat(this._ba);
      this._ba.length = 0;
      this._a.emit("data", data);
      setTimeout(() => this._deliver(), 0);
      return;
    }
  }
}
suite("IPC, Socket Protocol", () => {
  const ds = ensureNoDisposablesAreLeakedInTestSuite();
  let ether;
  setup(() => {
    ether = new Ether();
  });
  test("read/write", async () => {
    const a = new Protocol(new NodeSocket(ether.a));
    const b = new Protocol(new NodeSocket(ether.b));
    const bMessages = new MessageStream(b);
    a.send(VSBuffer.fromString("foobarfarboo"));
    const msg1 = await bMessages.waitForOne();
    assert.strictEqual(msg1.toString(), "foobarfarboo");
    const buffer = VSBuffer.alloc(1);
    buffer.writeUInt8(123, 0);
    a.send(buffer);
    const msg2 = await bMessages.waitForOne();
    assert.strictEqual(msg2.readUInt8(0), 123);
    bMessages.dispose();
    a.dispose();
    b.dispose();
  });
  test("read/write, object data", async () => {
    const a = new Protocol(new NodeSocket(ether.a));
    const b = new Protocol(new NodeSocket(ether.b));
    const bMessages = new MessageStream(b);
    const data = {
      pi: Math.PI,
      foo: "bar",
      more: true,
      data: "Hello World".split("")
    };
    a.send(VSBuffer.fromString(JSON.stringify(data)));
    const msg = await bMessages.waitForOne();
    assert.deepStrictEqual(JSON.parse(msg.toString()), data);
    bMessages.dispose();
    a.dispose();
    b.dispose();
  });
  test("issue #211462: destroy socket after end timeout", async () => {
    const socket = new EventEmitter();
    Object.assign(socket, { destroy: () => socket.emit("close") });
    const protocol = ds.add(new Protocol(new NodeSocket(socket)));
    const disposed = sinon.stub();
    const timers = sinon.useFakeTimers();
    ds.add(toDisposable(() => timers.restore()));
    ds.add(protocol.onDidDispose(disposed));
    socket.emit("end");
    assert.ok(!disposed.called);
    timers.tick(29999);
    assert.ok(!disposed.called);
    timers.tick(1);
    assert.ok(disposed.called);
  });
});
suite("PersistentProtocol reconnection", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("acks get piggybacked with messages", async () => {
    const ether = new Ether();
    const a = new PersistentProtocol({ socket: new NodeSocket(ether.a) });
    const aMessages = new MessageStream(a);
    const b = new PersistentProtocol({ socket: new NodeSocket(ether.b) });
    const bMessages = new MessageStream(b);
    a.send(VSBuffer.fromString("a1"));
    assert.strictEqual(a.unacknowledgedCount, 1);
    assert.strictEqual(b.unacknowledgedCount, 0);
    a.send(VSBuffer.fromString("a2"));
    assert.strictEqual(a.unacknowledgedCount, 2);
    assert.strictEqual(b.unacknowledgedCount, 0);
    a.send(VSBuffer.fromString("a3"));
    assert.strictEqual(a.unacknowledgedCount, 3);
    assert.strictEqual(b.unacknowledgedCount, 0);
    const a1 = await bMessages.waitForOne();
    assert.strictEqual(a1.toString(), "a1");
    assert.strictEqual(a.unacknowledgedCount, 3);
    assert.strictEqual(b.unacknowledgedCount, 0);
    const a2 = await bMessages.waitForOne();
    assert.strictEqual(a2.toString(), "a2");
    assert.strictEqual(a.unacknowledgedCount, 3);
    assert.strictEqual(b.unacknowledgedCount, 0);
    const a3 = await bMessages.waitForOne();
    assert.strictEqual(a3.toString(), "a3");
    assert.strictEqual(a.unacknowledgedCount, 3);
    assert.strictEqual(b.unacknowledgedCount, 0);
    b.send(VSBuffer.fromString("b1"));
    assert.strictEqual(a.unacknowledgedCount, 3);
    assert.strictEqual(b.unacknowledgedCount, 1);
    const b1 = await aMessages.waitForOne();
    assert.strictEqual(b1.toString(), "b1");
    assert.strictEqual(a.unacknowledgedCount, 0);
    assert.strictEqual(b.unacknowledgedCount, 1);
    a.send(VSBuffer.fromString("a4"));
    assert.strictEqual(a.unacknowledgedCount, 1);
    assert.strictEqual(b.unacknowledgedCount, 1);
    const b2 = await bMessages.waitForOne();
    assert.strictEqual(b2.toString(), "a4");
    assert.strictEqual(a.unacknowledgedCount, 1);
    assert.strictEqual(b.unacknowledgedCount, 0);
    aMessages.dispose();
    bMessages.dispose();
    a.dispose();
    b.dispose();
  });
  test("ack gets sent after a while", async () => {
    await runWithFakedTimers(
      { useFakeTimers: true, maxTaskCount: 100 },
      async () => {
        const loadEstimator = {
          hasHighLoad: () => false
        };
        const ether = new Ether();
        const aSocket = new NodeSocket(ether.a);
        const a = new PersistentProtocol({
          socket: aSocket,
          loadEstimator
        });
        const aMessages = new MessageStream(a);
        const bSocket = new NodeSocket(ether.b);
        const b = new PersistentProtocol({
          socket: bSocket,
          loadEstimator
        });
        const bMessages = new MessageStream(b);
        a.send(VSBuffer.fromString("a1"));
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 0);
        const a1 = await bMessages.waitForOne();
        assert.strictEqual(a1.toString(), "a1");
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 0);
        await timeout(2 * ProtocolConstants.AcknowledgeTime);
        assert.strictEqual(a.unacknowledgedCount, 0);
        assert.strictEqual(b.unacknowledgedCount, 0);
        aMessages.dispose();
        bMessages.dispose();
        a.dispose();
        b.dispose();
      }
    );
  });
  test("messages that are never written to a socket should not cause an ack timeout", async () => {
    await runWithFakedTimers(
      {
        useFakeTimers: true,
        useSetImmediate: true,
        maxTaskCount: 1e3
      },
      async () => {
        await timeout(60 * 60 * 1e3);
        const loadEstimator = {
          hasHighLoad: () => false
        };
        const ether = new Ether();
        const aSocket = new NodeSocket(ether.a);
        const a = new PersistentProtocol({
          socket: aSocket,
          loadEstimator,
          sendKeepAlive: false
        });
        const aMessages = new MessageStream(a);
        const bSocket = new NodeSocket(ether.b);
        const b = new PersistentProtocol({
          socket: bSocket,
          loadEstimator,
          sendKeepAlive: false
        });
        const bMessages = new MessageStream(b);
        a.send(VSBuffer.fromString("a1"));
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 0);
        const a1 = await bMessages.waitForOne();
        assert.strictEqual(a1.toString(), "a1");
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 0);
        b.send(VSBuffer.fromString("b1"));
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 1);
        const b1 = await aMessages.waitForOne();
        assert.strictEqual(b1.toString(), "b1");
        assert.strictEqual(a.unacknowledgedCount, 0);
        assert.strictEqual(b.unacknowledgedCount, 1);
        aSocket.dispose();
        const aSocket2 = new NodeSocket(ether.a);
        a.beginAcceptReconnection(aSocket2, null);
        let timeoutListenerCalled = false;
        const socketTimeoutListener = a.onSocketTimeout(() => {
          timeoutListenerCalled = true;
        });
        a.send(VSBuffer.fromString("a2"));
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 1);
        await timeout(2 * ProtocolConstants.TimeoutTime);
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 1);
        assert.strictEqual(timeoutListenerCalled, false);
        a.endAcceptReconnection();
        assert.strictEqual(timeoutListenerCalled, false);
        await timeout(2 * ProtocolConstants.TimeoutTime);
        assert.strictEqual(a.unacknowledgedCount, 0);
        assert.strictEqual(b.unacknowledgedCount, 0);
        assert.strictEqual(timeoutListenerCalled, false);
        socketTimeoutListener.dispose();
        aMessages.dispose();
        bMessages.dispose();
        a.dispose();
        b.dispose();
      }
    );
  });
  test("acks are always sent after a reconnection", async () => {
    await runWithFakedTimers(
      {
        useFakeTimers: true,
        useSetImmediate: true,
        maxTaskCount: 1e3
      },
      async () => {
        const loadEstimator = {
          hasHighLoad: () => false
        };
        const wireLatency = 1e3;
        const ether = new Ether(wireLatency);
        const aSocket = new NodeSocket(ether.a);
        const a = new PersistentProtocol({
          socket: aSocket,
          loadEstimator
        });
        const aMessages = new MessageStream(a);
        const bSocket = new NodeSocket(ether.b);
        const b = new PersistentProtocol({
          socket: bSocket,
          loadEstimator
        });
        const bMessages = new MessageStream(b);
        a.send(VSBuffer.fromString("a1"));
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 0);
        const a1 = await bMessages.waitForOne();
        assert.strictEqual(a1.toString(), "a1");
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 0);
        await timeout(
          ProtocolConstants.AcknowledgeTime + wireLatency / 2
        );
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 0);
        aSocket.dispose();
        bSocket.dispose();
        const ether2 = new Ether(wireLatency);
        const aSocket2 = new NodeSocket(ether2.a);
        const bSocket2 = new NodeSocket(ether2.b);
        b.beginAcceptReconnection(bSocket2, null);
        b.endAcceptReconnection();
        a.beginAcceptReconnection(aSocket2, null);
        a.endAcceptReconnection();
        await timeout(
          2 * ProtocolConstants.AcknowledgeTime + wireLatency
        );
        assert.strictEqual(a.unacknowledgedCount, 0);
        assert.strictEqual(b.unacknowledgedCount, 0);
        aMessages.dispose();
        bMessages.dispose();
        a.dispose();
        b.dispose();
      }
    );
  });
  test("onSocketTimeout is emitted at most once every 20s", async () => {
    await runWithFakedTimers(
      {
        useFakeTimers: true,
        useSetImmediate: true,
        maxTaskCount: 1e3
      },
      async () => {
        const loadEstimator = {
          hasHighLoad: () => false
        };
        const ether = new Ether();
        const aSocket = new NodeSocket(ether.a);
        const a = new PersistentProtocol({
          socket: aSocket,
          loadEstimator
        });
        const aMessages = new MessageStream(a);
        const bSocket = new NodeSocket(ether.b);
        const b = new PersistentProtocol({
          socket: bSocket,
          loadEstimator
        });
        const bMessages = new MessageStream(b);
        b.pauseSocketWriting();
        a.send(VSBuffer.fromString("a1"));
        await Event.toPromise(a.onSocketTimeout);
        let timeoutFiredAgain = false;
        const timeoutListener = a.onSocketTimeout(() => {
          timeoutFiredAgain = true;
        });
        a.send(VSBuffer.fromString("a2"));
        a.send(VSBuffer.fromString("a3"));
        await timeout(ProtocolConstants.TimeoutTime / 2);
        assert.strictEqual(timeoutFiredAgain, false);
        timeoutListener.dispose();
        aMessages.dispose();
        bMessages.dispose();
        a.dispose();
        b.dispose();
      }
    );
  });
  test("writing can be paused", async () => {
    await runWithFakedTimers(
      { useFakeTimers: true, maxTaskCount: 100 },
      async () => {
        const loadEstimator = {
          hasHighLoad: () => false
        };
        const ether = new Ether();
        const aSocket = new NodeSocket(ether.a);
        const a = new PersistentProtocol({
          socket: aSocket,
          loadEstimator
        });
        const aMessages = new MessageStream(a);
        const bSocket = new NodeSocket(ether.b);
        const b = new PersistentProtocol({
          socket: bSocket,
          loadEstimator
        });
        const bMessages = new MessageStream(b);
        a.send(VSBuffer.fromString("a1"));
        const a1 = await bMessages.waitForOne();
        assert.strictEqual(a1.toString(), "a1");
        b.sendPause();
        b.send(VSBuffer.fromString("b1"));
        const b1 = await aMessages.waitForOne();
        assert.strictEqual(b1.toString(), "b1");
        a.send(VSBuffer.fromString("a2"));
        await timeout(2 * ProtocolConstants.AcknowledgeTime);
        assert.strictEqual(a.unacknowledgedCount, 1);
        assert.strictEqual(b.unacknowledgedCount, 1);
        b.sendResume();
        const a2 = await bMessages.waitForOne();
        assert.strictEqual(a2.toString(), "a2");
        await timeout(2 * ProtocolConstants.AcknowledgeTime);
        assert.strictEqual(a.unacknowledgedCount, 0);
        assert.strictEqual(b.unacknowledgedCount, 0);
        aMessages.dispose();
        bMessages.dispose();
        a.dispose();
        b.dispose();
      }
    );
  });
});
flakySuite("IPC, create handle", () => {
  test("createRandomIPCHandle", async () => {
    return testIPCHandle(createRandomIPCHandle());
  });
  test("createStaticIPCHandle", async () => {
    return testIPCHandle(createStaticIPCHandle(tmpdir(), "test", "1.64.0"));
  });
  function testIPCHandle(handle) {
    return new Promise((resolve, reject) => {
      const pipeName = createRandomIPCHandle();
      const server = createServer();
      server.on("error", () => {
        return new Promise(() => server.close(() => reject()));
      });
      server.listen(pipeName, () => {
        server.removeListener("error", reject);
        return new Promise(() => {
          server.close(() => resolve());
        });
      });
    });
  }
});
suite("WebSocketNodeSocket", () => {
  const ds = ensureNoDisposablesAreLeakedInTestSuite();
  function toUint8Array(data) {
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i];
    }
    return result;
  }
  function fromUint8Array(data) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i];
    }
    return result;
  }
  function fromCharCodeArray(data) {
    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data[i]);
    }
    return result;
  }
  class FakeNodeSocket extends Disposable {
    _onData = new Emitter();
    onData = this._onData.event;
    _onClose = new Emitter();
    onClose = this._onClose.event;
    writtenData = [];
    traceSocketEvent(type, data) {
    }
    constructor() {
      super();
    }
    write(data) {
      this.writtenData.push(data);
    }
    fireData(data) {
      this._onData.fire(VSBuffer.wrap(toUint8Array(data)));
    }
  }
  async function testReading(frames, permessageDeflate) {
    const disposables = new DisposableStore();
    const socket = new FakeNodeSocket();
    const webSocket = disposables.add(
      new WebSocketNodeSocket(
        socket,
        permessageDeflate,
        null,
        false
      )
    );
    const barrier = new Barrier();
    let remainingFrameCount = frames.length;
    let receivedData = "";
    disposables.add(
      webSocket.onData((buff) => {
        receivedData += fromCharCodeArray(fromUint8Array(buff.buffer));
        remainingFrameCount--;
        if (remainingFrameCount === 0) {
          barrier.open();
        }
      })
    );
    for (let i = 0; i < frames.length; i++) {
      socket.fireData(frames[i]);
    }
    await barrier.wait();
    disposables.dispose();
    return receivedData;
  }
  test("A single-frame unmasked text message", async () => {
    const frames = [
      [129, 5, 72, 101, 108, 108, 111]
      // contains "Hello"
    ];
    const actual = await testReading(frames, false);
    assert.deepStrictEqual(actual, "Hello");
  });
  test("A single-frame masked text message", async () => {
    const frames = [
      [129, 133, 55, 250, 33, 61, 127, 159, 77, 81, 88]
      // contains "Hello"
    ];
    const actual = await testReading(frames, false);
    assert.deepStrictEqual(actual, "Hello");
  });
  test("A fragmented unmasked text message", async () => {
    const frames = [
      [1, 3, 72, 101, 108],
      // contains "Hel"
      [128, 2, 108, 111]
      // contains "lo"
    ];
    const actual = await testReading(frames, false);
    assert.deepStrictEqual(actual, "Hello");
  });
  suite("compression", () => {
    test("A single-frame compressed text message", async () => {
      const frames = [
        [193, 7, 242, 72, 205, 201, 201, 7, 0]
        // contains "Hello"
      ];
      const actual = await testReading(frames, true);
      assert.deepStrictEqual(actual, "Hello");
    });
    test("A fragmented compressed text message", async () => {
      const frames = [
        // contains "Hello"
        [65, 3, 242, 72, 205],
        [128, 4, 201, 201, 7, 0]
      ];
      const actual = await testReading(frames, true);
      assert.deepStrictEqual(actual, "Hello");
    });
    test("A single-frame non-compressed text message", async () => {
      const frames = [
        [129, 5, 72, 101, 108, 108, 111]
        // contains "Hello"
      ];
      const actual = await testReading(frames, true);
      assert.deepStrictEqual(actual, "Hello");
    });
    test("A single-frame compressed text message followed by a single-frame non-compressed text message", async () => {
      const frames = [
        [193, 7, 242, 72, 205, 201, 201, 7, 0],
        // contains "Hello"
        [129, 5, 119, 111, 114, 108, 100]
        // contains "world"
      ];
      const actual = await testReading(frames, true);
      assert.deepStrictEqual(actual, "Helloworld");
    });
  });
  test("Large buffers are split and sent in chunks", async () => {
    let receivingSideOnDataCallCount = 0;
    let receivingSideTotalBytes = 0;
    const receivingSideSocketClosedBarrier = new Barrier();
    const server = await listenOnRandomPort((socket2) => {
      server.close();
      const webSocketNodeSocket2 = new WebSocketNodeSocket(
        new NodeSocket(socket2),
        true,
        null,
        false
      );
      ds.add(
        webSocketNodeSocket2.onData((data) => {
          receivingSideOnDataCallCount++;
          receivingSideTotalBytes += data.byteLength;
        })
      );
      ds.add(
        webSocketNodeSocket2.onClose(() => {
          webSocketNodeSocket2.dispose();
          receivingSideSocketClosedBarrier.open();
        })
      );
    });
    const socket = connect({
      host: "127.0.0.1",
      port: server.address().port
    });
    const buff = generateRandomBuffer(1 * 1024 * 1024);
    const webSocketNodeSocket = new WebSocketNodeSocket(
      new NodeSocket(socket),
      true,
      null,
      false
    );
    webSocketNodeSocket.write(buff);
    await webSocketNodeSocket.drain();
    webSocketNodeSocket.dispose();
    await receivingSideSocketClosedBarrier.wait();
    assert.strictEqual(receivingSideTotalBytes, buff.byteLength);
    assert.strictEqual(receivingSideOnDataCallCount, 4);
  });
  test("issue #194284: ping/pong opcodes are supported", async () => {
    const disposables = new DisposableStore();
    const socket = new FakeNodeSocket();
    const webSocket = disposables.add(
      new WebSocketNodeSocket(socket, false, null, false)
    );
    let receivedData = "";
    disposables.add(
      webSocket.onData((buff) => {
        receivedData += fromCharCodeArray(fromUint8Array(buff.buffer));
      })
    );
    socket.fireData([129, 5, 72, 101, 108, 108, 111]);
    socket.fireData([137, 4, 100, 97, 116, 97]);
    socket.fireData([129, 5, 72, 101, 108, 108, 111]);
    assert.strictEqual(receivedData, "HelloHello");
    assert.deepStrictEqual(
      socket.writtenData.map((x) => fromUint8Array(x.buffer)),
      [
        // A pong message that contains "data"
        [138, 4, 100, 97, 116, 97]
      ]
    );
    disposables.dispose();
    return receivedData;
  });
  function generateRandomBuffer(size) {
    const buff = VSBuffer.alloc(size);
    for (let i = 0; i < size; i++) {
      buff.writeUInt8(Math.floor(256 * Math.random()), i);
    }
    return buff;
  }
  function listenOnRandomPort(handler) {
    return new Promise((resolve, reject) => {
      const server = createServer(handler).listen(0);
      server.on("listening", () => {
        resolve(server);
      });
      server.on("error", (err) => {
        reject(err);
      });
    });
  }
});
