import { Disposable } from "../../../../base/common/lifecycle.js";
import { IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import type { ITerminalInstance } from "../../terminal/browser/terminal.js";
import type { ITerminalStatus } from "../../terminal/common/terminal.js";
import { type AbstractProblemCollector } from "../common/problemCollectors.js";
import { ITaskService, type Task } from "../common/taskService.js";
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