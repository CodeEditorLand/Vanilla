import assert from "assert";
import { IntervalTimer } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { asProgressiveEdit } from "../../browser/utils.js";
suite("AsyncEdit", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("asProgressiveEdit", async () => {
    const interval = new IntervalTimer();
    const edit = {
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      },
      text: "Hello, world!"
    };
    const cts = new CancellationTokenSource();
    const result = asProgressiveEdit(interval, edit, 5, cts.token);
    assert.deepStrictEqual(result.range, edit.range);
    const iter = result.newText[Symbol.asyncIterator]();
    const a = await iter.next();
    assert.strictEqual(a.value, "Hello,");
    assert.strictEqual(a.done, false);
    const b = await iter.next();
    assert.strictEqual(b.value, " world!");
    assert.strictEqual(b.done, false);
    const c = await iter.next();
    assert.strictEqual(c.value, void 0);
    assert.strictEqual(c.done, true);
    cts.dispose();
  });
  test("asProgressiveEdit - cancellation", async () => {
    const interval = new IntervalTimer();
    const edit = {
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      },
      text: "Hello, world!"
    };
    const cts = new CancellationTokenSource();
    const result = asProgressiveEdit(interval, edit, 5, cts.token);
    assert.deepStrictEqual(result.range, edit.range);
    const iter = result.newText[Symbol.asyncIterator]();
    const a = await iter.next();
    assert.strictEqual(a.value, "Hello,");
    assert.strictEqual(a.done, false);
    cts.dispose(true);
    const c = await iter.next();
    assert.strictEqual(c.value, void 0);
    assert.strictEqual(c.done, true);
  });
});
