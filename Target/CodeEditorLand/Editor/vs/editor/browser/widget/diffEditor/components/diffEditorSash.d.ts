import { IBoundarySashes } from "vs/base/browser/ui/sash/sash";
import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ISettableObservable } from "vs/base/common/observable";
import { DiffEditorOptions } from "../diffEditorOptions";
export declare class SashLayout {
    private readonly _options;
    readonly dimensions: {
        height: IObservable<number>;
        width: IObservable<number>;
    };
    readonly sashLeft: any;
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
