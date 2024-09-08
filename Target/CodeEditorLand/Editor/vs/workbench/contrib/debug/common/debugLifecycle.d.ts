import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IDebugService } from "./debug.js";
export declare class DebugLifecycle implements IWorkbenchContribution {
    private readonly debugService;
    private readonly configurationService;
    private readonly dialogService;
    private disposable;
    constructor(lifecycleService: ILifecycleService, debugService: IDebugService, configurationService: IConfigurationService, dialogService: IDialogService);
    private shouldVetoShutdown;
    dispose(): void;
    private showWindowCloseConfirmation;
}
