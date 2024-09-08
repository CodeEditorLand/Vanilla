import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IPtyHostController, ISerializedTerminalState, ITerminalLogService } from "../../../../platform/terminal/common/terminal.js";
import type { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import type { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import type { IHistoryService } from "../../../services/history/common/history.js";
import { type IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
export declare abstract class BaseTerminalBackend extends Disposable {
    private readonly _ptyHostController;
    protected readonly _logService: ITerminalLogService;
    protected readonly _workspaceContextService: IWorkspaceContextService;
    private _isPtyHostUnresponsive;
    get isResponsive(): boolean;
    protected readonly _onPtyHostConnected: Emitter<void>;
    readonly onPtyHostConnected: import("../../../../base/common/event.js").Event<void>;
    protected readonly _onPtyHostRestart: Emitter<void>;
    readonly onPtyHostRestart: import("../../../../base/common/event.js").Event<void>;
    protected readonly _onPtyHostUnresponsive: Emitter<void>;
    readonly onPtyHostUnresponsive: import("../../../../base/common/event.js").Event<void>;
    protected readonly _onPtyHostResponsive: Emitter<void>;
    readonly onPtyHostResponsive: import("../../../../base/common/event.js").Event<void>;
    constructor(_ptyHostController: IPtyHostController, _logService: ITerminalLogService, historyService: IHistoryService, configurationResolverService: IConfigurationResolverService, statusBarService: IStatusbarService, _workspaceContextService: IWorkspaceContextService);
    restartPtyHost(): void;
    protected _deserializeTerminalState(serializedState: string | undefined): ISerializedTerminalState[] | undefined;
    protected _getWorkspaceId(): string;
}
