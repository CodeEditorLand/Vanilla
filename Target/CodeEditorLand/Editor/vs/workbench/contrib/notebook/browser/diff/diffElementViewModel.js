var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { hash } from "../../../../../base/common/hash.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { DiffEditorWidget } from "../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";
import { FontInfo } from "../../../../../editor/common/config/fontInfo.js";
import * as editorCommon from "../../../../../editor/common/editorCommon.js";
import { getEditorPadding } from "./diffCellEditorOptions.js";
import { DiffNestedCellViewModel } from "./diffNestedCellViewModel.js";
import { NotebookDiffEditorEventDispatcher, NotebookDiffViewEventType } from "./eventDispatcher.js";
import { CellDiffViewModelLayoutChangeEvent, DIFF_CELL_MARGIN, DiffSide, IDiffElementLayoutInfo } from "./notebookDiffEditorBrowser.js";
import { CellLayoutState, IGenericCellViewModel } from "../notebookBrowser.js";
import { NotebookLayoutInfo } from "../notebookViewEvents.js";
import { getFormattedMetadataJSON, NotebookCellTextModel } from "../../common/model/notebookCellTextModel.js";
import { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import { CellUri, ICellOutput, INotebookTextModel, IOutputDto, IOutputItemDto } from "../../common/notebookCommon.js";
import { INotebookService } from "../../common/notebookService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IUnchangedEditorRegionsService } from "./unchangedEditorRegions.js";
import { Schemas } from "../../../../../base/common/network.js";
const HeightOfHiddenLinesRegionInDiffEditor = 24;
const DefaultLineHeight = 17;
var PropertyFoldingState = /* @__PURE__ */ ((PropertyFoldingState2) => {
  PropertyFoldingState2[PropertyFoldingState2["Expanded"] = 0] = "Expanded";
  PropertyFoldingState2[PropertyFoldingState2["Collapsed"] = 1] = "Collapsed";
  return PropertyFoldingState2;
})(PropertyFoldingState || {});
const OUTPUT_EDITOR_HEIGHT_MAGIC = 1440;
class DiffElementViewModelBase extends Disposable {
  constructor(mainDocumentTextModel, editorEventDispatcher, initData) {
    super();
    this.mainDocumentTextModel = mainDocumentTextModel;
    this.editorEventDispatcher = editorEventDispatcher;
    this.initData = initData;
    this._register(this.editorEventDispatcher.onDidChangeLayout((e) => this._layoutInfoEmitter.fire({ outerWidth: true })));
  }
  static {
    __name(this, "DiffElementViewModelBase");
  }
  _layoutInfoEmitter = this._register(new Emitter());
  onDidLayoutChange = this._layoutInfoEmitter.event;
}
class DiffElementPlaceholderViewModel extends DiffElementViewModelBase {
  static {
    __name(this, "DiffElementPlaceholderViewModel");
  }
  type = "placeholder";
  hiddenCells = [];
  _unfoldHiddenCells = this._register(new Emitter());
  onUnfoldHiddenCells = this._unfoldHiddenCells.event;
  constructor(mainDocumentTextModel, editorEventDispatcher, initData) {
    super(mainDocumentTextModel, editorEventDispatcher, initData);
  }
  get totalHeight() {
    return 24 + 2 * DIFF_CELL_MARGIN;
  }
  getHeight(_) {
    return this.totalHeight;
  }
  layoutChange() {
  }
  showHiddenCells() {
    this._unfoldHiddenCells.fire();
  }
}
class DiffElementCellViewModelBase extends DiffElementViewModelBase {
  constructor(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, index, configurationService, unchangedRegionsService) {
    super(mainDocumentTextModel, editorEventDispatcher, initData);
    this.type = type;
    this.index = index;
    this.configurationService = configurationService;
    this.unchangedRegionsService = unchangedRegionsService;
    this.original = original ? this._register(new DiffNestedCellViewModel(original, notebookService)) : void 0;
    this.modified = modified ? this._register(new DiffNestedCellViewModel(modified, notebookService)) : void 0;
    const editorHeight = this._estimateEditorHeight(initData.fontInfo);
    const cellStatusHeight = 25;
    this._layoutInfo = {
      width: 0,
      editorHeight,
      editorMargin: 0,
      metadataHeight: 0,
      cellStatusHeight,
      metadataStatusHeight: 25,
      rawOutputHeight: 0,
      outputTotalHeight: 0,
      outputStatusHeight: 25,
      outputMetadataHeight: 0,
      bodyMargin: 32,
      totalHeight: 82 + cellStatusHeight + editorHeight,
      layoutState: CellLayoutState.Uninitialized
    };
    this.cellFoldingState = modified?.getTextBufferHash() !== original?.getTextBufferHash() ? 0 /* Expanded */ : 1 /* Collapsed */;
    this.metadataFoldingState = 1 /* Collapsed */;
    this.outputFoldingState = 1 /* Collapsed */;
    this._register(this.editorEventDispatcher.onDidChangeLayout((e) => this._layoutInfoEmitter.fire({ outerWidth: true })));
  }
  static {
    __name(this, "DiffElementCellViewModelBase");
  }
  cellFoldingState;
  metadataFoldingState;
  outputFoldingState;
  _stateChangeEmitter = this._register(new Emitter());
  onDidStateChange = this._stateChangeEmitter.event;
  _layoutInfo;
  displayIconToHideUnmodifiedCells;
  _hideUnchangedCells = this._register(new Emitter());
  onHideUnchangedCells = this._hideUnchangedCells.event;
  hideUnchangedCells() {
    this._hideUnchangedCells.fire();
  }
  set rawOutputHeight(height) {
    this._layout({ rawOutputHeight: Math.min(OUTPUT_EDITOR_HEIGHT_MAGIC, height) });
  }
  get rawOutputHeight() {
    throw new Error("Use Cell.layoutInfo.rawOutputHeight");
  }
  set outputStatusHeight(height) {
    this._layout({ outputStatusHeight: height });
  }
  get outputStatusHeight() {
    throw new Error("Use Cell.layoutInfo.outputStatusHeight");
  }
  set outputMetadataHeight(height) {
    this._layout({ outputMetadataHeight: height });
  }
  get outputMetadataHeight() {
    throw new Error("Use Cell.layoutInfo.outputStatusHeight");
  }
  set editorHeight(height) {
    this._layout({ editorHeight: height });
  }
  get editorHeight() {
    throw new Error("Use Cell.layoutInfo.editorHeight");
  }
  set editorMargin(margin) {
    this._layout({ editorMargin: margin });
  }
  get editorMargin() {
    throw new Error("Use Cell.layoutInfo.editorMargin");
  }
  set metadataStatusHeight(height) {
    this._layout({ metadataStatusHeight: height });
  }
  get metadataStatusHeight() {
    throw new Error("Use Cell.layoutInfo.outputStatusHeight");
  }
  set metadataHeight(height) {
    this._layout({ metadataHeight: height });
  }
  get metadataHeight() {
    throw new Error("Use Cell.layoutInfo.metadataHeight");
  }
  _renderOutput = true;
  set renderOutput(value) {
    this._renderOutput = value;
    this._layout({ recomputeOutput: true });
    this._stateChangeEmitter.fire({ renderOutput: this._renderOutput });
  }
  get renderOutput() {
    return this._renderOutput;
  }
  get layoutInfo() {
    return this._layoutInfo;
  }
  get totalHeight() {
    return this.layoutInfo.totalHeight;
  }
  get ignoreOutputs() {
    return this.configurationService.getValue("notebook.diff.ignoreOutputs") || !!this.mainDocumentTextModel?.transientOptions.transientOutputs;
  }
  _sourceEditorViewState = null;
  _outputEditorViewState = null;
  _metadataEditorViewState = null;
  original;
  modified;
  layoutChange() {
    this._layout({ recomputeOutput: true });
  }
  _estimateEditorHeight(fontInfo) {
    const lineHeight = fontInfo?.lineHeight ?? 17;
    switch (this.type) {
      case "unchanged":
      case "insert": {
        const lineCount = this.modified.textModel.textBuffer.getLineCount();
        const editorHeight = lineCount * lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom;
        return editorHeight;
      }
      case "delete":
      case "modified": {
        const lineCount = this.original.textModel.textBuffer.getLineCount();
        const editorHeight = lineCount * lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom;
        return editorHeight;
      }
    }
  }
  _layout(delta) {
    const width = delta.width !== void 0 ? delta.width : this._layoutInfo.width;
    const editorHeight = delta.editorHeight !== void 0 ? delta.editorHeight : this._layoutInfo.editorHeight;
    const editorMargin = delta.editorMargin !== void 0 ? delta.editorMargin : this._layoutInfo.editorMargin;
    const metadataHeight = delta.metadataHeight !== void 0 ? delta.metadataHeight : this._layoutInfo.metadataHeight;
    const cellStatusHeight = delta.cellStatusHeight !== void 0 ? delta.cellStatusHeight : this._layoutInfo.cellStatusHeight;
    const metadataStatusHeight = delta.metadataStatusHeight !== void 0 ? delta.metadataStatusHeight : this._layoutInfo.metadataStatusHeight;
    const rawOutputHeight = delta.rawOutputHeight !== void 0 ? delta.rawOutputHeight : this._layoutInfo.rawOutputHeight;
    const outputStatusHeight = delta.outputStatusHeight !== void 0 ? delta.outputStatusHeight : this._layoutInfo.outputStatusHeight;
    const bodyMargin = delta.bodyMargin !== void 0 ? delta.bodyMargin : this._layoutInfo.bodyMargin;
    const outputMetadataHeight = delta.outputMetadataHeight !== void 0 ? delta.outputMetadataHeight : this._layoutInfo.outputMetadataHeight;
    const outputHeight = this.ignoreOutputs ? 0 : delta.recomputeOutput || delta.rawOutputHeight !== void 0 || delta.outputMetadataHeight !== void 0 ? this._getOutputTotalHeight(rawOutputHeight, outputMetadataHeight) : this._layoutInfo.outputTotalHeight;
    const totalHeight = editorHeight + editorMargin + cellStatusHeight + metadataHeight + metadataStatusHeight + outputHeight + outputStatusHeight + bodyMargin;
    const newLayout = {
      width,
      editorHeight,
      editorMargin,
      metadataHeight,
      cellStatusHeight,
      metadataStatusHeight,
      outputTotalHeight: outputHeight,
      outputStatusHeight,
      bodyMargin,
      rawOutputHeight,
      outputMetadataHeight,
      totalHeight,
      layoutState: CellLayoutState.Measured
    };
    let somethingChanged = false;
    const changeEvent = {};
    if (newLayout.width !== this._layoutInfo.width) {
      changeEvent.width = true;
      somethingChanged = true;
    }
    if (newLayout.editorHeight !== this._layoutInfo.editorHeight) {
      changeEvent.editorHeight = true;
      somethingChanged = true;
    }
    if (newLayout.editorMargin !== this._layoutInfo.editorMargin) {
      changeEvent.editorMargin = true;
      somethingChanged = true;
    }
    if (newLayout.metadataHeight !== this._layoutInfo.metadataHeight) {
      changeEvent.metadataHeight = true;
      somethingChanged = true;
    }
    if (newLayout.cellStatusHeight !== this._layoutInfo.cellStatusHeight) {
      changeEvent.cellStatusHeight = true;
      somethingChanged = true;
    }
    if (newLayout.metadataStatusHeight !== this._layoutInfo.metadataStatusHeight) {
      changeEvent.metadataStatusHeight = true;
      somethingChanged = true;
    }
    if (newLayout.outputTotalHeight !== this._layoutInfo.outputTotalHeight) {
      changeEvent.outputTotalHeight = true;
      somethingChanged = true;
    }
    if (newLayout.outputStatusHeight !== this._layoutInfo.outputStatusHeight) {
      changeEvent.outputStatusHeight = true;
      somethingChanged = true;
    }
    if (newLayout.bodyMargin !== this._layoutInfo.bodyMargin) {
      changeEvent.bodyMargin = true;
      somethingChanged = true;
    }
    if (newLayout.outputMetadataHeight !== this._layoutInfo.outputMetadataHeight) {
      changeEvent.outputMetadataHeight = true;
      somethingChanged = true;
    }
    if (newLayout.totalHeight !== this._layoutInfo.totalHeight) {
      changeEvent.totalHeight = true;
      somethingChanged = true;
    }
    if (somethingChanged) {
      this._layoutInfo = newLayout;
      this._fireLayoutChangeEvent(changeEvent);
    }
  }
  getHeight(lineHeight) {
    if (this._layoutInfo.layoutState === CellLayoutState.Uninitialized) {
      const editorHeight = this.cellFoldingState === 1 /* Collapsed */ ? 0 : this.computeInputEditorHeight(lineHeight);
      return this._computeTotalHeight(editorHeight);
    } else {
      return this._layoutInfo.totalHeight;
    }
  }
  _computeTotalHeight(editorHeight) {
    const totalHeight = editorHeight + this._layoutInfo.editorMargin + this._layoutInfo.metadataHeight + this._layoutInfo.cellStatusHeight + this._layoutInfo.metadataStatusHeight + this._layoutInfo.outputTotalHeight + this._layoutInfo.outputStatusHeight + this._layoutInfo.outputMetadataHeight + this._layoutInfo.bodyMargin;
    return totalHeight;
  }
  computeInputEditorHeight(lineHeight) {
    const lineCount = Math.max(this.original?.textModel.textBuffer.getLineCount() ?? 1, this.modified?.textModel.textBuffer.getLineCount() ?? 1);
    return lineCount * lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom;
  }
  _getOutputTotalHeight(rawOutputHeight, metadataHeight) {
    if (this.outputFoldingState === 1 /* Collapsed */) {
      return 0;
    }
    if (this.renderOutput) {
      if (this.isOutputEmpty()) {
        return 24;
      }
      return this.getRichOutputTotalHeight() + metadataHeight;
    } else {
      return rawOutputHeight;
    }
  }
  _fireLayoutChangeEvent(state) {
    this._layoutInfoEmitter.fire(state);
    this.editorEventDispatcher.emit([{ type: NotebookDiffViewEventType.CellLayoutChanged, source: this._layoutInfo }]);
  }
  getComputedCellContainerWidth(layoutInfo, diffEditor, fullWidth) {
    if (fullWidth) {
      return layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0) - 2;
    }
    return (layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)) / 2 - 18 - 2;
  }
  getOutputEditorViewState() {
    return this._outputEditorViewState;
  }
  saveOutputEditorViewState(viewState) {
    this._outputEditorViewState = viewState;
  }
  getMetadataEditorViewState() {
    return this._metadataEditorViewState;
  }
  saveMetadataEditorViewState(viewState) {
    this._metadataEditorViewState = viewState;
  }
  getSourceEditorViewState() {
    return this._sourceEditorViewState;
  }
  saveSpirceEditorViewState(viewState) {
    this._sourceEditorViewState = viewState;
  }
}
class SideBySideDiffElementViewModel extends DiffElementCellViewModelBase {
  constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, configurationService, index, unchangedRegionsService) {
    super(
      mainDocumentTextModel,
      original,
      modified,
      type,
      editorEventDispatcher,
      initData,
      notebookService,
      index,
      configurationService,
      unchangedRegionsService
    );
    this.otherDocumentTextModel = otherDocumentTextModel;
    this.type = type;
    this.cellFoldingState = this.modified.textModel.getValue() !== this.original.textModel.getValue() ? 0 /* Expanded */ : 1 /* Collapsed */;
    this.metadataFoldingState = 1 /* Collapsed */;
    this.outputFoldingState = 1 /* Collapsed */;
    if (this.checkMetadataIfModified()) {
      this.metadataFoldingState = 0 /* Expanded */;
    }
    if (this.checkIfOutputsModified()) {
      this.outputFoldingState = 0 /* Expanded */;
    }
    this._register(this.original.onDidChangeOutputLayout(() => {
      this._layout({ recomputeOutput: true });
    }));
    this._register(this.modified.onDidChangeOutputLayout(() => {
      this._layout({ recomputeOutput: true });
    }));
    this._register(this.modified.textModel.onDidChangeContent(() => {
      if (mainDocumentTextModel.transientOptions.cellContentMetadata) {
        const cellMetadataKeys = [...Object.keys(mainDocumentTextModel.transientOptions.cellContentMetadata)];
        const modifiedMedataRaw = Object.assign({}, this.modified.metadata);
        const originalCellMetadata = this.original.metadata;
        for (const key of cellMetadataKeys) {
          if (key in originalCellMetadata) {
            modifiedMedataRaw[key] = originalCellMetadata[key];
          }
        }
        this.modified.textModel.metadata = modifiedMedataRaw;
      }
    }));
  }
  static {
    __name(this, "SideBySideDiffElementViewModel");
  }
  get originalDocument() {
    return this.otherDocumentTextModel;
  }
  get modifiedDocument() {
    return this.mainDocumentTextModel;
  }
  original;
  modified;
  type;
  /**
   * The height of the editor when the unchanged lines are collapsed.
   */
  editorHeightWithUnchangedLinesCollapsed;
  checkIfInputModified() {
    if (this.original.textModel.getTextBufferHash() === this.modified.textModel.getTextBufferHash()) {
      return false;
    }
    return {
      reason: "Cell content has changed"
    };
  }
  checkIfOutputsModified() {
    if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
      return false;
    }
    const ret = outputsEqual(this.original?.outputs ?? [], this.modified?.outputs ?? []);
    if (ret === 0 /* Unchanged */) {
      return false;
    }
    return {
      reason: ret === 1 /* Metadata */ ? "Output metadata has changed" : void 0,
      kind: ret
    };
  }
  checkMetadataIfModified() {
    const modified = hash(getFormattedMetadataJSON(this.mainDocumentTextModel.transientOptions.transientCellMetadata, this.original?.metadata || {}, this.original?.language)) !== hash(getFormattedMetadataJSON(this.mainDocumentTextModel.transientOptions.transientCellMetadata, this.modified?.metadata ?? {}, this.modified?.language));
    if (modified) {
      return { reason: void 0 };
    } else {
      return false;
    }
  }
  updateOutputHeight(diffSide, index, height) {
    if (diffSide === DiffSide.Original) {
      this.original.updateOutputHeight(index, height);
    } else {
      this.modified.updateOutputHeight(index, height);
    }
  }
  getOutputOffsetInContainer(diffSide, index) {
    if (diffSide === DiffSide.Original) {
      return this.original.getOutputOffset(index);
    } else {
      return this.modified.getOutputOffset(index);
    }
  }
  getOutputOffsetInCell(diffSide, index) {
    const offsetInOutputsContainer = this.getOutputOffsetInContainer(diffSide, index);
    return this._layoutInfo.editorHeight + this._layoutInfo.editorMargin + this._layoutInfo.metadataHeight + this._layoutInfo.cellStatusHeight + this._layoutInfo.metadataStatusHeight + this._layoutInfo.outputStatusHeight + this._layoutInfo.bodyMargin / 2 + offsetInOutputsContainer;
  }
  isOutputEmpty() {
    if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
      return true;
    }
    if (this.checkIfOutputsModified()) {
      return false;
    }
    return (this.original?.outputs || []).length === 0;
  }
  getRichOutputTotalHeight() {
    return Math.max(this.original.getOutputTotalHeight(), this.modified.getOutputTotalHeight());
  }
  getNestedCellViewModel(diffSide) {
    return diffSide === DiffSide.Original ? this.original : this.modified;
  }
  getCellByUri(cellUri) {
    if (cellUri.toString() === this.original.uri.toString()) {
      return this.original;
    } else {
      return this.modified;
    }
  }
  computeInputEditorHeight(lineHeight) {
    if (this.type === "modified" && typeof this.editorHeightWithUnchangedLinesCollapsed === "number" && this.unchangedRegionsService.options.enabled && this.checkIfInputModified()) {
      return this.editorHeightWithUnchangedLinesCollapsed;
    }
    return super.computeInputEditorHeight(lineHeight);
  }
  async computeInputEditorHeightWithUnchangedLinesHidden() {
    if (this.checkIfInputModified()) {
      this.editorHeightWithUnchangedLinesCollapsed = this._layoutInfo.editorHeight = await this.unchangedRegionsService.computeEditorHeight(this.original.uri, this.modified.uri);
    }
  }
  async computeMetadataEditorHeightWithUnchangedLinesHidden() {
    if (this.checkMetadataIfModified()) {
      const originalMetadataUri = CellUri.generateCellPropertyUri(this.originalDocument.uri, this.original.handle, Schemas.vscodeNotebookCellMetadata);
      const modifiedMetadataUri = CellUri.generateCellPropertyUri(this.modifiedDocument.uri, this.modified.handle, Schemas.vscodeNotebookCellMetadata);
      this._layoutInfo.metadataHeight = await this.unchangedRegionsService.computeEditorHeight(originalMetadataUri, modifiedMetadataUri);
    }
  }
  async computeEditorHeights() {
    if (this.type === "unchanged" || !this.unchangedRegionsService.options.enabled) {
      return;
    }
    await Promise.all([this.computeInputEditorHeightWithUnchangedLinesHidden(), this.computeMetadataEditorHeightWithUnchangedLinesHidden()]);
  }
}
class SingleSideDiffElementViewModel extends DiffElementCellViewModelBase {
  constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, configurationService, unchangedRegionsService, index) {
    super(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, index, configurationService, unchangedRegionsService);
    this.otherDocumentTextModel = otherDocumentTextModel;
    this.type = type;
    this._register(this.cellViewModel.onDidChangeOutputLayout(() => {
      this._layout({ recomputeOutput: true });
    }));
  }
  static {
    __name(this, "SingleSideDiffElementViewModel");
  }
  get cellViewModel() {
    return this.type === "insert" ? this.modified : this.original;
  }
  get originalDocument() {
    if (this.type === "insert") {
      return this.otherDocumentTextModel;
    } else {
      return this.mainDocumentTextModel;
    }
  }
  get modifiedDocument() {
    if (this.type === "insert") {
      return this.mainDocumentTextModel;
    } else {
      return this.otherDocumentTextModel;
    }
  }
  type;
  checkIfInputModified() {
    return {
      reason: "Cell content has changed"
    };
  }
  getNestedCellViewModel(diffSide) {
    return this.type === "insert" ? this.modified : this.original;
  }
  checkIfOutputsModified() {
    return false;
  }
  checkMetadataIfModified() {
    return false;
  }
  updateOutputHeight(diffSide, index, height) {
    this.cellViewModel?.updateOutputHeight(index, height);
  }
  getOutputOffsetInContainer(diffSide, index) {
    return this.cellViewModel.getOutputOffset(index);
  }
  getOutputOffsetInCell(diffSide, index) {
    const offsetInOutputsContainer = this.cellViewModel.getOutputOffset(index);
    return this._layoutInfo.editorHeight + this._layoutInfo.editorMargin + this._layoutInfo.metadataHeight + this._layoutInfo.cellStatusHeight + this._layoutInfo.metadataStatusHeight + this._layoutInfo.outputStatusHeight + this._layoutInfo.bodyMargin / 2 + offsetInOutputsContainer;
  }
  isOutputEmpty() {
    if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
      return true;
    }
    return (this.original?.outputs || this.modified?.outputs || []).length === 0;
  }
  getRichOutputTotalHeight() {
    return this.cellViewModel?.getOutputTotalHeight() ?? 0;
  }
  getCellByUri(cellUri) {
    return this.cellViewModel;
  }
}
var OutputComparison = /* @__PURE__ */ ((OutputComparison2) => {
  OutputComparison2[OutputComparison2["Unchanged"] = 0] = "Unchanged";
  OutputComparison2[OutputComparison2["Metadata"] = 1] = "Metadata";
  OutputComparison2[OutputComparison2["Other"] = 2] = "Other";
  return OutputComparison2;
})(OutputComparison || {});
function outputEqual(a, b) {
  if (hash(a.metadata) === hash(b.metadata)) {
    return 2 /* Other */;
  }
  for (let j = 0; j < a.outputs.length; j++) {
    const aOutputItem = a.outputs[j];
    const bOutputItem = b.outputs[j];
    if (aOutputItem.mime !== bOutputItem.mime) {
      return 2 /* Other */;
    }
    if (aOutputItem.data.buffer.length !== bOutputItem.data.buffer.length) {
      return 2 /* Other */;
    }
    for (let k = 0; k < aOutputItem.data.buffer.length; k++) {
      if (aOutputItem.data.buffer[k] !== bOutputItem.data.buffer[k]) {
        return 2 /* Other */;
      }
    }
  }
  return 1 /* Metadata */;
}
__name(outputEqual, "outputEqual");
function outputsEqual(original, modified) {
  if (original.length !== modified.length) {
    return 2 /* Other */;
  }
  const len = original.length;
  for (let i = 0; i < len; i++) {
    const a = original[i];
    const b = modified[i];
    if (hash(a.metadata) !== hash(b.metadata)) {
      return 1 /* Metadata */;
    }
    if (a.outputs.length !== b.outputs.length) {
      return 2 /* Other */;
    }
    for (let j = 0; j < a.outputs.length; j++) {
      const aOutputItem = a.outputs[j];
      const bOutputItem = b.outputs[j];
      if (aOutputItem.mime !== bOutputItem.mime) {
        return 2 /* Other */;
      }
      if (aOutputItem.data.buffer.length !== bOutputItem.data.buffer.length) {
        return 2 /* Other */;
      }
      for (let k = 0; k < aOutputItem.data.buffer.length; k++) {
        if (aOutputItem.data.buffer[k] !== bOutputItem.data.buffer[k]) {
          return 2 /* Other */;
        }
      }
    }
  }
  return 0 /* Unchanged */;
}
__name(outputsEqual, "outputsEqual");
function getStreamOutputData(outputs) {
  if (!outputs.length) {
    return null;
  }
  const first = outputs[0];
  const mime = first.mime;
  const sameStream = !outputs.find((op) => op.mime !== mime);
  if (sameStream) {
    return outputs.map((opit) => opit.data.toString()).join("");
  } else {
    return null;
  }
}
__name(getStreamOutputData, "getStreamOutputData");
function getFormattedOutputJSON(outputs) {
  if (outputs.length === 1) {
    const streamOutputData = getStreamOutputData(outputs[0].outputs);
    if (streamOutputData) {
      return streamOutputData;
    }
  }
  return JSON.stringify(outputs.map((output) => {
    return {
      metadata: output.metadata,
      outputItems: output.outputs.map((opit) => ({
        mimeType: opit.mime,
        data: opit.data.toString()
      }))
    };
  }), void 0, "	");
}
__name(getFormattedOutputJSON, "getFormattedOutputJSON");
export {
  DefaultLineHeight,
  DiffElementCellViewModelBase,
  DiffElementPlaceholderViewModel,
  DiffElementViewModelBase,
  HeightOfHiddenLinesRegionInDiffEditor,
  OUTPUT_EDITOR_HEIGHT_MAGIC,
  OutputComparison,
  PropertyFoldingState,
  SideBySideDiffElementViewModel,
  SingleSideDiffElementViewModel,
  getFormattedOutputJSON,
  getStreamOutputData,
  outputEqual
};
//# sourceMappingURL=diffElementViewModel.js.map
