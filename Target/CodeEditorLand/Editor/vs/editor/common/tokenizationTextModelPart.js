var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { OffsetEdit } from "./core/offsetEdit.js";
import { OffsetRange } from "./core/offsetRange.js";
import { Range } from "./core/range.js";
import { StandardTokenType } from "./encodedTokenAttributes.js";
import { LineTokens } from "./tokens/lineTokens.js";
import { SparseMultilineTokens } from "./tokens/sparseMultilineTokens.js";
class LineEditWithAdditionalLines {
  constructor(lineEdit, additionalLines) {
    this.lineEdit = lineEdit;
    this.additionalLines = additionalLines;
  }
  static {
    __name(this, "LineEditWithAdditionalLines");
  }
  static replace(range, text) {
    return new LineEditWithAdditionalLines(
      OffsetEdit.replace(range, text),
      null
    );
  }
}
var BackgroundTokenizationState = /* @__PURE__ */ ((BackgroundTokenizationState2) => {
  BackgroundTokenizationState2[BackgroundTokenizationState2["InProgress"] = 1] = "InProgress";
  BackgroundTokenizationState2[BackgroundTokenizationState2["Completed"] = 2] = "Completed";
  return BackgroundTokenizationState2;
})(BackgroundTokenizationState || {});
export {
  BackgroundTokenizationState,
  LineEditWithAdditionalLines
};
//# sourceMappingURL=tokenizationTextModelPart.js.map
