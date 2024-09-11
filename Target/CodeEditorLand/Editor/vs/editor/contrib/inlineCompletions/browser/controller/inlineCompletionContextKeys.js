var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IObservable, autorun } from "../../../../../base/common/observable.js";
import { firstNonWhitespaceIndex } from "../../../../../base/common/strings.js";
import { CursorColumns } from "../../../../common/core/cursorColumns.js";
import { InlineCompletionsModel } from "../model/inlineCompletionsModel.js";
import { RawContextKey, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
class InlineCompletionContextKeys extends Disposable {
  constructor(contextKeyService, model) {
    super();
    this.contextKeyService = contextKeyService;
    this.model = model;
    this._register(autorun((reader) => {
      const model2 = this.model.read(reader);
      const state = model2?.state.read(reader);
      const isInlineCompletionVisible = !!state?.inlineCompletion && state?.primaryGhostText !== void 0 && !state?.primaryGhostText.isEmpty();
      this.inlineCompletionVisible.set(isInlineCompletionVisible);
      if (state?.primaryGhostText && state?.inlineCompletion) {
        this.suppressSuggestions.set(state.inlineCompletion.inlineCompletion.source.inlineCompletions.suppressSuggestions);
      }
    }));
    this._register(autorun((reader) => {
      const model2 = this.model.read(reader);
      let startsWithIndentation = false;
      let startsWithIndentationLessThanTabSize = true;
      const ghostText = model2?.primaryGhostText.read(reader);
      if (!!model2?.selectedSuggestItem && ghostText && ghostText.parts.length > 0) {
        const { column, lines } = ghostText.parts[0];
        const firstLine = lines[0];
        const indentationEndColumn = model2.textModel.getLineIndentColumn(ghostText.lineNumber);
        const inIndentation = column <= indentationEndColumn;
        if (inIndentation) {
          let firstNonWsIdx = firstNonWhitespaceIndex(firstLine);
          if (firstNonWsIdx === -1) {
            firstNonWsIdx = firstLine.length - 1;
          }
          startsWithIndentation = firstNonWsIdx > 0;
          const tabSize = model2.textModel.getOptions().tabSize;
          const visibleColumnIndentation = CursorColumns.visibleColumnFromColumn(firstLine, firstNonWsIdx + 1, tabSize);
          startsWithIndentationLessThanTabSize = visibleColumnIndentation < tabSize;
        }
      }
      this.inlineCompletionSuggestsIndentation.set(startsWithIndentation);
      this.inlineCompletionSuggestsIndentationLessThanTabSize.set(startsWithIndentationLessThanTabSize);
    }));
  }
  static {
    __name(this, "InlineCompletionContextKeys");
  }
  static inlineSuggestionVisible = new RawContextKey("inlineSuggestionVisible", false, localize("inlineSuggestionVisible", "Whether an inline suggestion is visible"));
  static inlineSuggestionHasIndentation = new RawContextKey("inlineSuggestionHasIndentation", false, localize("inlineSuggestionHasIndentation", "Whether the inline suggestion starts with whitespace"));
  static inlineSuggestionHasIndentationLessThanTabSize = new RawContextKey("inlineSuggestionHasIndentationLessThanTabSize", true, localize("inlineSuggestionHasIndentationLessThanTabSize", "Whether the inline suggestion starts with whitespace that is less than what would be inserted by tab"));
  static suppressSuggestions = new RawContextKey("inlineSuggestionSuppressSuggestions", void 0, localize("suppressSuggestions", "Whether suggestions should be suppressed for the current suggestion"));
  inlineCompletionVisible = InlineCompletionContextKeys.inlineSuggestionVisible.bindTo(this.contextKeyService);
  inlineCompletionSuggestsIndentation = InlineCompletionContextKeys.inlineSuggestionHasIndentation.bindTo(this.contextKeyService);
  inlineCompletionSuggestsIndentationLessThanTabSize = InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize.bindTo(this.contextKeyService);
  suppressSuggestions = InlineCompletionContextKeys.suppressSuggestions.bindTo(this.contextKeyService);
}
export {
  InlineCompletionContextKeys
};
//# sourceMappingURL=inlineCompletionContextKeys.js.map
