import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { FileSystemProviderCapabilities, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
export declare class SettingsFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability {
    private readonly preferencesService;
    private readonly logService;
    static readonly SCHEMA: any;
    protected readonly _onDidChangeFile: any;
    readonly onDidChangeFile: any;
    constructor(preferencesService: IPreferencesService, logService: ILogService);
    readonly capabilities: FileSystemProviderCapabilities;
    readFile(uri: URI): Promise<Uint8Array>;
    stat(uri: URI): Promise<IStat>;
    readonly onDidChangeCapabilities: any;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    writeFile(): Promise<void>;
    private getSchemaContent;
}
