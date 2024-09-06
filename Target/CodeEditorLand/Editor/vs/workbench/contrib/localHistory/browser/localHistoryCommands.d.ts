import { URI } from "vs/base/common/uri";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IWorkingCopyHistoryEntry, IWorkingCopyHistoryService } from "vs/workbench/services/workingCopy/common/workingCopyHistory";
export interface ITimelineCommandArgument {
    uri: URI;
    handle: string;
}
export declare const COMPARE_WITH_FILE_LABEL: any;
export declare function toDiffEditorArguments(entry: IWorkingCopyHistoryEntry, resource: URI, options?: IEditorOptions): unknown[];
export declare function toDiffEditorArguments(previousEntry: IWorkingCopyHistoryEntry, entry: IWorkingCopyHistoryEntry, options?: IEditorOptions): unknown[];
export declare function findLocalHistoryEntry(workingCopyHistoryService: IWorkingCopyHistoryService, descriptor: ITimelineCommandArgument): Promise<{
    entry: IWorkingCopyHistoryEntry | undefined;
    previous: IWorkingCopyHistoryEntry | undefined;
}>;
