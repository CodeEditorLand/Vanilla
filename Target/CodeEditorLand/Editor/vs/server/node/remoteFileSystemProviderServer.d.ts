import type { Emitter } from "../../base/common/event.js";
import { URI, type UriComponents } from "../../base/common/uri.js";
import type { IURITransformer } from "../../base/common/uriIpc.js";
import type { IFileChange } from "../../platform/files/common/files.js";
import { AbstractDiskFileSystemProviderChannel, type ISessionFileWatcher } from "../../platform/files/node/diskFileSystemProviderServer.js";
import type { ILogService } from "../../platform/log/common/log.js";
import type { RemoteAgentConnectionContext } from "../../platform/remote/common/remoteAgentEnvironment.js";
import type { IServerEnvironmentService } from "./serverEnvironmentService.js";
export declare class RemoteAgentFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel<RemoteAgentConnectionContext> {
    private readonly environmentService;
    private readonly uriTransformerCache;
    constructor(logService: ILogService, environmentService: IServerEnvironmentService);
    protected getUriTransformer(ctx: RemoteAgentConnectionContext): IURITransformer;
    protected transformIncoming(uriTransformer: IURITransformer, _resource: UriComponents, supportVSCodeResource?: boolean): URI;
    protected createSessionFileWatcher(uriTransformer: IURITransformer, emitter: Emitter<IFileChange[] | string>): ISessionFileWatcher;
}
