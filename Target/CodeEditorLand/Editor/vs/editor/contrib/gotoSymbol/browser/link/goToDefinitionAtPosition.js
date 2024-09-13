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
import {
  createCancelablePromise
} from "../../../../../base/common/async.js";
import { onUnexpectedError } from "../../../../../base/common/errors.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import "./goToDefinitionAtPosition.css";
import * as nls from "../../../../../nls.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import {
  MouseTargetType
} from "../../../../browser/editorBrowser.js";
import {
  EditorContributionInstantiation,
  registerEditorContribution
} from "../../../../browser/editorExtensions.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { Range } from "../../../../common/core/range.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { ModelDecorationInjectedTextOptions } from "../../../../common/model/textModel.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { ITextModelService } from "../../../../common/services/resolverService.js";
import {
  CodeEditorStateFlag,
  EditorState
} from "../../../editorState/browser/editorState.js";
import { PeekContext } from "../../../peekView/browser/peekView.js";
import { DefinitionAction } from "../goToCommands.js";
import { getDefinitionsAtPosition } from "../goToSymbol.js";
import {
  ClickLinkGesture
} from "./clickLinkGesture.js";
let GotoDefinitionAtPositionEditorContribution = class {
  constructor(editor, textModelResolverService, languageService, languageFeaturesService) {
    this.textModelResolverService = textModelResolverService;
    this.languageService = languageService;
    this.languageFeaturesService = languageFeaturesService;
    this.editor = editor;
    this.linkDecorations = this.editor.createDecorationsCollection();
    const linkGesture = new ClickLinkGesture(editor);
    this.toUnhook.add(linkGesture);
    this.toUnhook.add(linkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
      this.startFindDefinitionFromMouse(mouseEvent, keyboardEvent ?? void 0);
    }));
    this.toUnhook.add(linkGesture.onExecute((mouseEvent) => {
      if (this.isEnabled(mouseEvent)) {
        this.gotoDefinition(mouseEvent.target.position, mouseEvent.hasSideBySideModifier).catch((error) => {
          onUnexpectedError(error);
        }).finally(() => {
          this.removeLinkDecorations();
        });
      }
    }));
    this.toUnhook.add(linkGesture.onCancel(() => {
      this.removeLinkDecorations();
      this.currentWordAtPosition = null;
    }));
  }
  static {
    __name(this, "GotoDefinitionAtPositionEditorContribution");
  }
  static ID = "editor.contrib.gotodefinitionatposition";
  static MAX_SOURCE_PREVIEW_LINES = 8;
  editor;
  toUnhook = new DisposableStore();
  toUnhookForKeyboard = new DisposableStore();
  linkDecorations;
  currentWordAtPosition = null;
  previousPromise = null;
  static get(editor) {
    return editor.getContribution(
      GotoDefinitionAtPositionEditorContribution.ID
    );
  }
  async startFindDefinitionFromCursor(position) {
    await this.startFindDefinition(position);
    this.toUnhookForKeyboard.add(
      this.editor.onDidChangeCursorPosition(() => {
        this.currentWordAtPosition = null;
        this.removeLinkDecorations();
        this.toUnhookForKeyboard.clear();
      })
    );
    this.toUnhookForKeyboard.add(
      this.editor.onKeyDown((e) => {
        if (e) {
          this.currentWordAtPosition = null;
          this.removeLinkDecorations();
          this.toUnhookForKeyboard.clear();
        }
      })
    );
  }
  startFindDefinitionFromMouse(mouseEvent, withKey) {
    if (mouseEvent.target.type === MouseTargetType.CONTENT_WIDGET && this.linkDecorations.length > 0) {
      return;
    }
    if (!this.editor.hasModel() || !this.isEnabled(mouseEvent, withKey)) {
      this.currentWordAtPosition = null;
      this.removeLinkDecorations();
      return;
    }
    const position = mouseEvent.target.position;
    this.startFindDefinition(position);
  }
  async startFindDefinition(position) {
    this.toUnhookForKeyboard.clear();
    const word = position ? this.editor.getModel()?.getWordAtPosition(position) : null;
    if (!word) {
      this.currentWordAtPosition = null;
      this.removeLinkDecorations();
      return;
    }
    if (this.currentWordAtPosition && this.currentWordAtPosition.startColumn === word.startColumn && this.currentWordAtPosition.endColumn === word.endColumn && this.currentWordAtPosition.word === word.word) {
      return;
    }
    this.currentWordAtPosition = word;
    const state = new EditorState(
      this.editor,
      CodeEditorStateFlag.Position | CodeEditorStateFlag.Value | CodeEditorStateFlag.Selection | CodeEditorStateFlag.Scroll
    );
    if (this.previousPromise) {
      this.previousPromise.cancel();
      this.previousPromise = null;
    }
    this.previousPromise = createCancelablePromise(
      (token) => this.findDefinition(position, token)
    );
    let results;
    try {
      results = await this.previousPromise;
    } catch (error) {
      onUnexpectedError(error);
      return;
    }
    if (!results || !results.length || !state.validate(this.editor)) {
      this.removeLinkDecorations();
      return;
    }
    const linkRange = results[0].originSelectionRange ? Range.lift(results[0].originSelectionRange) : new Range(
      position.lineNumber,
      word.startColumn,
      position.lineNumber,
      word.endColumn
    );
    if (results.length > 1) {
      let combinedRange = linkRange;
      for (const { originSelectionRange } of results) {
        if (originSelectionRange) {
          combinedRange = Range.plusRange(
            combinedRange,
            originSelectionRange
          );
        }
      }
      this.addDecoration(
        combinedRange,
        new MarkdownString().appendText(
          nls.localize(
            "multipleResults",
            "Click to show {0} definitions.",
            results.length
          )
        )
      );
    } else {
      const result = results[0];
      if (!result.uri) {
        return;
      }
      this.textModelResolverService.createModelReference(result.uri).then((ref) => {
        if (!ref.object || !ref.object.textEditorModel) {
          ref.dispose();
          return;
        }
        const {
          object: { textEditorModel }
        } = ref;
        const { startLineNumber } = result.range;
        if (startLineNumber < 1 || startLineNumber > textEditorModel.getLineCount()) {
          ref.dispose();
          return;
        }
        const previewValue = this.getPreviewValue(
          textEditorModel,
          startLineNumber,
          result
        );
        const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(
          textEditorModel.uri
        );
        this.addDecoration(
          linkRange,
          previewValue ? new MarkdownString().appendCodeblock(
            languageId ? languageId : "",
            previewValue
          ) : void 0
        );
        ref.dispose();
      });
    }
  }
  getPreviewValue(textEditorModel, startLineNumber, result) {
    let rangeToUse = result.range;
    const numberOfLinesInRange = rangeToUse.endLineNumber - rangeToUse.startLineNumber;
    if (numberOfLinesInRange >= GotoDefinitionAtPositionEditorContribution.MAX_SOURCE_PREVIEW_LINES) {
      rangeToUse = this.getPreviewRangeBasedOnIndentation(
        textEditorModel,
        startLineNumber
      );
    }
    const previewValue = this.stripIndentationFromPreviewRange(
      textEditorModel,
      startLineNumber,
      rangeToUse
    );
    return previewValue;
  }
  stripIndentationFromPreviewRange(textEditorModel, startLineNumber, previewRange) {
    const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
    let minIndent = startIndent;
    for (let endLineNumber = startLineNumber + 1; endLineNumber < previewRange.endLineNumber; endLineNumber++) {
      const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
      minIndent = Math.min(minIndent, endIndent);
    }
    const previewValue = textEditorModel.getValueInRange(previewRange).replace(new RegExp(`^\\s{${minIndent - 1}}`, "gm"), "").trim();
    return previewValue;
  }
  getPreviewRangeBasedOnIndentation(textEditorModel, startLineNumber) {
    const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
    const maxLineNumber = Math.min(
      textEditorModel.getLineCount(),
      startLineNumber + GotoDefinitionAtPositionEditorContribution.MAX_SOURCE_PREVIEW_LINES
    );
    let endLineNumber = startLineNumber + 1;
    for (; endLineNumber < maxLineNumber; endLineNumber++) {
      const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
      if (startIndent === endIndent) {
        break;
      }
    }
    return new Range(startLineNumber, 1, endLineNumber + 1, 1);
  }
  addDecoration(range, hoverMessage) {
    const newDecorations = {
      range,
      options: {
        description: "goto-definition-link",
        inlineClassName: "goto-definition-link",
        hoverMessage
      }
    };
    this.linkDecorations.set([newDecorations]);
  }
  removeLinkDecorations() {
    this.linkDecorations.clear();
  }
  isEnabled(mouseEvent, withKey) {
    return this.editor.hasModel() && mouseEvent.isLeftClick && mouseEvent.isNoneOrSingleMouseDown && mouseEvent.target.type === MouseTargetType.CONTENT_TEXT && !(mouseEvent.target.detail.injectedText?.options instanceof ModelDecorationInjectedTextOptions) && (mouseEvent.hasTriggerModifier || (withKey ? withKey.keyCodeIsTriggerKey : false)) && this.languageFeaturesService.definitionProvider.has(
      this.editor.getModel()
    );
  }
  findDefinition(position, token) {
    const model = this.editor.getModel();
    if (!model) {
      return Promise.resolve(null);
    }
    return getDefinitionsAtPosition(
      this.languageFeaturesService.definitionProvider,
      model,
      position,
      false,
      token
    );
  }
  gotoDefinition(position, openToSide) {
    this.editor.setPosition(position);
    return this.editor.invokeWithinContext((accessor) => {
      const canPeek = !openToSide && this.editor.getOption(EditorOption.definitionLinkOpensInPeek) && !this.isInPeekEditor(accessor);
      const action = new DefinitionAction(
        { openToSide, openInPeek: canPeek, muteMessage: true },
        {
          title: { value: "", original: "" },
          id: "",
          precondition: void 0
        }
      );
      return action.run(accessor);
    });
  }
  isInPeekEditor(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    return PeekContext.inPeekEditor.getValue(contextKeyService);
  }
  dispose() {
    this.toUnhook.dispose();
    this.toUnhookForKeyboard.dispose();
  }
};
GotoDefinitionAtPositionEditorContribution = __decorateClass([
  __decorateParam(1, ITextModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, ILanguageFeaturesService)
], GotoDefinitionAtPositionEditorContribution);
registerEditorContribution(
  GotoDefinitionAtPositionEditorContribution.ID,
  GotoDefinitionAtPositionEditorContribution,
  EditorContributionInstantiation.BeforeFirstInteraction
);
export {
  GotoDefinitionAtPositionEditorContribution
};
//# sourceMappingURL=goToDefinitionAtPosition.js.map
