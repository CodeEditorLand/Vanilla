import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { DiffEditorEditors } from "vs/editor/browser/widget/diffEditor/components/diffEditorEditors";
import { DiffEditorViewModel } from "vs/editor/browser/widget/diffEditor/diffEditorViewModel";
import { EditorLayoutInfo } from "vs/editor/common/config/editorOptions";
export declare class MovedBlocksLinesFeature extends Disposable {
    private readonly _rootElement;
    private readonly _diffModel;
    private readonly _originalEditorLayoutInfo;
    private readonly _modifiedEditorLayoutInfo;
    private readonly _editors;
    static readonly movedCodeBlockPadding = 4;
    private readonly _element;
    private readonly _originalScrollTop;
    private readonly _modifiedScrollTop;
    private readonly _viewZonesChanged;
    readonly width: any;
    constructor(_rootElement: HTMLElement, _diffModel: IObservable<DiffEditorViewModel | undefined>, _originalEditorLayoutInfo: IObservable<EditorLayoutInfo | null>, _modifiedEditorLayoutInfo: IObservable<EditorLayoutInfo | null>, _editors: DiffEditorEditors);
    private readonly _modifiedViewZonesChangedSignal;
    private readonly _originalViewZonesChangedSignal;
    private readonly _state;
}
