import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ITransaction } from "vs/base/common/observable";
import { IComputedEditorOptions } from "vs/editor/common/config/editorOptions";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { DetailedLineRangeMapping } from "vs/editor/common/diff/rangeMapping";
import { ITextModel } from "vs/editor/common/model";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import "vs/css!./accessibleDiffViewer";
import { DiffEditorEditors } from "vs/editor/browser/widget/diffEditor/components/diffEditorEditors";
export interface IAccessibleDiffViewerModel {
    getOriginalModel(): ITextModel;
    getOriginalOptions(): IComputedEditorOptions;
    /**
     * Should do: `setSelection`, `revealLine` and `focus`
     */
    originalReveal(range: Range): void;
    getModifiedModel(): ITextModel;
    getModifiedOptions(): IComputedEditorOptions;
    /**
     * Should do: `setSelection`, `revealLine` and `focus`
     */
    modifiedReveal(range?: Range): void;
    modifiedSetSelection(range: Range): void;
    modifiedFocus(): void;
    getModifiedPosition(): Position | undefined;
}
export declare class AccessibleDiffViewer extends Disposable {
    private readonly _parentNode;
    private readonly _visible;
    private readonly _setVisible;
    private readonly _canClose;
    private readonly _width;
    private readonly _height;
    private readonly _diffs;
    private readonly _models;
    private readonly _instantiationService;
    static _ttPolicy: any;
    constructor(_parentNode: HTMLElement, _visible: IObservable<boolean>, _setVisible: (visible: boolean, tx: ITransaction | undefined) => void, _canClose: IObservable<boolean>, _width: IObservable<number>, _height: IObservable<number>, _diffs: IObservable<DetailedLineRangeMapping[] | undefined>, _models: IAccessibleDiffViewerModel, _instantiationService: IInstantiationService);
    private readonly _state;
    next(): void;
    prev(): void;
    close(): void;
}
export declare class AccessibleDiffViewerModelFromEditors implements IAccessibleDiffViewerModel {
    private readonly editors;
    constructor(editors: DiffEditorEditors);
    getOriginalModel(): ITextModel;
    getOriginalOptions(): IComputedEditorOptions;
    originalReveal(range: Range): void;
    getModifiedModel(): ITextModel;
    getModifiedOptions(): IComputedEditorOptions;
    modifiedReveal(range?: Range | undefined): void;
    modifiedSetSelection(range: Range): void;
    modifiedFocus(): void;
    getModifiedPosition(): Position | undefined;
}
