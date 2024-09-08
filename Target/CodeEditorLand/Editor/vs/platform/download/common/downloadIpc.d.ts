import type { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import type { IURITransformer } from "../../../base/common/uriIpc.js";
import type { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import type { IDownloadService } from "./download.js";
export declare class DownloadServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IDownloadService);
    listen(_: unknown, event: string, arg?: any): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class DownloadServiceChannelClient implements IDownloadService {
    private channel;
    private getUriTransformer;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel, getUriTransformer: () => IURITransformer | null);
    download(from: URI, to: URI): Promise<void>;
}
