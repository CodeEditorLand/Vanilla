import assert from "assert";
import { disposableTimeout, timeout } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Emitter } from "../../../../base/common/event.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { MainThreadManagedSocket } from "../../browser/mainThreadManagedSockets.js";
suite("MainThreadManagedSockets", () => {
  const ds = ensureNoDisposablesAreLeakedInTestSuite();
  suite("ManagedSocket", () => {
    let extHost;
    let half;
    class ExtHostMock extends mock() {
      onDidFire = new Emitter();
      events = [];
      $remoteSocketWrite(socketId, buffer) {
        this.events.push({ socketId, data: buffer.toString() });
        this.onDidFire.fire();
      }
      $remoteSocketDrain(socketId) {
        this.events.push({ socketId, event: "drain" });
        this.onDidFire.fire();
        return Promise.resolve();
      }
      $remoteSocketEnd(socketId) {
        this.events.push({ socketId, event: "end" });
        this.onDidFire.fire();
      }
      expectEvent(test2, message) {
        if (this.events.some(test2)) {
          return;
        }
        const d = new DisposableStore();
        return new Promise((resolve) => {
          d.add(
            this.onDidFire.event(() => {
              if (this.events.some(test2)) {
                return;
              }
            })
          );
          d.add(
            disposableTimeout(() => {
              throw new Error(
                `Expected ${message} but only had ${JSON.stringify(this.events, null, 2)}`
              );
            }, 1e3)
          );
        }).finally(() => d.dispose());
      }
    }
    setup(() => {
      extHost = new ExtHostMock();
      half = {
        onClose: new Emitter(),
        onData: new Emitter(),
        onEnd: new Emitter()
      };
    });
    async function doConnect() {
      const socket = MainThreadManagedSocket.connect(
        1,
        extHost,
        "/hello",
        "world=true",
        "",
        half
      );
      await extHost.expectEvent(
        (evt) => evt.data && evt.data.startsWith(
          "GET ws://localhost/hello?world=true&skipWebSocketFrames=true HTTP/1.1\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Key:"
        ),
        "websocket open event"
      );
      half.onData.fire(
        VSBuffer.fromString("Opened successfully ;)\r\n\r\n")
      );
      return ds.add(await socket);
    }
    test("connects", async () => {
      await doConnect();
    });
    test("includes trailing connection data", async () => {
      const socketProm = MainThreadManagedSocket.connect(
        1,
        extHost,
        "/hello",
        "world=true",
        "",
        half
      );
      await extHost.expectEvent(
        (evt) => evt.data && evt.data.includes("GET ws://localhost"),
        "websocket open event"
      );
      half.onData.fire(
        VSBuffer.fromString(
          "Opened successfully ;)\r\n\r\nSome trailing data"
        )
      );
      const socket = ds.add(await socketProm);
      const data = [];
      ds.add(socket.onData((d) => data.push(d.toString())));
      await timeout(1);
      assert.deepStrictEqual(data, ["Some trailing data"]);
    });
    test("round trips data", async () => {
      const socket = await doConnect();
      const data = [];
      ds.add(socket.onData((d) => data.push(d.toString())));
      socket.write(VSBuffer.fromString("ping"));
      await extHost.expectEvent(
        (evt) => evt.data === "ping",
        "expected ping"
      );
      half.onData.fire(VSBuffer.fromString("pong"));
      assert.deepStrictEqual(data, ["pong"]);
    });
  });
});
