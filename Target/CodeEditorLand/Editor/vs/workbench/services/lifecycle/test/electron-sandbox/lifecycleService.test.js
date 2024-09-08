import assert from "assert";
import { timeout } from "../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { workbenchInstantiationService } from "../../../../test/electron-sandbox/workbenchTestServices.js";
import {
  ShutdownReason,
  WillShutdownJoinerOrder
} from "../../common/lifecycle.js";
import { NativeLifecycleService } from "../../electron-sandbox/lifecycleService.js";
suite("Lifecycleservice", () => {
  let lifecycleService;
  const disposables = new DisposableStore();
  class TestLifecycleService extends NativeLifecycleService {
    testHandleBeforeShutdown(reason) {
      return super.handleBeforeShutdown(reason);
    }
    testHandleWillShutdown(reason) {
      return super.handleWillShutdown(reason);
    }
  }
  setup(async () => {
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    lifecycleService = disposables.add(
      instantiationService.createInstance(TestLifecycleService)
    );
  });
  teardown(async () => {
    disposables.clear();
  });
  test("onBeforeShutdown - final veto called after other vetos", async () => {
    let vetoCalled = false;
    let finalVetoCalled = false;
    const order = [];
    disposables.add(
      lifecycleService.onBeforeShutdown((e) => {
        e.veto(
          new Promise((resolve) => {
            vetoCalled = true;
            order.push(1);
            resolve(false);
          }),
          "test"
        );
      })
    );
    disposables.add(
      lifecycleService.onBeforeShutdown((e) => {
        e.finalVeto(() => {
          return new Promise((resolve) => {
            finalVetoCalled = true;
            order.push(2);
            resolve(true);
          });
        }, "test");
      })
    );
    const veto = await lifecycleService.testHandleBeforeShutdown(
      ShutdownReason.QUIT
    );
    assert.strictEqual(veto, true);
    assert.strictEqual(vetoCalled, true);
    assert.strictEqual(finalVetoCalled, true);
    assert.strictEqual(order[0], 1);
    assert.strictEqual(order[1], 2);
  });
  test("onBeforeShutdown - final veto not called when veto happened before", async () => {
    let vetoCalled = false;
    let finalVetoCalled = false;
    disposables.add(
      lifecycleService.onBeforeShutdown((e) => {
        e.veto(
          new Promise((resolve) => {
            vetoCalled = true;
            resolve(true);
          }),
          "test"
        );
      })
    );
    disposables.add(
      lifecycleService.onBeforeShutdown((e) => {
        e.finalVeto(() => {
          return new Promise((resolve) => {
            finalVetoCalled = true;
            resolve(true);
          });
        }, "test");
      })
    );
    const veto = await lifecycleService.testHandleBeforeShutdown(
      ShutdownReason.QUIT
    );
    assert.strictEqual(veto, true);
    assert.strictEqual(vetoCalled, true);
    assert.strictEqual(finalVetoCalled, false);
  });
  test("onBeforeShutdown - veto with error is treated as veto", async () => {
    disposables.add(
      lifecycleService.onBeforeShutdown((e) => {
        e.veto(
          new Promise((resolve, reject) => {
            reject(new Error("Fail"));
          }),
          "test"
        );
      })
    );
    const veto = await lifecycleService.testHandleBeforeShutdown(
      ShutdownReason.QUIT
    );
    assert.strictEqual(veto, true);
  });
  test("onBeforeShutdown - final veto with error is treated as veto", async () => {
    disposables.add(
      lifecycleService.onBeforeShutdown((e) => {
        e.finalVeto(
          () => new Promise((resolve, reject) => {
            reject(new Error("Fail"));
          }),
          "test"
        );
      })
    );
    const veto = await lifecycleService.testHandleBeforeShutdown(
      ShutdownReason.QUIT
    );
    assert.strictEqual(veto, true);
  });
  test("onWillShutdown - join", async () => {
    let joinCalled = false;
    disposables.add(
      lifecycleService.onWillShutdown((e) => {
        e.join(
          new Promise((resolve) => {
            joinCalled = true;
            resolve();
          }),
          { id: "test", label: "test" }
        );
      })
    );
    await lifecycleService.testHandleWillShutdown(ShutdownReason.QUIT);
    assert.strictEqual(joinCalled, true);
  });
  test("onWillShutdown - join with error is handled", async () => {
    let joinCalled = false;
    disposables.add(
      lifecycleService.onWillShutdown((e) => {
        e.join(
          new Promise((resolve, reject) => {
            joinCalled = true;
            reject(new Error("Fail"));
          }),
          { id: "test", label: "test" }
        );
      })
    );
    await lifecycleService.testHandleWillShutdown(ShutdownReason.QUIT);
    assert.strictEqual(joinCalled, true);
  });
  test("onWillShutdown - join order", async () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const order = [];
    disposables.add(
      lifecycleService.onWillShutdown((e) => {
        e.join(
          async () => {
            order.push("disconnect start");
            await timeout(1);
            order.push("disconnect end");
          },
          {
            id: "test",
            label: "test",
            order: WillShutdownJoinerOrder.Last
          }
        );
        e.join(
          (async () => {
            order.push("default start");
            await timeout(1);
            order.push("default end");
          })(),
          {
            id: "test",
            label: "test",
            order: WillShutdownJoinerOrder.Default
          }
        );
      })
    );
    await lifecycleService.testHandleWillShutdown(ShutdownReason.QUIT);
    assert.deepStrictEqual(order, [
      "default start",
      "default end",
      "disconnect start",
      "disconnect end"
    ]);
  }));
  ensureNoDisposablesAreLeakedInTestSuite();
});
