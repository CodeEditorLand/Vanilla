import { Action2 } from "../../../../../platform/actions/common/actions.js";
import type { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { type INotebookEditor } from "../notebookBrowser.js";
import type { OutlineEntry } from "../viewModel/OutlineEntry.js";
export type NotebookSectionArgs = {
    notebookEditor: INotebookEditor | undefined;
    outlineEntry: OutlineEntry;
};
export type ValidNotebookSectionArgs = {
    notebookEditor: INotebookEditor;
    outlineEntry: OutlineEntry;
};
export declare class NotebookRunSingleCellInSection extends Action2 {
    constructor();
    run(_accessor: ServicesAccessor, context: NotebookSectionArgs): Promise<void>;
}
export declare class NotebookRunCellsInSection extends Action2 {
    constructor();
    run(_accessor: ServicesAccessor, context: NotebookSectionArgs): Promise<void>;
}
export declare class NotebookFoldSection extends Action2 {
    constructor();
    run(_accessor: ServicesAccessor, context: NotebookSectionArgs): Promise<void>;
    private toggleFoldRange;
}
export declare class NotebookExpandSection extends Action2 {
    constructor();
    run(_accessor: ServicesAccessor, context: NotebookSectionArgs): Promise<void>;
    private toggleFoldRange;
}
