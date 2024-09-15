var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { GlyphMarginLanesModel } from "../../../common/viewModel/glyphLanesModel.js";
import { Range } from "../../../common/core/range.js";
import { GlyphMarginLane } from "../../../common/model.js";
suite("GlyphLanesModel", () => {
  let model;
  ensureNoDisposablesAreLeakedInTestSuite();
  const lineRange = /* @__PURE__ */ __name((startLineNumber, endLineNumber) => new Range(startLineNumber, 1, endLineNumber, 1), "lineRange");
  const assertLines = /* @__PURE__ */ __name((fromLine, n, expected) => {
    const result = [];
    for (let i = 0; i < n; i++) {
      result.push(model.getLanesAtLine(fromLine + i));
    }
    assert.deepStrictEqual(result, expected, `fromLine: ${fromLine}, n: ${n}`);
  }, "assertLines");
  setup(() => {
    model = new GlyphMarginLanesModel(10);
  });
  test("handles empty", () => {
    assert.equal(model.requiredLanes, 1);
    assertLines(1, 1, [
      [GlyphMarginLane.Center]
    ]);
  });
  test("works with a single line range", () => {
    model.push(GlyphMarginLane.Left, lineRange(2, 3));
    assert.equal(model.requiredLanes, 1);
    assertLines(1, 5, [
      [GlyphMarginLane.Center],
      // 1
      [GlyphMarginLane.Left],
      // 2
      [GlyphMarginLane.Left],
      // 3
      [GlyphMarginLane.Center],
      // 4
      [GlyphMarginLane.Center]
      // 5
    ]);
  });
  test("persists ranges", () => {
    model.push(GlyphMarginLane.Left, lineRange(2, 3), true);
    assert.equal(model.requiredLanes, 1);
    assertLines(1, 5, [
      [GlyphMarginLane.Left],
      // 1
      [GlyphMarginLane.Left],
      // 2
      [GlyphMarginLane.Left],
      // 3
      [GlyphMarginLane.Left],
      // 4
      [GlyphMarginLane.Left]
      // 5
    ]);
  });
  test("handles overlaps", () => {
    model.push(GlyphMarginLane.Left, lineRange(6, 9));
    model.push(GlyphMarginLane.Right, lineRange(5, 7));
    model.push(GlyphMarginLane.Center, lineRange(7, 8));
    assert.equal(model.requiredLanes, 3);
    assertLines(5, 6, [
      [GlyphMarginLane.Right],
      // 5
      [GlyphMarginLane.Left, GlyphMarginLane.Right],
      // 6
      [GlyphMarginLane.Left, GlyphMarginLane.Center, GlyphMarginLane.Right],
      // 7
      [GlyphMarginLane.Left, GlyphMarginLane.Center],
      // 8
      [GlyphMarginLane.Left],
      // 9
      [GlyphMarginLane.Center]
      // 10
    ]);
  });
});
//# sourceMappingURL=glyphLanesModel.test.js.map
