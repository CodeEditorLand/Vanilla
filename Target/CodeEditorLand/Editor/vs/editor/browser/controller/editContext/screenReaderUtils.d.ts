import type { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { type IComputedEditorOptions } from "../../../common/config/editorOptions.js";
import type { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { EndOfLinePreference } from "../../../common/model.js";
export interface ISimpleModel {
    getLineCount(): number;
    getLineMaxColumn(lineNumber: number): number;
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    modifyPosition(position: Position, offset: number): Position;
}
export interface ScreenReaderContentState {
    value: string;
    /** the offset where selection starts inside `value` */
    selectionStart: number;
    /** the offset where selection ends inside `value` */
    selectionEnd: number;
    /** the editor range in the view coordinate system that matches the selection inside `value` */
    selection: Range;
    /** the visible line count (wrapped, not necessarily matching \n characters) for the text in `value` before `selectionStart` */
    newlineCountBeforeSelection: number;
}
export declare class PagedScreenReaderStrategy {
    private static _getPageOfLine;
    private static _getRangeForPage;
    static fromEditorSelection(model: ISimpleModel, selection: Range, linesPerPage: number, trimLongText: boolean): ScreenReaderContentState;
}
export declare function ariaLabelForScreenReaderContent(options: IComputedEditorOptions, keybindingService: IKeybindingService): string;
export declare function newlinecount(text: string): number;