var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../../../base/common/color.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Range } from "../../core/range.js";
import { BracketPairColorizationOptions, IModelDecoration } from "../../model.js";
import { BracketInfo } from "../../textModelBracketPairs.js";
import { DecorationProvider } from "../decorationProvider.js";
import { TextModel } from "../textModel.js";
import {
  editorBracketHighlightingForeground1,
  editorBracketHighlightingForeground2,
  editorBracketHighlightingForeground3,
  editorBracketHighlightingForeground4,
  editorBracketHighlightingForeground5,
  editorBracketHighlightingForeground6,
  editorBracketHighlightingUnexpectedBracketForeground
} from "../../core/editorColorRegistry.js";
import { registerThemingParticipant } from "../../../../platform/theme/common/themeService.js";
import { IModelOptionsChangedEvent } from "../../textModelEvents.js";
class ColorizedBracketPairsDecorationProvider extends Disposable {
  constructor(textModel) {
    super();
    this.textModel = textModel;
    this.colorizationOptions = textModel.getOptions().bracketPairColorizationOptions;
    this._register(textModel.bracketPairs.onDidChange((e) => {
      this.onDidChangeEmitter.fire();
    }));
  }
  static {
    __name(this, "ColorizedBracketPairsDecorationProvider");
  }
  colorizationOptions;
  colorProvider = new ColorProvider();
  onDidChangeEmitter = new Emitter();
  onDidChange = this.onDidChangeEmitter.event;
  //#region TextModel events
  handleDidChangeOptions(e) {
    this.colorizationOptions = this.textModel.getOptions().bracketPairColorizationOptions;
  }
  //#endregion
  getDecorationsInRange(range, ownerId, filterOutValidation, onlyMinimapDecorations) {
    if (onlyMinimapDecorations) {
      return [];
    }
    if (ownerId === void 0) {
      return [];
    }
    if (!this.colorizationOptions.enabled) {
      return [];
    }
    const result = this.textModel.bracketPairs.getBracketsInRange(range, true).map((bracket) => ({
      id: `bracket${bracket.range.toString()}-${bracket.nestingLevel}`,
      options: {
        description: "BracketPairColorization",
        inlineClassName: this.colorProvider.getInlineClassName(
          bracket,
          this.colorizationOptions.independentColorPoolPerBracketType
        )
      },
      ownerId: 0,
      range: bracket.range
    })).toArray();
    return result;
  }
  getAllDecorations(ownerId, filterOutValidation) {
    if (ownerId === void 0) {
      return [];
    }
    if (!this.colorizationOptions.enabled) {
      return [];
    }
    return this.getDecorationsInRange(
      new Range(1, 1, this.textModel.getLineCount(), 1),
      ownerId,
      filterOutValidation
    );
  }
}
class ColorProvider {
  static {
    __name(this, "ColorProvider");
  }
  unexpectedClosingBracketClassName = "unexpected-closing-bracket";
  getInlineClassName(bracket, independentColorPoolPerBracketType) {
    if (bracket.isInvalid) {
      return this.unexpectedClosingBracketClassName;
    }
    return this.getInlineClassNameOfLevel(independentColorPoolPerBracketType ? bracket.nestingLevelOfEqualBracketType : bracket.nestingLevel);
  }
  getInlineClassNameOfLevel(level) {
    return `bracket-highlighting-${level % 30}`;
  }
}
registerThemingParticipant((theme, collector) => {
  const colors = [
    editorBracketHighlightingForeground1,
    editorBracketHighlightingForeground2,
    editorBracketHighlightingForeground3,
    editorBracketHighlightingForeground4,
    editorBracketHighlightingForeground5,
    editorBracketHighlightingForeground6
  ];
  const colorProvider = new ColorProvider();
  collector.addRule(`.monaco-editor .${colorProvider.unexpectedClosingBracketClassName} { color: ${theme.getColor(editorBracketHighlightingUnexpectedBracketForeground)}; }`);
  const colorValues = colors.map((c) => theme.getColor(c)).filter((c) => !!c).filter((c) => !c.isTransparent());
  for (let level = 0; level < 30; level++) {
    const color = colorValues[level % colorValues.length];
    collector.addRule(`.monaco-editor .${colorProvider.getInlineClassNameOfLevel(level)} { color: ${color}; }`);
  }
});
export {
  ColorizedBracketPairsDecorationProvider
};
//# sourceMappingURL=colorizedBracketPairsDecorationProvider.js.map
