import assert from "assert";
import { MainThreadCommands } from "../../browser/mainThreadCommands.js";
import { CommandsRegistry, ICommandService } from "../../../../platform/commands/common/commands.js";
import { SingleProxyRPCProtocol } from "../common/testRPCProtocol.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
suite("MainThreadCommands", function() {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("dispose on unregister", function() {
    const commands = new MainThreadCommands(SingleProxyRPCProtocol(null), void 0, new class extends mock() {
    }());
    assert.strictEqual(CommandsRegistry.getCommand("foo"), void 0);
    commands.$registerCommand("foo");
    assert.ok(CommandsRegistry.getCommand("foo"));
    commands.$unregisterCommand("foo");
    assert.strictEqual(CommandsRegistry.getCommand("foo"), void 0);
    commands.dispose();
  });
  test("unregister all on dispose", function() {
    const commands = new MainThreadCommands(SingleProxyRPCProtocol(null), void 0, new class extends mock() {
    }());
    assert.strictEqual(CommandsRegistry.getCommand("foo"), void 0);
    commands.$registerCommand("foo");
    commands.$registerCommand("bar");
    assert.ok(CommandsRegistry.getCommand("foo"));
    assert.ok(CommandsRegistry.getCommand("bar"));
    commands.dispose();
    assert.strictEqual(CommandsRegistry.getCommand("foo"), void 0);
    assert.strictEqual(CommandsRegistry.getCommand("bar"), void 0);
  });
  test("activate and throw when needed", async function() {
    const activations = [];
    const runs = [];
    const commands = new MainThreadCommands(
      SingleProxyRPCProtocol(null),
      new class extends mock() {
        executeCommand(id) {
          runs.push(id);
          return Promise.resolve(void 0);
        }
      }(),
      new class extends mock() {
        activateByEvent(id) {
          activations.push(id);
          return Promise.resolve();
        }
      }()
    );
    try {
      activations.length = 0;
      await commands.$executeCommand("bazz", [1, 2, { n: 3 }], true);
      assert.ok(false);
    } catch (e) {
      assert.deepStrictEqual(activations, ["onCommand:bazz"]);
      assert.strictEqual(e.message, "$executeCommand:retry");
    }
    runs.length = 0;
    await commands.$executeCommand("bazz", [], true);
    assert.deepStrictEqual(runs, ["bazz"]);
    runs.length = 0;
    await commands.$executeCommand("bazz", [1, 2, true], false);
    assert.deepStrictEqual(runs, ["bazz"]);
    commands.dispose();
  });
});
//# sourceMappingURL=mainThreadCommands.test.js.map
