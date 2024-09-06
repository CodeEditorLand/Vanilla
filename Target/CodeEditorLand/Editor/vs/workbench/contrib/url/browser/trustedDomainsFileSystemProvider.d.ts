import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileService, IFileSystemProviderWithFileReadWriteCapability, IFileWriteOptions, IStat, IWatchOptions } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
export declare class TrustedDomainsFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability, IWorkbenchContribution {
    private readonly fileService;
    private readonly storageService;
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.trustedDomainsFileSystemProvider";
    readonly capabilities: any;
    readonly onDidChangeCapabilities: any;
    readonly onDidChangeFile: any;
    constructor(fileService: IFileService, storageService: IStorageService, instantiationService: IInstantiationService);
    stat(resource: URI): Promise<IStat>;
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
}
