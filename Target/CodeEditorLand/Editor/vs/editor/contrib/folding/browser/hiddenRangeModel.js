var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findFirstIdxMonotonousOrArrLen } from "../../../../base/common/arraysFind.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IRange, Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { IModelContentChangedEvent } from "../../../common/textModelEvents.js";
import { countEOL } from "../../../common/core/eolCounter.js";
import { FoldingModel } from "./foldingModel.js";
class HiddenRangeModel {
  static {
    __name(this, "HiddenRangeModel");
  }
  _foldingModel;
  _hiddenRanges;
  _foldingModelListener;
  _updateEventEmitter = new Emitter();
  _hasLineChanges = false;
  get onDidChange() {
    return this._updateEventEmitter.event;
  }
  get hiddenRanges() {
    return this._hiddenRanges;
  }
  constructor(model) {
    this._foldingModel = model;
    this._foldingModelListener = model.onDidChange((_) => this.updateHiddenRanges());
    this._hiddenRanges = [];
    if (model.regions.length) {
      this.updateHiddenRanges();
    }
  }
  notifyChangeModelContent(e) {
    if (this._hiddenRanges.length && !this._hasLineChanges) {
      this._hasLineChanges = e.changes.some((change) => {
        return change.range.endLineNumber !== change.range.startLineNumber || countEOL(change.text)[0] !== 0;
      });
    }
  }
  updateHiddenRanges() {
    let updateHiddenAreas = false;
    const newHiddenAreas = [];
    let i = 0;
    let k = 0;
    let lastCollapsedStart = Number.MAX_VALUE;
    let lastCollapsedEnd = -1;
    const ranges = this._foldingModel.regions;
    for (; i < ranges.length; i++) {
      if (!ranges.isCollapsed(i)) {
        continue;
      }
      const startLineNumber = ranges.getStartLineNumber(i) + 1;
      const endLineNumber = ranges.getEndLineNumber(i);
      if (lastCollapsedStart <= startLineNumber && endLineNumber <= lastCollapsedEnd) {
        continue;
      }
      if (!updateHiddenAreas && k < this._hiddenRanges.length && this._hiddenRanges[k].startLineNumber === startLineNumber && this._hiddenRanges[k].endLineNumber === endLineNumber) {
        newHiddenAreas.push(this._hiddenRanges[k]);
        k++;
      } else {
        updateHiddenAreas = true;
        newHiddenAreas.push(new Range(startLineNumber, 1, endLineNumber, 1));
      }
      lastCollapsedStart = startLineNumber;
      lastCollapsedEnd = endLineNumber;
    }
    if (this._hasLineChanges || updateHiddenAreas || k < this._hiddenRanges.length) {
      this.applyHiddenRanges(newHiddenAreas);
    }
  }
  applyHiddenRanges(newHiddenAreas) {
    this._hiddenRanges = newHiddenAreas;
    this._hasLineChanges = false;
    this._updateEventEmitter.fire(newHiddenAreas);
  }
  hasRanges() {
    return this._hiddenRanges.length > 0;
  }
  isHidden(line) {
    return findRange(this._hiddenRanges, line) !== null;
  }
  adjustSelections(selections) {
    let hasChanges = false;
    const editorModel = this._foldingModel.textModel;
    let lastRange = null;
    const adjustLine = /* @__PURE__ */ __name((line) => {
      if (!lastRange || !isInside(line, lastRange)) {
        lastRange = findRange(this._hiddenRanges, line);
      }
      if (lastRange) {
        return lastRange.startLineNumber - 1;
      }
      return null;
    }, "adjustLine");
    for (let i = 0, len = selections.length; i < len; i++) {
      let selection = selections[i];
      const adjustedStartLine = adjustLine(selection.startLineNumber);
      if (adjustedStartLine) {
        selection = selection.setStartPosition(adjustedStartLine, editorModel.getLineMaxColumn(adjustedStartLine));
        hasChanges = true;
      }
      const adjustedEndLine = adjustLine(selection.endLineNumber);
      if (adjustedEndLine) {
        selection = selection.setEndPosition(adjustedEndLine, editorModel.getLineMaxColumn(adjustedEndLine));
        hasChanges = true;
      }
      selections[i] = selection;
    }
    return hasChanges;
  }
  dispose() {
    if (this.hiddenRanges.length > 0) {
      this._hiddenRanges = [];
      this._updateEventEmitter.fire(this._hiddenRanges);
    }
    if (this._foldingModelListener) {
      this._foldingModelListener.dispose();
      this._foldingModelListener = null;
    }
  }
}
function isInside(line, range) {
  return line >= range.startLineNumber && line <= range.endLineNumber;
}
__name(isInside, "isInside");
function findRange(ranges, line) {
  const i = findFirstIdxMonotonousOrArrLen(ranges, (r) => line < r.startLineNumber) - 1;
  if (i >= 0 && ranges[i].endLineNumber >= line) {
    return ranges[i];
  }
  return null;
}
__name(findRange, "findRange");
export {
  HiddenRangeModel
};
//# sourceMappingURL=hiddenRangeModel.js.map
