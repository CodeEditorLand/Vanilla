import assert from "assert";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { TestDialogService } from "../../../dialogs/test/common/testDialogService.js";
import { TestNotificationService } from "../../../notification/test/common/testNotificationService.js";
import {
  UndoRedoElementType,
  UndoRedoGroup
} from "../../common/undoRedo.js";
import { UndoRedoService } from "../../common/undoRedoService.js";
suite("UndoRedoService", () => {
  function createUndoRedoService(dialogService = new TestDialogService()) {
    const notificationService = new TestNotificationService();
    return new UndoRedoService(dialogService, notificationService);
  }
  test("simple single resource elements", () => {
    const resource = URI.file("test.txt");
    const service = createUndoRedoService();
    assert.strictEqual(service.canUndo(resource), false);
    assert.strictEqual(service.canRedo(resource), false);
    assert.strictEqual(service.hasElements(resource), false);
    assert.ok(service.getLastElement(resource) === null);
    let undoCall1 = 0;
    let redoCall1 = 0;
    const element1 = {
      type: UndoRedoElementType.Resource,
      resource,
      label: "typing 1",
      code: "typing",
      undo: () => {
        undoCall1++;
      },
      redo: () => {
        redoCall1++;
      }
    };
    service.pushElement(element1);
    assert.strictEqual(undoCall1, 0);
    assert.strictEqual(redoCall1, 0);
    assert.strictEqual(service.canUndo(resource), true);
    assert.strictEqual(service.canRedo(resource), false);
    assert.strictEqual(service.hasElements(resource), true);
    assert.ok(service.getLastElement(resource) === element1);
    service.undo(resource);
    assert.strictEqual(undoCall1, 1);
    assert.strictEqual(redoCall1, 0);
    assert.strictEqual(service.canUndo(resource), false);
    assert.strictEqual(service.canRedo(resource), true);
    assert.strictEqual(service.hasElements(resource), true);
    assert.ok(service.getLastElement(resource) === null);
    service.redo(resource);
    assert.strictEqual(undoCall1, 1);
    assert.strictEqual(redoCall1, 1);
    assert.strictEqual(service.canUndo(resource), true);
    assert.strictEqual(service.canRedo(resource), false);
    assert.strictEqual(service.hasElements(resource), true);
    assert.ok(service.getLastElement(resource) === element1);
    let undoCall2 = 0;
    let redoCall2 = 0;
    const element2 = {
      type: UndoRedoElementType.Resource,
      resource,
      label: "typing 2",
      code: "typing",
      undo: () => {
        undoCall2++;
      },
      redo: () => {
        redoCall2++;
      }
    };
    service.pushElement(element2);
    assert.strictEqual(undoCall1, 1);
    assert.strictEqual(redoCall1, 1);
    assert.strictEqual(undoCall2, 0);
    assert.strictEqual(redoCall2, 0);
    assert.strictEqual(service.canUndo(resource), true);
    assert.strictEqual(service.canRedo(resource), false);
    assert.strictEqual(service.hasElements(resource), true);
    assert.ok(service.getLastElement(resource) === element2);
    service.undo(resource);
    assert.strictEqual(undoCall1, 1);
    assert.strictEqual(redoCall1, 1);
    assert.strictEqual(undoCall2, 1);
    assert.strictEqual(redoCall2, 0);
    assert.strictEqual(service.canUndo(resource), true);
    assert.strictEqual(service.canRedo(resource), true);
    assert.strictEqual(service.hasElements(resource), true);
    assert.ok(service.getLastElement(resource) === null);
    let undoCall3 = 0;
    let redoCall3 = 0;
    const element3 = {
      type: UndoRedoElementType.Resource,
      resource,
      label: "typing 2",
      code: "typing",
      undo: () => {
        undoCall3++;
      },
      redo: () => {
        redoCall3++;
      }
    };
    service.pushElement(element3);
    assert.strictEqual(undoCall1, 1);
    assert.strictEqual(redoCall1, 1);
    assert.strictEqual(undoCall2, 1);
    assert.strictEqual(redoCall2, 0);
    assert.strictEqual(undoCall3, 0);
    assert.strictEqual(redoCall3, 0);
    assert.strictEqual(service.canUndo(resource), true);
    assert.strictEqual(service.canRedo(resource), false);
    assert.strictEqual(service.hasElements(resource), true);
    assert.ok(service.getLastElement(resource) === element3);
    service.undo(resource);
    assert.strictEqual(undoCall1, 1);
    assert.strictEqual(redoCall1, 1);
    assert.strictEqual(undoCall2, 1);
    assert.strictEqual(redoCall2, 0);
    assert.strictEqual(undoCall3, 1);
    assert.strictEqual(redoCall3, 0);
    assert.strictEqual(service.canUndo(resource), true);
    assert.strictEqual(service.canRedo(resource), true);
    assert.strictEqual(service.hasElements(resource), true);
    assert.ok(service.getLastElement(resource) === null);
  });
  test("multi resource elements", async () => {
    const resource1 = URI.file("test1.txt");
    const resource2 = URI.file("test2.txt");
    const service = createUndoRedoService(
      new class extends mock() {
        async prompt(prompt) {
          const result = prompt.buttons?.[0].run({
            checkboxChecked: false
          });
          return { result };
        }
        async confirm() {
          return {
            confirmed: true
            // confirm!
          };
        }
      }()
    );
    let undoCall1 = 0, undoCall11 = 0, undoCall12 = 0;
    let redoCall1 = 0, redoCall11 = 0, redoCall12 = 0;
    const element1 = {
      type: UndoRedoElementType.Workspace,
      resources: [resource1, resource2],
      label: "typing 1",
      code: "typing",
      undo: () => {
        undoCall1++;
      },
      redo: () => {
        redoCall1++;
      },
      split: () => {
        return [
          {
            type: UndoRedoElementType.Resource,
            resource: resource1,
            label: "typing 1.1",
            code: "typing",
            undo: () => {
              undoCall11++;
            },
            redo: () => {
              redoCall11++;
            }
          },
          {
            type: UndoRedoElementType.Resource,
            resource: resource2,
            label: "typing 1.2",
            code: "typing",
            undo: () => {
              undoCall12++;
            },
            redo: () => {
              redoCall12++;
            }
          }
        ];
      }
    };
    service.pushElement(element1);
    assert.strictEqual(service.canUndo(resource1), true);
    assert.strictEqual(service.canRedo(resource1), false);
    assert.strictEqual(service.hasElements(resource1), true);
    assert.ok(service.getLastElement(resource1) === element1);
    assert.strictEqual(service.canUndo(resource2), true);
    assert.strictEqual(service.canRedo(resource2), false);
    assert.strictEqual(service.hasElements(resource2), true);
    assert.ok(service.getLastElement(resource2) === element1);
    await service.undo(resource1);
    assert.strictEqual(undoCall1, 1);
    assert.strictEqual(redoCall1, 0);
    assert.strictEqual(service.canUndo(resource1), false);
    assert.strictEqual(service.canRedo(resource1), true);
    assert.strictEqual(service.hasElements(resource1), true);
    assert.ok(service.getLastElement(resource1) === null);
    assert.strictEqual(service.canUndo(resource2), false);
    assert.strictEqual(service.canRedo(resource2), true);
    assert.strictEqual(service.hasElements(resource2), true);
    assert.ok(service.getLastElement(resource2) === null);
    await service.redo(resource2);
    assert.strictEqual(undoCall1, 1);
    assert.strictEqual(redoCall1, 1);
    assert.strictEqual(undoCall11, 0);
    assert.strictEqual(redoCall11, 0);
    assert.strictEqual(undoCall12, 0);
    assert.strictEqual(redoCall12, 0);
    assert.strictEqual(service.canUndo(resource1), true);
    assert.strictEqual(service.canRedo(resource1), false);
    assert.strictEqual(service.hasElements(resource1), true);
    assert.ok(service.getLastElement(resource1) === element1);
    assert.strictEqual(service.canUndo(resource2), true);
    assert.strictEqual(service.canRedo(resource2), false);
    assert.strictEqual(service.hasElements(resource2), true);
    assert.ok(service.getLastElement(resource2) === element1);
  });
  test("UndoRedoGroup.None uses id 0", () => {
    assert.strictEqual(UndoRedoGroup.None.id, 0);
    assert.strictEqual(UndoRedoGroup.None.nextOrder(), 0);
    assert.strictEqual(UndoRedoGroup.None.nextOrder(), 0);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
