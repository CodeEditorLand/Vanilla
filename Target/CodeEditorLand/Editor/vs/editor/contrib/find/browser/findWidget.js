var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import { IKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { IMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { alert as alertFn } from "../../../../base/browser/ui/aria/aria.js";
import { Toggle } from "../../../../base/browser/ui/toggle/toggle.js";
import { IContextViewProvider } from "../../../../base/browser/ui/contextview/contextview.js";
import { FindInput } from "../../../../base/browser/ui/findinput/findInput.js";
import { ReplaceInput } from "../../../../base/browser/ui/findinput/replaceInput.js";
import { IMessage as InputBoxMessage } from "../../../../base/browser/ui/inputbox/inputBox.js";
import { ISashEvent, IVerticalSashLayoutProvider, Orientation, Sash } from "../../../../base/browser/ui/sash/sash.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import { Delayer } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { toDisposable } from "../../../../base/common/lifecycle.js";
import * as platform from "../../../../base/common/platform.js";
import * as strings from "../../../../base/common/strings.js";
import "./findWidget.css";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, IViewZone, OverlayWidgetPositionPreference } from "../../../browser/editorBrowser.js";
import { ConfigurationChangedEvent, EditorOption } from "../../../common/config/editorOptions.js";
import { Range } from "../../../common/core/range.js";
import { CONTEXT_FIND_INPUT_FOCUSED, CONTEXT_REPLACE_INPUT_FOCUSED, FIND_IDS, MATCHES_LIMIT } from "./findModel.js";
import { FindReplaceState, FindReplaceStateChangedEvent } from "./findState.js";
import * as nls from "../../../../nls.js";
import { AccessibilitySupport } from "../../../../platform/accessibility/common/accessibility.js";
import { ContextScopedFindInput, ContextScopedReplaceInput } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { showHistoryKeybindingHint } from "../../../../platform/history/browser/historyWidgetKeybindingHint.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { asCssVariable, contrastBorder, editorFindMatchForeground, editorFindMatchHighlightBorder, editorFindMatchHighlightForeground, editorFindRangeHighlightBorder, inputActiveOptionBackground, inputActiveOptionBorder, inputActiveOptionForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { registerIcon, widgetClose } from "../../../../platform/theme/common/iconRegistry.js";
import { IThemeService, registerThemingParticipant } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { isHighContrast } from "../../../../platform/theme/common/theme.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { defaultInputBoxStyles, defaultToggleStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { Selection } from "../../../common/core/selection.js";
import { createInstantHoverDelegate, getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegate.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
const findCollapsedIcon = registerIcon("find-collapsed", Codicon.chevronRight, nls.localize("findCollapsedIcon", "Icon to indicate that the editor find widget is collapsed."));
const findExpandedIcon = registerIcon("find-expanded", Codicon.chevronDown, nls.localize("findExpandedIcon", "Icon to indicate that the editor find widget is expanded."));
const findSelectionIcon = registerIcon("find-selection", Codicon.selection, nls.localize("findSelectionIcon", "Icon for 'Find in Selection' in the editor find widget."));
const findReplaceIcon = registerIcon("find-replace", Codicon.replace, nls.localize("findReplaceIcon", "Icon for 'Replace' in the editor find widget."));
const findReplaceAllIcon = registerIcon("find-replace-all", Codicon.replaceAll, nls.localize("findReplaceAllIcon", "Icon for 'Replace All' in the editor find widget."));
const findPreviousMatchIcon = registerIcon("find-previous-match", Codicon.arrowUp, nls.localize("findPreviousMatchIcon", "Icon for 'Find Previous' in the editor find widget."));
const findNextMatchIcon = registerIcon("find-next-match", Codicon.arrowDown, nls.localize("findNextMatchIcon", "Icon for 'Find Next' in the editor find widget."));
const NLS_FIND_DIALOG_LABEL = nls.localize("label.findDialog", "Find / Replace");
const NLS_FIND_INPUT_LABEL = nls.localize("label.find", "Find");
const NLS_FIND_INPUT_PLACEHOLDER = nls.localize("placeholder.find", "Find");
const NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize("label.previousMatchButton", "Previous Match");
const NLS_NEXT_MATCH_BTN_LABEL = nls.localize("label.nextMatchButton", "Next Match");
const NLS_TOGGLE_SELECTION_FIND_TITLE = nls.localize("label.toggleSelectionFind", "Find in Selection");
const NLS_CLOSE_BTN_LABEL = nls.localize("label.closeButton", "Close");
const NLS_REPLACE_INPUT_LABEL = nls.localize("label.replace", "Replace");
const NLS_REPLACE_INPUT_PLACEHOLDER = nls.localize("placeholder.replace", "Replace");
const NLS_REPLACE_BTN_LABEL = nls.localize("label.replaceButton", "Replace");
const NLS_REPLACE_ALL_BTN_LABEL = nls.localize("label.replaceAllButton", "Replace All");
const NLS_TOGGLE_REPLACE_MODE_BTN_LABEL = nls.localize("label.toggleReplaceButton", "Toggle Replace");
const NLS_MATCHES_COUNT_LIMIT_TITLE = nls.localize("title.matchesCountLimit", "Only the first {0} results are highlighted, but all find operations work on the entire text.", MATCHES_LIMIT);
const NLS_MATCHES_LOCATION = nls.localize("label.matchesLocation", "{0} of {1}");
const NLS_NO_RESULTS = nls.localize("label.noResults", "No results");
const FIND_WIDGET_INITIAL_WIDTH = 419;
const PART_WIDTH = 275;
const FIND_INPUT_AREA_WIDTH = PART_WIDTH - 54;
let MAX_MATCHES_COUNT_WIDTH = 69;
const FIND_INPUT_AREA_HEIGHT = 33;
const ctrlEnterReplaceAllWarningPromptedKey = "ctrlEnterReplaceAll.windows.donotask";
const ctrlKeyMod = platform.isMacintosh ? KeyMod.WinCtrl : KeyMod.CtrlCmd;
class FindWidgetViewZone {
  static {
    __name(this, "FindWidgetViewZone");
  }
  afterLineNumber;
  heightInPx;
  suppressMouseDown;
  domNode;
  constructor(afterLineNumber) {
    this.afterLineNumber = afterLineNumber;
    this.heightInPx = FIND_INPUT_AREA_HEIGHT;
    this.suppressMouseDown = false;
    this.domNode = document.createElement("div");
    this.domNode.className = "dock-find-viewzone";
  }
}
function stopPropagationForMultiLineUpwards(event, value, textarea) {
  const isMultiline = !!value.match(/\n/);
  if (textarea && isMultiline && textarea.selectionStart > 0) {
    event.stopPropagation();
    return;
  }
}
__name(stopPropagationForMultiLineUpwards, "stopPropagationForMultiLineUpwards");
function stopPropagationForMultiLineDownwards(event, value, textarea) {
  const isMultiline = !!value.match(/\n/);
  if (textarea && isMultiline && textarea.selectionEnd < textarea.value.length) {
    event.stopPropagation();
    return;
  }
}
__name(stopPropagationForMultiLineDownwards, "stopPropagationForMultiLineDownwards");
class FindWidget extends Widget {
  constructor(codeEditor, controller, state, contextViewProvider, keybindingService, contextKeyService, themeService, storageService, notificationService, _hoverService) {
    super();
    this._hoverService = _hoverService;
    this._codeEditor = codeEditor;
    this._controller = controller;
    this._state = state;
    this._contextViewProvider = contextViewProvider;
    this._keybindingService = keybindingService;
    this._contextKeyService = contextKeyService;
    this._storageService = storageService;
    this._notificationService = notificationService;
    this._ctrlEnterReplaceAllWarningPrompted = !!storageService.getBoolean(ctrlEnterReplaceAllWarningPromptedKey, StorageScope.PROFILE);
    this._isVisible = false;
    this._isReplaceVisible = false;
    this._ignoreChangeEvent = false;
    this._updateHistoryDelayer = new Delayer(500);
    this._register(toDisposable(() => this._updateHistoryDelayer.cancel()));
    this._register(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
    this._buildDomNode();
    this._updateButtons();
    this._tryUpdateWidgetWidth();
    this._findInput.inputBox.layout();
    this._register(this._codeEditor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.readOnly)) {
        if (this._codeEditor.getOption(EditorOption.readOnly)) {
          this._state.change({ isReplaceRevealed: false }, false);
        }
        this._updateButtons();
      }
      if (e.hasChanged(EditorOption.layoutInfo)) {
        this._tryUpdateWidgetWidth();
      }
      if (e.hasChanged(EditorOption.accessibilitySupport)) {
        this.updateAccessibilitySupport();
      }
      if (e.hasChanged(EditorOption.find)) {
        const supportLoop = this._codeEditor.getOption(EditorOption.find).loop;
        this._state.change({ loop: supportLoop }, false);
        const addExtraSpaceOnTop = this._codeEditor.getOption(EditorOption.find).addExtraSpaceOnTop;
        if (addExtraSpaceOnTop && !this._viewZone) {
          this._viewZone = new FindWidgetViewZone(0);
          this._showViewZone();
        }
        if (!addExtraSpaceOnTop && this._viewZone) {
          this._removeViewZone();
        }
      }
    }));
    this.updateAccessibilitySupport();
    this._register(this._codeEditor.onDidChangeCursorSelection(() => {
      if (this._isVisible) {
        this._updateToggleSelectionFindButton();
      }
    }));
    this._register(this._codeEditor.onDidFocusEditorWidget(async () => {
      if (this._isVisible) {
        const globalBufferTerm = await this._controller.getGlobalBufferTerm();
        if (globalBufferTerm && globalBufferTerm !== this._state.searchString) {
          this._state.change({ searchString: globalBufferTerm }, false);
          this._findInput.select();
        }
      }
    }));
    this._findInputFocused = CONTEXT_FIND_INPUT_FOCUSED.bindTo(contextKeyService);
    this._findFocusTracker = this._register(dom.trackFocus(this._findInput.inputBox.inputElement));
    this._register(this._findFocusTracker.onDidFocus(() => {
      this._findInputFocused.set(true);
      this._updateSearchScope();
    }));
    this._register(this._findFocusTracker.onDidBlur(() => {
      this._findInputFocused.set(false);
    }));
    this._replaceInputFocused = CONTEXT_REPLACE_INPUT_FOCUSED.bindTo(contextKeyService);
    this._replaceFocusTracker = this._register(dom.trackFocus(this._replaceInput.inputBox.inputElement));
    this._register(this._replaceFocusTracker.onDidFocus(() => {
      this._replaceInputFocused.set(true);
      this._updateSearchScope();
    }));
    this._register(this._replaceFocusTracker.onDidBlur(() => {
      this._replaceInputFocused.set(false);
    }));
    this._codeEditor.addOverlayWidget(this);
    if (this._codeEditor.getOption(EditorOption.find).addExtraSpaceOnTop) {
      this._viewZone = new FindWidgetViewZone(0);
    }
    this._register(this._codeEditor.onDidChangeModel(() => {
      if (!this._isVisible) {
        return;
      }
      this._viewZoneId = void 0;
    }));
    this._register(this._codeEditor.onDidScrollChange((e) => {
      if (e.scrollTopChanged) {
        this._layoutViewZone();
        return;
      }
      setTimeout(() => {
        this._layoutViewZone();
      }, 0);
    }));
  }
  static {
    __name(this, "FindWidget");
  }
  static ID = "editor.contrib.findWidget";
  _codeEditor;
  _state;
  _controller;
  _contextViewProvider;
  _keybindingService;
  _contextKeyService;
  _storageService;
  _notificationService;
  _domNode;
  _cachedHeight = null;
  _findInput;
  _replaceInput;
  _toggleReplaceBtn;
  _matchesCount;
  _prevBtn;
  _nextBtn;
  _toggleSelectionFind;
  _closeBtn;
  _replaceBtn;
  _replaceAllBtn;
  _isVisible;
  _isReplaceVisible;
  _ignoreChangeEvent;
  _ctrlEnterReplaceAllWarningPrompted;
  _findFocusTracker;
  _findInputFocused;
  _replaceFocusTracker;
  _replaceInputFocused;
  _viewZone;
  _viewZoneId;
  _resizeSash;
  _resized;
  _updateHistoryDelayer;
  // ----- IOverlayWidget API
  getId() {
    return FindWidget.ID;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    if (this._isVisible) {
      return {
        preference: OverlayWidgetPositionPreference.TOP_RIGHT_CORNER
      };
    }
    return null;
  }
  // ----- React to state changes
  _onStateChanged(e) {
    if (e.searchString) {
      try {
        this._ignoreChangeEvent = true;
        this._findInput.setValue(this._state.searchString);
      } finally {
        this._ignoreChangeEvent = false;
      }
      this._updateButtons();
    }
    if (e.replaceString) {
      this._replaceInput.inputBox.value = this._state.replaceString;
    }
    if (e.isRevealed) {
      if (this._state.isRevealed) {
        this._reveal();
      } else {
        this._hide(true);
      }
    }
    if (e.isReplaceRevealed) {
      if (this._state.isReplaceRevealed) {
        if (!this._codeEditor.getOption(EditorOption.readOnly) && !this._isReplaceVisible) {
          this._isReplaceVisible = true;
          this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
          this._updateButtons();
          this._replaceInput.inputBox.layout();
        }
      } else {
        if (this._isReplaceVisible) {
          this._isReplaceVisible = false;
          this._updateButtons();
        }
      }
    }
    if ((e.isRevealed || e.isReplaceRevealed) && (this._state.isRevealed || this._state.isReplaceRevealed)) {
      if (this._tryUpdateHeight()) {
        this._showViewZone();
      }
    }
    if (e.isRegex) {
      this._findInput.setRegex(this._state.isRegex);
    }
    if (e.wholeWord) {
      this._findInput.setWholeWords(this._state.wholeWord);
    }
    if (e.matchCase) {
      this._findInput.setCaseSensitive(this._state.matchCase);
    }
    if (e.preserveCase) {
      this._replaceInput.setPreserveCase(this._state.preserveCase);
    }
    if (e.searchScope) {
      if (this._state.searchScope) {
        this._toggleSelectionFind.checked = true;
      } else {
        this._toggleSelectionFind.checked = false;
      }
      this._updateToggleSelectionFindButton();
    }
    if (e.searchString || e.matchesCount || e.matchesPosition) {
      const showRedOutline = this._state.searchString.length > 0 && this._state.matchesCount === 0;
      this._domNode.classList.toggle("no-results", showRedOutline);
      this._updateMatchesCount();
      this._updateButtons();
    }
    if (e.searchString || e.currentMatch) {
      this._layoutViewZone();
    }
    if (e.updateHistory) {
      this._delayedUpdateHistory();
    }
    if (e.loop) {
      this._updateButtons();
    }
  }
  _delayedUpdateHistory() {
    this._updateHistoryDelayer.trigger(this._updateHistory.bind(this)).then(void 0, onUnexpectedError);
  }
  _updateHistory() {
    if (this._state.searchString) {
      this._findInput.inputBox.addToHistory();
    }
    if (this._state.replaceString) {
      this._replaceInput.inputBox.addToHistory();
    }
  }
  _updateMatchesCount() {
    this._matchesCount.style.minWidth = MAX_MATCHES_COUNT_WIDTH + "px";
    if (this._state.matchesCount >= MATCHES_LIMIT) {
      this._matchesCount.title = NLS_MATCHES_COUNT_LIMIT_TITLE;
    } else {
      this._matchesCount.title = "";
    }
    this._matchesCount.firstChild?.remove();
    let label;
    if (this._state.matchesCount > 0) {
      let matchesCount = String(this._state.matchesCount);
      if (this._state.matchesCount >= MATCHES_LIMIT) {
        matchesCount += "+";
      }
      let matchesPosition = String(this._state.matchesPosition);
      if (matchesPosition === "0") {
        matchesPosition = "?";
      }
      label = strings.format(NLS_MATCHES_LOCATION, matchesPosition, matchesCount);
    } else {
      label = NLS_NO_RESULTS;
    }
    this._matchesCount.appendChild(document.createTextNode(label));
    alertFn(this._getAriaLabel(label, this._state.currentMatch, this._state.searchString));
    MAX_MATCHES_COUNT_WIDTH = Math.max(MAX_MATCHES_COUNT_WIDTH, this._matchesCount.clientWidth);
  }
  // ----- actions
  _getAriaLabel(label, currentMatch, searchString) {
    if (label === NLS_NO_RESULTS) {
      return searchString === "" ? nls.localize("ariaSearchNoResultEmpty", "{0} found", label) : nls.localize("ariaSearchNoResult", "{0} found for '{1}'", label, searchString);
    }
    if (currentMatch) {
      const ariaLabel = nls.localize("ariaSearchNoResultWithLineNum", "{0} found for '{1}', at {2}", label, searchString, currentMatch.startLineNumber + ":" + currentMatch.startColumn);
      const model = this._codeEditor.getModel();
      if (model && currentMatch.startLineNumber <= model.getLineCount() && currentMatch.startLineNumber >= 1) {
        const lineContent = model.getLineContent(currentMatch.startLineNumber);
        return `${lineContent}, ${ariaLabel}`;
      }
      return ariaLabel;
    }
    return nls.localize("ariaSearchNoResultWithLineNumNoCurrentMatch", "{0} found for '{1}'", label, searchString);
  }
  /**
   * If 'selection find' is ON we should not disable the button (its function is to cancel 'selection find').
   * If 'selection find' is OFF we enable the button only if there is a selection.
   */
  _updateToggleSelectionFindButton() {
    const selection = this._codeEditor.getSelection();
    const isSelection = selection ? selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn : false;
    const isChecked = this._toggleSelectionFind.checked;
    if (this._isVisible && (isChecked || isSelection)) {
      this._toggleSelectionFind.enable();
    } else {
      this._toggleSelectionFind.disable();
    }
  }
  _updateButtons() {
    this._findInput.setEnabled(this._isVisible);
    this._replaceInput.setEnabled(this._isVisible && this._isReplaceVisible);
    this._updateToggleSelectionFindButton();
    this._closeBtn.setEnabled(this._isVisible);
    const findInputIsNonEmpty = this._state.searchString.length > 0;
    const matchesCount = this._state.matchesCount ? true : false;
    this._prevBtn.setEnabled(this._isVisible && findInputIsNonEmpty && matchesCount && this._state.canNavigateBack());
    this._nextBtn.setEnabled(this._isVisible && findInputIsNonEmpty && matchesCount && this._state.canNavigateForward());
    this._replaceBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
    this._replaceAllBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
    this._domNode.classList.toggle("replaceToggled", this._isReplaceVisible);
    this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
    const canReplace = !this._codeEditor.getOption(EditorOption.readOnly);
    this._toggleReplaceBtn.setEnabled(this._isVisible && canReplace);
  }
  _revealTimeouts = [];
  _reveal() {
    this._revealTimeouts.forEach((e) => {
      clearTimeout(e);
    });
    this._revealTimeouts = [];
    if (!this._isVisible) {
      this._isVisible = true;
      const selection = this._codeEditor.getSelection();
      switch (this._codeEditor.getOption(EditorOption.find).autoFindInSelection) {
        case "always":
          this._toggleSelectionFind.checked = true;
          break;
        case "never":
          this._toggleSelectionFind.checked = false;
          break;
        case "multiline": {
          const isSelectionMultipleLine = !!selection && selection.startLineNumber !== selection.endLineNumber;
          this._toggleSelectionFind.checked = isSelectionMultipleLine;
          break;
        }
        default:
          break;
      }
      this._tryUpdateWidgetWidth();
      this._updateButtons();
      this._revealTimeouts.push(setTimeout(() => {
        this._domNode.classList.add("visible");
        this._domNode.setAttribute("aria-hidden", "false");
      }, 0));
      this._revealTimeouts.push(setTimeout(() => {
        this._findInput.validate();
      }, 200));
      this._codeEditor.layoutOverlayWidget(this);
      let adjustEditorScrollTop = true;
      if (this._codeEditor.getOption(EditorOption.find).seedSearchStringFromSelection && selection) {
        const domNode = this._codeEditor.getDomNode();
        if (domNode) {
          const editorCoords = dom.getDomNodePagePosition(domNode);
          const startCoords = this._codeEditor.getScrolledVisiblePosition(selection.getStartPosition());
          const startLeft = editorCoords.left + (startCoords ? startCoords.left : 0);
          const startTop = startCoords ? startCoords.top : 0;
          if (this._viewZone && startTop < this._viewZone.heightInPx) {
            if (selection.endLineNumber > selection.startLineNumber) {
              adjustEditorScrollTop = false;
            }
            const leftOfFindWidget = dom.getTopLeftOffset(this._domNode).left;
            if (startLeft > leftOfFindWidget) {
              adjustEditorScrollTop = false;
            }
            const endCoords = this._codeEditor.getScrolledVisiblePosition(selection.getEndPosition());
            const endLeft = editorCoords.left + (endCoords ? endCoords.left : 0);
            if (endLeft > leftOfFindWidget) {
              adjustEditorScrollTop = false;
            }
          }
        }
      }
      this._showViewZone(adjustEditorScrollTop);
    }
  }
  _hide(focusTheEditor) {
    this._revealTimeouts.forEach((e) => {
      clearTimeout(e);
    });
    this._revealTimeouts = [];
    if (this._isVisible) {
      this._isVisible = false;
      this._updateButtons();
      this._domNode.classList.remove("visible");
      this._domNode.setAttribute("aria-hidden", "true");
      this._findInput.clearMessage();
      if (focusTheEditor) {
        this._codeEditor.focus();
      }
      this._codeEditor.layoutOverlayWidget(this);
      this._removeViewZone();
    }
  }
  _layoutViewZone(targetScrollTop) {
    const addExtraSpaceOnTop = this._codeEditor.getOption(EditorOption.find).addExtraSpaceOnTop;
    if (!addExtraSpaceOnTop) {
      this._removeViewZone();
      return;
    }
    if (!this._isVisible) {
      return;
    }
    const viewZone = this._viewZone;
    if (this._viewZoneId !== void 0 || !viewZone) {
      return;
    }
    this._codeEditor.changeViewZones((accessor) => {
      viewZone.heightInPx = this._getHeight();
      this._viewZoneId = accessor.addZone(viewZone);
      this._codeEditor.setScrollTop(targetScrollTop || this._codeEditor.getScrollTop() + viewZone.heightInPx);
    });
  }
  _showViewZone(adjustScroll = true) {
    if (!this._isVisible) {
      return;
    }
    const addExtraSpaceOnTop = this._codeEditor.getOption(EditorOption.find).addExtraSpaceOnTop;
    if (!addExtraSpaceOnTop) {
      return;
    }
    if (this._viewZone === void 0) {
      this._viewZone = new FindWidgetViewZone(0);
    }
    const viewZone = this._viewZone;
    this._codeEditor.changeViewZones((accessor) => {
      if (this._viewZoneId !== void 0) {
        const newHeight = this._getHeight();
        if (newHeight === viewZone.heightInPx) {
          return;
        }
        const scrollAdjustment = newHeight - viewZone.heightInPx;
        viewZone.heightInPx = newHeight;
        accessor.layoutZone(this._viewZoneId);
        if (adjustScroll) {
          this._codeEditor.setScrollTop(this._codeEditor.getScrollTop() + scrollAdjustment);
        }
        return;
      } else {
        let scrollAdjustment = this._getHeight();
        scrollAdjustment -= this._codeEditor.getOption(EditorOption.padding).top;
        if (scrollAdjustment <= 0) {
          return;
        }
        viewZone.heightInPx = scrollAdjustment;
        this._viewZoneId = accessor.addZone(viewZone);
        if (adjustScroll) {
          this._codeEditor.setScrollTop(this._codeEditor.getScrollTop() + scrollAdjustment);
        }
      }
    });
  }
  _removeViewZone() {
    this._codeEditor.changeViewZones((accessor) => {
      if (this._viewZoneId !== void 0) {
        accessor.removeZone(this._viewZoneId);
        this._viewZoneId = void 0;
        if (this._viewZone) {
          this._codeEditor.setScrollTop(this._codeEditor.getScrollTop() - this._viewZone.heightInPx);
          this._viewZone = void 0;
        }
      }
    });
  }
  _tryUpdateWidgetWidth() {
    if (!this._isVisible) {
      return;
    }
    if (!this._domNode.isConnected) {
      return;
    }
    const layoutInfo = this._codeEditor.getLayoutInfo();
    const editorContentWidth = layoutInfo.contentWidth;
    if (editorContentWidth <= 0) {
      this._domNode.classList.add("hiddenEditor");
      return;
    } else if (this._domNode.classList.contains("hiddenEditor")) {
      this._domNode.classList.remove("hiddenEditor");
    }
    const editorWidth = layoutInfo.width;
    const minimapWidth = layoutInfo.minimap.minimapWidth;
    let collapsedFindWidget = false;
    let reducedFindWidget = false;
    let narrowFindWidget = false;
    if (this._resized) {
      const widgetWidth = dom.getTotalWidth(this._domNode);
      if (widgetWidth > FIND_WIDGET_INITIAL_WIDTH) {
        this._domNode.style.maxWidth = `${editorWidth - 28 - minimapWidth - 15}px`;
        this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
        return;
      }
    }
    if (FIND_WIDGET_INITIAL_WIDTH + 28 + minimapWidth >= editorWidth) {
      reducedFindWidget = true;
    }
    if (FIND_WIDGET_INITIAL_WIDTH + 28 + minimapWidth - MAX_MATCHES_COUNT_WIDTH >= editorWidth) {
      narrowFindWidget = true;
    }
    if (FIND_WIDGET_INITIAL_WIDTH + 28 + minimapWidth - MAX_MATCHES_COUNT_WIDTH >= editorWidth + 50) {
      collapsedFindWidget = true;
    }
    this._domNode.classList.toggle("collapsed-find-widget", collapsedFindWidget);
    this._domNode.classList.toggle("narrow-find-widget", narrowFindWidget);
    this._domNode.classList.toggle("reduced-find-widget", reducedFindWidget);
    if (!narrowFindWidget && !collapsedFindWidget) {
      this._domNode.style.maxWidth = `${editorWidth - 28 - minimapWidth - 15}px`;
    }
    this._findInput.layout({ collapsedFindWidget, narrowFindWidget, reducedFindWidget });
    if (this._resized) {
      const findInputWidth = this._findInput.inputBox.element.clientWidth;
      if (findInputWidth > 0) {
        this._replaceInput.width = findInputWidth;
      }
    } else if (this._isReplaceVisible) {
      this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
    }
  }
  _getHeight() {
    let totalheight = 0;
    totalheight += 4;
    totalheight += this._findInput.inputBox.height + 2;
    if (this._isReplaceVisible) {
      totalheight += 4;
      totalheight += this._replaceInput.inputBox.height + 2;
    }
    totalheight += 4;
    return totalheight;
  }
  _tryUpdateHeight() {
    const totalHeight = this._getHeight();
    if (this._cachedHeight !== null && this._cachedHeight === totalHeight) {
      return false;
    }
    this._cachedHeight = totalHeight;
    this._domNode.style.height = `${totalHeight}px`;
    return true;
  }
  // ----- Public
  focusFindInput() {
    this._findInput.select();
    this._findInput.focus();
  }
  focusReplaceInput() {
    this._replaceInput.select();
    this._replaceInput.focus();
  }
  highlightFindOptions() {
    this._findInput.highlightFindOptions();
  }
  _updateSearchScope() {
    if (!this._codeEditor.hasModel()) {
      return;
    }
    if (this._toggleSelectionFind.checked) {
      const selections = this._codeEditor.getSelections();
      selections.map((selection) => {
        if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
          selection = selection.setEndPosition(
            selection.endLineNumber - 1,
            this._codeEditor.getModel().getLineMaxColumn(selection.endLineNumber - 1)
          );
        }
        const currentMatch = this._state.currentMatch;
        if (selection.startLineNumber !== selection.endLineNumber) {
          if (!Range.equalsRange(selection, currentMatch)) {
            return selection;
          }
        }
        return null;
      }).filter((element) => !!element);
      if (selections.length) {
        this._state.change({ searchScope: selections }, true);
      }
    }
  }
  _onFindInputMouseDown(e) {
    if (e.middleButton) {
      e.stopPropagation();
    }
  }
  _onFindInputKeyDown(e) {
    if (e.equals(ctrlKeyMod | KeyCode.Enter)) {
      if (this._keybindingService.dispatchEvent(e, e.target)) {
        e.preventDefault();
        return;
      } else {
        this._findInput.inputBox.insertAtCursor("\n");
        e.preventDefault();
        return;
      }
    }
    if (e.equals(KeyCode.Tab)) {
      if (this._isReplaceVisible) {
        this._replaceInput.focus();
      } else {
        this._findInput.focusOnCaseSensitive();
      }
      e.preventDefault();
      return;
    }
    if (e.equals(KeyMod.CtrlCmd | KeyCode.DownArrow)) {
      this._codeEditor.focus();
      e.preventDefault();
      return;
    }
    if (e.equals(KeyCode.UpArrow)) {
      return stopPropagationForMultiLineUpwards(e, this._findInput.getValue(), this._findInput.domNode.querySelector("textarea"));
    }
    if (e.equals(KeyCode.DownArrow)) {
      return stopPropagationForMultiLineDownwards(e, this._findInput.getValue(), this._findInput.domNode.querySelector("textarea"));
    }
  }
  _onReplaceInputKeyDown(e) {
    if (e.equals(ctrlKeyMod | KeyCode.Enter)) {
      if (this._keybindingService.dispatchEvent(e, e.target)) {
        e.preventDefault();
        return;
      } else {
        if (platform.isWindows && platform.isNative && !this._ctrlEnterReplaceAllWarningPrompted) {
          this._notificationService.info(
            nls.localize(
              "ctrlEnter.keybindingChanged",
              "Ctrl+Enter now inserts line break instead of replacing all. You can modify the keybinding for editor.action.replaceAll to override this behavior."
            )
          );
          this._ctrlEnterReplaceAllWarningPrompted = true;
          this._storageService.store(ctrlEnterReplaceAllWarningPromptedKey, true, StorageScope.PROFILE, StorageTarget.USER);
        }
        this._replaceInput.inputBox.insertAtCursor("\n");
        e.preventDefault();
        return;
      }
    }
    if (e.equals(KeyCode.Tab)) {
      this._findInput.focusOnCaseSensitive();
      e.preventDefault();
      return;
    }
    if (e.equals(KeyMod.Shift | KeyCode.Tab)) {
      this._findInput.focus();
      e.preventDefault();
      return;
    }
    if (e.equals(KeyMod.CtrlCmd | KeyCode.DownArrow)) {
      this._codeEditor.focus();
      e.preventDefault();
      return;
    }
    if (e.equals(KeyCode.UpArrow)) {
      return stopPropagationForMultiLineUpwards(e, this._replaceInput.inputBox.value, this._replaceInput.inputBox.element.querySelector("textarea"));
    }
    if (e.equals(KeyCode.DownArrow)) {
      return stopPropagationForMultiLineDownwards(e, this._replaceInput.inputBox.value, this._replaceInput.inputBox.element.querySelector("textarea"));
    }
  }
  // ----- sash
  getVerticalSashLeft(_sash) {
    return 0;
  }
  // ----- initialization
  _keybindingLabelFor(actionId) {
    const kb = this._keybindingService.lookupKeybinding(actionId);
    if (!kb) {
      return "";
    }
    return ` (${kb.getLabel()})`;
  }
  _buildDomNode() {
    const flexibleHeight = true;
    const flexibleWidth = true;
    this._findInput = this._register(new ContextScopedFindInput(null, this._contextViewProvider, {
      width: FIND_INPUT_AREA_WIDTH,
      label: NLS_FIND_INPUT_LABEL,
      placeholder: NLS_FIND_INPUT_PLACEHOLDER,
      appendCaseSensitiveLabel: this._keybindingLabelFor(FIND_IDS.ToggleCaseSensitiveCommand),
      appendWholeWordsLabel: this._keybindingLabelFor(FIND_IDS.ToggleWholeWordCommand),
      appendRegexLabel: this._keybindingLabelFor(FIND_IDS.ToggleRegexCommand),
      validation: /* @__PURE__ */ __name((value) => {
        if (value.length === 0 || !this._findInput.getRegex()) {
          return null;
        }
        try {
          new RegExp(value, "gu");
          return null;
        } catch (e) {
          return { content: e.message };
        }
      }, "validation"),
      flexibleHeight,
      flexibleWidth,
      flexibleMaxHeight: 118,
      showCommonFindToggles: true,
      showHistoryHint: /* @__PURE__ */ __name(() => showHistoryKeybindingHint(this._keybindingService), "showHistoryHint"),
      inputBoxStyles: defaultInputBoxStyles,
      toggleStyles: defaultToggleStyles
    }, this._contextKeyService));
    this._findInput.setRegex(!!this._state.isRegex);
    this._findInput.setCaseSensitive(!!this._state.matchCase);
    this._findInput.setWholeWords(!!this._state.wholeWord);
    this._register(this._findInput.onKeyDown((e) => this._onFindInputKeyDown(e)));
    this._register(this._findInput.inputBox.onDidChange(() => {
      if (this._ignoreChangeEvent) {
        return;
      }
      this._state.change({ searchString: this._findInput.getValue() }, true);
    }));
    this._register(this._findInput.onDidOptionChange(() => {
      this._state.change({
        isRegex: this._findInput.getRegex(),
        wholeWord: this._findInput.getWholeWords(),
        matchCase: this._findInput.getCaseSensitive()
      }, true);
    }));
    this._register(this._findInput.onCaseSensitiveKeyDown((e) => {
      if (e.equals(KeyMod.Shift | KeyCode.Tab)) {
        if (this._isReplaceVisible) {
          this._replaceInput.focus();
          e.preventDefault();
        }
      }
    }));
    this._register(this._findInput.onRegexKeyDown((e) => {
      if (e.equals(KeyCode.Tab)) {
        if (this._isReplaceVisible) {
          this._replaceInput.focusOnPreserve();
          e.preventDefault();
        }
      }
    }));
    this._register(this._findInput.inputBox.onDidHeightChange((e) => {
      if (this._tryUpdateHeight()) {
        this._showViewZone();
      }
    }));
    if (platform.isLinux) {
      this._register(this._findInput.onMouseDown((e) => this._onFindInputMouseDown(e)));
    }
    this._matchesCount = document.createElement("div");
    this._matchesCount.className = "matchesCount";
    this._updateMatchesCount();
    const hoverDelegate = this._register(createInstantHoverDelegate());
    this._prevBtn = this._register(new SimpleButton({
      label: NLS_PREVIOUS_MATCH_BTN_LABEL + this._keybindingLabelFor(FIND_IDS.PreviousMatchFindAction),
      icon: findPreviousMatchIcon,
      hoverDelegate,
      onTrigger: /* @__PURE__ */ __name(() => {
        assertIsDefined(this._codeEditor.getAction(FIND_IDS.PreviousMatchFindAction)).run().then(void 0, onUnexpectedError);
      }, "onTrigger")
    }, this._hoverService));
    this._nextBtn = this._register(new SimpleButton({
      label: NLS_NEXT_MATCH_BTN_LABEL + this._keybindingLabelFor(FIND_IDS.NextMatchFindAction),
      icon: findNextMatchIcon,
      hoverDelegate,
      onTrigger: /* @__PURE__ */ __name(() => {
        assertIsDefined(this._codeEditor.getAction(FIND_IDS.NextMatchFindAction)).run().then(void 0, onUnexpectedError);
      }, "onTrigger")
    }, this._hoverService));
    const findPart = document.createElement("div");
    findPart.className = "find-part";
    findPart.appendChild(this._findInput.domNode);
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "find-actions";
    findPart.appendChild(actionsContainer);
    actionsContainer.appendChild(this._matchesCount);
    actionsContainer.appendChild(this._prevBtn.domNode);
    actionsContainer.appendChild(this._nextBtn.domNode);
    this._toggleSelectionFind = this._register(new Toggle({
      icon: findSelectionIcon,
      title: NLS_TOGGLE_SELECTION_FIND_TITLE + this._keybindingLabelFor(FIND_IDS.ToggleSearchScopeCommand),
      isChecked: false,
      hoverDelegate,
      inputActiveOptionBackground: asCssVariable(inputActiveOptionBackground),
      inputActiveOptionBorder: asCssVariable(inputActiveOptionBorder),
      inputActiveOptionForeground: asCssVariable(inputActiveOptionForeground)
    }));
    this._register(this._toggleSelectionFind.onChange(() => {
      if (this._toggleSelectionFind.checked) {
        if (this._codeEditor.hasModel()) {
          let selections = this._codeEditor.getSelections();
          selections = selections.map((selection) => {
            if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
              selection = selection.setEndPosition(selection.endLineNumber - 1, this._codeEditor.getModel().getLineMaxColumn(selection.endLineNumber - 1));
            }
            if (!selection.isEmpty()) {
              return selection;
            }
            return null;
          }).filter((element) => !!element);
          if (selections.length) {
            this._state.change({ searchScope: selections }, true);
          }
        }
      } else {
        this._state.change({ searchScope: null }, true);
      }
    }));
    actionsContainer.appendChild(this._toggleSelectionFind.domNode);
    this._closeBtn = this._register(new SimpleButton({
      label: NLS_CLOSE_BTN_LABEL + this._keybindingLabelFor(FIND_IDS.CloseFindWidgetCommand),
      icon: widgetClose,
      hoverDelegate,
      onTrigger: /* @__PURE__ */ __name(() => {
        this._state.change({ isRevealed: false, searchScope: null }, false);
      }, "onTrigger"),
      onKeyDown: /* @__PURE__ */ __name((e) => {
        if (e.equals(KeyCode.Tab)) {
          if (this._isReplaceVisible) {
            if (this._replaceBtn.isEnabled()) {
              this._replaceBtn.focus();
            } else {
              this._codeEditor.focus();
            }
            e.preventDefault();
          }
        }
      }, "onKeyDown")
    }, this._hoverService));
    this._replaceInput = this._register(new ContextScopedReplaceInput(null, void 0, {
      label: NLS_REPLACE_INPUT_LABEL,
      placeholder: NLS_REPLACE_INPUT_PLACEHOLDER,
      appendPreserveCaseLabel: this._keybindingLabelFor(FIND_IDS.TogglePreserveCaseCommand),
      history: [],
      flexibleHeight,
      flexibleWidth,
      flexibleMaxHeight: 118,
      showHistoryHint: /* @__PURE__ */ __name(() => showHistoryKeybindingHint(this._keybindingService), "showHistoryHint"),
      inputBoxStyles: defaultInputBoxStyles,
      toggleStyles: defaultToggleStyles
    }, this._contextKeyService, true));
    this._replaceInput.setPreserveCase(!!this._state.preserveCase);
    this._register(this._replaceInput.onKeyDown((e) => this._onReplaceInputKeyDown(e)));
    this._register(this._replaceInput.inputBox.onDidChange(() => {
      this._state.change({ replaceString: this._replaceInput.inputBox.value }, false);
    }));
    this._register(this._replaceInput.inputBox.onDidHeightChange((e) => {
      if (this._isReplaceVisible && this._tryUpdateHeight()) {
        this._showViewZone();
      }
    }));
    this._register(this._replaceInput.onDidOptionChange(() => {
      this._state.change({
        preserveCase: this._replaceInput.getPreserveCase()
      }, true);
    }));
    this._register(this._replaceInput.onPreserveCaseKeyDown((e) => {
      if (e.equals(KeyCode.Tab)) {
        if (this._prevBtn.isEnabled()) {
          this._prevBtn.focus();
        } else if (this._nextBtn.isEnabled()) {
          this._nextBtn.focus();
        } else if (this._toggleSelectionFind.enabled) {
          this._toggleSelectionFind.focus();
        } else if (this._closeBtn.isEnabled()) {
          this._closeBtn.focus();
        }
        e.preventDefault();
      }
    }));
    const replaceHoverDelegate = this._register(createInstantHoverDelegate());
    this._replaceBtn = this._register(new SimpleButton({
      label: NLS_REPLACE_BTN_LABEL + this._keybindingLabelFor(FIND_IDS.ReplaceOneAction),
      icon: findReplaceIcon,
      hoverDelegate: replaceHoverDelegate,
      onTrigger: /* @__PURE__ */ __name(() => {
        this._controller.replace();
      }, "onTrigger"),
      onKeyDown: /* @__PURE__ */ __name((e) => {
        if (e.equals(KeyMod.Shift | KeyCode.Tab)) {
          this._closeBtn.focus();
          e.preventDefault();
        }
      }, "onKeyDown")
    }, this._hoverService));
    this._replaceAllBtn = this._register(new SimpleButton({
      label: NLS_REPLACE_ALL_BTN_LABEL + this._keybindingLabelFor(FIND_IDS.ReplaceAllAction),
      icon: findReplaceAllIcon,
      hoverDelegate: replaceHoverDelegate,
      onTrigger: /* @__PURE__ */ __name(() => {
        this._controller.replaceAll();
      }, "onTrigger")
    }, this._hoverService));
    const replacePart = document.createElement("div");
    replacePart.className = "replace-part";
    replacePart.appendChild(this._replaceInput.domNode);
    const replaceActionsContainer = document.createElement("div");
    replaceActionsContainer.className = "replace-actions";
    replacePart.appendChild(replaceActionsContainer);
    replaceActionsContainer.appendChild(this._replaceBtn.domNode);
    replaceActionsContainer.appendChild(this._replaceAllBtn.domNode);
    this._toggleReplaceBtn = this._register(new SimpleButton({
      label: NLS_TOGGLE_REPLACE_MODE_BTN_LABEL,
      className: "codicon toggle left",
      onTrigger: /* @__PURE__ */ __name(() => {
        this._state.change({ isReplaceRevealed: !this._isReplaceVisible }, false);
        if (this._isReplaceVisible) {
          this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
          this._replaceInput.inputBox.layout();
        }
        this._showViewZone();
      }, "onTrigger")
    }, this._hoverService));
    this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
    this._domNode = document.createElement("div");
    this._domNode.className = "editor-widget find-widget";
    this._domNode.setAttribute("aria-hidden", "true");
    this._domNode.ariaLabel = NLS_FIND_DIALOG_LABEL;
    this._domNode.role = "dialog";
    this._domNode.style.width = `${FIND_WIDGET_INITIAL_WIDTH}px`;
    this._domNode.appendChild(this._toggleReplaceBtn.domNode);
    this._domNode.appendChild(findPart);
    this._domNode.appendChild(this._closeBtn.domNode);
    this._domNode.appendChild(replacePart);
    this._resizeSash = this._register(new Sash(this._domNode, this, { orientation: Orientation.VERTICAL, size: 2 }));
    this._resized = false;
    let originalWidth = FIND_WIDGET_INITIAL_WIDTH;
    this._register(this._resizeSash.onDidStart(() => {
      originalWidth = dom.getTotalWidth(this._domNode);
    }));
    this._register(this._resizeSash.onDidChange((evt) => {
      this._resized = true;
      const width = originalWidth + evt.startX - evt.currentX;
      if (width < FIND_WIDGET_INITIAL_WIDTH) {
        return;
      }
      const maxWidth = parseFloat(dom.getComputedStyle(this._domNode).maxWidth) || 0;
      if (width > maxWidth) {
        return;
      }
      this._domNode.style.width = `${width}px`;
      if (this._isReplaceVisible) {
        this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
      }
      this._findInput.inputBox.layout();
      this._tryUpdateHeight();
    }));
    this._register(this._resizeSash.onDidReset(() => {
      const currentWidth = dom.getTotalWidth(this._domNode);
      if (currentWidth < FIND_WIDGET_INITIAL_WIDTH) {
        return;
      }
      let width = FIND_WIDGET_INITIAL_WIDTH;
      if (!this._resized || currentWidth === FIND_WIDGET_INITIAL_WIDTH) {
        const layoutInfo = this._codeEditor.getLayoutInfo();
        width = layoutInfo.width - 28 - layoutInfo.minimap.minimapWidth - 15;
        this._resized = true;
      } else {
      }
      this._domNode.style.width = `${width}px`;
      if (this._isReplaceVisible) {
        this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
      }
      this._findInput.inputBox.layout();
    }));
  }
  updateAccessibilitySupport() {
    const value = this._codeEditor.getOption(EditorOption.accessibilitySupport);
    this._findInput.setFocusInputOnOptionClick(value !== AccessibilitySupport.Enabled);
  }
  getViewState() {
    let widgetViewZoneVisible = false;
    if (this._viewZone && this._viewZoneId) {
      widgetViewZoneVisible = this._viewZone.heightInPx > this._codeEditor.getScrollTop();
    }
    return {
      widgetViewZoneVisible,
      scrollTop: this._codeEditor.getScrollTop()
    };
  }
  setViewState(state) {
    if (!state) {
      return;
    }
    if (state.widgetViewZoneVisible) {
      this._layoutViewZone(state.scrollTop);
    }
  }
}
class SimpleButton extends Widget {
  static {
    __name(this, "SimpleButton");
  }
  _opts;
  _domNode;
  constructor(opts, hoverService) {
    super();
    this._opts = opts;
    let className = "button";
    if (this._opts.className) {
      className = className + " " + this._opts.className;
    }
    if (this._opts.icon) {
      className = className + " " + ThemeIcon.asClassName(this._opts.icon);
    }
    this._domNode = document.createElement("div");
    this._domNode.tabIndex = 0;
    this._domNode.className = className;
    this._domNode.setAttribute("role", "button");
    this._domNode.setAttribute("aria-label", this._opts.label);
    this._register(hoverService.setupManagedHover(opts.hoverDelegate ?? getDefaultHoverDelegate("element"), this._domNode, this._opts.label));
    this.onclick(this._domNode, (e) => {
      this._opts.onTrigger();
      e.preventDefault();
    });
    this.onkeydown(this._domNode, (e) => {
      if (e.equals(KeyCode.Space) || e.equals(KeyCode.Enter)) {
        this._opts.onTrigger();
        e.preventDefault();
        return;
      }
      this._opts.onKeyDown?.(e);
    });
  }
  get domNode() {
    return this._domNode;
  }
  isEnabled() {
    return this._domNode.tabIndex >= 0;
  }
  focus() {
    this._domNode.focus();
  }
  setEnabled(enabled) {
    this._domNode.classList.toggle("disabled", !enabled);
    this._domNode.setAttribute("aria-disabled", String(!enabled));
    this._domNode.tabIndex = enabled ? 0 : -1;
  }
  setExpanded(expanded) {
    this._domNode.setAttribute("aria-expanded", String(!!expanded));
    if (expanded) {
      this._domNode.classList.remove(...ThemeIcon.asClassNameArray(findCollapsedIcon));
      this._domNode.classList.add(...ThemeIcon.asClassNameArray(findExpandedIcon));
    } else {
      this._domNode.classList.remove(...ThemeIcon.asClassNameArray(findExpandedIcon));
      this._domNode.classList.add(...ThemeIcon.asClassNameArray(findCollapsedIcon));
    }
  }
}
registerThemingParticipant((theme, collector) => {
  const findMatchHighlightBorder = theme.getColor(editorFindMatchHighlightBorder);
  if (findMatchHighlightBorder) {
    collector.addRule(`.monaco-editor .findMatch { border: 1px ${isHighContrast(theme.type) ? "dotted" : "solid"} ${findMatchHighlightBorder}; box-sizing: border-box; }`);
  }
  const findRangeHighlightBorder = theme.getColor(editorFindRangeHighlightBorder);
  if (findRangeHighlightBorder) {
    collector.addRule(`.monaco-editor .findScope { border: 1px ${isHighContrast(theme.type) ? "dashed" : "solid"} ${findRangeHighlightBorder}; }`);
  }
  const hcBorder = theme.getColor(contrastBorder);
  if (hcBorder) {
    collector.addRule(`.monaco-editor .find-widget { border: 1px solid ${hcBorder}; }`);
  }
  const findMatchForeground = theme.getColor(editorFindMatchForeground);
  if (findMatchForeground) {
    collector.addRule(`.monaco-editor .findMatchInline { color: ${findMatchForeground}; }`);
  }
  const findMatchHighlightForeground = theme.getColor(editorFindMatchHighlightForeground);
  if (findMatchHighlightForeground) {
    collector.addRule(`.monaco-editor .currentFindMatchInline { color: ${findMatchHighlightForeground}; }`);
  }
});
export {
  FindWidget,
  FindWidgetViewZone,
  NLS_MATCHES_LOCATION,
  NLS_NO_RESULTS,
  SimpleButton,
  findNextMatchIcon,
  findPreviousMatchIcon,
  findReplaceAllIcon,
  findReplaceIcon,
  findSelectionIcon
};
//# sourceMappingURL=findWidget.js.map
