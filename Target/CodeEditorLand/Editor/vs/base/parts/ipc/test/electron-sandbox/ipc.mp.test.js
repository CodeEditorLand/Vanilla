import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../test/common/utils.js";
import { Client as MessagePortClient } from "../../browser/ipc.mp.js";
suite("IPC, MessagePorts", () => {
  test("message port close event", async () => {
    const { port1, port2 } = new MessageChannel();
    const client1 = new MessagePortClient(port1, "client1");
    const client2 = new MessagePortClient(port2, "client2");
    const whenClosed = new Promise(
      (resolve) => port1.addEventListener("close", () => resolve(true))
    );
    client2.dispose();
    assert.ok(await whenClosed);
    client1.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
