import "vs/css!./media/tunnelView";
import { Event } from "vs/base/common/event";
import { ILocalizedString } from "vs/platform/action/common/action";
import { IMenuService } from "vs/platform/actions/common/actions";
import { ICommandHandler, ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService, IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { SyncDescriptor } from "vs/platform/instantiation/common/descriptors";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { TunnelPrivacy } from "vs/platform/remote/common/remoteAuthorityResolver";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ITunnelService, TunnelPrivacyId, TunnelProtocol } from "vs/platform/tunnel/common/tunnel";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewDescriptor, IViewDescriptorService } from "vs/workbench/common/views";
import { IExternalUriOpenerService } from "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IRemoteExplorerService, ITunnelItem, TunnelType } from "vs/workbench/services/remote/common/remoteExplorerService";
import { Tunnel, TunnelModel, TunnelSource } from "vs/workbench/services/remote/common/tunnelModel";
export declare const openPreviewEnabledContext: any;
interface ITunnelViewModel {
    readonly onForwardedPortsChanged: Event<void>;
    readonly all: TunnelItem[];
    readonly input: TunnelItem;
    isEmpty(): boolean;
}
export declare class TunnelViewModel implements ITunnelViewModel {
    private readonly remoteExplorerService;
    private readonly tunnelService;
    readonly onForwardedPortsChanged: Event<void>;
    private model;
    private _candidates;
    readonly input: {
        label: any;
        icon: undefined;
        tunnelType: any;
        hasRunningProcess: boolean;
        remoteHost: string;
        remotePort: number;
        processDescription: string;
        tooltipPostfix: string;
        iconTooltip: string;
        portTooltip: string;
        processTooltip: string;
        originTooltip: string;
        privacyTooltip: string;
        source: {
            source: any;
            description: string;
        };
        protocol: any;
        privacy: {
            id: any;
            themeIcon: any;
            label: any;
        };
        strip: () => undefined;
    };
    constructor(remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService);
    get all(): TunnelItem[];
    private addProcessInfoFromCandidate;
    private get forwarded();
    private get detected();
    isEmpty(): boolean;
}
declare class TunnelItem implements ITunnelItem {
    tunnelType: TunnelType;
    remoteHost: string;
    remotePort: number;
    source: {
        source: TunnelSource;
        description: string;
    };
    hasRunningProcess: boolean;
    protocol: TunnelProtocol;
    localUri?: any;
    localAddress?: string | undefined;
    localPort?: number | undefined;
    closeable?: boolean | undefined;
    name?: string | undefined;
    private runningProcess?;
    private pid?;
    private _privacy?;
    private remoteExplorerService?;
    private tunnelService?;
    static createFromTunnel(remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService, tunnel: Tunnel, type?: TunnelType, closeable?: boolean): TunnelItem;
    /**
     * Removes all non-serializable properties from the tunnel
     * @returns A new TunnelItem without any services
     */
    strip(): TunnelItem | undefined;
    constructor(tunnelType: TunnelType, remoteHost: string, remotePort: number, source: {
        source: TunnelSource;
        description: string;
    }, hasRunningProcess: boolean, protocol: TunnelProtocol, localUri?: any, localAddress?: string | undefined, localPort?: number | undefined, closeable?: boolean | undefined, name?: string | undefined, runningProcess?: string | undefined, pid?: number | undefined, _privacy?: TunnelPrivacyId | string, remoteExplorerService?: any, tunnelService?: any);
    get label(): string;
    set processDescription(description: string | undefined);
    get processDescription(): string | undefined;
    get tooltipPostfix(): string;
    get iconTooltip(): string;
    get portTooltip(): string;
    get processTooltip(): string;
    get originTooltip(): string;
    get privacy(): TunnelPrivacy;
}
export declare class TunnelPanel extends ViewPane {
    protected viewModel: ITunnelViewModel;
    protected quickInputService: IQuickInputService;
    protected commandService: ICommandService;
    private readonly menuService;
    private readonly remoteExplorerService;
    private readonly tunnelService;
    private readonly contextViewService;
    static readonly ID: any;
    static readonly TITLE: ILocalizedString;
    private panelContainer;
    private table;
    private readonly tableDisposables;
    private tunnelTypeContext;
    private tunnelCloseableContext;
    private tunnelPrivacyContext;
    private tunnelPrivacyEnabledContext;
    private tunnelProtocolContext;
    private tunnelViewFocusContext;
    private tunnelViewSelectionContext;
    private tunnelViewMultiSelectionContext;
    private portChangableContextKey;
    private protocolChangableContextKey;
    private isEditing;
    private titleActions;
    private lastFocus;
    constructor(viewModel: ITunnelViewModel, options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, quickInputService: IQuickInputService, commandService: ICommandService, menuService: IMenuService, themeService: IThemeService, remoteExplorerService: IRemoteExplorerService, telemetryService: ITelemetryService, hoverService: IHoverService, tunnelService: ITunnelService, contextViewService: IContextViewService);
    private registerPrivacyActions;
    get portCount(): number;
    private createTable;
    protected renderBody(container: HTMLElement): void;
    shouldShowWelcome(): boolean;
    focus(): void;
    private onFocusChanged;
    private hasOpenLinkModifier;
    private onSelectionChanged;
    private onContextMenu;
    private onMouseDblClick;
    private height;
    private width;
    protected layoutBody(height: number, width: number): void;
}
export declare class TunnelPanelDescriptor implements IViewDescriptor {
    readonly id: any;
    readonly name: ILocalizedString;
    readonly ctorDescriptor: SyncDescriptor<TunnelPanel>;
    readonly canToggleVisibility = true;
    readonly hideByDefault = false;
    readonly group = "details@0";
    readonly order = -500;
    readonly remoteAuthority?: string | string[];
    readonly canMoveView = true;
    readonly containerIcon: any;
    constructor(viewModel: ITunnelViewModel, environmentService: IWorkbenchEnvironmentService);
}
export declare namespace ForwardPortAction {
    const INLINE_ID = "remote.tunnel.forwardInline";
    const COMMANDPALETTE_ID = "remote.tunnel.forwardCommandPalette";
    const LABEL: ILocalizedString;
    const TREEITEM_LABEL: any;
    function inlineHandler(): ICommandHandler;
    function commandPaletteHandler(): ICommandHandler;
}
export declare namespace OpenPortInBrowserAction {
    const ID = "remote.tunnel.open";
    const LABEL: any;
    function handler(): ICommandHandler;
    function run(model: TunnelModel, openerService: IOpenerService, key: string): any;
}
export declare namespace OpenPortInPreviewAction {
    const ID = "remote.tunnel.openPreview";
    const LABEL: any;
    function handler(): ICommandHandler;
    function run(model: TunnelModel, openerService: IOpenerService, externalOpenerService: IExternalUriOpenerService, key: string): Promise<any>;
}
export {};
