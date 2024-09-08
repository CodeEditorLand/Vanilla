import assert from "assert";
import {
  escapeIcons,
  getCodiconAriaLabel,
  markdownEscapeEscapedIcons,
  matchesFuzzyIconAware,
  parseLabelWithIcons,
  stripIcons
} from "../../common/iconLabels.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
function filterOk(filter, word, target, highlights) {
  const r = filter(word, target);
  assert(r);
  if (highlights) {
    assert.deepStrictEqual(r, highlights);
  }
}
suite("Icon Labels", () => {
  test("Can get proper aria labels", () => {
    const testCases = /* @__PURE__ */ new Map([
      ["", ""],
      ["asdf", "asdf"],
      ["asdf$(squirrel)asdf", "asdf squirrel asdf"],
      ["asdf $(squirrel) asdf", "asdf  squirrel  asdf"],
      ["$(rocket)asdf", "rocket asdf"],
      ["$(rocket) asdf", "rocket  asdf"],
      ["$(rocket)$(rocket)$(rocket)asdf", "rocket  rocket  rocket asdf"],
      ["$(rocket) asdf $(rocket)", "rocket  asdf  rocket"],
      ["$(rocket)asdf$(rocket)", "rocket asdf rocket"]
    ]);
    for (const [input, expected] of testCases) {
      assert.strictEqual(getCodiconAriaLabel(input), expected);
    }
  });
  test("matchesFuzzyIconAware", () => {
    filterOk(
      matchesFuzzyIconAware,
      "ccr",
      parseLabelWithIcons("$(codicon)CamelCaseRocks$(codicon)"),
      [
        { start: 10, end: 11 },
        { start: 15, end: 16 },
        { start: 19, end: 20 }
      ]
    );
    filterOk(
      matchesFuzzyIconAware,
      "ccr",
      parseLabelWithIcons("$(codicon) CamelCaseRocks $(codicon)"),
      [
        { start: 11, end: 12 },
        { start: 16, end: 17 },
        { start: 20, end: 21 }
      ]
    );
    filterOk(
      matchesFuzzyIconAware,
      "iut",
      parseLabelWithIcons(
        "$(codicon) Indent $(octico) Using $(octic) Tpaces"
      ),
      [
        { start: 11, end: 12 },
        { start: 28, end: 29 },
        { start: 43, end: 44 }
      ]
    );
    filterOk(
      matchesFuzzyIconAware,
      "using",
      parseLabelWithIcons("$(codicon) Indent Using Spaces"),
      [{ start: 18, end: 23 }]
    );
    filterOk(
      matchesFuzzyIconAware,
      "codicon",
      parseLabelWithIcons("This $(codicon Indent Using Spaces"),
      [{ start: 7, end: 14 }]
    );
    filterOk(
      matchesFuzzyIconAware,
      "indent",
      parseLabelWithIcons("This $codicon Indent Using Spaces"),
      [{ start: 14, end: 20 }]
    );
    filterOk(
      matchesFuzzyIconAware,
      "unt",
      parseLabelWithIcons("$(primitive-dot) $(file-text) Untitled-1"),
      [{ start: 30, end: 33 }]
    );
    filterOk(
      matchesFuzzyIconAware,
      "s",
      parseLabelWithIcons("$(loading~spin) start"),
      [{ start: 16, end: 17 }]
    );
  });
  test("stripIcons", () => {
    assert.strictEqual(stripIcons("Hello World"), "Hello World");
    assert.strictEqual(stripIcons("$(Hello World"), "$(Hello World");
    assert.strictEqual(stripIcons("$(Hello) World"), " World");
    assert.strictEqual(stripIcons("$(Hello) W$(oi)rld"), " Wrld");
  });
  test("escapeIcons", () => {
    assert.strictEqual(escapeIcons("Hello World"), "Hello World");
    assert.strictEqual(escapeIcons("$(Hello World"), "$(Hello World");
    assert.strictEqual(escapeIcons("$(Hello) World"), "\\$(Hello) World");
    assert.strictEqual(
      escapeIcons("\\$(Hello) W$(oi)rld"),
      "\\$(Hello) W\\$(oi)rld"
    );
  });
  test("markdownEscapeEscapedIcons", () => {
    assert.strictEqual(
      markdownEscapeEscapedIcons("Hello World"),
      "Hello World"
    );
    assert.strictEqual(
      markdownEscapeEscapedIcons("$(Hello) World"),
      "$(Hello) World"
    );
    assert.strictEqual(
      markdownEscapeEscapedIcons("\\$(Hello) World"),
      "\\\\$(Hello) World"
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
