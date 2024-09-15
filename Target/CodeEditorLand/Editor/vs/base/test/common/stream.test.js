var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { timeout } from "../../common/async.js";
import { bufferToReadable, VSBuffer } from "../../common/buffer.js";
import { CancellationTokenSource } from "../../common/cancellation.js";
import { consumeReadable, consumeStream, isReadable, isReadableBufferedStream, isReadableStream, listenStream, newWriteableStream, peekReadable, peekStream, prefixedReadable, prefixedStream, Readable, ReadableStream, toReadable, toStream, transform } from "../../common/stream.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Stream", () => {
  test("isReadable", () => {
    assert.ok(!isReadable(void 0));
    assert.ok(!isReadable(/* @__PURE__ */ Object.create(null)));
    assert.ok(isReadable(bufferToReadable(VSBuffer.fromString(""))));
  });
  test("isReadableStream", () => {
    assert.ok(!isReadableStream(void 0));
    assert.ok(!isReadableStream(/* @__PURE__ */ Object.create(null)));
    assert.ok(isReadableStream(newWriteableStream((d) => d)));
  });
  test("isReadableBufferedStream", async () => {
    assert.ok(!isReadableBufferedStream(/* @__PURE__ */ Object.create(null)));
    const stream = newWriteableStream((d) => d);
    stream.end();
    const bufferedStream = await peekStream(stream, 1);
    assert.ok(isReadableBufferedStream(bufferedStream));
  });
  test("WriteableStream - basics", () => {
    const stream = newWriteableStream((strings) => strings.join());
    let error = false;
    stream.on("error", (e) => {
      error = true;
    });
    let end = false;
    stream.on("end", () => {
      end = true;
    });
    stream.write("Hello");
    const chunks = [];
    stream.on("data", (data) => {
      chunks.push(data);
    });
    assert.strictEqual(chunks[0], "Hello");
    stream.write("World");
    assert.strictEqual(chunks[1], "World");
    assert.strictEqual(error, false);
    assert.strictEqual(end, false);
    stream.pause();
    stream.write("1");
    stream.write("2");
    stream.write("3");
    assert.strictEqual(chunks.length, 2);
    stream.resume();
    assert.strictEqual(chunks.length, 3);
    assert.strictEqual(chunks[2], "1,2,3");
    stream.error(new Error());
    assert.strictEqual(error, true);
    error = false;
    stream.error(new Error());
    assert.strictEqual(error, true);
    stream.end("Final Bit");
    assert.strictEqual(chunks.length, 4);
    assert.strictEqual(chunks[3], "Final Bit");
    assert.strictEqual(end, true);
    stream.destroy();
    stream.write("Unexpected");
    assert.strictEqual(chunks.length, 4);
  });
  test("WriteableStream - end with empty string works", async () => {
    const reducer = /* @__PURE__ */ __name((strings) => strings.length > 0 ? strings.join() : "error", "reducer");
    const stream = newWriteableStream(reducer);
    stream.end("");
    const result = await consumeStream(stream, reducer);
    assert.strictEqual(result, "");
  });
  test("WriteableStream - end with error works", async () => {
    const reducer = /* @__PURE__ */ __name((errors) => errors[0], "reducer");
    const stream = newWriteableStream(reducer);
    stream.end(new Error("error"));
    const result = await consumeStream(stream, reducer);
    assert.ok(result instanceof Error);
  });
  test("WriteableStream - removeListener", () => {
    const stream = newWriteableStream((strings) => strings.join());
    let error = false;
    const errorListener = /* @__PURE__ */ __name((e) => {
      error = true;
    }, "errorListener");
    stream.on("error", errorListener);
    let data = false;
    const dataListener = /* @__PURE__ */ __name(() => {
      data = true;
    }, "dataListener");
    stream.on("data", dataListener);
    stream.write("Hello");
    assert.strictEqual(data, true);
    data = false;
    stream.removeListener("data", dataListener);
    stream.write("World");
    assert.strictEqual(data, false);
    stream.error(new Error());
    assert.strictEqual(error, true);
    error = false;
    stream.removeListener("error", errorListener);
    stream.on("error", () => {
    });
    stream.error(new Error());
    assert.strictEqual(error, false);
  });
  test("WriteableStream - highWaterMark", async () => {
    const stream = newWriteableStream((strings) => strings.join(), { highWaterMark: 3 });
    let res = stream.write("1");
    assert.ok(!res);
    res = stream.write("2");
    assert.ok(!res);
    res = stream.write("3");
    assert.ok(!res);
    const promise1 = stream.write("4");
    assert.ok(promise1 instanceof Promise);
    const promise2 = stream.write("5");
    assert.ok(promise2 instanceof Promise);
    let drained1 = false;
    (async () => {
      await promise1;
      drained1 = true;
    })();
    let drained2 = false;
    (async () => {
      await promise2;
      drained2 = true;
    })();
    let data = void 0;
    stream.on("data", (chunk) => {
      data = chunk;
    });
    assert.ok(data);
    await timeout(0);
    assert.strictEqual(drained1, true);
    assert.strictEqual(drained2, true);
  });
  test("consumeReadable", () => {
    const readable = arrayToReadable(["1", "2", "3", "4", "5"]);
    const consumed = consumeReadable(readable, (strings) => strings.join());
    assert.strictEqual(consumed, "1,2,3,4,5");
  });
  test("peekReadable", () => {
    for (let i = 0; i < 5; i++) {
      const readable2 = arrayToReadable(["1", "2", "3", "4", "5"]);
      const consumedOrReadable2 = peekReadable(readable2, (strings) => strings.join(), i);
      if (typeof consumedOrReadable2 === "string") {
        assert.fail("Unexpected result");
      } else {
        const consumed = consumeReadable(consumedOrReadable2, (strings) => strings.join());
        assert.strictEqual(consumed, "1,2,3,4,5");
      }
    }
    let readable = arrayToReadable(["1", "2", "3", "4", "5"]);
    let consumedOrReadable = peekReadable(readable, (strings) => strings.join(), 5);
    assert.strictEqual(consumedOrReadable, "1,2,3,4,5");
    readable = arrayToReadable(["1", "2", "3", "4", "5"]);
    consumedOrReadable = peekReadable(readable, (strings) => strings.join(), 6);
    assert.strictEqual(consumedOrReadable, "1,2,3,4,5");
  });
  test("peekReadable - error handling", async () => {
    let stream = newWriteableStream((data) => data);
    let error = void 0;
    let promise = (async () => {
      try {
        await peekStream(stream, 1);
      } catch (err) {
        error = err;
      }
    })();
    stream.error(new Error());
    await promise;
    assert.ok(error);
    stream = newWriteableStream((data) => data);
    error = void 0;
    promise = (async () => {
      try {
        await peekStream(stream, 1);
      } catch (err) {
        error = err;
      }
    })();
    stream.write("foo");
    stream.error(new Error());
    await promise;
    assert.ok(error);
    stream = newWriteableStream((data) => data);
    error = void 0;
    promise = (async () => {
      try {
        await peekStream(stream, 1);
      } catch (err) {
        error = err;
      }
    })();
    stream.write("foo");
    stream.write("bar");
    stream.error(new Error());
    await promise;
    assert.ok(!error);
    stream.on("error", (err) => error = err);
    stream.on("data", (chunk) => {
    });
    assert.ok(error);
  });
  function arrayToReadable(array) {
    return {
      read: /* @__PURE__ */ __name(() => array.shift() || null, "read")
    };
  }
  __name(arrayToReadable, "arrayToReadable");
  function readableToStream(readable) {
    const stream = newWriteableStream((strings) => strings.join());
    setTimeout(() => {
      let chunk = null;
      while ((chunk = readable.read()) !== null) {
        stream.write(chunk);
      }
      stream.end();
    }, 0);
    return stream;
  }
  __name(readableToStream, "readableToStream");
  test("consumeStream", async () => {
    const stream = readableToStream(arrayToReadable(["1", "2", "3", "4", "5"]));
    const consumed = await consumeStream(stream, (strings) => strings.join());
    assert.strictEqual(consumed, "1,2,3,4,5");
  });
  test("consumeStream - without reducer", async () => {
    const stream = readableToStream(arrayToReadable(["1", "2", "3", "4", "5"]));
    const consumed = await consumeStream(stream);
    assert.strictEqual(consumed, void 0);
  });
  test("consumeStream - without reducer and error", async () => {
    const stream = newWriteableStream((strings) => strings.join());
    stream.error(new Error());
    const consumed = await consumeStream(stream);
    assert.strictEqual(consumed, void 0);
  });
  test("listenStream", () => {
    const stream = newWriteableStream((strings) => strings.join());
    let error = false;
    let end = false;
    let data = "";
    listenStream(stream, {
      onData: /* @__PURE__ */ __name((d) => {
        data = d;
      }, "onData"),
      onError: /* @__PURE__ */ __name((e) => {
        error = true;
      }, "onError"),
      onEnd: /* @__PURE__ */ __name(() => {
        end = true;
      }, "onEnd")
    });
    stream.write("Hello");
    assert.strictEqual(data, "Hello");
    stream.write("World");
    assert.strictEqual(data, "World");
    assert.strictEqual(error, false);
    assert.strictEqual(end, false);
    stream.error(new Error());
    assert.strictEqual(error, true);
    stream.end("Final Bit");
    assert.strictEqual(end, true);
  });
  test("listenStream - cancellation", () => {
    const stream = newWriteableStream((strings) => strings.join());
    let error = false;
    let end = false;
    let data = "";
    const cts = new CancellationTokenSource();
    listenStream(stream, {
      onData: /* @__PURE__ */ __name((d) => {
        data = d;
      }, "onData"),
      onError: /* @__PURE__ */ __name((e) => {
        error = true;
      }, "onError"),
      onEnd: /* @__PURE__ */ __name(() => {
        end = true;
      }, "onEnd")
    }, cts.token);
    cts.cancel();
    stream.write("Hello");
    assert.strictEqual(data, "");
    stream.write("World");
    assert.strictEqual(data, "");
    stream.error(new Error());
    assert.strictEqual(error, false);
    stream.end("Final Bit");
    assert.strictEqual(end, false);
  });
  test("peekStream", async () => {
    for (let i = 0; i < 5; i++) {
      const stream2 = readableToStream(arrayToReadable(["1", "2", "3", "4", "5"]));
      const result2 = await peekStream(stream2, i);
      assert.strictEqual(stream2, result2.stream);
      if (result2.ended) {
        assert.fail("Unexpected result, stream should not have ended yet");
      } else {
        assert.strictEqual(result2.buffer.length, i + 1, `maxChunks: ${i}`);
        const additionalResult = [];
        await consumeStream(stream2, (strings) => {
          additionalResult.push(...strings);
          return strings.join();
        });
        assert.strictEqual([...result2.buffer, ...additionalResult].join(), "1,2,3,4,5");
      }
    }
    let stream = readableToStream(arrayToReadable(["1", "2", "3", "4", "5"]));
    let result = await peekStream(stream, 5);
    assert.strictEqual(stream, result.stream);
    assert.strictEqual(result.buffer.join(), "1,2,3,4,5");
    assert.strictEqual(result.ended, true);
    stream = readableToStream(arrayToReadable(["1", "2", "3", "4", "5"]));
    result = await peekStream(stream, 6);
    assert.strictEqual(stream, result.stream);
    assert.strictEqual(result.buffer.join(), "1,2,3,4,5");
    assert.strictEqual(result.ended, true);
  });
  test("toStream", async () => {
    const stream = toStream("1,2,3,4,5", (strings) => strings.join());
    const consumed = await consumeStream(stream, (strings) => strings.join());
    assert.strictEqual(consumed, "1,2,3,4,5");
  });
  test("toReadable", async () => {
    const readable = toReadable("1,2,3,4,5");
    const consumed = consumeReadable(readable, (strings) => strings.join());
    assert.strictEqual(consumed, "1,2,3,4,5");
  });
  test("transform", async () => {
    const source = newWriteableStream((strings) => strings.join());
    const result = transform(source, { data: /* @__PURE__ */ __name((string) => string + string, "data") }, (strings) => strings.join());
    setTimeout(() => {
      source.write("1");
      source.write("2");
      source.write("3");
      source.write("4");
      source.end("5");
    }, 0);
    const consumed = await consumeStream(result, (strings) => strings.join());
    assert.strictEqual(consumed, "11,22,33,44,55");
  });
  test("events are delivered even if a listener is removed during delivery", () => {
    const stream = newWriteableStream((strings) => strings.join());
    let listener1Called = false;
    let listener2Called = false;
    const listener1 = /* @__PURE__ */ __name(() => {
      stream.removeListener("end", listener1);
      listener1Called = true;
    }, "listener1");
    const listener2 = /* @__PURE__ */ __name(() => {
      listener2Called = true;
    }, "listener2");
    stream.on("end", listener1);
    stream.on("end", listener2);
    stream.on("data", () => {
    });
    stream.end("");
    assert.strictEqual(listener1Called, true);
    assert.strictEqual(listener2Called, true);
  });
  test("prefixedReadable", () => {
    let readable = prefixedReadable("1,2", arrayToReadable(["3", "4", "5"]), (val) => val.join(","));
    assert.strictEqual(consumeReadable(readable, (val) => val.join(",")), "1,2,3,4,5");
    readable = prefixedReadable("empty", arrayToReadable([]), (val) => val.join(","));
    assert.strictEqual(consumeReadable(readable, (val) => val.join(",")), "empty");
  });
  test("prefixedStream", async () => {
    let stream = newWriteableStream((strings) => strings.join());
    stream.write("3");
    stream.write("4");
    stream.write("5");
    stream.end();
    let prefixStream = prefixedStream("1,2", stream, (val) => val.join(","));
    assert.strictEqual(await consumeStream(prefixStream, (val) => val.join(",")), "1,2,3,4,5");
    stream = newWriteableStream((strings) => strings.join());
    stream.end();
    prefixStream = prefixedStream("1,2", stream, (val) => val.join(","));
    assert.strictEqual(await consumeStream(prefixStream, (val) => val.join(",")), "1,2");
    stream = newWriteableStream((strings) => strings.join());
    stream.error(new Error("fail"));
    prefixStream = prefixedStream("error", stream, (val) => val.join(","));
    let error;
    try {
      await consumeStream(prefixStream, (val) => val.join(","));
    } catch (e) {
      error = e;
    }
    assert.ok(error);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=stream.test.js.map
