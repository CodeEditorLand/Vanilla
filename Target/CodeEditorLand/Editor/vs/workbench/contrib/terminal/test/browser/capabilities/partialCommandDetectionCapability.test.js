var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual } from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { PartialCommandDetectionCapability } from "../../../../../../platform/terminal/common/capabilities/partialCommandDetectionCapability.js";
import { writeP } from "../../../browser/terminalTestHelpers.js";
suite("PartialCommandDetectionCapability", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let xterm;
  let capability;
  let addEvents;
  function assertCommands(expectedLines) {
    deepStrictEqual(capability.commands.map((e) => e.line), expectedLines);
    deepStrictEqual(addEvents.map((e) => e.line), expectedLines);
  }
  __name(assertCommands, "assertCommands");
  setup(async () => {
    const TerminalCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 80 }));
    capability = store.add(new PartialCommandDetectionCapability(xterm));
    addEvents = [];
    store.add(capability.onCommandFinished((e) => addEvents.push(e)));
  });
  test("should not add commands when the cursor position is too close to the left side", async () => {
    assertCommands([]);
    xterm.input("\r");
    await writeP(xterm, "\r\n");
    assertCommands([]);
    await writeP(xterm, "a");
    xterm.input("\r");
    await writeP(xterm, "\r\n");
    assertCommands([]);
  });
  test("should add commands when the cursor position is not too close to the left side", async () => {
    assertCommands([]);
    await writeP(xterm, "ab");
    xterm.input("\r");
    await writeP(xterm, "\r\n\r\n");
    assertCommands([0]);
    await writeP(xterm, "cd");
    xterm.input("\r");
    await writeP(xterm, "\r\n");
    assertCommands([0, 2]);
  });
});
//# sourceMappingURL=partialCommandDetectionCapability.test.js.map
