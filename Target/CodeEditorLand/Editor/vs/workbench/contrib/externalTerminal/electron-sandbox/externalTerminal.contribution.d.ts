import { IExternalTerminalService } from "vs/platform/externalTerminal/electron-sandbox/externalTerminalService";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
export declare class ExternalTerminalContribution implements IWorkbenchContribution {
    private readonly _externalTerminalService;
    _serviceBrand: undefined;
    constructor(_externalTerminalService: IExternalTerminalService);
    private _updateConfiguration;
}
