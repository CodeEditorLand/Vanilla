var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual, strictEqual, throws } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { createObjectCollectionBuffer } from "../../../../browser/gpu/objectCollectionBuffer.js";
suite("ObjectCollectionBuffer", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  function assertUsedData(buffer, expected) {
    deepStrictEqual(Array.from(buffer.view.subarray(0, buffer.viewUsedSize)), expected);
  }
  __name(assertUsedData, "assertUsedData");
  test("createEntry", () => {
    const buffer = store.add(createObjectCollectionBuffer([
      { name: "a" },
      { name: "b" }
    ], 5));
    assertUsedData(buffer, []);
    store.add(buffer.createEntry({ a: 1, b: 2 }));
    store.add(buffer.createEntry({ a: 3, b: 4 }));
    store.add(buffer.createEntry({ a: 5, b: 6 }));
    store.add(buffer.createEntry({ a: 7, b: 8 }));
    store.add(buffer.createEntry({ a: 9, b: 10 }));
    assertUsedData(buffer, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  test("createEntry beyond capacity", () => {
    const buffer = store.add(createObjectCollectionBuffer([
      { name: "a" },
      { name: "b" }
    ], 1));
    store.add(buffer.createEntry({ a: 1, b: 2 }));
    throws(() => buffer.createEntry({ a: 3, b: 4 }));
  });
  test("dispose entry", () => {
    const buffer = store.add(createObjectCollectionBuffer([
      { name: "a" },
      { name: "b" }
    ], 5));
    store.add(buffer.createEntry({ a: 1, b: 2 }));
    const entry1 = buffer.createEntry({ a: 3, b: 4 });
    store.add(buffer.createEntry({ a: 5, b: 6 }));
    const entry2 = buffer.createEntry({ a: 7, b: 8 });
    store.add(buffer.createEntry({ a: 9, b: 10 }));
    entry1.dispose();
    entry2.dispose();
    assertUsedData(buffer, [1, 2, 5, 6, 9, 10]);
  });
  test("entry.get", () => {
    const buffer = store.add(createObjectCollectionBuffer([
      { name: "foo" },
      { name: "bar" }
    ], 5));
    const entry = store.add(buffer.createEntry({ foo: 1, bar: 2 }));
    strictEqual(entry.get("foo"), 1);
    strictEqual(entry.get("bar"), 2);
  });
  test("entry.set", () => {
    const buffer = store.add(createObjectCollectionBuffer([
      { name: "foo" },
      { name: "bar" }
    ], 5));
    const entry = store.add(buffer.createEntry({ foo: 1, bar: 2 }));
    let changeCount = 0;
    store.add(buffer.onDidChange(() => changeCount++));
    entry.set("foo", 3);
    strictEqual(changeCount, 1);
    strictEqual(entry.get("foo"), 3);
    entry.set("bar", 4);
    strictEqual(changeCount, 2);
    strictEqual(entry.get("bar"), 4);
  });
});
//# sourceMappingURL=objectCollectionBuffer.test.js.map
