import { ILocalizedString } from "vs/platform/action/common/action";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILabelService } from "vs/platform/label/common/label";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewletViewOptions } from "vs/workbench/browser/parts/views/viewsViewlet";
import { IViewDescriptorService } from "vs/workbench/common/views";
export declare class EmptyView extends ViewPane {
    private readonly contextService;
    private labelService;
    static readonly ID: string;
    static readonly NAME: ILocalizedString;
    private _disposed;
    constructor(options: IViewletViewOptions, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, labelService: ILabelService, contextKeyService: IContextKeyService, openerService: IOpenerService, telemetryService: ITelemetryService, hoverService: IHoverService);
    shouldShowWelcome(): boolean;
    protected renderBody(container: HTMLElement): void;
    private refreshTitle;
    dispose(): void;
}
