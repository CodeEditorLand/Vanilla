import { CodeWindow } from "vs/base/browser/window";
import { Barrier } from "vs/base/common/async";
import { DisposableStore } from "vs/base/common/lifecycle";
import { ISandboxGlobals } from "vs/base/parts/sandbox/electron-sandbox/globals";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INativeHostService } from "vs/platform/native/common/native";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { AuxiliaryWindow, BrowserAuxiliaryWindowService, IAuxiliaryWindowOpenOptions } from "vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
type NativeCodeWindow = CodeWindow & {
    readonly vscode: ISandboxGlobals;
};
export declare class NativeAuxiliaryWindow extends AuxiliaryWindow {
    private readonly nativeHostService;
    private readonly instantiationService;
    private readonly dialogService;
    private skipUnloadConfirmation;
    private maximized;
    constructor(window: CodeWindow, container: HTMLElement, stylesHaveLoaded: Barrier, configurationService: IConfigurationService, nativeHostService: INativeHostService, instantiationService: IInstantiationService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService, dialogService: IDialogService);
    private handleMaximizedState;
    private handleFullScreenState;
    protected handleVetoBeforeClose(e: BeforeUnloadEvent, veto: string): Promise<void>;
    protected confirmBeforeClose(e: BeforeUnloadEvent): Promise<void>;
    protected preventUnload(e: BeforeUnloadEvent): void;
    createState(): IAuxiliaryWindowOpenOptions;
}
export declare class NativeAuxiliaryWindowService extends BrowserAuxiliaryWindowService {
    private readonly nativeHostService;
    private readonly instantiationService;
    constructor(layoutService: IWorkbenchLayoutService, configurationService: IConfigurationService, nativeHostService: INativeHostService, dialogService: IDialogService, instantiationService: IInstantiationService, telemetryService: ITelemetryService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    protected resolveWindowId(auxiliaryWindow: NativeCodeWindow): Promise<number>;
    protected createContainer(auxiliaryWindow: NativeCodeWindow, disposables: DisposableStore, options?: IAuxiliaryWindowOpenOptions): any;
    protected createAuxiliaryWindow(targetWindow: CodeWindow, container: HTMLElement, stylesHaveLoaded: Barrier): AuxiliaryWindow;
}
export {};
