import { IListView } from "vs/base/browser/ui/list/listView";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { ScrollEvent } from "vs/base/common/scrollable";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ICellViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { CellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
export declare class NotebookCellAnchor implements IDisposable {
    private readonly notebookExecutionStateService;
    private readonly configurationService;
    private readonly scrollEvent;
    private stopAnchoring;
    private executionWatcher;
    private scrollWatcher;
    constructor(notebookExecutionStateService: INotebookExecutionStateService, configurationService: IConfigurationService, scrollEvent: Event<ScrollEvent>);
    shouldAnchor(cellListView: IListView<CellViewModel>, focusedIndex: number, heightDelta: number, executingCellUri: ICellViewModel): boolean;
    watchAchorDuringExecution(executingCell: ICellViewModel): void;
    dispose(): void;
}
