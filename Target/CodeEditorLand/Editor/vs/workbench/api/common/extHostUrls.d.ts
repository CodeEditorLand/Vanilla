import { URI, UriComponents } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import type * as vscode from "vscode";
import { ExtHostUrlsShape, IMainContext } from "./extHost.protocol";
export declare class ExtHostUrls implements ExtHostUrlsShape {
    private static HandlePool;
    private readonly _proxy;
    private handles;
    private handlers;
    constructor(mainContext: IMainContext);
    registerUriHandler(extension: IExtensionDescription, handler: vscode.UriHandler): vscode.Disposable;
    $handleExternalUri(handle: number, uri: UriComponents): Promise<void>;
    createAppUri(uri: URI): Promise<vscode.Uri>;
}
