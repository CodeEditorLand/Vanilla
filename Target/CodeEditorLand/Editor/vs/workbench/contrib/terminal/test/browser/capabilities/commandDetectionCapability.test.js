var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual, ok } from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { ITerminalCommand } from "../../../../../../platform/terminal/common/capabilities/capabilities.js";
import { CommandDetectionCapability } from "../../../../../../platform/terminal/common/capabilities/commandDetectionCapability.js";
import { writeP } from "../../../browser/terminalTestHelpers.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
class TestCommandDetectionCapability extends CommandDetectionCapability {
  static {
    __name(this, "TestCommandDetectionCapability");
  }
  clearCommands() {
    this._commands.length = 0;
  }
}
suite("CommandDetectionCapability", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let xterm;
  let capability;
  let addEvents;
  function assertCommands(expectedCommands) {
    deepStrictEqual(capability.commands.map((e) => e.command), expectedCommands.map((e) => e.command));
    deepStrictEqual(capability.commands.map((e) => e.cwd), expectedCommands.map((e) => e.cwd));
    deepStrictEqual(capability.commands.map((e) => e.exitCode), expectedCommands.map((e) => e.exitCode));
    deepStrictEqual(capability.commands.map((e) => e.marker?.line), expectedCommands.map((e) => e.marker?.line));
    for (const command of capability.commands) {
      ok(Math.abs(Date.now() - command.timestamp) < 2e3);
    }
    deepStrictEqual(addEvents, capability.commands);
    addEvents.length = 0;
    capability.clearCommands();
  }
  __name(assertCommands, "assertCommands");
  async function printStandardCommand(prompt, command, output, cwd, exitCode) {
    if (cwd !== void 0) {
      capability.setCwd(cwd);
    }
    capability.handlePromptStart();
    await writeP(xterm, `\r${prompt}`);
    capability.handleCommandStart();
    await writeP(xterm, command);
    capability.handleCommandExecuted();
    await writeP(xterm, `\r
${output}\r
`);
    capability.handleCommandFinished(exitCode);
  }
  __name(printStandardCommand, "printStandardCommand");
  async function printCommandStart(prompt) {
    capability.handlePromptStart();
    await writeP(xterm, `\r${prompt}`);
    capability.handleCommandStart();
  }
  __name(printCommandStart, "printCommandStart");
  setup(async () => {
    const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 80 }));
    const instantiationService = workbenchInstantiationService(void 0, store);
    capability = store.add(instantiationService.createInstance(TestCommandDetectionCapability, xterm));
    addEvents = [];
    store.add(capability.onCommandFinished((e) => addEvents.push(e)));
    assertCommands([]);
  });
  test("should not add commands when no capability methods are triggered", async () => {
    await writeP(xterm, "foo\r\nbar\r\n");
    assertCommands([]);
    await writeP(xterm, "baz\r\n");
    assertCommands([]);
  });
  test("should add commands for expected capability method calls", async () => {
    await printStandardCommand("$ ", "echo foo", "foo", void 0, 0);
    await printCommandStart("$ ");
    assertCommands([{
      command: "echo foo",
      exitCode: 0,
      cwd: void 0,
      marker: { line: 0 }
    }]);
  });
  test("should trim the command when command executed appears on the following line", async () => {
    await printStandardCommand("$ ", "echo foo\r\n", "foo", void 0, 0);
    await printCommandStart("$ ");
    assertCommands([{
      command: "echo foo",
      exitCode: 0,
      cwd: void 0,
      marker: { line: 0 }
    }]);
  });
  suite("cwd", () => {
    test("should add cwd to commands when it's set", async () => {
      await printStandardCommand("$ ", "echo foo", "foo", "/home", 0);
      await printStandardCommand("$ ", "echo bar", "bar", "/home/second", 0);
      await printCommandStart("$ ");
      assertCommands([
        { command: "echo foo", exitCode: 0, cwd: "/home", marker: { line: 0 } },
        { command: "echo bar", exitCode: 0, cwd: "/home/second", marker: { line: 2 } }
      ]);
    });
    test("should add old cwd to commands if no cwd sequence is output", async () => {
      await printStandardCommand("$ ", "echo foo", "foo", "/home", 0);
      await printStandardCommand("$ ", "echo bar", "bar", void 0, 0);
      await printCommandStart("$ ");
      assertCommands([
        { command: "echo foo", exitCode: 0, cwd: "/home", marker: { line: 0 } },
        { command: "echo bar", exitCode: 0, cwd: "/home", marker: { line: 2 } }
      ]);
    });
    test("should use an undefined cwd if it's not set initially", async () => {
      await printStandardCommand("$ ", "echo foo", "foo", void 0, 0);
      await printStandardCommand("$ ", "echo bar", "bar", "/home", 0);
      await printCommandStart("$ ");
      assertCommands([
        { command: "echo foo", exitCode: 0, cwd: void 0, marker: { line: 0 } },
        { command: "echo bar", exitCode: 0, cwd: "/home", marker: { line: 2 } }
      ]);
    });
  });
});
//# sourceMappingURL=commandDetectionCapability.test.js.map
