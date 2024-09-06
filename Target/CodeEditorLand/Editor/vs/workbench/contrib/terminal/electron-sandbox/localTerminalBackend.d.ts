import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ITerminalInstanceService } from "vs/workbench/contrib/terminal/browser/terminal";
export declare class LocalTerminalBackendContribution implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.localTerminalBackend";
    constructor(instantiationService: IInstantiationService, terminalInstanceService: ITerminalInstanceService);
}
