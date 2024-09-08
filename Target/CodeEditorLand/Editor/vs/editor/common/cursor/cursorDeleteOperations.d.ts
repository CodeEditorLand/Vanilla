import type { EditorAutoClosingEditStrategy, EditorAutoClosingStrategy } from "../config/editorOptions.js";
import { Range } from "../core/range.js";
import type { Selection } from "../core/selection.js";
import { type CursorConfiguration, EditOperationResult, EditOperationType, type ICursorSimpleModel } from "../cursorCommon.js";
import type { ICommand } from "../editorCommon.js";
import type { StandardAutoClosingPairConditional } from "../languages/languageConfiguration.js";
export declare class DeleteOperations {
    static deleteRight(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): [boolean, Array<ICommand | null>];
    static isAutoClosingPairDelete(autoClosingDelete: EditorAutoClosingEditStrategy, autoClosingBrackets: EditorAutoClosingStrategy, autoClosingQuotes: EditorAutoClosingStrategy, autoClosingPairsOpen: Map<string, StandardAutoClosingPairConditional[]>, model: ICursorSimpleModel, selections: Selection[], autoClosedCharacters: Range[]): boolean;
    private static _runAutoClosingPairDelete;
    static deleteLeft(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[], autoClosedCharacters: Range[]): [boolean, Array<ICommand | null>];
    private static getDeleteRange;
    private static getPositionAfterDeleteLeft;
    static cut(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): EditOperationResult;
}
