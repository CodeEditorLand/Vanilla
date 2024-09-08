import { Event } from "../../../../base/common/event.js";
import { type IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { FileType, type IFileDeleteOptions, type IFileOverwriteOptions, type IFileSystemProviderWithFileReadWriteCapability, type IFileWriteOptions, type IStat } from "../../../../platform/files/common/files.js";
export declare class FetchFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability {
    readonly capabilities: number;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    readFile(resource: URI): Promise<Uint8Array>;
    stat(_resource: URI): Promise<IStat>;
    watch(): IDisposable;
    writeFile(_resource: URI, _content: Uint8Array, _opts: IFileWriteOptions): Promise<void>;
    readdir(_resource: URI): Promise<[string, FileType][]>;
    mkdir(_resource: URI): Promise<void>;
    delete(_resource: URI, _opts: IFileDeleteOptions): Promise<void>;
    rename(_from: URI, _to: URI, _opts: IFileOverwriteOptions): Promise<void>;
}
