var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Permutation, compareBy } from "../../../../../base/common/arrays.js";
import { mapFindFirst } from "../../../../../base/common/arraysFind.js";
import { itemsEquals } from "../../../../../base/common/equals.js";
import {
  BugIndicatingError,
  onUnexpectedError,
  onUnexpectedExternalError
} from "../../../../../base/common/errors.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import {
  autorun,
  derived,
  derivedHandleChanges,
  derivedOpts,
  observableSignal,
  observableValue,
  recomputeInitiallyAndOnChange,
  subtransaction,
  transaction
} from "../../../../../base/common/observable.js";
import {
  commonPrefixLength,
  splitLinesIncludeSeparators
} from "../../../../../base/common/strings.js";
import { isDefined } from "../../../../../base/common/types.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { EditOperation } from "../../../../common/core/editOperation.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { Selection } from "../../../../common/core/selection.js";
import { SingleTextEdit, TextEdit } from "../../../../common/core/textEdit.js";
import { TextLength } from "../../../../common/core/textLength.js";
import { ScrollType } from "../../../../common/editorCommon.js";
import {
  InlineCompletionTriggerKind,
  PartialAcceptTriggerKind
} from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import {
  EndOfLinePreference
} from "../../../../common/model.js";
import { SnippetController2 } from "../../../snippet/browser/snippetController2.js";
import { addPositions, subtractPositions } from "../utils.js";
import {
  GhostText,
  ghostTextOrReplacementEquals,
  ghostTextsOrReplacementsEqual
} from "./ghostText.js";
import {
  InlineCompletionsSource
} from "./inlineCompletionsSource.js";
import {
  computeGhostText,
  singleTextEditAugments,
  singleTextRemoveCommonPrefix
} from "./singleTextEdit.js";
let InlineCompletionsModel = class extends Disposable {
  constructor(textModel, selectedSuggestItem, _textModelVersionId, _positions, _debounceValue, _suggestPreviewEnabled, _suggestPreviewMode, _inlineSuggestMode, _enabled, _instantiationService, _commandService, _languageConfigurationService) {
    super();
    this.textModel = textModel;
    this.selectedSuggestItem = selectedSuggestItem;
    this._textModelVersionId = _textModelVersionId;
    this._positions = _positions;
    this._debounceValue = _debounceValue;
    this._suggestPreviewEnabled = _suggestPreviewEnabled;
    this._suggestPreviewMode = _suggestPreviewMode;
    this._inlineSuggestMode = _inlineSuggestMode;
    this._enabled = _enabled;
    this._instantiationService = _instantiationService;
    this._commandService = _commandService;
    this._languageConfigurationService = _languageConfigurationService;
    this._register(recomputeInitiallyAndOnChange(this._fetchInlineCompletionsPromise));
    let lastItem;
    this._register(autorun((reader) => {
      const item = this.state.read(reader);
      const completion = item?.inlineCompletion;
      if (completion?.semanticId !== lastItem?.semanticId) {
        lastItem = completion;
        if (completion) {
          const i = completion.inlineCompletion;
          const src = i.source;
          src.provider.handleItemDidShow?.(src.inlineCompletions, i.sourceInlineCompletion, i.insertText);
        }
      }
    }));
  }
  _source = this._register(
    this._instantiationService.createInstance(
      InlineCompletionsSource,
      this.textModel,
      this._textModelVersionId,
      this._debounceValue
    )
  );
  _isActive = observableValue(this, false);
  _forceUpdateExplicitlySignal = observableSignal(this);
  // We use a semantic id to keep the same inline completion selected even if the provider reorders the completions.
  _selectedInlineCompletionId = observableValue(this, void 0);
  _primaryPosition = derived(
    this,
    (reader) => this._positions.read(reader)[0] ?? new Position(1, 1)
  );
  _isAcceptingPartially = false;
  get isAcceptingPartially() {
    return this._isAcceptingPartially;
  }
  _preserveCurrentCompletionReasons = /* @__PURE__ */ new Set([
    1 /* Redo */,
    0 /* Undo */,
    2 /* AcceptWord */
  ]);
  _getReason(e) {
    if (e?.isUndoing) {
      return 0 /* Undo */;
    }
    if (e?.isRedoing) {
      return 1 /* Redo */;
    }
    if (this.isAcceptingPartially) {
      return 2 /* AcceptWord */;
    }
    return 3 /* Other */;
  }
  _fetchInlineCompletionsPromise = derivedHandleChanges(
    {
      owner: this,
      createEmptyChangeSummary: () => ({
        preserveCurrentCompletion: false,
        inlineCompletionTriggerKind: InlineCompletionTriggerKind.Automatic
      }),
      handleChange: (ctx, changeSummary) => {
        if (ctx.didChange(this._textModelVersionId) && this._preserveCurrentCompletionReasons.has(
          this._getReason(ctx.change)
        )) {
          changeSummary.preserveCurrentCompletion = true;
        } else if (ctx.didChange(this._forceUpdateExplicitlySignal)) {
          changeSummary.inlineCompletionTriggerKind = InlineCompletionTriggerKind.Explicit;
        }
        return true;
      }
    },
    (reader, changeSummary) => {
      this._forceUpdateExplicitlySignal.read(reader);
      const shouldUpdate = this._enabled.read(reader) && this.selectedSuggestItem.read(reader) || this._isActive.read(reader);
      if (!shouldUpdate) {
        this._source.cancelUpdate();
        return void 0;
      }
      this._textModelVersionId.read(reader);
      const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.get();
      const suggestItem = this.selectedSuggestItem.read(reader);
      if (suggestWidgetInlineCompletions && !suggestItem) {
        const inlineCompletions = this._source.inlineCompletions.get();
        transaction((tx) => {
          if (!inlineCompletions || suggestWidgetInlineCompletions.request.versionId > inlineCompletions.request.versionId) {
            this._source.inlineCompletions.set(
              suggestWidgetInlineCompletions.clone(),
              tx
            );
          }
          this._source.clearSuggestWidgetInlineCompletions(tx);
        });
      }
      const cursorPosition = this._primaryPosition.read(reader);
      const context = {
        triggerKind: changeSummary.inlineCompletionTriggerKind,
        selectedSuggestionInfo: suggestItem?.toSelectedSuggestionInfo()
      };
      const itemToPreserveCandidate = this.selectedInlineCompletion.get();
      const itemToPreserve = changeSummary.preserveCurrentCompletion || itemToPreserveCandidate?.forwardStable ? itemToPreserveCandidate : void 0;
      return this._source.fetch(cursorPosition, context, itemToPreserve);
    }
  );
  async trigger(tx) {
    this._isActive.set(true, tx);
    await this._fetchInlineCompletionsPromise.get();
  }
  async triggerExplicitly(tx) {
    subtransaction(tx, (tx2) => {
      this._isActive.set(true, tx2);
      this._forceUpdateExplicitlySignal.trigger(tx2);
    });
    await this._fetchInlineCompletionsPromise.get();
  }
  stop(tx) {
    subtransaction(tx, (tx2) => {
      this._isActive.set(false, tx2);
      this._source.clear(tx2);
    });
  }
  _filteredInlineCompletionItems = derivedOpts(
    { owner: this, equalsFn: itemsEquals() },
    (reader) => {
      const c = this._source.inlineCompletions.read(reader);
      if (!c) {
        return [];
      }
      const cursorPosition = this._primaryPosition.read(reader);
      const filteredCompletions = c.inlineCompletions.filter(
        (c2) => c2.isVisible(this.textModel, cursorPosition, reader)
      );
      return filteredCompletions;
    }
  );
  selectedInlineCompletionIndex = derived(
    this,
    (reader) => {
      const selectedInlineCompletionId = this._selectedInlineCompletionId.read(reader);
      const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
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
  selectedInlineCompletion = derived(this, (reader) => {
    const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
    const idx = this.selectedInlineCompletionIndex.read(reader);
    return filteredCompletions[idx];
  });
  activeCommands = derivedOpts(
    { owner: this, equalsFn: itemsEquals() },
    (r) => this.selectedInlineCompletion.read(r)?.inlineCompletion.source.inlineCompletions.commands ?? []
  );
  lastTriggerKind = this._source.inlineCompletions.map(
    this,
    (v) => v?.request.context.triggerKind
  );
  inlineCompletionsCount = derived(
    this,
    (reader) => {
      if (this.lastTriggerKind.read(reader) === InlineCompletionTriggerKind.Explicit) {
        return this._filteredInlineCompletionItems.read(reader).length;
      } else {
        return void 0;
      }
    }
  );
  state = derivedOpts(
    {
      owner: this,
      equalsFn: (a, b) => {
        if (!a || !b) {
          return a === b;
        }
        return ghostTextsOrReplacementsEqual(a.ghostTexts, b.ghostTexts) && a.inlineCompletion === b.inlineCompletion && a.suggestItem === b.suggestItem;
      }
    },
    (reader) => {
      const model = this.textModel;
      const suggestItem = this.selectedSuggestItem.read(reader);
      if (suggestItem) {
        const suggestCompletionEdit = singleTextRemoveCommonPrefix(
          suggestItem.toSingleTextEdit(),
          model
        );
        const augmentation = this._computeAugmentation(
          suggestCompletionEdit,
          reader
        );
        const isSuggestionPreviewEnabled = this._suggestPreviewEnabled.read(reader);
        if (!isSuggestionPreviewEnabled && !augmentation) {
          return void 0;
        }
        const fullEdit = augmentation?.edit ?? suggestCompletionEdit;
        const fullEditPreviewLength = augmentation ? augmentation.edit.text.length - suggestCompletionEdit.text.length : 0;
        const mode = this._suggestPreviewMode.read(reader);
        const positions = this._positions.read(reader);
        const edits = [
          fullEdit,
          ...getSecondaryEdits(this.textModel, positions, fullEdit)
        ];
        const ghostTexts = edits.map(
          (edit, idx) => computeGhostText(
            edit,
            model,
            mode,
            positions[idx],
            fullEditPreviewLength
          )
        ).filter(isDefined);
        const primaryGhostText = ghostTexts[0] ?? new GhostText(fullEdit.range.endLineNumber, []);
        return {
          edits,
          primaryGhostText,
          ghostTexts,
          inlineCompletion: augmentation?.completion,
          suggestItem
        };
      } else {
        if (!this._isActive.read(reader)) {
          return void 0;
        }
        const inlineCompletion = this.selectedInlineCompletion.read(reader);
        if (!inlineCompletion) {
          return void 0;
        }
        const replacement = inlineCompletion.toSingleTextEdit(reader);
        const mode = this._inlineSuggestMode.read(reader);
        const positions = this._positions.read(reader);
        const edits = [
          replacement,
          ...getSecondaryEdits(
            this.textModel,
            positions,
            replacement
          )
        ];
        const ghostTexts = edits.map(
          (edit, idx) => computeGhostText(edit, model, mode, positions[idx], 0)
        ).filter(isDefined);
        if (!ghostTexts[0]) {
          return void 0;
        }
        return {
          edits,
          primaryGhostText: ghostTexts[0],
          ghostTexts,
          inlineCompletion,
          suggestItem: void 0
        };
      }
    }
  );
  _computeAugmentation(suggestCompletion, reader) {
    const model = this.textModel;
    const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.read(reader);
    const candidateInlineCompletions = suggestWidgetInlineCompletions ? suggestWidgetInlineCompletions.inlineCompletions : [this.selectedInlineCompletion.read(reader)].filter(isDefined);
    const augmentedCompletion = mapFindFirst(
      candidateInlineCompletions,
      (completion) => {
        let r = completion.toSingleTextEdit(reader);
        r = singleTextRemoveCommonPrefix(
          r,
          model,
          Range.fromPositions(
            r.range.getStartPosition(),
            suggestCompletion.range.getEndPosition()
          )
        );
        return singleTextEditAugments(r, suggestCompletion) ? { completion, edit: r } : void 0;
      }
    );
    return augmentedCompletion;
  }
  ghostTexts = derivedOpts(
    { owner: this, equalsFn: ghostTextsOrReplacementsEqual },
    (reader) => {
      const v = this.state.read(reader);
      if (!v) {
        return void 0;
      }
      return v.ghostTexts;
    }
  );
  primaryGhostText = derivedOpts(
    { owner: this, equalsFn: ghostTextOrReplacementEquals },
    (reader) => {
      const v = this.state.read(reader);
      if (!v) {
        return void 0;
      }
      return v?.primaryGhostText;
    }
  );
  async _deltaSelectedInlineCompletionIndex(delta) {
    await this.triggerExplicitly();
    const completions = this._filteredInlineCompletionItems.get() || [];
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
  async accept(editor) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    const state = this.state.get();
    if (!state || state.primaryGhostText.isEmpty() || !state.inlineCompletion) {
      return;
    }
    const completion = state.inlineCompletion.toInlineCompletion(void 0);
    if (completion.command) {
      completion.source.addRef();
    }
    editor.pushUndoStop();
    if (completion.snippetInfo) {
      editor.executeEdits("inlineSuggestion.accept", [
        EditOperation.replace(completion.range, ""),
        ...completion.additionalTextEdits
      ]);
      editor.setPosition(
        completion.snippetInfo.range.getStartPosition(),
        "inlineCompletionAccept"
      );
      SnippetController2.get(editor)?.insert(
        completion.snippetInfo.snippet,
        { undoStopBefore: false }
      );
    } else {
      const edits = state.edits;
      const selections = getEndPositionsAfterApplying(edits).map(
        (p) => Selection.fromPositions(p)
      );
      editor.executeEdits("inlineSuggestion.accept", [
        ...edits.map(
          (edit) => EditOperation.replace(edit.range, edit.text)
        ),
        ...completion.additionalTextEdits
      ]);
      editor.setSelections(selections, "inlineCompletionAccept");
    }
    this.stop();
    if (completion.command) {
      await this._commandService.executeCommand(
        completion.command.id,
        ...completion.command.arguments || []
      ).then(void 0, onUnexpectedExternalError);
      completion.source.removeRef();
    }
  }
  async acceptNextWord(editor) {
    await this._acceptNext(
      editor,
      (pos, text) => {
        const langId = this.textModel.getLanguageIdAtPosition(
          pos.lineNumber,
          pos.column
        );
        const config = this._languageConfigurationService.getLanguageConfiguration(
          langId
        );
        const wordRegExp = new RegExp(
          config.wordDefinition.source,
          config.wordDefinition.flags.replace("g", "")
        );
        const m1 = text.match(wordRegExp);
        let acceptUntilIndexExclusive = 0;
        if (m1 && m1.index !== void 0) {
          if (m1.index === 0) {
            acceptUntilIndexExclusive = m1[0].length;
          } else {
            acceptUntilIndexExclusive = m1.index;
          }
        } else {
          acceptUntilIndexExclusive = text.length;
        }
        const wsRegExp = /\s+/g;
        const m2 = wsRegExp.exec(text);
        if (m2 && m2.index !== void 0) {
          if (m2.index + m2[0].length < acceptUntilIndexExclusive) {
            acceptUntilIndexExclusive = m2.index + m2[0].length;
          }
        }
        return acceptUntilIndexExclusive;
      },
      PartialAcceptTriggerKind.Word
    );
  }
  async acceptNextLine(editor) {
    await this._acceptNext(
      editor,
      (pos, text) => {
        const m = text.match(/\n/);
        if (m && m.index !== void 0) {
          return m.index + 1;
        }
        return text.length;
      },
      PartialAcceptTriggerKind.Line
    );
  }
  async _acceptNext(editor, getAcceptUntilIndex, kind) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    const state = this.state.get();
    if (!state || state.primaryGhostText.isEmpty() || !state.inlineCompletion) {
      return;
    }
    const ghostText = state.primaryGhostText;
    const completion = state.inlineCompletion.toInlineCompletion(void 0);
    if (completion.snippetInfo || completion.filterText !== completion.insertText) {
      await this.accept(editor);
      return;
    }
    const firstPart = ghostText.parts[0];
    const ghostTextPos = new Position(
      ghostText.lineNumber,
      firstPart.column
    );
    const ghostTextVal = firstPart.text;
    const acceptUntilIndexExclusive = getAcceptUntilIndex(
      ghostTextPos,
      ghostTextVal
    );
    if (acceptUntilIndexExclusive === ghostTextVal.length && ghostText.parts.length === 1) {
      this.accept(editor);
      return;
    }
    const partialGhostTextVal = ghostTextVal.substring(
      0,
      acceptUntilIndexExclusive
    );
    const positions = this._positions.get();
    const cursorPosition = positions[0];
    completion.source.addRef();
    try {
      this._isAcceptingPartially = true;
      try {
        editor.pushUndoStop();
        const replaceRange = Range.fromPositions(
          cursorPosition,
          ghostTextPos
        );
        const newText = editor.getModel().getValueInRange(replaceRange) + partialGhostTextVal;
        const primaryEdit = new SingleTextEdit(replaceRange, newText);
        const edits = [
          primaryEdit,
          ...getSecondaryEdits(
            this.textModel,
            positions,
            primaryEdit
          )
        ];
        const selections = getEndPositionsAfterApplying(edits).map(
          (p) => Selection.fromPositions(p)
        );
        editor.executeEdits(
          "inlineSuggestion.accept",
          edits.map(
            (edit) => EditOperation.replace(edit.range, edit.text)
          )
        );
        editor.setSelections(
          selections,
          "inlineCompletionPartialAccept"
        );
        editor.revealPositionInCenterIfOutsideViewport(
          editor.getPosition(),
          ScrollType.Immediate
        );
      } finally {
        this._isAcceptingPartially = false;
      }
      if (completion.source.provider.handlePartialAccept) {
        const acceptedRange = Range.fromPositions(
          completion.range.getStartPosition(),
          TextLength.ofText(partialGhostTextVal).addToPosition(
            ghostTextPos
          )
        );
        const text = editor.getModel().getValueInRange(acceptedRange, EndOfLinePreference.LF);
        completion.source.provider.handlePartialAccept(
          completion.source.inlineCompletions,
          completion.sourceInlineCompletion,
          text.length,
          { kind }
        );
      }
    } finally {
      completion.source.removeRef();
    }
  }
  handleSuggestAccepted(item) {
    const itemEdit = singleTextRemoveCommonPrefix(
      item.toSingleTextEdit(),
      this.textModel
    );
    const augmentedCompletion = this._computeAugmentation(
      itemEdit,
      void 0
    );
    if (!augmentedCompletion) {
      return;
    }
    const inlineCompletion = augmentedCompletion.completion.inlineCompletion;
    inlineCompletion.source.provider.handlePartialAccept?.(
      inlineCompletion.source.inlineCompletions,
      inlineCompletion.sourceInlineCompletion,
      itemEdit.text.length,
      {
        kind: PartialAcceptTriggerKind.Suggest
      }
    );
  }
};
InlineCompletionsModel = __decorateClass([
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, ILanguageConfigurationService)
], InlineCompletionsModel);
var VersionIdChangeReason = /* @__PURE__ */ ((VersionIdChangeReason2) => {
  VersionIdChangeReason2[VersionIdChangeReason2["Undo"] = 0] = "Undo";
  VersionIdChangeReason2[VersionIdChangeReason2["Redo"] = 1] = "Redo";
  VersionIdChangeReason2[VersionIdChangeReason2["AcceptWord"] = 2] = "AcceptWord";
  VersionIdChangeReason2[VersionIdChangeReason2["Other"] = 3] = "Other";
  return VersionIdChangeReason2;
})(VersionIdChangeReason || {});
function getSecondaryEdits(textModel, positions, primaryEdit) {
  if (positions.length === 1) {
    return [];
  }
  const primaryPosition = positions[0];
  const secondaryPositions = positions.slice(1);
  const primaryEditStartPosition = primaryEdit.range.getStartPosition();
  const primaryEditEndPosition = primaryEdit.range.getEndPosition();
  const replacedTextAfterPrimaryCursor = textModel.getValueInRange(
    Range.fromPositions(primaryPosition, primaryEditEndPosition)
  );
  const positionWithinTextEdit = subtractPositions(
    primaryPosition,
    primaryEditStartPosition
  );
  if (positionWithinTextEdit.lineNumber < 1) {
    onUnexpectedError(
      new BugIndicatingError(
        `positionWithinTextEdit line number should be bigger than 0.
			Invalid subtraction between ${primaryPosition.toString()} and ${primaryEditStartPosition.toString()}`
      )
    );
    return [];
  }
  const secondaryEditText = substringPos(
    primaryEdit.text,
    positionWithinTextEdit
  );
  return secondaryPositions.map((pos) => {
    const posEnd = addPositions(
      subtractPositions(pos, primaryEditStartPosition),
      primaryEditEndPosition
    );
    const textAfterSecondaryCursor = textModel.getValueInRange(
      Range.fromPositions(pos, posEnd)
    );
    const l = commonPrefixLength(
      replacedTextAfterPrimaryCursor,
      textAfterSecondaryCursor
    );
    const range = Range.fromPositions(pos, pos.delta(0, l));
    return new SingleTextEdit(range, secondaryEditText);
  });
}
function substringPos(text, pos) {
  let subtext = "";
  const lines = splitLinesIncludeSeparators(text);
  for (let i = pos.lineNumber - 1; i < lines.length; i++) {
    subtext += lines[i].substring(
      i === pos.lineNumber - 1 ? pos.column - 1 : 0
    );
  }
  return subtext;
}
function getEndPositionsAfterApplying(edits) {
  const sortPerm = Permutation.createSortPermutation(
    edits,
    compareBy((e) => e.range, Range.compareRangesUsingStarts)
  );
  const edit = new TextEdit(sortPerm.apply(edits));
  const sortedNewRanges = edit.getNewRanges();
  const newRanges = sortPerm.inverse().apply(sortedNewRanges);
  return newRanges.map((range) => range.getEndPosition());
}
export {
  InlineCompletionsModel,
  VersionIdChangeReason,
  getSecondaryEdits
};
