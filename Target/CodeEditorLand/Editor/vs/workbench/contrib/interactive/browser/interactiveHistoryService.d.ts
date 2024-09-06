import { HistoryNavigator2 } from "vs/base/common/history";
import { Disposable } from "vs/base/common/lifecycle";
import { ResourceMap } from "vs/base/common/map";
import { URI } from "vs/base/common/uri";
export declare const IInteractiveHistoryService: any;
export interface IInteractiveHistoryService {
    readonly _serviceBrand: undefined;
    matchesCurrent(uri: URI, value: string): boolean;
    addToHistory(uri: URI, value: string): void;
    getPreviousValue(uri: URI): string | null;
    getNextValue(uri: URI): string | null;
    replaceLast(uri: URI, value: string): void;
    clearHistory(uri: URI): void;
    has(uri: URI): boolean;
}
export declare class InteractiveHistoryService extends Disposable implements IInteractiveHistoryService {
    readonly _serviceBrand: undefined;
    _history: ResourceMap<HistoryNavigator2<string>>;
    constructor();
    matchesCurrent(uri: URI, value: string): boolean;
    addToHistory(uri: URI, value: string): void;
    getPreviousValue(uri: URI): string | null;
    getNextValue(uri: URI): string | null;
    replaceLast(uri: URI, value: string): void;
    clearHistory(uri: URI): void;
    has(uri: URI): boolean;
}
