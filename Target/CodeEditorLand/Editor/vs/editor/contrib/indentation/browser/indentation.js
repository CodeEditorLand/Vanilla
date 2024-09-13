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
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import * as strings from "../../../../base/common/strings.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorContributionInstantiation, IActionOptions, registerEditorAction, registerEditorContribution, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { ShiftCommand } from "../../../common/commands/shiftCommand.js";
import { EditorAutoIndentStrategy, EditorOption } from "../../../common/config/editorOptions.js";
import { ISingleEditOperation } from "../../../common/core/editOperation.js";
import { IRange, Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { ICommand, ICursorStateComputerData, IEditOperationBuilder, IEditorContribution } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { EndOfLineSequence, ITextModel } from "../../../common/model.js";
import { TextEdit } from "../../../common/languages.js";
import { StandardTokenType } from "../../../common/encodedTokenAttributes.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { IndentConsts } from "../../../common/languages/supports/indentRules.js";
import { IModelService } from "../../../common/services/model.js";
import * as indentUtils from "../common/indentUtils.js";
import * as nls from "../../../../nls.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { getGoodIndentForLine, getIndentMetadata } from "../../../common/languages/autoIndent.js";
import { getReindentEditOperations } from "../common/indentation.js";
import { getStandardTokenTypeAtPosition } from "../../../common/tokens/lineTokens.js";
import { Position } from "../../../common/core/position.js";
class IndentationToSpacesAction extends EditorAction {
  static {
    __name(this, "IndentationToSpacesAction");
  }
  static ID = "editor.action.indentationToSpaces";
  constructor() {
    super({
      id: IndentationToSpacesAction.ID,
      label: nls.localize("indentationToSpaces", "Convert Indentation to Spaces"),
      alias: "Convert Indentation to Spaces",
      precondition: EditorContextKeys.writable,
      metadata: {
        description: nls.localize2("indentationToSpacesDescription", "Convert the tab indentation to spaces.")
      }
    });
  }
  run(accessor, editor) {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const modelOpts = model.getOptions();
    const selection = editor.getSelection();
    if (!selection) {
      return;
    }
    const command = new IndentationToSpacesCommand(selection, modelOpts.tabSize);
    editor.pushUndoStop();
    editor.executeCommands(this.id, [command]);
    editor.pushUndoStop();
    model.updateOptions({
      insertSpaces: true
    });
  }
}
class IndentationToTabsAction extends EditorAction {
  static {
    __name(this, "IndentationToTabsAction");
  }
  static ID = "editor.action.indentationToTabs";
  constructor() {
    super({
      id: IndentationToTabsAction.ID,
      label: nls.localize("indentationToTabs", "Convert Indentation to Tabs"),
      alias: "Convert Indentation to Tabs",
      precondition: EditorContextKeys.writable,
      metadata: {
        description: nls.localize2("indentationToTabsDescription", "Convert the spaces indentation to tabs.")
      }
    });
  }
  run(accessor, editor) {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const modelOpts = model.getOptions();
    const selection = editor.getSelection();
    if (!selection) {
      return;
    }
    const command = new IndentationToTabsCommand(selection, modelOpts.tabSize);
    editor.pushUndoStop();
    editor.executeCommands(this.id, [command]);
    editor.pushUndoStop();
    model.updateOptions({
      insertSpaces: false
    });
  }
}
class ChangeIndentationSizeAction extends EditorAction {
  constructor(insertSpaces, displaySizeOnly, opts) {
    super(opts);
    this.insertSpaces = insertSpaces;
    this.displaySizeOnly = displaySizeOnly;
  }
  static {
    __name(this, "ChangeIndentationSizeAction");
  }
  run(accessor, editor) {
    const quickInputService = accessor.get(IQuickInputService);
    const modelService = accessor.get(IModelService);
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
    const modelOpts = model.getOptions();
    const picks = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
      id: n.toString(),
      label: n.toString(),
      // add description for tabSize value set in the configuration
      description: n === creationOpts.tabSize && n === modelOpts.tabSize ? nls.localize("configuredTabSize", "Configured Tab Size") : n === creationOpts.tabSize ? nls.localize("defaultTabSize", "Default Tab Size") : n === modelOpts.tabSize ? nls.localize("currentTabSize", "Current Tab Size") : void 0
    }));
    const autoFocusIndex = Math.min(model.getOptions().tabSize - 1, 7);
    setTimeout(
      () => {
        quickInputService.pick(picks, { placeHolder: nls.localize({ key: "selectTabWidth", comment: ["Tab corresponds to the tab key"] }, "Select Tab Size for Current File"), activeItem: picks[autoFocusIndex] }).then((pick) => {
          if (pick) {
            if (model && !model.isDisposed()) {
              const pickedVal = parseInt(pick.label, 10);
              if (this.displaySizeOnly) {
                model.updateOptions({
                  tabSize: pickedVal
                });
              } else {
                model.updateOptions({
                  tabSize: pickedVal,
                  indentSize: pickedVal,
                  insertSpaces: this.insertSpaces
                });
              }
            }
          }
        });
      },
      50
      /* quick input is sensitive to being opened so soon after another */
    );
  }
}
class IndentUsingTabs extends ChangeIndentationSizeAction {
  static {
    __name(this, "IndentUsingTabs");
  }
  static ID = "editor.action.indentUsingTabs";
  constructor() {
    super(false, false, {
      id: IndentUsingTabs.ID,
      label: nls.localize("indentUsingTabs", "Indent Using Tabs"),
      alias: "Indent Using Tabs",
      precondition: void 0,
      metadata: {
        description: nls.localize2("indentUsingTabsDescription", "Use indentation with tabs.")
      }
    });
  }
}
class IndentUsingSpaces extends ChangeIndentationSizeAction {
  static {
    __name(this, "IndentUsingSpaces");
  }
  static ID = "editor.action.indentUsingSpaces";
  constructor() {
    super(true, false, {
      id: IndentUsingSpaces.ID,
      label: nls.localize("indentUsingSpaces", "Indent Using Spaces"),
      alias: "Indent Using Spaces",
      precondition: void 0,
      metadata: {
        description: nls.localize2("indentUsingSpacesDescription", "Use indentation with spaces.")
      }
    });
  }
}
class ChangeTabDisplaySize extends ChangeIndentationSizeAction {
  static {
    __name(this, "ChangeTabDisplaySize");
  }
  static ID = "editor.action.changeTabDisplaySize";
  constructor() {
    super(true, true, {
      id: ChangeTabDisplaySize.ID,
      label: nls.localize("changeTabDisplaySize", "Change Tab Display Size"),
      alias: "Change Tab Display Size",
      precondition: void 0,
      metadata: {
        description: nls.localize2("changeTabDisplaySizeDescription", "Change the space size equivalent of the tab.")
      }
    });
  }
}
class DetectIndentation extends EditorAction {
  static {
    __name(this, "DetectIndentation");
  }
  static ID = "editor.action.detectIndentation";
  constructor() {
    super({
      id: DetectIndentation.ID,
      label: nls.localize("detectIndentation", "Detect Indentation from Content"),
      alias: "Detect Indentation from Content",
      precondition: void 0,
      metadata: {
        description: nls.localize2("detectIndentationDescription", "Detect the indentation from content.")
      }
    });
  }
  run(accessor, editor) {
    const modelService = accessor.get(IModelService);
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
    model.detectIndentation(creationOpts.insertSpaces, creationOpts.tabSize);
  }
}
class ReindentLinesAction extends EditorAction {
  static {
    __name(this, "ReindentLinesAction");
  }
  constructor() {
    super({
      id: "editor.action.reindentlines",
      label: nls.localize("editor.reindentlines", "Reindent Lines"),
      alias: "Reindent Lines",
      precondition: EditorContextKeys.writable,
      metadata: {
        description: nls.localize2("editor.reindentlinesDescription", "Reindent the lines of the editor.")
      }
    });
  }
  run(accessor, editor) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const edits = getReindentEditOperations(model, languageConfigurationService, 1, model.getLineCount());
    if (edits.length > 0) {
      editor.pushUndoStop();
      editor.executeEdits(this.id, edits);
      editor.pushUndoStop();
    }
  }
}
class ReindentSelectedLinesAction extends EditorAction {
  static {
    __name(this, "ReindentSelectedLinesAction");
  }
  constructor() {
    super({
      id: "editor.action.reindentselectedlines",
      label: nls.localize("editor.reindentselectedlines", "Reindent Selected Lines"),
      alias: "Reindent Selected Lines",
      precondition: EditorContextKeys.writable,
      metadata: {
        description: nls.localize2("editor.reindentselectedlinesDescription", "Reindent the selected lines of the editor.")
      }
    });
  }
  run(accessor, editor) {
    const languageConfigurationService = accessor.get(ILanguageConfigurationService);
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const selections = editor.getSelections();
    if (selections === null) {
      return;
    }
    const edits = [];
    for (const selection of selections) {
      let startLineNumber = selection.startLineNumber;
      let endLineNumber = selection.endLineNumber;
      if (startLineNumber !== endLineNumber && selection.endColumn === 1) {
        endLineNumber--;
      }
      if (startLineNumber === 1) {
        if (startLineNumber === endLineNumber) {
          continue;
        }
      } else {
        startLineNumber--;
      }
      const editOperations = getReindentEditOperations(model, languageConfigurationService, startLineNumber, endLineNumber);
      edits.push(...editOperations);
    }
    if (edits.length > 0) {
      editor.pushUndoStop();
      editor.executeEdits(this.id, edits);
      editor.pushUndoStop();
    }
  }
}
class AutoIndentOnPasteCommand {
  static {
    __name(this, "AutoIndentOnPasteCommand");
  }
  _edits;
  _initialSelection;
  _selectionId;
  constructor(edits, initialSelection) {
    this._initialSelection = initialSelection;
    this._edits = [];
    this._selectionId = null;
    for (const edit of edits) {
      if (edit.range && typeof edit.text === "string") {
        this._edits.push(edit);
      }
    }
  }
  getEditOperations(model, builder) {
    for (const edit of this._edits) {
      builder.addEditOperation(Range.lift(edit.range), edit.text);
    }
    let selectionIsSet = false;
    if (Array.isArray(this._edits) && this._edits.length === 1 && this._initialSelection.isEmpty()) {
      if (this._edits[0].range.startColumn === this._initialSelection.endColumn && this._edits[0].range.startLineNumber === this._initialSelection.endLineNumber) {
        selectionIsSet = true;
        this._selectionId = builder.trackSelection(this._initialSelection, true);
      } else if (this._edits[0].range.endColumn === this._initialSelection.startColumn && this._edits[0].range.endLineNumber === this._initialSelection.startLineNumber) {
        selectionIsSet = true;
        this._selectionId = builder.trackSelection(this._initialSelection, false);
      }
    }
    if (!selectionIsSet) {
      this._selectionId = builder.trackSelection(this._initialSelection);
    }
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._selectionId);
  }
}
let AutoIndentOnPaste = class {
  constructor(editor, _languageConfigurationService) {
    this.editor = editor;
    this._languageConfigurationService = _languageConfigurationService;
    this.callOnDispose.add(editor.onDidChangeConfiguration(() => this.update()));
    this.callOnDispose.add(editor.onDidChangeModel(() => this.update()));
    this.callOnDispose.add(editor.onDidChangeModelLanguage(() => this.update()));
  }
  static {
    __name(this, "AutoIndentOnPaste");
  }
  static ID = "editor.contrib.autoIndentOnPaste";
  callOnDispose = new DisposableStore();
  callOnModel = new DisposableStore();
  update() {
    this.callOnModel.clear();
    if (this.editor.getOption(EditorOption.autoIndent) < EditorAutoIndentStrategy.Full || this.editor.getOption(EditorOption.formatOnPaste)) {
      return;
    }
    if (!this.editor.hasModel()) {
      return;
    }
    this.callOnModel.add(this.editor.onDidPaste(({ range }) => {
      this.trigger(range);
    }));
  }
  trigger(range) {
    const selections = this.editor.getSelections();
    if (selections === null || selections.length > 1) {
      return;
    }
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    const containsOnlyWhitespace = this.rangeContainsOnlyWhitespaceCharacters(model, range);
    if (containsOnlyWhitespace) {
      return;
    }
    if (isStartOrEndInString(model, range)) {
      return;
    }
    if (!model.tokenization.isCheapToTokenize(range.getStartPosition().lineNumber)) {
      return;
    }
    const autoIndent = this.editor.getOption(EditorOption.autoIndent);
    const { tabSize, indentSize, insertSpaces } = model.getOptions();
    const textEdits = [];
    const indentConverter = {
      shiftIndent: /* @__PURE__ */ __name((indentation) => {
        return ShiftCommand.shiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
      }, "shiftIndent"),
      unshiftIndent: /* @__PURE__ */ __name((indentation) => {
        return ShiftCommand.unshiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
      }, "unshiftIndent")
    };
    let startLineNumber = range.startLineNumber;
    while (startLineNumber <= range.endLineNumber) {
      if (this.shouldIgnoreLine(model, startLineNumber)) {
        startLineNumber++;
        continue;
      }
      break;
    }
    if (startLineNumber > range.endLineNumber) {
      return;
    }
    let firstLineText = model.getLineContent(startLineNumber);
    if (!/\S/.test(firstLineText.substring(0, range.startColumn - 1))) {
      const indentOfFirstLine = getGoodIndentForLine(autoIndent, model, model.getLanguageId(), startLineNumber, indentConverter, this._languageConfigurationService);
      if (indentOfFirstLine !== null) {
        const oldIndentation = strings.getLeadingWhitespace(firstLineText);
        const newSpaceCnt = indentUtils.getSpaceCnt(indentOfFirstLine, tabSize);
        const oldSpaceCnt = indentUtils.getSpaceCnt(oldIndentation, tabSize);
        if (newSpaceCnt !== oldSpaceCnt) {
          const newIndent = indentUtils.generateIndent(newSpaceCnt, tabSize, insertSpaces);
          textEdits.push({
            range: new Range(startLineNumber, 1, startLineNumber, oldIndentation.length + 1),
            text: newIndent
          });
          firstLineText = newIndent + firstLineText.substring(oldIndentation.length);
        } else {
          const indentMetadata = getIndentMetadata(model, startLineNumber, this._languageConfigurationService);
          if (indentMetadata === 0 || indentMetadata === IndentConsts.UNINDENT_MASK) {
            return;
          }
        }
      }
    }
    const firstLineNumber = startLineNumber;
    while (startLineNumber < range.endLineNumber) {
      if (!/\S/.test(model.getLineContent(startLineNumber + 1))) {
        startLineNumber++;
        continue;
      }
      break;
    }
    if (startLineNumber !== range.endLineNumber) {
      const virtualModel = {
        tokenization: {
          getLineTokens: /* @__PURE__ */ __name((lineNumber) => {
            return model.tokenization.getLineTokens(lineNumber);
          }, "getLineTokens"),
          getLanguageId: /* @__PURE__ */ __name(() => {
            return model.getLanguageId();
          }, "getLanguageId"),
          getLanguageIdAtPosition: /* @__PURE__ */ __name((lineNumber, column) => {
            return model.getLanguageIdAtPosition(lineNumber, column);
          }, "getLanguageIdAtPosition")
        },
        getLineContent: /* @__PURE__ */ __name((lineNumber) => {
          if (lineNumber === firstLineNumber) {
            return firstLineText;
          } else {
            return model.getLineContent(lineNumber);
          }
        }, "getLineContent")
      };
      const indentOfSecondLine = getGoodIndentForLine(autoIndent, virtualModel, model.getLanguageId(), startLineNumber + 1, indentConverter, this._languageConfigurationService);
      if (indentOfSecondLine !== null) {
        const newSpaceCntOfSecondLine = indentUtils.getSpaceCnt(indentOfSecondLine, tabSize);
        const oldSpaceCntOfSecondLine = indentUtils.getSpaceCnt(strings.getLeadingWhitespace(model.getLineContent(startLineNumber + 1)), tabSize);
        if (newSpaceCntOfSecondLine !== oldSpaceCntOfSecondLine) {
          const spaceCntOffset = newSpaceCntOfSecondLine - oldSpaceCntOfSecondLine;
          for (let i = startLineNumber + 1; i <= range.endLineNumber; i++) {
            const lineContent = model.getLineContent(i);
            const originalIndent = strings.getLeadingWhitespace(lineContent);
            const originalSpacesCnt = indentUtils.getSpaceCnt(originalIndent, tabSize);
            const newSpacesCnt = originalSpacesCnt + spaceCntOffset;
            const newIndent = indentUtils.generateIndent(newSpacesCnt, tabSize, insertSpaces);
            if (newIndent !== originalIndent) {
              textEdits.push({
                range: new Range(i, 1, i, originalIndent.length + 1),
                text: newIndent
              });
            }
          }
        }
      }
    }
    if (textEdits.length > 0) {
      this.editor.pushUndoStop();
      const cmd = new AutoIndentOnPasteCommand(textEdits, this.editor.getSelection());
      this.editor.executeCommand("autoIndentOnPaste", cmd);
      this.editor.pushUndoStop();
    }
  }
  rangeContainsOnlyWhitespaceCharacters(model, range) {
    const lineContainsOnlyWhitespace = /* @__PURE__ */ __name((content) => {
      return content.trim().length === 0;
    }, "lineContainsOnlyWhitespace");
    let containsOnlyWhitespace = true;
    if (range.startLineNumber === range.endLineNumber) {
      const lineContent = model.getLineContent(range.startLineNumber);
      const linePart = lineContent.substring(range.startColumn - 1, range.endColumn - 1);
      containsOnlyWhitespace = lineContainsOnlyWhitespace(linePart);
    } else {
      for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
        const lineContent = model.getLineContent(i);
        if (i === range.startLineNumber) {
          const linePart = lineContent.substring(range.startColumn - 1);
          containsOnlyWhitespace = lineContainsOnlyWhitespace(linePart);
        } else if (i === range.endLineNumber) {
          const linePart = lineContent.substring(0, range.endColumn - 1);
          containsOnlyWhitespace = lineContainsOnlyWhitespace(linePart);
        } else {
          containsOnlyWhitespace = model.getLineFirstNonWhitespaceColumn(i) === 0;
        }
        if (!containsOnlyWhitespace) {
          break;
        }
      }
    }
    return containsOnlyWhitespace;
  }
  shouldIgnoreLine(model, lineNumber) {
    model.tokenization.forceTokenization(lineNumber);
    const nonWhitespaceColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    if (nonWhitespaceColumn === 0) {
      return true;
    }
    const tokens = model.tokenization.getLineTokens(lineNumber);
    if (tokens.getCount() > 0) {
      const firstNonWhitespaceTokenIndex = tokens.findTokenIndexAtOffset(nonWhitespaceColumn);
      if (firstNonWhitespaceTokenIndex >= 0 && tokens.getStandardTokenType(firstNonWhitespaceTokenIndex) === StandardTokenType.Comment) {
        return true;
      }
    }
    return false;
  }
  dispose() {
    this.callOnDispose.dispose();
    this.callOnModel.dispose();
  }
};
AutoIndentOnPaste = __decorateClass([
  __decorateParam(1, ILanguageConfigurationService)
], AutoIndentOnPaste);
function isStartOrEndInString(model, range) {
  const isPositionInString = /* @__PURE__ */ __name((position) => {
    const tokenType = getStandardTokenTypeAtPosition(model, position);
    return tokenType === StandardTokenType.String;
  }, "isPositionInString");
  return isPositionInString(range.getStartPosition()) || isPositionInString(range.getEndPosition());
}
__name(isStartOrEndInString, "isStartOrEndInString");
function getIndentationEditOperations(model, builder, tabSize, tabsToSpaces) {
  if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
    return;
  }
  let spaces = "";
  for (let i = 0; i < tabSize; i++) {
    spaces += " ";
  }
  const spacesRegExp = new RegExp(spaces, "gi");
  for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
    let lastIndentationColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    if (lastIndentationColumn === 0) {
      lastIndentationColumn = model.getLineMaxColumn(lineNumber);
    }
    if (lastIndentationColumn === 1) {
      continue;
    }
    const originalIndentationRange = new Range(lineNumber, 1, lineNumber, lastIndentationColumn);
    const originalIndentation = model.getValueInRange(originalIndentationRange);
    const newIndentation = tabsToSpaces ? originalIndentation.replace(/\t/ig, spaces) : originalIndentation.replace(spacesRegExp, "	");
    builder.addEditOperation(originalIndentationRange, newIndentation);
  }
}
__name(getIndentationEditOperations, "getIndentationEditOperations");
class IndentationToSpacesCommand {
  constructor(selection, tabSize) {
    this.selection = selection;
    this.tabSize = tabSize;
  }
  static {
    __name(this, "IndentationToSpacesCommand");
  }
  selectionId = null;
  getEditOperations(model, builder) {
    this.selectionId = builder.trackSelection(this.selection);
    getIndentationEditOperations(model, builder, this.tabSize, true);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this.selectionId);
  }
}
class IndentationToTabsCommand {
  constructor(selection, tabSize) {
    this.selection = selection;
    this.tabSize = tabSize;
  }
  static {
    __name(this, "IndentationToTabsCommand");
  }
  selectionId = null;
  getEditOperations(model, builder) {
    this.selectionId = builder.trackSelection(this.selection);
    getIndentationEditOperations(model, builder, this.tabSize, false);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this.selectionId);
  }
}
registerEditorContribution(AutoIndentOnPaste.ID, AutoIndentOnPaste, EditorContributionInstantiation.BeforeFirstInteraction);
registerEditorAction(IndentationToSpacesAction);
registerEditorAction(IndentationToTabsAction);
registerEditorAction(IndentUsingTabs);
registerEditorAction(IndentUsingSpaces);
registerEditorAction(ChangeTabDisplaySize);
registerEditorAction(DetectIndentation);
registerEditorAction(ReindentLinesAction);
registerEditorAction(ReindentSelectedLinesAction);
export {
  AutoIndentOnPaste,
  AutoIndentOnPasteCommand,
  ChangeIndentationSizeAction,
  ChangeTabDisplaySize,
  DetectIndentation,
  IndentUsingSpaces,
  IndentUsingTabs,
  IndentationToSpacesAction,
  IndentationToSpacesCommand,
  IndentationToTabsAction,
  IndentationToTabsCommand,
  ReindentLinesAction,
  ReindentSelectedLinesAction
};
//# sourceMappingURL=indentation.js.map
