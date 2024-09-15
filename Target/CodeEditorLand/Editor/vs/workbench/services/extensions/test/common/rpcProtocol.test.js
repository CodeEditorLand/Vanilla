var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IMessagePassingProtocol } from "../../../../../base/parts/ipc/common/ipc.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ProxyIdentifier, SerializableObjectWithBuffers } from "../../common/proxyIdentifier.js";
import { RPCProtocol } from "../../common/rpcProtocol.js";
suite("RPCProtocol", () => {
  let disposables;
  class MessagePassingProtocol {
    static {
      __name(this, "MessagePassingProtocol");
    }
    _pair;
    _onMessage = new Emitter();
    onMessage = this._onMessage.event;
    setPair(other) {
      this._pair = other;
    }
    send(buffer) {
      Promise.resolve().then(() => {
        this._pair._onMessage.fire(buffer);
      });
    }
  }
  let delegate;
  let bProxy;
  class BClass {
    static {
      __name(this, "BClass");
    }
    $m(a1, a2) {
      return Promise.resolve(delegate.call(null, a1, a2));
    }
  }
  setup(() => {
    disposables = new DisposableStore();
    const a_protocol = new MessagePassingProtocol();
    const b_protocol = new MessagePassingProtocol();
    a_protocol.setPair(b_protocol);
    b_protocol.setPair(a_protocol);
    const A = disposables.add(new RPCProtocol(a_protocol));
    const B = disposables.add(new RPCProtocol(b_protocol));
    const bIdentifier = new ProxyIdentifier("bb");
    const bInstance = new BClass();
    B.set(bIdentifier, bInstance);
    bProxy = A.getProxy(bIdentifier);
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("simple call", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => a1 + a2, "delegate");
    bProxy.$m(4, 1).then((res) => {
      assert.strictEqual(res, 5);
      done(null);
    }, done);
  });
  test("simple call without result", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
    }, "delegate");
    bProxy.$m(4, 1).then((res) => {
      assert.strictEqual(res, void 0);
      done(null);
    }, done);
  });
  test("passing buffer as argument", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
      assert.ok(a1 instanceof VSBuffer);
      return a1.buffer[a2];
    }, "delegate");
    const b = VSBuffer.alloc(4);
    b.buffer[0] = 1;
    b.buffer[1] = 2;
    b.buffer[2] = 3;
    b.buffer[3] = 4;
    bProxy.$m(b, 2).then((res) => {
      assert.strictEqual(res, 3);
      done(null);
    }, done);
  });
  test("returning a buffer", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
      const b = VSBuffer.alloc(4);
      b.buffer[0] = 1;
      b.buffer[1] = 2;
      b.buffer[2] = 3;
      b.buffer[3] = 4;
      return b;
    }, "delegate");
    bProxy.$m(4, 1).then((res) => {
      assert.ok(res instanceof VSBuffer);
      assert.strictEqual(res.buffer[0], 1);
      assert.strictEqual(res.buffer[1], 2);
      assert.strictEqual(res.buffer[2], 3);
      assert.strictEqual(res.buffer[3], 4);
      done(null);
    }, done);
  });
  test("cancelling a call via CancellationToken before", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => a1 + a2, "delegate");
    const p = bProxy.$m(4, CancellationToken.Cancelled);
    p.then((res) => {
      assert.fail("should not receive result");
    }, (err) => {
      assert.ok(true);
      done(null);
    });
  });
  test("passing CancellationToken.None", function(done) {
    delegate = /* @__PURE__ */ __name((a1, token) => {
      assert.ok(!!token);
      return a1 + 1;
    }, "delegate");
    bProxy.$m(4, CancellationToken.None).then((res) => {
      assert.strictEqual(res, 5);
      done(null);
    }, done);
  });
  test("cancelling a call via CancellationToken quickly", function(done) {
    delegate = /* @__PURE__ */ __name((a1, token) => {
      return new Promise((resolve, reject) => {
        const disposable = token.onCancellationRequested((e) => {
          disposable.dispose();
          resolve(7);
        });
      });
    }, "delegate");
    const tokenSource = new CancellationTokenSource();
    const p = bProxy.$m(4, tokenSource.token);
    p.then((res) => {
      assert.strictEqual(res, 7);
    }, (err) => {
      assert.fail("should not receive error");
    }).finally(done);
    tokenSource.cancel();
  });
  test("throwing an error", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
      throw new Error(`nope`);
    }, "delegate");
    bProxy.$m(4, 1).then((res) => {
      assert.fail("unexpected");
    }, (err) => {
      assert.strictEqual(err.message, "nope");
    }).finally(done);
  });
  test("error promise", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
      return Promise.reject(void 0);
    }, "delegate");
    bProxy.$m(4, 1).then((res) => {
      assert.fail("unexpected");
    }, (err) => {
      assert.strictEqual(err, void 0);
    }).finally(done);
  });
  test("issue #60450: Converting circular structure to JSON", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
      const circular = {};
      circular.self = circular;
      return circular;
    }, "delegate");
    bProxy.$m(4, 1).then((res) => {
      assert.strictEqual(res, null);
    }, (err) => {
      assert.fail("unexpected");
    }).finally(done);
  });
  test("issue #72798: null errors are hard to digest", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
      throw { "what": "what" };
    }, "delegate");
    bProxy.$m(4, 1).then((res) => {
      assert.fail("unexpected");
    }, (err) => {
      assert.strictEqual(err.what, "what");
    }).finally(done);
  });
  test("undefined arguments arrive as null", function() {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
      assert.strictEqual(typeof a1, "undefined");
      assert.strictEqual(a2, null);
      return 7;
    }, "delegate");
    return bProxy.$m(void 0, null).then((res) => {
      assert.strictEqual(res, 7);
    });
  });
  test("issue #81424: SerializeRequest should throw if an argument can not be serialized", () => {
    const badObject = {};
    badObject.loop = badObject;
    assert.throws(() => {
      bProxy.$m(badObject, "2");
    });
  });
  test("SerializableObjectWithBuffers is correctly transfered", function(done) {
    delegate = /* @__PURE__ */ __name((a1, a2) => {
      return new SerializableObjectWithBuffers({ string: a1.value.string + " world", buff: a1.value.buff });
    }, "delegate");
    const b = VSBuffer.alloc(4);
    b.buffer[0] = 1;
    b.buffer[1] = 2;
    b.buffer[2] = 3;
    b.buffer[3] = 4;
    bProxy.$m(new SerializableObjectWithBuffers({ string: "hello", buff: b }), void 0).then((res) => {
      assert.ok(res instanceof SerializableObjectWithBuffers);
      assert.strictEqual(res.value.string, "hello world");
      assert.ok(res.value.buff instanceof VSBuffer);
      const bufferValues = Array.from(res.value.buff.buffer);
      assert.strictEqual(bufferValues[0], 1);
      assert.strictEqual(bufferValues[1], 2);
      assert.strictEqual(bufferValues[2], 3);
      assert.strictEqual(bufferValues[3], 4);
      done(null);
    }, done);
  });
});
//# sourceMappingURL=rpcProtocol.test.js.map
