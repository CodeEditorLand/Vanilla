import { ActionBar } from "vs/base/browser/ui/actionbar/actionbar";
import { IHighlight } from "vs/base/browser/ui/highlightedlabel/highlightedLabel";
import { AsyncDataTree } from "vs/base/browser/ui/tree/asyncDataTree";
import { ITreeContextMenuEvent, ITreeNode } from "vs/base/browser/ui/tree/tree";
import { FuzzyScore } from "vs/base/common/filters";
import { IDisposable } from "vs/base/common/lifecycle";
import { IMenuService, MenuId } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService, IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewletViewOptions } from "vs/workbench/browser/parts/views/viewsViewlet";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { AbstractExpressionsRenderer, IExpressionTemplateData, IInputBoxOptions } from "vs/workbench/contrib/debug/browser/baseDebugView";
import { LinkDetector } from "vs/workbench/contrib/debug/browser/linkDetector";
import { IDebugService, IExpression, IScope, IViewModel } from "vs/workbench/contrib/debug/common/debug";
import { IDebugVisualizerService } from "vs/workbench/contrib/debug/common/debugVisualizers";
export declare class VariablesView extends ViewPane {
    private readonly debugService;
    private readonly menuService;
    private updateTreeScheduler;
    private needsRefresh;
    private tree;
    private savedViewState;
    private autoExpandedScopes;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, debugService: IDebugService, keybindingService: IKeybindingService, configurationService: IConfigurationService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, menuService: IMenuService);
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(width: number, height: number): void;
    focus(): void;
    collapseAll(): void;
    private onMouseDblClick;
    private canSetExpressionValue;
    private onContextMenu;
}
export declare function openContextMenuForVariableTreeElement(parentContextKeyService: IContextKeyService, menuService: IMenuService, contextMenuService: IContextMenuService, menuId: MenuId, e: ITreeContextMenuEvent<IExpression | IScope>): Promise<void>;
export declare class VisualizedVariableRenderer extends AbstractExpressionsRenderer {
    private readonly linkDetector;
    private readonly menuService;
    private readonly contextKeyService;
    static readonly ID = "viz";
    /**
     * Registers a helper that rerenders the tree when visualization is requested
     * or cancelled./
     */
    static rendererOnVisualizationRange(model: IViewModel, tree: AsyncDataTree<any, any, any>): IDisposable;
    constructor(linkDetector: LinkDetector, debugService: IDebugService, contextViewService: IContextViewService, hoverService: IHoverService, menuService: IMenuService, contextKeyService: IContextKeyService);
    get templateId(): string;
    renderElement(node: ITreeNode<IExpression, FuzzyScore>, index: number, data: IExpressionTemplateData): void;
    protected renderExpression(expression: IExpression, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    protected getInputBoxOptions(expression: IExpression): IInputBoxOptions | undefined;
    protected renderActionBar(actionBar: ActionBar, expression: IExpression, _data: IExpressionTemplateData): void;
}
export declare class VariablesRenderer extends AbstractExpressionsRenderer {
    private readonly linkDetector;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly visualization;
    private readonly contextMenuService;
    private readonly commandService;
    private configurationService;
    static readonly ID = "variable";
    constructor(linkDetector: LinkDetector, menuService: IMenuService, contextKeyService: IContextKeyService, visualization: IDebugVisualizerService, contextMenuService: IContextMenuService, commandService: ICommandService, debugService: IDebugService, contextViewService: IContextViewService, hoverService: IHoverService, configurationService: IConfigurationService);
    get templateId(): string;
    protected renderExpression(expression: IExpression, data: IExpressionTemplateData, highlights: IHighlight[]): void;
    renderElement(node: ITreeNode<IExpression, FuzzyScore>, index: number, data: IExpressionTemplateData): void;
    protected getInputBoxOptions(expression: IExpression): IInputBoxOptions;
    protected renderActionBar(actionBar: ActionBar, expression: IExpression, data: IExpressionTemplateData): void;
    private pickVisualizer;
    private useVisualizer;
}
export declare const SET_VARIABLE_ID = "debug.setVariable";
export declare const VIEW_MEMORY_ID = "workbench.debug.viewlet.action.viewMemory";
export declare const BREAK_WHEN_VALUE_CHANGES_ID = "debug.breakWhenValueChanges";
export declare const BREAK_WHEN_VALUE_IS_ACCESSED_ID = "debug.breakWhenValueIsAccessed";
export declare const BREAK_WHEN_VALUE_IS_READ_ID = "debug.breakWhenValueIsRead";
