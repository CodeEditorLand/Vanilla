import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, IReader, ISettableObservable, ITransaction } from "vs/base/common/observable";
import { IDiffProviderFactoryService } from "vs/editor/browser/widget/diffEditor/diffProviderFactoryService";
import { ISerializedLineRange, LineRange } from "vs/editor/common/core/lineRange";
import { IDocumentDiff } from "vs/editor/common/diff/documentDiffProvider";
import { MovedText } from "vs/editor/common/diff/linesDiffComputer";
import { DetailedLineRangeMapping, LineRangeMapping } from "vs/editor/common/diff/rangeMapping";
import { IDiffEditorModel, IDiffEditorViewModel } from "vs/editor/common/editorCommon";
import { DiffEditorOptions } from "./diffEditorOptions";
export declare class DiffEditorViewModel extends Disposable implements IDiffEditorViewModel {
    readonly model: IDiffEditorModel;
    private readonly _options;
    private readonly _diffProviderFactoryService;
    private readonly _isDiffUpToDate;
    readonly isDiffUpToDate: IObservable<boolean>;
    private _lastDiff;
    private readonly _diff;
    readonly diff: IObservable<DiffState | undefined>;
    private readonly _unchangedRegions;
    readonly unchangedRegions: IObservable<UnchangedRegion[]>;
    readonly movedTextToCompare: any;
    private readonly _activeMovedText;
    private readonly _hoveredMovedText;
    readonly activeMovedText: any;
    setActiveMovedText(movedText: MovedText | undefined): void;
    setHoveredMovedText(movedText: MovedText | undefined): void;
    private readonly _cancellationTokenSource;
    private readonly _diffProvider;
    constructor(model: IDiffEditorModel, _options: DiffEditorOptions, _diffProviderFactoryService: IDiffProviderFactoryService);
    ensureModifiedLineIsVisible(lineNumber: number, preference: RevealPreference, tx: ITransaction | undefined): void;
    ensureOriginalLineIsVisible(lineNumber: number, preference: RevealPreference, tx: ITransaction | undefined): void;
    waitForDiff(): Promise<void>;
    serializeState(): SerializedState;
    restoreSerializedState(state: SerializedState): void;
}
interface SerializedState {
    collapsedRegions: {
        range: ISerializedLineRange;
    }[] | undefined;
}
export declare class DiffState {
    readonly mappings: readonly DiffMapping[];
    readonly movedTexts: readonly MovedText[];
    readonly identical: boolean;
    readonly quitEarly: boolean;
    static fromDiffResult(result: IDocumentDiff): DiffState;
    constructor(mappings: readonly DiffMapping[], movedTexts: readonly MovedText[], identical: boolean, quitEarly: boolean);
}
export declare class DiffMapping {
    readonly lineRangeMapping: DetailedLineRangeMapping;
    constructor(lineRangeMapping: DetailedLineRangeMapping);
}
export declare class UnchangedRegion {
    readonly originalLineNumber: number;
    readonly modifiedLineNumber: number;
    readonly lineCount: number;
    static fromDiffs(changes: readonly DetailedLineRangeMapping[], originalLineCount: number, modifiedLineCount: number, minHiddenLineCount: number, minContext: number): UnchangedRegion[];
    get originalUnchangedRange(): LineRange;
    get modifiedUnchangedRange(): LineRange;
    private readonly _visibleLineCountTop;
    readonly visibleLineCountTop: ISettableObservable<number>;
    private readonly _visibleLineCountBottom;
    readonly visibleLineCountBottom: ISettableObservable<number>;
    private readonly _shouldHideControls;
    readonly isDragged: any;
    constructor(originalLineNumber: number, modifiedLineNumber: number, lineCount: number, visibleLineCountTop: number, visibleLineCountBottom: number);
    setVisibleRanges(visibleRanges: LineRangeMapping[], tx: ITransaction): UnchangedRegion[];
    shouldHideControls(reader: IReader | undefined): boolean;
    getHiddenOriginalRange(reader: IReader | undefined): LineRange;
    getHiddenModifiedRange(reader: IReader | undefined): LineRange;
    setHiddenModifiedRange(range: LineRange, tx: ITransaction): void;
    getMaxVisibleLineCountTop(): number;
    getMaxVisibleLineCountBottom(): number;
    showMoreAbove(count: number | undefined, tx: ITransaction | undefined): void;
    showMoreBelow(count: number | undefined, tx: ITransaction | undefined): void;
    showAll(tx: ITransaction | undefined): void;
    showModifiedLine(lineNumber: number, preference: RevealPreference, tx: ITransaction | undefined): void;
    showOriginalLine(lineNumber: number, preference: RevealPreference, tx: ITransaction | undefined): void;
    collapseAll(tx: ITransaction | undefined): void;
    setState(visibleLineCountTop: number, visibleLineCountBottom: number, tx: ITransaction | undefined): void;
}
export declare const enum RevealPreference {
    FromCloserSide = 0,
    FromTop = 1,
    FromBottom = 2
}
export {};