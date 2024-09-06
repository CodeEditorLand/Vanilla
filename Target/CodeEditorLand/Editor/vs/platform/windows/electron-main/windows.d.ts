import electron from "electron";
import { Event } from "vs/base/common/event";
import { IProcessEnvironment } from "vs/base/common/platform";
import { URI } from "vs/base/common/uri";
import { IAuxiliaryWindow } from "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindow";
import { NativeParsedArgs } from "vs/platform/environment/common/argv";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IOpenEmptyWindowOptions, IWindowOpenable } from "vs/platform/window/common/window";
import { ICodeWindow, IWindowState } from "vs/platform/window/electron-main/window";
export declare const IWindowsMainService: any;
export interface IWindowsMainService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeWindowsCount: Event<IWindowsCountChangedEvent>;
    readonly onDidOpenWindow: Event<ICodeWindow>;
    readonly onDidSignalReadyWindow: Event<ICodeWindow>;
    readonly onDidMaximizeWindow: Event<ICodeWindow>;
    readonly onDidUnmaximizeWindow: Event<ICodeWindow>;
    readonly onDidChangeFullScreen: Event<{
        window: ICodeWindow;
        fullscreen: boolean;
    }>;
    readonly onDidTriggerSystemContextMenu: Event<{
        readonly window: ICodeWindow;
        readonly x: number;
        readonly y: number;
    }>;
    readonly onDidDestroyWindow: Event<ICodeWindow>;
    open(openConfig: IOpenConfiguration): Promise<ICodeWindow[]>;
    openEmptyWindow(openConfig: IOpenEmptyConfiguration, options?: IOpenEmptyWindowOptions): Promise<ICodeWindow[]>;
    openExtensionDevelopmentHostWindow(extensionDevelopmentPath: string[], openConfig: IOpenConfiguration): Promise<ICodeWindow[]>;
    openExistingWindow(window: ICodeWindow, openConfig: IOpenConfiguration): void;
    sendToFocused(channel: string, ...args: any[]): void;
    sendToOpeningWindow(channel: string, ...args: any[]): void;
    sendToAll(channel: string, payload?: any, windowIdsToIgnore?: number[]): void;
    getWindows(): ICodeWindow[];
    getWindowCount(): number;
    getFocusedWindow(): ICodeWindow | undefined;
    getLastActiveWindow(): ICodeWindow | undefined;
    getWindowById(windowId: number): ICodeWindow | undefined;
    getWindowByWebContents(webContents: electron.WebContents): ICodeWindow | undefined;
}
export interface IWindowsCountChangedEvent {
    readonly oldCount: number;
    readonly newCount: number;
}
export declare const enum OpenContext {
    CLI = 0,
    DOCK = 1,
    MENU = 2,
    DIALOG = 3,
    DESKTOP = 4,
    API = 5,
    LINK = 6
}
export interface IBaseOpenConfiguration {
    readonly context: OpenContext;
    readonly contextWindowId?: number;
}
export interface IOpenConfiguration extends IBaseOpenConfiguration {
    readonly cli: NativeParsedArgs;
    readonly userEnv?: IProcessEnvironment;
    readonly urisToOpen?: IWindowOpenable[];
    readonly waitMarkerFileURI?: URI;
    readonly preferNewWindow?: boolean;
    readonly forceNewWindow?: boolean;
    readonly forceNewTabbedWindow?: boolean;
    readonly forceReuseWindow?: boolean;
    readonly forceEmpty?: boolean;
    readonly diffMode?: boolean;
    readonly mergeMode?: boolean;
    addMode?: boolean;
    readonly gotoLineMode?: boolean;
    readonly initialStartup?: boolean;
    readonly noRecentEntry?: boolean;
    /**
     * The remote authority to use when windows are opened with either
     * - no workspace (empty window)
     * - a workspace that is neither `file://` nor `vscode-remote://`
     */
    readonly remoteAuthority?: string;
    readonly forceProfile?: string;
    readonly forceTempProfile?: boolean;
}
export interface IOpenEmptyConfiguration extends IBaseOpenConfiguration {
}
export interface IDefaultBrowserWindowOptionsOverrides {
    forceNativeTitlebar?: boolean;
    disableFullscreen?: boolean;
}
export declare function defaultBrowserWindowOptions(accessor: ServicesAccessor, windowState: IWindowState, overrides?: IDefaultBrowserWindowOptionsOverrides, webPreferences?: electron.WebPreferences): electron.BrowserWindowConstructorOptions & {
    experimentalDarkMode: boolean;
};
export declare function getLastFocused(windows: ICodeWindow[]): ICodeWindow | undefined;
export declare function getLastFocused(windows: IAuxiliaryWindow[]): IAuxiliaryWindow | undefined;
export declare namespace WindowStateValidator {
    function validateWindowState(logService: ILogService, state: IWindowState, displays?: any): IWindowState | undefined;
}
