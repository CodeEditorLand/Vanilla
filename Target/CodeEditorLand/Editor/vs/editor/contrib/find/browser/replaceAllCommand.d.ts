import { Range } from "../../../common/core/range.js";
import type { Selection } from "../../../common/core/selection.js";
import type { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../../../common/editorCommon.js";
import type { ITextModel } from "../../../common/model.js";
export declare class ReplaceAllCommand implements ICommand {
    private readonly _editorSelection;
    private _trackedEditorSelectionId;
    private readonly _ranges;
    private readonly _replaceStrings;
    constructor(editorSelection: Selection, ranges: Range[], replaceStrings: string[]);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
