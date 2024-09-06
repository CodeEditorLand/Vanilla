import { EqualityComparer } from "vs/base/common/equals";
import { ISettableObservable } from "vs/base/common/observable";
import { IDebugNameData } from "vs/base/common/observableInternal/debugName";
export declare function observableValueOpts<T, TChange = void>(options: IDebugNameData & {
    equalsFn?: EqualityComparer<T>;
    lazy?: boolean;
}, initialValue: T): ISettableObservable<T, TChange>;
