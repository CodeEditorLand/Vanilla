import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
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
