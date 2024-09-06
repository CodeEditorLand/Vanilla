import { Dimension } from "vs/base/browser/dom";
import { CodeWindow } from "vs/base/browser/window";
import { Barrier } from "vs/base/common/async";
import { Event } from "vs/base/common/event";
import { Disposable, DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IRectangle } from "vs/platform/window/common/window";
import { BaseWindow } from "vs/workbench/browser/window";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare const IAuxiliaryWindowService: any;
export interface IAuxiliaryWindowOpenEvent {
    readonly window: IAuxiliaryWindow;
    readonly disposables: DisposableStore;
}
export declare enum AuxiliaryWindowMode {
    Maximized = 0,
    Normal = 1,
    Fullscreen = 2
}
export interface IAuxiliaryWindowOpenOptions {
    readonly bounds?: Partial<IRectangle>;
    readonly mode?: AuxiliaryWindowMode;
    readonly zoomLevel?: number;
    readonly nativeTitlebar?: boolean;
    readonly disableFullscreen?: boolean;
}
export interface IAuxiliaryWindowService {
    readonly _serviceBrand: undefined;
    readonly onDidOpenAuxiliaryWindow: Event<IAuxiliaryWindowOpenEvent>;
    open(options?: IAuxiliaryWindowOpenOptions): Promise<IAuxiliaryWindow>;
    getWindow(windowId: number): IAuxiliaryWindow | undefined;
}
export interface BeforeAuxiliaryWindowUnloadEvent {
    veto(reason: string | undefined): void;
}
export interface IAuxiliaryWindow extends IDisposable {
    readonly onWillLayout: Event<Dimension>;
    readonly onDidLayout: Event<Dimension>;
    readonly onBeforeUnload: Event<BeforeAuxiliaryWindowUnloadEvent>;
    readonly onUnload: Event<void>;
    readonly whenStylesHaveLoaded: Promise<void>;
    readonly window: CodeWindow;
    readonly container: HTMLElement;
    layout(): void;
    createState(): IAuxiliaryWindowOpenOptions;
}
export declare class AuxiliaryWindow extends BaseWindow implements IAuxiliaryWindow {
    readonly window: CodeWindow;
    readonly container: HTMLElement;
    private readonly configurationService;
    private readonly _onWillLayout;
    readonly onWillLayout: any;
    private readonly _onDidLayout;
    readonly onDidLayout: any;
    private readonly _onBeforeUnload;
    readonly onBeforeUnload: any;
    private readonly _onUnload;
    readonly onUnload: any;
    private readonly _onWillDispose;
    readonly onWillDispose: any;
    readonly whenStylesHaveLoaded: Promise<void>;
    constructor(window: CodeWindow, container: HTMLElement, stylesHaveLoaded: Barrier, configurationService: IConfigurationService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    private registerListeners;
    private handleBeforeUnload;
    protected handleVetoBeforeClose(e: BeforeUnloadEvent, reason: string): void;
    protected preventUnload(e: BeforeUnloadEvent): void;
    protected confirmBeforeClose(e: BeforeUnloadEvent): void;
    private handleUnload;
    layout(): void;
    createState(): IAuxiliaryWindowOpenOptions;
    dispose(): void;
}
export declare class BrowserAuxiliaryWindowService extends Disposable implements IAuxiliaryWindowService {
    private readonly layoutService;
    protected readonly dialogService: IDialogService;
    protected readonly configurationService: IConfigurationService;
    private readonly telemetryService;
    protected readonly hostService: IHostService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    readonly _serviceBrand: undefined;
    private static readonly DEFAULT_SIZE;
    private static WINDOW_IDS;
    private readonly _onDidOpenAuxiliaryWindow;
    readonly onDidOpenAuxiliaryWindow: any;
    private readonly windows;
    constructor(layoutService: IWorkbenchLayoutService, dialogService: IDialogService, configurationService: IConfigurationService, telemetryService: ITelemetryService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    open(options?: IAuxiliaryWindowOpenOptions): Promise<IAuxiliaryWindow>;
    protected createAuxiliaryWindow(targetWindow: CodeWindow, container: HTMLElement, stylesLoaded: Barrier): AuxiliaryWindow;
    private openWindow;
    protected resolveWindowId(auxiliaryWindow: Window): Promise<number>;
    protected createContainer(auxiliaryWindow: CodeWindow, disposables: DisposableStore, options?: IAuxiliaryWindowOpenOptions): {
        stylesLoaded: Barrier;
        container: HTMLElement;
    };
    private applyMeta;
    private applyCSS;
    private applyHTML;
    getWindow(windowId: number): IAuxiliaryWindow | undefined;
}
