import {
  EventType,
  addDisposableListener,
  h
} from "../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import {
  Disposable,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import {
  autorunWithStore,
  derived
} from "../../../../../base/common/observable.js";
import { localize } from "../../../../../nls.js";
import { LineRange, LineRangeSet } from "../../../../common/core/lineRange.js";
import { Range } from "../../../../common/core/range.js";
import {
  LineRangeMapping
} from "../../../../common/diff/rangeMapping.js";
import { GlyphMarginLane } from "../../../../common/model.js";
const emptyArr = [];
class RevertButtonsFeature extends Disposable {
  constructor(_editors, _diffModel, _options, _widget) {
    super();
    this._editors = _editors;
    this._diffModel = _diffModel;
    this._options = _options;
    this._widget = _widget;
    this._register(
      autorunWithStore((reader, store) => {
        if (!this._options.shouldRenderOldRevertArrows.read(reader)) {
          return;
        }
        const model = this._diffModel.read(reader);
        const diff = model?.diff.read(reader);
        if (!model || !diff) {
          return;
        }
        if (model.movedTextToCompare.read(reader)) {
          return;
        }
        const glyphWidgetsModified = [];
        const selectedDiffs = this._selectedDiffs.read(reader);
        const selectedDiffsSet = new Set(
          selectedDiffs.map((d) => d.mapping)
        );
        if (selectedDiffs.length > 0) {
          const selections = this._editors.modifiedSelections.read(reader);
          const btn = store.add(
            new RevertButton(
              selections[selections.length - 1].positionLineNumber,
              this._widget,
              selectedDiffs.flatMap((d) => d.rangeMappings),
              true
            )
          );
          this._editors.modified.addGlyphMarginWidget(btn);
          glyphWidgetsModified.push(btn);
        }
        for (const m of diff.mappings) {
          if (selectedDiffsSet.has(m)) {
            continue;
          }
          if (!m.lineRangeMapping.modified.isEmpty && m.lineRangeMapping.innerChanges) {
            const btn = store.add(
              new RevertButton(
                m.lineRangeMapping.modified.startLineNumber,
                this._widget,
                m.lineRangeMapping,
                false
              )
            );
            this._editors.modified.addGlyphMarginWidget(btn);
            glyphWidgetsModified.push(btn);
          }
        }
        store.add(
          toDisposable(() => {
            for (const w of glyphWidgetsModified) {
              this._editors.modified.removeGlyphMarginWidget(w);
            }
          })
        );
      })
    );
  }
  _selectedDiffs = derived(this, (reader) => {
    const model = this._diffModel.read(reader);
    const diff = model?.diff.read(reader);
    if (!diff) {
      return emptyArr;
    }
    const selections = this._editors.modifiedSelections.read(reader);
    if (selections.every((s) => s.isEmpty())) {
      return emptyArr;
    }
    const selectedLineNumbers = new LineRangeSet(
      selections.map((s) => LineRange.fromRangeInclusive(s))
    );
    const selectedMappings = diff.mappings.filter(
      (m) => m.lineRangeMapping.innerChanges && selectedLineNumbers.intersects(m.lineRangeMapping.modified)
    );
    const result = selectedMappings.map((mapping) => ({
      mapping,
      rangeMappings: mapping.lineRangeMapping.innerChanges.filter(
        (c) => selections.some(
          (s) => Range.areIntersecting(c.modifiedRange, s)
        )
      )
    }));
    if (result.length === 0 || result.every((r) => r.rangeMappings.length === 0)) {
      return emptyArr;
    }
    return result;
  });
}
class RevertButton extends Disposable {
  constructor(_lineNumber, _widget, _diffs, _revertSelection) {
    super();
    this._lineNumber = _lineNumber;
    this._widget = _widget;
    this._diffs = _diffs;
    this._revertSelection = _revertSelection;
    this._register(
      addDisposableListener(this._domNode, EventType.MOUSE_DOWN, (e) => {
        if (e.button !== 2) {
          e.stopPropagation();
          e.preventDefault();
        }
      })
    );
    this._register(
      addDisposableListener(this._domNode, EventType.MOUSE_UP, (e) => {
        e.stopPropagation();
        e.preventDefault();
      })
    );
    this._register(
      addDisposableListener(this._domNode, EventType.CLICK, (e) => {
        if (this._diffs instanceof LineRangeMapping) {
          this._widget.revert(this._diffs);
        } else {
          this._widget.revertRangeMappings(this._diffs);
        }
        e.stopPropagation();
        e.preventDefault();
      })
    );
  }
  static counter = 0;
  _id = `revertButton${RevertButton.counter++}`;
  getId() {
    return this._id;
  }
  _domNode = h(
    "div.revertButton",
    {
      title: this._revertSelection ? localize("revertSelectedChanges", "Revert Selected Changes") : localize("revertChange", "Revert Change")
    },
    [renderIcon(Codicon.arrowRight)]
  ).root;
  /**
   * Get the dom node of the glyph widget.
   */
  getDomNode() {
    return this._domNode;
  }
  /**
   * Get the placement of the glyph widget.
   */
  getPosition() {
    return {
      lane: GlyphMarginLane.Right,
      range: {
        startColumn: 1,
        startLineNumber: this._lineNumber,
        endColumn: 1,
        endLineNumber: this._lineNumber
      },
      zIndex: 10001
    };
  }
}
export {
  RevertButton,
  RevertButtonsFeature
};
