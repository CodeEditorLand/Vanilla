import { IObservable, IReader, ITransaction } from "vs/base/common/observable";
import { Range } from "vs/editor/common/core/range";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ITextModel } from "vs/editor/common/model";
import { IUndoRedoService } from "vs/platform/undoRedo/common/undoRedo";
import { EditorModel } from "vs/workbench/common/editor/editorModel";
import { IMergeDiffComputer } from "vs/workbench/contrib/mergeEditor/browser/model/diffComputer";
import { LineRange } from "vs/workbench/contrib/mergeEditor/browser/model/lineRange";
import { MergeEditorTelemetry } from "vs/workbench/contrib/mergeEditor/browser/telemetry";
import { InputNumber, ModifiedBaseRange, ModifiedBaseRangeState } from "./modifiedBaseRange";
export interface InputData {
    readonly textModel: ITextModel;
    readonly title: string | undefined;
    readonly detail: string | undefined;
    readonly description: string | undefined;
}
export declare class MergeEditorModel extends EditorModel {
    readonly base: ITextModel;
    readonly input1: InputData;
    readonly input2: InputData;
    readonly resultTextModel: ITextModel;
    private readonly diffComputer;
    private readonly options;
    readonly telemetry: MergeEditorTelemetry;
    private readonly languageService;
    private readonly undoRedoService;
    private readonly input1TextModelDiffs;
    private readonly input2TextModelDiffs;
    private readonly resultTextModelDiffs;
    readonly modifiedBaseRanges: any;
    private readonly modifiedBaseRangeResultStates;
    private readonly resultSnapshot;
    constructor(base: ITextModel, input1: InputData, input2: InputData, resultTextModel: ITextModel, diffComputer: IMergeDiffComputer, options: {
        resetResult: boolean;
    }, telemetry: MergeEditorTelemetry, languageService: ILanguageService, undoRedoService: IUndoRedoService);
    private initialize;
    reset(): Promise<void>;
    private computeAutoMergedResult;
    hasBaseRange(baseRange: ModifiedBaseRange): boolean;
    readonly baseInput1Diffs: any;
    readonly baseInput2Diffs: any;
    readonly baseResultDiffs: any;
    get isApplyingEditInResult(): boolean;
    readonly input1ResultMapping: any;
    readonly resultInput1Mapping: any;
    readonly input2ResultMapping: any;
    readonly resultInput2Mapping: any;
    private getInputResultMapping;
    readonly baseResultMapping: any;
    readonly resultBaseMapping: any;
    translateInputRangeToBase(input: 1 | 2, range: Range): Range;
    translateBaseRangeToInput(input: 1 | 2, range: Range): Range;
    getLineRangeInResult(baseRange: LineRange, reader?: IReader): LineRange;
    translateResultRangeToBase(range: Range): Range;
    translateBaseRangeToResult(range: Range): Range;
    findModifiedBaseRangesInRange(rangeInBase: LineRange): ModifiedBaseRange[];
    readonly diffComputingState: any;
    readonly inputDiffComputingState: any;
    readonly isUpToDate: any;
    readonly onInitialized: any;
    private firstRun;
    private updateBaseRangeAcceptedState;
    private computeState;
    getState(baseRange: ModifiedBaseRange): IObservable<ModifiedBaseRangeState>;
    setState(baseRange: ModifiedBaseRange, state: ModifiedBaseRangeState, _markInputAsHandled: boolean | InputNumber, tx: ITransaction, _pushStackElement?: boolean): void;
    resetDirtyConflictsToBase(): void;
    isHandled(baseRange: ModifiedBaseRange): IObservable<boolean>;
    isInputHandled(baseRange: ModifiedBaseRange, inputNumber: InputNumber): IObservable<boolean>;
    setInputHandled(baseRange: ModifiedBaseRange, inputNumber: InputNumber, handled: boolean, tx: ITransaction): void;
    setHandled(baseRange: ModifiedBaseRange, handled: boolean, tx: ITransaction): void;
    readonly unhandledConflictsCount: any;
    readonly hasUnhandledConflicts: any;
    setLanguageId(languageId: string, source?: string): void;
    getInitialResultValue(): string;
    getResultValueWithConflictMarkers(): Promise<string>;
    get conflictCount(): number;
    get combinableConflictCount(): number;
    get conflictsResolvedWithBase(): number;
    get conflictsResolvedWithInput1(): number;
    get conflictsResolvedWithInput2(): number;
    get conflictsResolvedWithSmartCombination(): number;
    get manuallySolvedConflictCountThatEqualNone(): number;
    get manuallySolvedConflictCountThatEqualSmartCombine(): number;
    get manuallySolvedConflictCountThatEqualInput1(): number;
    get manuallySolvedConflictCountThatEqualInput2(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithBase(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart(): number;
}
export declare const enum MergeEditorModelState {
    initializing = 1,
    upToDate = 2,
    updating = 3
}
