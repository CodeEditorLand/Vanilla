import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILogService } from "vs/platform/log/common/log";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
export declare class DebugWatchAccessibilityAnnouncer extends Disposable implements IWorkbenchContribution {
    private readonly _debugService;
    private readonly _logService;
    private readonly _accessibilityService;
    private readonly _configurationService;
    static ID: string;
    private readonly _listener;
    constructor(_debugService: IDebugService, _logService: ILogService, _accessibilityService: IAccessibilityService, _configurationService: IConfigurationService);
    private _setListener;
}
