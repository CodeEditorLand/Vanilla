import { CancellationToken } from "vs/base/common/cancellation";
import { IOutlineModelService } from "vs/editor/contrib/documentSymbols/browser/outlineModel";
import { ICellViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { OutlineEntry } from "./OutlineEntry";
export declare const enum NotebookOutlineConstants {
    NonHeaderOutlineLevel = 7
}
export declare class NotebookOutlineEntryFactory {
    private readonly executionStateService;
    private cellOutlineEntryCache;
    private readonly cachedMarkdownOutlineEntries;
    constructor(executionStateService: INotebookExecutionStateService);
    getOutlineEntries(cell: ICellViewModel, index: number): OutlineEntry[];
    cacheSymbols(cell: ICellViewModel, outlineModelService: IOutlineModelService, cancelToken: CancellationToken): Promise<void>;
}
