var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual, strictEqual } from "assert";
import { Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { TerminalCapability } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalCapabilityStore } from "../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { ITerminalChildProcess, ITerminalProfile } from "../../../../../platform/terminal/common/terminal.js";
import { IWorkspaceFolder } from "../../../../../platform/workspace/common/workspace.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { ITerminalConfigurationService, ITerminalInstance, ITerminalInstanceService } from "../../browser/terminal.js";
import { TerminalConfigurationService } from "../../browser/terminalConfigurationService.js";
import { parseExitResult, TerminalInstance, TerminalLabelComputer } from "../../browser/terminalInstance.js";
import { IEnvironmentVariableService } from "../../common/environmentVariable.js";
import { EnvironmentVariableService } from "../../common/environmentVariableService.js";
import { ITerminalProfileResolverService, ProcessState } from "../../common/terminal.js";
import { TestViewDescriptorService } from "./xterm/xtermTerminal.test.js";
import { fixPath } from "../../../../services/search/test/browser/queryBuilder.test.js";
import { TestTerminalProfileResolverService, workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
const root1 = "/foo/root1";
const ROOT_1 = fixPath(root1);
const root2 = "/foo/root2";
const ROOT_2 = fixPath(root2);
class MockTerminalProfileResolverService extends TestTerminalProfileResolverService {
  static {
    __name(this, "MockTerminalProfileResolverService");
  }
  async getDefaultProfile() {
    return {
      profileName: "my-sh",
      path: "/usr/bin/zsh",
      env: {
        TEST: "TEST"
      },
      isDefault: true,
      isUnsafePath: false,
      isFromPath: true,
      icon: {
        id: "terminal-linux"
      },
      color: "terminal.ansiYellow"
    };
  }
}
const terminalShellTypeContextKey = {
  set: /* @__PURE__ */ __name(() => {
  }, "set"),
  reset: /* @__PURE__ */ __name(() => {
  }, "reset"),
  get: /* @__PURE__ */ __name(() => void 0, "get")
};
const terminalInRunCommandPicker = {
  set: /* @__PURE__ */ __name(() => {
  }, "set"),
  reset: /* @__PURE__ */ __name(() => {
  }, "reset"),
  get: /* @__PURE__ */ __name(() => void 0, "get")
};
class TestTerminalChildProcess extends Disposable {
  constructor(shouldPersist) {
    super();
    this.shouldPersist = shouldPersist;
  }
  static {
    __name(this, "TestTerminalChildProcess");
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
class TestTerminalInstanceService extends Disposable {
  static {
    __name(this, "TestTerminalInstanceService");
  }
  getBackend() {
    return {
      onPtyHostExit: Event.None,
      onPtyHostUnresponsive: Event.None,
      onPtyHostResponsive: Event.None,
      onPtyHostRestart: Event.None,
      onDidMoveWindowInstance: Event.None,
      onDidRequestDetach: Event.None,
      createProcess: /* @__PURE__ */ __name((shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, windowsEnableConpty, shouldPersist) => this._register(new TestTerminalChildProcess(shouldPersist)), "createProcess"),
      getLatency: /* @__PURE__ */ __name(() => Promise.resolve([]), "getLatency")
    };
  }
}
suite("Workbench - TerminalInstance", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  suite("TerminalInstance", () => {
    let terminalInstance;
    test("should create an instance of TerminalInstance with env from default profile", async () => {
      const instantiationService = workbenchInstantiationService({
        configurationService: /* @__PURE__ */ __name(() => new TestConfigurationService({
          files: {},
          terminal: {
            integrated: {
              fontFamily: "monospace",
              scrollback: 1e3,
              fastScrollSensitivity: 2,
              mouseWheelScrollSensitivity: 1,
              unicodeVersion: "6",
              shellIntegration: {
                enabled: true
              }
            }
          }
        }), "configurationService")
      }, store);
      instantiationService.set(ITerminalProfileResolverService, new MockTerminalProfileResolverService());
      instantiationService.stub(IViewDescriptorService, new TestViewDescriptorService());
      instantiationService.stub(IEnvironmentVariableService, store.add(instantiationService.createInstance(EnvironmentVariableService)));
      instantiationService.stub(ITerminalInstanceService, store.add(new TestTerminalInstanceService()));
      terminalInstance = store.add(instantiationService.createInstance(TerminalInstance, terminalShellTypeContextKey, terminalInRunCommandPicker, {}));
      await new Promise((resolve) => setTimeout(resolve, 100));
      deepStrictEqual(terminalInstance.shellLaunchConfig.env, { TEST: "TEST" });
    });
  });
  suite("parseExitResult", () => {
    test("should return no message for exit code = undefined", () => {
      deepStrictEqual(
        parseExitResult(void 0, {}, ProcessState.KilledDuringLaunch, void 0),
        { code: void 0, message: void 0 }
      );
      deepStrictEqual(
        parseExitResult(void 0, {}, ProcessState.KilledByUser, void 0),
        { code: void 0, message: void 0 }
      );
      deepStrictEqual(
        parseExitResult(void 0, {}, ProcessState.KilledByProcess, void 0),
        { code: void 0, message: void 0 }
      );
    });
    test("should return no message for exit code = 0", () => {
      deepStrictEqual(
        parseExitResult(0, {}, ProcessState.KilledDuringLaunch, void 0),
        { code: 0, message: void 0 }
      );
      deepStrictEqual(
        parseExitResult(0, {}, ProcessState.KilledByUser, void 0),
        { code: 0, message: void 0 }
      );
      deepStrictEqual(
        parseExitResult(0, {}, ProcessState.KilledDuringLaunch, void 0),
        { code: 0, message: void 0 }
      );
    });
    test("should return friendly message when executable is specified for non-zero exit codes", () => {
      deepStrictEqual(
        parseExitResult(1, { executable: "foo" }, ProcessState.KilledDuringLaunch, void 0),
        { code: 1, message: 'The terminal process "foo" failed to launch (exit code: 1).' }
      );
      deepStrictEqual(
        parseExitResult(1, { executable: "foo" }, ProcessState.KilledByUser, void 0),
        { code: 1, message: 'The terminal process "foo" terminated with exit code: 1.' }
      );
      deepStrictEqual(
        parseExitResult(1, { executable: "foo" }, ProcessState.KilledByProcess, void 0),
        { code: 1, message: 'The terminal process "foo" terminated with exit code: 1.' }
      );
    });
    test("should return friendly message when executable and args are specified for non-zero exit codes", () => {
      deepStrictEqual(
        parseExitResult(1, { executable: "foo", args: ["bar", "baz"] }, ProcessState.KilledDuringLaunch, void 0),
        { code: 1, message: `The terminal process "foo 'bar', 'baz'" failed to launch (exit code: 1).` }
      );
      deepStrictEqual(
        parseExitResult(1, { executable: "foo", args: ["bar", "baz"] }, ProcessState.KilledByUser, void 0),
        { code: 1, message: `The terminal process "foo 'bar', 'baz'" terminated with exit code: 1.` }
      );
      deepStrictEqual(
        parseExitResult(1, { executable: "foo", args: ["bar", "baz"] }, ProcessState.KilledByProcess, void 0),
        { code: 1, message: `The terminal process "foo 'bar', 'baz'" terminated with exit code: 1.` }
      );
    });
    test("should return friendly message when executable and arguments are omitted for non-zero exit codes", () => {
      deepStrictEqual(
        parseExitResult(1, {}, ProcessState.KilledDuringLaunch, void 0),
        { code: 1, message: `The terminal process failed to launch (exit code: 1).` }
      );
      deepStrictEqual(
        parseExitResult(1, {}, ProcessState.KilledByUser, void 0),
        { code: 1, message: `The terminal process terminated with exit code: 1.` }
      );
      deepStrictEqual(
        parseExitResult(1, {}, ProcessState.KilledByProcess, void 0),
        { code: 1, message: `The terminal process terminated with exit code: 1.` }
      );
    });
    test("should ignore pty host-related errors", () => {
      deepStrictEqual(
        parseExitResult({ message: "Could not find pty with id 16" }, {}, ProcessState.KilledDuringLaunch, void 0),
        { code: void 0, message: void 0 }
      );
    });
    test("should format conpty failure code 5", () => {
      deepStrictEqual(
        parseExitResult({ code: 5, message: "A native exception occurred during launch (Cannot create process, error code: 5)" }, { executable: "foo" }, ProcessState.KilledDuringLaunch, void 0),
        { code: 5, message: `The terminal process failed to launch: Access was denied to the path containing your executable "foo". Manage and change your permissions to get this to work.` }
      );
    });
    test("should format conpty failure code 267", () => {
      deepStrictEqual(
        parseExitResult({ code: 267, message: "A native exception occurred during launch (Cannot create process, error code: 267)" }, {}, ProcessState.KilledDuringLaunch, "/foo"),
        { code: 267, message: `The terminal process failed to launch: Invalid starting directory "/foo", review your terminal.integrated.cwd setting.` }
      );
    });
    test("should format conpty failure code 1260", () => {
      deepStrictEqual(
        parseExitResult({ code: 1260, message: "A native exception occurred during launch (Cannot create process, error code: 1260)" }, { executable: "foo" }, ProcessState.KilledDuringLaunch, void 0),
        { code: 1260, message: `The terminal process failed to launch: Windows cannot open this program because it has been prevented by a software restriction policy. For more information, open Event Viewer or contact your system Administrator.` }
      );
    });
    test("should format generic failures", () => {
      deepStrictEqual(
        parseExitResult({ code: 123, message: "A native exception occurred during launch (Cannot create process, error code: 123)" }, {}, ProcessState.KilledDuringLaunch, void 0),
        { code: 123, message: `The terminal process failed to launch: A native exception occurred during launch (Cannot create process, error code: 123).` }
      );
      deepStrictEqual(
        parseExitResult({ code: 123, message: "foo" }, {}, ProcessState.KilledDuringLaunch, void 0),
        { code: 123, message: `The terminal process failed to launch: foo.` }
      );
    });
  });
  suite("TerminalLabelComputer", () => {
    let instantiationService;
    let capabilities;
    function createInstance(partial) {
      const capabilities2 = store.add(new TerminalCapabilityStore());
      if (!isWindows) {
        capabilities2.add(TerminalCapability.NaiveCwdDetection, null);
      }
      return {
        shellLaunchConfig: {},
        cwd: "cwd",
        initialCwd: void 0,
        processName: "",
        sequence: void 0,
        workspaceFolder: void 0,
        staticTitle: void 0,
        capabilities: capabilities2,
        title: "",
        description: "",
        userHome: void 0,
        ...partial
      };
    }
    __name(createInstance, "createInstance");
    setup(async () => {
      instantiationService = workbenchInstantiationService(void 0, store);
      capabilities = store.add(new TerminalCapabilityStore());
      if (!isWindows) {
        capabilities.add(TerminalCapability.NaiveCwdDetection, null);
      }
    });
    function createLabelComputer(configuration) {
      instantiationService.set(IConfigurationService, new TestConfigurationService(configuration));
      instantiationService.set(ITerminalConfigurationService, store.add(instantiationService.createInstance(TerminalConfigurationService)));
      return store.add(instantiationService.createInstance(TerminalLabelComputer));
    }
    __name(createLabelComputer, "createLabelComputer");
    test('should resolve to "" when the template variables are empty', () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " - ", title: "", description: "" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "" }));
      strictEqual(terminalLabelComputer.title, "");
      strictEqual(terminalLabelComputer.description, "");
    });
    test("should resolve cwd", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " - ", title: "${cwd}", description: "${cwd}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, cwd: ROOT_1 }));
      strictEqual(terminalLabelComputer.title, ROOT_1);
      strictEqual(terminalLabelComputer.description, ROOT_1);
    });
    test("should resolve workspaceFolder", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " - ", title: "${workspaceFolder}", description: "${workspaceFolder}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "zsh", workspaceFolder: { uri: URI.from({ scheme: Schemas.file, path: "folder" }) } }));
      strictEqual(terminalLabelComputer.title, "folder");
      strictEqual(terminalLabelComputer.description, "folder");
    });
    test("should resolve local", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " - ", title: "${local}", description: "${local}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "zsh", shellLaunchConfig: { type: "Local" } }));
      strictEqual(terminalLabelComputer.title, "Local");
      strictEqual(terminalLabelComputer.description, "Local");
    });
    test("should resolve process", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " - ", title: "${process}", description: "${process}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "zsh" }));
      strictEqual(terminalLabelComputer.title, "zsh");
      strictEqual(terminalLabelComputer.description, "zsh");
    });
    test("should resolve sequence", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " - ", title: "${sequence}", description: "${sequence}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, sequence: "sequence" }));
      strictEqual(terminalLabelComputer.title, "sequence");
      strictEqual(terminalLabelComputer.description, "sequence");
    });
    test("should resolve task", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " ~ ", title: "${process}${separator}${task}", description: "${task}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "zsh", shellLaunchConfig: { type: "Task" } }));
      strictEqual(terminalLabelComputer.title, "zsh ~ Task");
      strictEqual(terminalLabelComputer.description, "Task");
    });
    test("should resolve separator", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " ~ ", title: "${separator}", description: "${separator}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "zsh", shellLaunchConfig: { type: "Task" } }));
      strictEqual(terminalLabelComputer.title, "zsh");
      strictEqual(terminalLabelComputer.description, "");
    });
    test("should always return static title when specified", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " ~ ", title: "${process}", description: "${workspaceFolder}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "process", workspaceFolder: { uri: URI.from({ scheme: Schemas.file, path: "folder" }) }, staticTitle: "my-title" }));
      strictEqual(terminalLabelComputer.title, "my-title");
      strictEqual(terminalLabelComputer.description, "folder");
    });
    test("should provide cwdFolder for all cwds only when in multi-root", () => {
      const terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " ~ ", title: "${process}${separator}${cwdFolder}", description: "${cwdFolder}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "process", workspaceFolder: { uri: URI.from({ scheme: Schemas.file, path: ROOT_1 }) }, cwd: ROOT_1 }));
      strictEqual(terminalLabelComputer.title, "process");
      strictEqual(terminalLabelComputer.description, "");
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "process", workspaceFolder: { uri: URI.from({ scheme: Schemas.file, path: ROOT_1 }) }, cwd: ROOT_2 }));
      if (isWindows) {
        strictEqual(terminalLabelComputer.title, "process");
        strictEqual(terminalLabelComputer.description, "");
      } else {
        strictEqual(terminalLabelComputer.title, "process ~ root2");
        strictEqual(terminalLabelComputer.description, "root2");
      }
    });
    test("should hide cwdFolder in single folder workspaces when cwd matches the workspace's default cwd even when slashes differ", async () => {
      let terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " ~ ", title: "${process}${separator}${cwdFolder}", description: "${cwdFolder}" } } } });
      terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "process", workspaceFolder: { uri: URI.from({ scheme: Schemas.file, path: ROOT_1 }) }, cwd: ROOT_1 }));
      strictEqual(terminalLabelComputer.title, "process");
      strictEqual(terminalLabelComputer.description, "");
      if (!isWindows) {
        terminalLabelComputer = createLabelComputer({ terminal: { integrated: { tabs: { separator: " ~ ", title: "${process}${separator}${cwdFolder}", description: "${cwdFolder}" } } } });
        terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: "process", workspaceFolder: { uri: URI.from({ scheme: Schemas.file, path: ROOT_1 }) }, cwd: ROOT_2 }));
        strictEqual(terminalLabelComputer.title, "process ~ root2");
        strictEqual(terminalLabelComputer.description, "root2");
      }
    });
  });
});
//# sourceMappingURL=terminalInstance.test.js.map
