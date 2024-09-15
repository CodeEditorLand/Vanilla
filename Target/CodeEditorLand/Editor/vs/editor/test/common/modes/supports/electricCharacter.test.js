var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { StandardTokenType } from "../../../../common/encodedTokenAttributes.js";
import { BracketElectricCharacterSupport, IElectricAction } from "../../../../common/languages/supports/electricCharacter.js";
import { RichEditBrackets } from "../../../../common/languages/supports/richEditBrackets.js";
import { TokenText, createFakeScopedLineTokens } from "../../modesTestUtils.js";
const fakeLanguageId = "test";
suite("Editor Modes - Auto Indentation", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function _testOnElectricCharacter(electricCharacterSupport, line, character, offset) {
    return electricCharacterSupport.onElectricCharacter(character, createFakeScopedLineTokens(line), offset);
  }
  __name(_testOnElectricCharacter, "_testOnElectricCharacter");
  function testDoesNothing(electricCharacterSupport, line, character, offset) {
    const actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
    assert.deepStrictEqual(actual, null);
  }
  __name(testDoesNothing, "testDoesNothing");
  function testMatchBracket(electricCharacterSupport, line, character, offset, matchOpenBracket) {
    const actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
    assert.deepStrictEqual(actual, { matchOpenBracket });
  }
  __name(testMatchBracket, "testMatchBracket");
  test("getElectricCharacters uses all sources and dedups", () => {
    const sup = new BracketElectricCharacterSupport(
      new RichEditBrackets(fakeLanguageId, [
        ["{", "}"],
        ["(", ")"]
      ])
    );
    assert.deepStrictEqual(sup.getElectricCharacters(), ["}", ")"]);
  });
  test("matchOpenBracket", () => {
    const sup = new BracketElectricCharacterSupport(
      new RichEditBrackets(fakeLanguageId, [
        ["{", "}"],
        ["(", ")"]
      ])
    );
    testDoesNothing(sup, [{ text: "	{", type: StandardTokenType.Other }], "	", 1);
    testDoesNothing(sup, [{ text: "	{", type: StandardTokenType.Other }], "	", 2);
    testDoesNothing(sup, [{ text: "		", type: StandardTokenType.Other }], "{", 3);
    testDoesNothing(sup, [{ text: "	}", type: StandardTokenType.Other }], "	", 1);
    testDoesNothing(sup, [{ text: "	}", type: StandardTokenType.Other }], "	", 2);
    testMatchBracket(sup, [{ text: "		", type: StandardTokenType.Other }], "}", 3, "}");
  });
});
//# sourceMappingURL=electricCharacter.test.js.map
