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
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { IManagedHover } from "../../../../base/browser/ui/hover/hover.js";
import { getBaseLayerHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { IListRenderer, IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { List } from "../../../../base/browser/ui/list/listWidget.js";
import * as arrays from "../../../../base/common/arrays.js";
import { DeferredPromise, raceCancellation } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { assertType, isDefined } from "../../../../base/common/types.js";
import "./renameWidget.css";
import * as domFontInfo from "../../../browser/config/domFontInfo.js";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { FontInfo } from "../../../common/config/fontInfo.js";
import { IDimension } from "../../../common/core/dimension.js";
import { Position } from "../../../common/core/position.js";
import { IRange, Range } from "../../../common/core/range.js";
import { ScrollType } from "../../../common/editorCommon.js";
import { NewSymbolName, NewSymbolNameTag, NewSymbolNameTriggerKind, ProviderResult } from "../../../common/languages.js";
import * as nls from "../../../../nls.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { getListStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import {
  editorWidgetBackground,
  inputBackground,
  inputBorder,
  inputForeground,
  quickInputListFocusBackground,
  quickInputListFocusForeground,
  widgetBorder,
  widgetShadow
} from "../../../../platform/theme/common/colorRegistry.js";
import { IColorTheme, IThemeService } from "../../../../platform/theme/common/themeService.js";
const _sticky = false;
const CONTEXT_RENAME_INPUT_VISIBLE = new RawContextKey("renameInputVisible", false, nls.localize("renameInputVisible", "Whether the rename input widget is visible"));
const CONTEXT_RENAME_INPUT_FOCUSED = new RawContextKey("renameInputFocused", false, nls.localize("renameInputFocused", "Whether the rename input widget is focused"));
let RenameWidget = class {
  constructor(_editor, _acceptKeybindings, _themeService, _keybindingService, contextKeyService, _logService) {
    this._editor = _editor;
    this._acceptKeybindings = _acceptKeybindings;
    this._themeService = _themeService;
    this._keybindingService = _keybindingService;
    this._logService = _logService;
    this._visibleContextKey = CONTEXT_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
    this._isEditingRenameCandidate = false;
    this._nRenameSuggestionsInvocations = 0;
    this._hadAutomaticRenameSuggestionsInvocation = false;
    this._candidates = /* @__PURE__ */ new Set();
    this._beforeFirstInputFieldEditSW = new StopWatch();
    this._inputWithButton = new InputWithButton();
    this._disposables.add(this._inputWithButton);
    this._editor.addContentWidget(this);
    this._disposables.add(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontInfo)) {
        this._updateFont();
      }
    }));
    this._disposables.add(_themeService.onDidColorThemeChange(this._updateStyles, this));
  }
  static {
    __name(this, "RenameWidget");
  }
  // implement IContentWidget
  allowEditorOverflow = true;
  // UI state
  _domNode;
  _inputWithButton;
  _renameCandidateListView;
  _label;
  _nPxAvailableAbove;
  _nPxAvailableBelow;
  // Model state
  _position;
  _currentName;
  /** Is true if input field got changes when a rename candidate was focused; otherwise, false */
  _isEditingRenameCandidate;
  _candidates;
  _visible;
  /** must be reset at session start */
  _beforeFirstInputFieldEditSW;
  /**
   * Milliseconds before user edits the input field for the first time
   * @remarks must be set once per session
   */
  _timeBeforeFirstInputFieldEdit;
  _nRenameSuggestionsInvocations;
  _hadAutomaticRenameSuggestionsInvocation;
  _renameCandidateProvidersCts;
  _renameCts;
  _visibleContextKey;
  _disposables = new DisposableStore();
  dispose() {
    this._disposables.dispose();
    this._editor.removeContentWidget(this);
  }
  getId() {
    return "__renameInputWidget";
  }
  getDomNode() {
    if (!this._domNode) {
      this._domNode = document.createElement("div");
      this._domNode.className = "monaco-editor rename-box";
      this._domNode.appendChild(this._inputWithButton.domNode);
      this._renameCandidateListView = this._disposables.add(
        new RenameCandidateListView(this._domNode, {
          fontInfo: this._editor.getOption(EditorOption.fontInfo),
          onFocusChange: /* @__PURE__ */ __name((newSymbolName) => {
            this._inputWithButton.input.value = newSymbolName;
            this._isEditingRenameCandidate = false;
          }, "onFocusChange"),
          onSelectionChange: /* @__PURE__ */ __name(() => {
            this._isEditingRenameCandidate = false;
            this.acceptInput(false);
          }, "onSelectionChange")
        })
      );
      this._disposables.add(
        this._inputWithButton.onDidInputChange(() => {
          if (this._renameCandidateListView?.focusedCandidate !== void 0) {
            this._isEditingRenameCandidate = true;
          }
          this._timeBeforeFirstInputFieldEdit ??= this._beforeFirstInputFieldEditSW.elapsed();
          if (this._renameCandidateProvidersCts?.token.isCancellationRequested === false) {
            this._renameCandidateProvidersCts.cancel();
          }
          this._renameCandidateListView?.clearFocus();
        })
      );
      this._label = document.createElement("div");
      this._label.className = "rename-label";
      this._domNode.appendChild(this._label);
      this._updateFont();
      this._updateStyles(this._themeService.getColorTheme());
    }
    return this._domNode;
  }
  _updateStyles(theme) {
    if (!this._domNode) {
      return;
    }
    const widgetShadowColor = theme.getColor(widgetShadow);
    const widgetBorderColor = theme.getColor(widgetBorder);
    this._domNode.style.backgroundColor = String(theme.getColor(editorWidgetBackground) ?? "");
    this._domNode.style.boxShadow = widgetShadowColor ? ` 0 0 8px 2px ${widgetShadowColor}` : "";
    this._domNode.style.border = widgetBorderColor ? `1px solid ${widgetBorderColor}` : "";
    this._domNode.style.color = String(theme.getColor(inputForeground) ?? "");
    const border = theme.getColor(inputBorder);
    this._inputWithButton.domNode.style.backgroundColor = String(theme.getColor(inputBackground) ?? "");
    this._inputWithButton.input.style.backgroundColor = String(theme.getColor(inputBackground) ?? "");
    this._inputWithButton.domNode.style.borderWidth = border ? "1px" : "0px";
    this._inputWithButton.domNode.style.borderStyle = border ? "solid" : "none";
    this._inputWithButton.domNode.style.borderColor = border?.toString() ?? "none";
  }
  _updateFont() {
    if (this._domNode === void 0) {
      return;
    }
    assertType(this._label !== void 0, "RenameWidget#_updateFont: _label must not be undefined given _domNode is defined");
    this._editor.applyFontInfo(this._inputWithButton.input);
    const fontInfo = this._editor.getOption(EditorOption.fontInfo);
    this._label.style.fontSize = `${this._computeLabelFontSize(fontInfo.fontSize)}px`;
  }
  _computeLabelFontSize(editorFontSize) {
    return editorFontSize * 0.8;
  }
  getPosition() {
    if (!this._visible) {
      return null;
    }
    if (!this._editor.hasModel() || // @ulugbekna: shouldn't happen
    !this._editor.getDomNode()) {
      return null;
    }
    const bodyBox = dom.getClientArea(this.getDomNode().ownerDocument.body);
    const editorBox = dom.getDomNodePagePosition(this._editor.getDomNode());
    const cursorBoxTop = this._getTopForPosition();
    this._nPxAvailableAbove = cursorBoxTop + editorBox.top;
    this._nPxAvailableBelow = bodyBox.height - this._nPxAvailableAbove;
    const lineHeight = this._editor.getOption(EditorOption.lineHeight);
    const { totalHeight: candidateViewHeight } = RenameCandidateView.getLayoutInfo({ lineHeight });
    const positionPreference = this._nPxAvailableBelow > candidateViewHeight * 6 ? [ContentWidgetPositionPreference.BELOW, ContentWidgetPositionPreference.ABOVE] : [ContentWidgetPositionPreference.ABOVE, ContentWidgetPositionPreference.BELOW];
    return {
      position: this._position,
      preference: positionPreference
    };
  }
  beforeRender() {
    const [accept, preview] = this._acceptKeybindings;
    this._label.innerText = nls.localize({ key: "label", comment: ['placeholders are keybindings, e.g "F2 to Rename, Shift+F2 to Preview"'] }, "{0} to Rename, {1} to Preview", this._keybindingService.lookupKeybinding(accept)?.getLabel(), this._keybindingService.lookupKeybinding(preview)?.getLabel());
    this._domNode.style.minWidth = `200px`;
    return null;
  }
  afterRender(position) {
    if (position === null) {
      this.cancelInput(true, "afterRender (because position is null)");
      return;
    }
    if (!this._editor.hasModel() || // shouldn't happen
    !this._editor.getDomNode()) {
      return;
    }
    assertType(this._renameCandidateListView);
    assertType(this._nPxAvailableAbove !== void 0);
    assertType(this._nPxAvailableBelow !== void 0);
    const inputBoxHeight = dom.getTotalHeight(this._inputWithButton.domNode);
    const labelHeight = dom.getTotalHeight(this._label);
    let totalHeightAvailable;
    if (position === ContentWidgetPositionPreference.BELOW) {
      totalHeightAvailable = this._nPxAvailableBelow;
    } else {
      totalHeightAvailable = this._nPxAvailableAbove;
    }
    this._renameCandidateListView.layout({
      height: totalHeightAvailable - labelHeight - inputBoxHeight,
      width: dom.getTotalWidth(this._inputWithButton.domNode)
    });
  }
  _currentAcceptInput;
  _currentCancelInput;
  _requestRenameCandidatesOnce;
  acceptInput(wantsPreview) {
    this._trace(`invoking acceptInput`);
    this._currentAcceptInput?.(wantsPreview);
  }
  cancelInput(focusEditor, caller) {
    this._currentCancelInput?.(focusEditor);
  }
  focusNextRenameSuggestion() {
    if (!this._renameCandidateListView?.focusNext()) {
      this._inputWithButton.input.value = this._currentName;
    }
  }
  focusPreviousRenameSuggestion() {
    if (!this._renameCandidateListView?.focusPrevious()) {
      this._inputWithButton.input.value = this._currentName;
    }
  }
  /**
   * @param requestRenameCandidates is `undefined` when there are no rename suggestion providers
   */
  getInput(where, currentName, supportPreview, requestRenameCandidates, cts) {
    const { start: selectionStart, end: selectionEnd } = this._getSelection(where, currentName);
    this._renameCts = cts;
    const disposeOnDone = new DisposableStore();
    this._nRenameSuggestionsInvocations = 0;
    this._hadAutomaticRenameSuggestionsInvocation = false;
    if (requestRenameCandidates === void 0) {
      this._inputWithButton.button.style.display = "none";
    } else {
      this._inputWithButton.button.style.display = "flex";
      this._requestRenameCandidatesOnce = requestRenameCandidates;
      this._requestRenameCandidates(currentName, false);
      disposeOnDone.add(dom.addDisposableListener(
        this._inputWithButton.button,
        "click",
        () => this._requestRenameCandidates(currentName, true)
      ));
      disposeOnDone.add(dom.addDisposableListener(
        this._inputWithButton.button,
        dom.EventType.KEY_DOWN,
        (e) => {
          const keyEvent = new StandardKeyboardEvent(e);
          if (keyEvent.equals(KeyCode.Enter) || keyEvent.equals(KeyCode.Space)) {
            keyEvent.stopPropagation();
            keyEvent.preventDefault();
            this._requestRenameCandidates(currentName, true);
          }
        }
      ));
    }
    this._isEditingRenameCandidate = false;
    this._domNode.classList.toggle("preview", supportPreview);
    this._position = new Position(where.startLineNumber, where.startColumn);
    this._currentName = currentName;
    this._inputWithButton.input.value = currentName;
    this._inputWithButton.input.setAttribute("selectionStart", selectionStart.toString());
    this._inputWithButton.input.setAttribute("selectionEnd", selectionEnd.toString());
    this._inputWithButton.input.size = Math.max((where.endColumn - where.startColumn) * 1.1, 20);
    this._beforeFirstInputFieldEditSW.reset();
    disposeOnDone.add(toDisposable(() => {
      this._renameCts = void 0;
      cts.dispose(true);
    }));
    disposeOnDone.add(toDisposable(() => {
      if (this._renameCandidateProvidersCts !== void 0) {
        this._renameCandidateProvidersCts.dispose(true);
        this._renameCandidateProvidersCts = void 0;
      }
    }));
    disposeOnDone.add(toDisposable(() => this._candidates.clear()));
    const inputResult = new DeferredPromise();
    inputResult.p.finally(() => {
      disposeOnDone.dispose();
      this._hide();
    });
    this._currentCancelInput = (focusEditor) => {
      this._trace("invoking _currentCancelInput");
      this._currentAcceptInput = void 0;
      this._currentCancelInput = void 0;
      this._renameCandidateListView?.clearCandidates();
      inputResult.complete(focusEditor);
      return true;
    };
    this._currentAcceptInput = (wantsPreview) => {
      this._trace("invoking _currentAcceptInput");
      assertType(this._renameCandidateListView !== void 0);
      const nRenameSuggestions = this._renameCandidateListView.nCandidates;
      let newName;
      let source;
      const focusedCandidate = this._renameCandidateListView.focusedCandidate;
      if (focusedCandidate !== void 0) {
        this._trace("using new name from renameSuggestion");
        newName = focusedCandidate;
        source = { k: "renameSuggestion" };
      } else {
        this._trace("using new name from inputField");
        newName = this._inputWithButton.input.value;
        source = this._isEditingRenameCandidate ? { k: "userEditedRenameSuggestion" } : { k: "inputField" };
      }
      if (newName === currentName || newName.trim().length === 0) {
        this.cancelInput(true, "_currentAcceptInput (because newName === value || newName.trim().length === 0)");
        return;
      }
      this._currentAcceptInput = void 0;
      this._currentCancelInput = void 0;
      this._renameCandidateListView.clearCandidates();
      inputResult.complete({
        newName,
        wantsPreview: supportPreview && wantsPreview,
        stats: {
          source,
          nRenameSuggestions,
          timeBeforeFirstInputFieldEdit: this._timeBeforeFirstInputFieldEdit,
          nRenameSuggestionsInvocations: this._nRenameSuggestionsInvocations,
          hadAutomaticRenameSuggestionsInvocation: this._hadAutomaticRenameSuggestionsInvocation
        }
      });
    };
    disposeOnDone.add(cts.token.onCancellationRequested(() => this.cancelInput(true, "cts.token.onCancellationRequested")));
    if (!_sticky) {
      disposeOnDone.add(this._editor.onDidBlurEditorWidget(() => this.cancelInput(!this._domNode?.ownerDocument.hasFocus(), "editor.onDidBlurEditorWidget")));
    }
    this._show();
    return inputResult.p;
  }
  _requestRenameCandidates(currentName, isManuallyTriggered) {
    if (this._requestRenameCandidatesOnce === void 0) {
      return;
    }
    if (this._renameCandidateProvidersCts !== void 0) {
      this._renameCandidateProvidersCts.dispose(true);
    }
    assertType(this._renameCts);
    if (this._inputWithButton.buttonState !== "stop") {
      this._renameCandidateProvidersCts = new CancellationTokenSource();
      const triggerKind = isManuallyTriggered ? NewSymbolNameTriggerKind.Invoke : NewSymbolNameTriggerKind.Automatic;
      const candidates = this._requestRenameCandidatesOnce(triggerKind, this._renameCandidateProvidersCts.token);
      if (candidates.length === 0) {
        this._inputWithButton.setSparkleButton();
        return;
      }
      if (!isManuallyTriggered) {
        this._hadAutomaticRenameSuggestionsInvocation = true;
      }
      this._nRenameSuggestionsInvocations += 1;
      this._inputWithButton.setStopButton();
      this._updateRenameCandidates(candidates, currentName, this._renameCts.token);
    }
  }
  /**
   * This allows selecting only part of the symbol name in the input field based on the selection in the editor
   */
  _getSelection(where, currentName) {
    assertType(this._editor.hasModel());
    const selection = this._editor.getSelection();
    let start = 0;
    let end = currentName.length;
    if (!Range.isEmpty(selection) && !Range.spansMultipleLines(selection) && Range.containsRange(where, selection)) {
      start = Math.max(0, selection.startColumn - where.startColumn);
      end = Math.min(where.endColumn, selection.endColumn) - where.startColumn;
    }
    return { start, end };
  }
  _show() {
    this._trace("invoking _show");
    this._editor.revealLineInCenterIfOutsideViewport(this._position.lineNumber, ScrollType.Smooth);
    this._visible = true;
    this._visibleContextKey.set(true);
    this._editor.layoutContentWidget(this);
    setTimeout(() => {
      this._inputWithButton.input.focus();
      this._inputWithButton.input.setSelectionRange(
        parseInt(this._inputWithButton.input.getAttribute("selectionStart")),
        parseInt(this._inputWithButton.input.getAttribute("selectionEnd"))
      );
    }, 100);
  }
  async _updateRenameCandidates(candidates, currentName, token) {
    const trace = /* @__PURE__ */ __name((...args) => this._trace("_updateRenameCandidates", ...args), "trace");
    trace("start");
    const namesListResults = await raceCancellation(Promise.allSettled(candidates), token);
    this._inputWithButton.setSparkleButton();
    if (namesListResults === void 0) {
      trace("returning early - received updateRenameCandidates results - undefined");
      return;
    }
    const newNames = namesListResults.flatMap(
      (namesListResult) => namesListResult.status === "fulfilled" && isDefined(namesListResult.value) ? namesListResult.value : []
    );
    trace(`received updateRenameCandidates results - total (unfiltered) ${newNames.length} candidates.`);
    const distinctNames = arrays.distinct(newNames, (v) => v.newSymbolName);
    trace(`distinct candidates - ${distinctNames.length} candidates.`);
    const validDistinctNames = distinctNames.filter(({ newSymbolName }) => newSymbolName.trim().length > 0 && newSymbolName !== this._inputWithButton.input.value && newSymbolName !== currentName && !this._candidates.has(newSymbolName));
    trace(`valid distinct candidates - ${newNames.length} candidates.`);
    validDistinctNames.forEach((n) => this._candidates.add(n.newSymbolName));
    if (validDistinctNames.length < 1) {
      trace("returning early - no valid distinct candidates");
      return;
    }
    trace("setting candidates");
    this._renameCandidateListView.setCandidates(validDistinctNames);
    trace("asking editor to re-layout");
    this._editor.layoutContentWidget(this);
  }
  _hide() {
    this._trace("invoked _hide");
    this._visible = false;
    this._visibleContextKey.reset();
    this._editor.layoutContentWidget(this);
  }
  _getTopForPosition() {
    const visibleRanges = this._editor.getVisibleRanges();
    let firstLineInViewport;
    if (visibleRanges.length > 0) {
      firstLineInViewport = visibleRanges[0].startLineNumber;
    } else {
      this._logService.warn("RenameWidget#_getTopForPosition: this should not happen - visibleRanges is empty");
      firstLineInViewport = Math.max(1, this._position.lineNumber - 5);
    }
    return this._editor.getTopForLineNumber(this._position.lineNumber) - this._editor.getTopForLineNumber(firstLineInViewport);
  }
  _trace(...args) {
    this._logService.trace("RenameWidget", ...args);
  }
};
RenameWidget = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, ILogService)
], RenameWidget);
class RenameCandidateListView {
  static {
    __name(this, "RenameCandidateListView");
  }
  /** Parent node of the list widget; needed to control # of list elements visible */
  _listContainer;
  _listWidget;
  _lineHeight;
  _availableHeight;
  _minimumWidth;
  _typicalHalfwidthCharacterWidth;
  _disposables;
  // FIXME@ulugbekna: rewrite using event emitters
  constructor(parent, opts) {
    this._disposables = new DisposableStore();
    this._availableHeight = 0;
    this._minimumWidth = 0;
    this._lineHeight = opts.fontInfo.lineHeight;
    this._typicalHalfwidthCharacterWidth = opts.fontInfo.typicalHalfwidthCharacterWidth;
    this._listContainer = document.createElement("div");
    this._listContainer.className = "rename-box rename-candidate-list-container";
    parent.appendChild(this._listContainer);
    this._listWidget = RenameCandidateListView._createListWidget(this._listContainer, this._candidateViewHeight, opts.fontInfo);
    this._listWidget.onDidChangeFocus(
      (e) => {
        if (e.elements.length === 1) {
          opts.onFocusChange(e.elements[0].newSymbolName);
        }
      },
      this._disposables
    );
    this._listWidget.onDidChangeSelection(
      (e) => {
        if (e.elements.length === 1) {
          opts.onSelectionChange();
        }
      },
      this._disposables
    );
    this._disposables.add(
      this._listWidget.onDidBlur((e) => {
        this._listWidget.setFocus([]);
      })
    );
    this._listWidget.style(getListStyles({
      listInactiveFocusForeground: quickInputListFocusForeground,
      listInactiveFocusBackground: quickInputListFocusBackground
    }));
  }
  dispose() {
    this._listWidget.dispose();
    this._disposables.dispose();
  }
  // height - max height allowed by parent element
  layout({ height, width }) {
    this._availableHeight = height;
    this._minimumWidth = width;
  }
  setCandidates(candidates) {
    this._listWidget.splice(0, 0, candidates);
    const height = this._pickListHeight(this._listWidget.length);
    const width = this._pickListWidth(candidates);
    this._listWidget.layout(height, width);
    this._listContainer.style.height = `${height}px`;
    this._listContainer.style.width = `${width}px`;
    aria.status(nls.localize("renameSuggestionsReceivedAria", "Received {0} rename suggestions", candidates.length));
  }
  clearCandidates() {
    this._listContainer.style.height = "0px";
    this._listContainer.style.width = "0px";
    this._listWidget.splice(0, this._listWidget.length, []);
  }
  get nCandidates() {
    return this._listWidget.length;
  }
  get focusedCandidate() {
    if (this._listWidget.length === 0) {
      return;
    }
    const selectedElement = this._listWidget.getSelectedElements()[0];
    if (selectedElement !== void 0) {
      return selectedElement.newSymbolName;
    }
    const focusedElement = this._listWidget.getFocusedElements()[0];
    if (focusedElement !== void 0) {
      return focusedElement.newSymbolName;
    }
    return;
  }
  focusNext() {
    if (this._listWidget.length === 0) {
      return false;
    }
    const focusedIxs = this._listWidget.getFocus();
    if (focusedIxs.length === 0) {
      this._listWidget.focusFirst();
      this._listWidget.reveal(0);
      return true;
    } else {
      if (focusedIxs[0] === this._listWidget.length - 1) {
        this._listWidget.setFocus([]);
        this._listWidget.reveal(0);
        return false;
      } else {
        this._listWidget.focusNext();
        const focused = this._listWidget.getFocus()[0];
        this._listWidget.reveal(focused);
        return true;
      }
    }
  }
  /**
   * @returns true if focus is moved to previous element
   */
  focusPrevious() {
    if (this._listWidget.length === 0) {
      return false;
    }
    const focusedIxs = this._listWidget.getFocus();
    if (focusedIxs.length === 0) {
      this._listWidget.focusLast();
      const focused = this._listWidget.getFocus()[0];
      this._listWidget.reveal(focused);
      return true;
    } else {
      if (focusedIxs[0] === 0) {
        this._listWidget.setFocus([]);
        return false;
      } else {
        this._listWidget.focusPrevious();
        const focused = this._listWidget.getFocus()[0];
        this._listWidget.reveal(focused);
        return true;
      }
    }
  }
  clearFocus() {
    this._listWidget.setFocus([]);
  }
  get _candidateViewHeight() {
    const { totalHeight } = RenameCandidateView.getLayoutInfo({ lineHeight: this._lineHeight });
    return totalHeight;
  }
  _pickListHeight(nCandidates) {
    const heightToFitAllCandidates = this._candidateViewHeight * nCandidates;
    const MAX_N_CANDIDATES = 7;
    const height = Math.min(heightToFitAllCandidates, this._availableHeight, this._candidateViewHeight * MAX_N_CANDIDATES);
    return height;
  }
  _pickListWidth(candidates) {
    const longestCandidateWidth = Math.ceil(Math.max(...candidates.map((c) => c.newSymbolName.length)) * this._typicalHalfwidthCharacterWidth);
    const width = Math.max(
      this._minimumWidth,
      4 + 16 + 5 + longestCandidateWidth + 10
      /* (possibly visible) scrollbar width */
      // TODO@ulugbekna: approximate calc - clean this up
    );
    return width;
  }
  static _createListWidget(container, candidateViewHeight, fontInfo) {
    const virtualDelegate = new class {
      getTemplateId(element) {
        return "candidate";
      }
      getHeight(element) {
        return candidateViewHeight;
      }
    }();
    const renderer = new class {
      templateId = "candidate";
      renderTemplate(container2) {
        return new RenameCandidateView(container2, fontInfo);
      }
      renderElement(candidate, index, templateData) {
        templateData.populate(candidate);
      }
      disposeTemplate(templateData) {
        templateData.dispose();
      }
    }();
    return new List(
      "NewSymbolNameCandidates",
      container,
      virtualDelegate,
      [renderer],
      {
        keyboardSupport: false,
        // @ulugbekna: because we handle keyboard events through proper commands & keybinding service, see `rename.ts`
        mouseSupport: true,
        multipleSelectionSupport: false
      }
    );
  }
}
class InputWithButton {
  static {
    __name(this, "InputWithButton");
  }
  _buttonState;
  _domNode;
  _inputNode;
  _buttonNode;
  _buttonHover;
  _buttonGenHoverText;
  _buttonCancelHoverText;
  _sparkleIcon;
  _stopIcon;
  _onDidInputChange = new Emitter();
  onDidInputChange = this._onDidInputChange.event;
  _disposables = new DisposableStore();
  get domNode() {
    if (!this._domNode) {
      this._domNode = document.createElement("div");
      this._domNode.className = "rename-input-with-button";
      this._domNode.style.display = "flex";
      this._domNode.style.flexDirection = "row";
      this._domNode.style.alignItems = "center";
      this._inputNode = document.createElement("input");
      this._inputNode.className = "rename-input";
      this._inputNode.type = "text";
      this._inputNode.style.border = "none";
      this._inputNode.setAttribute("aria-label", nls.localize("renameAriaLabel", "Rename input. Type new name and press Enter to commit."));
      this._domNode.appendChild(this._inputNode);
      this._buttonNode = document.createElement("div");
      this._buttonNode.className = "rename-suggestions-button";
      this._buttonNode.setAttribute("tabindex", "0");
      this._buttonGenHoverText = nls.localize("generateRenameSuggestionsButton", "Generate new name suggestions");
      this._buttonCancelHoverText = nls.localize("cancelRenameSuggestionsButton", "Cancel");
      this._buttonHover = getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("element"), this._buttonNode, this._buttonGenHoverText);
      this._disposables.add(this._buttonHover);
      this._domNode.appendChild(this._buttonNode);
      this._disposables.add(dom.addDisposableListener(this.input, dom.EventType.INPUT, () => this._onDidInputChange.fire()));
      this._disposables.add(dom.addDisposableListener(this.input, dom.EventType.KEY_DOWN, (e) => {
        const keyEvent = new StandardKeyboardEvent(e);
        if (keyEvent.keyCode === KeyCode.LeftArrow || keyEvent.keyCode === KeyCode.RightArrow) {
          this._onDidInputChange.fire();
        }
      }));
      this._disposables.add(dom.addDisposableListener(this.input, dom.EventType.CLICK, () => this._onDidInputChange.fire()));
      this._disposables.add(dom.addDisposableListener(this.input, dom.EventType.FOCUS, () => {
        this.domNode.style.outlineWidth = "1px";
        this.domNode.style.outlineStyle = "solid";
        this.domNode.style.outlineOffset = "-1px";
        this.domNode.style.outlineColor = "var(--vscode-focusBorder)";
      }));
      this._disposables.add(dom.addDisposableListener(this.input, dom.EventType.BLUR, () => {
        this.domNode.style.outline = "none";
      }));
    }
    return this._domNode;
  }
  get input() {
    assertType(this._inputNode);
    return this._inputNode;
  }
  get button() {
    assertType(this._buttonNode);
    return this._buttonNode;
  }
  get buttonState() {
    return this._buttonState;
  }
  setSparkleButton() {
    this._buttonState = "sparkle";
    this._sparkleIcon ??= renderIcon(Codicon.sparkle);
    dom.clearNode(this.button);
    this.button.appendChild(this._sparkleIcon);
    this.button.setAttribute("aria-label", "Generating new name suggestions");
    this._buttonHover?.update(this._buttonGenHoverText);
    this.input.focus();
  }
  setStopButton() {
    this._buttonState = "stop";
    this._stopIcon ??= renderIcon(Codicon.primitiveSquare);
    dom.clearNode(this.button);
    this.button.appendChild(this._stopIcon);
    this.button.setAttribute("aria-label", "Cancel generating new name suggestions");
    this._buttonHover?.update(this._buttonCancelHoverText);
    this.input.focus();
  }
  dispose() {
    this._disposables.dispose();
  }
}
class RenameCandidateView {
  static {
    __name(this, "RenameCandidateView");
  }
  static _PADDING = 2;
  _domNode;
  _icon;
  _label;
  constructor(parent, fontInfo) {
    this._domNode = document.createElement("div");
    this._domNode.className = "rename-box rename-candidate";
    this._domNode.style.display = `flex`;
    this._domNode.style.columnGap = `5px`;
    this._domNode.style.alignItems = `center`;
    this._domNode.style.height = `${fontInfo.lineHeight}px`;
    this._domNode.style.padding = `${RenameCandidateView._PADDING}px`;
    const iconContainer = document.createElement("div");
    iconContainer.style.display = `flex`;
    iconContainer.style.alignItems = `center`;
    iconContainer.style.width = iconContainer.style.height = `${fontInfo.lineHeight * 0.8}px`;
    this._domNode.appendChild(iconContainer);
    this._icon = renderIcon(Codicon.sparkle);
    this._icon.style.display = `none`;
    iconContainer.appendChild(this._icon);
    this._label = document.createElement("div");
    domFontInfo.applyFontInfo(this._label, fontInfo);
    this._domNode.appendChild(this._label);
    parent.appendChild(this._domNode);
  }
  populate(value) {
    this._updateIcon(value);
    this._updateLabel(value);
  }
  _updateIcon(value) {
    const isAIGenerated = !!value.tags?.includes(NewSymbolNameTag.AIGenerated);
    this._icon.style.display = isAIGenerated ? "inherit" : "none";
  }
  _updateLabel(value) {
    this._label.innerText = value.newSymbolName;
  }
  static getLayoutInfo({ lineHeight }) {
    const totalHeight = lineHeight + RenameCandidateView._PADDING * 2;
    return { totalHeight };
  }
  dispose() {
  }
}
export {
  CONTEXT_RENAME_INPUT_FOCUSED,
  CONTEXT_RENAME_INPUT_VISIBLE,
  RenameWidget
};
//# sourceMappingURL=renameWidget.js.map
