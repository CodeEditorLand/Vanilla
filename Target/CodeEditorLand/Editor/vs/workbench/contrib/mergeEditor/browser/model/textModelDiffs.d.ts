import { Disposable } from "../../../../../base/common/lifecycle.js";
import { type IObservable, type IReader, type ITransaction } from "../../../../../base/common/observable.js";
import type { ITextModel } from "../../../../../editor/common/model.js";
import type { UndoRedoGroup } from "../../../../../platform/undoRedo/common/undoRedo.js";
import type { IMergeDiffComputer } from "./diffComputer.js";
import { LineRangeEdit } from "./editing.js";
import { LineRange } from "./lineRange.js";
import { DetailedLineRangeMapping } from "./mapping.js";
export declare class TextModelDiffs extends Disposable {
    private readonly baseTextModel;
    private readonly textModel;
    private readonly diffComputer;
    private _recomputeCount;
    private readonly _state;
    private readonly _diffs;
    private readonly _barrier;
    private _isDisposed;
    get isApplyingChange(): boolean;
    constructor(baseTextModel: ITextModel, textModel: ITextModel, diffComputer: IMergeDiffComputer);
    get state(): IObservable<TextModelDiffState, TextModelDiffChangeReason>;
    /**
     * Diffs from base to input.
     */
    get diffs(): IObservable<DetailedLineRangeMapping[], TextModelDiffChangeReason>;
    private _isInitializing;
    private _recompute;
    private ensureUpToDate;
    removeDiffs(diffToRemoves: DetailedLineRangeMapping[], transaction: ITransaction | undefined, group?: UndoRedoGroup): void;
    /**
     * Edit must be conflict free.
     */
    applyEditRelativeToOriginal(edit: LineRangeEdit, transaction: ITransaction | undefined, group?: UndoRedoGroup): void;
    findTouchingDiffs(baseRange: LineRange): DetailedLineRangeMapping[];
    private getResultLine;
    getResultLineRange(baseRange: LineRange, reader?: IReader): LineRange;
}
export declare enum TextModelDiffChangeReason {
    other = 0,
    textChange = 1
}
export declare enum TextModelDiffState {
    initializing = 1,
    upToDate = 2,
    updating = 3,
    error = 4
}
export interface ITextModelDiffsState {
    state: TextModelDiffState;
    diffs: DetailedLineRangeMapping[];
}
