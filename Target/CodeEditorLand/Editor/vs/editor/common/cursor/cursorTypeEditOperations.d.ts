import { ReplaceCommandWithOffsetCursorState } from "vs/editor/common/commands/replaceCommand";
import { Range } from "vs/editor/common/core/range";
import { Selection } from "vs/editor/common/core/selection";
import { CursorConfiguration, EditOperationResult, EditOperationType, ICursorSimpleModel } from "vs/editor/common/cursorCommon";
import { ICommand, ICursorStateComputerData } from "vs/editor/common/editorCommon";
import { ITextModel } from "vs/editor/common/model";
export declare class AutoIndentOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _isAutoIndentType;
    private static _findActualIndentationForSelection;
    private static _getIndentationAndAutoClosingPairEdits;
    private static _getEditFromIndentationAndSelection;
}
export declare class AutoClosingOvertypeOperation {
    static getEdits(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], autoClosedCharacters: Range[], ch: string): EditOperationResult | undefined;
    private static _runAutoClosingOvertype;
}
export declare class AutoClosingOvertypeWithInterceptorsOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], autoClosedCharacters: Range[], ch: string): EditOperationResult | undefined;
}
export declare class AutoClosingOpenCharTypeOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, chIsAlreadyTyped: boolean, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _runAutoClosingOpenCharType;
    static getAutoClosingPairClose(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, chIsAlreadyTyped: boolean): string | null;
    /**
     * Find another auto-closing pair that is contained by the one passed in.
     *
     * e.g. when having [(,)] and [(*,*)] as auto-closing pairs
     * this method will find [(,)] as a containment pair for [(*,*)]
     */
    private static _findContainedAutoClosingPair;
    /**
     * Determine if typing `ch` at all `positions` in the `model` results in an
     * auto closing open sequence being typed.
     *
     * Auto closing open sequences can consist of multiple characters, which
     * can lead to ambiguities. In such a case, the longest auto-closing open
     * sequence is returned.
     */
    private static _findAutoClosingPairOpen;
    private static _isBeforeClosingBrace;
}
export declare class SurroundSelectionOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _runSurroundSelectionType;
    private static _isSurroundSelectionType;
}
export declare class InterceptorElectricCharOperation {
    static getEdits(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _isTypeInterceptorElectricChar;
    private static _typeInterceptorElectricChar;
}
export declare class SimpleCharacterTypeOperation {
    static getEdits(prevEditOperationType: EditOperationType, selections: Selection[], ch: string): EditOperationResult;
}
export declare class EnterOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _enter;
    static lineInsertBefore(config: CursorConfiguration, model: ITextModel | null, selections: Selection[] | null): ICommand[];
    static lineInsertAfter(config: CursorConfiguration, model: ITextModel | null, selections: Selection[] | null): ICommand[];
    static lineBreakInsert(config: CursorConfiguration, model: ITextModel, selections: Selection[]): ICommand[];
}
export declare class PasteOperation {
    static getEdits(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[], text: string, pasteOnNewLine: boolean, multicursorText: string[]): EditOperationResult;
    private static _distributePasteToCursors;
    private static _distributedPaste;
    private static _simplePaste;
}
export declare class CompositionOperation {
    static getEdits(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): any;
    private static _compositionType;
}
export declare class TypeWithoutInterceptorsOperation {
    static getEdits(prevEditOperationType: EditOperationType, selections: Selection[], str: string): EditOperationResult;
}
export declare class TabOperation {
    static getCommands(config: CursorConfiguration, model: ITextModel, selections: Selection[]): ICommand[];
    private static _goodIndentForLine;
    private static _replaceJumpToNextIndent;
}
export declare class BaseTypeWithAutoClosingCommand extends ReplaceCommandWithOffsetCursorState {
    private readonly _openCharacter;
    private readonly _closeCharacter;
    closeCharacterRange: Range | null;
    enclosingRange: Range | null;
    constructor(selection: Selection, text: string, lineNumberDeltaOffset: number, columnDeltaOffset: number, openCharacter: string, closeCharacter: string);
    protected _computeCursorStateWithRange(model: ITextModel, range: Range, helper: ICursorStateComputerData): Selection;
}
export declare function shiftIndent(config: CursorConfiguration, indentation: string, count?: number): string;
export declare function unshiftIndent(config: CursorConfiguration, indentation: string, count?: number): string;
export declare function shouldSurroundChar(config: CursorConfiguration, ch: string): boolean;
