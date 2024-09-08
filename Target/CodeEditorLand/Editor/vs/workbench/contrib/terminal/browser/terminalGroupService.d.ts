import type { Orientation } from "../../../../base/browser/ui/sash/sash.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import type { IShellLaunchConfig } from "../../../../platform/terminal/common/terminal.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import type { ITerminalGroup, ITerminalGroupService, ITerminalInstance } from "./terminal.js";
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
    readonly onDidChangeActiveGroup: Event<ITerminalGroup | undefined>;
    private readonly _onDidDisposeGroup;
    readonly onDidDisposeGroup: Event<ITerminalGroup>;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: Event<void>;
    private readonly _onDidShow;
    readonly onDidShow: Event<void>;
    private readonly _onDidDisposeInstance;
    readonly onDidDisposeInstance: Event<ITerminalInstance>;
    private readonly _onDidFocusInstance;
    readonly onDidFocusInstance: Event<ITerminalInstance>;
    private readonly _onDidChangeActiveInstance;
    readonly onDidChangeActiveInstance: Event<ITerminalInstance | undefined>;
    private readonly _onDidChangeInstances;
    readonly onDidChangeInstances: Event<void>;
    private readonly _onDidChangeInstanceCapability;
    readonly onDidChangeInstanceCapability: Event<ITerminalInstance>;
    private readonly _onDidChangePanelOrientation;
    readonly onDidChangePanelOrientation: Event<Orientation>;
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
