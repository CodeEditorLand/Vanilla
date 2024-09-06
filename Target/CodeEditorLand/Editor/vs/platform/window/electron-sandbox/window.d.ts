export declare enum ApplyZoomTarget {
    ACTIVE_WINDOW = 1,
    ALL_WINDOWS = 2
}
export declare const MAX_ZOOM_LEVEL = 8;
export declare const MIN_ZOOM_LEVEL = -8;
/**
 * Apply a zoom level to the window. Also sets it in our in-memory
 * browser helper so that it can be accessed in non-electron layers.
 */
export declare function applyZoom(zoomLevel: number, target: ApplyZoomTarget | Window): void;
export declare function zoomIn(target: ApplyZoomTarget | Window): void;
export declare function zoomOut(target: ApplyZoomTarget | Window): void;
