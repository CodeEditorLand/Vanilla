import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
export declare enum WorkspaceTrustScope {
    Local = 0,
    Remote = 1
}
export interface WorkspaceTrustRequestButton {
    readonly label: string;
    readonly type: "ContinueWithTrust" | "ContinueWithoutTrust" | "Manage" | "Cancel";
}
export interface WorkspaceTrustRequestOptions {
    readonly buttons?: WorkspaceTrustRequestButton[];
    readonly message?: string;
}
export declare const IWorkspaceTrustEnablementService: any;
export interface IWorkspaceTrustEnablementService {
    readonly _serviceBrand: undefined;
    isWorkspaceTrustEnabled(): boolean;
}
export declare const IWorkspaceTrustManagementService: any;
export interface IWorkspaceTrustManagementService {
    readonly _serviceBrand: undefined;
    onDidChangeTrust: Event<boolean>;
    onDidChangeTrustedFolders: Event<void>;
    readonly workspaceResolved: Promise<void>;
    readonly workspaceTrustInitialized: Promise<void>;
    acceptsOutOfWorkspaceFiles: boolean;
    isWorkspaceTrusted(): boolean;
    isWorkspaceTrustForced(): boolean;
    canSetParentFolderTrust(): boolean;
    setParentFolderTrust(trusted: boolean): Promise<void>;
    canSetWorkspaceTrust(): boolean;
    setWorkspaceTrust(trusted: boolean): Promise<void>;
    getUriTrustInfo(uri: URI): Promise<IWorkspaceTrustUriInfo>;
    setUrisTrust(uri: URI[], trusted: boolean): Promise<void>;
    getTrustedUris(): URI[];
    setTrustedUris(uris: URI[]): Promise<void>;
    addWorkspaceTrustTransitionParticipant(participant: IWorkspaceTrustTransitionParticipant): IDisposable;
}
export declare const enum WorkspaceTrustUriResponse {
    Open = 1,
    OpenInNewWindow = 2,
    Cancel = 3
}
export declare const IWorkspaceTrustRequestService: any;
export interface IWorkspaceTrustRequestService {
    readonly _serviceBrand: undefined;
    readonly onDidInitiateOpenFilesTrustRequest: Event<void>;
    readonly onDidInitiateWorkspaceTrustRequest: Event<WorkspaceTrustRequestOptions | undefined>;
    readonly onDidInitiateWorkspaceTrustRequestOnStartup: Event<void>;
    completeOpenFilesTrustRequest(result: WorkspaceTrustUriResponse, saveResponse?: boolean): Promise<void>;
    requestOpenFilesTrust(openFiles: URI[]): Promise<WorkspaceTrustUriResponse>;
    cancelWorkspaceTrustRequest(): void;
    completeWorkspaceTrustRequest(trusted?: boolean): Promise<void>;
    requestWorkspaceTrust(options?: WorkspaceTrustRequestOptions): Promise<boolean | undefined>;
    requestWorkspaceTrustOnStartup(): void;
}
export interface IWorkspaceTrustTransitionParticipant {
    participate(trusted: boolean): Promise<void>;
}
export interface IWorkspaceTrustUriInfo {
    uri: URI;
    trusted: boolean;
}
export interface IWorkspaceTrustInfo {
    uriTrustInfo: IWorkspaceTrustUriInfo[];
}
