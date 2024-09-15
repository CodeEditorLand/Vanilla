var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { IRange } from "../../../common/core/range.js";
import { DiffAlgorithmName, IEditorWorkerService, IUnicodeHighlightsResult } from "../../../common/services/editorWorker.js";
import { TextEdit, IInplaceReplaceSupportResult, IColorInformation } from "../../../common/languages.js";
import { IDocumentDiff, IDocumentDiffProviderOptions } from "../../../common/diff/documentDiffProvider.js";
import { IChange } from "../../../common/diff/legacyLinesDiffComputer.js";
import { SectionHeader } from "../../../common/services/findSectionHeaders.js";
class TestEditorWorkerService {
  static {
    __name(this, "TestEditorWorkerService");
  }
  canComputeUnicodeHighlights(uri) {
    return false;
  }
  async computedUnicodeHighlights(uri) {
    return { ranges: [], hasMore: false, ambiguousCharacterCount: 0, invisibleCharacterCount: 0, nonBasicAsciiCharacterCount: 0 };
  }
  async computeDiff(original, modified, options, algorithm) {
    return null;
  }
  canComputeDirtyDiff(original, modified) {
    return false;
  }
  async computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
    return null;
  }
  async computeMoreMinimalEdits(resource, edits) {
    return void 0;
  }
  async computeHumanReadableDiff(resource, edits) {
    return void 0;
  }
  canComputeWordRanges(resource) {
    return false;
  }
  async computeWordRanges(resource, range) {
    return null;
  }
  canNavigateValueSet(resource) {
    return false;
  }
  async navigateValueSet(resource, range, up) {
    return null;
  }
  async findSectionHeaders(uri) {
    return [];
  }
  async computeDefaultDocumentColors(uri) {
    return null;
  }
}
export {
  TestEditorWorkerService
};
//# sourceMappingURL=testEditorWorkerService.js.map
