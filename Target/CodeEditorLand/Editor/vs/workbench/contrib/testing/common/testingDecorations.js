var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { binarySearch } from "../../../../base/common/arrays.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
class TestDecorations {
  static {
    __name(this, "TestDecorations");
  }
  value = [];
  /**
   * Adds a new value to the decorations.
   */
  push(value) {
    const searchIndex = binarySearch(
      this.value,
      value,
      (a, b) => a.line - b.line
    );
    this.value.splice(
      searchIndex < 0 ? ~searchIndex : searchIndex,
      0,
      value
    );
  }
  /**
   * Gets decorations on each line.
   */
  *lines() {
    if (!this.value.length) {
      return;
    }
    let startIndex = 0;
    let startLine = this.value[0].line;
    for (let i = 1; i < this.value.length; i++) {
      const v = this.value[i];
      if (v.line !== startLine) {
        yield [startLine, this.value.slice(startIndex, i)];
        startLine = v.line;
        startIndex = i;
      }
    }
    yield [startLine, this.value.slice(startIndex)];
  }
}
const ITestingDecorationsService = createDecorator("testingDecorationService");
export {
  ITestingDecorationsService,
  TestDecorations
};
//# sourceMappingURL=testingDecorations.js.map
