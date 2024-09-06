import { IExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { ILocalSyncExtension, IRemoteSyncExtension, ISyncExtension } from "vs/platform/userDataSync/common/userDataSync";
export interface IMergeResult {
    readonly local: {
        added: ISyncExtension[];
        removed: IExtensionIdentifier[];
        updated: ISyncExtension[];
    };
    readonly remote: {
        added: ISyncExtension[];
        removed: ISyncExtension[];
        updated: ISyncExtension[];
        all: ISyncExtension[];
    } | null;
}
export declare function merge(localExtensions: ILocalSyncExtension[], remoteExtensions: IRemoteSyncExtension[] | null, lastSyncExtensions: IRemoteSyncExtension[] | null, skippedExtensions: ISyncExtension[], ignoredExtensions: string[], lastSyncBuiltinExtensions: IExtensionIdentifier[] | null): IMergeResult;
