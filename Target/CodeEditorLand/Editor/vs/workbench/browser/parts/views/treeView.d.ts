import { type IDragAndDropData } from "../../../../base/browser/dnd.js";
import type { ListViewTargetSector } from "../../../../base/browser/ui/list/listView.js";
import { type ITreeDragAndDrop, type ITreeDragOverReaction } from "../../../../base/browser/ui/tree/tree.js";
import { ActionRunner, type IAction } from "../../../../base/common/actions.js";
import { Event } from "../../../../base/common/event.js";
import { type IMarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import "./media/views.css";
import { ITreeViewsDnDService } from "../../../../editor/common/services/treeViewsDndService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { type ITreeItem, type ITreeView, type ITreeViewDataProvider, type ITreeViewDragAndDropController, type IViewBadge, IViewDescriptorService, type TreeViewItemHandleArg, type TreeViewPaneHandleArg, type ViewContainer, type ViewContainerLocation } from "../../../common/views.js";
import { IAccessibleViewInformationService } from "../../../services/accessibility/common/accessibleViewInformationService.js";
import { IActivityService } from "../../../services/activity/common/activity.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ViewPane } from "./viewPane.js";
import type { IViewletViewOptions } from "./viewsViewlet.js";
export declare class TreeViewPane extends ViewPane {
    protected readonly treeView: ITreeView;
    private _container;
    private _actionRunner;
    constructor(options: IViewletViewOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, notificationService: INotificationService, hoverService: IHoverService, accessibleViewService: IAccessibleViewInformationService);
    focus(): void;
    protected renderBody(container: HTMLElement): void;
    shouldShowWelcome(): boolean;
    protected layoutBody(height: number, width: number): void;
    getOptimalWidth(): number;
    protected renderTreeView(container: HTMLElement): void;
    protected layoutTreeView(height: number, width: number): void;
    private updateTreeVisibility;
    getActionRunner(): MultipleSelectionActionRunner;
    getActionsContext(): TreeViewPaneHandleArg;
}
export declare const RawCustomTreeViewContextKey: RawContextKey<boolean>;
declare abstract class AbstractTreeView extends Disposable implements ITreeView {
    readonly id: string;
    private _title;
    private readonly themeService;
    private readonly instantiationService;
    private readonly commandService;
    private readonly configurationService;
    protected readonly progressService: IProgressService;
    private readonly contextMenuService;
    private readonly keybindingService;
    private readonly notificationService;
    private readonly viewDescriptorService;
    private readonly hoverService;
    private readonly contextKeyService;
    private readonly activityService;
    private readonly logService;
    private readonly openerService;
    private isVisible;
    private _hasIconForParentNode;
    private _hasIconForLeafNode;
    private collapseAllContextKey;
    private collapseAllContext;
    private collapseAllToggleContextKey;
    private collapseAllToggleContext;
    private refreshContextKey;
    private refreshContext;
    private focused;
    private domNode;
    private treeContainer;
    private _messageValue;
    private _canSelectMany;
    private _manuallyManageCheckboxes;
    private messageElement;
    private tree;
    private treeLabels;
    private treeViewDnd;
    private _container;
    private root;
    private markdownRenderer;
    private elementsToRefresh;
    private lastSelection;
    private lastActive;
    private readonly _onDidExpandItem;
    readonly onDidExpandItem: Event<ITreeItem>;
    private readonly _onDidCollapseItem;
    readonly onDidCollapseItem: Event<ITreeItem>;
    private _onDidChangeSelectionAndFocus;
    readonly onDidChangeSelectionAndFocus: Event<{
        selection: readonly ITreeItem[];
        focus: ITreeItem;
    }>;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<boolean>;
    private readonly _onDidChangeActions;
    readonly onDidChangeActions: Event<void>;
    private readonly _onDidChangeWelcomeState;
    readonly onDidChangeWelcomeState: Event<void>;
    private readonly _onDidChangeTitle;
    readonly onDidChangeTitle: Event<string>;
    private readonly _onDidChangeDescription;
    readonly onDidChangeDescription: Event<string | undefined>;
    private readonly _onDidChangeCheckboxState;
    readonly onDidChangeCheckboxState: Event<readonly ITreeItem[]>;
    private readonly _onDidCompleteRefresh;
    constructor(id: string, _title: string, themeService: IThemeService, instantiationService: IInstantiationService, commandService: ICommandService, configurationService: IConfigurationService, progressService: IProgressService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, viewDescriptorService: IViewDescriptorService, hoverService: IHoverService, contextKeyService: IContextKeyService, activityService: IActivityService, logService: ILogService, openerService: IOpenerService);
    private _isInitialized;
    private initialize;
    get viewContainer(): ViewContainer;
    get viewLocation(): ViewContainerLocation;
    private _dragAndDropController;
    get dragAndDropController(): ITreeViewDragAndDropController | undefined;
    set dragAndDropController(dnd: ITreeViewDragAndDropController | undefined);
    private _dataProvider;
    get dataProvider(): ITreeViewDataProvider | undefined;
    set dataProvider(dataProvider: ITreeViewDataProvider | undefined);
    private _message;
    get message(): string | IMarkdownString | undefined;
    set message(message: string | IMarkdownString | undefined);
    get title(): string;
    set title(name: string);
    private _description;
    get description(): string | undefined;
    set description(description: string | undefined);
    private _badge;
    private readonly _activity;
    get badge(): IViewBadge | undefined;
    set badge(badge: IViewBadge | undefined);
    get canSelectMany(): boolean;
    set canSelectMany(canSelectMany: boolean);
    get manuallyManageCheckboxes(): boolean;
    set manuallyManageCheckboxes(manuallyManageCheckboxes: boolean);
    get hasIconForParentNode(): boolean;
    get hasIconForLeafNode(): boolean;
    get visible(): boolean;
    private initializeShowCollapseAllAction;
    get showCollapseAllAction(): boolean;
    set showCollapseAllAction(showCollapseAllAction: boolean);
    private initializeShowRefreshAction;
    get showRefreshAction(): boolean;
    set showRefreshAction(showRefreshAction: boolean);
    private registerActions;
    setVisibility(isVisible: boolean): void;
    protected activated: boolean;
    protected abstract activate(): void;
    focus(reveal?: boolean, revealItem?: ITreeItem): void;
    show(container: HTMLElement): void;
    private create;
    private readonly treeDisposables;
    protected createTree(): void;
    private resolveCommand;
    private onContextMenu;
    protected updateMessage(): void;
    private processMessage;
    private showMessage;
    private hideMessage;
    private resetMessageElement;
    private _height;
    private _width;
    layout(height: number, width: number): void;
    getOptimalWidth(): number;
    refresh(elements?: readonly ITreeItem[]): Promise<void>;
    expand(itemOrItems: ITreeItem | ITreeItem[]): Promise<void>;
    isCollapsed(item: ITreeItem): boolean;
    setSelection(items: ITreeItem[]): void;
    getSelection(): ITreeItem[];
    setFocus(item?: ITreeItem): void;
    reveal(item: ITreeItem): Promise<void>;
    private refreshing;
    private doRefresh;
    private initializeCollapseAllToggle;
    private updateCollapseAllToggle;
    private updateContentAreas;
    get container(): HTMLElement | undefined;
}
declare class MultipleSelectionActionRunner extends ActionRunner {
    private getSelectedResources;
    constructor(notificationService: INotificationService, getSelectedResources: () => ITreeItem[]);
    protected runAction(action: IAction, context: TreeViewItemHandleArg | TreeViewPaneHandleArg): Promise<void>;
}
export declare class CustomTreeView extends AbstractTreeView {
    private readonly extensionId;
    private readonly extensionService;
    private readonly telemetryService;
    constructor(id: string, title: string, extensionId: string, themeService: IThemeService, instantiationService: IInstantiationService, commandService: ICommandService, configurationService: IConfigurationService, progressService: IProgressService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, notificationService: INotificationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, hoverService: IHoverService, extensionService: IExtensionService, activityService: IActivityService, telemetryService: ITelemetryService, logService: ILogService, openerService: IOpenerService);
    protected activate(): void;
}
export declare class TreeView extends AbstractTreeView {
    protected activate(): void;
}
export declare class CustomTreeViewDragAndDrop implements ITreeDragAndDrop<ITreeItem> {
    private readonly treeId;
    private readonly labelService;
    private readonly instantiationService;
    private readonly treeViewsDragAndDropService;
    private readonly logService;
    private readonly treeMimeType;
    private readonly treeItemsTransfer;
    private dragCancellationToken;
    constructor(treeId: string, labelService: ILabelService, instantiationService: IInstantiationService, treeViewsDragAndDropService: ITreeViewsDnDService, logService: ILogService);
    private dndController;
    set controller(controller: ITreeViewDragAndDropController | undefined);
    private handleDragAndLog;
    private addExtensionProvidedTransferTypes;
    private addResourceInfoToTransfer;
    onDragStart(data: IDragAndDropData, originalEvent: DragEvent): void;
    private debugLog;
    onDragOver(data: IDragAndDropData, targetElement: ITreeItem, targetIndex: number, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): boolean | ITreeDragOverReaction;
    getDragURI(element: ITreeItem): string | null;
    getDragLabel?(elements: ITreeItem[]): string | undefined;
    drop(data: IDragAndDropData, targetNode: ITreeItem | undefined, targetIndex: number | undefined, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): Promise<void>;
    onDragEnd(originalEvent: DragEvent): void;
    dispose(): void;
}
export {};
