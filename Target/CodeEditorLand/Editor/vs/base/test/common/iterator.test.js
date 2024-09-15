import assert from "assert";
import { Iterable } from "../../common/iterator.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Iterable", function() {
  ensureNoDisposablesAreLeakedInTestSuite();
  const customIterable = new class {
    *[Symbol.iterator]() {
      yield "one";
      yield "two";
      yield "three";
    }
  }();
  test("first", function() {
    assert.strictEqual(Iterable.first([]), void 0);
    assert.strictEqual(Iterable.first([1]), 1);
    assert.strictEqual(Iterable.first(customIterable), "one");
    assert.strictEqual(Iterable.first(customIterable), "one");
  });
  test("wrap", function() {
    assert.deepStrictEqual([...Iterable.wrap(1)], [1]);
    assert.deepStrictEqual([...Iterable.wrap([1, 2, 3])], [1, 2, 3]);
  });
});
//# sourceMappingURL=iterator.test.js.map
