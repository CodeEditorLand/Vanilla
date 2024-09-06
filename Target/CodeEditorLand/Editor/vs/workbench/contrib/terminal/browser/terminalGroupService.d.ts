import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IShellLaunchConfig } from "vs/platform/terminal/common/terminal";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { ITerminalGroup, ITerminalGroupService, ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare class TerminalGroupService extends Disposable implements ITerminalGroupService {
    private _contextKeyService;
    private readonly _instantiationService;
    private readonly _viewsService;
    private readonly _viewDescriptorService;
    private readonly _quickInputService;
    _serviceBrand: undefined;
    groups: ITerminalGroup[];
    activeGroupIndex: number;
    get instances(): ITerminalInstance[];
    lastAccessedMenu: "inline-tab" | "tab-list";
    private _terminalGroupCountContextKey;
    private _container;
    private _isQuickInputOpened;
    private readonly _onDidChangeActiveGroup;
    readonly onDidChangeActiveGroup: any;
    private readonly _onDidDisposeGroup;
    readonly onDidDisposeGroup: any;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: any;
    private readonly _onDidShow;
    readonly onDidShow: any;
    private readonly _onDidDisposeInstance;
    readonly onDidDisposeInstance: any;
    private readonly _onDidFocusInstance;
    readonly onDidFocusInstance: any;
    private readonly _onDidChangeActiveInstance;
    readonly onDidChangeActiveInstance: any;
    private readonly _onDidChangeInstances;
    readonly onDidChangeInstances: any;
    private readonly _onDidChangeInstanceCapability;
    readonly onDidChangeInstanceCapability: any;
    private readonly _onDidChangePanelOrientation;
    readonly onDidChangePanelOrientation: any;
    constructor(_contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _viewsService: IViewsService, _viewDescriptorService: IViewDescriptorService, _quickInputService: IQuickInputService);
    hidePanel(): void;
    get activeGroup(): ITerminalGroup | undefined;
    set activeGroup(value: ITerminalGroup | undefined);
    get activeInstance(): ITerminalInstance | undefined;
    setActiveInstance(instance: ITerminalInstance): void;
    private _getIndexFromId;
    setContainer(container: HTMLElement): void;
    focusTabs(): Promise<void>;
    focusHover(): Promise<void>;
    focusInstance(_: ITerminalInstance): Promise<void>;
    focusActiveInstance(): Promise<void>;
    createGroup(slcOrInstance?: IShellLaunchConfig | ITerminalInstance): ITerminalGroup;
    showPanel(focus?: boolean): Promise<void>;
    getInstanceFromResource(resource: URI | undefined): ITerminalInstance | undefined;
    private _removeGroup;
    /**
     * @param force Whether to force the group change, this should be used when the previous active
     * group has been removed.
     */
    setActiveGroupByIndex(index: number, force?: boolean): void;
    private _getInstanceLocation;
    setActiveInstanceByIndex(index: number): void;
    setActiveGroupToNext(): void;
    setActiveGroupToPrevious(): void;
    private _getValidTerminalGroups;
    moveGroup(source: ITerminalInstance | ITerminalInstance[], target: ITerminalInstance): void;
    moveGroupToEnd(source: ITerminalInstance | ITerminalInstance[]): void;
    moveInstance(source: ITerminalInstance, target: ITerminalInstance, side: "before" | "after"): void;
    unsplitInstance(instance: ITerminalInstance): void;
    joinInstances(instances: ITerminalInstance[]): void;
    instanceIsSplit(instance: ITerminalInstance): boolean;
    getGroupForInstance(instance: ITerminalInstance): ITerminalGroup | undefined;
    getGroupLabels(): string[];
    /**
     * Visibility should be updated in the following cases:
     * 1. Toggle `TERMINAL_VIEW_ID` visibility
     * 2. Change active group
     * 3. Change instances in active group
     */
    updateVisibility(): void;
}
