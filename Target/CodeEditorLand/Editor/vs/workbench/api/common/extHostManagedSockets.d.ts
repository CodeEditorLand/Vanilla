import type * as vscode from "vscode";
import { VSBuffer } from "../../../base/common/buffer.js";
import { type ExtHostManagedSocketsShape } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
export interface IExtHostManagedSockets extends ExtHostManagedSocketsShape {
    setFactory(socketFactoryId: number, makeConnection: () => Thenable<vscode.ManagedMessagePassing>): void;
    readonly _serviceBrand: undefined;
}
export declare const IExtHostManagedSockets: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostManagedSockets>;
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
