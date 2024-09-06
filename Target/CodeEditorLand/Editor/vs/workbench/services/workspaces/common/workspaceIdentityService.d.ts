import { CancellationToken } from "vs/base/common/cancellation";
import { IWorkspaceStateFolder } from "vs/platform/userDataSync/common/userDataSync";
import { IEditSessionIdentityService } from "vs/platform/workspace/common/editSessions";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
export declare const IWorkspaceIdentityService: any;
export interface IWorkspaceIdentityService {
    _serviceBrand: undefined;
    matches(folders: IWorkspaceStateFolder[], cancellationToken: CancellationToken): Promise<((obj: any) => any) | false>;
    getWorkspaceStateFolders(cancellationToken: CancellationToken): Promise<IWorkspaceStateFolder[]>;
}
export declare class WorkspaceIdentityService implements IWorkspaceIdentityService {
    private readonly workspaceContextService;
    private readonly editSessionIdentityService;
    _serviceBrand: undefined;
    constructor(workspaceContextService: IWorkspaceContextService, editSessionIdentityService: IEditSessionIdentityService);
    getWorkspaceStateFolders(cancellationToken: CancellationToken): Promise<IWorkspaceStateFolder[]>;
    matches(incomingWorkspaceFolders: IWorkspaceStateFolder[], cancellationToken: CancellationToken): Promise<((value: any) => any) | false>;
}
