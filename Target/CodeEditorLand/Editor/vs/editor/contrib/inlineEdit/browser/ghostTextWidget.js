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
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import {
  derived,
  observableFromEvent,
  observableValue
} from "../../../../base/common/observable.js";
import "./inlineEdit.css";
import {
  diffDeleteDecoration,
  diffLineDeleteDecorationBackgroundWithIndicator
} from "../../../browser/widget/diffEditor/registrations.contribution.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { ILanguageService } from "../../../common/languages/language.js";
import {
  InjectedTextCursorStops
} from "../../../common/model.js";
import { LineTokens } from "../../../common/tokens/lineTokens.js";
import { LineDecoration } from "../../../common/viewLayout/lineDecorations.js";
import { InlineDecorationType } from "../../../common/viewModel.js";
import {
  ColumnRange,
  applyObservableDecorations
} from "../../inlineCompletions/browser/utils.js";
import {
  AdditionalLinesWidget
} from "../../inlineCompletions/browser/view/ghostTextView.js";
const INLINE_EDIT_DESCRIPTION = "inline-edit";
let GhostTextWidget = class extends Disposable {
  constructor(editor, model, languageService) {
    super();
    this.editor = editor;
    this.model = model;
    this.languageService = languageService;
    this._register(toDisposable(() => {
      this.isDisposed.set(true, void 0);
    }));
    this._register(applyObservableDecorations(this.editor, this.decorations));
  }
  static {
    __name(this, "GhostTextWidget");
  }
  isDisposed = observableValue(this, false);
  currentTextModel = observableFromEvent(
    this,
    this.editor.onDidChangeModel,
    () => (
      /** @description editor.model */
      this.editor.getModel()
    )
  );
  uiState = derived(this, (reader) => {
    if (this.isDisposed.read(reader)) {
      return void 0;
    }
    const textModel = this.currentTextModel.read(reader);
    if (textModel !== this.model.targetTextModel.read(reader)) {
      return void 0;
    }
    const ghostText = this.model.ghostText.read(reader);
    if (!ghostText) {
      return void 0;
    }
    let range = this.model.range?.read(reader);
    if (range && range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
      range = void 0;
    }
    const isSingleLine = (range ? range.startLineNumber === range.endLineNumber : true) && ghostText.parts.length === 1 && ghostText.parts[0].lines.length === 1;
    const isPureRemove = ghostText.parts.length === 1 && ghostText.parts[0].lines.every((l) => l.length === 0);
    const inlineTexts = [];
    const additionalLines = [];
    function addToAdditionalLines(lines, className) {
      if (additionalLines.length > 0) {
        const lastLine = additionalLines[additionalLines.length - 1];
        if (className) {
          lastLine.decorations.push(
            new LineDecoration(
              lastLine.content.length + 1,
              lastLine.content.length + 1 + lines[0].length,
              className,
              InlineDecorationType.Regular
            )
          );
        }
        lastLine.content += lines[0];
        lines = lines.slice(1);
      }
      for (const line of lines) {
        additionalLines.push({
          content: line,
          decorations: className ? [
            new LineDecoration(
              1,
              line.length + 1,
              className,
              InlineDecorationType.Regular
            )
          ] : []
        });
      }
    }
    __name(addToAdditionalLines, "addToAdditionalLines");
    const textBufferLine = textModel.getLineContent(ghostText.lineNumber);
    let hiddenTextStartColumn;
    let lastIdx = 0;
    if (!isPureRemove && (isSingleLine || !range)) {
      for (const part of ghostText.parts) {
        let lines = part.lines;
        if (range && !isSingleLine) {
          addToAdditionalLines(lines, INLINE_EDIT_DESCRIPTION);
          lines = [];
        }
        if (hiddenTextStartColumn === void 0) {
          inlineTexts.push({
            column: part.column,
            text: lines[0],
            preview: part.preview
          });
          lines = lines.slice(1);
        } else {
          addToAdditionalLines(
            [textBufferLine.substring(lastIdx, part.column - 1)],
            void 0
          );
        }
        if (lines.length > 0) {
          addToAdditionalLines(lines, INLINE_EDIT_DESCRIPTION);
          if (hiddenTextStartColumn === void 0 && part.column <= textBufferLine.length) {
            hiddenTextStartColumn = part.column;
          }
        }
        lastIdx = part.column - 1;
      }
      if (hiddenTextStartColumn !== void 0) {
        addToAdditionalLines(
          [textBufferLine.substring(lastIdx)],
          void 0
        );
      }
    }
    const hiddenRange = hiddenTextStartColumn !== void 0 ? new ColumnRange(
      hiddenTextStartColumn,
      textBufferLine.length + 1
    ) : void 0;
    const lineNumber = isSingleLine || !range ? ghostText.lineNumber : range.endLineNumber - 1;
    return {
      inlineTexts,
      additionalLines,
      hiddenRange,
      lineNumber,
      additionalReservedLineCount: this.model.minReservedLineCount.read(reader),
      targetTextModel: textModel,
      range,
      isSingleLine,
      isPureRemove
    };
  });
  decorations = derived(this, (reader) => {
    const uiState = this.uiState.read(reader);
    if (!uiState) {
      return [];
    }
    const decorations = [];
    if (uiState.hiddenRange) {
      decorations.push({
        range: uiState.hiddenRange.toRange(uiState.lineNumber),
        options: {
          inlineClassName: "inline-edit-hidden",
          description: "inline-edit-hidden"
        }
      });
    }
    if (uiState.range) {
      const ranges = [];
      if (uiState.isSingleLine) {
        ranges.push(uiState.range);
      } else if (!uiState.isPureRemove) {
        const lines = uiState.range.endLineNumber - uiState.range.startLineNumber;
        for (let i = 0; i < lines; i++) {
          const line = uiState.range.startLineNumber + i;
          const firstNonWhitespace = uiState.targetTextModel.getLineFirstNonWhitespaceColumn(
            line
          );
          const lastNonWhitespace = uiState.targetTextModel.getLineLastNonWhitespaceColumn(
            line
          );
          const range = new Range(
            line,
            firstNonWhitespace,
            line,
            lastNonWhitespace
          );
          ranges.push(range);
        }
      }
      for (const range of ranges) {
        decorations.push({
          range,
          options: diffDeleteDecoration
        });
      }
    }
    if (uiState.range && !uiState.isSingleLine && uiState.isPureRemove) {
      const r = new Range(
        uiState.range.startLineNumber,
        1,
        uiState.range.endLineNumber - 1,
        1
      );
      decorations.push({
        range: r,
        options: diffLineDeleteDecorationBackgroundWithIndicator
      });
    }
    for (const p of uiState.inlineTexts) {
      decorations.push({
        range: Range.fromPositions(
          new Position(uiState.lineNumber, p.column)
        ),
        options: {
          description: INLINE_EDIT_DESCRIPTION,
          after: {
            content: p.text,
            inlineClassName: p.preview ? "inline-edit-decoration-preview" : "inline-edit-decoration",
            cursorStops: InjectedTextCursorStops.Left
          },
          showIfCollapsed: true
        }
      });
    }
    return decorations;
  });
  additionalLinesWidget = this._register(
    new AdditionalLinesWidget(
      this.editor,
      derived((reader) => {
        const uiState = this.uiState.read(reader);
        return uiState && !uiState.isPureRemove && (uiState.isSingleLine || !uiState.range) ? {
          lineNumber: uiState.lineNumber,
          additionalLines: uiState.additionalLines.map(
            (l) => ({
              content: LineTokens.createEmpty(
                l.content,
                this.languageService.languageIdCodec
              ),
              decorations: l.decorations
            })
          ),
          minReservedLineCount: uiState.additionalReservedLineCount,
          targetTextModel: uiState.targetTextModel
        } : void 0;
      })
    )
  );
  ownsViewZone(viewZoneId) {
    return this.additionalLinesWidget.viewZoneId === viewZoneId;
  }
};
GhostTextWidget = __decorateClass([
  __decorateParam(2, ILanguageService)
], GhostTextWidget);
export {
  GhostTextWidget,
  INLINE_EDIT_DESCRIPTION
};
//# sourceMappingURL=ghostTextWidget.js.map
