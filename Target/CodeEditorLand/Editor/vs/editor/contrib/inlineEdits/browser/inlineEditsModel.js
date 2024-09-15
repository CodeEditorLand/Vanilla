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
import { timeout } from "../../../../base/common/async.js";
import {
  CancellationToken,
  cancelOnDispose
} from "../../../../base/common/cancellation.js";
import {
  itemsEquals,
  structuralEquals
} from "../../../../base/common/equals.js";
import { BugIndicatingError } from "../../../../base/common/errors.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import {
  ObservablePromise,
  derived,
  derivedDisposable,
  derivedHandleChanges,
  derivedOpts,
  disposableObservableValue,
  observableSignal,
  observableValue,
  recomputeInitiallyAndOnChange,
  subtransaction
} from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { IDiffProviderFactoryService } from "../../../browser/widget/diffEditor/diffProviderFactoryService.js";
import { LineRange } from "../../../common/core/lineRange.js";
import {
  InlineCompletionTriggerKind
} from "../../../common/languages.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IModelService } from "../../../common/services/model.js";
import {
  provideInlineCompletions
} from "../../inlineCompletions/browser/model/provideInlineCompletions.js";
import { InlineEdit } from "./inlineEditsWidget.js";
let InlineEditsModel = class extends Disposable {
  constructor(textModel, _textModelVersionId, _selection, _debounceValue, languageFeaturesService, _diffProviderFactoryService, _modelService) {
    super();
    this.textModel = textModel;
    this._textModelVersionId = _textModelVersionId;
    this._selection = _selection;
    this._debounceValue = _debounceValue;
    this.languageFeaturesService = languageFeaturesService;
    this._diffProviderFactoryService = _diffProviderFactoryService;
    this._modelService = _modelService;
    this._register(
      recomputeInitiallyAndOnChange(this._fetchInlineEditsPromise)
    );
  }
  static {
    __name(this, "InlineEditsModel");
  }
  static _modelId = 0;
  static _createUniqueUri() {
    return URI.from({
      scheme: "inline-edits",
      path: (/* @__PURE__ */ new Date()).toString() + String(InlineEditsModel._modelId++)
    });
  }
  _forceUpdateExplicitlySignal = observableSignal(this);
  // We use a semantic id to keep the same inline completion selected even if the provider reorders the completions.
  _selectedInlineCompletionId = observableValue(this, void 0);
  _isActive = observableValue(this, false);
  _originalModel = derivedDisposable(
    () => this._modelService.createModel(
      "",
      null,
      InlineEditsModel._createUniqueUri()
    )
  ).keepObserved(this._store);
  _modifiedModel = derivedDisposable(
    () => this._modelService.createModel(
      "",
      null,
      InlineEditsModel._createUniqueUri()
    )
  ).keepObserved(this._store);
  _pinnedRange = new TrackedRange(
    this.textModel,
    this._textModelVersionId
  );
  isPinned = this._pinnedRange.range.map((range) => !!range);
  userPrompt = observableValue(this, void 0);
  inlineEdit = derived(
    this,
    (reader) => {
      return this._inlineEdit.read(reader)?.promiseResult.read(reader)?.data;
    }
  );
  _inlineEdit = derived(this, (reader) => {
    const edit = this.selectedInlineEdit.read(reader);
    if (!edit) {
      return void 0;
    }
    const range = edit.inlineCompletion.range;
    if (edit.inlineCompletion.insertText.trim() === "") {
      return void 0;
    }
    let newLines = edit.inlineCompletion.insertText.split(/\r\n|\r|\n/);
    function removeIndentation(lines) {
      const indentation = lines[0].match(/^\s*/)?.[0] ?? "";
      return lines.map(
        (l) => l.replace(new RegExp("^" + indentation), "")
      );
    }
    __name(removeIndentation, "removeIndentation");
    newLines = removeIndentation(newLines);
    const existing = this.textModel.getValueInRange(range);
    let existingLines = existing.split(/\r\n|\r|\n/);
    existingLines = removeIndentation(existingLines);
    this._originalModel.get().setValue(existingLines.join("\n"));
    this._modifiedModel.get().setValue(newLines.join("\n"));
    const d = this._diffProviderFactoryService.createDiffProvider({
      diffAlgorithm: "advanced"
    });
    return ObservablePromise.fromFn(async () => {
      const result = await d.computeDiff(
        this._originalModel.get(),
        this._modifiedModel.get(),
        {
          computeMoves: false,
          ignoreTrimWhitespace: false,
          maxComputationTimeMs: 1e3
        },
        CancellationToken.None
      );
      if (result.identical) {
        return void 0;
      }
      return new InlineEdit(
        LineRange.fromRangeInclusive(range),
        removeIndentation(newLines),
        result.changes
      );
    });
  });
  _fetchStore = this._register(new DisposableStore());
  _inlineEditsFetchResult = disposableObservableValue(this, void 0);
  _inlineEdits = derivedOpts(
    { owner: this, equalsFn: structuralEquals },
    (reader) => {
      return this._inlineEditsFetchResult.read(reader)?.completions.map((c) => new InlineEditData(c)) ?? [];
    }
  );
  _fetchInlineEditsPromise = derivedHandleChanges(
    {
      owner: this,
      createEmptyChangeSummary: /* @__PURE__ */ __name(() => ({
        inlineCompletionTriggerKind: InlineCompletionTriggerKind.Automatic
      }), "createEmptyChangeSummary"),
      handleChange: /* @__PURE__ */ __name((ctx, changeSummary) => {
        if (ctx.didChange(this._forceUpdateExplicitlySignal)) {
          changeSummary.inlineCompletionTriggerKind = InlineCompletionTriggerKind.Explicit;
        }
        return true;
      }, "handleChange")
    },
    async (reader, changeSummary) => {
      this._fetchStore.clear();
      this._forceUpdateExplicitlySignal.read(reader);
      this._textModelVersionId.read(reader);
      function mapValue(value, fn) {
        return fn(value);
      }
      __name(mapValue, "mapValue");
      const selection = this._pinnedRange.range.read(reader) ?? mapValue(
        this._selection.read(reader),
        (v) => v.isEmpty() ? void 0 : v
      );
      if (!selection) {
        this._inlineEditsFetchResult.set(void 0, void 0);
        this.userPrompt.set(void 0, void 0);
        return void 0;
      }
      const context = {
        triggerKind: changeSummary.inlineCompletionTriggerKind,
        selectedSuggestionInfo: void 0,
        userPrompt: this.userPrompt.read(reader)
      };
      const token = cancelOnDispose(this._fetchStore);
      await timeout(200, token);
      const result = await provideInlineCompletions(
        this.languageFeaturesService.inlineCompletionsProvider,
        selection,
        this.textModel,
        context,
        token
      );
      if (token.isCancellationRequested) {
        return;
      }
      this._inlineEditsFetchResult.set(result, void 0);
    }
  );
  async trigger(tx) {
    this._isActive.set(true, tx);
    await this._fetchInlineEditsPromise.get();
  }
  async triggerExplicitly(tx) {
    subtransaction(tx, (tx2) => {
      this._isActive.set(true, tx2);
      this._forceUpdateExplicitlySignal.trigger(tx2);
    });
    await this._fetchInlineEditsPromise.get();
  }
  stop(tx) {
    subtransaction(tx, (tx2) => {
      this.userPrompt.set(void 0, tx2);
      this._isActive.set(false, tx2);
      this._inlineEditsFetchResult.set(void 0, tx2);
      this._pinnedRange.setRange(void 0, tx2);
    });
  }
  _filteredInlineEditItems = derivedOpts(
    { owner: this, equalsFn: itemsEquals() },
    (reader) => {
      return this._inlineEdits.read(reader);
    }
  );
  selectedInlineCompletionIndex = derived(
    this,
    (reader) => {
      const selectedInlineCompletionId = this._selectedInlineCompletionId.read(reader);
      const filteredCompletions = this._filteredInlineEditItems.read(reader);
      const idx = this._selectedInlineCompletionId === void 0 ? -1 : filteredCompletions.findIndex(
        (v) => v.semanticId === selectedInlineCompletionId
      );
      if (idx === -1) {
        this._selectedInlineCompletionId.set(void 0, void 0);
        return 0;
      }
      return idx;
    }
  );
  selectedInlineEdit = derived(
    this,
    (reader) => {
      const filteredCompletions = this._filteredInlineEditItems.read(reader);
      const idx = this.selectedInlineCompletionIndex.read(reader);
      return filteredCompletions[idx];
    }
  );
  activeCommands = derivedOpts(
    { owner: this, equalsFn: itemsEquals() },
    (r) => this.selectedInlineEdit.read(r)?.inlineCompletion.source.inlineCompletions.commands ?? []
  );
  async _deltaSelectedInlineCompletionIndex(delta) {
    await this.triggerExplicitly();
    const completions = this._filteredInlineEditItems.get() || [];
    if (completions.length > 0) {
      const newIdx = (this.selectedInlineCompletionIndex.get() + delta + completions.length) % completions.length;
      this._selectedInlineCompletionId.set(
        completions[newIdx].semanticId,
        void 0
      );
    } else {
      this._selectedInlineCompletionId.set(void 0, void 0);
    }
  }
  async next() {
    await this._deltaSelectedInlineCompletionIndex(1);
  }
  async previous() {
    await this._deltaSelectedInlineCompletionIndex(-1);
  }
  togglePin() {
    if (this.isPinned.get()) {
      this._pinnedRange.setRange(void 0, void 0);
    } else {
      this._pinnedRange.setRange(this._selection.get(), void 0);
    }
  }
  async accept(editor) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    const edit = this.selectedInlineEdit.get();
    if (!edit) {
      return;
    }
    editor.pushUndoStop();
    editor.executeEdits("inlineSuggestion.accept", [
      edit.inlineCompletion.toSingleTextEdit().toSingleEditOperation()
    ]);
    this.stop();
  }
};
InlineEditsModel = __decorateClass([
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IDiffProviderFactoryService),
  __decorateParam(6, IModelService)
], InlineEditsModel);
class InlineEditData {
  constructor(inlineCompletion) {
    this.inlineCompletion = inlineCompletion;
  }
  static {
    __name(this, "InlineEditData");
  }
  semanticId = this.inlineCompletion.hash();
}
class TrackedRange extends Disposable {
  constructor(_textModel, _versionId) {
    super();
    this._textModel = _textModel;
    this._versionId = _versionId;
    this._register(
      toDisposable(() => {
        this._textModel.deltaDecorations(this._decorations.get(), []);
      })
    );
  }
  static {
    __name(this, "TrackedRange");
  }
  _decorations = observableValue(this, []);
  setRange(range, tx) {
    this._decorations.set(
      this._textModel.deltaDecorations(
        this._decorations.get(),
        range ? [{ range, options: { description: "trackedRange" } }] : []
      ),
      tx
    );
  }
  range = derived(this, (reader) => {
    this._versionId.read(reader);
    const deco = this._decorations.read(reader)[0];
    if (!deco) {
      return null;
    }
    return this._textModel.getDecorationRange(deco) ?? null;
  });
}
export {
  InlineEditsModel
};
//# sourceMappingURL=inlineEditsModel.js.map
