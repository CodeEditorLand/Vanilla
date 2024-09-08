import type { VSBuffer } from "../../base/common/buffer.js";
import { type Event } from "../../base/common/event.js";
import { type ISocket, type PersistentProtocol } from "../../base/parts/ipc/common/ipc.net.js";
import type { ILogService } from "../../platform/log/common/log.js";
export declare class ManagementConnection {
    private readonly _logService;
    private readonly _reconnectionToken;
    private _onClose;
    readonly onClose: Event<void>;
    private readonly _reconnectionGraceTime;
    private readonly _reconnectionShortGraceTime;
    private _remoteAddress;
    readonly protocol: PersistentProtocol;
    private _disposed;
    private _disconnectRunner1;
    private _disconnectRunner2;
    constructor(_logService: ILogService, _reconnectionToken: string, remoteAddress: string, protocol: PersistentProtocol);
    private _log;
    shortenReconnectionGraceTimeIfNecessary(): void;
    private _cleanResources;
    acceptReconnection(remoteAddress: string, socket: ISocket, initialDataChunk: VSBuffer): void;
}
