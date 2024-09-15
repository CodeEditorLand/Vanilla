var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { OffsetRange } from "../../../common/core/offsetRange.js";
import { StringText } from "../../../common/core/textEdit.js";
import { Random } from "./random.js";
suite("TextEdit", () => {
  suite("inverse", () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    function runTest(seed) {
      const rand = Random.create(seed);
      const source = new StringText(rand.nextMultiLineString(10, new OffsetRange(0, 10)));
      const edit = rand.nextTextEdit(source, rand.nextIntRange(1, 5));
      const invEdit = edit.inverse(source);
      const s1 = edit.apply(source);
      const s2 = invEdit.applyToString(s1);
      assert.deepStrictEqual(s2, source.value);
    }
    __name(runTest, "runTest");
    test.skip("brute-force", () => {
      for (let i = 0; i < 1e5; i++) {
        runTest(i);
      }
    });
    for (let seed = 0; seed < 20; seed++) {
      test(`test ${seed}`, () => runTest(seed));
    }
  });
});
//# sourceMappingURL=textEdit.test.js.map
