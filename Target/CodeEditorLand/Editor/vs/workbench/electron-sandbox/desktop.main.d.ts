import { Disposable } from "vs/base/common/lifecycle";
import { INativeWindowConfiguration } from "vs/platform/window/common/window";
export declare class DesktopMain extends Disposable {
    private readonly configuration;
    constructor(configuration: INativeWindowConfiguration);
    private init;
    private reviveUris;
    open(): Promise<void>;
    private applyWindowZoomLevel;
    private getExtraClasses;
    private registerListeners;
    private initServices;
    private resolveWorkspaceIdentifier;
    private createWorkspaceService;
    private createStorageService;
    private createKeyboardLayoutService;
}
export declare function main(configuration: INativeWindowConfiguration): Promise<void>;
