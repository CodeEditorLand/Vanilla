import { IExternalTerminalService } from "../../../../platform/externalTerminal/electron-sandbox/externalTerminalService.js";
import { type IWorkbenchContribution } from "../../../common/contributions.js";
export declare class ExternalTerminalContribution implements IWorkbenchContribution {
    private readonly _externalTerminalService;
    _serviceBrand: undefined;
    constructor(_externalTerminalService: IExternalTerminalService);
    private _updateConfiguration;
}
