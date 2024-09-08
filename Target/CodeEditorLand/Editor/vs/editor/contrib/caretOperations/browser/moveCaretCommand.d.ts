import { Selection } from "../../../common/core/selection.js";
import type { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../../../common/editorCommon.js";
import type { ITextModel } from "../../../common/model.js";
export declare class MoveCaretCommand implements ICommand {
    private readonly _selection;
    private readonly _isMovingLeft;
    constructor(selection: Selection, isMovingLeft: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
