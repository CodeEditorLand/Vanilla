import { ILogService } from "../../../../platform/log/common/log.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
export declare class ExtensionActivationProgress implements IWorkbenchContribution {
    private readonly _listener;
    constructor(extensionService: IExtensionService, progressService: IProgressService, logService: ILogService);
    dispose(): void;
}
