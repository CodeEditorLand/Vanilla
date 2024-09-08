import assert from "assert";
import { HighlightedLabel } from "../../browser/ui/highlightedlabel/highlightedLabel.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
suite("HighlightedLabel", () => {
  let label;
  setup(() => {
    label = new HighlightedLabel(document.createElement("div"), {
      supportIcons: true
    });
  });
  test("empty label", () => {
    assert.strictEqual(label.element.innerHTML, "");
  });
  test("no decorations", () => {
    label.set("hello");
    assert.strictEqual(label.element.innerHTML, "hello");
  });
  test("escape html", () => {
    label.set("hel<lo");
    assert.strictEqual(label.element.innerHTML, "hel&lt;lo");
  });
  test("everything highlighted", () => {
    label.set("hello", [{ start: 0, end: 5 }]);
    assert.strictEqual(
      label.element.innerHTML,
      '<span class="highlight">hello</span>'
    );
  });
  test("beginning highlighted", () => {
    label.set("hellothere", [{ start: 0, end: 5 }]);
    assert.strictEqual(
      label.element.innerHTML,
      '<span class="highlight">hello</span>there'
    );
  });
  test("ending highlighted", () => {
    label.set("goodbye", [{ start: 4, end: 7 }]);
    assert.strictEqual(
      label.element.innerHTML,
      'good<span class="highlight">bye</span>'
    );
  });
  test("middle highlighted", () => {
    label.set("foobarfoo", [{ start: 3, end: 6 }]);
    assert.strictEqual(
      label.element.innerHTML,
      'foo<span class="highlight">bar</span>foo'
    );
  });
  test("escapeNewLines", () => {
    let highlights = [
      { start: 0, end: 5 },
      { start: 7, end: 9 },
      { start: 11, end: 12 }
    ];
    let escaped = HighlightedLabel.escapeNewLines(
      "ACTION\r\n_TYPE2",
      highlights
    );
    assert.strictEqual(escaped, "ACTION\u23CE_TYPE2");
    assert.deepStrictEqual(highlights, [
      { start: 0, end: 5 },
      { start: 6, end: 8 },
      { start: 10, end: 11 }
    ]);
    highlights = [
      { start: 5, end: 9 },
      { start: 11, end: 12 }
    ];
    escaped = HighlightedLabel.escapeNewLines(
      "ACTION\r\n_TYPE2",
      highlights
    );
    assert.strictEqual(escaped, "ACTION\u23CE_TYPE2");
    assert.deepStrictEqual(highlights, [
      { start: 5, end: 8 },
      { start: 10, end: 11 }
    ]);
  });
  teardown(() => {
    label.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
