var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ok } from "assert";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ACTIVE_TASK_STATUS, FAILED_TASK_STATUS, SUCCEEDED_TASK_STATUS, TaskTerminalStatus } from "../../browser/taskTerminalStatus.js";
import { AbstractProblemCollector } from "../../common/problemCollectors.js";
import { CommonTask, ITaskEvent, TaskEventKind, TaskRunType } from "../../common/tasks.js";
import { ITaskService, Task } from "../../common/taskService.js";
import { ITerminalInstance } from "../../../terminal/browser/terminal.js";
import { ITerminalStatusList, TerminalStatusList } from "../../../terminal/browser/terminalStatusList.js";
import { ITerminalStatus } from "../../../terminal/common/terminal.js";
class TestTaskService {
  static {
    __name(this, "TestTaskService");
  }
  _onDidStateChange = new Emitter();
  get onDidStateChange() {
    return this._onDidStateChange.event;
  }
  triggerStateChange(event) {
    this._onDidStateChange.fire(event);
  }
}
class TestaccessibilitySignalService {
  static {
    __name(this, "TestaccessibilitySignalService");
  }
  async playSignal(cue) {
    return;
  }
}
class TestTerminal extends Disposable {
  static {
    __name(this, "TestTerminal");
  }
  statusList = this._register(new TerminalStatusList(new TestConfigurationService()));
  constructor() {
    super();
  }
  dispose() {
    super.dispose();
  }
}
class TestTask extends CommonTask {
  static {
    __name(this, "TestTask");
  }
  constructor() {
    super("test", void 0, void 0, {}, {}, { kind: "", label: "" });
  }
  getFolderId() {
    throw new Error("Method not implemented.");
  }
  fromObject(object) {
    throw new Error("Method not implemented.");
  }
}
class TestProblemCollector extends Disposable {
  static {
    __name(this, "TestProblemCollector");
  }
  _onDidFindFirstMatch = new Emitter();
  onDidFindFirstMatch = this._onDidFindFirstMatch.event;
  _onDidFindErrors = new Emitter();
  onDidFindErrors = this._onDidFindErrors.event;
  _onDidRequestInvalidateLastMarker = new Emitter();
  onDidRequestInvalidateLastMarker = this._onDidRequestInvalidateLastMarker.event;
}
suite("Task Terminal Status", () => {
  let instantiationService;
  let taskService;
  let taskTerminalStatus;
  let testTerminal;
  let testTask;
  let problemCollector;
  let accessibilitySignalService;
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    instantiationService = store.add(new TestInstantiationService());
    taskService = new TestTaskService();
    accessibilitySignalService = new TestaccessibilitySignalService();
    taskTerminalStatus = store.add(new TaskTerminalStatus(taskService, accessibilitySignalService));
    testTerminal = store.add(instantiationService.createInstance(TestTerminal));
    testTask = instantiationService.createInstance(TestTask);
    problemCollector = store.add(instantiationService.createInstance(TestProblemCollector));
  });
  test("Should add failed status when there is an exit code on task end", async () => {
    taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
    taskService.triggerStateChange({ kind: TaskEventKind.ProcessStarted });
    assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.Inactive });
    assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.End });
    await poll(async () => Promise.resolve(), () => testTerminal?.statusList.primary?.id === FAILED_TASK_STATUS.id, "terminal status should be updated");
  });
  test("Should add active status when a non-background task is run for a second time in the same terminal", () => {
    taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
    taskService.triggerStateChange({ kind: TaskEventKind.ProcessStarted });
    assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.Inactive });
    assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.ProcessStarted, runType: TaskRunType.SingleRun });
    assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.Inactive });
    assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
  });
  test("Should drop status when a background task exits", async () => {
    taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
    taskService.triggerStateChange({ kind: TaskEventKind.ProcessStarted, runType: TaskRunType.Background });
    assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.Inactive });
    assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.ProcessEnded, exitCode: 0 });
    await poll(async () => Promise.resolve(), () => testTerminal?.statusList.statuses?.includes(SUCCEEDED_TASK_STATUS) === false, "terminal should have dropped status");
  });
  test("Should add succeeded status when a non-background task exits", () => {
    taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
    taskService.triggerStateChange({ kind: TaskEventKind.ProcessStarted, runType: TaskRunType.SingleRun });
    assertStatus(testTerminal.statusList, ACTIVE_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.Inactive });
    assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
    taskService.triggerStateChange({ kind: TaskEventKind.ProcessEnded, exitCode: 0 });
    assertStatus(testTerminal.statusList, SUCCEEDED_TASK_STATUS);
  });
});
function assertStatus(actual, expected) {
  ok(actual.statuses.length === 1, "# of statuses");
  ok(actual.primary?.id === expected.id, "ID");
  ok(actual.primary?.severity === expected.severity, "Severity");
}
__name(assertStatus, "assertStatus");
async function poll(fn, acceptFn, timeoutMessage, retryCount = 200, retryInterval = 10) {
  let trial = 1;
  let lastError = "";
  while (true) {
    if (trial > retryCount) {
      throw new Error(`Timeout: ${timeoutMessage} after ${retryCount * retryInterval / 1e3} seconds.\r${lastError}`);
    }
    let result;
    try {
      result = await fn();
      if (acceptFn(result)) {
        return result;
      } else {
        lastError = "Did not pass accept function";
      }
    } catch (e) {
      lastError = Array.isArray(e.stack) ? e.stack.join("\n") : e.stack;
    }
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
    trial++;
  }
}
__name(poll, "poll");
//# sourceMappingURL=taskTerminalStatus.test.js.map
