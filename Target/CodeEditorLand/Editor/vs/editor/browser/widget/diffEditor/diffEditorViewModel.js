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
import { groupAdjacentBy } from "../../../../base/common/arrays.js";
import { softAssert } from "../../../../base/common/assert.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { readHotReloadableExport } from "../../../../base/common/hotReloadHelpers.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived,
  observableSignal,
  observableSignalFromEvent,
  observableValue,
  transaction,
  waitForState
} from "../../../../base/common/observable.js";
import { isDefined } from "../../../../base/common/types.js";
import {
  LineRange,
  LineRangeSet
} from "../../../common/core/lineRange.js";
import { DefaultLinesDiffComputer } from "../../../common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer.js";
import { optimizeSequenceDiffs } from "../../../common/diff/defaultLinesDiffComputer/heuristicSequenceOptimizations.js";
import {
  DetailedLineRangeMapping,
  LineRangeMapping,
  RangeMapping
} from "../../../common/diff/rangeMapping.js";
import { TextEditInfo } from "../../../common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper.js";
import { combineTextEditInfos } from "../../../common/model/bracketPairsTextModelPart/bracketPairsTree/combineTextEditInfos.js";
import { IDiffProviderFactoryService } from "./diffProviderFactoryService.js";
import { filterWithPrevious } from "./utils.js";
let DiffEditorViewModel = class extends Disposable {
  constructor(model, _options, _diffProviderFactoryService) {
    super();
    this.model = model;
    this._options = _options;
    this._diffProviderFactoryService = _diffProviderFactoryService;
    this._register(
      toDisposable(() => this._cancellationTokenSource.cancel())
    );
    const contentChangedSignal = observableSignal("contentChangedSignal");
    const debouncer = this._register(
      new RunOnceScheduler(
        () => contentChangedSignal.trigger(void 0),
        200
      )
    );
    this._register(
      autorun((reader) => {
        const lastUnchangedRegions = this._unchangedRegions.read(reader);
        if (!lastUnchangedRegions || lastUnchangedRegions.regions.some(
          (r) => r.isDragged.read(reader)
        )) {
          return;
        }
        const lastUnchangedRegionsOrigRanges = lastUnchangedRegions.originalDecorationIds.map((id) => model.original.getDecorationRange(id)).map(
          (r) => r ? LineRange.fromRangeInclusive(r) : void 0
        );
        const lastUnchangedRegionsModRanges = lastUnchangedRegions.modifiedDecorationIds.map((id) => model.modified.getDecorationRange(id)).map(
          (r) => r ? LineRange.fromRangeInclusive(r) : void 0
        );
        const updatedLastUnchangedRegions = lastUnchangedRegions.regions.map(
          (r, idx) => !lastUnchangedRegionsOrigRanges[idx] || !lastUnchangedRegionsModRanges[idx] ? void 0 : new UnchangedRegion(
            lastUnchangedRegionsOrigRanges[idx].startLineNumber,
            lastUnchangedRegionsModRanges[idx].startLineNumber,
            lastUnchangedRegionsOrigRanges[idx].length,
            r.visibleLineCountTop.read(reader),
            r.visibleLineCountBottom.read(reader)
          )
        ).filter(isDefined);
        const newRanges = [];
        let didChange = false;
        for (const touching of groupAdjacentBy(
          updatedLastUnchangedRegions,
          (a, b) => a.getHiddenModifiedRange(reader).endLineNumberExclusive === b.getHiddenModifiedRange(reader).startLineNumber
        )) {
          if (touching.length > 1) {
            didChange = true;
            const sumLineCount = touching.reduce(
              (sum, r2) => sum + r2.lineCount,
              0
            );
            const r = new UnchangedRegion(
              touching[0].originalLineNumber,
              touching[0].modifiedLineNumber,
              sumLineCount,
              touching[0].visibleLineCountTop.get(),
              touching[touching.length - 1].visibleLineCountBottom.get()
            );
            newRanges.push(r);
          } else {
            newRanges.push(touching[0]);
          }
        }
        if (didChange) {
          const originalDecorationIds = model.original.deltaDecorations(
            lastUnchangedRegions.originalDecorationIds,
            newRanges.map((r) => ({
              range: r.originalUnchangedRange.toInclusiveRange(),
              options: { description: "unchanged" }
            }))
          );
          const modifiedDecorationIds = model.modified.deltaDecorations(
            lastUnchangedRegions.modifiedDecorationIds,
            newRanges.map((r) => ({
              range: r.modifiedUnchangedRange.toInclusiveRange(),
              options: { description: "unchanged" }
            }))
          );
          transaction((tx) => {
            this._unchangedRegions.set(
              {
                regions: newRanges,
                originalDecorationIds,
                modifiedDecorationIds
              },
              tx
            );
          });
        }
      })
    );
    const updateUnchangedRegions = /* @__PURE__ */ __name((result, tx, reader) => {
      const newUnchangedRegions = UnchangedRegion.fromDiffs(
        result.changes,
        model.original.getLineCount(),
        model.modified.getLineCount(),
        this._options.hideUnchangedRegionsMinimumLineCount.read(reader),
        this._options.hideUnchangedRegionsContextLineCount.read(reader)
      );
      let visibleRegions;
      const lastUnchangedRegions = this._unchangedRegions.get();
      if (lastUnchangedRegions) {
        const lastUnchangedRegionsOrigRanges = lastUnchangedRegions.originalDecorationIds.map((id) => model.original.getDecorationRange(id)).map(
          (r) => r ? LineRange.fromRangeInclusive(r) : void 0
        );
        const lastUnchangedRegionsModRanges = lastUnchangedRegions.modifiedDecorationIds.map((id) => model.modified.getDecorationRange(id)).map(
          (r) => r ? LineRange.fromRangeInclusive(r) : void 0
        );
        const updatedLastUnchangedRegions = filterWithPrevious(
          lastUnchangedRegions.regions.map((r, idx) => {
            if (!lastUnchangedRegionsOrigRanges[idx] || !lastUnchangedRegionsModRanges[idx]) {
              return void 0;
            }
            const length = lastUnchangedRegionsOrigRanges[idx].length;
            return new UnchangedRegion(
              lastUnchangedRegionsOrigRanges[idx].startLineNumber,
              lastUnchangedRegionsModRanges[idx].startLineNumber,
              length,
              // The visible area can shrink by edits -> we have to account for this
              Math.min(r.visibleLineCountTop.get(), length),
              Math.min(
                r.visibleLineCountBottom.get(),
                length - r.visibleLineCountTop.get()
              )
            );
          }).filter(isDefined),
          (cur, prev) => !prev || cur.modifiedLineNumber >= prev.modifiedLineNumber + prev.lineCount && cur.originalLineNumber >= prev.originalLineNumber + prev.lineCount
        );
        let hiddenRegions = updatedLastUnchangedRegions.map(
          (r) => new LineRangeMapping(
            r.getHiddenOriginalRange(reader),
            r.getHiddenModifiedRange(reader)
          )
        );
        hiddenRegions = LineRangeMapping.clip(
          hiddenRegions,
          LineRange.ofLength(1, model.original.getLineCount()),
          LineRange.ofLength(1, model.modified.getLineCount())
        );
        visibleRegions = LineRangeMapping.inverse(
          hiddenRegions,
          model.original.getLineCount(),
          model.modified.getLineCount()
        );
      }
      const newUnchangedRegions2 = [];
      if (visibleRegions) {
        for (const r of newUnchangedRegions) {
          const intersecting = visibleRegions.filter(
            (f) => f.original.intersectsStrict(
              r.originalUnchangedRange
            ) && f.modified.intersectsStrict(
              r.modifiedUnchangedRange
            )
          );
          newUnchangedRegions2.push(
            ...r.setVisibleRanges(intersecting, tx)
          );
        }
      } else {
        newUnchangedRegions2.push(...newUnchangedRegions);
      }
      const originalDecorationIds = model.original.deltaDecorations(
        lastUnchangedRegions?.originalDecorationIds || [],
        newUnchangedRegions2.map((r) => ({
          range: r.originalUnchangedRange.toInclusiveRange(),
          options: { description: "unchanged" }
        }))
      );
      const modifiedDecorationIds = model.modified.deltaDecorations(
        lastUnchangedRegions?.modifiedDecorationIds || [],
        newUnchangedRegions2.map((r) => ({
          range: r.modifiedUnchangedRange.toInclusiveRange(),
          options: { description: "unchanged" }
        }))
      );
      this._unchangedRegions.set(
        {
          regions: newUnchangedRegions2,
          originalDecorationIds,
          modifiedDecorationIds
        },
        tx
      );
    }, "updateUnchangedRegions");
    this._register(
      model.modified.onDidChangeContent((e) => {
        const diff = this._diff.get();
        if (diff) {
          const textEdits = TextEditInfo.fromModelContentChanges(
            e.changes
          );
          const result = applyModifiedEdits(
            this._lastDiff,
            textEdits,
            model.original,
            model.modified
          );
          if (result) {
            this._lastDiff = result;
            transaction((tx) => {
              this._diff.set(
                DiffState.fromDiffResult(this._lastDiff),
                tx
              );
              updateUnchangedRegions(result, tx);
              const currentSyncedMovedText = this.movedTextToCompare.get();
              this.movedTextToCompare.set(
                currentSyncedMovedText ? this._lastDiff.moves.find(
                  (m) => m.lineRangeMapping.modified.intersect(
                    currentSyncedMovedText.lineRangeMapping.modified
                  )
                ) : void 0,
                tx
              );
            });
          }
        }
        this._isDiffUpToDate.set(false, void 0);
        debouncer.schedule();
      })
    );
    this._register(
      model.original.onDidChangeContent((e) => {
        const diff = this._diff.get();
        if (diff) {
          const textEdits = TextEditInfo.fromModelContentChanges(
            e.changes
          );
          const result = applyOriginalEdits(
            this._lastDiff,
            textEdits,
            model.original,
            model.modified
          );
          if (result) {
            this._lastDiff = result;
            transaction((tx) => {
              this._diff.set(
                DiffState.fromDiffResult(this._lastDiff),
                tx
              );
              updateUnchangedRegions(result, tx);
              const currentSyncedMovedText = this.movedTextToCompare.get();
              this.movedTextToCompare.set(
                currentSyncedMovedText ? this._lastDiff.moves.find(
                  (m) => m.lineRangeMapping.modified.intersect(
                    currentSyncedMovedText.lineRangeMapping.modified
                  )
                ) : void 0,
                tx
              );
            });
          }
        }
        this._isDiffUpToDate.set(false, void 0);
        debouncer.schedule();
      })
    );
    this._register(
      autorunWithStore(async (reader, store) => {
        this._options.hideUnchangedRegionsMinimumLineCount.read(reader);
        this._options.hideUnchangedRegionsContextLineCount.read(reader);
        debouncer.cancel();
        contentChangedSignal.read(reader);
        const documentDiffProvider = this._diffProvider.read(reader);
        documentDiffProvider.onChangeSignal.read(reader);
        readHotReloadableExport(DefaultLinesDiffComputer, reader);
        readHotReloadableExport(optimizeSequenceDiffs, reader);
        this._isDiffUpToDate.set(false, void 0);
        let originalTextEditInfos = [];
        store.add(
          model.original.onDidChangeContent((e) => {
            const edits = TextEditInfo.fromModelContentChanges(
              e.changes
            );
            originalTextEditInfos = combineTextEditInfos(
              originalTextEditInfos,
              edits
            );
          })
        );
        let modifiedTextEditInfos = [];
        store.add(
          model.modified.onDidChangeContent((e) => {
            const edits = TextEditInfo.fromModelContentChanges(
              e.changes
            );
            modifiedTextEditInfos = combineTextEditInfos(
              modifiedTextEditInfos,
              edits
            );
          })
        );
        let result = await documentDiffProvider.diffProvider.computeDiff(
          model.original,
          model.modified,
          {
            ignoreTrimWhitespace: this._options.ignoreTrimWhitespace.read(reader),
            maxComputationTimeMs: this._options.maxComputationTimeMs.read(reader),
            computeMoves: this._options.showMoves.read(reader)
          },
          this._cancellationTokenSource.token
        );
        if (this._cancellationTokenSource.token.isCancellationRequested) {
          return;
        }
        if (model.original.isDisposed() || model.modified.isDisposed()) {
          return;
        }
        result = normalizeDocumentDiff(
          result,
          model.original,
          model.modified
        );
        result = applyOriginalEdits(
          result,
          originalTextEditInfos,
          model.original,
          model.modified
        ) ?? result;
        result = applyModifiedEdits(
          result,
          modifiedTextEditInfos,
          model.original,
          model.modified
        ) ?? result;
        transaction((tx) => {
          updateUnchangedRegions(result, tx);
          this._lastDiff = result;
          const state = DiffState.fromDiffResult(result);
          this._diff.set(state, tx);
          this._isDiffUpToDate.set(true, tx);
          const currentSyncedMovedText = this.movedTextToCompare.get();
          this.movedTextToCompare.set(
            currentSyncedMovedText ? this._lastDiff.moves.find(
              (m) => m.lineRangeMapping.modified.intersect(
                currentSyncedMovedText.lineRangeMapping.modified
              )
            ) : void 0,
            tx
          );
        });
      })
    );
  }
  static {
    __name(this, "DiffEditorViewModel");
  }
  _isDiffUpToDate = observableValue(this, false);
  isDiffUpToDate = this._isDiffUpToDate;
  _lastDiff;
  _diff = observableValue(
    this,
    void 0
  );
  diff = this._diff;
  _unchangedRegions = observableValue(this, void 0);
  unchangedRegions = derived(
    this,
    (r) => {
      if (this._options.hideUnchangedRegions.read(r)) {
        return this._unchangedRegions.read(r)?.regions ?? [];
      } else {
        transaction((tx) => {
          for (const r2 of this._unchangedRegions.get()?.regions || []) {
            r2.collapseAll(tx);
          }
        });
        return [];
      }
    }
  );
  movedTextToCompare = observableValue(
    this,
    void 0
  );
  _activeMovedText = observableValue(
    this,
    void 0
  );
  _hoveredMovedText = observableValue(
    this,
    void 0
  );
  activeMovedText = derived(
    this,
    (r) => this.movedTextToCompare.read(r) ?? this._hoveredMovedText.read(r) ?? this._activeMovedText.read(r)
  );
  setActiveMovedText(movedText) {
    this._activeMovedText.set(movedText, void 0);
  }
  setHoveredMovedText(movedText) {
    this._hoveredMovedText.set(movedText, void 0);
  }
  _cancellationTokenSource = new CancellationTokenSource();
  _diffProvider = derived(this, (reader) => {
    const diffProvider = this._diffProviderFactoryService.createDiffProvider({
      diffAlgorithm: this._options.diffAlgorithm.read(reader)
    });
    const onChangeSignal = observableSignalFromEvent(
      "onDidChange",
      diffProvider.onDidChange
    );
    return {
      diffProvider,
      onChangeSignal
    };
  });
  ensureModifiedLineIsVisible(lineNumber, preference, tx) {
    if (this.diff.get()?.mappings.length === 0) {
      return;
    }
    const unchangedRegions = this._unchangedRegions.get()?.regions || [];
    for (const r of unchangedRegions) {
      if (r.getHiddenModifiedRange(void 0).contains(lineNumber)) {
        r.showModifiedLine(lineNumber, preference, tx);
        return;
      }
    }
  }
  ensureOriginalLineIsVisible(lineNumber, preference, tx) {
    if (this.diff.get()?.mappings.length === 0) {
      return;
    }
    const unchangedRegions = this._unchangedRegions.get()?.regions || [];
    for (const r of unchangedRegions) {
      if (r.getHiddenOriginalRange(void 0).contains(lineNumber)) {
        r.showOriginalLine(lineNumber, preference, tx);
        return;
      }
    }
  }
  async waitForDiff() {
    await waitForState(this.isDiffUpToDate, (s) => s);
  }
  serializeState() {
    const regions = this._unchangedRegions.get();
    return {
      collapsedRegions: regions?.regions.map((r) => ({
        range: r.getHiddenModifiedRange(void 0).serialize()
      }))
    };
  }
  restoreSerializedState(state) {
    const ranges = state.collapsedRegions?.map(
      (r) => LineRange.deserialize(r.range)
    );
    const regions = this._unchangedRegions.get();
    if (!regions || !ranges) {
      return;
    }
    transaction((tx) => {
      for (const r of regions.regions) {
        for (const range of ranges) {
          if (r.modifiedUnchangedRange.intersect(range)) {
            r.setHiddenModifiedRange(range, tx);
            break;
          }
        }
      }
    });
  }
};
DiffEditorViewModel = __decorateClass([
  __decorateParam(2, IDiffProviderFactoryService)
], DiffEditorViewModel);
function normalizeDocumentDiff(diff, original, modified) {
  return {
    changes: diff.changes.map(
      (c) => new DetailedLineRangeMapping(
        c.original,
        c.modified,
        c.innerChanges ? c.innerChanges.map(
          (i) => normalizeRangeMapping(i, original, modified)
        ) : void 0
      )
    ),
    moves: diff.moves,
    identical: diff.identical,
    quitEarly: diff.quitEarly
  };
}
__name(normalizeDocumentDiff, "normalizeDocumentDiff");
function normalizeRangeMapping(rangeMapping, original, modified) {
  let originalRange = rangeMapping.originalRange;
  let modifiedRange = rangeMapping.modifiedRange;
  if (originalRange.startColumn === 1 && modifiedRange.startColumn === 1 && (originalRange.endColumn !== 1 || modifiedRange.endColumn !== 1) && originalRange.endColumn === original.getLineMaxColumn(originalRange.endLineNumber) && modifiedRange.endColumn === modified.getLineMaxColumn(modifiedRange.endLineNumber) && originalRange.endLineNumber < original.getLineCount() && modifiedRange.endLineNumber < modified.getLineCount()) {
    originalRange = originalRange.setEndPosition(
      originalRange.endLineNumber + 1,
      1
    );
    modifiedRange = modifiedRange.setEndPosition(
      modifiedRange.endLineNumber + 1,
      1
    );
  }
  return new RangeMapping(originalRange, modifiedRange);
}
__name(normalizeRangeMapping, "normalizeRangeMapping");
class DiffState {
  constructor(mappings, movedTexts, identical, quitEarly) {
    this.mappings = mappings;
    this.movedTexts = movedTexts;
    this.identical = identical;
    this.quitEarly = quitEarly;
  }
  static {
    __name(this, "DiffState");
  }
  static fromDiffResult(result) {
    return new DiffState(
      result.changes.map((c) => new DiffMapping(c)),
      result.moves || [],
      result.identical,
      result.quitEarly
    );
  }
}
class DiffMapping {
  constructor(lineRangeMapping) {
    this.lineRangeMapping = lineRangeMapping;
  }
  static {
    __name(this, "DiffMapping");
  }
}
class UnchangedRegion {
  constructor(originalLineNumber, modifiedLineNumber, lineCount, visibleLineCountTop, visibleLineCountBottom) {
    this.originalLineNumber = originalLineNumber;
    this.modifiedLineNumber = modifiedLineNumber;
    this.lineCount = lineCount;
    const visibleLineCountTop2 = Math.max(
      Math.min(visibleLineCountTop, this.lineCount),
      0
    );
    const visibleLineCountBottom2 = Math.max(
      Math.min(
        visibleLineCountBottom,
        this.lineCount - visibleLineCountTop
      ),
      0
    );
    softAssert(visibleLineCountTop === visibleLineCountTop2);
    softAssert(visibleLineCountBottom === visibleLineCountBottom2);
    this._visibleLineCountTop.set(visibleLineCountTop2, void 0);
    this._visibleLineCountBottom.set(visibleLineCountBottom2, void 0);
  }
  static {
    __name(this, "UnchangedRegion");
  }
  static fromDiffs(changes, originalLineCount, modifiedLineCount, minHiddenLineCount, minContext) {
    const inversedMappings = DetailedLineRangeMapping.inverse(
      changes,
      originalLineCount,
      modifiedLineCount
    );
    const result = [];
    for (const mapping of inversedMappings) {
      let origStart = mapping.original.startLineNumber;
      let modStart = mapping.modified.startLineNumber;
      let length = mapping.original.length;
      const atStart = origStart === 1 && modStart === 1;
      const atEnd = origStart + length === originalLineCount + 1 && modStart + length === modifiedLineCount + 1;
      if ((atStart || atEnd) && length >= minContext + minHiddenLineCount) {
        if (atStart && !atEnd) {
          length -= minContext;
        }
        if (atEnd && !atStart) {
          origStart += minContext;
          modStart += minContext;
          length -= minContext;
        }
        result.push(
          new UnchangedRegion(origStart, modStart, length, 0, 0)
        );
      } else if (length >= minContext * 2 + minHiddenLineCount) {
        origStart += minContext;
        modStart += minContext;
        length -= minContext * 2;
        result.push(
          new UnchangedRegion(origStart, modStart, length, 0, 0)
        );
      }
    }
    return result;
  }
  get originalUnchangedRange() {
    return LineRange.ofLength(this.originalLineNumber, this.lineCount);
  }
  get modifiedUnchangedRange() {
    return LineRange.ofLength(this.modifiedLineNumber, this.lineCount);
  }
  _visibleLineCountTop = observableValue(this, 0);
  visibleLineCountTop = this._visibleLineCountTop;
  _visibleLineCountBottom = observableValue(this, 0);
  visibleLineCountBottom = this._visibleLineCountBottom;
  _shouldHideControls = derived(
    this,
    (reader) => this.visibleLineCountTop.read(reader) + this.visibleLineCountBottom.read(reader) === this.lineCount && !this.isDragged.read(reader)
  );
  isDragged = observableValue(
    this,
    void 0
  );
  setVisibleRanges(visibleRanges, tx) {
    const result = [];
    const hiddenModified = new LineRangeSet(
      visibleRanges.map((r) => r.modified)
    ).subtractFrom(this.modifiedUnchangedRange);
    let originalStartLineNumber = this.originalLineNumber;
    let modifiedStartLineNumber = this.modifiedLineNumber;
    const modifiedEndLineNumberEx = this.modifiedLineNumber + this.lineCount;
    if (hiddenModified.ranges.length === 0) {
      this.showAll(tx);
      result.push(this);
    } else {
      let i = 0;
      for (const r of hiddenModified.ranges) {
        const isLast = i === hiddenModified.ranges.length - 1;
        i++;
        const length = (isLast ? modifiedEndLineNumberEx : r.endLineNumberExclusive) - modifiedStartLineNumber;
        const newR = new UnchangedRegion(
          originalStartLineNumber,
          modifiedStartLineNumber,
          length,
          0,
          0
        );
        newR.setHiddenModifiedRange(r, tx);
        result.push(newR);
        originalStartLineNumber = newR.originalUnchangedRange.endLineNumberExclusive;
        modifiedStartLineNumber = newR.modifiedUnchangedRange.endLineNumberExclusive;
      }
    }
    return result;
  }
  shouldHideControls(reader) {
    return this._shouldHideControls.read(reader);
  }
  getHiddenOriginalRange(reader) {
    return LineRange.ofLength(
      this.originalLineNumber + this._visibleLineCountTop.read(reader),
      this.lineCount - this._visibleLineCountTop.read(reader) - this._visibleLineCountBottom.read(reader)
    );
  }
  getHiddenModifiedRange(reader) {
    return LineRange.ofLength(
      this.modifiedLineNumber + this._visibleLineCountTop.read(reader),
      this.lineCount - this._visibleLineCountTop.read(reader) - this._visibleLineCountBottom.read(reader)
    );
  }
  setHiddenModifiedRange(range, tx) {
    const visibleLineCountTop = range.startLineNumber - this.modifiedLineNumber;
    const visibleLineCountBottom = this.modifiedLineNumber + this.lineCount - range.endLineNumberExclusive;
    this.setState(visibleLineCountTop, visibleLineCountBottom, tx);
  }
  getMaxVisibleLineCountTop() {
    return this.lineCount - this._visibleLineCountBottom.get();
  }
  getMaxVisibleLineCountBottom() {
    return this.lineCount - this._visibleLineCountTop.get();
  }
  showMoreAbove(count = 10, tx) {
    const maxVisibleLineCountTop = this.getMaxVisibleLineCountTop();
    this._visibleLineCountTop.set(
      Math.min(
        this._visibleLineCountTop.get() + count,
        maxVisibleLineCountTop
      ),
      tx
    );
  }
  showMoreBelow(count = 10, tx) {
    const maxVisibleLineCountBottom = this.lineCount - this._visibleLineCountTop.get();
    this._visibleLineCountBottom.set(
      Math.min(
        this._visibleLineCountBottom.get() + count,
        maxVisibleLineCountBottom
      ),
      tx
    );
  }
  showAll(tx) {
    this._visibleLineCountBottom.set(
      this.lineCount - this._visibleLineCountTop.get(),
      tx
    );
  }
  showModifiedLine(lineNumber, preference, tx) {
    const top = lineNumber + 1 - (this.modifiedLineNumber + this._visibleLineCountTop.get());
    const bottom = this.modifiedLineNumber - this._visibleLineCountBottom.get() + this.lineCount - lineNumber;
    if (preference === 0 /* FromCloserSide */ && top < bottom || preference === 1 /* FromTop */) {
      this._visibleLineCountTop.set(
        this._visibleLineCountTop.get() + top,
        tx
      );
    } else {
      this._visibleLineCountBottom.set(
        this._visibleLineCountBottom.get() + bottom,
        tx
      );
    }
  }
  showOriginalLine(lineNumber, preference, tx) {
    const top = lineNumber - this.originalLineNumber;
    const bottom = this.originalLineNumber + this.lineCount - lineNumber;
    if (preference === 0 /* FromCloserSide */ && top < bottom || preference === 1 /* FromTop */) {
      this._visibleLineCountTop.set(
        Math.min(
          this._visibleLineCountTop.get() + bottom - top,
          this.getMaxVisibleLineCountTop()
        ),
        tx
      );
    } else {
      this._visibleLineCountBottom.set(
        Math.min(
          this._visibleLineCountBottom.get() + top - bottom,
          this.getMaxVisibleLineCountBottom()
        ),
        tx
      );
    }
  }
  collapseAll(tx) {
    this._visibleLineCountTop.set(0, tx);
    this._visibleLineCountBottom.set(0, tx);
  }
  setState(visibleLineCountTop, visibleLineCountBottom, tx) {
    visibleLineCountTop = Math.max(
      Math.min(visibleLineCountTop, this.lineCount),
      0
    );
    visibleLineCountBottom = Math.max(
      Math.min(
        visibleLineCountBottom,
        this.lineCount - visibleLineCountTop
      ),
      0
    );
    this._visibleLineCountTop.set(visibleLineCountTop, tx);
    this._visibleLineCountBottom.set(visibleLineCountBottom, tx);
  }
}
var RevealPreference = /* @__PURE__ */ ((RevealPreference2) => {
  RevealPreference2[RevealPreference2["FromCloserSide"] = 0] = "FromCloserSide";
  RevealPreference2[RevealPreference2["FromTop"] = 1] = "FromTop";
  RevealPreference2[RevealPreference2["FromBottom"] = 2] = "FromBottom";
  return RevealPreference2;
})(RevealPreference || {});
function applyOriginalEdits(diff, textEdits, originalTextModel, modifiedTextModel) {
  return void 0;
}
__name(applyOriginalEdits, "applyOriginalEdits");
function applyModifiedEdits(diff, textEdits, originalTextModel, modifiedTextModel) {
  return void 0;
}
__name(applyModifiedEdits, "applyModifiedEdits");
export {
  DiffEditorViewModel,
  DiffMapping,
  DiffState,
  RevealPreference,
  UnchangedRegion
};
//# sourceMappingURL=diffEditorViewModel.js.map
