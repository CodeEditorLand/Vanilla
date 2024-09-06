import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { DiffEditorEditors } from "vs/editor/browser/widget/diffEditor/components/diffEditorEditors";
import { DiffEditorViewModel } from "vs/editor/browser/widget/diffEditor/diffEditorViewModel";
import { DiffEditorWidget } from "vs/editor/browser/widget/diffEditor/diffEditorWidget";
import { IObservableViewZone } from "vs/editor/browser/widget/diffEditor/utils";
import { DetailedLineRangeMapping } from "vs/editor/common/diff/rangeMapping";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { DiffEditorOptions } from "../../diffEditorOptions";
/**
 * Ensures both editors have the same height by aligning unchanged lines.
 * In inline view mode, inserts viewzones to show deleted code from the original text model in the modified code editor.
 * Synchronizes scrolling.
 *
 * Make sure to add the view zones!
 */
export declare class DiffEditorViewZones extends Disposable {
    private readonly _targetWindow;
    private readonly _editors;
    private readonly _diffModel;
    private readonly _options;
    private readonly _diffEditorWidget;
    private readonly _canIgnoreViewZoneUpdateEvent;
    private readonly _origViewZonesToIgnore;
    private readonly _modViewZonesToIgnore;
    private readonly _clipboardService;
    private readonly _contextMenuService;
    private readonly _originalTopPadding;
    private readonly _originalScrollTop;
    private readonly _originalScrollOffset;
    private readonly _originalScrollOffsetAnimated;
    private readonly _modifiedTopPadding;
    private readonly _modifiedScrollTop;
    private readonly _modifiedScrollOffset;
    private readonly _modifiedScrollOffsetAnimated;
    readonly viewZones: IObservable<{
        orig: IObservableViewZone[];
        mod: IObservableViewZone[];
    }>;
    constructor(_targetWindow: Window, _editors: DiffEditorEditors, _diffModel: IObservable<DiffEditorViewModel | undefined>, _options: DiffEditorOptions, _diffEditorWidget: DiffEditorWidget, _canIgnoreViewZoneUpdateEvent: () => boolean, _origViewZonesToIgnore: Set<string>, _modViewZonesToIgnore: Set<string>, _clipboardService: IClipboardService, _contextMenuService: IContextMenuService);
}
export declare function allowsTrueInlineDiffRendering(mapping: DetailedLineRangeMapping): boolean;