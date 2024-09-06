import { IChannel, IPCServer, IServerChannel, StaticRouter } from "vs/base/parts/ipc/common/ipc";
import { IRemoteService } from "vs/platform/ipc/common/services";
export declare const IMainProcessService: any;
export interface IMainProcessService extends IRemoteService {
}
/**
 * An implementation of `IMainProcessService` that leverages `IPCServer`.
 */
export declare class MainProcessService implements IMainProcessService {
    private server;
    private router;
    readonly _serviceBrand: undefined;
    constructor(server: IPCServer, router: StaticRouter);
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
}
