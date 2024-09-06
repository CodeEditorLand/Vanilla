import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
export interface IEditSessionIdentityProvider {
    readonly scheme: string;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, token: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, token: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
}
export declare const IEditSessionIdentityService: any;
export interface IEditSessionIdentityService {
    readonly _serviceBrand: undefined;
    registerEditSessionIdentityProvider(provider: IEditSessionIdentityProvider): IDisposable;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, cancellationToken: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
    addEditSessionIdentityCreateParticipant(participants: IEditSessionIdentityCreateParticipant): IDisposable;
    onWillCreateEditSessionIdentity(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<void>;
}
export interface IEditSessionIdentityCreateParticipant {
    participate(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<void>;
}
export declare enum EditSessionIdentityMatch {
    Complete = 100,
    Partial = 50,
    None = 0
}
