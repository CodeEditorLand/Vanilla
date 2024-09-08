import assert from "assert";
import { Event } from "../../../../base/common/event.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { TestDialogService } from "../../../../platform/dialogs/test/common/testDialogService.js";
import {
  NoOpNotification
} from "../../../../platform/notification/common/notification.js";
import { TestExtensionService } from "../../../test/common/workbenchTestServices.js";
import { MainThreadMessageService } from "../../browser/mainThreadMessageService.js";
const emptyCommandService = {
  _serviceBrand: void 0,
  onWillExecuteCommand: () => Disposable.None,
  onDidExecuteCommand: () => Disposable.None,
  executeCommand: (commandId, ...args) => {
    return Promise.resolve(void 0);
  }
};
const emptyNotificationService = new class {
  onDidAddNotification = Event.None;
  onDidRemoveNotification = Event.None;
  onDidChangeFilter = Event.None;
  notify(...args) {
    throw new Error("not implemented");
  }
  info(...args) {
    throw new Error("not implemented");
  }
  warn(...args) {
    throw new Error("not implemented");
  }
  error(...args) {
    throw new Error("not implemented");
  }
  prompt(severity, message, choices, options) {
    throw new Error("not implemented");
  }
  status(message, options) {
    return Disposable.None;
  }
  setFilter() {
    throw new Error("not implemented");
  }
  getFilter(source) {
    throw new Error("not implemented");
  }
  getFilters() {
    throw new Error("not implemented");
  }
  removeFilter(sourceId) {
    throw new Error("not implemented");
  }
}();
class EmptyNotificationService {
  constructor(withNotify) {
    this.withNotify = withNotify;
  }
  filter = false;
  onDidAddNotification = Event.None;
  onDidRemoveNotification = Event.None;
  onDidChangeFilter = Event.None;
  notify(notification) {
    this.withNotify(notification);
    return new NoOpNotification();
  }
  info(message) {
    throw new Error("Method not implemented.");
  }
  warn(message) {
    throw new Error("Method not implemented.");
  }
  error(message) {
    throw new Error("Method not implemented.");
  }
  prompt(severity, message, choices, options) {
    throw new Error("Method not implemented");
  }
  status(message, options) {
    return Disposable.None;
  }
  setFilter() {
    throw new Error("Method not implemented.");
  }
  getFilter(source) {
    throw new Error("Method not implemented.");
  }
  getFilters() {
    throw new Error("Method not implemented.");
  }
  removeFilter(sourceId) {
    throw new Error("Method not implemented.");
  }
}
suite("ExtHostMessageService", () => {
  test("propagte handle on select", async () => {
    const service = new MainThreadMessageService(
      null,
      new EmptyNotificationService((notification) => {
        assert.strictEqual(notification.actions.primary.length, 1);
        queueMicrotask(() => notification.actions.primary[0].run());
      }),
      emptyCommandService,
      new TestDialogService(),
      new TestExtensionService()
    );
    const handle = await service.$showMessage(1, "h", {}, [
      { handle: 42, title: "a thing", isCloseAffordance: true }
    ]);
    assert.strictEqual(handle, 42);
    service.dispose();
  });
  suite("modal", () => {
    test("calls dialog service", async () => {
      const service = new MainThreadMessageService(
        null,
        emptyNotificationService,
        emptyCommandService,
        new class extends mock() {
          prompt({
            type,
            message,
            buttons,
            cancelButton
          }) {
            assert.strictEqual(type, 1);
            assert.strictEqual(message, "h");
            assert.strictEqual(buttons.length, 1);
            assert.strictEqual(
              cancelButton.label,
              "Cancel"
            );
            return Promise.resolve({
              result: buttons[0].run({ checkboxChecked: false })
            });
          }
        }(),
        new TestExtensionService()
      );
      const handle = await service.$showMessage(1, "h", { modal: true }, [
        { handle: 42, title: "a thing", isCloseAffordance: false }
      ]);
      assert.strictEqual(handle, 42);
      service.dispose();
    });
    test("returns undefined when cancelled", async () => {
      const service = new MainThreadMessageService(
        null,
        emptyNotificationService,
        emptyCommandService,
        new class extends mock() {
          prompt(prompt) {
            return Promise.resolve({
              result: prompt.cancelButton.run(
                { checkboxChecked: false }
              )
            });
          }
        }(),
        new TestExtensionService()
      );
      const handle = await service.$showMessage(1, "h", { modal: true }, [
        { handle: 42, title: "a thing", isCloseAffordance: false }
      ]);
      assert.strictEqual(handle, void 0);
      service.dispose();
    });
    test("hides Cancel button when not needed", async () => {
      const service = new MainThreadMessageService(
        null,
        emptyNotificationService,
        emptyCommandService,
        new class extends mock() {
          prompt({
            type,
            message,
            buttons,
            cancelButton
          }) {
            assert.strictEqual(buttons.length, 0);
            assert.ok(cancelButton);
            return Promise.resolve({
              result: cancelButton.run({ checkboxChecked: false })
            });
          }
        }(),
        new TestExtensionService()
      );
      const handle = await service.$showMessage(1, "h", { modal: true }, [
        { handle: 42, title: "a thing", isCloseAffordance: true }
      ]);
      assert.strictEqual(handle, 42);
      service.dispose();
    });
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
