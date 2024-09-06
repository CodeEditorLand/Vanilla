import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { DiffEditorEditors } from "vs/editor/browser/widget/diffEditor/components/diffEditorEditors";
import { DiffEditorOptions } from "vs/editor/browser/widget/diffEditor/diffEditorOptions";
import { DiffEditorViewModel } from "vs/editor/browser/widget/diffEditor/diffEditorViewModel";
import { DiffEditorWidget } from "vs/editor/browser/widget/diffEditor/diffEditorWidget";
export declare class DiffEditorDecorations extends Disposable {
    private readonly _editors;
    private readonly _diffModel;
    private readonly _options;
    constructor(_editors: DiffEditorEditors, _diffModel: IObservable<DiffEditorViewModel | undefined>, _options: DiffEditorOptions, widget: DiffEditorWidget);
    private readonly _decorations;
}
