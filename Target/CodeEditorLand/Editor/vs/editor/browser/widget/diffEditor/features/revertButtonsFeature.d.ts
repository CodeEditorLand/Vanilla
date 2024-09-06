import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { IGlyphMarginWidget, IGlyphMarginWidgetPosition } from "vs/editor/browser/editorBrowser";
import { DiffEditorEditors } from "vs/editor/browser/widget/diffEditor/components/diffEditorEditors";
import { DiffEditorOptions } from "vs/editor/browser/widget/diffEditor/diffEditorOptions";
import { DiffEditorViewModel } from "vs/editor/browser/widget/diffEditor/diffEditorViewModel";
import { DiffEditorWidget } from "vs/editor/browser/widget/diffEditor/diffEditorWidget";
import { LineRangeMapping, RangeMapping } from "vs/editor/common/diff/rangeMapping";
export declare class RevertButtonsFeature extends Disposable {
    private readonly _editors;
    private readonly _diffModel;
    private readonly _options;
    private readonly _widget;
    constructor(_editors: DiffEditorEditors, _diffModel: IObservable<DiffEditorViewModel | undefined>, _options: DiffEditorOptions, _widget: DiffEditorWidget);
    private readonly _selectedDiffs;
}
export declare class RevertButton extends Disposable implements IGlyphMarginWidget {
    private readonly _lineNumber;
    private readonly _widget;
    private readonly _diffs;
    private readonly _revertSelection;
    static counter: number;
    private readonly _id;
    getId(): string;
    private readonly _domNode;
    constructor(_lineNumber: number, _widget: DiffEditorWidget, _diffs: RangeMapping[] | LineRangeMapping, _revertSelection: boolean);
    /**
     * Get the dom node of the glyph widget.
     */
    getDomNode(): HTMLElement;
    /**
     * Get the placement of the glyph widget.
     */
    getPosition(): IGlyphMarginWidgetPosition;
}
