import assert from "assert";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { ExtHostCommands } from "../../common/extHostCommands.js";
import { SingleProxyRPCProtocol } from "../common/testRPCProtocol.js";
suite("ExtHostCommands", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("dispose calls unregister", () => {
    let lastUnregister;
    const shape = new class extends mock() {
      $registerCommand(id) {
      }
      $unregisterCommand(id) {
        lastUnregister = id;
      }
    }();
    const commands = new ExtHostCommands(
      SingleProxyRPCProtocol(shape),
      new NullLogService(),
      new class extends mock() {
        onExtensionError() {
          return true;
        }
      }()
    );
    commands.registerCommand(true, "foo", () => {
    }).dispose();
    assert.strictEqual(lastUnregister, "foo");
    assert.strictEqual(CommandsRegistry.getCommand("foo"), void 0);
  });
  test("dispose bubbles only once", () => {
    let unregisterCounter = 0;
    const shape = new class extends mock() {
      $registerCommand(id) {
      }
      $unregisterCommand(id) {
        unregisterCounter += 1;
      }
    }();
    const commands = new ExtHostCommands(
      SingleProxyRPCProtocol(shape),
      new NullLogService(),
      new class extends mock() {
        onExtensionError() {
          return true;
        }
      }()
    );
    const reg = commands.registerCommand(true, "foo", () => {
    });
    reg.dispose();
    reg.dispose();
    reg.dispose();
    assert.strictEqual(unregisterCounter, 1);
  });
  test("execute with retry", async function() {
    let count = 0;
    const shape = new class extends mock() {
      $registerCommand(id) {
      }
      async $executeCommand(id, args, retry) {
        count++;
        assert.strictEqual(retry, count === 1);
        if (count === 1) {
          assert.strictEqual(retry, true);
          throw new Error("$executeCommand:retry");
        } else {
          assert.strictEqual(retry, false);
          return 17;
        }
      }
    }();
    const commands = new ExtHostCommands(
      SingleProxyRPCProtocol(shape),
      new NullLogService(),
      new class extends mock() {
        onExtensionError() {
          return true;
        }
      }()
    );
    const result = await commands.executeCommand("fooo", [
      this,
      true
    ]);
    assert.strictEqual(result, 17);
    assert.strictEqual(count, 2);
  });
  test("onCommand:abc activates extensions when executed from command palette, but not when executed programmatically with vscode.commands.executeCommand #150293", async function() {
    const activationEvents = [];
    const shape = new class extends mock() {
      $registerCommand(id) {
      }
      $fireCommandActivationEvent(id) {
        activationEvents.push(id);
      }
    }();
    const commands = new ExtHostCommands(
      SingleProxyRPCProtocol(shape),
      new NullLogService(),
      new class extends mock() {
        onExtensionError() {
          return true;
        }
      }()
    );
    commands.registerCommand(true, "extCmd", (args) => args);
    const result = await commands.executeCommand("extCmd", this);
    assert.strictEqual(result, this);
    assert.deepStrictEqual(activationEvents, ["extCmd"]);
  });
});
