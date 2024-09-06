import { ICommandService } from "../../../platform/commands/common/commands.js";
import { IProgressOptions, IProgressService, IProgressStep } from "../../../platform/progress/common/progress.js";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadProgressShape } from "../common/extHost.protocol.js";
export declare class MainThreadProgress implements MainThreadProgressShape {
    private readonly _commandService;
    private readonly _progressService;
    private _progress;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, progressService: IProgressService, _commandService: ICommandService);
    dispose(): void;
    $startProgress(handle: number, options: IProgressOptions, extensionId?: string): Promise<void>;
    $progressReport(handle: number, message: IProgressStep): void;
    $progressEnd(handle: number): void;
    private _createTask;
}
