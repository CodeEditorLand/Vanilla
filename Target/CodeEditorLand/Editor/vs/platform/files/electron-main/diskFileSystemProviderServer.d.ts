import { Emitter } from "../../../base/common/event.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IURITransformer } from "../../../base/common/uriIpc.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { ILogService } from "../../log/common/log.js";
import { IFileChange, IFileDeleteOptions } from "../common/files.js";
import { DiskFileSystemProvider } from "../node/diskFileSystemProvider.js";
import { AbstractDiskFileSystemProviderChannel, ISessionFileWatcher } from "../node/diskFileSystemProviderServer.js";
export declare class DiskFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel<unknown> {
    private readonly environmentService;
    constructor(provider: DiskFileSystemProvider, logService: ILogService, environmentService: IEnvironmentService);
    protected getUriTransformer(ctx: unknown): IURITransformer;
    protected transformIncoming(uriTransformer: IURITransformer, _resource: UriComponents): URI;
    protected delete(uriTransformer: IURITransformer, _resource: UriComponents, opts: IFileDeleteOptions): Promise<void>;
    protected createSessionFileWatcher(uriTransformer: IURITransformer, emitter: Emitter<IFileChange[] | string>): ISessionFileWatcher;
}
