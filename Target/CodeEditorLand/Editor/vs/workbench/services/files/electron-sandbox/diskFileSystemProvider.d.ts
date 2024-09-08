import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { Event } from "../../../../base/common/event.js";
import type { ReadableStreamEvents } from "../../../../base/common/stream.js";
import type { URI } from "../../../../base/common/uri.js";
import { AbstractDiskFileSystemProvider } from "../../../../platform/files/common/diskFileSystemProvider.js";
import type { FileSystemProviderCapabilities, FileType, IFileAtomicReadOptions, IFileChange, IFileDeleteOptions, IFileOpenOptions, IFileOverwriteOptions, IFileReadStreamOptions, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileCloneCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileWriteOptions, IStat } from "../../../../platform/files/common/files.js";
import type { AbstractUniversalWatcherClient, ILogMessage } from "../../../../platform/files/common/watcher.js";
import type { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import type { ILoggerService, ILogService } from "../../../../platform/log/common/log.js";
import type { IUtilityProcessWorkerWorkbenchService } from "../../utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService.js";
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
