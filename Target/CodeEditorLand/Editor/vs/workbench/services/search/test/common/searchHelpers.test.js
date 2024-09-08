import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Range } from "../../../../../editor/common/core/range.js";
import {
  FindMatch
} from "../../../../../editor/common/model.js";
import {
  QueryType
} from "../../common/search.js";
import {
  editorMatchesToTextSearchResults,
  getTextSearchMatchWithModelContext
} from "../../common/searchHelpers.js";
suite("SearchHelpers", () => {
  suite("editorMatchesToTextSearchResults", () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    const mockTextModel = {
      getLineContent(lineNumber) {
        return "" + lineNumber;
      }
    };
    function assertRangesEqual(actual, expected) {
      if (!Array.isArray(actual)) {
        throw new Error("Expected array of ranges");
      }
      assert.strictEqual(actual.length, expected.length);
      actual.forEach((r, i) => {
        const expectedRange = expected[i];
        assert.deepStrictEqual(
          {
            startLineNumber: r.startLineNumber,
            startColumn: r.startColumn,
            endLineNumber: r.endLineNumber,
            endColumn: r.endColumn
          },
          {
            startLineNumber: expectedRange.startLineNumber,
            startColumn: expectedRange.startColumn,
            endLineNumber: expectedRange.endLineNumber,
            endColumn: expectedRange.endColumn
          }
        );
      });
    }
    test("simple", () => {
      const results = editorMatchesToTextSearchResults(
        [new FindMatch(new Range(6, 1, 6, 2), null)],
        mockTextModel
      );
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].previewText, "6\n");
      assertRangesEqual(
        results[0].rangeLocations.map((e) => e.preview),
        [new Range(0, 0, 0, 1)]
      );
      assertRangesEqual(
        results[0].rangeLocations.map((e) => e.source),
        [new Range(5, 0, 5, 1)]
      );
    });
    test("multiple", () => {
      const results = editorMatchesToTextSearchResults(
        [
          new FindMatch(new Range(6, 1, 6, 2), null),
          new FindMatch(new Range(6, 4, 8, 2), null),
          new FindMatch(new Range(9, 1, 10, 3), null)
        ],
        mockTextModel
      );
      assert.strictEqual(results.length, 2);
      assertRangesEqual(
        results[0].rangeLocations.map((e) => e.preview),
        [new Range(0, 0, 0, 1), new Range(0, 3, 2, 1)]
      );
      assertRangesEqual(
        results[0].rangeLocations.map((e) => e.source),
        [new Range(5, 0, 5, 1), new Range(5, 3, 7, 1)]
      );
      assert.strictEqual(results[0].previewText, "6\n7\n8\n");
      assertRangesEqual(
        results[1].rangeLocations.map((e) => e.preview),
        [new Range(0, 0, 1, 2)]
      );
      assertRangesEqual(
        results[1].rangeLocations.map((e) => e.source),
        [new Range(8, 0, 9, 2)]
      );
      assert.strictEqual(results[1].previewText, "9\n10\n");
    });
  });
  suite("addContextToEditorMatches", () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    const MOCK_LINE_COUNT = 100;
    const mockTextModel = {
      getLineContent(lineNumber) {
        if (lineNumber < 1 || lineNumber > MOCK_LINE_COUNT) {
          throw new Error(`invalid line count: ${lineNumber}`);
        }
        return "" + lineNumber;
      },
      getLineCount() {
        return MOCK_LINE_COUNT;
      }
    };
    function getQuery(surroundingContext) {
      return {
        folderQueries: [],
        type: QueryType.Text,
        contentPattern: { pattern: "test" },
        surroundingContext
      };
    }
    test("no context", () => {
      const matches = [
        {
          previewText: "foo",
          rangeLocations: [
            {
              preview: new Range(0, 0, 0, 10),
              source: new Range(0, 0, 0, 10)
            }
          ]
        }
      ];
      assert.deepStrictEqual(
        getTextSearchMatchWithModelContext(
          matches,
          mockTextModel,
          getQuery()
        ),
        matches
      );
    });
    test("simple", () => {
      const matches = [
        {
          previewText: "foo",
          rangeLocations: [
            {
              preview: new Range(0, 0, 0, 10),
              source: new Range(1, 0, 1, 10)
            }
          ]
        }
      ];
      assert.deepStrictEqual(
        getTextSearchMatchWithModelContext(
          matches,
          mockTextModel,
          getQuery(1)
        ),
        [
          {
            text: "1",
            lineNumber: 1
          },
          ...matches,
          {
            text: "3",
            lineNumber: 3
          }
        ]
      );
    });
    test("multiple matches next to each other", () => {
      const matches = [
        {
          previewText: "foo",
          rangeLocations: [
            {
              preview: new Range(0, 0, 0, 10),
              source: new Range(1, 0, 1, 10)
            }
          ]
        },
        {
          previewText: "bar",
          rangeLocations: [
            {
              preview: new Range(0, 0, 0, 10),
              source: new Range(2, 0, 2, 10)
            }
          ]
        }
      ];
      assert.deepStrictEqual(
        getTextSearchMatchWithModelContext(
          matches,
          mockTextModel,
          getQuery(1)
        ),
        [
          {
            text: "1",
            lineNumber: 1
          },
          ...matches,
          {
            text: "4",
            lineNumber: 4
          }
        ]
      );
    });
    test("boundaries", () => {
      const matches = [
        {
          previewText: "foo",
          rangeLocations: [
            {
              preview: new Range(0, 0, 0, 10),
              source: new Range(0, 0, 0, 10)
            }
          ]
        },
        {
          previewText: "bar",
          rangeLocations: [
            {
              preview: new Range(0, 0, 0, 10),
              source: new Range(
                MOCK_LINE_COUNT - 1,
                0,
                MOCK_LINE_COUNT - 1,
                10
              )
            }
          ]
        }
      ];
      assert.deepStrictEqual(
        getTextSearchMatchWithModelContext(
          matches,
          mockTextModel,
          getQuery(1)
        ),
        [
          matches[0],
          {
            text: "2",
            lineNumber: 2
          },
          {
            text: "" + (MOCK_LINE_COUNT - 1),
            lineNumber: MOCK_LINE_COUNT - 1
          },
          matches[1]
        ]
      );
    });
  });
});
