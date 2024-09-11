var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
function isResolvedEditorModel(model) {
  const candidate = model;
  return typeof candidate?.resolve === "function" && typeof candidate?.isResolved === "function";
}
__name(isResolvedEditorModel, "isResolvedEditorModel");
var EditorActivation = /* @__PURE__ */ ((EditorActivation2) => {
  EditorActivation2[EditorActivation2["ACTIVATE"] = 1] = "ACTIVATE";
  EditorActivation2[EditorActivation2["RESTORE"] = 2] = "RESTORE";
  EditorActivation2[EditorActivation2["PRESERVE"] = 3] = "PRESERVE";
  return EditorActivation2;
})(EditorActivation || {});
var EditorResolution = /* @__PURE__ */ ((EditorResolution2) => {
  EditorResolution2[EditorResolution2["PICK"] = 0] = "PICK";
  EditorResolution2[EditorResolution2["EXCLUSIVE_ONLY"] = 1] = "EXCLUSIVE_ONLY";
  return EditorResolution2;
})(EditorResolution || {});
var EditorOpenSource = /* @__PURE__ */ ((EditorOpenSource2) => {
  EditorOpenSource2[EditorOpenSource2["API"] = 0] = "API";
  EditorOpenSource2[EditorOpenSource2["USER"] = 1] = "USER";
  return EditorOpenSource2;
})(EditorOpenSource || {});
var TextEditorSelectionRevealType = /* @__PURE__ */ ((TextEditorSelectionRevealType2) => {
  TextEditorSelectionRevealType2[TextEditorSelectionRevealType2["Center"] = 0] = "Center";
  TextEditorSelectionRevealType2[TextEditorSelectionRevealType2["CenterIfOutsideViewport"] = 1] = "CenterIfOutsideViewport";
  TextEditorSelectionRevealType2[TextEditorSelectionRevealType2["NearTop"] = 2] = "NearTop";
  TextEditorSelectionRevealType2[TextEditorSelectionRevealType2["NearTopIfOutsideViewport"] = 3] = "NearTopIfOutsideViewport";
  return TextEditorSelectionRevealType2;
})(TextEditorSelectionRevealType || {});
var TextEditorSelectionSource = /* @__PURE__ */ ((TextEditorSelectionSource2) => {
  TextEditorSelectionSource2["PROGRAMMATIC"] = "api";
  TextEditorSelectionSource2["NAVIGATION"] = "code.navigation";
  TextEditorSelectionSource2["JUMP"] = "code.jump";
  return TextEditorSelectionSource2;
})(TextEditorSelectionSource || {});
export {
  EditorActivation,
  EditorOpenSource,
  EditorResolution,
  TextEditorSelectionRevealType,
  TextEditorSelectionSource,
  isResolvedEditorModel
};
//# sourceMappingURL=editor.js.map
