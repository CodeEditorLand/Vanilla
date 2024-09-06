import { Position } from "vs/editor/common/core/position";
import { SelectionRange, SelectionRangeProvider } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
export declare class WordSelectionRangeProvider implements SelectionRangeProvider {
    private readonly selectSubwords;
    constructor(selectSubwords?: boolean);
    provideSelectionRanges(model: ITextModel, positions: Position[]): SelectionRange[][];
    private _addInWordRanges;
    private _addWordRanges;
    private _addWhitespaceLine;
}
