import assert from "assert";
import { runWithFakedTimers } from "../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { AsyncProgress } from "../../common/progress.js";
suite("Progress", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("multiple report calls are processed in sequence", async () => {
    await runWithFakedTimers(
      { useFakeTimers: true, maxTaskCount: 100 },
      async () => {
        const executionOrder = [];
        const timeout = (time) => {
          return new Promise(
            (resolve) => setTimeout(resolve, time)
          );
        };
        const executor = async (value) => {
          executionOrder.push(`start ${value}`);
          if (value === 1) {
            await timeout(100);
          } else if (value === 2) {
            await timeout(50);
          } else {
            await timeout(10);
          }
          executionOrder.push(`end ${value}`);
        };
        const progress = new AsyncProgress(executor);
        progress.report(1);
        progress.report(2);
        progress.report(3);
        await timeout(1e3);
        assert.deepStrictEqual(executionOrder, [
          "start 1",
          "end 1",
          "start 2",
          "end 2",
          "start 3",
          "end 3"
        ]);
      }
    );
  });
});
