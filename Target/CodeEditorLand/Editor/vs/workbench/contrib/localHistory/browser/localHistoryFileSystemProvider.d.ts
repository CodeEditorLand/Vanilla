import { Event } from "../../../../base/common/event.js";
import { type IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { FileType, type IFileDeleteOptions, type IFileOverwriteOptions, type IFileService, type IFileSystemProvider, type IFileSystemProviderWithFileReadWriteCapability, type IFileWriteOptions, type IStat, type IWatchOptions } from "../../../../platform/files/common/files.js";
interface ILocalHistoryResource {
    /**
     * The location of the local history entry to read from.
     */
    readonly location: URI;
    /**
     * The associated resource the local history entry is about.
     */
    readonly associatedResource: URI;
}
/**
 * A wrapper around a standard file system provider
 * that is entirely readonly.
 */
export declare class LocalHistoryFileSystemProvider implements IFileSystemProvider, IFileSystemProviderWithFileReadWriteCapability {
    private readonly fileService;
    static readonly SCHEMA = "vscode-local-history";
    static toLocalHistoryFileSystem(resource: ILocalHistoryResource): URI;
    static fromLocalHistoryFileSystem(resource: URI): ILocalHistoryResource;
    private static readonly EMPTY_RESOURCE;
    static readonly EMPTY: ILocalHistoryResource;
    get capabilities(): number;
    constructor(fileService: IFileService);
    private readonly mapSchemeToProvider;
    private withProvider;
    stat(resource: URI): Promise<IStat>;
    readFile(resource: URI): Promise<Uint8Array>;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
}
export {};
