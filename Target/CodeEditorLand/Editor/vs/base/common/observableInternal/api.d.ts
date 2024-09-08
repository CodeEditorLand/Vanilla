import { type EqualityComparer } from "../equals.js";
import type { ISettableObservable } from "../observable.js";
import { type IDebugNameData } from "./debugName.js";
export declare function observableValueOpts<T, TChange = void>(options: IDebugNameData & {
    equalsFn?: EqualityComparer<T>;
    lazy?: boolean;
}, initialValue: T): ISettableObservable<T, TChange>;
