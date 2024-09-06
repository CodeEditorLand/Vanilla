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
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IPathService } from "vs/workbench/services/path/common/pathService";
export declare class LoadedScriptsView extends ViewPane {
    private readonly editorService;
    private readonly contextService;
    private readonly debugService;
    private readonly labelService;
    private readonly pathService;
    private treeContainer;
    private loadedScriptsItemType;
    private tree;
    private treeLabels;
    private changeScheduler;
    private treeNeedsRefreshOnVisible;
    private filter;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, editorService: IEditorService, contextKeyService: IContextKeyService, contextService: IWorkspaceContextService, debugService: IDebugService, labelService: ILabelService, pathService: IPathService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService);
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    collapseAll(): void;
    dispose(): void;
}