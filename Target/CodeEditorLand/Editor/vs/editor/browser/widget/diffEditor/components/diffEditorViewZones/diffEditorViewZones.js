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
  $,
  addDisposableListener
} from "../../../../../../base/browser/dom.js";
import { ArrayQueue } from "../../../../../../base/common/arrays.js";
import { RunOnceScheduler } from "../../../../../../base/common/async.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import {
  Disposable,
  DisposableStore
} from "../../../../../../base/common/lifecycle.js";
import {
  autorun,
  derived,
  derivedWithStore,
  observableFromEvent,
  observableValue
} from "../../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { assertIsDefined } from "../../../../../../base/common/types.js";
import { IClipboardService } from "../../../../../../platform/clipboard/common/clipboardService.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { EditorOption } from "../../../../../common/config/editorOptions.js";
import { LineRange } from "../../../../../common/core/lineRange.js";
import { Position } from "../../../../../common/core/position.js";
import { Range } from "../../../../../common/core/range.js";
import { ScrollType } from "../../../../../common/editorCommon.js";
import { BackgroundTokenizationState } from "../../../../../common/tokenizationTextModelPart.js";
import {
  InlineDecoration,
  InlineDecorationType
} from "../../../../../common/viewModel.js";
import { applyFontInfo } from "../../../../config/domFontInfo.js";
import {
  DiffMapping
} from "../../diffEditorViewModel.js";
import {
  diffDeleteDecoration,
  diffRemoveIcon
} from "../../registrations.contribution.js";
import {
  animatedObservable,
  joinCombine
} from "../../utils.js";
import { InlineDiffDeletedCodeMargin } from "./inlineDiffDeletedCodeMargin.js";
import { LineSource, RenderOptions, renderLines } from "./renderLines.js";
let DiffEditorViewZones = class extends Disposable {
  constructor(_targetWindow, _editors, _diffModel, _options, _diffEditorWidget, _canIgnoreViewZoneUpdateEvent, _origViewZonesToIgnore, _modViewZonesToIgnore, _clipboardService, _contextMenuService) {
    super();
    this._targetWindow = _targetWindow;
    this._editors = _editors;
    this._diffModel = _diffModel;
    this._options = _options;
    this._diffEditorWidget = _diffEditorWidget;
    this._canIgnoreViewZoneUpdateEvent = _canIgnoreViewZoneUpdateEvent;
    this._origViewZonesToIgnore = _origViewZonesToIgnore;
    this._modViewZonesToIgnore = _modViewZonesToIgnore;
    this._clipboardService = _clipboardService;
    this._contextMenuService = _contextMenuService;
    const state = observableValue("invalidateAlignmentsState", 0);
    const updateImmediately = this._register(new RunOnceScheduler(() => {
      state.set(state.get() + 1, void 0);
    }, 0));
    this._register(this._editors.original.onDidChangeViewZones((_args) => {
      if (!this._canIgnoreViewZoneUpdateEvent()) {
        updateImmediately.schedule();
      }
    }));
    this._register(this._editors.modified.onDidChangeViewZones((_args) => {
      if (!this._canIgnoreViewZoneUpdateEvent()) {
        updateImmediately.schedule();
      }
    }));
    this._register(this._editors.original.onDidChangeConfiguration((args) => {
      if (args.hasChanged(EditorOption.wrappingInfo) || args.hasChanged(EditorOption.lineHeight)) {
        updateImmediately.schedule();
      }
    }));
    this._register(this._editors.modified.onDidChangeConfiguration((args) => {
      if (args.hasChanged(EditorOption.wrappingInfo) || args.hasChanged(EditorOption.lineHeight)) {
        updateImmediately.schedule();
      }
    }));
    const originalModelTokenizationCompleted = this._diffModel.map(
      (m) => m ? observableFromEvent(this, m.model.original.onDidChangeTokens, () => m.model.original.tokenization.backgroundTokenizationState === BackgroundTokenizationState.Completed) : void 0
    ).map((m, reader) => m?.read(reader));
    const alignments = derived((reader) => {
      const diffModel = this._diffModel.read(reader);
      const diff = diffModel?.diff.read(reader);
      if (!diffModel || !diff) {
        return null;
      }
      state.read(reader);
      const renderSideBySide = this._options.renderSideBySide.read(reader);
      const innerHunkAlignment = renderSideBySide;
      return computeRangeAlignment(
        this._editors.original,
        this._editors.modified,
        diff.mappings,
        this._origViewZonesToIgnore,
        this._modViewZonesToIgnore,
        innerHunkAlignment
      );
    });
    const alignmentsSyncedMovedText = derived((reader) => {
      const syncedMovedText = this._diffModel.read(reader)?.movedTextToCompare.read(reader);
      if (!syncedMovedText) {
        return null;
      }
      state.read(reader);
      const mappings = syncedMovedText.changes.map((c) => new DiffMapping(c));
      return computeRangeAlignment(
        this._editors.original,
        this._editors.modified,
        mappings,
        this._origViewZonesToIgnore,
        this._modViewZonesToIgnore,
        true
      );
    });
    function createFakeLinesDiv() {
      const r = document.createElement("div");
      r.className = "diagonal-fill";
      return r;
    }
    __name(createFakeLinesDiv, "createFakeLinesDiv");
    const alignmentViewZonesDisposables = this._register(new DisposableStore());
    this.viewZones = derivedWithStore(this, (reader, store) => {
      alignmentViewZonesDisposables.clear();
      const alignmentsVal = alignments.read(reader) || [];
      const origViewZones = [];
      const modViewZones = [];
      const modifiedTopPaddingVal = this._modifiedTopPadding.read(reader);
      if (modifiedTopPaddingVal > 0) {
        modViewZones.push({
          afterLineNumber: 0,
          domNode: document.createElement("div"),
          heightInPx: modifiedTopPaddingVal,
          showInHiddenAreas: true,
          suppressMouseDown: true
        });
      }
      const originalTopPaddingVal = this._originalTopPadding.read(reader);
      if (originalTopPaddingVal > 0) {
        origViewZones.push({
          afterLineNumber: 0,
          domNode: document.createElement("div"),
          heightInPx: originalTopPaddingVal,
          showInHiddenAreas: true,
          suppressMouseDown: true
        });
      }
      const renderSideBySide = this._options.renderSideBySide.read(reader);
      const deletedCodeLineBreaksComputer = renderSideBySide ? void 0 : this._editors.modified._getViewModel()?.createLineBreaksComputer();
      if (deletedCodeLineBreaksComputer) {
        const originalModel = this._editors.original.getModel();
        for (const a of alignmentsVal) {
          if (a.diff) {
            for (let i = a.originalRange.startLineNumber; i < a.originalRange.endLineNumberExclusive; i++) {
              if (i > originalModel.getLineCount()) {
                return { orig: origViewZones, mod: modViewZones };
              }
              deletedCodeLineBreaksComputer?.addRequest(originalModel.getLineContent(i), null, null);
            }
          }
        }
      }
      const lineBreakData = deletedCodeLineBreaksComputer?.finalize() ?? [];
      let lineBreakDataIdx = 0;
      const modLineHeight = this._editors.modified.getOption(EditorOption.lineHeight);
      const syncedMovedText = this._diffModel.read(reader)?.movedTextToCompare.read(reader);
      const mightContainNonBasicASCII = this._editors.original.getModel()?.mightContainNonBasicASCII() ?? false;
      const mightContainRTL = this._editors.original.getModel()?.mightContainRTL() ?? false;
      const renderOptions = RenderOptions.fromEditor(this._editors.modified);
      for (const a of alignmentsVal) {
        if (a.diff && !renderSideBySide && (!this._options.useTrueInlineDiffRendering.read(reader) || !allowsTrueInlineDiffRendering(a.diff))) {
          if (!a.originalRange.isEmpty) {
            originalModelTokenizationCompleted.read(reader);
            const deletedCodeDomNode = document.createElement("div");
            deletedCodeDomNode.classList.add("view-lines", "line-delete", "monaco-mouse-cursor-text");
            const originalModel = this._editors.original.getModel();
            if (a.originalRange.endLineNumberExclusive - 1 > originalModel.getLineCount()) {
              return { orig: origViewZones, mod: modViewZones };
            }
            const source = new LineSource(
              a.originalRange.mapToLineArray((l) => originalModel.tokenization.getLineTokens(l)),
              a.originalRange.mapToLineArray((_) => lineBreakData[lineBreakDataIdx++]),
              mightContainNonBasicASCII,
              mightContainRTL
            );
            const decorations = [];
            for (const i of a.diff.innerChanges || []) {
              decorations.push(new InlineDecoration(
                i.originalRange.delta(-(a.diff.original.startLineNumber - 1)),
                diffDeleteDecoration.className,
                InlineDecorationType.Regular
              ));
            }
            const result = renderLines(source, renderOptions, decorations, deletedCodeDomNode);
            const marginDomNode2 = document.createElement("div");
            marginDomNode2.className = "inline-deleted-margin-view-zone";
            applyFontInfo(marginDomNode2, renderOptions.fontInfo);
            if (this._options.renderIndicators.read(reader)) {
              for (let i = 0; i < result.heightInLines; i++) {
                const marginElement = document.createElement("div");
                marginElement.className = `delete-sign ${ThemeIcon.asClassName(diffRemoveIcon)}`;
                marginElement.setAttribute("style", `position:absolute;top:${i * modLineHeight}px;width:${renderOptions.lineDecorationsWidth}px;height:${modLineHeight}px;right:0;`);
                marginDomNode2.appendChild(marginElement);
              }
            }
            let zoneId;
            alignmentViewZonesDisposables.add(
              new InlineDiffDeletedCodeMargin(
                () => assertIsDefined(zoneId),
                marginDomNode2,
                this._editors.modified,
                a.diff,
                this._diffEditorWidget,
                result.viewLineCounts,
                this._editors.original.getModel(),
                this._contextMenuService,
                this._clipboardService
              )
            );
            for (let i = 0; i < result.viewLineCounts.length; i++) {
              const count = result.viewLineCounts[i];
              if (count > 1) {
                origViewZones.push({
                  afterLineNumber: a.originalRange.startLineNumber + i,
                  domNode: createFakeLinesDiv(),
                  heightInPx: (count - 1) * modLineHeight,
                  showInHiddenAreas: true,
                  suppressMouseDown: true
                });
              }
            }
            modViewZones.push({
              afterLineNumber: a.modifiedRange.startLineNumber - 1,
              domNode: deletedCodeDomNode,
              heightInPx: result.heightInLines * modLineHeight,
              minWidthInPx: result.minWidthInPx,
              marginDomNode: marginDomNode2,
              setZoneId(id) {
                zoneId = id;
              },
              showInHiddenAreas: true,
              suppressMouseDown: true
            });
          }
          const marginDomNode = document.createElement("div");
          marginDomNode.className = "gutter-delete";
          origViewZones.push({
            afterLineNumber: a.originalRange.endLineNumberExclusive - 1,
            domNode: createFakeLinesDiv(),
            heightInPx: a.modifiedHeightInPx,
            marginDomNode,
            showInHiddenAreas: true,
            suppressMouseDown: true
          });
        } else {
          const delta = a.modifiedHeightInPx - a.originalHeightInPx;
          if (delta > 0) {
            if (syncedMovedText?.lineRangeMapping.original.delta(-1).deltaLength(2).contains(a.originalRange.endLineNumberExclusive - 1)) {
              continue;
            }
            origViewZones.push({
              afterLineNumber: a.originalRange.endLineNumberExclusive - 1,
              domNode: createFakeLinesDiv(),
              heightInPx: delta,
              showInHiddenAreas: true,
              suppressMouseDown: true
            });
          } else {
            let createViewZoneMarginArrow2 = function() {
              const arrow = document.createElement("div");
              arrow.className = "arrow-revert-change " + ThemeIcon.asClassName(Codicon.arrowRight);
              store.add(addDisposableListener(arrow, "mousedown", (e) => e.stopPropagation()));
              store.add(addDisposableListener(arrow, "click", (e) => {
                e.stopPropagation();
                _diffEditorWidget.revert(a.diff);
              }));
              return $("div", {}, arrow);
            };
            var createViewZoneMarginArrow = createViewZoneMarginArrow2;
            __name(createViewZoneMarginArrow2, "createViewZoneMarginArrow");
            if (syncedMovedText?.lineRangeMapping.modified.delta(-1).deltaLength(2).contains(a.modifiedRange.endLineNumberExclusive - 1)) {
              continue;
            }
            let marginDomNode;
            if (a.diff && a.diff.modified.isEmpty && this._options.shouldRenderOldRevertArrows.read(reader)) {
              marginDomNode = createViewZoneMarginArrow2();
            }
            modViewZones.push({
              afterLineNumber: a.modifiedRange.endLineNumberExclusive - 1,
              domNode: createFakeLinesDiv(),
              heightInPx: -delta,
              marginDomNode,
              showInHiddenAreas: true,
              suppressMouseDown: true
            });
          }
        }
      }
      for (const a of alignmentsSyncedMovedText.read(reader) ?? []) {
        if (!syncedMovedText?.lineRangeMapping.original.intersect(a.originalRange) || !syncedMovedText?.lineRangeMapping.modified.intersect(a.modifiedRange)) {
          continue;
        }
        const delta = a.modifiedHeightInPx - a.originalHeightInPx;
        if (delta > 0) {
          origViewZones.push({
            afterLineNumber: a.originalRange.endLineNumberExclusive - 1,
            domNode: createFakeLinesDiv(),
            heightInPx: delta,
            showInHiddenAreas: true,
            suppressMouseDown: true
          });
        } else {
          modViewZones.push({
            afterLineNumber: a.modifiedRange.endLineNumberExclusive - 1,
            domNode: createFakeLinesDiv(),
            heightInPx: -delta,
            showInHiddenAreas: true,
            suppressMouseDown: true
          });
        }
      }
      return { orig: origViewZones, mod: modViewZones };
    });
    let ignoreChange = false;
    this._register(this._editors.original.onDidScrollChange((e) => {
      if (e.scrollLeftChanged && !ignoreChange) {
        ignoreChange = true;
        this._editors.modified.setScrollLeft(e.scrollLeft);
        ignoreChange = false;
      }
    }));
    this._register(this._editors.modified.onDidScrollChange((e) => {
      if (e.scrollLeftChanged && !ignoreChange) {
        ignoreChange = true;
        this._editors.original.setScrollLeft(e.scrollLeft);
        ignoreChange = false;
      }
    }));
    this._originalScrollTop = observableFromEvent(this._editors.original.onDidScrollChange, () => (
      /** @description original.getScrollTop */
      this._editors.original.getScrollTop()
    ));
    this._modifiedScrollTop = observableFromEvent(this._editors.modified.onDidScrollChange, () => (
      /** @description modified.getScrollTop */
      this._editors.modified.getScrollTop()
    ));
    this._register(autorun((reader) => {
      const newScrollTopModified = this._originalScrollTop.read(reader) - (this._originalScrollOffsetAnimated.get() - this._modifiedScrollOffsetAnimated.read(reader)) - (this._originalTopPadding.get() - this._modifiedTopPadding.read(reader));
      if (newScrollTopModified !== this._editors.modified.getScrollTop()) {
        this._editors.modified.setScrollTop(newScrollTopModified, ScrollType.Immediate);
      }
    }));
    this._register(autorun((reader) => {
      const newScrollTopOriginal = this._modifiedScrollTop.read(reader) - (this._modifiedScrollOffsetAnimated.get() - this._originalScrollOffsetAnimated.read(reader)) - (this._modifiedTopPadding.get() - this._originalTopPadding.read(reader));
      if (newScrollTopOriginal !== this._editors.original.getScrollTop()) {
        this._editors.original.setScrollTop(newScrollTopOriginal, ScrollType.Immediate);
      }
    }));
    this._register(autorun((reader) => {
      const m = this._diffModel.read(reader)?.movedTextToCompare.read(reader);
      let deltaOrigToMod = 0;
      if (m) {
        const trueTopOriginal = this._editors.original.getTopForLineNumber(m.lineRangeMapping.original.startLineNumber, true) - this._originalTopPadding.get();
        const trueTopModified = this._editors.modified.getTopForLineNumber(m.lineRangeMapping.modified.startLineNumber, true) - this._modifiedTopPadding.get();
        deltaOrigToMod = trueTopModified - trueTopOriginal;
      }
      if (deltaOrigToMod > 0) {
        this._modifiedTopPadding.set(0, void 0);
        this._originalTopPadding.set(deltaOrigToMod, void 0);
      } else if (deltaOrigToMod < 0) {
        this._modifiedTopPadding.set(-deltaOrigToMod, void 0);
        this._originalTopPadding.set(0, void 0);
      } else {
        setTimeout(() => {
          this._modifiedTopPadding.set(0, void 0);
          this._originalTopPadding.set(0, void 0);
        }, 400);
      }
      if (this._editors.modified.hasTextFocus()) {
        this._originalScrollOffset.set(this._modifiedScrollOffset.get() - deltaOrigToMod, void 0, true);
      } else {
        this._modifiedScrollOffset.set(this._originalScrollOffset.get() + deltaOrigToMod, void 0, true);
      }
    }));
  }
  static {
    __name(this, "DiffEditorViewZones");
  }
  _originalTopPadding = observableValue(this, 0);
  _originalScrollTop;
  _originalScrollOffset = observableValue(
    this,
    0
  );
  _originalScrollOffsetAnimated = animatedObservable(
    this._targetWindow,
    this._originalScrollOffset,
    this._store
  );
  _modifiedTopPadding = observableValue(this, 0);
  _modifiedScrollTop;
  _modifiedScrollOffset = observableValue(
    this,
    0
  );
  _modifiedScrollOffsetAnimated = animatedObservable(
    this._targetWindow,
    this._modifiedScrollOffset,
    this._store
  );
  viewZones;
};
DiffEditorViewZones = __decorateClass([
  __decorateParam(8, IClipboardService),
  __decorateParam(9, IContextMenuService)
], DiffEditorViewZones);
function computeRangeAlignment(originalEditor, modifiedEditor, diffs, originalEditorAlignmentViewZones, modifiedEditorAlignmentViewZones, innerHunkAlignment) {
  const originalLineHeightOverrides = new ArrayQueue(
    getAdditionalLineHeights(
      originalEditor,
      originalEditorAlignmentViewZones
    )
  );
  const modifiedLineHeightOverrides = new ArrayQueue(
    getAdditionalLineHeights(
      modifiedEditor,
      modifiedEditorAlignmentViewZones
    )
  );
  const origLineHeight = originalEditor.getOption(EditorOption.lineHeight);
  const modLineHeight = modifiedEditor.getOption(EditorOption.lineHeight);
  const result = [];
  let lastOriginalLineNumber = 0;
  let lastModifiedLineNumber = 0;
  function handleAlignmentsOutsideOfDiffs(untilOriginalLineNumberExclusive, untilModifiedLineNumberExclusive) {
    while (true) {
      let origNext = originalLineHeightOverrides.peek();
      let modNext = modifiedLineHeightOverrides.peek();
      if (origNext && origNext.lineNumber >= untilOriginalLineNumberExclusive) {
        origNext = void 0;
      }
      if (modNext && modNext.lineNumber >= untilModifiedLineNumberExclusive) {
        modNext = void 0;
      }
      if (!origNext && !modNext) {
        break;
      }
      const distOrig = origNext ? origNext.lineNumber - lastOriginalLineNumber : Number.MAX_VALUE;
      const distNext = modNext ? modNext.lineNumber - lastModifiedLineNumber : Number.MAX_VALUE;
      if (distOrig < distNext) {
        originalLineHeightOverrides.dequeue();
        modNext = {
          lineNumber: origNext.lineNumber - lastOriginalLineNumber + lastModifiedLineNumber,
          heightInPx: 0
        };
      } else if (distOrig > distNext) {
        modifiedLineHeightOverrides.dequeue();
        origNext = {
          lineNumber: modNext.lineNumber - lastModifiedLineNumber + lastOriginalLineNumber,
          heightInPx: 0
        };
      } else {
        originalLineHeightOverrides.dequeue();
        modifiedLineHeightOverrides.dequeue();
      }
      result.push({
        originalRange: LineRange.ofLength(origNext.lineNumber, 1),
        modifiedRange: LineRange.ofLength(modNext.lineNumber, 1),
        originalHeightInPx: origLineHeight + origNext.heightInPx,
        modifiedHeightInPx: modLineHeight + modNext.heightInPx,
        diff: void 0
      });
    }
  }
  __name(handleAlignmentsOutsideOfDiffs, "handleAlignmentsOutsideOfDiffs");
  for (const m of diffs) {
    let emitAlignment2 = function(origLineNumberExclusive, modLineNumberExclusive, forceAlignment = false) {
      if (origLineNumberExclusive < lastOrigLineNumber || modLineNumberExclusive < lastModLineNumber) {
        return;
      }
      if (first) {
        first = false;
      } else if (!forceAlignment && (origLineNumberExclusive === lastOrigLineNumber || modLineNumberExclusive === lastModLineNumber)) {
        return;
      }
      const originalRange = new LineRange(
        lastOrigLineNumber,
        origLineNumberExclusive
      );
      const modifiedRange = new LineRange(
        lastModLineNumber,
        modLineNumberExclusive
      );
      if (originalRange.isEmpty && modifiedRange.isEmpty) {
        return;
      }
      const originalAdditionalHeight = originalLineHeightOverrides.takeWhile((v) => v.lineNumber < origLineNumberExclusive)?.reduce((p, c2) => p + c2.heightInPx, 0) ?? 0;
      const modifiedAdditionalHeight = modifiedLineHeightOverrides.takeWhile((v) => v.lineNumber < modLineNumberExclusive)?.reduce((p, c2) => p + c2.heightInPx, 0) ?? 0;
      result.push({
        originalRange,
        modifiedRange,
        originalHeightInPx: originalRange.length * origLineHeight + originalAdditionalHeight,
        modifiedHeightInPx: modifiedRange.length * modLineHeight + modifiedAdditionalHeight,
        diff: m.lineRangeMapping
      });
      lastOrigLineNumber = origLineNumberExclusive;
      lastModLineNumber = modLineNumberExclusive;
    };
    var emitAlignment = emitAlignment2;
    __name(emitAlignment2, "emitAlignment");
    const c = m.lineRangeMapping;
    handleAlignmentsOutsideOfDiffs(
      c.original.startLineNumber,
      c.modified.startLineNumber
    );
    let first = true;
    let lastModLineNumber = c.modified.startLineNumber;
    let lastOrigLineNumber = c.original.startLineNumber;
    if (innerHunkAlignment) {
      for (const i of c.innerChanges || []) {
        if (i.originalRange.startColumn > 1 && i.modifiedRange.startColumn > 1) {
          emitAlignment2(
            i.originalRange.startLineNumber,
            i.modifiedRange.startLineNumber
          );
        }
        const originalModel = originalEditor.getModel();
        const maxColumn = i.originalRange.endLineNumber <= originalModel.getLineCount() ? originalModel.getLineMaxColumn(
          i.originalRange.endLineNumber
        ) : Number.MAX_SAFE_INTEGER;
        if (i.originalRange.endColumn < maxColumn) {
          emitAlignment2(
            i.originalRange.endLineNumber,
            i.modifiedRange.endLineNumber
          );
        }
      }
    }
    emitAlignment2(
      c.original.endLineNumberExclusive,
      c.modified.endLineNumberExclusive,
      true
    );
    lastOriginalLineNumber = c.original.endLineNumberExclusive;
    lastModifiedLineNumber = c.modified.endLineNumberExclusive;
  }
  handleAlignmentsOutsideOfDiffs(Number.MAX_VALUE, Number.MAX_VALUE);
  return result;
}
__name(computeRangeAlignment, "computeRangeAlignment");
function getAdditionalLineHeights(editor, viewZonesToIgnore) {
  const viewZoneHeights = [];
  const wrappingZoneHeights = [];
  const hasWrapping = editor.getOption(EditorOption.wrappingInfo).wrappingColumn !== -1;
  const coordinatesConverter = editor._getViewModel().coordinatesConverter;
  const editorLineHeight = editor.getOption(EditorOption.lineHeight);
  if (hasWrapping) {
    for (let i = 1; i <= editor.getModel().getLineCount(); i++) {
      const lineCount = coordinatesConverter.getModelLineViewLineCount(i);
      if (lineCount > 1) {
        wrappingZoneHeights.push({
          lineNumber: i,
          heightInPx: editorLineHeight * (lineCount - 1)
        });
      }
    }
  }
  for (const w of editor.getWhitespaces()) {
    if (viewZonesToIgnore.has(w.id)) {
      continue;
    }
    const modelLineNumber = w.afterLineNumber === 0 ? 0 : coordinatesConverter.convertViewPositionToModelPosition(
      new Position(w.afterLineNumber, 1)
    ).lineNumber;
    viewZoneHeights.push({
      lineNumber: modelLineNumber,
      heightInPx: w.height
    });
  }
  const result = joinCombine(
    viewZoneHeights,
    wrappingZoneHeights,
    (v) => v.lineNumber,
    (v1, v2) => ({
      lineNumber: v1.lineNumber,
      heightInPx: v1.heightInPx + v2.heightInPx
    })
  );
  return result;
}
__name(getAdditionalLineHeights, "getAdditionalLineHeights");
function allowsTrueInlineDiffRendering(mapping) {
  if (!mapping.innerChanges) {
    return false;
  }
  return mapping.innerChanges.every(
    (c) => rangeIsSingleLine(c.modifiedRange) && rangeIsSingleLine(c.originalRange) || c.originalRange.equalsRange(new Range(1, 1, 1, 1))
  );
}
__name(allowsTrueInlineDiffRendering, "allowsTrueInlineDiffRendering");
function rangeIsSingleLine(range) {
  return range.startLineNumber === range.endLineNumber;
}
__name(rangeIsSingleLine, "rangeIsSingleLine");
export {
  DiffEditorViewZones,
  allowsTrueInlineDiffRendering
};
//# sourceMappingURL=diffEditorViewZones.js.map
