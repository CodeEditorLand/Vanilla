import type * as vscode from "vscode";
import type { IMarkdownString } from "../../../base/common/htmlContent.js";
import { type IDisposable } from "../../../base/common/lifecycle.js";
import { type IExtUri } from "../../../base/common/resources.js";
import { IExtHostFileSystemInfo } from "./extHostFileSystemInfo.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
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
    getFileSystemProviderExtUri(scheme: string): IExtUri;
}
export interface IExtHostConsumerFileSystem extends ExtHostConsumerFileSystem {
}
export declare const IExtHostConsumerFileSystem: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostConsumerFileSystem>;
