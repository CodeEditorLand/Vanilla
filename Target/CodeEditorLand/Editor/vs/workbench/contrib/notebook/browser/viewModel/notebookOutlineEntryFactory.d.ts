import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IOutlineModelService } from '../../../../../editor/contrib/documentSymbols/browser/outlineModel.js';
import { ICellViewModel } from '../notebookBrowser.js';
import { OutlineEntry } from './OutlineEntry.js';
import { INotebookExecutionStateService } from '../../common/notebookExecutionStateService.js';
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
