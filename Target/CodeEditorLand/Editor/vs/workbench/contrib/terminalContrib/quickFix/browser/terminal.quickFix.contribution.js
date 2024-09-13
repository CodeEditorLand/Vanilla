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
import "./media/terminalQuickFix.css";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize2 } from "../../../../../nls.js";
import { InstantiationType, registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ITerminalContribution, ITerminalInstance, IXtermTerminal } from "../../../terminal/browser/terminal.js";
import { registerActiveInstanceAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalWidgetManager } from "../../../terminal/browser/widgets/widgetManager.js";
import { ITerminalProcessManager } from "../../../terminal/common/terminal.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { ITerminalQuickFixService } from "./quickFix.js";
import { TerminalQuickFixAddon } from "./quickFixAddon.js";
import { freePort, gitCreatePr, gitPull, gitPushSetUpstream, gitSimilar, gitTwoDashes, pwshGeneralError, pwshUnixCommandNotFoundError } from "./terminalQuickFixBuiltinActions.js";
import { TerminalQuickFixService } from "./terminalQuickFixService.js";
registerSingleton(ITerminalQuickFixService, TerminalQuickFixService, InstantiationType.Delayed);
let TerminalQuickFixContribution = class extends DisposableStore {
  constructor(_instance, processManager, widgetManager, _instantiationService) {
    super();
    this._instance = _instance;
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "TerminalQuickFixContribution");
  }
  static ID = "quickFix";
  static get(instance) {
    return instance.getContribution(TerminalQuickFixContribution.ID);
  }
  _addon;
  get addon() {
    return this._addon;
  }
  xtermReady(xterm) {
    this._addon = this._instantiationService.createInstance(TerminalQuickFixAddon, void 0, this._instance.capabilities);
    xterm.raw.loadAddon(this._addon);
    this.add(this._addon.onDidRequestRerunCommand((e) => this._instance.runCommand(e.command, e.shouldExecute || false)));
    for (const actionOption of [
      gitTwoDashes(),
      gitPull(),
      freePort((port, command) => this._instance.freePortKillProcess(port, command)),
      gitSimilar(),
      gitPushSetUpstream(),
      gitCreatePr(),
      pwshUnixCommandNotFoundError(),
      pwshGeneralError()
    ]) {
      this._addon.registerCommandFinishedListener(actionOption);
    }
  }
};
TerminalQuickFixContribution = __decorateClass([
  __decorateParam(3, IInstantiationService)
], TerminalQuickFixContribution);
registerTerminalContribution(TerminalQuickFixContribution.ID, TerminalQuickFixContribution);
var TerminalQuickFixCommandId = /* @__PURE__ */ ((TerminalQuickFixCommandId2) => {
  TerminalQuickFixCommandId2["ShowQuickFixes"] = "workbench.action.terminal.showQuickFixes";
  return TerminalQuickFixCommandId2;
})(TerminalQuickFixCommandId || {});
registerActiveInstanceAction({
  id: "workbench.action.terminal.showQuickFixes" /* ShowQuickFixes */,
  title: localize2("workbench.action.terminal.showQuickFixes", "Show Terminal Quick Fixes"),
  precondition: TerminalContextKeys.focus,
  keybinding: {
    primary: KeyMod.CtrlCmd | KeyCode.Period,
    weight: KeybindingWeight.WorkbenchContrib
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalQuickFixContribution.get(activeInstance)?.addon?.showMenu(), "run")
});
//# sourceMappingURL=terminal.quickFix.contribution.js.map
