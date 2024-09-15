var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { StandardTokenType } from "../../../common/encodedTokenAttributes.js";
import * as fs from "fs";
import { toStandardTokenType } from "../../../common/languages/supports/tokenization.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
function parseTest(fileName) {
  const testContents = fs.readFileSync(fileName).toString();
  const lines = testContents.split(/\r\n|\n/);
  const magicToken = lines[0];
  let currentElement = {
    line: lines[1],
    assertions: []
  };
  const parsedTest = [];
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (line.substr(0, magicToken.length) === magicToken) {
      const m1 = line.substr(magicToken.length).match(/^( +)([\^]+) (\w+)\\?$/);
      if (m1) {
        currentElement.assertions.push({
          testLineNumber: i + 1,
          startOffset: magicToken.length + m1[1].length,
          length: m1[2].length,
          expectedTokenType: toStandardTokenType(m1[3])
        });
      } else {
        const m2 = line.substr(magicToken.length).match(/^( +)<(-+) (\w+)\\?$/);
        if (m2) {
          currentElement.assertions.push({
            testLineNumber: i + 1,
            startOffset: 0,
            length: m2[2].length,
            expectedTokenType: toStandardTokenType(m2[3])
          });
        } else {
          throw new Error(`Invalid test line at line number ${i + 1}.`);
        }
      }
    } else {
      parsedTest.push(currentElement);
      currentElement = {
        line,
        assertions: []
      };
    }
  }
  parsedTest.push(currentElement);
  const assertions = [];
  let offset = 0;
  for (let i = 0; i < parsedTest.length; i++) {
    const parsedTestLine = parsedTest[i];
    for (let j = 0; j < parsedTestLine.assertions.length; j++) {
      const assertion = parsedTestLine.assertions[j];
      assertions.push({
        testLineNumber: assertion.testLineNumber,
        startOffset: offset + assertion.startOffset,
        length: assertion.length,
        tokenType: assertion.expectedTokenType
      });
    }
    offset += parsedTestLine.line.length + 1;
  }
  const content = parsedTest.map((parsedTestLine) => parsedTestLine.line).join("\n");
  return { content, assertions };
}
__name(parseTest, "parseTest");
function executeTest(fileName, parseFunc) {
  const { content, assertions } = parseTest(fileName);
  const actual = parseFunc(content);
  let actualIndex = 0;
  const actualCount = actual.length / 3;
  for (let i = 0; i < assertions.length; i++) {
    const assertion = assertions[i];
    while (actualIndex < actualCount && actual[3 * actualIndex] + actual[3 * actualIndex + 1] <= assertion.startOffset) {
      actualIndex++;
    }
    assert.ok(
      actual[3 * actualIndex] <= assertion.startOffset,
      `Line ${assertion.testLineNumber} : startOffset : ${actual[3 * actualIndex]} <= ${assertion.startOffset}`
    );
    assert.ok(
      actual[3 * actualIndex] + actual[3 * actualIndex + 1] >= assertion.startOffset + assertion.length,
      `Line ${assertion.testLineNumber} : length : ${actual[3 * actualIndex]} + ${actual[3 * actualIndex + 1]} >= ${assertion.startOffset} + ${assertion.length}.`
    );
    assert.strictEqual(
      actual[3 * actualIndex + 2],
      assertion.tokenType,
      `Line ${assertion.testLineNumber} : tokenType`
    );
  }
}
__name(executeTest, "executeTest");
suite("Classification", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("TypeScript", () => {
  });
});
//# sourceMappingURL=typescript.test.js.map
