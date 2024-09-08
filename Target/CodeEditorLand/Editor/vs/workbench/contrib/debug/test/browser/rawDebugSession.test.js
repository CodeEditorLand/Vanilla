import assert from "assert";
import { mock, mockObject } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { RawDebugSession } from "../../browser/rawDebugSession.js";
import { MockDebugAdapter } from "../common/mockDebug.js";
suite("RawDebugSession", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  function createTestObjects() {
    const debugAdapter = new MockDebugAdapter();
    const dbgr = mockObject()({
      type: "mock-debug"
    });
    const session = new RawDebugSession(
      debugAdapter,
      dbgr,
      "sessionId",
      "name",
      new (mock())(),
      new (mock())(),
      new (mock())(),
      new (mock())()
    );
    disposables.add(session);
    disposables.add(debugAdapter);
    return { debugAdapter, dbgr };
  }
  test("handles startDebugging request success", async () => {
    const { debugAdapter, dbgr } = createTestObjects();
    dbgr.startDebugging.returns(Promise.resolve(true));
    debugAdapter.sendRequestBody("startDebugging", {
      request: "launch",
      configuration: {
        type: "some-other-type"
      }
    });
    const response = await debugAdapter.waitForResponseFromClient("startDebugging");
    assert.strictEqual(response.command, "startDebugging");
    assert.strictEqual(response.success, true);
  });
  test("handles startDebugging request failure", async () => {
    const { debugAdapter, dbgr } = createTestObjects();
    dbgr.startDebugging.returns(Promise.resolve(false));
    debugAdapter.sendRequestBody("startDebugging", {
      request: "launch",
      configuration: {
        type: "some-other-type"
      }
    });
    const response = await debugAdapter.waitForResponseFromClient("startDebugging");
    assert.strictEqual(response.command, "startDebugging");
    assert.strictEqual(response.success, false);
  });
});
