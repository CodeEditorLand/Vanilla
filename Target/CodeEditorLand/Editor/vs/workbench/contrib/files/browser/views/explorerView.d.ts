import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IFileService } from "vs/platform/files/common/files";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILabelService } from "vs/platform/label/common/label";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IExplorerService, IExplorerView } from "vs/workbench/contrib/files/browser/files";
import { ICompressedNavigationController } from "vs/workbench/contrib/files/browser/views/explorerViewer";
import { ExplorerItem } from "vs/workbench/contrib/files/common/explorerModel";
import { IDecorationsService } from "vs/workbench/services/decorations/common/decorations";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
import { IWorkbenchThemeService } from "vs/workbench/services/themes/common/workbenchThemeService";
export declare function getContext(focus: ExplorerItem[], selection: ExplorerItem[], respectMultiSelection: boolean, compressedNavigationControllerProvider: {
    getCompressedNavigationController(stat: ExplorerItem): ICompressedNavigationController[] | undefined;
}): ExplorerItem[];
export interface IExplorerViewContainerDelegate {
    willOpenElement(event?: UIEvent): void;
    didOpenElement(event?: UIEvent): void;
}
export interface IExplorerViewPaneOptions extends IViewPaneOptions {
    delegate: IExplorerViewContainerDelegate;
}
export declare class ExplorerView extends ViewPane implements IExplorerView {
    private readonly contextService;
    private readonly progressService;
    private readonly editorService;
    private readonly editorResolverService;
    private readonly layoutService;
    private readonly decorationService;
    private readonly labelService;
    private readonly explorerService;
    private readonly storageService;
    private clipboardService;
    private readonly fileService;
    private readonly uriIdentityService;
    private readonly commandService;
    static readonly TREE_VIEW_STATE_STORAGE_KEY: string;
    private tree;
    private filter;
    private resourceContext;
    private folderContext;
    private readonlyContext;
    private availableEditorIdsContext;
    private rootContext;
    private resourceMoveableToTrash;
    private renderer;
    private treeContainer;
    private container;
    private compressedFocusContext;
    private compressedFocusFirstContext;
    private compressedFocusLastContext;
    private viewHasSomeCollapsibleRootItem;
    private viewVisibleContextKey;
    private setTreeInputPromise;
    private horizontalScrolling;
    private dragHandler;
    private _autoReveal;
    private decorationsProvider;
    private readonly delegate;
    constructor(options: IExplorerViewPaneOptions, contextMenuService: IContextMenuService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, progressService: IProgressService, editorService: IEditorService, editorResolverService: IEditorResolverService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, decorationService: IDecorationsService, labelService: ILabelService, themeService: IWorkbenchThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, explorerService: IExplorerService, storageService: IStorageService, clipboardService: IClipboardService, fileService: IFileService, uriIdentityService: IUriIdentityService, commandService: ICommandService, openerService: IOpenerService);
    get autoReveal(): boolean | "force" | "focusNoScroll";
    set autoReveal(autoReveal: boolean | "force" | "focusNoScroll");
    get name(): string;
    get title(): string;
    set title(_: string);
    setVisible(visible: boolean): void;
    private get fileCopiedContextKey();
    private get resourceCutContextKey();
    protected renderHeader(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    protected renderBody(container: HTMLElement): void;
    focus(): void;
    hasFocus(): boolean;
    getFocus(): ExplorerItem[];
    focusNext(): void;
    focusLast(): void;
    getContext(respectMultiSelection: boolean): ExplorerItem[];
    isItemVisible(item: ExplorerItem): boolean;
    isItemCollapsed(item: ExplorerItem): boolean;
    setEditable(stat: ExplorerItem, isEditing: boolean): Promise<void>;
    private selectActiveFile;
    private createTree;
    private onConfigurationUpdated;
    private storeTreeViewState;
    private setContextKeys;
    private onContextMenu;
    private onFocusChanged;
    /**
     * Refresh the contents of the explorer to get up to date data from the disk about the file structure.
     * If the item is passed we refresh only that level of the tree, otherwise we do a full refresh.
     */
    refresh(recursive: boolean, item?: ExplorerItem, cancelEditing?: boolean): Promise<void>;
    getOptimalWidth(): number;
    setTreeInput(): Promise<void>;
    selectResource(resource: URI | undefined, reveal?: boolean | "force" | "focusNoScroll", retry?: number): Promise<void>;
    itemsCopied(stats: ExplorerItem[], cut: boolean, previousCut: ExplorerItem[] | undefined): void;
    expandAll(): void;
    collapseAll(): void;
    previousCompressedStat(): void;
    nextCompressedStat(): void;
    firstCompressedStat(): void;
    lastCompressedStat(): void;
    private updateCompressedNavigationContextKeys;
    private updateAnyCollapsedContext;
    dispose(): void;
}
export declare function createFileIconThemableTreeContainerScope(container: HTMLElement, themeService: IThemeService): IDisposable;