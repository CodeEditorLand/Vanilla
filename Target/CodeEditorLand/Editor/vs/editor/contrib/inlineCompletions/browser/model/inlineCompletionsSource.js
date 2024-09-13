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
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { equalsIfDefined, itemEquals } from "../../../../../base/common/equals.js";
import { matchesSubString } from "../../../../../base/common/filters.js";
import { Disposable, IDisposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, IReader, ITransaction, derivedOpts, disposableObservableValue, transaction } from "../../../../../base/common/observable.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { TextLength } from "../../../../common/core/textLength.js";
import { InlineCompletionContext, InlineCompletionTriggerKind } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { EndOfLinePreference, ITextModel } from "../../../../common/model.js";
import { IFeatureDebounceInformation } from "../../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { InlineCompletionItem, InlineCompletionProviderResult, provideInlineCompletions } from "./provideInlineCompletions.js";
import { singleTextRemoveCommonPrefix } from "./singleTextEdit.js";
let InlineCompletionsSource = class extends Disposable {
  constructor(textModel, versionId, _debounceValue, languageFeaturesService, languageConfigurationService) {
    super();
    this.textModel = textModel;
    this.versionId = versionId;
    this._debounceValue = _debounceValue;
    this.languageFeaturesService = languageFeaturesService;
    this.languageConfigurationService = languageConfigurationService;
    this._register(this.textModel.onDidChangeContent(() => {
      this._updateOperation.clear();
    }));
  }
  static {
    __name(this, "InlineCompletionsSource");
  }
  _updateOperation = this._register(new MutableDisposable());
  inlineCompletions = disposableObservableValue("inlineCompletions", void 0);
  suggestWidgetInlineCompletions = disposableObservableValue("suggestWidgetInlineCompletions", void 0);
  fetch(position, context, activeInlineCompletion) {
    const request = new UpdateRequest(position, context, this.textModel.getVersionId());
    const target = context.selectedSuggestionInfo ? this.suggestWidgetInlineCompletions : this.inlineCompletions;
    if (this._updateOperation.value?.request.satisfies(request)) {
      return this._updateOperation.value.promise;
    } else if (target.get()?.request.satisfies(request)) {
      return Promise.resolve(true);
    }
    const updateOngoing = !!this._updateOperation.value;
    this._updateOperation.clear();
    const source = new CancellationTokenSource();
    const promise = (async () => {
      const shouldDebounce = updateOngoing || context.triggerKind === InlineCompletionTriggerKind.Automatic;
      if (shouldDebounce) {
        await wait(this._debounceValue.get(this.textModel), source.token);
      }
      if (source.token.isCancellationRequested || this._store.isDisposed || this.textModel.getVersionId() !== request.versionId) {
        return false;
      }
      const startTime = /* @__PURE__ */ new Date();
      const updatedCompletions = await provideInlineCompletions(
        this.languageFeaturesService.inlineCompletionsProvider,
        position,
        this.textModel,
        context,
        source.token,
        this.languageConfigurationService
      );
      if (source.token.isCancellationRequested || this._store.isDisposed || this.textModel.getVersionId() !== request.versionId) {
        return false;
      }
      const endTime = /* @__PURE__ */ new Date();
      this._debounceValue.update(this.textModel, endTime.getTime() - startTime.getTime());
      const completions = new UpToDateInlineCompletions(updatedCompletions, request, this.textModel, this.versionId);
      if (activeInlineCompletion) {
        const asInlineCompletion = activeInlineCompletion.toInlineCompletion(void 0);
        if (activeInlineCompletion.canBeReused(this.textModel, position) && !updatedCompletions.has(asInlineCompletion)) {
          completions.prepend(activeInlineCompletion.inlineCompletion, asInlineCompletion.range, true);
        }
      }
      this._updateOperation.clear();
      transaction((tx) => {
        target.set(completions, tx);
      });
      return true;
    })();
    const updateOperation = new UpdateOperation(request, source, promise);
    this._updateOperation.value = updateOperation;
    return promise;
  }
  clear(tx) {
    this._updateOperation.clear();
    this.inlineCompletions.set(void 0, tx);
    this.suggestWidgetInlineCompletions.set(void 0, tx);
  }
  clearSuggestWidgetInlineCompletions(tx) {
    if (this._updateOperation.value?.request.context.selectedSuggestionInfo) {
      this._updateOperation.clear();
    }
    this.suggestWidgetInlineCompletions.set(void 0, tx);
  }
  cancelUpdate() {
    this._updateOperation.clear();
  }
};
InlineCompletionsSource = __decorateClass([
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ILanguageConfigurationService)
], InlineCompletionsSource);
function wait(ms, cancellationToken) {
  return new Promise((resolve) => {
    let d = void 0;
    const handle = setTimeout(() => {
      if (d) {
        d.dispose();
      }
      resolve();
    }, ms);
    if (cancellationToken) {
      d = cancellationToken.onCancellationRequested(() => {
        clearTimeout(handle);
        if (d) {
          d.dispose();
        }
        resolve();
      });
    }
  });
}
__name(wait, "wait");
class UpdateRequest {
  constructor(position, context, versionId) {
    this.position = position;
    this.context = context;
    this.versionId = versionId;
  }
  static {
    __name(this, "UpdateRequest");
  }
  satisfies(other) {
    return this.position.equals(other.position) && equalsIfDefined(this.context.selectedSuggestionInfo, other.context.selectedSuggestionInfo, itemEquals()) && (other.context.triggerKind === InlineCompletionTriggerKind.Automatic || this.context.triggerKind === InlineCompletionTriggerKind.Explicit) && this.versionId === other.versionId;
  }
}
class UpdateOperation {
  constructor(request, cancellationTokenSource, promise) {
    this.request = request;
    this.cancellationTokenSource = cancellationTokenSource;
    this.promise = promise;
  }
  static {
    __name(this, "UpdateOperation");
  }
  dispose() {
    this.cancellationTokenSource.cancel();
  }
}
class UpToDateInlineCompletions {
  constructor(inlineCompletionProviderResult, request, _textModel, _versionId) {
    this.inlineCompletionProviderResult = inlineCompletionProviderResult;
    this.request = request;
    this._textModel = _textModel;
    this._versionId = _versionId;
    const ids = _textModel.deltaDecorations([], inlineCompletionProviderResult.completions.map((i) => ({
      range: i.range,
      options: {
        description: "inline-completion-tracking-range"
      }
    })));
    this._inlineCompletions = inlineCompletionProviderResult.completions.map(
      (i, index) => new InlineCompletionWithUpdatedRange(i, ids[index], this._textModel, this._versionId)
    );
  }
  static {
    __name(this, "UpToDateInlineCompletions");
  }
  _inlineCompletions;
  get inlineCompletions() {
    return this._inlineCompletions;
  }
  _refCount = 1;
  _prependedInlineCompletionItems = [];
  clone() {
    this._refCount++;
    return this;
  }
  dispose() {
    this._refCount--;
    if (this._refCount === 0) {
      setTimeout(() => {
        if (!this._textModel.isDisposed()) {
          this._textModel.deltaDecorations(this._inlineCompletions.map((i) => i.decorationId), []);
        }
      }, 0);
      this.inlineCompletionProviderResult.dispose();
      for (const i of this._prependedInlineCompletionItems) {
        i.source.removeRef();
      }
    }
  }
  prepend(inlineCompletion, range, addRefToSource) {
    if (addRefToSource) {
      inlineCompletion.source.addRef();
    }
    const id = this._textModel.deltaDecorations([], [{
      range,
      options: {
        description: "inline-completion-tracking-range"
      }
    }])[0];
    this._inlineCompletions.unshift(new InlineCompletionWithUpdatedRange(inlineCompletion, id, this._textModel, this._versionId));
    this._prependedInlineCompletionItems.push(inlineCompletion);
  }
}
class InlineCompletionWithUpdatedRange {
  constructor(inlineCompletion, decorationId, _textModel, _modelVersion) {
    this.inlineCompletion = inlineCompletion;
    this.decorationId = decorationId;
    this._textModel = _textModel;
    this._modelVersion = _modelVersion;
  }
  static {
    __name(this, "InlineCompletionWithUpdatedRange");
  }
  semanticId = JSON.stringify([
    this.inlineCompletion.filterText,
    this.inlineCompletion.insertText,
    this.inlineCompletion.range.getStartPosition().toString()
  ]);
  get forwardStable() {
    return this.inlineCompletion.source.inlineCompletions.enableForwardStability ?? false;
  }
  _updatedRange = derivedOpts({ owner: this, equalsFn: Range.equalsRange }, (reader) => {
    this._modelVersion.read(reader);
    return this._textModel.getDecorationRange(this.decorationId);
  });
  toInlineCompletion(reader) {
    return this.inlineCompletion.withRange(this._updatedRange.read(reader) ?? emptyRange);
  }
  toSingleTextEdit(reader) {
    return new SingleTextEdit(this._updatedRange.read(reader) ?? emptyRange, this.inlineCompletion.insertText);
  }
  isVisible(model, cursorPosition, reader) {
    const minimizedReplacement = singleTextRemoveCommonPrefix(this._toFilterTextReplacement(reader), model);
    const updatedRange = this._updatedRange.read(reader);
    if (!updatedRange || !this.inlineCompletion.range.getStartPosition().equals(updatedRange.getStartPosition()) || cursorPosition.lineNumber !== minimizedReplacement.range.startLineNumber) {
      return false;
    }
    const originalValue = model.getValueInRange(minimizedReplacement.range, EndOfLinePreference.LF);
    const filterText = minimizedReplacement.text;
    const cursorPosIndex = Math.max(0, cursorPosition.column - minimizedReplacement.range.startColumn);
    let filterTextBefore = filterText.substring(0, cursorPosIndex);
    let filterTextAfter = filterText.substring(cursorPosIndex);
    let originalValueBefore = originalValue.substring(0, cursorPosIndex);
    let originalValueAfter = originalValue.substring(cursorPosIndex);
    const originalValueIndent = model.getLineIndentColumn(minimizedReplacement.range.startLineNumber);
    if (minimizedReplacement.range.startColumn <= originalValueIndent) {
      originalValueBefore = originalValueBefore.trimStart();
      if (originalValueBefore.length === 0) {
        originalValueAfter = originalValueAfter.trimStart();
      }
      filterTextBefore = filterTextBefore.trimStart();
      if (filterTextBefore.length === 0) {
        filterTextAfter = filterTextAfter.trimStart();
      }
    }
    return filterTextBefore.startsWith(originalValueBefore) && !!matchesSubString(originalValueAfter, filterTextAfter);
  }
  canBeReused(model, position) {
    const updatedRange = this._updatedRange.read(void 0);
    const result = !!updatedRange && updatedRange.containsPosition(position) && this.isVisible(model, position, void 0) && TextLength.ofRange(updatedRange).isGreaterThanOrEqualTo(TextLength.ofRange(this.inlineCompletion.range));
    return result;
  }
  _toFilterTextReplacement(reader) {
    return new SingleTextEdit(this._updatedRange.read(reader) ?? emptyRange, this.inlineCompletion.filterText);
  }
}
const emptyRange = new Range(1, 1, 1, 1);
export {
  InlineCompletionWithUpdatedRange,
  InlineCompletionsSource,
  UpToDateInlineCompletions
};
//# sourceMappingURL=inlineCompletionsSource.js.map
