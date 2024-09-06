import { IDisposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
export declare function onObservableChange<T>(observable: IObservable<unknown, T>, callback: (value: T) => void): IDisposable;
