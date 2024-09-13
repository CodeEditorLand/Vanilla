var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as strings from "../../../base/common/strings.js";
import { CursorColumns } from "./cursorColumns.js";
function _normalizeIndentationFromWhitespace(str, indentSize, insertSpaces) {
  let spacesCnt = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) === "	") {
      spacesCnt = CursorColumns.nextIndentTabStop(spacesCnt, indentSize);
    } else {
      spacesCnt++;
    }
  }
  let result = "";
  if (!insertSpaces) {
    const tabsCnt = Math.floor(spacesCnt / indentSize);
    spacesCnt = spacesCnt % indentSize;
    for (let i = 0; i < tabsCnt; i++) {
      result += "	";
    }
  }
  for (let i = 0; i < spacesCnt; i++) {
    result += " ";
  }
  return result;
}
__name(_normalizeIndentationFromWhitespace, "_normalizeIndentationFromWhitespace");
function normalizeIndentation(str, indentSize, insertSpaces) {
  let firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(str);
  if (firstNonWhitespaceIndex === -1) {
    firstNonWhitespaceIndex = str.length;
  }
  return _normalizeIndentationFromWhitespace(
    str.substring(0, firstNonWhitespaceIndex),
    indentSize,
    insertSpaces
  ) + str.substring(firstNonWhitespaceIndex);
}
__name(normalizeIndentation, "normalizeIndentation");
export {
  normalizeIndentation
};
//# sourceMappingURL=indentation.js.map
