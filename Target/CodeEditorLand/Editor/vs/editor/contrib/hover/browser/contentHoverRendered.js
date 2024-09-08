import * as dom from "../../../../base/browser/dom.js";
import { BugIndicatingError } from "../../../../base/common/errors.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
import { HoverColorPickerParticipant } from "../../colorPicker/browser/hoverColorPicker/hoverColorPickerParticipant.js";
import { InlayHintsHover } from "../../inlayHints/browser/inlayHintsHover.js";
import { EditorHoverStatusBar } from "./contentHoverStatusBar.js";
import {
  RenderedHoverParts
} from "./hoverTypes.js";
import { MarkdownHoverParticipant } from "./markdownHoverParticipant.js";
class RenderedContentHover extends Disposable {
  closestMouseDistance;
  initialMousePosX;
  initialMousePosY;
  showAtPosition;
  showAtSecondaryPosition;
  shouldFocus;
  source;
  shouldAppearBeforeContent;
  _renderedHoverParts;
  constructor(editor, hoverResult, participants, context, keybindingService) {
    super();
    const parts = hoverResult.hoverParts;
    this._renderedHoverParts = this._register(
      new RenderedContentHoverParts(
        editor,
        participants,
        parts,
        keybindingService,
        context
      )
    );
    const contentHoverComputerOptions = hoverResult.options;
    const anchor = contentHoverComputerOptions.anchor;
    const { showAtPosition, showAtSecondaryPosition } = RenderedContentHover.computeHoverPositions(
      editor,
      anchor.range,
      parts
    );
    this.shouldAppearBeforeContent = parts.some((m) => m.isBeforeContent);
    this.showAtPosition = showAtPosition;
    this.showAtSecondaryPosition = showAtSecondaryPosition;
    this.initialMousePosX = anchor.initialMousePosX;
    this.initialMousePosY = anchor.initialMousePosY;
    this.shouldFocus = contentHoverComputerOptions.shouldFocus;
    this.source = contentHoverComputerOptions.source;
  }
  get domNode() {
    return this._renderedHoverParts.domNode;
  }
  get domNodeHasChildren() {
    return this._renderedHoverParts.domNodeHasChildren;
  }
  get focusedHoverPartIndex() {
    return this._renderedHoverParts.focusedHoverPartIndex;
  }
  focusHoverPartWithIndex(index) {
    this._renderedHoverParts.focusHoverPartWithIndex(index);
  }
  getAccessibleWidgetContent() {
    return this._renderedHoverParts.getAccessibleContent();
  }
  getAccessibleWidgetContentAtIndex(index) {
    return this._renderedHoverParts.getAccessibleHoverContentAtIndex(index);
  }
  async updateHoverVerbosityLevel(action, index, focus) {
    this._renderedHoverParts.updateHoverVerbosityLevel(
      action,
      index,
      focus
    );
  }
  doesHoverAtIndexSupportVerbosityAction(index, action) {
    return this._renderedHoverParts.doesHoverAtIndexSupportVerbosityAction(
      index,
      action
    );
  }
  isColorPickerVisible() {
    return this._renderedHoverParts.isColorPickerVisible();
  }
  static computeHoverPositions(editor, anchorRange, hoverParts) {
    let startColumnBoundary = 1;
    if (editor.hasModel()) {
      const viewModel = editor._getViewModel();
      const coordinatesConverter = viewModel.coordinatesConverter;
      const anchorViewRange = coordinatesConverter.convertModelRangeToViewRange(anchorRange);
      const anchorViewMinColumn = viewModel.getLineMinColumn(
        anchorViewRange.startLineNumber
      );
      const anchorViewRangeStart = new Position(
        anchorViewRange.startLineNumber,
        anchorViewMinColumn
      );
      startColumnBoundary = coordinatesConverter.convertViewPositionToModelPosition(
        anchorViewRangeStart
      ).column;
    }
    const anchorStartLineNumber = anchorRange.startLineNumber;
    let secondaryPositionColumn = anchorRange.startColumn;
    let forceShowAtRange;
    for (const hoverPart of hoverParts) {
      const hoverPartRange = hoverPart.range;
      const hoverPartRangeOnAnchorStartLine = hoverPartRange.startLineNumber === anchorStartLineNumber;
      const hoverPartRangeOnAnchorEndLine = hoverPartRange.endLineNumber === anchorStartLineNumber;
      const hoverPartRangeIsOnAnchorLine = hoverPartRangeOnAnchorStartLine && hoverPartRangeOnAnchorEndLine;
      if (hoverPartRangeIsOnAnchorLine) {
        const hoverPartStartColumn = hoverPartRange.startColumn;
        const minSecondaryPositionColumn = Math.min(
          secondaryPositionColumn,
          hoverPartStartColumn
        );
        secondaryPositionColumn = Math.max(
          minSecondaryPositionColumn,
          startColumnBoundary
        );
      }
      if (hoverPart.forceShowAtRange) {
        forceShowAtRange = hoverPartRange;
      }
    }
    let showAtPosition;
    let showAtSecondaryPosition;
    if (forceShowAtRange) {
      const forceShowAtPosition = forceShowAtRange.getStartPosition();
      showAtPosition = forceShowAtPosition;
      showAtSecondaryPosition = forceShowAtPosition;
    } else {
      showAtPosition = anchorRange.getStartPosition();
      showAtSecondaryPosition = new Position(
        anchorStartLineNumber,
        secondaryPositionColumn
      );
    }
    return {
      showAtPosition,
      showAtSecondaryPosition
    };
  }
}
class RenderedStatusBar {
  constructor(fragment, _statusBar) {
    this._statusBar = _statusBar;
    fragment.appendChild(this._statusBar.hoverElement);
  }
  get hoverElement() {
    return this._statusBar.hoverElement;
  }
  get actions() {
    return this._statusBar.actions;
  }
  dispose() {
    this._statusBar.dispose();
  }
}
class RenderedContentHoverParts extends Disposable {
  static _DECORATION_OPTIONS = ModelDecorationOptions.register({
    description: "content-hover-highlight",
    className: "hoverHighlight"
  });
  _renderedParts = [];
  _fragment;
  _context;
  _markdownHoverParticipant;
  _colorHoverParticipant;
  _focusedHoverPartIndex = -1;
  constructor(editor, participants, hoverParts, keybindingService, context) {
    super();
    this._context = context;
    this._fragment = document.createDocumentFragment();
    this._register(
      this._renderParts(
        participants,
        hoverParts,
        context,
        keybindingService
      )
    );
    this._register(this._registerListenersOnRenderedParts());
    this._register(this._createEditorDecorations(editor, hoverParts));
    this._updateMarkdownAndColorParticipantInfo(participants);
  }
  _createEditorDecorations(editor, hoverParts) {
    if (hoverParts.length === 0) {
      return Disposable.None;
    }
    let highlightRange = hoverParts[0].range;
    for (const hoverPart of hoverParts) {
      const hoverPartRange = hoverPart.range;
      highlightRange = Range.plusRange(highlightRange, hoverPartRange);
    }
    const highlightDecoration = editor.createDecorationsCollection();
    highlightDecoration.set([
      {
        range: highlightRange,
        options: RenderedContentHoverParts._DECORATION_OPTIONS
      }
    ]);
    return toDisposable(() => {
      highlightDecoration.clear();
    });
  }
  _renderParts(participants, hoverParts, hoverContext, keybindingService) {
    const statusBar = new EditorHoverStatusBar(keybindingService);
    const hoverRenderingContext = {
      fragment: this._fragment,
      statusBar,
      ...hoverContext
    };
    const disposables = new DisposableStore();
    for (const participant of participants) {
      const renderedHoverParts = this._renderHoverPartsForParticipant(
        hoverParts,
        participant,
        hoverRenderingContext
      );
      disposables.add(renderedHoverParts);
      for (const renderedHoverPart of renderedHoverParts.renderedHoverParts) {
        this._renderedParts.push({
          type: "hoverPart",
          participant,
          hoverPart: renderedHoverPart.hoverPart,
          hoverElement: renderedHoverPart.hoverElement
        });
      }
    }
    const renderedStatusBar = this._renderStatusBar(
      this._fragment,
      statusBar
    );
    if (renderedStatusBar) {
      disposables.add(renderedStatusBar);
      this._renderedParts.push({
        type: "statusBar",
        hoverElement: renderedStatusBar.hoverElement,
        actions: renderedStatusBar.actions
      });
    }
    return toDisposable(() => {
      disposables.dispose();
    });
  }
  _renderHoverPartsForParticipant(hoverParts, participant, hoverRenderingContext) {
    const hoverPartsForParticipant = hoverParts.filter(
      (hoverPart) => hoverPart.owner === participant
    );
    const hasHoverPartsForParticipant = hoverPartsForParticipant.length > 0;
    if (!hasHoverPartsForParticipant) {
      return new RenderedHoverParts([]);
    }
    return participant.renderHoverParts(
      hoverRenderingContext,
      hoverPartsForParticipant
    );
  }
  _renderStatusBar(fragment, statusBar) {
    if (!statusBar.hasContent) {
      return void 0;
    }
    return new RenderedStatusBar(fragment, statusBar);
  }
  _registerListenersOnRenderedParts() {
    const disposables = new DisposableStore();
    this._renderedParts.forEach(
      (renderedPart, index) => {
        const element = renderedPart.hoverElement;
        element.tabIndex = 0;
        disposables.add(
          dom.addDisposableListener(
            element,
            dom.EventType.FOCUS_IN,
            (event) => {
              event.stopPropagation();
              this._focusedHoverPartIndex = index;
            }
          )
        );
        disposables.add(
          dom.addDisposableListener(
            element,
            dom.EventType.FOCUS_OUT,
            (event) => {
              event.stopPropagation();
              this._focusedHoverPartIndex = -1;
            }
          )
        );
      }
    );
    return disposables;
  }
  _updateMarkdownAndColorParticipantInfo(participants) {
    const markdownHoverParticipant = participants.find((p) => {
      return p instanceof MarkdownHoverParticipant && !(p instanceof InlayHintsHover);
    });
    if (markdownHoverParticipant) {
      this._markdownHoverParticipant = markdownHoverParticipant;
    }
    this._colorHoverParticipant = participants.find(
      (p) => p instanceof HoverColorPickerParticipant
    );
  }
  focusHoverPartWithIndex(index) {
    if (index < 0 || index >= this._renderedParts.length) {
      return;
    }
    this._renderedParts[index].hoverElement.focus();
  }
  getAccessibleContent() {
    const content = [];
    for (let i = 0; i < this._renderedParts.length; i++) {
      content.push(this.getAccessibleHoverContentAtIndex(i));
    }
    return content.join("\n\n");
  }
  getAccessibleHoverContentAtIndex(index) {
    const renderedPart = this._renderedParts[index];
    if (!renderedPart) {
      return "";
    }
    if (renderedPart.type === "statusBar") {
      const statusBarDescription = [
        localize(
          "hoverAccessibilityStatusBar",
          "This is a hover status bar."
        )
      ];
      for (const action of renderedPart.actions) {
        const keybinding = action.actionKeybindingLabel;
        if (keybinding) {
          statusBarDescription.push(
            localize(
              "hoverAccessibilityStatusBarActionWithKeybinding",
              "It has an action with label {0} and keybinding {1}.",
              action.actionLabel,
              keybinding
            )
          );
        } else {
          statusBarDescription.push(
            localize(
              "hoverAccessibilityStatusBarActionWithoutKeybinding",
              "It has an action with label {0}.",
              action.actionLabel
            )
          );
        }
      }
      return statusBarDescription.join("\n");
    }
    return renderedPart.participant.getAccessibleContent(
      renderedPart.hoverPart
    );
  }
  async updateHoverVerbosityLevel(action, index, focus) {
    if (!this._markdownHoverParticipant) {
      return;
    }
    const normalizedMarkdownHoverIndex = this._normalizedIndexToMarkdownHoverIndexRange(
      this._markdownHoverParticipant,
      index
    );
    if (normalizedMarkdownHoverIndex === void 0) {
      return;
    }
    const renderedPart = await this._markdownHoverParticipant.updateMarkdownHoverVerbosityLevel(
      action,
      normalizedMarkdownHoverIndex,
      focus
    );
    if (!renderedPart) {
      return;
    }
    this._renderedParts[index] = {
      type: "hoverPart",
      participant: this._markdownHoverParticipant,
      hoverPart: renderedPart.hoverPart,
      hoverElement: renderedPart.hoverElement
    };
    this._context.onContentsChanged();
  }
  doesHoverAtIndexSupportVerbosityAction(index, action) {
    if (!this._markdownHoverParticipant) {
      return false;
    }
    const normalizedMarkdownHoverIndex = this._normalizedIndexToMarkdownHoverIndexRange(
      this._markdownHoverParticipant,
      index
    );
    if (normalizedMarkdownHoverIndex === void 0) {
      return false;
    }
    return this._markdownHoverParticipant.doesMarkdownHoverAtIndexSupportVerbosityAction(
      normalizedMarkdownHoverIndex,
      action
    );
  }
  isColorPickerVisible() {
    return this._colorHoverParticipant?.isColorPickerVisible() ?? false;
  }
  _normalizedIndexToMarkdownHoverIndexRange(markdownHoverParticipant, index) {
    const renderedPart = this._renderedParts[index];
    if (!renderedPart || renderedPart.type !== "hoverPart") {
      return void 0;
    }
    const isHoverPartMarkdownHover = renderedPart.participant === markdownHoverParticipant;
    if (!isHoverPartMarkdownHover) {
      return void 0;
    }
    const firstIndexOfMarkdownHovers = this._renderedParts.findIndex(
      (renderedPart2) => renderedPart2.type === "hoverPart" && renderedPart2.participant === markdownHoverParticipant
    );
    if (firstIndexOfMarkdownHovers === -1) {
      throw new BugIndicatingError();
    }
    return index - firstIndexOfMarkdownHovers;
  }
  get domNode() {
    return this._fragment;
  }
  get domNodeHasChildren() {
    return this._fragment.hasChildNodes();
  }
  get focusedHoverPartIndex() {
    return this._focusedHoverPartIndex;
  }
}
export {
  RenderedContentHover
};
