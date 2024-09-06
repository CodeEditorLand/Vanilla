import { VSBuffer } from "vs/base/common/buffer";
import { IBulkEditService } from "vs/editor/browser/services/bulkEditService";
import { WorkspaceEdit } from "vs/editor/common/languages";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceEditDto, MainThreadBulkEditsShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { SerializableObjectWithBuffers } from "vs/workbench/services/extensions/common/proxyIdentifier";
export declare class MainThreadBulkEdits implements MainThreadBulkEditsShape {
    private readonly _bulkEditService;
    private readonly _logService;
    private readonly _uriIdentService;
    constructor(_extHostContext: IExtHostContext, _bulkEditService: IBulkEditService, _logService: ILogService, _uriIdentService: IUriIdentityService);
    dispose(): void;
    $tryApplyWorkspaceEdit(dto: SerializableObjectWithBuffers<IWorkspaceEditDto>, undoRedoGroupId?: number, isRefactoring?: boolean): Promise<boolean>;
}
export declare function reviveWorkspaceEditDto(data: IWorkspaceEditDto, uriIdentityService: IUriIdentityService, resolveDataTransferFile?: (id: string) => Promise<VSBuffer>): WorkspaceEdit;
export declare function reviveWorkspaceEditDto(data: IWorkspaceEditDto | undefined, uriIdentityService: IUriIdentityService, resolveDataTransferFile?: (id: string) => Promise<VSBuffer>): WorkspaceEdit | undefined;
