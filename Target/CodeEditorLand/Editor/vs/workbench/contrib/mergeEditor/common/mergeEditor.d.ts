export type MergeEditorLayoutKind = "mixed" | "columns";
export declare const ctxIsMergeEditor: any;
export declare const ctxIsMergeResultEditor: any;
export declare const ctxMergeEditorLayout: any;
export declare const ctxMergeEditorShowBase: any;
export declare const ctxMergeEditorShowBaseAtTop: any;
export declare const ctxMergeEditorShowNonConflictingChanges: any;
export declare const ctxMergeBaseUri: any;
export declare const ctxMergeResultUri: any;
export interface MergeEditorContents {
    languageId: string;
    base: string;
    input1: string;
    input2: string;
    result: string;
    initialResult?: string;
}
export declare const StorageCloseWithConflicts = "mergeEditorCloseWithConflicts";
