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
import { CompareResult, equals } from "../../../../../base/common/arrays.js";
import { BugIndicatingError } from "../../../../../base/common/errors.js";
import { autorunHandleChanges, derived, IObservable, IReader, ISettableObservable, ITransaction, keepObserved, observableValue, transaction, waitForState } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { localize } from "../../../../../nls.js";
import { IResourceUndoRedoElement, IUndoRedoService, UndoRedoElementType, UndoRedoGroup } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { EditorModel } from "../../../../common/editor/editorModel.js";
import { IMergeDiffComputer } from "./diffComputer.js";
import { LineRange } from "./lineRange.js";
import { DetailedLineRangeMapping, DocumentLineRangeMap, DocumentRangeMap, LineRangeMapping } from "./mapping.js";
import { TextModelDiffChangeReason, TextModelDiffs, TextModelDiffState } from "./textModelDiffs.js";
import { MergeEditorTelemetry } from "../telemetry.js";
import { leftJoin } from "../utils.js";
import { InputNumber, ModifiedBaseRange, ModifiedBaseRangeState, ModifiedBaseRangeStateKind } from "./modifiedBaseRange.js";
let MergeEditorModel = class extends EditorModel {
  constructor(base, input1, input2, resultTextModel, diffComputer, options, telemetry, languageService, undoRedoService) {
    super();
    this.base = base;
    this.input1 = input1;
    this.input2 = input2;
    this.resultTextModel = resultTextModel;
    this.diffComputer = diffComputer;
    this.options = options;
    this.telemetry = telemetry;
    this.languageService = languageService;
    this.undoRedoService = undoRedoService;
    this._register(keepObserved(this.modifiedBaseRangeResultStates));
    this._register(keepObserved(this.input1ResultMapping));
    this._register(keepObserved(this.input2ResultMapping));
    const initializePromise = this.initialize();
    this.onInitialized = this.onInitialized.then(async () => {
      await initializePromise;
    });
    initializePromise.then(() => {
      let shouldRecomputeHandledFromAccepted = true;
      this._register(
        autorunHandleChanges(
          {
            handleChange: /* @__PURE__ */ __name((ctx) => {
              if (ctx.didChange(this.modifiedBaseRangeResultStates)) {
                shouldRecomputeHandledFromAccepted = true;
              }
              return ctx.didChange(this.resultTextModelDiffs.diffs) ? ctx.change === TextModelDiffChangeReason.textChange : true;
            }, "handleChange")
          },
          (reader) => {
            const states = this.modifiedBaseRangeResultStates.read(reader);
            if (!this.isUpToDate.read(reader)) {
              return;
            }
            const resultDiffs = this.resultTextModelDiffs.diffs.read(reader);
            transaction((tx) => {
              this.updateBaseRangeAcceptedState(resultDiffs, states, tx);
              if (shouldRecomputeHandledFromAccepted) {
                shouldRecomputeHandledFromAccepted = false;
                for (const [_range, observableState] of states) {
                  const state = observableState.accepted.get();
                  const handled = !(state.kind === ModifiedBaseRangeStateKind.base || state.kind === ModifiedBaseRangeStateKind.unrecognized);
                  observableState.handledInput1.set(handled, tx);
                  observableState.handledInput2.set(handled, tx);
                }
              }
            });
          }
        )
      );
    });
  }
  static {
    __name(this, "MergeEditorModel");
  }
  input1TextModelDiffs = this._register(new TextModelDiffs(this.base, this.input1.textModel, this.diffComputer));
  input2TextModelDiffs = this._register(new TextModelDiffs(this.base, this.input2.textModel, this.diffComputer));
  resultTextModelDiffs = this._register(new TextModelDiffs(this.base, this.resultTextModel, this.diffComputer));
  modifiedBaseRanges = derived(this, (reader) => {
    const input1Diffs = this.input1TextModelDiffs.diffs.read(reader);
    const input2Diffs = this.input2TextModelDiffs.diffs.read(reader);
    return ModifiedBaseRange.fromDiffs(input1Diffs, input2Diffs, this.base, this.input1.textModel, this.input2.textModel);
  });
  modifiedBaseRangeResultStates = derived(this, (reader) => {
    const map = new Map(
      this.modifiedBaseRanges.read(reader).map((s) => [
        s,
        new ModifiedBaseRangeData(s)
      ])
    );
    return map;
  });
  resultSnapshot = this.resultTextModel.createSnapshot();
  async initialize() {
    if (this.options.resetResult) {
      await this.reset();
    }
  }
  async reset() {
    await waitForState(this.inputDiffComputingState, (state) => state === 2 /* upToDate */);
    const states = this.modifiedBaseRangeResultStates.get();
    transaction((tx) => {
      for (const [range, state] of states) {
        let newState;
        let handled = false;
        if (range.input1Diffs.length === 0) {
          newState = ModifiedBaseRangeState.base.withInputValue(2, true);
          handled = true;
        } else if (range.input2Diffs.length === 0) {
          newState = ModifiedBaseRangeState.base.withInputValue(1, true);
          handled = true;
        } else if (range.isEqualChange) {
          newState = ModifiedBaseRangeState.base.withInputValue(1, true);
          handled = true;
        } else {
          newState = ModifiedBaseRangeState.base;
          handled = false;
        }
        state.accepted.set(newState, tx);
        state.computedFromDiffing = false;
        state.previousNonDiffingState = void 0;
        state.handledInput1.set(handled, tx);
        state.handledInput2.set(handled, tx);
      }
      this.resultTextModel.pushEditOperations(null, [{
        range: new Range(1, 1, Number.MAX_SAFE_INTEGER, 1),
        text: this.computeAutoMergedResult()
      }], () => null);
    });
  }
  computeAutoMergedResult() {
    const baseRanges = this.modifiedBaseRanges.get();
    const baseLines = this.base.getLinesContent();
    const input1Lines = this.input1.textModel.getLinesContent();
    const input2Lines = this.input2.textModel.getLinesContent();
    const resultLines = [];
    function appendLinesToResult(source, lineRange) {
      for (let i = lineRange.startLineNumber; i < lineRange.endLineNumberExclusive; i++) {
        resultLines.push(source[i - 1]);
      }
    }
    __name(appendLinesToResult, "appendLinesToResult");
    let baseStartLineNumber = 1;
    for (const baseRange of baseRanges) {
      appendLinesToResult(baseLines, LineRange.fromLineNumbers(baseStartLineNumber, baseRange.baseRange.startLineNumber));
      baseStartLineNumber = baseRange.baseRange.endLineNumberExclusive;
      if (baseRange.input1Diffs.length === 0) {
        appendLinesToResult(input2Lines, baseRange.input2Range);
      } else if (baseRange.input2Diffs.length === 0) {
        appendLinesToResult(input1Lines, baseRange.input1Range);
      } else if (baseRange.isEqualChange) {
        appendLinesToResult(input1Lines, baseRange.input1Range);
      } else {
        appendLinesToResult(baseLines, baseRange.baseRange);
      }
    }
    appendLinesToResult(baseLines, LineRange.fromLineNumbers(baseStartLineNumber, baseLines.length + 1));
    return resultLines.join(this.resultTextModel.getEOL());
  }
  hasBaseRange(baseRange) {
    return this.modifiedBaseRangeResultStates.get().has(baseRange);
  }
  baseInput1Diffs = this.input1TextModelDiffs.diffs;
  baseInput2Diffs = this.input2TextModelDiffs.diffs;
  baseResultDiffs = this.resultTextModelDiffs.diffs;
  get isApplyingEditInResult() {
    return this.resultTextModelDiffs.isApplyingChange;
  }
  input1ResultMapping = derived(this, (reader) => {
    return this.getInputResultMapping(
      this.baseInput1Diffs.read(reader),
      this.baseResultDiffs.read(reader),
      this.input1.textModel.getLineCount()
    );
  });
  resultInput1Mapping = derived(this, (reader) => this.input1ResultMapping.read(reader).reverse());
  input2ResultMapping = derived(this, (reader) => {
    return this.getInputResultMapping(
      this.baseInput2Diffs.read(reader),
      this.baseResultDiffs.read(reader),
      this.input2.textModel.getLineCount()
    );
  });
  resultInput2Mapping = derived(this, (reader) => this.input2ResultMapping.read(reader).reverse());
  getInputResultMapping(inputLinesDiffs, resultDiffs, inputLineCount) {
    const map = DocumentLineRangeMap.betweenOutputs(inputLinesDiffs, resultDiffs, inputLineCount);
    return new DocumentLineRangeMap(
      map.lineRangeMappings.map(
        (m) => m.inputRange.isEmpty || m.outputRange.isEmpty ? new LineRangeMapping(
          // We can do this because two adjacent diffs have one line in between.
          m.inputRange.deltaStart(-1),
          m.outputRange.deltaStart(-1)
        ) : m
      ),
      map.inputLineCount
    );
  }
  baseResultMapping = derived(this, (reader) => {
    const map = new DocumentLineRangeMap(this.baseResultDiffs.read(reader), -1);
    return new DocumentLineRangeMap(
      map.lineRangeMappings.map(
        (m) => m.inputRange.isEmpty || m.outputRange.isEmpty ? new LineRangeMapping(
          // We can do this because two adjacent diffs have one line in between.
          m.inputRange.deltaStart(-1),
          m.outputRange.deltaStart(-1)
        ) : m
      ),
      map.inputLineCount
    );
  });
  resultBaseMapping = derived(this, (reader) => this.baseResultMapping.read(reader).reverse());
  translateInputRangeToBase(input, range) {
    const baseInputDiffs = input === 1 ? this.baseInput1Diffs.get() : this.baseInput2Diffs.get();
    const map = new DocumentRangeMap(baseInputDiffs.flatMap((d) => d.rangeMappings), 0).reverse();
    return map.projectRange(range).outputRange;
  }
  translateBaseRangeToInput(input, range) {
    const baseInputDiffs = input === 1 ? this.baseInput1Diffs.get() : this.baseInput2Diffs.get();
    const map = new DocumentRangeMap(baseInputDiffs.flatMap((d) => d.rangeMappings), 0);
    return map.projectRange(range).outputRange;
  }
  getLineRangeInResult(baseRange, reader) {
    return this.resultTextModelDiffs.getResultLineRange(baseRange, reader);
  }
  translateResultRangeToBase(range) {
    const map = new DocumentRangeMap(this.baseResultDiffs.get().flatMap((d) => d.rangeMappings), 0).reverse();
    return map.projectRange(range).outputRange;
  }
  translateBaseRangeToResult(range) {
    const map = new DocumentRangeMap(this.baseResultDiffs.get().flatMap((d) => d.rangeMappings), 0);
    return map.projectRange(range).outputRange;
  }
  findModifiedBaseRangesInRange(rangeInBase) {
    return this.modifiedBaseRanges.get().filter((r) => r.baseRange.intersects(rangeInBase));
  }
  diffComputingState = derived(this, (reader) => {
    const states = [
      this.input1TextModelDiffs,
      this.input2TextModelDiffs,
      this.resultTextModelDiffs
    ].map((s) => s.state.read(reader));
    if (states.some((s) => s === TextModelDiffState.initializing)) {
      return 1 /* initializing */;
    }
    if (states.some((s) => s === TextModelDiffState.updating)) {
      return 3 /* updating */;
    }
    return 2 /* upToDate */;
  });
  inputDiffComputingState = derived(this, (reader) => {
    const states = [
      this.input1TextModelDiffs,
      this.input2TextModelDiffs
    ].map((s) => s.state.read(reader));
    if (states.some((s) => s === TextModelDiffState.initializing)) {
      return 1 /* initializing */;
    }
    if (states.some((s) => s === TextModelDiffState.updating)) {
      return 3 /* updating */;
    }
    return 2 /* upToDate */;
  });
  isUpToDate = derived(this, (reader) => this.diffComputingState.read(reader) === 2 /* upToDate */);
  onInitialized = waitForState(this.diffComputingState, (state) => state === 2 /* upToDate */).then(() => {
  });
  firstRun = true;
  updateBaseRangeAcceptedState(resultDiffs, states, tx) {
    const baseRangeWithStoreAndTouchingDiffs = leftJoin(
      states,
      resultDiffs,
      (baseRange, diff) => baseRange[0].baseRange.touches(diff.inputRange) ? CompareResult.neitherLessOrGreaterThan : LineRange.compareByStart(
        baseRange[0].baseRange,
        diff.inputRange
      )
    );
    for (const row of baseRangeWithStoreAndTouchingDiffs) {
      const newState = this.computeState(row.left[0], row.rights);
      const data = row.left[1];
      const oldState = data.accepted.get();
      if (!oldState.equals(newState)) {
        if (!this.firstRun && !data.computedFromDiffing) {
          data.computedFromDiffing = true;
          data.previousNonDiffingState = oldState;
        }
        data.accepted.set(newState, tx);
      }
    }
    if (this.firstRun) {
      this.firstRun = false;
    }
  }
  computeState(baseRange, conflictingDiffs) {
    if (conflictingDiffs.length === 0) {
      return ModifiedBaseRangeState.base;
    }
    const conflictingEdits = conflictingDiffs.map((d) => d.getLineEdit());
    function editsAgreeWithDiffs(diffs) {
      return equals(
        conflictingEdits,
        diffs.map((d) => d.getLineEdit()),
        (a, b) => a.equals(b)
      );
    }
    __name(editsAgreeWithDiffs, "editsAgreeWithDiffs");
    if (editsAgreeWithDiffs(baseRange.input1Diffs)) {
      return ModifiedBaseRangeState.base.withInputValue(1, true);
    }
    if (editsAgreeWithDiffs(baseRange.input2Diffs)) {
      return ModifiedBaseRangeState.base.withInputValue(2, true);
    }
    const states = [
      ModifiedBaseRangeState.base.withInputValue(1, true).withInputValue(2, true, true),
      ModifiedBaseRangeState.base.withInputValue(2, true).withInputValue(1, true, true),
      ModifiedBaseRangeState.base.withInputValue(1, true).withInputValue(2, true, false),
      ModifiedBaseRangeState.base.withInputValue(2, true).withInputValue(1, true, false)
    ];
    for (const s of states) {
      const { edit } = baseRange.getEditForBase(s);
      if (edit) {
        const resultRange = this.resultTextModelDiffs.getResultLineRange(baseRange.baseRange);
        const existingLines = resultRange.getLines(this.resultTextModel);
        if (equals(edit.newLines, existingLines, (a, b) => a === b)) {
          return s;
        }
      }
    }
    return ModifiedBaseRangeState.unrecognized;
  }
  getState(baseRange) {
    const existingState = this.modifiedBaseRangeResultStates.get().get(baseRange);
    if (!existingState) {
      throw new BugIndicatingError("object must be from this instance");
    }
    return existingState.accepted;
  }
  setState(baseRange, state, _markInputAsHandled, tx, _pushStackElement = false) {
    if (!this.isUpToDate.get()) {
      throw new BugIndicatingError("Cannot set state while updating");
    }
    const existingState = this.modifiedBaseRangeResultStates.get().get(baseRange);
    if (!existingState) {
      throw new BugIndicatingError("object must be from this instance");
    }
    const conflictingDiffs = this.resultTextModelDiffs.findTouchingDiffs(
      baseRange.baseRange
    );
    const group = new UndoRedoGroup();
    if (conflictingDiffs) {
      this.resultTextModelDiffs.removeDiffs(conflictingDiffs, tx, group);
    }
    const { edit, effectiveState } = baseRange.getEditForBase(state);
    existingState.accepted.set(effectiveState, tx);
    existingState.previousNonDiffingState = void 0;
    existingState.computedFromDiffing = false;
    const input1Handled = existingState.handledInput1.get();
    const input2Handled = existingState.handledInput2.get();
    if (!input1Handled || !input2Handled) {
      this.undoRedoService.pushElement(
        new MarkAsHandledUndoRedoElement(this.resultTextModel.uri, new WeakRef(this), new WeakRef(existingState), input1Handled, input2Handled),
        group
      );
    }
    if (edit) {
      this.resultTextModel.pushStackElement();
      this.resultTextModelDiffs.applyEditRelativeToOriginal(edit, tx, group);
      this.resultTextModel.pushStackElement();
    }
    existingState.handledInput1.set(true, tx);
    existingState.handledInput2.set(true, tx);
  }
  resetDirtyConflictsToBase() {
    transaction((tx) => {
      this.resultTextModel.pushStackElement();
      for (const range of this.modifiedBaseRanges.get()) {
        if (this.getState(range).get().kind === ModifiedBaseRangeStateKind.unrecognized) {
          this.setState(range, ModifiedBaseRangeState.base, false, tx, false);
        }
      }
      this.resultTextModel.pushStackElement();
    });
  }
  isHandled(baseRange) {
    return this.modifiedBaseRangeResultStates.get().get(baseRange).handled;
  }
  isInputHandled(baseRange, inputNumber) {
    const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
    return inputNumber === 1 ? state.handledInput1 : state.handledInput2;
  }
  setInputHandled(baseRange, inputNumber, handled, tx) {
    const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
    if (state.handled.get() === handled) {
      return;
    }
    const dataRef = new WeakRef(ModifiedBaseRangeData);
    const modelRef = new WeakRef(this);
    this.undoRedoService.pushElement({
      type: UndoRedoElementType.Resource,
      resource: this.resultTextModel.uri,
      code: "setInputHandled",
      label: localize("setInputHandled", "Set Input Handled"),
      redo() {
        const model = modelRef.deref();
        const data = dataRef.deref();
        if (model && !model.isDisposed() && data) {
          transaction((tx2) => {
            if (inputNumber === 1) {
              state.handledInput1.set(handled, tx2);
            } else {
              state.handledInput2.set(handled, tx2);
            }
          });
        }
      },
      undo() {
        const model = modelRef.deref();
        const data = dataRef.deref();
        if (model && !model.isDisposed() && data) {
          transaction((tx2) => {
            if (inputNumber === 1) {
              state.handledInput1.set(!handled, tx2);
            } else {
              state.handledInput2.set(!handled, tx2);
            }
          });
        }
      }
    });
    if (inputNumber === 1) {
      state.handledInput1.set(handled, tx);
    } else {
      state.handledInput2.set(handled, tx);
    }
  }
  setHandled(baseRange, handled, tx) {
    const state = this.modifiedBaseRangeResultStates.get().get(baseRange);
    if (state.handled.get() === handled) {
      return;
    }
    state.handledInput1.set(handled, tx);
    state.handledInput2.set(handled, tx);
  }
  unhandledConflictsCount = derived(this, (reader) => {
    const map = this.modifiedBaseRangeResultStates.read(reader);
    let unhandledCount = 0;
    for (const [_key, value] of map) {
      if (!value.handled.read(reader)) {
        unhandledCount++;
      }
    }
    return unhandledCount;
  });
  hasUnhandledConflicts = this.unhandledConflictsCount.map((value) => (
    /** @description hasUnhandledConflicts */
    value > 0
  ));
  setLanguageId(languageId, source) {
    const language = this.languageService.createById(languageId);
    this.base.setLanguage(language, source);
    this.input1.textModel.setLanguage(language, source);
    this.input2.textModel.setLanguage(language, source);
    this.resultTextModel.setLanguage(language, source);
  }
  getInitialResultValue() {
    const chunks = [];
    while (true) {
      const chunk = this.resultSnapshot.read();
      if (chunk === null) {
        break;
      }
      chunks.push(chunk);
    }
    return chunks.join();
  }
  async getResultValueWithConflictMarkers() {
    await waitForState(this.diffComputingState, (state) => state === 2 /* upToDate */);
    if (this.unhandledConflictsCount.get() === 0) {
      return this.resultTextModel.getValue();
    }
    const resultLines = this.resultTextModel.getLinesContent();
    const input1Lines = this.input1.textModel.getLinesContent();
    const input2Lines = this.input2.textModel.getLinesContent();
    const states = this.modifiedBaseRangeResultStates.get();
    const outputLines = [];
    function appendLinesToResult(source, lineRange) {
      for (let i = lineRange.startLineNumber; i < lineRange.endLineNumberExclusive; i++) {
        outputLines.push(source[i - 1]);
      }
    }
    __name(appendLinesToResult, "appendLinesToResult");
    let resultStartLineNumber = 1;
    for (const [range, state] of states) {
      if (state.handled.get()) {
        continue;
      }
      const resultRange = this.resultTextModelDiffs.getResultLineRange(range.baseRange);
      appendLinesToResult(resultLines, LineRange.fromLineNumbers(resultStartLineNumber, Math.max(resultStartLineNumber, resultRange.startLineNumber)));
      resultStartLineNumber = resultRange.endLineNumberExclusive;
      outputLines.push("<<<<<<<");
      if (state.accepted.get().kind === ModifiedBaseRangeStateKind.unrecognized) {
        appendLinesToResult(resultLines, resultRange);
      } else {
        appendLinesToResult(input1Lines, range.input1Range);
      }
      outputLines.push("=======");
      appendLinesToResult(input2Lines, range.input2Range);
      outputLines.push(">>>>>>>");
    }
    appendLinesToResult(resultLines, LineRange.fromLineNumbers(resultStartLineNumber, resultLines.length + 1));
    return outputLines.join("\n");
  }
  get conflictCount() {
    return arrayCount(this.modifiedBaseRanges.get(), (r) => r.isConflicting);
  }
  get combinableConflictCount() {
    return arrayCount(this.modifiedBaseRanges.get(), (r) => r.isConflicting && r.canBeCombined);
  }
  get conflictsResolvedWithBase() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => r.isConflicting && s.accepted.get().kind === ModifiedBaseRangeStateKind.base
    );
  }
  get conflictsResolvedWithInput1() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => r.isConflicting && s.accepted.get().kind === ModifiedBaseRangeStateKind.input1
    );
  }
  get conflictsResolvedWithInput2() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => r.isConflicting && s.accepted.get().kind === ModifiedBaseRangeStateKind.input2
    );
  }
  get conflictsResolvedWithSmartCombination() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && state.kind === ModifiedBaseRangeStateKind.both && state.smartCombination;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNone() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => r.isConflicting && s.accepted.get().kind === ModifiedBaseRangeStateKind.unrecognized
    );
  }
  get manuallySolvedConflictCountThatEqualSmartCombine() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && s.computedFromDiffing && state.kind === ModifiedBaseRangeStateKind.both && state.smartCombination;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualInput1() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && s.computedFromDiffing && state.kind === ModifiedBaseRangeStateKind.input1;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualInput2() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && s.computedFromDiffing && state.kind === ModifiedBaseRangeStateKind.input2;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithBase() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && state.kind === ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === ModifiedBaseRangeStateKind.base;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && state.kind === ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === ModifiedBaseRangeStateKind.input1;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && state.kind === ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === ModifiedBaseRangeStateKind.input2;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && state.kind === ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === ModifiedBaseRangeStateKind.both && !s.previousNonDiffingState?.smartCombination;
      }
    );
  }
  get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart() {
    return arrayCount(
      this.modifiedBaseRangeResultStates.get().entries(),
      ([r, s]) => {
        const state = s.accepted.get();
        return r.isConflicting && state.kind === ModifiedBaseRangeStateKind.unrecognized && s.previousNonDiffingState?.kind === ModifiedBaseRangeStateKind.both && s.previousNonDiffingState?.smartCombination;
      }
    );
  }
};
MergeEditorModel = __decorateClass([
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IUndoRedoService)
], MergeEditorModel);
function arrayCount(array, predicate) {
  let count = 0;
  for (const value of array) {
    if (predicate(value)) {
      count++;
    }
  }
  return count;
}
__name(arrayCount, "arrayCount");
class ModifiedBaseRangeData {
  constructor(baseRange) {
    this.baseRange = baseRange;
  }
  static {
    __name(this, "ModifiedBaseRangeData");
  }
  accepted = observableValue(`BaseRangeState${this.baseRange.baseRange}`, ModifiedBaseRangeState.base);
  handledInput1 = observableValue(`BaseRangeHandledState${this.baseRange.baseRange}.Input1`, false);
  handledInput2 = observableValue(`BaseRangeHandledState${this.baseRange.baseRange}.Input2`, false);
  computedFromDiffing = false;
  previousNonDiffingState = void 0;
  handled = derived(this, (reader) => this.handledInput1.read(reader) && this.handledInput2.read(reader));
}
var MergeEditorModelState = /* @__PURE__ */ ((MergeEditorModelState2) => {
  MergeEditorModelState2[MergeEditorModelState2["initializing"] = 1] = "initializing";
  MergeEditorModelState2[MergeEditorModelState2["upToDate"] = 2] = "upToDate";
  MergeEditorModelState2[MergeEditorModelState2["updating"] = 3] = "updating";
  return MergeEditorModelState2;
})(MergeEditorModelState || {});
class MarkAsHandledUndoRedoElement {
  constructor(resource, mergeEditorModelRef, stateRef, input1Handled, input2Handled) {
    this.resource = resource;
    this.mergeEditorModelRef = mergeEditorModelRef;
    this.stateRef = stateRef;
    this.input1Handled = input1Handled;
    this.input2Handled = input2Handled;
  }
  static {
    __name(this, "MarkAsHandledUndoRedoElement");
  }
  code = "undoMarkAsHandled";
  label = localize("undoMarkAsHandled", "Undo Mark As Handled");
  type = UndoRedoElementType.Resource;
  redo() {
    const mergeEditorModel = this.mergeEditorModelRef.deref();
    if (!mergeEditorModel || mergeEditorModel.isDisposed()) {
      return;
    }
    const state = this.stateRef.deref();
    if (!state) {
      return;
    }
    transaction((tx) => {
      state.handledInput1.set(true, tx);
      state.handledInput2.set(true, tx);
    });
  }
  undo() {
    const mergeEditorModel = this.mergeEditorModelRef.deref();
    if (!mergeEditorModel || mergeEditorModel.isDisposed()) {
      return;
    }
    const state = this.stateRef.deref();
    if (!state) {
      return;
    }
    transaction((tx) => {
      state.handledInput1.set(this.input1Handled, tx);
      state.handledInput2.set(this.input2Handled, tx);
    });
  }
}
export {
  MergeEditorModel,
  MergeEditorModelState
};
//# sourceMappingURL=mergeEditorModel.js.map
