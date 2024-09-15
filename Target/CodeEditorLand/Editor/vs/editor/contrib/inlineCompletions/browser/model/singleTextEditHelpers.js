var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { commonPrefixLength } from "../../../../../base/common/strings.js";
import { Range } from "../../../../common/core/range.js";
import { TextLength } from "../../../../common/core/textLength.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { EndOfLinePreference, ITextModel } from "../../../../common/model.js";
function singleTextRemoveCommonPrefix(edit, model, validModelRange) {
  const modelRange = validModelRange ? edit.range.intersectRanges(validModelRange) : edit.range;
  if (!modelRange) {
    return edit;
  }
  const valueToReplace = model.getValueInRange(modelRange, EndOfLinePreference.LF);
  const commonPrefixLen = commonPrefixLength(valueToReplace, edit.text);
  const start = TextLength.ofText(valueToReplace.substring(0, commonPrefixLen)).addToPosition(edit.range.getStartPosition());
  const text = edit.text.substring(commonPrefixLen);
  const range = Range.fromPositions(start, edit.range.getEndPosition());
  return new SingleTextEdit(range, text);
}
__name(singleTextRemoveCommonPrefix, "singleTextRemoveCommonPrefix");
function singleTextEditAugments(edit, base) {
  return edit.text.startsWith(base.text) && rangeExtends(edit.range, base.range);
}
__name(singleTextEditAugments, "singleTextEditAugments");
function rangeExtends(extendingRange, rangeToExtend) {
  return rangeToExtend.getStartPosition().equals(extendingRange.getStartPosition()) && rangeToExtend.getEndPosition().isBeforeOrEqual(extendingRange.getEndPosition());
}
__name(rangeExtends, "rangeExtends");
export {
  singleTextEditAugments,
  singleTextRemoveCommonPrefix
};
//# sourceMappingURL=singleTextEditHelpers.js.map
