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
import * as DOM from "../../../../../../base/browser/dom.js";
import { alert as alertFn } from "../../../../../../base/browser/ui/aria/aria.js";
import { KeyCode, KeyMod } from "../../../../../../base/common/keyCodes.js";
import { Lazy } from "../../../../../../base/common/lazy.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import * as strings from "../../../../../../base/common/strings.js";
import { MATCHES_LIMIT } from "../../../../../../editor/contrib/find/browser/findModel.js";
import { FindReplaceState } from "../../../../../../editor/contrib/find/browser/findState.js";
import {
  NLS_MATCHES_LOCATION,
  NLS_NO_RESULTS
} from "../../../../../../editor/contrib/find/browser/findWidget.js";
import { localize } from "../../../../../../nls.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../../../platform/contextkey/common/contextkey.js";
import {
  IContextMenuService,
  IContextViewService
} from "../../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED } from "../../../common/notebookContextKeys.js";
import {
  CellEditState
} from "../../notebookBrowser.js";
import { FindModel } from "./findModel.js";
import { SimpleFindReplaceWidget } from "./notebookFindReplaceWidget.js";
const FIND_HIDE_TRANSITION = "find-hide-transition";
const FIND_SHOW_TRANSITION = "find-show-transition";
let MAX_MATCHES_COUNT_WIDTH = 69;
const PROGRESS_BAR_DELAY = 200;
let NotebookFindContrib = class extends Disposable {
  constructor(notebookEditor, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.instantiationService = instantiationService;
    this.widget = new Lazy(() => this._register(this.instantiationService.createInstance(NotebookFindWidget, this.notebookEditor)));
  }
  static id = "workbench.notebook.find";
  widget;
  show(initialInput, options) {
    return this.widget.value.show(initialInput, options);
  }
  hide() {
    this.widget.rawValue?.hide();
  }
  replace(searchString) {
    return this.widget.value.replace(searchString);
  }
};
NotebookFindContrib = __decorateClass([
  __decorateParam(1, IInstantiationService)
], NotebookFindContrib);
let NotebookFindWidget = class extends SimpleFindReplaceWidget {
  _findWidgetFocused;
  _showTimeout = null;
  _hideTimeout = null;
  _previousFocusElement;
  _findModel;
  constructor(_notebookEditor, contextViewService, contextKeyService, configurationService, contextMenuService, hoverService, instantiationService) {
    super(
      contextViewService,
      contextKeyService,
      configurationService,
      contextMenuService,
      instantiationService,
      hoverService,
      new FindReplaceState(),
      _notebookEditor
    );
    this._findModel = new FindModel(
      this._notebookEditor,
      this._state,
      this._configurationService
    );
    DOM.append(this._notebookEditor.getDomNode(), this.getDomNode());
    this._findWidgetFocused = KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED.bindTo(
      contextKeyService
    );
    this._register(
      this._findInput.onKeyDown((e) => this._onFindInputKeyDown(e))
    );
    this._register(
      this._replaceInput.onKeyDown((e) => this._onReplaceInputKeyDown(e))
    );
    this._register(
      this._state.onFindReplaceStateChange((e) => {
        this.onInputChanged();
        if (e.isSearching) {
          if (this._state.isSearching) {
            this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
          } else {
            this._progressBar.stop().hide();
          }
        }
        if (this._findModel.currentMatch >= 0) {
          const currentMatch = this._findModel.getCurrentMatch();
          this._replaceBtn.setEnabled(currentMatch.isModelMatch);
        }
        const matches = this._findModel.findMatches;
        this._replaceAllBtn.setEnabled(
          matches.length > 0 && matches.find(
            (match) => match.webviewMatches.length > 0
          ) === void 0
        );
        if (e.filters) {
          this._findInput.updateFilterState(
            this._state.filters?.isModified() ?? false
          );
        }
      })
    );
    this._register(
      DOM.addDisposableListener(
        this.getDomNode(),
        DOM.EventType.FOCUS,
        (e) => {
          this._previousFocusElement = DOM.isHTMLElement(
            e.relatedTarget
          ) ? e.relatedTarget : void 0;
        },
        true
      )
    );
  }
  _onFindInputKeyDown(e) {
    if (e.equals(KeyCode.Enter)) {
      this.find(false);
      e.preventDefault();
      return;
    } else if (e.equals(KeyMod.Shift | KeyCode.Enter)) {
      this.find(true);
      e.preventDefault();
      return;
    }
  }
  _onReplaceInputKeyDown(e) {
    if (e.equals(KeyCode.Enter)) {
      this.replaceOne();
      e.preventDefault();
      return;
    }
  }
  onInputChanged() {
    this._state.change({ searchString: this.inputValue }, false);
    const findMatches = this._findModel.findMatches;
    if (findMatches && findMatches.length) {
      return true;
    }
    return false;
  }
  findIndex(index) {
    this._findModel.find({ index });
  }
  find(previous) {
    this._findModel.find({ previous });
  }
  replaceOne() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    if (!this._findModel.findMatches.length) {
      return;
    }
    this._findModel.ensureFindMatches();
    if (this._findModel.currentMatch < 0) {
      this._findModel.find({ previous: false });
    }
    const currentMatch = this._findModel.getCurrentMatch();
    const cell = currentMatch.cell;
    if (currentMatch.isModelMatch) {
      const match = currentMatch.match;
      this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
      const replacePattern = this.replacePattern;
      const replaceString = replacePattern.buildReplaceString(
        match.matches,
        this._state.preserveCase
      );
      const viewModel = this._notebookEditor.getViewModel();
      viewModel.replaceOne(cell, match.range, replaceString).then(() => {
        this._progressBar.stop();
      });
    } else {
      console.error("Replace does not work for output match");
    }
  }
  replaceAll() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
    const replacePattern = this.replacePattern;
    const cellFindMatches = this._findModel.findMatches;
    const replaceStrings = [];
    cellFindMatches.forEach((cellFindMatch) => {
      cellFindMatch.contentMatches.forEach((match) => {
        const matches = match.matches;
        replaceStrings.push(
          replacePattern.buildReplaceString(
            matches,
            this._state.preserveCase
          )
        );
      });
    });
    const viewModel = this._notebookEditor.getViewModel();
    viewModel.replaceAll(this._findModel.findMatches, replaceStrings).then(() => {
      this._progressBar.stop();
    });
  }
  findFirst() {
  }
  onFocusTrackerFocus() {
    this._findWidgetFocused.set(true);
  }
  onFocusTrackerBlur() {
    this._previousFocusElement = void 0;
    this._findWidgetFocused.reset();
  }
  onReplaceInputFocusTrackerFocus() {
  }
  onReplaceInputFocusTrackerBlur() {
  }
  onFindInputFocusTrackerFocus() {
  }
  onFindInputFocusTrackerBlur() {
  }
  async show(initialInput, options) {
    const searchStringUpdate = this._state.searchString !== initialInput;
    super.show(initialInput, options);
    this._state.change(
      {
        searchString: initialInput ?? this._state.searchString,
        isRevealed: true
      },
      false
    );
    if (typeof options?.matchIndex === "number") {
      if (!this._findModel.findMatches.length) {
        await this._findModel.research();
      }
      this.findIndex(options.matchIndex);
    } else {
      this._findInput.select();
    }
    if (!searchStringUpdate && options?.searchStringSeededFrom) {
      this._findModel.refreshCurrentMatch(options.searchStringSeededFrom);
    }
    if (this._showTimeout === null) {
      if (this._hideTimeout !== null) {
        DOM.getWindow(this.getDomNode()).clearTimeout(
          this._hideTimeout
        );
        this._hideTimeout = null;
        this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
      }
      this._notebookEditor.addClassName(FIND_SHOW_TRANSITION);
      this._showTimeout = DOM.getWindow(this.getDomNode()).setTimeout(
        () => {
          this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
          this._showTimeout = null;
        },
        200
      );
    } else {
    }
  }
  replace(initialFindInput, initialReplaceInput) {
    super.showWithReplace(initialFindInput, initialReplaceInput);
    this._state.change(
      {
        searchString: initialFindInput ?? "",
        replaceString: initialReplaceInput ?? "",
        isRevealed: true
      },
      false
    );
    this._replaceInput.select();
    if (this._showTimeout === null) {
      if (this._hideTimeout !== null) {
        DOM.getWindow(this.getDomNode()).clearTimeout(
          this._hideTimeout
        );
        this._hideTimeout = null;
        this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
      }
      this._notebookEditor.addClassName(FIND_SHOW_TRANSITION);
      this._showTimeout = DOM.getWindow(this.getDomNode()).setTimeout(
        () => {
          this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
          this._showTimeout = null;
        },
        200
      );
    } else {
    }
  }
  hide() {
    super.hide();
    this._state.change({ isRevealed: false }, false);
    this._findModel.clear();
    this._notebookEditor.findStop();
    this._progressBar.stop();
    if (this._hideTimeout === null) {
      if (this._showTimeout !== null) {
        DOM.getWindow(this.getDomNode()).clearTimeout(
          this._showTimeout
        );
        this._showTimeout = null;
        this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
      }
      this._notebookEditor.addClassName(FIND_HIDE_TRANSITION);
      this._hideTimeout = DOM.getWindow(this.getDomNode()).setTimeout(
        () => {
          this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
        },
        200
      );
    } else {
    }
    if (this._previousFocusElement && this._previousFocusElement.offsetParent) {
      this._previousFocusElement.focus();
      this._previousFocusElement = void 0;
    }
    if (this._notebookEditor.hasModel()) {
      for (let i = 0; i < this._notebookEditor.getLength(); i++) {
        const cell = this._notebookEditor.cellAt(i);
        if (cell.getEditState() === CellEditState.Editing && cell.editStateSource === "find") {
          cell.updateEditState(CellEditState.Preview, "closeFind");
        }
      }
    }
  }
  _updateMatchesCount() {
    if (!this._findModel || !this._findModel.findMatches) {
      return;
    }
    this._matchesCount.style.width = MAX_MATCHES_COUNT_WIDTH + "px";
    this._matchesCount.title = "";
    this._matchesCount.firstChild?.remove();
    let label;
    if (this._state.matchesCount > 0) {
      let matchesCount = String(this._state.matchesCount);
      if (this._state.matchesCount >= MATCHES_LIMIT) {
        matchesCount += "+";
      }
      const matchesPosition = this._findModel.currentMatch < 0 ? "?" : String(this._findModel.currentMatch + 1);
      label = strings.format(
        NLS_MATCHES_LOCATION,
        matchesPosition,
        matchesCount
      );
    } else {
      label = NLS_NO_RESULTS;
    }
    this._matchesCount.appendChild(document.createTextNode(label));
    alertFn(
      this._getAriaLabel(
        label,
        this._state.currentMatch,
        this._state.searchString
      )
    );
    MAX_MATCHES_COUNT_WIDTH = Math.max(
      MAX_MATCHES_COUNT_WIDTH,
      this._matchesCount.clientWidth
    );
  }
  _getAriaLabel(label, currentMatch, searchString) {
    if (label === NLS_NO_RESULTS) {
      return searchString === "" ? localize("ariaSearchNoResultEmpty", "{0} found", label) : localize(
        "ariaSearchNoResult",
        "{0} found for '{1}'",
        label,
        searchString
      );
    }
    return localize(
      "ariaSearchNoResultWithLineNumNoCurrentMatch",
      "{0} found for '{1}'",
      label,
      searchString
    );
  }
  dispose() {
    this._notebookEditor?.removeClassName(FIND_SHOW_TRANSITION);
    this._notebookEditor?.removeClassName(FIND_HIDE_TRANSITION);
    this._findModel.dispose();
    super.dispose();
  }
};
NotebookFindWidget = __decorateClass([
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IInstantiationService)
], NotebookFindWidget);
export {
  NotebookFindContrib
};
