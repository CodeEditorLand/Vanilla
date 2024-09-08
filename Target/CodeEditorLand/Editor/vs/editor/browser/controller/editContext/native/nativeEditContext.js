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
import "./nativeEditContext.css";
import { isFirefox } from "../../../../../base/browser/browser.js";
import { addDisposableListener } from "../../../../../base/browser/dom.js";
import { FastDomNode } from "../../../../../base/browser/fastDomNode.js";
import { StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { Selection } from "../../../../common/core/selection.js";
import { CursorState } from "../../../../common/cursorCommon.js";
import { CursorChangeReason } from "../../../../common/cursorEvents.js";
import {
  EndOfLinePreference
} from "../../../../common/model.js";
import {
  InMemoryClipboardMetadataManager,
  getDataToCopy
} from "../clipboardUtils.js";
import { AbstractEditContext } from "../editContextUtils.js";
import {
  FocusTracker,
  editContextAddDisposableListener
} from "./nativeEditContextUtils.js";
import { ScreenReaderSupport } from "./screenReaderSupport.js";
let NativeEditContext = class extends AbstractEditContext {
  domNode;
  _editContext;
  _screenReaderSupport;
  // Overflow guard container
  _parent;
  _decorations = [];
  _renderingContext;
  _primarySelection = new Selection(1, 1, 1, 1);
  _textStartPositionWithinEditor = new Position(1, 1);
  _compositionRangeWithinEditor;
  _focusTracker;
  constructor(context, viewController, instantiationService, clipboardService) {
    super(context);
    this.domNode = new FastDomNode(document.createElement("div"));
    this.domNode.setClassName(`native-edit-context`);
    this._updateDomAttributes();
    this._focusTracker = this._register(
      new FocusTracker(
        this.domNode.domNode,
        (newFocusValue) => this._context.viewModel.setHasFocus(newFocusValue)
      )
    );
    this._editContext = new EditContext();
    this.domNode.domNode.editContext = this._editContext;
    this._screenReaderSupport = instantiationService.createInstance(
      ScreenReaderSupport,
      this.domNode,
      context
    );
    this._register(
      addDisposableListener(
        this.domNode.domNode,
        "copy",
        () => this._ensureClipboardGetsEditorSelection(clipboardService)
      )
    );
    this._register(
      addDisposableListener(this.domNode.domNode, "cut", () => {
        this._ensureClipboardGetsEditorSelection(clipboardService);
        viewController.cut();
      })
    );
    this._register(
      addDisposableListener(
        this.domNode.domNode,
        "keyup",
        (e) => viewController.emitKeyUp(new StandardKeyboardEvent(e))
      )
    );
    this._register(
      addDisposableListener(
        this.domNode.domNode,
        "keydown",
        async (e) => {
          const standardKeyboardEvent = new StandardKeyboardEvent(e);
          if (standardKeyboardEvent.keyCode === KeyCode.KEY_IN_COMPOSITION) {
            standardKeyboardEvent.stopPropagation();
          }
          if (standardKeyboardEvent.keyCode === KeyCode.Enter) {
            this._onType(viewController, {
              text: "\n",
              replacePrevCharCnt: 0,
              replaceNextCharCnt: 0,
              positionDelta: 0
            });
          }
          viewController.emitKeyDown(standardKeyboardEvent);
        }
      )
    );
    this._register(
      editContextAddDisposableListener(
        this._editContext,
        "textformatupdate",
        (e) => this._handleTextFormatUpdate(e)
      )
    );
    this._register(
      editContextAddDisposableListener(
        this._editContext,
        "characterboundsupdate",
        (e) => this._updateCharacterBounds()
      )
    );
    this._register(
      editContextAddDisposableListener(
        this._editContext,
        "textupdate",
        (e) => {
          const compositionRangeWithinEditor = this._compositionRangeWithinEditor;
          if (compositionRangeWithinEditor) {
            const position = this._context.viewModel.getPrimaryCursorState().viewState.position;
            const newCompositionRangeWithinEditor = Range.fromPositions(
              compositionRangeWithinEditor.getStartPosition(),
              position
            );
            this._compositionRangeWithinEditor = newCompositionRangeWithinEditor;
          }
          this._emitTypeEvent(viewController, e);
          this._screenReaderSupport.writeScreenReaderContent();
        }
      )
    );
    this._register(
      editContextAddDisposableListener(
        this._editContext,
        "compositionstart",
        (e) => {
          const position = this._context.viewModel.getPrimaryCursorState().viewState.position;
          const newCompositionRange = Range.fromPositions(
            position,
            position
          );
          this._compositionRangeWithinEditor = newCompositionRange;
          viewController.compositionStart();
          this._context.viewModel.onCompositionStart();
        }
      )
    );
    this._register(
      editContextAddDisposableListener(
        this._editContext,
        "compositionend",
        (e) => {
          this._compositionRangeWithinEditor = void 0;
          viewController.compositionEnd();
          this._context.viewModel.onCompositionEnd();
        }
      )
    );
  }
  // --- Public methods ---
  dispose() {
    super.dispose();
    this.domNode.domNode.remove();
  }
  appendTo(overflowGuardContainer) {
    overflowGuardContainer.appendChild(this.domNode);
    this._parent = overflowGuardContainer.domNode;
  }
  setAriaOptions() {
    this._screenReaderSupport.setAriaOptions();
  }
  /* Last rendered data needed for correct hit-testing and determining the mouse position.
   * Without this, the selection will blink as incorrect mouse position is calculated */
  getLastRenderData() {
    return this._primarySelection.getPosition();
  }
  prepareRender(ctx) {
    this._renderingContext = ctx;
    this._screenReaderSupport.prepareRender(ctx);
    this._updateEditContext();
    this._updateSelectionAndControlBounds();
    this._updateCharacterBounds();
  }
  render(ctx) {
    this._screenReaderSupport.render(ctx);
  }
  onCursorStateChanged(e) {
    this._primarySelection = e.modelSelections[0] ?? new Selection(1, 1, 1, 1);
    this._screenReaderSupport.onCursorStateChanged(e);
    return true;
  }
  onConfigurationChanged(e) {
    this._screenReaderSupport.onConfigurationChanged(e);
    this._updateDomAttributes();
    return true;
  }
  writeScreenReaderContent() {
    this._screenReaderSupport.writeScreenReaderContent();
  }
  isFocused() {
    return this._focusTracker.isFocused;
  }
  focus() {
    this._focusTracker.focus();
  }
  refreshFocusState() {
  }
  // --- Private methods ---
  _updateDomAttributes() {
    const options = this._context.configuration.options;
    this.domNode.domNode.setAttribute(
      "tabindex",
      String(options.get(EditorOption.tabIndex))
    );
  }
  _updateEditContext() {
    const editContextState = this._getNewEditContextState();
    this._editContext.updateText(
      0,
      Number.MAX_SAFE_INTEGER,
      editContextState.text
    );
    this._editContext.updateSelection(
      editContextState.selectionStartOffset,
      editContextState.selectionEndOffset
    );
    this._textStartPositionWithinEditor = editContextState.textStartPositionWithinEditor;
  }
  _emitTypeEvent(viewController, e) {
    if (!this._editContext) {
      return;
    }
    const model = this._context.viewModel.model;
    const offsetOfStartOfText = model.getOffsetAt(
      this._textStartPositionWithinEditor
    );
    const offsetOfSelectionEnd = model.getOffsetAt(
      this._primarySelection.getEndPosition()
    );
    const offsetOfSelectionStart = model.getOffsetAt(
      this._primarySelection.getStartPosition()
    );
    const selectionEndOffset = offsetOfSelectionEnd - offsetOfStartOfText;
    const selectionStartOffset = offsetOfSelectionStart - offsetOfStartOfText;
    let replaceNextCharCnt = 0;
    let replacePrevCharCnt = 0;
    if (e.updateRangeEnd > selectionEndOffset) {
      replaceNextCharCnt = e.updateRangeEnd - selectionEndOffset;
    }
    if (e.updateRangeStart < selectionStartOffset) {
      replacePrevCharCnt = selectionStartOffset - e.updateRangeStart;
    }
    let text = "";
    if (selectionStartOffset < e.updateRangeStart) {
      text += this._editContext.text.substring(
        selectionStartOffset,
        e.updateRangeStart
      );
    }
    text += e.text;
    if (selectionEndOffset > e.updateRangeEnd) {
      text += this._editContext.text.substring(
        e.updateRangeEnd,
        selectionEndOffset
      );
    }
    const typeInput = {
      text,
      replacePrevCharCnt,
      replaceNextCharCnt,
      positionDelta: 0
    };
    this._onType(viewController, typeInput);
    const primaryPositionOffset = selectionStartOffset - replacePrevCharCnt + text.length;
    this._updateCursorStatesAfterType(
      primaryPositionOffset,
      e.selectionStart,
      e.selectionEnd
    );
  }
  _onType(viewController, typeInput) {
    if (typeInput.replacePrevCharCnt || typeInput.replaceNextCharCnt || typeInput.positionDelta) {
      viewController.compositionType(
        typeInput.text,
        typeInput.replacePrevCharCnt,
        typeInput.replaceNextCharCnt,
        typeInput.positionDelta
      );
    } else {
      viewController.type(typeInput.text);
    }
  }
  _updateCursorStatesAfterType(primaryPositionOffset, desiredSelectionStartOffset, desiredSelectionEndOffset) {
    const leftDeltaOffsetOfPrimaryCursor = desiredSelectionStartOffset - primaryPositionOffset;
    const rightDeltaOffsetOfPrimaryCursor = desiredSelectionEndOffset - primaryPositionOffset;
    const cursorPositions = this._context.viewModel.getCursorStates().map((cursorState) => cursorState.modelState.position);
    const newSelections = cursorPositions.map((cursorPosition) => {
      const positionLineNumber = cursorPosition.lineNumber;
      const positionColumn = cursorPosition.column;
      return new Selection(
        positionLineNumber,
        positionColumn + leftDeltaOffsetOfPrimaryCursor,
        positionLineNumber,
        positionColumn + rightDeltaOffsetOfPrimaryCursor
      );
    });
    const newCursorStates = newSelections.map(
      (selection) => CursorState.fromModelSelection(selection)
    );
    this._context.viewModel.setCursorStates(
      "editContext",
      CursorChangeReason.Explicit,
      newCursorStates
    );
  }
  _getNewEditContextState() {
    const selectionStartOffset = this._primarySelection.startColumn - 1;
    let selectionEndOffset = 0;
    for (let i = this._primarySelection.startLineNumber; i <= this._primarySelection.endLineNumber; i++) {
      if (i === this._primarySelection.endLineNumber) {
        selectionEndOffset += this._primarySelection.endColumn - 1;
      } else {
        selectionEndOffset += this._context.viewModel.getLineMaxColumn(i);
      }
    }
    const endColumnOfEndLineNumber = this._context.viewModel.getLineMaxColumn(
      this._primarySelection.endLineNumber
    );
    const rangeOfText = new Range(
      this._primarySelection.startLineNumber,
      1,
      this._primarySelection.endLineNumber,
      endColumnOfEndLineNumber
    );
    const text = this._context.viewModel.getValueInRange(
      rangeOfText,
      EndOfLinePreference.TextDefined
    );
    const textStartPositionWithinEditor = rangeOfText.getStartPosition();
    return {
      text,
      selectionStartOffset,
      selectionEndOffset,
      textStartPositionWithinEditor
    };
  }
  _handleTextFormatUpdate(e) {
    if (!this._editContext) {
      return;
    }
    const formats = e.getTextFormats();
    const textStartPositionWithinEditor = this._textStartPositionWithinEditor;
    const decorations = [];
    formats.forEach((f) => {
      const textModel = this._context.viewModel.model;
      const offsetOfEditContextText = textModel.getOffsetAt(
        textStartPositionWithinEditor
      );
      const startPositionOfDecoration = textModel.getPositionAt(
        offsetOfEditContextText + f.rangeStart
      );
      const endPositionOfDecoration = textModel.getPositionAt(
        offsetOfEditContextText + f.rangeEnd
      );
      const decorationRange = Range.fromPositions(
        startPositionOfDecoration,
        endPositionOfDecoration
      );
      const classNames = [
        "edit-context-format-decoration",
        `underline-style-${f.underlineStyle.toLowerCase()}`,
        `underline-thickness-${f.underlineThickness.toLowerCase()}`
      ];
      decorations.push({
        range: decorationRange,
        options: {
          description: "textFormatDecoration",
          inlineClassName: classNames.join(" ")
        }
      });
    });
    this._decorations = this._context.viewModel.model.deltaDecorations(
      this._decorations,
      decorations
    );
  }
  _updateSelectionAndControlBounds() {
    if (!this._parent) {
      return;
    }
    const options = this._context.configuration.options;
    const lineHeight = options.get(EditorOption.lineHeight);
    const contentLeft = options.get(EditorOption.layoutInfo).contentLeft;
    const parentBounds = this._parent.getBoundingClientRect();
    const verticalOffsetStart = this._context.viewLayout.getVerticalOffsetForLineNumber(
      this._primarySelection.startLineNumber
    );
    const editorScrollTop = this._context.viewLayout.getCurrentScrollTop();
    const top = parentBounds.top + verticalOffsetStart - editorScrollTop;
    const height = (this._primarySelection.endLineNumber - this._primarySelection.startLineNumber + 1) * lineHeight;
    let left = parentBounds.left + contentLeft;
    let width;
    if (this._primarySelection.isEmpty()) {
      if (this._renderingContext) {
        const linesVisibleRanges = this._renderingContext.linesVisibleRangesForRange(
          this._primarySelection,
          true
        ) ?? [];
        if (linesVisibleRanges.length > 0) {
          left += Math.min(
            ...linesVisibleRanges.map(
              (r) => Math.min(...r.ranges.map((r2) => r2.left))
            )
          );
        }
      }
      width = options.get(EditorOption.fontInfo).typicalHalfwidthCharacterWidth / 2;
    } else {
      width = parentBounds.width - contentLeft;
    }
    const selectionBounds = new DOMRect(left, top, width, height);
    const controlBounds = selectionBounds;
    this._editContext.updateControlBounds(controlBounds);
    this._editContext.updateSelectionBounds(selectionBounds);
  }
  _updateCharacterBounds() {
    if (!this._parent || !this._compositionRangeWithinEditor) {
      return;
    }
    const options = this._context.configuration.options;
    const lineHeight = options.get(EditorOption.lineHeight);
    const contentLeft = options.get(EditorOption.layoutInfo).contentLeft;
    const parentBounds = this._parent.getBoundingClientRect();
    const compositionRangeWithinEditor = this._compositionRangeWithinEditor;
    const verticalOffsetStartOfComposition = this._context.viewLayout.getVerticalOffsetForLineNumber(
      compositionRangeWithinEditor.startLineNumber
    );
    const editorScrollTop = this._context.viewLayout.getCurrentScrollTop();
    const top = parentBounds.top + verticalOffsetStartOfComposition - editorScrollTop;
    const characterBounds = [];
    if (this._renderingContext) {
      const linesVisibleRanges = this._renderingContext.linesVisibleRangesForRange(
        compositionRangeWithinEditor,
        true
      ) ?? [];
      for (const lineVisibleRanges of linesVisibleRanges) {
        for (const visibleRange of lineVisibleRanges.ranges) {
          characterBounds.push(
            new DOMRect(
              parentBounds.left + contentLeft + visibleRange.left,
              top,
              visibleRange.width,
              lineHeight
            )
          );
        }
      }
    }
    const textModel = this._context.viewModel.model;
    const offsetOfEditContextStart = textModel.getOffsetAt(
      this._textStartPositionWithinEditor
    );
    const offsetOfCompositionStart = textModel.getOffsetAt(
      compositionRangeWithinEditor.getStartPosition()
    );
    const offsetOfCompositionStartInEditContext = offsetOfCompositionStart - offsetOfEditContextStart;
    this._editContext.updateCharacterBounds(
      offsetOfCompositionStartInEditContext,
      characterBounds
    );
  }
  _ensureClipboardGetsEditorSelection(clipboardService) {
    const options = this._context.configuration.options;
    const emptySelectionClipboard = options.get(
      EditorOption.emptySelectionClipboard
    );
    const copyWithSyntaxHighlighting = options.get(
      EditorOption.copyWithSyntaxHighlighting
    );
    const selections = this._context.viewModel.getCursorStates().map((cursorState) => cursorState.modelState.selection);
    const dataToCopy = getDataToCopy(
      this._context.viewModel,
      selections,
      emptySelectionClipboard,
      copyWithSyntaxHighlighting
    );
    const storedMetadata = {
      version: 1,
      isFromEmptySelection: dataToCopy.isFromEmptySelection,
      multicursorText: dataToCopy.multicursorText,
      mode: dataToCopy.mode
    };
    InMemoryClipboardMetadataManager.INSTANCE.set(
      // When writing "LINE\r\n" to the clipboard and then pasting,
      // Firefox pastes "LINE\n", so let's work around this quirk
      isFirefox ? dataToCopy.text.replace(/\r\n/g, "\n") : dataToCopy.text,
      storedMetadata
    );
    clipboardService.writeText(dataToCopy.text);
  }
};
NativeEditContext = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IClipboardService)
], NativeEditContext);
export {
  NativeEditContext
};
