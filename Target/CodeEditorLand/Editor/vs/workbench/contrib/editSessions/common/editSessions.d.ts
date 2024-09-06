import { VSBuffer } from "vs/base/common/buffer";
import { Event } from "vs/base/common/event";
import { ILocalizedString } from "vs/platform/action/common/action";
import { ILogService } from "vs/platform/log/common/log";
import { IResourceRefHandle } from "vs/platform/userDataSync/common/userDataSync";
import { EditSessionsStoreClient } from "vs/workbench/contrib/editSessions/common/editSessionsStorageClient";
export declare const EDIT_SESSION_SYNC_CATEGORY: any;
export type SyncResource = "editSessions" | "workspaceState";
export declare const IEditSessionsStorageService: any;
export interface IEditSessionsStorageService {
    _serviceBrand: undefined;
    readonly SIZE_LIMIT: number;
    readonly isSignedIn: boolean;
    readonly onDidSignIn: Event<void>;
    readonly onDidSignOut: Event<void>;
    storeClient: EditSessionsStoreClient | undefined;
    lastReadResources: Map<SyncResource, {
        ref: string;
        content: string;
    }>;
    lastWrittenResources: Map<SyncResource, {
        ref: string;
        content: string;
    }>;
    initialize(reason: "read" | "write", silent?: boolean): Promise<boolean>;
    read(resource: SyncResource, ref: string | undefined): Promise<{
        ref: string;
        content: string;
    } | undefined>;
    write(resource: SyncResource, content: string | EditSession): Promise<string>;
    delete(resource: SyncResource, ref: string | null): Promise<void>;
    list(resource: SyncResource): Promise<IResourceRefHandle[]>;
    getMachineById(machineId: string): Promise<string | undefined>;
}
export declare const IEditSessionsLogService: any;
export interface IEditSessionsLogService extends ILogService {
}
export declare enum ChangeType {
    Addition = 1,
    Deletion = 2
}
export declare enum FileType {
    File = 1
}
interface Addition {
    relativeFilePath: string;
    fileType: FileType.File;
    contents: string;
    type: ChangeType.Addition;
}
interface Deletion {
    relativeFilePath: string;
    fileType: FileType.File;
    contents: undefined;
    type: ChangeType.Deletion;
}
export type Change = Addition | Deletion;
export interface Folder {
    name: string;
    canonicalIdentity: string | undefined;
    workingChanges: Change[];
    absoluteUri: string | undefined;
}
export declare const EditSessionSchemaVersion = 3;
export interface EditSession {
    version: number;
    workspaceStateId?: string;
    machine?: string;
    folders: Folder[];
}
export declare const EDIT_SESSIONS_SIGNED_IN_KEY = "editSessionsSignedIn";
export declare const EDIT_SESSIONS_SIGNED_IN: any;
export declare const EDIT_SESSIONS_PENDING_KEY = "editSessionsPending";
export declare const EDIT_SESSIONS_PENDING: any;
export declare const EDIT_SESSIONS_CONTAINER_ID = "workbench.view.editSessions";
export declare const EDIT_SESSIONS_DATA_VIEW_ID = "workbench.views.editSessions.data";
export declare const EDIT_SESSIONS_TITLE: ILocalizedString;
export declare const EDIT_SESSIONS_VIEW_ICON: any;
export declare const EDIT_SESSIONS_SHOW_VIEW: any;
export declare const EDIT_SESSIONS_SCHEME = "vscode-edit-sessions";
export declare function decodeEditSessionFileContent(version: number, content: string): VSBuffer;
export declare function hashedEditSessionId(editSessionId: string): any;
export declare const editSessionsLogId = "editSessions";
export {};
