import type { Position } from "../../../common/core/position.js";
import type { SelectionRange, SelectionRangeProvider } from "../../../common/languages.js";
import type { ITextModel } from "../../../common/model.js";
export declare class WordSelectionRangeProvider implements SelectionRangeProvider {
    private readonly selectSubwords;
    constructor(selectSubwords?: boolean);
    provideSelectionRanges(model: ITextModel, positions: Position[]): SelectionRange[][];
    private _addInWordRanges;
    private _addWordRanges;
    private _addWhitespaceLine;
}
