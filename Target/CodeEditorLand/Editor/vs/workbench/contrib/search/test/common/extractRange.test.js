import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { extractRangeFromFilter } from "../../common/search.js";
suite("extractRangeFromFilter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("basics", async () => {
    assert.ok(!extractRangeFromFilter(""));
    assert.ok(!extractRangeFromFilter("/some/path"));
    assert.ok(!extractRangeFromFilter("/some/path/file.txt"));
    for (const lineSep of [":", "#", "(", ":line "]) {
      for (const colSep of [":", "#", ","]) {
        const base = "/some/path/file.txt";
        let res = extractRangeFromFilter(`${base}${lineSep}20`);
        assert.strictEqual(res?.filter, base);
        assert.strictEqual(res?.range.startLineNumber, 20);
        assert.strictEqual(res?.range.startColumn, 1);
        res = extractRangeFromFilter(`${base}${lineSep}20${colSep}`);
        assert.strictEqual(res?.filter, base);
        assert.strictEqual(res?.range.startLineNumber, 20);
        assert.strictEqual(res?.range.startColumn, 1);
        res = extractRangeFromFilter(`${base}${lineSep}20${colSep}3`);
        assert.strictEqual(res?.filter, base);
        assert.strictEqual(res?.range.startLineNumber, 20);
        assert.strictEqual(res?.range.startColumn, 3);
      }
    }
  });
  test("allow space after path", async () => {
    const res = extractRangeFromFilter("/some/path/file.txt (19,20)");
    assert.strictEqual(res?.filter, "/some/path/file.txt");
    assert.strictEqual(res?.range.startLineNumber, 19);
    assert.strictEqual(res?.range.startColumn, 20);
  });
  suite("unless", () => {
    const testSpecs = [
      // alpha-only symbol after unless
      {
        filter: "/some/path/file.txt@alphasymbol",
        unless: ["@"],
        result: void 0
      },
      // unless as first char
      {
        filter: "@/some/path/file.txt (19,20)",
        unless: ["@"],
        result: void 0
      },
      // unless as last char
      {
        filter: "/some/path/file.txt (19,20)@",
        unless: ["@"],
        result: void 0
      },
      // unless before ,
      {
        filter: "/some/@path/file.txt (19,20)",
        unless: ["@"],
        result: {
          filter: "/some/@path/file.txt",
          range: {
            endColumn: 20,
            endLineNumber: 19,
            startColumn: 20,
            startLineNumber: 19
          }
        }
      },
      // unless before :
      {
        filter: "/some/@path/file.txt:19:20",
        unless: ["@"],
        result: {
          filter: "/some/@path/file.txt",
          range: {
            endColumn: 20,
            endLineNumber: 19,
            startColumn: 20,
            startLineNumber: 19
          }
        }
      },
      // unless before #
      {
        filter: "/some/@path/file.txt#19",
        unless: ["@"],
        result: {
          filter: "/some/@path/file.txt",
          range: {
            endColumn: 1,
            endLineNumber: 19,
            startColumn: 1,
            startLineNumber: 19
          }
        }
      }
    ];
    for (const { filter, unless, result } of testSpecs) {
      test(`${filter} - ${JSON.stringify(unless)}`, () => {
        assert.deepStrictEqual(
          extractRangeFromFilter(filter, unless),
          result
        );
      });
    }
  });
});
