import "./media/scm.css";
import type { IActionViewItemProvider } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { CountBadge } from "../../../../base/browser/ui/countBadge/countBadge.js";
import type { IManagedHover } from "../../../../base/browser/ui/hover/hover.js";
import type { IListRenderer } from "../../../../base/browser/ui/list/list.js";
import type { ICompressibleTreeRenderer } from "../../../../base/browser/ui/tree/objectTree.js";
import type { ITreeNode } from "../../../../base/browser/ui/tree/tree.js";
import { ActionRunner, type IAction } from "../../../../base/common/actions.js";
import type { FuzzyScore } from "../../../../base/common/filters.js";
import { DisposableStore, type IDisposable } from "../../../../base/common/lifecycle.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ISCMViewService, type ISCMProvider, type ISCMRepository } from "../common/scm.js";
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
