import type { ScrollEvent } from "../../base/common/scrollable.js";
import type { IColorTheme } from "../../platform/theme/common/themeService.js";
import type { ConfigurationChangedEvent, EditorOption } from "./config/editorOptions.js";
import type { Range } from "./core/range.js";
import type { Selection } from "./core/selection.js";
import type { CursorChangeReason } from "./cursorEvents.js";
import type { ScrollType } from "./editorCommon.js";
import type { IModelDecorationsChangedEvent } from "./textModelEvents.js";
export declare enum ViewEventType {
    ViewCompositionStart = 0,
    ViewCompositionEnd = 1,
    ViewConfigurationChanged = 2,
    ViewCursorStateChanged = 3,
    ViewDecorationsChanged = 4,
    ViewFlushed = 5,
    ViewFocusChanged = 6,
    ViewLanguageConfigurationChanged = 7,
    ViewLineMappingChanged = 8,
    ViewLinesChanged = 9,
    ViewLinesDeleted = 10,
    ViewLinesInserted = 11,
    ViewRevealRangeRequest = 12,
    ViewScrollChanged = 13,
    ViewThemeChanged = 14,
    ViewTokensChanged = 15,
    ViewTokensColorsChanged = 16,
    ViewZonesChanged = 17
}
export declare class ViewCompositionStartEvent {
    readonly type = ViewEventType.ViewCompositionStart;
    constructor();
}
export declare class ViewCompositionEndEvent {
    readonly type = ViewEventType.ViewCompositionEnd;
    constructor();
}
export declare class ViewConfigurationChangedEvent {
    readonly type = ViewEventType.ViewConfigurationChanged;
    readonly _source: ConfigurationChangedEvent;
    constructor(source: ConfigurationChangedEvent);
    hasChanged(id: EditorOption): boolean;
}
export declare class ViewCursorStateChangedEvent {
    readonly selections: Selection[];
    readonly modelSelections: Selection[];
    readonly reason: CursorChangeReason;
    readonly type = ViewEventType.ViewCursorStateChanged;
    constructor(selections: Selection[], modelSelections: Selection[], reason: CursorChangeReason);
}
export declare class ViewDecorationsChangedEvent {
    readonly type = ViewEventType.ViewDecorationsChanged;
    readonly affectsMinimap: boolean;
    readonly affectsOverviewRuler: boolean;
    readonly affectsGlyphMargin: boolean;
    readonly affectsLineNumber: boolean;
    constructor(source: IModelDecorationsChangedEvent | null);
}
export declare class ViewFlushedEvent {
    readonly type = ViewEventType.ViewFlushed;
    constructor();
}
export declare class ViewFocusChangedEvent {
    readonly type = ViewEventType.ViewFocusChanged;
    readonly isFocused: boolean;
    constructor(isFocused: boolean);
}
export declare class ViewLanguageConfigurationEvent {
    readonly type = ViewEventType.ViewLanguageConfigurationChanged;
}
export declare class ViewLineMappingChangedEvent {
    readonly type = ViewEventType.ViewLineMappingChanged;
    constructor();
}
export declare class ViewLinesChangedEvent {
    /**
     * The first line that has changed.
     */
    readonly fromLineNumber: number;
    /**
     * The number of lines that have changed.
     */
    readonly count: number;
    readonly type = ViewEventType.ViewLinesChanged;
    constructor(
    /**
     * The first line that has changed.
     */
    fromLineNumber: number, 
    /**
     * The number of lines that have changed.
     */
    count: number);
}
export declare class ViewLinesDeletedEvent {
    readonly type = ViewEventType.ViewLinesDeleted;
    /**
     * At what line the deletion began (inclusive).
     */
    readonly fromLineNumber: number;
    /**
     * At what line the deletion stopped (inclusive).
     */
    readonly toLineNumber: number;
    constructor(fromLineNumber: number, toLineNumber: number);
}
export declare class ViewLinesInsertedEvent {
    readonly type = ViewEventType.ViewLinesInserted;
    /**
     * Before what line did the insertion begin
     */
    readonly fromLineNumber: number;
    /**
     * `toLineNumber` - `fromLineNumber` + 1 denotes the number of lines that were inserted
     */
    readonly toLineNumber: number;
    constructor(fromLineNumber: number, toLineNumber: number);
}
export declare enum VerticalRevealType {
    Simple = 0,
    Center = 1,
    CenterIfOutsideViewport = 2,
    Top = 3,
    Bottom = 4,
    NearTop = 5,
    NearTopIfOutsideViewport = 6
}
export declare class ViewRevealRangeRequestEvent {
    /**
     * Source of the call that caused the event.
     */
    readonly source: string | null | undefined;
    /**
     * Reduce the revealing to a minimum (e.g. avoid scrolling if the bounding box is visible and near the viewport edge).
     */
    readonly minimalReveal: boolean;
    /**
     * Range to be reavealed.
     */
    readonly range: Range | null;
    /**
     * Selections to be revealed.
     */
    readonly selections: Selection[] | null;
    /**
     * The vertical reveal strategy.
     */
    readonly verticalType: VerticalRevealType;
    /**
     * If true: there should be a horizontal & vertical revealing.
     * If false: there should be just a vertical revealing.
     */
    readonly revealHorizontal: boolean;
    /**
     * The scroll type.
     */
    readonly scrollType: ScrollType;
    readonly type = ViewEventType.ViewRevealRangeRequest;
    constructor(
    /**
     * Source of the call that caused the event.
     */
    source: string | null | undefined, 
    /**
     * Reduce the revealing to a minimum (e.g. avoid scrolling if the bounding box is visible and near the viewport edge).
     */
    minimalReveal: boolean, 
    /**
     * Range to be reavealed.
     */
    range: Range | null, 
    /**
     * Selections to be revealed.
     */
    selections: Selection[] | null, 
    /**
     * The vertical reveal strategy.
     */
    verticalType: VerticalRevealType, 
    /**
     * If true: there should be a horizontal & vertical revealing.
     * If false: there should be just a vertical revealing.
     */
    revealHorizontal: boolean, 
    /**
     * The scroll type.
     */
    scrollType: ScrollType);
}
export declare class ViewScrollChangedEvent {
    readonly type = ViewEventType.ViewScrollChanged;
    readonly scrollWidth: number;
    readonly scrollLeft: number;
    readonly scrollHeight: number;
    readonly scrollTop: number;
    readonly scrollWidthChanged: boolean;
    readonly scrollLeftChanged: boolean;
    readonly scrollHeightChanged: boolean;
    readonly scrollTopChanged: boolean;
    constructor(source: ScrollEvent);
}
export declare class ViewThemeChangedEvent {
    readonly theme: IColorTheme;
    readonly type = ViewEventType.ViewThemeChanged;
    constructor(theme: IColorTheme);
}
export declare class ViewTokensChangedEvent {
    readonly type = ViewEventType.ViewTokensChanged;
    readonly ranges: {
        /**
         * Start line number of range
         */
        readonly fromLineNumber: number;
        /**
         * End line number of range
         */
        readonly toLineNumber: number;
    }[];
    constructor(ranges: {
        fromLineNumber: number;
        toLineNumber: number;
    }[]);
}
export declare class ViewTokensColorsChangedEvent {
    readonly type = ViewEventType.ViewTokensColorsChanged;
    constructor();
}
export declare class ViewZonesChangedEvent {
    readonly type = ViewEventType.ViewZonesChanged;
    constructor();
}
export type ViewEvent = ViewCompositionStartEvent | ViewCompositionEndEvent | ViewConfigurationChangedEvent | ViewCursorStateChangedEvent | ViewDecorationsChangedEvent | ViewFlushedEvent | ViewFocusChangedEvent | ViewLanguageConfigurationEvent | ViewLineMappingChangedEvent | ViewLinesChangedEvent | ViewLinesDeletedEvent | ViewLinesInsertedEvent | ViewRevealRangeRequestEvent | ViewScrollChangedEvent | ViewThemeChangedEvent | ViewTokensChangedEvent | ViewTokensColorsChangedEvent | ViewZonesChangedEvent;
