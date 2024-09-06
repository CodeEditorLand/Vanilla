import { VSBuffer } from "../../../base/common/buffer.js";
import { Event } from "../../../base/common/event.js";
import { ISocket, SocketDiagnosticsEventType } from "../../../base/parts/ipc/common/ipc.net.js";
import { RemoteConnectionType, WebSocketRemoteConnection } from "../common/remoteAuthorityResolver.js";
import { ISocketFactory } from "../common/remoteSocketFactoryService.js";
export interface IWebSocketFactory {
    create(url: string, debugLabel: string): IWebSocket;
}
export interface IWebSocketCloseEvent {
    /**
     * Returns the WebSocket connection close code provided by the server.
     */
    readonly code: number;
    /**
     * Returns the WebSocket connection close reason provided by the server.
     */
    readonly reason: string;
    /**
     * Returns true if the connection closed cleanly; false otherwise.
     */
    readonly wasClean: boolean;
    /**
     * Underlying event.
     */
    readonly event: any | undefined;
}
export interface IWebSocket {
    readonly onData: Event<ArrayBuffer>;
    readonly onOpen: Event<void>;
    readonly onClose: Event<IWebSocketCloseEvent | void>;
    readonly onError: Event<any>;
    traceSocketEvent?(type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void;
    send(data: ArrayBuffer | ArrayBufferView): void;
    close(): void;
}
export declare class BrowserSocketFactory implements ISocketFactory<RemoteConnectionType.WebSocket> {
    private readonly _webSocketFactory;
    constructor(webSocketFactory: IWebSocketFactory | null | undefined);
    supports(connectTo: WebSocketRemoteConnection): boolean;
    connect({ host, port }: WebSocketRemoteConnection, path: string, query: string, debugLabel: string): Promise<ISocket>;
}
