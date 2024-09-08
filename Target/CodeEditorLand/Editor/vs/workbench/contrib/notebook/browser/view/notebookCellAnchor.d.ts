import type { IListView } from "../../../../../base/browser/ui/list/listView.js";
import type { Event } from "../../../../../base/common/event.js";
import type { IDisposable } from "../../../../../base/common/lifecycle.js";
import type { ScrollEvent } from "../../../../../base/common/scrollable.js";
import type { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import type { INotebookExecutionStateService } from "../../common/notebookExecutionStateService.js";
import { type ICellViewModel } from "../notebookBrowser.js";
import type { CellViewModel } from "../viewModel/notebookViewModelImpl.js";
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
