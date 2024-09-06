import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
export declare class ExternalTerminalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _configurationService;
    private _openInIntegratedTerminalMenuItem;
    private _openInTerminalMenuItem;
    constructor(_configurationService: IConfigurationService);
    private isWindows;
    private _refreshOpenInTerminalMenuItemTitle;
}
