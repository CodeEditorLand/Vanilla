import { Action2 } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { OutlineEntry } from "vs/workbench/contrib/notebook/browser/viewModel/OutlineEntry";
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
