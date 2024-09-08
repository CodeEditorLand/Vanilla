import { type FastDomNode } from "../../../../../base/browser/fastDomNode.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import type { INotebookViewCellsUpdateEvent, INotebookViewZoneChangeAccessor } from "../notebookBrowser.js";
import type { NotebookCellListView } from "../view/notebookCellListView.js";
import type { ICoordinatesConverter } from "../view/notebookRenderingCommon.js";
import type { CellViewModel } from "../viewModel/notebookViewModelImpl.js";
export declare class NotebookViewZones extends Disposable {
    private readonly listView;
    private readonly coordinator;
    private _zones;
    domNode: FastDomNode<HTMLElement>;
    constructor(listView: NotebookCellListView<CellViewModel>, coordinator: ICoordinatesConverter);
    changeViewZones(callback: (changeAccessor: INotebookViewZoneChangeAccessor) => void): boolean;
    onCellsChanged(e: INotebookViewCellsUpdateEvent): void;
    onHiddenRangesChange(): void;
    private _updateWhitespace;
    layout(): void;
    private _addZone;
    private _removeZone;
    private _layoutZone;
    private _isInHiddenRanges;
    dispose(): void;
}
