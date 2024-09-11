var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDiffChange, LcsDiff } from "../../../../../base/common/diff/diff.js";
import { commonPrefixLength, getLeadingWhitespace } from "../../../../../base/common/strings.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { TextLength } from "../../../../common/core/textLength.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { EndOfLinePreference, ITextModel } from "../../../../common/model.js";
import { GhostText, GhostTextPart } from "./ghostText.js";
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
function computeGhostText(edit, model, mode, cursorPosition, previewSuffixLength = 0) {
  let e = singleTextRemoveCommonPrefix(edit, model);
  if (e.range.endLineNumber !== e.range.startLineNumber) {
    return void 0;
  }
  const sourceLine = model.getLineContent(e.range.startLineNumber);
  const sourceIndentationLength = getLeadingWhitespace(sourceLine).length;
  const suggestionTouchesIndentation = e.range.startColumn - 1 <= sourceIndentationLength;
  if (suggestionTouchesIndentation) {
    const suggestionAddedIndentationLength = getLeadingWhitespace(e.text).length;
    const replacedIndentation = sourceLine.substring(e.range.startColumn - 1, sourceIndentationLength);
    const [startPosition, endPosition] = [e.range.getStartPosition(), e.range.getEndPosition()];
    const newStartPosition = startPosition.column + replacedIndentation.length <= endPosition.column ? startPosition.delta(0, replacedIndentation.length) : endPosition;
    const rangeThatDoesNotReplaceIndentation = Range.fromPositions(newStartPosition, endPosition);
    const suggestionWithoutIndentationChange = e.text.startsWith(replacedIndentation) ? e.text.substring(replacedIndentation.length) : e.text.substring(suggestionAddedIndentationLength);
    e = new SingleTextEdit(rangeThatDoesNotReplaceIndentation, suggestionWithoutIndentationChange);
  }
  const valueToBeReplaced = model.getValueInRange(e.range);
  const changes = cachingDiff(valueToBeReplaced, e.text);
  if (!changes) {
    return void 0;
  }
  const lineNumber = e.range.startLineNumber;
  const parts = new Array();
  if (mode === "prefix") {
    const filteredChanges = changes.filter((c) => c.originalLength === 0);
    if (filteredChanges.length > 1 || filteredChanges.length === 1 && filteredChanges[0].originalStart !== valueToBeReplaced.length) {
      return void 0;
    }
  }
  const previewStartInCompletionText = e.text.length - previewSuffixLength;
  for (const c of changes) {
    const insertColumn = e.range.startColumn + c.originalStart + c.originalLength;
    if (mode === "subwordSmart" && cursorPosition && cursorPosition.lineNumber === e.range.startLineNumber && insertColumn < cursorPosition.column) {
      return void 0;
    }
    if (c.originalLength > 0) {
      return void 0;
    }
    if (c.modifiedLength === 0) {
      continue;
    }
    const modifiedEnd = c.modifiedStart + c.modifiedLength;
    const nonPreviewTextEnd = Math.max(c.modifiedStart, Math.min(modifiedEnd, previewStartInCompletionText));
    const nonPreviewText = e.text.substring(c.modifiedStart, nonPreviewTextEnd);
    const italicText = e.text.substring(nonPreviewTextEnd, Math.max(c.modifiedStart, modifiedEnd));
    if (nonPreviewText.length > 0) {
      parts.push(new GhostTextPart(insertColumn, nonPreviewText, false));
    }
    if (italicText.length > 0) {
      parts.push(new GhostTextPart(insertColumn, italicText, true));
    }
  }
  return new GhostText(lineNumber, parts);
}
__name(computeGhostText, "computeGhostText");
function rangeExtends(extendingRange, rangeToExtend) {
  return rangeToExtend.getStartPosition().equals(extendingRange.getStartPosition()) && rangeToExtend.getEndPosition().isBeforeOrEqual(extendingRange.getEndPosition());
}
__name(rangeExtends, "rangeExtends");
let lastRequest = void 0;
function cachingDiff(originalValue, newValue) {
  if (lastRequest?.originalValue === originalValue && lastRequest?.newValue === newValue) {
    return lastRequest?.changes;
  } else {
    let changes = smartDiff(originalValue, newValue, true);
    if (changes) {
      const deletedChars = deletedCharacters(changes);
      if (deletedChars > 0) {
        const newChanges = smartDiff(originalValue, newValue, false);
        if (newChanges && deletedCharacters(newChanges) < deletedChars) {
          changes = newChanges;
        }
      }
    }
    lastRequest = {
      originalValue,
      newValue,
      changes
    };
    return changes;
  }
}
__name(cachingDiff, "cachingDiff");
function deletedCharacters(changes) {
  let sum = 0;
  for (const c of changes) {
    sum += c.originalLength;
  }
  return sum;
}
__name(deletedCharacters, "deletedCharacters");
function smartDiff(originalValue, newValue, smartBracketMatching) {
  if (originalValue.length > 5e3 || newValue.length > 5e3) {
    return void 0;
  }
  function getMaxCharCode(val) {
    let maxCharCode2 = 0;
    for (let i = 0, len = val.length; i < len; i++) {
      const charCode = val.charCodeAt(i);
      if (charCode > maxCharCode2) {
        maxCharCode2 = charCode;
      }
    }
    return maxCharCode2;
  }
  __name(getMaxCharCode, "getMaxCharCode");
  const maxCharCode = Math.max(getMaxCharCode(originalValue), getMaxCharCode(newValue));
  function getUniqueCharCode(id) {
    if (id < 0) {
      throw new Error("unexpected");
    }
    return maxCharCode + id + 1;
  }
  __name(getUniqueCharCode, "getUniqueCharCode");
  function getElements(source) {
    let level = 0;
    let group = 0;
    const characters = new Int32Array(source.length);
    for (let i = 0, len = source.length; i < len; i++) {
      if (smartBracketMatching && source[i] === "(") {
        const id = group * 100 + level;
        characters[i] = getUniqueCharCode(2 * id);
        level++;
      } else if (smartBracketMatching && source[i] === ")") {
        level = Math.max(level - 1, 0);
        const id = group * 100 + level;
        characters[i] = getUniqueCharCode(2 * id + 1);
        if (level === 0) {
          group++;
        }
      } else {
        characters[i] = source.charCodeAt(i);
      }
    }
    return characters;
  }
  __name(getElements, "getElements");
  const elements1 = getElements(originalValue);
  const elements2 = getElements(newValue);
  return new LcsDiff({ getElements: /* @__PURE__ */ __name(() => elements1, "getElements") }, { getElements: /* @__PURE__ */ __name(() => elements2, "getElements") }).ComputeDiff(false).changes;
}
__name(smartDiff, "smartDiff");
export {
  computeGhostText,
  singleTextEditAugments,
  singleTextRemoveCommonPrefix
};
//# sourceMappingURL=singleTextEdit.js.map
