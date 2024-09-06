import { IDisposable } from "vs/base/common/lifecycle";
import { ISocket } from "vs/base/parts/ipc/common/ipc.net";
import { RemoteConnection, RemoteConnectionOfType, RemoteConnectionType } from "vs/platform/remote/common/remoteAuthorityResolver";
export declare const IRemoteSocketFactoryService: any;
export interface IRemoteSocketFactoryService {
    readonly _serviceBrand: undefined;
    /**
     * Register a socket factory for the given message passing type
     * @param type passing type to register for
     * @param factory function that returns the socket factory, or undefined if
     * it can't handle the data.
     */
    register<T extends RemoteConnectionType>(type: T, factory: ISocketFactory<T>): IDisposable;
    connect(connectTo: RemoteConnection, path: string, query: string, debugLabel: string): Promise<ISocket>;
}
export interface ISocketFactory<T extends RemoteConnectionType> {
    supports(connectTo: RemoteConnectionOfType<T>): boolean;
    connect(connectTo: RemoteConnectionOfType<T>, path: string, query: string, debugLabel: string): Promise<ISocket>;
}
export declare class RemoteSocketFactoryService implements IRemoteSocketFactoryService {
    readonly _serviceBrand: undefined;
    private readonly factories;
    register<T extends RemoteConnectionType>(type: T, factory: ISocketFactory<T>): IDisposable;
    private getSocketFactory;
    connect(connectTo: RemoteConnection, path: string, query: string, debugLabel: string): Promise<ISocket>;
}
