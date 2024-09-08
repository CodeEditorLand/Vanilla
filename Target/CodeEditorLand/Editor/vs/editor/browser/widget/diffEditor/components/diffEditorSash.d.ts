import { type IBoundarySashes } from "../../../../../base/browser/ui/sash/sash.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { type IObservable, type ISettableObservable } from "../../../../../base/common/observable.js";
import type { DiffEditorOptions } from "../diffEditorOptions.js";
export declare class SashLayout {
    private readonly _options;
    readonly dimensions: {
        height: IObservable<number>;
        width: IObservable<number>;
    };
    readonly sashLeft: ISettableObservable<number, void>;
    private readonly _sashRatio;
    resetSash(): void;
    constructor(_options: DiffEditorOptions, dimensions: {
        height: IObservable<number>;
        width: IObservable<number>;
    });
    /** @pure */
    private _computeSashLeft;
}
export declare class DiffEditorSash extends Disposable {
    private readonly _domNode;
    private readonly _dimensions;
    private readonly _enabled;
    private readonly _boundarySashes;
    readonly sashLeft: ISettableObservable<number>;
    private readonly _resetSash;
    private readonly _sash;
    private _startSashPosition;
    constructor(_domNode: HTMLElement, _dimensions: {
        height: IObservable<number>;
        width: IObservable<number>;
    }, _enabled: IObservable<boolean>, _boundarySashes: IObservable<IBoundarySashes | undefined, void>, sashLeft: ISettableObservable<number>, _resetSash: () => void);
}
