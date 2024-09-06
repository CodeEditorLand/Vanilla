import { IndexedDB } from "vs/base/browser/indexedDB";
import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { FileSystemProviderCapabilities, FileType, IFileChange, IFileDeleteOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IFileWriteOptions, IStat, IWatchOptions } from "vs/platform/files/common/files";
export type IndexedDBFileSystemProviderErrorDataClassification = {
    owner: "sandy081";
    comment: "Information about errors that occur in the IndexedDB file system provider";
    readonly scheme: {
        classification: "SystemMetaData";
        purpose: "FeatureInsight";
        comment: "IndexedDB file system provider scheme for which this error occurred";
    };
    readonly operation: {
        classification: "SystemMetaData";
        purpose: "FeatureInsight";
        comment: "operation during which this error occurred";
    };
    readonly code: {
        classification: "SystemMetaData";
        purpose: "PerformanceAndHealth";
        comment: "error code";
    };
};
export type IndexedDBFileSystemProviderErrorData = {
    readonly scheme: string;
    readonly operation: string;
    readonly code: string;
};
type DirEntry = [string, FileType];
export declare class IndexedDBFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability {
    readonly scheme: string;
    private indexedDB;
    private readonly store;
    readonly capabilities: FileSystemProviderCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    private readonly extUri;
    private readonly changesBroadcastChannel;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    private readonly _onReportError;
    readonly onReportError: any;
    private readonly mtimes;
    private cachedFiletree;
    private writeManyThrottler;
    constructor(scheme: string, indexedDB: IndexedDB, store: string, watchCrossWindowChanges: boolean);
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    mkdir(resource: URI): Promise<void>;
    stat(resource: URI): Promise<IStat>;
    readdir(resource: URI): Promise<DirEntry[]>;
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    private tree;
    private triggerChanges;
    private getFiletree;
    private bulkWrite;
    private fileWriteBatch;
    private writeMany;
    private deleteKeys;
    reset(): Promise<void>;
    private reportError;
}
export {};
