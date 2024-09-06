import "vs/css!./media/scm";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { ISCMViewService } from "vs/workbench/contrib/scm/common/scm";
export declare class SCMRepositoriesViewPane extends ViewPane {
    protected scmViewService: ISCMViewService;
    private list;
    private readonly disposables;
    constructor(options: IViewPaneOptions, scmViewService: ISCMViewService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService);
    protected renderBody(container: HTMLElement): void;
    private onDidChangeRepositories;
    focus(): void;
    protected layoutBody(height: number, width: number): void;
    private updateBodySize;
    private onListContextMenu;
    private onListSelectionChange;
    private updateListSelection;
    dispose(): void;
}
