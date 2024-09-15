import assert from "assert";
import { Lazy } from "../../common/lazy.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Lazy", () => {
  test("lazy values should only be resolved once", () => {
    let counter = 0;
    const value = new Lazy(() => ++counter);
    assert.strictEqual(value.hasValue, false);
    assert.strictEqual(value.value, 1);
    assert.strictEqual(value.hasValue, true);
    assert.strictEqual(value.value, 1);
  });
  test("lazy values handle error case", () => {
    let counter = 0;
    const value = new Lazy(() => {
      throw new Error(`${++counter}`);
    });
    assert.strictEqual(value.hasValue, false);
    assert.throws(() => value.value, /\b1\b/);
    assert.strictEqual(value.hasValue, true);
    assert.throws(() => value.value, /\b1\b/);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=lazy.test.js.map
