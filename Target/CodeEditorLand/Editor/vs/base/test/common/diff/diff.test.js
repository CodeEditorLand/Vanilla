var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IDiffChange, LcsDiff, StringDiffSequence } from "../../../common/diff/diff.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../utils.js";
function createArray(length, value) {
  const r = [];
  for (let i = 0; i < length; i++) {
    r[i] = value;
  }
  return r;
}
__name(createArray, "createArray");
function maskBasedSubstring(str, mask) {
  let r = "";
  for (let i = 0; i < str.length; i++) {
    if (mask[i]) {
      r += str.charAt(i);
    }
  }
  return r;
}
__name(maskBasedSubstring, "maskBasedSubstring");
function assertAnswer(originalStr, modifiedStr, changes, answerStr, onlyLength = false) {
  const originalMask = createArray(originalStr.length, true);
  const modifiedMask = createArray(modifiedStr.length, true);
  let i, j, change;
  for (i = 0; i < changes.length; i++) {
    change = changes[i];
    if (change.originalLength) {
      for (j = 0; j < change.originalLength; j++) {
        originalMask[change.originalStart + j] = false;
      }
    }
    if (change.modifiedLength) {
      for (j = 0; j < change.modifiedLength; j++) {
        modifiedMask[change.modifiedStart + j] = false;
      }
    }
  }
  const originalAnswer = maskBasedSubstring(originalStr, originalMask);
  const modifiedAnswer = maskBasedSubstring(modifiedStr, modifiedMask);
  if (onlyLength) {
    assert.strictEqual(originalAnswer.length, answerStr.length);
    assert.strictEqual(modifiedAnswer.length, answerStr.length);
  } else {
    assert.strictEqual(originalAnswer, answerStr);
    assert.strictEqual(modifiedAnswer, answerStr);
  }
}
__name(assertAnswer, "assertAnswer");
function lcsInnerTest(originalStr, modifiedStr, answerStr, onlyLength = false) {
  const diff = new LcsDiff(new StringDiffSequence(originalStr), new StringDiffSequence(modifiedStr));
  const changes = diff.ComputeDiff(false).changes;
  assertAnswer(originalStr, modifiedStr, changes, answerStr, onlyLength);
}
__name(lcsInnerTest, "lcsInnerTest");
function stringPower(str, power) {
  let r = str;
  for (let i = 0; i < power; i++) {
    r += r;
  }
  return r;
}
__name(stringPower, "stringPower");
function lcsTest(originalStr, modifiedStr, answerStr) {
  lcsInnerTest(originalStr, modifiedStr, answerStr);
  for (let i = 2; i <= 5; i++) {
    lcsInnerTest(stringPower(originalStr, i), stringPower(modifiedStr, i), stringPower(answerStr, i), true);
  }
}
__name(lcsTest, "lcsTest");
suite("Diff", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("LcsDiff - different strings tests", function() {
    this.timeout(1e4);
    lcsTest("heLLo world", "hello orlando", "heo orld");
    lcsTest("abcde", "acd", "acd");
    lcsTest("abcdbce", "bcede", "bcde");
    lcsTest("abcdefgabcdefg", "bcehafg", "bceafg");
    lcsTest("abcde", "fgh", "");
    lcsTest("abcfabc", "fabc", "fabc");
    lcsTest("0azby0", "9axbzby9", "azby");
    lcsTest("0abc00000", "9a1b2c399999", "abc");
    lcsTest("fooBar", "myfooBar", "fooBar");
    lcsTest("fooBar", "fooMyBar", "fooBar");
    lcsTest("fooBar", "fooBar", "fooBar");
  });
});
suite("Diff - Ported from VS", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("using continue processing predicate to quit early", function() {
    const left = "abcdef";
    const right = "abxxcyyydzzzzezzzzzzzzzzzzzzzzzzzzf";
    let predicateCallCount = 0;
    let diff = new LcsDiff(new StringDiffSequence(left), new StringDiffSequence(right), function(leftIndex, longestMatchSoFar) {
      assert.strictEqual(predicateCallCount, 0);
      predicateCallCount++;
      assert.strictEqual(leftIndex, 1);
      return false;
    });
    let changes = diff.ComputeDiff(true).changes;
    assert.strictEqual(predicateCallCount, 1);
    assertAnswer(left, right, changes, "abf");
    diff = new LcsDiff(new StringDiffSequence(left), new StringDiffSequence(right), function(leftIndex, longestMatchSoFar) {
      assert(longestMatchSoFar <= 1);
      return longestMatchSoFar < 1;
    });
    changes = diff.ComputeDiff(true).changes;
    assertAnswer(left, right, changes, "abcf");
    diff = new LcsDiff(new StringDiffSequence(left), new StringDiffSequence(right), function(leftIndex, longestMatchSoFar) {
      assert(longestMatchSoFar <= 2);
      return longestMatchSoFar < 2;
    });
    changes = diff.ComputeDiff(true).changes;
    assertAnswer(left, right, changes, "abcdf");
    let hitSecondMatch = false;
    diff = new LcsDiff(new StringDiffSequence(left), new StringDiffSequence(right), function(leftIndex, longestMatchSoFar) {
      assert(longestMatchSoFar <= 2);
      const hitYet = hitSecondMatch;
      hitSecondMatch = longestMatchSoFar > 1;
      return !hitYet;
    });
    changes = diff.ComputeDiff(true).changes;
    assertAnswer(left, right, changes, "abcdf");
    diff = new LcsDiff(new StringDiffSequence(left), new StringDiffSequence(right), function(leftIndex, longestMatchSoFar) {
      assert(longestMatchSoFar <= 3);
      return longestMatchSoFar < 3;
    });
    changes = diff.ComputeDiff(true).changes;
    assertAnswer(left, right, changes, "abcdef");
  });
});
//# sourceMappingURL=diff.test.js.map
