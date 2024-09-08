import { type Event } from "../../base/common/event.js";
import { type DisposableStore } from "../../base/common/lifecycle.js";
import { IPCServer, type IMessagePassingProtocol } from "../../base/parts/ipc/common/ipc.js";
import type { IInstantiationService } from "../../platform/instantiation/common/instantiation.js";
import type { RemoteAgentConnectionContext } from "../../platform/remote/common/remoteAgentEnvironment.js";
import type { ServerConnectionToken } from "./serverConnectionToken.js";
import { type ServerParsedArgs } from "./serverEnvironmentService.js";
export declare function setupServerServices(connectionToken: ServerConnectionToken, args: ServerParsedArgs, REMOTE_DATA_FOLDER: string, disposables: DisposableStore): Promise<{
    socketServer: SocketServer<RemoteAgentConnectionContext>;
    instantiationService: IInstantiationService;
}>;
export declare class SocketServer<TContext = string> extends IPCServer<TContext> {
    private _onDidConnectEmitter;
    constructor();
    acceptConnection(protocol: IMessagePassingProtocol, onDidClientDisconnect: Event<void>): void;
}
