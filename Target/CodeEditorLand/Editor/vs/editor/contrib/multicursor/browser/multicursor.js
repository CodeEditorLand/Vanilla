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
import { status } from "../../../../base/browser/ui/aria/aria.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { Constants } from "../../../../base/common/uint.js";
import * as nls from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  EditorAction,
  EditorContributionInstantiation,
  registerEditorAction,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { CursorMoveCommands } from "../../../common/cursor/cursorMoveCommands.js";
import {
  CursorChangeReason
} from "../../../common/cursorEvents.js";
import {
  ScrollType
} from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { CommonFindController } from "../../find/browser/findController.js";
import {
  FindOptionOverride
} from "../../find/browser/findState.js";
import { getSelectionHighlightDecorationOptions } from "../../wordHighlighter/browser/highlightDecorations.js";
function announceCursorChange(previousCursorState, cursorState) {
  const cursorDiff = cursorState.filter(
    (cs) => !previousCursorState.find((pcs) => pcs.equals(cs))
  );
  if (cursorDiff.length >= 1) {
    const cursorPositions = cursorDiff.map(
      (cs) => `line ${cs.viewState.position.lineNumber} column ${cs.viewState.position.column}`
    ).join(", ");
    const msg = cursorDiff.length === 1 ? nls.localize(
      "cursorAdded",
      "Cursor added: {0}",
      cursorPositions
    ) : nls.localize(
      "cursorsAdded",
      "Cursors added: {0}",
      cursorPositions
    );
    status(msg);
  }
}
class InsertCursorAbove extends EditorAction {
  constructor() {
    super({
      id: "editor.action.insertCursorAbove",
      label: nls.localize("mutlicursor.insertAbove", "Add Cursor Above"),
      alias: "Add Cursor Above",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.UpArrow,
        linux: {
          primary: KeyMod.Shift | KeyMod.Alt | KeyCode.UpArrow,
          secondary: [
            KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.UpArrow
          ]
        },
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: nls.localize(
          {
            key: "miInsertCursorAbove",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Add Cursor Above"
        ),
        order: 2
      }
    });
  }
  run(accessor, editor, args) {
    if (!editor.hasModel()) {
      return;
    }
    let useLogicalLine = true;
    if (args && args.logicalLine === false) {
      useLogicalLine = false;
    }
    const viewModel = editor._getViewModel();
    if (viewModel.cursorConfig.readOnly) {
      return;
    }
    viewModel.model.pushStackElement();
    const previousCursorState = viewModel.getCursorStates();
    viewModel.setCursorStates(
      args.source,
      CursorChangeReason.Explicit,
      CursorMoveCommands.addCursorUp(
        viewModel,
        previousCursorState,
        useLogicalLine
      )
    );
    viewModel.revealTopMostCursor(args.source);
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
}
class InsertCursorBelow extends EditorAction {
  constructor() {
    super({
      id: "editor.action.insertCursorBelow",
      label: nls.localize("mutlicursor.insertBelow", "Add Cursor Below"),
      alias: "Add Cursor Below",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.DownArrow,
        linux: {
          primary: KeyMod.Shift | KeyMod.Alt | KeyCode.DownArrow,
          secondary: [
            KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.DownArrow
          ]
        },
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: nls.localize(
          {
            key: "miInsertCursorBelow",
            comment: ["&& denotes a mnemonic"]
          },
          "A&&dd Cursor Below"
        ),
        order: 3
      }
    });
  }
  run(accessor, editor, args) {
    if (!editor.hasModel()) {
      return;
    }
    let useLogicalLine = true;
    if (args && args.logicalLine === false) {
      useLogicalLine = false;
    }
    const viewModel = editor._getViewModel();
    if (viewModel.cursorConfig.readOnly) {
      return;
    }
    viewModel.model.pushStackElement();
    const previousCursorState = viewModel.getCursorStates();
    viewModel.setCursorStates(
      args.source,
      CursorChangeReason.Explicit,
      CursorMoveCommands.addCursorDown(
        viewModel,
        previousCursorState,
        useLogicalLine
      )
    );
    viewModel.revealBottomMostCursor(args.source);
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
}
class InsertCursorAtEndOfEachLineSelected extends EditorAction {
  constructor() {
    super({
      id: "editor.action.insertCursorAtEndOfEachLineSelected",
      label: nls.localize(
        "mutlicursor.insertAtEndOfEachLineSelected",
        "Add Cursors to Line Ends"
      ),
      alias: "Add Cursors to Line Ends",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.Shift | KeyMod.Alt | KeyCode.KeyI,
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: nls.localize(
          {
            key: "miInsertCursorAtEndOfEachLineSelected",
            comment: ["&& denotes a mnemonic"]
          },
          "Add C&&ursors to Line Ends"
        ),
        order: 4
      }
    });
  }
  getCursorsForSelection(selection, model, result) {
    if (selection.isEmpty()) {
      return;
    }
    for (let i = selection.startLineNumber; i < selection.endLineNumber; i++) {
      const currentLineMaxColumn = model.getLineMaxColumn(i);
      result.push(
        new Selection(i, currentLineMaxColumn, i, currentLineMaxColumn)
      );
    }
    if (selection.endColumn > 1) {
      result.push(
        new Selection(
          selection.endLineNumber,
          selection.endColumn,
          selection.endLineNumber,
          selection.endColumn
        )
      );
    }
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const selections = editor.getSelections();
    const viewModel = editor._getViewModel();
    const previousCursorState = viewModel.getCursorStates();
    const newSelections = [];
    selections.forEach(
      (sel) => this.getCursorsForSelection(sel, model, newSelections)
    );
    if (newSelections.length > 0) {
      editor.setSelections(newSelections);
    }
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
}
class InsertCursorAtEndOfLineSelected extends EditorAction {
  constructor() {
    super({
      id: "editor.action.addCursorsToBottom",
      label: nls.localize(
        "mutlicursor.addCursorsToBottom",
        "Add Cursors To Bottom"
      ),
      alias: "Add Cursors To Bottom",
      precondition: void 0
    });
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const selections = editor.getSelections();
    const lineCount = editor.getModel().getLineCount();
    const newSelections = [];
    for (let i = selections[0].startLineNumber; i <= lineCount; i++) {
      newSelections.push(
        new Selection(
          i,
          selections[0].startColumn,
          i,
          selections[0].endColumn
        )
      );
    }
    const viewModel = editor._getViewModel();
    const previousCursorState = viewModel.getCursorStates();
    if (newSelections.length > 0) {
      editor.setSelections(newSelections);
    }
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
}
class InsertCursorAtTopOfLineSelected extends EditorAction {
  constructor() {
    super({
      id: "editor.action.addCursorsToTop",
      label: nls.localize(
        "mutlicursor.addCursorsToTop",
        "Add Cursors To Top"
      ),
      alias: "Add Cursors To Top",
      precondition: void 0
    });
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const selections = editor.getSelections();
    const newSelections = [];
    for (let i = selections[0].startLineNumber; i >= 1; i--) {
      newSelections.push(
        new Selection(
          i,
          selections[0].startColumn,
          i,
          selections[0].endColumn
        )
      );
    }
    const viewModel = editor._getViewModel();
    const previousCursorState = viewModel.getCursorStates();
    if (newSelections.length > 0) {
      editor.setSelections(newSelections);
    }
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
}
class MultiCursorSessionResult {
  constructor(selections, revealRange, revealScrollType) {
    this.selections = selections;
    this.revealRange = revealRange;
    this.revealScrollType = revealScrollType;
  }
}
class MultiCursorSession {
  constructor(_editor, findController, isDisconnectedFromFindController, searchText, wholeWord, matchCase, currentMatch) {
    this._editor = _editor;
    this.findController = findController;
    this.isDisconnectedFromFindController = isDisconnectedFromFindController;
    this.searchText = searchText;
    this.wholeWord = wholeWord;
    this.matchCase = matchCase;
    this.currentMatch = currentMatch;
  }
  static create(editor, findController) {
    if (!editor.hasModel()) {
      return null;
    }
    const findState = findController.getState();
    if (!editor.hasTextFocus() && findState.isRevealed && findState.searchString.length > 0) {
      return new MultiCursorSession(
        editor,
        findController,
        false,
        findState.searchString,
        findState.wholeWord,
        findState.matchCase,
        null
      );
    }
    let isDisconnectedFromFindController = false;
    let wholeWord;
    let matchCase;
    const selections = editor.getSelections();
    if (selections.length === 1 && selections[0].isEmpty()) {
      isDisconnectedFromFindController = true;
      wholeWord = true;
      matchCase = true;
    } else {
      wholeWord = findState.wholeWord;
      matchCase = findState.matchCase;
    }
    const s = editor.getSelection();
    let searchText;
    let currentMatch = null;
    if (s.isEmpty()) {
      const word = editor.getConfiguredWordAtPosition(
        s.getStartPosition()
      );
      if (!word) {
        return null;
      }
      searchText = word.word;
      currentMatch = new Selection(
        s.startLineNumber,
        word.startColumn,
        s.startLineNumber,
        word.endColumn
      );
    } else {
      searchText = editor.getModel().getValueInRange(s).replace(/\r\n/g, "\n");
    }
    return new MultiCursorSession(
      editor,
      findController,
      isDisconnectedFromFindController,
      searchText,
      wholeWord,
      matchCase,
      currentMatch
    );
  }
  addSelectionToNextFindMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    const nextMatch = this._getNextMatch();
    if (!nextMatch) {
      return null;
    }
    const allSelections = this._editor.getSelections();
    return new MultiCursorSessionResult(
      allSelections.concat(nextMatch),
      nextMatch,
      ScrollType.Smooth
    );
  }
  moveSelectionToNextFindMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    const nextMatch = this._getNextMatch();
    if (!nextMatch) {
      return null;
    }
    const allSelections = this._editor.getSelections();
    return new MultiCursorSessionResult(
      allSelections.slice(0, allSelections.length - 1).concat(nextMatch),
      nextMatch,
      ScrollType.Smooth
    );
  }
  _getNextMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    if (this.currentMatch) {
      const result = this.currentMatch;
      this.currentMatch = null;
      return result;
    }
    this.findController.highlightFindOptions();
    const allSelections = this._editor.getSelections();
    const lastAddedSelection = allSelections[allSelections.length - 1];
    const nextMatch = this._editor.getModel().findNextMatch(
      this.searchText,
      lastAddedSelection.getEndPosition(),
      false,
      this.matchCase,
      this.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
      false
    );
    if (!nextMatch) {
      return null;
    }
    return new Selection(
      nextMatch.range.startLineNumber,
      nextMatch.range.startColumn,
      nextMatch.range.endLineNumber,
      nextMatch.range.endColumn
    );
  }
  addSelectionToPreviousFindMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    const previousMatch = this._getPreviousMatch();
    if (!previousMatch) {
      return null;
    }
    const allSelections = this._editor.getSelections();
    return new MultiCursorSessionResult(
      allSelections.concat(previousMatch),
      previousMatch,
      ScrollType.Smooth
    );
  }
  moveSelectionToPreviousFindMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    const previousMatch = this._getPreviousMatch();
    if (!previousMatch) {
      return null;
    }
    const allSelections = this._editor.getSelections();
    return new MultiCursorSessionResult(
      allSelections.slice(0, allSelections.length - 1).concat(previousMatch),
      previousMatch,
      ScrollType.Smooth
    );
  }
  _getPreviousMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    if (this.currentMatch) {
      const result = this.currentMatch;
      this.currentMatch = null;
      return result;
    }
    this.findController.highlightFindOptions();
    const allSelections = this._editor.getSelections();
    const lastAddedSelection = allSelections[allSelections.length - 1];
    const previousMatch = this._editor.getModel().findPreviousMatch(
      this.searchText,
      lastAddedSelection.getStartPosition(),
      false,
      this.matchCase,
      this.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
      false
    );
    if (!previousMatch) {
      return null;
    }
    return new Selection(
      previousMatch.range.startLineNumber,
      previousMatch.range.startColumn,
      previousMatch.range.endLineNumber,
      previousMatch.range.endColumn
    );
  }
  selectAll(searchScope) {
    if (!this._editor.hasModel()) {
      return [];
    }
    this.findController.highlightFindOptions();
    const editorModel = this._editor.getModel();
    if (searchScope) {
      return editorModel.findMatches(
        this.searchText,
        searchScope,
        false,
        this.matchCase,
        this.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
        false,
        Constants.MAX_SAFE_SMALL_INTEGER
      );
    }
    return editorModel.findMatches(
      this.searchText,
      true,
      false,
      this.matchCase,
      this.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
      false,
      Constants.MAX_SAFE_SMALL_INTEGER
    );
  }
}
class MultiCursorSelectionController extends Disposable {
  static ID = "editor.contrib.multiCursorController";
  _editor;
  _ignoreSelectionChange;
  _session;
  _sessionDispose = this._register(new DisposableStore());
  static get(editor) {
    return editor.getContribution(
      MultiCursorSelectionController.ID
    );
  }
  constructor(editor) {
    super();
    this._editor = editor;
    this._ignoreSelectionChange = false;
    this._session = null;
  }
  dispose() {
    this._endSession();
    super.dispose();
  }
  _beginSessionIfNeeded(findController) {
    if (!this._session) {
      const session = MultiCursorSession.create(
        this._editor,
        findController
      );
      if (!session) {
        return;
      }
      this._session = session;
      const newState = {
        searchString: this._session.searchText
      };
      if (this._session.isDisconnectedFromFindController) {
        newState.wholeWordOverride = FindOptionOverride.True;
        newState.matchCaseOverride = FindOptionOverride.True;
        newState.isRegexOverride = FindOptionOverride.False;
      }
      findController.getState().change(newState, false);
      this._sessionDispose.add(
        this._editor.onDidChangeCursorSelection((e) => {
          if (this._ignoreSelectionChange) {
            return;
          }
          this._endSession();
        })
      );
      this._sessionDispose.add(
        this._editor.onDidBlurEditorText(() => {
          this._endSession();
        })
      );
      this._sessionDispose.add(
        findController.getState().onFindReplaceStateChange((e) => {
          if (e.matchCase || e.wholeWord) {
            this._endSession();
          }
        })
      );
    }
  }
  _endSession() {
    this._sessionDispose.clear();
    if (this._session && this._session.isDisconnectedFromFindController) {
      const newState = {
        wholeWordOverride: FindOptionOverride.NotSet,
        matchCaseOverride: FindOptionOverride.NotSet,
        isRegexOverride: FindOptionOverride.NotSet
      };
      this._session.findController.getState().change(newState, false);
    }
    this._session = null;
  }
  _setSelections(selections) {
    this._ignoreSelectionChange = true;
    this._editor.setSelections(selections);
    this._ignoreSelectionChange = false;
  }
  _expandEmptyToWord(model, selection) {
    if (!selection.isEmpty()) {
      return selection;
    }
    const word = this._editor.getConfiguredWordAtPosition(
      selection.getStartPosition()
    );
    if (!word) {
      return selection;
    }
    return new Selection(
      selection.startLineNumber,
      word.startColumn,
      selection.startLineNumber,
      word.endColumn
    );
  }
  _applySessionResult(result) {
    if (!result) {
      return;
    }
    this._setSelections(result.selections);
    if (result.revealRange) {
      this._editor.revealRangeInCenterIfOutsideViewport(
        result.revealRange,
        result.revealScrollType
      );
    }
  }
  getSession(findController) {
    return this._session;
  }
  addSelectionToNextFindMatch(findController) {
    if (!this._editor.hasModel()) {
      return;
    }
    if (!this._session) {
      const allSelections = this._editor.getSelections();
      if (allSelections.length > 1) {
        const findState = findController.getState();
        const matchCase = findState.matchCase;
        const selectionsContainSameText = modelRangesContainSameText(
          this._editor.getModel(),
          allSelections,
          matchCase
        );
        if (!selectionsContainSameText) {
          const model = this._editor.getModel();
          const resultingSelections = [];
          for (let i = 0, len = allSelections.length; i < len; i++) {
            resultingSelections[i] = this._expandEmptyToWord(
              model,
              allSelections[i]
            );
          }
          this._editor.setSelections(resultingSelections);
          return;
        }
      }
    }
    this._beginSessionIfNeeded(findController);
    if (this._session) {
      this._applySessionResult(
        this._session.addSelectionToNextFindMatch()
      );
    }
  }
  addSelectionToPreviousFindMatch(findController) {
    this._beginSessionIfNeeded(findController);
    if (this._session) {
      this._applySessionResult(
        this._session.addSelectionToPreviousFindMatch()
      );
    }
  }
  moveSelectionToNextFindMatch(findController) {
    this._beginSessionIfNeeded(findController);
    if (this._session) {
      this._applySessionResult(
        this._session.moveSelectionToNextFindMatch()
      );
    }
  }
  moveSelectionToPreviousFindMatch(findController) {
    this._beginSessionIfNeeded(findController);
    if (this._session) {
      this._applySessionResult(
        this._session.moveSelectionToPreviousFindMatch()
      );
    }
  }
  selectAll(findController) {
    if (!this._editor.hasModel()) {
      return;
    }
    let matches = null;
    const findState = findController.getState();
    if (findState.isRevealed && findState.searchString.length > 0 && findState.isRegex) {
      const editorModel = this._editor.getModel();
      if (findState.searchScope) {
        matches = editorModel.findMatches(
          findState.searchString,
          findState.searchScope,
          findState.isRegex,
          findState.matchCase,
          findState.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
          false,
          Constants.MAX_SAFE_SMALL_INTEGER
        );
      } else {
        matches = editorModel.findMatches(
          findState.searchString,
          true,
          findState.isRegex,
          findState.matchCase,
          findState.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
          false,
          Constants.MAX_SAFE_SMALL_INTEGER
        );
      }
    } else {
      this._beginSessionIfNeeded(findController);
      if (!this._session) {
        return;
      }
      matches = this._session.selectAll(findState.searchScope);
    }
    if (matches.length > 0) {
      const editorSelection = this._editor.getSelection();
      for (let i = 0, len = matches.length; i < len; i++) {
        const match = matches[i];
        const intersection = match.range.intersectRanges(editorSelection);
        if (intersection) {
          matches[i] = matches[0];
          matches[0] = match;
          break;
        }
      }
      this._setSelections(
        matches.map(
          (m) => new Selection(
            m.range.startLineNumber,
            m.range.startColumn,
            m.range.endLineNumber,
            m.range.endColumn
          )
        )
      );
    }
  }
  selectAllUsingSelections(selections) {
    if (selections.length > 0) {
      this._setSelections(selections);
    }
  }
}
class MultiCursorSelectionControllerAction extends EditorAction {
  run(accessor, editor) {
    const multiCursorController = MultiCursorSelectionController.get(editor);
    if (!multiCursorController) {
      return;
    }
    const viewModel = editor._getViewModel();
    if (viewModel) {
      const previousCursorState = viewModel.getCursorStates();
      const findController = CommonFindController.get(editor);
      if (findController) {
        this._run(multiCursorController, findController);
      } else {
        const newFindController = accessor.get(IInstantiationService).createInstance(CommonFindController, editor);
        this._run(multiCursorController, newFindController);
        newFindController.dispose();
      }
      announceCursorChange(
        previousCursorState,
        viewModel.getCursorStates()
      );
    }
  }
}
class AddSelectionToNextFindMatchAction extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.addSelectionToNextFindMatch",
      label: nls.localize(
        "addSelectionToNextFindMatch",
        "Add Selection To Next Find Match"
      ),
      alias: "Add Selection To Next Find Match",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: KeyMod.CtrlCmd | KeyCode.KeyD,
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: nls.localize(
          {
            key: "miAddSelectionToNextFindMatch",
            comment: ["&& denotes a mnemonic"]
          },
          "Add &&Next Occurrence"
        ),
        order: 5
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.addSelectionToNextFindMatch(findController);
  }
}
class AddSelectionToPreviousFindMatchAction extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.addSelectionToPreviousFindMatch",
      label: nls.localize(
        "addSelectionToPreviousFindMatch",
        "Add Selection To Previous Find Match"
      ),
      alias: "Add Selection To Previous Find Match",
      precondition: void 0,
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: nls.localize(
          {
            key: "miAddSelectionToPreviousFindMatch",
            comment: ["&& denotes a mnemonic"]
          },
          "Add P&&revious Occurrence"
        ),
        order: 6
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.addSelectionToPreviousFindMatch(findController);
  }
}
class MoveSelectionToNextFindMatchAction extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.moveSelectionToNextFindMatch",
      label: nls.localize(
        "moveSelectionToNextFindMatch",
        "Move Last Selection To Next Find Match"
      ),
      alias: "Move Last Selection To Next Find Match",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.KeyD
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.moveSelectionToNextFindMatch(findController);
  }
}
class MoveSelectionToPreviousFindMatchAction extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.moveSelectionToPreviousFindMatch",
      label: nls.localize(
        "moveSelectionToPreviousFindMatch",
        "Move Last Selection To Previous Find Match"
      ),
      alias: "Move Last Selection To Previous Find Match",
      precondition: void 0
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.moveSelectionToPreviousFindMatch(findController);
  }
}
class SelectHighlightsAction extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.selectHighlights",
      label: nls.localize(
        "selectAllOccurrencesOfFindMatch",
        "Select All Occurrences of Find Match"
      ),
      alias: "Select All Occurrences of Find Match",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyL,
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: nls.localize(
          {
            key: "miSelectHighlights",
            comment: ["&& denotes a mnemonic"]
          },
          "Select All &&Occurrences"
        ),
        order: 7
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.selectAll(findController);
  }
}
class CompatChangeAll extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.changeAll",
      label: nls.localize("changeAll.label", "Change All Occurrences"),
      alias: "Change All Occurrences",
      precondition: ContextKeyExpr.and(
        EditorContextKeys.writable,
        EditorContextKeys.editorTextFocus
      ),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyCode.F2,
        weight: KeybindingWeight.EditorContrib
      },
      contextMenuOpts: {
        group: "1_modification",
        order: 1.2
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.selectAll(findController);
  }
}
class SelectionHighlighterState {
  constructor(_model, _searchText, _matchCase, _wordSeparators, prevState) {
    this._model = _model;
    this._searchText = _searchText;
    this._matchCase = _matchCase;
    this._wordSeparators = _wordSeparators;
    if (prevState && this._model === prevState._model && this._searchText === prevState._searchText && this._matchCase === prevState._matchCase && this._wordSeparators === prevState._wordSeparators && this._modelVersionId === prevState._modelVersionId) {
      this._cachedFindMatches = prevState._cachedFindMatches;
    }
  }
  _modelVersionId = this._model.getVersionId();
  _cachedFindMatches = null;
  findMatches() {
    if (this._cachedFindMatches === null) {
      this._cachedFindMatches = this._model.findMatches(
        this._searchText,
        true,
        false,
        this._matchCase,
        this._wordSeparators,
        false
      ).map((m) => m.range);
      this._cachedFindMatches.sort(Range.compareRangesUsingStarts);
    }
    return this._cachedFindMatches;
  }
}
let SelectionHighlighter = class extends Disposable {
  constructor(editor, _languageFeaturesService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    this.editor = editor;
    this._isEnabled = editor.getOption(EditorOption.selectionHighlight);
    this._decorations = editor.createDecorationsCollection();
    this.updateSoon = this._register(new RunOnceScheduler(() => this._update(), 300));
    this.state = null;
    this._register(editor.onDidChangeConfiguration((e) => {
      this._isEnabled = editor.getOption(EditorOption.selectionHighlight);
    }));
    this._register(editor.onDidChangeCursorSelection((e) => {
      if (!this._isEnabled) {
        return;
      }
      if (e.selection.isEmpty()) {
        if (e.reason === CursorChangeReason.Explicit) {
          if (this.state) {
            this._setState(null);
          }
          this.updateSoon.schedule();
        } else {
          this._setState(null);
        }
      } else {
        this._update();
      }
    }));
    this._register(editor.onDidChangeModel((e) => {
      this._setState(null);
    }));
    this._register(editor.onDidChangeModelContent((e) => {
      if (this._isEnabled) {
        this.updateSoon.schedule();
      }
    }));
    const findController = CommonFindController.get(editor);
    if (findController) {
      this._register(findController.getState().onFindReplaceStateChange((e) => {
        this._update();
      }));
    }
    this.updateSoon.schedule();
  }
  static ID = "editor.contrib.selectionHighlighter";
  editor;
  _isEnabled;
  _decorations;
  updateSoon;
  state;
  _update() {
    this._setState(
      SelectionHighlighter._createState(
        this.state,
        this._isEnabled,
        this.editor
      )
    );
  }
  static _createState(oldState, isEnabled, editor) {
    if (!isEnabled) {
      return null;
    }
    if (!editor.hasModel()) {
      return null;
    }
    const s = editor.getSelection();
    if (s.startLineNumber !== s.endLineNumber) {
      return null;
    }
    const multiCursorController = MultiCursorSelectionController.get(editor);
    if (!multiCursorController) {
      return null;
    }
    const findController = CommonFindController.get(editor);
    if (!findController) {
      return null;
    }
    let r = multiCursorController.getSession(findController);
    if (!r) {
      const allSelections = editor.getSelections();
      if (allSelections.length > 1) {
        const findState2 = findController.getState();
        const matchCase = findState2.matchCase;
        const selectionsContainSameText = modelRangesContainSameText(
          editor.getModel(),
          allSelections,
          matchCase
        );
        if (!selectionsContainSameText) {
          return null;
        }
      }
      r = MultiCursorSession.create(editor, findController);
    }
    if (!r) {
      return null;
    }
    if (r.currentMatch) {
      return null;
    }
    if (/^[ \t]+$/.test(r.searchText)) {
      return null;
    }
    if (r.searchText.length > 200) {
      return null;
    }
    const findState = findController.getState();
    const caseSensitive = findState.matchCase;
    if (findState.isRevealed) {
      let findStateSearchString = findState.searchString;
      if (!caseSensitive) {
        findStateSearchString = findStateSearchString.toLowerCase();
      }
      let mySearchString = r.searchText;
      if (!caseSensitive) {
        mySearchString = mySearchString.toLowerCase();
      }
      if (findStateSearchString === mySearchString && r.matchCase === findState.matchCase && r.wholeWord === findState.wholeWord && !findState.isRegex) {
        return null;
      }
    }
    return new SelectionHighlighterState(
      editor.getModel(),
      r.searchText,
      r.matchCase,
      r.wholeWord ? editor.getOption(EditorOption.wordSeparators) : null,
      oldState
    );
  }
  _setState(newState) {
    this.state = newState;
    if (!this.state) {
      this._decorations.clear();
      return;
    }
    if (!this.editor.hasModel()) {
      return;
    }
    const model = this.editor.getModel();
    if (model.isTooLargeForTokenization()) {
      return;
    }
    const allMatches = this.state.findMatches();
    const selections = this.editor.getSelections();
    selections.sort(Range.compareRangesUsingStarts);
    const matches = [];
    for (let i = 0, j = 0, len = allMatches.length, lenJ = selections.length; i < len; ) {
      const match = allMatches[i];
      if (j >= lenJ) {
        matches.push(match);
        i++;
      } else {
        const cmp = Range.compareRangesUsingStarts(
          match,
          selections[j]
        );
        if (cmp < 0) {
          if (selections[j].isEmpty() || !Range.areIntersecting(match, selections[j])) {
            matches.push(match);
          }
          i++;
        } else if (cmp > 0) {
          j++;
        } else {
          i++;
          j++;
        }
      }
    }
    const occurrenceHighlighting = this.editor.getOption(EditorOption.occurrencesHighlight) !== "off";
    const hasSemanticHighlights = this._languageFeaturesService.documentHighlightProvider.has(
      model
    ) && occurrenceHighlighting;
    const decorations = matches.map((r) => {
      return {
        range: r,
        options: getSelectionHighlightDecorationOptions(
          hasSemanticHighlights
        )
      };
    });
    this._decorations.set(decorations);
  }
  dispose() {
    this._setState(null);
    super.dispose();
  }
};
SelectionHighlighter = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService)
], SelectionHighlighter);
function modelRangesContainSameText(model, ranges, matchCase) {
  const selectedText = getValueInRange(model, ranges[0], !matchCase);
  for (let i = 1, len = ranges.length; i < len; i++) {
    const range = ranges[i];
    if (range.isEmpty()) {
      return false;
    }
    const thisSelectedText = getValueInRange(model, range, !matchCase);
    if (selectedText !== thisSelectedText) {
      return false;
    }
  }
  return true;
}
function getValueInRange(model, range, toLowerCase) {
  const text = model.getValueInRange(range);
  return toLowerCase ? text.toLowerCase() : text;
}
class FocusNextCursor extends EditorAction {
  constructor() {
    super({
      id: "editor.action.focusNextCursor",
      label: nls.localize(
        "mutlicursor.focusNextCursor",
        "Focus Next Cursor"
      ),
      metadata: {
        description: nls.localize(
          "mutlicursor.focusNextCursor.description",
          "Focuses the next cursor"
        ),
        args: []
      },
      alias: "Focus Next Cursor",
      precondition: void 0
    });
  }
  run(accessor, editor, args) {
    if (!editor.hasModel()) {
      return;
    }
    const viewModel = editor._getViewModel();
    if (viewModel.cursorConfig.readOnly) {
      return;
    }
    viewModel.model.pushStackElement();
    const previousCursorState = Array.from(viewModel.getCursorStates());
    const firstCursor = previousCursorState.shift();
    if (!firstCursor) {
      return;
    }
    previousCursorState.push(firstCursor);
    viewModel.setCursorStates(
      args.source,
      CursorChangeReason.Explicit,
      previousCursorState
    );
    viewModel.revealPrimaryCursor(args.source, true);
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
}
class FocusPreviousCursor extends EditorAction {
  constructor() {
    super({
      id: "editor.action.focusPreviousCursor",
      label: nls.localize(
        "mutlicursor.focusPreviousCursor",
        "Focus Previous Cursor"
      ),
      metadata: {
        description: nls.localize(
          "mutlicursor.focusPreviousCursor.description",
          "Focuses the previous cursor"
        ),
        args: []
      },
      alias: "Focus Previous Cursor",
      precondition: void 0
    });
  }
  run(accessor, editor, args) {
    if (!editor.hasModel()) {
      return;
    }
    const viewModel = editor._getViewModel();
    if (viewModel.cursorConfig.readOnly) {
      return;
    }
    viewModel.model.pushStackElement();
    const previousCursorState = Array.from(viewModel.getCursorStates());
    const firstCursor = previousCursorState.pop();
    if (!firstCursor) {
      return;
    }
    previousCursorState.unshift(firstCursor);
    viewModel.setCursorStates(
      args.source,
      CursorChangeReason.Explicit,
      previousCursorState
    );
    viewModel.revealPrimaryCursor(args.source, true);
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
}
registerEditorContribution(
  MultiCursorSelectionController.ID,
  MultiCursorSelectionController,
  EditorContributionInstantiation.Lazy
);
registerEditorContribution(
  SelectionHighlighter.ID,
  SelectionHighlighter,
  EditorContributionInstantiation.AfterFirstRender
);
registerEditorAction(InsertCursorAbove);
registerEditorAction(InsertCursorBelow);
registerEditorAction(InsertCursorAtEndOfEachLineSelected);
registerEditorAction(AddSelectionToNextFindMatchAction);
registerEditorAction(AddSelectionToPreviousFindMatchAction);
registerEditorAction(MoveSelectionToNextFindMatchAction);
registerEditorAction(MoveSelectionToPreviousFindMatchAction);
registerEditorAction(SelectHighlightsAction);
registerEditorAction(CompatChangeAll);
registerEditorAction(InsertCursorAtEndOfLineSelected);
registerEditorAction(InsertCursorAtTopOfLineSelected);
registerEditorAction(FocusNextCursor);
registerEditorAction(FocusPreviousCursor);
export {
  AddSelectionToNextFindMatchAction,
  AddSelectionToPreviousFindMatchAction,
  CompatChangeAll,
  FocusNextCursor,
  FocusPreviousCursor,
  InsertCursorAbove,
  InsertCursorBelow,
  MoveSelectionToNextFindMatchAction,
  MoveSelectionToPreviousFindMatchAction,
  MultiCursorSelectionController,
  MultiCursorSelectionControllerAction,
  MultiCursorSession,
  MultiCursorSessionResult,
  SelectHighlightsAction,
  SelectionHighlighter
};
