var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findLast } from "../../../base/common/arraysFind.js";
import * as strings from "../../../base/common/strings.js";
import { CursorColumns } from "../core/cursorColumns.js";
import { IPosition, Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { TextModelPart } from "./textModelPart.js";
import { computeIndentLevel } from "./utils.js";
import { ILanguageConfigurationService, ResolvedLanguageConfiguration } from "../languages/languageConfigurationRegistry.js";
import { BracketGuideOptions, HorizontalGuidesState, IActiveIndentGuideInfo, IGuidesTextModelPart, IndentGuide, IndentGuideHorizontalLine } from "../textModelGuides.js";
import { BugIndicatingError } from "../../../base/common/errors.js";
class GuidesTextModelPart extends TextModelPart {
  constructor(textModel, languageConfigurationService) {
    super();
    this.textModel = textModel;
    this.languageConfigurationService = languageConfigurationService;
  }
  static {
    __name(this, "GuidesTextModelPart");
  }
  getLanguageConfiguration(languageId) {
    return this.languageConfigurationService.getLanguageConfiguration(
      languageId
    );
  }
  _computeIndentLevel(lineIndex) {
    return computeIndentLevel(
      this.textModel.getLineContent(lineIndex + 1),
      this.textModel.getOptions().tabSize
    );
  }
  getActiveIndentGuide(lineNumber, minLineNumber, maxLineNumber) {
    this.assertNotDisposed();
    const lineCount = this.textModel.getLineCount();
    if (lineNumber < 1 || lineNumber > lineCount) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
    const foldingRules = this.getLanguageConfiguration(
      this.textModel.getLanguageId()
    ).foldingRules;
    const offSide = Boolean(foldingRules && foldingRules.offSide);
    let up_aboveContentLineIndex = -2;
    let up_aboveContentLineIndent = -1;
    let up_belowContentLineIndex = -2;
    let up_belowContentLineIndent = -1;
    const up_resolveIndents = /* @__PURE__ */ __name((lineNumber2) => {
      if (up_aboveContentLineIndex !== -1 && (up_aboveContentLineIndex === -2 || up_aboveContentLineIndex > lineNumber2 - 1)) {
        up_aboveContentLineIndex = -1;
        up_aboveContentLineIndent = -1;
        for (let lineIndex = lineNumber2 - 2; lineIndex >= 0; lineIndex--) {
          const indent2 = this._computeIndentLevel(lineIndex);
          if (indent2 >= 0) {
            up_aboveContentLineIndex = lineIndex;
            up_aboveContentLineIndent = indent2;
            break;
          }
        }
      }
      if (up_belowContentLineIndex === -2) {
        up_belowContentLineIndex = -1;
        up_belowContentLineIndent = -1;
        for (let lineIndex = lineNumber2; lineIndex < lineCount; lineIndex++) {
          const indent2 = this._computeIndentLevel(lineIndex);
          if (indent2 >= 0) {
            up_belowContentLineIndex = lineIndex;
            up_belowContentLineIndent = indent2;
            break;
          }
        }
      }
    }, "up_resolveIndents");
    let down_aboveContentLineIndex = -2;
    let down_aboveContentLineIndent = -1;
    let down_belowContentLineIndex = -2;
    let down_belowContentLineIndent = -1;
    const down_resolveIndents = /* @__PURE__ */ __name((lineNumber2) => {
      if (down_aboveContentLineIndex === -2) {
        down_aboveContentLineIndex = -1;
        down_aboveContentLineIndent = -1;
        for (let lineIndex = lineNumber2 - 2; lineIndex >= 0; lineIndex--) {
          const indent2 = this._computeIndentLevel(lineIndex);
          if (indent2 >= 0) {
            down_aboveContentLineIndex = lineIndex;
            down_aboveContentLineIndent = indent2;
            break;
          }
        }
      }
      if (down_belowContentLineIndex !== -1 && (down_belowContentLineIndex === -2 || down_belowContentLineIndex < lineNumber2 - 1)) {
        down_belowContentLineIndex = -1;
        down_belowContentLineIndent = -1;
        for (let lineIndex = lineNumber2; lineIndex < lineCount; lineIndex++) {
          const indent2 = this._computeIndentLevel(lineIndex);
          if (indent2 >= 0) {
            down_belowContentLineIndex = lineIndex;
            down_belowContentLineIndent = indent2;
            break;
          }
        }
      }
    }, "down_resolveIndents");
    let startLineNumber = 0;
    let goUp = true;
    let endLineNumber = 0;
    let goDown = true;
    let indent = 0;
    let initialIndent = 0;
    for (let distance = 0; goUp || goDown; distance++) {
      const upLineNumber = lineNumber - distance;
      const downLineNumber = lineNumber + distance;
      if (distance > 1 && (upLineNumber < 1 || upLineNumber < minLineNumber)) {
        goUp = false;
      }
      if (distance > 1 && (downLineNumber > lineCount || downLineNumber > maxLineNumber)) {
        goDown = false;
      }
      if (distance > 5e4) {
        goUp = false;
        goDown = false;
      }
      let upLineIndentLevel = -1;
      if (goUp && upLineNumber >= 1) {
        const currentIndent = this._computeIndentLevel(upLineNumber - 1);
        if (currentIndent >= 0) {
          up_belowContentLineIndex = upLineNumber - 1;
          up_belowContentLineIndent = currentIndent;
          upLineIndentLevel = Math.ceil(
            currentIndent / this.textModel.getOptions().indentSize
          );
        } else {
          up_resolveIndents(upLineNumber);
          upLineIndentLevel = this._getIndentLevelForWhitespaceLine(
            offSide,
            up_aboveContentLineIndent,
            up_belowContentLineIndent
          );
        }
      }
      let downLineIndentLevel = -1;
      if (goDown && downLineNumber <= lineCount) {
        const currentIndent = this._computeIndentLevel(downLineNumber - 1);
        if (currentIndent >= 0) {
          down_aboveContentLineIndex = downLineNumber - 1;
          down_aboveContentLineIndent = currentIndent;
          downLineIndentLevel = Math.ceil(
            currentIndent / this.textModel.getOptions().indentSize
          );
        } else {
          down_resolveIndents(downLineNumber);
          downLineIndentLevel = this._getIndentLevelForWhitespaceLine(
            offSide,
            down_aboveContentLineIndent,
            down_belowContentLineIndent
          );
        }
      }
      if (distance === 0) {
        initialIndent = upLineIndentLevel;
        continue;
      }
      if (distance === 1) {
        if (downLineNumber <= lineCount && downLineIndentLevel >= 0 && initialIndent + 1 === downLineIndentLevel) {
          goUp = false;
          startLineNumber = downLineNumber;
          endLineNumber = downLineNumber;
          indent = downLineIndentLevel;
          continue;
        }
        if (upLineNumber >= 1 && upLineIndentLevel >= 0 && upLineIndentLevel - 1 === initialIndent) {
          goDown = false;
          startLineNumber = upLineNumber;
          endLineNumber = upLineNumber;
          indent = upLineIndentLevel;
          continue;
        }
        startLineNumber = lineNumber;
        endLineNumber = lineNumber;
        indent = initialIndent;
        if (indent === 0) {
          return { startLineNumber, endLineNumber, indent };
        }
      }
      if (goUp) {
        if (upLineIndentLevel >= indent) {
          startLineNumber = upLineNumber;
        } else {
          goUp = false;
        }
      }
      if (goDown) {
        if (downLineIndentLevel >= indent) {
          endLineNumber = downLineNumber;
        } else {
          goDown = false;
        }
      }
    }
    return { startLineNumber, endLineNumber, indent };
  }
  getLinesBracketGuides(startLineNumber, endLineNumber, activePosition, options) {
    const result = [];
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      result.push([]);
    }
    const includeSingleLinePairs = true;
    const bracketPairs = this.textModel.bracketPairs.getBracketPairsInRangeWithMinIndentation(
      new Range(
        startLineNumber,
        1,
        endLineNumber,
        this.textModel.getLineMaxColumn(endLineNumber)
      )
    ).toArray();
    let activeBracketPairRange = void 0;
    if (activePosition && bracketPairs.length > 0) {
      const bracketsContainingActivePosition = (startLineNumber <= activePosition.lineNumber && activePosition.lineNumber <= endLineNumber ? bracketPairs : this.textModel.bracketPairs.getBracketPairsInRange(
        Range.fromPositions(activePosition)
      ).toArray()).filter((bp) => Range.strictContainsPosition(bp.range, activePosition));
      activeBracketPairRange = findLast(
        bracketsContainingActivePosition,
        (i) => includeSingleLinePairs || i.range.startLineNumber !== i.range.endLineNumber
      )?.range;
    }
    const independentColorPoolPerBracketType = this.textModel.getOptions().bracketPairColorizationOptions.independentColorPoolPerBracketType;
    const colorProvider = new BracketPairGuidesClassNames();
    for (const pair of bracketPairs) {
      if (!pair.closingBracketRange) {
        continue;
      }
      const isActive = activeBracketPairRange && pair.range.equalsRange(activeBracketPairRange);
      if (!isActive && !options.includeInactive) {
        continue;
      }
      const className = colorProvider.getInlineClassName(pair.nestingLevel, pair.nestingLevelOfEqualBracketType, independentColorPoolPerBracketType) + (options.highlightActive && isActive ? " " + colorProvider.activeClassName : "");
      const start = pair.openingBracketRange.getStartPosition();
      const end = pair.closingBracketRange.getStartPosition();
      const horizontalGuides = options.horizontalGuides === HorizontalGuidesState.Enabled || options.horizontalGuides === HorizontalGuidesState.EnabledForActive && isActive;
      if (pair.range.startLineNumber === pair.range.endLineNumber) {
        if (includeSingleLinePairs && horizontalGuides) {
          result[pair.range.startLineNumber - startLineNumber].push(
            new IndentGuide(
              -1,
              pair.openingBracketRange.getEndPosition().column,
              className,
              new IndentGuideHorizontalLine(false, end.column),
              -1,
              -1
            )
          );
        }
        continue;
      }
      const endVisibleColumn = this.getVisibleColumnFromPosition(end);
      const startVisibleColumn = this.getVisibleColumnFromPosition(
        pair.openingBracketRange.getStartPosition()
      );
      const guideVisibleColumn = Math.min(startVisibleColumn, endVisibleColumn, pair.minVisibleColumnIndentation + 1);
      let renderHorizontalEndLineAtTheBottom = false;
      const firstNonWsIndex = strings.firstNonWhitespaceIndex(
        this.textModel.getLineContent(
          pair.closingBracketRange.startLineNumber
        )
      );
      const hasTextBeforeClosingBracket = firstNonWsIndex < pair.closingBracketRange.startColumn - 1;
      if (hasTextBeforeClosingBracket) {
        renderHorizontalEndLineAtTheBottom = true;
      }
      const visibleGuideStartLineNumber = Math.max(start.lineNumber, startLineNumber);
      const visibleGuideEndLineNumber = Math.min(end.lineNumber, endLineNumber);
      const offset = renderHorizontalEndLineAtTheBottom ? 1 : 0;
      for (let l = visibleGuideStartLineNumber; l < visibleGuideEndLineNumber + offset; l++) {
        result[l - startLineNumber].push(
          new IndentGuide(
            guideVisibleColumn,
            -1,
            className,
            null,
            l === start.lineNumber ? start.column : -1,
            l === end.lineNumber ? end.column : -1
          )
        );
      }
      if (horizontalGuides) {
        if (start.lineNumber >= startLineNumber && startVisibleColumn > guideVisibleColumn) {
          result[start.lineNumber - startLineNumber].push(
            new IndentGuide(
              guideVisibleColumn,
              -1,
              className,
              new IndentGuideHorizontalLine(false, start.column),
              -1,
              -1
            )
          );
        }
        if (end.lineNumber <= endLineNumber && endVisibleColumn > guideVisibleColumn) {
          result[end.lineNumber - startLineNumber].push(
            new IndentGuide(
              guideVisibleColumn,
              -1,
              className,
              new IndentGuideHorizontalLine(!renderHorizontalEndLineAtTheBottom, end.column),
              -1,
              -1
            )
          );
        }
      }
    }
    for (const guides of result) {
      guides.sort((a, b) => a.visibleColumn - b.visibleColumn);
    }
    return result;
  }
  getVisibleColumnFromPosition(position) {
    return CursorColumns.visibleColumnFromColumn(
      this.textModel.getLineContent(position.lineNumber),
      position.column,
      this.textModel.getOptions().tabSize
    ) + 1;
  }
  getLinesIndentGuides(startLineNumber, endLineNumber) {
    this.assertNotDisposed();
    const lineCount = this.textModel.getLineCount();
    if (startLineNumber < 1 || startLineNumber > lineCount) {
      throw new Error("Illegal value for startLineNumber");
    }
    if (endLineNumber < 1 || endLineNumber > lineCount) {
      throw new Error("Illegal value for endLineNumber");
    }
    const options = this.textModel.getOptions();
    const foldingRules = this.getLanguageConfiguration(
      this.textModel.getLanguageId()
    ).foldingRules;
    const offSide = Boolean(foldingRules && foldingRules.offSide);
    const result = new Array(
      endLineNumber - startLineNumber + 1
    );
    let aboveContentLineIndex = -2;
    let aboveContentLineIndent = -1;
    let belowContentLineIndex = -2;
    let belowContentLineIndent = -1;
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      const resultIndex = lineNumber - startLineNumber;
      const currentIndent = this._computeIndentLevel(lineNumber - 1);
      if (currentIndent >= 0) {
        aboveContentLineIndex = lineNumber - 1;
        aboveContentLineIndent = currentIndent;
        result[resultIndex] = Math.ceil(currentIndent / options.indentSize);
        continue;
      }
      if (aboveContentLineIndex === -2) {
        aboveContentLineIndex = -1;
        aboveContentLineIndent = -1;
        for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
          const indent = this._computeIndentLevel(lineIndex);
          if (indent >= 0) {
            aboveContentLineIndex = lineIndex;
            aboveContentLineIndent = indent;
            break;
          }
        }
      }
      if (belowContentLineIndex !== -1 && (belowContentLineIndex === -2 || belowContentLineIndex < lineNumber - 1)) {
        belowContentLineIndex = -1;
        belowContentLineIndent = -1;
        for (let lineIndex = lineNumber; lineIndex < lineCount; lineIndex++) {
          const indent = this._computeIndentLevel(lineIndex);
          if (indent >= 0) {
            belowContentLineIndex = lineIndex;
            belowContentLineIndent = indent;
            break;
          }
        }
      }
      result[resultIndex] = this._getIndentLevelForWhitespaceLine(
        offSide,
        aboveContentLineIndent,
        belowContentLineIndent
      );
    }
    return result;
  }
  _getIndentLevelForWhitespaceLine(offSide, aboveContentLineIndent, belowContentLineIndent) {
    const options = this.textModel.getOptions();
    if (aboveContentLineIndent === -1 || belowContentLineIndent === -1) {
      return 0;
    } else if (aboveContentLineIndent < belowContentLineIndent) {
      return 1 + Math.floor(aboveContentLineIndent / options.indentSize);
    } else if (aboveContentLineIndent === belowContentLineIndent) {
      return Math.ceil(belowContentLineIndent / options.indentSize);
    } else {
      if (offSide) {
        return Math.ceil(belowContentLineIndent / options.indentSize);
      } else {
        return 1 + Math.floor(belowContentLineIndent / options.indentSize);
      }
    }
  }
}
class BracketPairGuidesClassNames {
  static {
    __name(this, "BracketPairGuidesClassNames");
  }
  activeClassName = "indent-active";
  getInlineClassName(nestingLevel, nestingLevelOfEqualBracketType, independentColorPoolPerBracketType) {
    return this.getInlineClassNameOfLevel(independentColorPoolPerBracketType ? nestingLevelOfEqualBracketType : nestingLevel);
  }
  getInlineClassNameOfLevel(level) {
    return `bracket-indent-guide lvl-${level % 30}`;
  }
}
export {
  BracketPairGuidesClassNames,
  GuidesTextModelPart
};
//# sourceMappingURL=guidesTextModelPart.js.map
