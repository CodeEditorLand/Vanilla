import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IDebugService, IDebugSession, State } from "vs/workbench/contrib/debug/common/debug";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare const STATUS_BAR_DEBUGGING_BACKGROUND: any;
export declare const STATUS_BAR_DEBUGGING_FOREGROUND: any;
export declare const STATUS_BAR_DEBUGGING_BORDER: any;
export declare const COMMAND_CENTER_DEBUGGING_BACKGROUND: any;
export declare class StatusBarColorProvider implements IWorkbenchContribution {
    private readonly debugService;
    private readonly contextService;
    private readonly statusbarService;
    private readonly layoutService;
    private readonly configurationService;
    private readonly disposables;
    private disposable;
    private set enabled(value);
    constructor(debugService: IDebugService, contextService: IWorkspaceContextService, statusbarService: IStatusbarService, layoutService: ILayoutService, configurationService: IConfigurationService);
    protected update(): void;
    dispose(): void;
}
export declare function isStatusbarInDebugMode(state: State, sessions: IDebugSession[]): boolean;
