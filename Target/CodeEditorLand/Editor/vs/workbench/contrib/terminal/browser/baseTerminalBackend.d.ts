import { Disposable } from "vs/base/common/lifecycle";
import { IPtyHostController, ISerializedTerminalState, ITerminalLogService } from "vs/platform/terminal/common/terminal";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IConfigurationResolverService } from "vs/workbench/services/configurationResolver/common/configurationResolver";
import { IHistoryService } from "vs/workbench/services/history/common/history";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare abstract class BaseTerminalBackend extends Disposable {
    private readonly _ptyHostController;
    protected readonly _logService: ITerminalLogService;
    protected readonly _workspaceContextService: IWorkspaceContextService;
    private _isPtyHostUnresponsive;
    get isResponsive(): boolean;
    protected readonly _onPtyHostConnected: any;
    readonly onPtyHostConnected: any;
    protected readonly _onPtyHostRestart: any;
    readonly onPtyHostRestart: any;
    protected readonly _onPtyHostUnresponsive: any;
    readonly onPtyHostUnresponsive: any;
    protected readonly _onPtyHostResponsive: any;
    readonly onPtyHostResponsive: any;
    constructor(_ptyHostController: IPtyHostController, _logService: ITerminalLogService, historyService: IHistoryService, configurationResolverService: IConfigurationResolverService, statusBarService: IStatusbarService, _workspaceContextService: IWorkspaceContextService);
    restartPtyHost(): void;
    protected _deserializeTerminalState(serializedState: string | undefined): ISerializedTerminalState[] | undefined;
    protected _getWorkspaceId(): string;
}
