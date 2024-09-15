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
import * as dom from "../../../../../base/browser/dom.js";
import { Event } from "../../../../../base/common/event.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../../platform/contextkey/common/contextkey.js";
import {
  IContextMenuService,
  IContextViewService
} from "../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { SimpleFindWidget } from "../../../codeEditor/browser/find/simpleFindWidget.js";
import {
  XtermTerminalConstants
} from "../../../terminal/browser/terminal.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { TerminalFindCommandId } from "../common/terminal.find.js";
import { openContextMenu } from "./textInputContextMenu.js";
const TERMINAL_FIND_WIDGET_INITIAL_WIDTH = 419;
let TerminalFindWidget = class extends SimpleFindWidget {
  constructor(_instance, _contextViewService, keybindingService, _contextKeyService, _contextMenuService, _clipboardService, hoverService, _themeService, _configurationService) {
    super(
      {
        showCommonFindToggles: true,
        checkImeCompletionState: true,
        showResultCount: true,
        initialWidth: TERMINAL_FIND_WIDGET_INITIAL_WIDTH,
        enableSash: true,
        appendCaseSensitiveActionId: TerminalFindCommandId.ToggleFindCaseSensitive,
        appendRegexActionId: TerminalFindCommandId.ToggleFindRegex,
        appendWholeWordsActionId: TerminalFindCommandId.ToggleFindWholeWord,
        previousMatchActionId: TerminalFindCommandId.FindPrevious,
        nextMatchActionId: TerminalFindCommandId.FindNext,
        closeWidgetActionId: TerminalFindCommandId.FindHide,
        type: "Terminal",
        matchesLimit: XtermTerminalConstants.SearchHighlightLimit
      },
      _contextViewService,
      _contextKeyService,
      hoverService,
      keybindingService
    );
    this._instance = _instance;
    this._contextKeyService = _contextKeyService;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._register(
      this.state.onFindReplaceStateChange(() => {
        this.show();
      })
    );
    this._findInputFocused = TerminalContextKeys.findInputFocus.bindTo(
      this._contextKeyService
    );
    this._findWidgetFocused = TerminalContextKeys.findFocus.bindTo(
      this._contextKeyService
    );
    this._findWidgetVisible = TerminalContextKeys.findVisible.bindTo(
      this._contextKeyService
    );
    const innerDom = this.getDomNode().firstChild;
    if (innerDom) {
      this._register(
        dom.addDisposableListener(innerDom, "mousedown", (event) => {
          event.stopPropagation();
        })
      );
      this._register(
        dom.addDisposableListener(innerDom, "contextmenu", (event) => {
          event.stopPropagation();
        })
      );
    }
    const findInputDomNode = this.getFindInputDomNode();
    this._register(
      dom.addDisposableListener(
        findInputDomNode,
        "contextmenu",
        (event) => {
          openContextMenu(
            dom.getWindow(findInputDomNode),
            event,
            _clipboardService,
            _contextMenuService
          );
          event.stopPropagation();
        }
      )
    );
    this._register(
      this._themeService.onDidColorThemeChange(() => {
        if (this.isVisible()) {
          this.find(true, true);
        }
      })
    );
    this._register(
      this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("workbench.colorCustomizations") && this.isVisible()) {
          this.find(true, true);
        }
      })
    );
    this.updateResultCount();
  }
  static {
    __name(this, "TerminalFindWidget");
  }
  _findInputFocused;
  _findWidgetFocused;
  _findWidgetVisible;
  _overrideCopyOnSelectionDisposable;
  find(previous, update) {
    const xterm = this._instance.xterm;
    if (!xterm) {
      return;
    }
    if (previous) {
      this._findPreviousWithEvent(xterm, this.inputValue, {
        regex: this._getRegexValue(),
        wholeWord: this._getWholeWordValue(),
        caseSensitive: this._getCaseSensitiveValue(),
        incremental: update
      });
    } else {
      this._findNextWithEvent(xterm, this.inputValue, {
        regex: this._getRegexValue(),
        wholeWord: this._getWholeWordValue(),
        caseSensitive: this._getCaseSensitiveValue()
      });
    }
  }
  reveal() {
    const initialInput = this._instance.hasSelection() && !this._instance.selection.includes("\n") ? this._instance.selection : void 0;
    const inputValue = initialInput ?? this.inputValue;
    const xterm = this._instance.xterm;
    if (xterm && inputValue && inputValue !== "") {
      this._findPreviousWithEvent(xterm, inputValue, {
        incremental: true,
        regex: this._getRegexValue(),
        wholeWord: this._getWholeWordValue(),
        caseSensitive: this._getCaseSensitiveValue()
      }).then((foundMatch) => {
        this.updateButtons(foundMatch);
        this._register(
          Event.once(xterm.onDidChangeSelection)(
            () => xterm.clearActiveSearchDecoration()
          )
        );
      });
    }
    this.updateButtons(false);
    super.reveal(inputValue);
    this._findWidgetVisible.set(true);
  }
  show() {
    const initialInput = this._instance.hasSelection() && !this._instance.selection.includes("\n") ? this._instance.selection : void 0;
    super.show(initialInput);
    this._findWidgetVisible.set(true);
  }
  hide() {
    super.hide();
    this._findWidgetVisible.reset();
    this._instance.focus(true);
    this._instance.xterm?.clearSearchDecorations();
  }
  async _getResultCount() {
    return this._instance.xterm?.findResult;
  }
  _onInputChanged() {
    const xterm = this._instance.xterm;
    if (xterm) {
      this._findPreviousWithEvent(xterm, this.inputValue, {
        regex: this._getRegexValue(),
        wholeWord: this._getWholeWordValue(),
        caseSensitive: this._getCaseSensitiveValue(),
        incremental: true
      }).then((foundMatch) => {
        this.updateButtons(foundMatch);
      });
    }
    return false;
  }
  _onFocusTrackerFocus() {
    if ("overrideCopyOnSelection" in this._instance) {
      this._overrideCopyOnSelectionDisposable = this._instance.overrideCopyOnSelection(false);
    }
    this._findWidgetFocused.set(true);
  }
  _onFocusTrackerBlur() {
    this._overrideCopyOnSelectionDisposable?.dispose();
    this._instance.xterm?.clearActiveSearchDecoration();
    this._findWidgetFocused.reset();
  }
  _onFindInputFocusTrackerFocus() {
    this._findInputFocused.set(true);
  }
  _onFindInputFocusTrackerBlur() {
    this._findInputFocused.reset();
  }
  findFirst() {
    const instance = this._instance;
    if (instance.hasSelection()) {
      instance.clearSelection();
    }
    const xterm = instance.xterm;
    if (xterm) {
      this._findPreviousWithEvent(xterm, this.inputValue, {
        regex: this._getRegexValue(),
        wholeWord: this._getWholeWordValue(),
        caseSensitive: this._getCaseSensitiveValue()
      });
    }
  }
  async _findNextWithEvent(xterm, term, options) {
    return xterm.findNext(term, options).then((foundMatch) => {
      this._register(
        Event.once(xterm.onDidChangeSelection)(
          () => xterm.clearActiveSearchDecoration()
        )
      );
      return foundMatch;
    });
  }
  async _findPreviousWithEvent(xterm, term, options) {
    return xterm.findPrevious(term, options).then((foundMatch) => {
      this._register(
        Event.once(xterm.onDidChangeSelection)(
          () => xterm.clearActiveSearchDecoration()
        )
      );
      return foundMatch;
    });
  }
};
TerminalFindWidget = __decorateClass([
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IClipboardService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IConfigurationService)
], TerminalFindWidget);
export {
  TerminalFindWidget
};
//# sourceMappingURL=terminalFindWidget.js.map
