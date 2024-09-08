import type * as vscode from "vscode";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import type { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
export declare class ExtHostBulkEdits {
    private readonly _proxy;
    private readonly _versionInformationProvider;
    constructor(extHostRpc: IExtHostRpcService, extHostDocumentsAndEditors: ExtHostDocumentsAndEditors);
    applyWorkspaceEdit(edit: vscode.WorkspaceEdit, extension: IExtensionDescription, metadata: vscode.WorkspaceEditMetadata | undefined): Promise<boolean>;
}
