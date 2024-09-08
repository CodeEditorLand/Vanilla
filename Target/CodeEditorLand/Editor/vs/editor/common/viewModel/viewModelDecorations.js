import { filterValidationDecorations } from "../config/editorOptions.js";
import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { StandardTokenType } from "../encodedTokenAttributes.js";
import {
  PositionAffinity
} from "../model.js";
import {
  InlineDecoration,
  InlineDecorationType,
  ViewModelDecoration
} from "../viewModel.js";
class ViewModelDecorations {
  editorId;
  model;
  configuration;
  _linesCollection;
  _coordinatesConverter;
  _decorationsCache;
  _cachedModelDecorationsResolver;
  _cachedModelDecorationsResolverViewRange;
  constructor(editorId, model, configuration, linesCollection, coordinatesConverter) {
    this.editorId = editorId;
    this.model = model;
    this.configuration = configuration;
    this._linesCollection = linesCollection;
    this._coordinatesConverter = coordinatesConverter;
    this._decorationsCache = /* @__PURE__ */ Object.create(null);
    this._cachedModelDecorationsResolver = null;
    this._cachedModelDecorationsResolverViewRange = null;
  }
  _clearCachedModelDecorationsResolver() {
    this._cachedModelDecorationsResolver = null;
    this._cachedModelDecorationsResolverViewRange = null;
  }
  dispose() {
    this._decorationsCache = /* @__PURE__ */ Object.create(null);
    this._clearCachedModelDecorationsResolver();
  }
  reset() {
    this._decorationsCache = /* @__PURE__ */ Object.create(null);
    this._clearCachedModelDecorationsResolver();
  }
  onModelDecorationsChanged() {
    this._decorationsCache = /* @__PURE__ */ Object.create(null);
    this._clearCachedModelDecorationsResolver();
  }
  onLineMappingChanged() {
    this._decorationsCache = /* @__PURE__ */ Object.create(null);
    this._clearCachedModelDecorationsResolver();
  }
  _getOrCreateViewModelDecoration(modelDecoration) {
    const id = modelDecoration.id;
    let r = this._decorationsCache[id];
    if (!r) {
      const modelRange = modelDecoration.range;
      const options = modelDecoration.options;
      let viewRange;
      if (options.isWholeLine) {
        const start = this._coordinatesConverter.convertModelPositionToViewPosition(
          new Position(modelRange.startLineNumber, 1),
          PositionAffinity.Left,
          false,
          true
        );
        const end = this._coordinatesConverter.convertModelPositionToViewPosition(
          new Position(
            modelRange.endLineNumber,
            this.model.getLineMaxColumn(
              modelRange.endLineNumber
            )
          ),
          PositionAffinity.Right
        );
        viewRange = new Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column
        );
      } else {
        viewRange = this._coordinatesConverter.convertModelRangeToViewRange(
          modelRange,
          PositionAffinity.Right
        );
      }
      r = new ViewModelDecoration(viewRange, options);
      this._decorationsCache[id] = r;
    }
    return r;
  }
  getMinimapDecorationsInRange(range) {
    return this._getDecorationsInRange(range, true, false).decorations;
  }
  getDecorationsViewportData(viewRange) {
    let cacheIsValid = this._cachedModelDecorationsResolver !== null;
    cacheIsValid = cacheIsValid && viewRange.equalsRange(
      this._cachedModelDecorationsResolverViewRange
    );
    if (!cacheIsValid) {
      this._cachedModelDecorationsResolver = this._getDecorationsInRange(
        viewRange,
        false,
        false
      );
      this._cachedModelDecorationsResolverViewRange = viewRange;
    }
    return this._cachedModelDecorationsResolver;
  }
  getInlineDecorationsOnLine(lineNumber, onlyMinimapDecorations = false, onlyMarginDecorations = false) {
    const range = new Range(
      lineNumber,
      this._linesCollection.getViewLineMinColumn(lineNumber),
      lineNumber,
      this._linesCollection.getViewLineMaxColumn(lineNumber)
    );
    return this._getDecorationsInRange(
      range,
      onlyMinimapDecorations,
      onlyMarginDecorations
    ).inlineDecorations[0];
  }
  _getDecorationsInRange(viewRange, onlyMinimapDecorations, onlyMarginDecorations) {
    const modelDecorations = this._linesCollection.getDecorationsInRange(
      viewRange,
      this.editorId,
      filterValidationDecorations(this.configuration.options),
      onlyMinimapDecorations,
      onlyMarginDecorations
    );
    const startLineNumber = viewRange.startLineNumber;
    const endLineNumber = viewRange.endLineNumber;
    const decorationsInViewport = [];
    let decorationsInViewportLen = 0;
    const inlineDecorations = [];
    for (let j = startLineNumber; j <= endLineNumber; j++) {
      inlineDecorations[j - startLineNumber] = [];
    }
    for (let i = 0, len = modelDecorations.length; i < len; i++) {
      const modelDecoration = modelDecorations[i];
      const decorationOptions = modelDecoration.options;
      if (!isModelDecorationVisible(this.model, modelDecoration)) {
        continue;
      }
      const viewModelDecoration = this._getOrCreateViewModelDecoration(modelDecoration);
      const viewRange2 = viewModelDecoration.range;
      decorationsInViewport[decorationsInViewportLen++] = viewModelDecoration;
      if (decorationOptions.inlineClassName) {
        const inlineDecoration = new InlineDecoration(
          viewRange2,
          decorationOptions.inlineClassName,
          decorationOptions.inlineClassNameAffectsLetterSpacing ? InlineDecorationType.RegularAffectingLetterSpacing : InlineDecorationType.Regular
        );
        const intersectedStartLineNumber = Math.max(
          startLineNumber,
          viewRange2.startLineNumber
        );
        const intersectedEndLineNumber = Math.min(
          endLineNumber,
          viewRange2.endLineNumber
        );
        for (let j = intersectedStartLineNumber; j <= intersectedEndLineNumber; j++) {
          inlineDecorations[j - startLineNumber].push(
            inlineDecoration
          );
        }
      }
      if (decorationOptions.beforeContentClassName) {
        if (startLineNumber <= viewRange2.startLineNumber && viewRange2.startLineNumber <= endLineNumber) {
          const inlineDecoration = new InlineDecoration(
            new Range(
              viewRange2.startLineNumber,
              viewRange2.startColumn,
              viewRange2.startLineNumber,
              viewRange2.startColumn
            ),
            decorationOptions.beforeContentClassName,
            InlineDecorationType.Before
          );
          inlineDecorations[viewRange2.startLineNumber - startLineNumber].push(inlineDecoration);
        }
      }
      if (decorationOptions.afterContentClassName) {
        if (startLineNumber <= viewRange2.endLineNumber && viewRange2.endLineNumber <= endLineNumber) {
          const inlineDecoration = new InlineDecoration(
            new Range(
              viewRange2.endLineNumber,
              viewRange2.endColumn,
              viewRange2.endLineNumber,
              viewRange2.endColumn
            ),
            decorationOptions.afterContentClassName,
            InlineDecorationType.After
          );
          inlineDecorations[viewRange2.endLineNumber - startLineNumber].push(inlineDecoration);
        }
      }
    }
    return {
      decorations: decorationsInViewport,
      inlineDecorations
    };
  }
}
function isModelDecorationVisible(model, decoration) {
  if (decoration.options.hideInCommentTokens && isModelDecorationInComment(model, decoration)) {
    return false;
  }
  if (decoration.options.hideInStringTokens && isModelDecorationInString(model, decoration)) {
    return false;
  }
  return true;
}
function isModelDecorationInComment(model, decoration) {
  return testTokensInRange(
    model,
    decoration.range,
    (tokenType) => tokenType === StandardTokenType.Comment
  );
}
function isModelDecorationInString(model, decoration) {
  return testTokensInRange(
    model,
    decoration.range,
    (tokenType) => tokenType === StandardTokenType.String
  );
}
function testTokensInRange(model, range, callback) {
  for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
    const lineTokens = model.tokenization.getLineTokens(lineNumber);
    const isFirstLine = lineNumber === range.startLineNumber;
    const isEndLine = lineNumber === range.endLineNumber;
    let tokenIdx = isFirstLine ? lineTokens.findTokenIndexAtOffset(range.startColumn - 1) : 0;
    while (tokenIdx < lineTokens.getCount()) {
      if (isEndLine) {
        const startOffset = lineTokens.getStartOffset(tokenIdx);
        if (startOffset > range.endColumn - 1) {
          break;
        }
      }
      const callbackResult = callback(
        lineTokens.getStandardTokenType(tokenIdx)
      );
      if (!callbackResult) {
        return false;
      }
      tokenIdx++;
    }
  }
  return true;
}
export {
  ViewModelDecorations,
  isModelDecorationInComment,
  isModelDecorationInString,
  isModelDecorationVisible
};
