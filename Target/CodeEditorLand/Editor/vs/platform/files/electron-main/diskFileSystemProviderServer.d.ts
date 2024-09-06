import { Emitter } from "vs/base/common/event";
import { URI, UriComponents } from "vs/base/common/uri";
import { IURITransformer } from "vs/base/common/uriIpc";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileChange, IFileDeleteOptions } from "vs/platform/files/common/files";
import { DiskFileSystemProvider } from "vs/platform/files/node/diskFileSystemProvider";
import { AbstractDiskFileSystemProviderChannel, ISessionFileWatcher } from "vs/platform/files/node/diskFileSystemProviderServer";
import { ILogService } from "vs/platform/log/common/log";
export declare class DiskFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel<unknown> {
    private readonly environmentService;
    constructor(provider: DiskFileSystemProvider, logService: ILogService, environmentService: IEnvironmentService);
    protected getUriTransformer(ctx: unknown): IURITransformer;
    protected transformIncoming(uriTransformer: IURITransformer, _resource: UriComponents): URI;
    protected delete(uriTransformer: IURITransformer, _resource: UriComponents, opts: IFileDeleteOptions): Promise<void>;
    protected createSessionFileWatcher(uriTransformer: IURITransformer, emitter: Emitter<IFileChange[] | string>): ISessionFileWatcher;
}
