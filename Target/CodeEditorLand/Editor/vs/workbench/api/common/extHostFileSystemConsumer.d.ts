import { IMarkdownString } from "vs/base/common/htmlContent";
import { IDisposable } from "vs/base/common/lifecycle";
import { IExtHostFileSystemInfo } from "vs/workbench/api/common/extHostFileSystemInfo";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import type * as vscode from "vscode";
export declare class ExtHostConsumerFileSystem {
    readonly _serviceBrand: undefined;
    readonly value: vscode.FileSystem;
    private readonly _proxy;
    private readonly _fileSystemProvider;
    private readonly _writeQueue;
    constructor(extHostRpc: IExtHostRpcService, fileSystemInfo: IExtHostFileSystemInfo);
    private mkdirp;
    private static _handleError;
    addFileSystemProvider(scheme: string, provider: vscode.FileSystemProvider, options?: {
        isCaseSensitive?: boolean;
        isReadonly?: boolean | IMarkdownString;
    }): IDisposable;
    getFileSystemProviderExtUri(scheme: string): any;
}
export interface IExtHostConsumerFileSystem extends ExtHostConsumerFileSystem {
}
export declare const IExtHostConsumerFileSystem: any;
