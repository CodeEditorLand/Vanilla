import "vs/css!./media/scm";
import { IListAccessibilityProvider } from "vs/base/browser/ui/list/listWidget";
import { ICompressibleKeyboardNavigationLabelProvider, ICompressibleTreeRenderer } from "vs/base/browser/ui/tree/objectTree";
import { ITreeNode, ITreeSorter } from "vs/base/browser/ui/tree/tree";
import { FuzzyScore } from "vs/base/common/filters";
import { IDisposable } from "vs/base/common/lifecycle";
import { IResourceNode } from "vs/base/common/resourceTree";
import { IMenuService } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILabelService } from "vs/platform/label/common/label";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { SCMHistoryItemChangeTreeElement, SCMHistoryItemGroupTreeElement, SCMHistoryItemTreeElement, SCMHistoryItemViewModelTreeElement, SCMViewSeparatorElement } from "vs/workbench/contrib/scm/common/history";
import { ISCMActionButton, ISCMActionButtonDescriptor, ISCMInput, ISCMRepository, ISCMResource, ISCMResourceGroup, ISCMService, ISCMViewService } from "vs/workbench/contrib/scm/common/scm";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
type TreeElement = ISCMRepository | ISCMInput | ISCMActionButton | ISCMResourceGroup | ISCMResource | IResourceNode<ISCMResource, ISCMResourceGroup> | SCMHistoryItemGroupTreeElement | SCMHistoryItemTreeElement | SCMHistoryItemViewModelTreeElement | SCMHistoryItemChangeTreeElement | IResourceNode<SCMHistoryItemChangeTreeElement, SCMHistoryItemTreeElement> | SCMViewSeparatorElement;
interface ActionButtonTemplate {
    readonly actionButton: SCMActionButton;
    disposable: IDisposable;
    readonly templateDisposable: IDisposable;
}
export declare class ActionButtonRenderer implements ICompressibleTreeRenderer<ISCMActionButton, FuzzyScore, ActionButtonTemplate> {
    private commandService;
    private contextMenuService;
    private notificationService;
    static readonly DEFAULT_HEIGHT = 30;
    static readonly TEMPLATE_ID = "actionButton";
    get templateId(): string;
    private actionButtons;
    constructor(commandService: ICommandService, contextMenuService: IContextMenuService, notificationService: INotificationService);
    renderTemplate(container: HTMLElement): ActionButtonTemplate;
    renderElement(node: ITreeNode<ISCMActionButton, FuzzyScore>, index: number, templateData: ActionButtonTemplate, height: number | undefined): void;
    renderCompressedElements(): void;
    focusActionButton(actionButton: ISCMActionButton): void;
    disposeElement(node: ITreeNode<ISCMActionButton, FuzzyScore>, index: number, template: ActionButtonTemplate): void;
    disposeTemplate(templateData: ActionButtonTemplate): void;
}
export declare class SCMTreeSorter implements ITreeSorter<TreeElement> {
    private readonly viewMode;
    private readonly viewSortKey;
    constructor(viewMode: () => ViewMode, viewSortKey: () => ViewSortKey);
    compare(one: TreeElement, other: TreeElement): number;
}
export declare class SCMTreeKeyboardNavigationLabelProvider implements ICompressibleKeyboardNavigationLabelProvider<TreeElement> {
    private viewMode;
    private readonly labelService;
    constructor(viewMode: () => ViewMode, labelService: ILabelService);
    getKeyboardNavigationLabel(element: TreeElement): {
        toString(): string;
    } | {
        toString(): string;
    }[] | undefined;
    getCompressedNodeKeyboardNavigationLabel(elements: TreeElement[]): {
        toString(): string | undefined;
    } | undefined;
}
export declare class SCMAccessibilityProvider implements IListAccessibilityProvider<TreeElement> {
    private readonly labelService;
    constructor(labelService: ILabelService);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: TreeElement): string;
}
declare const enum ViewMode {
    List = "list",
    Tree = "tree"
}
declare const enum ViewSortKey {
    Path = "path",
    Name = "name",
    Status = "status"
}
export declare const ContextKeys: {
    SCMViewMode: any;
    SCMViewSortKey: any;
    SCMViewAreAllRepositoriesCollapsed: any;
    SCMViewIsAnyRepositoryCollapsible: any;
    SCMProvider: any;
    SCMProviderRootUri: any;
    SCMProviderHasRootUri: any;
    RepositoryCount: any;
    RepositoryVisibilityCount: any;
    RepositoryVisibility(repository: ISCMRepository): any;
};
export declare class SCMViewPane extends ViewPane {
    private readonly commandService;
    private readonly editorService;
    private readonly menuService;
    private readonly scmService;
    private readonly scmViewService;
    private readonly storageService;
    private readonly uriIdentityService;
    private readonly layoutService;
    private _onDidLayout;
    private layoutCache;
    private treeScrollTop;
    private treeContainer;
    private tree;
    private listLabels;
    private inputRenderer;
    private actionButtonRenderer;
    private _viewMode;
    get viewMode(): ViewMode;
    set viewMode(mode: ViewMode);
    private readonly _onDidChangeViewMode;
    readonly onDidChangeViewMode: any;
    private _viewSortKey;
    get viewSortKey(): ViewSortKey;
    set viewSortKey(sortKey: ViewSortKey);
    private readonly _onDidChangeViewSortKey;
    readonly onDidChangeViewSortKey: any;
    private readonly items;
    private readonly visibilityDisposables;
    private readonly treeOperationSequencer;
    private readonly revealResourceThrottler;
    private readonly updateChildrenThrottler;
    private viewModeContextKey;
    private viewSortKeyContextKey;
    private areAllRepositoriesCollapsedContextKey;
    private isAnyRepositoryCollapsibleContextKey;
    private scmProviderContextKey;
    private scmProviderRootUriContextKey;
    private scmProviderHasRootUriContextKey;
    private readonly disposables;
    constructor(options: IViewPaneOptions, commandService: ICommandService, editorService: IEditorService, menuService: IMenuService, scmService: ISCMService, scmViewService: ISCMViewService, storageService: IStorageService, uriIdentityService: IUriIdentityService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, themeService: IThemeService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, openerService: IOpenerService, telemetryService: ITelemetryService, hoverService: IHoverService);
    protected layoutBody(height?: number | undefined, width?: number | undefined): void;
    protected renderBody(container: HTMLElement): void;
    private createTree;
    private open;
    private onDidActiveEditorChange;
    private onDidChangeVisibleRepositories;
    private onListContextMenu;
    private getSelectedRepositories;
    private getSelectedResources;
    private getSelectedHistoryItems;
    private getViewMode;
    private getViewSortKey;
    private loadTreeViewState;
    private storeTreeViewState;
    private updateChildren;
    private updateIndentStyles;
    private updateScmProviderContextKeys;
    private updateRepositoryCollapseAllContextKeys;
    collapseAllRepositories(): void;
    expandAllRepositories(): void;
    focusPreviousInput(): void;
    focusNextInput(): void;
    private focusInput;
    focusPreviousResourceGroup(): void;
    focusNextResourceGroup(): void;
    private focusResourceGroup;
    shouldShowWelcome(): boolean;
    getActionsContext(): unknown;
    focus(): void;
    dispose(): void;
}
export declare class SCMActionButton implements IDisposable {
    private readonly container;
    private readonly contextMenuService;
    private readonly commandService;
    private readonly notificationService;
    private button;
    private readonly disposables;
    constructor(container: HTMLElement, contextMenuService: IContextMenuService, commandService: ICommandService, notificationService: INotificationService);
    dispose(): void;
    setButton(button: ISCMActionButtonDescriptor | undefined): void;
    focus(): void;
    private clear;
    private executeCommand;
}
export {};
