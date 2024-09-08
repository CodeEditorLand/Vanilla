import type { CancellationToken } from "../../../base/common/cancellation.js";
import { Disposable, type IDisposable } from "../../../base/common/lifecycle.js";
import type { ReadableStreamEvents } from "../../../base/common/stream.js";
import type { URI } from "../../../base/common/uri.js";
import { FileSystemProviderCapabilities, type FileType, type IFileAtomicOptions, type IFileAtomicReadOptions, type IFileChange, type IFileDeleteOptions, type IFileOpenOptions, type IFileOverwriteOptions, type IFileReadStreamOptions, type IFileSystemProviderWithFileAtomicDeleteCapability, type IFileSystemProviderWithFileAtomicReadCapability, type IFileSystemProviderWithFileAtomicWriteCapability, type IFileSystemProviderWithFileCloneCapability, type IFileSystemProviderWithFileFolderCopyCapability, type IFileSystemProviderWithFileReadStreamCapability, type IFileSystemProviderWithFileReadWriteCapability, type IFileSystemProviderWithOpenReadWriteCloseCapability, type IFileWriteOptions, type IStat, type IWatchOptions } from "../../files/common/files.js";
import type { ILogService } from "../../log/common/log.js";
import type { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import type { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
/**
 * This is a wrapper on top of the local filesystem provider which will
 * 	- Convert the user data resources to file system scheme and vice-versa
 *  - Enforces atomic reads for user data
 */
export declare class FileUserDataProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileAtomicWriteCapability, IFileSystemProviderWithFileAtomicDeleteCapability, IFileSystemProviderWithFileCloneCapability {
    private readonly fileSystemScheme;
    private readonly fileSystemProvider;
    private readonly userDataScheme;
    private readonly userDataProfilesService;
    private readonly uriIdentityService;
    private readonly logService;
    readonly capabilities: FileSystemProviderCapabilities;
    readonly onDidChangeCapabilities: import("../../../base/common/event.js").Event<void>;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: import("../../../base/common/event.js").Event<readonly IFileChange[]>;
    private readonly watchResources;
    private readonly atomicReadWriteResources;
    constructor(fileSystemScheme: string, fileSystemProvider: IFileSystemProviderWithFileReadWriteCapability & IFileSystemProviderWithOpenReadWriteCloseCapability & IFileSystemProviderWithFileReadStreamCapability & IFileSystemProviderWithFileAtomicReadCapability & IFileSystemProviderWithFileAtomicWriteCapability & IFileSystemProviderWithFileAtomicDeleteCapability, userDataScheme: string, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, logService: ILogService);
    private updateAtomicReadWritesResources;
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    stat(resource: URI): Promise<IStat>;
    mkdir(resource: URI): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    readFile(resource: URI, opts?: IFileAtomicReadOptions): Promise<Uint8Array>;
    readFileStream(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    enforceAtomicReadFile(resource: URI): boolean;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    enforceAtomicWriteFile(resource: URI): IFileAtomicOptions | false;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    copy(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    cloneFile(from: URI, to: URI): Promise<void>;
    private handleFileChanges;
    private toFileSystemResource;
    private toUserDataResource;
}
