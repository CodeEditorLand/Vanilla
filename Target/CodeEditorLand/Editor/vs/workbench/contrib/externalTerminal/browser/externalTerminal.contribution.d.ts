import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { type IWorkbenchContribution } from "../../../common/contributions.js";
export declare class ExternalTerminalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _configurationService;
    private _openInIntegratedTerminalMenuItem;
    private _openInTerminalMenuItem;
    constructor(_configurationService: IConfigurationService);
    private isWindows;
    private _refreshOpenInTerminalMenuItemTitle;
}
