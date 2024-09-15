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
import {
  Emitter,
  PauseableEmitter
} from "../../../../../base/common/event.js";
import { dispose } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import * as UUID from "../../../../../base/common/uuid.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { PrefixSumComputer } from "../../../../../editor/common/model/prefixSumComputer.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import {
  CellKind
} from "../../common/notebookCommon.js";
import { INotebookService } from "../../common/notebookService.js";
import {
  CellEditState,
  CellLayoutState
} from "../notebookBrowser.js";
import { BaseCellViewModel } from "./baseCellViewModel.js";
import { CellOutputViewModel } from "./cellOutputViewModel.js";
const outputDisplayLimit = 500;
let CodeCellViewModel = class extends BaseCellViewModel {
  constructor(viewType, model, initialNotebookLayoutInfo, viewContext, configurationService, _notebookService, modelService, undoRedoService, codeEditorService, instantiationService) {
    super(
      viewType,
      model,
      UUID.generateUuid(),
      viewContext,
      configurationService,
      modelService,
      undoRedoService,
      codeEditorService
    );
    this.viewContext = viewContext;
    this._notebookService = _notebookService;
    this._outputViewModels = this.model.outputs.map(
      (output) => new CellOutputViewModel(this, output, this._notebookService)
    );
    this._register(
      this.model.onDidChangeOutputs((splice) => {
        const removedOutputs = [];
        let outputLayoutChange = false;
        for (let i = splice.start; i < splice.start + splice.deleteCount; i++) {
          if (this._outputCollection[i] !== void 0 && this._outputCollection[i] !== 0) {
            outputLayoutChange = true;
          }
        }
        this._outputCollection.splice(
          splice.start,
          splice.deleteCount,
          ...splice.newOutputs.map(() => 0)
        );
        removedOutputs.push(
          ...this._outputViewModels.splice(
            splice.start,
            splice.deleteCount,
            ...splice.newOutputs.map(
              (output) => new CellOutputViewModel(
                this,
                output,
                this._notebookService
              )
            )
          )
        );
        this._outputsTop = null;
        this._onDidChangeOutputs.fire(splice);
        this._onDidRemoveOutputs.fire(removedOutputs);
        if (outputLayoutChange) {
          this.layoutChange(
            { outputHeight: true },
            "CodeCellViewModel#model.onDidChangeOutputs"
          );
        }
        dispose(removedOutputs);
      })
    );
    this._outputCollection = new Array(this.model.outputs.length);
    this._layoutInfo = {
      fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
      editorHeight: 0,
      editorWidth: initialNotebookLayoutInfo ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(
        initialNotebookLayoutInfo.width
      ) : 0,
      chatHeight: 0,
      statusBarHeight: 0,
      commentOffset: 0,
      commentHeight: 0,
      outputContainerOffset: 0,
      outputTotalHeight: 0,
      outputShowMoreContainerHeight: 0,
      outputShowMoreContainerOffset: 0,
      totalHeight: this.computeTotalHeight(17, 0, 0, 0),
      codeIndicatorHeight: 0,
      outputIndicatorHeight: 0,
      bottomToolbarOffset: 0,
      layoutState: CellLayoutState.Uninitialized,
      estimatedHasHorizontalScrolling: false
    };
  }
  static {
    __name(this, "CodeCellViewModel");
  }
  cellKind = CellKind.Code;
  _onLayoutInfoRead = this._register(new Emitter());
  onLayoutInfoRead = this._onLayoutInfoRead.event;
  _onDidStartExecution = this._register(
    new Emitter()
  );
  onDidStartExecution = this._onDidStartExecution.event;
  _onDidStopExecution = this._register(
    new Emitter()
  );
  onDidStopExecution = this._onDidStopExecution.event;
  _onDidChangeOutputs = this._register(
    new Emitter()
  );
  onDidChangeOutputs = this._onDidChangeOutputs.event;
  _onDidRemoveOutputs = this._register(
    new Emitter()
  );
  onDidRemoveOutputs = this._onDidRemoveOutputs.event;
  _outputCollection = [];
  _outputsTop = null;
  _pauseableEmitter = this._register(
    new PauseableEmitter()
  );
  onDidChangeLayout = this._pauseableEmitter.event;
  _editorHeight = 0;
  set editorHeight(height) {
    if (this._editorHeight === height) {
      return;
    }
    this._editorHeight = height;
    this.layoutChange(
      { editorHeight: true },
      "CodeCellViewModel#editorHeight"
    );
  }
  get editorHeight() {
    throw new Error("editorHeight is write-only");
  }
  _chatHeight = 0;
  set chatHeight(height) {
    if (this._chatHeight === height) {
      return;
    }
    this._chatHeight = height;
    this.layoutChange({ chatHeight: true }, "CodeCellViewModel#chatHeight");
  }
  get chatHeight() {
    return this._chatHeight;
  }
  _hoveringOutput = false;
  get outputIsHovered() {
    return this._hoveringOutput;
  }
  set outputIsHovered(v) {
    this._hoveringOutput = v;
    this._onDidChangeState.fire({ outputIsHoveredChanged: true });
  }
  _focusOnOutput = false;
  get outputIsFocused() {
    return this._focusOnOutput;
  }
  set outputIsFocused(v) {
    this._focusOnOutput = v;
    this._onDidChangeState.fire({ outputIsFocusedChanged: true });
  }
  _focusInputInOutput = false;
  get inputInOutputIsFocused() {
    return this._focusInputInOutput;
  }
  set inputInOutputIsFocused(v) {
    this._focusInputInOutput = v;
  }
  _outputMinHeight = 0;
  get outputMinHeight() {
    return this._outputMinHeight;
  }
  /**
   * The minimum height of the output region. It's only set to non-zero temporarily when replacing an output with a new one.
   * It's reset to 0 when the new output is rendered, or in one second.
   */
  set outputMinHeight(newMin) {
    this._outputMinHeight = newMin;
  }
  _layoutInfo;
  get layoutInfo() {
    return this._layoutInfo;
  }
  _outputViewModels;
  get outputsViewModels() {
    return this._outputViewModels;
  }
  excecutionError = observableValue(
    "excecutionError",
    void 0
  );
  updateExecutionState(e) {
    if (e.changed) {
      this._onDidStartExecution.fire(e);
    } else {
      this._onDidStopExecution.fire(e);
    }
  }
  updateOptions(e) {
    if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
      this.layoutChange({});
    }
  }
  pauseLayout() {
    this._pauseableEmitter.pause();
  }
  resumeLayout() {
    this._pauseableEmitter.resume();
  }
  layoutChange(state, source) {
    this._ensureOutputsTop();
    const notebookLayoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    const bottomToolbarDimensions = this.viewContext.notebookOptions.computeBottomToolbarDimensions(
      this.viewType
    );
    const outputShowMoreContainerHeight = state.outputShowMoreContainerHeight ? state.outputShowMoreContainerHeight : this._layoutInfo.outputShowMoreContainerHeight;
    const outputTotalHeight = Math.max(
      this._outputMinHeight,
      this.isOutputCollapsed ? notebookLayoutConfiguration.collapsedIndicatorHeight : this._outputsTop.getTotalSum()
    );
    const commentHeight = state.commentHeight ? this._commentHeight : this._layoutInfo.commentHeight;
    const originalLayout = this.layoutInfo;
    if (this.isInputCollapsed) {
      const codeIndicatorHeight = notebookLayoutConfiguration.collapsedIndicatorHeight;
      const outputIndicatorHeight = outputTotalHeight + outputShowMoreContainerHeight;
      const chatHeight = state.chatHeight ? this._chatHeight : this._layoutInfo.chatHeight;
      const outputContainerOffset = notebookLayoutConfiguration.cellTopMargin + notebookLayoutConfiguration.collapsedIndicatorHeight;
      const totalHeight = notebookLayoutConfiguration.cellTopMargin + notebookLayoutConfiguration.collapsedIndicatorHeight + notebookLayoutConfiguration.cellBottomMargin + //CELL_BOTTOM_MARGIN
      bottomToolbarDimensions.bottomToolbarGap + //BOTTOM_CELL_TOOLBAR_GAP
      chatHeight + commentHeight + outputTotalHeight + outputShowMoreContainerHeight;
      const outputShowMoreContainerOffset = totalHeight - bottomToolbarDimensions.bottomToolbarGap - bottomToolbarDimensions.bottomToolbarHeight / 2 - outputShowMoreContainerHeight;
      const bottomToolbarOffset = this.viewContext.notebookOptions.computeBottomToolbarOffset(
        totalHeight,
        this.viewType
      );
      const editorWidth = state.outerWidth !== void 0 ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(
        state.outerWidth
      ) : this._layoutInfo?.editorWidth;
      this._layoutInfo = {
        fontInfo: state.font ?? this._layoutInfo.fontInfo ?? null,
        editorHeight: this._layoutInfo.editorHeight,
        editorWidth,
        chatHeight,
        statusBarHeight: 0,
        outputContainerOffset,
        outputTotalHeight,
        outputShowMoreContainerHeight,
        outputShowMoreContainerOffset,
        commentOffset: outputContainerOffset + outputTotalHeight,
        commentHeight,
        totalHeight,
        codeIndicatorHeight,
        outputIndicatorHeight,
        bottomToolbarOffset,
        layoutState: this._layoutInfo.layoutState,
        estimatedHasHorizontalScrolling: false
      };
    } else {
      let newState;
      let editorHeight;
      let totalHeight;
      let hasHorizontalScrolling = false;
      const chatHeight = state.chatHeight ? this._chatHeight : this._layoutInfo.chatHeight;
      if (!state.editorHeight && this._layoutInfo.layoutState === CellLayoutState.FromCache && !state.outputHeight) {
        const estimate = this.estimateEditorHeight(
          state.font?.lineHeight ?? this._layoutInfo.fontInfo?.lineHeight
        );
        editorHeight = estimate.editorHeight;
        hasHorizontalScrolling = estimate.hasHorizontalScrolling;
        totalHeight = this._layoutInfo.totalHeight;
        newState = CellLayoutState.FromCache;
      } else if (state.editorHeight || this._layoutInfo.layoutState === CellLayoutState.Measured) {
        editorHeight = this._editorHeight;
        totalHeight = this.computeTotalHeight(
          this._editorHeight,
          outputTotalHeight,
          outputShowMoreContainerHeight,
          chatHeight
        );
        newState = CellLayoutState.Measured;
        hasHorizontalScrolling = this._layoutInfo.estimatedHasHorizontalScrolling;
      } else {
        const estimate = this.estimateEditorHeight(
          state.font?.lineHeight ?? this._layoutInfo.fontInfo?.lineHeight
        );
        editorHeight = estimate.editorHeight;
        hasHorizontalScrolling = estimate.hasHorizontalScrolling;
        totalHeight = this.computeTotalHeight(
          editorHeight,
          outputTotalHeight,
          outputShowMoreContainerHeight,
          chatHeight
        );
        newState = CellLayoutState.Estimated;
      }
      const statusBarHeight = this.viewContext.notebookOptions.computeEditorStatusbarHeight(
        this.internalMetadata,
        this.uri
      );
      const codeIndicatorHeight = editorHeight + statusBarHeight;
      const outputIndicatorHeight = outputTotalHeight + outputShowMoreContainerHeight;
      const outputContainerOffset = notebookLayoutConfiguration.editorToolbarHeight + notebookLayoutConfiguration.cellTopMargin + // CELL_TOP_MARGIN
      chatHeight + editorHeight + statusBarHeight;
      const outputShowMoreContainerOffset = totalHeight - bottomToolbarDimensions.bottomToolbarGap - bottomToolbarDimensions.bottomToolbarHeight / 2 - outputShowMoreContainerHeight;
      const bottomToolbarOffset = this.viewContext.notebookOptions.computeBottomToolbarOffset(
        totalHeight,
        this.viewType
      );
      const editorWidth = state.outerWidth !== void 0 ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(
        state.outerWidth
      ) : this._layoutInfo?.editorWidth;
      this._layoutInfo = {
        fontInfo: state.font ?? this._layoutInfo.fontInfo ?? null,
        chatHeight,
        editorHeight,
        editorWidth,
        statusBarHeight,
        outputContainerOffset,
        outputTotalHeight,
        outputShowMoreContainerHeight,
        outputShowMoreContainerOffset,
        commentOffset: outputContainerOffset + outputTotalHeight,
        commentHeight,
        totalHeight,
        codeIndicatorHeight,
        outputIndicatorHeight,
        bottomToolbarOffset,
        layoutState: newState,
        estimatedHasHorizontalScrolling: hasHorizontalScrolling
      };
    }
    this._fireOnDidChangeLayout({
      ...state,
      totalHeight: this.layoutInfo.totalHeight !== originalLayout.totalHeight,
      source
    });
  }
  _fireOnDidChangeLayout(state) {
    this._pauseableEmitter.fire(state);
  }
  restoreEditorViewState(editorViewStates, totalHeight) {
    super.restoreEditorViewState(editorViewStates);
    if (totalHeight !== void 0 && this._layoutInfo.layoutState !== CellLayoutState.Measured) {
      this._layoutInfo = {
        ...this._layoutInfo,
        totalHeight,
        layoutState: CellLayoutState.FromCache
      };
    }
  }
  getDynamicHeight() {
    this._onLayoutInfoRead.fire();
    return this._layoutInfo.totalHeight;
  }
  getHeight(lineHeight) {
    if (this._layoutInfo.layoutState === CellLayoutState.Uninitialized) {
      const estimate = this.estimateEditorHeight(lineHeight);
      return this.computeTotalHeight(estimate.editorHeight, 0, 0, 0);
    } else {
      return this._layoutInfo.totalHeight;
    }
  }
  estimateEditorHeight(lineHeight = 20) {
    let hasHorizontalScrolling = false;
    const cellEditorOptions = this.viewContext.getBaseCellEditorOptions(
      this.language
    );
    if (this.layoutInfo.fontInfo && cellEditorOptions.value.wordWrap === "off") {
      for (let i = 0; i < this.lineCount; i++) {
        const max = this.textBuffer.getLineLastNonWhitespaceColumn(
          i + 1
        );
        const estimatedWidth = max * (this.layoutInfo.fontInfo.typicalHalfwidthCharacterWidth + this.layoutInfo.fontInfo.letterSpacing);
        if (estimatedWidth > this.layoutInfo.editorWidth) {
          hasHorizontalScrolling = true;
          break;
        }
      }
    }
    const verticalScrollbarHeight = hasHorizontalScrolling ? 12 : 0;
    const editorPadding = this.viewContext.notebookOptions.computeEditorPadding(
      this.internalMetadata,
      this.uri
    );
    const editorHeight = this.lineCount * lineHeight + editorPadding.top + editorPadding.bottom + // EDITOR_BOTTOM_PADDING
    verticalScrollbarHeight;
    return {
      editorHeight,
      hasHorizontalScrolling
    };
  }
  computeTotalHeight(editorHeight, outputsTotalHeight, outputShowMoreContainerHeight, chatHeight) {
    const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
    const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(
      this.viewType
    );
    return layoutConfiguration.editorToolbarHeight + layoutConfiguration.cellTopMargin + chatHeight + editorHeight + this.viewContext.notebookOptions.computeEditorStatusbarHeight(
      this.internalMetadata,
      this.uri
    ) + this._commentHeight + outputsTotalHeight + outputShowMoreContainerHeight + bottomToolbarGap + layoutConfiguration.cellBottomMargin;
  }
  onDidChangeTextModelContent() {
    if (this.getEditState() !== CellEditState.Editing) {
      this.updateEditState(
        CellEditState.Editing,
        "onDidChangeTextModelContent"
      );
      this._onDidChangeState.fire({ contentChanged: true });
    }
  }
  onDeselect() {
    this.updateEditState(CellEditState.Preview, "onDeselect");
  }
  updateOutputShowMoreContainerHeight(height) {
    this.layoutChange(
      { outputShowMoreContainerHeight: height },
      "CodeCellViewModel#updateOutputShowMoreContainerHeight"
    );
  }
  updateOutputMinHeight(height) {
    this.outputMinHeight = height;
  }
  unlockOutputHeight() {
    this.outputMinHeight = 0;
    this.layoutChange({ outputHeight: true });
  }
  updateOutputHeight(index, height, source) {
    if (index >= this._outputCollection.length) {
      throw new Error("Output index out of range!");
    }
    this._ensureOutputsTop();
    if (index === 0 || height > 0) {
      this._outputViewModels[index].setVisible(true);
    } else if (height === 0) {
      this._outputViewModels[index].setVisible(false);
    }
    if (this._outputViewModels[index].visible.get() && height < 28) {
      height = 28;
    }
    this._outputCollection[index] = height;
    if (this._outputsTop.setValue(index, height)) {
      this.layoutChange({ outputHeight: true }, source);
    }
  }
  getOutputOffsetInContainer(index) {
    this._ensureOutputsTop();
    if (index >= this._outputCollection.length) {
      throw new Error("Output index out of range!");
    }
    return this._outputsTop.getPrefixSum(index - 1);
  }
  getOutputOffset(index) {
    return this.layoutInfo.outputContainerOffset + this.getOutputOffsetInContainer(index);
  }
  spliceOutputHeights(start, deleteCnt, heights) {
    this._ensureOutputsTop();
    this._outputsTop.removeValues(start, deleteCnt);
    if (heights.length) {
      const values = new Uint32Array(heights.length);
      for (let i = 0; i < heights.length; i++) {
        values[i] = heights[i];
      }
      this._outputsTop.insertValues(start, values);
    }
    this.layoutChange(
      { outputHeight: true },
      "CodeCellViewModel#spliceOutputs"
    );
  }
  _ensureOutputsTop() {
    if (!this._outputsTop) {
      const values = new Uint32Array(this._outputCollection.length);
      for (let i = 0; i < this._outputCollection.length; i++) {
        values[i] = this._outputCollection[i];
      }
      this._outputsTop = new PrefixSumComputer(values);
    }
  }
  _hasFindResult = this._register(new Emitter());
  hasFindResult = this._hasFindResult.event;
  startFind(value, options) {
    const matches = super.cellStartFind(value, options);
    if (matches === null) {
      return null;
    }
    return {
      cell: this,
      contentMatches: matches
    };
  }
  dispose() {
    super.dispose();
    this._outputCollection = [];
    this._outputsTop = null;
    dispose(this._outputViewModels);
  }
};
CodeCellViewModel = __decorateClass([
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, INotebookService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IUndoRedoService),
  __decorateParam(8, ICodeEditorService),
  __decorateParam(9, IInstantiationService)
], CodeCellViewModel);
export {
  CodeCellViewModel,
  outputDisplayLimit
};
//# sourceMappingURL=codeCellViewModel.js.map
