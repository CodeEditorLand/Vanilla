import assert from "assert";
import { Iterable } from "../../common/iterator.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Iterable", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const customIterable = new class {
    *[Symbol.iterator]() {
      yield "one";
      yield "two";
      yield "three";
    }
  }();
  test("first", () => {
    assert.strictEqual(Iterable.first([]), void 0);
    assert.strictEqual(Iterable.first([1]), 1);
    assert.strictEqual(Iterable.first(customIterable), "one");
    assert.strictEqual(Iterable.first(customIterable), "one");
  });
  test("wrap", () => {
    assert.deepStrictEqual([...Iterable.wrap(1)], [1]);
    assert.deepStrictEqual([...Iterable.wrap([1, 2, 3])], [1, 2, 3]);
  });
});
