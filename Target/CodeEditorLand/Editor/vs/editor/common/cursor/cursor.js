var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../../../base/common/errors.js";
import { Disposable, dispose } from "../../../base/common/lifecycle.js";
import * as strings from "../../../base/common/strings.js";
import { Range } from "../core/range.js";
import {
  Selection,
  SelectionDirection
} from "../core/selection.js";
import {
  CursorState,
  EditOperationResult,
  EditOperationType
} from "../cursorCommon.js";
import { CursorChangeReason } from "../cursorEvents.js";
import * as editorCommon from "../editorCommon.js";
import {
  TrackedRangeStickiness
} from "../model.js";
import {
  ModelInjectedTextChangedEvent,
  RawContentChangedType
} from "../textModelEvents.js";
import {
  VerticalRevealType,
  ViewCursorStateChangedEvent,
  ViewRevealRangeRequestEvent
} from "../viewEvents.js";
import {
  CursorStateChangedEvent
} from "../viewModelEventDispatcher.js";
import { CursorCollection } from "./cursorCollection.js";
import { CursorContext } from "./cursorContext.js";
import { DeleteOperations } from "./cursorDeleteOperations.js";
import { BaseTypeWithAutoClosingCommand } from "./cursorTypeEditOperations.js";
import { CompositionOutcome, TypeOperations } from "./cursorTypeOperations.js";
class CursorsController extends Disposable {
  static {
    __name(this, "CursorsController");
  }
  _model;
  _knownModelVersionId;
  _viewModel;
  _coordinatesConverter;
  context;
  _cursors;
  _hasFocus;
  _isHandling;
  _compositionState;
  _columnSelectData;
  _autoClosedActions;
  _prevEditOperationType;
  constructor(model, viewModel, coordinatesConverter, cursorConfig) {
    super();
    this._model = model;
    this._knownModelVersionId = this._model.getVersionId();
    this._viewModel = viewModel;
    this._coordinatesConverter = coordinatesConverter;
    this.context = new CursorContext(
      this._model,
      this._viewModel,
      this._coordinatesConverter,
      cursorConfig
    );
    this._cursors = new CursorCollection(this.context);
    this._hasFocus = false;
    this._isHandling = false;
    this._compositionState = null;
    this._columnSelectData = null;
    this._autoClosedActions = [];
    this._prevEditOperationType = EditOperationType.Other;
  }
  dispose() {
    this._cursors.dispose();
    this._autoClosedActions = dispose(this._autoClosedActions);
    super.dispose();
  }
  updateConfiguration(cursorConfig) {
    this.context = new CursorContext(
      this._model,
      this._viewModel,
      this._coordinatesConverter,
      cursorConfig
    );
    this._cursors.updateContext(this.context);
  }
  onLineMappingChanged(eventsCollector) {
    if (this._knownModelVersionId !== this._model.getVersionId()) {
      return;
    }
    this.setStates(
      eventsCollector,
      "viewModel",
      CursorChangeReason.NotSet,
      this.getCursorStates()
    );
  }
  setHasFocus(hasFocus) {
    this._hasFocus = hasFocus;
  }
  _validateAutoClosedActions() {
    if (this._autoClosedActions.length > 0) {
      const selections = this._cursors.getSelections();
      for (let i = 0; i < this._autoClosedActions.length; i++) {
        const autoClosedAction = this._autoClosedActions[i];
        if (!autoClosedAction.isValid(selections)) {
          autoClosedAction.dispose();
          this._autoClosedActions.splice(i, 1);
          i--;
        }
      }
    }
  }
  // ------ some getters/setters
  getPrimaryCursorState() {
    return this._cursors.getPrimaryCursor();
  }
  getLastAddedCursorIndex() {
    return this._cursors.getLastAddedCursorIndex();
  }
  getCursorStates() {
    return this._cursors.getAll();
  }
  setStates(eventsCollector, source, reason, states) {
    let reachedMaxCursorCount = false;
    const multiCursorLimit = this.context.cursorConfig.multiCursorLimit;
    if (states !== null && states.length > multiCursorLimit) {
      states = states.slice(0, multiCursorLimit);
      reachedMaxCursorCount = true;
    }
    const oldState = CursorModelState.from(this._model, this);
    this._cursors.setStates(states);
    this._cursors.normalize();
    this._columnSelectData = null;
    this._validateAutoClosedActions();
    return this._emitStateChangedIfNecessary(
      eventsCollector,
      source,
      reason,
      oldState,
      reachedMaxCursorCount
    );
  }
  setCursorColumnSelectData(columnSelectData) {
    this._columnSelectData = columnSelectData;
  }
  revealAll(eventsCollector, source, minimalReveal, verticalType, revealHorizontal, scrollType) {
    const viewPositions = this._cursors.getViewPositions();
    let revealViewRange = null;
    let revealViewSelections = null;
    if (viewPositions.length > 1) {
      revealViewSelections = this._cursors.getViewSelections();
    } else {
      revealViewRange = Range.fromPositions(
        viewPositions[0],
        viewPositions[0]
      );
    }
    eventsCollector.emitViewEvent(
      new ViewRevealRangeRequestEvent(
        source,
        minimalReveal,
        revealViewRange,
        revealViewSelections,
        verticalType,
        revealHorizontal,
        scrollType
      )
    );
  }
  revealPrimary(eventsCollector, source, minimalReveal, verticalType, revealHorizontal, scrollType) {
    const primaryCursor = this._cursors.getPrimaryCursor();
    const revealViewSelections = [primaryCursor.viewState.selection];
    eventsCollector.emitViewEvent(
      new ViewRevealRangeRequestEvent(
        source,
        minimalReveal,
        null,
        revealViewSelections,
        verticalType,
        revealHorizontal,
        scrollType
      )
    );
  }
  saveState() {
    const result = [];
    const selections = this._cursors.getSelections();
    for (let i = 0, len = selections.length; i < len; i++) {
      const selection = selections[i];
      result.push({
        inSelectionMode: !selection.isEmpty(),
        selectionStart: {
          lineNumber: selection.selectionStartLineNumber,
          column: selection.selectionStartColumn
        },
        position: {
          lineNumber: selection.positionLineNumber,
          column: selection.positionColumn
        }
      });
    }
    return result;
  }
  restoreState(eventsCollector, states) {
    const desiredSelections = [];
    for (let i = 0, len = states.length; i < len; i++) {
      const state = states[i];
      let positionLineNumber = 1;
      let positionColumn = 1;
      if (state.position && state.position.lineNumber) {
        positionLineNumber = state.position.lineNumber;
      }
      if (state.position && state.position.column) {
        positionColumn = state.position.column;
      }
      let selectionStartLineNumber = positionLineNumber;
      let selectionStartColumn = positionColumn;
      if (state.selectionStart && state.selectionStart.lineNumber) {
        selectionStartLineNumber = state.selectionStart.lineNumber;
      }
      if (state.selectionStart && state.selectionStart.column) {
        selectionStartColumn = state.selectionStart.column;
      }
      desiredSelections.push({
        selectionStartLineNumber,
        selectionStartColumn,
        positionLineNumber,
        positionColumn
      });
    }
    this.setStates(
      eventsCollector,
      "restoreState",
      CursorChangeReason.NotSet,
      CursorState.fromModelSelections(desiredSelections)
    );
    this.revealAll(
      eventsCollector,
      "restoreState",
      false,
      VerticalRevealType.Simple,
      true,
      editorCommon.ScrollType.Immediate
    );
  }
  onModelContentChanged(eventsCollector, event) {
    if (event instanceof ModelInjectedTextChangedEvent) {
      if (this._isHandling) {
        return;
      }
      this._isHandling = true;
      try {
        this.setStates(
          eventsCollector,
          "modelChange",
          CursorChangeReason.NotSet,
          this.getCursorStates()
        );
      } finally {
        this._isHandling = false;
      }
    } else {
      const e = event.rawContentChangedEvent;
      this._knownModelVersionId = e.versionId;
      if (this._isHandling) {
        return;
      }
      const hadFlushEvent = e.containsEvent(RawContentChangedType.Flush);
      this._prevEditOperationType = EditOperationType.Other;
      if (hadFlushEvent) {
        this._cursors.dispose();
        this._cursors = new CursorCollection(this.context);
        this._validateAutoClosedActions();
        this._emitStateChangedIfNecessary(
          eventsCollector,
          "model",
          CursorChangeReason.ContentFlush,
          null,
          false
        );
      } else if (this._hasFocus && e.resultingSelection && e.resultingSelection.length > 0) {
        const cursorState = CursorState.fromModelSelections(
          e.resultingSelection
        );
        if (this.setStates(
          eventsCollector,
          "modelChange",
          e.isUndoing ? CursorChangeReason.Undo : e.isRedoing ? CursorChangeReason.Redo : CursorChangeReason.RecoverFromMarkers,
          cursorState
        )) {
          this.revealAll(
            eventsCollector,
            "modelChange",
            false,
            VerticalRevealType.Simple,
            true,
            editorCommon.ScrollType.Smooth
          );
        }
      } else {
        const selectionsFromMarkers = this._cursors.readSelectionFromMarkers();
        this.setStates(
          eventsCollector,
          "modelChange",
          CursorChangeReason.RecoverFromMarkers,
          CursorState.fromModelSelections(selectionsFromMarkers)
        );
      }
    }
  }
  getSelection() {
    return this._cursors.getPrimaryCursor().modelState.selection;
  }
  getTopMostViewPosition() {
    return this._cursors.getTopMostViewPosition();
  }
  getBottomMostViewPosition() {
    return this._cursors.getBottomMostViewPosition();
  }
  getCursorColumnSelectData() {
    if (this._columnSelectData) {
      return this._columnSelectData;
    }
    const primaryCursor = this._cursors.getPrimaryCursor();
    const viewSelectionStart = primaryCursor.viewState.selectionStart.getStartPosition();
    const viewPosition = primaryCursor.viewState.position;
    return {
      isReal: false,
      fromViewLineNumber: viewSelectionStart.lineNumber,
      fromViewVisualColumn: this.context.cursorConfig.visibleColumnFromColumn(
        this._viewModel,
        viewSelectionStart
      ),
      toViewLineNumber: viewPosition.lineNumber,
      toViewVisualColumn: this.context.cursorConfig.visibleColumnFromColumn(
        this._viewModel,
        viewPosition
      )
    };
  }
  getSelections() {
    return this._cursors.getSelections();
  }
  getPosition() {
    return this._cursors.getPrimaryCursor().modelState.position;
  }
  setSelections(eventsCollector, source, selections, reason) {
    this.setStates(
      eventsCollector,
      source,
      reason,
      CursorState.fromModelSelections(selections)
    );
  }
  getPrevEditOperationType() {
    return this._prevEditOperationType;
  }
  setPrevEditOperationType(type) {
    this._prevEditOperationType = type;
  }
  // ------ auxiliary handling logic
  _pushAutoClosedAction(autoClosedCharactersRanges, autoClosedEnclosingRanges) {
    const autoClosedCharactersDeltaDecorations = [];
    const autoClosedEnclosingDeltaDecorations = [];
    for (let i = 0, len = autoClosedCharactersRanges.length; i < len; i++) {
      autoClosedCharactersDeltaDecorations.push({
        range: autoClosedCharactersRanges[i],
        options: {
          description: "auto-closed-character",
          inlineClassName: "auto-closed-character",
          stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      });
      autoClosedEnclosingDeltaDecorations.push({
        range: autoClosedEnclosingRanges[i],
        options: {
          description: "auto-closed-enclosing",
          stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      });
    }
    const autoClosedCharactersDecorations = this._model.deltaDecorations(
      [],
      autoClosedCharactersDeltaDecorations
    );
    const autoClosedEnclosingDecorations = this._model.deltaDecorations(
      [],
      autoClosedEnclosingDeltaDecorations
    );
    this._autoClosedActions.push(
      new AutoClosedAction(
        this._model,
        autoClosedCharactersDecorations,
        autoClosedEnclosingDecorations
      )
    );
  }
  _executeEditOperation(opResult) {
    if (!opResult) {
      return;
    }
    if (opResult.shouldPushStackElementBefore) {
      this._model.pushStackElement();
    }
    const result = CommandExecutor.executeCommands(
      this._model,
      this._cursors.getSelections(),
      opResult.commands
    );
    if (result) {
      this._interpretCommandResult(result);
      const autoClosedCharactersRanges = [];
      const autoClosedEnclosingRanges = [];
      for (let i = 0; i < opResult.commands.length; i++) {
        const command = opResult.commands[i];
        if (command instanceof BaseTypeWithAutoClosingCommand && command.enclosingRange && command.closeCharacterRange) {
          autoClosedCharactersRanges.push(
            command.closeCharacterRange
          );
          autoClosedEnclosingRanges.push(command.enclosingRange);
        }
      }
      if (autoClosedCharactersRanges.length > 0) {
        this._pushAutoClosedAction(
          autoClosedCharactersRanges,
          autoClosedEnclosingRanges
        );
      }
      this._prevEditOperationType = opResult.type;
    }
    if (opResult.shouldPushStackElementAfter) {
      this._model.pushStackElement();
    }
  }
  _interpretCommandResult(cursorState) {
    if (!cursorState || cursorState.length === 0) {
      cursorState = this._cursors.readSelectionFromMarkers();
    }
    this._columnSelectData = null;
    this._cursors.setSelections(cursorState);
    this._cursors.normalize();
  }
  // -----------------------------------------------------------------------------------------------------------
  // ----- emitting events
  _emitStateChangedIfNecessary(eventsCollector, source, reason, oldState, reachedMaxCursorCount) {
    const newState = CursorModelState.from(this._model, this);
    if (newState.equals(oldState)) {
      return false;
    }
    const selections = this._cursors.getSelections();
    const viewSelections = this._cursors.getViewSelections();
    eventsCollector.emitViewEvent(
      new ViewCursorStateChangedEvent(viewSelections, selections, reason)
    );
    if (!oldState || oldState.cursorState.length !== newState.cursorState.length || newState.cursorState.some(
      (newCursorState, i) => !newCursorState.modelState.equals(
        oldState.cursorState[i].modelState
      )
    )) {
      const oldSelections = oldState ? oldState.cursorState.map((s) => s.modelState.selection) : null;
      const oldModelVersionId = oldState ? oldState.modelVersionId : 0;
      eventsCollector.emitOutgoingEvent(
        new CursorStateChangedEvent(
          oldSelections,
          selections,
          oldModelVersionId,
          newState.modelVersionId,
          source || "keyboard",
          reason,
          reachedMaxCursorCount
        )
      );
    }
    return true;
  }
  // -----------------------------------------------------------------------------------------------------------
  // ----- handlers beyond this point
  _findAutoClosingPairs(edits) {
    if (!edits.length) {
      return null;
    }
    const indices = [];
    for (let i = 0, len = edits.length; i < len; i++) {
      const edit = edits[i];
      if (!edit.text || edit.text.indexOf("\n") >= 0) {
        return null;
      }
      const m = edit.text.match(/([)\]}>'"`])([^)\]}>'"`]*)$/);
      if (!m) {
        return null;
      }
      const closeChar = m[1];
      const autoClosingPairsCandidates = this.context.cursorConfig.autoClosingPairs.autoClosingPairsCloseSingleChar.get(
        closeChar
      );
      if (!autoClosingPairsCandidates || autoClosingPairsCandidates.length !== 1) {
        return null;
      }
      const openChar = autoClosingPairsCandidates[0].open;
      const closeCharIndex = edit.text.length - m[2].length - 1;
      const openCharIndex = edit.text.lastIndexOf(
        openChar,
        closeCharIndex - 1
      );
      if (openCharIndex === -1) {
        return null;
      }
      indices.push([openCharIndex, closeCharIndex]);
    }
    return indices;
  }
  executeEdits(eventsCollector, source, edits, cursorStateComputer) {
    let autoClosingIndices = null;
    if (source === "snippet") {
      autoClosingIndices = this._findAutoClosingPairs(edits);
    }
    if (autoClosingIndices) {
      edits[0]._isTracked = true;
    }
    const autoClosedCharactersRanges = [];
    const autoClosedEnclosingRanges = [];
    const selections = this._model.pushEditOperations(
      this.getSelections(),
      edits,
      (undoEdits) => {
        if (autoClosingIndices) {
          for (let i = 0, len = autoClosingIndices.length; i < len; i++) {
            const [openCharInnerIndex, closeCharInnerIndex] = autoClosingIndices[i];
            const undoEdit = undoEdits[i];
            const lineNumber = undoEdit.range.startLineNumber;
            const openCharIndex = undoEdit.range.startColumn - 1 + openCharInnerIndex;
            const closeCharIndex = undoEdit.range.startColumn - 1 + closeCharInnerIndex;
            autoClosedCharactersRanges.push(
              new Range(
                lineNumber,
                closeCharIndex + 1,
                lineNumber,
                closeCharIndex + 2
              )
            );
            autoClosedEnclosingRanges.push(
              new Range(
                lineNumber,
                openCharIndex + 1,
                lineNumber,
                closeCharIndex + 2
              )
            );
          }
        }
        const selections2 = cursorStateComputer(undoEdits);
        if (selections2) {
          this._isHandling = true;
        }
        return selections2;
      }
    );
    if (selections) {
      this._isHandling = false;
      this.setSelections(
        eventsCollector,
        source,
        selections,
        CursorChangeReason.NotSet
      );
    }
    if (autoClosedCharactersRanges.length > 0) {
      this._pushAutoClosedAction(
        autoClosedCharactersRanges,
        autoClosedEnclosingRanges
      );
    }
  }
  _executeEdit(callback, eventsCollector, source, cursorChangeReason = CursorChangeReason.NotSet) {
    if (this.context.cursorConfig.readOnly) {
      return;
    }
    const oldState = CursorModelState.from(this._model, this);
    this._cursors.stopTrackingSelections();
    this._isHandling = true;
    try {
      this._cursors.ensureValidState();
      callback();
    } catch (err) {
      onUnexpectedError(err);
    }
    this._isHandling = false;
    this._cursors.startTrackingSelections();
    this._validateAutoClosedActions();
    if (this._emitStateChangedIfNecessary(
      eventsCollector,
      source,
      cursorChangeReason,
      oldState,
      false
    )) {
      this.revealAll(
        eventsCollector,
        source,
        false,
        VerticalRevealType.Simple,
        true,
        editorCommon.ScrollType.Smooth
      );
    }
  }
  getAutoClosedCharacters() {
    return AutoClosedAction.getAllAutoClosedCharacters(
      this._autoClosedActions
    );
  }
  startComposition(eventsCollector) {
    this._compositionState = new CompositionState(
      this._model,
      this.getSelections()
    );
  }
  endComposition(eventsCollector, source) {
    const compositionOutcome = this._compositionState ? this._compositionState.deduceOutcome(
      this._model,
      this.getSelections()
    ) : null;
    this._compositionState = null;
    this._executeEdit(
      () => {
        if (source === "keyboard") {
          this._executeEditOperation(
            TypeOperations.compositionEndWithInterceptors(
              this._prevEditOperationType,
              this.context.cursorConfig,
              this._model,
              compositionOutcome,
              this.getSelections(),
              this.getAutoClosedCharacters()
            )
          );
        }
      },
      eventsCollector,
      source
    );
  }
  type(eventsCollector, text, source) {
    this._executeEdit(
      () => {
        if (source === "keyboard") {
          const len = text.length;
          let offset = 0;
          while (offset < len) {
            const charLength = strings.nextCharLength(text, offset);
            const chr = text.substr(offset, charLength);
            this._executeEditOperation(
              TypeOperations.typeWithInterceptors(
                !!this._compositionState,
                this._prevEditOperationType,
                this.context.cursorConfig,
                this._model,
                this.getSelections(),
                this.getAutoClosedCharacters(),
                chr
              )
            );
            offset += charLength;
          }
        } else {
          this._executeEditOperation(
            TypeOperations.typeWithoutInterceptors(
              this._prevEditOperationType,
              this.context.cursorConfig,
              this._model,
              this.getSelections(),
              text
            )
          );
        }
      },
      eventsCollector,
      source
    );
  }
  compositionType(eventsCollector, text, replacePrevCharCnt, replaceNextCharCnt, positionDelta, source) {
    if (text.length === 0 && replacePrevCharCnt === 0 && replaceNextCharCnt === 0) {
      if (positionDelta !== 0) {
        const newSelections = this.getSelections().map((selection) => {
          const position = selection.getPosition();
          return new Selection(
            position.lineNumber,
            position.column + positionDelta,
            position.lineNumber,
            position.column + positionDelta
          );
        });
        this.setSelections(
          eventsCollector,
          source,
          newSelections,
          CursorChangeReason.NotSet
        );
      }
      return;
    }
    this._executeEdit(
      () => {
        this._executeEditOperation(
          TypeOperations.compositionType(
            this._prevEditOperationType,
            this.context.cursorConfig,
            this._model,
            this.getSelections(),
            text,
            replacePrevCharCnt,
            replaceNextCharCnt,
            positionDelta
          )
        );
      },
      eventsCollector,
      source
    );
  }
  paste(eventsCollector, text, pasteOnNewLine, multicursorText, source) {
    this._executeEdit(
      () => {
        this._executeEditOperation(
          TypeOperations.paste(
            this.context.cursorConfig,
            this._model,
            this.getSelections(),
            text,
            pasteOnNewLine,
            multicursorText || []
          )
        );
      },
      eventsCollector,
      source,
      CursorChangeReason.Paste
    );
  }
  cut(eventsCollector, source) {
    this._executeEdit(
      () => {
        this._executeEditOperation(
          DeleteOperations.cut(
            this.context.cursorConfig,
            this._model,
            this.getSelections()
          )
        );
      },
      eventsCollector,
      source
    );
  }
  executeCommand(eventsCollector, command, source) {
    this._executeEdit(
      () => {
        this._cursors.killSecondaryCursors();
        this._executeEditOperation(
          new EditOperationResult(
            EditOperationType.Other,
            [command],
            {
              shouldPushStackElementBefore: false,
              shouldPushStackElementAfter: false
            }
          )
        );
      },
      eventsCollector,
      source
    );
  }
  executeCommands(eventsCollector, commands, source) {
    this._executeEdit(
      () => {
        this._executeEditOperation(
          new EditOperationResult(EditOperationType.Other, commands, {
            shouldPushStackElementBefore: false,
            shouldPushStackElementAfter: false
          })
        );
      },
      eventsCollector,
      source
    );
  }
}
class CursorModelState {
  constructor(modelVersionId, cursorState) {
    this.modelVersionId = modelVersionId;
    this.cursorState = cursorState;
  }
  static {
    __name(this, "CursorModelState");
  }
  static from(model, cursor) {
    return new CursorModelState(
      model.getVersionId(),
      cursor.getCursorStates()
    );
  }
  equals(other) {
    if (!other) {
      return false;
    }
    if (this.modelVersionId !== other.modelVersionId) {
      return false;
    }
    if (this.cursorState.length !== other.cursorState.length) {
      return false;
    }
    for (let i = 0, len = this.cursorState.length; i < len; i++) {
      if (!this.cursorState[i].equals(other.cursorState[i])) {
        return false;
      }
    }
    return true;
  }
}
class AutoClosedAction {
  static {
    __name(this, "AutoClosedAction");
  }
  static getAllAutoClosedCharacters(autoClosedActions) {
    let autoClosedCharacters = [];
    for (const autoClosedAction of autoClosedActions) {
      autoClosedCharacters = autoClosedCharacters.concat(
        autoClosedAction.getAutoClosedCharactersRanges()
      );
    }
    return autoClosedCharacters;
  }
  _model;
  _autoClosedCharactersDecorations;
  _autoClosedEnclosingDecorations;
  constructor(model, autoClosedCharactersDecorations, autoClosedEnclosingDecorations) {
    this._model = model;
    this._autoClosedCharactersDecorations = autoClosedCharactersDecorations;
    this._autoClosedEnclosingDecorations = autoClosedEnclosingDecorations;
  }
  dispose() {
    this._autoClosedCharactersDecorations = this._model.deltaDecorations(
      this._autoClosedCharactersDecorations,
      []
    );
    this._autoClosedEnclosingDecorations = this._model.deltaDecorations(
      this._autoClosedEnclosingDecorations,
      []
    );
  }
  getAutoClosedCharactersRanges() {
    const result = [];
    for (let i = 0; i < this._autoClosedCharactersDecorations.length; i++) {
      const decorationRange = this._model.getDecorationRange(
        this._autoClosedCharactersDecorations[i]
      );
      if (decorationRange) {
        result.push(decorationRange);
      }
    }
    return result;
  }
  isValid(selections) {
    const enclosingRanges = [];
    for (let i = 0; i < this._autoClosedEnclosingDecorations.length; i++) {
      const decorationRange = this._model.getDecorationRange(
        this._autoClosedEnclosingDecorations[i]
      );
      if (decorationRange) {
        enclosingRanges.push(decorationRange);
        if (decorationRange.startLineNumber !== decorationRange.endLineNumber) {
          return false;
        }
      }
    }
    enclosingRanges.sort(Range.compareRangesUsingStarts);
    selections.sort(Range.compareRangesUsingStarts);
    for (let i = 0; i < selections.length; i++) {
      if (i >= enclosingRanges.length) {
        return false;
      }
      if (!enclosingRanges[i].strictContainsRange(selections[i])) {
        return false;
      }
    }
    return true;
  }
}
class CommandExecutor {
  static {
    __name(this, "CommandExecutor");
  }
  static executeCommands(model, selectionsBefore, commands) {
    const ctx = {
      model,
      selectionsBefore,
      trackedRanges: [],
      trackedRangesDirection: []
    };
    const result = this._innerExecuteCommands(ctx, commands);
    for (let i = 0, len = ctx.trackedRanges.length; i < len; i++) {
      ctx.model._setTrackedRange(
        ctx.trackedRanges[i],
        null,
        TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
      );
    }
    return result;
  }
  static _innerExecuteCommands(ctx, commands) {
    if (this._arrayIsEmpty(commands)) {
      return null;
    }
    const commandsData = this._getEditOperations(ctx, commands);
    if (commandsData.operations.length === 0) {
      return null;
    }
    const rawOperations = commandsData.operations;
    const loserCursorsMap = this._getLoserCursorMap(rawOperations);
    if (loserCursorsMap.hasOwnProperty("0")) {
      console.warn("Ignoring commands");
      return null;
    }
    const filteredOperations = [];
    for (let i = 0, len = rawOperations.length; i < len; i++) {
      if (!loserCursorsMap.hasOwnProperty(
        rawOperations[i].identifier.major.toString()
      )) {
        filteredOperations.push(rawOperations[i]);
      }
    }
    if (commandsData.hadTrackedEditOperation && filteredOperations.length > 0) {
      filteredOperations[0]._isTracked = true;
    }
    let selectionsAfter = ctx.model.pushEditOperations(
      ctx.selectionsBefore,
      filteredOperations,
      (inverseEditOperations) => {
        const groupedInverseEditOperations = [];
        for (let i = 0; i < ctx.selectionsBefore.length; i++) {
          groupedInverseEditOperations[i] = [];
        }
        for (const op of inverseEditOperations) {
          if (!op.identifier) {
            continue;
          }
          groupedInverseEditOperations[op.identifier.major].push(op);
        }
        const minorBasedSorter = /* @__PURE__ */ __name((a, b) => {
          return a.identifier.minor - b.identifier.minor;
        }, "minorBasedSorter");
        const cursorSelections = [];
        for (let i = 0; i < ctx.selectionsBefore.length; i++) {
          if (groupedInverseEditOperations[i].length > 0) {
            groupedInverseEditOperations[i].sort(minorBasedSorter);
            cursorSelections[i] = commands[i].computeCursorState(
              ctx.model,
              {
                getInverseEditOperations: /* @__PURE__ */ __name(() => {
                  return groupedInverseEditOperations[i];
                }, "getInverseEditOperations"),
                getTrackedSelection: /* @__PURE__ */ __name((id) => {
                  const idx = Number.parseInt(id, 10);
                  const range = ctx.model._getTrackedRange(
                    ctx.trackedRanges[idx]
                  );
                  if (ctx.trackedRangesDirection[idx] === SelectionDirection.LTR) {
                    return new Selection(
                      range.startLineNumber,
                      range.startColumn,
                      range.endLineNumber,
                      range.endColumn
                    );
                  }
                  return new Selection(
                    range.endLineNumber,
                    range.endColumn,
                    range.startLineNumber,
                    range.startColumn
                  );
                }, "getTrackedSelection")
              }
            );
          } else {
            cursorSelections[i] = ctx.selectionsBefore[i];
          }
        }
        return cursorSelections;
      }
    );
    if (!selectionsAfter) {
      selectionsAfter = ctx.selectionsBefore;
    }
    const losingCursors = [];
    for (const losingCursorIndex in loserCursorsMap) {
      if (loserCursorsMap.hasOwnProperty(losingCursorIndex)) {
        losingCursors.push(Number.parseInt(losingCursorIndex, 10));
      }
    }
    losingCursors.sort((a, b) => {
      return b - a;
    });
    for (const losingCursor of losingCursors) {
      selectionsAfter.splice(losingCursor, 1);
    }
    return selectionsAfter;
  }
  static _arrayIsEmpty(commands) {
    for (let i = 0, len = commands.length; i < len; i++) {
      if (commands[i]) {
        return false;
      }
    }
    return true;
  }
  static _getEditOperations(ctx, commands) {
    let operations = [];
    let hadTrackedEditOperation = false;
    for (let i = 0, len = commands.length; i < len; i++) {
      const command = commands[i];
      if (command) {
        const r = this._getEditOperationsFromCommand(ctx, i, command);
        operations = operations.concat(r.operations);
        hadTrackedEditOperation = hadTrackedEditOperation || r.hadTrackedEditOperation;
      }
    }
    return {
      operations,
      hadTrackedEditOperation
    };
  }
  static _getEditOperationsFromCommand(ctx, majorIdentifier, command) {
    const operations = [];
    let operationMinor = 0;
    const addEditOperation = /* @__PURE__ */ __name((range, text, forceMoveMarkers = false) => {
      if (Range.isEmpty(range) && text === "") {
        return;
      }
      operations.push({
        identifier: {
          major: majorIdentifier,
          minor: operationMinor++
        },
        range,
        text,
        forceMoveMarkers,
        isAutoWhitespaceEdit: command.insertsAutoWhitespace
      });
    }, "addEditOperation");
    let hadTrackedEditOperation = false;
    const addTrackedEditOperation = /* @__PURE__ */ __name((selection, text, forceMoveMarkers) => {
      hadTrackedEditOperation = true;
      addEditOperation(selection, text, forceMoveMarkers);
    }, "addTrackedEditOperation");
    const trackSelection = /* @__PURE__ */ __name((_selection, trackPreviousOnEmpty) => {
      const selection = Selection.liftSelection(_selection);
      let stickiness;
      if (selection.isEmpty()) {
        if (typeof trackPreviousOnEmpty === "boolean") {
          if (trackPreviousOnEmpty) {
            stickiness = TrackedRangeStickiness.GrowsOnlyWhenTypingBefore;
          } else {
            stickiness = TrackedRangeStickiness.GrowsOnlyWhenTypingAfter;
          }
        } else {
          const maxLineColumn = ctx.model.getLineMaxColumn(
            selection.startLineNumber
          );
          if (selection.startColumn === maxLineColumn) {
            stickiness = TrackedRangeStickiness.GrowsOnlyWhenTypingBefore;
          } else {
            stickiness = TrackedRangeStickiness.GrowsOnlyWhenTypingAfter;
          }
        }
      } else {
        stickiness = TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges;
      }
      const l = ctx.trackedRanges.length;
      const id = ctx.model._setTrackedRange(null, selection, stickiness);
      ctx.trackedRanges[l] = id;
      ctx.trackedRangesDirection[l] = selection.getDirection();
      return l.toString();
    }, "trackSelection");
    const editOperationBuilder = {
      addEditOperation,
      addTrackedEditOperation,
      trackSelection
    };
    try {
      command.getEditOperations(ctx.model, editOperationBuilder);
    } catch (e) {
      onUnexpectedError(e);
      return {
        operations: [],
        hadTrackedEditOperation: false
      };
    }
    return {
      operations,
      hadTrackedEditOperation
    };
  }
  static _getLoserCursorMap(operations) {
    operations = operations.slice(0);
    operations.sort(
      (a, b) => {
        return -Range.compareRangesUsingEnds(a.range, b.range);
      }
    );
    const loserCursorsMap = {};
    for (let i = 1; i < operations.length; i++) {
      const previousOp = operations[i - 1];
      const currentOp = operations[i];
      if (Range.getStartPosition(previousOp.range).isBefore(
        Range.getEndPosition(currentOp.range)
      )) {
        let loserMajor;
        if (previousOp.identifier.major > currentOp.identifier.major) {
          loserMajor = previousOp.identifier.major;
        } else {
          loserMajor = currentOp.identifier.major;
        }
        loserCursorsMap[loserMajor.toString()] = true;
        for (let j = 0; j < operations.length; j++) {
          if (operations[j].identifier.major === loserMajor) {
            operations.splice(j, 1);
            if (j < i) {
              i--;
            }
            j--;
          }
        }
        if (i > 0) {
          i--;
        }
      }
    }
    return loserCursorsMap;
  }
}
class CompositionLineState {
  constructor(text, startSelection, endSelection) {
    this.text = text;
    this.startSelection = startSelection;
    this.endSelection = endSelection;
  }
  static {
    __name(this, "CompositionLineState");
  }
}
class CompositionState {
  static {
    __name(this, "CompositionState");
  }
  _original;
  static _capture(textModel, selections) {
    const result = [];
    for (const selection of selections) {
      if (selection.startLineNumber !== selection.endLineNumber) {
        return null;
      }
      result.push(
        new CompositionLineState(
          textModel.getLineContent(selection.startLineNumber),
          selection.startColumn - 1,
          selection.endColumn - 1
        )
      );
    }
    return result;
  }
  constructor(textModel, selections) {
    this._original = CompositionState._capture(textModel, selections);
  }
  /**
   * Returns the inserted text during this composition.
   * If the composition resulted in existing text being changed (i.e. not a pure insertion) it returns null.
   */
  deduceOutcome(textModel, selections) {
    if (!this._original) {
      return null;
    }
    const current = CompositionState._capture(textModel, selections);
    if (!current) {
      return null;
    }
    if (this._original.length !== current.length) {
      return null;
    }
    const result = [];
    for (let i = 0, len = this._original.length; i < len; i++) {
      result.push(
        CompositionState._deduceOutcome(this._original[i], current[i])
      );
    }
    return result;
  }
  static _deduceOutcome(original, current) {
    const commonPrefix = Math.min(
      original.startSelection,
      current.startSelection,
      strings.commonPrefixLength(original.text, current.text)
    );
    const commonSuffix = Math.min(
      original.text.length - original.endSelection,
      current.text.length - current.endSelection,
      strings.commonSuffixLength(original.text, current.text)
    );
    const deletedText = original.text.substring(
      commonPrefix,
      original.text.length - commonSuffix
    );
    const insertedText = current.text.substring(
      commonPrefix,
      current.text.length - commonSuffix
    );
    return new CompositionOutcome(
      deletedText,
      original.startSelection - commonPrefix,
      original.endSelection - commonPrefix,
      insertedText,
      current.startSelection - commonPrefix,
      current.endSelection - commonPrefix
    );
  }
}
export {
  CommandExecutor,
  CursorsController
};
//# sourceMappingURL=cursor.js.map
