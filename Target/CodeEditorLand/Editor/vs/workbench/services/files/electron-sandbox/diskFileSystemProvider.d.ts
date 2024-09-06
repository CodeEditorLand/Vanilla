import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { ReadableStreamEvents } from "vs/base/common/stream";
import { URI } from "vs/base/common/uri";
import { AbstractDiskFileSystemProvider } from "vs/platform/files/common/diskFileSystemProvider";
import { FileSystemProviderCapabilities, FileType, IFileAtomicReadOptions, IFileChange, IFileDeleteOptions, IFileOpenOptions, IFileOverwriteOptions, IFileReadStreamOptions, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileCloneCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileWriteOptions, IStat } from "vs/platform/files/common/files";
import { AbstractUniversalWatcherClient, ILogMessage } from "vs/platform/files/common/watcher";
import { IMainProcessService } from "vs/platform/ipc/common/mainProcessService";
import { ILoggerService, ILogService } from "vs/platform/log/common/log";
import { IUtilityProcessWorkerWorkbenchService } from "vs/workbench/services/utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService";
/**
 * A sandbox ready disk file system provider that delegates almost all calls
 * to the main process via `DiskFileSystemProviderServer` except for recursive
 * file watching that is done via shared process workers due to CPU intensity.
 */
export declare class DiskFileSystemProvider extends AbstractDiskFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileCloneCapability {
    private readonly mainProcessService;
    private readonly utilityProcessWorkerWorkbenchService;
    private readonly loggerService;
    private readonly provider;
    constructor(mainProcessService: IMainProcessService, utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService, logService: ILogService, loggerService: ILoggerService);
    private registerListeners;
    get onDidChangeCapabilities(): Event<void>;
    get capabilities(): FileSystemProviderCapabilities;
    stat(resource: URI): Promise<IStat>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    readFile(resource: URI, opts?: IFileAtomicReadOptions): Promise<Uint8Array>;
    readFileStream(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    mkdir(resource: URI): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    copy(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    cloneFile(from: URI, to: URI): Promise<void>;
    protected createUniversalWatcher(onChange: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean): AbstractUniversalWatcherClient;
    protected createNonRecursiveWatcher(): never;
    private _watcherLogService;
    private get watcherLogService();
    protected logWatcherMessage(msg: ILogMessage): void;
}
