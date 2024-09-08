import type { URI } from "../../../../../base/common/uri.js";
import type { Range } from "../../../../../editor/common/core/range.js";
import type { Selection } from "../../../../../editor/common/core/selection.js";
import { UndoRedoElementType, type IResourceUndoRedoElement } from "../../../../../platform/undoRedo/common/undoRedo.js";
import type { ITextCellEditingDelegate } from "../../common/model/cellEdit.js";
import type { NotebookCellTextModel } from "../../common/model/notebookCellTextModel.js";
import { type CellKind, type IOutputDto, type NotebookCellMetadata } from "../../common/notebookCommon.js";
import type { BaseCellViewModel } from "./baseCellViewModel.js";
export interface IViewCellEditingDelegate extends ITextCellEditingDelegate {
    createCellViewModel?(cell: NotebookCellTextModel): BaseCellViewModel;
    createCell?(index: number, source: string, language: string, type: CellKind, metadata: NotebookCellMetadata | undefined, outputs: IOutputDto[]): BaseCellViewModel;
}
export declare class JoinCellEdit implements IResourceUndoRedoElement {
    resource: URI;
    private index;
    private direction;
    private cell;
    private selections;
    private inverseRange;
    private insertContent;
    private removedCell;
    private editingDelegate;
    type: UndoRedoElementType.Resource;
    label: string;
    code: string;
    private _deletedRawCell;
    constructor(resource: URI, index: number, direction: "above" | "below", cell: BaseCellViewModel, selections: Selection[], inverseRange: Range, insertContent: string, removedCell: BaseCellViewModel, editingDelegate: IViewCellEditingDelegate);
    undo(): Promise<void>;
    redo(): Promise<void>;
}
