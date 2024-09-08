import assert from "assert";
import { ScrollbarState } from "../../../../browser/ui/scrollbar/scrollbarState.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../common/utils.js";
suite("ScrollbarState", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("inflates slider size", () => {
    const actual = new ScrollbarState(0, 14, 0, 339, 42423, 32787);
    assert.strictEqual(actual.getArrowSize(), 0);
    assert.strictEqual(actual.getScrollPosition(), 32787);
    assert.strictEqual(actual.getRectangleLargeSize(), 339);
    assert.strictEqual(actual.getRectangleSmallSize(), 14);
    assert.strictEqual(actual.isNeeded(), true);
    assert.strictEqual(actual.getSliderSize(), 20);
    assert.strictEqual(actual.getSliderPosition(), 249);
    assert.strictEqual(
      actual.getDesiredScrollPositionFromOffset(259),
      32849
    );
    assert.strictEqual(
      actual.getDesiredScrollPositionFromOffsetPaged(259),
      33126
    );
    actual.setScrollPosition(32849);
    assert.strictEqual(actual.getArrowSize(), 0);
    assert.strictEqual(actual.getScrollPosition(), 32849);
    assert.strictEqual(actual.getRectangleLargeSize(), 339);
    assert.strictEqual(actual.getRectangleSmallSize(), 14);
    assert.strictEqual(actual.isNeeded(), true);
    assert.strictEqual(actual.getSliderSize(), 20);
    assert.strictEqual(actual.getSliderPosition(), 249);
  });
  test("inflates slider size with arrows", () => {
    const actual = new ScrollbarState(12, 14, 0, 339, 42423, 32787);
    assert.strictEqual(actual.getArrowSize(), 12);
    assert.strictEqual(actual.getScrollPosition(), 32787);
    assert.strictEqual(actual.getRectangleLargeSize(), 339);
    assert.strictEqual(actual.getRectangleSmallSize(), 14);
    assert.strictEqual(actual.isNeeded(), true);
    assert.strictEqual(actual.getSliderSize(), 20);
    assert.strictEqual(actual.getSliderPosition(), 230);
    assert.strictEqual(
      actual.getDesiredScrollPositionFromOffset(240 + 12),
      32811
    );
    assert.strictEqual(
      actual.getDesiredScrollPositionFromOffsetPaged(240 + 12),
      33126
    );
    actual.setScrollPosition(32811);
    assert.strictEqual(actual.getArrowSize(), 12);
    assert.strictEqual(actual.getScrollPosition(), 32811);
    assert.strictEqual(actual.getRectangleLargeSize(), 339);
    assert.strictEqual(actual.getRectangleSmallSize(), 14);
    assert.strictEqual(actual.isNeeded(), true);
    assert.strictEqual(actual.getSliderSize(), 20);
    assert.strictEqual(actual.getSliderPosition(), 230);
  });
});
