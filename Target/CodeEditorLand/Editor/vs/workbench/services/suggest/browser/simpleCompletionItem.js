var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FuzzyScore } from "../../../../base/common/filters.js";
import { isWindows } from "../../../../base/common/platform.js";
class SimpleCompletionItem {
  constructor(completion) {
    this.completion = completion;
    this.labelLow = this.completion.label.toLowerCase();
    this.labelLowExcludeFileExt = this.labelLow;
    if (completion.isFile) {
      if (isWindows) {
        this.labelLow = this.labelLow.replaceAll("/", "\\");
      }
      const extIndex = this.labelLow.lastIndexOf(".");
      if (extIndex !== -1) {
        this.labelLowExcludeFileExt = this.labelLow.substring(
          0,
          extIndex
        );
        this.fileExtLow = this.labelLow.substring(extIndex + 1);
      }
    }
  }
  static {
    __name(this, "SimpleCompletionItem");
  }
  // perf
  labelLow;
  labelLowExcludeFileExt;
  fileExtLow = "";
  // sorting, filtering
  score = FuzzyScore.Default;
  idx;
  word;
}
export {
  SimpleCompletionItem
};
//# sourceMappingURL=simpleCompletionItem.js.map
