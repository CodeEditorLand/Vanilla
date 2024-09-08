import { Disposable } from "../../../../../base/common/lifecycle.js";
import { type IObservable } from "../../../../../base/common/observable.js";
import type { DiffEditorOptions } from "../diffEditorOptions.js";
import type { DiffEditorViewModel } from "../diffEditorViewModel.js";
import type { DiffEditorWidget } from "../diffEditorWidget.js";
import type { DiffEditorEditors } from "./diffEditorEditors.js";
export declare class DiffEditorDecorations extends Disposable {
    private readonly _editors;
    private readonly _diffModel;
    private readonly _options;
    constructor(_editors: DiffEditorEditors, _diffModel: IObservable<DiffEditorViewModel | undefined>, _options: DiffEditorOptions, widget: DiffEditorWidget);
    private readonly _decorations;
}
