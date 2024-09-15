import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { RenderedContentHover } from "../../browser/contentHoverRendered.js";
import { IHoverPart } from "../../browser/hoverTypes.js";
import { TestCodeEditorInstantiationOptions, withTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
suite("Content Hover", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("issue #151235: Gitlens hover shows up in the wrong place", () => {
    const text = "just some text";
    withTestCodeEditor(text, {}, (editor) => {
      const actual = RenderedContentHover.computeHoverPositions(
        editor,
        new Range(5, 5, 5, 5),
        [{ range: new Range(4, 1, 5, 6) }]
      );
      assert.deepStrictEqual(
        actual,
        {
          showAtPosition: new Position(5, 5),
          showAtSecondaryPosition: new Position(5, 5)
        }
      );
    });
  });
  test("issue #95328: Hover placement with word-wrap", () => {
    const text = "just some text";
    const opts = { wordWrap: "wordWrapColumn", wordWrapColumn: 6 };
    withTestCodeEditor(text, opts, (editor) => {
      const actual = RenderedContentHover.computeHoverPositions(
        editor,
        new Range(1, 8, 1, 8),
        [{ range: new Range(1, 1, 1, 15) }]
      );
      assert.deepStrictEqual(
        actual,
        {
          showAtPosition: new Position(1, 8),
          showAtSecondaryPosition: new Position(1, 6)
        }
      );
    });
  });
});
//# sourceMappingURL=contentHover.test.js.map
