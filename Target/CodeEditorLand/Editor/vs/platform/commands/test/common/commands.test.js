var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { combinedDisposable } from "../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { CommandsRegistry } from "../../common/commands.js";
suite("Command Tests", function() {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("register command - no handler", function() {
    assert.throws(() => CommandsRegistry.registerCommand("foo", null));
  });
  test("register/dispose", () => {
    const command = /* @__PURE__ */ __name(function() {
    }, "command");
    const reg = CommandsRegistry.registerCommand("foo", command);
    assert.ok(CommandsRegistry.getCommand("foo").handler === command);
    reg.dispose();
    assert.ok(CommandsRegistry.getCommand("foo") === void 0);
  });
  test("register/register/dispose", () => {
    const command1 = /* @__PURE__ */ __name(function() {
    }, "command1");
    const command2 = /* @__PURE__ */ __name(function() {
    }, "command2");
    let reg1 = CommandsRegistry.registerCommand("foo", command1);
    assert.ok(CommandsRegistry.getCommand("foo").handler === command1);
    let reg2 = CommandsRegistry.registerCommand("foo", command2);
    assert.ok(CommandsRegistry.getCommand("foo").handler === command2);
    reg2.dispose();
    assert.ok(CommandsRegistry.getCommand("foo").handler === command1);
    reg1.dispose();
    assert.ok(CommandsRegistry.getCommand("foo") === void 0);
    reg1 = CommandsRegistry.registerCommand("foo", command1);
    reg2 = CommandsRegistry.registerCommand("foo", command2);
    assert.ok(CommandsRegistry.getCommand("foo").handler === command2);
    reg1.dispose();
    assert.ok(CommandsRegistry.getCommand("foo").handler === command2);
    reg2.dispose();
    assert.ok(CommandsRegistry.getCommand("foo") === void 0);
  });
  test("command with description", function() {
    const r1 = CommandsRegistry.registerCommand("test", function(accessor, args) {
      assert.ok(typeof args === "string");
    });
    const r2 = CommandsRegistry.registerCommand("test2", function(accessor, args) {
      assert.ok(typeof args === "string");
    });
    const r3 = CommandsRegistry.registerCommand({
      id: "test3",
      handler: /* @__PURE__ */ __name(function(accessor, args) {
        return true;
      }, "handler"),
      metadata: {
        description: "a command",
        args: [{ name: "value", constraint: Number }]
      }
    });
    CommandsRegistry.getCommands().get("test").handler.apply(void 0, [void 0, "string"]);
    CommandsRegistry.getCommands().get("test2").handler.apply(void 0, [void 0, "string"]);
    assert.throws(() => CommandsRegistry.getCommands().get("test3").handler.apply(void 0, [void 0, "string"]));
    assert.strictEqual(CommandsRegistry.getCommands().get("test3").handler.apply(void 0, [void 0, 1]), true);
    combinedDisposable(r1, r2, r3).dispose();
  });
});
//# sourceMappingURL=commands.test.js.map
