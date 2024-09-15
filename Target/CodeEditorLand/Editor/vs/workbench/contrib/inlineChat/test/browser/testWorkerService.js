var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { assertType } from "../../../../../base/common/types.js";
import { DiffAlgorithmName, IEditorWorkerService, ILineChange } from "../../../../../editor/common/services/editorWorker.js";
import { IDocumentDiff, IDocumentDiffProviderOptions } from "../../../../../editor/common/diff/documentDiffProvider.js";
import { BaseEditorSimpleWorker } from "../../../../../editor/common/services/editorSimpleWorker.js";
import { LineRange } from "../../../../../editor/common/core/lineRange.js";
import { MovedText } from "../../../../../editor/common/diff/linesDiffComputer.js";
import { LineRangeMapping, DetailedLineRangeMapping, RangeMapping } from "../../../../../editor/common/diff/rangeMapping.js";
import { TextEdit } from "../../../../../editor/common/languages.js";
let TestWorkerService = class extends mock() {
  constructor(_modelService) {
    super();
    this._modelService = _modelService;
  }
  static {
    __name(this, "TestWorkerService");
  }
  _worker = new BaseEditorSimpleWorker();
  async computeMoreMinimalEdits(resource, edits, pretty) {
    return void 0;
  }
  async computeDiff(original, modified, options, algorithm) {
    const originalModel = this._modelService.getModel(original);
    const modifiedModel = this._modelService.getModel(modified);
    assertType(originalModel);
    assertType(modifiedModel);
    this._worker.$acceptNewModel({
      url: originalModel.uri.toString(),
      versionId: originalModel.getVersionId(),
      lines: originalModel.getLinesContent(),
      EOL: originalModel.getEOL()
    });
    this._worker.$acceptNewModel({
      url: modifiedModel.uri.toString(),
      versionId: modifiedModel.getVersionId(),
      lines: modifiedModel.getLinesContent(),
      EOL: modifiedModel.getEOL()
    });
    const result = await this._worker.$computeDiff(originalModel.uri.toString(), modifiedModel.uri.toString(), options, algorithm);
    if (!result) {
      return result;
    }
    const diff = {
      identical: result.identical,
      quitEarly: result.quitEarly,
      changes: toLineRangeMappings(result.changes),
      moves: result.moves.map((m) => new MovedText(
        new LineRangeMapping(new LineRange(m[0], m[1]), new LineRange(m[2], m[3])),
        toLineRangeMappings(m[4])
      ))
    };
    return diff;
    function toLineRangeMappings(changes) {
      return changes.map(
        (c) => new DetailedLineRangeMapping(
          new LineRange(c[0], c[1]),
          new LineRange(c[2], c[3]),
          c[4]?.map(
            (c2) => new RangeMapping(
              new Range(c2[0], c2[1], c2[2], c2[3]),
              new Range(c2[4], c2[5], c2[6], c2[7])
            )
          )
        )
      );
    }
    __name(toLineRangeMappings, "toLineRangeMappings");
  }
};
TestWorkerService = __decorateClass([
  __decorateParam(0, IModelService)
], TestWorkerService);
export {
  TestWorkerService
};
//# sourceMappingURL=testWorkerService.js.map
