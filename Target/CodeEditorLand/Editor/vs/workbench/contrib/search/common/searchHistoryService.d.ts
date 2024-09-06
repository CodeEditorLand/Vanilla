import { Event } from "vs/base/common/event";
import { IStorageService } from "vs/platform/storage/common/storage";
export interface ISearchHistoryService {
    readonly _serviceBrand: undefined;
    onDidClearHistory: Event<void>;
    clearHistory(): void;
    load(): ISearchHistoryValues;
    save(history: ISearchHistoryValues): void;
}
export declare const ISearchHistoryService: any;
export interface ISearchHistoryValues {
    search?: string[];
    replace?: string[];
    include?: string[];
    exclude?: string[];
}
export declare class SearchHistoryService implements ISearchHistoryService {
    private readonly storageService;
    readonly _serviceBrand: undefined;
    static readonly SEARCH_HISTORY_KEY = "workbench.search.history";
    private readonly _onDidClearHistory;
    readonly onDidClearHistory: Event<void>;
    constructor(storageService: IStorageService);
    clearHistory(): void;
    load(): ISearchHistoryValues;
    save(history: ISearchHistoryValues): void;
}
