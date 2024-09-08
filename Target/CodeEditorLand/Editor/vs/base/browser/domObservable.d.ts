import { type IDisposable } from "../common/lifecycle.js";
import { type IObservable } from "../common/observable.js";
export declare function createStyleSheetFromObservable(css: IObservable<string>): IDisposable;
