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
import * as dom from "../../../../base/browser/dom.js";
import { Emitter } from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import {
  MouseTargetType
} from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { TokenizationRegistry } from "../../../common/languages.js";
import {
  ContentHoverComputer
} from "./contentHoverComputer.js";
import { RenderedContentHover } from "./contentHoverRendered.js";
import { ContentHoverResult } from "./contentHoverTypes.js";
import { ContentHoverWidget } from "./contentHoverWidget.js";
import {
  HoverOperation,
  HoverStartMode,
  HoverStartSource
} from "./hoverOperation.js";
import {
  HoverParticipantRegistry,
  HoverRangeAnchor
} from "./hoverTypes.js";
import { isMousePositionWithinElement } from "./hoverUtils.js";
let ContentHoverWidgetWrapper = class extends Disposable {
  constructor(_editor, _instantiationService, _keybindingService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._keybindingService = _keybindingService;
    this._contentHoverWidget = this._register(this._instantiationService.createInstance(ContentHoverWidget, this._editor));
    this._participants = this._initializeHoverParticipants();
    this._hoverOperation = this._register(new HoverOperation(this._editor, new ContentHoverComputer(this._editor, this._participants)));
    this._registerListeners();
  }
  static {
    __name(this, "ContentHoverWidgetWrapper");
  }
  _currentResult = null;
  _renderedContentHover;
  _contentHoverWidget;
  _participants;
  _hoverOperation;
  _onContentsChanged = this._register(new Emitter());
  onContentsChanged = this._onContentsChanged.event;
  _initializeHoverParticipants() {
    const participants = [];
    for (const participant of HoverParticipantRegistry.getAll()) {
      const participantInstance = this._instantiationService.createInstance(
        participant,
        this._editor
      );
      participants.push(participantInstance);
    }
    participants.sort((p1, p2) => p1.hoverOrdinal - p2.hoverOrdinal);
    this._register(
      this._contentHoverWidget.onDidResize(() => {
        this._participants.forEach(
          (participant) => participant.handleResize?.()
        );
      })
    );
    return participants;
  }
  _registerListeners() {
    this._register(
      this._hoverOperation.onResult((result) => {
        const messages = result.hasLoadingMessage ? this._addLoadingMessage(result) : result.value;
        this._withResult(
          new ContentHoverResult(
            messages,
            result.isComplete,
            result.options
          )
        );
      })
    );
    const contentHoverWidgetNode = this._contentHoverWidget.getDomNode();
    this._register(
      dom.addStandardDisposableListener(
        contentHoverWidgetNode,
        "keydown",
        (e) => {
          if (e.equals(KeyCode.Escape)) {
            this.hide();
          }
        }
      )
    );
    this._register(
      dom.addStandardDisposableListener(
        contentHoverWidgetNode,
        "mouseleave",
        (e) => {
          this._onMouseLeave(e);
        }
      )
    );
    this._register(
      TokenizationRegistry.onDidChange(() => {
        if (this._contentHoverWidget.position && this._currentResult) {
          this._setCurrentResult(this._currentResult);
        }
      })
    );
  }
  /**
   * Returns true if the hover shows now or will show.
   */
  _startShowingOrUpdateHover(anchor, mode, source, focus, mouseEvent) {
    const contentHoverIsVisible = this._contentHoverWidget.position && this._currentResult;
    if (!contentHoverIsVisible) {
      if (anchor) {
        this._startHoverOperationIfNecessary(
          anchor,
          mode,
          source,
          focus,
          false
        );
        return true;
      }
      return false;
    }
    const isHoverSticky = this._editor.getOption(EditorOption.hover).sticky;
    const isMouseGettingCloser = mouseEvent && this._contentHoverWidget.isMouseGettingCloser(
      mouseEvent.event.posx,
      mouseEvent.event.posy
    );
    const isHoverStickyAndIsMouseGettingCloser = isHoverSticky && isMouseGettingCloser;
    if (isHoverStickyAndIsMouseGettingCloser) {
      if (anchor) {
        this._startHoverOperationIfNecessary(
          anchor,
          mode,
          source,
          focus,
          true
        );
      }
      return true;
    }
    if (!anchor) {
      this._setCurrentResult(null);
      return false;
    }
    const currentAnchorEqualsPreviousAnchor = this._currentResult && this._currentResult.options.anchor.equals(anchor);
    if (currentAnchorEqualsPreviousAnchor) {
      return true;
    }
    const currentAnchorCompatibleWithPreviousAnchor = this._currentResult && anchor.canAdoptVisibleHover(
      this._currentResult.options.anchor,
      this._contentHoverWidget.position
    );
    if (!currentAnchorCompatibleWithPreviousAnchor) {
      this._setCurrentResult(null);
      this._startHoverOperationIfNecessary(
        anchor,
        mode,
        source,
        focus,
        false
      );
      return true;
    }
    if (this._currentResult) {
      this._setCurrentResult(this._currentResult.filter(anchor));
    }
    this._startHoverOperationIfNecessary(
      anchor,
      mode,
      source,
      focus,
      false
    );
    return true;
  }
  _startHoverOperationIfNecessary(anchor, mode, source, shouldFocus, insistOnKeepingHoverVisible) {
    const currentAnchorEqualToPreviousHover = this._hoverOperation.options && this._hoverOperation.options.anchor.equals(anchor);
    if (currentAnchorEqualToPreviousHover) {
      return;
    }
    this._hoverOperation.cancel();
    const contentHoverComputerOptions = {
      anchor,
      source,
      shouldFocus,
      insistOnKeepingHoverVisible
    };
    this._hoverOperation.start(mode, contentHoverComputerOptions);
  }
  _setCurrentResult(hoverResult) {
    let currentHoverResult = hoverResult;
    const currentResultEqualToPreviousResult = this._currentResult === currentHoverResult;
    if (currentResultEqualToPreviousResult) {
      return;
    }
    const currentHoverResultIsEmpty = currentHoverResult && currentHoverResult.hoverParts.length === 0;
    if (currentHoverResultIsEmpty) {
      currentHoverResult = null;
    }
    this._currentResult = currentHoverResult;
    if (this._currentResult) {
      this._showHover(this._currentResult);
    } else {
      this._hideHover();
    }
  }
  _addLoadingMessage(hoverResult) {
    for (const participant of this._participants) {
      if (!participant.createLoadingMessage) {
        continue;
      }
      const loadingMessage = participant.createLoadingMessage(
        hoverResult.options.anchor
      );
      if (!loadingMessage) {
        continue;
      }
      return hoverResult.value.slice(0).concat([loadingMessage]);
    }
    return hoverResult.value;
  }
  _withResult(hoverResult) {
    const previousHoverIsVisibleWithCompleteResult = this._contentHoverWidget.position && this._currentResult && this._currentResult.isComplete;
    if (!previousHoverIsVisibleWithCompleteResult) {
      this._setCurrentResult(hoverResult);
    }
    const isCurrentHoverResultComplete = hoverResult.isComplete;
    if (!isCurrentHoverResultComplete) {
      return;
    }
    const currentHoverResultIsEmpty = hoverResult.hoverParts.length === 0;
    const insistOnKeepingPreviousHoverVisible = hoverResult.options.insistOnKeepingHoverVisible;
    const shouldKeepPreviousHoverVisible = currentHoverResultIsEmpty && insistOnKeepingPreviousHoverVisible;
    if (shouldKeepPreviousHoverVisible) {
      return;
    }
    this._setCurrentResult(hoverResult);
  }
  _showHover(hoverResult) {
    const context = this._getHoverContext();
    this._renderedContentHover = new RenderedContentHover(
      this._editor,
      hoverResult,
      this._participants,
      context,
      this._keybindingService
    );
    if (this._renderedContentHover.domNodeHasChildren) {
      this._contentHoverWidget.show(this._renderedContentHover);
    } else {
      this._renderedContentHover.dispose();
    }
  }
  _hideHover() {
    this._contentHoverWidget.hide();
  }
  _getHoverContext() {
    const hide = /* @__PURE__ */ __name(() => {
      this.hide();
    }, "hide");
    const onContentsChanged = /* @__PURE__ */ __name(() => {
      this._onContentsChanged.fire();
      this._contentHoverWidget.onContentsChanged();
    }, "onContentsChanged");
    const setMinimumDimensions = /* @__PURE__ */ __name((dimensions) => {
      this._contentHoverWidget.setMinimumDimensions(dimensions);
    }, "setMinimumDimensions");
    return { hide, onContentsChanged, setMinimumDimensions };
  }
  showsOrWillShow(mouseEvent) {
    const isContentWidgetResizing = this._contentHoverWidget.isResizing;
    if (isContentWidgetResizing) {
      return true;
    }
    const anchorCandidates = this._findHoverAnchorCandidates(mouseEvent);
    const anchorCandidatesExist = anchorCandidates.length > 0;
    if (!anchorCandidatesExist) {
      return this._startShowingOrUpdateHover(
        null,
        HoverStartMode.Delayed,
        HoverStartSource.Mouse,
        false,
        mouseEvent
      );
    }
    const anchor = anchorCandidates[0];
    return this._startShowingOrUpdateHover(
      anchor,
      HoverStartMode.Delayed,
      HoverStartSource.Mouse,
      false,
      mouseEvent
    );
  }
  _findHoverAnchorCandidates(mouseEvent) {
    const anchorCandidates = [];
    for (const participant of this._participants) {
      if (!participant.suggestHoverAnchor) {
        continue;
      }
      const anchor = participant.suggestHoverAnchor(mouseEvent);
      if (!anchor) {
        continue;
      }
      anchorCandidates.push(anchor);
    }
    const target = mouseEvent.target;
    switch (target.type) {
      case MouseTargetType.CONTENT_TEXT: {
        anchorCandidates.push(
          new HoverRangeAnchor(
            0,
            target.range,
            mouseEvent.event.posx,
            mouseEvent.event.posy
          )
        );
        break;
      }
      case MouseTargetType.CONTENT_EMPTY: {
        const epsilon = this._editor.getOption(EditorOption.fontInfo).typicalHalfwidthCharacterWidth / 2;
        const mouseIsWithinLinesAndCloseToHover = !target.detail.isAfterLines && typeof target.detail.horizontalDistanceToText === "number" && target.detail.horizontalDistanceToText < epsilon;
        if (!mouseIsWithinLinesAndCloseToHover) {
          break;
        }
        anchorCandidates.push(
          new HoverRangeAnchor(
            0,
            target.range,
            mouseEvent.event.posx,
            mouseEvent.event.posy
          )
        );
        break;
      }
    }
    anchorCandidates.sort((a, b) => b.priority - a.priority);
    return anchorCandidates;
  }
  _onMouseLeave(e) {
    const editorDomNode = this._editor.getDomNode();
    const isMousePositionOutsideOfEditor = !editorDomNode || !isMousePositionWithinElement(editorDomNode, e.x, e.y);
    if (isMousePositionOutsideOfEditor) {
      this.hide();
    }
  }
  startShowingAtRange(range, mode, source, focus) {
    this._startShowingOrUpdateHover(
      new HoverRangeAnchor(0, range, void 0, void 0),
      mode,
      source,
      focus,
      null
    );
  }
  getWidgetContent() {
    const node = this._contentHoverWidget.getDomNode();
    if (!node.textContent) {
      return void 0;
    }
    return node.textContent;
  }
  async updateHoverVerbosityLevel(action, index, focus) {
    this._renderedContentHover?.updateHoverVerbosityLevel(
      action,
      index,
      focus
    );
  }
  doesHoverAtIndexSupportVerbosityAction(index, action) {
    return this._renderedContentHover?.doesHoverAtIndexSupportVerbosityAction(
      index,
      action
    ) ?? false;
  }
  getAccessibleWidgetContent() {
    return this._renderedContentHover?.getAccessibleWidgetContent();
  }
  getAccessibleWidgetContentAtIndex(index) {
    return this._renderedContentHover?.getAccessibleWidgetContentAtIndex(
      index
    );
  }
  focusedHoverPartIndex() {
    return this._renderedContentHover?.focusedHoverPartIndex ?? -1;
  }
  containsNode(node) {
    return node ? this._contentHoverWidget.getDomNode().contains(node) : false;
  }
  focus() {
    this._contentHoverWidget.focus();
  }
  focusHoverPartWithIndex(index) {
    this._renderedContentHover?.focusHoverPartWithIndex(index);
  }
  scrollUp() {
    this._contentHoverWidget.scrollUp();
  }
  scrollDown() {
    this._contentHoverWidget.scrollDown();
  }
  scrollLeft() {
    this._contentHoverWidget.scrollLeft();
  }
  scrollRight() {
    this._contentHoverWidget.scrollRight();
  }
  pageUp() {
    this._contentHoverWidget.pageUp();
  }
  pageDown() {
    this._contentHoverWidget.pageDown();
  }
  goToTop() {
    this._contentHoverWidget.goToTop();
  }
  goToBottom() {
    this._contentHoverWidget.goToBottom();
  }
  hide() {
    this._hoverOperation.cancel();
    this._setCurrentResult(null);
  }
  getDomNode() {
    return this._contentHoverWidget.getDomNode();
  }
  get isColorPickerVisible() {
    return this._renderedContentHover?.isColorPickerVisible() ?? false;
  }
  get isVisibleFromKeyboard() {
    return this._contentHoverWidget.isVisibleFromKeyboard;
  }
  get isVisible() {
    return this._contentHoverWidget.isVisible;
  }
  get isFocused() {
    return this._contentHoverWidget.isFocused;
  }
  get isResizing() {
    return this._contentHoverWidget.isResizing;
  }
  get widget() {
    return this._contentHoverWidget;
  }
};
ContentHoverWidgetWrapper = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IKeybindingService)
], ContentHoverWidgetWrapper);
export {
  ContentHoverWidgetWrapper
};
//# sourceMappingURL=contentHoverWidgetWrapper.js.map
