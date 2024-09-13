var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IRange } from "../core/range.js";
import { FoldingRules } from "../languages/languageConfiguration.js";
const markRegex = new RegExp("\\bMARK:\\s*(.*)$", "d");
const trimDashesRegex = /^-+|-+$/g;
function findSectionHeaders(model, options) {
  let headers = [];
  if (options.findRegionSectionHeaders && options.foldingRules?.markers) {
    const regionHeaders = collectRegionHeaders(model, options);
    headers = headers.concat(regionHeaders);
  }
  if (options.findMarkSectionHeaders) {
    const markHeaders = collectMarkHeaders(model);
    headers = headers.concat(markHeaders);
  }
  return headers;
}
__name(findSectionHeaders, "findSectionHeaders");
function collectRegionHeaders(model, options) {
  const regionHeaders = [];
  const endLineNumber = model.getLineCount();
  for (let lineNumber = 1; lineNumber <= endLineNumber; lineNumber++) {
    const lineContent = model.getLineContent(lineNumber);
    const match = lineContent.match(options.foldingRules.markers.start);
    if (match) {
      const range = { startLineNumber: lineNumber, startColumn: match[0].length + 1, endLineNumber: lineNumber, endColumn: lineContent.length + 1 };
      if (range.endColumn > range.startColumn) {
        const sectionHeader = {
          range,
          ...getHeaderText(lineContent.substring(match[0].length)),
          shouldBeInComments: false
        };
        if (sectionHeader.text || sectionHeader.hasSeparatorLine) {
          regionHeaders.push(sectionHeader);
        }
      }
    }
  }
  return regionHeaders;
}
__name(collectRegionHeaders, "collectRegionHeaders");
function collectMarkHeaders(model) {
  const markHeaders = [];
  const endLineNumber = model.getLineCount();
  for (let lineNumber = 1; lineNumber <= endLineNumber; lineNumber++) {
    const lineContent = model.getLineContent(lineNumber);
    addMarkHeaderIfFound(lineContent, lineNumber, markHeaders);
  }
  return markHeaders;
}
__name(collectMarkHeaders, "collectMarkHeaders");
function addMarkHeaderIfFound(lineContent, lineNumber, sectionHeaders) {
  markRegex.lastIndex = 0;
  const match = markRegex.exec(lineContent);
  if (match) {
    const column = match.indices[1][0] + 1;
    const endColumn = match.indices[1][1] + 1;
    const range = { startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn };
    if (range.endColumn > range.startColumn) {
      const sectionHeader = {
        range,
        ...getHeaderText(match[1]),
        shouldBeInComments: true
      };
      if (sectionHeader.text || sectionHeader.hasSeparatorLine) {
        sectionHeaders.push(sectionHeader);
      }
    }
  }
}
__name(addMarkHeaderIfFound, "addMarkHeaderIfFound");
function getHeaderText(text) {
  text = text.trim();
  const hasSeparatorLine = text.startsWith("-");
  text = text.replace(trimDashesRegex, "");
  return { text, hasSeparatorLine };
}
__name(getHeaderText, "getHeaderText");
export {
  findSectionHeaders
};
//# sourceMappingURL=findSectionHeaders.js.map
