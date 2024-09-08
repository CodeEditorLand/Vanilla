import { OffsetEdit } from "./core/offsetEdit.js";
class LineEditWithAdditionalLines {
  constructor(lineEdit, additionalLines) {
    this.lineEdit = lineEdit;
    this.additionalLines = additionalLines;
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
