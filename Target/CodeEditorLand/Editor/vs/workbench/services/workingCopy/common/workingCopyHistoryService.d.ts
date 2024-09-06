import { CancellationToken } from "vs/base/common/cancellation";
import { Emitter } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IFileService } from "vs/platform/files/common/files";
import { ILabelService } from "vs/platform/label/common/label";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { SaveSource } from "vs/workbench/common/editor";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { IWorkingCopyHistoryEntry, IWorkingCopyHistoryEntryDescriptor, IWorkingCopyHistoryEvent, IWorkingCopyHistoryService } from "vs/workbench/services/workingCopy/common/workingCopyHistory";
export interface IWorkingCopyHistoryModelOptions {
    /**
     * Whether to flush when the model changes. If not
     * configured, `model.store()` has to be called
     * explicitly.
     */
    flushOnChange: boolean;
}
export declare class WorkingCopyHistoryModel {
    private readonly historyHome;
    private readonly entryAddedEmitter;
    private readonly entryChangedEmitter;
    private readonly entryReplacedEmitter;
    private readonly entryRemovedEmitter;
    private readonly options;
    private readonly fileService;
    private readonly labelService;
    private readonly logService;
    private readonly configurationService;
    static readonly ENTRIES_FILE = "entries.json";
    private static readonly FILE_SAVED_SOURCE;
    private static readonly SETTINGS;
    private entries;
    private whenResolved;
    private workingCopyResource;
    private workingCopyName;
    private historyEntriesFolder;
    private historyEntriesListingFile;
    private historyEntriesNameMatcher;
    private versionId;
    private storedVersionId;
    private readonly storeLimiter;
    constructor(workingCopyResource: URI, historyHome: URI, entryAddedEmitter: Emitter<IWorkingCopyHistoryEvent>, entryChangedEmitter: Emitter<IWorkingCopyHistoryEvent>, entryReplacedEmitter: Emitter<IWorkingCopyHistoryEvent>, entryRemovedEmitter: Emitter<IWorkingCopyHistoryEvent>, options: IWorkingCopyHistoryModelOptions, fileService: IFileService, labelService: ILabelService, logService: ILogService, configurationService: IConfigurationService);
    private setWorkingCopy;
    private toHistoryEntriesFolder;
    addEntry(source: any, sourceDescription: string | undefined, timestamp: number | undefined, token: CancellationToken): Promise<IWorkingCopyHistoryEntry>;
    private doAddEntry;
    private doReplaceEntry;
    removeEntry(entry: IWorkingCopyHistoryEntry, token: CancellationToken): Promise<boolean>;
    updateEntry(entry: IWorkingCopyHistoryEntry, properties: {
        source: SaveSource;
    }, token: CancellationToken): Promise<void>;
    getEntries(): Promise<readonly IWorkingCopyHistoryEntry[]>;
    hasEntries(skipResolve: boolean): Promise<boolean>;
    private resolveEntriesOnce;
    private doResolveEntries;
    private resolveEntriesFromDisk;
    moveEntries(target: WorkingCopyHistoryModel, source: SaveSource, token: CancellationToken): Promise<void>;
    store(token: CancellationToken): Promise<void>;
    private shouldStore;
    private doStore;
    private cleanUpEntries;
    private deleteEntry;
    private writeEntriesFile;
    private readEntriesFile;
    private readEntriesFolder;
    private isFileNotFound;
    private traceError;
}
export declare abstract class WorkingCopyHistoryService extends Disposable implements IWorkingCopyHistoryService {
    protected readonly fileService: IFileService;
    protected readonly remoteAgentService: IRemoteAgentService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly labelService: ILabelService;
    protected readonly logService: ILogService;
    protected readonly configurationService: IConfigurationService;
    private static readonly FILE_MOVED_SOURCE;
    private static readonly FILE_RENAMED_SOURCE;
    readonly _serviceBrand: undefined;
    protected readonly _onDidAddEntry: any;
    readonly onDidAddEntry: any;
    protected readonly _onDidChangeEntry: any;
    readonly onDidChangeEntry: any;
    protected readonly _onDidReplaceEntry: any;
    readonly onDidReplaceEntry: any;
    private readonly _onDidMoveEntries;
    readonly onDidMoveEntries: any;
    protected readonly _onDidRemoveEntry: any;
    readonly onDidRemoveEntry: any;
    private readonly _onDidRemoveEntries;
    readonly onDidRemoveEntries: any;
    private readonly localHistoryHome;
    protected readonly models: any;
    constructor(fileService: IFileService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, labelService: ILabelService, logService: ILogService, configurationService: IConfigurationService);
    private resolveLocalHistoryHome;
    moveEntries(source: URI, target: URI): Promise<URI[]>;
    private doMoveEntries;
    addEntry({ resource, source, timestamp }: IWorkingCopyHistoryEntryDescriptor, token: CancellationToken): Promise<IWorkingCopyHistoryEntry | undefined>;
    updateEntry(entry: IWorkingCopyHistoryEntry, properties: {
        source: SaveSource;
    }, token: CancellationToken): Promise<void>;
    removeEntry(entry: IWorkingCopyHistoryEntry, token: CancellationToken): Promise<boolean>;
    removeAll(token: CancellationToken): Promise<void>;
    getEntries(resource: URI, token: CancellationToken): Promise<readonly IWorkingCopyHistoryEntry[]>;
    getAll(token: CancellationToken): Promise<readonly URI[]>;
    private getModel;
    protected abstract getModelOptions(): IWorkingCopyHistoryModelOptions;
}
export declare class NativeWorkingCopyHistoryService extends WorkingCopyHistoryService {
    private readonly lifecycleService;
    private static readonly STORE_ALL_INTERVAL;
    private readonly isRemotelyStored;
    private readonly storeAllCts;
    private readonly storeAllScheduler;
    constructor(fileService: IFileService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, labelService: ILabelService, lifecycleService: ILifecycleService, logService: ILogService, configurationService: IConfigurationService);
    private registerListeners;
    protected getModelOptions(): IWorkingCopyHistoryModelOptions;
    private onWillShutdown;
    private onDidChangeModels;
    private storeAll;
}
