import "vs/css!./media/scm";
import { IActionViewItemProvider } from "vs/base/browser/ui/actionbar/actionbar";
import { CountBadge } from "vs/base/browser/ui/countBadge/countBadge";
import { IManagedHover } from "vs/base/browser/ui/hover/hover";
import { IListRenderer } from "vs/base/browser/ui/list/list";
import { ICompressibleTreeRenderer } from "vs/base/browser/ui/tree/objectTree";
import { ITreeNode } from "vs/base/browser/ui/tree/tree";
import { ActionRunner, IAction } from "vs/base/common/actions";
import { FuzzyScore } from "vs/base/common/filters";
import { DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { WorkbenchToolBar } from "vs/platform/actions/browser/toolbar";
import { IMenuService, MenuId } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { ISCMProvider, ISCMRepository, ISCMViewService } from "vs/workbench/contrib/scm/common/scm";
export declare class RepositoryActionRunner extends ActionRunner {
    private readonly getSelectedRepositories;
    constructor(getSelectedRepositories: () => ISCMRepository[]);
    protected runAction(action: IAction, context: ISCMProvider): Promise<void>;
}
interface RepositoryTemplate {
    readonly label: HTMLElement;
    readonly labelCustomHover: IManagedHover;
    readonly name: HTMLElement;
    readonly description: HTMLElement;
    readonly countContainer: HTMLElement;
    readonly count: CountBadge;
    readonly toolBar: WorkbenchToolBar;
    readonly elementDisposables: DisposableStore;
    readonly templateDisposable: IDisposable;
}
export declare class RepositoryRenderer implements ICompressibleTreeRenderer<ISCMRepository, FuzzyScore, RepositoryTemplate>, IListRenderer<ISCMRepository, RepositoryTemplate> {
    private readonly toolbarMenuId;
    private readonly actionViewItemProvider;
    private commandService;
    private contextKeyService;
    private contextMenuService;
    private hoverService;
    private keybindingService;
    private menuService;
    private scmViewService;
    private telemetryService;
    static readonly TEMPLATE_ID = "repository";
    get templateId(): string;
    constructor(toolbarMenuId: MenuId, actionViewItemProvider: IActionViewItemProvider, commandService: ICommandService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, hoverService: IHoverService, keybindingService: IKeybindingService, menuService: IMenuService, scmViewService: ISCMViewService, telemetryService: ITelemetryService);
    renderTemplate(container: HTMLElement): RepositoryTemplate;
    renderElement(arg: ISCMRepository | ITreeNode<ISCMRepository, FuzzyScore>, index: number, templateData: RepositoryTemplate, height: number | undefined): void;
    renderCompressedElements(): void;
    disposeElement(group: ISCMRepository | ITreeNode<ISCMRepository, FuzzyScore>, index: number, template: RepositoryTemplate): void;
    disposeTemplate(templateData: RepositoryTemplate): void;
}
export {};
