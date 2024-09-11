var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { asArray, coalesce } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { URI } from "../../../../base/common/uri.js";
import { IProgress } from "../../../../platform/progress/common/progress.js";
import { DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS } from "./search.js";
import { Range, FileSearchProviderNew, FileSearchProviderOptions, ProviderResult, TextSearchCompleteNew, TextSearchContextNew, TextSearchMatchNew, TextSearchProviderNew, TextSearchProviderOptions, TextSearchQueryNew, TextSearchResultNew, AITextSearchProviderNew, TextSearchCompleteMessage } from "./searchExtTypes.js";
function isTextSearchMatch(object) {
  return "uri" in object && "ranges" in object && "preview" in object;
}
__name(isTextSearchMatch, "isTextSearchMatch");
function newToOldFileProviderOptions(options) {
  return options.folderOptions.map((folderOption) => ({
    folder: folderOption.folder,
    excludes: folderOption.excludes.map((e) => typeof e === "string" ? e : e.pattern),
    includes: folderOption.includes,
    useGlobalIgnoreFiles: folderOption.useIgnoreFiles.global,
    useIgnoreFiles: folderOption.useIgnoreFiles.local,
    useParentIgnoreFiles: folderOption.useIgnoreFiles.parent,
    followSymlinks: folderOption.followSymlinks,
    maxResults: options.maxResults,
    session: options.session
    // TODO: make sure that we actually use a cancellation token here.
  }));
}
__name(newToOldFileProviderOptions, "newToOldFileProviderOptions");
class OldFileSearchProviderConverter {
  constructor(provider) {
    this.provider = provider;
  }
  static {
    __name(this, "OldFileSearchProviderConverter");
  }
  provideFileSearchResults(pattern, options, token) {
    const getResult = /* @__PURE__ */ __name(async () => {
      const newOpts = newToOldFileProviderOptions(options);
      return Promise.all(newOpts.map(
        (o) => this.provider.provideFileSearchResults({ pattern }, o, token)
      ));
    }, "getResult");
    return getResult().then((e) => coalesce(e).flat());
  }
}
function newToOldTextProviderOptions(options) {
  return options.folderOptions.map((folderOption) => ({
    folder: folderOption.folder,
    excludes: folderOption.excludes.map((e) => typeof e === "string" ? e : e.pattern),
    includes: folderOption.includes,
    useGlobalIgnoreFiles: folderOption.useIgnoreFiles.global,
    useIgnoreFiles: folderOption.useIgnoreFiles.local,
    useParentIgnoreFiles: folderOption.useIgnoreFiles.parent,
    followSymlinks: folderOption.followSymlinks,
    maxResults: options.maxResults,
    previewOptions: newToOldPreviewOptions(options.previewOptions),
    maxFileSize: options.maxFileSize,
    encoding: folderOption.encoding,
    afterContext: options.surroundingContext,
    beforeContext: options.surroundingContext
  }));
}
__name(newToOldTextProviderOptions, "newToOldTextProviderOptions");
function newToOldPreviewOptions(options) {
  return {
    matchLines: options?.matchLines ?? DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS.matchLines,
    charsPerLine: options?.charsPerLine ?? DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS.charsPerLine
  };
}
__name(newToOldPreviewOptions, "newToOldPreviewOptions");
function oldToNewTextSearchResult(result) {
  if (isTextSearchMatch(result)) {
    const ranges = asArray(result.ranges).map((r, i) => {
      const previewArr = asArray(result.preview.matches);
      const matchingPreviewRange = previewArr[i];
      return { sourceRange: r, previewRange: matchingPreviewRange };
    });
    return new TextSearchMatchNew(result.uri, ranges, result.preview.text);
  } else {
    return new TextSearchContextNew(result.uri, result.text, result.lineNumber);
  }
}
__name(oldToNewTextSearchResult, "oldToNewTextSearchResult");
class OldTextSearchProviderConverter {
  constructor(provider) {
    this.provider = provider;
  }
  static {
    __name(this, "OldTextSearchProviderConverter");
  }
  provideTextSearchResults(query, options, progress, token) {
    const progressShim = /* @__PURE__ */ __name((oldResult2) => {
      if (!validateProviderResult(oldResult2)) {
        return;
      }
      progress.report(oldToNewTextSearchResult(oldResult2));
    }, "progressShim");
    const getResult = /* @__PURE__ */ __name(async () => {
      return coalesce(await Promise.all(
        newToOldTextProviderOptions(options).map(
          (o) => this.provider.provideTextSearchResults(query, o, { report: /* @__PURE__ */ __name((e) => progressShim(e), "report") }, token)
        )
      )).reduce(
        (prev, cur) => ({ limitHit: prev.limitHit || cur.limitHit }),
        { limitHit: false }
      );
    }, "getResult");
    const oldResult = getResult();
    return oldResult.then((e) => {
      return {
        limitHit: e.limitHit,
        message: coalesce(asArray(e.message))
      };
    });
  }
}
class OldAITextSearchProviderConverter {
  constructor(provider) {
    this.provider = provider;
  }
  static {
    __name(this, "OldAITextSearchProviderConverter");
  }
  provideAITextSearchResults(query, options, progress, token) {
    const progressShim = /* @__PURE__ */ __name((oldResult2) => {
      if (!validateProviderResult(oldResult2)) {
        return;
      }
      progress.report(oldToNewTextSearchResult(oldResult2));
    }, "progressShim");
    const getResult = /* @__PURE__ */ __name(async () => {
      return coalesce(await Promise.all(
        newToOldTextProviderOptions(options).map(
          (o) => this.provider.provideAITextSearchResults(query, o, { report: /* @__PURE__ */ __name((e) => progressShim(e), "report") }, token)
        )
      )).reduce(
        (prev, cur) => ({ limitHit: prev.limitHit || cur.limitHit }),
        { limitHit: false }
      );
    }, "getResult");
    const oldResult = getResult();
    return oldResult.then((e) => {
      return {
        limitHit: e.limitHit,
        message: coalesce(asArray(e.message))
      };
    });
  }
}
function validateProviderResult(result) {
  if (extensionResultIsMatch(result)) {
    if (Array.isArray(result.ranges)) {
      if (!Array.isArray(result.preview.matches)) {
        console.warn("INVALID - A text search provider match's`ranges` and`matches` properties must have the same type.");
        return false;
      }
      if (result.preview.matches.length !== result.ranges.length) {
        console.warn("INVALID - A text search provider match's`ranges` and`matches` properties must have the same length.");
        return false;
      }
    } else {
      if (Array.isArray(result.preview.matches)) {
        console.warn("INVALID - A text search provider match's`ranges` and`matches` properties must have the same length.");
        return false;
      }
    }
  }
  return true;
}
__name(validateProviderResult, "validateProviderResult");
function extensionResultIsMatch(data) {
  return !!data.preview;
}
__name(extensionResultIsMatch, "extensionResultIsMatch");
export {
  OldAITextSearchProviderConverter,
  OldFileSearchProviderConverter,
  OldTextSearchProviderConverter,
  extensionResultIsMatch,
  newToOldPreviewOptions,
  oldToNewTextSearchResult
};
//# sourceMappingURL=searchExtConversionTypes.js.map
