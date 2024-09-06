import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { ReadableStreamEvents } from "vs/base/common/stream";
import { URI } from "vs/base/common/uri";
import { FileSystemProviderCapabilities, FileType, IFileChange, IFileDeleteOptions, IFileOpenOptions, IFileOverwriteOptions, IFileSystemProviderWithFileAtomicDeleteCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileAtomicWriteCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileWriteOptions, IStat, IWatchOptions } from "vs/platform/files/common/files";
declare class File implements IStat {
    readonly type: FileType.File;
    readonly ctime: number;
    mtime: number;
    size: number;
    name: string;
    data?: Uint8Array;
    constructor(name: string);
}
declare class Directory implements IStat {
    readonly type: FileType.Directory;
    readonly ctime: number;
    mtime: number;
    size: number;
    name: string;
    readonly entries: Map<string, File | Directory>;
    constructor(name: string);
}
export declare class InMemoryFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileAtomicWriteCapability, IFileSystemProviderWithFileAtomicDeleteCapability {
    private memoryFdCounter;
    private readonly fdMemory;
    private _onDidChangeCapabilities;
    readonly onDidChangeCapabilities: any;
    private _capabilities;
    get capabilities(): FileSystemProviderCapabilities;
    setReadOnly(readonly: boolean): void;
    root: Directory;
    stat(resource: URI): Promise<IStat>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    readFile(resource: URI): Promise<Uint8Array>;
    readFileStream(resource: URI): ReadableStreamEvents<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    mkdir(resource: URI): Promise<void>;
    private _lookup;
    private _lookupAsDirectory;
    private _lookupAsFile;
    private _lookupParentDirectory;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    private _bufferedChanges;
    private _fireSoonHandle?;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    private _fireSoon;
    dispose(): void;
}
export {};
