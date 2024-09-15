var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ArrayEdit, MonotonousIndexTransformer, SingleArrayEdit } from "../../browser/arrayOperation.js";
suite("array operation", () => {
  function seq(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }
  __name(seq, "seq");
  test("simple", () => {
    const edit = new ArrayEdit([
      new SingleArrayEdit(4, 3, 2),
      new SingleArrayEdit(8, 0, 2),
      new SingleArrayEdit(9, 2, 0)
    ]);
    const arr = seq(0, 15).map((x) => `item${x}`);
    const newArr = arr.slice();
    edit.applyToArray(newArr);
    assert.deepStrictEqual(newArr, [
      "item0",
      "item1",
      "item2",
      "item3",
      void 0,
      void 0,
      "item7",
      void 0,
      void 0,
      "item8",
      "item11",
      "item12",
      "item13",
      "item14"
    ]);
    const transformer = new MonotonousIndexTransformer(edit);
    assert.deepStrictEqual(
      seq(0, 15).map((x) => {
        const t = transformer.transform(x);
        let r = `arr[${x}]: ${arr[x]} -> `;
        if (t !== void 0) {
          r += `newArr[${t}]: ${newArr[t]}`;
        } else {
          r += "undefined";
        }
        return r;
      }),
      [
        "arr[0]: item0 -> newArr[0]: item0",
        "arr[1]: item1 -> newArr[1]: item1",
        "arr[2]: item2 -> newArr[2]: item2",
        "arr[3]: item3 -> newArr[3]: item3",
        "arr[4]: item4 -> undefined",
        "arr[5]: item5 -> undefined",
        "arr[6]: item6 -> undefined",
        "arr[7]: item7 -> newArr[6]: item7",
        "arr[8]: item8 -> newArr[9]: item8",
        "arr[9]: item9 -> undefined",
        "arr[10]: item10 -> undefined",
        "arr[11]: item11 -> newArr[10]: item11",
        "arr[12]: item12 -> newArr[11]: item12",
        "arr[13]: item13 -> newArr[12]: item13",
        "arr[14]: item14 -> newArr[13]: item14"
      ]
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=arrayOperation.test.js.map
