import { strictEqual } from "assert";
import { Event } from "../../../../../base/common/event.js";
import { Schemas } from "../../../../../base/common/network.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
import { ITerminalInstanceService } from "../../browser/terminal.js";
import { TerminalProcessManager } from "../../browser/terminalProcessManager.js";
class TestTerminalChildProcess {
  constructor(shouldPersist) {
    this.shouldPersist = shouldPersist;
  }
  id = 0;
  get capabilities() {
    return [];
  }
  updateProperty(property, value) {
    throw new Error("Method not implemented.");
  }
  onProcessOverrideDimensions;
  onProcessResolvedShellLaunchConfig;
  onDidChangeHasChildProcesses;
  onDidChangeProperty = Event.None;
  onProcessData = Event.None;
  onProcessExit = Event.None;
  onProcessReady = Event.None;
  onProcessTitleChanged = Event.None;
  onProcessShellTypeChanged = Event.None;
  async start() {
    return void 0;
  }
  shutdown(immediate) {
  }
  input(data) {
  }
  resize(cols, rows) {
  }
  clearBuffer() {
  }
  acknowledgeDataEvent(charCount) {
  }
  async setUnicodeVersion(version) {
  }
  async getInitialCwd() {
    return "";
  }
  async getCwd() {
    return "";
  }
  async processBinary(data) {
  }
  refreshProperty(property) {
    return Promise.resolve("");
  }
}
class TestTerminalInstanceService {
  getBackend() {
    return {
      onPtyHostExit: Event.None,
      onPtyHostUnresponsive: Event.None,
      onPtyHostResponsive: Event.None,
      onPtyHostRestart: Event.None,
      onDidMoveWindowInstance: Event.None,
      onDidRequestDetach: Event.None,
      createProcess: (shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, windowsEnableConpty, shouldPersist) => new TestTerminalChildProcess(shouldPersist),
      getLatency: () => Promise.resolve([])
    };
  }
}
suite("Workbench - TerminalProcessManager", () => {
  let manager;
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  setup(async () => {
    const instantiationService = workbenchInstantiationService(
      void 0,
      store
    );
    const configurationService = instantiationService.get(
      IConfigurationService
    );
    await configurationService.setUserConfiguration("editor", {
      fontFamily: "foo"
    });
    await configurationService.setUserConfiguration("terminal", {
      integrated: {
        fontFamily: "bar",
        enablePersistentSessions: true,
        shellIntegration: {
          enabled: false
        }
      }
    });
    configurationService.onDidChangeConfigurationEmitter.fire({
      affectsConfiguration: () => true
    });
    instantiationService.stub(
      ITerminalInstanceService,
      new TestTerminalInstanceService()
    );
    manager = store.add(
      instantiationService.createInstance(
        TerminalProcessManager,
        1,
        void 0,
        void 0,
        void 0
      )
    );
  });
  suite("process persistence", () => {
    suite("local", () => {
      test("regular terminal should persist", async () => {
        const p = await manager.createProcess({}, 1, 1, false);
        strictEqual(p, void 0);
        strictEqual(manager.shouldPersist, true);
      });
      test("task terminal should not persist", async () => {
        const p = await manager.createProcess(
          {
            isFeatureTerminal: true
          },
          1,
          1,
          false
        );
        strictEqual(p, void 0);
        strictEqual(manager.shouldPersist, false);
      });
    });
    suite("remote", () => {
      const remoteCwd = URI.from({
        scheme: Schemas.vscodeRemote,
        path: "test/cwd"
      });
      test("regular terminal should persist", async () => {
        const p = await manager.createProcess(
          {
            cwd: remoteCwd
          },
          1,
          1,
          false
        );
        strictEqual(p, void 0);
        strictEqual(manager.shouldPersist, true);
      });
      test("task terminal should not persist", async () => {
        const p = await manager.createProcess(
          {
            isFeatureTerminal: true,
            cwd: remoteCwd
          },
          1,
          1,
          false
        );
        strictEqual(p, void 0);
        strictEqual(manager.shouldPersist, false);
      });
    });
  });
});
