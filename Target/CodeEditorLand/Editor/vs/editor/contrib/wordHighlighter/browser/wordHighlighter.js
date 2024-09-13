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
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import {
  Delayer,
  createCancelablePromise,
  first
} from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import {
  onUnexpectedError,
  onUnexpectedExternalError
} from "../../../../base/common/errors.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas, matchesScheme } from "../../../../base/common/network.js";
import { isEqual } from "../../../../base/common/resources.js";
import * as nls from "../../../../nls.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  isDiffEditor
} from "../../../browser/editorBrowser.js";
import {
  EditorAction,
  EditorContributionInstantiation,
  registerEditorAction,
  registerEditorContribution,
  registerModelAndPositionCommand
} from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Range } from "../../../common/core/range.js";
import {
  CursorChangeReason
} from "../../../common/cursorEvents.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { registerEditorFeature } from "../../../common/editorFeatures.js";
import { score } from "../../../common/languageSelector.js";
import {
  shouldSynchronizeModel
} from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { ITextModelService } from "../../../common/services/resolverService.js";
import { getHighlightDecorationOptions } from "./highlightDecorations.js";
import { TextualMultiDocumentHighlightFeature } from "./textualHighlightProvider.js";
const ctxHasWordHighlights = new RawContextKey(
  "hasWordHighlights",
  false
);
function getOccurrencesAtPosition(registry, model, position, token) {
  const orderedByScore = registry.ordered(model);
  return first(
    orderedByScore.map((provider) => () => {
      return Promise.resolve(
        provider.provideDocumentHighlights(model, position, token)
      ).then(void 0, onUnexpectedExternalError);
    }),
    (result) => result !== void 0 && result !== null
  ).then((result) => {
    if (result) {
      const map = new ResourceMap();
      map.set(model.uri, result);
      return map;
    }
    return new ResourceMap();
  });
}
__name(getOccurrencesAtPosition, "getOccurrencesAtPosition");
function getOccurrencesAcrossMultipleModels(registry, model, position, token, otherModels) {
  const orderedByScore = registry.ordered(model);
  return first(
    orderedByScore.map((provider) => () => {
      const filteredModels = otherModels.filter((otherModel) => {
        return shouldSynchronizeModel(otherModel);
      }).filter((otherModel) => {
        return score(
          provider.selector,
          otherModel.uri,
          otherModel.getLanguageId(),
          true,
          void 0,
          void 0
        ) > 0;
      });
      return Promise.resolve(
        provider.provideMultiDocumentHighlights(
          model,
          position,
          filteredModels,
          token
        )
      ).then(void 0, onUnexpectedExternalError);
    }),
    (result) => result !== void 0 && result !== null
  );
}
__name(getOccurrencesAcrossMultipleModels, "getOccurrencesAcrossMultipleModels");
class OccurenceAtPositionRequest {
  constructor(_model, _selection, _wordSeparators) {
    this._model = _model;
    this._selection = _selection;
    this._wordSeparators = _wordSeparators;
    this._wordRange = this._getCurrentWordRange(_model, _selection);
    this._result = null;
  }
  static {
    __name(this, "OccurenceAtPositionRequest");
  }
  _wordRange;
  _result;
  get result() {
    if (!this._result) {
      this._result = createCancelablePromise(
        (token) => this._compute(
          this._model,
          this._selection,
          this._wordSeparators,
          token
        )
      );
    }
    return this._result;
  }
  _getCurrentWordRange(model, selection) {
    const word = model.getWordAtPosition(selection.getPosition());
    if (word) {
      return new Range(
        selection.startLineNumber,
        word.startColumn,
        selection.startLineNumber,
        word.endColumn
      );
    }
    return null;
  }
  isValid(model, selection, decorations) {
    const lineNumber = selection.startLineNumber;
    const startColumn = selection.startColumn;
    const endColumn = selection.endColumn;
    const currentWordRange = this._getCurrentWordRange(model, selection);
    let requestIsValid = Boolean(
      this._wordRange && this._wordRange.equalsRange(currentWordRange)
    );
    for (let i = 0, len = decorations.length; !requestIsValid && i < len; i++) {
      const range = decorations.getRange(i);
      if (range && range.startLineNumber === lineNumber) {
        if (range.startColumn <= startColumn && range.endColumn >= endColumn) {
          requestIsValid = true;
        }
      }
    }
    return requestIsValid;
  }
  cancel() {
    this.result.cancel();
  }
}
class SemanticOccurenceAtPositionRequest extends OccurenceAtPositionRequest {
  static {
    __name(this, "SemanticOccurenceAtPositionRequest");
  }
  _providers;
  constructor(model, selection, wordSeparators, providers) {
    super(model, selection, wordSeparators);
    this._providers = providers;
  }
  _compute(model, selection, wordSeparators, token) {
    return getOccurrencesAtPosition(
      this._providers,
      model,
      selection.getPosition(),
      token
    ).then((value) => {
      if (!value) {
        return new ResourceMap();
      }
      return value;
    });
  }
}
class MultiModelOccurenceRequest extends OccurenceAtPositionRequest {
  static {
    __name(this, "MultiModelOccurenceRequest");
  }
  _providers;
  _otherModels;
  constructor(model, selection, wordSeparators, providers, otherModels) {
    super(model, selection, wordSeparators);
    this._providers = providers;
    this._otherModels = otherModels;
  }
  _compute(model, selection, wordSeparators, token) {
    return getOccurrencesAcrossMultipleModels(
      this._providers,
      model,
      selection.getPosition(),
      token,
      this._otherModels
    ).then((value) => {
      if (!value) {
        return new ResourceMap();
      }
      return value;
    });
  }
}
function computeOccurencesAtPosition(registry, model, selection, wordSeparators) {
  return new SemanticOccurenceAtPositionRequest(
    model,
    selection,
    wordSeparators,
    registry
  );
}
__name(computeOccurencesAtPosition, "computeOccurencesAtPosition");
function computeOccurencesMultiModel(registry, model, selection, wordSeparators, otherModels) {
  return new MultiModelOccurenceRequest(
    model,
    selection,
    wordSeparators,
    registry,
    otherModels
  );
}
__name(computeOccurencesMultiModel, "computeOccurencesMultiModel");
registerModelAndPositionCommand(
  "_executeDocumentHighlights",
  async (accessor, model, position) => {
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const map = await getOccurrencesAtPosition(
      languageFeaturesService.documentHighlightProvider,
      model,
      position,
      CancellationToken.None
    );
    return map?.get(model.uri);
  }
);
let WordHighlighter = class {
  static {
    __name(this, "WordHighlighter");
  }
  editor;
  providers;
  multiDocumentProviders;
  model;
  decorations;
  toUnhook = new DisposableStore();
  textModelService;
  codeEditorService;
  occurrencesHighlight;
  workerRequestTokenId = 0;
  workerRequest;
  workerRequestCompleted = false;
  workerRequestValue = new ResourceMap();
  lastCursorPositionChangeTime = 0;
  renderDecorationsTimer = -1;
  _hasWordHighlights;
  _ignorePositionChangeEvent;
  runDelayer = this.toUnhook.add(
    new Delayer(25)
  );
  static storedDecorationIDs = new ResourceMap();
  static query = null;
  constructor(editor, providers, multiProviders, contextKeyService, textModelService, codeEditorService) {
    this.editor = editor;
    this.providers = providers;
    this.multiDocumentProviders = multiProviders;
    this.codeEditorService = codeEditorService;
    this.textModelService = textModelService;
    this._hasWordHighlights = ctxHasWordHighlights.bindTo(contextKeyService);
    this._ignorePositionChangeEvent = false;
    this.occurrencesHighlight = this.editor.getOption(
      EditorOption.occurrencesHighlight
    );
    this.model = this.editor.getModel();
    this.toUnhook.add(
      editor.onDidChangeCursorPosition(
        (e) => {
          if (this._ignorePositionChangeEvent) {
            return;
          }
          if (this.occurrencesHighlight === "off") {
            return;
          }
          this.runDelayer.trigger(() => {
            this._onPositionChanged(e);
          });
        }
      )
    );
    this.toUnhook.add(
      editor.onDidFocusEditorText((e) => {
        if (this.occurrencesHighlight === "off") {
          return;
        }
        if (!this.workerRequest) {
          this.runDelayer.trigger(() => {
            this._run();
          });
        }
      })
    );
    this.toUnhook.add(
      editor.onDidChangeModelContent((e) => {
        if (!matchesScheme(this.model.uri, "output")) {
          this._stopAll();
        }
      })
    );
    this.toUnhook.add(
      editor.onDidChangeModel((e) => {
        if (!e.newModelUrl && e.oldModelUrl) {
          this._stopSingular();
        } else if (WordHighlighter.query) {
          this._run();
        }
      })
    );
    this.toUnhook.add(
      editor.onDidChangeConfiguration((e) => {
        const newValue = this.editor.getOption(
          EditorOption.occurrencesHighlight
        );
        if (this.occurrencesHighlight !== newValue) {
          this.occurrencesHighlight = newValue;
          switch (newValue) {
            case "off":
              this._stopAll();
              break;
            case "singleFile":
              this._stopAll(
                WordHighlighter.query?.modelInfo?.modelURI
              );
              break;
            case "multiFile":
              if (WordHighlighter.query) {
                this._run(true);
              }
              break;
            default:
              console.warn(
                "Unknown occurrencesHighlight setting value:",
                newValue
              );
              break;
          }
        }
      })
    );
    this.toUnhook.add(
      editor.onDidBlurEditorWidget(() => {
        const activeEditor = this.codeEditorService.getFocusedCodeEditor();
        if (!activeEditor) {
          this._stopAll();
        } else if (activeEditor.getModel()?.uri.scheme === Schemas.vscodeNotebookCell && this.editor.getModel()?.uri.scheme !== Schemas.vscodeNotebookCell) {
          this._stopAll();
        }
      })
    );
    this.decorations = this.editor.createDecorationsCollection();
    this.workerRequestTokenId = 0;
    this.workerRequest = null;
    this.workerRequestCompleted = false;
    this.lastCursorPositionChangeTime = 0;
    this.renderDecorationsTimer = -1;
    if (WordHighlighter.query) {
      this._run();
    }
  }
  hasDecorations() {
    return this.decorations.length > 0;
  }
  restore() {
    if (this.occurrencesHighlight === "off") {
      return;
    }
    this.runDelayer.cancel();
    this._run();
  }
  stop() {
    if (this.occurrencesHighlight === "off") {
      return;
    }
    this._stopAll();
  }
  _getSortedHighlights() {
    return this.decorations.getRanges().sort(Range.compareRangesUsingStarts);
  }
  moveNext() {
    const highlights = this._getSortedHighlights();
    const index = highlights.findIndex(
      (range) => range.containsPosition(this.editor.getPosition())
    );
    const newIndex = (index + 1) % highlights.length;
    const dest = highlights[newIndex];
    try {
      this._ignorePositionChangeEvent = true;
      this.editor.setPosition(dest.getStartPosition());
      this.editor.revealRangeInCenterIfOutsideViewport(dest);
      const word = this._getWord();
      if (word) {
        const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
        alert(
          `${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`
        );
      }
    } finally {
      this._ignorePositionChangeEvent = false;
    }
  }
  moveBack() {
    const highlights = this._getSortedHighlights();
    const index = highlights.findIndex(
      (range) => range.containsPosition(this.editor.getPosition())
    );
    const newIndex = (index - 1 + highlights.length) % highlights.length;
    const dest = highlights[newIndex];
    try {
      this._ignorePositionChangeEvent = true;
      this.editor.setPosition(dest.getStartPosition());
      this.editor.revealRangeInCenterIfOutsideViewport(dest);
      const word = this._getWord();
      if (word) {
        const lineContent = this.editor.getModel().getLineContent(dest.startLineNumber);
        alert(
          `${lineContent}, ${newIndex + 1} of ${highlights.length} for '${word.word}'`
        );
      }
    } finally {
      this._ignorePositionChangeEvent = false;
    }
  }
  _removeSingleDecorations() {
    if (!this.editor.hasModel()) {
      return;
    }
    const currentDecorationIDs = WordHighlighter.storedDecorationIDs.get(
      this.editor.getModel().uri
    );
    if (!currentDecorationIDs) {
      return;
    }
    this.editor.removeDecorations(currentDecorationIDs);
    WordHighlighter.storedDecorationIDs.delete(this.editor.getModel().uri);
    if (this.decorations.length > 0) {
      this.decorations.clear();
      this._hasWordHighlights.set(false);
    }
  }
  _removeAllDecorations(preservedModel) {
    const currentEditors = this.codeEditorService.listCodeEditors();
    const deleteURI = [];
    for (const editor of currentEditors) {
      if (!editor.hasModel() || isEqual(editor.getModel().uri, preservedModel)) {
        continue;
      }
      const currentDecorationIDs = WordHighlighter.storedDecorationIDs.get(editor.getModel().uri);
      if (!currentDecorationIDs) {
        continue;
      }
      editor.removeDecorations(currentDecorationIDs);
      deleteURI.push(editor.getModel().uri);
      const editorHighlighterContrib = WordHighlighterContribution.get(editor);
      if (!editorHighlighterContrib?.wordHighlighter) {
        continue;
      }
      if (editorHighlighterContrib.wordHighlighter.decorations.length > 0) {
        editorHighlighterContrib.wordHighlighter.decorations.clear();
        editorHighlighterContrib.wordHighlighter.workerRequest = null;
        editorHighlighterContrib.wordHighlighter._hasWordHighlights.set(
          false
        );
      }
    }
    for (const uri of deleteURI) {
      WordHighlighter.storedDecorationIDs.delete(uri);
    }
  }
  _stopSingular() {
    this._removeSingleDecorations();
    if (this.editor.hasTextFocus()) {
      if (this.editor.getModel()?.uri.scheme !== Schemas.vscodeNotebookCell && WordHighlighter.query?.modelInfo?.modelURI.scheme !== Schemas.vscodeNotebookCell) {
        WordHighlighter.query = null;
        this._run();
      } else {
        if (WordHighlighter.query?.modelInfo) {
          WordHighlighter.query.modelInfo = null;
        }
      }
    }
    if (this.renderDecorationsTimer !== -1) {
      clearTimeout(this.renderDecorationsTimer);
      this.renderDecorationsTimer = -1;
    }
    if (this.workerRequest !== null) {
      this.workerRequest.cancel();
      this.workerRequest = null;
    }
    if (!this.workerRequestCompleted) {
      this.workerRequestTokenId++;
      this.workerRequestCompleted = true;
    }
  }
  _stopAll(preservedModel) {
    this._removeAllDecorations(preservedModel);
    if (this.renderDecorationsTimer !== -1) {
      clearTimeout(this.renderDecorationsTimer);
      this.renderDecorationsTimer = -1;
    }
    if (this.workerRequest !== null) {
      this.workerRequest.cancel();
      this.workerRequest = null;
    }
    if (!this.workerRequestCompleted) {
      this.workerRequestTokenId++;
      this.workerRequestCompleted = true;
    }
  }
  _onPositionChanged(e) {
    if (this.occurrencesHighlight === "off") {
      this._stopAll();
      return;
    }
    if (e.reason !== CursorChangeReason.Explicit && this.editor.getModel()?.uri.scheme !== Schemas.vscodeNotebookCell) {
      this._stopAll();
      return;
    }
    this._run();
  }
  _getWord() {
    const editorSelection = this.editor.getSelection();
    const lineNumber = editorSelection.startLineNumber;
    const startColumn = editorSelection.startColumn;
    if (this.model.isDisposed()) {
      return null;
    }
    return this.model.getWordAtPosition({
      lineNumber,
      column: startColumn
    });
  }
  getOtherModelsToHighlight(model) {
    if (!model) {
      return [];
    }
    const isNotebookEditor = model.uri.scheme === Schemas.vscodeNotebookCell;
    if (isNotebookEditor) {
      const currentModels2 = [];
      const currentEditors2 = this.codeEditorService.listCodeEditors();
      for (const editor of currentEditors2) {
        const tempModel = editor.getModel();
        if (tempModel && tempModel !== model && tempModel.uri.scheme === Schemas.vscodeNotebookCell) {
          currentModels2.push(tempModel);
        }
      }
      return currentModels2;
    }
    const currentModels = [];
    const currentEditors = this.codeEditorService.listCodeEditors();
    for (const editor of currentEditors) {
      if (!isDiffEditor(editor)) {
        continue;
      }
      const diffModel = editor.getModel();
      if (!diffModel) {
        continue;
      }
      if (model === diffModel.modified) {
        currentModels.push(diffModel.modified);
      }
    }
    if (currentModels.length) {
      return currentModels;
    }
    if (this.occurrencesHighlight === "singleFile") {
      return [];
    }
    for (const editor of currentEditors) {
      const tempModel = editor.getModel();
      const isValidModel = tempModel && tempModel !== model;
      if (isValidModel) {
        currentModels.push(tempModel);
      }
    }
    return currentModels;
  }
  async _run(multiFileConfigChange) {
    const hasTextFocus = this.editor.hasTextFocus();
    if (hasTextFocus) {
      const editorSelection = this.editor.getSelection();
      if (!editorSelection || editorSelection.startLineNumber !== editorSelection.endLineNumber) {
        WordHighlighter.query = null;
        this._stopAll();
        return;
      }
      const startColumn = editorSelection.startColumn;
      const endColumn = editorSelection.endColumn;
      const word = this._getWord();
      if (!word || word.startColumn > startColumn || word.endColumn < endColumn) {
        WordHighlighter.query = null;
        this._stopAll();
        return;
      }
      WordHighlighter.query = {
        modelInfo: {
          modelURI: this.model.uri,
          selection: editorSelection
        }
      };
    } else {
      if (!WordHighlighter.query) {
        this._stopAll();
        return;
      }
    }
    this.lastCursorPositionChangeTime = (/* @__PURE__ */ new Date()).getTime();
    if (isEqual(
      this.editor.getModel().uri,
      WordHighlighter.query.modelInfo?.modelURI
    )) {
      if (!multiFileConfigChange) {
        const currentModelDecorationRanges = this.decorations.getRanges();
        for (const storedRange of currentModelDecorationRanges) {
          if (storedRange.containsPosition(this.editor.getPosition())) {
            return;
          }
        }
      }
      this._stopAll(multiFileConfigChange ? this.model.uri : void 0);
      const myRequestId = ++this.workerRequestTokenId;
      this.workerRequestCompleted = false;
      const otherModelsToHighlight = this.getOtherModelsToHighlight(
        this.editor.getModel()
      );
      if (!WordHighlighter.query || !WordHighlighter.query.modelInfo) {
        return;
      }
      const queryModelRef = await this.textModelService.createModelReference(
        WordHighlighter.query.modelInfo.modelURI
      );
      const queryModel = queryModelRef.object.textEditorModel;
      this.workerRequest = this.computeWithModel(
        queryModel,
        WordHighlighter.query.modelInfo.selection,
        otherModelsToHighlight
      );
      this.workerRequest?.result.then((data) => {
        if (myRequestId === this.workerRequestTokenId) {
          this.workerRequestCompleted = true;
          this.workerRequestValue = data || [];
          this._beginRenderDecorations();
        }
      }, onUnexpectedError);
    } else if (this.model.uri.scheme === Schemas.vscodeNotebookCell) {
      const myRequestId = ++this.workerRequestTokenId;
      this.workerRequestCompleted = false;
      if (!WordHighlighter.query || !WordHighlighter.query.modelInfo) {
        return;
      }
      const queryModelRef = await this.textModelService.createModelReference(
        WordHighlighter.query.modelInfo.modelURI
      );
      const queryModel = queryModelRef.object.textEditorModel;
      this.workerRequest = this.computeWithModel(
        queryModel,
        WordHighlighter.query.modelInfo.selection,
        [this.model]
      );
      this.workerRequest?.result.then((data) => {
        if (myRequestId === this.workerRequestTokenId) {
          this.workerRequestCompleted = true;
          this.workerRequestValue = data || [];
          this._beginRenderDecorations();
        }
      }, onUnexpectedError);
    }
  }
  computeWithModel(model, selection, otherModels) {
    if (otherModels.length) {
      return computeOccurencesMultiModel(
        this.multiDocumentProviders,
        model,
        selection,
        this.editor.getOption(EditorOption.wordSeparators),
        otherModels
      );
    } else {
      return computeOccurencesAtPosition(
        this.providers,
        model,
        selection,
        this.editor.getOption(EditorOption.wordSeparators)
      );
    }
  }
  _beginRenderDecorations() {
    const currentTime = (/* @__PURE__ */ new Date()).getTime();
    const minimumRenderTime = this.lastCursorPositionChangeTime + 250;
    if (currentTime >= minimumRenderTime) {
      this.renderDecorationsTimer = -1;
      this.renderDecorations();
    } else {
      this.renderDecorationsTimer = setTimeout(() => {
        this.renderDecorations();
      }, minimumRenderTime - currentTime);
    }
  }
  renderDecorations() {
    this.renderDecorationsTimer = -1;
    const currentEditors = this.codeEditorService.listCodeEditors();
    for (const editor of currentEditors) {
      const editorHighlighterContrib = WordHighlighterContribution.get(editor);
      if (!editorHighlighterContrib) {
        continue;
      }
      const newDecorations = [];
      const uri = editor.getModel()?.uri;
      if (uri && this.workerRequestValue.has(uri)) {
        const oldDecorationIDs = WordHighlighter.storedDecorationIDs.get(uri);
        const newDocumentHighlights = this.workerRequestValue.get(uri);
        if (newDocumentHighlights) {
          for (const highlight of newDocumentHighlights) {
            if (!highlight.range) {
              continue;
            }
            newDecorations.push({
              range: highlight.range,
              options: getHighlightDecorationOptions(
                highlight.kind
              )
            });
          }
        }
        let newDecorationIDs = [];
        editor.changeDecorations((changeAccessor) => {
          newDecorationIDs = changeAccessor.deltaDecorations(
            oldDecorationIDs ?? [],
            newDecorations
          );
        });
        WordHighlighter.storedDecorationIDs = WordHighlighter.storedDecorationIDs.set(
          uri,
          newDecorationIDs
        );
        if (newDecorations.length > 0) {
          editorHighlighterContrib.wordHighlighter?.decorations.set(
            newDecorations
          );
          editorHighlighterContrib.wordHighlighter?._hasWordHighlights.set(
            true
          );
        }
      }
    }
    this.workerRequest = null;
  }
  dispose() {
    this._stopSingular();
    this.toUnhook.dispose();
  }
};
WordHighlighter = __decorateClass([
  __decorateParam(4, ITextModelService),
  __decorateParam(5, ICodeEditorService)
], WordHighlighter);
let WordHighlighterContribution = class extends Disposable {
  static {
    __name(this, "WordHighlighterContribution");
  }
  static ID = "editor.contrib.wordHighlighter";
  static get(editor) {
    return editor.getContribution(
      WordHighlighterContribution.ID
    );
  }
  _wordHighlighter;
  constructor(editor, contextKeyService, languageFeaturesService, codeEditorService, textModelService) {
    super();
    this._wordHighlighter = null;
    const createWordHighlighterIfPossible = /* @__PURE__ */ __name(() => {
      if (editor.hasModel() && !editor.getModel().isTooLargeForTokenization()) {
        this._wordHighlighter = new WordHighlighter(
          editor,
          languageFeaturesService.documentHighlightProvider,
          languageFeaturesService.multiDocumentHighlightProvider,
          contextKeyService,
          textModelService,
          codeEditorService
        );
      }
    }, "createWordHighlighterIfPossible");
    this._register(
      editor.onDidChangeModel((e) => {
        if (this._wordHighlighter) {
          if (!e.newModelUrl && e.oldModelUrl?.scheme !== Schemas.vscodeNotebookCell) {
            this.wordHighlighter?.stop();
          }
          this._wordHighlighter.dispose();
          this._wordHighlighter = null;
        }
        createWordHighlighterIfPossible();
      })
    );
    createWordHighlighterIfPossible();
  }
  get wordHighlighter() {
    return this._wordHighlighter;
  }
  saveViewState() {
    if (this._wordHighlighter && this._wordHighlighter.hasDecorations()) {
      return true;
    }
    return false;
  }
  moveNext() {
    this._wordHighlighter?.moveNext();
  }
  moveBack() {
    this._wordHighlighter?.moveBack();
  }
  restoreViewState(state) {
    if (this._wordHighlighter && state) {
      this._wordHighlighter.restore();
    }
  }
  stopHighlighting() {
    this._wordHighlighter?.stop();
  }
  dispose() {
    if (this._wordHighlighter) {
      this._wordHighlighter.dispose();
      this._wordHighlighter = null;
    }
    super.dispose();
  }
};
WordHighlighterContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, ITextModelService)
], WordHighlighterContribution);
class WordHighlightNavigationAction extends EditorAction {
  static {
    __name(this, "WordHighlightNavigationAction");
  }
  _isNext;
  constructor(next, opts) {
    super(opts);
    this._isNext = next;
  }
  run(accessor, editor) {
    const controller = WordHighlighterContribution.get(editor);
    if (!controller) {
      return;
    }
    if (this._isNext) {
      controller.moveNext();
    } else {
      controller.moveBack();
    }
  }
}
class NextWordHighlightAction extends WordHighlightNavigationAction {
  static {
    __name(this, "NextWordHighlightAction");
  }
  constructor() {
    super(true, {
      id: "editor.action.wordHighlight.next",
      label: nls.localize(
        "wordHighlight.next.label",
        "Go to Next Symbol Highlight"
      ),
      alias: "Go to Next Symbol Highlight",
      precondition: ctxHasWordHighlights,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyCode.F7,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
}
class PrevWordHighlightAction extends WordHighlightNavigationAction {
  static {
    __name(this, "PrevWordHighlightAction");
  }
  constructor() {
    super(false, {
      id: "editor.action.wordHighlight.prev",
      label: nls.localize(
        "wordHighlight.previous.label",
        "Go to Previous Symbol Highlight"
      ),
      alias: "Go to Previous Symbol Highlight",
      precondition: ctxHasWordHighlights,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.Shift | KeyCode.F7,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
}
class TriggerWordHighlightAction extends EditorAction {
  static {
    __name(this, "TriggerWordHighlightAction");
  }
  constructor() {
    super({
      id: "editor.action.wordHighlight.trigger",
      label: nls.localize(
        "wordHighlight.trigger.label",
        "Trigger Symbol Highlight"
      ),
      alias: "Trigger Symbol Highlight",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 0,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(accessor, editor, args) {
    const controller = WordHighlighterContribution.get(editor);
    if (!controller) {
      return;
    }
    controller.restoreViewState(true);
  }
}
registerEditorContribution(
  WordHighlighterContribution.ID,
  WordHighlighterContribution,
  EditorContributionInstantiation.Eager
);
registerEditorAction(NextWordHighlightAction);
registerEditorAction(PrevWordHighlightAction);
registerEditorAction(TriggerWordHighlightAction);
registerEditorFeature(TextualMultiDocumentHighlightFeature);
export {
  WordHighlighterContribution,
  getOccurrencesAcrossMultipleModels,
  getOccurrencesAtPosition
};
//# sourceMappingURL=wordHighlighter.js.map
