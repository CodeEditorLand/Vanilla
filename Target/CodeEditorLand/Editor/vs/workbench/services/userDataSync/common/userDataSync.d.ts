import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { ILocalizedString } from "vs/platform/action/common/action";
import { IAction2Options } from "vs/platform/actions/common/actions";
import { IAuthenticationProvider, IResourcePreview, IUserDataSyncResource, SyncResource } from "vs/platform/userDataSync/common/userDataSync";
import { IView } from "vs/workbench/common/views";
export interface IUserDataSyncAccount {
    readonly authenticationProviderId: string;
    readonly accountName: string;
    readonly accountId: string;
}
export declare const IUserDataSyncWorkbenchService: any;
export interface IUserDataSyncWorkbenchService {
    _serviceBrand: any;
    readonly enabled: boolean;
    readonly authenticationProviders: IAuthenticationProvider[];
    readonly current: IUserDataSyncAccount | undefined;
    readonly accountStatus: AccountStatus;
    readonly onDidChangeAccountStatus: Event<AccountStatus>;
    turnOn(): Promise<void>;
    turnoff(everyWhere: boolean): Promise<void>;
    signIn(): Promise<void>;
    resetSyncedData(): Promise<void>;
    showSyncActivity(): Promise<void>;
    syncNow(): Promise<void>;
    synchroniseUserDataSyncStoreType(): Promise<void>;
    showConflicts(conflictToOpen?: IResourcePreview): Promise<void>;
    accept(resource: IUserDataSyncResource, conflictResource: URI, content: string | null | undefined, apply: boolean): Promise<void>;
    getAllLogResources(): Promise<URI[]>;
    downloadSyncActivity(): Promise<URI | undefined>;
}
export declare function getSyncAreaLabel(source: SyncResource): string;
export declare const enum AccountStatus {
    Unavailable = "unavailable",
    Available = "available"
}
export interface IUserDataSyncConflictsView extends IView {
    open(conflict: IResourcePreview): Promise<void>;
}
export declare const SYNC_TITLE: ILocalizedString;
export declare const SYNC_VIEW_ICON: any;
export declare const CONTEXT_SYNC_STATE: any;
export declare const CONTEXT_SYNC_ENABLEMENT: any;
export declare const CONTEXT_ACCOUNT_STATE: any;
export declare const CONTEXT_ENABLE_ACTIVITY_VIEWS: any;
export declare const CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW: any;
export declare const CONTEXT_HAS_CONFLICTS: any;
export declare const CONFIGURE_SYNC_COMMAND_ID = "workbench.userDataSync.actions.configure";
export declare const SHOW_SYNC_LOG_COMMAND_ID = "workbench.userDataSync.actions.showLog";
export declare const SYNC_VIEW_CONTAINER_ID = "workbench.view.sync";
export declare const SYNC_CONFLICTS_VIEW_ID = "workbench.views.sync.conflicts";
export declare const DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR: Readonly<IAction2Options>;
