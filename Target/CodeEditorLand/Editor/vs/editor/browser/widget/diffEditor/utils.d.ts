import { IDimension } from "vs/base/browser/dom";
import { CancellationTokenSource } from "vs/base/common/cancellation";
import { Disposable, DisposableStore, IDisposable, IReference } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { ICodeEditor, IViewZone } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { DetailedLineRangeMapping } from "vs/editor/common/diff/rangeMapping";
import { IModelDeltaDecoration } from "vs/editor/common/model";
export declare function joinCombine<T>(arr1: readonly T[], arr2: readonly T[], keySelector: (val: T) => number, combine: (v1: T, v2: T) => T): readonly T[];
export declare function applyObservableDecorations(editor: ICodeEditor, decorations: IObservable<IModelDeltaDecoration[]>): IDisposable;
export declare function appendRemoveOnDispose(parent: HTMLElement, child: HTMLElement): any;
export declare function prependRemoveOnDispose(parent: HTMLElement, child: HTMLElement): any;
export declare class ObservableElementSizeObserver extends Disposable {
    private readonly elementSizeObserver;
    private readonly _width;
    get width(): IObservable<number>;
    private readonly _height;
    get height(): IObservable<number>;
    private _automaticLayout;
    get automaticLayout(): boolean;
    constructor(element: HTMLElement | null, dimension: IDimension | undefined);
    observe(dimension?: IDimension): void;
    setAutomaticLayout(automaticLayout: boolean): void;
}
export declare function animatedObservable(targetWindow: Window, base: IObservable<number, boolean>, store: DisposableStore): IObservable<number>;
export declare function deepMerge<T extends {}>(source1: T, source2: Partial<T>): T;
export declare abstract class ViewZoneOverlayWidget extends Disposable {
    constructor(editor: ICodeEditor, viewZone: PlaceholderViewZone, htmlElement: HTMLElement);
}
export interface IObservableViewZone extends IViewZone {
    onChange?: IObservable<unknown>;
    setZoneId?(zoneId: string): void;
}
export declare class PlaceholderViewZone implements IObservableViewZone {
    private readonly _afterLineNumber;
    readonly heightInPx: number;
    readonly domNode: any;
    private readonly _actualTop;
    private readonly _actualHeight;
    readonly actualTop: IObservable<number | undefined>;
    readonly actualHeight: IObservable<number | undefined>;
    readonly showInHiddenAreas = true;
    get afterLineNumber(): number;
    readonly onChange?: IObservable<unknown>;
    constructor(_afterLineNumber: IObservable<number>, heightInPx: number);
    onDomNodeTop: (top: number) => void;
    onComputedHeight: (height: number) => void;
}
export declare class ManagedOverlayWidget implements IDisposable {
    private readonly _editor;
    private readonly _domElement;
    private static _counter;
    private readonly _overlayWidgetId;
    private readonly _overlayWidget;
    constructor(_editor: ICodeEditor, _domElement: HTMLElement);
    dispose(): void;
}
export interface CSSStyle {
    height: number | string;
    width: number | string;
    top: number | string;
    visibility: "visible" | "hidden" | "collapse";
    display: "block" | "inline" | "inline-block" | "flex" | "none";
    paddingLeft: number | string;
    paddingRight: number | string;
}
export declare function applyStyle(domNode: HTMLElement, style: Partial<{
    [TKey in keyof CSSStyle]: CSSStyle[TKey] | IObservable<CSSStyle[TKey] | undefined> | undefined;
}>): any;
export declare function applyViewZones(editor: ICodeEditor, viewZones: IObservable<IObservableViewZone[]>, setIsUpdating?: (isUpdatingViewZones: boolean) => void, zoneIds?: Set<string>): IDisposable;
export declare class DisposableCancellationTokenSource extends CancellationTokenSource {
    dispose(): void;
}
export declare function translatePosition(posInOriginal: Position, mappings: DetailedLineRangeMapping[]): Range;
export declare function filterWithPrevious<T>(arr: T[], filter: (cur: T, prev: T | undefined) => boolean): T[];
export interface IRefCounted extends IDisposable {
    createNewRef(): this;
}
export declare abstract class RefCounted<T> implements IDisposable, IReference<T> {
    static create<T extends IDisposable>(value: T, debugOwner?: object | undefined): RefCounted<T>;
    static createWithDisposable<T extends IDisposable>(value: T, disposable: IDisposable, debugOwner?: object | undefined): RefCounted<T>;
    static createOfNonDisposable<T>(value: T, disposable: IDisposable, debugOwner?: object | undefined): RefCounted<T>;
    abstract createNewRef(debugOwner?: object | undefined): RefCounted<T>;
    abstract dispose(): void;
    abstract get object(): T;
}
