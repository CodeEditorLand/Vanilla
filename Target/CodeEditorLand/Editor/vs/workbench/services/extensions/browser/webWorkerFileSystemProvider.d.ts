import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IFileWriteOptions, IStat } from "vs/platform/files/common/files";
export declare class FetchFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability {
    readonly capabilities: any;
    readonly onDidChangeCapabilities: any;
    readonly onDidChangeFile: any;
    readFile(resource: URI): Promise<Uint8Array>;
    stat(_resource: URI): Promise<IStat>;
    watch(): IDisposable;
    writeFile(_resource: URI, _content: Uint8Array, _opts: IFileWriteOptions): Promise<void>;
    readdir(_resource: URI): Promise<[string, FileType][]>;
    mkdir(_resource: URI): Promise<void>;
    delete(_resource: URI, _opts: IFileDeleteOptions): Promise<void>;
    rename(_from: URI, _to: URI, _opts: IFileOverwriteOptions): Promise<void>;
}
