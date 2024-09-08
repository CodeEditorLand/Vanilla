import type { Emitter } from "../../../base/common/event.js";
import { URI, type UriComponents } from "../../../base/common/uri.js";
import { type IURITransformer } from "../../../base/common/uriIpc.js";
import type { IEnvironmentService } from "../../environment/common/environment.js";
import type { ILogService } from "../../log/common/log.js";
import { type IFileChange, type IFileDeleteOptions } from "../common/files.js";
import type { DiskFileSystemProvider } from "../node/diskFileSystemProvider.js";
import { AbstractDiskFileSystemProviderChannel, type ISessionFileWatcher } from "../node/diskFileSystemProviderServer.js";
export declare class DiskFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel<unknown> {
    private readonly environmentService;
    constructor(provider: DiskFileSystemProvider, logService: ILogService, environmentService: IEnvironmentService);
    protected getUriTransformer(ctx: unknown): IURITransformer;
    protected transformIncoming(uriTransformer: IURITransformer, _resource: UriComponents): URI;
    protected delete(uriTransformer: IURITransformer, _resource: UriComponents, opts: IFileDeleteOptions): Promise<void>;
    protected createSessionFileWatcher(uriTransformer: IURITransformer, emitter: Emitter<IFileChange[] | string>): ISessionFileWatcher;
}
