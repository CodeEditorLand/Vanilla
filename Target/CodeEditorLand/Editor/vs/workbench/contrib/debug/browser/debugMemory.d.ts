import { URI } from "vs/base/common/uri";
import { IFileOpenOptions, IFileSystemProvider, IStat, IWatchOptions } from "vs/platform/files/common/files";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
export declare class DebugMemoryFileSystemProvider implements IFileSystemProvider {
    private readonly debugService;
    private memoryFdCounter;
    private readonly fdMemory;
    private readonly changeEmitter;
    /** @inheritdoc */
    readonly onDidChangeCapabilities: any;
    /** @inheritdoc */
    readonly onDidChangeFile: any;
    /** @inheritdoc */
    readonly capabilities: number;
    constructor(debugService: IDebugService);
    watch(resource: URI, opts: IWatchOptions): any;
    /** @inheritdoc */
    stat(file: URI): Promise<IStat>;
    /** @inheritdoc */
    mkdir(): never;
    /** @inheritdoc */
    readdir(): never;
    /** @inheritdoc */
    delete(): never;
    /** @inheritdoc */
    rename(): never;
    /** @inheritdoc */
    open(resource: URI, _opts: IFileOpenOptions): Promise<number>;
    /** @inheritdoc */
    close(fd: number): Promise<void>;
    /** @inheritdoc */
    writeFile(resource: URI, content: Uint8Array): Promise<void>;
    /** @inheritdoc */
    readFile(resource: URI): Promise<Uint8Array>;
    /** @inheritdoc */
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    /** @inheritdoc */
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    protected parseUri(uri: URI): {
        session: any;
        offset: {
            fromOffset: number;
            toOffset: number;
        } | undefined;
        readOnly: boolean;
        sessionId: any;
        memoryReference: string;
    };
}
