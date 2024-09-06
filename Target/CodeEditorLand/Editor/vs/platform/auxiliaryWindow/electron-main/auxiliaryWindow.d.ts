import { BrowserWindowConstructorOptions, WebContents } from "electron";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentMainService } from "vs/platform/environment/electron-main/environmentMainService";
import { ILifecycleMainService } from "vs/platform/lifecycle/electron-main/lifecycleMainService";
import { ILogService } from "vs/platform/log/common/log";
import { IStateService } from "vs/platform/state/node/state";
import { IBaseWindow } from "vs/platform/window/electron-main/window";
import { BaseWindow } from "vs/platform/windows/electron-main/windowImpl";
export interface IAuxiliaryWindow extends IBaseWindow {
    readonly parentId: number;
}
export declare class AuxiliaryWindow extends BaseWindow implements IAuxiliaryWindow {
    private readonly webContents;
    private readonly lifecycleMainService;
    readonly id: any;
    parentId: number;
    get win(): any;
    private stateApplied;
    constructor(webContents: WebContents, environmentMainService: IEnvironmentMainService, logService: ILogService, configurationService: IConfigurationService, stateService: IStateService, lifecycleMainService: ILifecycleMainService);
    tryClaimWindow(options?: BrowserWindowConstructorOptions): void;
    private doTryClaimWindow;
    matches(webContents: WebContents): boolean;
}
