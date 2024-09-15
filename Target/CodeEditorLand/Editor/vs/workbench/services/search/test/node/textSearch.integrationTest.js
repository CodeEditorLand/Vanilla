var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as path from "../../../../../base/common/path.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import * as glob from "../../../../../base/common/glob.js";
import { URI } from "../../../../../base/common/uri.js";
import { deserializeSearchError, IFolderQuery, ISearchRange, ITextQuery, ITextSearchContext, ITextSearchMatch, QueryType, SearchErrorCode, ISerializedFileMatch } from "../../common/search.js";
import { TextSearchEngineAdapter } from "../../node/textSearchAdapter.js";
import { flakySuite } from "../../../../../base/test/node/testUtils.js";
import { FileAccess } from "../../../../../base/common/network.js";
const TEST_FIXTURES = path.normalize(FileAccess.asFileUri("vs/workbench/services/search/test/node/fixtures").fsPath);
const EXAMPLES_FIXTURES = path.join(TEST_FIXTURES, "examples");
const MORE_FIXTURES = path.join(TEST_FIXTURES, "more");
const TEST_ROOT_FOLDER = { folder: URI.file(TEST_FIXTURES) };
const ROOT_FOLDER_QUERY = [
  TEST_ROOT_FOLDER
];
const MULTIROOT_QUERIES = [
  { folder: URI.file(EXAMPLES_FIXTURES) },
  { folder: URI.file(MORE_FIXTURES) }
];
function doSearchTest(query, expectedResultCount) {
  const engine = new TextSearchEngineAdapter(query);
  let c = 0;
  const results = [];
  return engine.search(new CancellationTokenSource().token, (_results) => {
    if (_results) {
      c += _results.reduce((acc, cur) => acc + cur.numMatches, 0);
      results.push(..._results);
    }
  }, () => {
  }).then(() => {
    if (typeof expectedResultCount === "function") {
      assert(expectedResultCount(c));
    } else {
      assert.strictEqual(c, expectedResultCount, `rg ${c} !== ${expectedResultCount}`);
    }
    return results;
  });
}
__name(doSearchTest, "doSearchTest");
flakySuite("TextSearch-integration", function() {
  test("Text: GameOfLife", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "GameOfLife" }
    };
    return doSearchTest(config, 4);
  });
  test("Text: GameOfLife (RegExp)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "Game.?fL\\w?fe", isRegExp: true }
    };
    return doSearchTest(config, 4);
  });
  test("Text: GameOfLife (unicode escape sequences)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "G\\u{0061}m\\u0065OfLife", isRegExp: true }
    };
    return doSearchTest(config, 4);
  });
  test("Text: GameOfLife (unicode escape sequences, force PCRE2)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "(?<!a)G\\u{0061}m\\u0065OfLife", isRegExp: true }
    };
    return doSearchTest(config, 4);
  });
  test("Text: GameOfLife (PCRE2 RegExp)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      usePCRE2: true,
      contentPattern: { pattern: "Life(?!P)", isRegExp: true }
    };
    return doSearchTest(config, 8);
  });
  test("Text: GameOfLife (RegExp to EOL)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "GameOfLife.*", isRegExp: true }
    };
    return doSearchTest(config, 4);
  });
  test("Text: GameOfLife (Word Match, Case Sensitive)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "GameOfLife", isWordMatch: true, isCaseSensitive: true }
    };
    return doSearchTest(config, 4);
  });
  test("Text: GameOfLife (Word Match, Spaces)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: " GameOfLife ", isWordMatch: true }
    };
    return doSearchTest(config, 1);
  });
  test("Text: GameOfLife (Word Match, Punctuation and Spaces)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: ", as =", isWordMatch: true }
    };
    return doSearchTest(config, 1);
  });
  test("Text: Helvetica (UTF 16)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "Helvetica" }
    };
    return doSearchTest(config, 3);
  });
  test("Text: e", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "e" }
    };
    return doSearchTest(config, 785);
  });
  test("Text: e (with excludes)", () => {
    const config = {
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "e" },
      excludePattern: { "**/examples": true }
    };
    return doSearchTest(config, 391);
  });
  test("Text: e (with includes)", () => {
    const config = {
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "e" },
      includePattern: { "**/examples/**": true }
    };
    return doSearchTest(config, 394);
  });
  test("Text: sibling exclude", () => {
    const config = {
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "m" },
      includePattern: makeExpression("**/site*"),
      excludePattern: { "*.css": { when: "$(basename).less" } }
    };
    return doSearchTest(config, 1);
  });
  test("Text: e (with includes and exclude)", () => {
    const config = {
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "e" },
      includePattern: { "**/examples/**": true },
      excludePattern: { "**/examples/small.js": true }
    };
    return doSearchTest(config, 371);
  });
  test("Text: a (capped)", () => {
    const maxResults = 520;
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "a" },
      maxResults
    };
    return doSearchTest(config, maxResults);
  });
  test("Text: a (no results)", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "ahsogehtdas" }
    };
    return doSearchTest(config, 0);
  });
  test("Text: -size", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "-size" }
    };
    return doSearchTest(config, 9);
  });
  test("Multiroot: Conway", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: MULTIROOT_QUERIES,
      contentPattern: { pattern: "conway" }
    };
    return doSearchTest(config, 8);
  });
  test("Multiroot: e with partial global exclude", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: MULTIROOT_QUERIES,
      contentPattern: { pattern: "e" },
      excludePattern: makeExpression("**/*.txt")
    };
    return doSearchTest(config, 394);
  });
  test("Multiroot: e with global excludes", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: MULTIROOT_QUERIES,
      contentPattern: { pattern: "e" },
      excludePattern: makeExpression("**/*.txt", "**/*.js")
    };
    return doSearchTest(config, 0);
  });
  test("Multiroot: e with folder exclude", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: [
        {
          folder: URI.file(EXAMPLES_FIXTURES),
          excludePattern: [{
            pattern: makeExpression("**/e*.js")
          }]
        },
        { folder: URI.file(MORE_FIXTURES) }
      ],
      contentPattern: { pattern: "e" }
    };
    return doSearchTest(config, 298);
  });
  test("Text: \u8BED", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "\u8BED" }
    };
    return doSearchTest(config, 1).then((results) => {
      const matchRange = results[0].results[0].rangeLocations.map((e) => e.source);
      assert.deepStrictEqual(matchRange, [{
        startLineNumber: 0,
        startColumn: 1,
        endLineNumber: 0,
        endColumn: 2
      }]);
    });
  });
  test("Multiple matches on line: h\\d,", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "h\\d,", isRegExp: true }
    };
    return doSearchTest(config, 15).then((results) => {
      assert.strictEqual(results.length, 3);
      assert.strictEqual(results[0].results.length, 1);
      const match = results[0].results[0];
      assert.strictEqual(match.rangeLocations.map((e) => e.source).length, 5);
    });
  });
  test("Search with context matches", () => {
    const config = {
      type: QueryType.Text,
      folderQueries: ROOT_FOLDER_QUERY,
      contentPattern: { pattern: "compiler.typeCheck();" },
      surroundingContext: 1
    };
    return doSearchTest(config, 3).then((results) => {
      assert.strictEqual(results.length, 3);
      assert.strictEqual(results[0].results[0].lineNumber, 24);
      assert.strictEqual(results[0].results[0].text, '        compiler.addUnit(prog,"input.ts");');
      assert.strictEqual(results[2].results[0].lineNumber, 26);
      assert.strictEqual(results[2].results[0].text, "        compiler.emit();");
    });
  });
  suite("error messages", () => {
    test("invalid encoding", () => {
      const config = {
        type: QueryType.Text,
        folderQueries: [
          {
            ...TEST_ROOT_FOLDER,
            fileEncoding: "invalidEncoding"
          }
        ],
        contentPattern: { pattern: "test" }
      };
      return doSearchTest(config, 0).then(() => {
        throw new Error("expected fail");
      }, (err) => {
        const searchError = deserializeSearchError(err);
        assert.strictEqual(searchError.message, "Unknown encoding: invalidEncoding");
        assert.strictEqual(searchError.code, SearchErrorCode.unknownEncoding);
      });
    });
    test("invalid regex case 1", () => {
      const config = {
        type: QueryType.Text,
        folderQueries: ROOT_FOLDER_QUERY,
        contentPattern: { pattern: ")", isRegExp: true }
      };
      return doSearchTest(config, 0).then(() => {
        throw new Error("expected fail");
      }, (err) => {
        const searchError = deserializeSearchError(err);
        const regexParseErrorForUnclosedParenthesis = "Regex parse error: unmatched closing parenthesis";
        assert.strictEqual(searchError.message, regexParseErrorForUnclosedParenthesis);
        assert.strictEqual(searchError.code, SearchErrorCode.regexParseError);
      });
    });
    test("invalid regex case 2", () => {
      const config = {
        type: QueryType.Text,
        folderQueries: ROOT_FOLDER_QUERY,
        contentPattern: { pattern: "(?<!a.*)", isRegExp: true }
      };
      return doSearchTest(config, 0).then(() => {
        throw new Error("expected fail");
      }, (err) => {
        const searchError = deserializeSearchError(err);
        const regexParseErrorForLookAround = "Regex parse error: lookbehind assertion is not fixed length";
        assert.strictEqual(searchError.message, regexParseErrorForLookAround);
        assert.strictEqual(searchError.code, SearchErrorCode.regexParseError);
      });
    });
    test("invalid glob", () => {
      const config = {
        type: QueryType.Text,
        folderQueries: ROOT_FOLDER_QUERY,
        contentPattern: { pattern: "foo" },
        includePattern: {
          "{{}": true
        }
      };
      return doSearchTest(config, 0).then(() => {
        throw new Error("expected fail");
      }, (err) => {
        const searchError = deserializeSearchError(err);
        assert.strictEqual(searchError.message, "Error parsing glob '/{{}': nested alternate groups are not allowed");
        assert.strictEqual(searchError.code, SearchErrorCode.globParseError);
      });
    });
  });
});
function makeExpression(...patterns) {
  return patterns.reduce((glob2, pattern) => {
    pattern = pattern.replace(/\\/g, "/");
    glob2[pattern] = true;
    return glob2;
  }, /* @__PURE__ */ Object.create(null));
}
__name(makeExpression, "makeExpression");
//# sourceMappingURL=textSearch.integrationTest.js.map
