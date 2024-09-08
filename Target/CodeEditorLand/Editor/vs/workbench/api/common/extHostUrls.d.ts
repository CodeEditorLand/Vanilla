import type * as vscode from "vscode";
import { URI, type UriComponents } from "../../../base/common/uri.js";
import { type IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type ExtHostUrlsShape, type IMainContext } from "./extHost.protocol.js";
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
