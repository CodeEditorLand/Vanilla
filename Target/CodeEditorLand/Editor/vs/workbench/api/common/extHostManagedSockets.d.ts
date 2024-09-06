import { VSBuffer } from "vs/base/common/buffer";
import { ExtHostManagedSocketsShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import * as vscode from "vscode";
export interface IExtHostManagedSockets extends ExtHostManagedSocketsShape {
    setFactory(socketFactoryId: number, makeConnection: () => Thenable<vscode.ManagedMessagePassing>): void;
    readonly _serviceBrand: undefined;
}
export declare const IExtHostManagedSockets: any;
export declare class ExtHostManagedSockets implements IExtHostManagedSockets {
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    private _remoteSocketIdCounter;
    private _factory;
    private readonly _managedRemoteSockets;
    constructor(extHostRpc: IExtHostRpcService);
    setFactory(socketFactoryId: number, makeConnection: () => Thenable<vscode.ManagedMessagePassing>): void;
    $openRemoteSocket(socketFactoryId: number): Promise<number>;
    $remoteSocketWrite(socketId: number, buffer: VSBuffer): void;
    $remoteSocketEnd(socketId: number): void;
    $remoteSocketDrain(socketId: number): Promise<void>;
}
