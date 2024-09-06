import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { Lazy } from "vs/base/common/lazy";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { ResourceMap } from "vs/base/common/map";
import { TernarySearchTree } from "vs/base/common/ternarySearchTree";
import { URI } from "vs/base/common/uri";
import { Range } from "vs/editor/common/core/range";
import { ITextModel } from "vs/editor/common/model";
import { IModelService } from "vs/editor/common/services/model";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IFileService, IFileStatWithPartialMetadata } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { ILogService } from "vs/platform/log/common/log";
import { IProgress, IProgressService, IProgressStep } from "vs/platform/progress/common/progress";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { ICellViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookEditorWidget } from "vs/workbench/contrib/notebook/browser/notebookEditorWidget";
import { INotebookEditorService } from "vs/workbench/contrib/notebook/browser/services/notebookEditorService";
import { INotebookCellMatchWithModel } from "vs/workbench/contrib/search/browser/notebookSearch/searchNotebookHelpers";
import { IReplaceService } from "vs/workbench/contrib/search/browser/replace";
import { INotebookSearchService } from "vs/workbench/contrib/search/common/notebookSearch";
import { INotebookCellMatchNoModel } from "vs/workbench/contrib/search/common/searchNotebookHelpers";
import { ReplacePattern } from "vs/workbench/services/search/common/replace";
import { IAITextQuery, IFileMatch, IPatternInfo, ISearchComplete, ISearchProgressItem, ISearchRange, ISearchService, ITextQuery, ITextSearchMatch, ITextSearchPreviewOptions, ITextSearchResult, SearchSortOrder } from "vs/workbench/services/search/common/search";
export declare class Match {
    protected _parent: FileMatch;
    private _fullPreviewLines;
    readonly aiContributed: boolean;
    private static readonly MAX_PREVIEW_CHARS;
    protected _id: string;
    protected _range: Range;
    private _oneLinePreviewText;
    private _rangeInPreviewText;
    private _fullPreviewRange;
    constructor(_parent: FileMatch, _fullPreviewLines: string[], _fullPreviewRange: ISearchRange, _documentRange: ISearchRange, aiContributed: boolean);
    id(): string;
    parent(): FileMatch;
    text(): string;
    range(): Range;
    preview(): {
        before: string;
        fullBefore: string;
        inside: string;
        after: string;
    };
    get replaceString(): string;
    fullMatchText(includeSurrounding?: boolean): string;
    rangeInPreview(): any;
    fullPreviewLines(): string[];
    getMatchString(): string;
}
export declare class CellMatch {
    private readonly _parent;
    private _cell;
    private readonly _cellIndex;
    private _contentMatches;
    private _webviewMatches;
    private _context;
    constructor(_parent: FileMatch, _cell: ICellViewModel | undefined, _cellIndex: number);
    hasCellViewModel(): boolean;
    get context(): Map<number, string>;
    matches(): MatchInNotebook[];
    get contentMatches(): MatchInNotebook[];
    get webviewMatches(): MatchInNotebook[];
    remove(matches: MatchInNotebook | MatchInNotebook[]): void;
    clearAllMatches(): void;
    addContentMatches(textSearchMatches: ITextSearchMatch[]): void;
    addContext(textSearchMatches: ITextSearchMatch[]): void;
    addWebviewMatches(textSearchMatches: ITextSearchMatch[]): void;
    setCellModel(cell: ICellViewModel): void;
    get parent(): FileMatch;
    get id(): string;
    get cellIndex(): number;
    get cell(): ICellViewModel | undefined;
}
export declare class MatchInNotebook extends Match {
    private readonly _cellParent;
    private _webviewIndex;
    constructor(_cellParent: CellMatch, _fullPreviewLines: string[], _fullPreviewRange: ISearchRange, _documentRange: ISearchRange, webviewIndex?: number);
    parent(): FileMatch;
    get cellParent(): CellMatch;
    private notebookMatchTypeString;
    isWebviewMatch(): boolean;
    isReadonly(): boolean;
    get cellIndex(): number;
    get webviewIndex(): number | undefined;
    get cell(): any;
}
export declare class FileMatch extends Disposable implements IFileMatch {
    private _query;
    private _previewOptions;
    private _maxResults;
    private _parent;
    private rawMatch;
    private _closestRoot;
    private readonly searchInstanceID;
    private readonly modelService;
    private readonly replaceService;
    private readonly notebookEditorService;
    private static readonly _CURRENT_FIND_MATCH;
    private static readonly _FIND_MATCH;
    private static getDecorationOption;
    protected _onChange: any;
    readonly onChange: Event<{
        didRemove?: boolean;
        forceUpdateModel?: boolean;
    }>;
    private _onDispose;
    readonly onDispose: Event<void>;
    private _resource;
    private _fileStat?;
    private _model;
    private _modelListener;
    private _textMatches;
    private _cellMatches;
    private _removedTextMatches;
    private _selectedMatch;
    private _name;
    private _updateScheduler;
    private _modelDecorations;
    private _context;
    get context(): Map<number, string>;
    get cellContext(): Map<string, Map<number, string>>;
    private _notebookEditorWidget;
    private _editorWidgetListener;
    private _notebookUpdateScheduler;
    private _findMatchDecorationModel;
    private _lastEditorWidgetIdForUpdate;
    constructor(_query: IPatternInfo, _previewOptions: ITextSearchPreviewOptions | undefined, _maxResults: number | undefined, _parent: FolderMatch, rawMatch: IFileMatch, _closestRoot: FolderMatchWorkspaceRoot | null, searchInstanceID: string, modelService: IModelService, replaceService: IReplaceService, labelService: ILabelService, notebookEditorService: INotebookEditorService);
    addWebviewMatchesToCell(cellID: string, webviewMatches: ITextSearchMatch[]): void;
    addContentMatchesToCell(cellID: string, contentMatches: ITextSearchMatch[]): void;
    getCellMatch(cellID: string): CellMatch | undefined;
    addCellMatch(rawCell: INotebookCellMatchNoModel | INotebookCellMatchWithModel): void;
    get closestRoot(): FolderMatchWorkspaceRoot | null;
    hasReadonlyMatches(): boolean;
    createMatches(isAiContributed: boolean): void;
    bindModel(model: ITextModel): void;
    private onModelWillDispose;
    private unbindModel;
    private updateMatchesForModel;
    protected updatesMatchesForLineAfterReplace(lineNumber: number, modelChange: boolean): Promise<void>;
    private updateMatches;
    updateHighlights(): void;
    id(): string;
    parent(): FolderMatch;
    matches(): Match[];
    textMatches(): Match[];
    cellMatches(): CellMatch[];
    remove(matches: Match | Match[]): void;
    private replaceQ;
    replace(toReplace: Match): Promise<void>;
    setSelectedMatch(match: Match | null): void;
    getSelectedMatch(): Match | null;
    isMatchSelected(match: Match): boolean;
    count(): number;
    get resource(): URI;
    name(): string;
    addContext(results: ITextSearchResult[] | undefined): void;
    add(match: Match, trigger?: boolean): void;
    private removeMatch;
    resolveFileStat(fileService: IFileService): Promise<void>;
    get fileStat(): IFileStatWithPartialMetadata | undefined;
    set fileStat(stat: IFileStatWithPartialMetadata | undefined);
    dispose(): void;
    hasOnlyReadOnlyMatches(): boolean;
    bindNotebookEditorWidget(widget: NotebookEditorWidget): void;
    unbindNotebookEditorWidget(widget?: NotebookEditorWidget): void;
    updateNotebookHighlights(): void;
    private _addNotebookHighlights;
    private _removeNotebookHighlights;
    private updateNotebookMatches;
    private setNotebookFindMatchDecorationsUsingCellMatches;
    updateMatchesForEditorWidget(): Promise<void>;
    showMatch(match: MatchInNotebook): Promise<void>;
    private highlightCurrentFindMatchDecoration;
    private revealCellRange;
}
export interface IChangeEvent {
    elements: FileMatch[];
    added?: boolean;
    removed?: boolean;
    clearingAll?: boolean;
}
export declare class FolderMatch extends Disposable {
    protected _resource: URI | null;
    private _id;
    protected _index: number;
    protected _query: ITextQuery;
    private _parent;
    private _searchResult;
    private _closestRoot;
    private readonly replaceService;
    protected readonly instantiationService: IInstantiationService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected _onChange: any;
    readonly onChange: Event<IChangeEvent>;
    private _onDispose;
    readonly onDispose: Event<void>;
    protected _fileMatches: ResourceMap<FileMatch>;
    protected _folderMatches: ResourceMap<FolderMatchWithResource>;
    protected _folderMatchesMap: TernarySearchTree<URI, FolderMatchWithResource>;
    protected _unDisposedFileMatches: ResourceMap<FileMatch>;
    protected _unDisposedFolderMatches: ResourceMap<FolderMatchWithResource>;
    private _replacingAll;
    private _name;
    constructor(_resource: URI | null, _id: string, _index: number, _query: ITextQuery, _parent: SearchResult | FolderMatch, _searchResult: SearchResult, _closestRoot: FolderMatchWorkspaceRoot | null, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    get searchModel(): SearchModel;
    get showHighlights(): boolean;
    get closestRoot(): FolderMatchWorkspaceRoot | null;
    set replacingAll(b: boolean);
    id(): string;
    get resource(): URI | null;
    index(): number;
    name(): string;
    parent(): SearchResult | FolderMatch;
    bindModel(model: ITextModel): void;
    bindNotebookEditorWidget(editor: NotebookEditorWidget, resource: URI): Promise<void>;
    unbindNotebookEditorWidget(editor: NotebookEditorWidget, resource: URI): void;
    createIntermediateFolderMatch(resource: URI, id: string, index: number, query: ITextQuery, baseWorkspaceFolder: FolderMatchWorkspaceRoot): FolderMatchWithResource;
    configureIntermediateMatch(folderMatch: FolderMatchWithResource): void;
    clear(clearingAll?: boolean): void;
    remove(matches: FileMatch | FolderMatchWithResource | (FileMatch | FolderMatchWithResource)[]): void;
    replace(match: FileMatch): Promise<any>;
    replaceAll(): Promise<any>;
    matches(): (FileMatch | FolderMatchWithResource)[];
    fileMatchesIterator(): IterableIterator<FileMatch>;
    folderMatchesIterator(): IterableIterator<FolderMatchWithResource>;
    isEmpty(): boolean;
    getDownstreamFileMatch(uri: URI): FileMatch | null;
    allDownstreamFileMatches(): FileMatch[];
    private fileCount;
    private folderCount;
    count(): number;
    recursiveFileCount(): number;
    recursiveMatchCount(): number;
    get query(): ITextQuery | null;
    addFileMatch(raw: IFileMatch[], silent: boolean, searchInstanceID: string, isAiContributed: boolean): void;
    doAddFile(fileMatch: FileMatch): void;
    hasOnlyReadOnlyMatches(): boolean;
    protected uriHasParent(parent: URI, child: URI): any;
    private isInParentChain;
    getFolderMatch(resource: URI): FolderMatchWithResource | undefined;
    doAddFolder(folderMatch: FolderMatchWithResource): void;
    private batchReplace;
    onFileChange(fileMatch: FileMatch, removed?: boolean): void;
    onFolderChange(folderMatch: FolderMatchWithResource, event: IChangeEvent): void;
    private doRemoveFile;
    private disposeMatches;
    dispose(): void;
}
export declare class FolderMatchWithResource extends FolderMatch {
    protected _normalizedResource: Lazy<URI>;
    constructor(_resource: URI, _id: string, _index: number, _query: ITextQuery, _parent: SearchResult | FolderMatch, _searchResult: SearchResult, _closestRoot: FolderMatchWorkspaceRoot | null, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    get resource(): URI;
    get normalizedResource(): URI;
}
/**
 * FolderMatchWorkspaceRoot => folder for workspace root
 */
export declare class FolderMatchWorkspaceRoot extends FolderMatchWithResource {
    private readonly _ai;
    constructor(_resource: URI, _id: string, _index: number, _query: ITextQuery, _parent: SearchResult, _ai: boolean, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    private normalizedUriParent;
    private uriEquals;
    private createFileMatch;
    createAndConfigureFileMatch(rawFileMatch: IFileMatch<URI>, searchInstanceID: string): FileMatch;
}
/**
 * BaseFolderMatch => optional resource ("other files" node)
 * FolderMatch => required resource (normal folder node)
 */
export declare class FolderMatchNoRoot extends FolderMatch {
    constructor(_id: string, _index: number, _query: ITextQuery, _parent: SearchResult, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    createAndConfigureFileMatch(rawFileMatch: IFileMatch, searchInstanceID: string): FileMatch;
}
/**
 * Compares instances of the same match type. Different match types should not be siblings
 * and their sort order is undefined.
 */
export declare function searchMatchComparer(elementA: RenderableMatch, elementB: RenderableMatch, sortOrder?: SearchSortOrder): number;
export declare function compareNotebookPos(match1: MatchInNotebook, match2: MatchInNotebook): number;
export declare function searchComparer(elementA: RenderableMatch, elementB: RenderableMatch, sortOrder?: SearchSortOrder): number;
export declare class SearchResult extends Disposable {
    readonly searchModel: SearchModel;
    private readonly replaceService;
    private readonly instantiationService;
    private readonly modelService;
    private readonly uriIdentityService;
    private readonly notebookEditorService;
    private _onChange;
    readonly onChange: Event<IChangeEvent>;
    private _folderMatches;
    private _aiFolderMatches;
    private _otherFilesMatch;
    private _folderMatchesMap;
    private _aiFolderMatchesMap;
    private _showHighlights;
    private _query;
    private _rangeHighlightDecorations;
    private disposePastResults;
    private _isDirty;
    private _onWillChangeModelListener;
    private _onDidChangeModelListener;
    private _cachedSearchComplete;
    private _aiCachedSearchComplete;
    constructor(searchModel: SearchModel, replaceService: IReplaceService, instantiationService: IInstantiationService, modelService: IModelService, uriIdentityService: IUriIdentityService, notebookEditorService: INotebookEditorService);
    batchReplace(elementsToReplace: RenderableMatch[]): Promise<void>;
    batchRemove(elementsToRemove: RenderableMatch[]): void;
    get isDirty(): boolean;
    get query(): ITextQuery | null;
    set query(query: ITextQuery | null);
    setCachedSearchComplete(cachedSearchComplete: ISearchComplete | undefined, ai: boolean): void;
    getCachedSearchComplete(ai: boolean): any;
    private onDidAddNotebookEditorWidget;
    private onModelAdded;
    private onNotebookEditorWidgetAdded;
    private onNotebookEditorWidgetRemoved;
    private _createBaseFolderMatch;
    add(allRaw: IFileMatch[], searchInstanceID: string, ai: boolean, silent?: boolean): void;
    clear(): void;
    remove(matches: FileMatch | FolderMatch | (FileMatch | FolderMatch)[], ai?: boolean): void;
    replace(match: FileMatch): Promise<any>;
    replaceAll(progress: IProgress<IProgressStep>): Promise<any>;
    folderMatches(ai?: boolean): FolderMatch[];
    matches(ai?: boolean): FileMatch[];
    isEmpty(ai?: boolean): boolean;
    fileCount(ai?: boolean): number;
    count(ai?: boolean): number;
    get showHighlights(): boolean;
    toggleHighlights(value: boolean): void;
    get rangeHighlightDecorations(): RangeHighlightDecorations;
    private getFolderMatch;
    private getAIFolderMatch;
    private set replacingAll(value);
    private groupFilesByFolder;
    private disposeMatches;
    dispose(): Promise<void>;
}
export declare enum SearchModelLocation {
    PANEL = 0,
    QUICK_ACCESS = 1
}
export declare class SearchModel extends Disposable {
    private readonly searchService;
    private readonly telemetryService;
    private readonly configurationService;
    private readonly instantiationService;
    private readonly logService;
    private readonly notebookSearchService;
    private readonly progressService;
    private _searchResult;
    private _searchQuery;
    private _replaceActive;
    private _replaceString;
    private _replacePattern;
    private _preserveCase;
    private _startStreamDelay;
    private readonly _resultQueue;
    private readonly _aiResultQueue;
    private readonly _onReplaceTermChanged;
    readonly onReplaceTermChanged: Event<void>;
    private readonly _onSearchResultChanged;
    readonly onSearchResultChanged: Event<IChangeEvent>;
    private currentCancelTokenSource;
    private currentAICancelTokenSource;
    private searchCancelledForNewSearch;
    private aiSearchCancelledForNewSearch;
    location: SearchModelLocation;
    constructor(searchService: ISearchService, telemetryService: ITelemetryService, configurationService: IConfigurationService, instantiationService: IInstantiationService, logService: ILogService, notebookSearchService: INotebookSearchService, progressService: IProgressService);
    isReplaceActive(): boolean;
    set replaceActive(replaceActive: boolean);
    get replacePattern(): ReplacePattern | null;
    get replaceString(): string;
    set preserveCase(value: boolean);
    get preserveCase(): boolean;
    set replaceString(replaceString: string);
    get searchResult(): SearchResult;
    addAIResults(onProgress?: (result: ISearchProgressItem) => void): Promise<void>;
    private doAISearchWithModal;
    aiSearch(query: IAITextQuery, onProgress?: (result: ISearchProgressItem) => void, callerToken?: CancellationToken): Promise<ISearchComplete>;
    private doSearch;
    search(query: ITextQuery, onProgress?: (result: ISearchProgressItem) => void, callerToken?: CancellationToken): {
        asyncResults: Promise<ISearchComplete>;
        syncResults: IFileMatch<URI>[];
    };
    private onSearchCompleted;
    private onSearchError;
    private onSearchProgress;
    private get searchConfig();
    cancelSearch(cancelledForNewSearch?: boolean): boolean;
    cancelAISearch(cancelledForNewSearch?: boolean): boolean;
    dispose(): void;
}
export type FileMatchOrMatch = FileMatch | Match;
export type RenderableMatch = FolderMatch | FolderMatchWithResource | FileMatch | Match;
export declare class SearchViewModelWorkbenchService implements ISearchViewModelWorkbenchService {
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private _searchModel;
    constructor(instantiationService: IInstantiationService);
    get searchModel(): SearchModel;
    set searchModel(searchModel: SearchModel);
}
export declare const ISearchViewModelWorkbenchService: any;
export interface ISearchViewModelWorkbenchService {
    readonly _serviceBrand: undefined;
    searchModel: SearchModel;
}
/**
 * Can add a range highlight decoration to a model.
 * It will automatically remove it when the model has its decorations changed.
 */
export declare class RangeHighlightDecorations implements IDisposable {
    private readonly _modelService;
    private _decorationId;
    private _model;
    private readonly _modelDisposables;
    constructor(_modelService: IModelService);
    removeHighlightRange(): void;
    highlightRange(resource: URI | ITextModel, range: Range, ownerId?: number): void;
    private doHighlightRange;
    private setModel;
    private clearModelListeners;
    dispose(): void;
    private static readonly _RANGE_HIGHLIGHT_DECORATION;
}
export declare function textSearchMatchesToNotebookMatches(textSearchMatches: ITextSearchMatch[], cell: CellMatch): MatchInNotebook[];
export declare function arrayContainsElementOrParent(element: RenderableMatch, testArray: RenderableMatch[]): boolean;
