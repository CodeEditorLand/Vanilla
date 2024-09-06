import { BrowserWindowConstructorOptions, HandlerDetails, WebContents } from "electron";
import { Disposable } from "vs/base/common/lifecycle";
import { AuxiliaryWindow, IAuxiliaryWindow } from "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindow";
import { IAuxiliaryWindowsMainService } from "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindows";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
export declare class AuxiliaryWindowsMainService extends Disposable implements IAuxiliaryWindowsMainService {
    private readonly instantiationService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onDidMaximizeWindow;
    readonly onDidMaximizeWindow: any;
    private readonly _onDidUnmaximizeWindow;
    readonly onDidUnmaximizeWindow: any;
    private readonly _onDidChangeFullScreen;
    readonly onDidChangeFullScreen: any;
    private readonly _onDidTriggerSystemContextMenu;
    readonly onDidTriggerSystemContextMenu: any;
    private readonly windows;
    constructor(instantiationService: IInstantiationService, logService: ILogService);
    private registerListeners;
    createWindow(details: HandlerDetails): BrowserWindowConstructorOptions;
    private computeWindowStateAndOverrides;
    registerWindow(webContents: WebContents): void;
    getWindowByWebContents(webContents: WebContents): AuxiliaryWindow | undefined;
    getFocusedWindow(): IAuxiliaryWindow | undefined;
    getLastActiveWindow(): IAuxiliaryWindow | undefined;
    getWindows(): readonly IAuxiliaryWindow[];
}
