import { IDisposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
export declare function createStyleSheetFromObservable(css: IObservable<string>): IDisposable;
