import { FastDomNode } from "vs/base/browser/fastDomNode";
import { Disposable } from "vs/base/common/lifecycle";
import { INotebookViewCellsUpdateEvent, INotebookViewZoneChangeAccessor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookCellListView } from "vs/workbench/contrib/notebook/browser/view/notebookCellListView";
import { ICoordinatesConverter } from "vs/workbench/contrib/notebook/browser/view/notebookRenderingCommon";
import { CellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl";
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
