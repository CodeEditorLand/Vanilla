import { Event } from "../../../../base/common/event.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { FileSystemProviderCapabilities, FileType, IFileService, type IFileDeleteOptions, type IFileOverwriteOptions, type IFileSystemProviderWithFileReadWriteCapability, type IFileWriteOptions, type IStat, type IWatchOptions } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
export declare class TrustedDomainsFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability, IWorkbenchContribution {
    private readonly fileService;
    private readonly storageService;
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.trustedDomainsFileSystemProvider";
    readonly capabilities = FileSystemProviderCapabilities.FileReadWrite;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
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