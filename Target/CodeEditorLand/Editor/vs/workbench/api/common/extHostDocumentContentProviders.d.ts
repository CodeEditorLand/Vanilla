import type * as vscode from "vscode";
import { type UriComponents } from "../../../base/common/uri.js";
import type { ILogService } from "../../../platform/log/common/log.js";
import { type ExtHostDocumentContentProvidersShape, type IMainContext } from "./extHost.protocol.js";
import type { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
export declare class ExtHostDocumentContentProvider implements ExtHostDocumentContentProvidersShape {
    private readonly _documentsAndEditors;
    private readonly _logService;
    private static _handlePool;
    private readonly _documentContentProviders;
    private readonly _proxy;
    constructor(mainContext: IMainContext, _documentsAndEditors: ExtHostDocumentsAndEditors, _logService: ILogService);
    registerTextDocumentContentProvider(scheme: string, provider: vscode.TextDocumentContentProvider): vscode.Disposable;
    $provideTextDocumentContent(handle: number, uri: UriComponents): Promise<string | null | undefined>;
}
