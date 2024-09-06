import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
export declare class UnfocusedViewDimmingContribution extends Disposable implements IWorkbenchContribution {
    private _styleElement?;
    private _styleElementDisposables;
    constructor(configurationService: IConfigurationService);
    private _getStyleElement;
    private _removeStyleElement;
}
