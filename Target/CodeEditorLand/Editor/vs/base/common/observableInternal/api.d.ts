import { EqualityComparer } from "../equals.js";
import { ISettableObservable } from "../observable.js";
import { IDebugNameData } from "./debugName.js";
export declare function observableValueOpts<T, TChange = void>(options: IDebugNameData & {
    equalsFn?: EqualityComparer<T>;
    lazy?: boolean;
}, initialValue: T): ISettableObservable<T, TChange>;
