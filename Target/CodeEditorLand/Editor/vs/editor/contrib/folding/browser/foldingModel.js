var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { hash } from "../../../../base/common/hash.js";
import {
  FoldSource,
  FoldingRegions
} from "./foldingRanges.js";
class FoldingModel {
  static {
    __name(this, "FoldingModel");
  }
  _textModel;
  _decorationProvider;
  _regions;
  _editorDecorationIds;
  _updateEventEmitter = new Emitter();
  onDidChange = this._updateEventEmitter.event;
  get regions() {
    return this._regions;
  }
  get textModel() {
    return this._textModel;
  }
  get decorationProvider() {
    return this._decorationProvider;
  }
  constructor(textModel, decorationProvider) {
    this._textModel = textModel;
    this._decorationProvider = decorationProvider;
    this._regions = new FoldingRegions(
      new Uint32Array(0),
      new Uint32Array(0)
    );
    this._editorDecorationIds = [];
  }
  toggleCollapseState(toggledRegions) {
    if (!toggledRegions.length) {
      return;
    }
    toggledRegions = toggledRegions.sort(
      (r1, r2) => r1.regionIndex - r2.regionIndex
    );
    const processed = {};
    this._decorationProvider.changeDecorations((accessor) => {
      let k = 0;
      let dirtyRegionEndLine = -1;
      let lastHiddenLine = -1;
      const updateDecorationsUntil = /* @__PURE__ */ __name((index) => {
        while (k < index) {
          const endLineNumber = this._regions.getEndLineNumber(k);
          const isCollapsed = this._regions.isCollapsed(k);
          if (endLineNumber <= dirtyRegionEndLine) {
            const isManual = this.regions.getSource(k) !== FoldSource.provider;
            accessor.changeDecorationOptions(
              this._editorDecorationIds[k],
              this._decorationProvider.getDecorationOption(
                isCollapsed,
                endLineNumber <= lastHiddenLine,
                isManual
              )
            );
          }
          if (isCollapsed && endLineNumber > lastHiddenLine) {
            lastHiddenLine = endLineNumber;
          }
          k++;
        }
      }, "updateDecorationsUntil");
      for (const region of toggledRegions) {
        const index = region.regionIndex;
        const editorDecorationId = this._editorDecorationIds[index];
        if (editorDecorationId && !processed[editorDecorationId]) {
          processed[editorDecorationId] = true;
          updateDecorationsUntil(index);
          const newCollapseState = !this._regions.isCollapsed(index);
          this._regions.setCollapsed(index, newCollapseState);
          dirtyRegionEndLine = Math.max(
            dirtyRegionEndLine,
            this._regions.getEndLineNumber(index)
          );
        }
      }
      updateDecorationsUntil(this._regions.length);
    });
    this._updateEventEmitter.fire({
      model: this,
      collapseStateChanged: toggledRegions
    });
  }
  removeManualRanges(ranges) {
    const newFoldingRanges = new Array();
    const intersects = /* @__PURE__ */ __name((foldRange) => {
      for (const range of ranges) {
        if (!(range.startLineNumber > foldRange.endLineNumber || foldRange.startLineNumber > range.endLineNumber)) {
          return true;
        }
      }
      return false;
    }, "intersects");
    for (let i = 0; i < this._regions.length; i++) {
      const foldRange = this._regions.toFoldRange(i);
      if (foldRange.source === FoldSource.provider || !intersects(foldRange)) {
        newFoldingRanges.push(foldRange);
      }
    }
    this.updatePost(FoldingRegions.fromFoldRanges(newFoldingRanges));
  }
  update(newRegions, selection) {
    const foldedOrManualRanges = this._currentFoldedOrManualRanges(selection);
    const newRanges = FoldingRegions.sanitizeAndMerge(
      newRegions,
      foldedOrManualRanges,
      this._textModel.getLineCount(),
      selection
    );
    this.updatePost(FoldingRegions.fromFoldRanges(newRanges));
  }
  updatePost(newRegions) {
    const newEditorDecorations = [];
    let lastHiddenLine = -1;
    for (let index = 0, limit = newRegions.length; index < limit; index++) {
      const startLineNumber = newRegions.getStartLineNumber(index);
      const endLineNumber = newRegions.getEndLineNumber(index);
      const isCollapsed = newRegions.isCollapsed(index);
      const isManual = newRegions.getSource(index) !== FoldSource.provider;
      const decorationRange = {
        startLineNumber,
        startColumn: this._textModel.getLineMaxColumn(startLineNumber),
        endLineNumber,
        endColumn: this._textModel.getLineMaxColumn(endLineNumber) + 1
      };
      newEditorDecorations.push({
        range: decorationRange,
        options: this._decorationProvider.getDecorationOption(
          isCollapsed,
          endLineNumber <= lastHiddenLine,
          isManual
        )
      });
      if (isCollapsed && endLineNumber > lastHiddenLine) {
        lastHiddenLine = endLineNumber;
      }
    }
    this._decorationProvider.changeDecorations(
      (accessor) => this._editorDecorationIds = accessor.deltaDecorations(
        this._editorDecorationIds,
        newEditorDecorations
      )
    );
    this._regions = newRegions;
    this._updateEventEmitter.fire({ model: this });
  }
  _currentFoldedOrManualRanges(selection) {
    const foldedRanges = [];
    for (let i = 0, limit = this._regions.length; i < limit; i++) {
      let isCollapsed = this.regions.isCollapsed(i);
      const source = this.regions.getSource(i);
      if (isCollapsed || source !== FoldSource.provider) {
        const foldRange = this._regions.toFoldRange(i);
        const decRange = this._textModel.getDecorationRange(
          this._editorDecorationIds[i]
        );
        if (decRange) {
          if (isCollapsed && selection?.startsInside(
            decRange.startLineNumber + 1,
            decRange.endLineNumber
          )) {
            isCollapsed = false;
          }
          foldedRanges.push({
            startLineNumber: decRange.startLineNumber,
            endLineNumber: decRange.endLineNumber,
            type: foldRange.type,
            isCollapsed,
            source
          });
        }
      }
    }
    return foldedRanges;
  }
  /**
   * Collapse state memento, for persistence only
   */
  getMemento() {
    const foldedOrManualRanges = this._currentFoldedOrManualRanges();
    const result = [];
    const maxLineNumber = this._textModel.getLineCount();
    for (let i = 0, limit = foldedOrManualRanges.length; i < limit; i++) {
      const range = foldedOrManualRanges[i];
      if (range.startLineNumber >= range.endLineNumber || range.startLineNumber < 1 || range.endLineNumber > maxLineNumber) {
        continue;
      }
      const checksum = this._getLinesChecksum(
        range.startLineNumber + 1,
        range.endLineNumber
      );
      result.push({
        startLineNumber: range.startLineNumber,
        endLineNumber: range.endLineNumber,
        isCollapsed: range.isCollapsed,
        source: range.source,
        checksum
      });
    }
    return result.length > 0 ? result : void 0;
  }
  /**
   * Apply persisted state, for persistence only
   */
  applyMemento(state) {
    if (!Array.isArray(state)) {
      return;
    }
    const rangesToRestore = [];
    const maxLineNumber = this._textModel.getLineCount();
    for (const range of state) {
      if (range.startLineNumber >= range.endLineNumber || range.startLineNumber < 1 || range.endLineNumber > maxLineNumber) {
        continue;
      }
      const checksum = this._getLinesChecksum(
        range.startLineNumber + 1,
        range.endLineNumber
      );
      if (!range.checksum || checksum === range.checksum) {
        rangesToRestore.push({
          startLineNumber: range.startLineNumber,
          endLineNumber: range.endLineNumber,
          type: void 0,
          isCollapsed: range.isCollapsed ?? true,
          source: range.source ?? FoldSource.provider
        });
      }
    }
    const newRanges = FoldingRegions.sanitizeAndMerge(
      this._regions,
      rangesToRestore,
      maxLineNumber
    );
    this.updatePost(FoldingRegions.fromFoldRanges(newRanges));
  }
  _getLinesChecksum(lineNumber1, lineNumber2) {
    const h = hash(
      this._textModel.getLineContent(lineNumber1) + this._textModel.getLineContent(lineNumber2)
    );
    return h % 1e6;
  }
  dispose() {
    this._decorationProvider.removeDecorations(this._editorDecorationIds);
  }
  getAllRegionsAtLine(lineNumber, filter) {
    const result = [];
    if (this._regions) {
      let index = this._regions.findRange(lineNumber);
      let level = 1;
      while (index >= 0) {
        const current = this._regions.toRegion(index);
        if (!filter || filter(current, level)) {
          result.push(current);
        }
        level++;
        index = current.parentIndex;
      }
    }
    return result;
  }
  getRegionAtLine(lineNumber) {
    if (this._regions) {
      const index = this._regions.findRange(lineNumber);
      if (index >= 0) {
        return this._regions.toRegion(index);
      }
    }
    return null;
  }
  getRegionsInside(region, filter) {
    const result = [];
    const index = region ? region.regionIndex + 1 : 0;
    const endLineNumber = region ? region.endLineNumber : Number.MAX_VALUE;
    if (filter && filter.length === 2) {
      const levelStack = [];
      for (let i = index, len = this._regions.length; i < len; i++) {
        const current = this._regions.toRegion(i);
        if (this._regions.getStartLineNumber(i) < endLineNumber) {
          while (levelStack.length > 0 && !current.containedBy(levelStack[levelStack.length - 1])) {
            levelStack.pop();
          }
          levelStack.push(current);
          if (filter(current, levelStack.length)) {
            result.push(current);
          }
        } else {
          break;
        }
      }
    } else {
      for (let i = index, len = this._regions.length; i < len; i++) {
        const current = this._regions.toRegion(i);
        if (this._regions.getStartLineNumber(i) < endLineNumber) {
          if (!filter || filter(current)) {
            result.push(current);
          }
        } else {
          break;
        }
      }
    }
    return result;
  }
}
function toggleCollapseState(foldingModel, levels, lineNumbers) {
  const toToggle = [];
  for (const lineNumber of lineNumbers) {
    const region = foldingModel.getRegionAtLine(lineNumber);
    if (region) {
      const doCollapse = !region.isCollapsed;
      toToggle.push(region);
      if (levels > 1) {
        const regionsInside = foldingModel.getRegionsInside(
          region,
          (r, level) => r.isCollapsed !== doCollapse && level < levels
        );
        toToggle.push(...regionsInside);
      }
    }
  }
  foldingModel.toggleCollapseState(toToggle);
}
__name(toggleCollapseState, "toggleCollapseState");
function setCollapseStateLevelsDown(foldingModel, doCollapse, levels = Number.MAX_VALUE, lineNumbers) {
  const toToggle = [];
  if (lineNumbers && lineNumbers.length > 0) {
    for (const lineNumber of lineNumbers) {
      const region = foldingModel.getRegionAtLine(lineNumber);
      if (region) {
        if (region.isCollapsed !== doCollapse) {
          toToggle.push(region);
        }
        if (levels > 1) {
          const regionsInside = foldingModel.getRegionsInside(
            region,
            (r, level) => r.isCollapsed !== doCollapse && level < levels
          );
          toToggle.push(...regionsInside);
        }
      }
    }
  } else {
    const regionsInside = foldingModel.getRegionsInside(
      null,
      (r, level) => r.isCollapsed !== doCollapse && level < levels
    );
    toToggle.push(...regionsInside);
  }
  foldingModel.toggleCollapseState(toToggle);
}
__name(setCollapseStateLevelsDown, "setCollapseStateLevelsDown");
function setCollapseStateLevelsUp(foldingModel, doCollapse, levels, lineNumbers) {
  const toToggle = [];
  for (const lineNumber of lineNumbers) {
    const regions = foldingModel.getAllRegionsAtLine(
      lineNumber,
      (region, level) => region.isCollapsed !== doCollapse && level <= levels
    );
    toToggle.push(...regions);
  }
  foldingModel.toggleCollapseState(toToggle);
}
__name(setCollapseStateLevelsUp, "setCollapseStateLevelsUp");
function setCollapseStateUp(foldingModel, doCollapse, lineNumbers) {
  const toToggle = [];
  for (const lineNumber of lineNumbers) {
    const regions = foldingModel.getAllRegionsAtLine(
      lineNumber,
      (region) => region.isCollapsed !== doCollapse
    );
    if (regions.length > 0) {
      toToggle.push(regions[0]);
    }
  }
  foldingModel.toggleCollapseState(toToggle);
}
__name(setCollapseStateUp, "setCollapseStateUp");
function setCollapseStateAtLevel(foldingModel, foldLevel, doCollapse, blockedLineNumbers) {
  const filter = /* @__PURE__ */ __name((region, level) => level === foldLevel && region.isCollapsed !== doCollapse && !blockedLineNumbers.some((line) => region.containsLine(line)), "filter");
  const toToggle = foldingModel.getRegionsInside(null, filter);
  foldingModel.toggleCollapseState(toToggle);
}
__name(setCollapseStateAtLevel, "setCollapseStateAtLevel");
function setCollapseStateForRest(foldingModel, doCollapse, blockedLineNumbers) {
  const filteredRegions = [];
  for (const lineNumber of blockedLineNumbers) {
    const regions = foldingModel.getAllRegionsAtLine(lineNumber, void 0);
    if (regions.length > 0) {
      filteredRegions.push(regions[0]);
    }
  }
  const filter = /* @__PURE__ */ __name((region) => filteredRegions.every(
    (filteredRegion) => !filteredRegion.containedBy(region) && !region.containedBy(filteredRegion)
  ) && region.isCollapsed !== doCollapse, "filter");
  const toToggle = foldingModel.getRegionsInside(null, filter);
  foldingModel.toggleCollapseState(toToggle);
}
__name(setCollapseStateForRest, "setCollapseStateForRest");
function setCollapseStateForMatchingLines(foldingModel, regExp, doCollapse) {
  const editorModel = foldingModel.textModel;
  const regions = foldingModel.regions;
  const toToggle = [];
  for (let i = regions.length - 1; i >= 0; i--) {
    if (doCollapse !== regions.isCollapsed(i)) {
      const startLineNumber = regions.getStartLineNumber(i);
      if (regExp.test(editorModel.getLineContent(startLineNumber))) {
        toToggle.push(regions.toRegion(i));
      }
    }
  }
  foldingModel.toggleCollapseState(toToggle);
}
__name(setCollapseStateForMatchingLines, "setCollapseStateForMatchingLines");
function setCollapseStateForType(foldingModel, type, doCollapse) {
  const regions = foldingModel.regions;
  const toToggle = [];
  for (let i = regions.length - 1; i >= 0; i--) {
    if (doCollapse !== regions.isCollapsed(i) && type === regions.getType(i)) {
      toToggle.push(regions.toRegion(i));
    }
  }
  foldingModel.toggleCollapseState(toToggle);
}
__name(setCollapseStateForType, "setCollapseStateForType");
function getParentFoldLine(lineNumber, foldingModel) {
  let startLineNumber = null;
  const foldingRegion = foldingModel.getRegionAtLine(lineNumber);
  if (foldingRegion !== null) {
    startLineNumber = foldingRegion.startLineNumber;
    if (lineNumber === startLineNumber) {
      const parentFoldingIdx = foldingRegion.parentIndex;
      if (parentFoldingIdx !== -1) {
        startLineNumber = foldingModel.regions.getStartLineNumber(parentFoldingIdx);
      } else {
        startLineNumber = null;
      }
    }
  }
  return startLineNumber;
}
__name(getParentFoldLine, "getParentFoldLine");
function getPreviousFoldLine(lineNumber, foldingModel) {
  let foldingRegion = foldingModel.getRegionAtLine(lineNumber);
  if (foldingRegion !== null && foldingRegion.startLineNumber === lineNumber) {
    if (lineNumber !== foldingRegion.startLineNumber) {
      return foldingRegion.startLineNumber;
    } else {
      const expectedParentIndex = foldingRegion.parentIndex;
      let minLineNumber = 0;
      if (expectedParentIndex !== -1) {
        minLineNumber = foldingModel.regions.getStartLineNumber(
          foldingRegion.parentIndex
        );
      }
      while (foldingRegion !== null) {
        if (foldingRegion.regionIndex > 0) {
          foldingRegion = foldingModel.regions.toRegion(
            foldingRegion.regionIndex - 1
          );
          if (foldingRegion.startLineNumber <= minLineNumber) {
            return null;
          } else if (foldingRegion.parentIndex === expectedParentIndex) {
            return foldingRegion.startLineNumber;
          }
        } else {
          return null;
        }
      }
    }
  } else {
    if (foldingModel.regions.length > 0) {
      foldingRegion = foldingModel.regions.toRegion(
        foldingModel.regions.length - 1
      );
      while (foldingRegion !== null) {
        if (foldingRegion.startLineNumber < lineNumber) {
          return foldingRegion.startLineNumber;
        }
        if (foldingRegion.regionIndex > 0) {
          foldingRegion = foldingModel.regions.toRegion(
            foldingRegion.regionIndex - 1
          );
        } else {
          foldingRegion = null;
        }
      }
    }
  }
  return null;
}
__name(getPreviousFoldLine, "getPreviousFoldLine");
function getNextFoldLine(lineNumber, foldingModel) {
  let foldingRegion = foldingModel.getRegionAtLine(lineNumber);
  if (foldingRegion !== null && foldingRegion.startLineNumber === lineNumber) {
    const expectedParentIndex = foldingRegion.parentIndex;
    let maxLineNumber = 0;
    if (expectedParentIndex !== -1) {
      maxLineNumber = foldingModel.regions.getEndLineNumber(
        foldingRegion.parentIndex
      );
    } else if (foldingModel.regions.length === 0) {
      return null;
    } else {
      maxLineNumber = foldingModel.regions.getEndLineNumber(
        foldingModel.regions.length - 1
      );
    }
    while (foldingRegion !== null) {
      if (foldingRegion.regionIndex < foldingModel.regions.length) {
        foldingRegion = foldingModel.regions.toRegion(
          foldingRegion.regionIndex + 1
        );
        if (foldingRegion.startLineNumber >= maxLineNumber) {
          return null;
        } else if (foldingRegion.parentIndex === expectedParentIndex) {
          return foldingRegion.startLineNumber;
        }
      } else {
        return null;
      }
    }
  } else {
    if (foldingModel.regions.length > 0) {
      foldingRegion = foldingModel.regions.toRegion(0);
      while (foldingRegion !== null) {
        if (foldingRegion.startLineNumber > lineNumber) {
          return foldingRegion.startLineNumber;
        }
        if (foldingRegion.regionIndex < foldingModel.regions.length) {
          foldingRegion = foldingModel.regions.toRegion(
            foldingRegion.regionIndex + 1
          );
        } else {
          foldingRegion = null;
        }
      }
    }
  }
  return null;
}
__name(getNextFoldLine, "getNextFoldLine");
export {
  FoldingModel,
  getNextFoldLine,
  getParentFoldLine,
  getPreviousFoldLine,
  setCollapseStateAtLevel,
  setCollapseStateForMatchingLines,
  setCollapseStateForRest,
  setCollapseStateForType,
  setCollapseStateLevelsDown,
  setCollapseStateLevelsUp,
  setCollapseStateUp,
  toggleCollapseState
};
//# sourceMappingURL=foldingModel.js.map
