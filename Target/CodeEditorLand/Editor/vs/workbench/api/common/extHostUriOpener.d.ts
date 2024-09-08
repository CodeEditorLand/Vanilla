import type * as vscode from "vscode";
import type { CancellationToken } from "../../../base/common/cancellation.js";
import { type UriComponents } from "../../../base/common/uri.js";
import type * as languages from "../../../editor/common/languages.js";
import type { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { type ExtHostUriOpenersShape, type IMainContext } from "./extHost.protocol.js";
export declare class ExtHostUriOpeners implements ExtHostUriOpenersShape {
    private static readonly supportedSchemes;
    private readonly _proxy;
    private readonly _openers;
    constructor(mainContext: IMainContext);
    registerExternalUriOpener(extensionId: ExtensionIdentifier, id: string, opener: vscode.ExternalUriOpener, metadata: vscode.ExternalUriOpenerMetadata): vscode.Disposable;
    $canOpenUri(id: string, uriComponents: UriComponents, token: CancellationToken): Promise<languages.ExternalUriOpenerPriority>;
    $openUri(id: string, context: {
        resolvedUri: UriComponents;
        sourceUri: UriComponents;
    }, token: CancellationToken): Promise<void>;
}
