import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { AbstractProblemCollector } from "vs/workbench/contrib/tasks/common/problemCollectors";
import { ITaskService, Task } from "vs/workbench/contrib/tasks/common/taskService";
import { ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
import { ITerminalStatus } from "vs/workbench/contrib/terminal/common/terminal";
export declare const ACTIVE_TASK_STATUS: ITerminalStatus;
export declare const SUCCEEDED_TASK_STATUS: ITerminalStatus;
export declare const FAILED_TASK_STATUS: ITerminalStatus;
export declare class TaskTerminalStatus extends Disposable {
    private readonly _accessibilitySignalService;
    private terminalMap;
    private _marker;
    constructor(taskService: ITaskService, _accessibilitySignalService: IAccessibilitySignalService);
    addTerminal(task: Task, terminal: ITerminalInstance, problemMatcher: AbstractProblemCollector): void;
    private terminalFromEvent;
    private eventEnd;
    private eventInactive;
    private eventActive;
}
