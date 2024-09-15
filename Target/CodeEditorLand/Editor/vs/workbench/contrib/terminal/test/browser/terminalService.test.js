var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { fail } from "assert";
import { Emitter } from "../../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { TestDialogService } from "../../../../../platform/dialogs/test/common/testDialogService.js";
import { TerminalLocation } from "../../../../../platform/terminal/common/terminal.js";
import { ITerminalInstance, ITerminalInstanceService, ITerminalService } from "../../browser/terminal.js";
import { TerminalService } from "../../browser/terminalService.js";
import { TERMINAL_CONFIG_SECTION } from "../../common/terminal.js";
import { IRemoteAgentService } from "../../../../services/remote/common/remoteAgentService.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
suite("Workbench - TerminalService", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let terminalService;
  let configurationService;
  let dialogService;
  setup(async () => {
    dialogService = new TestDialogService();
    configurationService = new TestConfigurationService({
      files: {},
      terminal: {
        integrated: {
          confirmOnKill: "never"
        }
      }
    });
    const instantiationService = workbenchInstantiationService({
      configurationService: /* @__PURE__ */ __name(() => configurationService, "configurationService")
    }, store);
    instantiationService.stub(IDialogService, dialogService);
    instantiationService.stub(ITerminalInstanceService, "getBackend", void 0);
    instantiationService.stub(ITerminalInstanceService, "getRegisteredBackends", []);
    instantiationService.stub(IRemoteAgentService, "getConnection", null);
    terminalService = store.add(instantiationService.createInstance(TerminalService));
    instantiationService.stub(ITerminalService, terminalService);
  });
  suite("safeDisposeTerminal", () => {
    let onExitEmitter;
    setup(() => {
      onExitEmitter = store.add(new Emitter());
    });
    test("should not show prompt when confirmOnKill is never", async () => {
      await setConfirmOnKill(configurationService, "never");
      await terminalService.safeDisposeTerminal({
        target: TerminalLocation.Editor,
        hasChildProcesses: true,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
      await terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: true,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
    });
    test("should not show prompt when any terminal editor is closed (handled by editor itself)", async () => {
      await setConfirmOnKill(configurationService, "editor");
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Editor,
        hasChildProcesses: true,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
      await setConfirmOnKill(configurationService, "always");
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Editor,
        hasChildProcesses: true,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
    });
    test("should not show prompt when confirmOnKill is editor and panel terminal is closed", async () => {
      await setConfirmOnKill(configurationService, "editor");
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: true,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
    });
    test("should show prompt when confirmOnKill is panel and panel terminal is closed", async () => {
      await setConfirmOnKill(configurationService, "panel");
      dialogService.setConfirmResult({ confirmed: false });
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: false,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
      dialogService.setConfirmResult({ confirmed: true });
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: false,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
      dialogService.setConfirmResult({ confirmed: false });
      await terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: true,
        dispose: /* @__PURE__ */ __name(() => fail(), "dispose")
      });
      dialogService.setConfirmResult({ confirmed: true });
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: true,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
    });
    test("should show prompt when confirmOnKill is always and panel terminal is closed", async () => {
      await setConfirmOnKill(configurationService, "always");
      dialogService.setConfirmResult({ confirmed: false });
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: false,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
      dialogService.setConfirmResult({ confirmed: true });
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: false,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
      dialogService.setConfirmResult({ confirmed: false });
      await terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: true,
        dispose: /* @__PURE__ */ __name(() => fail(), "dispose")
      });
      dialogService.setConfirmResult({ confirmed: true });
      terminalService.safeDisposeTerminal({
        target: TerminalLocation.Panel,
        hasChildProcesses: true,
        onExit: onExitEmitter.event,
        dispose: /* @__PURE__ */ __name(() => onExitEmitter.fire(void 0), "dispose")
      });
    });
  });
});
async function setConfirmOnKill(configurationService, value) {
  await configurationService.setUserConfiguration(TERMINAL_CONFIG_SECTION, { confirmOnKill: value });
  configurationService.onDidChangeConfigurationEmitter.fire({
    affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration"),
    affectedKeys: ["terminal.integrated.confirmOnKill"]
  });
}
__name(setConfirmOnKill, "setConfirmOnKill");
//# sourceMappingURL=terminalService.test.js.map
