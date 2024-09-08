import assert from "assert";
import { CharCode } from "../../../../base/common/charCode.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { CharacterClassifier } from "../../../common/core/characterClassifier.js";
suite("CharacterClassifier", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("works", () => {
    const classifier = new CharacterClassifier(0);
    assert.strictEqual(classifier.get(-1), 0);
    assert.strictEqual(classifier.get(0), 0);
    assert.strictEqual(classifier.get(CharCode.a), 0);
    assert.strictEqual(classifier.get(CharCode.b), 0);
    assert.strictEqual(classifier.get(CharCode.z), 0);
    assert.strictEqual(classifier.get(255), 0);
    assert.strictEqual(classifier.get(1e3), 0);
    assert.strictEqual(classifier.get(2e3), 0);
    classifier.set(CharCode.a, 1);
    classifier.set(CharCode.z, 2);
    classifier.set(1e3, 3);
    assert.strictEqual(classifier.get(-1), 0);
    assert.strictEqual(classifier.get(0), 0);
    assert.strictEqual(classifier.get(CharCode.a), 1);
    assert.strictEqual(classifier.get(CharCode.b), 0);
    assert.strictEqual(classifier.get(CharCode.z), 2);
    assert.strictEqual(classifier.get(255), 0);
    assert.strictEqual(classifier.get(1e3), 3);
    assert.strictEqual(classifier.get(2e3), 0);
  });
});
