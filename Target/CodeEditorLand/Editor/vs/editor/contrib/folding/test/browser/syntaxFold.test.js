import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { createTextModel } from "../../../../test/common/testTextModel.js";
import { SyntaxRangeProvider } from "../../browser/syntaxRangeProvider.js";
class TestFoldingRangeProvider {
  constructor(model, ranges) {
    this.model = model;
    this.ranges = ranges;
  }
  provideFoldingRanges(model, context, token) {
    if (model === this.model) {
      return this.ranges;
    }
    return null;
  }
}
suite("Syntax folding", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function r(start, end) {
    return { start, end };
  }
  test("Limit by nesting level", async () => {
    const lines = [
      /* 1*/
      "{",
      /* 2*/
      "  A",
      /* 3*/
      "  {",
      /* 4*/
      "    {",
      /* 5*/
      "      B",
      /* 6*/
      "    }",
      /* 7*/
      "    {",
      /* 8*/
      "      A",
      /* 9*/
      "      {",
      /* 10*/
      "         A",
      /* 11*/
      "      }",
      /* 12*/
      "      {",
      /* 13*/
      "        {",
      /* 14*/
      "          {",
      /* 15*/
      "             A",
      /* 16*/
      "          }",
      /* 17*/
      "        }",
      /* 18*/
      "      }",
      /* 19*/
      "    }",
      /* 20*/
      "  }",
      /* 21*/
      "}",
      /* 22*/
      "{",
      /* 23*/
      "  A",
      /* 24*/
      "}"
    ];
    const r1 = r(1, 20);
    const r2 = r(3, 19);
    const r3 = r(4, 5);
    const r4 = r(7, 18);
    const r5 = r(9, 10);
    const r6 = r(12, 17);
    const r7 = r(13, 16);
    const r8 = r(14, 15);
    const r9 = r(22, 23);
    const model = createTextModel(lines.join("\n"));
    const ranges = [r1, r2, r3, r4, r5, r6, r7, r8, r9];
    const providers = [new TestFoldingRangeProvider(model, ranges)];
    async function assertLimit(maxEntries, expectedRanges, message) {
      let reported = false;
      const foldingRangesLimit = {
        limit: maxEntries,
        update: (computed, limited) => reported = limited
      };
      const syntaxRangeProvider = new SyntaxRangeProvider(
        model,
        providers,
        () => {
        },
        foldingRangesLimit,
        void 0
      );
      try {
        const indentRanges = await syntaxRangeProvider.compute(
          CancellationToken.None
        );
        const actual = [];
        if (indentRanges) {
          for (let i = 0; i < indentRanges.length; i++) {
            actual.push({
              start: indentRanges.getStartLineNumber(i),
              end: indentRanges.getEndLineNumber(i)
            });
          }
          assert.equal(
            reported,
            maxEntries >= 9 ? false : maxEntries,
            "limited"
          );
        }
        assert.deepStrictEqual(actual, expectedRanges, message);
      } finally {
        syntaxRangeProvider.dispose();
      }
    }
    await assertLimit(1e3, [r1, r2, r3, r4, r5, r6, r7, r8, r9], "1000");
    await assertLimit(9, [r1, r2, r3, r4, r5, r6, r7, r8, r9], "9");
    await assertLimit(8, [r1, r2, r3, r4, r5, r6, r7, r9], "8");
    await assertLimit(7, [r1, r2, r3, r4, r5, r6, r9], "7");
    await assertLimit(6, [r1, r2, r3, r4, r5, r9], "6");
    await assertLimit(5, [r1, r2, r3, r4, r9], "5");
    await assertLimit(4, [r1, r2, r3, r9], "4");
    await assertLimit(3, [r1, r2, r9], "3");
    await assertLimit(2, [r1, r9], "2");
    await assertLimit(1, [r1], "1");
    await assertLimit(0, [], "0");
    model.dispose();
  });
});
