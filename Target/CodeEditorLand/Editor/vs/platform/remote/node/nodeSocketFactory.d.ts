import { ISocket } from "vs/base/parts/ipc/common/ipc.net";
import { WebSocketRemoteConnection } from "vs/platform/remote/common/remoteAuthorityResolver";
export declare const nodeSocketFactory: {
    supports(connectTo: WebSocketRemoteConnection): boolean;
    connect({ host, port }: WebSocketRemoteConnection, path: string, query: string, debugLabel: string): Promise<ISocket>;
};
