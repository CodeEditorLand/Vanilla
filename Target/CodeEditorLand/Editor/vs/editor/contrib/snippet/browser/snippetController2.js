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
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { assertType } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  EditorCommand,
  EditorContributionInstantiation,
  registerEditorCommand,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import { Position } from "../../../common/core/position.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import {
  CompletionItemKind
} from "../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { showSimpleSuggestions } from "../../suggest/browser/suggest.js";
import { SnippetSession } from "./snippetSession.js";
const _defaultOptions = {
  overwriteBefore: 0,
  overwriteAfter: 0,
  undoStopBefore: true,
  undoStopAfter: true,
  adjustWhitespace: true,
  clipboardText: void 0,
  overtypingCapturer: void 0
};
let SnippetController2 = class {
  constructor(_editor, _logService, _languageFeaturesService, contextKeyService, _languageConfigurationService) {
    this._editor = _editor;
    this._logService = _logService;
    this._languageFeaturesService = _languageFeaturesService;
    this._languageConfigurationService = _languageConfigurationService;
    this._inSnippet = SnippetController2.InSnippetMode.bindTo(contextKeyService);
    this._hasNextTabstop = SnippetController2.HasNextTabstop.bindTo(contextKeyService);
    this._hasPrevTabstop = SnippetController2.HasPrevTabstop.bindTo(contextKeyService);
  }
  static {
    __name(this, "SnippetController2");
  }
  static ID = "snippetController2";
  static get(editor) {
    return editor.getContribution(
      SnippetController2.ID
    );
  }
  static InSnippetMode = new RawContextKey(
    "inSnippetMode",
    false,
    localize(
      "inSnippetMode",
      "Whether the editor in current in snippet mode"
    )
  );
  static HasNextTabstop = new RawContextKey(
    "hasNextTabstop",
    false,
    localize(
      "hasNextTabstop",
      "Whether there is a next tab stop when in snippet mode"
    )
  );
  static HasPrevTabstop = new RawContextKey(
    "hasPrevTabstop",
    false,
    localize(
      "hasPrevTabstop",
      "Whether there is a previous tab stop when in snippet mode"
    )
  );
  _inSnippet;
  _hasNextTabstop;
  _hasPrevTabstop;
  _session;
  _snippetListener = new DisposableStore();
  _modelVersionId = -1;
  _currentChoice;
  _choiceCompletions;
  dispose() {
    this._inSnippet.reset();
    this._hasPrevTabstop.reset();
    this._hasNextTabstop.reset();
    this._session?.dispose();
    this._snippetListener.dispose();
  }
  apply(edits, opts) {
    try {
      this._doInsert(
        edits,
        typeof opts === "undefined" ? _defaultOptions : { ..._defaultOptions, ...opts }
      );
    } catch (e) {
      this.cancel();
      this._logService.error(e);
      this._logService.error("snippet_error");
      this._logService.error("insert_edits=", edits);
      this._logService.error(
        "existing_template=",
        this._session ? this._session._logInfo() : "<no_session>"
      );
    }
  }
  insert(template, opts) {
    try {
      this._doInsert(
        template,
        typeof opts === "undefined" ? _defaultOptions : { ..._defaultOptions, ...opts }
      );
    } catch (e) {
      this.cancel();
      this._logService.error(e);
      this._logService.error("snippet_error");
      this._logService.error("insert_template=", template);
      this._logService.error(
        "existing_template=",
        this._session ? this._session._logInfo() : "<no_session>"
      );
    }
  }
  _doInsert(template, opts) {
    if (!this._editor.hasModel()) {
      return;
    }
    this._snippetListener.clear();
    if (opts.undoStopBefore) {
      this._editor.getModel().pushStackElement();
    }
    if (this._session && typeof template !== "string") {
      this.cancel();
    }
    if (this._session) {
      assertType(typeof template === "string");
      this._session.merge(template, opts);
    } else {
      this._modelVersionId = this._editor.getModel().getAlternativeVersionId();
      this._session = new SnippetSession(
        this._editor,
        template,
        opts,
        this._languageConfigurationService
      );
      this._session.insert();
    }
    if (opts.undoStopAfter) {
      this._editor.getModel().pushStackElement();
    }
    if (this._session?.hasChoice) {
      const provider = {
        _debugDisplayName: "snippetChoiceCompletions",
        provideCompletionItems: /* @__PURE__ */ __name((model2, position) => {
          if (!this._session || model2 !== this._editor.getModel() || !Position.equals(this._editor.getPosition(), position)) {
            return void 0;
          }
          const { activeChoice } = this._session;
          if (!activeChoice || activeChoice.choice.options.length === 0) {
            return void 0;
          }
          const word = model2.getValueInRange(activeChoice.range);
          const isAnyOfOptions = Boolean(
            activeChoice.choice.options.find(
              (o) => o.value === word
            )
          );
          const suggestions = [];
          for (let i = 0; i < activeChoice.choice.options.length; i++) {
            const option = activeChoice.choice.options[i];
            suggestions.push({
              kind: CompletionItemKind.Value,
              label: option.value,
              insertText: option.value,
              sortText: "a".repeat(i + 1),
              range: activeChoice.range,
              filterText: isAnyOfOptions ? `${word}_${option.value}` : void 0,
              command: {
                id: "jumpToNextSnippetPlaceholder",
                title: localize(
                  "next",
                  "Go to next placeholder..."
                )
              }
            });
          }
          return { suggestions };
        }, "provideCompletionItems")
      };
      const model = this._editor.getModel();
      let registration;
      let isRegistered = false;
      const disable = /* @__PURE__ */ __name(() => {
        registration?.dispose();
        isRegistered = false;
      }, "disable");
      const enable = /* @__PURE__ */ __name(() => {
        if (!isRegistered) {
          registration = this._languageFeaturesService.completionProvider.register(
            {
              language: model.getLanguageId(),
              pattern: model.uri.fsPath,
              scheme: model.uri.scheme,
              exclusive: true
            },
            provider
          );
          this._snippetListener.add(registration);
          isRegistered = true;
        }
      }, "enable");
      this._choiceCompletions = { provider, enable, disable };
    }
    this._updateState();
    this._snippetListener.add(
      this._editor.onDidChangeModelContent(
        (e) => e.isFlush && this.cancel()
      )
    );
    this._snippetListener.add(
      this._editor.onDidChangeModel(() => this.cancel())
    );
    this._snippetListener.add(
      this._editor.onDidChangeCursorSelection(() => this._updateState())
    );
  }
  _updateState() {
    if (!this._session || !this._editor.hasModel()) {
      return;
    }
    if (this._modelVersionId === this._editor.getModel().getAlternativeVersionId()) {
      return this.cancel();
    }
    if (!this._session.hasPlaceholder) {
      return this.cancel();
    }
    if (this._session.isAtLastPlaceholder || !this._session.isSelectionWithinPlaceholders()) {
      this._editor.getModel().pushStackElement();
      return this.cancel();
    }
    this._inSnippet.set(true);
    this._hasPrevTabstop.set(!this._session.isAtFirstPlaceholder);
    this._hasNextTabstop.set(!this._session.isAtLastPlaceholder);
    this._handleChoice();
  }
  _handleChoice() {
    if (!this._session || !this._editor.hasModel()) {
      this._currentChoice = void 0;
      return;
    }
    const { activeChoice } = this._session;
    if (!activeChoice || !this._choiceCompletions) {
      this._choiceCompletions?.disable();
      this._currentChoice = void 0;
      return;
    }
    if (this._currentChoice !== activeChoice.choice) {
      this._currentChoice = activeChoice.choice;
      this._choiceCompletions.enable();
      queueMicrotask(() => {
        showSimpleSuggestions(
          this._editor,
          this._choiceCompletions.provider
        );
      });
    }
  }
  finish() {
    while (this._inSnippet.get()) {
      this.next();
    }
  }
  cancel(resetSelection = false) {
    this._inSnippet.reset();
    this._hasPrevTabstop.reset();
    this._hasNextTabstop.reset();
    this._snippetListener.clear();
    this._currentChoice = void 0;
    this._session?.dispose();
    this._session = void 0;
    this._modelVersionId = -1;
    if (resetSelection) {
      this._editor.setSelections([this._editor.getSelection()]);
    }
  }
  prev() {
    this._session?.prev();
    this._updateState();
  }
  next() {
    this._session?.next();
    this._updateState();
  }
  isInSnippet() {
    return Boolean(this._inSnippet.get());
  }
  getSessionEnclosingRange() {
    if (this._session) {
      return this._session.getEnclosingRange();
    }
    return void 0;
  }
};
SnippetController2 = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ILanguageConfigurationService)
], SnippetController2);
registerEditorContribution(
  SnippetController2.ID,
  SnippetController2,
  EditorContributionInstantiation.Lazy
);
const CommandCtor = EditorCommand.bindToContribution(
  SnippetController2.get
);
registerEditorCommand(
  new CommandCtor({
    id: "jumpToNextSnippetPlaceholder",
    precondition: ContextKeyExpr.and(
      SnippetController2.InSnippetMode,
      SnippetController2.HasNextTabstop
    ),
    handler: /* @__PURE__ */ __name((ctrl) => ctrl.next(), "handler"),
    kbOpts: {
      weight: KeybindingWeight.EditorContrib + 30,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: KeyCode.Tab
    }
  })
);
registerEditorCommand(
  new CommandCtor({
    id: "jumpToPrevSnippetPlaceholder",
    precondition: ContextKeyExpr.and(
      SnippetController2.InSnippetMode,
      SnippetController2.HasPrevTabstop
    ),
    handler: /* @__PURE__ */ __name((ctrl) => ctrl.prev(), "handler"),
    kbOpts: {
      weight: KeybindingWeight.EditorContrib + 30,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: KeyMod.Shift | KeyCode.Tab
    }
  })
);
registerEditorCommand(
  new CommandCtor({
    id: "leaveSnippet",
    precondition: SnippetController2.InSnippetMode,
    handler: /* @__PURE__ */ __name((ctrl) => ctrl.cancel(true), "handler"),
    kbOpts: {
      weight: KeybindingWeight.EditorContrib + 30,
      kbExpr: EditorContextKeys.textInputFocus,
      primary: KeyCode.Escape,
      secondary: [KeyMod.Shift | KeyCode.Escape]
    }
  })
);
registerEditorCommand(
  new CommandCtor({
    id: "acceptSnippet",
    precondition: SnippetController2.InSnippetMode,
    handler: /* @__PURE__ */ __name((ctrl) => ctrl.finish(), "handler")
    // kbOpts: {
    // 	weight: KeybindingWeight.EditorContrib + 30,
    // 	kbExpr: EditorContextKeys.textFocus,
    // 	primary: KeyCode.Enter,
    // }
  })
);
export {
  SnippetController2
};
//# sourceMappingURL=snippetController2.js.map
