export declare function addMatchMediaChangeListener(targetWindow: Window, query: string | MediaQueryList, callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void;
/** A zoom index, e.g. 1, 2, 3 */
export declare function setZoomLevel(zoomLevel: number, targetWindow: Window): void;
export declare function getZoomLevel(targetWindow: Window): number;
export declare const onDidChangeZoomLevel: any;
/** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
export declare function getZoomFactor(targetWindow: Window): number;
export declare function setZoomFactor(zoomFactor: number, targetWindow: Window): void;
export declare function setFullscreen(fullscreen: boolean, targetWindow: Window): void;
export declare function isFullscreen(targetWindow: Window): boolean;
export declare const onDidChangeFullscreen: any;
export declare const isFirefox: boolean;
export declare const isWebKit: boolean;
export declare const isChrome: boolean;
export declare const isSafari: boolean;
export declare const isWebkitWebView: boolean;
export declare const isElectron: boolean;
export declare const isAndroid: boolean;
export declare function isStandalone(): boolean;
export declare function isWCOEnabled(): boolean;
export declare function getWCOBoundingRect(): DOMRect | undefined;
