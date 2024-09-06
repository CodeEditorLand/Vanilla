import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IResourceEditorInput } from "vs/platform/editor/common/editor";
import { FileChangesEvent, FileOperationEvent, IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import { EditorServiceImpl } from "vs/workbench/browser/parts/editor/editor";
import { GroupIdentifier, IEditorPane, IEditorPaneSelection, IEditorPaneSelectionChangeEvent } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { GoFilter, GoScope, IHistoryService } from "vs/workbench/services/history/common/history";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare class HistoryService extends Disposable implements IHistoryService {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly contextService;
    private readonly storageService;
    private readonly configurationService;
    private readonly fileService;
    private readonly workspacesService;
    private readonly instantiationService;
    private readonly layoutService;
    private readonly contextKeyService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private static readonly MOUSE_NAVIGATION_SETTING;
    private static readonly NAVIGATION_SCOPE_SETTING;
    private readonly activeEditorListeners;
    private lastActiveEditor;
    private readonly editorHelper;
    constructor(editorService: EditorServiceImpl, editorGroupService: IEditorGroupsService, contextService: IWorkspaceContextService, storageService: IStorageService, configurationService: IConfigurationService, fileService: IFileService, workspacesService: IWorkspacesService, instantiationService: IInstantiationService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, logService: ILogService);
    private registerListeners;
    private onDidCloseEditor;
    private registerMouseNavigationListener;
    private onMouseDownOrUp;
    private onDidRemoveGroup;
    private onDidActiveEditorChange;
    private onDidFilesChange;
    private handleActiveEditorChange;
    private handleActiveEditorSelectionChangeEvent;
    private move;
    private remove;
    private removeFromRecentlyOpened;
    clear(): void;
    private readonly canNavigateBackContextKey;
    private readonly canNavigateForwardContextKey;
    private readonly canNavigateBackInNavigationsContextKey;
    private readonly canNavigateForwardInNavigationsContextKey;
    private readonly canNavigateToLastNavigationLocationContextKey;
    private readonly canNavigateBackInEditsContextKey;
    private readonly canNavigateForwardInEditsContextKey;
    private readonly canNavigateToLastEditLocationContextKey;
    private readonly canReopenClosedEditorContextKey;
    updateContextKeys(): void;
    private readonly _onDidChangeEditorNavigationStack;
    readonly onDidChangeEditorNavigationStack: any;
    private defaultScopedEditorNavigationStack;
    private readonly editorGroupScopedNavigationStacks;
    private readonly editorScopedNavigationStacks;
    private editorNavigationScope;
    private registerEditorNavigationScopeChangeListener;
    private getStack;
    goForward(filter?: GoFilter): Promise<void>;
    goBack(filter?: GoFilter): Promise<void>;
    goPrevious(filter?: GoFilter): Promise<void>;
    goLast(filter?: GoFilter): Promise<void>;
    private handleActiveEditorChangeInNavigationStacks;
    private handleActiveEditorSelectionChangeInNavigationStacks;
    private handleEditorCloseEventInHistory;
    private handleEditorGroupRemoveInNavigationStacks;
    private clearEditorNavigationStacks;
    private removeFromEditorNavigationStacks;
    private moveInEditorNavigationStacks;
    private withEachEditorNavigationStack;
    private disposeEditorNavigationStacks;
    private recentlyUsedEditorsStack;
    private recentlyUsedEditorsStackIndex;
    private recentlyUsedEditorsInGroupStack;
    private recentlyUsedEditorsInGroupStackIndex;
    private navigatingInRecentlyUsedEditorsStack;
    private navigatingInRecentlyUsedEditorsInGroupStack;
    openNextRecentlyUsedEditor(groupId?: GroupIdentifier): Promise<void>;
    openPreviouslyUsedEditor(groupId?: GroupIdentifier): Promise<void>;
    private doNavigateInRecentlyUsedEditorsStack;
    private ensureRecentlyUsedStack;
    private handleEditorEventInRecentEditorsStack;
    private static readonly MAX_RECENTLY_CLOSED_EDITORS;
    private recentlyClosedEditors;
    private ignoreEditorCloseEvent;
    private handleEditorCloseEventInReopen;
    reopenLastClosedEditor(): Promise<void>;
    private doReopenLastClosedEditor;
    private removeFromRecentlyClosedEditors;
    private static readonly MAX_HISTORY_ITEMS;
    private static readonly HISTORY_STORAGE_KEY;
    private history;
    private readonly editorHistoryListeners;
    private readonly resourceExcludeMatcher;
    private handleActiveEditorChangeInHistory;
    private addToHistory;
    private updateHistoryOnEditorDispose;
    private includeInHistory;
    private removeExcludedFromHistory;
    private moveInHistory;
    removeFromHistory(arg1: EditorInput | IResourceEditorInput | FileChangesEvent | FileOperationEvent): boolean;
    private replaceInHistory;
    clearRecentlyOpened(): void;
    getHistory(): readonly (EditorInput | IResourceEditorInput)[];
    private ensureHistoryLoaded;
    private loadHistory;
    private loadHistoryFromStorage;
    private saveState;
    getLastActiveWorkspaceRoot(schemeFilter?: string, authorityFilter?: string): URI | undefined;
    getLastActiveFile(filterByScheme: string, filterByAuthority?: string): URI | undefined;
    dispose(): void;
}
interface IEditorNavigationStackEntry {
    groupId: GroupIdentifier;
    editor: EditorInput | IResourceEditorInput;
    selection?: IEditorPaneSelection;
}
export declare class EditorNavigationStack extends Disposable {
    private readonly filter;
    private readonly scope;
    private readonly instantiationService;
    private readonly editorService;
    private readonly editorGroupService;
    private readonly logService;
    private static readonly MAX_STACK_SIZE;
    private readonly _onDidChange;
    readonly onDidChange: any;
    private readonly mapEditorToDisposable;
    private readonly mapGroupToDisposable;
    private readonly editorHelper;
    private stack;
    private index;
    private previousIndex;
    private navigating;
    private currentSelectionState;
    get current(): IEditorNavigationStackEntry | undefined;
    private set current(value);
    constructor(filter: GoFilter, scope: GoScope, instantiationService: IInstantiationService, editorService: IEditorService, editorGroupService: IEditorGroupsService, logService: ILogService);
    private registerListeners;
    private traceStack;
    private trace;
    private traceEvent;
    private registerGroupListeners;
    private onWillMoveEditor;
    notifyNavigation(editorPane: IEditorPane | undefined, event?: IEditorPaneSelectionChangeEvent): void;
    private onSelectionAwareEditorNavigation;
    private onNonSelectionAwareEditorNavigation;
    private doAdd;
    private doReplace;
    addOrReplace(groupId: GroupIdentifier, editorCandidate: EditorInput | IResourceEditorInput, selection?: IEditorPaneSelection, forceReplace?: boolean): void;
    private shouldReplaceStackEntry;
    move(event: FileOperationEvent): void;
    remove(arg1: EditorInput | FileChangesEvent | FileOperationEvent | GroupIdentifier): void;
    private flatten;
    clear(): void;
    dispose(): void;
    canGoForward(): boolean;
    goForward(): Promise<void>;
    canGoBack(): boolean;
    goBack(): Promise<void>;
    goPrevious(): Promise<void>;
    canGoLast(): boolean;
    goLast(): Promise<void>;
    private maybeGoCurrent;
    private isCurrentSelectionActive;
    private setIndex;
    private navigate;
    private doNavigate;
    isNavigating(): boolean;
}
export {};