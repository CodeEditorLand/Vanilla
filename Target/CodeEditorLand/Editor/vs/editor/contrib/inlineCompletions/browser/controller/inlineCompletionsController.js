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
import { createStyleSheetFromObservable } from "../../../../../base/browser/domObservable.js";
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { timeout } from "../../../../../base/common/async.js";
import { cancelOnDispose } from "../../../../../base/common/cancellation.js";
import { readHotReloadableExport } from "../../../../../base/common/hotReloadHelpers.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { ITransaction, autorun, constObservable, derived, derivedDisposable, derivedObservableWithCache, mapObservableArrayCached, observableFromEvent, observableSignal, runOnChange, runOnChangeWithStore, transaction, waitForState } from "../../../../../base/common/observable.js";
import { isUndefined } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { CoreEditingCommands } from "../../../../browser/coreCommands.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { observableCodeEditor } from "../../../../browser/observableCodeEditor.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { CursorChangeReason } from "../../../../common/cursorEvents.js";
import { ILanguageFeatureDebounceService } from "../../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { InlineCompletionsHintsWidget, InlineSuggestionHintsContentWidget } from "../hintsWidget/inlineCompletionsHintsWidget.js";
import { InlineCompletionsModel } from "../model/inlineCompletionsModel.js";
import { SuggestWidgetAdaptor } from "../model/suggestWidgetAdaptor.js";
import { convertItemsToStableObservables } from "../utils.js";
import { GhostTextView } from "../view/ghostTextView.js";
import { inlineSuggestCommitId } from "./commandIds.js";
import { InlineCompletionContextKeys } from "./inlineCompletionContextKeys.js";
let InlineCompletionsController = class extends Disposable {
  constructor(editor, _instantiationService, _contextKeyService, _configurationService, _commandService, _debounceService, _languageFeaturesService, _accessibilitySignalService, _keybindingService, _accessibilityService) {
    super();
    this.editor = editor;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._commandService = _commandService;
    this._debounceService = _debounceService;
    this._languageFeaturesService = _languageFeaturesService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._keybindingService = _keybindingService;
    this._accessibilityService = _accessibilityService;
    this._register(new InlineCompletionContextKeys(this._contextKeyService, this.model));
    this._register(runOnChange(this._editorObs.onDidType, (_value, _changes) => {
      if (this._enabled.get()) {
        this.model.get()?.trigger();
      }
    }));
    this._register(this._commandService.onDidExecuteCommand((e) => {
      const commands = /* @__PURE__ */ new Set([
        CoreEditingCommands.Tab.id,
        CoreEditingCommands.DeleteLeft.id,
        CoreEditingCommands.DeleteRight.id,
        inlineSuggestCommitId,
        "acceptSelectedSuggestion"
      ]);
      if (commands.has(e.commandId) && editor.hasTextFocus() && this._enabled.get()) {
        this._editorObs.forceUpdate((tx) => {
          this.model.get()?.trigger(tx);
        });
      }
    }));
    this._register(runOnChange(this._editorObs.selections, (_value, _, changes) => {
      if (changes.some((e) => e.reason === CursorChangeReason.Explicit || e.source === "api")) {
        this.model.get()?.stop();
      }
    }));
    this._register(this.editor.onDidBlurEditorWidget(() => {
      if (this._contextKeyService.getContextKeyValue("accessibleViewIsShown") || this._configurationService.getValue("editor.inlineSuggest.keepOnBlur") || editor.getOption(EditorOption.inlineSuggest).keepOnBlur || InlineSuggestionHintsContentWidget.dropDownVisible) {
        return;
      }
      transaction((tx) => {
        this.model.get()?.stop(tx);
      });
    }));
    this._register(autorun((reader) => {
      const state = this.model.read(reader)?.state.read(reader);
      if (state?.suggestItem) {
        if (state.primaryGhostText.lineCount >= 2) {
          this._suggestWidgetAdaptor.forceRenderingAbove();
        }
      } else {
        this._suggestWidgetAdaptor.stopForceRenderingAbove();
      }
    }));
    this._register(toDisposable(() => {
      this._suggestWidgetAdaptor.stopForceRenderingAbove();
    }));
    const currentInlineCompletionBySemanticId = derivedObservableWithCache(this, (reader, last) => {
      const model = this.model.read(reader);
      const state = model?.state.read(reader);
      if (this._suggestWidgetSelectedItem.get()) {
        return last;
      }
      return state?.inlineCompletion?.semanticId;
    });
    this._register(runOnChangeWithStore(derived((reader) => {
      this._playAccessibilitySignal.read(reader);
      currentInlineCompletionBySemanticId.read(reader);
      return {};
    }), async (_value, _, _deltas, store) => {
      const model = this.model.get();
      const state = model?.state.get();
      if (!state || !model) {
        return;
      }
      const lineText = model.textModel.getLineContent(state.primaryGhostText.lineNumber);
      await timeout(50, cancelOnDispose(store));
      await waitForState(this._suggestWidgetSelectedItem, isUndefined, () => false, cancelOnDispose(store));
      await this._accessibilitySignalService.playSignal(AccessibilitySignal.inlineSuggestion);
      if (this.editor.getOption(EditorOption.screenReaderAnnounceInlineSuggestion)) {
        this._provideScreenReaderUpdate(state.primaryGhostText.renderForScreenReader(lineText));
      }
    }));
    this._register(new InlineCompletionsHintsWidget(this.editor, this.model, this._instantiationService));
    this._register(createStyleSheetFromObservable(derived((reader) => {
      const fontFamily = this._fontFamily.read(reader);
      if (fontFamily === "" || fontFamily === "default") {
        return "";
      }
      return `
.monaco-editor .ghost-text-decoration,
.monaco-editor .ghost-text-decoration-preview,
.monaco-editor .ghost-text {
	font-family: ${fontFamily};
}`;
    })));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("accessibility.verbosity.inlineCompletions")) {
        this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this._configurationService.getValue("accessibility.verbosity.inlineCompletions") });
      }
    }));
    this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this._configurationService.getValue("accessibility.verbosity.inlineCompletions") });
  }
  static {
    __name(this, "InlineCompletionsController");
  }
  static ID = "editor.contrib.inlineCompletionsController";
  static get(editor) {
    return editor.getContribution(InlineCompletionsController.ID);
  }
  _editorObs = observableCodeEditor(this.editor);
  _positions = derived(this, (reader) => this._editorObs.selections.read(reader)?.map((s) => s.getEndPosition()) ?? [new Position(1, 1)]);
  _suggestWidgetAdaptor = this._register(new SuggestWidgetAdaptor(
    this.editor,
    () => {
      this._editorObs.forceUpdate();
      return this.model.get()?.selectedInlineCompletion.get()?.toSingleTextEdit(void 0);
    },
    (item) => this._editorObs.forceUpdate((_tx) => {
      this.model.get()?.handleSuggestAccepted(item);
    })
  ));
  _suggestWidgetSelectedItem = observableFromEvent(this, (cb) => this._suggestWidgetAdaptor.onDidSelectedItemChange(() => {
    this._editorObs.forceUpdate((_tx) => cb(void 0));
  }), () => this._suggestWidgetAdaptor.selectedItem);
  _enabledInConfig = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(EditorOption.inlineSuggest).enabled);
  _isScreenReaderEnabled = observableFromEvent(this, this._accessibilityService.onDidChangeScreenReaderOptimized, () => this._accessibilityService.isScreenReaderOptimized());
  _editorDictationInProgress = observableFromEvent(
    this,
    this._contextKeyService.onDidChangeContext,
    () => this._contextKeyService.getContext(this.editor.getDomNode()).getValue("editorDictation.inProgress") === true
  );
  _enabled = derived(this, (reader) => this._enabledInConfig.read(reader) && (!this._isScreenReaderEnabled.read(reader) || !this._editorDictationInProgress.read(reader)));
  _debounceValue = this._debounceService.for(
    this._languageFeaturesService.inlineCompletionsProvider,
    "InlineCompletionsDebounce",
    { min: 50, max: 50 }
  );
  model = derivedDisposable(this, (reader) => {
    if (this._editorObs.isReadonly.read(reader)) {
      return void 0;
    }
    const textModel = this._editorObs.model.read(reader);
    if (!textModel) {
      return void 0;
    }
    const model = this._instantiationService.createInstance(
      InlineCompletionsModel,
      textModel,
      this._suggestWidgetSelectedItem,
      this._editorObs.versionId,
      this._positions,
      this._debounceValue,
      observableFromEvent(this.editor.onDidChangeConfiguration, () => this.editor.getOption(EditorOption.suggest).preview),
      observableFromEvent(this.editor.onDidChangeConfiguration, () => this.editor.getOption(EditorOption.suggest).previewMode),
      observableFromEvent(this.editor.onDidChangeConfiguration, () => this.editor.getOption(EditorOption.inlineSuggest).mode),
      this._enabled
    );
    return model;
  }).recomputeInitiallyAndOnChange(this._store);
  _ghostTexts = derived(this, (reader) => {
    const model = this.model.read(reader);
    return model?.ghostTexts.read(reader) ?? [];
  });
  _stablizedGhostTexts = convertItemsToStableObservables(this._ghostTexts, this._store);
  _ghostTextWidgets = mapObservableArrayCached(
    this,
    this._stablizedGhostTexts,
    (ghostText, store) => derivedDisposable(
      (reader) => this._instantiationService.createInstance(readHotReloadableExport(GhostTextView, reader), this.editor, {
        ghostText,
        minReservedLineCount: constObservable(0),
        targetTextModel: this.model.map((v) => v?.textModel)
      })
    ).recomputeInitiallyAndOnChange(store)
  ).recomputeInitiallyAndOnChange(this._store);
  _playAccessibilitySignal = observableSignal(this);
  _fontFamily = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(EditorOption.inlineSuggest).fontFamily);
  playAccessibilitySignal(tx) {
    this._playAccessibilitySignal.trigger(tx);
  }
  _provideScreenReaderUpdate(content) {
    const accessibleViewShowing = this._contextKeyService.getContextKeyValue("accessibleViewIsShown");
    const accessibleViewKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleView");
    let hint;
    if (!accessibleViewShowing && accessibleViewKeybinding && this.editor.getOption(EditorOption.inlineCompletionsAccessibilityVerbose)) {
      hint = localize("showAccessibleViewHint", "Inspect this in the accessible view ({0})", accessibleViewKeybinding.getAriaLabel());
    }
    alert(hint ? content + ", " + hint : content);
  }
  shouldShowHoverAt(range) {
    const ghostText = this.model.get()?.primaryGhostText.get();
    if (ghostText) {
      return ghostText.parts.some((p) => range.containsPosition(new Position(ghostText.lineNumber, p.column)));
    }
    return false;
  }
  shouldShowHoverAtViewZone(viewZoneId) {
    return this._ghostTextWidgets.get()[0]?.get().ownsViewZone(viewZoneId) ?? false;
  }
  hide() {
    transaction((tx) => {
      this.model.get()?.stop(tx);
    });
  }
};
InlineCompletionsController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, ILanguageFeatureDebounceService),
  __decorateParam(6, ILanguageFeaturesService),
  __decorateParam(7, IAccessibilitySignalService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, IAccessibilityService)
], InlineCompletionsController);
export {
  InlineCompletionsController
};
//# sourceMappingURL=inlineCompletionsController.js.map
