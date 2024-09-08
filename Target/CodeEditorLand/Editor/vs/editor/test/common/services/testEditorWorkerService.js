class TestEditorWorkerService {
  canComputeUnicodeHighlights(uri) {
    return false;
  }
  async computedUnicodeHighlights(uri) {
    return {
      ranges: [],
      hasMore: false,
      ambiguousCharacterCount: 0,
      invisibleCharacterCount: 0,
      nonBasicAsciiCharacterCount: 0
    };
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
