import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI, UriComponents } from "vs/base/common/uri";
import { IRange, Range } from "vs/editor/common/core/range";
import { Comment, CommentInfo, CommentingRangeResourceHint, CommentingRanges, CommentOptions, CommentReaction, CommentThread, CommentThreadChangedEvent, PendingCommentThread } from "vs/editor/common/languages";
import { IModelService } from "vs/editor/common/services/model";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { CommentMenus } from "vs/workbench/contrib/comments/browser/commentMenus";
import { ICommentsModel } from "vs/workbench/contrib/comments/browser/commentsModel";
import { ICommentThreadChangedEvent } from "vs/workbench/contrib/comments/common/commentModel";
import { ICellRange } from "vs/workbench/contrib/notebook/common/notebookRange";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare const ICommentService: any;
interface IResourceCommentThreadEvent {
    resource: URI;
    commentInfos: ICommentInfo[];
}
export interface ICommentInfo<T = IRange> extends CommentInfo<T> {
    uniqueOwner: string;
    label?: string;
}
export interface INotebookCommentInfo {
    extensionId?: string;
    threads: CommentThread<ICellRange>[];
    uniqueOwner: string;
    label?: string;
}
export interface IWorkspaceCommentThreadsEvent {
    ownerId: string;
    ownerLabel: string;
    commentThreads: CommentThread[];
}
export interface INotebookCommentThreadChangedEvent extends CommentThreadChangedEvent<ICellRange> {
    uniqueOwner: string;
}
export interface ICommentController {
    id: string;
    label: string;
    features: {
        reactionGroup?: CommentReaction[];
        reactionHandler?: boolean;
        options?: CommentOptions;
    };
    options?: CommentOptions;
    contextValue?: string;
    owner: string;
    createCommentThreadTemplate(resource: UriComponents, range: IRange | undefined, editorId?: string): Promise<void>;
    updateCommentThreadTemplate(threadHandle: number, range: IRange): Promise<void>;
    deleteCommentThreadMain(commentThreadId: string): void;
    toggleReaction(uri: URI, thread: CommentThread, comment: Comment, reaction: CommentReaction, token: CancellationToken): Promise<void>;
    getDocumentComments(resource: URI, token: CancellationToken): Promise<ICommentInfo<IRange>>;
    getNotebookComments(resource: URI, token: CancellationToken): Promise<INotebookCommentInfo>;
    setActiveCommentAndThread(commentInfo: {
        thread: CommentThread;
        comment?: Comment;
    } | undefined): Promise<void>;
}
export interface IContinueOnCommentProvider {
    provideContinueOnComments(): PendingCommentThread[];
}
export interface ICommentService {
    readonly _serviceBrand: undefined;
    readonly onDidSetResourceCommentInfos: Event<IResourceCommentThreadEvent>;
    readonly onDidSetAllCommentThreads: Event<IWorkspaceCommentThreadsEvent>;
    readonly onDidUpdateCommentThreads: Event<ICommentThreadChangedEvent>;
    readonly onDidUpdateNotebookCommentThreads: Event<INotebookCommentThreadChangedEvent>;
    readonly onDidChangeActiveEditingCommentThread: Event<CommentThread | null>;
    readonly onDidChangeCurrentCommentThread: Event<CommentThread | undefined>;
    readonly onDidUpdateCommentingRanges: Event<{
        uniqueOwner: string;
    }>;
    readonly onDidChangeActiveCommentingRange: Event<{
        range: Range;
        commentingRangesInfo: CommentingRanges;
    }>;
    readonly onDidSetDataProvider: Event<void>;
    readonly onDidDeleteDataProvider: Event<string | undefined>;
    readonly onDidChangeCommentingEnabled: Event<boolean>;
    readonly isCommentingEnabled: boolean;
    readonly commentsModel: ICommentsModel;
    setDocumentComments(resource: URI, commentInfos: ICommentInfo[]): void;
    setWorkspaceComments(uniqueOwner: string, commentsByResource: CommentThread<IRange | ICellRange>[]): void;
    removeWorkspaceComments(uniqueOwner: string): void;
    registerCommentController(uniqueOwner: string, commentControl: ICommentController): void;
    unregisterCommentController(uniqueOwner?: string): void;
    getCommentController(uniqueOwner: string): ICommentController | undefined;
    createCommentThreadTemplate(uniqueOwner: string, resource: URI, range: Range | undefined, editorId?: string): Promise<void>;
    updateCommentThreadTemplate(uniqueOwner: string, threadHandle: number, range: Range): Promise<void>;
    getCommentMenus(uniqueOwner: string): CommentMenus;
    updateComments(ownerId: string, event: CommentThreadChangedEvent<IRange>): void;
    updateNotebookComments(ownerId: string, event: CommentThreadChangedEvent<ICellRange>): void;
    disposeCommentThread(ownerId: string, threadId: string): void;
    getDocumentComments(resource: URI): Promise<(ICommentInfo | null)[]>;
    getNotebookComments(resource: URI): Promise<(INotebookCommentInfo | null)[]>;
    updateCommentingRanges(ownerId: string, resourceHints?: CommentingRangeResourceHint): void;
    hasReactionHandler(uniqueOwner: string): boolean;
    toggleReaction(uniqueOwner: string, resource: URI, thread: CommentThread<IRange | ICellRange>, comment: Comment, reaction: CommentReaction): Promise<void>;
    setActiveEditingCommentThread(commentThread: CommentThread<IRange | ICellRange> | null): void;
    setCurrentCommentThread(commentThread: CommentThread<IRange | ICellRange> | undefined): void;
    setActiveCommentAndThread(uniqueOwner: string, commentInfo: {
        thread: CommentThread<IRange | ICellRange>;
        comment?: Comment;
    } | undefined): Promise<void>;
    enableCommenting(enable: boolean): void;
    registerContinueOnCommentProvider(provider: IContinueOnCommentProvider): IDisposable;
    removeContinueOnComment(pendingComment: {
        range: IRange | undefined;
        uri: URI;
        uniqueOwner: string;
        isReply?: boolean;
    }): PendingCommentThread | undefined;
    resourceHasCommentingRanges(resource: URI): boolean;
}
export declare class CommentService extends Disposable implements ICommentService {
    protected readonly instantiationService: IInstantiationService;
    private readonly layoutService;
    private readonly configurationService;
    private readonly storageService;
    private readonly logService;
    private readonly modelService;
    readonly _serviceBrand: undefined;
    private readonly _onDidSetDataProvider;
    readonly onDidSetDataProvider: Event<void>;
    private readonly _onDidDeleteDataProvider;
    readonly onDidDeleteDataProvider: Event<string | undefined>;
    private readonly _onDidSetResourceCommentInfos;
    readonly onDidSetResourceCommentInfos: Event<IResourceCommentThreadEvent>;
    private readonly _onDidSetAllCommentThreads;
    readonly onDidSetAllCommentThreads: Event<IWorkspaceCommentThreadsEvent>;
    private readonly _onDidUpdateCommentThreads;
    readonly onDidUpdateCommentThreads: Event<ICommentThreadChangedEvent>;
    private readonly _onDidUpdateNotebookCommentThreads;
    readonly onDidUpdateNotebookCommentThreads: Event<INotebookCommentThreadChangedEvent>;
    private readonly _onDidUpdateCommentingRanges;
    readonly onDidUpdateCommentingRanges: Event<{
        uniqueOwner: string;
    }>;
    private readonly _onDidChangeActiveEditingCommentThread;
    readonly onDidChangeActiveEditingCommentThread: any;
    private readonly _onDidChangeCurrentCommentThread;
    readonly onDidChangeCurrentCommentThread: any;
    private readonly _onDidChangeCommentingEnabled;
    readonly onDidChangeCommentingEnabled: any;
    private readonly _onDidChangeActiveCommentingRange;
    readonly onDidChangeActiveCommentingRange: Event<{
        range: Range;
        commentingRangesInfo: CommentingRanges;
    }>;
    private _commentControls;
    private _commentMenus;
    private _isCommentingEnabled;
    private _workspaceHasCommenting;
    private _continueOnComments;
    private _continueOnCommentProviders;
    private readonly _commentsModel;
    readonly commentsModel: ICommentsModel;
    private _commentingRangeResources;
    private _commentingRangeResourceHintSchemes;
    constructor(instantiationService: IInstantiationService, layoutService: IWorkbenchLayoutService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, storageService: IStorageService, logService: ILogService, modelService: IModelService);
    private _updateResourcesWithCommentingRanges;
    private _handleConfiguration;
    private _handleZenMode;
    private get _defaultCommentingEnablement();
    get isCommentingEnabled(): boolean;
    enableCommenting(enable: boolean): void;
    /**
     * The current comment thread is the thread that has focus or is being hovered.
     * @param commentThread
     */
    setCurrentCommentThread(commentThread: CommentThread | undefined): void;
    /**
     * The active comment thread is the the thread that is currently being edited.
     * @param commentThread
     */
    setActiveEditingCommentThread(commentThread: CommentThread | null): void;
    private _lastActiveCommentController;
    setActiveCommentAndThread(uniqueOwner: string, commentInfo: {
        thread: CommentThread<IRange>;
        comment?: Comment;
    } | undefined): Promise<void>;
    setDocumentComments(resource: URI, commentInfos: ICommentInfo[]): void;
    private setModelThreads;
    private updateModelThreads;
    setWorkspaceComments(uniqueOwner: string, commentsByResource: CommentThread[]): void;
    removeWorkspaceComments(uniqueOwner: string): void;
    registerCommentController(uniqueOwner: string, commentControl: ICommentController): void;
    unregisterCommentController(uniqueOwner?: string): void;
    getCommentController(uniqueOwner: string): ICommentController | undefined;
    createCommentThreadTemplate(uniqueOwner: string, resource: URI, range: Range | undefined, editorId?: string): Promise<void>;
    updateCommentThreadTemplate(uniqueOwner: string, threadHandle: number, range: Range): Promise<void>;
    disposeCommentThread(uniqueOwner: string, threadId: string): void;
    getCommentMenus(uniqueOwner: string): CommentMenus;
    updateComments(ownerId: string, event: CommentThreadChangedEvent<IRange>): void;
    updateNotebookComments(ownerId: string, event: CommentThreadChangedEvent<ICellRange>): void;
    updateCommentingRanges(ownerId: string, resourceHints?: CommentingRangeResourceHint): void;
    toggleReaction(uniqueOwner: string, resource: URI, thread: CommentThread, comment: Comment, reaction: CommentReaction): Promise<void>;
    hasReactionHandler(uniqueOwner: string): boolean;
    getDocumentComments(resource: URI): Promise<(ICommentInfo | null)[]>;
    getNotebookComments(resource: URI): Promise<(INotebookCommentInfo | null)[]>;
    registerContinueOnCommentProvider(provider: IContinueOnCommentProvider): IDisposable;
    private _saveContinueOnComments;
    removeContinueOnComment(pendingComment: {
        range: IRange;
        uri: URI;
        uniqueOwner: string;
        isReply?: boolean;
    }): PendingCommentThread | undefined;
    private _addContinueOnComments;
    resourceHasCommentingRanges(resource: URI): boolean;
}
export {};
