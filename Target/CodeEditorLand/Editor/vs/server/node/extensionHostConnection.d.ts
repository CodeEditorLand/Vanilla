import { VSBuffer } from "vs/base/common/buffer";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IProcessEnvironment } from "vs/base/common/platform";
import { NodeSocket, WebSocketNodeSocket } from "vs/base/parts/ipc/node/ipc.net";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILogService } from "vs/platform/log/common/log";
import { IRemoteExtensionHostStartParams } from "vs/platform/remote/common/remoteAgentConnection";
import { IExtensionHostStatusService } from "vs/server/node/extensionHostStatusService";
import { IServerEnvironmentService } from "vs/server/node/serverEnvironmentService";
export declare function buildUserEnvironment(startParamsEnv: {
    [key: string]: string | null;
} | undefined, withUserShellEnvironment: boolean, language: string, environmentService: IServerEnvironmentService, logService: ILogService, configurationService: IConfigurationService): Promise<IProcessEnvironment>;
export declare class ExtensionHostConnection extends Disposable {
    private readonly _reconnectionToken;
    private readonly _environmentService;
    private readonly _logService;
    private readonly _extensionHostStatusService;
    private readonly _configurationService;
    private _onClose;
    readonly onClose: Event<void>;
    private readonly _canSendSocket;
    private _disposed;
    private _remoteAddress;
    private _extensionHostProcess;
    private _connectionData;
    constructor(_reconnectionToken: string, remoteAddress: string, socket: NodeSocket | WebSocketNodeSocket, initialDataChunk: VSBuffer, _environmentService: IServerEnvironmentService, _logService: ILogService, _extensionHostStatusService: IExtensionHostStatusService, _configurationService: IConfigurationService);
    dispose(): void;
    private get _logPrefix();
    private _log;
    private _logError;
    private _pipeSockets;
    private _sendSocketToExtensionHost;
    shortenReconnectionGraceTimeIfNecessary(): void;
    acceptReconnection(remoteAddress: string, _socket: NodeSocket | WebSocketNodeSocket, initialDataChunk: VSBuffer): void;
    private _cleanResources;
    start(startParams: IRemoteExtensionHostStartParams): Promise<void>;
    private _listenOnPipe;
}
