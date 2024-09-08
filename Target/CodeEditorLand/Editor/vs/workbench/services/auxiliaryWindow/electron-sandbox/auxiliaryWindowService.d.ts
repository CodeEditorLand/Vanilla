import type { CodeWindow } from "../../../../base/browser/window.js";
import type { Barrier } from "../../../../base/common/async.js";
import type { DisposableStore } from "../../../../base/common/lifecycle.js";
import type { ISandboxGlobals } from "../../../../base/parts/sandbox/electron-sandbox/globals.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IHostService } from "../../host/browser/host.js";
import { IWorkbenchLayoutService } from "../../layout/browser/layoutService.js";
import { AuxiliaryWindow, BrowserAuxiliaryWindowService, type IAuxiliaryWindowOpenOptions } from "../browser/auxiliaryWindowService.js";
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
    protected createContainer(auxiliaryWindow: NativeCodeWindow, disposables: DisposableStore, options?: IAuxiliaryWindowOpenOptions): {
        stylesLoaded: Barrier;
        container: HTMLElement;
    };
    protected createAuxiliaryWindow(targetWindow: CodeWindow, container: HTMLElement, stylesHaveLoaded: Barrier): AuxiliaryWindow;
}
export {};
