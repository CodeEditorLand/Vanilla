import { Range } from "../../../../../editor/common/core/range.js";
import {
  TextSearchMatch
} from "../../../../services/search/common/search.js";
import {
  genericCellMatchesToTextSearchMatches,
  rawCellPrefix
} from "../../common/searchNotebookHelpers.js";
function getIDFromINotebookCellMatch(match) {
  if (isINotebookCellMatchWithModel(match)) {
    return match.cell.id;
  } else {
    return `${rawCellPrefix}${match.index}`;
  }
}
function isINotebookFileMatchWithModel(object) {
  return "cellResults" in object && object.cellResults instanceof Array && object.cellResults.every(isINotebookCellMatchWithModel);
}
function isINotebookCellMatchWithModel(object) {
  return "cell" in object;
}
function contentMatchesToTextSearchMatches(contentMatches, cell) {
  return genericCellMatchesToTextSearchMatches(
    contentMatches,
    cell.textBuffer
  );
}
function webviewMatchesToTextSearchMatches(webviewMatches) {
  return webviewMatches.map(
    (rawMatch) => rawMatch.searchPreviewInfo ? new TextSearchMatch(
      rawMatch.searchPreviewInfo.line,
      new Range(
        0,
        rawMatch.searchPreviewInfo.range.start,
        0,
        rawMatch.searchPreviewInfo.range.end
      ),
      void 0,
      rawMatch.index
    ) : void 0
  ).filter((e) => !!e);
}
export {
  contentMatchesToTextSearchMatches,
  getIDFromINotebookCellMatch,
  isINotebookCellMatchWithModel,
  isINotebookFileMatchWithModel,
  webviewMatchesToTextSearchMatches
};
