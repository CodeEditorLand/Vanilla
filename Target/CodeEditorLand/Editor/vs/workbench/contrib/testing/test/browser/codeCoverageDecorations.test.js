var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertSnapshot } from "../../../../../base/test/common/snapshot.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Position } from "../../../../../editor/common/core/position.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { CoverageDetailsModel } from "../../browser/codeCoverageDecorations.js";
import { CoverageDetails, DetailType } from "../../common/testTypes.js";
suite("Code Coverage Decorations", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const textModel = { getValueInRange: /* @__PURE__ */ __name(() => "", "getValueInRange") };
  const assertRanges = /* @__PURE__ */ __name(async (model) => await assertSnapshot(model.ranges.map((r) => ({
    range: r.range.toString(),
    count: r.metadata.detail.type === DetailType.Branch ? r.metadata.detail.detail.branches[r.metadata.detail.branch].count : r.metadata.detail.count
  }))), "assertRanges");
  test("CoverageDetailsModel#1", async () => {
    const details = [
      { location: new Range(1, 0, 5, 0), type: DetailType.Statement, count: 1 },
      { location: new Range(2, 0, 3, 0), type: DetailType.Statement, count: 2 },
      { location: new Range(4, 0, 6, 0), type: DetailType.Statement, branches: [{ location: new Range(3, 0, 7, 0), count: 3 }], count: 4 }
    ];
    const model = new CoverageDetailsModel(details, textModel);
    await assertRanges(model);
  });
  test("CoverageDetailsModel#2", async () => {
    const details = [
      { location: new Range(1, 0, 5, 0), type: DetailType.Statement, count: 1 },
      { location: new Range(2, 0, 4, 0), type: DetailType.Statement, count: 2 },
      { location: new Range(3, 0, 3, 5), type: DetailType.Statement, count: 3 }
    ];
    const model = new CoverageDetailsModel(details, textModel);
    await assertRanges(model);
  });
  test("CoverageDetailsModel#3", async () => {
    const details = [
      { location: new Range(1, 0, 5, 0), type: DetailType.Statement, count: 1 },
      { location: new Range(2, 0, 3, 0), type: DetailType.Statement, count: 2 },
      { location: new Range(4, 0, 5, 0), type: DetailType.Statement, count: 3 }
    ];
    const model = new CoverageDetailsModel(details, textModel);
    await assertRanges(model);
  });
  test("CoverageDetailsModel#4", async () => {
    const details = [
      { location: new Range(1, 0, 5, 0), type: DetailType.Statement, count: 1 },
      { location: new Position(2, 0), type: DetailType.Statement, count: 2 },
      { location: new Range(4, 0, 5, 0), type: DetailType.Statement, count: 3 },
      { location: new Position(4, 3), type: DetailType.Statement, count: 4 }
    ];
    const model = new CoverageDetailsModel(details, textModel);
    await assertRanges(model);
  });
});
//# sourceMappingURL=codeCoverageDecorations.test.js.map
