var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { h } from "../../../../../base/browser/dom.js";
import { ActionBar } from "../../../../../base/browser/ui/actionbar/actionbar.js";
import { Action } from "../../../../../base/common/actions.js";
import {
  booleanComparator,
  compareBy,
  numberComparator,
  tieBreakComparators
} from "../../../../../base/common/arrays.js";
import { findMaxIdx } from "../../../../../base/common/arraysFind.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import {
  Disposable,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunHandleChanges,
  autorunWithStore,
  constObservable,
  derived,
  derivedWithStore,
  observableFromEvent,
  observableSignalFromEvent,
  observableValue,
  recomputeInitiallyAndOnChange
} from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import {
  OffsetRange,
  OffsetRangeSet
} from "../../../../common/core/offsetRange.js";
import {
  PlaceholderViewZone,
  ViewZoneOverlayWidget,
  applyStyle,
  applyViewZones
} from "../utils.js";
class MovedBlocksLinesFeature extends Disposable {
  constructor(_rootElement, _diffModel, _originalEditorLayoutInfo, _modifiedEditorLayoutInfo, _editors) {
    super();
    this._rootElement = _rootElement;
    this._diffModel = _diffModel;
    this._originalEditorLayoutInfo = _originalEditorLayoutInfo;
    this._modifiedEditorLayoutInfo = _modifiedEditorLayoutInfo;
    this._editors = _editors;
    this._element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    this._element.setAttribute("class", "moved-blocks-lines");
    this._rootElement.appendChild(this._element);
    this._register(toDisposable(() => this._element.remove()));
    this._register(
      autorun((reader) => {
        const info = this._originalEditorLayoutInfo.read(reader);
        const info2 = this._modifiedEditorLayoutInfo.read(reader);
        if (!info || !info2) {
          return;
        }
        this._element.style.left = `${info.width - info.verticalScrollbarWidth}px`;
        this._element.style.height = `${info.height}px`;
        this._element.style.width = `${info.verticalScrollbarWidth + info.contentLeft - MovedBlocksLinesFeature.movedCodeBlockPadding + this.width.read(reader)}px`;
      })
    );
    this._register(recomputeInitiallyAndOnChange(this._state));
    const movedBlockViewZones = derived((reader) => {
      const model = this._diffModel.read(reader);
      const d = model?.diff.read(reader);
      if (!d) {
        return [];
      }
      return d.movedTexts.map((move) => ({
        move,
        original: new PlaceholderViewZone(
          constObservable(
            move.lineRangeMapping.original.startLineNumber - 1
          ),
          18
        ),
        modified: new PlaceholderViewZone(
          constObservable(
            move.lineRangeMapping.modified.startLineNumber - 1
          ),
          18
        )
      }));
    });
    this._register(
      applyViewZones(
        this._editors.original,
        movedBlockViewZones.map(
          (zones) => (
            /** @description movedBlockViewZones.original */
            zones.map(
              (z) => z.original
            )
          )
        )
      )
    );
    this._register(
      applyViewZones(
        this._editors.modified,
        movedBlockViewZones.map(
          (zones) => (
            /** @description movedBlockViewZones.modified */
            zones.map(
              (z) => z.modified
            )
          )
        )
      )
    );
    this._register(
      autorunWithStore((reader, store) => {
        const blocks = movedBlockViewZones.read(reader);
        for (const b of blocks) {
          store.add(
            new MovedBlockOverlayWidget(
              this._editors.original,
              b.original,
              b.move,
              "original",
              this._diffModel.get()
            )
          );
          store.add(
            new MovedBlockOverlayWidget(
              this._editors.modified,
              b.modified,
              b.move,
              "modified",
              this._diffModel.get()
            )
          );
        }
      })
    );
    const originalHasFocus = observableSignalFromEvent(
      "original.onDidFocusEditorWidget",
      (e) => this._editors.original.onDidFocusEditorWidget(
        () => setTimeout(() => e(void 0), 0)
      )
    );
    const modifiedHasFocus = observableSignalFromEvent(
      "modified.onDidFocusEditorWidget",
      (e) => this._editors.modified.onDidFocusEditorWidget(
        () => setTimeout(() => e(void 0), 0)
      )
    );
    let lastChangedEditor = "modified";
    this._register(
      autorunHandleChanges(
        {
          createEmptyChangeSummary: /* @__PURE__ */ __name(() => void 0, "createEmptyChangeSummary"),
          handleChange: /* @__PURE__ */ __name((ctx, summary) => {
            if (ctx.didChange(originalHasFocus)) {
              lastChangedEditor = "original";
            }
            if (ctx.didChange(modifiedHasFocus)) {
              lastChangedEditor = "modified";
            }
            return true;
          }, "handleChange")
        },
        (reader) => {
          originalHasFocus.read(reader);
          modifiedHasFocus.read(reader);
          const m = this._diffModel.read(reader);
          if (!m) {
            return;
          }
          const diff = m.diff.read(reader);
          let movedText;
          if (diff && lastChangedEditor === "original") {
            const originalPos = this._editors.originalCursor.read(reader);
            if (originalPos) {
              movedText = diff.movedTexts.find(
                (m2) => m2.lineRangeMapping.original.contains(
                  originalPos.lineNumber
                )
              );
            }
          }
          if (diff && lastChangedEditor === "modified") {
            const modifiedPos = this._editors.modifiedCursor.read(reader);
            if (modifiedPos) {
              movedText = diff.movedTexts.find(
                (m2) => m2.lineRangeMapping.modified.contains(
                  modifiedPos.lineNumber
                )
              );
            }
          }
          if (movedText !== m.movedTextToCompare.get()) {
            m.movedTextToCompare.set(void 0, void 0);
          }
          m.setActiveMovedText(movedText);
        }
      )
    );
  }
  static {
    __name(this, "MovedBlocksLinesFeature");
  }
  static movedCodeBlockPadding = 4;
  _element;
  _originalScrollTop = observableFromEvent(
    this,
    this._editors.original.onDidScrollChange,
    () => this._editors.original.getScrollTop()
  );
  _modifiedScrollTop = observableFromEvent(
    this,
    this._editors.modified.onDidScrollChange,
    () => this._editors.modified.getScrollTop()
  );
  _viewZonesChanged = observableSignalFromEvent(
    "onDidChangeViewZones",
    this._editors.modified.onDidChangeViewZones
  );
  width = observableValue(this, 0);
  _modifiedViewZonesChangedSignal = observableSignalFromEvent(
    "modified.onDidChangeViewZones",
    this._editors.modified.onDidChangeViewZones
  );
  _originalViewZonesChangedSignal = observableSignalFromEvent(
    "original.onDidChangeViewZones",
    this._editors.original.onDidChangeViewZones
  );
  _state = derivedWithStore(this, (reader, store) => {
    this._element.replaceChildren();
    const model = this._diffModel.read(reader);
    const moves = model?.diff.read(reader)?.movedTexts;
    if (!moves || moves.length === 0) {
      this.width.set(0, void 0);
      return;
    }
    this._viewZonesChanged.read(reader);
    const infoOrig = this._originalEditorLayoutInfo.read(reader);
    const infoMod = this._modifiedEditorLayoutInfo.read(reader);
    if (!infoOrig || !infoMod) {
      this.width.set(0, void 0);
      return;
    }
    this._modifiedViewZonesChangedSignal.read(reader);
    this._originalViewZonesChangedSignal.read(reader);
    const lines = moves.map((move) => {
      function computeLineStart(range, editor) {
        const t1 = editor.getTopForLineNumber(
          range.startLineNumber,
          true
        );
        const t2 = editor.getTopForLineNumber(
          range.endLineNumberExclusive,
          true
        );
        return (t1 + t2) / 2;
      }
      __name(computeLineStart, "computeLineStart");
      const start = computeLineStart(
        move.lineRangeMapping.original,
        this._editors.original
      );
      const startOffset = this._originalScrollTop.read(reader);
      const end = computeLineStart(
        move.lineRangeMapping.modified,
        this._editors.modified
      );
      const endOffset = this._modifiedScrollTop.read(reader);
      const from = start - startOffset;
      const to = end - endOffset;
      const top = Math.min(start, end);
      const bottom = Math.max(start, end);
      return {
        range: new OffsetRange(top, bottom),
        from,
        to,
        fromWithoutScroll: start,
        toWithoutScroll: end,
        move
      };
    });
    lines.sort(
      tieBreakComparators(
        compareBy(
          (l) => l.fromWithoutScroll > l.toWithoutScroll,
          booleanComparator
        ),
        compareBy(
          (l) => l.fromWithoutScroll > l.toWithoutScroll ? l.fromWithoutScroll : -l.toWithoutScroll,
          numberComparator
        )
      )
    );
    const layout = LinesLayout.compute(lines.map((l) => l.range));
    const padding = 10;
    const lineAreaLeft = infoOrig.verticalScrollbarWidth;
    const lineAreaWidth = (layout.getTrackCount() - 1) * 10 + padding * 2;
    const width = lineAreaLeft + lineAreaWidth + (infoMod.contentLeft - MovedBlocksLinesFeature.movedCodeBlockPadding);
    let idx = 0;
    for (const line of lines) {
      const track = layout.getTrack(idx);
      const verticalY = lineAreaLeft + padding + track * 10;
      const arrowHeight = 15;
      const arrowWidth = 15;
      const right = width;
      const rectWidth = infoMod.glyphMarginWidth + infoMod.lineNumbersWidth;
      const rectHeight = 18;
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.classList.add("arrow-rectangle");
      rect.setAttribute("x", `${right - rectWidth}`);
      rect.setAttribute("y", `${line.to - rectHeight / 2}`);
      rect.setAttribute("width", `${rectWidth}`);
      rect.setAttribute("height", `${rectHeight}`);
      this._element.appendChild(rect);
      const g = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute(
        "d",
        `M ${0} ${line.from} L ${verticalY} ${line.from} L ${verticalY} ${line.to} L ${right - arrowWidth} ${line.to}`
      );
      path.setAttribute("fill", "none");
      g.appendChild(path);
      const arrowRight = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
      );
      arrowRight.classList.add("arrow");
      store.add(
        autorun((reader2) => {
          path.classList.toggle(
            "currentMove",
            line.move === model.activeMovedText.read(reader2)
          );
          arrowRight.classList.toggle(
            "currentMove",
            line.move === model.activeMovedText.read(reader2)
          );
        })
      );
      arrowRight.setAttribute(
        "points",
        `${right - arrowWidth},${line.to - arrowHeight / 2} ${right},${line.to} ${right - arrowWidth},${line.to + arrowHeight / 2}`
      );
      g.appendChild(arrowRight);
      this._element.appendChild(g);
      idx++;
    }
    this.width.set(lineAreaWidth, void 0);
  });
}
class LinesLayout {
  constructor(_trackCount, trackPerLineIdx) {
    this._trackCount = _trackCount;
    this.trackPerLineIdx = trackPerLineIdx;
  }
  static {
    __name(this, "LinesLayout");
  }
  static compute(lines) {
    const setsPerTrack = [];
    const trackPerLineIdx = [];
    for (const line of lines) {
      let trackIdx = setsPerTrack.findIndex(
        (set) => !set.intersectsStrict(line)
      );
      if (trackIdx === -1) {
        const maxTrackCount = 6;
        if (setsPerTrack.length >= maxTrackCount) {
          trackIdx = findMaxIdx(
            setsPerTrack,
            compareBy(
              (set) => set.intersectWithRangeLength(line),
              numberComparator
            )
          );
        } else {
          trackIdx = setsPerTrack.length;
          setsPerTrack.push(new OffsetRangeSet());
        }
      }
      setsPerTrack[trackIdx].addRange(line);
      trackPerLineIdx.push(trackIdx);
    }
    return new LinesLayout(setsPerTrack.length, trackPerLineIdx);
  }
  getTrack(lineIdx) {
    return this.trackPerLineIdx[lineIdx];
  }
  getTrackCount() {
    return this._trackCount;
  }
}
class MovedBlockOverlayWidget extends ViewZoneOverlayWidget {
  constructor(_editor, _viewZone, _move, _kind, _diffModel) {
    const root = h("div.diff-hidden-lines-widget");
    super(_editor, _viewZone, root.root);
    this._editor = _editor;
    this._move = _move;
    this._kind = _kind;
    this._diffModel = _diffModel;
    root.root.appendChild(this._nodes.root);
    const editorLayout = observableFromEvent(
      this._editor.onDidLayoutChange,
      () => this._editor.getLayoutInfo()
    );
    this._register(
      applyStyle(this._nodes.root, {
        paddingRight: editorLayout.map((l) => l.verticalScrollbarWidth)
      })
    );
    let text;
    if (_move.changes.length > 0) {
      text = this._kind === "original" ? localize(
        "codeMovedToWithChanges",
        "Code moved with changes to line {0}-{1}",
        this._move.lineRangeMapping.modified.startLineNumber,
        this._move.lineRangeMapping.modified.endLineNumberExclusive - 1
      ) : localize(
        "codeMovedFromWithChanges",
        "Code moved with changes from line {0}-{1}",
        this._move.lineRangeMapping.original.startLineNumber,
        this._move.lineRangeMapping.original.endLineNumberExclusive - 1
      );
    } else {
      text = this._kind === "original" ? localize(
        "codeMovedTo",
        "Code moved to line {0}-{1}",
        this._move.lineRangeMapping.modified.startLineNumber,
        this._move.lineRangeMapping.modified.endLineNumberExclusive - 1
      ) : localize(
        "codeMovedFrom",
        "Code moved from line {0}-{1}",
        this._move.lineRangeMapping.original.startLineNumber,
        this._move.lineRangeMapping.original.endLineNumberExclusive - 1
      );
    }
    const actionBar = this._register(
      new ActionBar(this._nodes.actionBar, {
        highlightToggledItems: true
      })
    );
    const caption = new Action("", text, "", false);
    actionBar.push(caption, { icon: false, label: true });
    const actionCompare = new Action(
      "",
      "Compare",
      ThemeIcon.asClassName(Codicon.compareChanges),
      true,
      () => {
        this._editor.focus();
        this._diffModel.movedTextToCompare.set(
          this._diffModel.movedTextToCompare.get() === _move ? void 0 : this._move,
          void 0
        );
      }
    );
    this._register(
      autorun((reader) => {
        const isActive = this._diffModel.movedTextToCompare.read(reader) === _move;
        actionCompare.checked = isActive;
      })
    );
    actionBar.push(actionCompare, { icon: false, label: true });
  }
  static {
    __name(this, "MovedBlockOverlayWidget");
  }
  _nodes = h(
    "div.diff-moved-code-block",
    { style: { marginRight: "4px" } },
    [h("div.text-content@textContent"), h("div.action-bar@actionBar")]
  );
}
export {
  MovedBlocksLinesFeature
};
//# sourceMappingURL=movedBlocksLinesFeature.js.map
