var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { KeybindingEditorDecorationsRenderer } from "../../browser/keybindingsEditorContribution.js";
suite("KeybindingsEditorContribution", () => {
  function assertUserSettingsFuzzyEquals(a, b, expected) {
    const actual = KeybindingEditorDecorationsRenderer._userSettingsFuzzyEquals(a, b);
    const message = expected ? `${a} == ${b}` : `${a} != ${b}`;
    assert.strictEqual(actual, expected, "fuzzy: " + message);
  }
  __name(assertUserSettingsFuzzyEquals, "assertUserSettingsFuzzyEquals");
  function assertEqual(a, b) {
    assertUserSettingsFuzzyEquals(a, b, true);
  }
  __name(assertEqual, "assertEqual");
  function assertDifferent(a, b) {
    assertUserSettingsFuzzyEquals(a, b, false);
  }
  __name(assertDifferent, "assertDifferent");
  test("_userSettingsFuzzyEquals", () => {
    assertEqual("a", "a");
    assertEqual("a", "A");
    assertEqual("ctrl+a", "CTRL+A");
    assertEqual("ctrl+a", " CTRL+A ");
    assertEqual("ctrl+shift+a", "shift+ctrl+a");
    assertEqual("ctrl+shift+a ctrl+alt+b", "shift+ctrl+a alt+ctrl+b");
    assertDifferent("ctrl+[KeyA]", "ctrl+a");
    assertEqual("cmd+shift+p", "shift+cmd+p");
    assertEqual("cmd+shift+p", "shift-cmd-p");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=keybindingsEditorContribution.test.js.map
