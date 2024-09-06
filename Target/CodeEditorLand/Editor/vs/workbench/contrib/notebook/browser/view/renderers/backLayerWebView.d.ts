import { IMouseWheelEvent } from "vs/base/browser/mouseEvent";
import { CodeWindow } from "vs/base/browser/window";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService, Themable } from "vs/platform/theme/common/themeService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkspaceTrustManagementService } from "vs/platform/workspace/common/workspaceTrust";
import { CellEditState, ICellOutputViewModel, ICellViewModel, ICommonCellInfo, IDisplayOutputLayoutUpdateRequest, IDisplayOutputViewModel, IFocusNotebookCellOptions, IGenericCellViewModel, IInsetRenderOutput, INotebookEditorCreationOptions, INotebookWebviewMessage } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookRendererInfo } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookKernel } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { INotebookLoggingService } from "vs/workbench/contrib/notebook/common/notebookLoggingService";
import { IScopedRendererMessaging } from "vs/workbench/contrib/notebook/common/notebookRendererMessagingService";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { IWebviewElement, IWebviewService } from "vs/workbench/contrib/webview/browser/webview";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { IAckOutputHeight, ICreationRequestMessage, IFindMatch, IMarkupCellInitialization } from "./webviewMessages";
export interface ICachedInset<K extends ICommonCellInfo> {
    outputId: string;
    versionId: number;
    cellInfo: K;
    renderer?: INotebookRendererInfo;
    cachedCreation: ICreationRequestMessage;
    initialized?: boolean;
}
export interface IResolvedBackLayerWebview {
    webview: IWebviewElement;
}
/**
 * Notebook Editor Delegate for back layer webview
 */
export interface INotebookDelegateForWebview {
    readonly creationOptions: INotebookEditorCreationOptions;
    getCellById(cellId: string): IGenericCellViewModel | undefined;
    focusNotebookCell(cell: IGenericCellViewModel, focus: "editor" | "container" | "output", options?: IFocusNotebookCellOptions): Promise<void>;
    toggleNotebookCellSelection(cell: IGenericCellViewModel, selectFromPrevious: boolean): void;
    getCellByInfo(cellInfo: ICommonCellInfo): IGenericCellViewModel;
    focusNextNotebookCell(cell: IGenericCellViewModel, focus: "editor" | "container" | "output"): Promise<void>;
    updateOutputHeight(cellInfo: ICommonCellInfo, output: IDisplayOutputViewModel, height: number, isInit: boolean, source?: string): void;
    scheduleOutputHeightAck(cellInfo: ICommonCellInfo, outputId: string, height: number): void;
    updateMarkupCellHeight(cellId: string, height: number, isInit: boolean): void;
    setMarkupCellEditState(cellId: string, editState: CellEditState): void;
    didStartDragMarkupCell(cellId: string, event: {
        dragOffsetY: number;
    }): void;
    didDragMarkupCell(cellId: string, event: {
        dragOffsetY: number;
    }): void;
    didDropMarkupCell(cellId: string, event: {
        dragOffsetY: number;
        ctrlKey: boolean;
        altKey: boolean;
    }): void;
    didEndDragMarkupCell(cellId: string): void;
    didResizeOutput(cellId: string): void;
    setScrollTop(scrollTop: number): void;
    triggerScroll(event: IMouseWheelEvent): void;
    updatePerformanceMetadata(cellId: string, executionId: string, duration: number, rendererId: string): void;
    didFocusOutputInputChange(inputFocused: boolean): void;
}
interface BacklayerWebviewOptions {
    readonly outputNodePadding: number;
    readonly outputNodeLeftPadding: number;
    readonly previewNodePadding: number;
    readonly markdownLeftMargin: number;
    readonly leftMargin: number;
    readonly rightMargin: number;
    readonly runGutter: number;
    readonly dragAndDropEnabled: boolean;
    readonly fontSize: number;
    readonly outputFontSize: number;
    readonly fontFamily: string;
    readonly outputFontFamily: string;
    readonly markupFontSize: number;
    readonly markdownLineHeight: number;
    readonly outputLineHeight: number;
    readonly outputScrolling: boolean;
    readonly outputWordWrap: boolean;
    readonly outputLineLimit: number;
    readonly outputLinkifyFilePaths: boolean;
    readonly minimalError: boolean;
}
export declare class BackLayerWebView<T extends ICommonCellInfo> extends Themable {
    notebookEditor: INotebookDelegateForWebview;
    private readonly id;
    readonly notebookViewType: string;
    readonly documentUri: URI;
    private options;
    private readonly rendererMessaging;
    private readonly webviewService;
    private readonly openerService;
    private readonly notebookService;
    private readonly contextService;
    private readonly environmentService;
    private readonly fileDialogService;
    private readonly fileService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    private readonly workspaceTrustManagementService;
    private readonly configurationService;
    private readonly languageService;
    private readonly workspaceContextService;
    private readonly editorGroupService;
    private readonly storageService;
    private readonly pathService;
    private readonly notebookLogService;
    private readonly telemetryService;
    private static _originStore?;
    private static getOriginStore;
    element: HTMLElement;
    webview: IWebviewElement | undefined;
    insetMapping: Map<IDisplayOutputViewModel, ICachedInset<T>>;
    pendingWebviewIdleCreationRequest: Map<IDisplayOutputViewModel, IDisposable>;
    pendingWebviewIdleInsetMapping: Map<IDisplayOutputViewModel, ICachedInset<T>>;
    private reversedPendingWebviewIdleInsetMapping;
    readonly markupPreviewMapping: Map<string, IMarkupCellInitialization>;
    private hiddenInsetMapping;
    private reversedInsetMapping;
    private localResourceRootsCache;
    private readonly _onMessage;
    private readonly _preloadsCache;
    readonly onMessage: Event<INotebookWebviewMessage>;
    private _disposed;
    private _currentKernel?;
    private firstInit;
    private initializeMarkupPromise?;
    private readonly nonce;
    constructor(notebookEditor: INotebookDelegateForWebview, id: string, notebookViewType: string, documentUri: URI, options: BacklayerWebviewOptions, rendererMessaging: IScopedRendererMessaging | undefined, webviewService: IWebviewService, openerService: IOpenerService, notebookService: INotebookService, contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, fileDialogService: IFileDialogService, fileService: IFileService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, workspaceTrustManagementService: IWorkspaceTrustManagementService, configurationService: IConfigurationService, languageService: ILanguageService, workspaceContextService: IWorkspaceContextService, editorGroupService: IEditorGroupsService, storageService: IStorageService, pathService: IPathService, notebookLogService: INotebookLoggingService, themeService: IThemeService, telemetryService: ITelemetryService);
    updateOptions(options: BacklayerWebviewOptions): void;
    private _logRendererDebugMessage;
    private _updateStyles;
    private _updateOptions;
    private _generateStyles;
    private generateContent;
    private getRendererData;
    private getStaticPreloadsData;
    private asWebviewUri;
    postKernelMessage(message: any): void;
    private resolveOutputId;
    isResolved(): this is IResolvedBackLayerWebview;
    createWebview(targetWindow: CodeWindow): Promise<void>;
    private getNotebookBaseUri;
    private getBuiltinLocalResourceRoots;
    private _initialize;
    private _sendPerformanceData;
    private _handleNotebookCellResource;
    private _handleResourceOpening;
    private _openUri;
    private _handleHighlightCodeBlock;
    private _onDidClickDataLink;
    private _createInset;
    private _getResourceRootsCache;
    private initializeWebViewState;
    private shouldUpdateInset;
    ackHeight(updates: readonly IAckOutputHeight[]): void;
    updateScrollTops(outputRequests: IDisplayOutputLayoutUpdateRequest[], markupPreviews: {
        id: string;
        top: number;
    }[]): void;
    private createMarkupPreview;
    showMarkupPreview(newContent: IMarkupCellInitialization): Promise<void>;
    hideMarkupPreviews(cellIds: readonly string[]): Promise<void>;
    unhideMarkupPreviews(cellIds: readonly string[]): Promise<void>;
    deleteMarkupPreviews(cellIds: readonly string[]): Promise<void>;
    updateMarkupPreviewSelections(selectedCellsIds: string[]): Promise<void>;
    initializeMarkup(cells: readonly IMarkupCellInitialization[]): Promise<void>;
    /**
     * Validate if cached inset is out of date and require a rerender
     * Note that it doesn't account for output content change.
     */
    private _cachedInsetEqual;
    requestCreateOutputWhenWebviewIdle(cellInfo: T, content: IInsetRenderOutput, cellTop: number, offset: number): void;
    createOutput(cellInfo: T, content: IInsetRenderOutput, cellTop: number, offset: number): void;
    private createMetadata;
    private _createOutputCreationMessage;
    updateOutput(cellInfo: T, content: IInsetRenderOutput, cellTop: number, offset: number): void;
    copyImage(output: ICellOutputViewModel): Promise<void>;
    removeInsets(outputs: readonly ICellOutputViewModel[]): void;
    hideInset(output: ICellOutputViewModel): void;
    focusWebview(): void;
    selectOutputContents(cell: ICellViewModel): void;
    selectInputContents(cell: ICellViewModel): void;
    focusOutput(cellOrOutputId: string, alternateId: string | undefined, viewFocused: boolean): void;
    blurOutput(): void;
    find(query: string, options: {
        wholeWord?: boolean;
        caseSensitive?: boolean;
        includeMarkup: boolean;
        includeOutput: boolean;
        shouldGetSearchPreviewInfo: boolean;
        ownerID: string;
        findIds: string[];
    }): Promise<IFindMatch[]>;
    findStop(ownerID: string): void;
    findHighlightCurrent(index: number, ownerID: string): Promise<number>;
    findUnHighlightCurrent(index: number, ownerID: string): Promise<void>;
    deltaCellContainerClassNames(cellId: string, added: string[], removed: string[]): void;
    updateOutputRenderers(): void;
    updateKernelPreloads(kernel: INotebookKernel | undefined): Promise<void>;
    private _updatePreloadsFromKernel;
    private _updatePreloads;
    private _sendMessageToWebview;
    dispose(): void;
}
export {};
