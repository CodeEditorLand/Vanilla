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
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize2 } from "../../../../../nls.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { findInFilesCommand } from "../../../search/browser/searchActionsFind.js";
import {
  isDetachedTerminalInstance,
  ITerminalService
} from "../../../terminal/browser/terminal.js";
import {
  registerActiveInstanceAction,
  registerActiveXtermAction
} from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { TerminalFindCommandId } from "../common/terminal.find.js";
import { TerminalFindWidget } from "./terminalFindWidget.js";
import "./media/terminalFind.css";
let TerminalFindContribution = class extends Disposable {
  constructor(_instance, processManager, widgetManager, instantiationService, terminalService) {
    super();
    this._instance = _instance;
    this._findWidget = new Lazy(() => {
      const findWidget = instantiationService.createInstance(
        TerminalFindWidget,
        this._instance
      );
      findWidget.focusTracker.onDidFocus(() => {
        TerminalFindContribution.activeFindWidget = this;
        this._instance.forceScrollbarVisibility();
        if (!isDetachedTerminalInstance(this._instance)) {
          terminalService.setActiveInstance(this._instance);
        }
      });
      findWidget.focusTracker.onDidBlur(() => {
        TerminalFindContribution.activeFindWidget = void 0;
        this._instance.resetScrollbarVisibility();
      });
      if (!this._instance.domElement) {
        throw new Error(
          "FindWidget expected terminal DOM to be initialized"
        );
      }
      this._instance.domElement?.appendChild(findWidget.getDomNode());
      if (this._lastLayoutDimensions) {
        findWidget.layout(this._lastLayoutDimensions.width);
      }
      return findWidget;
    });
  }
  static ID = "terminal.find";
  /**
   * Currently focused find widget. This is used to track action context since
   * 'active terminals' are only tracked for non-detached terminal instanecs.
   */
  static activeFindWidget;
  static get(instance) {
    return instance.getContribution(
      TerminalFindContribution.ID
    );
  }
  _findWidget;
  _lastLayoutDimensions;
  get findWidget() {
    return this._findWidget.value;
  }
  layout(_xterm, dimension) {
    this._lastLayoutDimensions = dimension;
    this._findWidget.rawValue?.layout(dimension.width);
  }
  xtermReady(xterm) {
    this._register(
      xterm.onDidChangeFindResults(
        () => this._findWidget.rawValue?.updateResultCount()
      )
    );
  }
  dispose() {
    if (TerminalFindContribution.activeFindWidget === this) {
      TerminalFindContribution.activeFindWidget = void 0;
    }
    super.dispose();
    this._findWidget.rawValue?.dispose();
  }
};
TerminalFindContribution = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITerminalService)
], TerminalFindContribution);
registerTerminalContribution(
  TerminalFindContribution.ID,
  TerminalFindContribution,
  true
);
registerActiveXtermAction({
  id: TerminalFindCommandId.FindFocus,
  title: localize2("workbench.action.terminal.focusFind", "Focus Find"),
  keybinding: {
    primary: KeyMod.CtrlCmd | KeyCode.KeyF,
    when: ContextKeyExpr.or(
      TerminalContextKeys.findFocus,
      TerminalContextKeys.focusInAny
    ),
    weight: KeybindingWeight.WorkbenchContrib
  },
  precondition: ContextKeyExpr.or(
    TerminalContextKeys.processSupported,
    TerminalContextKeys.terminalHasBeenCreated
  ),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    contr?.findWidget.reveal();
  }
});
registerActiveXtermAction({
  id: TerminalFindCommandId.FindHide,
  title: localize2("workbench.action.terminal.hideFind", "Hide Find"),
  keybinding: {
    primary: KeyCode.Escape,
    secondary: [KeyMod.Shift | KeyCode.Escape],
    when: ContextKeyExpr.and(
      TerminalContextKeys.focusInAny,
      TerminalContextKeys.findVisible
    ),
    weight: KeybindingWeight.WorkbenchContrib
  },
  precondition: ContextKeyExpr.or(
    TerminalContextKeys.processSupported,
    TerminalContextKeys.terminalHasBeenCreated
  ),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    contr?.findWidget.hide();
  }
});
registerActiveXtermAction({
  id: TerminalFindCommandId.ToggleFindRegex,
  title: localize2(
    "workbench.action.terminal.toggleFindRegex",
    "Toggle Find Using Regex"
  ),
  keybinding: {
    primary: KeyMod.Alt | KeyCode.KeyR,
    mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyR },
    when: TerminalContextKeys.findVisible,
    weight: KeybindingWeight.WorkbenchContrib
  },
  precondition: ContextKeyExpr.or(
    TerminalContextKeys.processSupported,
    TerminalContextKeys.terminalHasBeenCreated
  ),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const state = contr?.findWidget.state;
    state?.change({ isRegex: !state.isRegex }, false);
  }
});
registerActiveXtermAction({
  id: TerminalFindCommandId.ToggleFindWholeWord,
  title: localize2(
    "workbench.action.terminal.toggleFindWholeWord",
    "Toggle Find Using Whole Word"
  ),
  keybinding: {
    primary: KeyMod.Alt | KeyCode.KeyW,
    mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyW },
    when: TerminalContextKeys.findVisible,
    weight: KeybindingWeight.WorkbenchContrib
  },
  precondition: ContextKeyExpr.or(
    TerminalContextKeys.processSupported,
    TerminalContextKeys.terminalHasBeenCreated
  ),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const state = contr?.findWidget.state;
    state?.change({ wholeWord: !state.wholeWord }, false);
  }
});
registerActiveXtermAction({
  id: TerminalFindCommandId.ToggleFindCaseSensitive,
  title: localize2(
    "workbench.action.terminal.toggleFindCaseSensitive",
    "Toggle Find Using Case Sensitive"
  ),
  keybinding: {
    primary: KeyMod.Alt | KeyCode.KeyC,
    mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyC },
    when: TerminalContextKeys.findVisible,
    weight: KeybindingWeight.WorkbenchContrib
  },
  precondition: ContextKeyExpr.or(
    TerminalContextKeys.processSupported,
    TerminalContextKeys.terminalHasBeenCreated
  ),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const state = contr?.findWidget.state;
    state?.change({ matchCase: !state.matchCase }, false);
  }
});
registerActiveXtermAction({
  id: TerminalFindCommandId.FindNext,
  title: localize2("workbench.action.terminal.findNext", "Find Next"),
  keybinding: [
    {
      primary: KeyCode.F3,
      mac: {
        primary: KeyMod.CtrlCmd | KeyCode.KeyG,
        secondary: [KeyCode.F3]
      },
      when: ContextKeyExpr.or(
        TerminalContextKeys.focusInAny,
        TerminalContextKeys.findFocus
      ),
      weight: KeybindingWeight.WorkbenchContrib
    },
    {
      primary: KeyMod.Shift | KeyCode.Enter,
      when: TerminalContextKeys.findInputFocus,
      weight: KeybindingWeight.WorkbenchContrib
    }
  ],
  precondition: ContextKeyExpr.or(
    TerminalContextKeys.processSupported,
    TerminalContextKeys.terminalHasBeenCreated
  ),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const widget = contr?.findWidget;
    if (widget) {
      widget.show();
      widget.find(false);
    }
  }
});
registerActiveXtermAction({
  id: TerminalFindCommandId.FindPrevious,
  title: localize2("workbench.action.terminal.findPrevious", "Find Previous"),
  keybinding: [
    {
      primary: KeyMod.Shift | KeyCode.F3,
      mac: {
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyG,
        secondary: [KeyMod.Shift | KeyCode.F3]
      },
      when: ContextKeyExpr.or(
        TerminalContextKeys.focusInAny,
        TerminalContextKeys.findFocus
      ),
      weight: KeybindingWeight.WorkbenchContrib
    },
    {
      primary: KeyCode.Enter,
      when: TerminalContextKeys.findInputFocus,
      weight: KeybindingWeight.WorkbenchContrib
    }
  ],
  precondition: ContextKeyExpr.or(
    TerminalContextKeys.processSupported,
    TerminalContextKeys.terminalHasBeenCreated
  ),
  run: (_xterm, _accessor, activeInstance) => {
    const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
    const widget = contr?.findWidget;
    if (widget) {
      widget.show();
      widget.find(true);
    }
  }
});
registerActiveInstanceAction({
  id: TerminalFindCommandId.SearchWorkspace,
  title: localize2(
    "workbench.action.terminal.searchWorkspace",
    "Search Workspace"
  ),
  keybinding: [
    {
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyF,
      when: ContextKeyExpr.and(
        TerminalContextKeys.processSupported,
        TerminalContextKeys.focus,
        TerminalContextKeys.textSelected
      ),
      weight: KeybindingWeight.WorkbenchContrib + 50
    }
  ],
  run: (activeInstance, c, accessor) => findInFilesCommand(accessor, { query: activeInstance.selection })
});
