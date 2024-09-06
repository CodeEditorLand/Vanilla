import { ILogService } from "vs/platform/log/common/log";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class ExtensionActivationProgress implements IWorkbenchContribution {
    private readonly _listener;
    constructor(extensionService: IExtensionService, progressService: IProgressService, logService: ILogService);
    dispose(): void;
}
