var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { coalesce } from "../../../../base/common/arrays.js";
import { URI } from "../../../../base/common/uri.js";
import "./media/searchEditor.css";
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { Range } from "../../../../editor/common/core/range.js";
import { localize } from "../../../../nls.js";
import { FileMatch, Match, searchMatchComparer, SearchResult, FolderMatch, CellMatch } from "../../search/browser/searchModel.js";
import { ITextQuery, SearchSortOrder } from "../../../services/search/common/search.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
const lineDelimiter = "\n";
const translateRangeLines = /* @__PURE__ */ __name((n) => (range) => new Range(range.startLineNumber + n, range.startColumn, range.endLineNumber + n, range.endColumn), "translateRangeLines");
const matchToSearchResultFormat = /* @__PURE__ */ __name((match, longestLineNumber) => {
  const getLinePrefix = /* @__PURE__ */ __name((i) => `${match.range().startLineNumber + i}`, "getLinePrefix");
  const fullMatchLines = match.fullPreviewLines();
  const results = [];
  fullMatchLines.forEach((sourceLine, i) => {
    const lineNumber = getLinePrefix(i);
    const paddingStr = " ".repeat(longestLineNumber - lineNumber.length);
    const prefix = `  ${paddingStr}${lineNumber}: `;
    const prefixOffset = prefix.length;
    const line = prefix + (sourceLine.split(/\r?\n?$/, 1)[0] || "");
    const rangeOnThisLine = /* @__PURE__ */ __name(({ start, end }) => new Range(1, (start ?? 1) + prefixOffset, 1, (end ?? sourceLine.length + 1) + prefixOffset), "rangeOnThisLine");
    const matchRange = match.rangeInPreview();
    const matchIsSingleLine = matchRange.startLineNumber === matchRange.endLineNumber;
    let lineRange;
    if (matchIsSingleLine) {
      lineRange = rangeOnThisLine({ start: matchRange.startColumn, end: matchRange.endColumn });
    } else if (i === 0) {
      lineRange = rangeOnThisLine({ start: matchRange.startColumn });
    } else if (i === fullMatchLines.length - 1) {
      lineRange = rangeOnThisLine({ end: matchRange.endColumn });
    } else {
      lineRange = rangeOnThisLine({});
    }
    results.push({ lineNumber, line, ranges: [lineRange] });
  });
  return results;
}, "matchToSearchResultFormat");
function fileMatchToSearchResultFormat(fileMatch, labelFormatter) {
  const textSerializations = fileMatch.textMatches().length > 0 ? matchesToSearchResultFormat(fileMatch.resource, fileMatch.textMatches().sort(searchMatchComparer), fileMatch.context, labelFormatter) : void 0;
  const cellSerializations = fileMatch.cellMatches().sort((a, b) => a.cellIndex - b.cellIndex).sort().filter((cellMatch) => cellMatch.contentMatches.length > 0).map((cellMatch, index) => cellMatchToSearchResultFormat(cellMatch, labelFormatter, index === 0));
  return [textSerializations, ...cellSerializations].filter((x) => !!x);
}
__name(fileMatchToSearchResultFormat, "fileMatchToSearchResultFormat");
function matchesToSearchResultFormat(resource, sortedMatches, matchContext, labelFormatter, shouldUseHeader = true) {
  const longestLineNumber = sortedMatches[sortedMatches.length - 1].range().endLineNumber.toString().length;
  const text = shouldUseHeader ? [`${labelFormatter(resource)}:`] : [];
  const matchRanges = [];
  const targetLineNumberToOffset = {};
  const context = [];
  matchContext.forEach((line, lineNumber) => context.push({ line, lineNumber }));
  context.sort((a, b) => a.lineNumber - b.lineNumber);
  let lastLine = void 0;
  const seenLines = /* @__PURE__ */ new Set();
  sortedMatches.forEach((match) => {
    matchToSearchResultFormat(match, longestLineNumber).forEach((match2) => {
      if (!seenLines.has(match2.lineNumber)) {
        while (context.length && context[0].lineNumber < +match2.lineNumber) {
          const { line, lineNumber } = context.shift();
          if (lastLine !== void 0 && lineNumber !== lastLine + 1) {
            text.push("");
          }
          text.push(`  ${" ".repeat(longestLineNumber - `${lineNumber}`.length)}${lineNumber}  ${line}`);
          lastLine = lineNumber;
        }
        targetLineNumberToOffset[match2.lineNumber] = text.length;
        seenLines.add(match2.lineNumber);
        text.push(match2.line);
        lastLine = +match2.lineNumber;
      }
      matchRanges.push(...match2.ranges.map(translateRangeLines(targetLineNumberToOffset[match2.lineNumber])));
    });
  });
  while (context.length) {
    const { line, lineNumber } = context.shift();
    text.push(`  ${lineNumber}  ${line}`);
  }
  return { text, matchRanges };
}
__name(matchesToSearchResultFormat, "matchesToSearchResultFormat");
function cellMatchToSearchResultFormat(cellMatch, labelFormatter, shouldUseHeader) {
  return matchesToSearchResultFormat(cellMatch.cell?.uri ?? cellMatch.parent.resource, cellMatch.contentMatches.sort(searchMatchComparer), cellMatch.context, labelFormatter, shouldUseHeader);
}
__name(cellMatchToSearchResultFormat, "cellMatchToSearchResultFormat");
const contentPatternToSearchConfiguration = /* @__PURE__ */ __name((pattern, includes, excludes, contextLines) => {
  return {
    query: pattern.contentPattern.pattern,
    isRegexp: !!pattern.contentPattern.isRegExp,
    isCaseSensitive: !!pattern.contentPattern.isCaseSensitive,
    matchWholeWord: !!pattern.contentPattern.isWordMatch,
    filesToExclude: excludes,
    filesToInclude: includes,
    showIncludesExcludes: !!(includes || excludes || pattern?.userDisabledExcludesAndIgnoreFiles),
    useExcludeSettingsAndIgnoreFiles: pattern?.userDisabledExcludesAndIgnoreFiles === void 0 ? true : !pattern.userDisabledExcludesAndIgnoreFiles,
    contextLines,
    onlyOpenEditors: !!pattern.onlyOpenEditors,
    notebookSearchConfig: {
      includeMarkupInput: !!pattern.contentPattern.notebookInfo?.isInNotebookMarkdownInput,
      includeMarkupPreview: !!pattern.contentPattern.notebookInfo?.isInNotebookMarkdownPreview,
      includeCodeInput: !!pattern.contentPattern.notebookInfo?.isInNotebookCellInput,
      includeOutput: !!pattern.contentPattern.notebookInfo?.isInNotebookCellOutput
    }
  };
}, "contentPatternToSearchConfiguration");
const serializeSearchConfiguration = /* @__PURE__ */ __name((config) => {
  const removeNullFalseAndUndefined = /* @__PURE__ */ __name((a) => a.filter((a2) => a2 !== false && a2 !== null && a2 !== void 0), "removeNullFalseAndUndefined");
  const escapeNewlines = /* @__PURE__ */ __name((str) => str.replace(/\\/g, "\\\\").replace(/\n/g, "\\n"), "escapeNewlines");
  return removeNullFalseAndUndefined([
    `# Query: ${escapeNewlines(config.query ?? "")}`,
    (config.isCaseSensitive || config.matchWholeWord || config.isRegexp || config.useExcludeSettingsAndIgnoreFiles === false) && `# Flags: ${coalesce([
      config.isCaseSensitive && "CaseSensitive",
      config.matchWholeWord && "WordMatch",
      config.isRegexp && "RegExp",
      config.onlyOpenEditors && "OpenEditors",
      config.useExcludeSettingsAndIgnoreFiles === false && "IgnoreExcludeSettings"
    ]).join(" ")}`,
    config.filesToInclude ? `# Including: ${config.filesToInclude}` : void 0,
    config.filesToExclude ? `# Excluding: ${config.filesToExclude}` : void 0,
    config.contextLines ? `# ContextLines: ${config.contextLines}` : void 0,
    ""
  ]).join(lineDelimiter);
}, "serializeSearchConfiguration");
const extractSearchQueryFromModel = /* @__PURE__ */ __name((model) => extractSearchQueryFromLines(model.getValueInRange(new Range(1, 1, 6, 1)).split(lineDelimiter)), "extractSearchQueryFromModel");
const defaultSearchConfig = /* @__PURE__ */ __name(() => ({
  query: "",
  filesToInclude: "",
  filesToExclude: "",
  isRegexp: false,
  isCaseSensitive: false,
  useExcludeSettingsAndIgnoreFiles: true,
  matchWholeWord: false,
  contextLines: 0,
  showIncludesExcludes: false,
  onlyOpenEditors: false,
  notebookSearchConfig: {
    includeMarkupInput: true,
    includeMarkupPreview: false,
    includeCodeInput: true,
    includeOutput: true
  }
}), "defaultSearchConfig");
const extractSearchQueryFromLines = /* @__PURE__ */ __name((lines) => {
  const query = defaultSearchConfig();
  const unescapeNewlines = /* @__PURE__ */ __name((str) => {
    let out = "";
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "\\") {
        i++;
        const escaped = str[i];
        if (escaped === "n") {
          out += "\n";
        } else if (escaped === "\\") {
          out += "\\";
        } else {
          throw Error(localize("invalidQueryStringError", "All backslashes in Query string must be escaped (\\\\)"));
        }
      } else {
        out += str[i];
      }
    }
    return out;
  }, "unescapeNewlines");
  const parseYML = /^# ([^:]*): (.*)$/;
  for (const line of lines) {
    const parsed = parseYML.exec(line);
    if (!parsed) {
      continue;
    }
    const [, key, value] = parsed;
    switch (key) {
      case "Query":
        query.query = unescapeNewlines(value);
        break;
      case "Including":
        query.filesToInclude = value;
        break;
      case "Excluding":
        query.filesToExclude = value;
        break;
      case "ContextLines":
        query.contextLines = +value;
        break;
      case "Flags": {
        query.isRegexp = value.indexOf("RegExp") !== -1;
        query.isCaseSensitive = value.indexOf("CaseSensitive") !== -1;
        query.useExcludeSettingsAndIgnoreFiles = value.indexOf("IgnoreExcludeSettings") === -1;
        query.matchWholeWord = value.indexOf("WordMatch") !== -1;
        query.onlyOpenEditors = value.indexOf("OpenEditors") !== -1;
      }
    }
  }
  query.showIncludesExcludes = !!(query.filesToInclude || query.filesToExclude || !query.useExcludeSettingsAndIgnoreFiles);
  return query;
}, "extractSearchQueryFromLines");
const serializeSearchResultForEditor = /* @__PURE__ */ __name((searchResult, rawIncludePattern, rawExcludePattern, contextLines, labelFormatter, sortOrder, limitHit) => {
  if (!searchResult.query) {
    throw Error("Internal Error: Expected query, got null");
  }
  const config = contentPatternToSearchConfiguration(searchResult.query, rawIncludePattern, rawExcludePattern, contextLines);
  const filecount = searchResult.fileCount() > 1 ? localize("numFiles", "{0} files", searchResult.fileCount()) : localize("oneFile", "1 file");
  const resultcount = searchResult.count() > 1 ? localize("numResults", "{0} results", searchResult.count()) : localize("oneResult", "1 result");
  const info = [
    searchResult.count() ? `${resultcount} - ${filecount}` : localize("noResults", "No Results")
  ];
  if (limitHit) {
    info.push(localize("searchMaxResultsWarning", "The result set only contains a subset of all matches. Be more specific in your search to narrow down the results."));
  }
  info.push("");
  const matchComparer = /* @__PURE__ */ __name((a, b) => searchMatchComparer(a, b, sortOrder), "matchComparer");
  const allResults = flattenSearchResultSerializations(
    searchResult.folderMatches().sort(matchComparer).map((folderMatch) => folderMatch.allDownstreamFileMatches().sort(matchComparer).flatMap((fileMatch) => fileMatchToSearchResultFormat(fileMatch, labelFormatter))).flat()
  );
  return {
    matchRanges: allResults.matchRanges.map(translateRangeLines(info.length)),
    text: info.concat(allResults.text).join(lineDelimiter),
    config
  };
}, "serializeSearchResultForEditor");
const flattenSearchResultSerializations = /* @__PURE__ */ __name((serializations) => {
  const text = [];
  const matchRanges = [];
  serializations.forEach((serialized) => {
    serialized.matchRanges.map(translateRangeLines(text.length)).forEach((range) => matchRanges.push(range));
    serialized.text.forEach((line) => text.push(line));
    text.push("");
  });
  return { text, matchRanges };
}, "flattenSearchResultSerializations");
const parseSavedSearchEditor = /* @__PURE__ */ __name(async (accessor, resource) => {
  const textFileService = accessor.get(ITextFileService);
  const text = (await textFileService.read(resource)).value;
  return parseSerializedSearchEditor(text);
}, "parseSavedSearchEditor");
const parseSerializedSearchEditor = /* @__PURE__ */ __name((text) => {
  const headerlines = [];
  const bodylines = [];
  let inHeader = true;
  for (const line of text.split(/\r?\n/g)) {
    if (inHeader) {
      headerlines.push(line);
      if (line === "") {
        inHeader = false;
      }
    } else {
      bodylines.push(line);
    }
  }
  return { config: extractSearchQueryFromLines(headerlines), text: bodylines.join("\n") };
}, "parseSerializedSearchEditor");
export {
  defaultSearchConfig,
  extractSearchQueryFromLines,
  extractSearchQueryFromModel,
  parseSavedSearchEditor,
  parseSerializedSearchEditor,
  serializeSearchConfiguration,
  serializeSearchResultForEditor
};
//# sourceMappingURL=searchEditorSerialization.js.map
