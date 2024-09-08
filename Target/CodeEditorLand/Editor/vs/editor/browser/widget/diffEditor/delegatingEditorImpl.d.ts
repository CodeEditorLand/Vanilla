import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IEditorOptions } from "../../../common/config/editorOptions.js";
import type { IDimension } from "../../../common/core/dimension.js";
import type { IPosition, Position } from "../../../common/core/position.js";
import type { IRange, Range } from "../../../common/core/range.js";
import type { ISelection, Selection } from "../../../common/core/selection.js";
import { type IDiffEditorViewModel, type IEditor, type IEditorAction, type IEditorDecorationsCollection, type IEditorModel, type IEditorViewState, ScrollType } from "../../../common/editorCommon.js";
import type { IModelDecorationsChangeAccessor, IModelDeltaDecoration } from "../../../common/model.js";
import type { CodeEditorWidget } from "../codeEditor/codeEditorWidget.js";
export declare abstract class DelegatingEditor extends Disposable implements IEditor {
    private static idCounter;
    private readonly _id;
    private readonly _onDidDispose;
    readonly onDidDispose: import("../../../../base/common/event.js").Event<void>;
    protected abstract get _targetEditor(): CodeEditorWidget;
    getId(): string;
    abstract getEditorType(): string;
    abstract updateOptions(newOptions: IEditorOptions): void;
    abstract onVisible(): void;
    abstract onHide(): void;
    abstract layout(dimension?: IDimension | undefined): void;
    abstract hasTextFocus(): boolean;
    abstract saveViewState(): IEditorViewState | null;
    abstract restoreViewState(state: IEditorViewState | null): void;
    abstract getModel(): IEditorModel | null;
    abstract setModel(model: IEditorModel | null | IDiffEditorViewModel): void;
    getVisibleColumnFromPosition(position: IPosition): number;
    getStatusbarColumn(position: IPosition): number;
    getPosition(): Position | null;
    setPosition(position: IPosition, source?: string): void;
    revealLine(lineNumber: number, scrollType?: ScrollType): void;
    revealLineInCenter(lineNumber: number, scrollType?: ScrollType): void;
    revealLineInCenterIfOutsideViewport(lineNumber: number, scrollType?: ScrollType): void;
    revealLineNearTop(lineNumber: number, scrollType?: ScrollType): void;
    revealPosition(position: IPosition, scrollType?: ScrollType): void;
    revealPositionInCenter(position: IPosition, scrollType?: ScrollType): void;
    revealPositionInCenterIfOutsideViewport(position: IPosition, scrollType?: ScrollType): void;
    revealPositionNearTop(position: IPosition, scrollType?: ScrollType): void;
    getSelection(): Selection | null;
    getSelections(): Selection[] | null;
    setSelection(range: IRange, source?: string): void;
    setSelection(editorRange: Range, source?: string): void;
    setSelection(selection: ISelection, source?: string): void;
    setSelection(editorSelection: Selection, source?: string): void;
    setSelections(ranges: readonly ISelection[], source?: string): void;
    revealLines(startLineNumber: number, endLineNumber: number, scrollType?: ScrollType): void;
    revealLinesInCenter(startLineNumber: number, endLineNumber: number, scrollType?: ScrollType): void;
    revealLinesInCenterIfOutsideViewport(startLineNumber: number, endLineNumber: number, scrollType?: ScrollType): void;
    revealLinesNearTop(startLineNumber: number, endLineNumber: number, scrollType?: ScrollType): void;
    revealRange(range: IRange, scrollType?: ScrollType, revealVerticalInCenter?: boolean, revealHorizontal?: boolean): void;
    revealRangeInCenter(range: IRange, scrollType?: ScrollType): void;
    revealRangeInCenterIfOutsideViewport(range: IRange, scrollType?: ScrollType): void;
    revealRangeNearTop(range: IRange, scrollType?: ScrollType): void;
    revealRangeNearTopIfOutsideViewport(range: IRange, scrollType?: ScrollType): void;
    revealRangeAtTop(range: IRange, scrollType?: ScrollType): void;
    getSupportedActions(): IEditorAction[];
    focus(): void;
    trigger(source: string | null | undefined, handlerId: string, payload: any): void;
    createDecorationsCollection(decorations?: IModelDeltaDecoration[]): IEditorDecorationsCollection;
    changeDecorations(callback: (changeAccessor: IModelDecorationsChangeAccessor) => any): any;
}