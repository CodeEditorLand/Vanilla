import { Client, IClientRouter, IConnectionHub } from "vs/base/parts/ipc/common/ipc";
export declare const NODE_REMOTE_RESOURCE_IPC_METHOD_NAME = "request";
export declare const NODE_REMOTE_RESOURCE_CHANNEL_NAME = "remoteResourceHandler";
export type NodeRemoteResourceResponse = {
    body: string;
    mimeType?: string;
    statusCode: number;
};
export declare class NodeRemoteResourceRouter implements IClientRouter<string> {
    routeCall(hub: IConnectionHub<string>, command: string, arg?: any): Promise<Client<string>>;
    routeEvent(_: IConnectionHub<string>, event: string): Promise<Client<string>>;
}
