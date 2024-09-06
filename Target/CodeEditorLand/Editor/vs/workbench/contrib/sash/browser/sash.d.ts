import { IDisposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
export declare const minSize = 1;
export declare const maxSize = 20;
export declare class SashSettingsController implements IWorkbenchContribution, IDisposable {
    private readonly configurationService;
    private readonly layoutService;
    private readonly disposables;
    constructor(configurationService: IConfigurationService, layoutService: ILayoutService);
    private onDidChangeSize;
    private onDidChangeHoverDelay;
    dispose(): void;
}
