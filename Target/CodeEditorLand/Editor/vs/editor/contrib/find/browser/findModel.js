var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findFirstIdxMonotonousOrArrLen } from "../../../../base/common/arraysFind.js";
import {
  RunOnceScheduler,
  TimeoutTimer
} from "../../../../base/common/async.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { DisposableStore, dispose } from "../../../../base/common/lifecycle.js";
import { Constants } from "../../../../base/common/uint.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import {
  ReplaceCommand,
  ReplaceCommandThatPreservesSelection
} from "../../../common/commands/replaceCommand.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import {
  CursorChangeReason
} from "../../../common/cursorEvents.js";
import { ScrollType } from "../../../common/editorCommon.js";
import {
  EndOfLinePreference
} from "../../../common/model.js";
import { SearchParams } from "../../../common/model/textModelSearch.js";
import { FindDecorations } from "./findDecorations.js";
import { ReplaceAllCommand } from "./replaceAllCommand.js";
import { ReplacePattern, parseReplaceString } from "./replacePattern.js";
const CONTEXT_FIND_WIDGET_VISIBLE = new RawContextKey(
  "findWidgetVisible",
  false
);
const CONTEXT_FIND_WIDGET_NOT_VISIBLE = CONTEXT_FIND_WIDGET_VISIBLE.toNegated();
const CONTEXT_FIND_INPUT_FOCUSED = new RawContextKey(
  "findInputFocussed",
  false
);
const CONTEXT_REPLACE_INPUT_FOCUSED = new RawContextKey(
  "replaceInputFocussed",
  false
);
const ToggleCaseSensitiveKeybinding = {
  primary: KeyMod.Alt | KeyCode.KeyC,
  mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyC }
};
const ToggleWholeWordKeybinding = {
  primary: KeyMod.Alt | KeyCode.KeyW,
  mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyW }
};
const ToggleRegexKeybinding = {
  primary: KeyMod.Alt | KeyCode.KeyR,
  mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyR }
};
const ToggleSearchScopeKeybinding = {
  primary: KeyMod.Alt | KeyCode.KeyL,
  mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyL }
};
const TogglePreserveCaseKeybinding = {
  primary: KeyMod.Alt | KeyCode.KeyP,
  mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyP }
};
const FIND_IDS = {
  StartFindAction: "actions.find",
  StartFindWithSelection: "actions.findWithSelection",
  StartFindWithArgs: "editor.actions.findWithArgs",
  NextMatchFindAction: "editor.action.nextMatchFindAction",
  PreviousMatchFindAction: "editor.action.previousMatchFindAction",
  GoToMatchFindAction: "editor.action.goToMatchFindAction",
  NextSelectionMatchFindAction: "editor.action.nextSelectionMatchFindAction",
  PreviousSelectionMatchFindAction: "editor.action.previousSelectionMatchFindAction",
  StartFindReplaceAction: "editor.action.startFindReplaceAction",
  CloseFindWidgetCommand: "closeFindWidget",
  ToggleCaseSensitiveCommand: "toggleFindCaseSensitive",
  ToggleWholeWordCommand: "toggleFindWholeWord",
  ToggleRegexCommand: "toggleFindRegex",
  ToggleSearchScopeCommand: "toggleFindInSelection",
  TogglePreserveCaseCommand: "togglePreserveCase",
  ReplaceOneAction: "editor.action.replaceOne",
  ReplaceAllAction: "editor.action.replaceAll",
  SelectAllMatchesAction: "editor.action.selectAllMatches"
};
const MATCHES_LIMIT = 19999;
const RESEARCH_DELAY = 240;
class FindModelBoundToEditorModel {
  static {
    __name(this, "FindModelBoundToEditorModel");
  }
  _editor;
  _state;
  _toDispose = new DisposableStore();
  _decorations;
  _ignoreModelContentChanged;
  _startSearchingTimer;
  _updateDecorationsScheduler;
  _isDisposed;
  constructor(editor, state) {
    this._editor = editor;
    this._state = state;
    this._isDisposed = false;
    this._startSearchingTimer = new TimeoutTimer();
    this._decorations = new FindDecorations(editor);
    this._toDispose.add(this._decorations);
    this._updateDecorationsScheduler = new RunOnceScheduler(() => {
      if (!this._editor.hasModel()) {
        return;
      }
      return this.research(false);
    }, 100);
    this._toDispose.add(this._updateDecorationsScheduler);
    this._toDispose.add(
      this._editor.onDidChangeCursorPosition(
        (e) => {
          if (e.reason === CursorChangeReason.Explicit || e.reason === CursorChangeReason.Undo || e.reason === CursorChangeReason.Redo) {
            this._decorations.setStartPosition(
              this._editor.getPosition()
            );
          }
        }
      )
    );
    this._ignoreModelContentChanged = false;
    this._toDispose.add(
      this._editor.onDidChangeModelContent((e) => {
        if (this._ignoreModelContentChanged) {
          return;
        }
        if (e.isFlush) {
          this._decorations.reset();
        }
        this._decorations.setStartPosition(this._editor.getPosition());
        this._updateDecorationsScheduler.schedule();
      })
    );
    this._toDispose.add(
      this._state.onFindReplaceStateChange(
        (e) => this._onStateChanged(e)
      )
    );
    this.research(false, this._state.searchScope);
  }
  dispose() {
    this._isDisposed = true;
    dispose(this._startSearchingTimer);
    this._toDispose.dispose();
  }
  _onStateChanged(e) {
    if (this._isDisposed) {
      return;
    }
    if (!this._editor.hasModel()) {
      return;
    }
    if (e.searchString || e.isReplaceRevealed || e.isRegex || e.wholeWord || e.matchCase || e.searchScope) {
      const model = this._editor.getModel();
      if (model.isTooLargeForSyncing()) {
        this._startSearchingTimer.cancel();
        this._startSearchingTimer.setIfNotSet(() => {
          if (e.searchScope) {
            this.research(e.moveCursor, this._state.searchScope);
          } else {
            this.research(e.moveCursor);
          }
        }, RESEARCH_DELAY);
      } else if (e.searchScope) {
        this.research(e.moveCursor, this._state.searchScope);
      } else {
        this.research(e.moveCursor);
      }
    }
  }
  static _getSearchRange(model, findScope) {
    if (findScope) {
      return findScope;
    }
    return model.getFullModelRange();
  }
  research(moveCursor, newFindScope) {
    let findScopes = null;
    if (typeof newFindScope !== "undefined") {
      if (newFindScope !== null) {
        if (Array.isArray(newFindScope)) {
          findScopes = newFindScope;
        } else {
          findScopes = [newFindScope];
        }
      }
    } else {
      findScopes = this._decorations.getFindScopes();
    }
    if (findScopes !== null) {
      findScopes = findScopes.map((findScope) => {
        if (findScope.startLineNumber !== findScope.endLineNumber) {
          let endLineNumber = findScope.endLineNumber;
          if (findScope.endColumn === 1) {
            endLineNumber = endLineNumber - 1;
          }
          return new Range(
            findScope.startLineNumber,
            1,
            endLineNumber,
            this._editor.getModel().getLineMaxColumn(endLineNumber)
          );
        }
        return findScope;
      });
    }
    const findMatches = this._findMatches(findScopes, false, MATCHES_LIMIT);
    this._decorations.set(findMatches, findScopes);
    const editorSelection = this._editor.getSelection();
    let currentMatchesPosition = this._decorations.getCurrentMatchesPosition(editorSelection);
    if (currentMatchesPosition === 0 && findMatches.length > 0) {
      const matchAfterSelection = findFirstIdxMonotonousOrArrLen(
        findMatches.map((match) => match.range),
        (range) => Range.compareRangesUsingStarts(range, editorSelection) >= 0
      );
      currentMatchesPosition = matchAfterSelection > 0 ? matchAfterSelection - 1 + 1 : currentMatchesPosition;
    }
    this._state.changeMatchInfo(
      currentMatchesPosition,
      this._decorations.getCount(),
      void 0
    );
    if (moveCursor && this._editor.getOption(EditorOption.find).cursorMoveOnType) {
      this._moveToNextMatch(this._decorations.getStartPosition());
    }
  }
  _hasMatches() {
    return this._state.matchesCount > 0;
  }
  _cannotFind() {
    if (!this._hasMatches()) {
      const findScope = this._decorations.getFindScope();
      if (findScope) {
        this._editor.revealRangeInCenterIfOutsideViewport(
          findScope,
          ScrollType.Smooth
        );
      }
      return true;
    }
    return false;
  }
  _setCurrentFindMatch(match) {
    const matchesPosition = this._decorations.setCurrentFindMatch(match);
    this._state.changeMatchInfo(
      matchesPosition,
      this._decorations.getCount(),
      match
    );
    this._editor.setSelection(match);
    this._editor.revealRangeInCenterIfOutsideViewport(
      match,
      ScrollType.Smooth
    );
  }
  _prevSearchPosition(before) {
    const isUsingLineStops = this._state.isRegex && (this._state.searchString.indexOf("^") >= 0 || this._state.searchString.indexOf("$") >= 0);
    let { lineNumber, column } = before;
    const model = this._editor.getModel();
    if (isUsingLineStops || column === 1) {
      if (lineNumber === 1) {
        lineNumber = model.getLineCount();
      } else {
        lineNumber--;
      }
      column = model.getLineMaxColumn(lineNumber);
    } else {
      column--;
    }
    return new Position(lineNumber, column);
  }
  _moveToPrevMatch(before, isRecursed = false) {
    if (!this._state.canNavigateBack()) {
      const nextMatchRange = this._decorations.matchAfterPosition(before);
      if (nextMatchRange) {
        this._setCurrentFindMatch(nextMatchRange);
      }
      return;
    }
    if (this._decorations.getCount() < MATCHES_LIMIT) {
      let prevMatchRange = this._decorations.matchBeforePosition(before);
      if (prevMatchRange && prevMatchRange.isEmpty() && prevMatchRange.getStartPosition().equals(before)) {
        before = this._prevSearchPosition(before);
        prevMatchRange = this._decorations.matchBeforePosition(before);
      }
      if (prevMatchRange) {
        this._setCurrentFindMatch(prevMatchRange);
      }
      return;
    }
    if (this._cannotFind()) {
      return;
    }
    const findScope = this._decorations.getFindScope();
    const searchRange = FindModelBoundToEditorModel._getSearchRange(
      this._editor.getModel(),
      findScope
    );
    if (searchRange.getEndPosition().isBefore(before)) {
      before = searchRange.getEndPosition();
    }
    if (before.isBefore(searchRange.getStartPosition())) {
      before = searchRange.getEndPosition();
    }
    const { lineNumber, column } = before;
    const model = this._editor.getModel();
    let position = new Position(lineNumber, column);
    let prevMatch = model.findPreviousMatch(
      this._state.searchString,
      position,
      this._state.isRegex,
      this._state.matchCase,
      this._state.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
      false
    );
    if (prevMatch && prevMatch.range.isEmpty() && prevMatch.range.getStartPosition().equals(position)) {
      position = this._prevSearchPosition(position);
      prevMatch = model.findPreviousMatch(
        this._state.searchString,
        position,
        this._state.isRegex,
        this._state.matchCase,
        this._state.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
        false
      );
    }
    if (!prevMatch) {
      return;
    }
    if (!isRecursed && !searchRange.containsRange(prevMatch.range)) {
      return this._moveToPrevMatch(
        prevMatch.range.getStartPosition(),
        true
      );
    }
    this._setCurrentFindMatch(prevMatch.range);
  }
  moveToPrevMatch() {
    this._moveToPrevMatch(this._editor.getSelection().getStartPosition());
  }
  _nextSearchPosition(after) {
    const isUsingLineStops = this._state.isRegex && (this._state.searchString.indexOf("^") >= 0 || this._state.searchString.indexOf("$") >= 0);
    let { lineNumber, column } = after;
    const model = this._editor.getModel();
    if (isUsingLineStops || column === model.getLineMaxColumn(lineNumber)) {
      if (lineNumber === model.getLineCount()) {
        lineNumber = 1;
      } else {
        lineNumber++;
      }
      column = 1;
    } else {
      column++;
    }
    return new Position(lineNumber, column);
  }
  _moveToNextMatch(after) {
    if (!this._state.canNavigateForward()) {
      const prevMatchRange = this._decorations.matchBeforePosition(after);
      if (prevMatchRange) {
        this._setCurrentFindMatch(prevMatchRange);
      }
      return;
    }
    if (this._decorations.getCount() < MATCHES_LIMIT) {
      let nextMatchRange = this._decorations.matchAfterPosition(after);
      if (nextMatchRange && nextMatchRange.isEmpty() && nextMatchRange.getStartPosition().equals(after)) {
        after = this._nextSearchPosition(after);
        nextMatchRange = this._decorations.matchAfterPosition(after);
      }
      if (nextMatchRange) {
        this._setCurrentFindMatch(nextMatchRange);
      }
      return;
    }
    const nextMatch = this._getNextMatch(after, false, true);
    if (nextMatch) {
      this._setCurrentFindMatch(nextMatch.range);
    }
  }
  _getNextMatch(after, captureMatches, forceMove, isRecursed = false) {
    if (this._cannotFind()) {
      return null;
    }
    const findScope = this._decorations.getFindScope();
    const searchRange = FindModelBoundToEditorModel._getSearchRange(
      this._editor.getModel(),
      findScope
    );
    if (searchRange.getEndPosition().isBefore(after)) {
      after = searchRange.getStartPosition();
    }
    if (after.isBefore(searchRange.getStartPosition())) {
      after = searchRange.getStartPosition();
    }
    const { lineNumber, column } = after;
    const model = this._editor.getModel();
    let position = new Position(lineNumber, column);
    let nextMatch = model.findNextMatch(
      this._state.searchString,
      position,
      this._state.isRegex,
      this._state.matchCase,
      this._state.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
      captureMatches
    );
    if (forceMove && nextMatch && nextMatch.range.isEmpty() && nextMatch.range.getStartPosition().equals(position)) {
      position = this._nextSearchPosition(position);
      nextMatch = model.findNextMatch(
        this._state.searchString,
        position,
        this._state.isRegex,
        this._state.matchCase,
        this._state.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
        captureMatches
      );
    }
    if (!nextMatch) {
      return null;
    }
    if (!isRecursed && !searchRange.containsRange(nextMatch.range)) {
      return this._getNextMatch(
        nextMatch.range.getEndPosition(),
        captureMatches,
        forceMove,
        true
      );
    }
    return nextMatch;
  }
  moveToNextMatch() {
    this._moveToNextMatch(this._editor.getSelection().getEndPosition());
  }
  _moveToMatch(index) {
    const decorationRange = this._decorations.getDecorationRangeAt(index);
    if (decorationRange) {
      this._setCurrentFindMatch(decorationRange);
    }
  }
  moveToMatch(index) {
    this._moveToMatch(index);
  }
  _getReplacePattern() {
    if (this._state.isRegex) {
      return parseReplaceString(this._state.replaceString);
    }
    return ReplacePattern.fromStaticValue(this._state.replaceString);
  }
  replace() {
    if (!this._hasMatches()) {
      return;
    }
    const replacePattern = this._getReplacePattern();
    const selection = this._editor.getSelection();
    const nextMatch = this._getNextMatch(
      selection.getStartPosition(),
      true,
      false
    );
    if (nextMatch) {
      if (selection.equalsRange(nextMatch.range)) {
        const replaceString = replacePattern.buildReplaceString(
          nextMatch.matches,
          this._state.preserveCase
        );
        const command = new ReplaceCommand(selection, replaceString);
        this._executeEditorCommand("replace", command);
        this._decorations.setStartPosition(
          new Position(
            selection.startLineNumber,
            selection.startColumn + replaceString.length
          )
        );
        this.research(true);
      } else {
        this._decorations.setStartPosition(this._editor.getPosition());
        this._setCurrentFindMatch(nextMatch.range);
      }
    }
  }
  _findMatches(findScopes, captureMatches, limitResultCount) {
    const searchRanges = (findScopes || [null]).map(
      (scope) => FindModelBoundToEditorModel._getSearchRange(
        this._editor.getModel(),
        scope
      )
    );
    return this._editor.getModel().findMatches(
      this._state.searchString,
      searchRanges,
      this._state.isRegex,
      this._state.matchCase,
      this._state.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null,
      captureMatches,
      limitResultCount
    );
  }
  replaceAll() {
    if (!this._hasMatches()) {
      return;
    }
    const findScopes = this._decorations.getFindScopes();
    if (findScopes === null && this._state.matchesCount >= MATCHES_LIMIT) {
      this._largeReplaceAll();
    } else {
      this._regularReplaceAll(findScopes);
    }
    this.research(false);
  }
  _largeReplaceAll() {
    const searchParams = new SearchParams(
      this._state.searchString,
      this._state.isRegex,
      this._state.matchCase,
      this._state.wholeWord ? this._editor.getOption(EditorOption.wordSeparators) : null
    );
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return;
    }
    let searchRegex = searchData.regex;
    if (!searchRegex.multiline) {
      let mod = "mu";
      if (searchRegex.ignoreCase) {
        mod += "i";
      }
      if (searchRegex.global) {
        mod += "g";
      }
      searchRegex = new RegExp(searchRegex.source, mod);
    }
    const model = this._editor.getModel();
    const modelText = model.getValue(EndOfLinePreference.LF);
    const fullModelRange = model.getFullModelRange();
    const replacePattern = this._getReplacePattern();
    let resultText;
    const preserveCase = this._state.preserveCase;
    if (replacePattern.hasReplacementPatterns || preserveCase) {
      resultText = modelText.replace(
        searchRegex,
        () => replacePattern.buildReplaceString(
          arguments,
          preserveCase
        )
      );
    } else {
      resultText = modelText.replace(
        searchRegex,
        replacePattern.buildReplaceString(null, preserveCase)
      );
    }
    const command = new ReplaceCommandThatPreservesSelection(
      fullModelRange,
      resultText,
      this._editor.getSelection()
    );
    this._executeEditorCommand("replaceAll", command);
  }
  _regularReplaceAll(findScopes) {
    const replacePattern = this._getReplacePattern();
    const matches = this._findMatches(
      findScopes,
      replacePattern.hasReplacementPatterns || this._state.preserveCase,
      Constants.MAX_SAFE_SMALL_INTEGER
    );
    const replaceStrings = [];
    for (let i = 0, len = matches.length; i < len; i++) {
      replaceStrings[i] = replacePattern.buildReplaceString(
        matches[i].matches,
        this._state.preserveCase
      );
    }
    const command = new ReplaceAllCommand(
      this._editor.getSelection(),
      matches.map((m) => m.range),
      replaceStrings
    );
    this._executeEditorCommand("replaceAll", command);
  }
  selectAllMatches() {
    if (!this._hasMatches()) {
      return;
    }
    const findScopes = this._decorations.getFindScopes();
    const matches = this._findMatches(
      findScopes,
      false,
      Constants.MAX_SAFE_SMALL_INTEGER
    );
    let selections = matches.map(
      (m) => new Selection(
        m.range.startLineNumber,
        m.range.startColumn,
        m.range.endLineNumber,
        m.range.endColumn
      )
    );
    const editorSelection = this._editor.getSelection();
    for (let i = 0, len = selections.length; i < len; i++) {
      const sel = selections[i];
      if (sel.equalsRange(editorSelection)) {
        selections = [editorSelection].concat(selections.slice(0, i)).concat(selections.slice(i + 1));
        break;
      }
    }
    this._editor.setSelections(selections);
  }
  _executeEditorCommand(source, command) {
    try {
      this._ignoreModelContentChanged = true;
      this._editor.pushUndoStop();
      this._editor.executeCommand(source, command);
      this._editor.pushUndoStop();
    } finally {
      this._ignoreModelContentChanged = false;
    }
  }
}
export {
  CONTEXT_FIND_INPUT_FOCUSED,
  CONTEXT_FIND_WIDGET_NOT_VISIBLE,
  CONTEXT_FIND_WIDGET_VISIBLE,
  CONTEXT_REPLACE_INPUT_FOCUSED,
  FIND_IDS,
  FindModelBoundToEditorModel,
  MATCHES_LIMIT,
  ToggleCaseSensitiveKeybinding,
  TogglePreserveCaseKeybinding,
  ToggleRegexKeybinding,
  ToggleSearchScopeKeybinding,
  ToggleWholeWordKeybinding
};
//# sourceMappingURL=findModel.js.map
