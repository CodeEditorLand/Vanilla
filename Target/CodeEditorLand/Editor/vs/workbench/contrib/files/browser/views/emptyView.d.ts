import { ILocalizedString } from "../../../../../platform/action/common/action.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { ViewPane } from "../../../../browser/parts/views/viewPane.js";
import { IViewletViewOptions } from "../../../../browser/parts/views/viewsViewlet.js";
import { IViewDescriptorService } from "../../../../common/views.js";
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
