import { ICommandService } from "vs/platform/commands/common/commands";
import { IProgressOptions, IProgressService, IProgressStep } from "vs/platform/progress/common/progress";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadProgressShape } from "../common/extHost.protocol";
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
