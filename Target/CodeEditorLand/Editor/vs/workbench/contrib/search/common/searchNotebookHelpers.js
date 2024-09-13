var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../../../../editor/common/core/range.js";
import {
  TextSearchMatch
} from "../../../services/search/common/search.js";
function isINotebookFileMatchNoModel(object) {
  return "cellResults" in object;
}
__name(isINotebookFileMatchNoModel, "isINotebookFileMatchNoModel");
const rawCellPrefix = "rawCell#";
function genericCellMatchesToTextSearchMatches(contentMatches, buffer) {
  let previousEndLine = -1;
  const contextGroupings = [];
  let currentContextGrouping = [];
  contentMatches.forEach((match) => {
    if (match.range.startLineNumber !== previousEndLine) {
      if (currentContextGrouping.length > 0) {
        contextGroupings.push([...currentContextGrouping]);
        currentContextGrouping = [];
      }
    }
    currentContextGrouping.push(match);
    previousEndLine = match.range.endLineNumber;
  });
  if (currentContextGrouping.length > 0) {
    contextGroupings.push([...currentContextGrouping]);
  }
  const textSearchResults = contextGroupings.map((grouping) => {
    const lineTexts = [];
    const firstLine = grouping[0].range.startLineNumber;
    const lastLine = grouping[grouping.length - 1].range.endLineNumber;
    for (let i = firstLine; i <= lastLine; i++) {
      lineTexts.push(buffer.getLineContent(i));
    }
    return new TextSearchMatch(
      lineTexts.join("\n") + "\n",
      grouping.map(
        (m) => new Range(
          m.range.startLineNumber - 1,
          m.range.startColumn - 1,
          m.range.endLineNumber - 1,
          m.range.endColumn - 1
        )
      )
    );
  });
  return textSearchResults;
}
__name(genericCellMatchesToTextSearchMatches, "genericCellMatchesToTextSearchMatches");
export {
  genericCellMatchesToTextSearchMatches,
  isINotebookFileMatchNoModel,
  rawCellPrefix
};
//# sourceMappingURL=searchNotebookHelpers.js.map
