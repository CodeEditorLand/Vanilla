import { FormattingOptions } from "vs/base/common/jsonFormatter";
import { IUserDataSyncUtilService } from "vs/platform/userDataSync/common/userDataSync";
export declare function merge(localContent: string, remoteContent: string, baseContent: string | null, formattingOptions: FormattingOptions, userDataSyncUtilService: IUserDataSyncUtilService): Promise<{
    mergeContent: string;
    hasChanges: boolean;
    hasConflicts: boolean;
}>;
