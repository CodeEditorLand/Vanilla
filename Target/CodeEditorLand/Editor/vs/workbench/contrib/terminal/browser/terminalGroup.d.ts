import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IShellLaunchConfig, ITerminalTabLayoutInfoById } from "vs/platform/terminal/common/terminal";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { Direction, ITerminalConfigurationService, ITerminalGroup, ITerminalInstance, ITerminalInstanceService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare class TerminalGroup extends Disposable implements ITerminalGroup {
    private _container;
    private readonly _terminalConfigurationService;
    private readonly _terminalInstanceService;
    private readonly _layoutService;
    private readonly _viewDescriptorService;
    private readonly _instantiationService;
    private _terminalInstances;
    private _splitPaneContainer;
    private _groupElement;
    private _panelPosition;
    private _terminalLocation;
    private _instanceDisposables;
    private _activeInstanceIndex;
    get terminalInstances(): ITerminalInstance[];
    private _initialRelativeSizes;
    private _visible;
    private readonly _onDidDisposeInstance;
    readonly onDidDisposeInstance: any;
    private readonly _onDidFocusInstance;
    readonly onDidFocusInstance: any;
    private readonly _onDidChangeInstanceCapability;
    readonly onDidChangeInstanceCapability: any;
    private readonly _onDisposed;
    readonly onDisposed: any;
    private readonly _onInstancesChanged;
    readonly onInstancesChanged: any;
    private readonly _onDidChangeActiveInstance;
    readonly onDidChangeActiveInstance: any;
    private readonly _onPanelOrientationChanged;
    readonly onPanelOrientationChanged: any;
    constructor(_container: HTMLElement | undefined, shellLaunchConfigOrInstance: IShellLaunchConfig | ITerminalInstance | undefined, _terminalConfigurationService: ITerminalConfigurationService, _terminalInstanceService: ITerminalInstanceService, _layoutService: IWorkbenchLayoutService, _viewDescriptorService: IViewDescriptorService, _instantiationService: IInstantiationService);
    addInstance(shellLaunchConfigOrInstance: IShellLaunchConfig | ITerminalInstance, parentTerminalId?: number): void;
    dispose(): void;
    get activeInstance(): ITerminalInstance | undefined;
    getLayoutInfo(isActive: boolean): ITerminalTabLayoutInfoById;
    private _initInstanceListeners;
    private _handleOnDidDisposeInstance;
    removeInstance(instance: ITerminalInstance): void;
    private _removeInstance;
    moveInstance(instances: ITerminalInstance | ITerminalInstance[], index: number, position: "before" | "after"): void;
    private _setActiveInstance;
    private _getIndexFromId;
    setActiveInstanceByIndex(index: number, force?: boolean): void;
    attachToElement(element: HTMLElement): void;
    get title(): string;
    private _getBellTitle;
    setVisible(visible: boolean): void;
    split(shellLaunchConfig: IShellLaunchConfig): ITerminalInstance;
    addDisposable(disposable: IDisposable): void;
    layout(width: number, height: number): void;
    focusPreviousPane(): void;
    focusNextPane(): void;
    private _getPosition;
    private _getOrientation;
    resizePane(direction: Direction): void;
    resizePanes(relativeSizes: number[]): void;
}