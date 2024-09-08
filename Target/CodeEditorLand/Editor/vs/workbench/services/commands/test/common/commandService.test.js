import assert from "assert";
import {
  DisposableStore
} from "../../../../../base/common/lifecycle.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { InstantiationService } from "../../../../../platform/instantiation/common/instantiationService.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { NullExtensionService } from "../../../extensions/common/extensions.js";
import { CommandService } from "../../common/commandService.js";
suite("CommandService", () => {
  let commandRegistration;
  setup(() => {
    commandRegistration = CommandsRegistry.registerCommand("foo", () => {
    });
  });
  teardown(() => {
    commandRegistration.dispose();
  });
  test("activateOnCommand", () => {
    let lastEvent;
    const service = new CommandService(
      new InstantiationService(),
      new class extends NullExtensionService {
        activateByEvent(activationEvent) {
          lastEvent = activationEvent;
          return super.activateByEvent(activationEvent);
        }
      }(),
      new NullLogService()
    );
    return service.executeCommand("foo").then(() => {
      assert.ok(lastEvent, "onCommand:foo");
      return service.executeCommand("unknownCommandId");
    }).then(
      () => {
        assert.ok(false);
      },
      () => {
        assert.ok(lastEvent, "onCommand:unknownCommandId");
      }
    );
  });
  test("fwd activation error", async () => {
    const extensionService = new class extends NullExtensionService {
      activateByEvent(activationEvent) {
        return Promise.reject(new Error("bad_activate"));
      }
    }();
    const service = new CommandService(
      new InstantiationService(),
      extensionService,
      new NullLogService()
    );
    await extensionService.whenInstalledExtensionsRegistered();
    return service.executeCommand("foo").then(
      () => assert.ok(false),
      (err) => {
        assert.strictEqual(err.message, "bad_activate");
      }
    );
  });
  test("!onReady, but executeCommand", () => {
    let callCounter = 0;
    const reg = CommandsRegistry.registerCommand(
      "bar",
      () => callCounter += 1
    );
    const service = new CommandService(
      new InstantiationService(),
      new class extends NullExtensionService {
        whenInstalledExtensionsRegistered() {
          return new Promise((_resolve) => {
          });
        }
      }(),
      new NullLogService()
    );
    service.executeCommand("bar");
    assert.strictEqual(callCounter, 1);
    reg.dispose();
  });
  test("issue #34913: !onReady, unknown command", () => {
    let callCounter = 0;
    let resolveFunc;
    const whenInstalledExtensionsRegistered = new Promise(
      (_resolve) => {
        resolveFunc = _resolve;
      }
    );
    const service = new CommandService(
      new InstantiationService(),
      new class extends NullExtensionService {
        whenInstalledExtensionsRegistered() {
          return whenInstalledExtensionsRegistered;
        }
      }(),
      new NullLogService()
    );
    const r = service.executeCommand("bar");
    assert.strictEqual(callCounter, 0);
    const reg = CommandsRegistry.registerCommand(
      "bar",
      () => callCounter += 1
    );
    resolveFunc(true);
    return r.then(() => {
      reg.dispose();
      assert.strictEqual(callCounter, 1);
    });
  });
  test("Stop waiting for * extensions to activate when trigger is satisfied #62457", () => {
    let callCounter = 0;
    const disposable = new DisposableStore();
    const events = [];
    const service = new CommandService(
      new InstantiationService(),
      new class extends NullExtensionService {
        activateByEvent(event) {
          events.push(event);
          if (event === "*") {
            return new Promise(() => {
            });
          }
          if (event.indexOf("onCommand:") === 0) {
            return new Promise((resolve) => {
              setTimeout(() => {
                const reg = CommandsRegistry.registerCommand(
                  event.substr("onCommand:".length),
                  () => {
                    callCounter += 1;
                  }
                );
                disposable.add(reg);
                resolve();
              }, 0);
            });
          }
          return Promise.resolve();
        }
      }(),
      new NullLogService()
    );
    return service.executeCommand("farboo").then(() => {
      assert.strictEqual(callCounter, 1);
      assert.deepStrictEqual(
        events.sort(),
        ["*", "onCommand:farboo"].sort()
      );
    }).finally(() => {
      disposable.dispose();
    });
  });
  test("issue #71471: wait for onCommand activation even if a command is registered", () => {
    const expectedOrder = [
      "registering command",
      "resolving activation event",
      "executing command"
    ];
    const actualOrder = [];
    const disposables = new DisposableStore();
    const service = new CommandService(
      new InstantiationService(),
      new class extends NullExtensionService {
        activateByEvent(event) {
          if (event === "*") {
            return new Promise(() => {
            });
          }
          if (event.indexOf("onCommand:") === 0) {
            return new Promise((resolve) => {
              setTimeout(() => {
                actualOrder.push("registering command");
                const reg = CommandsRegistry.registerCommand(
                  event.substr("onCommand:".length),
                  () => {
                    actualOrder.push("executing command");
                  }
                );
                disposables.add(reg);
                setTimeout(() => {
                  actualOrder.push(
                    "resolving activation event"
                  );
                  resolve();
                }, 10);
              }, 10);
            });
          }
          return Promise.resolve();
        }
      }(),
      new NullLogService()
    );
    return service.executeCommand("farboo2").then(() => {
      assert.deepStrictEqual(actualOrder, expectedOrder);
    }).finally(() => {
      disposables.dispose();
    });
  });
  test("issue #142155: execute commands synchronously if possible", async () => {
    const actualOrder = [];
    const disposables = new DisposableStore();
    disposables.add(
      CommandsRegistry.registerCommand(`bizBaz`, () => {
        actualOrder.push("executing command");
      })
    );
    const extensionService = new class extends NullExtensionService {
      activationEventIsDone(_activationEvent) {
        return true;
      }
    }();
    const service = new CommandService(
      new InstantiationService(),
      extensionService,
      new NullLogService()
    );
    await extensionService.whenInstalledExtensionsRegistered();
    try {
      actualOrder.push(`before call`);
      const promise = service.executeCommand("bizBaz");
      actualOrder.push(`after call`);
      await promise;
      actualOrder.push(`resolved`);
      assert.deepStrictEqual(actualOrder, [
        "before call",
        "executing command",
        "after call",
        "resolved"
      ]);
    } finally {
      disposables.dispose();
    }
  });
});
