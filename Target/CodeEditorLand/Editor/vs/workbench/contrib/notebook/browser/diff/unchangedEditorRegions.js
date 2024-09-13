var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { UnchangedRegion } from "../../../../../editor/browser/widget/diffEditor/diffEditorViewModel.js";
import { IEditorWorkerService } from "../../../../../editor/common/services/editorWorker.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { ITextResourceConfigurationService } from "../../../../../editor/common/services/textResourceConfiguration.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { getEditorPadding } from "./diffCellEditorOptions.js";
import { HeightOfHiddenLinesRegionInDiffEditor } from "./diffElementViewModel.js";
class UnchangedEditorRegionsService extends Disposable {
  constructor(configurationService, editorWorkerService, textModelResolverService, textConfigurationService, lineHeight) {
    super();
    this.editorWorkerService = editorWorkerService;
    this.textModelResolverService = textModelResolverService;
    this.textConfigurationService = textConfigurationService;
    this.lineHeight = lineHeight;
    this.options = this._register(createHideUnchangedRegionOptions(configurationService));
  }
  static {
    __name(this, "UnchangedEditorRegionsService");
  }
  options;
  static Empty = {
    options: {
      enabled: false,
      contextLineCount: 0,
      minimumLineCount: 0,
      revealLineCount: 0,
      onDidChangeEnablement: Event.None
    },
    computeEditorHeight: /* @__PURE__ */ __name((_originalUri, _modifiedUri) => Promise.resolve(0), "computeEditorHeight")
  };
  async computeEditorHeight(originalUri, modifiedUri) {
    const { numberOfUnchangedRegions, numberOfVisibleLines } = await computeInputUnchangedLines(originalUri, modifiedUri, this.options, this.editorWorkerService, this.textModelResolverService, this.textConfigurationService);
    const lineCount = numberOfVisibleLines;
    const unchangeRegionsHeight = numberOfUnchangedRegions * HeightOfHiddenLinesRegionInDiffEditor;
    return lineCount * this.lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom + unchangeRegionsHeight;
  }
}
function createHideUnchangedRegionOptions(configurationService) {
  const disposables = new DisposableStore();
  const unchangedRegionsEnablementEmitter = disposables.add(new Emitter());
  const options = {
    enabled: configurationService.getValue("diffEditor.hideUnchangedRegions.enabled"),
    minimumLineCount: configurationService.getValue("diffEditor.hideUnchangedRegions.minimumLineCount"),
    contextLineCount: configurationService.getValue("diffEditor.hideUnchangedRegions.contextLineCount"),
    revealLineCount: configurationService.getValue("diffEditor.hideUnchangedRegions.revealLineCount"),
    // We only care about enable/disablement.
    // If user changes counters when a diff editor is open, we do not care, might as well ask user to reload.
    // Simpler and almost never going to happen.
    onDidChangeEnablement: unchangedRegionsEnablementEmitter.event.bind(unchangedRegionsEnablementEmitter),
    dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose")
  };
  disposables.add(configurationService.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("diffEditor.hideUnchangedRegions.minimumLineCount")) {
      options.minimumLineCount = configurationService.getValue("diffEditor.hideUnchangedRegions.minimumLineCount");
    }
    if (e.affectsConfiguration("diffEditor.hideUnchangedRegions.contextLineCount")) {
      options.contextLineCount = configurationService.getValue("diffEditor.hideUnchangedRegions.contextLineCount");
    }
    if (e.affectsConfiguration("diffEditor.hideUnchangedRegions.revealLineCount")) {
      options.revealLineCount = configurationService.getValue("diffEditor.hideUnchangedRegions.revealLineCount");
    }
    if (e.affectsConfiguration("diffEditor.hideUnchangedRegions.enabled")) {
      options.enabled = configurationService.getValue("diffEditor.hideUnchangedRegions.enabled");
      unchangedRegionsEnablementEmitter.fire(options.enabled);
    }
  }));
  return options;
}
__name(createHideUnchangedRegionOptions, "createHideUnchangedRegionOptions");
async function computeInputUnchangedLines(originalUri, modifiedUri, unchangedRegionOptions, editorWorkerService, textModelResolverService, textConfigurationService) {
  const [originalModel, modifiedModel] = await Promise.all([textModelResolverService.createModelReference(originalUri), textModelResolverService.createModelReference(modifiedUri)]);
  try {
    const ignoreTrimWhitespace = textConfigurationService.getValue(originalUri, "diffEditor.ignoreTrimWhitespace");
    const diff = await editorWorkerService.computeDiff(originalUri, modifiedUri, {
      ignoreTrimWhitespace,
      maxComputationTimeMs: 0,
      computeMoves: false
    }, "advanced");
    const originalLineCount = originalModel.object.textEditorModel.getLineCount();
    const modifiedLineCount = modifiedModel.object.textEditorModel.getLineCount();
    const unchanged = diff ? UnchangedRegion.fromDiffs(
      diff.changes,
      originalLineCount,
      modifiedLineCount,
      unchangedRegionOptions.minimumLineCount ?? 3,
      unchangedRegionOptions.contextLineCount ?? 3
    ) : [];
    const totalLines = Math.max(originalLineCount, modifiedLineCount);
    const numberOfUnchangedRegions = unchanged.length;
    const numberOfVisibleLines = totalLines - unchanged.reduce((prev, curr) => prev + curr.lineCount, 0);
    return { numberOfUnchangedRegions, numberOfVisibleLines };
  } finally {
    originalModel.dispose();
    modifiedModel.dispose();
  }
}
__name(computeInputUnchangedLines, "computeInputUnchangedLines");
export {
  UnchangedEditorRegionsService
};
//# sourceMappingURL=unchangedEditorRegions.js.map
