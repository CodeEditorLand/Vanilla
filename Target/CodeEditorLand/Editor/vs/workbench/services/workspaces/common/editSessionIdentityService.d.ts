import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { EditSessionIdentityMatch, IEditSessionIdentityCreateParticipant, IEditSessionIdentityProvider, IEditSessionIdentityService } from "vs/platform/workspace/common/editSessions";
import { IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class EditSessionIdentityService implements IEditSessionIdentityService {
    private readonly _extensionService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _editSessionIdentifierProviders;
    constructor(_extensionService: IExtensionService, _logService: ILogService);
    registerEditSessionIdentityProvider(provider: IEditSessionIdentityProvider): IDisposable;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, token: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, cancellationToken: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
    onWillCreateEditSessionIdentity(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<void>;
    private _participants;
    addEditSessionIdentityCreateParticipant(participant: IEditSessionIdentityCreateParticipant): IDisposable;
    private activateProvider;
}
