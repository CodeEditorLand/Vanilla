import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { type IObservable } from "../../../../../../base/common/observable.js";
import { IClipboardService } from "../../../../../../platform/clipboard/common/clipboardService.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import type { DetailedLineRangeMapping } from "../../../../../common/diff/rangeMapping.js";
import type { DiffEditorOptions } from "../../diffEditorOptions.js";
import { type DiffEditorViewModel } from "../../diffEditorViewModel.js";
import type { DiffEditorWidget } from "../../diffEditorWidget.js";
import { type IObservableViewZone } from "../../utils.js";
import type { DiffEditorEditors } from "../diffEditorEditors.js";
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
