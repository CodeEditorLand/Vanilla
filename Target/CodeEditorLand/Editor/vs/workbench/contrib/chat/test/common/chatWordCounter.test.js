var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { getNWords } from "../../common/chatWordCounter.js";
suite("ChatWordCounter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function doTest(str, nWords, resultStr) {
    const result = getNWords(str, nWords);
    assert.strictEqual(result.value, resultStr);
    assert.strictEqual(result.returnedWordCount, nWords);
  }
  __name(doTest, "doTest");
  suite("getNWords", () => {
    test("matching actualWordCount", () => {
      const cases = [
        ["hello world", 1, "hello"],
        ["hello", 1, "hello"],
        ["hello world", 0, ""],
        ["here's, some.   punctuation?", 3, "here's, some.   punctuation?"],
        ["| markdown | _table_ | header |", 3, "| markdown | _table_ | header"],
        ["| --- | --- | --- |", 1, "| ---"],
        ["| --- | --- | --- |", 3, "| --- | --- | ---"],
        [" 	 some \n whitespace     \n\n\nhere   ", 3, " 	 some \n whitespace     \n\n\nhere"]
      ];
      cases.forEach(([str, nWords, result]) => doTest(str, nWords, result));
    });
    test("matching links", () => {
      const cases = [
        ["[hello](https://example.com) world", 1, "[hello](https://example.com)"],
        ["[hello](https://example.com) world", 2, "[hello](https://example.com) world"],
        ['oh [hello](https://example.com "title") world', 1, "oh"],
        ['oh [hello](https://example.com "title") world', 2, 'oh [hello](https://example.com "title")'],
        // Parens in link destination
        ["[hello](https://example.com?()) world", 1, "[hello](https://example.com?())"],
        // Escaped brackets in link text
        ["[he \\[l\\] \\]lo](https://example.com?()) world", 1, "[he \\[l\\] \\]lo](https://example.com?())"]
      ];
      cases.forEach(([str, nWords, result]) => doTest(str, nWords, result));
    });
    test("code", () => {
      const cases = [
        ["let a=1-2", 2, "let a"],
        ["let a=1-2", 3, "let a="],
        ["let a=1-2", 4, "let a=1"],
        ["const myVar = 1+2", 4, "const myVar = 1"],
        ['<div id="myDiv"></div>', 3, "<div id="],
        ['<div id="myDiv"></div>', 4, '<div id="myDiv"></div>']
      ];
      cases.forEach(([str, nWords, result]) => doTest(str, nWords, result));
    });
    test("chinese characters", () => {
      const cases = [
        ["\u6211\u559C\u6B22\u4E2D\u56FD\u83DC", 3, "\u6211\u559C\u6B22"]
      ];
      cases.forEach(([str, nWords, result]) => doTest(str, nWords, result));
    });
  });
});
//# sourceMappingURL=chatWordCounter.test.js.map
