import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { IObservable } from "../../../../base/common/observable.js";
export declare function onObservableChange<T>(observable: IObservable<unknown, T>, callback: (value: T) => void): IDisposable;
